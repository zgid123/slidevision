use std::path::PathBuf;
use std::sync::Arc;

use serde_json::json;

use crate::modules::projects::application::commands::{
    OpenProjectCommand, OpenProjectCommandHandler,
};
use crate::modules::projects::application::state::ActiveProject;
use crate::modules::projects::domain::errors::ProjectError;
use crate::modules::projects::domain::value_objects::NodeVersion;
use crate::modules::projects::tests::fakes::{
    FakeLauncher, FakeNodeRuntime, InMemoryRecentProjectsRepository,
};

struct Subject {
    handler: OpenProjectCommandHandler,
    launcher: Arc<FakeLauncher>,
    repository: Arc<InMemoryRecentProjectsRepository>,
    active_project: Arc<ActiveProject>,
}

fn subject(runtime: FakeNodeRuntime, launcher: FakeLauncher) -> Subject {
    let launcher = Arc::new(launcher);
    let repository = Arc::new(InMemoryRecentProjectsRepository::default());
    let active_project = Arc::new(ActiveProject::default());

    Subject {
        handler: OpenProjectCommandHandler::new(
            Arc::new(runtime),
            launcher.clone(),
            repository.clone(),
            active_project.clone(),
        ),
        launcher,
        repository,
        active_project,
    }
}

fn command(path: &str) -> OpenProjectCommand {
    OpenProjectCommand {
        path: path.to_string(),
        opened_at: 1,
    }
}

#[test]
fn opens_the_project_and_remembers_it() {
    let project = json!({ "kind": "single", "root": "/talks/solo" });
    let subject = subject(
        FakeNodeRuntime::supported(),
        FakeLauncher::answering(Ok(project.clone())),
    );

    let result = subject.handler.execute(command("/talks/solo"));

    assert_eq!(result, Ok(project));
    assert_eq!(subject.repository.paths(), vec!["/talks/solo"]);

    subject.active_project.close();

    assert_eq!(subject.launcher.stopped_hosts(), 1);
}

#[test]
fn stops_the_previous_project_when_opening_another() {
    let subject = subject(
        FakeNodeRuntime::supported(),
        FakeLauncher::answering(Ok(json!({}))),
    );

    subject.handler.execute(command("/talks/a")).unwrap();
    subject.handler.execute(command("/talks/b")).unwrap();

    assert_eq!(subject.launcher.stopped_hosts(), 1);
    assert_eq!(subject.repository.paths(), vec!["/talks/b", "/talks/a"]);
}

#[test]
fn fails_without_node() {
    let subject = subject(
        FakeNodeRuntime::missing(),
        FakeLauncher::answering(Ok(json!({}))),
    );

    let result = subject.handler.execute(command("/talks/solo"));

    assert_eq!(result, Err(ProjectError::NodeNotFound));
    assert_eq!(subject.launcher.launched_hosts(), 0);
    assert!(subject.repository.paths().is_empty());
}

#[test]
fn fails_when_node_is_too_old() {
    let subject = subject(
        FakeNodeRuntime::with_version(Some(NodeVersion::new(20, 11, 1))),
        FakeLauncher::answering(Ok(json!({}))),
    );

    let result = subject.handler.execute(command("/talks/solo"));

    assert_eq!(
        result,
        Err(ProjectError::NodeTooOld {
            node: PathBuf::from("/usr/local/bin/node"),
            version: NodeVersion::new(20, 11, 1),
        })
    );
    assert_eq!(subject.launcher.launched_hosts(), 0);
}

#[test]
fn fails_when_node_reports_no_version() {
    let subject = subject(
        FakeNodeRuntime::with_version(None),
        FakeLauncher::answering(Ok(json!({}))),
    );

    let result = subject.handler.execute(command("/talks/solo"));

    assert_eq!(
        result,
        Err(ProjectError::NodeVersionUnknown {
            node: PathBuf::from("/usr/local/bin/node"),
        })
    );
}

#[test]
fn stops_the_host_and_forgets_nothing_when_the_folder_cannot_be_opened() {
    let subject = subject(
        FakeNodeRuntime::supported(),
        FakeLauncher::answering(Err(ProjectError::Host(
            "/empty has no slidevision.json or slides.md.".to_string(),
        ))),
    );

    let result = subject.handler.execute(command("/empty"));

    assert_eq!(
        result,
        Err(ProjectError::Host(
            "/empty has no slidevision.json or slides.md.".to_string()
        ))
    );
    assert!(subject.repository.paths().is_empty());

    subject.active_project.close();

    assert_eq!(subject.launcher.stopped_hosts(), 1);
}
