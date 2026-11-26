use std::sync::Arc;

use tauri::{App, AppHandle, Manager};

use super::commands::Handlers;
use crate::modules::presentation::application::commands::{
    EndPresentationCommandHandler, PlayCommandHandler,
};
use crate::modules::presentation::infrastructure::tauri::{PresentationWindows, Screens};

pub fn wire(app: &App) -> Handlers {
    let windows = Arc::new(PresentationWindows::new(app.handle().clone()));

    Handlers {
        play: PlayCommandHandler::new(
            Arc::new(Screens::new(app.handle().clone())),
            windows.clone(),
        ),
        end_presentation: EndPresentationCommandHandler::new(windows),
    }
}

pub fn end(app: &AppHandle) {
    if let Some(handlers) = app.try_state::<Handlers>() {
        handlers.end_presentation.execute();
    }
}
