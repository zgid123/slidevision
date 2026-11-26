use tauri::{AppHandle, Monitor};

use crate::modules::presentation::domain::errors::PresentationError;
use crate::modules::presentation::domain::services::{ScreenSet, Screens as ScreensContract};
use crate::modules::presentation::domain::value_objects::Display;

pub struct Screens {
    app: AppHandle,
}

impl Screens {
    pub fn new(app: AppHandle) -> Self {
        Self { app }
    }
}

impl ScreensContract for Screens {
    fn read(&self) -> Result<ScreenSet, PresentationError> {
        let failed = |error: tauri::Error| PresentationError::Window(error.to_string());
        let displays = self.app.available_monitors().map_err(failed)?;
        let primary = self.app.primary_monitor().map_err(failed)?;

        Ok(ScreenSet {
            displays: displays.iter().map(to_display).collect(),
            primary: primary.as_ref().map(to_display),
        })
    }
}

fn to_display(monitor: &Monitor) -> Display {
    let position = monitor.position();
    let size = monitor.size();

    Display {
        name: monitor.name().cloned().unwrap_or_default(),
        x: position.x,
        y: position.y,
        width: size.width,
        height: size.height,
        scale_factor: monitor.scale_factor(),
    }
}
