use std::fmt;
use std::path::PathBuf;

use crate::modules::projects::domain::value_objects::NodeVersion;

#[derive(Clone, Debug, PartialEq)]
pub enum ProjectError {
    NodeNotFound,
    NodeVersionUnknown { node: PathBuf },
    NodeTooOld { node: PathBuf, version: NodeVersion },
    NoProject,
    Host(String),
    Storage(String),
}

impl fmt::Display for ProjectError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::NodeNotFound => write!(
                formatter,
                "Node.js was not found. Install Node.js {} or later (https://nodejs.org), then open the project again.",
                minimum()
            ),
            Self::NodeVersionUnknown { node } => {
                write!(
                    formatter,
                    "{} did not report a Node.js version.",
                    node.display()
                )
            }
            Self::NodeTooOld { node, version } => write!(
                formatter,
                "Slidevision needs Node.js {} or later, but {} is {version}.",
                minimum(),
                node.display()
            ),
            Self::NoProject => write!(formatter, "No project is open."),
            Self::Host(message) => write!(formatter, "{message}"),
            Self::Storage(message) => {
                write!(formatter, "Could not save the recent projects: {message}")
            }
        }
    }
}

impl std::error::Error for ProjectError {}

fn minimum() -> String {
    let version = NodeVersion::SLIDEV_MINIMUM.to_string();

    version.trim_end_matches(".0").to_string()
}
