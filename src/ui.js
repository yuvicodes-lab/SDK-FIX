export function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function navClass(path, cur) {
  const base = 'nav-glass-item relative flex items-center gap-3 px-4 py-3 rounded-2xl font-medium mb-1.5 ';
  return base + (path === cur ? 'nav-active text-white font-semibold' : 'text-slate-700');
}

export const CSS = `
*{ -webkit-tap-highlight-color: transparent; }
html,body{height:100%;}
body{background:linear-gradient(135deg,#c7d9f5 0%,#b3cdf0 25%,#cfe0f5 50%,#bdd3f0 75%,#c7d9f5 100%);background-size:300% 300%;animation:gradientShift 20s ease infinite;background-attachment:fixed;position:relative;overflow-x:hidden;color:#1e293b;}
@keyframes gradientShift{0%{background-position:0% 50%;}50%{background-position:100% 50%;}100%{background-position:0% 50%;}}
body::before{content:'';position:fixed;top:-50%;left:-50%;width:200%;height:200%;background:radial-gradient(circle at 25% 30%,rgba(255,255,255,0.75) 0%,transparent 45%),radial-gradient(circle at 75% 60%,rgba(147,197,253,0.5) 0%,transparent 50%),radial-gradient(circle at 50% 85%,rgba(96,165,250,0.3) 0%,transparent 50%),radial-gradient(circle at 15% 75%,rgba(191,219,254,0.6) 0%,transparent 45%);animation:auroraMove 22s ease-in-out infinite alternate;z-index:0;pointer-events:none;}
@keyframes auroraMove{0%{transform:translate(0,0) rotate(0deg) scale(1);}50%{transform:translate(-4%,4%) rotate(3deg) scale(1.05);}100%{transform:translate(4%,-4%) rotate(-3deg) scale(1);}}
.droplet{position:fixed;border-radius:50%;background:radial-gradient(circle at 30% 25%,rgba(255,255,255,0.98) 0%,rgba(255,255,255,0.6) 15%,rgba(191,219,254,0.45) 40%,rgba(96,165,250,0.2) 70%,transparent 100%);box-shadow:inset -3px -3px 8px rgba(255,255,255,0.9),inset 3px 3px 10px rgba(59,130,246,0.18),0 10px 30px rgba(59,130,246,0.22);backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);pointer-events:none;z-index:1;opacity:0.8;}
.droplet::after{content:'';position:absolute;top:12%;left:20%;width:25%;height:25%;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,0.98),transparent 70%);}
.drop-1{width:90px;height:90px;top:12%;left:6%;animation:float1 14s ease-in-out infinite;}
.drop-2{width:55px;height:55px;top:65%;left:12%;animation:float2 11s ease-in-out infinite;}
.drop-3{width:120px;height:120px;top:40%;right:5%;animation:float3 16s ease-in-out infinite;}
.drop-4{width:45px;height:45px;top:82%;right:18%;animation:float1 9s ease-in-out infinite;}
.drop-5{width:70px;height:70px;top:8%;right:30%;animation:float2 13s ease-in-out infinite;}
.drop-6{width:35px;height:35px;top:30%;left:45%;animation:float3 10s ease-in-out infinite;}
.drop-7{width:100px;height:100px;bottom:5%;left:30%;animation:float1 15s ease-in-out infinite;}
.drop-8{width:60px;height:60px;bottom:15%;right:40%;animation:float2 12s ease-in-out infinite;}
@keyframes float1{0%,100%{transform:translate(0,0) scale(1);}50%{transform:translate(20px,-30px) scale(1.08);}}
@keyframes float2{0%,100%{transform:translate(0,0) scale(1);}50%{transform:translate(-25px,25px) scale(0.92);}}
@keyframes float3{0%,100%{transform:translate(0,0) scale(1);}50%{transform:translate(15px,25px) scale(1.05);}}
.glass-card{background:rgba(255,255,255,0.08);backdrop-filter:blur(20px) saturate(160%);-webkit-backdrop-filter:blur(20px) saturate(160%);border-radius:22px;box-shadow:0 4px 20px rgba(30,58,138,0.06),inset 0 1px 0 rgba(255,255,255,0.55),inset 0 -1px 0 rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.35);}
.glass-sidebar{background:rgba(255,255,255,0.05);backdrop-filter:blur(20px) saturate(150%);-webkit-backdrop-filter:blur(20px) saturate(150%);border-right:1px solid rgba(255,255,255,0.3);box-shadow:4px 0 24px rgba(30,58,138,0.04),inset -1px 0 0 rgba(255,255,255,0.35);position:relative;}
.glass-header{background:rgba(255,255,255,0.06);backdrop-filter:blur(20px) saturate(160%);-webkit-backdrop-filter:blur(20px) saturate(160%);border-bottom:1px solid rgba(255,255,255,0.3);box-shadow:0 4px 20px rgba(30,58,138,0.04),inset 0 1px 0 rgba(255,255,255,0.5);position:relative;}
.nav-glass-item{background:transparent;border:1px solid transparent;cursor:pointer;user-select:none;}
.nav-active{background:linear-gradient(135deg,var(--p1) 0%,var(--p2) 100%) !important;border:1px solid rgba(255,255,255,0.6) !important;box-shadow:inset 0 1.5px 0 rgba(255,255,255,0.5),inset 0 -1.5px 4px rgba(0,0,0,0.12),0 8px 24px var(--glow) !important;color:#fff !important;}
.clay-card{background:linear-gradient(145deg,#FFFFFF,#F1F5F9);box-shadow:8px 8px 18px rgba(0,0,0,0.06),-8px -8px 18px rgba(255,255,255,0.9);border:1px solid rgba(255,255,255,0.8);}
.btn-premium{background:linear-gradient(135deg,var(--p1) 0%,var(--p2) 100%);color:#fff !important;box-shadow:0 8px 20px var(--glow),inset 0 1px 0 rgba(255,255,255,0.25);border:1px solid rgba(255,255,255,0.4);cursor:pointer;}
input,select,textarea{border-radius:14px !important;}
.feature-card{background:rgba(255,255,255,0.08);backdrop-filter:blur(20px);border-radius:16px;padding:14px;display:flex;align-items:center;gap:12px;cursor:pointer;border:1px solid rgba(255,255,255,0.35);}
.feature-card input[type=checkbox]{width:20px !important;height:20px !important;accent-color:var(--p2);flex-shrink:0;}
.feature-card.checked{background:rgba(255,255,255,0.28);border-color:var(--p1);}
.custom-select{appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='3' stroke-linecap='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 16px center;padding-right:44px !important;cursor:pointer;}
.dual-tab-container{display:inline-flex;background:rgba(255,255,255,0.08);backdrop-filter:blur(20px);border-radius:16px;padding:4px;border:1px solid rgba(255,255,255,0.35);}
.dual-tab-btn{padding:10px 24px;border-radius:12px;font-weight:600;font-size:14px;color:#475569;cursor:pointer;border:none;background:transparent;}
.dual-tab-btn.active-mundo{background:linear-gradient(135deg,var(--p1),var(--p2));color:#fff;box-shadow:0 6px 16px var(--glow);}
.dual-tab-btn.active-bcore{background:linear-gradient(135deg,#60A5FA,#1D4ED8);color:#fff;box-shadow:0 6px 16px rgba(37,99,235,0.4);}
.tab-content-panel{display:none;animation:fadeSlideIn 0.4s ease;}
.tab-content-panel.active{display:block;}
@keyframes fadeSlideIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
::-webkit-scrollbar{width:8px;height:8px;}
::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.3);border-radius:10px;}
:root{--p1:#3B82F6;--p2:#2563EB;--glow:rgba(59,130,246,0.35);}
body[data-theme="cherry"]{--p1:#FB4D6D;--p2:#B91C1C;--glow:rgba(244,63,94,0.38);background:linear-gradient(135deg,#f3c3d1 0%,#eba9bd 25%,#f6cfdb 50%,#efa9be 75%,#f3c3d1 100%);background-size:300% 300%;}
body[data-theme="gold"]{--p1:#D4A017;--p2:#B45309;--glow:rgba(212,160,23,0.38);background:linear-gradient(135deg,#ecdcb0 0%,#e3c98d 25%,#f0e2ba 50%,#e6cd92 75%,#ecdcb0 100%);background-size:300% 300%;}
body[data-theme="emerald"]{--p1:#10B981;--p2:#046C4E;--glow:rgba(16,185,129,0.38);background:linear-gradient(135deg,#b8e2cf 0%,#9ad8bc 25%,#c4e8d6 50%,#a3dcc2 75%,#b8e2cf 100%);background-size:300% 300%;}
.avatar-premium{background:linear-gradient(135deg,var(--p1),var(--p2));box-shadow:0 8px 20px var(--glow),inset 0 1px 0 rgba(255,255,255,0.3);}
.brand-text{background:linear-gradient(90deg,var(--p1),var(--p2));-webkit-background-clip:text;background-clip:text;color:transparent;}
.back-link{display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:16px;font-weight:700;margin-bottom:16px;background:rgba(255,255,255,0.5);border:1px solid rgba(255,255,255,0.6);color:#475569;font-size:14px;}
.pill{padding:10px 14px;border-radius:14px;font-weight:800;font-size:13px;cursor:pointer;border:1px solid rgba(255,255,255,0.6);background:rgba(255,255,255,0.4);color:#475569;text-align:center;transition:all 0.2s;}
.pill.on{background:linear-gradient(135deg,var(--p1),var(--p2));color:#fff;border-color:rgba(255,255,255,0.7);box-shadow:0 6px 16px var(--glow);}
.stepper{display:flex;align-items:center;gap:10px;}
.stepper button{width:42px;height:42px;border-radius:14px;font-size:20px;font-weight:900;line-height:1;}
.costbar{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 18px;border-radius:18px;background:rgba(255,255,255,0.5);border:1px solid rgba(255,255,255,0.6);}
.theme-swatch{height:64px;border-radius:16px;margin-bottom:10px;border:2px solid rgba(255,255,255,0.7);}
/* ===== THEME STYLE PACKS (background + cards + shapes) ===== */
body[data-theme="cherry"]::before{background:radial-gradient(circle at 25% 30%,rgba(255,255,255,0.8) 0%,transparent 45%),radial-gradient(circle at 75% 60%,rgba(251,113,133,0.5) 0%,transparent 50%),radial-gradient(circle at 50% 85%,rgba(244,63,94,0.3) 0%,transparent 50%),radial-gradient(circle at 15% 75%,rgba(251,178,197,0.6) 0%,transparent 45%);}
body[data-theme="cherry"] .droplet{background:radial-gradient(circle at 30% 25%,rgba(255,255,255,0.98) 0%,rgba(255,255,255,0.6) 15%,rgba(251,178,197,0.5) 40%,rgba(244,63,94,0.22) 70%,transparent 100%);box-shadow:inset -3px -3px 8px rgba(255,255,255,0.9),inset 3px 3px 10px rgba(244,63,94,0.18),0 10px 30px rgba(244,63,94,0.22);}
body[data-theme="cherry"] .glass-card{background:rgba(255,228,235,0.15);border:1px solid rgba(255,255,255,0.45);border-radius:18px;box-shadow:0 4px 22px rgba(190,20,50,0.10),inset 0 1px 0 rgba(255,255,255,0.55);}
body[data-theme="cherry"] .clay-card{background:linear-gradient(145deg,#FFF7F9,#F9DCE4);}
body[data-theme="cherry"] .pill{border-radius:12px;}
body[data-theme="gold"]::before{background:radial-gradient(circle at 25% 30%,rgba(255,255,255,0.85) 0%,transparent 45%),radial-gradient(circle at 75% 60%,rgba(234,179,8,0.45) 0%,transparent 50%),radial-gradient(circle at 50% 85%,rgba(180,83,9,0.3) 0%,transparent 50%),radial-gradient(circle at 15% 75%,rgba(253,224,130,0.6) 0%,transparent 45%);}
body[data-theme="gold"] .droplet{background:radial-gradient(circle at 30% 25%,rgba(255,255,255,0.98) 0%,rgba(255,255,255,0.6) 15%,rgba(253,224,130,0.55) 40%,rgba(212,160,23,0.25) 70%,transparent 100%);box-shadow:inset -3px -3px 8px rgba(255,255,255,0.9),inset 3px 3px 10px rgba(212,160,23,0.2),0 10px 30px rgba(212,160,23,0.25);}
body[data-theme="gold"] .glass-card{background:rgba(255,244,220,0.15);border:1px solid rgba(216,170,40,0.5);border-radius:26px;box-shadow:0 4px 24px rgba(160,110,10,0.16),inset 0 1px 0 rgba(255,255,255,0.6),inset 0 0 0 1px rgba(255,255,255,0.15);}
body[data-theme="gold"] .clay-card{background:linear-gradient(145deg,#FFFEF7,#F9ECCB);}
body[data-theme="gold"] .pill{border-radius:999px;}
body[data-theme="emerald"]::before{background:radial-gradient(circle at 25% 30%,rgba(255,255,255,0.8) 0%,transparent 45%),radial-gradient(circle at 75% 60%,rgba(52,211,153,0.5) 0%,transparent 50%),radial-gradient(circle at 50% 85%,rgba(16,185,129,0.3) 0%,transparent 50%),radial-gradient(circle at 15% 75%,rgba(167,243,208,0.6) 0%,transparent 45%);}
body[data-theme="emerald"] .droplet{background:radial-gradient(circle at 30% 25%,rgba(255,255,255,0.98) 0%,rgba(255,255,255,0.6) 15%,rgba(167,243,208,0.55) 40%,rgba(16,185,129,0.22) 70%,transparent 100%);box-shadow:inset -3px -3px 8px rgba(255,255,255,0.9),inset 3px 3px 10px rgba(16,185,129,0.18),0 10px 30px rgba(16,185,129,0.22);}
body[data-theme="emerald"] .glass-card{background:rgba(222,255,240,0.15);border:1px solid rgba(255,255,255,0.45);border-radius:22px;box-shadow:0 4px 22px rgba(4,120,80,0.10),inset 0 1px 0 rgba(255,255,255,0.55);}
body[data-theme="emerald"] .clay-card{background:linear-gradient(145deg,#F4FFF9,#D3F5E3);}
body[data-theme="emerald"] .pill{border-radius:16px;}
`;

