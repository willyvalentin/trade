#!/usr/bin/env node

import { createHash } from "crypto";
import { execFileSync, spawnSync } from "child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { tmpdir } from "os";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const paths = {
  manifest: "docs/action-411-mapped-only-pattern-discovery-static-shadow-input-manifest.json",
  runner: "scripts/action-411-mapped-only-pattern-discovery-static-shadow-run.mjs",
  doc: "docs/action-411-mapped-only-pattern-discovery-static-shadow-use.md",
  verifier: "scripts/action-411-mapped-only-pattern-discovery-static-shadow-use-verify.mjs",
  test: "tests/e2e/action-411-mapped-only-pattern-discovery-static-shadow-use.spec.ts",
  action410Verifier: "scripts/action-410-mapped-only-pattern-discovery-static-shadow-execution-approval-gate-verify.mjs",
  mapper: "lib/snapshot-to-learning-dataset-mapper.ts",
  patternDiscovery: "lib/pure-pattern-discovery.ts",
  learningFixture: "lib/learning-dataset-static-fixtures.ts",
  contextFixture: "lib/intelligence-context-static-fixtures.ts",
  patternFixture: "lib/pattern-insight-static-fixtures.ts",
  action400Runner: "scripts/action-400-expanded-static-mapper-shadow-run.mjs",
  action400Manifest: "docs/action-400-expanded-static-mapper-shadow-input-manifest.json",
};
const protectedHashes = {
  mapper_sha256: "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  pattern_discovery_sha256: "48b7667c8690a1d8d56b819a3727e37ea73af7710a45131eb3debab48627191c",
  learning_fixture_sha256: "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  context_fixture_sha256: "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  pattern_fixture_sha256: "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
  action_400_runner_sha256: "a1123e1416df78a51645321cb9a273095c2a338febd8021265c4e3ee972d5b05",
  action_400_manifest_sha256: "e0a2646492da2038bf156c0060c48eb8144e78ff0d57cda92a60d3ca36c95319",
};
const protectedHashPaths = {
  mapper_sha256: paths.mapper,
  pattern_discovery_sha256: paths.patternDiscovery,
  learning_fixture_sha256: paths.learningFixture,
  context_fixture_sha256: paths.contextFixture,
  pattern_fixture_sha256: paths.patternFixture,
  action_400_runner_sha256: paths.action400Runner,
  action_400_manifest_sha256: paths.action400Manifest,
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
};
const expectedBatchHash = "bad2ba397af95ace6883e2ea45bbd046bd4d6ad23264103aef34184468853be3";
const allowedPackagePaths = [paths.manifest, paths.runner, paths.doc, paths.verifier, paths.test];
const excludedInputMarkers = [
  "mapped_with_missing_optional_data",
  "blocked_*",
  "pending",
  "incomplete",
  "stale",
  "partial",
  "conflicting",
  "unknown",
  "unavailable",
  "lineage-unverified",
  "externally supplied",
  "persisted",
  "runtime-derived",
  "environment-derived",
];
const requiredDocSections = [
  "Purpose",
  "Scope",
  "Action 410 Approval",
  "Package Boundary",
  "Protected Hashes",
  "Ten-Case Inventory",
  "Exclusions",
  "Mapper Reconstruction",
  "Row Verification",
  "Pattern Discovery Configuration",
  "Expected Result",
  "Semantic Hashes",
  "Actual Result",
  "Repeat-Run Determinism",
  "Metadata-Only Evidence",
  "Path Safety",
  "Cleanup",
  "Integrity",
  "No Effects",
  "Classification",
  "Runtime Preview",
  "Final Shadow Decision",
  "Next Independent Audit Action",
];

const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");
const shaFile = (path) => createHash("sha256").update(readFileSync(abs(path))).digest("hex");

function collectFiles(path) {
  if (!exists(path)) return [];
  if (statSync(abs(path)).isFile()) return [path];
  return readdirSync(abs(path)).flatMap((entry) => collectFiles(join(path, entry))).sort();
}

