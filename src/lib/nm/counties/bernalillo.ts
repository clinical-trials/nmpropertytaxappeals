import { County } from "./types";

// Bernalillo County (Albuquerque). Owned by the Bernalillo work stream.
export const bernalillo: County = {
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
    propertySearchUrl:
      "https://www.bernco.gov/assessor/find-a-property/assessor-property-record-search-portal/",
    appealPortalUrl:
      "https://www.bernco.gov/assessor/find-a-property/assessor-property-record-search-portal/",
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
      "Property tax payments must be current — pay the first half (due November 10, delinquent after December 10) before filing.",
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
      // VERIFY: Two additional refund forms exist but no official URLs are
      // confirmed — "Summons for Property Tax Refund" and "Request for
      // Interpreter". Do NOT add to forms[] until real URLs are verified
      // (FormLink requires a url). Mentioned in county notes below.
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
      "https://www.bernco.gov/assessor/wp-content/uploads/sites/44/2026/01/Agent-Authorization.pdf",
    protestFormUrl:
      "https://www.bernco.gov/assessor/wp-content/uploads/sites/44/2026/04/2026_Protest_Form-0409.pdf",
    residentialInfoUrl:
      "https://www.bernco.gov/assessor/wp-content/uploads/sites/44/2026/03/Residential-Property-Owners-03-2026-FW-FRONT.pdf",
    // Verified via search index (2026-07): Spanish 2026 Valuation Protest Pamphlet.
    pamphletSpanishUrl:
      "https://www.bernco.gov/assessor/wp-content/uploads/sites/44/2026/03/Protest-Pamphlet-2026-Spanish-revised-3-2026.pdf",
    // VERIFY: English 2026 Valuation Protest Pamphlet URL not confirmed.
    // bernco.gov returns 403 to automated fetches and search did not surface a
    // verified English 2026 URL (only the 2025 pamphlet). Do not invent —
    // populate pamphletUrl only once the real URL is verified.
  },
  specialDeadlines: [
    {
      label: "Business Personal Property (BPP) protests",
      note: "May 1 – June 1 (separate from the residential 30-day NOV window).",
    },
    {
      label: "Manufactured (mobile) home protests",
      note: "May 1 – June 1 (separate from the residential 30-day NOV window).",
    },
    {
      label: "Livestock protests",
      note: "May 1 – June 1 (separate from the residential 30-day NOV window).",
    },
    {
      label:
        "Tax-saving programs (exemptions, valuation freeze / limitation on increase, special method of valuation)",
      note: "No protest form required to apply; deadline is 30 days after the NOV mailing date.",
    },
  ],
  notes:
    "Notice of Value typically mailed on/before April 1; protest due within 30 days of the mailing date printed on the NOV. " +
    "Two additional District Court refund forms exist — 'Summons for Property Tax Refund' and 'Request for Interpreter' — " +
    "but no verified official URLs are available, so they are not linked here (obtain from the Second Judicial District Court or the Assessor).",
};
