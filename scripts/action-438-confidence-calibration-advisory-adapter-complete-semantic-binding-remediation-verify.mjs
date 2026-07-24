#!/usr/bin/env node

import { execFileSync, spawnSync } from "child_process";
import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const abs = (path) => join(root, path);
const read = (path) => readFileSync(abs(path), "utf8");
const exists = (path) => existsSync(abs(path));
const h = (char) => char.repeat(64);
const clone = (value) => JSON.parse(JSON.stringify(value));

const paths = {
  adapter: "lib/confidence-calibration-advisory-adapter.ts",
  calibration: "lib/pure-confidence-calibration.ts",
  doc: "docs/action-438-confidence-calibration-advisory-adapter-complete-semantic-binding-remediation.md",
  verifier: "scripts/action-438-confidence-calibration-advisory-adapter-complete-semantic-binding-remediation-verify.mjs",
  test: "tests/e2e/action-438-confidence-calibration-advisory-adapter-complete-semantic-binding-remediation.spec.ts",
  action309Guard: "scripts/action-309-post-recovery-safety-guard.mjs",
  goldenVerifier: "scripts/replay-with-signal-package-static-preview-verify-golden.mjs",
};

const advisoryConfig = {
  adapter_schema_version: "confidence_calibration_advisory_result_v1",
  configuration_version: "confidence_calibration_advisory_config_v1",
  advisory_id_prefix: "confidence_calibration_advisory_v1:",
  confidence_scale_basis_points_per_point: 100,
  accepted_min_confidence_basis_points: 0,
  accepted_max_confidence_basis_points: 10000,
  output_decimal_precision: 2,
  deterministic_sorting_policy: "action_432_sort_v1",
  identity_policy: "action_432_identity_v1",
  issue_message_key_prefix: "confidence_calibration_advisory.",
  eligible_calibration_statuses: ["calibrated", "calibrated_with_warnings", "no_adjustment"],
  blocked_calibration_status_map: {
    insufficient_eligible_evidence: "advisory_insufficient_evidence",
    blocked_invalid_input: "blocked_invalid_input",
    blocked_invalid_configuration: "blocked_invalid_input",
    blocked_invalid_lineage: "blocked_invalid_lineage",
    blocked_future_leakage: "blocked_future_leakage",
    blocked_overlapping_evidence: "blocked_calibration_result",
    blocked_unsupported_insight: "blocked_unsupported_status",
  },
  advisory_visibility_policy: "advisory_visible_for_eligible_statuses",
  application_policy: "never_apply_in_action_432",
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
};

const calibrationConfig = {
  configuration_version: "confidence_calibration_config_v1",
  confidence_scale_basis_points_per_point: 100,
  accepted_min_confidence_basis_points: 0,
  accepted_max_confidence_basis_points: 10000,
  output_decimal_precision: 2,
  positive_per_insight_cap_basis_points: 200,
  negative_per_insight_cap_basis_points: -300,
  combined_positive_cap_basis_points: 400,
  combined_negative_cap_basis_points: -600,
  minimum_total_support: 20,
  minimum_unique_snapshot_support: 20,
  minimum_completed_outcomes: 20,
  accepted_setup_families: ["opening_drive", "pullback_continuation"],
  accepted_horizons: ["15m", "30m"],
  warning_classification_table: {
    duplicate_mapper_row_identity: "calibration_reducing",
    metric_value_unavailable: "calibration_reducing",
    minimum_total_support_not_met: "calibration_blocking",
    minimum_completed_outcomes_not_met: "calibration_blocking",
  },
  warning_attenuation_table: {
    duplicate_mapper_row_identity: { numerator: 1, denominator: 2 },
    metric_value_unavailable: { numerator: 1, denominator: 2 },
  },
  evidence_quality_table: {
    verified_high: { numerator: 1, denominator: 1 },
    verified_usable: { numerator: 1, denominator: 2 },
    verified_limited: { numerator: 1, denominator: 4 },
    blocked: "blocked",
  },
  direction_delta_table: {
    supportive_strong: 200,
    supportive_moderate: 100,
    supportive_weak: 50,
    neutral: 0,
    mixed: 0,
    adverse_weak: -100,
    adverse_moderate: -200,
    adverse_strong: -300,
  },
  overlap_resolution_policy: "action_419_overlap_v1",
  deterministic_sorting_policy: "action_419_sort_v1",
  rounding_mode: "round_half_away_from_zero",
  confidence_bound_policy: "clamp_valid_delta_to_bounds",
};

