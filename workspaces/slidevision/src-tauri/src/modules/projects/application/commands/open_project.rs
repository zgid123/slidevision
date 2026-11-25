use std::path::PathBuf;
use std::sync::Arc;

use serde_json::Value;

use crate::modules::projects::application::state::ActiveProject;
use crate::modules::projects::domain::entities::RecentProject;
use crate::modules::projects::domain::errors::ProjectError;
use crate::modules::projects::domain::repositories::RecentProjectsRepository;
use crate::modules::projects::domain::services::{NodeRuntime, ProjectHostLauncher};

pub struct OpenProjectCommand {
    pub path: String,
    pub opened_at: u64,
}

pub struct OpenProjectCommandHandler {
    runtime: Arc<dyn NodeRuntime>,
    launcher: Arc<dyn ProjectHostLauncher>,
    repository: Arc<dyn RecentProjectsRepository>,
    active_project: Arc<ActiveProject>,
}

impl OpenProjectCommandHandler {
    pub fn new(
        runtime: Arc<dyn NodeRuntime>,
        launcher: Arc<dyn ProjectHostLauncher>,
        repository: Arc<dyn RecentProjectsRepository>,
        active_project: Arc<ActiveProject>,
    ) -> Self {
        Self {
            runtime,
            launcher,
            repository,
            active_project,
        }
    }

    pub fn execute(&self, command: OpenProjectCommand) -> Result<Value, ProjectError> {
        self.active_project.close();

        let node = self.supported_node()?;
        let host = self.launcher.launch(&node)?;
        let project = match host.open(&command.path) {
            Ok(project) => project,
            Err(error) => {
                host.stop();

                return Err(error);
            }
        };

        self.active_project.replace(host);
        self.repository.update(&mut |recent| {
            recent.remember(RecentProject::opened(&command.path, command.opened_at));
        })?;

        Ok(project)
    }

    fn supported_node(&self) -> Result<PathBuf, ProjectError> {
        let installation = self.runtime.locate().ok_or(ProjectError::NodeNotFound)?;
        let version = installation
            .version
            .ok_or_else(|| ProjectError::NodeVersionUnknown {
                node: installation.path.clone(),
            })?;

        if !version.supports_slidev() {
            return Err(ProjectError::NodeTooOld {
                node: installation.path,
                version,
            });
        }

        Ok(installation.path)
    }
}
