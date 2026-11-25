use std::path::Path;
use std::sync::Arc;
use std::sync::atomic::{AtomicUsize, Ordering};

use serde_json::{Value, json};

use crate::modules::projects::domain::errors::ProjectError;
use crate::modules::projects::domain::services::{ProjectHost, ProjectHostLauncher};

pub struct FakeLauncher {
    answer: Result<Value, ProjectError>,
    launched: Arc<AtomicUsize>,
    stopped: Arc<AtomicUsize>,
}

impl FakeLauncher {
    pub fn answering(answer: Result<Value, ProjectError>) -> Self {
        Self {
            answer,
            launched: Arc::default(),
            stopped: Arc::default(),
        }
    }

    pub fn launched_hosts(&self) -> usize {
        self.launched.load(Ordering::SeqCst)
    }

    pub fn stopped_hosts(&self) -> usize {
        self.stopped.load(Ordering::SeqCst)
    }
}

impl ProjectHostLauncher for FakeLauncher {
    fn launch(&self, _node: &Path) -> Result<Box<dyn ProjectHost>, ProjectError> {
        self.launched.fetch_add(1, Ordering::SeqCst);

        Ok(Box::new(FakeHost {
            answer: self.answer.clone(),
            stopped: Arc::clone(&self.stopped),
        }))
    }
}

struct FakeHost {
    answer: Result<Value, ProjectError>,
    stopped: Arc<AtomicUsize>,
}

impl ProjectHost for FakeHost {
    fn open(&self, _root: &str) -> Result<Value, ProjectError> {
        self.answer.clone()
    }

    fn start_deck(&self, id: &str) -> Result<Value, ProjectError> {
        Ok(json!({ "startedDeck": id }))
    }

    fn stop(&self) {
        self.stopped.fetch_add(1, Ordering::SeqCst);
    }
}
