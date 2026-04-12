import type { BKTParameters, LearnerKCState } from "./bkt";
import type { DashboardResponse } from "./dashboard";
import type { MedicalSystem, TermType, KnowledgeComponent } from "./kc";
import type { PracticeItem } from "./practice";

export interface GetKCsResponse {
  kcs: KnowledgeComponent[];
}

export interface GetKCByIdResponse {
  kc: KnowledgeComponent;
  learnerState: LearnerKCState | null;
  bktParams: BKTParameters;
}

export type GetDashboardResponse = DashboardResponse;

export interface PracticeNextRequest {
  preferredSystem?: MedicalSystem;
  excludeKcIds?: string[];
}

export interface PracticeNextResponse {
  targetKc: {
    id: string;
    englishTerm: string;
    officialSpanish: string;
    system: MedicalSystem;
    termType: TermType;
  };
  practiceItem: PracticeItem;
  learnerState: LearnerKCState | null;
  reasonSelected: "low_mastery" | "needs_review" | "new_term" | "category_balance";
}

export interface PracticeSubmitRequest {
  kcId: string;
  practiceItemId: string;
  userAnswer: string;
}

export interface PracticeSubmitResponse {
  scoring: {
    outcome: "correct" | "accepted_alternate" | "incorrect";
    countedAsCorrectForBKT: boolean;
    normalizedUserAnswer: string;
  };
  feedback: {
    message: string;
    officialAnswer: string;
    acceptedAlternates: string[];
    explanation?: string;
  };
  masteryUpdate: {
    kcId: string;
    before: number;
    after: number;
    opportunities: number;
    band: "weak" | "developing" | "strong";
  };
  nextRecommendation: {
    recommendedKcId: string;
    reason: "retry_same_term" | "move_to_other_weak_term" | "category_review";
  };
}

export interface TutorExplainRequest {
  kcId: string;
  learnerAnswer?: string;
}

export interface TutorExplainResponse {
  kcId: string;
  explanation: string;
  exampleSentence?: string;
  note?: string;
}
