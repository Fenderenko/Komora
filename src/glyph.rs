//! Device icons for the tray with a charge bar under the device: SVG path data drawn with Direct2D into
//! a WIC bitmap at the tray's icon size, turned into an HICON. Gamepad and keyboard — Material Symbols
//! (Google, Apache-2.0), mouse, headphones and Bluetooth — Lucide (ISC).

use windows::{
    Win32::{
        Graphics::{
            Direct2D::{
                Common::{D2D_RECT_F, D2D_SIZE_F, D2D1_ALPHA_MODE_PREMULTIPLIED, D2D1_BEZIER_SEGMENT, D2D1_COLOR_F, D2D1_FIGURE_BEGIN_FILLED, D2D1_FIGURE_END_CLOSED, D2D1_FIGURE_END_OPEN, D2D1_FILL_MODE_WINDING, D2D1_PIXEL_FORMAT},
                D2D1_ARC_SEGMENT, D2D1_ARC_SIZE_LARGE, D2D1_ARC_SIZE_SMALL, D2D1_CAP_STYLE_ROUND, D2D1_FACTORY_TYPE_SINGLE_THREADED, D2D1_LINE_JOIN_ROUND, D2D1_QUADRATIC_BEZIER_SEGMENT, D2D1_RENDER_TARGET_PROPERTIES, D2D1_ROUNDED_RECT, D2D1_STROKE_STYLE_PROPERTIES,
                D2D1_SWEEP_DIRECTION_CLOCKWISE, D2D1_SWEEP_DIRECTION_COUNTER_CLOCKWISE, D2D1CreateFactory, ID2D1Factory, ID2D1GeometrySink,
            },
            Dxgi::Common::DXGI_FORMAT_B8G8R8A8_UNORM,
            Gdi::{CreateBitmap, DeleteObject},
            Imaging::{CLSID_WICImagingFactory, GUID_WICPixelFormat32bppPBGRA, IWICImagingFactory, WICBitmapCacheOnLoad},
        },
        System::Com::{CLSCTX_INPROC_SERVER, CoCreateInstance},
        UI::WindowsAndMessaging::{CreateIconIndirect, HICON, ICONINFO},
    },
    core::BOOL,
};
use windows_numerics::{Matrix3x2, Vector2};

/// A drawing: its view box (left, top, side) and paths; `stroke` > 0 — outlined with that width, 0 — filled.
struct Glyph {
    view: (f32, f32, f32),
    paths: &'static [&'static str],
    stroke: f32,
}

