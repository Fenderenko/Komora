//! Razer and SteelSeries mice on their receivers or cables: the charge by each maker's own read-only query (tables in
//! mice_table.rs, generated from razer-battery-report and steel-mouse, both MIT). Razer — a 90-byte feature report,
//! command 0x07/0x80 (level 0..255) and 0x07/0x84 (charging); SteelSeries — an output report 0x92 / 0xD2 (Aerox,
//! Prime) or 0xAA 0x01 (Rival 3 Wireless, 650) answered in an input report.

use std::time::{Duration, Instant};

use windows::{
    Win32::Devices::{
        DeviceAndDriverInstallation::{CM_GET_DEVICE_INTERFACE_LIST_PRESENT, CM_Get_Device_Interface_List_SizeW, CM_Get_Device_Interface_ListW, CR_SUCCESS},
        HumanInterfaceDevice::{HIDD_ATTRIBUTES, HIDP_CAPS, HidD_FreePreparsedData, HidD_GetAttributes, HidD_GetFeature, HidD_GetHidGuid, HidD_GetPreparsedData, HidD_SetFeature, HidP_GetCaps, PHIDP_PREPARSED_DATA},
    },
    core::PCWSTR,
};

use crate::{btbatt::Dev, logi::Hid};

#[path = "mice_table.rs"]
mod table;

fn paths(vid: &str) -> Vec<String> {
    let guid = unsafe { HidD_GetHidGuid() };
    let mut len = 0u32;
    if unsafe { CM_Get_Device_Interface_List_SizeW(&mut len, &guid, PCWSTR::null(), CM_GET_DEVICE_INTERFACE_LIST_PRESENT) } != CR_SUCCESS || len == 0 {
        return Vec::new();
    }
    let mut buf = vec![0u16; len as usize];
    if unsafe { CM_Get_Device_Interface_ListW(&guid, PCWSTR::null(), &mut buf, CM_GET_DEVICE_INTERFACE_LIST_PRESENT) } != CR_SUCCESS {
        return Vec::new();
    }
    buf.split(|&c| c == 0).filter(|s| !s.is_empty()).map(String::from_utf16_lossy).filter(|p| p.to_ascii_lowercase().contains(vid)).collect()
}

fn pid_of(h: &Hid) -> Option<u16> {
    let mut a = HIDD_ATTRIBUTES { Size: std::mem::size_of::<HIDD_ATTRIBUTES>() as u32, ..Default::default() };
    unsafe { HidD_GetAttributes(h.handle(), &mut a) }.then_some(a.ProductID)
}

fn caps(h: &Hid) -> Option<HIDP_CAPS> {
    unsafe {
        let mut pp = PHIDP_PREPARSED_DATA::default();
        if !HidD_GetPreparsedData(h.handle(), &mut pp) {
            return None;
        }
        let mut c = HIDP_CAPS::default();
        let ok = HidP_GetCaps(pp, &mut c).is_ok();
        let _ = HidD_FreePreparsedData(pp);
        ok.then_some(c)
    }
}

/// A model's name for the tray: the receiver and the cable of one mouse show as one.
fn short(name: &str) -> String {
    let mut n = name.to_string();
    for t in [" (Wireless)", " (Wired)", " (Receiver)", " Receiver", " (2.4 GHz wireless mode)", " (2.4 GHz mode)", " (wired mode)"] {
        n = n.replace(t, "");
    }
    n.trim().to_string()
}

// ---------------------------------------------------------------- Razer

/// A Razer request: status, transaction, remaining (2), protocol, size, class, id, arguments (80), checksum, 0.
pub fn razer_request(tid: u8, class: u8, id: u8) -> [u8; 90] {
    let mut r = [0u8; 90];
    r[1] = tid;
    r[5] = 0x02;
    r[6] = class;
    r[7] = id;
    r[88] = r[2..88].iter().fold(0, |c, b| c ^ b);
    r
}

/// The argument 1 of a successful answer to (class, id).
pub fn razer_answer(r: &[u8], class: u8, id: u8) -> Option<u8> {
    (r.len() >= 90 && r[0] == 0x02 && r[6] == class && r[7] == id && r[2..88].iter().fold(0, |c, b| c ^ b) == r[88]).then_some(r[9])
}

/// One feature-report exchange (report id 0 in front), a few tries while the mouse is busy.
fn razer_ask(h: &Hid, tid: u8, class: u8, id: u8, wait_us: u32) -> Option<u8> {
    let req = razer_request(tid, class, id);
    for _ in 0..3 {
        let mut wire = [0u8; 91];
        wire[1..].copy_from_slice(&req);
        if !unsafe { HidD_SetFeature(h.handle(), wire.as_mut_ptr() as *mut _, wire.len() as u32) } {
            return None;
        }
        std::thread::sleep(Duration::from_micros(wait_us.max(600) as u64));
        let mut back = [0u8; 91];
        if !unsafe { HidD_GetFeature(h.handle(), back.as_mut_ptr() as *mut _, back.len() as u32) } {
            return None;
        }
        if let Some(v) = razer_answer(&back[1..], class, id) {
            return Some(v);
        }
        // 0x01 busy, 0x04 no answer from a sleeping mouse: once more after a moment
        if !matches!(back[1], 0x01 | 0x04) {
            return None;
        }
        std::thread::sleep(Duration::from_millis(10));
    }
    None
}

