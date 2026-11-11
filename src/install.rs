//! Installing, updating and removing apps: the release file is downloaded and checked (SHA-256 when
//! GitHub reports it), setups run silently when their type is known, portable apps are unpacked into
//! the apps folder (the previous version is kept for a rollback) with a Start menu shortcut. Apps
//! installed by setups are found in the Windows list of installed programs.

use std::{
    os::windows::process::CommandExt,
    path::{Path, PathBuf},
};

use windows::{
    Win32::{
        Foundation::{CloseHandle, HANDLE},
        Security::Cryptography::{BCRYPT_HASH_HANDLE, BCRYPT_SHA256_ALG_HANDLE, BCryptCreateHash, BCryptDestroyHash, BCryptFinishHash, BCryptHashData},
        System::{
            Com::{CLSCTX_INPROC_SERVER, COINIT_APARTMENTTHREADED, CoCreateInstance, CoInitializeEx, IPersistFile},
            Registry::{HKEY, HKEY_CURRENT_USER, HKEY_LOCAL_MACHINE, KEY_READ, KEY_WOW64_32KEY, KEY_WOW64_64KEY, REG_SAM_FLAGS, RegCloseKey, RegEnumKeyExW, RegOpenKeyExW, RegQueryValueExW},
            Threading::{GetExitCodeProcess, WaitForSingleObject},
        },
        UI::{
            Shell::{FO_DELETE, FOF_ALLOWUNDO, FOF_NOCONFIRMATION, FOF_NOERRORUI, FOF_SILENT, IShellLinkW, SEE_MASK_NOASYNC, SEE_MASK_NOCLOSEPROCESS, SHELLEXECUTEINFOW, SHFILEOPSTRUCTW, SHFileOperationW, ShellExecuteExW, ShellLink},
            WindowsAndMessaging::SW_SHOWNORMAL,
        },
    },
    core::{HSTRING, Interface, PCWSTR, PWSTR, w},
};

use crate::{
    config,
    gh::Kind,
    library::{App, Asset, Installed},
    logf, net, util, ver,
};

/// Release files larger than this are not downloaded.
const MAX_FILE: u64 = 4 << 30;
const CREATE_NO_WINDOW: u32 = 0x0800_0000;

/// Letters and digits only, lower case: "OBS Studio" and "obs-studio" → "obsstudio".
pub fn norm(s: &str) -> String {
    s.chars().filter(char::is_ascii_alphanumeric).map(|c| c.to_ascii_lowercase()).collect()
}

// ---------------------------------------------------------------- installed programs (registry)

#[derive(Clone, Debug, Default)]
pub struct Found {
    pub name: String,
    pub version: String,
    pub dir: String,
    pub exe: String,
    pub uninstall: String,
}

struct Key(HKEY);

impl Drop for Key {
    fn drop(&mut self) {
        unsafe {
            let _ = RegCloseKey(self.0);
        }
    }
}

fn open_key(root: HKEY, path: &str, sam: REG_SAM_FLAGS) -> Option<Key> {
    let p = util::wide(path);
    let mut k = HKEY::default();
    unsafe { RegOpenKeyExW(root, PCWSTR(p.as_ptr()), None, sam, &mut k) }.is_ok().then_some(Key(k))
}

fn reg_str(k: &Key, name: &str) -> String {
    let n = util::wide(name);
    let mut buf = vec![0u16; 2048];
    let mut len = (buf.len() * 2) as u32;
    if unsafe { RegQueryValueExW(k.0, PCWSTR(n.as_ptr()), None, None, Some(buf.as_mut_ptr() as *mut u8), Some(&mut len)) }.is_err() {
        return String::new();
    }
    let n = (len as usize / 2).min(buf.len());
    String::from_utf16_lossy(&buf[..n]).trim_end_matches('\0').trim().to_string()
}

fn reg_dword(k: &Key, name: &str) -> u32 {
    let n = util::wide(name);
    let mut v = 0u32;
    let mut len = 4u32;
    let _ = unsafe { RegQueryValueExW(k.0, PCWSTR(n.as_ptr()), None, None, Some(&mut v as *mut u32 as *mut u8), Some(&mut len)) };
    v
}

