//! Backups of the apps' own settings: folders (copied, caches and logs left out) and registry keys
//! (reg export), into %APPDATA%\Komora\backups\<app>\<time>. The last five are kept; a restore copies
//! the newest back and imports its .reg files.

use std::{
    os::windows::process::CommandExt,
    path::{Path, PathBuf},
};

use serde::{Deserialize, Serialize};
use serde_json::{Value, json};

use crate::{library::App, util};

/// Folders that only hold caches, logs and the downloaded parts of an embedded browser (WebView2, Electron,
/// Chromium): never backed up. The browser's own settings (Local Storage, IndexedDB, Preferences) are kept.
const SKIP_DIRS: &[&str] = &[
    "cache", "caches", "code cache", "gpucache", "shadercache", "crashpad", "crashes", "logs", "log", "temp", "tmp", "blob_storage",
    "grshadercache", "graphitedawncache", "dawncache", "dawngraphitecache", "dawnwebgpucache", "component_crx_cache", "widevinecdm",
    "subresource filter", "hyphen-data", "speech recognition", "optimization_guide_model_store", "safe browsing", "origintrials",
    "pkimetadata", "zxcvbndata", "meipreload", "edge wallet", "trusttokenkeycommitments", "certificaterevocation", "sslerrorassistant",
    "filetypepolicies", "autolaunchprotocolscomponent", "pnacl", "cachestorage", "scriptcache", "service worker", "webstorage",
    "segmentation_platform", "edgeedrop", "ondeviceheadsuggestmodel", "wasmttscache", "first party sets",
];

/// Log and temporary files: not settings, and their changes do not ask for a new backup.
fn skip_file(name: &str) -> bool {
    let n = name.to_lowercase();
    n.ends_with(".log") || n.ends_with(".tmp") || n.ends_with(".old") || n == "log.txt" || n == "crash.txt" || n.starts_with("debug.log") || n == "lockfile" || n == "lock"
}

fn skip_dir(name: &str) -> bool {
    SKIP_DIRS.contains(&name.to_lowercase().as_str())
}
const MAX_BYTES: u64 = 500 << 20;
const KEEP: usize = 5;

#[derive(Serialize, Deserialize, Default)]
#[serde(default)]
struct Manifest {
    app: String,
    at: i64,
    /// (folder name inside the backup, original path)
    dirs: Vec<(String, String)>,
    /// (file name inside the backup, registry key)
    regs: Vec<(String, String)>,
}

fn root() -> PathBuf {
    util::data_dir().join("backups")
}

/// The folder name of an app's backups.
pub fn folder_of(id: &str) -> String {
    util::safe_name(&id.replace([':', '/'], "_"))
}

fn app_root(id: &str) -> PathBuf {
    root().join(folder_of(id))
}

fn env(name: &str) -> PathBuf {
    PathBuf::from(std::env::var(name).unwrap_or_default())
}

/// Where the app probably keeps its settings (existing folders and keys only).
pub fn suggest(app: &App) -> (Vec<String>, Vec<String>) {
    let mut names: Vec<String> = [app.name.clone(), app.repo.clone(), app.owner.clone()].into_iter().filter(|n| n.len() >= 3).collect();
    names.dedup();
    let mut dirs = Vec::new();
    for base in [env("APPDATA"), env("LOCALAPPDATA"), env("USERPROFILE").join("Documents")] {
        for n in &names {
            for cand in [base.join(n), base.join(n.to_lowercase())] {
                let c = cand.display().to_string();
                if cand.is_dir() && !dirs.iter().any(|d: &String| d.eq_ignore_ascii_case(&c)) {
                    dirs.push(c);
                }
            }
        }
    }
    for n in &names {
        let dot = env("USERPROFILE").join(format!(".{}", n.to_lowercase()));
        if dot.is_dir() && !dirs.iter().any(|d| d.eq_ignore_ascii_case(&dot.display().to_string())) {
            dirs.push(dot.display().to_string());
        }
    }
    // a portable app keeps its settings next to itself
    if let Some(i) = app.inst.as_ref().filter(|i| i.method == "portable" && Path::new(&i.dir).is_dir()) {
        dirs.push(i.dir.clone());
    }
    let mut regs = Vec::new();
    let reg_cands: Vec<String> = names.iter().map(|n| format!(r"HKCU\Software\{n}")).chain(std::iter::once(format!(r"HKCU\Software\{}\{}", app.owner, app.name))).collect();
    for k in reg_cands {
        if reg_exists(&k) && !regs.contains(&k) {
            regs.push(k);
        }
    }
    (dirs, regs)
}

fn reg_exists(key: &str) -> bool {
    std::process::Command::new("reg.exe").args(["query", key]).creation_flags(0x0800_0000).output().is_ok_and(|o| o.status.success())
}

