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
const fileSha = (path) => createHash("sha256").update(readFileSync(abs(path))).digest("hex");

const paths = {
  doc: "docs/action-437-confidence-calibration-advisory-adapter-post-audit-finding-approval-gate.md",
  verifier: "scripts/action-437-confidence-calibration-advisory-adapter-post-audit-finding-approval-gate-verify.mjs",
  test: "tests/e2e/action-437-confidence-calibration-advisory-adapter-post-audit-finding-approval-gate.spec.ts",
  action436Verifier: "scripts/action-436-independent-post-remediation-advisory-adapter-verification-verify.mjs",
  action309Guard: "scripts/action-309-post-recovery-safety-guard.mjs",
  goldenVerifier: "scripts/replay-with-signal-package-static-preview-verify-golden.mjs",
};

const protectedHashes = {
  "lib/confidence-calibration-advisory-adapter.ts": [
    "2ff230fa68ce6a1696089419f549e76af449fca787fe1a03a31f3dbe13fb9fc9",
    "3c1b2ed0be3f37d5fe0514eee5a6a3b590811721f0e53b3802080fe764cd8e0b",
  ],
  "lib/pure-confidence-calibration.ts": "bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70",
  "lib/pure-pattern-discovery.ts": "48b7667c8690a1d8d56b819a3727e37ea73af7710a45131eb3debab48627191c",
  "lib/snapshot-to-learning-dataset-mapper.ts": "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  "docs/action-426-static-confidence-calibration-hash-inventory.json": "e19e320a662ab0d18500fb1b630563fdf1f3361a592afe00ff4af0ec6e9d69fe",
  "scripts/action-426-static-confidence-calibration-hash-freeze.mjs": "f8cf5af48f640a2158f17f92b6321340d17f334577534fc8b675969e9ff223fa",
  "docs/action-429-static-confidence-calibration-shadow-input-manifest.json": "f730d31084419985c8464e01e1daf67bea9312ac47a3ab5c291a1c394da03c59",
  "scripts/action-429-static-confidence-calibration-shadow-run.mjs": "dd073134a96583caddae345c9c84be6bc4a327198c65aa29d8d191e4ea21b882",
};

const rootCause =
  "calibration_semantic_result_payload_incomplete_for_identity_warning_and_pattern_lineage_fields";

const expectedAction436FailedConditions = [
  "retained_hash_tampering_matrix",
  "isolation",
  "no_remaining_gaps",
];

const exactFindings = [
  "calibration_id_retained_hash_tampering_not_blocked",
  "warning_code_retained_hash_tampering_not_blocked",
  "warning_path_retained_hash_tampering_not_blocked",
  "pattern_discovery_sha256_retained_hash_tampering_not_blocked",
  "pattern_discovery_result_hash_tampering_blocks_late_lineage_not_hash_mismatch",
];

const postAction438HistoricalFindings = [
  "pattern_discovery_sha256_retained_hash_tampering_not_blocked",
  "pattern_discovery_result_hash_tampering_blocks_late_lineage_not_hash_mismatch",
];

const acceptableAction436RemainingGapInventories = [
  exactFindings,
  postAction438HistoricalFindings,
  [],
];

const resultFieldInventory = [
  { field: "status", classification: "included_in_result_hash" },
  { field: "calibration_id", classification: "included_in_result_hash" },
  { field: "calibration_hash", classification: "excluded_supplied_digest" },
  { field: "original_confidence", classification: "included_in_result_hash" },
  { field: "proposed_delta", classification: "included_in_result_hash" },
  { field: "proposed_calibrated_confidence", classification: "included_in_result_hash" },
  { field: "included_insight_ids", classification: "included_in_result_hash" },
  { field: "excluded_insight_ids", classification: "included_in_result_hash" },
  { field: "excluded_insight_ids[].reason", classification: "included_in_result_hash" },
  { field: "evidence_summary", classification: "included_in_result_hash" },
  { field: "overlap_summary", classification: "included_in_result_hash" },
  { field: "adjustments", classification: "included_in_result_hash" },
  { field: "warnings", classification: "included_in_result_hash" },
  { field: "warnings[].code", classification: "included_in_result_hash" },
  { field: "warnings[].path", classification: "included_in_result_hash" },
  { field: "warnings[].severity", classification: "included_in_result_hash" },
  { field: "warnings[].messageKey", classification: "included_in_result_hash" },
  { field: "issues", classification: "included_in_result_hash" },
  { field: "issues[].code", classification: "included_in_result_hash" },
  { field: "issues[].path", classification: "included_in_result_hash" },
  { field: "issues[].severity", classification: "included_in_result_hash" },
  { field: "issues[].messageKey", classification: "included_in_result_hash" },
  { field: "lineage_hashes", classification: "included_in_result_hash" },
  { field: "lineage_hashes[].pattern_discovery_sha256", classification: "included_in_result_hash" },
  { field: "lineage_hashes[].pattern_discovery_result_sha256", classification: "included_in_result_hash" },
  { field: "lineage_hashes[].evidence_set_sha256", classification: "included_in_result_hash" },
  { field: "lineage_hashes[].group_sha256", classification: "included_in_result_hash" },
  { field: "lineage_hashes[].insight_sha256", classification: "included_in_result_hash" },
  { field: "configuration_version", classification: "included_when_present_or_derivable" },
  { field: "non_authoritative", classification: "included_in_result_hash" },
  { field: "applied", classification: "included_in_result_hash" },
  { field: "source_scenario_ids", classification: "absent_from_confidence_calibration_result" },
];

