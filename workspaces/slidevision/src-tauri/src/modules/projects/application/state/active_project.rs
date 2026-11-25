use std::sync::Mutex;

use crate::modules::projects::domain::services::ProjectHost;

#[derive(Default)]
pub struct ActiveProject {
    host: Mutex<Option<Box<dyn ProjectHost>>>,
}

impl ActiveProject {
    pub fn replace(&self, host: Box<dyn ProjectHost>) {
        let previous = self.host.lock().unwrap().replace(host);

        if let Some(previous) = previous {
            previous.stop();
        }
    }

    pub fn close(&self) {
        let host = self.host.lock().unwrap().take();

        if let Some(host) = host {
            host.stop();
        }
    }
}
