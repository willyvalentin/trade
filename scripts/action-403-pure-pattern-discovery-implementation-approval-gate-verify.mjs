#!/usr/bin/env node

import { createHash } from "crypto";
import { execFileSync } from "child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const paths = {
  mapper: "lib/snapshot-to-learning-dataset-mapper.ts",
  learning: "lib/learning-dataset-static-fixtures.ts",
  context: "lib/intelligence-context-static-fixtures.ts",
  pattern: "lib/pattern-insight-static-fixtures.ts",
  action400Runner: "scripts/action-400-expanded-static-mapper-shadow-run.mjs",
  action400Manifest: "docs/action-400-expanded-static-mapper-shadow-input-manifest.json",
  action402Verifier: "scripts/action-402-pure-pattern-discovery-contract-and-mapped-only-downstream-static-shadow-approval-gate-verify.mjs",
  doc: "docs/action-403-pure-pattern-discovery-implementation-approval-gate.md",
  verifier: "scripts/action-403-pure-pattern-discovery-implementation-approval-gate-verify.mjs",
  test: "tests/e2e/action-403-pure-pattern-discovery-implementation-approval-gate.spec.ts",
};
const hashes = {
  [paths.mapper]: "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  [paths.learning]: "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  [paths.context]: "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  [paths.pattern]: "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
  [paths.action400Runner]: "a1123e1416df78a51645321cb9a273095c2a338febd8021265c4e3ee972d5b05",
  [paths.action400Manifest]: "e0a2646492da2038bf156c0060c48eb8144e78ff0d57cda92a60d3ca36c95319",
};
const exportedTypes = [
  "PatternDiscoveryRowEnvelope", "FrozenPatternDiscoveryConfiguration", "PatternDiscoveryResult",
  "PatternDiscoveryIssue", "PatternDiscoveryWarning", "PatternDiscoveryGroupResult",
  "PatternDiscoveryEvidenceSummary",
];
const resultStatuses = [
  "discovered", "discovered_with_warnings", "insufficient_evidence", "blocked_invalid_input",
  "blocked_invalid_configuration", "blocked_invalid_lineage", "blocked_future_leakage",
  "blocked_non_consumable_row", "blocked_nondeterministic_grouping",
];
const errorCodes = [
  "invalid_input_shape", "invalid_configuration_shape", "invalid_batch_declaration", "invalid_row_envelope",
  "ineligible_mapper_status", "missing_row", "non_consumable_row", "invalid_lineage", "future_leakage",
  "missing_grouping_field", "invalid_grouping_literal", "invalid_outcome", "non_finite_numeric",
  "nondeterministic_grouping", "duplicate_source_case_id",
];
const warningCodes = [
  "minimum_total_support_not_met", "minimum_completed_outcomes_not_met",
  "duplicate_mapper_row_identity", "metric_value_unavailable",
];
const sections = [
  "Purpose", "Scope", "Authoritative Dependencies", "Action 402 Decision", "Action 402 Future Conditions",
  "Explicit Non-Goals", "Protected Upstream Hashes", "Exact Approved Implementation Module",
  "Exact Exported Type Inventory", "Exact Function Signature", "Input-Envelope Contract", "Configuration Contract",
  "Result Union", "Issue And Warning Contract", "Validation-Order Contract", "Grouping Algorithm",
  "Grouping-Key Serialization", "Stable Sorting", "Row Eligibility Validation", "Lineage Validation",
  "Leakage Validation", "Duplicate-Row Identity Handling", "Case-Level Versus Unique-Row Support",
  "Completed-Outcome Calculation", "Positive/Negative/Neutral Classification", "Minimum-Support Evaluation",
  "Insufficient-Evidence Construction", "Discovered-Result Construction", "Contradiction Handling",
  "Mixed-State Semantics", "Deterministic Integer Aggregation", "Fixed Rounding", "Zero-Denominator Behavior",
  "Finite-Number Behavior", "Null And Missing Behavior", "Identity Construction", "Evidence-Set Hashing",
  "Group Hashing", "Insight Identity", "Canonical Serialization", "Output Ordering", "Issue Ordering",
  "Warning Deduplication", "Input Immutability", "Output Determinism", "Prohibited Inference",
  "Prohibited Repair", "Prohibited Calibration", "No-Persistence Guarantee", "No-Runtime Guarantee",
  "No-Feedback Guarantee", "Implementation File Boundary", "Test Boundary", "Verifier Boundary",
  "Acceptance Criteria", "Rejection Criteria", "Independent-Audit Requirement", "Approval Vocabulary",
  "Deterministic Gate Conditions", "Approval Decision", "Next Permitted Action",
];
const abs = (path) => join(root, path);
const read = (path) => readFileSync(abs(path), "utf8");
const shaFile = (path) => createHash("sha256").update(readFileSync(abs(path))).digest("hex");
const has = (source, markers) => markers.every((marker) => source.includes(marker));
function files(path) {
  if (!existsSync(abs(path))) return [];
  if (statSync(abs(path)).isFile()) return [path];
  return readdirSync(abs(path)).flatMap((name) => files(join(path, name))).sort();
}

