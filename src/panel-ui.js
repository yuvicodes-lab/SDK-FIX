import { CSS, BASE_JS, esc, navClass } from './ui.js';

export function panelLayout(o) {
  const { title, route, sess, panelName, content, theme } = o;
  const th = theme || 'blue';
  const role = sess.role || 'RESELLER';
  const isOA = role === 'OWNER' || role === 'ADMIN';
  const isOwner = role === 'OWNER';
  const canSeeSdk = sess.id === 1 && role === 'OWNER';
  const initial = esc(String(sess.username || 'U').substring(0, 1).toUpperCase());
  const MGMT = isOA
    ? '<div class="my-4 border-t border-white/30 mx-2"></div><div class="px-3 mb-2 mt-2 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Management</div>'
    + '<a href="/users" class="' + navClass('users', route) + '"><i class="bi bi-people-fill text-lg w-6 text-center"></i><span>User Management</span></a>'
    + (isOwner ? '<a href="/admins" class="' + navClass('admins', route) + '"><i class="bi bi-person-badge-fill text-lg w-6 text-center"></i><span>Admin Manager</span></a>'
    + '<a href="/permissions" class="' + navClass('permissions', route) + '"><i class="bi bi-shield-lock-fill text-lg w-6 text-center"></i><span>Permission</span></a>' : '')
    + '<a href="/referral" class="' + navClass('referral', route) + '"><i class="bi bi-diagram-3-fill text-lg w-6 text-center"></i><span>Referrals</span></a>'
    + '<div class="my-4 border-t border-white/30 mx-2"></div><div class="px-3 mb-2 mt-2 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">System</div>'
    + (isOwner ? '<a href="/aes" class="' + navClass('aes', route) + '"><i class="bi bi-shield-shaded text-lg w-6 text-center"></i><span>API Encryption</span></a>' : '')
    + '<a href="/api-test" class="' + navClass('api-test', route) + '"><i class="bi bi-broadcast text-lg w-6 text-center"></i><span>Live API Tester</span></a>'
    + '<a href="/loader-manager" class="' + navClass('loader-manager', route) + '"><i class="bi bi-box-seam-fill text-lg w-6 text-center"></i><span>Set Mod/Loader</span></a>'
    + '<a href="/server" class="' + navClass('server', route) + '"><i class="bi bi-hdd-fill text-lg w-6 text-center"></i><span>Server &amp; Mod</span></a>'
    : '';
  const SDK = canSeeSdk
    ? '<div class="my-4 border-t border-white/30 mx-2"></div><a href="/sdk" class="' + navClass('sdk', route) + '"><i class="bi bi-boxes text-lg w-6 text-center"></i><span>SDK PANEL</span><i class="bi bi-arrow-right-short text-xl ml-auto"></i></a>'
    : '';
  const TENANT = sess.id === 1
    ? '<div class="my-4 border-t border-white/30 mx-2"></div><a href="/create-panel" class="' + navClass('create-panel', route) + '"><i class="bi bi-server text-lg w-6 text-center"></i><span>New Tenant</span></a>'
    : '';
  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">'
    + '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
    + '<title>' + esc(title) + ' - ' + esc(panelName) + '</title>'
    + '<script src="https://cdn.tailwindcss.com"></script>'
    + '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">'
    + '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">'
    + '<style>' + CSS + '</style></head>'
    + '<body class="flex h-screen overflow-hidden relative" data-theme="' + esc(th) + '">'
    + '<div class="droplet drop-1"></div><div class="droplet drop-2"></div><div class="droplet drop-3"></div><div class="droplet drop-4"></div><div class="droplet drop-5"></div><div class="droplet drop-6"></div><div class="droplet drop-7"></div><div class="droplet drop-8"></div>'
    + '<div id="sidebar-overlay" onclick="toggleSidebar()" class="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 hidden md:hidden"></div>'
    + '<aside id="sidebar" class="w-72 glass-sidebar flex flex-col absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition-transform duration-300 z-50">'
    + '<div class="h-20 flex items-center justify-between px-6 border-b border-white/25"><h1 class="text-lg font-extrabold tracking-tight flex items-center gap-3 truncate"><div class="w-10 h-10 shrink-0 rounded-xl avatar-premium text-white flex items-center justify-center shadow-lg border border-white/50"><i class="bi bi-shield-check text-lg"></i></div><span class="truncate uppercase brand-text">' + esc(panelName) + '</span></h1>'
    + '<button onclick="toggleSidebar()" class="md:hidden text-slate-600 text-2xl"><i class="bi bi-x-lg"></i></button></div>'
    + '<nav class="flex-1 py-6 px-4 overflow-y-auto space-y-1.5">'
    + '<a href="/dashboard" class="' + navClass('dashboard', route) + '"><i class="bi bi-grid-1x2-fill text-lg w-6 text-center"></i><span>Dashboard</span></a>'
    + '<a href="/generate" class="' + navClass('generate', route) + '"><i class="bi bi-key-fill text-lg w-6 text-center"></i><span>Generate Keys</span></a>'
    + '<a href="/keys" class="' + navClass('keys', route) + '"><i class="bi bi-view-list text-lg w-6 text-center"></i><span>Key Manager</span></a>'
    + MGMT + SDK + TENANT
    + '<div class="my-4 border-t border-white/30 mx-2"></div><a href="/settings" class="' + navClass('settings', route) + '"><i class="bi bi-gear-fill text-lg w-6 text-center"></i><span>Settings</span></a>'
    + '</nav><div class="p-4 border-t border-white/25"><div class="glass-card p-3 text-center"><p class="text-[10px] font-extrabold text-blue-800 uppercase tracking-wider">iOS Glass Panel</p><p class="text-[9px] text-slate-600 mt-0.5">Worker Edition</p></div></div></aside>'
    + '<div class="flex-1 flex flex-col h-screen overflow-y-auto relative w-full z-10">'
    + '<header class="h-16 md:h-20 glass-header sticky top-0 z-30 flex items-center justify-between px-4 lg:px-10">'
    + '<div class="flex items-center gap-3 z-10 w-1/4"><button onclick="toggleSidebar()" class="md:hidden text-slate-600 bg-white/30 p-2.5 rounded-xl border border-white/50 shadow-sm"><i class="bi bi-list text-2xl"></i></button>'
    + '<div class="hidden md:flex flex-col"><span class="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Workspace ID</span><h2 class="font-bold text-slate-700 text-[15px]"><span class="bg-white/35 text-blue-700 px-3 py-1 rounded-lg border border-white/50 font-mono text-sm shadow-sm">' + esc(sess.panel_code || '') + '</span></h2></div></div>'
    + '<div class="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center z-0 w-1/2 max-w-[200px] md:max-w-xs text-center"><h2 class="text-base md:text-xl font-black tracking-[0.1em] uppercase truncate w-full"><span class="brand-text">' + esc(panelName) + '</span></h2><div class="h-1 w-10 md:w-14 rounded-full mt-1 mx-auto avatar-premium"></div></div>'
    + '<div class="flex items-center justify-end gap-3 z-10 w-1/4"><div class="hidden sm:flex flex-col items-end mr-1"><span class="text-sm font-bold text-slate-800">' + esc(sess.username) + '</span><span class="text-[10px] font-extrabold tracking-widest text-blue-700 uppercase">' + esc(role) + '</span></div>'
    + '<div class="relative group"><div class="w-11 h-11 rounded-2xl avatar-premium text-white flex items-center justify-center font-bold text-lg border-2 border-white/80 cursor-pointer">' + initial + '</div>'
    + '<div class="absolute right-0 mt-3 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all rounded-3xl overflow-hidden" style="background:rgba(255,255,255,0.15);backdrop-filter:blur(30px);border:1px solid rgba(255,255,255,0.5);"><div class="p-3"><div class="px-4 py-3 border-b border-white/40 mb-2"><p class="font-bold text-slate-800 text-sm">' + esc(sess.username) + '</p><p class="text-xs text-slate-600">' + esc(sess.panel_code || '') + '</p></div>'
    + '<a href="/settings" class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-white/40 rounded-xl font-medium"><i class="bi bi-gear"></i> Settings</a>'
    + '<div class="border-t border-white/40 my-2"></div><a href="/logout" class="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50/40 rounded-xl font-medium"><i class="bi bi-box-arrow-right"></i> Sign Out</a>'
    + '</div></div></div></div></header>'
    + '<main class="p-4 md:p-8 lg:p-10 pb-20 relative z-10">' + content + '</main></div>'
    + '<script>' + BASE_JS + '</script></body></html>';
}

export function pageHead(title, icon, sub) {
  return '<div class="mb-6"><h1 class="text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-3"><i class="bi ' + icon + ' text-emerald-500"></i> ' + title + '</h1><p class="text-slate-500 text-sm mt-1">' + sub + '</p></div>';
}

export function alertBox(kind, title, msg) {
  const c = kind === 'ok' ? ['#10b981', 'emerald'] : kind === 'warn' ? ['#f59e0b', 'amber'] : ['#ef4444', 'red'];
  return '<div class="glass-card p-4 mb-6 flex items-start gap-3" style="border-left:4px solid ' + c[0] + '"><div class="flex-1"><p class="font-bold text-' + c[1] + '-700 text-sm">' + title + '</p><p class="text-xs text-slate-600 mt-0.5 break-all">' + msg + '</p></div></div>';
}
