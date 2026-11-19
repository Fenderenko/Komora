//! The charge of Bluetooth devices in the tray: one icon per device that reports its battery to Windows
//! (the property {104EA319-…} 2 of its Bluetooth nodes — headphones, keyboards, mice, Xbox controllers), a
//! drawing of the device with a charge bar (glyph.rs) and the name and percent in the tooltip; only while the
//! device is connected (Windows keeps the last level of a disconnected one). Logitech devices on their own
//! receivers come from logi.rs, Sony controllers from sony.rs. A worker
//! thread reads the devices every 10 s while the icons are on and at once on a device change.

use std::{
    collections::{BTreeMap, HashMap, HashSet},
    sync::{Condvar, Mutex},
    time::Duration,
};

use serde_json::{Value, json};
use windows::{
    Win32::{
        Devices::{
            Bluetooth::{BLUETOOTH_DEVICE_INFO, BLUETOOTH_DEVICE_SEARCH_PARAMS, BluetoothFindDeviceClose, BluetoothFindFirstDevice, BluetoothFindNextDevice},
            DeviceAndDriverInstallation::{CM_GETIDLIST_FILTER_PRESENT, CM_Get_DevNode_PropertyW, CM_Get_Device_ID_List_SizeW, CM_Get_Device_ID_ListW, CM_LOCATE_DEVNODE_NORMAL, CM_Locate_DevNodeW, CR_SUCCESS},
            Properties::{DEVPKEY_DeviceContainer_Category, DEVPKEY_Device_Class, DEVPKEY_Device_DevNodeStatus, DEVPKEY_Device_CompatibleIds, DEVPKEY_Device_ContainerId, DEVPKEY_Device_FriendlyName, DEVPKEY_Device_HardwareIds, DEVPROPTYPE},
        },
        Foundation::DEVPROPKEY,
        System::{
            Com::{COINIT_MULTITHREADED, CoInitializeEx},
            Registry::HKEY_CURRENT_USER,
        },
        UI::{
            Shell::{NIF_ICON, NIF_INFO, NIF_MESSAGE, NIF_SHOWTIP, NIF_TIP, NIIF_LARGE_ICON, NIIF_RESPECT_QUIET_TIME, NIIF_USER, NIM_ADD, NIM_DELETE, NIM_MODIFY, NOTIFY_ICON_DATA_FLAGS, NOTIFYICONDATAW, Shell_NotifyIconW},
            WindowsAndMessaging::{DestroyIcon, GetSystemMetrics, SM_CXSMICON},
        },
    },
    core::{GUID, PCWSTR},
};

use crate::{config, util};

/// DN_DEVICE_DISCONNECTED: the Bluetooth device is paired but not connected now.
const DISCONNECTED: u32 = 0x0200_0000;

/// The Bluetooth address of a device's own node: "f4ee25ce2785".
const ADDRESS: DEVPROPKEY = DEVPROPKEY { fmtid: GUID::from_u128(0x2bd67d8b_8beb_48d5_87e0_6cda3428040a), pid: 1 };

/// Addresses of the classic Bluetooth devices connected now (asked of the Bluetooth stack: Windows keeps
/// the nodes of a paired device and their battery level after it disconnects).
fn connected_classic() -> HashSet<u64> {
    let mut out = HashSet::new();
    let sp = BLUETOOTH_DEVICE_SEARCH_PARAMS { dwSize: std::mem::size_of::<BLUETOOTH_DEVICE_SEARCH_PARAMS>() as u32, fReturnConnected: true.into(), fReturnAuthenticated: true.into(), fReturnRemembered: true.into(), ..Default::default() };
    let mut info = BLUETOOTH_DEVICE_INFO { dwSize: std::mem::size_of::<BLUETOOTH_DEVICE_INFO>() as u32, ..Default::default() };
    let Ok(find) = (unsafe { BluetoothFindFirstDevice(&sp, &mut info) }) else { return out };
    loop {
        if info.fConnected.as_bool() {
            out.insert(unsafe { info.Address.Anonymous.ullLong } & 0xFFFF_FFFF_FFFF);
        }
        info = BLUETOOTH_DEVICE_INFO { dwSize: std::mem::size_of::<BLUETOOTH_DEVICE_INFO>() as u32, ..Default::default() };
        if unsafe { BluetoothFindNextDevice(find, &mut info) }.is_err() {
            break;
        }
    }
    let _ = unsafe { BluetoothFindDeviceClose(find) };
    out
}

