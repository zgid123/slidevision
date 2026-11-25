use std::path::PathBuf;

use crate::modules::projects::domain::errors::ProjectError;
use crate::modules::projects::domain::value_objects::NodeVersion;

#[test]
fn node_not_found_says_what_to_install() {
    assert_eq!(
        ProjectError::NodeNotFound.to_string(),
        "Node.js was not found. Install Node.js 22.22 or later (https://nodejs.org), then open the project again."
    );
}

#[test]
fn node_too_old_names_the_installation() {
    let error = ProjectError::NodeTooOld {
        node: PathBuf::from("/usr/local/bin/node"),
        version: NodeVersion::new(20, 11, 1),
    };

    assert_eq!(
        error.to_string(),
        "Slidevision needs Node.js 22.22 or later, but /usr/local/bin/node is 20.11.1."
    );
}

#[test]
fn host_errors_pass_the_message_through() {
    assert_eq!(
        ProjectError::Host("/empty has no slidevision.json or slides.md.".to_string()).to_string(),
        "/empty has no slidevision.json or slides.md."
    );
}
