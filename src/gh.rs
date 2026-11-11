//! GitHub: repository links, metadata, releases, the README rendered by GitHub, and the choice of the
//! release file for this PC.

use serde_json::Value;

use crate::{
    library::{Asset, Release},
    net,
};

const JSON: &str = "application/vnd.github+json";
/// JSON with `body_html` (release notes rendered by GitHub)
const JSON_HTML: &str = "application/vnd.github.html+json";

/// First path parts of github.com that are not owners.
const NOT_OWNERS: [&str; 14] = ["orgs", "settings", "topics", "marketplace", "sponsors", "features", "explore", "collections", "trending", "search", "notifications", "login", "about", "pricing"];

/// (owner, repo) of "https://github.com/owner/repo/…", "github.com/owner/repo" or "owner/repo".
pub fn parse_repo(s: &str) -> Option<(String, String)> {
    let s = s.trim().trim_end_matches('/');
    let rest = s.strip_prefix("https://").or_else(|| s.strip_prefix("http://")).unwrap_or(s);
    let rest = rest.strip_prefix("www.").unwrap_or(rest);
    let path = match rest.strip_prefix("github.com/") {
        Some(p) => p,
        // a bare "owner/repo"
        None if !rest.contains('.') || rest.matches('/').count() == 1 && !rest.contains(':') && !rest.split('/').next()?.contains('.') => rest,
        None => return None,
    };
    let mut it = path.split(['/', '?', '#']);
    let owner = it.next()?.trim();
    let repo = it.next()?.trim().trim_end_matches(".git");
    let ok = |x: &str| !x.is_empty() && x.chars().all(|c| c.is_ascii_alphanumeric() || "-_.".contains(c));
    if !ok(owner) || !ok(repo) || NOT_OWNERS.contains(&owner.to_ascii_lowercase().as_str()) {
        return None;
    }
    Some((owner.to_string(), repo.to_string()))
}

pub struct Meta {
    pub name: String,
    pub desc: String,
    pub homepage: String,
    pub stars: u64,
    pub license: String,
    pub topics: Vec<String>,
    pub archived: bool,
    pub avatar: String,
    /// the owner is an organisation (its avatar is usually the project's logo, a user's is a photo)
    pub org: bool,
    pub branch: String,
    pub fork: bool,
    /// "owner/repo" of the original when this is a fork
    pub parent: String,
    pub forks: u64,
    pub pushed: String,
}

fn api_json(path: &str, accept: &str) -> Result<Value, String> {
    let r = net::github(path, accept, "")?;
    match r.status {
        200 => serde_json::from_slice(&r.body).map_err(|e| e.to_string()),
        404 => Err("not found on GitHub".into()),
        403 | 429 => Err("GitHub request limit reached — add a token in Settings or try later".into()),
        s => Err(format!("GitHub answered HTTP {s}")),
    }
}

fn s(v: &Value, k: &str) -> String {
    v.get(k).and_then(Value::as_str).unwrap_or_default().to_string()
}

pub fn meta(owner: &str, repo: &str) -> Result<Meta, String> {
    let v = api_json(&format!("/repos/{owner}/{repo}"), JSON)?;
    Ok(Meta {
        name: s(&v, "name"),
        desc: s(&v, "description"),
        homepage: s(&v, "homepage"),
        stars: v.get("stargazers_count").and_then(Value::as_u64).unwrap_or(0),
        license: v.get("license").map(|l| s(l, "spdx_id")).filter(|x| x != "NOASSERTION").unwrap_or_default(),
        topics: v.get("topics").and_then(Value::as_array).map(|a| a.iter().filter_map(|t| t.as_str().map(String::from)).collect()).unwrap_or_default(),
        archived: v.get("archived").and_then(Value::as_bool).unwrap_or(false),
        avatar: v.get("owner").map(|o| s(o, "avatar_url")).unwrap_or_default(),
        org: v.get("owner").is_some_and(|o| s(o, "type") == "Organization"),
        branch: s(&v, "default_branch"),
        fork: v.get("fork").and_then(Value::as_bool).unwrap_or(false),
        parent: v.get("parent").map(|p| s(p, "full_name")).unwrap_or_default(),
        forks: v.get("forks_count").and_then(Value::as_u64).unwrap_or(0),
        pushed: s(&v, "pushed_at"),
    })
}

