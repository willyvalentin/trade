import { createHash } from "crypto";

import type { ConfidenceCalibrationResult } from "./pure-confidence-calibration";

export type ImmutableRecommendationConfidenceEnvelope = Readonly<{
  recommendation_id: string | null;
  recommendation_fingerprint: string;
  recommendation_snapshot_hash: string;
  original_confidence: number;
  decision_boundary: Readonly<{
    boundary_id: string;
    boundary_sha256: string;
    evidence_cutoff_sha256: string;
    anti_leakage_state: "passed";
  }>;
  source: Readonly<{
    source_kind: "recommendation_snapshot";
    source_version: string;
    immutable: true;
  }>;
  lineage: Readonly<{
    recommendation_source_hash: string;
    pattern_discovery_result_hashes: readonly string[];
    pattern_insight_ids: readonly string[];
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
    calibration_output_reused_as_learning_dataset_input: false;
    calibration_output_reused_as_pattern_discovery_evidence: false;
    calibration_output_reused_as_outcome: false;
    calibration_output_reused_as_context: false;
    calibration_output_reused_as_recommendation_base_confidence: false;
    calibration_output_reused_as_scanner_signal: false;
    calibration_output_reused_as_ranking_signal: false;
    calibration_output_reused_as_publication_signal: false;
    calibration_output_reused_as_execution_signal: false;
    calibration_output_reused_as_calibration_input_evidence: false;
    circular_calibration_lineage: false;
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

export type FrozenAdvisoryConsumptionConfiguration = Readonly<{
  adapter_schema_version: "confidence_calibration_advisory_result_v1";
  configuration_version: "confidence_calibration_advisory_config_v1";
  advisory_id_prefix: "confidence_calibration_advisory_v1:";
  confidence_scale_basis_points_per_point: 100;
  accepted_min_confidence_basis_points: 0;
  accepted_max_confidence_basis_points: 10000;
  output_decimal_precision: 2;
  deterministic_sorting_policy: "action_432_sort_v1";
  identity_policy: "action_432_identity_v1";
  issue_message_key_prefix: "confidence_calibration_advisory.";
  eligible_calibration_statuses: readonly ["calibrated", "calibrated_with_warnings", "no_adjustment"];
  blocked_calibration_status_map: Readonly<{
    insufficient_eligible_evidence: "advisory_insufficient_evidence";
    blocked_invalid_input: "blocked_invalid_input";
    blocked_invalid_configuration: "blocked_invalid_input";
    blocked_invalid_lineage: "blocked_invalid_lineage";
    blocked_future_leakage: "blocked_future_leakage";
    blocked_overlapping_evidence: "blocked_calibration_result";
    blocked_unsupported_insight: "blocked_unsupported_status";
  }>;
  advisory_visibility_policy: "advisory_visible_for_eligible_statuses";
  application_policy: "never_apply_in_action_432";
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs";
}>;

export type ConfidenceCalibrationAdvisoryResult = Readonly<{
  status:
    | "advisory_ready"
    | "advisory_ready_with_warnings"
    | "advisory_no_adjustment"
    | "advisory_insufficient_evidence"
    | "blocked_invalid_input"
    | "blocked_confidence_mismatch"
    | "blocked_invalid_lineage"
    | "blocked_future_leakage"
    | "blocked_calibration_result"
    | "blocked_unsupported_status";
  advisory_id: string | null;
  advisory_hash: string | null;
  recommendation_fingerprint: string | null;
  recommendation_snapshot_hash: string | null;
  original_confidence: number | null;
  proposed_delta: number | null;
  proposed_calibrated_confidence: number | null;
  calibration_status: ConfidenceCalibrationResult["status"] | null;
  calibration_id: string | null;
  lineage_hashes: Readonly<{
    recommendation_source_hash: string;
    decision_boundary_sha256: string;
    pattern_discovery_result_hashes: readonly string[];
    pattern_insight_hashes: readonly string[];
    calibration_identity_hash: string;
    calibration_result_hash: string;
    evidence_lineage_hash: string;
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
  advisory_eligible: boolean;
  advisory_visible: boolean;
  application_eligible: false;
  reasons: readonly string[];
  non_authoritative: true;
  applied: false;
}>;

type UnknownRecord = Record<string, unknown>;
type AdvisoryStatus = ConfidenceCalibrationAdvisoryResult["status"];
type AdvisoryIssue = ConfidenceCalibrationAdvisoryResult["issues"][number];
type AdvisoryWarning = ConfidenceCalibrationAdvisoryResult["warnings"][number];

const HASH_PATTERN = /^[a-f0-9]{64}$/;
const CALIBRATION_ID_PATTERN = /^confidence_calibration_v1:[a-f0-9]{24}$/;
const RFC6901_PATTERN = /^(?:|(?:\/(?:[^~/]|~0|~1)*))*$/;
const TOP_LEVEL_KEYS = ["calibration", "configuration", "recommendation"] as const;
const CONFIGURATION_KEYS = [
  "accepted_max_confidence_basis_points",
  "accepted_min_confidence_basis_points",
  "adapter_schema_version",
  "advisory_id_prefix",
  "advisory_visibility_policy",
  "application_policy",
  "blocked_calibration_status_map",
  "confidence_scale_basis_points_per_point",
  "configuration_version",
  "deterministic_sorting_policy",
  "eligible_calibration_statuses",
  "identity_policy",
  "issue_message_key_prefix",
  "output_decimal_precision",
  "runtime_preview_status",
] as const;
const RECOMMENDATION_KEYS = [
  "anti_feedback",
  "anti_leakage",
  "commands",
  "decision_boundary",
  "lineage",
  "no_feedback",
  "no_mutation_callback",
  "no_persistence",
  "no_replay",
  "no_runtime",
  "non_authoritative",
  "original_confidence",
  "recommendation_fingerprint",
  "recommendation_id",
  "recommendation_snapshot_hash",
  "source",
  "static_only",
] as const;
const CALIBRATION_KEYS = [
  "adjustments",
  "applied",
  "calibration_hash",
  "calibration_id",
  "evidence_summary",
  "excluded_insight_ids",
  "included_insight_ids",
  "issues",
  "lineage_hashes",
  "non_authoritative",
  "original_confidence",
  "overlap_summary",
  "proposed_calibrated_confidence",
  "proposed_delta",
  "status",
  "warnings",
] as const;
const ELIGIBLE_STATUS_TO_ADVISORY_STATUS = {
  calibrated: "advisory_ready",
  calibrated_with_warnings: "advisory_ready_with_warnings",
  no_adjustment: "advisory_no_adjustment",
} as const;
const BLOCKED_STATUS_TO_ADVISORY_STATUS = {
  insufficient_eligible_evidence: "advisory_insufficient_evidence",
  blocked_invalid_input: "blocked_invalid_input",
  blocked_invalid_configuration: "blocked_invalid_input",
  blocked_invalid_lineage: "blocked_invalid_lineage",
  blocked_future_leakage: "blocked_future_leakage",
  blocked_overlapping_evidence: "blocked_calibration_result",
  blocked_unsupported_insight: "blocked_unsupported_status",
} as const;
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
const CALIBRATION_WARNING_CODES = new Set([
  "duplicate_mapper_row_identity",
  "metric_value_unavailable",
  "duplicate_insight_deduped",
  "overlapping_insight_excluded",
  "insight_excluded",
  "confidence_clamped_to_bounds",
]);
const CALIBRATION_ISSUE_CODES = new Set([
  "invalid_input_shape",
  "invalid_configuration_shape",
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
]);

export function buildConfidenceCalibrationAdvisory(input: Readonly<{
  recommendation: ImmutableRecommendationConfidenceEnvelope;
  calibration: ConfidenceCalibrationResult;
  configuration: FrozenAdvisoryConsumptionConfiguration;
}>): ConfidenceCalibrationAdvisoryResult {
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
  if (!hasValidRecommendationIdentity(recommendation)) {
    return blocked("blocked_invalid_lineage", [issue("invalid_recommendation_identity", "/recommendation/recommendation_fingerprint")]);
  }
  if (!hasValidRecommendationLineage(recommendation)) {
    return blocked("blocked_invalid_lineage", [issue("invalid_snapshot_lineage", "/recommendation/lineage")]);
  }
  if (!isValidConfidence(recommendation.original_confidence, configuration)) {
    return blocked("blocked_invalid_input", [issue("invalid_original_confidence", "/recommendation/original_confidence")], recommendation);
  }

  const calibration = input.calibration;
  if (!isCalibrationResult(calibration)) {
    return blocked("blocked_calibration_result", [issue("invalid_calibration_result", "/calibration")], recommendation);
  }

  const mappedBlockedStatus = BLOCKED_STATUS_TO_ADVISORY_STATUS[calibration.status as keyof typeof BLOCKED_STATUS_TO_ADVISORY_STATUS];
  if (mappedBlockedStatus) {
    return blocked(mappedBlockedStatus, mapCalibrationIssues(calibration, "blocked_calibration_result"), recommendation, calibration);
  }

  if (!(calibration.status in ELIGIBLE_STATUS_TO_ADVISORY_STATUS)) {
    return blocked("blocked_unsupported_status", [issue("blocked_unsupported_status", "/calibration/status")], recommendation, calibration);
  }

  if (!hasValidEligibleCalibrationNumbers(calibration, configuration)) {
    return blocked("blocked_calibration_result", [issue("invalid_calibration_result", "/calibration")], recommendation, calibration);
  }
  if (calibration.original_confidence !== recommendation.original_confidence) {
    return blocked("blocked_confidence_mismatch", [issue("blocked_confidence_mismatch", "/calibration/original_confidence")], recommendation, calibration);
  }
  if (!hasValidCalibrationIdentity(calibration)) {
    return blocked("blocked_calibration_result", [issue("invalid_calibration_result", "/calibration/calibration_id")], recommendation, calibration);
  }
  if (!hasValidCalibrationSemanticHash(calibration, configuration)) {
    return blocked("blocked_calibration_result", [issue("blocked_calibration_result", "/calibration/calibration_hash")], recommendation, calibration);
  }
  if (!hasMatchingPatternLineage(recommendation, calibration)) {
    return blocked("blocked_invalid_lineage", [issue("blocked_invalid_lineage", "/calibration/lineage_hashes")], recommendation, calibration);
  }
  if (!hasPassedAntiLeakage(recommendation)) {
    return blocked("blocked_future_leakage", [issue("blocked_future_leakage", "/recommendation/anti_leakage")], recommendation, calibration);
  }
  if (!hasPassedAntiFeedback(recommendation, calibration)) {
    return blocked("blocked_invalid_lineage", [issue("blocked_feedback_reuse", "/recommendation/anti_feedback")], recommendation, calibration);
  }
  if (!hasCompatibleWarningsAndIssues(calibration)) {
    return blocked("blocked_calibration_result", [issue("blocked_warning_issue_shape", "/calibration")], recommendation, calibration);
  }
  if (calibration.status === "no_adjustment" && !hasValidNoAdjustmentSemantics(calibration)) {
    return blocked("blocked_calibration_result", [issue("blocked_no_adjustment_semantics", "/calibration")], recommendation, calibration);
  }

  const eligibleStatus = calibration.status as keyof typeof ELIGIBLE_STATUS_TO_ADVISORY_STATUS;
  const advisoryStatus = ELIGIBLE_STATUS_TO_ADVISORY_STATUS[eligibleStatus];
  const warnings = orderWarnings(mapCalibrationWarnings(calibration));
  const issues = orderIssues(mapCalibrationIssues(calibration));
  const originalBasisPoints = toBasisPoints(recommendation.original_confidence, configuration);
  const proposedDeltaBasisPoints = toBasisPoints(calibration.proposed_delta ?? 0, configuration);
  const proposedBasisPoints = toBasisPoints(calibration.proposed_calibrated_confidence ?? recommendation.original_confidence, configuration);
  const lineage = buildLineageHashes(recommendation, calibration);
  const reasons = orderText([
    `calibration_status:${calibration.status}`,
    `advisory_status:${advisoryStatus}`,
    "non_authoritative",
    "applied_false",
  ]);
  const canonicalPayload = {
    adapter_schema_version: configuration.adapter_schema_version,
    configuration_version: configuration.configuration_version,
    recommendation_fingerprint: recommendation.recommendation_fingerprint,
    recommendation_snapshot_hash: recommendation.recommendation_snapshot_hash,
    original_confidence_basis_points: originalBasisPoints,
    calibration_status: calibration.status,
    calibration_id: calibration.calibration_id,
    calibration_identity_hash: lineage.calibration_identity_hash,
    calibration_result_hash: lineage.calibration_result_hash,
    proposed_delta_basis_points: proposedDeltaBasisPoints,
    proposed_confidence_basis_points: proposedBasisPoints,
    warnings,
    issues,
    lineage_hashes: lineage,
  };
  const advisoryHash = sha256(canonicalPayload);
  return freeze({
    status: advisoryStatus,
    advisory_id: `${configuration.advisory_id_prefix}${advisoryHash.slice(0, 24)}`,
    advisory_hash: advisoryHash,
    recommendation_fingerprint: recommendation.recommendation_fingerprint,
    recommendation_snapshot_hash: recommendation.recommendation_snapshot_hash,
    original_confidence: recommendation.original_confidence,
    proposed_delta: calibration.proposed_delta,
    proposed_calibrated_confidence: calibration.proposed_calibrated_confidence,
    calibration_status: calibration.status,
    calibration_id: calibration.calibration_id,
    lineage_hashes: lineage,
    warnings,
    issues,
    advisory_eligible: true,
    advisory_visible: true,
    application_eligible: false,
    reasons,
    non_authoritative: true,
    applied: false,
  });
}

function blocked(
  status: AdvisoryStatus,
  issues: readonly AdvisoryIssue[],
  recommendation?: ImmutableRecommendationConfidenceEnvelope,
  calibration?: ConfidenceCalibrationResult,
): ConfidenceCalibrationAdvisoryResult {
  return freeze({
    status,
    advisory_id: null,
    advisory_hash: null,
    recommendation_fingerprint: recommendation?.recommendation_fingerprint ?? null,
    recommendation_snapshot_hash: recommendation?.recommendation_snapshot_hash ?? null,
    original_confidence: recommendation?.original_confidence ?? calibration?.original_confidence ?? null,
    proposed_delta: null,
    proposed_calibrated_confidence: null,
    calibration_status: calibration?.status ?? null,
    calibration_id: calibration?.calibration_id ?? null,
    lineage_hashes: null,
    warnings: calibration ? orderWarnings(mapCalibrationWarnings(calibration)) : [],
    issues: orderIssues(issues),
    advisory_eligible: false,
    advisory_visible: false,
    application_eligible: false,
    reasons: orderText([status]),
    non_authoritative: true,
    applied: false,
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
  return [...new Set(values)].sort(compareText);
}

function isConfiguration(value: unknown): value is FrozenAdvisoryConsumptionConfiguration {
  if (!isRecord(value) || !keysEqual(value, CONFIGURATION_KEYS)) return false;
  const config = value as Partial<FrozenAdvisoryConsumptionConfiguration>;
  const blockedMap = config.blocked_calibration_status_map;
  return config.adapter_schema_version === "confidence_calibration_advisory_result_v1" &&
    value.configuration_version === "confidence_calibration_advisory_config_v1" &&
    value.advisory_id_prefix === "confidence_calibration_advisory_v1:" &&
    value.confidence_scale_basis_points_per_point === 100 &&
    value.accepted_min_confidence_basis_points === 0 &&
    value.accepted_max_confidence_basis_points === 10000 &&
    value.output_decimal_precision === 2 &&
    value.deterministic_sorting_policy === "action_432_sort_v1" &&
    value.identity_policy === "action_432_identity_v1" &&
    value.issue_message_key_prefix === "confidence_calibration_advisory." &&
    Array.isArray(config.eligible_calibration_statuses) &&
    arrayEqual(config.eligible_calibration_statuses, ["calibrated", "calibrated_with_warnings", "no_adjustment"]) &&
    isRecord(blockedMap) &&
    Object.entries(BLOCKED_STATUS_TO_ADVISORY_STATUS).every(([source, target]) =>
      blockedMap[source as keyof typeof BLOCKED_STATUS_TO_ADVISORY_STATUS] === target) &&
    keysEqual(blockedMap, Object.keys(BLOCKED_STATUS_TO_ADVISORY_STATUS)) &&
    value.advisory_visibility_policy === "advisory_visible_for_eligible_statuses" &&
    value.application_policy === "never_apply_in_action_432" &&
    value.runtime_preview_status === "runtime_preview_waiting_for_operator_inputs";
}

function isRecommendationEnvelope(value: unknown): value is ImmutableRecommendationConfidenceEnvelope {
  if (!isRecord(value) || !keysEqual(value, RECOMMENDATION_KEYS)) return false;
  return (
    (typeof value.recommendation_id === "string" || value.recommendation_id === null) &&
    typeof value.recommendation_fingerprint === "string" &&
    typeof value.recommendation_snapshot_hash === "string" &&
    typeof value.original_confidence === "number" &&
    isDecisionBoundary(value.decision_boundary) &&
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

function isDecisionBoundary(value: unknown): value is ImmutableRecommendationConfidenceEnvelope["decision_boundary"] {
  return isRecord(value) &&
    keysEqual(value, ["anti_leakage_state", "boundary_id", "boundary_sha256", "evidence_cutoff_sha256"]) &&
    typeof value.boundary_id === "string" &&
    value.boundary_id.length > 0 &&
    typeof value.boundary_sha256 === "string" &&
    typeof value.evidence_cutoff_sha256 === "string" &&
    value.anti_leakage_state === "passed";
}

function isSource(value: unknown): value is ImmutableRecommendationConfidenceEnvelope["source"] {
  return isRecord(value) &&
    keysEqual(value, ["immutable", "source_kind", "source_version"]) &&
    value.source_kind === "recommendation_snapshot" &&
    typeof value.source_version === "string" &&
    value.source_version.length > 0 &&
    value.immutable === true;
}

function isRecommendationLineage(value: unknown): value is ImmutableRecommendationConfidenceEnvelope["lineage"] {
  return isRecord(value) &&
    keysEqual(value, [
      "pattern_discovery_result_hashes",
      "pattern_insight_hashes",
      "pattern_insight_ids",
      "recommendation_source_hash",
      "source_scenario_ids",
      "source_snapshot_ids",
    ]) &&
    typeof value.recommendation_source_hash === "string" &&
    isStringArray(value.pattern_discovery_result_hashes) &&
    isStringArray(value.pattern_insight_ids) &&
    isStringArray(value.pattern_insight_hashes) &&
    isStringArray(value.source_scenario_ids) &&
    isStringArray(value.source_snapshot_ids);
}

function isFalseCommandSet(value: unknown): value is ImmutableRecommendationConfidenceEnvelope["commands"] {
  return isRecord(value) &&
    keysEqual(value, ["execution", "feedback", "mutation", "persistence", "publication", "ranking", "scanner"]) &&
    Object.values(value).every((item) => item === false);
}

function isAntiFeedback(value: unknown): value is ImmutableRecommendationConfidenceEnvelope["anti_feedback"] {
  return isRecord(value) &&
    keysEqual(value, [
      "calibration_output_reused_as_calibration_input_evidence",
      "calibration_output_reused_as_context",
      "calibration_output_reused_as_execution_signal",
      "calibration_output_reused_as_learning_dataset_input",
      "calibration_output_reused_as_outcome",
      "calibration_output_reused_as_pattern_discovery_evidence",
      "calibration_output_reused_as_publication_signal",
      "calibration_output_reused_as_ranking_signal",
      "calibration_output_reused_as_recommendation_base_confidence",
      "calibration_output_reused_as_scanner_signal",
      "circular_calibration_lineage",
      "self_referential_recommendation_lineage",
    ]) &&
    Object.values(value).every((item) => typeof item === "boolean");
}

function isAntiLeakage(value: unknown): value is ImmutableRecommendationConfidenceEnvelope["anti_leakage"] {
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

function hasValidRecommendationIdentity(value: ImmutableRecommendationConfidenceEnvelope): boolean {
  return value.recommendation_fingerprint.length > 0 &&
    HASH_PATTERN.test(value.recommendation_snapshot_hash) &&
    (value.recommendation_id === null || value.recommendation_id.length > 0) &&
    HASH_PATTERN.test(value.decision_boundary.boundary_sha256) &&
    HASH_PATTERN.test(value.decision_boundary.evidence_cutoff_sha256);
}

function hasValidRecommendationLineage(value: ImmutableRecommendationConfidenceEnvelope): boolean {
  return HASH_PATTERN.test(value.lineage.recommendation_source_hash) &&
    value.lineage.pattern_discovery_result_hashes.length > 0 &&
    value.lineage.pattern_insight_ids.length > 0 &&
    value.lineage.pattern_insight_hashes.length > 0 &&
    value.lineage.source_scenario_ids.length > 0 &&
    value.lineage.source_snapshot_ids.length > 0 &&
    value.lineage.pattern_discovery_result_hashes.every((hash) => HASH_PATTERN.test(hash)) &&
    value.lineage.pattern_insight_hashes.every((hash) => HASH_PATTERN.test(hash));
}

function isValidConfidence(value: unknown, configuration: FrozenAdvisoryConsumptionConfiguration): value is number {
  if (typeof value !== "number" || !Number.isFinite(value)) return false;
  const basisPoints = value * configuration.confidence_scale_basis_points_per_point;
  return value >= 0 &&
    basisPoints >= configuration.accepted_min_confidence_basis_points &&
    basisPoints <= configuration.accepted_max_confidence_basis_points &&
    Math.abs(basisPoints - Math.round(basisPoints)) <= 1e-9;
}

function isCalibrationResult(value: unknown): value is ConfidenceCalibrationResult {
  if (!isRecord(value) || !keysEqual(value, CALIBRATION_KEYS)) return false;
  return typeof value.status === "string" &&
    (typeof value.calibration_id === "string" || value.calibration_id === null) &&
    (typeof value.calibration_hash === "string" || value.calibration_hash === null) &&
    (typeof value.original_confidence === "number" || value.original_confidence === null) &&
    (typeof value.proposed_delta === "number" || value.proposed_delta === null) &&
    (typeof value.proposed_calibrated_confidence === "number" || value.proposed_calibrated_confidence === null) &&
    isStringArray(value.included_insight_ids) &&
    Array.isArray(value.excluded_insight_ids) &&
    isRecord(value.evidence_summary) &&
    isRecord(value.overlap_summary) &&
    Array.isArray(value.adjustments) &&
    Array.isArray(value.warnings) &&
    Array.isArray(value.issues) &&
    Array.isArray(value.lineage_hashes) &&
    value.non_authoritative === true &&
    value.applied === false;
}

function hasValidEligibleCalibrationNumbers(
  value: ConfidenceCalibrationResult,
  configuration: FrozenAdvisoryConsumptionConfiguration,
): boolean {
  return isValidConfidence(value.original_confidence, configuration) &&
    typeof value.proposed_delta === "number" &&
    Number.isFinite(value.proposed_delta) &&
    Math.abs(value.proposed_delta * configuration.confidence_scale_basis_points_per_point - Math.round(value.proposed_delta * configuration.confidence_scale_basis_points_per_point)) <= 1e-9 &&
    isValidConfidence(value.proposed_calibrated_confidence, configuration);
}

function hasValidCalibrationIdentity(value: ConfidenceCalibrationResult): boolean {
  return typeof value.calibration_id === "string" &&
    CALIBRATION_ID_PATTERN.test(value.calibration_id) &&
    typeof value.calibration_hash === "string" &&
    HASH_PATTERN.test(value.calibration_hash);
}

function hasValidCalibrationSemanticHash(
  value: ConfidenceCalibrationResult,
  configuration: FrozenAdvisoryConsumptionConfiguration,
): boolean {
  if (typeof value.calibration_hash !== "string") return false;
  try {
    const legacyHash = sha256(buildCalibrationSemanticHashPayload(value, configuration));
    const completeHash = sha256(buildCompleteCalibrationSemanticHashPayload(value, configuration));
    const legacyHashMatches = value.calibration_hash === legacyHash;
    const completeHashMatches = value.calibration_hash === completeHash;
    if (!legacyHashMatches && !completeHashMatches) return false;
    if (!hasConsistentCalibrationSemanticPayload(value, configuration)) return false;
    return completeHashMatches || hasLegacyCompatibleSemanticBinding(value, legacyHash);
  } catch {
    return false;
  }
}

function buildCalibrationSemanticHashPayload(
  value: ConfidenceCalibrationResult,
  configuration: FrozenAdvisoryConsumptionConfiguration,
): Readonly<{
  schema_marker: "confidence_calibration_result_v1";
  status: ConfidenceCalibrationResult["status"];
  configuration_version: string | null;
  base_confidence_basis_points: number | null;
  included_insight_ids: readonly string[];
  included_insight_hashes: readonly string[];
  excluded_insight_ids: ConfidenceCalibrationResult["excluded_insight_ids"];
  overlap_resolution_summary: Readonly<{
    deduplicated_count: unknown;
    overlapping_excluded_count: unknown;
    conflict_count: unknown;
  }>;
  proposed_delta_basis_points: number | null;
  proposed_calibrated_confidence_basis_points: number | null;
}> {
  return {
    schema_marker: "confidence_calibration_result_v1",
    status: value.status,
    configuration_version: inferCalibrationConfigurationVersion(value),
    base_confidence_basis_points: confidenceToBasisPointsOrNull(value.original_confidence, configuration),
    included_insight_ids: orderText(value.included_insight_ids),
    included_insight_hashes: orderText(value.lineage_hashes.map((item) => item.insight_sha256)),
    excluded_insight_ids: orderExcludedInsights(value.excluded_insight_ids),
    overlap_resolution_summary: {
      deduplicated_count: value.overlap_summary.deduplicated_count,
      overlapping_excluded_count: value.overlap_summary.overlapping_excluded_count,
      conflict_count: value.overlap_summary.conflict_count,
    },
    proposed_delta_basis_points: confidenceToBasisPointsOrNull(value.proposed_delta, configuration),
    proposed_calibrated_confidence_basis_points: confidenceToBasisPointsOrNull(value.proposed_calibrated_confidence, configuration),
  };
}

function buildCompleteCalibrationSemanticHashPayload(
  value: ConfidenceCalibrationResult,
  configuration: FrozenAdvisoryConsumptionConfiguration,
): Readonly<{
  schema_marker: "confidence_calibration_result_v1";
  result_hash_schema_marker: "confidence_calibration_complete_semantic_result_v1";
  status: ConfidenceCalibrationResult["status"];
  calibration_id: string | null;
  configuration_version: string | null;
  base_confidence_basis_points: number | null;
  proposed_delta_basis_points: number | null;
  proposed_calibrated_confidence_basis_points: number | null;
  included_insight_ids: readonly string[];
  excluded_insight_ids: ConfidenceCalibrationResult["excluded_insight_ids"];
  evidence_summary: ConfidenceCalibrationResult["evidence_summary"];
  overlap_summary: ConfidenceCalibrationResult["overlap_summary"];
  adjustments: readonly ConfidenceCalibrationAdjustmentHashRecord[];
  warnings: readonly CalibrationWarningHashRecord[];
  issues: readonly CalibrationIssueHashRecord[];
  lineage_hashes: readonly CalibrationLineageHashRecord[];
  non_authoritative: true;
  applied: false;
}> {
  return {
    schema_marker: "confidence_calibration_result_v1",
    result_hash_schema_marker: "confidence_calibration_complete_semantic_result_v1",
    status: value.status,
    calibration_id: value.calibration_id,
    configuration_version: inferCalibrationConfigurationVersion(value),
    base_confidence_basis_points: confidenceToBasisPointsOrNull(value.original_confidence, configuration),
    proposed_delta_basis_points: confidenceToBasisPointsOrNull(value.proposed_delta, configuration),
    proposed_calibrated_confidence_basis_points: confidenceToBasisPointsOrNull(value.proposed_calibrated_confidence, configuration),
    included_insight_ids: orderText(value.included_insight_ids),
    excluded_insight_ids: orderExcludedInsights(value.excluded_insight_ids),
    evidence_summary: orderEvidenceSummary(value.evidence_summary),
    overlap_summary: orderOverlapSummary(value.overlap_summary),
    adjustments: orderAdjustments(value.adjustments),
    warnings: orderCalibrationWarnings(value.warnings),
    issues: orderCalibrationIssues(value.issues),
    lineage_hashes: orderCalibrationLineage(value.lineage_hashes),
    non_authoritative: value.non_authoritative,
    applied: value.applied,
  };
}

function inferCalibrationConfigurationVersion(value: ConfidenceCalibrationResult): string | null {
  return value.lineage_hashes.length > 0 ? "pattern_discovery_config_v1" : null;
}

function confidenceToBasisPointsOrNull(
  value: number | null,
  configuration: FrozenAdvisoryConsumptionConfiguration,
): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const basisPoints = value * configuration.confidence_scale_basis_points_per_point;
  if (Math.abs(basisPoints - Math.round(basisPoints)) > 1e-9) return null;
  return Object.is(Math.round(basisPoints), -0) ? 0 : Math.round(basisPoints);
}

function hasConsistentCalibrationSemanticPayload(
  value: ConfidenceCalibrationResult,
  configuration: FrozenAdvisoryConsumptionConfiguration,
): boolean {
  return hasValidCalibrationSummaryShape(value) &&
    hasConsistentEvidenceSummary(value, configuration) &&
    hasConsistentAdjustmentInventory(value, configuration) &&
    hasConsistentEligibleIssueInventory(value) &&
    hasCompatibleWarningsAndIssues(value) &&
    hasConsistentLineageInventory(value);
}

function hasLegacyCompatibleSemanticBinding(value: ConfidenceCalibrationResult, legacyHash: string): boolean {
  return value.calibration_id === `confidence_calibration_v1:${legacyHash.slice(0, 24)}` &&
    hasConsistentWarningInventory(value);
}

function hasValidCalibrationSummaryShape(value: ConfidenceCalibrationResult): boolean {
  return isIntegerRecord(value.evidence_summary, [
    "excluded_count",
    "final_delta_basis_points",
    "included_count",
    "negative_delta_basis_points",
    "positive_delta_basis_points",
    "warning_count",
  ]) &&
    isIntegerRecord(value.overlap_summary, [
      "conflict_count",
      "deduplicated_count",
      "overlapping_excluded_count",
    ]);
}

function hasConsistentEvidenceSummary(
  value: ConfidenceCalibrationResult,
  configuration: FrozenAdvisoryConsumptionConfiguration,
): boolean {
  const positive = value.adjustments
    .filter((item) => item.adjusted_delta_basis_points > 0)
    .reduce((sum, item) => sum + item.adjusted_delta_basis_points, 0);
  const negative = value.adjustments
    .filter((item) => item.adjusted_delta_basis_points < 0)
    .reduce((sum, item) => sum + item.adjusted_delta_basis_points, 0);
  return value.evidence_summary.included_count === value.included_insight_ids.length &&
    value.evidence_summary.excluded_count === value.excluded_insight_ids.length &&
    value.evidence_summary.warning_count === value.warnings.length &&
    value.evidence_summary.positive_delta_basis_points === positive &&
    value.evidence_summary.negative_delta_basis_points === negative &&
    value.evidence_summary.final_delta_basis_points === confidenceToBasisPointsOrNull(value.proposed_delta, configuration);
}

function hasConsistentAdjustmentInventory(
  value: ConfidenceCalibrationResult,
  configuration: FrozenAdvisoryConsumptionConfiguration,
): boolean {
  const includedIds = new Set(value.included_insight_ids);
  return value.adjustments.every((item) =>
      isRecord(item) &&
      typeof item.insight_id === "string" &&
      includedIds.has(item.insight_id) &&
      Number.isInteger(item.base_delta_basis_points) &&
      Number.isInteger(item.adjusted_delta_basis_points) &&
      typeof item.evidence_quality === "string" &&
      item.evidence_quality.length > 0 &&
      isStringArray(item.warning_codes)) &&
    confidenceToBasisPointsOrNull(value.proposed_delta, configuration) !== null &&
    confidenceToBasisPointsOrNull(value.proposed_calibrated_confidence, configuration) !== null &&
    confidenceToBasisPointsOrNull(value.original_confidence, configuration) !== null;
}

function hasConsistentEligibleIssueInventory(value: ConfidenceCalibrationResult): boolean {
  return value.status in ELIGIBLE_STATUS_TO_ADVISORY_STATUS
    ? value.issues.length === 0
    : true;
}

function hasConsistentWarningInventory(value: ConfidenceCalibrationResult): boolean {
  const reducingCodesFromAdjustments = new Map<string, number>();
  for (const adjustment of value.adjustments) {
    for (const code of new Set(adjustment.warning_codes)) {
      if (code === "duplicate_mapper_row_identity" || code === "metric_value_unavailable") {
        reducingCodesFromAdjustments.set(code, (reducingCodesFromAdjustments.get(code) ?? 0) + 1);
      }
    }
  }
  const reducingCodesFromWarnings = new Map<string, number>();
  const insightWarningLimit = Math.max(value.adjustments.length + value.excluded_insight_ids.length, value.warnings.length);
  for (const warning of value.warnings) {
    if (warning.code === "duplicate_mapper_row_identity" || warning.code === "metric_value_unavailable") {
      reducingCodesFromWarnings.set(warning.code, (reducingCodesFromWarnings.get(warning.code) ?? 0) + 1);
      if (!isBoundedInsightWarningPath(warning.path, insightWarningLimit)) return false;
      continue;
    }
    if (warning.code === "confidence_clamped_to_bounds") {
      if (warning.path !== "/proposed_calibrated_confidence") return false;
      continue;
    }
    if (warning.code === "duplicate_insight_deduped" || warning.code === "overlapping_insight_excluded") {
      if (!isBoundedInsightWarningPath(warning.path, insightWarningLimit)) return false;
      continue;
    }
    if (warning.code === "insight_excluded") {
      if (!isBoundedInsightWarningPath(warning.path, insightWarningLimit)) return false;
      continue;
    }
    return false;
  }
  return mapsEqual(reducingCodesFromAdjustments, reducingCodesFromWarnings);
}

function isBoundedInsightWarningPath(path: string, limit: number): boolean {
  const match = path.match(/^\/insights\/(\d+)(?:\/warning_codes)?$/);
  if (!match) return false;
  const index = Number(match[1]);
  return Number.isInteger(index) && index >= 0 && index < limit;
}

function mapsEqual(left: ReadonlyMap<string, number>, right: ReadonlyMap<string, number>): boolean {
  if (left.size !== right.size) return false;
  for (const [key, value] of left) {
    if (right.get(key) !== value) return false;
  }
  return true;
}

function hasConsistentLineageInventory(value: ConfidenceCalibrationResult): boolean {
  const includedIds = new Set(value.included_insight_ids);
  if (includedIds.size !== value.included_insight_ids.length) return false;
  if (value.lineage_hashes.length !== value.included_insight_ids.length) return false;
  return value.lineage_hashes.every((item) =>
    isRecord(item) &&
    HASH_PATTERN.test(item.pattern_discovery_sha256) &&
    HASH_PATTERN.test(item.pattern_discovery_result_sha256) &&
    HASH_PATTERN.test(item.evidence_set_sha256) &&
    HASH_PATTERN.test(item.group_sha256) &&
    HASH_PATTERN.test(item.insight_sha256));
}

function isIntegerRecord(value: unknown, keys: readonly string[]): boolean {
  return isRecord(value) &&
    keys.every((key) => Number.isInteger(value[key]));
}

function orderExcludedInsights(
  values: ConfidenceCalibrationResult["excluded_insight_ids"],
): ConfidenceCalibrationResult["excluded_insight_ids"] {
  return freeze([...values].sort((left, right) =>
    compareText(left.insight_id, right.insight_id) ||
    compareText(left.reason, right.reason)));
}

function hasMatchingPatternLineage(
  recommendation: ImmutableRecommendationConfidenceEnvelope,
  calibration: ConfidenceCalibrationResult,
): boolean {
  if (calibration.lineage_hashes.length === 0) return false;
  const calibrationPatternDiscoveryHashes = orderText(calibration.lineage_hashes.map((item) => item.pattern_discovery_result_sha256));
  const recommendationPatternDiscoveryHashes = orderText(recommendation.lineage.pattern_discovery_result_hashes);
  const calibrationInsightHashes = orderText(calibration.lineage_hashes.map((item) => item.insight_sha256));
  const recommendationInsightHashes = orderText(recommendation.lineage.pattern_insight_hashes);
  return arrayEqual(calibrationPatternDiscoveryHashes, recommendationPatternDiscoveryHashes) &&
    arrayEqual(calibrationInsightHashes, recommendationInsightHashes);
}

function hasPassedAntiLeakage(recommendation: ImmutableRecommendationConfidenceEnvelope): boolean {
  return recommendation.anti_leakage.status === "passed" &&
    recommendation.decision_boundary.anti_leakage_state === "passed" &&
    Object.entries(recommendation.anti_leakage).every(([key, value]) => key === "status" ? value === "passed" : value === false);
}

function hasPassedAntiFeedback(
  recommendation: ImmutableRecommendationConfidenceEnvelope,
  calibration: ConfidenceCalibrationResult,
): boolean {
  if (!Object.values(recommendation.anti_feedback).every((value) => value === false)) return false;
  if (!calibration.calibration_id) return true;
  const sources = [
    recommendation.recommendation_fingerprint,
    recommendation.recommendation_snapshot_hash,
    recommendation.lineage.recommendation_source_hash,
    ...recommendation.lineage.source_scenario_ids,
    ...recommendation.lineage.source_snapshot_ids,
    ...recommendation.lineage.pattern_insight_ids,
  ];
  return !sources.includes(calibration.calibration_id);
}

function hasCompatibleWarningsAndIssues(calibration: ConfidenceCalibrationResult): boolean {
  return calibration.warnings.every((item) =>
    isRecord(item) &&
    typeof item.code === "string" &&
    CALIBRATION_WARNING_CODES.has(item.code) &&
    typeof item.path === "string" &&
    RFC6901_PATTERN.test(item.path) &&
    item.severity === "warning" &&
    item.messageKey === `confidence_calibration.${item.code}`) &&
    calibration.issues.every((item) =>
      isRecord(item) &&
      typeof item.code === "string" &&
      CALIBRATION_ISSUE_CODES.has(item.code) &&
      typeof item.path === "string" &&
      RFC6901_PATTERN.test(item.path) &&
      item.severity === "error" &&
      item.messageKey === `confidence_calibration.${item.code}`);
}

type ConfidenceCalibrationAdjustmentHashRecord = Readonly<{
  insight_id: string;
  base_delta_basis_points: number;
  adjusted_delta_basis_points: number;
  evidence_quality: string;
  warning_codes: readonly string[];
}>;

type CalibrationWarningHashRecord = Readonly<{
  code: string;
  path: string;
  severity: "warning";
  messageKey: string;
}>;

type CalibrationIssueHashRecord = Readonly<{
  code: string;
  path: string;
  severity: "error";
  messageKey: string;
}>;

type CalibrationLineageHashRecord = Readonly<{
  pattern_discovery_sha256: string;
  pattern_discovery_result_sha256: string;
  evidence_set_sha256: string;
  group_sha256: string;
  insight_sha256: string;
}>;

function orderEvidenceSummary(
  value: ConfidenceCalibrationResult["evidence_summary"],
): ConfidenceCalibrationResult["evidence_summary"] {
  return {
    included_count: value.included_count,
    excluded_count: value.excluded_count,
    warning_count: value.warning_count,
    positive_delta_basis_points: value.positive_delta_basis_points,
    negative_delta_basis_points: value.negative_delta_basis_points,
    final_delta_basis_points: value.final_delta_basis_points,
  };
}

function orderOverlapSummary(
  value: ConfidenceCalibrationResult["overlap_summary"],
): ConfidenceCalibrationResult["overlap_summary"] {
  return {
    deduplicated_count: value.deduplicated_count,
    overlapping_excluded_count: value.overlapping_excluded_count,
    conflict_count: value.conflict_count,
  };
}

function orderAdjustments(
  values: ConfidenceCalibrationResult["adjustments"],
): readonly ConfidenceCalibrationAdjustmentHashRecord[] {
  return freeze(values
    .map((item) => ({
      insight_id: item.insight_id,
      base_delta_basis_points: item.base_delta_basis_points,
      adjusted_delta_basis_points: item.adjusted_delta_basis_points,
      evidence_quality: item.evidence_quality,
      warning_codes: orderText(item.warning_codes),
    }))
    .sort((left, right) =>
      compareText(left.insight_id, right.insight_id) ||
      compareText(left.evidence_quality, right.evidence_quality) ||
      left.base_delta_basis_points - right.base_delta_basis_points ||
      left.adjusted_delta_basis_points - right.adjusted_delta_basis_points ||
      compareText(left.warning_codes.join("\u0000"), right.warning_codes.join("\u0000"))));
}

function orderCalibrationWarnings(
  values: ConfidenceCalibrationResult["warnings"],
): readonly CalibrationWarningHashRecord[] {
  return freeze(orderWarnings(values.map((item) => ({
    code: item.code,
    path: item.path,
    severity: "warning",
    messageKey: item.messageKey,
  }))));
}

function orderCalibrationIssues(
  values: ConfidenceCalibrationResult["issues"],
): readonly CalibrationIssueHashRecord[] {
  return freeze(orderIssues(values.map((item) => ({
    code: item.code,
    path: item.path,
    severity: "error",
    messageKey: item.messageKey,
  }))));
}

function orderCalibrationLineage(
  values: ConfidenceCalibrationResult["lineage_hashes"],
): readonly CalibrationLineageHashRecord[] {
  return freeze(values
    .map((item) => ({
      pattern_discovery_sha256: item.pattern_discovery_sha256,
      pattern_discovery_result_sha256: item.pattern_discovery_result_sha256,
      evidence_set_sha256: item.evidence_set_sha256,
      group_sha256: item.group_sha256,
      insight_sha256: item.insight_sha256,
    }))
    .sort((left, right) =>
      compareText(left.pattern_discovery_sha256, right.pattern_discovery_sha256) ||
      compareText(left.pattern_discovery_result_sha256, right.pattern_discovery_result_sha256) ||
      compareText(left.evidence_set_sha256, right.evidence_set_sha256) ||
      compareText(left.group_sha256, right.group_sha256) ||
      compareText(left.insight_sha256, right.insight_sha256)));
}

function hasValidNoAdjustmentSemantics(calibration: ConfidenceCalibrationResult): boolean {
  return calibration.original_confidence === calibration.proposed_calibrated_confidence &&
    calibration.proposed_delta === 0 &&
    calibration.evidence_summary.final_delta_basis_points === 0;
}

function buildLineageHashes(
  recommendation: ImmutableRecommendationConfidenceEnvelope,
  calibration: ConfidenceCalibrationResult,
): NonNullable<ConfidenceCalibrationAdvisoryResult["lineage_hashes"]> {
  const calibrationIdentityHash = sha256({
    calibration_id: calibration.calibration_id,
    calibration_hash: calibration.calibration_hash,
  });
  return {
    recommendation_source_hash: recommendation.lineage.recommendation_source_hash,
    decision_boundary_sha256: recommendation.decision_boundary.boundary_sha256,
    pattern_discovery_result_hashes: orderText(recommendation.lineage.pattern_discovery_result_hashes),
    pattern_insight_hashes: orderText(recommendation.lineage.pattern_insight_hashes),
    calibration_identity_hash: calibrationIdentityHash,
    calibration_result_hash: calibration.calibration_hash ?? "",
    evidence_lineage_hash: sha256({
      pattern_discovery_result_hashes: orderText(recommendation.lineage.pattern_discovery_result_hashes),
      pattern_insight_ids: orderText(recommendation.lineage.pattern_insight_ids),
      pattern_insight_hashes: orderText(recommendation.lineage.pattern_insight_hashes),
      source_scenario_ids: orderText(recommendation.lineage.source_scenario_ids),
      source_snapshot_ids: orderText(recommendation.lineage.source_snapshot_ids),
    }),
  };
}

function mapCalibrationWarnings(calibration: ConfidenceCalibrationResult): AdvisoryWarning[] {
  return calibration.warnings.map((item) => ({
    code: item.code,
    path: item.path,
    severity: "warning",
    messageKey: `confidence_calibration_advisory.${item.code}`,
  }));
}

function mapCalibrationIssues(
  calibration: ConfidenceCalibrationResult,
  fallbackCode: string | null = null,
): AdvisoryIssue[] {
  if (calibration.issues.length === 0 && fallbackCode === null) return [];
  const source = calibration.issues.length > 0
    ? calibration.issues.map((item) => ({
        code: item.code,
        path: item.path,
        severity: "error" as const,
        messageKey: `confidence_calibration_advisory.${item.code}`,
      }))
    : [issue(fallbackCode ?? "blocked_calibration_result", "/calibration/status")];
  return source.map((item) =>
    ADVISORY_ISSUE_CODES.has(item.code)
      ? item
      : issue(fallbackCode ?? "blocked_calibration_result", item.path));
}

function issue(code: string, path: string): AdvisoryIssue {
  const safeCode = ADVISORY_ISSUE_CODES.has(code) ? code : "blocked_calibration_result";
  return {
    code: safeCode,
    path,
    severity: "error",
    messageKey: `confidence_calibration_advisory.${safeCode}`,
  };
}

function orderIssues(values: readonly AdvisoryIssue[]): readonly AdvisoryIssue[] {
  const unique = new Map<string, AdvisoryIssue>();
  for (const value of values) {
    unique.set(`${value.severity}\u0000${value.code}\u0000${value.path}\u0000${value.messageKey}`, value);
  }
  return freeze([...unique.values()].sort(
    (left, right) =>
      compareText(left.severity, right.severity) ||
      compareText(left.code, right.code) ||
      compareText(left.path, right.path) ||
      compareText(left.messageKey, right.messageKey),
  ));
}

function orderWarnings(values: readonly AdvisoryWarning[]): readonly AdvisoryWarning[] {
  const unique = new Map<string, AdvisoryWarning>();
  for (const value of values) {
    unique.set(`${value.severity}\u0000${value.code}\u0000${value.path}\u0000${value.messageKey}`, value);
  }
  return freeze([...unique.values()].sort(
    (left, right) =>
      compareText(left.severity, right.severity) ||
      compareText(left.code, right.code) ||
      compareText(left.path, right.path) ||
      compareText(left.messageKey, right.messageKey),
  ));
}

function toBasisPoints(value: number, configuration: FrozenAdvisoryConsumptionConfiguration): number {
  return Math.round(value * configuration.confidence_scale_basis_points_per_point);
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
