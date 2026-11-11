//! The tray icon: tooltip with the number of updates, a menu and notifications about new updates.

use windows::{
    Win32::{
        Foundation::{HWND, POINT},
        System::LibraryLoader::GetModuleHandleW,
        UI::{
            Shell::{NIF_ICON, NIF_INFO, NIF_MESSAGE, NIF_TIP, NIIF_INFO, NIM_ADD, NIM_DELETE, NIM_MODIFY, NOTIFY_ICON_DATA_FLAGS, NOTIFYICONDATAW, Shell_NotifyIconW},
            WindowsAndMessaging::{AppendMenuW, CreatePopupMenu, DestroyMenu, GetCursorPos, GetSystemMetrics, HICON, HMENU, IMAGE_ICON, LR_SHARED, LoadImageW, MF_SEPARATOR, MF_STRING, PostMessageW, SM_CXSMICON, SetForegroundWindow, TPM_BOTTOMALIGN, TPM_RETURNCMD, TPM_RIGHTBUTTON, TrackPopupMenu, WM_NULL},
        },
    },
    core::PCWSTR,
};

use crate::{actions, config::tr, util, win};

const ID_OPEN: u32 = 1;
const ID_CHECK: u32 = 2;
const ID_EXIT: u32 = 3;

fn nid(flags: NOTIFY_ICON_DATA_FLAGS) -> NOTIFYICONDATAW {
    NOTIFYICONDATAW { cbSize: std::mem::size_of::<NOTIFYICONDATAW>() as u32, hWnd: util::main_hwnd(), uID: 1, uFlags: flags, ..Default::default() }
}

fn icon() -> HICON {
    unsafe {
        let inst = GetModuleHandleW(None).unwrap_or_default();
        let cx = GetSystemMetrics(SM_CXSMICON);
        LoadImageW(Some(inst.into()), PCWSTR(1 as *const u16), IMAGE_ICON, cx, cx, LR_SHARED).map(|h| HICON(h.0)).unwrap_or_default()
    }
}

fn tip() -> String {
    match actions::update_count() {
        0 => "Komora".to_string(),
        n => format!("Komora — {} {n}", tr("оновлень:", "updates:")),
    }
}

/// Adds the icon; false while the taskbar is not ready (retried by the caller).
pub fn add() -> bool {
    let mut n = nid(NIF_MESSAGE | NIF_ICON | NIF_TIP);
    n.uCallbackMessage = crate::WM_TRAY;
    n.hIcon = icon();
    util::copy_wide(&mut n.szTip, &tip());
    unsafe { Shell_NotifyIconW(NIM_ADD, &n).as_bool() || Shell_NotifyIconW(NIM_MODIFY, &n).as_bool() }
}

pub fn update() {
    let mut n = nid(NIF_TIP);
    util::copy_wide(&mut n.szTip, &tip());
    unsafe {
        let _ = Shell_NotifyIconW(NIM_MODIFY, &n);
    }
}

pub fn remove() {
    let n = nid(NOTIFY_ICON_DATA_FLAGS(0));
    unsafe {
        let _ = Shell_NotifyIconW(NIM_DELETE, &n);
    }
}

/// A notification next to the tray (new updates, cheaper products, tweaks Windows put back).
pub fn balloon(title: &str, text: &str) {
    let mut n = nid(NIF_INFO);
    util::copy_wide(&mut n.szInfoTitle, title);
    util::copy_wide(&mut n.szInfo, text);
    n.dwInfoFlags = NIIF_INFO;
    unsafe {
        let _ = Shell_NotifyIconW(NIM_MODIFY, &n);
    }
}

fn append(m: HMENU, flags: windows::Win32::UI::WindowsAndMessaging::MENU_ITEM_FLAGS, id: usize, text: &str) {
    let t = util::wide(text);
    unsafe {
        let _ = AppendMenuW(m, flags, id, PCWSTR(t.as_ptr()));
    }
}

pub fn menu(hwnd: HWND) {
    unsafe {
        let Ok(m) = CreatePopupMenu() else { return };
        append(m, MF_STRING, ID_OPEN as usize, tr("Відкрити Komora", "Open Komora"));
        append(m, MF_STRING, ID_CHECK as usize, tr("Перевірити оновлення", "Check for updates"));
        append(m, MF_SEPARATOR, 0, "");
        append(m, MF_STRING, ID_EXIT as usize, tr("Вихід", "Exit"));
        let mut pt = POINT::default();
        let _ = GetCursorPos(&mut pt);
        let _ = SetForegroundWindow(hwnd);
        let cmd = TrackPopupMenu(m, TPM_RETURNCMD | TPM_RIGHTBUTTON | TPM_BOTTOMALIGN, pt.x, pt.y, None, hwnd, None).0 as u32;
        let _ = PostMessageW(Some(hwnd), WM_NULL, Default::default(), Default::default());
        let _ = DestroyMenu(m);
        match cmd {
            ID_OPEN => win::open(),
            ID_CHECK => {
                let _ = std::thread::Builder::new().name("komora-check".into()).spawn(|| actions::check_all(true));
                win::open();
            }
            ID_EXIT => crate::quit(),
            _ => {}
        }
    }
}
