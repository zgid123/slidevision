use std::path::Path;
use std::sync::Arc;

use serde_json::json;

use crate::modules::projects::application::commands::CloseProjectCommandHandler;
use crate::modules::projects::application::state::ActiveProject;
use crate::modules::projects::domain::services::ProjectHostLauncher;
use crate::modules::projects::tests::fakes::FakeLauncher;

#[test]
fn stops_the_open_project() {
    let launcher = FakeLauncher::answering(Ok(json!({})));
    let active_project = Arc::new(ActiveProject::default());
    let subject = CloseProjectCommandHandler::new(active_project.clone());

    active_project.replace(launcher.launch(Path::new("node")).unwrap());
    subject.execute();

    assert_eq!(launcher.stopped_hosts(), 1);
}

#[test]
fn closing_again_stops_nothing_more() {
    let launcher = FakeLauncher::answering(Ok(json!({})));
    let active_project = Arc::new(ActiveProject::default());
    let subject = CloseProjectCommandHandler::new(active_project.clone());

    active_project.replace(launcher.launch(Path::new("node")).unwrap());
    subject.execute();
    subject.execute();

    assert_eq!(launcher.stopped_hosts(), 1);
}
