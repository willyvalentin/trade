#!/usr/bin/env node

import { createHash } from "crypto";
import { execFileSync } from "child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const mapperPath = "lib/snapshot-to-learning-dataset-mapper.ts";
const learningFixturePath = "lib/learning-dataset-static-fixtures.ts";
const contextFixturePath = "lib/intelligence-context-static-fixtures.ts";
const patternFixturePath = "lib/pattern-insight-static-fixtures.ts";
const docPath = "docs/action-392-independent-mapper-remediation-verification-and-shadow-use-readiness-audit.md";
const verifierPath = "scripts/action-392-independent-mapper-remediation-verification-and-shadow-use-readiness-audit-verify.mjs";
const testPath = "tests/e2e/action-392-independent-mapper-remediation-verification-and-shadow-use-readiness-audit.spec.ts";
const requiredFiles = [mapperPath, learningFixturePath, contextFixturePath, patternFixturePath, docPath, verifierPath, testPath];

const expectedHashes = {
  [mapperPath]: "e6c0053b9030b342b6090816b77cd57ee878e5a703bbd5ac7b32e42b93fea47b",
  [learningFixturePath]: "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  [contextFixturePath]: "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  [patternFixturePath]: "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
};
const action394MapperHash = "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d";
const statuses = [
  "mapped", "mapped_with_missing_optional_data", "blocked_missing_required_identity",
  "blocked_invalid_linkage", "blocked_conflicting_aliases", "blocked_temporal_violation",
  "blocked_future_leakage", "blocked_invalid_provenance", "blocked_invalid_outcome", "blocked_invalid_input",
];
const issueCodes = [
  "missing_required_identity", "invalid_linkage", "conflicting_aliases", "invalid_timestamp",
  "temporal_violation", "future_leakage", "invalid_provenance", "invalid_outcome", "invalid_input",
  "missing_optional_context", "missing_optional_outcome", "unknown_setup", "unavailable_source", "partial_provenance",
];

function absolute(path) {
  return join(repoRoot, path);
}

function read(path) {
  return readFileSync(absolute(path), "utf8");
}

function hash(path) {
  return createHash("sha256").update(readFileSync(absolute(path))).digest("hex");
}

function includesAll(content, values) {
  return values.every((value) => content.includes(value));
}

function collectFiles(path) {
  const target = absolute(path);
  if (!existsSync(target)) return [];
  const stat = statSync(target);
  if (stat.isFile()) return [path];
  return readdirSync(target).flatMap((entry) => collectFiles(join(path, entry))).sort();
}

function statusFiles() {
  return execFileSync("git", ["status", "--short", "--untracked-files=all"], { cwd: repoRoot, encoding: "utf8" })
    .trimEnd()
    .split("\n")
    .filter(Boolean)
    .map((line) => line.slice(3).trim())
    .map((path) => (path.includes(" -> ") ? (path.split(" -> ").at(-1) ?? path) : path));
}

