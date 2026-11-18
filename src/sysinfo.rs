//! What this PC is: Windows, processor, video cards, memory, disks, motherboard and BIOS (for the dashboard and «For PC»).

use serde_json::{Value, json};
use std::{
    collections::HashMap,
    sync::{Mutex, OnceLock},
};
use windows::{
    Win32::{
        Storage::FileSystem::{GetDiskFreeSpaceExW, GetDriveTypeW, GetLogicalDrives, GetVolumeInformationW},
        System::{
            Registry::{HKEY, HKEY_LOCAL_MACHINE, RRF_RT_DWORD, RRF_RT_QWORD, RRF_RT_REG_SZ, RegGetValueW},
            SystemInformation::{GlobalMemoryStatusEx, MEMORYSTATUSEX},
        },
    },
    core::{HSTRING, PCWSTR},
};

const DRIVE_FIXED: u32 = 3;

pub(crate) fn reg_str(root: HKEY, path: &str, name: &str) -> String {
    let (p, n) = (HSTRING::from(path), HSTRING::from(name));
    let mut len = 0u32;
    if unsafe { RegGetValueW(root, &p, &n, RRF_RT_REG_SZ, None, None, Some(&mut len)) }.is_err() || len < 2 {
        return String::new();
    }
    let mut buf = vec![0u16; len as usize / 2 + 1];
    if unsafe { RegGetValueW(root, &p, &n, RRF_RT_REG_SZ, None, Some(buf.as_mut_ptr() as *mut _), Some(&mut len)) }.is_err() {
        return String::new();
    }
    let end = buf.iter().position(|&c| c == 0).unwrap_or(buf.len());
    String::from_utf16_lossy(&buf[..end]).trim().to_string()
}

fn reg_num(root: HKEY, path: &str, name: &str) -> u64 {
    let (p, n) = (HSTRING::from(path), HSTRING::from(name));
    let mut v = 0u64;
    let mut len = 8u32;
    if unsafe { RegGetValueW(root, &p, &n, RRF_RT_QWORD | RRF_RT_DWORD, None, Some(&mut v as *mut u64 as *mut _), Some(&mut len)) }.is_err() {
        return 0;
    }
    if len == 4 { v & 0xffff_ffff } else { v }
}

/// Processor details: physical cores (performance and efficient ones on hybrid chips), threads, L3 cache.
struct CpuTopo {
    cores: usize,
    pcores: usize,
    threads: usize,
    l3: u64,
}

fn cpu_topology() -> CpuTopo {
    use windows::Win32::System::SystemInformation::{GetLogicalProcessorInformationEx, LOGICAL_PROCESSOR_RELATIONSHIP};
    const ALL: LOGICAL_PROCESSOR_RELATIONSHIP = LOGICAL_PROCESSOR_RELATIONSHIP(0xffff);
    let mut t = CpuTopo { cores: 0, pcores: 0, threads: 0, l3: 0 };
    let mut len = 0u32;
    let _ = unsafe { GetLogicalProcessorInformationEx(ALL, None, &mut len) };
    if len == 0 {
        return t;
    }
    let mut buf = vec![0u64; len as usize / 8 + 1];
    if unsafe { GetLogicalProcessorInformationEx(ALL, Some(buf.as_mut_ptr() as *mut _), &mut len) }.is_err() {
        return t;
    }
    let b = unsafe { std::slice::from_raw_parts(buf.as_ptr() as *const u8, len as usize) };
    let u16_at = |o: usize| u16::from_le_bytes([b[o], b[o + 1]]);
    let u32_at = |o: usize| u32::from_le_bytes([b[o], b[o + 1], b[o + 2], b[o + 3]]);
    let mut classes = Vec::new();
    let mut o = 0;
    // SYSTEM_LOGICAL_PROCESSOR_INFORMATION_EX: Relationship (u32), Size (u32), then the relationship's own data
    while o + 8 <= b.len() {
        let (rel, size) = (u32_at(o), u32_at(o + 4) as usize);
        if size < 8 || o + size > b.len() {
            break;
        }
        match rel {
            // PROCESSOR_RELATIONSHIP: Flags, EfficiencyClass, 20 reserved bytes, GroupCount, GROUP_AFFINITY[] (16 bytes each)
            0 if size >= 48 => {
                t.cores += 1;
                classes.push(b[o + 9]);
                for g in 0..u16_at(o + 30) as usize {
                    let m = o + 32 + g * 16;
                    if m + 8 <= o + size {
                        t.threads += u64::from_le_bytes(b[m..m + 8].try_into().unwrap()).count_ones() as usize;
                    }
                }
            }
            // CACHE_RELATIONSHIP: Level, Associativity, LineSize (u16), CacheSize (u32)
            2 if size >= 16 && b[o + 8] == 3 => t.l3 += u32_at(o + 12) as u64,
            _ => {}
        }
        o += size;
    }
    // hybrid chips: the highest efficiency class marks the performance cores
    let top = classes.iter().copied().max().unwrap_or(0);
    if classes.iter().any(|&c| c != top) {
        t.pcores = classes.iter().filter(|&&c| c == top).count();
    }
    t
}

/// "x64" or "ARM64": the processor itself, not this build.
fn native_arch() -> &'static str {
    use windows::Win32::System::SystemInformation::{GetNativeSystemInfo, SYSTEM_INFO};
    let mut si = SYSTEM_INFO::default();
    unsafe { GetNativeSystemInfo(&mut si) };
    match unsafe { si.Anonymous.Anonymous.wProcessorArchitecture.0 } {
        9 => "x64",
        12 => "ARM64",
        0 => "x86",
        _ => "",
    }
}

