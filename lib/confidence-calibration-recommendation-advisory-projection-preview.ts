import type { ConfidenceCalibrationAdvisoryResult } from "./confidence-calibration-advisory-adapter";
import {
  buildConfidenceCalibrationRecommendationProjection,
  type ConfidenceCalibrationRecommendationProjectionResult,
  type FrozenRecommendationProjectionConfiguration,
  type ImmutableRecommendationProjectionEnvelope,
} from "./confidence-calibration-recommendation-advisory-projection";

export type ConfidenceCalibrationProjectionPreviewStatus =
  | "preview_disabled"
  | "preview_ready"
  | "preview_ready_with_warnings"
  | "preview_no_adjustment"
  | "preview_unavailable";

export type ConfidenceCalibrationProjectionPreviewWarning = Readonly<{
  code: string;
  label: string;
}>;

export type ConfidenceCalibrationProjectionPreviewResult = Readonly<{
  status: ConfidenceCalibrationProjectionPreviewStatus;
  status_label: string;
  original_recommendation_confidence_basis_points: number | null;
  proposed_preview_delta_basis_points: number | null;
  proposed_preview_confidence_basis_points: number | null;
  warnings: readonly ConfidenceCalibrationProjectionPreviewWarning[];
  preview_only: true;
  not_applied: true;
  recommendation_confidence_unchanged: true;
  non_authoritative: true;
  application_eligible: false;
  applied: false;
  ranking_affected: false;
  scanner_affected: false;
  publication_affected: false;
  execution_affected: false;
}>;

export type ConfidenceCalibrationProjectionPreviewInput = Readonly<{
  preview_enabled: boolean;
  recommendation: ImmutableRecommendationProjectionEnvelope | null | undefined;
  advisory: ConfidenceCalibrationAdvisoryResult | null | undefined;
  configuration: FrozenRecommendationProjectionConfiguration | null | undefined;
}>;

const UNAVAILABLE: ConfidenceCalibrationProjectionPreviewResult = Object.freeze({
  status: "preview_unavailable",
  status_label: "Calibration preview unavailable",
  original_recommendation_confidence_basis_points: null,
  proposed_preview_delta_basis_points: null,
  proposed_preview_confidence_basis_points: null,
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

const DISABLED: ConfidenceCalibrationProjectionPreviewResult = Object.freeze({
  ...UNAVAILABLE,
  status: "preview_disabled",
  status_label: "Calibration preview disabled",
});

const UNAVAILABLE_PROJECTION_STATUSES = new Set<
  ConfidenceCalibrationRecommendationProjectionResult["status"]
>([
  "projection_insufficient_evidence",
  "blocked_invalid_input",
  "blocked_confidence_mismatch",
  "blocked_invalid_lineage",
  "blocked_future_leakage",
  "blocked_advisory_result",
  "blocked_unsupported_status",
]);

export function buildConfidenceCalibrationProjectionPreview(
  input: ConfidenceCalibrationProjectionPreviewInput,
): ConfidenceCalibrationProjectionPreviewResult {
  if (!input.preview_enabled) return DISABLED;
  if (!input.recommendation || !input.advisory || !input.configuration) {
    return UNAVAILABLE;
  }

  try {
    const projection = buildConfidenceCalibrationRecommendationProjection({
      recommendation: input.recommendation,
      advisory: input.advisory,
      configuration: input.configuration,
    });

    return mapConfidenceCalibrationProjectionPreviewResult(projection);
  } catch {
    return UNAVAILABLE;
  }
}

export function mapConfidenceCalibrationProjectionPreviewResult(
  projection: ConfidenceCalibrationRecommendationProjectionResult,
): ConfidenceCalibrationProjectionPreviewResult {
  if (!hasExactSafetyBoundary(projection)) return UNAVAILABLE;

  if (projection.status === "projection_ready") {
    return previewFromProjection(projection, "preview_ready", "Suggested preview available");
  }

  if (projection.status === "projection_ready_with_warnings") {
    return previewFromProjection(
      projection,
      "preview_ready_with_warnings",
      "Suggested preview available with warnings",
    );
  }

  if (projection.status === "projection_no_adjustment") {
    return previewFromProjection(
      projection,
      "preview_no_adjustment",
      "No adjustment suggested",
    );
  }

  if (UNAVAILABLE_PROJECTION_STATUSES.has(projection.status)) return UNAVAILABLE;

  return UNAVAILABLE;
}

function previewFromProjection(
  projection: ConfidenceCalibrationRecommendationProjectionResult,
  status: Exclude<ConfidenceCalibrationProjectionPreviewStatus, "preview_disabled" | "preview_unavailable">,
  statusLabel: string,
): ConfidenceCalibrationProjectionPreviewResult {
  if (
    projection.recommendation_original_confidence_basis_points === null ||
    projection.advisory_proposed_delta_basis_points === null ||
    projection.advisory_proposed_confidence_basis_points === null
  ) {
    return UNAVAILABLE;
  }

  return Object.freeze({
    status,
    status_label: statusLabel,
    original_recommendation_confidence_basis_points:
      projection.recommendation_original_confidence_basis_points,
    proposed_preview_delta_basis_points:
      projection.advisory_proposed_delta_basis_points,
    proposed_preview_confidence_basis_points:
      projection.advisory_proposed_confidence_basis_points,
    warnings: Object.freeze(projection.warnings.map(mapWarning)),
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

function hasExactSafetyBoundary(
  projection: ConfidenceCalibrationRecommendationProjectionResult,
): boolean {
  return (
    projection.recommendation_confidence_unchanged === true &&
    projection.non_authoritative === true &&
    projection.application_eligible === false &&
    projection.applied === false &&
    projection.ranking_affected === false &&
    projection.scanner_affected === false &&
    projection.publication_affected === false &&
    projection.execution_affected === false
  );
}

function mapWarning(
  warning: ConfidenceCalibrationRecommendationProjectionResult["warnings"][number],
): ConfidenceCalibrationProjectionPreviewWarning {
  if (warning.code === "duplicate_mapper_row_identity") {
    return Object.freeze({
      code: warning.code,
      label: "Duplicate evidence was deduped",
    });
  }

  if (warning.code === "metric_value_unavailable") {
    return Object.freeze({
      code: warning.code,
      label: "Some metrics were unavailable",
    });
  }

  return Object.freeze({
    code: warning.code,
    label: "Calibration warning",
  });
}
