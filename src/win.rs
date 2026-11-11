//! The window: a normal resizable window whose caption is drawn by the page (its header is the title bar:
//! a drag region through WebView2's non-client region support, the window buttons are HTML); the frame,
//! the shadow and the resize borders stay Windows'. WebView2 inside. The page is served from a virtual host mapped to %APPDATA%\Komora\www (the page files and
//! cached icons share one origin), talks to the app through web messages (JSON both ways) and cannot
//! navigate anywhere else: links open in the default browser.

use std::cell::RefCell;

use webview2_com::{
    CreateCoreWebView2ControllerCompletedHandler, CreateCoreWebView2EnvironmentCompletedHandler,
    Microsoft::Web::WebView2::Win32::{
        COREWEBVIEW2_COLOR, COREWEBVIEW2_HOST_RESOURCE_ACCESS_KIND_ALLOW, COREWEBVIEW2_MOVE_FOCUS_REASON_PROGRAMMATIC, CreateCoreWebView2EnvironmentWithOptions, ICoreWebView2, ICoreWebView2_3, ICoreWebView2Controller,
        ICoreWebView2Controller2, ICoreWebView2Settings3, ICoreWebView2Settings5, ICoreWebView2Settings9,
    },
    NavigationStartingEventHandler, NewWindowRequestedEventHandler, WebMessageReceivedEventHandler,
};
use windows::{
    Win32::{
        Foundation::{COLORREF, HWND, LPARAM, LRESULT, RECT, WPARAM},
        Graphics::{
            Dwm::{DWMWA_CAPTION_COLOR, DWMWA_USE_IMMERSIVE_DARK_MODE, DwmSetWindowAttribute},
            Gdi::{CreateSolidBrush, GetMonitorInfoW, MONITOR_DEFAULTTOPRIMARY, MONITORINFO, MonitorFromWindow, ScreenToClient},
        },
        System::LibraryLoader::GetModuleHandleW,
        UI::WindowsAndMessaging::{
            CS_HREDRAW, CS_VREDRAW, CreateWindowExW, DefWindowProcW, DestroyWindow, GetClientRect, GetSystemMetrics, GetWindowPlacement, ICON_BIG, ICON_SMALL, IDC_ARROW, IMAGE_ICON, IsIconic, IsWindowVisible,
            LR_SHARED, LoadCursorW, LoadImageW, MINMAXINFO, RegisterClassExW, SM_CXICON, SM_CXSMICON, SW_HIDE, SW_RESTORE, SW_SHOW, SW_SHOWMAXIMIZED, SendMessageW, SetForegroundWindow, ShowWindow, WINDOWPLACEMENT,
            HTCLIENT, HTTOP, HTTOPLEFT, HTTOPRIGHT, IsZoomed, NCCALCSIZE_PARAMS, SM_CXPADDEDBORDER, SM_CYFRAME, SW_MAXIMIZE, SW_MINIMIZE, SWP_FRAMECHANGED, SWP_NOMOVE,
            SWP_NOSIZE, SWP_NOZORDER, SetWindowPos, WM_CLOSE, WM_GETMINMAXINFO, WM_NCCALCSIZE, WM_NCHITTEST, WM_SETICON, WM_SIZE, WNDCLASSEXW, WS_EX_APPWINDOW, WS_OVERLAPPEDWINDOW,
        },
    },
    core::{BOOL, HSTRING, Interface, PCWSTR, PWSTR, w},
};

use crate::{actions, config, logf, util};

const HOST: &str = "komora.example";
const W: f64 = 1120.0; // DIP
const H: f64 = 740.0;
const MIN_W: f64 = 860.0;
const MIN_H: f64 = 560.0;
const DARK: (u8, u8, u8) = (0x1C, 0x1B, 0x19);
const LIGHT: (u8, u8, u8) = (0xEB, 0xE7, 0xDE);

