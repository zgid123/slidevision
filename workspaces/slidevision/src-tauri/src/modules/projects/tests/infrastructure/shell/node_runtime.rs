use std::path::PathBuf;

use crate::modules::projects::infrastructure::shell::node_runtime::parse_located;

#[test]
fn parse_located_takes_the_last_absolute_path() {
    let output = "Welcome to zsh\n/Users/alpha/.nvm/versions/node/v24.22.3/bin/node\n";

    assert_eq!(
        parse_located(output),
        Some(PathBuf::from(
            "/Users/alpha/.nvm/versions/node/v24.22.3/bin/node"
        ))
    );
}

#[test]
fn parse_located_ignores_output_without_a_path() {
    assert_eq!(parse_located("node not found\n"), None);
}
