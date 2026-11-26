use std::sync::Arc;

use crate::modules::presentation::application::commands::{PlayCommand, PlayCommandHandler};
use crate::modules::presentation::domain::errors::PresentationError;
use crate::modules::presentation::domain::value_objects::{Placement, PresentationPlan};
use crate::modules::presentation::tests::fakes::{FakePresentationWindows, FakeScreens, display};

fn command(slide: u32) -> PlayCommand {
    PlayCommand {
        url: "http://localhost:3031/".to_string(),
        slide,
    }
}

#[test]
fn opens_slides_on_the_projector_and_the_presenter_on_the_laptop_at_the_slide() {
    let laptop = display("Built-in", 0);
    let projector = display("Projector", 1920);
    let windows = Arc::new(FakePresentationWindows::default());
    let subject = PlayCommandHandler::new(
        Arc::new(FakeScreens::with(
            vec![laptop.clone(), projector.clone()],
            Some(laptop.clone()),
        )),
        windows.clone(),
    );

    let result = subject.execute(command(3));

    assert_eq!(result, Ok(()));
    assert_eq!(
        windows.opened(),
        vec![PresentationPlan {
            slides: Placement {
                display: projector,
                url: "http://localhost:3031/3".to_string(),
            },
            presenter: Some(Placement {
                display: laptop,
                url: "http://localhost:3031/presenter/3".to_string(),
            }),
        }]
    );
}

#[test]
fn ends_any_previous_presentation_first() {
    let laptop = display("Built-in", 0);
    let windows = Arc::new(FakePresentationWindows::default());
    let subject = PlayCommandHandler::new(
        Arc::new(FakeScreens::with(vec![laptop.clone()], Some(laptop))),
        windows.clone(),
    );

    subject.execute(command(1)).unwrap();

    assert_eq!(windows.closed_times(), 1);
    assert_eq!(windows.opened().len(), 1);
}

#[test]
fn refuses_a_deck_address_that_is_not_local() {
    let laptop = display("Built-in", 0);
    let windows = Arc::new(FakePresentationWindows::default());
    let subject = PlayCommandHandler::new(
        Arc::new(FakeScreens::with(vec![laptop.clone()], Some(laptop))),
        windows.clone(),
    );

    let result = subject.execute(PlayCommand {
        url: "https://example.com/".to_string(),
        slide: 1,
    });

    assert_eq!(
        result,
        Err(PresentationError::InvalidDeckUrl(
            "https://example.com/".to_string()
        ))
    );
    assert!(windows.opened().is_empty());
}

#[test]
fn fails_without_a_display() {
    let windows = Arc::new(FakePresentationWindows::default());
    let subject =
        PlayCommandHandler::new(Arc::new(FakeScreens::with(vec![], None)), windows.clone());

    assert_eq!(
        subject.execute(command(1)),
        Err(PresentationError::NoDisplay)
    );
    assert!(windows.opened().is_empty());
}

#[test]
fn cleans_up_when_a_window_cannot_open() {
    let laptop = display("Built-in", 0);
    let windows = Arc::new(FakePresentationWindows::failing(PresentationError::Window(
        "denied".to_string(),
    )));
    let subject = PlayCommandHandler::new(
        Arc::new(FakeScreens::with(vec![laptop.clone()], Some(laptop))),
        windows.clone(),
    );

    let result = subject.execute(command(1));

    assert_eq!(result, Err(PresentationError::Window("denied".to_string())));
    assert_eq!(windows.closed_times(), 2);
}