const PAD: Glyph = Glyph {
    view: (0.0, -960.0, 960.0),
    paths: &["M189-160q-60 0-102.5-43T42-307q0-9 1-18t3-18l84-336q14-54 57-87.5t98-33.5h390q55 0 98 33.5t57 87.5l84 336q2 9 3.5 18.5T919-306q0 61-43.5 103.5T771-160q-42 0-78-22t-54-60l-28-58q-5-10-15-15t-21-5H385q-11 0-21 5t-15 15l-28 58q-18 38-54 60t-78 22Zm2.66-60q24.34 0 45.01-12.97Q257.33-245.95 268-268l28-57q13-26 36.5-40.5T385-380h190q29 0 52.5 15t37.5 40l28 57q10.67 22.05 31.33 35.03Q745-220 769.26-220 805-220 831-244.5t27-60.5q0-4-3-24l-84-335q-8-33-34.4-54.5T675-740H285q-34.7 0-61.35 21T189-664l-84 335q-1 4-3 23 0 36.48 26.26 61.24Q154.52-220 191.66-220ZM561.5-538.68q8.5-8.67 8.5-21.5 0-12.82-8.68-21.32-8.67-8.5-21.5-8.5-12.82 0-21.32 8.68-8.5 8.67-8.5 21.5 0 12.82 8.68 21.32 8.67 8.5 21.5 8.5 12.82 0 21.32-8.68Zm80-80q8.5-8.67 8.5-21.5 0-12.82-8.68-21.32-8.67-8.5-21.5-8.5-12.82 0-21.32 8.68-8.5 8.67-8.5 21.5 0 12.82 8.68 21.32 8.67 8.5 21.5 8.5 12.82 0 21.32-8.68Zm0 160q8.5-8.67 8.5-21.5 0-12.82-8.68-21.32-8.67-8.5-21.5-8.5-12.82 0-21.32 8.68-8.5 8.67-8.5 21.5 0 12.82 8.68 21.32 8.67 8.5 21.5 8.5 12.82 0 21.32-8.68Zm80-80q8.5-8.67 8.5-21.5 0-12.82-8.68-21.32-8.67-8.5-21.5-8.5-12.82 0-21.32 8.68-8.5 8.67-8.5 21.5 0 12.82 8.68 21.32 8.67 8.5 21.5 8.5 12.82 0 21.32-8.68ZM358-472.08q7-7.09 7-17.92v-45h45q10.83 0 17.92-7.12 7.08-7.11 7.08-18 0-10.88-7.08-17.88-7.09-7-17.92-7h-45v-45q0-10.83-7.12-17.92-7.11-7.08-18-7.08-10.88 0-17.88 7.08-7 7.09-7 17.92v45h-45q-10.83 0-17.92 7.12-7.08 7.11-7.08 18 0 10.88 7.08 17.88 7.09 7 17.92 7h45v45q0 10.83 7.12 17.92 7.11 7.08 18 7.08 10.88 0 17.88-7.08ZM480-480Z"],
    stroke: 0.0,
};
const KEYBOARD: Glyph = Glyph {
    view: (0.0, -960.0, 960.0),
    paths: &["M140-200q-24 0-42-18.5T80-260v-440q0-24 18-42t42-18h680q24 0 42 18t18 42v440q0 23-18 41.5T820-200H140Zm0-60h680v-440H140v440Zm160-65h360v-60H300v60Zm-97-125h60v-60h-60v60Zm124 0h60v-60h-60v60Zm123 0h60v-60h-60v60Zm124 0h60v-60h-60v60Zm123 0h60v-60h-60v60ZM203-575h60v-60h-60v60Zm124 0h60v-60h-60v60Zm123 0h60v-60h-60v60Zm124 0h60v-60h-60v60Zm123 0h60v-60h-60v60ZM140-260v-440 440Z"],
    stroke: 0.0,
};
const MOUSE: Glyph = Glyph { view: (0.0, 0.0, 24.0), paths: &["M12 2a7 7 0 0 1 7 7v6a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7Z", "M12 6v4"], stroke: 2.0 };
const HEADPHONES: Glyph = Glyph { view: (0.0, 0.0, 24.0), paths: &["M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"], stroke: 2.0 };
const BLUETOOTH: Glyph = Glyph { view: (0.0, 0.0, 24.0), paths: &["m7 7 10 10-5 5V2l5 5L7 17"], stroke: 2.0 };

fn glyph(kind: &str) -> &'static Glyph {
    match kind {
        "pad" => &PAD,
        "kbd" => &KEYBOARD,
        "mouse" => &MOUSE,
        "audio" => &HEADPHONES,
        _ => &BLUETOOTH,
    }
}

// ---------------------------------------------------------------- SVG path data

#[derive(Clone, Copy, PartialEq, Debug)]
pub enum Seg {
    Move(f32, f32),
    Line(f32, f32),
    Cubic(f32, f32, f32, f32, f32, f32),
    Quad(f32, f32, f32, f32),
    Arc { rx: f32, ry: f32, rot: f32, large: bool, sweep: bool, x: f32, y: f32 },
    Close,
}

struct Lex<'a> {
    s: &'a [u8],
    i: usize,
}

impl Lex<'_> {
    fn skip(&mut self) {
        while self.i < self.s.len() && (self.s[self.i].is_ascii_whitespace() || self.s[self.i] == b',') {
            self.i += 1;
        }
    }

    /// The next command letter, if one stands here.
    fn cmd(&mut self) -> Option<u8> {
        self.skip();
        let c = *self.s.get(self.i)?;
        (c.is_ascii_alphabetic() && c != b'e' && c != b'E').then(|| {
            self.i += 1;
            c
        })
    }

    fn has_num(&mut self) -> bool {
        self.skip();
        self.s.get(self.i).is_some_and(|c| c.is_ascii_digit() || b"-+.".contains(c))
    }

    /// A number: "-.5", "1e-3"; a second dot starts the next number ("0.5.3" → 0.5, .3).
    fn num(&mut self) -> Option<f32> {
        self.skip();
        let st = self.i;
        if self.s.get(self.i).is_some_and(|c| b"-+".contains(c)) {
            self.i += 1;
        }
        let mut dot = false;
        while let Some(&c) = self.s.get(self.i) {
            if c.is_ascii_digit() {
                self.i += 1;
            } else if c == b'.' && !dot {
                dot = true;
                self.i += 1;
            } else if (c == b'e' || c == b'E') && self.i > st {
                self.i += 1;
                if self.s.get(self.i).is_some_and(|c| b"-+".contains(c)) {
                    self.i += 1;
                }
            } else {
                break;
            }
        }
        std::str::from_utf8(&self.s[st..self.i]).ok()?.parse().ok()
    }

    /// An arc flag: one digit, written with or without a separator ("0 1" or "01").
    fn flag(&mut self) -> Option<bool> {
        self.skip();
        let c = *self.s.get(self.i)?;
        self.i += 1;
        match c {
            b'0' => Some(false),
            b'1' => Some(true),
            _ => None,
        }
    }
}

