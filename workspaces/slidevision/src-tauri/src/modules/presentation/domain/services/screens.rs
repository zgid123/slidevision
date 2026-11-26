use crate::modules::presentation::domain::errors::PresentationError;
use crate::modules::presentation::domain::value_objects::Display;

pub struct ScreenSet {
    pub displays: Vec<Display>,
    pub primary: Option<Display>,
}

pub trait Screens: Send + Sync {
    fn read(&self) -> Result<ScreenSet, PresentationError>;
}
