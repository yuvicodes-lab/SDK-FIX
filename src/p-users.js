import { esc } from './ui.js';
import { pageHead, alertBox } from './panel-ui.js';

function hero(icon, title, sub, extra) {
  return '<div class="relative mb-6 overflow-hidden rounded-3xl p-6 md:p-8 avatar-premium">'
    + '<div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[70px]"></div>'
    + '<div class="relative z-10 flex items-center justify-between gap-4"><div class="flex items-center gap-4 min-w-0"><div class="w-14 h-14 shrink-0 rounded-2xl bg-white/20 border border-white/30 text-white flex items-center justify-center text-2xl"><i class="bi ' + icon + '"></i></div>'
    + '<div class="min-w-0"><h1 class="text-2xl md:text-3xl font-black text-white truncate">' + title + '</h1><p class="text-white/80 text-xs md:text-sm font-medium">' + sub + '</p></div></div>'
    + (extra || '') + '</div></div>';
}
const NSTEP = '<script>function nstep(id,d,mn,mx){var e=document.getElementById(id);if(!e)return;var v=(parseInt(e.value||mn,10)||mn)+d;v=Math.max(mn,Math.min(mx,v));e.value=v;}</script>';

export function usersPage(sess, list, o) {
  const msg = o.ok ? alertBox('ok', 'Done', esc(o.ok)) : o.error ? alertBox('err', 'Error', esc(o.error)) : '';
  const rows = list.map(u =>
    '<div class="glass-card p-4 md:p-5 relative overflow-hidden"><div class="absolute top-0 left-0 right-0 h-1 avatar-premium"></div>'
    + '<div class="flex items-center gap-3"><div class="w-12 h-12 rounded-2xl avatar-premium text-white flex items-center justify-center font-black text-lg shrink-0">' + esc(u.username.substring(0, 1).toUpperCase()) + '</div>'
    + '<div class="flex-1 min-w-0"><p class="font-black text-sm truncate">' + esc(u.username) + '</p><div class="flex gap-1.5 mt-1.5 flex-wrap">'
    + '<span class="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600">' + esc(u.role) + '</span>'
    + (u.is_blocked ? '<span class="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-red-50 text-red-500">BLOCKED</span>' : '<span class="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-500">ACTIVE</span>')
    + '<span class="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-amber-50 text-amber-600"><i class="bi bi-wallet2 mr-0.5"></i>Rs ' + (u.balance | 0) + '</span></div></div></div>'
    + (u.invited ? '<p class="text-[11px] text-slate-500 mt-2"><i class="bi bi-person-plus mr-1"></i>invited by <b>' + esc(u.invited) + '</b></p>' : '')
    + '<form method="POST" class="flex flex-wrap gap-2 mt-3 items-center"><input type="hidden" name="target_id" value="' + u.id + '">'
    + '<div class="inp-icon"><i class="bi bi-cash"></i><input type="number" name="amount" placeholder="Amount" class="clay-card px-3 py-2 text-xs w-28 rounded-xl"></div>'
    + '<button name="action" value="add_balance" class="clay-card px-3 py-2 text-xs font-extrabold text-emerald-600 rounded-xl"><i class="bi bi-plus-lg"></i> Balance</button>'
    + '<button name="action" value="deduct_balance" class="clay-card px-3 py-2 text-xs font-extrabold text-amber-600 rounded-xl"><i class="bi bi-dash-lg"></i> Balance</button>'
    + '<button name="action" value="toggle_block" class="clay-card px-3 py-2 text-xs font-extrabold ' + (u.is_blocked ? 'text-emerald-600' : 'text-red-600') + ' rounded-xl"><i class="bi ' + (u.is_blocked ? 'bi-unlock' : 'bi-lock') + '"></i> ' + (u.is_blocked ? 'Unblock' : 'Block') + '</button></form></div>'
  ).join('');
  return hero('bi-people-fill', 'User Management', list.length + ' users • balance + block control', '') + msg + '<div class="grid grid-cols-1 md:grid-cols-2 gap-3">' + (rows || '<div class="glass-card p-8 text-center text-sm text-slate-400">No users</div>') + '</div>';
}

