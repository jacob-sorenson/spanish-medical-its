import type { PracticeSubmitResponse } from "../types/api";
import { formatMastery } from "../utils/formatMastery";

type FeedbackPanelProps = {
  feedback: PracticeSubmitResponse | null;
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

function getOutcomeMessage(outcome: PracticeSubmitResponse["scoring"]["outcome"]) {
  switch (outcome) {
    case "correct":
      return "Correct";
    case "accepted_alternate":
      return "Accepted Alternate";
    case "incorrect":
      return "Incorrect";
  }
}

export function FeedbackPanel({ feedback }: FeedbackPanelProps) {
  if (!feedback) {
    return (
      <section className="content-card feedback-panel empty-state">
        Submit an answer to see scoring, feedback, and the updated mastery band.
      </section>
    );
  }

  const updatedBand = getMasteryBand(feedback.learnerStateAfter.masteryProbability);

  return (
    <section className="content-card feedback-panel">
      <div className="feedback-header">
        <h3>{getOutcomeMessage(feedback.scoring.outcome)}</h3>
        <span className={`band-pill ${updatedBand}`}>{updatedBand}</span>
      </div>
      <div className="feedback-stack">
        <p>
          Official answer: <strong>{feedback.practiceItem.correctAnswer}</strong>
        </p>
        {feedback.practiceItem.acceptableAnswers.length > 0 ? (
          <p>
            Accepted alternates:{" "}
            <strong>{feedback.practiceItem.acceptableAnswers.join(", ")}</strong>
          </p>
        ) : null}
        {feedback.practiceItem.explanation ? <p>{feedback.practiceItem.explanation}</p> : null}
        <div className="feedback-note">
          <strong>Mastery:</strong> {formatMastery(feedback.learnerStateBefore.masteryProbability)}{" "}
          to {formatMastery(feedback.learnerStateAfter.masteryProbability)}
        </div>
        <div className="feedback-note">
          <strong>BKT Counted Correct:</strong>{" "}
          {feedback.scoring.countedAsCorrectForBKT ? "Yes" : "No"}
        </div>
        <div className="feedback-note">
          <strong>Attempts:</strong> {feedback.learnerStateAfter.opportunities} total ·{" "}
          {feedback.learnerStateAfter.correctCount} correct ·{" "}
          {feedback.learnerStateAfter.incorrectCount} incorrect
        </div>
      </div>
    </section>
  );
}
