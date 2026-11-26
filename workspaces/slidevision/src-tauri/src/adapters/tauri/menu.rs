use tauri::menu::{Menu, MenuEvent, MenuItem, MenuItemKind, Submenu};
use tauri::{AppHandle, Emitter, Wry};

use crate::modules::presentation::adapters::tauri::wire as presentation;
use crate::modules::projects::adapters::tauri::menu as projects;

const FILE_MENU: &str = "File";
#[cfg(not(target_os = "macos"))]
const HELP_MENU: &str = "Help";
const CHECK_FOR_UPDATES_MENU_ID: &str = "check-for-updates";
const CHECK_FOR_UPDATES_EVENT: &str = "check-for-updates-requested";

pub fn build(app: &AppHandle) -> tauri::Result<Menu<Wry>> {
    let menu = Menu::default(app)?;
    let file_menu = submenu(app, &menu, FILE_MENU, 1)?;

    for (position, item) in projects::file_items(app)?.iter().enumerate() {
        file_menu.insert(item, position)?;
    }

    let check_for_updates = MenuItem::with_id(
        app,
        CHECK_FOR_UPDATES_MENU_ID,
        "Check for Updates…",
        true,
        None::<&str>,
    )?;

    insert_check_for_updates(app, &menu, &check_for_updates)?;

    Ok(menu)
}

pub fn handle(app: &AppHandle, event: MenuEvent) {
    if event.id() == CHECK_FOR_UPDATES_MENU_ID {
        let _ = app.emit(CHECK_FOR_UPDATES_EVENT, ());
        return;
    }

    presentation::end(app);
    projects::handle(app, &event);
}

#[cfg(target_os = "macos")]
fn insert_check_for_updates(
    _app: &AppHandle,
    menu: &Menu<Wry>,
    item: &MenuItem<Wry>,
) -> tauri::Result<()> {
    let app_menu = menu.items()?.into_iter().find_map(|entry| match entry {
        MenuItemKind::Submenu(submenu) => Some(submenu),
        _ => None,
    });

    if let Some(app_menu) = app_menu {
        app_menu.insert(item, 1)?;
    }

    Ok(())
}

#[cfg(not(target_os = "macos"))]
fn insert_check_for_updates(
    app: &AppHandle,
    menu: &Menu<Wry>,
    item: &MenuItem<Wry>,
) -> tauri::Result<()> {
    let fallback_position = menu.items()?.len();
    let help_menu = submenu(app, menu, HELP_MENU, fallback_position)?;

    help_menu.append(item)?;

    Ok(())
}

fn submenu(
    app: &AppHandle,
    menu: &Menu<Wry>,
    title: &str,
    fallback_position: usize,
) -> tauri::Result<Submenu<Wry>> {
    let existing = menu.items()?.into_iter().find_map(|item| match item {
        MenuItemKind::Submenu(submenu) if submenu.text().is_ok_and(|text| text == title) => {
            Some(submenu)
        }
        _ => None,
    });

    match existing {
        Some(submenu) => Ok(submenu),
        None => {
            let submenu = Submenu::new(app, title, true)?;

            menu.insert(&submenu, fallback_position)?;

            Ok(submenu)
        }
    }
}
