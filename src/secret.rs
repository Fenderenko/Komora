//! Secrets in config.json encrypted with DPAPI: only this Windows user can read them back.

use windows::Win32::{
    Foundation::{HLOCAL, LocalFree},
    Security::Cryptography::{CRYPT_INTEGER_BLOB, CRYPTPROTECT_UI_FORBIDDEN, CryptProtectData, CryptUnprotectData},
};

const B64: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

pub fn b64(data: &[u8]) -> String {
    let mut s = String::with_capacity(data.len().div_ceil(3) * 4);
    for c in data.chunks(3) {
        let n = (c[0] as u32) << 16 | (*c.get(1).unwrap_or(&0) as u32) << 8 | *c.get(2).unwrap_or(&0) as u32;
        for i in 0..4 {
            if i <= c.len() {
                s.push(B64[(n >> (18 - 6 * i) & 63) as usize] as char);
            } else {
                s.push('=');
            }
        }
    }
    s
}

pub fn unb64(s: &str) -> Option<Vec<u8>> {
    let mut out = Vec::new();
    let mut acc = 0u32;
    let mut bits = 0;
    for ch in s.bytes().filter(|c| !c.is_ascii_whitespace() && *c != b'=') {
        let v = B64.iter().position(|&b| b == ch)? as u32;
        acc = acc << 6 | v;
        bits += 6;
        if bits >= 8 {
            bits -= 8;
            out.push((acc >> bits) as u8);
            acc &= (1 << bits) - 1;
        }
    }
    Some(out)
}

fn blob_out(b: &CRYPT_INTEGER_BLOB) -> Vec<u8> {
    let v = unsafe { std::slice::from_raw_parts(b.pbData, b.cbData as usize) }.to_vec();
    unsafe {
        let _ = LocalFree(Some(HLOCAL(b.pbData as *mut _)));
    }
    v
}

/// Encrypts for this Windows user; base64 text.
pub fn protect(plain: &str) -> Option<String> {
    let mut data = plain.as_bytes().to_vec();
    let inp = CRYPT_INTEGER_BLOB { cbData: data.len() as u32, pbData: data.as_mut_ptr() };
    let mut out = CRYPT_INTEGER_BLOB::default();
    unsafe { CryptProtectData(&inp, windows::core::w!("Komora"), None, None, None, CRYPTPROTECT_UI_FORBIDDEN, &mut out) }.ok()?;
    Some(b64(&blob_out(&out)))
}

pub fn unprotect(enc: &str) -> Option<String> {
    let mut data = unb64(enc)?;
    let inp = CRYPT_INTEGER_BLOB { cbData: data.len() as u32, pbData: data.as_mut_ptr() };
    let mut out = CRYPT_INTEGER_BLOB::default();
    unsafe { CryptUnprotectData(&inp, None, None, None, None, CRYPTPROTECT_UI_FORBIDDEN, &mut out) }.ok()?;
    String::from_utf8(blob_out(&out)).ok()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn base64() {
        for s in ["", "f", "fo", "foo", "foob", "fooba", "foobar"] {
            assert_eq!(unb64(&b64(s.as_bytes())).unwrap(), s.as_bytes());
        }
        assert_eq!(b64(b"foobar"), "Zm9vYmFy");
        assert_eq!(b64(b"fo"), "Zm8=");
    }

    #[test]
    fn dpapi_round_trip() {
        let e = protect("github_pat_test").unwrap();
        assert!(!e.contains("github_pat"));
        assert_eq!(unprotect(&e).as_deref(), Some("github_pat_test"));
    }
}