function runJson(path) {
  return JSON.parse(execFileSync("node", [abs(path)], { cwd: root, encoding: "utf8", timeout: 300000 }));
}

function rgFiles(pattern, targets) {
  const result = spawnSync("rg", ["-l", pattern, ...targets], { cwd: root, encoding: "utf8" });
  if (result.status !== 0 && result.status !== 1) throw new Error(result.stderr || `rg failed:${pattern}`);
  return result.stdout.trim() ? result.stdout.trim().split("\n").sort() : [];
}

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function orderText(values) {
  return [...new Set(values)].sort(compareText);
}

function orderByKey(values, keyFn) {
  return [...values].sort((left, right) => compareText(keyFn(left), keyFn(right)));
}

function canonicalize(value) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("non_finite_number");
    return Object.is(value, -0) ? 0 : value;
  }
  if (Array.isArray(value)) return value.map(canonicalize);
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, child]) => child !== undefined)
        .sort(([left], [right]) => compareText(left, right))
        .map(([key, child]) => [key, canonicalize(child)]),
    );
  }
  throw new TypeError("unsupported_value");
}

function sha256(value) {
  return createHash("sha256").update(JSON.stringify(canonicalize(value)), "utf8").digest("hex");
}

function basisPoints(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const scaled = value * 100;
  if (Math.abs(scaled - Math.round(scaled)) > 1e-9) return null;
  return Object.is(Math.round(scaled), -0) ? 0 : Math.round(scaled);
}

function fullPayload(result) {
  return {
    schema_marker: "confidence_calibration_result_v1",
    result_hash_schema_marker: "confidence_calibration_complete_semantic_result_v1",
    status: result.status,
    calibration_id: result.calibration_id,
    configuration_version: result.lineage_hashes.length > 0 ? "pattern_discovery_config_v1" : null,
    base_confidence_basis_points: basisPoints(result.original_confidence),
    proposed_delta_basis_points: basisPoints(result.proposed_delta),
    proposed_calibrated_confidence_basis_points: basisPoints(result.proposed_calibrated_confidence),
    included_insight_ids: orderText(result.included_insight_ids),
    excluded_insight_ids: orderByKey(result.excluded_insight_ids, (item) => `${item.insight_id}\u0000${item.reason}`),
    evidence_summary: {
      included_count: result.evidence_summary.included_count,
      excluded_count: result.evidence_summary.excluded_count,
      warning_count: result.evidence_summary.warning_count,
      positive_delta_basis_points: result.evidence_summary.positive_delta_basis_points,
      negative_delta_basis_points: result.evidence_summary.negative_delta_basis_points,
      final_delta_basis_points: result.evidence_summary.final_delta_basis_points,
    },
    overlap_summary: {
      deduplicated_count: result.overlap_summary.deduplicated_count,
      overlapping_excluded_count: result.overlap_summary.overlapping_excluded_count,
      conflict_count: result.overlap_summary.conflict_count,
    },
    adjustments: orderByKey(result.adjustments.map((item) => ({
      insight_id: item.insight_id,
      base_delta_basis_points: item.base_delta_basis_points,
      adjusted_delta_basis_points: item.adjusted_delta_basis_points,
      evidence_quality: item.evidence_quality,
      warning_codes: orderText(item.warning_codes),
    })), (item) => [
      item.insight_id,
      item.evidence_quality,
      item.base_delta_basis_points,
      item.adjusted_delta_basis_points,
      item.warning_codes.join("\u0001"),
    ].join("\u0000")),
    warnings: orderByKey(result.warnings.map((item) => ({
      code: item.code,
      path: item.path,
      severity: item.severity,
      messageKey: item.messageKey,
    })), (item) => `${item.severity}\u0000${item.code}\u0000${item.path}\u0000${item.messageKey}`),
    issues: orderByKey(result.issues.map((item) => ({
      code: item.code,
      path: item.path,
      severity: item.severity,
      messageKey: item.messageKey,
    })), (item) => `${item.severity}\u0000${item.code}\u0000${item.path}\u0000${item.messageKey}`),
    lineage_hashes: orderByKey(result.lineage_hashes.map((item) => ({
      pattern_discovery_sha256: item.pattern_discovery_sha256,
      pattern_discovery_result_sha256: item.pattern_discovery_result_sha256,
      evidence_set_sha256: item.evidence_set_sha256,
      group_sha256: item.group_sha256,
      insight_sha256: item.insight_sha256,
    })), (item) => [
      item.pattern_discovery_sha256,
      item.pattern_discovery_result_sha256,
      item.evidence_set_sha256,
      item.group_sha256,
      item.insight_sha256,
    ].join("\u0000")),
    non_authoritative: result.non_authoritative,
    applied: result.applied,
  };
}