/// Path data as absolute segments (H, V, S, T and relative commands resolved).
pub fn parse(d: &str) -> Vec<Seg> {
    let mut lx = Lex { s: d.as_bytes(), i: 0 };
    let mut out = Vec::new();
    let (mut x, mut y, mut sx, mut sy) = (0f32, 0f32, 0f32, 0f32);
    // the last control point of a cubic or quadratic curve (for S and T)
    let (mut lc, mut lq): (Option<(f32, f32)>, Option<(f32, f32)>) = (None, None);
    let mut cmd = 0u8;
    loop {
        if let Some(c) = lx.cmd() {
            cmd = c;
        } else if !lx.has_num() || cmd == 0 {
            break;
        }
        let rel = cmd.is_ascii_lowercase();
        let (ox, oy) = if rel { (x, y) } else { (0.0, 0.0) };
        let up = cmd.to_ascii_uppercase();
        let ok = (|| -> Option<()> {
            match up {
                b'M' => {
                    let (nx, ny) = (lx.num()? + ox, lx.num()? + oy);
                    out.push(Seg::Move(nx, ny));
                    (x, y, sx, sy) = (nx, ny, nx, ny);
                    // further pairs after M are lines
                    cmd = if rel { b'l' } else { b'L' };
                    (lc, lq) = (None, None);
                }
                b'L' => {
                    (x, y) = (lx.num()? + ox, lx.num()? + oy);
                    out.push(Seg::Line(x, y));
                    (lc, lq) = (None, None);
                }
                b'H' => {
                    x = lx.num()? + ox;
                    out.push(Seg::Line(x, y));
                    (lc, lq) = (None, None);
                }
                b'V' => {
                    y = lx.num()? + oy;
                    out.push(Seg::Line(x, y));
                    (lc, lq) = (None, None);
                }
                b'C' | b'S' => {
                    let (x1, y1) = if up == b'C' { (lx.num()? + ox, lx.num()? + oy) } else { lc.map_or((x, y), |(cx, cy)| (2.0 * x - cx, 2.0 * y - cy)) };
                    let (x2, y2, nx, ny) = (lx.num()? + ox, lx.num()? + oy, lx.num()? + ox, lx.num()? + oy);
                    out.push(Seg::Cubic(x1, y1, x2, y2, nx, ny));
                    (x, y, lc, lq) = (nx, ny, Some((x2, y2)), None);
                }
                b'Q' | b'T' => {
                    let (x1, y1) = if up == b'Q' { (lx.num()? + ox, lx.num()? + oy) } else { lq.map_or((x, y), |(cx, cy)| (2.0 * x - cx, 2.0 * y - cy)) };
                    let (nx, ny) = (lx.num()? + ox, lx.num()? + oy);
                    out.push(Seg::Quad(x1, y1, nx, ny));
                    (x, y, lq, lc) = (nx, ny, Some((x1, y1)), None);
                }
                b'A' => {
                    let (rx, ry, rot) = (lx.num()?, lx.num()?, lx.num()?);
                    let (large, sweep) = (lx.flag()?, lx.flag()?);
                    (x, y) = (lx.num()? + ox, lx.num()? + oy);
                    out.push(Seg::Arc { rx, ry, rot, large, sweep, x, y });
                    (lc, lq) = (None, None);
                }
                b'Z' => {
                    out.push(Seg::Close);
                    (x, y, lc, lq) = (sx, sy, None, None);
                }
                _ => return None,
            }
            Some(())
        })();
        if ok.is_none() {
            break;
        }
    }
    out
}

