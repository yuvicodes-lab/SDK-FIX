import { esc } from './ui.js';
import { pageHead, alertBox } from './panel-ui.js';

export const KEY_PRICING = { '2H': 10, '1D': 80, '3D': 150, '7D': 250, '15D': 350, '30D': 500, '60D': 900 };
export const KEY_DURATIONS = ['2H', '1D', '3D', '7D', '15D', '30D', '60D'];

function pcard(label, val, icon, extra) {
  return '<div class="glass-card p-5 md:p-6 relative overflow-hidden"><div class="absolute top-0 left-0 right-0 h-1 avatar-premium"></div>'
    + '<div class="flex items-center justify-between gap-3"><div class="min-w-0"><p class="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">' + label + '</p>'
    + '<h3 class="text-3xl font-black text-slate-800 truncate">' + val + '</h3>' + (extra || '') + '</div>'
    + '<div class="w-14 h-14 shrink-0 rounded-2xl avatar-premium text-white flex items-center justify-center text-2xl"><i class="bi ' + icon + '"></i></div></div></div>';
}

export function panelDashboard(sess, stats, balanceText) {
  const role = sess.role;
  const sub = role === 'OWNER' ? 'Manage your entire panel network and track performance'
    : role === 'ADMIN' ? 'Manage your team and monitor key generation' : 'Track your keys and manage your account';
  let cards = '';
  if (role === 'OWNER') {
    cards = '<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 mb-6">'
      + pcard('Account Balance', esc(balanceText), 'bi-wallet2')
      + pcard('Total Panel Keys', stats.total_keys || 0, 'bi-key-fill', '<p class="text-[11px] text-slate-500 font-semibold mt-1">' + (stats.active_keys || 0) + ' active</p>')
      + '<div class="glass-card p-5 md:p-6 relative overflow-hidden"><div class="absolute top-0 left-0 right-0 h-1 avatar-premium"></div><div class="flex items-center justify-between gap-3"><div><p class="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Total Network</p><div class="flex gap-6"><div class="text-center"><span class="block text-2xl font-black text-slate-800">' + (stats.total_admins || 0) + '</span><span class="text-[9px] uppercase font-bold text-slate-400">Admins</span></div><div class="text-center"><span class="block text-2xl font-black text-slate-800">' + (stats.total_resellers || 0) + '</span><span class="text-[9px] uppercase font-bold text-slate-400">Resellers</span></div></div></div><div class="w-14 h-14 shrink-0 rounded-2xl avatar-premium text-white flex items-center justify-center text-2xl"><i class="bi bi-diagram-3-fill"></i></div></div></div>'
      + pcard('Keys by Admins', stats.admin_keys || 0, 'bi-person-badge-fill')
      + pcard('Keys by Resellers', stats.reseller_keys || 0, 'bi-person-workspace')
      + '<div class="glass-card p-5 md:p-6"><p class="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</p><div class="flex gap-2 flex-wrap"><a href="/generate" class="btn-premium px-4 py-2.5 rounded-xl text-xs font-bold"><i class="bi bi-plus-circle"></i> Generate Key</a><a href="/users" class="clay-card px-4 py-2.5 rounded-xl text-slate-700 text-xs font-bold"><i class="bi bi-people"></i> Users</a><a href="/server" class="clay-card px-4 py-2.5 rounded-xl text-slate-700 text-xs font-bold"><i class="bi bi-hdd"></i> Server</a></div></div></div>';
  } else if (role === 'ADMIN') {
    cards = '<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5 mb-6">'
      + pcard('My Balance', esc(balanceText), 'bi-wallet2') + pcard('Team Total Keys', stats.team_keys || 0, 'bi-key-fill')
      + pcard('My Keys', stats.my_keys || 0, 'bi-person-check', '<p class="text-[11px] text-slate-500 font-semibold mt-1">' + (stats.my_active_keys || 0) + ' active</p>')
      + pcard('My Resellers', stats.my_resellers || 0, 'bi-people-fill', '<p class="text-[11px] text-slate-500 font-semibold mt-1">' + (stats.my_reseller_keys || 0) + ' keys by them</p>') + '</div>';
  } else {
    cards = '<div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mb-6">'
      + pcard('Account Balance', esc(balanceText), 'bi-wallet2') + pcard('Total Keys', stats.my_keys || 0, 'bi-key-fill') + pcard('Active Keys', stats.my_active_keys || 0, 'bi-shield-check') + '</div>';
  }
  return '<div class="relative mb-6 md:mb-8 overflow-hidden rounded-3xl p-6 md:p-10 avatar-premium">'
    + '<div class="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-[80px]"></div>'
    + '<div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"><div><h1 class="text-2xl md:text-4xl font-black text-white mb-2">Welcome back, ' + esc(sess.username) + '!</h1><p class="text-white/80 text-sm md:text-base font-medium">' + sub + '</p></div>'
    + '<div class="hidden md:flex items-center gap-3 bg-white/10 rounded-2xl px-6 py-4 border border-white/20"><div class="text-right"><p class="text-[10px] text-white/70 font-bold uppercase">Role</p><p class="text-white font-extrabold text-sm">' + esc(role) + '</p></div><div class="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl"><i class="bi bi-rocket-takeoff-fill text-white"></i></div></div></div></div>'
    + cards;
}

