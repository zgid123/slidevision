use std::sync::Arc;

use crate::modules::projects::application::queries::{RecentProjectView, to_views};
use crate::modules::projects::domain::errors::ProjectError;
use crate::modules::projects::domain::repositories::RecentProjectsRepository;

pub struct RemoveRecentProjectCommand {
    pub path: String,
}

pub struct RemoveRecentProjectCommandHandler {
    repository: Arc<dyn RecentProjectsRepository>,
}

impl RemoveRecentProjectCommandHandler {
    pub fn new(repository: Arc<dyn RecentProjectsRepository>) -> Self {
        Self { repository }
    }

    pub fn execute(
        &self,
        command: RemoveRecentProjectCommand,
    ) -> Result<Vec<RecentProjectView>, ProjectError> {
        let recent = self.repository.update(&mut |recent| {
            recent.forget(&command.path);
        })?;

        Ok(to_views(&recent))
    }
}
