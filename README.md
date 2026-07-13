# NM Tax Appeals

Done-for-you residential property tax appeals for New Mexico homeowners.
Bernalillo County first, architected for all 33 NM counties.
Operated by **NM Tax Appeals LLC** · 30% contingency of tax savings.

Full design: [`docs/2026-07-11-nm-tax-appeals-design.md`](docs/2026-07-11-nm-tax-appeals-design.md)

## Stack

Next.js 15 (App Router, TypeScript) · Prisma + SQLite (→ Postgres when
deployed) · Tailwind · DocuSign (with a credential-free mock for local dev).

## Getting started

```bash
npm install
cp .env.example .env        # then edit OPERATOR_PASSWORD + SESSION_SECRET
npm run db:reset            # create SQLite db + seed demo cases
npm run dev                 # http://localhost:3000
```

Scripts: `db:push` (sync schema), `db:seed` (demo data), `db:reset`
(force-reset + seed), `build`, `start`.

## Layout

```
src/
  app/
    page.tsx                     marketing landing
    how-it-works/                explainer
    intake/                      public intake wizard (front door)
    agreement/[id]/sign · done   signing ceremony + confirmation
    admin/                       operator back office (login, cases, case detail)
    api/                         intake, docusign/{envelope,webhook}, esign/complete, admin/{login,logout}
  lib/
    nm/                          counties.ts, law.ts, eligibility.ts  (NM domain)
    docusign/                    provider interface + mock + real DocuSign + factory
    engagement.ts                agreement render + completion
    petition.ts · savings.ts     protest petition + savings/fee math
    auth.ts · admin-auth.ts      operator session
  components/                    shared UI
prisma/schema.prisma             data model
```

## Flows

- **Homeowner:** `/intake` → soft eligibility read → `/agreement/:id/sign` →
  case lands in the back office as `engaged` (with signer IP recorded).
- **Operator:** `/admin` (password from `OPERATOR_PASSWORD`) → case list with
  deadline countdown → case detail: set grounds/target/mill rate, add comps,
  generate & file the petition, record the outcome, see savings + fee.

## E-signature

Runs in **mock mode** out of the box (no DocuSign account needed). Set the
`DOCUSIGN_*` vars in `.env` to switch to real DocuSign; add a Connect webhook
pointing at `/api/docusign/webhook` (HMAC via `DOCUSIGN_CONNECT_HMAC_KEY`).

## ⚠️ Before real clients

The services agreement and agent authorization are **New Mexico DRAFTS** and
must be reviewed and approved by a **New Mexico attorney** before use with real
clients — also confirm NM regulation of property-tax agents / contingency
representation and enforceability of any lien clause. Exemption amounts and the
mill rate are `VERIFY`-flagged placeholders used only for estimates. See the
design doc's "Launch gates" section.