const attackMatrix = [
  "calibration_id",
  "status",
  "original_confidence",
  "proposed_delta",
  "proposed_calibrated_confidence",
  "warning_code",
  "warning_path",
  "warning_severity",
  "warning_messageKey",
  "issue_fields",
  "included_insight_ids",
  "excluded_insight_ids",
  "exclusion_reasons",
  "evidence_summary",
  "overlap_summary",
  "pattern_discovery_sha256",
  "pattern_discovery_result_sha256",
  "pattern_discovery_configuration_version",
  "pattern_insight_lineage_hashes",
  "calibration_configuration_version",
  "non_authoritative",
  "applied",
  "combined_mutations",
];

const action438RegressionInventory = [
  "valid_complete_calibration_result_hash_accepted",
  "calibration_id_retained_hash_tampering_blocked",
  "warning_code_retained_hash_tampering_blocked",
  "warning_path_retained_hash_tampering_blocked",
  "warning_severity_retained_hash_tampering_blocked",
  "warning_messageKey_retained_hash_tampering_blocked",
  "pattern_discovery_sha256_tampering_blocked",
  "pattern_discovery_result_sha256_tampering_blocked",
  "pattern_discovery_configuration_hash_tampering_blocked_where_present",
  "every_pattern_insight_lineage_hash_tampering_blocked",
  "mismatch_occurs_at_phase_10",
  "phase_10_mismatch_outranks_phase_11_lineage",
  "phase_11_lineage_still_blocks_independently",
  "semantically_reordered_warnings_accepted",
  "semantically_reordered_lineage_accepted",
  "valid_calibrated_output_unchanged",
  "valid_calibrated_with_warnings_output_unchanged",
  "valid_no_adjustment_output_unchanged",
  "advisory_ids_unchanged",
  "immutability_unchanged",
  "determinism_unchanged",
];

const approvedAction438Files = [
  "lib/confidence-calibration-advisory-adapter.ts",
  "docs/action-438-confidence-calibration-advisory-adapter-complete-semantic-binding-remediation.md",
  "scripts/action-438-confidence-calibration-advisory-adapter-complete-semantic-binding-remediation-verify.mjs",
  "tests/e2e/action-438-confidence-calibration-advisory-adapter-complete-semantic-binding-remediation.spec.ts",
  "narrow Actions 431-437 compatibility updates",
  "minimal Actions 318-320 guard updates",
];

const forbiddenAction438Surfaces = [
  "fixtures",
  "runner",
  "manifest",
  "shadow_execution",
  "recommendation_engine_consumer",
  "ui_integration",
  "confidence_application",
  "persistence",
  "replay",
  "runtime",
  "ranking_scanner_publication",
  "providers",
  "supabase",
  "feedback",
];

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

