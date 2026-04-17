import { useEffect, useState } from "react";
import type {
  PracticeNextResponse,
  PracticeSubmitResponse,
} from "../types/api";
import { practiceApi } from "../api/practiceApi";

export function usePracticeSession() {
  const [prompt, setPrompt] = useState<PracticeNextResponse | null>(null);
  const [feedback, setFeedback] = useState<PracticeSubmitResponse | null>(null);
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNext = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const nextPrompt = await practiceApi.getNextPracticeItem();
      setPrompt(nextPrompt);
      setFeedback(null);
      setAnswer("");
    } catch (loadError) {
      setPrompt(null);
      setFeedback(null);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load the next practice item.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadNext();
  }, []);

  const submitAnswer = async () => {
    if (!prompt || !answer.trim()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await practiceApi.submitPracticeAnswer({
        kcId: prompt.kc.id,
        practiceItemId: prompt.practiceItem.id,
        userAnswer: answer,
      });

      setFeedback(response);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit your answer.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    prompt,
    feedback,
    answer,
    setAnswer,
    submitAnswer,
    loadNext,
    isLoading,
    isSubmitting,
    error,
  };
}
