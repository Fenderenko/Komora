//! Messages of the page (JSON through WebView2) and the work they start: adding apps and links,
//! checks for updates and prices, installs, removals, tweaks, backups, bundles, sync and imports.
//! Network and install work runs on worker threads; they change the library and ask the UI thread
//! to send the new state (WM_STATE) or an event (WM_EVENT).

use std::{
    collections::HashMap,
    sync::{
        Mutex,
        atomic::{AtomicBool, AtomicU32, AtomicU64, AtomicUsize, Ordering},
    },
    thread,
};

use serde_json::{Value, json};

use crate::{
    autostart, backup, bundle, config, dlg, gh, imports,
    install::{self, Found},
    library::{self, App, Installed},
    link, logf, net, stars, tweaks, util, vt,
};

static BUSY: Mutex<Option<HashMap<String, (String, f32)>>> = Mutex::new(None);
/// Installs the user cancelled (queued or downloading); cleared when the install ends.
static CANCEL: Mutex<Vec<String>> = Mutex::new(Vec::new());

/// 1.6: «My kit» became what comes back after Windows is reinstalled, and sync carries only the kit. So that sync
/// loses nothing it carried, the library gets its marks once: installed programs, links, groups, authors, applied
/// tweaks (programs only watched, not installed, stay out: «Install all» would install them).
pub fn migrate_kit() {
    if config::get().kit_v2 {
        return;
    }
    let applied: Vec<String> = tweaks::state().applied.keys().cloned().collect();
    library::update(|l| {
        for a in l.apps.iter_mut() {
            if a.inst.is_some() || a.kind == "link" {
                a.kit = true;
            }
        }
        for au in l.authors.iter_mut() {
            au.kit = true;
        }
        for t in applied {
            if !l.kit_tweaks.contains(&t) {
                l.kit_tweaks.push(t);
            }
        }
    });
    config::update(|c| c.kit_v2 = true);
    logf!("kit: the library got its kit marks (1.6)");
}

/// Whether the install of `id` was cancelled.
pub fn cancelled(id: &str) -> bool {
    CANCEL.lock().unwrap().iter().any(|x| x == id)
}

fn cancel_done(id: &str) {
    CANCEL.lock().unwrap().retain(|x| x != id);
}
static EVENTS: Mutex<Vec<String>> = Mutex::new(Vec::new());
static CHECKING: AtomicBool = AtomicBool::new(false);
/// One install or removal at a time (setups refuse to run side by side, msiexec above all).
static INSTALL: Mutex<()> = Mutex::new(());
/// Title and text of the next tray notification (WM_BALLOON).
pub static BALLOON: Mutex<(String, String)> = Mutex::new((String::new(), String::new()));
/// Applied tweaks Windows put back (shown in the sidebar).
static RESETS: AtomicUsize = AtomicUsize::new(0);
/// Minutes since the last Gist sync (it costs a request; a folder is read every minute).
static SYNC_MIN: AtomicU32 = AtomicU32::new(0);
/// Bytes taken by portable apps (counted when the installed apps are looked at).
static DISK: AtomicU64 = AtomicU64::new(0);
/// The last check: when it ended and what it found, as lines for the page ({tag, key, n, text}).
static CHECK_LOG: Mutex<(i64, Vec<Value>)> = Mutex::new((0, Vec::new()));

fn notify() {
    util::post_ui(crate::WM_STATE, 0);
}

/// Queues an event for the page (sent on the UI thread).
fn event(v: Value) {
    EVENTS.lock().unwrap().push(v.to_string());
    util::post_ui(crate::WM_EVENT, 0);
}

/// An event for the page from the window code.
pub fn event_ui(v: Value) {
    event(v);
}

pub fn take_events() -> Vec<String> {
    std::mem::take(&mut *EVENTS.lock().unwrap())
}

fn toast(text: &str, err: bool) {
    event(json!({ "t": "toast", "text": text, "err": err }));
}

fn balloon(title: &str, text: &str) {
    *BALLOON.lock().unwrap() = (title.to_string(), text.to_string());
    util::post_ui(crate::WM_BALLOON, 0);
}

fn set_busy(id: &str, stage: Option<(&str, f32)>) {
    let mut g = BUSY.lock().unwrap();
    let m = g.get_or_insert_with(HashMap::new);
    match stage {
        Some((s, p)) => {
            m.insert(id.to_string(), (s.to_string(), p));
            event(json!({ "t": "busy", "id": id, "stage": s, "pct": p }));
        }
        None => {
            m.remove(id);
            event(json!({ "t": "busy", "id": id, "stage": "", "pct": 0 }));
        }
    }
}

fn is_busy(id: &str) -> bool {
    BUSY.lock().unwrap().as_ref().is_some_and(|m| m.contains_key(id))
}

/// Installs or updates winget packages one by one; what installed goes into the library.
/// `to` — the folder picked for this install; "" — the folder for installers from Settings (with the program's name),
/// else where the installer itself puts it.
fn winget_install(ids: Vec<String>, to: String) {
    for id in &ids {
        set_busy(&crate::winget::lib_id(id), Some(("queued", -1.0)));
    }
    let setup = config::get().setup_dir;
    for id in ids {
        let key = crate::winget::lib_id(&id);
        if cancelled(&key) {
            cancel_done(&key);
            set_busy(&key, None);
            continue;
        }
        set_busy(&key, Some(("install", -1.0)));
        let name = crate::winget::CATALOG.iter().find(|c| c.0.eq_ignore_ascii_case(&id)).map(|c| c.1).unwrap_or("");
        let loc = if !to.is_empty() { to.clone() } else if !setup.is_empty() { std::path::Path::new(&setup).join(util::safe_name(name)).to_string_lossy().into_owned() } else { String::new() };
        let k2 = key.clone();
        let progress = move |stage: &str, pct: f32| set_busy(&k2, Some((stage, pct)));
        match crate::winget::install(&id, &loc, &progress) {
            Ok(()) => {
                crate::winget::add_to_library(&id);
                // some installers keep their own folder whatever they are asked
                let dir = crate::winget::installed_dir(&id);
                if !loc.is_empty() && !dir.is_empty() && !dir.to_lowercase().starts_with(&loc.to_lowercase()) {
                    toast(&format!("{name}: the installer chose its own folder: {dir}"), false);
                }
            }
            Err(e) if e == "cancelled" => toast("Встановлення скасовано", false),
            Err(e) => event(json!({ "t": "toast", "text": format!("{id}: {e}"), "err": true })),
        }
        cancel_done(&key);
        set_busy(&key, None);
    }
    crate::winget::scan();
    notify();
}

/// Updates of the library plus those of the «For PC» catalog (winget).
pub fn update_count() -> usize {
    library::get().apps.iter().filter(|a| a.update().is_some()).count() + crate::winget::update_count()
}

/// Sends the state to the page again (after work outside the library, like a winget scan).
pub fn state_changed() {
    notify();
}

pub fn state_json() -> String {
    let cfg = config::get();
    let lib = library::get();
    let updates: Vec<&str> = lib.apps.iter().filter(|a| a.update().is_some()).map(|a| a.id.as_str()).collect();
    let busy: serde_json::Map<String, Value> = BUSY.lock().unwrap().as_ref().map(|m| m.iter().map(|(k, (s, p))| (k.clone(), json!({ "stage": s, "pct": p }))).collect()).unwrap_or_default();
    // the release file each app would be installed from
    let picks: serde_json::Map<String, Value> = lib
        .apps
        .iter()
        .filter_map(|a| {
            let (asset, kind) = gh::pick_for(&a.latest.as_ref()?.assets, &a.method, &a.asset_match)?;
            Some((a.id.clone(), json!({ "name": asset.name, "size": asset.size, "kind": format!("{kind:?}").to_lowercase(), "digest": asset.digest })))
        })
        .collect();
    let sync = bundle::STATUS.lock().unwrap().clone();
    // star growth over the last week of the library's repositories
    let gains: serde_json::Map<String, Value> = lib.apps.iter().filter(|a| a.kind == "github").filter_map(|a| Some((a.id.clone(), json!(stars::gain_of(&format!("{}/{}", a.owner, a.repo))?)))).collect();
    let log = CHECK_LOG.lock().unwrap().clone();
    json!({
        "t": "state",
        "ver": env!("CARGO_PKG_VERSION"),
        "arch": gh::arch(),
        "pc": config::pc_name(),
        "pcWin": std::env::var("COMPUTERNAME").unwrap_or_default(),
        "steam": crate::steamicons::available(),
        "dataDir": util::data_dir().display().to_string(),
        "picks": picks,
        "cfg": {
            "theme": cfg.theme, "lang": cfg.lang, "langNow": cfg.lang(), "checkHours": cfg.check_hours,
            "hasToken": !config::token().is_empty(), "appsDir": cfg.apps_dir, "notify": cfg.notify, "autoBackup": cfg.auto_backup, "kitAutoUpdate": cfg.kit_auto_update, "kitAutoInstall": cfg.kit_auto_install, "autostart": autostart::enabled(),
            "syncDir": cfg.sync_dir, "syncGist": cfg.sync_gist, "syncDbx": cfg.sync_dbx, "hasDbx": !cfg.dbx_enc.is_empty(), "dbxAvail": crate::dropbox::available(), "ghLogin": cfg.gh_login,
            "preAll": cfg.pre_all, "pcName": cfg.pc_name, "steamIcons": cfg.steam_icons, "kitNew": cfg.kit_new, "darkLook": cfg.dark_look, "lightLook": cfg.light_look, "setupDir": cfg.setup_dir, "setupShow": cfg.setup_show, "hasVt": !cfg.vt_key_enc.is_empty(),
        },
        "sync": sync,
        "lib": lib,
        "updates": updates,
        "gains": gains,
        "busy": busy,
        "rate": net::rate(),
        "lastCheck": cfg.last_check,
        "checking": CHECKING.load(Ordering::Relaxed),
        "checkLog": { "at": log.0, "lines": log.1 },
        "disk": DISK.load(Ordering::Relaxed),
        "resets": RESETS.load(Ordering::Relaxed),
        "sys": crate::sysinfo::json(),
        "winget": crate::winget::json(),
    })
    .to_string()
}

