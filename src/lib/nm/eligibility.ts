// Light front-door heuristic. It does NOT value the property or promise an
// outcome — it flags likely grounds from a few intake answers so the operator
// knows where to look. All real analysis (comps, condition) is done by a human.

import { Ground } from "@/lib/enums";
import { daysUntil } from "./law";

export type IntakeSignals = {
  fullValue: number; // NOV full/market value
  priorYearValue?: number | null;
  purchasePrice?: number | null;
  purchaseDate?: Date | null;
  hasConditionIssues?: boolean;
  // exemptions the homeowner believes they qualify for
  qualifiesHeadOfFamily?: boolean;
  qualifiesVeteran?: boolean;
  qualifiesDisabledVeteran?: boolean;
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
  flags: Flag[];
  grounds: Ground[];
  deadlineDays: number;
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
        "Homeowner may qualify for an exemption (head-of-family / veteran) that isn't applied — worth confirming with the assessor.",
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
  let summary: string;
  if (deadlineDays < 0) {
    recommendation = "deadline_passed";
    summary =
      "The protest deadline appears to have passed. We can review whether any options remain (e.g., a claim for refund), but the standard protest window may be closed.";
  } else if (flags.some((f) => f.strength === "strong")) {
    recommendation = "worth_pursuing";
    summary =
      "This looks worth pursuing. There's at least one strong indicator that the assessed value may be too high.";
  } else {
    recommendation = "needs_review";
    summary =
      "We'll review this closely. Even without an obvious red flag, many assessments come down after a proper comparable-sales review.";
  }

  return { recommendation, flags, grounds, deadlineDays, summary };
}
