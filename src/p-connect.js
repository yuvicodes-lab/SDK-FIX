import { createHash, createCipheriv, createDecipheriv } from 'node:crypto';

export const ARCX_LIBS = {
  PUBLIC: 'https://github.com/yuvicodes-lab/ONLINE-MOD/raw/refs/heads/main/lib_public.zip',
  PRIVATE: 'https://github.com/yuvicodes-lab/ONLINE-MOD/raw/refs/heads/main/libbgmi.zip',
  ADMIN: 'https://github.com/yuvicodes-lab/ONLINE-MOD/raw/refs/heads/main/lib_admin.zip',
  SAFE: 'https://github.com/yuvicodes-lab/ONLINE-MOD/raw/refs/heads/main/lib_safe.zip',
};
export const ARCX_VERSIONS = { PUBLIC: 'PUBLIC FREE', PRIVATE: 'PRIVATE PAID', ADMIN: 'ADMIN PRIVATE • PAID', SAFE: 'SAFE FREE' };

const md5 = s => createHash('md5').update(s).digest('hex');
const clean = (v, max = 255) => (typeof v === 'string' && v.trim() !== '' && v.trim().length <= max) ? v.trim() : '';

export function aes256CbcEnc(json, keyHex, ivHex) {
  const c = createCipheriv('aes-256-cbc', Buffer.from(keyHex, 'hex'), Buffer.from(ivHex, 'hex'));
  return Buffer.concat([c.update(json, 'utf8'), c.final()]).toString('base64');
}

async function loadSettings(db, panel) {
  const r = await db.prepare('SELECT setting_name,setting_value FROM mod_settings WHERE panel_code=?').bind(panel).all().catch(() => ({ results: [] }));
  const m = {};
  for (const row of r.results || []) m[row.setting_name] = row.setting_value;
  return m;
}

async function libOverride(db, panel, serverType) {
  try {
    const r = await db.prepare('SELECT file_path FROM loader_files WHERE panel_code=? AND server_type=? ORDER BY uploaded_at DESC LIMIT 1').bind(panel, serverType).first().catch(() => null);
    const fp = r && r.file_path ? String(r.file_path) : '';
    if (/^https?:\/\//i.test(fp)) return fp;
  } catch {}
  return null;
}

async function verifyKey(db, panel, userKey, serial) {
  const key = await db.prepare('SELECT * FROM api_keys WHERE key_value=? AND panel_code=? AND is_active=1 LIMIT 1').bind(userKey, panel).first().catch(() => null);
  if (!key) return { err: 'USER OR GAME NOT REGISTERED', code: 403 };
  if ((key.is_blocked | 0) === 1) return { err: 'USER BLOCKED', code: 403 };
  if (key.expires_at && Date.parse(String(key.expires_at).replace(' ', 'T') + 'Z') < Date.now()) return { err: 'EXPIRED KEY', code: 403 };
  // device gate
  const devs = (await db.prepare('SELECT device_uuid FROM key_devices WHERE key_id=?').bind(key.id).all().catch(() => ({ results: [] }))).results.map(d => d.device_uuid);
  if (!devs.includes(serial)) {
    if (devs.length >= Math.max(0, key.device_limit | 0)) return { err: 'MAX DEVICE REACHED', code: 403 };
    await db.prepare('INSERT INTO key_devices (key_id,device_uuid,panel_code) VALUES (?,?,?)').bind(key.id, serial, panel).run();
  } else {
    await db.prepare("UPDATE key_devices SET last_seen=datetime('now') WHERE key_id=? AND device_uuid=?").bind(key.id, serial).run();
  }
  let expiry = key.expires_at;
  if (!expiry) {
    const dur = String(key.duration || '').toUpperCase().trim();
    const m = dur.match(/^(\d+)([DH])$/);
    if (!m) return { err: 'INVALID KEY DURATION', code: 500 };
    const ms = m[2] === 'D' ? (+m[1]) * 864e5 : (+m[1]) * 36e5;
    expiry = new Date(Date.now() + ms).toISOString().slice(0, 19).replace('T', ' ');
    await db.prepare('UPDATE api_keys SET expires_at=?,uses=uses+1 WHERE id=?').bind(expiry, key.id).run();
  } else {
    await db.prepare('UPDATE api_keys SET uses=uses+1 WHERE id=?').bind(key.id).run();
  }
  return { key, expiry };
}

export async function handleConnect(request, db, panel) {
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
  const J = (obj, code = 200) => new Response(JSON.stringify(obj), { status: code, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...cors } });
  if (request.method.toUpperCase() !== 'POST') return J({ status: false, reason: 'METHOD NOT ALLOWED' }, 405);
  panel = clean(panel, 20);
  if (!panel) return J({ status: false, reason: 'PANEL CODE MISSING' }, 400);
  let fd;
  try { fd = await request.formData(); } catch { return J({ status: false, reason: 'INVALID PARAMETER' }, 400); }
  const game = clean(fd.get('game'), 50), userKey = clean(fd.get('user_key'), 50), serial = clean(fd.get('serial'), 100);
  if (!game || !userKey || !serial || game !== 'PUBG') return J({ status: false, reason: game !== 'PUBG' && game ? 'USER OR GAME NOT REGISTERED' : 'INVALID PARAMETER' }, game && game !== 'PUBG' ? 403 : 400);
  try {
    const prow = await db.prepare('SELECT is_active FROM panels WHERE panel_code=?').bind(panel).first().catch(() => null);
    if (!prow || (prow.is_active | 0) !== 1) return J({ status: false, reason: 'USER OR GAME NOT REGISTERED' }, 403);
    const mnt = await db.prepare('SELECT is_active,reason FROM mod_maintenance WHERE panel_code=?').bind(panel).first().catch(() => null);
    if (mnt && (mnt.is_active | 0) === 1) return J({ status: false, reason: clean(mnt.reason, 255) || 'SERVER UNDER MAINTENANCE' }, 503);
    const v = await verifyKey(db, panel, userKey, serial);
    if (v.err) return J({ status: false, reason: v.err }, v.code);
    const s = await loadSettings(db, panel);
    const get = (k, d) => (k in s && s[k] != null ? String(s[k]) : d);
    const real = 'PUBG-' + userKey + '-' + serial + '-' + 'Vm8Lk7Uj2JmsjCPVPVjrLa7zgfx3uz9E';
    const token = md5(real), enc = md5(token + 'VIPENC');
    let st = String(v.key.server_type || 'PRIVATE').toUpperCase();
    if (!['ADMIN', 'SAFE', 'PRIVATE', 'PUBLIC'].includes(st)) st = 'PRIVATE';
    const lib = (await libOverride(db, panel, st)) || ARCX_LIBS[st];
    return J({
      status: true, data: {
        real, token, Enc: enc, EXP: v.expiry, rng: Math.floor(Date.now() / 1000),
        server_type: st, key_mode: st, mode: st === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE',
        version: ARCX_VERSIONS[st], version_label: ARCX_VERSIONS[st], plan: (st === 'PUBLIC' || st === 'SAFE') ? 'FREE' : 'PAID',
        lib_url: lib, lib, modname: get('modname', 'YUVI MOD'), mod_status: get('mod_status', 'Online'), credit: get('credit', 'Yuvi Panel'),
        ESP: get('ESP', 'on'), Item: get('Item', 'on'), AIM: get('AIM', 'on'), SilentAim: get('SilentAim', 'on'), BulletTrack: get('BulletTrack', 'on'),
        Floating: get('Floating', 'on'), Memory: get('Memory', 'on'), Setting: get('Setting', 'on'),
        exdate: v.expiry, device: String(v.key.device_limit | 0),
      }
    });
  } catch (e) { return J({ status: false, reason: 'SERVER ERROR' }, 500); }
}

