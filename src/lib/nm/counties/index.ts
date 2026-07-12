// County registry. Each fully-configured county lives in its own file so
// counties can be developed independently; unsupported counties are generated
// as stubs. NM state law is uniform (see ../law.ts).

import { County } from "./types";
import { bernalillo } from "./bernalillo";
import { santaFe } from "./santa-fe";

export * from "./types";

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

/** Fully-configured, live counties. Add a county's file import above. */
export const CONFIGURED_COUNTIES: County[] = [bernalillo, santaFe];

export const COUNTIES: County[] = [...CONFIGURED_COUNTIES, ...otherCounties].sort(
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