/// All entries of the Windows list of installed programs (64- and 32-bit, machine and user).
pub fn installed_programs() -> Vec<Found> {
    const UNINST: &str = r"Software\Microsoft\Windows\CurrentVersion\Uninstall";
    let mut out = Vec::new();
    for (root, sam) in [(HKEY_LOCAL_MACHINE, KEY_WOW64_64KEY), (HKEY_LOCAL_MACHINE, KEY_WOW64_32KEY), (HKEY_CURRENT_USER, REG_SAM_FLAGS(0))] {
        let Some(base) = open_key(root, UNINST, KEY_READ | sam) else { continue };
        for i in 0.. {
            let mut name = [0u16; 256];
            let mut len = name.len() as u32;
            if unsafe { RegEnumKeyExW(base.0, i, Some(PWSTR(name.as_mut_ptr())), &mut len, None, None, None, None) }.is_err() {
                break;
            }
            let sub = String::from_utf16_lossy(&name[..len as usize]);
            let Some(k) = open_key(root, &format!("{UNINST}\\{sub}"), KEY_READ | sam) else { continue };
            let display = reg_str(&k, "DisplayName");
            if display.is_empty() || reg_dword(&k, "SystemComponent") == 1 || !reg_str(&k, "ParentKeyName").is_empty() {
                continue;
            }
            let icon = reg_str(&k, "DisplayIcon");
            out.push(Found { name: display, version: reg_str(&k, "DisplayVersion"), dir: reg_str(&k, "InstallLocation").trim_matches('"').to_string(), exe: icon_exe(&icon), uninstall: reg_str(&k, "UninstallString") });
        }
    }
    out
}

/// "C:\App\app.exe",0 → C:\App\app.exe (only an existing exe).
fn icon_exe(icon: &str) -> String {
    let p = icon.trim().trim_matches('"');
    let p = match p.rfind(',') {
        Some(i) if p[i + 1..].trim().trim_start_matches('-').chars().all(|c| c.is_ascii_digit()) => &p[..i],
        _ => p,
    };
    let p = p.trim().trim_matches('"');
    if p.to_ascii_lowercase().ends_with(".exe") && Path::new(p).is_file() && !norm(p).contains("unins") { p.to_string() } else { String::new() }
}

/// The installed program that matches the app (by repository name or app name).
pub fn find(app: &App, all: &[Found]) -> Option<Found> {
    let keys: Vec<String> = [norm(&app.repo), norm(&app.name)].into_iter().filter(|k| k.len() >= 3).collect();
    let mut best: Option<(u8, &Found)> = None;
    for f in all {
        let n = norm(&f.name);
        let s = keys.iter().map(|k| if n == *k { 3 } else if n.starts_with(k.as_str()) { 2 } else { 0 }).max().unwrap_or(0);
        if s > 0 && best.is_none_or(|b| s > b.0) {
            best = Some((s, f));
        }
    }
    best.map(|b| b.1.clone())
}

// ---------------------------------------------------------------- checks of the downloaded file

/// SHA-256 of a file as lower-case hex.
pub fn sha256(path: &Path) -> Result<String, String> {
    use std::io::Read;
    let mut f = std::fs::File::open(path).map_err(|e| e.to_string())?;
    let mut h = BCRYPT_HASH_HANDLE::default();
    unsafe { BCryptCreateHash(BCRYPT_SHA256_ALG_HANDLE, &mut h, None, None, 0) }.ok().map_err(|e| e.to_string())?;
    let mut buf = vec![0u8; 1 << 20];
    let res = loop {
        match f.read(&mut buf) {
            Ok(0) => break Ok(()),
            Ok(n) => {
                if let Err(e) = unsafe { BCryptHashData(h, &buf[..n], 0) }.ok() {
                    break Err(e.to_string());
                }
            }
            Err(e) => break Err(e.to_string()),
        }
    };
    let mut out = [0u8; 32];
    let fin = unsafe { BCryptFinishHash(h, &mut out, 0) }.ok();
    unsafe {
        let _ = BCryptDestroyHash(h);
    }
    res?;
    fin.map_err(|e| e.to_string())?;
    Ok(out.iter().map(|b| format!("{b:02x}")).collect())
}

