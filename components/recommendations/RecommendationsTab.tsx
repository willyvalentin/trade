import type { ReactNode } from "react";

import { EmptyState } from "@/components/execution/handoff-modal-shared";

export type RecommendationsTabEmptyState = {
  body: string;
  show: boolean;
  title: string;
};

export type RecommendationsTabProps = {
  children: ReactNode;
  emptyState: RecommendationsTabEmptyState;
  isLoading: boolean;
  learningModeEnabled: boolean;
  loadError?: string | null;
  onRetry?: () => void;
};

function RecommendationSkeletonCard() {
  return (
    <article
      className="trade-recommendation-card trade-recommendation-card--loading"
      aria-hidden="true"
    >
      <div className="trade-recommendation-card__eyebrow">
        <span className="trade-skeleton trade-skeleton--eyebrow" />
      </div>
      <div className="trade-recommendation-card__header">
        <div className="trade-skeleton-identity">
          <span className="trade-skeleton trade-skeleton--avatar" />
          <span>
            <span className="trade-skeleton trade-skeleton--ticker" />
            <span className="trade-skeleton trade-skeleton--company" />
          </span>
        </div>
        <span className="trade-skeleton trade-skeleton--pill" />
      </div>
      <div className="trade-recommendation-metrics">
        {Array.from({ length: 5 }, (_, index) => (
          <span key={index} className="trade-skeleton trade-skeleton--metric" />
        ))}
        <span className="trade-recommendation-metric-spacer" />
      </div>
      <div className="trade-recommendation-card__footer">
        <span className="trade-skeleton trade-skeleton--button" />
      </div>
    </article>
  );
}

export function RecommendationsTab({
  children,
  emptyState,
  isLoading,
  learningModeEnabled,
  loadError = null,
  onRetry,
}: RecommendationsTabProps) {
  return (
    <section className="trade-recommendations-section">
      {learningModeEnabled && (
        <div className="trade-learning-mode-banner">
          TESTING / LEARNING ONLY — not for live execution
        </div>
      )}

      <div className="trade-recommendation-grid">
        {isLoading ? (
          <>
            <RecommendationSkeletonCard />
            <RecommendationSkeletonCard />
          </>
        ) : loadError ? (
          <div
            className="rounded-lg border border-rose-300/30 bg-rose-300/[0.07] p-8 text-center"
            role="alert"
          >
            <h3 className="font-mono text-lg font-semibold text-rose-100">
              Recommendations are temporarily unavailable
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-300">
              Trade could not load current recommendation data. No current setup is
              shown, so wait for a successful refresh before making a manual trade.
            </p>
            {onRetry ? (
              <button
                className="mt-5 rounded-md border border-rose-200/30 bg-rose-200/10 px-4 py-2 font-mono text-xs font-bold tracking-[0.12em] text-rose-50 transition hover:bg-rose-200/20 disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                onClick={onRetry}
              >
                TRY AGAIN
              </button>
            ) : null}
          </div>
        ) : emptyState.show ? (
          <EmptyState title={emptyState.title} message={emptyState.body} />
        ) : (
          children
        )}
      </div>
    </section>
  );
}