export function adminsPage(list, viewUser, viewKeys, o) {
  const msg = o.ok ? alertBox('ok', 'Done', esc(o.ok)) : '';
  if (viewUser) {
    const rows = viewKeys.map(k => '<div class="clay-card p-3 rounded-2xl flex items-center gap-2"><code class="flex-1 font-mono text-xs font-bold break-all min-w-0">' + esc(k.key_value) + '</code><span class="text-[10px] font-extrabold shrink-0 ' + (k.is_blocked ? 'text-red-500' : 'text-emerald-500') + '">' + (k.is_blocked ? 'BLOCKED' : 'ACTIVE') + '</span><form method="POST" class="inline shrink-0"><input type="hidden" name="target_user_id" value="' + viewUser.id + '"><input type="hidden" name="key_id" value="' + k.id + '"><button name="action" value="toggle_key_block" title="Block/Unblock" class="w-8 h-8 rounded-xl clay-card text-amber-600 text-xs"><i class="bi bi-lock"></i></button> <button name="action" value="delete_key" onclick="return confirm(\'Delete key?\')" title="Delete" class="w-8 h-8 rounded-xl clay-card text-red-500 text-xs"><i class="bi bi-trash"></i></button></form></div>').join('');
    return hero('bi-person-badge-fill', esc(viewUser.username), viewKeys.length + ' keys', '<a href="/admins" class="shrink-0 px-4 py-2.5 rounded-xl bg-white/20 border border-white/30 text-white text-xs font-extrabold">← Back</a>') + msg + '<div class="space-y-2">' + (rows || '<div class="glass-card p-8 text-center text-sm text-slate-400">No keys</div>') + '</div>';
  }
  const rows = list.map(u => '<a href="/admins?view_keys=' + u.id + '" class="glass-card p-4 md:p-5 flex items-center gap-3 relative overflow-hidden"><div class="absolute top-0 left-0 right-0 h-1 avatar-premium"></div><div class="w-12 h-12 rounded-2xl avatar-premium text-white flex items-center justify-center font-black text-lg shrink-0">' + esc(u.username.substring(0, 1).toUpperCase()) + '</div><div class="flex-1 min-w-0"><p class="font-black text-sm truncate">' + esc(u.username) + '</p><p class="text-[11px] text-slate-500 mt-0.5"><span class="font-extrabold text-slate-600">' + esc(u.role) + '</span> • ' + (u.total_keys | 0) + ' keys</p></div><span class="btn-premium px-4 py-2 rounded-xl text-[11px] font-extrabold shrink-0">Keys <i class="bi bi-chevron-right"></i></span></a>').join('');
  return hero('bi-person-badge-fill', 'Admin Manager', list.length + ' admins / resellers — tap to see keys', '') + msg + '<div class="grid grid-cols-1 md:grid-cols-2 gap-3">' + (rows || '<div class="glass-card p-8 text-center text-sm text-slate-400">Nobody yet</div>') + '</div>';
}