export const BASE_JS = `
function toggleSidebar(){document.getElementById('sidebar').classList.toggle('-translate-x-full');document.getElementById('sidebar-overlay').classList.toggle('hidden');}
function switchDualTab(containerId,tabName){const container=document.getElementById(containerId);if(!container)return;const wrapper=container.closest('.dual-tab-wrapper');if(!wrapper)return;const buttons=wrapper.querySelectorAll('.dual-tab-btn');const panels=wrapper.querySelectorAll('.tab-content-panel');buttons.forEach(b=>b.classList.remove('active-mundo','active-bcore'));panels.forEach(p=>p.classList.remove('active'));const ab=wrapper.querySelector('.dual-tab-btn[data-tab="'+tabName+'"]');const ap=wrapper.querySelector('.tab-content-panel[data-tab="'+tabName+'"]');if(ab)ab.classList.add(tabName==='mundo'?'active-mundo':'active-bcore');if(ap)ap.classList.add('active');try{localStorage.setItem('sdkTab_'+wrapper.id,tabName);}catch(e){}}
document.addEventListener('DOMContentLoaded',function(){document.querySelectorAll('.dual-tab-wrapper').forEach(function(w){let saved='mundo';try{saved=localStorage.getItem('sdkTab_'+w.id)||'mundo';}catch(e){}const btn=w.querySelector('.dual-tab-btn[data-tab="'+saved+'"]')||w.querySelector('.dual-tab-btn');if(!btn)return;const tab=btn.getAttribute('data-tab');w.querySelectorAll('.dual-tab-btn').forEach(b=>b.classList.remove('active-mundo','active-bcore'));w.querySelectorAll('.tab-content-panel').forEach(p=>p.classList.remove('active'));btn.classList.add(tab==='mundo'?'active-mundo':'active-bcore');const p=w.querySelector('.tab-content-panel[data-tab="'+tab+'"]');if(p)p.classList.add('active');});});
function doCopy(text,btn){const ok=function(){if(!btn)return;const ic=btn.querySelector('i');if(!ic)return;const old=ic.className;ic.className='bi bi-check2 text-emerald-500';setTimeout(function(){ic.className=old;},1500);};if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(text).then(ok).catch(function(){fb(text,ok);});}else{fb(text,ok);}}
function fb(text,cb){const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');cb&&cb();}catch(e){}document.body.removeChild(ta);}
function copyUrl(id,btn){const el=document.getElementById(id);if(el)doCopy(el.innerText.trim(),btn);}
`;

