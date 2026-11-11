//! VirusTotal (API v3, the user's own free key): a lookup of a downloaded file by its SHA-256, and an
//! upload of a file VirusTotal has not seen, with its analysis. The free key allows 4 requests a minute.

use std::path::Path;

use serde_json::Value;

use crate::net;

const API: &str = "https://www.virustotal.com/api/v3";
/// Files up to this size go straight to /files; larger ones through an upload URL.
const DIRECT: u64 = 32 << 20;
/// Larger files are not uploaded automatically (they would be held in memory while sent).
pub const MAX_UPLOAD: u64 = 200 << 20;

/// Engines that flagged the file and engines that gave an answer.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Verdict {
    pub hits: u32,
    pub total: u32,
}

fn verdict(stats: &Value) -> Verdict {
    let n = |k: &str| stats.get(k).and_then(Value::as_u64).unwrap_or(0) as u32;
    Verdict { hits: n("malicious") + n("suspicious"), total: n("malicious") + n("suspicious") + n("undetected") + n("harmless") }
}

fn get(key: &str, url: &str) -> Result<(u32, Value), String> {
    let r = net::get(url, &[("x-apikey", key), ("Accept", "application/json")], 4 << 20)?;
    let v: Value = serde_json::from_slice(&r.body).unwrap_or_default();
    match r.status {
        200 | 404 => Ok((r.status, v)),
        401 | 403 => Err("the VirusTotal key is not accepted".into()),
        429 => Err("VirusTotal limit reached — try in a minute".into()),
        s => Err(format!("VirusTotal answered HTTP {s}")),
    }
}

/// The verdict for a file VirusTotal knows; None — it has never seen this file.
pub fn lookup(key: &str, sha256: &str) -> Result<Option<Verdict>, String> {
    let (status, v) = get(key, &format!("{API}/files/{sha256}"))?;
    if status == 404 {
        return Ok(None);
    }
    Ok(Some(verdict(&v["data"]["attributes"]["last_analysis_stats"])))
}

/// Sends the file for analysis; the analysis id.
pub fn upload(key: &str, file: &Path) -> Result<String, String> {
    let size = std::fs::metadata(file).map_err(|e| e.to_string())?.len();
    if size > MAX_UPLOAD {
        return Err("the file is too large for an automatic upload".into());
    }
    let url = if size > DIRECT {
        let (_, v) = get(key, &format!("{API}/files/upload_url"))?;
        v["data"].as_str().filter(|u| u.starts_with("https://")).ok_or("VirusTotal gave no upload address")?.to_string()
    } else {
        format!("{API}/files")
    };
    let name = file.file_name().map(|n| n.to_string_lossy().replace('"', "")).unwrap_or_else(|| "file".into());
    let data = std::fs::read(file).map_err(|e| e.to_string())?;
    let boundary = format!("komora{}", crate::util::unix_ms());
    let mut body = format!("--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"{name}\"\r\nContent-Type: application/octet-stream\r\n\r\n").into_bytes();
    body.extend_from_slice(&data);
    drop(data);
    body.extend_from_slice(format!("\r\n--{boundary}--\r\n").as_bytes());
    let ct = format!("multipart/form-data; boundary={boundary}");
    let r = net::post(&url, &[("x-apikey", key), ("Accept", "application/json"), ("Content-Type", &ct)], &body, 1 << 20)?;
    match r.status {
        200 => {
            let v: Value = serde_json::from_slice(&r.body).map_err(|e| e.to_string())?;
            v["data"]["id"].as_str().map(String::from).ok_or_else(|| "VirusTotal gave no analysis id".into())
        }
        401 | 403 => Err("the VirusTotal key is not accepted".into()),
        429 => Err("VirusTotal limit reached — try in a minute".into()),
        s => Err(format!("VirusTotal answered HTTP {s}")),
    }
}

/// The verdict of an analysis; None — still queued.
pub fn analysis(key: &str, id: &str) -> Result<Option<Verdict>, String> {
    let (_, v) = get(key, &format!("{API}/analyses/{}", net::enc(id)))?;
    let a = &v["data"]["attributes"];
    if a["status"].as_str() != Some("completed") {
        return Ok(None);
    }
    Ok(Some(verdict(&a["stats"])))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn verdicts() {
        let v = verdict(&serde_json::json!({ "malicious": 2, "suspicious": 1, "undetected": 60, "harmless": 0, "timeout": 3, "type-unsupported": 5 }));
        assert_eq!(v, Verdict { hits: 3, total: 63 });
        assert_eq!(verdict(&Value::Null), Verdict { hits: 0, total: 0 });
    }
}
