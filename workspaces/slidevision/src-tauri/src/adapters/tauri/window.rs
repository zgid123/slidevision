use objc2_app_kit::{NSWindow, NSWindowButton};
use tauri::{App, Manager};

pub fn hide_traffic_lights(app: &App) -> tauri::Result<()> {
    let Some(window) = app.get_webview_window("main") else {
        return Ok(());
    };
    let ns_window = window.ns_window()?.cast::<NSWindow>();
    let ns_window = unsafe { &*ns_window };

    for kind in [
        NSWindowButton::CloseButton,
        NSWindowButton::MiniaturizeButton,
        NSWindowButton::ZoomButton,
    ] {
        if let Some(button) = ns_window.standardWindowButton(kind) {
            button.setHidden(true);
        }
    }

    Ok(())
}
