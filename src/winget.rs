//! «Picks»: everyday programs installed, updated and removed through winget (Windows Package Manager). What of them
//! is installed goes into the library by itself.

use serde_json::{Value, json};
use std::{
    collections::{HashMap, HashSet},
    io::Read,
    os::windows::process::CommandExt,
    sync::{
        Mutex,
        atomic::{AtomicBool, Ordering},
    },
};

const CREATE_NO_WINDOW: u32 = 0x0800_0000;

/// (winget id, display name, section, names in the Windows list of installed programs ("|"-separated prefixes;
/// "" — none there), the program's site (its icon)). Descriptions and section titles live in the page.
pub const CATALOG: &[(&str, &str, &str, &str, &str)] = &[
    ("Wagnardsoft.DisplayDriverUninstaller", "Display Driver Uninstaller", "hw", "Display Driver Uninstaller", "https://www.wagnardsoft.com"),
    ("Orbmu2k.nvidiaProfileInspector", "NVIDIA Profile Inspector", "hw", "NVIDIA Profile Inspector", "https://github.com/Orbmu2k/nvidiaProfileInspector"),
    ("TechPowerUp.NVCleanstall", "NVCleanstall", "hw", "NVCleanstall", "https://www.techpowerup.com/nvcleanstall/"),
    ("Nvidia.PhysX", "NVIDIA PhysX", "hw", "NVIDIA PhysX", "https://www.nvidia.com"),
    ("Intel.IntelDriverAndSupportAssistant", "Intel Driver & Support Assistant", "hw", "Intel® Driver & Support Assistant|Intel(R) Driver & Support Assistant", "https://www.intel.com"),
    ("Guru3D.Afterburner", "MSI Afterburner", "hw", "MSI Afterburner", "https://www.msi.com/Landing/afterburner/graphics-cards"),
    ("Guru3D.RTSS", "RivaTuner Statistics Server", "hw", "RivaTuner Statistics Server", "https://www.guru3d.com"),
    ("Rem0o.FanControl", "Fan Control", "hw", "FanControl|Fan Control", "https://getfancontrol.com"),
    ("CPUID.CPU-Z", "CPU-Z", "hw", "CPUID CPU-Z|CPU-Z", "https://www.cpuid.com"),
    ("TechPowerUp.GPU-Z", "GPU-Z", "hw", "TechPowerUp GPU-Z|GPU-Z", "https://www.techpowerup.com"),
    ("REALiX.HWiNFO", "HWiNFO", "hw", "HWiNFO", "https://www.hwinfo.com"),
    ("CPUID.HWMonitor", "HWMonitor", "hw", "CPUID HWMonitor|HWMonitor", "https://www.cpuid.com"),
    ("LibreHardwareMonitor.LibreHardwareMonitor", "Libre Hardware Monitor", "hw", "LibreHardwareMonitor|Libre Hardware Monitor", "https://github.com/LibreHardwareMonitor/LibreHardwareMonitor"),
    ("CrystalDewWorld.CrystalDiskInfo", "CrystalDiskInfo", "hw", "CrystalDiskInfo", "https://crystalmark.info"),
    ("CrystalDewWorld.CrystalDiskMark", "CrystalDiskMark", "hw", "CrystalDiskMark", "https://crystalmark.info"),
    ("OCBase.OCCT.Personal", "OCCT", "hw", "OCCT", "https://www.ocbase.com"),
    ("Maxon.CinebenchR23", "Cinebench R23", "hw", "Cinebench R23", "https://www.maxon.net/en/cinebench"),
    ("Valve.Steam", "Steam", "games", "Steam", "https://store.steampowered.com"),
    ("EpicGames.EpicGamesLauncher", "Epic Games Launcher", "games", "Epic Games Launcher", "https://store.epicgames.com"),
    ("Blizzard.BattleNet", "Battle.net", "games", "Battle.net", "https://battle.net"),
    ("ElectronicArts.EADesktop", "EA app", "games", "EA app", "https://www.ea.com"),
    ("Ubisoft.Connect", "Ubisoft Connect", "games", "Ubisoft Connect", "https://www.ubisoft.com"),
    ("GOG.Galaxy", "GOG Galaxy", "games", "GOG GALAXY", "https://www.gog.com"),
    ("RockstarGames.Launcher", "Rockstar Games Launcher", "games", "Rockstar Games Launcher", "https://www.rockstargames.com"),
    ("Amazon.Games", "Amazon Games", "games", "Amazon Games", "https://gaming.amazon.com"),
    ("ItchIo.Itch", "itch", "games", "itch", "https://itch.io"),
    ("Playnite.Playnite", "Playnite", "games", "Playnite", "https://playnite.link"),
    ("HeroicGamesLauncher.HeroicGamesLauncher", "Heroic Games Launcher", "games", "Heroic", "https://heroicgameslauncher.com"),
    ("Nvidia.GeForceNow", "GeForce NOW", "games", "NVIDIA GeForce NOW|GeForce NOW", "https://www.nvidia.com/en-us/geforce-now/"),
    ("Parsec.Parsec", "Parsec", "games", "Parsec", "https://parsec.app"),
    ("Discord.Discord", "Discord", "chat", "Discord", "https://discord.com"),
    ("TeamSpeakSystems.TeamSpeakClient", "TeamSpeak", "chat", "TeamSpeak", "https://www.teamspeak.com"),
    ("Mumble.Mumble.Client", "Mumble", "chat", "Mumble", "https://www.mumble.info"),
    ("Telegram.TelegramDesktop", "Telegram", "chat", "Telegram Desktop", "https://desktop.telegram.org"),
    ("OpenWhisperSystems.Signal", "Signal", "chat", "Signal", "https://signal.org"),
    ("Zoom.Zoom", "Zoom", "chat", "Zoom Workplace|Zoom", "https://zoom.us"),
    ("SlackTechnologies.Slack", "Slack", "chat", "Slack", "https://slack.com"),
    ("OBSProject.OBSStudio", "OBS Studio", "media", "OBS Studio", "https://obsproject.com"),
    ("Streamlabs.Streamlabs", "Streamlabs Desktop", "media", "Streamlabs", "https://streamlabs.com"),
    ("ShareX.ShareX", "ShareX", "media", "ShareX", "https://getsharex.com"),
    ("VideoLAN.VLC", "VLC", "media", "VLC media player", "https://www.videolan.org"),
    ("clsid2.mpc-hc", "MPC-HC", "media", "MPC-HC", "https://github.com/clsid2/mpc-hc"),
    ("CodecGuide.K-LiteCodecPack.Standard", "K-Lite Codec Pack", "media", "K-Lite Codec Pack", "https://codecguide.com"),
    ("Spotify.Spotify", "Spotify", "media", "Spotify", "https://www.spotify.com"),
    ("PeterPawlowski.foobar2000", "foobar2000", "media", "foobar2000", "https://www.foobar2000.org"),
    ("Audacity.Audacity", "Audacity", "media", "Audacity", "https://www.audacityteam.org"),
    ("HandBrake.HandBrake", "HandBrake", "media", "HandBrake", "https://handbrake.fr"),
    ("GIMP.GIMP.3", "GIMP", "media", "GIMP", "https://www.gimp.org"),
    ("7zip.7zip", "7-Zip", "tools", "7-Zip", "https://www.7-zip.org"),
    ("Microsoft.PowerToys", "PowerToys", "tools", "PowerToys", "https://github.com/microsoft/PowerToys"),
    ("voidtools.Everything", "Everything", "tools", "Everything", "https://www.voidtools.com"),
    ("AntibodySoftware.WizTree", "WizTree", "tools", "WizTree", "https://diskanalyzer.com"),
    ("Notepad++.Notepad++", "Notepad++", "tools", "Notepad++", "https://notepad-plus-plus.org"),
    ("Microsoft.VisualStudioCode", "Visual Studio Code", "tools", "Microsoft Visual Studio Code", "https://code.visualstudio.com"),
    ("Microsoft.Sysinternals.ProcessExplorer", "Process Explorer", "tools", "Process Explorer", "https://learn.microsoft.com/sysinternals/"),
    ("Microsoft.Sysinternals.Autoruns", "Autoruns", "tools", "Autoruns", "https://learn.microsoft.com/sysinternals/"),
    ("Bitwarden.Bitwarden", "Bitwarden", "tools", "Bitwarden", "https://bitwarden.com"),
    ("KeePassXCTeam.KeePassXC", "KeePassXC", "tools", "KeePassXC", "https://keepassxc.org"),
    ("qBittorrent.qBittorrent", "qBittorrent", "tools", "qBittorrent", "https://www.qbittorrent.org"),
    ("AnyDesk.AnyDesk", "AnyDesk", "tools", "AnyDesk", "https://anydesk.com"),
    ("Rufus.Rufus", "Rufus", "tools", "Rufus", "https://rufus.ie"),
    ("Ventoy.Ventoy", "Ventoy", "tools", "Ventoy", "https://www.ventoy.net"),
    ("CrystalRich.LockHunter", "LockHunter", "tools", "LockHunter", "https://lockhunter.com"),
    ("Klocman.BulkCrapUninstaller", "Bulk Crap Uninstaller", "tools", "BCUninstaller|Bulk Crap Uninstaller", "https://www.bcuninstaller.com"),
    ("Proton.ProtonVPN", "Proton VPN", "tools", "Proton VPN", "https://protonvpn.com"),
    ("Obsidian.Obsidian", "Obsidian", "tools", "Obsidian", "https://obsidian.md"),
    ("Mozilla.Firefox", "Firefox", "web", "Mozilla Firefox", "https://www.mozilla.org/firefox/"),
    ("Google.Chrome", "Chrome", "web", "Google Chrome", "https://www.google.com/chrome/"),
    ("Brave.Brave", "Brave", "web", "Brave", "https://brave.com"),
    ("TorProject.TorBrowser", "Tor Browser", "web", "Tor Browser", "https://www.torproject.org"),
    ("Vivaldi.Vivaldi", "Vivaldi", "web", "Vivaldi", "https://vivaldi.com"),
    ("LibreWolf.LibreWolf", "LibreWolf", "web", "LibreWolf", "https://librewolf.net"),
    ("Zen-Team.Zen-Browser", "Zen Browser", "web", "Zen Browser", "https://zen-browser.app"),
    ("Microsoft.VCRedist.2015+.x64", "Visual C++ Redistributable (x64)", "runtime", "Microsoft Visual C++ 2015-2022 Redistributable (x64)|Microsoft Visual C++ v14 Redistributable (x64)|Microsoft Visual C++ 2015-2019 Redistributable (x64)", "https://learn.microsoft.com/cpp/windows/latest-supported-vc-redist"),
    ("Microsoft.VCRedist.2015+.x86", "Visual C++ Redistributable (x86)", "runtime", "Microsoft Visual C++ 2015-2022 Redistributable (x86)|Microsoft Visual C++ v14 Redistributable (x86)|Microsoft Visual C++ 2015-2019 Redistributable (x86)", "https://learn.microsoft.com/cpp/windows/latest-supported-vc-redist"),
    ("Microsoft.DirectX", "DirectX End-User Runtime", "runtime", "", "https://www.microsoft.com/download/details.aspx?id=35"),
    ("Microsoft.DotNet.DesktopRuntime.8", ".NET Desktop Runtime 8", "runtime", "Microsoft Windows Desktop Runtime - 8.", "https://dotnet.microsoft.com"),
    ("Microsoft.DotNet.DesktopRuntime.9", ".NET Desktop Runtime 9", "runtime", "Microsoft Windows Desktop Runtime - 9.", "https://dotnet.microsoft.com"),
    ("Microsoft.XNARedist", "XNA Framework", "runtime", "Microsoft XNA Framework Redistributable", "https://www.microsoft.com/download/details.aspx?id=20914"),
    ("EclipseAdoptium.Temurin.21.JRE", "Java (Temurin 21)", "runtime", "Eclipse Temurin JRE with Hotspot 21", "https://adoptium.net"),
    ("Microsoft.EdgeWebView2Runtime", "WebView2 Runtime", "runtime", "Microsoft Edge WebView2 Runtime", "https://developer.microsoft.com/microsoft-edge/webview2/"),
];

