import type { DashboardCategorySummary } from "../../../shared/types/dashboard";
import { formatMastery } from "../utils/formatMastery";

type CategorySummaryProps = {
  categories: DashboardCategorySummary[];
};

export function CategorySummary({ categories }: CategorySummaryProps) {
  return (
    <section className="summary-grid">
      {categories.map((category) => (
        <article key={category.system} className="content-card summary-card">
          <div className="card-kicker">{category.system.replaceAll("_", " ")}</div>
          <h3>{formatMastery(category.averageMastery)}</h3>
          <p>{category.practicedTerms} of {category.totalTerms} terms practiced</p>
          <div className="summary-meta">
            <span className="info-pill">{category.totalTerms} total</span>
            <span className="info-pill">{category.practicedTerms} practiced</span>
          </div>
        </article>
      ))}
    </section>
  );
}
