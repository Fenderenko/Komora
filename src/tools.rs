//! Upkeep of the PC for «Tweaks»: the video driver's shader caches, temporary files and installers' leftovers, and the
//! programs that start with Windows (switched as Task Manager does: the StartupApproved values, the entry stays).

use serde_json::{Value, json};
use std::path::{Path, PathBuf};
use windows::{
    Win32::System::Registry::{HKEY, HKEY_CURRENT_USER, HKEY_LOCAL_MACHINE, KEY_READ, KEY_WOW64_32KEY, KEY_WOW64_64KEY, REG_BINARY, REG_SAM_FLAGS, RRF_RT_REG_BINARY, RegCloseKey, RegEnumValueW, RegGetValueW, RegOpenKeyExW, RegSetKeyValueW},
    core::{HSTRING, PWSTR},
};

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

// ---------------------------------------------------------------- programs that start with Windows

const RUN: &str = r"Software\Microsoft\Windows\CurrentVersion\Run";
const APPROVED: &str = r"Software\Microsoft\Windows\CurrentVersion\Explorer\StartupApproved";

/// Where a startup entry lives: (id prefix, root, key, view, approval subkey).
const SOURCES: [(&str, bool, &str, u32, &str); 3] = [("hkcu", false, RUN, 0, "Run"), ("hklm", true, RUN, 64, "Run"), ("hklm32", true, RUN, 32, "Run32")];

fn root(machine: bool) -> HKEY {
    if machine { HKEY_LOCAL_MACHINE } else { HKEY_CURRENT_USER }
}

/// Values (name, data) of a registry key.
fn values(machine: bool, key: &str, view: u32) -> Vec<(String, String)> {
    let sam = match view {
        64 => KEY_WOW64_64KEY,
        32 => KEY_WOW64_32KEY,
        _ => REG_SAM_FLAGS(0),
    };
    let mut h = HKEY::default();
    if unsafe { RegOpenKeyExW(root(machine), &HSTRING::from(key), None, KEY_READ | sam, &mut h) }.is_err() {
        return Vec::new();
    }
    let mut out = Vec::new();
    for i in 0.. {
        let mut name = [0u16; 512];
        let mut nlen = name.len() as u32;
        let mut data = vec![0u8; 4096];
        let mut dlen = data.len() as u32;
        let mut ty = 0u32;
        if unsafe { RegEnumValueW(h, i, Some(PWSTR(name.as_mut_ptr())), &mut nlen, None, Some(&mut ty), Some(data.as_mut_ptr()), Some(&mut dlen)) }.is_err() {
            break;
        }
        let words: Vec<u16> = data[..dlen as usize].chunks_exact(2).map(|c| u16::from_le_bytes([c[0], c[1]])).collect();
        let text = String::from_utf16_lossy(&words).trim_end_matches('\0').to_string();
        out.push((String::from_utf16_lossy(&name[..nlen as usize]), text));
    }
    let _ = unsafe { RegCloseKey(h) };
    out
}

/// Whether Task Manager's approval says «enabled» (no value — enabled).
fn approved(machine: bool, sub: &str, name: &str) -> bool {
    let mut buf = [0u8; 12];
    let mut len = buf.len() as u32;
    let r = unsafe { RegGetValueW(root(machine), &HSTRING::from(format!(r"{APPROVED}\{sub}")), &HSTRING::from(name), RRF_RT_REG_BINARY, None, Some(buf.as_mut_ptr() as *mut _), Some(&mut len)) };
    // the low bit of the first byte marks «disabled» (0x03, 0x07); 0x02 and 0x06 are enabled
    r.is_err() || buf[0] & 1 == 0
}

/// The exe of a command line.
fn exe_of(cmd: &str) -> String {
    let (exe, _) = crate::install::split_cmd(cmd);
    let exe = std::env::var("SystemRoot").map(|r| exe.replace("%SystemRoot%", &r).replace("%windir%", &r)).unwrap_or(exe);
    exe
}

/// The user's startup folder (its shortcuts are entries too).
fn startup_folder() -> PathBuf {
    PathBuf::from(std::env::var_os("APPDATA").unwrap_or_default()).join(r"Microsoft\Windows\Start Menu\Programs\Startup")
}

/// Everything that starts with Windows: id, name, command, whether it is enabled, whether a change needs the
/// administrator.
pub fn startup() -> Vec<Value> {
    let mut out = Vec::new();
    for (pre, machine, key, view, sub) in SOURCES {
        for (name, cmd) in values(machine, key, view) {
            if cmd.is_empty() {
                continue;
            }
            out.push(json!({ "id": format!("{pre}|{name}"), "name": name, "cmd": cmd, "exe": exe_of(&cmd), "on": approved(machine, sub, &name), "admin": machine }));
        }
    }
    if let Ok(rd) = std::fs::read_dir(startup_folder()) {
        for e in rd.flatten() {
            let f = e.file_name().to_string_lossy().to_string();
            if f.eq_ignore_ascii_case("desktop.ini") {
                continue;
            }
            let name = Path::new(&f).file_stem().map(|s| s.to_string_lossy().to_string()).unwrap_or(f.clone());
            out.push(json!({ "id": format!("folder|{f}"), "name": name, "cmd": e.path().to_string_lossy(), "exe": "", "on": approved(false, "StartupFolder", &f), "admin": false }));
        }
    }
    out.sort_by_key(|v| v["name"].as_str().unwrap_or("").to_lowercase());
    out
}

/// Turns an entry on or off as Task Manager does. A machine-wide entry asks for the administrator once (reg.exe).
pub fn set_startup(id: &str, on: bool) -> Result<(), String> {
    let (pre, name) = id.split_once('|').ok_or("bad entry")?;
    let (machine, sub) = match pre {
        "hkcu" => (false, "Run"),
        "hklm" => (true, "Run"),
        "hklm32" => (true, "Run32"),
        "folder" => (false, "StartupFolder"),
        _ => return Err("bad entry".into()),
    };
    // 12 bytes: 02 — enabled; 03 and the time it was switched off (FILETIME) — disabled
    let mut data = [0u8; 12];
    data[0] = if on { 2 } else { 3 };
    if !on {
        let ft = (crate::util::unix() as u64 + 11_644_473_600) * 10_000_000;
        data[4..12].copy_from_slice(&ft.to_le_bytes());
    }
    if machine {
        let hex: String = data.iter().map(|b| format!("{b:02X}")).collect();
        let args = format!(r#"add "HKLM\{APPROVED}\{sub}" /v "{name}" /t REG_BINARY /d {hex} /f"#);
        return crate::install::run_elevated("reg.exe", &args).map(|_| ());
    }
    let r = unsafe { RegSetKeyValueW(HKEY_CURRENT_USER, &HSTRING::from(format!(r"{APPROVED}\{sub}")), &HSTRING::from(name), REG_BINARY.0, Some(data.as_ptr() as *const _), data.len() as u32) };
    if r.is_ok() { Ok(()) } else { Err(format!("cannot change the entry ({})", r.0)) }
}

#[cfg(test)]
mod tests {
    /// What starts with Windows here and the upkeep sizes (cargo test -- --ignored --nocapture tools_live).
    #[test]
    #[ignore]
    fn tools_live() {
        for v in super::startup() {
            println!("{} | on {} | admin {} | {}", v["name"], v["on"], v["admin"], v["exe"]);
        }
        println!("{}", super::sizes());
    }
}