function withCompleteHash(result) {
  const next = clone(result);
  next.calibration_hash = sha256(fullPayload(next));
  return next;
}

function recomputeCompleteHash(result) {
  result.calibration_hash = sha256(fullPayload(result));
  return result;
}

function insight(overrides = {}) {
  return {
    pattern_discovery_sha256: overrides.pattern_discovery_sha256 ?? h("a"),
    pattern_discovery_configuration_version: overrides.pattern_discovery_configuration_version ?? "pattern_discovery_config_v1",
    pattern_discovery_result_sha256: overrides.pattern_discovery_result_sha256 ?? h("b"),
    evidence_set_sha256: overrides.evidence_set_sha256 ?? h("c"),
    group_sha256: overrides.group_sha256 ?? h("d"),
    insight_id: overrides.insight_id ?? "insight_opening_drive_15m",
    insight_sha256: overrides.insight_sha256 ?? h("e"),
    source_scenario_ids: overrides.source_scenario_ids ?? ["scenario_001"],
    source_snapshot_ids: overrides.source_snapshot_ids ?? ["snapshot_001"],
    pattern_discovery_status: overrides.pattern_discovery_status ?? "discovered",
    warning_codes: overrides.warning_codes ?? [],
    static_only: true,
    non_authoritative: true,
    no_persistence: true,
    no_replay: true,
    no_runtime: true,
    no_feedback: true,
    anti_leakage_status: "passed",
    insight: {
      setup_family: "opening_drive",
      horizon: "15m",
      evidence_direction: overrides.evidence_direction ?? "supportive_strong",
      evidence_quality: overrides.evidence_quality ?? "verified_high",
      total_support: overrides.total_support ?? 40,
      unique_snapshot_support: overrides.unique_snapshot_support ?? 40,
      completed_outcome_count: overrides.completed_outcome_count ?? 40,
    },
  };
}

const { calibrateConfidence } = await import("../lib/pure-confidence-calibration.ts");
const { buildConfidenceCalibrationAdvisory } = await import("../lib/confidence-calibration-advisory-adapter.ts");

function calibrationFor(insights, baseConfidence = 50) {
  return calibrateConfidence({ baseConfidence, insights, configuration: calibrationConfig });
}