#[derive(Default)]
struct State {
    /// winget id (lower case) → installed version that winget knows
    winget: HashMap<String, String>,
    /// winget id (lower case) → its entry in the Windows list of installed programs
    arp: HashMap<String, crate::install::Found>,
    /// winget id (lower case) → newer version available
    upgrades: HashMap<String, String>,
    /// winget id (lower case) → icon file in www/icons
    icons: HashMap<String, String>,
    /// sites whose icon was already looked for in this run
    tried: HashSet<String>,
    scanned_at: i64,
    scanning: bool,
    err: String,
}

static STATE: Mutex<Option<State>> = Mutex::new(None);

fn with<R>(f: impl FnOnce(&mut State) -> R) -> R {
    f(STATE.lock().unwrap().get_or_insert_with(State::default))
}

fn exe() -> Option<std::path::PathBuf> {
    let p = std::path::PathBuf::from(std::env::var_os("LOCALAPPDATA")?).join(r"Microsoft\WindowsApps\winget.exe");
    // the App Execution Alias is a reparse point: exists() follows it, symlink_metadata() sees the alias itself
    std::fs::symlink_metadata(&p).is_ok().then_some(p)
}

pub fn available() -> bool {
    exe().is_some()
}

/// Runs winget without a window; stdout as text and the exit code.
fn run(args: &[&str]) -> Result<(String, i32), String> {
    let exe = exe().ok_or("winget is not installed")?;
    let out = std::process::Command::new(exe).args(args).args(["--accept-source-agreements", "--disable-interactivity"]).creation_flags(CREATE_NO_WINDOW).output().map_err(|e| e.to_string())?;
    Ok((String::from_utf8_lossy(&out.stdout).into_owned(), out.status.code().unwrap_or(-1)))
}

