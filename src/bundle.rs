//! Moving the library between PCs: a bundle file (library, groups, tweaks; with the settings backups
//! as a zip) and sync — a file in a cloud folder (OneDrive, Google Drive, Dropbox…) or a secret GitHub
//! Gist. Merging takes, per app and per group, the side the user changed last; removals travel too.
//! What is installed is not copied (it is this PC's state): apps installed elsewhere are offered here.

use std::{
    os::windows::process::CommandExt,
    path::{Path, PathBuf},
    sync::Mutex,
};

use serde::{Deserialize, Serialize};
use serde_json::{Value, json};

use crate::{
    config,
    library::{self, App, Author, Group, Library},
    logf, net, tweaks, util,
};

const SYNC_FILE: &str = "komora-sync.json";

#[derive(Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase", default)]
pub struct Bundle {
    pub kind: String,
    pub v: u32,
    pub at: i64,
    pub pc: String,
    pub apps: Vec<App>,
    pub groups: Vec<Group>,
    pub removed: std::collections::BTreeMap<String, i64>,
    pub authors: Vec<Author>,
    /// tweaks applied on the PC it came from, and the user's own tweaks
    pub tweaks: Vec<String>,
    pub custom: Vec<tweaks::Custom>,
}

fn pc() -> String {
    std::env::var("COMPUTERNAME").unwrap_or_default()
}

/// The library as it travels: no state of this PC (installed files, caches, errors).
pub fn make() -> Bundle {
    let lib = library::get();
    let ts = tweaks::state();
    Bundle {
        kind: "komora".into(),
        v: 1,
        at: util::unix(),
        pc: pc(),
        apps: lib
            .apps
            .into_iter()
            .map(|mut a| {
                a.was_installed |= a.inst.is_some();
                a.inst = None;
                a.etag.clear();
                a.error.clear();
                a.notified.clear();
                a.checked = 0;
                a.icon.clear();
                a.icon_src.clear();
                a.preview.clear();
                if let Some(r) = a.latest.as_mut() {
                    r.notes.clear();
                }
                a
            })
            .collect(),
        groups: lib.groups,
        removed: lib.removed,
        authors: lib.authors.into_iter().map(|a| Author { news: Vec::new(), error: String::new(), ..a }).collect(),
        tweaks: ts.applied.keys().cloned().collect(),
        custom: ts.custom,
    }
}

/// Merges a bundle into the library; true — something changed.
pub fn merge(l: &mut Library, b: &Bundle) -> bool {
    let mut changed = false;
    for (id, at) in &b.removed {
        let gone = l.apps.iter().position(|a| &a.id == id && a.updated.max(a.added) <= *at);
        if let Some(i) = gone {
            l.apps.remove(i);
            changed = true;
        }
        let e = l.removed.entry(id.clone()).or_insert(0);
        if *e < *at {
            *e = *at;
        }
    }
    for r in &b.apps {
        if l.removed.get(&r.id).is_some_and(|at| *at >= r.updated.max(r.added)) {
            continue;
        }
        match l.apps.iter_mut().find(|a| a.id == r.id) {
            None => {
                let mut n = r.clone();
                n.inst = None;
                l.apps.push(n);
                l.removed.remove(&r.id);
                changed = true;
            }
            Some(a) => {
                if r.was_installed && !a.was_installed {
                    a.was_installed = true;
                    changed = true;
                }
                if r.updated > a.updated {
                    a.name = r.name.clone();
                    a.groups = r.groups.clone();
                    a.tags = r.tags.clone();
                    a.notes = r.notes.clone();
                    a.method = r.method.clone();
                    a.pin = r.pin.clone();
                    a.skip = r.skip.clone();
                    a.pre = r.pre;
                    a.asset_match = r.asset_match.clone();
                    a.bpaths = r.bpaths.clone();
                    a.breg = r.breg.clone();
                    a.kit = r.kit;
                    a.setup_dir = r.setup_dir.clone();
                    a.updated = r.updated;
                    changed = true;
                }
            }
        }
    }
    for g in &b.groups {
        match l.groups.iter_mut().find(|x| x.id == g.id) {
            None => {
                l.groups.push(g.clone());
                changed = true;
            }
            Some(x) if g.updated > x.updated => {
                *x = g.clone();
                changed = true;
            }
            _ => {}
        }
    }
    // followed authors: removals are kept in `removed` as "au:<login>"
    for (id, at) in &b.removed {
        if let Some(login) = id.strip_prefix("au:") {
            let before = l.authors.len();
            l.authors.retain(|x| !(x.login.eq_ignore_ascii_case(login) && x.updated.max(x.added) <= *at));
            changed |= l.authors.len() != before;
        }
    }
    for r in &b.authors {
        let key = format!("au:{}", r.login.to_ascii_lowercase());
        if l.removed.get(&key).is_some_and(|at| *at >= r.updated.max(r.added)) {
            continue;
        }
        if !l.authors.iter().any(|x| x.login.eq_ignore_ascii_case(&r.login)) {
            l.authors.push(Author { news: Vec::new(), ..r.clone() });
            l.removed.remove(&key);
            changed = true;
        }
    }
    changed
}

