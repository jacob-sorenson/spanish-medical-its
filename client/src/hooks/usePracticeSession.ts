import { useEffect, useState } from "react";
import type {
  PracticeNextResponse,
  PracticeSubmitResponse,
  TutorExplainResponse,
} from "../types/api";
import { practiceApi } from "../api/practiceApi";
import { tutorApi } from "../api/tutorApi";

export function usePracticeSession() {
  const [prompt, setPrompt] = useState<PracticeNextResponse | null>(null);
  const [feedback, setFeedback] = useState<PracticeSubmitResponse | null>(null);
  const [explanation, setExplanation] = useState<TutorExplainResponse | null>(null);
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadNext = async () => {
    setIsLoading(true);
    const nextPrompt = await practiceApi.getNextPracticeItem();
    setPrompt(nextPrompt);
    setFeedback(null);
    setExplanation(null);
    setAnswer("");
    setIsLoading(false);
  };

  useEffect(() => {
    void loadNext();
  }, []);

  const submitAnswer = async () => {
    if (!prompt || !answer.trim()) {
      return;
    }

    setIsSubmitting(true);

    const response = await practiceApi.submitPracticeAnswer({
      kcId: prompt.targetKc.id,
      practiceItemId: prompt.practiceItem.id,
      userAnswer: answer,
    });

    const tutorResponse = await tutorApi.getExplanation({
      kcId: prompt.targetKc.id,
      learnerAnswer: answer,
    });

    setFeedback(response);
    setExplanation(tutorResponse);
    setIsSubmitting(false);
  };

  return {
    prompt,
    feedback,
    explanation,
    answer,
    setAnswer,
    submitAnswer,
    loadNext,
    isLoading,
    isSubmitting,
  };
}
