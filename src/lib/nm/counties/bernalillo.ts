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
      "https://assessor.bernco.gov/public.access/search/commonsearch.aspx?mode=realprop",
    appealPortalUrl: "https://www.bernco.gov/assessor/protest-process/",
  },
  treasurer: {
    phone: "(505) 468-7031",
    altPhone: "(505) 462-9768",
    email: "Treasurers@bernco.gov",
    hours: "Monday–Friday, 8 a.m. – 5 p.m.",
    location: "415 Silver Avenue SW, Albuquerque, NM 87102",
    mailingAddress:
      "Bernalillo County Treasurer, P.O. Box 27800, Albuquerque, NM 87125-7800",
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
      "If no protest was filed, NMSA 1978 §§ 7-38-39 & -40 require a claim for refund in District Court no later than the 60th day after the first installment is due (≈ January 10). If a protest WAS filed and is pending, still pay the first half by December 10: if the protest is approved a corrected bill issues and any overpayment is refunded; if denied, you've avoided late fees.",
    paymentNote:
      "You must pay the amount due on the bill before filing a claim for refund — pay the first half (due November 10, delinquent after December 10) first.",
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
  // NM DFA TY2025 certificate (latest final rates during the 2026 appeal
  // season). Default = 48.323 mills for district "12 IN R" (Albuquerque,
  // in-city residential) — the most common case. Other residential districts:
  //   38.216  12 OUT R (unincorporated)
  //   31.696  12 IN LR R (Los Ranchos)
  //   31.089  12 IN T R (Tijeras)
  //   27.747  8T R (Rio Rancho)
  // County residential component is 8.357 mills in most districts (8.416 for
  // 2A IN R). Rates vary by district + PIDs; operator overrides per case.
  // Source: nmdfa.state.nm.us .../Bernalillo-County-2025-rev-Sept-19-2025.pdf
  defaultMillRate: 48.323,
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
    "NOV mailed on/before April 1; protest due within 30 days (the practical 2026 regular-NOV deadline was May 1, 2026). " +
    "File with the ASSESSOR, not the Treasurer — no protest filing fee. Channels: online portal (NOV access code), email assessor@bernco.gov, " +
    "mail to Office of the Assessor, PO Box 27108, Albuquerque, NM 87125, or in person at 415 Silver Ave SW. Protest process: bernco.gov/assessor/protest-process. " +
    "Assessment math: Assessor sets full value as of Jan 1; NM taxes one-third of it (taxable value); the bill = net taxable value (after exemptions) × the district mill rate. " +
    "Residential cap (§ 7-36-21.2): value generally can't exceed the higher of 103% of last year's value or 106.1% of the value two years earlier — the cap does NOT apply in the first year valued, after a change of ownership, after a use/zoning change, or for new non-solar improvements. " +
    "Keep paying the Treasurer while a protest is pending — a protest does not pause payment. No official countywide success rate is published; do not advertise one. " +
    "Two District Court refund forms ('Summons for Property Tax Refund', 'Request for Interpreter') have no verified public URLs, so they are not linked (obtain from the Second Judicial District Court or the Assessor).",
};
