use tauri::menu::{Menu, MenuEvent, MenuItemKind, Submenu};
use tauri::{AppHandle, Wry};

use crate::modules::presentation::adapters::tauri::wire as presentation;
use crate::modules::projects::adapters::tauri::menu as projects;

const FILE_MENU: &str = "File";

pub fn build(app: &AppHandle) -> tauri::Result<Menu<Wry>> {
    let menu = Menu::default(app)?;
    let file_menu = file_menu(app, &menu)?;

    for (position, item) in projects::file_items(app)?.iter().enumerate() {
        file_menu.insert(item, position)?;
    }

    Ok(menu)
}

pub fn handle(app: &AppHandle, event: MenuEvent) {
    presentation::end(app);
    projects::handle(app, &event);
}

fn file_menu(app: &AppHandle, menu: &Menu<Wry>) -> tauri::Result<Submenu<Wry>> {
    let existing = menu.items()?.into_iter().find_map(|item| match item {
        MenuItemKind::Submenu(submenu) if submenu.text().is_ok_and(|text| text == FILE_MENU) => {
            Some(submenu)
        }
        _ => None,
    });

    match existing {
        Some(file_menu) => Ok(file_menu),
        None => {
            let file_menu = Submenu::new(app, FILE_MENU, true)?;

            menu.insert(&file_menu, 1)?;

            Ok(file_menu)
        }
    }
}
