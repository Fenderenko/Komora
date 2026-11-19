//! Download pages: an app whose files are links on its site's own page (SimHub, Crew Chief and the like —
//! no releases on GitHub, GitLab or Codeberg). Every check reads the page again; the Windows files it links
//! to make the release. Its tag is the version in the chosen file's name, else the file's date from a HEAD
//! request (Last-Modified), else its size: a new file under the same name is still noticed.

use crate::{
    gh,
    library::{Asset, Release},
    link, net,
};

/// File extensions of Windows programs and archives.
const EXTS: [&str; 8] = [".exe", ".msi", ".zip", ".7z", ".msix", ".msixbundle", ".appx", ".appxbundle"];

fn windows_file(name: &str) -> bool {
    let l = name.to_ascii_lowercase();
    EXTS.iter().any(|e| l.ends_with(e) && l.len() > e.len())
}

/// Percent-decoding of a URL part ("Crew%20Chief.msi" → "Crew Chief.msi").
fn unescape(s: &str) -> String {
    let b = s.as_bytes();
    let mut out = Vec::with_capacity(b.len());
    let mut i = 0;
    while i < b.len() {
        if b[i] == b'%'
            && i + 2 < b.len()
            && let Ok(v) = u8::from_str_radix(std::str::from_utf8(&b[i + 1..i + 3]).unwrap_or(""), 16)
        {
            out.push(v);
            i += 3;
            continue;
        }
        out.push(if b[i] == b'+' { b' ' } else { b[i] });
        i += 1;
    }
    String::from_utf8_lossy(&out).into_owned()
}

/// The file name a download link stands for: the last part of the path, else a value of the query
/// ("get.php?file=Tool-1.2.zip"); None — not a Windows file.
fn file_name(url: &str) -> Option<String> {
    let no_frag = url.split('#').next().unwrap_or(url);
    let (path, query) = no_frag.split_once('?').unwrap_or((no_frag, ""));
    let last = unescape(path.rsplit('/').next().unwrap_or(""));
    if windows_file(&last) {
        return Some(last);
    }
    query.split('&').filter_map(|kv| kv.split_once('=').map(|(_, v)| unescape(v))).map(|v| v.rsplit(['/', '\\']).next().unwrap_or("").to_string()).find(|v| windows_file(v))
}

/// The Windows files a page links to, in page order, one per name; only https links.
pub fn files(base: &str, html: &str) -> Vec<Asset> {
    let mut out: Vec<Asset> = Vec::new();
    for t in link::tags(html, "a") {
        let Some(href) = link::attr(t, "href") else { continue };
        let url = link::absolute(base, &href);
        if !url.starts_with("https://") {
            continue;
        }
        let Some(name) = file_name(&url) else { continue };
        if !out.iter().any(|a| a.name.eq_ignore_ascii_case(&name)) {
            out.push(Asset { name, url, size: 0, digest: String::new() });
        }
    }
    out
}

/// The version a file name states: the first run of numbers joined by dots ("SimHub.9.13.5.zip" → "9.13.5",
/// "DS4Windows_3.9.9_x64.zip" → "3.9.9"); None for "CrewChiefV4.msi".
pub fn version_of(name: &str) -> Option<String> {
    let b = name.as_bytes();
    let mut i = 0;
    while i < b.len() {
        if b[i].is_ascii_digit() && (i == 0 || !b[i - 1].is_ascii_digit()) {
            let mut j = i;
            let mut dots = 0;
            while j < b.len() && (b[j].is_ascii_digit() || (b[j] == b'.' && j + 1 < b.len() && b[j + 1].is_ascii_digit())) {
                dots += (b[j] == b'.') as u32;
                j += 1;
            }
            if dots > 0 {
                return Some(name[i..j].to_string());
            }
            i = j;
        }
        i += 1;
    }
    None
}

/// An app's name from its file: "SimHub.9.13.5.zip" → "SimHub", "CrewChiefV4.msi" → "CrewChiefV4",
/// "DS4Windows_3.9.9_x64.zip" → "DS4Windows".
pub fn name_of(file: &str) -> String {
    let stem = file.rsplit_once('.').map_or(file, |(s, _)| s);
    let cut = version_of(stem).and_then(|v| stem.find(&v)).unwrap_or(stem.len());
    let mut n = stem[..cut].trim_end_matches(['.', '_', '-', ' ', 'v', 'V']).to_string();
    for w in ["_setup", "-setup", " setup", "setup", "_installer", "-installer", "_x64", "-x64", "_win64", "-win64"] {
        if n.to_ascii_lowercase().ends_with(w) && n.len() > w.len() {
            n.truncate(n.len() - w.len());
        }
    }
    if n.is_empty() { stem.to_string() } else { n }
}

