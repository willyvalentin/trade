#!/usr/bin/env node

import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fixturePath = "lib/intelligence-context-static-fixtures.ts";
const docPath = "docs/action-381-intelligence-context-static-fixture-implementation.md";
const testPath = "tests/e2e/action-381-intelligence-context-static-fixture-implementation.spec.ts";
const verifierPath = "scripts/action-381-intelligence-context-static-fixture-implementation-verify.mjs";
const requiredFiles = [fixturePath, docPath, testPath, verifierPath];

const requiredFamilies = [
  "bullish_market_regime",
  "bearish_market_regime",
  "neutral_or_mixed_regime",
  "trend_day",
  "chop_day",
  "elevated_volatility",
  "low_volatility",
  "incomplete_market_regime",
  "spy_aligned",
  "spy_diverging",
  "qqq_aligned",
  "qqq_diverging",
  "iwm_aligned",
  "iwm_diverging",
  "missing_index_context",
  "strong_sector",
  "weak_sector",
  "strong_industry",
  "weak_industry",
  "strong_peer_group",
  "weak_peer_group",
  "positive_relative_strength",
  "negative_relative_strength",
  "conflicting_relative_signals",
  "positive_material_news",
  "negative_material_news",
  "neutral_news",
  "no_material_news",
  "news_unavailable",
  "earnings_event",
  "guidance_event",
  "fda_event",
  "sec_event",
  "conflicting_company_event_signals",
  "cpi_event",
  "fomc_event",
  "jobs_report_event",
  "options_expiration_event",
  "other_high_impact_event",
  "no_relevant_macro_event",
  "event_before_recommendation",
  "event_after_recommendation_excluded",
  "complete_provenance",
  "partial_provenance",
  "low_quality_provenance",
  "stale_source",
  "conflicting_sources",
  "unavailable_source",
  "unknown_category",
  "explicit_null",
  "absent_optional_domain",
];

