mod app;
mod menu;
#[cfg(target_os = "macos")]
mod window;
mod wire;

pub use app::run;