/// The tool that built a setup exe.
#[derive(Clone, Copy, PartialEq, Debug)]
enum SetupTool {
    Inno,
    Nsis,
    Burn,
    Unknown,
}

fn setup_tool(path: &Path) -> SetupTool {
    use std::io::Read;
    let mut data = Vec::new();
    let _ = std::fs::File::open(path).and_then(|f| f.take(64 << 20).read_to_end(&mut data));
    let has = |pat: &[u8]| data.windows(pat.len()).any(|w| w == pat);
    if has(b"Inno Setup") {
        SetupTool::Inno
    } else if has(b"NullsoftInst") {
        SetupTool::Nsis
    } else if has(b".wixburn") {
        SetupTool::Burn
    } else {
        SetupTool::Unknown
    }
}

/// Command-line switches of a setup: silent unless `show`, the install folder when one is chosen and
/// the tool takes it (Inno /DIR=, NSIS /D= — last and unquoted; WiX Burn folders differ per bundle).
fn setup_args(tool: SetupTool, dir: Option<&str>, show: bool) -> String {
    let mut a: Vec<String> = Vec::new();
    match tool {
        SetupTool::Inno => {
            if !show {
                a.push("/VERYSILENT /SUPPRESSMSGBOXES /NORESTART /SP-".into());
            }
            if let Some(d) = dir {
                a.push(format!("/DIR=\"{d}\""));
            }
        }
        SetupTool::Nsis => {
            if !show {
                a.push("/S".into());
            }
            if let Some(d) = dir {
                a.push(format!("/D={d}"));
            }
        }
        SetupTool::Burn if !show => a.push("/quiet /norestart".into()),
        _ => {}
    }
    a.join(" ")
}

/// msiexec arguments: progress only (or the full window), INSTALLDIR when a folder is chosen (most MSI
/// packages use it; others ignore it and install where they always do).
fn msi_args(file: &str, dir: Option<&str>, show: bool) -> String {
    let mut s = format!("/i \"{file}\" {}", if show { "" } else { "/passive /norestart" });
    if let Some(d) = dir {
        s += &format!(" INSTALLDIR=\"{d}\"");
    }
    s.split_whitespace().collect::<Vec<_>>().join(" ")
}

/// The install folder for a setup of `app`: its own, else the common one with the app's name; None —
/// where the setup proposes. An update keeps the folder it was installed into.
fn setup_dir(app: &App) -> Option<String> {
    if let Some(i) = app.inst.as_ref().filter(|i| i.method != "portable" && !i.dir.is_empty()) {
        return Some(i.dir.clone());
    }
    let own = app.setup_dir.trim();
    if !own.is_empty() {
        return Some(own.trim_end_matches('\\').to_string());
    }
    let common = config::get().setup_dir.trim().trim_end_matches('\\').to_string();
    (!common.is_empty()).then(|| format!("{common}\\{}", util::safe_name(&app.name)))
}

fn looks_like_setup(path: &Path) -> bool {
    use std::io::Read;
    let mut data = Vec::new();
    let _ = std::fs::File::open(path).and_then(|f| f.take(64 << 20).read_to_end(&mut data));
    [&b"Inno Setup"[..], b"NullsoftInst", b".wixburn", b"InstallShield", b"Squirrel"].iter().any(|p| data.windows(p.len()).any(|w| w == *p))
}

// ---------------------------------------------------------------- running programs

/// Starts a program (elevation prompt when its manifest asks) and waits for it; its exit code.
fn run_wait(file: &str, args: &str, wait_ms: u32) -> Result<u32, String> {
    shell_wait(file, args, wait_ms, false)
}

/// Starts a program as administrator (the elevation prompt) and waits; Err when declined or it failed.
pub fn run_elevated(file: &str, args: &str) -> Result<u32, String> {
    match shell_wait(file, args, 5 * 60_000, true)? {
        0 => Ok(0),
        c => Err(format!("ended with code {c}")),
    }
}

