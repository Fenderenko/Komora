//! Windows tweaks: registry values from a built-in catalog or the user's own (registry values or
//! PowerShell scripts). Applying saves what was there before, so every tweak can be undone; applied
//! registry tweaks are compared with the registry again after each start and check — a Windows update
//! that put a value back is shown and can be repeated with one click. HKLM values need elevation:
//! they are written by reg.exe started with the elevation prompt.

use std::{collections::BTreeMap, os::windows::process::CommandExt, sync::Mutex};

use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use windows::{
    Win32::System::Registry::{
        HKEY, HKEY_CURRENT_USER, HKEY_LOCAL_MACHINE, KEY_READ, KEY_WOW64_64KEY, KEY_WRITE, REG_DWORD, REG_OPTION_NON_VOLATILE, REG_SZ, REG_VALUE_TYPE, RegCloseKey, RegCreateKeyExW, RegDeleteKeyValueW, RegDeleteTreeW,
        RegOpenKeyExW, RegQueryValueExW, RegSetValueExW,
    },
    core::PCWSTR,
};

use crate::{logf, util};

/// One registry value a tweak sets.
#[derive(Clone, Serialize, Deserialize, Default, Debug, PartialEq)]
#[serde(default)]
pub struct RegVal {
    /// "HKCU" or "HKLM"
    pub root: String,
    pub path: String,
    /// "" — the key's default value
    pub name: String,
    /// "dword" or "sz"
    pub kind: String,
    pub data: String,
}

/// A user's own tweak.
#[derive(Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase", default)]
pub struct Custom {
    pub id: String,
    pub name: String,
    pub desc: String,
    pub vals: Vec<RegVal>,
    /// PowerShell to apply and to undo (a script tweak)
    pub apply_ps: String,
    pub undo_ps: String,
    pub admin: bool,
}

/// What was in the registry before a value was set.
#[derive(Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase", default)]
pub struct Prev {
    pub val: RegVal,
    pub existed: bool,
    pub kind: String,
    pub data: String,
    /// the first key that did not exist (removed on undo)
    pub created: String,
}

#[derive(Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase", default)]
pub struct Applied {
    pub at: i64,
    pub prev: Vec<Prev>,
    /// a reset by Windows was already notified
    pub reset_told: bool,
}

#[derive(Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase", default)]
pub struct State {
    pub applied: BTreeMap<String, Applied>,
    pub custom: Vec<Custom>,
}

struct Def {
    id: &'static str,
    cat: &'static str,
    uk: &'static str,
    en: &'static str,
    uk_d: &'static str,
    en_d: &'static str,
    /// "explorer", "logon" or ""
    restart: &'static str,
    vals: &'static [(&'static str, &'static str, &'static str, &'static str, &'static str)],
}

const ADV: &str = r"Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced";
const CDM: &str = r"Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager";

