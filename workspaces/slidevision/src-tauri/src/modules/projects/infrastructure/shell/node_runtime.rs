use std::path::{Path, PathBuf};
use std::process::Stdio;

use crate::infrastructure::shell::command;
use crate::modules::projects::domain::services::{
    NodeInstallation, NodeRuntime as NodeRuntimeContract,
};
use crate::modules::projects::domain::value_objects::NodeVersion;

pub struct NodeRuntime;

impl NodeRuntimeContract for NodeRuntime {
    fn locate(&self) -> Option<NodeInstallation> {
        let path = locate()?;
        let version = version(&path);

        Some(NodeInstallation { path, version })
    }
}

#[cfg(unix)]
fn locate() -> Option<PathBuf> {
    let shell = std::env::var("SHELL").unwrap_or_else(|_| "/bin/zsh".to_string());
    let output = command(Path::new(&shell))
        .args(["-ilc", "command -v node"])
        .stdin(Stdio::null())
        .stderr(Stdio::null())
        .output()
        .ok()?;

    parse_located(&String::from_utf8_lossy(&output.stdout))
}

#[cfg(windows)]
fn locate() -> Option<PathBuf> {
    let paths = std::env::var_os("PATH")?;

    std::env::split_paths(&paths)
        .map(|dir| dir.join("node.exe"))
        .find(|candidate| candidate.is_file())
}

#[cfg_attr(windows, allow(dead_code))]
pub fn parse_located(output: &str) -> Option<PathBuf> {
    output
        .lines()
        .map(str::trim)
        .rev()
        .find(|line| line.starts_with('/'))
        .map(PathBuf::from)
}

fn version(node: &Path) -> Option<NodeVersion> {
    let output = command(node)
        .arg("--version")
        .stdin(Stdio::null())
        .output()
        .ok()?;

    NodeVersion::parse(&String::from_utf8_lossy(&output.stdout))
}
