use crate::modules::presentation::domain::errors::PresentationError;
use crate::modules::presentation::domain::value_objects::{DeckUrl, SlideNumber};

#[test]
fn builds_the_slide_and_presenter_addresses() {
    let deck = DeckUrl::parse("http://localhost:3031/").unwrap();
    let slide = SlideNumber::new(3).unwrap();

    assert_eq!(deck.slide(slide), "http://localhost:3031/3");
    assert_eq!(deck.presenter(slide), "http://localhost:3031/presenter/3");
}

#[test]
fn accepts_the_loopback_address() {
    assert!(DeckUrl::parse("http://127.0.0.1:3030/").is_ok());
}

#[test]
fn rejects_anything_but_a_local_slidev_root() {
    for url in [
        "https://localhost:3030/",
        "http://example.com:3030/",
        "http://localhost/",
        "http://localhost:3030/presenter/1",
        "http://localhost:3030/?print",
        "file:///etc/passwd",
        "not a url",
    ] {
        assert_eq!(
            DeckUrl::parse(url),
            Err(PresentationError::InvalidDeckUrl(url.to_string())),
            "{url}"
        );
    }
}
