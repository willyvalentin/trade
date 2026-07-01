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
  statusbar: ReactNode;
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
  statusbar,
}: RecommendationsTabProps) {
  return (
    <section className="trade-recommendations-section">
      {statusbar}

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
        ) : emptyState.show ? (
          <EmptyState title={emptyState.title} message={emptyState.body} />
        ) : (
          children
        )}
      </div>
    </section>
  );
}
