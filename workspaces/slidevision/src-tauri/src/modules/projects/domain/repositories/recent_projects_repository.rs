use crate::modules::projects::domain::entities::RecentProjects;
use crate::modules::projects::domain::errors::ProjectError;

pub trait RecentProjectsRepository: Send + Sync {
    fn load(&self) -> RecentProjects;

    fn update(
        &self,
        change: &mut dyn FnMut(&mut RecentProjects),
    ) -> Result<RecentProjects, ProjectError>;
}