export async function handleEncrypt(request, db, panel) {
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
  const J = (obj, code = 200) => new Response(JSON.stringify(obj), { status: code, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...cors } });
  if (request.method.toUpperCase() !== 'POST') return J({ status: false, reason: 'METHOD NOT ALLOWED' }, 405);
  panel = clean(panel, 20);
  if (!panel) return J({ status: false, reason: 'PANEL CODE MISSING' }, 400);
  let fd;
  try { fd = await request.formData(); } catch { return J({ status: false, reason: 'INVALID PARAMETER' }, 400); }
  const game = clean(fd.get('game'), 50), userKey = clean(fd.get('user_key'), 50), serial = clean(fd.get('serial'), 100);
  if (!game || !userKey || !serial || game !== 'PUBG') return J({ status: false, reason: 'INVALID PARAMETER' }, 400);
  try {
    const prow = await db.prepare('SELECT is_active FROM panels WHERE panel_code=?').bind(panel).first().catch(() => null);
    if (!prow || (prow.is_active | 0) !== 1) return J({ status: false, reason: 'USER OR GAME NOT REGISTERED' }, 403);
    // panel expiry via panel owner
    const owner = await db.prepare("SELECT panel_expiry FROM users WHERE panel_code=? AND role='OWNER' ORDER BY id ASC LIMIT 1").bind(panel).first().catch(() => null);
    if (!owner || !owner.panel_expiry || Date.parse(String(owner.panel_expiry).replace(' ', 'T') + 'Z') < Date.now()) return J({ status: false, reason: 'PANEL NOT ACTIVATED' }, 403);
    const s = await loadSettings(db, panel);
    if (!s.aes_key || !s.aes_iv) return J({ status: false, reason: 'ENCRYPTION NOT CONFIGURED' }, 500);
    const mnt = await db.prepare('SELECT is_active,reason FROM mod_maintenance WHERE panel_code=?').bind(panel).first().catch(() => null);
    if (mnt && (mnt.is_active | 0) === 1) return J({ status: false, reason: clean(mnt.reason, 255) || 'SERVER UNDER MAINTENANCE' }, 503);
    const v = await verifyKey(db, panel, userKey, serial);
    if (v.err) return J({ status: false, reason: v.err }, v.code);
    const get = (k, d) => (k in s && s[k] != null ? String(s[k]) : d);
    const real = 'PUBG-' + userKey + '-' + serial + '-' + 'Vm8Lk7Uj2JmsjCPVPVjrLa7zgfx3uz9E';
    const inner = {
      status: true, data: {
        real, token: md5(real), Enc: md5(md5(real) + 'VIPENC'), EXP: v.expiry, rng: Math.floor(Date.now() / 1000),
        server_type: String(v.key.server_type || 'PRIVATE').toUpperCase(), modname: get('modname', 'YUVI MOD'), mod_status: get('mod_status', 'Online'), credit: get('credit', 'Yuvi Panel'),
        ESP: get('ESP', 'on'), Item: get('Item', 'on'), AIM: get('AIM', 'on'), SilentAim: get('SilentAim', 'on'), BulletTrack: get('BulletTrack', 'on'),
        Floating: get('Floating', 'on'), Memory: get('Memory', 'on'), Setting: get('Setting', 'on'), exdate: v.expiry, device: String(v.key.device_limit | 0),
      }
    };
    return J({ status: true, payload: aes256CbcEnc(JSON.stringify(inner), s.aes_key, s.aes_iv) });
  } catch (e) { return J({ status: false, reason: 'SERVER ERROR' }, 500); }
}
