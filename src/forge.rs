//! GitLab and Codeberg (Forgejo / Gitea): the same repository work as gh.rs does for GitHub. A repository there
//! keeps its site in the owner: "gitlab.com/group/subgroup" + "project", "codeberg.org/owner" + "repo"; GitHub
//! owners never contain a dot or a slash, so gh.rs tells the sites apart by the owner alone.

use serde_json::{Value, json};

use crate::{
    library::{Asset, Release},
    net,
};

pub const CODEBERG: &str = "codeberg.org";

/// Which site a repository owner belongs to.
#[derive(Clone, Copy, PartialEq, Debug)]
pub enum Site {
    GitHub,
    GitLab,
    /// Forgejo / Gitea API on this host
    Gitea(&'static str),
}

/// The site and the owner without it.
pub fn site(owner: &str) -> (Site, &str) {
    if let Some(o) = owner.strip_prefix("gitlab.com/") {
        (Site::GitLab, o)
    } else if let Some(o) = owner.strip_prefix("codeberg.org/") {
        (Site::Gitea(CODEBERG), o)
    } else {
        (Site::GitHub, owner)
    }
}

pub fn site_name(s: Site) -> &'static str {
    match s {
        Site::GitHub => "GitHub",
        Site::GitLab => "GitLab",
        Site::Gitea(_) => "Codeberg",
    }
}

/// (owner with the site, repo) of a GitLab or Codeberg link: "https://gitlab.com/group/sub/project/-/releases",
/// "codeberg.org/owner/repo".
pub fn parse(s: &str) -> Option<(String, String)> {
    let s = s.trim().trim_end_matches('/');
    let rest = s.strip_prefix("https://").or_else(|| s.strip_prefix("http://")).unwrap_or(s);
    let rest = rest.strip_prefix("www.").unwrap_or(rest);
    let ok = |x: &str| !x.is_empty() && x.chars().all(|c| c.is_ascii_alphanumeric() || "-_.".contains(c));
    if let Some(p) = rest.strip_prefix("gitlab.com/") {
        // the project path ends where GitLab's own pages start ("/-/"), or at a query
        let p = p.split("/-/").next()?.split(['?', '#']).next()?.trim_end_matches('/').trim_end_matches(".git");
        let parts: Vec<&str> = p.split('/').collect();
        const NOT: [&str; 8] = ["explore", "users", "dashboard", "groups", "help", "search", "api", "projects"];
        if parts.len() < 2 || !parts.iter().all(|x| ok(x)) || NOT.contains(&parts[0]) {
            return None;
        }
        let (repo, owner) = parts.split_last()?;
        return Some((format!("gitlab.com/{}", owner.join("/")), repo.to_string()));
    }
    if let Some(p) = rest.strip_prefix("codeberg.org/") {
        let mut it = p.split(['/', '?', '#']);
        let (o, r) = (it.next()?, it.next()?.trim_end_matches(".git"));
        const NOT: [&str; 6] = ["explore", "user", "api", "org", "repo", "notifications"];
        if !ok(o) || !ok(r) || NOT.contains(&o) {
            return None;
        }
        return Some((format!("codeberg.org/{o}"), r.to_string()));
    }
    None
}

/// The repository's page.
pub fn web_url(owner: &str, repo: &str) -> String {
    format!("https://{owner}/{repo}")
}

fn s(v: &Value, k: &str) -> String {
    v.get(k).and_then(Value::as_str).unwrap_or_default().to_string()
}

fn n(v: &Value, k: &str) -> u64 {
    v.get(k).and_then(Value::as_u64).unwrap_or(0)
}

fn api_url(site: Site, path: &str) -> String {
    match site {
        Site::GitLab => format!("https://gitlab.com/api/v4{path}"),
        Site::Gitea(h) => format!("https://{h}/api/v1{path}"),
        Site::GitHub => format!("https://api.github.com{path}"),
    }
}

fn get_json(site: Site, path: &str) -> Result<(Value, String), String> {
    let r = net::get(&api_url(site, path), &[("Accept", "application/json")], 8 << 20)?;
    let name = site_name(site);
    match r.status {
        200 => Ok((serde_json::from_slice(&r.body).map_err(|e| e.to_string())?, r.total)),
        404 => Err(format!("not found on {name}")),
        429 => Err(format!("{name} asks to wait — try later")),
        s => Err(format!("{name} answered HTTP {s}")),
    }
}

fn api(site: Site, path: &str) -> Result<Value, String> {
    get_json(site, path).map(|x| x.0)
}

/// GitLab's id of a project: its full path without the site, URL-encoded.
fn gl_id(owner: &str, repo: &str) -> String {
    net::enc(&format!("{}/{repo}", site(owner).1))
}

/// The API path of a Forgejo / Gitea repository.
fn gt(owner: &str, repo: &str) -> String {
    format!("/repos/{}/{repo}", site(owner).1)
}

