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
}
