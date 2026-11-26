use std::fmt;

use crate::modules::presentation::domain::errors::PresentationError;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct SlideNumber(u32);

impl SlideNumber {
    pub fn new(no: u32) -> Result<Self, PresentationError> {
        if no == 0 {
            return Err(PresentationError::InvalidSlide);
        }

        Ok(Self(no))
    }
}

impl fmt::Display for SlideNumber {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(formatter, "{}", self.0)
    }
}