/// A GitLab upload path may come relative to the site.
fn gl_abs(u: &str) -> String {
    if u.starts_with('/') { format!("https://gitlab.com{u}") } else { u.to_string() }
}

pub fn meta(site: Site, owner: &str, repo: &str) -> Result<crate::gh::Meta, String> {
    match site {
        Site::GitLab => {
            let v = api(site, &format!("/projects/{}?license=true", gl_id(owner, repo)))?;
            let own = v.get("avatar_url").and_then(Value::as_str).map(gl_abs).unwrap_or_default();
            let ns = v.get("namespace").cloned().unwrap_or_default();
            Ok(crate::gh::Meta {
                name: s(&v, "name"),
                desc: s(&v, "description"),
                homepage: String::new(),
                stars: n(&v, "star_count"),
                license: v.get("license").map(|l| s(l, "key").to_uppercase()).unwrap_or_default(),
                topics: str_list(v.get("topics")),
                archived: v.get("archived").and_then(Value::as_bool).unwrap_or(false),
                avatar: if own.is_empty() { gl_abs(&s(&ns, "avatar_url")) } else { own.clone() },
                // a project's own avatar is its logo
                org: !own.is_empty(),
                branch: s(&v, "default_branch"),
                fork: v.get("forked_from_project").is_some_and(|p| !p.is_null()),
                parent: v.get("forked_from_project").map(|p| s(p, "path_with_namespace")).filter(|p| !p.is_empty()).map(|p| format!("gitlab.com/{p}")).unwrap_or_default(),
                forks: n(&v, "forks_count"),
                pushed: s(&v, "last_activity_at"),
            })
        }
        Site::Gitea(h) => {
            let v = api(site, &format!("{}", gt(owner, repo)))?;
            let own = s(&v, "avatar_url");
            Ok(crate::gh::Meta {
                name: s(&v, "name"),
                desc: s(&v, "description"),
                homepage: s(&v, "website"),
                stars: n(&v, "stars_count"),
                license: str_list(v.get("licenses")).into_iter().next().unwrap_or_default(),
                topics: str_list(v.get("topics")),
                archived: v.get("archived").and_then(Value::as_bool).unwrap_or(false),
                avatar: if own.is_empty() { v.get("owner").map(|o| s(o, "avatar_url")).unwrap_or_default() } else { own.clone() },
                org: !own.is_empty(),
                branch: s(&v, "default_branch"),
                fork: v.get("fork").and_then(Value::as_bool).unwrap_or(false),
                parent: v.get("parent").map(|p| s(p, "full_name")).filter(|p| !p.is_empty()).map(|p| format!("{h}/{p}")).unwrap_or_default(),
                forks: n(&v, "forks_count"),
                pushed: s(&v, "updated_at"),
            })
        }
        Site::GitHub => Err("not a GitLab or Codeberg repository".into()),
    }
}

fn str_list(v: Option<&Value>) -> Vec<String> {
    v.and_then(Value::as_array).map(|a| a.iter().filter_map(|t| t.as_str().map(String::from)).collect()).unwrap_or_default()
}

/// A GitLab project in the shape of GitHub search results (gh::repo_item).
fn gl_item(x: &Value) -> Value {
    let ns = x.get("namespace").cloned().unwrap_or_default();
    let own = x.get("avatar_url").and_then(Value::as_str).map(gl_abs).unwrap_or_default();
    json!({
        "full": format!("gitlab.com/{}", s(x, "path_with_namespace")), "owner": s(&ns, "full_path"), "name": s(x, "path"), "desc": s(x, "description"),
        "stars": n(x, "star_count"), "lang": "", "pushed": s(x, "last_activity_at"), "created": s(x, "created_at"), "license": "",
        "topics": x.get("topics").cloned().unwrap_or_default(), "archived": x.get("archived").and_then(Value::as_bool).unwrap_or(false),
        "fork": x.get("forked_from_project").is_some_and(|p| !p.is_null()),
        "avatar": if own.is_empty() { gl_abs(&s(&ns, "avatar_url")) } else { own.clone() }, "org": !own.is_empty(), "url": s(x, "web_url"), "homepage": "",
        "branch": s(x, "default_branch"), "site": "gitlab",
    })
}

/// A Forgejo / Gitea repository in the same shape.
fn gt_item(h: &str, x: &Value) -> Value {
    let o = x.get("owner").cloned().unwrap_or_default();
    let own = s(x, "avatar_url");
    json!({
        "full": format!("{h}/{}", s(x, "full_name")), "owner": s(&o, "login"), "name": s(x, "name"), "desc": s(x, "description"),
        "stars": n(x, "stars_count"), "lang": s(x, "language"), "pushed": s(x, "updated_at"), "created": s(x, "created_at"), "license": "",
        "topics": x.get("topics").cloned().unwrap_or_default(), "archived": x.get("archived").and_then(Value::as_bool).unwrap_or(false),
        "fork": x.get("fork").and_then(Value::as_bool).unwrap_or(false),
        "avatar": if own.is_empty() { s(&o, "avatar_url") } else { own.clone() }, "org": !own.is_empty(), "url": s(x, "html_url"), "homepage": s(x, "website"),
        "branch": s(x, "default_branch"), "site": "codeberg",
    })
}