/// The built-in catalog: values documented by Microsoft or long used by the community; each is undone
/// by putting back what was there before.
const CATALOG: &[Def] = &[
    Def { id: "classic_menu", cat: "explorer", uk: "Класичне контекстне меню", en: "Classic context menu", uk_d: "Повне меню правої кнопки без «Показати більше параметрів».", en_d: "The full right-click menu without “Show more options”.", restart: "explorer", vals: &[("HKCU", r"Software\Classes\CLSID\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}\InprocServer32", "", "sz", "")] },
    Def { id: "file_ext", cat: "explorer", uk: "Показувати розширення файлів", en: "Show file extensions", uk_d: "file.exe замість file — видно, що саме відкриваєш.", en_d: "file.exe instead of file — you see what you open.", restart: "", vals: &[("HKCU", ADV, "HideFileExt", "dword", "0")] },
    Def { id: "hidden_files", cat: "explorer", uk: "Показувати приховані файли", en: "Show hidden files", uk_d: "Приховані файли й теки видно в Провіднику.", en_d: "Hidden files and folders show in File Explorer.", restart: "", vals: &[("HKCU", ADV, "Hidden", "dword", "1")] },
    Def { id: "open_this_pc", cat: "explorer", uk: "Провідник відкривається на «Цей ПК»", en: "File Explorer opens “This PC”", uk_d: "Замість «Домашня сторінка» — диски й теки.", en_d: "Drives and folders instead of “Home”.", restart: "", vals: &[("HKCU", ADV, "LaunchTo", "dword", "1")] },
    Def { id: "taskbar_left", cat: "taskbar", uk: "Панель завдань ліворуч", en: "Taskbar on the left", uk_d: "Кнопка «Пуск» і програми з лівого краю, як у Windows 10.", en_d: "Start and apps at the left edge, like Windows 10.", restart: "", vals: &[("HKCU", ADV, "TaskbarAl", "dword", "0")] },
    Def { id: "clock_seconds", cat: "taskbar", uk: "Секунди в годиннику", en: "Seconds in the clock", uk_d: "Годинник на панелі завдань показує секунди.", en_d: "The taskbar clock shows seconds.", restart: "explorer", vals: &[("HKCU", ADV, "ShowSecondsInSystemClock", "dword", "1")] },
    Def { id: "end_task", cat: "taskbar", uk: "«Завершити завдання» на панелі", en: "“End task” on the taskbar", uk_d: "Права кнопка на програмі в панелі — закрити зависле без Диспетчера завдань.", en_d: "Right-click an app on the taskbar to close a hung one without Task Manager.", restart: "", vals: &[("HKCU", r"Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced\TaskbarDeveloperSettings", "TaskbarEndTask", "dword", "1")] },
    Def { id: "hide_taskview", cat: "taskbar", uk: "Сховати «Представлення завдань»", en: "Hide “Task view”", uk_d: "Кнопка віртуальних столів зникає з панелі (Win+Tab лишається).", en_d: "The virtual desktops button leaves the taskbar (Win+Tab stays).", restart: "", vals: &[("HKCU", ADV, "ShowTaskViewButton", "dword", "0")] },
    Def { id: "search_icon", cat: "taskbar", uk: "Пошук на панелі — лише значок", en: "Taskbar search as an icon", uk_d: "Замість широкого поля пошуку — маленька лупа.", en_d: "A small magnifier instead of the wide search box.", restart: "", vals: &[("HKCU", r"Software\Microsoft\Windows\CurrentVersion\Search", "SearchboxTaskbarMode", "dword", "1")] },
    Def { id: "no_bing", cat: "start", uk: "Пошук без Bing і вебрезультатів", en: "Search without Bing and web results", uk_d: "Пошук у «Пуск» шукає лише на ПК.", en_d: "Start search looks on the PC only.", restart: "explorer", vals: &[("HKCU", r"Software\Policies\Microsoft\Windows\Explorer", "DisableSearchBoxSuggestions", "dword", "1")] },
    Def { id: "no_start_recs", cat: "start", uk: "Без порад і реклами в «Пуск»", en: "No tips and promotions in Start", uk_d: "Розділ рекомендацій не показує поради й програми з Microsoft Store.", en_d: "Recommendations stop showing tips and Store apps.", restart: "", vals: &[("HKCU", ADV, "Start_IrisRecommendations", "dword", "0")] },
    Def { id: "alttab_windows", cat: "start", uk: "Alt+Tab — лише вікна", en: "Alt+Tab shows windows only", uk_d: "Без вкладок Edge серед вікон.", en_d: "No Edge tabs among the windows.", restart: "", vals: &[("HKCU", ADV, "MultiTaskingAltTabFilter", "dword", "3")] },
    Def { id: "no_ad_id", cat: "privacy", uk: "Вимкнути рекламний ідентифікатор", en: "Turn off the advertising ID", uk_d: "Програми не отримують ідентифікатор для персональної реклами.", en_d: "Apps do not get an ID for personalised ads.", restart: "", vals: &[("HKCU", r"Software\Microsoft\Windows\CurrentVersion\AdvertisingInfo", "Enabled", "dword", "0")] },
    Def { id: "no_lock_tips", cat: "privacy", uk: "Без порад на екрані блокування", en: "No tips on the lock screen", uk_d: "Без «цікавих фактів» і реклами поверх фону.", en_d: "No “fun facts” and promotions over the picture.", restart: "", vals: &[("HKCU", CDM, "RotatingLockScreenOverlayEnabled", "dword", "0"), ("HKCU", CDM, "SubscribedContent-338387Enabled", "dword", "0")] },
    Def { id: "no_suggestions", cat: "privacy", uk: "Без пропозицій Microsoft", en: "No Microsoft suggestions", uk_d: "Без пропонованого вмісту в Параметрах, порад і «завершіть налаштування пристрою».", en_d: "No suggested content in Settings, tips and “finish setting up your device”.", restart: "", vals: &[("HKCU", CDM, "SubscribedContent-338393Enabled", "dword", "0"), ("HKCU", CDM, "SubscribedContent-353694Enabled", "dword", "0"), ("HKCU", CDM, "SubscribedContent-353696Enabled", "dword", "0"), ("HKCU", CDM, "SubscribedContent-338389Enabled", "dword", "0"), ("HKCU", CDM, "SoftLandingEnabled", "dword", "0")] },
    Def { id: "no_mouse_accel", cat: "input", uk: "Без прискорення миші", en: "No mouse acceleration", uk_d: "Вимикає «Підвищену точність вказівника»: рух курсора рівний, як в іграх.", en_d: "Turns off “Enhance pointer precision”: even cursor movement, like in games.", restart: "logon", vals: &[("HKCU", r"Control Panel\Mouse", "MouseSpeed", "sz", "0"), ("HKCU", r"Control Panel\Mouse", "MouseThreshold1", "sz", "0"), ("HKCU", r"Control Panel\Mouse", "MouseThreshold2", "sz", "0")] },
    Def { id: "no_sticky", cat: "input", uk: "Без вікна «Залипання клавіш»", en: "No Sticky Keys prompt", uk_d: "П'ять натискань Shift у грі більше не відкривають вікно.", en_d: "Pressing Shift five times in a game no longer opens the prompt.", restart: "logon", vals: &[("HKCU", r"Control Panel\Accessibility\StickyKeys", "Flags", "sz", "506")] },
    Def { id: "menu_delay", cat: "input", uk: "Швидші меню", en: "Faster menus", uk_d: "Вкладені меню відкриваються майже одразу.", en_d: "Submenus open almost at once.", restart: "logon", vals: &[("HKCU", r"Control Panel\Desktop", "MenuShowDelay", "sz", "100")] },
    Def { id: "no_gamedvr", cat: "games", uk: "Вимкнути фоновий запис ігор", en: "Turn off background game recording", uk_d: "Game DVR не пише відео у фоні — менше навантаження в іграх.", en_d: "Game DVR stops recording in the background — less load in games.", restart: "", vals: &[("HKCU", r"System\GameConfigStore", "GameDVR_Enabled", "dword", "0"), ("HKCU", r"Software\Microsoft\Windows\CurrentVersion\GameDVR", "AppCaptureEnabled", "dword", "0")] },
    Def { id: "long_paths", cat: "system", uk: "Довгі шляхи до файлів", en: "Long file paths", uk_d: "Програми можуть працювати зі шляхами понад 260 символів. Потрібні права адміністратора.", en_d: "Apps can use paths longer than 260 characters. Needs administrator rights.", restart: "", vals: &[("HKLM", r"SYSTEM\CurrentControlSet\Control\FileSystem", "LongPathsEnabled", "dword", "1")] },
    Def { id: "no_fast_startup", cat: "system", uk: "Вимкнути швидкий запуск", en: "Turn off fast startup", uk_d: "Вимкнення ПК — повне: менше дивних помилок драйверів і подвійного завантаження. Потрібні права адміністратора.", en_d: "Shutdown becomes a full one: fewer odd driver issues, safer dual boot. Needs administrator rights.", restart: "", vals: &[("HKLM", r"SYSTEM\CurrentControlSet\Control\Session Manager\Power", "HiberbootEnabled", "dword", "0")] },
];