/// Runs winget without a window, giving each line of its output as it comes (lines end with CR or LF).
fn run_stream(args: &[&str], pid: &std::sync::atomic::AtomicU32, mut on_line: impl FnMut(&str)) -> Result<(String, i32), String> {
    let exe = exe().ok_or("winget is not installed")?;
    let mut child = std::process::Command::new(exe)
        .args(args)
        .args(["--accept-source-agreements", "--disable-interactivity"])
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::null())
        .creation_flags(CREATE_NO_WINDOW)
        .spawn()
        .map_err(|e| e.to_string())?;
    pid.store(child.id(), Ordering::Relaxed);
    let mut out = child.stdout.take().ok_or("no output")?;
    let (mut all, mut cur) = (Vec::new(), Vec::new());
    let mut buf = [0u8; 4096];
    while let Ok(n) = out.read(&mut buf) {
        if n == 0 {
            break;
        }
        for &b in &buf[..n] {
            all.push(b);
            if b == b'\r' || b == b'\n' {
                if !cur.is_empty() {
                    on_line(String::from_utf8_lossy(&cur).trim());
                    cur.clear();
                }
            } else {
                cur.push(b);
            }
        }
    }
    if !cur.is_empty() {
        on_line(String::from_utf8_lossy(&cur).trim());
    }
    let code = child.wait().map_err(|e| e.to_string())?.code().unwrap_or(-1);
    Ok((String::from_utf8_lossy(&all).into_owned(), code))
}

/// While winget downloads a package: the share of its file already in %TEMP%\WinGet\<id>.<version>\ against the size
/// the server gives. Stops with `stop`, or when the file is complete.
fn watch_download(id: &str, url: &Mutex<String>, stop: &AtomicBool, pid: &std::sync::atomic::AtomicU32, progress: &(dyn Fn(&str, f32) + Sync)) {
    let dir = std::env::temp_dir().join("WinGet");
    let prefix = format!("{}.", id.to_lowercase());
    let started = std::time::SystemTime::now();
    let mut total = 0u64;
    let mut asked = false;
    while !stop.load(Ordering::Relaxed) {
        std::thread::sleep(std::time::Duration::from_millis(300));
        // cancelled while downloading: winget stops (the installer has not started yet)
        if crate::actions::cancelled(&lib_id(id)) {
            kill(pid.load(Ordering::Relaxed));
            break;
        }
        let u = url.lock().unwrap().clone();
        if u.is_empty() {
            continue;
        }
        if !asked {
            asked = true;
            total = crate::net::content_length(&u);
        }
        if total == 0 {
            continue;
        }
        // the newest file of this package's folder written since the install began
        let size = std::fs::read_dir(&dir)
            .into_iter()
            .flatten()
            .flatten()
            .filter(|e| e.file_name().to_string_lossy().to_lowercase().starts_with(&prefix))
            .flat_map(|e| std::fs::read_dir(e.path()).into_iter().flatten().flatten())
            .filter_map(|f| f.metadata().ok())
            .filter(|m| m.is_file() && m.modified().is_ok_and(|t| t >= started))
            .map(|m| m.len())
            .max()
            .unwrap_or(0);
        if stop.load(Ordering::Relaxed) {
            break;
        }
        if size >= total {
            progress("install", -1.0);
            break;
        }
        progress("download", size as f32 / total as f32);
    }
}

/// Stops a process by its id.
fn kill(pid: u32) {
    use windows::Win32::{
        Foundation::CloseHandle,
        System::Threading::{OpenProcess, PROCESS_TERMINATE, TerminateProcess},
    };
    if pid == 0 {
        return;
    }
    if let Ok(h) = unsafe { OpenProcess(PROCESS_TERMINATE, false, pid) } {
        let _ = unsafe { TerminateProcess(h, 1) };
        let _ = unsafe { CloseHandle(h) };
    }
}

/// Whether the program is running now: its exe from the Windows list, or a process named as the program («Slack.exe»).
fn is_running(id: &str) -> bool {
    use windows::Win32::System::Diagnostics::ToolHelp::{CreateToolhelp32Snapshot, PROCESSENTRY32W, Process32FirstW, Process32NextW, TH32CS_SNAPPROCESS};
    let Some((_, name, ..)) = CATALOG.iter().find(|c| c.0.eq_ignore_ascii_case(id)) else { return false };
    let exe = with(|s| s.arp.get(&id.to_lowercase()).map(|f| f.exe.clone()).unwrap_or_default());
    let exe_name = std::path::Path::new(&exe).file_name().map(|f| f.to_string_lossy().to_lowercase()).unwrap_or_default();
    let want = crate::install::norm(name);
    let Ok(snap) = (unsafe { CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0) }) else { return false };
    let mut e = PROCESSENTRY32W { dwSize: std::mem::size_of::<PROCESSENTRY32W>() as u32, ..Default::default() };
    let mut found = false;
    let mut ok = unsafe { Process32FirstW(snap, &mut e) }.is_ok();
    while ok && !found {
        let end = e.szExeFile.iter().position(|&c| c == 0).unwrap_or(e.szExeFile.len());
        let p = String::from_utf16_lossy(&e.szExeFile[..end]).to_lowercase();
        let stem = crate::install::norm(p.trim_end_matches(".exe"));
        found = (!exe_name.is_empty() && p == exe_name) || (!want.is_empty() && stem == want);
        ok = unsafe { Process32NextW(snap, &mut e) }.is_ok();
    }
    let _ = unsafe { windows::Win32::Foundation::CloseHandle(snap) };
    found
}

