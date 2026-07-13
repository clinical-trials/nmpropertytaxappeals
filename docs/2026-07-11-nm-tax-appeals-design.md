# NM Tax Appeals — v1 design

_Design captured 2026-07-11. Brand-new standalone webapp._

## What it is

A **done-for-you** residential property tax appeal service for New Mexico
homeowners, operated by **NM Tax Appeals LLC** on a **30% contingency** of tax
savings. The software is an intake engine + case-management back office behind a
human-run service.

- **Customer:** an owner-occupied **Bernalillo County** homeowner who has already
  decided they want to appeal.
- **Scope:** Bernalillo County fully supported in v1; architected so all **33 NM
  counties** can be added as config, not code.

## Two surfaces

1. **Acquisition front door (public):** marketing shell → intake wizard →
   soft eligibility read → DocuSign engagement → case created.
2. **Case-management back office (operator):** case list with deadline
   countdown, comps/evidence workspace, generated protest petition, filing +
   outcome tracking, savings + fee math.

## Key decisions

- **Eligibility read:** light heuristic + human review. The front door flags
  likely grounds (over-valuation, 3% cap, missing exemption) and confirms the
  appeal is worth running; a person does the real comps analysis. No comps
  pipeline or assessor scraping in v1.
- **E-signature:** DocuSign (JWT/impersonation, embedded signing). The signer's
  **IP address** is recorded at signing (DocuSign certificate of completion),
  plus we stamp our own IP at envelope-request time. A **mock provider** runs
  the whole flow locally without credentials.
- **County abstraction:** uniform NM state-law core (Jan 1 valuation, NOV by
  ~April 1, 30-day protest window per NMSA 1978 § 7-38-24, exemptions, 3%
  residential cap § 7-36-21.2) + per-county config (assessor office, forms,
  hearing body, mill rate). Bernalillo configured; other 32 counties are stubs.
- **Auth:** single-operator password → signed session cookie. No client portal
  in v1 (clients interact via intake + DocuSign + email).
- **Stack:** Next.js 15 (App Router, TS) + Prisma (SQLite local → Postgres) +
  Tailwind. Matches the house stack for free hosting later.

## Domain model

`Client` · `Property` (→ Schedule A) · `NoticeOfValue` (drives deadline) ·
`Case` (per property per tax year; status pipeline; grounds) ·
`EngagementAgreement` (fee %, DocuSign envelope, **signer IP**, term/renewal) ·
`Evidence` (comps) · `Filing` (petition, hearing, outcome, final value) ·
`AuditLog` (immutable — signing IP, status changes).

## Case pipeline

`intake → qualified → engaged → filed → informal → hearing_scheduled →
resolved → closed` (or `declined`).

## ⚠️ Launch gates (human handoff)

- **Agreement text:** a **New Mexico** property tax services agreement + agent
  authorization (County Assessor, County Valuation Protests Board, NMSA 1978
  §§ 7-38-24..28), modeled on the Letter of Authorization / Consultant Agreement
  template, rendered in `src/lib/engagement.ts`. Both carry a **DRAFT** banner
  and must be reviewed and approved by a **New Mexico attorney** before use with
  real clients. Also verify: NM regulation of property-tax agents / contingency
  representation, and enforceability of any lien clause.
- **Legal figures:** exemption dollar amounts and the Bernalillo mill rate are
  marked `VERIFY` in code and used only for soft estimates.
- **DocuSign:** production credentials + a Connect webhook (HMAC) required to
  sign for real; app runs in mock mode until then.

## Out of scope for v1 (later slices)

Automated comps/valuation, assessor-data scraping, client portal,
payments/invoicing + lien recording, arbitration/litigation module, counties
beyond Bernalillo.