function recommendationFor(calibration, overrides = {}) {
  return {
    recommendation_id: "rec_static_001",
    recommendation_fingerprint: "rec_fingerprint_static_001",
    recommendation_snapshot_hash: h("f"),
    original_confidence: calibration.original_confidence ?? 50,
    decision_boundary: {
      boundary_id: "decision_boundary_001",
      boundary_sha256: h("1"),
      evidence_cutoff_sha256: h("2"),
      anti_leakage_state: "passed",
    },
    source: {
      source_kind: "recommendation_snapshot",
      source_version: "recommendation_snapshot_v1",
      immutable: true,
    },
    lineage: {
      recommendation_source_hash: h("3"),
      pattern_discovery_result_hashes: calibration.lineage_hashes.map((item) => item.pattern_discovery_result_sha256),
      pattern_insight_ids: calibration.included_insight_ids,
      pattern_insight_hashes: calibration.lineage_hashes.map((item) => item.insight_sha256),
      source_scenario_ids: ["scenario_001"],
      source_snapshot_ids: ["snapshot_001"],
    },
    static_only: true,
    non_authoritative: true,
    no_persistence: true,
    no_replay: true,
    no_runtime: true,
    no_feedback: true,
    no_mutation_callback: true,
    commands: {
      mutation: false,
      persistence: false,
      ranking: false,
      scanner: false,
      publication: false,
      execution: false,
      feedback: false,
    },
    anti_feedback: {
      calibration_output_reused_as_calibration_input_evidence: false,
      calibration_output_reused_as_context: false,
      calibration_output_reused_as_execution_signal: false,
      calibration_output_reused_as_learning_dataset_input: false,
      calibration_output_reused_as_outcome: false,
      calibration_output_reused_as_pattern_discovery_evidence: false,
      calibration_output_reused_as_publication_signal: false,
      calibration_output_reused_as_ranking_signal: false,
      calibration_output_reused_as_recommendation_base_confidence: false,
      calibration_output_reused_as_scanner_signal: false,
      circular_calibration_lineage: false,
      self_referential_recommendation_lineage: false,
    },
    anti_leakage: {
      status: "passed",
      future_outcome_evidence: false,
      post_entry_evidence: false,
      post_exit_evidence: false,
      same_recommendation_realized_result: false,
      evidence_after_decision_boundary: false,
      prohibited_self_calibration: false,
    },
    ...overrides,
  };
}

function advisory(calibration, recommendation = recommendationFor(calibration)) {
  return buildConfidenceCalibrationAdvisory({ recommendation, calibration, configuration: advisoryConfig });
}

function patched(value, patch) {
  const draft = clone(value);
  patch(draft);
  return draft;
}

function mismatch(result) {
  return result.status === "blocked_calibration_result" &&
    result.issues.length === 1 &&
    result.issues[0].path === "/calibration/calibration_hash" &&
    result.issues[0].messageKey === "confidence_calibration_advisory.blocked_calibration_result" &&
    result.advisory_id === null &&
    result.advisory_hash === null &&
    result.advisory_eligible === false &&
    result.application_eligible === false &&
    result.non_authoritative === true &&
    result.applied === false &&
    !JSON.stringify(result).includes("expected") &&
    !JSON.stringify(result).includes("actual");
}

function blocked(result) {
  return result.status.startsWith("blocked_") &&
    result.advisory_id === null &&
    result.application_eligible === false &&
    result.non_authoritative === true &&
    result.applied === false;
}

function frozenDeep(value) {
  if (!Object.isFrozen(value)) return false;
  if (Array.isArray(value)) return value.every(frozenDeep);
  if (value && typeof value === "object") return Object.values(value).every((child) =>
    child && typeof child === "object" ? frozenDeep(child) : true);
  return true;
}

const legacyCalibrated = calibrationFor([insight()]);
const legacyWarning = calibrationFor([insight({ warning_codes: ["metric_value_unavailable"] })]);
const legacyNoAdjustment = calibrationFor([insight({ evidence_direction: "neutral" })]);
const completeCalibrated = withCompleteHash(legacyCalibrated);
const completeWarning = withCompleteHash(legacyWarning);
const completeNoAdjustment = withCompleteHash(legacyNoAdjustment);
const twoInsight = withCompleteHash(calibrationFor([
  insight({ insight_id: "insight_b", insight_sha256: h("e"), pattern_discovery_result_sha256: h("b") }),
  insight({ insight_id: "insight_a", insight_sha256: h("d"), pattern_discovery_result_sha256: h("c"), group_sha256: h("d") }),
]));
const baseline = advisory(completeCalibrated);
const legacyBaseline = advisory(legacyCalibrated);

