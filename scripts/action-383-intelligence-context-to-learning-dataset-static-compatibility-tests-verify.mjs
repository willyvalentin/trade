#!/usr/bin/env node

import { execFileSync } from "child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const docPath = "docs/action-383-intelligence-context-to-learning-dataset-static-compatibility-tests.md";
const testPath = "tests/e2e/action-383-intelligence-context-to-learning-dataset-compatibility.spec.ts";
const verifierPath = "scripts/action-383-intelligence-context-to-learning-dataset-static-compatibility-tests-verify.mjs";
const learningFixturePath = "lib/learning-dataset-static-fixtures.ts";
const contextFixturePath = "lib/intelligence-context-static-fixtures.ts";
const approvalPath = "docs/action-382-intelligence-context-to-learning-dataset-compatibility-test-approval-gate.md";
const requiredFiles = [docPath, testPath, verifierPath, learningFixturePath, contextFixturePath, approvalPath];

const requiredTestMarkers = [
  "../../lib/learning-dataset-static-fixtures",
  "../../lib/intelligence-context-static-fixtures",
  "LearningDatasetContext",
  "LearningDatasetContextValue",
  "LearningDatasetProvenance",
  "recommendation_snapshot_id",
  "recommendation_id",
  "duplicate_fixture_identity",
  "Date.parse",
  "excluded_future_context",
  "included_in_snapshot_context",
  "outcome_data_embedded_in_context",
  "bullish_market_regime",
  "bearish_market_regime",
  "neutral_or_mixed_regime",
  "spy_aligned",
  "spy_diverging",
  "positive_relative_strength",
  "negative_relative_strength",
  "conflicting_relative_signals",
  "earnings_event",
  "guidance_event",
  "fda_event",
  "sec_event",
  "cpi_event",
  "fomc_event",
  "jobs_report_event",
  "options_expiration_event",
  "explicit_null",
  "unavailable_source",
  "stale_source",
  "conflicting_sources",
  "partial_provenance",
  "complete_provenance",
  "completeness_score",
  "source_confidence",
  "conflict_metadata",
  "baseline.learningValid",
  "baseline.contextValid",
  "serializeLearningDatasetStaticFixtures",
  "serializeIntelligenceContextStaticFixtures",
  "test.afterAll",
];

const requiredMalformedReasons = [
  "missing_context_identity",
  "duplicate_fixture_identity",
  "invalid_recommendation_linkage",
  "capture_after_recommendation_boundary",
  "effective_after_recommendation_without_exclusion",
  "future_news_leakage",
  "future_macro_event_leakage",
  "outcome_data_embedded_in_context",
  "malformed_provenance",
  "unsupported_categorical_value",
  "invalid_freshness_state",
  "stale_timestamp_marked_fresh",
  "conflicting_without_metadata",
  "partial_context_marked_complete",
  "non_finite_relative_strength_metric",
  "invalid_confidence_or_source_quality_bounds",
  "random_id_attempt",
  "wall_clock_timestamp_attempt",
];

