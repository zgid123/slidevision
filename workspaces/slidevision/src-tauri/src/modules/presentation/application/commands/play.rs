use std::sync::Arc;

use crate::modules::presentation::domain::errors::PresentationError;
use crate::modules::presentation::domain::services::{PresentationWindows, Screens};
use crate::modules::presentation::domain::value_objects::{
    DeckUrl, PresentationLayout, PresentationPlan, SlideNumber,
};

pub struct PlayCommand {
    pub url: String,
    pub slide: u32,
}

pub struct PlayCommandHandler {
    screens: Arc<dyn Screens>,
    windows: Arc<dyn PresentationWindows>,
}

impl PlayCommandHandler {
    pub fn new(screens: Arc<dyn Screens>, windows: Arc<dyn PresentationWindows>) -> Self {
        Self { screens, windows }
    }

    pub fn execute(&self, command: PlayCommand) -> Result<(), PresentationError> {
        let deck = DeckUrl::parse(&command.url)?;
        let slide = SlideNumber::new(command.slide)?;
        let screens = self.screens.read()?;
        let layout = PresentationLayout::choose(&screens.displays, screens.primary.as_ref())?;

        self.windows.close();

        let result = self
            .windows
            .open(&PresentationPlan::new(layout, &deck, slide));

        if result.is_err() {
            self.windows.close();
        }

        result
    }
}
