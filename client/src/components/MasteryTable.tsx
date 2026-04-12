import type { DashboardKCRow } from "../../../shared/types/dashboard";
import { formatMastery } from "../utils/formatMastery";

type MasteryTableProps = {
  rows: DashboardKCRow[];
};

export function MasteryTable({ rows }: MasteryTableProps) {
  return (
    <section className="content-card">
      <div className="section-heading">
        <h2>Knowledge Components</h2>
      </div>
      <div className="table-shell">
        <table className="mastery-table">
          <thead>
            <tr>
              <th>English</th>
              <th>Spanish</th>
              <th>System</th>
              <th>Mastery</th>
              <th>Band</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.kcId}>
                <td>{row.englishTerm}</td>
                <td>{row.officialSpanish}</td>
                <td>{row.system.replaceAll("_", " ")}</td>
                <td>{formatMastery(row.masteryProbability)}</td>
                <td>
                  <span className={`band-pill ${row.band}`}>{row.band}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