fn shell_wait(file: &str, args: &str, wait_ms: u32, admin: bool) -> Result<u32, String> {
    let f = util::wide(file);
    let a = util::wide(args);
    let mut sei = SHELLEXECUTEINFOW {
        cbSize: std::mem::size_of::<SHELLEXECUTEINFOW>() as u32,
        fMask: SEE_MASK_NOCLOSEPROCESS | SEE_MASK_NOASYNC,
        lpVerb: if admin { w!("runas") } else { w!("open") },
        lpFile: PCWSTR(f.as_ptr()),
        lpParameters: if args.is_empty() { PCWSTR::null() } else { PCWSTR(a.as_ptr()) },
        nShow: if admin { windows::Win32::UI::WindowsAndMessaging::SW_HIDE.0 } else { SW_SHOWNORMAL.0 },
        ..Default::default()
    };
    unsafe { ShellExecuteExW(&mut sei) }.map_err(|e| if e.code().0 as u32 == 0x800704C7 { "cancelled".to_string() } else { e.to_string() })?;
    let h: HANDLE = sei.hProcess;
    if h.is_invalid() {
        return Ok(0);
    }
    let mut code = 0u32;
    unsafe {
        WaitForSingleObject(h, wait_ms);
        let _ = GetExitCodeProcess(h, &mut code);
        let _ = CloseHandle(h);
    }
    Ok(code)
}

/// The exe of a command line: "\"C:\a b\x.exe\" /S" → ("C:\a b\x.exe", "/S").
pub fn split_cmd(s: &str) -> (String, String) {
    let s = s.trim();
    if let Some(r) = s.strip_prefix('"')
        && let Some(i) = r.find('"')
    {
        return (r[..i].to_string(), r[i + 1..].trim().to_string());
    }
    let low = s.to_ascii_lowercase();
    if let Some(i) = low.find(".exe") {
        return (s[..i + 4].to_string(), s[i + 4..].trim().to_string());
    }
    (s.to_string(), String::new())
}

pub fn launch(inst: &Installed) -> Result<(), String> {
    if !inst.exe.is_empty() && Path::new(&inst.exe).is_file() {
        util::shell_open(&inst.exe, None);
        return Ok(());
    }
    Err("the app's exe is unknown".into())
}

pub fn open_folder(inst: &Installed) {
    let dir = if !inst.dir.is_empty() { inst.dir.clone() } else { Path::new(&inst.exe).parent().map(|p| p.display().to_string()).unwrap_or_default() };
    if !dir.is_empty() && Path::new(&dir).is_dir() {
        util::shell_open(&dir, None);
    }
}

// ---------------------------------------------------------------- files and folders

fn copy_dir(from: &Path, to: &Path) -> std::io::Result<()> {
    std::fs::create_dir_all(to)?;
    for e in std::fs::read_dir(from)? {
        let e = e?;
        let dst = to.join(e.file_name());
        if e.file_type()?.is_dir() {
            copy_dir(&e.path(), &dst)?;
        } else {
            std::fs::copy(e.path(), &dst)?;
        }
    }
    Ok(())
}

/// Moves a file or folder to the Recycle Bin.
fn recycle(p: &Path) -> bool {
    let mut from: Vec<u16> = p.as_os_str().to_string_lossy().encode_utf16().collect();
    from.extend([0, 0]);
    let mut op = SHFILEOPSTRUCTW { wFunc: FO_DELETE, pFrom: PCWSTR(from.as_ptr()), fFlags: (FOF_ALLOWUNDO | FOF_NOCONFIRMATION | FOF_SILENT | FOF_NOERRORUI).0 as u16, ..Default::default() };
    unsafe { SHFileOperationW(&mut op) == 0 }
}

