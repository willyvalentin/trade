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
const docPath = "docs/action-389-pure-mapper-independent-verification-and-fixture-coverage-audit.md";
const verifierPath = "scripts/action-389-pure-mapper-independent-verification-and-fixture-coverage-audit-verify.mjs";
const testPath = "tests/e2e/action-389-pure-mapper-independent-verification-and-fixture-coverage-audit.spec.ts";
const requiredFiles = [mapperPath, learningFixturePath, contextFixturePath, docPath, verifierPath, testPath];

const expectedHashes = {
  [mapperPath]: "05276aebf1e7c6328242949c22e489ba384c9c501574c5d170d789ba47fa00e2",
  [learningFixturePath]: "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  [contextFixturePath]: "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
};
const approvedAction391MapperHash = "e6c0053b9030b342b6090816b77cd57ee878e5a703bbd5ac7b32e42b93fea47b";
const approvedAction394MapperHash = "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d";
const action391Files = [
  "docs/action-391-pure-mapper-contract-remediation.md",
  "scripts/action-391-pure-mapper-contract-remediation-verify.mjs",
  "tests/e2e/action-391-pure-mapper-contract-remediation.spec.ts",
];
const action394DocPath = "docs/action-394-pure-mapper-literal-normalization-remediation.md";
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
  "missing_required_identity",
  "invalid_linkage",
  "conflicting_aliases",
  "invalid_timestamp",
  "temporal_violation",
  "future_leakage",
  "invalid_provenance",
  "invalid_outcome",
  "invalid_input",
  "missing_optional_context",
  "missing_optional_outcome",
  "unknown_setup",
  "unavailable_source",
  "partial_provenance",
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
  return readdirSync(target)
    .flatMap((entry) => collectFiles(join(path, entry)))
    .sort();
}

function statusFiles() {
  return execFileSync("git", ["status", "--short", "--untracked-files=all"], {
    cwd: repoRoot,
    encoding: "utf8",
  })
    .trimEnd()
    .split("\n")
    .filter(Boolean)
    .map((line) => line.slice(3).trim())
    .map((path) => (path.includes(" -> ") ? (path.split(" -> ").at(-1) ?? path) : path));
}

const mapper = existsSync(absolute(mapperPath)) ? read(mapperPath) : "";
const doc = existsSync(absolute(docPath)) ? read(docPath) : "";
const tests = existsSync(absolute(testPath)) ? read(testPath) : "";
const changedFiles = statusFiles();
const action389Files = changedFiles.filter((path) => path.includes("action-389"));
const allowedAction389Files = [docPath, verifierPath, testPath];
const forbiddenAction389Changes = action389Files.filter((path) => !allowedAction389Files.includes(path));
const currentMapperHash = hash(mapperPath);
const approvedAction391RemediationImplemented =
  currentMapperHash === approvedAction391MapperHash &&
  action391Files.every((path) => existsSync(absolute(path))) &&
  read("docs/action-391-pure-mapper-contract-remediation.md").includes("Action 390 returned `approval_decision: approved`");
const approvedAction394RemediationImplemented =
  currentMapperHash === approvedAction394MapperHash &&
  existsSync(absolute(action394DocPath)) &&
  read(action394DocPath).includes(`mapper: \`${approvedAction394MapperHash}\``) &&
  read(action394DocPath).includes("Action 394 closes exactly the three literal-normalization bypasses");
const approvedDownstreamRemediationImplemented =
  approvedAction391RemediationImplemented || approvedAction394RemediationImplemented;
const protectedSourceChanges = [learningFixturePath, contextFixturePath]
  .filter((path) => expectedHashes[path] !== hash(path));
