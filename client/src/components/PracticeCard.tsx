import type { PracticeNextResponse } from "../types/api";

type PracticeCardProps = {
  prompt: PracticeNextResponse;
  answer: string;
  onAnswerChange: (value: string) => void;
  onSubmit: () => void;
  onNext: () => void;
  isSubmitting: boolean;
  isLoadingNext: boolean;
};

function getMasteryBand(masteryProbability: number) {
  if (masteryProbability < 0.4) {
    return "weak";
  }

  if (masteryProbability < 0.75) {
    return "developing";
  }

  return "strong";
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

export function PracticeCard({
  prompt,
  answer,
  onAnswerChange,
  onSubmit,
  onNext,
  isSubmitting,
  isLoadingNext,
}: PracticeCardProps) {
  const masteryBand = getMasteryBand(prompt.learnerState.masteryProbability);

  return (
    <form
      className="content-card practice-card-panel"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="card-kicker">{formatLabel(prompt.reason)}</div>
      <h2>{prompt.practiceItem.prompt}</h2>
      <div className="practice-metadata">
        <p className="practice-context">
          Target term: <strong>{prompt.kc.englishTerm}</strong>
        </p>
        <p className="practice-context">
          System: <strong>{formatLabel(prompt.kc.system)}</strong>
        </p>
        <div className="practice-badges">
          <span className={`band-pill ${masteryBand}`}>{masteryBand}</span>
          <span className="info-pill">
            {prompt.learnerState.opportunities} prior attempt
            {prompt.learnerState.opportunities === 1 ? "" : "s"}
          </span>
        </div>
      </div>
      <label className="field-label" htmlFor="practice-answer">
        Your answer
      </label>
      <input
        id="practice-answer"
        className="text-input"
        value={answer}
        onChange={(event) => onAnswerChange(event.target.value)}
        placeholder="Type the Spanish term"
        autoComplete="off"
        disabled={isSubmitting || isLoadingNext}
      />
      <div className="action-row">
        <button
          type="submit"
          className="primary-button"
          disabled={isSubmitting || isLoadingNext || answer.trim().length === 0}
        >
          {isSubmitting ? "Checking..." : "Check Answer"}
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={onNext}
          disabled={isSubmitting || isLoadingNext}
        >
          {isLoadingNext ? "Loading..." : "Next Term"}
        </button>
      </div>
    </form>
  );
}
