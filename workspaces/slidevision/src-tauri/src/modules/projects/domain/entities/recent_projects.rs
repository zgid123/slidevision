use std::path::Path;

const RECENT_PROJECTS_LIMIT: usize = 10;

#[derive(Clone, Debug, PartialEq)]
pub struct RecentProject {
    pub path: String,
    pub name: String,
    pub opened_at: u64,
}

impl RecentProject {
    pub fn opened(path: &str, opened_at: u64) -> Self {
        let name = Path::new(path)
            .file_name()
            .map(|name| name.to_string_lossy().into_owned())
            .unwrap_or_else(|| path.to_string());

        Self {
            path: path.to_string(),
            name,
            opened_at,
        }
    }
}

#[derive(Clone, Debug, Default, PartialEq)]
pub struct RecentProjects {
    projects: Vec<RecentProject>,
}

impl RecentProjects {
    pub fn restore(saved: Vec<RecentProject>) -> Self {
        saved
            .into_iter()
            .rev()
            .fold(Self::default(), |mut recent, project| {
                recent.remember(project);
                recent
            })
    }

    pub fn remember(&mut self, project: RecentProject) {
        self.forget(&project.path);
        self.projects.insert(0, project);
        self.projects.truncate(RECENT_PROJECTS_LIMIT);
    }

    pub fn forget(&mut self, path: &str) {
        self.projects.retain(|project| project.path != path);
    }

    pub fn projects(&self) -> &[RecentProject] {
        &self.projects
    }
}
