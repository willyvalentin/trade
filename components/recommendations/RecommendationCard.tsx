import type { ReactNode } from "react";
import type { ConfidenceCalibrationProjectionPreviewResult } from "@/lib/confidence-calibration-recommendation-advisory-projection-preview";

export type RecommendationCardMetric = {
  label: string;
  value: string;
};

export type RecommendationCardProps = {
  addTradeDisabled: boolean;
  addTradeLabel: string;
  confidenceLabel: string;
  confidenceProjectionPreview?: ConfidenceCalibrationProjectionPreviewResult | null;
  confidenceTone: string;
  detailsDialog?: ReactNode;
  discardDialog?: ReactNode;
  discardDisabled: boolean;
  identity: ReactNode;
  metrics: RecommendationCardMetric[];
  onAddTrade: () => void | Promise<void>;
  onOpenDetails: () => void;
  onOpenDiscard: () => void;
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
      {metrics.length % 3 === 2 && (
        <div
          className="trade-recommendation-metric-spacer"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

function formatProjectionConfidence(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  const points = value / 100;
  return Number.isInteger(points) ? `${points}` : points.toFixed(1);
}

function formatProjectionDelta(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  const points = value / 100;
  const formatted = Number.isInteger(points) ? `${points}` : points.toFixed(1);
  return `${points >= 0 ? "▲ +" : "▼ "}${formatted}`;
}

function isVisibleProjectionPreview(
  preview: ConfidenceCalibrationProjectionPreviewResult | null | undefined,
) {
  return (
    preview !== null &&
    preview !== undefined &&
    preview.status !== "preview_disabled" &&
    preview.status !== "preview_unavailable" &&
    preview.proposed_preview_confidence_basis_points !== null
  );
}

export function RecommendationCard({
  addTradeDisabled,
  addTradeLabel,
  confidenceLabel,
  confidenceProjectionPreview,
  confidenceTone,
  detailsDialog,
  discardDialog,
  discardDisabled,
  identity,
  metrics,
  onAddTrade,
  onOpenDetails,
  onOpenDiscard,
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
        <span>TRADE RECOMMENDATION</span>
        <button
          type="button"
          aria-label="Dismiss recommendation"
          onClick={(event) => {
            event.stopPropagation();
            onOpenDiscard();
          }}
          disabled={discardDisabled}
          className="trade-recommendation-card__dismiss"
        >
          ×
        </button>
      </div>

      <div className="trade-recommendation-card__header">
        {identity}
        <div className="trade-recommendation-confidence-stack">
          <span
            className={`trade-recommendation-confidence-pill trade-recommendation-confidence-pill--${confidenceTone}`}
          >
            {confidenceLabel}
          </span>
          {isVisibleProjectionPreview(confidenceProjectionPreview) ? (
            <div className="trade-recommendation-ai-projection">
              <span className="trade-recommendation-ai-projection__label">
                AI Projection
              </span>
              <span className="trade-recommendation-ai-projection__value">
                {formatProjectionConfidence(
                  confidenceProjectionPreview
                    ?.proposed_preview_confidence_basis_points ?? null,
                )}
              </span>
              <span className="trade-recommendation-ai-projection__delta">
                {formatProjectionDelta(
                  confidenceProjectionPreview
                    ?.proposed_preview_delta_basis_points ?? null,
                )}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      <RecommendationCardMetricGrid metrics={metrics} />

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
      </div>

      {discardDialog}
      {detailsDialog}
    </article>
  );
}
