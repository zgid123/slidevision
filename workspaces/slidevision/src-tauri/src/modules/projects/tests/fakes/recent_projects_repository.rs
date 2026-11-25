use std::sync::Mutex;

use crate::modules::projects::domain::entities::{RecentProject, RecentProjects};
use crate::modules::projects::domain::errors::ProjectError;
use crate::modules::projects::domain::repositories::RecentProjectsRepository;

#[derive(Default)]
pub struct InMemoryRecentProjectsRepository {
    recent: Mutex<RecentProjects>,
}

impl InMemoryRecentProjectsRepository {
    pub fn with(projects: Vec<RecentProject>) -> Self {
        Self {
            recent: Mutex::new(RecentProjects::restore(projects)),
        }
    }

    pub fn paths(&self) -> Vec<String> {
        self.recent
            .lock()
            .unwrap()
            .projects()
            .iter()
            .map(|project| project.path.clone())
            .collect()
    }
}

impl RecentProjectsRepository for InMemoryRecentProjectsRepository {
    fn load(&self) -> RecentProjects {
        self.recent.lock().unwrap().clone()
    }

    fn update(
        &self,
        change: &mut dyn FnMut(&mut RecentProjects),
    ) -> Result<RecentProjects, ProjectError> {
        let mut recent = self.recent.lock().unwrap();

        change(&mut recent);

        Ok(recent.clone())
    }
}
