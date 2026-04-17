import { FeedbackPanel } from "../components/FeedbackPanel";
import { PracticeCard } from "../components/PracticeCard";
import { usePracticeSession } from "../hooks/usePracticeSession";

export function PracticePage() {
  const {
    answer,
    error,
    feedback,
    isLoading,
    isSubmitting,
    prompt,
    setAnswer,
    submitAnswer,
    loadNext,
  } = usePracticeSession();

  if (!prompt) {
    return (
      <main className="page-shell content-shell">
        <section className="content-card empty-state">
          {error ? (
            <div className="stacked-state">
              <p>{error}</p>
              <button type="button" className="secondary-button" onClick={loadNext}>
                Try Again
              </button>
            </div>
          ) : (
            "Preparing your practice set..."
          )}
        </section>
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
          Current term: {prompt.kc.englishTerm} → {prompt.kc.system.replaceAll("_", " ")}
        </p>
      </section>
      {error ? (
        <section className="content-card error-banner full-span">
          <strong>Practice error:</strong> {error}
        </section>
      ) : null}
      <PracticeCard
        prompt={prompt}
        answer={answer}
        onAnswerChange={setAnswer}
        onSubmit={submitAnswer}
        onNext={loadNext}
        isSubmitting={isSubmitting}
        isLoadingNext={isLoading}
      />
      <FeedbackPanel feedback={feedback} />
    </main>
  );
}
