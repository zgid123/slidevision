use std::path::PathBuf;

use crate::modules::projects::domain::services::{NodeInstallation, NodeRuntime};
use crate::modules::projects::domain::value_objects::NodeVersion;

pub struct FakeNodeRuntime {
    installation: Option<NodeInstallation>,
}

impl FakeNodeRuntime {
    pub fn supported() -> Self {
        Self::with_version(Some(NodeVersion::new(24, 0, 0)))
    }

    pub fn missing() -> Self {
        Self { installation: None }
    }

    pub fn with_version(version: Option<NodeVersion>) -> Self {
        Self {
            installation: Some(NodeInstallation {
                path: PathBuf::from("/usr/local/bin/node"),
                version,
            }),
        }
    }
}

impl NodeRuntime for FakeNodeRuntime {
    fn locate(&self) -> Option<NodeInstallation> {
        self.installation.clone()
    }
}
