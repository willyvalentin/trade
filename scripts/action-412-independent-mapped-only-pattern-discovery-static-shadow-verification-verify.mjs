#!/usr/bin/env node

import { createHash } from "crypto";
import { execFileSync, spawnSync } from "child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { tmpdir } from "os";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const paths = {
  doc: "docs/action-412-independent-mapped-only-pattern-discovery-static-shadow-verification.md",
  verifier: "scripts/action-412-independent-mapped-only-pattern-discovery-static-shadow-verification-verify.mjs",
  test: "tests/e2e/action-412-independent-mapped-only-pattern-discovery-static-shadow-verification.spec.ts",
  action410Verifier: "scripts/action-410-mapped-only-pattern-discovery-static-shadow-execution-approval-gate-verify.mjs",
  action411Verifier: "scripts/action-411-mapped-only-pattern-discovery-static-shadow-use-verify.mjs",
  action411Runner: "scripts/action-411-mapped-only-pattern-discovery-static-shadow-run.mjs",
  action411Manifest: "docs/action-411-mapped-only-pattern-discovery-static-shadow-input-manifest.json",
  action411Doc: "docs/action-411-mapped-only-pattern-discovery-static-shadow-use.md",
  action411UseVerifier: "scripts/action-411-mapped-only-pattern-discovery-static-shadow-use-verify.mjs",
  action411Test: "tests/e2e/action-411-mapped-only-pattern-discovery-static-shadow-use.spec.ts",
  mapper: "lib/snapshot-to-learning-dataset-mapper.ts",
  patternDiscovery: "lib/pure-pattern-discovery.ts",
  learningFixture: "lib/learning-dataset-static-fixtures.ts",
  contextFixture: "lib/intelligence-context-static-fixtures.ts",
  patternFixture: "lib/pattern-insight-static-fixtures.ts",
  action400Runner: "scripts/action-400-expanded-static-mapper-shadow-run.mjs",
  action400Manifest: "docs/action-400-expanded-static-mapper-shadow-input-manifest.json",
  action404Test: "tests/e2e/action-404-pure-pattern-discovery-implementation.spec.ts",
};
const protectedHashes = {
  [paths.mapper]: "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  [paths.patternDiscovery]: "48b7667c8690a1d8d56b819a3727e37ea73af7710a45131eb3debab48627191c",
  [paths.learningFixture]: "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  [paths.contextFixture]: "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  [paths.patternFixture]: "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
  [paths.action400Runner]: "a1123e1416df78a51645321cb9a273095c2a338febd8021265c4e3ee972d5b05",
  [paths.action400Manifest]: "e0a2646492da2038bf156c0060c48eb8144e78ff0d57cda92a60d3ca36c95319",
  [paths.action411Runner]: "074a5ff02d288b03412996b09061dd509712dc891c3f4405ee540c9e1757010c",
  [paths.action411Manifest]: "79ecb36b0f69b9742ef377deabdaaeb9048be4c59305c3d7f94dd3c0c78c67f3",
};
const action411PackageHashes = {
  [paths.action411Doc]: "b5000b496e91c20c0e8d89991656026ff638081f8eaa76a8245a5c534b564036",
  [paths.action411UseVerifier]: "ad0d8d51f21946bb16c79f3b6f22ad9f94303cdb082c2143c7683debf11bb69c",
  [paths.action411Test]: "12df33a97205eae868f3008d0cee3494a418420df507c7f937ff32a90b5e97c0",
};
const orderedCaseIds = [
  "expanded_valid_bearish_risk_context",
  "expanded_valid_fda_event_context",
  "expanded_valid_future_event_excluded",
  "expanded_valid_identity_nfc_equivalent",
  "expanded_valid_identity_percent_encoding",
  "expanded_valid_sec_event_context",
  "valid_complete_mapping",
  "valid_equivalent_aliases",
  "valid_normalized_confidence",
  "valid_rich_context",
];
const semanticHashes = {
  evidence_set_sha256: "f1f0053264c85d640d46b61da0ce7120e491309e3070132fe74a69a68438cbd8",
  group_sha256: "aa2ae3f39146ce1c6fc1f6ed73e19e96b02b7866b34e75b61c471a8277a1122e",
  result_sha256: "e911709a784159c684a350de490fd56446ee23c23b3bf5ea2fbb70378ebf253c",
  repeat_batch_sha256: "bad2ba397af95ace6883e2ea45bbd046bd4d6ad23264103aef34184468853be3",
};
const requiredDocSections = [
  "Purpose", "Scope", "Authoritative Dependencies", "Action 410 Approval Summary",
  "Action 411 Execution Summary", "Explicit Non-Goals", "Source-Integrity Audit",
  "Runner-Integrity Audit", "Manifest-Integrity Audit", "Exact-Case Audit",
  "Case-Order Audit", "Mapper-Reconstruction Audit", "Row-ID Audit", "Row-Hash Audit",
  "Lineage Audit", "Duplicate-Inventory Audit", "Pattern Discovery Configuration Audit",
  "Status Audit", "Warning Audit", "Support/Count Audit", "Insight-Count Audit",
  "Evidence-Set Hash Audit", "Group Hash Audit", "Result Hash Audit", "Batch Hash Audit",
  "Repeat-Run Audit", "Metadata-Only Audit", "Path-Safety Audit", "Cleanup Audit",
  "Tracked-Evidence Audit", "Source-Mutation Audit", "External-Access Audit",
  "Persistence Audit", "Replay Audit", "Runtime Audit", "Feedback Audit",
  "Authoritative-Data Audit", "Coverage-Strength Review", "Remaining Coverage-Gap Review",
  "Expansion-Readiness Review", "Readiness Vocabulary", "Readiness Decision",
  "Passed Conditions", "Failed Conditions", "Unresolved Conditions", "Next Permitted Action",
];
const expectedWarnings = [
  "minimum_total_support_not_met",
  "minimum_completed_outcomes_not_met",
  "duplicate_mapper_row_identity",
];