pub fn forks(site: Site, owner: &str, repo: &str) -> Result<Vec<Value>, String> {
    match site {
        Site::GitLab => Ok(api(site, &format!("/projects/{}/forks?order_by=star_count&sort=desc&per_page=40", gl_id(owner, repo)))?.as_array().map(|a| a.iter().map(gl_item).collect()).unwrap_or_default()),
        Site::Gitea(h) => Ok(api(site, &format!("{}/forks?limit=40", gt(owner, repo)))?.as_array().map(|a| a.iter().map(|x| gt_item(h, x)).collect()).unwrap_or_default()),
        Site::GitHub => Err("not a GitLab or Codeberg repository".into()),
    }
}

/// Languages as the site gives them (bytes or percent; gh::lang_shares makes shares of either).
pub fn languages(site: Site, owner: &str, repo: &str) -> Result<Value, String> {
    match site {
        Site::GitLab => api(site, &format!("/projects/{}/languages", gl_id(owner, repo))),
        Site::Gitea(_) => api(site, &format!("{}/languages", gt(owner, repo))),
        Site::GitHub => Err("not a GitLab or Codeberg repository".into()),
    }
}

/// A user or a group of GitLab, a user or an organisation of Codeberg (`login` with its site: "gitlab.com/name").
pub fn user(site: Site, login: &str) -> Result<crate::gh::User, String> {
    let name = forge_login(login);
    match site {
        Site::GitLab => {
            let found = api(site, &format!("/users?username={}", net::enc(name)))?;
            if let Some(u) = found.as_array().and_then(|a| a.first()) {
                let id = u.get("id").and_then(Value::as_u64).unwrap_or(0);
                let full = api(site, &format!("/users/{id}")).unwrap_or_else(|_| u.clone());
                return Ok(crate::gh::User { login: format!("gitlab.com/{}", s(&full, "username")), name: s(&full, "name"), bio: s(&full, "bio"), blog: s(&full, "website_url"), avatar: gl_abs(&s(&full, "avatar_url")), org: false });
            }
            let g = api(site, &format!("/groups/{}?with_projects=false", net::enc(name))).map_err(|_| "no such GitLab user or group".to_string())?;
            Ok(crate::gh::User { login: format!("gitlab.com/{}", s(&g, "full_path")), name: s(&g, "name"), bio: s(&g, "description"), blog: String::new(), avatar: gl_abs(&s(&g, "avatar_url")), org: true })
        }
        Site::Gitea(h) => {
            let u = api(site, &format!("/users/{}", net::enc(name))).map_err(|_| "no such Codeberg user".to_string())?;
            Ok(crate::gh::User { login: format!("{h}/{}", s(&u, "login")), name: s(&u, "full_name"), bio: s(&u, "description"), blog: s(&u, "website"), avatar: s(&u, "avatar_url"), org: false })
        }
        Site::GitHub => Err("not a GitLab or Codeberg author".into()),
    }
}

/// The author's own repositories, most recently changed first (one request).
pub fn user_repos(site: Site, login: &str) -> Result<Vec<Value>, String> {
    let name = forge_login(login);
    match site {
        Site::GitLab => {
            let enc = net::enc(name);
            let v = api(site, &format!("/users/{enc}/projects?order_by=last_activity_at&per_page=100")).or_else(|_| api(site, &format!("/groups/{enc}/projects?include_subgroups=true&order_by=last_activity_at&per_page=100")))?;
            Ok(v.as_array().map(|a| a.iter().map(gl_item).collect()).unwrap_or_default())
        }
        Site::Gitea(h) => {
            let v = api(site, &format!("/users/{}/repos?limit=50", net::enc(name)))?;
            let mut items: Vec<Value> = v.as_array().map(|a| a.iter().map(|x| gt_item(h, x)).collect()).unwrap_or_default();
            items.sort_by(|a, b| b["pushed"].as_str().cmp(&a["pushed"].as_str()));
            Ok(items)
        }
        Site::GitHub => Err("not a GitLab or Codeberg author".into()),
    }
}

/// "gitlab.com/name" → "name".
fn forge_login(login: &str) -> &str {
    site(login).1
}

