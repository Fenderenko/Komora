//! Logitech mice and keyboards on their receivers (Lightspeed, Unifying, Bolt) or on a cable: their charge
//! through HID++ 2.0 (the protocol of G HUB and Solaar), which Windows is not told. Requests go to the
//! receiver's long HID++ collection (vendor page 0xFF00, usage 2); a device that is off does not answer and
//! is left out. Names and feature indexes are kept between reads; absent device slots are probed again
//! every ten minutes.

use std::{
    collections::HashMap,
    sync::Mutex,
    time::{Duration, Instant},
};

use windows::{
    Win32::{
        Devices::{
            DeviceAndDriverInstallation::{CM_GET_DEVICE_INTERFACE_LIST_PRESENT, CM_Get_Device_Interface_List_SizeW, CM_Get_Device_Interface_ListW, CR_SUCCESS},
            HumanInterfaceDevice::{HIDD_ATTRIBUTES, HIDP_CAPS, HidD_FreePreparsedData, HidD_GetAttributes, HidD_GetHidGuid, HidD_GetPreparsedData, HidP_GetCaps, PHIDP_PREPARSED_DATA},
        },
        Foundation::{CloseHandle, GENERIC_READ, GENERIC_WRITE, HANDLE, WAIT_OBJECT_0},
        Storage::FileSystem::{CreateFileW, FILE_FLAG_OVERLAPPED, FILE_SHARE_READ, FILE_SHARE_WRITE, OPEN_EXISTING, ReadFile, WriteFile},
        System::{
            IO::{CancelIoEx, GetOverlappedResult, OVERLAPPED},
            Threading::{CreateEventW, ResetEvent, WaitForSingleObject},
        },
    },
    core::PCWSTR,
};

use crate::btbatt::Dev;

/// Receivers that hold one device (index 1) and those that may hold up to six.
const LIGHTSPEED: [u16; 8] = [0xc539, 0xc53a, 0xc53d, 0xc53f, 0xc541, 0xc545, 0xc547, 0xc54d];
const MULTI: [u16; 4] = [0xc52b, 0xc532, 0xc534, 0xc548];

/// Software id in our requests (the low nibble of the function byte): answers to others are skipped.
const SW: u8 = 0x0D;

/// A HID++ device answering: its slot on the receiver (0xFF — on a cable or Bluetooth).
#[derive(Clone)]
struct Known {
    name: String,
    kind: &'static str,
    /// index of the battery feature and which one it is (0x1004, 0x1000, 0x1001)
    batt: (u8, u16),
}

struct Cache {
    /// (path, slot) → the device
    known: HashMap<(String, u8), Known>,
    /// path → when the empty slots were probed last
    probed: HashMap<String, Instant>,
}

static CACHE: Mutex<Option<Cache>> = Mutex::new(None);

/// A HID interface opened for shared overlapped reads and writes.
pub(crate) struct Hid {
    h: HANDLE,
    ev: HANDLE,
}

// the handles belong to one owner at a time: a listener thread takes them over whole
unsafe impl Send for Hid {}

impl Drop for Hid {
    fn drop(&mut self) {
        unsafe {
            let _ = CloseHandle(self.h);
            let _ = CloseHandle(self.ev);
        }
    }
}

impl Hid {
    pub(crate) fn handle(&self) -> HANDLE {
        self.h
    }

    pub(crate) fn open(path: &str) -> Option<Self> {
        let w: Vec<u16> = path.encode_utf16().chain(std::iter::once(0)).collect();
        unsafe {
            let h = CreateFileW(PCWSTR(w.as_ptr()), (GENERIC_READ | GENERIC_WRITE).0, FILE_SHARE_READ | FILE_SHARE_WRITE, None, OPEN_EXISTING, FILE_FLAG_OVERLAPPED, None).ok()?;
            let Ok(ev) = CreateEventW(None, true, false, PCWSTR::null()) else {
                let _ = CloseHandle(h);
                return None;
            };
            Some(Hid { h, ev })
        }
    }

