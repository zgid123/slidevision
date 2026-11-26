use url::Url;

use crate::modules::presentation::domain::errors::PresentationError;
use crate::modules::presentation::domain::value_objects::SlideNumber;

const LOCAL_HOSTS: [&str; 2] = ["localhost", "127.0.0.1"];

#[derive(Clone, Debug, PartialEq)]
pub struct DeckUrl(Url);

impl DeckUrl {
    pub fn parse(text: &str) -> Result<Self, PresentationError> {
        let invalid = || PresentationError::InvalidDeckUrl(text.to_string());
        let url = Url::parse(text).map_err(|_| invalid())?;
        let is_local = url
            .host_str()
            .is_some_and(|host| LOCAL_HOSTS.contains(&host));

        if url.scheme() != "http"
            || !is_local
            || url.port().is_none()
            || url.path() != "/"
            || url.query().is_some()
            || url.fragment().is_some()
        {
            return Err(invalid());
        }

        Ok(Self(url))
    }

    pub fn slide(&self, no: SlideNumber) -> String {
        format!("{}{no}", self.0)
    }

    pub fn presenter(&self, no: SlideNumber) -> String {
        format!("{}presenter/{no}", self.0)
    }
}