static STATE: Mutex<Option<State>> = Mutex::new(None);

fn path() -> std::path::PathBuf {
    util::data_dir().join("tweaks.json")
}

pub fn state() -> State {
    let mut g = STATE.lock().unwrap();
    g.get_or_insert_with(|| std::fs::read_to_string(path()).ok().and_then(|s| serde_json::from_str(&s).ok()).unwrap_or_default()).clone()
}

pub fn update<R>(f: impl FnOnce(&mut State) -> R) -> R {
    let mut g = STATE.lock().unwrap();
    let st = g.get_or_insert_with(|| std::fs::read_to_string(path()).ok().and_then(|s| serde_json::from_str(&s).ok()).unwrap_or_default());
    let r = f(st);
    if let Ok(s) = serde_json::to_string_pretty(st) {
        let _ = std::fs::write(path(), s);
    }
    r
}

/// HKLM, and HKCU\Software\Policies (users may only read it), are written with elevation.
fn needs_admin(v: &RegVal) -> bool {
    v.root == "HKLM" || v.path.to_ascii_lowercase().starts_with(r"software\policies")
}

fn def_vals(d: &Def) -> Vec<RegVal> {
    d.vals.iter().map(|(root, path, name, kind, data)| RegVal { root: (*root).into(), path: (*path).into(), name: (*name).into(), kind: (*kind).into(), data: (*data).into() }).collect()
}

