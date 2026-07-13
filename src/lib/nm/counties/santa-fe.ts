import { County } from "./types";

// Santa Fe County. Owned by the Santa Fe work stream.
export const santaFe: County = {
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
      "Property tax payments must be current — pay the first half (due November 10, delinquent after December 10) before filing.",
    stateValuedNote:
      "If the property was valued by the New Mexico Taxation & Revenue Department (state-assessed) rather than the county assessor, the claim is filed in the District Court for Santa Fe County (the First Judicial District Court in Santa Fe).",
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
