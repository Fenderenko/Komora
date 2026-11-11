//! HTTPS through WinHTTP (TLS and the proxy settings come from Windows): requests with custom headers,
//! conditional requests (ETag), the GitHub rate limit and file downloads with progress.

use std::{ffi::c_void, io::Write, path::Path, sync::Mutex};

use windows::{
    Win32::Networking::WinHttp::{
        WINHTTP_ACCESS_TYPE_AUTOMATIC_PROXY, WINHTTP_FLAG_SECURE, WINHTTP_QUERY_CUSTOM, WINHTTP_QUERY_FLAG_NUMBER, WINHTTP_QUERY_STATUS_CODE, WinHttpCloseHandle, WinHttpConnect, WinHttpOpen,
        WinHttpOpenRequest, WinHttpQueryHeaders, WinHttpReadData, WinHttpReceiveResponse, WinHttpSendRequest, WinHttpSetTimeouts,
    },
    core::{HSTRING, PCWSTR},
};

/// The GitHub API rate limit as last reported.
#[derive(Clone, Copy, Default, serde::Serialize)]
pub struct Rate {
    pub remaining: i64,
    pub limit: i64,
    /// unix time when the limit resets
    pub reset: i64,
}

static RATE: Mutex<Option<Rate>> = Mutex::new(None);

pub fn rate() -> Option<Rate> {
    *RATE.lock().unwrap()
}

pub struct Response {
    pub status: u32,
    pub etag: String,
    pub body: Vec<u8>,
}

/// A WinHTTP handle, closed when dropped.
struct Handle(*mut c_void);

impl Drop for Handle {
    fn drop(&mut self) {
        if !self.0.is_null() {
            let _ = unsafe { WinHttpCloseHandle(self.0) };
        }
    }
}

/// An open request with the answer received; the session and the connection live as long as it.
struct Req {
    _ses: Handle,
    _con: Handle,
    req: Handle,
    status: u32,
}

/// ("host", "/path?query", port) of an https URL; http URLs are upgraded to https.
pub fn split_url(url: &str) -> Option<(String, String, u16)> {
    let rest = url.strip_prefix("https://").or_else(|| url.strip_prefix("http://"))?;
    let (hostport, path) = match rest.find(['/', '?', '#']) {
        Some(i) => (&rest[..i], &rest[i..]),
        None => (rest, "/"),
    };
    let path = path.split('#').next().unwrap_or("/");
    let path = if path.starts_with('?') { format!("/{path}") } else { path.to_string() };
    let (host, port) = match hostport.rsplit_once(':') {
        Some((h, p)) => (h, p.parse().ok()?),
        None => (hostport, 443),
    };
    if host.is_empty() || host.contains('@') {
        return None;
    }
    Some((host.to_ascii_lowercase(), if path.is_empty() { "/".into() } else { path }, port))
}

/// Percent-encoding of a URL part (query value or path segment): only unreserved characters stay.
pub fn enc(s: &str) -> String {
    s.bytes().map(|b| if b.is_ascii_alphanumeric() || b"-_.~".contains(&b) { (b as char).to_string() } else { format!("%{b:02X}") }).collect()
}

fn open(url: &str, headers: &[(&str, &str)]) -> Result<Req, String> {
    open_with("GET", url, headers, &[])
}

