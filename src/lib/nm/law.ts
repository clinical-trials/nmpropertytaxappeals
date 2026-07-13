// New Mexico property-tax law core — uniform statewide rules.
// County-specific details (forms, boards, portals) live in counties.ts.
//
// IMPORTANT: statutory dollar amounts below are marked VERIFY and must be
// confirmed against current NMSA / constitutional amendments before relying on
// them in client-facing math. They are used only for soft internal heuristics.

/** NM assesses at 33 1/3% of full value (net taxable value = 1/3 full value). */
export const ASSESSMENT_RATIO = 1 / 3;

/** Days to file a protest after the assessor mails the Notice of Value. */
export const PROTEST_WINDOW_DAYS = 30; // NMSA 1978 § 7-38-24

/** Residential year-over-year valuation increase cap. */
export const RESIDENTIAL_VALUATION_CAP_PCT = 3; // NMSA 1978 § 7-36-21.2

/**
 * NM property tax payment schedule (statewide). Taxes are paid in two halves.
 * The first-half payment being current is a prerequisite for filing a
 * claim for refund (see county.refundClaim).
 */
export const PROPERTY_TAX_PAYMENTS = {
  firstHalf: { dueLabel: "November 10", delinquentAfterLabel: "December 10" },
  secondHalf: { dueLabel: "April 10", delinquentAfterLabel: "May 10" },
} as const;

export type Exemption = {
  slug: string;
  label: string;
  /** Reduction of *taxable* value in dollars, or "full" for total exemption. */
  taxableReduction: number | "full";
  note: string;
};

// VERIFY all amounts with current statute before using in client math.
export const EXEMPTIONS: Exemption[] = [
  {
    slug: "head_of_family",
    label: "Head of family",
    taxableReduction: 2000, // VERIFY § 7-37-4
    note: "Available to a NM resident who is head of a household.",
  },
  {
    slug: "veteran",
    label: "Veteran's exemption",
    taxableReduction: 4000, // VERIFY — increased by recent amendment; confirm current amount
    note: "Honorably discharged veteran (or surviving spouse). Amount recently changed — verify.",
  },
  {
    slug: "disabled_veteran",
    label: "Disabled veteran exemption",
    taxableReduction: "full",
    note: "Full exemption on the veteran's primary residence (100% service-connected disability).",
  },
];

/**
 * Valuation "freeze" — the limitation on increase in value for a single-family
 * residence occupied by a low-income owner who is 65+ or disabled
 * (NMSA 1978 § 7-36-21.3). Not a taxable-value reduction; it freezes the
 * property's value, so it's modeled separately from EXEMPTIONS.
 */
export const VALUATION_FREEZE = {
  slug: "valuation_freeze",
  label: "Valuation freeze (age 65+ or disabled, income-qualified)",
  note: "Freezes the property's value for a qualifying owner-occupant who is 65 or older (or disabled) and within the income limit. VERIFY current income limit.",
};

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Protest deadline = NOV mailing date + 30 days. The date printed on the NOV
 * controls if the homeowner has it; this is the fallback computation.
 */
export function computeProtestDeadline(mailingDate: Date): Date {
  return startOfDay(addDays(mailingDate, PROTEST_WINDOW_DAYS));
}

/**
 * Claim-for-refund deadline for a missed protest: January 10 of the year
 * following the tax year (District Court civil action; payments must be
 * current). See county.refundClaim for court + forms.
 */
export function computeRefundClaimDeadline(taxYear: number): Date {
  return new Date(taxYear + 1, 0, 10); // Jan 10 of the next year
}

export function daysUntil(deadline: Date, from: Date = new Date()): number {
  const ms = startOfDay(deadline).getTime() - startOfDay(from).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export type DeadlineUrgency = "past" | "urgent" | "soon" | "ok";

export function deadlineUrgency(
  deadline: Date,
  from: Date = new Date()
): DeadlineUrgency {
  const days = daysUntil(deadline, from);
  if (days < 0) return "past";
  if (days <= 5) return "urgent";
  if (days <= 14) return "soon";
  return "ok";
}

/** Net taxable value before exemptions. */
export function netTaxableValue(fullValue: number): number {
  return Math.round(fullValue * ASSESSMENT_RATIO);
}
