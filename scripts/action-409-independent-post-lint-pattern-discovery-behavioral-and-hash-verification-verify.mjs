#!/usr/bin/env node

import { createHash } from "crypto";
import { execFileSync, spawnSync } from "child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const paths = {
  doc: "docs/action-409-independent-post-lint-pattern-discovery-behavioral-and-hash-verification.md",
  verifier: "scripts/action-409-independent-post-lint-pattern-discovery-behavioral-and-hash-verification-verify.mjs",
  test: "tests/e2e/action-409-independent-post-lint-pattern-discovery-behavioral-and-hash-verification.spec.ts",
  pure: "lib/pure-pattern-discovery.ts",
  action404Test: "tests/e2e/action-404-pure-pattern-discovery-implementation.spec.ts",
  mapper: "lib/snapshot-to-learning-dataset-mapper.ts",
  learningFixture: "lib/learning-dataset-static-fixtures.ts",
  contextFixture: "lib/intelligence-context-static-fixtures.ts",
  patternFixture: "lib/pattern-insight-static-fixtures.ts",
  action400Runner: "scripts/action-400-expanded-static-mapper-shadow-run.mjs",
  action400Manifest: "docs/action-400-expanded-static-mapper-shadow-input-manifest.json",
  action405Verifier: "scripts/action-405-independent-pure-pattern-discovery-verification-and-hash-audit-verify.mjs",
  action406Verifier: "scripts/action-406-mapped-only-pattern-discovery-hash-freeze-and-static-shadow-approval-gate-verify.mjs",
  action407Verifier: "scripts/action-407-pure-pattern-discovery-lint-remediation-approval-gate-verify.mjs",
  action408Verifier: "scripts/action-408-pure-pattern-discovery-test-lint-remediation-verify.mjs",
};
const protectedHashes = {
  [paths.pure]: "48b7667c8690a1d8d56b819a3727e37ea73af7710a45131eb3debab48627191c",
  [paths.action404Test]: "b6f5ff174edcb691f78c112b50670d3f4719251ff31aad1aadc463cd04f45eda",
  [paths.mapper]: "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  [paths.learningFixture]: "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  [paths.contextFixture]: "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  [paths.patternFixture]: "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
  [paths.action400Runner]: "a1123e1416df78a51645321cb9a273095c2a338febd8021265c4e3ee972d5b05",
  [paths.action400Manifest]: "e0a2646492da2038bf156c0060c48eb8144e78ff0d57cda92a60d3ca36c95319",
};
const action406Hashes = {
  evidence_set_sha256: "f1f0053264c85d640d46b61da0ce7120e491309e3070132fe74a69a68438cbd8",
  group_sha256: "aa2ae3f39146ce1c6fc1f6ed73e19e96b02b7866b34e75b61c471a8277a1122e",
  expected_result_sha256: "e911709a784159c684a350de490fd56446ee23c23b3bf5ea2fbb70378ebf253c",
};
const expectedTestNames = [
  "exports exactly seven types and one synchronous runtime function",
  "valid minimal input is grouped exactly and stays insufficient",
  "invalid input configuration grouping dimension and hidden defaults fail closed",
  "mapper status missing row and non-consumable rows block in phase five",
  "lineage validation rejects malformed hashes changed rows and duplicate sources",
  "failed or unknown leakage and invalid setup or outcome are blocked",
  "non-finite unscalable and out-of-range numeric values block at numeric validation",
  "duplicates preserve case support while unique mapper row count stays distinct",
  "positive negative neutral mixed and support status are exact",
  "sufficient evidence with a duplicate warning is discovered_with_warnings",
  "scaled integer averages medians rounding signed zero and null metrics are deterministic",
  "deterministic evidence group insight result hashes and reordered input match",
  "input and nested values remain immutable across repeated and interleaved calls",
  "no runner manifest runtime consumer or forbidden source access exists",
  "verifier and Action 402/403 historical gates pass with runtime preview paused",
];
const expectedResultStatuses = [
  "discovered",
  "discovered_with_warnings",
  "insufficient_evidence",
  "blocked_invalid_input",
  "blocked_invalid_configuration",
  "blocked_invalid_lineage",
  "blocked_future_leakage",
  "blocked_non_consumable_row",
  "blocked_nondeterministic_grouping",
];
const expectedIssueCodes = [
  "invalid_input_shape",
  "invalid_configuration_shape",
  "invalid_batch_declaration",
  "invalid_row_envelope",
  "ineligible_mapper_status",
  "missing_row",
  "non_consumable_row",
  "invalid_lineage",
  "future_leakage",
  "missing_grouping_field",
  "invalid_grouping_literal",
  "invalid_outcome",
  "non_finite_numeric",
  "nondeterministic_grouping",
  "duplicate_source_case_id",
];
const expectedWarningCodes = [
  "minimum_total_support_not_met",
  "minimum_completed_outcomes_not_met",
  "duplicate_mapper_row_identity",
  "metric_value_unavailable",
];
const expectedValidationPhases = [
  "Phase 1: input shape.",
  "Phase 2: configuration shape and literals.",
  "Phase 3: batch declarations, count, and order contract.",
  "Phase 4: row-envelope shape.",
  "Phase 5: mapper status and consumability.",
  "Phase 6: lineage integrity.",
  "Phase 7: anti-leakage.",
  "Phase 8: required grouping fields and literals.",
  "Phase 9: completed outcome validity.",
  "Phase 10: finite and exactly scalable numeric values.",
  "Phase 11: deterministic grouping and canonical key construction.",
];
const requiredDocSections = [
  "Purpose",
  "Scope",
  "Authoritative Dependencies",
  "Action 407 Approval Summary",
  "Action 408 Remediation Summary",
  "Explicit Non-Goals",
  "Source-Integrity Audit",
  "Implementation-Hash Audit",
  "Test-File Integrity Audit",
  "Six-Remediation Audit",
  "Test-Name Audit",
  "Test-Count Audit",
  "Test-Order Audit",
  "Assertion-Strength Audit",
  "Malformed-Input Audit",
  "Invalid-Array Audit",
  "Invalid-Object Audit",
  "Null/Primitive Audit",
  "Validation-Precedence Audit",
  "Duplicate/Support Audit",
  "Aggregation/Hash Audit",
  "Immutability Audit",
  "Repeated/Interleaved Determinism Audit",
  "Lint Audit",
  "Suppression Audit",
  "Config-Integrity Audit",
  "Unsafe-Cast Audit",
  "Semantic-Hash Audit",
  "Runtime/Isolation Audit",
  "Readiness Vocabulary",
  "Readiness Decision",
  "Passed Conditions",
  "Failed Conditions",
  "Unresolved Conditions",
  "Next Permitted Action",
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
  return JSON.parse(execFileSync("node", [abs(path)], { cwd: root, encoding: "utf8" }));
}