if (currentMapperHash !== expectedHashes[mapperPath] && !approvedDownstreamRemediationImplemented) {
  protectedSourceChanges.push(mapperPath);
}
const mapperConsumerFiles = collectFiles("app").filter(
  (path) => /\.(?:ts|tsx|js|jsx)$/.test(path) && read(path).includes("snapshot-to-learning-dataset-mapper"),
);
const forbiddenMapperPatterns = [
  /process\.env/,
  /\bfetch\s*\(/,
  /Date\.now\s*\(/,
  /Math\.random\s*\(/,
  /randomUUID\s*\(/,
  /console\./,
  /@supabase/,
  /supabase-js/,
  /next\/server/,
  /from\s+["'](?:node:)?fs["']/,
  /localStorage/,
  /writeFile/,
  /readFile/,
];
const forbiddenMapperMarkers = forbiddenMapperPatterns.filter((pattern) => pattern.test(mapper)).map(String);

const checks = {
  required_files_found: requiredFiles.every((path) => existsSync(absolute(path))),
  mapper_source_unchanged_by_action_389:
    expectedHashes[mapperPath] === currentMapperHash || approvedDownstreamRemediationImplemented,
  fixture_modules_unchanged: expectedHashes[learningFixturePath] === hash(learningFixturePath) && expectedHashes[contextFixturePath] === hash(contextFixturePath),
  one_authoritative_public_entry_point:
    (mapper.match(/export function mapSnapshotToLearningDataset\s*\(/g) ?? []).length === 1 &&
    (mapper.match(/export function /g) ?? []).length === 1,
  source_integrity_review_exists: includesAll(doc, [
    "## Source integrity and public API",
    "Baseline SHA-256",
    "Mapper consumers: none",
    "Action 389 mapper source changes: none",
  ]),
  result_vocabulary_review_exists: includesAll(doc, statuses),
  issue_contract_and_inventory_exists: includesAll(doc, ["## Issue-code coverage inventory", ...issueCodes]),
  validation_precedence_audit_exists: includesAll(doc, ["## Validation-order review", "1. input shape", "10. row construction"]),
  alias_precedence_audit_exists: includesAll(doc, ["## Alias-precedence review", "Timestamp", "Side", "Setup", "Confidence"]),
  identity_audit_exists: includesAll(doc, ["## Identity and linkage review", "## Deterministic row identity", "NFC", "percent encoding"]),
  valid_fixture_coverage_matrix_exists: includesAll(doc, [
    "## Valid fixture coverage matrix",
    "13/13 Action 380",
    "15/15 Action 381",
    "learning_row:v1:001:complete",
    "intelligence_context:v1:015:isolated_stock_strength",
  ]),
  malformed_fixture_coverage_matrix_exists: includesAll(doc, [
    "## Malformed fixture coverage matrix",
    "all 14 Action 380 malformed cases",
    "all 18 Action 381 malformed cases",
    "malformed_context:010",
    "mapper:horizon_conflict",
    "repair performed",
  ]),
  all_statuses_have_direct_test_coverage: includesAll(tests, statuses),
  all_issue_codes_have_direct_test_coverage: includesAll(tests, issueCodes),
  immutability_audit_exists: includesAll(doc, ["## Immutability and determinism", "Deep-frozen", "byte-identical"]),
  determinism_audit_exists: includesAll(tests, ["repeated and interleaved", "JSON.stringify", "deepFreeze"]),
  peer_group_remains_unsupported_optional: includesAll(doc, ["Peer group remains `unsupported_optional`", "no peer-group field"]),
  no_inference_repair_enrichment_review_exists: includesAll(doc, [
    "## No-inference, repair, enrichment, runtime, and persistence review",
    "Action 389 performed no repair",
  ]),
  mapper_consumers_absent: mapperConsumerFiles.length === 0,
  no_runtime_provider_supabase_or_persistence: forbiddenMapperMarkers.length === 0,
  no_forbidden_action_389_changes: forbiddenAction389Changes.length === 0 && protectedSourceChanges.length === 0,
  no_schema_migration_proxy_middleware_netlify_changes:
    action389Files.every((path) => !/^(?:supabase\/migrations|proxy\.ts|middleware\.|netlify\.|app\/)/.test(path)),
  runtime_preview_chain_untouched:
    action389Files.every((path) => !path.includes("runtime-preview")) &&
    doc.includes("runtime_preview_waiting_for_operator_inputs"),
  deterministic_readiness_decision_exists: includesAll(doc, [
    "Vocabulary: `ready`, `ready_with_conditions`, `blocked`",
    "`readiness_decision: blocked`",
    "`passed_conditions_count: 18`",
    "`failed_conditions_count: 7`",
    "`unresolved_conditions_count: 0`",
  ]),
  next_action_is_separate_remediation_gate: includesAll(doc, [
    "## Next permitted Action",
    "separate pure-mapper contract remediation approval gate",
    "Static shadow-use approval is blocked",
  ]),
  focused_test_contract_exists: includesAll(tests, [
    "all 15 Action 381 valid context fixture families",
    "all 13 Action 380 valid semantic families",
    "malformed fixture audit records contract gaps",
    "multi-fault validation precedence",
    "row identity includes only frozen",
    "there are no mapper consumers",
  ]),
};

const verificationStatus = Object.values(checks).every(Boolean) ? "passed" : "blocked";
const report = {
  verification_status: verificationStatus,
  ...checks,
  readiness_decision: "blocked",
  passed_conditions_count: 18,
  failed_conditions_count: 7,
  unresolved_conditions_count: 0,
  failed_conditions: [
    "unsupported_context_category_accepted",
    "invalid_freshness_state_accepted",
    "stale_fresh_contradiction_accepted",
    "non_finite_context_metric_accepted",
    "unsupported_trading_window_accepted",
    "payload_outcome_horizon_disagreement_accepted",
    "failed_anti_leakage_status_rewritten_as_passed",
  ],
  approved_downstream_remediation_implemented: approvedDownstreamRemediationImplemented,
  approved_action_391_remediation_implemented: approvedAction391RemediationImplemented,
  approved_action_394_remediation_implemented: approvedAction394RemediationImplemented,
  historical_audit_mapper_sha256: expectedHashes[mapperPath],
  approved_downstream_mapper_sha256: approvedAction394RemediationImplemented
    ? approvedAction394MapperHash
    : approvedAction391RemediationImplemented
      ? approvedAction391MapperHash
      : null,
  mapper_source_sha256: hash(mapperPath),
  learning_fixture_source_sha256: hash(learningFixturePath),
  context_fixture_source_sha256: hash(contextFixturePath),
  protected_source_changes: protectedSourceChanges,
  mapper_consumer_files: mapperConsumerFiles,
  forbidden_mapper_markers: forbiddenMapperMarkers,
  action_389_changed_files: action389Files,
  forbidden_action_389_changes: forbiddenAction389Changes,
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
  recommended_next_action: "separate_pure_mapper_contract_remediation_approval_gate",
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.exitCode = verificationStatus === "passed" ? 0 : 1;