/// The values of a tweak (catalog or own), its scripts and whether it needs elevation.
fn tweak(id: &str, st: &State) -> Option<(Vec<RegVal>, String, String, bool)> {
    if let Some(d) = CATALOG.iter().find(|d| d.id == id) {
        let v = def_vals(d);
        let admin = v.iter().any(needs_admin);
        return Some((v, String::new(), String::new(), admin));
    }
    st.custom.iter().find(|c| c.id == id).map(|c| (c.vals.clone(), c.apply_ps.clone(), c.undo_ps.clone(), c.admin || c.vals.iter().any(needs_admin)))
}

// ---------------------------------------------------------------- registry

fn root(r: &str) -> HKEY {
    if r == "HKLM" { HKEY_LOCAL_MACHINE } else { HKEY_CURRENT_USER }
}

struct Key(HKEY);

impl Drop for Key {
    fn drop(&mut self) {
        unsafe {
            let _ = RegCloseKey(self.0);
        }
    }
}

fn open(r: &str, p: &str) -> Option<Key> {
    let w = util::wide(p);
    let mut k = HKEY::default();
    unsafe { RegOpenKeyExW(root(r), PCWSTR(w.as_ptr()), None, KEY_READ | KEY_WOW64_64KEY, &mut k) }.is_ok().then_some(Key(k))
}

/// (kind, data) of a value; None — no value.
pub fn read(v: &RegVal) -> Option<(String, String)> {
    let k = open(&v.root, &v.path)?;
    let n = util::wide(&v.name);
    let mut ty = REG_VALUE_TYPE::default();
    let mut buf = vec![0u8; 4096];
    let mut len = buf.len() as u32;
    unsafe { RegQueryValueExW(k.0, PCWSTR(n.as_ptr()), None, Some(&mut ty), Some(buf.as_mut_ptr()), Some(&mut len)) }.ok().ok()?;
    buf.truncate(len as usize);
    if ty == REG_DWORD && buf.len() >= 4 {
        return Some(("dword".into(), u32::from_le_bytes([buf[0], buf[1], buf[2], buf[3]]).to_string()));
    }
    let w: Vec<u16> = buf.chunks_exact(2).map(|c| u16::from_le_bytes([c[0], c[1]])).collect();
    Some(("sz".into(), String::from_utf16_lossy(&w).trim_end_matches('\0').to_string()))
}

/// The first key of the path that does not exist ("" — the whole path exists).
fn first_missing(r: &str, p: &str) -> String {
    let parts: Vec<&str> = p.split('\\').collect();
    for i in 1..=parts.len() {
        let sub = parts[..i].join("\\");
        if open(r, &sub).is_none() {
            return sub;
        }
    }
    String::new()
}

fn write(v: &RegVal) -> Result<(), String> {
    let w = util::wide(&v.path);
    let mut k = HKEY::default();
    unsafe { RegCreateKeyExW(root(&v.root), PCWSTR(w.as_ptr()), None, PCWSTR::null(), REG_OPTION_NON_VOLATILE, KEY_WRITE | KEY_WOW64_64KEY, None, &mut k, None) }.ok().map_err(|e| e.to_string())?;
    let k = Key(k);
    let n = util::wide(&v.name);
    let r = if v.kind == "dword" {
        let d: u32 = v.data.trim().parse().map_err(|_| format!("not a number: {}", v.data))?;
        unsafe { RegSetValueExW(k.0, PCWSTR(n.as_ptr()), None, REG_DWORD, Some(&d.to_le_bytes())) }
    } else {
        let s = util::wide(&v.data);
        let bytes: Vec<u8> = s.iter().flat_map(|c| c.to_le_bytes()).collect();
        unsafe { RegSetValueExW(k.0, PCWSTR(n.as_ptr()), None, REG_SZ, Some(&bytes)) }
    };
    r.ok().map_err(|e| e.to_string())
}