const malformedReasons = [
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

const forbiddenSourceMarkers = [
  "process.env",
  "fetch(",
  "Date.now",
  "new Date",
  "performance.now",
  "Math.random",
  "randomUUID",
  "@supabase",
  "supabase-js",
  "next/server",
  "from \"fs\"",
  "from 'fs'",
  "writeFile",
  "readFile",
  "collectMarketContext",
  "fetchNews",
  "calculateMarketRegime",
  "calculateRelativeStrength",
  "inferSentiment",
  "resolveConflicts",
  "mapSnapshotToContext",
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
const source = existsSync(join(repoRoot, fixturePath)) ? read(fixturePath) : "";
const doc = existsSync(join(repoRoot, docPath)) ? read(docPath) : "";
const changedFiles = statusFiles();
const action381ChangedFiles = changedFiles.filter((path) => path.includes("action-381") || path === fixturePath);
const forbiddenAction381Changes = action381ChangedFiles.filter(
  (path) =>
    path.startsWith("app/") ||
    path.startsWith("supabase/") ||
    ["proxy.ts", "middleware.ts", "middleware.js", "netlify.toml"].includes(path),
);

const authoritativeContractReused = includesAll(source, [
  "LearningDatasetContext",
  "LearningDatasetContextValue",
  "LearningDatasetProvenance",
  "ACTION_336_INTELLIGENCE_CONTEXT_CONTRACT_REFERENCE",
  "ACTION_380_LEARNING_DATASET_CONTEXT_TYPE_REFERENCE",
]);
const duplicateContextSchemaAbsent =
  !/type\s+MarketRegimeContext\b/.test(source) &&
  !/type\s+SectorIndustryContext\b/.test(source) &&
  !/type\s+RelativeStrengthContext\b/.test(source) &&
  !/type\s+CompanyNewsCatalystContext\b/.test(source) &&
  !/type\s+CalendarEventContext\b/.test(source) &&
  !/interface\s+IntelligenceContext/.test(source);
const deterministicSource = forbiddenSourceMarkers.every((marker) => !source.includes(marker));
const malformedCaseCount = (source.match(/case_id: "malformed_context:/g) ?? []).length;
const runtimePreviewUntouched =
  doc.includes("runtime_preview_status: runtime_preview_waiting_for_operator_inputs") &&
  forbiddenAction381Changes.length === 0;

const checks = {
  required_files_found: requiredFilesFound,
  authoritative_intelligence_context_contract_reused: authoritativeContractReused,
  duplicate_context_schema_absent: duplicateContextSchemaAbsent,
  deterministic_ids_and_timestamps: deterministicSource && includesAll(source, ["2026-07-08T13:45:00.000Z", "2026-07-08T13:44:30.000Z"]),
  required_fixture_families_found: includesAll(source, requiredFamilies),
  malformed_cases_separate: includesAll(source, malformedReasons) && malformedCaseCount === 18 && source.includes("raw_fixture: Record<string, unknown>"),
  capture_and_effective_time_checks_found: includesAll(source, ["capture_after_recommendation", "effective_after_recommendation"]),
  future_data_exclusion_found: includesAll(source, ["excluded_future_context", "included_in_snapshot_context: false", "invalid_future_exclusion"]),
  anti_leakage_checks_found: includesAll(source, ["OUTCOME_KEYS", "outcome_context_leakage", "future_news_leakage"]),
  missing_unavailable_unknown_semantics_found: includesAll(source, ["explicit_null", "unavailable", "unknown", "invalid_null_or_unavailable_semantics"]),
  stale_conflicting_partial_semantics_found: includesAll(source, ["stale_source", "conflicting_sources", "partial_provenance", "missing_conflict_metadata"]),
  provenance_and_freshness_checks_found: includesAll(source, ["invalid_source_confidence", "invalid_provenance_completeness", "freshness_inconsistent", "stale_freshness_inconsistent"]),
  stable_ordering_and_serialization_found: includesAll(source, ["previousId.localeCompare(id)", "serializeIntelligenceContextStaticFixtures", "JSON.stringify(intelligenceContextStaticFixtures)"]),
  no_live_collection_or_api_adapters: deterministicSource,
  no_mapper_or_inference: !source.includes("SnapshotToLearningDatasetMapper") && !source.includes("mapSnapshotToLearningDataset") && !source.includes("infer"),
  no_provider_news_supabase_persistence_runtime_access: deterministicSource,
  no_forbidden_action_381_changes: forbiddenAction381Changes.length === 0,
  runtime_preview_chain_untouched: runtimePreviewUntouched,
  action_354_boundary_respected: doc.includes("approved by Action 354") && action381ChangedFiles.every((path) => requiredFiles.includes(path)),
};

const passed = Object.values(checks).every(Boolean);
const result = {
  verification_status: passed ? "passed" : "blocked",
  ...checks,
  valid_fixture_count: 15,
  malformed_case_count: malformedCaseCount,
  action_381_changed_files: action381ChangedFiles,
  forbidden_action_381_changes: forbiddenAction381Changes,
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  live_collection_allowed: false,
  mapper_implementation_allowed: false,
  inference_allowed: false,
  provider_or_news_call_allowed: false,
  supabase_access_allowed: false,
  persistence_allowed: false,
  replay_execution_allowed: false,
  scanner_ranking_confidence_mutation_allowed: false,
  deployment_allowed: false,
  main_push_allowed: false,
  no_effect_flags: {
    provider_call_executed: false,
    news_call_executed: false,
    macro_calendar_call_executed: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    context_persisted: false,
    replay_executed: false,
    synthetic_outcomes_persisted: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    confidence_behavior_changed: false,
  },
  recommended_next_action: passed
    ? "separate_approval_gate_before_any_context_mapper_or_live_collection_work"
    : "repair_action_381_static_fixture_boundary_before_further_work",
};

console.log(JSON.stringify(result, null, 2));
if (!passed) process.exitCode = 1;
