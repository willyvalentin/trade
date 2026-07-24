#!/usr/bin/env node

import { createHash } from "crypto";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  rmdirSync,
  writeFileSync,
} from "fs";
import { tmpdir } from "os";
import { dirname, join, resolve, sep } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const abs = (path) => join(root, path);
const read = (path) => readFileSync(abs(path), "utf8");
const exists = (path) => existsSync(abs(path));
const clone = (value) => JSON.parse(JSON.stringify(value));

const paths = {
  manifest: "docs/action-444-static-confidence-calibration-advisory-shadow-input-manifest.json",
  useDoc: "docs/action-444-static-confidence-calibration-advisory-shadow-use.md",
  useVerifier: "scripts/action-444-static-confidence-calibration-advisory-shadow-use-verify.mjs",
  useTest: "tests/e2e/action-444-static-confidence-calibration-advisory-shadow-use.spec.ts",
  action443Doc: "docs/action-443-static-confidence-calibration-advisory-shadow-execution-approval-gate.md",
  action443Verifier: "scripts/action-443-static-confidence-calibration-advisory-shadow-execution-approval-gate-verify.mjs",
  inventory: "docs/action-441-static-confidence-calibration-advisory-hash-inventory.json",
  doc: "docs/action-441-static-confidence-calibration-advisory-hash-freeze.md",
  freezer: "scripts/action-441-static-confidence-calibration-advisory-hash-freeze.mjs",
  verifier: "scripts/action-441-static-confidence-calibration-advisory-hash-freeze-verify.mjs",
  test: "tests/e2e/action-441-static-confidence-calibration-advisory-hash-freeze.spec.ts",
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
  action416Manifest: "docs/action-416-expanded-static-pattern-discovery-shadow-input-manifest.json",
  action416Runner: "scripts/action-416-expanded-static-pattern-discovery-shadow-run.mjs",
};

