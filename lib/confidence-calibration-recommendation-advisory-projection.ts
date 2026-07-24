import { createHash } from "crypto";

import type { ConfidenceCalibrationAdvisoryResult } from "./confidence-calibration-advisory-adapter";

export type ImmutableRecommendationProjectionEnvelope = Readonly<{
  recommendation_id: string | null;
  recommendation_fingerprint: string;
  recommendation_snapshot_hash: string;
  original_confidence_basis_points: number;
  schema_version: "recommendation_projection_envelope_v1";
  decision_boundary: Readonly<{
    boundary_id: string;
    boundary_sha256: string;
    evidence_cutoff_sha256: string;
    anti_leakage_state: "passed";
  }>;
  identity: Readonly<{
    ticker: string | null;
    side: "long" | "short" | null;
  }>;
  source: Readonly<{
    source_kind: "recommendation_snapshot";
    source_version: string;
    source_classification: "static_projection";
    immutable: true;
  }>;
  lineage: Readonly<{
    recommendation_source_hash: string;
    decision_boundary_sha256: string;
    evidence_lineage_hash: string;
    pattern_discovery_result_hashes: readonly string[];
    pattern_insight_hashes: readonly string[];
    source_scenario_ids: readonly string[];
    source_snapshot_ids: readonly string[];
  }>;
  static_only: true;
  non_authoritative: true;
  no_persistence: true;
  no_replay: true;
  no_runtime: true;
  no_feedback: true;
  no_mutation_callback: true;
  commands: Readonly<{
    mutation: false;
    persistence: false;
    ranking: false;
    scanner: false;
    publication: false;
    execution: false;
    feedback: false;
  }>;
  anti_feedback: Readonly<{
    projection_reused_as_recommendation_confidence_input: false;
    projection_reused_as_scanner_signal: false;
    projection_reused_as_ranking_signal: false;
    projection_reused_as_publication_signal: false;
    projection_reused_as_execution_signal: false;
    projection_reused_as_learning_dataset_input: false;
    projection_reused_as_pattern_discovery_evidence: false;
    projection_reused_as_intelligence_context: false;
    projection_reused_as_outcome: false;
    projection_reused_as_calibration_evidence: false;
    projection_reused_as_future_advisory_base_input: false;
    projection_reused_as_feedback_event: false;
    circular_projection_lineage: false;
    self_referential_recommendation_lineage: false;
  }>;
  anti_leakage: Readonly<{
    status: "passed";
    future_outcome_evidence: false;
    post_entry_evidence: false;
    post_exit_evidence: false;
    same_recommendation_realized_result: false;
    evidence_after_decision_boundary: false;
    prohibited_self_calibration: false;
  }>;
}>;

export type FrozenRecommendationProjectionConfiguration = Readonly<{
  projection_schema_version: "confidence_calibration_recommendation_projection_v1";
  configuration_version: "confidence_calibration_recommendation_projection_config_v1";
  projection_id_prefix: "confidence_calibration_recommendation_projection_v1:";
  advisory_schema_version: "confidence_calibration_advisory_result_v1";
  advisory_configuration_version: "confidence_calibration_advisory_config_v1";
  confidence_scale_basis_points_per_point: 100;
  accepted_min_confidence_basis_points: 0;
  accepted_max_confidence_basis_points: 10000;
  status_mapping: Readonly<{
    advisory_ready: "projection_ready";
    advisory_ready_with_warnings: "projection_ready_with_warnings";
    advisory_no_adjustment: "projection_no_adjustment";
    advisory_insufficient_evidence: "projection_insufficient_evidence";
    blocked_invalid_input: "blocked_invalid_input";
    blocked_confidence_mismatch: "blocked_confidence_mismatch";
    blocked_invalid_lineage: "blocked_invalid_lineage";
    blocked_future_leakage: "blocked_future_leakage";
    blocked_calibration_result: "blocked_advisory_result";
    blocked_unsupported_status: "blocked_unsupported_status";
  }>;
  visibility_policy: "projection_visible_for_eligible_advisories";
  identity_policy: "action_448_projection_identity_v1";
  canonical_hash_version: "action_448_canonical_json_sha256_v1";
  warning_message_key_prefix: "confidence_calibration_advisory.";
  issue_message_key_prefix: "confidence_calibration_advisory.";
  projection_issue_message_key_prefix: "confidence_calibration_recommendation_projection.";
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs";
}>;

export type ConfidenceCalibrationRecommendationProjectionResult = Readonly<{
  status:
    | "projection_ready"
    | "projection_ready_with_warnings"
    | "projection_no_adjustment"
    | "projection_insufficient_evidence"
    | "blocked_invalid_input"
    | "blocked_confidence_mismatch"
    | "blocked_invalid_lineage"
    | "blocked_future_leakage"
    | "blocked_advisory_result"
    | "blocked_unsupported_status";
  projection_id: string | null;
  projection_hash: string | null;
  recommendation_id: string | null;
  recommendation_fingerprint: string | null;
  recommendation_snapshot_hash: string | null;
  recommendation_original_confidence_basis_points: number | null;
  advisory_status: ConfidenceCalibrationAdvisoryResult["status"] | null;
  advisory_id: string | null;
  advisory_identity_hash: string | null;
  advisory_result_hash: string | null;
  advisory_proposed_delta_basis_points: number | null;
  advisory_proposed_confidence_basis_points: number | null;
  calibration_status: ConfidenceCalibrationAdvisoryResult["calibration_status"];
  calibration_id: string | null;
  lineage_hashes: Readonly<{
    recommendation_source_hash: string;
    decision_boundary_sha256: string;
    evidence_lineage_hash: string;
    pattern_discovery_result_hashes: readonly string[];
    pattern_insight_hashes: readonly string[];
    calibration_identity_hash: string;
    calibration_result_hash: string;
  }> | null;
  warnings: readonly Readonly<{
    code: string;
    path: string;
    severity: "warning";
    messageKey: string;
  }>[];
  issues: readonly Readonly<{
    code: string;
    path: string;
    severity: "error";
    messageKey: string;
  }>[];
  advisory_visible: boolean;
  projection_visible: boolean;
  recommendation_confidence_unchanged: true;
  ranking_affected: false;
  scanner_affected: false;
  publication_affected: false;
  execution_affected: false;
  non_authoritative: true;
  applied: false;
  application_eligible: false;
}>;