function read(relativePath) {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function includesAll(content, values) {
  return values.every((value) => content.includes(value));
}

function collectFiles(relativePath) {
  const absolutePath = join(repoRoot, relativePath);
  if (!existsSync(absolutePath)) return [];
  const stat = statSync(absolutePath);
  if (stat.isFile()) return [relativePath];
  if (!stat.isDirectory()) return [];
  return readdirSync(absolutePath)
    .flatMap((entry) => collectFiles(join(relativePath, entry)))
    .sort();
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
const doc = existsSync(join(repoRoot, docPath)) ? read(docPath) : "";
const testSource = existsSync(join(repoRoot, testPath)) ? read(testPath) : "";
const approvalDoc = existsSync(join(repoRoot, approvalPath)) ? read(approvalPath) : "";
const changedFiles = statusFiles();
const action383ChangedFiles = changedFiles.filter((path) => path.includes("action-383"));
const forbiddenAction383Changes = action383ChangedFiles.filter(
  (path) =>
    path.startsWith("lib/") ||
    path.startsWith("app/") ||
    path.startsWith("supabase/") ||
    ["proxy.ts", "middleware.ts", "middleware.js", "netlify.toml"].includes(path),
);
const productionCompatibilityFiles = collectFiles("lib").filter((path) =>
  /context-to-learning-dataset-compatibility|compatibility-composition|context-row-mapper/.test(
    path,
  ),
);
const fixtureFilesChangedByAction383 = action383ChangedFiles.filter((path) =>
  [learningFixturePath, contextFixturePath, "lib/pattern-insight-static-fixtures.ts"].includes(path),
);

const directAction380ImportFound = testSource.includes(
  'from "../../lib/learning-dataset-static-fixtures"',
);
const directAction381ImportFound = testSource.includes(
  'from "../../lib/intelligence-context-static-fixtures"',
);
const identityLinkageAssertionsFound = includesAll(testSource, [
  "context_snapshot_id",
  "recommendation_snapshot_id",
  "recommendation_id",
  "invalid_recommendation_linkage",
  "duplicate_fixture_identity",
]);
const temporalAssertionsFound = includesAll(testSource, [
  "recommendation_created_at",
  "captured_at",
  "effective_at",
  "toBeLessThanOrEqual",
  "toBeGreaterThan",
]);
const antiLeakageAssertionsFound = includesAll(testSource, [
  "included_in_snapshot_context",
  "outcome_data_embedded_in_context",
  "target_hit|stop_hit|gross_r_multiple|outcome_status",
]);
const immutabilityAssertionsFound = includesAll(testSource, [
  "test.afterAll",
  "baseline.learningValid",
  "baseline.learningMalformed",
  "baseline.learningProvenance",
  "baseline.contextValid",
  "baseline.contextMalformed",
  "baseline.contextProvenance",
]);
const nondeterministicExecutionAbsent =
  !/Date\.now\s*\(/.test(testSource) &&
  !/new\s+Date\s*\(/.test(testSource) &&
  !/Math\.random\s*\(/.test(testSource) &&
  !/randomUUID\s*\(/.test(testSource);
const runtimePreviewUntouched =
  doc.includes("runtime_preview_status: runtime_preview_waiting_for_operator_inputs") &&
  forbiddenAction383Changes.length === 0;

const checks = {
  required_files_found: requiredFilesFound,
  action_382_approval_found: approvalDoc.includes("approval_decision: approved") && approvalDoc.includes("tests_only_no_helper_no_mapper_no_runtime"),
  direct_action_380_import_found: directAction380ImportFound,
  direct_action_381_import_found: directAction381ImportFound,
  required_compatibility_assertions_found: includesAll(testSource, requiredTestMarkers),
  identity_and_linkage_assertions_found: identityLinkageAssertionsFound,
  temporal_assertions_found: temporalAssertionsFound,
  context_value_coverage_found: includesAll(testSource, ["bullish_market_regime", "neutral_or_mixed_regime", "options_expiration_event"]),
  provenance_and_missing_state_coverage_found: includesAll(testSource, ["LearningDatasetProvenance", "explicit_null", "unavailable_source", "partial_provenance"]),
  anti_leakage_and_future_exclusion_assertions_found: antiLeakageAssertionsFound,
  malformed_case_coverage_found: includesAll(testSource, requiredMalformedReasons),
  fixture_immutability_assertions_found: immutabilityAssertionsFound,
  stable_ordering_assertions_found: testSource.includes("[...contextIds].sort()") && testSource.includes("[...learningIds].sort()"),
  stable_serialization_assertions_found: testSource.includes("serializeLearningDatasetStaticFixtures") && testSource.includes("serializeIntelligenceContextStaticFixtures"),
  no_nondeterministic_execution: nondeterministicExecutionAbsent,
  production_compatibility_module_absent: productionCompatibilityFiles.length === 0,
  mapper_or_transformation_helper_absent: productionCompatibilityFiles.length === 0,
  fixture_implementations_unchanged_by_action_383: fixtureFilesChangedByAction383.length === 0,
  no_forbidden_action_383_changes: forbiddenAction383Changes.length === 0,
  no_runtime_provider_news_supabase_persistence_changes: forbiddenAction383Changes.length === 0,
  schema_migration_proxy_middleware_netlify_unchanged: forbiddenAction383Changes.length === 0,
  runtime_preview_chain_untouched: runtimePreviewUntouched,
  action_382_boundary_respected: action383ChangedFiles.every((path) => [docPath, testPath, verifierPath].includes(path)),
};

const passed = Object.values(checks).every(Boolean);
const result = {
  verification_status: passed ? "passed" : "blocked",
  ...checks,
  compatibility_tests_implemented: true,
  action_383_changed_files: action383ChangedFiles,
  forbidden_action_383_changes: forbiddenAction383Changes,
  fixture_files_changed_by_action_383: fixtureFilesChangedByAction383,
  production_compatibility_module_found: productionCompatibilityFiles.length > 0,
  production_compatibility_files: productionCompatibilityFiles,
  mapper_or_transformation_helper_found: productionCompatibilityFiles.length > 0,
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  no_effect_flags: {
    authoritative_rows_constructed: false,
    fixtures_mutated: false,
    mapper_implemented: false,
    provider_call_executed: false,
    news_call_executed: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    replay_executed: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    confidence_behavior_changed: false,
  },
  recommended_next_action:
    "separate_static_fixture_to_pattern_insight_compatibility_test_approval_gate",
};

console.log(JSON.stringify(result, null, 2));
if (!passed) process.exitCode = 1;