fn open_with(method: &str, url: &str, headers: &[(&str, &str)], body: &[u8]) -> Result<Req, String> {
    let (host, path, port) = split_url(url).ok_or_else(|| format!("bad URL: {url}"))?;
    unsafe {
        let agent = HSTRING::from(format!("Komora/{}", env!("CARGO_PKG_VERSION")));
        let ses = Handle(WinHttpOpen(&agent, WINHTTP_ACCESS_TYPE_AUTOMATIC_PROXY, PCWSTR::null(), PCWSTR::null(), 0));
        if ses.0.is_null() {
            return Err("WinHttpOpen".into());
        }
        // a large upload (VirusTotal) needs time to send
        let send = if body.len() > 1 << 20 { 600_000 } else { 10_000 };
        let _ = WinHttpSetTimeouts(ses.0, 8000, 8000, send, if body.len() > 1 << 20 { 120_000 } else { 20_000 });
        let con = Handle(WinHttpConnect(ses.0, &HSTRING::from(host.as_str()), port, 0));
        if con.0.is_null() {
            return Err(format!("cannot connect to {host}"));
        }
        // redirects (release files go to another host) are followed by WinHTTP itself
        let req = Handle(WinHttpOpenRequest(con.0, &HSTRING::from(method), &HSTRING::from(path.as_str()), PCWSTR::null(), PCWSTR::null(), std::ptr::null(), WINHTTP_FLAG_SECURE));
        if req.0.is_null() {
            return Err("WinHttpOpenRequest".into());
        }
        let hdr: String = headers.iter().map(|(k, v)| format!("{k}: {v}\r\n")).collect();
        let hdr: Vec<u16> = hdr.encode_utf16().collect();
        let opt = if body.is_empty() { None } else { Some(body.as_ptr() as *const c_void) };
        WinHttpSendRequest(req.0, if hdr.is_empty() { None } else { Some(&hdr) }, opt, body.len() as u32, body.len() as u32, 0)
            .and_then(|_| WinHttpReceiveResponse(req.0, std::ptr::null_mut()))
            .map_err(|e| e.to_string())?;
        let (mut code, mut len) = (0u32, 4u32);
        WinHttpQueryHeaders(req.0, WINHTTP_QUERY_STATUS_CODE | WINHTTP_QUERY_FLAG_NUMBER, PCWSTR::null(), Some(&mut code as *mut u32 as *mut c_void), &mut len, std::ptr::null_mut())
            .map_err(|e| e.to_string())?;
        Ok(Req { _ses: ses, _con: con, req, status: code })
    }
}

impl Req {
    fn header(&self, name: &str) -> Option<String> {
        let n = crate::util::wide(name);
        let mut buf = [0u16; 512];
        let mut len = (buf.len() * 2) as u32;
        unsafe { WinHttpQueryHeaders(self.req.0, WINHTTP_QUERY_CUSTOM, PCWSTR(n.as_ptr()), Some(buf.as_mut_ptr() as *mut c_void), &mut len, std::ptr::null_mut()) }.ok()?;
        Some(String::from_utf16_lossy(&buf[..(len as usize / 2).min(buf.len())]))
    }

    fn read(&self, buf: &mut [u8]) -> Result<usize, String> {
        let mut n = 0u32;
        unsafe { WinHttpReadData(self.req.0, buf.as_mut_ptr() as *mut c_void, buf.len() as u32, &mut n) }.map_err(|e| e.to_string())?;
        Ok(n as usize)
    }

    fn body(&self, max: usize) -> Result<Vec<u8>, String> {
        let mut body = Vec::new();
        let mut buf = vec![0u8; 64 * 1024];
        loop {
            let n = self.read(&mut buf)?;
            if n == 0 {
                return Ok(body);
            }
            body.extend_from_slice(&buf[..n]);
            if body.len() > max {
                return Err("answer too large".into());
            }
        }
    }
}

/// (any thread; blocks) A GET with the given headers; the body is read for any status.
pub fn get(url: &str, headers: &[(&str, &str)], max: usize) -> Result<Response, String> {
    let r = open(url, headers)?;
    let etag = r.header("ETag").unwrap_or_default();
    let body = if r.status == 304 { Vec::new() } else { r.body(max)? };
    Ok(Response { status: r.status, etag, body })
}

/// (any thread; blocks) A POST with the given headers and body; the answer is read for any status.
pub fn post(url: &str, headers: &[(&str, &str)], body: &[u8], max: usize) -> Result<Response, String> {
    let r = open_with("POST", url, headers, body)?;
    let body = r.body(max)?;
    Ok(Response { status: r.status, etag: String::new(), body })
}

/// (any thread; blocks) A GitHub API request: token when set, conditional with `etag`, rate limit noted.
pub fn github(path: &str, accept: &str, etag: &str) -> Result<Response, String> {
    github_send("GET", path, accept, etag, &[])
}

