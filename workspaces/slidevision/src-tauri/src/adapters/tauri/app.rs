use tauri::RunEvent;

use super::{menu, wire};
use crate::modules::presentation::adapters::tauri::commands as presentation;
use crate::modules::projects::adapters::tauri::commands as projects;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            wire::wire(app)?;

            #[cfg(target_os = "macos")]
            super::window::hide_traffic_lights(app)?;

            Ok(())
        })
        .menu(menu::build)
        .on_menu_event(menu::handle)
        .invoke_handler(tauri::generate_handler![
            projects::open_project,
            projects::close_project,
            projects::recent_projects,
            projects::remove_recent_project,
            projects::start_deck,
            presentation::play,
            presentation::end_presentation
        ])
        .build(tauri::generate_context!())
        .expect("error while building Slidevision")
        .run(|app, event| {
            if let RunEvent::Exit = event {
                wire::unwire(app);
            }
        });
}