fn merge_tweaks(b: &Bundle) {
    if b.custom.is_empty() {
        return;
    }
    tweaks::update(|s| {
        for c in &b.custom {
            if !s.custom.iter().any(|x| x.id == c.id) {
                s.custom.push(c.clone());
            }
        }
    });
}

// ---------------------------------------------------------------- bundle files

fn tar() -> PathBuf {
    PathBuf::from(std::env::var("SystemRoot").unwrap_or_else(|_| r"C:\Windows".into())).join(r"System32\tar.exe")
}

/// Writes the bundle; a .zip also carries Komora.exe itself (unpack it on a new PC, start Komora.exe and
/// open the same zip) and the newest settings backup of the kit's apps — of every app `with_backups`.
/// `kit_only`: just «My kit» and the groups it uses.
pub fn export(path: &str, with_backups: bool, kit_only: bool) -> Result<(), String> {
    let mut b = make();
    if kit_only {
        b.apps.retain(|a| a.kit);
        let used: std::collections::HashSet<&String> = b.apps.iter().flat_map(|a| a.groups.iter()).collect();
        b.groups.retain(|g| used.contains(&g.id));
    }
    let keep: std::collections::HashSet<String> = b.apps.iter().filter(|a| with_backups || a.kit).map(|a| crate::backup::folder_of(&a.id)).collect();
    let json = serde_json::to_string_pretty(&b).map_err(|e| e.to_string())?;
    if !path.to_ascii_lowercase().ends_with(".zip") {
        return std::fs::write(path, json).map_err(|e| e.to_string());
    }
    let tmp = std::env::temp_dir().join(format!("komora-export-{}", util::unix_ms()));
    std::fs::create_dir_all(&tmp).map_err(|e| e.to_string())?;
    std::fs::write(tmp.join("komora.json"), json).map_err(|e| e.to_string())?;
    let with_exe = std::env::current_exe().ok().is_some_and(|e| std::fs::copy(e, tmp.join("Komora.exe")).is_ok());
    let _ = std::fs::remove_file(path);
    let mut cmd = std::process::Command::new(tar());
    cmd.args(["-a", "-c", "-f"]).arg(path).arg("-C").arg(&tmp).arg("komora.json");
    if with_exe {
        cmd.arg("Komora.exe");
    }
    let (list, _) = crate::backup::newest_all();
    let mut any = false;
    for src in &list {
        let (Some(app), Some(stamp)) = (src.parent().and_then(|p| p.file_name()), src.file_name()) else { continue };
        if keep.contains(&app.to_string_lossy().to_string()) {
            copy_missing(src, &tmp.join("backups").join(app).join(stamp));
            any = true;
        }
    }
    if any {
        cmd.arg("backups");
    }
    let out = cmd.creation_flags(0x0800_0000).output().map_err(|e| e.to_string())?;
    let _ = std::fs::remove_dir_all(&tmp);
    if !out.status.success() {
        return Err(format!("cannot pack: {}", String::from_utf8_lossy(&out.stderr).trim()));
    }
    Ok(())
}

/// A bundle opened and waiting for the user's choice.
static PENDING: Mutex<Option<Bundle>> = Mutex::new(None);

const SHARE_FILE: &str = "komora-share.json";

/// Some apps and links (empty — all) as a secret Gist; its link for anyone to open in Komora.
pub fn share(ids: &[String]) -> Result<String, String> {
    let mut b = make();
    if !ids.is_empty() {
        b.apps.retain(|a| ids.contains(&a.id));
    }
    let used: std::collections::HashSet<&String> = b.apps.iter().flat_map(|a| a.groups.iter()).collect();
    b.groups.retain(|g| used.contains(&g.id));
    b.removed.clear();
    b.authors.clear();
    b.tweaks.clear();
    b.custom.clear();
    for a in &mut b.apps {
        a.notes.clear();
        a.kit = false;
    }
    let text = serde_json::to_string(&b).map_err(|e| e.to_string())?;
    let n = b.apps.len();
    let body = json!({ "description": format!("Komora · {n}"), "public": false, "files": { SHARE_FILE: { "content": text } } }).to_string();
    let r = net::github_send("POST", "/gists", "application/vnd.github+json", "", body.as_bytes())?;
    match r.status {
        201 => {}
        401 | 403 | 404 => return Err("the token cannot use Gists — give it the Gists permission".into()),
        s => return Err(format!("GitHub answered HTTP {s}")),
    }
    let v: Value = serde_json::from_slice(&r.body).map_err(|e| e.to_string())?;
    v.get("html_url").and_then(Value::as_str).map(String::from).ok_or_else(|| "GitHub gave no link".into())
}

