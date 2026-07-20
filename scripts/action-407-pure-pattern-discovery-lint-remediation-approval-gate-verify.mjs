#!/usr/bin/env node

import { createHash } from "crypto";
import { execFileSync, spawnSync } from "child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const paths = {
  doc: "docs/action-407-pure-pattern-discovery-lint-remediation-approval-gate.md",
  verifier: "scripts/action-407-pure-pattern-discovery-lint-remediation-approval-gate-verify.mjs",
  test: "tests/e2e/action-407-pure-pattern-discovery-lint-remediation-approval-gate.spec.ts",
  pure: "lib/pure-pattern-discovery.ts",
  action404Test: "tests/e2e/action-404-pure-pattern-discovery-implementation.spec.ts",
  action408Doc: "docs/action-408-pure-pattern-discovery-test-lint-remediation.md",
  action408Verifier: "scripts/action-408-pure-pattern-discovery-test-lint-remediation-verify.mjs",
  action408Test: "tests/e2e/action-408-pure-pattern-discovery-test-lint-remediation.spec.ts",
  action405Verifier: "scripts/action-405-independent-pure-pattern-discovery-verification-and-hash-audit-verify.mjs",
  action406Verifier: "scripts/action-406-mapped-only-pattern-discovery-hash-freeze-and-static-shadow-approval-gate-verify.mjs",
};
const expectedPureHash = "48b7667c8690a1d8d56b819a3727e37ea73af7710a45131eb3debab48627191c";
const action406Hashes = {
  evidence_set_sha256: "f1f0053264c85d640d46b61da0ce7120e491309e3070132fe74a69a68438cbd8",
  group_sha256: "aa2ae3f39146ce1c6fc1f6ed73e19e96b02b7866b34e75b61c471a8277a1122e",
  expected_result_sha256: "e911709a784159c684a350de490fd56446ee23c23b3bf5ea2fbb70378ebf253c",
};
const expectedLintInventory = [
  {
    line: 37,
    column: 33,
    construct: "clone(fixture) as any",
    classification: "mutable_fixture_clone",
    approved_replacement: "private mutable test-row structural type based on Action335LearningDatasetRow",
  },
  {
    line: 57,
    column: 66,
    construct: "apply: (row: any) => void",
    classification: "mutator_callback_parameter",
    approved_replacement: "private mutable learning-row structural type",
  },
  {
    line: 57,
    column: 140,
    construct: "clone(value) as any",
    classification: "mutable_envelope_clone",
    approved_replacement: "private mutable envelope test type",
  },
  {
    line: 81,
    column: 38,
    construct: "clone(config) as any",
    classification: "invalid_configuration_fixture_mutation",
    approved_replacement: "private mutable partial configuration type or narrowed Record<string, unknown>",
  },
  {
    line: 96,
    column: 51,
    construct: "clone(envelope(\"changed\")) as any",
    classification: "invalid_lineage_fixture_mutation",
    approved_replacement: "private mutable envelope test type",
  },
  {
    line: 109,
    column: 147,
    construct: "clone(envelope(`numeric-${String(value)}`)) as any",
    classification: "invalid_numeric_fixture_mutation",
    approved_replacement: "private mutable envelope test type",
  },
];
const requiredSections = [
  "Purpose", "Scope", "Authoritative Dependencies", "Action 404 Implementation State",
  "Action 405 Audit State", "Action 406 Hash-Freeze State", "Exact Current Implementation Hash",
  "Exact Lint Failure Summary", "Explicit No-Explicit-Any Error Inventory", "File And Line Inventory",
  "Current Construct Classification", "Approved Replacement Strategy Per Error",
  "Unknown Versus Generic Versus Narrow Structural Type Policy", "Type-Guard Policy",
  "Indexed-Access Policy", "JSON-Like Input Validation Policy", "Canonicalization Helper Typing Policy",
  "Error-Catch Typing Policy", "No-Runtime-Change Requirement", "No-Export-Change Requirement",
  "No-Signature-Change Requirement", "No-Result-Change Requirement", "No-Hash-Change Requirement",
  "No-Ordering-Change Requirement", "No-Mutation-Change Requirement", "No-Performance-Driven Rewrite",
  "Implementation Boundary", "Regression Requirements", "Hash-Regression Requirements",
  "Lint Acceptance Requirements", "Independent Post-Remediation Audit Requirement", "Approval Vocabulary",
  "Deterministic Gate Conditions", "Approval Decision", "Passed Conditions", "Failed Conditions",
  "Unresolved Conditions", "Next Permitted Action",
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

function statusFiles() {
  const output = execFileSync("git", ["status", "--short", "--untracked-files=all"], { cwd: root, encoding: "utf8" });
  return output
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => line.slice(3).trim())
    .map((path) => (path.includes(" -> ") ? path.split(" -> ").at(-1) ?? path : path))
    .sort();
}

