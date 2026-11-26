use crate::modules::presentation::domain::errors::PresentationError;
use crate::modules::presentation::domain::value_objects::PresentationPlan;

pub trait PresentationWindows: Send + Sync {
    fn open(&self, plan: &PresentationPlan) -> Result<(), PresentationError>;

    fn close(&self);
}
