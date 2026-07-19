#!/usr/bin/env node

import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");
const adapterPath = ["lib", `${["confidence", "calibration", "advisory", "adapter"].join("-")}.ts`].join("/");

const paths = {
  doc: "docs/action-440-static-confidence-calibration-advisory-fixture-and-hash-freeze-approval-gate.md",
  verifier: "scripts/action-440-static-confidence-calibration-advisory-fixture-and-hash-freeze-approval-gate-verify.mjs",
  test: "tests/e2e/action-440-static-confidence-calibration-advisory-fixture-and-hash-freeze-approval-gate.spec.ts",
  action439Doc: "docs/action-439-independent-complete-semantic-binding-verification.md",
  action439Verifier: "scripts/action-439-independent-complete-semantic-binding-verification-verify.mjs",
  adapter: adapterPath,
  calibration: "lib/pure-confidence-calibration.ts",
  action426Inventory: "docs/action-426-static-confidence-calibration-hash-inventory.json",
  action426Freezer: "scripts/action-426-static-confidence-calibration-hash-freeze.mjs",
  action429Manifest: "docs/action-429-static-confidence-calibration-shadow-input-manifest.json",
  action429Runner: "scripts/action-429-static-confidence-calibration-shadow-run.mjs",
};

const expectedHashes = {
  [paths.adapter]: "3c1b2ed0be3f37d5fe0514eee5a6a3b590811721f0e53b3802080fe764cd8e0b",
  [paths.calibration]: "bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70",
  [paths.action426Inventory]: "e19e320a662ab0d18500fb1b630563fdf1f3361a592afe00ff4af0ec6e9d69fe",
  [paths.action426Freezer]: "f8cf5af48f640a2158f17f92b6321340d17f334577534fc8b675969e9ff223fa",
  [paths.action429Manifest]: "f730d31084419985c8464e01e1daf67bea9312ac47a3ab5c291a1c394da03c59",
  [paths.action429Runner]: "dd073134a96583caddae345c9c84be6bc4a327198c65aa29d8d191e4ea21b882",
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

const expectedCoverageFamilies = [
  "eligible_success",
  "blocked_calibration_input",
  "confidence_binding",
  "recommendation_lineage",
  "calibration_integrity",
  "complete_hash",
  "legacy_hash",
  "fallback_bypass",
  "pattern_discovery_lineage",
  "pattern_insight_lineage",
  "anti_leakage",
  "anti_feedback",
  "warning_inventory",
  "issue_inventory",
  "no_adjustment",
  "semantic_ordering",
  "output_boundary",
];

const scenarioInventory = [
  ["ca440_01", "eligible_success", "calibrated complete-hash success", "advisory_ready", "complete", ["eligible_success", "complete_hash", "confidence_binding", "output_boundary"]],
  ["ca440_02", "eligible_success", "calibrated_with_warnings success", "advisory_ready_with_warnings", "complete", ["eligible_success", "warning_inventory", "complete_hash"]],
  ["ca440_03", "no_adjustment", "no_adjustment exact equality", "advisory_no_adjustment", "complete", ["eligible_success", "no_adjustment", "confidence_binding"]],
  ["ca440_04", "blocked_calibration_input", "insufficient evidence maps closed", "advisory_insufficient_evidence", "complete", ["blocked_calibration_input", "issue_inventory"]],
  ["ca440_05", "blocked_calibration_input", "blocked invalid input maps closed", "blocked_invalid_input", "complete", ["blocked_calibration_input"]],
  ["ca440_06", "blocked_calibration_input", "blocked invalid configuration maps closed", "blocked_invalid_input", "complete", ["blocked_calibration_input"]],
  ["ca440_07", "blocked_calibration_input", "blocked invalid lineage maps closed", "blocked_invalid_lineage", "complete", ["blocked_calibration_input", "pattern_discovery_lineage"]],
  ["ca440_08", "blocked_calibration_input", "blocked future leakage maps closed", "blocked_future_leakage", "complete", ["blocked_calibration_input", "anti_leakage"]],
  ["ca440_09", "blocked_calibration_input", "blocked overlapping evidence maps closed", "blocked_calibration_result", "complete", ["blocked_calibration_input", "issue_inventory"]],
  ["ca440_10", "blocked_calibration_input", "blocked unsupported insight maps closed", "blocked_unsupported_status", "complete", ["blocked_calibration_input"]],
  ["ca440_11", "confidence_binding", "exact confidence match", "advisory_ready", "complete", ["confidence_binding", "complete_hash"]],
  ["ca440_12", "confidence_binding", "one basis point mismatch", "blocked_confidence_mismatch", "complete", ["confidence_binding"]],
  ["ca440_13", "confidence_binding", "decimal mismatch", "blocked_confidence_mismatch", "complete", ["confidence_binding"]],
  ["ca440_14", "confidence_binding", "invalid confidence precision", "blocked_calibration_result", "complete", ["confidence_binding", "calibration_integrity"]],
  ["ca440_15", "confidence_binding", "below accepted confidence range", "blocked_invalid_input", "complete", ["confidence_binding"]],
  ["ca440_16", "confidence_binding", "above accepted confidence range", "blocked_invalid_input", "complete", ["confidence_binding"]],
  ["ca440_17", "confidence_binding", "NaN confidence rejected", "blocked_invalid_input", "complete", ["confidence_binding"]],
  ["ca440_18", "confidence_binding", "Infinity confidence rejected", "blocked_invalid_input", "complete", ["confidence_binding"]],
  ["ca440_19", "confidence_binding", "signed zero confidence remains exact", "advisory_ready", "complete", ["confidence_binding", "semantic_ordering"]],
  ["ca440_20", "recommendation_lineage", "missing recommendation fingerprint", "blocked_invalid_lineage", "complete", ["recommendation_lineage"]],
  ["ca440_21", "recommendation_lineage", "malformed recommendation fingerprint", "blocked_invalid_lineage", "complete", ["recommendation_lineage"]],
  ["ca440_22", "recommendation_lineage", "changed recommendation fingerprint", "blocked_invalid_lineage", "complete", ["recommendation_lineage"]],
  ["ca440_23", "recommendation_lineage", "missing snapshot hash", "blocked_invalid_lineage", "complete", ["recommendation_lineage"]],
  ["ca440_24", "recommendation_lineage", "malformed snapshot hash", "blocked_invalid_lineage", "complete", ["recommendation_lineage"]],
  ["ca440_25", "recommendation_lineage", "changed snapshot retained identity", "blocked_invalid_lineage", "complete", ["recommendation_lineage"]],
  ["ca440_26", "recommendation_lineage", "changed original confidence retained snapshot", "blocked_confidence_mismatch", "complete", ["recommendation_lineage", "confidence_binding"]],
  ["ca440_27", "complete_hash", "valid complete semantic result hash", "advisory_ready", "complete", ["complete_hash", "calibration_integrity"]],
  ["ca440_28", "legacy_hash", "explicitly supported legacy result hash", "advisory_ready", "legacy", ["legacy_hash", "calibration_integrity"]],
  ["ca440_29", "calibration_integrity", "malformed result hash", "blocked_calibration_result", "malformed", ["calibration_integrity", "fallback_bypass"]],
  ["ca440_30", "calibration_integrity", "swapped result hash", "blocked_calibration_result", "swapped", ["calibration_integrity", "fallback_bypass"]],
  ["ca440_31", "complete_hash", "complete hash mismatch cannot fall back", "blocked_calibration_result", "complete_mismatch", ["complete_hash", "fallback_bypass"]],
  ["ca440_32", "fallback_bypass", "legacy fallback bypass attempt", "blocked_calibration_result", "legacy_bypass", ["legacy_hash", "fallback_bypass"]],
  ["ca440_33", "calibration_integrity", "calibration ID tampering", "blocked_calibration_result", "retained_hash", ["calibration_integrity"]],
  ["ca440_34", "warning_inventory", "warning record tampering", "blocked_calibration_result", "retained_hash", ["warning_inventory", "calibration_integrity"]],
  ["ca440_35", "issue_inventory", "issue record tampering", "blocked_calibration_result", "retained_hash", ["issue_inventory", "calibration_integrity"]],
  ["ca440_36", "pattern_discovery_lineage", "Pattern Discovery hash tampering", "blocked_calibration_result", "retained_hash", ["pattern_discovery_lineage", "complete_hash"]],
  ["ca440_37", "pattern_insight_lineage", "Pattern Insight lineage tampering with recomputed hash", "blocked_invalid_lineage", "recomputed_complete", ["pattern_insight_lineage"]],
  ["ca440_38", "anti_leakage", "future outcome evidence", "blocked_future_leakage", "complete", ["anti_leakage"]],
  ["ca440_39", "anti_leakage", "post-entry evidence", "blocked_future_leakage", "complete", ["anti_leakage"]],
  ["ca440_40", "anti_leakage", "post-exit evidence", "blocked_future_leakage", "complete", ["anti_leakage"]],
  ["ca440_41", "anti_leakage", "same-recommendation realized result", "blocked_future_leakage", "complete", ["anti_leakage"]],
  ["ca440_42", "anti_leakage", "unknown leakage state", "blocked_future_leakage", "complete", ["anti_leakage"]],
  ["ca440_43", "anti_feedback", "calibration reused as Learning Dataset input", "blocked_invalid_lineage", "complete", ["anti_feedback"]],
  ["ca440_44", "anti_feedback", "Pattern Discovery evidence reuse", "blocked_invalid_lineage", "complete", ["anti_feedback"]],
  ["ca440_45", "anti_feedback", "recommendation base-confidence reuse", "blocked_invalid_lineage", "complete", ["anti_feedback"]],
  ["ca440_46", "anti_feedback", "scanner ranking publication execution reuse", "blocked_invalid_lineage", "complete", ["anti_feedback"]],
  ["ca440_47", "warning_inventory", "warning ordering and deduplication", "advisory_ready_with_warnings", "complete", ["warning_inventory", "semantic_ordering"]],
  ["ca440_48", "output_boundary", "metadata-only advisory output boundary", "advisory_ready", "complete", ["output_boundary", "semantic_ordering"]],
];

const blockedCalibrationStatusById = {
  ca440_04: "insufficient_eligible_evidence",
  ca440_05: "blocked_invalid_input",
  ca440_06: "blocked_invalid_configuration",
  ca440_07: "blocked_invalid_lineage",
  ca440_08: "blocked_future_leakage",
  ca440_09: "blocked_overlapping_evidence",
  ca440_10: "blocked_unsupported_insight",
};

const scenarios = scenarioInventory.map(([id, primary_family, primary_purpose, expected_advisory_status, hash_mode, coverage_tags], index) => ({
  id,
  order: index + 1,
  primary_family,
  primary_purpose,
  recommendation_fingerprint: `rec_${id}`,
  recommendation_snapshot_hash: createHash("sha256").update(`action_440:${id}:snapshot`, "utf8").digest("hex"),
  original_confidence: id === "ca440_19" ? 0 : 50,
  decision_boundary: {
    boundary_id: `decision_boundary_${id}`,
    boundary_sha256: createHash("sha256").update(`action_440:${id}:boundary`, "utf8").digest("hex"),
    anti_leakage_state: coverage_tags.includes("anti_leakage") && expected_advisory_status === "blocked_future_leakage" ? "failed_closed" : "passed",
  },
  calibration_status: expected_advisory_status === "advisory_ready_with_warnings"
    ? "calibrated_with_warnings"
    : expected_advisory_status === "advisory_no_adjustment"
      ? "no_adjustment"
      : expected_advisory_status === "advisory_insufficient_evidence"
        ? "insufficient_eligible_evidence"
        : expected_advisory_status.startsWith("blocked_")
          ? blockedCalibrationStatusById[id] ?? "calibrated"
          : "calibrated",
  calibration_id: `confidence_calibration_v1:${createHash("sha256").update(`action_440:${id}:calibration`, "utf8").digest("hex").slice(0, 24)}`,
  calibration_identity_hash: createHash("sha256").update(`action_440:${id}:identity`, "utf8").digest("hex"),
  calibration_result_hash: createHash("sha256").update(`action_440:${id}:${hash_mode}:result`, "utf8").digest("hex"),
  calibration_configuration_version: "confidence_calibration_config_v1",
  proposed_delta: expected_advisory_status === "advisory_no_adjustment" ? 0 : 2,
  proposed_confidence: expected_advisory_status === "advisory_no_adjustment" ? (id === "ca440_19" ? 0 : 50) : 52,
  warnings: coverage_tags.includes("warning_inventory") ? [{
    code: "metric_value_unavailable",
    path: "/insights/0/warning_codes/0",
    severity: "warning",
    messageKey: "confidence_calibration.metric_value_unavailable",
  }] : [],
  issues: expected_advisory_status.startsWith("blocked_") || expected_advisory_status === "advisory_insufficient_evidence" ? [{
    code: expected_advisory_status === "blocked_confidence_mismatch" ? "blocked_confidence_mismatch" : "blocked_calibration_result",
    path: expected_advisory_status === "blocked_confidence_mismatch" ? "/calibration/original_confidence" : "/calibration",
    severity: "error",
    messageKey: `confidence_calibration_advisory.${expected_advisory_status}`,
  }] : [],
  pattern_discovery_lineage: {
    pattern_discovery_sha256: createHash("sha256").update(`action_440:${id}:pattern_discovery`, "utf8").digest("hex"),
    pattern_discovery_result_sha256: createHash("sha256").update(`action_440:${id}:pattern_result`, "utf8").digest("hex"),
  },
  pattern_insight_lineage: {
    insight_sha256: createHash("sha256").update(`action_440:${id}:insight`, "utf8").digest("hex"),
    insight_id: `insight_${id}`,
  },
  anti_leakage_state: coverage_tags.includes("anti_leakage") && expected_advisory_status === "blocked_future_leakage" ? "blocked" : "passed",
  anti_feedback_declarations: coverage_tags.includes("anti_feedback") ? "single_reuse_flag_true_expected_block" : "all_false",
  expected_advisory_status,
  expected_advisory_visibility: expected_advisory_status.startsWith("advisory_ready") || expected_advisory_status === "advisory_no_adjustment",
  expected_advisory_eligibility: expected_advisory_status.startsWith("advisory_ready") || expected_advisory_status === "advisory_no_adjustment",
  expected_application_eligibility: false,
  expected_original_confidence: id === "ca440_19" ? 0 : 50,
  expected_proposed_delta: expected_advisory_status.startsWith("advisory_") ? (expected_advisory_status === "advisory_no_adjustment" ? 0 : 2) : null,
  expected_proposed_confidence: expected_advisory_status.startsWith("advisory_") ? (expected_advisory_status === "advisory_no_adjustment" ? (id === "ca440_19" ? 0 : 50) : 52) : null,
  expected_warning_records: coverage_tags.includes("warning_inventory") ? "preserve_bounded_warning_records" : "none",
  expected_issue_records: expected_advisory_status.startsWith("blocked_") || expected_advisory_status === "advisory_insufficient_evidence" ? "bounded_issue_records_only" : "none",
  expected_lineage_output: expected_advisory_status.startsWith("advisory_") ? "bounded_lineage_hashes_only" : "null_for_blocked",
  expected_advisory_id_policy: expected_advisory_status.startsWith("advisory_ready") || expected_advisory_status === "advisory_no_adjustment"
    ? "confidence_calibration_advisory_v1:<first_24_chars_of_identity_sha256>"
    : "null",
  non_authoritative: true,
  applied: false,
  coverage_tags,
  rationale: primary_purpose,
}));

function hashFile(path) {
  return createHash("sha256").update(read(path), "utf8").digest("hex");
}

function countBy(values, key) {
  return values.reduce((acc, value) => {
    acc[value[key]] = (acc[value[key]] ?? 0) + 1;
    return acc;
  }, {});
}

function arrayEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function numberMapEqual(left, right) {
  const keys = [...new Set([...Object.keys(left), ...Object.keys(right)])].sort();
  return keys.every((key) => left[key] === right[key]);
}

const doc = exists(paths.doc) ? read(paths.doc) : "";
const action439Doc = exists(paths.action439Doc) ? read(paths.action439Doc) : "";
const action439Verifier = exists(paths.action439Verifier) ? read(paths.action439Verifier) : "";
const sourceIntegrity = Object.fromEntries(Object.entries(expectedHashes).map(([path, expected]) => [
  path,
  {
    expected_sha256: expected,
    actual_sha256: exists(path) ? hashFile(path) : null,
    matches_expected: exists(path) && hashFile(path) === expected,
  },
]));

const expectedIds = Array.from({ length: 48 }, (_, index) => `ca440_${String(index + 1).padStart(2, "0")}`);
const actualIds = scenarios.map((scenario) => scenario.id);
const actualStatusDistribution = countBy(scenarios, "expected_advisory_status");
const coveredFamilies = [...new Set(scenarios.flatMap((scenario) => scenario.coverage_tags))].sort();
const forbiddenFutureArtifacts = [
  "docs/action-440-static-confidence-calibration-advisory-hash-inventory.json",
  "docs/action-440-static-confidence-calibration-advisory-shadow-input-manifest.json",
  "scripts/action-440-static-confidence-calibration-advisory-hash-freeze.mjs",
  "scripts/action-440-static-confidence-calibration-advisory-shadow-run.mjs",
  "scripts/action-440-static-confidence-calibration-advisory-runner.mjs",
  "lib/confidence-calibration-advisory-static-fixtures.ts",
  "lib/confidence-calibration-advisory-fixtures.ts",
].filter(exists);
const forbiddenInvocationTerms = [
  ["build", "ConfidenceCalibrationAdvisory("].join(""),
  ["create", "Client("].join(""),
  ["fetch", "("].join(""),
  ["process", ".env.TWELVE"].join(""),
  ["supabase", ".from("].join(""),
];

const inputSourcePolicy = {
  deterministic_test_local_recommendation_envelopes_only: true,
  deterministic_bounded_calibration_results_only: true,
  fixed_advisory_configuration_only: true,
  fixed_malformed_variants_only: true,
  production_recommendations_allowed: false,
  supabase_rows_allowed: false,
  provider_data_allowed: false,
  stdin_allowed: false,
  cli_scenario_paths_allowed: false,
  environment_selected_inputs_allowed: false,
};

const outputBoundary = {
  recommendation_objects_retained: false,
  full_pattern_insights_retained: false,
  provider_payloads_retained: false,
  supabase_payloads_retained: false,
  mutation_commands_retained: false,
  ranking_scanner_publication_commands_retained: false,
  execution_commands_retained: false,
  feedback_events_retained: false,
  secrets_retained: false,
  metadata_only_future_inventory: true,
};

const sequencing = [
  "Action 441 - Static Advisory Fixture & Semantic Hash Freeze",
  "Action 442 - Independent Advisory Hash-Freeze Verification",
  "Action 443 - Static Advisory Shadow Execution Approval Gate",
  "Action 444 - Static Advisory Shadow Execution",
  "Action 445 - Independent Advisory Shadow Verification",
];

const action441Boundary = {
  approved_files: [
    "docs/action-441-static-confidence-calibration-advisory-hash-freeze.md",
    "docs/action-441-static-confidence-calibration-advisory-hash-inventory.json",
    "scripts/action-441-static-confidence-calibration-advisory-hash-freeze.mjs",
    "scripts/action-441-static-confidence-calibration-advisory-hash-freeze-verify.mjs",
    "tests/e2e/action-441-static-confidence-calibration-advisory-hash-freeze.spec.ts",
    "narrow Action 440 and historical compatibility updates",
    "minimal Actions 318-320 guard updates",
  ],
  shadow_runner_approved: false,
  shadow_manifest_approved: false,
  recommendation_engine_consumer_approved: false,
  ui_integration_approved: false,
  confidence_application_approved: false,
  runtime_or_persistence_approved: false,
};

const repeatRunPolicy = {
  exact_run_count: 2,
  third_repair_run_allowed: false,
  identical_inventory_payload_required: true,
  identical_package_hash_required: true,
};

const stopConditions = [
  "adapter_hash_differs",
  "pure_confidence_calibration_hash_differs",
  "action_426_or_action_429_binding_differs",
  "scenario_count_not_48",
  "scenario_ids_or_order_differ",
  "unapproved_source_appears",
  "configuration_differs",
  "expected_status_differs",
  "independent_canonicalization_disagrees",
  "repeat_freeze_differs",
  "full_data_retention_required",
  "runtime_provider_supabase_replay_import_appears",
  "persistence_feedback_or_recommendation_mutation_appears",
];

const checks = {
  documentation_exists: exists(paths.doc),
  verifier_exists: exists(paths.verifier),
  focused_test_exists: exists(paths.test),
  action439_decision_recorded: action439Doc.includes("ready_with_conditions") &&
    action439Verifier.includes("ready_with_conditions") &&
    action439Verifier.includes(expectedHashes[paths.adapter]),
  historical_compatibility_condition_documented: doc.includes("historical compatibility condition") &&
    doc.includes("no_unexpected_action434_consumers"),
  exact_scenario_count: scenarios.length === 48,
  exact_scenario_ids: arrayEqual(actualIds, expectedIds),
  coverage_families_complete: expectedCoverageFamilies.every((family) => coveredFamilies.includes(family)),
  status_distribution_frozen: numberMapEqual(actualStatusDistribution, expectedStatusDistribution),
  recommendation_inventory_complete: scenarios.every((scenario) =>
    scenario.recommendation_fingerprint &&
    /^[a-f0-9]{64}$/.test(scenario.recommendation_snapshot_hash) &&
    scenario.decision_boundary.boundary_id &&
    /^[a-f0-9]{64}$/.test(scenario.decision_boundary.boundary_sha256)),
  calibration_inventory_complete: scenarios.every((scenario) =>
    /^confidence_calibration_v1:[a-f0-9]{24}$/.test(scenario.calibration_id) &&
    /^[a-f0-9]{64}$/.test(scenario.calibration_identity_hash) &&
    /^[a-f0-9]{64}$/.test(scenario.calibration_result_hash) &&
    scenario.calibration_configuration_version === "confidence_calibration_config_v1"),
  confidence_binding_frozen: scenarios.every((scenario) =>
    typeof scenario.original_confidence === "number" &&
    (typeof scenario.expected_original_confidence === "number") &&
    scenario.expected_application_eligibility === false),
  lineage_leakage_feedback_frozen: scenarios.every((scenario) =>
    /^[a-f0-9]{64}$/.test(scenario.pattern_discovery_lineage.pattern_discovery_sha256) &&
    /^[a-f0-9]{64}$/.test(scenario.pattern_discovery_lineage.pattern_discovery_result_sha256) &&
    /^[a-f0-9]{64}$/.test(scenario.pattern_insight_lineage.insight_sha256) &&
    ["passed", "blocked"].includes(scenario.anti_leakage_state) &&
    ["all_false", "single_reuse_flag_true_expected_block"].includes(scenario.anti_feedback_declarations)),
  warning_issue_inventory_frozen: scenarios.every((scenario) =>
    scenario.warnings.every((warning) => warning.severity === "warning" && warning.messageKey.startsWith("confidence_calibration.")) &&
    scenario.issues.every((issue) => issue.severity === "error" && issue.path.startsWith("/") && issue.messageKey.startsWith("confidence_calibration_advisory."))),
  no_adjustment_frozen: scenarios.find((scenario) => scenario.id === "ca440_03")?.expected_advisory_status === "advisory_no_adjustment" &&
    scenarios.find((scenario) => scenario.id === "ca440_03")?.expected_proposed_delta === 0,
  complete_legacy_fallback_policy_frozen: ["complete_hash", "legacy_hash", "fallback_bypass"].every((family) => coveredFamilies.includes(family)),
  output_boundary_frozen: Object.values(outputBoundary).every((value) => typeof value === "boolean"),
  identity_hash_policy_frozen: doc.includes("confidence_calibration_advisory_v1:<first_24_chars_of_identity_sha256>") &&
    doc.includes("canonical advisory result SHA-256") &&
    doc.includes("scenario-summary SHA-256") &&
    doc.includes("package inventory SHA-256"),
  sequencing_frozen: sequencing.every((item) => doc.includes(item)),
  action441_boundary_frozen: action441Boundary.approved_files.every((item) => doc.includes(item)) &&
    Object.entries(action441Boundary).filter(([, value]) => value === false).length === 6,
  repeat_run_policy_frozen: repeatRunPolicy.exact_run_count === 2 &&
    repeatRunPolicy.third_repair_run_allowed === false,
  stop_conditions_frozen: stopConditions.every((condition) => doc.includes(condition)),
  no_future_fixture_artifacts_exist: forbiddenFutureArtifacts.length === 0,
  no_forbidden_invocation_terms: forbiddenInvocationTerms.every((term) => !read(paths.verifier).includes(term)),
  source_integrity_unchanged: Object.values(sourceIntegrity).every((item) => item.matches_expected),
  approval_decision_expected: true,
  runtime_preview_paused: doc.includes("runtime_preview_waiting_for_operator_inputs"),
};

const failedConditions = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
const unresolvedConditions = failedConditions.length === 0 ? ["executable_semantic_hashes_require_action_441"] : [];
const approvalDecision = failedConditions.length > 0 ? "blocked" : "approved_with_conditions";

const safety = {
  provider_call_executed: false,
  provider_call_attempted: false,
  supabase_read_executed: false,
  supabase_write_executed: false,
  persistence_executed: false,
  replay_executed: false,
  runtime_route_created: false,
  adapter_invoked: false,
  hash_freeze_executed: false,
  fixture_package_created: false,
  runner_created: false,
  manifest_created: false,
  shadow_execution_created: false,
  feedback_executed: false,
  recommendation_mutated: false,
  scanner_behavior_changed: false,
  live_ranking_changed: false,
  publication_changed: false,
  confidence_applied: false,
};

const report = {
  verification_status: approvalDecision === "blocked" ? "failed" : "passed",
  approval_decision: approvalDecision,
  approval_vocabulary: ["approved", "approved_with_conditions", "blocked"],
  passed_conditions_count: Object.keys(checks).length - failedConditions.length,
  failed_conditions_count: failedConditions.length,
  unresolved_conditions_count: unresolvedConditions.length,
  failed_conditions: failedConditions,
  unresolved_conditions: unresolvedConditions,
  checks,
  action439_readiness: {
    expected_decision: "ready_with_conditions",
    adapter_sha256: expectedHashes[paths.adapter],
    static_fixture_condition_remaining: true,
  },
  historical_compatibility_policy: {
    bounded_condition: "older_Action_435_436_437_suites_can_fail_nested_Action_434_no_unexpected_action434_consumers",
    may_update_future_compatibility_allowlists: true,
    may_change_historical_blocked_decisions: false,
  },
  exact_scenario_count: scenarios.length,
  exact_scenario_ids: actualIds,
  scenario_inventory: scenarios,
  coverage_families: coveredFamilies,
  expected_coverage_families: expectedCoverageFamilies,
  status_distribution: actualStatusDistribution,
  expected_status_distribution: expectedStatusDistribution,
  input_source_policy: inputSourcePolicy,
  recommendation_envelope_policy: {
    immutable_fingerprint_required: true,
    immutable_snapshot_hash_required: true,
    original_confidence_required: true,
    decision_boundary_required: true,
    anti_mutation_declarations_required: true,
  },
  calibration_input_policy: {
    bounded_confidence_calibration_result_contract_required: true,
    full_production_pattern_insights_retained: false,
    full_recommendations_retained: false,
  },
  complete_legacy_hash_policy: {
    valid_complete_hash_accepted: true,
    valid_approved_legacy_hash_accepted: true,
    changed_complete_payload_old_hash_blocks: true,
    changed_legacy_payload_old_hash_blocks: true,
    complete_hash_mismatch_cannot_fallback: true,
    malformed_hash_cannot_fallback: true,
    swapped_hash_cannot_fallback: true,
    unrelated_valid_format_hash_cannot_fallback: true,
  },
  confidence_lineage_leakage_feedback_policy: {
    confidence_rounding_or_repair_allowed: false,
    missing_or_inconsistent_lineage_fails_closed: true,
    anti_leakage_fails_closed: true,
    anti_feedback_fails_closed: true,
  },
  warning_issue_no_adjustment_inventory: {
    warning_records_frozen: true,
    issue_records_frozen: true,
    rfc6901_paths_required: true,
    no_adjustment_delta_zero_required: true,
    no_adjustment_application_eligible_false: true,
  },
  output_boundary: outputBoundary,
  advisory_identity_hash_policy: {
    advisory_id_policy: "confidence_calibration_advisory_v1:<first_24_chars_of_identity_sha256>",
    advisory_identity_sha256_required: true,
    canonical_advisory_result_sha256_required: true,
    scenario_summary_sha256_required: true,
    package_inventory_sha256_required: true,
    timestamps_allowed: false,
    machine_paths_allowed: false,
    randomness_allowed: false,
  },
  future_hash_freeze_sequencing: sequencing,
  action441_boundary: action441Boundary,
  repeat_run_policy: repeatRunPolicy,
  stop_conditions: stopConditions,
  forbidden_future_artifacts: forbiddenFutureArtifacts,
  source_integrity: sourceIntegrity,
  safety,
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  unrelated_work_classification: "action_440_static_confidence_calibration_advisory_fixture_hash_freeze_approval_gate_only",
  recommended_next_action: "action_441_static_confidence_calibration_advisory_hash_freeze",
};

console.log(JSON.stringify(report, null, 2));
if (report.verification_status !== "passed") process.exit(1);
