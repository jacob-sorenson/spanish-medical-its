import type { PracticeNextResponse } from "../../../shared/types/api";

type PracticeCardProps = {
  prompt: PracticeNextResponse;
  answer: string;
  onAnswerChange: (value: string) => void;
  onSubmit: () => void;
  onNext: () => void;
  isSubmitting: boolean;
  hasFeedback: boolean;
};

export function PracticeCard({
  prompt,
  answer,
  onAnswerChange,
  onSubmit,
  onNext,
  isSubmitting,
  hasFeedback,
}: PracticeCardProps) {
  return (
    <form
      className="content-card practice-card-panel"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="card-kicker">{prompt.reasonSelected.replaceAll("_", " ")}</div>
      <h2>{prompt.practiceItem.prompt}</h2>
      <p className="practice-context">
        Target term: <strong>{prompt.targetKc.englishTerm}</strong> · System:{" "}
        <strong>{prompt.targetKc.system.replaceAll("_", " ")}</strong>
      </p>
      <label className="field-label" htmlFor="practice-answer">
        Your answer
      </label>
      <input
        id="practice-answer"
        className="text-input"
        value={answer}
        onChange={(event) => onAnswerChange(event.target.value)}
        placeholder="Type the Spanish term"
      />
      <div className="action-row">
        <button type="submit" className="primary-button" disabled={isSubmitting}>
          {isSubmitting ? "Checking..." : "Check Answer"}
        </button>
        <button type="button" className="secondary-button" onClick={onNext} disabled={isSubmitting || !hasFeedback}>
          Next Term
        </button>
      </div>
    </form>
  );
}