/// The installed version as winget lists it now (one package; "" — not listed).
fn version_now(id: &str) -> String {
    run(&["list", "--id", id, "--exact"]).ok().and_then(|(t, _)| {
        t.lines().find_map(|l| {
            let toks: Vec<&str> = l.split_whitespace().collect();
            let i = toks.iter().position(|x| x.eq_ignore_ascii_case(id))?;
            toks.get(i + 1).map(|v| v.to_string())
        })
    }).unwrap_or_default()
}

/// What winget tells about a package (`winget show`): publisher, description, site, licence, release notes, tags,
/// installer. The labels are winget's English ones; another language of winget gives nothing (the page then shows
/// only its own description).
pub fn show(id: &str) -> Result<Value, String> {
    if !in_catalog(id) {
        return Err("not in the catalog".into());
    }
    let (out, code) = run(&["show", "--id", id, "--exact"])?;
    if code != 0 {
        return Err(format!("winget exited with code {code}"));
    }
    Ok(parse_show(&out))
}

fn parse_show(out: &str) -> Value {
    let mut m = serde_json::Map::new();
    let mut key = String::new();
    for line in out.lines() {
        let indented = line.starts_with(' ') || line.starts_with('\t');
        let t = line.trim();
        if t.is_empty() {
            continue;
        }
        if !indented && let Some((k, v)) = t.split_once(':').filter(|(k, _)| !k.contains("://") && k.len() < 40) {
            key = k.trim().to_string();
            m.insert(key.clone(), Value::String(v.trim().to_string()));
        } else if !key.is_empty() {
            // a continued value (description, release notes) or one more tag
            let prev = m.get(&key).and_then(Value::as_str).unwrap_or_default().to_string();
            m.insert(key.clone(), Value::String(if prev.is_empty() { t.to_string() } else if key == "Tags" { format!("{prev}, {t}") } else { format!("{prev}\n{t}") }));
        }
    }
    let g = |k: &str| m.get(k).and_then(Value::as_str).unwrap_or_default().to_string();
    let url = |k: &str| Some(g(k)).filter(|u| u.starts_with("https://") || u.starts_with("http://")).unwrap_or_default();
    json!({
        "version": g("Version"), "publisher": g("Publisher"), "publisherUrl": url("Publisher Url"), "author": g("Author"), "desc": g("Description"),
        "homepage": url("Homepage"), "license": g("License"), "licenseUrl": url("License Url"), "notes": g("Release Notes"),
        "notesUrl": url("Release Notes Url"), "tags": g("Tags"), "type": g("Installer Type"), "date": g("Release Date"),
    })
}

/// Versions winget knows: `winget export` lists its packages without the table truncation (not all of them: a
/// program it matched by name only may be missing, the Windows list covers those).
fn exported() -> Result<HashMap<String, String>, String> {
    let tmp = std::env::temp_dir().join(format!("komora-winget-{}.json", crate::util::unix_ms()));
    let tp = tmp.to_string_lossy().to_string();
    let r = run(&["export", "-o", &tp, "--include-versions"]);
    let text = std::fs::read_to_string(&tmp).unwrap_or_default();
    let _ = std::fs::remove_file(&tmp);
    r?;
    let v: Value = serde_json::from_str(text.trim_start_matches('\u{feff}')).map_err(|_| "winget export gave no list".to_string())?;
    let mut m = HashMap::new();
    for src in v["Sources"].as_array().into_iter().flatten() {
        for p in src["Packages"].as_array().into_iter().flatten() {
            if let (Some(id), Some(ver)) = (p["PackageIdentifier"].as_str(), p["Version"].as_str()) {
                // «Unknown» and «< 1.2» say winget does not know the version: the Windows list or the exe tell it
                let ver = if ver.eq_ignore_ascii_case("unknown") || ver.starts_with('<') { "" } else { ver };
                m.insert(id.to_lowercase(), ver.to_string());
            }
        }
    }
    Ok(m)
}

/// Parts of Windows and runtimes that winget lists among programs: offered unchecked in the import.
const SYSTEM: [&str; 14] = [
    "microsoft.vcredist",
    "microsoft.dotnet",
    "microsoft.windowsappruntime",
    "microsoft.ui.xaml",
    "microsoft.vclibs",
    "microsoft.appinstaller",
    "microsoft.edge",
    "microsoft.directx",
    "microsoft.onedrive",
    "microsoft.gameinput",
    "microsoft.windowssdk",
    "microsoft.webview2",
    "microsoft.xnaredist",
    "nvidia.physx",
];

/// A winget id as winget writes them: "Publisher.Name[.More]", letters, digits and «.-_+».
pub fn valid_id(id: &str) -> bool {
    id.contains('.') && id.len() < 128 && id.chars().all(|c| c.is_ascii_alphanumeric() || ".-_+".contains(c))
}

/// Names of packages from the `winget list` table: columns start where the header's words do (any language);
/// the id column may end with «…» when winget cut it.
fn list_names(table: &str) -> HashMap<String, String> {
    let lines: Vec<&str> = table.lines().collect();
    let mut out = HashMap::new();
    let Some(sep) = lines.iter().position(|l| l.trim().len() > 10 && l.trim().chars().all(|c| c == '-')) else { return out };
    let Some(head) = sep.checked_sub(1).map(|i| lines[i]) else { return out };
    let hc: Vec<char> = head.chars().collect();
    let starts: Vec<usize> = (0..hc.len()).filter(|&i| !hc[i].is_whitespace() && (i == 0 || hc[i - 1].is_whitespace())).collect();
    if starts.len() < 3 {
        return out;
    }
    for l in &lines[sep + 1..] {
        let c: Vec<char> = l.chars().collect();
        if c.len() <= starts[1] {
            continue;
        }
        let name: String = c[..starts[1].min(c.len())].iter().collect::<String>().trim().to_string();
        let id: String = c[starts[1]..starts[2].min(c.len())].iter().collect::<String>().trim().to_string();
        if !name.is_empty() && !id.is_empty() {
            out.insert(id.to_lowercase(), name);
        }
    }
    out
}