fn str_of<'a>(v: &'a Value, k: &str) -> &'a str {
    v.get(k).and_then(Value::as_str).unwrap_or_default()
}

fn strings(v: &Value, k: &str) -> Vec<String> {
    v.get(k).and_then(Value::as_array).map(|a| a.iter().filter_map(|x| x.as_str().map(String::from)).collect()).unwrap_or_default()
}

fn spawn(f: impl FnOnce() + Send + 'static) {
    let _ = thread::Builder::new().name("komora-work".into()).spawn(f);
}

/// (UI thread) One message of the page.
pub fn on_page(v: &Value) {
    let id = str_of(v, "id").to_string();
    match str_of(v, "t") {
        "ready" => notify(),
        "add" => {
            let (url, group) = (str_of(v, "url").to_string(), str_of(v, "group").to_string());
            spawn(move || add(&url, &group));
        }
        "remove" => {
            let mut ids = strings(v, "ids");
            if !id.is_empty() {
                ids.push(id);
            }
            for a in library::get().apps.iter().filter(|a| ids.contains(&a.id)) {
                for f in [&a.icon, &a.preview] {
                    // catalog icons (wg-*) stay: the catalog shows them too
                    if !f.is_empty() && !f.starts_with("wg-") {
                        let _ = std::fs::remove_file(util::www_dir().join("icons").join(f));
                    }
                }
                install::drop_kept(a);
            }
            library::remove_apps(&ids);
            notify();
        }
        "edit" => {
            if let Some(p) = v.get("patch") {
                let recheck = p.get("pre").is_some() || p.get("assetMatch").is_some();
                edit(&id, p);
                if recheck {
                    spawn(move || {
                        check_one(&id);
                        notify();
                    });
                }
            }
            notify();
        }
        "group" => {
            group(v);
            notify();
        }
        "check" => spawn(|| check_all(true)),
        "refresh" => spawn(move || refresh(&id)),
        "install" if id.starts_with("wg:") => spawn(move || winget_install(vec![id.trim_start_matches("wg:").to_string()], String::new())),
        "install" => {
            let (asset, tag) = (str_of(v, "asset").to_string(), str_of(v, "tag").to_string());
            spawn(move || install_app(&id, &asset, &tag));
        }
        "ghSearch" => {
            let (q, sort, seq) = (str_of(v, "q").to_string(), str_of(v, "sort").to_string(), v.get("seq").cloned().unwrap_or_default());
            let page = v.get("page").and_then(Value::as_u64).unwrap_or(1) as u32;
            let gitlab = str_of(v, "site") == "gitlab";
            let filters = v.get("gl").cloned().unwrap_or_default();
            spawn(move || {
                let r = if gitlab { crate::forge::search_gitlab(&q, &sort, page, &filters) } else { gh::search(&q, &sort, page) };
                let items: Vec<Value> = r.as_ref().map(|x| x.1.clone()).unwrap_or_default().into_iter().map(with_gain).collect();
                stars::save();
                event(json!({ "t": "ghResults", "seq": seq, "page": page, "total": r.as_ref().map(|x| x.0).unwrap_or(0), "items": items, "err": r.err() }));
            });
        }
        "ghRepo" => {
            let full = str_of(v, "full").to_string();
            spawn(move || gh_repo(&full));
        }
        "forks" => {
            let full = if id.is_empty() { str_of(v, "full").to_string() } else { library::app(&id).map(|a| format!("{}/{}", a.owner, a.repo)).unwrap_or_default() };
            let key = if id.is_empty() { full.clone() } else { id };
            spawn(move || {
                let r = full.rsplit_once('/').map(|(o, n)| gh::forks(o, n)).unwrap_or_else(|| Err("not a repository".into()));
                event(json!({ "t": "forks", "key": key, "list": r.as_ref().ok(), "err": r.err() }));
            });
        }
        "addKit" => {
            let full = str_of(v, "full").to_string();
            spawn(move || {
                if let Some((o, r)) = gh::parse_repo(&full) {
                    add_github(&o, &r, "");
                    library::touch_app(&repo_id(&o, &r), |a| a.kit = true);
                    notify();
                }
            });
        }
        "addInstall" => {
            let full = str_of(v, "full").to_string();
            spawn(move || {
                if let Some((o, r)) = gh::parse_repo(&full) {
                    add_github(&o, &r, "");
                    install_app(&repo_id(&o, &r), "", "");
                }
            });
        }
        "rollback" => spawn(move || rollback(&id)),
        "uninstall" => spawn(move || uninstall(&id)),
        // only while queued or downloading: an installer that already runs is left to finish
        "cancel" => {
            let stage = BUSY.lock().unwrap().as_ref().and_then(|m| m.get(&id).map(|b| b.0.clone())).unwrap_or_default();
            if stage == "queued" || stage == "download" {
                CANCEL.lock().unwrap().push(id);
            }
        }
        "launch" => {
            if let Some(inst) = library::app(&id).and_then(|a| a.inst)
                && let Err(e) = install::launch(&inst)
            {
                toast(&e, true);
            }
        }
        "folder" => {
            if let Some(inst) = library::app(&id).and_then(|a| a.inst) {
                install::open_folder(&inst);
            }
        }
        "openPath" => {
            let p = str_of(v, "path");
            if std::path::Path::new(p).exists() {
                util::shell_open(p, None);
            }
        }
        "open" => {
            let url = str_of(v, "url");
            if url.starts_with("https://") || url.starts_with("http://") {
                util::shell_open(url, None);
            }
        }
        "readme" => {
            let path = str_of(v, "path").to_string();
            spawn(move || readme(&id, &path))
        }
        "releases" => spawn(move || releases(&id)),
        "cfg" => set_cfg(str_of(v, "key"), v.get("val").unwrap_or(&Value::Null)),
        "theme" => crate::win::set_dark(v.get("dark").and_then(Value::as_bool).unwrap_or(true), str_of(v, "base")),
        "win" => crate::win::command(str_of(v, "op")),
        "detect" => spawn(|| {
            detect_all();
            notify();
        }),
        // ---- tweaks
        "tweaks" => spawn(tweak_list),
        "tweak" => {
            let on = v.get("on").and_then(Value::as_bool).unwrap_or(true);
            spawn(move || {
                let r = if on { tweaks::apply(&id) } else { tweaks::undo(&id) };
                // an applied tweak comes back after a reinstall when new things go into the kit
                if on && r.is_ok() && config::get().kit_new {
                    library::update(|l| {
                        if !l.kit_tweaks.contains(&id) {
                            l.kit_tweaks.push(id.clone());
                        }
                    });
                }
                event(json!({ "t": "tweakDone", "id": id, "on": on, "err": r.err() }));
                tweak_list();
            });
        }
        "tweakSave" => {
            let r = v.get("tweak").map(tweaks::save_custom).unwrap_or_else(|| Err("nothing to save".into()));
            if let Err(e) = r {
                toast(&e, true);
            }
            spawn(tweak_list);
        }
        "tweakDel" => {
            tweaks::delete_custom(&id);
            spawn(tweak_list);
        }
        "explorer" => spawn(tweaks::restart_explorer),
        // ---- backups of app settings
        "bkSuggest" => {
            if let Some(a) = library::app(&id) {
                spawn(move || {
                    let (dirs, regs) = backup::suggest(&a);
                    event(json!({ "t": "bkSuggest", "id": a.id, "dirs": dirs, "regs": regs, "list": backup::list(&a.id) }));
                });
            }
        }
        "backup" => spawn(move || {
            let Some(a) = library::app(&id) else { return };
            set_busy(&id, Some(("backup", -1.0)));
            let r = backup::backup(&a);
            if r.is_ok() {
                library::update_app(&id, |x| x.backup_at = util::unix());
            }
            set_busy(&id, None);
            event(json!({ "t": "backupDone", "id": id, "err": r.err(), "list": backup::list(&id) }));
            notify();
        }),
        "restore" => {
            let which = str_of(v, "which").to_string();
            spawn(move || {
                let Some(a) = library::app(&id) else { return };
                set_busy(&id, Some(("restore", -1.0)));
                let r = backup::restore(&a, &which);
                set_busy(&id, None);
                event(json!({ "t": "restoreDone", "id": id, "err": r.err() }));
            });
        }
        "pickPath" => pick_path(str_of(v, "purpose"), &id),
        // ---- another PC, sync, imports
        "bkSize" => spawn(|| {
            let (list, size) = backup::newest_all();
            event(json!({ "t": "bkSize", "apps": list.len(), "size": size }));
        }),
        "export" => {
            let zip = v.get("zip").and_then(Value::as_bool).unwrap_or(false);
            let with_bk = v.get("withBk").and_then(Value::as_bool).unwrap_or(true);
            let kit_only = v.get("kitOnly").and_then(Value::as_bool).unwrap_or(false);
            let name = format!("Komora-{}{}.{}", util::safe_name(&config::pc_name()), if kit_only { "-kit" } else { "" }, if zip { "zip" } else { "komora" });
            let filt = if zip { "Komora + backups (*.zip)|*.zip" } else { "Komora (*.komora)|*.komora" };
            if let Some(p) = dlg::save_file("Komora", filt, if zip { "zip" } else { "komora" }, &name) {
                spawn(move || {
                    let r = bundle::export(&p, with_bk, kit_only);
                    event(json!({ "t": "exported", "path": p, "err": r.err() }));
                });
            }
        }
        "openBundle" => {
            if let Some(p) = dlg::open_file("Komora", "Komora (*.komora;*.zip;*.json)|*.komora;*.zip;*.json") {
                spawn(move || match bundle::open(&p) {
                    Ok(prev) => event(json!({ "t": "bundle", "preview": prev })),
                    Err(e) => toast(&e, true),
                });
            }
        }
        "acceptBundle" => {
            let (apps, tw) = (strings(v, "install"), strings(v, "tweaks"));
            spawn(move || accept_bundle(apps, tw));
        }
        "wgScan" => spawn(crate::winget::scan),
        // upkeep of «Tweaks»: sizes and startup programs, cleaning, switching a startup entry
        "toolsScan" => spawn(|| event(json!({ "t": "tools", "sizes": crate::tools::sizes(), "startup": crate::tools::startup() }))),
        "toolsClean" => {
            let what = str_of(v, "what").to_string();
            spawn(move || {
                let freed = if what == "shader" { crate::tools::clean_shaders() } else { crate::tools::clean_temp() };
                event(json!({ "t": "cleaned", "what": what, "freed": freed }));
                event(json!({ "t": "tools", "sizes": crate::tools::sizes(), "startup": crate::tools::startup() }));
            });
        }
        "startupSet" => {
            let (sid, on) = (str_of(v, "id").to_string(), v.get("on").and_then(Value::as_bool).unwrap_or(true));
            spawn(move || {
                if let Err(e) = crate::tools::set_startup(&sid, on) {
                    toast(&e, true);
                }
                event(json!({ "t": "tools", "sizes": Value::Null, "startup": crate::tools::startup() }));
            });
        }
        // «My kit»: a group (with its programs and links), an author, a tweak in or out
        // the whole group in or out of the kit at once: the marks of its apps and links
        "kitGroup" => {
            let on = v.get("on").and_then(Value::as_bool).unwrap_or(true);
            library::update(|l| {
                let now = util::unix();
                for a in l.apps.iter_mut().filter(|a| a.groups.contains(&id) && a.id != crate::selfup::ID && a.kit != on) {
                    a.kit = on;
                    a.updated = now;
                }
            });
            notify();
        }
        "kitGroupAuto" => {
            let on = v.get("on").and_then(Value::as_bool).unwrap_or(true);
            library::update(|l| {
                if let Some(g) = l.groups.iter_mut().find(|g| g.id == id) {
                    g.kit_auto = on;
                    g.updated = util::unix();
                }
            });
            notify();
        }
        "kitAuthor" => {
            let (login, on) = (str_of(v, "login").to_string(), v.get("on").and_then(Value::as_bool).unwrap_or(true));
            library::update(|l| {
                if let Some(a) = l.authors.iter_mut().find(|a| a.login.eq_ignore_ascii_case(&login)) {
                    a.kit = on;
                    a.updated = util::unix();
                }
            });
            notify();
        }
        "kitTweak" => {
            let on = v.get("on").and_then(Value::as_bool).unwrap_or(true);
            library::update(|l| {
                l.kit_tweaks.retain(|t| *t != id);
                if on {
                    l.kit_tweaks.push(id.clone());
                }
            });
            notify();
        }
        // upkeep: the clock, Windows Update's cache, system files, Microsoft Store's cache, the DNS cache
        "fix" => {
            let what = str_of(v, "what").to_string();
            spawn(move || {
                let r = crate::tools::fix(&what);
                event(json!({ "t": "fixed", "what": what, "err": r.err() }));
            });
        }
        "steamIconsFix" => spawn(|| {
            let r = crate::steamicons::fix();
            event(json!({ "t": "steamIcons", "fixed": r.fixed, "lost": r.lost }));
        }),
        "wgShow" => {
            let pid = str_of(v, "id").to_string();
            spawn(move || {
                let r = crate::winget::show(&pid);
                event(json!({ "t": "wgInfo", "id": pid, "info": r.as_ref().ok(), "err": r.err() }));
            });
        }
        // the dashboard while it is open: memory, video memory and disks (microseconds to read)
        "sysLive" => event(json!({ "t": "sys", "data": crate::sysinfo::json() })),
        "wgInstall" => {
            let ids = strings(v, "ids");
            // «Install to…»: the folder is picked first (one package)
            let to = if v.get("pick").and_then(Value::as_bool).unwrap_or(false) {
                match dlg::pick_folder("Komora") {
                    Some(p) => p,
                    None => return,
                }
            } else {
                str_of(v, "to").to_string()
            };
            spawn(move || winget_install(ids, to));
        }
        // «Install to…» of the picks: only the folder; the install waits for the button
        "wgPickDir" => {
            if let Some(p) = dlg::pick_folder("Komora") {
                event(json!({ "t": "wgLoc", "id": str_of(v, "id"), "path": p }));
            }
        }
        "installMany" => {
            let apps = strings(v, "ids");
            spawn(move || {
                for id in apps {
                    install_app(&id, "", "");
                }
            });
        }
        "syncNow" => spawn(|| {
            let r = bundle::sync_now(true);
            event(json!({ "t": "synced", "changed": r.as_ref().ok(), "err": r.err() }));
            notify();
        }),
        "clouds" => event(json!({ "t": "clouds", "list": bundle::cloud_dirs() })),
        "share" => {
            let ids: Vec<String> = v.get("ids").and_then(Value::as_array).map(|a| a.iter().filter_map(|x| x.as_str().map(String::from)).collect()).unwrap_or_default();
            spawn(move || match bundle::share(&ids) {
                Ok(url) => event(json!({ "t": "shared", "url": url })),
                Err(e) => toast(&e, true),
            });
        }
        "openShared" => {
            let url = str_of(v, "url").to_string();
            spawn(move || match bundle::open_shared(&url) {
                Ok(prev) => event(json!({ "t": "bundle", "preview": prev })),
                Err(e) => toast(&e, true),
            });
        }
        "dbxBegin" => match crate::dropbox::begin() {
            Ok(url) => util::shell_open(&url, None),
            Err(e) => toast(&e, true),
        },
        "dbxFinish" => {
            let code = str_of(v, "code").to_string();
            spawn(move || {
                match crate::dropbox::finish(&code) {
                    Ok(()) => {
                        config::update(|c| {
                            c.sync_dbx = true;
                            c.sync_gist = false;
                            c.sync_dir.clear();
                            c.sync_seen = 0;
                        });
                        let r = bundle::sync_now(true);
                        event(json!({ "t": "synced", "changed": r.as_ref().ok(), "err": r.err() }));
                    }
                    Err(e) => toast(&e, true),
                }
                notify();
            });
        }
        "dbxOff" => {
            crate::dropbox::disconnect();
            notify();
        }
        "importStars" => {
            let (login, group) = (str_of(v, "login").to_string(), str_of(v, "group").to_string());
            spawn(move || match imports::stars(&login) {
                Ok(list) => imported(list, &group),
                Err(e) => toast(&e, true),
            });
        }
        "importObtainium" => {
            let group = str_of(v, "group").to_string();
            if let Some(p) = dlg::open_file("Obtainium", "Obtainium (*.json)|*.json") {
                spawn(move || match std::fs::read_to_string(&p).map_err(|e| e.to_string()).and_then(|t| imports::obtainium(&t)) {
                    Ok(list) => imported(list, &group),
                    Err(e) => toast(&e, true),
                });
            }
        }
        "bookmarks" => spawn(|| event(json!({ "t": "bookmarks", "tree": imports::bookmark_tree() }))),
        "importBookmarks" => {
            let (b, p, group) = (str_of(v, "browser").to_string(), str_of(v, "path").to_string(), str_of(v, "group").to_string());
            spawn(move || imported(imports::bookmarks(&b, &p), &group));
        }
        "importText" => {
            let (text, group) = (str_of(v, "text").to_string(), str_of(v, "group").to_string());
            spawn(move || imported(imports::from_text(&text), &group));
        }
        // ---- followed authors
        "follow" => {
            let login = str_of(v, "login").trim().trim_start_matches('@').to_string();
            spawn(move || follow(&login));
        }
        "unfollow" => {
            let login = str_of(v, "login").to_string();
            library::update(|l| {
                l.authors.retain(|a| !a.login.eq_ignore_ascii_case(&login));
                l.removed.insert(format!("au:{}", login.to_ascii_lowercase()), util::unix());
            });
            notify();
        }
        "authorRefresh" => {
            let login = str_of(v, "login").to_string();
            spawn(move || {
                check_author(&login);
                notify();
            });
        }
        "authorSeen" => {
            let login = str_of(v, "login").to_string();
            library::update(|l| {
                if let Some(a) = l.authors.iter_mut().find(|a| a.login.eq_ignore_ascii_case(&login)) {
                    a.news.clear();
                }
            });
            notify();
        }
        // ---- VirusTotal
        "vtCheck" => spawn(move || vt_check(&id)),
        "vtUpload" => {
            // without a key: the kept file is shown in Explorer and the upload page opens
            if let Some(f) = library::app(&id).and_then(|a| a.inst).map(|i| i.file).filter(|f| std::path::Path::new(f).is_file()) {
                util::shell_open("explorer.exe", Some(&format!("/select,\"{f}\"")));
            }
            util::shell_open("https://www.virustotal.com/gui/home/upload", None);
        }
        other => logf!("page: unknown message {other:?}"),
    }
}

