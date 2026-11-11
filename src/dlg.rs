//! Windows file and folder dialogs (UI thread, modal to the Komora window).

use windows::{
    Win32::{
        System::Com::{CLSCTX_INPROC_SERVER, CoCreateInstance},
        UI::{
            Controls::Dialogs::{GetOpenFileNameW, GetSaveFileNameW, OFN_FILEMUSTEXIST, OFN_NOCHANGEDIR, OFN_OVERWRITEPROMPT, OFN_PATHMUSTEXIST, OPENFILENAMEW},
            Shell::{FOS_FORCEFILESYSTEM, FOS_PICKFOLDERS, FileOpenDialog, IFileOpenDialog, SIGDN_FILESYSPATH},
        },
    },
    core::PCWSTR,
};

/// "Komora (*.komora)|*.komora|…" → the double-null filter string.
fn filter(f: &str) -> Vec<u16> {
    let mut v: Vec<u16> = f.replace('|', "\0").encode_utf16().collect();
    v.extend([0, 0]);
    v
}

fn file_dialog(save: bool, title: &str, filt: &str, def_ext: &str, name: &str) -> Option<String> {
    let mut buf = vec![0u16; 1024];
    for (i, c) in name.encode_utf16().take(1000).enumerate() {
        buf[i] = c;
    }
    let f = filter(filt);
    let t = crate::util::wide(title);
    let e = crate::util::wide(def_ext);
    let mut ofn = OPENFILENAMEW {
        lStructSize: std::mem::size_of::<OPENFILENAMEW>() as u32,
        hwndOwner: crate::win::hwnd(),
        lpstrFilter: PCWSTR(f.as_ptr()),
        lpstrFile: windows::core::PWSTR(buf.as_mut_ptr()),
        nMaxFile: buf.len() as u32,
        lpstrTitle: PCWSTR(t.as_ptr()),
        lpstrDefExt: PCWSTR(e.as_ptr()),
        Flags: OFN_PATHMUSTEXIST | OFN_NOCHANGEDIR | if save { OFN_OVERWRITEPROMPT } else { OFN_FILEMUSTEXIST },
        ..Default::default()
    };
    let ok = unsafe { if save { GetSaveFileNameW(&mut ofn) } else { GetOpenFileNameW(&mut ofn) } }.as_bool();
    if !ok {
        return None;
    }
    let n = buf.iter().position(|&c| c == 0).unwrap_or(buf.len());
    Some(String::from_utf16_lossy(&buf[..n]))
}

pub fn save_file(title: &str, filt: &str, def_ext: &str, name: &str) -> Option<String> {
    file_dialog(true, title, filt, def_ext, name)
}

pub fn open_file(title: &str, filt: &str) -> Option<String> {
    file_dialog(false, title, filt, "", "")
}

pub fn pick_folder(title: &str) -> Option<String> {
    unsafe {
        let d: IFileOpenDialog = CoCreateInstance(&FileOpenDialog, None, CLSCTX_INPROC_SERVER).ok()?;
        let o = d.GetOptions().ok()?;
        d.SetOptions(o | FOS_PICKFOLDERS | FOS_FORCEFILESYSTEM).ok()?;
        let t = crate::util::wide(title);
        let _ = d.SetTitle(PCWSTR(t.as_ptr()));
        d.Show(Some(crate::win::hwnd())).ok()?;
        let item = d.GetResult().ok()?;
        let p = item.GetDisplayName(SIGDN_FILESYSPATH).ok()?;
        let s = p.to_string().ok();
        windows::Win32::System::Com::CoTaskMemFree(Some(p.0 as *const _));
        s
    }
}
