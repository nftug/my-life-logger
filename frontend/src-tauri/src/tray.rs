use tauri::{
    Manager, WindowEvent,
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
};

const MAIN_WINDOW_LABEL: &str = "main";
const TRAY_OPEN_MENU_ID: &str = "tray-open";
const TRAY_QUIT_MENU_ID: &str = "tray-quit";

pub fn setup(app: &tauri::App) -> tauri::Result<()> {
    setup_main_window_close_handler(app);
    setup_tray_icon(app)
}

fn setup_main_window_close_handler(app: &tauri::App) {
    let Some(main_window) = app.get_webview_window(MAIN_WINDOW_LABEL) else {
        return;
    };

    let window_to_hide = main_window.clone();
    main_window.on_window_event(move |event| {
        if let WindowEvent::CloseRequested { api, .. } = event {
            api.prevent_close();
            if let Err(error) = window_to_hide.hide() {
                eprintln!("failed to hide main window: {error}");
            }
        }
    });
}

fn setup_tray_icon(app: &tauri::App) -> tauri::Result<()> {
    let open_item = MenuItem::with_id(app, TRAY_OPEN_MENU_ID, "開く", true, None::<&str>)?;
    let quit_item = MenuItem::with_id(app, TRAY_QUIT_MENU_ID, "終了", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&open_item, &quit_item])?;
    let icon = app
        .default_window_icon()
        .cloned()
        .expect("the bundled application icon must be available");

    TrayIconBuilder::with_id("main-tray")
        .icon(icon)
        .icon_as_template(cfg!(target_os = "macos"))
        .tooltip("My Life Logger")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id().as_ref() {
            TRAY_OPEN_MENU_ID => {
                if let Err(error) = show_main_window(app) {
                    eprintln!("failed to show main window: {error}");
                }
            }
            TRAY_QUIT_MENU_ID => app.exit(0),
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
                && let Err(error) = toggle_main_window(tray.app_handle())
            {
                eprintln!("failed to toggle main window: {error}");
            }
        })
        .build(app)?;

    Ok(())
}

fn show_main_window(app: &tauri::AppHandle) -> tauri::Result<()> {
    let Some(main_window) = app.get_webview_window(MAIN_WINDOW_LABEL) else {
        return Ok(());
    };

    main_window.show()?;
    main_window.set_focus()
}

fn toggle_main_window(app: &tauri::AppHandle) -> tauri::Result<()> {
    let Some(main_window) = app.get_webview_window(MAIN_WINDOW_LABEL) else {
        return Ok(());
    };

    if main_window.is_visible()? {
        main_window.hide()
    } else {
        main_window.show()?;
        main_window.set_focus()
    }
}