/// A group by id, or "new:<name>" — created (or found by that name).
fn group_id(g: &str) -> String {
    let Some(name) = g.strip_prefix("new:") else { return g.to_string() };
    let name = name.trim().to_string();
    if name.is_empty() {
        return String::new();
    }
    library::update(|l| {
        if let Some(x) = l.groups.iter().find(|x| x.name == name) {
            return x.id.clone();
        }
        let n = l.groups.iter().filter_map(|g| g.id.strip_prefix('g')?.parse::<u64>().ok()).max().unwrap_or(0) + 1;
        let id = format!("g{n}");
        const COLORS: [&str; 8] = ["#7fb8e8", "#d98bc2", "#6ccb8b", "#f5c04a", "#f08a4b", "#a78bfa", "#5fd4d0", "#ff7b72"];
        l.groups.push(library::Group { id: id.clone(), name, color: COLORS[l.groups.len() % COLORS.len()].into(), updated: util::unix(), ..Default::default() });
        id
    })
}

fn imported(list: Vec<App>, group: &str) {
    let g = group_id(group);
    let total = list.len();
    let (added, had) = imports::add_all(list, &g);
    logf!("import: {added} added, {had} already there of {total}");
    event(json!({ "t": "imported", "added": added, "had": had }));
    notify();
}

