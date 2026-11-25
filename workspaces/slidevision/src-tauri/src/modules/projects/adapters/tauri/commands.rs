use std::time::{SystemTime, UNIX_EPOCH};

use serde::Serialize;
use serde_json::Value;
use tauri::{AppHandle, Manager};

use crate::modules::projects::application::commands::{
    CloseProjectCommandHandler, OpenProjectCommand, OpenProjectCommandHandler,
    RemoveRecentProjectCommand, RemoveRecentProjectCommandHandler,
};
use crate::modules::projects::application::queries::{
    ListRecentProjectsQueryHandler, RecentProjectView,
};

pub struct Handlers {
    pub open_project: OpenProjectCommandHandler,
    pub close_project: CloseProjectCommandHandler,
    pub remove_recent_project: RemoveRecentProjectCommandHandler,
    pub list_recent_projects: ListRecentProjectsQueryHandler,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RecentProjectResponse {
    path: String,
    name: String,
    opened_at: u64,
    is_available: bool,
}

impl From<RecentProjectView> for RecentProjectResponse {
    fn from(view: RecentProjectView) -> Self {
        Self {
            path: view.project.path,
            name: view.project.name,
            opened_at: view.project.opened_at,
            is_available: view.is_available,
        }
    }
}

#[tauri::command]
pub async fn open_project(app: AppHandle, path: String) -> Result<Value, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let project = app
            .state::<Handlers>()
            .open_project
            .execute(OpenProjectCommand {
                path: path.clone(),
                opened_at: now(),
            })
            .map_err(|error| error.to_string())?;

        app.asset_protocol_scope()
            .allow_directory(&path, true)
            .map_err(|error| error.to_string())?;

        Ok(project)
    })
    .await
    .map_err(|error| error.to_string())?
}

#[tauri::command]
pub async fn close_project(app: AppHandle) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || {
        app.state::<Handlers>().close_project.execute();
    })
    .await
    .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn recent_projects(app: AppHandle) -> Vec<RecentProjectResponse> {
    to_responses(app.state::<Handlers>().list_recent_projects.execute())
}

#[tauri::command]
pub fn remove_recent_project(
    app: AppHandle,
    path: String,
) -> Result<Vec<RecentProjectResponse>, String> {
    app.state::<Handlers>()
        .remove_recent_project
        .execute(RemoveRecentProjectCommand { path })
        .map(to_responses)
        .map_err(|error| error.to_string())
}

fn to_responses(views: Vec<RecentProjectView>) -> Vec<RecentProjectResponse> {
    views.into_iter().map(RecentProjectResponse::from).collect()
}

fn now() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|elapsed| elapsed.as_millis() as u64)
        .unwrap_or_default()
}
