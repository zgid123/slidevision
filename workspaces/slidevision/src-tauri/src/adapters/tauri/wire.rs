use tauri::{App, AppHandle, Manager};

use crate::modules::projects::adapters::tauri::wire as projects;

pub fn wire(app: &App) -> tauri::Result<()> {
    app.manage(projects::wire(app)?);

    Ok(())
}

pub fn unwire(app: &AppHandle) {
    projects::unwire(app);
}