/// The repository's forks, most starred first (the same shape as search results).
pub fn forks(owner: &str, repo: &str) -> Result<Vec<Value>, String> {
    let v = api_json(&format!("/repos/{owner}/{repo}/forks?sort=stargazers&per_page=40"), JSON)?;
    Ok(v.as_array().map(|a| a.iter().map(repo_item).collect()).unwrap_or_default())
}

/// A repository object of the API in the shape the page shows (search results, forks, stars).
pub fn repo_item(x: &Value) -> Value {
    let o = x.get("owner").cloned().unwrap_or_default();
    serde_json::json!({
        "full": s(x, "full_name"), "owner": s(&o, "login"), "name": s(x, "name"), "desc": s(x, "description"),
        "stars": x.get("stargazers_count").and_then(Value::as_u64).unwrap_or(0), "lang": s(x, "language"),
        "pushed": s(x, "pushed_at"), "created": s(x, "created_at"),
        "license": x.get("license").map(|l| s(l, "spdx_id")).filter(|l| l != "NOASSERTION").unwrap_or_default(),
        "topics": x.get("topics").cloned().unwrap_or_default(), "archived": x.get("archived").and_then(Value::as_bool).unwrap_or(false),
        "fork": x.get("fork").and_then(Value::as_bool).unwrap_or(false),
        "avatar": s(&o, "avatar_url"), "org": s(&o, "type") == "Organization", "url": s(x, "html_url"), "homepage": s(x, "homepage"),
        "branch": s(x, "default_branch"),
    })
}

/// Languages of the repository with a share of 10 % or more, largest first (one request).
pub fn languages(owner: &str, repo: &str) -> Result<Vec<(String, f64)>, String> {
    let v = api_json(&format!("/repos/{owner}/{repo}/languages"), JSON)?;
    Ok(lang_shares(&v))
}

fn lang_shares(v: &Value) -> Vec<(String, f64)> {
    let Some(m) = v.as_object() else { return Vec::new() };
    let total: f64 = m.values().filter_map(Value::as_f64).sum();
    if total <= 0.0 {
        return Vec::new();
    }
    let mut out: Vec<(String, f64)> = m.iter().filter_map(|(k, b)| Some((k.clone(), b.as_f64()? / total))).filter(|x| x.1 >= 0.1).collect();
    out.sort_by(|a, b| b.1.total_cmp(&a.1));
    out
}

/// A GitHub user or organisation.
pub struct User {
    pub login: String,
    pub name: String,
    pub bio: String,
    pub blog: String,
    pub avatar: String,
    pub org: bool,
}

pub fn user(login: &str) -> Result<User, String> {
    let v = api_json(&format!("/users/{}", net::enc(login)), JSON).map_err(|e| if e.starts_with("not found") { "no such GitHub user".into() } else { e })?;
    Ok(User { login: s(&v, "login"), name: s(&v, "name"), bio: s(&v, "bio"), blog: s(&v, "blog"), avatar: s(&v, "avatar_url"), org: s(&v, "type") == "Organization" })
}

/// The user's own public repositories (forks included), most recently pushed first; one request.
pub fn user_repos(login: &str) -> Result<Vec<Value>, String> {
    let v = api_json(&format!("/users/{}/repos?type=owner&sort=pushed&per_page=100", net::enc(login)), JSON)?;
    Ok(v.as_array().map(|a| a.iter().map(repo_item).collect()).unwrap_or_default())
}

