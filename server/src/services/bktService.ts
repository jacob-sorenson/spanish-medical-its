

import type { BKTParameters, LearnerKCState } 
from "../../../shared/types/bkt";

export interface BKTUpdateResult {
  previousMastery: number;
  posteriorBeforeLearning: number;
  updatedMastery: number;
}

function clampProbability(value: number): number {
  if (Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

export function updateBKT(
  currentMastery: number,
  params: BKTParameters,
  countedAsCorrect: boolean
): BKTUpdateResult {
  const pKnown = clampProbability(currentMastery);
  const pSlip = clampProbability(params.pSlip);
  const pGuess = clampProbability(params.pGuess);
  const pLearn = clampProbability(params.pLearn);

  let posteriorBeforeLearning: number;

  if (countedAsCorrect) {
    const numerator = pKnown * (1 - pSlip);
    const denominator = numerator + (1 - pKnown) * pGuess;
    posteriorBeforeLearning = denominator === 0 ? pKnown : numerator / denominator;
  } else {
    const numerator = pKnown * pSlip;
    const denominator = numerator + (1 - pKnown) * (1 - pGuess);
    posteriorBeforeLearning = denominator === 0 ? pKnown : numerator / denominator;
  }

  const updatedMastery =
    posteriorBeforeLearning + (1 - posteriorBeforeLearning) * pLearn;

  return {
    previousMastery: pKnown,
    posteriorBeforeLearning: clampProbability(posteriorBeforeLearning),
    updatedMastery: clampProbability(updatedMastery),
  };
}

export function initializeLearnerKCState(kcId: string, pInit: number): LearnerKCState {
  return {
    kcId,
    masteryProbability: clampProbability(pInit),
    opportunities: 0,
    correctCount: 0,
    incorrectCount: 0,
    lastPracticeAt: null,
    hasViewedLearn: false,
    firstViewedAt: null,
    lastViewedAt: null,
    learnViewCount: 0,
  };
}

export function applyPracticeResultToLearnerState(
  learnerState: LearnerKCState,
  params: BKTParameters,
  countedAsCorrect: boolean,
  practicedAt: string
): { learnerState: LearnerKCState; bkt: BKTUpdateResult } {
  const bkt = updateBKT(
    learnerState.masteryProbability,
    params,
    countedAsCorrect
  );

  return {
    learnerState: {
      ...learnerState,
      masteryProbability: bkt.updatedMastery,
      opportunities: learnerState.opportunities + 1,
      correctCount: learnerState.correctCount + (countedAsCorrect ? 1 : 0),
      incorrectCount: learnerState.incorrectCount + (countedAsCorrect ? 0 : 1),
      lastPracticeAt: practicedAt,
    },
    bkt,
  };
}