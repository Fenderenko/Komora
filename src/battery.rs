//! `Komora.exe --battery`: the charge of devices in the tray as a small process of its own — no window, no
//! WebView2 — so the icons stay when Komora is closed. Komora starts and stops it with its switch, starts it with
//! Windows when the switch is on, tells it when the settings change (WM_RELOAD) and reads the devices it found
//! from devices.json in the data folder. A helper of another build is replaced when Komora starts.

use std::os::windows::process::CommandExt;

use windows::{
    Win32::{
        Foundation::{ERROR_ALREADY_EXISTS, GetLastError, HWND, LPARAM, LRESULT, WPARAM},
        System::{LibraryLoader::GetModuleHandleW, Threading::CreateMutexW},
        UI::WindowsAndMessaging::{
            AppendMenuW, CreatePopupMenu, DestroyMenu, GetCursorPos, MF_SEPARATOR, MF_STRING, SetForegroundWindow, TPM_BOTTOMALIGN, TPM_RETURNCMD, TPM_RIGHTBUTTON, TrackPopupMenu, WM_NULL,
            CreateWindowExW, DefWindowProcW, DestroyWindow, DispatchMessageW, FindWindowW, GetMessageW, GetWindowTextW, MSG, PostMessageW, PostQuitMessage, RegisterClassExW, RegisterWindowMessageW, TranslateMessage, WINDOW_EX_STYLE,
            WINDOW_STYLE, WM_APP, WM_CLOSE, WM_CONTEXTMENU, WM_DESTROY, WM_DEVICECHANGE, WM_ENDSESSION, WM_LBUTTONUP, WM_RBUTTONUP, WM_SETTINGCHANGE, WNDCLASSEXW,
        },
    },
    core::{HSTRING, PCWSTR, w},
};

use crate::{autostart, btbatt, config, util};

pub const ARG: &str = "--battery";
const CLASS: PCWSTR = w!("KomoraBattWnd");
/// Komora → helper: the settings changed, read config.json again.
const WM_RELOAD: u32 = WM_APP + 20;
/// The Run value of the helper's own start with Windows.
const RUN_NAME: &str = "Komora battery";

static TASKBAR_CREATED: std::sync::atomic::AtomicU32 = std::sync::atomic::AtomicU32::new(0);

/// This build of Komora.exe: version, size and time of the file (a rebuild of the same version differs too).
fn build() -> String {
    let exe = std::env::current_exe().unwrap_or_default();
    let m = std::fs::metadata(&exe).ok();
    let t = m.as_ref().and_then(|m| m.modified().ok()).and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok()).map_or(0, |d| d.as_secs());
    format!("Komora battery {} {} {t}", env!("CARGO_PKG_VERSION"), m.map_or(0, |m| m.len()))
}

fn find() -> Option<HWND> {
    unsafe { FindWindowW(CLASS, None) }.ok().filter(|h| !h.is_invalid())
}

fn title(h: HWND) -> String {
    let mut buf = [0u16; 256];
    let n = unsafe { GetWindowTextW(h, &mut buf) }.max(0) as usize;
    String::from_utf16_lossy(&buf[..n.min(buf.len())])
}

fn spawn(args: &[&str]) {
    if let Ok(exe) = std::env::current_exe() {
        // DETACHED_PROCESS: the helper outlives Komora
        let _ = std::process::Command::new(exe).args(args).creation_flags(0x0000_0008).spawn();
    }
}

// ---------------------------------------------------------------- Komora's side

/// (Komora) The helper follows the switch: running and started with Windows while it is on, gone otherwise.
pub fn sync() {
    let on = config::get().bt_tray;
    autostart::set_named(RUN_NAME, ARG, on);
    if !on {
        if let Some(h) = find() {
            unsafe {
                let _ = PostMessageW(Some(h), WM_CLOSE, WPARAM(0), LPARAM(0));
            }
        }
        return;
    }
    if let Some(h) = find() {
        if title(h) == build() {
            return;
        }
        // another build: it makes way for this one
        unsafe {
            let _ = PostMessageW(Some(h), WM_CLOSE, WPARAM(0), LPARAM(0));
        }
        for _ in 0..30 {
            if find().is_none() {
                break;
            }
            std::thread::sleep(std::time::Duration::from_millis(100));
        }
    }
    spawn(&[ARG]);
}

/// (Komora) The settings of the charge changed: the helper reads them again.
pub fn reload() {
    if let Some(h) = find() {
        unsafe {
            let _ = PostMessageW(Some(h), WM_RELOAD, WPARAM(0), LPARAM(0));
        }
    }
}

// ---------------------------------------------------------------- the helper itself