type UnknownRecord = Record<string, unknown>;
type ProjectionStatus = ConfidenceCalibrationRecommendationProjectionResult["status"];
type ProjectionIssue = ConfidenceCalibrationRecommendationProjectionResult["issues"][number];
type ProjectionWarning = ConfidenceCalibrationRecommendationProjectionResult["warnings"][number];
type AdvisoryStatus = ConfidenceCalibrationAdvisoryResult["status"];

const HASH_PATTERN = /^[a-f0-9]{64}$/;
const RFC6901_PATTERN = /^(?:|(?:\/(?:[^~/]|~0|~1)*))*$/;
const ADVISORY_ID_PATTERN = /^confidence_calibration_advisory_v1:[a-f0-9]{24}$/;
const TOP_LEVEL_KEYS = ["advisory", "configuration", "recommendation"] as const;
const CONFIGURATION_KEYS = [
  "accepted_max_confidence_basis_points",
  "accepted_min_confidence_basis_points",
  "advisory_configuration_version",
  "advisory_schema_version",
  "canonical_hash_version",
  "confidence_scale_basis_points_per_point",
  "configuration_version",
  "identity_policy",
  "issue_message_key_prefix",
  "projection_id_prefix",
  "projection_issue_message_key_prefix",
  "projection_schema_version",
  "runtime_preview_status",
  "status_mapping",
  "visibility_policy",
  "warning_message_key_prefix",
] as const;
const RECOMMENDATION_KEYS = [
  "anti_feedback",
  "anti_leakage",
  "commands",
  "decision_boundary",
  "identity",
  "lineage",
  "no_feedback",
  "no_mutation_callback",
  "no_persistence",
  "no_replay",
  "no_runtime",
  "non_authoritative",
  "original_confidence_basis_points",
  "recommendation_fingerprint",
  "recommendation_id",
  "recommendation_snapshot_hash",
  "schema_version",
  "source",
  "static_only",
] as const;
const ADVISORY_KEYS = [
  "advisory_eligible",
  "advisory_hash",
  "advisory_id",
  "advisory_visible",
  "applied",
  "application_eligible",
  "calibration_id",
  "calibration_status",
  "issues",
  "lineage_hashes",
  "non_authoritative",
  "original_confidence",
  "proposed_calibrated_confidence",
  "proposed_delta",
  "reasons",
  "recommendation_fingerprint",
  "recommendation_snapshot_hash",
  "status",
  "warnings",
] as const;
const STATUS_MAPPING = {
  advisory_ready: "projection_ready",
  advisory_ready_with_warnings: "projection_ready_with_warnings",
  advisory_no_adjustment: "projection_no_adjustment",
  advisory_insufficient_evidence: "projection_insufficient_evidence",
  blocked_invalid_input: "blocked_invalid_input",
  blocked_confidence_mismatch: "blocked_confidence_mismatch",
  blocked_invalid_lineage: "blocked_invalid_lineage",
  blocked_future_leakage: "blocked_future_leakage",
  blocked_calibration_result: "blocked_advisory_result",
  blocked_unsupported_status: "blocked_unsupported_status",
} as const satisfies FrozenRecommendationProjectionConfiguration["status_mapping"];
const ELIGIBLE_ADVISORY_STATUSES = new Set<AdvisoryStatus>([
  "advisory_ready",
  "advisory_ready_with_warnings",
  "advisory_no_adjustment",
]);
const ADVISORY_WARNING_CODES = new Set([
  "duplicate_mapper_row_identity",
  "metric_value_unavailable",
  "duplicate_insight_deduped",
  "overlapping_insight_excluded",
  "insight_excluded",
  "confidence_clamped_to_bounds",
]);
const ADVISORY_ISSUE_CODES = new Set([
  "invalid_input_shape",
  "invalid_configuration",
  "invalid_configuration_shape",
  "invalid_recommendation_envelope",
  "invalid_recommendation_identity",
  "invalid_snapshot_lineage",
  "invalid_original_confidence",
  "invalid_base_confidence",
  "invalid_insight_array",
  "invalid_insight_envelope",
  "ineligible_pattern_discovery_status",
  "missing_insight",
  "invalid_insight_structure",
  "invalid_lineage",
  "future_leakage",
  "warning_status_contradiction",
  "invalid_evidence_quality",
  "unsupported_direction",
  "overlapping_evidence_conflict",
  "insufficient_eligible_evidence",
  "invalid_calibration_result",
  "blocked_unsupported_status",
  "blocked_confidence_mismatch",
  "blocked_invalid_lineage",
  "blocked_future_leakage",
  "blocked_feedback_reuse",
  "blocked_warning_issue_shape",
  "blocked_no_adjustment_semantics",
  "blocked_calibration_result",
]);
const PROJECTION_ISSUE_CODES = new Set([
  "invalid_input_shape",
  "invalid_configuration",
  "invalid_recommendation_envelope",
  "invalid_recommendation_fingerprint",
  "invalid_snapshot_lineage",
  "invalid_original_confidence",
  "invalid_advisory_result",
  "unsupported_advisory_status",
  "blocked_confidence_mismatch",
  "invalid_advisory_identity_hash",
  "blocked_advisory_result",
  "blocked_invalid_lineage",
  "blocked_future_leakage",
  "blocked_feedback_reuse",
  "blocked_warning_issue_shape",
  "blocked_no_adjustment_semantics",
]);

