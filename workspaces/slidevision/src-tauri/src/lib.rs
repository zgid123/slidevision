mod adapters;
mod infrastructure;
mod modules;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    adapters::tauri::run();
}