export function layout(o) {
  const { title, route, username, panelCode, panelName, content, theme } = o;
  const th = theme || 'blue';
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
    + '<div class="h-20 flex items-center justify-between px-6 border-b border-white/50"><h1 class="text-lg font-extrabold tracking-tight flex items-center gap-3 truncate"><div class="w-10 h-10 shrink-0 rounded-xl avatar-premium text-white flex items-center justify-center shadow-lg"><i class="bi bi-boxes text-lg"></i></div><span class="truncate uppercase brand-text">' + esc(panelName) + '</span></h1>'
    + '<button onclick="toggleSidebar()" class="md:hidden text-slate-400 text-2xl"><i class="bi bi-x-lg"></i></button></div>'
    + '<nav class="flex-1 py-6 px-4 overflow-y-auto">'
    + '<div class="px-3 mb-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">SDK Panel</div>'
    + '<a href="/dashboard" class="back-link"><i class="bi bi-arrow-left-short text-2xl"></i><span>Back to Main Panel</span></a>'
    + '<a href="/" class="' + navClass('/', route) + '"><i class="bi bi-speedometer2 text-lg w-6 text-center"></i> Dashboard</a>'
    + '<a href="/sdk/generate" class="' + navClass('/sdk/generate', route) + '"><i class="bi bi-key-fill text-lg w-6 text-center"></i> Generate SDK</a>'
    + '<a href="/sdk/keys" class="' + navClass('/sdk/keys', route) + '"><i class="bi bi-view-list text-lg w-6 text-center"></i> SDK Keys</a>'
    + '<a href="/sdk/server" class="' + navClass('/sdk/server', route) + '"><i class="bi bi-hdd-network-fill text-lg w-6 text-center"></i> Server</a>'
    + '<a href="/sdk/hash" class="' + navClass('/sdk/hash', route) + '"><i class="bi bi-fingerprint text-lg w-6 text-center"></i> Hash</a>'
    + '</nav><div class="p-4 border-t border-white/50"><div class="glass-card p-3 text-center"><p class="text-[10px] font-extrabold brand-text uppercase tracking-wider">SDK Panel</p><p class="text-[9px] text-slate-400 mt-0.5">Dual Engine - Mundo + Bcore</p></div></div></aside>'
    + '<div class="flex-1 flex flex-col h-screen overflow-y-auto relative w-full z-10">'
    + '<header class="h-16 md:h-20 glass-header sticky top-0 z-30 flex items-center justify-between px-4 lg:px-10">'
    + '<div class="flex items-center gap-3 z-10 w-1/4"><button onclick="toggleSidebar()" class="md:hidden text-slate-600 bg-white/70 p-2.5 rounded-xl border border-white shadow-sm"><i class="bi bi-list text-2xl"></i></button>'
    + '<div class="hidden md:flex flex-col"><span class="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">SDK Workspace</span><h2 class="font-bold text-slate-700 text-[15px]"><span class="bg-gradient-to-r from-blue-50 to-sky-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-200 font-mono text-sm">' + esc(panelCode) + '</span></h2></div></div>'
    + '<div class="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center z-0 w-1/2 max-w-[200px] md:max-w-xs text-center"><h2 class="text-base md:text-xl font-black tracking-[0.1em] uppercase truncate w-full"><span class="brand-text">' + esc(panelName) + '</span></h2><div class="h-1 w-10 md:w-14 rounded-full mt-1 mx-auto avatar-premium"></div></div>'
    + '<div class="flex items-center justify-end gap-3 z-10 w-1/4"><div class="hidden sm:flex flex-col items-end mr-1"><span class="text-sm font-bold text-slate-700">' + esc(username) + '</span><span class="text-[10px] font-extrabold tracking-widest brand-text uppercase">OWNER</span></div>'
    + '<div class="relative group"><div class="w-11 h-11 rounded-2xl avatar-premium text-white flex items-center justify-center font-bold text-lg border-2 border-white/80 cursor-pointer">' + esc(String(username || 'A').substring(0, 1).toUpperCase()) + '</div>'
    + '<div class="absolute right-0 mt-3 w-52 glass-card border border-white opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all"><div class="p-3"><a href="/logout" class="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl font-medium"><i class="bi bi-box-arrow-right"></i> Sign Out</a></div></div>'
    + '</div></div></header>'
    + '<main class="p-4 md:p-8 lg:p-10 pb-20 relative z-10">' + content + '</main></div>'
    + '<script>' + BASE_JS + '</script></body></html>';
}

