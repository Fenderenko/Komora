//! What Komora installed and updated, the newest first: the last 200 in history.json of the data folder.

use std::sync::Mutex;

use serde_json::{Value, json};

use crate::util;

const KEEP: usize = 200;

static LOCK: Mutex<()> = Mutex::new(());

fn file() -> std::path::PathBuf {
    util::data_dir().join("history.json")
}

/// The records, the newest first.
pub fn get() -> Vec<Value> {
    std::fs::read_to_string(file()).ok().and_then(|s| serde_json::from_str::<Vec<Value>>(&s).ok()).unwrap_or_default()
}

/// One install (`from` empty) or update of an app or a link.
pub fn record(id: &str, name: &str, from: &str, to: &str) {
    if from == to && !from.is_empty() {
        return;
    }
    let _g = LOCK.lock().unwrap_or_else(|e| e.into_inner());
    let mut v = get();
    v.insert(0, json!({ "at": util::unix(), "id": id, "name": name, "from": from, "to": to }));
    v.truncate(KEEP);
    let p = file();
    let tmp = p.with_extension("tmp");
    if std::fs::write(&tmp, Value::Array(v).to_string()).is_ok() {
        let _ = std::fs::rename(&tmp, &p);
    }
}