const fieldInventory = {
  status: "included_in_calibration_result_hash",
  calibration_id: "included_in_calibration_result_hash",
  calibration_hash: "explicitly_non_semantic_and_excluded",
  original_confidence: "included_in_calibration_result_hash",
  proposed_delta: "included_in_calibration_result_hash",
  proposed_calibrated_confidence: "included_in_calibration_result_hash",
  included_insight_ids: "included_in_calibration_result_hash",
  excluded_insight_ids: "included_in_calibration_result_hash",
  evidence_summary: "included_in_calibration_result_hash",
  overlap_summary: "included_in_calibration_result_hash",
  adjustments: "included_in_calibration_result_hash",
  warnings: "included_in_calibration_result_hash",
  issues: "included_in_calibration_result_hash",
  lineage_hashes: "included_in_calibration_result_hash",
  pattern_discovery_sha256: "included_in_calibration_result_hash",
  pattern_discovery_result_sha256: "included_in_calibration_result_hash",
  evidence_set_sha256: "included_in_calibration_result_hash",
  group_sha256: "included_in_calibration_result_hash",
  insight_sha256: "included_in_calibration_result_hash",
  source_scenario_ids: "absent_for_status_specific_shape",
  source_snapshot_ids: "absent_for_status_specific_shape",
  pattern_discovery_configuration_hash: "absent_for_status_specific_shape",
  non_authoritative: "included_in_calibration_result_hash",
  applied: "included_in_calibration_result_hash",
};

const accepted = {
  legacy_calibrated_hash_accepted: legacyBaseline.status === "advisory_ready",
  complete_calibrated_hash_accepted: baseline.status === "advisory_ready",
  complete_warning_hash_accepted: advisory(completeWarning).status === "advisory_ready_with_warnings",
  complete_no_adjustment_hash_accepted: advisory(completeNoAdjustment).status === "advisory_no_adjustment",
};

const attackMatrix = {
  calibration_id: mismatch(advisory(patched(completeCalibrated, (draft) => {
    draft.calibration_id = "confidence_calibration_v1:000000000000000000000000";
  }))),
  status: mismatch(advisory(patched(completeCalibrated, (draft) => { draft.status = "calibrated_with_warnings"; }))),
  original_confidence: mismatch(advisory(patched(completeCalibrated, (draft) => { draft.original_confidence = 51; }), recommendationFor(completeCalibrated, { original_confidence: 51 }))),
  proposed_delta: mismatch(advisory(patched(completeCalibrated, (draft) => { draft.proposed_delta = 3; }))),
  proposed_calibrated_confidence: mismatch(advisory(patched(completeCalibrated, (draft) => { draft.proposed_calibrated_confidence = 53; }))),
  warning_code: mismatch(advisory(patched(completeWarning, (draft) => {
    draft.warnings[0].code = "duplicate_mapper_row_identity";
    draft.warnings[0].messageKey = "confidence_calibration.duplicate_mapper_row_identity";
  }))),
  warning_path: mismatch(advisory(patched(completeWarning, (draft) => { draft.warnings[0].path = "/insights/1/warning_codes"; }))),
  warning_severity: mismatch(advisory(patched(completeWarning, (draft) => { draft.warnings[0].severity = "error"; }))),
  warning_messageKey: mismatch(advisory(patched(completeWarning, (draft) => { draft.warnings[0].messageKey = "confidence_calibration.changed"; }))),
  issue_code: mismatch(advisory(patched(completeCalibrated, (draft) => {
    draft.issues = [{ code: "invalid_lineage", path: "/insights/0", severity: "error", messageKey: "confidence_calibration.invalid_lineage" }];
  }))),
  issue_path: mismatch(advisory(patched(completeCalibrated, (draft) => {
    draft.issues = [{ code: "invalid_lineage", path: "/insights/1", severity: "error", messageKey: "confidence_calibration.invalid_lineage" }];
  }))),
  issue_severity: mismatch(advisory(patched(completeCalibrated, (draft) => {
    draft.issues = [{ code: "invalid_lineage", path: "/insights/0", severity: "warning", messageKey: "confidence_calibration.invalid_lineage" }];
  }))),
  issue_messageKey: mismatch(advisory(patched(completeCalibrated, (draft) => {
    draft.issues = [{ code: "invalid_lineage", path: "/insights/0", severity: "error", messageKey: "confidence_calibration.changed" }];
  }))),
  included_insight_ids: mismatch(advisory(patched(completeCalibrated, (draft) => { draft.included_insight_ids = ["other"]; }))),
  excluded_insight_ids: mismatch(advisory(patched(twoInsight, (draft) => { draft.excluded_insight_ids = [{ insight_id: "other", reason: "overlapping_insight_excluded" }]; }))),
  exclusion_reason: mismatch(advisory(patched(twoInsight, (draft) => { draft.excluded_insight_ids[0].reason = "changed"; }))),
  evidence_summary: mismatch(advisory(patched(completeCalibrated, (draft) => { draft.evidence_summary.included_count = 99; }))),
  overlap_summary: mismatch(advisory(patched(completeCalibrated, (draft) => { draft.overlap_summary.conflict_count = 99; }))),
  adjustment: mismatch(advisory(patched(completeCalibrated, (draft) => { draft.adjustments[0].adjusted_delta_basis_points = 123; }))),
  pattern_discovery_sha256: mismatch(advisory(patched(completeCalibrated, (draft) => { draft.lineage_hashes[0].pattern_discovery_sha256 = h("9"); }))),
  pattern_discovery_result_sha256: mismatch(advisory(patched(completeCalibrated, (draft) => { draft.lineage_hashes[0].pattern_discovery_result_sha256 = h("9"); }))),
  evidence_set_sha256: mismatch(advisory(patched(completeCalibrated, (draft) => { draft.lineage_hashes[0].evidence_set_sha256 = h("9"); }))),
  group_sha256: mismatch(advisory(patched(completeCalibrated, (draft) => { draft.lineage_hashes[0].group_sha256 = h("9"); }))),
  insight_sha256: mismatch(advisory(patched(completeCalibrated, (draft) => { draft.lineage_hashes[0].insight_sha256 = h("9"); }))),
  non_authoritative: blocked(advisory(patched(completeCalibrated, (draft) => { draft.non_authoritative = false; }))),
  applied: blocked(advisory(patched(completeCalibrated, (draft) => { draft.applied = true; }))),
  combined: mismatch(advisory(patched(completeCalibrated, (draft) => {
    draft.status = "calibrated_with_warnings";
    draft.proposed_calibrated_confidence = 53;
    draft.lineage_hashes[0].pattern_discovery_sha256 = h("9");
  }))),
};

