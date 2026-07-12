// Per-county configuration. NM state law is uniform (see law.ts); the
// county-specific bits live here. Bernalillo and Santa Fe are fully configured
// and live; every other NM county is present as an unsupported stub so the app
// is genuinely statewide-ready — adding a county means filling in one object.
//
// The homeowner-facing intake stays deliberately simple; the depth (refund
// claims, court filing, official forms, portals) lives here and in the back
// office. Values marked VERIFY should be confirmed against current county data.

export type FilingMethod = "in_person" | "mail" | "online";

export type FormLink = { label: string; url: string };

export type RefundClaim = {
  /** Court where a missed-deadline claim for refund is filed. */
  court: string;
  address?: string;
  room?: string;
  filingFee?: string;
  /** When the claim must be filed. */
  deadlineNote: string;
  /** Payment prerequisite. */
  paymentNote?: string;
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
  notes?: string;
};

const bernalillo: County = {
  slug: "bernalillo",
  name: "Bernalillo County",
  supported: true,
  assessor: {
    office: "Bernalillo County Assessor",
    address: "415 Silver Ave SW, Albuquerque, NM 87102",
    phone: "(505) 222-3700",
    email: "Assessor@bernco.gov",
    website: "https://www.bernco.gov/assessor/",
    filingMethods: ["online", "in_person", "mail"],
    protestFiledWith:
      "Bernalillo County Assessor (Protest / Petition), then heard by the county valuation protests board",
    propertySearchUrl: "https://www.bernco.gov/assessor/property-record-search/",
    appealPortalUrl: "https://www.bernco.gov/assessor/",
  },
  hearingBody: "Bernalillo County Valuation Protests Board",
  protestFilingWindowNote:
    "File within 30 days of the mailing date printed on the Notice of Value.",
  amendedNovNote:
    "Amended Notice of Value: 30 days from the amended NOV mail date. Filing by email should use the subject line 'AMENDED NOTICE OF VALUE'; amended protests may also be filed at 415 Silver Ave SW.",
  onlineProtestNote:
    "File online via the county Appeal Portal using the Online Protest Access Code printed on your Notice of Value.",
  refundClaim: {
    court: "Second Judicial District Court",
    address: "400 Lomas Blvd NW, Albuquerque, NM (Civil Division, 1st floor)",
    room: "Room 119",
    filingFee: "$132.00 (cash, credit/debit — not Amex, money order, or cashier's check to the Clerk of the District Court)",
    deadlineNote:
      "If the protest deadline was missed, a claim for refund may be filed until January 10 of the following year.",
    paymentNote:
      "Property tax payments must be current — pay the first half of the tax bill before filing.",
    forms: [
      {
        label: "Instructions for Refund of Property Taxes Paid",
        url: "https://www.bernco.gov/assessor/wp-content/uploads/sites/44/2025/12/Instructions_Property_Tax_Refund.pdf",
      },
      {
        label: "Complaint for Refund of Property Taxes Paid (fillable)",
        url: "https://www.bernco.gov/assessor/wp-content/uploads/sites/44/2025/12/Complaint_Refund_Property_Taxes_Paid-Fillable.pdf",
      },
      {
        label: "Arbitration Certificate for Property Tax Refund (fillable)",
        url: "https://www.bernco.gov/assessor/wp-content/uploads/sites/44/2025/12/Arbitration_Certificate_Property_Tax_Refund-Fillable.pdf",
      },
    ],
    selfHelp:
      "Second Judicial District Court Self-Help Center: (505) 841-6702 · albdselfhelp@nmcourts.gov",
  },
  // VERIFY: residential rates vary by tax district (in-city vs. unincorporated,
  // school districts). Placeholder for estimates only.
  defaultMillRate: 40,
  parcelIdLabel: "UPC (Uniform Parcel Code)",
  forms: {
    agentAuthorizationUrl:
      "https://www.bernco.gov/assessor/wp-content/uploads/sites/44/2026/03/Agent-Authorization.pdf",
    protestFormUrl:
      "https://www.bernco.gov/assessor/wp-content/uploads/sites/44/2026/04/2026_Protest_Form-0409.pdf",
    residentialInfoUrl:
      "https://www.bernco.gov/assessor/wp-content/uploads/sites/44/2026/03/Residential-Property-Owners-03-2026-FW-FRONT.pdf",
  },
  notes:
    "Notice of Value typically mailed on/before April 1; protest due within 30 days of the mailing date printed on the NOV.",
};