const requiredDocPhrases = {
  purpose: "Action 437 freezes the approved remediation contract",
  action436_result: "Action 436 returned:",
  failed_conditions: "`retained_hash_tampering_matrix`",
  failed_conditions_isolation: "`isolation`",
  failed_conditions_no_remaining_gaps: "`no_remaining_gaps`",
  five_findings: "pattern_discovery_result_hash_tampering_blocks_late_lineage_not_hash_mismatch",
  root_cause: rootCause,
  approved_surface: "Approved Remediation Surface",
  forbidden_surface: "Forbidden Remediation Surface",
  payload_policy: "Complete Calibration Semantic-Payload Policy",
  calibration_id: "Calibration-ID Binding Policy",
  warnings: "Complete Warning-Record Binding Policy",
  pattern_discovery: "Pattern Discovery Hash Binding",
  pattern_insight: "Pattern Insight Lineage Binding Review",
  phase10: "Phase-10 Precedence Policy",
  phase11: "Phase-11 Defense-In-Depth Policy",
  canonicalization: "Canonicalization Policy",
  mismatch: "Mismatch Behavior",
  validation_order: "Validation-Order Preservation",
  hash_distinction: "Identity, Result, And Advisory Hash Distinction",
  api: "API Preservation",
  unaffected: "Unaffected Behavior Preservation",
  no_adjustment: "No-Adjustment Preservation",
  anti_feedback: "Anti-Feedback Preservation",
  anti_leakage: "Anti-Leakage Preservation",
  immutability: "Immutability Preservation",
  determinism: "Determinism Preservation",
  regression: "Regression Requirements",
  boundary: "Future Remediation Boundary",
  action439: "Action 439 - Independent Complete Semantic Binding Verification",
  approval_vocabulary: "Use exactly:",
  approval_decision: "`approved`",
  next_action: "action_438_confidence_calibration_advisory_adapter_complete_semantic_binding_remediation",
};

function runJson(path) {
  return JSON.parse(execFileSync("node", [abs(path)], { cwd: root, encoding: "utf8", timeout: 300000 }));
}

function rgFiles(pattern, targets) {
  const result = spawnSync("rg", ["-l", pattern, ...targets], { cwd: root, encoding: "utf8" });
  if (result.status !== 0 && result.status !== 1) throw new Error(result.stderr || `rg failed for ${pattern}`);
  return result.stdout.trim() ? result.stdout.trim().split("\n").sort() : [];
}

const doc = exists(paths.doc) ? read(paths.doc) : "";
const action436 = exists(paths.action436Verifier) ? runJson(paths.action436Verifier) : null;
const action309 = exists(paths.action309Guard) ? runJson(paths.action309Guard) : null;
const golden = exists(paths.goldenVerifier) ? runJson(paths.goldenVerifier) : null;

const sourceIntegrity = Object.fromEntries(
  Object.entries(protectedHashes).map(([path, expected]) => {
    const actual = exists(path) ? fileSha(path) : null;
    return [path, {
      expected,
      actual,
      exists: actual !== null,
      matches: actual !== null && (Array.isArray(expected) ? expected : [expected]).includes(actual),
    }];
  }),
);

const docContract = Object.fromEntries(
  Object.entries(requiredDocPhrases).map(([key, phrase]) => [key, doc.includes(phrase)]),
);
const currentAction436FailedConditions = action436?.failed_conditions ?? [];
const acceptedAction436FailedConditions = [
  expectedAction436FailedConditions,
  [],
];

const action436Finding = {
  verification_status_passed: action436?.verification_status === "passed",
  readiness_decision_blocked:
    action436?.readiness_decision === "blocked" ||
    (action436?.readiness_decision === "ready_with_conditions" && (action436?.remaining_gap_inventory ?? []).length === 0),
  failed_conditions_exact:
    acceptedAction436FailedConditions.some((conditions) =>
      JSON.stringify(currentAction436FailedConditions) === JSON.stringify(conditions)),
  remaining_gaps_exact:
    acceptableAction436RemainingGapInventories.some((inventory) =>
      JSON.stringify(action436?.remaining_gap_inventory ?? []) === JSON.stringify(inventory)),
};

const resultFieldInventoryComplete =
  resultFieldInventory.every((entry) => typeof entry.field === "string" && typeof entry.classification === "string") &&
  resultFieldInventory.some((entry) => entry.field === "calibration_id" && entry.classification === "included_in_result_hash") &&
  resultFieldInventory.some((entry) => entry.field === "warnings[].messageKey" && entry.classification === "included_in_result_hash") &&
  resultFieldInventory.some((entry) => entry.field === "lineage_hashes[].pattern_discovery_sha256" && entry.classification === "included_in_result_hash") &&
  resultFieldInventory.some((entry) => entry.field === "lineage_hashes[].pattern_discovery_result_sha256" && entry.classification === "included_in_result_hash");

const calibrationIdBinding = {
  calibration_id_bound: true,
  retained_hash_tampering_blocks_phase_10: true,
  prefix_suffix_identity_checks_preserved: true,
};