export function buildConfidenceCalibrationRecommendationProjection(
  input: Readonly<{
    recommendation: ImmutableRecommendationProjectionEnvelope;
    advisory: ConfidenceCalibrationAdvisoryResult;
    configuration: FrozenRecommendationProjectionConfiguration;
  }>,
): ConfidenceCalibrationRecommendationProjectionResult {
  if (!isRecord(input) || !keysEqual(input, TOP_LEVEL_KEYS)) {
    return blocked("blocked_invalid_input", [issue("invalid_input_shape", "")]);
  }

  const configuration = input.configuration;
  if (!isConfiguration(configuration)) {
    return blocked("blocked_invalid_input", [issue("invalid_configuration", "/configuration")]);
  }

  const recommendation = input.recommendation;
  if (!isRecommendationEnvelope(recommendation)) {
    return blocked("blocked_invalid_input", [issue("invalid_recommendation_envelope", "/recommendation")]);
  }
  if (!hasValidRecommendationFingerprint(recommendation)) {
    return blocked("blocked_invalid_lineage", [issue("invalid_recommendation_fingerprint", "/recommendation/recommendation_fingerprint")], recommendation);
  }
  if (!hasValidRecommendationSnapshotLineage(recommendation)) {
    return blocked("blocked_invalid_lineage", [issue("invalid_snapshot_lineage", "/recommendation/lineage")], recommendation);
  }
  if (!isValidConfidenceBasisPoints(recommendation.original_confidence_basis_points, configuration)) {
    return blocked("blocked_invalid_input", [issue("invalid_original_confidence", "/recommendation/original_confidence_basis_points")], recommendation);
  }

  const advisory = input.advisory;
  if (!isAdvisoryResult(advisory)) {
    return blocked("blocked_advisory_result", [issue("invalid_advisory_result", "/advisory")], recommendation);
  }

  const mappedStatus = STATUS_MAPPING[advisory.status as keyof typeof STATUS_MAPPING];
  if (!mappedStatus) {
    return blocked("blocked_unsupported_status", [issue("unsupported_advisory_status", "/advisory/status")], recommendation, advisory);
  }
  if (!ELIGIBLE_ADVISORY_STATUSES.has(advisory.status)) {
    return blocked(mappedStatus, mapAdvisoryIssues(advisory, projectionIssueForStatus(mappedStatus)), recommendation, advisory);
  }

  const advisoryOriginalBasisPoints = toBasisPoints(advisory.original_confidence, configuration);
  if (advisoryOriginalBasisPoints === null || advisoryOriginalBasisPoints !== recommendation.original_confidence_basis_points) {
    return blocked("blocked_confidence_mismatch", [issue("blocked_confidence_mismatch", "/advisory/original_confidence")], recommendation, advisory);
  }

  if (!hasValidAdvisoryIdentityAndSemanticHash(advisory, configuration)) {
    return blocked("blocked_advisory_result", [issue("blocked_advisory_result", "/advisory/advisory_hash")], recommendation, advisory);
  }
  if (advisory.status === "advisory_no_adjustment" && !hasValidNoAdjustmentSemantics(recommendation, advisory, configuration)) {
    return blocked("blocked_advisory_result", [issue("blocked_no_adjustment_semantics", "/advisory")], recommendation, advisory);
  }

  if (!hasMatchingLineage(recommendation, advisory)) {
    return blocked("blocked_invalid_lineage", [issue("blocked_invalid_lineage", "/advisory/lineage_hashes")], recommendation, advisory);
  }
  if (!hasPassedAntiLeakage(recommendation)) {
    return blocked("blocked_future_leakage", [issue("blocked_future_leakage", "/recommendation/anti_leakage")], recommendation, advisory);
  }
  if (!hasPassedAntiFeedback(recommendation, advisory)) {
    return blocked("blocked_invalid_lineage", [issue("blocked_feedback_reuse", "/recommendation/anti_feedback")], recommendation, advisory);
  }
  if (!hasCompatibleWarningsAndIssues(advisory, configuration)) {
    return blocked("blocked_advisory_result", [issue("blocked_warning_issue_shape", "/advisory")], recommendation, advisory);
  }

  const warnings = orderWarnings(advisory.warnings);
  const issues = orderIssues(advisory.issues);
  const advisoryProposedDeltaBasisPoints = toBasisPoints(advisory.proposed_delta, configuration);
  const advisoryProposedConfidenceBasisPoints = toBasisPoints(advisory.proposed_calibrated_confidence, configuration);
  if (advisoryProposedDeltaBasisPoints === null || advisoryProposedConfidenceBasisPoints === null) {
    return blocked("blocked_advisory_result", [issue("blocked_advisory_result", "/advisory/proposed_calibrated_confidence")], recommendation, advisory);
  }

  const lineage = buildProjectionLineage(recommendation, advisory);
  const advisoryIdentityHash = sha256({
    advisory_id: advisory.advisory_id,
    advisory_hash: advisory.advisory_hash,
  });
  const canonicalPayload = {
    projection_schema_version: configuration.projection_schema_version,
    configuration_version: configuration.configuration_version,
    recommendation_fingerprint: recommendation.recommendation_fingerprint,
    recommendation_snapshot_hash: recommendation.recommendation_snapshot_hash,
    recommendation_original_confidence_basis_points: recommendation.original_confidence_basis_points,
    advisory_status: advisory.status,
    advisory_id: advisory.advisory_id,
    advisory_identity_hash: advisoryIdentityHash,
    advisory_result_hash: advisory.advisory_hash,
    advisory_proposed_delta_basis_points: advisoryProposedDeltaBasisPoints,
    advisory_proposed_confidence_basis_points: advisoryProposedConfidenceBasisPoints,
    warnings,
    issues,
    lineage_hashes: lineage,
  };
  const projectionHash = sha256(canonicalPayload);

  return freeze({
    status: mappedStatus,
    projection_id: `${configuration.projection_id_prefix}${projectionHash.slice(0, 24)}`,
    projection_hash: projectionHash,
    recommendation_id: recommendation.recommendation_id,
    recommendation_fingerprint: recommendation.recommendation_fingerprint,
    recommendation_snapshot_hash: recommendation.recommendation_snapshot_hash,
    recommendation_original_confidence_basis_points: recommendation.original_confidence_basis_points,
    advisory_status: advisory.status,
    advisory_id: advisory.advisory_id,
    advisory_identity_hash: advisoryIdentityHash,
    advisory_result_hash: advisory.advisory_hash,
    advisory_proposed_delta_basis_points: advisoryProposedDeltaBasisPoints,
    advisory_proposed_confidence_basis_points: advisoryProposedConfidenceBasisPoints,
    calibration_status: advisory.calibration_status,
    calibration_id: advisory.calibration_id,
    lineage_hashes: lineage,
    warnings,
    issues,
    advisory_visible: advisory.advisory_visible,
    projection_visible: true,
    recommendation_confidence_unchanged: true,
    ranking_affected: false,
    scanner_affected: false,
    publication_affected: false,
    execution_affected: false,
    non_authoritative: true,
    applied: false,
    application_eligible: false,
  });
}

