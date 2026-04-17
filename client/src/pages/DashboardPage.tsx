import { CategorySummary } from "../components/CategorySummary";
import { MasteryTable } from "../components/MasteryTable";
import { useDashboard } from "../hooks/useDashboard";

export function DashboardPage() {
  const { dashboard, isLoading, error, reloadDashboard } = useDashboard();

  if (!dashboard) {
    return (
      <main className="page-shell content-shell">
        <section className="content-card empty-state">
          {error ? (
            <div className="stacked-state">
              <p>{error}</p>
              <button type="button" className="secondary-button" onClick={reloadDashboard}>
                Try Again
              </button>
            </div>
          ) : (
            "Loading dashboard..."
          )}
        </section>
      </main>
    );
  }

  const sortedRows = [...dashboard.kcRows].sort((a, b) => {
    if (a.masteryProbability !== b.masteryProbability) {
      return a.masteryProbability - b.masteryProbability;
    }

    return a.englishTerm.localeCompare(b.englishTerm);
  });

  return (
    <main className="page-shell content-shell">
      <section className="page-header">
        <p className="eyebrow">Dashboard</p>
        <h1>Mastery Overview</h1>
        <p className="hero-text">
          Track weak terms, category balance, and the current distribution of mastery.
        </p>
        <p className="page-caption">
          {dashboard.summary.practicedKCs} of {dashboard.summary.totalKCs} terms have practice history.
        </p>
      </section>
      {error ? (
        <section className="content-card error-banner">
          <strong>Refresh error:</strong> {error}
        </section>
      ) : null}
      <section className="summary-strip">
        <article className="content-card stat-card">
          <span>Total KCs</span>
          <strong>{dashboard.summary.totalKCs}</strong>
        </article>
        <article className="content-card stat-card">
          <span>Practiced</span>
          <strong>{dashboard.summary.practicedKCs}</strong>
        </article>
        <article className="content-card stat-card">
          <span>Weak</span>
          <strong>{dashboard.summary.weakCount}</strong>
        </article>
        <article className="content-card stat-card">
          <span>Developing</span>
          <strong>{dashboard.summary.developingCount}</strong>
        </article>
        <article className="content-card stat-card">
          <span>Strong</span>
          <strong>{dashboard.summary.strongCount}</strong>
        </article>
      </section>
      {isLoading ? (
        <section className="content-card loading-banner">Refreshing dashboard data...</section>
      ) : null}
      <CategorySummary categories={dashboard.categories} />
      <MasteryTable rows={sortedRows} />
    </main>
  );
}
