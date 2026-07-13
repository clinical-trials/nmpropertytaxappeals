// Shared county-config types. County-specific data lives in one file per
// county (e.g. bernalillo.ts, santa-fe.ts) so counties can be developed
// independently. NM state law is uniform (see ../law.ts).

export type FilingMethod = "in_person" | "mail" | "online";

export type FormLink = { label: string; url: string };

export type RefundClaim = {
  /** Court where a missed-deadline claim for refund is filed (locally-valued). */
  court: string;
  address?: string;
  room?: string;
  filingFee?: string;
  /** When the claim must be filed. */
  deadlineNote: string;
  /** Payment prerequisite. */
  paymentNote?: string;
  /**
   * Where the claim is filed when the property was valued by the NM Taxation &
   * Revenue Department (state-assessed) rather than the county assessor.
   */
  stateValuedNote?: string;
  forms?: FormLink[];
  selfHelp?: string;
};

export type County = {
  slug: string;
  name: string;
  /** True once the county is fully configured and open for intake. */
  supported: boolean;
  assessor?: {
    office: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    hours?: string;
    filingMethods?: FilingMethod[];
    protestFiledWith?: string;
    /** Public property/parcel search (used to look up the UPC by address). */
    propertySearchUrl?: string;
    /** Online protest / appeal portal. */
    appealPortalUrl?: string;
  };
  /** Name of the body that hears formal protests. */
  hearingBody?: string;
  /** Plain note on the protest filing window. */
  protestFilingWindowNote?: string;
  /** Note on amended notices of value. */
  amendedNovNote?: string;
  /** Note on online filing / access codes. */
  onlineProtestNote?: string;
  /** Missed-deadline claim-for-refund path (District Court). */
  refundClaim?: RefundClaim;
  /**
   * Default effective mill rate (dollars of tax per $1,000 of NET taxable
   * value) used for *estimated* savings. VERIFY against the property's actual
   * tax district; operators can override per case.
   */
  defaultMillRate?: number;
  /** Label the county uses for a parcel id. */
  parcelIdLabel?: string;
  /** Official county forms this county's process uses. */
  forms?: {
    agentAuthorizationUrl?: string;
    protestFormUrl?: string;
    residentialInfoUrl?: string;
    pamphletUrl?: string;
    pamphletSpanishUrl?: string;
    helpGuideUrl?: string;
    protestLetterUrl?: string;
  };
  /** Extra protest-window notes (e.g. BPP/manufactured homes deadlines). */
  specialDeadlines?: { label: string; note: string }[];
  /** Operator reference facts, for validating assumptions in the back office. */
  reference?: {
    /** Typical resolution outcome, e.g. ~80% settle by agreement. */
    resolutionNote?: string;
    /** Mass-appraisal accuracy note, e.g. 5–10% may be misvalued. */
    massAppraisalNote?: string;
    /** When the valuation protests board typically hears cases. */
    hearingSchedule?: string[];
    /** Statutory basis + key deadlines, in one place to sanity-check against. */
    legalBasis?: string;
  };
  notes?: string;
};
