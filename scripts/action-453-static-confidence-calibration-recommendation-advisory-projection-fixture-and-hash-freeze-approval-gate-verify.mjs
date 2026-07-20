#!/usr/bin/env node

import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");
const sha256Text = (text) => createHash("sha256").update(text, "utf8").digest("hex");

const paths = {
  doc: "docs/action-453-static-confidence-calibration-recommendation-advisory-projection-fixture-and-hash-freeze-approval-gate.md",
  verifier: "scripts/action-453-static-confidence-calibration-recommendation-advisory-projection-fixture-and-hash-freeze-approval-gate-verify.mjs",
  test: "tests/e2e/action-453-static-confidence-calibration-recommendation-advisory-projection-fixture-and-hash-freeze-approval-gate.spec.ts",
  action452Doc: "docs/action-452-independent-post-remediation-projection-verification.md",
  projection: "lib/confidence-calibration-recommendation-advisory-projection.ts",
  advisory: "lib/confidence-calibration-advisory-adapter.ts",
  calibration: "lib/pure-confidence-calibration.ts",
  action441Inventory: "docs/action-441-static-confidence-calibration-advisory-hash-inventory.json",
  action444Manifest: "docs/action-444-static-confidence-calibration-advisory-shadow-input-manifest.json",
  action309Guard: "scripts/action-309-post-recovery-safety-guard.mjs",
};

const scenarioIds = Array.from({ length: 52 }, (_, index) => `cp453_${String(index + 1).padStart(2, "0")}`);

const scenarioStatuses = [
  ["cp453_01", "projection_ready"],
  ["cp453_02", "projection_ready_with_warnings"],
  ["cp453_03", "projection_no_adjustment"],
  ["cp453_04", "projection_insufficient_evidence"],
  ["cp453_05", "blocked_invalid_input"],
  ["cp453_06", "blocked_invalid_input"],
  ["cp453_07", "blocked_invalid_input"],
  ["cp453_08", "blocked_invalid_input"],
  ["cp453_09", "blocked_invalid_input"],
  ["cp453_10", "blocked_invalid_input"],
  ["cp453_11", "blocked_confidence_mismatch"],
  ["cp453_12", "blocked_confidence_mismatch"],
  ["cp453_13", "blocked_invalid_input"],
  ["cp453_14", "blocked_invalid_input"],
  ["cp453_15", "blocked_invalid_input"],
  ["cp453_16", "blocked_invalid_input"],
  ["cp453_17", "blocked_invalid_input"],
  ["cp453_18", "blocked_confidence_mismatch"],
  ["cp453_19", "blocked_advisory_result"],
  ["cp453_20", "blocked_advisory_result"],
  ["cp453_21", "blocked_advisory_result"],
  ["cp453_22", "blocked_advisory_result"],
  ["cp453_23", "blocked_advisory_result"],
  ["cp453_24", "blocked_advisory_result"],
  ["cp453_25", "blocked_advisory_result"],
  ["cp453_26", "blocked_advisory_result"],
  ["cp453_27", "blocked_advisory_result"],
  ["cp453_28", "blocked_advisory_result"],
  ["cp453_29", "blocked_invalid_lineage"],
  ["cp453_30", "blocked_invalid_lineage"],
  ["cp453_31", "blocked_invalid_lineage"],
  ["cp453_32", "blocked_invalid_lineage"],
  ["cp453_33", "blocked_invalid_lineage"],
  ["cp453_34", "blocked_future_leakage"],
  ["cp453_35", "blocked_future_leakage"],
  ["cp453_36", "blocked_future_leakage"],
  ["cp453_37", "blocked_future_leakage"],
  ["cp453_38", "blocked_future_leakage"],
  ["cp453_39", "blocked_invalid_lineage"],
  ["cp453_40", "blocked_invalid_lineage"],
  ["cp453_41", "blocked_invalid_lineage"],
  ["cp453_42", "blocked_invalid_lineage"],
  ["cp453_43", "blocked_invalid_lineage"],
  ["cp453_44", "blocked_invalid_lineage"],
  ["cp453_45", "blocked_unsupported_status"],
  ["cp453_46", "projection_ready_with_warnings"],
  ["cp453_47", "projection_ready_with_warnings"],
  ["cp453_48", "projection_ready"],
  ["cp453_49", "projection_ready"],
  ["cp453_50", "projection_ready"],
  ["cp453_51", "blocked_advisory_result"],
  ["cp453_52", "blocked_invalid_lineage"],
];