/// The app's exe in an unpacked folder: by name, else the largest exe (helpers and uninstallers skipped).
pub fn main_exe(dir: &Path, app: &App) -> Option<PathBuf> {
    let keys: Vec<String> = [norm(&app.repo), norm(&app.name)].into_iter().filter(|k| !k.is_empty()).collect();
    let mut cands = Vec::new();
    let mut stack = vec![(dir.to_path_buf(), 0)];
    while let Some((d, depth)) = stack.pop() {
        let Ok(rd) = std::fs::read_dir(&d) else { continue };
        for e in rd.flatten() {
            let p = e.path();
            if p.is_dir() && depth < 2 {
                stack.push((p, depth + 1));
            } else if p.extension().is_some_and(|x| x.eq_ignore_ascii_case("exe")) {
                let n = norm(&p.file_stem().unwrap_or_default().to_string_lossy());
                if ["unins", "uninstall", "update", "updater", "crash", "helper", "elevate", "setup", "install"].iter().any(|w| n.contains(w)) {
                    continue;
                }
                let named = keys.iter().any(|k| n == *k) as u8 * 2 + keys.iter().any(|k| n.contains(k.as_str())) as u8;
                let size = e.metadata().map(|m| m.len()).unwrap_or(0);
                cands.push((named, std::cmp::Reverse(depth), size, p));
            }
        }
    }
    cands.into_iter().max_by(|a, b| (a.0, a.1, a.2).cmp(&(b.0, b.1, b.2))).map(|c| c.3)
}

fn start_menu() -> PathBuf {
    PathBuf::from(std::env::var("APPDATA").unwrap_or_default()).join(r"Microsoft\Windows\Start Menu\Programs")
}

fn shortcut_path(name: &str) -> PathBuf {
    start_menu().join(format!("{}.lnk", util::safe_name(name)))
}

/// A Start menu shortcut to the exe (COM must be initialised on this thread).
fn make_shortcut(name: &str, exe: &Path) -> Result<(), String> {
    unsafe {
        let link: IShellLinkW = CoCreateInstance(&ShellLink, None, CLSCTX_INPROC_SERVER).map_err(|e| e.to_string())?;
        link.SetPath(&HSTRING::from(exe.as_os_str())).map_err(|e| e.to_string())?;
        if let Some(d) = exe.parent() {
            let _ = link.SetWorkingDirectory(&HSTRING::from(d.as_os_str()));
        }
        let pf: IPersistFile = link.cast().map_err(|e| e.to_string())?;
        pf.Save(&HSTRING::from(shortcut_path(name).as_os_str()), true).map_err(|e| e.to_string())
    }
}

// ---------------------------------------------------------------- install, rollback, remove

/// What install() reports while it works: (stage, 0..1 or -1 when unknown).
pub type Progress<'a> = &'a mut dyn FnMut(&str, f32);

/// (worker thread; blocks) Installs or updates `app` from `asset` of the release `tag`.
pub fn install(app: &App, asset: &Asset, kind: Kind, tag: &str, progress: Progress) -> Result<Installed, String> {
    unsafe {
        let _ = CoInitializeEx(None, COINIT_APARTMENTTHREADED);
    }
    let file = util::downloads_dir().join(util::safe_name(&asset.name));
    progress("download", 0.0);
    net::download(&asset.url, &file, MAX_FILE, |got, total| progress("download", if total > 0 { got as f32 / total as f32 } else { -1.0 }))?;
    progress("verify", -1.0);
    let hash = sha256(&file)?;
    if let Some(want) = asset.digest.strip_prefix("sha256:")
        && !hash.eq_ignore_ascii_case(want.trim())
    {
        let _ = std::fs::remove_file(&file);
        return Err("checksum mismatch: the file differs from the release".into());
    }
    let lower = asset.name.to_ascii_lowercase();
    let mut sig = (String::new(), String::new());
    if lower.ends_with(".exe") || lower.ends_with(".msi") {
        let head = std::fs::read(&file).map(|b| b.get(..2).map(<[u8]>::to_vec).unwrap_or_default()).unwrap_or_default();
        let ok = if lower.ends_with(".exe") { head == b"MZ" } else { head == [0xD0, 0xCF] };
        if !ok {
            let _ = std::fs::remove_file(&file);
            return Err("the download is not a Windows program".into());
        }
        sig = crate::trust::check(&file);
        if sig.0 == "bad" {
            let _ = std::fs::remove_file(&file);
            return Err("the file's signature is broken: it was changed after signing".into());
        }
    }
    let kind = if kind == Kind::Exe && looks_like_setup(&file) { Kind::Setup } else { kind };
    let res = match kind {
        Kind::Zip | Kind::Exe => portable(app, &file, kind, tag, progress),
        Kind::Msi | Kind::Setup | Kind::Msix => setup(app, &file, kind, tag, progress),
    };
    let kept = if res.is_ok() { keep_file(app, &file) } else { None };
    let _ = std::fs::remove_file(&file);
    res.map(|mut i| {
        // an archive: the signature of the app's own exe
        if sig.0.is_empty() && !i.exe.is_empty() {
            sig = crate::trust::check(Path::new(&i.exe));
        }
        (i.signed, i.signer) = sig;
        i.sha256 = hash;
        i.file = kept.unwrap_or_default();
        i
    })
}

