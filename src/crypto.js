import { createCipheriv, createDecipheriv } from 'node:crypto';

export const BCORE_SECRET = 'YuviMatrix_Secure_2026';
export const MUNDO_SALT = 'https://mundo.cp.cheat/v2/api/verify';

// ---------- RC4 (BCORE, same as PHP) ----------
export function rc4(dataBuf, keyStr) {
  const key = Buffer.from(keyStr, 'latin1');
  const S = new Uint8Array(256);
  for (let i = 0; i < 256; i++) S[i] = i;
  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + S[i] + key[i % key.length]) % 256;
    const t = S[i]; S[i] = S[j]; S[j] = t;
  }
  let i = 0; j = 0;
  const out = Buffer.alloc(dataBuf.length);
  for (let y = 0; y < dataBuf.length; y++) {
    i = (i + 1) % 256;
    j = (j + S[i]) % 256;
    const t = S[i]; S[i] = S[j]; S[j] = t;
    out[y] = dataBuf[y] ^ S[(S[i] + S[j]) % 256];
  }
  return out;
}

export function bcoreEncrypt(plain) {
  const enc = rc4(Buffer.from(plain, 'utf8'), BCORE_SECRET);
  return enc.toString('base64');
}

export function bcoreDecrypt(b64) {
  try {
    const raw = Buffer.from(String(b64 || '').trim(), 'base64');
    if (!raw.length) return Buffer.alloc(0);
    return rc4(raw, BCORE_SECRET);
  } catch { return Buffer.alloc(0); }
}

// CESU-8 (fancy unicode app label) -> proper UTF-8, same fix as PHP
export function fixCesu8(buf) {
  const out = [];
  for (let i = 0; i < buf.length; i++) {
    if (i + 5 < buf.length &&
      buf[i] === 0xED && buf[i+1] >= 0xA0 && buf[i+1] <= 0xAF &&
      buf[i+3] === 0xED && buf[i+4] >= 0xB0 && buf[i+4] <= 0xBF) {
      const h = ((buf[i+1] & 0x0F) << 6) | (buf[i+2] & 0x3F);
      const l = ((buf[i+4] & 0x0F) << 6) | (buf[i+5] & 0x3F);
      const u = 0x10000 + ((h - 0xD800) << 10) + (l - 0xDC00);
      out.push(0xF0 | ((u >> 18) & 0x07), 0x80 | ((u >> 12) & 0x3F), 0x80 | ((u >> 6) & 0x3F), 0x80 | (u & 0x3F));
      i += 5;
    } else out.push(buf[i]);
  }
  return Buffer.from(out);
}

// ---------- MUNDO AES-128-ECB (same as PHP openssl) ----------
export function mundoAesKey(salt) {
  const len = salt.length;
  let key = '';
  for (let i = 0; i < 16; i++) {
    key += String.fromCharCode(salt.charCodeAt(i % len) ^ (len + i));
  }
  return key; // latin1 16 chars
}

export function aesEncryptRaw(plain, keyRaw) {
  const cipher = createCipheriv('aes-128-ecb', Buffer.from(keyRaw, 'latin1'), null);
  cipher.setAutoPadding(true);
  return Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]).toString('base64');
}

export function aesDecryptRaw(b64, keyRaw) {
  try {
    const decipher = createDecipheriv('aes-128-ecb', Buffer.from(keyRaw, 'latin1'), null);
    decipher.setAutoPadding(true);
    const out = Buffer.concat([decipher.update(String(b64).trim(), 'base64'), decipher.final()]);
    return out.toString('utf8');
  } catch { return ''; }
}

export function mundoAesKeyHex(salt) {
  const raw = mundoAesKey(salt);
  return Buffer.from(raw, 'latin1').toString('hex');
}

// ---------- password (SHA-256 salt$hash, Worker-safe) ----------
export async function sha256Hex(s) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function hashPassword(pw) {
  const r = new Uint8Array(8);
  crypto.getRandomValues(r);
  const salt = [...r].map(b => b.toString(16).padStart(2, '0')).join('');
  const h = await sha256Hex(salt + pw);
  return salt + '$' + h;
}

export async function verifyPassword(pw, stored) {
  const parts = String(stored || '').split('$');
  if (parts.length !== 2) return false;
  const h = await sha256Hex(parts[0] + pw);
  return h === parts[1];
}

export function randomHexKey() {
  const r = new Uint8Array(8);
  crypto.getRandomValues(r);
  return [...r].map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}
