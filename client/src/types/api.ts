export type {
  GetDashboardResponse,
  GetKCsResponse,
  PracticeNextRequest,
  PracticeNextResponse,
  PracticeSubmitRequest,
  PracticeSubmitResponse,
  TutorExplainRequest,
  TutorExplainResponse,
} from "../../../shared/types/api";

export type Loadable<T> = {
  data: T | null;
  isLoading: boolean;
};

export type PracticeSessionView = {
  answer: string;
  isLoading: boolean;
  isSubmitting: boolean;
};