/// (worker; a few seconds) Programs of this PC that winget can install anywhere (its own source):
/// (id, name, version, a part of Windows or a runtime).
pub fn installed_list() -> Result<Vec<(String, String, String, bool)>, String> {
    let tmp = std::env::temp_dir().join(format!("komora-winget-{}.json", crate::util::unix_ms()));
    let tp = tmp.to_string_lossy().to_string();
    let r = run(&["export", "-o", &tp, "--include-versions", "--source", "winget"]);
    let text = std::fs::read_to_string(&tmp).unwrap_or_default();
    let _ = std::fs::remove_file(&tmp);
    r?;
    let v: Value = serde_json::from_str(text.trim_start_matches('\u{feff}')).map_err(|_| "winget export gave no list".to_string())?;
    let names = run(&["list", "--source", "winget"]).map(|(t, _)| list_names(&t)).unwrap_or_default();
    let name_of = |id: &str| {
        let k = id.to_lowercase();
        names
            .get(&k)
            .or_else(|| names.iter().find(|(n, _)| n.ends_with('…') && k.starts_with(n.trim_end_matches('…'))).map(|(_, v)| v))
            .cloned()
            .unwrap_or_else(|| id.rsplit('.').next().unwrap_or(id).to_string())
    };
    let mut out: Vec<(String, String, String, bool)> = Vec::new();
    for src in v["Sources"].as_array().into_iter().flatten() {
        for p in src["Packages"].as_array().into_iter().flatten() {
            let Some(id) = p["PackageIdentifier"].as_str().filter(|i| valid_id(i)) else { continue };
            let ver = p["Version"].as_str().filter(|v| !v.eq_ignore_ascii_case("unknown") && !v.starts_with(['<', '>'])).unwrap_or("");
            let k = id.to_lowercase();
            out.push((id.to_string(), name_of(id), ver.to_string(), SYSTEM.iter().any(|s| k.starts_with(s))));
        }
    }
    out.sort_by(|a, b| a.3.cmp(&b.3).then(a.1.to_lowercase().cmp(&b.1.to_lowercase())));
    Ok(out)
}

/// Whether an entry of the Windows list is the program: the prefix is the whole name or is followed by a version,
/// a bracket or a mark («MSI Afterburner 4.6.6», «HWiNFO® 64», «7-Zip 23.01 (x64)»), not by another word
/// («Discord PTB», «Steamworks»).
fn arp_match(display: &str, prefix: &str) -> bool {
    let (d, p) = (display.to_lowercase(), prefix.to_lowercase());
    let Some(rest) = d.strip_prefix(&p) else { return false };
    let r = rest.trim_start_matches([' ', '®', '™', '-', '–']);
    let r = r.strip_prefix("version ").unwrap_or(r);
    r.is_empty() || r.starts_with(|c: char| c.is_ascii_digit() || c == '(' || c == '.') || (r.starts_with('v') && r[1..].starts_with(|c: char| c.is_ascii_digit()))
}

/// Catalog programs in the Windows list of installed programs.
fn from_windows() -> HashMap<String, crate::install::Found> {
    let all = crate::install::installed_programs();
    let mut m = HashMap::new();
    for (id, name, _, arp, _) in CATALOG {
        if arp.is_empty() {
            continue;
        }
        if let Some(f) = all.iter().find(|f| arp.split('|').any(|p| arp_match(&f.name, p))) {
            let mut f = f.clone();
            // a portable package (winget unpacks it into its own folder) names no exe: the one in its folder
            if f.exe.is_empty() && !f.dir.is_empty() {
                f.exe = exe_in(std::path::Path::new(&f.dir), name);
            }
            // some setups (Battle.net) leave the version out of the list: the exe's own version then
            if f.version.is_empty() && !f.exe.is_empty() {
                f.version = file_version(&f.exe);
            }
            m.insert(id.to_lowercase(), f);
        }
    }
    m
}

/// The program's exe in its folder (two levels deep): the one named like the program, else the only one ("" — none).
fn exe_in(dir: &std::path::Path, name: &str) -> String {
    let want = crate::install::norm(name);
    let mut found: Vec<std::path::PathBuf> = Vec::new();
    let mut walk = vec![(dir.to_path_buf(), 0)];
    while let Some((d, depth)) = walk.pop() {
        let Ok(rd) = std::fs::read_dir(&d) else { continue };
        for e in rd.flatten() {
            let p = e.path();
            if p.is_dir() && depth < 2 {
                walk.push((p, depth + 1));
            } else if p.extension().is_some_and(|x| x.eq_ignore_ascii_case("exe")) && !crate::install::norm(&p.to_string_lossy()).contains("unins") {
                found.push(p);
            }
        }
    }
    let by_name = found.iter().find(|p| {
        let stem = crate::install::norm(&p.file_stem().unwrap_or_default().to_string_lossy());
        !stem.is_empty() && (want.contains(&stem) || stem.contains(&want))
    });
    by_name.or(if found.len() == 1 { found.first() } else { None }).map(|p| p.to_string_lossy().to_string()).unwrap_or_default()
}

/// The product version of an exe ("" — it has none).
pub fn file_version(path: &str) -> String {
    use windows::{
        Win32::Storage::FileSystem::{GetFileVersionInfoSizeW, GetFileVersionInfoW, VS_FIXEDFILEINFO, VerQueryValueW},
        core::{HSTRING, w},
    };
    let p = HSTRING::from(path);
    let size = unsafe { GetFileVersionInfoSizeW(&p, None) };
    if size == 0 {
        return String::new();
    }
    let mut buf = vec![0u8; size as usize];
    if unsafe { GetFileVersionInfoW(&p, None, size, buf.as_mut_ptr() as *mut _) }.is_err() {
        return String::new();
    }
    let mut info: *mut core::ffi::c_void = std::ptr::null_mut();
    let mut len = 0u32;
    if !unsafe { VerQueryValueW(buf.as_ptr() as *const _, w!("\\"), &mut info, &mut len) }.as_bool() || info.is_null() || (len as usize) < std::mem::size_of::<VS_FIXEDFILEINFO>() {
        return String::new();
    }
    let f = unsafe { &*(info as *const VS_FIXEDFILEINFO) };
    let (ms, ls) = (f.dwProductVersionMS, f.dwProductVersionLS);
    if ms == 0 && ls == 0 {
        return String::new();
    }
    format!("{}.{}.{}.{}", ms >> 16, ms & 0xFFFF, ls >> 16, ls & 0xFFFF)
}

/// Newer versions of the catalog's packages from the `winget upgrade` table: in a row the id is followed by the
/// installed version (possibly «< x»), the available one and the source.
fn upgrades(table: &str) -> HashMap<String, String> {
    let mut m = HashMap::new();
    for line in table.lines() {
        let toks: Vec<&str> = line.split_whitespace().collect();
        for (id, ..) in CATALOG {
            let Some(i) = toks.iter().position(|t| t.eq_ignore_ascii_case(id)) else { continue };
            let rest = &toks[i + 1..];
            // version, available, source; «< 1.2» means winget does not know the installed version — no update is
            // offered on a guess (Ubisoft Connect updates itself and keeps an old number in the Windows list)
            if rest.first() == Some(&"<") {
                continue;
            }
            if rest.len() >= 3 {
                m.insert(id.to_lowercase(), rest[rest.len() - 2].to_string());
            }
        }
    }
    m
}