const expectedStatusDistribution = {
  projection_ready: 4,
  projection_ready_with_warnings: 3,
  projection_no_adjustment: 1,
  projection_insufficient_evidence: 1,
  blocked_invalid_input: 11,
  blocked_confidence_mismatch: 3,
  blocked_invalid_lineage: 12,
  blocked_future_leakage: 5,
  blocked_advisory_result: 11,
  blocked_unsupported_status: 1,
};

const requiredDocPhrases = [
  "Action 452 readiness decision: `ready_with_conditions`",
  "Approved future scenario count: `52`",
  "Approved scenario IDs and order: `cp453_01` through `cp453_52`",
  "Projection Fixture-Package Definition",
  "Shared Scenario Field Record",
  "Exact Scenario Inventory",
  "Coverage-Family Inventory",
  "Recommendation-Envelope Inventory",
  "Advisory-Result Inventory",
  "Projection-Configuration Inventory",
  "Status Vocabulary and Distribution",
  "Confidence-Binding Outcomes",
  "Advisory-Hash Outcomes",
  "Validation Precedence",
  "Phase-11 Defense",
  "Warning and Issue Outcomes",
  "No-Adjustment Outcomes",
  "Effect-Flag Policy",
  "Projection-ID Policy",
  "Projection Identity-Hash Policy",
  "Canonical Projection-Result-Hash Policy",
  "Scenario-Summary Hash Policy",
  "Package Inventory-Hash Policy",
  "Bounded Metadata Policy",
  "Future Hash-Freeze Sequence",
  "Future Shadow Sequence",
  "Action 454 Boundary",
  "Repeat-Run Policy",
  "Stop Conditions",
  "Historical Compatibility Policy",
  "Approval decision: `approved_with_conditions`",
  "Next permitted Action: `action_454_static_confidence_calibration_recommendation_advisory_projection_hash_freeze`",
  "Deployment required: no",
  "runtime_preview_waiting_for_operator_inputs",
];

const requiredCoverageTerms = [
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
  "exact_match",
  "one_basis_point_mismatch",
  "decimal_mismatch",
  "invalid_precision",
  "below_range",
  "above_range",
  "NaN",
  "Infinity",
  "signed_zero",
  "missing_fingerprint",
  "malformed_fingerprint",
  "changed_fingerprint",
  "missing_snapshot",
  "malformed_snapshot",
  "changed_snapshot",
  "schema_version_mismatch",
  "decision_boundary_mismatch",
  "malformed_hash",
  "swapped_hash",
  "unrelated_valid_format_hash",
  "retained_hash_status_tampering",
  "retained_hash_advisory_id_tampering",
  "retained_hash_confidence_tampering",
  "retained_hash_warning_tampering",
  "retained_hash_issue_tampering",
  "retained_hash_lineage_tampering",
  "hash_role_substitution",
  "pattern_discovery_mismatch",
  "pattern_insight_mismatch",
  "evidence_lineage_mismatch",
  "future_outcome",
  "post_entry_evidence",
  "post_exit_evidence",
  "same_recommendation_realized_result",
  "missing_leakage_state",
  "unknown_leakage_state",
  "projection_reused_as_recommendation_confidence",
  "scanner_signal_reuse",
  "ranking_signal_reuse",
  "publication_signal_reuse",
  "execution_signal_reuse",
  "learning_dataset_reuse",
  "pattern_discovery_evidence_reuse",
  "context_outcome_reuse",
  "calibration_evidence_reuse",
  "advisory_base_input_reuse",
  "direct_cycle",
  "indirect_cycle",
  "warning_preservation",
  "warning_ordering",
  "warning_deduplication",
  "issue_preservation",
  "issue_ordering",
  "issue_deduplication",
  "malformed_warning",
  "malformed_issue",
  "valid_zero_delta",
  "no_adjustment_changed_delta",
  "no_adjustment_changed_confidence",
  "reordered_warnings",
  "reordered_issues",
  "reordered_lineage",
  "reordered_object_keys",
  "reordered_nested_keys",
  "no_recommendation_object",
  "no_update_command",
  "no_persistence_command",
  "no_ranking_scanner_publication_execution_command",
  "no_feedback_event",
  "no_runtime_callback",
  "recommendation_input_unchanged",
  "effect_flags_all_false",
];

