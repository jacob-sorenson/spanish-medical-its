import { useMemo, useState } from "react";
import type { DashboardKCRow } from "../../../shared/types/dashboard";
import { formatMastery } from "../utils/formatMastery";

type MasteryTableProps = {
  rows: DashboardKCRow[];
};

type SortKey =
  | "english"
  | "spanish"
  | "system"
  | "mastery"
  | "attempts"
  | "lastPractice";
type SortDirection = "asc" | "desc";

function formatLastPracticeAt(value: string | null) {
  if (!value) {
    return "Never practiced";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function MasteryTable({ rows }: MasteryTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("mastery");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const sortedRows = useMemo(() => {
    const nextRows = [...rows];

    nextRows.sort((a, b) => {
      let comparison = 0;

      if (sortKey === "english") {
        comparison = a.englishTerm.localeCompare(b.englishTerm);
      } else if (sortKey === "spanish") {
        comparison = a.officialSpanish.localeCompare(b.officialSpanish);
      } else if (sortKey === "system") {
        comparison = a.system.localeCompare(b.system);
        if (comparison === 0) {
          comparison = a.englishTerm.localeCompare(b.englishTerm);
        }
      } else {
        if (sortKey === "mastery") {
          comparison = a.masteryProbability - b.masteryProbability;
        } else if (sortKey === "attempts") {
          comparison = a.opportunities - b.opportunities;
        } else {
          const aTime = a.lastPracticeAt ? new Date(a.lastPracticeAt).getTime() : -1;
          const bTime = b.lastPracticeAt ? new Date(b.lastPracticeAt).getTime() : -1;
          comparison = aTime - bTime;
        }

        if (comparison === 0) {
          comparison = a.englishTerm.localeCompare(b.englishTerm);
        }
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return nextRows;
  }, [rows, sortDirection, sortKey]);

  const handleSort = (nextKey: SortKey) => {
    if (sortKey === nextKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(nextKey);
    setSortDirection("asc");
  };

  const renderSortLabel = (key: SortKey) => {
    if (sortKey !== key) {
      return "sort";
    }

    return sortDirection === "asc" ? "asc" : "desc";
  };

  return (
    <section className="content-card">
      <div className="section-heading">
        <h2>Knowledge Components</h2>
      </div>
      <div className="table-shell">
        <table className="mastery-table">
          <thead>
            <tr>
              <th>
                <button
                  type="button"
                  className="table-sort-button"
                  onClick={() => {
                    handleSort("english");
                  }}
                >
                  English
                  <span className="table-sort-indicator">{renderSortLabel("english")}</span>
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="table-sort-button"
                  onClick={() => {
                    handleSort("spanish");
                  }}
                >
                  Spanish
                  <span className="table-sort-indicator">{renderSortLabel("spanish")}</span>
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="table-sort-button"
                  onClick={() => {
                    handleSort("system");
                  }}
                >
                  System
                  <span className="table-sort-indicator">{renderSortLabel("system")}</span>
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="table-sort-button"
                  onClick={() => {
                    handleSort("mastery");
                  }}
                >
                  Mastery
                  <span className="table-sort-indicator">{renderSortLabel("mastery")}</span>
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="table-sort-button"
                  onClick={() => {
                    handleSort("attempts");
                  }}
                >
                  Attempts
                  <span className="table-sort-indicator">{renderSortLabel("attempts")}</span>
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="table-sort-button"
                  onClick={() => {
                    handleSort("lastPractice");
                  }}
                >
                  Last Practice
                  <span className="table-sort-indicator">{renderSortLabel("lastPractice")}</span>
                </button>
              </th>
              <th>Band</th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => (
              <tr key={row.kcId}>
                <td>{row.englishTerm}</td>
                <td>{row.officialSpanish}</td>
                <td>{row.system.replaceAll("_", " ")}</td>
                <td>{formatMastery(row.masteryProbability)}</td>
                <td>{row.opportunities}</td>
                <td>{formatLastPracticeAt(row.lastPracticeAt)}</td>
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
