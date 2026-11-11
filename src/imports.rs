//! Imports into the library: GitHub stars, an Obtainium export, browser bookmarks, a list of links.
//! Everything is added "light" (no requests per item): GitHub apps get their releases at the next check
//! and their details when opened, links get their title and icon when opened.

use std::path::PathBuf;

use serde_json::{Value, json};

use crate::{
    gh,
    library::{self, App},
    net, util,
};

/// A repository object of the API (stars) as a library app.
fn app_from_repo(x: &Value) -> Option<App> {
    let full = x.get("full_name")?.as_str()?;
    let (owner, repo) = full.split_once('/')?;
    let s = |k: &str| x.get(k).and_then(Value::as_str).unwrap_or_default().to_string();
    Some(App {
        id: format!("gh:{}", full.to_ascii_lowercase()),
        url: format!("https://github.com/{full}"),
        kind: "github".into(),
        owner: owner.into(),
        repo: repo.into(),
        name: repo.into(),
        desc: s("description"),
        homepage: s("homepage"),
        stars: x.get("stargazers_count").and_then(Value::as_u64).unwrap_or(0),
        license: x.get("license").and_then(|l| l.get("spdx_id")).and_then(Value::as_str).filter(|l| *l != "NOASSERTION").unwrap_or_default().into(),
        topics: x.get("topics").and_then(Value::as_array).map(|a| a.iter().filter_map(|t| t.as_str().map(String::from)).collect()).unwrap_or_default(),
        archived: x.get("archived").and_then(Value::as_bool).unwrap_or(false),
        fork: x.get("fork").and_then(Value::as_bool).unwrap_or(false),
        branch: s("default_branch"),
        pushed: s("pushed_at"),
        org: x.get("owner").and_then(|o| o.get("type")).and_then(Value::as_str) == Some("Organization"),
        want: true,
        added: util::unix(),
        method: "auto".into(),
        meta_at: util::unix(),
        ..Default::default()
    })
}

fn light_github(owner: &str, repo: &str) -> App {
    App {
        id: format!("gh:{}/{}", owner.to_ascii_lowercase(), repo.to_ascii_lowercase()),
        url: format!("https://github.com/{owner}/{repo}"),
        kind: "github".into(),
        owner: owner.into(),
        repo: repo.into(),
        name: repo.into(),
        want: true,
        added: util::unix(),
        method: "auto".into(),
        ..Default::default()
    }
}

/// Adds what is not in the library yet, optionally into a group; (added, already there).
pub fn add_all(apps: Vec<App>, group: &str) -> (usize, usize) {
    library::update(|l| {
        let (mut added, mut had) = (0, 0);
        for mut a in apps {
            if l.apps.iter().any(|x| x.id == a.id || (a.kind == "link" && x.url == a.url)) {
                had += 1;
                continue;
            }
            if a.kind == "link" && a.id.is_empty() {
                a.id = library::next_link_id(l);
            }
            if !group.is_empty() {
                a.groups.push(group.to_string());
            }
            a.updated = util::unix();
            l.removed.remove(&a.id);
            l.apps.push(a);
            added += 1;
        }
        (added, had)
    })
}

/// A link or a repository as a light item.
pub fn item_of(url: &str, title: &str) -> Option<App> {
    let url = url.trim();
    if let Some((o, r)) = gh::parse_repo(url) {
        return Some(light_github(&o, &r));
    }
    if !(url.starts_with("https://") || url.starts_with("http://")) || net::split_url(url).is_none() {
        return None;
    }
    let host = net::split_url(url).map(|h| h.0).unwrap_or_default();
    Some(App { url: url.into(), kind: "link".into(), name: if title.trim().is_empty() { host.trim_start_matches("www.").into() } else { title.trim().chars().take(80).collect() }, added: util::unix(), ..Default::default() })
}

/// (worker) The stars of a GitHub user (the token's own when `login` is empty); up to 1000.
pub fn stars(login: &str) -> Result<Vec<App>, String> {
    let login = if login.trim().is_empty() {
        let r = net::github("/user", "application/vnd.github+json", "")?;
        if r.status != 200 {
            return Err("enter your GitHub login (or add a token)".into());
        }
        let v: Value = serde_json::from_slice(&r.body).map_err(|e| e.to_string())?;
        let l = v.get("login").and_then(Value::as_str).unwrap_or_default().to_string();
        crate::config::update(|c| c.gh_login = l.clone());
        l
    } else {
        login.trim().trim_start_matches('@').to_string()
    };
    let mut out = Vec::new();
    for page in 1..=10 {
        let r = net::github(&format!("/users/{}/starred?per_page=100&page={page}", net::enc(&login)), "application/vnd.github+json", "")?;
        match r.status {
            200 => {}
            404 => return Err("no such GitHub user".into()),
            403 | 429 => return Err("GitHub request limit reached — add a token in Settings or try later".into()),
            s => return Err(format!("GitHub answered HTTP {s}")),
        }
        let v: Value = serde_json::from_slice(&r.body).map_err(|e| e.to_string())?;
        let items = v.as_array().cloned().unwrap_or_default();
        out.extend(items.iter().filter_map(app_from_repo));
        if items.len() < 100 {
            break;
        }
    }
    Ok(out)
}

/// An Obtainium export ({"apps":[{"url":…,"name":…}]}): its links.
pub fn obtainium(text: &str) -> Result<Vec<App>, String> {
    let v: Value = serde_json::from_str(text).map_err(|_| "not an Obtainium export".to_string())?;
    let apps = v.get("apps").and_then(Value::as_array).ok_or("not an Obtainium export")?;
    Ok(apps.iter().filter_map(|a| item_of(a.get("url")?.as_str()?, a.get("name").and_then(Value::as_str).unwrap_or_default())).collect())
}

