import { esc } from './ui.js';
import { pageHead, alertBox } from './panel-ui.js';

const MOD_FIELDS = ['modname', 'mod_status', 'credit', 'license_key', 'ESP', 'Item', 'AIM', 'SilentAim', 'BulletTrack', 'Floating', 'Memory', 'Setting'];
export { MOD_FIELDS };

export function serverPage(settings, maint, o) {
  const msg = o.ok ? alertBox('ok', 'Saved', esc(o.ok)) : '';
  const g = (k, label) => '<div><label class="block text-xs font-extrabold text-slate-500 uppercase mb-2">' + label + '</label><input type="text" name="' + k + '" value="' + esc(settings[k] || '') + '" class="w-full clay-card px-4 py-2.5 text-sm rounded-2xl"></div>';
  const t = (k, label) => '<label class="feature-card ' + ((settings[k] || 'on') === 'on' ? 'checked' : '') + '"><input type="checkbox" name="' + k + '" ' + ((settings[k] || 'on') === 'on' ? 'checked' : '') + ' onchange="this.closest(\'.feature-card\').classList.toggle(\'checked\',this.checked)"><span class="text-sm font-bold">' + label + '</span></label>';
  return pageHead('Server & Mod', 'bi-hdd-fill', 'Maintenance + mod config') + msg
    + '<form method="POST" class="glass-card p-5 mb-5"><h3 class="font-black mb-3">Maintenance</h3><label class="feature-card ' + (maint.on ? 'checked' : '') + ' mb-3"><input type="checkbox" name="maintenance_mode" ' + (maint.on ? 'checked' : '') + ' onchange="this.closest(\'.feature-card\').classList.toggle(\'checked\',this.checked)"><span class="text-sm font-bold">Maintenance ON (clients blocked)</span></label><input type="text" name="maintenance_reason" value="' + esc(maint.reason || '') + '" placeholder="Reason" class="w-full clay-card px-4 py-2.5 text-sm rounded-2xl mb-3">'
    + '<div class="grid grid-cols-1 md:grid-cols-2 gap-3">' + g('modname', 'Mod Name') + g('mod_status', 'Mod Status') + g('credit', 'Credit') + g('license_key', 'License Key') + '</div>'
    + '<div class="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">' + ['ESP', 'Item', 'AIM', 'SilentAim', 'BulletTrack', 'Floating', 'Memory', 'Setting'].map(k => t(k, k)).join('') + '</div>'
    + '<button class="btn-premium w-full py-3.5 rounded-2xl font-extrabold text-sm uppercase mt-4">Save Server Config</button></form>';
}

export function settingsPage(sess, o, urls) {
  const isOwner = sess.role === 'OWNER';
  const msg = o.ok ? alertBox('ok', 'Done', esc(o.ok)) : o.error ? alertBox('err', 'Error', esc(o.error)) : '';
  return pageHead('Settings', 'bi-gear-fill', 'Account + panel') + msg
    + '<div class="glass-card p-5 mb-4"><h3 class="font-black mb-2">API URLs</h3><div class="space-y-2 text-xs font-mono break-all"><div class="clay-card p-3 rounded-2xl">CONNECT: ' + esc(urls.connect) + '</div><div class="clay-card p-3 rounded-2xl">ENCRYPT: ' + esc(urls.encrypt) + '</div></div></div>'
    + '<form method="POST" class="glass-card p-5 mb-4"><input type="hidden" name="action" value="update_password"><h3 class="font-black mb-3">Change Password</h3><div class="grid md:grid-cols-2 gap-3"><input type="password" name="current_password" required placeholder="Current" class="clay-card px-4 py-2.5 text-sm rounded-2xl"><input type="password" name="new_password" required placeholder="New (min 4)" class="clay-card px-4 py-2.5 text-sm rounded-2xl"></div><button class="btn-premium w-full py-3 rounded-xl text-xs font-bold mt-3">Update Password</button></form>'
    + (isOwner ? '<form method="POST" class="glass-card p-5"><input type="hidden" name="action" value="update_branding"><h3 class="font-black mb-3">Panel Branding</h3><input type="text" name="panel_name" value="' + esc(o.panelName || '') + '" class="w-full clay-card px-4 py-2.5 text-sm rounded-2xl"><button class="btn-premium w-full py-3 rounded-xl text-xs font-bold mt-3">Save Name</button></form>' : '');
}

