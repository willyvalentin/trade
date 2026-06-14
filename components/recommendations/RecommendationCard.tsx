import type { ReactNode } from "react";

export type RecommendationCardMetric = {
  label: string;
  value: string;
};

export type RecommendationCardProps = {
  addTradeDisabled: boolean;
  addTradeLabel: string;
  confidenceLabel: string;
  confidenceTone: string;
  detailsDialog?: ReactNode;
  discardDialog?: ReactNode;
  discardDisabled: boolean;
  identity: ReactNode;
  metrics: RecommendationCardMetric[];
  onAddTrade: () => void | Promise<void>;
  onOpenDetails: () => void;
  onOpenDiscard: () => void;
  sourceBadge: ReactNode;
  summary: string;
  updatedAt: string;
};

function recommendationCardDisplayValue(value: unknown, fallback = "—") {
  if (value === null || value === undefined) {
    return fallback;
  }

  const text = String(value).trim();
  return text.length > 0 ? text : fallback;
}

function RecommendationCardMetricGrid({
  metrics,
}: {
  metrics: RecommendationCardMetric[];
}) {
  return (
    <div className="trade-recommendation-metrics">
      {metrics.map((metric) => (
        <div key={metric.label} className="trade-recommendation-metric">
          <div className="trade-recommendation-metric__label">
            {recommendationCardDisplayValue(metric.label).toUpperCase()}
          </div>
          <div className="trade-recommendation-metric__value">
            {recommendationCardDisplayValue(metric.value)}
          </div>
        </div>
      ))}
    </div>
  );
}

export function RecommendationCard({
  addTradeDisabled,
  addTradeLabel,
  confidenceLabel,
  confidenceTone,
  detailsDialog,
  discardDialog,
  discardDisabled,
  identity,
  metrics,
  onAddTrade,
  onOpenDetails,
  onOpenDiscard,
  sourceBadge,
  summary,
  updatedAt,
}: RecommendationCardProps) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOpenDetails}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenDetails();
        }
      }}
      className="trade-recommendation-card"
    >
      <div className="trade-recommendation-card__eyebrow">
        TRADE RECOMMENDATION
      </div>
      <div className="mt-2">{sourceBadge}</div>

      <div className="trade-recommendation-card__header">
        {identity}
        <span
          className={`trade-recommendation-confidence-pill trade-recommendation-confidence-pill--${confidenceTone}`}
        >
          {confidenceLabel}
        </span>
      </div>

      <RecommendationCardMetricGrid metrics={metrics} />

      <div className="trade-recommendation-guidance">
        <p>{recommendationCardDisplayValue(summary)}</p>
        <span>Updated {recommendationCardDisplayValue(updatedAt)}</span>
      </div>

      <div className="trade-recommendation-card__footer">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onAddTrade();
          }}
          disabled={addTradeDisabled}
          className="trade-recommendation-action trade-recommendation-action--primary"
        >
          {addTradeLabel}
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onOpenDiscard();
          }}
          disabled={discardDisabled}
          className="trade-recommendation-action trade-recommendation-action--secondary"
        >
          Discard
        </button>
      </div>

      {discardDialog}
      {detailsDialog}
    </article>
  );
}