fn delete_value(v: &RegVal) {
    let p = util::wide(&v.path);
    let n = util::wide(&v.name);
    unsafe {
        let _ = RegDeleteKeyValueW(root(&v.root), PCWSTR(p.as_ptr()), PCWSTR(n.as_ptr()));
    }
}

fn delete_tree(r: &str, p: &str) {
    if p.is_empty() {
        return;
    }
    let w = util::wide(p);
    unsafe {
        let _ = RegDeleteTreeW(root(r), PCWSTR(w.as_ptr()));
        let _ = windows::Win32::System::Registry::RegDeleteKeyW(root(r), PCWSTR(w.as_ptr()));
    }
}

/// reg.exe commands for elevated changes.
fn reg_add(v: &RegVal) -> String {
    let t = if v.kind == "dword" { "REG_DWORD" } else { "REG_SZ" };
    let name = if v.name.is_empty() { "/ve".to_string() } else { format!("/v \"{}\"", v.name) };
    format!("reg add \"{}\\{}\" {name} /t {t} /d \"{}\" /f", v.root, v.path, v.data)
}

fn reg_del(v: &RegVal) -> String {
    let name = if v.name.is_empty() { "/ve".to_string() } else { format!("/v \"{}\"", v.name) };
    format!("reg delete \"{}\\{}\" {name} /f", v.root, v.path)
}

/// Runs commands in one elevated cmd (one prompt); Err — declined or failed.
fn elevated(cmds: &[String]) -> Result<(), String> {
    let line = format!("/c {}", cmds.join(" & "));
    crate::install::run_elevated("cmd.exe", &line).map(|_| ())
}

fn run_ps(script: &str, admin: bool) -> Result<(), String> {
    let f = std::env::temp_dir().join(format!("komora-tweak-{}.ps1", util::unix_ms()));
    std::fs::write(&f, format!("\u{feff}{script}")).map_err(|e| e.to_string())?;
    let args = format!("-NoProfile -ExecutionPolicy Bypass -File \"{}\"", f.display());
    let r = if admin {
        crate::install::run_elevated("powershell.exe", &args).map(|_| ())
    } else {
        std::process::Command::new("powershell.exe").args(["-NoProfile", "-ExecutionPolicy", "Bypass", "-File"]).arg(&f).creation_flags(0x0800_0000).status().map_err(|e| e.to_string()).and_then(|s| if s.success() { Ok(()) } else { Err(format!("the script ended with code {}", s.code().unwrap_or(-1))) })
    };
    let _ = std::fs::remove_file(&f);
    r
}

// ---------------------------------------------------------------- apply, undo, status

pub fn apply(id: &str) -> Result<(), String> {
    let st = state();
    let (vals, apply_ps, _, admin) = tweak(id, &st).ok_or("unknown tweak")?;
    let prev: Vec<Prev> = vals
        .iter()
        .map(|v| {
            let cur = read(v);
            Prev { val: v.clone(), existed: cur.is_some(), kind: cur.as_ref().map(|c| c.0.clone()).unwrap_or_default(), data: cur.map(|c| c.1).unwrap_or_default(), created: first_missing(&v.root, &v.path) }
        })
        .collect();
    if admin {
        let cmds: Vec<String> = vals.iter().map(reg_add).collect();
        if !cmds.is_empty() {
            elevated(&cmds)?;
        }
    } else {
        for v in &vals {
            write(v)?;
        }
    }
    if !apply_ps.trim().is_empty() {
        run_ps(&apply_ps, admin)?;
    }
    if vals.iter().any(|v| read(v).map(|c| c.1) != Some(v.data.clone())) {
        return Err("Windows did not take the value (a policy or a protected key)".into());
    }
    update(|s| s.applied.insert(id.to_string(), Applied { at: util::unix(), prev, reset_told: false }));
    logf!("tweak {id} applied");
    Ok(())
}