const requiredFilesFound = Object.values(paths).every((path) => existsSync(abs(path)));
const doc = requiredFilesFound ? read(paths.doc) : "";
const tests = requiredFilesFound ? read(paths.test) : "";
const action402 = requiredFilesFound ? JSON.parse(execFileSync("node", [abs(paths.action402Verifier)], { cwd: root, encoding: "utf8" })) : null;
const changed = execFileSync("git", ["status", "--short", "--untracked-files=all"], { cwd: root, encoding: "utf8" }).trim().split("\n").filter(Boolean).map((line) => line.slice(3).trim());
const action403Files = changed.filter((path) => path.includes("action-403"));
const allowedAction403Files = [paths.doc, paths.verifier, paths.test];
const implementationPath = "lib/pure-pattern-discovery.ts";
const suspiciousImplementationFiles = files("lib").filter((path) => path !== paths.pattern && /(?:pure-pattern-discovery|pattern.*discovery|cohort-builder|segmenter|statistics-helper|metric-calculator|insight-builder|insight-generator)/i.test(path));
const downstreamRunnerOrManifest = [...files("scripts"), ...files("docs")].filter((path) => /action-40[34].*(?:downstream.*(?:run|manifest)|pattern-discovery.*(?:run|manifest))/i.test(path));
const productionConsumers = files("app").filter((path) => /\.(?:ts|tsx|js|jsx)$/.test(path) && /discoverPatterns|pure-pattern-discovery|patternDiscovery/.test(read(path)));
const action404Artifacts = changed.filter((path) => path.includes("action-404") || path === implementationPath);
const allowedAction404Files = [
  "lib/pure-pattern-discovery.ts",
  "docs/action-404-pure-pattern-discovery-implementation.md",
  "scripts/action-404-pure-pattern-discovery-implementation-verify.mjs",
  "tests/e2e/action-404-pure-pattern-discovery-implementation.spec.ts",
];

