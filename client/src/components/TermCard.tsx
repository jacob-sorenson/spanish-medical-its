import type { KnowledgeComponent } from "../../../shared/types/kc";

type TermCardProps = {
  kc: KnowledgeComponent;
  isSelected?: boolean;
  onSelect?: (kcId: string) => void;
};

export function TermCard({ kc, isSelected = false, onSelect }: TermCardProps) {
  return (
    <button
      type="button"
      className={`content-card term-card-button${isSelected ? " selected" : ""}`}
      onClick={() => {
        onSelect?.(kc.id);
      }}
    >
      <article className="term-card">
      <div className="card-kicker">{kc.system.replaceAll("_", " ")}</div>
      <h2>{kc.englishTerm}</h2>
      <p className="term-answer">{kc.officialSpanish}</p>
      <dl className="term-meta">
        <div>
          <dt>Type</dt>
          <dd>{kc.termType.replaceAll("_", " ")}</dd>
        </div>
        <div>
          <dt>Difficulty</dt>
          <dd>{Math.round(kc.difficulty * 100)}%</dd>
        </div>
        <div>
          <dt>Source</dt>
          <dd>Page {kc.sourcePage}</dd>
        </div>
      </dl>
      </article>
    </button>
  );
}