/// (lower id) Installed: the version (winget's, else the Windows list's; "" — unknown) or None.
fn inst_of(s: &State, k: &str) -> Option<String> {
    match (s.winget.get(k), s.arp.get(k)) {
        (Some(w), a) if !w.is_empty() || a.is_none() => Some(w.clone()),
        (_, Some(f)) => Some(f.version.clone()),
        _ => None,
    }
}

/// Reads what is installed and what can be updated (a few seconds; called from a worker), then the icons.
pub fn scan() {
    if with(|s| std::mem::replace(&mut s.scanning, true)) {
        return;
    }
    // icons saved by earlier runs show at once, not after the scan
    if cached_icons() {
        sync_library();
    }
    crate::actions::event_ui(json!({ "t": "winget", "data": json() }));
    let arp = from_windows();
    let wg = available().then(|| (exported(), run(&["upgrade"]).map(|(t, _)| upgrades(&t))));
    with(|s| {
        s.scanning = false;
        s.scanned_at = crate::util::unix();
        s.arp = arp;
        match wg {
            Some((Ok(i), Ok(u))) => {
                s.winget = i;
                s.upgrades = u;
                s.err.clear();
            }
            Some((Err(e), _) | (_, Err(e))) => s.err = e,
            None => {}
        }
    });
    sync_library();
    crate::logf!("winget: {} catalog packages installed, {} updates", count_installed(), update_count());
    crate::actions::event_ui(json!({ "t": "winget", "data": json() }));
    crate::actions::state_changed();
    icons();
}

fn icon_stem(id: &str) -> String {
    format!("wg-{}", crate::install::norm(id))
}

/// (any thread; a directory listing) Icons saved by earlier runs, for the packages that have none yet: the exe's own
/// first, else the site's. True when any was added.
fn cached_icons() -> bool {
    let Ok(rd) = std::fs::read_dir(crate::util::www_dir().join("icons")) else { return false };
    let files: HashSet<String> = rd.flatten().filter_map(|e| e.file_name().into_string().ok()).filter(|f| f.starts_with("wg-")).collect();
    let mut added = false;
    for (id, ..) in CATALOG {
        let k = id.to_lowercase();
        if with(|s| s.icons.contains_key(&k)) {
            continue;
        }
        let stem = icon_stem(id);
        let own = format!("{stem}-x.ico");
        let f = if files.contains(&own) { Some(own) } else { ["png", "ico", "svg", "jpg", "gif", "webp"].iter().map(|e| format!("{stem}.{e}")).find(|f| files.contains(f)) };
        if let Some(f) = f {
            with(|s| s.icons.insert(k, f));
            added = true;
        }
    }
    added
}

/// (worker) A site's icon: the one its page names, its /favicon.ico, else DuckDuckGo's copy of the site's icon (for
/// sites that turn automated requests away). Saved under `stem`.
fn site_icon(site: &str, stem: &str) -> Option<String> {
    let page = crate::link::fetch(site).ok().map(|p| p.icon).filter(|u| !u.is_empty());
    let host = crate::net::split_url(site).map(|(h, ..)| h.to_string()).unwrap_or_default();
    page.and_then(|u| crate::link::cache_icon(&u, stem))
        .or_else(|| crate::link::cache_icon(&crate::link::absolute(site, "/favicon.ico"), stem))
        .or_else(|| (!host.is_empty()).then(|| crate::link::cache_icon(&format!("https://icons.duckduckgo.com/ip3/{host}.ico"), stem)).flatten())
}

/// How many sites are asked for their icon at once.
const ICON_JOBS: usize = 8;

/// Icons of the catalog: the installed program's own (its exe), else the one of its site; cached in www/icons. Sites
/// are asked several at a time, and the page gets each batch as it comes; packages of one site share its icon.
fn icons() {
    let dir = crate::util::www_dir().join("icons");
    let mut changed = cached_icons();
    let mut sites: Vec<(&str, Vec<(String, String)>)> = Vec::new();
    for (id, _, _, _, site) in CATALOG {
        let k = id.to_lowercase();
        let stem = icon_stem(id);
        let exe = with(|s| s.arp.get(&k).map(|a| a.exe.clone()).unwrap_or_default());
        let own = format!("{stem}-x.ico");
        let cur = with(|s| s.icons.get(&k).cloned());
        if cur.as_deref() == Some(own.as_str()) {
            continue;
        }
        // the exe's icon, once it is installed
        if !exe.is_empty() && (dir.join(&own).is_file() || crate::icon::from_exe(std::path::Path::new(&exe)).is_some_and(|b| std::fs::write(dir.join(&own), b).is_ok())) {
            with(|s| s.icons.insert(k, own));
            changed = true;
            continue;
        }
        if cur.is_some() {
            continue;
        }
        match sites.iter_mut().find(|(s, _)| s == site) {
            Some((_, list)) => list.push((k, stem)),
            None => sites.push((site, vec![(k, stem)])),
        }
    }
    sites.retain(|(site, _)| with(|s| s.tried.insert(site.to_string())));
    if changed {
        sync_library();
        crate::actions::event_ui(json!({ "t": "winget", "data": json() }));
        crate::actions::state_changed();
    }
    for batch in sites.chunks(ICON_JOBS) {
        let got: Vec<Option<String>> = std::thread::scope(|sc| {
            let jobs: Vec<_> = batch.iter().map(|(site, list)| sc.spawn(move || site_icon(site, &list[0].1))).collect();
            jobs.into_iter().map(|j| j.join().ok().flatten()).collect()
        });
        let mut any = false;
        for ((_, list), f) in batch.iter().zip(got) {
            let Some(f) = f else { continue };
            // each package keeps its own copy, so the next run finds it by its own name
            for (i, (k, stem)) in list.iter().enumerate() {
                let ext = f.rsplit('.').next().unwrap_or("png");
                let own = format!("{stem}.{ext}");
                let name = if i == 0 || std::fs::copy(dir.join(&f), dir.join(&own)).is_err() { f.clone() } else { own };
                with(|s| s.icons.insert(k.clone(), name));
            }
            any = true;
        }
        if any {
            sync_library();
            crate::actions::event_ui(json!({ "t": "winget", "data": json() }));
            crate::actions::state_changed();
        }
    }
}

/// The library id of a winget package: "wg:" and the package id as winget spells it.
pub fn lib_id(id: &str) -> String {
    format!("wg:{id}")
}

