use tauri::{AppHandle, Manager};

use crate::modules::presentation::application::commands::{
    EndPresentationCommandHandler, PlayCommand, PlayCommandHandler,
};

pub struct Handlers {
    pub play: PlayCommandHandler,
    pub end_presentation: EndPresentationCommandHandler,
}

#[tauri::command]
pub async fn play(app: AppHandle, url: String, slide: u32) -> Result<(), String> {
    app.state::<Handlers>()
        .play
        .execute(PlayCommand { url, slide })
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub async fn end_presentation(app: AppHandle) {
    app.state::<Handlers>().end_presentation.execute();
}