/// The battery level (byte, %) Windows keeps for a Bluetooth device (the last one known, also when it is
/// not connected).
const BATTERY: DEVPROPKEY = DEVPROPKEY { fmtid: GUID::from_u128(0x104ea319_6ee2_4701_bd47_8ddbf425bbe5), pid: 2 };

/// A device with a charge.
#[derive(Clone, PartialEq, Debug)]
pub struct Dev {
    /// container id: one per physical device
    pub id: String,
    pub name: String,
    /// "pad", "kbd", "mouse", "audio" or "bt"
    pub kind: &'static str,
    pub pct: u8,
    pub charging: bool,
}

// ---------------------------------------------------------------- reading the devices

fn wide(s: &str) -> Vec<u16> {
    s.encode_utf16().chain(std::iter::once(0)).collect()
}

/// Ids of all present device nodes.
fn present_ids() -> Vec<String> {
    let mut len = 0u32;
    if unsafe { CM_Get_Device_ID_List_SizeW(&mut len, PCWSTR::null(), CM_GETIDLIST_FILTER_PRESENT) } != CR_SUCCESS || len == 0 {
        return Vec::new();
    }
    let mut buf = vec![0u16; len as usize];
    if unsafe { CM_Get_Device_ID_ListW(PCWSTR::null(), &mut buf, CM_GETIDLIST_FILTER_PRESENT) } != CR_SUCCESS {
        return Vec::new();
    }
    buf.split(|&c| c == 0).filter(|s| !s.is_empty()).map(String::from_utf16_lossy).collect()
}

fn node(id: &str) -> Option<u32> {
    let w = wide(id);
    let mut dn = 0u32;
    (unsafe { CM_Locate_DevNodeW(&mut dn, PCWSTR(w.as_ptr()), CM_LOCATE_DEVNODE_NORMAL) } == CR_SUCCESS).then_some(dn)
}

fn prop(dn: u32, key: &DEVPROPKEY) -> Option<Vec<u8>> {
    let (mut ty, mut size) = (DEVPROPTYPE(0), 0u32);
    let _ = unsafe { CM_Get_DevNode_PropertyW(dn, key, &mut ty, None, &mut size, 0) };
    if size == 0 {
        return None;
    }
    let mut buf = vec![0u8; size as usize];
    (unsafe { CM_Get_DevNode_PropertyW(dn, key, &mut ty, Some(buf.as_mut_ptr()), &mut size, 0) } == CR_SUCCESS).then(|| {
        buf.truncate(size as usize);
        buf
    })
}

/// A string or a list of strings (joined by "|").
fn prop_str(dn: u32, key: &DEVPROPKEY) -> String {
    let Some(b) = prop(dn, key) else { return String::new() };
    let w: Vec<u16> = b.chunks_exact(2).map(|c| u16::from_le_bytes([c[0], c[1]])).collect();
    w.split(|&c| c == 0).filter(|s| !s.is_empty()).map(String::from_utf16_lossy).collect::<Vec<_>>().join("|")
}

fn container(dn: u32) -> Option<String> {
    let b = prop(dn, &DEVPKEY_Device_ContainerId)?;
    let b = b.get(..16)?;
    let g = GUID::from_values(u32::from_le_bytes(b[0..4].try_into().ok()?), u16::from_le_bytes([b[4], b[5]]), u16::from_le_bytes([b[6], b[7]]), b[8..16].try_into().ok()?);
    // the null container and the PC's own one are not devices
    (g != GUID::zeroed() && g != GUID::from_u128(0x00000000_0000_0000_ffff_ffffffffffff)).then(|| format!("{g:?}"))
}

