//! Sync through the user's Dropbox: the app folder (Apps/Komora) holds komora-sync.json. Sign-in is OAuth
//! with PKCE and no redirect: Dropbox shows a code that the user pastes into Komora. Only the refresh token
//! is kept (DPAPI, config dbxEnc); access tokens live in memory.

use std::sync::Mutex;

use serde_json::Value;
use windows::Win32::Security::Cryptography::{
    BCRYPT_HASH_HANDLE, BCRYPT_SHA256_ALG_HANDLE, BCRYPT_USE_SYSTEM_PREFERRED_RNG, BCryptCreateHash, BCryptDestroyHash, BCryptFinishHash, BCryptGenRandom, BCryptHashData,
};

use crate::{config, net, secret, util};

/// Key of the Dropbox app (scoped to its app folder; PKCE needs no secret). "" — not registered yet.
pub const APP_KEY: &str = "";
const FILE: &str = "/komora-sync.json";

static VERIFIER: Mutex<String> = Mutex::new(String::new());
/// (access token, unix time it expires)
static ACCESS: Mutex<(String, i64)> = Mutex::new((String::new(), 0));

pub fn available() -> bool {
    !APP_KEY.is_empty()
}

pub fn connected() -> bool {
    !config::get().dbx_enc.is_empty()
}

fn b64url(b: &[u8]) -> String {
    const A: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    let mut out = String::new();
    for c in b.chunks(3) {
        let n = (c[0] as u32) << 16 | (*c.get(1).unwrap_or(&0) as u32) << 8 | *c.get(2).unwrap_or(&0) as u32;
        for i in 0..=c.len() {
            out.push(A[(n >> (18 - 6 * i) & 63) as usize] as char);
        }
    }
    out
}

fn sha256(b: &[u8]) -> [u8; 32] {
    let mut out = [0u8; 32];
    let mut h = BCRYPT_HASH_HANDLE::default();
    unsafe {
        if BCryptCreateHash(BCRYPT_SHA256_ALG_HANDLE, &mut h, None, None, 0).is_ok() {
            let _ = BCryptHashData(h, b, 0);
            let _ = BCryptFinishHash(h, &mut out, 0);
            let _ = BCryptDestroyHash(h);
        }
    }
    out
}

/// The page of Dropbox where the user allows Komora and gets the code.
pub fn begin() -> Result<String, String> {
    if !available() {
        return Err("Dropbox is not set up in this build".into());
    }
    let mut r = [0u8; 48];
    unsafe { BCryptGenRandom(None, &mut r, BCRYPT_USE_SYSTEM_PREFERRED_RNG) }.ok().map_err(|e| e.to_string())?;
    let verifier = b64url(&r);
    let challenge = b64url(&sha256(verifier.as_bytes()));
    *VERIFIER.lock().unwrap() = verifier;
    Ok(format!("https://www.dropbox.com/oauth2/authorize?client_id={APP_KEY}&response_type=code&token_access_type=offline&code_challenge={challenge}&code_challenge_method=S256"))
}

fn token_call(form: &str) -> Result<Value, String> {
    let r = net::post("https://api.dropboxapi.com/oauth2/token", &[("Content-Type", "application/x-www-form-urlencoded")], form.as_bytes(), 1 << 20)?;
    let v: Value = serde_json::from_slice(&r.body).map_err(|e| e.to_string())?;
    if r.status != 200 {
        return Err(format!("Dropbox: {}", v.get("error_description").and_then(Value::as_str).unwrap_or("sign-in failed")));
    }
    Ok(v)
}

fn keep_access(v: &Value) -> Option<String> {
    let t = v.get("access_token")?.as_str()?.to_string();
    let exp = util::unix() + v.get("expires_in").and_then(Value::as_i64).unwrap_or(14400) - 120;
    *ACCESS.lock().unwrap() = (t.clone(), exp);
    Some(t)
}

/// The pasted code becomes a refresh token.
pub fn finish(code: &str) -> Result<(), String> {
    let verifier = std::mem::take(&mut *VERIFIER.lock().unwrap());
    if verifier.is_empty() {
        return Err("open the Dropbox page first".into());
    }
    let v = token_call(&format!("code={}&grant_type=authorization_code&code_verifier={verifier}&client_id={APP_KEY}", net::enc(code.trim())))?;
    let refresh = v.get("refresh_token").and_then(Value::as_str).ok_or("Dropbox gave no refresh token")?;
    let enc = secret::protect(refresh).ok_or("cannot keep the Dropbox token")?;
    config::update(|c| c.dbx_enc = enc);
    keep_access(&v);
    Ok(())
}

pub fn disconnect() {
    config::update(|c| {
        c.dbx_enc.clear();
        c.sync_dbx = false;
    });
    *ACCESS.lock().unwrap() = (String::new(), 0);
}

fn access() -> Result<String, String> {
    {
        let a = ACCESS.lock().unwrap();
        if !a.0.is_empty() && a.1 > util::unix() {
            return Ok(a.0.clone());
        }
    }
    let refresh = secret::unprotect(&config::get().dbx_enc).filter(|s| !s.is_empty()).ok_or("sign in to Dropbox again")?;
    let v = token_call(&format!("grant_type=refresh_token&refresh_token={}&client_id={APP_KEY}", net::enc(&refresh)))?;
    keep_access(&v).ok_or_else(|| "Dropbox gave no access token".to_string())
}

/// The sync file of the app folder; None — not written yet.
pub fn read() -> Result<Option<String>, String> {
    let auth = format!("Bearer {}", access()?);
    let arg = format!(r#"{{"path":"{FILE}"}}"#);
    let r = net::post("https://content.dropboxapi.com/2/files/download", &[("Authorization", &auth), ("Dropbox-API-Arg", &arg)], &[], 32 << 20)?;
    match r.status {
        200 => Ok(Some(String::from_utf8_lossy(&r.body).into_owned())),
        409 => Ok(None),
        401 => Err("sign in to Dropbox again".into()),
        s => Err(format!("Dropbox answered HTTP {s}")),
    }
}

pub fn write(text: &str) -> Result<(), String> {
    let auth = format!("Bearer {}", access()?);
    let arg = format!(r#"{{"path":"{FILE}","mode":"overwrite","mute":true}}"#);
    let r = net::post("https://content.dropboxapi.com/2/files/upload", &[("Authorization", &auth), ("Dropbox-API-Arg", &arg), ("Content-Type", "application/octet-stream")], text.as_bytes(), 1 << 20)?;
    match r.status {
        200 => Ok(()),
        401 => Err("sign in to Dropbox again".into()),
        s => Err(format!("Dropbox answered HTTP {s}")),
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn pkce_parts() {
        // RFC 7636, appendix B
        let v = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
        assert_eq!(super::b64url(&super::sha256(v.as_bytes())), "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM");
        assert_eq!(super::b64url(b"ab"), "YWI");
    }
}
