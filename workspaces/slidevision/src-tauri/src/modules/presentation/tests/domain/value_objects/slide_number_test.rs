use crate::modules::presentation::domain::errors::PresentationError;
use crate::modules::presentation::domain::value_objects::SlideNumber;

#[test]
fn starts_at_one() {
    assert_eq!(SlideNumber::new(0), Err(PresentationError::InvalidSlide));
    assert_eq!(SlideNumber::new(1).unwrap().to_string(), "1");
}
