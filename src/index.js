import { BCORE_SECRET, MUNDO_SALT, rc4, bcoreEncrypt, bcoreDecrypt, fixCesu8, mundoAesKey, aesEncryptRaw, aesDecryptRaw, mundoAesKeyHex, hashPassword, verifyPassword, randomHexKey } from './crypto.js';
import { layout, authPage, esc } from './ui.js';
import { panelLayout, pageHead, alertBox } from './panel-ui.js';
import { loginPage, registerPage, resetPage, joinPage, deviceFingerprint } from './p-auth.js';
import { dashboardPage, generatePage } from './pages-dash.js';
import { keysPage } from './pages-keys.js';
import { serverPage as sdkServerPage, hashPage as sdkHashPage } from './pages-server.js';
import { panelDashboard, panelGenerate, panelKeyList, KEY_PRICING, KEY_DURATIONS, arcxRand } from './p-dash.js';
import { usersPage, adminsPage, permissionsPage, referralPage } from './p-users.js';
import { serverPage, settingsPage, aesPage, apiTestPage, createPanelPage, loaderPage, MOD_FIELDS } from './p-system.js';
import { handleConnect, handleEncrypt } from './p-connect.js';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, full_name TEXT NOT NULL DEFAULT '', username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'RESELLER', invited_by INTEGER, balance INTEGER NOT NULL DEFAULT 0, referral_limit INTEGER NOT NULL DEFAULT 0, can_generate_referral INTEGER NOT NULL DEFAULT 1, validity TEXT, panel_code TEXT NOT NULL DEFAULT 'YUVI_001', is_blocked INTEGER NOT NULL DEFAULT 0, panel_expiry TEXT, device_fingerprint TEXT, last_login TEXT, last_reset TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE INDEX IF NOT EXISTS idx_users_panel ON users(panel_code);
CREATE TABLE IF NOT EXISTS panels (panel_code TEXT PRIMARY KEY, duration INTEGER NOT NULL DEFAULT 30, expires_at TEXT, is_active INTEGER NOT NULL DEFAULT 1, encryption_subscription INTEGER NOT NULL DEFAULT 0, tg_subscription INTEGER NOT NULL DEFAULT 0, mundo_service INTEGER NOT NULL DEFAULT 0, admin_role INTEGER NOT NULL DEFAULT 0, reseller_role INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS api_keys (id INTEGER PRIMARY KEY AUTOINCREMENT, key_value TEXT NOT NULL, duration TEXT NOT NULL DEFAULT '30D', device_limit INTEGER NOT NULL DEFAULT 1, uses INTEGER NOT NULL DEFAULT 0, expires_at TEXT, panel_code TEXT NOT NULL DEFAULT 'YUVI_001', is_active INTEGER NOT NULL DEFAULT 1, is_blocked INTEGER NOT NULL DEFAULT 0, created_by INTEGER NOT NULL DEFAULT 1, server_type TEXT NOT NULL DEFAULT 'PRIVATE', UNIQUE(key_value, panel_code));
CREATE INDEX IF NOT EXISTS idx_api_panel ON api_keys(panel_code);
CREATE INDEX IF NOT EXISTS idx_api_created ON api_keys(created_by);
CREATE TABLE IF NOT EXISTS key_devices (key_id INTEGER NOT NULL, device_uuid TEXT NOT NULL, panel_code TEXT NOT NULL DEFAULT 'YUVI_001', last_seen TEXT NOT NULL DEFAULT (datetime('now')), PRIMARY KEY (key_id, device_uuid));
CREATE TABLE IF NOT EXISTS mod_settings (setting_name TEXT NOT NULL, setting_value TEXT, panel_code TEXT NOT NULL DEFAULT 'YUVI_001', PRIMARY KEY (setting_name, panel_code));
CREATE TABLE IF NOT EXISTS mod_maintenance (panel_code TEXT PRIMARY KEY, is_active INTEGER NOT NULL DEFAULT 0, reason TEXT);
CREATE TABLE IF NOT EXISTS loader_config (id INTEGER PRIMARY KEY AUTOINCREMENT, panel_code TEXT NOT NULL UNIQUE, version REAL NOT NULL DEFAULT 1.0, updated_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS loader_files (id INTEGER PRIMARY KEY AUTOINCREMENT, panel_code TEXT NOT NULL, file_name TEXT NOT NULL, file_path TEXT NOT NULL, server_type TEXT NOT NULL DEFAULT 'PRIVATE', uploaded_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS referrals (code TEXT PRIMARY KEY, role TEXT NOT NULL DEFAULT 'RESELLER', duration INTEGER NOT NULL DEFAULT 30, balance INTEGER NOT NULL DEFAULT 0, panel_code TEXT NOT NULL DEFAULT 'YUVI_001', created_by INTEGER, used INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS activation_keys (id INTEGER PRIMARY KEY AUTOINCREMENT, activation_key TEXT NOT NULL UNIQUE, panel_code TEXT NOT NULL DEFAULT 'YUVI_001', name TEXT, duration_months INTEGER NOT NULL DEFAULT 1, expires_at TEXT NOT NULL, is_used INTEGER NOT NULL DEFAULT 0, used_by TEXT, used_at TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS mod_loaders (id INTEGER PRIMARY KEY AUTOINCREMENT, panel_code TEXT NOT NULL DEFAULT 'YUVI_001', app_name TEXT NOT NULL DEFAULT '', package_name TEXT NOT NULL DEFAULT '', sha256 TEXT NOT NULL DEFAULT '', version TEXT NOT NULL DEFAULT '', is_blocked INTEGER NOT NULL DEFAULT 0, expires_at TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), request_count INTEGER NOT NULL DEFAULT 0, last_ping TEXT, is_binded INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS mundo_keys (id INTEGER PRIMARY KEY AUTOINCREMENT, panel_code TEXT NOT NULL DEFAULT 'YUVI_001', sdk_key TEXT NOT NULL UNIQUE, duration_days INTEGER NOT NULL DEFAULT 30, pkg_limit INTEGER NOT NULL DEFAULT 1, app_limit INTEGER NOT NULL DEFAULT 1, feature1 INTEGER NOT NULL DEFAULT 0, feature2 INTEGER NOT NULL DEFAULT 0, is_blocked INTEGER NOT NULL DEFAULT 0, created_by INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS mundo_key_bindings (id INTEGER PRIMARY KEY AUTOINCREMENT, sdk_key_id INTEGER NOT NULL, pkg_name TEXT NOT NULL, app_name TEXT NOT NULL, is_blocked INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS bcore_keys (id INTEGER PRIMARY KEY AUTOINCREMENT, panel_code TEXT NOT NULL DEFAULT 'YUVI_001', sdk_key TEXT NOT NULL UNIQUE, duration_days INTEGER NOT NULL DEFAULT 30, pkg_limit INTEGER NOT NULL DEFAULT 1, app_limit INTEGER NOT NULL DEFAULT 1, feature1 INTEGER NOT NULL DEFAULT 0, feature2 INTEGER NOT NULL DEFAULT 0, is_blocked INTEGER NOT NULL DEFAULT 0, created_by INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS bcore_key_bindings (id INTEGER PRIMARY KEY AUTOINCREMENT, sdk_key_id INTEGER NOT NULL, pkg_name TEXT NOT NULL, app_name TEXT NOT NULL, is_blocked INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS sdk_hash_vault (id INTEGER PRIMARY KEY AUTOINCREMENT, panel_code TEXT NOT NULL DEFAULT 'YUVI_001', engine TEXT NOT NULL DEFAULT 'MUNDO', hash_type TEXT NOT NULL DEFAULT 'lib_signature', hash_label TEXT NOT NULL, hash_value TEXT NOT NULL, is_active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS sdk_server_status (id INTEGER PRIMARY KEY AUTOINCREMENT, panel_code TEXT NOT NULL DEFAULT 'YUVI_001', engine TEXT NOT NULL, maintenance_mode INTEGER NOT NULL DEFAULT 0, maintenance_message TEXT, updated_at TEXT NOT NULL DEFAULT (datetime('now')), UNIQUE(panel_code, engine));
CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id INTEGER NOT NULL, expires_at INTEGER NOT NULL);
`;
const MIGRATE_COLS = [
  ['users', 'full_name', "TEXT NOT NULL DEFAULT ''"], ['users', 'invited_by', 'INTEGER'],
  ['users', 'balance', 'INTEGER NOT NULL DEFAULT 0'], ['users', 'referral_limit', 'INTEGER NOT NULL DEFAULT 0'],
  ['users', 'can_generate_referral', 'INTEGER NOT NULL DEFAULT 1'], ['users', 'validity', 'TEXT'],
  ['users', 'is_blocked', 'INTEGER NOT NULL DEFAULT 0'], ['users', 'panel_expiry', 'TEXT'],
  ['users', 'device_fingerprint', 'TEXT'], ['users', 'last_login', 'TEXT'], ['users', 'last_reset', 'TEXT'],
  ['panels', 'duration', 'INTEGER NOT NULL DEFAULT 30'], ['panels', 'expires_at', 'TEXT'],
  ['panels', 'encryption_subscription', 'INTEGER NOT NULL DEFAULT 0'], ['panels', 'tg_subscription', 'INTEGER NOT NULL DEFAULT 0'],
  ['panels', 'mundo_service', 'INTEGER NOT NULL DEFAULT 0'], ['panels', 'admin_role', 'INTEGER NOT NULL DEFAULT 0'], ['panels', 'reseller_role', 'INTEGER NOT NULL DEFAULT 0'],
  ['api_keys', 'server_type', "TEXT NOT NULL DEFAULT 'PRIVATE'"],
];

async function ensureDB(db, panelCode) {
  await db.exec(SCHEMA);
  for (const [t, c, def] of MIGRATE_COLS) {
    try { await db.prepare('ALTER TABLE ' + t + ' ADD COLUMN ' + c + ' ' + def).run(); } catch {}
  }
  try { await db.prepare('INSERT OR IGNORE INTO panels (panel_code, is_active) VALUES (?,1)').bind(panelCode).run(); } catch {}
}

function html(d, s = 200) { return new Response(d, { status: s, headers: { 'Content-Type': 'text/html; charset=UTF-8', 'Cache-Control': 'no-store' } }); }
function redir(p, c) { const h = { Location: p }; if (c) h['Set-Cookie'] = c; return new Response(null, { status: 302, headers: h }); }
function parseCookies(req) { const m = {}; (req.headers.get('Cookie') || '').split(';').forEach(x => { const i = x.indexOf('='); if (i > 0) m[x.slice(0, i).trim()] = decodeURIComponent(x.slice(i + 1).trim()); }); return m; }
async function getSession(db, req) {
  const t = parseCookies(req)['sdk_session'];
  if (!t) return null;
  const row = await db.prepare('SELECT s.expires_at, u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=?').bind(t).first().catch(() => null);
  if (!row) return null;
  if ((row.expires_at || 0) < Date.now()) { try { await db.prepare('DELETE FROM sessions WHERE token=?').bind(t).run(); } catch {} return null; }
  return row;
}
const sessCookie = t => 'sdk_session=' + encodeURIComponent(t) + '; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax';
const clearCookie = () => 'sdk_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax';
const tsMs = s => { const t = Date.parse(String(s || '').replace(' ', 'T') + 'Z'); return isNaN(t) ? 0 : t; };
async function formParams(req) {
  try {
    const ct = req.headers.get('Content-Type') || '';
    if (ct.includes('form') || ct.includes('multipart')) { const fd = await req.formData(); return Object.fromEntries(fd.entries()); }
    if (ct.includes('json')) return await req.json();
  } catch {}
  return {};
}
const THEMES = ['blue', 'cherry', 'gold', 'emerald'];
async function getTheme(db, pc) {
  try { const r = await db.prepare("SELECT setting_value FROM mod_settings WHERE setting_name='ui_theme' AND panel_code=?").bind(pc).first(); if (r && THEMES.includes(r.setting_value)) return r.setting_value; } catch {}
  return 'blue';
}
async function panelName(db, pc, fallback) {
  try { const r = await db.prepare("SELECT setting_value FROM mod_settings WHERE setting_name='panel_name' AND panel_code=?").bind(pc).first(); if (r && r.setting_value) return r.setting_value; } catch {}
  return fallback;
}
const deny = () => new Response('Access Denied.', { status: 403 });

export default {
  async fetch(request, env, ctx) {
    const db = env.DB;
    const mainPanel = env.PANEL_CODE || 'YUVI_001';
    const envName = env.PANEL_NAME || 'YUVI PANEL';
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    const method = request.method.toUpperCase();
    await ensureDB(db, mainPanel);

    if (method === 'OPTIONS' && (path.startsWith('/sdk/') || path.startsWith('/connect/') || path.startsWith('/encrypt/')))
      return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
    if (path.startsWith('/connect/')) return handleConnect(request, db, decodeURIComponent(path.split('/')[2] || ''));
    if (path === '/connect') return handleConnect(request, db, url.searchParams.get('panel_code') || mainPanel);
    if (path.startsWith('/encrypt/')) return handleEncrypt(request, db, decodeURIComponent(path.split('/')[2] || ''));
    if (path.startsWith('/sdk/mundo/') || path === '/sdk/mundo') return handleMundo(request, db, decodeURIComponent(path.split('/')[3] || url.searchParams.get('panel_code') || mainPanel));
    if (path.startsWith('/sdk/bcore/') || path === '/sdk/bcore') return handleBcore(request, db, decodeURIComponent(path.split('/')[3] || url.searchParams.get('panel_code') || mainPanel));

    const uc = await db.prepare('SELECT COUNT(*) c FROM users').first().catch(() => ({ c: 1 }));
    if ((uc?.c || 0) === 0 && path !== '/setup') return redir('/setup');

    if (path === '/setup') {
      if ((uc?.c || 0) > 0) return redir('/login');
      if (method === 'POST') {
        const p = await formParams(request);
        const u = String(p.username || '').trim(), pw = String(p.password || '');
        if (u.length < 3 || pw.length < 4) return html(authPage({ mode: 'setup', error: 'Username min 3, password min 4.', panelName: envName }));
        if (await db.prepare('SELECT id FROM users WHERE username=?').bind(u).first().catch(() => null)) return html(authPage({ mode: 'setup', error: 'Username already hai.', panelName: envName }));
        const r = await db.prepare('INSERT INTO users (full_name,username,password_hash,role,panel_code,balance) VALUES (?,?,?,?,?,?)').bind('Setup Admin', u, await hashPassword(pw), 'OWNER', mainPanel, 0).run();
        const t = crypto.randomUUID();
        await db.prepare('INSERT INTO sessions (token,user_id,expires_at) VALUES (?,?,?)').bind(t, r.meta.last_row_id, Date.now() + 6048e5).run();
        return redir('/dashboard', sessCookie(t));
      }
      return html(authPage({ mode: 'setup', panelName: envName }));
    }
    if (path === '/login') {
      if (method === 'POST') {
        const p = await formParams(request);
        const u = String(p.username || '').trim(), pw = String(p.password || '');
        const row = await db.prepare('SELECT * FROM users WHERE username=?').bind(u).first().catch(() => null);
        if (!row || !(await verifyPassword(pw, row.password_hash))) return html(loginPage({ error: 'Invalid username or password', panelName: envName }));
        if ((row.is_blocked | 0) === 1) return html(loginPage({ error: 'Account suspended by Admin/Owner.', panelName: envName }));
        if (row.id === 1) {
          await db.prepare("UPDATE users SET device_fingerprint=?,last_login=datetime('now') WHERE id=?").bind(await deviceFingerprint(String(p.device_info || '{}'), request.headers.get('User-Agent'), request.headers.get('Accept-Language')), row.id).run();
        } else {
          const fp = await deviceFingerprint(String(p.device_info || '{}'), request.headers.get('User-Agent'), request.headers.get('Accept-Language'));
          if (!row.device_fingerprint) {
            await db.prepare("UPDATE users SET device_fingerprint=?,last_login=datetime('now') WHERE id=?").bind(fp, row.id).run();
          } else if (row.device_fingerprint !== fp) {
            return html(loginPage({ error: 'Account locked on another device. <a href="/reset-device" class="underline font-bold">Reset Device</a>', panelName: envName }));
          } else {
            await db.prepare("UPDATE users SET last_login=datetime('now') WHERE id=?").bind(row.id).run();
          }
        }
        const t = crypto.randomUUID();
        await db.prepare('INSERT INTO sessions (token,user_id,expires_at) VALUES (?,?,?)').bind(t, row.id, Date.now() + 6048e5).run();
        return redir('/dashboard', sessCookie(t));
      }
      return html(loginPage({ msg: url.searchParams.get('msg') || '', panelName: envName }));
    }
    if (path === '/register') {
      if (method === 'POST') {
        const p = await formParams(request);
        const fn = String(p.full_name || '').trim(), u = String(p.username || '').trim(), pw = String(p.password || '');
        const code = String(p.referral_code || '').toUpperCase().replace(/\s+/g, '');
        if (!fn || u.length < 3 || pw.length < 4 || !code) return html(registerPage({ error: 'Saare fields sahi bharo (password min 4).', panelName: envName }));
        const ref = await db.prepare('SELECT * FROM referrals WHERE code=? AND used=0').bind(code).first().catch(() => null);
        if (!ref) return html(registerPage({ error: 'Invalid ya used referral code.', panelName: envName }));
        if (await db.prepare('SELECT id FROM users WHERE username=?').bind(u).first().catch(() => null)) return html(registerPage({ error: 'Username already taken.', panelName: envName }));
        const validity = new Date(Date.now() + (ref.duration | 0) * 864e5).toISOString().slice(0, 19).replace('T', ' ');
        await db.prepare('INSERT INTO users (full_name,username,password_hash,role,invited_by,balance,validity,panel_code) VALUES (?,?,?,?,?,?,?,?)').bind(fn, u, await hashPassword(pw), ref.role, ref.created_by || null, ref.balance | 0, validity, ref.panel_code).run();
        await db.prepare('UPDATE referrals SET used=1 WHERE code=?').bind(code).run();
        return redir('/login?msg=' + encodeURIComponent('Account created! Please login.'));
      }
      return html(registerPage({ panelName: envName }));
    }
    if (path === '/reset-device') {
      if (method === 'POST') {
        const p = await formParams(request);
        const u = String(p.username || '').trim(), pw = String(p.password || '');
        const row = await db.prepare('SELECT * FROM users WHERE username=?').bind(u).first().catch(() => null);
        if (!row || !(await verifyPassword(pw, row.password_hash))) return html(resetPage({ error: 'Invalid username or password', panelName: envName }));
        if ((row.is_blocked | 0) === 1) return html(resetPage({ error: 'Account suspended.', panelName: envName }));
        if (row.last_reset && tsMs(row.last_reset) + 864e5 > Date.now()) {
          const next = new Date(tsMs(row.last_reset) + 864e5 + 19800e3).toISOString().slice(0, 19).replace('T', ' ');
          return html(resetPage({ error: '24h me 1 baar hi reset. Next slot: ' + next + ' IST', panelName: envName }));
        }
        await db.prepare("UPDATE users SET device_fingerprint=NULL,last_reset=datetime('now') WHERE id=?").bind(row.id).run();
        return redir('/login?msg=' + encodeURIComponent('Device reset successful! You can now login on new device.'));
      }
      return html(resetPage({ panelName: envName }));
    }
    if (path === '/join-panel') {
      if (method === 'POST') {
        const p = await formParams(request);
        const pc = String(p.panel_code || '').toUpperCase().replace(/\s+/g, '');
        const u = String(p.username || '').trim(), pw = String(p.password || '');
        if (!pc || u.length < 3 || pw.length < 4) return html(joinPage({ error: 'Sahi panel code / username / password (min 4) do.', panelName: envName }));
        const prow = await db.prepare('SELECT * FROM panels WHERE panel_code=?').bind(pc).first().catch(() => null);
        if (!prow) return html(joinPage({ error: 'Panel not found.', panelName: envName }));
        const own = await db.prepare("SELECT id FROM users WHERE panel_code=? AND role='OWNER'").bind(pc).first().catch(() => null);
        if (own) return html(joinPage({ error: 'Panel already claimed hai.', panelName: envName }));
        if (await db.prepare('SELECT id FROM users WHERE username=?').bind(u).first().catch(() => null)) return html(joinPage({ error: 'Username taken.', panelName: envName }));
        await db.prepare('INSERT INTO users (full_name,username,password_hash,role,balance,validity,panel_code) VALUES (?,?,?,?,?,?,?)').bind(pc + ' Admin', u, await hashPassword(pw), 'OWNER', 999999, prow.expires_at || null, pc).run();
        return redir('/login?msg=' + encodeURIComponent('Panel claimed! Please login.'));
      }
      return html(joinPage({ panelName: envName }));
    }
    if (path === '/logout') {
      const t = parseCookies(request)['sdk_session'];
      if (t) await db.prepare('DELETE FROM sessions WHERE token=?').bind(t).run().catch(() => {});
      return redir('/login', clearCookie());
    }

    const sess = await getSession(db, request);
    if (!sess) return redir('/login');
    if ((sess.is_blocked | 0) === 1) {
      const t = parseCookies(request)['sdk_session'];
      if (t) await db.prepare('DELETE FROM sessions WHERE token=?').bind(t).run().catch(() => {});
      return redir('/login?msg=' + encodeURIComponent('You have been logged out. Account is Blocked.'), clearCookie());
    }
    const myPanel = sess.panel_code || mainPanel;
    const myId = sess.id, myRole = sess.role;
    const isOA = myRole === 'OWNER' || myRole === 'ADMIN';
    const P = async (route, title, content) => html(panelLayout({ title, route, sess, panelName: await panelName(db, myPanel, envName), content, theme: await getTheme(db, myPanel) }));
    const S = async (route, title, content) => html(layout({ title, route, username: sess.username, panelCode: myPanel, panelName: envName, content, theme: await getTheme(db, myPanel) }));
    const needOA = () => { if (!isOA) return deny(); return null; };
    const needOwner = () => { if (myRole !== 'OWNER') return deny(); return null; };

    // ---------- PANEL DASHBOARD ----------
    if (path === '/' || path === '/dashboard') {
      const me = await db.prepare('SELECT balance FROM users WHERE id=?').bind(myId).first().catch(() => ({}));
      const balanceText = myRole === 'OWNER' ? 'UNLIMITED' : Number(me?.balance || 0).toLocaleString('en-IN');
      let stats = {};
      if (myRole === 'OWNER') {
        const r = await db.prepare("SELECT (SELECT COUNT(*) FROM users WHERE panel_code=? AND role='ADMIN') a,(SELECT COUNT(*) FROM users WHERE panel_code=? AND role='RESELLER') r,(SELECT COUNT(*) FROM api_keys WHERE panel_code=?) t,(SELECT COUNT(*) FROM api_keys k JOIN users u ON k.created_by=u.id WHERE k.panel_code=? AND u.role='ADMIN') ak,(SELECT COUNT(*) FROM api_keys k JOIN users u ON k.created_by=u.id WHERE k.panel_code=? AND u.role='RESELLER') rk,(SELECT COUNT(*) FROM api_keys WHERE panel_code=? AND is_blocked=0) ac").bind(myPanel, myPanel, myPanel, myPanel, myPanel, myPanel).first().catch(() => ({}));
        stats = { total_admins: r?.a || 0, total_resellers: r?.r || 0, total_keys: r?.t || 0, admin_keys: r?.ak || 0, reseller_keys: r?.rk || 0, active_keys: r?.ac || 0 };
      } else if (myRole === 'ADMIN') {
        const r = await db.prepare("SELECT (SELECT COUNT(*) FROM users WHERE panel_code=? AND role='RESELLER' AND invited_by=?) a,(SELECT COUNT(*) FROM api_keys WHERE panel_code=? AND created_by=?) b,(SELECT COUNT(*) FROM api_keys k JOIN users u ON k.created_by=u.id WHERE k.panel_code=? AND u.role='RESELLER' AND u.invited_by=?) c,(SELECT COUNT(*) FROM api_keys WHERE panel_code=? AND created_by=? AND is_blocked=0) d").bind(myPanel, myId, myPanel, myId, myPanel, myId, myPanel, myId).first().catch(() => ({}));
        stats = { my_resellers: r?.a || 0, my_keys: r?.b || 0, my_reseller_keys: r?.c || 0, my_active_keys: r?.d || 0, team_keys: (r?.b || 0) + (r?.c || 0) };
      } else {
        const r = await db.prepare('SELECT (SELECT COUNT(*) FROM api_keys WHERE panel_code=? AND created_by=?) a,(SELECT COUNT(*) FROM api_keys WHERE panel_code=? AND created_by=? AND is_blocked=0) b').bind(myPanel, myId, myPanel, myId).first().catch(() => ({}));
        stats = { my_keys: r?.a || 0, my_active_keys: r?.b || 0 };
      }
      return P('dashboard', 'Dashboard', panelDashboard(sess, stats, balanceText));
    }

    // ---------- PANEL GENERATE ----------
    if (path === '/generate') {
      let ok = '', error = '', keys = [];
      if (method === 'POST') {
        const p = await formParams(request);
        const dur = String(p.duration || '');
        const limit = Math.min(10, Math.max(1, parseInt(p.device_limit, 10) || 1));
        let amount = Math.min(500, Math.max(1, parseInt(p.bulk_amount, 10) || 1));
        if (p.is_bulk == null && amount <= 1) amount = 1;
        let custom = String(p.custom_key || '').trim();
        let server = 'PRIVATE';
        if (myRole === 'OWNER') { const s = String(p.server_type || 'PRIVATE').toUpperCase(); if (['ADMIN', 'SAFE', 'PRIVATE', 'PUBLIC'].includes(s)) server = s; }
        if (!KEY_DURATIONS.includes(dur)) error = 'Invalid duration.';
        else if (amount === 1 && custom && custom.length > 50) error = 'Custom key max 50 chars.';
        else {
          const prow = await db.prepare('SELECT panel_code FROM panels WHERE panel_code=?').bind(myPanel).first().catch(() => null);
          if (!prow) error = "Panel '" + myPanel + "' database me nahi mila. Owner se panel create karwao.";
          else {
            const total = (KEY_PRICING[dur] || 10) * limit * amount;
            if (myRole !== 'OWNER') {
              const me = await db.prepare('SELECT balance FROM users WHERE id=?').bind(myId).first().catch(() => ({}));
              if ((me?.balance | 0) < total) error = 'Insufficient balance! Need Rs ' + total + ' for ' + amount + ' key(s).';
            }
            if (!error) {
              if (myRole !== 'OWNER') await db.prepare('UPDATE users SET balance=balance-? WHERE id=? AND balance>=?').bind(total, myId, total).run();
              const mkStmt = (kv) => db.prepare('INSERT INTO api_keys (key_value,duration,device_limit,panel_code,created_by,server_type) VALUES (?,?,?,?,?,?)').bind(kv, dur, limit, myPanel, myId, server);
              if (amount === 1 && custom) {
                try { await mkStmt(custom).run(); keys.push(custom); }
                catch (e) { error = 'Duplicate key. Try another custom key.'; }
              } else {
                const seen = new Set(), cands = [];
                for (let i = 0; i < amount; i++) { let kv; do { kv = dur + '-' + arcxRand(12); } while (seen.has(kv)); seen.add(kv); cands.push(kv); }
                const put = async (list) => {
                  const res = await Promise.allSettled(list.map(kv => mkStmt(kv).run()));
                  const failed = [];
                  res.forEach((r, j) => { if (r.status === 'fulfilled') keys.push(list[j]); else failed.push(list[j]); });
                  return failed;
                };
                let failed = [];
                for (let i = 0; i < cands.length; i += 50) failed = failed.concat(await put(cands.slice(i, i + 50)));
                if (failed.length) {
                  const retry = [];
                  for (let i = 0; i < failed.length; i++) { let kv; do { kv = dur + '-' + arcxRand(12); } while (seen.has(kv)); seen.add(kv); retry.push(kv); }
                  failed = await put(retry);
                }
                if (failed.length) error = failed.length + ' keys failed (duplicate), baaki ban gayi.';
              }
              if (keys.length && !error) ok = keys.length + ' key(s) generated (' + dur + ', ' + limit + ' device).';
              else if (keys.length && error) ok = keys.length + ' key(s) generated (' + dur + ', ' + limit + ' device).';
            }
          }
        }
      }
      return P('generate', 'Generate Keys', panelGenerate(sess, { ok, error, keys }));
    }

    // ---------- PANEL KEY LIST ----------
    if (path === '/keys') {
      let ok = '', error = '';
      const canMod = async (kid) => {
        const k = await db.prepare('SELECT * FROM api_keys WHERE id=? AND panel_code=?').bind(kid, myPanel).first().catch(() => null);
        if (!k) return null;
        if (myRole === 'OWNER') return k;
        if (k.created_by === myId) return k;
        if (myRole === 'ADMIN') { const c = await db.prepare('SELECT invited_by FROM users WHERE id=?').bind(k.created_by).first().catch(() => null); if (c && (c.invited_by | 0) === myId) return k; }
        return null;
      };
      if (method === 'POST') {
        const p = await formParams(request);
        const a = p.action;
        if (p.bulk && myRole === 'OWNER') {
          if (a === 'delete_all') { await db.prepare('DELETE FROM api_keys WHERE panel_code=?').bind(myPanel).run(); ok = 'All panel keys deleted.'; }
          else if (a === 'delete_expired') { await db.prepare("DELETE FROM api_keys WHERE panel_code=? AND expires_at IS NOT NULL AND expires_at<datetime('now')").bind(myPanel).run(); ok = 'Expired keys deleted.'; }
          else if (a === 'extend_all') {
            const v = parseInt(p.extend_val, 10) || 0, u = String(p.extend_unit || 'D').toUpperCase() === 'H' ? 'hours' : 'days';
            if (v > 0) { await db.prepare("UPDATE api_keys SET expires_at=datetime(COALESCE(expires_at,'now'),?) WHERE panel_code=?").bind('+' + v + ' ' + u, myPanel).run(); ok = 'All keys extended +' + v + u[0] + '.'; }
          }
        } else if (a === 'reset_device' && p.key_id) {
          if (await canMod(+p.key_id)) { await db.prepare('DELETE FROM key_devices WHERE key_id=?').bind(+p.key_id).run(); ok = 'Devices reset.'; } else error = 'Not allowed.';
        } else if (a === 'delete_key' && p.key_id) {
          if (await canMod(+p.key_id)) { await db.prepare('DELETE FROM api_keys WHERE id=?').bind(+p.key_id).run(); ok = 'Key deleted.'; } else error = 'Not allowed.';
        } else if (a === 'edit_key' && p.key_id) {
          const k = await canMod(+p.key_id);
          if (!k) error = 'Not allowed.';
          else {
            const blk = String(p.edit_status) === '0' ? 1 : 0;
            const ev = parseInt(p.extend_val, 10) || 0, eu = String(p.extend_unit || 'D').toUpperCase() === 'H' ? 'hours' : 'days';
            await db.prepare('UPDATE api_keys SET is_blocked=? WHERE id=?').bind(blk, k.id).run();
            if (ev > 0) {
              if (!k.expires_at) await db.prepare('UPDATE api_keys SET duration=? WHERE id=?').bind((k.duration || '') + '+' + ev + eu[0], k.id).run().catch(() => {});
              else await db.prepare("UPDATE api_keys SET expires_at=datetime(expires_at,?) WHERE id=?").bind('+' + ev + ' ' + eu, k.id).run();
            }
            if (myRole === 'OWNER' && p.edit_server && ['PRIVATE', 'PUBLIC', 'ADMIN', 'SAFE'].includes(String(p.edit_server))) await db.prepare('UPDATE api_keys SET server_type=? WHERE id=?').bind(String(p.edit_server), k.id).run();
            ok = 'Key updated.';
          }
        }
      }
      let q = 'SELECT k.*,(SELECT COUNT(*) FROM key_devices d WHERE d.key_id=k.id) dev_count,(SELECT username FROM users WHERE id=k.created_by) creator FROM api_keys k WHERE k.panel_code=? ';
      const args = [myPanel];
      if (myRole === 'ADMIN') { q += 'AND (k.created_by=? OR k.created_by IN (SELECT id FROM users WHERE invited_by=?)) '; args.push(myId, myId); }
      else if (myRole === 'RESELLER') { q += 'AND k.created_by=? '; args.push(myId); }
      q += 'ORDER BY k.id DESC LIMIT 200';
      const rows = (await db.prepare(q).bind(...args).all().catch(() => ({ results: [] }))).results || [];
      return P('keys', 'Key Manager', panelKeyList(sess, rows, { ok, error }));
    }

    // ---------- USERS ----------
    if (path === '/users') {
      if (needOA()) return deny();
      let ok = '', error = '';
      if (method === 'POST') {
        const p = await formParams(request);
        const tid = parseInt(p.target_id, 10) || 0, amt = Math.abs(parseInt(p.amount, 10) || 0);
        const t = tid ? await db.prepare('SELECT * FROM users WHERE id=? AND panel_code=?').bind(tid, myPanel).first().catch(() => null) : null;
        const tIsOwnReseller = t && t.role === 'RESELLER' && (t.invited_by | 0) === myId;
        if (!t) error = 'User not found.';
        else if (myRole === 'ADMIN' && (t.role === 'OWNER' || (t.id !== myId && !tIsOwnReseller))) error = 'Not allowed.';
        else if (p.action === 'toggle_block') {
          if (t.id === myId) error = 'Self block nahi.';
          else { await db.prepare('UPDATE users SET is_blocked=1-is_blocked WHERE id=?').bind(tid).run(); ok = 'Block toggled.'; }
        } else if ((p.action === 'add_balance' || p.action === 'deduct_balance') && amt > 0) {
          await db.prepare(p.action === 'add_balance' ? 'UPDATE users SET balance=balance+? WHERE id=?' : 'UPDATE users SET balance=CASE WHEN balance-?<0 THEN 0 ELSE balance-? END WHERE id=?').bind(...(p.action === 'add_balance' ? [amt, tid] : [amt, amt, tid])).run(); ok = 'Balance updated.';
        }
        if (allowed === false && !ok && !error) error = 'Not allowed.';
      }
      let list;
      if (myRole === 'OWNER') list = (await db.prepare("SELECT u.*,(SELECT username FROM users WHERE id=u.invited_by) invited FROM users u WHERE u.panel_code=? ORDER BY u.id DESC LIMIT 200").bind(myPanel).all().catch(() => ({ results: [] }))).results || [];
      else list = (await db.prepare("SELECT u.*,(SELECT username FROM users WHERE id=u.invited_by) invited FROM users u WHERE u.panel_code=? AND (u.id=? OR (u.role='RESELLER' AND u.invited_by=?)) ORDER BY u.id DESC").bind(myPanel, myId, myId).all().catch(() => ({ results: [] }))).results || [];
      return P('users', 'User Management', usersPage(sess, list, { ok, error }));
    }

    // ---------- ADMINS ----------
    if (path === '/admins') {
      if (needOwner()) return deny();
      let ok = '';
      if (method === 'POST') {
        const p = await formParams(request);
        const vk = await db.prepare('SELECT id FROM api_keys WHERE id=? AND panel_code=?').bind(parseInt(p.key_id, 10) || 0, myPanel).first().catch(() => null);
        if (vk) {
          if (p.action === 'toggle_key_block') await db.prepare('UPDATE api_keys SET is_blocked=1-is_blocked WHERE id=?').bind(vk.id).run();
          else if (p.action === 'delete_key') await db.prepare('DELETE FROM api_keys WHERE id=?').bind(vk.id).run();
          ok = 'Done.';
        }
        if (p.target_user_id) return redir('/admins?view_keys=' + encodeURIComponent(p.target_user_id));
      }
      const vid = parseInt(url.searchParams.get('view_keys') || '0', 10);
      if (vid) {
        const vu = await db.prepare("SELECT * FROM users WHERE id=? AND panel_code=? AND role IN ('ADMIN','RESELLER')").bind(vid, myPanel).first().catch(() => null);
        if (!vu) return redir('/admins');
        const vks = (await db.prepare('SELECT * FROM api_keys WHERE created_by=? AND panel_code=? ORDER BY id DESC LIMIT 200').bind(vid, myPanel).all().catch(() => ({ results: [] }))).results || [];
        return P('admins', 'Admin Manager', adminsPage([], vu, vks, { ok }));
      }
      const list = (await db.prepare("SELECT u.*,(SELECT COUNT(*) FROM api_keys WHERE created_by=u.id) total_keys FROM users u WHERE u.panel_code=? AND u.role IN ('ADMIN','RESELLER') AND u.id!=? ORDER BY u.id DESC").bind(myPanel, myId).all().catch(() => ({ results: [] }))).results || [];
      return P('admins', 'Admin Manager', adminsPage(list, null, [], { ok }));
    }

    // ---------- PERMISSIONS ----------
    if (path === '/permissions') {
      if (needOwner()) return deny();
      let ok = '';
      if (method === 'POST') {
        const p = await formParams(request);
        const tid = parseInt(p.target_id, 10) || 0;
        if (tid && tid !== myId) {
          if (p.action === 'toggle_ref') await db.prepare('UPDATE users SET can_generate_referral=1-can_generate_referral WHERE id=? AND panel_code=?').bind(tid, myPanel).run();
          else if (p.action === 'update_limit') await db.prepare('UPDATE users SET referral_limit=? WHERE id=? AND panel_code=?').bind(Math.max(0, parseInt(p.ref_limit, 10) || 0), tid, myPanel).run();
          ok = 'Saved.';
        }
      }
      const list = (await db.prepare("SELECT * FROM users WHERE panel_code=? AND role IN ('ADMIN','RESELLER') AND id!=? ORDER BY id DESC").bind(myPanel, myId).all().catch(() => ({ results: [] }))).results || [];
      return P('permissions', 'Permission', permissionsPage(list, { ok }));
    }

    // ---------- REFERRAL ----------
    if (path === '/referral') {
      if (needOA()) return deny();
      let ok = '', error = '';
      if (method === 'POST') {
        const p = await formParams(request);
        if (p.action === 'generate') {
          const rr = String(p.role || 'RESELLER').toUpperCase();
          let role = (myRole === 'OWNER' && ['OWNER', 'ADMIN', 'RESELLER'].includes(rr)) ? rr : 'RESELLER';
          const dur = Math.max(1, parseInt(p.duration, 10) || 30), bal = Math.max(0, parseInt(p.balance, 10) || 0);
          if (myRole !== 'OWNER') {
            const me = await db.prepare('SELECT can_generate_referral,referral_limit FROM users WHERE id=?').bind(myId).first().catch(() => ({}));
            if (!(me?.can_generate_referral | 0)) error = 'Referral generation disabled for you.';
            else if ((me?.referral_limit | 0) > 0) {
              const c = await db.prepare('SELECT COUNT(*) c FROM referrals WHERE created_by=?').bind(myId).first().catch(() => ({ c: 99 }));
              if ((c?.c || 0) >= (me.referral_limit | 0)) error = 'Referral limit reached.';
            }
          }
          if (!error) {
            const rb = new Uint8Array(4); crypto.getRandomValues(rb);
            const code = 'REF-' + [...rb].map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
            await db.prepare('INSERT INTO referrals (code,role,duration,balance,panel_code,created_by) VALUES (?,?,?,?,?,?)').bind(code, role, dur, bal, myPanel, myId).run();
            ok = code;
          }
        } else if (p.action === 'delete_ref' && p.del_code) {
          if (myRole === 'OWNER') await db.prepare('DELETE FROM referrals WHERE code=? AND panel_code=?').bind(String(p.del_code), myPanel).run();
          else await db.prepare('DELETE FROM referrals WHERE code=? AND created_by=?').bind(String(p.del_code), myId).run();
          return redir('/referral');
        }
      }
      const list = myRole === 'OWNER'
        ? (await db.prepare('SELECT * FROM referrals WHERE panel_code=? ORDER BY rowid DESC LIMIT 200').bind(myPanel).all().catch(() => ({ results: [] }))).results || []
        : (await db.prepare('SELECT * FROM referrals WHERE created_by=? ORDER BY rowid DESC LIMIT 200').bind(myId).all().catch(() => ({ results: [] }))).results || [];
      return P('referral', 'Referrals', referralPage(sess, list, { ok, error }));
    }

    // ---------- AES ----------
    if (path === '/aes') {
      if (needOwner()) return deny();
      let ok = '', error = '';
      if (method === 'POST') {
        const p = await formParams(request);
        if (p.action === 'generate_aes') {
          if (myId !== 1) error = 'Only main owner.';
          else {
            const rk = new Uint8Array(32); crypto.getRandomValues(rk);
            const riv = new Uint8Array(16); crypto.getRandomValues(riv);
            const hx = (a) => [...a].map(b => b.toString(16).padStart(2, '0')).join('');
            await db.prepare('INSERT INTO mod_settings (setting_name,setting_value,panel_code) VALUES (?,?,?) ON CONFLICT(setting_name,panel_code) DO UPDATE SET setting_value=excluded.setting_value').bind('aes_key', hx(rk), myPanel).run();
            await db.prepare('INSERT INTO mod_settings (setting_name,setting_value,panel_code) VALUES (?,?,?) ON CONFLICT(setting_name,panel_code) DO UPDATE SET setting_value=excluded.setting_value').bind('aes_iv', hx(riv), myPanel).run();
            ok = 'AES rotated (256-bit key + 128-bit IV).';
          }
        } else if (p.action === 'generate_activation') {
          if (myId !== 1) error = 'Only main owner.';
          else {
            const key = arcxRand(14), months = Math.min(120, Math.max(1, parseInt(p.duration, 10) || 1));
            const exp = new Date(Date.now() + months * 30 * 864e5).toISOString().slice(0, 19).replace('T', ' ');
            await db.prepare('INSERT INTO activation_keys (activation_key,panel_code,name,duration_months,expires_at) VALUES (?,?,?,?,?)').bind(key, myPanel, String(p.key_name || '').slice(0, 50), months, exp).run();
            ok = key;
          }
        } else if (p.action === 'delete_activation') {
          if (myId !== 1) error = 'Only main owner.';
          else { await db.prepare('DELETE FROM activation_keys WHERE activation_key=?').bind(String(p.del_key || '').trim().toUpperCase()).run(); ok = 'Activation key deleted.'; }
        } else if (p.action === 'redeem_activation') {
          const k = String(p.activation_key || '').trim().toUpperCase();
          const row = await db.prepare('SELECT * FROM activation_keys WHERE activation_key=? AND is_used=0').bind(k).first().catch(() => null);
          if (!row) error = 'Invalid / used key.';
          else {
            await db.prepare("UPDATE activation_keys SET is_used=1,used_by=?,used_at=datetime('now') WHERE activation_key=?").bind(myPanel, k).run();
            await db.prepare('UPDATE users SET panel_expiry=? WHERE panel_code=?').bind(row.expires_at, myPanel).run();
            ok = 'Panel activated till ' + row.expires_at;
          }
        }
      }
      const s = await db.prepare('SELECT setting_name,setting_value FROM mod_settings WHERE panel_code=? AND setting_name IN (?,?)').bind(myPanel, 'aes_key', 'aes_iv').all().then(r => Object.fromEntries((r.results || []).map(x => [x.setting_name, x.setting_value]))).catch(() => ({}));
      const me = await db.prepare('SELECT panel_expiry FROM users WHERE id=?').bind(myId).first().catch(() => ({}));
      const recent = myId === 1 ? (await db.prepare('SELECT * FROM activation_keys ORDER BY id DESC LIMIT 10').all().catch(() => ({ results: [] }))).results || [] : [];
      return P('aes', 'API Encryption', aesPage({ ok, error, aesKey: s.aes_key, aesIv: s.aes_iv, expiry: me?.panel_expiry, recent }, myId === 1));
    }

    // ---------- API TEST ----------
    if (path === '/api-test') {
      if (needOA()) return deny();
      const base = 'https://' + url.host;
      return P('api-test', 'Live API Tester', apiTestPage({ connect: base + '/connect/' + myPanel, encrypt: base + '/encrypt/' + myPanel }));
    }

    // ---------- SERVER ----------
    if (path === '/server') {
      if (needOA()) return deny();
      let ok = '';
      if (method === 'POST') {
        const p = await formParams(request);
        const on = p.maintenance_mode != null ? 1 : 0;
        await db.prepare('INSERT INTO mod_maintenance (panel_code,is_active,reason) VALUES (?,?,?) ON CONFLICT(panel_code) DO UPDATE SET is_active=excluded.is_active,reason=excluded.reason').bind(myPanel, on, String(p.maintenance_reason || '').slice(0, 255)).run();
        for (const k of MOD_FIELDS) {
          const v = ['ESP', 'Item', 'AIM', 'SilentAim', 'BulletTrack', 'Floating', 'Memory', 'Setting'].includes(k) ? (p[k] != null ? 'on' : 'off') : String(p[k] ?? '').slice(0, 255);
          if (p[k] !== undefined || ['ESP', 'Item', 'AIM', 'SilentAim', 'BulletTrack', 'Floating', 'Memory', 'Setting'].includes(k))
            await db.prepare('INSERT INTO mod_settings (setting_name,setting_value,panel_code) VALUES (?,?,?) ON CONFLICT(setting_name,panel_code) DO UPDATE SET setting_value=excluded.setting_value').bind(k, v, myPanel).run();
        }
        ok = 'Server config saved.';
      }
      const s = await db.prepare('SELECT setting_name,setting_value FROM mod_settings WHERE panel_code=?').bind(myPanel).all().then(r => Object.fromEntries((r.results || []).map(x => [x.setting_name, x.setting_value]))).catch(() => ({}));
      const m = await db.prepare('SELECT * FROM mod_maintenance WHERE panel_code=?').bind(myPanel).first().catch(() => null);
      return P('server', 'Server & Mod', serverPage(s, { on: m ? (m.is_active | 0) : 0, reason: m?.reason || '' }, { ok }));
    }

    // ---------- SETTINGS ----------
    if (path === '/settings') {
      let ok = '', error = '';
      if (method === 'POST') {
        const p = await formParams(request);
        if (p.action === 'update_password') {
          const me = await db.prepare('SELECT password_hash FROM users WHERE id=?').bind(myId).first().catch(() => null);
          if (!me || !(await verifyPassword(String(p.current_password || ''), me.password_hash))) error = 'Current password galat.';
          else if (String(p.new_password || '').length < 4) error = 'New password min 4.';
          else { await db.prepare('UPDATE users SET password_hash=? WHERE id=?').bind(await hashPassword(String(p.new_password)), myId).run(); ok = 'Password updated.'; }
        } else if (p.action === 'update_branding' && myRole === 'OWNER') {
          await db.prepare('INSERT INTO mod_settings (setting_name,setting_value,panel_code) VALUES (?,?,?) ON CONFLICT(setting_name,panel_code) DO UPDATE SET setting_value=excluded.setting_value').bind('panel_name', String(p.panel_name || '').slice(0, 50), myPanel).run(); ok = 'Panel name saved.';
        } else if (p.action === 'update_theme' && myRole === 'OWNER') {
          const t = String(p.ui_theme || 'blue');
          if (!THEMES.includes(t)) error = 'Invalid theme.';
          else { await db.prepare('INSERT INTO mod_settings (setting_name,setting_value,panel_code) VALUES (?,?,?) ON CONFLICT(setting_name,panel_code) DO UPDATE SET setting_value=excluded.setting_value').bind('ui_theme', t, myPanel).run(); ok = 'Theme applied.'; }
        }
      }
      const base = 'https://' + url.host;
      const pn = await panelName(db, myPanel, envName);
      return P('settings', 'Settings', settingsPage(sess, { ok, error, panelName: pn }, { connect: base + '/connect/' + myPanel, encrypt: base + '/encrypt/' + myPanel }, await getTheme(db, myPanel)));
    }

    // ---------- LOADER ----------
    if (path === '/loader-manager') {
      if (needOA()) return deny();
      let ok = '';
      if (method === 'POST') {
        const p = await formParams(request);
        if (p.form_type === 'loader_config') {
          const v = Math.max(1.0, parseFloat(p.version) || 1.0);
          await db.prepare('INSERT INTO loader_config (panel_code,version) VALUES (?,?) ON CONFLICT(panel_code) DO UPDATE SET version=excluded.version').bind(myPanel, v).run(); ok = 'Version saved.';
        } else if (p.form_type === 'lib_urls') {
          for (const s of ['PRIVATE', 'PUBLIC', 'ADMIN', 'SAFE']) {
            const u = String(p['lib_' + s] || '').trim().slice(0, 500);
            await db.prepare('DELETE FROM loader_files WHERE panel_code=? AND server_type=?').bind(myPanel, s).run();
            if (u) await db.prepare('INSERT INTO loader_files (panel_code,file_name,file_path,server_type) VALUES (?,?,?,?)').bind(myPanel, 'loader_' + myPanel + '_' + s + '.url', u, s).run();
          }
          ok = 'Lib URLs saved.';
        } else if (p.form_type === 'mod_config') {
          for (const k of ['modname', 'mod_status', 'credit', 'ESP', 'Item', 'AIM', 'SilentAim', 'BulletTrack', 'Floating', 'Memory', 'Setting']) {
            const v = ['ESP', 'Item', 'AIM', 'SilentAim', 'BulletTrack', 'Floating', 'Memory', 'Setting'].includes(k) ? (p[k] != null ? 'on' : 'off') : String(p[k] ?? '').slice(0, 255);
            if (p[k] !== undefined || k !== 'modname' && k !== 'mod_status' && k !== 'credit')
              await db.prepare('INSERT INTO mod_settings (setting_name,setting_value,panel_code) VALUES (?,?,?) ON CONFLICT(setting_name,panel_code) DO UPDATE SET setting_value=excluded.setting_value').bind(k, v, myPanel).run();
          }
          ok = 'Mod config saved.';
        }
      }
      const ver = await db.prepare('SELECT version FROM loader_config WHERE panel_code=?').bind(myPanel).first().catch(() => null);
      const libs = await db.prepare('SELECT server_type,file_path FROM loader_files WHERE panel_code=?').bind(myPanel).all().then(r => Object.fromEntries((r.results || []).map(x => [x.server_type, x.file_path]))).catch(() => ({}));
      const mod = await db.prepare('SELECT setting_name,setting_value FROM mod_settings WHERE panel_code=?').bind(myPanel).all().then(r => Object.fromEntries((r.results || []).map(x => [x.setting_name, x.setting_value]))).catch(() => ({}));
      return P('loader-manager', 'Set Mod/Loader', loaderPage({ ok, version: ver?.version || '1.0', libs, mod }));
    }

    // ---------- CREATE PANEL ----------
    if (path === '/create-panel') {
      if (myId !== 1) return deny();
      let ok = '', error = '';
      if (method === 'POST') {
        const p = await formParams(request);
        if (p.action === 'create') {
          let code = String(p.custom_code || '').toUpperCase().replace(/[^A-Z0-9_]/g, '').slice(0, 15);
          if (!code) { const rb = new Uint8Array(3); crypto.getRandomValues(rb); code = 'PNL' + [...rb].map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase(); }
          const dur = Math.max(1, parseInt(p.duration, 10) || 30);
          if (await db.prepare('SELECT panel_code FROM panels WHERE panel_code=?').bind(code).first().catch(() => null)) error = 'Panel code exists.';
          else {
            const exp = new Date(Date.now() + dur * 864e5).toISOString().slice(0, 19).replace('T', ' ');
            await db.prepare('INSERT INTO panels (panel_code,duration,expires_at,is_active) VALUES (?,?,?,1)').bind(code, dur, exp).run();
            ok = 'Panel ' + code + ' created.';
          }
        } else if (p.action === 'toggle_status' && p.target_panel) {
          if (String(p.target_panel) === 'YUVI_001' && mainPanel === 'YUVI_001') error = 'Main panel protected.';
          else { await db.prepare('UPDATE panels SET is_active=1-is_active WHERE panel_code=?').bind(String(p.target_panel)).run(); ok = 'Status toggled.'; }
        } else if (p.action === 'delete_panel' && p.target_panel) {
          const t = String(p.target_panel);
          if (t === myPanel) error = 'Own panel delete nahi.';
          else {
            await db.prepare('DELETE FROM key_devices WHERE panel_code=?').bind(t).run().catch(() => {});
            await db.prepare('DELETE FROM api_keys WHERE panel_code=?').bind(t).run().catch(() => {});
            await db.prepare('DELETE FROM users WHERE panel_code=?').bind(t).run().catch(() => {});
            await db.prepare('DELETE FROM panels WHERE panel_code=?').bind(t).run();
            ok = 'Panel ' + t + ' deleted.';
          }
        }
      }
      const list = (await db.prepare('SELECT p.*,(SELECT COUNT(*) FROM users WHERE panel_code=p.panel_code) total_users,(SELECT COUNT(*) FROM api_keys WHERE panel_code=p.panel_code) total_keys FROM panels p ORDER BY p.panel_code').all().catch(() => ({ results: [] }))).results || [];
      return P('create-panel', 'New Tenant', createPanelPage(list, { ok, error }));
    }

    // ---------- SDK (id==1 OWNER gate, same as PHP) ----------
    const sdkGate = () => (myId === 1 && myRole === 'OWNER' ? null : redir('/dashboard'));
    if (path === '/sdk') {
      const g = sdkGate(); if (g) return g;
      const q = async (sql, ...b) => (await db.prepare(sql).bind(...b).first().catch(() => ({})));
      const mP = mainPanel;
      const d = {
        mTotal: (await q('SELECT COUNT(*) c FROM mundo_keys WHERE panel_code=?', mP)).c || 0,
        mActive: (await q('SELECT COUNT(*) c FROM mundo_keys WHERE panel_code=? AND is_blocked=0', mP)).c || 0,
        mBlocked: (await q('SELECT COUNT(*) c FROM mundo_keys WHERE panel_code=? AND is_blocked=1', mP)).c || 0,
        mPkgs: (await q('SELECT COUNT(*) c FROM mundo_key_bindings b JOIN mundo_keys k ON b.sdk_key_id=k.id WHERE k.panel_code=?', mP)).c || 0,
        bTotal: (await q('SELECT COUNT(*) c FROM bcore_keys WHERE panel_code=?', mP)).c || 0,
        bActive: (await q('SELECT COUNT(*) c FROM bcore_keys WHERE panel_code=? AND is_blocked=0', mP)).c || 0,
        bBlocked: (await q('SELECT COUNT(*) c FROM bcore_keys WHERE panel_code=? AND is_blocked=1', mP)).c || 0,
        bPkgs: (await q('SELECT COUNT(*) c FROM bcore_key_bindings b JOIN bcore_keys k ON b.sdk_key_id=k.id WHERE k.panel_code=?', mP)).c || 0,
        recentM: (await db.prepare('SELECT * FROM mundo_keys WHERE panel_code=? ORDER BY id DESC LIMIT 5').bind(mP).all().catch(() => ({ results: [] }))).results || [],
        recentB: (await db.prepare('SELECT * FROM bcore_keys WHERE panel_code=? ORDER BY id DESC LIMIT 5').bind(mP).all().catch(() => ({ results: [] }))).results || [],
      };
      return S('sdk', 'SDK Dashboard', dashboardPage(d));
    }
    if (path === '/sdk/generate') {
      const g = sdkGate(); if (g) return g;
      let success = '', error = '';
      if (method === 'POST') {
        const p = await formParams(request);
        const engine = p.engine === 'BCORE' ? 'BCORE' : 'MUNDO';
        let ck = String(p.sdk_key || '').trim();
        const dur = parseInt(p.duration, 10), pkg = Math.max(1, parseInt(p.pkg_limit, 10) || 1), app = Math.max(1, parseInt(p.app_limit, 10) || 1);
        const f1 = p.feature1 != null ? 1 : 0, f2 = p.feature2 != null ? 1 : 0;
        const table = engine === 'BCORE' ? 'bcore_keys' : 'mundo_keys';
        if (ck !== '' && ck.length < 5) error = 'Custom key must be at least 5 characters.';
        else if (![7, 15, 30, 60].includes(dur)) error = 'Invalid duration.';
        else if (pkg > 10 || app > 20) error = 'Limits too high.';
        else {
          if (!ck) ck = randomHexKey();
          if (await db.prepare('SELECT id FROM ' + table + ' WHERE sdk_key=?').bind(ck).first().catch(() => null)) error = 'This SDK key already exists in ' + engine + '.';
          else {
            try { await db.prepare('INSERT INTO ' + table + ' (panel_code,sdk_key,duration_days,pkg_limit,app_limit,feature1,feature2,created_by) VALUES (?,?,?,?,?,?,?,?)').bind(mainPanel, ck, dur, pkg, app, f1, f2, myId).run(); return redir('/sdk/generate?ok=1&e=' + encodeURIComponent(engine) + '&k=' + encodeURIComponent(ck)); }
            catch (e) { error = 'Database error.'; }
          }
        }
      } else if (url.searchParams.get('ok') === '1' && url.searchParams.get('k')) success = 'SDK Key Generated! Engine: ' + url.searchParams.get('e') + ' | Key: ' + url.searchParams.get('k');
      return S('sdk/generate', 'Generate SDK', generatePage({ success, error }));
    }
    if (path === '/sdk/keys') {
      const g = sdkGate(); if (g) return g;
      if (method === 'POST') {
        const p = await formParams(request);
        const engine = p.engine === 'BCORE' ? 'BCORE' : 'MUNDO';
        const kt = engine === 'BCORE' ? 'bcore_keys' : 'mundo_keys', bt = engine === 'BCORE' ? 'bcore_key_bindings' : 'mundo_key_bindings';
        const kid = parseInt(p.key_id, 10) || 0, bid = parseInt(p.bind_id, 10) || 0;
        const own = kid ? await db.prepare('SELECT id,pkg_limit,app_limit FROM ' + kt + ' WHERE id=? AND panel_code=?').bind(kid, mainPanel).first().catch(() => null) : null;
        if (own) {
          const a = p.action;
          if (a === 'block_key') await db.prepare('UPDATE ' + kt + ' SET is_blocked=1 WHERE id=?').bind(kid).run();
          else if (a === 'unblock_key') await db.prepare('UPDATE ' + kt + ' SET is_blocked=0 WHERE id=?').bind(kid).run();
          else if (a === 'delete_key') await db.prepare('DELETE FROM ' + kt + ' WHERE id=?').bind(kid).run();
          else if (a === 'block_bind' && bid) await db.prepare('UPDATE ' + bt + ' SET is_blocked=1 WHERE id=? AND sdk_key_id=?').bind(bid, kid).run();
          else if (a === 'unblock_bind' && bid) await db.prepare('UPDATE ' + bt + ' SET is_blocked=0 WHERE id=? AND sdk_key_id=?').bind(bid, kid).run();
          else if (a === 'delete_bind' && bid) await db.prepare('DELETE FROM ' + bt + ' WHERE id=? AND sdk_key_id=?').bind(bid, kid).run();
          else if (a === 'save_bind' && bid) {
            const pn2 = String(p.pkg_name || '').trim(), an = String(p.app_name || '').trim();
            if (pn2 && an) await db.prepare('UPDATE ' + bt + ' SET pkg_name=?,app_name=? WHERE id=? AND sdk_key_id=?').bind(pn2, an, bid, kid).run();
          } else if (a === 'add_bind') {
            const pn2 = String(p.pkg_name || '').trim(), an = String(p.app_name || '').trim();
            if (pn2 && an) {
              const c = await db.prepare('SELECT COUNT(*) c FROM ' + bt + ' WHERE sdk_key_id=?').bind(kid).first().catch(() => ({ c: 99 }));
              if ((c?.c || 0) < own.pkg_limit * own.app_limit) await db.prepare('INSERT INTO ' + bt + ' (sdk_key_id,pkg_name,app_name) VALUES (?,?,?)').bind(kid, pn2, an).run();
            }
          }
        }
        return redir('/sdk/keys');
      }
      const fk = async (kt, bt) => {
        const r = await db.prepare('SELECT * FROM ' + kt + ' WHERE panel_code=? ORDER BY id DESC').bind(mainPanel).all().catch(() => ({ results: [] }));
        const ks = r.results || [];
        for (const k of ks) k.bindings = (await db.prepare('SELECT * FROM ' + bt + ' WHERE sdk_key_id=? ORDER BY id DESC').bind(k.id).all().catch(() => ({ results: [] }))).results || [];
        return ks;
      };
      return S('sdk/keys', 'SDK Keys', keysPage(await fk('mundo_keys', 'mundo_key_bindings'), await fk('bcore_keys', 'bcore_key_bindings')));
    }
    if (path === '/sdk/server') {
      const g = sdkGate(); if (g) return g;
      if (method === 'POST') {
        const p = await formParams(request);
        if (p.toggle_maintenance) {
          const e = p.engine === 'BCORE' ? 'BCORE' : 'MUNDO';
          await db.prepare('INSERT INTO sdk_server_status (panel_code,engine,maintenance_mode,maintenance_message) VALUES (?,?,?,?) ON CONFLICT(panel_code,engine) DO UPDATE SET maintenance_mode=excluded.maintenance_mode,maintenance_message=excluded.maintenance_message').bind(mainPanel, e, String(p.maintenance_mode) === '1' ? 1 : 0, String(p.maintenance_message || '').slice(0, 255)).run();
          return redir('/sdk/server?toggled=' + e.toLowerCase());
        }
      }
      const rows = (await db.prepare('SELECT engine,maintenance_mode,maintenance_message FROM sdk_server_status WHERE panel_code=?').bind(mainPanel).all().catch(() => ({ results: [] }))).results || [];
      let mM = 0, mS = '', bM = 0, bS = '';
      for (const r of rows) { if (r.engine === 'MUNDO') { mM = r.maintenance_mode | 0; mS = r.maintenance_message || ''; } if (r.engine === 'BCORE') { bM = r.maintenance_mode | 0; bS = r.maintenance_message || ''; } }
      return S('sdk/server', 'SDK Server', sdkServerPage({ mMaint: mM, mMsg: mS, bMaint: bM, bMsg: bS, host: url.host, panel: mainPanel, toggled: url.searchParams.get('toggled') || '' }));
    }
    if (path === '/sdk/hash') {
      const g = sdkGate(); if (g) return g;
      if (method === 'POST') {
        const p = await formParams(request);
        const e = p.engine === 'BCORE' ? 'BCORE' : 'MUNDO';
        if (p.action === 'add_hash') {
          const lb = String(p.hash_label || '').trim().slice(0, 100), vl = String(p.hash_value || '').trim().toLowerCase();
          if (lb && /^[a-f0-9]{64}$/.test(vl)) await db.prepare('INSERT INTO sdk_hash_vault (panel_code,engine,hash_type,hash_label,hash_value) VALUES (?,?,?,?,?)').bind(mainPanel, e, 'lib_signature', lb, vl).run();
        } else if (p.action === 'delete_hash') await db.prepare('DELETE FROM sdk_hash_vault WHERE id=? AND panel_code=?').bind(parseInt(p.hash_id, 10) || 0, mainPanel).run();
        else if (p.action === 'toggle_hash') await db.prepare('UPDATE sdk_hash_vault SET is_active=1-is_active WHERE id=? AND panel_code=?').bind(parseInt(p.hash_id, 10) || 0, mainPanel).run();
        return redir('/sdk/hash');
      }
      const mH = (await db.prepare('SELECT * FROM sdk_hash_vault WHERE panel_code=? AND engine=? ORDER BY id DESC').bind(mainPanel, 'MUNDO').all().catch(() => ({ results: [] }))).results || [];
      const bH = (await db.prepare('SELECT * FROM sdk_hash_vault WHERE panel_code=? AND engine=? ORDER BY id DESC').bind(mainPanel, 'BCORE').all().catch(() => ({ results: [] }))).results || [];
      return S('sdk/hash', 'SDK Hash', sdkHashPage({ mHashes: mH, bHashes: bH, mActive: mH.find(h => h.is_active) || null, bActive: bH.find(h => h.is_active) || null, salt: MUNDO_SALT, aesHex: mundoAesKeyHex(MUNDO_SALT) }));
    }

    return new Response('404 - Page Not Found', { status: 404 });
  }
};

// ================= MUNDO API =================
async function handleMundo(request, db, panelCode) {
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
  const keyRaw = mundoAesKey(MUNDO_SALT);
  const send = (obj, code = 200) => new Response(aesEncryptRaw(JSON.stringify(obj), keyRaw), { status: code, headers: { 'Content-Type': 'text/plain; charset=UTF-8', 'Cache-Control': 'no-store', ...cors } });
  if (request.method.toUpperCase() !== 'POST') return send({ status: false, code: 'error', message: 'Only POST' }, 405);
  try {
    const prow = await db.prepare('SELECT is_active FROM panels WHERE panel_code=?').bind(panelCode).first().catch(() => null);
    if (prow && (prow.is_active | 0) !== 1) return send({ status: false, code: 'error', message: 'Panel not found' }, 404);
    const raw = (await request.text()).trim();
    if (!raw) return send({ status: false, code: 'error', message: 'Empty body' }, 400);
    let enc = raw;
    try { const sp = new URLSearchParams(raw); if (sp.get('data')) enc = sp.get('data'); } catch {}
    const dec = aesDecryptRaw(enc, keyRaw);
    if (!dec) return send({ status: false, code: 'error', message: 'Decryption failed' }, 400);
    const parts = dec.split('|');
    if (parts.length < 4) return send({ status: false, code: 'error', message: 'Malformed payload' }, 400);
    const S1 = parts[0], S2 = parts[1], S3A = parts[2];
    const all = (await db.prepare('SELECT * FROM mundo_keys WHERE panel_code=?').bind(panelCode).all().catch(() => ({ results: [] }))).results || [];
    let key = null, hwid = '';
    for (const k of all) { if (S1.startsWith(k.sdk_key)) { key = k; hwid = S1.slice(k.sdk_key.length); break; } }
    if (!key) return send({ status: false, code: 'error', message: 'Invalid SDK key' }, 403);
    let pkg = '', app = '';
    if (S2.endsWith(S1)) { const pre = S2.slice(0, -S1.length); if (pre.length % 2 === 0 && pre.slice(0, pre.length / 2) === pre.slice(pre.length / 2)) pkg = pre.slice(0, pre.length / 2); }
    if (S3A.endsWith(key.sdk_key)) { const pre = S3A.slice(0, -key.sdk_key.length); if (pre.length % 2 === 0 && pre.slice(0, pre.length / 2) === pre.slice(pre.length / 2)) app = pre.slice(0, pre.length / 2); }
    if (!pkg || !app) return send({ status: false, code: 'error', message: 'Malformed pkg/app' }, 400);
    const mst = await db.prepare('SELECT maintenance_mode,maintenance_message FROM sdk_server_status WHERE panel_code=? AND engine=?').bind(panelCode, 'MUNDO').first().catch(() => null);
    if (mst && (mst.maintenance_mode | 0) === 1) return send({ status: false, code: 'error', message: mst.maintenance_message || 'Server is under maintenance' }, 503);
    if ((key.is_blocked | 0) === 1) return send({ status: false, code: 'error', message: 'SDK key blocked' }, 403);
    if (Date.now() > tsMs(key.created_at) + (key.duration_days | 0) * 864e5) return send({ status: false, code: 'error', message: 'SDK key expired' }, 403);
    const binds = (await db.prepare('SELECT * FROM mundo_key_bindings WHERE sdk_key_id=?').bind(key.id).all().catch(() => ({ results: [] }))).results || [];
    const pkgs = [...new Set(binds.map(b => b.pkg_name))];
    if (!pkgs.includes(pkg) && pkgs.length >= (key.pkg_limit | 0)) return send({ status: false, code: 'error', message: 'Package limit reached' }, 403);
    let match = binds.find(b => b.pkg_name === pkg && b.app_name === app) || null;
    if (!match) {
      if (binds.length >= (key.pkg_limit | 0) * (key.app_limit | 0)) return send({ status: false, code: 'error', message: 'App limit reached' }, 403);
      if (binds.filter(b => b.pkg_name === pkg).length >= (key.app_limit | 0)) return send({ status: false, code: 'error', message: 'App limit reached' }, 403);
      await db.prepare('INSERT INTO mundo_key_bindings (sdk_key_id,pkg_name,app_name) VALUES (?,?,?)').bind(key.id, pkg, app).run();
      match = { is_blocked: 0 };
    }
    if ((match.is_blocked | 0) === 1) return send({ status: false, code: 'error', message: 'Binding blocked' }, 403);
    return send({ status: true, code: 'success', message: 'SDK key validated successfully', sdk_key: key.sdk_key, pkg_name: pkg, app_name: app, device_id: hwid, expires: new Date(tsMs(key.created_at) + (key.duration_days | 0) * 864e5).toISOString().slice(0, 19).replace('T', ' ') });
  } catch (e) { return send({ status: false, code: 'error', message: 'DB error' }, 500); }
}

// ================= BCORE API =================
async function handleBcore(request, db, panelCode) {
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
  const send = (obj, code = 200) => new Response(bcoreEncrypt(JSON.stringify(obj)), { status: code, headers: { 'Content-Type': 'text/plain; charset=UTF-8', 'Cache-Control': 'no-store', ...cors } });
  if (request.method.toUpperCase() !== 'POST') return send({ status: 'error', code: 'METHOD_NOT_ALLOWED', message: 'Only POST method allowed' }, 405);
  try {
    try { await db.prepare('INSERT OR IGNORE INTO panels (panel_code,is_active) VALUES (?,1)').bind(panelCode).run(); } catch {}
    const raw = (await request.text()).trim();
    if (!raw) return send({ status: 'error', code: 'EMPTY_BODY', message: 'Request body is empty' }, 400);
    const decStr = fixCesu8(bcoreDecrypt(raw)).toString('utf8');
    let input = null;
    try { const j = JSON.parse(decStr); if (j && typeof j === 'object') input = j; } catch {}
    if (!input) { try { input = Object.fromEntries(new URLSearchParams(decStr).entries()); } catch {} }
    if (!input || !input.sdk_key) return send({ status: 'error', code: 'DECRYPT_FAILED', message: 'Invalid encrypted payload' }, 400);
    const sdkKey = String(input.sdk_key || input.user_key || '').trim();
    const pkg = String(input.pkg_name || input.package_name || '').trim();
    const app = String(input.app_name || '').trim();
    const dev = String(input.device_id || '').trim();
    const mst = await db.prepare('SELECT maintenance_mode,maintenance_message FROM sdk_server_status WHERE panel_code=? AND engine=?').bind(panelCode, 'BCORE').first().catch(() => null);
    if (mst && (mst.maintenance_mode | 0) === 1) return send({ status: 'error', code: 'SERVER_MAINTENANCE', message: mst.maintenance_message || 'Server is under maintenance' }, 503);
    if (!sdkKey || !pkg || !app) return send({ status: 'error', code: 'MISSING_PARAMETER', message: 'Required parameter is missing' }, 400);
    const key = await db.prepare('SELECT * FROM bcore_keys WHERE sdk_key=? AND panel_code=? LIMIT 1').bind(sdkKey, panelCode).first().catch(() => null);
    if (!key) return send({ status: 'error', code: 'INVALID_KEY', message: 'Invalid SDK key' }, 400);
    if ((key.is_blocked | 0) === 1) return send({ status: 'error', code: 'INVALID_KEY', message: 'Invalid SDK key' }, 403);
    if (Date.now() > tsMs(key.created_at) + (key.duration_days | 0) * 864e5) return send({ status: 'error', code: 'EXPIRED_KEY', message: 'SDK key has expired' }, 403);
    const binds = (await db.prepare('SELECT * FROM bcore_key_bindings WHERE sdk_key_id=?').bind(key.id).all().catch(() => ({ results: [] }))).results || [];
    const pkgs = [...new Set(binds.map(b => b.pkg_name))];
    if (!pkgs.includes(pkg) && pkgs.length >= (key.pkg_limit | 0)) return send({ status: 'error', code: 'PKG_LIMIT_REACHED', message: 'Package limit reached' }, 403);
    let match = binds.find(b => b.pkg_name === pkg && b.app_name === app) || null;
    if (!match) {
      if (binds.length >= (key.pkg_limit | 0) * (key.app_limit | 0)) return send({ status: 'error', code: 'APP_LIMIT_REACHED', message: 'App name limit reached' }, 403);
      if (binds.filter(b => b.pkg_name === pkg).length >= (key.app_limit | 0)) return send({ status: 'error', code: 'APP_LIMIT_REACHED', message: 'App name limit reached' }, 403);
      await db.prepare('INSERT INTO bcore_key_bindings (sdk_key_id,pkg_name,app_name) VALUES (?,?,?)').bind(key.id, pkg, app).run();
      match = { is_blocked: 0 };
    }
    if ((match.is_blocked | 0) === 1) return send({ status: 'error', code: 'INVALID_KEY', message: 'This app binding is blocked' }, 403);
    const f1 = (key.feature1 | 0) === 1, f2 = (key.feature2 | 0) === 1;
    return send({ status: 'success', code: 'VALID', message: 'SDK key validated successfully', feature1: f1 ? 1 : 0, feature2: f2 ? 1 : 0, data: { sdk_key: 'valid', pkg_name: pkg, app_name: app, device_id: dev || 'registered', features1: f1, features2: f2 } });
  } catch (e) { return send({ status: 'error', code: 'DB_ERROR', message: 'Database query failed' }, 500); }
}