fn v(x: f32, y: f32) -> Vector2 {
    Vector2 { X: x, Y: y }
}

/// Feeds segments into a Direct2D sink; a figure is closed by Z or left open by the next M.
unsafe fn feed(sink: &ID2D1GeometrySink, segs: &[Seg]) {
    let mut open = false;
    let mut start = (0f32, 0f32);
    unsafe {
        for s in segs {
            match *s {
                Seg::Move(x, y) => {
                    if open {
                        sink.EndFigure(D2D1_FIGURE_END_OPEN);
                    }
                    sink.BeginFigure(v(x, y), D2D1_FIGURE_BEGIN_FILLED);
                    (open, start) = (true, (x, y));
                }
                Seg::Close => {
                    if open {
                        sink.EndFigure(D2D1_FIGURE_END_CLOSED);
                        open = false;
                    }
                }
                _ if !open => {
                    // a segment right after Z goes on from the start of that figure
                    sink.BeginFigure(v(start.0, start.1), D2D1_FIGURE_BEGIN_FILLED);
                    open = true;
                    feed_one(sink, s);
                }
                _ => feed_one(sink, s),
            }
        }
        if open {
            sink.EndFigure(D2D1_FIGURE_END_OPEN);
        }
    }
}

unsafe fn feed_one(sink: &ID2D1GeometrySink, s: &Seg) {
    unsafe {
        match *s {
            Seg::Line(x, y) => sink.AddLine(v(x, y)),
            Seg::Cubic(a, b, c, d, e, f) => sink.AddBezier(&D2D1_BEZIER_SEGMENT { point1: v(a, b), point2: v(c, d), point3: v(e, f) }),
            Seg::Quad(a, b, c, d) => sink.AddQuadraticBezier(&D2D1_QUADRATIC_BEZIER_SEGMENT { point1: v(a, b), point2: v(c, d) }),
            Seg::Arc { rx, ry, rot, large, sweep, x, y } => sink.AddArc(&D2D1_ARC_SEGMENT {
                point: v(x, y),
                size: D2D_SIZE_F { width: rx, height: ry },
                rotationAngle: rot,
                sweepDirection: if sweep { D2D1_SWEEP_DIRECTION_CLOCKWISE } else { D2D1_SWEEP_DIRECTION_COUNTER_CLOCKWISE },
                arcSize: if large { D2D1_ARC_SIZE_LARGE } else { D2D1_ARC_SIZE_SMALL },
            }),
            Seg::Move(..) | Seg::Close => {}
        }
    }
}

fn rgb(c: u32, a: f32) -> D2D1_COLOR_F {
    D2D1_COLOR_F { r: ((c >> 16) & 255) as f32 / 255.0, g: ((c >> 8) & 255) as f32 / 255.0, b: (c & 255) as f32 / 255.0, a }
}

/// (COM initialised on this thread) The tray icon of a device: its drawing with a charge bar of `pct` %
/// under it (violet while charging, red at 20 % and below), `size` pixels square, dark on a light taskbar.
pub fn battery_icon(kind: &str, pct: u8, charging: bool, light: bool, size: i32) -> Option<HICON> {
    let s = size.max(16) as u32;
    let px = render(kind, pct, charging, light, s)?;
    unsafe {
        let color = CreateBitmap(s as i32, s as i32, 1, 32, Some(px.as_ptr() as *const _));
        let mask_bytes = vec![0u8; (s.div_ceil(16) * 2 * s) as usize];
        let mask = CreateBitmap(s as i32, s as i32, 1, 1, Some(mask_bytes.as_ptr() as *const _));
        let info = ICONINFO { fIcon: BOOL(1), xHotspot: 0, yHotspot: 0, hbmMask: mask, hbmColor: color };
        let icon = CreateIconIndirect(&info).ok();
        let _ = DeleteObject(color.into());
        let _ = DeleteObject(mask.into());
        icon
    }
}

