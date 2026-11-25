use std::path::Path;

use serde_json::Value;

use crate::modules::projects::domain::errors::ProjectError;

pub trait ProjectHost: Send + Sync {
    fn open(&self, root: &str) -> Result<Value, ProjectError>;

    fn start_deck(&self, id: &str) -> Result<Value, ProjectError>;

    fn stop(&self);
}

pub trait ProjectHostLauncher: Send + Sync {
    fn launch(&self, node: &Path) -> Result<Box<dyn ProjectHost>, ProjectError>;
}

pub trait DeckRunListener: Send + Sync {
    fn deck_run_changed(&self, run: Value);
}