/// One release by its tag.
pub fn release_by_tag(owner: &str, repo: &str, tag: &str) -> Result<Release, String> {
    let v = api_json(&format!("/repos/{owner}/{repo}/releases/tags/{}", net::enc(tag)), JSON_HTML)?;
    Ok(parse_release(&v))
}

/// Repository search with GitHub's own query language (qualifiers built by the page); `sort` is
/// "stars", "updated" or "" (best match). (total, items for the page)
pub fn search(q: &str, sort: &str, page: u32) -> Result<(u64, Vec<Value>), String> {
    let mut path = format!("/search/repositories?q={}&per_page=30&page={}", net::enc(q), page.clamp(1, 34));
    if sort == "stars" || sort == "updated" {
        path += &format!("&sort={sort}&order=desc");
    }
    let r = net::github(&path, JSON, "")?;
    let v: Value = match r.status {
        200 => serde_json::from_slice(&r.body).map_err(|e| e.to_string())?,
        422 => return Err("GitHub did not understand the search".into()),
        403 | 429 => return Err("GitHub search limit reached — wait a minute or add a token in Settings".into()),
        s => return Err(format!("GitHub answered HTTP {s}")),
    };
    Ok(parse_search(&v))
}

fn parse_search(v: &Value) -> (u64, Vec<Value>) {
    let items = v.get("items").and_then(Value::as_array).map(|a| a.iter().map(repo_item).collect()).unwrap_or_default();
    (v.get("total_count").and_then(Value::as_u64).unwrap_or(0), items)
}

/// The app's own icon among the repository files (path, size): by name ("icon", "logo", the repo's
/// name), kind (ico before png before svg) and place; None — nothing convincing.
pub fn icon_in_tree(files: &[(String, u64)], repo: &str) -> Option<String> {
    const SKIP: [&str; 16] = ["test", "node_modules", "vendor", "third_party", "thirdparty", "external/", "deps/", "example", "sample", "fixture", "badge", "screenshot", "flags/", "emoji", "/fonts/", "tutorial"];
    let repo_n: String = repo.chars().filter(char::is_ascii_alphanumeric).map(|c| c.to_ascii_lowercase()).collect();
    let mut best: Option<(i32, &str)> = None;
    for (path, size) in files {
        let lower = path.to_ascii_lowercase();
        let Some((stem_dot, ext)) = lower.rsplit('/').next().and_then(|f| f.rsplit_once('.')) else { continue };
        let ext_score = match ext {
            "ico" => 3,
            "png" => 2,
            "svg" => 1,
            _ => continue,
        };
        if SKIP.iter().any(|s| lower.contains(s)) || *size > 1_500_000 || (ext == "png" && *size < 1200) {
            continue;
        }
        let stem: String = stem_dot.chars().filter(char::is_ascii_alphanumeric).collect();
        let mut sc = if !repo_n.is_empty() && (stem == repo_n || stem == format!("{repo_n}icon") || stem == format!("{repo_n}logo")) {
            6
        } else if ["icon", "logo", "appicon", "applogo", "app", "mainicon", "programicon"].contains(&stem.as_str()) {
            5
        } else if stem.contains("icon") || stem.contains("logo") {
            3
        } else {
            continue;
        };
        if stem.contains("favicon") {
            sc -= 2;
        }
        if ["tray", "small", "dark", "light", "mono", "white", "black", "banner", "text", "wide", "header"].iter().any(|w| stem.contains(w)) {
            sc -= 2;
        }
        if ["256", "512", "128"].iter().any(|n| stem.contains(n)) {
            sc += 1;
        }
        if lower.contains("windows") || lower.contains("win32") {
            sc += 2;
        }
        if ["assets/", "resources/", "res/", "images/", "icons/", "img/"].iter().any(|d| lower.contains(d)) {
            sc += 1;
        }
        sc += ext_score - (lower.matches('/').count() as i32 - 3).max(0);
        if sc >= 7 && best.is_none_or(|b| sc > b.0) {
            best = Some((sc, path));
        }
    }
    best.map(|b| b.1.to_string())
}

