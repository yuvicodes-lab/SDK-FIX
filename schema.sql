-- FULL Panel (Cloudflare D1 / SQLite) schema — panel-glass.zip ka poora port
-- Fresh install: wrangler d1 execute sdk --file=schema.sql
-- (Purane sdk-only DB par bhi safe: CREATE TABLE IF NOT EXISTS + Worker startup par ALTER COLUMN migration)

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL DEFAULT '',
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'RESELLER',
  invited_by INTEGER,
  balance INTEGER NOT NULL DEFAULT 0,
  referral_limit INTEGER NOT NULL DEFAULT 0,
  can_generate_referral INTEGER NOT NULL DEFAULT 1,
  validity TEXT,
  panel_code TEXT NOT NULL DEFAULT 'YUVI_001',
  is_blocked INTEGER NOT NULL DEFAULT 0,
  panel_expiry TEXT,
  device_fingerprint TEXT,
  last_login TEXT,
  last_reset TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_users_panel ON users(panel_code);

CREATE TABLE IF NOT EXISTS panels (
  panel_code TEXT PRIMARY KEY,
  duration INTEGER NOT NULL DEFAULT 30,
  expires_at TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  encryption_subscription INTEGER NOT NULL DEFAULT 0,
  tg_subscription INTEGER NOT NULL DEFAULT 0,
  mundo_service INTEGER NOT NULL DEFAULT 0,
  admin_role INTEGER NOT NULL DEFAULT 0,
  reseller_role INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS api_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key_value TEXT NOT NULL,
  duration TEXT NOT NULL DEFAULT '30D',
  device_limit INTEGER NOT NULL DEFAULT 1,
  uses INTEGER NOT NULL DEFAULT 0,
  expires_at TEXT,
  panel_code TEXT NOT NULL DEFAULT 'YUVI_001',
  is_active INTEGER NOT NULL DEFAULT 1,
  is_blocked INTEGER NOT NULL DEFAULT 0,
  created_by INTEGER NOT NULL DEFAULT 1,
  server_type TEXT NOT NULL DEFAULT 'PRIVATE',
  UNIQUE(key_value, panel_code)
);
CREATE INDEX IF NOT EXISTS idx_api_panel ON api_keys(panel_code);
CREATE INDEX IF NOT EXISTS idx_api_created ON api_keys(created_by);

CREATE TABLE IF NOT EXISTS key_devices (
  key_id INTEGER NOT NULL,
  device_uuid TEXT NOT NULL,
  panel_code TEXT NOT NULL DEFAULT 'YUVI_001',
  last_seen TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (key_id, device_uuid)
);
CREATE INDEX IF NOT EXISTS idx_dev_panel ON key_devices(panel_code);

CREATE TABLE IF NOT EXISTS mod_settings (
  setting_name TEXT NOT NULL,
  setting_value TEXT,
  panel_code TEXT NOT NULL DEFAULT 'YUVI_001',
  PRIMARY KEY (setting_name, panel_code)
);

CREATE TABLE IF NOT EXISTS mod_maintenance (
  panel_code TEXT PRIMARY KEY,
  is_active INTEGER NOT NULL DEFAULT 0,
  reason TEXT
);

CREATE TABLE IF NOT EXISTS loader_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  panel_code TEXT NOT NULL UNIQUE,
  version REAL NOT NULL DEFAULT 1.0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS loader_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  panel_code TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  server_type TEXT NOT NULL DEFAULT 'PRIVATE',
  uploaded_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_loader_panel ON loader_files(panel_code);

CREATE TABLE IF NOT EXISTS referrals (
  code TEXT PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'RESELLER',
  duration INTEGER NOT NULL DEFAULT 30,
  balance INTEGER NOT NULL DEFAULT 0,
  panel_code TEXT NOT NULL DEFAULT 'YUVI_001',
  created_by INTEGER,
  used INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS activation_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  activation_key TEXT NOT NULL UNIQUE,
  panel_code TEXT NOT NULL DEFAULT 'YUVI_001',
  name TEXT,
  duration_months INTEGER NOT NULL DEFAULT 1,
  expires_at TEXT NOT NULL,
  is_used INTEGER NOT NULL DEFAULT 0,
  used_by TEXT,
  used_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS mod_loaders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  panel_code TEXT NOT NULL DEFAULT 'YUVI_001',
  app_name TEXT NOT NULL DEFAULT '',
  package_name TEXT NOT NULL DEFAULT '',
  sha256 TEXT NOT NULL DEFAULT '',
  version TEXT NOT NULL DEFAULT '',
  is_blocked INTEGER NOT NULL DEFAULT 0,
  expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  request_count INTEGER NOT NULL DEFAULT 0,
  last_ping TEXT,
  is_binded INTEGER NOT NULL DEFAULT 0
);

-- ===== SDK tables (already live, yahi rehni chahiye) =====
CREATE TABLE IF NOT EXISTS mundo_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  panel_code TEXT NOT NULL DEFAULT 'YUVI_001',
  sdk_key TEXT NOT NULL UNIQUE,
  duration_days INTEGER NOT NULL DEFAULT 30,
  pkg_limit INTEGER NOT NULL DEFAULT 1,
  app_limit INTEGER NOT NULL DEFAULT 1,
  feature1 INTEGER NOT NULL DEFAULT 0,
  feature2 INTEGER NOT NULL DEFAULT 0,
  is_blocked INTEGER NOT NULL DEFAULT 0,
  created_by INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_mundo_panel ON mundo_keys(panel_code);

CREATE TABLE IF NOT EXISTS mundo_key_bindings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sdk_key_id INTEGER NOT NULL,
  pkg_name TEXT NOT NULL,
  app_name TEXT NOT NULL,
  is_blocked INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS bcore_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  panel_code TEXT NOT NULL DEFAULT 'YUVI_001',
  sdk_key TEXT NOT NULL UNIQUE,
  duration_days INTEGER NOT NULL DEFAULT 30,
  pkg_limit INTEGER NOT NULL DEFAULT 1,
  app_limit INTEGER NOT NULL DEFAULT 1,
  feature1 INTEGER NOT NULL DEFAULT 0,
  feature2 INTEGER NOT NULL DEFAULT 0,
  is_blocked INTEGER NOT NULL DEFAULT 0,
  created_by INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_bcore_panel ON bcore_keys(panel_code);

CREATE TABLE IF NOT EXISTS bcore_key_bindings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sdk_key_id INTEGER NOT NULL,
  pkg_name TEXT NOT NULL,
  app_name TEXT NOT NULL,
  is_blocked INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

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
