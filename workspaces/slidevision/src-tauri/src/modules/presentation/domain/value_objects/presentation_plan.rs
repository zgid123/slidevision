use crate::modules::presentation::domain::value_objects::{
    DeckUrl, Display, PresentationLayout, SlideNumber,
};

#[derive(Clone, Debug, PartialEq)]
pub struct Placement {
    pub display: Display,
    pub url: String,
}

#[derive(Clone, Debug, PartialEq)]
pub struct PresentationPlan {
    pub slides: Placement,
    pub presenter: Option<Placement>,
}

impl PresentationPlan {
    pub fn new(layout: PresentationLayout, deck: &DeckUrl, slide: SlideNumber) -> Self {
        Self {
            slides: Placement {
                display: layout.slides,
                url: deck.slide(slide),
            },
            presenter: layout.presenter.map(|display| Placement {
                display,
                url: deck.presenter(slide),
            }),
        }
    }
}