fn razer(out: &mut Vec<Dev>) {
    for path in paths("vid_1532") {
        let low = path.to_ascii_lowercase();
        let Some(&(pid, name, tid, iface, wait, ch)) = table::RAZER.iter().find(|(p, ..)| low.contains(&format!("pid_{p:04x}"))) else { continue };
        if !low.contains(&format!("&mi_{iface:02x}")) && !(iface == 0 && !low.contains("&mi_")) {
            continue;
        }
        let name = short(name);
        if out.iter().any(|d| d.name == name) {
            continue;
        }
        let Some(h) = Hid::open(&path) else { continue };
        if pid_of(&h) != Some(pid) || caps(&h).is_none_or(|c| c.FeatureReportByteLength < 91) {
            continue;
        }
        let Some(raw) = razer_ask(&h, tid, 0x07, 0x80, wait) else { continue };
        let charging = ch && razer_ask(&h, tid, 0x07, 0x84, wait).is_some_and(|v| v != 0);
        let pct = ((raw as u32 * 100 + 127) / 255) as u8;
        out.push(Dev { id: format!("razer:{name}"), name, kind: "mouse", pct, charging });
    }
}

// ---------------------------------------------------------------- SteelSeries

/// (percent, charging) from an answer to 0x92 / 0xD2: the level byte (bit 7 — charging) after the echoed command;
/// `direct` — percent, otherwise 1..21 steps of 5 %.
pub fn ss_aerox(b: &[u8], cmd: u8, direct: bool) -> Option<(u8, bool)> {
    // Windows puts the report id (0) first: [0, cmd, 0, level] or [0, cmd, level]
    let at = b.iter().position(|&x| x == cmd).filter(|&i| i <= 1)?;
    let level = if b.get(at + 1) == Some(&0) { *b.get(at + 2)? } else { *b.get(at + 1)? };
    let (raw, charging) = (level & 0x7F, level & 0x80 != 0);
    if raw == 0 || raw > 100 {
        return None;
    }
    let pct = if direct || raw > 21 { raw } else { ((raw - 1) as u16 * 5).min(100) as u8 };
    Some((pct, charging))
}

/// (percent, charging) from an answer to AA 01: [0, AA, 01, level, charging], [0, AA, level, charging] or
/// [0, level, 0, charging].
pub fn ss_rival(b: &[u8]) -> Option<(u8, bool)> {
    let b = if b.first() == Some(&0) { &b[1..] } else { b };
    let (level, ch) = match b {
        [0xAA, 0x01, l, c, ..] => (*l, *c),
        [0xAA, l, c, ..] => (*l, *c),
        [l, 0, c, ..] => (*l, *c),
        _ => return None,
    };
    (level <= 100 && level > 0).then_some((level, ch != 0))
}

fn steelseries(out: &mut Vec<Dev>) {
    for path in paths("vid_1038") {
        let low = path.to_ascii_lowercase();
        let Some(&(pid, name, iface, cmd, direct)) = table::STEELSERIES.iter().find(|(p, ..)| low.contains(&format!("pid_{p:04x}"))) else { continue };
        if !low.contains(&format!("&mi_{iface:02x}")) {
            continue;
        }
        let name = short(name);
        if out.iter().any(|d| d.name == name) {
            continue;
        }
        let Some(h) = Hid::open(&path) else { continue };
        let Some(c) = caps(&h).filter(|_| pid_of(&h) == Some(pid)) else { continue };
        let mut req = vec![0u8; (c.OutputReportByteLength as usize).max(3)];
        req[1] = cmd;
        if cmd == 0xAA {
            req[2] = 0x01;
        }
        if !h.write(&req) {
            continue;
        }
        let until = Instant::now() + Duration::from_millis(400);
        let mut b = [0u8; 64];
        while let Some(n) = h.read(&mut b, until.saturating_duration_since(Instant::now()).as_millis().max(1) as u32) {
            let got = if cmd == 0xAA { ss_rival(&b[..n]) } else { ss_aerox(&b[..n], cmd, direct) };
            if let Some((pct, charging)) = got {
                out.push(Dev { id: format!("steelseries:{name}"), name: name.clone(), kind: "mouse", pct, charging });
                break;
            }
            if Instant::now() >= until {
                break;
            }
        }
    }
}

/// (worker thread) Razer and SteelSeries mice that tell their charge now.
pub fn scan() -> Vec<Dev> {
    let mut out = Vec::new();
    razer(&mut out);
    steelseries(&mut out);
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn razer_frames() {
        let r = razer_request(0x3f, 0x07, 0x80);
        assert_eq!(r[88], 0x02 ^ 0x07 ^ 0x80);
        let mut a = r;
        a[0] = 0x02;
        a[9] = 0xFF;
        a[88] = a[2..88].iter().fold(0, |c, b| c ^ b);
        assert_eq!(razer_answer(&a, 0x07, 0x80), Some(0xFF));
        assert_eq!(short("Razer DeathAdder V3 Pro (Wireless)"), "Razer DeathAdder V3 Pro");
    }

    #[test]
    fn steelseries_answers() {
        // 21 steps: 21 → 100 %, 11 with the charging bit → 50 %, charging
        assert_eq!(ss_aerox(&[0x00, 0xD2, 0x00, 21], 0xD2, false), Some((100, false)));
        assert_eq!(ss_aerox(&[0x00, 0x92, 11 | 0x80], 0x92, false), Some((50, true)));
        assert_eq!(ss_aerox(&[0x00, 0xD2, 0x00, 85], 0xD2, true), Some((85, false)));
        assert_eq!(ss_rival(&[0x00, 0xAA, 0x01, 64, 1]), Some((64, true)));
        assert_eq!(ss_rival(&[0x00, 64, 0, 0]), Some((64, false)));
    }
}