fn edit(id: &str, p: &Value) {
    let list = |k: &str| p.get(k).and_then(Value::as_array).map(|a| a.iter().filter_map(|x| x.as_str().map(|s| s.trim().to_string())).filter(|s| !s.is_empty()).collect::<Vec<_>>());
    library::touch_app(id, |a| {
        if let Some(g) = list("groups") {
            a.groups = g;
        }
        if let Some(t) = list("tags") {
            let mut t: Vec<String> = t.into_iter().map(|s| s.trim_start_matches('#').to_lowercase()).collect();
            t.dedup();
            a.tags = t;
        }
        for (k, f) in [("notes", &mut a.notes), ("method", &mut a.method), ("pin", &mut a.pin), ("skip", &mut a.skip), ("name", &mut a.name), ("assetMatch", &mut a.asset_match)] {
            if let Some(s) = p.get(k).and_then(Value::as_str) {
                *f = s.to_string();
            }
        }
        if let Some(b) = list("bpaths") {
            a.bpaths = b;
        }
        if let Some(b) = list("breg") {
            a.breg = b;
        }
        if let Some(w) = p.get("want").and_then(Value::as_bool) {
            a.want = w;
        }
        if let Some(k) = p.get("kit").and_then(Value::as_bool) {
            a.kit = k;
        }
        if let Some(d) = p.get("setupDir").and_then(Value::as_str) {
            a.setup_dir = d.trim().to_string();
        }
        if let Some(w) = p.get("pre").and_then(Value::as_bool) {
            a.pre = w;
            a.etag.clear();
        }
    });
}

fn group(v: &Value) {
    let id = str_of(v, "id").to_string();
    let now = util::unix();
    match str_of(v, "op") {
        "add" => {
            // a group may have no name: the sidebar shows its colour only
            let name = str_of(v, "name").trim().to_string();
            let color = str_of(v, "color").to_string();
            library::update(|l| {
                let n = l.groups.iter().filter_map(|g| g.id.strip_prefix('g')?.parse::<u64>().ok()).max().unwrap_or(0) + 1;
                let gid = format!("g{n}");
                l.groups.push(library::Group { id: gid.clone(), name, color, icon: str_of(v, "icon").to_string(), updated: now, ..Default::default() });
                // created from an app page: the app goes into it
                let app = str_of(v, "app");
                if let Some(a) = l.apps.iter_mut().find(|a| a.id == app) {
                    a.groups.push(gid);
                    a.updated = now;
                }
            });
        }
        "rename" => library::update(|l| {
            if let Some(g) = l.groups.iter_mut().find(|g| g.id == id) {
                g.name = str_of(v, "name").trim().to_string();
                g.updated = now;
            }
        }),
        "color" => library::update(|l| {
            if let Some(g) = l.groups.iter_mut().find(|g| g.id == id) {
                g.color = str_of(v, "color").to_string();
                if let Some(i) = v.get("icon").and_then(Value::as_str) {
                    g.icon = i.to_string();
                }
                g.updated = now;
            }
        }),
        "delete" => library::update(|l| {
            l.groups.retain(|g| g.id != id);
            for a in &mut l.apps {
                if a.groups.contains(&id) {
                    a.groups.retain(|g| *g != id);
                    a.updated = now;
                }
            }
        }),
        "move" => {
            let to = v.get("to").and_then(Value::as_u64).unwrap_or(0) as usize;
            library::update(|l| {
                if let Some(i) = l.groups.iter().position(|g| g.id == id) {
                    let g = l.groups.remove(i);
                    l.groups.insert(to.min(l.groups.len()), g);
                }
            });
        }
        _ => {}
    }
}

fn set_cfg(key: &str, val: &Value) {
    let s = val.as_str().unwrap_or_default().to_string();
    match key {
        "theme" => config::update(|c| c.theme = s),
        "lang" => {
            config::update(|c| c.lang = s);
            crate::tray::update();
        }
        "checkHours" => {
            let h = val.as_u64().unwrap_or(24) as u32;
            config::update(|c| c.check_hours = if config::CHECK_HOURS.contains(&h) { h } else { 24 });
        }
        "token" => {
            config::set_token(&s);
            // a new token lifts the limit errors at once, and a Gist sync that failed for the token runs again
            library::update(|l| l.apps.iter_mut().filter(|a| a.error.starts_with("GitHub request limit")).for_each(|a| a.error.clear()));
            spawn(|| {
                let _ = bundle::sync_now(true);
                notify();
            });
        }
        "appsDir" if !s.trim().is_empty() => config::update(|c| c.apps_dir = s.trim().to_string()),
        "notify" => config::update(|c| c.notify = val.as_bool().unwrap_or(true)),
        "autoBackup" => config::update(|c| c.auto_backup = val.as_bool().unwrap_or(true)),
        "kitAutoUpdate" => config::update(|c| c.kit_auto_update = val.as_bool().unwrap_or(false)),
        "kitAutoInstall" => {
            config::update(|c| c.kit_auto_install = val.as_bool().unwrap_or(false));
            if config::get().kit_auto_install {
                spawn(install_missing_kit);
            }
        }
        "autostart" => autostart::set(val.as_bool().unwrap_or(false)),
        "syncDir" => {
            let d = s.trim().to_string();
            if !d.is_empty() {
                let _ = std::fs::create_dir_all(&d);
            }
            config::update(|c| {
                c.sync_dir = d;
                c.sync_seen = 0;
            });
            spawn(|| {
                let _ = bundle::sync_now(true);
                notify();
            });
        }
        "syncDbx" => {
            let on = val.as_bool().unwrap_or(false) && crate::dropbox::connected();
            config::update(|c| {
                c.sync_dbx = on;
                if on {
                    c.sync_gist = false;
                    c.sync_dir.clear();
                }
                c.sync_seen = 0;
            });
            spawn(|| {
                let _ = bundle::sync_now(true);
                notify();
            });
        }
        "syncGist" => {
            config::update(|c| {
                c.sync_gist = val.as_bool().unwrap_or(false);
                if c.sync_gist {
                    c.sync_dbx = false;
                }
                c.sync_seen = 0;
            });
            spawn(|| {
                let _ = bundle::sync_now(true);
                notify();
            });
        }
        "ghLogin" => config::update(|c| c.gh_login = s.trim().trim_start_matches('@').to_string()),
        "pcName" => config::update(|c| c.pc_name = s.trim().chars().take(60).collect()),
        "steamIcons" => config::update(|c| c.steam_icons = val.as_bool().unwrap_or(false)),
        "kitNew" => config::update(|c| c.kit_new = val.as_bool().unwrap_or(true)),
        "darkLook" => config::update(|c| c.dark_look = s),
        "lightLook" => config::update(|c| c.light_look = s),
        "preAll" => {
            config::update(|c| c.pre_all = val.as_bool().unwrap_or(false));
            // the latest releases are asked again without ETags
            library::update(|l| l.apps.iter_mut().for_each(|a| a.etag.clear()));
        }
        "setupDir" => config::update(|c| c.setup_dir = s.trim().to_string()),
        "setupShow" => config::update(|c| c.setup_show = val.as_bool().unwrap_or(false)),
        "vtKey" => config::set_vt_key(&s),
        _ => {}
    }
    notify();
}

/// (UI thread) A folder chosen in the Windows dialog, for the apps folder, sync or a backup.
fn pick_path(purpose: &str, id: &str) {
    let Some(p) = dlg::pick_folder("Komora") else { return };
    match purpose {
        "appsDir" => set_cfg("appsDir", &json!(p)),
        "syncDir" => set_cfg("syncDir", &json!(p)),
        "setupDir" => set_cfg("setupDir", &json!(p)),
        "setupDirApp" => {
            library::touch_app(id, |a| a.setup_dir = p.clone());
            notify();
        }
        "bkPath" => {
            library::touch_app(id, |a| {
                if !a.bpaths.contains(&p) {
                    a.bpaths.push(p.clone());
                }
            });
            notify();
        }
        _ => {}
    }
}

// ---------------------------------------------------------------- adding

fn add(raw: &str, group: &str) {
    let url = raw.trim();
    if url.is_empty() {
        return;
    }
    let g = group_id(group);
    if let Some((owner, repo)) = gh::parse_repo(url) {
        add_github(&owner, &repo, &g);
    } else {
        let url = if url.contains("://") { url.to_string() } else { format!("https://{url}") };
        if net::split_url(&url).is_none() || !url.contains('.') {
            toast("Не схоже на посилання", true);
            return;
        }
        add_link(&url, &g);
    }
}

fn repo_id(owner: &str, repo: &str) -> String {
    format!("gh:{}/{}", owner.to_ascii_lowercase(), repo.to_ascii_lowercase())
}

/// Puts an app already in the library into the group too.
fn also_in(id: &str, group: &str) {
    if !group.is_empty() {
        library::touch_app(id, |a| {
            if !a.groups.iter().any(|g| g == group) {
                a.groups.push(group.to_string());
            }
        });
        notify();
    }
}