/// The icon's pixels: top-down BGRA with straight alpha.
fn render(kind: &str, pct: u8, charging: bool, light: bool, s: u32) -> Option<Vec<u8>> {
    let sf = s as f32;
    let fg = if light { 0x1b1b1b } else { 0xffffff };
    let low = if light { 0xdc2626 } else { 0xef4444 };
    let charge = if light { 0x7c3aed } else { 0xa78bfa };
    let g = glyph(kind);
    let bar_h = (sf / 8.0).round().max(2.0);
    let gap = (sf / 16.0).round().max(1.0);
    let side = sf - bar_h - gap;
    unsafe {
        let factory: ID2D1Factory = D2D1CreateFactory(D2D1_FACTORY_TYPE_SINGLE_THREADED, None).ok()?;
        let wic: IWICImagingFactory = CoCreateInstance(&CLSID_WICImagingFactory, None, CLSCTX_INPROC_SERVER).ok()?;
        let bmp = wic.CreateBitmap(s, s, &GUID_WICPixelFormat32bppPBGRA, WICBitmapCacheOnLoad).ok()?;
        let props = D2D1_RENDER_TARGET_PROPERTIES { pixelFormat: D2D1_PIXEL_FORMAT { format: DXGI_FORMAT_B8G8R8A8_UNORM, alphaMode: D2D1_ALPHA_MODE_PREMULTIPLIED }, dpiX: 96.0, dpiY: 96.0, ..Default::default() };
        let rt = factory.CreateWicBitmapRenderTarget(&bmp, &props).ok()?;
        let geo = factory.CreatePathGeometry().ok()?;
        let sink = geo.Open().ok()?;
        sink.SetFillMode(D2D1_FILL_MODE_WINDING);
        for p in g.paths {
            feed(&sink, &parse(p));
        }
        sink.Close().ok()?;
        let brush = rt.CreateSolidColorBrush(&rgb(fg, 1.0), None).ok()?;
        rt.BeginDraw();
        rt.Clear(Some(&rgb(0, 0.0)));
        let k = side / g.view.2;
        let ox = (sf - side) / 2.0;
        rt.SetTransform(&Matrix3x2 { M11: k, M12: 0.0, M21: 0.0, M22: k, M31: ox - g.view.0 * k, M32: -g.view.1 * k });
        if g.stroke > 0.0 {
            let st = factory
                .CreateStrokeStyle(&D2D1_STROKE_STYLE_PROPERTIES { startCap: D2D1_CAP_STYLE_ROUND, endCap: D2D1_CAP_STYLE_ROUND, dashCap: D2D1_CAP_STYLE_ROUND, lineJoin: D2D1_LINE_JOIN_ROUND, miterLimit: 10.0, ..Default::default() }, None)
                .ok()?;
            rt.DrawGeometry(&geo, &brush, g.stroke, &st);
        } else {
            rt.FillGeometry(&geo, &brush, None);
        }
        rt.SetTransform(&Matrix3x2 { M11: 1.0, M22: 1.0, ..Default::default() });
        let (x0, x1, y1) = ((sf * 0.08).round(), sf - (sf * 0.08).round(), sf);
        let r = bar_h / 2.0;
        let track = rt.CreateSolidColorBrush(&rgb(fg, 0.3), None).ok()?;
        rt.FillRoundedRectangle(&D2D1_ROUNDED_RECT { rect: D2D_RECT_F { left: x0, top: y1 - bar_h, right: x1, bottom: y1 }, radiusX: r, radiusY: r }, &track);
        let fill = rt.CreateSolidColorBrush(&rgb(if charging { charge } else if pct <= 20 { low } else { fg }, 1.0), None).ok()?;
        let w = ((x1 - x0) * pct.min(100) as f32 / 100.0).max(bar_h);
        rt.FillRoundedRectangle(&D2D1_ROUNDED_RECT { rect: D2D_RECT_F { left: x0, top: y1 - bar_h, right: x0 + w, bottom: y1 }, radiusX: r, radiusY: r }, &fill);
        rt.EndDraw(None, None).ok()?;
        let mut px = vec![0u8; (s * s * 4) as usize];
        bmp.CopyPixels(std::ptr::null(), s * 4, &mut px).ok()?;
        // icons take straight alpha
        for p in px.chunks_exact_mut(4) {
            let a = p[3] as u32;
            if a > 0 && a < 255 {
                for c in &mut p[..3] {
                    *c = ((*c as u32 * 255 + a / 2) / a).min(255) as u8;
                }
            }
        }
        Some(px)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn path_data() {
        let s = parse("M12 2a7 7 0 0 1 7 7v6H5ZM1 1l2 2");
        assert_eq!(s[0], Seg::Move(12.0, 2.0));
        assert_eq!(s[1], Seg::Arc { rx: 7.0, ry: 7.0, rot: 0.0, large: false, sweep: true, x: 19.0, y: 9.0 });
        assert_eq!(s[2], Seg::Line(19.0, 15.0));
        assert_eq!(s[3], Seg::Line(5.0, 15.0));
        assert_eq!(s[4], Seg::Close);
        assert_eq!(s[6], Seg::Line(3.0, 3.0));
        // compact numbers and smooth curves of Material Symbols
        let m = parse("M140-200q-24 0-42-18.5T80-260");
        assert_eq!(m[1], Seg::Quad(116.0, -200.0, 98.0, -218.5));
        assert_eq!(m[2], Seg::Quad(80.0, -237.0, 80.0, -260.0));
        assert_eq!(parse("m7 7 10 10-5 5V2").len(), 4);
        assert_eq!(parse("M0 0l.5.3")[1], Seg::Line(0.5, 0.3));
    }

    /// Every icon at tray sizes on a dark and a light strip, as a BMP: `cargo test -- --ignored icon_sheet`
    /// with KOMORA_ICON_SHEET=<file.bmp>.
    #[test]
    #[ignore]
    fn icon_sheet() {
        let Ok(out) = std::env::var("KOMORA_ICON_SHEET") else { return };
        unsafe {
            let _ = windows::Win32::System::Com::CoInitializeEx(None, windows::Win32::System::Com::COINIT_MULTITHREADED);
        }
        let items = [("pad", 70u8), ("kbd", 81), ("mouse", 12), ("audio", 100), ("bt", 45)];
        let sizes = [16u32, 20, 24, 32, 48];
        let (cell, pad) = (56u32, 4u32);
        let (w, h) = (cell * items.len() as u32, cell * sizes.len() as u32 * 2);
        let mut img = vec![0u8; (w * h * 4) as usize];
        for (row, (light, sz)) in [false, true].iter().flat_map(|l| sizes.iter().map(move |s| (*l, *s))).enumerate() {
            let bg: [u8; 3] = if light { [0xf3, 0xf3, 0xf3] } else { [0x1c, 0x1c, 0x1c] };
            for (col, (k, p)) in items.iter().enumerate() {
                let px = render(k, *p, false, light, sz).unwrap();
                for y in 0..cell {
                    for x in 0..cell {
                        let (ix, iy) = (col as u32 * cell + x, row as u32 * cell + y);
                        let o = ((iy * w + ix) * 4) as usize;
                        let mut c = [bg[2], bg[1], bg[0]];
                        if x >= pad && y >= pad && x - pad < sz && y - pad < sz {
                            let q = (((y - pad) * sz + (x - pad)) * 4) as usize;
                            let a = px[q + 3] as u32;
                            for i in 0..3 {
                                c[i] = ((px[q + i] as u32 * a + c[i] as u32 * (255 - a)) / 255) as u8;
                            }
                        }
                        img[o..o + 3].copy_from_slice(&c);
                        img[o + 3] = 255;
                    }
                }
            }
        }
        // a 32-bit top-down BMP
        let mut f = Vec::new();
        let size = 54 + img.len() as u32;
        f.extend_from_slice(b"BM");
        f.extend_from_slice(&size.to_le_bytes());
        f.extend_from_slice(&[0, 0, 0, 0, 54, 0, 0, 0, 40, 0, 0, 0]);
        f.extend_from_slice(&(w as i32).to_le_bytes());
        f.extend_from_slice(&(-(h as i32)).to_le_bytes());
        f.extend_from_slice(&[1, 0, 32, 0, 0, 0, 0, 0]);
        f.extend_from_slice(&(img.len() as u32).to_le_bytes());
        f.extend_from_slice(&[0; 16]);
        f.extend_from_slice(&img);
        std::fs::write(out, f).unwrap();
    }

    #[test]
    fn every_glyph_parses_whole() {
        for k in ["pad", "kbd", "mouse", "audio", "bt"] {
            for p in glyph(k).paths {
                let segs = parse(p);
                assert!(segs.len() > 1, "{k}");
                let closes = p.matches(['Z', 'z']).count();
                assert_eq!(segs.iter().filter(|s| **s == Seg::Close).count(), closes, "{k}: the whole path is read");
            }
        }
    }
}
