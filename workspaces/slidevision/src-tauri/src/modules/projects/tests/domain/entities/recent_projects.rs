use crate::modules::projects::domain::entities::{RecentProject, RecentProjects};

fn project(path: &str, opened_at: u64) -> RecentProject {
    RecentProject::opened(path, opened_at)
}

fn paths(recent: &RecentProjects) -> Vec<&str> {
    recent
        .projects()
        .iter()
        .map(|project| project.path.as_str())
        .collect()
}

#[test]
fn opened_names_the_project_after_its_folder() {
    let subject = RecentProject::opened("/talks/rust-meetup", 1);

    assert_eq!(subject.name, "rust-meetup");
}

#[test]
fn remember_puts_the_project_first() {
    let mut subject = RecentProjects::default();

    subject.remember(project("/a", 1));
    subject.remember(project("/b", 2));

    assert_eq!(paths(&subject), vec!["/b", "/a"]);
}

#[test]
fn remember_moves_a_reopened_project_to_the_front_once() {
    let mut subject = RecentProjects::default();

    subject.remember(project("/a", 1));
    subject.remember(project("/b", 2));
    subject.remember(project("/a", 3));

    assert_eq!(paths(&subject), vec!["/a", "/b"]);
    assert_eq!(subject.projects()[0].opened_at, 3);
}

#[test]
fn remember_keeps_only_the_most_recent_projects() {
    let mut subject = RecentProjects::default();

    for index in 0..12 {
        subject.remember(project(&format!("/p{index}"), index));
    }

    assert_eq!(subject.projects().len(), 10);
    assert_eq!(subject.projects()[0].path, "/p11");
    assert_eq!(subject.projects()[9].path, "/p2");
}

#[test]
fn forget_drops_only_that_path() {
    let mut subject = RecentProjects::default();

    subject.remember(project("/a", 1));
    subject.remember(project("/b", 2));
    subject.forget("/a");

    assert_eq!(paths(&subject), vec!["/b"]);
}

#[test]
fn restore_keeps_the_saved_order_and_repairs_duplicates_and_overflow() {
    let mut saved = vec![project("/a", 9), project("/b", 8), project("/a", 1)];

    saved.extend((0..10).map(|index| project(&format!("/old{index}"), 0)));

    let subject = RecentProjects::restore(saved);

    assert_eq!(subject.projects().len(), 10);
    assert_eq!(&paths(&subject)[..3], &["/a", "/b", "/old0"]);
    assert_eq!(subject.projects()[0].opened_at, 9);
}
