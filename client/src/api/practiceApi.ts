import type {
  PracticeNextRequest,
  PracticeNextResponse,
  PracticeSubmitRequest,
  PracticeSubmitResponse,
} from "../types/api";

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

const practiceQueue: PracticeNextResponse[] = [
  {
    targetKc: {
      id: "kc-corazon",
      englishTerm: "heart",
      officialSpanish: "corazon",
      system: "cardiovascular",
      termType: "anatomy",
    },
    practiceItem: {
      id: "item-heart-1",
      kcId: "kc-corazon",
      itemType: "typed_en_to_es",
      prompt: "Translate to Spanish: heart",
      correctAnswer: "corazon",
      acceptableAnswers: ["el corazon"],
      active: true,
      explanation: "Use the medical anatomy term, not a descriptive phrase.",
    },
    learnerState: null,
    reasonSelected: "new_term",
  },
  {
    targetKc: {
      id: "kc-pulmones",
      englishTerm: "lungs",
      officialSpanish: "pulmones",
      system: "respiratory",
      termType: "anatomy",
    },
    practiceItem: {
      id: "item-lungs-1",
      kcId: "kc-pulmones",
      itemType: "typed_en_to_es",
      prompt: "Translate to Spanish: lungs",
      correctAnswer: "pulmones",
      acceptableAnswers: [],
      active: true,
      explanation: "Plural matters here because the organ is referenced as a pair.",
    },
    learnerState: null,
    reasonSelected: "low_mastery",
  },
];

let currentIndex = 0;

const normalize = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

export const practiceApi = {
  async getNextPracticeItem(
    _request?: PracticeNextRequest,
  ): Promise<PracticeNextResponse> {
    await delay(150);
    const response = practiceQueue[currentIndex % practiceQueue.length];
    currentIndex += 1;
    return response;
  },

  async submitPracticeAnswer(
    request: PracticeSubmitRequest,
  ): Promise<PracticeSubmitResponse> {
    await delay(180);

    const match = practiceQueue.find(
      (item) =>
        item.targetKc.id === request.kcId &&
        item.practiceItem.id === request.practiceItemId,
    );

    const officialAnswer = match?.targetKc.officialSpanish ?? "";
    const acceptedAlternates = match?.practiceItem.acceptableAnswers ?? [];
    const acceptedAnswers = [officialAnswer, ...acceptedAlternates].map(normalize);
    const normalizedUserAnswer = normalize(request.userAnswer);

    const isCorrect = acceptedAnswers.includes(normalizedUserAnswer);

    return {
      scoring: {
        outcome: isCorrect ? "correct" : "incorrect",
        countedAsCorrectForBKT: isCorrect,
        normalizedUserAnswer,
      },
      feedback: {
        message: isCorrect
          ? "Correct. Keep the official term ready for recall."
          : "Not quite. Review the official term and try another item.",
        officialAnswer,
        acceptedAlternates,
        explanation: match?.practiceItem.explanation,
      },
      masteryUpdate: {
        kcId: request.kcId,
        before: isCorrect ? 0.54 : 0.54,
        after: isCorrect ? 0.7 : 0.42,
        opportunities: isCorrect ? 4 : 5,
        band: isCorrect ? "developing" : "weak",
      },
      nextRecommendation: {
        recommendedKcId: isCorrect ? "kc-pulmones" : request.kcId,
        reason: isCorrect ? "move_to_other_weak_term" : "retry_same_term",
      },
    };
  },
};