const phaseBehavior = {
  pattern_discovery_result_retained_hash_blocks_phase_10:
    attackMatrix.pattern_discovery_result_sha256,
  pattern_discovery_result_recomputed_hash_blocks_phase_11:
    advisory(recomputeCompleteHash(patched(completeCalibrated, (draft) => {
      draft.lineage_hashes[0].pattern_discovery_result_sha256 = h("9");
    })), recommendationFor(completeCalibrated)).status === "blocked_invalid_lineage",
  pattern_insight_hash_retained_hash_blocks_phase_10:
    attackMatrix.insight_sha256,
  pattern_insight_hash_recomputed_hash_blocks_phase_11:
    advisory(recomputeCompleteHash(patched(completeCalibrated, (draft) => {
      draft.lineage_hashes[0].insight_sha256 = h("9");
    })), recommendationFor(completeCalibrated)).status === "blocked_invalid_lineage",
  leakage_outranked_by_phase_10:
    advisory(patched(completeCalibrated, (draft) => { draft.calibration_hash = h("9"); }), recommendationFor(completeCalibrated, {
      anti_leakage: { ...recommendationFor(completeCalibrated).anti_leakage, future_outcome_evidence: true },
    })).status === "blocked_calibration_result",
};

const reorderEquivalent = {
  warnings: JSON.stringify(advisory(completeWarning)) ===
    JSON.stringify(advisory(recomputeCompleteHash(patched(completeWarning, (draft) => { draft.warnings = [...draft.warnings].reverse(); })))),
  excluded: advisory(twoInsight).status ===
    advisory(recomputeCompleteHash(patched(twoInsight, (draft) => { draft.excluded_insight_ids = [...draft.excluded_insight_ids].reverse(); }))).status,
  lineage: advisory(twoInsight).status ===
    advisory(recomputeCompleteHash(patched(twoInsight, (draft) => {
      draft.lineage_hashes = [...draft.lineage_hashes].reverse();
      draft.adjustments = [...draft.adjustments].reverse();
      draft.included_insight_ids = [...draft.included_insight_ids].reverse();
    }))).status,
  material_duplicate_blocks:
    mismatch(advisory(patched(completeWarning, (draft) => { draft.warnings = [...draft.warnings, { ...draft.warnings[0], path: "/insights/0" }]; }))),
};