export function panelGenerate(sess, o) {
  const isOwner = sess.role === 'OWNER';
  const msg = o.ok ? alertBox('ok', 'Keys Generated!', esc(o.ok))
    : o.error ? alertBox('err', 'Error', esc(o.error)) : '';
  const pills = KEY_DURATIONS.map(d => '<div class="pill' + (d === '30D' ? ' on' : '') + '" data-dur="' + d + '" onclick="pickDur(this)"> ' + d + '<br><span style="font-size:10px">Rs' + KEY_PRICING[d] + '</span></div>').join('');
  return pageHead('Generate Keys', 'bi-key-fill', isOwner ? 'Unlimited generation (OWNER)' : 'Cost balance se katega — neeche live total dekho')
    + msg
    + '<form method="POST" id="genForm" class="glass-card p-5 md:p-7"><div class="space-y-5">'
    + '<div><label class="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2"><i class="bi bi-clock-history mr-1"></i> Duration</label><input type="hidden" name="duration" id="f-dur" value="30D"><div class="grid grid-cols-4 md:grid-cols-7 gap-2">' + pills + '</div></div>'
    + '<div class="grid grid-cols-2 gap-3">'
    + '<div class="clay-card p-3 rounded-2xl"><label class="block text-xs font-extrabold text-slate-500 uppercase mb-2 text-center">Device Limit</label><div class="stepper justify-center"><button type="button" class="clay-card" onclick="step(\'f-lim\',-1)">−</button><input type="number" name="device_limit" id="f-lim" min="1" max="10" value="1" readonly class="w-12 text-center font-black text-lg bg-transparent focus:outline-none"><button type="button" class="clay-card" onclick="step(\'f-lim\',1)">+</button></div></div>'
    + '<div class="clay-card p-3 rounded-2xl"><label class="block text-xs font-extrabold text-slate-500 uppercase mb-2 text-center">Bulk Qty <span class="normal-case font-medium text-slate-400">(1=single)</span></label><div class="stepper justify-center"><button type="button" class="clay-card" onclick="step(\'f-amt\',-1)">−</button><input type="number" name="bulk_amount" id="f-amt" min="1" max="50" value="1" readonly class="w-12 text-center font-black text-lg bg-transparent focus:outline-none"><button type="button" class="clay-card" onclick="step(\'f-amt\',1)">+</button></div></div></div>'
    + '<div><label class="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">Custom Key <span class="text-slate-400 font-medium normal-case">(single key par hi lagega, empty = auto)</span></label><input type="text" name="custom_key" maxlength="50" placeholder="Optional — khaali chhodo to auto key" class="w-full clay-card px-4 py-3 text-sm font-mono rounded-2xl focus:outline-none"></div>'
    + '<label class="feature-card" id="bulkCard"><input type="checkbox" name="is_bulk" id="f-bulk" value="1" onchange="document.getElementById(\'bulkCard\').classList.toggle(\'checked\',this.checked)"><span class="text-sm font-bold">Bulk mode <span class="text-slate-400 font-medium">— qty 1 se zyada ho to auto ON</span></span></label>'
    + (isOwner ? '<div><label class="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2"><i class="bi bi-hdd-network mr-1"></i> Server Type (OWNER)</label><input type="hidden" name="server_type" id="f-srv" value="PRIVATE"><div class="grid grid-cols-2 md:grid-cols-4 gap-2">' + ['PRIVATE', 'PUBLIC', 'ADMIN', 'SAFE'].map(s => '<div class="pill' + (s === 'PRIVATE' ? ' on' : '') + '" data-srv="' + s + '" onclick="pickSrv(this)">' + s + '</div>').join('') + '</div></div>' : '')
    + '<div class="costbar"><div><p class="text-[10px] font-extrabold text-slate-400 uppercase">Total Cost</p><p class="text-2xl font-black text-slate-800" id="costOut">Rs 500</p></div><p class="text-[11px] text-slate-500 font-semibold text-right" id="costSub">1 key × 1 device</p></div>'
    + '<button class="btn-premium w-full py-4 rounded-2xl font-extrabold text-sm uppercase tracking-wider"><i class="bi bi-magic"></i> Generate Key(s)</button>'
    + '</div></form>'
    + '<script>var PRICES=' + JSON.stringify(KEY_PRICING) + ';'
    + 'function pickDur(el){document.getElementById("f-dur").value=el.getAttribute("data-dur");var ps=el.parentElement.querySelectorAll(".pill");for(var i=0;i<ps.length;i++)ps[i].classList.remove("on");el.classList.add("on");calc();}'
    + 'function pickSrv(el){document.getElementById("f-srv").value=el.getAttribute("data-srv");var ps=el.parentElement.querySelectorAll(".pill");for(var i=0;i<ps.length;i++)ps[i].classList.remove("on");el.classList.add("on");}'
    + 'function step(id,d){var el=document.getElementById(id);var v=parseInt(el.value||"1",10)+d;v=Math.max(parseInt(el.min||"1",10),Math.min(parseInt(el.max||"50",10),v));el.value=v;if(id==="f-amt"){var b=document.getElementById("f-bulk");if(b){b.checked=v>1;var c=document.getElementById("bulkCard");if(c)c.classList.toggle("checked",v>1);}}calc();}'
    + 'function calc(){var d=document.getElementById("f-dur").value;var l=parseInt(document.getElementById("f-lim").value||"1",10);var a=parseInt(document.getElementById("f-amt").value||"1",10);var t=(PRICES[d]||10)*l*a;document.getElementById("costOut").textContent="Rs "+t;document.getElementById("costSub").textContent=a+" key(s) x "+l+" device(s) • "+d;}'
    + 'calc();</script>'
    + (o.keys && o.keys.length ? '<div class="glass-card p-5 mt-5"><div class="flex items-center justify-between mb-3"><h3 class="font-black">Generated (' + o.keys.length + ')</h3><button onclick="copyAll(this)" class="clay-card px-3 py-1.5 text-xs font-bold rounded-xl"><i class="bi bi-clipboard"></i> Copy All</button></div><div class="space-y-2" id="genKeys">' + o.keys.map(k => '<div class="clay-card p-3 flex items-center gap-2 rounded-2xl"><code class="flex-1 font-mono text-sm font-bold break-all gk">' + esc(k) + '</code><button onclick="doCopy(\'' + esc(k) + '\',this)" class="clay-card w-9 h-9 rounded-xl shrink-0"><i class="bi bi-clipboard"></i></button></div>').join('') + '</div></div><script>function copyAll(btn){var t="";document.querySelectorAll("#genKeys .gk").forEach(function(e){t+=e.innerText.trim()+"\\n";});doCopy(t.trim(),btn);}</script>' : '');
}

