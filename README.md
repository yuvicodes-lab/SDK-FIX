# FULL Panel — Cloudflare Worker + D1 (panel-glass.zip ka poora port)

`panel-glass.zip` ka **poora panel** — PHP ki jagah **Cloudflare Worker + D1**. Same iOS blue glass UI, mobile responsive.

## Pages

- `/login` (device-lock), `/register` (referral), `/reset-device` (24h limit), `/join-panel` (empty panel claim), `/setup` (pehla admin)
- `/dashboard` (role stats), `/generate` (pricing + balance + bulk + server type), `/keys` (reset/edit/extend/bulk)
- `/users`, `/admins`, `/permissions`, `/referral` (OWNER/ADMIN rules PHP jaise)
- `/server` (maintenance + mod config), `/settings` (password + branding + API URLs), `/aes` (AES rotate + activation keys), `/api-test`, `/loader-manager`, `/create-panel` (id==1)
- `/sdk/*` — MUNDO + BCORE dashboard/generate/keys/server/hash (sirf main OWNER id==1)

## API (bina login)

- `POST /connect/:panel` — game=PUBG, user_key, serial
- `POST /encrypt/:panel` — same + AES-256-CBC payload (panel active + AES configured hona chahiye)
- `POST /sdk/mundo/:panel` — AES-128-ECB encrypted
- `POST /sdk/bcore/:panel` — RC4+Base64 encrypted

## Deploy

```bash
cd sdk-worker
npm install
npx wrangler d1 execute sdk --file=schema.sql
npx wrangler deploy
```

Pehli baar site par `/setup` khol ke admin banao. Purane DB par bhi safe hai — Worker startup par naye columns auto-migrate hote hain.

## Note (PHP se farak)

- `loader-manager` me **zip upload nahi** (Worker me disk nahi hota) — uski jagah 4 slot me **lib URL** save hota hai, `connect` API wahi URL deta hai, khaali ho to GitHub fallback.
- CSRF check nahi hai, Turnstile nahi hai (PHP login me bhi verify nahi tha).
- `/blocked` route nahi hai (zip me uska file tha hi nahi).
- `/sdk/api-test`, `/sdk/encryption`, `/sdk/settings` nahi hain (zip me unke file missing hain).

## Files

- `src/index.js` — router + saare POST actions + 4 API handlers
- `src/panel-ui.js` — full-panel layout + role nav
- `src/p-auth.js` — login/register/reset/join pages + device fingerprint
- `src/p-dash.js` — dashboard + generate + key-list
- `src/p-users.js` — users/admins/permissions/referral
- `src/p-system.js` — server/settings/aes/api-test/create-panel/loader
- `src/p-connect.js` — connect + encrypt API
- `src/crypto.js`, `src/ui.js`, `src/pages-*.js` — SDK engine (same as pehle)

D1 binding (`wrangler.toml` me set):
```toml
[[d1_databases]]
binding = "DB"
database_name = "sdk"
database_id = "02ec2c47-2db5-4b52-b914-6b67b93511f4"
```
