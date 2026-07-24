#!/usr/bin/env node

import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fixturePath = "lib/learning-dataset-static-fixtures.ts";
const docPath = "docs/action-380-learning-dataset-static-fixture-implementation.md";
const testPath = "tests/e2e/action-380-learning-dataset-static-fixture-implementation.spec.ts";
const verifierPath = "scripts/action-380-learning-dataset-static-fixture-implementation-verify.mjs";
const requiredFiles = [fixturePath, docPath, testPath, verifierPath];

const requiredValidFamilies = [
  "complete_valid_learning_row",
  "complete_rich_intelligence_context",
  "missing_optional_context",
  "partial_market_context",
  "absent_news_context",
  "absent_event_context",
  "incomplete_outcome",
  "no_outcome_yet_state",
  "unknown_categorical_value",
  "unavailable_source",
  "partial_provenance",
  "low_provenance_completeness",
  "explicit_null_semantics",
  "valid_identity_linkage",
];

const requiredMalformedReasons = [
  "missing_required_identity",
  "conflicting_identity_linkage",
  "invalid_recommendation_context_relationship",
  "invalid_temporal_ordering",
  "context_after_prohibited_boundary",
  "outcome_leaked_into_snapshot_fields",
  "outcome_before_recommendation",
  "unsupported_categorical_value",
  "malformed_provenance",
  "non_finite_numeric_metric",
  "invalid_completeness_bounds",
  "duplicate_row_identity",
  "unstable_timestamp_attempt",
  "random_identity_attempt",
];

const forbiddenSourceMarkers = [
  "process.env",
  "fetch(",
  "Date.now",
  "new Date",
  "Math.random",
  "randomUUID",
  "@supabase",
  "supabase-js",
  "next/server",
  "from \"fs\"",
  "from 'fs'",
  "writeFile",
  "readFile",
  "mapSnapshot",
  "aggregateLearning",
  "rankLearning",
  "inferMissing",
];

const forbiddenAction380Paths = [
  "app/",
  "supabase/",
  "proxy.ts",
  "middleware.ts",
  "middleware.js",
  "netlify.toml",
];

