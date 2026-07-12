# Deploying NM Tax Appeals to the web

This app is a Next.js 15 server application backed by Postgres. It runs great on
**Vercel** (hosting) + **Neon** or **Supabase** (Postgres). GitHub alone cannot
host it — GitHub Pages only serves static files, and this app needs a running
server + a database.

Everything below is a one-time setup. After it, every push to the connected
branch redeploys automatically.

---

## 0. What you'll need
- A GitHub account with this repo (already done: `clinical-trials/nmpropertytaxappeals`).
- A **Vercel** account (free Hobby tier) — sign in with GitHub.
- A **Neon** account (free tier) for Postgres — or Supabase.
- (Optional, for real signing) a **DocuSign** developer/production account.

---

## 1. Create the database (Neon)
1. Create a project at https://neon.tech → you get two connection strings:
   - a **pooled** string (host contains `-pooler`) → this is `DATABASE_URL`
   - a **direct** string (no `-pooler`) → this is `DIRECT_URL`
2. Both should end with `?sslmode=require`.

## 2. Create the tables
From your machine, with the two URLs exported (or in `.env`):
```bash
export DATABASE_URL="postgresql://…-pooler…/db?sslmode=require"
export DIRECT_URL="postgresql://…(direct)…/db?sslmode=require"
npx prisma db push        # creates all tables
# optional: seed demo data
npm run db:seed
```

## 3. Deploy on Vercel
1. https://vercel.com/new → **Import** `clinical-trials/nmpropertytaxappeals`.
2. Framework preset: **Next.js** (auto-detected). Build command stays
   `npm run build` (it runs `prisma generate` first — see `package.json`).
3. Set the branch to deploy (Production Branch): `main` once this branch is
   merged, or deploy this `deploy/vercel` branch directly.
4. Add **Environment Variables** (Production + Preview):

   | Name | Value |
   | --- | --- |
   | `DATABASE_URL` | Neon **pooled** string |
   | `DIRECT_URL` | Neon **direct** string |
   | `SESSION_SECRET` | a long random string |
   | `OPERATOR_PASSWORD` | the back-office password |
   | `APP_BASE_URL` | your Vercel URL (e.g. `https://nmpropertytaxappeals.vercel.app`) |

   For real DocuSign (optional, otherwise it stays in mock mode):
   | Name | Value |
   | --- | --- |
   | `DOCUSIGN_INTEGRATION_KEY` | from DocuSign admin |
   | `DOCUSIGN_USER_ID` | DocuSign API user (GUID) |
   | `DOCUSIGN_ACCOUNT_ID` | DocuSign account id |
   | `DOCUSIGN_PRIVATE_KEY` | RSA private key (PEM; `\n`-escaped single line) |
   | `DOCUSIGN_AUTH_SERVER` | `account.docusign.com` (prod) / `account-d.docusign.com` (demo) |
   | `DOCUSIGN_BASE_PATH` | `https://www.docusign.net/restapi` (prod) |
   | `DOCUSIGN_CONNECT_HMAC_KEY` | shared secret for the Connect webhook |

5. **Deploy.** Vercel builds and gives you a live URL.

## 4. After first deploy
- Set `APP_BASE_URL` to the real URL and redeploy (used for DocuSign return +
  webhook URLs).
- If you enabled DocuSign, add a **Connect** webhook in DocuSign admin pointing
  at `https://YOUR_URL/api/docusign/webhook` (JSON, "Envelope Completed"), with
  the HMAC key = `DOCUSIGN_CONNECT_HMAC_KEY`.
- Log into `https://YOUR_URL/admin` with `OPERATOR_PASSWORD`.

## 5. Custom domain (optional)
In Vercel → Project → Settings → Domains, add `newmexicoappeals.com` and follow
the DNS instructions.

---

## Local development with Postgres
Local dev now uses Postgres too (parity with production). Either:
- **Docker:** `docker compose up -d`, then set `.env`:
  `DATABASE_URL=DIRECT_URL=postgresql://nmta:nmta@localhost:5432/nmta?schema=public`
  then `npx prisma db push && npm run db:seed && npm run dev`.
- **No Docker:** create a free Neon dev branch and point `.env` at it, then the
  same `prisma db push` / `db:seed` / `dev`.

## Notes
- Schema is Postgres-portable (integers for whole-dollar amounts, JSON stored as
  text) — no code changes needed vs. the SQLite dev history.
- The two engagement documents (services agreement + agent authorization) remain
  **drafts pending NM attorney review** before real client use, regardless of
  deployment.
