import { esc } from './ui.js';

export function tabHead(title, icon, sub, tabsId, mundoCount, bcoreCount) {
  return '<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"><div>'
    + '<h1 class="text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-3"><i class="bi ' + icon + ' text-emerald-500"></i> ' + title + '</h1>'
    + '<p class="text-slate-500 text-sm mt-1">' + sub + '</p></div>'
    + '<div class="dual-tab-container" id="' + tabsId + '">'
    + '<button class="dual-tab-btn active-mundo" data-tab="mundo" onclick="switchDualTab(\'' + tabsId + '\',\'mundo\')"><i class="bi bi-cpu mr-1"></i> MUNDO' + (mundoCount != null ? ' (' + mundoCount + ')' : '') + '</button>'
    + '<button class="dual-tab-btn" data-tab="bcore" onclick="switchDualTab(\'' + tabsId + '\',\'bcore\')"><i class="bi bi-lightning-charge-fill mr-1"></i> BCORE' + (bcoreCount != null ? ' (' + bcoreCount + ')' : '') + '</button>'
    + '</div></div>';
}

export function statCards(total, active, blocked, pkgs, accent) {
  return '<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">'
    + '<div class="glass-card p-4 md:p-5"><div class="flex items-center justify-between mb-3"><div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-lg"><i class="bi bi-key-fill"></i></div><span class="text-[10px] font-extrabold text-purple-500 bg-purple-50 px-2 py-1 rounded-lg uppercase">Total</span></div><p class="text-2xl md:text-3xl font-black text-slate-800">' + total + '</p><p class="text-[11px] text-slate-500 font-medium mt-1">' + accent + ' Keys</p></div>'
    + '<div class="glass-card p-4 md:p-5"><div class="flex items-center justify-between mb-3"><div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg"><i class="bi bi-check-circle-fill"></i></div><span class="text-[10px] font-extrabold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg uppercase">Active</span></div><p class="text-2xl md:text-3xl font-black text-slate-800">' + active + '</p><p class="text-[11px] text-slate-500 font-medium mt-1">Active</p></div>'
    + '<div class="glass-card p-4 md:p-5"><div class="flex items-center justify-between mb-3"><div class="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white shadow-lg"><i class="bi bi-x-circle-fill"></i></div><span class="text-[10px] font-extrabold text-red-500 bg-red-50 px-2 py-1 rounded-lg uppercase">Blocked</span></div><p class="text-2xl md:text-3xl font-black text-slate-800">' + blocked + '</p><p class="text-[11px] text-slate-500 font-medium mt-1">Blocked</p></div>'
    + '<div class="glass-card p-4 md:p-5"><div class="flex items-center justify-between mb-3"><div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg"><i class="bi bi-box-seam-fill"></i></div><span class="text-[10px] font-extrabold text-amber-500 bg-amber-50 px-2 py-1 rounded-lg uppercase">Bind</span></div><p class="text-2xl md:text-3xl font-black text-slate-800">' + pkgs + '</p><p class="text-[11px] text-slate-500 font-medium mt-1">Packages Bound</p></div></div>';
}

