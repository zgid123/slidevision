use std::sync::{Arc, Mutex};

use crate::modules::projects::domain::errors::ProjectError;
use crate::modules::projects::domain::services::ProjectHost;

#[derive(Default)]
pub struct ActiveProject {
    host: Mutex<Option<Arc<dyn ProjectHost>>>,
}

impl ActiveProject {
    pub fn replace(&self, host: Box<dyn ProjectHost>) {
        let previous = self.host.lock().unwrap().replace(Arc::from(host));

        if let Some(previous) = previous {
            previous.stop();
        }
    }

    pub fn host(&self) -> Result<Arc<dyn ProjectHost>, ProjectError> {
        self.host
            .lock()
            .unwrap()
            .clone()
            .ok_or(ProjectError::NoProject)
    }

    pub fn close(&self) {
        let host = self.host.lock().unwrap().take();

        if let Some(host) = host {
            host.stop();
        }
    }
}
