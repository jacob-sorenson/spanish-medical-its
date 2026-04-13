export interface BKTParameters {
  kcId: string;
  pInit: number;
  pLearn: number;
  pSlip: number;
  pGuess: number;
}

export interface LearnerKCState {
  kcId: string;
  masteryProbability: number;
  opportunities: number;
  correctCount: number;
  incorrectCount: number;
  lastPracticeAt: string | null;
  hasViewedLearn: boolean;
  firstViewedAt: string | null;
  lastViewedAt: string | null;
  learnViewCount: number;
}

export interface AttemptRecord {
  id: string;
  kcId: string;
  practiceItemId: string;
  userAnswer: string;
  normalizedAnswer: string;
  outcome: "correct" | "accepted_alternate" | "incorrect";
  countedAsCorrectForBKT: boolean;
  masteryBefore: number;
  masteryAfter: number;
  submittedAt: string;
}