/// The core design by CPUID family and model ("Zen 4", "Raptor Lake"; "" — unknown).
#[cfg(target_arch = "x86_64")]
fn microarch() -> String {
    use std::arch::x86_64::__cpuid;
    let r0 = __cpuid(0);
    let vendor: Vec<u8> = [r0.ebx, r0.edx, r0.ecx].iter().flat_map(|r| r.to_le_bytes()).collect();
    let eax = __cpuid(1).eax;
    let base = (eax >> 8) & 0xF;
    let family = if base == 0xF { base + ((eax >> 20) & 0xFF) } else { base };
    let model = if base == 6 || base == 0xF { ((eax >> 4) & 0xF) | ((eax >> 12) & 0xF0) } else { (eax >> 4) & 0xF };
    uarch_name(&vendor, family, model).to_string()
}

#[cfg(not(target_arch = "x86_64"))]
fn microarch() -> String {
    String::new()
}

fn uarch_name(vendor: &[u8], family: u32, model: u32) -> &'static str {
    match (vendor, family) {
        (b"AuthenticAMD", 0x17) => match model {
            0x01 | 0x11 | 0x20 => "Zen",
            0x08 | 0x18 => "Zen+",
            0x31 | 0x47 | 0x60 | 0x68 | 0x71 | 0x84 | 0x90 | 0x98 | 0xA0 => "Zen 2",
            _ => "",
        },
        (b"AuthenticAMD", 0x19) => match model {
            0x00..=0x0F | 0x20..=0x2F | 0x40..=0x5F => "Zen 3",
            0x10..=0x1F | 0x60..=0x7F | 0xA0..=0xAF => "Zen 4",
            _ => "",
        },
        (b"AuthenticAMD", 0x1A) => "Zen 5",
        (b"GenuineIntel", 6) => match model {
            0x3C | 0x3F | 0x45 | 0x46 => "Haswell",
            0x3D | 0x47 | 0x4F | 0x56 => "Broadwell",
            0x4E | 0x5E | 0x55 => "Skylake",
            0x8E | 0x9E => "Kaby Lake / Coffee Lake",
            0xA5 | 0xA6 => "Comet Lake",
            0xA7 => "Rocket Lake",
            0x7D | 0x7E | 0x6A | 0x6C => "Ice Lake",
            0x8C | 0x8D => "Tiger Lake",
            0x97 | 0x9A => "Alder Lake",
            0xB7 | 0xBA | 0xBF => "Raptor Lake",
            0xAA | 0xAC => "Meteor Lake",
            0xBD => "Lunar Lake",
            0xC5 | 0xC6 => "Arrow Lake",
            0x8F => "Sapphire Rapids",
            _ => "",
        },
        _ => "",
    }
}

/// Video memory by model: (name fragment, type, bus width in bits); "" or 0 where variants of the model differ.
const VRAM: &[(&str, &str, u32)] = &[
    ("rtx 5090", "GDDR7", 512), ("rtx 5080", "GDDR7", 256), ("rtx 5070 ti", "GDDR7", 256), ("rtx 5070", "GDDR7", 192),
    ("rtx 5060 ti", "GDDR7", 128), ("rtx 5060", "GDDR7", 128), ("rtx 5050", "GDDR6", 128),
    ("rtx 4090", "GDDR6X", 384), ("rtx 4080", "GDDR6X", 256), ("rtx 4070 ti super", "GDDR6X", 256), ("rtx 4070 ti", "GDDR6X", 192),
    ("rtx 4070 super", "GDDR6X", 192), ("rtx 4070", "", 192), ("rtx 4060 ti", "GDDR6", 128), ("rtx 4060", "GDDR6", 128),
    ("rtx 3090", "GDDR6X", 384), ("rtx 3080 ti", "GDDR6X", 384), ("rtx 3080", "GDDR6X", 0), ("rtx 3070 ti", "GDDR6X", 256),
    ("rtx 3070", "GDDR6", 256), ("rtx 3060 ti", "", 256), ("rtx 3060", "GDDR6", 0), ("rtx 3050", "GDDR6", 0),
    ("rtx 2080 ti", "GDDR6", 352), ("rtx 2080", "GDDR6", 256), ("rtx 2070", "GDDR6", 256), ("rtx 2060 super", "GDDR6", 256), ("rtx 2060", "GDDR6", 192),
    ("gtx 1660 ti", "GDDR6", 192), ("gtx 1660 super", "GDDR6", 192), ("gtx 1660", "GDDR5", 192), ("gtx 1650", "", 128),
    ("gtx 1080 ti", "GDDR5X", 352), ("gtx 1080", "GDDR5X", 256), ("gtx 1070", "GDDR5", 256), ("gtx 1060", "GDDR5", 0), ("gtx 1050", "GDDR5", 0),
    ("rx 9070", "GDDR6", 256), ("rx 9060 xt", "GDDR6", 128),
    ("rx 7900 xtx", "GDDR6", 384), ("rx 7900 xt", "GDDR6", 320), ("rx 7900 gre", "GDDR6", 256), ("rx 7800 xt", "GDDR6", 256),
    ("rx 7700 xt", "GDDR6", 192), ("rx 7600", "GDDR6", 128),
    ("rx 6950 xt", "GDDR6", 256), ("rx 6900 xt", "GDDR6", 256), ("rx 6800", "GDDR6", 256), ("rx 6750", "GDDR6", 192), ("rx 6700", "GDDR6", 0),
    ("rx 6650 xt", "GDDR6", 128), ("rx 6600", "GDDR6", 128), ("rx 6500 xt", "GDDR6", 64),
    ("arc b580", "GDDR6", 192), ("arc b570", "GDDR6", 160), ("arc a770", "GDDR6", 256), ("arc a750", "GDDR6", 256), ("arc a580", "GDDR6", 256), ("arc a380", "GDDR6", 96),
];