pub fn undo(id: &str) -> Result<(), String> {
    let st = state();
    let (vals, _, undo_ps, admin) = tweak(id, &st).ok_or("unknown tweak")?;
    let mut applied = st.applied.get(id).cloned().unwrap_or_default();
    if !st.applied.contains_key(id) {
        // "already so in Windows", not applied by Komora: turning it off removes the values (Windows' default)
        applied.prev = vals.iter().map(|v| Prev { val: v.clone(), existed: false, kind: String::new(), data: String::new(), created: String::new() }).collect();
    }
    if admin {
        let mut cmds = Vec::new();
        for p in &applied.prev {
            if p.existed {
                cmds.push(reg_add(&RegVal { kind: p.kind.clone(), data: p.data.clone(), ..p.val.clone() }));
            } else if !p.created.is_empty() {
                cmds.push(format!("reg delete \"{}\\{}\" /f", p.val.root, p.created));
            } else {
                cmds.push(reg_del(&p.val));
            }
        }
        if !cmds.is_empty() {
            elevated(&cmds)?;
        }
    } else {
        for p in &applied.prev {
            if p.existed {
                write(&RegVal { kind: p.kind.clone(), data: p.data.clone(), ..p.val.clone() })?;
            } else if !p.created.is_empty() {
                delete_tree(&p.val.root, &p.created);
            } else {
                delete_value(&p.val);
            }
        }
    }
    if !undo_ps.trim().is_empty() {
        run_ps(&undo_ps, admin)?;
    }
    let _ = vals;
    update(|s| s.applied.remove(id));
    logf!("tweak {id} undone");
    Ok(())
}

/// "on", "off", "reset" (applied, but Windows changed it back), "already" (not applied by Komora, the
/// values are already so).
fn status(id: &str, st: &State) -> &'static str {
    let Some((vals, apply_ps, _, _)) = tweak(id, st) else { return "off" };
    let matches = !vals.is_empty() && vals.iter().all(|v| read(v).map(|c| c.1) == Some(v.data.clone()));
    match (st.applied.contains_key(id), matches) {
        (true, true) => "on",
        (true, false) if vals.is_empty() && !apply_ps.is_empty() => "on",
        (true, false) => "reset",
        (false, true) => "already",
        (false, false) => "off",
    }
}

/// Applied tweaks Windows put back, not notified yet (marked as notified).
pub fn new_resets() -> Vec<String> {
    let st = state();
    let reset: Vec<String> = st.applied.iter().filter(|(id, a)| !a.reset_told && status(id, &st) == "reset").map(|(id, _)| id.clone()).collect();
    if !reset.is_empty() {
        update(|s| {
            for id in &reset {
                if let Some(a) = s.applied.get_mut(id) {
                    a.reset_told = true;
                }
            }
        });
    }
    let lang = crate::config::get().lang().to_string();
    reset.iter().map(|id| CATALOG.iter().find(|d| d.id == id).map(|d| if lang == "uk" { d.uk } else { d.en }.to_string()).or_else(|| st.custom.iter().find(|c| &c.id == id).map(|c| c.name.clone())).unwrap_or_else(|| id.clone())).collect()
}

/// The tweaks for the page: catalog and own, with their status.
pub fn list_json() -> Value {
    let st = state();
    let mut out = Vec::new();
    for d in CATALOG {
        let admin = def_vals(d).iter().any(needs_admin);
        out.push(json!({ "id": d.id, "cat": d.cat, "uk": d.uk, "en": d.en, "ukD": d.uk_d, "enD": d.en_d, "restart": d.restart, "admin": admin, "status": status(d.id, &st), "custom": false, "vals": def_vals(d) }));
    }
    for c in &st.custom {
        out.push(json!({ "id": c.id, "cat": "custom", "uk": c.name, "en": c.name, "ukD": c.desc, "enD": c.desc, "restart": "", "admin": c.admin || c.vals.iter().any(needs_admin), "status": status(&c.id, &st), "custom": true, "vals": c.vals, "applyPs": c.apply_ps, "undoPs": c.undo_ps }));
    }
    Value::Array(out)
}

