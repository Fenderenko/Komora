//! Steam's game shortcuts (desktop and Start menu): a game moved to another library (another disk) leaves its
//! shortcut with the icon of the old place — a white page. The icon is pointed at the game's new folder (found by the
//! app id in the libraries' manifests); an icon Steam keeps in steam\games that went missing is fetched again from
//! Steam's CDN.

use std::path::{Path, PathBuf};

use crate::{net, util};

/// What one pass did: shortcuts given their icon back, and those whose game is nowhere on this PC.
pub struct Report {
    pub fixed: usize,
    pub lost: usize,
}

fn steam_dir() -> Option<PathBuf> {
    let p = crate::sysinfo::reg_str(windows::Win32::System::Registry::HKEY_CURRENT_USER, r"Software\Valve\Steam", "SteamPath");
    let p = PathBuf::from(p.replace('/', "\\"));
    p.join("steam.exe").is_file().then_some(p)
}

pub fn available() -> bool {
    steam_dir().is_some()
}

/// The value of `"key" "value"` in a Valve KeyValues text, unescaped.
fn vdf_values<'a>(text: &'a str, key: &'a str) -> impl Iterator<Item = String> + 'a {
    text.lines().filter_map(move |l| {
        let mut q = l.split('"').skip(1).step_by(2);
        (q.next()? == key).then(|| q.next().map(|v| v.replace("\\\\", "\\"))).flatten()
    })
}

/// Steam's libraries: its own folder and the others of libraryfolders.vdf.
fn libraries(steam: &Path) -> Vec<PathBuf> {
    let mut out = vec![steam.to_path_buf()];
    let text = std::fs::read_to_string(steam.join(r"steamapps\libraryfolders.vdf")).unwrap_or_default();
    for p in vdf_values(&text, "path") {
        let p = PathBuf::from(p);
        if !out.iter().any(|x| x.to_string_lossy().eq_ignore_ascii_case(&p.to_string_lossy())) {
            out.push(p);
        }
    }
    out
}

/// The folder of an installed game by its app id (its manifest says the folder name).
fn game_dir(libs: &[PathBuf], appid: &str) -> Option<PathBuf> {
    libs.iter().find_map(|lib| {
        let text = std::fs::read_to_string(lib.join(format!(r"steamapps\appmanifest_{appid}.acf"))).ok()?;
        let dir = lib.join(r"steamapps\common").join(vdf_values(&text, "installdir").next()?);
        dir.is_dir().then_some(dir)
    })
}

/// Where Steam puts shortcuts: the desktop (the user's and the shared one) and Steam's folder of the Start menu.
fn shortcut_dirs() -> Vec<PathBuf> {
    use windows::Win32::System::Registry::{HKEY_CURRENT_USER, HKEY_LOCAL_MACHINE};
    let sf = r"Software\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders";
    let mut out: Vec<PathBuf> = Vec::new();
    for (root, name, sub) in [(HKEY_CURRENT_USER, "Desktop", ""), (HKEY_LOCAL_MACHINE, "Common Desktop", ""), (HKEY_CURRENT_USER, "Programs", "Steam")] {
        let p = crate::sysinfo::reg_str(root, sf, name);
        if !p.is_empty() {
            out.push(PathBuf::from(p).join(sub));
        }
    }
    out
}

/// The icon a broken shortcut should have now; None — the game is not on this PC (or Steam's server has no icon).
fn new_icon(steam: &Path, libs: &[PathBuf], appid: &str, old: &str) -> Option<PathBuf> {
    let lower = old.to_ascii_lowercase();
    const COMMON: &str = r"\steamapps\common\";
    if let Some(i) = lower.find(COMMON) {
        // a file of the game itself: the same file in the game's folder now
        let rest = &old[i + COMMON.len()..];
        let (_, inner) = rest.split_once('\\')?;
        if let Some(dir) = game_dir(libs, appid) {
            let p = dir.join(inner);
            if p.is_file() {
                return Some(p);
            }
        }
        return libs.iter().map(|lib| lib.join(r"steamapps\common").join(rest)).find(|p| p.is_file());
    }
    if lower.ends_with(".ico") && lower.contains(r"\steam\games\") {
        // Steam's own copy of the game's icon: named by its hash, the same name on Steam's CDN
        let file = Path::new(old).file_name()?.to_owned();
        let target = steam.join(r"steam\games").join(&file);
        if target.is_file() {
            return Some(target);
        }
        let hash = Path::new(&file).file_stem()?.to_string_lossy().to_string();
        let url = format!("https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/{appid}/{hash}.ico");
        let r = net::get(&url, &[], 1 << 20).ok().filter(|r| r.status == 200 && r.body.starts_with(&[0, 0, 1, 0]))?;
        if target.parent().is_some_and(|d| std::fs::create_dir_all(d).is_ok()) && std::fs::write(&target, &r.body).is_ok() {
            return Some(target);
        }
        // Steam's folder is not writable here: Komora keeps the icon itself
        let alt = util::data_dir().join("steam-icons").join(&file);
        std::fs::create_dir_all(alt.parent()?).ok()?;
        std::fs::write(&alt, &r.body).ok()?;
        return Some(alt);
    }
    None
}

