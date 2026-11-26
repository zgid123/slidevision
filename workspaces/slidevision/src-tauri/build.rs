fn main() {
    tauri_build::try_build(tauri_build::Attributes::new().app_manifest(
        tauri_build::AppManifest::new().commands(&[
            "open_project",
            "close_project",
            "recent_projects",
            "remove_recent_project",
            "start_deck",
            "play",
            "end_presentation",
        ]),
    ))
    .expect("failed to build the Tauri app");
}
