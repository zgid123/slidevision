use std::sync::Arc;

use crate::modules::projects::application::queries::ListRecentProjectsQueryHandler;
use crate::modules::projects::domain::entities::RecentProject;
use crate::modules::projects::tests::fakes::InMemoryRecentProjectsRepository;

#[test]
fn marks_projects_whose_folder_is_gone_as_unavailable() {
    let existing = std::env::temp_dir();
    let repository = Arc::new(InMemoryRecentProjectsRepository::with(vec![
        RecentProject::opened(existing.to_str().unwrap(), 2),
        RecentProject::opened("/slidevision/does/not/exist", 1),
    ]));
    let subject = ListRecentProjectsQueryHandler::new(repository);

    let views = subject.execute();

    assert!(views[0].is_available);
    assert!(!views[1].is_available);
}