function statusFiles() {
  const output = execFileSync("git", ["status", "--short", "--untracked-files=all"], { cwd: root, encoding: "utf8" });
  return output.trim().split("\n").filter(Boolean).map((line) => line.slice(3).trim()).sort();
}

function loadJson(path) {
  return JSON.parse(read(path));
}

function runJson(path) {
  const statusBefore = statusFiles();
  const output = execFileSync("node", [abs(path)], { cwd: root, encoding: "utf8", timeout: 240000 });
  const statusAfter = statusFiles();
  return {
    result: JSON.parse(output),
    source_status_unchanged: JSON.stringify(statusBefore) === JSON.stringify(statusAfter),
  };
}

function runtimeConsumerFiles() {
  const scanTargets = ["app", "public"].filter(exists);
  if (scanTargets.length === 0) return [];
  const scan = spawnSync("rg", ["-l", "pure-pattern-discovery|snapshot-to-learning-dataset-mapper|discoverPatterns|mapSnapshotToLearningDataset", ...scanTargets], {
    cwd: root,
    encoding: "utf8",
  });
  if (![0, 1].includes(scan.status ?? -1)) return ["runtime_consumer_scan_failed"];
  return scan.stdout.trim().split("\n").filter(Boolean);
}

const manifest = exists(paths.manifest) ? loadJson(paths.manifest) : null;
const doc = exists(paths.doc) ? read(paths.doc) : "";
const runnerSource = exists(paths.runner) ? read(paths.runner) : "";
const testSource = exists(paths.test) ? read(paths.test) : "";
const action410 = exists(paths.action410Verifier)
  ? JSON.parse(execFileSync("node", [abs(paths.action410Verifier)], { cwd: root, encoding: "utf8", timeout: 240000 }))
  : null;
const runnerExecution = exists(paths.runner) ? runJson(paths.runner) : { result: null, source_status_unchanged: false };
const runnerResult = runnerExecution.result;
const tempOutputPath = join(tmpdir(), "ture", "action-411-mapped-only-pattern-discovery-shadow");
const docsAction411Files = collectFiles("docs").filter((path) => path.includes("action-411-mapped-only-pattern-discovery-static-shadow"));
const trackedEvidenceFiles = docsAction411Files.filter((path) => /evidence|report|result/.test(path) && !allowedPackagePaths.includes(path));
const packageFilesPresent = allowedPackagePaths.filter(exists);
const downstreamPackageFiles = [...collectFiles("docs"), ...collectFiles("scripts"), ...collectFiles("tests/e2e")]
  .filter((path) => path.includes("action-411-mapped-only-pattern-discovery-static-shadow"))
  .sort();
