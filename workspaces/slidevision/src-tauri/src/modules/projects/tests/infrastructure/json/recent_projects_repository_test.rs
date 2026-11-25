use std::fs;
use std::path::PathBuf;

use crate::modules::projects::domain::entities::RecentProject;
use crate::modules::projects::domain::repositories::RecentProjectsRepository as _;
use crate::modules::projects::infrastructure::json::RecentProjectsRepository;

fn folder(label: &str) -> PathBuf {
    std::env::temp_dir().join(format!("slidevision-{label}-{}", std::process::id()))
}

#[test]
fn update_saves_what_load_reads_back() {
    let dir = folder("recent-round-trip");
    let subject = RecentProjectsRepository::new(dir.join("recent-projects.json"));

    subject
        .update(&mut |recent| recent.remember(RecentProject::opened("/talks/a", 7)))
        .unwrap();

    assert_eq!(
        subject.load().projects(),
        &[RecentProject::opened("/talks/a", 7)]
    );

    fs::remove_dir_all(dir).unwrap();
}

#[test]
fn writes_the_camel_case_file_format() {
    let dir = folder("recent-format");
    let file = dir.join("recent-projects.json");
    let subject = RecentProjectsRepository::new(file.clone());

    subject
        .update(&mut |recent| recent.remember(RecentProject::opened("/talks/a", 7)))
        .unwrap();

    let saved: serde_json::Value =
        serde_json::from_str(&fs::read_to_string(&file).unwrap()).unwrap();

    assert_eq!(
        saved,
        serde_json::json!([{ "path": "/talks/a", "name": "a", "openedAt": 7 }])
    );

    fs::remove_dir_all(dir).unwrap();
}

#[test]
fn load_treats_a_missing_or_corrupt_file_as_empty() {
    let dir = folder("recent-corrupt");
    let file = dir.join("recent-projects.json");
    let subject = RecentProjectsRepository::new(file.clone());

    assert!(subject.load().projects().is_empty());

    fs::create_dir_all(&dir).unwrap();
    fs::write(&file, "not json").unwrap();

    assert!(subject.load().projects().is_empty());

    fs::remove_dir_all(dir).unwrap();
}
