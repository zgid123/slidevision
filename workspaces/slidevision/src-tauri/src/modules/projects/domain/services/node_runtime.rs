use std::path::PathBuf;

use crate::modules::projects::domain::value_objects::NodeVersion;

#[derive(Clone, Debug, PartialEq)]
pub struct NodeInstallation {
    pub path: PathBuf,
    pub version: Option<NodeVersion>,
}

pub trait NodeRuntime: Send + Sync {
    fn locate(&self) -> Option<NodeInstallation>;
}
