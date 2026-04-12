import { TermCard } from "../components/TermCard";
import { useKCs } from "../hooks/useKCs";

export function LearnPage() {
  const { isLoading, kcs } = useKCs();

  return (
    <main className="page-shell content-shell">
      <section className="page-header">
        <p className="eyebrow">Learn</p>
        <h1>Term Library</h1>
        <p className="hero-text">
          Review official medical Spanish terms before moving into recall practice.
        </p>
        {!isLoading ? (
          <p className="page-caption">{kcs.length} starter knowledge components loaded.</p>
        ) : null}
      </section>

      {isLoading ? (
        <section className="content-card empty-state">Loading terms...</section>
      ) : (
        <section className="card-grid">
          {kcs.map((kc) => (
            <TermCard key={kc.id} kc={kc} />
          ))}
        </section>
      )}
    </main>
  );
}