fn apply_meta(a: &mut App, m: gh::Meta) {
    if !m.name.is_empty() && (a.name.is_empty() || a.name == a.repo) {
        a.name = m.name;
    }
    a.desc = m.desc;
    a.homepage = m.homepage;
    a.stars = m.stars;
    a.license = m.license;
    a.topics = m.topics;
    a.archived = m.archived;
    a.branch = m.branch;
    a.org = m.org;
    a.fork = m.fork;
    a.parent = m.parent;
    a.forks = m.forks;
    a.pushed = m.pushed;
    a.meta_at = util::unix();
}

fn add_github(owner: &str, repo: &str, group: &str) {
    let id = repo_id(owner, repo);
    if library::app(&id).is_some() {
        also_in(&id, group);
        event(json!({ "t": "select", "id": id }));
        toast("Уже в бібліотеці", false);
        return;
    }
    library::update(|l| {
        l.removed.remove(&id);
        l.apps.push(App {
            id: id.clone(),
            url: gh::web_url(owner, repo),
            kind: "github".into(),
            kit: config::get().kit_new,
            owner: owner.into(),
            repo: repo.into(),
            name: repo.into(),
            want: true,
            added: util::unix(),
            updated: util::unix(),
            method: "auto".into(),
            groups: if group.is_empty() { Vec::new() } else { vec![group.to_string()] },
            ..Default::default()
        })
    });
    event(json!({ "t": "select", "id": id }));
    set_busy(&id, Some(("meta", -1.0)));
    notify();
    match gh::meta(owner, repo) {
        Ok(m) => {
            let avatar = m.avatar.clone();
            stars::record(&format!("{owner}/{repo}"), m.stars);
            stars::save();
            library::update_app(&id, |a| apply_meta(a, m));
            repo_icon(&id, &avatar);
            if let Ok(langs) = gh::languages(owner, repo) {
                library::update_app(&id, |a| a.langs = langs);
            }
        }
        Err(e) if e.contains("not found") => {
            library::update(|l| l.apps.retain(|a| a.id != id));
            set_busy(&id, None);
            if gh::site_name(owner) == "GitHub" {
                toast("Репозиторій не знайдено на GitHub", true);
            } else {
                toast(&e, true);
            }
            notify();
            return;
        }
        Err(e) => library::update_app(&id, |a| a.error = e),
    }
    let all = install::installed_programs();
    if let Some(app) = library::app(&id)
        && let Some(f) = install::find(&app, &all)
    {
        library::update_app(&id, |a| {
            a.inst = Some(found_inst(f));
            a.want = false;
        });
        exe_icon(&id);
    }
    check_one(&id);
    set_busy(&id, None);
    if let Some(a) = library::app(&id) {
        event(json!({ "t": "added", "id": id, "name": a.name }));
    }
    notify();
}

// ---------------------------------------------------------------- icons

fn icon_rank(src: &str) -> u8 {
    match src {
        "exe" => 3,
        "repo" => 2,
        "avatar" => 1,
        _ => 0,
    }
}

/// Puts a new icon file in place of the old one.
fn set_icon(id: &str, file: String, src: &str) {
    let mut old = String::new();
    library::update_app(id, |a| {
        old = std::mem::replace(&mut a.icon, file.clone());
        a.icon_src = src.into();
    });
    if !old.is_empty() && old != file {
        let _ = std::fs::remove_file(util::www_dir().join("icons").join(old));
    }
}

fn icon_stem(id: &str, src: &str) -> String {
    format!("{}_{src}", id.replace([':', '/'], "_"))
}

/// (worker) The icon of the installed exe (the truest one), when there is one.
fn exe_icon(id: &str) {
    let Some(app) = library::app(id).filter(|a| a.kind == "github" && icon_rank(&a.icon_src) < 3) else { return };
    let Some(exe) = app.inst.as_ref().map(|i| std::path::PathBuf::from(&i.exe)).filter(|p| p.is_file()) else { return };
    if let Some(bytes) = crate::icon::from_exe(&exe) {
        let file = format!("{}.ico", icon_stem(id, "exe"));
        if std::fs::write(util::www_dir().join("icons").join(&file), bytes).is_ok() {
            set_icon(id, file, "exe");
        }
    }
}

/// (worker; 1–2 GitHub requests) An icon file of the repository, else the organisation's logo; a
/// user's avatar is a person's photo, not the app's icon, so it is never used. false — GitHub did
/// not answer (worth another try later).
fn repo_icon(id: &str, avatar: &str) -> bool {
    let Some(app) = library::app(id).filter(|a| a.kind == "github" && icon_rank(&a.icon_src) < 2) else { return true };
    let files = match gh::tree(&app.owner, &app.repo, &app.branch) {
        Ok(f) => f,
        Err(e) => {
            logf!("icon of {id}: {e}");
            return false;
        }
    };
    if let Some(path) = gh::icon_in_tree(&files, &app.repo)
        && let Some(file) = link::cache_icon(&gh::raw_url(&app.owner, &app.repo, &app.branch, &path), &icon_stem(id, "repo"))
    {
        set_icon(id, file, "repo");
        return true;
    }
    if app.org && !avatar.is_empty() && icon_rank(&app.icon_src) < 1 {
        let url = format!("{avatar}{}s=128", if avatar.contains('?') { "&" } else { "?" });
        if let Some(file) = link::cache_icon(&url, &icon_stem(id, "avatar")) {
            set_icon(id, file, "avatar");
            return true;
        }
    }
    if app.icon_src.is_empty() && !app.icon.is_empty() && !app.org {
        // 0.1.0 took any owner's avatar: a photo of a person goes
        let _ = std::fs::remove_file(util::www_dir().join("icons").join(&app.icon));
        library::update_app(id, |a| a.icon.clear());
    }
    true
}

/// (worker, start) Icons for apps that have none yet (0.1.0 avatars, imports, sync from another PC).
fn upgrade_icons() {
    let ids: Vec<(String, bool)> = library::get().apps.iter().filter(|a| a.kind == "github" && a.icon_src.is_empty()).map(|a| (a.id.clone(), a.branch.is_empty())).collect();
    for (id, no_meta) in ids {
        if net::rate().is_some_and(|r| r.remaining < 20) {
            break;
        }
        let Some(app) = library::app(&id) else { continue };
        let mut avatar = String::new();
        if no_meta && let Ok(m) = gh::meta(&app.owner, &app.repo) {
            avatar = m.avatar.clone();
            library::update_app(&id, |a| apply_meta(a, m));
        }
        if !repo_icon(&id, &avatar) {
            break; // GitHub refused (limit): the next start tries again
        }
        library::update_app(&id, |a| {
            if a.icon_src.is_empty() {
                a.icon_src = "none".into();
            }
        });
        notify();
    }
}

fn found_inst(f: Found) -> Installed {
    Installed { version: f.version, method: "found".into(), exe: f.exe, dir: f.dir, uninstall: f.uninstall, at: util::unix(), ..Default::default() }
}

/// (worker) Title, kind, icon and preview of a link; Err — the page did not open.
fn link_meta(id: &str, url: &str) -> Result<(), String> {
    let p = link::fetch(url)?;
    let icon = if p.icon.is_empty() { None } else { link::cache_icon(&p.icon, &icon_stem(id, "site")) };
    let preview = if p.image.is_empty() { None } else { link::cache_icon(&p.image, &icon_stem(id, "preview")) };
    library::update_app(id, |a| {
        if !p.title.is_empty() && (a.name.is_empty() || a.meta_at == 0 || a.updated <= a.added) {
            a.name = p.title.chars().take(100).collect();
        }
        if !p.desc.is_empty() {
            a.desc = p.desc.chars().take(400).collect();
        }
        if let Some(i) = icon {
            a.icon = i;
        }
        a.icon_src = "site".into();
        if let Some(pv) = preview {
            a.preview = pv;
        }
        // shop pages are plain pages: Komora keeps no prices (dropped in 0.5)
        a.link_kind = if p.kind == "product" { "page".into() } else { p.kind.clone() };
        a.author = p.author.clone();
        a.site = p.site.clone();
        a.meta_at = util::unix();
        a.error.clear();
    });
    Ok(())
}

/// (worker) Fresh data of a link; a page that answers 404 / 410 is marked dead (other failures may pass).
fn link_refresh(id: &str, url: &str) -> bool {
    match link_meta(id, url) {
        Ok(()) => {
            library::update_app(id, |a| a.dead = 0);
            true
        }
        // a site that turns away programs (bot protection, a request limit) still opens in a browser: not an error
        Err(e) if ["HTTP 401", "HTTP 403", "HTTP 429", "HTTP 503"].iter().any(|c| e.ends_with(c)) => {
            library::update_app(id, |a| {
                a.meta_at = util::unix();
                a.error.clear();
            });
            false
        }
        Err(e) => {
            let gone = e.ends_with("HTTP 404") || e.ends_with("HTTP 410");
            library::update_app(id, |a| {
                if gone && a.dead == 0 {
                    a.dead = util::unix();
                }
                a.meta_at = util::unix();
                a.error = e;
            });
            false
        }
    }
}

fn add_link(url: &str, group: &str) {
    let id = library::update(|l| {
        if let Some(a) = l.apps.iter().find(|a| a.url == url) {
            return Err(a.id.clone());
        }
        let id = library::next_link_id(l);
        let host = net::split_url(url).map(|h| h.0).unwrap_or_default();
        l.removed.remove(&id);
        l.apps.push(App {
            id: id.clone(),
            url: url.into(),
            kind: "link".into(),
            kit: config::get().kit_new,
            name: host.trim_start_matches("www.").to_string(),
            added: util::unix(),
            updated: util::unix(),
            groups: if group.is_empty() { Vec::new() } else { vec![group.to_string()] },
            ..Default::default()
        });
        Ok(id)
    });
    let id = match id {
        Ok(id) => id,
        Err(old) => {
            also_in(&old, group);
            event(json!({ "t": "select", "id": old }));
            toast("Уже в бібліотеці", false);
            return;
        }
    };
    event(json!({ "t": "select", "id": id }));
    set_busy(&id, Some(("site", -1.0)));
    notify();
    match link_meta(&id, url) {
        Ok(()) => {
            if let Some(a) = library::app(&id) {
                event(json!({ "t": "added", "id": id, "name": a.name }));
            }
        }
        Err(e) => {
            // the link is kept (the site may be down for a while); the page shows why
            toast(&format!("link does not open: {e}"), true);
            library::update_app(&id, |a| a.error = e);
        }
    }
    set_busy(&id, None);
    notify();
}

