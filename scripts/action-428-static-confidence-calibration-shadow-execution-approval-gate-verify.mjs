#!/usr/bin/env node

import { createHash } from "crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const paths = {
  doc: "docs/action-428-static-confidence-calibration-shadow-execution-approval-gate.md",
  verifier: "scripts/action-428-static-confidence-calibration-shadow-execution-approval-gate-verify.mjs",
  test: "tests/e2e/action-428-static-confidence-calibration-shadow-execution-approval-gate.spec.ts",
  action427Doc: "docs/action-427-independent-static-confidence-calibration-hash-freeze-verification.md",
  action427Verifier: "scripts/action-427-independent-static-confidence-calibration-hash-freeze-verification-verify.mjs",
  action426Inventory: "docs/action-426-static-confidence-calibration-hash-inventory.json",
  futureManifest: "docs/action-429-static-confidence-calibration-shadow-input-manifest.json",
  futureRunner: "scripts/action-429-static-confidence-calibration-shadow-run.mjs",
  futureDoc: "docs/action-429-static-confidence-calibration-shadow-use.md",
  futureVerifier: "scripts/action-429-static-confidence-calibration-shadow-use-verify.mjs",
  futureTest: "tests/e2e/action-429-static-confidence-calibration-shadow-use.spec.ts",
};

const expectedInventoryHash = "875f385a05f58d982baa182350a662db5518e13f8c18557e4697317deb724cc5";
const expectedIds = Array.from({ length: 45 }, (_, index) => `cc425_${String(index + 1).padStart(2, "0")}`);
const expectedStatusDistribution = {
  calibrated: 14,
  calibrated_with_warnings: 11,
  no_adjustment: 5,
  blocked_invalid_input: 9,
  blocked_overlapping_evidence: 1,
  blocked_unsupported_insight: 1,
  blocked_invalid_lineage: 1,
  blocked_future_leakage: 1,
  blocked_invalid_configuration: 1,
  insufficient_eligible_evidence: 1,
};
const expectedWarningDistribution = {
  duplicate_mapper_row_identity: 4,
  metric_value_unavailable: 3,
  duplicate_insight_deduped: 1,
  overlapping_insight_excluded: 3,
  confidence_clamped_to_bounds: 2,
};
const expectedIssueDistribution = {
  warning_status_contradiction: 2,
  overlapping_evidence_conflict: 2,
  ineligible_pattern_discovery_status: 1,
  invalid_lineage: 1,
  future_leakage: 1,
  invalid_insight_structure: 1,
  invalid_configuration_shape: 1,
  invalid_base_confidence: 6,
  insufficient_eligible_evidence: 1,
};
const expectedProtectedHashes = {
  "lib/pure-confidence-calibration.ts": "bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70",
  "lib/pure-pattern-discovery.ts": "48b7667c8690a1d8d56b819a3727e37ea73af7710a45131eb3debab48627191c",
  "lib/snapshot-to-learning-dataset-mapper.ts": "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  "lib/learning-dataset-static-fixtures.ts": "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  "lib/intelligence-context-static-fixtures.ts": "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  "lib/pattern-insight-static-fixtures.ts": "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
  "docs/action-416-expanded-static-pattern-discovery-shadow-input-manifest.json": "dbafd56a7c0f8c2eb79f22039cb9b1225e42f246e78ca278cd4344f72d39d652",
  "scripts/action-416-expanded-static-pattern-discovery-shadow-run.mjs": "b77f018e888d736dbf696ac0acc0b5c16a826b2bab26f09db42ecc28f956d7ea",
  "scripts/action-426-static-confidence-calibration-hash-freeze.mjs": "f8cf5af48f640a2158f17f92b6321340d17f334577534fc8b675969e9ff223fa",
  "docs/action-426-static-confidence-calibration-hash-inventory.json": "e19e320a662ab0d18500fb1b630563fdf1f3361a592afe00ff4af0ec6e9d69fe",
};
const requiredDocSections = [
  "Purpose",
  "Scope",
  "Authoritative Dependencies",
  "Action 427 Readiness Decision",
  "Explicit Non-Goals",
  "Protected-Source Inventory",
  "Action 426 Inventory Binding",
  "Exact Scenario Inventory",
  "Exact Scenario-Order Policy",
  "Configuration Binding",
  "Base-Confidence Binding",
  "Insight-Envelope Binding",
  "Expected-Status Inventory",
  "Expected-Delta Inventory",
  "Expected-Confidence Inventory",
  "Warning Inventory",
  "Complete Issue-Metadata Inventory",
  "Overlap Inventory",
  "Cap Inventory",
  "Clamp Inventory",
  "Zero-Adjustment Inventory",
  "Calibration-ID Contract",
  "Identity-Hash Contract",
  "Result-Hash Contract",
  "Scenario-Hash Contract",
  "Future Execution-Manifest Contract",
  "Future Runner Contract",
  "Metadata-Only Evidence Contract",
  "Full-Output Prohibition",
  "Temporary-Filesystem Policy",
  "Cleanup Policy",
  "Repeat-Run Determinism",
  "Source-Integrity Policy",
  "No-Persistence Requirement",
  "No-Replay Requirement",
  "No-Runtime Requirement",
  "No-External-Access Requirement",
  "No-Feedback Requirement",
  "No-Recommendation-Mutation Requirement",
  "Stop Conditions",
  "Shadow Decision Vocabulary",
  "Approval Vocabulary",
  "Deterministic Gate Conditions",
  "Approval Decision",
  "Passed Conditions",
  "Failed Conditions",
  "Unresolved Conditions",
  "Next Permitted Action",
];
const shadowDecisionVocabulary = [
  "shadow_passed",
  "shadow_passed_with_conditions",
  "shadow_failed",
  "shadow_aborted",
];
const approvalVocabulary = ["approved", "approved_with_conditions", "blocked"];
const tempPathPolicy = "<system-temp>/ture/action-429-static-confidence-calibration-shadow/";
const approvedAction429Files = [
  paths.futureManifest,
  paths.futureRunner,
  paths.futureDoc,
  paths.futureVerifier,
  paths.futureTest,
];