/// (type, bus) for a video card name; the longest matching fragment wins («rtx 5070 ti» over «rtx 5070»).
fn vram_spec(name: &str) -> (&'static str, u32) {
    let n = name.to_lowercase();
    VRAM.iter().filter(|(k, ..)| n.contains(k)).max_by_key(|(k, ..)| k.len()).map(|&(_, t, b)| (t, b)).unwrap_or(("", 0))
}

/// Memory modules from SMBIOS (type 17): maker, part, type, speed, size and serial of each filled slot; and the serial
/// numbers of the PC (type 1) and the motherboard (type 2).
struct Ram {
    kind: String,
    speed: u32,
    maker: String,
    part: String,
    sticks: Vec<u64>,
    slots: usize,
    stick_serials: Vec<String>,
    pc_serial: String,
    board_serial: String,
}

/// A serial number as firmware fills it, or "" for the placeholders makers leave.
fn real_serial(s: &str) -> String {
    let t = s.trim();
    let l = t.to_lowercase();
    let junk = t.is_empty() || t.chars().all(|c| c == '0' || c == ' ' || c == '.') || ["to be filled", "default string", "system serial", "not specified", "not applicable", "none", "n/a", "unknown", "0123456789", "serial"].iter().any(|j| l.contains(j));
    if junk { String::new() } else { t.to_string() }
}

/// A physical disk: model, maker, serial, the bus, SSD or HDD, the PCIe link of an NVMe drive.
#[derive(Clone, Default)]
struct Disk {
    model: String,
    brand: String,
    serial: String,
    bus: &'static str,
    /// Some(true) — SSD, Some(false) — HDD, None — the disk does not tell
    ssd: Option<bool>,
    pcie: String,
}

const SHARE_RW: windows::Win32::Storage::FileSystem::FILE_SHARE_MODE = windows::Win32::Storage::FileSystem::FILE_SHARE_MODE(1 | 2);

/// A device opened without access rights: enough for the storage queries, no administrator needed.
fn open_device(path: PCWSTR) -> Option<windows::Win32::Foundation::HANDLE> {
    use windows::Win32::Storage::FileSystem::{CreateFileW, FILE_FLAGS_AND_ATTRIBUTES, OPEN_EXISTING};
    unsafe { CreateFileW(path, 0, SHARE_RW, None, OPEN_EXISTING, FILE_FLAGS_AND_ATTRIBUTES(0), None) }.ok()
}

/// An IOCTL into `out`; the bytes returned.
fn ioctl(h: windows::Win32::Foundation::HANDLE, code: u32, input: &[u8], out: &mut [u8]) -> Option<usize> {
    use windows::Win32::System::IO::DeviceIoControl;
    let mut got = 0u32;
    let inp = (!input.is_empty()).then_some(input.as_ptr() as *const core::ffi::c_void);
    unsafe { DeviceIoControl(h, code, inp, input.len() as u32, Some(out.as_mut_ptr() as *mut _), out.len() as u32, Some(&mut got), None) }.ok().map(|_| got as usize)
}

const IOCTL_STORAGE_QUERY_PROPERTY: u32 = 0x002D_1400;
const IOCTL_STORAGE_GET_DEVICE_NUMBER: u32 = 0x002D_1080;
const IOCTL_VOLUME_GET_VOLUME_DISK_EXTENTS: u32 = 0x0056_0000;

/// The maker by the model name as drives report it ("" — not recognised).
fn disk_brand(model: &str) -> &'static str {
    let m = model.to_uppercase();
    let starts = |p: &[&str]| p.iter().any(|x| m.starts_with(x));
    if starts(&["WDC", "WD_", "WD ", "WDS", "WD BLACK", "WD BLUE", "WD GREEN", "WD RED"]) {
        "Western Digital"
    } else if m.contains("SAMSUNG") || starts(&["MZ"]) {
        "Samsung"
    } else if starts(&["CT", "CRUCIAL"]) {
        "Crucial"
    } else if starts(&["KINGSTON", "SKC", "SNV", "SA400", "SA2000", "SFYR", "SNVS"]) {
        "Kingston"
    } else if starts(&["ST"]) && m[2..].starts_with(|c: char| c.is_ascii_digit()) || m.contains("SEAGATE") {
        "Seagate"
    } else if m.contains("TOSHIBA") {
        "Toshiba"
    } else if m.contains("KIOXIA") {
        "Kioxia"
    } else if m.contains("HYNIX") || starts(&["HFS", "HFM"]) {
        "SK hynix"
    } else if m.contains("INTEL") || starts(&["SSDPE", "SSDSC"]) {
        "Intel"
    } else if m.contains("ADATA") || m.contains("XPG") {
        "ADATA"
    } else if m.contains("SABRENT") {
        "Sabrent"
    } else if m.contains("CORSAIR") || starts(&["FORCE MP"]) {
        "Corsair"
    } else if m.contains("T-FORCE") || starts(&["TEAM"]) {
        "TeamGroup"
    } else if m.contains("LEXAR") {
        "Lexar"
    } else if m.contains("HGST") || m.contains("HITACHI") {
        "HGST"
    } else if m.contains("MICRON") || starts(&["MTFD"]) {
        "Micron"
    } else if m.contains("SPATIUM") || starts(&["MSI"]) {
        "MSI"
    } else if m.contains("PATRIOT") {
        "Patriot"
    } else if m.contains("SANDISK") {
        "SanDisk"
    } else if m.contains("PNY") {
        "PNY"
    } else if m.contains("NETAC") {
        "Netac"
    } else {
        ""
    }
}