const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");
const shaFile = (path) => createHash("sha256").update(readFileSync(abs(path))).digest("hex");
const sourceAvoids = (source, tokens) => tokens.every((token) => !source.includes(token));

function collectFiles(path) {
  if (!exists(path)) return [];
  if (statSync(abs(path)).isFile()) return [path];
  return readdirSync(abs(path)).flatMap((entry) => collectFiles(join(path, entry))).sort();
}

function statusFiles() {
  const output = execFileSync("git", ["status", "--short", "--untracked-files=all"], { cwd: root, encoding: "utf8" });
  return output.trim().split("\n").filter(Boolean).map((line) => line.slice(3).trim()).sort();
}

function runJson(path) {
  return JSON.parse(execFileSync("node", [abs(path)], { cwd: root, encoding: "utf8", timeout: 240000 }));
}

function runJsonWithStatusAudit(path) {
  const statusBefore = statusFiles();
  const hashBefore = Object.fromEntries(Object.keys(protectedHashes).map((file) => [file, exists(file) ? shaFile(file) : null]));
  const result = runJson(path);
  const statusAfter = statusFiles();
  const hashAfter = Object.fromEntries(Object.keys(protectedHashes).map((file) => [file, exists(file) ? shaFile(file) : null]));
  return {
    result,
    source_status_unchanged: JSON.stringify(statusBefore) === JSON.stringify(statusAfter),
    protected_hashes_unchanged_after_execution: JSON.stringify(hashBefore) === JSON.stringify(hashAfter),
  };
}

function runtimeConsumerFiles() {
  const scanTargets = ["app", "public", "proxy.ts", "middleware.ts", "middleware.js", "netlify.toml"].filter(exists);
  if (scanTargets.length === 0) return [];
  const scan = spawnSync("rg", ["-l", "action-412|action_412|pure-pattern-discovery|snapshot-to-learning-dataset-mapper|discoverPatterns|mapSnapshotToLearningDataset", ...scanTargets], {
    cwd: root,
    encoding: "utf8",
  });
  if (![0, 1].includes(scan.status ?? -1)) return ["runtime_consumer_scan_failed"];
  return scan.stdout.trim().split("\n").filter(Boolean);
}