/// The id of a Gist link (gist.github.com/<user>/<id> or /<id>).
pub fn gist_id_of(url: &str) -> Option<String> {
    let rest = url.trim().trim_end_matches('/').split("gist.github.com/").nth(1)?;
    let id = rest.split(['/', '#', '?']).filter(|s| !s.is_empty()).last()?;
    id.chars().all(|c| c.is_ascii_hexdigit()).then(|| id.to_string()).filter(|s| s.len() >= 20)
}

/// A shared Gist (a secret Gist opens by its id, no token needed) as a bundle preview.
pub fn open_shared(url: &str) -> Result<Value, String> {
    let id = gist_id_of(url).ok_or("not a Gist link")?;
    let r = net::github(&format!("/gists/{id}"), "application/vnd.github+json", "")?;
    if r.status != 200 {
        return Err(format!("GitHub answered HTTP {}", r.status));
    }
    let v: Value = serde_json::from_slice(&r.body).map_err(|e| e.to_string())?;
    let files = v.get("files").ok_or("not a Komora bundle")?;
    let f = files.get(SHARE_FILE).or_else(|| files.get(SYNC_FILE)).ok_or("not a Komora bundle")?;
    let text = if f.get("truncated").and_then(Value::as_bool) == Some(true) {
        let raw = f.get("raw_url").and_then(Value::as_str).unwrap_or_default();
        String::from_utf8_lossy(&net::get(raw, &[], 32 << 20)?.body).into_owned()
    } else {
        f.get("content").and_then(Value::as_str).unwrap_or_default().to_string()
    };
    let b: Bundle = serde_json::from_str(&text).map_err(|_| "not a Komora bundle".to_string())?;
    pending(b)
}

/// Reads a bundle (a .zip: its backups join the local ones); a preview for the page.
pub fn open(path: &str) -> Result<Value, String> {
    let b: Bundle = if path.to_ascii_lowercase().ends_with(".zip") {
        let tmp = std::env::temp_dir().join(format!("komora-import-{}", util::unix_ms()));
        std::fs::create_dir_all(&tmp).map_err(|e| e.to_string())?;
        let out = std::process::Command::new(tar()).arg("-xf").arg(path).arg("-C").arg(&tmp).creation_flags(0x0800_0000).output().map_err(|e| e.to_string())?;
        if !out.status.success() {
            return Err(format!("cannot unpack: {}", String::from_utf8_lossy(&out.stderr).trim()));
        }
        let b = serde_json::from_str(&std::fs::read_to_string(tmp.join("komora.json")).map_err(|_| "not a Komora bundle".to_string())?).map_err(|e| e.to_string())?;
        if tmp.join("backups").is_dir() {
            copy_missing(&tmp.join("backups"), &crate::backup::all_dir());
        }
        let _ = std::fs::remove_dir_all(&tmp);
        b
    } else {
        serde_json::from_str(&std::fs::read_to_string(path).map_err(|e| e.to_string())?).map_err(|_| "not a Komora bundle".to_string())?
    };
    pending(b)
}

/// Keeps an opened bundle for the user's choice; the preview for the page.
fn pending(b: Bundle) -> Result<Value, String> {
    if b.kind != "komora" {
        return Err("not a Komora bundle".into());
    }
    let lib = library::get();
    let preview = json!({
        "pc": b.pc, "at": b.at,
        "apps": b.apps.iter().map(|a| json!({ "id": a.id, "name": a.name, "kind": a.kind, "was": a.was_installed, "here": lib.apps.iter().any(|x| x.id == a.id && x.inst.is_some()), "inLib": lib.apps.iter().any(|x| x.id == a.id) })).collect::<Vec<_>>(),
        "tweaks": b.tweaks,
        "groups": b.groups.len(),
    });
    *PENDING.lock().unwrap() = Some(b);
    Ok(preview)
}

