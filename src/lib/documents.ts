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
  ul{margin:8px 0;padding-left:20px;}
  li{margin:3px 0;}
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
  paymentDueDays?: number;
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
<h2>Scope of Services</h2>
<p>Client retains Company as Client's authorized representative for the property on Schedule A. Company agrees to provide:</p>
<ul>
  <li>Initial review and evaluation of protest eligibility (NMSA 1978 §§ 7-38-24 through 7-38-28).</li>
  <li>Preparation and timely filing of protest documentation with the county assessor.</li>
  <li>Attendance at informal hearings and presentation of supporting evidence.</li>
  <li>Attendance at formal hearings before the county valuation protests board, if necessary, to present the full case.</li>
</ul>
<h2>Authority and Discretion</h2>
<p>Company will use commercially reasonable efforts to achieve the maximum reduction. However, COMPANY MAKES NO GUARANTY OF ANY PARTICULAR OUTCOME. Company will pursue a reduction only where, in its judgment, one can reasonably be obtained.</p>
<h2>Compensation</h2>
<p>Client agrees to pay Company a contingent fee of <strong>${p.feePercent}%</strong> of the actual Property Tax Savings achieved (the difference between the assessed value on the initial Notice of Value and the final assessed value, at the applicable tax rate) plus any reduction from obtaining a missing exemption. <strong>If no tax savings are achieved, no fee is due.</strong> Payment is due within <strong>${p.paymentDueDays ?? 15} days</strong> of receipt of invoice. If an appeal beyond the valuation protests board is appropriate and Client agrees in writing, the contingent fee increases by <strong>${p.arbitrationUpliftPercent} percentage points</strong> for savings recovered at that stage.</p>
<h2>Client Responsibilities</h2>
<p>Client agrees to provide all relevant property records, assessment notices, and requested documentation necessary to pursue the protest, and to cooperate in a timely manner. Company is not responsible for inaccurate or incomplete information provided by Client.</p>
<h2>Non-Payment &amp; Remedies</h2>
<p>If payment is not made as agreed, Company reserves the right to pursue lawful collection remedies, including but not limited to interest charges, legal action, or filing of claims as permitted by applicable law.</p>
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
  ownerPhone?: string | null;
  ownerEmail?: string | null;
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
<h1>Letter of Authorization</h1>
<p class="sub">${escapeHtml(p.assessorOffice)} · Tax Year ${p.taxYear}</p>
<p>I/We hereby authorize <strong>NM Tax Appeals LLC</strong> ("Agent") to handle my/our property tax protest for the <strong>${p.taxYear}</strong> tax year before the ${escapeHtml(
    p.assessorOffice
  )}.</p>
<p>I/We also authorize the Agent to investigate any assessment years prior to the current tax year for potential corrections or errors.</p>
<p>I/We grant full authority to represent me/us in discussions, informal hearings, formal hearings, and any related proceedings necessary to pursue a property tax protest under NMSA 1978 § 7-38-24. This authorization includes the right to obtain relevant tax records, receive notices from the assessor, file necessary documentation, and engage legal counsel if required.</p>
<h2>Property(ies) to be protested</h2>
<table>
  <tr><th>Property address</th><td>${escapeHtml(p.propertyAddress)}</td></tr>
  <tr><th>UPC (Uniform Parcel Code)</th><td>${escapeHtml(p.upc ?? "(to be supplied)")}</td></tr>
  <tr><th>County</th><td>${escapeHtml(p.countyName)}</td></tr>
</table>
<div class="sig">
  <p>Property owner signature: ${sigLine(p.signature)}</p>
  <p>Date: ${p.signature ? eff : "____________________"}</p>
</div>
<h2>Contact information</h2>
<table>
  <tr><th>Printed name</th><td>${escapeHtml(p.ownerName)}</td></tr>
  <tr><th>Phone number</th><td>${escapeHtml(p.ownerPhone ?? "")}</td></tr>
  <tr><th>Mailing address (incl. ZIP)</th><td>${escapeHtml(p.ownerMailingAddress ?? "")}</td></tr>
  <tr><th>Email address</th><td>${escapeHtml(p.ownerEmail ?? "")}</td></tr>
</table>
<h2>Return completed form to</h2>
<p><small>NM Tax Appeals LLC · Bernalillo County, New Mexico · support@newmexicoappeals.com</small></p>
${p.sourceUrl ? `<p><small>Reconcile with the official form: ${escapeHtml(p.sourceUrl)}</small></p>` : ""}
</body></html>`;
}
