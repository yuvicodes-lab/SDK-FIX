import { BCORE_SECRET, MUNDO_SALT, rc4, bcoreEncrypt, bcoreDecrypt, fixCesu8, mundoAesKey, aesEncryptRaw, aesDecryptRaw, mundoAesKeyHex, hashPassword, verifyPassword, randomHexKey } from './crypto.js';
import { layout, authPage, esc } from './ui.js';
import { dashboardPage, generatePage } from './pages-dash.js';
import { keysPage } from './pages-keys.js';
import { serverPage, hashPage } from './pages-server.js';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'OWNER', panel_code TEXT NOT NULL DEFAULT 'YUVI_001', created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS panels (panel_code TEXT PRIMARY KEY, is_active INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS mundo_keys (id INTEGER PRIMARY KEY AUTOINCREMENT, panel_code TEXT NOT NULL DEFAULT 'YUVI_001', sdk_key TEXT NOT NULL UNIQUE, duration_days INTEGER NOT NULL DEFAULT 30, pkg_limit INTEGER NOT NULL DEFAULT 1, app_limit INTEGER NOT NULL DEFAULT 1, feature1 INTEGER NOT NULL DEFAULT 0, feature2 INTEGER NOT NULL DEFAULT 0, is_blocked INTEGER NOT NULL DEFAULT 0, created_by INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE INDEX IF NOT EXISTS idx_mundo_panel ON mundo_keys(panel_code);
CREATE TABLE IF NOT EXISTS mundo_key_bindings (id INTEGER PRIMARY KEY AUTOINCREMENT, sdk_key_id INTEGER NOT NULL, pkg_name TEXT NOT NULL, app_name TEXT NOT NULL, is_blocked INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS bcore_keys (id INTEGER PRIMARY KEY AUTOINCREMENT, panel_code TEXT NOT NULL DEFAULT 'YUVI_001', sdk_key TEXT NOT NULL UNIQUE, duration_days INTEGER NOT NULL DEFAULT 30, pkg_limit INTEGER NOT NULL DEFAULT 1, app_limit INTEGER NOT NULL DEFAULT 1, feature1 INTEGER NOT NULL DEFAULT 0, feature2 INTEGER NOT NULL DEFAULT 0, is_blocked INTEGER NOT NULL DEFAULT 0, created_by INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE INDEX IF NOT EXISTS idx_bcore_panel ON bcore_keys(panel_code);
CREATE TABLE IF NOT EXISTS bcore_key_bindings (id INTEGER PRIMARY KEY AUTOINCREMENT, sdk_key_id INTEGER NOT NULL, pkg_name TEXT NOT NULL, app_name TEXT NOT NULL, is_blocked INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS sdk_hash_vault (id INTEGER PRIMARY KEY AUTOINCREMENT, panel_code TEXT NOT NULL DEFAULT 'YUVI_001', engine TEXT NOT NULL DEFAULT 'MUNDO', hash_type TEXT NOT NULL DEFAULT 'lib_signature', hash_label TEXT NOT NULL, hash_value TEXT NOT NULL, is_active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS sdk_server_status (id INTEGER PRIMARY KEY AUTOINCREMENT, panel_code TEXT NOT NULL DEFAULT 'YUVI_001', engine TEXT NOT NULL, maintenance_mode INTEGER NOT NULL DEFAULT 0, maintenance_message TEXT, updated_at TEXT NOT NULL DEFAULT (datetime('now')), UNIQUE(panel_code, engine));
CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id INTEGER NOT NULL, expires_at INTEGER NOT NULL);
`;

async function ensureDB(db, panelCode) {
  await db.exec(SCHEMA);
  try { await db.prepare('INSERT OR IGNORE INTO panels (panel_code, is_active) VALUES (?,1)').bind(panelCode).run(); } catch {}
}

function html(data, status = 200) {
  return new Response(data, { status, headers: { 'Content-Type': 'text/html; charset=UTF-8', 'Cache-Control': 'no-store' } });
}
function redir(path, cookie) {
  const h = { Location: path };
  if (cookie) h['Set-Cookie'] = cookie;
  return new Response(null, { status: 302, headers: h });
}
function parseCookies(req) {
  const m = {};
  (req.headers.get('Cookie') || '').split(';').forEach(p => {
    const i = p.indexOf('='); if (i > 0) m[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return m;
}
async function getSession(db, req) {
  const t = parseCookies(req)['sdk_session'];
  if (!t) return null;
  const row = await db.prepare('SELECT s.expires_at, u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=?').bind(t).first();
  if (!row) return null;
  if ((row.expires_at || 0) < Date.now()) { try { await db.prepare('DELETE FROM sessions WHERE token=?').bind(t).run(); } catch {} return null; }
  return row;
}
function sessCookie(token) {
  return 'sdk_session=' + encodeURIComponent(token) + '; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax';
}
function clearCookie() { return 'sdk_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax'; }
function tsMs(s) { const t = Date.parse(String(s || '').replace(' ', 'T') + 'Z'); return isNaN(t) ? 0 : t; }
function isExpired(row) { return Date.now() > tsMs(row.created_at) + (row.duration_days | 0) * 86400000; }

async function formParams(req) {
  try {
    const ct = req.headers.get('Content-Type') || '';
    if (ct.includes('form') || ct.includes('multipart')) { const fd = await req.formData(); return Object.fromEntries(fd.entries()); }
    if (ct.includes('json')) return await req.json();
  } catch {}
  return {};
}

export default {
  async fetch(request, env, ctx) {
    const db = env.DB;
    const panelCode = env.PANEL_CODE || 'YUVI_001';
    const panelName = env.PANEL_NAME || 'SDK PANEL';
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    const method = request.method.toUpperCase();

    await ensureDB(db, panelCode);

    // ---- CORS preflight for APIs ----
    if (method === 'OPTIONS' && (path.startsWith('/sdk/mundo') || path.startsWith('/sdk/bcore'))) {
      return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
    }
    // ---- SDK APIs (no login) ----
    if (path.startsWith('/sdk/mundo/') || path === '/sdk/mundo') {
      const pc = decodeURIComponent(path.split('/')[3] || url.searchParams.get('panel_code') || panelCode);
      return handleMundo(request, db, pc);
    }
    if (path.startsWith('/sdk/bcore/') || path === '/sdk/bcore') {
      const pc = decodeURIComponent(path.split('/')[3] || url.searchParams.get('panel_code') || panelCode);
      return handleBcore(request, db, pc);
    }

    const users = await db.prepare('SELECT COUNT(*) c FROM users').first().catch(() => ({ c: 1 }));
    if ((users?.c || 0) === 0 && path !== '/setup') return redir('/setup');

    // ---- setup ----
    if (path === '/setup') {
      if ((users?.c || 0) > 0) return redir('/login');
      if (method === 'POST') {
        const p = await formParams(request);
        const u = String(p.username || '').trim(), pw = String(p.password || '');
        if (u.length < 3 || pw.length < 4) return html(authPage({ mode: 'setup', error: 'Username min 3, password min 4.', panelName }));
        const row = await db.prepare('SELECT id FROM users WHERE username=?').bind(u).first().catch(() => null);
        if (row) return html(authPage({ mode: 'setup', error: 'Username already hai.', panelName }));
        const ph = await hashPassword(pw);
        const r = await db.prepare('INSERT INTO users (username,password_hash,role,panel_code) VALUES (?,?,?,?)').bind(u, ph, 'OWNER', panelCode).run();
        const token = crypto.randomUUID();
        await db.prepare('INSERT INTO sessions (token,user_id,expires_at) VALUES (?,?,?)').bind(token, r.meta.last_row_id, Date.now() + 6048e5).run();
        return redir('/', sessCookie(token));
      }
      return html(authPage({ mode: 'setup', panelName }));
    }

    // ---- login ----
    if (path === '/login') {
      if (method === 'POST') {
        const p = await formParams(request);
        const u = String(p.username || '').trim(), pw = String(p.password || '');
        const row = await db.prepare('SELECT * FROM users WHERE username=?').bind(u).first();
        if (!row || !(await verifyPassword(pw, row.password_hash))) return html(authPage({ mode: 'login', error: 'Invalid username or password.', panelName }));
        const token = crypto.randomUUID();
        await db.prepare('INSERT INTO sessions (token,user_id,expires_at) VALUES (?,?,?)').bind(token, row.id, Date.now() + 6048e5).run();
        return redir('/', sessCookie(token));
      }
      return html(authPage({ mode: 'login', msg: url.searchParams.get('msg') || '', panelName }));
    }
    if (path === '/logout') {
      const t = parseCookies(request)['sdk_session'];
      if (t) await db.prepare('DELETE FROM sessions WHERE token=?').bind(t).run().catch(() => {});
      return redir('/login', clearCookie());
    }

    const sess = await getSession(db, request);
    if (!sess) return redir('/login');
    const myPanel = sess.panel_code || panelCode;
    const L = (route, title, content) => html(layout({ title, route, username: sess.username, panelCode: myPanel, panelName, content }));

    // ---- dashboard ----
    if (path === '/' || path === '/sdk') {
      const q = async (sql, ...b) => (await db.prepare(sql).bind(...b).first().catch(() => ({})));
      const mTotal = (await q('SELECT COUNT(*) c FROM mundo_keys WHERE panel_code=?', myPanel)).c || 0;
      const mActive = (await q('SELECT COUNT(*) c FROM mundo_keys WHERE panel_code=? AND is_blocked=0', myPanel)).c || 0;
      const mBlocked = (await q('SELECT COUNT(*) c FROM mundo_keys WHERE panel_code=? AND is_blocked=1', myPanel)).c || 0;
      const mPkgs = (await q('SELECT COUNT(*) c FROM mundo_key_bindings b JOIN mundo_keys k ON b.sdk_key_id=k.id WHERE k.panel_code=?', myPanel)).c || 0;
      const bTotal = (await q('SELECT COUNT(*) c FROM bcore_keys WHERE panel_code=?', myPanel)).c || 0;
      const bActive = (await q('SELECT COUNT(*) c FROM bcore_keys WHERE panel_code=? AND is_blocked=0', myPanel)).c || 0;
      const bBlocked = (await q('SELECT COUNT(*) c FROM bcore_keys WHERE panel_code=? AND is_blocked=1', myPanel)).c || 0;
      const bPkgs = (await q('SELECT COUNT(*) c FROM bcore_key_bindings b JOIN bcore_keys k ON b.sdk_key_id=k.id WHERE k.panel_code=?', myPanel)).c || 0;
      const recentM = (await db.prepare('SELECT * FROM mundo_keys WHERE panel_code=? ORDER BY id DESC LIMIT 5').bind(myPanel).all().catch(() => ({ results: [] }))).results || [];
      const recentB = (await db.prepare('SELECT * FROM bcore_keys WHERE panel_code=? ORDER BY id DESC LIMIT 5').bind(myPanel).all().catch(() => ({ results: [] }))).results || [];
      return L('/', 'Dashboard', dashboardPage({ mTotal, mActive, mBlocked, mPkgs, bTotal, bActive, bBlocked, bPkgs, recentM, recentB }));
    }

    // ---- generate ----
    if (path === '/sdk/generate') {
      let success = '', error = '';
      if (method === 'POST') {
        const p = await formParams(request);
        const engine = p.engine === 'BCORE' ? 'BCORE' : 'MUNDO';
        let customKey = String(p.sdk_key || '').trim();
        const duration = parseInt(p.duration, 10);
        const pkg = Math.max(1, parseInt(p.pkg_limit, 10) || 1);
        const app = Math.max(1, parseInt(p.app_limit, 10) || 1);
        const f1 = p.feature1 != null ? 1 : 0, f2 = p.feature2 != null ? 1 : 0;
        const table = engine === 'BCORE' ? 'bcore_keys' : 'mundo_keys';
        if (customKey !== '' && customKey.length < 5) error = 'Custom key must be at least 5 characters.';
        else if (![7, 15, 30, 60].includes(duration)) error = 'Invalid duration.';
        else if (pkg > 10 || app > 20) error = 'Limits too high.';
        else {
          if (!customKey) customKey = randomHexKey();
          const dup = await db.prepare('SELECT id FROM ' + table + ' WHERE sdk_key=?').bind(customKey).first().catch(() => null);
          if (dup) error = 'This SDK key already exists in ' + engine + '. Try another.';
          else {
            try {
              await db.prepare('INSERT INTO ' + table + ' (panel_code,sdk_key,duration_days,pkg_limit,app_limit,feature1,feature2,created_by) VALUES (?,?,?,?,?,?,?,?)').bind(myPanel, customKey, duration, pkg, app, f1, f2, sess.id).run();
              return redir('/sdk/generate?ok=1&e=' + encodeURIComponent(engine) + '&k=' + encodeURIComponent(customKey));
            } catch (e) { error = String(e && e.message || '').includes('UNIQUE') ? 'This SDK key already exists in ' + engine + '.' : 'Database error.'; }
          }
        }
      } else if (url.searchParams.get('ok') === '1' && url.searchParams.get('k')) {
        success = 'SDK Key Generated! Engine: ' + url.searchParams.get('e') + ' | Key: ' + url.searchParams.get('k');
      }
      return L('/sdk/generate', 'Generate SDK', generatePage({ success, error }));
    }

    // ---- keys ----
    if (path === '/sdk/keys') {
      if (method === 'POST') {
        const p = await formParams(request);
        const engine = p.engine === 'BCORE' ? 'BCORE' : 'MUNDO';
        const keyTable = engine === 'BCORE' ? 'bcore_keys' : 'mundo_keys';
        const bindTable = engine === 'BCORE' ? 'bcore_key_bindings' : 'mundo_key_bindings';
        const keyId = parseInt(p.key_id, 10) || 0, bindId = parseInt(p.bind_id, 10) || 0;
        const own = keyId ? await db.prepare('SELECT id,pkg_limit,app_limit FROM ' + keyTable + ' WHERE id=? AND panel_code=?').bind(keyId, myPanel).first().catch(() => null) : null;
        if (own) {
          const a = p.action;
          if (a === 'block_key') await db.prepare('UPDATE ' + keyTable + ' SET is_blocked=1 WHERE id=?').bind(keyId).run();
          else if (a === 'unblock_key') await db.prepare('UPDATE ' + keyTable + ' SET is_blocked=0 WHERE id=?').bind(keyId).run();
          else if (a === 'delete_key') await db.prepare('DELETE FROM ' + keyTable + ' WHERE id=?').bind(keyId).run();
          else if (a === 'block_bind' && bindId) await db.prepare('UPDATE ' + bindTable + ' SET is_blocked=1 WHERE id=? AND sdk_key_id=?').bind(bindId, keyId).run();
          else if (a === 'unblock_bind' && bindId) await db.prepare('UPDATE ' + bindTable + ' SET is_blocked=0 WHERE id=? AND sdk_key_id=?').bind(bindId, keyId).run();
          else if (a === 'delete_bind' && bindId) await db.prepare('DELETE FROM ' + bindTable + ' WHERE id=? AND sdk_key_id=?').bind(bindId, keyId).run();
          else if (a === 'save_bind' && bindId) {
            const pkgN = String(p.pkg_name || '').trim(), appN = String(p.app_name || '').trim();
            if (pkgN && appN) await db.prepare('UPDATE ' + bindTable + ' SET pkg_name=?,app_name=? WHERE id=? AND sdk_key_id=?').bind(pkgN, appN, bindId, keyId).run();
          } else if (a === 'add_bind') {
            const pkgN = String(p.pkg_name || '').trim(), appN = String(p.app_name || '').trim();
            if (pkgN && appN) {
              const c = await db.prepare('SELECT COUNT(*) c FROM ' + bindTable + ' WHERE sdk_key_id=?').bind(keyId).first().catch(() => ({ c: 99 }));
              if ((c?.c || 0) < own.pkg_limit * own.app_limit) await db.prepare('INSERT INTO ' + bindTable + ' (sdk_key_id,pkg_name,app_name) VALUES (?,?,?)').bind(keyId, pkgN, appN).run();
            }
          }
        }
        return redir('/sdk/keys');
      }
      async function fetchKeys(kt, bt) {
        const r = await db.prepare('SELECT * FROM ' + kt + ' WHERE panel_code=? ORDER BY id DESC').bind(myPanel).all().catch(() => ({ results: [] }));
        const keys = r.results || [];
        for (const k of keys) {
          const b = await db.prepare('SELECT * FROM ' + bt + ' WHERE sdk_key_id=? ORDER BY id DESC').bind(k.id).all().catch(() => ({ results: [] }));
          k.bindings = b.results || [];
        }
        return keys;
      }
      return L('/sdk/keys', 'SDK Keys', keysPage(await fetchKeys('mundo_keys', 'mundo_key_bindings'), await fetchKeys('bcore_keys', 'bcore_key_bindings')));
    }

    // ---- server ----
    if (path === '/sdk/server') {
      if (method === 'POST') {
        const p = await formParams(request);
        if (p.toggle_maintenance) {
          const engine = p.engine === 'BCORE' ? 'BCORE' : 'MUNDO';
          const mode = String(p.maintenance_mode) === '1' ? 1 : 0;
          const msg = String(p.maintenance_message || '').slice(0, 255);
          await db.prepare('INSERT INTO sdk_server_status (panel_code,engine,maintenance_mode,maintenance_message) VALUES (?,?,?,?) ON CONFLICT(panel_code,engine) DO UPDATE SET maintenance_mode=excluded.maintenance_mode, maintenance_message=excluded.maintenance_message').bind(myPanel, engine, mode, msg).run();
          return redir('/sdk/server?toggled=' + engine.toLowerCase());
        }
      }
      const rows = (await db.prepare('SELECT engine,maintenance_mode,maintenance_message FROM sdk_server_status WHERE panel_code=?').bind(myPanel).all().catch(() => ({ results: [] }))).results || [];
      let mMaint = 0, mMsg = '', bMaint = 0, bMsg = '';
      for (const r of rows) { if (r.engine === 'MUNDO') { mMaint = r.maintenance_mode | 0; mMsg = r.maintenance_message || ''; } if (r.engine === 'BCORE') { bMaint = r.maintenance_mode | 0; bMsg = r.maintenance_message || ''; } }
      return L('/sdk/server', 'Server', serverPage({ mMaint, mMsg, bMaint, bMsg, host: url.host, panel: myPanel, toggled: url.searchParams.get('toggled') || '' }));
    }

    // ---- hash ----
    if (path === '/sdk/hash') {
      if (method === 'POST') {
        const p = await formParams(request);
        const engine = p.engine === 'BCORE' ? 'BCORE' : 'MUNDO';
        if (p.action === 'add_hash') {
          const label = String(p.hash_label || '').trim().slice(0, 100);
          const value = String(p.hash_value || '').trim().toLowerCase();
          if (label && /^[a-f0-9]{64}$/.test(value)) await db.prepare('INSERT INTO sdk_hash_vault (panel_code,engine,hash_type,hash_label,hash_value) VALUES (?,?,?,?,?)').bind(myPanel, engine, 'lib_signature', label, value).run();
        } else if (p.action === 'delete_hash') await db.prepare('DELETE FROM sdk_hash_vault WHERE id=? AND panel_code=?').bind(parseInt(p.hash_id, 10) || 0, myPanel).run();
        else if (p.action === 'toggle_hash') await db.prepare('UPDATE sdk_hash_vault SET is_active=1-is_active WHERE id=? AND panel_code=?').bind(parseInt(p.hash_id, 10) || 0, myPanel).run();
        return redir('/sdk/hash');
      }
      const mR = await db.prepare('SELECT * FROM sdk_hash_vault WHERE panel_code=? AND engine=? ORDER BY id DESC').bind(myPanel, 'MUNDO').all().catch(() => ({ results: [] }));
      const bR = await db.prepare('SELECT * FROM sdk_hash_vault WHERE panel_code=? AND engine=? ORDER BY id DESC').bind(myPanel, 'BCORE').all().catch(() => ({ results: [] }));
      const mHashes = mR.results || [], bHashes = bR.results || [];
      return L('/sdk/hash', 'Hash', hashPage({ mHashes, bHashes, mActive: mHashes.find(h => h.is_active) || null, bActive: bHashes.find(h => h.is_active) || null, salt: MUNDO_SALT, aesHex: mundoAesKeyHex(MUNDO_SALT) }));
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
    if (isExpiredLocal(key)) return send({ status: false, code: 'error', message: 'SDK key expired' }, 403);
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
function isExpiredLocal(row) { const t = Date.parse(String(row.created_at || '').replace(' ', 'T') + 'Z'); return Date.now() > (isNaN(t) ? 0 : t) + (row.duration_days | 0) * 864e5; }
function tsMs(s) { const t = Date.parse(String(s || '').replace(' ', 'T') + 'Z'); return isNaN(t) ? Date.now() : t; }

// ================= BCORE API =================
async function handleBcore(request, db, panelCode) {
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
  const send = (obj, code = 200) => new Response(bcoreEncrypt(JSON.stringify(obj)), { status: code, headers: { 'Content-Type': 'text/plain; charset=UTF-8', 'Cache-Control': 'no-store', ...cors } });
  if (request.method.toUpperCase() !== 'POST') return send({ status: 'error', code: 'METHOD_NOT_ALLOWED', message: 'Only POST method allowed' }, 405);
  try {
    const prow = await db.prepare('SELECT panel_code FROM panels WHERE panel_code=?').bind(panelCode).first().catch(() => null);
    if (!prow) { /* allow first-run: auto create */ try { await db.prepare('INSERT OR IGNORE INTO panels (panel_code,is_active) VALUES (?,1)').bind(panelCode).run(); } catch {} }
    const raw = (await request.text()).trim();
    if (!raw) return send({ status: 'error', code: 'EMPTY_BODY', message: 'Request body is empty' }, 400);
    let decBuf = fixCesu8(bcoreDecrypt(raw));
    let decStr = decBuf.toString('utf8');
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
    if (isExpiredLocal(key)) return send({ status: 'error', code: 'EXPIRED_KEY', message: 'SDK key has expired' }, 403);
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