// ---------------------------------------------------------------- checks

/// (worker) The latest release of one GitHub app (conditional request).
fn check_one(id: &str) -> bool {
    let Some(app) = library::app(id).filter(|a| a.kind == "github") else { return false };
    let pre = app.pre || config::get().pre_all;
    match gh::latest(&app.owner, &app.repo, if app.latest.is_some() { &app.etag } else { "" }, pre) {
        Ok(gh::Latest::Same) => library::update_app(id, |a| {
            a.checked = util::unix();
            a.error.clear();
        }),
        Ok(gh::Latest::None) => library::update_app(id, |a| {
            a.checked = util::unix();
            a.latest = None;
            a.error.clear();
        }),
        Ok(gh::Latest::New(rel, etag)) => library::update_app(id, |a| {
            a.checked = util::unix();
            a.latest = Some(rel);
            a.etag = etag;
            a.error.clear();
        }),
        Err(e) => {
            library::update_app(id, |a| a.error = e);
            return false;
        }
    }
    true
}

/// (worker) What Windows lists as installed: versions of apps updated outside Komora, apps installed
/// or removed by hand.
fn detect_all() {
    let all = install::installed_programs();
    library::update(|l| {
        for a in l.apps.iter_mut().filter(|a| a.kind == "github" && a.id != crate::selfup::ID) {
            let f = install::find(a, &all);
            match (&mut a.inst, f) {
                (None, Some(f)) => {
                    a.inst = Some(found_inst(f));
                    a.want = false;
                }
                (Some(i), Some(f)) if i.method != "portable" => {
                    if !f.version.is_empty() && f.version != i.version {
                        // updated outside Komora: Windows' version is the truth now
                        i.version = f.version;
                        i.tag.clear();
                    }
                    if !f.exe.is_empty() {
                        i.exe = f.exe;
                    }
                    if !f.uninstall.is_empty() {
                        i.uninstall = f.uninstall;
                    }
                }
                (Some(i), None) if i.method == "found" => a.inst = None,
                (Some(i), None) if i.method == "portable" && !std::path::Path::new(&i.dir).is_dir() => a.inst = None,
                _ => {}
            }
        }
    });
    let with_exe: Vec<String> = library::get().apps.iter().filter(|a| a.inst.as_ref().is_some_and(|i| !i.exe.is_empty()) && icon_rank(&a.icon_src) < 3).map(|a| a.id.clone()).collect();
    for id in with_exe {
        exe_icon(&id);
    }
    let disk: u64 = library::get().apps.iter().filter_map(|a| a.inst.as_ref().filter(|i| i.method == "portable" && !i.dir.is_empty())).map(|i| dir_size(std::path::Path::new(&i.dir), 0)).sum();
    DISK.store(disk, Ordering::Relaxed);
}

/// Bytes in a folder and its subfolders (a few levels deep is enough for apps).
fn dir_size(p: &std::path::Path, depth: u32) -> u64 {
    let Ok(rd) = std::fs::read_dir(p) else { return 0 };
    rd.flatten()
        .map(|e| match e.file_type() {
            Ok(t) if t.is_dir() && depth < 8 => dir_size(&e.path(), depth + 1),
            Ok(t) if t.is_file() => e.metadata().map(|m| m.len()).unwrap_or(0),
            _ => 0,
        })
        .sum()
}

fn tweak_list() {
    let list = tweaks::list_json();
    let resets = list.as_array().map(|a| a.iter().filter(|t| t["status"] == "reset").count()).unwrap_or(0);
    RESETS.store(resets, Ordering::Relaxed);
    event(json!({ "t": "tweaks", "list": list }));
    notify();
}

/// Tweaks Windows put back since the last look: counted, and told once.
fn check_tweaks() -> Vec<String> {
    let names = tweaks::new_resets();
    let resets = tweaks::list_json().as_array().map(|a| a.iter().filter(|t| t["status"] == "reset").count()).unwrap_or(0);
    RESETS.store(resets, Ordering::Relaxed);
    names
}

/// (worker) Checks all GitHub apps, product prices and tweaks, then syncs; `manual` — the user asked
/// (the result is shown in the window), otherwise news give a tray notification.
pub fn check_all(manual: bool) {
    if CHECKING.swap(true, Ordering::SeqCst) {
        return;
    }
    notify();
    let mut log: Vec<Value> = vec![json!({ "tag": "cmd", "key": "check" })];
    detect_all();
    let lib = library::get();
    log.push(json!({ "tag": "ok", "key": "found", "n": lib.apps.iter().filter(|a| a.inst.is_some()).count() }));
    let ids: Vec<String> = lib.apps.iter().filter(|a| a.kind == "github").map(|a| a.id.clone()).collect();
    let before: HashMap<String, String> = lib.apps.iter().filter_map(|a| Some((a.id.clone(), a.latest.as_ref()?.tag.clone()))).collect();
    let mut failed = 0;
    for (i, id) in ids.iter().enumerate() {
        event(json!({ "t": "checkProg", "done": i, "total": ids.len() }));
        if net::rate().is_some_and(|r| r.remaining < 2) {
            failed += 1;
            library::update_app(id, |a| a.error = "GitHub request limit reached — add a token in Settings or try later".into());
            continue;
        }
        if !check_one(id) {
            failed += 1;
        }
    }
    event(json!({ "t": "checkProg", "done": ids.len(), "total": ids.len() }));
    let fresh_rel = library::get().apps.iter().filter(|a| a.latest.as_ref().is_some_and(|l| before.get(&a.id).is_some_and(|t| *t != l.tag))).count();
    log.push(json!({ "tag": "ok", "key": "releases", "n": ids.len() - failed, "m": fresh_rel }));
    if failed > 0 {
        log.push(json!({ "tag": "warn", "key": "failed", "n": failed }));
    }
    // health: metadata (last push, archived) older than a month, while requests are plentiful
    for a in lib.apps.iter().filter(|a| a.kind == "github" && util::unix() - a.meta_at > 30 * 86400) {
        if net::rate().is_none_or(|r| r.remaining < 100) {
            break;
        }
        if let Ok(m) = gh::meta(&a.owner, &a.repo) {
            stars::record(&format!("{}/{}", a.owner, a.repo), m.stars);
            library::update_app(&a.id, |x| apply_meta(x, m));
        }
    }
    stars::save();
    // other links: title and preview once a week; pages that are gone are marked
    let mut dead = 0;
    for a in lib.apps.iter().filter(|a| a.kind == "link" && util::unix() - a.meta_at > 7 * 86400) {
        if !link_refresh(&a.id, &a.url) && library::app(&a.id).is_some_and(|x| x.dead > 0) {
            dead += 1;
        }
    }
    if dead > 0 {
        log.push(json!({ "tag": "warn", "key": "dead", "n": dead }));
    }
    // followed authors: new repositories
    let mut news = Vec::new();
    for au in &lib.authors {
        if net::rate().is_some_and(|r| r.remaining < 20) {
            break;
        }
        news.extend(check_author(&au.login));
    }
    if !lib.authors.is_empty() {
        log.push(json!({ "tag": "ok", "key": "authors", "n": lib.authors.len(), "m": news.len() }));
    }
    let mut fresh = Vec::new();
    library::update(|l| {
        for a in &mut l.apps {
            if let Some(tag) = a.update().map(|r| r.tag.clone())
                && a.notified != tag
            {
                fresh.push(a.name.clone());
                a.notified = tag;
            }
        }
    });
    // the «For PC» catalog: installed versions and updates through winget
    crate::winget::scan();
    if config::get().steam_icons {
        crate::steamicons::fix();
    }
    let resets = check_tweaks();
    for r in &resets {
        log.push(json!({ "tag": "warn", "key": "reset", "text": r }));
    }
    config::update(|c| c.last_check = util::unix());
    let n = update_count();
    // pinned apps that have a newer release: "everything is up to date" names them
    let pinned: Vec<Value> = library::get()
        .apps
        .iter()
        .filter(|a| !a.pin.is_empty() && a.inst.is_some())
        .filter_map(|a| {
            let l = a.latest.as_ref()?;
            (l.tag != a.pin && crate::ver::newer(&l.tag, &a.pin)).then(|| json!({ "name": a.name, "pin": a.pin, "latest": l.tag }))
        })
        .collect();
    logf!("check: {} apps, {n} updates, {failed} failed, {} tweaks reset", ids.len(), resets.len());
    let sync = bundle::sync_now(true);
    let c = config::get();
    if c.sync_gist || !c.sync_dir.trim().is_empty() {
        log.push(match &sync {
            Ok(_) => json!({ "tag": "ok", "key": "sync", "text": if c.sync_dir.trim().is_empty() { "Gist".to_string() } else { c.sync_dir.clone() } }),
            Err(e) => json!({ "tag": "warn", "key": "syncErr", "text": e }),
        });
    }
    *CHECK_LOG.lock().unwrap() = (util::unix(), log);
    CHECKING.store(false, Ordering::SeqCst);
    if manual {
        event(json!({ "t": "checked", "updates": n, "failed": failed, "resets": resets, "pinned": pinned, "news": news }));
    } else if c.notify {
        if !fresh.is_empty() {
            balloon(config::tr("Доступні оновлення", "Updates available"), &fresh.join(", "));
        } else if !resets.is_empty() {
            balloon(config::tr("Windows скинула твіки", "Windows reset tweaks"), &resets.join(", "));
        } else if !news.is_empty() {
            balloon(config::tr("Нові репозиторії авторів", "New repositories of authors"), &news.join(", "));
        }
    }
    notify();
    if config::get().kit_auto_update {
        let ids: Vec<String> = library::get().apps.iter().filter(|a| a.kit && a.update().is_some()).map(|a| a.id.clone()).collect();
        for id in ids {
            install_app(&id, "", "");
        }
    }
}

