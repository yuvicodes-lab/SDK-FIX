import { CSS, esc } from './ui.js';

function shell(panelName, heading, sub, inner) {
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">'
    + '<title>' + esc(heading) + ' - ' + esc(panelName) + '</title><script src="https://cdn.tailwindcss.com"></script>'
    + '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">'
    + '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">'
    + '<style>' + CSS + '.clay-input{width:100%;background:linear-gradient(145deg,#F8FAFC,#E2E8F0);border:1px solid rgba(255,255,255,0.8);border-radius:16px;padding:14px 16px;font-size:16px;font-weight:500;outline:none;}.clay-input:focus{background:#fff;border-color:rgba(59,130,246,0.3);}.label-dark{display:block;font-size:11px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;}.alert-box{padding:12px 16px;border-radius:14px;font-size:13px;font-weight:600;margin-bottom:16px;}.alert-error{background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.25);color:#DC2626;}.alert-success{background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.25);color:#059669;}</style></head>'
    + '<body style="min-height:100dvh;display:flex;align-items:center;justify-content:center;padding:20px;">'
    + '<div class="droplet drop-1"></div><div class="droplet drop-2"></div><div class="droplet drop-3"></div><div class="droplet drop-4"></div><div class="droplet drop-5"></div>'
    + '<div class="w-full max-w-[400px] relative z-10"><div class="text-center mb-5"><div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-xl text-white mx-auto mb-2"><i class="bi bi-shield-lock-fill"></i></div>'
    + '<h1 class="text-lg font-black"><span class="bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">' + esc(panelName) + '</span></h1></div>'
    + '<div class="glass-card p-6"><div class="text-center mb-5"><h2 class="text-base font-black text-slate-800">' + esc(heading) + '</h2><p class="text-xs text-slate-500 mt-0.5">' + esc(sub) + '</p></div>' + inner + '</div></div></body></html>';
}

function alerts(error, msg) {
  return (error ? '<div class="alert-box alert-error"><i class="bi bi-exclamation-circle-fill"></i> ' + error + '</div>' : '')
    + (msg ? '<div class="alert-box alert-success"><i class="bi bi-check-circle-fill"></i> ' + esc(msg) + '</div>' : '');
}

const FP_JS = `<script>
function collectFP(){try{var c=document.createElement('canvas');c.width=200;c.height=50;var x=c.getContext('2d');x.textBaseline='top';x.font='14px Arial';x.fillStyle='#f60';x.fillRect(125,1,62,20);x.fillStyle='#069';x.fillText('Fingerprint',2,15);var cf=c.toDataURL();var w='unknown';try{var g=document.createElement('canvas').getContext('webgl');var e=g.getExtension('WEBGL_debug_renderer_info');w=e?g.getParameter(e.UNMASKED_RENDERER_WEBGL):'unknown';}catch(e){}var a='unknown';try{var ac=new (window.AudioContext||window.webkitAudioContext)();a=ac.sampleRate.toString();ac.close();}catch(e){}return JSON.stringify({screen:screen.width+'x'+screen.height,timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,platform:navigator.platform,canvas:String(cf).substring(0,80),webgl:String(w).substring(0,80),audio:a});}catch(e){return '{}';}}
document.addEventListener('DOMContentLoaded',function(){var el=document.getElementById('device_info_login');if(el)el.value=collectFP();});
</script>`;

export function loginPage(o) {
  const inner = alerts(o.error || '', o.msg || '')
    + '<form method="POST" class="space-y-3.5"><input type="hidden" name="device_info" id="device_info_login">'
    + '<div><label class="label-dark">Username</label><input type="text" name="username" required class="clay-input" placeholder="Enter your username"></div>'
    + '<div><label class="label-dark">Password</label><input type="password" name="password" required class="clay-input" placeholder="Enter your password"></div>'
    + '<button class="btn-premium w-full py-4 rounded-2xl font-extrabold text-sm uppercase">Login <i class="bi bi-arrow-right"></i></button></form>'
    + '<div class="my-4 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>'
    + '<div class="text-center mb-3"><p class="text-xs text-slate-600 font-medium">New here? <a href="/register" class="text-blue-700 font-bold">Create Account</a> <span class="text-slate-300 mx-1">|</span> <a href="/join-panel" class="text-blue-700 font-bold">Join Panel</a></p></div>'
    + '<a href="/reset-device" class="block text-center w-full py-3.5 rounded-2xl font-bold text-[13px] text-blue-600 bg-blue-50 border border-blue-200"><i class="bi bi-phone"></i> Reset Device</a>'
    + FP_JS;
  return shell(o.panelName, 'Welcome Back', 'Sign in to continue', inner);
}