/// What a device is: by the category Windows gives it ("Input.Keyboard", "Audio.Headphone"…), else by the
/// classes and ids of its nodes, else by its name.
pub fn kind_of(category: &str, classes: &HashSet<String>, ids: &str, name: &str) -> &'static str {
    let cat = category.to_ascii_lowercase();
    let ids = ids.to_ascii_lowercase();
    let n = name.to_ascii_lowercase();
    let has = |c: &str| classes.contains(c);
    if ["gaming", "gamepad", "joystick"].iter().any(|w| cat.contains(w)) {
        "pad"
    } else if cat.contains("keyboard") {
        "kbd"
    } else if cat.contains("mouse") || cat.contains("pointing") {
        "mouse"
    } else if ["audio", "headphone", "headset", "speaker"].iter().any(|w| cat.contains(w)) {
        "audio"
    } else if (has("hidclass") && ids.contains("hid_device_system_game")) || ["controller", "gamepad", "joy-con", "dualsense", "dualshock"].iter().any(|w| n.contains(w)) {
        "pad"
    } else if has("keyboard") || n.contains("keyboard") {
        "kbd"
    } else if has("mouse") || n.contains("mouse") {
        "mouse"
    } else if has("media") || has("audioendpoint") || ["buds", "headphone", "headset", "airpods", "earphone"].iter().any(|w| n.contains(w)) {
        "audio"
    } else {
        "bt"
    }
}

/// A node's name without the Bluetooth profile Windows adds to it.
fn clean_name(s: &str) -> String {
    let mut s = s.trim().to_string();
    for tail in [" Hands-Free AG", " Hands-Free", " Avrcp Transport", " Stereo"] {
        if let Some(x) = s.strip_suffix(tail) {
            s = x.trim().to_string();
        }
    }
    s
}

/// (any thread; blocks ~ms) The devices that report a charge now.
pub fn scan() -> Vec<Dev> {
    let ids = present_ids();
    // the Bluetooth nodes with a battery level, by container
    let mut found: BTreeMap<String, (u8, String)> = BTreeMap::new();
    let mut bt_name: HashMap<String, String> = HashMap::new();
    let mut category: HashMap<String, String> = HashMap::new();
    // classic devices: container → address (connected or not is asked of the Bluetooth stack)
    let mut classic: HashMap<String, u64> = HashMap::new();
    for id in ids.iter().filter(|i| ["BTHENUM\\", "BTHLE\\", "BTHLEDEVICE\\"].iter().any(|p| i.to_ascii_uppercase().starts_with(p))) {
        let Some(dn) = node(id) else { continue };
        let Some(c) = container(dn) else { continue };
        let up = id.to_ascii_uppercase();
        // the device's own node ("BTHENUM\DEV_…", "BTHLE\DEV_…") carries the name the user knows
        if up.starts_with("BTHENUM\\DEV_") || up.starts_with("BTHLE\\DEV_") {
            bt_name.insert(c.clone(), prop_str(dn, &DEVPKEY_Device_FriendlyName));
            category.insert(c.clone(), prop_str(dn, &DEVPKEY_DeviceContainer_Category));
            if up.starts_with("BTHENUM\\DEV_")
                && let Ok(a) = u64::from_str_radix(&prop_str(dn, &ADDRESS), 16)
            {
                classic.insert(c.clone(), a);
            }
        }
        // Bluetooth LE nodes carry the state themselves; classic ones are checked below
        let connected = up.starts_with("BTHENUM\\") || prop(dn, &DEVPKEY_Device_DevNodeStatus).and_then(|b| Some(u32::from_le_bytes(b.get(..4)?.try_into().ok()?))).is_some_and(|s| s & DISCONNECTED == 0);
        if let Some(b) = prop(dn, &BATTERY).and_then(|b| b.first().copied()).filter(|&p| p <= 100 && connected) {
            let e = found.entry(c).or_insert((b, String::new()));
            e.0 = e.0.max(b);
            if e.1.is_empty() {
                e.1 = prop_str(dn, &DEVPKEY_Device_FriendlyName);
            }
        }
    }
    if !classic.is_empty() {
        let on = connected_classic();
        found.retain(|c, _| classic.get(c).is_none_or(|a| on.contains(a)));
    }
    if found.is_empty() {
        return Vec::new();
    }
    // the classes and ids of every node of those containers tell what the device is
    let mut classes: HashMap<String, HashSet<String>> = HashMap::new();
    let mut hw: HashMap<String, String> = HashMap::new();
    for id in &ids {
        let Some(dn) = node(id) else { continue };
        let Some(c) = container(dn).filter(|c| found.contains_key(c)) else { continue };
        classes.entry(c.clone()).or_default().insert(prop_str(dn, &DEVPKEY_Device_Class).to_ascii_lowercase());
        let e = hw.entry(c).or_default();
        e.push('|');
        e.push_str(&prop_str(dn, &DEVPKEY_Device_HardwareIds));
        e.push('|');
        e.push_str(&prop_str(dn, &DEVPKEY_Device_CompatibleIds));
    }
    let empty = HashSet::new();
    found
        .into_iter()
        .map(|(c, (pct, node_name))| {
            let name = bt_name.get(&c).filter(|n| !n.is_empty()).cloned().unwrap_or_else(|| clean_name(&node_name));
            let kind = kind_of(category.get(&c).map(String::as_str).unwrap_or(""), classes.get(&c).unwrap_or(&empty), hw.get(&c).map(String::as_str).unwrap_or(""), &name);
            Dev { id: c, name, kind, pct, charging: false }
        })
        .collect()
}

