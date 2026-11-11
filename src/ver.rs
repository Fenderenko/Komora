//! Versions of releases and installed apps: "v18.0.0", "18.0.0.1234", "2024.11.05", "release-1.2".

use std::cmp::Ordering;

/// The numeric parts of the first version-like run in `s`: "v1.2.3-beta" → [1, 2, 3].
pub fn parts(s: &str) -> Vec<u64> {
    let b = s.as_bytes();
    let Some(start) = b.iter().position(u8::is_ascii_digit) else { return Vec::new() };
    let mut out = Vec::new();
    let mut cur: Option<u64> = None;
    for &c in &b[start..] {
        match c {
            b'0'..=b'9' => cur = Some(cur.unwrap_or(0).saturating_mul(10).saturating_add((c - b'0') as u64)),
            b'.' | b'_' if cur.is_some() => out.push(cur.take().unwrap()),
            _ => break,
        }
    }
    if let Some(v) = cur {
        out.push(v);
    }
    out
}

/// Compares over the length of `a`, missing parts of `b` count as 0: so "18.0.0" equals the installed
/// "18.0.0.1234" (installers often add a build number the tag does not have).
fn cmp_by_a(a: &[u64], b: &[u64]) -> Ordering {
    for (i, x) in a.iter().enumerate() {
        match x.cmp(b.get(i).unwrap_or(&0)) {
            Ordering::Equal => {}
            o => return o,
        }
    }
    Ordering::Equal
}

/// Is the release `latest` newer than `installed`? Unparsable versions differ when the texts differ.
pub fn newer(latest: &str, installed: &str) -> bool {
    let (a, b) = (parts(latest), parts(installed));
    if a.is_empty() || b.is_empty() {
        return norm(latest) != norm(installed);
    }
    cmp_by_a(&a, &b) == Ordering::Greater
}

fn norm(s: &str) -> String {
    s.trim().trim_start_matches(['v', 'V']).to_ascii_lowercase()
}

/// A short form for the window: "v18.0.0" → "18.0.0".
pub fn display(s: &str) -> String {
    let p = parts(s);
    if p.is_empty() { s.trim().to_string() } else { p.iter().map(u64::to_string).collect::<Vec<_>>().join(".") }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse() {
        assert_eq!(parts("v1.2.3-beta"), vec![1, 2, 3]);
        assert_eq!(parts("release-2024.11.05"), vec![2024, 11, 5]);
        assert_eq!(parts("nightly"), Vec::<u64>::new());
        assert_eq!(parts("1_2_3"), vec![1, 2, 3]);
    }

    #[test]
    fn compare() {
        assert!(newer("v18.0.0", "17.1.0"));
        assert!(!newer("v18.0.0", "18.0.0.1234"), "build number of the installer");
        assert!(newer("0.97.0", "0.96.0"));
        assert!(!newer("0.96.0", "0.97.0"));
        assert!(newer("1.2.1", "1.2"));
        assert!(newer("nightly-b", "nightly-a"));
        assert!(!newer("v1.0", "1.0"));
        assert_eq!(display("v18.0.0"), "18.0.0");
    }
}
