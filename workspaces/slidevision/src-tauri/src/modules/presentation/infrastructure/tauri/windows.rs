use tauri::utils::config::BackgroundThrottlingPolicy;
use tauri::{
    AppHandle, Emitter, Manager, PhysicalPosition, Position, WebviewUrl, WebviewWindowBuilder,
    WindowEvent,
};
use url::Url;

use crate::modules::presentation::domain::errors::PresentationError;
use crate::modules::presentation::domain::services::PresentationWindows as PresentationWindowsContract;
use crate::modules::presentation::domain::value_objects::{Display, Placement, PresentationPlan};

const MAIN_WINDOW: &str = "main";
const SLIDES_WINDOW: &str = "slides";
const PRESENTER_WINDOW: &str = "presenter";
const PRESENTATION_EVENT: &str = "presentation-changed";
const END_PRESENTATION_SCRIPT: &str = r#"
window.addEventListener('slidevision:end-presentation', () => {
  window.__TAURI_INTERNALS__.invoke('end_presentation');
});
"#;

pub struct PresentationWindows {
    app: AppHandle,
}

impl PresentationWindows {
    pub fn new(app: AppHandle) -> Self {
        Self { app }
    }

    fn present(&self, label: &str, title: &str, placement: &Placement) -> tauri::Result<()> {
        let url = Url::parse(&placement.url).map_err(|error| tauri::Error::Anyhow(error.into()))?;
        let window = WebviewWindowBuilder::new(&self.app, label, WebviewUrl::External(url))
            .title(title)
            .visible(false)
            .background_throttling(BackgroundThrottlingPolicy::Disabled)
            .initialization_script(END_PRESENTATION_SCRIPT)
            .build()?;
        let display = &placement.display;
        let app = self.app.clone();

        window.on_window_event(move |event| {
            if let WindowEvent::Destroyed = event {
                close_presentation(&app);
            }
        });
        window.set_position(position_on(display))?;
        window.show()?;
        window.set_fullscreen(true)?;

        Ok(())
    }
}

impl PresentationWindowsContract for PresentationWindows {
    fn open(&self, plan: &PresentationPlan) -> Result<(), PresentationError> {
        let failed = |error: tauri::Error| PresentationError::Window(error.to_string());

        if let Some(main) = self.app.get_webview_window(MAIN_WINDOW) {
            main.hide().map_err(failed)?;
        }

        let _ = self.app.emit_to(MAIN_WINDOW, PRESENTATION_EVENT, true);

        self.present(SLIDES_WINDOW, "Slidevision — Slides", &plan.slides)
            .map_err(failed)?;

        if let Some(presenter) = &plan.presenter {
            self.present(PRESENTER_WINDOW, "Slidevision — Presenter", presenter)
                .map_err(failed)?;

            if let Some(window) = self.app.get_webview_window(PRESENTER_WINDOW) {
                window.set_focus().map_err(failed)?;
            }
        }

        Ok(())
    }

    fn close(&self) {
        close_presentation(&self.app);
    }
}

#[cfg(target_os = "macos")]
fn position_on(display: &Display) -> Position {
    PhysicalPosition::new(display.x, display.y)
        .to_logical::<f64>(display.scale_factor)
        .into()
}

#[cfg(not(target_os = "macos"))]
fn position_on(display: &Display) -> Position {
    PhysicalPosition::new(display.x, display.y).into()
}

fn close_presentation(app: &AppHandle) {
    let mut was_presenting = false;

    for label in [SLIDES_WINDOW, PRESENTER_WINDOW] {
        if let Some(window) = app.get_webview_window(label) {
            was_presenting = true;
            let _ = window.destroy();
        }
    }

    if was_presenting {
        let _ = app.emit_to(MAIN_WINDOW, PRESENTATION_EVENT, false);
    }

    if let Some(main) = app.get_webview_window(MAIN_WINDOW) {
        let _ = main.show();
        let _ = main.set_focus();
    }
}
