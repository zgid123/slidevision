use crate::modules::presentation::domain::errors::PresentationError;
use crate::modules::presentation::domain::value_objects::PresentationLayout;
use crate::modules::presentation::tests::fakes::display;

#[test]
fn one_display_shows_only_the_slides_on_it() {
    let laptop = display("Built-in", 0);

    let layout = PresentationLayout::choose(std::slice::from_ref(&laptop), Some(&laptop));

    assert_eq!(
        layout,
        Ok(PresentationLayout {
            slides: laptop,
            presenter: None,
        })
    );
}

#[test]
fn two_displays_put_slides_on_the_external_one_when_the_primary_comes_first() {
    let laptop = display("Built-in", 0);
    let projector = display("Projector", 1920);

    let layout = PresentationLayout::choose(&[laptop.clone(), projector.clone()], Some(&laptop));

    assert_eq!(
        layout,
        Ok(PresentationLayout {
            slides: projector,
            presenter: Some(laptop),
        })
    );
}

#[test]
fn two_displays_put_slides_on_the_external_one_when_the_primary_comes_last() {
    let laptop = display("Built-in", 0);
    let projector = display("Projector", -1920);

    let layout = PresentationLayout::choose(&[projector.clone(), laptop.clone()], Some(&laptop));

    assert_eq!(
        layout,
        Ok(PresentationLayout {
            slides: projector,
            presenter: Some(laptop),
        })
    );
}

#[test]
fn three_displays_use_the_first_external_one_for_slides() {
    let left = display("Left", -1920);
    let laptop = display("Built-in", 0);
    let right = display("Right", 1920);

    let layout = PresentationLayout::choose(&[left.clone(), laptop.clone(), right], Some(&laptop));

    assert_eq!(
        layout,
        Ok(PresentationLayout {
            slides: left,
            presenter: Some(laptop),
        })
    );
}

#[test]
fn without_a_known_primary_the_first_display_shows_the_presenter() {
    let first = display("First", 0);
    let second = display("Second", 1920);

    let layout = PresentationLayout::choose(&[first.clone(), second.clone()], None);

    assert_eq!(
        layout,
        Ok(PresentationLayout {
            slides: second,
            presenter: Some(first),
        })
    );
}

#[test]
fn a_primary_that_is_no_longer_connected_is_ignored() {
    let unplugged = display("Projector", 1920);
    let laptop = display("Built-in", 0);

    let layout = PresentationLayout::choose(std::slice::from_ref(&laptop), Some(&unplugged));

    assert_eq!(
        layout,
        Ok(PresentationLayout {
            slides: laptop,
            presenter: None,
        })
    );
}

#[test]
fn no_display_is_an_error() {
    assert_eq!(
        PresentationLayout::choose(&[], None),
        Err(PresentationError::NoDisplay)
    );
}