function explicitAnyLocations(source) {
  const locations = [];
  const lines = source.split("\n");
  lines.forEach((line, index) => {
    const matcher = /\bany\b/g;
    let match = matcher.exec(line);
    while (match) {
      locations.push({ line: index + 1, column: match.index + 1, text: line.trim() });
      match = matcher.exec(line);
    }
  });
  return locations;
}

function runJson(path) {
  return JSON.parse(execFileSync("node", [abs(path)], { cwd: root, encoding: "utf8" }));
}

const doc = exists(paths.doc) ? read(paths.doc) : "";
const testSource = exists(paths.test) ? read(paths.test) : "";
const pureSource = exists(paths.pure) ? read(paths.pure) : "";
const action404Source = exists(paths.action404Test) ? read(paths.action404Test) : "";
const action405 = exists(paths.action405Verifier) ? runJson(paths.action405Verifier) : null;
const action406 = exists(paths.action406Verifier) ? runJson(paths.action406Verifier) : null;
const lintLocations = explicitAnyLocations(action404Source);
const pureAnyLocations = explicitAnyLocations(pureSource);
const productionConsumers = spawnSync("rg", ["-l", "action-407|lint-remediation-approval", "app", "public", "--glob", "*.{ts,tsx,js,jsx,json,txt,html}"], { cwd: root, encoding: "utf8" });
const runtimeConsumerFiles = [0, 1].includes(productionConsumers.status ?? -1)
  ? productionConsumers.stdout.trim().split("\n").filter(Boolean)
  : ["inventory_failed"];
const action407Files = statusFiles().filter((path) => path.includes("action-407"));
const allowedAction407Files = [paths.doc, paths.verifier, paths.test];
const runnerManifestFiles = [...files("scripts"), ...files("docs")]
  .filter((path) => !allowedAction407Files.includes(path))
  .filter((path) => /action-407.*(?:runner|run|manifest|shadow)/i.test(path));
const configChangedFiles = statusFiles().filter((path) =>
  ["eslint.config.mjs", ".eslintrc", ".eslintrc.js", ".eslintrc.cjs", "tsconfig.json"].includes(path) ||
  path.startsWith("tsconfig.") ||
  path.startsWith(".eslint"),
);
const expectedLocationSignature = expectedLintInventory.map((item) => `${item.line}:${item.column}`).join(",");
const actualLocationSignature = lintLocations.map((item) => `${item.line}:${item.column}`).join(",");
const action408Doc = exists(paths.action408Doc) ? read(paths.action408Doc) : "";
const action408RemediationDetected =
  lintLocations.length === 0 &&
  [paths.action408Doc, paths.action408Verifier, paths.action408Test].every(exists) &&
  expectedLintInventory.every((item) => action408Doc.includes(`${item.line}:${item.column}`)) &&
  [
    "Mutable<Action335LearningDatasetRow>",
    "MutablePatternDiscoveryRowEnvelope",
    "Record<string, unknown>",
    "Object.assign",
  ].every((marker) => action408Doc.includes(marker));
const originalLintInventoryDetected =
  lintLocations.length === 6 &&
  actualLocationSignature === expectedLocationSignature &&
  expectedLintInventory.every((item) =>
    doc.includes(`${item.line}:${item.column}`) &&
    doc.includes(item.classification) &&
    doc.includes(item.approved_replacement),
  );