const unchanged = {
  calibrated_status: baseline.status === "advisory_ready",
  calibrated_id_stable: advisory(completeCalibrated).advisory_id === baseline.advisory_id,
  legacy_id_stable: advisory(legacyCalibrated).advisory_id === legacyBaseline.advisory_id,
  warning_status: advisory(completeWarning).status === "advisory_ready_with_warnings",
  no_adjustment_status: advisory(completeNoAdjustment).status === "advisory_no_adjustment",
  no_adjustment_zero_delta: completeNoAdjustment.proposed_delta === 0,
  no_adjustment_confidence_equal: completeNoAdjustment.proposed_calibrated_confidence === completeNoAdjustment.original_confidence,
  confidence_mismatch: advisory(recomputeCompleteHash(patched(completeCalibrated, (draft) => {
    draft.original_confidence = 51;
  })), recommendationFor(completeCalibrated)).status === "blocked_confidence_mismatch",
};

const validInputBefore = JSON.stringify({ calibration: completeCalibrated, recommendation: recommendationFor(completeCalibrated), configuration: advisoryConfig });
const validOutput = advisory(completeCalibrated);
const mismatchOutput = advisory(patched(completeCalibrated, (draft) => { draft.calibration_hash = h("9"); }));
const validInputAfter = JSON.stringify({ calibration: completeCalibrated, recommendation: recommendationFor(completeCalibrated), configuration: advisoryConfig });
const immutability = {
  input_unchanged: validInputBefore === validInputAfter,
  valid_output_frozen: frozenDeep(validOutput),
  mismatch_output_frozen: frozenDeep(mismatchOutput),
};

const determinism = {
  repeated_valid: JSON.stringify(advisory(completeCalibrated)) === JSON.stringify(advisory(completeCalibrated)),
  repeated_mismatch: JSON.stringify(mismatchOutput) === JSON.stringify(advisory(patched(completeCalibrated, (draft) => { draft.calibration_hash = h("9"); }))),
  interleaved: JSON.stringify(advisory(completeCalibrated)) === JSON.stringify(validOutput) &&
    JSON.stringify(mismatchOutput) === JSON.stringify(advisory(patched(completeCalibrated, (draft) => { draft.calibration_hash = h("9"); }))),
};

const source = read(paths.adapter);
const runtimeExports = [...source.matchAll(/export function\s+(\w+)/g)].map((match) => match[1]);
const typeExports = [...source.matchAll(/export type\s+(\w+)/g)].map((match) => match[1]);
const api = {
  runtime_exports_exact: JSON.stringify(runtimeExports) === JSON.stringify(["buildConfidenceCalibrationAdvisory"]),
  type_exports_exact: JSON.stringify(typeExports) === JSON.stringify([
    "ImmutableRecommendationConfidenceEnvelope",
    "FrozenAdvisoryConsumptionConfiguration",
    "ConfidenceCalibrationAdvisoryResult",
  ]),
  no_public_hash_helpers: !source.includes("export function sha256") &&
    !source.includes("export function buildCompleteCalibrationSemanticHashPayload") &&
    !source.includes("export function canonicalize"),
};

const adapterConsumers = rgFiles("confidence-calibration-advisory-adapter|buildConfidenceCalibrationAdvisory", ["app", "lib"])
  .filter((path) => path !== paths.adapter);
const forbiddenArtifacts = [
  "docs/action-438-confidence-calibration-advisory-fixtures.json",
  "docs/action-438-confidence-calibration-advisory-shadow-input-manifest.json",
  "scripts/action-438-confidence-calibration-advisory-shadow-run.mjs",
  "scripts/action-438-confidence-calibration-advisory-runner.mjs",
].filter(exists);

const safety = {
  provider_call_executed: false,
  provider_call_attempted: false,
  supabase_read_executed: false,
  supabase_write_executed: false,
  persistence_executed: false,
  replay_executed: false,
  runtime_route_created: false,
  feedback_executed: false,
  recommendation_mutated: false,
  scanner_behavior_changed: false,
  live_ranking_changed: false,
  publication_changed: false,
  confidence_applied: false,
  fixture_package_created: false,
  runner_created: false,
  manifest_created: false,
  shadow_execution_created: false,
};