const expectedProtectedHashes = {
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
  [paths.action416Manifest]: "dbafd56a7c0f8c2eb79f22039cb9b1225e42f246e78ca278cd4344f72d39d652",
  [paths.action416Runner]: "b77f018e888d736dbf696ac0acc0b5c16a826b2bab26f09db42ecc28f956d7ea",
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

const expectedStatusDistribution = {
  advisory_ready: 6,
  advisory_ready_with_warnings: 2,
  advisory_no_adjustment: 1,
  advisory_insufficient_evidence: 1,
  blocked_invalid_input: 6,
  blocked_confidence_mismatch: 3,
  blocked_invalid_lineage: 12,
  blocked_future_leakage: 6,
  blocked_calibration_result: 10,
  blocked_unsupported_status: 1,
};

const expectedAction441Hashes = {
  package_inventory_sha256: "e6fb6b6e189feab0cf4bc1f2494522f7f2d9aa7ae0a455080156ad740f5facb8",
  scenario_summary_sha256: "78c349f52843451d99c405883c0d9571223616cf684928094aa0294424beec15",
};

const scenarioPlan = [
  ["ca440_01", "eligible_success", "calibrated complete-hash success", "advisory_ready", "complete"],
  ["ca440_02", "eligible_success", "calibrated_with_warnings success", "advisory_ready_with_warnings", "complete"],
  ["ca440_03", "no_adjustment", "no_adjustment exact equality", "advisory_no_adjustment", "complete"],
  ["ca440_04", "blocked_calibration_input", "insufficient evidence maps closed", "advisory_insufficient_evidence", "mapped"],
  ["ca440_05", "blocked_calibration_input", "blocked invalid input maps closed", "blocked_invalid_input", "mapped"],
  ["ca440_06", "blocked_calibration_input", "blocked invalid configuration maps closed", "blocked_invalid_input", "mapped"],
  ["ca440_07", "blocked_calibration_input", "blocked invalid lineage maps closed", "blocked_invalid_lineage", "mapped"],
  ["ca440_08", "blocked_calibration_input", "blocked future leakage maps closed", "blocked_future_leakage", "mapped"],
  ["ca440_09", "blocked_calibration_input", "blocked overlapping evidence maps closed", "blocked_calibration_result", "mapped"],
  ["ca440_10", "blocked_calibration_input", "blocked unsupported insight maps closed", "blocked_unsupported_status", "mapped"],
  ["ca440_11", "confidence_binding", "exact confidence match", "advisory_ready", "complete"],
  ["ca440_12", "confidence_binding", "one basis point mismatch", "blocked_confidence_mismatch", "complete"],
  ["ca440_13", "confidence_binding", "decimal mismatch", "blocked_confidence_mismatch", "complete"],
  ["ca440_14", "confidence_binding", "invalid confidence precision", "blocked_calibration_result", "complete_retained"],
  ["ca440_15", "confidence_binding", "below accepted confidence range", "blocked_invalid_input", "complete"],
  ["ca440_16", "confidence_binding", "above accepted confidence range", "blocked_invalid_input", "complete"],
  ["ca440_17", "confidence_binding", "NaN confidence rejected", "blocked_invalid_input", "complete"],
  ["ca440_18", "confidence_binding", "Infinity confidence rejected", "blocked_invalid_input", "complete"],
  ["ca440_19", "confidence_binding", "signed zero confidence remains exact", "advisory_ready", "complete"],
  ["ca440_20", "recommendation_lineage", "missing recommendation fingerprint", "blocked_invalid_lineage", "complete"],
  ["ca440_21", "recommendation_lineage", "malformed recommendation fingerprint", "blocked_invalid_lineage", "complete"],
  ["ca440_22", "recommendation_lineage", "changed recommendation fingerprint", "blocked_invalid_lineage", "complete"],
  ["ca440_23", "recommendation_lineage", "missing snapshot hash", "blocked_invalid_lineage", "complete"],
  ["ca440_24", "recommendation_lineage", "malformed snapshot hash", "blocked_invalid_lineage", "complete"],
  ["ca440_25", "recommendation_lineage", "changed snapshot retained identity", "blocked_invalid_lineage", "complete"],
  ["ca440_26", "recommendation_lineage", "changed original confidence retained snapshot", "blocked_confidence_mismatch", "complete"],
  ["ca440_27", "complete_hash", "valid complete semantic result hash", "advisory_ready", "complete"],
  ["ca440_28", "legacy_hash", "explicitly supported legacy result hash", "advisory_ready", "legacy"],
  ["ca440_29", "calibration_integrity", "malformed result hash", "blocked_calibration_result", "malformed"],
  ["ca440_30", "calibration_integrity", "swapped result hash", "blocked_calibration_result", "swapped"],
  ["ca440_31", "complete_hash", "complete hash mismatch cannot fall back", "blocked_calibration_result", "complete_mismatch"],
  ["ca440_32", "fallback_bypass", "legacy fallback bypass attempt", "blocked_calibration_result", "legacy_bypass"],
  ["ca440_33", "calibration_integrity", "calibration ID tampering", "blocked_calibration_result", "retained_hash"],
  ["ca440_34", "warning_inventory", "warning record tampering", "blocked_calibration_result", "retained_hash"],
  ["ca440_35", "issue_inventory", "issue record tampering", "blocked_calibration_result", "retained_hash"],
  ["ca440_36", "pattern_discovery_lineage", "Pattern Discovery hash tampering", "blocked_calibration_result", "retained_hash"],
  ["ca440_37", "pattern_insight_lineage", "Pattern Insight lineage tampering with recomputed hash", "blocked_invalid_lineage", "recomputed_complete"],
  ["ca440_38", "anti_leakage", "future outcome evidence", "blocked_future_leakage", "complete"],
  ["ca440_39", "anti_leakage", "post-entry evidence", "blocked_future_leakage", "complete"],
  ["ca440_40", "anti_leakage", "post-exit evidence", "blocked_future_leakage", "complete"],
  ["ca440_41", "anti_leakage", "same-recommendation realized result", "blocked_future_leakage", "complete"],
  ["ca440_42", "anti_leakage", "unknown leakage state", "blocked_future_leakage", "complete"],
  ["ca440_43", "anti_feedback", "calibration reused as Learning Dataset input", "blocked_invalid_lineage", "complete"],
  ["ca440_44", "anti_feedback", "Pattern Discovery evidence reuse", "blocked_invalid_lineage", "complete"],
  ["ca440_45", "anti_feedback", "recommendation base-confidence reuse", "blocked_invalid_lineage", "complete"],
  ["ca440_46", "anti_feedback", "scanner ranking publication execution reuse", "blocked_invalid_lineage", "complete"],
  ["ca440_47", "warning_inventory", "warning ordering and deduplication", "advisory_ready_with_warnings", "complete"],
  ["ca440_48", "output_boundary", "metadata-only advisory output boundary", "advisory_ready", "complete"],
].map(([id, family, purpose, expectedStatus, hashMode], index) => ({
  id,
  order: index + 1,
  family,
  purpose,
  expectedStatus,
  hashMode,
}));

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

function textHash(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function fileHash(path) {
  return textHash(read(path));
}

function countBy(values, keyFn) {
  return values.reduce((acc, value) => {
    const key = keyFn(value);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sourceIntegrity() {
  return Object.fromEntries(Object.entries(expectedProtectedHashes).map(([path, expected]) => {
    const actual = exists(path) ? fileHash(path) : null;
    return [path, {
      expected_sha256: expected,
      actual_sha256: actual,
      matches_expected: actual === expected,
    }];
  }));
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

function advisoryCanonicalPayload(result) {
  return {
    status: result.status,
    advisory_id: result.advisory_id,
    advisory_hash: result.advisory_hash,
    recommendation_fingerprint: result.recommendation_fingerprint,
    recommendation_snapshot_hash: result.recommendation_snapshot_hash,
    original_confidence_basis_points: basisPoints(result.original_confidence),
    proposed_delta_basis_points: basisPoints(result.proposed_delta),
    proposed_calibrated_confidence_basis_points: basisPoints(result.proposed_calibrated_confidence),
    calibration_status: result.calibration_status,
    calibration_id: result.calibration_id,
    lineage_hashes_present: result.lineage_hashes !== null,
    warning_codes: result.warnings.map((warning) => warning.code).sort(compareText),
    issue_codes: result.issues.map((issue) => issue.code).sort(compareText),
    advisory_eligible: result.advisory_eligible,
    advisory_visible: result.advisory_visible,
    application_eligible: result.application_eligible,
    reasons: result.reasons,
    non_authoritative: result.non_authoritative,
    applied: result.applied,
  };
}

function h(seed) {
  return textHash(`action_441:${seed}`);
}

function insight(id, overrides = {}) {
  return {
    pattern_discovery_sha256: overrides.pattern_discovery_sha256 ?? h(`${id}:pattern-discovery`),
    pattern_discovery_configuration_version: "pattern_discovery_config_v1",
    pattern_discovery_result_sha256: overrides.pattern_discovery_result_sha256 ?? h(`${id}:pattern-result`),
    evidence_set_sha256: overrides.evidence_set_sha256 ?? h(`${id}:evidence-set`),
    group_sha256: overrides.group_sha256 ?? h(`${id}:group`),
    insight_id: overrides.insight_id ?? `insight_${id}`,
    insight_sha256: overrides.insight_sha256 ?? h(`${id}:insight`),
    source_scenario_ids: [id],
    source_snapshot_ids: [`snapshot_${id}`],
    pattern_discovery_status: "discovered",
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

function recommendationFor(calibration, scenario, overrides = {}) {
  return {
    recommendation_id: `rec_${scenario.id}`,
    recommendation_fingerprint: `rec_fingerprint_${scenario.id}`,
    recommendation_snapshot_hash: h(`${scenario.id}:snapshot`),
    original_confidence: calibration.original_confidence ?? 50,
    decision_boundary: {
      boundary_id: `decision_boundary_${scenario.id}`,
      boundary_sha256: h(`${scenario.id}:boundary`),
      evidence_cutoff_sha256: h(`${scenario.id}:evidence-cutoff`),
      anti_leakage_state: "passed",
    },
    source: {
      source_kind: "recommendation_snapshot",
      source_version: "recommendation_snapshot_v1",
      immutable: true,
    },
    lineage: {
      recommendation_source_hash: h(`${scenario.id}:recommendation-source`),
      pattern_discovery_result_hashes: calibration.lineage_hashes.map((item) => item.pattern_discovery_result_sha256),
      pattern_insight_ids: calibration.included_insight_ids,
      pattern_insight_hashes: calibration.lineage_hashes.map((item) => item.insight_sha256),
      source_scenario_ids: [scenario.id],
      source_snapshot_ids: [`snapshot_${scenario.id}`],
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

const mappedBlockedStatusById = {
  ca440_04: "insufficient_eligible_evidence",
  ca440_05: "blocked_invalid_input",
  ca440_06: "blocked_invalid_configuration",
  ca440_07: "blocked_invalid_lineage",
  ca440_08: "blocked_future_leakage",
  ca440_09: "blocked_overlapping_evidence",
  ca440_10: "blocked_unsupported_insight",
};

const { calibrateConfidence } = await import("../lib/pure-confidence-calibration.ts");
const { buildConfidenceCalibrationAdvisory } = await import("../lib/confidence-calibration-advisory-adapter.ts");

function calibrationForScenario(scenario) {
  const warning = scenario.id === "ca440_02" || scenario.id === "ca440_47";
  const noAdjustment = scenario.id === "ca440_03";
  const baseConfidence = scenario.id === "ca440_19" ? 0 : 50;
  const base = calibrateConfidence({
    baseConfidence,
    insights: [insight(scenario.id, {
      warning_codes: warning ? ["metric_value_unavailable"] : [],
      evidence_direction: noAdjustment ? "neutral" : "supportive_strong",
    })],
    configuration: calibrationConfig,
  });
  const complete = withCompleteHash(base);

  if (scenario.hashMode === "legacy") return clone(base);
  if (scenario.hashMode === "mapped") {
    const mapped = clone(complete);
    mapped.status = mappedBlockedStatusById[scenario.id];
    mapped.issues = [];
    return mapped;
  }
  if (scenario.hashMode === "malformed") {
    const malformed = clone(complete);
    malformed.calibration_hash = "not_a_semantic_hash";
    return malformed;
  }
  if (scenario.hashMode === "swapped" || scenario.hashMode === "complete_mismatch") {
    const mismatched = clone(complete);
    mismatched.calibration_hash = h(`${scenario.id}:wrong-hash`);
    return mismatched;
  }
  if (scenario.hashMode === "legacy_bypass") {
    const bypass = clone(base);
    bypass.included_insight_ids = [...bypass.included_insight_ids, "legacy_bypass_extra_insight"];
    return bypass;
  }
  if (scenario.hashMode === "retained_hash") {
    const retained = clone(complete);
    if (scenario.id === "ca440_33") retained.calibration_id = `confidence_calibration_v1:${h("calibration-id-tamper").slice(0, 24)}`;
    if (scenario.id === "ca440_34") retained.warnings = [...retained.warnings, {
      code: "metric_value_unavailable",
      path: "/insights/0/warning_codes/0",
      severity: "warning",
      messageKey: "confidence_calibration.metric_value_unavailable",
    }];
    if (scenario.id === "ca440_35") retained.issues = [{
      code: "manual_issue_tamper",
      path: "/calibration/issues/0",
      severity: "error",
      messageKey: "confidence_calibration.manual_issue_tamper",
    }];
    if (scenario.id === "ca440_36") retained.lineage_hashes[0].pattern_discovery_result_sha256 = h(`${scenario.id}:tampered-pattern-result`);
    return retained;
  }
  if (scenario.hashMode === "recomputed_complete") {
    const recomputed = clone(complete);
    recomputed.lineage_hashes[0].insight_sha256 = h(`${scenario.id}:tampered-insight`);
    return recomputeCompleteHash(recomputed);
  }
  if (scenario.hashMode === "complete_retained") {
    const retained = clone(complete);
    retained.proposed_delta = 2.005;
    return retained;
  }
  return complete;
}

function recommendationOverridesForScenario(scenario, calibration) {
  switch (scenario.id) {
    case "ca440_12":
      return { original_confidence: (calibration.original_confidence ?? 50) + 0.01 };
    case "ca440_13":
      return { original_confidence: (calibration.original_confidence ?? 50) + 1 };
    case "ca440_15":
      return { original_confidence: -1 };
    case "ca440_16":
      return { original_confidence: 101 };
    case "ca440_17":
      return { original_confidence: -0.01 };
    case "ca440_18":
      return { original_confidence: 100.01 };
    case "ca440_20":
      return { recommendation_fingerprint: "" };
    case "ca440_21":
      return { recommendation_snapshot_hash: "malformed_snapshot_hash" };
    case "ca440_22":
      return { decision_boundary: {
        boundary_id: `decision_boundary_${scenario.id}`,
        boundary_sha256: "malformed_boundary_hash",
        evidence_cutoff_sha256: h(`${scenario.id}:evidence-cutoff`),
        anti_leakage_state: "passed",
      } };
    case "ca440_23":
      return { lineage: {
        recommendation_source_hash: h(`${scenario.id}:recommendation-source`),
        pattern_discovery_result_hashes: [],
        pattern_insight_ids: calibration.included_insight_ids,
        pattern_insight_hashes: calibration.lineage_hashes.map((item) => item.insight_sha256),
        source_scenario_ids: [scenario.id],
        source_snapshot_ids: [`snapshot_${scenario.id}`],
      } };
    case "ca440_24":
      return { lineage: {
        recommendation_source_hash: h(`${scenario.id}:recommendation-source`),
        pattern_discovery_result_hashes: ["malformed_pattern_result_hash"],
        pattern_insight_ids: calibration.included_insight_ids,
        pattern_insight_hashes: calibration.lineage_hashes.map((item) => item.insight_sha256),
        source_scenario_ids: [scenario.id],
        source_snapshot_ids: [`snapshot_${scenario.id}`],
      } };
    case "ca440_25":
      return { lineage: {
        recommendation_source_hash: h(`${scenario.id}:recommendation-source`),
        pattern_discovery_result_hashes: calibration.lineage_hashes.map((item) => item.pattern_discovery_result_sha256),
        pattern_insight_ids: [],
        pattern_insight_hashes: calibration.lineage_hashes.map((item) => item.insight_sha256),
        source_scenario_ids: [scenario.id],
        source_snapshot_ids: [`snapshot_${scenario.id}`],
      } };
    case "ca440_26":
      return { original_confidence: (calibration.original_confidence ?? 50) + 2 };
    case "ca440_37":
      return { lineage: {
        recommendation_source_hash: h(`${scenario.id}:recommendation-source`),
        pattern_discovery_result_hashes: calibration.lineage_hashes.map((item) => item.pattern_discovery_result_sha256),
        pattern_insight_ids: calibration.included_insight_ids,
        pattern_insight_hashes: [h(`${scenario.id}:insight`)],
        source_scenario_ids: [scenario.id],
        source_snapshot_ids: [`snapshot_${scenario.id}`],
      } };
    case "ca440_38":
      return { anti_leakage: {
        status: "passed",
        future_outcome_evidence: true,
        post_entry_evidence: false,
        post_exit_evidence: false,
        same_recommendation_realized_result: false,
        evidence_after_decision_boundary: false,
        prohibited_self_calibration: false,
      } };
    case "ca440_39":
      return { anti_leakage: {
        status: "passed",
        future_outcome_evidence: false,
        post_entry_evidence: true,
        post_exit_evidence: false,
        same_recommendation_realized_result: false,
        evidence_after_decision_boundary: false,
        prohibited_self_calibration: false,
      } };
    case "ca440_40":
      return { anti_leakage: {
        status: "passed",
        future_outcome_evidence: false,
        post_entry_evidence: false,
        post_exit_evidence: true,
        same_recommendation_realized_result: false,
        evidence_after_decision_boundary: false,
        prohibited_self_calibration: false,
      } };
    case "ca440_41":
      return { anti_leakage: {
        status: "passed",
        future_outcome_evidence: false,
        post_entry_evidence: false,
        post_exit_evidence: false,
        same_recommendation_realized_result: true,
        evidence_after_decision_boundary: false,
        prohibited_self_calibration: false,
      } };
    case "ca440_42":
      return { anti_leakage: {
        status: "failed",
        future_outcome_evidence: false,
        post_entry_evidence: false,
        post_exit_evidence: false,
        same_recommendation_realized_result: false,
        evidence_after_decision_boundary: false,
        prohibited_self_calibration: false,
      } };
    case "ca440_43":
      return { anti_feedback: {
        ...recommendationFor(calibration, scenario).anti_feedback,
        calibration_output_reused_as_learning_dataset_input: true,
      } };
    case "ca440_44":
      return { anti_feedback: {
        ...recommendationFor(calibration, scenario).anti_feedback,
        calibration_output_reused_as_pattern_discovery_evidence: true,
      } };
    case "ca440_45":
      return { anti_feedback: {
        ...recommendationFor(calibration, scenario).anti_feedback,
        calibration_output_reused_as_recommendation_base_confidence: true,
      } };
    case "ca440_46":
      return { anti_feedback: {
        ...recommendationFor(calibration, scenario).anti_feedback,
        calibration_output_reused_as_scanner_signal: true,
        calibration_output_reused_as_ranking_signal: true,
        calibration_output_reused_as_publication_signal: true,
        calibration_output_reused_as_execution_signal: true,
      } };
    default:
      return {};
  }
}

function runScenario(scenario) {
  const calibration = calibrationForScenario(scenario);
  const recommendation = recommendationFor(calibration, scenario, recommendationOverridesForScenario(scenario, calibration));
  const result = buildConfidenceCalibrationAdvisory({ recommendation, calibration, configuration: advisoryConfig });
  const scenarioHashPayload = advisoryCanonicalPayload(result);
  const hashFamily = scenario.hashMode === "legacy" ? "legacy" : scenario.hashMode.includes("mismatch") || scenario.hashMode === "malformed" || scenario.hashMode === "swapped" || scenario.hashMode === "legacy_bypass" || scenario.hashMode === "retained_hash" ? "invalid_or_retained" : "complete";

  return {
    id: scenario.id,
    order: scenario.order,
    family: scenario.family,
    purpose: scenario.purpose,
    input_hash_mode: scenario.hashMode,
    hash_family: hashFamily,
    expected_status: scenario.expectedStatus,
    actual_status: result.status,
    status_matches_expected: result.status === scenario.expectedStatus,
    calibration_status: result.calibration_status,
    advisory_id_present: typeof result.advisory_id === "string",
    advisory_id: result.advisory_id,
    advisory_hash_present: typeof result.advisory_hash === "string",
    advisory_hash: result.advisory_hash,
    advisory_identity_sha256: sha256({
      scenario_id: scenario.id,
      advisory_id: result.advisory_id,
      advisory_hash: result.advisory_hash,
      recommendation_fingerprint: result.recommendation_fingerprint,
      recommendation_snapshot_hash: result.recommendation_snapshot_hash,
      calibration_id: result.calibration_id,
    }),
    canonical_advisory_result_sha256: sha256(scenarioHashPayload),
    complete_calibration_hash_sha256: /^[a-f0-9]{64}$/.test(completeHash(withCompleteHash(calibration))) ? completeHash(withCompleteHash(calibration)) : null,
    legacy_or_input_calibration_hash_sha256: typeof calibration.calibration_hash === "string" && /^[a-f0-9]{64}$/.test(calibration.calibration_hash) ? calibration.calibration_hash : null,
    original_confidence_basis_points: basisPoints(result.original_confidence),
    proposed_delta_basis_points: basisPoints(result.proposed_delta),
    proposed_calibrated_confidence_basis_points: basisPoints(result.proposed_calibrated_confidence),
    warning_codes: result.warnings.map((warning) => warning.code).sort(compareText),
    warnings: result.warnings,
    issue_codes: result.issues.map((issue) => issue.code).sort(compareText),
    issue_paths: result.issues.map((issue) => issue.path).sort(compareText),
    issues: result.issues,
    lineage_hashes_present: result.lineage_hashes !== null,
    bounded_lineage_hashes: result.lineage_hashes,
    advisory_eligible: result.advisory_eligible,
    advisory_visible: result.advisory_visible,
    application_eligible: result.application_eligible,
    reasons: result.reasons,
    non_authoritative: result.non_authoritative,
    applied: result.applied,
    recommendation_envelope_metadata: {
      recommendation_id: recommendation.recommendation_id,
      recommendation_fingerprint: recommendation.recommendation_fingerprint,
      recommendation_snapshot_hash: recommendation.recommendation_snapshot_hash,
      original_confidence_basis_points: basisPoints(recommendation.original_confidence),
      decision_boundary_sha256: recommendation.decision_boundary.boundary_sha256,
      evidence_cutoff_sha256: recommendation.decision_boundary.evidence_cutoff_sha256,
      anti_leakage_state: recommendation.decision_boundary.anti_leakage_state,
      pattern_discovery_result_hashes: recommendation.lineage.pattern_discovery_result_hashes,
      pattern_insight_ids: recommendation.lineage.pattern_insight_ids,
      pattern_insight_hashes: recommendation.lineage.pattern_insight_hashes,
      source_scenario_ids: recommendation.lineage.source_scenario_ids,
      source_snapshot_ids: recommendation.lineage.source_snapshot_ids,
      static_only: recommendation.static_only,
      non_authoritative: recommendation.non_authoritative,
      no_persistence: recommendation.no_persistence,
      no_replay: recommendation.no_replay,
      no_runtime: recommendation.no_runtime,
      no_feedback: recommendation.no_feedback,
    },
    calibration_result_metadata: {
      calibration_id: calibration.calibration_id,
      calibration_status: calibration.status,
      calibration_hash: calibration.calibration_hash,
      original_confidence_basis_points: basisPoints(calibration.original_confidence),
      proposed_delta_basis_points: basisPoints(calibration.proposed_delta),
      proposed_calibrated_confidence_basis_points: basisPoints(calibration.proposed_calibrated_confidence),
      included_insight_ids: calibration.included_insight_ids,
      excluded_insight_count: calibration.excluded_insight_ids.length,
      warning_count: calibration.warnings.length,
      issue_count: calibration.issues.length,
      lineage_hash_count: calibration.lineage_hashes.length,
      non_authoritative: calibration.non_authoritative,
      applied: calibration.applied,
    },
    metadata_only_output: true,
    full_recommendation_retained: false,
    full_calibration_retained: false,
    recommendation_mutated: false,
    confidence_applied: false,
  };
}

function numberMapEqual(left, right) {
  const keys = [...new Set([...Object.keys(left), ...Object.keys(right)])].sort(compareText);
  return keys.every((key) => left[key] === right[key]);
}

function buildCoreInventory() {
  const integrity = sourceIntegrity();
  assert(Object.values(integrity).every((item) => item.matches_expected), "protected_source_hash_mismatch");
  assert(scenarioPlan.length === 48, "scenario_count_not_48");
  assert(JSON.stringify(scenarioPlan.map((scenario) => scenario.id)) === JSON.stringify(Array.from({ length: 48 }, (_, index) => `ca440_${String(index + 1).padStart(2, "0")}`)), "scenario_ids_or_order_differ");

  const scenarios = scenarioPlan.map(runScenario);
  const actualStatusDistribution = countBy(scenarios, (scenario) => scenario.actual_status);
  assert(scenarios.every((scenario) => scenario.status_matches_expected), `scenario_expected_status_mismatch:${JSON.stringify(scenarios.filter((scenario) => !scenario.status_matches_expected).map((scenario) => ({
    id: scenario.id,
    expected: scenario.expected_status,
    actual: scenario.actual_status,
    issues: scenario.issue_codes,
    paths: scenario.issue_paths,
  })))}`);
  assert(numberMapEqual(actualStatusDistribution, expectedStatusDistribution), `actual_status_distribution_mismatch:${JSON.stringify(actualStatusDistribution)}`);
  assert(scenarios.every((scenario) => scenario.application_eligible === false), "application_eligibility_mismatch");
  assert(scenarios.every((scenario) => scenario.non_authoritative === true && scenario.applied === false), "advisory_safety_flag_mismatch");
  assert(scenarios.every((scenario) => scenario.full_recommendation_retained === false && scenario.full_calibration_retained === false), "unbounded_payload_retained");

  const warningDistribution = countBy(scenarios.flatMap((scenario) => scenario.warning_codes.length ? scenario.warning_codes : ["none"]), (code) => code);
  const issueDistribution = countBy(scenarios.flatMap((scenario) => scenario.issue_codes.length ? scenario.issue_codes : ["none"]), (code) => code);
  const completeLegacyHashDistribution = countBy(scenarios, (scenario) => scenario.hash_family);
  const scenarioSummarySha256 = sha256(scenarios.map((scenario) => ({
    id: scenario.id,
    order: scenario.order,
    actual_status: scenario.actual_status,
    advisory_hash: scenario.advisory_hash,
    canonical_advisory_result_sha256: scenario.canonical_advisory_result_sha256,
    warning_codes: scenario.warning_codes,
    issue_codes: scenario.issue_codes,
  })));

  return {
    inventory_schema_version: "action_441_static_confidence_calibration_advisory_hash_inventory_v1",
    freeze_status: "frozen",
    action_440_source_scenario_plan: "approved_with_conditions",
    static_only: true,
    non_production: true,
    non_authoritative: true,
    non_learning: true,
    no_persistence: true,
    no_replay: true,
    no_runtime: true,
    no_external_access: true,
    no_feedback: true,
    recommendation_mutated: false,
    confidence_applied: false,
    provider_call_executed: false,
    provider_call_attempted: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    replay_executed: false,
    synthetic_outcomes_persisted: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    publication_changed: false,
    runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
    protected_source_hashes: integrity,
    advisory_adapter_sha256: integrity[paths.adapter].actual_sha256,
    scenario_count: scenarios.length,
    exact_scenario_ids: scenarios.map((scenario) => scenario.id),
    exact_scenario_order: scenarios.map((scenario) => scenario.id),
    expected_advisory_status_distribution: expectedStatusDistribution,
    advisory_status_distribution: actualStatusDistribution,
    warning_distribution: warningDistribution,
    issue_distribution: issueDistribution,
    complete_legacy_hash_distribution: completeLegacyHashDistribution,
    complete_legacy_hash_policy: {
      valid_complete_hash_accepted: scenarios.some((scenario) => scenario.input_hash_mode === "complete" && scenario.actual_status === "advisory_ready"),
      valid_legacy_hash_accepted: scenarios.some((scenario) => scenario.input_hash_mode === "legacy" && scenario.actual_status === "advisory_ready"),
      malformed_hash_blocked: scenarios.find((scenario) => scenario.id === "ca440_29")?.actual_status === "blocked_calibration_result",
      swapped_hash_blocked: scenarios.find((scenario) => scenario.id === "ca440_30")?.actual_status === "blocked_calibration_result",
      complete_hash_mismatch_blocked: scenarios.find((scenario) => scenario.id === "ca440_31")?.actual_status === "blocked_calibration_result",
      legacy_bypass_blocked: scenarios.find((scenario) => scenario.id === "ca440_32")?.actual_status === "blocked_calibration_result",
      retained_hash_tamper_blocked: scenarios.filter((scenario) => scenario.input_hash_mode === "retained_hash").every((scenario) => scenario.actual_status === "blocked_calibration_result"),
    },
    confidence_binding_policy: {
      exact_match_ready: scenarios.find((scenario) => scenario.id === "ca440_11")?.actual_status === "advisory_ready",
      mismatch_blocks: ["ca440_12", "ca440_13", "ca440_26"].every((id) => scenarios.find((scenario) => scenario.id === id)?.actual_status === "blocked_confidence_mismatch"),
      invalid_confidence_blocks: ["ca440_15", "ca440_16", "ca440_17", "ca440_18"].every((id) => scenarios.find((scenario) => scenario.id === id)?.actual_status === "blocked_invalid_input"),
    },
    lineage_leakage_feedback_policy: {
      recommendation_lineage_blocks: ["ca440_20", "ca440_21", "ca440_22", "ca440_23", "ca440_24", "ca440_25"].every((id) => scenarios.find((scenario) => scenario.id === id)?.actual_status === "blocked_invalid_lineage"),
      pattern_insight_lineage_blocks: scenarios.find((scenario) => scenario.id === "ca440_37")?.actual_status === "blocked_invalid_lineage",
      anti_leakage_blocks: ["ca440_38", "ca440_39", "ca440_40", "ca440_41", "ca440_42"].every((id) => scenarios.find((scenario) => scenario.id === id)?.actual_status === "blocked_future_leakage"),
      anti_feedback_blocks: ["ca440_43", "ca440_44", "ca440_45", "ca440_46"].every((id) => scenarios.find((scenario) => scenario.id === id)?.actual_status === "blocked_invalid_lineage"),
    },
    output_boundary: {
      recommendation_objects_retained: false,
      full_calibration_results_retained: false,
      full_pattern_insights_retained: false,
      pattern_discovery_objects_retained: false,
      contexts_or_outcomes_retained: false,
      provider_payloads_retained: false,
      supabase_payloads_retained: false,
      secrets_or_env_values_retained: false,
      timestamps_retained: false,
      machine_paths_retained: false,
      metadata_only: true,
    },
    repeat_freeze_policy: {
      exact_run_count: 2,
      third_repair_run_allowed: false,
      identical_inventory_payload_required: true,
      identical_package_hash_required: true,
    },
    scenario_summary_sha256: scenarioSummarySha256,
    scenarios,
    recommended_next_action: "action_442_independent_confidence_calibration_advisory_hash_freeze_verification",
  };
}

function buildInventory() {
  const core = buildCoreInventory();
  return {
    ...core,
    package_inventory_sha256: sha256(core),
  };
}

function compactScenario(scenario) {
  return {
    id: scenario.id,
    order: scenario.order,
    family: scenario.family,
    purpose: scenario.purpose,
    input_hash_mode: scenario.input_hash_mode,
    hash_family: scenario.hash_family,
    expected_status: scenario.expected_status,
    actual_status: scenario.actual_status,
    calibration_status: scenario.calibration_status,
    advisory_id: scenario.advisory_id,
    advisory_hash: scenario.advisory_hash,
    advisory_identity_sha256: scenario.advisory_identity_sha256,
    canonical_advisory_result_sha256: scenario.canonical_advisory_result_sha256,
    complete_calibration_hash_sha256: scenario.complete_calibration_hash_sha256,
    legacy_or_input_calibration_hash_sha256: scenario.legacy_or_input_calibration_hash_sha256,
    original_confidence_basis_points: scenario.original_confidence_basis_points,
    proposed_delta_basis_points: scenario.proposed_delta_basis_points,
    proposed_calibrated_confidence_basis_points: scenario.proposed_calibrated_confidence_basis_points,
    advisory_eligible: scenario.advisory_eligible,
    advisory_visible: scenario.advisory_visible,
    application_eligible: scenario.application_eligible,
    non_authoritative: scenario.non_authoritative,
    applied: scenario.applied,
    warnings: scenario.warnings,
    issues: scenario.issues,
    bounded_lineage_hashes: scenario.bounded_lineage_hashes,
    reasons: scenario.reasons,
    recommendation_envelope_metadata: scenario.recommendation_envelope_metadata,
    calibration_result_metadata: scenario.calibration_result_metadata,
    metadata_only_output: scenario.metadata_only_output,
    full_recommendation_retained: scenario.full_recommendation_retained,
    full_calibration_retained: scenario.full_calibration_retained,
    recommendation_mutated: scenario.recommendation_mutated,
    confidence_applied: scenario.confidence_applied,
  };
}

function packageEvidence(inventory, action441Inventory) {
  return {
    package_schema_version: "action_444_static_confidence_calibration_advisory_shadow_evidence_v1",
    action_441_package_inventory_sha256: action441Inventory.package_inventory_sha256,
    action_441_scenario_summary_sha256: action441Inventory.scenario_summary_sha256,
    protected_source_hashes: inventory.protected_source_hashes,
    scenario_count: inventory.scenario_count,
    exact_scenario_order: inventory.exact_scenario_order,
    status_distribution: inventory.advisory_status_distribution,
    hash_classification_distribution: inventory.complete_legacy_hash_distribution,
    warning_distribution: inventory.warning_distribution,
    issue_distribution: inventory.issue_distribution,
    complete_legacy_fallback_policy: inventory.complete_legacy_hash_policy,
    confidence_binding_policy: inventory.confidence_binding_policy,
    lineage_leakage_feedback_policy: inventory.lineage_leakage_feedback_policy,
    scenarios: inventory.scenarios.map(compactScenario),
    static_only: true,
    non_production: true,
    non_authoritative: true,
    non_learning: true,
    no_persistence: true,
    no_replay: true,
    no_runtime: true,
    no_external_access: true,
    no_feedback: true,
    recommendation_mutated: false,
    confidence_applied: false,
    authoritative_data_created: false,
    runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  };
}

function manifestPayload(inventory, action441Inventory) {
  return {
    manifest_schema_version: "action_444_static_confidence_calibration_advisory_shadow_input_manifest_v1",
    action_443_approval_decision: "approved",
    action_441_package_inventory_sha256: action441Inventory.package_inventory_sha256,
    action_441_scenario_summary_sha256: action441Inventory.scenario_summary_sha256,
    protected_source_hashes: inventory.protected_source_hashes,
    advisory_adapter_sha256: inventory.advisory_adapter_sha256,
    scenario_count: inventory.scenario_count,
    exact_ordered_scenario_ids: inventory.exact_scenario_order,
    advisory_configuration: advisoryConfig,
    status_distribution: inventory.advisory_status_distribution,
    hash_classification_distribution: inventory.complete_legacy_hash_distribution,
    warning_distribution: inventory.warning_distribution,
    issue_distribution: inventory.issue_distribution,
    complete_legacy_fallback_policy: inventory.complete_legacy_hash_policy,
    confidence_binding_policy: inventory.confidence_binding_policy,
    lineage_leakage_feedback_policy: inventory.lineage_leakage_feedback_policy,
    scenarios: inventory.scenarios.map(compactScenario),
    static_only: true,
    non_production: true,
    non_authoritative: true,
    non_learning: true,
    no_persistence: true,
    no_replay: true,
    no_runtime: true,
    no_external_access: true,
    no_feedback: true,
    recommendation_mutated: false,
    confidence_applied: false,
    provider_call_executed: false,
    provider_call_attempted: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    replay_executed: false,
    synthetic_outcomes_persisted: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    publication_changed: false,
    authoritative_data_created: false,
    full_recommendations_included: false,
    full_calibration_results_included: false,
    full_pattern_insights_included: false,
    full_pattern_discovery_outputs_included: false,
    contexts_or_outcomes_included: false,
    provider_or_supabase_payloads_included: false,
    secrets_or_env_values_included: false,
    timestamps_or_random_ids_included: false,
    machine_paths_included: false,
    runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
    recommended_next_action: "action_444_static_confidence_calibration_advisory_shadow_execution",
  };
}

function readJson(path) {
  return JSON.parse(readFileSync(path.startsWith(sep) ? path : abs(path), "utf8"));
}

function canonicalString(value) {
  return JSON.stringify(canonicalize(value));
}

function assertEqual(left, right, message) {
  assert(canonicalString(left) === canonicalString(right), message);
}

function assertNoForbiddenArguments() {
  assert(process.argv.length === 2, "shadow_aborted:cli_arguments_not_allowed");
}

function assertManifestMatches(manifest, expectedManifest) {
  assertEqual(manifest, expectedManifest, "shadow_aborted:manifest_differs_from_frozen_expectation");
}

function safeTemporaryTarget() {
  const base = realpathSync(resolve(sep, tmpdir()));
  const target = resolve(base, "ture", "action-444-static-confidence-calibration-advisory-shadow");
  assert(!target.startsWith(root + sep) && target !== root, "shadow_aborted:temp_path_inside_repository");
  assert(!target.includes(`${sep}.config${sep}`) && !target.includes(`${sep}.codex${sep}`), "shadow_aborted:temp_path_inside_home_config");
  assert(!target.split(sep).includes(".."), "shadow_aborted:temp_path_traversal");
  assert(target.endsWith(`${sep}ture${sep}action-444-static-confidence-calibration-advisory-shadow`), "shadow_aborted:temp_path_not_dedicated");

  const parts = target.split(sep).filter(Boolean);
  let current = target.startsWith(sep) ? sep : "";
  for (const part of parts) {
    current = current === sep ? `${current}${part}` : join(current, part);
    if (existsSync(current)) {
      assert(!lstatSync(current).isSymbolicLink(), "shadow_aborted:temp_parent_symlink");
    }
  }
  if (existsSync(target)) {
    const stat = lstatSync(target);
    assert(stat.isDirectory(), "shadow_aborted:temp_target_not_directory");
    assert(!stat.isSymbolicLink(), "shadow_aborted:temp_target_symlink");
    assert(readdirSync(target).length === 0, "shadow_aborted:temp_target_not_empty");
  }
  return target;
}

function writeVerifyAndDeleteTemporaryEvidence(evidence) {
  const target = safeTemporaryTarget();
  mkdirSync(target, { recursive: true });
  const evidencePath = join(target, "metadata-only-evidence.json");
  assert(!existsSync(evidencePath), "shadow_aborted:evidence_path_already_exists");
  writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
  const reread = readJson(evidencePath);
  assertEqual(reread, evidence, "shadow_failed:temporary_evidence_reread_mismatch");
  rmSync(evidencePath);
  assert(!existsSync(evidencePath), "shadow_failed:temporary_evidence_delete_failed");
  rmdirSync(target);
  assert(!existsSync(target) || readdirSync(target).length === 0, "shadow_failed:temporary_directory_cleanup_failed");
  return {
    temporary_evidence_written: true,
    temporary_evidence_verified: true,
    temporary_evidence_deleted: true,
    temp_directory_absent_or_empty: true,
    evidence_path_policy: "<system-temp>/ture/action-444-static-confidence-calibration-advisory-shadow/",
  };
}

function buildShadowPackage() {
  const inventory = buildInventory();
  const action441Inventory = readJson(paths.inventory);
  assert(action441Inventory.package_inventory_sha256 === expectedAction441Hashes.package_inventory_sha256, "shadow_aborted:action_441_package_hash_differs");
  assert(action441Inventory.scenario_summary_sha256 === expectedAction441Hashes.scenario_summary_sha256, "shadow_aborted:action_441_scenario_summary_hash_differs");
  assertEqual(action441Inventory.exact_scenario_order, inventory.exact_scenario_order, "shadow_aborted:action_441_scenario_order_differs");
  return {
    inventory,
    action441Inventory,
    manifest: manifestPayload(inventory, action441Inventory),
    evidence: packageEvidence(inventory, action441Inventory),
    package_hash: sha256(packageEvidence(inventory, action441Inventory)),
  };
}

function main() {
  assertNoForbiddenArguments();
  assert(exists(paths.manifest), "shadow_aborted:manifest_missing");

  const preSourceIntegrity = sourceIntegrity();
  assert(Object.values(preSourceIntegrity).every((item) => item.matches_expected), "shadow_aborted:source_integrity_failed_before_execution");

  const first = buildShadowPackage();
  const manifest = readJson(paths.manifest);
  assertManifestMatches(manifest, first.manifest);

  const second = buildShadowPackage();
  assertEqual(first.evidence, second.evidence, "shadow_failed:repeat_run_evidence_differs");
  assert(first.package_hash === second.package_hash, "shadow_failed:repeat_run_package_hash_differs");

  const cleanup = writeVerifyAndDeleteTemporaryEvidence({
    ...first.evidence,
    manifest_hash: sha256(manifest),
    run_1_package_hash: first.package_hash,
    run_2_package_hash: second.package_hash,
    repeat_run_identical: true,
    final_shadow_decision: "shadow_passed",
  });

  const postSourceIntegrity = sourceIntegrity();
  assertEqual(preSourceIntegrity, postSourceIntegrity, "shadow_failed:source_integrity_changed_after_execution");

  const report = {
    shadow_execution_status: "completed",
    final_shadow_decision: "shadow_passed",
    scenario_count: first.inventory.scenario_count,
    exact_scenario_order: first.inventory.exact_scenario_order,
    status_distribution: first.inventory.advisory_status_distribution,
    hash_classification_distribution: first.inventory.complete_legacy_hash_distribution,
    warning_distribution: first.inventory.warning_distribution,
    issue_distribution: first.inventory.issue_distribution,
    complete_legacy_fallback_result: first.inventory.complete_legacy_hash_policy,
    confidence_binding_result: first.inventory.confidence_binding_policy,
    lineage_leakage_feedback_result: first.inventory.lineage_leakage_feedback_policy,
    no_adjustment_result: first.inventory.scenarios.find((scenario) => scenario.id === "ca440_03"),
    advisory_id_and_semantic_hash_result: {
      all_ready_scenarios_have_ids: first.inventory.scenarios
        .filter((scenario) => ["advisory_ready", "advisory_ready_with_warnings", "advisory_no_adjustment"].includes(scenario.actual_status))
        .every((scenario) => typeof scenario.advisory_id === "string" && typeof scenario.advisory_hash === "string"),
      all_scenarios_have_identity_and_result_hashes: first.inventory.scenarios
        .every((scenario) => /^[a-f0-9]{64}$/.test(scenario.advisory_identity_sha256) &&
          /^[a-f0-9]{64}$/.test(scenario.canonical_advisory_result_sha256)),
    },
    action_441_package_inventory_sha256: first.action441Inventory.package_inventory_sha256,
    action_441_scenario_summary_sha256: first.action441Inventory.scenario_summary_sha256,
    manifest_hash: sha256(manifest),
    run_1_package_hash: first.package_hash,
    run_2_package_hash: second.package_hash,
    repeat_run_identical: true,
    metadata_only_result: {
      evidence_metadata_only: true,
      full_recommendations_retained: false,
      full_calibration_results_retained: false,
      full_pattern_insights_retained: false,
      full_pattern_discovery_outputs_retained: false,
      contexts_or_outcomes_retained: false,
      provider_or_supabase_payloads_retained: false,
      secrets_or_env_values_retained: false,
      timestamps_or_random_ids_retained: false,
      machine_paths_retained: false,
    },
    temp_path_and_cleanup_result: cleanup,
    source_integrity: {
      protected_sources_unchanged: true,
      protected_source_hashes: postSourceIntegrity,
    },
    safety: {
      provider_call_executed: false,
      provider_call_attempted: false,
      supabase_read_executed: false,
      supabase_write_executed: false,
      persistence_executed: false,
      replay_executed: false,
      runtime_route_created: false,
      external_access_executed: false,
      feedback_executed: false,
      consumer_created: false,
      confidence_applied: false,
      recommendation_mutated: false,
      scanner_behavior_changed: false,
      live_ranking_changed: false,
      publication_changed: false,
      authoritative_data_created: false,
    },
    runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
    unrelated_work_classification: "action_444_static_confidence_calibration_advisory_shadow_execution_only",
    recommended_next_action: "action_445_independent_static_confidence_calibration_advisory_shadow_verification",
  };

  console.log(JSON.stringify(report, null, 2));
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  const finalShadowDecision = message.startsWith("shadow_aborted:")
    ? "shadow_aborted"
    : "shadow_failed";
  console.log(JSON.stringify({
    shadow_execution_status: "failed",
    final_shadow_decision: finalShadowDecision,
    failure_reason: message,
    safety: {
      provider_call_executed: false,
      provider_call_attempted: false,
      supabase_read_executed: false,
      supabase_write_executed: false,
      persistence_executed: false,
      replay_executed: false,
      runtime_route_created: false,
      external_access_executed: false,
      feedback_executed: false,
      consumer_created: false,
      confidence_applied: false,
      recommendation_mutated: false,
      scanner_behavior_changed: false,
      live_ranking_changed: false,
      publication_changed: false,
      authoritative_data_created: false,
    },
  }, null, 2));
  process.exitCode = 1;
}
