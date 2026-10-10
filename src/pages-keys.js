import { esc } from './ui.js';
import { tabHead } from './pages-dash.js';

export function keysPage(mundoKeys, bcoreKeys) {
  function card(k, engine) {
    const usedApps = k.bindings.length;
    const totalLimit = k.pkg_limit * k.app_limit;
    const usedPkgs = new Set(k.bindings.map(b => b.pkg_name)).size;
    const binds = k.bindings.length ? '<div class="space-y-2 mb-4">' + k.bindings.map(b =>
      '<div class="clay-card p-3 rounded-2xl"><form method="POST" class="flex flex-wrap gap-2 items-center"><input type="hidden" name="action" value="save_bind"><input type="hidden" name="engine" value="' + engine + '"><input type="hidden" name="key_id" value="' + k.id + '"><input type="hidden" name="bind_id" value="' + b.id + '">'
      + '<input type="text" name="pkg_name" value="' + esc(b.pkg_name) + '" class="clay-card px-3 py-1.5 text-xs font-mono flex-1 rounded-xl" style="min-width:110px"><input type="text" name="app_name" value="' + esc(b.app_name) + '" class="clay-card px-3 py-1.5 text-xs font-mono flex-1 rounded-xl" style="min-width:110px">'
      + '<span class="text-[10px] font-extrabold px-2 py-0.5 rounded-lg ' + (b.is_blocked ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500') + '">' + (b.is_blocked ? 'BLOCKED' : 'ACTIVE') + '</span>'
      + '<button class="clay-card px-2.5 py-1.5 text-xs font-bold text-emerald-600 rounded-xl"><i class="bi bi-check2"></i></button></form>'
      + '<div class="flex gap-3 mt-2 ml-1">'
      + (b.is_blocked
        ? '<button onclick="ca(\'unblock_bind\',' + k.id + ',' + b.id + ',\'' + engine + '\')" class="text-[10px] text-emerald-600 font-bold">Unblock</button>'
        : '<button onclick="ca(\'block_bind\',' + k.id + ',' + b.id + ',\'' + engine + '\')" class="text-[10px] text-amber-600 font-bold">Block</button>')
      + '<button onclick="ca(\'delete_bind\',' + k.id + ',' + b.id + ',\'' + engine + '\')" class="text-[10px] text-red-600 font-bold">Delete</button></div></div>'
    ).join('') + '</div>' : '<p class="text-xs text-slate-400 italic mb-3">No apps bound yet.</p>';
    const addForm = usedApps < totalLimit
      ? '<form method="POST" class="clay-card p-3 flex flex-wrap gap-2 items-center rounded-2xl"><input type="hidden" name="action" value="add_bind"><input type="hidden" name="engine" value="' + engine + '"><input type="hidden" name="key_id" value="' + k.id + '"><input type="text" name="pkg_name" placeholder="pkg_name" required class="clay-card px-3 py-1.5 text-xs font-mono flex-1 rounded-xl" style="min-width:110px"><input type="text" name="app_name" placeholder="app_name" required class="clay-card px-3 py-1.5 text-xs font-mono flex-1 rounded-xl" style="min-width:110px"><button class="btn-premium px-3 py-1.5 rounded-xl text-xs font-bold"><i class="bi bi-plus-lg"></i> Add</button></form>'
      : '<div class="text-[11px] text-amber-600 bg-amber-50 rounded-lg p-2 font-bold text-center">App limit reached (' + totalLimit + ')</div>';
    return '<div class="glass-card overflow-hidden"><div class="p-4 md:p-5">'
      + '<div class="flex items-start justify-between gap-3 mb-3"><div class="flex-1 min-w-0"><div class="flex items-center gap-2 flex-wrap mb-1">'
      + '<span class="text-[10px] font-extrabold px-2 py-0.5 rounded-lg ' + (k.is_blocked ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500') + '">' + (k.is_blocked ? 'BLOCKED' : 'ACTIVE') + '</span>'
      + '<span class="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-purple-50 text-purple-500">' + k.duration_days + 'D</span>'
      + (k.feature1 ? '<span class="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-500">F1</span>' : '')
      + (k.feature2 ? '<span class="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-pink-50 text-pink-500">F2</span>' : '')
      + '</div><p id="kt-' + engine + '-' + k.id + '" class="font-mono text-sm md:text-base font-bold text-slate-800 break-all blur-sm select-none">' + esc(k.sdk_key) + '</p></div>'
      + '<button onclick="document.getElementById(\'pn-' + engine + '-' + k.id + '\').classList.toggle(\'hidden\')" class="text-slate-400"><i class="bi bi-chevron-down"></i></button></div>'
      + '<div class="grid grid-cols-3 gap-2 mb-3"><div class="clay-card p-2 text-center rounded-xl"><p class="text-[10px] text-slate-400 font-bold">PKG</p><p class="text-xs font-black">' + usedPkgs + '/' + k.pkg_limit + '</p></div><div class="clay-card p-2 text-center rounded-xl"><p class="text-[10px] text-slate-400 font-bold">APP</p><p class="text-xs font-black">' + usedApps + '/' + totalLimit + '</p></div><div class="clay-card p-2 text-center rounded-xl"><p class="text-[10px] text-slate-400 font-bold">FREE</p><p class="text-xs font-black text-emerald-600">' + Math.max(0, totalLimit - usedApps) + '</p></div></div>'
      + '<div class="flex flex-wrap gap-2"><button onclick="tb(\'' + engine + '-' + k.id + '\',this)" class="clay-card px-3 py-1.5 text-xs font-bold text-slate-600 rounded-xl"><i class="bi bi-eye"></i> Show</button>'
      + '<button onclick="doCopy(\'' + esc(k.sdk_key) + '\',this)" class="clay-card px-3 py-1.5 text-xs font-bold text-slate-600 rounded-xl"><i class="bi bi-clipboard"></i> Copy</button>'
      + (k.is_blocked
        ? '<button onclick="ca(\'unblock_key\',' + k.id + ',0,\'' + engine + '\')" class="clay-card px-3 py-1.5 text-xs font-bold text-emerald-600 rounded-xl"><i class="bi bi-unlock"></i> Unblock</button>'
        : '<button onclick="ca(\'block_key\',' + k.id + ',0,\'' + engine + '\')" class="clay-card px-3 py-1.5 text-xs font-bold text-amber-600 rounded-xl"><i class="bi bi-lock"></i> Block</button>')
      + '<button onclick="ca(\'delete_key\',' + k.id + ',0,\'' + engine + '\')" class="clay-card px-3 py-1.5 text-xs font-bold text-red-600 rounded-xl"><i class="bi bi-trash"></i> Delete</button></div></div>'
      + '<div id="pn-' + engine + '-' + k.id + '" class="hidden border-t border-white/50 p-4 bg-white/20"><h4 class="text-xs font-extrabold text-slate-500 uppercase mb-3">Bound Packages / Apps</h4>' + binds + addForm + '</div></div>';
  }
  function section(keys, engine) {
    if (!keys.length) return '<div class="glass-card p-10 text-center"><i class="bi bi-inbox text-5xl text-slate-300 mb-3"></i><p class="text-slate-500 text-sm">No ' + engine + ' keys found</p><a href="/sdk/generate" class="inline-block mt-3 btn-premium px-6 py-2.5 rounded-xl text-xs font-bold">Generate Key</a></div>';
    return '<div class="space-y-4">' + keys.map(k => card(k, engine)).join('') + '</div>';
  }
  return '<div class="dual-tab-wrapper" id="keysWrapper">'
    + tabHead('SDK Keys', 'bi-view-list', 'Manage keys & bindings', 'keysTabs', mundoKeys.length, bcoreKeys.length)
    + '<div class="tab-content-panel active" data-tab="mundo">' + section(mundoKeys, 'MUNDO') + '</div>'
    + '<div class="tab-content-panel" data-tab="bcore">' + section(bcoreKeys, 'BCORE') + '</div></div>'
    + '<form id="act" method="POST" style="display:none"><input type="hidden" name="action" id="a-act"><input type="hidden" name="engine" id="a-eng"><input type="hidden" name="key_id" id="a-key"><input type="hidden" name="bind_id" id="a-bind"></form>'
    + '<script>function tb(id,btn){const el=document.getElementById("kt-"+id);if(!el)return;el.classList.toggle("blur-sm");btn.innerHTML=el.classList.contains("blur-sm")?\'<i class="bi bi-eye"></i> Show\':\'<i class="bi bi-eye-slash"></i> Hide\';}'
    + 'function ca(action,key,bind,eng){if(!confirm("Are you sure?"))return;document.getElementById("a-act").value=action;document.getElementById("a-eng").value=eng;document.getElementById("a-key").value=key;document.getElementById("a-bind").value=bind;document.getElementById("act").submit();}</script>';
}
