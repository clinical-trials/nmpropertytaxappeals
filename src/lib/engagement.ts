// Engagement (Property Tax Services Agreement) logic: render the document,
// compute renewal dates, and finalize a completed signing from either the
// DocuSign Connect webhook or the mock signing page.

import { db } from "./db";
import { formatUsd } from "./savings";

export function computeCancelByDate(taxYear: number): Date {
  // Auto-renews each year; cancellation notice due by March 1 of the next year.
  return new Date(taxYear + 1, 2, 1); // month 2 = March
}

export type AgreementRenderParams = {
  clientName: string;
  feePercent: number;
  arbitrationUpliftPercent: number;
  taxYear: number;
  effectiveDate: Date;
  properties: { address: string; ownerName: string }[];
};

/**
 * New Mexico-adapted Property Tax Services Agreement.
 *
 * NOTE: New Mexico property tax services agreement (County Assessor, County
 * Valuation Protests Board, NMSA 1978 §§ 7-38-24..28). It carries a visible
 * DRAFT banner and MUST be reviewed and approved by a New Mexico attorney
 * before use with real clients.
 */
export function renderAgreementHtml(p: AgreementRenderParams): string {
  const scheduleRows = p.properties
    .map(
      (pr) =>
        `<tr><td>${escapeHtml(pr.address)}</td><td>${escapeHtml(
          pr.ownerName
        )}</td></tr>`
    )
    .join("");
  const eff = p.effectiveDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `<!doctype html><html><head><meta charset="utf-8"/>
<style>
  body{font-family:Georgia,'Times New Roman',serif;color:#1c1a17;line-height:1.5;max-width:720px;margin:0 auto;padding:24px;}
  h1{font-size:20px;text-align:center;margin-bottom:4px;}
  h2{font-size:13px;letter-spacing:.04em;text-transform:uppercase;margin-top:20px;border-bottom:1px solid #ddd;padding-bottom:2px;}
  .draft{background:#fff3cd;border:1px solid #e0c56b;color:#6b5310;padding:8px 12px;font-family:Arial,sans-serif;font-size:12px;border-radius:6px;margin-bottom:16px;}
  table{border-collapse:collapse;width:100%;margin-top:8px;font-size:13px;}
  td,th{border:1px solid #bbb;padding:6px 8px;text-align:left;}
  .sig{margin-top:32px;border-top:1px solid #999;padding-top:12px;}
  small{color:#666;}
</style></head><body>
<div class="draft">DRAFT — New Mexico property tax services agreement. Pending review and approval by a New Mexico attorney before use with clients.</div>
<h1>Property Tax Services Agreement</h1>
<p style="text-align:center;"><small>NM Tax Appeals LLC, a New Mexico limited liability company ("Company")</small></p>

<p>This Property Tax Services Agreement (this "Agreement") is made as of the Effective Date (<strong>${eff}</strong>) by and between the undersigned ("Client") and Company.</p>

<h2>Services</h2>
<p>Client retains Company and designates Company as Client's authorized representative for matters relating to the reduction of the property taxes of the properties listed on Schedule A (the "Property"). Company will perform property tax consulting services (the "Services") in a professional manner and in accordance with applicable New Mexico law. The Services may include reviewing county assessor records, requesting correction of errors, filing a protest with the county assessor, conducting informal negotiations, and representing Client at a hearing before the county valuation protests board (or hearing officer) under NMSA 1978 §§ 7-38-24 through 7-38-28.</p>

<h2>Client Responsibilities</h2>
<p>Company's ability to obtain a reduction depends on Client's cooperation. Client agrees to sign any authorization or appointment-of-representative document required by the county assessor upon request. Client will promptly provide information requested by Company, including property condition and relevant financial information. Company is not responsible for inaccurate or incomplete information provided by Client. If Client fails to provide requested information, Company may terminate this Agreement on written notice.</p>

<h2>Authority and Discretion</h2>
<p>Company will use commercially reasonable efforts to achieve the maximum property tax reduction. However, COMPANY MAKES NO GUARANTY, REPRESENTATION, OR WARRANTY OF ANY PARTICULAR OUTCOME, and no employee or agent of Company is authorized to estimate potential tax savings. Company has sole discretion to decide what Services to provide for a given Property and tax year and will pursue a reduction only where, in its judgment, one can reasonably be obtained. Company may resolve a protest through informal negotiation without proceeding to a formal hearing. Company will not pursue an appeal beyond the county valuation protests board (e.g., to the New Mexico Court of Appeals) without Client's prior written consent.</p>

<h2>Fee</h2>
<p>Company will receive a contingent fee of <strong>${p.feePercent}%</strong> of (i) Property Tax Savings for the current year and (ii) any recovered tax overpayments from prior years (the "Contingent Fee"). "Property Tax Savings" means the difference between the assessed value on the initial Notice of Value and the final assessed value, multiplied by the applicable tax rate, plus any tax reduction attributable to obtaining a missing exemption. Savings are calculated using the latest known tax rates. The fee includes timely filing of the protest, negotiating with the county assessor, and certifying the result.</p>

<h2>Further Appeal</h2>
<p>If Company believes an appeal beyond the county valuation protests board is appropriate and Client agrees in writing to proceed, the contingent fee will increase by <strong>${p.arbitrationUpliftPercent} percentage points</strong> for all savings recovered at that stage, and Client is responsible for any applicable filing or court fees. Representation in any court appeal is subject to a separate agreement.</p>

<h2>Payment</h2>
<p>Invoices are due upon receipt. If the Property is sold within the current protest year, the full fee is due regardless of the sale date.</p>

<h2>Term</h2>
<p>This Agreement continues through the ${p.taxYear} tax year and renews automatically each year until cancelled by written notice from Client to Company at support@newmexicoappeals.com, sent no later than March 1 of the applicable year.</p>

<h2>General</h2>
<p>This Agreement is the entire agreement between the parties and may be modified only in a writing signed by both parties. It is governed by the laws of the State of New Mexico, and the parties submit to the exclusive jurisdiction and venue of the state and federal courts located in Bernalillo County, New Mexico.</p>

<h2>Disclaimer</h2>
<p>Company makes no representation that it will achieve any tax reduction and disclaims all warranties other than the express representations in this Agreement. Company's liability for any error, omission, action, inaction, statement, or representation is limited to the fees actually paid under this Agreement for the year(s) in dispute.</p>

<h2>Schedule A — Properties</h2>
<table><thead><tr><th>Property Address</th><th>Owner Name</th></tr></thead>
<tbody>${scheduleRows}</tbody></table>

<div class="sig">
  <p>Client signature: /sig1/</p>
  <p>Date: /date1/</p>
  <p><strong>${escapeHtml(p.clientName)}</strong></p>
</div>
</body></html>`;
}

