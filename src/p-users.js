import { esc } from './ui.js';
import { pageHead, alertBox } from './panel-ui.js';

export function usersPage(sess, list, o) {
  const msg = o.ok ? alertBox('ok', 'Done', esc(o.ok)) : o.error ? alertBox('err', 'Error', esc(o.error)) : '';
  const rows = list.map(u =>
    '<div class="glass-card p-4"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-bold">' + esc(u.username.substring(0, 1).toUpperCase()) + '</div>'
    + '<div class="flex-1 min-w-0"><p class="font-bold text-sm truncate">' + esc(u.username) + ' <span class="text-[10px] px-1.5 py-0.5 rounded ' + (u.is_blocked ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500') + '">' + esc(u.role) + (u.is_blocked ? ' • BLOCKED' : '') + '</span></p><p class="text-[11px] text-slate-500">Bal Rs ' + (u.balance | 0) + (u.invited ? ' • inv by ' + esc(u.invited) : '') + '</p></div></div>'
    + '<form method="POST" class="flex flex-wrap gap-2 mt-3 items-center"><input type="hidden" name="target_id" value="' + u.id + '">'
    + '<input type="number" name="amount" placeholder="Amt" class="clay-card px-2 py-1.5 text-xs w-24 rounded-xl">'
    + '<button name="action" value="add_balance" class="clay-card px-3 py-1.5 text-xs font-bold text-emerald-600 rounded-xl">+Bal</button>'
    + '<button name="action" value="deduct_balance" class="clay-card px-3 py-1.5 text-xs font-bold text-amber-600 rounded-xl">−Bal</button>'
    + '<button name="action" value="toggle_block" class="clay-card px-3 py-1.5 text-xs font-bold ' + (u.is_blocked ? 'text-emerald-600' : 'text-red-600') + ' rounded-xl">' + (u.is_blocked ? 'Unblock' : 'Block') + '</button></form></div>'
  ).join('');
  return pageHead('User Management', 'bi-people-fill', list.length + ' users') + msg + '<div class="space-y-3">' + (rows || '<div class="glass-card p-8 text-center text-sm text-slate-400">No users</div>') + '</div>';
}

export function adminsPage(list, viewUser, viewKeys, o) {
  const msg = o.ok ? alertBox('ok', 'Done', esc(o.ok)) : '';
  if (viewUser) {
    const rows = viewKeys.map(k => '<div class="clay-card p-3 flex items-center gap-2 rounded-2xl"><code class="flex-1 font-mono text-xs font-bold break-all">' + esc(k.key_value) + '</code><span class="text-[10px] font-bold ' + (k.is_blocked ? 'text-red-500' : 'text-emerald-500') + '">' + (k.is_blocked ? 'BLOCKED' : 'ACTIVE') + '</span><form method="POST" class="inline"><input type="hidden" name="target_user_id" value="' + viewUser.id + '"><input type="hidden" name="key_id" value="' + k.id + '"><button name="action" value="toggle_key_block" class="text-[11px] font-bold text-amber-600">Block/Unblock</button> <button name="action" value="delete_key" onclick="return confirm(\'Delete?\')" class="text-[11px] font-bold text-red-600">Del</button></form></div>').join('');
    return pageHead('Keys of ' + viewUser.username, 'bi-person-badge-fill', viewKeys.length + ' keys') + msg + '<a href="/admins" class="text-xs font-bold text-blue-600">← Back</a><div class="space-y-2 mt-3">' + (rows || 'No keys') + '</div>';
  }
  const rows = list.map(u => '<a href="/admins?view_keys=' + u.id + '" class="glass-card p-4 flex items-center gap-3"><div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center font-bold">' + esc(u.username.substring(0, 1).toUpperCase()) + '</div><div class="flex-1"><p class="font-bold text-sm">' + esc(u.username) + ' <span class="text-[10px] text-slate-400">' + esc(u.role) + '</span></p><p class="text-[11px] text-slate-500">' + (u.total_keys | 0) + ' keys</p></div><i class="bi bi-chevron-right text-slate-400"></i></a>').join('');
  return pageHead('Admin Manager', 'bi-person-badge-fill', list.length + ' admins/resellers') + msg + '<div class="space-y-3">' + (rows || 'Nobody yet') + '</div>';
}

export function permissionsPage(list, o) {
  const msg = o.ok ? alertBox('ok', 'Done', esc(o.ok)) : '';
  const rows = list.map(u => '<div class="glass-card p-4"><p class="font-bold text-sm">' + esc(u.username) + ' <span class="text-[10px] text-slate-400">' + esc(u.role) + '</span></p>'
    + '<p class="text-[11px] text-slate-500">Referral: ' + ((u.can_generate_referral | 0) ? 'ON' : 'OFF') + ' • Limit: ' + ((u.referral_limit | 0) || 'unlimited') + '</p>'
    + '<form method="POST" class="flex flex-wrap gap-2 mt-2 items-center"><input type="hidden" name="target_id" value="' + u.id + '"><input type="number" name="ref_limit" min="0" value="' + (u.referral_limit | 0) + '" class="clay-card px-2 py-1.5 text-xs w-24 rounded-xl"><button name="action" value="update_limit" class="clay-card px-3 py-1.5 text-xs font-bold rounded-xl">Set Limit</button><button name="action" value="toggle_ref" class="clay-card px-3 py-1.5 text-xs font-bold rounded-xl">ON/OFF Referral</button></form></div>').join('');
  return pageHead('Permission', 'bi-shield-lock-fill', 'Referral rights') + msg + '<div class="space-y-3">' + (rows || 'Nobody') + '</div>';
}

export function referralPage(sess, list, o) {
  const isOwner = sess.role === 'OWNER';
  const msg = o.ok ? alertBox('ok', 'Referral Generated!', '<code class="font-mono">' + esc(o.ok) + '</code> <button onclick="doCopy(\'' + esc(o.ok) + '\',this)" class="underline">Copy</button>') : o.error ? alertBox('err', 'Error', esc(o.error)) : '';
  const rows = list.map(r => '<div class="clay-card p-3 rounded-2xl flex items-center gap-2"><code class="font-mono text-xs font-bold">' + esc(r.code) + '</code><div class="flex-1 text-[11px] text-slate-500">' + esc(r.role) + ' • ' + r.duration + 'd • Rs' + r.balance + (r.used ? ' • <span class="text-red-500 font-bold">USED</span>' : ' • <span class="text-emerald-500 font-bold">FRESH</span>') + '</div><form method="POST" onsubmit="return confirm(\'Delete?\')"><input type="hidden" name="del_code" value="' + esc(r.code) + '"><button name="action" value="delete_ref" class="text-red-500 text-xs"><i class="bi bi-trash"></i></button></form></div>').join('');
  return pageHead('Referrals', 'bi-diagram-3-fill', list.length + ' codes') + msg
    + '<form method="POST" class="glass-card p-5 mb-5"><input type="hidden" name="action" value="generate"><div class="grid grid-cols-3 gap-2"><select name="role" class="clay-card px-3 py-2.5 text-xs font-bold rounded-xl">' + (isOwner ? '<option>ADMIN</option>' : '') + '<option selected>RESELLER</option></select><input type="number" name="duration" value="30" min="1" title="days" class="clay-card px-3 py-2.5 text-xs rounded-xl"><input type="number" name="balance" value="0" min="0" title="balance" class="clay-card px-3 py-2.5 text-xs rounded-xl"></div><button class="btn-premium w-full py-3 rounded-xl text-xs font-bold mt-3">Generate Referral</button></form>'
    + '<div class="space-y-2">' + (rows || '<div class="glass-card p-8 text-center text-sm text-slate-400">No referrals</div>') + '</div>';
}
