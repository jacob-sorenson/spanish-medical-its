import type { TutorExplainRequest, TutorExplainResponse } from "../types/api";

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

export const tutorApi = {
  async getExplanation(
    request: TutorExplainRequest,
  ): Promise<TutorExplainResponse> {
    await delay(100);

    return {
      kcId: request.kcId,
      explanation:
        "Focus on the official clinical vocabulary first, then attach alternates only after the core form is stable.",
      exampleSentence: "El corazon bombea sangre por todo el cuerpo.",
      note: request.learnerAnswer
        ? `Your last response was "${request.learnerAnswer}". Compare it against the official term.`
        : "Ask for another explanation after you attempt the term once.",
    };
  },
};