const exportTypes = [...pureSource.matchAll(/^export type (\w+)/gm)].map((match) => match[1]);
const exportFunctions = [...pureSource.matchAll(/^export function (\w+)/gm)].map((match) => match[1]);
const checks = {
  required_files_found: [paths.doc, paths.verifier, paths.test].every(exists),
  documentation_sections_complete: requiredSections.every((section) => doc.includes(`## ${section}`)),
  action405_ready_with_conditions: action405?.verification_status === "passed" && action405?.readiness_decision === "ready_with_conditions",
  action406_approved_with_conditions: action406?.verification_status === "passed" && action406?.approval_decision === "approved_with_conditions",
  implementation_hash_unchanged: exists(paths.pure) && shaFile(paths.pure) === expectedPureHash && doc.includes(expectedPureHash),
  exact_lint_inventory: originalLintInventoryDetected || action408RemediationDetected,
  pure_module_explicit_any_zero: pureAnyLocations.length === 0 && doc.includes("zero explicit `any`"),
  approved_typing_strategies_frozen: [
    "existing authoritative types",
    "private mutable test-row structural type",
    "unknown",
    "Record<string, unknown>",
    "readonly arrays",
    "no suppression comment",
  ].every((marker) => doc.includes(marker)),
  unknown_boundary_policy_frozen: ["explicit object check", "explicit array check", "own-property", "no coercion", "no mutation"].every((marker) => doc.includes(marker)),
  canonicalization_policy_frozen: ["recursive JSON/canonical value type", "Undefined and unsupported values must remain rejected", "BigInt serialization"].every((marker) => doc.includes(marker)),
  no_suppression_or_config_policy: ["eslint-disable", "ts-ignore", "ts-expect-error", "ESLint config is unchanged", "TypeScript config is unchanged"].every((marker) => doc.includes(marker)),
  public_api_preserved: JSON.stringify(exportFunctions) === JSON.stringify(["discoverPatterns"]) && JSON.stringify(exportTypes) === JSON.stringify([
    "PatternDiscoveryRowEnvelope",
    "FrozenPatternDiscoveryConfiguration",
    "PatternDiscoveryIssue",
    "PatternDiscoveryWarning",
    "PatternDiscoveryEvidenceSummary",
    "PatternDiscoveryGroupResult",
    "PatternDiscoveryResult",
  ]),
  behavioral_invariants_frozen: ["14-phase validation order", "duplicate warnings", "BigInt summation", "four-decimal rounding", "minimum thresholds 20/20", "canonical row hashes"].every((marker) => doc.includes(marker)),
  action406_hashes_frozen: Object.values(action406Hashes).every((hash) => doc.includes(hash) && Object.values(action406 ?? {}).some((value) => JSON.stringify(value).includes(hash))),
  action408_boundary_exact: [
    "tests/e2e/action-404-pure-pattern-discovery-implementation.spec.ts",
    "docs/action-408-pure-pattern-discovery-lint-remediation.md",
    "scripts/action-408-pure-pattern-discovery-lint-remediation-verify.mjs",
    "tests/e2e/action-408-pure-pattern-discovery-lint-remediation.spec.ts",
  ].every((marker) => doc.includes(marker)),
  regression_and_lint_acceptance_frozen: ["Action 404", "Action 405", "Action 406", "npm run lint", "zero errors"].every((marker) => doc.includes(marker)),
  action409_mandatory: doc.includes("Action 409 is mandatory") && doc.includes("before any mapped-only Pattern Discovery shadow execution"),
  approval_decision_exact: doc.includes("`approved`") && doc.includes("action_408_pure_pattern_discovery_lint_remediation"),
  no_implementation_or_config_modification: exists(paths.pure) && shaFile(paths.pure) === expectedPureHash && configChangedFiles.length === 0,
  no_runner_manifest_shadow: runnerManifestFiles.length === 0,
  no_runtime_consumer_or_deployment_artifact: runtimeConsumerFiles.length === 0,
  action407_boundary_exact: action407Files.every((path) => allowedAction407Files.includes(path)),
  focused_tests_cover_gate: [
    "exact lint-error inventory",
    "narrow replacement policy",
    "Action 409 mandatory audit",
    "no implementation changes",
    "no runner",
    "verifier succeeds",
  ].every((marker) => testSource.includes(marker)),
};
const failed = Object.entries(checks).filter(([, value]) => !value).map(([key]) => key);
const report = {
  verification_status: failed.length === 0 ? "passed" : "blocked",
  approval_decision: failed.length === 0 ? "approved" : "blocked",
  checks,
  failed_checks: failed,
  passed_conditions_count: Object.values(checks).filter(Boolean).length,
  failed_conditions_count: failed.length,
  unresolved_conditions_count: failed.length === 0 ? 2 : 0,
  implementation_hash: {
    path: paths.pure,
    expected: expectedPureHash,
    actual: exists(paths.pure) ? shaFile(paths.pure) : null,
    unchanged: exists(paths.pure) && shaFile(paths.pure) === expectedPureHash,
  },
  lint_inventory: expectedLintInventory.map((item) => ({
    ...item,
    file: paths.action404Test,
    public_api_affected: false,
    expected_behavioral_impact: "none",
  })),
  actual_explicit_any_locations: lintLocations,
  action408_remediation_detected: action408RemediationDetected,
  lint_inventory_state: action408RemediationDetected ? "remediated_zero_explicit_any" : "original_six_explicit_any",
  pure_module_explicit_any_count: pureAnyLocations.length,
  action406_hashes: action406Hashes,
  public_exports: {
    runtime: exportFunctions,
    types: exportTypes,
  },
  approved_action408_boundary: [
    paths.action404Test,
    "docs/action-408-pure-pattern-discovery-lint-remediation.md",
    "scripts/action-408-pure-pattern-discovery-lint-remediation-verify.mjs",
    "tests/e2e/action-408-pure-pattern-discovery-lint-remediation.spec.ts",
    "minimal Actions 318-320 guard updates",
  ],
  mandatory_follow_up_action: "action_409_independent_post_lint_pattern_discovery_behavioral_and_hash_verification",
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  no_effect_flags: {
    implementation_modified: false,
    lint_remediation_performed: false,
    discover_patterns_executed: false,
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
  recommended_next_action: failed.length === 0 ? "action_408_pure_pattern_discovery_lint_remediation" : "remediate_action_407_approval_gate",
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.exitCode = failed.length === 0 ? 0 : 1;
