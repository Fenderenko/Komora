//! Paths, the log, posting to the UI thread and small helpers.

use std::{
    fs::{File, OpenOptions},
    io::Write,
    path::PathBuf,
    sync::{
        Mutex, OnceLock,
        atomic::{AtomicIsize, Ordering},
    },
};

use windows::Win32::{
    Foundation::{HWND, LPARAM, WPARAM},
    UI::WindowsAndMessaging::PostMessageW,
};

static MAIN_HWND: AtomicIsize = AtomicIsize::new(0);
static LOG: OnceLock<Mutex<Option<File>>> = OnceLock::new();

/// %APPDATA%\Komora
pub fn data_dir() -> PathBuf {
    let base = std::env::var_os("APPDATA").map(PathBuf::from).unwrap_or_else(std::env::temp_dir);
    let d = base.join("Komora");
    let _ = std::fs::create_dir_all(&d);
    d
}

/// Files served to the page (virtual host): the page itself and cached icons.
pub fn www_dir() -> PathBuf {
    let d = data_dir().join("www");
    let _ = std::fs::create_dir_all(d.join("icons"));
    d
}

/// Downloaded release files before they are installed.
pub fn downloads_dir() -> PathBuf {
    let d = data_dir().join("downloads");
    let _ = std::fs::create_dir_all(&d);
    d
}

/// Starts a fresh log for this run; the previous one is kept as komora.old.log.
pub fn init_log() {
    let d = data_dir();
    let _ = std::fs::rename(d.join("komora.log"), d.join("komora.old.log"));
    let f = OpenOptions::new().create(true).write(true).truncate(true).open(d.join("komora.log")).ok();
    let _ = LOG.set(Mutex::new(f));
}

pub fn log(s: &str) {
    let t = unix_ms();
    let line = format!("{}.{:03} {s}\n", local_hms(t / 1000), t % 1000);
    if cfg!(debug_assertions) {
        eprint!("{line}");
    }
    if let Some(m) = LOG.get()
        && let Ok(mut g) = m.lock()
        && let Some(f) = g.as_mut()
    {
        let _ = f.write_all(line.as_bytes());
    }
}

#[macro_export]
macro_rules! logf {
    ($($a:tt)*) => { $crate::util::log(&format!($($a)*)) };
}

pub fn unix_ms() -> u128 {
    std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).map(|d| d.as_millis()).unwrap_or(0)
}

pub fn unix() -> i64 {
    (unix_ms() / 1000) as i64
}

fn local_hms(unix: u128) -> String {
    let s = (unix as i64 + local_offset()).rem_euclid(86400);
    format!("{:02}:{:02}:{:02}", s / 3600, s / 60 % 60, s % 60)
}

/// Seconds to add to UTC for local time (with daylight saving).
fn local_offset() -> i64 {
    use windows::Win32::System::Time::{GetTimeZoneInformation, TIME_ZONE_INFORMATION};
    const TIME_ZONE_ID_DAYLIGHT: u32 = 2;
    let mut tz = TIME_ZONE_INFORMATION::default();
    let r = unsafe { GetTimeZoneInformation(&mut tz) };
    let mut bias = tz.Bias;
    if r == TIME_ZONE_ID_DAYLIGHT {
        bias += tz.DaylightBias;
    } else {
        bias += tz.StandardBias;
    }
    -(bias as i64) * 60
}

pub fn set_main_hwnd(h: HWND) {
    MAIN_HWND.store(h.0 as isize, Ordering::Relaxed);
}

pub fn main_hwnd() -> HWND {
    HWND(MAIN_HWND.load(Ordering::Relaxed) as *mut _)
}

/// Posts a message to the hidden main window (any thread).
pub fn post_ui(msg: u32, wp: usize) {
    let h = main_hwnd();
    if !h.is_invalid() {
        unsafe {
            let _ = PostMessageW(Some(h), msg, WPARAM(wp), LPARAM(0));
        }
    }
}

pub fn wide(s: &str) -> Vec<u16> {
    s.encode_utf16().chain(Some(0)).collect()
}

pub fn copy_wide(dst: &mut [u16], s: &str) {
    let n = dst.len().saturating_sub(1);
    let mut i = 0;
    for c in s.encode_utf16().take(n) {
        dst[i] = c;
        i += 1;
    }
    dst[i] = 0;
}