unsafe extern "system" fn wndproc(h: HWND, m: u32, wp: WPARAM, lp: LPARAM) -> LRESULT {
    match m {
        WM_RELOAD => {
            config::reload();
            if !config::get().bt_tray {
                unsafe {
                    let _ = DestroyWindow(h);
                }
            } else {
                btbatt::wake();
            }
        }
        // a click on a device's icon opens Komora (its settings live there); the right one — the device's menu
        crate::WM_TRAY => match (lp.0 & 0xffff) as u32 {
            WM_LBUTTONUP => spawn(&[]),
            WM_RBUTTONUP | WM_CONTEXTMENU => menu(h, wp.0 as u32),
            _ => {}
        },
        WM_DEVICECHANGE | WM_SETTINGCHANGE => btbatt::wake(),
        WM_ENDSESSION if wp.0 != 0 => {
            btbatt::stop_helper();
            std::process::exit(0);
        }
        WM_CLOSE => unsafe {
            let _ = DestroyWindow(h);
        },
        WM_DESTROY => unsafe { PostQuitMessage(0) },
        _ if m != 0 && m == TASKBAR_CREATED.load(std::sync::atomic::Ordering::Relaxed) => btbatt::readd(),
        _ => {}
    }
    unsafe { DefWindowProcW(h, m, wp, lp) }
}

const ID_OPEN: usize = 1;
const ID_CLOSE: usize = 2;

/// A device icon's menu: open Komora, or close this icon (the device goes out of the tray until its switch in
/// Komora's settings is turned on again).
fn menu(h: HWND, uid: u32) {
    let Some((id, name)) = btbatt::device_of(uid) else { return };
    unsafe {
        let Ok(m) = CreatePopupMenu() else { return };
        let item = |flags, cmd: usize, text: &str| {
            let t = util::wide(text);
            let _ = AppendMenuW(m, flags, cmd, PCWSTR(t.as_ptr()));
        };
        item(MF_STRING, ID_OPEN, config::tr("Відкрити Komora", "Open Komora"));
        item(MF_SEPARATOR, 0, "");
        item(MF_STRING, ID_CLOSE, &format!("{} — {}", config::tr("Закрити", "Close"), name));
        let mut pt = Default::default();
        let _ = GetCursorPos(&mut pt);
        let _ = SetForegroundWindow(h);
        let cmd = TrackPopupMenu(m, TPM_RETURNCMD | TPM_RIGHTBUTTON | TPM_BOTTOMALIGN, pt.x, pt.y, None, h, None).0 as usize;
        let _ = PostMessageW(Some(h), WM_NULL, WPARAM(0), LPARAM(0));
        let _ = DestroyMenu(m);
        match cmd {
            ID_OPEN => spawn(&[]),
            ID_CLOSE => {
                // Komora may have changed the file since: from it, not from this copy
                config::reload();
                config::update(|c| {
                    if !c.bt_off.contains(&id) {
                        c.bt_off.push(id.clone());
                    }
                });
                btbatt::wake();
                if let Ok(k) = FindWindowW(w!("KomoraWnd"), None) {
                    let _ = PostMessageW(Some(k), crate::WM_CFG_RELOAD, WPARAM(0), LPARAM(0));
                }
            }
            _ => {}
        }
    }
}

/// The helper's main: one copy, a hidden window for the icons' messages, the reading thread.
pub fn run() {
    let _mutex = unsafe { CreateMutexW(None, false, w!(r"Local\KomoraBattery")) };
    if unsafe { GetLastError() } == ERROR_ALREADY_EXISTS {
        return;
    }
    if !config::get().bt_tray {
        return;
    }
    let hwnd = unsafe {
        let inst = GetModuleHandleW(None).unwrap_or_default();
        let wc = WNDCLASSEXW { cbSize: std::mem::size_of::<WNDCLASSEXW>() as u32, lpfnWndProc: Some(wndproc), hInstance: inst.into(), lpszClassName: CLASS, ..Default::default() };
        RegisterClassExW(&wc);
        CreateWindowExW(WINDOW_EX_STYLE(0), CLASS, &HSTRING::from(build()), WINDOW_STYLE(0), 0, 0, 0, 0, None, None, Some(inst.into()), None)
    };
    let Ok(hwnd) = hwnd else { return };
    util::set_main_hwnd(hwnd);
    TASKBAR_CREATED.store(unsafe { RegisterWindowMessageW(w!("TaskbarCreated")) }, std::sync::atomic::Ordering::Relaxed);
    btbatt::start_helper();
    let mut m = MSG::default();
    while unsafe { GetMessageW(&mut m, None, 0, 0) }.0 > 0 {
        unsafe {
            let _ = TranslateMessage(&m);
            DispatchMessageW(&m);
        }
    }
    btbatt::stop_helper();
}
