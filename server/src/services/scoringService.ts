import { normalizeAnswer } from "../utils/normalizeAnswer";

export type ScoreOutcome = "correct" | "accepted_alternate" | "incorrect";

export interface ScoringResult {
  outcome: ScoreOutcome;
  countedAsCorrectForBKT: boolean;
  normalizedUserAnswer: string;
}

export interface ScorablePracticeItem {
  correctAnswer: string;
  acceptableAnswers: string[];
}

export function scoreResponse(
  practiceItem: ScorablePracticeItem,
  userAnswer: string
): ScoringResult {
  const normalizedUserAnswer = normalizeAnswer(userAnswer);
  const normalizedCorrectAnswer = normalizeAnswer(practiceItem.correctAnswer);

  if (normalizedUserAnswer === normalizedCorrectAnswer) {
    return {
      outcome: "correct",
      countedAsCorrectForBKT: true,
      normalizedUserAnswer,
    };
  }

  const normalizedAcceptableAnswers = practiceItem.acceptableAnswers.map((answer) =>
    normalizeAnswer(answer)
  );

  if (normalizedAcceptableAnswers.includes(normalizedUserAnswer)) {
    return {
      outcome: "accepted_alternate",
      countedAsCorrectForBKT: true,
      normalizedUserAnswer,
    };
  }

  return {
    outcome: "incorrect",
    countedAsCorrectForBKT: false,
    normalizedUserAnswer,
  };
}