/// Lines with links (anything else on a line is ignored).
pub fn from_text(text: &str) -> Vec<App> {
    text.lines()
        .filter_map(|l| {
            let w = l.split_whitespace().find(|w| w.starts_with("http") || w.contains("github.com/") || w.matches('/').count() == 1)?;
            item_of(w.trim_matches(|c| c == ',' || c == ';' || c == '"' || c == '\''), "")
        })
        .collect()
}

// ---------------------------------------------------------------- browser bookmarks

fn browsers() -> Vec<(&'static str, PathBuf)> {
    let local = PathBuf::from(std::env::var("LOCALAPPDATA").unwrap_or_default());
    let roaming = PathBuf::from(std::env::var("APPDATA").unwrap_or_default());
    [
        ("Chrome", local.join(r"Google\Chrome\User Data\Default\Bookmarks")),
        ("Edge", local.join(r"Microsoft\Edge\User Data\Default\Bookmarks")),
        ("Brave", local.join(r"BraveSoftware\Brave-Browser\User Data\Default\Bookmarks")),
        ("Vivaldi", local.join(r"Vivaldi\User Data\Default\Bookmarks")),
        ("Opera", roaming.join(r"Opera Software\Opera Stable\Bookmarks")),
        ("Opera GX", roaming.join(r"Opera Software\Opera GX Stable\Bookmarks")),
    ]
    .into_iter()
    .filter(|(_, p)| p.is_file())
    .collect()
}

/// Folders of a bookmarks tree: (path, name, depth, links directly inside).
fn folders(node: &Value, path: &str, depth: usize, out: &mut Vec<Value>) {
    let name = node.get("name").and_then(Value::as_str).unwrap_or_default();
    let children = node.get("children").and_then(Value::as_array).cloned().unwrap_or_default();
    let links = children.iter().filter(|c| c.get("type").and_then(Value::as_str) == Some("url")).count();
    let p = if path.is_empty() { name.to_string() } else { format!("{path}/{name}") };
    out.push(json!({ "path": p, "name": name, "depth": depth, "links": links }));
    for c in children.iter().filter(|c| c.get("type").and_then(Value::as_str) == Some("folder")) {
        folders(c, &p, depth + 1, out);
    }
}

fn roots(file: &PathBuf) -> Vec<Value> {
    let v: Value = std::fs::read_to_string(file).ok().and_then(|s| serde_json::from_str(&s).ok()).unwrap_or_default();
    v.get("roots").and_then(Value::as_object).map(|o| ["bookmark_bar", "other", "synced"].iter().filter_map(|k| o.get(*k).cloned()).collect()).unwrap_or_default()
}

/// The browsers with bookmarks and their folders.
pub fn bookmark_tree() -> Value {
    Value::Array(
        browsers()
            .into_iter()
            .map(|(name, file)| {
                let mut out = Vec::new();
                for r in roots(&file) {
                    folders(&r, "", 0, &mut out);
                }
                json!({ "browser": name, "folders": out })
            })
            .collect(),
    )
}

/// The links of one folder (with its subfolders).
pub fn bookmarks(browser: &str, path: &str) -> Vec<App> {
    let Some((_, file)) = browsers().into_iter().find(|(n, _)| *n == browser) else { return Vec::new() };
    fn walk(node: &Value, cur: &str, want: &str, inside: bool, out: &mut Vec<App>) {
        let name = node.get("name").and_then(Value::as_str).unwrap_or_default();
        let p = if cur.is_empty() { name.to_string() } else { format!("{cur}/{name}") };
        let inside = inside || p == want;
        for c in node.get("children").and_then(Value::as_array).into_iter().flatten() {
            match c.get("type").and_then(Value::as_str) {
                Some("url") if inside => {
                    if let Some(a) = item_of(c.get("url").and_then(Value::as_str).unwrap_or_default(), c.get("name").and_then(Value::as_str).unwrap_or_default()) {
                        out.push(a);
                    }
                }
                Some("folder") => walk(c, &p, want, inside, out),
                _ => {}
            }
        }
    }
    let mut out = Vec::new();
    for r in roots(&file) {
        walk(&r, "", path, false, &mut out);
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn lists() {
        let a = from_text("ShareX — https://github.com/ShareX/ShareX\nnothing here\nhttps://youtube.com/watch?v=1, localsend/localsend");
        let ids: Vec<String> = a.iter().map(|x| if x.kind == "github" { x.id.clone() } else { x.url.clone() }).collect();
        assert_eq!(ids, ["gh:sharex/sharex", "https://youtube.com/watch?v=1"]);
        let o = obtainium(r#"{"apps":[{"url":"https://github.com/a/b","name":"B"},{"url":"https://f-droid.org/x"}]}"#).unwrap();
        assert_eq!(o.len(), 2);
        assert_eq!(o[0].id, "gh:a/b");
    }

    #[test]
    fn bookmark_folders() {
        let v = json!({ "name": "Bar", "children": [{ "type": "url", "url": "https://a.b" }, { "type": "folder", "name": "Soft", "children": [{ "type": "url", "url": "https://github.com/x/y" }] }] });
        let mut out = Vec::new();
        folders(&v, "", 0, &mut out);
        assert_eq!(out.len(), 2);
        assert_eq!(out[1]["path"], "Bar/Soft");
    }
}