/// One physical disk by its number: STORAGE_DEVICE_DESCRIPTOR (model, serial, bus) and the seek penalty (HDD or SSD).
fn physical_disk(n: u32) -> Option<Disk> {
    let path = HSTRING::from(format!(r"\\.\PhysicalDrive{n}"));
    let h = open_device(PCWSTR(path.as_ptr()))?;
    let mut buf = vec![0u8; 4096];
    // STORAGE_PROPERTY_QUERY: PropertyId, QueryType (standard), AdditionalParameters
    let q = |id: u32| [id.to_le_bytes(), 0u32.to_le_bytes(), 0u32.to_le_bytes()].concat();
    let got = ioctl(h, IOCTL_STORAGE_QUERY_PROPERTY, &q(0), &mut buf).filter(|&g| g >= 32);
    let mut pen = [0u8; 12];
    // StorageDeviceSeekPenaltyProperty: IncursSeekPenalty at 8
    let seek = ioctl(h, IOCTL_STORAGE_QUERY_PROPERTY, &q(7), &mut pen).filter(|&g| g >= 9).map(|_| pen[8] != 0);
    let _ = unsafe { windows::Win32::Foundation::CloseHandle(h) };
    let got = got?;
    // STORAGE_DEVICE_DESCRIPTOR: ProductIdOffset 16, SerialNumberOffset 24, BusType 28 (zero-terminated strings)
    let u32_at = |o: usize| u32::from_le_bytes(buf[o..o + 4].try_into().unwrap());
    let text = |o: usize| {
        let off = u32_at(o) as usize;
        if off == 0 || off >= got {
            return String::new();
        }
        let end = buf[off..got].iter().position(|&c| c == 0).map_or(got, |p| off + p);
        String::from_utf8_lossy(&buf[off..end]).trim().trim_end_matches('.').trim().to_string()
    };
    let bus = match u32_at(28) {
        17 => "NVMe",
        11 => "SATA",
        7 => "USB",
        10 => "SAS",
        8 => "RAID",
        3 => "ATA",
        1 => "SCSI",
        _ => "",
    };
    let model = text(16);
    Some(Disk { brand: disk_brand(&model).to_string(), model, serial: real_serial(&text(24)), bus, ssd: if bus == "NVMe" { Some(true) } else { seek.map(|p| !p) }, pcie: String::new() })
}

/// A property of a PCI device (DEVPKEY_PciDevice_*: 9 current link speed, 10 current link width).
fn pci_prop(node: u32, pid: u32) -> Option<u32> {
    use windows::Win32::{Devices::DeviceAndDriverInstallation::CM_Get_DevNode_PropertyW, Devices::Properties::DEVPROPTYPE, Foundation::DEVPROPKEY};
    let key = DEVPROPKEY { fmtid: windows::core::GUID::from_u128(0x3ab22e31_8264_4b4e_9af5_a8d2d8e33e62), pid };
    let (mut ty, mut v, mut size) = (DEVPROPTYPE(0), 0u32, 4u32);
    let r = unsafe { CM_Get_DevNode_PropertyW(node, &key, &mut ty, Some(&mut v as *mut u32 as *mut u8), &mut size, 0) };
    (r.0 == 0 && size == 4).then_some(v)
}

