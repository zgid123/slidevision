use crate::modules::projects::domain::value_objects::NodeVersion;

#[test]
fn parse_reads_node_version_output() {
    assert_eq!(
        NodeVersion::parse("v24.22.3\n"),
        Some(NodeVersion::new(24, 22, 3))
    );
}

#[test]
fn parse_rejects_other_output() {
    assert_eq!(NodeVersion::parse("command not found"), None);
    assert_eq!(NodeVersion::parse("v24"), None);
}

#[test]
fn supports_slidev_from_22_22() {
    assert!(!NodeVersion::new(22, 21, 9).supports_slidev());
    assert!(NodeVersion::new(22, 22, 0).supports_slidev());
    assert!(NodeVersion::new(24, 0, 0).supports_slidev());
}

#[test]
fn displays_without_the_v_prefix() {
    assert_eq!(NodeVersion::new(20, 11, 1).to_string(), "20.11.1");
}