    /// Waits for an overlapped operation; false (and the operation cancelled) when the time ran out.
    fn finish(&self, ov: &mut OVERLAPPED, ms: u32) -> Option<u32> {
        let mut n = 0u32;
        unsafe {
            if WaitForSingleObject(self.ev, ms) != WAIT_OBJECT_0 {
                let _ = CancelIoEx(self.h, Some(ov));
                let _ = GetOverlappedResult(self.h, ov, &mut n, true);
                return None;
            }
            GetOverlappedResult(self.h, ov, &mut n, false).ok()?;
        }
        Some(n)
    }

    pub(crate) fn write(&self, buf: &[u8]) -> bool {
        let mut ov = OVERLAPPED { hEvent: self.ev, ..Default::default() };
        unsafe {
            let _ = ResetEvent(self.ev);
            if let Err(e) = WriteFile(self.h, Some(buf), None, Some(&mut ov)) {
                // ERROR_IO_PENDING
                if e.code().0 as u32 != 0x800703E5 {
                    return false;
                }
            }
        }
        self.finish(&mut ov, 300).is_some()
    }

    /// One input report within `ms`; its length.
    pub(crate) fn read(&self, buf: &mut [u8], ms: u32) -> Option<usize> {
        let mut ov = OVERLAPPED { hEvent: self.ev, ..Default::default() };
        unsafe {
            let _ = ResetEvent(self.ev);
            if let Err(e) = ReadFile(self.h, Some(buf), None, Some(&mut ov)) {
                if e.code().0 as u32 != 0x800703E5 {
                    return None;
                }
            }
        }
        self.finish(&mut ov, ms).map(|n| n as usize)
    }

    /// One HID++ 2.0 request; the 16 parameter bytes of the answer (None — an error or no answer).
    fn request(&self, slot: u8, feat: u8, func: u8, params: &[u8]) -> Option<[u8; 16]> {
        let mut r = [0u8; 20];
        r[0] = 0x11;
        r[1] = slot;
        r[2] = feat;
        r[3] = (func << 4) | SW;
        r[4..4 + params.len().min(16)].copy_from_slice(&params[..params.len().min(16)]);
        if !self.write(&r) {
            return None;
        }
        let until = Instant::now() + Duration::from_millis(400);
        let mut b = [0u8; 64];
        loop {
            let left = until.saturating_duration_since(Instant::now()).as_millis() as u32;
            if left == 0 {
                return None;
            }
            let n = self.read(&mut b, left)?;
            if n < 20 || b[0] != 0x11 || b[1] != slot {
                continue;
            }
            // HID++ 2.0 error for this request
            if b[2] == 0xFF && b[3] == feat && b[4] == r[3] {
                return None;
            }
            if b[2] == feat && b[3] == r[3] {
                return b[4..20].try_into().ok();
            }
        }
    }

    /// The index of a feature on the device (None — it has none).
    fn feature(&self, slot: u8, id: u16) -> Option<u8> {
        self.request(slot, 0, 0, &id.to_be_bytes()).map(|p| p[0]).filter(|&i| i != 0)
    }
}

/// Paths of HID interfaces of Logitech devices.
fn logitech_paths() -> Vec<String> {
    let guid = unsafe { HidD_GetHidGuid() };
    let mut len = 0u32;
    if unsafe { CM_Get_Device_Interface_List_SizeW(&mut len, &guid, PCWSTR::null(), CM_GET_DEVICE_INTERFACE_LIST_PRESENT) } != CR_SUCCESS || len == 0 {
        return Vec::new();
    }
    let mut buf = vec![0u16; len as usize];
    if unsafe { CM_Get_Device_Interface_ListW(&guid, PCWSTR::null(), &mut buf, CM_GET_DEVICE_INTERFACE_LIST_PRESENT) } != CR_SUCCESS {
        return Vec::new();
    }
    buf.split(|&c| c == 0).filter(|s| !s.is_empty()).map(String::from_utf16_lossy).filter(|p| p.to_ascii_lowercase().contains("vid_046d")).collect()
}

/// The interface's product id when it is the long HID++ collection.
fn hidpp_long(h: &Hid) -> Option<u16> {
    hidpp_usage(h).filter(|u| u.1 == 2).map(|u| u.0)
}

