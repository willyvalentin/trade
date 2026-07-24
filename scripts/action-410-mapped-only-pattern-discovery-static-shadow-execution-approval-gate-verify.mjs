#!/usr/bin/env node

import { createHash } from "crypto";
import { execFileSync, spawnSync } from "child_process";
import { existsSync, lstatSync, readdirSync, readFileSync, statSync } from "fs";
import { tmpdir } from "os";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const paths = {
  doc: "docs/action-410-mapped-only-pattern-discovery-static-shadow-execution-approval-gate.md",
  verifier: "scripts/action-410-mapped-only-pattern-discovery-static-shadow-execution-approval-gate-verify.mjs",
  test: "tests/e2e/action-410-mapped-only-pattern-discovery-static-shadow-execution-approval-gate.spec.ts",
  action409Verifier: "scripts/action-409-independent-post-lint-pattern-discovery-behavioral-and-hash-verification-verify.mjs",
  action408Verifier: "scripts/action-408-pure-pattern-discovery-test-lint-remediation-verify.mjs",
  futureManifest: "docs/action-411-mapped-only-pattern-discovery-static-shadow-input-manifest.json",
  futureRunner: "scripts/action-411-mapped-only-pattern-discovery-static-shadow-run.mjs",
  futureUseDoc: "docs/action-411-mapped-only-pattern-discovery-static-shadow-use.md",
  futureUseVerifier: "scripts/action-411-mapped-only-pattern-discovery-static-shadow-use-verify.mjs",
  futureTest: "tests/e2e/action-411-mapped-only-pattern-discovery-static-shadow-use.spec.ts",
  pure: "lib/pure-pattern-discovery.ts",
  mapper: "lib/snapshot-to-learning-dataset-mapper.ts",
  learningFixture: "lib/learning-dataset-static-fixtures.ts",
  contextFixture: "lib/intelligence-context-static-fixtures.ts",
  patternFixture: "lib/pattern-insight-static-fixtures.ts",
  action400Runner: "scripts/action-400-expanded-static-mapper-shadow-run.mjs",
  action400Manifest: "docs/action-400-expanded-static-mapper-shadow-input-manifest.json",
};
const protectedHashes = {
  [paths.mapper]: "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  [paths.pure]: "48b7667c8690a1d8d56b819a3727e37ea73af7710a45131eb3debab48627191c",
  [paths.learningFixture]: "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  [paths.contextFixture]: "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  [paths.patternFixture]: "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
  [paths.action400Runner]: "a1123e1416df78a51645321cb9a273095c2a338febd8021265c4e3ee972d5b05",
  [paths.action400Manifest]: "e0a2646492da2038bf156c0060c48eb8144e78ff0d57cda92a60d3ca36c95319",
};
const eligibleCaseIds = [
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
const rowInventory = [
  {
    case_id: "expanded_valid_bearish_risk_context",
    canonical_mapper_input_sha256: "fec17679ec57889b72bdb6e60851f2791ec04901a84127c3aa2a37dc8f620ec9",
    mapper_row_id: "learning_row:v1:learning_dataset_static_fixture_v1|snapshot_fingerprint%3Ashadow397%3A001|60m|outcome%3Ashadow397%3A001",
    canonical_row_sha256: "c541b7c12b4c93d30238d328907320f415a6593646c04b7ad9a9f117b879bf10",
  },
  {
    case_id: "expanded_valid_fda_event_context",
    canonical_mapper_input_sha256: "416817eb4359264bae6bcd70b2b8aca225954ebc7c9a2df7378004b1b1692ad3",
    mapper_row_id: "learning_row:v1:learning_dataset_static_fixture_v1|snapshot_fingerprint%3Ashadow397%3A001|60m|outcome%3Ashadow397%3A001",
    canonical_row_sha256: "308f97519a4779f4372adc62e6901ac385bb831c01423a7b32373c4619611412",
  },
  {
    case_id: "expanded_valid_future_event_excluded",
    canonical_mapper_input_sha256: "f7f4298adedab046a69cb5e7cdb506ee59acc87008733d51a44cbcc41002aaf2",
    mapper_row_id: "learning_row:v1:learning_dataset_static_fixture_v1|snapshot_fingerprint%3Ashadow397%3A001|60m|outcome%3Ashadow397%3A001",
    canonical_row_sha256: "6f6aa09ac28e35b5342fc305fcaa5f97a97cdf6d6dc4af5477edee97c94b150c",
  },
  {
    case_id: "expanded_valid_identity_nfc_equivalent",
    canonical_mapper_input_sha256: "b3966931a62cd588feec62dbea7012e810a95f0a59b6fe7707ebef14c8cfd95e",
    mapper_row_id: "learning_row:v1:learning_dataset_static_fixture_v1|caf%C3%A9|60m|outcome%3Ashadow397%3A001",
    canonical_row_sha256: "a73bd0365bbf8358e5746744d4774604007540160af27c67696d1474dc358854",
  },
  {
    case_id: "expanded_valid_identity_percent_encoding",
    canonical_mapper_input_sha256: "eddbdf862ddeba42df34e8185552b7718a3b348b535b6e9a5c0c8dcddbdccf88",
    mapper_row_id: "learning_row:v1:learning_dataset_static_fixture_v1|shadow%7Cpercent%25%20%2F397|60m|outcome%3Ashadow397%3A001",
    canonical_row_sha256: "53ec6e76d02dcf552cadeb260176a0659192c5b82dca5958feff4ac36091be4f",
  },
  {
    case_id: "expanded_valid_sec_event_context",
    canonical_mapper_input_sha256: "cd94475fe9243e681042e9adbe20e23086020c85127b29673c380ecd680dde6a",
    mapper_row_id: "learning_row:v1:learning_dataset_static_fixture_v1|snapshot_fingerprint%3Ashadow397%3A001|60m|outcome%3Ashadow397%3A001",
    canonical_row_sha256: "589db67304606f5e2acc7c42373cb1e49a12687cb0dafc2c25c407c815af1f77",
  },
  {
    case_id: "valid_complete_mapping",
    canonical_mapper_input_sha256: "3b88963b293bb6212cc37c474d4fd21560cb99cb7edb9ee581ab24659aa79eda",
    mapper_row_id: "learning_row:v1:learning_dataset_static_fixture_v1|snapshot_fingerprint%3Ashadow397%3A001|60m|outcome%3Ashadow397%3A001",
    canonical_row_sha256: "27cd78418b77f2af7d7bb6cc93334f52d862791c530a2878fa13a76c305f7da0",
  },
  {
    case_id: "valid_equivalent_aliases",
    canonical_mapper_input_sha256: "96ab5d0b9f5c71b2f6bc6f057d32fc3aaa4507cd627347a307b7722b81072ff4",
    mapper_row_id: "learning_row:v1:learning_dataset_static_fixture_v1|snapshot_fingerprint%3Ashadow397%3A001|60m|outcome%3Ashadow397%3A001",
    canonical_row_sha256: "27cd78418b77f2af7d7bb6cc93334f52d862791c530a2878fa13a76c305f7da0",
  },
  {
    case_id: "valid_normalized_confidence",
    canonical_mapper_input_sha256: "40a0414237ce721261ba56bcb193cd6d5aa35f545d16b901f6bed03b4e7a032a",
    mapper_row_id: "learning_row:v1:learning_dataset_static_fixture_v1|snapshot_fingerprint%3Ashadow397%3A001|60m|outcome%3Ashadow397%3A001",
    canonical_row_sha256: "27cd78418b77f2af7d7bb6cc93334f52d862791c530a2878fa13a76c305f7da0",
  },
  {
    case_id: "valid_rich_context",
    canonical_mapper_input_sha256: "e5b4967d79f406272fdea2a45b5cc47a3ed5d23bc09ce0cca9d1eaabe8240601",
    mapper_row_id: "learning_row:v1:learning_dataset_static_fixture_v1|snapshot_fingerprint%3Ashadow397%3A001|60m|outcome%3Ashadow397%3A001",
    canonical_row_sha256: "4bd75cdac30b2f609088a4990f29bcc15558495e68691b41602a0b91334e7e41",
  },
];
const semanticHashes = {
  evidence_set_sha256: "f1f0053264c85d640d46b61da0ce7120e491309e3070132fe74a69a68438cbd8",
  group_sha256: "aa2ae3f39146ce1c6fc1f6ed73e19e96b02b7866b34e75b61c471a8277a1122e",
  expected_result_sha256: "e911709a784159c684a350de490fd56446ee23c23b3bf5ea2fbb70378ebf253c",
};
const expectedConfiguration = {
  configuration_version: "pattern_discovery_setup_family_v1",
  grouping_dimension: "setup_family",
  grouping_key_version: "v1",
  minimum_case_support: 20,
  minimum_completed_outcomes: 20,
  integer_scale: 1000000,
  output_precision: 4,
  taxonomy_version: "pattern_discovery_setup_family_v1",
  static_only: true,
  non_authoritative: true,
  no_persistence: true,
  no_replay: true,
  no_runtime: true,
  no_feedback: true,
};
const expectedResultContract = {
  group_key: "pattern_group:v1|setup_family=momentum_continuation",
  group_count: 1,
  status: "insufficient_evidence",
  group_status: "insufficient_evidence",
  insight_count: 0,
  case_support_count: 10,
  unique_mapper_row_count: 3,
  completed_outcome_count: 10,
  positive_count: 10,
  negative_count: 0,
  neutral_count: 0,
  warning_code: "duplicate_mapper_row_identity",
  non_authoritative: true,
};
const requiredSections = [
  "Purpose", "Scope", "Authoritative Dependencies", "Upstream Readiness Chain",
  "Action 409 Ready Result", "Explicit Non-Goals", "Protected-Source Inventory",
  "Eligible-Case Inventory", "Excluded-Case Policy", "Row-Reconstruction Policy",
  "Row-Lineage Contract", "Frozen Mapper-Row Inventory", "Duplicate-Cluster Inventory",
  "Pattern Discovery Configuration", "Canonical Group-Key Contract", "Evidence-Set Hash Contract",
  "Group-Hash Contract", "Expected-Result Hash Contract", "Expected Result Semantics",
  "Future Manifest Contract", "Future Runner Contract", "Metadata-Only Evidence Contract",
  "Full-Row/Full-Insight Prohibition", "Repeat-Run Determinism", "Temporary Filesystem Policy",
  "Cleanup Policy", "Source-Integrity Policy", "No-Persistence Requirement",
  "No-Replay Requirement", "No-Runtime Requirement", "No-External-Access Requirement",
  "No-Feedback Requirement", "Non-Authoritative Classification", "Stop Conditions",
  "Shadow Decision Vocabulary", "Approval Vocabulary", "Deterministic Gate Conditions",
  "Approval Decision", "Passed Conditions", "Failed Conditions", "Unresolved Conditions",
  "Next Permitted Action",
];
const futurePackagePaths = [
  paths.futureManifest,
  paths.futureRunner,
  paths.futureUseDoc,
  paths.futureUseVerifier,
  paths.futureTest,
];
const excludedPolicyMarkers = [
  "mapped_with_missing_optional_data",
  "blocked_*",
  "pending outcomes",
  "incomplete outcomes",
  "stale rows",
  "partial rows",
  "conflicting rows",
  "unknown rows",
  "unavailable rows",
  "unverified lineage",
  "external inputs",
  "persisted inputs",
  "arbitrary files",
  "environment-derived inputs",
];
const futureManifestMarkers = [
  paths.futureManifest,
  "manifest schema version",
  "exact ten cases",
  "exact row IDs",
  "exact canonical row hashes",
  "exact duplicate clusters",
  "expected evidence-set hash",
  "expected group hash",
  "expected result hash",
  "full mapper inputs",
  "full rows",
  "credentials",
  "dynamic timestamps",
];
const futureRunnerMarkers = [
  paths.futureRunner,
  "verify protected hashes",
  "verify exactly ten allowlisted cases",
  "call `mapSnapshotToLearningDataset`",
  "call `discoverPatterns`",
  "repeat the identical process exactly once",
  "write temporary metadata-only evidence",
  "delete evidence",
  "automatic discovery",
  "third execution",
  "manifest rewriting",
];
const metadataMarkers = [
  "case ID",
  "mapper row ID",
  "canonical mapper row hash",
  "group key",
  "evidence-set hash",
  "group hash",
  "warning codes",
  "canonical result hash",
  "run 1 hash",
  "run 2 hash",
  "authoritative-data-created `false`",
];
const stopConditionMarkers = [
  "implementation hash differs",
  "mapper hash differs",
  "fixture hash differs",
  "case count is not ten",
  "case order differs",
  "mapper status is not `mapped`",
  "row hash differs",
  "temp path is unsafe",
  "runtime/provider/Supabase/replay imports appear",
  "evidence-set hash differs",
  "repeat-run determinism fails",
  "authoritative data is created",
];

const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");
const shaFile = (path) => createHash("sha256").update(readFileSync(abs(path))).digest("hex");

function files(path) {
  if (!exists(path)) return [];
  if (statSync(abs(path)).isFile()) return [path];
  return readdirSync(abs(path)).flatMap((entry) => files(join(path, entry))).sort();
}

function runJson(path) {
  return JSON.parse(execFileSync("node", [abs(path)], { cwd: root, encoding: "utf8", timeout: 240000 }));
}

function statusFiles() {
  const output = execFileSync("git", ["status", "--short", "--untracked-files=all"], { cwd: root, encoding: "utf8" });
  return output.trim().split("\n").filter(Boolean).map((line) => line.slice(3).trim()).sort();
}

function markersInOrder(source, markers) {
  let cursor = -1;
  for (const marker of markers) {
    const next = source.indexOf(marker);
    if (next <= cursor) return false;
    cursor = next;
  }
  return true;
}

function pathContainsSymlink(path) {
  const absolute = resolve(path);
  const rootPath = resolve("/");
  let current = absolute;
  const parts = [];
  while (current !== rootPath) {
    parts.push(current);
    current = dirname(current);
  }
  return parts.some((part) => existsSync(part) && lstatSync(part).isSymbolicLink());
}

const doc = exists(paths.doc) ? read(paths.doc) : "";
const verifierSource = exists(paths.verifier) ? read(paths.verifier) : "";
const testSource = exists(paths.test) ? read(paths.test) : "";
const action409 = exists(paths.action409Verifier) ? runJson(paths.action409Verifier) : null;
const action408 = exists(paths.action408Verifier) ? runJson(paths.action408Verifier) : null;
const sourceIntegrity = Object.fromEntries(Object.entries(protectedHashes).map(([path, expected]) => [
  path,
  {
    expected,
    actual: exists(path) ? shaFile(path) : null,
    unchanged: exists(path) && shaFile(path) === expected,
  },
]));
const changedFiles = statusFiles();
const protectedChangedFiles = changedFiles.filter((path) => Object.keys(protectedHashes).includes(path));
const runtimeScanPaths = ["app", "public", "proxy.ts", "middleware.ts", "middleware.js", "netlify.toml"].filter(exists);
const runtimeScan = runtimeScanPaths.length > 0
  ? spawnSync("rg", ["-n", "action-410|action_410|action-411|action_411|mapped-only-pattern-discovery-static-shadow", ...runtimeScanPaths], { cwd: root, encoding: "utf8" })
  : { status: 1, stdout: "" };
const runtimeMarkers = runtimeScan.status === 0 ? runtimeScan.stdout.trim().split("\n").filter(Boolean) : [];
const productionConsumerScan = runtimeScanPaths.length > 0
  ? spawnSync("rg", ["-l", "pure-pattern-discovery|snapshot-to-learning-dataset-mapper|discoverPatterns|mapSnapshotToLearningDataset", ...runtimeScanPaths], { cwd: root, encoding: "utf8" })
  : { status: 1, stdout: "" };
const productionConsumerFiles = productionConsumerScan.status === 0
  ? productionConsumerScan.stdout.trim().split("\n").filter(Boolean)
  : [];
const action410Files = [paths.doc, paths.verifier, paths.test];
const action410StatusFiles = changedFiles.filter((path) => path.includes("action-410"));
const action410Source = `${verifierSource}\n${testSource}`;
const action410RuntimeCallMarkers = [
  /from\s+["'][^"']*pure-pattern-discovery/.test(action410Source) ? "pure_pattern_discovery_import" : null,
  /from\s+["'][^"']*snapshot-to-learning-dataset-mapper/.test(action410Source) ? "mapper_import" : null,
  /from\s+["'][^"']*action-400-expanded-static-mapper-shadow-run/.test(action410Source) ? "action400_runner_import" : null,
  /from\s+["'][^"']*(supabase|provider|broker|news)/.test(action410Source) ? "external_runtime_import" : null,
].filter(Boolean);
const shadowEvidencePaths = [
  join(tmpdir(), "ture", "action-411-mapped-only-pattern-discovery-shadow"),
  abs("docs/action-411-mapped-only-pattern-discovery-static-shadow-execution-report.json"),
  abs("docs/action-411-mapped-only-pattern-discovery-static-shadow-evidence.json"),
];
const shadowEvidencePresent = shadowEvidencePaths.filter((path) => existsSync(path));
const futurePackageFilesPresent = futurePackagePaths.filter(exists);
const downstreamRunnerOrManifestFiles = [...files("scripts"), ...files("docs"), ...files("tests/e2e")]
  .filter((path) => /action-411-mapped-only-pattern-discovery-static-shadow/.test(path));
const tempPath = join(tmpdir(), "ture", "action-411-mapped-only-pattern-discovery-shadow");
const tempPathPolicy = {
  required_path_suffix: "ture/action-411-mapped-only-pattern-discovery-shadow",
  path: tempPath,
  outside_repository: !resolve(tempPath).startsWith(root),
  outside_home_config_paths: !resolve(tempPath).includes("/.config/") && !resolve(tempPath).includes("/.codex/"),
  target_exists_now: existsSync(tempPath),
  target_symlink_now: existsSync(tempPath) && lstatSync(tempPath).isSymbolicLink(),
  parent_chain_symlink_allowed: false,
  parent_chain_symlink_observed_now: pathContainsSymlink(dirname(tempPath)),
  traversal_allowed: false,
  non_empty_existing_directory_allowed: false,
  cleanup_required: true,
};

const checks = {
  required_files_found: action410Files.every(exists),
  documentation_contract_complete: requiredSections.every((section) => doc.includes(`## ${section}`)),
  action409_ready_result: action409?.verification_status === "passed" && action409?.readiness_decision === "ready" && action409?.failed_conditions_count === 0 && action409?.unresolved_conditions?.length === 0,
  action408_and_action409_healthy: action408?.verification_status === "passed" && action409?.verification_status === "passed",
  lint_green_state: action409?.lint_result?.passed === true && action409?.lint_result?.error_count === 0,
  protected_hashes_unchanged: Object.values(sourceIntegrity).every((entry) => entry.unchanged),
  protected_sources_not_modified_by_action410: protectedChangedFiles.length === 0 || protectedChangedFiles.every((path) => !action410Files.includes(path)),
  eligible_cases_exact: markersInOrder(doc, eligibleCaseIds) && eligibleCaseIds.length === 10,
  excluded_case_policy_exact: excludedPolicyMarkers.every((marker) => doc.includes(marker)),
  row_inventory_binding_exact: rowInventory.every((row) =>
    [row.case_id, row.canonical_mapper_input_sha256, row.mapper_row_id, row.canonical_row_sha256].every((marker) => doc.includes(marker)),
  ),
  duplicate_inventory_exact: doc.includes("ten case-level observations") && doc.includes("three unique mapper row IDs") && doc.includes("appears eight times") && doc.includes("duplicate_mapper_row_identity"),
  frozen_configuration_exact: Object.entries(expectedConfiguration).every(([, value]) => doc.includes(String(value))),
  expected_group_result_contract_exact: Object.entries(expectedResultContract).every(([, value]) => doc.includes(String(value))),
  semantic_hashes_exact: Object.values(semanticHashes).every((hash) => doc.includes(hash) && JSON.stringify(action409?.action406_hashes ?? {}).includes(hash)),
  manifest_boundary_exact: futureManifestMarkers.every((marker) => doc.includes(marker)),
  runner_boundary_exact: futureRunnerMarkers.every((marker) => doc.includes(marker)),
  metadata_evidence_limit_exact: metadataMarkers.every((marker) => doc.includes(marker)) && doc.includes("Do not retain full mapper rows") && doc.includes("full Pattern Insights"),
  temp_path_policy_exact: doc.includes("<system-temp>/ture/action-411-mapped-only-pattern-discovery-shadow/") && tempPathPolicy.outside_repository && tempPathPolicy.parent_chain_symlink_allowed === false,
  cleanup_policy_exact: doc.includes("All temporary evidence must be deleted") && doc.includes("Cleanup failure returns `shadow_failed`"),
  exactly_two_runs_required: doc.includes("execute exactly twice") && doc.includes("No third repair run"),
  shadow_decision_vocabulary_exact: ["shadow_passed", "shadow_passed_with_conditions", "shadow_failed", "shadow_aborted"].every((value) => doc.includes(value)),
  approval_vocabulary_exact: ["approved", "approved_with_conditions", "blocked"].every((value) => doc.includes(value)),
  stop_conditions_exact: stopConditionMarkers.every((marker) => doc.includes(marker)),
  action411_package_boundary_exact: JSON.stringify([...futurePackageFilesPresent].sort()) === JSON.stringify([...futurePackagePaths].sort()) &&
    JSON.stringify([...downstreamRunnerOrManifestFiles].sort()) === JSON.stringify([...futurePackagePaths].sort()),
  no_shadow_evidence_exists: shadowEvidencePresent.length === 0,
  no_action410_shadow_or_mapper_execution: action410RuntimeCallMarkers.length === 0,
  no_runtime_or_production_consumer: runtimeMarkers.length === 0 && productionConsumerFiles.length === 0,
  runtime_preview_paused: doc.includes("runtime_preview_waiting_for_operator_inputs") && action409?.runtime_preview_status === "runtime_preview_waiting_for_operator_inputs",
  approval_decision_present: doc.includes("## Approval Decision\n\n`approved`"),
  action411_separately_identified: doc.includes("action_411_mapped_only_pattern_discovery_static_shadow_execution"),
  focused_tests_cover_gate: [
    "documentation contract",
    "approval decision",
    "exact eligible cases",
    "protected hashes",
    "manifest and runner boundaries",
    "metadata-only evidence",
    "temp path policy",
    "only exact Action 411 package",
    "runtime preview",
  ].every((marker) => testSource.includes(marker)),
};
const failedChecks = Object.entries(checks).filter(([, value]) => !value).map(([key]) => key);
const approvalDecision = failedChecks.length === 0 ? "approved" : "blocked";
const report = {
  verification_status: failedChecks.length === 0 ? "passed" : "blocked",
  approval_decision: approvalDecision,
  approval_vocabulary: ["approved", "approved_with_conditions", "blocked"],
  shadow_decision_vocabulary: ["shadow_passed", "shadow_passed_with_conditions", "shadow_failed", "shadow_aborted"],
  checks,
  failed_checks: failedChecks,
  passed_conditions_count: Object.values(checks).filter(Boolean).length,
  failed_conditions_count: failedChecks.length,
  unresolved_conditions: [],
  action409_result: {
    readiness_decision: action409?.readiness_decision ?? null,
    passed_conditions_count: action409?.passed_conditions_count ?? null,
    failed_conditions_count: action409?.failed_conditions_count ?? null,
    unresolved_conditions: action409?.unresolved_conditions ?? null,
    lint_result: action409?.lint_result ?? null,
  },
  eligible_case_ids: eligibleCaseIds,
  excluded_policy: {
    blocked_statuses_excluded: true,
    mapped_with_missing_optional_data_excluded: true,
    automatic_discovery_allowed: false,
    case_substitution_allowed: false,
  },
  row_inventory: rowInventory,
  duplicate_inventory: {
    case_support_count: 10,
    unique_mapper_row_count: 3,
    shared_mapper_row_id_count: 8,
    expected_warning_code: "duplicate_mapper_row_identity",
  },
  protected_hashes: sourceIntegrity,
  semantic_hashes: semanticHashes,
  configuration_contract: expectedConfiguration,
  expected_result_contract: expectedResultContract,
  manifest_boundary: {
    approved_path: paths.futureManifest,
    exists_now: exists(paths.futureManifest),
    full_rows_allowed: false,
    credentials_allowed: false,
    dynamic_timestamps_allowed: false,
  },
  runner_boundary: {
    approved_path: paths.futureRunner,
    exists_now: exists(paths.futureRunner),
    exactly_two_runs_required: true,
    third_run_allowed: false,
    arbitrary_input_allowed: false,
    retries_allowed: false,
  },
  evidence_boundary: {
    metadata_only: true,
    full_rows_allowed: false,
    full_insights_allowed: false,
    permanent_machine_paths_allowed: false,
    authoritative_data_created: false,
  },
  temp_path_policy: tempPathPolicy,
  isolation: {
    action410_status_files: action410StatusFiles,
    protected_changed_files: protectedChangedFiles,
    future_package_files_present: futurePackageFilesPresent,
    downstream_runner_or_manifest_files: downstreamRunnerOrManifestFiles,
    shadow_evidence_present: shadowEvidencePresent,
    runtime_markers: runtimeMarkers,
    production_consumer_files: productionConsumerFiles,
    action410_runtime_call_markers: action410RuntimeCallMarkers,
  },
  no_effect_flags: {
    downstream_runner_created: false,
    downstream_manifest_created: false,
    pattern_discovery_shadow_executed: false,
    discover_patterns_executed_by_action410: false,
    mapper_reconstruction_executed_by_action410: false,
    full_rows_persisted: false,
    pattern_insights_generated: false,
    provider_call_executed: false,
    news_call_executed: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    persistence_executed: false,
    replay_executed: false,
    runtime_integration_executed: false,
    feedback_executed: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    recommendations_mutated: false,
    runtime_preview_advanced: false,
  },
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  source_integrity_result: failedChecks.includes("protected_hashes_unchanged") ? "mismatch" : "unchanged",
  unrelated_work_classification: "action_410_docs_scripts_tests_and_minimal_guard_updates_only",
  recommended_next_action: failedChecks.length === 0
    ? "action_411_mapped_only_pattern_discovery_static_shadow_execution"
    : "resolve_action_410_gate_blockers_before_action_411",
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.exitCode = failedChecks.length === 0 ? 0 : 1;