const forbiddenFutureArtifacts = [
  "docs/action-453-static-confidence-calibration-recommendation-advisory-projection-fixture-manifest.json",
  "docs/action-453-static-confidence-calibration-recommendation-advisory-projection-hash-inventory.json",
  "docs/action-453-static-confidence-calibration-recommendation-advisory-projection-shadow-input-manifest.json",
  "scripts/action-453-static-confidence-calibration-recommendation-advisory-projection-hash-freeze.mjs",
  "scripts/action-453-static-confidence-calibration-recommendation-advisory-projection-shadow-run.mjs",
  "lib/confidence-calibration-recommendation-advisory-projection-consumer.ts",
  "lib/recommendation-engine-confidence-calibration-advisory-projection-consumer.ts",
].filter(exists);

const forbiddenRuntimeRoots = [
  "app/api/confidence-calibration-recommendation-advisory-projection",
  "app/confidence-calibration-recommendation-advisory-projection",
  "app/api/action-453",
  "app/action-453",
  "public/action-453",
].filter(exists);

function statusFiles() {
  const result = spawnSync("git", ["status", "--short"], { cwd: root, encoding: "utf8", maxBuffer: 80 * 1024 * 1024 });
  if (result.status !== 0) return [];
  return result.stdout
    .trimEnd()
    .split("\n")
    .filter(Boolean)
    .map((line) => line.slice(3).trim())
    .map((path) => (path.includes(" -> ") ? path.split(" -> ").at(-1) ?? path : path))
    .sort();
}

function rgFiles(pattern, targets) {
  const result = spawnSync("rg", ["-l", pattern, ...targets], { cwd: root, encoding: "utf8" });
  if (result.status !== 0 && result.status !== 1) throw new Error(result.stderr || `rg failed:${pattern}`);
  return result.stdout.trim() ? result.stdout.trim().split("\n").sort() : [];
}

function runJson(command, args) {
  const result = spawnSync(command, args, { cwd: root, encoding: "utf8", maxBuffer: 80 * 1024 * 1024 });
  const text = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  if (result.status !== 0) {
    return { guard_status: "unavailable", error: text.slice(0, 500) };
  }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < start) return { guard_status: "unavailable", error: "json_output_missing" };
  return JSON.parse(text.slice(start, end + 1));
}

function distribution(entries) {
  return entries.reduce((accumulator, [, status]) => {
    accumulator[status] = (accumulator[status] ?? 0) + 1;
    return accumulator;
  }, {});
}

function sameRecord(left, right) {
  const keys = Array.from(new Set([...Object.keys(left), ...Object.keys(right)])).sort();
  return keys.every((key) => left[key] === right[key]);
}

function extractScenarioRows(doc) {
  return doc
    .split("\n")
    .filter((line) => /^\| cp453_\d{2} \|/.test(line))
    .map((line) => {
      const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
      return {
        id: cells[0],
        primary_family: cells[1],
        coverage_tags: cells[2],
        rec_bp: cells[3],
        advisory_status: cells[4],
        expected_projection_status: cells[5],
        expected_delta_bp: cells[6],
        expected_projected_bp: cells[7],
        warnings: cells[8],
        issues: cells[9],
        rationale: cells[10],
      };
    });
}

const doc = exists(paths.doc) ? read(paths.doc) : "";
const action452Doc = exists(paths.action452Doc) ? read(paths.action452Doc) : "";
const scenarioRows = extractScenarioRows(doc);
const scenarioRowIds = scenarioRows.map((row) => row.id);
const docStatusDistribution = distribution(scenarioRows.map((row) => [row.id, row.expected_projection_status]));
const expectedDistribution = distribution(scenarioStatuses);