/// (path, size) of the repository's files (one request; large trees come truncated — enough for icons).
pub fn tree(owner: &str, repo: &str, branch: &str) -> Result<Vec<(String, u64)>, String> {
    let b = if branch.is_empty() { "HEAD" } else { branch };
    let v = api_json(&format!("/repos/{owner}/{repo}/git/trees/{}?recursive=1", net::enc(b)), JSON)?;
    Ok(v.get("tree")
        .and_then(Value::as_array)
        .map(|a| a.iter().filter(|x| s(x, "type") == "blob").map(|x| (s(x, "path"), x.get("size").and_then(Value::as_u64).unwrap_or(0))).collect())
        .unwrap_or_default())
}

/// Raw URL of a repository file.
pub fn raw_url(owner: &str, repo: &str, branch: &str, path: &str) -> String {
    let p: Vec<String> = path.split('/').map(net::enc).collect();
    format!("https://raw.githubusercontent.com/{owner}/{repo}/{}/{}", if branch.is_empty() { "HEAD" } else { branch }, p.join("/"))
}

pub fn parse_release(v: &Value) -> Release {
    Release {
        tag: s(v, "tag_name"),
        name: s(v, "name"),
        date: s(v, "published_at"),
        notes: s(v, "body_html"),
        url: s(v, "html_url"),
        prerelease: v.get("prerelease").and_then(Value::as_bool).unwrap_or(false),
        assets: v
            .get("assets")
            .and_then(Value::as_array)
            .map(|a| {
                a.iter()
                    .map(|x| Asset { name: s(x, "name"), url: s(x, "browser_download_url"), size: x.get("size").and_then(Value::as_u64).unwrap_or(0), digest: s(x, "digest") })
                    .filter(|x| x.url.starts_with("https://"))
                    .collect()
            })
            .unwrap_or_default(),
    }
}

pub enum Latest {
    /// same answer as last time (ETag)
    Same,
    /// the repository has no releases
    None,
    New(Release, String),
}

/// The latest release (pre-releases only when there is nothing else, or with `pre`); conditional on `etag`.
pub fn latest(owner: &str, repo: &str, etag: &str, pre: bool) -> Result<Latest, String> {
    if pre {
        let list = releases(owner, repo, 1)?;
        return Ok(list.into_iter().next().map_or(Latest::None, |rel| Latest::New(rel, String::new())));
    }
    let r = net::github(&format!("/repos/{owner}/{repo}/releases/latest"), JSON_HTML, etag)?;
    match r.status {
        304 => Ok(Latest::Same),
        200 => {
            let v: Value = serde_json::from_slice(&r.body).map_err(|e| e.to_string())?;
            Ok(Latest::New(parse_release(&v), r.etag))
        }
        404 => {
            // no full release: the newest pre-release, if any
            let list = releases(owner, repo, 1)?;
            Ok(list.into_iter().next().map_or(Latest::None, |rel| Latest::New(rel, String::new())))
        }
        403 | 429 => Err("GitHub request limit reached — add a token in Settings or try later".into()),
        s => Err(format!("GitHub answered HTTP {s}")),
    }
}

pub fn releases(owner: &str, repo: &str, n: u32) -> Result<Vec<Release>, String> {
    let v = api_json(&format!("/repos/{owner}/{repo}/releases?per_page={n}"), JSON_HTML)?;
    Ok(v.as_array().map(|a| a.iter().map(parse_release).filter(|r| !r.tag.is_empty()).collect()).unwrap_or_default())
}

/// The README as HTML rendered (and sanitised) by GitHub; "" when there is none.
pub fn readme(owner: &str, repo: &str) -> Result<String, String> {
    let r = net::github(&format!("/repos/{owner}/{repo}/readme"), "application/vnd.github.html", "")?;
    match r.status {
        200 => Ok(String::from_utf8_lossy(&r.body).into_owned()),
        404 => Ok(String::new()),
        s => Err(format!("GitHub answered HTTP {s}")),
    }
}