/// Keeps the installed release file (one per app) for an upload to VirusTotal; its path.
fn keep_file(app: &App, file: &Path) -> Option<String> {
    let dir = util::downloads_dir().join("kept").join(util::safe_name(&app.id.replace([':', '/'], "_")));
    let _ = std::fs::remove_dir_all(&dir);
    std::fs::create_dir_all(&dir).ok()?;
    let to = dir.join(file.file_name()?);
    std::fs::rename(file, &to).or_else(|_| std::fs::copy(file, &to).map(|_| ())).ok()?;
    Some(to.display().to_string())
}

/// Forgets the kept release file of a removed app.
pub fn drop_kept(app: &App) {
    let _ = std::fs::remove_dir_all(util::downloads_dir().join("kept").join(util::safe_name(&app.id.replace([':', '/'], "_"))));
}

fn setup(app: &App, file: &Path, kind: Kind, tag: &str, progress: Progress) -> Result<Installed, String> {
    progress("install", -1.0);
    let f = file.display().to_string();
    let (dir, show) = (setup_dir(app), config::get().setup_show);
    let code = match kind {
        Kind::Msi => run_wait("msiexec.exe", &msi_args(&f, dir.as_deref(), show), 30 * 60_000)?,
        Kind::Msix => run_wait(&f, "", 30 * 60_000)?,
        _ => run_wait(&f, &setup_args(setup_tool(file), dir.as_deref(), show), 30 * 60_000)?,
    };
    // 3010: done, a restart is needed; 1641: the setup started the restart
    if ![0, 3010, 1641].contains(&code) {
        return Err(format!("the setup ended with code {code}"));
    }
    logf!("installed {} {tag} ({kind:?}, code {code})", app.id);
    let found = find(app, &installed_programs()).unwrap_or_default();
    Ok(Installed {
        version: if found.version.is_empty() { ver::display(tag) } else { found.version },
        tag: tag.to_string(),
        method: "installer".into(),
        exe: found.exe,
        dir: found.dir,
        uninstall: found.uninstall,
        at: util::unix(),
        ..Default::default()
    })
}

fn apps_dir() -> PathBuf {
    PathBuf::from(config::get().apps_dir)
}

/// The folder of a portable app.
pub fn app_dir(app: &App) -> PathBuf {
    apps_dir().join(util::safe_name(&app.name))
}

