//! Mice on Compx receivers (ATK, VXE and other brands of the same maker; vendor 0x3554): the charge through the
//! receiver's vendor collection (usage page 0xFF02, usage 2), as the makers' own web driver asks it. A request is
//! report 0x08 with a 16-byte command: id, status, address (2), length, data (10), checksum. Command 0x03 tells
//! whether the mouse is on line, 0x04 its battery: percent, charging, millivolts. Protocol notes:
//! github.com/S1berla/vxe-r1-pro-max-battery (MIT), checked there on the receiver 3554:F58A.

use std::time::{Duration, Instant};

use windows::{
    Win32::Devices::{
        DeviceAndDriverInstallation::{CM_GET_DEVICE_INTERFACE_LIST_PRESENT, CM_Get_Device_Interface_List_SizeW, CM_Get_Device_Interface_ListW, CR_SUCCESS},
        HumanInterfaceDevice::{HIDD_ATTRIBUTES, HIDP_CAPS, HidD_FreePreparsedData, HidD_GetAttributes, HidD_GetHidGuid, HidD_GetPreparsedData, HidD_GetProductString, HidP_GetCaps, PHIDP_PREPARSED_DATA},
    },
    core::PCWSTR,
};

use crate::{btbatt::Dev, logi::Hid};

const COMPX: u16 = 0x3554;
const REPORT: u8 = 0x08;

/// A request: report id, command and its data, the checksum last (85 − the sum of everything before it).
pub fn frame(cmd: u8, data: &[u8]) -> [u8; 17] {
    let mut f = [0u8; 17];
    f[0] = REPORT;
    f[1] = cmd;
    f[5] = data.len().min(10) as u8;
    f[6..6 + data.len().min(10)].copy_from_slice(&data[..data.len().min(10)]);
    let sum = f[..16].iter().fold(0u32, |s, &b| s + b as u32);
    f[16] = 85u8.wrapping_sub((sum & 0xFF) as u8);
    f
}

/// (percent, charging) from an answer to 0x04: status 0, then the data from byte 6.
pub fn parse_battery(b: &[u8]) -> Option<(u8, bool)> {
    (b.len() >= 10 && b[0] == REPORT && b[1] == 0x04 && b[2] == 0 && b[6] <= 100).then(|| (b[6], b[7] == 1))
}

fn paths() -> Vec<String> {
    let guid = unsafe { HidD_GetHidGuid() };
    let mut len = 0u32;
    if unsafe { CM_Get_Device_Interface_List_SizeW(&mut len, &guid, PCWSTR::null(), CM_GET_DEVICE_INTERFACE_LIST_PRESENT) } != CR_SUCCESS || len == 0 {
        return Vec::new();
    }
    let mut buf = vec![0u16; len as usize];
    if unsafe { CM_Get_Device_Interface_ListW(&guid, PCWSTR::null(), &mut buf, CM_GET_DEVICE_INTERFACE_LIST_PRESENT) } != CR_SUCCESS {
        return Vec::new();
    }
    buf.split(|&c| c == 0).filter(|s| !s.is_empty()).map(String::from_utf16_lossy).filter(|p| p.to_ascii_lowercase().contains("vid_3554")).collect()
}

/// The receiver's product name when this interface is its 0xFF02 / 2 collection.
fn command_collection(h: &Hid) -> Option<String> {
    unsafe {
        let mut a = HIDD_ATTRIBUTES { Size: std::mem::size_of::<HIDD_ATTRIBUTES>() as u32, ..Default::default() };
        if !HidD_GetAttributes(h.handle(), &mut a) || a.VendorID != COMPX {
            return None;
        }
        let mut pp = PHIDP_PREPARSED_DATA::default();
        if !HidD_GetPreparsedData(h.handle(), &mut pp) {
            return None;
        }
        let mut caps = HIDP_CAPS::default();
        let ok = HidP_GetCaps(pp, &mut caps).is_ok() && caps.UsagePage == 0xFF02 && caps.Usage == 2;
        let _ = HidD_FreePreparsedData(pp);
        if !ok {
            return None;
        }
        let mut name = [0u16; 128];
        let got = HidD_GetProductString(h.handle(), name.as_mut_ptr() as *mut _, (name.len() * 2) as u32);
        let end = name.iter().position(|&c| c == 0).unwrap_or(0);
        Some(if got { String::from_utf16_lossy(&name[..end]) } else { String::new() })
    }
}