export type AgentAuthRenderParams = {
  ownerName: string;
  ownerMailingAddress?: string | null;
  propertyAddress: string;
  upc?: string | null;
  countyName: string;
  assessorOffice: string;
  taxYear: number;
  effectiveDate: Date;
  sourceUrl?: string;
};

/**
 * County Agent Authorization / Appointment-of-Agent document. Every homeowner
 * signs this so NM Tax Appeals LLC is recognized by the county assessor as the
 * owner's authorized representative for the protest.
 *
 * NOTE: This mirrors the substance required by the Bernalillo County Agent
 * Authorization form and NMSA 1978 § 7-38-24, but the exact field layout should
 * be reconciled against, and filed on, the official county PDF (sourceUrl).
 */
export function renderAgentAuthHtml(p: AgentAuthRenderParams): string {
  const eff = p.effectiveDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return `<!doctype html><html><head><meta charset="utf-8"/>
<style>
  body{font-family:Georgia,'Times New Roman',serif;color:#1c1a17;line-height:1.5;max-width:720px;margin:0 auto;padding:24px;}
  h1{font-size:19px;text-align:center;margin-bottom:2px;}
  .sub{text-align:center;color:#666;font-size:12px;margin-bottom:16px;}
  .draft{background:#fff3cd;border:1px solid #e0c56b;color:#6b5310;padding:8px 12px;font-family:Arial,sans-serif;font-size:12px;border-radius:6px;margin-bottom:16px;}
  table{border-collapse:collapse;width:100%;margin:10px 0;font-size:13px;}
  td,th{border:1px solid #bbb;padding:6px 8px;text-align:left;}
  .sig{margin-top:28px;border-top:1px solid #999;padding-top:12px;}
  small{color:#666;}
</style></head><body>
<div class="draft">DRAFT — reconcile field layout with, and file on, the official ${escapeHtml(
    p.countyName
  )} Agent Authorization form. Attorney review required before use.</div>
<h1>Agent Authorization</h1>
<p class="sub">${escapeHtml(p.assessorOffice)} · Tax Year ${p.taxYear}</p>

<p>The undersigned property owner hereby appoints and authorizes <strong>NM Tax Appeals LLC</strong> ("Agent") to act as the owner's authorized representative before the ${escapeHtml(
    p.assessorOffice
  )} for all matters relating to the valuation, classification, allocation of value, and exemptions of the property identified below for the ${p.taxYear} tax year.</p>

<p>This authorization empowers the Agent to file a petition of protest under NMSA 1978 § 7-38-24, to receive notices and correspondence from the assessor on the owner's behalf, to review the assessor's records for the property, to conduct informal conferences and negotiations, and to appear and present evidence at any hearing before the county valuation protests board.</p>

<table>
  <tr><th>Property owner</th><td>${escapeHtml(p.ownerName)}</td></tr>
  <tr><th>Owner mailing address</th><td>${escapeHtml(
    p.ownerMailingAddress ?? ""
  )}</td></tr>
  <tr><th>Property address</th><td>${escapeHtml(p.propertyAddress)}</td></tr>
  <tr><th>UPC (Uniform Parcel Code)</th><td>${escapeHtml(
    p.upc ?? "(to be supplied)"
  )}</td></tr>
  <tr><th>County</th><td>${escapeHtml(p.countyName)}</td></tr>
  <tr><th>Tax year</th><td>${p.taxYear}</td></tr>
</table>

<p>This authorization remains in effect for the ${p.taxYear} tax year unless revoked in writing by the owner. Effective ${eff}.</p>

<div class="sig">
  <p>Property owner signature: /sig2/</p>
  <p>Date: /date2/</p>
  <p><strong>${escapeHtml(p.ownerName)}</strong></p>
</div>
${
  p.sourceUrl
    ? `<p><small>Based on the official form: ${escapeHtml(p.sourceUrl)}</small></p>`
    : ""
}
</body></html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Finalize a completed signing. Called by the DocuSign Connect webhook and by
 * the mock signing page. Idempotent-ish: only transitions from a non-completed
 * state.
 */
export async function completeEngagement(params: {
  agreementId: string;
  envelopeId?: string | null;
  signerIp?: string | null;
  source: "docusign_webhook" | "mock";
}): Promise<void> {
  const agreement = await db.engagementAgreement.findUnique({
    where: { id: params.agreementId },
    include: { cases: true },
  });
  if (!agreement) throw new Error("Agreement not found");
  if (agreement.status === "completed") return;

  await db.$transaction([
    db.engagementAgreement.update({
      where: { id: agreement.id },
      data: {
        status: "completed",
        completedAt: new Date(),
        envelopeId: params.envelopeId ?? agreement.envelopeId,
        signerIp: params.signerIp ?? agreement.signerIp,
      },
    }),
    db.case.updateMany({
      where: { agreementId: agreement.id, status: { in: ["intake", "qualified"] } },
      data: { status: "engaged" },
    }),
    db.auditLog.create({
      data: {
        entityType: "EngagementAgreement",
        entityId: agreement.id,
        action: "signed",
        ip: params.signerIp ?? null,
        meta: JSON.stringify({
          source: params.source,
          envelopeId: params.envelopeId ?? agreement.envelopeId,
        }),
      },
    }),
  ]);
}

export { formatUsd };