const doc = existsSync(absolute(docPath)) ? read(docPath) : "";
const tests = existsSync(absolute(testPath)) ? read(testPath) : "";
const mapper = existsSync(absolute(mapperPath)) ? read(mapperPath) : "";
const changedFiles = statusFiles();
const action392Files = changedFiles.filter((path) => path.includes("action-392"));
const allowedAction392Files = [docPath, verifierPath, testPath];
const forbiddenAction392Changes = action392Files.filter((path) => !allowedAction392Files.includes(path));
const protectedSourceChanges = Object.keys(expectedHashes).filter((path) =>
  path === mapperPath
    ? ![expectedHashes[mapperPath], action394MapperHash].includes(hash(path))
    : hash(path) !== expectedHashes[path],
);
const mapperConsumerFiles = collectFiles("app").filter(
  (path) => /\.(?:ts|tsx|js|jsx)$/.test(path) && read(path).includes("snapshot-to-learning-dataset-mapper"),
);
const forbiddenMapperMarkers = [
  /process\.env/,
  /\bfetch\s*\(/,
  /Date\.now\s*\(/,
  /Math\.random\s*\(/,
  /randomUUID\s*\(/,
  /console\./,
  /@supabase/,
  /next\/server/,
  /from\s+["'](?:node:)?fs["']/,
  /writeFile/,
  /readFile/,
].filter((pattern) => pattern.test(mapper)).map(String);

const checks = {
  required_files_found: requiredFiles.every((path) => existsSync(absolute(path))),
  mapper_source_hash_recorded: doc.includes(expectedHashes[mapperPath]),
  fixture_hashes_recorded: includesAll(doc, [expectedHashes[learningFixturePath], expectedHashes[contextFixturePath], expectedHashes[patternFixturePath]]),
  source_hashes_unchanged_during_action_392: protectedSourceChanges.length === 0,
  mapper_not_modified_by_action_392: [expectedHashes[mapperPath], action394MapperHash].includes(hash(mapperPath)),
  fixtures_not_modified_by_action_392:
    expectedHashes[learningFixturePath] === hash(learningFixturePath) &&
    expectedHashes[contextFixturePath] === hash(contextFixturePath) &&
    expectedHashes[patternFixturePath] === hash(patternFixturePath),
  seven_finding_closures_documented: includesAll(doc, [
    "## Seven-finding closure matrix",
    "Unsupported context category",
    "Invalid freshness state",
    "Stale/fresh contradiction",
    "Non-finite context metric",
    "Unsupported trading window",
    "Payload/outcome horizon disagreement",
    "Failed anti-leakage marker",
    "All seven original examples are independently closed",
  ]),
  bypass_variant_coverage_documented: includesAll(doc, [
    "## Bypass-variant matrix",
    "Context missing-state literal ` present `",
    "Freshness state ` fresh `",
    "Payload horizon `60M`",
    "failed bypass",
  ]),
  valid_domain_regression_matrix_exists: includesAll(doc, ["## Valid-domain regression matrix", "15/15", "Nullable context", "Excluded future facts"]),
  malformed_domain_regression_matrix_exists: includesAll(doc, ["## Malformed-domain regression matrix", "All blocked as designed except the three normalization bypass"]),
  result_status_matrix_exists: includesAll(doc, ["## Result-status matrix", ...statuses]),
  issue_code_matrix_exists: includesAll(doc, ["## Issue-code matrix", ...issueCodes, "RFC 6901"]),
  validation_precedence_audit_exists: includesAll(doc, ["## Validation-precedence audit", "1. input shape", "10. construction"]),
  anti_leakage_monotonicity_audit_exists: includesAll(doc, [
    "### Anti-leakage monotonicity",
    "Failed, unknown, missing",
    "No blocked leakage result contains a row",
  ]),
  identity_and_alias_audit_exists: includesAll(doc, ["## Alias and row-identity regression", "Timestamp, side, setup, and confidence precedence", "changed fingerprint"]),
  immutability_audit_exists: includesAll(doc, ["## Input immutability and deterministic output", "Deep-frozen", "byte-identical"]),
  determinism_audit_exists: includesAll(doc, ["Repeated and interleaved", "issue ordering", "serialization"]),
  shadow_use_risk_review_exists: includesAll(doc, ["## Shadow-use risk review", "disposable local evidence", "does not approve shadow use"]),
  all_seven_and_bypass_tests_exist: includesAll(tests, [
    "all seven original Action 389 findings are closed",
    "whitespace context-state audit remains historical",
    "freshness bypass audit preserves discovery",
    "payload horizon audit preserves discovery",
  ]),
  deep_determinism_tests_exist: includesAll(tests, ["deepFreeze", "repeated interleaved determinism", "JSON.stringify(valid)"]),
  mapper_consumers_absent: mapperConsumerFiles.length === 0,
  no_hidden_runtime_provider_supabase_or_persistence: forbiddenMapperMarkers.length === 0,
  no_forbidden_action_392_changes: forbiddenAction392Changes.length === 0 && protectedSourceChanges.length === 0,
  no_schema_migration_proxy_middleware_netlify_changes:
    action392Files.every((path) => !/^(?:app\/|supabase\/migrations|proxy\.ts|middleware\.|netlify\.)/.test(path)),
  runtime_preview_chain_untouched:
    action392Files.every((path) => !path.includes("runtime-preview")) &&
    doc.includes("runtime_preview_waiting_for_operator_inputs"),
  readiness_decision_exists: includesAll(doc, [
    "Vocabulary: `ready`, `ready_with_conditions`, `blocked`",
    "`readiness_decision: blocked`",
    "`passed_conditions_count: 20`",
    "`failed_conditions_count: 3`",
    "`unresolved_conditions_count: 0`",
  ]),
  shadow_use_gate_not_identified_while_blocked: includesAll(doc, [
    "A shadow-use approval gate remains blocked",
    "narrow mapper literal-normalization bypass remediation approval gate",
  ]),
};

const verificationStatus = Object.values(checks).every(Boolean) ? "passed" : "blocked";
const report = {
  verification_status: verificationStatus,
  ...checks,
  readiness_decision: "blocked",
  passed_conditions_count: 20,
  failed_conditions_count: 3,
  unresolved_conditions_count: 0,
  seven_original_findings_closed: true,
  failed_conditions: [
    "context_missing_state_whitespace_normalization_bypass",
    "freshness_state_whitespace_normalization_bypass",
    "payload_horizon_case_and_whitespace_normalization_bypass",
  ],
  mapper_source_sha256: hash(mapperPath),
  learning_fixture_source_sha256: hash(learningFixturePath),
  context_fixture_source_sha256: hash(contextFixturePath),
  pattern_fixture_source_sha256: hash(patternFixturePath),
  protected_source_changes: protectedSourceChanges,
  mapper_consumer_files: mapperConsumerFiles,
  forbidden_mapper_markers: forbiddenMapperMarkers,
  action_392_changed_files: action392Files,
  forbidden_action_392_changes: forbiddenAction392Changes,
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  no_effect_flags: {
    shadow_use_executed: false,
    provider_call_executed: false,
    news_call_executed: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    persistence_executed: false,
    replay_executed: false,
    pattern_discovery_executed: false,
    confidence_calibration_executed: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    recommendations_mutated: false,
  },
  recommended_next_action: "narrow_mapper_literal_normalization_bypass_remediation_approval_gate",
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.exitCode = verificationStatus === "passed" ? 0 : 1;
