// Generates the protest petition from case data, structured to satisfy the
// statement requirements of NMSA 1978 § 7-38-24(B). The operator reviews it and
// files it on the county's official protest form (see county.forms.protestFormUrl).

import { GROUND_LABELS, Ground } from "./enums";
import { getCounty } from "./nm/counties";
import { formatUsd } from "./savings";

export type PetitionInput = {
  countyId: string;
  taxYear: number;
  ownerName: string;
  situsAddress: string;
  upc?: string | null;
  mailingAddress?: string | null;
  initialAssessedValue?: number | null;
  targetValue?: number | null;
  grounds: Ground[];
  representativeName?: string;
};

export function generatePetition(input: PetitionInput): string {
  const county = getCounty(input.countyId);
  const countyName = county?.name ?? input.countyId;
  const assessor = county?.assessor?.office ?? `${countyName} Assessor`;
  const parcelLabel = county?.parcelIdLabel ?? "Parcel ID";
  const hearingBody = county?.hearingBody ?? "county valuation protests board";
  const officialForm = county?.forms?.protestFormUrl;
  const rep = input.representativeName ?? "NM Tax Appeals LLC";

  const grounds = input.grounds.length ? input.grounds : ["over_valuation" as Ground];

  // § 7-38-24(B)(3): why it's incorrect and what the owner believes is correct.
  const whyIncorrect = grounds
    .map((g) => `  • ${GROUND_LABELS[g]}`)
    .join("\n");

  // § 7-38-24(B)(4): the value/classification NOT in controversy.
  const notInControversy =
    input.targetValue != null
      ? `Owner concedes a value of ${formatUsd(
          input.targetValue
        )} (the value not in controversy).`
      : `Owner's opinion of value to be supplied with evidence (the value not in controversy).`;

  const lines = [
    `PETITION OF PROTEST — ${input.taxYear} NOTICE OF VALUE`,
    `Filed with the ${assessor} under NMSA 1978 § 7-38-24`,
    officialForm ? `(File on the official county form: ${officialForm})` : ``,
    ``,
    `1. FILING DEADLINE — § 7-38-24(B)(1)`,
    `   This petition is filed within 30 days of the mailing of the Notice of Value.`,
    ``,
    `2. OWNER & PROPERTY — § 7-38-24(B)(2)`,
    `   Property owner:    ${input.ownerName}`,
    `   Owner address:     ${input.mailingAddress ?? input.situsAddress}`,
    `   Property address:  ${input.situsAddress}`,
    `   ${parcelLabel}: ${input.upc ?? "(to be supplied)"}`,
    `   Tax year:          ${input.taxYear}`,
    ``,
    `3. BASIS OF PROTEST — § 7-38-24(B)(3)`,
    `   Assessed value on Notice of Value: ${formatUsd(input.initialAssessedValue)}`,
    `   Owner's opinion of correct value:  ${formatUsd(input.targetValue)}`,
    `   The owner believes the assessor's determination is incorrect for the`,
    `   following reason(s):`,
    whyIncorrect,
    ``,
    `4. VALUE NOT IN CONTROVERSY — § 7-38-24(B)(4)`,
    `   ${notInControversy}`,
    ``,
    `RELIEF REQUESTED`,
    `   The owner requests that the assessed value be corrected to the owner's`,
    `   opinion of value and that any applicable exemptions be applied.`,
    `   Comparable-sales and/or condition evidence will be presented at the`,
    `   informal conference and any hearing before the ${hearingBody}.`,
    ``,
    `Upon receipt, the assessor will schedule a hearing before the ${hearingBody}`,
    `and provide notice by certified mail at least 15 days beforehand`,
    `(§ 7-38-24(C)); an informal conference may be held first (§ 7-38-24(D)).`,
    ``,
    `Authorized representative: ${rep}`,
    `Date filed: ____________________`,
    `Owner / representative signature: ____________________`,
  ];

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