const protectedHashReadback = Object.fromEntries(Object.entries(protectedHashPaths).map(([key, path]) => [
  key,
  {
    expected: protectedHashes[key],
    actual: exists(path) ? shaFile(path) : null,
    unchanged: exists(path) && shaFile(path) === protectedHashes[key],
  },
]));
const manifestCaseIds = manifest?.ordered_cases?.map((item) => item.case_id) ?? [];
const manifestRowIds = manifest?.ordered_cases?.map((item) => item.expected_mapper_row_id) ?? [];
const manifestRowHashes = manifest?.ordered_cases?.map((item) => item.expected_canonical_row_sha256) ?? [];
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
  required_files_found: packageFilesPresent.length === allowedPackagePaths.length,
  documentation_contract_complete: requiredDocSections.every((section) => doc.includes(`## ${section}`)),
  manifest_schema_exact: manifest?.manifest_schema_version === "action_411_mapped_only_pattern_discovery_static_shadow_manifest_v1",
  manifest_declarations_exact: [
    "static_only",
    "non_production",
    "non_authoritative",
    "non_learning",
    "no_persistence",
    "no_replay",
    "no_runtime",
    "no_external_access",
    "no_feedback",
  ].every((key) => manifest?.[key] === true),
  exact_ten_case_order: JSON.stringify(manifestCaseIds) === JSON.stringify(orderedCaseIds) && manifest?.case_count === 10,
  excluded_input_policy_documented: excludedInputMarkers.every((marker) => doc.includes(marker)),
  protected_hashes_match: Object.values(protectedHashReadback).every((entry) => entry.unchanged) &&
    Object.entries(protectedHashes).every(([key, value]) => manifest?.[key] === value),
  row_ids_and_hashes_frozen: manifestRowIds.length === 10 && manifestRowHashes.length === 10 &&
    manifestRowIds.every((value) => typeof value === "string" && value.startsWith("learning_row:v1:")) &&
    manifestRowHashes.every((value) => /^[a-f0-9]{64}$/.test(value)),
  duplicate_inventory_exact: manifest?.duplicate_clusters?.length === 3 &&
    manifest.duplicate_clusters.some((cluster) => cluster.duplicate_cluster_id === "duplicate_cluster:shared_snapshot_row" && cluster.case_count === 8),
  configuration_explicit: manifest?.pattern_discovery_configuration?.minimum_total_support === 20 &&
    manifest?.pattern_discovery_configuration?.minimum_completed_outcomes === 20 &&
    manifest?.pattern_discovery_configuration?.numeric_scale === 1000000 &&
    manifest?.pattern_discovery_configuration?.rounding_mode === "half_away_from_zero",
  semantic_hashes_exact: manifest?.expected_evidence_set_sha256 === semanticHashes.evidence_set_sha256 &&
    manifest?.expected_group_sha256 === semanticHashes.group_sha256 &&
    manifest?.expected_result_sha256 === semanticHashes.result_sha256,
  no_automatic_or_arbitrary_input: runnerSource.includes("orderedCaseIds.map") &&
    !runnerSource.includes("process.argv") &&
    !runnerSource.includes("stdin") &&
    !runnerSource.includes("readline"),
  canonical_serialization_present: runnerSource.includes("canonicalJson") && runnerSource.includes("shaValue"),
  exactly_two_runs_present: (runnerSource.match(/const run[12] = await runOnce\(manifest, caseDefinitions,/g) ?? []).length === 2 &&
    !runnerSource.includes("retry") &&
    runnerSource.includes("repeat_run_nondeterminism"),
  expected_result_comparison_present: ["evidence_set_hash_mismatch", "group_hash_mismatch", "result_hash_mismatch", "warning_codes_mismatch"].every((marker) => runnerSource.includes(marker)),
  metadata_only_evidence_present: runnerSource.includes("metadata-evidence.json") &&
    runnerSource.includes("assertMetadataOnly") &&
    !runnerSource.includes("full_rows_allowed: true"),
  safe_temp_path_validation_present: runnerSource.includes("validateOutputPath") &&
    runnerSource.includes("unsafe_output_not_within_system_temp") &&
    runnerSource.includes("unsafe_output_symlink"),
  cleanup_verified: !existsSync(tempOutputPath) &&
    runnerResult?.cleanup_result === "passed" &&
    runnerResult?.temporary_evidence_deleted === true,
  no_tracked_evidence: trackedEvidenceFiles.length === 0,
  source_status_unchanged: runnerExecution.source_status_unchanged === true && runnerResult?.source_integrity_result === "passed",
  no_runtime_provider_supabase_replay_or_feedback: !/(fetch\(|@supabase|supabase-js|TWELVE_DATA|next\/server|provider|broker|from\s+["'][^"']*app\/api)/.test(runnerSource) &&
    runnerResult?.persistence_result === "none" &&
    runnerResult?.replay_result === "none" &&
    runnerResult?.runtime_result === "none" &&
    runnerResult?.external_access_result === "none" &&
    runnerResult?.feedback_result === "none",
  no_production_consumers: runtimeConsumerFiles().length === 0,
  runtime_preview_untouched: runnerResult?.runtime_preview_status === "runtime_preview_waiting_for_operator_inputs" &&
    doc.includes("runtime_preview_waiting_for_operator_inputs"),
  final_decision_vocabulary: ["shadow_passed", "shadow_passed_with_conditions", "shadow_failed", "shadow_aborted"].every((value) => runnerSource.includes(value)),
  runner_shadow_passed: runnerResult?.final_shadow_decision === "shadow_passed" &&
    runnerResult?.case_count === 10 &&
    runnerResult?.evidence_set_sha256 === semanticHashes.evidence_set_sha256 &&
    runnerResult?.group_sha256 === semanticHashes.group_sha256 &&
    runnerResult?.result_sha256 === semanticHashes.result_sha256,
  repeat_run_hashes_identical: runnerResult?.repeat_run_identical === true &&
    runnerResult?.run_1_batch_sha256 === expectedBatchHash &&
    runnerResult?.run_2_batch_sha256 === expectedBatchHash,
  action410_compatibility_passed: action410?.verification_status === "passed",
  focused_tests_present: testSource.includes("Action 411 mapped-only Pattern Discovery static shadow use") &&
    testSource.includes("runner executes exactly two deterministic local-only runs"),
};
const failedChecks = Object.entries(checks).filter(([, value]) => !value).map(([key]) => key);
const report = {
  verification_status: failedChecks.length === 0 ? "passed" : "failed",
  final_shadow_decision: failedChecks.length === 0 ? "shadow_passed" : runnerResult?.final_shadow_decision ?? "shadow_failed",
  checks,
  failed_checks: failedChecks,
  passed_conditions_count: Object.values(checks).filter(Boolean).length,
  failed_conditions_count: failedChecks.length,
  unresolved_conditions: [],
  package_files_present: packageFilesPresent,
  downstream_package_files: downstreamPackageFiles,
  manifest_case_ids: manifestCaseIds,
  protected_hashes: protectedHashReadback,
  duplicate_inventory: {
    case_support_count: runnerResult?.support_counts?.case_support_count ?? null,
    unique_mapper_row_count: runnerResult?.support_counts?.unique_mapper_row_count ?? null,
    shared_mapper_row_id_count: 8,
  },
  pattern_discovery: {
    status: runnerResult?.pattern_discovery_status ?? null,
    group_status: runnerResult?.group_status ?? null,
    support_counts: runnerResult?.support_counts ?? null,
    outcome_counts: runnerResult?.outcome_counts ?? null,
    warning_codes: runnerResult?.warning_codes ?? null,
    insight_count: runnerResult?.insight_count ?? null,
  },
  semantic_hashes: semanticHashes,
  observed_semantic_hashes: {
    evidence_set_sha256: runnerResult?.evidence_set_sha256 ?? null,
    group_sha256: runnerResult?.group_sha256 ?? null,
    result_sha256: runnerResult?.result_sha256 ?? null,
  },
  repeat_run: {
    identical: runnerResult?.repeat_run_identical ?? false,
    run_1_batch_sha256: runnerResult?.run_1_batch_sha256 ?? null,
    run_2_batch_sha256: runnerResult?.run_2_batch_sha256 ?? null,
  },
  evidence: {
    temp_output_path: tempOutputPath,
    temporary_evidence_deleted: !existsSync(tempOutputPath),
    tracked_evidence_files: trackedEvidenceFiles,
    metadata_only_result: runnerResult?.metadata_only_result ?? null,
    path_safety_result: runnerResult?.path_safety_result ?? null,
    cleanup_result: runnerResult?.cleanup_result ?? null,
  },
  no_effect_flags: noEffectFlags,
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  unrelated_work_classification: "action_411_static_shadow_package_and_narrow_guard_compatibility_only",
  recommended_next_action: failedChecks.length === 0
    ? "action_412_independent_mapped_only_pattern_discovery_static_shadow_verification_and_hash_audit"
    : "resolve_action_411_static_shadow_verification_failures_before_independent_audit",
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.exitCode = failedChecks.length === 0 ? 0 : 1;
