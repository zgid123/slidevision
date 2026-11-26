use crate::modules::presentation::domain::errors::PresentationError;
use crate::modules::presentation::domain::value_objects::Display;

#[derive(Clone, Debug, PartialEq)]
pub struct PresentationLayout {
    pub slides: Display,
    pub presenter: Option<Display>,
}

impl PresentationLayout {
    pub fn choose(
        displays: &[Display],
        primary: Option<&Display>,
    ) -> Result<Self, PresentationError> {
        let main = primary
            .filter(|primary| displays.contains(primary))
            .or_else(|| displays.first())
            .ok_or(PresentationError::NoDisplay)?;
        let external = displays.iter().find(|display| *display != main);

        Ok(match external {
            Some(external) => Self {
                slides: external.clone(),
                presenter: Some(main.clone()),
            },
            None => Self {
                slides: main.clone(),
                presenter: None,
            },
        })
    }
}
