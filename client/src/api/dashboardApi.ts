import type { GetDashboardResponse } from "../types/api";
import type { DashboardCategorySummary, DashboardKCRow } from "../../../shared/types/dashboard";

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

const kcRows: DashboardKCRow[] = [
  {
    kcId: "kc-corazon",
    englishTerm: "heart",
    officialSpanish: "corazon",
    system: "cardiovascular",
    masteryProbability: 0.82,
    opportunities: 9,
    lastUpdatedAt: "2026-04-10T16:20:00.000Z",
    band: "strong",
  },
  {
    kcId: "kc-pulmones",
    englishTerm: "lungs",
    officialSpanish: "pulmones",
    system: "respiratory",
    masteryProbability: 0.61,
    opportunities: 5,
    lastUpdatedAt: "2026-04-11T14:10:00.000Z",
    band: "developing",
  },
  {
    kcId: "kc-rinon",
    englishTerm: "kidney",
    officialSpanish: "rinon",
    system: "urinary",
    masteryProbability: 0.36,
    opportunities: 3,
    lastUpdatedAt: "2026-04-09T09:05:00.000Z",
    band: "weak",
  },
  {
    kcId: "kc-hueso",
    englishTerm: "bone",
    officialSpanish: "hueso",
    system: "musculoskeletal",
    masteryProbability: 0.73,
    opportunities: 6,
    lastUpdatedAt: "2026-04-08T11:45:00.000Z",
    band: "strong",
  },
];

const categories: DashboardCategorySummary[] = [
  {
    system: "cardiovascular",
    averageMastery: 0.82,
    totalTerms: 1,
    practicedTerms: 1,
  },
  {
    system: "respiratory",
    averageMastery: 0.61,
    totalTerms: 1,
    practicedTerms: 1,
  },
  {
    system: "urinary",
    averageMastery: 0.36,
    totalTerms: 1,
    practicedTerms: 1,
  },
  {
    system: "musculoskeletal",
    averageMastery: 0.73,
    totalTerms: 1,
    practicedTerms: 1,
  },
];

export const dashboardApi = {
  async getDashboard(): Promise<GetDashboardResponse> {
    await delay(180);

    return {
      summary: {
        totalKCs: kcRows.length,
        practicedKCs: kcRows.filter((row) => row.opportunities > 0).length,
        weakCount: kcRows.filter((row) => row.band === "weak").length,
        developingCount: kcRows.filter((row) => row.band === "developing").length,
        strongCount: kcRows.filter((row) => row.band === "strong").length,
      },
      categories,
      kcRows,
    };
  },
};
