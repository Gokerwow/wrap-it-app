use std::{io::Cursor, path::PathBuf, sync::Mutex};

use base64::{Engine, engine::general_purpose};
use image::{ImageFormat, load_from_memory};
use tauri::{
    App, LogicalPosition, LogicalSize, Listener, Manager, WebviewUrl, WindowBuilder, webview::WebviewBuilder
};
use tauri_plugin_opener::OpenerExt;

struct AppLayoutState {
    sidebar_width: Mutex<f64>,
}

#[derive(serde::Serialize, serde::Deserialize, Default)]
pub struct AppConfig {
    // ── Wallpaper ─────────────────────────────────────────────────────────
    pub wallpaper_url: Option<String>,  // Remote image URL for wallpaper
    pub local_path: Option<String>,     // Local file path if use_local is true
    #[serde(default)]
    pub use_local: bool,                // Whether to use local file instead of URL
    #[serde(default)]
    pub compress_image: bool,           // Compress wallpaper before injecting

    // ── WhatsApp CSS Variable Overrides ───────────────────────────────────
    pub main_color: Option<String>,                 // --WDS-accent
    pub content_deemphasized: Option<String>,       // Sidebar secondary text
    pub bubble_surface_incoming: Option<String>,    // Incoming bubble background
    pub bubble_surface_outgoing: Option<String>,    // Outgoing bubble background
    pub chat_surface_composer: Option<String>,      // Message input background
    pub surface_highlight: Option<String>,          // Active/hover highlight in chat list
    pub surface_default: Option<String>,            // Headers and chat list bars
    pub persistent_always_branded: Option<String>,  // Unread count badge color
    pub content_default: Option<String>,            // Chat title text color
    pub surface_emphasized: Option<String>,         // Right sidebar background
    pub message_primary: Option<String>,            // Bubble text color
    pub content_read: Option<String>,               // Read checkmark color
    pub content_on_accent: Option<String>,          // Unread count text color
    pub components_active_list_row: Option<String>, // Right sidebar active row
    pub background_default: Option<String>,         // Chat list background
    pub chat_background_wallpaper: Option<String>,  // Chat area background color layer

    // ── Fixes ─────────────────────────────────────────────────────────────
    pub search_container_fix: Option<String>, // "as-is" | "fixed" — margin→padding fix
    pub custom_css: Option<String>,
}

#[derive(Default)]
pub struct RuntimeState {
    // ── Active Session ────────────────────────────────────────────────────
    pub active_wallpaper_b64: String, // Base64 wallpaper, kept in RAM (~500KB), not in config
    pub active_custom_css: String,    // Raw BetterDiscord-style user styles text block
    pub sidebar_width_px: i32,        // Active pixel width for smooth dragging overrides

    // ── WhatsApp CSS Variable Overrides ───────────────────────────────────
    pub main_color: String,                 // --WDS-accent
    pub content_deemphasized: String,       // Sidebar secondary text
    pub bubble_surface_incoming: String,    // Incoming bubble background
    pub bubble_surface_outgoing: String,    // Outgoing bubble background
    pub chat_surface_composer: String,      // Message input background
    pub surface_highlight: String,          // Active/hover highlight in chat list
    pub surface_default: String,            // Headers and chat list bars
    pub persistent_always_branded: String,  // Unread count badge color
    pub content_default: String,            // Chat title text color
    pub surface_emphasized: String,         // Right sidebar background
    pub message_primary: String,            // Bubble text color
    pub content_read: String,               // Read checkmark color
    pub content_on_accent: String,          // Unread count text color
    pub components_active_list_row: String, // Right sidebar active row
    pub background_default: String,         // Chat list background
    pub chat_background_wallpaper: String,  // Chat area background color layer