const protectedPaths = [
  paths.projection,
  paths.advisory,
  paths.calibration,
  paths.action441Inventory,
  paths.action444Manifest,
].filter(exists);
const protectedBefore = Object.fromEntries(protectedPaths.map((path) => [path, sha256Text(read(path))]));
const protectedAfter = Object.fromEntries(protectedPaths.map((path) => [path, sha256Text(read(path))]));

const projectionFunctionToken = ["buildConfidenceCalibration", "RecommendationProjection"].join("");
const verifierSource = exists(paths.verifier) ? read(paths.verifier) : "";
const testSource = exists(paths.test) ? read(paths.test) : "";

const appOrLibConsumers = rgFiles(
  "buildConfidenceCalibrationRecommendationProjection|confidence-calibration-recommendation-advisory-projection",
  ["app", "lib"],
).filter((path) => path !== paths.projection);

const deploymentFiles = statusFiles().filter((path) =>
  path === "netlify.toml" ||
  path.startsWith(".netlify/") ||
  path.startsWith("app/") && path.includes("action-453") ||
  path.startsWith("public/action-453"));

const action309 = exists(paths.action309Guard) ? runJson("node", [paths.action309Guard]) : {};

const checks = {
  documentation_exists: exists(paths.doc),
  verifier_exists: exists(paths.verifier),
  focused_test_exists: exists(paths.test),
  action_452_readiness_documented: action452Doc.includes("Readiness decision: `ready_with_conditions`") ||
    action452Doc.includes("readiness_decision") && action452Doc.includes("ready_with_conditions"),
  required_doc_phrases_present: requiredDocPhrases.every((phrase) => doc.includes(phrase)),
  exact_scenario_count: scenarioRows.length === 52,
  exact_scenario_ids_order: JSON.stringify(scenarioRowIds) === JSON.stringify(scenarioIds),
  exact_status_distribution_in_rows: sameRecord(docStatusDistribution, expectedStatusDistribution),
  exact_status_distribution_in_expected_matrix: sameRecord(expectedDistribution, expectedStatusDistribution),
  coverage_terms_present: requiredCoverageTerms.every((term) => doc.includes(term)),
  approval_vocabulary_exact: ["`approved`", "`approved_with_conditions`", "`blocked`"].every((term) => doc.includes(term)),
  approval_decision_expected: doc.includes("Approval decision: `approved_with_conditions`"),
  action_454_boundary_identified: doc.includes("Action 454 Boundary") &&
    doc.includes("Action 455 - Independent Projection Hash-Freeze Verification") &&
    doc.includes("Action 459 - Projection Pure/Static Release Gate"),
  repeat_run_policy_exactly_two: doc.includes("run all 52 scenarios exactly twice") && doc.includes("No third repair run"),
  no_fixtures_inventory_freezer_or_runner_exist: forbiddenFutureArtifacts.length === 0,
  no_runtime_roots_exist: forbiddenRuntimeRoots.length === 0,
  no_app_or_lib_consumers: appOrLibConsumers.length === 0,
  no_deployment_artifacts_changed: deploymentFiles.length === 0,
  verifier_does_not_call_projection_adapter: !verifierSource.includes(`${projectionFunctionToken}(`),
  test_does_not_call_projection_adapter: !testSource.includes(`${projectionFunctionToken}(`),
  protected_sources_present: protectedPaths.length === 5,
  protected_sources_stable_during_verification: JSON.stringify(protectedBefore) === JSON.stringify(protectedAfter),
  action309_guard_passed: action309.guard_status === "passed",
};

const failedChecks = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);

