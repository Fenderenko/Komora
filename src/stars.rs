//! Star counts seen over time (search results, library metadata), so "+N a week" can be shown: GitHub
//! itself gives only the current count. Kept in stars.json: repo → [(day, stars)], at most 40 days,
//! repositories not seen for 120 days are dropped.

use std::{collections::BTreeMap, sync::Mutex};

use crate::util;

type Hist = BTreeMap<String, Vec<(i64, u64)>>;

static DATA: Mutex<Option<Hist>> = Mutex::new(None);

fn path() -> std::path::PathBuf {
    util::data_dir().join("stars.json")
}

fn with<R>(f: impl FnOnce(&mut Hist) -> R) -> R {
    let mut g = DATA.lock().unwrap();
    let h = g.get_or_insert_with(|| std::fs::read_to_string(path()).ok().and_then(|s| serde_json::from_str(&s).ok()).unwrap_or_default());
    f(h)
}

fn today() -> i64 {
    util::unix() / 86400
}

/// Notes the count (once a day per repository) and gives the growth over the last 7+ days, if known.
pub fn record(full: &str, stars: u64) -> Option<i64> {
    let key = full.to_ascii_lowercase();
    let d = today();
    with(|h| {
        let v = h.entry(key).or_default();
        match v.last_mut() {
            Some(last) if last.0 == d => last.1 = stars,
            _ => v.push((d, stars)),
        }
        v.retain(|x| d - x.0 <= 40);
        gain(v, d)
    })
}

/// The growth over the last 7+ days as last noted, if known (nothing recorded).
pub fn gain_of(full: &str) -> Option<i64> {
    let d = today();
    with(|h| h.get(&full.to_ascii_lowercase()).and_then(|v| gain(v, d)))
}

fn gain(v: &[(i64, u64)], d: i64) -> Option<i64> {
    let base = v.iter().rev().find(|x| d - x.0 >= 7)?;
    let now = v.last()?;
    Some(now.1 as i64 - base.1 as i64)
}

/// Writes what was noted (after a batch of records).
pub fn save() {
    with(|h| {
        let d = today();
        h.retain(|_, v| v.last().is_some_and(|x| d - x.0 <= 120));
        if let Ok(s) = serde_json::to_string(h) {
            let _ = std::fs::write(path(), s);
        }
    });
}

#[cfg(test)]
mod tests {
    #[test]
    fn weekly_gain() {
        assert_eq!(super::gain(&[(100, 50), (104, 60), (110, 90)], 110), Some(40));
        assert_eq!(super::gain(&[(108, 50), (110, 90)], 110), None, "less than a week of data");
    }
}
