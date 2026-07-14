use rusqlite::{
    params_from_iter,
    types::{Value as SqliteValue, ValueRef},
    Connection,
};
use serde::Serialize;
use serde_json::{Map, Number, Value as JsonValue};
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SqliteMetadata {
    file_path: String,
    table_count: usize,
    tables: Vec<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SqliteQueryResult {
    columns: Vec<String>,
    rows: Vec<JsonValue>,
    values: Vec<Vec<JsonValue>>,
    rows_affected: usize,
    last_insert_rowid: i64,
}

fn sqlite_value_ref_to_json(value: ValueRef<'_>) -> JsonValue {
    match value {
        ValueRef::Null => JsonValue::Null,
        ValueRef::Integer(value) => JsonValue::Number(Number::from(value)),
        ValueRef::Real(value) => Number::from_f64(value)
            .map(JsonValue::Number)
            .unwrap_or(JsonValue::Null),
        ValueRef::Text(value) => JsonValue::String(String::from_utf8_lossy(value).to_string()),
        ValueRef::Blob(value) => JsonValue::Array(
            value
                .iter()
                .map(|byte| JsonValue::Number(Number::from(*byte)))
                .collect(),
        ),
    }
}

fn json_to_sqlite_value(value: &JsonValue) -> Result<SqliteValue, String> {
    match value {
        JsonValue::Null => Ok(SqliteValue::Null),
        JsonValue::Bool(value) => Ok(SqliteValue::Integer(if *value { 1 } else { 0 })),
        JsonValue::Number(value) => {
            if let Some(integer) = value.as_i64() {
                return Ok(SqliteValue::Integer(integer));
            }

            if let Some(float) = value.as_f64() {
                return Ok(SqliteValue::Real(float));
            }

            Err("Unsupported number parameter".to_string())
        }
        JsonValue::String(value) => Ok(SqliteValue::Text(value.clone())),
        JsonValue::Array(_) | JsonValue::Object(_) => Ok(SqliteValue::Text(value.to_string())),
    }
}

fn resolve_sqlite_path(app: &AppHandle, raw_path: &str) -> Result<PathBuf, String> {
    let trimmed = raw_path.trim();

    if trimmed.is_empty() {
        return Err("Path cannot be empty".to_string());
    }

    if let Some(relative) = trimmed.strip_prefix("app-local-data://") {
        let base = app
            .path()
            .app_local_data_dir()
            .map_err(|err| format!("Unable to resolve app local data directory: {err}"))?;

        return Ok(base.join(relative));
    }

    if let Some(relative) = trimmed.strip_prefix("app-data://") {
        let base = app
            .path()
            .app_data_dir()
            .map_err(|err| format!("Unable to resolve app data directory: {err}"))?;

        return Ok(base.join(relative));
    }

    let candidate = PathBuf::from(trimmed);
    let mut attempts: Vec<PathBuf> = Vec::new();
    let is_src_tauri_prefixed =
        trimmed.starts_with("src-tauri/") || trimmed.starts_with("src-tauri\\");

    if candidate.is_absolute() {
        attempts.push(candidate);
    } else {
        if let Ok(current_dir) = std::env::current_dir() {
            let current_dir_is_src_tauri = current_dir
                .file_name()
                .map(|name| name == "src-tauri")
                .unwrap_or(false);

            if !(is_src_tauri_prefixed && current_dir_is_src_tauri) {
                attempts.push(current_dir.join(trimmed));
            }

            attempts.push(current_dir.join("..").join(trimmed));

            if let Some(stripped) = trimmed.strip_prefix("src-tauri/") {
                attempts.push(current_dir.join(stripped));
                attempts.push(current_dir.join("..").join(stripped));
            }

            if let Some(stripped) = trimmed.strip_prefix("src-tauri\\") {
                attempts.push(current_dir.join(stripped));
                attempts.push(current_dir.join("..").join(stripped));
            }
        }

        attempts.push(PathBuf::from(trimmed));
    }

    let mut attempted_paths: Vec<String> = Vec::new();

    for attempt in attempts {
        if attempt.is_absolute() {
            attempted_paths.push(attempt.to_string_lossy().to_string());
        }

        if attempt.exists() {
            if let Ok(resolved) = attempt.canonicalize() {
                if resolved.is_file() {
                    return Ok(resolved);
                }
            }
            continue;
        }

        if let Some(parent) = attempt.parent() {
            if let Ok(canonical_parent) = parent.canonicalize() {
                if let Some(file_name) = attempt.file_name() {
                    let resolved = canonical_parent.join(file_name);
                    attempted_paths.push(resolved.to_string_lossy().to_string());
                    return Ok(resolved);
                }
            }
        }
    }

    Err(format!(
        "Unable to resolve database path: {}\nAttempted paths:\n{}",
        raw_path.trim(),
        attempted_paths.join("\n")
    ))
}

fn ensure_sqlite_parent_exists(path: &PathBuf) -> Result<(), String> {
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|err| format!("Unable to create database directory: {err}"))?;
    }

    Ok(())
}

