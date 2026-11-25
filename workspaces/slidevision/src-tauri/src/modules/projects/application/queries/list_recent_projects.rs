use std::path::Path;
use std::sync::Arc;

use crate::modules::projects::domain::entities::{RecentProject, RecentProjects};
use crate::modules::projects::domain::repositories::RecentProjectsRepository;

#[derive(Debug, PartialEq)]
pub struct RecentProjectView {
    pub project: RecentProject,
    pub is_available: bool,
}

pub struct ListRecentProjectsQueryHandler {
    repository: Arc<dyn RecentProjectsRepository>,
}

impl ListRecentProjectsQueryHandler {
    pub fn new(repository: Arc<dyn RecentProjectsRepository>) -> Self {
        Self { repository }
    }

    pub fn execute(&self) -> Vec<RecentProjectView> {
        to_views(&self.repository.load())
    }
}

pub fn to_views(recent: &RecentProjects) -> Vec<RecentProjectView> {
    recent
        .projects()
        .iter()
        .map(|project| RecentProjectView {
            project: project.clone(),
            is_available: Path::new(&project.path).is_dir(),
        })
        .collect()
}
