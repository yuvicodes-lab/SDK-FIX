import { esc } from './ui.js';
import { pageHead, alertBox } from './panel-ui.js';

export const KEY_PRICING = { '2H': 10, '1D': 80, '3D': 150, '7D': 250, '15D': 350, '30D': 500, '60D': 900 };
export const KEY_DURATIONS = ['2H', '1D', '3D', '7D', '15D', '30D', '60D'];

export function panelDashboard(sess, stats, balanceText) {
  const role = sess.role;
  const sub = role === 'OWNER' ? 'Manage your entire panel network and track performance'
    : role === 'ADMIN' ? 'Manage your team and monitor key generation' : 'Track your keys and manage your account';
  let cards = '';
  if (role === 'OWNER') {
    const c = (label, val, icon, extra) => '<div class="glass-card p-5 md:p-6"><div class="flex items-center justify-between"><div><p class="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">' + label + '</p><h3 class="text-3xl font-black text-slate-800">' + val + '</h3>' + (extra || '') + '</div><div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-2xl shadow-lg"><i class="bi ' + icon + '"></i></div></div></div>';
    cards = '<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 mb-6">'
      + c('Account Balance', esc(balanceText), 'bi-wallet2')
      + c('Total Panel Keys', stats.total_keys || 0, 'bi-key-fill', '<p class="text-[10px] text-blue-500 font-semibold mt-1">' + (stats.active_keys || 0) + ' active</p>')
      + '<div class="glass-card p-5 md:p-6"><div class="flex items-center justify-between"><div><p class="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">Total Network</p><div class="flex gap-6"><div class="text-center"><span class="block text-2xl font-black text-slate-800">' + (stats.total_admins || 0) + '</span><span class="text-[9px] uppercase font-bold text-blue-400">Admins</span></div><div class="text-center"><span class="block text-2xl font-black text-slate-800">' + (stats.total_resellers || 0) + '</span><span class="text-[9px] uppercase font-bold text-blue-400">Resellers</span></div></div></div><div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-2xl shadow-lg"><i class="bi bi-diagram-3-fill"></i></div></div></div>'
      + c('Keys by Admins', stats.admin_keys || 0, 'bi-person-badge-fill')
      + c('Keys by Resellers', stats.reseller_keys || 0, 'bi-person-workspace')
      + '<div class="glass-card p-5 md:p-6"><p class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Quick Actions</p><div class="flex gap-2 flex-wrap"><a href="/generate" class="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold"><i class="bi bi-plus-circle"></i> Generate Key</a><a href="/users" class="px-4 py-2 rounded-xl bg-white/70 text-slate-700 text-xs font-bold border border-slate-200"><i class="bi bi-people"></i> Users</a><a href="/server" class="px-4 py-2 rounded-xl bg-white/70 text-slate-700 text-xs font-bold border border-slate-200"><i class="bi bi-hdd"></i> Server</a></div></div></div>';
  } else if (role === 'ADMIN') {
    const c = (label, val, extra) => '<div class="glass-card p-5 md:p-6"><p class="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">' + label + '</p><h3 class="text-3xl font-black text-slate-800">' + val + '</h3>' + (extra || '') + '</div>';
    cards = '<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5 mb-6">'
      + c('My Balance', esc(balanceText)) + c('Team Total Keys', stats.team_keys || 0)
      + c('My Keys', stats.my_keys || 0, '<p class="text-[10px] text-blue-500 font-semibold mt-1">' + (stats.my_active_keys || 0) + ' active</p>')
      + c('My Resellers', stats.my_resellers || 0, '<p class="text-[10px] text-blue-500 font-semibold mt-1">' + (stats.my_reseller_keys || 0) + ' keys by them</p>') + '</div>';
  } else {
    const c = (label, val, icon) => '<div class="glass-card p-5 md:p-6"><div class="flex items-center justify-between"><div><p class="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">' + label + '</p><h3 class="text-3xl font-black text-slate-800">' + val + '</h3></div><div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-2xl shadow-lg"><i class="bi ' + icon + '"></i></div></div></div>';
    cards = '<div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mb-6">' + c('Account Balance', esc(balanceText), 'bi-wallet2') + c('Total Keys', stats.my_keys || 0, 'bi-key-fill') + c('Active Keys', stats.my_active_keys || 0, 'bi-shield-check') + '</div>';
  }
  return '<div class="relative mb-6 md:mb-8 overflow-hidden rounded-3xl p-6 md:p-10 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700">'
    + '<div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"><div><h1 class="text-2xl md:text-4xl font-black text-white mb-2">Welcome back, ' + esc(sess.username) + '!</h1><p class="text-white/80 text-sm md:text-base font-medium">' + sub + '</p></div>'
    + '<div class="hidden md:flex items-center gap-3 bg-white/10 rounded-2xl px-6 py-4 border border-white/20"><div class="text-right"><p class="text-[10px] text-white/70 font-bold uppercase">Role</p><p class="text-white font-extrabold text-sm">' + esc(role) + '</p></div><div class="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl"><i class="bi bi-rocket-takeoff-fill text-white"></i></div></div></div></div>'
    + cards;
}

