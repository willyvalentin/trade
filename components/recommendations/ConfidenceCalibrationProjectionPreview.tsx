import type { ConfidenceCalibrationProjectionPreviewResult } from "@/lib/confidence-calibration-recommendation-advisory-projection-preview";

export type ConfidenceCalibrationProjectionPreviewProps = {
  preview: ConfidenceCalibrationProjectionPreviewResult | null | undefined;
};

function formatBasisPoints(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return `${(value / 100).toFixed(2)}/100`;
}

function formatDeltaBasisPoints(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  const signedValue = value >= 0 ? `+${value}` : `${value}`;
  return `${signedValue} bp`;
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
            CALIBRATION PREVIEW
          </span>
        </div>
        <div className="trade-recommendation-details-text-card__content">
          <p>Calibration preview unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="trade-recommendation-details-text-card">
      <div className="trade-recommendation-details-text-card__header">
        <span className="trade-recommendation-details-text-card__label">
          CALIBRATION PREVIEW
        </span>
      </div>
      <div className="trade-recommendation-details-text-card__content">
        <p>Preview only — not applied</p>
        <p>Original Recommendation confidence remains active</p>
        {preview.status === "preview_no_adjustment" ? (
          <p>No adjustment suggested</p>
        ) : null}
        <div className="trade-recommendation-details-metrics trade-recommendation-details-metrics--wide">
          <div className="trade-recommendation-details-metric">
            <div className="trade-recommendation-details-metric__label">
              ORIGINAL CONFIDENCE
            </div>
            <div className="trade-recommendation-details-metric__value">
              {formatBasisPoints(
                preview.original_recommendation_confidence_basis_points,
              )}
            </div>
          </div>
          <div className="trade-recommendation-details-metric">
            <div className="trade-recommendation-details-metric__label">
              SUGGESTED PREVIEW ADJUSTMENT
            </div>
            <div className="trade-recommendation-details-metric__value">
              {formatDeltaBasisPoints(preview.proposed_preview_delta_basis_points)}
            </div>
          </div>
          <div className="trade-recommendation-details-metric">
            <div className="trade-recommendation-details-metric__label">
              SUGGESTED PREVIEW CONFIDENCE
            </div>
            <div className="trade-recommendation-details-metric__value">
              {formatBasisPoints(preview.proposed_preview_confidence_basis_points)}
            </div>
          </div>
        </div>
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