/// How a release file is installed.
#[derive(Clone, Copy, PartialEq, Debug)]
pub enum Kind {
    Msi,
    /// an exe named as a setup
    Setup,
    /// an exe that may be a setup or the app itself (decided after the download)
    Exe,
    /// an archive unpacked into the apps folder
    Zip,
    /// opened with App Installer
    Msix,
}

impl Kind {
    pub fn portable(self) -> bool {
        matches!(self, Kind::Zip | Kind::Exe)
    }
}

/// This PC: "x64", "arm64" or "x86".
pub fn arch() -> &'static str {
    let a = std::env::var("PROCESSOR_ARCHITEW6432").or_else(|_| std::env::var("PROCESSOR_ARCHITECTURE")).unwrap_or_default().to_ascii_uppercase();
    match a.as_str() {
        "ARM64" => "arm64",
        "X86" => "x86",
        _ => "x64",
    }
}

fn tokens(name: &str) -> Vec<String> {
    name.to_ascii_lowercase().split(|c: char| !c.is_ascii_alphanumeric()).filter(|t| !t.is_empty()).map(String::from).collect()
}

/// The architecture an asset name states, if any.
fn asset_arch(t: &[String], lower: &str) -> Option<&'static str> {
    if lower.contains("x86_64") || lower.contains("x86-64") || t.iter().any(|x| ["x64", "amd64", "win64", "64bit"].contains(&x.as_str())) {
        return Some("x64");
    }
    if t.iter().any(|x| ["arm64", "aarch64"].contains(&x.as_str())) {
        return Some("arm64");
    }
    if t.iter().any(|x| ["x86", "i386", "i686", "win32", "32bit", "ia32"].contains(&x.as_str())) {
        return Some("x86");
    }
    None
}

/// Score of one asset for this PC and the install `method` ("auto", "installer", "portable"); None — unusable.
fn score(a: &Asset, method: &str, my_arch: &str) -> Option<(i32, Kind)> {
    let lower = a.name.to_ascii_lowercase();
    let t = tokens(&a.name);
    let has = |w: &[&str]| t.iter().any(|x| w.contains(&x.as_str()));
    let kind = if lower.ends_with(".msi") {
        Kind::Msi
    } else if [".msix", ".msixbundle", ".appx", ".appxbundle"].iter().any(|e| lower.ends_with(e)) {
        Kind::Msix
    } else if lower.ends_with(".exe") {
        if lower.contains("setup") || lower.contains("install") { Kind::Setup } else { Kind::Exe }
    } else if lower.ends_with(".zip") || lower.ends_with(".7z") {
        Kind::Zip
    } else {
        return None;
    };
    if has(&["linux", "macos", "mac", "darwin", "osx", "android", "ios", "freebsd", "apple", "debug", "symbols", "pdb", "source", "src"]) {
        return None;
    }
    let mut sc = 0;
    if has(&["win", "windows", "win64", "win32", "win10", "win11"]) {
        sc += 20;
    }
    match asset_arch(&t, &lower) {
        Some(x) if x == my_arch => sc += 30,
        // x64 runs emulated on Windows on ARM, x86 runs on x64
        Some("x64") if my_arch == "arm64" => sc += 5,
        Some("x86") if my_arch != "x86" => sc += 2,
        Some(_) => return None,
        None => sc += 10,
    }
    let portable = lower.contains("portable") || kind.portable();
    sc += match (method, kind) {
        ("portable", _) if portable => 50,
        ("portable", _) => -40,
        ("installer", Kind::Msi | Kind::Setup) => 50,
        ("installer", Kind::Exe) => 10,
        ("installer", _) => -40,
        (_, Kind::Setup) => 30,
        (_, Kind::Msi) => 26,
        (_, Kind::Zip) => 20,
        (_, Kind::Exe) => 16,
        (_, Kind::Msix) => 6,
    };
    if lower.ends_with(".7z") {
        sc -= 4; // tar unpacks zip surely, 7z depends on the Windows build
    }
    Some((sc, kind))
}

