use std::fs;
use std::io;
use std::path::{Path, PathBuf};
use std::sync::Mutex;

use serde::{Deserialize, Serialize};

use crate::modules::projects::domain::entities::{RecentProject, RecentProjects};
use crate::modules::projects::domain::errors::ProjectError;
use crate::modules::projects::domain::repositories::RecentProjectsRepository as RecentProjectsRepositoryContract;

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct RecentProjectRecord {
    path: String,
    name: String,
    opened_at: u64,
}

pub struct RecentProjectsRepository {
    file: PathBuf,
    lock: Mutex<()>,
}

impl RecentProjectsRepository {
    pub fn new(file: PathBuf) -> Self {
        Self {
            file,
            lock: Mutex::new(()),
        }
    }

    fn read(&self) -> RecentProjects {
        let records: Vec<RecentProjectRecord> = fs::read_to_string(&self.file)
            .ok()
            .and_then(|text| serde_json::from_str(&text).ok())
            .unwrap_or_default();

        RecentProjects::restore(
            records
                .into_iter()
                .map(|record| RecentProject {
                    path: record.path,
                    name: record.name,
                    opened_at: record.opened_at,
                })
                .collect(),
        )
    }

    fn write(&self, recent: &RecentProjects) -> io::Result<()> {
        if let Some(dir) = self.file.parent() {
            fs::create_dir_all(dir)?;
        }

        let records: Vec<RecentProjectRecord> = recent
            .projects()
            .iter()
            .map(|project| RecentProjectRecord {
                path: project.path.clone(),
                name: project.name.clone(),
                opened_at: project.opened_at,
            })
            .collect();
        let temporary = temporary_path(&self.file);

        fs::write(&temporary, serde_json::to_vec_pretty(&records)?)?;
        fs::rename(&temporary, &self.file)
    }
}

impl RecentProjectsRepositoryContract for RecentProjectsRepository {
    fn load(&self) -> RecentProjects {
        let _guard = self.lock.lock().unwrap();

        self.read()
    }

    fn update(
        &self,
        change: &mut dyn FnMut(&mut RecentProjects),
    ) -> Result<RecentProjects, ProjectError> {
        let _guard = self.lock.lock().unwrap();
        let mut recent = self.read();

        change(&mut recent);
        self.write(&recent)
            .map_err(|error| ProjectError::Storage(error.to_string()))?;

        Ok(recent)
    }
}

fn temporary_path(file: &Path) -> PathBuf {
    let mut name = file.as_os_str().to_owned();

    name.push(".tmp");
    PathBuf::from(name)
}
