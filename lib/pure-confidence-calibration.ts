import { createHash } from "crypto";

export type ConfidenceCalibrationInsightEnvelope = Readonly<{
  pattern_discovery_sha256: string;
  pattern_discovery_configuration_version: string;
  pattern_discovery_result_sha256: string;
  evidence_set_sha256: string;
  group_sha256: string;
  insight_id: string;
  insight_sha256: string;
  source_scenario_ids: readonly string[];
  source_snapshot_ids: readonly string[];
  pattern_discovery_status:
    | "discovered"
    | "discovered_with_warnings"
    | "insufficient_evidence"
    | "blocked_invalid_input"
    | "blocked_invalid_configuration"
    | "blocked_invalid_lineage"
    | "blocked_future_leakage"
    | "blocked_non_consumable_row"
    | "blocked_nondeterministic_grouping";
  warning_codes: readonly string[];
  static_only: boolean;
  non_authoritative: boolean;
  no_persistence: boolean;
  no_replay: boolean;
  no_runtime: boolean;
  no_feedback: boolean;
  anti_leakage_status: "passed" | "failed" | "unknown" | "missing";
  insight: Readonly<{
    setup_family: string;
    horizon: string;
    evidence_direction:
      | "supportive_strong"
      | "supportive_moderate"
      | "supportive_weak"
      | "neutral"
      | "mixed"
      | "adverse_weak"
      | "adverse_moderate"
      | "adverse_strong";
    evidence_quality: "verified_high" | "verified_usable" | "verified_limited" | "blocked";
    total_support: number;
    unique_snapshot_support: number;
    completed_outcome_count: number;
  }> | null;
}>;

export type FrozenConfidenceCalibrationConfiguration = Readonly<{
  configuration_version: string;
  confidence_scale_basis_points_per_point: 100;
  accepted_min_confidence_basis_points: 0;
  accepted_max_confidence_basis_points: 10000;
  output_decimal_precision: 2;
  positive_per_insight_cap_basis_points: 200;
  negative_per_insight_cap_basis_points: -300;
  combined_positive_cap_basis_points: 400;
  combined_negative_cap_basis_points: -600;
  minimum_total_support: 20;
  minimum_unique_snapshot_support: 20;
  minimum_completed_outcomes: 20;
  accepted_setup_families: readonly string[];
  accepted_horizons: readonly string[];
  warning_classification_table: Readonly<{
    duplicate_mapper_row_identity: "calibration_reducing";
    metric_value_unavailable: "calibration_reducing";
    minimum_total_support_not_met: "calibration_blocking";
    minimum_completed_outcomes_not_met: "calibration_blocking";
  }>;
  warning_attenuation_table: Readonly<{
    duplicate_mapper_row_identity: Readonly<{ numerator: 1; denominator: 2 }>;
    metric_value_unavailable: Readonly<{ numerator: 1; denominator: 2 }>;
  }>;
  evidence_quality_table: Readonly<{
    verified_high: Readonly<{ numerator: 1; denominator: 1 }>;
    verified_usable: Readonly<{ numerator: 1; denominator: 2 }>;
    verified_limited: Readonly<{ numerator: 1; denominator: 4 }>;
    blocked: "blocked";
  }>;
  direction_delta_table: Readonly<{
    supportive_strong: 200;
    supportive_moderate: 100;
    supportive_weak: 50;
    neutral: 0;
    mixed: 0;
    adverse_weak: -100;
    adverse_moderate: -200;
    adverse_strong: -300;
  }>;
  overlap_resolution_policy: "action_419_overlap_v1";
  deterministic_sorting_policy: "action_419_sort_v1";
  rounding_mode: "round_half_away_from_zero";
  confidence_bound_policy: "clamp_valid_delta_to_bounds";
}>;

export type ConfidenceCalibrationIssue = Readonly<{
  code:
    | "invalid_input_shape"
    | "invalid_configuration_shape"
    | "invalid_base_confidence"
    | "invalid_insight_array"
    | "invalid_insight_envelope"
    | "ineligible_pattern_discovery_status"
    | "missing_insight"
    | "invalid_insight_structure"
    | "invalid_lineage"
    | "future_leakage"
    | "warning_status_contradiction"
    | "invalid_evidence_quality"
    | "unsupported_direction"
    | "overlapping_evidence_conflict"
    | "insufficient_eligible_evidence";
  path: string;
  severity: "error";
  messageKey: string;
}>;

export type ConfidenceCalibrationWarning = Readonly<{
  code:
    | "duplicate_mapper_row_identity"
    | "metric_value_unavailable"
    | "duplicate_insight_deduped"
    | "overlapping_insight_excluded"
    | "insight_excluded"
    | "confidence_clamped_to_bounds";
  path: string;
  severity: "warning";
  messageKey: string;
}>;