function statusFiles() {
  const output = execFileSync("git", ["status", "--short", "--untracked-files=all"], { cwd: root, encoding: "utf8" });
  return output.trim().split("\n").filter(Boolean).map((line) => line.slice(3).trim()).sort();
}

function testNames(source) {
  return [...source.matchAll(/test\("([^"]+)"/g)].map((match) => match[1]);
}

function explicitAnyLocations(source) {
  const locations = [];
  source.split("\n").forEach((line, index) => {
    const matcher = /(?:\bas\s+any\b|:\s*any\b|<any>)/g;
    let match = matcher.exec(line);
    while (match) {
      locations.push({ line: index + 1, column: match.index + 1, text: line.trim() });
      match = matcher.exec(line);
    }
  });
  return locations;
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

function runLint() {
  const result = spawnSync("npm", ["run", "lint"], { cwd: root, encoding: "utf8", timeout: 120000 });
  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  const summary = output.match(/(\d+) problems? \((\d+) errors?, (\d+) warnings?\)/);
  return {
    exit_code: result.status,
    passed: result.status === 0,
    error_count: summary ? Number(summary[2]) : result.status === 0 ? 0 : null,
    warning_count: summary ? Number(summary[3]) : null,
    output_summary: summary ? summary[0] : output.trim().split("\n").slice(-5).join("\n"),
  };
}

const doc = exists(paths.doc) ? read(paths.doc) : "";
const pureSource = exists(paths.pure) ? read(paths.pure) : "";
const action404Source = exists(paths.action404Test) ? read(paths.action404Test) : "";
const action409TestSource = exists(paths.test) ? read(paths.test) : "";
const action405 = exists(paths.action405Verifier) ? runJson(paths.action405Verifier) : null;
const action406 = exists(paths.action406Verifier) ? runJson(paths.action406Verifier) : null;
const action407 = exists(paths.action407Verifier) ? runJson(paths.action407Verifier) : null;
const action408 = exists(paths.action408Verifier) ? runJson(paths.action408Verifier) : null;
const lint = runLint();
const status = statusFiles();
const action409StatusFiles = status.filter((path) => path.includes("action-409"));
const allowedAction409Files = [paths.doc, paths.verifier, paths.test];
const configChanges = status.filter((path) =>
  ["eslint.config.mjs", "tsconfig.json", "package.json"].includes(path) ||
  path.startsWith(".eslint") ||
  path.startsWith("tsconfig."),
);
const runtimeScanPaths = ["app", "public", "proxy.ts", "middleware.ts", "middleware.js", "netlify.toml", "next.config.ts"].filter(exists);
const runtimeScan = runtimeScanPaths.length > 0
  ? spawnSync("rg", ["-n", "action-409|action_409|independent-post-lint-pattern-discovery", ...runtimeScanPaths], { cwd: root, encoding: "utf8" })
  : { status: 1, stdout: "" };
const runtimeMarkers = runtimeScan.status === 0 ? runtimeScan.stdout.trim().split("\n").filter(Boolean) : [];
const runnerManifestFiles = [...files("scripts"), ...files("docs")]
  .filter((path) => !allowedAction409Files.includes(path))
  .filter((path) => /action-409.*(?:runner|run|manifest|shadow)/i.test(path));
const productionConsumerScan = spawnSync("rg", ["-l", "pure-pattern-discovery|action-409|action_409", "app", "public"], { cwd: root, encoding: "utf8" });
const productionConsumerFiles = productionConsumerScan.status === 0
  ? productionConsumerScan.stdout.trim().split("\n").filter(Boolean)
  : [];
const sourceIntegrity = Object.fromEntries(Object.entries(protectedHashes).map(([path, expected]) => [
  path,
  {
    expected,
    actual: exists(path) ? shaFile(path) : null,
    unchanged: exists(path) && shaFile(path) === expected,
  },
]));
const exportTypes = [...pureSource.matchAll(/^export type (\w+)/gm)].map((match) => match[1]);
const exportFunctions = [...pureSource.matchAll(/^export function (\w+)/gm)].map((match) => match[1]);
const resultStatuses = expectedResultStatuses.filter((statusName) => pureSource.includes(`"${statusName}"`));
const issueCodes = expectedIssueCodes.filter((code) => pureSource.includes(`"${code}"`));
const warningCodes = expectedWarningCodes.filter((code) => pureSource.includes(`"${code}"`));
const currentTestNames = testNames(action404Source);
const assertionMarkers = [
  "blocked_invalid_input",
  "blocked_invalid_configuration",
  "ineligible_mapper_status",
  "missing_row",
  "non_consumable_row",
  "blocked_invalid_lineage",
  "duplicate_source_case_id",
  "blocked_future_leakage",
  "invalid_grouping_literal",
  "invalid_outcome",
  "non_finite_numeric",
  "duplicate_mapper_row_identity",
  "case_support_count",
  "unique_mapper_row_count",
  "completed_outcome_count",
  "positive_count",
  "negative_count",
  "neutral_count",
  "average_gross_r_multiple",
  "median_gross_r_multiple",
  "evidence_set_sha256",
  "group_sha256",
  "insight_id",
  "deepFreeze",
  "interleaved",
  "reverse()",
];
const malformedMarkers = [
  "discoverPatterns(null as never)",
  "minimum_total_support: 19",
  "grouping_dimension: \"ticker\"",
  "delete missing.numeric_scale",
  "mapper_status: \"mapped_with_missing_optional_data\"",
  "row: null",
  "consumable: false",
  "mapper_sha256: \"bad\"",
  "anti_leakage_status: value",
  "setup_family: \"Momentum_Continuation\"",
  "availability: \"incomplete\"",
  "Number.NaN",
  "Number.POSITIVE_INFINITY",
  "0.0000001",
  "1000001",
];
const checks = {
  required_files_found: [paths.doc, paths.verifier, paths.test, paths.pure, paths.action404Test].every(exists),
  documentation_contract_complete: requiredDocSections.every((section) => doc.includes(`## ${section}`)),
  source_hashes_unchanged: Object.values(sourceIntegrity).every((entry) => entry.unchanged),
  implementation_hash_unchanged: sourceIntegrity[paths.pure]?.unchanged === true,
  action404_test_hash_unchanged: sourceIntegrity[paths.action404Test]?.unchanged === true,
  six_remediation_inventory_exact: ["37:33", "57:66", "57:140", "81:38", "96:51", "109:147"].every((marker) => doc.includes(marker)) && action408?.remediated_locations?.length === 6,
  zero_explicit_any_after_remediation: explicitAnyLocations(action404Source).length === 0 && action408?.explicit_any_counts?.target === 0,
  narrow_replacement_strategy_present: [
    "Mutable<Action335LearningDatasetRow>",
    "MutablePatternDiscoveryRowEnvelope",
    "Record<string, unknown>",
    "Object.assign",
  ].every((marker) => action404Source.includes(marker) || doc.includes(marker)),
  test_count_names_order_exact: currentTestNames.length === 15 && JSON.stringify(currentTestNames) === JSON.stringify(expectedTestNames),
  assertion_strength_preserved: assertionMarkers.every((marker) => action404Source.includes(marker)),
  malformed_input_preserved: malformedMarkers.every((marker) => action404Source.includes(marker)),
  validation_precedence_preserved: markersInOrder(pureSource, expectedValidationPhases),
  duplicate_support_preserved: ["duplicate_mapper_row_identity", "case_support_count", "unique_mapper_row_count"].every((marker) => action404Source.includes(marker)),
  aggregation_hash_preserved: ["average_gross_r_multiple", "median_gross_r_multiple", "evidence_set_sha256", "group_sha256", "canonical_result_sha256"].every((marker) => pureSource.includes(marker) || action404Source.includes(marker)),
  immutability_and_determinism_preserved: ["deepFreeze", "interleaved", "reverse()", "toEqual(first)"].every((marker) => action404Source.includes(marker)),
  lint_passes_zero_errors: lint.passed && lint.error_count === 0,
  suppression_absent: !/eslint-disable|ts-ignore|ts-expect-error/.test(action404Source),
  config_integrity: configChanges.length === 0,
  unsafe_cast_absent: !/as\s+unknown\s+as|as\s+any|:\s*any|Object\.setPrototypeOf|__proto__|export\s+type\s+Mutable/.test(action404Source),
  public_api_integrity: JSON.stringify(exportFunctions) === JSON.stringify(["discoverPatterns"]) && JSON.stringify(exportTypes) === JSON.stringify([
    "PatternDiscoveryRowEnvelope",
    "FrozenPatternDiscoveryConfiguration",
    "PatternDiscoveryIssue",
    "PatternDiscoveryWarning",
    "PatternDiscoveryEvidenceSummary",
    "PatternDiscoveryGroupResult",
    "PatternDiscoveryResult",
  ]) && pureSource.includes("export function discoverPatterns(input: Readonly<{"),
  result_issue_warning_contracts_exact:
    JSON.stringify(resultStatuses) === JSON.stringify(expectedResultStatuses) &&
    JSON.stringify(issueCodes) === JSON.stringify(expectedIssueCodes) &&
    JSON.stringify(warningCodes) === JSON.stringify(expectedWarningCodes),
  semantic_hashes_unchanged: Object.values(action406Hashes).every((hash) => doc.includes(hash) && JSON.stringify(action406).includes(hash)),
  action405_to_408_verifiers_healthy:
    action405?.verification_status === "passed" &&
    action406?.verification_status === "passed" &&
    action407?.verification_status === "passed" &&
    action408?.verification_status === "passed",
  no_runner_manifest_shadow: runnerManifestFiles.length === 0,
  no_runtime_or_deployment_artifacts: runtimeMarkers.length === 0 && productionConsumerFiles.length === 0,
  action409_boundary_exact: action409StatusFiles.every((path) => allowedAction409Files.includes(path)),
  runtime_preview_paused: doc.includes("runtime_preview_waiting_for_operator_inputs"),
  focused_tests_cover_gate: [
    "documentation contract",
    "source hash integrity",
    "exact six-remediation inventory",
    "zero explicit any",
    "malformed input preservation",
    "assertion-strength inventory",
    "all regression suites",
    "verifier succeeds",
  ].every((marker) => action409TestSource.includes(marker)),
};
const failedChecks = Object.entries(checks).filter(([, value]) => !value).map(([key]) => key);
const readinessDecision = failedChecks.length === 0 ? "ready" : "blocked";
const report = {
  verification_status: failedChecks.length === 0 ? "passed" : "blocked",
  readiness_decision: readinessDecision,
  readiness_vocabulary: ["ready", "ready_with_conditions", "blocked"],
  checks,
  failed_checks: failedChecks,
  passed_conditions_count: Object.values(checks).filter(Boolean).length,
  failed_conditions_count: failedChecks.length,
  unresolved_conditions: [],
  source_integrity: sourceIntegrity,
  remediated_locations: ["37:33", "57:66", "57:140", "81:38", "96:51", "109:147"],
  explicit_any_locations_after_remediation: explicitAnyLocations(action404Source),
  test_inventory: {
    count: currentTestNames.length,
    names: currentTestNames,
    expected_names: expectedTestNames,
  },
  lint_result: lint,
  public_api: {
    runtime_exports: exportFunctions,
    type_exports: exportTypes,
    result_status_count: resultStatuses.length,
    issue_code_count: issueCodes.length,
    warning_code_count: warningCodes.length,
  },
  action406_hashes: action406Hashes,
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  isolation: {
    runner_manifest_files: runnerManifestFiles,
    runtime_markers: runtimeMarkers,
    production_consumer_files: productionConsumerFiles,
    config_changes: configChanges,
    action409_status_files: action409StatusFiles,
  },
  no_effect_flags: {
    implementation_modified: false,
    action404_test_modified_by_action409: false,
    downstream_shadow_executed: false,
    runner_created: false,
    manifest_created: false,
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
  },
  recommended_next_action: failedChecks.length === 0
    ? "action_410_mapped_only_pattern_discovery_static_shadow_execution_approval_gate"
    : "remediate_action_409_audit_blockers",
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.exitCode = failedChecks.length === 0 ? 0 : 1;
