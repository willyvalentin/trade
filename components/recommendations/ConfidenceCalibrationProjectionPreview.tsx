import type { ConfidenceCalibrationProjectionPreviewResult } from "@/lib/confidence-calibration-recommendation-advisory-projection-preview";

export type ConfidenceCalibrationProjectionPreviewProps = {
  preview: ConfidenceCalibrationProjectionPreviewResult | null | undefined;
};

function formatConfidencePoints(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  const points = value / 100;
  return Number.isInteger(points) ? `${points}` : points.toFixed(1);
}

function formatDeltaPoints(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  const points = value / 100;
  const formatted = Number.isInteger(points) ? `${points}` : points.toFixed(1);
  return `${points >= 0 ? "+" : ""}${formatted}`;
}

export function ConfidenceCalibrationProjectionPreview({
  preview,
}: ConfidenceCalibrationProjectionPreviewProps) {
  if (!preview || preview.status === "preview_disabled") return null;

  if (preview.status === "preview_unavailable") {
    return (
      <div className="trade-recommendation-details-text-card">
        <div className="trade-recommendation-details-text-card__header">
          <span className="trade-recommendation-details-text-card__label">
            AI PROJECTION
          </span>
        </div>
        <div className="trade-recommendation-details-text-card__content">
          <p>AI projection unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="trade-recommendation-details-text-card">
      <div className="trade-recommendation-details-text-card__header">
        <span className="trade-recommendation-details-text-card__label">
          AI PROJECTION
        </span>
      </div>
      <div className="trade-recommendation-details-text-card__content">
        <p>Observation only — not applied</p>
        <p>Original confidence remains authoritative</p>
        {preview.explanation ? <p>{preview.explanation}</p> : null}
        {preview.status === "preview_no_adjustment" ? (
          <p>No adjustment suggested</p>
        ) : null}
        <div className="trade-recommendation-details-metrics trade-recommendation-details-metrics--wide">
          <div className="trade-recommendation-details-metric">
            <div className="trade-recommendation-details-metric__label">
              CONFIDENCE
            </div>
            <div className="trade-recommendation-details-metric__value">
              {formatConfidencePoints(
                preview.original_recommendation_confidence_basis_points,
              )}
            </div>
          </div>
          <div className="trade-recommendation-details-metric">
            <div className="trade-recommendation-details-metric__label">
              CONFIDENCE DELTA
            </div>
            <div className="trade-recommendation-details-metric__value trade-recommendation-details-metric__value--positive">
              {formatDeltaPoints(preview.proposed_preview_delta_basis_points)}
            </div>
          </div>
          <div className="trade-recommendation-details-metric">
            <div className="trade-recommendation-details-metric__label">
              PROJECTED CONFIDENCE
            </div>
            <div className="trade-recommendation-details-metric__value">
              {formatConfidencePoints(
                preview.proposed_preview_confidence_basis_points,
              )}
            </div>
          </div>
        </div>
        {preview.historical_basis ? <p>{preview.historical_basis}</p> : null}
        {preview.calibration_status ? (
          <p>Calibration status: {preview.calibration_status.replaceAll("_", " ")}</p>
        ) : null}
        {preview.status === "preview_ready_with_warnings" &&
        preview.warnings.length > 0 ? (
          <div className="trade-recommendation-details-text-stack trade-recommendation-details-text-stack--warning">
            {preview.warnings.map((warning) => (
              <p key={warning.code}>{warning.label}</p>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