const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");
const shaText = (value) => createHash("sha256").update(value, "utf8").digest("hex");

function collectFiles(path) {
  if (!exists(path)) return [];
  const absolutePath = abs(path);
  if (statSync(absolutePath).isFile()) return [path];
  return readdirSync(absolutePath).flatMap((entry) => collectFiles(join(path, entry))).sort();
}

function exactObject(actual, expected) {
  return JSON.stringify(Object.fromEntries(Object.entries(actual ?? {}).sort())) ===
    JSON.stringify(Object.fromEntries(Object.entries(expected).sort()));
}

function byId(scenarios, id) {
  return scenarios.find((scenario) => scenario.scenario_id === id);
}

function protectedHashReport() {
  return Object.fromEntries(
    Object.entries(expectedProtectedHashes).map(([path, expected]) => {
      const actual = exists(path) ? shaText(read(path)) : null;
      return [
        path,
        {
          expected,
          actual,
          exists: actual !== null,
          matches: actual === expected,
        },
      ];
    }),
  );
}

const doc = exists(paths.doc) ? read(paths.doc) : "";
const action427Doc = exists(paths.action427Doc) ? read(paths.action427Doc) : "";
const inventory = exists(paths.action426Inventory) ? JSON.parse(read(paths.action426Inventory)) : null;
const scenarios = inventory?.scenarios ?? [];
const protectedHashes = protectedHashReport();
const issueRecords = scenarios.flatMap((scenario) =>
  (scenario.issue_inventory ?? []).map((issue, index) => ({
    scenario_id: scenario.scenario_id,
    index,
    code: issue.code,
    path: issue.path,
    severity: "error",
    messageKey: `confidence_calibration.${issue.code}`,
  })),
);
const completeIssueMetadataPolicy = {
  required_fields: ["code", "path", "severity", "messageKey"],
  severity_policy: "issue_records_use_error",
  messageKey_policy: "confidence_calibration.<code>",
  path_policy: "RFC_6901_path_beginning_with_slash",
  deterministic_ordering: true,
  deterministic_deduplication: true,
  raw_values_allowed: false,
  dynamic_text_allowed: false,
  secrets_allowed: false,
  issue_records: issueRecords,
};
const warningMetadataPolicy = {
  severity: "warning",
  messageKey_policy: "confidence_calibration.<code>",
  raw_values_allowed: false,
  dynamic_text_allowed: false,
  secrets_allowed: false,
};
const trackedAction429Files = [...collectFiles("docs"), ...collectFiles("scripts"), ...collectFiles("tests")]
  .filter((path) => /action-429/i.test(path));
