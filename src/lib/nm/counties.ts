// Per-county configuration. NM state law is uniform (see law.ts); the
// county-specific bits — assessor office, protest form, board/hearing process,
// filing method, and a default mill rate for savings estimates — live here.
//
// Bernalillo is fully configured for v1. Every other NM county is present as an
// unsupported stub so the app is genuinely statewide-ready: expanding a county
// means filling in one object, not touching app code.

export type FilingMethod = "in_person" | "mail" | "online";

export type County = {
  slug: string;
  name: string;
  /** True once the county is fully configured and open for intake. */
  supported: boolean;
  assessor?: {
    office: string;
    address?: string;
    phone?: string;
    website?: string;
    /** Where/how a protest petition is filed. */
    filingMethods?: FilingMethod[];
    protestFiledWith?: string;
    /** Public property/parcel search (used to look up the UPC by address). */
    propertySearchUrl?: string;
  };
  /** Name of the body that hears formal protests. */
  hearingBody?: string;
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
    /** Agent-authorization / appointment-of-agent form (signed by owner). */
    agentAuthorizationUrl?: string;
    /** The county's protest / petition form. */
    protestFormUrl?: string;
    /** Homeowner guidance sheet. */
    residentialInfoUrl?: string;
  };
  notes?: string;
};

const bernalillo: County = {
  slug: "bernalillo",
  name: "Bernalillo County",
  supported: true,
  assessor: {
    office: "Bernalillo County Assessor",
    address: "501 Tijeras Ave NW, Albuquerque, NM 87102",
    phone: "(505) 222-3700",
    website: "https://www.bernco.gov/assessor/",
    filingMethods: ["in_person", "mail", "online"],
    protestFiledWith:
      "Bernalillo County Assessor (Protest / Petition), then heard by the county valuation protests board",
    propertySearchUrl: "https://www.bernco.gov/assessor/property-record-search/",
  },
  hearingBody: "Bernalillo County Valuation Protests Board",
  // VERIFY: residential rates vary by tax district (in-city vs. unincorporated,
  // school districts). This is a placeholder for estimates only.
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

// The remaining 32 NM counties as unsupported stubs (waitlist on intake).
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
  "Santa Fe",
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

export const COUNTIES: County[] = [bernalillo, ...otherCounties].sort((a, b) =>
  a.name.localeCompare(b.name)
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
