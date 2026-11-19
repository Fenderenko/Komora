//! DualSense, DualSense Edge and DualShock 4: their charge from the controller's own input reports, which
//! Windows is not told. On a cable the full report always carries it; over Bluetooth only the extended
//! report does (0x31 / 0x11), which Steam and similar tools switch on. Komora does not switch it itself:
//! that would stop the simple report DirectInput games read, so a controller still in the simple mode is
//! left out.

use std::time::{Duration, Instant};

use windows::{
    Win32::Devices::{
        DeviceAndDriverInstallation::{CM_GET_DEVICE_INTERFACE_LIST_PRESENT, CM_Get_Device_Interface_List_SizeW, CM_Get_Device_Interface_ListW, CR_SUCCESS},
        HumanInterfaceDevice::{HIDD_ATTRIBUTES, HidD_GetAttributes, HidD_GetHidGuid},
    },
    core::PCWSTR,
};

use crate::{btbatt::Dev, logi::Hid};

const SONY: u16 = 0x054C;

/// (name, is a DualSense) of the controllers read.
fn model(pid: u16) -> Option<(&'static str, bool)> {
    match pid {
        0x0CE6 => Some(("DualSense Wireless Controller", true)),
        0x0DF2 => Some(("DualSense Edge", true)),
        0x05C4 | 0x09CC => Some(("DualShock 4", false)),
        _ => None,
    }
}

/// DualSense status byte: low nibble — level 0..10, high nibble — 0 discharging, 1 charging, 2 full.
pub fn dualsense(status: u8) -> (u8, bool) {
    let (level, state) = (status & 0x0F, status >> 4);
    if state == 2 {
        return (100, false);
    }
    ((level as u32 * 10 + 5).min(100) as u8, state == 1)
}

/// DualShock 4 status byte: low nibble — level, bit 4 — on a cable (then 11 means full).
pub fn dualshock(b: u8) -> (u8, bool) {
    let (level, cable) = (b & 0x0F, b & 0x10 != 0);
    let pct = if level >= 10 { 100 } else { level * 10 + 5 };
    (pct, cable && level < 11)
}

fn sony_paths() -> Vec<String> {
    let guid = unsafe { HidD_GetHidGuid() };
    let mut len = 0u32;
    if unsafe { CM_Get_Device_Interface_List_SizeW(&mut len, &guid, PCWSTR::null(), CM_GET_DEVICE_INTERFACE_LIST_PRESENT) } != CR_SUCCESS || len == 0 {
        return Vec::new();
    }
    let mut buf = vec![0u16; len as usize];
    if unsafe { CM_Get_Device_Interface_ListW(&guid, PCWSTR::null(), &mut buf, CM_GET_DEVICE_INTERFACE_LIST_PRESENT) } != CR_SUCCESS {
        return Vec::new();
    }
    buf.split(|&c| c == 0).filter(|s| !s.is_empty()).map(String::from_utf16_lossy).filter(|p| p.to_ascii_lowercase().contains("054c")).collect()
}

/// (worker thread; blocks up to ~150 ms a controller) Sony controllers whose report tells the charge now.
pub fn scan() -> Vec<Dev> {
    let mut out = Vec::new();
    for path in sony_paths() {
        let Some(h) = Hid::open(&path) else { continue };
        let mut a = HIDD_ATTRIBUTES { Size: std::mem::size_of::<HIDD_ATTRIBUTES>() as u32, ..Default::default() };
        if !unsafe { HidD_GetAttributes(h.handle(), &mut a) } || a.VendorID != SONY {
            continue;
        }
        let Some((name, ds5)) = model(a.ProductID) else { continue };
        let bt = path.to_ascii_lowercase().contains("{00001124");
        let until = Instant::now() + Duration::from_millis(150);
        let mut b = [0u8; 128];
        let mut got = None;
        while got.is_none() {
            let left = until.saturating_duration_since(Instant::now()).as_millis() as u32;
            if left == 0 {
                break;
            }
            let Some(n) = h.read(&mut b, left) else { break };
            got = match (ds5, bt, b[0]) {
                (true, false, 0x01) if n >= 64 => Some(dualsense(b[53])),
                (true, true, 0x31) if n >= 78 => Some(dualsense(b[54])),
                (false, false, 0x01) if n >= 64 => Some(dualshock(b[30])),
                (false, true, 0x11) if n >= 78 => Some(dualshock(b[32])),
                _ => None,
            };
        }
        if let Some((pct, charging)) = got {
            out.push(Dev { id: format!("sony:{:04x}:{}", a.ProductID, if bt { "bt" } else { "usb" }), name: name.to_string(), kind: "pad", pct, charging });
        }
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn status_bytes() {
        assert_eq!(dualsense(0x06), (65, false));
        assert_eq!(dualsense(0x13), (35, true));
        assert_eq!(dualsense(0x2A), (100, false));
        assert_eq!(dualshock(0x08), (85, false));
        assert_eq!(dualshock(0x1B), (100, false));
        assert_eq!(dualshock(0x15), (55, true));
    }

    /// This PC's Sony controllers: `cargo test -- --ignored live_sony --nocapture`.
    #[test]
    #[ignore]
    fn live_sony() {
        let t = Instant::now();
        for d in scan() {
            println!("{d:?}");
        }
        println!("read {:?}", t.elapsed());
    }
}