/// The window's base colour for config `bg` (the page derives the same `--base`: bgBase in app.js).
fn base(dark: bool) -> (u8, u8, u8) {
    let bg = config::get().bg;
    let hex = match bg.as_str() {
        "obsidian" => "#0f0f12",
        "graphite" => "#1c1c1c",
        "slate" => "#1a1e24",
        "moss" => "#1b1e1a",
        "plum" => "#1f1b21",
        x => x,
    };
    let Some((r, g, b)) = util::parse_hex(hex) else { return if dark { DARK } else { LIGHT } };
    let (h, s, l) = util::rgb_hsl(r, g, b);
    let l = if dark {
        if l <= 0.5 { l.clamp(0.05, 0.18) } else { 0.104 }
    } else if l > 0.5 {
        l.clamp(0.80, 0.95)
    } else {
        0.896
    };
    util::hsl_rgb(h, s, l)
}

#[derive(Default)]
struct Win {
    hwnd: HWND,
    ctl: Option<ICoreWebView2Controller>,
    wv: Option<ICoreWebView2>,
    creating: bool,
    class_ok: bool,
    dark: bool,
    /// the WebView2 runtime cannot make the page's header a drag region: the Windows caption stays
    native_caption: bool,
    /// last maximized state sent to the page
    max_sent: Option<bool>,
}

thread_local! {
    static WIN: RefCell<Win> = RefCell::new(Win::default());
}

fn win<R>(f: impl FnOnce(&mut Win) -> R) -> R {
    WIN.with(|x| f(&mut x.borrow_mut()))
}

/// (UI thread) The Komora window (owner of dialogs).
pub fn hwnd() -> HWND {
    win(|w| w.hwnd)
}

