//! Komora — a personal software library for Windows: apps and links with groups, tags and notes,
//! installs and updates from GitHub releases, a tray icon that checks for updates on a timer.

#![windows_subsystem = "windows"]

mod actions;
mod autostart;
mod backup;
mod battery;
mod btbatt;
mod compx;
mod bundle;
mod config;
mod dlg;
mod dropbox;
mod forge;
mod glyph;
mod headsets;
mod hist;
mod gh;
mod icon;
mod imports;
mod install;
mod library;
mod mice;
mod logi;
mod link;
mod net;
mod page;
mod secret;
mod selfup;
mod sony;
mod stars;
mod steamicons;
mod tools;
mod sysinfo;
mod tray;
mod trust;
mod tweaks;
mod winget;
mod util;
mod ver;
mod vt;
mod win;
mod xinput;

use windows::{
    Win32::{
        Foundation::{ERROR_ALREADY_EXISTS, GetLastError, HWND, LPARAM, LRESULT, WPARAM},
        System::{
            Com::{COINIT_APARTMENTTHREADED, CoInitializeEx},
            LibraryLoader::GetModuleHandleW,
            Threading::CreateMutexW,
        },
        UI::{
            HiDpi::{DPI_AWARENESS_CONTEXT_PER_MONITOR_AWARE_V2, SetProcessDpiAwarenessContext},
            WindowsAndMessaging::{
                AllowSetForegroundWindow, CreateWindowExW, DefWindowProcW, DispatchMessageW, FindWindowW, GetMessageW, GetWindowThreadProcessId, KillTimer, MSG, PostMessageW, PostQuitMessage, RegisterClassExW,
                RegisterWindowMessageW, SetTimer, TranslateMessage, WINDOW_EX_STYLE, WINDOW_STYLE, WM_APP, WM_CONTEXTMENU, WM_ENDSESSION, WM_LBUTTONUP, WM_RBUTTONUP, WM_TIMER, WNDCLASSEXW,
            },
        },
    },
    core::w,
};

/// The library or the busy state changed (any thread): the page and the tray get the new state.
pub const WM_STATE: u32 = WM_APP + 1;
pub const WM_TRAY: u32 = WM_APP + 2;
/// Another start of the exe asks to show the window.
pub const WM_SHOW: u32 = WM_APP + 3;
/// Events for the page are queued (actions::take_events).
pub const WM_EVENT: u32 = WM_APP + 4;
/// New updates were found: a tray notification (actions::BALLOON).
pub const WM_BALLOON: u32 = WM_APP + 5;
/// A self-update started the new exe: this process ends.
pub const WM_RESTART: u32 = WM_APP + 6;
/// The charge helper changed config.json (a device's icon closed from the tray): read it again.
pub const WM_CFG_RELOAD: u32 = WM_APP + 7;

const TIMER_TRAY: usize = 1;
const TIMER_CHECK: usize = 2;
/// The window has stayed hidden a minute: its WebView2 is let go (win::hide).
pub const TIMER_FREE: usize = 3;

static TASKBAR_CREATED: std::sync::atomic::AtomicU32 = std::sync::atomic::AtomicU32::new(0);

