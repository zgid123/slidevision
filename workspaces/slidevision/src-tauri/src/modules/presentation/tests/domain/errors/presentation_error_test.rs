use crate::modules::presentation::domain::errors::PresentationError;

#[test]
fn messages_say_what_went_wrong() {
    assert_eq!(
        PresentationError::NoDisplay.to_string(),
        "No display was found to present on."
    );
    assert_eq!(
        PresentationError::InvalidDeckUrl("http://example.com/".to_string()).to_string(),
        "http://example.com/ is not a running Slidev deck."
    );
    assert_eq!(
        PresentationError::Window("denied".to_string()).to_string(),
        "Could not open the presentation: denied"
    );
}
