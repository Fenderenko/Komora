//! Windows resources for the exe: the icon (drawn here: a light cabinet with a shelf on a warm grey tile with a
//! hairline rim, as the cards of the window) and the
//! version info. Written as a .res file that link.exe takes directly; the version comes from
//! Cargo.toml.

use std::{env, fs, path::PathBuf};

const RT_ICON: u16 = 3;
const RT_GROUP_ICON: u16 = 14;
const RT_VERSION: u16 = 16;
const LANG_EN: u16 = 0x0409;
const SIZES: [u32; 8] = [16, 20, 24, 32, 40, 48, 64, 256];

fn main() {
    println!("cargo:rerun-if-changed=build.rs");
    if env::var("CARGO_CFG_TARGET_OS").as_deref() != Ok("windows") {
        return;
    }
    let ver = env::var("CARGO_PKG_VERSION").unwrap();
    let icons: Vec<(u32, Vec<u8>)> = SIZES.iter().map(|&s| (s, dib(s))).collect();
    let mut res = Vec::new();
    res.extend(entry(0, 0, 0, &[]));
    for (i, (_, d)) in icons.iter().enumerate() {
        res.extend(entry(RT_ICON, i as u16 + 1, 0, d));
    }
    res.extend(entry(RT_GROUP_ICON, 1, 0, &group_icon(&icons)));
    res.extend(entry(RT_VERSION, 1, LANG_EN, &version_info(&ver)));
    let out = PathBuf::from(env::var("OUT_DIR").unwrap()).join("komora.res");
    fs::write(&out, res).unwrap();
    println!("cargo:rustc-link-arg-bins={}", out.display());
}

/// Coverage-weighted colour of one pixel (4×4 samples): tile with a rim (32 px and larger), cabinet outline
/// with a shelf.
fn pixel(s: f32, px: f32, py: f32) -> [f32; 4] {
    let (tile, ink, rim) = ([0x1C as f32, 0x1B as f32, 0x19 as f32], [0xEC as f32, 0xE9 as f32, 0xE2 as f32], [0x34 as f32, 0x33 as f32, 0x2F as f32]);
    // a rim narrower than a pixel only blurs the edge of the small sizes
    let rim_w = if s >= 32.0 { (s / 64.0).max(1.0) } else { 0.0 };
    let rad = 0.22 * s;
    let (half, r_box, stroke) = (0.27 * s, 0.07 * s, (0.075 * s).max(1.2));
    let mut acc = [0f32; 4];
    for sy in 0..4 {
        for sx in 0..4 {
            let x = px + (sx as f32 + 0.5) / 4.0;
            let y = py + (sy as f32 + 0.5) / 4.0;
            // rounded tile
            let qx = (x - s / 2.0).abs() - (s / 2.0 - rad);
            let qy = (y - s / 2.0).abs() - (s / 2.0 - rad);
            let edge = (qx.max(0.0).powi(2) + qy.max(0.0).powi(2)).sqrt() + qx.max(qy).min(0.0) - rad;
            if edge > 0.0 {
                continue;
            }
            let base = if edge > -rim_w { rim } else { tile };
            // cabinet: rounded square outline and a shelf across it
            let bx = (x - s / 2.0).abs() - (half - r_box);
            let by = (y - s / 2.0).abs() - (half - r_box);
            let d = (bx.max(0.0).powi(2) + by.max(0.0).powi(2)).sqrt() + bx.max(by).min(0.0) - r_box;
            let shelf = (y - 0.47 * s).abs() < stroke / 2.0 && (x - s / 2.0).abs() < half;
            let k = if d.abs() < stroke / 2.0 || shelf { 1.0 } else { 0.0 };
            for c in 0..3 {
                acc[c] += base[c] + (ink[c] - base[c]) * k;
            }
            acc[3] += 255.0;
        }
    }
    acc.map(|v| v / 16.0)
}

/// One icon image as a DIB: BITMAPINFOHEADER, BGRA rows bottom-up, empty AND mask.
fn dib(s: u32) -> Vec<u8> {
    let mask_row = s.div_ceil(32) * 4;
    let mut b = Vec::new();
    for v in [40u32, s, s * 2] {
        b.extend(v.to_le_bytes());
    }
    b.extend(1u16.to_le_bytes());
    b.extend(32u16.to_le_bytes());
    for v in [0u32, s * s * 4 + mask_row * s, 0, 0, 0, 0] {
        b.extend(v.to_le_bytes());
    }
    for y in (0..s).rev() {
        for x in 0..s {
            let p = pixel(s as f32, x as f32, y as f32);
            let a = p[3];
            // premultiplied by coverage → straight alpha
            let un = |c: f32| if a > 0.0 { (c * 255.0 / a).round().clamp(0.0, 255.0) as u8 } else { 0 };
            let (r, g, bl) = (un(p[0]), un(p[1]), un(p[2]));
            b.extend([bl, g, r, a.round() as u8]);
        }
    }
    b.extend(std::iter::repeat_n(0u8, (mask_row * s) as usize));
    b
}

