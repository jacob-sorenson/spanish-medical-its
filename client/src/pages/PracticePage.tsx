import { FeedbackPanel } from "../components/FeedbackPanel";
import { PracticeCard } from "../components/PracticeCard";
import { usePracticeSession } from "../hooks/usePracticeSession";

export function PracticePage() {
  const {
    answer,
    explanation,
    feedback,
    isLoading,
    isSubmitting,
    prompt,
    setAnswer,
    submitAnswer,
    loadNext,
  } = usePracticeSession();

  if (isLoading || !prompt) {
    return (
      <main className="page-shell content-shell">
        <section className="content-card empty-state">Preparing your practice set...</section>
      </main>
    );
  }

  return (
    <main className="page-shell content-shell two-column-layout">
      <section className="page-header full-span">
        <p className="eyebrow">Practice</p>
        <h1>Active Recall</h1>
        <p className="hero-text">
          Answer one item at a time, then inspect the tutor feedback and mastery update.
        </p>
        <p className="page-caption">
          Current term: {prompt.targetKc.englishTerm} → {prompt.targetKc.system.replaceAll("_", " ")}
        </p>
      </section>
      <PracticeCard
        prompt={prompt}
        answer={answer}
        onAnswerChange={setAnswer}
        onSubmit={submitAnswer}
        onNext={loadNext}
        isSubmitting={isSubmitting}
        hasFeedback={feedback !== null}
      />
      <FeedbackPanel feedback={feedback} explanation={explanation} />
    </main>
  );
}