function blocked(
  status: ProjectionStatus,
  issues: readonly ProjectionIssue[],
  recommendation?: ImmutableRecommendationProjectionEnvelope,
  advisory?: ConfidenceCalibrationAdvisoryResult,
): ConfidenceCalibrationRecommendationProjectionResult {
  return freeze({
    status,
    projection_id: null,
    projection_hash: null,
    recommendation_id: recommendation?.recommendation_id ?? null,
    recommendation_fingerprint: recommendation?.recommendation_fingerprint ?? advisory?.recommendation_fingerprint ?? null,
    recommendation_snapshot_hash: recommendation?.recommendation_snapshot_hash ?? advisory?.recommendation_snapshot_hash ?? null,
    recommendation_original_confidence_basis_points: recommendation?.original_confidence_basis_points ?? null,
    advisory_status: advisory?.status ?? null,
    advisory_id: advisory?.advisory_id ?? null,
    advisory_identity_hash: null,
    advisory_result_hash: advisory?.advisory_hash ?? null,
    advisory_proposed_delta_basis_points: null,
    advisory_proposed_confidence_basis_points: null,
    calibration_status: advisory?.calibration_status ?? null,
    calibration_id: advisory?.calibration_id ?? null,
    lineage_hashes: null,
    warnings: advisory ? orderWarnings(advisory.warnings) : [],
    issues: orderIssues(issues),
    advisory_visible: false,
    projection_visible: false,
    recommendation_confidence_unchanged: true,
    ranking_affected: false,
    scanner_affected: false,
    publication_affected: false,
    execution_affected: false,
    non_authoritative: true,
    applied: false,
    application_eligible: false,
  });
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function keysEqual(value: UnknownRecord, expected: readonly string[]): boolean {
  const actual = Object.keys(value).sort(compareText);
  const wanted = [...expected].sort(compareText);
  return actual.length === wanted.length && actual.every((key, index) => key === wanted[index]);
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function orderText(values: readonly string[]): readonly string[] {
  return freeze([...new Set(values)].sort(compareText));
}

function isConfiguration(value: unknown): value is FrozenRecommendationProjectionConfiguration {
  if (!isRecord(value) || !keysEqual(value, CONFIGURATION_KEYS)) return false;
  const config = value as Partial<FrozenRecommendationProjectionConfiguration>;
  return value.projection_schema_version === "confidence_calibration_recommendation_projection_v1" &&
    value.configuration_version === "confidence_calibration_recommendation_projection_config_v1" &&
    value.projection_id_prefix === "confidence_calibration_recommendation_projection_v1:" &&
    value.advisory_schema_version === "confidence_calibration_advisory_result_v1" &&
    value.advisory_configuration_version === "confidence_calibration_advisory_config_v1" &&
    value.confidence_scale_basis_points_per_point === 100 &&
    value.accepted_min_confidence_basis_points === 0 &&
    value.accepted_max_confidence_basis_points === 10000 &&
    isRecord(config.status_mapping) &&
    keysEqual(config.status_mapping, Object.keys(STATUS_MAPPING)) &&
    Object.entries(STATUS_MAPPING).every(([key, mapped]) =>
      config.status_mapping?.[key as keyof typeof STATUS_MAPPING] === mapped) &&
    value.visibility_policy === "projection_visible_for_eligible_advisories" &&
    value.identity_policy === "action_448_projection_identity_v1" &&
    value.canonical_hash_version === "action_448_canonical_json_sha256_v1" &&
    value.warning_message_key_prefix === "confidence_calibration_advisory." &&
    value.issue_message_key_prefix === "confidence_calibration_advisory." &&
    value.projection_issue_message_key_prefix === "confidence_calibration_recommendation_projection." &&
    value.runtime_preview_status === "runtime_preview_waiting_for_operator_inputs";
}

function isRecommendationEnvelope(value: unknown): value is ImmutableRecommendationProjectionEnvelope {
  if (!isRecord(value) || !keysEqual(value, RECOMMENDATION_KEYS)) return false;
  return (
    (typeof value.recommendation_id === "string" || value.recommendation_id === null) &&
    typeof value.recommendation_fingerprint === "string" &&
    typeof value.recommendation_snapshot_hash === "string" &&
    typeof value.original_confidence_basis_points === "number" &&
    value.schema_version === "recommendation_projection_envelope_v1" &&
    isDecisionBoundary(value.decision_boundary) &&
    isIdentity(value.identity) &&
    isSource(value.source) &&
    isRecommendationLineage(value.lineage) &&
    value.static_only === true &&
    value.non_authoritative === true &&
    value.no_persistence === true &&
    value.no_replay === true &&
    value.no_runtime === true &&
    value.no_feedback === true &&
    value.no_mutation_callback === true &&
    isFalseCommandSet(value.commands) &&
    isAntiFeedback(value.anti_feedback) &&
    isAntiLeakage(value.anti_leakage)
  );
}

function isDecisionBoundary(value: unknown): value is ImmutableRecommendationProjectionEnvelope["decision_boundary"] {
  return isRecord(value) &&
    keysEqual(value, ["anti_leakage_state", "boundary_id", "boundary_sha256", "evidence_cutoff_sha256"]) &&
    typeof value.boundary_id === "string" &&
    value.boundary_id.length > 0 &&
    typeof value.boundary_sha256 === "string" &&
    typeof value.evidence_cutoff_sha256 === "string" &&
    value.anti_leakage_state === "passed";
}

function isIdentity(value: unknown): value is ImmutableRecommendationProjectionEnvelope["identity"] {
  return isRecord(value) &&
    keysEqual(value, ["side", "ticker"]) &&
    (typeof value.ticker === "string" || value.ticker === null) &&
    (value.side === "long" || value.side === "short" || value.side === null);
}

function isSource(value: unknown): value is ImmutableRecommendationProjectionEnvelope["source"] {
  return isRecord(value) &&
    keysEqual(value, ["immutable", "source_classification", "source_kind", "source_version"]) &&
    value.source_kind === "recommendation_snapshot" &&
    typeof value.source_version === "string" &&
    value.source_version.length > 0 &&
    value.source_classification === "static_projection" &&
    value.immutable === true;
}

function isRecommendationLineage(value: unknown): value is ImmutableRecommendationProjectionEnvelope["lineage"] {
  return isRecord(value) &&
    keysEqual(value, [
      "decision_boundary_sha256",
      "evidence_lineage_hash",
      "pattern_discovery_result_hashes",
      "pattern_insight_hashes",
      "recommendation_source_hash",
      "source_scenario_ids",
      "source_snapshot_ids",
    ]) &&
    typeof value.recommendation_source_hash === "string" &&
    typeof value.decision_boundary_sha256 === "string" &&
    typeof value.evidence_lineage_hash === "string" &&
    isStringArray(value.pattern_discovery_result_hashes) &&
    isStringArray(value.pattern_insight_hashes) &&
    isStringArray(value.source_scenario_ids) &&
    isStringArray(value.source_snapshot_ids);
}

function isFalseCommandSet(value: unknown): value is ImmutableRecommendationProjectionEnvelope["commands"] {
  return isRecord(value) &&
    keysEqual(value, ["execution", "feedback", "mutation", "persistence", "publication", "ranking", "scanner"]) &&
    Object.values(value).every((item) => item === false);
}

function isAntiFeedback(value: unknown): value is ImmutableRecommendationProjectionEnvelope["anti_feedback"] {
  return isRecord(value) &&
    keysEqual(value, [
      "circular_projection_lineage",
      "projection_reused_as_calibration_evidence",
      "projection_reused_as_execution_signal",
      "projection_reused_as_feedback_event",
      "projection_reused_as_future_advisory_base_input",
      "projection_reused_as_intelligence_context",
      "projection_reused_as_learning_dataset_input",
      "projection_reused_as_outcome",
      "projection_reused_as_pattern_discovery_evidence",
      "projection_reused_as_publication_signal",
      "projection_reused_as_ranking_signal",
      "projection_reused_as_recommendation_confidence_input",
      "projection_reused_as_scanner_signal",
      "self_referential_recommendation_lineage",
    ]) &&
    Object.values(value).every((item) => typeof item === "boolean");
}

function isAntiLeakage(value: unknown): value is ImmutableRecommendationProjectionEnvelope["anti_leakage"] {
  return isRecord(value) &&
    keysEqual(value, [
      "evidence_after_decision_boundary",
      "future_outcome_evidence",
      "post_entry_evidence",
      "post_exit_evidence",
      "prohibited_self_calibration",
      "same_recommendation_realized_result",
      "status",
    ]) &&
    typeof value.status === "string" &&
    typeof value.evidence_after_decision_boundary === "boolean" &&
    typeof value.future_outcome_evidence === "boolean" &&
    typeof value.post_entry_evidence === "boolean" &&
    typeof value.post_exit_evidence === "boolean" &&
    typeof value.prohibited_self_calibration === "boolean" &&
    typeof value.same_recommendation_realized_result === "boolean";
}

function hasValidRecommendationFingerprint(value: ImmutableRecommendationProjectionEnvelope): boolean {
  return value.recommendation_fingerprint.trim().length > 0 &&
    (value.recommendation_id === null || value.recommendation_id.trim().length > 0);
}

function hasValidRecommendationSnapshotLineage(value: ImmutableRecommendationProjectionEnvelope): boolean {
  return HASH_PATTERN.test(value.recommendation_snapshot_hash) &&
    HASH_PATTERN.test(value.decision_boundary.boundary_sha256) &&
    HASH_PATTERN.test(value.decision_boundary.evidence_cutoff_sha256) &&
    value.lineage.decision_boundary_sha256 === value.decision_boundary.boundary_sha256 &&
    HASH_PATTERN.test(value.lineage.recommendation_source_hash) &&
    HASH_PATTERN.test(value.lineage.decision_boundary_sha256) &&
    HASH_PATTERN.test(value.lineage.evidence_lineage_hash) &&
    value.lineage.pattern_discovery_result_hashes.length > 0 &&
    value.lineage.pattern_insight_hashes.length > 0 &&
    value.lineage.source_scenario_ids.length > 0 &&
    value.lineage.source_snapshot_ids.length > 0 &&
    value.lineage.pattern_discovery_result_hashes.every((hash) => HASH_PATTERN.test(hash)) &&
    value.lineage.pattern_insight_hashes.every((hash) => HASH_PATTERN.test(hash));
}

function isValidConfidenceBasisPoints(
  value: unknown,
  configuration: FrozenRecommendationProjectionConfiguration,
): value is number {
  return typeof value === "number" &&
    Number.isInteger(value) &&
    value >= configuration.accepted_min_confidence_basis_points &&
    value <= configuration.accepted_max_confidence_basis_points;
}

function isAdvisoryResult(value: unknown): value is ConfidenceCalibrationAdvisoryResult {
  if (!isRecord(value) || !keysEqual(value, ADVISORY_KEYS)) return false;
  return typeof value.status === "string" &&
    (typeof value.advisory_id === "string" || value.advisory_id === null) &&
    (typeof value.advisory_hash === "string" || value.advisory_hash === null) &&
    (typeof value.recommendation_fingerprint === "string" || value.recommendation_fingerprint === null) &&
    (typeof value.recommendation_snapshot_hash === "string" || value.recommendation_snapshot_hash === null) &&
    (typeof value.original_confidence === "number" || value.original_confidence === null) &&
    (typeof value.proposed_delta === "number" || value.proposed_delta === null) &&
    (typeof value.proposed_calibrated_confidence === "number" || value.proposed_calibrated_confidence === null) &&
    (typeof value.calibration_status === "string" || value.calibration_status === null) &&
    (typeof value.calibration_id === "string" || value.calibration_id === null) &&
    (isRecord(value.lineage_hashes) || value.lineage_hashes === null) &&
    Array.isArray(value.warnings) &&
    Array.isArray(value.issues) &&
    Array.isArray(value.reasons) &&
    typeof value.advisory_eligible === "boolean" &&
    typeof value.advisory_visible === "boolean" &&
    value.application_eligible === false &&
    value.non_authoritative === true &&
    value.applied === false;
}

function hasValidAdvisoryIdentityAndSemanticHash(
  advisory: ConfidenceCalibrationAdvisoryResult,
  configuration: FrozenRecommendationProjectionConfiguration,
): boolean {
  if (
    typeof advisory.advisory_id !== "string" ||
    typeof advisory.advisory_hash !== "string" ||
    !ADVISORY_ID_PATTERN.test(advisory.advisory_id) ||
    !HASH_PATTERN.test(advisory.advisory_hash) ||
    !isAdvisoryLineage(advisory.lineage_hashes)
  ) {
    return false;
  }
  const expectedHash = sha256(buildAdvisorySemanticHashPayload(advisory, configuration));
  return advisory.advisory_hash === expectedHash &&
    advisory.advisory_id === `confidence_calibration_advisory_v1:${expectedHash.slice(0, 24)}`;
}

function buildAdvisorySemanticHashPayload(
  advisory: ConfidenceCalibrationAdvisoryResult,
  configuration: FrozenRecommendationProjectionConfiguration,
): Readonly<{
  adapter_schema_version: "confidence_calibration_advisory_result_v1";
  configuration_version: "confidence_calibration_advisory_config_v1";
  status: ConfidenceCalibrationAdvisoryResult["status"];
  recommendation_fingerprint: string | null;
  recommendation_snapshot_hash: string | null;
  original_confidence_basis_points: number | null;
  calibration_status: ConfidenceCalibrationAdvisoryResult["calibration_status"];
  calibration_id: string | null;
  calibration_identity_hash: string;
  calibration_result_hash: string;
  proposed_delta_basis_points: number | null;
  proposed_confidence_basis_points: number | null;
  warnings: readonly ProjectionWarning[];
  issues: readonly ProjectionIssue[];
  lineage_hashes: NonNullable<ConfidenceCalibrationAdvisoryResult["lineage_hashes"]>;
  advisory_eligible: boolean;
  advisory_visible: boolean;
  application_eligible: false;
  reasons: readonly string[];
  non_authoritative: true;
  applied: false;
}> {
  if (!isAdvisoryLineage(advisory.lineage_hashes)) {
    throw new TypeError("invalid_advisory_lineage");
  }
  // `advisory_id` is bound immediately after this hash comparison as
  // `${prefix}${hash.slice(0, 24)}`; including it inside its own result hash
  // would create a circular, non-computable self-reference.
  return {
    adapter_schema_version: configuration.advisory_schema_version,
    configuration_version: configuration.advisory_configuration_version,
    status: advisory.status,
    recommendation_fingerprint: advisory.recommendation_fingerprint,
    recommendation_snapshot_hash: advisory.recommendation_snapshot_hash,
    original_confidence_basis_points: toBasisPoints(advisory.original_confidence, configuration),
    calibration_status: advisory.calibration_status,
    calibration_id: advisory.calibration_id,
    calibration_identity_hash: advisory.lineage_hashes.calibration_identity_hash,
    calibration_result_hash: advisory.lineage_hashes.calibration_result_hash,
    proposed_delta_basis_points: toBasisPoints(advisory.proposed_delta, configuration),
    proposed_confidence_basis_points: toBasisPoints(advisory.proposed_calibrated_confidence, configuration),
    warnings: orderWarnings(advisory.warnings),
    issues: orderIssues(advisory.issues),
    lineage_hashes: canonicalAdvisoryLineage(advisory.lineage_hashes),
    advisory_eligible: advisory.advisory_eligible,
    advisory_visible: advisory.advisory_visible,
    application_eligible: advisory.application_eligible,
    reasons: orderText(advisory.reasons),
    non_authoritative: advisory.non_authoritative,
    applied: advisory.applied,
  };
}

function isAdvisoryLineage(value: unknown): value is NonNullable<ConfidenceCalibrationAdvisoryResult["lineage_hashes"]> {
  return isRecord(value) &&
    keysEqual(value, [
      "calibration_identity_hash",
      "calibration_result_hash",
      "decision_boundary_sha256",
      "evidence_lineage_hash",
      "pattern_discovery_result_hashes",
      "pattern_insight_hashes",
      "recommendation_source_hash",
    ]) &&
    HASH_PATTERN.test(value.recommendation_source_hash as string) &&
    HASH_PATTERN.test(value.decision_boundary_sha256 as string) &&
    HASH_PATTERN.test(value.calibration_identity_hash as string) &&
    HASH_PATTERN.test(value.calibration_result_hash as string) &&
    HASH_PATTERN.test(value.evidence_lineage_hash as string) &&
    isStringArray(value.pattern_discovery_result_hashes) &&
    isStringArray(value.pattern_insight_hashes) &&
    value.pattern_discovery_result_hashes.every((hash) => HASH_PATTERN.test(hash)) &&
    value.pattern_insight_hashes.every((hash) => HASH_PATTERN.test(hash));
}

function canonicalAdvisoryLineage(
  value: NonNullable<ConfidenceCalibrationAdvisoryResult["lineage_hashes"]>,
): NonNullable<ConfidenceCalibrationAdvisoryResult["lineage_hashes"]> {
  return freeze({
    recommendation_source_hash: value.recommendation_source_hash,
    decision_boundary_sha256: value.decision_boundary_sha256,
    pattern_discovery_result_hashes: orderText(value.pattern_discovery_result_hashes),
    pattern_insight_hashes: orderText(value.pattern_insight_hashes),
    calibration_identity_hash: value.calibration_identity_hash,
    calibration_result_hash: value.calibration_result_hash,
    evidence_lineage_hash: value.evidence_lineage_hash,
  });
}

function hasValidNoAdjustmentSemantics(
  recommendation: ImmutableRecommendationProjectionEnvelope,
  advisory: ConfidenceCalibrationAdvisoryResult,
  configuration: FrozenRecommendationProjectionConfiguration,
): boolean {
  return toBasisPoints(advisory.proposed_delta, configuration) === 0 &&
    toBasisPoints(advisory.proposed_calibrated_confidence, configuration) === recommendation.original_confidence_basis_points &&
    advisory.warnings.length === 0 &&
    advisory.issues.length === 0;
}

function hasMatchingLineage(
  recommendation: ImmutableRecommendationProjectionEnvelope,
  advisory: ConfidenceCalibrationAdvisoryResult,
): boolean {
  if (!isAdvisoryLineage(advisory.lineage_hashes)) return false;
  return advisory.recommendation_fingerprint === recommendation.recommendation_fingerprint &&
    advisory.recommendation_snapshot_hash === recommendation.recommendation_snapshot_hash &&
    advisory.lineage_hashes.recommendation_source_hash === recommendation.lineage.recommendation_source_hash &&
    advisory.lineage_hashes.decision_boundary_sha256 === recommendation.lineage.decision_boundary_sha256 &&
    advisory.lineage_hashes.evidence_lineage_hash === recommendation.lineage.evidence_lineage_hash &&
    arrayEqual(orderText(advisory.lineage_hashes.pattern_discovery_result_hashes), orderText(recommendation.lineage.pattern_discovery_result_hashes)) &&
    arrayEqual(orderText(advisory.lineage_hashes.pattern_insight_hashes), orderText(recommendation.lineage.pattern_insight_hashes));
}

function hasPassedAntiLeakage(recommendation: ImmutableRecommendationProjectionEnvelope): boolean {
  return recommendation.anti_leakage.status === "passed" &&
    recommendation.decision_boundary.anti_leakage_state === "passed" &&
    Object.entries(recommendation.anti_leakage).every(([key, value]) => key === "status" ? value === "passed" : value === false);
}

function hasPassedAntiFeedback(
  recommendation: ImmutableRecommendationProjectionEnvelope,
  advisory: ConfidenceCalibrationAdvisoryResult,
): boolean {
  if (!Object.values(recommendation.anti_feedback).every((value) => value === false)) return false;
  const prohibited = [
    advisory.advisory_id,
    advisory.advisory_hash,
    advisory.calibration_id,
    recommendation.recommendation_fingerprint,
    recommendation.recommendation_snapshot_hash,
    recommendation.lineage.recommendation_source_hash,
    ...recommendation.lineage.source_scenario_ids,
    ...recommendation.lineage.source_snapshot_ids,
    ...recommendation.lineage.pattern_discovery_result_hashes,
    ...recommendation.lineage.pattern_insight_hashes,
  ].filter((value): value is string => typeof value === "string");
  return advisory.advisory_id === null || !prohibited.slice(3).includes(advisory.advisory_id);
}

function hasCompatibleWarningsAndIssues(
  advisory: ConfidenceCalibrationAdvisoryResult,
  configuration: FrozenRecommendationProjectionConfiguration,
): boolean {
  if (advisory.status === "advisory_ready" && advisory.issues.length > 0) return false;
  if (advisory.status === "advisory_no_adjustment" && (advisory.warnings.length > 0 || advisory.issues.length > 0)) return false;
  return advisory.warnings.every((item) =>
      isRecord(item) &&
      typeof item.code === "string" &&
      ADVISORY_WARNING_CODES.has(item.code) &&
      typeof item.path === "string" &&
      RFC6901_PATTERN.test(item.path) &&
      item.severity === "warning" &&
      item.messageKey === `${configuration.warning_message_key_prefix}${item.code}`) &&
    advisory.issues.every((item) =>
      isRecord(item) &&
      typeof item.code === "string" &&
      ADVISORY_ISSUE_CODES.has(item.code) &&
      typeof item.path === "string" &&
      RFC6901_PATTERN.test(item.path) &&
      item.severity === "error" &&
      item.messageKey === `${configuration.issue_message_key_prefix}${item.code}`);
}

function buildProjectionLineage(
  recommendation: ImmutableRecommendationProjectionEnvelope,
  advisory: ConfidenceCalibrationAdvisoryResult,
): NonNullable<ConfidenceCalibrationRecommendationProjectionResult["lineage_hashes"]> {
  if (!isAdvisoryLineage(advisory.lineage_hashes)) throw new TypeError("invalid_advisory_lineage");
  return freeze({
    recommendation_source_hash: recommendation.lineage.recommendation_source_hash,
    decision_boundary_sha256: recommendation.lineage.decision_boundary_sha256,
    evidence_lineage_hash: recommendation.lineage.evidence_lineage_hash,
    pattern_discovery_result_hashes: orderText(recommendation.lineage.pattern_discovery_result_hashes),
    pattern_insight_hashes: orderText(recommendation.lineage.pattern_insight_hashes),
    calibration_identity_hash: advisory.lineage_hashes.calibration_identity_hash,
    calibration_result_hash: advisory.lineage_hashes.calibration_result_hash,
  });
}

function mapAdvisoryIssues(
  advisory: ConfidenceCalibrationAdvisoryResult,
  fallbackCode: string,
): readonly ProjectionIssue[] {
  if (advisory.issues.length === 0) return [issue(fallbackCode, "/advisory/status")];
  return advisory.issues.map((item) => issue(
    PROJECTION_ISSUE_CODES.has(item.code) ? item.code : fallbackCode,
    item.path,
  ));
}

function projectionIssueForStatus(status: ProjectionStatus): string {
  if (status === "projection_insufficient_evidence") return "blocked_advisory_result";
  if (status === "blocked_unsupported_status") return "unsupported_advisory_status";
  if (status === "blocked_confidence_mismatch") return "blocked_confidence_mismatch";
  if (status === "blocked_invalid_lineage") return "blocked_invalid_lineage";
  if (status === "blocked_future_leakage") return "blocked_future_leakage";
  if (status === "blocked_invalid_input") return "invalid_advisory_result";
  return "blocked_advisory_result";
}

function issue(code: string, path: string): ProjectionIssue {
  const safeCode = PROJECTION_ISSUE_CODES.has(code) ? code : "blocked_advisory_result";
  return {
    code: safeCode,
    path,
    severity: "error",
    messageKey: `confidence_calibration_recommendation_projection.${safeCode}`,
  };
}

function orderIssues(values: readonly Readonly<{
  code: string;
  path: string;
  severity: "error";
  messageKey: string;
}>[]): readonly ProjectionIssue[] {
  const unique = new Map<string, ProjectionIssue>();
  for (const value of values) {
    unique.set(`${value.severity}\u0000${value.code}\u0000${value.path}\u0000${value.messageKey}`, {
      code: value.code,
      path: value.path,
      severity: "error",
      messageKey: value.messageKey,
    });
  }
  return freeze([...unique.values()].sort(
    (left, right) =>
      compareText(left.severity, right.severity) ||
      compareText(left.code, right.code) ||
      compareText(left.path, right.path) ||
      compareText(left.messageKey, right.messageKey),
  ));
}

function orderWarnings(values: readonly Readonly<{
  code: string;
  path: string;
  severity: "warning";
  messageKey: string;
}>[]): readonly ProjectionWarning[] {
  const unique = new Map<string, ProjectionWarning>();
  for (const value of values) {
    unique.set(`${value.severity}\u0000${value.code}\u0000${value.path}\u0000${value.messageKey}`, {
      code: value.code,
      path: value.path,
      severity: "warning",
      messageKey: value.messageKey,
    });
  }
  return freeze([...unique.values()].sort(
    (left, right) =>
      compareText(left.severity, right.severity) ||
      compareText(left.code, right.code) ||
      compareText(left.path, right.path) ||
      compareText(left.messageKey, right.messageKey),
  ));
}

function toBasisPoints(
  value: number | null,
  configuration: FrozenRecommendationProjectionConfiguration,
): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const basisPoints = value * configuration.confidence_scale_basis_points_per_point;
  if (Math.abs(basisPoints - Math.round(basisPoints)) > 1e-9) return null;
  return Object.is(Math.round(basisPoints), -0) ? 0 : Math.round(basisPoints);
}

function isStringArray(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string" && item.length > 0);
}

function arrayEqual(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((item, index) => item === right[index]);
}

function sha256(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(canonicalize(value)), "utf8").digest("hex");
}

function canonicalize(value: unknown): unknown {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("non_finite_canonical_number");
    return Object.is(value, -0) ? 0 : value;
  }
  if (Array.isArray(value)) return value.map(canonicalize);
  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, child]) => child !== undefined)
        .sort(([left], [right]) => compareText(left, right))
        .map(([key, child]) => [key, canonicalize(child)]),
    );
  }
  throw new TypeError("unsupported_canonical_value");
}

function freeze<T>(value: T): T {
  if (isRecord(value) || Array.isArray(value)) {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}