export function recentList(keys, engine) {
  if (!keys.length) return '<div class="text-center py-10 text-slate-400"><i class="bi bi-inbox text-5xl mb-3 opacity-40"></i><p class="text-sm">No ' + engine + ' keys yet</p><a href="/sdk/generate" class="inline-block mt-3 text-xs font-bold text-purple-600 hover:underline">Generate First Key →</a></div>';
  return '<div class="space-y-2">' + keys.map(k =>
    '<div class="clay-card p-3 flex items-center justify-between gap-3 rounded-2xl"><div class="min-w-0 flex-1"><p class="font-mono text-xs md:text-sm font-bold text-slate-700 truncate">' + esc(k.sdk_key) + '</p><p class="text-[10px] text-slate-400 mt-0.5">' + k.pkg_limit + ' Pkg • ' + k.app_limit + ' App • ' + k.duration_days + ' Days</p></div>'
    + '<span class="text-[10px] font-extrabold px-2 py-1 rounded-lg ' + (k.is_blocked ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500') + '">' + (k.is_blocked ? 'BLOCKED' : 'ACTIVE') + '</span></div>'
  ).join('') + '</div>';
}

export function dashboardPage(d) {
  return '<div class="dual-tab-wrapper" id="dashboardWrapper">'
    + tabHead('SDK Dashboard', 'bi-speedometer2', 'Overview of all SDK keys & bindings', 'dashboardTabsWrap')
    + '<div class="tab-content-panel active" data-tab="mundo">' + statCards(d.mTotal, d.mActive, d.mBlocked, d.mPkgs, 'MUNDO')
    + '<div class="glass-card p-5 md:p-6"><h3 class="font-bold text-slate-800 mb-4"><i class="bi bi-clock-history text-purple-500"></i> Recent MUNDO Keys</h3>' + recentList(d.recentM, 'MUNDO') + '</div></div>'
    + '<div class="tab-content-panel" data-tab="bcore">' + statCards(d.bTotal, d.bActive, d.bBlocked, d.bPkgs, 'BCORE')
    + '<div class="glass-card p-5 md:p-6"><h3 class="font-bold text-slate-800 mb-4"><i class="bi bi-clock-history text-amber-500"></i> Recent BCORE Keys</h3>' + recentList(d.recentB, 'BCORE') + '</div></div></div>';
}

export function generatePage(o) {
  const ok = o.success ? '<div class="glass-card p-4 mb-6 border-l-4 border-emerald-500 flex items-start gap-3" style="border-left:4px solid #10b981"><i class="bi bi-check-circle-fill text-emerald-500 text-xl"></i><div class="flex-1 min-w-0"><p class="font-bold text-emerald-700 text-sm">Success!</p><p class="text-xs text-slate-600 mt-0.5 break-all">' + esc(o.success) + '</p></div></div>' : '';
  const err = o.error ? '<div class="glass-card p-4 mb-6 flex items-start gap-3" style="border-left:4px solid #ef4444"><i class="bi bi-exclamation-circle-fill text-red-500 text-xl"></i><div class="flex-1"><p class="font-bold text-red-700 text-sm">Error</p><p class="text-xs text-slate-600 mt-0.5">' + esc(o.error) + '</p></div></div>' : '';
  function form(engine, color, icon, infoBg, infoTx) {
    return '<div class="tab-content-panel' + (engine === 'MUNDO' ? ' active' : '') + '" data-tab="' + engine.toLowerCase() + '">'
      + '<form method="POST" class="glass-card p-5 md:p-7"><input type="hidden" name="engine" value="' + engine + '">'
      + '<div class="flex items-center gap-3 mb-6 pb-4 border-b border-white/50"><div class="w-12 h-12 rounded-2xl bg-gradient-to-br ' + color + ' flex items-center justify-center text-white shadow-lg"><i class="bi ' + icon + ' text-xl"></i></div><div><h3 class="font-black text-slate-800">' + engine + ' Engine</h3><p class="text-xs text-slate-500">Generate key for ' + engine + ' SDK</p></div></div>'
      + '<div class="space-y-5"><div><label class="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">SDK Key <span class="text-slate-400 font-medium normal-case">(empty = auto 16 char)</span></label>'
      + '<input type="text" name="sdk_key" maxlength="100" placeholder="Leave empty for random 16-character key" class="w-full clay-card px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-2xl"></div>'
      + '<div><label class="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">Duration</label><select name="duration" class="w-full clay-card custom-select px-4 py-3 text-sm font-semibold rounded-2xl"><option value="7">7 Days</option><option value="15">15 Days</option><option value="30" selected>30 Days</option><option value="60">60 Days</option></select></div>'
      + '<div class="grid grid-cols-2 gap-3"><div><label class="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">Pkg Limit</label><input type="number" name="pkg_limit" min="1" max="10" value="1" class="w-full clay-card px-4 py-3 text-sm font-bold text-center rounded-2xl"></div>'
      + '<div><label class="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">App Limit</label><input type="number" name="app_limit" min="1" max="20" value="1" class="w-full clay-card px-4 py-3 text-sm font-bold text-center rounded-2xl"></div></div>'
      + '<div class="rounded-2xl p-3 text-[11px] ' + infoBg + ' ' + infoTx + ' border"><i class="bi bi-info-circle-fill mr-1"></i><strong>Rule:</strong> Total apps = Pkg Limit x App Limit.</div>'
      + '<div><label class="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">Features</label><div class="grid grid-cols-2 gap-3"><label class="feature-card checked"><input type="checkbox" name="feature1" checked onchange="toggleFeature(this)"><span class="text-sm font-bold text-slate-700">F1</span></label><label class="feature-card checked"><input type="checkbox" name="feature2" checked onchange="toggleFeature(this)"><span class="text-sm font-bold text-slate-700">F2</span></label></div></div>'
      + '<button type="submit" class="btn-premium w-full py-4 rounded-2xl font-extrabold text-sm uppercase tracking-wider"><i class="bi bi-magic"></i> Generate ' + engine + ' Key</button>'
      + '</div></form></div>';
  }
  return '<div class="dual-tab-wrapper" id="generateWrapper">'
    + tabHead('Generate SDK', 'bi-key-fill', 'Create new SDK keys for MUNDO or BCORE', 'generateTabs')
    + ok + err
    + form('MUNDO', 'from-blue-500 to-blue-700', 'bi-cpu', 'bg-purple-50/70', 'text-purple-700')
    + form('BCORE', 'from-amber-500 to-orange-500', 'bi-lightning-charge-fill', 'bg-amber-50/70', 'text-amber-700')
    + '</div><script>function toggleFeature(cb){const c=cb.closest(".feature-card");if(cb.checked)c.classList.add("checked");else c.classList.remove("checked");}</script>';
}