export function aesPage(o, isMain) {
  const msg = o.ok ? alertBox('ok', 'Done', '<code class="font-mono">' + esc(o.ok) + '</code>') : o.error ? alertBox('err', 'Error', esc(o.error)) : '';
  const keys = (o.recent || []).map(k => '<div class="clay-card p-3 rounded-2xl text-xs"><code class="font-mono font-bold">' + esc(k.activation_key) + '</code><p class="text-slate-500">' + esc(k.name || '') + ' • ' + k.duration_months + 'm • ' + (k.is_used ? 'USED' : 'FRESH') + '</p></div>').join('');
  return pageHead('API Encryption', 'bi-shield-shaded', 'AES + activation keys') + msg
    + '<div class="glass-card p-5 mb-4 text-xs">AES Key: <code class="font-mono">' + esc(o.aesKey || 'not set') + '</code><br>AES IV: <code class="font-mono">' + esc(o.aesIv || 'not set') + '</code><br>Panel Expiry: ' + esc(o.expiry || '-') + '</div>'
    + (isMain ? '<form method="POST" class="glass-card p-5 mb-4"><input type="hidden" name="action" value="generate_aes"><button class="btn-premium w-full py-3 rounded-xl text-xs font-bold">Generate / Rotate AES</button></form>'
    + '<form method="POST" class="glass-card p-5 mb-4"><input type="hidden" name="action" value="generate_activation"><h3 class="font-black mb-2">New Activation Key</h3><div class="grid grid-cols-2 gap-2"><input type="number" name="duration" value="1" min="1" max="120" class="clay-card px-3 py-2 text-sm rounded-xl"><input type="text" name="key_name" placeholder="Name" class="clay-card px-3 py-2 text-sm rounded-xl"></div><button class="btn-premium w-full py-3 rounded-xl text-xs font-bold mt-2">Generate (14-char)</button></form>' : '')
    + '<form method="POST" class="glass-card p-5 mb-4"><input type="hidden" name="action" value="redeem_activation"><h3 class="font-black mb-2">Redeem Activation</h3><div class="flex gap-2"><input type="text" name="activation_key" required placeholder="14-char key" class="flex-1 clay-card px-3 py-2 text-sm font-mono rounded-xl"><button class="btn-premium px-4 py-2 rounded-xl text-xs font-bold">Redeem</button></div></form>'
    + (keys ? '<div class="glass-card p-5"><h3 class="font-black mb-2">Recent</h3><div class="space-y-2">' + keys + '</div></div>' : '');
}

export function apiTestPage(urls) {
  return pageHead('Live API Tester', 'bi-broadcast', 'connect / encrypt test') + ''
    + '<div class="glass-card p-5 mb-4"><div class="grid md:grid-cols-3 gap-2"><input id="t-key" placeholder="user_key" class="clay-card px-3 py-2 text-sm font-mono rounded-xl"><input id="t-serial" placeholder="serial (Test123)" value="Test123" class="clay-card px-3 py-2 text-sm font-mono rounded-xl"><select id="t-api" class="clay-card px-3 py-2 text-sm rounded-xl"><option value="' + esc(urls.connect) + '">CONNECT</option><option value="' + esc(urls.encrypt) + '">ENCRYPT</option></select></div><button onclick="runTest()" class="btn-premium w-full py-3 rounded-xl text-xs font-bold mt-3">Send POST (game=PUBG)</button></div>'
    + '<div class="glass-card p-5"><h3 class="font-black mb-2">Response</h3><pre id="t-out" class="bg-slate-900 text-slate-100 text-xs rounded-2xl p-4 overflow-x-auto">—</pre></div>'
    + '<script>async function runTest(){const out=document.getElementById("t-out");out.textContent="...";try{const fd=new FormData();fd.append("game","PUBG");fd.append("user_key",document.getElementById("t-key").value);fd.append("serial",document.getElementById("t-serial").value);const r=await fetch(document.getElementById("t-api").value,{method:"POST",body:fd});out.textContent=await r.text();}catch(e){out.textContent="ERR: "+e;}}</script>';
}