/// (any thread; blocks) A GitHub API request with a method and a JSON body (POST, PATCH).
pub fn github_send(method: &str, path: &str, accept: &str, etag: &str, body: &[u8]) -> Result<Response, String> {
    let token = crate::config::token();
    let auth = format!("Bearer {}", token.trim());
    let mut h: Vec<(&str, &str)> = vec![("Accept", accept), ("X-GitHub-Api-Version", "2022-11-28")];
    if !token.trim().is_empty() {
        h.push(("Authorization", &auth));
    }
    if !etag.is_empty() {
        h.push(("If-None-Match", etag));
    }
    if !body.is_empty() {
        h.push(("Content-Type", "application/json"));
    }
    let r = open_with(method, &format!("https://api.github.com{path}"), &h, body)?;
    let num = |n: &str| r.header(n).and_then(|v| v.trim().parse::<i64>().ok());
    if let (Some(remaining), Some(limit)) = (num("X-RateLimit-Remaining"), num("X-RateLimit-Limit")) {
        *RATE.lock().unwrap() = Some(Rate { remaining, limit, reset: num("X-RateLimit-Reset").unwrap_or(0) });
    }
    let etag = r.header("ETag").unwrap_or_default();
    let body = if r.status == 304 { Vec::new() } else { r.body(8 << 20)? };
    Ok(Response { status: r.status, etag, body })
}

/// (any thread; blocks) Downloads `url` into `dest` (written as dest.part, renamed when complete);
/// `progress` gets (bytes so far, total or 0). At most `max` bytes.
pub fn download(url: &str, dest: &Path, max: u64, mut progress: impl FnMut(u64, u64)) -> Result<(), String> {
    let r = open(url, &[("Accept", "application/octet-stream")])?;
    if r.status != 200 {
        return Err(format!("HTTP {}", r.status));
    }
    let total = r.header("Content-Length").and_then(|v| v.trim().parse::<u64>().ok()).unwrap_or(0);
    if total > max {
        return Err("file too large".into());
    }
    let part = dest.with_extension("part");
    let mut f = std::fs::File::create(&part).map_err(|e| format!("{}: {e}", part.display()))?;
    let mut buf = vec![0u8; 256 * 1024];
    let mut got = 0u64;
    let mut last = std::time::Instant::now();
    loop {
        let n = match r.read(&mut buf) {
            Ok(n) => n,
            Err(e) => {
                drop(f);
                let _ = std::fs::remove_file(&part);
                return Err(e);
            }
        };
        if n == 0 {
            break;
        }
        got += n as u64;
        if got > max || f.write_all(&buf[..n]).is_err() {
            drop(f);
            let _ = std::fs::remove_file(&part);
            return Err(if got > max { "file too large".into() } else { "cannot write the file".into() });
        }
        if last.elapsed().as_millis() > 150 {
            progress(got, total);
            last = std::time::Instant::now();
        }
    }
    drop(f);
    if total != 0 && got != total {
        let _ = std::fs::remove_file(&part);
        return Err("download incomplete".into());
    }
    progress(got, total.max(got));
    let _ = std::fs::remove_file(dest);
    std::fs::rename(&part, dest).map_err(|e| e.to_string())
}

#[cfg(test)]
mod tests {
    use super::{enc, split_url};

    #[test]
    fn encoding() {
        assert_eq!(enc("tray stars:>=100"), "tray%20stars%3A%3E%3D100");
        assert_eq!(enc("утиліта"), "%D1%83%D1%82%D0%B8%D0%BB%D1%96%D1%82%D0%B0");
    }

    #[test]
    fn urls() {
        assert_eq!(split_url("https://github.com/a/b"), Some(("github.com".into(), "/a/b".into(), 443)));
        assert_eq!(split_url("http://Example.com"), Some(("example.com".into(), "/".into(), 443)));
        assert_eq!(split_url("https://h:8443/x?y=1#z"), Some(("h".into(), "/x?y=1".into(), 8443)));
        assert_eq!(split_url("https://h?q"), Some(("h".into(), "/?q".into(), 443)));
        assert_eq!(split_url("ftp://h/x"), None);
        assert_eq!(split_url("https://user@h/x"), None);
    }
}