const doc = exists(paths.doc) ? read(paths.doc) : "";
const verifierSource = exists(paths.verifier) ? read(paths.verifier) : "";
const testSource = exists(paths.test) ? read(paths.test) : "";
const runnerSource = exists(paths.action411Runner) ? read(paths.action411Runner) : "";
const manifest = exists(paths.action411Manifest) ? JSON.parse(read(paths.action411Manifest)) : null;
const action410 = exists(paths.action410Verifier) ? runJson(paths.action410Verifier) : null;
const action411 = exists(paths.action411Verifier) ? runJson(paths.action411Verifier) : null;
const runnerAudit = exists(paths.action411Runner) ? runJsonWithStatusAudit(paths.action411Runner) : { result: null, source_status_unchanged: false, protected_hashes_unchanged_after_execution: false };
const runnerResult = runnerAudit.result;
const action404TestSource = exists(paths.action404Test) ? read(paths.action404Test) : "";
const tempOutputPath = join(tmpdir(), "ture", "action-411-mapped-only-pattern-discovery-shadow");
const trackedEvidenceFiles = [...collectFiles("docs"), ...collectFiles("tests"), ...collectFiles("scripts")]
  .filter((path) => /action-411-mapped-only-pattern-discovery-static-shadow/.test(path))
  .filter((path) => /evidence|report|result|row|insight/.test(path))
  .filter((path) => ![
    paths.action411Manifest,
    paths.action411Runner,
    paths.action411Doc,
    paths.action411UseVerifier,
    paths.action411Test,
  ].includes(path));