const approvedAction429FilesPresent = approvedAction429Files.filter(exists);
const unapprovedAction429FilesPresent = trackedAction429Files.filter((path) => !approvedAction429Files.includes(path));
const action429PackageState = approvedAction429FilesPresent.length === 0
  ? "absent"
  : approvedAction429FilesPresent.length === approvedAction429Files.length
    ? "complete_approved_package_present"
    : "partial_approved_package_present";
const forbiddenTextNeedles = [
  "provider_call_executed: true",
  "supabase_write_executed: true",
  "calibration_shadow_executed: true",
  "recommendation_mutated: true",
  "replay_executed: true",
  "runtime_preview_advanced: true",
];
const docForbiddenText = forbiddenTextNeedles.filter((needle) => doc.includes(needle));
const docContainsAll = (needles) => needles.every((needle) => doc.includes(needle));

const checks = {
  documentation_exists: exists(paths.doc),
  documentation_sections_complete: requiredDocSections.every((section) => doc.includes(`## ${section}`)),
  action427_static_artifacts_present: exists(paths.action427Doc) && exists(paths.action427Verifier),
  action427_decision_bound: action427Doc.includes("Readiness decision: ready_with_conditions") &&
    action427Doc.includes("issue_severity_and_messageKey_not_retained_in_action_426_bounded_inventory"),
  action427_remaining_condition_closed_by_forward_policy: doc.includes("Action 428 closure") &&
    doc.includes("does not modify Action 426 retroactively"),
  exact_inventory_hash_bound: inventory?.full_inventory_sha256 === expectedInventoryHash &&
    doc.includes(expectedInventoryHash),
  protected_hashes_bound: Object.values(protectedHashes).every((entry) => entry.exists && entry.matches) &&
    Object.entries(expectedProtectedHashes).every(([path, hash]) => doc.includes(path) && doc.includes(hash)),
  exact_45_scenarios: inventory?.scenario_count === 45 && scenarios.length === 45,
  exact_scenario_ids_and_order: JSON.stringify(inventory?.scenario_ids ?? []) === JSON.stringify(expectedIds) &&
    JSON.stringify(scenarios.map((scenario) => scenario.scenario_id)) === JSON.stringify(expectedIds) &&
    expectedIds.every((id) => doc.includes(id)),
  status_distribution_exact: exactObject(inventory?.status_distribution, expectedStatusDistribution) &&
    exactObject(expectedStatusDistribution, expectedStatusDistribution),
  warning_distribution_exact: exactObject(inventory?.warning_distribution, expectedWarningDistribution),
  issue_distribution_exact: exactObject(inventory?.issue_distribution, expectedIssueDistribution),
  complete_issue_metadata_policy: issueRecords.length === Object.values(expectedIssueDistribution).reduce((sum, count) => sum + count, 0) &&
    issueRecords.every((issue) =>
    issue.path.startsWith("/") &&
    issue.severity === "error" &&
      issue.messageKey === `confidence_calibration.${issue.code}`) &&
    docContainsAll(["\"code\"", "\"path\"", "\"severity\"", "\"messageKey\"", "RFC 6901", "confidence_calibration.<code>"]),
  manifest_contract: doc.includes(paths.futureManifest) &&
    docContainsAll([
      "schema version",
      "Action 426 inventory hash",
      "protected source hashes",
      "scenario count 45",
      "complete expected issues",
      "recommendation_mutated: false",
    ]),
  runner_contract: doc.includes(paths.futureRunner) &&
    docContainsAll([
      "call `calibrateConfidence`",
      "execute the complete package exactly twice",
      "write temporary metadata-only evidence",
      "delete evidence",
      "retries",
      "third execution",
    ]),
  expected_value_verification_policy: docContainsAll([
    "individual deltas",
    "pre-cap aggregate delta",
    "post-cap aggregate delta",
    "unclamped confidence",
    "final confidence",
    "clamp state",
  ]),
  semantic_hash_verification_policy: docContainsAll([
    "calibration ID",
    "identity hash",
    "result hash",
    "scenario summary hash",
    "package hash",
  ]),
  delta_cap_clamp_overlap_zero_policy: byId(scenarios, "cc425_16")?.post_cap_aggregate_delta_basis_points === 400 &&
    byId(scenarios, "cc425_17")?.post_cap_aggregate_delta_basis_points === -600 &&
    byId(scenarios, "cc425_29")?.clamping_state?.warning_code === "confidence_clamped_to_bounds" &&
    byId(scenarios, "cc425_27")?.status === "blocked_overlapping_evidence" &&
    ["cc425_04", "cc425_05", "cc425_20", "cc425_32", "cc425_33"].every((id) => byId(scenarios, id)?.status === "no_adjustment"),
  metadata_evidence_limits: docContainsAll([
    "Temporary evidence may contain only metadata",
    "Full-Output Prohibition",
    "full insight objects",
    "production payloads",
    "secrets",
  ]),
  temporary_path_policy: doc.includes(tempPathPolicy) &&
    docContainsAll(["outside the repository", "not a symlink", "not path traversed", "empty before use"]),
  cleanup_policy: docContainsAll(["delete temporary metadata-only evidence", "verify cleanup", "leave no tracked evidence"]),
  exactly_two_runs_no_retry: docContainsAll(["run exactly twice", "No third repair run", "retries"]),
  stop_conditions: docContainsAll(["Stop before execution with `shadow_aborted`", "Fail after execution with `shadow_failed`"]),
  decision_vocabularies_exact: shadowDecisionVocabulary.every((value) => doc.includes(value)) &&
    approvalVocabulary.every((value) => doc.includes(value)),
  approval_decision_documented: doc.includes("Approval decision: `approved`"),
  approved_action429_package_boundary:
    unapprovedAction429FilesPresent.length === 0 &&
    (approvedAction429FilesPresent.length === 0 || approvedAction429FilesPresent.length === approvedAction429Files.length),
  no_unapproved_action429_artifacts: unapprovedAction429FilesPresent.length === 0,
  no_shadow_execution: inventory?.calibration_shadow_executed === false,
  no_runtime_persistence_replay_external_feedback: inventory?.provider_call_executed === false &&
    inventory?.supabase_write_executed === false &&
    inventory?.no_persistence === true &&
    inventory?.no_replay === true &&
    inventory?.no_runtime === true &&
    inventory?.no_feedback === true,
  no_recommendation_or_scanner_mutation: inventory?.recommendation_mutated === false &&
    inventory?.no_effect_flags?.recommendation_mutation_executed === false &&
    inventory?.no_effect_flags?.scanner_behavior_changed === false &&
    inventory?.no_effect_flags?.live_ranking_changed === false,
  runtime_preview_paused: inventory?.runtime_preview_status === "runtime_preview_waiting_for_operator_inputs" &&
    inventory?.no_effect_flags?.runtime_preview_advanced === false,
  no_forbidden_doc_effect_claims: docForbiddenText.length === 0,
  next_action_identified: doc.includes("Action 429: static Confidence Calibration shadow execution"),
};

