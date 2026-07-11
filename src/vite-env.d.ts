/// <reference types="vite/client" />

interface ViteTypeOptions {
  // By adding this line, you can make the type of ImportMetaEnv strict
  // to disallow unknown keys.
  // strictImportMetaEnv: unknown
}

export interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_DATABASE_NAME: string;
  readonly VITE_REFRESH_DATABASE: string;
  readonly VITE_FACTORY_COUNT: string;
  readonly VITE_DB_DRIVER?: "indexeddb" | "tauri-sqlite";
  readonly VITE_TAURI_SQLITE_PATH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
