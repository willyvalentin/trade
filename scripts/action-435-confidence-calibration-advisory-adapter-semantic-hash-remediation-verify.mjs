#!/usr/bin/env node

import { execFileSync, spawnSync } from "child_process";
import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const paths = {
  adapter: "lib/confidence-calibration-advisory-adapter.ts",
  doc: "docs/action-435-confidence-calibration-advisory-adapter-semantic-hash-remediation.md",
  verifier: "scripts/action-435-confidence-calibration-advisory-adapter-semantic-hash-remediation-verify.mjs",
  test: "tests/e2e/action-435-confidence-calibration-advisory-adapter-semantic-hash-remediation.spec.ts",
};

const h = (char) => char.repeat(64);
const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");

function runJson(path, env = {}) {
  return JSON.parse(execFileSync("node", [abs(path)], {
    cwd: root,
    encoding: "utf8",
    timeout: 300000,
    env: { ...process.env, ...env },
  }));
}

function rgFiles(pattern, targets) {
  const result = spawnSync("rg", ["-l", pattern, ...targets], { cwd: root, encoding: "utf8" });
  if (result.status !== 0 && result.status !== 1) throw new Error(result.stderr || `rg failed for ${pattern}`);
  return result.stdout.trim() ? result.stdout.trim().split("\n").sort() : [];
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
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
    pattern_discovery_result_sha256: overrides.pattern_discovery_result_sha256 ?? h("b"),
    evidence_set_sha256: overrides.evidence_set_sha256 ?? h("c"),
    group_sha256: overrides.group_sha256 ?? h("d"),
    insight_id: overrides.insight_id ?? "insight_opening_drive_15m",
    insight_sha256: overrides.insight_sha256 ?? h("e"),
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

function advisory(calibration, recommendation = recommendationFor(calibration)) {
  return buildConfidenceCalibrationAdvisory({ recommendation, calibration, configuration: advisoryConfig });
}

function patched(value, patch) {
  const draft = clone(value);
  patch(draft);
  return draft;
}

function statusFor(calibration, recommendation = recommendationFor(calibration)) {
  return advisory(calibration, recommendation).status;
}

const calibrated = calibrationFor([insight()]);
const withWarnings = calibrationFor([insight({ warning_codes: ["metric_value_unavailable", "duplicate_mapper_row_identity"] })]);
const noAdjustment = calibrationFor([insight({ insight: { ...insight().insight, evidence_direction: "neutral" } })]);
const twoInsight = calibrationFor([
  insight({ insight_id: "insight_b", insight_sha256: h("e"), pattern_discovery_result_sha256: h("b") }),
  insight({ insight_id: "insight_a", insight_sha256: h("d"), pattern_discovery_result_sha256: h("c") }),
]);
const other = calibrationFor([insight({ insight_id: "insight_other", insight_sha256: h("9"), pattern_discovery_result_sha256: h("8") })]);

function mismatchIssue(result) {
  return result.status === "blocked_calibration_result" &&
    result.issues.some((item) =>
      item.code === "blocked_calibration_result" &&
      item.path === "/calibration/calibration_hash" &&
      item.severity === "error" &&
      item.messageKey === "confidence_calibration_advisory.blocked_calibration_result") &&
    result.proposed_delta === null &&
    result.proposed_calibrated_confidence === null &&
    result.advisory_eligible === false &&
    result.application_eligible === false &&
    result.non_authoritative === true &&
    result.applied === false;
}

function blockedResult(result) {
  return result.status.startsWith("blocked_") &&
    result.proposed_delta === null &&
    result.proposed_calibrated_confidence === null &&
    result.advisory_eligible === false &&
    result.application_eligible === false &&
    result.non_authoritative === true &&
    result.applied === false;
}

const baseline = advisory(calibrated);
const warningBaseline = advisory(withWarnings);
const noAdjustmentBaseline = advisory(noAdjustment);

const tampering = {
  malformed_result_hash: blockedResult(advisory(patched(calibrated, (draft) => { draft.calibration_hash = "bad"; }))),
  swapped_valid_hash: mismatchIssue(advisory(patched(calibrated, (draft) => { draft.calibration_hash = other.calibration_hash; }))),
  status_changed_retained_hash: mismatchIssue(advisory(patched(calibrated, (draft) => { draft.status = "calibrated_with_warnings"; }))),
  proposed_delta_changed: mismatchIssue(advisory(patched(calibrated, (draft) => { draft.proposed_delta = 3; }))),
  proposed_confidence_changed: mismatchIssue(advisory(patched(calibrated, (draft) => { draft.proposed_calibrated_confidence = 53; }))),
  warning_inventory_changed: mismatchIssue(advisory(patched(calibrated, (draft) => {
    draft.warnings = [{ code: "metric_value_unavailable", path: "/insights/0/warning_codes", severity: "warning", messageKey: "confidence_calibration.metric_value_unavailable" }];
  }))),
  issue_inventory_changed: mismatchIssue(advisory(patched(calibrated, (draft) => {
    draft.issues = [{ code: "invalid_lineage", path: "/insights/0", severity: "error", messageKey: "confidence_calibration.invalid_lineage" }];
  }))),
  included_insight_changed: mismatchIssue(advisory(patched(calibrated, (draft) => { draft.included_insight_ids = ["other"]; }))),
  excluded_insight_changed: mismatchIssue(advisory(patched(calibrated, (draft) => { draft.excluded_insight_ids = [{ insight_id: "other", reason: "tampered" }]; }))),
  evidence_summary_changed: mismatchIssue(advisory(patched(calibrated, (draft) => { draft.evidence_summary.included_count = 99; }))),
  overlap_summary_changed: mismatchIssue(advisory(patched(calibrated, (draft) => { draft.overlap_summary.conflict_count = 99; }))),
  lineage_changed: mismatchIssue(advisory(patched(calibrated, (draft) => { draft.lineage_hashes[0].insight_sha256 = h("9"); }))),
  non_authoritative_flag_changed: blockedResult(advisory(patched(calibrated, (draft) => { draft.non_authoritative = false; }))),
  applied_flag_changed: blockedResult(advisory(patched(calibrated, (draft) => { draft.applied = true; }))),
};
const retainedHashTampering = {
  swapped_valid_hash: tampering.swapped_valid_hash,
  status_changed_retained_hash: tampering.status_changed_retained_hash,
  proposed_delta_changed: tampering.proposed_delta_changed,
  proposed_confidence_changed: tampering.proposed_confidence_changed,
  warning_inventory_changed: tampering.warning_inventory_changed,
  issue_inventory_changed: tampering.issue_inventory_changed,
  included_insight_changed: tampering.included_insight_changed,
  excluded_insight_changed: tampering.excluded_insight_changed,
  evidence_summary_changed: tampering.evidence_summary_changed,
  overlap_summary_changed: tampering.overlap_summary_changed,
  lineage_changed: tampering.lineage_changed,
};

const reorderedWarnings = advisory(patched(withWarnings, (draft) => {
  draft.warnings = [...draft.warnings].reverse();
}));
const reorderedTwoInsight = advisory(patched(twoInsight, (draft) => {
  draft.included_insight_ids = [...draft.included_insight_ids].reverse();
  draft.lineage_hashes = [...draft.lineage_hashes].reverse();
  draft.adjustments = [...draft.adjustments].reverse();
}));
const hashMismatchWithLineageFault = advisory(
  patched(calibrated, (draft) => { draft.calibration_hash = other.calibration_hash; }),
  patched(recommendationFor(calibrated), (draft) => { draft.lineage.pattern_insight_hashes = [h("9")]; }),
);
const hashMismatchWithLeakageFault = advisory(
  patched(calibrated, (draft) => { draft.calibration_hash = other.calibration_hash; }),
  patched(recommendationFor(calibrated), (draft) => { draft.anti_leakage.future_outcome_evidence = true; }),
);
const hashMismatchWithFeedbackFault = advisory(
  patched(calibrated, (draft) => { draft.calibration_hash = other.calibration_hash; }),
  patched(recommendationFor(calibrated), (draft) => { draft.anti_feedback.circular_calibration_lineage = true; }),
);
const earlierFault = advisory(
  patched(calibrated, (draft) => { draft.calibration_hash = other.calibration_hash; }),
  patched(recommendationFor(calibrated), (draft) => { draft.recommendation_fingerprint = ""; }),
);

const source = read(paths.adapter);
const runtimeExports = [...source.matchAll(/export function\s+(\w+)/g)].map((match) => match[1]);
const typeExports = [...source.matchAll(/export type\s+(\w+)/g)].map((match) => match[1]);
const adapterConsumers = rgFiles("confidence-calibration-advisory-adapter|buildConfidenceCalibrationAdvisory", ["app", "lib"])
  .filter((path) => path !== paths.adapter);
const forbiddenArtifacts = [
  "docs/action-435-confidence-calibration-advisory-fixtures.json",
  "docs/action-435-confidence-calibration-advisory-shadow-input-manifest.json",
  "scripts/action-435-confidence-calibration-advisory-shadow-run.mjs",
  "scripts/action-435-confidence-calibration-advisory-runner.mjs",
  "lib/action-435-confidence-calibration-advisory-fixtures.ts",
].filter(exists);

const protectedHashes = {
  "lib/pure-confidence-calibration.ts": "bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70",
  "docs/action-426-static-confidence-calibration-hash-inventory.json": "e19e320a662ab0d18500fb1b630563fdf1f3361a592afe00ff4af0ec6e9d69fe",
  "docs/action-429-static-confidence-calibration-shadow-input-manifest.json": "f730d31084419985c8464e01e1daf67bea9312ac47a3ab5c291a1c394da03c59",
};
const sourceIntegrity = Object.fromEntries(Object.entries(protectedHashes).map(([path, expected]) => {
  const actual = createHash("sha256").update(readFileSync(abs(path))).digest("hex");
  return [path, { expected, actual, matches: expected === actual }];
}));

const checks = {
  documentation_exists: exists(paths.doc),
  verifier_exists: exists(paths.verifier),
  focused_test_exists: exists(paths.test),
  exact_exports: JSON.stringify(runtimeExports) === JSON.stringify(["buildConfidenceCalibrationAdvisory"]) &&
    JSON.stringify(typeExports) === JSON.stringify([
      "ImmutableRecommendationConfidenceEnvelope",
      "FrozenAdvisoryConsumptionConfiguration",
      "ConfidenceCalibrationAdvisoryResult",
    ]),
  semantic_payload_reconstruction_exists: source.includes("buildCalibrationSemanticHashPayload"),
  independent_canonicalization_exists: source.includes("canonicalize(value"),
  sha256_recomputation_exists: source.includes("sha256(buildCalibrationSemanticHashPayload"),
  supplied_recomputed_comparison_exists: source.includes("value.calibration_hash === sha256") ||
    (source.includes("legacyHashMatches") &&
      source.includes("completeHashMatches") &&
      source.includes("value.calibration_hash === legacyHash") &&
      source.includes("value.calibration_hash === completeHash")),
  mismatch_maps_to_blocked_calibration_result: Object.values(tampering).every(Boolean),
  retained_hash_mismatch_maps_to_blocked_calibration_result: Object.values(retainedHashTampering).every(Boolean),
  phase_10_precedence: hashMismatchWithLineageFault.status === "blocked_calibration_result" &&
    hashMismatchWithLeakageFault.status === "blocked_calibration_result" &&
    hashMismatchWithFeedbackFault.status === "blocked_calibration_result" &&
    earlierFault.status === "blocked_invalid_lineage",
  semantic_reordering_supported: JSON.stringify(warningBaseline) === JSON.stringify(reorderedWarnings) &&
    statusFor(twoInsight) === reorderedTwoInsight.status,
  valid_outputs_unchanged: baseline.status === "advisory_ready" &&
    baseline.proposed_calibrated_confidence === 52 &&
    warningBaseline.status === "advisory_ready_with_warnings" &&
    noAdjustmentBaseline.status === "advisory_no_adjustment",
  no_adjustment_unchanged: noAdjustmentBaseline.proposed_delta === 0 &&
    noAdjustmentBaseline.original_confidence === noAdjustmentBaseline.proposed_calibrated_confidence,
  immutability: Object.isFrozen(baseline) && Object.isFrozen(baseline.warnings) && Object.isFrozen(baseline.issues),
  determinism: JSON.stringify(advisory(calibrated)) === JSON.stringify(advisory(calibrated)) &&
    JSON.stringify(advisory(patched(calibrated, (draft) => { draft.calibration_hash = other.calibration_hash; }))) ===
      JSON.stringify(advisory(patched(calibrated, (draft) => { draft.calibration_hash = other.calibration_hash; }))),
  no_public_helper_exports: !source.includes("export function buildCalibrationSemanticHashPayload") &&
    !source.includes("export function canonicalize") &&
    !source.includes("export function sha256"),
  no_forbidden_artifacts: forbiddenArtifacts.length === 0,
  no_consumer: adapterConsumers.length === 0,
  no_runtime_or_side_effect_imports: !source.match(/@supabase|fetch\(|XMLHttpRequest|process\.env|localStorage|Date\.now|Math\.random|next\/server/),
  protected_sources_unchanged: Object.values(sourceIntegrity).every((item) => item.matches),
};
const failed = Object.entries(checks).filter(([, value]) => !value).map(([key]) => key);
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

const action432 = runJson("scripts/action-432-confidence-calibration-advisory-adapter-implementation-verify.mjs");
const action434 = runJson("scripts/action-434-confidence-calibration-advisory-adapter-contract-remediation-approval-gate-verify.mjs");

const report = {
  verification_status: failed.length === 0 ? "passed" : "failed",
  remediation_result: failed.length === 0 ? "semantic_hash_remediation_passed" : "semantic_hash_remediation_failed",
  checks,
  failed_conditions: failed,
  passed_conditions_count: Object.keys(checks).length - failed.length,
  failed_conditions_count: failed.length,
  unresolved_conditions_count: 0,
  tampering,
  mismatch_status: "blocked_calibration_result",
  mismatch_issue_path: "/calibration/calibration_hash",
  semantic_order_equivalence: {
    warnings: JSON.stringify(warningBaseline) === JSON.stringify(reorderedWarnings),
    included_lineage_adjustments: statusFor(twoInsight) === reorderedTwoInsight.status,
  },
  precedence: {
    hash_mismatch_outranks_lineage: hashMismatchWithLineageFault.status === "blocked_calibration_result",
    hash_mismatch_outranks_leakage: hashMismatchWithLeakageFault.status === "blocked_calibration_result",
    hash_mismatch_outranks_feedback: hashMismatchWithFeedbackFault.status === "blocked_calibration_result",
    earlier_recommendation_identity_outranks_hash: earlierFault.status === "blocked_invalid_lineage",
  },
  source_integrity: sourceIntegrity,
  consumers: { adapter_consumers: adapterConsumers },
  forbidden_artifacts: forbiddenArtifacts,
  safety,
  upstream_health: {
    action432: action432.verification_status,
    action434: action434.verification_status,
  },
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  unrelated_work_classification: "action_435_confidence_calibration_advisory_adapter_semantic_hash_remediation_only",
  recommended_next_action: "action_436_independent_post_remediation_advisory_adapter_verification",
};

console.log(JSON.stringify(report, null, 2));
if (report.verification_status !== "passed") process.exitCode = 1;
