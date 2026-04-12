import type { KnowledgeComponent } from "../../../shared/types/kc";

type TermCardProps = {
  kc: KnowledgeComponent;
};

export function TermCard({ kc }: TermCardProps) {
  return (
    <article className="content-card term-card">
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
  );
}
