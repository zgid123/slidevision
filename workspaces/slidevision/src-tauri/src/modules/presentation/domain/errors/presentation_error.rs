use std::fmt;

#[derive(Clone, Debug, PartialEq)]
pub enum PresentationError {
    NoDisplay,
    InvalidDeckUrl(String),
    InvalidSlide,
    Window(String),
}

impl fmt::Display for PresentationError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::NoDisplay => write!(formatter, "No display was found to present on."),
            Self::InvalidDeckUrl(url) => {
                write!(formatter, "{url} is not a running Slidev deck.")
            }
            Self::InvalidSlide => write!(formatter, "Slides are numbered from 1."),
            Self::Window(message) => {
                write!(formatter, "Could not open the presentation: {message}")
            }
        }
    }
}

impl std::error::Error for PresentationError {}
