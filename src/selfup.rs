//! Komora in its own library: the running exe is its installed version, and an update replaces that
//! exe in place (the running one is renamed to .old, the new one starts with --after-update <pid>,
//! waits for this process to end and removes the .old file).

use std::path::{Path, PathBuf};

use windows::Win32::{
    Foundation::{CloseHandle, WAIT_OBJECT_0},
    System::Threading::{OpenProcess, PROCESS_SYNCHRONIZE, WaitForSingleObject},
};

use crate::{
    library::{self, App, Installed, Release},
    logf, net, trust, util,
};

pub const ID: &str = "gh:fenderenko/komora";
pub const OWNER: &str = "Fenderenko";
pub const REPO: &str = "Komora";

fn exe() -> Option<PathBuf> {
    std::env::current_exe().ok()
}

fn old_of(exe: &Path) -> PathBuf {
    exe.with_extension("exe.old")
}

/// The entry of Komora itself, as it is added to the library and to bundles.
pub fn app() -> App {
    App {
        id: ID.into(),
        url: format!("https://github.com/{OWNER}/{REPO}"),
        kind: "github".into(),
        owner: OWNER.into(),
        repo: REPO.into(),
        name: REPO.into(),
        added: util::unix(),
        updated: util::unix(),
        method: "portable".into(),
        ..Default::default()
    }
}

/// The running exe as the installed version.
pub fn installed() -> Installed {
    let exe = exe().unwrap_or_default();
    let v = env!("CARGO_PKG_VERSION");
    Installed {
        version: v.into(),
        tag: format!("v{v}"),
        method: "self".into(),
        dir: exe.parent().map(|d| d.display().to_string()).unwrap_or_default(),
        exe: exe.display().to_string(),
        at: util::unix(),
        ..Default::default()
    }
}

/// Puts Komora into the library unless the user removed it; keeps its installed version current.
pub fn ensure() {
    library::update(|l| {
        if l.removed.contains_key(ID) {
            return;
        }
        if !l.apps.iter().any(|a| a.id == ID) {
            l.apps.push(app());
        }
        if let Some(a) = l.apps.iter_mut().find(|a| a.id == ID) {
            a.inst = Some(installed());
            a.want = false;
        }
    });
}

/// (worker) Downloads the release's Komora-<version>.exe and swaps it for the running exe, then
/// starts it; the caller quits this process when it returns Ok.
pub fn update(rel: &Release, progress: &mut dyn FnMut(&str, f32)) -> Result<(), String> {
    let asset = rel
        .assets
        .iter()
        .find(|a| {
            let n = a.name.to_ascii_lowercase();
            n.starts_with("komora") && n.ends_with(".exe")
        })
        .ok_or("the release has no Komora exe")?;
    let exe = exe().ok_or("cannot find the running exe")?;
    let tmp = util::downloads_dir().join(format!("komora-update-{}.exe", util::unix_ms()));
    progress("download", 0.0);
    net::download(&asset.url, &tmp, 200 << 20, |n, total| {
        if total > 0 {
            progress("download", n as f32 / total as f32);
        }
    })?;
    progress("verify", -1.0);
    let ok = std::fs::read(&tmp).map(|b| b.len() > 1 << 20 && b.starts_with(b"MZ")).unwrap_or(false);
    if !ok || trust::check(&tmp).0 == "bad" {
        let _ = std::fs::remove_file(&tmp);
        return Err("the downloaded file is not a valid Komora exe".into());
    }
    if let Some(d) = asset.digest.strip_prefix("sha256:") {
        let got = crate::install::sha256(&tmp)?;
        if !got.eq_ignore_ascii_case(d) {
            let _ = std::fs::remove_file(&tmp);
            return Err("checksum mismatch".into());
        }
    }
    progress("install", -1.0);
    // the running exe cannot be overwritten, but it can be renamed
    let old = old_of(&exe);
    let _ = std::fs::remove_file(&old);
    std::fs::rename(&exe, &old).map_err(|e| format!("cannot replace Komora.exe: {e}"))?;
    if let Err(e) = std::fs::rename(&tmp, &exe).or_else(|_| std::fs::copy(&tmp, &exe).map(|_| ())) {
        let _ = std::fs::rename(&old, &exe);
        let _ = std::fs::remove_file(&tmp);
        return Err(format!("cannot replace Komora.exe: {e}"));
    }
    let _ = std::fs::remove_file(&tmp);
    if let Err(e) = std::process::Command::new(&exe).arg("--after-update").arg(std::process::id().to_string()).spawn() {
        let _ = std::fs::remove_file(&exe);
        let _ = std::fs::rename(&old, &exe);
        return Err(format!("cannot start the new Komora: {e}"));
    }
    logf!("self-update to {}", rel.tag);
    Ok(())
}

/// (start, before the single-instance check) `--after-update <pid>`: waits for the previous
/// process to end (at most 15 s). Returns whether the window should open.
pub fn after_update() -> bool {
    let args: Vec<String> = std::env::args().collect();
    let Some(i) = args.iter().position(|a| a == "--after-update") else { return false };
    if let Some(pid) = args.get(i + 1).and_then(|p| p.parse::<u32>().ok()) {
        unsafe {
            if let Ok(h) = OpenProcess(PROCESS_SYNCHRONIZE, false, pid) {
                if WaitForSingleObject(h, 15_000) != WAIT_OBJECT_0 {
                    logf!("after update: the previous Komora is still running");
                }
                let _ = CloseHandle(h);
            }
        }
    }
    true
}

/// Removes the exe an update left behind.
pub fn clean_old() {
    if let Some(e) = exe() {
        let old = old_of(&e);
        if old.exists() {
            let _ = std::fs::remove_file(old);
        }
    }
}