/// (worker) Installs the apps of «My kit» this PC does not have yet (the kit came with a bundle or sync).
fn install_missing_kit() {
    if !config::get().kit_auto_install {
        return;
    }
    let ids: Vec<String> = library::get().apps.iter().filter(|a| a.kit && (a.kind == "github" || a.kind == "winget") && a.inst.is_none() && a.id != crate::selfup::ID).map(|a| a.id.clone()).collect();
    for id in ids {
        if library::app(&id).is_some_and(|a| a.inst.is_none()) {
            install_app(&id, "", "");
        }
    }
}

// ---------------------------------------------------------------- followed authors

/// (worker) Follows a GitHub user or organisation: profile and repositories (2 requests).
/// An author as typed or linked: "name", "@name", a GitHub profile link (→ "name"), a GitLab or Codeberg one (→ "site/name").
fn author_login(s: &str) -> String {
    let t = s.trim().trim_end_matches('/');
    let t = t.strip_prefix("https://").or_else(|| t.strip_prefix("http://")).unwrap_or(t);
    let t = t.strip_prefix("www.").unwrap_or(t);
    if let Some(r) = t.strip_prefix("github.com/") {
        return r.split(['/', '?', '#']).next().unwrap_or("").to_string();
    }
    if let Some(r) = t.strip_prefix("gitlab.com/") {
        return format!("gitlab.com/{}", r.split("/-/").next().unwrap_or("").split(['?', '#']).next().unwrap_or("").trim_end_matches('/'));
    }
    if let Some(r) = t.strip_prefix("codeberg.org/") {
        return format!("codeberg.org/{}", r.split(['/', '?', '#']).next().unwrap_or(""));
    }
    t.trim_start_matches('@').to_string()
}

fn follow(login: &str) {
    let login = author_login(login);
    let login = login.as_str();
    if login.is_empty() || login.ends_with('/') {
        return;
    }
    if library::get().authors.iter().any(|a| a.login.eq_ignore_ascii_case(login)) {
        event(json!({ "t": "author", "login": login }));
        return;
    }
    let u = match gh::user(login) {
        Ok(u) => u,
        Err(e) => {
            toast(&e, true);
            return;
        }
    };
    let repos = gh::user_repos(&u.login).unwrap_or_default();
    let now = util::unix();
    let login = u.login.clone();
    library::update(|l| {
        l.removed.remove(&format!("au:{}", login.to_ascii_lowercase()));
        l.authors.push(library::Author { login: u.login, name: u.name, bio: u.bio, blog: u.blog, avatar: u.avatar, org: u.org, repos, added: now, updated: now, checked: now, kit: config::get().kit_new, ..Default::default() });
    });
    event(json!({ "t": "author", "login": login }));
    notify();
}

/// (worker; 1 request) An author's repositories again; the new ones ("owner/repo") are noted and returned.
fn check_author(login: &str) -> Vec<String> {
    let r = gh::user_repos(login);
    let mut fresh = Vec::new();
    library::update(|l| {
        let Some(a) = l.authors.iter_mut().find(|a| a.login.eq_ignore_ascii_case(login)) else { return };
        a.checked = util::unix();
        match r {
            Ok(list) => {
                let known: std::collections::HashSet<String> = a.repos.iter().filter_map(|x| x["full"].as_str().map(str::to_ascii_lowercase)).collect();
                if !known.is_empty() {
                    for x in &list {
                        let full = x["full"].as_str().unwrap_or_default();
                        if !full.is_empty() && !known.contains(&full.to_ascii_lowercase()) && !x["fork"].as_bool().unwrap_or(false) {
                            fresh.push(full.to_string());
                        }
                    }
                }
                a.news.extend(fresh.iter().cloned());
                a.news.dedup();
                let n = a.news.len();
                if n > 20 {
                    a.news.drain(..n - 20);
                }
                a.repos = list;
                a.error.clear();
            }
            Err(e) => a.error = e,
        }
    });
    fresh
}

// ---------------------------------------------------------------- VirusTotal

/// (worker) The installed file of an app on VirusTotal: by its SHA-256, else uploaded (the kept file)
/// and its analysis waited for (at most ~5 minutes; the free key allows 4 requests a minute).
fn vt_check(id: &str) {
    let key = config::vt_key();
    let Some(inst) = library::app(id).and_then(|a| a.inst) else { return };
    if key.is_empty() || inst.sha256.is_empty() {
        return;
    }
    let save = |state: &str, v: Option<vt::Verdict>| {
        library::update_app(id, |a| {
            if let Some(i) = a.inst.as_mut() {
                i.vt = state.to_string();
                if let Some(v) = v {
                    (i.vt_hits, i.vt_total) = (v.hits, v.total);
                }
                i.vt_at = util::unix();
            }
        });
        notify();
    };
    set_busy(id, Some(("vt", -1.0)));
    let res = (|| -> Result<(), String> {
        if let Some(v) = vt::lookup(&key, &inst.sha256)? {
            save("done", Some(v));
            return Ok(());
        }
        let file = std::path::Path::new(&inst.file);
        if inst.file.is_empty() || !file.is_file() {
            save("unknown", None);
            return Ok(());
        }
        let analysis = vt::upload(&key, file)?;
        save("queued", None);
        for _ in 0..15 {
            thread::sleep(std::time::Duration::from_secs(20));
            if let Some(v) = vt::analysis(&key, &analysis)? {
                save("done", Some(v));
                return Ok(());
            }
        }
        Ok(())
    })();
    set_busy(id, None);
    if let Err(e) = res {
        toast(&e, true);
    } else if let Some(i) = library::app(id).and_then(|a| a.inst).filter(|i| i.vt == "done" && i.vt_hits > 0) {
        balloon("VirusTotal", &format!("{}: {} / {}", library::app(id).map(|a| a.name).unwrap_or_default(), i.vt_hits, i.vt_total));
    }
    notify();
}

/// (worker) Fresh metadata and release of one app or link (opened in the window, or asked for).
fn refresh(id: &str) {
    let Some(app) = library::app(id) else { return };
    if is_busy(id) {
        return;
    }
    if app.kind == "link" {
        set_busy(id, Some(("site", -1.0)));
        link_refresh(id, &app.url);
        set_busy(id, None);
        notify();
        return;
    }
    set_busy(id, Some(("meta", -1.0)));
    if let Ok(m) = gh::meta(&app.owner, &app.repo) {
        let avatar = m.avatar.clone();
        stars::record(&format!("{}/{}", app.owner, app.repo), m.stars);
        stars::save();
        library::update_app(id, |a| apply_meta(a, m));
        exe_icon(id);
        repo_icon(id, &avatar);
        if let Ok(langs) = gh::languages(&app.owner, &app.repo) {
            library::update_app(id, |a| a.langs = langs);
        }
    }
    check_one(id);
    set_busy(id, None);
    notify();
}

/// A search result with its star growth over the last week (when Komora saw it before).
fn with_gain(mut item: Value) -> Value {
    let full = item["full"].as_str().unwrap_or_default().to_string();
    if let Some(g) = stars::record(&full, item["stars"].as_u64().unwrap_or(0)) {
        item["gain"] = json!(g);
    }
    item
}

/// (worker) A repository opened from GitHub search: its latest release, the file for this PC and the README.
fn gh_repo(full: &str) {
    let Some((o, r)) = gh::parse_repo(full) else { return };
    let rel = match gh::latest(&o, &r, "", false) {
        Ok(gh::Latest::New(rel, _)) => Some(rel),
        _ => None,
    };
    let pick = rel.as_ref().and_then(|x| gh::pick(&x.assets, "auto")).map(|(a, k)| json!({ "name": a.name, "size": a.size, "kind": format!("{k:?}").to_lowercase() }));
    let readme = gh::readme(&o, &r);
    let langs = gh::languages(&o, &r).unwrap_or_default();
    // the app's own icon among the repository files (the list shows the owner's avatar)
    let icon = gh::tree(&o, &r, "").ok().and_then(|files| gh::icon_in_tree(&files, &r)).map(|p| gh::raw_url(&o, &r, "", &p)).unwrap_or_default();
    event(json!({ "t": "ghRepo", "full": full, "release": rel.map(|x| json!({ "tag": x.tag, "date": x.date, "prerelease": x.prerelease })), "pick": pick, "readme": readme.as_deref().unwrap_or_default(), "err": readme.err(), "langs": langs, "icon": icon }));
}

/// The README, or another Markdown file of the repository a README link points to (`path`).
fn readme(id: &str, path: &str) {
    let Some(app) = library::app(id).filter(|a| a.kind == "github") else { return };
    let res = if path.is_empty() { gh::readme(&app.owner, &app.repo) } else { gh::markdown_file(&app.owner, &app.repo, path) };
    event(json!({ "t": "readme", "id": id, "path": path, "html": res.as_deref().unwrap_or_default(), "err": res.err() }));
    // apps added before 0.4 (or before their first refresh) have no languages yet
    if app.langs.is_empty() {
        if let Ok(langs) = gh::languages(&app.owner, &app.repo) {
            if !langs.is_empty() {
                library::update_app(id, |a| a.langs = langs);
                notify();
            }
        }
    }
}

fn releases(id: &str) {
    let Some(app) = library::app(id).filter(|a| a.kind == "github") else { return };
    let res = gh::releases(&app.owner, &app.repo, 15);
    event(json!({ "t": "releases", "id": id, "list": res.as_ref().ok(), "err": res.err() }));
}