/// Library entries of winget packages take their versions, folder, exe and icon from the last scan; installed catalog
/// programs not yet in the library go in (not those the user took out of it).
fn sync_library() {
    let (vers, arp, upg, icons, scanned) = with(|s| {
        let vers: HashMap<String, Option<String>> = CATALOG.iter().map(|(id, ..)| id.to_lowercase()).chain(s.winget.keys().cloned()).map(|k| { let v = inst_of(s, &k); (k, v) }).collect();
        (vers, s.arp.clone(), s.upgrades.clone(), s.icons.clone(), s.scanned_at > 0)
    });
    if !scanned {
        return;
    }
    crate::library::update(|l| {
        let now = crate::util::unix();
        for (pid, name, ..) in CATALOG {
            let lid = lib_id(pid);
            if vers.get(&pid.to_lowercase()).is_some_and(Option::is_some) && !l.removed.contains_key(&lid) && !l.apps.iter().any(|a| a.id == lid) {
                l.apps.push(crate::library::App { id: lid, kind: "winget".into(), repo: pid.to_string(), name: name.to_string(), url: format!("https://winstall.app/apps/{pid}"), added: now, updated: now, kit: crate::config::get().kit_new, ..Default::default() });
            }
        }
        for a in l.apps.iter_mut().filter(|a| a.kind == "winget") {
            let k = a.repo.to_lowercase();
            match vers.get(&k).cloned().flatten() {
                Some(v) => {
                    let i = a.inst.get_or_insert_with(Default::default);
                    i.version = v;
                    i.method = "winget".into();
                    if let Some(f) = arp.get(&k) {
                        i.exe = f.exe.clone();
                        i.dir = f.dir.clone();
                        i.uninstall = f.uninstall.clone();
                    }
                }
                None => a.inst = None,
            }
            let newest = upg.get(&k).cloned().or_else(|| a.inst.as_ref().map(|i| i.version.clone())).unwrap_or_default();
            a.latest = (!newest.is_empty()).then(|| crate::library::Release { tag: newest, ..Default::default() });
            if let Some(f) = icons.get(&k)
                && a.icon != *f
            {
                a.icon = f.clone();
                a.icon_src = if f.ends_with("-x.ico") { "exe" } else { "site" }.into();
            }
        }
    });
}

/// Puts a catalog package into the library (after Komora installed it), once.
pub fn add_to_library(id: &str) {
    let Some((pid, name, ..)) = CATALOG.iter().find(|(x, ..)| x.eq_ignore_ascii_case(id)) else { return };
    let lid = lib_id(pid);
    crate::library::update(|l| {
        if l.apps.iter().any(|a| a.id == lid) {
            return;
        }
        let now = crate::util::unix();
        l.apps.push(crate::library::App { id: lid.clone(), kind: "winget".into(), repo: pid.to_string(), name: name.to_string(), url: format!("https://winstall.app/apps/{pid}"), added: now, updated: now, kit: crate::config::get().kit_new, ..Default::default() });
    });
    sync_library();
}

fn count_installed() -> usize {
    with(|s| CATALOG.iter().filter(|(id, ..)| inst_of(s, &id.to_lowercase()).is_some()).count())
}

/// Catalog packages installed here that have a newer version and are not in the library (the library counts its own).
pub fn update_count() -> usize {
    let lib = crate::library::get();
    let skip = crate::config::get().wg_skip;
    with(|s| {
        CATALOG
            .iter()
            .filter(|(id, ..)| {
                let k = id.to_lowercase();
                s.upgrades.get(&k).is_some_and(|v| skip.get(&k) != Some(v)) && inst_of(s, &k).is_some() && !lib.apps.iter().any(|a| a.id == lib_id(id))
            })
            .count()
    })
}

pub fn in_catalog(id: &str) -> bool {
    CATALOG.iter().any(|(x, ..)| x.eq_ignore_ascii_case(id))
}

/// Installs or updates one package silently, a new install into `location` when given (not every installer takes
/// it: the caller compares with where the program went); the scan afterwards refreshes the versions.
pub fn install(id: &str, location: &str, progress: &(dyn Fn(&str, f32) + Sync)) -> Result<(), String> {
    // the catalog's packages and those the user brought into the library from this or another PC
    if !in_catalog(id) && !(valid_id(id) && crate::library::app(&lib_id(id)).is_some()) {
        return Err("not in the catalog".into());
    }
    let name = CATALOG.iter().find(|c| c.0.eq_ignore_ascii_case(id)).map(|c| c.1).unwrap_or(id);
    // a program winget did not match stays «install»: winget installs over it
    let up = with(|s| s.winget.contains_key(&id.to_lowercase()));
    let verb = if up { "upgrade" } else { "install" };
    let mut args = vec![verb, "--id", id, "--exact", "--silent", "--accept-package-agreements"];
    if !up && !location.is_empty() {
        args.extend(["--location", location]);
    }
    // a running program (an MSIX one above all) is not replaced: winget fails or nothing changes
    let running = up && is_running(id);
    let before = if running { version_now(id) } else { String::new() };
    progress("download", -1.0);
    let url = Mutex::new(String::new());
    let stop = AtomicBool::new(false);
    let pid = std::sync::atomic::AtomicU32::new(0);
    let r = std::thread::scope(|sc| {
        sc.spawn(|| watch_download(id, &url, &stop, &pid, progress));
        let r = run_stream(&args, &pid, |line| {
            // the address of the installer is the one link winget prints (any language)
            if let Some(i) = line.find("https://") {
                let mut u = url.lock().unwrap();
                if u.is_empty() {
                    *u = line[i..].split_whitespace().next().unwrap_or("").to_string();
                }
            } else if line.starts_with("Successfully verified") || line.starts_with("Starting package install") {
                stop.store(true, Ordering::Relaxed);
                progress("install", -1.0);
            }
        });
        stop.store(true, Ordering::Relaxed);
        r
    });
    let (out, code) = r?;
    crate::logf!("winget {verb} {id}: exit {code}");
    if crate::actions::cancelled(&lib_id(id)) && code != 0 {
        return Err("cancelled".into());
    }
    // 0x8A15002B: nothing newer to install — not an error
    if code == 0 || code as u32 == 0x8A15_002B {
        if running && !before.is_empty() && version_now(id) == before {
            return Err(format!("{name} is running: close it and update again"));
        }
        return Ok(());
    }
    if running {
        return Err(format!("{name} is running: close it and update again"));
    }
    let last = out.lines().map(str::trim).filter(|l| !l.is_empty() && !l.starts_with('-') && !l.chars().all(|c| "\\|/-█▒ ".contains(c))).last().unwrap_or("").to_string();
    Err(if last.is_empty() { format!("winget exited with code {code}") } else { last })
}