fn copy_missing(from: &Path, to: &Path) {
    let _ = std::fs::create_dir_all(to);
    let Ok(rd) = std::fs::read_dir(from) else { return };
    for e in rd.flatten() {
        let dst = to.join(e.file_name());
        if e.path().is_dir() {
            copy_missing(&e.path(), &dst);
        } else if !dst.exists() {
            let _ = std::fs::copy(e.path(), &dst);
        }
    }
}

/// Merges the opened bundle into the library (the page then installs and applies what was chosen).
pub fn accept() -> Result<(), String> {
    let b = PENDING.lock().unwrap().take().ok_or("open a bundle first")?;
    library::update(|l| merge(l, &b));
    merge_tweaks(&b);
    Ok(())
}

// ---------------------------------------------------------------- sync

#[derive(Default, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SyncStatus {
    pub ok_at: i64,
    pub err: String,
}

pub static STATUS: Mutex<SyncStatus> = Mutex::new(SyncStatus { ok_at: 0, err: String::new() });

fn set_status(r: &Result<bool, String>) {
    let mut s = STATUS.lock().unwrap();
    match r {
        Ok(_) => {
            s.ok_at = util::unix();
            s.err.clear();
        }
        Err(e) => s.err = e.clone(),
    }
}

fn gist_read(id: &str) -> Result<Option<Bundle>, String> {
    let r = net::github(&format!("/gists/{id}"), "application/vnd.github+json", "")?;
    match r.status {
        200 => {}
        404 => return Ok(None),
        401 | 403 => return Err("the token cannot use Gists — give it the Gists permission".into()),
        s => return Err(format!("GitHub answered HTTP {s}")),
    }
    let v: Value = serde_json::from_slice(&r.body).map_err(|e| e.to_string())?;
    let f = v.get("files").and_then(|f| f.get(SYNC_FILE)).ok_or("no sync file in the Gist")?;
    let text = if f.get("truncated").and_then(Value::as_bool) == Some(true) {
        let raw = f.get("raw_url").and_then(Value::as_str).unwrap_or_default();
        String::from_utf8_lossy(&net::get(raw, &[], 32 << 20)?.body).into_owned()
    } else {
        f.get("content").and_then(Value::as_str).unwrap_or_default().to_string()
    };
    Ok(serde_json::from_str(&text).ok())
}

/// The user's Gist Komora synced through before (another PC created it); "" — none yet.
fn gist_find() -> Result<String, String> {
    let r = net::github("/gists?per_page=100", "application/vnd.github+json", "")?;
    match r.status {
        200 => {}
        401 | 403 => return Err("the token cannot use Gists — give it the Gists permission".into()),
        s => return Err(format!("GitHub answered HTTP {s}")),
    }
    let v: Value = serde_json::from_slice(&r.body).map_err(|e| e.to_string())?;
    Ok(v.as_array().and_then(|a| a.iter().find(|g| g.get("files").and_then(|f| f.get(SYNC_FILE)).is_some())).and_then(|g| g.get("id")?.as_str().map(String::from)).unwrap_or_default())
}

fn gist_write(id: &str, text: &str) -> Result<String, String> {
    let body = json!({ "description": "Komora sync", "public": false, "files": { SYNC_FILE: { "content": text } } }).to_string();
    let (method, path) = if id.is_empty() { ("POST", "/gists".to_string()) } else { ("PATCH", format!("/gists/{id}")) };
    let r = net::github_send(method, &path, "application/vnd.github+json", "", body.as_bytes())?;
    match r.status {
        200 | 201 => {}
        401 | 403 | 404 => return Err("the token cannot use Gists — give it the Gists permission".into()),
        s => return Err(format!("GitHub answered HTTP {s}")),
    }
    let v: Value = serde_json::from_slice(&r.body).map_err(|e| e.to_string())?;
    Ok(v.get("id").and_then(Value::as_str).unwrap_or(id).to_string())
}

