use tauri::{App, AppHandle, Manager};

use crate::modules::presentation::adapters::tauri::wire as presentation;
use crate::modules::projects::adapters::tauri::wire as projects;

pub fn wire(app: &App) -> tauri::Result<()> {
    app.manage(projects::wire(app)?);
    app.manage(presentation::wire(app));

    Ok(())
}

pub fn unwire(app: &AppHandle) {
    presentation::end(app);
    projects::unwire(app);
}
