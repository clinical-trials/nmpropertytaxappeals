// Central vocabulary for the String-typed status/kind fields.
// SQLite has no enums, so these documented lists are the source of truth and
// are validated in code (zod) at the boundaries.

export const CASE_STATUSES = [
  "intake", // submitted, not yet engaged
  "qualified", // operator reviewed, worth pursuing
  "engaged", // agreement signed
  "filed", // protest petition filed with assessor
  "informal", // in informal negotiation with assessor
  "hearing_scheduled", // formal board/hearing officer date set
  "resolved", // outcome recorded
  "closed", // done + billed
  "declined", // not pursued
] as const;
export type CaseStatus = (typeof CASE_STATUSES)[number];

export const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  intake: "New intake",
  qualified: "Qualified",
  engaged: "Engaged",
  filed: "Protest filed",
  informal: "Informal negotiation",
  hearing_scheduled: "Hearing scheduled",
  resolved: "Resolved",
  closed: "Closed",
  declined: "Declined",
};

// Grounds for protest under NM law (NMSA 1978 § 7-38-24 et seq.).
export const GROUNDS = [
  "over_valuation", // value exceeds market value
  "unequal_appraisal", // valued higher than comparable properties
  "classification_error", // wrong property classification
  "missing_exemption", // head-of-family, veteran, etc. not applied
  "valuation_cap", // 3% residential cap exceeded (§ 7-36-21.2)
  "clerical_error", // factual/data error on the record
] as const;
export type Ground = (typeof GROUNDS)[number];

export const GROUND_LABELS: Record<Ground, string> = {
  over_valuation: "Over-valuation (above market value)",
  unequal_appraisal: "Unequal appraisal vs. comparable properties",
  classification_error: "Property classification error",
  missing_exemption: "Missing exemption (head-of-family, veteran, etc.)",
  valuation_cap: "3% residential valuation cap exceeded",
  clerical_error: "Clerical / factual error on the record",
};

export const AGREEMENT_STATUSES = [
  "draft",
  "sent",
  "viewed",
  "completed",
  "declined",
  "voided",
] as const;
export type AgreementStatus = (typeof AGREEMENT_STATUSES)[number];

export const FILING_OUTCOMES = [
  "pending",
  "informal_settled",
  "board_granted",
  "board_partial",
  "board_denied",
  "withdrawn",
] as const;
export type FilingOutcome = (typeof FILING_OUTCOMES)[number];

export const EVIDENCE_KINDS = [
  "comp",
  "photo",
  "appraisal",
  "condition_note",
  "document",
] as const;
export type EvidenceKind = (typeof EVIDENCE_KINDS)[number];
