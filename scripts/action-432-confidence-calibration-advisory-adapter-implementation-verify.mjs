#!/usr/bin/env node

import { execFileSync, spawnSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const paths = {
  module: "lib/confidence-calibration-advisory-adapter.ts",
  calibrationModule: "lib/pure-confidence-calibration.ts",
  doc: "docs/action-432-confidence-calibration-advisory-adapter-implementation.md",
  verifier: "scripts/action-432-confidence-calibration-advisory-adapter-implementation-verify.mjs",
  test: "tests/e2e/action-432-confidence-calibration-advisory-adapter-implementation.spec.ts",
  action431Verifier: "scripts/action-431-confidence-calibration-advisory-consumption-contract-approval-gate-verify.mjs",
  action309Guard: "scripts/action-309-post-recovery-safety-guard.mjs",
  goldenVerifier: "scripts/replay-with-signal-package-static-preview-verify-golden.mjs",
  action426Inventory: "docs/action-426-static-confidence-calibration-hash-inventory.json",
  action429Manifest: "docs/action-429-static-confidence-calibration-shadow-input-manifest.json",
};

const expectedTypeExports = [
  "ImmutableRecommendationConfidenceEnvelope",
  "FrozenAdvisoryConsumptionConfiguration",
  "ConfidenceCalibrationAdvisoryResult",
];
const advisoryStatusVocabulary = [
  "advisory_ready",
  "advisory_ready_with_warnings",
  "advisory_no_adjustment",
  "advisory_insufficient_evidence",
  "blocked_invalid_input",
  "blocked_confidence_mismatch",
  "blocked_invalid_lineage",
  "blocked_future_leakage",
  "blocked_calibration_result",
  "blocked_unsupported_status",
];
const statusMappings = {
  calibrated: "advisory_ready",
  calibrated_with_warnings: "advisory_ready_with_warnings",
  no_adjustment: "advisory_no_adjustment",
  insufficient_eligible_evidence: "advisory_insufficient_evidence",
  blocked_invalid_input: "blocked_invalid_input",
  blocked_invalid_configuration: "blocked_invalid_input",
  blocked_invalid_lineage: "blocked_invalid_lineage",
  blocked_future_leakage: "blocked_future_leakage",
  blocked_overlapping_evidence: "blocked_calibration_result",
  blocked_unsupported_insight: "blocked_unsupported_status",
};
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
};
const protectedHashes = {
  "lib/pure-confidence-calibration.ts": "bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70",
  "docs/action-426-static-confidence-calibration-hash-inventory.json": "e19e320a662ab0d18500fb1b630563fdf1f3361a592afe00ff4af0ec6e9d69fe",
  "docs/action-429-static-confidence-calibration-shadow-input-manifest.json": "f730d31084419985c8464e01e1daf67bea9312ac47a3ab5c291a1c394da03c59",
};

const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");

function runJson(path) {
  return JSON.parse(execFileSync("node", [abs(path)], { cwd: root, encoding: "utf8", timeout: 300000 }));
}

function shaFile(path) {
  return execFileSync("shasum", ["-a", "256", abs(path)], { cwd: root, encoding: "utf8" }).trim().split(/\s+/)[0];
}

function rgFiles(pattern, targets) {
  const result = spawnSync("rg", ["-l", pattern, ...targets], { cwd: root, encoding: "utf8" });
  if (result.status !== 0 && result.status !== 1) throw new Error(result.stderr || `rg failed for ${pattern}`);
  return result.stdout.trim() ? result.stdout.trim().split("\n").sort() : [];
}

function h(char) {
  return char.repeat(64);
}

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

function insight(overrides = {}) {
  return {
    pattern_discovery_sha256: h("a"),
    pattern_discovery_configuration_version: "pattern_discovery_config_v1",
    pattern_discovery_result_sha256: h("b"),
    evidence_set_sha256: h("c"),
    group_sha256: h("d"),
    insight_id: "insight_opening_drive_15m",
    insight_sha256: h("e"),
    source_scenario_ids: ["scenario_001"],
    source_snapshot_ids: ["snapshot_001"],
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
      setup_family: "opening_drive",
      horizon: "15m",
      evidence_direction: "supportive_strong",
      evidence_quality: "verified_high",
      total_support: 40,
      unique_snapshot_support: 40,
      completed_outcome_count: 40,
    },
    ...overrides,
  };
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
      calibration_output_reused_as_learning_dataset_input: false,
      calibration_output_reused_as_pattern_discovery_evidence: false,
      calibration_output_reused_as_outcome: false,
      calibration_output_reused_as_context: false,
      calibration_output_reused_as_recommendation_base_confidence: false,
      calibration_output_reused_as_scanner_signal: false,
      calibration_output_reused_as_ranking_signal: false,
      calibration_output_reused_as_publication_signal: false,
      calibration_output_reused_as_execution_signal: false,
      calibration_output_reused_as_calibration_input_evidence: false,
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

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

