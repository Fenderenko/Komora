//! The icon of an installed app taken from its exe, written as a 32-bit .ico the page can show and
//! read the colour of.

use std::path::Path;

use windows::Win32::{
    Graphics::Gdi::{BI_RGB, BITMAPINFO, BITMAPINFOHEADER, DIB_RGB_COLORS, DeleteObject, GetDC, GetDIBits, HBITMAP, HGDIOBJ, ReleaseDC},
    UI::WindowsAndMessaging::{DestroyIcon, GetIconInfo, HICON, ICONINFO, PrivateExtractIconsW},
};

/// Pixels of a bitmap as top-down BGRA.
fn bits(bm: HBITMAP, w: i32, h: i32) -> Option<Vec<u8>> {
    let mut bi = BITMAPINFO {
        bmiHeader: BITMAPINFOHEADER { biSize: std::mem::size_of::<BITMAPINFOHEADER>() as u32, biWidth: w, biHeight: -h, biPlanes: 1, biBitCount: 32, biCompression: BI_RGB.0, ..Default::default() },
        ..Default::default()
    };
    let mut buf = vec![0u8; (w * h * 4) as usize];
    unsafe {
        let dc = GetDC(None);
        let n = GetDIBits(dc, bm, 0, h as u32, Some(buf.as_mut_ptr() as *mut _), &mut bi, DIB_RGB_COLORS);
        ReleaseDC(None, dc);
        (n == h).then_some(buf)
    }
}

/// The exe's icon at `size` px (Windows scales the nearest one) as top-down BGRA with alpha.
fn extract(exe: &Path, size: i32) -> Option<Vec<u8>> {
    let mut name = [0u16; 260];
    let w: Vec<u16> = exe.as_os_str().to_string_lossy().encode_utf16().collect();
    if w.len() >= name.len() {
        return None;
    }
    name[..w.len()].copy_from_slice(&w);
    let mut icons = [HICON::default()];
    let n = unsafe { PrivateExtractIconsW(&name, 0, size, size, Some(&mut icons), None, 0) };
    if n == 0 || n == u32::MAX || icons[0].is_invalid() {
        return None;
    }
    let hicon = icons[0];
    let mut info = ICONINFO::default();
    let res = unsafe { GetIconInfo(hicon, &mut info) }.ok().and_then(|_| {
        let mut px = bits(info.hbmColor, size, size)?;
        if px.chunks(4).all(|p| p[3] == 0) {
            // an old icon without alpha: transparency from the mask (black = visible)
            let mask = bits(info.hbmMask, size, size)?;
            for (p, m) in px.chunks_mut(4).zip(mask.chunks(4)) {
                p[3] = if m[0] == 0 { 255 } else { 0 };
            }
        }
        Some(px)
    });
    unsafe {
        if !info.hbmColor.is_invalid() {
            let _ = DeleteObject(HGDIOBJ(info.hbmColor.0));
        }
        if !info.hbmMask.is_invalid() {
            let _ = DeleteObject(HGDIOBJ(info.hbmMask.0));
        }
        let _ = DestroyIcon(hicon);
    }
    res.filter(|px| px.chunks(4).any(|p| p[3] > 0))
}

/// A one-image .ico: BITMAPINFOHEADER, BGRA rows bottom-up, empty AND mask.
pub fn ico(px: &[u8], s: u32) -> Vec<u8> {
    let mask_row = s.div_ceil(32) * 4;
    let img_len = 40 + s * s * 4 + mask_row * s;
    let mut b = Vec::with_capacity(22 + img_len as usize);
    for v in [0u16, 1, 1] {
        b.extend(v.to_le_bytes());
    }
    let wh = if s >= 256 { 0 } else { s as u8 };
    b.extend([wh, wh, 0, 0]);
    b.extend(1u16.to_le_bytes());
    b.extend(32u16.to_le_bytes());
    b.extend(img_len.to_le_bytes());
    b.extend(22u32.to_le_bytes());
    for v in [40u32, s, s * 2] {
        b.extend(v.to_le_bytes());
    }
    b.extend(1u16.to_le_bytes());
    b.extend(32u16.to_le_bytes());
    for v in [0u32, s * s * 4 + mask_row * s, 0, 0, 0, 0] {
        b.extend(v.to_le_bytes());
    }
    for y in (0..s as usize).rev() {
        b.extend_from_slice(&px[y * s as usize * 4..(y + 1) * s as usize * 4]);
    }
    b.extend(std::iter::repeat_n(0u8, (mask_row * s) as usize));
    b
}

/// (any thread) The exe's icon as .ico bytes (128 px).
pub fn from_exe(exe: &Path) -> Option<Vec<u8>> {
    const S: i32 = 128;
    extract(exe, S).map(|px| ico(&px, S as u32))
}

#[cfg(test)]
mod tests {
    #[test]
    fn notepad_icon() {
        let exe = format!("{}\\System32\\notepad.exe", std::env::var("SystemRoot").unwrap());
        let ico = super::from_exe(std::path::Path::new(&exe)).expect("notepad has an icon");
        assert_eq!(&ico[..4], &[0, 0, 1, 0]);
        assert_eq!(ico.len(), 22 + 40 + 128 * 128 * 4 + 16 * 128);
    }
}