/// Projects of GitLab by text; `sort` "stars", "updated" or "" (stars too: GitLab has no relevance order). The filters
/// (as the page builds them for GitHub): topic, lang, updated / created (days), stars (at least), fork ("" — none, "true"
/// — with, "only"), owner (a user or a group). GitLab filters by topic, language, activity and owner itself; stars, forks
/// and creation date are checked on the page of results.
pub fn search_gitlab(q: &str, sort: &str, page: u32, f: &Value) -> Result<(u64, Vec<Value>), String> {
    let order = if sort == "updated" { "last_activity_at" } else { "star_count" };
    let g = |k: &str| f.get(k).and_then(Value::as_str).unwrap_or("").trim().to_string();
    let days = |k: &str| g(k).parse::<i64>().ok().filter(|d| *d > 0);
    let iso = |d: i64| {
        let t = crate::util::unix() - d * 86400;
        let (y, m, dd) = crate::util::ymd(t);
        format!("{y:04}-{m:02}-{dd:02}T00:00:00Z")
    };
    let mut path = format!("?order_by={order}&sort=desc&per_page=30&page={}&archived=false", page.clamp(1, 34));
    if !q.trim().is_empty() {
        path += &format!("&search={}", net::enc(q.trim()));
    }
    if !g("topic").is_empty() {
        path += &format!("&topic={}", net::enc(&g("topic")));
    }
    if !g("lang").is_empty() {
        path += &format!("&with_programming_language={}", net::enc(&g("lang")));
    }
    if let Some(d) = days("updated") {
        path += &format!("&last_activity_after={}", iso(d));
    }
    let owner = g("owner").trim_start_matches('@').to_string();
    let base = if owner.is_empty() { "/projects".to_string() } else { format!("/users/{}/projects", net::enc(&owner)) };
    let res = get_json(Site::GitLab, &format!("{base}{path}"));
    let (v, total) = match res {
        Err(_) if !owner.is_empty() => get_json(Site::GitLab, &format!("/groups/{}/projects{path}&include_subgroups=true", net::enc(&owner)))?,
        r => r?,
    };
    let stars = g("stars").parse::<u64>().unwrap_or(0);
    let created = days("created").map(iso);
    let fork = g("fork");
    let items: Vec<Value> = v
        .as_array()
        .map(|a| {
            a.iter()
                .filter(|x| n(x, "star_count") >= stars)
                .filter(|x| created.as_ref().is_none_or(|c| s(x, "created_at") >= *c))
                .filter(|x| {
                    let is_fork = x.get("forked_from_project").is_some_and(|p| !p.is_null());
                    match fork.as_str() {
                        "only" => is_fork,
                        "true" => true,
                        _ => !is_fork,
                    }
                })
                .map(gl_item)
                .collect()
        })
        .unwrap_or_default();
    // GitLab leaves the total out for large results: enough to offer one more page
    let total = total.trim().parse().unwrap_or(if items.len() == 30 { page as u64 * 30 + 1 } else { 0 });
    Ok((total, items))
}

/// The raw-file and page bases of a branch (relative links of a README resolve against them).
fn bases(site: Site, owner: &str, repo: &str, branch: &str) -> (String, String) {
    let b = if branch.is_empty() { "HEAD" } else { branch };
    match site {
        Site::GitLab => (format!("https://{owner}/{repo}/-/raw/{b}/"), format!("https://{owner}/{repo}/-/blob/{b}/")),
        _ => (format!("https://{owner}/{repo}/raw/branch/{b}/"), format!("https://{owner}/{repo}/src/branch/{b}/")),
    }
}

pub fn raw_url(site: Site, owner: &str, repo: &str, branch: &str, path: &str) -> String {
    let p: Vec<String> = path.split('/').map(net::enc).collect();
    bases(site, owner, repo, branch).0 + &p.join("/")
}

/// (path, size) of the repository's files; GitLab gives no sizes (0) and the first 100 entries only.
pub fn tree(site: Site, owner: &str, repo: &str, branch: &str) -> Result<Vec<(String, u64)>, String> {
    match site {
        Site::GitLab => {
            let r = if branch.is_empty() { String::new() } else { format!("&ref={}", net::enc(branch)) };
            let v = api(site, &format!("/projects/{}/repository/tree?recursive=true&per_page=100{r}", gl_id(owner, repo)))?;
            Ok(v.as_array().map(|a| a.iter().filter(|x| s(x, "type") == "blob").map(|x| (s(x, "path"), 2000)).collect()).unwrap_or_default())
        }
        Site::Gitea(_) => {
            let b = if branch.is_empty() { "HEAD" } else { branch };
            let v = api(site, &format!("{}/git/trees/{}?recursive=true&per_page=1000", gt(owner, repo), net::enc(b)))?;
            Ok(v.get("tree").and_then(Value::as_array).map(|a| a.iter().filter(|x| s(x, "type") == "blob").map(|x| (s(x, "path"), n(x, "size"))).collect()).unwrap_or_default())
        }
        Site::GitHub => Err("not a GitLab or Codeberg repository".into()),
    }
}

fn gl_release(v: &Value) -> Release {
    let links = v.get("assets").and_then(|a| a.get("links")).and_then(Value::as_array).cloned().unwrap_or_default();
    Release {
        tag: s(v, "tag_name"),
        name: s(v, "name"),
        date: s(v, "released_at"),
        notes: s(v, "description_html"),
        url: v.get("_links").map(|l| s(l, "self")).unwrap_or_default(),
        prerelease: v.get("upcoming_release").and_then(Value::as_bool).unwrap_or(false),
        assets: links
            .iter()
            .map(|x| {
                let u = s(x, "direct_asset_url");
                Asset { name: s(x, "name"), url: if u.is_empty() { s(x, "url") } else { u }, size: 0, digest: String::new() }
            })
            .filter(|x| x.url.starts_with("https://"))
            .collect(),
    }
}

