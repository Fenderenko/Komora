//! Xbox and other XInput gamepads (an Xbox Wireless Adapter, 8BitDo and the like in XInput mode): the battery
//! Windows itself reports through XInput — four steps (empty, low, medium, full); a wired pad has none.

use windows::Win32::UI::Input::XboxController::{BATTERY_DEVTYPE_GAMEPAD, BATTERY_TYPE_ALKALINE, BATTERY_TYPE_NIMH, XINPUT_BATTERY_INFORMATION, XINPUT_STATE, XInputGetBatteryInformation, XInputGetState};

use crate::btbatt::Dev;

/// A battery step as percent (the middle of each step; «empty» low enough for the 10 % note).
pub fn step_pct(level: u8) -> u8 {
    match level {
        0 => 5,
        1 => 25,
        2 => 60,
        _ => 100,
    }
}

/// (any thread; ~µs) The XInput pads on batteries now, by their slot (1–4).
pub fn scan() -> Vec<Dev> {
    let mut out = Vec::new();
    for i in 0..4u32 {
        let mut st = XINPUT_STATE::default();
        // ERROR_SUCCESS: a pad in this slot
        if unsafe { XInputGetState(i, &mut st) } != 0 {
            continue;
        }
        let mut b = XINPUT_BATTERY_INFORMATION::default();
        if unsafe { XInputGetBatteryInformation(i, BATTERY_DEVTYPE_GAMEPAD, &mut b) } != 0 {
            continue;
        }
        if b.BatteryType != BATTERY_TYPE_ALKALINE && b.BatteryType != BATTERY_TYPE_NIMH {
            continue;
        }
        let name = if i == 0 { "Xbox / XInput".to_string() } else { format!("Xbox / XInput {}", i + 1) };
        out.push(Dev { id: format!("xinput:{i}"), name, kind: "pad", pct: step_pct(b.BatteryLevel.0), charging: false });
    }
    out
}

#[cfg(test)]
mod tests {
    #[test]
    fn steps() {
        assert_eq!([0, 1, 2, 3].map(super::step_pct), [5, 25, 60, 100]);
    }

    /// This PC's XInput pads: `cargo test -- --ignored live_xinput --nocapture`.
    #[test]
    #[ignore]
    fn live_xinput() {
        for d in super::scan() {
            println!("{d:?}");
        }
    }
}