const SRV_BADGE = { PRIVATE: 'bg-blue-50 text-blue-600', PUBLIC: 'bg-emerald-50 text-emerald-600', ADMIN: 'bg-purple-50 text-purple-600', SAFE: 'bg-amber-50 text-amber-600' };

export function panelKeyList(sess, keys, o) {
  const isOwner = sess.role === 'OWNER';
  const msg = o.ok ? alertBox('ok', 'Done', esc(o.ok)) : o.error ? alertBox('err', 'Error', esc(o.error)) : '';
  const bulk = isOwner ? '<form method="POST" onsubmit="return confirm(\'Bulk action pakka?\')" class="glass-card p-4 mb-4 flex flex-wrap gap-2 items-center"><input type="hidden" name="bulk" value="1"><select name="action" class="clay-card px-3 py-2 text-xs font-bold rounded-xl"><option value="delete_expired">Delete Expired</option><option value="delete_all">Delete ALL (panel)</option><option value="extend_all">Extend ALL +</option></select><input type="number" name="extend_val" placeholder="days" class="clay-card px-3 py-2 text-xs w-24 rounded-xl"><input type="hidden" name="extend_unit" value="D"><button class="btn-premium px-4 py-2 rounded-xl text-xs font-bold">Apply</button></form>' : '';
  const rows = keys.length ? keys.map(k => {
    const used = k.dev_count || 0, lim = k.device_limit || 1, pct = Math.min(100, Math.round(used / lim * 100));
    const exp = k.expires_at || ('PENDING (' + esc(k.duration) + ')');
    const badge = SRV_BADGE[k.server_type] || SRV_BADGE.PRIVATE;
    return '<div class="glass-card overflow-hidden"><div class="p-4 md:p-5">'
      + '<div class="flex items-center gap-2 flex-wrap mb-2">'
      + '<span class="text-[10px] font-extrabold px-2 py-0.5 rounded-lg ' + (k.is_blocked ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500') + '">' + (k.is_blocked ? 'BLOCKED' : 'ACTIVE') + '</span>'
      + '<span class="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600">' + esc(k.duration) + '</span>'
      + '<span class="text-[10px] font-extrabold px-2 py-0.5 rounded-lg ' + badge + '">' + esc(k.server_type || 'PRIVATE') + '</span></div>'
      + '<div class="clay-card p-3 rounded-2xl flex items-center gap-2"><p class="flex-1 font-mono text-sm font-bold break-all blur-sm select-none" id="pk-' + k.id + '">' + esc(k.key_value) + '</p><button onclick="document.getElementById(\'pk-' + k.id + '\').classList.toggle(\'blur-sm\')" class="text-slate-400 text-lg px-1"><i class="bi bi-eye"></i></button><button onclick="doCopy(\'' + esc(k.key_value) + '\',this)" class="clay-card w-9 h-9 rounded-xl shrink-0 text-slate-600"><i class="bi bi-clipboard"></i></button></div>'
      + '<div class="mt-2"><div class="flex justify-between text-[10px] font-bold text-slate-500 mb-1"><span><i class="bi bi-phone mr-1"></i>' + used + '/' + lim + ' devices • ' + k.uses + ' uses</span><span>Exp: ' + esc(exp) + '</span></div><div class="h-2 rounded-full bg-white/60 overflow-hidden"><div class="h-full rounded-full avatar-premium" style="width:' + pct + '%"></div></div></div>'
      + '<p class="text-[11px] text-slate-400 mt-1.5">by ' + esc(k.creator || '?') + '</p>'
      + '<div class="flex flex-wrap gap-2 mt-3"><form method="POST" class="inline"><input type="hidden" name="key_id" value="' + k.id + '"><input type="hidden" name="action" value="reset_device"><button class="clay-card px-3 py-1.5 text-xs font-bold text-blue-600 rounded-xl"><i class="bi bi-arrow-counterclockwise"></i> Reset Device</button></form>'
      + '<form method="POST" class="inline" onsubmit="return confirm(\'Delete key?\')"><input type="hidden" name="key_id" value="' + k.id + '"><input type="hidden" name="action" value="delete_key"><button class="clay-card px-3 py-1.5 text-xs font-bold text-red-600 rounded-xl"><i class="bi bi-trash"></i> Delete</button></form></div></div>'
      + '<details class="border-t border-white/50 px-4 md:px-5 py-1 text-xs"><summary class="cursor-pointer font-bold text-slate-500 py-2.5">Edit / Extend</summary><form method="POST" class="flex flex-wrap gap-2 pb-3"><input type="hidden" name="key_id" value="' + k.id + '"><input type="hidden" name="action" value="edit_key"><select name="edit_status" class="clay-card px-2 py-2 text-xs font-bold rounded-xl"><option value="1">Active</option><option value="0"' + (k.is_blocked ? ' selected' : '') + '>Blocked</option></select><input type="number" name="extend_val" placeholder="+days" class="clay-card px-2 py-2 text-xs w-24 rounded-xl"><input type="hidden" name="extend_unit" value="D">'
      + (isOwner ? '<select name="edit_server" class="clay-card px-2 py-2 text-xs font-bold rounded-xl"><option value="">Server~</option><option>PRIVATE</option><option>PUBLIC</option><option>ADMIN</option><option>SAFE</option></select>' : '')
      + '<button class="btn-premium px-4 py-2 rounded-xl text-xs font-bold">Save</button></form></details></div>';
  }).join('') : '<div class="glass-card p-10 text-center text-slate-400 text-sm"><i class="bi bi-inbox text-5xl block mb-3 opacity-40"></i>No keys found. <a href="/generate" class="text-blue-600 font-bold">Generate →</a></div>';
  return pageHead('Key Manager', 'bi-view-list', keys.length + ' keys (max 200)') + msg + bulk + '<div class="space-y-4">' + rows + '</div>';
}

export function arcxRand(len) {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const r = new Uint8Array(len);
  crypto.getRandomValues(r);
  return [...r].map(b => chars[b % 36]).join('');
}
