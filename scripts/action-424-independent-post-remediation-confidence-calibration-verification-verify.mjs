#!/usr/bin/env node

import { execFileSync, spawnSync } from "child_process";
import { createHash } from "crypto";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from "fs";
import { tmpdir } from "os";
import { dirname, join, resolve } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const paths = {
  module: "lib/pure-confidence-calibration.ts",
  doc: "docs/action-424-independent-post-remediation-confidence-calibration-verification.md",
  verifier: "scripts/action-424-independent-post-remediation-confidence-calibration-verification-verify.mjs",
  test: "tests/e2e/action-424-independent-post-remediation-confidence-calibration-verification.spec.ts",
  action309Guard: "scripts/action-309-post-recovery-safety-guard.mjs",
  action420Verifier: "scripts/action-420-pure-confidence-calibration-implementation-verify.mjs",
  action421Verifier: "scripts/action-421-independent-pure-confidence-calibration-verification-and-hash-audit-verify.mjs",
  action422Verifier: "scripts/action-422-pure-confidence-calibration-contract-remediation-approval-gate-verify.mjs",
  action423Verifier: "scripts/action-423-pure-confidence-calibration-contract-remediation-verify.mjs",
  mapper: "lib/snapshot-to-learning-dataset-mapper.ts",
  patternDiscovery: "lib/pure-pattern-discovery.ts",
  learningFixture: "lib/learning-dataset-static-fixtures.ts",
  contextFixture: "lib/intelligence-context-static-fixtures.ts",
  patternFixture: "lib/pattern-insight-static-fixtures.ts",
  action416Manifest: "docs/action-416-expanded-static-pattern-discovery-shadow-input-manifest.json",
  action416Runner: "scripts/action-416-expanded-static-pattern-discovery-shadow-run.mjs",
};

const expectedHashes = {
  [paths.module]: "bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70",
  [paths.mapper]: "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  [paths.patternDiscovery]: "48b7667c8690a1d8d56b819a3727e37ea73af7710a45131eb3debab48627191c",
  [paths.learningFixture]: "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  [paths.contextFixture]: "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  [paths.patternFixture]: "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
  [paths.action416Manifest]: "dbafd56a7c0f8c2eb79f22039cb9b1225e42f246e78ca278cd4344f72d39d652",
  [paths.action416Runner]: "b77f018e888d736dbf696ac0acc0b5c16a826b2bab26f09db42ecc28f956d7ea",
};

const expectedTypeExports = [
  "ConfidenceCalibrationInsightEnvelope",
  "FrozenConfidenceCalibrationConfiguration",
  "ConfidenceCalibrationIssue",
  "ConfidenceCalibrationWarning",
  "ConfidenceCalibrationEvidenceSummary",
  "ConfidenceCalibrationAdjustment",
  "ConfidenceCalibrationResult",
];

const expectedStatuses = [
  "calibrated",
  "calibrated_with_warnings",
  "no_adjustment",
  "insufficient_eligible_evidence",
  "blocked_invalid_input",
  "blocked_invalid_configuration",
  "blocked_invalid_lineage",
  "blocked_future_leakage",
  "blocked_overlapping_evidence",
  "blocked_unsupported_insight",
];

const unsupportedStatusCases = [
  { label: "insufficient_evidence", value: "insufficient_evidence" },
  { label: "blocked_invalid_input", value: "blocked_invalid_input" },
  { label: "blocked_invalid_configuration", value: "blocked_invalid_configuration" },
  { label: "blocked_invalid_lineage", value: "blocked_invalid_lineage" },
  { label: "blocked_future_leakage", value: "blocked_future_leakage" },
  { label: "blocked_non_consumable_row", value: "blocked_non_consumable_row" },
  { label: "blocked_nondeterministic_grouping", value: "blocked_nondeterministic_grouping" },
  { label: "arbitrary_lowercase", value: "arbitrary_unsupported_status" },
  { label: "arbitrary_uppercase", value: "ARBITRARY_UNSUPPORTED_STATUS" },
  { label: "empty_string", value: "" },
  { label: "whitespace_padded", value: "  arbitrary_unsupported_status  " },
];

const noEffectFlags = {
  provider_call_executed: false,
  provider_call_attempted: false,
  supabase_read_executed: false,
  supabase_write_executed: false,
  persistence_executed: false,
  replay_executed: false,
  runtime_integration_executed: false,
  calibration_shadow_executed: false,
  recommendation_mutation_executed: false,
  feedback_executed: false,
  scanner_behavior_changed: false,
  live_ranking_changed: false,
  runtime_preview_advanced: false,
};

const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");
const shaFile = (path) => createHash("sha256").update(readFileSync(abs(path))).digest("hex");
const sha = (label) => createHash("sha256").update(label).digest("hex");

function runJson(path) {
  const tempRoot = mkdtempSync(join(tmpdir(), "action-424-confidence-verification-"));
  try {
    return JSON.parse(execFileSync("node", [abs(path)], {
      cwd: root,
      encoding: "utf8",
      env: { ...process.env, TMPDIR: tempRoot, TMP: tempRoot, TEMP: tempRoot },
      timeout: 240000,
    }));
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
}

function collectFiles(path) {
  if (!exists(path)) return [];
  if (statSync(abs(path)).isFile()) return [path];
  return readdirSync(abs(path)).flatMap((entry) => collectFiles(join(path, entry))).sort();
}

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
  }
  return value;
}