export function panelGenerate(sess, o) {
  const isOwner = sess.role === 'OWNER';
  const msg = o.ok ? alertBox('ok', 'Keys Generated!', esc(o.ok))
    : o.error ? alertBox('err', 'Error', esc(o.error)) : '';
  const priceRows = KEY_DURATIONS.map(d => '<div class="clay-card p-2 text-center rounded-xl"><p class="text-[10px] font-black">' + d + '</p><p class="text-[11px] text-blue-700 font-bold">Rs ' + KEY_PRICING[d] + '</p></div>').join('');
  return pageHead('Generate Keys', 'bi-key-fill', isOwner ? 'Unlimited generation (OWNER)' : 'Balance se cut hoga')
    + msg
    + '<div class="glass-card p-4 md:p-5 mb-5"><p class="text-[11px] font-extrabold text-slate-500 uppercase mb-2">Price (per device)</p><div class="grid grid-cols-4 md:grid-cols-7 gap-2">' + priceRows + '</div></div>'
    + '<form method="POST" class="glass-card p-5 md:p-7"><div class="space-y-5">'
    + '<div><label class="block text-xs font-extrabold text-slate-500 uppercase mb-2">Duration</label><select name="duration" class="w-full clay-card custom-select px-4 py-3 text-sm font-semibold rounded-2xl">'
    + KEY_DURATIONS.map(d => '<option value="' + d + '"' + (d === '30D' ? ' selected' : '') + '>' + d + ' — Rs ' + KEY_PRICING[d] + '/device</option>').join('') + '</select></div>'
    + '<div class="grid grid-cols-2 gap-3"><div><label class="block text-xs font-extrabold text-slate-500 uppercase mb-2">Device Limit</label><input type="number" name="device_limit" min="1" max="10" value="1" class="w-full clay-card px-4 py-3 text-sm font-bold text-center rounded-2xl"></div>'
    + '<div><label class="block text-xs font-extrabold text-slate-500 uppercase mb-2">Bulk Amount</label><input type="number" name="bulk_amount" min="1" max="50" value="1" class="w-full clay-card px-4 py-3 text-sm font-bold text-center rounded-2xl"></div></div>'
    + '<div><label class="block text-xs font-extrabold text-slate-500 uppercase mb-2">Custom Key <span class="text-slate-400 normal-case font-medium">(empty = auto)</span></label><input type="text" name="custom_key" maxlength="50" placeholder="Optional custom key" class="w-full clay-card px-4 py-3 text-sm font-mono rounded-2xl"></div>'
    + '<label class="feature-card"><input type="checkbox" name="is_bulk" value="1"><span class="text-sm font-bold">Bulk mode (bulk amount tak keys)</span></label>'
    + (isOwner ? '<div><label class="block text-xs font-extrabold text-slate-500 uppercase mb-2">Server Type (OWNER only)</label><select name="server_type" class="w-full clay-card custom-select px-4 py-3 text-sm font-semibold rounded-2xl"><option value="PRIVATE" selected>PRIVATE (paid)</option><option value="PUBLIC">PUBLIC (free)</option><option value="ADMIN">ADMIN</option><option value="SAFE">SAFE</option></select></div>' : '')
    + '<button class="btn-premium w-full py-4 rounded-2xl font-extrabold text-sm uppercase"><i class="bi bi-magic"></i> Generate Key(s)</button>'
    + '</div></form>'
    + (o.keys && o.keys.length ? '<div class="glass-card p-5 mt-5"><h3 class="font-bold mb-3">Generated (' + o.keys.length + ')</h3><div class="space-y-2">' + o.keys.map(k => '<div class="clay-card p-3 flex items-center gap-2 rounded-2xl"><code class="flex-1 font-mono text-sm font-bold break-all">' + esc(k) + '</code><button onclick="doCopy(\'' + esc(k) + '\',this)" class="clay-card w-9 h-9 rounded-xl"><i class="bi bi-clipboard"></i></button></div>').join('') + '</div></div>' : '');
}

