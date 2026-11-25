use std::sync::Arc;

use crate::modules::projects::application::commands::{
    RemoveRecentProjectCommand, RemoveRecentProjectCommandHandler,
};
use crate::modules::projects::domain::entities::RecentProject;
use crate::modules::projects::tests::fakes::InMemoryRecentProjectsRepository;

#[test]
fn forgets_the_project_and_returns_the_rest() {
    let repository = Arc::new(InMemoryRecentProjectsRepository::with(vec![
        RecentProject::opened("/gone", 2),
        RecentProject::opened("/kept", 1),
    ]));
    let subject = RemoveRecentProjectCommandHandler::new(repository.clone());

    let views = subject
        .execute(RemoveRecentProjectCommand {
            path: "/gone".to_string(),
        })
        .unwrap();

    assert_eq!(repository.paths(), vec!["/kept"]);
    assert_eq!(views.len(), 1);
    assert_eq!(views[0].project.path, "/kept");
}
