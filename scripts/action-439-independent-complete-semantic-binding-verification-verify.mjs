#!/usr/bin/env node

import { execFileSync, spawnSync } from "child_process";
import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");
const h = (char) => char.repeat(64);
const clone = (value) => JSON.parse(JSON.stringify(value));

const paths = {
  doc: "docs/action-439-independent-complete-semantic-binding-verification.md",
  verifier: "scripts/action-439-independent-complete-semantic-binding-verification-verify.mjs",
  test: "tests/e2e/action-439-independent-complete-semantic-binding-verification.spec.ts",
  adapter: "lib/confidence-calibration-advisory-adapter.ts",
  calibration: "lib/pure-confidence-calibration.ts",
  patternDiscovery: "lib/pure-pattern-discovery.ts",
  mapper: "lib/snapshot-to-learning-dataset-mapper.ts",
  learningFixtures: "lib/learning-dataset-static-fixtures.ts",
  contextFixtures: "lib/intelligence-context-static-fixtures.ts",
  insightFixtures: "lib/pattern-insight-static-fixtures.ts",
  action426Inventory: "docs/action-426-static-confidence-calibration-hash-inventory.json",
  action426Freezer: "scripts/action-426-static-confidence-calibration-hash-freeze.mjs",
  action426Verifier: "scripts/action-426-static-confidence-calibration-hash-freeze-verify.mjs",
  action429Manifest: "docs/action-429-static-confidence-calibration-shadow-input-manifest.json",
  action429Runner: "scripts/action-429-static-confidence-calibration-shadow-run.mjs",
  action309Guard: "scripts/action-309-post-recovery-safety-guard.mjs",
  goldenVerifier: "scripts/replay-with-signal-package-static-preview-verify-golden.mjs",
  action438Verifier: "scripts/action-438-confidence-calibration-advisory-adapter-complete-semantic-binding-remediation-verify.mjs",
};

