use std::sync::Arc;

use crate::modules::projects::application::state::ActiveProject;

pub struct CloseProjectCommandHandler {
    active_project: Arc<ActiveProject>,
}

impl CloseProjectCommandHandler {
    pub fn new(active_project: Arc<ActiveProject>) -> Self {
        Self { active_project }
    }

    pub fn execute(&self) {
        self.active_project.close();
    }
}