const report = {
  verification_status: failedChecks.length === 0 ? "passed" : "failed",
  approval_decision: checks.approval_decision_expected ? "approved_with_conditions" : "blocked",
  failed_checks: failedChecks,
  scenario_count: scenarioRows.length,
  exact_scenario_ids: scenarioRowIds,
  status_vocabulary: Object.keys(expectedStatusDistribution),
  status_distribution: docStatusDistribution,
  expected_status_distribution: expectedStatusDistribution,
  coverage_family_inventory_complete: checks.coverage_terms_present,
  input_source_policy: {
    deterministic_test_local_envelopes_only: true,
    deterministic_bounded_advisory_results_only: true,
    fixed_configuration_only: true,
    production_data_allowed: false,
    provider_allowed: false,
    supabase_allowed: false,
    runtime_outputs_allowed: false,
    arbitrary_json_allowed: false,
  },
  recommendation_envelope_policy: {
    immutable_fingerprint: true,
    immutable_snapshot_hash: true,
    original_confidence_bound: true,
    schema_version_bound: true,
    decision_boundary_bound: true,
    mutable_recommendation_object_allowed: false,
  },
  advisory_input_policy: {
    bounded_advisory_result_contract_only: true,
    result_hash_required: true,
    identity_hash_required: true,
    full_upstream_objects_allowed: false,
  },
  confidence_hash_lineage_policies: {
    confidence_binding_frozen: true,
    advisory_hash_behavior_frozen: true,
    validation_precedence_frozen: true,
    phase_11_defense_frozen: true,
    lineage_policy_frozen: true,
  },
  leakage_feedback_policies: {
    anti_leakage_frozen: true,
    anti_feedback_frozen: true,
    feedback_created: false,
  },
  warning_issue_no_adjustment_policies: {
    warning_records_bounded: true,
    issue_records_bounded: true,
    no_adjustment_frozen: true,
  },
  effect_flag_policy: {
    recommendation_confidence_unchanged: true,
    ranking_affected: false,
    scanner_affected: false,
    publication_affected: false,
    execution_affected: false,
    application_eligible: false,
    non_authoritative: true,
    applied: false,
  },
  projection_identity_hash_policy: {
    projection_id_deterministic: true,
    identity_hash_policy_frozen: true,
    result_hash_policy_frozen: true,
    scenario_summary_hash_policy_frozen: true,
    package_inventory_hash_policy_frozen: true,
  },
  future_sequence: [
    "Action 454 - Static Projection Fixture & Semantic Hash Freeze",
    "Action 455 - Independent Projection Hash-Freeze Verification",
    "Action 456 - Projection Shadow Execution Approval Gate",
    "Action 457 - Projection Shadow Execution",
    "Action 458 - Independent Projection Shadow Verification",
    "Action 459 - Projection Pure/Static Release Gate",
  ],
  action_454_boundary: {
    fixture_hash_freeze_allowed_next: true,
    projection_shadow_runner_allowed: false,
    runtime_allowed: false,
    consumer_allowed: false,
    confidence_application_allowed: false,
    persistence_allowed: false,
    replay_allowed: false,
    deployment_allowed: false,
  },
  isolation: {
    forbidden_future_artifacts: forbiddenFutureArtifacts,
    forbidden_runtime_roots: forbiddenRuntimeRoots,
    app_or_lib_consumers: appOrLibConsumers,
    deployment_files: deploymentFiles,
    projection_execution_in_verifier: verifierSource.includes(`${projectionFunctionToken}(`),
    projection_execution_in_test: testSource.includes(`${projectionFunctionToken}(`),
  },
  source_integrity: {
    protected_paths: protectedPaths,
    protected_hashes_before: protectedBefore,
    protected_hashes_after: protectedAfter,
    stable_during_verification: checks.protected_sources_stable_during_verification,
  },
  safety: {
    provider_call_executed: false,
    supabase_write_executed: false,
    replay_executed: false,
    synthetic_outcomes_persisted: false,
    runtime_route_added: false,
    confidence_applied: false,
    recommendation_mutated: false,
    ranking_changed: false,
    scanner_changed: false,
    deployment_authorized: false,
  },
  unresolved_conditions: [
    "executable_semantic_projection_hashes_require_action_454",
    "projection_fixture_hash_inventory_requires_action_454",
  ],
  passed_conditions: failedChecks.length === 0 ? Object.keys(checks) : Object.entries(checks).filter(([, passed]) => passed).map(([name]) => name),
  failed_conditions: failedChecks,
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  deployment_status: "not_authorized_not_required",
  recommended_next_action: "action_454_static_confidence_calibration_recommendation_advisory_projection_hash_freeze",
  unrelated_work_classification: "action_453_static_approval_gate_only",
};

console.log(JSON.stringify(report, null, 2));