fn dir_size(p: &Path) -> u64 {
    let Ok(rd) = std::fs::read_dir(p) else { return 0 };
    rd.flatten()
        .map(|e| {
            let skip = e.file_type().is_ok_and(|t| t.is_dir()) && skip_dir(&e.file_name().to_string_lossy());
            if skip {
                0
            } else if e.file_type().is_ok_and(|t| t.is_dir()) {
                dir_size(&e.path())
            } else if skip_file(&e.file_name().to_string_lossy()) {
                0
            } else {
                e.metadata().map(|m| m.len()).unwrap_or(0)
            }
        })
        .sum()
}

fn copy_tree(from: &Path, to: &Path) -> std::io::Result<()> {
    std::fs::create_dir_all(to)?;
    for e in std::fs::read_dir(from)? {
        let e = e?;
        let name = e.file_name();
        if e.file_type()?.is_dir() {
            if skip_dir(&name.to_string_lossy()) {
                continue;
            }
            copy_tree(&e.path(), &to.join(&name))?;
        } else if skip_file(&name.to_string_lossy()) {
            continue;
        } else if let Err(err) = std::fs::copy(e.path(), to.join(&name)) {
            // a file the running app keeps locked: the rest is still worth having
            crate::logf!("backup: {} skipped ({err})", e.path().display());
        }
    }
    Ok(())
}

/// The newest change time among the chosen folders (caches and logs left out); 0 — nothing there.
fn newest(p: &Path) -> i64 {
    let mt = |m: &std::fs::Metadata| m.modified().ok().and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok()).map(|d| d.as_secs() as i64).unwrap_or(0);
    let Ok(md) = std::fs::metadata(p) else { return 0 };
    if !md.is_dir() {
        return mt(&md);
    }
    let Ok(rd) = std::fs::read_dir(p) else { return 0 };
    rd.flatten()
        .map(|e| {
            let dir = e.file_type().is_ok_and(|t| t.is_dir());
            if dir && skip_dir(&e.file_name().to_string_lossy()) {
                0
            } else if dir {
                newest(&e.path())
            } else if skip_file(&e.file_name().to_string_lossy()) {
                0
            } else {
                e.metadata().map(|m| mt(&m)).unwrap_or(0)
            }
        })
        .max()
        .unwrap_or(0)
}

/// Whether the chosen folders changed after the last backup (registry keys are not watched).
pub fn changed_since(app: &App, at: i64) -> bool {
    app.bpaths.iter().any(|p| newest(Path::new(p)) > at)
}

/// Settings folders and keys to start with: the suggestions without the folder of a portable app
/// (it holds the app itself, too big to copy five times).
pub fn initial(app: &App) -> (Vec<String>, Vec<String>) {
    let (mut dirs, regs) = suggest(app);
    if let Some(i) = app.inst.as_ref().filter(|i| i.method == "portable") {
        dirs.retain(|d| d != &i.dir);
    }
    (dirs, regs)
}

fn stamp() -> String {
    let t = util::unix();
    format!("{t}")
}

/// (worker) Backs up the app's chosen folders and keys; the backup folder.
pub fn backup(app: &App) -> Result<PathBuf, String> {
    if app.bpaths.is_empty() && app.breg.is_empty() {
        return Err("choose what to back up first".into());
    }
    let total: u64 = app.bpaths.iter().map(|p| dir_size(Path::new(p))).sum();
    if total > MAX_BYTES {
        return Err(format!("too much data: {} MB (at most {} MB)", total >> 20, MAX_BYTES >> 20));
    }
    let dest = app_root(&app.id).join(stamp());
    std::fs::create_dir_all(&dest).map_err(|e| e.to_string())?;
    let mut m = Manifest { app: app.id.clone(), at: util::unix(), ..Default::default() };
    for (i, p) in app.bpaths.iter().enumerate() {
        let src = Path::new(p);
        if !src.exists() {
            continue;
        }
        let name = format!("dir{i}");
        if src.is_dir() {
            copy_tree(src, &dest.join(&name)).map_err(|e| format!("{p}: {e}"))?;
        } else {
            std::fs::create_dir_all(dest.join(&name)).map_err(|e| e.to_string())?;
            std::fs::copy(src, dest.join(&name).join(src.file_name().unwrap_or_default())).map_err(|e| format!("{p}: {e}"))?;
        }
        m.dirs.push((name, p.clone()));
    }
    for (i, k) in app.breg.iter().enumerate() {
        let file = format!("reg{i}.reg");
        let ok = std::process::Command::new("reg.exe").args(["export", k]).arg(dest.join(&file)).arg("/y").creation_flags(0x0800_0000).output().is_ok_and(|o| o.status.success());
        if ok {
            m.regs.push((file, k.clone()));
        }
    }
    std::fs::write(dest.join("manifest.json"), serde_json::to_string_pretty(&m).unwrap_or_default()).map_err(|e| e.to_string())?;
    // the oldest go
    let mut all = list_dirs(&app.id);
    while all.len() > KEEP {
        let old = all.remove(0);
        let _ = std::fs::remove_dir_all(old);
    }
    crate::logf!("backup of {} into {}", app.id, dest.display());
    Ok(dest)
}

