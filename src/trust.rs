//! Authenticode signature of a downloaded program (WinVerifyTrust): signed and trusted, unsigned, or
//! a broken signature (the file was changed after signing).

use std::{ffi::c_void, path::Path};

use windows::{
    Win32::{
        Foundation::HWND,
        Security::{
            Cryptography::{CERT_NAME_SIMPLE_DISPLAY_TYPE, CertGetNameStringW},
            WinTrust::{
                WINTRUST_ACTION_GENERIC_VERIFY_V2, WINTRUST_DATA, WINTRUST_DATA_0, WINTRUST_FILE_INFO, WTD_CHOICE_FILE, WTD_REVOKE_NONE, WTD_STATEACTION_CLOSE, WTD_STATEACTION_VERIFY, WTD_UI_NONE,
                WTHelperGetProvSignerFromChain, WTHelperProvDataFromStateData, WinVerifyTrust,
            },
        },
    },
    core::PCWSTR,
};

/// ("trusted" | "unsigned" | "bad", signer name).
pub fn check(path: &Path) -> (String, String) {
    let w = crate::util::wide(&path.display().to_string());
    let mut fi = WINTRUST_FILE_INFO { cbStruct: std::mem::size_of::<WINTRUST_FILE_INFO>() as u32, pcwszFilePath: PCWSTR(w.as_ptr()), ..Default::default() };
    let mut wd = WINTRUST_DATA {
        cbStruct: std::mem::size_of::<WINTRUST_DATA>() as u32,
        dwUIChoice: WTD_UI_NONE,
        fdwRevocationChecks: WTD_REVOKE_NONE,
        dwUnionChoice: WTD_CHOICE_FILE,
        Anonymous: WINTRUST_DATA_0 { pFile: &mut fi },
        dwStateAction: WTD_STATEACTION_VERIFY,
        ..Default::default()
    };
    let mut action = WINTRUST_ACTION_GENERIC_VERIFY_V2;
    let r = unsafe { WinVerifyTrust(HWND::default(), &mut action, &mut wd as *mut _ as *mut c_void) } as u32;
    let mut signer = String::new();
    if r == 0 {
        unsafe {
            let prov = WTHelperProvDataFromStateData(wd.hWVTStateData);
            if !prov.is_null() {
                let sg = WTHelperGetProvSignerFromChain(prov, 0, false, 0);
                if !sg.is_null() && (*sg).csCertChain > 0 && !(*sg).pasCertChain.is_null() {
                    let cert = (*(*sg).pasCertChain).pCert;
                    if !cert.is_null() {
                        let mut buf = [0u16; 256];
                        let n = CertGetNameStringW(cert, CERT_NAME_SIMPLE_DISPLAY_TYPE, 0, None, Some(&mut buf));
                        signer = String::from_utf16_lossy(&buf[..(n as usize).saturating_sub(1).min(buf.len())]);
                    }
                }
            }
        }
    }
    wd.dwStateAction = WTD_STATEACTION_CLOSE;
    unsafe {
        WinVerifyTrust(HWND::default(), &mut action, &mut wd as *mut _ as *mut c_void);
    }
    // TRUST_E_NOSIGNATURE, TRUST_E_SUBJECT_FORM_UNKNOWN, TRUST_E_PROVIDER_UNKNOWN: nothing signed
    let status = match r {
        0 => "trusted",
        0x800B_0100 | 0x800B_0003 | 0x800B_0001 => "unsigned",
        _ => "bad",
    };
    (status.into(), signer)
}

#[cfg(test)]
mod tests {
    /// A file with its own signature (Edge): cargo test -- --ignored live_signed --nocapture
    #[test]
    #[ignore]
    fn live_signed() {
        let p = std::path::Path::new(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe");
        let (s, who) = super::check(p);
        println!("{s} {who}");
        assert_eq!(s, "trusted");
        assert!(who.contains("Microsoft"));
    }

    #[test]
    fn unsigned_file() {
        let p = std::env::temp_dir().join("komora-trust-test.exe");
        std::fs::write(&p, b"MZ not really").unwrap();
        assert_ne!(super::check(&p).0, "trusted");
        let _ = std::fs::remove_file(&p);
    }
}