/// A name usable as a folder or file name (Windows forbids <>:"/\|?* and trailing dots).
pub fn safe_name(s: &str) -> String {
    let t: String = s.chars().map(|c| if c.is_control() || "<>:\"/\\|?*".contains(c) { '_' } else { c }).collect();
    let t = t.trim().trim_end_matches('.').to_string();
    if t.is_empty() { "app".into() } else { t }
}

/// Opens a URL or a file with its default handler (http/https URLs and local paths only).
pub fn shell_open(target: &str, args: Option<&str>) {
    use windows::{Win32::UI::Shell::ShellExecuteW, Win32::UI::WindowsAndMessaging::SW_SHOWNORMAL, core::PCWSTR};
    let t = wide(target);
    let a = args.map(wide);
    unsafe {
        ShellExecuteW(None, windows::core::w!("open"), PCWSTR(t.as_ptr()), a.as_ref().map_or(PCWSTR::null(), |a| PCWSTR(a.as_ptr())), PCWSTR::null(), SW_SHOWNORMAL);
    }
}

/// Ukrainian when the Windows UI language is Ukrainian, otherwise English.
pub fn system_lang() -> &'static str {
    let id = unsafe { windows::Win32::Globalization::GetUserDefaultUILanguage() };
    match id & 0x3ff {
        0x22 => "uk",
        0x07 => "de",
        0x0c => "fr",
        0x0a => "es",
        0x16 => "pt",
        0x15 => "pl",
        0x10 => "it",
        0x1f => "tr",
        _ => "en",
    }
}

/// "#rrggbb" → (r, g, b).
pub fn parse_hex(s: &str) -> Option<(u8, u8, u8)> {
    let h = s.strip_prefix('#').filter(|h| h.len() == 6 && h.is_ascii())?;
    let c = |i: usize| u8::from_str_radix(&h[i..i + 2], 16).ok();
    Some((c(0)?, c(2)?, c(4)?))
}

/// RGB → (hue 0..1, saturation, lightness), as rgb2hsl in app.js.
pub fn rgb_hsl(r: u8, g: u8, b: u8) -> (f64, f64, f64) {
    let (r, g, b) = (r as f64 / 255.0, g as f64 / 255.0, b as f64 / 255.0);
    let (mx, mn) = (r.max(g).max(b), r.min(g).min(b));
    let l = (mx + mn) / 2.0;
    if mx == mn {
        return (0.0, 0.0, l);
    }
    let d = mx - mn;
    let s = if l > 0.5 { d / (2.0 - mx - mn) } else { d / (mx + mn) };
    let h = if mx == r { (g - b) / d + if g < b { 6.0 } else { 0.0 } } else if mx == g { (b - r) / d + 2.0 } else { (r - g) / d + 4.0 };
    (h / 6.0, s, l)
}

/// (hue 0..1, saturation, lightness) → RGB, as hsl2rgb in app.js.
pub fn hsl_rgb(h: f64, s: f64, l: f64) -> (u8, u8, u8) {
    let v = |x: f64| (x * 255.0).round().clamp(0.0, 255.0) as u8;
    if s == 0.0 {
        return (v(l), v(l), v(l));
    }
    let q = if l < 0.5 { l * (1.0 + s) } else { l + s - l * s };
    let p = 2.0 * l - q;
    let f = |t: f64| {
        let t = (t + 1.0) % 1.0;
        if t < 1.0 / 6.0 {
            p + (q - p) * 6.0 * t
        } else if t < 0.5 {
            q
        } else if t < 2.0 / 3.0 {
            p + (q - p) * (2.0 / 3.0 - t) * 6.0
        } else {
            p
        }
    };
    (v(f(h + 1.0 / 3.0)), v(f(h)), v(f(h - 1.0 / 3.0)))
}

#[cfg(test)]
mod tests {
    #[test]
    fn safe_names() {
        assert_eq!(super::safe_name("a/b:c?"), "a_b_c_");
        assert_eq!(super::safe_name(" app. "), "app");
        assert_eq!(super::safe_name(".."), "app");
    }

    #[test]
    fn hsl_round_trip() {
        for c in [(0x1a, 0x1e, 0x24), (0xe9, 0xe5, 0xdc), (0x1c, 0x1c, 0x1c), (0xff, 0x00, 0x80)] {
            let (h, s, l) = super::rgb_hsl(c.0, c.1, c.2);
            assert_eq!(super::hsl_rgb(h, s, l), c);
        }
        assert_eq!(super::parse_hex("#1A1e24"), Some((0x1a, 0x1e, 0x24)));
        assert_eq!(super::parse_hex("1a1e24"), None);
    }
}