/// The page files: read from the source folder in debug builds (edit and reload), embedded in release.
fn page_files() -> [(&'static str, String); 4] {
    macro_rules! file {
        ($n:literal) => {{
            let disk = cfg!(debug_assertions).then(|| std::fs::read_to_string(concat!(env!("CARGO_MANIFEST_DIR"), "/web/", $n)).ok()).flatten();
            ($n, disk.unwrap_or_else(|| include_str!(concat!("../web/", $n)).to_string()))
        }};
    }
    [file!("index.html"), file!("app.css"), file!("i18n.js"), file!("app.js")]
}

fn write_page() {
    let dir = util::www_dir();
    for (name, body) in page_files() {
        if std::fs::read_to_string(dir.join(name)).ok().as_deref() != Some(body.as_str()) && std::fs::write(dir.join(name), body).is_err() {
            logf!("cannot write {name} into {}", dir.display());
        }
    }
    // the Geist fonts (SIL OFL 1.1); other files there are leftovers of 0.1–0.3 (Manrope)
    let fd = dir.join("fonts");
    let _ = std::fs::create_dir_all(&fd);
    if let Ok(rd) = std::fs::read_dir(&fd) {
        for e in rd.flatten() {
            if !FONTS.iter().any(|(n, _)| e.file_name().to_string_lossy() == *n) {
                let _ = std::fs::remove_file(e.path());
            }
        }
    }
    for (name, body) in FONTS {
        if std::fs::read(fd.join(name)).ok().as_deref() != Some(body) && std::fs::write(fd.join(name), body).is_err() {
            logf!("cannot write fonts/{name}");
        }
    }
}

const FONTS: [(&str, &[u8]); 7] = [
    ("geist-latin.woff2", include_bytes!("../web/fonts/geist-latin.woff2")),
    ("geist-latin-ext.woff2", include_bytes!("../web/fonts/geist-latin-ext.woff2")),
    ("geist-cyrillic.woff2", include_bytes!("../web/fonts/geist-cyrillic.woff2")),
    ("geistmono-latin.woff2", include_bytes!("../web/fonts/geistmono-latin.woff2")),
    ("geistmono-latin-ext.woff2", include_bytes!("../web/fonts/geistmono-latin-ext.woff2")),
    ("geistmono-cyrillic.woff2", include_bytes!("../web/fonts/geistmono-cyrillic.woff2")),
    ("OFL.txt", include_bytes!("../web/fonts/OFL.txt")),
];

/// Windows apps theme from the registry (before the page says what it uses).
fn system_dark() -> bool {
    use windows::Win32::System::Registry::{HKEY_CURRENT_USER, RRF_RT_REG_DWORD, RegGetValueW};
    let mut v = 1u32;
    let mut len = 4u32;
    let _ = unsafe { RegGetValueW(HKEY_CURRENT_USER, w!(r"Software\Microsoft\Windows\CurrentVersion\Themes\Personalize"), w!("AppsUseLightTheme"), RRF_RT_REG_DWORD, None, Some(&mut v as *mut u32 as *mut _), Some(&mut len)) };
    v == 0
}

fn initial_dark() -> bool {
    match config::get().theme.as_str() {
        "light" => false,
        "dark" => true,
        _ => system_dark(),
    }
}

fn dpi(hwnd: Option<HWND>) -> f64 {
    let d = unsafe { hwnd.map_or_else(|| windows::Win32::UI::HiDpi::GetDpiForSystem(), |h| windows::Win32::UI::HiDpi::GetDpiForWindow(h)) };
    if d < 96 { 1.0 } else { d as f64 / 96.0 }
}

pub fn open() {
    if win(|w| w.creating) {
        return;
    }
    if win(|w| w.hwnd.is_invalid()) {
        create();
    } else {
        show();
    }
}

fn register_class(bg: (u8, u8, u8)) -> bool {
    if win(|w| w.class_ok) {
        return true;
    }
    unsafe {
        let inst = GetModuleHandleW(None).unwrap_or_default();
        let wc = WNDCLASSEXW {
            cbSize: std::mem::size_of::<WNDCLASSEXW>() as u32,
            style: CS_HREDRAW | CS_VREDRAW,
            lpfnWndProc: Some(wndproc),
            hInstance: inst.into(),
            hCursor: LoadCursorW(None, IDC_ARROW).unwrap_or_default(),
            hbrBackground: CreateSolidBrush(COLORREF(bg.0 as u32 | (bg.1 as u32) << 8 | (bg.2 as u32) << 16)),
            lpszClassName: w!("KomoraView"),
            ..Default::default()
        };
        if RegisterClassExW(&wc) == 0 {
            return false;
        }
    }
    win(|w| w.class_ok = true);
    true
}

/// Saved position when it is still on a monitor, otherwise centred on the primary monitor.
fn start_rect() -> (i32, i32, i32, i32, bool) {
    let p = config::get().win;
    if p.w > 200 && p.h > 200 {
        let (vx, vy, vw, vh) = unsafe {
            use windows::Win32::UI::WindowsAndMessaging::{SM_CXVIRTUALSCREEN, SM_CYVIRTUALSCREEN, SM_XVIRTUALSCREEN, SM_YVIRTUALSCREEN};
            (GetSystemMetrics(SM_XVIRTUALSCREEN), GetSystemMetrics(SM_YVIRTUALSCREEN), GetSystemMetrics(SM_CXVIRTUALSCREEN), GetSystemMetrics(SM_CYVIRTUALSCREEN))
        };
        if p.x + 100 > vx && p.y + 40 > vy && p.x + 100 < vx + vw && p.y + 40 < vy + vh {
            return (p.x, p.y, p.w, p.h, p.max);
        }
    }
    let sc = dpi(None);
    let mut mi = MONITORINFO { cbSize: std::mem::size_of::<MONITORINFO>() as u32, ..Default::default() };
    unsafe {
        let _ = GetMonitorInfoW(MonitorFromWindow(HWND::default(), MONITOR_DEFAULTTOPRIMARY), &mut mi);
    }
    let wk = mi.rcWork;
    let (w, h) = (((W * sc) as i32).min(wk.right - wk.left), ((H * sc) as i32).min(wk.bottom - wk.top));
    (wk.left + (wk.right - wk.left - w) / 2, wk.top + (wk.bottom - wk.top - h) / 2, w, h, false)
}

fn create() {
    let dark = initial_dark();
    let bg = base(dark);
    if !register_class(bg) {
        logf!("RegisterClassEx(view) failed");
        return;
    }
    write_page();
    let (x, y, w, h, max) = start_rect();
    let hwnd = unsafe {
        let inst = GetModuleHandleW(None).unwrap_or_default();
        CreateWindowExW(WS_EX_APPWINDOW, w!("KomoraView"), w!("Komora"), WS_OVERLAPPEDWINDOW, x, y, w, h, None, None, Some(inst.into()), None)
    };
    let Ok(hwnd) = hwnd else {
        logf!("CreateWindowEx(view) failed");
        return;
    };
    win(|f| {
        f.hwnd = hwnd;
        f.creating = true;
        f.dark = dark;
    });
    // the client area takes the caption's place (WM_NCCALCSIZE): make Windows measure the frame again
    unsafe {
        let _ = SetWindowPos(hwnd, None, 0, 0, 0, 0, SWP_FRAMECHANGED | SWP_NOMOVE | SWP_NOSIZE | SWP_NOZORDER);
    }
    unsafe {
        let inst = GetModuleHandleW(None).unwrap_or_default();
        for (which, metric) in [(ICON_BIG, SM_CXICON), (ICON_SMALL, SM_CXSMICON)] {
            let cx = GetSystemMetrics(metric);
            if let Ok(ic) = LoadImageW(Some(inst.into()), PCWSTR(1 as *const u16), IMAGE_ICON, cx, cx, LR_SHARED) {
                SendMessageW(hwnd, WM_SETICON, Some(WPARAM(which as usize)), Some(LPARAM(ic.0 as isize)));
            }
        }
    }
    caption(hwnd, dark);
    unsafe {
        let _ = ShowWindow(hwnd, if max { SW_SHOWMAXIMIZED } else { SW_SHOW });
        let _ = SetForegroundWindow(hwnd);
    }

    let data = HSTRING::from(util::data_dir().join("webview").as_os_str());
    let handler = CreateCoreWebView2EnvironmentCompletedHandler::create(Box::new(move |res, env| {
        let Some(env) = env.filter(|_| res.is_ok()) else {
            fail("environment", res.err());
            return Ok(());
        };
        let h2 = CreateCoreWebView2ControllerCompletedHandler::create(Box::new(move |res, ctl| {
            match ctl.filter(|_| res.is_ok()) {
                Some(ctl) => ready(ctl),
                None => fail("controller", res.err()),
            }
            Ok(())
        }));
        if let Err(e) = unsafe { env.CreateCoreWebView2Controller(hwnd, &h2) } {
            fail("controller", Some(e));
        }
        Ok(())
    }));
    if let Err(e) = unsafe { CreateCoreWebView2EnvironmentWithOptions(PCWSTR::null(), &data, None, &handler) } {
        fail("environment", Some(e));
    }
}

fn fail(what: &str, e: Option<windows::core::Error>) {
    logf!("WebView2 failed ({what}): {e:?} — is the WebView2 Runtime installed?");
    close();
}

fn take_string(p: PWSTR) -> String {
    if p.is_null() {
        return String::new();
    }
    let s = unsafe { p.to_string() }.unwrap_or_default();
    unsafe { windows::Win32::System::Com::CoTaskMemFree(Some(p.0 as *const _)) };
    s
}

fn own_page(uri: &str) -> bool {
    uri.starts_with(&format!("https://{HOST}/"))
}

fn external(uri: &str) {
    if uri.starts_with("https://") || uri.starts_with("http://") {
        util::shell_open(uri, None);
    }
}

fn ready(ctl: ICoreWebView2Controller) {
    let Ok(wv) = (unsafe { ctl.CoreWebView2() }) else {
        fail("webview", None);
        return;
    };
    unsafe {
        if let Ok(st) = wv.Settings() {
            let _ = st.SetAreDefaultContextMenusEnabled(cfg!(debug_assertions));
            let _ = st.SetAreDevToolsEnabled(cfg!(debug_assertions));
            let _ = st.SetIsZoomControlEnabled(false);
            let _ = st.SetIsStatusBarEnabled(false);
            if let Ok(s3) = st.cast::<ICoreWebView2Settings3>() {
                let _ = s3.SetAreBrowserAcceleratorKeysEnabled(false);
            }
            if let Ok(s5) = st.cast::<ICoreWebView2Settings5>() {
                let _ = s5.SetIsPinchZoomEnabled(false);
            }
            match st.cast::<ICoreWebView2Settings9>() {
                Ok(s9) => {
                    let _ = s9.SetIsNonClientRegionSupportEnabled(true);
                }
                Err(_) => {
                    logf!("WebView2 without non-client regions: the Windows caption stays");
                    let h = win(|w| {
                        w.native_caption = true;
                        w.hwnd
                    });
                    let _ = SetWindowPos(h, None, 0, 0, 0, 0, SWP_FRAMECHANGED | SWP_NOMOVE | SWP_NOSIZE | SWP_NOZORDER);
                }
            }
        }
        let bg = base(win(|w| w.dark));
        if let Ok(c2) = ctl.cast::<ICoreWebView2Controller2>() {
            let _ = c2.SetDefaultBackgroundColor(COREWEBVIEW2_COLOR { A: 255, R: bg.0, G: bg.1, B: bg.2 });
        }
        if let Ok(w3) = wv.cast::<ICoreWebView2_3>() {
            let dir = HSTRING::from(util::www_dir().as_os_str());
            let _ = w3.SetVirtualHostNameToFolderMapping(&HSTRING::from(HOST), &dir, COREWEBVIEW2_HOST_RESOURCE_ACCESS_KIND_ALLOW);
        }
        let mut token = Default::default();
        let _ = wv.add_WebMessageReceived(
            &WebMessageReceivedEventHandler::create(Box::new(|_, args| {
                if let Some(a) = args {
                    let mut p = PWSTR::null();
                    // messages of the own page only
                    let mut src = PWSTR::null();
                    let from = if a.Source(&mut src).is_ok() { take_string(src) } else { String::new() };
                    if own_page(&from) && a.WebMessageAsJson(&mut p).is_ok() {
                        let s = take_string(p);
                        if let Ok(v) = serde_json::from_str::<serde_json::Value>(&s) {
                            if v.get("t").and_then(|t| t.as_str()) == Some("reload") && cfg!(debug_assertions) {
                                reload();
                            } else {
                                actions::on_page(&v);
                            }
                        }
                    }
                }
                Ok(())
            })),
            &mut token,
        );
        let _ = wv.add_NavigationStarting(
            &NavigationStartingEventHandler::create(Box::new(|_, args| {
                if let Some(a) = args {
                    let mut p = PWSTR::null();
                    let uri = if a.Uri(&mut p).is_ok() { take_string(p) } else { String::new() };
                    if !own_page(&uri) {
                        let _ = a.SetCancel(true);
                        external(&uri);
                    }
                }
                Ok(())
            })),
            &mut token,
        );
        let _ = wv.add_NewWindowRequested(
            &NewWindowRequestedEventHandler::create(Box::new(|_, args| {
                if let Some(a) = args {
                    let mut p = PWSTR::null();
                    let uri = if a.Uri(&mut p).is_ok() { take_string(p) } else { String::new() };
                    let _ = a.SetHandled(true);
                    external(&uri);
                }
                Ok(())
            })),
            &mut token,
        );
    }
    win(|f| {
        f.ctl = Some(ctl.clone());
        f.wv = Some(wv.clone());
        f.creating = false;
    });
    resize();
    unsafe {
        let _ = ctl.SetIsVisible(true);
        let _ = wv.Navigate(&HSTRING::from(format!("https://{HOST}/index.html")));
        let _ = ctl.MoveFocus(COREWEBVIEW2_MOVE_FOCUS_REASON_PROGRAMMATIC);
    }
}

/// (debug) The page files again from the source folder, and a reload.
fn reload() {
    write_page();
    if let Some(wv) = win(|w| w.wv.clone()) {
        unsafe {
            let _ = wv.Reload();
        }
    }
}

/// Height of the top resize border kept free of the page (the page covers the rest of the client area).
fn top_grip(h: HWND) -> i32 {
    if win(|w| w.native_caption) || unsafe { IsZoomed(h).as_bool() } { 0 } else { (4.0 * dpi(Some(h))).round() as i32 }
}

fn resize() {
    let (ctl, hwnd) = win(|f| (f.ctl.clone(), f.hwnd));
    if let Some(ctl) = ctl {
        let mut rc = RECT::default();
        unsafe {
            let _ = GetClientRect(hwnd, &mut rc);
            rc.top += top_grip(hwnd);
            let _ = ctl.SetBounds(rc);
        }
    }
    window_state();
}

/// Tells the page whether the window is maximized (the restore / maximize button) and who draws the caption.
fn window_state() {
    let (h, native, sent) = win(|w| (w.hwnd, w.native_caption, w.max_sent));
    if h.is_invalid() {
        return;
    }
    let max = unsafe { IsZoomed(h).as_bool() };
    if sent != Some(max) {
        win(|w| w.max_sent = Some(max));
        actions::event_ui(serde_json::json!({ "t": "winState", "max": max, "native": native }));
    }
}

/// (UI thread) The window buttons of the page.
pub fn command(op: &str) {
    let h = win(|w| w.hwnd);
    if h.is_invalid() {
        return;
    }
    unsafe {
        match op {
            "min" => {
                let _ = ShowWindow(h, SW_MINIMIZE);
            }
            "max" => {
                let _ = ShowWindow(h, if IsZoomed(h).as_bool() { SW_RESTORE } else { SW_MAXIMIZE });
            }
            "close" => hide(),
            // a (re)loaded page asks for the state
            "state" => {
                win(|w| w.max_sent = None);
                window_state();
            }
            _ => {}
        }
    }
}

/// Caption colour and dark frame for the theme in use.
fn caption(hwnd: HWND, dark: bool) {
    let bg = base(dark);
    unsafe {
        let d = BOOL::from(dark);
        let _ = DwmSetWindowAttribute(hwnd, DWMWA_USE_IMMERSIVE_DARK_MODE, &d as *const _ as *const _, 4);
        let c = COLORREF(bg.0 as u32 | (bg.1 as u32) << 8 | (bg.2 as u32) << 16);
        let _ = DwmSetWindowAttribute(hwnd, DWMWA_CAPTION_COLOR, &c as *const _ as *const _, 4);
    }
}

/// (UI thread) The background setting changed: the caption and the page's backdrop follow.
pub fn recolor() {
    set_dark(win(|w| w.dark));
}

/// (UI thread) The page resolved its theme (setting or Windows).
pub fn set_dark(dark: bool) {
    let (hwnd, ctl) = win(|w| {
        w.dark = dark;
        (w.hwnd, w.ctl.clone())
    });
    if hwnd.is_invalid() {
        return;
    }
    caption(hwnd, dark);
    let bg = base(dark);
    if let Some(c2) = ctl.and_then(|c| c.cast::<ICoreWebView2Controller2>().ok()) {
        unsafe {
            let _ = c2.SetDefaultBackgroundColor(COREWEBVIEW2_COLOR { A: 255, R: bg.0, G: bg.1, B: bg.2 });
        }
    }
}

fn show() {
    let (hwnd, ctl) = win(|f| (f.hwnd, f.ctl.clone()));
    unsafe {
        if IsIconic(hwnd).as_bool() {
            let _ = ShowWindow(hwnd, SW_RESTORE);
        } else if !IsWindowVisible(hwnd).as_bool() {
            let max = config::get().win.max;
            let _ = ShowWindow(hwnd, if max { SW_SHOWMAXIMIZED } else { SW_SHOW });
        }
        let _ = SetForegroundWindow(hwnd);
        if let Some(ctl) = ctl {
            let _ = ctl.SetIsVisible(true);
            let _ = ctl.MoveFocus(COREWEBVIEW2_MOVE_FOCUS_REASON_PROGRAMMATIC);
        }
    }
    push_state();
}

fn save_pos(hwnd: HWND) {
    let mut wp = WINDOWPLACEMENT { length: std::mem::size_of::<WINDOWPLACEMENT>() as u32, ..Default::default() };
    if unsafe { GetWindowPlacement(hwnd, &mut wp) }.is_ok() {
        let r = wp.rcNormalPosition;
        let max = wp.showCmd == SW_SHOWMAXIMIZED.0 as u32;
        config::update(|c| c.win = config::WinPos { x: r.left, y: r.top, w: r.right - r.left, h: r.bottom - r.top, max });
    }
}

/// Hides the window; the app keeps working in the tray.
pub fn hide() {
    let (hwnd, ctl) = win(|f| (f.hwnd, f.ctl.clone()));
    if hwnd.is_invalid() {
        return;
    }
    save_pos(hwnd);
    unsafe {
        let _ = ShowWindow(hwnd, SW_HIDE);
        if let Some(ctl) = ctl {
            let _ = ctl.SetIsVisible(false);
        }
    }
}

pub fn close() {
    let hwnd = win(|f| f.hwnd);
    if !hwnd.is_invalid() && unsafe { IsWindowVisible(hwnd) }.as_bool() {
        save_pos(hwnd);
    }
    let (ctl, hwnd) = win(|f| {
        f.wv = None;
        f.creating = false;
        (f.ctl.take(), std::mem::take(&mut f.hwnd))
    });
    if let Some(ctl) = ctl {
        unsafe {
            let _ = ctl.Close();
        }
    }
    if !hwnd.is_invalid() {
        unsafe {
            let _ = DestroyWindow(hwnd);
        }
    }
}

fn visible_view() -> Option<ICoreWebView2> {
    win(|f| f.wv.clone().filter(|_| unsafe { IsWindowVisible(f.hwnd) }.as_bool()))
}

/// Sends the current state to the page (if it is shown).
pub fn push_state() {
    let Some(wv) = visible_view() else { return };
    unsafe {
        let _ = wv.PostWebMessageAsJson(&HSTRING::from(actions::state_json()));
    }
}

/// Sends the queued events; dropped while the window is hidden (the state carries what matters).
pub fn push_events() {
    let ev = actions::take_events();
    let Some(wv) = visible_view() else { return };
    for e in ev {
        unsafe {
            let _ = wv.PostWebMessageAsJson(&HSTRING::from(e));
        }
    }
}

unsafe extern "system" fn wndproc(h: HWND, m: u32, wp: WPARAM, lp: LPARAM) -> LRESULT {
    match m {
        // no Windows caption: the client area starts at the top of the window (a maximized window
        // hangs over the screen by its frame, which is kept off the client area)
        WM_NCCALCSIZE if wp.0 != 0 && !win(|w| w.native_caption) => {
            let p = lp.0 as *mut NCCALCSIZE_PARAMS;
            let top = unsafe { (*p).rgrc[0].top };
            let r = unsafe { DefWindowProcW(h, m, wp, lp) };
            unsafe {
                (*p).rgrc[0].top = top;
                if IsZoomed(h).as_bool() {
                    (*p).rgrc[0].top += GetSystemMetrics(SM_CYFRAME) + GetSystemMetrics(SM_CXPADDEDBORDER);
                }
            }
            return r;
        }
        // the strip above the page resizes the window from the top
        WM_NCHITTEST if !win(|w| w.native_caption) => {
            let r = unsafe { DefWindowProcW(h, m, wp, lp) };
            if r.0 as u32 == HTCLIENT {
                let mut pt = windows::Win32::Foundation::POINT { x: (lp.0 & 0xffff) as i16 as i32, y: ((lp.0 >> 16) & 0xffff) as i16 as i32 };
                let mut rc = RECT::default();
                unsafe {
                    let _ = ScreenToClient(h, &mut pt);
                    let _ = GetClientRect(h, &mut rc);
                }
                let grip = top_grip(h);
                if pt.y < grip {
                    let corner = grip * 3;
                    return LRESULT(if pt.x < corner { HTTOPLEFT } else if pt.x > rc.right - corner { HTTOPRIGHT } else { HTTOP } as isize);
                }
            }
            return r;
        }
        WM_SIZE => {
            resize();
            return LRESULT(0);
        }
        WM_GETMINMAXINFO => {
            let sc = dpi(Some(h));
            let mi = lp.0 as *mut MINMAXINFO;
            if !mi.is_null() {
                unsafe {
                    (*mi).ptMinTrackSize.x = (MIN_W * sc) as i32;
                    (*mi).ptMinTrackSize.y = (MIN_H * sc) as i32;
                }
            }
            return LRESULT(0);
        }
        WM_CLOSE => {
            hide();
            return LRESULT(0);
        }
        _ => {}
    }
    unsafe { DefWindowProcW(h, m, wp, lp) }
}
