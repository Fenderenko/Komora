//! Settings in %APPDATA%\Komora\config.json. Unknown fields are kept.

use std::sync::{Mutex, OnceLock};

use serde::{Deserialize, Serialize};

use crate::{logf, util};

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct Config {
    /// "system", "light" or "dark"
    pub theme: String,
    /// "auto", "uk" or "en"
    pub lang: String,
    /// hours between automatic update checks: 24, 168 (week), 720 (month); 0 — never
    pub check_hours: u32,
    /// unix time of the last finished check
    pub last_check: i64,
    /// 0.1.0 kept the GitHub token here as plain text; moved into `token_enc` on load
    #[serde(skip_serializing_if = "String::is_empty")]
    pub token: String,
    /// optional GitHub token (5000 requests per hour instead of 60), DPAPI-encrypted (secret.rs)
    pub token_enc: String,
    /// where portable apps are unpacked
    pub apps_dir: String,
    /// a tray notification when new updates are found
    pub notify: bool,
    /// settings backups by themselves: before an update and once a day when the files changed
    pub auto_backup: bool,
    /// unix time of the last daily backup round
    pub daily_backup_at: i64,
    /// «My kit»: its apps update by themselves; on a PC that got the kit (bundle, sync) its missing apps install by themselves
    pub kit_auto_update: bool,
    pub kit_auto_install: bool,
    /// window position and size in physical pixels; w == 0 — centred default
    pub win: WinPos,
    /// sync through a file in this folder (OneDrive, Google Drive, Dropbox…); "" — off
    pub sync_dir: String,
    /// sync through a secret GitHub Gist (the token needs the Gists permission)
    pub sync_gist: bool,
    pub gist_id: String,
    /// sync through Dropbox (its app folder) and the refresh token, DPAPI-encrypted (dropbox.rs)
    pub sync_dbx: bool,
    pub dbx_enc: String,
    /// `at` of the last remote copy merged, unix time of the last write
    pub sync_seen: i64,
    pub sync_wrote: i64,
    /// GitHub login for importing stars (filled from the token when it has one)
    pub gh_login: String,
    /// accent colour: "violet", "blue", "teal", "sage", "ochre" or "windows"
    pub accent: String,
    /// background: "" (warm grey), "obsidian", "graphite", "slate", "moss", "plum" or "#rrggbb"
    pub bg: String,
    /// offer pre-releases as updates for every app (each app can also ask for them on its own)
    pub pre_all: bool,
    /// parent folder for apps installed by setups ("" — where the setup proposes); the app's name is added
    pub setup_dir: String,
    /// show the setup's own window instead of a silent install
    pub setup_show: bool,
    /// optional VirusTotal API key, DPAPI-encrypted (secret.rs)
    pub vt_key_enc: String,
    /// version of the look the settings were made for (2 — the zinc and violet look of 0.5)
    pub look: u32,
    #[serde(flatten)]
    pub rest: serde_json::Map<String, serde_json::Value>,
}

#[derive(Clone, Copy, Default, Serialize, Deserialize)]
#[serde(default)]
pub struct WinPos {
    pub x: i32,
    pub y: i32,
    pub w: i32,
    pub h: i32,
    pub max: bool,
}

impl Default for Config {
    fn default() -> Self {
        let home = std::env::var("USERPROFILE").unwrap_or_else(|_| "C:\\".into());
        Self {
            theme: "system".into(),
            lang: "auto".into(),
            check_hours: 24,
            last_check: 0,
            token: String::new(),
            token_enc: String::new(),
            apps_dir: format!("{home}\\Apps"),
            notify: true,
            auto_backup: true,
            daily_backup_at: 0,
            kit_auto_update: false,
            kit_auto_install: false,
            win: WinPos::default(),
            sync_dir: String::new(),
            sync_gist: false,
            gist_id: String::new(),
            sync_dbx: false,
            dbx_enc: String::new(),
            sync_seen: 0,
            sync_wrote: 0,
            gh_login: String::new(),
            accent: "violet".into(),
            bg: String::new(),
            pre_all: false,
            setup_dir: String::new(),
            setup_show: false,
            vt_key_enc: String::new(),
            look: 0,
            rest: Default::default(),
        }
    }
}

impl Config {
    /// The language in effect ("uk" or "en").
    pub fn lang(&self) -> &'static str {
        match self.lang.as_str() {
            "uk" => "uk",
            "en" => "en",
            l => LANGS.iter().find(|x| **x == l).copied().unwrap_or_else(util::system_lang),
        }
    }
}

static CFG: OnceLock<Mutex<Config>> = OnceLock::new();

fn cell() -> &'static Mutex<Config> {
    CFG.get_or_init(|| Mutex::new(load()))
}

/// The check intervals the window offers.
pub const CHECK_HOURS: [u32; 4] = [0, 24, 168, 720];