fn portable(app: &App, file: &Path, kind: Kind, tag: &str, progress: Progress) -> Result<Installed, String> {
    progress("unpack", -1.0);
    let dir = app_dir(app);
    let tmp = PathBuf::from(format!("{}.new", dir.display()));
    let _ = std::fs::remove_dir_all(&tmp);
    std::fs::create_dir_all(&tmp).map_err(|e| format!("{}: {e}", tmp.display()))?;
    if kind == Kind::Zip {
        let tar = PathBuf::from(std::env::var("SystemRoot").unwrap_or_else(|_| r"C:\Windows".into())).join(r"System32\tar.exe");
        let out = std::process::Command::new(tar).arg("-xf").arg(file).arg("-C").arg(&tmp).creation_flags(CREATE_NO_WINDOW).output().map_err(|e| e.to_string())?;
        if !out.status.success() {
            let _ = std::fs::remove_dir_all(&tmp);
            return Err(format!("cannot unpack: {}", String::from_utf8_lossy(&out.stderr).trim()));
        }
    } else {
        std::fs::copy(file, tmp.join(file.file_name().unwrap_or_default())).map_err(|e| e.to_string())?;
    }
    // an archive with one folder inside: its content is the app
    let mut root = tmp.clone();
    loop {
        let items: Vec<_> = std::fs::read_dir(&root).map(|r| r.flatten().collect()).unwrap_or_default();
        match items.as_slice() {
            [one] if one.path().is_dir() => root = one.path(),
            _ => break,
        }
    }
    let prev = app.inst.as_ref().filter(|i| i.method == "portable").map(|i| i.version.clone()).unwrap_or_default();
    let old = PathBuf::from(format!("{}.old", dir.display()));
    if dir.is_dir() {
        // the running app cannot be replaced: say so before anything changes
        if let Some(exe) = app.inst.as_ref().map(|i| PathBuf::from(&i.exe)).filter(|p| p.is_file())
            && std::fs::OpenOptions::new().write(true).open(&exe).is_err()
        {
            let _ = std::fs::remove_dir_all(&tmp);
            return Err("close the app first: its files are in use".into());
        }
        let _ = std::fs::remove_dir_all(&old);
        copy_dir(&dir, &old).map_err(|e| format!("backup: {e}"))?;
    }
    // new files over the old folder: settings files the app made next to itself stay
    if let Err(e) = copy_dir(&root, &dir) {
        let _ = std::fs::remove_dir_all(&tmp);
        return Err(format!("{}: {e}", dir.display()));
    }
    let _ = std::fs::remove_dir_all(&tmp);
    let exe = main_exe(&dir, app).map(|p| p.display().to_string()).unwrap_or_default();
    if !exe.is_empty()
        && let Err(e) = make_shortcut(&app.name, Path::new(&exe))
    {
        logf!("shortcut for {}: {e}", app.id);
    }
    logf!("unpacked {} {tag} into {}", app.id, dir.display());
    Ok(Installed { version: ver::display(tag), tag: tag.to_string(), method: "portable".into(), exe, dir: dir.display().to_string(), prev, at: util::unix(), ..Default::default() })
}

/// (worker thread) Puts the previous version of a portable app back.
pub fn rollback(app: &App) -> Result<Installed, String> {
    let inst = app.inst.clone().filter(|i| i.method == "portable").ok_or("nothing to roll back")?;
    let dir = PathBuf::from(&inst.dir);
    let old = PathBuf::from(format!("{}.old", dir.display()));
    if !old.is_dir() {
        return Err("the previous version is not kept".into());
    }
    let cur = PathBuf::from(format!("{}.cur", dir.display()));
    let _ = std::fs::remove_dir_all(&cur);
    std::fs::rename(&dir, &cur).map_err(|_| "close the app first: its files are in use".to_string())?;
    if let Err(e) = std::fs::rename(&old, &dir) {
        let _ = std::fs::rename(&cur, &dir);
        return Err(e.to_string());
    }
    let _ = std::fs::remove_dir_all(&cur);
    let exe = main_exe(&dir, app).map(|p| p.display().to_string()).unwrap_or_default();
    Ok(Installed { version: inst.prev.clone(), tag: String::new(), exe, prev: String::new(), at: util::unix(), ..inst })
}

/// (worker thread; blocks) Removes the app: a portable one goes to the Recycle Bin, an installed one
/// runs its uninstaller. Ok(true) — gone.
pub fn uninstall(app: &App) -> Result<bool, String> {
    unsafe {
        let _ = CoInitializeEx(None, COINIT_APARTMENTTHREADED);
    }
    let inst = app.inst.clone().ok_or("not installed")?;
    if inst.method == "portable" {
        let dir = PathBuf::from(&inst.dir);
        if dir.is_dir() && !recycle(&dir) {
            return Err("close the app first: its files are in use".into());
        }
        let old = PathBuf::from(format!("{}.old", dir.display()));
        if old.is_dir() {
            recycle(&old);
        }
        let _ = std::fs::remove_file(shortcut_path(&app.name));
        return Ok(true);
    }
    let cmd = if inst.uninstall.is_empty() { find(app, &installed_programs()).map(|f| f.uninstall).unwrap_or_default() } else { inst.uninstall.clone() };
    if cmd.is_empty() {
        return Err("Windows has no uninstaller for this app".into());
    }
    let (exe, mut args) = split_cmd(&cmd);
    if norm(&exe).ends_with("msiexecexe") {
        args = args.replace("/I{", "/X{").replace("/i{", "/X{");
    }
    run_wait(&exe, &args, 30 * 60_000)?;
    Ok(find(app, &installed_programs()).is_none())
}

