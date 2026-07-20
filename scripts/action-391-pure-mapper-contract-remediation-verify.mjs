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
const docPath = "docs/action-391-pure-mapper-contract-remediation.md";
const verifierPath = "scripts/action-391-pure-mapper-contract-remediation-verify.mjs";
const testPath = "tests/e2e/action-391-pure-mapper-contract-remediation.spec.ts";
const approvalPath = "docs/action-390-pure-mapper-contract-remediation-approval-gate.md";
const requiredFiles = [mapperPath, learningFixturePath, contextFixturePath, docPath, verifierPath, testPath, approvalPath];

const expectedMapperHash = "e6c0053b9030b342b6090816b77cd57ee878e5a703bbd5ac7b32e42b93fea47b";
const action394MapperHash = "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d";
const expectedFixtureHashes = {
  [learningFixturePath]: "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  [contextFixturePath]: "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
};
const statuses = [
  "mapped",
  "mapped_with_missing_optional_data",
  "blocked_missing_required_identity",
  "blocked_invalid_linkage",
  "blocked_conflicting_aliases",
  "blocked_temporal_violation",
  "blocked_future_leakage",
  "blocked_invalid_provenance",
  "blocked_invalid_outcome",
  "blocked_invalid_input",
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

const mapper = existsSync(absolute(mapperPath)) ? read(mapperPath) : "";
const doc = existsSync(absolute(docPath)) ? read(docPath) : "";
const tests = existsSync(absolute(testPath)) ? read(testPath) : "";
const approval = existsSync(absolute(approvalPath)) ? read(approvalPath) : "";
const changedFiles = statusFiles();
const action391ChangedFiles = changedFiles.filter((path) => path.includes("action-391") || path === mapperPath);
const allowedAction391Files = [mapperPath, docPath, verifierPath, testPath];
const forbiddenAction391Changes = action391ChangedFiles.filter((path) => !allowedAction391Files.includes(path));
const fixtureChanges = [learningFixturePath, contextFixturePath].filter((path) => hash(path) !== expectedFixtureHashes[path]);
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
  action_390_approval_found:
    approval.includes("`approval_decision: approved`") &&
    approval.includes("`passed_conditions_count: 17`") &&
    approval.includes("`unresolved_conditions_count: 0`") &&
    doc.includes("Action 390 returned `approval_decision: approved`"),
  mapper_modified_only_within_boundary:
    [expectedMapperHash, action394MapperHash].includes(hash(mapperPath)) && forbiddenAction391Changes.length === 0,
  all_seven_findings_remediated: includesAll(mapper, [
    "supportedContextCategories",
    "supportedFreshnessStates",
    "freshnessIssues",
    "contextDomainIssues",
    "supportedWindows",
    "payloadHorizon",
    "anti_leakage_status",
  ]),
  authoritative_category_vocabularies_reused: includesAll(mapper, [
    'new Set(["up", "down", "neutral"])',
    'new Set(["bullish", "bearish", "mixed"])',
    'new Set(["low", "elevated"])',
    'new Set(["positive", "negative", "conflicting"])',
    "supportedContextStates",
  ]),
  freshness_vocabulary_exact: includesAll(mapper, [
    "supportedFreshnessStates",
    '"fresh"', '"stale"', '"unknown"', '"unavailable"',
    "/contextSnapshot/freshness/state",
  ]),
  stale_fresh_contradiction_checks_exist: includesAll(mapper, [
    'state === "stale" && freshness.fresh === true',
    'state === "fresh" && freshness.stale === true',
    'context.data_provenance.state === "unavailable"',
    'missing_data_flags.includes("stale_source")',
  ]),
  finite_number_checks_exist: includesAll(mapper, [
    'kind.type === "number"',
    "finite(value.value)",
    "finite(age)",
    "/contextSnapshot/context/relative_strength/stock_vs_spy",
  ]),
  trading_window_vocabulary_exact: includesAll(mapper, [
    'new Set(["morning", "midday", "power_hour", "unknown"])',
    "snapshotDomainIssues(snapshot)",
    "/recommendationSnapshot/window",
  ]),
  horizon_conflict_uses_blocked_invalid_linkage: includesAll(mapper, [
    "payload.outcome_horizon",
    "outcome.horizon",
    "/recommendationSnapshot/payload_json/outcome_horizon",
    "/outcome/horizon",
    'return blocked("blocked_invalid_linkage", linkages)',
  ]),
  anti_leakage_monotonicity_exists: includesAll(mapper, [
    '!owns(contextRecord, "anti_leakage_status")',
    'contextRecord.anti_leakage_status !== "passed"',
    "/contextSnapshot/anti_leakage_status",
    'return blocked("blocked_future_leakage", leakage)',
  ]),
  blocked_leakage_has_no_row_and_is_non_consumable: includesAll(mapper, [
    "row: null",
    "consumable: false",
    'blocked("blocked_future_leakage"',
  ]),
  validation_order_preserved: includesAll(mapper, [
    "validateInputShape(input)",
    "requiredIdentityIssues(snapshot, context, outcome)",
    "linkageIssues(snapshot, context, outcome)",
    "resolveAliases(snapshot)",
    "timestampIssues(snapshot, context, outcome, aliases)",
    "futureLeakageIssues(context",
    "provenanceIssues(context, aliases.recommendationAt as string)",
    "snapshotDomainIssues(snapshot)",
    "outcomeIssues(outcome, aliases.side)",
    "optionalWarnings(context, outcome, aliases.setupFamily)",
    "constructRow(input, resolved, warnings)",
  ]),
  existing_statuses_unchanged: includesAll(mapper, statuses) &&
    (mapper.match(/\| "blocked_/g) ?? []).length === 8,
  issue_contract_unchanged: includesAll(mapper, issueCodes) && includesAll(mapper, [
    'severity: "error" | "warning"',
    "messageKey:",
    "orderedIssues",
  ]),
  regression_tests_cover_seven_findings: includesAll(tests, [
    "unsupported context categories block",
    "invalid freshness and stale fresh contradictions block",
    "non-finite or numeric strings block",
    "unsupported windows block",
    "populated disagreements block linkage",
    "failed unknown and missing anti-leakage evidence never upgrade",
  ]),
  multi_fault_precedence_tests_exist: tests.includes("multi-fault precedence remains frozen"),
  input_immutability_tests_exist: includesAll(tests, ["deepFreeze", "byte-identical", "JSON.stringify(valid)"]),
  deterministic_output_tests_exist: includesAll(tests, ["repeated calls", "stable serialization", "validResults[0]"]),
  fixture_modules_unchanged: fixtureChanges.length === 0,
  mapper_consumers_absent: mapperConsumerFiles.length === 0,
  no_runtime_provider_supabase_or_persistence: forbiddenMapperMarkers.length === 0,
  no_schema_migration_proxy_middleware_netlify_changes:
    action391ChangedFiles.every((path) => !/^(?:app\/|supabase\/migrations|proxy\.ts|middleware\.|netlify\.)/.test(path)),
  runtime_preview_chain_untouched:
    action391ChangedFiles.every((path) => !path.includes("runtime-preview")) &&
    doc.includes("runtime_preview_waiting_for_operator_inputs"),
  action_390_boundary_respected: includesAll(doc, [
    "No Action 380, Action 381, or Pattern Insight fixture module changed",
    "Mapper consumers: none",
    "Runtime integration: none",
    "Persistence: none",
  ]),
  next_independent_verification_identified: doc.includes("Action 392 independent remediation verification and shadow-use readiness audit"),
};

const verificationStatus = Object.values(checks).every(Boolean) ? "passed" : "blocked";
const report = {
  verification_status: verificationStatus,
  ...checks,
  remediated_findings_count: 7,
  new_result_statuses_count: 0,
  new_issue_codes_count: 0,
  mapper_source_sha256: hash(mapperPath),
  learning_fixture_source_sha256: hash(learningFixturePath),
  context_fixture_source_sha256: hash(contextFixturePath),
  fixture_changes: fixtureChanges,
  mapper_consumer_files: mapperConsumerFiles,
  forbidden_mapper_markers: forbiddenMapperMarkers,
  action_391_changed_files: action391ChangedFiles,
  forbidden_action_391_changes: forbiddenAction391Changes,
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  no_effect_flags: {
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
  recommended_next_action: "action_392_independent_remediation_verification_and_shadow_use_readiness_audit",
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.exitCode = verificationStatus === "passed" ? 0 : 1;
