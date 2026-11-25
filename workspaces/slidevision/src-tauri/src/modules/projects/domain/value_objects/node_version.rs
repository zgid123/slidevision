use std::fmt;

#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub struct NodeVersion {
    major: u32,
    minor: u32,
    patch: u32,
}

impl NodeVersion {
    pub const SLIDEV_MINIMUM: NodeVersion = NodeVersion::new(22, 22, 0);

    pub const fn new(major: u32, minor: u32, patch: u32) -> Self {
        Self {
            major,
            minor,
            patch,
        }
    }

    pub fn parse(text: &str) -> Option<Self> {
        let mut parts = text.trim().trim_start_matches('v').split('.');
        let major = parts.next()?.parse().ok()?;
        let minor = parts.next()?.parse().ok()?;
        let patch = parts.next()?.parse().ok()?;

        Some(Self::new(major, minor, patch))
    }

    pub fn supports_slidev(&self) -> bool {
        *self >= Self::SLIDEV_MINIMUM
    }
}

impl fmt::Display for NodeVersion {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(formatter, "{}.{}.{}", self.major, self.minor, self.patch)
    }
}
