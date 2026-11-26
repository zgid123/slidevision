use crate::modules::presentation::domain::errors::PresentationError;
use crate::modules::presentation::domain::services::{ScreenSet, Screens};
use crate::modules::presentation::domain::value_objects::Display;

pub struct FakeScreens {
    displays: Vec<Display>,
    primary: Option<Display>,
}

impl FakeScreens {
    pub fn with(displays: Vec<Display>, primary: Option<Display>) -> Self {
        Self { displays, primary }
    }
}

impl Screens for FakeScreens {
    fn read(&self) -> Result<ScreenSet, PresentationError> {
        Ok(ScreenSet {
            displays: self.displays.clone(),
            primary: self.primary.clone(),
        })
    }
}
