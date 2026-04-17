import type { AttemptRecord, BKTParameters, LearnerKCState } from "../../../shared/types/bkt";
import type { KnowledgeComponent } from "../../../shared/types/kc";
import type { PracticeItem } from "../../../shared/types/practice";

export type {
  GetDashboardResponse,
  GetKCsResponse,
  TutorExplainRequest,
  TutorExplainResponse,
} from "../../../shared/types/api";

export type DashboardData = import("../../../shared/types/dashboard").DashboardResponse;

export type PracticeSelectionReason = "new_term" | "low_mastery";

export interface PracticeNextResponse {
  kc: KnowledgeComponent;
  practiceItem: PracticeItem;
  learnerState: LearnerKCState;
  params: BKTParameters;
  reason: PracticeSelectionReason;
}

export interface PracticeSubmitRequest {
  kcId: string;
  practiceItemId: string;
  userAnswer: string;
}

export interface PracticeSubmitResponse {
  kc: KnowledgeComponent;
  practiceItem: PracticeItem;
  params: BKTParameters;
  learnerStateBefore: LearnerKCState;
  learnerStateAfter: LearnerKCState;
  scoring: {
    outcome: "correct" | "accepted_alternate" | "incorrect";
    countedAsCorrectForBKT: boolean;
    normalizedUserAnswer: string;
  };
  attemptRecord: AttemptRecord;
}

export type Loadable<T> = {
  data: T | null;
  isLoading: boolean;
};

export type PracticeSessionView = {
  answer: string;
  isLoading: boolean;
  isSubmitting: boolean;
};
