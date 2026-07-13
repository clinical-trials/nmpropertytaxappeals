// Pure, client-safe rendering of the engagement documents (no DB imports), so
// the static demo can display and "sign" the real agreement + agent
// authorization entirely in the browser. The server app renders the same text
// via src/lib/engagement.ts.
//
// NOTE: both documents are DRAFTS pending New Mexico attorney review before use
// with real clients.

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const DOC_STYLE = `
  body{font-family:Georgia,'Times New Roman',serif;color:#1c1a17;line-height:1.5;max-width:720px;margin:0 auto;padding:20px;}
  h1{font-size:19px;text-align:center;margin-bottom:4px;}
  h2{font-size:13px;letter-spacing:.04em;text-transform:uppercase;margin-top:18px;border-bottom:1px solid #ddd;padding-bottom:2px;}
  .sub{text-align:center;color:#666;font-size:12px;margin-bottom:14px;}
  .draft{background:#fff3cd;border:1px solid #e0c56b;color:#6b5310;padding:8px 12px;font-family:Arial,sans-serif;font-size:12px;border-radius:6px;margin-bottom:16px;}
  table{border-collapse:collapse;width:100%;margin:10px 0;font-size:13px;}
  td,th{border:1px solid #bbb;padding:6px 8px;text-align:left;}
  .sig{margin-top:24px;border-top:1px solid #999;padding-top:12px;}
  .signed{font-family:'Segoe Script','Brush Script MT',cursive;font-size:22px;color:#1c3d5a;}
  small{color:#666;}
`;

function sigLine(name?: string): string {
  return name
    ? `<span class="signed">${escapeHtml(name)}</span>`
    : "____________________";
}

function today(): string {
  return new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export type ServicesAgreementParams = {
  clientName: string;
  feePercent: number;
  arbitrationUpliftPercent: number;
  taxYear: number;
  propertyAddress: string;
  ownerName: string;
  signature?: string;
};

export function renderServicesAgreement(p: ServicesAgreementParams): string {
  const eff = today();
  return `<!doctype html><html><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<style>${DOC_STYLE}</style></head><body>
<div class="draft">DRAFT — adapted to New Mexico for review. Must be reviewed and approved by a New Mexico attorney before use with clients.</div>
<h1>Property Tax Services Agreement</h1>
<p class="sub">NM Tax Appeals LLC, a New Mexico limited liability company ("Company")</p>
<p>This Property Tax Services Agreement is made as of the Effective Date (<strong>${eff}</strong>) by and between the undersigned ("Client") and Company.</p>
<h2>Services</h2>
<p>Client retains Company and designates Company as Client's authorized representative for reducing the property taxes of the property on Schedule A. Services may include reviewing county assessor records, requesting correction of errors, filing a protest, conducting informal negotiations, and representing Client at a hearing before the county valuation protests board under NMSA 1978 §§ 7-38-24 through 7-38-28.</p>
<h2>Authority and Discretion</h2>
<p>Company will use commercially reasonable efforts to achieve the maximum reduction. However, COMPANY MAKES NO GUARANTY OF ANY PARTICULAR OUTCOME. Company will pursue a reduction only where, in its judgment, one can reasonably be obtained.</p>
<h2>Fee</h2>
<p>Company will receive a contingent fee of <strong>${p.feePercent}%</strong> of the Property Tax Savings (the difference between the assessed value on the initial Notice of Value and the final assessed value, at the applicable tax rate) plus any reduction from obtaining a missing exemption. No savings, no fee.</p>
<h2>Further Appeal</h2>
<p>If an appeal beyond the county valuation protests board is appropriate and Client agrees in writing, the contingent fee increases by <strong>${p.arbitrationUpliftPercent} percentage points</strong> for savings recovered at that stage.</p>
<h2>Term</h2>
<p>This Agreement continues through the ${p.taxYear} tax year and renews each year until cancelled in writing to support@newmexicoappeals.com by March 1.</p>
<h2>Governing law &amp; disclaimer</h2>
<p>Governed by the laws of New Mexico (Bernalillo County venue). Company makes no representation that it will achieve any reduction and disclaims all warranties other than those expressly stated; liability is limited to fees actually paid for the year(s) in dispute.</p>
<h2>Schedule A — Property</h2>
<table><thead><tr><th>Property Address</th><th>Owner Name</th></tr></thead>
<tbody><tr><td>${escapeHtml(p.propertyAddress)}</td><td>${escapeHtml(p.ownerName)}</td></tr></tbody></table>
<div class="sig">
  <p>Client signature: ${sigLine(p.signature)}</p>
  <p>Date: ${p.signature ? eff : "____________________"}</p>
  <p><strong>${escapeHtml(p.clientName)}</strong></p>
</div>
</body></html>`;
}

export type AgentAuthParams = {
  ownerName: string;
  ownerMailingAddress?: string | null;
  propertyAddress: string;
  upc?: string | null;
  countyName: string;
  assessorOffice: string;
  taxYear: number;
  sourceUrl?: string;
  signature?: string;
};

export function renderAgentAuthorization(p: AgentAuthParams): string {
  const eff = today();
  return `<!doctype html><html><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<style>${DOC_STYLE}</style></head><body>
<div class="draft">DRAFT — reconcile with, and file on, the official ${escapeHtml(
    p.countyName
  )} Agent Authorization form. Attorney review required before use.</div>
<h1>Agent Authorization</h1>
<p class="sub">${escapeHtml(p.assessorOffice)} · Tax Year ${p.taxYear}</p>
<p>The undersigned property owner appoints and authorizes <strong>NM Tax Appeals LLC</strong> ("Agent") to act as the owner's authorized representative before the ${escapeHtml(
    p.assessorOffice
  )} for all matters relating to the valuation, classification, and exemptions of the property below for the ${p.taxYear} tax year.</p>
<p>This empowers the Agent to file a petition of protest under NMSA 1978 § 7-38-24, receive notices from the assessor, review the assessor's records, conduct informal conferences, and appear and present evidence at any hearing before the county valuation protests board.</p>
<table>
  <tr><th>Property owner</th><td>${escapeHtml(p.ownerName)}</td></tr>
  <tr><th>Owner mailing address</th><td>${escapeHtml(p.ownerMailingAddress ?? "")}</td></tr>
  <tr><th>Property address</th><td>${escapeHtml(p.propertyAddress)}</td></tr>
  <tr><th>UPC (Uniform Parcel Code)</th><td>${escapeHtml(p.upc ?? "(to be supplied)")}</td></tr>
  <tr><th>County</th><td>${escapeHtml(p.countyName)}</td></tr>
  <tr><th>Tax year</th><td>${p.taxYear}</td></tr>
</table>
<p>This authorization remains in effect for the ${p.taxYear} tax year unless revoked in writing. Effective ${eff}.</p>
<div class="sig">
  <p>Property owner signature: ${sigLine(p.signature)}</p>
  <p>Date: ${p.signature ? eff : "____________________"}</p>
  <p><strong>${escapeHtml(p.ownerName)}</strong></p>
</div>
${p.sourceUrl ? `<p><small>Based on the official form: ${escapeHtml(p.sourceUrl)}</small></p>` : ""}
</body></html>`;
}
