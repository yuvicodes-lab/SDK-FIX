# SDK Panel — Cloudflare Worker + D1 (panel-glass SDK alag website)

PHP wala `panel-glass.zip` ka **SDK feature only** — same glass UI, mobile responsive — ab PHP me nahi, **Cloudflare Worker** me.

Features ported:
- Dashboard (MUNDO + BCORE stats + recent keys)
- Generate SDK (7/15/30/60 days, pkg/app limit, F1/F2)
- SDK Keys (block/unblock/delete + pkg/app binding add/edit/block/delete)
- Server (maintenance ON/OFF + endpoint URL + docs)
- Hash Vault (lib .so SHA-256)
- API: `POST /sdk/mundo/:panel` (AES-128-ECB) + `POST /sdk/bcore/:panel` (RC4+Base64) — purane `.so` clients same URL format par kaam karenge

D1 binding (tumhara):
```toml
[[d1_databases]]
binding = "DB"
database_name = "sdk"
database_id = "02ec2c47-2db5-4b52-b914-6b67b93511f4"
```

## 1) Deploy

```bash
cd sdk-worker
npm install
# D1 table banao (ek baar):
npx wrangler d1 execute sdk --file=schema.sql
# deploy:
npx wrangler deploy
```

`wrangler.toml` me `PANEL_CODE` / `PANEL_NAME` badal sakte ho:
```toml
[vars]
PANEL_CODE = "YUVI_001"   # purane clients ke liye same rakho
PANEL_NAME = "SDK PANEL"
```

## 2) Pehla login

Deploy ke baad site kholo → `/setup` par pehla admin banao → uske baad `/login`.

## 3) Purana MySQL data lana ho to

`mundo_keys`, `bcore_keys`, `*_bindings`, `sdk_hash_vault`, `sdk_server_status` ka CSV/export karke D1 me insert karo. `panel_code` same (`YUVI_001`) rakho taaki purane app URL `/sdk/mundo/YUVI_001` kaam karte rahein.

## 4) API URL

```
https://<worker-url>/sdk/mundo/YUVI_001
https://<worker-url>/sdk/bcore/YUVI_001
```

## Files

- `src/index.js` — router + auth + saare pages POST actions + dono API
- `src/crypto.js` — RC4 (BCORE) + AES-128-ECB via node:crypto (MUNDO) + password hash
- `src/ui.js` — same iOS blue glass layout/sidebar/header + login/setup
- `src/pages-dash.js` — dashboard + generate
- `src/pages-keys.js` — keys + bindings
- `src/pages-server.js` — server + hash
- `schema.sql` — D1 tables
- `wrangler.toml` — tumhara D1 binding already set