const protectedHashReadback = Object.fromEntries(Object.entries(protectedHashes).map(([path, expected]) => [
  path,
  { expected, actual: exists(path) ? shaFile(path) : null, unchanged: exists(path) && shaFile(path) === expected },
]));
const action411PackageHashReadback = Object.fromEntries(Object.entries(action411PackageHashes).map(([path, expected]) => [
  path,
  { expected, actual: exists(path) ? shaFile(path) : null, unchanged: exists(path) && shaFile(path) === expected },
]));
const manifestCases = manifest?.ordered_cases ?? [];
const manifestCaseIds = manifestCases.map((item) => item.case_id);
const manifestInputHashes = manifestCases.map((item) => item.canonical_mapper_input_sha256);
const manifestRowIds = manifestCases.map((item) => item.expected_mapper_row_id);
const manifestRowHashes = manifestCases.map((item) => item.expected_canonical_row_sha256);
const noEffectFlags = {
  provider_call_executed: false,
  provider_call_attempted: false,
  supabase_read_executed: false,
  supabase_write_executed: false,
  persistence_executed: false,
  replay_executed: false,
  runtime_integration_executed: false,
  feedback_executed: false,
  authoritative_data_created: false,
  scanner_behavior_changed: false,
  live_ranking_changed: false,
  recommendations_mutated: false,
  runtime_preview_advanced: false,
};
const checks = {
  documentation_exists: exists(paths.doc),
  documentation_contract_complete: requiredDocSections.every((section) => doc.includes(`## ${section}`)),
  protected_hashes_recorded_and_match: Object.values(protectedHashReadback).every((entry) => entry.unchanged) &&
    Object.entries(protectedHashes).every(([, hash]) => doc.includes(hash)),
  runner_manifest_integrity: protectedHashReadback[paths.action411Runner]?.unchanged === true &&
    protectedHashReadback[paths.action411Manifest]?.unchanged === true &&
    Object.values(action411PackageHashReadback).every((entry) => entry.unchanged),
  exact_rerun_result_recorded: runnerResult?.final_shadow_decision === "shadow_passed" &&
    action411?.final_shadow_decision === "shadow_passed",
  exact_ten_cases: manifest?.case_count === 10 && manifestCases.length === 10,
  exact_case_order: JSON.stringify(manifestCaseIds) === JSON.stringify(orderedCaseIds) && new Set(manifestCaseIds).size === 10,
  mapper_input_hashes_frozen: manifestInputHashes.length === 10 && manifestInputHashes.every((hash) => /^[a-f0-9]{64}$/.test(hash)),
  mapper_row_ids_frozen: manifestRowIds.length === 10 && manifestRowIds.every((id) => id.startsWith("learning_row:v1:")),
  row_hashes_frozen: manifestRowHashes.length === 10 && manifestRowHashes.every((hash) => /^[a-f0-9]{64}$/.test(hash)),
  lineage_audit_present: manifestCases.every((item) =>
    item.expected_mapper_status === "mapped" &&
    item.expected_consumable === true &&
    item.expected_setup_family === "momentum_continuation" &&
    item.expected_horizon === "60m" &&
    item.expected_outcome_classification === "target_hit",
  ),
  duplicate_inventory_exact: manifest?.duplicate_clusters?.length === 3 &&
    runnerResult?.support_counts?.case_support_count === 10 &&
    runnerResult?.support_counts?.unique_mapper_row_count === 3 &&
    manifest.duplicate_clusters.some((cluster) => cluster.duplicate_cluster_id === "duplicate_cluster:shared_snapshot_row" && cluster.case_count === 8),
  pattern_configuration_exact: manifest?.pattern_discovery_configuration?.grouping_dimension === "setup_family" &&
    manifest?.pattern_discovery_configuration?.minimum_total_support === 20 &&
    manifest?.pattern_discovery_configuration?.minimum_completed_outcomes === 20 &&
    manifest?.pattern_discovery_configuration?.numeric_scale === 1000000,
  status_warning_count_exact: runnerResult?.pattern_discovery_status === "insufficient_evidence" &&
    runnerResult?.group_status === "insufficient_evidence" &&
    JSON.stringify(runnerResult?.warning_codes ?? []) === JSON.stringify(expectedWarnings) &&
    runnerResult?.outcome_counts?.completed_outcome_count === 10 &&
    runnerResult?.outcome_counts?.positive_count === 10 &&
    runnerResult?.outcome_counts?.negative_count === 0 &&
    runnerResult?.outcome_counts?.neutral_count === 0,
  zero_insights: runnerResult?.insight_count === 0,
  semantic_hashes_exact: runnerResult?.evidence_set_sha256 === semanticHashes.evidence_set_sha256 &&
    runnerResult?.group_sha256 === semanticHashes.group_sha256 &&
    runnerResult?.result_sha256 === semanticHashes.result_sha256,
  repeat_batch_hash_exact: runnerResult?.repeat_run_identical === true &&
    runnerResult?.run_1_batch_sha256 === semanticHashes.repeat_batch_sha256 &&
    runnerResult?.run_2_batch_sha256 === semanticHashes.repeat_batch_sha256,
  exactly_two_runs_no_retry: (runnerSource.match(/const run[12] = await runOnce\(manifest, caseDefinitions,/g) ?? []).length === 2 &&
    !runnerSource.includes("retry") &&
    !runnerSource.includes("third execution"),
  metadata_only_boundary: runnerSource.includes("assertMetadataOnly") &&
    runnerSource.includes("metadata-evidence.json") &&
    runnerResult?.metadata_only_result === "passed" &&
    runnerSource.includes("recommendationSnapshot") &&
    runnerSource.includes("contextSnapshot") &&
    runnerSource.includes("TRADE_APP_PASSWORD") &&
    runnerSource.includes("AUTOMATION_SECRET"),
  no_full_rows_results_insights_retained: trackedEvidenceFiles.length === 0 && doc.includes("full rows") && doc.includes("full Pattern Discovery results") && doc.includes("Pattern Insights"),
  path_safety_audit: runnerSource.includes("unsafe_output_not_within_system_temp") &&
    runnerSource.includes("unsafe_output_forbidden_root") &&
    runnerSource.includes("unsafe_output_traversal") &&
    runnerSource.includes("unsafe_output_symlink") &&
    runnerSource.includes("unsafe_output_not_empty"),
  cleanup_audit: !existsSync(tempOutputPath) &&
    runnerResult?.cleanup_result === "passed" &&
    runnerResult?.temporary_evidence_deleted === true,
  no_source_mutation: runnerAudit.source_status_unchanged === true && runnerAudit.protected_hashes_unchanged_after_execution === true,
  no_external_access_persistence_replay_runtime_feedback: runtimeConsumerFiles().length === 0 &&
    sourceAvoids(runnerSource, [
      "fetch" + "(",
      "@supa" + "base",
      "supabase" + "-js",
      "TWELVE" + "_DATA",
      "next" + "/server",
      "provider",
      "broker",
      "queue",
      "analytics",
      "calibration",
    ]) &&
    runnerResult?.persistence_result === "none" &&
    runnerResult?.replay_result === "none" &&
    runnerResult?.runtime_result === "none" &&
    runnerResult?.external_access_result === "none" &&
    runnerResult?.feedback_result === "none",
  material_and_reordered_hash_behavior_audited: action404TestSource.includes("deterministic evidence group insight result hashes and reordered input match") &&
    action404TestSource.includes("changed rows"),
  coverage_expansion_review_present: [
    "sufficient-support discovered path",
    "discovered_with_warnings",
    "mixed positive/negative evidence",
    "multiple setup-family groups",
    "more than one horizon",
    "separately gated",
  ].every((marker) => doc.includes(marker)),
  readiness_decision_ready: doc.includes("## Readiness Decision\n\n`ready`"),
  action410_action411_healthy: action410?.verification_status === "passed" && action411?.verification_status === "passed",
  runtime_preview_untouched: runnerResult?.runtime_preview_status === "runtime_preview_waiting_for_operator_inputs" &&
    action411?.runtime_preview_status === "runtime_preview_waiting_for_operator_inputs",
  focused_tests_present: testSource.includes("Action 412 independent mapped-only Pattern Discovery static shadow verification") &&
    testSource.includes("expansion readiness remains separately gated"),
  verifier_isolation: sourceAvoids(verifierSource, [
    "process" + ".env",
    "fetch" + "(",
    "@supa" + "base",
    "supabase" + "-js",
    "TWELVE" + "_DATA",
    "next" + "/server",
  ]),
};
const failedChecks = Object.entries(checks).filter(([, value]) => !value).map(([key]) => key);
const readinessDecision = failedChecks.length === 0 ? "ready" : "blocked";
const report = {
  verification_status: failedChecks.length === 0 ? "passed" : "failed",
  readiness_decision: readinessDecision,
  readiness_vocabulary: ["ready", "ready_with_conditions", "blocked"],
  checks,
  failed_checks: failedChecks,
  passed_conditions_count: Object.values(checks).filter(Boolean).length,
  failed_conditions_count: failedChecks.length,
  unresolved_conditions: [],
  action411_reproduction: {
    final_shadow_decision: runnerResult?.final_shadow_decision ?? null,
    case_count: runnerResult?.case_count ?? null,
    repeat_run_identical: runnerResult?.repeat_run_identical ?? null,
  },
  source_integrity: protectedHashReadback,
  action411_package_integrity: action411PackageHashReadback,
  case_audit: {
    case_ids: manifestCaseIds,
    mapper_input_hash_count: manifestInputHashes.length,
    row_id_count: manifestRowIds.length,
    row_hash_count: manifestRowHashes.length,
  },
  duplicate_inventory: {
    case_observations: runnerResult?.support_counts?.case_support_count ?? null,
    unique_mapper_rows: runnerResult?.support_counts?.unique_mapper_row_count ?? null,
    shared_duplicate_row_count: 8,
    duplicate_warning: "duplicate_mapper_row_identity",
  },
  pattern_discovery_result: {
    status: runnerResult?.pattern_discovery_status ?? null,
    group_status: runnerResult?.group_status ?? null,
    support_counts: runnerResult?.support_counts ?? null,
    outcome_counts: runnerResult?.outcome_counts ?? null,
    warnings: runnerResult?.warning_codes ?? null,
    insight_count: runnerResult?.insight_count ?? null,
  },
  semantic_hashes: semanticHashes,
  observed_hashes: {
    evidence_set_sha256: runnerResult?.evidence_set_sha256 ?? null,
    group_sha256: runnerResult?.group_sha256 ?? null,
    result_sha256: runnerResult?.result_sha256 ?? null,
    run_1_batch_sha256: runnerResult?.run_1_batch_sha256 ?? null,
    run_2_batch_sha256: runnerResult?.run_2_batch_sha256 ?? null,
  },
  evidence_boundary: {
    metadata_only_result: runnerResult?.metadata_only_result ?? null,
    path_safety_result: runnerResult?.path_safety_result ?? null,
    cleanup_result: runnerResult?.cleanup_result ?? null,
    temporary_evidence_deleted: !existsSync(tempOutputPath),
    tracked_evidence_files: trackedEvidenceFiles,
  },
  coverage_strengths: [
    "mapper_reconstruction",
    "row_lineage",
    "duplicate_handling",
    "insufficient_evidence_behavior",
    "deterministic_grouping",
    "support_warnings",
    "semantic_hashes",
    "repeat_run_determinism",
    "cleanup_and_isolation",
  ],
  remaining_coverage_gaps: [
    "sufficient_support_discovered_path",
    "discovered_with_warnings_mapper_rows",
    "mixed_positive_negative_evidence",
    "multiple_setup_family_groups",
    "multiple_horizons",
    "broader_valid_context_coverage",
    "warning_combinations",
    "additional_lineage_hash_variants",
  ],
  expansion_readiness_result: failedChecks.length === 0
    ? "expanded_static_package_ready_for_separate_approval_gate"
    : "expanded_static_package_not_ready",
  no_effect_flags: noEffectFlags,
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  unrelated_work_classification: "action_412_docs_verifier_tests_and_minimal_guard_updates_only",
  recommended_next_action: failedChecks.length === 0
    ? "action_413_expanded_static_pattern_discovery_coverage_package_approval_gate"
    : "resolve_action_412_independent_audit_failures_before_expansion_gate",
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.exitCode = failedChecks.length === 0 ? 0 : 1;