export function createPanelPage(list, o) {
  const msg = o.ok ? alertBox('ok', 'Done', esc(o.ok)) : o.error ? alertBox('err', 'Error', esc(o.error)) : '';
  const rows = list.map(p => '<div class="glass-card p-4"><div class="flex items-center gap-2"><code class="font-mono font-bold">' + esc(p.panel_code) + '</code><span class="text-[10px] font-bold px-2 py-0.5 rounded ' + (p.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500') + '">' + (p.is_active ? 'ACTIVE' : 'OFF') + '</span><span class="text-[11px] text-slate-500 ml-auto">' + (p.total_users | 0) + ' users • ' + (p.total_keys | 0) + ' keys</span></div>'
    + '<div class="flex gap-2 mt-2"><form method="POST" class="inline"><input type="hidden" name="target_panel" value="' + esc(p.panel_code) + '"><button name="action" value="toggle_status" class="clay-card px-3 py-1.5 text-xs font-bold rounded-xl">ON/OFF</button></form>'
    + (p.panel_code === 'YUVI_001' ? '' : '<form method="POST" class="inline" onsubmit="return confirm(\'Delete panel + users + keys?\')"><input type="hidden" name="target_panel" value="' + esc(p.panel_code) + '"><button name="action" value="delete_panel" class="clay-card px-3 py-1.5 text-xs font-bold text-red-600 rounded-xl">Delete</button></form>') + '</div></div>').join('');
  return pageHead('New Tenant', 'bi-server', 'Panels manage karo') + msg
    + '<form method="POST" class="glass-card p-5 mb-4"><input type="hidden" name="action" value="create"><div class="grid md:grid-cols-3 gap-2"><input type="text" name="custom_code" placeholder="CODE (auto khaali)" class="clay-card px-3 py-2 text-sm font-mono rounded-xl"><input type="number" name="duration" value="30" min="1" class="clay-card px-3 py-2 text-sm rounded-xl"><button class="btn-premium py-2 rounded-xl text-xs font-bold">Create Panel</button></div></form>'
    + '<div class="space-y-3">' + rows + '</div>';
}

export function loaderPage(o) {
  const msg = o.ok ? alertBox('ok', 'Saved', esc(o.ok)) : '';
  const slot = (s, label) => '<div><label class="block text-xs font-extrabold text-slate-500 uppercase mb-1">' + label + ' lib URL</label><input type="text" name="lib_' + s + '" value="' + esc((o.libs && o.libs[s]) || '') + '" placeholder="https://... .zip (khali = GitHub fallback)" class="w-full clay-card px-3 py-2 text-xs rounded-xl"></div>';
  return pageHead('Set Mod/Loader', 'bi-box-seam-fill', 'Version + lib URLs + mod config') + msg
    + '<form method="POST" class="glass-card p-5 mb-4"><input type="hidden" name="form_type" value="loader_config"><h3 class="font-black mb-2">Loader Version</h3><div class="flex gap-2"><input type="number" step="0.1" min="1" name="version" value="' + esc(o.version || '1.0') + '" class="clay-card px-3 py-2 text-sm w-32 rounded-xl"><button class="btn-premium px-4 py-2 rounded-xl text-xs font-bold">Save Version</button></div></form>'
    + '<form method="POST" class="glass-card p-5 mb-4"><input type="hidden" name="form_type" value="lib_urls"><h3 class="font-black mb-2">Lib URLs (R2/zip upload ki jagah — Worker me file upload nahi hota)</h3><div class="space-y-2">' + slot('PRIVATE', 'PRIVATE (paid)') + slot('PUBLIC', 'PUBLIC (free)') + slot('ADMIN', 'ADMIN') + slot('SAFE', 'SAFE') + '</div><button class="btn-premium w-full py-3 rounded-xl text-xs font-bold mt-3">Save Lib URLs</button></form>'
    + '<form method="POST" class="glass-card p-5"><input type="hidden" name="form_type" value="mod_config"><h3 class="font-black mb-2">Mod Config</h3><div class="grid md:grid-cols-2 gap-2">'
    + ['modname', 'mod_status', 'credit'].map(k => '<input type="text" name="' + k + '" value="' + esc((o.mod && o.mod[k]) || '') + '" placeholder="' + k + '" class="clay-card px-3 py-2 text-sm rounded-xl">').join('')
    + '</div><div class="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">' + ['ESP', 'Item', 'AIM', 'SilentAim', 'BulletTrack', 'Floating', 'Memory', 'Setting'].map(k => '<label class="feature-card ' + (((o.mod && o.mod[k]) || 'on') === 'on' ? 'checked' : '') + '"><input type="checkbox" name="' + k + '" ' + (((o.mod && o.mod[k]) || 'on') === 'on' ? 'checked' : '') + ' onchange="this.closest(\'.feature-card\').classList.toggle(\'checked\',this.checked)"><span class="text-xs font-bold">' + k + '</span></label>').join('') + '</div><button class="btn-premium w-full py-3 rounded-xl text-xs font-bold mt-3">Save Mod Config</button></form>';
}