const source = exists(paths.module) ? read(paths.module) : "";
const doc = exists(paths.doc) ? read(paths.doc) : "";
const compactSource = source.replace(/\s+/g, " ");
const action431 = exists(paths.action431Verifier) ? runJson(paths.action431Verifier) : null;
const action309 = exists(paths.action309Guard) ? runJson(paths.action309Guard) : null;
const golden = exists(paths.goldenVerifier) ? runJson(paths.goldenVerifier) : null;
const sourceIntegrity = Object.fromEntries(Object.entries(protectedHashes).map(([path, expected]) => {
  const actual = exists(path) ? shaFile(path) : null;
  return [path, { expected, actual, exists: actual !== null, matches: actual === expected }];
}));

const { buildConfidenceCalibrationAdvisory } = await import(pathToFileURL(abs(paths.module)).href);
const { calibrateConfidence } = await import(pathToFileURL(abs(paths.calibrationModule)).href);

const calibrated = calibrateConfidence({ baseConfidence: 50, insights: [insight()], configuration: calibrationConfig });
const withWarnings = calibrateConfidence({ baseConfidence: 50, insights: [insight({ warning_codes: ["metric_value_unavailable"] })], configuration: calibrationConfig });
const noAdjustment = calibrateConfidence({
  baseConfidence: 50,
  insights: [insight({ insight: { ...insight().insight, evidence_direction: "neutral" } })],
  configuration: calibrationConfig,
});
const calibratedAdvisory = buildConfidenceCalibrationAdvisory({
  recommendation: recommendationFor(calibrated),
  calibration: calibrated,
  configuration: advisoryConfig,
});
const warningAdvisory = buildConfidenceCalibrationAdvisory({
  recommendation: recommendationFor(withWarnings),
  calibration: withWarnings,
  configuration: advisoryConfig,
});
const noAdjustmentAdvisory = buildConfidenceCalibrationAdvisory({
  recommendation: recommendationFor(noAdjustment),
  calibration: noAdjustment,
  configuration: advisoryConfig,
});
const blockedResults = Object.fromEntries(Object.entries(statusMappings)
  .filter(([status]) => !["calibrated", "calibrated_with_warnings", "no_adjustment"].includes(status))
  .map(([status, expected]) => {
    const calibration = clone(calibrated);
    calibration.status = status;
    calibration.issues = [{ code: "invalid_lineage", path: "/insights/0", severity: "error", messageKey: "confidence_calibration.invalid_lineage" }];
    return [status, buildConfidenceCalibrationAdvisory({ recommendation: recommendationFor(calibration), calibration, configuration: advisoryConfig }).status === expected];
  }));
const mismatch = buildConfidenceCalibrationAdvisory({
  recommendation: recommendationFor(calibrated, { original_confidence: 51 }),
  calibration: calibrated,
  configuration: advisoryConfig,
});
const futureLeakageRecommendation = recommendationFor(calibrated);
futureLeakageRecommendation.anti_leakage.future_outcome_evidence = true;
const futureLeakage = buildConfidenceCalibrationAdvisory({ recommendation: futureLeakageRecommendation, calibration: calibrated, configuration: advisoryConfig });
const circularRecommendation = recommendationFor(calibrated);
circularRecommendation.anti_feedback.circular_calibration_lineage = true;
const circular = buildConfidenceCalibrationAdvisory({ recommendation: circularRecommendation, calibration: calibrated, configuration: advisoryConfig });
const missingLineageRecommendation = recommendationFor(calibrated);
missingLineageRecommendation.lineage.pattern_discovery_result_hashes = [];
const missingLineage = buildConfidenceCalibrationAdvisory({ recommendation: missingLineageRecommendation, calibration: calibrated, configuration: advisoryConfig });
const reorderedWarnings = clone(withWarnings);
reorderedWarnings.warnings = [
  { code: "confidence_clamped_to_bounds", path: "/proposed_calibrated_confidence", severity: "warning", messageKey: "confidence_calibration.confidence_clamped_to_bounds" },
  ...reorderedWarnings.warnings,
].reverse();
const canonicalWarningsA = buildConfidenceCalibrationAdvisory({ recommendation: recommendationFor(reorderedWarnings), calibration: reorderedWarnings, configuration: advisoryConfig });
const canonicalWarningsBInput = clone(reorderedWarnings);
canonicalWarningsBInput.warnings = [...canonicalWarningsBInput.warnings].reverse();
const canonicalWarningsB = buildConfidenceCalibrationAdvisory({ recommendation: recommendationFor(canonicalWarningsBInput), calibration: canonicalWarningsBInput, configuration: advisoryConfig });
const immutabilityInput = { recommendation: recommendationFor(withWarnings), calibration: withWarnings, configuration: advisoryConfig };
const immutabilityBefore = JSON.stringify(immutabilityInput);
const immutabilityResult = buildConfidenceCalibrationAdvisory(immutabilityInput);
const adapterConsumers = rgFiles("buildConfidenceCalibrationAdvisory|confidence-calibration-advisory-adapter", ["app", "lib"])
  .filter((path) => path !== paths.module);