const failedConditions = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);
const unresolvedConditions = [];
const approvalDecision = failedConditions.length > 0
  ? "blocked"
  : unresolvedConditions.length > 0
    ? "approved_with_conditions"
    : "approved";

const report = {
  verification_status: failedConditions.length === 0 ? "passed" : "failed",
  approval_decision: approvalDecision,
  approval_vocabulary: approvalVocabulary,
  shadow_decision_vocabulary: shadowDecisionVocabulary,
  checks,
  failed_conditions: failedConditions,
  unresolved_conditions: unresolvedConditions,
  passed_conditions_count: Object.values(checks).filter(Boolean).length,
  failed_conditions_count: failedConditions.length,
  unresolved_conditions_count: unresolvedConditions.length,
  action427_readiness: {
    readiness_decision: "ready_with_conditions",
    passed_conditions_count: 47,
    failed_conditions_count: 0,
    unresolved_conditions_count: 1,
    unresolved_condition: "issue_severity_and_messageKey_not_retained_in_action_426_bounded_inventory",
    closed_by_action428_forward_policy: checks.action427_remaining_condition_closed_by_forward_policy,
  },
  inventory_hash: inventory?.full_inventory_sha256 ?? null,
  expected_inventory_hash: expectedInventoryHash,
  protected_hashes: protectedHashes,
  scenario_count: inventory?.scenario_count ?? 0,
  scenario_ids: inventory?.scenario_ids ?? [],
  status_distribution: inventory?.status_distribution ?? {},
  warning_distribution: inventory?.warning_distribution ?? {},
  issue_distribution: inventory?.issue_distribution ?? {},
  complete_issue_metadata_policy: completeIssueMetadataPolicy,
  warning_metadata_policy: warningMetadataPolicy,
  future_manifest_path: paths.futureManifest,
  future_runner_path: paths.futureRunner,
  action429_package_state: action429PackageState,
  approved_action429_files: approvedAction429Files,
  approved_action429_files_present: approvedAction429FilesPresent,
  unapproved_action429_files_present: unapprovedAction429FilesPresent,
  future_artifacts_absent: approvedAction429FilesPresent.length === 0 && unapprovedAction429FilesPresent.length === 0,
  future_artifacts_present: trackedAction429Files,
  semantic_verification_policy: {
    expected_values: checks.expected_value_verification_policy,
    semantic_hashes: checks.semantic_hash_verification_policy,
    delta_cap_clamp_overlap_zero: checks.delta_cap_clamp_overlap_zero_policy,
  },
  metadata_evidence_limits: {
    metadata_only: checks.metadata_evidence_limits,
    full_output_prohibited: true,
    temp_path: tempPathPolicy,
  },
  repeat_run_and_cleanup: {
    exactly_two_runs_required: true,
    retry_allowed: false,
    third_execution_allowed: false,
    cleanup_required: true,
    temp_evidence_retained: false,
  },
  stop_conditions_policy: {
    abort_before_execution_on_manifest_hash_source_or_temp_path_failure: true,
    fail_after_execution_on_output_hash_distribution_cleanup_or_mutation_failure: true,
    same_action_remediation_allowed: false,
  },
  safety: {
    provider_call_executed: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    replay_executed: false,
    calibration_shadow_executed: false,
    recommendation_mutated: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    feedback_executed: false,
    runtime_route_created: false,
  },
  runtime_preview_status: inventory?.runtime_preview_status ?? "unknown",
  unrelated_work_classification: "action_428_docs_verifier_tests_and_minimal_guard_updates_only",
  recommended_next_action: "action_429_static_confidence_calibration_shadow_execution",
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
if (failedConditions.length > 0) process.exitCode = 1;