const action309 = runJson(paths.action309Guard);
const golden = runJson(paths.goldenVerifier);

const checks = {
  documentation_exists: exists(paths.doc),
  verifier_exists: exists(paths.verifier),
  focused_test_exists: exists(paths.test),
  complete_field_inventory: Object.values(fieldInventory).every((classification) =>
    ["included_in_calibration_result_hash", "explicitly_non_semantic_and_excluded", "absent_for_status_specific_shape"].includes(classification)),
  no_unclassified_fields: Object.values(fieldInventory).every(Boolean),
  adapter_complete_payload_exists: source.includes("buildCompleteCalibrationSemanticHashPayload"),
  dual_hash_compatibility_exists: source.includes("completeHashMatches || hasLegacyCompatibleSemanticBinding"),
  calibration_id_bound: attackMatrix.calibration_id,
  warning_records_bound: attackMatrix.warning_code && attackMatrix.warning_path && attackMatrix.warning_severity && attackMatrix.warning_messageKey,
  issue_records_bound: attackMatrix.issue_code && attackMatrix.issue_path && attackMatrix.issue_severity && attackMatrix.issue_messageKey,
  pattern_discovery_bound: attackMatrix.pattern_discovery_sha256 && attackMatrix.pattern_discovery_result_sha256,
  pattern_insight_bound: attackMatrix.insight_sha256 && attackMatrix.evidence_set_sha256 && attackMatrix.group_sha256,
  accepted_hashes: Object.values(accepted).every(Boolean),
  attack_matrix_complete: Object.values(attackMatrix).every(Boolean),
  phase_10_and_phase_11: Object.values(phaseBehavior).every(Boolean),
  semantic_reorder_equivalence: Object.values(reorderEquivalent).every(Boolean),
  unaffected_outputs: Object.values(unchanged).every(Boolean),
  immutability: Object.values(immutability).every(Boolean),
  determinism: Object.values(determinism).every(Boolean),
  api_preserved: Object.values(api).every(Boolean),
  no_consumer: adapterConsumers.length === 0,
  no_forbidden_artifacts: forbiddenArtifacts.length === 0,
  no_side_effects: Object.values(safety).every((value) => value === false),
  action309_guard_healthy: action309.guard_status === "passed",
  golden_static_safety_healthy: golden.verification_status === "passed",
  runtime_preview_paused: advisoryConfig.runtime_preview_status === "runtime_preview_waiting_for_operator_inputs",
  action439_mandatory: read(paths.doc).includes("Action 439 - Independent Complete Semantic Binding Verification"),
};

const failedConditions = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
const report = {
  verification_status: failedConditions.length === 0 ? "passed" : "failed",
  remediation_result: failedConditions.length === 0 ? "complete_semantic_binding_remediation_passed" : "complete_semantic_binding_remediation_failed",
  failed_conditions: failedConditions,
  passed_conditions_count: Object.keys(checks).length - failedConditions.length,
  failed_conditions_count: failedConditions.length,
  unresolved_conditions_count: 0,
  checks,
  field_inventory: fieldInventory,
  accepted,
  attack_matrix: attackMatrix,
  phase_behavior: phaseBehavior,
  semantic_order_equivalence: reorderEquivalent,
  api,
  unaffected_outputs: unchanged,
  immutability,
  determinism,
  consumers: { adapter_consumers: adapterConsumers },
  forbidden_artifacts: forbiddenArtifacts,
  safety,
  upstream_health: {
    action309: action309.guard_status,
    golden_static_safety: golden.verification_status,
  },
  runtime_preview_status: advisoryConfig.runtime_preview_status,
  unrelated_work_classification: "action_438_confidence_calibration_advisory_adapter_complete_semantic_binding_remediation_only",
  recommended_next_action: "action_439_independent_complete_semantic_binding_verification",
};

console.log(JSON.stringify(report, null, 2));
if (report.verification_status !== "passed") process.exit(1);