export type ConfidenceCalibrationEvidenceSummary = Readonly<{
  included_count: number;
  excluded_count: number;
  warning_count: number;
  positive_delta_basis_points: number;
  negative_delta_basis_points: number;
  final_delta_basis_points: number;
}>;

export type ConfidenceCalibrationAdjustment = Readonly<{
  insight_id: string;
  base_delta_basis_points: number;
  adjusted_delta_basis_points: number;
  evidence_quality: string;
  warning_codes: readonly string[];
}>;

export type ConfidenceCalibrationResult = Readonly<{
  status:
    | "calibrated"
    | "calibrated_with_warnings"
    | "no_adjustment"
    | "insufficient_eligible_evidence"
    | "blocked_invalid_input"
    | "blocked_invalid_configuration"
    | "blocked_invalid_lineage"
    | "blocked_future_leakage"
    | "blocked_overlapping_evidence"
    | "blocked_unsupported_insight";
  calibration_id: string | null;
  calibration_hash: string | null;
  original_confidence: number | null;
  proposed_delta: number | null;
  proposed_calibrated_confidence: number | null;
  included_insight_ids: readonly string[];
  excluded_insight_ids: readonly Readonly<{ insight_id: string; reason: string }>[];
  evidence_summary: ConfidenceCalibrationEvidenceSummary;
  overlap_summary: Readonly<{
    deduplicated_count: number;
    overlapping_excluded_count: number;
    conflict_count: number;
  }>;
  adjustments: readonly ConfidenceCalibrationAdjustment[];
  warnings: readonly ConfidenceCalibrationWarning[];
  issues: readonly ConfidenceCalibrationIssue[];
  lineage_hashes: readonly Readonly<{
    pattern_discovery_sha256: string;
    pattern_discovery_result_sha256: string;
    evidence_set_sha256: string;
    group_sha256: string;
    insight_sha256: string;
  }>[];
  non_authoritative: true;
  applied: false;
}>;

type UnknownRecord = Record<string, unknown>;
type ResultStatus = ConfidenceCalibrationResult["status"];
type IssueCode = ConfidenceCalibrationIssue["code"];
type WarningCode = ConfidenceCalibrationWarning["code"];
type Candidate = Readonly<{
  envelope: ConfidenceCalibrationInsightEnvelope;
  path: string;
  sort_key: string;
  dedupe_key: string;
  overlap_key: string;
  evidence_set_key: string;
  source_ids: readonly string[];
  direction_sign: -1 | 0 | 1;
}>;

const HASH_PATTERN = /^[a-f0-9]{64}$/;
const TOP_LEVEL_KEYS = ["baseConfidence", "configuration", "insights"] as const;
const CONFIGURATION_KEYS = [
  "accepted_horizons",
  "accepted_max_confidence_basis_points",
  "accepted_min_confidence_basis_points",
  "accepted_setup_families",
  "combined_negative_cap_basis_points",
  "combined_positive_cap_basis_points",
  "confidence_bound_policy",
  "confidence_scale_basis_points_per_point",
  "configuration_version",
  "deterministic_sorting_policy",
  "direction_delta_table",
  "evidence_quality_table",
  "minimum_completed_outcomes",
  "minimum_total_support",
  "minimum_unique_snapshot_support",
  "negative_per_insight_cap_basis_points",
  "output_decimal_precision",
  "overlap_resolution_policy",
  "positive_per_insight_cap_basis_points",
  "rounding_mode",
  "warning_attenuation_table",
  "warning_classification_table",
] as const;
const ENVELOPE_KEYS = [
  "anti_leakage_status",
  "evidence_set_sha256",
  "group_sha256",
  "insight",
  "insight_id",
  "insight_sha256",
  "no_feedback",
  "no_persistence",
  "no_replay",
  "no_runtime",
  "non_authoritative",
  "pattern_discovery_configuration_version",
  "pattern_discovery_result_sha256",
  "pattern_discovery_sha256",
  "pattern_discovery_status",
  "source_scenario_ids",
  "source_snapshot_ids",
  "static_only",
  "warning_codes",
] as const;
const INSIGHT_KEYS = [
  "completed_outcome_count",
  "evidence_direction",
  "evidence_quality",
  "horizon",
  "setup_family",
  "total_support",
  "unique_snapshot_support",
] as const;
const ELIGIBLE_STATUSES = new Set(["discovered", "discovered_with_warnings"]);
const BLOCKING_WARNING_CODES = new Set([
  "minimum_total_support_not_met",
  "minimum_completed_outcomes_not_met",
]);
const REDUCING_WARNING_CODES = new Set([
  "duplicate_mapper_row_identity",
  "metric_value_unavailable",
]);