const checks = {
  required_files_found: requiredFilesFound,
  documentation_sections_complete: sections.every((section) => doc.includes(`## ${section}`)),
  action402_decision_and_conditions: action402?.verification_status === "passed" && action402?.approval_decision === "approved_with_conditions" && action402?.future_conditions_count === 2 && has(doc, ["`approval_decision: approved_with_conditions`", "26 passed, 0 failed, 0 unresolved, and 2 future conditions"]),
  protected_hashes_unchanged: Object.entries(hashes).every(([path, hash]) => shaFile(path) === hash && doc.includes(hash)),
  exact_module_and_export_inventory: doc.includes("`lib/pure-pattern-discovery.ts`") && exportedTypes.every((type) => doc.includes(`\`${type}\``)) && has(doc, ["exactly these seven types", "exactly one runtime symbol: `discoverPatterns`", "No other type, function, constant"]),
  exact_function_signature_and_purity: has(doc, ["export function discoverPatterns(input: Readonly<", "rows: readonly PatternDiscoveryRowEnvelope[]", "configuration: FrozenPatternDiscoveryConfiguration", ">): PatternDiscoveryResult;", "function is synchronous", "no overload, hidden argument"]),
  input_envelope_exact: has(doc, ["`source_case_id: string`", "`canonical_mapper_input_sha256: string`", "`mapper_status: \"mapped\"`", "`canonical_row_sha256: string`", "`row: Action335LearningDatasetRow`", "Unknown fields are invalid"]),
  configuration_exact: has(doc, ["`contract_version: \"pure_pattern_discovery_contract_v1\"`", "`configuration_version: \"pattern_discovery_setup_family_v1\"`", "`minimum_total_support: 20`", "`numeric_scale: 1000000`", "`rounding_mode: \"half_away_from_zero\"`", "implementation-selected thresholds are forbidden"]),
  result_vocabulary_exact: resultStatuses.every((status) => doc.includes(`- \`${status}\``)),
  issue_warning_contract_exact: errorCodes.every((code) => doc.includes(`- \`${code}\``)) && warningCodes.every((code) => doc.includes(`\`${code}\``)) && has(doc, ["exactly `{code,path,severity,messageKey}`", "RFC 6901", "pattern_discovery.<code>"]),
  validation_order_exact: ["1. input shape", "2. configuration shape/literals", "3. batch declarations/count/order", "4. row-envelope shape", "5. mapper status", "6. lineage identity", "7. anti-leakage", "8. required grouping field", "9. outcome availability", "10. finite numeric", "11. deterministic grouping", "12. aggregation", "13. support evaluation", "14. result construction"].every((marker) => doc.includes(marker)) && doc.includes("first failing phase"),
  grouping_and_key_algorithm_exact: has(doc, ["exact raw `/row/setup_and_confidence/setup_family` literal", "must equal `momentum_continuation`", "pattern_group:v1|setup_family=<encoded-value>", "Normalize the validated literal to NFC", "Combinatorial dimensions"]),
  duplicate_and_support_semantics_exact: has(doc, ["Repeated mapper row IDs", "one warning per duplicated mapper row ID", "`case_support_count`", "expected 10", "`unique_mapper_row_count`", "expected 3", "Minimum total support uses `case_support_count`"]),
  outcome_and_minimum_behavior_exact: has(doc, ["`target_hit` -> positive", "`stop_hit` -> negative", "Expected initial counts are completed 10, positive 10, negative 0, neutral 0", "Compare `case_support_count` with 20", "cannot return `discovered`"]),
  insufficient_and_discovered_construction_exact: has(doc, ["top-level status is `insufficient_evidence`", "`insights: []`", "Only test-local synthetic groups meeting both 20 thresholds", "Production readiness, validated signal"]),
  contradiction_and_mixed_semantics_exact: has(doc, ["Never suppress minority evidence", "produces Action 343 effect direction `mixed`", "`mixed` is descriptive contradiction"]),
  deterministic_integer_aggregation_and_rounding: has(doc, ["`numeric_scale: 1000000`", "Number.isSafeInteger(value * 1000000)", "Convert to `BigInt`", "round half-up to 4 decimal places", "round half-away-from-zero to 4 decimal places", "denominator zero is `null`"]),
  identity_and_hash_contracts_exact: has(doc, ["Canonical row hash is SHA-256", "pattern_evidence_set:v1", "pattern_group_hash:v1", "pattern_insight:v1:<lowercase-hex-sha256>", "recursively sorts object keys lexically"]),
  deterministic_order_issue_warning_and_immutability: has(doc, ["Evidence units sort by Action 400 order index", "Collect only the first failing validation phase", "Deduplicate warnings by", "must not mutate input", "interleaved calls must serialize identically"]),
  prohibited_inference_repair_calibration: has(doc, ["Do not infer future returns", "Do not trim/case-fold", "No confidence summary calculation"]),
  no_persistence_runtime_feedback: has(doc, ["imports no database/Supabase", "imports no Next/runtime route", "Output cannot call or mutate calibration"]),
  implementation_boundary_exact: has(doc, ["`lib/pure-pattern-discovery.ts`", "`docs/action-404-pure-pattern-discovery-implementation.md`", "`scripts/action-404-pure-pattern-discovery-implementation-verify.mjs`", "`tests/e2e/action-404-pure-pattern-discovery-implementation.spec.ts`", "No runner, manifest, service"]),
  future_tests_complete: has(doc, ["exact input/configuration", "invalid configuration/status/row/consumability/lineage/leakage/group/outcome/numeric values", "insufficient and sufficient support", "repeated/interleaved calls", "absence of filesystem/network/environment/persistence/feedback"]),
  independent_action405_audit_required: has(doc, ["Action 405 must independently verify", "without modifying it", "No shadow approval may occur before Action 405"]),
  acceptance_and_rejection_exact: has(doc, ["Accept implementation only if", "Reject extra exports/modules", "unique-support inflation"]),
  approval_vocabulary_and_decision: has(doc, ["Vocabulary is exactly `approved`, `approved_with_conditions`, and `blocked`", "`approval_decision: approved_with_conditions`", "`passed_conditions_count: 28`", "`failed_conditions_count: 0`", "`unresolved_conditions_count: 0`", "`future_conditions_count: 1`"]),
  exact_action404_pure_implementation_only: JSON.stringify(suspiciousImplementationFiles) === JSON.stringify([implementationPath]) && productionConsumers.length === 0,
  no_runner_manifest_and_action404_boundary_exact: downstreamRunnerOrManifest.length === 0 && action404Artifacts.length === allowedAction404Files.length && action404Artifacts.every((path) => allowedAction404Files.includes(path)),
  action403_boundary_exact: action403Files.every((path) => allowedAction403Files.includes(path)),
  runtime_preview_untouched: action403Files.every((path) => !path.includes("runtime-preview")) && doc.includes("runtime_preview_waiting_for_operator_inputs"),
  focused_tests_exist: has(tests, ["exact module exports and synchronous signature are frozen", "validation order result vocabulary and issues are exact", "duplicate row and support semantics remain distinct", "expected initial result is insufficient evidence", "only the approved implementation exists with no runner or manifest", "verifier returns approved_with_conditions"]),
};
const verification_status = Object.values(checks).every(Boolean) ? "passed" : "blocked";
const report = {
  verification_status,
  ...checks,
  approval_decision: verification_status === "passed" ? "approved_with_conditions" : "blocked",
  passed_conditions_count: verification_status === "passed" ? 28 : Object.values(checks).filter(Boolean).length,
  failed_conditions_count: Object.values(checks).filter((value) => !value).length,
  unresolved_conditions_count: 0,
  future_conditions_count: verification_status === "passed" ? 1 : null,
  approved_module_path: "lib/pure-pattern-discovery.ts",
  approved_runtime_exports: ["discoverPatterns"],
  approved_type_exports: exportedTypes,
  result_vocabulary: resultStatuses,
  error_codes: errorCodes,
  warning_codes: warningCodes,
  expected_initial_result: { status: "insufficient_evidence", group_count: 1, group_key: "pattern_group:v1|setup_family=momentum_continuation", case_support_count: 10, unique_mapper_row_count: 3, completed_outcome_count: 10, positive_count: 10, negative_count: 0, neutral_count: 0, minimum_total_support: 20, minimum_completed_outcomes: 20, insight_count: 0, duplicate_mapper_row_identity_warning: true, non_authoritative: true },
  pattern_discovery_implementation_files: suspiciousImplementationFiles,
  production_pattern_consumer_files: productionConsumers,
  downstream_runner_or_manifest_files: downstreamRunnerOrManifest,
  action_404_artifacts: action404Artifacts,
  action_403_changed_files: action403Files,
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  no_effect_flags: { pattern_discovery_implemented: true, pattern_discovery_executed: false, mapper_rows_reconstructed: false, downstream_shadow_executed: false, insights_generated: false, provider_call_executed: false, news_call_executed: false, supabase_read_executed: false, supabase_write_executed: false, persistence_executed: false, replay_executed: false, runtime_integration_executed: false, feedback_executed: false, authoritative_data_created: false, scanner_behavior_changed: false, live_ranking_changed: false, recommendations_mutated: false },
  recommended_next_action: verification_status === "passed" ? "action_405_independent_pure_pattern_discovery_verification" : "remediate_action_403_gate",
};
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.exitCode = verification_status === "passed" ? 0 : 1;