/// "Sat, 31 Oct 2026 09:00:24 GMT" → "2026-10-31".
fn http_date(s: &str) -> Option<String> {
    const M: [&str; 12] = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    let p: Vec<&str> = s.split_whitespace().collect();
    let (d, m, y) = (p.get(1)?.parse::<u32>().ok()?, p.get(2)?.to_ascii_lowercase(), p.get(3)?.parse::<u32>().ok()?);
    let m = M.iter().position(|x| m.starts_with(x))? + 1;
    Some(format!("{y:04}-{m:02}-{d:02}"))
}

/// (worker thread; blocks) The page's current files as a release; no files — a release without assets.
pub fn release(url: &str, method: &str, asset_match: &str) -> Result<Release, String> {
    let r = net::get_page(url, &[("Accept", "text/html"), ("Accept-Language", "en;q=0.8")], 3 << 20)?;
    if r.status != 200 {
        return Err(format!("the site answered HTTP {}", r.status));
    }
    let mut assets = files(url, &String::from_utf8_lossy(&r.body));
    let mut rel = Release { url: url.to_string(), ..Default::default() };
    let Some((chosen, _)) = gh::pick_for(&assets, method, asset_match) else {
        rel.assets = assets;
        return Ok(rel);
    };
    let (size, modified) = net::head(&chosen.url);
    if let Some(a) = assets.iter_mut().find(|a| a.url == chosen.url) {
        a.size = size;
    }
    let day = http_date(&modified);
    rel.date = day.as_deref().map(|d| format!("{d}T00:00:00Z")).unwrap_or_default();
    // a date as a version reads as one: "2026.10.31"
    rel.tag = version_of(&chosen.name).or(day.map(|d| d.replace('-', "."))).unwrap_or_else(|| if size > 0 { format!("size-{size}") } else { chosen.name.clone() });
    rel.name = chosen.name.clone();
    rel.assets = assets;
    Ok(rel)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn finds_files() {
        let html = r#"<a href="https://github.com/SHWotever/SimHub/releases/download/9.13.5/SimHub.9.13.5.zip">GitHub</a>
            <a class="btn" href='/official/SimHub.9.13.5.zip'>Mirror</a> <a href="/download-2/">page</a>
            <a href="get.php?id=3&file=Crew%20Chief.msi">msi</a> <a href="http://plain.example/x.exe">old</a>"#;
        let f = files("https://www.simhubdash.com/download-2/", html);
        let names: Vec<&str> = f.iter().map(|a| a.name.as_str()).collect();
        assert_eq!(names, ["SimHub.9.13.5.zip", "Crew Chief.msi"]);
        assert_eq!(f[1].url, "https://www.simhubdash.com/download-2/get.php?id=3&file=Crew%20Chief.msi");
    }

    #[test]
    fn versions_and_names() {
        assert_eq!(version_of("SimHub.9.13.5.zip").as_deref(), Some("9.13.5"));
        assert_eq!(version_of("DS4Windows_3.9.9_x64.zip").as_deref(), Some("3.9.9"));
        assert_eq!(version_of("CrewChiefV4.msi"), None);
        assert_eq!(name_of("SimHub.9.13.5.zip"), "SimHub");
        assert_eq!(name_of("CrewChiefV4.msi"), "CrewChiefV4");
        assert_eq!(name_of("DS4Windows_3.9.9_x64.zip"), "DS4Windows");
        assert_eq!(name_of("ToolSetup_2.1.exe"), "Tool");
        assert_eq!(http_date("Sat, 31 Oct 2026 09:00:24 GMT").as_deref(), Some("2026-10-31"));
    }
}

#[cfg(test)]
mod live {
    /// The network: `cargo test -- --ignored live_page --nocapture`.
    #[test]
    #[ignore]
    fn live_page() {
        let r = super::release("https://www.simhubdash.com/download-2/", "auto", "").unwrap();
        println!("{} {} {} {:?}", r.tag, r.name, r.date, r.assets.iter().map(|a| (&a.name, a.size)).collect::<Vec<_>>());
        assert!(r.name.starts_with("SimHub.") && !r.tag.is_empty());
    }
}