/// (product id, usage) of a HID++ collection (vendor page 0xFF00: usage 1 — short reports, 2 — long).
fn hidpp_usage(h: &Hid) -> Option<(u16, u16)> {
    unsafe {
        let mut a = HIDD_ATTRIBUTES { Size: std::mem::size_of::<HIDD_ATTRIBUTES>() as u32, ..Default::default() };
        if !HidD_GetAttributes(h.h, &mut a) {
            return None;
        }
        let mut pp = PHIDP_PREPARSED_DATA::default();
        if !HidD_GetPreparsedData(h.h, &mut pp) {
            return None;
        }
        let mut caps = HIDP_CAPS::default();
        let ok = HidP_GetCaps(pp, &mut caps).is_ok();
        let _ = HidD_FreePreparsedData(pp);
        (ok && caps.UsagePage == 0xFF00 && (caps.Usage == 1 || caps.Usage == 2)).then_some((a.ProductID, caps.Usage))
    }
}

/// HID++ collections a listener thread waits on.
static LISTENING: Mutex<Vec<String>> = Mutex::new(Vec::new());

/// Starts a thread per HID++ collection not heard yet. It sleeps in a read until the receiver or device says
/// something on its own: a device turned on or off (0x41) or an event of a feature (software id 0 — the
/// battery's when charging starts or stops, the level changes); then the charge is read again at once. The
/// thread ends with its device.
pub fn listen() {
    for path in logitech_paths() {
        if LISTENING.lock().unwrap().contains(&path) {
            continue;
        }
        let Some(h) = Hid::open(&path) else { continue };
        if hidpp_usage(&h).is_none() {
            continue;
        }
        LISTENING.lock().unwrap().push(path.clone());
        let _ = std::thread::Builder::new().name("komora-logi".into()).spawn(move || {
            let mut b = [0u8; 64];
            // INFINITE: no wake-ups while nothing happens
            while let Some(n) = h.read(&mut b, u32::MAX) {
                let connection = n >= 7 && b[0] == 0x10 && b[2] == 0x41;
                let event = n >= 20 && b[0] == 0x11 && b[2] != 0 && b[2] != 0xFF && b[3] & 0x0F == 0;
                if connection || event {
                    // a device turned on: its empty slot is asked again at once, not after the probe interval
                    if connection {
                        if let Some(c) = CACHE.lock().unwrap().as_mut() {
                            c.probed.remove(&path);
                        }
                    }
                    crate::btbatt::wake();
                }
            }
            LISTENING.lock().unwrap().retain(|p| *p != path);
        });
    }
}

/// What the device is, by HID++ device type (feature 0x0005).
fn kind_of(t: u8) -> &'static str {
    match t {
        0 | 2 => "kbd",
        3..=5 => "mouse",
        8 => "audio",
        11 | 12 => "pad",
        _ => "bt",
    }
}

/// Name, kind and battery feature of the device in a slot (None — no device answers there).
fn identify(h: &Hid, slot: u8) -> Option<Known> {
    // the protocol version (root function 1) first: a slot without a device answers nothing, once
    h.request(slot, 0, 1, &[0, 0, 0x5A])?;
    let batt = [0x1004u16, 0x1000, 0x1001].into_iter().find_map(|id| h.feature(slot, id).map(|i| (i, id)))?;
    let (mut name, mut kind) = (String::from("Logitech"), "bt");
    if let Some(f) = h.feature(slot, 0x0005) {
        if let Some(n) = h.request(slot, f, 0, &[]).map(|p| p[0] as usize) {
            let mut bytes = Vec::new();
            while bytes.len() < n.min(64) {
                let Some(p) = h.request(slot, f, 1, &[bytes.len() as u8]) else { break };
                let take = (n - bytes.len()).min(16);
                bytes.extend_from_slice(&p[..take]);
            }
            let s = String::from_utf8_lossy(&bytes).trim_matches(char::from(0)).trim().to_string();
            if !s.is_empty() {
                name = if s.to_ascii_lowercase().starts_with("logi") { s } else { format!("Logitech {s}") };
            }
        }
        if let Some(t) = h.request(slot, f, 2, &[]) {
            kind = kind_of(t[0]);
        }
    }
    Some(Known { name, kind, batt })
}