const santaFe: County = {
  slug: "santa_fe",
  name: "Santa Fe County",
  supported: true,
  assessor: {
    office: "Santa Fe County Assessor",
    address: "240 Grant Avenue, Santa Fe, NM 87501",
    phone: "(505) 986-6300",
    email: "assessor@santafecountynm.gov",
    website: "https://www.santafecountynm.gov/assessor",
    hours: "8:00am – 5:00pm, Monday–Friday",
    filingMethods: ["online", "in_person", "mail"],
    protestFiledWith:
      "Santa Fe County Assessor (via the online CRM portal or in person), then heard by the county valuation protests board",
    propertySearchUrl:
      "https://www.santafecountynm.gov/assessor/forms-documents",
    appealPortalUrl:
      "https://www.santafecountynm.gov/assessor/forms-documents/crm-portal/steps-for-protesting-online",
  },
  hearingBody: "Santa Fe County Valuation Protests Board",
  protestFilingWindowNote:
    "File within 30 days of the NOV mailing (the online portal accepts protests during May).",
  onlineProtestNote:
    "File online through the Santa Fe CRM portal: create an account, add your property using the key code printed on your Notice of Value, then submit a protest.",
  refundClaim: {
    court: "First Judicial District Court (Santa Fe)",
    deadlineNote:
      "If the protest deadline was missed, a claim for refund may be filed until January 10 of the following year.",
    paymentNote:
      "Property tax payments must be current — pay the first half of the tax bill before filing.",
  },
  // VERIFY: Santa Fe residential mill rates vary by tax district.
  defaultMillRate: 30,
  parcelIdLabel: "UPC (Uniform Parcel Code)",
  forms: {
    protestFormUrl:
      "https://www.santafecountynm.gov/assessor/uploads/documents/2026_protest_form.pdf",
    pamphletUrl:
      "https://www.santafecountynm.gov/assessor/uploads/documents/2026_Protest_Pamphlet_%28revised_3-2026%29.pdf",
    helpGuideUrl:
      "https://www.santafecountynm.gov/assessor/uploads/documents/2026_Help_Guide.pdf",
    protestLetterUrl:
      "https://www.santafecountynm.gov/assessor/uploads/documents/2026_Protest_Letter_240.pdf",
  },
  notes:
    "Notice of Value mailed in the spring; protest within 30 days of the mailing date. Online filing uses the key/access code on the NOV.",
};

// The remaining NM counties as unsupported stubs (waitlist on intake).
const OTHER_COUNTY_NAMES = [
  "Catron",
  "Chaves",
  "Cibola",
  "Colfax",
  "Curry",
  "De Baca",
  "Doña Ana",
  "Eddy",
  "Grant",
  "Guadalupe",
  "Harding",
  "Hidalgo",
  "Lea",
  "Lincoln",
  "Los Alamos",
  "Luna",
  "McKinley",
  "Mora",
  "Otero",
  "Quay",
  "Rio Arriba",
  "Roosevelt",
  "Sandoval",
  "San Juan",
  "San Miguel",
  "Sierra",
  "Socorro",
  "Taos",
  "Torrance",
  "Union",
  "Valencia",
];

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents (Doña -> dona)
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

const otherCounties: County[] = OTHER_COUNTY_NAMES.map((name) => ({
  slug: slugify(name),
  name: `${name} County`,
  supported: false,
}));

export const COUNTIES: County[] = [bernalillo, santaFe, ...otherCounties].sort(
  (a, b) => a.name.localeCompare(b.name)
);

export const COUNTIES_BY_SLUG: Record<string, County> = Object.fromEntries(
  COUNTIES.map((c) => [c.slug, c])
);

export function getCounty(slug: string): County | undefined {
  return COUNTIES_BY_SLUG[slug];
}

export function supportedCounties(): County[] {
  return COUNTIES.filter((c) => c.supported);
}

export function isSupported(slug: string): boolean {
  return !!getCounty(slug)?.supported;
}
