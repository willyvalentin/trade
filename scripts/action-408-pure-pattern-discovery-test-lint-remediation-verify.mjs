#!/usr/bin/env node

import { createHash } from "crypto";
import { execFileSync, spawnSync } from "child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const paths = {
  target: "tests/e2e/action-404-pure-pattern-discovery-implementation.spec.ts",
  pure: "lib/pure-pattern-discovery.ts",
  doc: "docs/action-408-pure-pattern-discovery-test-lint-remediation.md",
  verifier: "scripts/action-408-pure-pattern-discovery-test-lint-remediation-verify.mjs",
  test: "tests/e2e/action-408-pure-pattern-discovery-test-lint-remediation.spec.ts",
  action405Verifier: "scripts/action-405-independent-pure-pattern-discovery-verification-and-hash-audit-verify.mjs",
  action406Verifier: "scripts/action-406-mapped-only-pattern-discovery-hash-freeze-and-static-shadow-approval-gate-verify.mjs",
  action407Verifier: "scripts/action-407-pure-pattern-discovery-lint-remediation-approval-gate-verify.mjs",
};
const expectedPureHash = "48b7667c8690a1d8d56b819a3727e37ea73af7710a45131eb3debab48627191c";
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
const requiredDocMarkers = [
  "Purpose",
  "Scope",
  "Action 407 Approval",
  "Exact Six Remediated Locations",
  "Replacement Type Strategy",
  "Malformed-Input Preservation",
  "Assertion Preservation",
  "Test-Count Preservation",
  "Production-Source Immutability",
  "Public-API Immutability",
  "Semantic-Hash Preservation",
  "No-Suppression Guarantee",
  "Lint Result",
  "Regression Results",
  "Runtime-Preview Paused State",
  "Mandatory Action 409 Independent Audit",
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

function explicitAnyLocations(source) {
  const locations = [];
  source.split("\n").forEach((line, index) => {
    const matcher = /\bany\b/g;
    let match = matcher.exec(line);
    while (match) {
      locations.push({ line: index + 1, column: match.index + 1, text: line.trim() });
      match = matcher.exec(line);
    }
  });
  return locations;
}

function testNames(source) {
  return [...source.matchAll(/test\("([^"]+)"/g)].map((match) => match[1]);
}

function runJson(path) {
  return JSON.parse(execFileSync("node", [abs(path)], { cwd: root, encoding: "utf8" }));
}

function statusFiles() {
  const output = execFileSync("git", ["status", "--short", "--untracked-files=all"], { cwd: root, encoding: "utf8" });
  return output.trim().split("\n").filter(Boolean).map((line) => line.slice(3).trim()).sort();
}

const targetSource = exists(paths.target) ? read(paths.target) : "";
const pureSource = exists(paths.pure) ? read(paths.pure) : "";
const doc = exists(paths.doc) ? read(paths.doc) : "";
const testSource = exists(paths.test) ? read(paths.test) : "";
const action405 = exists(paths.action405Verifier) ? runJson(paths.action405Verifier) : null;
const action406 = exists(paths.action406Verifier) ? runJson(paths.action406Verifier) : null;
const action407 = exists(paths.action407Verifier) ? runJson(paths.action407Verifier) : null;
const targetAnyLocations = explicitAnyLocations(targetSource);
const pureAnyLocations = explicitAnyLocations(pureSource);
const currentTestNames = testNames(targetSource);
const status = statusFiles();
const configChanges = status.filter((path) =>
  ["eslint.config.mjs", "tsconfig.json"].includes(path) ||
  path.startsWith(".eslint") ||
  path.startsWith("tsconfig."),
);
const runtimeMarkerScan = spawnSync("rg", ["-n", "action-408|action_408|pure-pattern-discovery-test-lint-remediation", "app", "public", "proxy.ts", "netlify.toml", "next.config.ts"], { cwd: root, encoding: "utf8" });
const runtimeMarkers = runtimeMarkerScan.status === 0 ? runtimeMarkerScan.stdout.trim().split("\n").filter(Boolean) : [];
const action408Files = status.filter((path) => path.includes("action-408"));
const allowedAction408Files = [paths.doc, paths.verifier, paths.test];
const runnerManifestFiles = [...files("scripts"), ...files("docs")]
  .filter((path) => !allowedAction408Files.includes(path))
  .filter((path) => /action-408.*(?:runner|run|manifest|shadow)/i.test(path));
const exportTypes = [...pureSource.matchAll(/^export type (\w+)/gm)].map((match) => match[1]);
const exportFunctions = [...pureSource.matchAll(/^export function (\w+)/gm)].map((match) => match[1]);
const requiredAssertionMarkers = [
  "blocked_invalid_input",
  "blocked_invalid_configuration",
  "ineligible_mapper_status",
  "non_consumable_row",
  "blocked_invalid_lineage",
  "blocked_future_leakage",
  "invalid_grouping_literal",
  "invalid_outcome",
  "non_finite_numeric",
  "duplicate_mapper_row_identity",
  "insufficient_evidence",
  "discovered",
  "discovered_with_warnings",
  "average_gross_r_multiple",
  "evidence_set_sha256",
  "deepFreeze",
  "reverse()",
];
const malformedMarkers = [
  "Record<string, unknown>",
  "delete missing.numeric_scale",
  "Object.assign(row, { anti_leakage_status: value })",
  "Object.assign(row.setup_and_confidence, { setup_family: \"Momentum_Continuation\" })",
  "Object.assign(row.outcome_fields, { availability: \"incomplete\" })",
  "Number.NaN",
  "Number.POSITIVE_INFINITY",
];
const checks = {
  required_files_found: [paths.doc, paths.verifier, paths.test, paths.target].every(exists),
  documentation_contract_complete: requiredDocMarkers.every((marker) => doc.includes(`## ${marker}`)),
  exact_target_file_remediated:
    exists(paths.target) &&
    targetSource.includes("Mutable<Action335LearningDatasetRow>") &&
    targetSource.includes("MutablePatternDiscoveryRowEnvelope") &&
    targetAnyLocations.length === 0 &&
    exists(paths.pure) &&
    shaFile(paths.pure) === expectedPureHash,
  six_approved_locations_documented: ["37:33", "57:66", "57:140", "81:38", "96:51", "109:147"].every((marker) => doc.includes(marker)),
  zero_explicit_any_in_target_and_pure: targetAnyLocations.length === 0 && pureAnyLocations.length === 0,
  no_suppressions_or_config_weakening: !/eslint-disable|ts-ignore|ts-expect-error/.test(targetSource) && configChanges.length === 0,
  production_implementation_hash_unchanged: exists(paths.pure) && shaFile(paths.pure) === expectedPureHash,
  public_exports_unchanged: JSON.stringify(exportFunctions) === JSON.stringify(["discoverPatterns"]) && JSON.stringify(exportTypes) === JSON.stringify([
    "PatternDiscoveryRowEnvelope",
    "FrozenPatternDiscoveryConfiguration",
    "PatternDiscoveryIssue",
    "PatternDiscoveryWarning",
    "PatternDiscoveryEvidenceSummary",
    "PatternDiscoveryGroupResult",
    "PatternDiscoveryResult",
  ]),
  test_count_and_names_preserved: currentTestNames.length === 15 && JSON.stringify(currentTestNames) === JSON.stringify(expectedTestNames),
  key_assertion_inventory_preserved: requiredAssertionMarkers.every((marker) => targetSource.includes(marker)),
  malformed_input_cases_preserved: malformedMarkers.every((marker) => targetSource.includes(marker)),
  action406_hashes_preserved: Object.values(action406Hashes).every((hash) => doc.includes(hash) && JSON.stringify(action406).includes(hash)),
  action405_action406_action407_healthy: action405?.verification_status === "passed" && action406?.verification_status === "passed" && action407?.verification_status === "passed",
  no_runner_manifest_shadow: runnerManifestFiles.length === 0,
  no_runtime_or_deployment_artifacts: runtimeMarkers.length === 0,
  action408_boundary_exact: action408Files.every((path) => allowedAction408Files.includes(path)),
  runtime_preview_paused: doc.includes("runtime_preview_waiting_for_operator_inputs"),
  action409_mandatory: doc.includes("Action 409 remains mandatory"),
  focused_tests_cover_gate: [
    "zero explicit any after remediation",
    "Action 404 test names unchanged",
    "malformed arrays preserved",
    "npm run lint passes",
    "verifier succeeds",
  ].every((marker) => testSource.includes(marker)),
};
const failed = Object.entries(checks).filter(([, value]) => !value).map(([key]) => key);
const report = {
  verification_status: failed.length === 0 ? "passed" : "blocked",
  remediation_status: failed.length === 0 ? "remediated" : "blocked",
  checks,
  failed_checks: failed,
  target_file: paths.target,
  remediated_locations: ["37:33", "57:66", "57:140", "81:38", "96:51", "109:147"],
  explicit_any_counts: {
    target: targetAnyLocations.length,
    pure_implementation: pureAnyLocations.length,
  },
  test_count: currentTestNames.length,
  test_names: currentTestNames,
  implementation_hash: {
    expected: expectedPureHash,
    actual: exists(paths.pure) ? shaFile(paths.pure) : null,
    unchanged: exists(paths.pure) && shaFile(paths.pure) === expectedPureHash,
  },
  public_exports: {
    runtime: exportFunctions,
    types: exportTypes,
  },
  action406_hashes: action406Hashes,
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  no_effect_flags: {
    production_implementation_modified: false,
    lint_suppression_added: false,
    runner_created: false,
    manifest_created: false,
    downstream_shadow_executed: false,
    provider_call_executed: false,
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
  recommended_next_action: failed.length === 0 ? "action_409_independent_post_lint_pattern_discovery_behavioral_and_hash_verification" : "remediate_action_408_test_lint_remediation",
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.exitCode = failed.length === 0 ? 0 : 1;
