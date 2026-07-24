import type { ConfidenceCalibrationProjectionPreviewResult } from "./confidence-calibration-recommendation-advisory-projection-preview";
import { getSetupTypeLabel, normalizeSetupType, type SetupType } from "./setup-types";

export type ConfidenceProjectionObservationInput = Readonly<{
  previewEnabled: boolean;
  confidenceScore: number | null;
  direction: string | null | undefined;
  setupType: unknown;
  ticker: string | null | undefined;
}>;

type SetupProjectionProfile = Readonly<{
  deltaPoints: number;
  explanation: string;
  historicalBasis: string;
  calibrationStatus: string;
}>;

const SETUP_PROJECTION_PROFILES: Record<SetupType, SetupProjectionProfile> = {
  VWAP_RECLAIM: {
    deltaPoints: 4,
    explanation:
      "Historical VWAP reclaim patterns with similar intraday confirmation slightly outperformed their original confidence estimate.",
    historicalBasis:
      "Static confidence calibration evidence: VWAP reclaim setup family, matched momentum context, observation only.",
    calibrationStatus: "calibrated_observation_only",
  },
  VWAP_HOLD_CONTINUATION: {
    deltaPoints: 5,
    explanation:
      "Historical momentum continuation patterns with similar volatility produced better outcomes than originally estimated.",
    historicalBasis:
      "Static confidence calibration evidence: VWAP hold continuation setup family, matched trend context, observation only.",
    calibrationStatus: "calibrated_observation_only",
  },
  BREAKOUT_CONTINUATION: {
    deltaPoints: 5,
    explanation:
      "Historical breakout continuation setups with comparable follow-through tended to deserve a modestly higher confidence read.",
    historicalBasis:
      "Static confidence calibration evidence: breakout continuation setup family, matched expansion context, observation only.",
    calibrationStatus: "calibrated_observation_only",
  },
  PULLBACK_CONTINUATION: {
    deltaPoints: 5,
    explanation:
      "Historical pullback continuation setups with similar trend preservation were often underestimated by the initial score.",
    historicalBasis:
      "Static confidence calibration evidence: pullback continuation setup family, matched trend context, observation only.",
    calibrationStatus: "calibrated_observation_only",
  },
  OPENING_RANGE_BREAKOUT: {
    deltaPoints: 3,
    explanation:
      "Opening range breakouts have a mixed historical profile, so the preview only nudges confidence when structure is present.",
    historicalBasis:
      "Static confidence calibration evidence: opening range breakout setup family, session-sensitive context, observation only.",
    calibrationStatus: "calibrated_with_caution_observation_only",
  },
  HIGH_OF_DAY_BREAKOUT: {
    deltaPoints: 4,
    explanation:
      "High-of-day continuation setups historically improved when momentum stayed orderly after the breakout.",
    historicalBasis:
      "Static confidence calibration evidence: high-of-day breakout setup family, matched momentum context, observation only.",
    calibrationStatus: "calibrated_observation_only",
  },
  REVERSAL_FROM_SUPPORT: {
    deltaPoints: 2,
    explanation:
      "Support reversals historically improved less consistently, so the preview keeps the confidence adjustment conservative.",
    historicalBasis:
      "Static confidence calibration evidence: reversal from support setup family, conservative observation only.",
    calibrationStatus: "calibrated_with_caution_observation_only",
  },
  FAILED_BREAKDOWN_RECLAIM: {
    deltaPoints: 2,
    explanation:
      "Failed breakdown reclaims showed selective upside in similar historical contexts, but evidence stays conservative.",
    historicalBasis:
      "Static confidence calibration evidence: failed breakdown reclaim setup family, conservative observation only.",
    calibrationStatus: "calibrated_with_caution_observation_only",
  },
  UNKNOWN: {
    deltaPoints: 0,
    explanation:
      "No setup-specific confidence projection is available, so the original confidence remains the only actionable score.",
    historicalBasis:
      "Static confidence calibration evidence: setup family unknown, no adjustment, observation only.",
    calibrationStatus: "insufficient_setup_context_observation_only",
  },
};

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
  const profile = SETUP_PROJECTION_PROFILES[setupType];
  const originalConfidence = clampConfidence(input.confidenceScore);
  const projectedConfidence = clampConfidence(
    originalConfidence + profile.deltaPoints,
  );
  const deltaPoints = projectedConfidence - originalConfidence;
  const setupLabel = getSetupTypeLabel(setupType);
  const side = typeof input.direction === "string" ? input.direction.trim() : "";
  const ticker = typeof input.ticker === "string" ? input.ticker.trim() : "";

  return Object.freeze({
    status: deltaPoints === 0 ? "preview_no_adjustment" : "preview_ready",
    status_label:
      deltaPoints === 0 ? "AI projection: no adjustment" : "AI projection ready",
    original_recommendation_confidence_basis_points:
      toBasisPoints(originalConfidence),
    proposed_preview_delta_basis_points: deltaPoints * 100,
    proposed_preview_confidence_basis_points: toBasisPoints(projectedConfidence),
    explanation: profile.explanation,
    historical_basis: [
      profile.historicalBasis,
      `Recommendation context: ${ticker || "ticker unavailable"} ${side || "direction unavailable"} ${setupLabel}.`,
    ].join(" "),
    calibration_status: profile.calibrationStatus,
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
