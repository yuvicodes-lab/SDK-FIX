import { esc } from './ui.js';
import { tabHead } from './pages-dash.js';

export function serverPage(o) {
  const { mMaint, mMsg, bMaint, bMsg, host, panel, toggled } = o;
  const ok = toggled ? '<div class="glass-card p-4 mb-6" style="border-left:4px solid #10b981"><p class="font-bold text-emerald-700 text-sm">Status Updated!</p><p class="text-xs text-slate-600">' + esc(String(toggled).toUpperCase()) + ' server status changed.</p></div>' : '';
  function maintCard(engine, isOff, msg, colorA, colorB, icon) {
    const eid = engine.toLowerCase();
    return '<div class="glass-card p-5 md:p-6 mb-6"><div class="flex items-start justify-between gap-4 mb-4"><div class="flex items-center gap-3"><div class="w-12 h-12 rounded-2xl bg-gradient-to-br ' + (isOff ? 'from-red-500 to-rose-600' : colorA) + ' flex items-center justify-center text-white shadow-lg"><i class="bi ' + (isOff ? 'bi-tools' : icon) + ' text-xl"></i></div><div><h3 class="font-black text-slate-800">' + engine + ' Server</h3><p class="text-[11px] text-slate-500">' + (isOff ? 'Under maintenance' : 'Live - accepting requests') + '</p></div></div>'
      + '<span class="text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase ' + (isOff ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500') + '">' + (isOff ? 'OFFLINE' : 'ONLINE') + '</span></div>'
      + '<form method="POST" class="space-y-4"><input type="hidden" name="toggle_maintenance" value="1"><input type="hidden" name="engine" value="' + engine + '"><input type="hidden" name="maintenance_mode" id="' + eid + '-mode" value="' + (isOff ? 1 : 0) + '">'
      + '<label class="flex items-center gap-3 clay-card p-4 rounded-2xl cursor-pointer"><input type="checkbox" ' + (isOff ? 'checked' : '') + ' onchange="document.getElementById(\'' + eid + '-mode\').value=this.checked?\'1\':\'0\';document.getElementById(\'' + eid + '-msg\').classList.toggle(\'hidden\',!this.checked)" class="w-6 h-6" style="accent-color:#ef4444"><span class="text-sm font-black">Maintenance Mode</span></label>'
      + '<div id="' + eid + '-msg" class="' + (isOff ? '' : 'hidden') + '"><label class="block text-xs font-extrabold text-slate-500 uppercase mb-2">Message (shown to clients)</label><input type="text" name="maintenance_message" value="' + esc(msg) + '" placeholder="Server is under maintenance" class="w-full clay-card px-4 py-3 text-sm rounded-2xl"></div>'
      + '<button class="btn-premium w-full py-3.5 rounded-2xl font-extrabold text-sm uppercase">Save ' + engine + ' Status</button></form></div>';
  }
  function endCard(engine, url, color, encNote) {
    const eid = engine.toLowerCase();
    return '<div class="glass-card p-5 md:p-6 mb-6"><h3 class="font-black text-slate-800 mb-3">' + engine + ' Endpoint</h3>'
      + '<div class="clay-card p-3 flex items-center gap-2 rounded-2xl"><i class="bi bi-link-45deg ' + color + ' text-lg"></i><code id="' + eid + '-url" class="flex-1 text-xs md:text-sm font-mono font-bold text-slate-700 break-all">' + esc(url) + '</code><button type="button" onclick="copyUrl(\'' + eid + '-url\',this)" title="Copy link" class="clay-card w-9 h-9 flex items-center justify-center rounded-xl text-slate-600"><i class="bi bi-link-45deg"></i></button></div>'
      + '<div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4"><div class="clay-card p-3 text-center rounded-xl"><p class="text-[10px] text-slate-400 font-bold">METHOD</p><p class="text-xs font-black">POST</p></div><div class="clay-card p-3 text-center rounded-xl"><p class="text-[10px] text-slate-400 font-bold">FORMAT</p><p class="text-xs font-black">ENCRYPTED</p></div><div class="clay-card p-3 text-center rounded-xl"><p class="text-[10px] text-slate-400 font-bold">ENCRYPT</p><p class="text-xs font-black">' + encNote + '</p></div><div class="clay-card p-3 text-center rounded-xl"><p class="text-[10px] text-slate-400 font-bold">TIMEOUT</p><p class="text-xs font-black">15s</p></div></div></div>';
  }
  const mUrl = 'https://' + host + '/sdk/mundo/' + panel;
  const bUrl = 'https://' + host + '/sdk/bcore/' + panel;
  return '<div class="dual-tab-wrapper" id="serverWrapper">'
    + tabHead('Server & API', 'bi-hdd-network-fill', 'Endpoint URLs, maintenance & docs', 'serverTabs') + ok
    + '<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6"><div class="glass-card p-4"><p class="text-sm font-black">Server Status</p><p class="text-[11px] text-slate-500">All systems operational</p></div><div class="glass-card p-4"><p class="text-sm font-black">API Health</p><p class="text-[11px] text-slate-500">Response &lt; 120ms</p></div><div class="glass-card p-4"><p class="text-sm font-black">Server Load</p><p class="text-[11px] text-slate-500">CPU / Memory</p></div><div class="glass-card p-4"><p class="text-sm font-black">Uptime</p><p class="text-[11px] text-slate-500">Last 30 days 99.9%</p></div></div>'
    + '<div class="tab-content-panel active" data-tab="mundo">' + maintCard('MUNDO', mMaint, mMsg, 'from-blue-500 to-blue-700', '', 'bi-cpu') + endCard('MUNDO', mUrl, 'text-purple-500', 'AES-128-ECB')
    + '<div class="glass-card p-5 mb-6"><h3 class="font-bold mb-3"><i class="bi bi-shield-lock-fill text-purple-500"></i> MUNDO Payload</h3><div class="bg-slate-900 rounded-2xl p-4 overflow-x-auto"><pre class="text-xs font-mono text-slate-100">S1 = sdk_key + HWID\nS2 = pkg_name + pkg_name + S1\nS3_A = app_name + app_name + sdk_key\nS3_B = HWID + HWID + HWID\ndata = urlencode(base64(AES(raw)))\nSalt: https://mundo.cp.cheat/v2/api/verify</pre></div></div></div>'
    + '<div class="tab-content-panel" data-tab="bcore">' + maintCard('BCORE', bMaint, bMsg, 'from-amber-500 to-orange-500', '', 'bi-lightning-charge-fill') + endCard('BCORE', bUrl, 'text-amber-500', 'RC4+Base64')
    + '<div class="glass-card p-5 mb-6"><h3 class="font-bold mb-3"><i class="bi bi-shield-lock-fill text-amber-500"></i> BCORE Payload</h3><div class="bg-slate-900 rounded-2xl p-4 overflow-x-auto"><pre class="text-xs font-mono text-slate-100">Payload = sdk_key=X&pkg_name=Y&app_name=Z&device_id=W\nEncrypted = base64(RC4(Payload, YuviMatrix_Secure_2026))</pre></div><div class="mt-3 bg-amber-50 border border-amber-100 rounded-xl p-3 text-[11px] text-amber-700"><strong>BCORE returns F1/F2</strong> as features1 / features2.</div></div></div></div>';
}

export function hashPage(o) {
  const { mHashes, bHashes, mActive, bActive, salt, aesHex } = o;
  function addForm(engine) {
    return '<div class="glass-card p-5 mb-6"><h3 class="font-bold mb-4"><i class="bi bi-plus-circle"></i> Add ' + engine + ' Lib Hash</h3>'
      + '<form method="POST" class="space-y-3"><input type="hidden" name="action" value="add_hash"><input type="hidden" name="engine" value="' + engine + '"><input type="hidden" name="hash_type" value="lib_signature">'
      + '<div class="grid grid-cols-1 md:grid-cols-2 gap-3"><input type="text" name="hash_label" placeholder="Label (e.g. lib.so)" required class="clay-card px-4 py-3 text-sm rounded-2xl"><input type="text" name="hash_value" placeholder="SHA-256 (64 hex)" required pattern="[a-fA-F0-9]{64}" class="clay-card px-4 py-3 text-sm font-mono rounded-2xl"></div>'
      + '<button class="btn-premium w-full py-3 rounded-xl text-xs font-bold">Add Lib Hash</button></form></div>';
  }
  function list(hashes, engine) {
    if (!hashes.length) return '<div class="text-center py-8 text-slate-400 text-xs">No hashes added</div>';
    return '<div class="space-y-2">' + hashes.map(h =>
      '<div class="clay-card p-3 flex items-center gap-3 rounded-2xl"><span class="text-[10px] font-extrabold px-2 py-1 rounded-lg ' + (h.is_active ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-100 text-slate-500') + '">' + (h.is_active ? 'ACTIVE' : 'OFF') + '</span>'
      + '<div class="flex-1 min-w-0"><p class="text-xs font-bold">' + esc(h.hash_label) + '</p><p class="text-[10px] font-mono text-slate-500 break-all">' + esc(h.hash_value) + '</p></div>'
      + '<form method="POST"><input type="hidden" name="action" value="toggle_hash"><input type="hidden" name="engine" value="' + engine + '"><input type="hidden" name="hash_id" value="' + h.id + '"><button class="w-8 h-8 ' + (h.is_active ? 'text-emerald-600' : 'text-slate-400') + '"><i class="bi ' + (h.is_active ? 'bi-toggle-on' : 'bi-toggle-off') + '"></i></button></form>'
      + '<form method="POST" onsubmit="return confirm(\'Delete?\')"><input type="hidden" name="action" value="delete_hash"><input type="hidden" name="engine" value="' + engine + '"><input type="hidden" name="hash_id" value="' + h.id + '"><button class="w-8 h-8 text-red-500"><i class="bi bi-trash text-xs"></i></button></form></div>'
    ).join('') + '</div>';
  }
  return '<div class="dual-tab-wrapper" id="hashWrapper">'
    + tabHead('Hash Vault', 'bi-fingerprint', 'Lib signature verification (.so hash)', 'hashTabs')
    + '<div class="glass-card p-5 mb-6"><h3 class="font-black">Universal Lib Hash</h3><p class="text-[11px] text-slate-500">Ek hi hash sab users ke liye - app/pkg independent.</p>'
    + '<div class="bg-amber-50 border border-amber-100 rounded-2xl p-3 text-[11px] text-amber-700 mt-3">Termux me <code>sha256sum lib.so</code> chalao, output copy karo.</div>'
    + '<div class="mt-3"><label class="text-[10px] font-extrabold text-slate-500 uppercase">Client Salt</label><div class="clay-card p-3 flex gap-2 rounded-2xl mt-1"><code id="salt-v" class="flex-1 text-xs font-mono font-bold break-all">' + esc(salt) + '</code><button type="button" onclick="copyUrl(\'salt-v\',this)" title="Copy link" class="clay-card w-9 h-9 rounded-xl text-slate-600"><i class="bi bi-link-45deg"></i></button></div></div>'
    + '<div class="mt-3"><label class="text-[10px] font-extrabold text-slate-500 uppercase">Realtime AES-128 Key (hex)</label><div class="clay-card p-3 flex gap-2 rounded-2xl mt-1"><code id="aes-v" class="flex-1 text-xs font-mono font-bold break-all blur-sm select-none">' + esc(aesHex) + '</code><button onclick="document.getElementById(\'aes-v\').classList.toggle(\'blur-sm\')" class="clay-card w-9 h-9 rounded-xl"><i class="bi bi-eye"></i></button></div></div></div>'
    + '<div class="tab-content-panel active" data-tab="mundo">'
    + (mActive ? '<div class="glass-card p-4 mb-6" style="border-left:4px solid #10b981"><p class="text-[10px] font-extrabold text-emerald-600">ACTIVE MUNDO HASH</p><p class="text-xs font-bold">' + esc(mActive.hash_label) + '</p><code class="text-[10px] font-mono break-all">' + esc(mActive.hash_value) + '</code></div>' : '<div class="glass-card p-4 mb-6" style="border-left:4px solid #f59e0b"><p class="text-xs font-bold text-amber-700">No active MUNDO hash</p></div>')
    + addForm('MUNDO') + '<div class="glass-card p-5"><h3 class="font-bold mb-4">MUNDO Hashes (' + mHashes.length + ')</h3>' + list(mHashes, 'MUNDO') + '</div></div>'
    + '<div class="tab-content-panel" data-tab="bcore">'
    + (bActive ? '<div class="glass-card p-4 mb-6" style="border-left:4px solid #10b981"><p class="text-[10px] font-extrabold text-emerald-600">ACTIVE BCORE HASH</p><p class="text-xs font-bold">' + esc(bActive.hash_label) + '</p><code class="text-[10px] font-mono break-all">' + esc(bActive.hash_value) + '</code></div>' : '')
    + addForm('BCORE') + '<div class="glass-card p-5"><h3 class="font-bold mb-4">BCORE Hashes (' + bHashes.length + ')</h3>' + list(bHashes, 'BCORE') + '</div></div></div>';
}
