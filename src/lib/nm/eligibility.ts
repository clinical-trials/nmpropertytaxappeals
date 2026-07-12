// Light front-door heuristic. It does NOT value the property or promise an
// outcome — it flags likely grounds from a few intake answers so the operator
// knows where to look. All real analysis (comps, condition) is done by a human.

import { Ground } from "@/lib/enums";
import { daysUntil, computeRefundClaimDeadline } from "./law";

export type IntakeSignals = {
  fullValue: number; // NOV full/market value
  taxYear: number;
  priorYearValue?: number | null;
  purchasePrice?: number | null;
  purchaseDate?: Date | null;
  hasConditionIssues?: boolean;
  // exemptions / programs the homeowner believes they qualify for
  qualifiesHeadOfFamily?: boolean;
  qualifiesVeteran?: boolean;
  qualifiesDisabledVeteran?: boolean;
  qualifiesValuationFreeze?: boolean; // age 65+ or disabled, income-qualified
  // exemptions already applied on their bill
  claimsExemptionAlready?: boolean;
  protestDeadline: Date;
};

export type Flag = {
  ground: Ground;
  reason: string;
  strength: "strong" | "possible";
};

export type EligibilityResult = {
  recommendation: "worth_pursuing" | "needs_review" | "deadline_passed";
  /** Which track the case runs on. */
  track: "protest" | "refund_claim";
  flags: Flag[];
  grounds: Ground[];
  deadlineDays: number;
  /** ISO date of the claim-for-refund deadline (Jan 10 next year), when relevant. */
  refundClaimDeadline?: string;
  summary: string;
};

const RECENT_PURCHASE_MONTHS = 18;

function monthsBetween(a: Date, b: Date): number {
  return Math.abs(
    (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth())
  );
}

export function evaluate(s: IntakeSignals): EligibilityResult {
  const flags: Flag[] = [];
  const deadlineDays = daysUntil(s.protestDeadline);

  // Over-valuation vs. a recent arm's-length purchase.
  if (
    s.purchasePrice &&
    s.purchaseDate &&
    monthsBetween(s.purchaseDate, new Date()) <= RECENT_PURCHASE_MONTHS
  ) {
    if (s.fullValue > s.purchasePrice * 1.05) {
      const pct = Math.round((s.fullValue / s.purchasePrice - 1) * 100);
      flags.push({
        ground: "over_valuation",
        reason: `Assessed value is ~${pct}% above the recent purchase price — a recent sale is strong evidence of market value.`,
        strength: "strong",
      });
    }
  }

  // Residential 3% cap (NMSA § 7-36-21.2) — increase beyond 3% year-over-year.
  if (s.priorYearValue && s.priorYearValue > 0) {
    const increasePct = (s.fullValue / s.priorYearValue - 1) * 100;
    if (increasePct > 3.5) {
      flags.push({
        ground: "valuation_cap",
        reason: `Value rose ~${Math.round(
          increasePct
        )}% over last year; residential increases are generally capped at 3% (exceptions apply: new construction, change of ownership).`,
        strength: "possible",
      });
    }
  }

  // Missing exemptions.
  if (
    (s.qualifiesHeadOfFamily ||
      s.qualifiesVeteran ||
      s.qualifiesDisabledVeteran) &&
    !s.claimsExemptionAlready
  ) {
    flags.push({
      ground: "missing_exemption",
      reason:
        "Homeowner may qualify for an exemption (head-of-family / veteran / disabled veteran) that isn't applied — worth confirming with the assessor.",
      strength: s.qualifiesDisabledVeteran ? "strong" : "possible",
    });
  }

  // Valuation freeze (age 65+/disabled, income-qualified) — a value limitation,
  // not a taxable reduction, but a major saver worth flagging.
  if (s.qualifiesValuationFreeze) {
    flags.push({
      ground: "missing_exemption",
      reason:
        "Homeowner may qualify for the valuation freeze (age 65+ or disabled, income-qualified), which caps future value increases — confirm eligibility and application.",
      strength: "possible",
    });
  }

  // Condition problems support an over-valuation argument.
  if (s.hasConditionIssues) {
    flags.push({
      ground: "over_valuation",
      reason:
        "Reported condition issues can support a lower value than a standard mass appraisal assumes.",
      strength: "possible",
    });
  }

  const grounds = Array.from(new Set(flags.map((f) => f.ground)));

  let recommendation: EligibilityResult["recommendation"];
  let track: EligibilityResult["track"] = "protest";
  let summary: string;
  let refundClaimDeadline: string | undefined;

  if (deadlineDays < 0) {
    // Protest window closed -> the claim-for-refund path (District Court).
    recommendation = "deadline_passed";
    track = "refund_claim";
    const rc = computeRefundClaimDeadline(s.taxYear);
    refundClaimDeadline = rc.toISOString();
    const rcDays = daysUntil(rc);
    summary =
      rcDays >= 0
        ? "The 30-day protest window has passed, but you're not out of options: a claim for refund can be filed in District Court until January 10. Payments must be current. We'll review it and, if it holds up, handle the filing."
        : "Both the protest window and the January 10 claim-for-refund deadline appear to have passed for this tax year. We can review options for the next cycle.";
  } else if (flags.some((f) => f.strength === "strong")) {
    recommendation = "worth_pursuing";
    summary =
      "This looks worth pursuing. There's at least one strong indicator that the assessed value may be too high.";
  } else {
    recommendation = "needs_review";
    summary =
      "We'll review this closely. Even without an obvious red flag, many assessments come down after a proper comparable-sales review.";
  }

  return {
    recommendation,
    track,
    flags,
    grounds,
    deadlineDays,
    refundClaimDeadline,
    summary,
  };
}
