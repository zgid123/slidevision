use std::sync::Mutex;
use std::sync::atomic::{AtomicUsize, Ordering};

use crate::modules::presentation::domain::errors::PresentationError;
use crate::modules::presentation::domain::services::PresentationWindows;
use crate::modules::presentation::domain::value_objects::PresentationPlan;

#[derive(Default)]
pub struct FakePresentationWindows {
    opened: Mutex<Vec<PresentationPlan>>,
    closed: AtomicUsize,
    failure: Option<PresentationError>,
}

impl FakePresentationWindows {
    pub fn failing(error: PresentationError) -> Self {
        Self {
            failure: Some(error),
            ..Self::default()
        }
    }

    pub fn opened(&self) -> Vec<PresentationPlan> {
        self.opened.lock().unwrap().clone()
    }

    pub fn closed_times(&self) -> usize {
        self.closed.load(Ordering::SeqCst)
    }
}

impl PresentationWindows for FakePresentationWindows {
    fn open(&self, plan: &PresentationPlan) -> Result<(), PresentationError> {
        if let Some(error) = &self.failure {
            return Err(error.clone());
        }

        self.opened.lock().unwrap().push(plan.clone());

        Ok(())
    }

    fn close(&self) {
        self.closed.fetch_add(1, Ordering::SeqCst);
    }
}
