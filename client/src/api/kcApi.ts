import type { GetKCsResponse } from "../types/api";

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

const kcs: GetKCsResponse["kcs"] = [
  {
    id: "kc-corazon",
    slug: "heart",
    system: "cardiovascular",
    termType: "anatomy",
    englishTerm: "heart",
    officialSpanish: "corazon",
    backupTerms: [],
    otherTerms: ["miocardio"],
    difficulty: 0.4,
    sourcePage: 12,
    active: true,
  },
  {
    id: "kc-pulmones",
    slug: "lungs",
    system: "respiratory",
    termType: "anatomy",
    englishTerm: "lungs",
    officialSpanish: "pulmones",
    backupTerms: [],
    otherTerms: [],
    difficulty: 0.35,
    sourcePage: 18,
    active: true,
  },
  {
    id: "kc-rinon",
    slug: "kidney",
    system: "urinary",
    termType: "anatomy",
    englishTerm: "kidney",
    officialSpanish: "rinon",
    backupTerms: [],
    otherTerms: ["renal"],
    difficulty: 0.52,
    sourcePage: 27,
    active: true,
  },
  {
    id: "kc-hueso",
    slug: "bone",
    system: "musculoskeletal",
    termType: "anatomy",
    englishTerm: "bone",
    officialSpanish: "hueso",
    backupTerms: [],
    otherTerms: [],
    difficulty: 0.28,
    sourcePage: 33,
    active: true,
  },
];

export const kcApi = {
  async getKCs(): Promise<GetKCsResponse> {
    await delay(120);
    return { kcs };
  },
};