fn group_icon(icons: &[(u32, Vec<u8>)]) -> Vec<u8> {
    let mut b = Vec::new();
    for v in [0u16, 1, icons.len() as u16] {
        b.extend(v.to_le_bytes());
    }
    for (i, (s, d)) in icons.iter().enumerate() {
        let wh = if *s >= 256 { 0 } else { *s as u8 };
        b.extend([wh, wh, 0, 0]);
        b.extend(1u16.to_le_bytes());
        b.extend(32u16.to_le_bytes());
        b.extend((d.len() as u32).to_le_bytes());
        b.extend((i as u16 + 1).to_le_bytes());
    }
    b
}

fn pad4(b: &mut Vec<u8>) {
    while b.len() % 4 != 0 {
        b.push(0);
    }
}

/// One resource of a .res file: header (type and name by number) and data, both DWORD aligned.
fn entry(typ: u16, id: u16, lang: u16, data: &[u8]) -> Vec<u8> {
    let mut hdr = Vec::new();
    hdr.extend((data.len() as u32).to_le_bytes());
    hdr.extend(32u32.to_le_bytes());
    hdr.extend([0xFF, 0xFF]);
    hdr.extend(typ.to_le_bytes());
    hdr.extend([0xFF, 0xFF]);
    hdr.extend(id.to_le_bytes());
    hdr.extend(0u32.to_le_bytes());
    let flags: u16 = if typ == 0 { 0 } else { 0x1030 };
    hdr.extend(flags.to_le_bytes());
    hdr.extend(lang.to_le_bytes());
    hdr.extend(0u32.to_le_bytes());
    hdr.extend(0u32.to_le_bytes());
    hdr.extend(data);
    pad4(&mut hdr);
    hdr
}

fn utf16z(s: &str) -> Vec<u8> {
    s.encode_utf16().chain([0]).flat_map(|c| c.to_le_bytes()).collect()
}

/// VS_VERSIONINFO node: wLength, wValueLength, wType, szKey, padding, value, padding, children.
fn ver_node(key: &str, value: &[u8], text: bool, value_len: Option<u16>, children: &[Vec<u8>]) -> Vec<u8> {
    let mut b = vec![0, 0, 0, 0];
    b.extend((text as u16).to_le_bytes());
    b.extend(utf16z(key));
    pad4(&mut b);
    b.extend(value);
    for c in children {
        pad4(&mut b);
        b.extend(c);
    }
    let len = b.len() as u16;
    let vl = value_len.unwrap_or(value.len() as u16);
    b[0..2].copy_from_slice(&len.to_le_bytes());
    b[2..4].copy_from_slice(&vl.to_le_bytes());
    b
}

fn version_info(ver: &str) -> Vec<u8> {
    let mut nums: Vec<u32> = ver.split('-').next().unwrap().split('.').filter_map(|x| x.parse().ok()).take(4).collect();
    nums.resize(4, 0);
    let (ms, ls) = ((nums[0] << 16) | nums[1], (nums[2] << 16) | nums[3]);
    let mut fixed = Vec::new();
    for v in [0xFEEF04BDu32, 0x00010000, ms, ls, ms, ls, 0x3F, 0, 0x40004, 1, 0, 0, 0] {
        fixed.extend(v.to_le_bytes());
    }
    let strings = [
        ("CompanyName", "Fenderenko"),
        ("FileDescription", "Komora"),
        ("FileVersion", ver),
        ("InternalName", "Komora"),
        ("OriginalFilename", "Komora.exe"),
        ("ProductName", "Komora"),
        ("ProductVersion", ver),
    ];
    let nodes: Vec<Vec<u8>> = strings.iter().map(|(k, v)| ver_node(k, &utf16z(v), true, Some(v.encode_utf16().count() as u16 + 1), &[])).collect();
    let table = ver_node("040904B0", &[], true, None, &nodes);
    let sfi = ver_node("StringFileInfo", &[], true, None, &[table]);
    let mut tr = Vec::new();
    tr.extend(LANG_EN.to_le_bytes());
    tr.extend(0x04B0u16.to_le_bytes());
    let var = ver_node("Translation", &tr, false, None, &[]);
    let vfi = ver_node("VarFileInfo", &[], true, None, &[var]);
    ver_node("VS_VERSION_INFO", &fixed, false, None, &[sfi, vfi])
}
