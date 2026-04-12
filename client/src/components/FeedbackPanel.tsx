import type { PracticeSubmitResponse, TutorExplainResponse } from "../../../shared/types/api";
import { formatMastery } from "../utils/formatMastery";

type FeedbackPanelProps = {
  feedback: PracticeSubmitResponse | null;
  explanation: TutorExplainResponse | null;
};

export function FeedbackPanel({ feedback, explanation }: FeedbackPanelProps) {
  if (!feedback) {
    return (
      <section className="content-card feedback-panel empty-state">
        Submit an answer to see scoring, feedback, and the updated mastery band.
      </section>
    );
  }

  return (
    <section className="content-card feedback-panel">
      <div className="feedback-header">
        <h3>{feedback.feedback.message}</h3>
        <span className={`band-pill ${feedback.masteryUpdate.band}`}>
          {feedback.masteryUpdate.band}
        </span>
      </div>
      <p>
        Official answer: <strong>{feedback.feedback.officialAnswer}</strong>
      </p>
      <p>
        Mastery moved from {formatMastery(feedback.masteryUpdate.before)} to{" "}
        {formatMastery(feedback.masteryUpdate.after)}.
      </p>
      {feedback.feedback.explanation ? <p>{feedback.feedback.explanation}</p> : null}
      {explanation ? (
        <div className="feedback-note">
          <strong>Tutor note:</strong> {explanation.explanation}
        </div>
      ) : null}
    </section>
  );
}