pub fn save_custom(v: &Value) -> Result<String, String> {
    let mut c: Custom = serde_json::from_value(v.clone()).map_err(|e| e.to_string())?;
    c.name = c.name.trim().to_string();
    if c.name.is_empty() {
        return Err("a name is needed".into());
    }
    for x in &mut c.vals {
        x.root = if x.root == "HKLM" { "HKLM".into() } else { "HKCU".into() };
        x.kind = if x.kind == "dword" { "dword".into() } else { "sz".into() };
        x.path = x.path.trim().trim_start_matches("HKEY_CURRENT_USER\\").trim_start_matches("HKEY_LOCAL_MACHINE\\").trim_start_matches("HKCU\\").trim_start_matches("HKLM\\").trim_matches('\\').to_string();
        if x.path.is_empty() {
            return Err("a registry path is needed".into());
        }
        if x.kind == "dword" && x.data.trim().parse::<u32>().is_err() {
            return Err(format!("not a number: {}", x.data));
        }
        // elevated values go through cmd /c reg add: characters cmd treats specially are refused
        if (needs_admin(x) || c.admin) && [&x.path, &x.name, &x.data].iter().any(|s| s.contains(['"', '&', '|', '<', '>', '^', '%'])) {
            return Err("characters \" & | < > ^ % cannot be used in an administrator value".into());
        }
    }
    if c.vals.is_empty() && c.apply_ps.trim().is_empty() {
        return Err("a registry value or a script is needed".into());
    }
    Ok(update(|s| {
        if c.id.is_empty() || !s.custom.iter().any(|x| x.id == c.id) {
            let n = s.custom.iter().filter_map(|x| x.id.strip_prefix('c')?.parse::<u64>().ok()).max().unwrap_or(0) + 1;
            c.id = format!("c{n}");
            s.custom.push(c.clone());
        } else if let Some(x) = s.custom.iter_mut().find(|x| x.id == c.id) {
            *x = c.clone();
        }
        c.id
    }))
}

pub fn delete_custom(id: &str) {
    update(|s| {
        s.custom.retain(|c| c.id != id);
        s.applied.remove(id);
    });
}

/// Restarts File Explorer (the taskbar and open folder windows close and come back).
pub fn restart_explorer() {
    let _ = std::process::Command::new("taskkill.exe").args(["/f", "/im", "explorer.exe"]).creation_flags(0x0800_0000).status();
    std::thread::sleep(std::time::Duration::from_millis(1500));
    // Windows usually starts it again by itself; otherwise it is started here
    let running = std::process::Command::new("tasklist.exe").args(["/fi", "imagename eq explorer.exe", "/nh"]).creation_flags(0x0800_0000).output().map(|o| String::from_utf8_lossy(&o.stdout).to_lowercase().contains("explorer.exe")).unwrap_or(false);
    if !running {
        util::shell_open("explorer.exe", None);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn catalog_is_sane() {
        let mut ids = std::collections::HashSet::new();
        for d in CATALOG {
            assert!(ids.insert(d.id), "duplicate {}", d.id);
            for v in d.vals {
                assert!(v.0 == "HKCU" || v.0 == "HKLM");
                assert!(v.3 == "dword" || v.3 == "sz");
                if v.3 == "dword" {
                    v.4.parse::<u32>().unwrap();
                }
            }
        }
    }

    #[test]
    fn reg_commands() {
        let v = RegVal { root: "HKLM".into(), path: r"SYSTEM\X".into(), name: "A".into(), kind: "dword".into(), data: "1".into() };
        assert_eq!(reg_add(&v), r#"reg add "HKLM\SYSTEM\X" /v "A" /t REG_DWORD /d "1" /f"#);
        assert_eq!(reg_del(&RegVal { name: String::new(), ..v }), r#"reg delete "HKLM\SYSTEM\X" /ve /f"#);
    }

    /// Write, read and undo a value under HKCU\Software\KomoraTest.
    #[test]
    fn registry_round_trip() {
        let v = RegVal { root: "HKCU".into(), path: r"Software\KomoraTest\Sub".into(), name: "V".into(), kind: "sz".into(), data: "x".into() };
        delete_tree("HKCU", r"Software\KomoraTest");
        assert_eq!(first_missing("HKCU", &v.path), r"Software\KomoraTest");
        write(&v).unwrap();
        assert_eq!(read(&v), Some(("sz".into(), "x".into())));
        write(&RegVal { kind: "dword".into(), data: "7".into(), ..v.clone() }).unwrap();
        assert_eq!(read(&v), Some(("dword".into(), "7".into())));
        delete_tree("HKCU", r"Software\KomoraTest");
        assert_eq!(read(&v), None);
    }
}