fn list_dirs(id: &str) -> Vec<PathBuf> {
    let mut v: Vec<PathBuf> = std::fs::read_dir(app_root(id)).map(|r| r.flatten().map(|e| e.path()).filter(|p| p.join("manifest.json").is_file()).collect()).unwrap_or_default();
    v.sort();
    v
}

/// The newest backup folder of every app (what a bundle carries) and their size together.
pub fn newest_all() -> (Vec<PathBuf>, u64) {
    let mut out = Vec::new();
    let Ok(rd) = std::fs::read_dir(all_dir()) else { return (out, 0) };
    for e in rd.flatten().filter(|e| e.path().is_dir()) {
        let mut v: Vec<PathBuf> = std::fs::read_dir(e.path()).map(|r| r.flatten().map(|x| x.path()).filter(|p| p.join("manifest.json").is_file()).collect()).unwrap_or_default();
        v.sort();
        if let Some(last) = v.pop() {
            out.push(last);
        }
    }
    let size = out.iter().map(|p| tree_size(p)).sum();
    (out, size)
}

fn tree_size(p: &Path) -> u64 {
    std::fs::read_dir(p).map(|rd| rd.flatten().map(|e| if e.path().is_dir() { tree_size(&e.path()) } else { e.metadata().map(|m| m.len()).unwrap_or(0) }).sum()).unwrap_or(0)
}

/// The backups of an app: newest first.
pub fn list(id: &str) -> Value {
    let mut out: Vec<Value> = list_dirs(id)
        .into_iter()
        .filter_map(|d| {
            let m: Manifest = serde_json::from_str(&std::fs::read_to_string(d.join("manifest.json")).ok()?).ok()?;
            Some(json!({ "at": m.at, "dir": d.file_name()?.to_string_lossy(), "size": dir_size(&d), "dirs": m.dirs.len(), "regs": m.regs.len() }))
        })
        .collect();
    out.reverse();
    Value::Array(out)
}

/// (worker) Puts a backup back: folders copied over the originals, .reg files imported.
pub fn restore(app: &App, which: &str) -> Result<(), String> {
    let all = list_dirs(&app.id);
    let d = if which.is_empty() { all.last().cloned() } else { all.into_iter().find(|p| p.file_name().is_some_and(|n| n == which)) }.ok_or("no backup")?;
    let m: Manifest = serde_json::from_str(&std::fs::read_to_string(d.join("manifest.json")).map_err(|e| e.to_string())?).map_err(|e| e.to_string())?;
    for (name, orig) in &m.dirs {
        let src = d.join(name);
        let dst = Path::new(orig);
        if dst.extension().is_some() && !dst.is_dir() && src.is_dir() {
            // a single file was backed up
            if let Some(f) = std::fs::read_dir(&src).ok().and_then(|mut r| r.next()).and_then(Result::ok) {
                std::fs::copy(f.path(), dst).map_err(|e| format!("{orig}: {e}"))?;
            }
        } else {
            copy_tree(&src, dst).map_err(|e| format!("{orig}: {e}"))?;
        }
    }
    for (file, _) in &m.regs {
        let ok = std::process::Command::new("reg.exe").arg("import").arg(d.join(file)).creation_flags(0x0800_0000).output().is_ok_and(|o| o.status.success());
        if !ok {
            return Err(format!("the registry was not restored ({file})"));
        }
    }
    crate::logf!("restored {} from {}", app.id, d.display());
    Ok(())
}

/// All backups (the bundle for another PC carries them).
pub fn all_dir() -> PathBuf {
    root()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn skipped_files_and_folders() {
        assert!(super::skip_file("log.txt") && super::skip_file("Arcmix.LOG") && !super::skip_file("config.json"));
        assert!(super::skip_dir("GrShaderCache") && super::skip_dir("WidevineCdm") && !super::skip_dir("Local Storage"));
    }

    #[test]
    fn backup_and_restore() {
        let base = std::env::temp_dir().join(format!("komora-bk-{}", util::unix_ms()));
        let cfg = base.join("cfg");
        std::fs::create_dir_all(cfg.join("Cache")).unwrap();
        std::fs::write(cfg.join("settings.ini"), "a=1").unwrap();
        std::fs::write(cfg.join("Cache").join("big.bin"), "zzz").unwrap();
        let app = App { id: format!("test:{}", util::unix_ms()), bpaths: vec![cfg.display().to_string()], ..Default::default() };
        let dest = backup(&app).unwrap();
        assert!(dest.join("dir0").join("settings.ini").is_file());
        assert!(!dest.join("dir0").join("Cache").exists(), "caches are left out");
        std::fs::write(cfg.join("settings.ini"), "a=2").unwrap();
        restore(&app, "").unwrap();
        assert_eq!(std::fs::read_to_string(cfg.join("settings.ini")).unwrap(), "a=1");
        let _ = std::fs::remove_dir_all(app_root(&app.id));
        let _ = std::fs::remove_dir_all(base);
    }
}
