-- SDK Panel (Cloudflare D1 / SQLite) schema
-- wrangler d1 execute sdk --file=schema.sql

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'OWNER',
  panel_code TEXT NOT NULL DEFAULT 'YUVI_001',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS panels (
  panel_code TEXT PRIMARY KEY,
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS mundo_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  panel_code TEXT NOT NULL DEFAULT 'YUVI_001',
  sdk_key TEXT NOT NULL,
  duration_days INTEGER NOT NULL DEFAULT 30,
  pkg_limit INTEGER NOT NULL DEFAULT 1,
  app_limit INTEGER NOT NULL DEFAULT 1,
  feature1 INTEGER NOT NULL DEFAULT 0,
  feature2 INTEGER NOT NULL DEFAULT 0,
  is_blocked INTEGER NOT NULL DEFAULT 0,
  created_by INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(sdk_key)
);
CREATE INDEX IF NOT EXISTS idx_mundo_panel ON mundo_keys(panel_code);

CREATE TABLE IF NOT EXISTS mundo_key_bindings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sdk_key_id INTEGER NOT NULL REFERENCES mundo_keys(id) ON DELETE CASCADE,
  pkg_name TEXT NOT NULL,
  app_name TEXT NOT NULL,
  is_blocked INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_mundo_bind ON mundo_key_bindings(sdk_key_id);

CREATE TABLE IF NOT EXISTS bcore_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  panel_code TEXT NOT NULL DEFAULT 'YUVI_001',
  sdk_key TEXT NOT NULL,
  duration_days INTEGER NOT NULL DEFAULT 30,
  pkg_limit INTEGER NOT NULL DEFAULT 1,
  app_limit INTEGER NOT NULL DEFAULT 1,
  feature1 INTEGER NOT NULL DEFAULT 0,
  feature2 INTEGER NOT NULL DEFAULT 0,
  is_blocked INTEGER NOT NULL DEFAULT 0,
  created_by INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(sdk_key)
);
CREATE INDEX IF NOT EXISTS idx_bcore_panel ON bcore_keys(panel_code);

CREATE TABLE IF NOT EXISTS bcore_key_bindings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sdk_key_id INTEGER NOT NULL REFERENCES bcore_keys(id) ON DELETE CASCADE,
  pkg_name TEXT NOT NULL,
  app_name TEXT NOT NULL,
  is_blocked INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_bcore_bind ON bcore_key_bindings(sdk_key_id);

CREATE TABLE IF NOT EXISTS sdk_hash_vault (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  panel_code TEXT NOT NULL DEFAULT 'YUVI_001',
  engine TEXT NOT NULL DEFAULT 'MUNDO',
  hash_type TEXT NOT NULL DEFAULT 'lib_signature',
  hash_label TEXT NOT NULL,
  hash_value TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_hash_panel_engine ON sdk_hash_vault(panel_code, engine);

CREATE TABLE IF NOT EXISTS sdk_server_status (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  panel_code TEXT NOT NULL DEFAULT 'YUVI_001',
  engine TEXT NOT NULL,
  maintenance_mode INTEGER NOT NULL DEFAULT 0,
  maintenance_message TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(panel_code, engine)
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sess_user ON sessions(user_id);