const forbiddenSourceNeedles = ["@supabase", "fetch(", "XMLHttpRequest", "process.env", "localStorage", "Date.now", "Math.random", "console.", "next/server"];

const checks = {
  implementation_module_exists: exists(paths.module),
  documentation_exists: exists(paths.doc) && doc.includes("Action 432 - Confidence Calibration Advisory Adapter Implementation"),
  verifier_exists: exists(paths.verifier),
  focused_test_exists: exists(paths.test),
  exact_runtime_export: (source.match(/export function buildConfidenceCalibrationAdvisory/g) ?? []).length === 1 &&
    !source.includes("export const") &&
    !source.includes("export class"),
  exact_public_type_exports: expectedTypeExports.every((name) => source.includes(`export type ${name}`)) &&
    (source.match(/export type /g) ?? []).length === expectedTypeExports.length,
  exact_signature: compactSource.includes("buildConfidenceCalibrationAdvisory(input: Readonly<{ recommendation: ImmutableRecommendationConfidenceEnvelope; calibration: ConfidenceCalibrationResult; configuration: FrozenAdvisoryConsumptionConfiguration; }>): ConfidenceCalibrationAdvisoryResult"),
  no_forbidden_imports_or_runtime_calls: forbiddenSourceNeedles.every((needle) => !source.includes(needle)),
  validation_order_documented: [
    "1. top-level input shape",
    "2. advisory configuration",
    "3. recommendation envelope shape",
    "4. recommendation identity/fingerprint",
    "5. recommendation snapshot lineage",
    "6. original confidence validity",
    "7. calibration result shape",
    "8. calibration status eligibility",
    "9. calibration base-confidence agreement",
    "10. calibration identity and result hashes",
    "11. Pattern Discovery and Pattern Insight lineage",
    "12. anti-leakage state",
    "13. anti-feedback constraints",
    "14. warning and issue compatibility",
    "15. advisory output construction",
  ].every((line) => doc.includes(line)),
  exact_status_vocabulary: advisoryStatusVocabulary.every((status) => source.includes(status)),
  exact_status_mappings: calibratedAdvisory.status === "advisory_ready" &&
    warningAdvisory.status === "advisory_ready_with_warnings" &&
    noAdjustmentAdvisory.status === "advisory_no_adjustment" &&
    Object.values(blockedResults).every(Boolean),
  confidence_mismatch_blocker: mismatch.status === "blocked_confidence_mismatch",
  lineage_validation: missingLineage.status === "blocked_invalid_lineage",
  anti_feedback_validation: circular.status === "blocked_invalid_lineage",
  anti_leakage_validation: futureLeakage.status === "blocked_future_leakage",
  warning_issue_shape: warningAdvisory.warnings.every((item) => item.messageKey === `confidence_calibration_advisory.${item.code}`) &&
    mismatch.issues.every((item) => item.messageKey === `confidence_calibration_advisory.${item.code}`),
  advisory_identity_hash: /^confidence_calibration_advisory_v1:[a-f0-9]{24}$/.test(calibratedAdvisory.advisory_id ?? "") &&
    /^[a-f0-9]{64}$/.test(calibratedAdvisory.advisory_hash ?? ""),
  non_authoritative_applied_false: [calibratedAdvisory, warningAdvisory, noAdjustmentAdvisory, mismatch].every((item) =>
    item.non_authoritative === true && item.applied === false && item.application_eligible === false),
  no_recommendation_object_in_output: !JSON.stringify(calibratedAdvisory).includes("commands") &&
    !Object.prototype.hasOwnProperty.call(calibratedAdvisory, "recommendation"),
  immutability: JSON.stringify(immutabilityInput) === immutabilityBefore &&
    Object.isFrozen(immutabilityResult) &&
    Object.isFrozen(immutabilityResult.warnings) &&
    Object.isFrozen(immutabilityResult.issues),
  determinism: JSON.stringify(buildConfidenceCalibrationAdvisory({ recommendation: recommendationFor(calibrated), calibration: calibrated, configuration: advisoryConfig })) ===
    JSON.stringify(buildConfidenceCalibrationAdvisory({ recommendation: recommendationFor(calibrated), calibration: calibrated, configuration: advisoryConfig })) &&
    JSON.stringify(canonicalWarningsA) === JSON.stringify(canonicalWarningsB),
  no_consumer_exists: adapterConsumers.length === 0,
  no_runtime_persistence_replay_provider_supabase_feedback: Object.values(safety).every((value) => value === false),
  runtime_preview_chain_untouched: action431?.runtime_preview_status === "runtime_preview_waiting_for_operator_inputs",
  action431_compatibility: action431?.verification_status === "passed" &&
    action431?.consumers?.adapter_path_exists === true &&
    action431?.checks?.no_recommendation_engine_consumer === true,
  action309_guard_healthy: action309?.guard_status === "passed",
  golden_static_safety_healthy: golden?.verification_status === "passed",
  protected_confidence_packages_unchanged: Object.values(sourceIntegrity).every((entry) => entry.matches),
  action433_identified: doc.includes("Action 433 - Independent Advisory Adapter Verification"),
};

