use tauri::menu::{MenuEvent, MenuItem};
use tauri::{AppHandle, Emitter, Wry};

const OPEN_FOLDER_MENU_ID: &str = "open-folder";
const OPEN_FOLDER_EVENT: &str = "open-folder-requested";

pub fn file_items(app: &AppHandle) -> tauri::Result<Vec<MenuItem<Wry>>> {
    let open_folder = MenuItem::with_id(
        app,
        OPEN_FOLDER_MENU_ID,
        "Open Folder…",
        true,
        Some("CmdOrCtrl+O"),
    )?;

    Ok(vec![open_folder])
}

pub fn handle(app: &AppHandle, event: &MenuEvent) {
    if event.id() == OPEN_FOLDER_MENU_ID {
        let _ = app.emit(OPEN_FOLDER_EVENT, ());
    }
}