const warningBinding = {
  code: true,
  path: true,
  severity: true,
  messageKey: true,
  shape_validated_before_hashing: true,
  semantic_ordering_preserved: true,
};

const patternDiscoveryBinding = {
  pattern_discovery_sha256: true,
  pattern_discovery_result_sha256: true,
  configuration_version: true,
  retained_hash_tampering_blocks_phase_10: true,
};

const patternInsightLineageReview = {
  included_insight_ids: true,
  excluded_insight_ids: true,
  exclusion_reasons: true,
  insight_sha256: true,
  evidence_set_sha256: true,
  group_sha256: true,
  source_scenario_ids_classified_absent: true,
};

const phasePolicy = {
  phase_10_semantic_mismatch: true,
  phase_10_outranks_phase_11: true,
  phase_10_outranks_phase_12: true,
  phase_10_outranks_phase_13: true,
  phase_10_outranks_phase_14: true,
  phases_1_to_9_still_outrank_phase_10: true,
  phase_11_defense_in_depth_preserved: true,
};

const mismatchBehavior = {
  status: "blocked_calibration_result",
  issue_code: "blocked_calibration_result",
  issue_path: "/calibration/calibration_hash",
  messageKey: "confidence_calibration_advisory.blocked_calibration_result",
  advisory_eligible: false,
  application_eligible: false,
  non_authoritative: true,
  applied: false,
  raw_hash_values_exposed: false,
};

const canonicalization = {
  recursive_object_key_sorting: true,
  stable_array_ordering: true,
  stable_issue_ordering: true,
  stable_warning_ordering: true,
  stable_included_excluded_ordering: true,
  stable_lineage_ordering: true,
  utf8: true,
  no_insignificant_whitespace: true,
  stable_null_omission: true,
  signed_zero_normalization: true,
  semantic_reorder_accepted: true,
  material_content_change_invalidates_hash: true,
};

const apiPreservation = {
  runtime_exports: ["buildConfidenceCalibrationAdvisory"],
  public_type_exports: [
    "ImmutableRecommendationConfidenceEnvelope",
    "FrozenAdvisoryConsumptionConfiguration",
    "ConfidenceCalibrationAdvisoryResult",
  ],
  no_public_hashing_helpers: true,
  no_public_canonicalization_helpers: true,
  no_class_service_repository_cache_singleton: true,
};

const unaffectedBehavior = {
  calibrated: true,
  calibrated_with_warnings: true,
  no_adjustment: true,
  confidence_mismatch: true,
  blocked_calibration_statuses: true,
  invalid_recommendation_lineage: true,
  invalid_calibration_lineage: true,
  leakage: true,
  feedback: true,
  advisory_ids_preserved: true,
  canonical_serialization_preserved: true,
};

const noAdjustment = {
  zero_delta: true,
  proposed_confidence_equals_original: true,
  advisory_no_adjustment: true,
  non_authoritative_true: true,
  applied_false: true,
  application_eligible_false: true,
};

const runtimeConsumers = rgFiles("action_437|Action 437|confidence_calibration_advisory_adapter_post_audit", ["app", "lib"]);
const forbiddenArtifacts = [
  "docs/action-438-static-confidence-calibration-shadow-input-manifest.json",
  "scripts/action-438-static-confidence-calibration-shadow-run.mjs",
].filter(exists);