export function calibrateConfidence(input: Readonly<{
  baseConfidence: number;
  insights: readonly ConfidenceCalibrationInsightEnvelope[];
  configuration: FrozenConfidenceCalibrationConfiguration;
}>): ConfidenceCalibrationResult {
  if (!isRecord(input) || !keysEqual(input, TOP_LEVEL_KEYS)) {
    return blocked("blocked_invalid_input", [issue("invalid_input_shape", "")]);
  }

  const configuration = input.configuration;
  const configurationIssue = validateConfiguration(configuration);
  if (configurationIssue) {
    return blocked("blocked_invalid_configuration", [configurationIssue]);
  }

  const baseConfidence = input.baseConfidence;
  const baseIssue = validateBaseConfidence(baseConfidence);
  if (baseIssue) {
    return blocked("blocked_invalid_input", [baseIssue]);
  }
  const baseConfidenceBasisPoints = Math.round(baseConfidence * configuration.confidence_scale_basis_points_per_point);

  if (!Array.isArray(input.insights)) {
    return blocked("blocked_invalid_input", [issue("invalid_insight_array", "/insights")], baseConfidence);
  }

  const issues: ConfidenceCalibrationIssue[] = [];
  const warnings: ConfidenceCalibrationWarning[] = [];
  const excluded: { insight_id: string; reason: string }[] = [];
  const candidates: Candidate[] = [];

  for (let index = 0; index < input.insights.length; index += 1) {
    const envelope = input.insights[index];
    const path = `/insights/${index}`;
    if (!isEnvelope(envelope)) {
      issues.push(issue("invalid_insight_envelope", path));
      continue;
    }
    if (!ELIGIBLE_STATUSES.has(envelope.pattern_discovery_status)) {
      issues.push(issue("ineligible_pattern_discovery_status", `${path}/pattern_discovery_status`));
      continue;
    }
    if (envelope.insight === null) {
      issues.push(issue("missing_insight", `${path}/insight`));
      continue;
    }
    if (!isInsight(envelope.insight)) {
      issues.push(issue("invalid_insight_structure", `${path}/insight`));
      continue;
    }
    if (!hasValidLineage(envelope)) {
      issues.push(issue("invalid_lineage", path));
      continue;
    }
    if (
      envelope.static_only !== true ||
      envelope.non_authoritative !== true ||
      envelope.no_persistence !== true ||
      envelope.no_replay !== true ||
      envelope.no_runtime !== true ||
      envelope.no_feedback !== true
    ) {
      issues.push(issue("invalid_lineage", path));
      continue;
    }
    if (envelope.anti_leakage_status !== "passed") {
      issues.push(issue("future_leakage", `${path}/anti_leakage_status`));
      continue;
    }
    const warningIssue = validateWarnings(envelope.warning_codes, path);
    if (warningIssue) {
      issues.push(warningIssue);
      continue;
    }
    if (envelope.insight.evidence_quality === "blocked") {
      issues.push(issue("invalid_evidence_quality", `${path}/insight/evidence_quality`));
      continue;
    }
    if (!(envelope.insight.evidence_quality in configuration.evidence_quality_table)) {
      issues.push(issue("invalid_evidence_quality", `${path}/insight/evidence_quality`));
      continue;
    }
    if (!(envelope.insight.evidence_direction in configuration.direction_delta_table)) {
      issues.push(issue("unsupported_direction", `${path}/insight/evidence_direction`));
      continue;
    }
    if (
      !configuration.accepted_setup_families.includes(envelope.insight.setup_family) ||
      !configuration.accepted_horizons.includes(envelope.insight.horizon)
    ) {
      issues.push(issue("unsupported_direction", `${path}/insight`));
      continue;
    }
    const supportReason = supportExclusion(envelope, configuration);
    if (supportReason) {
      excluded.push({ insight_id: insightLabel(envelope, index), reason: supportReason });
      continue;
    }
    candidates.push(candidate(envelope, path));
  }

  if (issues.length > 0) {
    return blocked(primaryStatus(issues), issues, baseConfidence, warnings, excluded);
  }

  const sorted = [...candidates].sort((left, right) => compareText(left.sort_key, right.sort_key));
  const deduped: Candidate[] = [];
  const seenDedupe = new Map<string, Candidate>();
  let deduplicatedCount = 0;
  for (const item of sorted) {
    const existing = seenDedupe.get(item.dedupe_key);
    if (!existing) {
      seenDedupe.set(item.dedupe_key, item);
      deduped.push(item);
      continue;
    }
    deduplicatedCount += 1;
    excluded.push({ insight_id: item.envelope.insight_id, reason: "duplicate_insight_deduped" });
    warnings.push(warning("duplicate_insight_deduped", item.path));
  }

  const byInsightId = new Map<string, string>();
  for (const item of deduped) {
    const previousHash = byInsightId.get(item.envelope.insight_id);
    if (previousHash && previousHash !== item.envelope.insight_sha256) {
      return blocked("blocked_invalid_lineage", [issue("invalid_lineage", `${item.path}/insight_id`)], baseConfidence, warnings, excluded);
    }
    byInsightId.set(item.envelope.insight_id, item.envelope.insight_sha256);
  }

  const selected: Candidate[] = [];
  let overlappingExcludedCount = 0;
  let conflictCount = 0;
  for (const item of deduped) {
    const conflict = selected.find((kept) => overlaps(kept, item) && kept.direction_sign * item.direction_sign < 0);
    if (conflict) {
      conflictCount += 1;
      return blocked(
        "blocked_overlapping_evidence",
        [issue("overlapping_evidence_conflict", item.path), issue("overlapping_evidence_conflict", conflict.path)],
        baseConfidence,
        warnings,
        excluded,
        { deduplicatedCount, overlappingExcludedCount, conflictCount },
      );
    }
    if (selected.some((kept) => overlaps(kept, item))) {
      overlappingExcludedCount += 1;
      excluded.push({ insight_id: item.envelope.insight_id, reason: "overlapping_insight_excluded" });
      warnings.push(warning("overlapping_insight_excluded", item.path));
      continue;
    }
    selected.push(item);
  }

  if (selected.length === 0) {
    return buildResult({
      status: "insufficient_eligible_evidence",
      baseConfidence,
      baseConfidenceBasisPoints,
      deltaBasisPoints: 0,
      calibratedBasisPoints: baseConfidenceBasisPoints,
      selected: [],
      excluded,
      warnings,
      issues: [issue("insufficient_eligible_evidence", "/insights")],
      adjustments: [],
      overlap: { deduplicatedCount, overlappingExcludedCount, conflictCount },
    });
  }

  const adjustments = selected.map((item) => calculateAdjustment(item, configuration, warnings));
  const rawDelta = adjustments.reduce((sum, item) => sum + item.adjusted_delta_basis_points, 0);
  const cappedDelta = clamp(
    rawDelta,
    configuration.combined_negative_cap_basis_points,
    configuration.combined_positive_cap_basis_points,
  );
  const unclampedConfidence = baseConfidenceBasisPoints + cappedDelta;
  const calibratedBasisPoints = clamp(
    unclampedConfidence,
    configuration.accepted_min_confidence_basis_points,
    configuration.accepted_max_confidence_basis_points,
  );
  if (calibratedBasisPoints !== unclampedConfidence) {
    warnings.push(warning("confidence_clamped_to_bounds", "/proposed_calibrated_confidence"));
  }
  const status = cappedDelta === 0 ? "no_adjustment" : warnings.length > 0 ? "calibrated_with_warnings" : "calibrated";

  return buildResult({
    status,
    baseConfidence,
    baseConfidenceBasisPoints,
    deltaBasisPoints: cappedDelta,
    calibratedBasisPoints,
    selected,
    excluded,
    warnings,
    issues: [],
    adjustments,
    overlap: { deduplicatedCount, overlappingExcludedCount, conflictCount },
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

function issue(code: IssueCode, path: string): ConfidenceCalibrationIssue {
  return { code, path, severity: "error", messageKey: `confidence_calibration.${code}` };
}

function warning(code: WarningCode, path: string): ConfidenceCalibrationWarning {
  return { code, path, severity: "warning", messageKey: `confidence_calibration.${code}` };
}

function validateConfiguration(value: unknown): ConfidenceCalibrationIssue | null {
  if (!isRecord(value) || !keysEqual(value, CONFIGURATION_KEYS)) {
    return issue("invalid_configuration_shape", "/configuration");
  }
  const config = value as Partial<FrozenConfidenceCalibrationConfiguration>;
  if (
    typeof config.configuration_version !== "string" ||
    config.configuration_version.length === 0 ||
    config.confidence_scale_basis_points_per_point !== 100 ||
    config.accepted_min_confidence_basis_points !== 0 ||
    config.accepted_max_confidence_basis_points !== 10000 ||
    config.output_decimal_precision !== 2 ||
    config.positive_per_insight_cap_basis_points !== 200 ||
    config.negative_per_insight_cap_basis_points !== -300 ||
    config.combined_positive_cap_basis_points !== 400 ||
    config.combined_negative_cap_basis_points !== -600 ||
    config.minimum_total_support !== 20 ||
    config.minimum_unique_snapshot_support !== 20 ||
    config.minimum_completed_outcomes !== 20 ||
    config.overlap_resolution_policy !== "action_419_overlap_v1" ||
    config.deterministic_sorting_policy !== "action_419_sort_v1" ||
    config.rounding_mode !== "round_half_away_from_zero" ||
    config.confidence_bound_policy !== "clamp_valid_delta_to_bounds" ||
    !isStringArray(config.accepted_setup_families) ||
    !isStringArray(config.accepted_horizons) ||
    !validWarningClassification(config.warning_classification_table) ||
    !validWarningAttenuation(config.warning_attenuation_table) ||
    !validQualityTable(config.evidence_quality_table) ||
    !validDeltaTable(config.direction_delta_table)
  ) {
    return issue("invalid_configuration_shape", "/configuration");
  }
  return null;
}

function validateBaseConfidence(value: unknown): ConfidenceCalibrationIssue | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 100) {
    return issue("invalid_base_confidence", "/baseConfidence");
  }
  const scaled = value * 100;
  return Math.abs(scaled - Math.round(scaled)) <= 1e-9
    ? null
    : issue("invalid_base_confidence", "/baseConfidence");
}

function isEnvelope(value: unknown): value is ConfidenceCalibrationInsightEnvelope {
  if (!isRecord(value) || !keysEqual(value, ENVELOPE_KEYS)) return false;
  const envelope = value as Partial<ConfidenceCalibrationInsightEnvelope>;
  return (
    typeof envelope.pattern_discovery_sha256 === "string" &&
    typeof envelope.pattern_discovery_configuration_version === "string" &&
    typeof envelope.pattern_discovery_result_sha256 === "string" &&
    typeof envelope.evidence_set_sha256 === "string" &&
    typeof envelope.group_sha256 === "string" &&
    typeof envelope.insight_id === "string" &&
    typeof envelope.insight_sha256 === "string" &&
    isStringArray(envelope.source_scenario_ids) &&
    isStringArray(envelope.source_snapshot_ids) &&
    typeof envelope.pattern_discovery_status === "string" &&
    isStringArray(envelope.warning_codes) &&
    typeof envelope.static_only === "boolean" &&
    typeof envelope.non_authoritative === "boolean" &&
    typeof envelope.no_persistence === "boolean" &&
    typeof envelope.no_replay === "boolean" &&
    typeof envelope.no_runtime === "boolean" &&
    typeof envelope.no_feedback === "boolean" &&
    typeof envelope.anti_leakage_status === "string" &&
    (envelope.insight === null || isRecord(envelope.insight))
  );
}

function isInsight(value: unknown): value is NonNullable<ConfidenceCalibrationInsightEnvelope["insight"]> {
  if (!isRecord(value) || !keysEqual(value, INSIGHT_KEYS)) return false;
  return (
    typeof value.setup_family === "string" &&
    typeof value.horizon === "string" &&
    typeof value.evidence_direction === "string" &&
    typeof value.evidence_quality === "string" &&
    isNonNegativeInteger(value.total_support) &&
    isNonNegativeInteger(value.unique_snapshot_support) &&
    isNonNegativeInteger(value.completed_outcome_count)
  );
}

function isStringArray(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string" && item.length > 0);
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function hasValidLineage(envelope: ConfidenceCalibrationInsightEnvelope): boolean {
  return [
    envelope.pattern_discovery_sha256,
    envelope.pattern_discovery_result_sha256,
    envelope.evidence_set_sha256,
    envelope.group_sha256,
    envelope.insight_sha256,
  ].every((value) => HASH_PATTERN.test(value)) &&
    envelope.pattern_discovery_configuration_version.length > 0 &&
    envelope.insight_id.length > 0 &&
    envelope.source_scenario_ids.length > 0 &&
    envelope.source_snapshot_ids.length > 0;
}

function validateWarnings(codes: readonly string[], path: string): ConfidenceCalibrationIssue | null {
  for (const code of uniqueWarningCodes(codes)) {
    if (BLOCKING_WARNING_CODES.has(code)) return issue("warning_status_contradiction", `${path}/warning_codes`);
    if (!REDUCING_WARNING_CODES.has(code)) return issue("warning_status_contradiction", `${path}/warning_codes`);
  }
  return null;
}

function supportExclusion(
  envelope: ConfidenceCalibrationInsightEnvelope,
  configuration: FrozenConfidenceCalibrationConfiguration,
): string | null {
  if (!envelope.insight) return "missing_insight";
  if (envelope.insight.total_support < configuration.minimum_total_support) return "minimum_total_support_not_met";
  if (envelope.insight.unique_snapshot_support < configuration.minimum_unique_snapshot_support) {
    return "minimum_unique_snapshot_support_not_met";
  }
  if (envelope.insight.completed_outcome_count < configuration.minimum_completed_outcomes) {
    return "minimum_completed_outcomes_not_met";
  }
  return null;
}

function candidate(envelope: ConfidenceCalibrationInsightEnvelope, path: string): Candidate {
  const sourceIds = [...envelope.source_scenario_ids, ...envelope.source_snapshot_ids].sort(compareText);
  return {
    envelope,
    path,
    sort_key: [
      envelope.pattern_discovery_configuration_version,
      envelope.pattern_discovery_result_sha256,
      envelope.evidence_set_sha256,
      envelope.group_sha256,
      envelope.insight_id,
      envelope.insight_sha256,
    ].join("\u0000"),
    dedupe_key: [
      envelope.pattern_discovery_configuration_version,
      envelope.pattern_discovery_result_sha256,
      envelope.evidence_set_sha256,
      envelope.group_sha256,
      envelope.insight_id,
      envelope.insight_sha256,
    ].join("\u0000"),
    overlap_key: [
      envelope.pattern_discovery_result_sha256,
      envelope.evidence_set_sha256,
      envelope.group_sha256,
      envelope.insight_sha256,
      [...envelope.source_scenario_ids].sort(compareText).join("\u0001"),
      [...envelope.source_snapshot_ids].sort(compareText).join("\u0001"),
    ].join("\u0000"),
    evidence_set_key: [envelope.pattern_discovery_result_sha256, envelope.evidence_set_sha256].join("\u0000"),
    source_ids: sourceIds,
    direction_sign: directionSign(envelope.insight?.evidence_direction ?? "mixed"),
  };
}

function overlaps(left: Candidate, right: Candidate): boolean {
  if (left.overlap_key === right.overlap_key) return true;
  if (left.evidence_set_key === right.evidence_set_key) return true;
  return left.source_ids.some((sourceId) => right.source_ids.includes(sourceId));
}

function directionSign(direction: string): -1 | 0 | 1 {
  if (direction.startsWith("supportive")) return 1;
  if (direction.startsWith("adverse")) return -1;
  return 0;
}

function calculateAdjustment(
  item: Candidate,
  configuration: FrozenConfidenceCalibrationConfiguration,
  warnings: ConfidenceCalibrationWarning[],
): ConfidenceCalibrationAdjustment {
  const insight = item.envelope.insight;
  if (!insight) {
    return {
      insight_id: item.envelope.insight_id,
      base_delta_basis_points: 0,
      adjusted_delta_basis_points: 0,
      evidence_quality: "missing",
      warning_codes: [],
    };
  }
  const base = configuration.direction_delta_table[insight.evidence_direction];
  const quality = configuration.evidence_quality_table[insight.evidence_quality];
  let adjusted = typeof quality === "string" ? 0 : roundRatio(base, quality.numerator, quality.denominator);
  const sortedWarnings = uniqueWarningCodes(item.envelope.warning_codes);
  for (const code of sortedWarnings) {
    if (code === "duplicate_mapper_row_identity" || code === "metric_value_unavailable") {
      const ratio = configuration.warning_attenuation_table[code];
      adjusted = roundRatio(adjusted, ratio.numerator, ratio.denominator);
      warnings.push(warning(code, `${item.path}/warning_codes`));
    }
  }
  adjusted = clamp(
    adjusted,
    configuration.negative_per_insight_cap_basis_points,
    configuration.positive_per_insight_cap_basis_points,
  );
  return {
    insight_id: item.envelope.insight_id,
    base_delta_basis_points: base,
    adjusted_delta_basis_points: adjusted,
    evidence_quality: insight.evidence_quality,
    warning_codes: sortedWarnings,
  };
}

function roundRatio(value: number, numerator: number, denominator: number): number {
  const absolute = Math.abs(value * numerator);
  const rounded = Math.floor(absolute / denominator + 0.5);
  return value < 0 ? -rounded : rounded;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

function blocked(
  status: ResultStatus,
  issues: readonly ConfidenceCalibrationIssue[],
  baseConfidence: number | null = null,
  warnings: readonly ConfidenceCalibrationWarning[] = [],
  excluded: readonly { insight_id: string; reason: string }[] = [],
  overlap: { deduplicatedCount: number; overlappingExcludedCount: number; conflictCount: number } = {
    deduplicatedCount: 0,
    overlappingExcludedCount: 0,
    conflictCount: 0,
  },
): ConfidenceCalibrationResult {
  return {
    status,
    calibration_id: null,
    calibration_hash: null,
    original_confidence: baseConfidence,
    proposed_delta: null,
    proposed_calibrated_confidence: null,
    included_insight_ids: [],
    excluded_insight_ids: orderedExcluded(excluded),
    evidence_summary: {
      included_count: 0,
      excluded_count: excluded.length,
      warning_count: warnings.length,
      positive_delta_basis_points: 0,
      negative_delta_basis_points: 0,
      final_delta_basis_points: 0,
    },
    overlap_summary: {
      deduplicated_count: overlap.deduplicatedCount,
      overlapping_excluded_count: overlap.overlappingExcludedCount,
      conflict_count: overlap.conflictCount,
    },
    adjustments: [],
    warnings: orderedWarnings(warnings),
    issues: orderedIssues(issues),
    lineage_hashes: [],
    non_authoritative: true,
    applied: false,
  };
}

function buildResult(input: Readonly<{
  status: ResultStatus;
  baseConfidence: number;
  baseConfidenceBasisPoints: number;
  deltaBasisPoints: number;
  calibratedBasisPoints: number;
  selected: readonly Candidate[];
  excluded: readonly { insight_id: string; reason: string }[];
  warnings: readonly ConfidenceCalibrationWarning[];
  issues: readonly ConfidenceCalibrationIssue[];
  adjustments: readonly ConfidenceCalibrationAdjustment[];
  overlap: { deduplicatedCount: number; overlappingExcludedCount: number; conflictCount: number };
}>): ConfidenceCalibrationResult {
  const includedIds = input.selected.map((item) => item.envelope.insight_id).sort(compareText);
  const excludedIds = orderedExcluded(input.excluded);
  const orderedAdjustments = [...input.adjustments].sort((left, right) => compareText(left.insight_id, right.insight_id));
  const orderedWarnings = orderWarnings(input.warnings);
  const orderedIssues = orderIssues(input.issues);
  const lineageHashes = input.selected
    .map((item) => ({
      pattern_discovery_sha256: item.envelope.pattern_discovery_sha256,
      pattern_discovery_result_sha256: item.envelope.pattern_discovery_result_sha256,
      evidence_set_sha256: item.envelope.evidence_set_sha256,
      group_sha256: item.envelope.group_sha256,
      insight_sha256: item.envelope.insight_sha256,
    }))
    .sort((left, right) =>
      compareText(left.pattern_discovery_result_sha256, right.pattern_discovery_result_sha256) ||
      compareText(left.evidence_set_sha256, right.evidence_set_sha256) ||
      compareText(left.group_sha256, right.group_sha256) ||
      compareText(left.insight_sha256, right.insight_sha256));
  const positive = orderedAdjustments
    .filter((item) => item.adjusted_delta_basis_points > 0)
    .reduce((sum, item) => sum + item.adjusted_delta_basis_points, 0);
  const negative = orderedAdjustments
    .filter((item) => item.adjusted_delta_basis_points < 0)
    .reduce((sum, item) => sum + item.adjusted_delta_basis_points, 0);
  const canonicalPayload = {
    schema_marker: "confidence_calibration_result_v1",
    status: input.status,
    configuration_version: input.selected[0]?.envelope.pattern_discovery_configuration_version ?? null,
    base_confidence_basis_points: input.baseConfidenceBasisPoints,
    included_insight_ids: includedIds,
    included_insight_hashes: input.selected.map((item) => item.envelope.insight_sha256).sort(compareText),
    excluded_insight_ids: excludedIds,
    overlap_resolution_summary: {
      deduplicated_count: input.overlap.deduplicatedCount,
      overlapping_excluded_count: input.overlap.overlappingExcludedCount,
      conflict_count: input.overlap.conflictCount,
    },
    proposed_delta_basis_points: input.deltaBasisPoints,
    proposed_calibrated_confidence_basis_points: input.calibratedBasisPoints,
  };
  const calibrationHash = sha256(canonicalPayload);
  return {
    status: input.status,
    calibration_id: `confidence_calibration_v1:${calibrationHash.slice(0, 24)}`,
    calibration_hash: calibrationHash,
    original_confidence: toPercent(input.baseConfidenceBasisPoints),
    proposed_delta: toPercent(input.deltaBasisPoints),
    proposed_calibrated_confidence: toPercent(input.calibratedBasisPoints),
    included_insight_ids: includedIds,
    excluded_insight_ids: excludedIds,
    evidence_summary: {
      included_count: includedIds.length,
      excluded_count: excludedIds.length,
      warning_count: orderedWarnings.length,
      positive_delta_basis_points: positive,
      negative_delta_basis_points: negative,
      final_delta_basis_points: input.deltaBasisPoints,
    },
    overlap_summary: {
      deduplicated_count: input.overlap.deduplicatedCount,
      overlapping_excluded_count: input.overlap.overlappingExcludedCount,
      conflict_count: input.overlap.conflictCount,
    },
    adjustments: orderedAdjustments,
    warnings: orderedWarnings,
    issues: orderedIssues,
    lineage_hashes: lineageHashes,
    non_authoritative: true,
    applied: false,
  };
}

function toPercent(basisPoints: number): number {
  return Object.is(basisPoints, -0) ? 0 : basisPoints / 100;
}

function insightLabel(envelope: ConfidenceCalibrationInsightEnvelope, index: number): string {
  return typeof envelope.insight_id === "string" && envelope.insight_id.length > 0
    ? envelope.insight_id
    : `input_index:${index}`;
}

function primaryStatus(issues: readonly ConfidenceCalibrationIssue[]): ResultStatus {
  const first = orderIssues(issues)[0];
  if (!first) return "blocked_invalid_input";
  if (first.code === "invalid_configuration_shape") return "blocked_invalid_configuration";
  if (first.code === "invalid_lineage") return "blocked_invalid_lineage";
  if (first.code === "future_leakage") return "blocked_future_leakage";
  if (first.code === "overlapping_evidence_conflict") return "blocked_overlapping_evidence";
  if (
    first.code === "ineligible_pattern_discovery_status" ||
    first.code === "invalid_evidence_quality" ||
    first.code === "unsupported_direction"
  ) {
    return "blocked_unsupported_insight";
  }
  return "blocked_invalid_input";
}

function uniqueWarningCodes(codes: readonly string[]): string[] {
  return [...new Set(codes)].sort(compareText);
}

function orderedExcluded(values: readonly { insight_id: string; reason: string }[]): readonly Readonly<{ insight_id: string; reason: string }>[] {
  const unique = new Map<string, { insight_id: string; reason: string }>();
  for (const value of values) unique.set(`${value.insight_id}\u0000${value.reason}`, value);
  return [...unique.values()].sort(
    (left, right) => compareText(left.insight_id, right.insight_id) || compareText(left.reason, right.reason),
  );
}

function orderIssues(values: readonly ConfidenceCalibrationIssue[]): ConfidenceCalibrationIssue[] {
  const unique = new Map<string, ConfidenceCalibrationIssue>();
  for (const value of values) {
    unique.set(`${value.severity}\u0000${value.code}\u0000${value.path}\u0000${value.messageKey}`, value);
  }
  return [...unique.values()].sort(
    (left, right) =>
      compareText(left.severity, right.severity) ||
      compareText(left.code, right.code) ||
      compareText(left.path, right.path) ||
      compareText(left.messageKey, right.messageKey),
  );
}

function orderedIssues(values: readonly ConfidenceCalibrationIssue[]): readonly ConfidenceCalibrationIssue[] {
  return orderIssues(values);
}

function orderWarnings(values: readonly ConfidenceCalibrationWarning[]): ConfidenceCalibrationWarning[] {
  const unique = new Map<string, ConfidenceCalibrationWarning>();
  for (const value of values) {
    unique.set(`${value.severity}\u0000${value.code}\u0000${value.path}\u0000${value.messageKey}`, value);
  }
  return [...unique.values()].sort(
    (left, right) =>
      compareText(left.severity, right.severity) ||
      compareText(left.code, right.code) ||
      compareText(left.path, right.path) ||
      compareText(left.messageKey, right.messageKey),
  );
}

function orderedWarnings(values: readonly ConfidenceCalibrationWarning[]): readonly ConfidenceCalibrationWarning[] {
  return orderWarnings(values);
}

function validWarningClassification(value: unknown): boolean {
  return isRecord(value) &&
    keysEqual(value, [
      "duplicate_mapper_row_identity",
      "metric_value_unavailable",
      "minimum_completed_outcomes_not_met",
      "minimum_total_support_not_met",
    ]) &&
    value.duplicate_mapper_row_identity === "calibration_reducing" &&
    value.metric_value_unavailable === "calibration_reducing" &&
    value.minimum_total_support_not_met === "calibration_blocking" &&
    value.minimum_completed_outcomes_not_met === "calibration_blocking";
}

function validWarningAttenuation(value: unknown): boolean {
  return isRecord(value) &&
    keysEqual(value, ["duplicate_mapper_row_identity", "metric_value_unavailable"]) &&
    isRatio(value.duplicate_mapper_row_identity, 1, 2) &&
    isRatio(value.metric_value_unavailable, 1, 2);
}

function validQualityTable(value: unknown): boolean {
  return isRecord(value) &&
    keysEqual(value, ["blocked", "verified_high", "verified_limited", "verified_usable"]) &&
    value.blocked === "blocked" &&
    isRatio(value.verified_high, 1, 1) &&
    isRatio(value.verified_usable, 1, 2) &&
    isRatio(value.verified_limited, 1, 4);
}

function validDeltaTable(value: unknown): boolean {
  return isRecord(value) &&
    keysEqual(value, [
      "adverse_moderate",
      "adverse_strong",
      "adverse_weak",
      "mixed",
      "neutral",
      "supportive_moderate",
      "supportive_strong",
      "supportive_weak",
    ]) &&
    value.supportive_strong === 200 &&
    value.supportive_moderate === 100 &&
    value.supportive_weak === 50 &&
    value.neutral === 0 &&
    value.mixed === 0 &&
    value.adverse_weak === -100 &&
    value.adverse_moderate === -200 &&
    value.adverse_strong === -300;
}

function isRatio(value: unknown, numerator: number, denominator: number): boolean {
  return isRecord(value) && keysEqual(value, ["denominator", "numerator"]) &&
    value.numerator === numerator &&
    value.denominator === denominator;
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
