//! The library: apps and links, the user's groups, tags and notes, what is installed and the latest
//! releases. Kept in %APPDATA%\Komora\library.json (written after every change; unknown fields kept).

use std::sync::{Mutex, OnceLock};

use serde::{Deserialize, Serialize};

use crate::{logf, util, ver};

#[derive(Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct Library {
    pub apps: Vec<App>,
    pub groups: Vec<Group>,
    /// ids removed by the user → when (sync: a removal on one PC removes on the others)
    pub removed: std::collections::BTreeMap<String, i64>,
    /// GitHub authors the user follows
    pub authors: Vec<Author>,
    #[serde(flatten)]
    pub rest: serde_json::Map<String, serde_json::Value>,
}

#[derive(Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct Group {
    pub id: String,
    pub name: String,
    /// "#rrggbb"
    pub color: String,
    /// unix time of the user's last change (sync)
    pub updated: i64,
}

/// A followed GitHub user or organisation: profile and repositories as last seen.
#[derive(Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct Author {
    pub login: String,
    pub name: String,
    pub bio: String,
    pub blog: String,
    /// avatar URL on GitHub
    pub avatar: String,
    pub org: bool,
    /// repositories in the shape of search results (gh::repo_item), most recently pushed first
    pub repos: Vec<serde_json::Value>,
    /// "owner/repo" of repositories that appeared after following, not opened yet
    pub news: Vec<String>,
    pub added: i64,
    /// unix time of the user's last change (sync)
    pub updated: i64,
    pub checked: i64,
    pub error: String,
    #[serde(flatten)]
    pub rest: serde_json::Map<String, serde_json::Value>,
}

#[derive(Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct App {
    /// "gh:owner/repo" for GitHub repositories, "ln:<n>" for other links
    pub id: String,
    pub url: String,
    /// "github" or "link"
    pub kind: String,
    pub owner: String,
    pub repo: String,
    pub name: String,
    pub desc: String,
    /// file name in www/icons ("" — none yet)
    pub icon: String,
    /// where the icon came from: "exe" (installed app), "repo" (a file of the repository), "avatar"
    /// (organisation logo), "site" (favicon of a link); "" — older libraries, checked again
    pub icon_src: String,
    /// default branch of the repository
    pub branch: String,
    /// the owner is an organisation
    pub org: bool,
    /// the repository is a fork of `parent` ("owner/repo")
    pub fork: bool,
    pub parent: String,
    pub forks: u64,
    /// ISO time of the last push (health: abandoned projects)
    pub pushed: String,
    /// offer pre-releases as updates
    pub pre: bool,
    /// the release file must contain this text ("" — chosen automatically)
    pub asset_match: String,
    /// links: "video", "product" or "page"
    pub link_kind: String,
    /// links: preview image file in www/icons
    pub preview: String,
    /// links: channel or author; shop or site name
    pub author: String,
    pub site: String,
    /// links: price of a product (0 — unknown) and its history (unix time, price)
    pub price: f64,
    pub currency: String,
    pub price_hist: Vec<(i64, f64)>,
    /// folders and registry keys of the app's own settings to back up
    pub bpaths: Vec<String>,
    pub breg: Vec<String>,
    /// unix time of the last backup
    pub backup_at: i64,
    /// the settings folders and keys were filled in once from backup::suggest (the user may have removed some)
    pub bk_auto: bool,
    /// in «My kit»: the set of apps the user wants on every PC
    pub kit: bool,
    /// languages of the repository with their share (0..1), largest first (only those of 10 % and more)
    pub langs: Vec<(String, f64)>,
    /// links: unix time the page answered 404 / 410 (0 — it opens)
    pub dead: i64,
    /// install folder for setups of this app ("" — the common one of the settings)
    pub setup_dir: String,
    /// installed on the PC a bundle or a sync came from (offered on this PC)
    pub was_installed: bool,
    /// unix time of the user's last change (sync)
    pub updated: i64,
    pub homepage: String,
    pub stars: u64,
    pub license: String,
    pub topics: Vec<String>,
    pub archived: bool,
    /// unix time of the last metadata refresh
    pub meta_at: i64,
    /// group ids
    pub groups: Vec<String>,
    pub tags: Vec<String>,
    pub notes: String,
    /// wanted, not installed yet
    pub want: bool,
    pub added: i64,
    /// "auto", "installer" or "portable"
    pub method: String,
    /// pinned on this release tag: no updates offered
    pub pin: String,
    /// this release tag is skipped
    pub skip: String,
    pub inst: Option<Installed>,
    pub latest: Option<Release>,
    /// ETag of the latest-release answer (conditional requests)
    pub etag: String,
    pub checked: i64,
    /// the last failure of a check or an install ("" — none)
    pub error: String,
    /// the release tag a notification was already shown for
    pub notified: String,
    #[serde(flatten)]
    pub rest: serde_json::Map<String, serde_json::Value>,
}

#[derive(Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct Installed {
    /// version as Windows or the release reports it
    pub version: String,
    /// release tag installed by Komora ("" — found on the PC)
    pub tag: String,
    /// "installer", "portable" or "found"
    pub method: String,
    /// the exe to start ("" — unknown)
    pub exe: String,
    /// install folder
    pub dir: String,
    /// uninstall command of an installed app (from Windows)
    pub uninstall: String,
    /// the version kept for a rollback of a portable app ("" — none)
    pub prev: String,
    pub at: i64,
    /// signature of the installed file: "trusted", "unsigned", "bad" ("" — not checked)
    pub signed: String,
    pub signer: String,
    /// SHA-256 of the downloaded file (a VirusTotal lookup)
    pub sha256: String,
    /// the downloaded release file, kept for a VirusTotal upload ("" — none)
    pub file: String,
    /// VirusTotal: "" (not checked), "queued", "done", "unknown" (not in VirusTotal, not uploaded)
    pub vt: String,
    /// engines that flagged the file, engines that looked at it
    pub vt_hits: u32,
    pub vt_total: u32,
    pub vt_at: i64,
}

