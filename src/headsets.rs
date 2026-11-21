//! SteelSeries Arctis headsets on their receivers: the charge by the status request of each model (the table in
//! headsets_table.rs, generated from Arcmix's device descriptions, which come from Linux-Arctis-Manager). Only
//! reading: the request is the same status query the makers' own software sends, nothing is changed on the headset.

use std::time::{Duration, Instant};

use windows::{
    Win32::Devices::{
        DeviceAndDriverInstallation::{CM_GET_DEVICE_INTERFACE_LIST_PRESENT, CM_Get_Device_Interface_List_SizeW, CM_Get_Device_Interface_ListW, CR_SUCCESS},
        HumanInterfaceDevice::{HIDD_ATTRIBUTES, HIDP_CAPS, HidD_FreePreparsedData, HidD_GetAttributes, HidD_GetHidGuid, HidD_GetPreparsedData, HidP_GetCaps, PHIDP_PREPARSED_DATA},
    },
    core::PCWSTR,
};

use crate::{btbatt::Dev, logi::Hid};

/// A headset model: where to ask and how to read the answer (byte offsets count the report id at 0).
pub struct Hs {
    pub vid: u16,
    pub pids: &'static [(u16, &'static str)],
    /// the HID interface (MI_xx) and the collection (usage page, usage) of the requests
    pub iface: u8,
    pub page: u16,
    pub usage: u16,
    pub req: &'static [u8],
    /// bytes the answer must have (the echoed report and command)
    pub expect: &'static [(usize, u8)],
    pub batt: usize,
    /// the level's range; with `levels`, a step mapped to percent
    pub range: (u8, u8),
    pub levels: Option<&'static [(u8, u8)]>,
    /// byte and the values meaning «charging»
    pub charging: Option<(usize, &'static [u8])>,
    /// byte and the values meaning «the headset is connected»
    pub connected: Option<(usize, &'static [u8])>,
}

#[path = "headsets_table.rs"]
mod table;

/// (percent, charging) from an answer, None — not this request's answer or no headset behind the receiver.
pub fn parse(h: &Hs, b: &[u8]) -> Option<(u8, bool)> {
    if h.expect.iter().any(|&(at, v)| b.get(at) != Some(&v)) {
        return None;
    }
    if let Some((at, ok)) = h.connected
        && !b.get(at).is_some_and(|v| ok.contains(v))
    {
        return None;
    }
    // the 0xB0 status before the headset's data arrives: ff ff where the dial is, the level reads 0 (Arcmix)
    if h.req.get(1) == Some(&0xB0) && b.get(5) == Some(&0xFF) && b.get(6) == Some(&0xFF) {
        return None;
    }
    let raw = *b.get(h.batt)?;
    let pct = match h.levels {
        Some(map) => map.iter().find(|(k, _)| *k == raw).map(|(_, p)| *p)?,
        None => {
            let (lo, hi) = h.range;
            if raw < lo || raw > hi.max(lo + 1) {
                return None;
            }
            ((raw - lo) as u32 * 100 / (hi.max(lo + 1) - lo) as u32) as u8
        }
    };
    // a model that tells no connection: a level of 0 is the receiver alone
    if h.connected.is_none() && pct == 0 {
        return None;
    }
    let charging = h.charging.is_some_and(|(at, vals)| b.get(at).is_some_and(|v| vals.contains(v)));
    Some((pct, charging))
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
    buf.split(|&c| c == 0).filter(|s| !s.is_empty()).map(String::from_utf16_lossy).collect()
}

/// (output report length) of the interface when it is the model's request collection.
fn collection(h: &Hid, m: &Hs) -> Option<usize> {
    unsafe {
        let mut pp = PHIDP_PREPARSED_DATA::default();
        if !HidD_GetPreparsedData(h.handle(), &mut pp) {
            return None;
        }
        let mut caps = HIDP_CAPS::default();
        let ok = HidP_GetCaps(pp, &mut caps).is_ok();
        let _ = HidD_FreePreparsedData(pp);
        // a description without a collection takes the interface's first one
        (ok && (m.page == 0 || (caps.UsagePage == m.page && caps.Usage == m.usage))).then_some(caps.OutputReportByteLength.max(m.req.len() as u16) as usize)
    }
}

/// (worker thread; ~30 ms a headset) Arctis headsets that tell their charge now.
pub fn scan() -> Vec<Dev> {
    let mut out = Vec::new();
    for path in paths() {
        let low = path.to_ascii_lowercase();
        let Some(m) = table::HEADSETS.iter().find(|m| low.contains(&format!("vid_{:04x}", m.vid)) && low.contains(&format!("&mi_{:02x}", m.iface)) && m.pids.iter().any(|(p, _)| low.contains(&format!("pid_{p:04x}")))) else {
            continue;
        };
        let Some(h) = Hid::open(&path) else { continue };
        let mut a = HIDD_ATTRIBUTES { Size: std::mem::size_of::<HIDD_ATTRIBUTES>() as u32, ..Default::default() };
        if !unsafe { HidD_GetAttributes(h.handle(), &mut a) } {
            continue;
        }
        let Some(name) = m.pids.iter().find(|(p, _)| *p == a.ProductID).map(|(_, n)| *n) else { continue };
        let Some(len) = collection(&h, m) else { continue };
        if out.iter().any(|d: &Dev| d.name == name) {
            continue;
        }
        let mut req = vec![0u8; len];
        req[..m.req.len()].copy_from_slice(m.req);
        if !h.write(&req) {
            continue;
        }
        let until = Instant::now() + Duration::from_millis(400);
        let mut b = [0u8; 128];
        while let Some(n) = h.read(&mut b, until.saturating_duration_since(Instant::now()).as_millis().max(1) as u32) {
            if let Some((pct, charging)) = parse(m, &b[..n]) {
                out.push(Dev { id: format!("arctis:{name}"), name: name.to_string(), kind: "audio", pct, charging });
                break;
            }
            if Instant::now() >= until {
                break;
            }
        }
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn arctis_7_plus_status() {
        let m = table::HEADSETS.iter().find(|m| m.pids.iter().any(|(p, _)| *p == 0x220e)).unwrap();
        // connected, level 3 of 4, discharging, dial 100/100
        assert_eq!(parse(m, &[0x00, 0xb0, 0x03, 0x03, 0x00, 0x64, 0x64]), Some((75, false)));
        // charging
        assert_eq!(parse(m, &[0x00, 0xb0, 0x03, 0x04, 0x01, 0x64, 0x64]), Some((100, true)));
        // the headset is off, and the frame before its data
        assert_eq!(parse(m, &[0x00, 0xb0, 0x01, 0x00, 0x00, 0x00, 0x00]), None);
        assert_eq!(parse(m, &[0x00, 0xb0, 0x03, 0x00, 0x00, 0xff, 0xff]), None);
    }

    /// This PC's headsets: `cargo test -- --ignored live_headsets --nocapture`.
    #[test]
    #[ignore]
    fn live_headsets() {
        let t = Instant::now();
        for d in scan() {
            println!("{d:?}");
        }
        println!("read {:?}", t.elapsed());
    }
}