/// Disk number → «PCIe 4.0 x4»: the link of the controller above each disk (asked through SetupAPI and the device tree).
fn pcie_links() -> HashMap<u32, String> {
    use windows::Win32::Devices::DeviceAndDriverInstallation::{
        CM_Get_Parent, DIGCF_DEVICEINTERFACE, DIGCF_PRESENT, SP_DEVICE_INTERFACE_DATA, SP_DEVICE_INTERFACE_DETAIL_DATA_W, SP_DEVINFO_DATA, SetupDiDestroyDeviceInfoList, SetupDiEnumDeviceInterfaces,
        SetupDiGetClassDevsW, SetupDiGetDeviceInterfaceDetailW,
    };
    // GUID_DEVINTERFACE_DISK
    let guid = windows::core::GUID::from_u128(0x53f56307_b6bf_11d0_94f2_00a0c91efb8b);
    let mut out = HashMap::new();
    let Ok(set) = (unsafe { SetupDiGetClassDevsW(Some(&guid), PCWSTR::null(), None, DIGCF_PRESENT | DIGCF_DEVICEINTERFACE) }) else { return out };
    for i in 0..32 {
        let mut ifd = SP_DEVICE_INTERFACE_DATA { cbSize: std::mem::size_of::<SP_DEVICE_INTERFACE_DATA>() as u32, ..Default::default() };
        if unsafe { SetupDiEnumDeviceInterfaces(set, None, &guid, i, &mut ifd) }.is_err() {
            break;
        }
        let mut need = 0u32;
        let _ = unsafe { SetupDiGetDeviceInterfaceDetailW(set, &ifd, None, 0, Some(&mut need), None) };
        if need < 8 {
            continue;
        }
        let mut buf = vec![0u64; need as usize / 8 + 2];
        let det = buf.as_mut_ptr() as *mut SP_DEVICE_INTERFACE_DETAIL_DATA_W;
        unsafe { (*det).cbSize = std::mem::size_of::<SP_DEVICE_INTERFACE_DETAIL_DATA_W>() as u32 };
        let mut dev = SP_DEVINFO_DATA { cbSize: std::mem::size_of::<SP_DEVINFO_DATA>() as u32, ..Default::default() };
        if unsafe { SetupDiGetDeviceInterfaceDetailW(set, &ifd, Some(det), need, None, Some(&mut dev)) }.is_err() {
            continue;
        }
        let Some(h) = open_device(PCWSTR(unsafe { std::ptr::addr_of!((*det).DevicePath) } as *const u16)) else { continue };
        // STORAGE_DEVICE_NUMBER: DeviceType, DeviceNumber, PartitionNumber
        let mut num = [0u8; 12];
        let ok = ioctl(h, IOCTL_STORAGE_GET_DEVICE_NUMBER, &[], &mut num).is_some_and(|g| g >= 8);
        let _ = unsafe { windows::Win32::Foundation::CloseHandle(h) };
        if !ok {
            continue;
        }
        let disk = u32::from_le_bytes(num[4..8].try_into().unwrap());
        let mut node = dev.DevInst;
        for _ in 0..3 {
            let mut p = 0u32;
            if unsafe { CM_Get_Parent(&mut p, node, 0) }.0 != 0 {
                break;
            }
            node = p;
            if let Some(speed) = pci_prop(node, 9).filter(|s| (1..=6).contains(s)) {
                let width = pci_prop(node, 10).unwrap_or(0);
                out.insert(disk, format!("PCIe {speed}.0{}", if width > 0 { format!(" x{width}") } else { String::new() }));
                break;
            }
        }
    }
    let _ = unsafe { SetupDiDestroyDeviceInfoList(set) };
    out
}

/// The physical disks of this PC by number (read once).
fn disks() -> &'static Vec<(u32, Disk)> {
    static D: OnceLock<Vec<(u32, Disk)>> = OnceLock::new();
    D.get_or_init(|| {
        let links = pcie_links();
        (0..16)
            .filter_map(|n| {
                let mut d = physical_disk(n)?;
                if d.bus == "NVMe" {
                    d.pcie = links.get(&n).cloned().unwrap_or_default();
                }
                Some((n, d))
            })
            .collect()
    })
}

/// The disk a volume lives on (its first extent).
fn volume_disk(letter: char) -> Option<u32> {
    let path = HSTRING::from(format!(r"\\.\{letter}:"));
    let h = open_device(PCWSTR(path.as_ptr()))?;
    // VOLUME_DISK_EXTENTS: NumberOfDiskExtents, padding, DISK_EXTENT { DiskNumber, … }
    let mut out = [0u8; 64];
    let got = ioctl(h, IOCTL_VOLUME_GET_VOLUME_DISK_EXTENTS, &[], &mut out);
    let _ = unsafe { windows::Win32::Foundation::CloseHandle(h) };
    got.filter(|&g| g >= 12 && u32::from_le_bytes(out[0..4].try_into().unwrap()) > 0).map(|_| u32::from_le_bytes(out[8..12].try_into().unwrap()))
}

fn disk_json(d: &Disk) -> Value {
    // the model often starts with the maker already («WDC» is Western Digital's own short name)
    let model = d.model.strip_prefix("WDC ").unwrap_or(&d.model);
    let name = if d.brand.is_empty() || model.to_uppercase().contains(&d.brand.to_uppercase()) { model.to_string() } else { format!("{} {model}", d.brand) };
    json!({ "name": name, "brand": d.brand, "model": d.model, "serial": d.serial, "bus": d.bus, "media": match d.ssd { Some(true) => "SSD", Some(false) => "HDD", None => "" }, "pcie": d.pcie })
}

fn jedec_maker(s: &str) -> String {
    let t = s.trim();
    let hex = t.chars().all(|c| c.is_ascii_hexdigit()) && t.len() >= 4;
    if !hex {
        return if t.eq_ignore_ascii_case("unknown") || t.is_empty() { String::new() } else { t.to_string() };
    }
    let u = t.to_ascii_uppercase();
    let known = [("04CD", "G.Skill"), ("CD04", "G.Skill"), ("00CE", "Samsung"), ("CE00", "Samsung"), ("80CE", "Samsung"), ("00AD", "SK hynix"), ("AD00", "SK hynix"), ("80AD", "SK hynix"), ("002C", "Micron"), ("2C00", "Micron"), ("802C", "Micron"), ("0198", "Kingston"), ("9801", "Kingston"), ("029E", "Corsair"), ("9E02", "Corsair"), ("859B", "Crucial"), ("9B85", "Crucial"), ("04CB", "ADATA"), ("CB04", "ADATA"), ("0443", "Ramaxel"), ("4304", "Ramaxel"), ("051A", "Patriot"), ("0A5E", "TeamGroup"), ("045B", "Kingmax")];
    known.iter().find(|(k, _)| u.starts_with(k)).map(|(_, v)| v.to_string()).unwrap_or_default()
}

