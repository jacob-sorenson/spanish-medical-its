import { useEffect, useMemo, useRef, useState } from "react";
import type { LearnerKCState } from "../../../shared/types/bkt";
import type { MedicalSystem, TermType } from "../../../shared/types/kc";
import { learnApi } from "../api/learnApi";
import { useKCs } from "../hooks/useKCs";

type StudyDirection = "en_to_es" | "es_to_en";

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

export function LearnPage() {
  const { isLoading, kcs, error, reloadKCs } = useKCs();
  const [selectedKcId, setSelectedKcId] = useState<string | null>(null);
  const [systemFilter, setSystemFilter] = useState("all");
  const [termTypeFilter, setTermTypeFilter] = useState("all");
  const [studyDirection, setStudyDirection] = useState<StudyDirection>("en_to_es");
  const [isRevealed, setIsRevealed] = useState(false);
  const [viewState, setViewState] = useState<LearnerKCState | null>(null);
  const [viewError, setViewError] = useState<string | null>(null);
  const [isTrackingView, setIsTrackingView] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false);
  const lastTrackedKcIdRef = useRef<string | null>(null);

  const systems = useMemo(
    () => [...new Set(kcs.map((kc) => kc.system))].sort((a, b) => a.localeCompare(b)),
    [kcs],
  );

  const termTypes = useMemo(
    () => [...new Set(kcs.map((kc) => kc.termType))].sort((a, b) => a.localeCompare(b)),
    [kcs],
  );

  const filteredKcs = useMemo(
    () =>
      kcs.filter((kc) => {
        const systemMatches = systemFilter === "all" || kc.system === systemFilter;
        const termTypeMatches = termTypeFilter === "all" || kc.termType === termTypeFilter;

        return systemMatches && termTypeMatches;
      }),
    [kcs, systemFilter, termTypeFilter],
  );

  useEffect(() => {
    if (!filteredKcs.length) {
      setSelectedKcId(null);
      return;
    }

    let active = true;
    setIsLoadingRecommendation(true);
    setRecommendationError(null);

    void learnApi
      .getNextTerm({
        preferredSystem:
          systemFilter === "all" ? undefined : (systemFilter as MedicalSystem),
        preferredTermType:
          termTypeFilter === "all" ? undefined : (termTypeFilter as TermType),
      })
      .then((response) => {
        if (!active) {
          return;
        }

        setSelectedKcId(response.kc.id);
      })
      .catch((loadError) => {
        if (!active) {
          return;
        }

        setRecommendationError(
          loadError instanceof Error ? loadError.message : "Unable to load Learn recommendation.",
        );
        setSelectedKcId((currentId) => {
          if (currentId && filteredKcs.some((kc) => kc.id === currentId)) {
            return currentId;
          }

          return filteredKcs[0].id;
        });
      })
      .finally(() => {
        if (active) {
          setIsLoadingRecommendation(false);
        }
      });

    return () => {
      active = false;
    };
  }, [filteredKcs, systemFilter, termTypeFilter]);

  const selectedKc = useMemo(
    () => filteredKcs.find((kc) => kc.id === selectedKcId) ?? null,
    [filteredKcs, selectedKcId],
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
    setIsRevealed(false);
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

  const selectedIndex = selectedKc
    ? filteredKcs.findIndex((kc) => kc.id === selectedKc.id)
    : -1;

  const canStudy = filteredKcs.length > 0 && selectedKc !== null;

  const promptTerm =
    studyDirection === "en_to_es" ? selectedKc?.englishTerm : selectedKc?.officialSpanish;
  const answerTerm =
    studyDirection === "en_to_es" ? selectedKc?.officialSpanish : selectedKc?.englishTerm;

  const goToRelativeTerm = (offset: -1 | 1) => {
    if (!selectedKc || filteredKcs.length === 0) {
      return;
    }

    const nextIndex = (selectedIndex + offset + filteredKcs.length) % filteredKcs.length;
    setSelectedKcId(filteredKcs[nextIndex].id);
  };

  const goToRecommendedNextTerm = () => {
    if (!selectedKc || filteredKcs.length === 0) {
      return;
    }

    setIsLoadingRecommendation(true);
    setRecommendationError(null);

    void learnApi
      .getNextTerm({
        preferredSystem:
          systemFilter === "all" ? undefined : (systemFilter as MedicalSystem),
        preferredTermType:
          termTypeFilter === "all" ? undefined : (termTypeFilter as TermType),
        excludeKcIds: [selectedKc.id],
      })
      .then((response) => {
        setSelectedKcId(response.kc.id);
      })
      .catch((loadError) => {
        setRecommendationError(
          loadError instanceof Error ? loadError.message : "Unable to load next Learn term.",
        );
        goToRelativeTerm(1);
      })
      .finally(() => {
        setIsLoadingRecommendation(false);
      });
  };

  return (
    <main className="page-shell content-shell learn-study-shell">
      <section className="page-header full-span">
        <p className="eyebrow">Learn</p>
        <h1>Flashcard Study</h1>
        <p className="hero-text">
          Study one term at a time, reveal the translation when ready, and use the side panel
          only when you need to filter or jump around.
        </p>
        {!isLoading ? (
          <p className="page-caption">
            {filteredKcs.length} of {kcs.length} terms in the current study set.
          </p>
        ) : null}
      </section>

      {error ? (
        <section className="content-card error-banner full-span">
          <strong>Term loading error:</strong> {error}
        </section>
      ) : null}

      {recommendationError ? (
        <section className="content-card error-banner full-span">
          <strong>Learn recommendation error:</strong> {recommendationError}
        </section>
      ) : null}

      <section className="content-card learn-flashcard-stage">
        {canStudy ? (
          <>
            <div className="learn-study-topbar">
              <div>
                <p className="card-kicker">
                  {selectedKc.system.replaceAll("_", " ")} · {selectedKc.termType.replaceAll("_", " ")}
                </p>
                <h2>
                  Term {selectedIndex + 1} of {filteredKcs.length}
                </h2>
              </div>
              <div className="practice-badges">
                <span className="info-pill">
                  {studyDirection === "en_to_es" ? "English -> Spanish" : "Spanish -> English"}
                </span>
                <span className="info-pill">
                  {isLoadingRecommendation ? "Refreshing recommendation..." : "Guided order"}
                </span>
                <span className="info-pill">
                  Difficulty {Math.round(selectedKc.difficulty * 100)}%
                </span>
              </div>
            </div>

            <section className={`learn-flashcard ${isRevealed ? "revealed" : ""}`}>
              <div className="flashcard-face flashcard-prompt">
                <span className="flashcard-label">
                  {studyDirection === "en_to_es" ? "Prompt In English" : "Prompt In Spanish"}
                </span>
                <h3>{promptTerm}</h3>
                <p>
                  Think of the matching{" "}
                  {studyDirection === "en_to_es" ? "Spanish term" : "English term"} before
                  revealing the answer.
                </p>
              </div>

              {isRevealed ? (
                <div className="flashcard-face flashcard-answer">
                  <span className="flashcard-label">Answer</span>
                  <h3>{answerTerm}</h3>
                  <p>
                    English: <strong>{selectedKc.englishTerm}</strong>
                  </p>
                  <p>
                    Official Spanish: <strong>{selectedKc.officialSpanish}</strong>
                  </p>
                </div>
              ) : null}
            </section>

            <div className="action-row">
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setIsRevealed((current) => !current);
                }}
              >
                {isRevealed ? "Hide Answer" : "Reveal Answer"}
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  goToRelativeTerm(-1);
                }}
                disabled={filteredKcs.length <= 1}
              >
                Previous Term
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={goToRecommendedNextTerm}
                disabled={filteredKcs.length <= 1}
              >
                Next Term
              </button>
            </div>

            {isRevealed ? (
              <div className="learn-reveal-details">
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
                  <h3>Metadata</h3>
                  <p>System: {formatLabel(selectedKc.system)}</p>
                  <p>Term type: {formatLabel(selectedKc.termType)}</p>
                  <p>Source page: {selectedKc.sourcePage}</p>
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
                      Last viewed:{" "}
                      {viewState.lastViewedAt
                        ? new Date(viewState.lastViewedAt).toLocaleString()
                        : "Not recorded"}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {viewError ? (
              <section className="content-card error-banner learn-inline-error">
                <strong>Learn tracking error:</strong> {viewError}
              </section>
            ) : null}
          </>
        ) : (
          <section className="learn-empty-study">
            <div className="card-kicker">No Matching Terms</div>
            <h2>Adjust the study filters</h2>
            <p className="hero-text learn-helper-copy">
              Your current system and term-type filters removed every term from the study set.
            </p>
          </section>
        )}
      </section>

      <aside className="content-card learn-control-panel">
        <div className="section-heading">
          <h2>Study Controls</h2>
        </div>

        <label className="field-label" htmlFor="study-direction">
          Study Direction
        </label>
        <select
          id="study-direction"
          className="control-select"
          value={studyDirection}
          onChange={(event) => {
            setStudyDirection(event.target.value as StudyDirection);
            setIsRevealed(false);
          }}
        >
          <option value="en_to_es">English to Spanish</option>
          <option value="es_to_en">Spanish to English</option>
        </select>

        <label className="field-label" htmlFor="system-filter">
          System Filter
        </label>
        <select
          id="system-filter"
          className="control-select"
          value={systemFilter}
          onChange={(event) => {
            setSystemFilter(event.target.value);
          }}
        >
          <option value="all">All systems</option>
          {systems.map((system) => (
            <option key={system} value={system}>
              {formatLabel(system)}
            </option>
          ))}
        </select>

        <label className="field-label" htmlFor="term-type-filter">
          Term Type Filter
        </label>
        <select
          id="term-type-filter"
          className="control-select"
          value={termTypeFilter}
          onChange={(event) => {
            setTermTypeFilter(event.target.value);
          }}
        >
          <option value="all">All term types</option>
          {termTypes.map((termType) => (
            <option key={termType} value={termType}>
              {formatLabel(termType)}
            </option>
          ))}
        </select>

        <label className="field-label" htmlFor="jump-to-term">
          Jump To Term
        </label>
        <select
          id="jump-to-term"
          className="control-select"
          value={selectedKcId ?? ""}
          onChange={(event) => {
            setSelectedKcId(event.target.value);
          }}
          disabled={filteredKcs.length === 0}
        >
          {filteredKcs.map((kc) => (
            <option key={kc.id} value={kc.id}>
              {studyDirection === "en_to_es" ? kc.englishTerm : kc.officialSpanish}
            </option>
          ))}
        </select>

        <div className="learn-mini-list">
          {filteredKcs.slice(0, 10).map((kc) => (
            <button
              key={kc.id}
              type="button"
              className={`learn-mini-item${kc.id === selectedKcId ? " active" : ""}`}
              onClick={() => {
                setSelectedKcId(kc.id);
              }}
            >
              <span>{kc.englishTerm}</span>
              <small>{kc.officialSpanish}</small>
            </button>
          ))}
        </div>
      </aside>
    </main>
  );
}