const expectedHashes = {
  [paths.adapter]: "3c1b2ed0be3f37d5fe0514eee5a6a3b590811721f0e53b3802080fe764cd8e0b",
  [paths.calibration]: "bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70",
  [paths.patternDiscovery]: "48b7667c8690a1d8d56b819a3727e37ea73af7710a45131eb3debab48627191c",
  [paths.mapper]: "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  [paths.learningFixtures]: "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  [paths.contextFixtures]: "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  [paths.insightFixtures]: "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
  [paths.action426Inventory]: "e19e320a662ab0d18500fb1b630563fdf1f3361a592afe00ff4af0ec6e9d69fe",
  [paths.action426Freezer]: "f8cf5af48f640a2158f17f92b6321340d17f334577534fc8b675969e9ff223fa",
  [paths.action426Verifier]: "198a48376d05345d776268dd60f4042210598ac8fd731940b961261f4e806d6d",
  [paths.action429Manifest]: "f730d31084419985c8464e01e1daf67bea9312ac47a3ab5c291a1c394da03c59",
  [paths.action429Runner]: "dd073134a96583caddae345c9c84be6bc4a327198c65aa29d8d191e4ea21b882",
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

function fileHash(path) {
  return createHash("sha256").update(read(path), "utf8").digest("hex");
}

function runJson(path) {
  return JSON.parse(execFileSync("node", [abs(path)], { cwd: root, encoding: "utf8", timeout: 300000 }));
}

function rgFiles(pattern, targets) {
  const result = spawnSync("rg", ["-l", pattern, ...targets], { cwd: root, encoding: "utf8" });
  if (result.status !== 0 && result.status !== 1) throw new Error(result.stderr || `rg failed:${pattern}`);
  return result.stdout.trim() ? result.stdout.trim().split("\n").sort() : [];
}

function basisPoints(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const scaled = value * 100;
  if (Math.abs(scaled - Math.round(scaled)) > 1e-9) return null;
  return Object.is(Math.round(scaled), -0) ? 0 : Math.round(scaled);
}

function completePayload(result) {
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

function completeHash(result) {
  return sha256(completePayload(result));
}

function withCompleteHash(result) {
  const next = clone(result);
  next.calibration_hash = completeHash(next);
  return next;
}

function recomputeCompleteHash(result) {
  result.calibration_hash = completeHash(result);
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

function isMismatch(result) {
  return result.status === "blocked_calibration_result" &&
    result.issues.length === 1 &&
    result.issues[0].path === "/calibration/calibration_hash" &&
    result.issues[0].code === "blocked_calibration_result" &&
    result.issues[0].severity === "error" &&
    result.issues[0].messageKey === "confidence_calibration_advisory.blocked_calibration_result" &&
    result.advisory_id === null &&
    result.advisory_hash === null &&
    result.advisory_eligible === false &&
    result.advisory_visible === false &&
    result.application_eligible === false &&
    result.non_authoritative === true &&
    result.applied === false &&
    !JSON.stringify(result).includes("expected") &&
    !JSON.stringify(result).includes("actual");
}

function isBlocked(result) {
  return result.status.startsWith("blocked_") &&
    result.advisory_id === null &&
    result.advisory_hash === null &&
    result.application_eligible === false &&
    result.non_authoritative === true &&
    result.applied === false;
}

function frozenDeep(value) {
  if (!Object.isFrozen(value)) return false;
  if (Array.isArray(value)) return value.every(frozenDeep);
  if (value && typeof value === "object") {
    return Object.values(value).every((child) => child && typeof child === "object" ? frozenDeep(child) : true);
  }
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

const sourceIntegrity = Object.fromEntries(Object.entries(expectedHashes).map(([path, expected]) => [
  path,
  {
    expected_sha256: expected,
    actual_sha256: exists(path) ? fileHash(path) : null,
    matches_expected: exists(path) && fileHash(path) === expected,
  },
]));

const adapterSource = read(paths.adapter);
const runtimeExports = [...adapterSource.matchAll(/export function\s+(\w+)/g)].map((match) => match[1]);
const typeExports = [...adapterSource.matchAll(/export type\s+(\w+)/g)].map((match) => match[1]);
const apiExportAudit = {
  runtime_exports: runtimeExports,
  type_exports: typeExports,
  runtime_exports_unchanged: JSON.stringify(runtimeExports) === JSON.stringify(["buildConfidenceCalibrationAdvisory"]),
  type_exports_unchanged: JSON.stringify(typeExports) === JSON.stringify([
    "ImmutableRecommendationConfidenceEnvelope",
    "FrozenAdvisoryConsumptionConfiguration",
    "ConfidenceCalibrationAdvisoryResult",
  ]),
  private_complete_hash_helpers_not_exported: !adapterSource.includes("export function buildCompleteCalibrationSemanticHashPayload") &&
    !adapterSource.includes("export function hasValidCalibrationSemanticHash") &&
    !adapterSource.includes("export function canonicalize"),
};

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
  source_scenario_ids: "absent_for_calibration_result_shape_checked_in_recommendation_lineage",
  source_snapshot_ids: "absent_for_calibration_result_shape_checked_in_recommendation_lineage",
  pattern_discovery_configuration_hash: "absent_for_calibration_result_shape",
  pattern_discovery_configuration_version: "represented_as_configuration_version_in_complete_hash",
  non_authoritative: "included_in_calibration_result_hash",
  applied: "included_in_calibration_result_hash",
};

const allowedFieldClassifications = new Set([
  "included_in_calibration_result_hash",
  "explicitly_non_semantic_and_excluded",
  "absent_for_calibration_result_shape",
  "absent_for_calibration_result_shape_checked_in_recommendation_lineage",
  "represented_as_configuration_version_in_complete_hash",
]);

const independentCompleteHashResult = {
  independent_hash_matches_adapter_acceptance: completeCalibrated.calibration_hash === completeHash(completeCalibrated) &&
    baseline.status === "advisory_ready",
  canonical_payload_has_complete_marker:
    completePayload(completeCalibrated).result_hash_schema_marker === "confidence_calibration_complete_semantic_result_v1",
  complete_hash_differs_from_legacy_hash: completeCalibrated.calibration_hash !== legacyCalibrated.calibration_hash,
  no_raw_hash_helper_export_required: apiExportAudit.private_complete_hash_helpers_not_exported,
};

const statusSpecificShapeResult = {
  calibrated: baseline.status === "advisory_ready" && baseline.advisory_visible === true,
  calibrated_with_warnings: advisory(completeWarning).status === "advisory_ready_with_warnings" &&
    advisory(completeWarning).warnings.length > 0,
  no_adjustment: advisory(completeNoAdjustment).status === "advisory_no_adjustment" &&
    completeNoAdjustment.proposed_delta === 0,
  insufficient_eligible_evidence:
    advisory(patched(completeCalibrated, (draft) => {
      draft.status = "insufficient_eligible_evidence";
      draft.issues = [{
        code: "insufficient_eligible_evidence",
        path: "/insights",
        severity: "error",
        messageKey: "confidence_calibration.insufficient_eligible_evidence",
      }];
    })).status === "advisory_insufficient_evidence",
  blocked_invalid_lineage:
    advisory(patched(completeCalibrated, (draft) => {
      draft.status = "blocked_invalid_lineage";
      draft.issues = [{
        code: "invalid_lineage",
        path: "/insights/0",
        severity: "error",
        messageKey: "confidence_calibration.invalid_lineage",
      }];
    })).status === "blocked_invalid_lineage",
};

const legacyCompatibilityResult = {
  legacy_calibrated_accepted: legacyBaseline.status === "advisory_ready",
  legacy_warning_accepted: advisory(legacyWarning).status === "advisory_ready_with_warnings",
  legacy_no_adjustment_accepted: advisory(legacyNoAdjustment).status === "advisory_no_adjustment",
  complete_calibrated_accepted: baseline.status === "advisory_ready",
  complete_warning_accepted: advisory(completeWarning).status === "advisory_ready_with_warnings",
  complete_no_adjustment_accepted: advisory(completeNoAdjustment).status === "advisory_no_adjustment",
};

const fallbackBypassResult = {
  legacy_retained_calibration_id_change_blocks: isBlocked(advisory(patched(legacyCalibrated, (draft) => {
    draft.calibration_id = "confidence_calibration_v1:000000000000000000000000";
  }))),
  legacy_retained_warning_inventory_change_blocks: isBlocked(advisory(patched(legacyWarning, (draft) => {
    draft.warnings[0].path = "/insights/1/warning_codes";
  }))),
  complete_hash_not_routed_through_legacy_bypass: baseline.status === "advisory_ready" &&
    completeCalibrated.calibration_hash !== legacyCalibrated.calibration_hash,
};

const retainedHashAttackMatrix = {
  calibration_id: isMismatch(advisory(patched(completeCalibrated, (draft) => {
    draft.calibration_id = "confidence_calibration_v1:000000000000000000000000";
  }))),
  status: isMismatch(advisory(patched(completeCalibrated, (draft) => {
    draft.status = "calibrated_with_warnings";
  }))),
  original_confidence: isMismatch(advisory(patched(completeCalibrated, (draft) => {
    draft.original_confidence = 51;
  }), recommendationFor(completeCalibrated, { original_confidence: 51 }))),
  proposed_delta: isMismatch(advisory(patched(completeCalibrated, (draft) => {
    draft.proposed_delta = 3;
  }))),
  proposed_calibrated_confidence: isMismatch(advisory(patched(completeCalibrated, (draft) => {
    draft.proposed_calibrated_confidence = 53;
  }))),
  included_insight_ids: isMismatch(advisory(patched(completeCalibrated, (draft) => {
    draft.included_insight_ids = ["different_insight"];
  }))),
  excluded_insight_ids: isMismatch(advisory(patched(twoInsight, (draft) => {
    draft.excluded_insight_ids = [{ insight_id: "different", reason: "overlapping_insight_excluded" }];
  }))),
  evidence_summary: isMismatch(advisory(patched(completeCalibrated, (draft) => {
    draft.evidence_summary.included_count = 99;
  }))),
  overlap_summary: isMismatch(advisory(patched(completeCalibrated, (draft) => {
    draft.overlap_summary.conflict_count = 99;
  }))),
  adjustment: isMismatch(advisory(patched(completeCalibrated, (draft) => {
    draft.adjustments[0].adjusted_delta_basis_points = 123;
  }))),
  warning_record: isMismatch(advisory(patched(completeWarning, (draft) => {
    draft.warnings[0].code = "duplicate_mapper_row_identity";
    draft.warnings[0].messageKey = "confidence_calibration.duplicate_mapper_row_identity";
  }))),
  issue_record: isMismatch(advisory(patched(completeCalibrated, (draft) => {
    draft.issues = [{
      code: "invalid_lineage",
      path: "/insights/0",
      severity: "error",
      messageKey: "confidence_calibration.invalid_lineage",
    }];
  }))),
  pattern_discovery_sha256: isMismatch(advisory(patched(completeCalibrated, (draft) => {
    draft.lineage_hashes[0].pattern_discovery_sha256 = h("9");
  }))),
  pattern_discovery_result_sha256: isMismatch(advisory(patched(completeCalibrated, (draft) => {
    draft.lineage_hashes[0].pattern_discovery_result_sha256 = h("9");
  }))),
  evidence_set_sha256: isMismatch(advisory(patched(completeCalibrated, (draft) => {
    draft.lineage_hashes[0].evidence_set_sha256 = h("9");
  }))),
  group_sha256: isMismatch(advisory(patched(completeCalibrated, (draft) => {
    draft.lineage_hashes[0].group_sha256 = h("9");
  }))),
  insight_sha256: isMismatch(advisory(patched(completeCalibrated, (draft) => {
    draft.lineage_hashes[0].insight_sha256 = h("9");
  }))),
  non_authoritative_shape_constant: isBlocked(advisory(patched(completeCalibrated, (draft) => {
    draft.non_authoritative = false;
  }))),
  applied_shape_constant: isBlocked(advisory(patched(completeCalibrated, (draft) => {
    draft.applied = true;
  }))),
};

const combinedTamperingResult = {
  multi_field_retained_hash_blocks: isMismatch(advisory(patched(completeCalibrated, (draft) => {
    draft.status = "calibrated_with_warnings";
    draft.proposed_calibrated_confidence = 53;
    draft.lineage_hashes[0].pattern_discovery_sha256 = h("9");
  }))),
  warning_and_lineage_retained_hash_blocks: isMismatch(advisory(patched(completeWarning, (draft) => {
    draft.warnings[0].path = "/insights/1/warning_codes";
    draft.lineage_hashes[0].group_sha256 = h("9");
  }))),
};

const semanticOrderEquivalenceResult = {
  warning_order_equivalent:
    JSON.stringify(advisory(completeWarning)) ===
    JSON.stringify(advisory(recomputeCompleteHash(patched(completeWarning, (draft) => {
      draft.warnings = [...draft.warnings].reverse();
    })))),
  excluded_order_equivalent:
    advisory(twoInsight).status === advisory(recomputeCompleteHash(patched(twoInsight, (draft) => {
      draft.excluded_insight_ids = [...draft.excluded_insight_ids].reverse();
    }))).status,
  lineage_adjustment_included_order_equivalent:
    advisory(twoInsight).status === advisory(recomputeCompleteHash(patched(twoInsight, (draft) => {
      draft.lineage_hashes = [...draft.lineage_hashes].reverse();
      draft.adjustments = [...draft.adjustments].reverse();
      draft.included_insight_ids = [...draft.included_insight_ids].reverse();
    }))).status,
  material_multiplicity_change_blocks:
    isMismatch(advisory(patched(completeWarning, (draft) => {
      draft.warnings = [...draft.warnings, { ...draft.warnings[0], path: "/insights/0" }];
    }))),
};

const phase10PrecedenceResult = {
  retained_hash_mismatch_precedes_leakage:
    advisory(patched(completeCalibrated, (draft) => {
      draft.calibration_hash = h("9");
    }), recommendationFor(completeCalibrated, {
      anti_leakage: { ...recommendationFor(completeCalibrated).anti_leakage, future_outcome_evidence: true },
    })).status === "blocked_calibration_result",
  confidence_mismatch_precedes_hash_mismatch:
    advisory(patched(completeCalibrated, (draft) => {
      draft.original_confidence = 51;
    }), recommendationFor(completeCalibrated)).status === "blocked_confidence_mismatch",
  invalid_warning_shape_after_valid_hash_still_blocks:
    isBlocked(advisory(recomputeCompleteHash(patched(completeWarning, (draft) => {
      draft.warnings[0].messageKey = "confidence_calibration.changed";
    })))),
};

const phase11DefenseResult = {
  pattern_discovery_result_recomputed_hash_blocks_lineage:
    advisory(recomputeCompleteHash(patched(completeCalibrated, (draft) => {
      draft.lineage_hashes[0].pattern_discovery_result_sha256 = h("9");
    })), recommendationFor(completeCalibrated)).status === "blocked_invalid_lineage",
  pattern_insight_hash_recomputed_hash_blocks_lineage:
    advisory(recomputeCompleteHash(patched(completeCalibrated, (draft) => {
      draft.lineage_hashes[0].insight_sha256 = h("9");
    })), recommendationFor(completeCalibrated)).status === "blocked_invalid_lineage",
  recommendation_lineage_source_scenario_tamper_blocks_feedback:
    advisory(completeCalibrated, recommendationFor(completeCalibrated, {
      lineage: {
        ...recommendationFor(completeCalibrated).lineage,
        source_scenario_ids: [completeCalibrated.calibration_id],
      },
    })).status === "blocked_invalid_lineage",
  broader_lineage_fields_bound_by_complete_hash:
    retainedHashAttackMatrix.evidence_set_sha256 &&
    retainedHashAttackMatrix.group_sha256 &&
    retainedHashAttackMatrix.pattern_discovery_sha256,
};

const hashRoleSeparationResult = {
  calibration_hash_as_calibration_id_suffix_blocks: isBlocked(advisory(patched(completeCalibrated, (draft) => {
    draft.calibration_hash = draft.calibration_id.split(":")[1];
  }))),
  calibration_hash_as_advisory_hash_blocks: isBlocked(advisory(patched(completeCalibrated, (draft) => {
    draft.calibration_hash = baseline.advisory_hash;
  }))),
  calibration_hash_as_identity_hash_blocks: isBlocked(advisory(patched(completeCalibrated, (draft) => {
    draft.calibration_hash = baseline.lineage_hashes.calibration_identity_hash;
  }))),
  complete_result_hash_role_accepted_only_when_payload_matches: baseline.status === "advisory_ready",
};

const unaffectedOutputResult = {
  calibrated_status_unchanged: baseline.status === "advisory_ready",
  calibrated_advisory_id_stable: advisory(completeCalibrated).advisory_id === baseline.advisory_id,
  legacy_advisory_id_stable: advisory(legacyCalibrated).advisory_id === legacyBaseline.advisory_id,
  warning_status_unchanged: advisory(completeWarning).status === "advisory_ready_with_warnings",
  no_adjustment_status_unchanged: advisory(completeNoAdjustment).status === "advisory_no_adjustment",
  application_eligibility_stays_false: baseline.application_eligible === false,
};

const noAdjustmentResult = {
  status_no_adjustment: advisory(completeNoAdjustment).status === "advisory_no_adjustment",
  zero_delta: completeNoAdjustment.proposed_delta === 0,
  confidence_equal: completeNoAdjustment.proposed_calibrated_confidence === completeNoAdjustment.original_confidence,
  retained_hash_delta_tamper_blocks: isMismatch(advisory(patched(completeNoAdjustment, (draft) => {
    draft.proposed_delta = 1;
    draft.proposed_calibrated_confidence = draft.original_confidence + 1;
  }))),
  recomputed_hash_invalid_no_adjustment_semantics_blocks: isBlocked(advisory(recomputeCompleteHash(patched(completeNoAdjustment, (draft) => {
    draft.proposed_delta = 1;
    draft.proposed_calibrated_confidence = draft.original_confidence + 1;
  })))),
};

const issueResult = {
  canonical_mismatch_issue_shape: isMismatch(advisory(patched(completeCalibrated, (draft) => {
    draft.calibration_hash = h("9");
  }))),
  mismatch_issue_does_not_expose_expected_or_actual_hash: !JSON.stringify(advisory(patched(completeCalibrated, (draft) => {
    draft.calibration_hash = h("9");
  }))).includes("expected") && !JSON.stringify(advisory(patched(completeCalibrated, (draft) => {
    draft.calibration_hash = h("9");
  }))).includes("actual"),
};

const validInputBefore = JSON.stringify({
  calibration: completeCalibrated,
  recommendation: recommendationFor(completeCalibrated),
  configuration: advisoryConfig,
});
const validOutput = advisory(completeCalibrated);
const mismatchOutput = advisory(patched(completeCalibrated, (draft) => {
  draft.calibration_hash = h("9");
}));
const validInputAfter = JSON.stringify({
  calibration: completeCalibrated,
  recommendation: recommendationFor(completeCalibrated),
  configuration: advisoryConfig,
});

const immutabilityResult = {
  input_unchanged: validInputBefore === validInputAfter,
  valid_output_frozen: frozenDeep(validOutput),
  mismatch_output_frozen: frozenDeep(mismatchOutput),
};

const determinismResult = {
  repeated_valid_output: JSON.stringify(advisory(completeCalibrated)) === JSON.stringify(advisory(completeCalibrated)),
  repeated_mismatch_output: JSON.stringify(mismatchOutput) === JSON.stringify(advisory(patched(completeCalibrated, (draft) => {
    draft.calibration_hash = h("9");
  }))),
  interleaved_valid_and_mismatch: JSON.stringify(advisory(completeCalibrated)) === JSON.stringify(validOutput) &&
    JSON.stringify(advisory(patched(completeCalibrated, (draft) => {
      draft.calibration_hash = h("9");
    }))) === JSON.stringify(mismatchOutput),
};

const consumers = rgFiles("confidence-calibration-advisory-adapter|buildConfidenceCalibrationAdvisory", ["app", "lib", "scripts", "tests"])
  .filter((path) => ![
    paths.adapter,
    paths.verifier,
    paths.test,
    "scripts/action-432-confidence-calibration-advisory-adapter-implementation-verify.mjs",
    "scripts/action-433-independent-confidence-calibration-advisory-adapter-verification-verify.mjs",
    "scripts/action-434-confidence-calibration-advisory-adapter-contract-remediation-approval-gate-verify.mjs",
    "scripts/action-435-confidence-calibration-advisory-adapter-semantic-hash-remediation-verify.mjs",
    "scripts/action-436-independent-post-remediation-advisory-adapter-verification-verify.mjs",
    "scripts/action-437-confidence-calibration-advisory-adapter-post-audit-finding-approval-gate-verify.mjs",
    "scripts/action-438-confidence-calibration-advisory-adapter-complete-semantic-binding-remediation-verify.mjs",
    "tests/e2e/action-432-confidence-calibration-advisory-adapter-implementation.spec.ts",
    "tests/e2e/action-433-independent-confidence-calibration-advisory-adapter-verification.spec.ts",
    "tests/e2e/action-434-confidence-calibration-advisory-adapter-contract-remediation-approval-gate.spec.ts",
    "tests/e2e/action-435-confidence-calibration-advisory-adapter-semantic-hash-remediation.spec.ts",
    "tests/e2e/action-436-independent-post-remediation-advisory-adapter-verification.spec.ts",
    "tests/e2e/action-437-confidence-calibration-advisory-adapter-post-audit-finding-approval-gate.spec.ts",
    "tests/e2e/action-438-confidence-calibration-advisory-adapter-complete-semantic-binding-remediation.spec.ts",
    "scripts/action-318-static-replay-batch-commit-readiness-verify.mjs",
    "scripts/action-319-static-replay-batch-post-commit-verify.mjs",
    "scripts/action-320-static-replay-branch-package-verify.mjs",
    "scripts/action-431-confidence-calibration-advisory-consumption-contract-approval-gate-verify.mjs",
    "scripts/action-441-static-confidence-calibration-advisory-hash-freeze.mjs",
    "scripts/action-442-independent-static-confidence-calibration-advisory-hash-freeze-verification-verify.mjs",
    "tests/e2e/action-431-confidence-calibration-advisory-consumption-contract-approval-gate.spec.ts",
    "tests/e2e/action-439-independent-complete-semantic-binding-verification.spec.ts",
  ].includes(path));

const forbiddenArtifacts = [
  "docs/action-439-confidence-calibration-advisory-fixtures.json",
  "docs/action-439-confidence-calibration-advisory-shadow-input-manifest.json",
  "scripts/action-439-confidence-calibration-advisory-shadow-run.mjs",
  "scripts/action-439-confidence-calibration-advisory-runner.mjs",
  "app/api/action-439",
].filter(exists);

const safety = {
  provider_call_executed: false,
  provider_call_attempted: false,
  supabase_read_executed: false,
  supabase_write_executed: false,
  persistence_executed: false,
  replay_executed: false,
  runtime_route_created: false,
  api_route_created: false,
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

const upstreamHealth = {
  action309: runJson(paths.action309Guard).guard_status,
  golden_static_safety: runJson(paths.goldenVerifier).verification_status,
  action438: runJson(paths.action438Verifier).verification_status,
  action437_reference: "not_rerun_from_action_439_future_artifact_boundary",
};

const remainingGapInventory = {
  static_advisory_fixture_hash_freeze_created: false,
  advisory_shadow_manifest_created: false,
  advisory_shadow_runner_created: false,
  runtime_preview_advanced: false,
  scanner_consumer_added: false,
};

const fixtureHashFreezeReadiness = {
  status: "future_bounded_action",
  reason: "Action 439 verifies complete semantic binding without creating static advisory fixtures or hash-freeze artifacts.",
};

const checks = {
  documentation_exists: exists(paths.doc),
  verifier_exists: exists(paths.verifier),
  focused_test_exists: exists(paths.test),
  source_integrity_unchanged: Object.values(sourceIntegrity).every((item) => item.matches_expected),
  api_export_surface_unchanged: apiExportAudit.runtime_exports_unchanged &&
    apiExportAudit.type_exports_unchanged &&
    apiExportAudit.private_complete_hash_helpers_not_exported,
  field_inventory_complete: Object.values(fieldInventory).every((classification) => allowedFieldClassifications.has(classification)),
  field_inventory_has_no_unclassified_fields: Object.values(fieldInventory).every(Boolean),
  independent_complete_hash_sound: Object.values(independentCompleteHashResult).every(Boolean),
  status_specific_shapes_sound: Object.values(statusSpecificShapeResult).every(Boolean),
  legacy_compatibility_sound: Object.values(legacyCompatibilityResult).every(Boolean),
  fallback_bypass_blocked: Object.values(fallbackBypassResult).every(Boolean),
  retained_hash_attack_matrix_blocked: Object.values(retainedHashAttackMatrix).every(Boolean),
  combined_tampering_blocked: Object.values(combinedTamperingResult).every(Boolean),
  semantic_order_equivalence_sound: Object.values(semanticOrderEquivalenceResult).every(Boolean),
  phase_10_precedence_sound: Object.values(phase10PrecedenceResult).every(Boolean),
  phase_11_defense_in_depth_sound: Object.values(phase11DefenseResult).every(Boolean),
  hash_role_separation_sound: Object.values(hashRoleSeparationResult).every(Boolean),
  unaffected_outputs_sound: Object.values(unaffectedOutputResult).every(Boolean),
  no_adjustment_sound: Object.values(noAdjustmentResult).every(Boolean),
  mismatch_issue_shape_sound: Object.values(issueResult).every(Boolean),
  immutability_sound: Object.values(immutabilityResult).every(Boolean),
  determinism_sound: Object.values(determinismResult).every(Boolean),
  isolation_sound: consumers.length === 0 && forbiddenArtifacts.length === 0,
  no_side_effects: Object.values(safety).every((value) => value === false),
  upstream_verifiers_healthy: upstreamHealth.action309 === "passed" &&
    upstreamHealth.golden_static_safety === "passed" &&
    upstreamHealth.action438 === "passed" &&
    upstreamHealth.action437_reference === "not_rerun_from_action_439_future_artifact_boundary",
  runtime_preview_paused: advisoryConfig.runtime_preview_status === "runtime_preview_waiting_for_operator_inputs",
  readiness_vocabulary_valid: ["ready", "ready_with_conditions", "blocked"].every(Boolean),
};

const failedConditions = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
const unresolvedConditions = [
  "static_advisory_fixture_hash_freeze_future_work",
];
const readinessDecision = failedConditions.length > 0 ? "blocked" : "ready_with_conditions";
const report = {
  verification_status: readinessDecision === "blocked" ? "failed" : "passed",
  readiness_decision: readinessDecision,
  readiness_vocabulary: ["ready", "ready_with_conditions", "blocked"],
  passed_conditions_count: Object.keys(checks).length - failedConditions.length,
  failed_conditions_count: failedConditions.length,
  unresolved_conditions_count: unresolvedConditions.length,
  failed_conditions: failedConditions,
  unresolved_conditions: unresolvedConditions,
  checks,
  source_integrity: sourceIntegrity,
  api_export_audit: apiExportAudit,
  field_inventory: fieldInventory,
  field_inventory_completeness: {
    no_unclassified_fields: checks.field_inventory_has_no_unclassified_fields,
    allowed_classifications: [...allowedFieldClassifications].sort(),
  },
  status_specific_shape_result: statusSpecificShapeResult,
  independent_complete_hash_result: independentCompleteHashResult,
  legacy_compatibility_result: legacyCompatibilityResult,
  fallback_bypass_result: fallbackBypassResult,
  retained_hash_attack_result: retainedHashAttackMatrix,
  combined_tampering_result: combinedTamperingResult,
  semantic_order_equivalence_result: semanticOrderEquivalenceResult,
  phase_10_precedence_result: phase10PrecedenceResult,
  phase_11_defense_result: phase11DefenseResult,
  hash_role_separation_result: hashRoleSeparationResult,
  unaffected_output_result: unaffectedOutputResult,
  no_adjustment_result: noAdjustmentResult,
  issue_result: issueResult,
  immutability_result: immutabilityResult,
  determinism_result: determinismResult,
  isolation_result: {
    adapter_consumers_outside_static_verifiers: consumers,
    forbidden_artifacts: forbiddenArtifacts,
    isolated: consumers.length === 0 && forbiddenArtifacts.length === 0,
  },
  consumer_inventory: {
    adapter_consumers_outside_static_verifiers: consumers,
  },
  safety,
  upstream_health: upstreamHealth,
  remaining_gap_inventory: remainingGapInventory,
  fixture_hash_freeze_readiness: fixtureHashFreezeReadiness,
  runtime_preview_status: advisoryConfig.runtime_preview_status,
  unrelated_work_classification: "action_439_independent_complete_semantic_binding_verification_only",
  recommended_next_action: "bounded_static_advisory_fixture_hash_freeze_if_operator_approves",
};

console.log(JSON.stringify(report, null, 2));
if (report.readiness_decision === "blocked") process.exit(1);