/// Where Windows lists the program's folder after an install ("" — not listed).
pub fn installed_dir(id: &str) -> String {
    let k = id.to_lowercase();
    let (_, _, _, arp, _) = CATALOG.iter().find(|(x, ..)| x.eq_ignore_ascii_case(id)).copied().unwrap_or(("", "", "", "", ""));
    if arp.is_empty() {
        return String::new();
    }
    crate::install::installed_programs().into_iter().find(|f| arp.split('|').any(|p| arp_match(&f.name, p))).map(|f| f.dir).unwrap_or_else(|| with(|s| s.arp.get(&k).map(|f| f.dir.clone()).unwrap_or_default()))
}

/// Removes a program of the library that came from the catalog: through winget when it knows the package, else
/// with the program's own uninstaller from the Windows list. Ok(true) — it is gone.
pub fn uninstall(app: &crate::library::App) -> Result<bool, String> {
    let id = app.repo.as_str();
    let known = with(|s| s.winget.contains_key(&id.to_lowercase()));
    if known && available() {
        let (out, code) = run(&["uninstall", "--id", id, "--exact", "--silent"])?;
        crate::logf!("winget uninstall {id}: exit {code}");
        if code != 0 {
            let last = out.lines().map(str::trim).filter(|l| !l.is_empty() && !l.starts_with('-') && !l.chars().all(|c| "\\|/-█▒ ".contains(c))).last().unwrap_or("").to_string();
            return Err(if last.is_empty() { format!("winget exited with code {code}") } else { last });
        }
    } else {
        crate::install::uninstall(app)?;
    }
    let arp = CATALOG.iter().find(|(x, ..)| x.eq_ignore_ascii_case(id)).map(|c| c.3).unwrap_or("");
    Ok(arp.is_empty() || !crate::install::installed_programs().iter().any(|f| arp.split('|').any(|p| arp_match(&f.name, p))))
}

/// The page's view: whether winget exists, the scan, and every catalog package with its versions and icon.
pub fn json() -> Value {
    let skip = crate::config::get().wg_skip;
    with(|s| {
        let items: Vec<Value> = CATALOG
            .iter()
            .map(|(id, name, cat, ..)| {
                let k = id.to_lowercase();
                let inst = inst_of(s, &k);
                json!({ "id": id, "name": name, "cat": cat, "has": inst.is_some(), "inst": inst.unwrap_or_default(), "latest": s.upgrades.get(&k).cloned().unwrap_or_default(), "skip": skip.get(&k).cloned().unwrap_or_default(), "icon": s.icons.get(&k).cloned().unwrap_or_default() })
            })
            .collect();
        json!({ "avail": available(), "scanning": s.scanning, "at": s.scanned_at, "err": s.err, "items": items })
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn list_table() {
        let t = "Name                 Id                       Version   Available\n--------------------------------------------------------------\n7-Zip 26.06 (x64)    7zip.7zip                26.06\nVisual Studio Comm…  Microsoft.VisualStudio.… 17.12     17.13\n";
        let m = list_names(t);
        assert_eq!(m.get("7zip.7zip").map(String::as_str), Some("7-Zip 26.06 (x64)"));
        assert!(m.contains_key("microsoft.visualstudio.…"));
        assert!(valid_id("Valve.Steam") && !valid_id("Valve Steam") && !valid_id("9NBLGGH4NNS1"));
    }

    #[test]
    fn upgrade_rows() {
        let t = "Name   Id   Version   Available   Source\n--------\nUbisoft Connect   Ubisoft.Connect   < 175.1.0.13416 175.1.0.13416   winget\nVLC media player   VideoLAN.VLC   3.0.23   3.0.24   winget\nSteam  Valve.Steam  2.10.91.91  winget\n";
        let m = upgrades(t);
        assert_eq!(m.get("videolan.vlc").map(String::as_str), Some("3.0.24"));
        assert!(!m.contains_key("ubisoft.connect"));
        assert!(!m.contains_key("valve.steam"));
    }

    #[test]
    fn show_fields() {
        let v = parse_show("Found Everything [voidtools.Everything]\nVersion: 1.4.1\nPublisher: voidtools\nDescription: Locate files\n  instantly by name.\nHomepage: https://www.voidtools.com\nLicense: Freeware\nTags:\n  search\n  files\nInstaller:\n  Installer Type: msi\n");
        assert_eq!(v["publisher"], "voidtools");
        assert_eq!(v["desc"], "Locate files\ninstantly by name.");
        assert_eq!(v["homepage"], "https://www.voidtools.com");
        assert_eq!(v["tags"], "search, files");
    }

    #[test]
    fn windows_list_names() {
        assert!(arp_match("MSI Afterburner 4.6.6", "MSI Afterburner"));
        assert!(arp_match("HWiNFO® 64", "HWiNFO"));
        assert!(arp_match("7-Zip 23.01 (x64)", "7-Zip"));
        assert!(arp_match("Discord", "Discord"));
        assert!(arp_match("Battle.net", "Battle.net"));
        assert!(arp_match("Microsoft Windows Desktop Runtime - 8.0.12 (x64)", "Microsoft Windows Desktop Runtime - 8."));
        assert!(arp_match("Telegram Desktop version 5.8", "Telegram Desktop"));
        assert!(!arp_match("Discord PTB", "Discord"));
        assert!(!arp_match("Discord Fake Game Launcher 0.3.3", "Discord"));
        assert!(!arp_match("Steamworks Common Redistributables", "Steam"));
        assert!(!arp_match("Microsoft Windows Desktop Runtime - 9.0.1 (x64)", "Microsoft Windows Desktop Runtime - 8."));
        assert!(!arp_match("EA SPORTS FC 25", "EA"));
    }

    /// This PC's packages for the import: `cargo test -- --ignored live_import --nocapture`.
    #[test]
    #[ignore]
    fn live_import() {
        let t = std::time::Instant::now();
        let l = installed_list().unwrap();
        println!("{} packages in {:?}", l.len(), t.elapsed());
        for (id, name, ver, sys) in l.iter().take(100) {
            println!("{} | {id} | {ver}{}", name, if *sys { " | system" } else { "" });
        }
    }

    /// Prints what this PC has from the catalog (the Windows list only; no winget, no network).
    #[test]
    #[ignore]
    fn this_pc() {
        for (k, f) in from_windows() {
            println!("{k}: {} {} {} {}", f.version, f.exe, f.dir, f.uninstall);
        }
    }
}