/// (worker) One round of sync: the remote copy merged in when it is newer and from another PC, then
/// this library written back when it changed since the last write. Ok(true) — the library changed.
pub fn sync_now(gist: bool) -> Result<bool, String> {
    let c = config::get();
    let use_dir = !c.sync_dir.trim().is_empty();
    let use_gist = gist && c.sync_gist && !config::token().is_empty();
    let use_dbx = gist && c.sync_dbx && crate::dropbox::connected();
    if !use_dir && !use_gist && !use_dbx {
        return Ok(false);
    }
    let res = (|| {
        let mut c = c.clone();
        if use_gist && c.gist_id.is_empty() {
            let id = gist_find()?;
            if !id.is_empty() {
                config::update(|x| x.gist_id = id.clone());
                c.gist_id = id;
            }
        }
        let remote: Option<Bundle> = if use_gist && !c.gist_id.is_empty() {
            gist_read(&c.gist_id)?
        } else if use_dbx {
            crate::dropbox::read()?.and_then(|s| serde_json::from_str(&s).ok())
        } else if use_dir {
            let p = Path::new(c.sync_dir.trim()).join(SYNC_FILE);
            std::fs::read_to_string(&p).ok().and_then(|s| serde_json::from_str(&s).ok())
        } else {
            None
        };
        let mut changed = false;
        if let Some(b) = remote.as_ref().filter(|b| b.at > c.sync_seen && b.pc != pc()) {
            changed = library::update(|l| merge(l, b));
            merge_tweaks(b);
            config::update(|x| x.sync_seen = b.at);
            if changed {
                logf!("sync: merged changes from {}", b.pc);
            }
        }
        let lib_time = std::fs::metadata(util::data_dir().join("library.json")).and_then(|m| m.modified()).ok().and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok()).map(|d| d.as_secs() as i64).unwrap_or(0);
        if changed || lib_time > c.sync_wrote || remote.is_none() {
            let b = make();
            let text = serde_json::to_string(&b).map_err(|e| e.to_string())?;
            if use_gist {
                let id = gist_write(&c.gist_id, &text)?;
                if id != c.gist_id {
                    config::update(|x| x.gist_id = id);
                }
            }
            if use_dbx {
                crate::dropbox::write(&text)?;
            }
            if use_dir {
                let p = Path::new(c.sync_dir.trim()).join(SYNC_FILE);
                let tmp = p.with_extension("tmp");
                std::fs::write(&tmp, &text).and_then(|_| std::fs::rename(&tmp, &p)).map_err(|e| format!("{}: {e}", p.display()))?;
            }
            config::update(|x| {
                x.sync_wrote = util::unix();
                x.sync_seen = x.sync_seen.max(b.at);
            });
        }
        Ok(changed)
    })();
    set_status(&res);
    res
}

/// Cloud folders found on this PC (for a one-click choice).
pub fn cloud_dirs() -> Vec<(String, String)> {
    let home = PathBuf::from(std::env::var("USERPROFILE").unwrap_or_default());
    let mut out = Vec::new();
    for (name, p) in [
        ("OneDrive", std::env::var("OneDrive").map(PathBuf::from).unwrap_or_else(|_| home.join("OneDrive"))),
        ("Google Drive", home.join("Google Drive").join("My Drive")),
        ("Google Drive", PathBuf::from(r"G:\My Drive")),
        ("Google Drive", PathBuf::from(r"G:\Мій диск")),
        ("Dropbox", home.join("Dropbox")),
        ("iCloud Drive", home.join("iCloudDrive")),
        ("MEGA", home.join("MEGA")),
    ] {
        if p.is_dir() && !out.iter().any(|(_, x): &(String, String)| x == &p.display().to_string()) {
            out.push((name.to_string(), p.join("Komora").display().to_string()));
        }
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    fn app(id: &str, updated: i64, tags: &[&str]) -> App {
        App { id: id.into(), added: 1, updated, tags: tags.iter().map(|s| s.to_string()).collect(), ..Default::default() }
    }

    #[test]
    fn gist_links() {
        assert_eq!(super::gist_id_of("https://gist.github.com/someone/0123456789abcdef0123456789abcdef").as_deref(), Some("0123456789abcdef0123456789abcdef"));
        assert_eq!(super::gist_id_of("gist.github.com/0123456789abcdef0123/"), Some("0123456789abcdef0123".into()));
        assert_eq!(super::gist_id_of("https://github.com/a/b"), None);
    }

    #[test]
    fn merging() {
        let mut l = Library { apps: vec![app("a", 10, &["old"]), app("b", 10, &[]), app("c", 30, &[])], ..Default::default() };
        let mut b = Bundle { apps: vec![app("a", 20, &["new"]), app("d", 5, &[]), app("c", 20, &["stale"])], ..Default::default() };
        b.removed.insert("b".into(), 15);
        assert!(merge(&mut l, &b));
        let ids: Vec<&str> = l.apps.iter().map(|a| a.id.as_str()).collect();
        assert_eq!(ids, ["a", "c", "d"], "b removed elsewhere later than changed here");
        assert_eq!(l.apps[0].tags, ["new"], "the newer change wins");
        assert!(l.apps[1].tags.is_empty(), "the local newer change stays");
        assert!(!merge(&mut l, &b), "nothing new the second time");
        let mut l2 = Library::default();
        l2.removed.insert("d".into(), 50);
        merge(&mut l2, &b);
        assert!(!l2.apps.iter().any(|a| a.id == "d"), "removed here after it changed there");
    }
}
