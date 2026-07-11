# Expansion plan — Santa Fe County (after Bernalillo)

_Written 2026-07-11. Trigger this plan once the Bernalillo model is proven:
signed engagements, filed protests, at least one favorable resolution, and a
repeatable operator workflow._

## Why this is mostly config, not code

The app already separates **uniform NM state law** (`src/lib/nm/law.ts`) from
**per-county configuration** (`src/lib/nm/counties.ts`). Santa Fe uses the same
statute (NMSA 1978 § 7-38-24: Jan 1 valuation, NOV by ~April 1, 30-day protest
window, valuation protests board, 1/3 assessment ratio, 3% residential cap).
So expansion is primarily: fill in one `County` object, add its forms, and
validate — not rebuild the pipeline.

## Definition of done for Santa Fe

1. `getCounty("santa_fe").supported === true` and it passes the intake county
   gate.
2. Santa Fe assessor office, property-search URL, hearing body, and a verified
   default mill rate are configured.
3. The Santa Fe agent-authorization and protest forms are wired into the
   signing packet and the petition generator.
4. One real Santa Fe engagement signed end-to-end (services agreement + agent
   auth) and one protest filed.

## Work items

### 1. County configuration (`counties.ts`)
Flip Santa Fe from stub to supported and fill:
- `assessor`: Santa Fe County Assessor office, address, phone, website,
  `propertySearchUrl` (their GIS / property record search for UPC lookup),
  `filingMethods`, `protestFiledWith`.
- `hearingBody`: Santa Fe County Valuation Protests Board.
- `defaultMillRate`: **VERIFY** the residential rate for Santa Fe tax districts
  (city of Santa Fe vs. unincorporated differ). Estimate-only; operator can
  override per case.
- `parcelIdLabel`: confirm Santa Fe's parcel identifier and label.
- `forms`: URLs for Santa Fe's agent-authorization, protest, and homeowner-info
  documents.

### 2. Forms → signing packet
- Add `renderAgentAuthHtml` support for Santa Fe (same function; it already
  takes county name + assessor office + source URL). Confirm the substance
  matches Santa Fe's official appointment-of-agent form and file on that form.
- The petition generator (`petition.ts`) is county-aware already; verify the
  output maps cleanly onto Santa Fe's protest form fields.

### 3. Data / lookups
- Confirm Santa Fe's public property search supports address → parcel/UPC lookup
  (for the intake UPC helper link). If an API exists, note it for a future
  auto-populate slice.
- Capture Santa Fe's NOV format so operators know where the protest deadline and
  values are printed.

### 4. Compliance (reuse Bernalillo gates)
- The services agreement and agent-authorization drafts still require **NM
  attorney sign-off**; that review covers statewide use, but confirm nothing is
  Bernalillo-specific in the executed versions.
- No new licensing analysis expected (state law is uniform), but re-confirm.

### 5. Marketing / geography
- Intake already lists Santa Fe as "coming soon" and waitlists it. Flipping
  `supported` opens it automatically. Add Santa Fe-specific copy where the site
  currently says "Bernalillo County."
- Consider a per-county landing route later if SEO warrants it.

## Rollout steps

1. Gather Santa Fe assessor data + forms; fill the config object.
2. Verify the mill rate and NOV format with a real Santa Fe NOV.
3. Attorney confirms the agent-auth / services agreement for Santa Fe use.
4. Internal test: run a Santa Fe intake through signing (mock) and generate a
   petition; check every county-specific string is correct.
5. Flip `supported: true`, remove the "coming soon" gate for Santa Fe, ship.
6. Onboard the first real Santa Fe client; file the first protest; capture
   learnings before opening additional counties.

## Generalizing beyond Santa Fe

Each additional county repeats steps 1–6. The reusable checklist (assessor data,
mill rate, forms, NOV format, attorney confirm, test, flip) becomes the standard
county-onboarding runbook toward full 33-county coverage.