export function panelKeyList(sess, keys, o) {
  const isOwner = sess.role === 'OWNER';
  const msg = o.ok ? alertBox('ok', 'Done', esc(o.ok)) : o.error ? alertBox('err', 'Error', esc(o.error)) : '';
  const bulk = isOwner ? '<form method="POST" onsubmit="return confirm(\'Bulk action?\')" class="glass-card p-4 mb-4 flex flex-wrap gap-2 items-center"><input type="hidden" name="bulk" value="1"><select name="action" class="clay-card px-3 py-2 text-xs font-bold rounded-xl"><option value="delete_expired">Delete Expired</option><option value="delete_all">Delete ALL (panel)</option></select><input type="number" name="extend_val" placeholder="Ext val" class="clay-card px-3 py-2 text-xs w-24 rounded-xl"><select name="extend_unit" class="clay-card px-3 py-2 text-xs rounded-xl"><option value="D">Days</option><option value="H">Hours</option></select><button name="action2" value="extend_all" formaction="#" onclick="this.form.action.value=\'extend_all\';this.form.submit();return false;" class="clay-card px-3 py-2 text-xs font-bold rounded-xl">Extend All</button><button class="btn-premium px-4 py-2 rounded-xl text-xs font-bold">Apply</button></form>' : '';
  const rows = keys.length ? keys.map(k => {
    const exp = k.expires_at || ('PENDING (' + esc(k.duration) + ')');
    return '<div class="glass-card overflow-hidden"><div class="p-4"><div class="flex items-center gap-2 flex-wrap mb-1">'
      + '<span class="text-[10px] font-extrabold px-2 py-0.5 rounded-lg ' + (k.is_blocked ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500') + '">' + (k.is_blocked ? 'BLOCKED' : 'ACTIVE') + '</span>'
      + '<span class="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600">' + esc(k.duration) + '</span>'
      + '<span class="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-purple-50 text-purple-600">' + esc(k.server_type || 'PRIVATE') + '</span>'
      + '<span class="text-[10px] text-slate-400 font-bold">' + (k.dev_count || 0) + '/' + k.device_limit + ' devices • uses ' + k.uses + '</span></div>'
      + '<p class="font-mono text-sm font-bold break-all blur-sm select-none" id="pk-' + k.id + '">' + esc(k.key_value) + '</p>'
      + '<p class="text-[11px] text-slate-500 mt-1">Exp: ' + esc(exp) + ' • by ' + esc(k.creator || '') + '</p>'
      + '<div class="flex flex-wrap gap-2 mt-3"><button onclick="document.getElementById(\'pk-' + k.id + '\').classList.toggle(\'blur-sm\')" class="clay-card px-3 py-1.5 text-xs font-bold rounded-xl"><i class="bi bi-eye"></i></button>'
      + '<button onclick="doCopy(\'' + esc(k.key_value) + '\',this)" class="clay-card px-3 py-1.5 text-xs font-bold rounded-xl"><i class="bi bi-clipboard"></i> Copy</button>'
      + '<form method="POST" class="inline"><input type="hidden" name="key_id" value="' + k.id + '"><input type="hidden" name="action" value="reset_device"><button class="clay-card px-3 py-1.5 text-xs font-bold text-blue-600 rounded-xl">Reset Device</button></form>'
      + '<form method="POST" class="inline" onsubmit="return confirm(\'Delete?\')"><input type="hidden" name="key_id" value="' + k.id + '"><input type="hidden" name="action" value="delete_key"><button class="clay-card px-3 py-1.5 text-xs font-bold text-red-600 rounded-xl">Delete</button></form></div>'
      + '<details class="border-t border-white/50 px-4 py-2 text-xs"><summary class="cursor-pointer font-bold text-slate-500 py-2">Edit / Extend</summary><form method="POST" class="flex flex-wrap gap-2 py-2"><input type="hidden" name="key_id" value="' + k.id + '"><input type="hidden" name="action" value="edit_key"><select name="edit_status" class="clay-card px-2 py-1.5 text-xs rounded-xl"><option value="1">Active</option><option value="0"' + (k.is_blocked ? ' selected' : '') + '>Blocked</option></select><input type="number" name="extend_val" placeholder="+val" class="clay-card px-2 py-1.5 text-xs w-20 rounded-xl"><select name="extend_unit" class="clay-card px-2 py-1.5 text-xs rounded-xl"><option value="D">D</option><option value="H">H</option></select>'
      + (isOwner ? '<select name="edit_server" class="clay-card px-2 py-1.5 text-xs rounded-xl"><option value="">Server↷</option><option>PRIVATE</option><option>PUBLIC</option><option>ADMIN</option><option>SAFE</option></select>' : '')
      + '<button class="btn-premium px-3 py-1.5 rounded-xl text-xs font-bold">Save</button></form></details></div>';
  }).join('') : '<div class="glass-card p-10 text-center text-slate-400 text-sm">No keys found. <a href="/generate" class="text-blue-600 font-bold">Generate →</a></div>';
  return pageHead('Key Manager', 'bi-view-list', keys.length + ' keys (max 200 shown)') + msg + bulk + '<div class="space-y-4">' + rows + '</div>';
}

export function arcxRand(len) {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const r = new Uint8Array(len);
  crypto.getRandomValues(r);
  return [...r].map(b => chars[b % 36]).join('');
}