// ---------------------------------------------------------------- the tray icons

struct State {
    devs: Vec<Dev>,
    /// device id → (tray uID, what its icon shows: kind, percent, charging, light taskbar, size)
    shown: HashMap<String, (u32, (&'static str, u8, bool, bool, i32))>,
    /// devices were read at least once
    scanned: bool,
    /// device id → the low-charge note already given in this discharge: 1 — at 20 %, 2 — at 10 %
    noted: HashMap<String, u8>,
}

static STATE: std::sync::LazyLock<Mutex<State>> = std::sync::LazyLock::new(|| Mutex::new(State { devs: Vec::new(), shown: HashMap::new(), scanned: false, noted: HashMap::new() }));
static WAKE: (Mutex<bool>, Condvar) = (Mutex::new(false), Condvar::new());
/// This process is the charge helper (battery.rs): it owns the icons and writes devices.json.
static HELPER: std::sync::atomic::AtomicBool = std::sync::atomic::AtomicBool::new(false);

/// The devices the helper found, for Komora's window.
fn devices_file() -> std::path::PathBuf {
    util::data_dir().join("devices.json")
}

fn write_devices(devs: &[Dev]) {
    let v: Vec<Value> = devs.iter().map(|d| json!({ "id": d.id, "name": d.name, "kind": d.kind, "pct": d.pct, "charging": d.charging })).collect();
    let p = devices_file();
    let tmp = p.with_extension("tmp");
    if std::fs::write(&tmp, Value::Array(v).to_string()).is_ok() {
        let _ = std::fs::rename(&tmp, &p);
    }
}

/// Komora's window, if open, shows the new list.
fn tell_komora() {
    use windows::{Win32::UI::WindowsAndMessaging::{FindWindowW, PostMessageW}, core::w};
    unsafe {
        if let Ok(h) = FindWindowW(w!("KomoraWnd"), None) {
            let _ = PostMessageW(Some(h), crate::WM_STATE, windows::Win32::Foundation::WPARAM(0), windows::Win32::Foundation::LPARAM(0));
        }
    }
}

/// (the helper) Starts reading the devices and showing them.
pub fn start_helper() {
    HELPER.store(true, std::sync::atomic::Ordering::Relaxed);
    start();
}

/// (the helper, leaving) The icons go, and Komora's window sees no devices.
pub fn stop_helper() {
    remove_all();
    write_devices(&[]);
    tell_komora();
}

/// A device's tray icon id, the same in every run (FNV-1a of its id; 1 is Komora's own icon).
fn stable_uid(id: &str) -> u32 {
    let h = id.bytes().fold(0x811c9dc5u32, |h, b| (h ^ b as u32).wrapping_mul(0x01000193));
    1000 + h % 1_000_000
}

/// The taskbar is light (dark icons on it).
fn light_taskbar() -> bool {
    crate::sysinfo::reg_num(HKEY_CURRENT_USER, r"Software\Microsoft\Windows\CurrentVersion\Themes\Personalize", "SystemUsesLightTheme") == 1
}

fn nid(uid: u32, flags: NOTIFY_ICON_DATA_FLAGS) -> NOTIFYICONDATAW {
    NOTIFYICONDATAW { cbSize: std::mem::size_of::<NOTIFYICONDATAW>() as u32, hWnd: util::main_hwnd(), uID: uid, uFlags: flags, ..Default::default() }
}

fn tip(d: &Dev) -> String {
    let low = if d.charging { config::tr(" · заряджається", " · charging") } else if d.pct <= 20 { config::tr(" — час заряджати", " — time to charge") } else { "" };
    format!("{}\n{} {} %{low}", d.name, config::tr("Заряд", "Charge"), d.pct)
}

/// Puts the icons in line with the devices and the settings.
fn sync_tray(st: &mut State) {
    let cfg = config::get();
    let want: Vec<Dev> = if cfg.bt_tray { st.devs.iter().filter(|d| !cfg.bt_off.contains(&d.id)).cloned().collect() } else { Vec::new() };
    let gone: Vec<String> = st.shown.keys().filter(|id| !want.iter().any(|d| &d.id == *id)).cloned().collect();
    for id in gone {
        if let Some((uid, _)) = st.shown.remove(&id) {
            unsafe {
                let _ = Shell_NotifyIconW(NIM_DELETE, &nid(uid, NOTIFY_ICON_DATA_FLAGS(0)));
            }
        }
    }
    let (light, size) = (light_taskbar(), unsafe { GetSystemMetrics(SM_CXSMICON) });
    for d in want {
        let look = (d.kind, d.pct, d.charging, light, size);
        let had = st.shown.get(&d.id).copied();
        if had.is_some_and(|(_, l)| l == look) {
            // only the name may have changed
            let mut n = nid(had.unwrap().0, NIF_TIP | NIF_SHOWTIP);
            util::copy_wide(&mut n.szTip, &tip(&d));
            unsafe {
                let _ = Shell_NotifyIconW(NIM_MODIFY, &n);
            }
            continue;
        }
        let Some(icon) = crate::glyph::battery_icon(d.kind, d.pct, d.charging, light, size) else { continue };
        // the same id for a device every time: Windows remembers per icon whether it stays on the taskbar
        let uid = had.map_or_else(|| stable_uid(&d.id), |h| h.0);
        let mut n = nid(uid, NIF_MESSAGE | NIF_ICON | NIF_TIP | NIF_SHOWTIP);
        n.uCallbackMessage = crate::WM_TRAY;
        n.hIcon = icon;
        util::copy_wide(&mut n.szTip, &tip(&d));
        let ok = unsafe { if had.is_some() { Shell_NotifyIconW(NIM_MODIFY, &n).as_bool() } else { Shell_NotifyIconW(NIM_ADD, &n).as_bool() } };
        unsafe {
            let _ = DestroyIcon(icon);
        }
        if ok {
            st.shown.insert(d.id.clone(), (uid, look));
        }
    }
}

/// The note a device's charge calls for now (0 — none, 1 — low, 2 — almost empty), against what was given.
/// One per step and discharge: a device that reports its charge in coarse steps (33 % → 0 %) still gets one,
/// the stronger; charging or 30 % and more starts a new discharge.
pub fn low_step(pct: u8, charging: bool, given: u8) -> (u8, u8) {
    if charging || pct >= 30 {
        return (0, 0);
    }
    let want = if pct <= 10 { 2 } else if pct <= 20 { 1 } else { 0 };
    if want > given { (want, want) } else { (0, given) }
}

/// Notes of a low charge, from the device's own tray icon: its drawing large, the name, the percent.
fn note_low(st: &mut State) {
    let cfg = config::get();
    if !cfg.bt_tray || !cfg.bt_low {
        return;
    }
    let devs = st.devs.clone();
    st.noted.retain(|id, _| devs.iter().any(|d| &d.id == id));
    for d in devs {
        let Some(&(uid, _)) = st.shown.get(&d.id) else { continue };
        let given = st.noted.get(&d.id).copied().unwrap_or(0);
        let (show, keep) = low_step(d.pct, d.charging, given);
        st.noted.insert(d.id.clone(), keep);
        if show == 0 {
            continue;
        }
        let mut n = nid(uid, NIF_INFO);
        util::copy_wide(&mut n.szInfoTitle, &format!("{} · {} %", d.name, d.pct));
        util::copy_wide(&mut n.szInfo, if show == 2 { config::tr("Майже розряджено — постав на заряджання", "Almost empty — put it on charge") } else { config::tr("Час заряджати", "Time to charge") });
        let big = crate::glyph::battery_icon(d.kind, d.pct, false, false, 64);
        n.dwInfoFlags = if big.is_some() { NIIF_USER | NIIF_LARGE_ICON | NIIF_RESPECT_QUIET_TIME } else { NIIF_RESPECT_QUIET_TIME };
        if let Some(i) = big {
            n.hBalloonIcon = i;
        }
        unsafe {
            let _ = Shell_NotifyIconW(NIM_MODIFY, &n);
            if let Some(i) = big {
                let _ = DestroyIcon(i);
            }
        }
    }
}

/// Reads the devices and updates the icons; the window hears of a change.
fn refresh() {
    let mut devs = scan();
    // Logitech devices on their receivers and Sony controllers; one also on Bluetooth is shown once
    crate::logi::listen();
    for d in crate::logi::scan().into_iter().chain(crate::sony::scan()) {
        if !devs.iter().any(|x| x.name.eq_ignore_ascii_case(&d.name)) {
            devs.push(d);
        }
    }
    let mut st = STATE.lock().unwrap();
    let changed = !st.scanned || st.devs != devs;
    st.devs = devs;
    st.scanned = true;
    sync_tray(&mut st);
    note_low(&mut st);
    drop(st);
    if changed {
        if let Ok(st) = STATE.lock() {
            write_devices(&st.devs);
        }
        tell_komora();
    }
}

/// Starts the worker: a read every 10 s while the icons are on (charging starts or stops, a receiver's device
/// turns off — nothing tells Windows), and whenever woken by a device change; wakes close together are read
/// once.
pub fn start() {
    let _ = std::thread::Builder::new().name("komora-bt".into()).spawn(|| {
        unsafe {
            let _ = CoInitializeEx(None, COINIT_MULTITHREADED);
        }
        loop {
            let on = config::get().bt_tray;
            if on || !STATE.lock().unwrap().scanned {
                refresh();
            }
            let (m, cv) = &WAKE;
            let woke = m.lock().unwrap();
            let (mut woke, _) = cv.wait_timeout_while(woke, Duration::from_secs(if on { 10 } else { 3600 }), |w| !*w).unwrap();
            if *woke {
                *woke = false;
                drop(woke);
                // a connection brings several device changes in a row: read once they settle
                std::thread::sleep(Duration::from_millis(1500));
                *m.lock().unwrap() = false;
                if config::get().bt_tray {
                    refresh();
                } else {
                    // off: no reading, only the icons go
                    sync_tray(&mut STATE.lock().unwrap());
                }
            }
        }
    });
}

/// Reads the devices again soon (settings changed, the window asks, the taskbar's theme changed).
pub fn wake() {
    let (m, cv) = &WAKE;
    *m.lock().unwrap() = true;
    cv.notify_one();
}

/// The device a tray icon stands for.
pub fn device_of(uid: u32) -> Option<(String, String)> {
    let st = STATE.lock().unwrap();
    let id = st.shown.iter().find(|(_, (u, _))| *u == uid).map(|(id, _)| id.clone())?;
    let name = st.devs.iter().find(|d| d.id == id).map(|d| d.name.clone()).unwrap_or_default();
    Some((id, name))
}

/// Explorer restarted: every icon is added again.
pub fn readd() {
    STATE.lock().unwrap().shown.clear();
    wake();
}

/// Removes the icons (exit).
pub fn remove_all() {
    let mut st = STATE.lock().unwrap();
    for (_, (uid, _)) in st.shown.drain() {
        unsafe {
            let _ = Shell_NotifyIconW(NIM_DELETE, &nid(uid, NOTIFY_ICON_DATA_FLAGS(0)));
        }
    }
}

/// (Komora) The devices for the window, as the helper last wrote them: [{id, name, kind, pct, charging, tray}].
pub fn json() -> Value {
    let cfg = config::get();
    if !cfg.bt_tray {
        return Value::Array(Vec::new());
    }
    let list: Vec<Value> = std::fs::read_to_string(devices_file()).ok().and_then(|s| serde_json::from_str(&s).ok()).unwrap_or_default();
    Value::Array(
        list.into_iter()
            .map(|mut d| {
                let id = d["id"].as_str().unwrap_or_default().to_string();
                d["tray"] = json!(!cfg.bt_off.contains(&id));
                d
            })
            .collect(),
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn low_notes() {
        // 50 → 18 → 15 → 9 → charging → 15: low, nothing, almost empty, reset, low again
        let mut g = 0;
        let mut seen = Vec::new();
        for (pct, ch) in [(50, false), (18, false), (15, false), (9, false), (40, true), (15, false)] {
            let (show, keep) = low_step(pct, ch, g);
            g = keep;
            seen.push(show);
        }
        assert_eq!(seen, [0, 1, 0, 2, 0, 1]);
        // coarse steps: 33 → 0 gives the stronger note once
        assert_eq!(low_step(0, false, 0), (2, 2));
        assert_eq!(low_step(0, false, 2), (0, 2));
        // 25 % is no new discharge yet: no second «low»
        assert_eq!(low_step(25, false, 1), (0, 1));
    }

    #[test]
    fn kinds() {
        let set = |c: &[&str]| c.iter().map(|s| s.to_string()).collect::<HashSet<_>>();
        // Sony earbuds share the vendor id with Sony controllers: the classes decide
        assert_eq!(kind_of("Input.Keyboard", &set(&["bluetooth"]), "", "yz75pro5.0"), "kbd");
        assert_eq!(kind_of("", &set(&["media", "bluetooth", "system"]), "BTHENUM\\{0000110b}_VID&0002054c_PID&0edb", "LinkBuds Fit"), "audio");
        assert_eq!(kind_of("", &set(&["hidclass", "bluetooth"]), "HID\\{00001124}_VID&0002054C_PID&0CE6|HID_DEVICE_SYSTEM_GAME", "DualSense Wireless Controller"), "pad");
        assert_eq!(kind_of("", &set(&["hidclass", "keyboard", "bluetooth"]), "", "yz75pro5.0"), "kbd");
        assert_eq!(kind_of("", &set(&["hidclass", "mouse"]), "", "MX Anywhere 3"), "mouse");
        assert_eq!(kind_of("", &set(&["bluetooth"]), "", "Some Tag"), "bt");
        assert_eq!(clean_name("LinkBuds Fit Hands-Free AG"), "LinkBuds Fit");
    }

    /// This PC's devices: `cargo test -- --ignored live_bt --nocapture`.
    #[test]
    #[ignore]
    fn live_bt() {
        for d in scan() {
            println!("{d:?}");
        }
    }
}

