import type { ConfidenceCalibrationProjectionPreviewResult } from "./confidence-calibration-recommendation-advisory-projection-preview";
import { normalizeSetupType, type SetupType } from "./setup-types";

export type ConfidenceProjectionObservationInput = Readonly<{
  previewEnabled: boolean;
  confidenceScore: number | null;
  direction: string | null | undefined;
  setupType: unknown;
  ticker: string | null | undefined;
}>;

// Keep the v1 numerical rule for historical observation/recompute compatibility.
// These constants are NOT fitted outcome evidence or calibrated probabilities.
const SETUP_PROJECTION_DELTA_POINTS: Record<SetupType, number> = {
  VWAP_RECLAIM: 4,
  VWAP_HOLD_CONTINUATION: 5,
  BREAKOUT_CONTINUATION: 5,
  PULLBACK_CONTINUATION: 5,
  OPENING_RANGE_BREAKOUT: 3,
  HIGH_OF_DAY_BREAKOUT: 4,
  REVERSAL_FROM_SUPPORT: 2,
  FAILED_BREAKDOWN_RECLAIM: 2,
  UNKNOWN: 0,
};

export const STATIC_SETUP_PROJECTION_CALIBRATION_STATUS =
  "uncalibrated_static_setup_rule_observation_only";

/** Legacy static previews also lack outcome-linked calibration. Do not let
 * their former calibration labels turn a cached preview into a model claim. */
export function isStaticSetupConfidenceProjection(
  preview: ConfidenceCalibrationProjectionPreviewResult,
): boolean {
  return [
    STATIC_SETUP_PROJECTION_CALIBRATION_STATUS,
    "calibrated_observation_only",
    "calibrated_with_caution_observation_only",
    "insufficient_setup_context_observation_only",
  ].includes(preview.calibration_status ?? "");
}

const DISABLED: ConfidenceCalibrationProjectionPreviewResult = Object.freeze({
  status: "preview_disabled",
  status_label: "AI projection disabled",
  original_recommendation_confidence_basis_points: null,
  proposed_preview_delta_basis_points: null,
  proposed_preview_confidence_basis_points: null,
  explanation: null,
  historical_basis: null,
  calibration_status: null,
  warnings: Object.freeze([]),
  preview_only: true,
  not_applied: true,
  recommendation_confidence_unchanged: true,
  non_authoritative: true,
  application_eligible: false,
  applied: false,
  ranking_affected: false,
  scanner_affected: false,
  publication_affected: false,
  execution_affected: false,
});

const UNAVAILABLE: ConfidenceCalibrationProjectionPreviewResult = Object.freeze({
  ...DISABLED,
  status: "preview_unavailable",
  status_label: "AI projection unavailable",
});

function clampConfidence(value: number): number {
  return Math.min(Math.max(Math.round(value), 0), 100);
}

function toBasisPoints(value: number): number {
  return clampConfidence(value) * 100;
}

export function buildConfidenceProjectionObservationPreview(
  input: ConfidenceProjectionObservationInput,
): ConfidenceCalibrationProjectionPreviewResult {
  if (!input.previewEnabled) return DISABLED;
  if (input.confidenceScore === null || !Number.isFinite(input.confidenceScore)) {
    return UNAVAILABLE;
  }

  const setupType = normalizeSetupType(input.setupType);
  const originalConfidence = clampConfidence(input.confidenceScore);
  const projectedConfidence = clampConfidence(
    originalConfidence + SETUP_PROJECTION_DELTA_POINTS[setupType],
  );
  const deltaPoints = projectedConfidence - originalConfidence;

  return Object.freeze({
    status: deltaPoints === 0 ? "preview_no_adjustment" : "preview_ready",
    status_label:
      "Legacy setup rule — not calibrated",
    original_recommendation_confidence_basis_points:
      toBasisPoints(originalConfidence),
    proposed_preview_delta_basis_points: deltaPoints * 100,
    proposed_preview_confidence_basis_points: toBasisPoints(projectedConfidence),
    explanation:
      "This legacy static setup rule is not fitted to outcomes. Its retained score is not a win probability or evidence of improved recommendations.",
    historical_basis: null,
    calibration_status: STATIC_SETUP_PROJECTION_CALIBRATION_STATUS,
    warnings: Object.freeze([]),
    preview_only: true,
    not_applied: true,
    recommendation_confidence_unchanged: true,
    non_authoritative: true,
    application_eligible: false,
    applied: false,
    ranking_affected: false,
    scanner_affected: false,
    publication_affected: false,
    execution_affected: false,
  });
}