fn ram_modules() -> Ram {
    use windows::Win32::System::SystemInformation::{GetSystemFirmwareTable, RSMB};
    let mut r = Ram { kind: String::new(), speed: 0, maker: String::new(), part: String::new(), sticks: Vec::new(), slots: 0, stick_serials: Vec::new(), pc_serial: String::new(), board_serial: String::new() };
    let n = unsafe { GetSystemFirmwareTable(RSMB, 0, None) } as usize;
    if n < 8 {
        return r;
    }
    let mut buf = vec![0u8; n];
    if unsafe { GetSystemFirmwareTable(RSMB, 0, Some(&mut buf)) } as usize != n {
        return r;
    }
    // RawSMBIOSData: 8 bytes of header, then the table
    let len = u32::from_le_bytes(buf[4..8].try_into().unwrap()) as usize;
    let tab = &buf[8..(8 + len).min(n)];
    let mut o = 0;
    while o + 4 <= tab.len() {
        let (ty, flen) = (tab[o], tab[o + 1] as usize);
        if flen < 4 || o + flen > tab.len() {
            break;
        }
        // the strings follow the formatted area and end with two zero bytes
        let mut e = o + flen;
        while e + 1 < tab.len() && !(tab[e] == 0 && tab[e + 1] == 0) {
            e += 1;
        }
        let strings: Vec<String> = tab[o + flen..e].split(|&c| c == 0).map(|s| String::from_utf8_lossy(s).trim().to_string()).collect();
        let s = |i: usize| if o + i < o + flen { strings.get((tab[o + i] as usize).wrapping_sub(1)).cloned().unwrap_or_default() } else { String::new() };
        let w = |i: usize| if i + 1 < flen { u16::from_le_bytes([tab[o + i], tab[o + i + 1]]) as u32 } else { 0 };
        if ty == 1 && flen >= 0x08 {
            r.pc_serial = real_serial(&s(0x07));
        }
        if ty == 2 && flen >= 0x08 {
            r.board_serial = real_serial(&s(0x07));
        }
        if ty == 17 && flen >= 0x15 {
            r.slots += 1;
            let size = w(0x0C);
            let bytes = match size {
                0 | 0xFFFF => 0,
                0x7FFF if flen >= 0x20 => u32::from_le_bytes(tab[o + 0x1C..o + 0x20].try_into().unwrap()) as u64 * (1 << 20),
                x if x & 0x8000 != 0 => (x & 0x7FFF) as u64 * 1024,
                x => x as u64 * (1 << 20),
            };
            if bytes > 0 {
                r.sticks.push(bytes);
                if r.kind.is_empty() {
                    r.kind = match tab[o + 0x12] {
                        0x18 => "DDR3",
                        0x1A => "DDR4",
                        0x1B => "LPDDR",
                        0x1C => "LPDDR2",
                        0x1D => "LPDDR3",
                        0x1E => "LPDDR4",
                        0x22 => "DDR5",
                        0x23 => "LPDDR5",
                        _ => "",
                    }
                    .into();
                }
                let speed = if flen >= 0x22 && w(0x20) > 0 { w(0x20) } else { w(0x15) };
                r.speed = r.speed.max(speed);
                if r.maker.is_empty() {
                    r.maker = jedec_maker(&s(0x17));
                }
                if r.part.is_empty() && flen > 0x1A {
                    r.part = s(0x1A);
                }
                if flen > 0x18 {
                    r.stick_serials.push(real_serial(&s(0x18)));
                }
            }
        }
        if ty == 127 {
            break;
        }
        o = e + 2;
    }
    r
}

/// Dedicated video memory in use, per adapter (bytes, largest first): the counters Task Manager shows.
fn vram_used() -> Vec<u64> {
    use std::collections::HashMap;
    use windows::Win32::System::Performance::*;
    let mut q = PDH_HQUERY::default();
    if unsafe { PdhOpenQueryW(PCWSTR::null(), 0, &mut q) } != 0 {
        return Vec::new();
    }
    let mut out = Vec::new();
    let mut c = PDH_HCOUNTER::default();
    if unsafe { PdhAddEnglishCounterW(q, windows::core::w!(r"\GPU Adapter Memory(*)\Dedicated Usage"), 0, &mut c) } == 0 && unsafe { PdhCollectQueryData(q) } == 0 {
        let (mut size, mut count) = (0u32, 0u32);
        if unsafe { PdhGetFormattedCounterArrayW(c, PDH_FMT_LARGE, &mut size, &mut count, None) } == PDH_MORE_DATA {
            let mut buf = vec![0u64; size as usize / 8 + 1];
            if unsafe { PdhGetFormattedCounterArrayW(c, PDH_FMT_LARGE, &mut size, &mut count, Some(buf.as_mut_ptr() as *mut PDH_FMT_COUNTERVALUE_ITEM_W)) } == 0 {
                let items = unsafe { std::slice::from_raw_parts(buf.as_ptr() as *const PDH_FMT_COUNTERVALUE_ITEM_W, count as usize) };
                // instances are "luid_0x…_0x…_phys_N": one adapter may have several
                let mut per: HashMap<String, u64> = HashMap::new();
                for it in items {
                    let name = unsafe { it.szName.to_string() }.unwrap_or_default();
                    let luid = name.split("_phys").next().unwrap_or("").to_string();
                    *per.entry(luid).or_default() += unsafe { it.FmtValue.Anonymous.largeValue }.max(0) as u64;
                }
                out = per.into_values().collect();
                out.sort_unstable_by(|a, b| b.cmp(a));
            }
        }
    }
    unsafe { PdhCloseQuery(q) };
    out
}

/// The parts that do not change while Komora runs.
struct Fixed {
    /// when Windows was installed (unix time; a feature update resets it)
    installed: u64,
    windows: String,
    build: String,
    cpu: Value,
    gpus: Vec<Value>,
    board: Value,
    ram: Value,
    serials: Value,
}

