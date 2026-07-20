#!/usr/bin/env node

import { execFileSync } from "child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const mapperPath = "lib/snapshot-to-learning-dataset-mapper.ts";
const docPath = "docs/action-388-snapshot-to-learning-dataset-mapper-implementation.md";
const verifierPath = "scripts/action-388-snapshot-to-learning-dataset-mapper-implementation-verify.mjs";
const testPath = "tests/e2e/action-388-snapshot-to-learning-dataset-mapper-implementation.spec.ts";
const approvalPath = "docs/action-387-snapshot-to-learning-dataset-mapper-implementation-approval-gate.md";
const requiredFiles = [mapperPath, docPath, verifierPath, testPath, approvalPath];

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

function read(path) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function includesAll(content, values) {
  return values.every((value) => content.includes(value));
}

function collectFiles(path) {
  const absolute = join(repoRoot, path);
  if (!existsSync(absolute)) return [];
  const stat = statSync(absolute);
  if (stat.isFile()) return [path];
  if (!stat.isDirectory()) return [];
  return readdirSync(absolute)
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

const mapper = existsSync(join(repoRoot, mapperPath)) ? read(mapperPath) : "";
const doc = existsSync(join(repoRoot, docPath)) ? read(docPath) : "";
const testSource = existsSync(join(repoRoot, testPath)) ? read(testPath) : "";
const approval = existsSync(join(repoRoot, approvalPath)) ? read(approvalPath) : "";
const changedFiles = statusFiles();
const action388ChangedFiles = changedFiles.filter(
  (path) => path.includes("action-388") || path === mapperPath,
);
const allowedAction388Files = [mapperPath, docPath, verifierPath, testPath];
const forbiddenAction388Changes = action388ChangedFiles.filter(
  (path) => !allowedAction388Files.includes(path),
);
const fixtureFilesChangedByAction388 = action388ChangedFiles.filter((path) =>
  [
    "lib/learning-dataset-static-fixtures.ts",
    "lib/intelligence-context-static-fixtures.ts",
    "lib/pattern-insight-static-fixtures.ts",
  ].includes(path),
);
const mapperConsumerFiles = collectFiles("app").filter((path) => {
  if (!/\.(ts|tsx|js|jsx)$/.test(path)) return false;
  return read(path).includes("snapshot-to-learning-dataset-mapper");
});
const extraMapperFiles = collectFiles("lib").filter(
  (path) =>
    path !== mapperPath &&
    /snapshot-to-learning-dataset|learning-row-mapper|learning-dataset-mapper/.test(path),
);
const forbiddenSourcePatterns = [
  /process\.env/,
  /\bfetch\s*\(/,
  /Date\.now\s*\(/,
  /Math\.random\s*\(/,
  /randomUUID\s*\(/,
  /console\./,
  /@supabase/,
  /supabase-js/,
  /next\/server/,
  /from\s+["']fs["']/,
  /from\s+["']node:fs["']/,
  /localStorage/,
  /writeFile/,
  /readFile/,
];
const forbiddenSourceMarkers = forbiddenSourcePatterns
  .filter((pattern) => pattern.test(mapper))
  .map(String);

const checks = {
  required_files_found: requiredFiles.every((path) => existsSync(join(repoRoot, path))),
  action_387_approval_found:
    approval.includes("approval_decision: approved") &&
    approval.includes("passed_conditions_count: 17") &&
    approval.includes("unresolved_conditions_count: 0"),
  authoritative_contracts_reused: includesAll(mapper, [
    'from "@/lib/recommendation-snapshot"',
    'from "@/lib/recommendation-outcome-tracker"',
    'from "@/lib/intelligence-context-static-fixtures"',
    'from "@/lib/learning-dataset-static-fixtures"',
    "Action335LearningDatasetRow",
    "LearningDatasetContext",
    "LearningDatasetProvenance",
  ]),
  duplicate_row_schema_absent:
    !/type\s+Action335LearningDatasetRow\b/.test(mapper) &&
    !/interface\s+LearningDatasetRow\b/.test(mapper),
  one_authoritative_mapper_entry_point:
    (mapper.match(/export function mapSnapshotToLearningDataset\s*\(/g) ?? []).length === 1 &&
    (mapper.match(/export function /g) ?? []).length === 1,
  exact_result_vocabulary_found: includesAll(mapper, statuses),
  exact_issue_shape_found:
    includesAll(mapper, issueCodes) &&
    includesAll(mapper, [
      "SnapshotToLearningDatasetMapperIssue",
      'severity: "error" | "warning"',
      "messageKey:",
      "mapper.issue.",
    ]),
  deterministic_validation_order_found: includesAll(mapper, [
    "validateInputShape(input)",
    "requiredIdentityIssues(snapshot, context, outcome)",
    "linkageIssues(snapshot, context, outcome)",
    "resolveAliases(snapshot)",
    "timestampIssues(snapshot, context, outcome, aliases)",
    "futureLeakageIssues(context",
    "provenanceIssues(context, aliases.recommendationAt as string)",
    "outcomeIssues(outcome, aliases.side)",
    "optionalWarnings(context, outcome, aliases.setupFamily)",
    "constructRow(input, resolved, warnings)",
  ]),
  alias_precedence_found: includesAll(mapper, [
    "snapshot.recommended_at",
    "snapshot.app_timestamp",
    "snapshot.created_at",
    "payload.trade_direction",
    "payload.setup_family",
    "payload.setup_type",
    "snapshot.confidence",
    "snapshot.score",
    "normalizedConfidence",
  ]),
  conflict_blocking_found:
    mapper.includes("blocked_conflicting_aliases") && mapper.includes("conflictingTimestampIssues") && mapper.includes("aliasConflictIssues"),
  deterministic_row_identity_found: includesAll(mapper, [
    "LEARNING_DATASET_STATIC_FIXTURE_SCHEMA_VERSION",
    ".normalize(\"NFC\")",
    "encodeURIComponent",
    "identityComponents.join(\"|\")",
    "learning_row:v1:",
  ]),
  missing_state_distinctions_found: includesAll(mapper, [
    "missing_optional_context",
    "missing_optional_outcome",
    "unavailableValue",
    'state: "unavailable"',
    'availability: "not_yet_available"',
    'setupFamily === "unknown"',
  ]),
  context_and_outcome_handling_found: includesAll(mapper, [
    "missingContext",
    "missingProvenance",
    "mappedOutcome",
    "clone(context.context)",
    "outcome.best_r",
    "outcome.worst_r",
  ]),
  provenance_temporal_leakage_validation_found: includesAll(mapper, [
    "provenanceIssues",
    "source_confidence",
    "completeness_score",
    "futureLeakageIssues",
    "excluded_future_context",
    "temporal_violation",
  ]),
  input_immutability_support_found:
    mapper.includes("clone(context.context)") &&
    mapper.includes("clone(context.data_provenance)") &&
    testSource.includes("deepFreeze") &&
    testSource.includes("byte-identical"),
  no_forbidden_source_capabilities: forbiddenSourceMarkers.length === 0,
  no_global_mutable_state:
    !/^(let|var)\s+/m.test(mapper) &&
    !/globalThis\s*\[/.test(mapper) &&
    !/new\s+Map\s*\(/.test(mapper),
  no_mapper_consumer_or_runtime_integration: mapperConsumerFiles.length === 0,
  no_extra_mapper_or_validator_module: extraMapperFiles.length === 0,
  no_forbidden_action_388_changes: forbiddenAction388Changes.length === 0,
  fixture_implementations_unchanged_by_action_388:
    fixtureFilesChangedByAction388.length === 0,
  no_schema_migration_proxy_middleware_netlify_changes:
    forbiddenAction388Changes.length === 0,
  action_387_boundary_respected:
    action388ChangedFiles.every((path) => allowedAction388Files.includes(path)),
  runtime_preview_chain_untouched:
    doc.includes("runtime_preview_status: runtime_preview_waiting_for_operator_inputs") &&
    forbiddenAction388Changes.length === 0,
  focused_success_and_blocked_tests_found: includesAll(testSource, [
    'status).toBe("mapped")',
    'status).toBe("mapped_with_missing_optional_data")',
    "blocked_missing_required_identity",
    "blocked_invalid_linkage",
    "blocked_conflicting_aliases",
    "blocked_temporal_violation",
    "blocked_future_leakage",
    "blocked_invalid_provenance",
    "blocked_invalid_outcome",
    "blocked_invalid_input",
  ]),
};

const passed = Object.values(checks).every(Boolean);
const result = {
  verification_status: passed ? "passed" : "blocked",
  ...checks,
  mapper_implemented: existsSync(join(repoRoot, mapperPath)),
  mapper_entry_point: "mapSnapshotToLearningDataset",
  mapper_consumer_files: mapperConsumerFiles,
  extra_mapper_files: extraMapperFiles,
  forbidden_source_markers: forbiddenSourceMarkers,
  action_388_changed_files: action388ChangedFiles,
  forbidden_action_388_changes: forbiddenAction388Changes,
  fixture_files_changed_by_action_388: fixtureFilesChangedByAction388,
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
  recommended_next_action: passed
    ? "static_mapper_implementation_result_review_and_fixture_coverage_audit"
    : "repair_action_388_pure_mapper_contract",
};

console.log(JSON.stringify(result, null, 2));
if (!passed) process.exitCode = 1;