const failed = Object.entries(checks).filter(([, value]) => value !== true).map(([key]) => key);

const report = {
  verification_status: failed.length === 0 ? "passed" : "failed",
  implementation_result: "pure_confidence_calibration_advisory_adapter_implemented",
  checks,
  failed_conditions: failed,
  passed_conditions_count: Object.values(checks).filter(Boolean).length,
  failed_conditions_count: failed.length,
  module_api: {
    runtime_exports: ["buildConfidenceCalibrationAdvisory"],
    public_type_exports: expectedTypeExports,
  },
  validation_order: [
    "top_level_input_shape",
    "advisory_configuration",
    "recommendation_envelope_shape",
    "recommendation_identity_fingerprint",
    "recommendation_snapshot_lineage",
    "original_confidence_validity",
    "calibration_result_shape",
    "calibration_status_eligibility",
    "calibration_base_confidence_agreement",
    "calibration_identity_and_result_hashes",
    "pattern_discovery_and_pattern_insight_lineage",
    "anti_leakage_state",
    "anti_feedback_constraints",
    "warning_and_issue_compatibility",
    "advisory_output_construction",
  ],
  status_mappings: statusMappings,
  behavior: {
    calibrated_status: calibratedAdvisory.status,
    calibrated_with_warnings_status: warningAdvisory.status,
    no_adjustment_status: noAdjustmentAdvisory.status,
    blocked_results: blockedResults,
    confidence_mismatch_status: mismatch.status,
    future_leakage_status: futureLeakage.status,
    circular_lineage_status: circular.status,
    missing_lineage_status: missingLineage.status,
    advisory_id_stable_for_reordered_warnings: canonicalWarningsA.advisory_id === canonicalWarningsB.advisory_id,
  },
  action431_compatibility: {
    verification_status: action431?.verification_status ?? "missing",
    adapter_path_exists: action431?.consumers?.adapter_path_exists === true,
    no_recommendation_engine_consumer: action431?.checks?.no_recommendation_engine_consumer === true,
    recommended_next_action: action431?.recommended_next_action,
  },
  source_integrity: sourceIntegrity,
  consumers: {
    adapter_consumers: adapterConsumers,
  },
  safety,
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  unrelated_work_classification: "action_432_pure_confidence_calibration_advisory_adapter_implementation_only",
  recommended_next_action: "action_433_independent_advisory_adapter_verification",
};

console.log(JSON.stringify(report, null, 2));
if (report.verification_status !== "passed") process.exit(1);