fn gt_release(owner: &str, repo: &str, v: &Value) -> Release {
    let (raw, web) = bases(Site::Gitea(CODEBERG), owner, repo, "");
    Release {
        tag: s(v, "tag_name"),
        name: s(v, "name"),
        date: s(v, "published_at"),
        notes: md_html(&s(v, "body"), &raw, &web),
        url: s(v, "html_url"),
        prerelease: v.get("prerelease").and_then(Value::as_bool).unwrap_or(false),
        assets: v
            .get("assets")
            .and_then(Value::as_array)
            .map(|a| a.iter().map(|x| Asset { name: s(x, "name"), url: s(x, "browser_download_url"), size: n(x, "size"), digest: String::new() }).filter(|x| x.url.starts_with("https://")).collect())
            .unwrap_or_default(),
    }
}

/// The newest releases, newest first (drafts left out).
pub fn releases(site: Site, owner: &str, repo: &str, count: u32) -> Result<Vec<Release>, String> {
    let list = match site {
        Site::GitLab => api(site, &format!("/projects/{}/releases?per_page={count}&include_html_description=true", gl_id(owner, repo)))?.as_array().map(|a| a.iter().map(gl_release).collect::<Vec<_>>()).unwrap_or_default(),
        Site::Gitea(_) => api(site, &format!("{}/releases?limit={count}&draft=false", gt(owner, repo)))?
            .as_array()
            .map(|a| a.iter().filter(|x| !x.get("draft").and_then(Value::as_bool).unwrap_or(false)).map(|x| gt_release(owner, repo, x)).collect::<Vec<_>>())
            .unwrap_or_default(),
        Site::GitHub => return Err("not a GitLab or Codeberg repository".into()),
    };
    Ok(list.into_iter().filter(|r| !r.tag.is_empty()).collect())
}

/// The latest release: a full one, else (or with `pre`) the newest of any kind.
pub fn latest(site: Site, owner: &str, repo: &str, pre: bool) -> Result<Option<Release>, String> {
    let list = releases(site, owner, repo, 10)?;
    let full = if pre { None } else { list.iter().find(|r| !r.prerelease).cloned() };
    Ok(full.or_else(|| list.into_iter().next()))
}

pub fn release_by_tag(site: Site, owner: &str, repo: &str, tag: &str) -> Result<Release, String> {
    match site {
        Site::GitLab => Ok(gl_release(&api(site, &format!("/projects/{}/releases/{}?include_html_description=true", gl_id(owner, repo), net::enc(tag)))?)),
        Site::Gitea(_) => Ok(gt_release(owner, repo, &api(site, &format!("{}/releases/tags/{}", gt(owner, repo), net::enc(tag)))?)),
        Site::GitHub => Err("not a GitLab or Codeberg repository".into()),
    }
}

/// A Markdown file of the repository as HTML; `path` "" — the README ("" when there is none).
pub fn markdown(site: Site, owner: &str, repo: &str, path: &str) -> Result<String, String> {
    if path.contains("..") || path.starts_with('/') {
        return Err(format!("not found on {}", site_name(site)));
    }
    // the file and the branch: the README is found through the project, another file is on the default branch
    let (file, branch) = match site {
        Site::GitLab => {
            let v = api(site, &format!("/projects/{}", gl_id(owner, repo)))?;
            let branch = s(&v, "default_branch");
            if path.is_empty() {
                let ru = s(&v, "readme_url");
                match ru.split_once("/-/blob/").and_then(|(_, r)| r.split_once('/')) {
                    Some((b, f)) => (f.to_string(), b.to_string()),
                    None => return Ok(String::new()),
                }
            } else {
                (path.to_string(), branch)
            }
        }
        Site::Gitea(_) => {
            let v = api(site, &format!("{}", gt(owner, repo)))?;
            let branch = s(&v, "default_branch");
            if path.is_empty() {
                let list = api(site, &format!("{}/contents", gt(owner, repo)))?;
                let found = list.as_array().into_iter().flatten().map(|x| s(x, "name")).filter(|f| f.to_lowercase().starts_with("readme")).min_by_key(|f| !f.to_lowercase().ends_with(".md"));
                match found {
                    Some(f) => (f, branch),
                    None => return Ok(String::new()),
                }
            } else {
                (path.to_string(), branch)
            }
        }
        Site::GitHub => return Err("not a GitLab or Codeberg repository".into()),
    };
    let r = net::get(&raw_url(site, owner, repo, &branch, &file), &[], 2 << 20)?;
    if r.status != 200 {
        return if path.is_empty() { Ok(String::new()) } else { Err(format!("not found on {}", site_name(site))) };
    }
    let text = String::from_utf8_lossy(&r.body).into_owned();
    let dir = file.rsplit_once('/').map(|(d, _)| format!("{d}/")).unwrap_or_default();
    let (raw, web) = bases(site, owner, repo, &branch);
    let lower = file.to_lowercase();
    Ok(if lower.ends_with(".md") || lower.ends_with(".markdown") || !lower.contains('.') && text.contains("# ") {
        md_html(&text, &(raw + &dir), &(web + &dir))
    } else {
        format!("<pre>{}</pre>", esc(&text))
    })
}

