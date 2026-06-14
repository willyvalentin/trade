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
          <EmptyState
            title="Loading recommendations"
            message="Trade is reading your Supabase recommendations table."
          />
        ) : emptyState.show ? (
          <EmptyState title={emptyState.title} message={emptyState.body} />
        ) : (
          children
        )}
      </div>
    </section>
  );
}
