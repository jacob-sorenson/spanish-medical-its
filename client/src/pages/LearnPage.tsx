import { useEffect, useMemo, useRef, useState } from "react";
import type { LearnerKCState } from "../../../shared/types/bkt";
import { TermCard } from "../components/TermCard";
import { learnApi } from "../api/learnApi";
import { useKCs } from "../hooks/useKCs";

export function LearnPage() {
  const { isLoading, kcs, error, reloadKCs } = useKCs();
  const [selectedKcId, setSelectedKcId] = useState<string | null>(null);
  const [viewState, setViewState] = useState<LearnerKCState | null>(null);
  const [viewError, setViewError] = useState<string | null>(null);
  const [isTrackingView, setIsTrackingView] = useState(false);
  const lastTrackedKcIdRef = useRef<string | null>(null);
  const detailPanelRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!kcs.length) {
      setSelectedKcId(null);
      return;
    }

    setSelectedKcId((currentId) => {
      if (currentId && kcs.some((kc) => kc.id === currentId)) {
        return currentId;
      }

      return null;
    });
  }, [kcs]);

  const selectedKc = useMemo(
    () => kcs.find((kc) => kc.id === selectedKcId) ?? null,
    [kcs, selectedKcId],
  );

  useEffect(() => {
    if (!selectedKc) {
      return;
    }

    if (lastTrackedKcIdRef.current === selectedKc.id) {
      return;
    }

    let active = true;
    lastTrackedKcIdRef.current = selectedKc.id;
    setIsTrackingView(true);
    setViewError(null);

    void learnApi
      .markTermViewed({ kcId: selectedKc.id })
      .then((response) => {
        if (!active) {
          return;
        }

        setViewState(response);
      })
      .catch((trackError) => {
        if (!active) {
          return;
        }

        setViewError(
          trackError instanceof Error
            ? trackError.message
            : "Unable to record Learn view.",
        );
      })
      .finally(() => {
        if (active) {
          setIsTrackingView(false);
        }
      });

    return () => {
      active = false;
    };
  }, [selectedKc]);

  useEffect(() => {
    if (!selectedKc || !detailPanelRef.current) {
      return;
    }

    detailPanelRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [selectedKc]);

  if (isLoading && !kcs.length) {
    return (
      <main className="page-shell content-shell">
        <section className="content-card empty-state">Loading terms...</section>
      </main>
    );
  }

  if (error && !kcs.length) {
    return (
      <main className="page-shell content-shell">
        <section className="content-card empty-state">
          <div className="stacked-state">
            <p>{error}</p>
            <button type="button" className="secondary-button" onClick={reloadKCs}>
              Try Again
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell content-shell two-column-layout">
      <section className="page-header full-span">
        <p className="eyebrow">Learn</p>
        <h1>Term Library</h1>
        <p className="hero-text">
          Review official medical Spanish terms before moving into recall practice.
        </p>
        {!isLoading ? (
          <p className="page-caption">{kcs.length} starter knowledge components loaded.</p>
        ) : null}
      </section>

      {error ? (
        <section className="content-card error-banner full-span">
          <strong>Term loading error:</strong> {error}
        </section>
      ) : null}

      <section className="card-grid learn-grid-panel">
        {kcs.map((kc) => (
          <TermCard
            key={kc.id}
            kc={kc}
            isSelected={kc.id === selectedKc?.id}
            onSelect={setSelectedKcId}
          />
        ))}
      </section>

      {selectedKc ? (
        <section ref={detailPanelRef} className="content-card learn-detail-panel">
          <div className="learn-detail-header">
            <div>
              <p className="card-kicker">{selectedKc.system.replaceAll("_", " ")}</p>
              <h2>{selectedKc.englishTerm}</h2>
              <p className="term-answer">{selectedKc.officialSpanish}</p>
            </div>
            <div className="practice-badges">
              <span className="info-pill">
                Difficulty {Math.round(selectedKc.difficulty * 100)}%
              </span>
              <span className="info-pill">
                {selectedKc.termType.replaceAll("_", " ")}
              </span>
            </div>
          </div>

          <div className="learn-detail-grid">
            <div className="learn-detail-block">
              <h3>English Term</h3>
              <p>{selectedKc.englishTerm}</p>
            </div>
            <div className="learn-detail-block">
              <h3>Official Spanish Term</h3>
              <p>{selectedKc.officialSpanish}</p>
            </div>
            <div className="learn-detail-block">
              <h3>Backup Terms</h3>
              <p>
                {selectedKc.backupTerms.length > 0
                  ? selectedKc.backupTerms.join(", ")
                  : "No backup terms listed."}
              </p>
            </div>
            <div className="learn-detail-block">
              <h3>Other Terms</h3>
              <p>
                {selectedKc.otherTerms.length > 0
                  ? selectedKc.otherTerms.join(", ")
                  : "No alternate terms listed."}
              </p>
            </div>
            <div className="learn-detail-block">
              <h3>Source</h3>
              <p>Page {selectedKc.sourcePage}</p>
            </div>
            <div className="learn-detail-block">
              <h3>Learn Tracking</h3>
              <p>
                {isTrackingView
                  ? "Recording view..."
                  : viewState && viewState.kcId === selectedKc.id
                    ? `Viewed ${viewState.learnViewCount} time${
                        viewState.learnViewCount === 1 ? "" : "s"
                      }`
                    : "View tracking pending."}
              </p>
              {viewState && viewState.kcId === selectedKc.id ? (
                <p className="muted-copy">
                  First viewed:{" "}
                  {viewState.firstViewedAt
                    ? new Date(viewState.firstViewedAt).toLocaleString()
                    : "Not recorded"}
                </p>
              ) : null}
            </div>
          </div>

          {viewError ? (
            <section className="content-card error-banner learn-inline-error">
              <strong>Learn tracking error:</strong> {viewError}
            </section>
          ) : null}
        </section>
      ) : (
        <section ref={detailPanelRef} className="content-card learn-detail-panel learn-placeholder-panel">
          <div className="card-kicker">Select A Term</div>
          <h2>Open a term to study it</h2>
          <p className="hero-text learn-helper-copy">
            Click any term card on the left to open its details. When the term opens here,
            the Learn page records that view through the backend.
          </p>
        </section>
      )}
    </main>
  );
}