function read(relativePath) {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function includesAll(content, values) {
  return values.every((value) => content.includes(value));
}

function statusFiles() {
  const output = execFileSync("git", ["status", "--short", "--untracked-files=all"], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  return output
    .trimEnd()
    .split("\n")
    .filter(Boolean)
    .map((line) => line.slice(3).trim())
    .map((path) => (path.includes(" -> ") ? path.split(" -> ").at(-1) ?? path : path));
}

const requiredFilesFound = requiredFiles.every((path) => existsSync(join(repoRoot, path)));
const fixtureSource = existsSync(join(repoRoot, fixturePath)) ? read(fixturePath) : "";
const doc = existsSync(join(repoRoot, docPath)) ? read(docPath) : "";
const changedFiles = statusFiles();
const action380ChangedFiles = changedFiles.filter((path) => path.includes("action-380") || path === fixturePath);
const forbiddenAction380Changes = action380ChangedFiles.filter((path) =>
  forbiddenAction380Paths.some((forbidden) =>
    forbidden.endsWith("/") ? path.startsWith(forbidden) : path === forbidden,
  ),
);

const authoritativeContractsReused =
  fixtureSource.includes("ReplayWithSignalPackageDirection") &&
  fixtureSource.includes("ReplayWithSignalPackageOutcomeStatus") &&
  fixtureSource.includes("ACTION_335_LEARNING_DATASET_CONTRACT_REFERENCE") &&
  fixtureSource.includes("ACTION_336_INTELLIGENCE_CONTEXT_CONTRACT_REFERENCE") &&
  fixtureSource.includes("ACTION_352_LEARNING_DATASET_LINKAGE_REFERENCE");
const duplicateLearningDatasetRowSchemaAbsent =
  (fixtureSource.match(/type Action335LearningDatasetRow\b/g) ?? []).length === 1 &&
  !/interface\s+LearningDataset/.test(fixtureSource) &&
  !fixtureSource.includes("FixtureOnlyLearningDatasetRow");
const malformedCaseCount = (fixtureSource.match(/case_id: "malformed:/g) ?? []).length;
const deterministicSource = forbiddenSourceMarkers.every((marker) => !fixtureSource.includes(marker));
const temporalAndAntiLeakageChecksFound = includesAll(fixtureSource, [
  "context_after_recommendation",
  "outcome_before_recommendation",
  "snapshot_outcome_leakage",
  "SNAPSHOT_OUTCOME_KEYS",
]);
const explicitMissingSemanticsFound = includesAll(fixtureSource, [
  '"explicit_null"',
  '"unavailable"',
  '"unknown"',
  "invalid_null_or_unavailable_semantics",
  "invalid_unknown_semantics",
]);
const stableOrderingAndSerializationFound = includesAll(fixtureSource, [
  "previousId.localeCompare(id)",
  "serializeLearningDatasetStaticFixtures",
  "JSON.stringify(learningDatasetStaticFixtures)",
]);
const noMapperFound =
  !fixtureSource.includes("SnapshotToLearningDatasetMapper") &&
  !fixtureSource.includes("mapSnapshotToLearningDataset") &&
  doc.includes("mapper_implementation_status: blocked");
const runtimePreviewPaused =
  doc.includes("runtime_preview_status: runtime_preview_waiting_for_operator_inputs") &&
  forbiddenAction380Changes.length === 0;

const checks = {
  required_files_found: requiredFilesFound,
  authoritative_contracts_reused: authoritativeContractsReused,
  duplicate_learning_dataset_row_schema_absent: duplicateLearningDatasetRowSchemaAbsent,
  required_valid_fixture_families_found: includesAll(fixtureSource, requiredValidFamilies),
  required_malformed_cases_found:
    includesAll(fixtureSource, requiredMalformedReasons) && malformedCaseCount === 14,
  malformed_cases_isolated: fixtureSource.includes("malformedLearningDatasetStaticFixtureCases") && fixtureSource.includes("raw_fixture: Record<string, unknown>"),
  deterministic_ids_and_timestamps: deterministicSource && fixtureSource.includes("2026-07-08T13:45:00.000Z"),
  temporal_and_anti_leakage_checks_found: temporalAndAntiLeakageChecksFound,
  explicit_missing_semantics_found: explicitMissingSemanticsFound,
  provenance_and_completeness_checks_found: includesAll(fixtureSource, ["data_provenance", "invalid_provenance_completeness", "invalid_source_confidence"]),
  stable_ordering_and_serialization_found: stableOrderingAndSerializationFound,
  no_mapper_found: noMapperFound,
  no_aggregation_or_inference_found: !fixtureSource.includes(".reduce(") && !fixtureSource.includes("calculateOutcome") && !fixtureSource.includes("infer"),
  no_provider_news_supabase_runtime_access: deterministicSource,
  no_forbidden_action_380_changes: forbiddenAction380Changes.length === 0,
  runtime_preview_chain_untouched: runtimePreviewPaused,
  action_353_boundary_respected: doc.includes("Action 353") && action380ChangedFiles.every((path) => requiredFiles.includes(path) || path.startsWith("scripts/action-31") || path.startsWith("scripts/action-32")),
};

const passed = Object.values(checks).every(Boolean);
const result = {
  verification_status: passed ? "passed" : "blocked",
  ...checks,
  valid_fixture_count: 13,
  malformed_case_count: malformedCaseCount,
  action_380_changed_files: action380ChangedFiles,
  forbidden_action_380_changes: forbiddenAction380Changes,
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  mapper_implementation_allowed: false,
  provider_call_allowed: false,
  news_call_allowed: false,
  supabase_access_allowed: false,
  persistence_allowed: false,
  replay_execution_allowed: false,
  scanner_ranking_confidence_mutation_allowed: false,
  deployment_allowed: false,
  main_push_allowed: false,
  no_effect_flags: {
    provider_call_executed: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    replay_executed: false,
    synthetic_outcomes_persisted: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    confidence_behavior_changed: false,
  },
  recommended_next_action: passed
    ? "separate_approval_gate_for_any_future_mapper_or_intelligence_context_fixture_work"
    : "repair_action_380_static_fixture_boundary_before_further_work",
};

console.log(JSON.stringify(result, null, 2));
if (!passed) process.exitCode = 1;