// ---------------------------------------------------------------- Markdown → HTML (the page sanitises the result)

fn esc(s: &str) -> String {
    s.replace('&', "&amp;").replace('<', "&lt;").replace('>', "&gt;").replace('"', "&quot;")
}

/// A relative link of the file, made absolute: images to raw files, other links to the site's pages.
fn resolve(u: &str, raw: &str, web: &str, image: bool) -> String {
    let u = u.trim();
    if u.is_empty() || u.starts_with('#') || u.contains("://") || u.starts_with("mailto:") || u.starts_with("data:") {
        return u.to_string();
    }
    let p = u.trim_start_matches("./");
    if let Some(abs) = p.strip_prefix('/') {
        // from the repository root: the base up to the branch, without the file's folder
        let b = if image { raw } else { web };
        let root = ["/-/raw/", "/-/blob/", "/raw/branch/", "/src/branch/"]
            .iter()
            .find_map(|m| b.find(m).map(|k| k + m.len()))
            .and_then(|k| b[k..].find('/').map(|j| &b[..k + j + 1]))
            .unwrap_or(b);
        return format!("{root}{abs}");
    }
    format!("{}{p}", if image { raw } else { web })
}

/// Inline Markdown: code, images, links, emphasis; HTML tags pass as they are (the page cleans them).
fn inline(t: &str, raw: &str, web: &str) -> String {
    let c: Vec<char> = t.chars().collect();
    let mut out = String::new();
    let mut i = 0;
    let find = |from: usize, pat: &str| -> Option<usize> {
        let p: Vec<char> = pat.chars().collect();
        (from..c.len()).find(|&k| c[k..].starts_with(&p))
    };
    while i < c.len() {
        let ch = c[i];
        if ch == '\\' && i + 1 < c.len() && "\\`*_[]()#+-.!<>~|".contains(c[i + 1]) {
            out.push_str(&esc(&c[i + 1].to_string()));
            i += 2;
            continue;
        }
        if ch == '`'
            && let Some(e) = find(i + 1, "`")
        {
            out += &format!("<code>{}</code>", esc(&c[i + 1..e].iter().collect::<String>()));
            i = e + 1;
            continue;
        }
        // ![alt](src) and [text](href), [![badge](img)](href) included
        let img = ch == '!' && c.get(i + 1) == Some(&'[');
        if ch == '[' || img {
            let start = if img { i + 1 } else { i };
            let mut depth = 0;
            let mut close = None;
            for (k, &x) in c.iter().enumerate().skip(start) {
                match x {
                    '[' => depth += 1,
                    ']' => {
                        depth -= 1;
                        if depth == 0 {
                            close = Some(k);
                            break;
                        }
                    }
                    _ => {}
                }
            }
            if let Some(cl) = close
                && c.get(cl + 1) == Some(&'(')
                && let Some(pe) = find(cl + 2, ")")
            {
                let label: String = c[start + 1..cl].iter().collect();
                let target: String = c[cl + 2..pe].iter().collect();
                let url = target.split_whitespace().next().unwrap_or("").trim_matches(['<', '>']).to_string();
                if img {
                    out += &format!("<img src=\"{}\" alt=\"{}\">", esc(&resolve(&url, raw, web, true)), esc(&label));
                } else {
                    out += &format!("<a href=\"{}\">{}</a>", esc(&resolve(&url, raw, web, false)), inline(&label, raw, web));
                }
                i = pe + 1;
                continue;
            }
        }
        if ch == '<' {
            if c[i + 1..].starts_with(&['h', 't', 't', 'p'])
                && let Some(e) = find(i, ">")
            {
                let url: String = c[i + 1..e].iter().collect();
                out += &format!("<a href=\"{}\">{}</a>", esc(&url), esc(&url));
                i = e + 1;
                continue;
            }
            // an HTML tag stays a tag; its relative src / href are made absolute
            if c.get(i + 1).is_some_and(|x| x.is_ascii_alphabetic() || *x == '/' || *x == '!')
                && let Some(e) = find(i, ">")
            {
                out += &tag_urls(&c[i..=e].iter().collect::<String>(), raw, web);
                i = e + 1;
                continue;
            }
        }
        let pair = [("**", "strong"), ("__", "strong"), ("~~", "del")].into_iter().find_map(|(mark, tagname)| {
            let m: Vec<char> = mark.chars().collect();
            let e = c[i..].starts_with(&m).then(|| find(i + 2, mark)).flatten().filter(|&e| e > i + 2)?;
            Some((e, tagname))
        });
        if let Some((e, tagname)) = pair {
            out += &format!("<{tagname}>{}</{tagname}>", inline(&c[i + 2..e].iter().collect::<String>(), raw, web));
            i = e + 2;
            continue;
        }
        if (ch == '*' || ch == '_') && c.get(i + 1).is_some_and(|x| !x.is_whitespace()) && (i == 0 || !c[i - 1].is_alphanumeric())
            && let Some(e) = find(i + 1, &ch.to_string())
            && e > i + 1
            && !c[e - 1].is_whitespace()
        {
            out += &format!("<em>{}</em>", inline(&c[i + 1..e].iter().collect::<String>(), raw, web));
            i = e + 1;
            continue;
        }
        match ch {
            '&' => out += "&amp;",
            '<' => out += "&lt;",
            '>' => out += "&gt;",
            _ => out.push(ch),
        }
        i += 1;
    }
    out
}