#[tauri::command]
fn delete_sqlite_database(app: AppHandle, path: String) -> Result<(), String> {
    let resolved = resolve_sqlite_path(&app, &path)?;

    match std::fs::remove_file(&resolved) {
        Ok(()) => Ok(()),
        Err(err) if err.kind() == std::io::ErrorKind::NotFound => Ok(()),
        Err(err) => Err(format!("Unable to delete SQLite database: {err}")),
    }
}

#[tauri::command]
fn read_sqlite_database(app: AppHandle, path: String) -> Result<SqliteMetadata, String> {
    let resolved = resolve_sqlite_path(&app, &path)?;
    ensure_sqlite_parent_exists(&resolved)?;

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

#[tauri::command]
fn execute_sqlite_query(
    app: AppHandle,
    path: String,
    sql: String,
    params: Vec<JsonValue>,
) -> Result<SqliteQueryResult, String> {
    let resolved = resolve_sqlite_path(&app, &path)?;
    ensure_sqlite_parent_exists(&resolved)?;

    let connection = Connection::open(&resolved)
        .map_err(|err| format!("Unable to open SQLite database: {err}"))?;

    let bound_params = params
        .iter()
        .map(json_to_sqlite_value)
        .collect::<Result<Vec<SqliteValue>, _>>()?;

    let mut statement = connection
        .prepare(&sql)
        .map_err(|err| format!("Unable to prepare SQLite statement: {err}"))?;

    if statement.column_count() > 0 {
        let column_names = statement
            .column_names()
            .iter()
            .map(|column_name| column_name.to_string())
            .collect::<Vec<String>>();

        let rows = statement
            .query_map(params_from_iter(bound_params.iter()), |row| {
                let mut object = Map::new();
                let mut values = Vec::with_capacity(column_names.len());

                for (index, column_name) in column_names.iter().enumerate() {
                    let value = row.get_ref(index)?;
                    let json_value = sqlite_value_ref_to_json(value);
                    object.insert(column_name.clone(), json_value.clone());
                    values.push(json_value);
                }

                Ok((JsonValue::Object(object), values))
            })
            .map_err(|err| format!("Unable to execute SQLite query: {err}"))?
            .collect::<Result<Vec<(JsonValue, Vec<JsonValue>)>, _>>()
            .map_err(|err| format!("Unable to decode SQLite query rows: {err}"))?;

        let (rows, values): (Vec<JsonValue>, Vec<Vec<JsonValue>>) = rows.into_iter().unzip();

        return Ok(SqliteQueryResult {
            columns: column_names,
            rows_affected: rows.len(),
            rows,
            values,
            last_insert_rowid: connection.last_insert_rowid(),
        });
    }

    let rows_affected = statement
        .execute(params_from_iter(bound_params.iter()))
        .map_err(|err| format!("Unable to execute SQLite statement: {err}"))?;

    Ok(SqliteQueryResult {
        columns: Vec::new(),
        rows: Vec::new(),
        values: Vec::new(),
        rows_affected,
        last_insert_rowid: connection.last_insert_rowid(),
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            delete_sqlite_database,
            read_sqlite_database,
            execute_sqlite_query
        ])
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
