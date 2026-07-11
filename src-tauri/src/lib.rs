use rusqlite::Connection;
use serde::Serialize;
use std::path::PathBuf;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SqliteMetadata {
    file_path: String,
    table_count: usize,
    tables: Vec<String>,
}

#[tauri::command]
fn read_sqlite_database(path: String) -> Result<SqliteMetadata, String> {
    let candidate = PathBuf::from(path.trim());

    if candidate.as_os_str().is_empty() {
        return Err("Path cannot be empty".to_string());
    }

    let resolved = candidate
        .canonicalize()
        .map_err(|err| format!("Unable to resolve database path: {err}"))?;

    if !resolved.is_file() {
        return Err("The provided path is not a file".to_string());
    }

    let connection = Connection::open(&resolved)
        .map_err(|err| format!("Unable to open SQLite database: {err}"))?;

    let mut statement = connection
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
    .map_err(|err| format!("Unable to inspect SQLite schema: {err}"))?;

    let rows = statement
        .query_map([], |row| row.get::<_, String>(0))
        .map_err(|err| format!("Unable to read table names: {err}"))?;

    let tables = rows
        .collect::<Result<Vec<String>, _>>()
        .map_err(|err| format!("Unable to decode table names: {err}"))?;

    Ok(SqliteMetadata {
        file_path: resolved.to_string_lossy().to_string(),
        table_count: tables.len(),
        tables,
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![read_sqlite_database])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