/// "VXE NordicMouse 1K Dongle" → the mouse behind it, as people know these mice.
fn mouse_name(product: &str) -> String {
    let p = product.replace("Dongle", "").replace("dongle", "");
    let p = p.split_whitespace().filter(|w| !matches!(w.to_ascii_uppercase().as_str(), "1K" | "2K" | "4K" | "8K" | "NORDICMOUSE" | "RECEIVER")).collect::<Vec<_>>().join(" ");
    if p.is_empty() || p.eq_ignore_ascii_case("VXE") { "ATK / VXE".to_string() } else { p }
}

/// One command and its answer (the receiver echoes the command id), within 400 ms.
fn ask(h: &Hid, cmd: u8, data: &[u8]) -> Option<[u8; 32]> {
    if !h.write(&frame(cmd, data)) {
        return None;
    }
    let until = Instant::now() + Duration::from_millis(400);
    let mut b = [0u8; 32];
    loop {
        let left = until.saturating_duration_since(Instant::now()).as_millis() as u32;
        if left == 0 {
            return None;
        }
        let n = h.read(&mut b, left)?;
        if n >= 17 && b[0] == REPORT && b[1] == cmd {
            return Some(b);
        }
    }
}

/// (worker thread; ~10 ms a receiver, up to a second when the mouse sleeps) Compx mice that tell their charge now.
pub fn scan() -> Vec<Dev> {
    let mut out = Vec::new();
    for path in paths() {
        let Some(h) = Hid::open(&path) else { continue };
        let Some(product) = command_collection(&h) else { continue };
        // a mouse that is off or asleep: the receiver says so, or nothing answers
        if ask(&h, 0x03, &[]).is_some_and(|b| b[5] >= 1 && b[6] == 0) {
            continue;
        }
        let bat = ask(&h, 0x04, &[]).and_then(|b| parse_battery(&b)).or_else(|| {
            // some receivers answer the battery only after the session read the makers' driver starts with
            ask(&h, 0x01, &[1, 2, 3, 4, 5, 6, 7, 8])?;
            ask(&h, 0x04, &[]).and_then(|b| parse_battery(&b))
        });
        if let Some((pct, charging)) = bat {
            let name = mouse_name(&product);
            if !out.iter().any(|d: &Dev| d.name == name) {
                out.push(Dev { id: format!("compx:{name}"), name, kind: "mouse", pct, charging });
            }
        }
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn frames_and_answers() {
        // the requests the makers' driver sends (from the protocol notes)
        assert_eq!(frame(0x04, &[])[16], 0x49);
        assert_eq!(frame(0x03, &[])[16], 0x4A);
        assert_eq!(frame(0x01, &[1, 2, 3, 4, 5, 6, 7, 8])[16], 0x20);
        let a = [0x08, 0x04, 0, 0, 0, 0x02, 0x5F, 0x00, 0x10, 0x1A, 0, 0, 0, 0, 0, 0, 0xBA];
        assert_eq!(parse_battery(&a), Some((95, false)));
        assert_eq!(mouse_name("VXE NordicMouse 1K Dongle"), "ATK / VXE");
    }

    /// This PC's Compx mice: `cargo test -- --ignored live_compx --nocapture`.
    #[test]
    #[ignore]
    fn live_compx() {
        let t = Instant::now();
        for d in scan() {
            println!("{d:?}");
        }
        println!("read {:?}", t.elapsed());
    }
}