export function permissionsPage(list, o) {
  const msg = o.ok ? alertBox('ok', 'Done', esc(o.ok)) : '';
  const rows = list.map(u => '<div class="glass-card p-4 md:p-5 relative overflow-hidden"><div class="absolute top-0 left-0 right-0 h-1 avatar-premium"></div>'
    + '<div class="flex items-center gap-3"><div class="w-11 h-11 rounded-2xl avatar-premium text-white flex items-center justify-center font-black shrink-0">' + esc(u.username.substring(0, 1).toUpperCase()) + '</div>'
    + '<div class="flex-1 min-w-0"><p class="font-black text-sm truncate">' + esc(u.username) + ' <span class="text-[10px] font-bold text-slate-400">' + esc(u.role) + '</span></p>'
    + '<div class="flex gap-1.5 mt-1.5"><span class="text-[10px] font-extrabold px-2 py-0.5 rounded-lg ' + ((u.can_generate_referral | 0) ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400') + '">Referral ' + ((u.can_generate_referral | 0) ? 'ON' : 'OFF') + '</span><span class="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600">Limit: ' + ((u.referral_limit | 0) || '∞') + '</span></div></div>'
    + '<form method="POST" class="shrink-0"><input type="hidden" name="target_id" value="' + u.id + '"><input type="hidden" name="action" value="toggle_ref"><label class="sw"><input type="checkbox"' + ((u.can_generate_referral | 0) ? ' checked' : '') + ' onchange="this.form.submit()"><span class="tr"></span></label></form></div>'
    + '<form method="POST" class="flex gap-2 mt-3 items-center"><input type="hidden" name="target_id" value="' + u.id + '"><input type="hidden" name="action" value="update_limit"><div class="stepper clay-card px-2 rounded-xl"><button type="button" class="font-black px-2" onclick="nstep(\'rl-' + u.id + '\',-1,0,9999)">−</button><input type="number" id="rl-' + u.id + '" name="ref_limit" min="0" max="9999" value="' + (u.referral_limit | 0) + '" class="w-16 text-center font-black bg-transparent focus:outline-none"><button type="button" class="font-black px-2" onclick="nstep(\'rl-' + u.id + '\',1,0,9999)">+</button></div><span class="text-[11px] text-slate-400 font-bold">0 = ∞</span><button class="btn-premium px-4 py-2 rounded-xl text-xs font-extrabold ml-auto">Set Limit</button></form></div>').join('');
  return hero('bi-shield-lock-fill', 'Permissions', 'Referral rights • 0 = unlimited', '') + msg + '<div class="grid grid-cols-1 md:grid-cols-2 gap-3">' + (rows || '<div class="glass-card p-8 text-center text-sm text-slate-400">Nobody</div>') + '</div>' + NSTEP;
}

export function referralPage(sess, list, o) {
  const isOwner = sess.role === 'OWNER';
  const msg = o.ok ? alertBox('ok', 'Referral Generated!', '<code class="font-mono font-black">' + esc(o.ok) + '</code> <button onclick="doCopy(\'' + esc(o.ok) + '\',this)" class="underline font-bold">Copy</button>') : o.error ? alertBox('err', 'Error', esc(o.error)) : '';
  const rows = list.map(r => '<div class="clay-card p-3.5 rounded-2xl"><div class="flex items-center gap-2"><code class="flex-1 font-mono text-sm font-black min-w-0 break-all">' + esc(r.code) + '</code><button type="button" onclick="doCopy(\'' + esc(r.code) + '\',this)" title="Copy" class="clay-card w-9 h-9 rounded-xl text-slate-500 shrink-0"><i class="bi bi-clipboard"></i></button><form method="POST" onsubmit="return confirm(\'Delete?\')" class="shrink-0"><input type="hidden" name="del_code" value="' + esc(r.code) + '"><button name="action" value="delete_ref" title="Delete" class="clay-card w-9 h-9 rounded-xl text-red-500"><i class="bi bi-trash"></i></button></form></div>'
    + '<div class="flex gap-1.5 mt-2 flex-wrap"><span class="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600">' + esc(r.role) + '</span><span class="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-purple-50 text-purple-600">' + r.duration + ' days</span><span class="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-amber-50 text-amber-600">Rs ' + r.balance + '</span>' + (r.used ? '<span class="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-red-50 text-red-500">USED</span>' : '<span class="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-500">FRESH</span>') + '</div></div>').join('');
  return hero('bi-diagram-3-fill', 'Referrals', list.length + ' codes • role + validity + balance', '') + msg
    + '<form method="POST" class="glass-card p-5 md:p-6 mb-4 relative overflow-hidden"><input type="hidden" name="action" value="generate"><div class="absolute top-0 left-0 right-0 h-1 avatar-premium"></div>'
    + '<h3 class="font-black mb-3"><i class="bi bi-plus-circle mr-1"></i>Generate Referral Code</h3><div class="grid grid-cols-3 gap-2">'
    + '<div><label class="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">Role</label><select name="role" class="w-full clay-card custom-select px-3 py-2.5 text-xs font-extrabold rounded-xl">' + (isOwner ? '<option>ADMIN</option>' : '') + '<option selected>RESELLER</option></select></div>'
    + '<div><label class="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">Days</label><div class="stepper clay-card px-1 rounded-xl"><button type="button" class="font-black px-1.5" onclick="nstep(\'rf-d\',-1,1,3650)">−</button><input type="number" id="rf-d" name="duration" value="30" min="1" max="3650" class="w-12 text-center font-black bg-transparent focus:outline-none text-sm"><button type="button" class="font-black px-1.5" onclick="nstep(\'rf-d\',1,1,3650)">+</button></div></div>'
    + '<div><label class="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">Balance Rs</label><input type="number" name="balance" value="0" min="0" class="w-full clay-card px-3 py-2.5 text-xs font-bold rounded-xl"></div></div>'
    + '<button class="btn-premium w-full py-3.5 rounded-2xl text-xs font-extrabold uppercase mt-3"><i class="bi bi-magic"></i> Generate Code</button></form>'
    + '<div class="grid grid-cols-1 md:grid-cols-2 gap-3">' + (rows || '<div class="glass-card p-8 text-center text-sm text-slate-400">No referrals yet</div>') + '</div>' + NSTEP;
}
