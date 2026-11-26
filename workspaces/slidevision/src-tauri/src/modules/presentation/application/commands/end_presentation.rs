use std::sync::Arc;

use crate::modules::presentation::domain::services::PresentationWindows;

pub struct EndPresentationCommandHandler {
    windows: Arc<dyn PresentationWindows>,
}

impl EndPresentationCommandHandler {
    pub fn new(windows: Arc<dyn PresentationWindows>) -> Self {
        Self { windows }
    }

    pub fn execute(&self) {
        self.windows.close();
    }
}
