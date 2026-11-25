use serde_json::Value;
use tauri::{AppHandle, Emitter};

use crate::modules::projects::domain::services::DeckRunListener;

const DECK_RUN_EVENT: &str = "deck-run";

pub struct DeckRunEmitter {
    app: AppHandle,
}

impl DeckRunEmitter {
    pub fn new(app: AppHandle) -> Self {
        Self { app }
    }
}

impl DeckRunListener for DeckRunEmitter {
    fn deck_run_changed(&self, run: Value) {
        let _ = self.app.emit(DECK_RUN_EVENT, run);
    }
}