export function registerPage(o) {
  const inner = alerts(o.error || '', o.msg || '')
    + '<form method="POST" class="space-y-3.5">'
    + '<div><label class="label-dark">Full Name</label><input type="text" name="full_name" required class="clay-input" placeholder="Your name"></div>'
    + '<div><label class="label-dark">Username</label><input type="text" name="username" required class="clay-input" placeholder="Choose username"></div>'
    + '<div><label class="label-dark">Password</label><input type="password" name="password" required class="clay-input" placeholder="Min 4 characters"></div>'
    + '<div><label class="label-dark">Referral Code</label><input type="text" name="referral_code" required class="clay-input font-mono" placeholder="REF-XXXXXXXX"></div>'
    + '<button class="btn-premium w-full py-4 rounded-2xl font-extrabold text-sm uppercase">Create Account <i class="bi bi-arrow-right"></i></button></form>'
    + '<div class="text-center mt-4"><a href="/login" class="text-xs text-blue-700 font-bold">Back to Login</a></div>';
  return shell(o.panelName, 'Create Account', 'Referral code required', inner);
}

export function resetPage(o) {
  const inner = alerts(o.error || '', o.msg || '')
    + '<form method="POST" class="space-y-3.5">'
    + '<div><label class="label-dark">Username</label><input type="text" name="username" required class="clay-input"></div>'
    + '<div><label class="label-dark">Password</label><input type="password" name="password" required class="clay-input"></div>'
    + '<div class="text-[11px] text-slate-500 bg-slate-50 border rounded-xl p-3">Reset ke baad purani device logout ho jayegi. 24 ghante me 1 baar hi reset hota hai.</div>'
    + '<button class="btn-premium w-full py-4 rounded-2xl font-extrabold text-sm uppercase"><i class="bi bi-phone"></i> Reset Device</button></form>'
    + '<div class="text-center mt-4"><a href="/login" class="text-xs text-blue-700 font-bold">Back to Login</a></div>';
  return shell(o.panelName, 'Reset Device', 'Login on new device', inner);
}

export function joinPage(o) {
  const inner = alerts(o.error || '', o.msg || '')
    + '<form method="POST" class="space-y-3.5">'
    + '<div><label class="label-dark">Panel Code</label><input type="text" name="panel_code" required class="clay-input font-mono" placeholder="YUVI_001"></div>'
    + '<div><label class="label-dark">Username</label><input type="text" name="username" required class="clay-input"></div>'
    + '<div><label class="label-dark">Password</label><input type="password" name="password" required class="clay-input"></div>'
    + '<div class="text-[11px] text-slate-500 bg-slate-50 border rounded-xl p-3">Sirf us panel me jo abhi khaali hai (koi OWNER nahi) — pehla admin banoge.</div>'
    + '<button class="btn-premium w-full py-4 rounded-2xl font-extrabold text-sm uppercase">Join as Owner</button></form>'
    + '<div class="text-center mt-4"><a href="/login" class="text-xs text-blue-700 font-bold">Back to Login</a></div>';
  return shell(o.panelName, 'Join Panel', 'Claim empty panel as owner', inner);
}

// SHA-256 hex via WebCrypto (login fingerprint ke liye, PHP hash() parity)
export async function sha256HexStr(s) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export function deviceFingerprint(diJson, ua, lang) {
  let d = {};
  try { d = JSON.parse(diJson || '{}'); } catch {}
  const s = (d.screen || '') + '|' + (d.timezone || '') + '|' + (d.platform || '') + '|' + (d.canvas || '') + '|' + (d.webgl || '') + '|' + (d.audio || '') + '|' + (ua || '') + '|' + (lang || '');
  return sha256HexStr(s);
}
