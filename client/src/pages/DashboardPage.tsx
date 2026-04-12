import { CategorySummary } from "../components/CategorySummary";
import { MasteryTable } from "../components/MasteryTable";
import { useDashboard } from "../hooks/useDashboard";

export function DashboardPage() {
  const { dashboard, isLoading } = useDashboard();

  if (isLoading || !dashboard) {
    return (
      <main className="page-shell content-shell">
        <section className="content-card empty-state">Loading dashboard...</section>
      </main>
    );
  }

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
      <section className="summary-strip">
        <article className="content-card stat-card">
          <span>Total KCs</span>
          <strong>{dashboard.summary.totalKCs}</strong>
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
      <CategorySummary categories={dashboard.categories} />
      <MasteryTable rows={dashboard.kcRows} />
    </main>
  );
}