/// src="…" and href="…" of an HTML tag, made absolute.
fn tag_urls(tag: &str, raw: &str, web: &str) -> String {
    let mut out = tag.to_string();
    for (attr, image) in [("src=\"", true), ("href=\"", false)] {
        if let Some(a) = out.find(attr) {
            let from = a + attr.len();
            if let Some(len) = out[from..].find('"') {
                let u = resolve(&out[from..from + len], raw, web, image);
                out.replace_range(from..from + len, &u);
            }
        }
    }
    out
}

/// Block Markdown: headings, lists, quotes, code blocks, tables, rules, paragraphs, HTML blocks.
pub fn md_html(md: &str, raw: &str, web: &str) -> String {
    let lines: Vec<&str> = md.lines().collect();
    let mut out = String::new();
    let mut para: Vec<String> = Vec::new();
    let flush = |para: &mut Vec<String>, out: &mut String| {
        if !para.is_empty() {
            *out += &format!("<p>{}</p>\n", inline(&para.join(" "), raw, web));
            para.clear();
        }
    };
    let mut i = 0;
    while i < lines.len() {
        let l = lines[i];
        let t = l.trim();
        if t.is_empty() {
            flush(&mut para, &mut out);
            i += 1;
            continue;
        }
        // fenced code
        if t.starts_with("```") || t.starts_with("~~~") {
            flush(&mut para, &mut out);
            let fence = &t[..3];
            let mut code = Vec::new();
            i += 1;
            while i < lines.len() && !lines[i].trim().starts_with(fence) {
                code.push(lines[i]);
                i += 1;
            }
            out += &format!("<pre><code>{}</code></pre>\n", esc(&code.join("\n")));
            i += 1;
            continue;
        }
        if let Some(h) = (1..=6).find(|&k| t.starts_with(&"#".repeat(k)) && t[k..].starts_with(' ')) {
            flush(&mut para, &mut out);
            out += &format!("<h{h}>{}</h{h}>\n", inline(t[h..].trim().trim_end_matches('#').trim(), raw, web));
            i += 1;
            continue;
        }
        if t.len() >= 3 && (t.chars().all(|c| c == '-' || c == ' ') || t.chars().all(|c| c == '*' || c == ' ') || t.chars().all(|c| c == '_' || c == ' ')) && t.chars().filter(|c| !c.is_whitespace()).count() >= 3 {
            flush(&mut para, &mut out);
            out += "<hr>\n";
            i += 1;
            continue;
        }
        if t.starts_with('>') {
            flush(&mut para, &mut out);
            let mut q = Vec::new();
            while i < lines.len() && lines[i].trim().starts_with('>') {
                q.push(lines[i].trim().trim_start_matches('>').trim_start().to_string());
                i += 1;
            }
            out += &format!("<blockquote>{}</blockquote>\n", md_html(&q.join("\n"), raw, web));
            continue;
        }
        let bullet = |s: &str| s.starts_with("- ") || s.starts_with("* ") || s.starts_with("+ ");
        let numbered = |s: &str| s.split_once(". ").is_some_and(|(n, _)| !n.is_empty() && n.chars().all(|c| c.is_ascii_digit()));
        if bullet(t) || numbered(t) {
            flush(&mut para, &mut out);
            let ordered = numbered(t);
            let tagname = if ordered { "ol" } else { "ul" };
            out += &format!("<{tagname}>");
            while i < lines.len() {
                let x = lines[i].trim();
                if x.is_empty() || !(bullet(x) || numbered(x)) && !lines[i].starts_with("  ") {
                    break;
                }
                let item = if bullet(x) { &x[2..] } else if numbered(x) { x.split_once(". ").map(|p| p.1).unwrap_or(x) } else { x };
                let item = item.strip_prefix("[ ] ").map(|r| format!("☐ {r}")).or_else(|| item.strip_prefix("[x] ").map(|r| format!("☑ {r}"))).unwrap_or_else(|| item.to_string());
                out += &format!("<li>{}</li>", inline(&item, raw, web));
                i += 1;
            }
            out += &format!("</{tagname}>\n");
            continue;
        }
        // a table: a row of cells and a line of dashes under it
        if t.contains('|') && lines.get(i + 1).is_some_and(|n| { let n = n.trim(); n.contains('-') && n.chars().all(|c| "|-: ".contains(c)) }) {
            flush(&mut para, &mut out);
            let cells = |row: &str| row.trim().trim_matches('|').split('|').map(|x| x.trim().to_string()).collect::<Vec<_>>();
            out += "<table><thead><tr>";
            for c in cells(t) {
                out += &format!("<th>{}</th>", inline(&c, raw, web));
            }
            out += "</tr></thead><tbody>";
            i += 2;
            while i < lines.len() && lines[i].contains('|') && !lines[i].trim().is_empty() {
                out += "<tr>";
                for c in cells(lines[i]) {
                    out += &format!("<td>{}</td>", inline(&c, raw, web));
                }
                out += "</tr>";
                i += 1;
            }
            out += "</tbody></table>\n";
            continue;
        }
        // an HTML block stays as it is, up to an empty line
        if t.starts_with('<') && t.chars().nth(1).is_some_and(|c| c.is_ascii_alphabetic() || c == '!' || c == '/') {
            flush(&mut para, &mut out);
            while i < lines.len() && !lines[i].trim().is_empty() {
                out += &inline(lines[i], raw, web);
                out.push('\n');
                i += 1;
            }
            continue;
        }
        // setext headings: a line of = or - under the text
        if let Some(n) = lines.get(i + 1).map(|n| n.trim())
            && !n.is_empty()
            && (n.chars().all(|c| c == '=') || n.chars().all(|c| c == '-') && para.is_empty())
        {
            flush(&mut para, &mut out);
            let h = if n.starts_with('=') { 1 } else { 2 };
            out += &format!("<h{h}>{}</h{h}>\n", inline(t, raw, web));
            i += 2;
            continue;
        }
        para.push(t.to_string());
        i += 1;
    }
    flush(&mut para, &mut out);
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn links_of_sites() {
        assert_eq!(parse("https://gitlab.com/inkscape/inkscape/-/releases"), Some(("gitlab.com/inkscape".into(), "inkscape".into())));
        assert_eq!(parse("gitlab.com/group/sub/project.git"), Some(("gitlab.com/group/sub".into(), "project".into())));
        assert_eq!(parse("https://codeberg.org/forgejo/forgejo/releases"), Some(("codeberg.org/forgejo".into(), "forgejo".into())));
        assert_eq!(parse("https://gitlab.com/explore/projects"), None);
        assert_eq!(parse("https://github.com/a/b"), None);
        assert_eq!(site("gitlab.com/group/sub").0, Site::GitLab);
        assert_eq!(site("sharex").0, Site::GitHub);
    }

    #[test]
    fn markdown_to_html() {
        let h = md_html("# Title\n\nSome **bold** and `code` [docs](docs/a.md) ![s](img/s.png)\n\n- one\n- two\n\n```\nx < y\n```", "https://r/", "https://w/");
        assert!(h.contains("<h1>Title</h1>"));
        assert!(h.contains("<strong>bold</strong>"));
        assert!(h.contains("<code>code</code>"));
        assert!(h.contains("href=\"https://w/docs/a.md\""));
        assert!(h.contains("src=\"https://r/img/s.png\""));
        assert!(h.contains("<ul><li>one</li><li>two</li></ul>"));
        assert!(h.contains("x &lt; y"));
        let t = md_html("<p align=\"center\"><img src=\"logo.png\"></p>", "https://r/", "https://w/");
        assert!(t.contains("src=\"https://r/logo.png\""));
    }

    /// The network: one GitLab and one Codeberg project end to end.
    #[test]
    #[ignore]
    fn live_sites() {
        let m = meta(Site::GitLab, "gitlab.com/inkscape", "inkscape").unwrap();
        assert_eq!(m.branch, "master");
        let r = latest(Site::GitLab, "gitlab.com/inkscape", "inkscape", false).unwrap().unwrap();
        println!("gitlab: {} {} assets", r.tag, r.assets.len());
        let readme = markdown(Site::GitLab, "gitlab.com/inkscape", "inkscape", "").unwrap();
        assert!(readme.contains("<h"));
        let (n, items) = search_gitlab("inkscape", "stars", 1, &json!({})).unwrap();
        println!("gitlab search: {n} {}", items.len());
        let c = meta(Site::Gitea(CODEBERG), "codeberg.org/forgejo", "forgejo").unwrap();
        println!("codeberg: {} ★{}", c.name, c.stars);
        let r = latest(Site::Gitea(CODEBERG), "codeberg.org/forgejo", "forgejo", false).unwrap().unwrap();
        println!("codeberg: {} {} assets", r.tag, r.assets.len());
        let readme = markdown(Site::Gitea(CODEBERG), "codeberg.org/forgejo", "forgejo", "").unwrap();
        assert!(!readme.is_empty());
    }
}