fn fixed() -> &'static Fixed {
    static F: OnceLock<Fixed> = OnceLock::new();
    F.get_or_init(|| {
        let nt = r"SOFTWARE\Microsoft\Windows NT\CurrentVersion";
        let build_no: u32 = reg_str(HKEY_LOCAL_MACHINE, nt, "CurrentBuild").parse().unwrap_or(0);
        let mut name = reg_str(HKEY_LOCAL_MACHINE, nt, "ProductName");
        // ProductName still says «Windows 10» on Windows 11
        if build_no >= 22000 {
            name = name.replace("Windows 10", "Windows 11");
        }
        let disp = reg_str(HKEY_LOCAL_MACHINE, nt, "DisplayVersion");
        let installed = reg_num(HKEY_LOCAL_MACHINE, nt, "InstallDate");
        let ubr = reg_num(HKEY_LOCAL_MACHINE, nt, "UBR");
        let cpu = reg_str(HKEY_LOCAL_MACHINE, r"HARDWARE\DESCRIPTION\System\CentralProcessor\0", "ProcessorNameString");
        // video cards: the display adapter class; only real PCI devices (no remote, virtual or basic adapters)
        let class = r"SYSTEM\CurrentControlSet\Control\Class\{4d36e968-e325-11ce-bfc1-08002be10318}";
        let mut gpus: Vec<Value> = Vec::new();
        // a card switched off in the BIOS keeps its driver key: only the cards Windows sees now
        let present = present_displays();
        for i in 0..16 {
            if !present.is_empty() && !present.contains(&format!("{i:04}")) {
                continue;
            }
            let key = format!(r"{class}\{i:04}");
            let dev = reg_str(HKEY_LOCAL_MACHINE, &key, "MatchingDeviceId").to_lowercase();
            if !dev.starts_with(r"pci\ven_") {
                continue;
            }
            let desc = reg_str(HKEY_LOCAL_MACHINE, &key, "DriverDesc");
            if desc.is_empty() || gpus.iter().any(|g| g["name"] == desc) {
                continue;
            }
            let vendor = match &dev[8..12.min(dev.len())] {
                "10de" => "nvidia",
                "1002" => "amd",
                "8086" => "intel",
                _ => "",
            };
            let (mem, bus) = vram_spec(&desc);
            gpus.push(json!({ "name": desc, "vendor": vendor, "vram": reg_num(HKEY_LOCAL_MACHINE, &key, "HardwareInformation.qwMemorySize"), "mem": mem, "bus": bus, "driver": reg_str(HKEY_LOCAL_MACHINE, &key, "DriverVersion"), "date": reg_str(HKEY_LOCAL_MACHINE, &key, "DriverDate") }));
        }
        let bios = r"HARDWARE\DESCRIPTION\System\BIOS";
        let r = |n: &str| reg_str(HKEY_LOCAL_MACHINE, bios, n);
        let board = json!({
            "maker": r("BaseBoardManufacturer"), "model": r("BaseBoardProduct"),
            "sysMaker": r("SystemManufacturer"), "sysModel": r("SystemProductName"),
            "bios": r("BIOSVersion"), "biosDate": r("BIOSReleaseDate"), "biosVendor": r("BIOSVendor"),
        });
        let topo = cpu_topology();
        let threads = if topo.threads > 0 { topo.threads } else { std::thread::available_parallelism().map(|n| n.get()).unwrap_or(0) };
        let cpu = json!({ "name": cpu, "arch": native_arch(), "uarch": microarch(), "cores": topo.cores, "pcores": topo.pcores, "threads": threads, "l3": topo.l3 });
        let m = ram_modules();
        let ram = json!({ "type": m.kind, "speed": m.speed, "maker": m.maker, "part": m.part, "sticks": m.sticks, "slots": m.slots });
        let serials = json!({ "pc": m.pc_serial, "board": m.board_serial, "ram": m.stick_serials, "disks": disks().iter().filter(|d| !d.1.serial.is_empty()).map(|d| json!({ "model": d.1.model, "serial": d.1.serial })).collect::<Vec<_>>() });
        Fixed {
            installed,
            windows: name,
            build: if disp.is_empty() { format!("{build_no}.{ubr}") } else { format!("{disp} · {build_no}.{ubr}") },
            cpu,
            gpus,
            board,
            ram,
            serials,
        }
    })
}

/// Driver keys ("0001") of the display adapters present now (SetupAPI; a card off in the BIOS is not present).
fn present_displays() -> std::collections::HashSet<String> {
    use windows::Win32::Devices::DeviceAndDriverInstallation::{DIGCF_PRESENT, SP_DEVINFO_DATA, SPDRP_DRIVER, SetupDiDestroyDeviceInfoList, SetupDiEnumDeviceInfo, SetupDiGetClassDevsW, SetupDiGetDeviceRegistryPropertyW};
    let guid = windows::core::GUID::from_u128(0x4d36e968_e325_11ce_bfc1_08002be10318);
    let mut out = std::collections::HashSet::new();
    let Ok(set) = (unsafe { SetupDiGetClassDevsW(Some(&guid), PCWSTR::null(), None, DIGCF_PRESENT) }) else { return out };
    for i in 0..32 {
        let mut dev = SP_DEVINFO_DATA { cbSize: std::mem::size_of::<SP_DEVINFO_DATA>() as u32, ..Default::default() };
        if unsafe { SetupDiEnumDeviceInfo(set, i, &mut dev) }.is_err() {
            break;
        }
        let mut buf = [0u8; 512];
        if unsafe { SetupDiGetDeviceRegistryPropertyW(set, &dev, SPDRP_DRIVER, None, Some(&mut buf), None) }.is_ok() {
            let words: Vec<u16> = buf.chunks_exact(2).map(|c| u16::from_le_bytes([c[0], c[1]])).take_while(|&w| w != 0).collect();
            if let Some(k) = String::from_utf16_lossy(&words).rsplit('\\').next() {
                out.insert(k.to_string());
            }
        }
    }
    let _ = unsafe { SetupDiDestroyDeviceInfoList(set) };
    out
}

