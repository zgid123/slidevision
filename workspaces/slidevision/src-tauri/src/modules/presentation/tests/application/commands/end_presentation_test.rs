use std::sync::Arc;

use crate::modules::presentation::application::commands::EndPresentationCommandHandler;
use crate::modules::presentation::tests::fakes::FakePresentationWindows;

#[test]
fn closes_the_presentation_windows() {
    let windows = Arc::new(FakePresentationWindows::default());
    let subject = EndPresentationCommandHandler::new(windows.clone());

    subject.execute();

    assert_eq!(windows.closed_times(), 1);
}