#[derive(Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct Release {
    pub tag: String,
    pub name: String,
    /// ISO date of publication
    pub date: String,
    /// release notes as HTML rendered by GitHub
    pub notes: String,
    pub url: String,
    pub prerelease: bool,
    pub assets: Vec<Asset>,
}

#[derive(Clone, Default, Serialize, Deserialize, PartialEq, Debug)]
#[serde(rename_all = "camelCase", default)]
pub struct Asset {
    pub name: String,
    pub url: String,
    pub size: u64,
    /// "sha256:<hex>" when GitHub reports it
    pub digest: String,
}

impl App {
    /// The release offered as an update, if any.
    pub fn update(&self) -> Option<&Release> {
        let (inst, rel) = (self.inst.as_ref()?, self.latest.as_ref()?);
        if !self.pin.is_empty() || rel.tag.is_empty() || rel.tag == self.skip {
            return None;
        }
        let cur = if inst.tag.is_empty() { &inst.version } else { &inst.tag };
        if cur.is_empty() || inst.tag == rel.tag {
            return None;
        }
        ver::newer(&rel.tag, cur).then_some(rel)
    }
}

static LIB: OnceLock<Mutex<Library>> = OnceLock::new();

fn cell() -> &'static Mutex<Library> {
    LIB.get_or_init(|| Mutex::new(load()))
}

fn path() -> std::path::PathBuf {
    util::data_dir().join("library.json")
}

fn load() -> Library {
    match std::fs::read_to_string(path()) {
        Ok(s) => serde_json::from_str(s.trim_start_matches('\u{feff}')).unwrap_or_else(|e| {
            // keep the unreadable file for the user instead of overwriting it
            let bad = util::data_dir().join(format!("library.bad-{}.json", util::unix()));
            let _ = std::fs::copy(path(), &bad);
            logf!("library.json unreadable ({e}), kept as {}", bad.display());
            Library::default()
        }),
        Err(_) => Library::default(),
    }
}

pub fn get() -> Library {
    cell().lock().unwrap().clone()
}

pub fn app(id: &str) -> Option<App> {
    cell().lock().unwrap().apps.iter().find(|a| a.id == id).cloned()
}

/// Changes the library and writes it.
pub fn update<R>(f: impl FnOnce(&mut Library) -> R) -> R {
    let mut g = cell().lock().unwrap();
    let r = f(&mut g);
    let tmp = path().with_extension("tmp");
    match serde_json::to_string_pretty(&*g) {
        Ok(s) if std::fs::write(&tmp, &s).is_ok() => {
            let _ = std::fs::rename(&tmp, path());
        }
        _ => logf!("library.json not written"),
    }
    r
}

/// Changes one app (no-op when it is gone, e.g. removed while a download ran).
pub fn update_app(id: &str, f: impl FnOnce(&mut App)) {
    update(|l| {
        if let Some(a) = l.apps.iter_mut().find(|a| a.id == id) {
            f(a);
        }
    });
}

/// A change the user made (synced to other PCs).
pub fn touch_app(id: &str, f: impl FnOnce(&mut App)) {
    update_app(id, |a| {
        f(a);
        a.updated = crate::util::unix();
    });
}

/// Removes apps by the user's wish (remembered for sync).
pub fn remove_apps(ids: &[String]) {
    let now = crate::util::unix();
    update(|l| {
        l.apps.retain(|a| !ids.contains(&a.id));
        for id in ids {
            l.removed.insert(id.clone(), now);
        }
    });
}

/// A new id for a link that is not a GitHub repository.
pub fn next_link_id(l: &Library) -> String {
    let n = l.apps.iter().filter_map(|a| a.id.strip_prefix("ln:")?.parse::<u64>().ok()).max().unwrap_or(0);
    format!("ln:{}", n + 1)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn app(inst: &str, tag: &str, latest: &str) -> App {
        App {
            inst: Some(Installed { version: inst.into(), tag: tag.into(), ..Default::default() }),
            latest: Some(Release { tag: latest.into(), ..Default::default() }),
            ..Default::default()
        }
    }

    #[test]
    fn updates() {
        assert!(app("17.1.0", "", "v18.0.0").update().is_some());
        assert!(app("18.0.0.12", "", "v18.0.0").update().is_none());
        assert!(app("", "v1.0", "v1.0").update().is_none(), "installed by Komora from this tag");
        assert!(app("1.0", "v1.0", "v1.1").update().is_some());
        let mut a = app("1.0", "", "v1.1");
        a.pin = "v1.0".into();
        assert!(a.update().is_none(), "pinned");
        a.pin.clear();
        a.skip = "v1.1".into();
        assert!(a.update().is_none(), "skipped");
        assert!(app("", "", "v1.1").update().is_none(), "version unknown");
    }

    #[test]
    fn unknown_fields_kept() {
        let l: Library = serde_json::from_str(r#"{"apps":[{"id":"gh:a/b","future":1}],"later":true}"#).unwrap();
        let s = serde_json::to_string(&l).unwrap();
        assert!(s.contains("\"future\":1") && s.contains("\"later\":true"));
    }
}