/// Battery voltage (mV) → percent, by the curve Solaar uses for Logitech's lithium cells.
fn volt_pct(mv: u16) -> u8 {
    const T: [(u16, u8); 13] = [(4186, 100), (4067, 90), (3989, 80), (3922, 70), (3859, 60), (3811, 50), (3778, 40), (3751, 30), (3717, 20), (3671, 10), (3646, 5), (3579, 2), (3500, 0)];
    if mv >= T[0].0 {
        return 100;
    }
    for w in T.windows(2) {
        let ((v1, p1), (v0, p0)) = (w[0], w[1]);
        if mv >= v0 {
            return (p0 as u32 + (mv - v0) as u32 * (p1 - p0) as u32 / (v1 - v0) as u32) as u8;
        }
    }
    0
}

/// (percent, charging) of a known device.
fn battery(h: &Hid, slot: u8, k: &Known) -> Option<(u8, bool)> {
    let (i, id) = k.batt;
    match id {
        // devices without a percent tell a level only: full, good, low, critical
        0x1004 => h.request(slot, i, 1, &[]).map(|p| {
            let pct = if p[0] > 0 { p[0].min(100) } else if p[1] & 8 != 0 { 100 } else if p[1] & 4 != 0 { 60 } else if p[1] & 2 != 0 { 20 } else if p[1] & 1 != 0 { 5 } else { 0 };
            (pct, matches!(p[2], 1 | 2))
        }),
        0x1000 => h.request(slot, i, 0, &[]).map(|p| (p[0].min(100), matches!(p[2], 1 | 2))),
        _ => h.request(slot, i, 0, &[]).map(|p| (volt_pct(u16::from_be_bytes([p[0], p[1]])), p[2] & 0x80 != 0)),
    }
}

/// (worker thread; blocks up to a second or two when slots are probed) Logitech devices that answer now.
pub fn scan() -> Vec<Dev> {
    let mut out = Vec::new();
    let mut guard = CACHE.lock().unwrap();
    let cache = guard.get_or_insert_with(|| Cache { known: HashMap::new(), probed: HashMap::new() });
    for path in logitech_paths() {
        let Some(h) = Hid::open(&path) else { continue };
        let Some(pid) = hidpp_long(&h) else { continue };
        let slots: Vec<u8> = if LIGHTSPEED.contains(&pid) {
            vec![1]
        } else if MULTI.contains(&pid) {
            (1..=6).collect()
        } else {
            vec![0xFF]
        };
        // a receiver with no device known yet (asleep when first asked) is probed every minute, others every 10 min
        let every = if cache.known.keys().any(|(p, _)| *p == path) { 600 } else { 60 };
        let probe = cache.probed.get(&path).is_none_or(|t| t.elapsed() > Duration::from_secs(every));
        if probe {
            cache.probed.insert(path.clone(), Instant::now());
        }
        for slot in slots {
            let key = (path.clone(), slot);
            if !cache.known.contains_key(&key) {
                if !probe {
                    continue;
                }
                match identify(&h, slot) {
                    Some(k) => {
                        cache.known.insert(key.clone(), k);
                    }
                    None => continue,
                }
            }
            let k = cache.known[&key].clone();
            // a device on its cable answers both there and through its receiver: one entry, kept by name
            if out.iter().any(|d: &Dev| d.name == k.name) {
                continue;
            }
            if let Some((pct, charging)) = battery(&h, slot, &k) {
                out.push(Dev { id: format!("logi:{}", k.name), name: k.name.clone(), kind: k.kind, pct, charging });
            }
        }
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn voltage_curve() {
        assert_eq!(volt_pct(4200), 100);
        assert_eq!(volt_pct(3811), 50);
        assert_eq!(volt_pct(3835), 55);
        assert_eq!(volt_pct(3400), 0);
    }

    /// This PC's Logitech devices: `cargo test -- --ignored live_logi --nocapture`.
    #[test]
    #[ignore]
    fn live_logi() {
        let t = Instant::now();
        for d in scan() {
            println!("{d:?}");
        }
        println!("first read {:?}", t.elapsed());
        let t = Instant::now();
        let n = scan().len();
        println!("second read {:?} ({n})", t.elapsed());
    }
}