// ---------------------------------------------------------------- install, rollback, remove

/// (worker) Installs the latest release, or the release `tag` (an older one pins the app on it).
fn install_app(id: &str, asset_name: &str, tag: &str) {
    let Some(app) = library::app(id) else { return };
    // a program of the picks goes through winget (the kit, «Update all» and the like come here too)
    if app.kind == "winget" {
        if !is_busy(id) {
            winget_install(vec![app.repo.clone()], String::new());
        }
        return;
    }
    if is_busy(id) || app.kind != "github" {
        return;
    }
    let latest_tag = app.latest.as_ref().map(|l| l.tag.clone()).unwrap_or_default();
    let rel = if tag.is_empty() || tag == latest_tag {
        if app.latest.is_none() {
            check_one(id);
        }
        library::app(id).and_then(|a| a.latest)
    } else {
        match gh::release_by_tag(&app.owner, &app.repo, tag) {
            Ok(r) => Some(r),
            Err(e) => {
                toast(&e, true);
                return;
            }
        }
    };
    let Some(rel) = rel else {
        toast("У репозиторію немає релізів", true);
        return;
    };
    let older = !latest_tag.is_empty() && rel.tag != latest_tag;
    let chosen = if asset_name.is_empty() {
        gh::pick_for(&rel.assets, &app.method, &app.asset_match)
    } else {
        rel.assets.iter().find(|a| a.name == asset_name).and_then(|a| gh::pick(std::slice::from_ref(a), "auto"))
    };
    let Some((asset, kind)) = chosen else {
        toast("У релізі немає файлу для Windows", true);
        return;
    };
    set_busy(id, Some(("queued", -1.0)));
    let _one = INSTALL.lock().unwrap_or_else(|e| e.into_inner());
    if cancelled(id) {
        cancel_done(id);
        set_busy(id, None);
        return;
    }
    if config::get().auto_backup && app.inst.is_some() && !(app.bpaths.is_empty() && app.breg.is_empty()) {
        set_busy(id, Some(("backup", -1.0)));
        match backup::backup(&app) {
            Ok(_) => library::update_app(id, |a| a.backup_at = util::unix()),
            Err(e) => logf!("backup before the update of {id}: {e}"),
        }
    }
    if id == crate::selfup::ID {
        let r = crate::selfup::update(&rel, &mut |stage, pct| set_busy(id, Some((stage, pct))));
        set_busy(id, None);
        match r {
            Ok(()) => util::post_ui(crate::WM_RESTART, 0),
            Err(e) => {
                logf!("self-update: {e}");
                toast(&e, true);
            }
        }
        notify();
        return;
    }
    logf!("install {id} {} from {}", rel.tag, asset.name);
    set_busy(id, Some(("download", 0.0)));
    let mut last = (String::new(), -2.0f32);
    let res = install::install(&app, &asset, kind, &rel.tag, &mut |stage, pct| {
        if stage != last.0 || (pct - last.1).abs() >= 0.01 || pct < 0.0 {
            last = (stage.to_string(), pct);
            set_busy(id, Some((stage, pct)));
        }
    });
    match res {
        Ok(inst) => {
            library::update_app(id, |a| {
                a.inst = Some(inst);
                a.want = false;
                a.error.clear();
                a.notified = rel.tag.clone();
                if older {
                    a.pin = rel.tag.clone();
                }
            });
            exe_icon(id);
            auto_paths(id);
            event(json!({ "t": "installed", "id": id, "pinned": if older { rel.tag.as_str() } else { "" } }));
            if !config::vt_key().is_empty() {
                let id = id.to_string();
                spawn(move || vt_check(&id));
            }
        }
        Err(e) if e == "cancelled" => toast("Встановлення скасовано", false),
        Err(e) => {
            logf!("install {id}: {e}");
            library::update_app(id, |a| a.error = e.clone());
            toast(&e, true);
        }
    }
    cancel_done(id);
    set_busy(id, None);
    notify();
}

fn rollback(id: &str) {
    let Some(app) = library::app(id) else { return };
    if id == crate::selfup::ID {
        return;
    }
    set_busy(id, Some(("rollback", -1.0)));
    match install::rollback(&app) {
        Ok(inst) => library::update_app(id, |a| {
            a.inst = Some(inst);
            a.error.clear();
        }),
        Err(e) => toast(&e, true),
    }
    set_busy(id, None);
    notify();
}

fn uninstall(id: &str) {
    let Some(app) = library::app(id) else { return };
    if id == crate::selfup::ID {
        return;
    }
    if is_busy(id) {
        return;
    }
    set_busy(id, Some(("queued", -1.0)));
    let _one = INSTALL.lock().unwrap_or_else(|e| e.into_inner());
    set_busy(id, Some(("uninstall", -1.0)));
    let r = if app.kind == "winget" { crate::winget::uninstall(&app) } else { install::uninstall(&app) };
    match r {
        Ok(true) => library::update_app(id, |a| a.inst = None),
        Ok(false) => toast("Програма ще є в списку Windows", false),
        Err(e) => toast(&e, true),
    }
    set_busy(id, None);
    if app.kind == "winget" {
        crate::winget::scan();
    }
    notify();
}

/// (worker) A bundle from another PC: merged in, the chosen tweaks applied, the chosen apps installed
/// one after another, their settings restored when a backup came along.
fn accept_bundle(apps: Vec<String>, tw: Vec<String>) {
    if let Err(e) = bundle::accept() {
        toast(&e, true);
        return;
    }
    notify();
    let mut failed = 0;
    for t in &tw {
        if tweaks::apply(t).is_err() {
            failed += 1;
        }
    }
    library::update(|l| {
        for t in &tw {
            if !l.kit_tweaks.contains(t) {
                l.kit_tweaks.push(t.clone());
            }
        }
    });
    tweak_list();
    for id in &apps {
        install_app(id, "", "");
        if let Some(a) = library::app(id)
            && a.inst.is_some()
            && !backup::list(id).as_array().is_none_or(|l| l.is_empty())
            && backup::restore(&a, "").is_err()
        {
            failed += 1;
        }
    }
    event(json!({ "t": "bundleDone", "apps": apps.len(), "tweaks": tw.len(), "failed": failed }));
    notify();
}

/// (start) What is installed now, icons, tweaks Windows put back, sync.
/// Fills in the settings folders and keys of an installed app once (the user keeps or removes them).
fn auto_paths(id: &str) {
    let Some(a) = library::app(id).filter(|a| a.inst.is_some() && !a.bk_auto && a.kind == "github" && a.id != crate::selfup::ID) else { return };
    let (dirs, regs) = backup::initial(&a);
    library::touch_app(id, |x| {
        for d in dirs {
            if !x.bpaths.contains(&d) {
                x.bpaths.push(d);
            }
        }
        for r in regs {
            if !x.breg.contains(&r) {
                x.breg.push(r);
            }
        }
        x.bk_auto = true;
    });
}

/// (worker, once a day) Settings folders for installed apps that have none yet, and a backup of
/// every app whose settings changed since its last backup.
fn daily_backups() {
    if !config::get().auto_backup {
        return;
    }
    library::update(|l| {
        for a in l.apps.iter_mut() {
            let mut seen: Vec<String> = Vec::new();
            a.bpaths.retain(|p| {
                let k = p.to_lowercase();
                let fresh = !seen.contains(&k);
                seen.push(k);
                fresh
            });
        }
    });
    let ids: Vec<String> = library::get().apps.iter().filter(|a| a.inst.is_some()).map(|a| a.id.clone()).collect();
    for id in &ids {
        auto_paths(id);
    }
    let mut done = 0;
    for id in ids {
        let Some(a) = library::app(&id).filter(|a| !(a.bpaths.is_empty() && a.breg.is_empty())) else { continue };
        if a.backup_at > 0 && !backup::changed_since(&a, a.backup_at) {
            continue;
        }
        if is_busy(&id) {
            continue;
        }
        set_busy(&id, Some(("backup", -1.0)));
        match backup::backup(&a) {
            Ok(_) => {
                library::update_app(&id, |x| x.backup_at = util::unix());
                done += 1;
            }
            Err(e) => logf!("daily backup of {id}: {e}"),
        }
        set_busy(&id, None);
    }
    if done > 0 {
        logf!("daily backups: {done}");
        notify();
    }
}

pub fn startup() {
    library::update(|l| {
        for a in l.apps.iter_mut().filter(|a| a.link_kind == "product" || !a.price_hist.is_empty()) {
            a.link_kind = "page".into();
            a.price = 0.0;
            a.price_hist.clear();
        }
    });
    spawn(|| {
        crate::selfup::ensure();
        detect_all();
        notify();
        let resets = check_tweaks();
        if !resets.is_empty() && config::get().notify {
            balloon(config::tr("Windows скинула твіки", "Windows reset tweaks"), &resets.join(", "));
        }
        let _ = bundle::sync_now(true);
        notify();
        upgrade_icons();
    });
}

/// (UI thread, once a minute) Starts the automatic check when it is due; syncs (a folder every
/// minute, a Gist every ten).
pub fn tick() {
    let c = config::get();
    if c.check_hours != 0 && !CHECKING.load(Ordering::Relaxed) && util::unix() - c.last_check >= c.check_hours as i64 * 3600 {
        spawn(|| check_all(false));
        return;
    }
    // settings backups: once a day, counted across restarts
    let now = util::unix();
    if now - c.daily_backup_at >= 86400 {
        config::update(|x| x.daily_backup_at = now);
        spawn(daily_backups);
    }
    let m = SYNC_MIN.fetch_add(1, Ordering::Relaxed) + 1;
    if !c.sync_dir.trim().is_empty() || ((c.sync_gist || c.sync_dbx) && m % 10 == 0) {
        spawn(move || {
            if bundle::sync_now(m % 10 == 0).unwrap_or(false) {
                notify();
                install_missing_kit();
            }
        });
    }
}