fn load() -> Config {
    let mut c = read();
    // 0.1.0 checked every 6 hours by default
    if !CHECK_HOURS.contains(&c.check_hours) {
        c.check_hours = 24;
    }
    // 0.1.0 – 0.2.0 kept the token as plain text
    if !c.token.trim().is_empty()
        && let Some(e) = crate::secret::protect(c.token.trim())
    {
        c.token_enc = e;
        c.token.clear();
        save(&c);
    }
    // 0.5 moved to the zinc and violet look: its accent replaces the earlier defaults once
    if c.look < 2 {
        if c.accent == "teal" || c.accent == "blue" {
            c.accent = "violet".into();
        }
        c.look = 2;
        save(&c);
    }
    // 1.0: warm grey is the background by default; the zinc of 0.5 is the "obsidian" choice
    if c.look < 3 {
        if c.bg == "warm" {
            c.bg.clear();
        }
        c.look = 3;
        save(&c);
    }
    c
}

/// The GitHub token ("" — none).
pub fn token() -> String {
    let e = get().token_enc;
    if e.is_empty() { String::new() } else { crate::secret::unprotect(&e).unwrap_or_default() }
}

pub fn set_token(t: &str) {
    let enc = if t.trim().is_empty() { String::new() } else { crate::secret::protect(t.trim()).unwrap_or_default() };
    update(|c| c.token_enc = enc);
}

/// The VirusTotal API key ("" — none).
pub fn vt_key() -> String {
    let e = get().vt_key_enc;
    if e.is_empty() { String::new() } else { crate::secret::unprotect(&e).unwrap_or_default() }
}

pub fn set_vt_key(k: &str) {
    let enc = if k.trim().is_empty() { String::new() } else { crate::secret::protect(k.trim()).unwrap_or_default() };
    update(|c| c.vt_key_enc = enc);
}

fn read() -> Config {
    let p = util::data_dir().join("config.json");
    match std::fs::read_to_string(&p) {
        Ok(s) => serde_json::from_str(s.trim_start_matches('\u{feff}')).unwrap_or_else(|e| {
            logf!("config.json unreadable ({e}), using defaults");
            Config::default()
        }),
        Err(_) => Config::default(),
    }
}

pub fn get() -> Config {
    cell().lock().unwrap().clone()
}

/// Changes the settings and writes them at once (small file, rare changes).
pub fn update(f: impl FnOnce(&mut Config)) {
    let mut g = cell().lock().unwrap();
    f(&mut g);
    save(&g);
}

fn save(c: &Config) {
    let p = util::data_dir().join("config.json");
    let tmp = p.with_extension("tmp");
    if let Ok(s) = serde_json::to_string_pretty(c)
        && std::fs::write(&tmp, s).is_ok()
    {
        let _ = std::fs::rename(&tmp, &p);
    }
}

/// Interface languages besides Ukrainian and English, in the order of web/i18n.js and TR.
pub const LANGS: [&str; 7] = ["de", "fr", "es", "pt", "pl", "it", "tr"];

/// The Rust side's strings in LANGS order, keyed by the Ukrainian text.
const TR: &[(&str, [&str; 7])] = &[
    ("Доступні оновлення", ["Updates verfügbar", "Mises à jour disponibles", "Actualizaciones disponibles", "Atualizações disponíveis", "Dostępne aktualizacje", "Aggiornamenti disponibili", "Güncellemeler var"]),
    ("Windows скинула твіки", ["Windows hat Tweaks zurückgesetzt", "Windows a réinitialisé des réglages", "Windows restableció ajustes", "O Windows redefiniu ajustes", "Windows zresetował poprawki", "Windows ha ripristinato delle modifiche", "Windows ayarları sıfırladı"]),
    ("Нові репозиторії авторів", ["Neue Repositorys von Autoren", "Nouveaux dépôts des auteurs", "Repositorios nuevos de autores", "Repositórios novos de autores", "Nowe repozytoria autorów", "Nuovi repository degli autori", "Yazarların yeni depoları"]),
    ("оновлень:", ["Updates:", "mises à jour :", "actualizaciones:", "atualizações:", "aktualizacje:", "aggiornamenti:", "güncelleme:"]),
    ("Відкрити Komora", ["Komora öffnen", "Ouvrir Komora", "Abrir Komora", "Abrir o Komora", "Otwórz Komora", "Apri Komora", "Komora’yı aç"]),
    ("Перевірити оновлення", ["Nach Updates suchen", "Rechercher des mises à jour", "Buscar actualizaciones", "Procurar atualizações", "Sprawdź aktualizacje", "Controlla aggiornamenti", "Güncellemeleri denetle"]),
    ("Вихід", ["Beenden", "Quitter", "Salir", "Sair", "Zakończ", "Esci", "Çıkış"]),
];

/// Short user-visible strings of the Rust side (tray, notifications) in the interface language.
pub fn tr(uk: &'static str, en: &'static str) -> &'static str {
    match get().lang() {
        "uk" => uk,
        "en" => en,
        l => LANGS.iter().position(|x| *x == l).and_then(|i| TR.iter().find(|r| r.0 == uk).map(|r| r.1[i])).unwrap_or(en),
    }
}
