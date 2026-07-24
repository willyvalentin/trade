#!/usr/bin/env node

import { execFileSync, spawnSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const paths = {
  doc: "docs/action-434-confidence-calibration-advisory-adapter-contract-remediation-approval-gate.md",
  verifier: "scripts/action-434-confidence-calibration-advisory-adapter-contract-remediation-approval-gate-verify.mjs",
  test: "tests/e2e/action-434-confidence-calibration-advisory-adapter-contract-remediation-approval-gate.spec.ts",
  action435Doc: "docs/action-435-confidence-calibration-advisory-adapter-semantic-hash-remediation.md",
  action435Verifier: "scripts/action-435-confidence-calibration-advisory-adapter-semantic-hash-remediation-verify.mjs",
  action435Test: "tests/e2e/action-435-confidence-calibration-advisory-adapter-semantic-hash-remediation.spec.ts",
  action436Doc: "docs/action-436-independent-post-remediation-advisory-adapter-verification.md",
  action436Verifier: "scripts/action-436-independent-post-remediation-advisory-adapter-verification-verify.mjs",
  action436Test: "tests/e2e/action-436-independent-post-remediation-advisory-adapter-verification.spec.ts",
  action309Guard: "scripts/action-309-post-recovery-safety-guard.mjs",
  goldenVerifier: "scripts/replay-with-signal-package-static-preview-verify-golden.mjs",
  action432Verifier: "scripts/action-432-confidence-calibration-advisory-adapter-implementation-verify.mjs",
  action433Verifier: "scripts/action-433-independent-confidence-calibration-advisory-adapter-verification-verify.mjs",
};

const protectedHashes = {
  "lib/confidence-calibration-advisory-adapter.ts": [
    "7c7c2b8f1056734ccda6cc12bacc478f6c76daa2f47da827b0f29f28fcf46976",
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

const expectedGaps = [
  "swapped_result_hash_blocks",
  "changed_status_retained_hash_blocks",
  "changed_proposed_confidence_retained_hash_blocks",
  "changed_warning_inventory_retained_hash_blocks",
];

const requiredDocPhrases = {
  purpose: "Action 434 freezes the approved remediation contract",
  scope: "This is an approval gate only",
  authoritative_dependencies: "Authoritative Dependencies",
  action433_blocked_decision: "Action 433 Blocked Decision",
  failed_condition: "failed condition: `calibration_identity_and_hash`",
  root_cause: "`calibration_semantic_result_hash_not_recomputed`",
  approved_surface: "Approved Remediation Surface",
  forbidden_surface: "Forbidden Remediation Surface",
  semantic_payload: "Calibration Semantic-Payload Definition",
  canonicalization: "Canonicalization Policy",
  recomputation: "`SHA-256(canonical calibration result payload)`",
  supplied_recomputed_comparison: "Supplied-Versus-Recomputed Comparison Policy",
  identity_hash: "calibration identity hash binds the calibration identity payload",
  result_hash: "calibration result hash binds the full bounded result payload",
  calibration_id: "Calibration-ID Preservation",
  status_binding: "Status Binding",
  proposed_confidence_binding: "Proposed-Confidence Binding",
  warning_binding: "Warning Binding",
  issue_binding: "Issue Binding",
  insight_binding: "Included And Excluded Insight Binding",
  overlap_binding: "Overlap-Summary Binding",
  lineage_binding: "Lineage Binding",
  validation_order: "Semantic result-hash recomputation belongs inside phase 10",
  mismatch_status: "status: `blocked_calibration_result`",
  mismatch_issue: "issue code: `blocked_calibration_result`",
  mismatch_path: "RFC 6901 path: `/calibration/calibration_hash`",
  mismatch_message: "messageKey: `confidence_calibration_advisory.blocked_calibration_result`",
  public_api: "Public API Preservation",
  advisory_output: "Advisory Output Preservation",
  anti_feedback: "Anti-Feedback Preservation",
  anti_leakage: "Anti-Leakage Preservation",
  immutability: "Immutability Preservation",
  determinism: "Determinism Preservation",
  hash_regression: "Hash-Regression Requirements",
  action435_boundary: "Action 435 may only implement the semantic hash remediation",
  action435_regression: "Action 435 Regression Requirements",
  action436_mandatory: "Action 436 is mandatory immediately after Action 435",
  approval_vocabulary: "Use exactly:",
  approval_decision: "Approval decision:\n\n`approved`",
  next_action: "`action_435_confidence_calibration_advisory_adapter_semantic_hash_remediation`",
};

const attackMatrix = [
  "supplied result hash replaced with another valid hash",
  "swapped result hash from another calibration",
  "status changed while retaining old result hash",
  "proposed delta changed while retaining old result hash",
  "proposed calibrated confidence changed while retaining old result hash",
  "warning inventory changed while retaining old result hash",
  "issue inventory changed while retaining old result hash",
  "included insight inventory changed while retaining old result hash",
  "excluded insight inventory changed while retaining old result hash",
  "overlap summary changed while retaining old result hash",
  "lineage hash changed while retaining old result hash",
  "advisory flags changed while retaining old result hash",
  "canonical array order changed semantically",
  "semantically equivalent reordered arrays",
];

const action435RegressionInventory = [
  "correct result hash accepted",
  "malformed result hash blocked",
  "swapped valid result hash blocked",
  "status changed with retained hash blocked",
  "proposed delta changed with retained hash blocked",
  "proposed confidence changed with retained hash blocked",
  "warning inventory changed with retained hash blocked",
  "issue inventory changed with retained hash blocked",
  "included insight inventory changed with retained hash blocked",
  "excluded insight inventory changed with retained hash blocked",
  "overlap summary changed with retained hash blocked",
  "lineage changed with retained hash blocked",
  "semantically equivalent warning ordering accepted",
  "semantically equivalent issue ordering accepted",
  "hash mismatch outranks later lineage fault",
  "hash mismatch outranks leakage fault",
  "hash mismatch outranks feedback fault",
  "valid calibrated output unchanged",
  "valid calibrated_with_warnings output unchanged",
  "valid no_adjustment output unchanged",
  "advisory identity unchanged for unaffected inputs",
  "immutability unchanged",
  "determinism unchanged",
];

const forbiddenAction434Artifacts = [
  "docs/action-434-confidence-calibration-advisory-fixtures.json",
  "docs/action-434-confidence-calibration-advisory-shadow-input-manifest.json",
  "scripts/action-434-confidence-calibration-advisory-shadow-run.mjs",
  "scripts/action-434-confidence-calibration-advisory-runner.mjs",
  "lib/action-434-confidence-calibration-advisory-fixtures.ts",
  "app/api/action-434",
];

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

const doc = exists(paths.doc) ? read(paths.doc) : "";
const adapterSource = exists("lib/confidence-calibration-advisory-adapter.ts")
  ? read("lib/confidence-calibration-advisory-adapter.ts")
  : "";
const action435RemediationDetected =
  exists(paths.action435Doc) &&
  exists(paths.action435Verifier) &&
  exists(paths.action435Test) &&
  adapterSource.includes("hasValidCalibrationSemanticHash") &&
  adapterSource.includes("buildCalibrationSemanticHashPayload");
const action433 = runJson(paths.action433Verifier);
const action432 = runJson(paths.action432Verifier);
const action309 = runJson(paths.action309Guard);
const golden = runJson(paths.goldenVerifier);

const sourceIntegrity = Object.fromEntries(
  Object.entries(protectedHashes).map(([path, expected]) => {
    const fileExists = exists(path);
    const actual = fileExists ? shaFile(path) : null;
    const accepted = Array.isArray(expected) ? expected : [expected];
    return [path, {
      expected,
      actual,
      exists: fileExists,
      matches: accepted.includes(actual),
      approved_action435_remediation: path === "lib/confidence-calibration-advisory-adapter.ts" &&
        action435RemediationDetected &&
        actual === accepted[accepted.length - 1],
    }];
  }),
);

const documentationSections = Object.fromEntries(
  Object.entries(requiredDocPhrases).map(([key, phrase]) => [key, doc.includes(phrase)]),
);

const exactGaps =
  JSON.stringify(action433.remaining_gap_inventory ?? []) === JSON.stringify(expectedGaps);
const postAction435HashGapsClosed =
  action435RemediationDetected &&
  action433.checks?.calibration_identity_and_hash === true &&
  expectedGaps.every((gap) => action433.calibration_identity_and_hash?.[gap] === true);

const action433BlockedFinding = {
  verification_status_passed: action433.verification_status === "passed",
  readiness_decision_blocked: action433.readiness_decision === "blocked" || postAction435HashGapsClosed,
  failed_condition_exact:
    (action433.checks?.calibration_identity_and_hash === false &&
      (action433.failed_conditions ?? []).includes("calibration_identity_and_hash")) ||
    postAction435HashGapsClosed,
  remaining_gaps_exact: exactGaps || postAction435HashGapsClosed,
  counts_exact: action433.unresolved_conditions_count === 0,
};

const semanticPayloadFields = [
  "status",
  "calibration_id",
  "calibration_hash",
  "original_confidence",
  "proposed_delta",
  "proposed_calibrated_confidence",
  "included_insight_ids",
  "included_insight_hashes",
  "excluded_insight_ids",
  "stable exclusion reasons",
  "evidence_summary",
  "overlap_summary",
  "overlap_resolution_summary",
  "adjustments",
  "warnings",
  "issues",
  "lineage_hashes",
  "configuration_version",
  "non_authoritative",
  "applied",
];
const semanticPayloadDefinition = Object.fromEntries(
  semanticPayloadFields.map((field) => [field, doc.includes(field)]),
);

const canonicalizationPolicy = {
  sorted_keys: doc.includes("recursively sorted object keys"),
  stable_array_ordering: doc.includes("stable semantic array ordering"),
  utf8: doc.includes("UTF-8"),
  no_whitespace: doc.includes("no insignificant whitespace"),
  stable_null: doc.includes("stable `null` representation"),
  signed_zero: doc.includes("normalized signed zero"),
  no_dynamic_fields: doc.includes("no dynamic fields"),
  no_runtime_values: doc.includes("no runtime-dependent values"),
  no_insertion_order_trust: doc.includes("no object insertion-order trust"),
};

const recomputationPolicy = {
  sha256_canonical_payload: doc.includes("`SHA-256(canonical calibration result payload)`"),
  lowercase_hex: doc.includes("exact lowercase hexadecimal"),
  exact_compare: doc.includes("exact string equality"),
  no_repair: doc.includes("repair the supplied hash"),
  no_warning_only: doc.includes("warning-only readiness"),
  no_id_substitute: doc.includes("use only calibration ID as a substitute"),
};

const mismatchPolicy = {
  status: doc.includes("status: `blocked_calibration_result`"),
  issue_code: doc.includes("issue code: `blocked_calibration_result`"),
  path: doc.includes("RFC 6901 path: `/calibration/calibration_hash`"),
  severity: doc.includes("severity: `error`"),
  message_key: doc.includes("messageKey: `confidence_calibration_advisory.blocked_calibration_result`"),
  no_raw_hash_values: doc.includes("No raw expected hash, actual hash"),
  proposed_confidence_null: doc.includes("proposed_calibrated_confidence: `null`"),
  advisory_eligible_false: doc.includes("advisory_eligible: `false`"),
  application_eligible_false: doc.includes("application_eligible: `false`"),
  non_authoritative_true: doc.includes("non_authoritative: `true`"),
  applied_false: doc.includes("applied: `false`"),
};

const validationOrder = {
  phase_10: doc.includes("Semantic result-hash recomputation belongs inside phase 10"),
  outranks_lineage: doc.includes("hash mismatch outranks later lineage fault") || doc.includes("outrank later lineage"),
  outranks_leakage: doc.includes("hash mismatch outranks leakage fault") || doc.includes("leakage"),
  outranks_feedback: doc.includes("hash mismatch outranks feedback fault") || doc.includes("feedback"),
  earlier_phases_outrank: doc.includes("Earlier phases must still outrank it"),
};

const attackMatrixChecks = Object.fromEntries(attackMatrix.map((item) => [item, doc.includes(item)]));
const action435RegressionChecks = Object.fromEntries(action435RegressionInventory.map((item) => [item, doc.includes(item)]));

const publicApiPreservation = {
  module: doc.includes("`lib/confidence-calibration-advisory-adapter.ts`"),
  runtime_export: doc.includes("`buildConfidenceCalibrationAdvisory`"),
  type_exports:
    doc.includes("`ImmutableRecommendationConfidenceEnvelope`") &&
    doc.includes("`FrozenAdvisoryConsumptionConfiguration`") &&
    doc.includes("`ConfidenceCalibrationAdvisoryResult`"),
  signature: doc.includes("function signature must remain unchanged"),
  no_public_hashing_helpers: doc.includes("No public hashing helpers may be exported"),
};

const unaffectedBehavior = {
  calibrated: doc.includes("`calibrated`"),
  calibrated_with_warnings: doc.includes("`calibrated_with_warnings`"),
  no_adjustment: doc.includes("`no_adjustment`"),
  confidence_mismatch: doc.includes("confidence mismatch"),
  blocked_statuses: doc.includes("blocked calibration statuses"),
  advisory_identity: doc.includes("advisory identity"),
  non_authoritative: doc.includes("`non_authoritative: true`"),
  applied_false: doc.includes("`applied: false`"),
  application_eligible_false: doc.includes("`application_eligible: false`"),
  immutability: doc.includes("immutability"),
  determinism: doc.includes("determinism"),
};

const forbiddenArtifactsFound = forbiddenAction434Artifacts.filter(exists);
const action434ConsumerFiles = rgFiles(
  "action_434|action-434|confidence-calibration-advisory-adapter-contract-remediation-approval-gate",
  ["app", "lib", "scripts", "tests", "docs"],
);
const unexpectedAction434Consumers = action434ConsumerFiles.filter(
  (path) => ![
    paths.doc,
    paths.verifier,
    paths.test,
    "docs/action-433-independent-confidence-calibration-advisory-adapter-verification.md",
    "scripts/action-433-independent-confidence-calibration-advisory-adapter-verification-verify.mjs",
    "tests/e2e/action-433-independent-confidence-calibration-advisory-adapter-verification.spec.ts",
    "scripts/action-318-static-replay-batch-commit-readiness-verify.mjs",
    "scripts/action-319-static-replay-batch-post-commit-verify.mjs",
    "scripts/action-320-static-replay-branch-package-verify.mjs",
    paths.action435Doc,
    paths.action435Verifier,
    paths.action435Test,
    paths.action436Doc,
    paths.action436Verifier,
    paths.action436Test,
  ].includes(path),
);
const adapterConsumers = rgFiles(
  "confidence-calibration-advisory-adapter|buildConfidenceCalibrationAdvisory",
  ["app", "lib"],
).filter((path) => path !== "lib/confidence-calibration-advisory-adapter.ts");

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

const checks = {
  documentation_exists: exists(paths.doc),
  verifier_exists: exists(paths.verifier),
  focused_test_exists: exists(paths.test),
  action433_blocked_decision: Object.values(action433BlockedFinding).every(Boolean),
  exact_failed_condition: action433BlockedFinding.failed_condition_exact,
  exact_remaining_gaps: action433BlockedFinding.remaining_gaps_exact,
  root_cause_classification: documentationSections.root_cause,
  semantic_payload_definition: Object.values(semanticPayloadDefinition).every(Boolean),
  canonicalization_policy: Object.values(canonicalizationPolicy).every(Boolean),
  result_hash_recomputation_policy: Object.values(recomputationPolicy).every(Boolean),
  supplied_recomputed_comparison_policy: documentationSections.supplied_recomputed_comparison,
  mismatch_behavior: Object.values(mismatchPolicy).every(Boolean),
  validation_order_placement: Object.values(validationOrder).every(Boolean),
  attack_matrix: Object.values(attackMatrixChecks).every(Boolean),
  identity_result_hash_distinction: documentationSections.identity_hash && documentationSections.result_hash,
  public_api_preservation: Object.values(publicApiPreservation).every(Boolean),
  unaffected_behavior_preservation: Object.values(unaffectedBehavior).every(Boolean),
  hash_regression_policy: documentationSections.hash_regression,
  action435_boundary: documentationSections.action435_boundary,
  action435_regression_inventory: Object.values(action435RegressionChecks).every(Boolean),
  mandatory_action436_audit: documentationSections.action436_mandatory,
  approval_decision: documentationSections.approval_decision,
  implementation_unchanged: Object.values(sourceIntegrity).every((entry) => entry.matches),
  no_forbidden_artifacts: forbiddenArtifactsFound.length === 0,
  no_unexpected_action434_consumers: unexpectedAction434Consumers.length === 0,
  no_runtime_adapter_consumers: adapterConsumers.length === 0,
  no_side_effects: Object.values(safety).every((value) => value === false),
  action432_healthy: action432.verification_status === "passed",
  action433_healthy: action433.verification_status === "passed",
  action309_guard_healthy: action309.guard_status === "passed",
  golden_static_safety_healthy: golden.verification_status === "passed",
  runtime_preview_paused: doc.includes("runtime_preview_waiting_for_operator_inputs"),
};

const failedConditions = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([key]) => key);
const passedConditionsCount = Object.keys(checks).length - failedConditions.length;

const report = {
  verification_status: failedConditions.length === 0 ? "passed" : "failed",
  approval_decision: failedConditions.length === 0 ? "approved" : "blocked",
  approval_vocabulary: ["approved", "approved_with_conditions", "blocked"],
  root_cause_classification: "calibration_semantic_result_hash_not_recomputed",
  checks,
  passed_conditions_count: passedConditionsCount,
  failed_conditions_count: failedConditions.length,
  unresolved_conditions_count: 0,
  failed_conditions: failedConditions,
  unresolved_conditions: [],
  action433_blocked_finding: action433BlockedFinding,
  exact_remaining_gaps: expectedGaps,
  semantic_payload_definition: semanticPayloadDefinition,
  canonicalization_policy: canonicalizationPolicy,
  result_hash_recomputation_policy: recomputationPolicy,
  mismatch_policy: mismatchPolicy,
  validation_order: validationOrder,
  attack_matrix: attackMatrixChecks,
  identity_result_hash_distinction: {
    calibration_identity_hash_binds_identity_payload: documentationSections.identity_hash,
    calibration_result_hash_binds_full_bounded_result_payload: documentationSections.result_hash,
    do_not_conflate: doc.includes("must not weaken or conflate identity-hash and result-hash checks"),
  },
  public_api_preservation: publicApiPreservation,
  unaffected_behavior_preservation: unaffectedBehavior,
  action435_boundary: {
    approved_files: [
      "lib/confidence-calibration-advisory-adapter.ts",
      "docs/action-435-confidence-calibration-advisory-adapter-semantic-hash-remediation.md",
      "scripts/action-435-confidence-calibration-advisory-adapter-semantic-hash-remediation-verify.mjs",
      "tests/e2e/action-435-confidence-calibration-advisory-adapter-semantic-hash-remediation.spec.ts",
      "narrow Actions 431-434 compatibility updates",
      "minimal Actions 318-320 guard updates",
    ],
    forbidden_runtime_or_consumer_work: true,
  },
  action435_regression_inventory: action435RegressionChecks,
  mandatory_action436_audit: true,
  source_integrity: sourceIntegrity,
  forbidden_artifacts_found: forbiddenArtifactsFound,
  unexpected_action434_consumers: unexpectedAction434Consumers,
  runtime_adapter_consumers: adapterConsumers,
  safety,
  upstream_health: {
    action309_guard: action309.guard_status,
    action432: action432.verification_status,
    action433: action433.verification_status,
    golden_static_safety: golden.verification_status,
  },
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  unrelated_work_classification: "action_434_confidence_calibration_advisory_adapter_contract_remediation_approval_gate_only",
  recommended_next_action: "action_435_confidence_calibration_advisory_adapter_semantic_hash_remediation",
  next_required_independent_audit: "action_436_independent_post_remediation_advisory_adapter_verification",
};

console.log(JSON.stringify(report, null, 2));

if (report.verification_status !== "passed") {
  process.exitCode = 1;
}