/// The file to install when the user named a part of its name (`filter`), else the automatic choice.
pub fn pick_for(assets: &[Asset], method: &str, filter: &str) -> Option<(Asset, Kind)> {
    let f = filter.trim().to_ascii_lowercase();
    if f.is_empty() {
        return pick(assets, method);
    }
    let only: Vec<Asset> = assets.iter().filter(|a| a.name.to_ascii_lowercase().contains(&f)).cloned().collect();
    pick(&only, method).or_else(|| only.first().and_then(|a| pick(std::slice::from_ref(a), "auto")))
}

/// The file of a release to install on this PC.
pub fn pick(assets: &[Asset], method: &str) -> Option<(Asset, Kind)> {
    let my = arch();
    assets.iter().filter_map(|a| score(a, method, my).map(|(s, k)| (s, k, a))).max_by(|x, y| x.0.cmp(&y.0).then(y.2.name.len().cmp(&x.2.name.len()))).map(|(_, k, a)| (a.clone(), k))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn a(n: &str) -> Asset {
        Asset { name: n.into(), url: format!("https://x/{n}"), size: 1, digest: String::new() }
    }

    /// Real requests: cargo test -- --ignored live_github --nocapture
    #[test]
    #[ignore]
    fn live_github() {
        for (o, r) in [("ShareX", "ShareX"), ("localsend", "localsend"), ("microsoft", "PowerToys")] {
            let m = meta(o, r).expect("metadata");
            assert!(m.stars > 1000 && !m.avatar.is_empty(), "{o}/{r}");
            let Latest::New(rel, etag) = latest(o, r, "", false).expect("latest") else { panic!("no release for {o}/{r}") };
            let p = pick(&rel.assets, "auto");
            println!("{o}/{r}: {} ({} assets, notes {} B) → {:?}", rel.tag, rel.assets.len(), rel.notes.len(), p.as_ref().map(|x| (&x.0.name, x.1, &x.0.digest)));
            assert!(p.is_some(), "a Windows file in {o}/{r}");
            if !etag.is_empty() {
                assert!(matches!(latest(o, r, &etag, false).expect("conditional"), Latest::Same), "ETag answer");
            }
        }
        assert!(readme("ShareX", "ShareX").expect("readme").contains("<"));
        for (o, r) in [("ShareX", "ShareX"), ("localsend", "localsend"), ("Swiftlyx", "OpenChatMix"), ("File-New-Project", "EarTrumpet"), ("microsoft", "PowerToys")] {
            let m = meta(o, r).expect("metadata");
            let files = tree(o, r, &m.branch).expect("tree");
            println!("{o}/{r} ({} files, org {}): icon {:?}", files.len(), m.org, icon_in_tree(&files, r));
        }
        let (total, items) = search("tray language:C#", "stars", 1).expect("search");
        assert!(total > 0 && !items.is_empty());
        println!("search: {total}, first {}", items[0]["full"]);
        println!("rate: {:?}", net::rate().map(|r| (r.remaining, r.limit)));
    }

    #[test]
    fn search_answer() {
        let v = serde_json::json!({ "total_count": 2, "items": [{ "full_name": "a/b", "name": "b", "description": "d", "stargazers_count": 5, "language": "Rust",
            "pushed_at": "2026-01-01T00:00:00Z", "license": { "spdx_id": "MIT" }, "topics": ["tray"], "html_url": "https://github.com/a/b",
            "owner": { "login": "a", "type": "Organization", "avatar_url": "https://avatars/x" } }] });
        let (n, items) = parse_search(&v);
        assert_eq!(n, 2);
        assert_eq!(items[0]["full"], "a/b");
        assert_eq!(items[0]["org"], true);
        assert_eq!(items[0]["license"], "MIT");
        assert_eq!(items[0]["stars"], 5);
    }

    #[test]
    fn language_shares() {
        let l = lang_shares(&serde_json::json!({ "Rust": 820, "JavaScript": 150, "Shell": 30 }));
        assert_eq!(l.iter().map(|x| x.0.as_str()).collect::<Vec<_>>(), ["Rust", "JavaScript"], "under 10 % left out");
        assert!((l[0].1 - 0.82).abs() < 1e-9);
        assert!(lang_shares(&serde_json::json!({})).is_empty());
    }

    #[test]
    fn tree_icons() {
        let f = |v: &[(&str, u64)]| v.iter().map(|(p, s)| (p.to_string(), *s)).collect::<Vec<_>>();
        let files = f(&[("README.md", 900), ("docs/screenshots/logo.png", 90000), ("ShareX/Resources/ShareX_Icon.ico", 120000), ("ShareX/Resources/tray.ico", 4000), ("Website/favicon.ico", 5000)]);
        assert_eq!(icon_in_tree(&files, "ShareX").as_deref(), Some("ShareX/Resources/ShareX_Icon.ico"));
        let files = f(&[("assets/logo.png", 40000), ("assets/logo_dark.png", 40000), ("src/main.rs", 100)]);
        assert_eq!(icon_in_tree(&files, "tool").as_deref(), Some("assets/logo.png"));
        assert_eq!(icon_in_tree(&f(&[("src/main.rs", 100), ("docs/diagram.png", 50000)]), "tool"), None);
        assert_eq!(icon_in_tree(&f(&[("tests/data/icon.png", 50000)]), "tool"), None, "test data");
    }

    #[test]
    fn repo_links() {
        assert_eq!(parse_repo("https://github.com/ShareX/ShareX"), Some(("ShareX".into(), "ShareX".into())));
        assert_eq!(parse_repo("github.com/microsoft/PowerToys/releases"), Some(("microsoft".into(), "PowerToys".into())));
        assert_eq!(parse_repo("https://www.github.com/a/b.git"), Some(("a".into(), "b".into())));
        assert_eq!(parse_repo("localsend/localsend"), Some(("localsend".into(), "localsend".into())));
        assert_eq!(parse_repo("https://github.com/topics/windows"), None);
        assert_eq!(parse_repo("https://example.com/a/b"), None);
        assert_eq!(parse_repo("https://github.com/onlyowner"), None);
    }

    #[test]
    fn picks_windows_files() {
        let set = [a("ShareX-18.0.0-setup.exe"), a("ShareX-18.0.0-portable.zip"), a("ShareX-18.0.0.tar.gz"), a("checksums.sha256")];
        assert_eq!(pick(&set, "auto").unwrap().0.name, "ShareX-18.0.0-setup.exe");
        assert_eq!(pick(&set, "portable").unwrap().0.name, "ShareX-18.0.0-portable.zip");
        let lin = [a("app-linux-x64.AppImage"), a("app-macos-arm64.dmg")];
        assert!(pick(&lin, "auto").is_none());
        let by_arch = [a("tool-win-arm64.zip"), a("tool-win-x64.zip"), a("tool-linux-x64.zip")];
        let want = if arch() == "arm64" { "tool-win-arm64.zip" } else { "tool-win-x64.zip" };
        assert_eq!(pick(&by_arch, "auto").unwrap().0.name, want);
        let msi = [a("PowerToysUserSetup-0.97.0-x64.exe"), a("PowerToysUserSetup-0.97.0-arm64.exe")];
        assert!(pick(&msi, "auto").unwrap().0.name.contains(if arch() == "arm64" { "arm64" } else { "x64" }));
        let plain = [a("LocalSend-1.18.0-windows-x86-64.msix"), a("LocalSend-1.18.0-windows-x86-64.zip"), a("LocalSend-1.18.0-windows-x86-64.exe")];
        assert_eq!(pick(&plain, "auto").unwrap().1, Kind::Zip);
        assert_eq!(pick(&plain, "installer").unwrap().1, Kind::Exe);
    }
}
