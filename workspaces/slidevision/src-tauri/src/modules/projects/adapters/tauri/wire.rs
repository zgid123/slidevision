use std::sync::Arc;

use tauri::path::BaseDirectory;
use tauri::{App, AppHandle, Manager};

use super::commands::Handlers;
use super::events::DeckRunEmitter;
use crate::modules::projects::application::commands::{
    CloseProjectCommandHandler, OpenProjectCommandHandler, RemoveRecentProjectCommandHandler,
    StartDeckCommandHandler,
};
use crate::modules::projects::application::queries::ListRecentProjectsQueryHandler;
use crate::modules::projects::application::state::ActiveProject;
use crate::modules::projects::infrastructure::json::RecentProjectsRepository;
use crate::modules::projects::infrastructure::node::Launcher;
use crate::modules::projects::infrastructure::shell::NodeRuntime;

const HOST_SCRIPT: &str = "lib/host.mjs";
const RECENT_FILE: &str = "recent-projects.json";

pub fn wire(app: &App) -> tauri::Result<Handlers> {
    let script = app.path().resolve(HOST_SCRIPT, BaseDirectory::Resource)?;
    let recent_file = app.path().app_data_dir()?.join(RECENT_FILE);
    let repository = Arc::new(RecentProjectsRepository::new(recent_file));
    let active_project = Arc::new(ActiveProject::default());
    let deck_runs = Arc::new(DeckRunEmitter::new(app.handle().clone()));

    Ok(Handlers {
        open_project: OpenProjectCommandHandler::new(
            Arc::new(NodeRuntime),
            Arc::new(Launcher::new(script, deck_runs)),
            repository.clone(),
            active_project.clone(),
        ),
        close_project: CloseProjectCommandHandler::new(active_project.clone()),
        remove_recent_project: RemoveRecentProjectCommandHandler::new(repository.clone()),
        list_recent_projects: ListRecentProjectsQueryHandler::new(repository),
        start_deck: StartDeckCommandHandler::new(active_project),
    })
}

pub fn unwire(app: &AppHandle) {
    if let Some(handlers) = app.try_state::<Handlers>() {
        handlers.close_project.execute();
    }
}
