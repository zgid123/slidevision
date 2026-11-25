use std::path::Path;
use std::sync::Arc;

use serde_json::json;

use crate::modules::projects::application::commands::{StartDeckCommand, StartDeckCommandHandler};
use crate::modules::projects::application::state::ActiveProject;
use crate::modules::projects::domain::errors::ProjectError;
use crate::modules::projects::domain::services::ProjectHostLauncher;
use crate::modules::projects::tests::fakes::FakeLauncher;

#[test]
fn asks_the_open_project_to_start_the_deck() {
    let launcher = FakeLauncher::answering(Ok(json!({})));
    let active_project = Arc::new(ActiveProject::default());
    let subject = StartDeckCommandHandler::new(active_project.clone());

    active_project.replace(launcher.launch(Path::new("node")).unwrap());

    let result = subject.execute(StartDeckCommand {
        id: "decks/alpha".to_string(),
    });

    assert_eq!(result, Ok(json!({ "startedDeck": "decks/alpha" })));
}

#[test]
fn fails_without_an_open_project() {
    let subject = StartDeckCommandHandler::new(Arc::new(ActiveProject::default()));

    let result = subject.execute(StartDeckCommand {
        id: "decks/alpha".to_string(),
    });

    assert_eq!(result, Err(ProjectError::NoProject));
}