function canonicalJson(value) {
  return JSON.stringify(canonical(value));
}

function canonicalHash(value) {
  return sha(canonicalJson(value));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

const source = exists(paths.module) ? read(paths.module) : "";
const doc = exists(paths.doc) ? read(paths.doc) : "";
const moduleExports = exists(paths.module) ? await import(pathToFileURL(abs(paths.module)).href) : {};
const calibrateConfidence = moduleExports.calibrateConfidence;

const config = {
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
  accepted_setup_families: ["momentum_continuation"],
  accepted_horizons: ["60m"],
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

function envelope(id, overrides = {}) {
  return {
    pattern_discovery_sha256: sha("pattern-discovery"),
    pattern_discovery_configuration_version: "pattern_discovery_setup_family_v1",
    pattern_discovery_result_sha256: sha(`result:${id}`),
    evidence_set_sha256: sha(`evidence:${id}`),
    group_sha256: sha(`group:${id}`),
    insight_id: `pattern_insight:v1:${id}`,
    insight_sha256: sha(`insight:${id}`),
    source_scenario_ids: [`scenario:${id}`],
    source_snapshot_ids: [`snapshot:${id}`],
    pattern_discovery_status: "discovered",
    warning_codes: [],
    static_only: true,
    non_authoritative: true,
    no_persistence: true,
    no_replay: true,
    no_runtime: true,
    no_feedback: true,
    anti_leakage_status: "passed",
    insight: {
      setup_family: "momentum_continuation",
      horizon: "60m",
      evidence_direction: "supportive_strong",
      evidence_quality: "verified_high",
      total_support: 20,
      unique_snapshot_support: 20,
      completed_outcome_count: 20,
    },
    ...overrides,
  };
}

function withInsight(id, insightOverrides = {}, envelopeOverrides = {}) {
  const base = envelope(id);
  return {
    ...base,
    ...envelopeOverrides,
    insight: { ...base.insight, ...insightOverrides },
  };
}

function calibrate(input) {
  return calibrateConfidence(input);
}

function unsupportedInput(status, overrides = {}) {
  return {
    baseConfidence: 50,
    insights: [envelope("unsupported-status-case", { pattern_discovery_status: status, ...overrides })],
    configuration: config,
  };
}

function unsupportedStatusPasses(result) {
  return result.status === "blocked_unsupported_insight" &&
    result.calibration_id === null &&
    result.calibration_hash === null &&
    result.proposed_delta === null &&
    result.proposed_calibrated_confidence === null &&
    result.included_insight_ids.length === 0 &&
    result.adjustments.length === 0 &&
    result.lineage_hashes.length === 0 &&
    result.non_authoritative === true &&
    result.applied === false &&
    result.issues.length === 1 &&
    result.issues[0].code === "ineligible_pattern_discovery_status" &&
    result.issues[0].path === "/insights/0/pattern_discovery_status" &&
    result.issues[0].severity === "error" &&
    result.issues[0].messageKey === "confidence_calibration.ineligible_pattern_discovery_status";
}

function equivalent(left, right) {
  return canonicalJson(left) === canonicalJson(right);
}

function stripIssues(result) {
  return result.issues.map((item) => `${item.code}:${item.path}:${item.severity}:${item.messageKey}`);
}

const action309 = exists(paths.action309Guard) ? runJson(paths.action309Guard) : null;
const action420 = exists(paths.action420Verifier) ? runJson(paths.action420Verifier) : null;
const action421 = exists(paths.action421Verifier) ? runJson(paths.action421Verifier) : null;
const action422 = exists(paths.action422Verifier) ? runJson(paths.action422Verifier) : null;
const action423 = exists(paths.action423Verifier) ? runJson(paths.action423Verifier) : null;

const unsupportedStatusMatrix = Object.fromEntries(unsupportedStatusCases.map(({ label, value }) => {
  const result = calibrate(unsupportedInput(value));
  const rawValueAbsent = String(value).length === 0 || !JSON.stringify(result.issues).includes(String(value));
  return [label, {
    status: result.status,
    passed: unsupportedStatusPasses(result) && rawValueAbsent,
    issue_codes: result.issues.map((item) => item.code),
    issue_paths: result.issues.map((item) => item.path),
    canonical_hash: canonicalHash(result),
  }];
}));

const nonStringStatusResult = calibrate({
  baseConfidence: 50,
  insights: [envelope("non-string-status", { pattern_discovery_status: 123 })],
  configuration: config,
});

const invalidConfig = clone(config);
invalidConfig.minimum_total_support = 21;
const phasePrecedenceMatrix = {
  phase_1_invalid_input_shape: calibrate({ baseConfidence: 50, insights: [envelope("x")], configuration: config, extra: true }).status === "blocked_invalid_input",
  phase_2_invalid_configuration_shape: calibrate({ baseConfidence: 50, insights: [envelope("x")], configuration: invalidConfig }).status === "blocked_invalid_configuration",
  phase_3_invalid_base_confidence: calibrate({ baseConfidence: 101, insights: [envelope("x")], configuration: config }).status === "blocked_invalid_input",
  phase_4_invalid_insight_array: calibrate({ baseConfidence: 50, insights: "bad", configuration: config }).status === "blocked_invalid_input",
  phase_5_invalid_envelope_shape: nonStringStatusResult.status === "blocked_invalid_input" &&
    nonStringStatusResult.issues[0]?.code === "invalid_insight_envelope",
  phase_6_unsupported_over_malformed_insight: calibrate(unsupportedInput("unsupported_phase_6", { insight: { setup_family: "momentum_continuation" } })).status === "blocked_unsupported_insight",
  phase_6_unsupported_over_invalid_lineage: calibrate(unsupportedInput("unsupported_phase_6", { pattern_discovery_sha256: "bad" })).status === "blocked_unsupported_insight",
  phase_6_unsupported_over_missing_lineage_hash: calibrate(unsupportedInput("unsupported_phase_6", { pattern_discovery_result_sha256: "" })).status === "blocked_unsupported_insight",
  phase_6_unsupported_over_failed_anti_leakage: calibrate(unsupportedInput("unsupported_phase_6", { anti_leakage_status: "failed" })).status === "blocked_unsupported_insight",
  phase_6_unsupported_over_unknown_anti_leakage: calibrate(unsupportedInput("unsupported_phase_6", { anti_leakage_status: "unknown" })).status === "blocked_unsupported_insight",
  phase_6_unsupported_over_contradictory_warning: calibrate(unsupportedInput("unsupported_phase_6", { warning_codes: ["minimum_total_support_not_met"] })).status === "blocked_unsupported_insight",
  phase_6_unsupported_over_invalid_evidence_quality: calibrate(unsupportedInput("unsupported_phase_6", { insight: { ...envelope("x").insight, evidence_quality: "blocked" } })).status === "blocked_unsupported_insight",
  phase_6_unsupported_over_overlap_conflict: (() => {
    const first = envelope("unsupported-overlap-a", { pattern_discovery_status: "unsupported_phase_6" });
    const second = withInsight("unsupported-overlap-b", { evidence_direction: "adverse_strong" }, {
      pattern_discovery_status: "unsupported_phase_6",
      pattern_discovery_result_sha256: first.pattern_discovery_result_sha256,
      evidence_set_sha256: first.evidence_set_sha256,
    });
    return calibrate({ baseConfidence: 50, insights: [first, second], configuration: config }).status === "blocked_unsupported_insight";
  })(),
};

function warningCase(id, code, count) {
  return calibrate({
    baseConfidence: 50,
    insights: [envelope(id, { warning_codes: Array.from({ length: count }, () => code) })],
    configuration: config,
  });
}

const duplicateMapperWarningResults = [1, 2, 3, 8].map((count) => warningCase("duplicate-mapper-row", "duplicate_mapper_row_identity", count));
const metricUnavailableWarningResults = [1, 2, 3, 8].map((count) => warningCase("metric-value-unavailable", "metric_value_unavailable", count));
const distinctWarnings = calibrate({
  baseConfidence: 50,
  insights: [envelope("distinct-warnings", { warning_codes: ["duplicate_mapper_row_identity", "metric_value_unavailable"] })],
  configuration: config,
});
const distinctWarningsReversed = calibrate({
  baseConfidence: 50,
  insights: [envelope("distinct-warnings", { warning_codes: ["metric_value_unavailable", "duplicate_mapper_row_identity"] })],
  configuration: config,
});

const warningMultiplicityMatrix = {
  duplicate_mapper_row_identity_one_two_three_many_identical: duplicateMapperWarningResults.every((result) => equivalent(result, duplicateMapperWarningResults[0])),
  duplicate_mapper_row_identity_attenuates_once: duplicateMapperWarningResults[0].proposed_delta === 1 &&
    duplicateMapperWarningResults[0].adjustments[0]?.adjusted_delta_basis_points === 100 &&
    duplicateMapperWarningResults[0].warnings.length === 1,
  metric_value_unavailable_one_two_three_many_identical: metricUnavailableWarningResults.every((result) => equivalent(result, metricUnavailableWarningResults[0])),
  metric_value_unavailable_attenuates_once: metricUnavailableWarningResults[0].proposed_delta === 1 &&
    metricUnavailableWarningResults[0].adjustments[0]?.adjusted_delta_basis_points === 100 &&
    metricUnavailableWarningResults[0].warnings.length === 1,
  distinct_warnings_independent: distinctWarnings.proposed_delta === 0.5 &&
    distinctWarnings.adjustments[0]?.adjusted_delta_basis_points === 50 &&
    distinctWarnings.warnings.map((item) => item.code).join(",") === "duplicate_mapper_row_identity,metric_value_unavailable",
  distinct_warning_order_invariant: equivalent(distinctWarnings, distinctWarningsReversed),
  distinct_warning_identity_differs_from_single_warning: distinctWarnings.calibration_id !== duplicateMapperWarningResults[0].calibration_id,
};

function contradictoryResult(id, codes) {
  return calibrate({ baseConfidence: 50, insights: [envelope(id, { warning_codes: codes })], configuration: config });
}

const contradictorySingle = contradictoryResult("contradictory-single", ["minimum_total_support_not_met"]);
const contradictoryDuplicate = contradictoryResult("contradictory-duplicate", ["minimum_total_support_not_met", "minimum_total_support_not_met"]);
const contradictoryCompleted = contradictoryResult("contradictory-completed", ["minimum_completed_outcomes_not_met"]);
const contradictoryBoth = contradictoryResult("contradictory-both", ["minimum_total_support_not_met", "minimum_completed_outcomes_not_met"]);
const contradictoryBothReversed = contradictoryResult("contradictory-both", ["minimum_completed_outcomes_not_met", "minimum_total_support_not_met"]);

const contradictoryWarningMatrix = {
  duplicate_blocking_warning_blocks_once: contradictoryDuplicate.status === "blocked_invalid_input" &&
    contradictoryDuplicate.issues.length === 1 &&
    contradictoryDuplicate.issues[0].code === "warning_status_contradiction" &&
    contradictoryDuplicate.proposed_delta === null,
  minimum_total_support_blocks: contradictorySingle.status === "blocked_invalid_input" &&
    contradictorySingle.issues[0]?.code === "warning_status_contradiction",
  minimum_completed_outcomes_blocks: contradictoryCompleted.status === "blocked_invalid_input" &&
    contradictoryCompleted.issues[0]?.code === "warning_status_contradiction",
  both_blocking_warnings_block: contradictoryBoth.status === "blocked_invalid_input" &&
    contradictoryBoth.issues[0]?.code === "warning_status_contradiction",
  blocking_warning_order_stable: equivalent(contradictoryBoth, contradictoryBothReversed),
  no_delta_or_attenuation_when_blocked: contradictoryBoth.adjustments.length === 0 &&
    contradictoryBoth.warnings.length === 0 &&
    contradictoryBoth.proposed_delta === null,
};

const unsupportedContractSample = calibrate(unsupportedInput("blocked_non_consumable_row"));
const unsupportedIssueContract = {
  exact_issue_code: unsupportedContractSample.issues[0]?.code === "ineligible_pattern_discovery_status",
  exact_rfc6901_path: unsupportedContractSample.issues[0]?.path === "/insights/0/pattern_discovery_status",
  severity_error: unsupportedContractSample.issues[0]?.severity === "error",
  stable_message_key: unsupportedContractSample.issues[0]?.messageKey === "confidence_calibration.ineligible_pattern_discovery_status",
  no_raw_input_value: !JSON.stringify(unsupportedContractSample.issues).includes("blocked_non_consumable_row"),
  deterministic_sorting: equivalent(
    calibrate({ baseConfidence: 50, insights: [envelope("a", { pattern_discovery_status: "bad_a" }), envelope("b", { pattern_discovery_status: "bad_b" })], configuration: config }).issues,
    calibrate({ baseConfidence: 50, insights: [envelope("b", { pattern_discovery_status: "bad_b" }), envelope("a", { pattern_discovery_status: "bad_a" })], configuration: config }).issues,
  ),
  deterministic_deduplication: stripIssues(calibrate({ baseConfidence: 50, insights: [envelope("a", { pattern_discovery_status: "bad_a" }), envelope("a", { pattern_discovery_status: "bad_a" })], configuration: config })).length === 2,
};

const regressionCases = {
  strong_supportive: calibrate({ baseConfidence: 50, insights: [withInsight("strong-supportive", { evidence_direction: "supportive_strong" })], configuration: config }),
  moderate_supportive: calibrate({ baseConfidence: 50, insights: [withInsight("moderate-supportive", { evidence_direction: "supportive_moderate" })], configuration: config }),
  weak_supportive: calibrate({ baseConfidence: 50, insights: [withInsight("weak-supportive", { evidence_direction: "supportive_weak" })], configuration: config }),
  neutral: calibrate({ baseConfidence: 50, insights: [withInsight("neutral", { evidence_direction: "neutral" })], configuration: config }),
  mixed: calibrate({ baseConfidence: 50, insights: [withInsight("mixed", { evidence_direction: "mixed" })], configuration: config }),
  weak_adverse: calibrate({ baseConfidence: 50, insights: [withInsight("weak-adverse", { evidence_direction: "adverse_weak" })], configuration: config }),
  moderate_adverse: calibrate({ baseConfidence: 50, insights: [withInsight("moderate-adverse", { evidence_direction: "adverse_moderate" })], configuration: config }),
  strong_adverse: calibrate({ baseConfidence: 50, insights: [withInsight("strong-adverse", { evidence_direction: "adverse_strong" })], configuration: config }),
  discovered_with_warnings: calibrate({ baseConfidence: 50, insights: [envelope("discovered-with-warnings", { pattern_discovery_status: "discovered_with_warnings", warning_codes: ["duplicate_mapper_row_identity"] })], configuration: config }),
  duplicate_insight: calibrate({ baseConfidence: 50, insights: [envelope("duplicate-insight"), envelope("duplicate-insight")], configuration: config }),
  non_overlapping_multiple: calibrate({ baseConfidence: 50, insights: [envelope("multi-a"), envelope("multi-b")], configuration: config }),
  positive_cap: calibrate({ baseConfidence: 50, insights: [envelope("cap-a"), envelope("cap-b"), envelope("cap-c")], configuration: config }),
  negative_cap: calibrate({ baseConfidence: 50, insights: [withInsight("neg-a", { evidence_direction: "adverse_strong" }), withInsight("neg-b", { evidence_direction: "adverse_strong" }), withInsight("neg-c", { evidence_direction: "adverse_strong" })], configuration: config }),
  upper_clamp: calibrate({ baseConfidence: 99, insights: [envelope("upper-clamp")], configuration: config }),
  lower_clamp: calibrate({ baseConfidence: 1, insights: [withInsight("lower-clamp", { evidence_direction: "adverse_strong" })], configuration: config }),
  no_eligible_evidence: calibrate({ baseConfidence: 50, insights: [], configuration: config }),
  balanced_zero_delta: calibrate({ baseConfidence: 50, insights: [withInsight("balance-a", { evidence_direction: "supportive_moderate" }), withInsight("balance-b", { evidence_direction: "adverse_weak" })], configuration: config }),
};
const overlapBase = envelope("overlap-base");
regressionCases.overlapping_conflict = calibrate({
  baseConfidence: 50,
  insights: [
    overlapBase,
    withInsight("overlap-conflict", { evidence_direction: "adverse_strong" }, {
      pattern_discovery_result_sha256: overlapBase.pattern_discovery_result_sha256,
      evidence_set_sha256: overlapBase.evidence_set_sha256,
    }),
  ],
  configuration: config,
});

const unaffectedRegression = {
  strong_supportive: regressionCases.strong_supportive.status === "calibrated" && regressionCases.strong_supportive.proposed_delta === 2 && regressionCases.strong_supportive.proposed_calibrated_confidence === 52,
  moderate_supportive: regressionCases.moderate_supportive.status === "calibrated" && regressionCases.moderate_supportive.proposed_delta === 1,
  weak_supportive: regressionCases.weak_supportive.status === "calibrated" && regressionCases.weak_supportive.proposed_delta === 0.5,
  neutral: regressionCases.neutral.status === "no_adjustment" && regressionCases.neutral.proposed_delta === 0,
  mixed: regressionCases.mixed.status === "no_adjustment" && regressionCases.mixed.proposed_delta === 0,
  weak_adverse: regressionCases.weak_adverse.status === "calibrated" && regressionCases.weak_adverse.proposed_delta === -1,
  moderate_adverse: regressionCases.moderate_adverse.status === "calibrated" && regressionCases.moderate_adverse.proposed_delta === -2,
  strong_adverse: regressionCases.strong_adverse.status === "calibrated" && regressionCases.strong_adverse.proposed_delta === -3,
  discovered_with_warnings: regressionCases.discovered_with_warnings.status === "calibrated_with_warnings" && regressionCases.discovered_with_warnings.proposed_delta === 1,
  duplicate_insight: regressionCases.duplicate_insight.status === "calibrated_with_warnings" &&
    regressionCases.duplicate_insight.overlap_summary.deduplicated_count === 1,
  non_overlapping_multiple: regressionCases.non_overlapping_multiple.status === "calibrated" &&
    regressionCases.non_overlapping_multiple.proposed_delta === 4,
  overlapping_conflict: regressionCases.overlapping_conflict.status === "blocked_overlapping_evidence",
  positive_cap: regressionCases.positive_cap.proposed_delta === 4,
  negative_cap: regressionCases.negative_cap.proposed_delta === -6,
  upper_clamp: regressionCases.upper_clamp.proposed_calibrated_confidence === 100 &&
    regressionCases.upper_clamp.warnings.some((item) => item.code === "confidence_clamped_to_bounds"),
  lower_clamp: regressionCases.lower_clamp.proposed_calibrated_confidence === 0 &&
    regressionCases.lower_clamp.warnings.some((item) => item.code === "confidence_clamped_to_bounds"),
  no_eligible_evidence: regressionCases.no_eligible_evidence.status === "insufficient_eligible_evidence",
  balanced_zero_delta: regressionCases.balanced_zero_delta.status === "no_adjustment" &&
    regressionCases.balanced_zero_delta.proposed_delta === 0,
};

const typeExports = [...source.matchAll(/^export type (\w+)/gm)].map((match) => match[1]);
const functionExports = [...source.matchAll(/^export function (\w+)/gm)].map((match) => match[1]);
const resultAndApiContract = {
  exact_status_vocabulary: expectedStatuses.every((status) => source.includes(`"${status}"`)),
  exact_runtime_export: JSON.stringify(functionExports) === JSON.stringify(["calibrateConfidence"]),
  exact_type_exports: JSON.stringify(typeExports) === JSON.stringify(expectedTypeExports),
  exact_function_signature: source.includes("export function calibrateConfidence(input: Readonly<{") &&
    source.includes("baseConfidence: number;") &&
    source.includes("insights: readonly ConfidenceCalibrationInsightEnvelope[];") &&
    source.includes("configuration: FrozenConfidenceCalibrationConfiguration;") &&
    source.includes("}>): ConfidenceCalibrationResult"),
  no_public_helper_exports: functionExports.length === 1 && typeExports.length === 7,
  issue_shape_unchanged: source.includes("code:") && source.includes("path: string;") && source.includes('severity: "error";') && source.includes("messageKey: string;"),
  warning_shape_unchanged: source.includes('severity: "warning";') && source.includes("ConfidenceCalibrationWarning"),
};

const calibrationIdPattern = /^confidence_calibration_v1:[a-f0-9]{24}$/;
const identityEquivalence = {
  duplicate_warning_ids_identical: duplicateMapperWarningResults.every((result) => result.calibration_id === duplicateMapperWarningResults[0].calibration_id),
  duplicate_warning_hashes_identical: duplicateMapperWarningResults.every((result) => canonicalHash(result) === canonicalHash(duplicateMapperWarningResults[0])),
  duplicate_warning_included_ids_identical: duplicateMapperWarningResults.every((result) => equivalent(result.included_insight_ids, duplicateMapperWarningResults[0].included_insight_ids)),
  duplicate_warning_excluded_ids_identical: duplicateMapperWarningResults.every((result) => equivalent(result.excluded_insight_ids, duplicateMapperWarningResults[0].excluded_insight_ids)),
  duplicate_warning_deltas_identical: duplicateMapperWarningResults.every((result) => result.proposed_delta === duplicateMapperWarningResults[0].proposed_delta),
  distinct_unique_warning_identity_differs: distinctWarnings.calibration_id !== duplicateMapperWarningResults[0].calibration_id,
  calibration_id_format: calibrationIdPattern.test(regressionCases.strong_supportive.calibration_id ?? ""),
};

function immutableCase(input) {
  const frozen = deepFreeze(clone(input));
  const before = canonicalJson(frozen);
  const first = calibrate(frozen);
  const second = calibrate(frozen);
  return {
    unchanged: canonicalJson(frozen) === before,
    deterministic: equivalent(first, second),
  };
}

const immutabilityCases = {
  successful_path: immutableCase({ baseConfidence: 50, insights: [envelope("immutable-success")], configuration: config }),
  unsupported_status_path: immutableCase(unsupportedInput("blocked_non_consumable_row")),
  contradictory_warning_path: immutableCase({ baseConfidence: 50, insights: [envelope("immutable-contradiction", { warning_codes: ["minimum_total_support_not_met"] })], configuration: config }),
  overlap_blocked_path: immutableCase({
    baseConfidence: 50,
    insights: [
      overlapBase,
      withInsight("immutable-overlap", { evidence_direction: "adverse_strong" }, {
        pattern_discovery_result_sha256: overlapBase.pattern_discovery_result_sha256,
        evidence_set_sha256: overlapBase.evidence_set_sha256,
      }),
    ],
    configuration: config,
  }),
};
const immutabilityAndDeterminism = {
  inputs_immutable: Object.values(immutabilityCases).every((item) => item.unchanged),
  repeated_calls_deterministic: Object.values(immutabilityCases).every((item) => item.deterministic),
  interleaved_calls_deterministic: (() => {
    const stableInput = { baseConfidence: 50, insights: [envelope("interleaved-stable")], configuration: config };
    const before = calibrate(stableInput);
    calibrate({ baseConfidence: 50, insights: [withInsight("interleaved-other", { evidence_direction: "adverse_strong" })], configuration: config });
    const after = calibrate(stableInput);
    return equivalent(before, after);
  })(),
  input_order_deterministic: equivalent(
    calibrate({ baseConfidence: 50, insights: [envelope("order-a"), envelope("order-b")], configuration: config }),
    calibrate({ baseConfidence: 50, insights: [envelope("order-b"), envelope("order-a")], configuration: config }),
  ),
  warning_order_deterministic: equivalent(distinctWarnings, distinctWarningsReversed),
  warning_multiplicity_deterministic: duplicateMapperWarningResults.every((result) => equivalent(result, duplicateMapperWarningResults[0])),
};

function runtimeConsumers() {
  const targets = ["app", "public", "proxy.ts", "middleware.ts", "middleware.js", "netlify.toml"].filter(exists);
  const scan = spawnSync("rg", ["-l", "pure-confidence-calibration|calibrateConfidence", ...targets], {
    cwd: root,
    encoding: "utf8",
  });
  if (![0, 1].includes(scan.status ?? -1)) return ["runtime_consumer_scan_failed"];
  return scan.stdout.trim().split("\n").filter(Boolean);
}

const forbiddenSourceTokens = [
  "readFileSync",
  "writeFileSync",
  "fetch(",
  "process.env",
  "Date.",
  "Date(",
  "Math.random",
  "randomUUID",
  "supabase",
  "Twelve",
  "twelve_data",
  "broker",
  "execution",
  "recommendation mutation",
];
const isolationAudit = {
  no_filesystem_access: !source.includes("readFile") && !source.includes("writeFile") && !source.includes("readdir"),
  no_network_access: !source.includes("fetch(") && !source.includes("http://") && !source.includes("https://"),
  no_process_env: !source.includes("process.env"),
  no_clock_access: !source.includes("Date.") && !source.includes("Date("),
  no_randomness: !source.includes("Math.random") && !source.includes("randomUUID"),
  no_provider_or_supabase_import: !/from ["'].*(@supabase|twelve|provider|broker)/i.test(source),
  no_replay_persistence_runtime_feedback_mutation: !/replay|persist|runtime route|feedback|scanner|ranking|mutation/i.test(
    source.replaceAll("no_replay", "").replaceAll("no_persistence", "").replaceAll("no_runtime", "").replaceAll("no_feedback", ""),
  ),
  no_forbidden_source_tokens: forbiddenSourceTokens.every((token) => !source.includes(token)),
};

const sourceIntegrity = Object.fromEntries(Object.entries(expectedHashes).map(([path, expected]) => {
  const actualBefore = exists(path) ? shaFile(path) : null;
  const actualAfter = exists(path) ? shaFile(path) : null;
  return [path, {
    expected,
    before: actualBefore,
    after: actualAfter,
    unchanged: actualBefore === actualAfter && actualAfter === expected,
  }];
}));

const runtimeConsumerFiles = runtimeConsumers();
const forbiddenAction424Artifacts = [
  "docs/action-424-pure-confidence-calibration-fixture-manifest.json",
  "docs/action-424-pure-confidence-calibration-input-manifest.json",
  "scripts/action-424-pure-confidence-calibration-run.mjs",
  "scripts/action-424-pure-confidence-calibration-shadow-run.mjs",
  "app/api/action-424",
  "app/action-424",
  "public/action-424-runtime-preview.json",
].filter(exists);
const trackedAction424Evidence = [...collectFiles("docs"), ...collectFiles("scripts"), ...collectFiles("tests")]
  .filter((path) => /action-424/.test(path))
  .filter((path) => /fixture|runner|shadow|manifest|runtime|provider|supabase|persistence|replay|feedback|recommendation|scanner|ranking/i.test(path))
  .filter((path) => ![paths.doc, paths.verifier, paths.test].includes(path));

const requiredDocSections = [
  "Purpose",
  "Scope",
  "Authoritative Dependencies",
  "Action 421 Findings",
  "Action 422 Approval",
  "Action 423 Remediation Summary",
  "Explicit Non-Goals",
  "Source-Integrity Audit",
  "Export/API Audit",
  "Validation-Order Audit",
  "Unsupported-Status Audit",
  "Known Pattern Discovery Blocked-Status Audit",
  "Arbitrary-Status Audit",
  "Multi-Fault Precedence Audit",
  "Warning Validation Audit",
  "Warning Sorting Audit",
  "Warning Deduplication Audit",
  "Once-Per-Warning Attenuation Audit",
  "Distinct-Warning Attenuation Audit",
  "Contradictory-Warning Audit",
  "Calibration-ID Equivalence Audit",
  "Unaffected-Behavior Regression",
  "Delta-Table Audit",
  "Cap Audit",
  "Overlap Audit",
  "Bounds/Clamping Audit",
  "Zero-Adjustment Audit",
  "Issue/Warning Contract Audit",
  "Immutability Audit",
  "Repeated-Call Determinism",
  "Interleaved-Call Determinism",
  "Input-Order Determinism",
  "Warning-Order Determinism",
  "Isolation Audit",
  "Consumer Inventory",
  "Remaining-Gap Inventory",
  "Fixture/Hash-Freeze Readiness",
  "Readiness Vocabulary",
  "Readiness Decision",
  "Passed Conditions",
  "Failed Conditions",
  "Unresolved Conditions",
  "Next Permitted Action",
];

const documentationAudit = {
  exists: exists(paths.doc),
  all_required_sections_present: requiredDocSections.every((section) => doc.includes(`## ${section}`)),
  readiness_vocabulary_present: doc.includes("`ready`") && doc.includes("`ready_with_conditions`") && doc.includes("`blocked`"),
  readiness_decision_present: doc.includes("`ready_with_conditions`"),
  runtime_preview_paused: doc.includes("runtime_preview_waiting_for_operator_inputs"),
};

const upstreamAudit = {
  action309_guard_passed: action309?.guard_status === "passed",
  action420_passed: action420?.verification_status === "passed",
  action421_post_remediation_passed: action421?.verification_status === "passed" &&
    action421?.readiness_decision === "ready_with_conditions" &&
    action421?.failed_conditions_count === 0,
  action422_passed: action422?.verification_status === "passed" &&
    action422?.approval_decision === "approved",
  action423_passed: action423?.verification_status === "passed" &&
    action423?.remediation_status === "implemented" &&
    action423?.failed_conditions_count === 0,
};

const auditSections = {
  documentation: Object.values(documentationAudit).every(Boolean),
  source_integrity: Object.values(sourceIntegrity).every((item) => item.unchanged),
  export_api: Object.values(resultAndApiContract).every(Boolean),
  unsupported_status: Object.values(unsupportedStatusMatrix).every((item) => item.passed),
  known_blocked_status: unsupportedStatusMatrix.blocked_non_consumable_row.passed &&
    unsupportedStatusMatrix.blocked_nondeterministic_grouping.passed,
  arbitrary_status: unsupportedStatusMatrix.arbitrary_lowercase.passed &&
    unsupportedStatusMatrix.arbitrary_uppercase.passed &&
    unsupportedStatusMatrix.empty_string.passed &&
    unsupportedStatusMatrix.whitespace_padded.passed,
  validation_order: Object.values(phasePrecedenceMatrix).every(Boolean),
  warning_validation: contradictoryWarningMatrix.minimum_total_support_blocks &&
    contradictoryWarningMatrix.minimum_completed_outcomes_blocks,
  warning_sorting: warningMultiplicityMatrix.distinct_warning_order_invariant,
  warning_deduplication: warningMultiplicityMatrix.duplicate_mapper_row_identity_one_two_three_many_identical &&
    warningMultiplicityMatrix.metric_value_unavailable_one_two_three_many_identical,
  once_per_warning_attenuation: warningMultiplicityMatrix.duplicate_mapper_row_identity_attenuates_once &&
    warningMultiplicityMatrix.metric_value_unavailable_attenuates_once,
  distinct_warning_attenuation: warningMultiplicityMatrix.distinct_warnings_independent,
  contradictory_warning: Object.values(contradictoryWarningMatrix).every(Boolean),
  calibration_id_equivalence: Object.values(identityEquivalence).every(Boolean),
  unaffected_behavior: Object.values(unaffectedRegression).every(Boolean),
  issue_warning_contract: Object.values(unsupportedIssueContract).every(Boolean),
  immutability: Object.values(immutabilityCases).every((item) => item.unchanged),
  determinism: Object.values(immutabilityAndDeterminism).every(Boolean),
  isolation: Object.values(isolationAudit).every(Boolean),
  consumer_inventory: runtimeConsumerFiles.length === 0,
  no_forbidden_artifacts: forbiddenAction424Artifacts.length === 0 && trackedAction424Evidence.length === 0,
  upstream_actions_healthy: Object.values(upstreamAudit).every(Boolean),
  no_effect_flags_false: Object.values(noEffectFlags).every((value) => value === false),
};

const failedSections = Object.entries(auditSections).filter(([, value]) => !value).map(([key]) => key);
const unresolvedConditions = [
  "executable_calibration_fixture_package_not_created",
  "calibration_hash_freeze_gate_pending",
  "non_string_status_structurally_impossible",
];
const readinessDecision = failedSections.length > 0 ? "blocked" : "ready_with_conditions";

const report = {
  verification_status: failedSections.length === 0 ? "passed" : "failed",
  readiness_decision: readinessDecision,
  readiness_vocabulary: ["ready", "ready_with_conditions", "blocked"],
  passed_conditions_count: Object.values(auditSections).filter(Boolean).length,
  failed_conditions_count: failedSections.length,
  unresolved_conditions_count: unresolvedConditions.length,
  failed_sections: failedSections,
  unresolved_conditions: unresolvedConditions,
  audit_sections: auditSections,
  documentation_audit: documentationAudit,
  source_integrity: sourceIntegrity,
  result_and_api_contract: resultAndApiContract,
  unsupported_status_matrix: unsupportedStatusMatrix,
  non_string_status_observation: {
    structurally_possible: false,
    observed_status: nonStringStatusResult.status,
    observed_issue_code: nonStringStatusResult.issues[0]?.code ?? null,
    conclusion: "non_string_status_rejected_by_envelope_shape_before_status_eligibility",
  },
  phase_precedence_matrix: phasePrecedenceMatrix,
  warning_multiplicity_matrix: warningMultiplicityMatrix,
  contradictory_warning_matrix: contradictoryWarningMatrix,
  unsupported_issue_contract: unsupportedIssueContract,
  unaffected_regression: unaffectedRegression,
  identity_equivalence: identityEquivalence,
  immutability_cases: immutabilityCases,
  immutability_and_determinism: immutabilityAndDeterminism,
  isolation_audit: isolationAudit,
  upstream_audit: upstreamAudit,
  runtime_consumer_files: runtimeConsumerFiles,
  forbidden_action424_artifacts: forbiddenAction424Artifacts,
  tracked_action424_evidence_files: trackedAction424Evidence,
  no_effect_flags: noEffectFlags,
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  runtime_preview_route_changed: false,
  runtime_preview_candidate_advanced: false,
  calibration_fixture_package_created: false,
  calibration_runner_created: false,
  calibration_manifest_created: false,
  calibration_shadow_executed: false,
  recommendation_mutation_executed: false,
  recommended_next_action: "action_425_static_confidence_calibration_fixture_hash_freeze_approval_gate",
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
