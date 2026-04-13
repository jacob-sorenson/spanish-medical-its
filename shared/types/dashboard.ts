import type { MedicalSystem } from "./kc";

export interface DashboardKCRow {
  kcId: string;
  englishTerm: string;
  officialSpanish: string;
  system: MedicalSystem;
  masteryProbability: number;
  opportunities: number;
  lastPracticeAt: string | null;
  band: "weak" | "developing" | "strong";
}

export interface DashboardCategorySummary {
  system: MedicalSystem;
  averageMastery: number;
  totalTerms: number;
  practicedTerms: number;
}

export interface DashboardResponse {
  summary: {
    totalKCs: number;
    practicedKCs: number;
    weakCount: number;
    developingCount: number;
    strongCount: number;
  };
  categories: DashboardCategorySummary[];
  kcRows: DashboardKCRow[];
}