/// Fixed disks: letter, label, total and free bytes.
fn volumes() -> Vec<Value> {
    let mask = unsafe { GetLogicalDrives() };
    let mut out = Vec::new();
    for i in 0..26u32 {
        if mask & (1 << i) == 0 {
            continue;
        }
        let root: Vec<u16> = format!("{}:\\", (b'A' + i as u8) as char).encode_utf16().chain([0]).collect();
        let p = PCWSTR(root.as_ptr());
        if unsafe { GetDriveTypeW(p) } != DRIVE_FIXED {
            continue;
        }
        let (mut free, mut total) = (0u64, 0u64);
        if unsafe { GetDiskFreeSpaceExW(p, None, Some(&mut total), Some(&mut free)) }.is_err() || total == 0 {
            continue;
        }
        let mut label = [0u16; 64];
        let _ = unsafe { GetVolumeInformationW(p, Some(&mut label), None, None, None, None) };
        let end = label.iter().position(|&c| c == 0).unwrap_or(label.len());
        let letter = (b'A' + i as u8) as char;
        let disk = volume_disk(letter).and_then(|n| disks().iter().find(|d| d.0 == n)).map(|d| disk_json(&d.1));
        out.push(json!({ "letter": format!("{letter}:"), "label": String::from_utf16_lossy(&label[..end]), "total": total, "free": free, "disk": disk }));
    }
    out
}

/// Video memory in use, read at most every 5 s (the page asks for the state often).
fn vram_cached() -> Vec<u64> {
    static C: Mutex<(i64, Vec<u64>)> = Mutex::new((0, Vec::new()));
    let now = crate::util::unix();
    let mut c = C.lock().unwrap();
    if now - c.0 >= 5 {
        *c = (now, vram_used());
    }
    c.1.clone()
}

/// The whole picture for the page (memory and disks are read anew each time; the rest once).
pub fn json() -> Value {
    let f = fixed();
    let mut m = MEMORYSTATUSEX { dwLength: std::mem::size_of::<MEMORYSTATUSEX>() as u32, ..Default::default() };
    let (ram, ram_free) = if unsafe { GlobalMemoryStatusEx(&mut m) }.is_ok() { (m.ullTotalPhys, m.ullAvailPhys) } else { (0, 0) };
    // the busiest adapter's usage goes to the card with the most memory (the counters name adapters by LUID only)
    let mut gpus = f.gpus.clone();
    if let (Some(used), Some(g)) = (vram_cached().first(), gpus.iter_mut().max_by_key(|g| g["vram"].as_u64().unwrap_or(0))) {
        g["vramUsed"] = json!(used);
    }
    json!({
        "windows": f.windows, "build": f.build, "installed": f.installed, "uptime": unsafe { windows::Win32::System::SystemInformation::GetTickCount64() } / 1000, "cpu": f.cpu, "gpus": gpus, "board": f.board,
        "ram": ram, "ramFree": ram_free, "mem": f.ram, "serials": f.serials, "volumes": volumes(),
    })
}

#[cfg(test)]
mod tests {
    #[test]
    fn reads_this_pc() {
        let v = super::json();
        assert!(v["windows"].as_str().unwrap().starts_with("Windows"));
        assert!(v["ram"].as_u64().unwrap() > 0);
        assert!(!v["volumes"].as_array().unwrap().is_empty());
        assert!(v["cpu"]["threads"].as_u64().unwrap() >= v["cpu"]["cores"].as_u64().unwrap());
    }

    #[test]
    fn video_memory_by_model() {
        assert_eq!(super::vram_spec("NVIDIA GeForce RTX 5070 Ti"), ("GDDR7", 256));
        assert_eq!(super::vram_spec("NVIDIA GeForce RTX 5070"), ("GDDR7", 192));
        assert_eq!(super::vram_spec("AMD Radeon RX 7900 XTX"), ("GDDR6", 384));
        assert_eq!(super::vram_spec("AMD Radeon(TM) Graphics"), ("", 0));
        assert_eq!(super::uarch_name(b"AuthenticAMD", 0x19, 0x61), "Zen 4");
        assert_eq!(super::uarch_name(b"GenuineIntel", 6, 0xB7), "Raptor Lake");
    }

    /// How long one reading of the changing values takes (cargo test -- --ignored --nocapture live_cost).
    #[test]
    #[ignore]
    fn live_cost() {
        let _ = super::vram_used();
        for name in ["vram", "json"] {
            let t = std::time::Instant::now();
            for _ in 0..10 {
                if name == "vram" { let _ = super::vram_used(); } else { let _ = super::volumes(); }
            }
            println!("{name}: {:?} per call", t.elapsed() / 10);
        }
    }

    /// Prints what this PC is (cargo test -- --ignored --nocapture this_pc_details).
    #[test]
    #[ignore]
    fn this_pc_details() {
        println!("{:#}", super::json());
    }
}