#[cfg(test)]
mod tests {
    use super::*;

    /// What Windows lists as installed on this PC: cargo test -- --ignored live_programs --nocapture
    #[test]
    #[ignore]
    fn live_programs() {
        let all = installed_programs();
        assert!(!all.is_empty());
        for f in all.iter().take(8) {
            println!("{} | {} | {} | {}", f.name, f.version, f.exe, f.uninstall);
        }
        println!("{} programs", all.len());
    }

    #[test]
    fn commands() {
        assert_eq!(split_cmd("\"C:\\Program Files\\A\\unins000.exe\" /SILENT"), ("C:\\Program Files\\A\\unins000.exe".into(), "/SILENT".into()));
        assert_eq!(split_cmd("MsiExec.exe /X{1234}"), ("MsiExec.exe".into(), "/X{1234}".into()));
        assert_eq!(split_cmd("C:\\x\\u.exe"), ("C:\\x\\u.exe".into(), "".into()));
    }

    #[test]
    fn matching() {
        let app = App { repo: "obs-studio".into(), name: "OBS Studio".into(), ..Default::default() };
        let all = [Found { name: "OBS Studio".into(), ..Default::default() }, Found { name: "Obsidian".into(), ..Default::default() }];
        assert_eq!(find(&app, &all).unwrap().name, "OBS Studio");
        let app = App { repo: "PowerToys".into(), name: "PowerToys".into(), ..Default::default() };
        let all = [Found { name: "PowerToys (Preview)".into(), ..Default::default() }];
        assert!(find(&app, &all).is_some());
        let app = App { repo: "go".into(), name: "go".into(), ..Default::default() };
        assert!(find(&app, &[Found { name: "Google Chrome".into(), ..Default::default() }]).is_none(), "too short to match");
    }

    #[test]
    fn setup_command_lines() {
        assert_eq!(setup_args(SetupTool::Inno, Some(r"D:\Programs\ShareX"), false), r#"/VERYSILENT /SUPPRESSMSGBOXES /NORESTART /SP- /DIR="D:\Programs\ShareX""#);
        assert_eq!(setup_args(SetupTool::Nsis, Some(r"D:\Programs\My App"), false), r"/S /D=D:\Programs\My App", "NSIS: /D= last, unquoted");
        assert_eq!(setup_args(SetupTool::Nsis, None, true), "", "the setup's own window");
        assert_eq!(setup_args(SetupTool::Burn, Some(r"D:\x"), false), "/quiet /norestart");
        assert_eq!(setup_args(SetupTool::Unknown, Some(r"D:\x"), false), "");
        assert_eq!(msi_args(r"C:\a.msi", Some(r"D:\P\A"), false), r#"/i "C:\a.msi" /passive /norestart INSTALLDIR="D:\P\A""#);
        assert_eq!(msi_args(r"C:\a.msi", None, true), r#"/i "C:\a.msi""#);
    }

    #[test]
    fn hashes() {
        let p = std::env::temp_dir().join("komora-sha-test.txt");
        std::fs::write(&p, b"abc").unwrap();
        assert_eq!(sha256(&p).unwrap(), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
        let _ = std::fs::remove_file(&p);
    }

    #[test]
    fn icon_paths() {
        assert_eq!(icon_exe("\"C:\\nope\\x.exe\",0"), "", "missing file");
        let sys = format!("{}\\System32\\notepad.exe", std::env::var("SystemRoot").unwrap());
        assert_eq!(icon_exe(&format!("{sys},0")), sys);
    }
}