export function authPage(o) {
  const { mode, error, msg, panelName } = o;
  const isSetup = mode === 'setup';
  const inner = (error ? '<div class="p-3 mb-4 rounded-2xl text-[13px] font-bold bg-red-50 border border-red-200 text-red-600"><i class="bi bi-exclamation-circle-fill mr-1"></i> ' + esc(error) + '</div>' : '')
    + (msg ? '<div class="p-3 mb-4 rounded-2xl text-[13px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-600"><i class="bi bi-check-circle-fill mr-1"></i> ' + esc(msg) + '</div>' : '')
    + '<form method="POST" class="space-y-4">'
    + '<div><label class="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">Username</label><input name="username" required class="w-full clay-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="admin"></div>'
    + '<div><label class="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">Password</label><input type="password" name="password" required class="w-full clay-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="••••••••"></div>'
    + (isSetup ? '<div class="p-3 rounded-2xl text-[11px] text-blue-700 bg-blue-50 border border-blue-100"><i class="bi bi-info-circle-fill mr-1"></i> Pehli baar admin banao. Yehi login hoga.</div>' : '')
    + '<button class="btn-premium w-full py-4 rounded-2xl font-extrabold text-sm uppercase tracking-wider">' + (isSetup ? 'Create Admin' : 'Login') + ' <i class="bi bi-arrow-right"></i></button></form>';
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">'
    + '<title>' + esc(panelName) + ' - Login</title><script src="https://cdn.tailwindcss.com"></script>'
    + '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">'
    + '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">'
    + '<style>' + CSS + '</style></head>'
    + '<body style="min-height:100dvh;display:flex;align-items:center;justify-content:center;padding:20px;">'
    + '<div class="droplet drop-1"></div><div class="droplet drop-2"></div><div class="droplet drop-3"></div><div class="droplet drop-4"></div><div class="droplet drop-5"></div>'
    + '<div class="w-full max-w-[400px] relative z-10"><div class="text-center mb-5"><div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-xl text-white mx-auto mb-2"><i class="bi bi-shield-lock-fill"></i></div>'
    + '<h1 class="text-lg font-black"><span class="bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">' + esc(panelName) + '</span></h1></div>'
    + '<div class="glass-card p-6"><div class="text-center mb-5"><h2 class="text-base font-black text-slate-800">' + (isSetup ? 'Setup Admin' : 'Welcome Back') + '</h2><p class="text-xs text-slate-500">SDK Panel - Mundo + Bcore</p></div>' + inner + '</div></div></body></html>';
}