fn main() {
    let after_update = selfup::after_update();
    let tray_only = std::env::args().any(|a| a == "--tray") && !after_update;
    // a device's charge icon was clicked: the window opens on the devices' switches
    let devices = std::env::args().any(|a| a == "--devices");
    unsafe {
        let _ = SetProcessDpiAwarenessContext(DPI_AWARENESS_CONTEXT_PER_MONITOR_AWARE_V2);
    }
    // the charge of devices in the tray, as a process of its own (battery.rs)
    if std::env::args().any(|a| a == battery::ARG) {
        battery::run();
        return;
    }
    let _mutex = unsafe { CreateMutexW(None, false, w!(r"Local\KomoraSingleton")) };
    if unsafe { GetLastError() } == ERROR_ALREADY_EXISTS {
        unsafe {
            if let Ok(h) = FindWindowW(w!("KomoraWnd"), None) {
                let mut pid = 0u32;
                GetWindowThreadProcessId(h, Some(&mut pid));
                let _ = AllowSetForegroundWindow(pid);
                let _ = PostMessageW(Some(h), WM_SHOW, WPARAM(devices as usize), LPARAM(0));
            }
        }
        return;
    }
    util::init_log();
    selfup::clean_old();
    logf!("=== Komora {} ({}) ===", env!("CARGO_PKG_VERSION"), gh::arch());
    unsafe {
        let _ = CoInitializeEx(None, COINIT_APARTMENTTHREADED); // STA for WebView2
    }

    let hwnd = unsafe {
        let inst = GetModuleHandleW(None).unwrap_or_default();
        let wc = WNDCLASSEXW { cbSize: std::mem::size_of::<WNDCLASSEXW>() as u32, lpfnWndProc: Some(wndproc), hInstance: inst.into(), lpszClassName: w!("KomoraWnd"), ..Default::default() };
        RegisterClassExW(&wc);
        CreateWindowExW(WINDOW_EX_STYLE(0), w!("KomoraWnd"), w!("Komora"), WINDOW_STYLE(0), 0, 0, 0, 0, None, None, Some(inst.into()), None)
    };
    let Ok(hwnd) = hwnd else {
        logf!("CreateWindowEx failed");
        return;
    };
    util::set_main_hwnd(hwnd);
    TASKBAR_CREATED.store(unsafe { RegisterWindowMessageW(w!("TaskbarCreated")) }, std::sync::atomic::Ordering::Relaxed);

    autostart::sync_path();
    actions::migrate_kit();
    if !tray::add() {
        unsafe {
            SetTimer(Some(hwnd), TIMER_TRAY, 2000, None);
        }
    }
    unsafe {
        SetTimer(Some(hwnd), TIMER_CHECK, 60_000, None);
    }
    actions::startup();
    std::thread::spawn(battery::sync);
    if !tray_only {
        win::open();
        if devices {
            actions::go_to("devices");
        }
    }

    let mut m = MSG::default();
    while unsafe { GetMessageW(&mut m, None, 0, 0) }.0 > 0 {
        unsafe {
            let _ = TranslateMessage(&m);
            DispatchMessageW(&m);
        }
    }
    shutdown();
}

fn shutdown() {
    tray::remove();
    win::close();
    logf!("exit");
}

pub fn quit() {
    unsafe { PostQuitMessage(0) };
}

unsafe extern "system" fn wndproc(h: HWND, m: u32, wp: WPARAM, lp: LPARAM) -> LRESULT {
    match m {
        WM_STATE => {
            win::push_state();
            tray::update();
        }
        WM_EVENT => win::push_events(),
        WM_CFG_RELOAD => {
            config::reload();
            win::push_state();
        }
        WM_BALLOON => {
            let (title, text) = std::mem::take(&mut *actions::BALLOON.lock().unwrap());
            if !text.is_empty() {
                tray::balloon(&title, &text);
            }
        }
        WM_TRAY => match (lp.0 & 0xffff) as u32 {
            WM_LBUTTONUP => win::open(),
            WM_RBUTTONUP | WM_CONTEXTMENU => tray::menu(h),
            // NIN_BALLOONUSERCLICK: the notification was clicked
            0x405 => win::open(),
            _ => {}
        },
        WM_SHOW => {
            win::open();
            if wp.0 == 1 {
                actions::go_to("devices");
            }
        }
        WM_RESTART => quit(),
        WM_TIMER if wp.0 == TIMER_TRAY => {
            if tray::add() {
                unsafe {
                    let _ = KillTimer(Some(h), TIMER_TRAY);
                }
            }
        }
        WM_TIMER if wp.0 == TIMER_CHECK => actions::tick(),
        WM_TIMER if wp.0 == TIMER_FREE => {
            unsafe {
                let _ = KillTimer(Some(h), TIMER_FREE);
            }
            if !win::shown() {
                win::close();
            }
        }
        WM_ENDSESSION if wp.0 != 0 => {
            shutdown();
            std::process::exit(0);
        }
        _ if m != 0 && m == TASKBAR_CREATED.load(std::sync::atomic::Ordering::Relaxed) => {
            tray::add(); // Explorer restarted
        }
        _ => {}
    }
    unsafe { DefWindowProcW(h, m, wp, lp) }
}
