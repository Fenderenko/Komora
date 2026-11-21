//! Upkeep of the PC for «Tweaks»: the video driver's shader caches, temporary files and installers' leftovers, and
//! one-click fixes of common troubles.

use serde_json::{Value, json};
use std::path::{Path, PathBuf};
use windows::core::HSTRING;

fn local() -> PathBuf {
    PathBuf::from(std::env::var_os("LOCALAPPDATA").unwrap_or_default())
}

/// Shader caches of NVIDIA, AMD, Intel and DirectX: rebuilt by the driver on the next game start.
fn shader_dirs() -> Vec<PathBuf> {
    let l = local();
    [r"NVIDIA\DXCache", r"NVIDIA\GLCache", r"NVIDIA Corporation\NV_Cache", "D3DSCache", r"AMD\DxCache", r"AMD\DxcCache", r"AMD\GLCache", r"AMD\VkCache", r"Intel\ShaderCache"].iter().map(|p| l.join(p)).filter(|p| p.is_dir()).collect()
}

/// Temporary files: the user's temp folder (winget's downloads are inside) and Komora's own downloads.
fn temp_dirs() -> Vec<PathBuf> {
    vec![std::env::temp_dir(), crate::util::downloads_dir()]
}

/// Bytes of a folder's files (no links followed).
fn size(dir: &Path) -> u64 {
    let Ok(rd) = std::fs::read_dir(dir) else { return 0 };
    rd.flatten()
        .map(|e| match e.file_type() {
            Ok(t) if t.is_dir() => size(&e.path()),
            Ok(t) if t.is_file() => e.metadata().map(|m| m.len()).unwrap_or(0),
            _ => 0,
        })
        .sum()
}

/// Removes what can be removed inside `dir` (files in use stay); `min_age` — only things not changed for that long.
/// The bytes freed.
fn clean(dir: &Path, min_age: std::time::Duration) -> u64 {
    let Ok(rd) = std::fs::read_dir(dir) else { return 0 };
    let now = std::time::SystemTime::now();
    let mut freed = 0;
    for e in rd.flatten() {
        let Ok(t) = e.file_type() else { continue };
        let p = e.path();
        if t.is_symlink() {
            continue;
        }
        if t.is_dir() {
            freed += clean(&p, min_age);
            let _ = std::fs::remove_dir(&p);
        } else if t.is_file() {
            let Ok(m) = e.metadata() else { continue };
            if m.modified().ok().and_then(|t| now.duration_since(t).ok()).is_some_and(|age| age < min_age) {
                continue;
            }
            if std::fs::remove_file(&p).is_ok() {
                freed += m.len();
            }
        }
    }
    freed
}

/// The size of each kind of upkeep (a few hundred ms on a full temp folder; asked from a worker).
pub fn sizes() -> Value {
    json!({ "shader": shader_dirs().iter().map(|d| size(d)).sum::<u64>(), "temp": temp_dirs().iter().map(|d| size(d)).sum::<u64>() })
}

/// Cleans the shader caches; the bytes freed.
pub fn clean_shaders() -> u64 {
    shader_dirs().iter().map(|d| clean(d, std::time::Duration::ZERO)).sum()
}

/// Cleans temporary files older than a day (a setup that runs now keeps its files); the bytes freed.
pub fn clean_temp() -> u64 {
    temp_dirs().iter().map(|d| clean(d, std::time::Duration::from_secs(86_400))).sum()
}

// ---------------------------------------------------------------- one-click fixes of common troubles

/// Runs a command without a window; Ok — exit code 0.
fn quiet(file: &str, args: &[&str]) -> Result<(), String> {
    use std::os::windows::process::CommandExt;
    let s = std::process::Command::new(file).args(args).creation_flags(0x0800_0000).status().map_err(|e| e.to_string())?;
    if s.success() { Ok(()) } else { Err(format!("{file} ended with code {}", s.code().unwrap_or(-1))) }
}

/// An administrator's console that stays open (long work the user should see: sfc and DISM).
fn admin_console(cmd: &str) -> Result<(), String> {
    use windows::Win32::UI::{Shell::ShellExecuteW, WindowsAndMessaging::SW_SHOWNORMAL};
    let r = unsafe { ShellExecuteW(None, &HSTRING::from("runas"), &HSTRING::from("cmd.exe"), &HSTRING::from(format!("/k {cmd}")), None, SW_SHOWNORMAL) };
    if r.0 as isize > 32 { Ok(()) } else { Err("the administrator's rights were not given".into()) }
}

/// One fix: "time" — the clock synchronised now, "wu" — Windows Update's download cache emptied (the services
/// restarted), "sfc" — system files checked and repaired (sfc, then DISM) in a console, "store" — Microsoft Store's
/// cache reset, "dns" — the DNS cache flushed.
pub fn fix(what: &str) -> Result<(), String> {
    match what {
        "time" => crate::install::run_elevated("cmd.exe", "/c net start w32time & w32tm /resync /force").map(|_| ()),
        "wu" => crate::install::run_elevated("cmd.exe", r"/c net stop wuauserv & net stop bits & rd /s /q %windir%\SoftwareDistribution\Download & net start bits & net start wuauserv & exit /b 0").map(|_| ()),
        "sfc" => admin_console("sfc /scannow && DISM /Online /Cleanup-Image /RestoreHealth"),
        "store" => {
            use std::os::windows::process::CommandExt;
            std::process::Command::new("wsreset.exe").creation_flags(0x0800_0000).spawn().map(|_| ()).map_err(|e| e.to_string())
        }
        "dns" => quiet("ipconfig", &["/flushdns"]).or_else(|_| crate::install::run_elevated("ipconfig.exe", "/flushdns").map(|_| ())),
        _ => Err("unknown fix".into()),
    }
}

#[cfg(test)]
mod tests {
    /// The upkeep sizes here (cargo test -- --ignored --nocapture tools_live).
    #[test]
    #[ignore]
    fn tools_live() {
        println!("{}", super::sizes());
    }
}
