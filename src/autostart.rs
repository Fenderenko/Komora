//! Start with Windows: HKCU\…\Run\Komora = "<exe>" --tray.

use windows::{
    Win32::System::Registry::{HKEY, HKEY_CURRENT_USER, KEY_READ, KEY_WRITE, REG_SZ, RegCloseKey, RegDeleteValueW, RegOpenKeyExW, RegQueryValueExW, RegSetValueExW},
    core::w,
};

use crate::util;

const RUN: windows::core::PCWSTR = w!(r"Software\Microsoft\Windows\CurrentVersion\Run");

fn command() -> String {
    let exe = std::env::current_exe().map(|p| p.display().to_string()).unwrap_or_default();
    format!("\"{exe}\" --tray")
}

fn open(access: windows::Win32::System::Registry::REG_SAM_FLAGS) -> Option<HKEY> {
    let mut k = HKEY::default();
    unsafe { RegOpenKeyExW(HKEY_CURRENT_USER, RUN, None, access, &mut k) }.is_ok().then_some(k)
}

fn value() -> Option<String> {
    let k = open(KEY_READ)?;
    let mut buf = [0u16; 1024];
    let mut len = (buf.len() * 2) as u32;
    let r = unsafe { RegQueryValueExW(k, w!("Komora"), None, None, Some(buf.as_mut_ptr() as *mut u8), Some(&mut len)) };
    unsafe {
        let _ = RegCloseKey(k);
    }
    if r.is_err() {
        return None;
    }
    let n = (len as usize / 2).min(buf.len());
    Some(String::from_utf16_lossy(&buf[..n]).trim_end_matches('\0').to_string())
}

pub fn enabled() -> bool {
    value().is_some()
}

pub fn set(on: bool) {
    let Some(k) = open(KEY_WRITE) else { return };
    unsafe {
        if on {
            let s = util::wide(&command());
            let bytes = std::slice::from_raw_parts(s.as_ptr() as *const u8, s.len() * 2);
            let _ = RegSetValueExW(k, w!("Komora"), None, REG_SZ, Some(bytes));
        } else {
            let _ = RegDeleteValueW(k, w!("Komora"));
        }
        let _ = RegCloseKey(k);
    }
}

/// The exe was moved: the autostart entry follows it.
pub fn sync_path() {
    if value().is_some_and(|v| v != command()) {
        set(true);
    }
}