/// Gives broken Steam shortcuts their icon back.
pub fn fix() -> Report {
    run(false)
}

/// `dry`: only says what would change (and prints it), no shortcut is written and nothing is downloaded.
fn run(dry: bool) -> Report {
    let mut rep = Report { fixed: 0, lost: 0 };
    let Some(steam) = steam_dir() else { return rep };
    let libs = libraries(&steam);
    for dir in shortcut_dirs() {
        let Ok(rd) = std::fs::read_dir(&dir) else { continue };
        for e in rd.flatten() {
            let path = e.path();
            if !path.extension().is_some_and(|x| x.eq_ignore_ascii_case("url")) {
                continue;
            }
            let Ok(bytes) = std::fs::read(&path) else { continue };
            let text = String::from_utf8_lossy(&bytes);
            let field = |k: &str| text.lines().find_map(|l| l.trim().strip_prefix(k).map(|v| v.trim().to_string())).unwrap_or_default();
            let url = field("URL=");
            let Some(appid) = url.strip_prefix("steam://rungameid/").map(|s| s.chars().take_while(char::is_ascii_digit).collect::<String>()).filter(|s| !s.is_empty()) else { continue };
            let icon = field("IconFile=");
            if icon.is_empty() || Path::new(&icon).exists() {
                continue;
            }
            // the shortcut keeps its own encoding: only the IconFile line changes, and only to a plain ASCII path
            if dry {
                let lower = icon.to_ascii_lowercase();
                let found = if lower.contains(r"\steam\games\") { Some(PathBuf::from("(Steam CDN)")) } else { new_icon(&steam, &libs, &appid, &icon) };
                println!("{} | {appid} | {icon} -> {found:?}", path.file_name().unwrap_or_default().to_string_lossy());
                if found.is_some() { rep.fixed += 1 } else { rep.lost += 1 }
                continue;
            }
            match new_icon(&steam, &libs, &appid, &icon).map(|p| p.to_string_lossy().to_string()).filter(|p| p.is_ascii()) {
                Some(p) => {
                    let mut out: Vec<u8> = Vec::with_capacity(bytes.len() + 64);
                    for line in bytes.split_inclusive(|&b| b == b'\n') {
                        if line.starts_with(b"IconFile=") {
                            let cr = if line.ends_with(b"\r\n") { "\r\n" } else if line.ends_with(b"\n") { "\n" } else { "" };
                            out.extend_from_slice(format!("IconFile={p}{cr}").as_bytes());
                        } else {
                            out.extend_from_slice(line);
                        }
                    }
                    if std::fs::write(&path, out).is_ok() {
                        rep.fixed += 1;
                    } else {
                        rep.lost += 1;
                    }
                }
                None => rep.lost += 1,
            }
        }
    }
    if rep.fixed > 0 {
        // Explorer reads the icons anew
        unsafe { windows::Win32::UI::Shell::SHChangeNotify(windows::Win32::UI::Shell::SHCNE_ASSOCCHANGED, windows::Win32::UI::Shell::SHCNF_IDLIST, None, None) };
    }
    crate::logf!("steam icons: {} fixed, {} without their game", rep.fixed, rep.lost);
    rep
}

#[cfg(test)]
mod tests {
    /// What a pass would change on this PC, without writing (cargo test -- --ignored --nocapture steam_dry).
    #[test]
    #[ignore]
    fn steam_dry() {
        let r = super::run(true);
        println!("{} would be fixed, {} without their game", r.fixed, r.lost);
    }

    #[test]
    fn keyvalues() {
        let t = "\"libraryfolders\"\n{\n\t\"0\"\n\t{\n\t\t\"path\"\t\t\"D:\\\\SteamLibrary\"\n\t}\n\t\"installdir\"\t\t\"Stray\"\n}";
        assert_eq!(super::vdf_values(t, "path").collect::<Vec<_>>(), vec!["D:\\SteamLibrary".to_string()]);
        assert_eq!(super::vdf_values(t, "installdir").next().as_deref(), Some("Stray"));
    }
}