    // ── Fixes ─────────────────────────────────────────────────────────────
    pub search_container_fix: String, // "as-is" | "fixed" — margin→padding fix
}
pub struct AppRamState(pub Mutex<RuntimeState>);

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn halo(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn resize_sidebar(app_handle: tauri::AppHandle, state: tauri::State<'_, AppLayoutState>, new_width: f64) {
    if let Ok(mut guard) = state.sidebar_width.lock() {
        *guard =new_width
    }
    if let Some(main_window) = app_handle.get_window("main") {
        if let (Some(svelte_view), Some(whatsapp_view)) = (
            main_window.get_webview("main_ui"),
            main_window.get_webview("whatsapp")
        ) {
            let monitor_scale = main_window.scale_factor().unwrap_or(1.0);
            let size = main_window.inner_size().unwrap_or(tauri::PhysicalSize::new(1200, 800));
            let window_width = size.width as f64 / monitor_scale;
            let window_height = size.height as f64 / monitor_scale;

            let _ = svelte_view.set_size(tauri::Size::Logical(
                tauri::LogicalSize::new(new_width, window_height)
            ));

            let _ = whatsapp_view.set_position(tauri::Position::Logical(
                tauri::LogicalPosition::new(new_width, 0.0)
            ));

            let remaining_width = window_width - new_width;
            let _ = whatsapp_view.set_size(tauri::Size::Logical(
                tauri::LogicalSize::new(remaining_width, window_height)
            ));
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppLayoutState {
            sidebar_width: Mutex::new(260.0),
        })
        .setup(|app| {
            let app_handle_badge = app.handle().clone();
            app.listen("badge-update", move |event| {
                let raw_payload = event.payload();
                println!("🔥 BADGE EVENT ARRIVED IN RUST: {}", raw_payload);
                
                // Clean any quotes in case it arrives as "\"2\"" instead of "2"
                let clean_str = raw_payload.trim_matches(|c| c == '"' || c == '\'');
                
                if let Ok(count) = clean_str.parse::<i32>() {
                    // Call your existing command natively!
                    update_badge_count(app_handle_badge.clone(), count);
                } else {
                    println!("Failed to parse badge count from: {}", raw_payload);
                }
            });

            setup_desktop_layout(app) 
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            greet, 
            halo, 
            resize_sidebar,
            set_chat_wallpaper,
            set_chat_wallpaper_local,
            reset_wallpaper_default,
            set_accent_color,
            set_content_deemphasized,
            set_bubble_surface_incoming,
            set_bubble_surface_outgoing,
            set_chat_surface_composer,
            set_surface_highlight,
            set_surface_default,
            set_persistent_always_branded,
            set_content_default,
            set_surface_emphasized,
            set_message_primary,
            set_content_read,
            set_content_on_accent,
            set_components_active_list_row,
            set_background_default,
            set_chat_background_wallpaper,
            update_badge_count,
            reset_all_colors,
            reset_everything,
            reset_main_color,
            reset_content_deemphasized,
            reset_bubble_surface_incoming,
            reset_bubble_surface_outgoing,
            reset_chat_surface_composer,
            reset_surface_highlight,
            reset_surface_default,
            reset_persistent_always_branded,
            reset_content_default,
            reset_surface_emphasized,
            reset_message_primary,
            reset_content_read,
            reset_content_on_accent,
            reset_components_active_list_row,
            reset_background_default,
            reset_chat_background_wallpaper,
            get_config_for_frontend,
            apply_config,
            set_custom_css
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn setup_desktop_layout(app: &mut App) -> Result<(), Box<dyn std::error::Error>> {
    
    // 1. Create the raw native window frame wrapper canvas
    let main_window = WindowBuilder::new(app, "main")
        .title("Wrap It App")
        .inner_size(1200.0, 800.0)
        .resizable(true)
        .build()?;

    // 2. Build your local user interface layer child frame (Svelte Workspace)
    let svelte_builder = WebviewBuilder::new(
        "main_ui", 
        WebviewUrl::App("index.html".into())
    );
    
    let svelte_view = main_window.add_child(
        svelte_builder,
        LogicalPosition::new(0.0, 0.0),
        LogicalSize::new(260.0, 800.0),
    )?;

    let app_handle = app.handle().clone();
    let app_handle_for_nav = app_handle.clone();
    let app_handle_for_config = app_handle_for_nav.clone();
    let app_handle_for_load = app_handle.clone();
    
    let parsed_config = get_parsed_config(&app_handle).unwrap_or_default();

    let has_wallpaper = parsed_config.wallpaper_url.is_some() || parsed_config.local_path.is_some();

    if has_wallpaper {
        if parsed_config.use_local {
            if let Some(path) = parsed_config.local_path {
                tauri::async_runtime::spawn(async move {
                    let _ = set_chat_wallpaper_local(app_handle_for_config.clone(), path, parsed_config.compress_image, false).await;
                });
            }
        } else {
            if let Some(url) = parsed_config.wallpaper_url {
                tauri::async_runtime::spawn(async move {
                    let _ = set_chat_wallpaper(app_handle_for_config.clone(), url, parsed_config.compress_image, false).await;
                });
            }
        }
    }

    let initial_ram_state = RuntimeState {
        main_color:                 parsed_config.main_color.unwrap_or_default(),
        content_deemphasized:       parsed_config.content_deemphasized.unwrap_or_default(),
        bubble_surface_incoming:    parsed_config.bubble_surface_incoming.unwrap_or_default(),
        bubble_surface_outgoing:    parsed_config.bubble_surface_outgoing.unwrap_or_default(),
        chat_surface_composer:      parsed_config.chat_surface_composer.unwrap_or_default(),
        surface_highlight:          parsed_config.surface_highlight.unwrap_or_default(),
        surface_default:            parsed_config.surface_default.unwrap_or_default(),
        persistent_always_branded:  parsed_config.persistent_always_branded.unwrap_or_default(),
        content_default:            parsed_config.content_default.unwrap_or_default(),
        surface_emphasized:         parsed_config.surface_emphasized.unwrap_or_default(),
        message_primary:            parsed_config.message_primary.unwrap_or_default(),
        content_read:               parsed_config.content_read.unwrap_or_default(),
        content_on_accent:          parsed_config.content_on_accent.unwrap_or_default(),
        components_active_list_row: parsed_config.components_active_list_row.unwrap_or_default(),
        background_default:         parsed_config.background_default.unwrap_or_default(),
        chat_background_wallpaper:  parsed_config.chat_background_wallpaper.unwrap_or_default(),
        search_container_fix:       parsed_config.search_container_fix.unwrap_or_else(|| "as-is".to_string()),
        active_custom_css:          parsed_config.custom_css.unwrap_or_default(),
        ..Default::default()
    };
    
    app.manage(AppRamState(Mutex::new(initial_ram_state)));
        
    // 3. Build your secure isolated external contents child frame (WhatsApp Web)
    let whatsapp_builder = WebviewBuilder::new(
        "whatsapp",
        WebviewUrl::External("https://web.whatsapp.com".parse().unwrap()),
    )
    .user_agent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    .on_navigation(move |url| {
        // Check the host instantly to skip unrelated navigations
        if url.host_str() == Some("web.whatsapp.com") {
            true
        } else {
            // It's an external link redirect! Open it in default system browser
            println!("External Navigation Intercepted: Opening {} in system browser", url);
            let opener = app_handle_for_nav.opener();
            let _ = opener.open_url(url.as_str(), None::<&str>);
            false // Prevent loading the external URL inside the WhatsApp webview
        }
    })
    .on_page_load(move |_, payload| {
        if payload.event() == tauri::webview::PageLoadEvent::Finished {
            println!("Page finished loading: refreshing webview styles!");
            let app_handle_clone = app_handle_for_load.clone();
            tauri::async_runtime::spawn(async move {
                refresh_webview_styles(&app_handle_clone);
            });
        }
    })
    .initialization_script("window.__TAURI_IPC__ = window.__tauri_ipc__;")
    .initialization_script(include_str!("../preload.js"))
    .initialization_script(include_str!("./assets/badge.js"));

    let whatsapp_view = main_window.add_child(
        whatsapp_builder,
        LogicalPosition::new(260.0, 0.0),
        LogicalSize::new(940.0, 800.0),
    )?;

    let window_clone = main_window.clone();

    main_window.on_window_event(move |event|{
        let scale_factor = window_clone.scale_factor().unwrap_or(1.0);
        // window event nih sama kayak click event di jS, jadi nunggu adanya event baru jalan
        if let tauri::WindowEvent::Resized(physical_size) = event {
            let state = app_handle.state::<AppLayoutState>();

            let current_sidebar_width = match state.sidebar_width.lock() {
                Ok(guard) => *guard,
                Err(_) => 200.0,
            };
            // langsung ngambil dari window manager nya
            let window_width = physical_size.width as f64 / scale_factor;
            let window_height = physical_size.height as f64 / scale_factor;

            let _ = svelte_view.set_size(tauri::Size::Logical(
                LogicalSize::new(current_sidebar_width, window_height)
            ));

            let remaining_width = window_width - current_sidebar_width;
            let _ = whatsapp_view.set_size(tauri::Size::Logical(
                LogicalSize::new(remaining_width, window_height)
            ));
        }
    });

    Ok(())
}

// Set wallpaper using URL by comprssing the image to 1920
#[tauri::command]
async fn set_chat_wallpaper(app_handle: tauri::AppHandle, wallpaper_url: String, compress_image: bool, save_to_config: bool) -> Result<(), String> {
    let response = reqwest::get(&wallpaper_url)
        .await
        .map_err(|e| format!("Failed to download wallpaper: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("Server returned HTTP status: {}", response.status()));
    }

    let image_bytes = response.bytes()
        .await
        .map_err(|e| format!("Failed to read image bytes: {}", e))?;

    println!("GET THE IMAGE Url: {}", wallpaper_url);
    let max_dimension = 1920;
    let bytes_to_encode = tauri::async_runtime::spawn_blocking(move || {
        if compress_image {
            compress_image_to_jpeg(&image_bytes, max_dimension)
        } else {
            image_bytes.to_vec()
        }
    }).await.map_err(|e| format!("Image processing task failed: {}", e))?;

    if !compress_image {
        if let Err(e) = load_from_memory(&bytes_to_encode) {
            return Err(format!("Invalid image file format: {}", e));
        }
    }

    let b64_encoded_string = general_purpose::STANDARD.encode(&bytes_to_encode);

    let ram_state = app_handle.state::<AppRamState>();
    if let Ok(mut cache) = ram_state.inner().0.lock() {
        cache.active_wallpaper_b64 = b64_encoded_string;
    }

    if save_to_config {
        update_config(&app_handle, |configs| {
            configs.wallpaper_url = Some(wallpaper_url);
            configs.use_local = false;
            configs.local_path = None;
            configs.compress_image = compress_image;
        });
    }

    refresh_webview_styles(&app_handle);
    Ok(())
}

// Set wallpaper using local file path by comprssing the image to 1920
#[tauri::command]
async fn set_chat_wallpaper_local(app_handle: tauri::AppHandle, file_path: String, compress_image: bool, save_to_config: bool) -> Result<(), String> {
    // 1. Still use a background thread so reading a massive 4K image 
    // from a slow hard drive won't drop frames in your Svelte UI!
    // 2. Read the raw bytes straight from the local disk path
    let image_bytes = tokio::fs::read(&file_path)
        .await
        .map_err(|e| format!("Failed to read local file: {}", e))?;

    let max_dimension = 1920;
    let bytes_to_encode = tauri::async_runtime::spawn_blocking(move || {
        if compress_image {
            compress_image_to_jpeg(&image_bytes, max_dimension)
        } else {
            image_bytes.to_vec()
        }
    }).await.map_err(|e| format!("Image processing task failed: {}", e))?;

    if !compress_image {
        if let Err(e) = load_from_memory(&bytes_to_encode) {
            return Err(format!("Invalid image file format: {}", e));
        }
    }

    // 5. Encode the tiny compressed JPEG bytes into a Base64 string
    let b64_encoded_string = general_purpose::STANDARD.encode(&bytes_to_encode);

    let ram_state = app_handle.state::<AppRamState>();
    if let Ok(mut cache) = ram_state.inner().0.lock() {
        cache.active_wallpaper_b64 = b64_encoded_string;
    }

    if save_to_config {
        update_config(&app_handle, |configs| {
            configs.wallpaper_url = None;
            configs.use_local = true;
            configs.local_path = Some(file_path);
            configs.compress_image = compress_image;
        });
    }

    refresh_webview_styles(&app_handle);
    Ok(())
}

#[tauri::command]
fn get_config_for_frontend(app_handle: tauri::AppHandle) -> Result<AppConfig, String> {
    get_parsed_config(&app_handle).map_err(|e| e.to_string())
}

#[tauri::command]
fn reset_wallpaper_default(app_handle: tauri::AppHandle) {
    // 1. Clear wallpaper from config (disk)
    update_config(&app_handle, |config| {
        config.wallpaper_url = None;
        config.local_path    = None;
        config.use_local     = false;
    });
 
    // 2. Clear wallpaper from RAM
    let ram = app_handle.state::<AppRamState>();
    let mut state = ram.0.lock().unwrap();
    state.active_wallpaper_b64 = String::new();
    drop(state);
 
    // 3. Remove the wallpaper element from the WhatsApp webview
    std::thread::spawn(move || {
        if let Some(main_window) = app_handle.get_window("main") {
            if let Some(whatsapp_view) = main_window.get_webview("whatsapp") {
                let js = "
                    (function () {
                        if (!document.body) return
                        const root = document.body;
                        root.style.removeProperty('--whats-wrap-wallpaper');
                    })();
                ";
                let _ = whatsapp_view.eval(js);
            }
        }
    });
}
 
/// Resets every CSS custom property that customization_injector.js writes,
/// restoring WhatsApp to its own default styling.
#[tauri::command]
fn reset_all_colors(app_handle: tauri::AppHandle) {
    // 1. Clear all color overrides from config (disk)
    update_config(&app_handle, |config| {
        config.main_color                 = None;
        config.content_deemphasized       = None;
        config.bubble_surface_incoming    = None;
        config.bubble_surface_outgoing    = None;
        config.chat_surface_composer      = None;
        config.surface_highlight          = None;
        config.surface_default            = None;
        config.persistent_always_branded  = None;
        config.content_default            = None;
        config.surface_emphasized         = None;
        config.message_primary            = None;
        config.content_read               = None;
        config.content_on_accent          = None;
        config.components_active_list_row = None;
        config.background_default         = None;
        config.chat_background_wallpaper  = None;
    });
 
    // 2. Restore all color fields in RAM to their defaults
    let ram = app_handle.state::<AppRamState>();
    let mut state = ram.0.lock().unwrap();
    state.main_color                 = String::new();
    state.content_deemphasized       = String::new();
    state.bubble_surface_incoming    = String::new();
    state.bubble_surface_outgoing    = String::new();
    state.chat_surface_composer      = String::new();
    state.surface_highlight          = String::new();
    state.surface_default            = String::new();
    state.persistent_always_branded  = String::new();
    state.content_default            = String::new();
    state.surface_emphasized         = String::new();
    state.message_primary            = String::new();
    state.content_read               = String::new();
    state.content_on_accent          = String::new();
    state.components_active_list_row = String::new();
    state.background_default         = String::new();
    state.chat_background_wallpaper  = String::new();
    drop(state);
 
    // 3. Remove all CSS custom properties from the WhatsApp webview
    std::thread::spawn(move || {
        if let Some(main_window) = app_handle.get_window("main") {
            if let Some(whatsapp_view) = main_window.get_webview("whatsapp") {
                let js = "
                    (function () {
                        if (window.__whatsWrapState) {
                            for (let key in window.__whatsWrapState) {
                                window.__whatsWrapState[key] = '';
                            }
                            if(window.__whatsWrapUpdateTheme) window.__whatsWrapUpdateTheme();
                        }
                    })();
                ";
                let _ = whatsapp_view.eval(js);
            }
        }
    });
}
 
/// Resets everything — all color overrides and the wallpaper — back to defaults.
#[tauri::command]
fn reset_everything(app_handle: tauri::AppHandle) {
    // 1. Clear everything from config (disk) in a single write
    update_config(&app_handle, |config| {
        config.wallpaper_url              = None;
        config.local_path                 = None;
        config.use_local                  = false;
        config.main_color                 = None;
        config.content_deemphasized       = None;
        config.bubble_surface_incoming    = None;
        config.bubble_surface_outgoing    = None;
        config.chat_surface_composer      = None;
        config.surface_highlight          = None;
        config.surface_default            = None;
        config.persistent_always_branded  = None;
        config.content_default            = None;
        config.surface_emphasized         = None;
        config.message_primary            = None;
        config.content_read               = None;
        config.content_on_accent          = None;
        config.components_active_list_row = None;
        config.background_default         = None;
        config.chat_background_wallpaper  = None;
        config.custom_css                 = None;
    });
 
    // 2. Restore everything in RAM to defaults in a single lock
    let ram = app_handle.state::<AppRamState>();
    let mut state = ram.0.lock().unwrap();
    state.active_wallpaper_b64       = String::new();
    state.main_color                 = String::new();
    state.content_deemphasized       = String::new();
    state.bubble_surface_incoming    = String::new();
    state.bubble_surface_outgoing    = String::new();
    state.chat_surface_composer      = String::new();
    state.surface_highlight          = String::new();
    state.surface_default            = String::new();
    state.persistent_always_branded  = String::new();
    state.content_default            = String::new();
    state.surface_emphasized         = String::new();
    state.message_primary            = String::new();
    state.content_read               = String::new();
    state.content_on_accent          = String::new();
    state.components_active_list_row = String::new();
    state.background_default         = String::new();
    state.chat_background_wallpaper  = String::new();
    state.active_custom_css          = String::new();
    drop(state);
 
    // 3. Clean up the WhatsApp webview in a single eval
    std::thread::spawn(move || {
        if let Some(main_window) = app_handle.get_window("main") {
            if let Some(whatsapp_view) = main_window.get_webview("whatsapp") {
                let js = "
                    (function () {
                        document.body.style.removeProperty('--whats-wrap-wallpaper');
                        if (window.__whatsWrapState) {
                            for (let key in window.__whatsWrapState) {
                                window.__whatsWrapState[key] = '';
                            }
                            if(window.__whatsWrapUpdateTheme) window.__whatsWrapUpdateTheme();
                        }
                        
                        const tag = document.getElementById('wrap-wallpaper-engine');
                        if (tag) tag.remove();

                        const customCssTag = document.getElementById('wrap-custom-css');
                        if (customCssTag) customCssTag.remove();
                    })();
                ";
                let _ = whatsapp_view.eval(js);
            }
        }
    });
}

#[tauri::command]
async fn set_custom_css(app_handle: tauri::AppHandle, css: String, save_to_config: bool) {
    let ram_state = app_handle.state::<AppRamState>();
    if let Ok(mut cache) = ram_state.inner().0.lock() {
        cache.active_custom_css = css.clone();
    }
    
    if let Some(main_window) = app_handle.get_window("main") {
        if let Some(whatsapp_view) = main_window.get_webview("whatsapp") {
            let js_payload = format!(
                "if(window.__whatsWrapUpdateCustomCss) window.__whatsWrapUpdateCustomCss({});",
                serde_json::to_string(&css).unwrap()
            );
            let _ = whatsapp_view.eval(&js_payload);
        }
    }

    if save_to_config {
        update_config(&app_handle, |config| {
            config.custom_css = Some(css);
        });
    }
}
 
// ── Per-color reset commands ──────────────────────────────────────────────────
// Each command:
//   1. Nulls the field in config (disk)
//   2. Restores the field in RuntimeState (RAM) to its default value
//   3. Removes the CSS custom property from the WhatsApp webview
macro_rules! reset_color_command {
    (
        $fn_name:ident,
        $config_field:ident,
        $state_field:ident,
        $css_prop:literal
    ) => {
        #[tauri::command]
        fn $fn_name(app_handle: tauri::AppHandle) {
            update_config(&app_handle, |config| {
                config.$config_field = None;
            });
 
            let ram = app_handle.state::<AppRamState>();
            let mut state = ram.0.lock().unwrap();
            state.$state_field = String::new();
            drop(state);
 
            std::thread::spawn(move || {
                if let Some(main_window) = app_handle.get_window("main") {
                    if let Some(whatsapp_view) = main_window.get_webview("whatsapp") {
                        // FIX: Call the global JS updater and send an empty string
                        let js = concat!(
                            "if(window.__whatsWrapUpdateTheme) window.__whatsWrapUpdateTheme('",
                            $css_prop,
                            "', '');"
                        );
                        let _ = whatsapp_view.eval(js);
                    }
                }
            });
        }
    };
}
//                           fn name                         config field              state field               css property
reset_color_command!(reset_main_color,                 main_color,                 main_color,                 "--WDS-accent");
reset_color_command!(reset_content_deemphasized,       content_deemphasized,       content_deemphasized,       "--WDS-content-deemphasized");
reset_color_command!(reset_bubble_surface_incoming,    bubble_surface_incoming,    bubble_surface_incoming,    "--WDS-systems-bubble-surface-incoming");
reset_color_command!(reset_bubble_surface_outgoing,    bubble_surface_outgoing,    bubble_surface_outgoing,    "--WDS-systems-bubble-surface-outgoing");
reset_color_command!(reset_chat_surface_composer,      chat_surface_composer,      chat_surface_composer,      "--WDS-systems-chat-surface-composer");
reset_color_command!(reset_surface_highlight,          surface_highlight,          surface_highlight,          "--WDS-surface-highlight");
reset_color_command!(reset_surface_default,            surface_default,            surface_default,            "--WDS-surface-default");
reset_color_command!(reset_persistent_always_branded,  persistent_always_branded,  persistent_always_branded,  "--WDS-persistent-always-branded");
reset_color_command!(reset_content_default,            content_default,            content_default,            "--WDS-content-default");
reset_color_command!(reset_surface_emphasized,         surface_emphasized,         surface_emphasized,         "--WDS-surface-emphasized");
reset_color_command!(reset_message_primary,            message_primary,            message_primary,            "--message-primary");
reset_color_command!(reset_content_read,               content_read,               content_read,               "--WDS-content-read");
reset_color_command!(reset_content_on_accent,          content_on_accent,          content_on_accent,          "--WDS-content-on-accent");
reset_color_command!(reset_components_active_list_row, components_active_list_row, components_active_list_row, "--WDS-components-active-list-row");
reset_color_command!(reset_background_default,         background_default,         background_default,         "--background-default");
reset_color_command!(reset_chat_background_wallpaper,  chat_background_wallpaper,  chat_background_wallpaper,  "--WDS-systems-chat-background-wallpaper");

#[tauri::command]
fn update_badge_count(app_handle: tauri::AppHandle, count: i32) {
    if count > 0 {
        #[cfg(not(target_os = "windows"))]
        {
            let _ = app_handle.set_app_badge_count(Some(count));
        }

        #[cfg(target_os = "windows")]
        {
            if let Some(window) = app_handle.get_window("main") {
                let (rgba, width, height) = create_badge_rgba(count);
                let img = tauri::image::Image::new_owned(rgba, width, height);
                let _ = window.set_overlay_icon(Some(img));
            }
        }
    } else {
        #[cfg(not(target_os = "windows"))]
        let _ = app_handle.set_app_badge_count(None);

        #[cfg(target_os = "windows")]
        {
            if let Some(window) = app_handle.get_window("main") {
                let _ = window.set_overlay_icon(None);
            }
        }
    }
}

#[cfg(target_os = "windows")]
fn create_badge_rgba(count: i32) -> (Vec<u8>, u32, u32) {
    let size = 64u32;
    let mut rgba = vec![0u8; (size * size * 4) as usize];

    let cx = size as f32 / 2.0;
    let cy = size as f32 / 2.0;

    // --- White backing ring (slightly larger circle behind the red one) ---
    let ring_r = 30.0f32;
    for y in 0..size {
        for x in 0..size {
            let idx = ((y * size + x) * 4) as usize;
            let dx = x as f32 - cx;
            let dy = y as f32 - cy;
            let dist = (dx * dx + dy * dy).sqrt();

            // Supersampled edge for the white ring
            let mut coverage = 0u32;
            let samples = 4u32;
            for sy in 0..samples {
                for sx in 0..samples {
                    let fx = x as f32 + (sx as f32 + 0.5) / samples as f32;
                    let fy = y as f32 + (sy as f32 + 0.5) / samples as f32;
                    let ddx = fx - cx;
                    let ddy = fy - cy;
                    if ddx * ddx + ddy * ddy <= ring_r * ring_r {
                        coverage += 1;
                    }
                }
            }
            if coverage > 0 {
                let alpha = (coverage * 255 / (samples * samples)) as u8;
                rgba[idx]     = 255;
                rgba[idx + 1] = 255;
                rgba[idx + 2] = 255;
                rgba[idx + 3] = alpha;
            }
        }
    }

    // --- Red filled circle (inset from white ring, leaving a visible white border) ---
    let red_r = 25.0f32;
    for y in 0..size {
        for x in 0..size {
            let idx = ((y * size + x) * 4) as usize;
            let mut coverage = 0u32;
            let samples = 4u32;
            for sy in 0..samples {
                for sx in 0..samples {
                    let fx = x as f32 + (sx as f32 + 0.5) / samples as f32;
                    let fy = y as f32 + (sy as f32 + 0.5) / samples as f32;
                    let ddx = fx - cx;
                    let ddy = fy - cy;
                    if ddx * ddx + ddy * ddy <= red_r * red_r {
                        coverage += 1;
                    }
                }
            }
            if coverage > 0 {
                let alpha = (coverage * 255 / (samples * samples)) as u8;
                rgba[idx]     = 235;
                rgba[idx + 1] = 57;
                rgba[idx + 2] = 57;
                rgba[idx + 3] = alpha;
            }
        }
    }

    let label = if count > 9 { "9+".to_string() } else { count.to_string() };
    draw_text_rgba(&mut rgba, size, &label);

    (rgba, size, size)
}

#[cfg(target_os = "windows")]
fn draw_text_rgba(rgba: &mut Vec<u8>, img_size: u32, text: &str) {
    let glyphs: std::collections::HashMap<char, [[u8; 5]; 9]> = [
        ('0', [[0,1,1,1,0],[1,1,0,1,1],[1,1,0,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,0,1,1],[1,1,0,1,1],[1,1,0,1,1],[0,1,1,1,0]]),
        ('1', [[0,1,1,0,0],[1,1,1,0,0],[0,1,1,0,0],[0,1,1,0,0],[0,1,1,0,0],[0,1,1,0,0],[0,1,1,0,0],[0,1,1,0,0],[1,1,1,1,1]]),
        ('2', [[0,1,1,1,0],[1,1,0,1,1],[0,0,0,1,1],[0,0,0,1,1],[0,0,1,1,0],[0,1,1,0,0],[1,1,0,0,0],[1,1,0,0,0],[1,1,1,1,1]]),
        ('3', [[0,1,1,1,0],[1,1,0,1,1],[0,0,0,1,1],[0,0,0,1,1],[0,0,1,1,0],[0,0,0,1,1],[0,0,0,1,1],[1,1,0,1,1],[0,1,1,1,0]]),
        ('4', [[0,0,1,1,0],[0,1,1,1,0],[1,1,0,1,0],[1,1,0,1,0],[1,1,1,1,1],[1,1,1,1,1],[0,0,0,1,0],[0,0,0,1,0],[0,0,0,1,0]]),
        ('5', [[1,1,1,1,1],[1,1,0,0,0],[1,1,0,0,0],[1,1,1,1,0],[0,0,0,1,1],[0,0,0,1,1],[0,0,0,1,1],[1,1,0,1,1],[0,1,1,1,0]]),
        ('6', [[0,1,1,1,0],[1,1,0,0,0],[1,1,0,0,0],[1,1,1,1,0],[1,1,0,1,1],[1,0,0,1,1],[1,0,0,1,1],[1,1,0,1,1],[0,1,1,1,0]]),
        ('7', [[1,1,1,1,1],[1,1,1,1,1],[0,0,0,1,1],[0,0,1,1,0],[0,0,1,1,0],[0,1,1,0,0],[0,1,1,0,0],[0,1,1,0,0],[0,1,1,0,0]]),
        ('8', [[0,1,1,1,0],[1,1,0,1,1],[1,1,0,1,1],[1,1,0,1,1],[0,1,1,1,0],[1,1,0,1,1],[1,1,0,1,1],[1,1,0,1,1],[0,1,1,1,0]]),
        ('9', [[0,1,1,1,0],[1,1,0,1,1],[1,1,0,1,1],[1,1,0,1,1],[0,1,1,1,1],[0,0,0,1,1],[0,0,0,1,1],[1,1,0,1,1],[0,1,1,1,0]]),
        ('+', [[0,0,0,0,0],[0,0,0,0,0],[0,0,1,0,0],[0,0,1,0,0],[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,0,0,0],[0,0,0,0,0]]),
    ].into();

    let chars: Vec<char> = text.chars().collect();

    let scale = if chars.len() >= 3 { 3u32 } else { 4u32 };
    let glyph_w = 5u32 * scale;
    let glyph_h = 9u32 * scale;
    let gap = if chars.len() >= 3 { 2u32 } else { 3u32 };
    let total_w = chars.len() as u32 * (glyph_w + gap) - gap;

    let start_x = (img_size.saturating_sub(total_w)) / 2;
    let start_y = (img_size.saturating_sub(glyph_h)) / 2;

    for (i, ch) in chars.iter().enumerate() {
        if let Some(glyph) = glyphs.get(ch) {
            let ox = start_x + i as u32 * (glyph_w + gap);
            for (row, bits) in glyph.iter().enumerate() {
                for (col, &on) in bits.iter().enumerate() {
                    if on == 1 {
                        for sy in 0..scale {
                            for sx in 0..scale {
                                let px = ox + col as u32 * scale + sx;
                                let py = start_y + row as u32 * scale + sy;
                                if px < img_size && py < img_size {
                                    let idx = ((py * img_size + px) * 4) as usize;
                                    rgba[idx]     = 255;
                                    rgba[idx + 1] = 255;
                                    rgba[idx + 2] = 255;
                                    rgba[idx + 3] = 255;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

// ── Helper macro ─────────────────────────────────────────────────────────────
// Generates a color setter command following the same pattern as set_accent_color.
// Usage: color_command!(fn_name, ram_field, config_field, css_var)
macro_rules! color_command {
    ($fn_name:ident, $ram_field:ident, $config_field:ident, $css_var:expr) => {
        #[tauri::command]
        async fn $fn_name(app_handle: tauri::AppHandle, color: String, save_to_config: bool) {
            let ram_state = app_handle.state::<AppRamState>();
            if let Ok(mut cache) = ram_state.inner().0.lock() {
                cache.$ram_field = color.clone();
            }
            
            if let Some(main_window) = app_handle.get_window("main") {
                if let Some(whatsapp_view) = main_window.get_webview("whatsapp") {
                    // FIX: Call the global JS updater with the new color
                    let js_payload = format!("if(window.__whatsWrapUpdateTheme) window.__whatsWrapUpdateTheme('{}', '{}');", $css_var, color);
                    let _ = whatsapp_view.eval(&js_payload);
                }
            }

            if save_to_config {
                update_config(&app_handle, |config| {
                    config.$config_field = Some(color);
                });
            }
        }
    };
}
color_command!(set_accent_color,               main_color,                 main_color,                 "--WDS-accent");
color_command!(set_content_deemphasized,       content_deemphasized,       content_deemphasized,       "--WDS-content-deemphasized");
color_command!(set_bubble_surface_incoming,    bubble_surface_incoming,    bubble_surface_incoming,    "--WDS-systems-bubble-surface-incoming");
color_command!(set_bubble_surface_outgoing,    bubble_surface_outgoing,    bubble_surface_outgoing,    "--WDS-systems-bubble-surface-outgoing");
color_command!(set_chat_surface_composer,      chat_surface_composer,      chat_surface_composer,      "--WDS-systems-chat-surface-composer");
color_command!(set_surface_highlight,          surface_highlight,          surface_highlight,          "--WDS-surface-highlight");
color_command!(set_surface_default,            surface_default,            surface_default,            "--WDS-surface-default");
color_command!(set_persistent_always_branded,  persistent_always_branded,  persistent_always_branded,  "--WDS-persistent-always-branded");
color_command!(set_content_default,            content_default,            content_default,            "--WDS-content-default");
color_command!(set_surface_emphasized,         surface_emphasized,         surface_emphasized,         "--WDS-surface-emphasized");
color_command!(set_message_primary,            message_primary,            message_primary,            "--message-primary");
color_command!(set_content_read,               content_read,               content_read,               "--WDS-content-read");
color_command!(set_content_on_accent,          content_on_accent,          content_on_accent,          "--WDS-content-on-accent");
color_command!(set_components_active_list_row, components_active_list_row, components_active_list_row, "--WDS-components-active-list-row");
color_command!(set_background_default,         background_default,         background_default,         "--background-default");
color_command!(set_chat_background_wallpaper,  chat_background_wallpaper,  chat_background_wallpaper,  "--WDS-systems-chat-background-wallpaper");

// HELPER FUNCTIONS
fn compress_image_to_jpeg(original_bytes: &[u8], max_dim: u32) -> Vec<u8> {
    // 1. Try to load the image from the raw memory bytes
    if let Ok(img) = load_from_memory(original_bytes) {
        // 2. Downscale the image using the max_dim parameter passed into the function
        let scaled_img = img.thumbnail(max_dim, max_dim);
        
        // 3. Create the buffer and cursor inside the function to write the JPEG into
        let mut jpeg_bytes = Vec::new();
        let mut cursor = Cursor::new(&mut jpeg_bytes);

        // 4. If writing to the JPEG format succeeds, return our new compressed vector
        if scaled_img.write_to(&mut cursor, ImageFormat::Jpeg).is_ok() {
            return jpeg_bytes;
        }
    }
    
    // 5. Fallback: If any step fails, return the original untouched bytes as a Vec<u8>
    original_bytes.to_vec()
}

fn refresh_webview_styles(app_handle: &tauri::AppHandle) {
    let core_css = include_str!("./assets/whatsapp-overrides.css");
    let injector_script = include_str!("./assets/customization_injector.js");

    let ram_state = app_handle.state::<AppRamState>();
    let cache = ram_state.inner().0.lock().unwrap();

    let data_bridge_js = format!(
        r#"
        window.__whatsWrapPayload = {{
            // ── Theming ──────────────────────────────────────────────────
            mainColor: '{}',          // Primary accent color (--WDS-accent)
            wallpaperB64: '{}',       // Base64-encoded wallpaper image
            staticCssRules: {},       // Core CSS injected from Rust at startup
            customCss: '{}',          // User-defined BetterDiscord-style CSS block
            sidebarWidthPx: {},       // Sidebar pixel width for layout restore

            // ── WhatsApp CSS Variable Overrides ──────────────────────────
            contentDeemphasized: '{}',      // Sidebar secondary text
            bubbleSurfaceIncoming: '{}',    // Incoming bubble background
            bubbleSurfaceOutgoing: '{}',    // Outgoing bubble background
            chatSurfaceComposer: '{}',      // Message input background
            surfaceHighlight: '{}',         // Active/hover highlight in chat list
            surfaceDefault: '{}',           // Headers and chat list bars
            persistentAlwaysBranded: '{}',  // Unread count badge color
            contentDefault: '{}',           // Chat title text color
            surfaceEmphasized: '{}',        // Right sidebar background
            messagePrimary: '{}',           // Bubble text color
            contentRead: '{}',              // Read checkmark color
            contentOnAccent: '{}',          // Unread count text color
            componentsActiveListRow: '{}',  // Right sidebar active row
            backgroundDefault: '{}',        // Chat list background
            chatBackgroundWallpaper: '{}',  // Chat area background color layer

            // ── Fixes ────────────────────────────────────────────────────
            searchContainerFix: '{}',  // "as-is" | "fixed" — margin→padding fix on chat-list-search-container
        }};
        "#,
        cache.main_color,
        cache.active_wallpaper_b64,
        serde_json::to_string(core_css).unwrap(),
        cache.active_custom_css,
        cache.sidebar_width_px,
        cache.content_deemphasized,
        cache.bubble_surface_incoming,
        cache.bubble_surface_outgoing,
        cache.chat_surface_composer,
        cache.surface_highlight,
        cache.surface_default,
        cache.persistent_always_branded,
        cache.content_default,
        cache.surface_emphasized,
        cache.message_primary,
        cache.content_read,
        cache.content_on_accent,
        cache.components_active_list_row,
        cache.background_default,
        cache.chat_background_wallpaper,
        cache.search_container_fix,
    );

    if let Some(main_window) = app_handle.get_window("main") {
        if let Some(whatsapp_view) = main_window.get_webview("whatsapp") {
            let _ = whatsapp_view.eval(&data_bridge_js);
            let _ = whatsapp_view.eval(injector_script);
        }
    }
}

fn update_config<F>(app_handle: &tauri::AppHandle, updater: F)
where
    F: FnOnce(&mut AppConfig),
{
    if let Ok(mut config) = get_parsed_config(app_handle) {
        updater(&mut config);
        let json_text = serde_json::to_string_pretty(&config).unwrap();
        let path = get_config_path(app_handle);
        std::fs::write(&path, json_text.as_bytes()).unwrap();
    }
}

#[tauri::command]
fn apply_config(app_handle: tauri::AppHandle, mut config: AppConfig) {
    // Keep existing wallpaper and custom CSS settings from the parsed config if they exist
    if let Ok(current_config) = get_parsed_config(&app_handle) {
        config.wallpaper_url = current_config.wallpaper_url;
        config.local_path = current_config.local_path;
        config.use_local = current_config.use_local;
        config.compress_image = current_config.compress_image;
        config.custom_css = current_config.custom_css;
    }
    
    // Save config to disk in a single write operation
    let json_text = serde_json::to_string_pretty(&config).unwrap();
    let path = get_config_path(&app_handle);
    let _ = std::fs::write(&path, json_text.as_bytes());

    // Update RAM cache state in a single lock block
    let ram_state = app_handle.state::<AppRamState>();
    if let Ok(mut cache) = ram_state.inner().0.lock() {
        cache.main_color                 = config.main_color.clone().unwrap_or_default();
        cache.content_deemphasized       = config.content_deemphasized.clone().unwrap_or_default();
        cache.bubble_surface_incoming    = config.bubble_surface_incoming.clone().unwrap_or_default();
        cache.bubble_surface_outgoing    = config.bubble_surface_outgoing.clone().unwrap_or_default();
        cache.chat_surface_composer      = config.chat_surface_composer.clone().unwrap_or_default();
        cache.surface_highlight          = config.surface_highlight.clone().unwrap_or_default();
        cache.surface_default            = config.surface_default.clone().unwrap_or_default();
        cache.persistent_always_branded  = config.persistent_always_branded.clone().unwrap_or_default();
        cache.content_default            = config.content_default.clone().unwrap_or_default();
        cache.surface_emphasized         = config.surface_emphasized.clone().unwrap_or_default();
        cache.message_primary            = config.message_primary.clone().unwrap_or_default();
        cache.content_read               = config.content_read.clone().unwrap_or_default();
        cache.content_on_accent          = config.content_on_accent.clone().unwrap_or_default();
        cache.components_active_list_row = config.components_active_list_row.clone().unwrap_or_default();
        cache.background_default         = config.background_default.clone().unwrap_or_default();
        cache.chat_background_wallpaper  = config.chat_background_wallpaper.clone().unwrap_or_default();
        cache.search_container_fix       = config.search_container_fix.clone().unwrap_or_else(|| "as-is".to_string());
        cache.active_custom_css          = config.custom_css.clone().unwrap_or_default();
    }

    refresh_webview_styles(&app_handle);
}

fn get_config_path(app_handle: &tauri::AppHandle) -> PathBuf {
    let mut local_path = app_handle.path().app_local_data_dir().unwrap();
    local_path.push("whats-wrap");
    std::fs::create_dir_all(&local_path).unwrap();
    local_path.push("config.json");

    return local_path
}

fn get_parsed_config(app_handle: &tauri::AppHandle) -> Result<AppConfig, Box<dyn std::error::Error + Send + Sync>> {
    let config_path = get_config_path(app_handle);
    
    // Check if the file exists at all. If not, return a blank default struct
    if !config_path.exists() {
        return Ok(AppConfig {
            wallpaper_url: None,
            use_local: false,
            local_path: None,
            compress_image: false,
            main_color: None,
            ..Default::default()
        });
    }

    let json_text = std::fs::read_to_string(&config_path)?;
    
    // Handle empty files
    if json_text.trim().is_empty() {
        return Ok(AppConfig::default());
    }

    match serde_json::from_str::<AppConfig>(&json_text) {
        Ok(parsed) => Ok(parsed),
        Err(e) => {
            eprintln!("Corrupted config.json: {}. Resetting to defaults.", e);
            let default_config = AppConfig::default();
            if let Ok(default_json) = serde_json::to_string_pretty(&default_config) {
                let _ = std::fs::write(&config_path, default_json.as_bytes());
            }
            Ok(default_config)
        }
    }
}