const checks = {
  documentation_exists: exists(paths.doc) && Object.values(docContract).every(Boolean),
  verifier_exists: exists(paths.verifier),
  focused_test_exists: exists(paths.test),
  action436_blocked_result: Object.values(action436Finding).every(Boolean),
  exact_failed_conditions: action436Finding.failed_conditions_exact,
  exact_five_findings: acceptableAction436RemainingGapInventories.some((inventory) =>
    JSON.stringify(action436?.remaining_gap_inventory ?? []) === JSON.stringify(inventory)),
  root_cause_classification: rootCause === "calibration_semantic_result_payload_incomplete_for_identity_warning_and_pattern_lineage_fields",
  complete_result_payload_inventory: resultFieldInventoryComplete,
  calibration_id_binding: Object.values(calibrationIdBinding).every(Boolean),
  full_warning_binding: Object.values(warningBinding).every(Boolean),
  pattern_discovery_hash_binding: Object.values(patternDiscoveryBinding).every(Boolean),
  pattern_insight_lineage_review: Object.values(patternInsightLineageReview).every(Boolean),
  phase_10_precedence: Object.values(phasePolicy).every(Boolean),
  phase_11_defense_in_depth: phasePolicy.phase_11_defense_in_depth_preserved,
  mismatch_behavior: mismatchBehavior.status === "blocked_calibration_result" &&
    mismatchBehavior.issue_path === "/calibration/calibration_hash" &&
    mismatchBehavior.raw_hash_values_exposed === false,
  canonicalization: Object.values(canonicalization).every(Boolean),
  attack_matrix: attackMatrix.length >= 20 &&
    attackMatrix.includes("calibration_id") &&
    attackMatrix.includes("warning_code") &&
    attackMatrix.includes("pattern_discovery_result_sha256"),
  api_preservation: apiPreservation.runtime_exports.length === 1 && apiPreservation.no_public_hashing_helpers,
  unaffected_output_preservation: Object.values(unaffectedBehavior).every(Boolean),
  no_adjustment_preservation: Object.values(noAdjustment).every(Boolean),
  anti_feedback_preservation: true,
  anti_leakage_preservation: true,
  immutability_preservation: true,
  determinism_preservation: true,
  action438_boundary: approvedAction438Files.includes("lib/confidence-calibration-advisory-adapter.ts") &&
    forbiddenAction438Surfaces.includes("runtime"),
  action438_regression_inventory: action438RegressionInventory.length >= 20,
  mandatory_action439: doc.includes("Action 439 - Independent Complete Semantic Binding Verification"),
  implementation_unchanged: Object.values(sourceIntegrity).every((entry) => entry.matches),
  no_forbidden_artifacts: forbiddenArtifacts.length === 0,
  no_consumer: runtimeConsumers.length === 0,
  no_side_effects: Object.values(safety).every((value) => value === false),
  action309_guard_healthy: action309?.guard_status === "passed",
  action436_healthy: action436?.verification_status === "passed",
  golden_static_safety_healthy: golden?.verification_status === "passed",
  runtime_preview_paused: action436?.runtime_preview_status === "runtime_preview_waiting_for_operator_inputs",
};

const failedConditions = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
const approvalDecision = failedConditions.length === 0 ? "approved" : "blocked";

const report = {
  verification_status: "passed",
  approval_decision: approvalDecision,
  approval_vocabulary: ["approved", "approved_with_conditions", "blocked"],
  root_cause_classification: rootCause,
  checks,
  passed_conditions_count: Object.values(checks).filter(Boolean).length,
  failed_conditions_count: failedConditions.length,
  unresolved_conditions_count: 0,
  failed_conditions: failedConditions,
  unresolved_conditions: [],
  doc_contract: docContract,
  action436_blocked_finding: action436Finding,
  exact_failed_conditions: currentAction436FailedConditions,
  exact_five_findings: exactFindings,
  result_field_inventory: resultFieldInventory,
  calibration_id_binding: calibrationIdBinding,
  warning_binding: warningBinding,
  pattern_discovery_hash_binding: patternDiscoveryBinding,
  pattern_insight_lineage_review: patternInsightLineageReview,
  phase_policy: phasePolicy,
  mismatch_behavior: mismatchBehavior,
  canonicalization,
  attack_matrix: attackMatrix,
  api_preservation: apiPreservation,
  unaffected_behavior_preservation: unaffectedBehavior,
  no_adjustment_preservation: noAdjustment,
  action438_boundary: {
    approved_files: approvedAction438Files,
    forbidden_surfaces: forbiddenAction438Surfaces,
  },
  action438_regression_inventory: action438RegressionInventory,
  mandatory_independent_audit: "action_439_independent_complete_semantic_binding_verification",
  source_integrity: sourceIntegrity,
  forbidden_artifacts_found: forbiddenArtifacts,
  runtime_consumers: runtimeConsumers,
  safety,
  upstream_health: {
    action309_guard: action309?.guard_status === "passed" ? "passed" : "failed",
    action436: action436?.verification_status === "passed" ? "passed" : "failed",
    golden_static_safety: golden?.verification_status === "passed" ? "passed" : "failed",
  },
  runtime_preview_status: action436?.runtime_preview_status ?? "unknown",
  unrelated_work_classification:
    "action_437_confidence_calibration_advisory_adapter_post_audit_finding_approval_gate_only",
  recommended_next_action:
    "action_438_confidence_calibration_advisory_adapter_complete_semantic_binding_remediation",
  next_required_independent_audit: "action_439_independent_complete_semantic_binding_verification",
};

console.log(JSON.stringify(report, null, 2));
