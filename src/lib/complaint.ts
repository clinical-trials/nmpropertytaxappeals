// Auto-generates the District Court "Complaint for Refund of Property Taxes
// Paid" for missed-deadline (refund_claim) cases — the operator's biggest manual
// step. Pulls the court, parties, fee, and deadline from the county config so
// there's nothing to look up. The operator reviews, then files on the county's
// official fillable complaint form.

import { getCounty } from "./nm/counties";
import { computeRefundClaimDeadline } from "./nm/law";
import { formatUsd } from "./savings";

export type ComplaintInput = {
  countyId: string;
  taxYear: number;
  ownerName: string;
  ownerMailingAddress?: string | null;
  situsAddress: string;
  upc?: string | null;
  initialAssessedValue?: number | null;
  targetValue?: number | null;
  representativeName?: string;
};

export function generateRefundComplaint(input: ComplaintInput): string {
  const county = getCounty(input.countyId);
  const rc = county?.refundClaim;
  const court = rc?.court ?? "District Court";
  const parcelLabel = county?.parcelIdLabel ?? "Parcel ID";
  const rep = input.representativeName ?? "NM Tax Appeals LLC";
  const deadline = computeRefundClaimDeadline(input.taxYear).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );
  const plaintiff = input.ownerName;
  const defendant =
    rc?.parties?.defendantLocallyValued ?? "The county assessor";

  const lines = [
    `COMPLAINT FOR REFUND OF PROPERTY TAXES PAID`,
    `In the ${court}${rc?.address ? `, ${rc.address}` : ""}`,
    `Tax year ${input.taxYear}`,
    ``,
    `${plaintiff}, Plaintiff,`,
    `v.`,
    `${defendant}, Defendant.`,
    ``,
    `PARTIES`,
    `1. Plaintiff is the owner of the property described below and files this`,
    `   complaint for refund of property taxes paid (Plaintiff).`,
    `2. Defendant: ${defendant}`,
    rc?.stateValuedNote ? `   Note: ${rc.stateValuedNote}` : ``,
    ``,
    `PROPERTY`,
    `   Property address: ${input.situsAddress}`,
    `   ${parcelLabel}: ${input.upc ?? "(to be supplied)"}`,
    `   Mailing address: ${input.ownerMailingAddress ?? input.situsAddress}`,
    ``,
    `ALLEGATIONS`,
    `3. The property was valued for the ${input.taxYear} tax year at`,
    `   ${formatUsd(input.initialAssessedValue)}, which exceeds its correct`,
    `   value. Plaintiff's opinion of correct value is ${formatUsd(
      input.targetValue
    )}.`,
    `4. Plaintiff has paid the taxes due (the first-half payment is current), a`,
    `   prerequisite to this claim.`,
    `5. This complaint is filed on or before ${deadline}${rc?.deadlineNote ? "" : ""}.`,
    ``,
    `RELIEF REQUESTED`,
    `   Plaintiff requests that the Court order the assessed value corrected and`,
    `   a refund of the resulting overpayment of property taxes, with any relief`,
    `   the Court deems just.`,
    ``,
    rc?.filingFee ? `Filing fee: ${rc.filingFee}` : ``,
    `Authorized representative: ${rep}`,
    `Date: ____________________`,
    `Plaintiff / representative signature: ____________________`,
    ``,
    `NOTE: File on the county's official "Complaint for Refund of Property Taxes`,
    `Paid" form (and Arbitration Certificate / Summons where required).`,
  ];

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
