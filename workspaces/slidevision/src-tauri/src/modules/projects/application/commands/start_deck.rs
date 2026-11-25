use std::sync::Arc;

use serde_json::Value;

use crate::modules::projects::application::state::ActiveProject;
use crate::modules::projects::domain::errors::ProjectError;

pub struct StartDeckCommand {
    pub id: String,
}

pub struct StartDeckCommandHandler {
    active_project: Arc<ActiveProject>,
}

impl StartDeckCommandHandler {
    pub fn new(active_project: Arc<ActiveProject>) -> Self {
        Self { active_project }
    }

    pub fn execute(&self, command: StartDeckCommand) -> Result<Value, ProjectError> {
        self.active_project.host()?.start_deck(&command.id)
    }
}
