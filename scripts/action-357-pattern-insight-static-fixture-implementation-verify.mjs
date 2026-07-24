#!/usr/bin/env node

import { execFileSync } from "child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const docPath = "docs/action-357-pattern-insight-static-fixture-implementation.md";
const fixturePath = "lib/pattern-insight-static-fixtures.ts";
const testPath = "tests/e2e/action-357-pattern-insight-static-fixture-implementation.spec.ts";
const verifierPath = "scripts/action-357-pattern-insight-static-fixture-implementation-verify.mjs";

const requiredFiles = [docPath, fixturePath, testPath, verifierPath];

const requiredCoverageTags = [
  "coverage:positive:bullish_market_regime_alignment",
  "coverage:positive:sector_alignment",
  "coverage:positive:positive_relative_strength",
  "coverage:positive:news_catalyst_present",
  "coverage:positive:trend_day_alignment",
  "coverage:negative:chop_day_weakness",
  "coverage:negative:index_divergence",
  "coverage:negative:weak_sector_context",
  "coverage:negative:high_impact_macro_event_proximity",
  "coverage:negative:low_freshness_context",
  "coverage:neutral:no_meaningful_difference",
  "coverage:weak:promising_direction_with_small_sample",
  "coverage:weak:sufficient_sample_with_weak_effect",
  "coverage:weak:conflicting_metrics",
  "coverage:weak:inconsistent_outcomes_across_windows",
  "coverage:quality:insufficient_sample",
  "coverage:quality:partial_provenance",
  "coverage:quality:stale_source_dataset",
  "coverage:quality:low_completeness",
  "coverage:quality:unknown_segment_value",
  "coverage:quality:missing_optional_context",
  "coverage:quality:contradictory_evidence",
  "coverage:quality:superseded_insight",
  "readiness:not_ready",
  "readiness:collecting",
  "readiness:shadow_eligible",
  "readiness:review_required",
  "readiness:calibration_candidate",
];

const requiredMalformedReasons = [
  "missing_identity",
  "duplicate_identity",
  "invalid_pattern_key",
  "invalid_segment_key",
  "malformed_source_reference",
  "non_finite_numeric_metric",
  "negative_sample_size",
  "support_count_greater_than_sample_size",
  "invalid_timestamp_ordering",
  "invalid_dataset_window",
  "contradictory_effect_fields",
  "unsupported_readiness_state",
  "unsupported_evidence_quality_state",
  "missing_required_provenance",
  "unstable_ordering_attempt",
  "wall_clock_timestamp_attempt",
  "random_id_attempt",
];

const requiredContractFields = [
  "insight_id",
  "insight_version",
  "generated_from_dataset_version",
  "generated_at_label",
  "pattern_dimension",
  "segment_key",
  "segment_description",
  "sample_size",
  "minimum_sample_requirement",
  "sample_window",
  "setup_family",
  "trading_window",
  "market_regime",
  "sector",
  "industry",
  "relative_strength_profile",
  "catalyst_type",
  "confidence_bucket",
  "outcome_summary",
  "confidence_summary",
  "effect_direction",
  "evidence_strength",
  "stability_score",
  "overfitting_risk",
  "data_quality_notes",
  "anti_leakage_status",
  "recommended_action_type",
  "mutation_allowed",
  "blocked_reason",
  "review_status",
];

const forbiddenFixtureSourceMarkers = [
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
  "from \"node:fs\"",
  "from 'node:fs'",
  "from \"../app",
  "@/lib/provider",
  "@/lib/news",
  "@/lib/scanner",
  "@/lib/ranking",
  "@/lib/broker",
  "@/lib/execution",
  "writeFile",
  "readFile",
  ".sort(",
  ".reduce(",
];

const forbiddenRuntimePaths = [
  "app/api/hb307c",
  "app/api/ping307h",
  "app/api/route-publication-diagnostic",
  "app/route-publication-probe",
  "app/public-probe-307g",
  "app/ping307h",
  "public/ping307i.txt",
  "public/ping307i.json",
  "public/ping307j.html",
  "public/action-307l-runtime-boundary-status.json",
];

const allowedAction357Files = [
  docPath,
  fixturePath,
  testPath,
  verifierPath,
  "scripts/action-318-static-replay-batch-commit-readiness-verify.mjs",
  "scripts/action-319-static-replay-batch-post-commit-verify.mjs",
  "scripts/action-320-static-replay-branch-package-verify.mjs",
  "scripts/action-355-pattern-insight-static-fixture-implementation-plan-verify.mjs",
  "scripts/action-356-pattern-insight-static-fixture-implementation-approval-gate-verify.mjs",
  "tests/e2e/action-355-pattern-insight-static-fixture-implementation-plan.spec.ts",
  "tests/e2e/action-356-pattern-insight-static-fixture-implementation-approval-gate.spec.ts",
];

const isolatedUnrelatedStaticFiles = [
  "docs/post-trade-source-controlled-staging-execution-function-implementation-no-execution.md",
  "docs/post-trade-source-controlled-staging-execution-function-static-security-review-no-execution.md",
  "lib/post-trade-staging-execution-function.ts",
  "tests/e2e/post-trade-staging-execution-function-static.spec.ts",
];

const markerRootPaths = ["app", "public"];
const markerFilePaths = ["proxy.ts", "middleware.ts", "middleware.js", "netlify.toml"];

function exists(relativePath) {
  return existsSync(join(repoRoot, relativePath));
}

function read(relativePath) {
  return readFileSync(join(repoRoot, relativePath), "utf8");
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
  const output = execFileSync("git", ["status", "--short"], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  if (!output) return [];

  return output
    .trimEnd()
    .split("\n")
    .map((line) => line.slice(3).trim())
    .map((path) => (path.includes(" -> ") ? path.split(" -> ").at(-1) ?? path : path))
    .sort();
}

function markerFound(marker) {
  const files = [
    ...markerFilePaths,
    ...markerRootPaths.flatMap((relativePath) => collectFiles(relativePath)),
  ];

  return files.some((relativePath) => {
    const absolutePath = join(repoRoot, relativePath);
    if (!existsSync(absolutePath)) return false;
    return readFileSync(absolutePath, "utf8").includes(marker);
  });
}

function includesAll(content, expectedItems) {
  return expectedItems.every((item) => content.includes(item));
}

function isAllowedChangedFile(relativePath) {
  if (relativePath.startsWith("docs/")) return true;
  if (/^scripts\/action-\d+.*\.mjs$/.test(relativePath)) return true;
  if (/^tests\/e2e\/action-\d+.*\.spec\.ts$/.test(relativePath)) return true;
  if (isolatedUnrelatedStaticFiles.includes(relativePath)) return true;
  return allowedAction357Files.includes(relativePath);
}

function isForbiddenChangedFile(relativePath) {
  if (isAllowedChangedFile(relativePath)) return false;
  if (relativePath.startsWith("app/")) return true;
  if (relativePath.startsWith("supabase/")) return true;
  if (["proxy.ts", "middleware.ts", "middleware.js", "netlify.toml"].includes(relativePath)) {
    return true;
  }
  if (relativePath.includes("provider") && !relativePath.startsWith("docs/")) return true;
  if (relativePath.includes("scanner") && !relativePath.startsWith("docs/")) return true;
  if (relativePath.includes("ranking") && !relativePath.startsWith("docs/")) return true;
  if (relativePath.includes("broker") && !relativePath.startsWith("docs/")) return true;
  if (relativePath.includes("execution") && !relativePath.startsWith("docs/")) return true;
  return forbiddenRuntimePaths.includes(relativePath);
}

const fixtureSource = exists(fixturePath) ? read(fixturePath) : "";
const docSource = exists(docPath) ? read(docPath) : "";
const changedFiles = statusFiles();

const requiredFilesMissing = requiredFiles.filter((relativePath) => !exists(relativePath));
const contractFieldsFound = includesAll(fixtureSource, requiredContractFields);
const coverageFound = includesAll(fixtureSource, requiredCoverageTags);
const malformedCoverageFound = includesAll(fixtureSource, requiredMalformedReasons);
const staticContractReferenceFound = fixtureSource.includes(
  "ACTION_343_PATTERN_INSIGHT_CONTRACT_REFERENCE",
);
const noDuplicateInterfaceFound =
  !fixtureSource.includes("interface PatternInsight") &&
  !fixtureSource.includes("interface Action343PatternInsight");
const fixtureSourceForbiddenMarkersFound = forbiddenFixtureSourceMarkers.filter((marker) =>
  fixtureSource.includes(marker),
);
const validFixtureSource = fixtureSource.split(
  "export const malformedPatternInsightStaticFixtureCases",
)[0];
const insightIds = [...validFixtureSource.matchAll(/insight_id: "(pi_insight:[^"]+)"/g)].map(
  (match) => match[1],
);
const uniqueInsightIds = new Set(insightIds);
const stableInsightOrdering =
  insightIds.length > 0 &&
  insightIds.every((insightId, index) => index === 0 || insightId > insightIds[index - 1]);
const malformedCaseIds = [
  ...fixtureSource.matchAll(/case_id: "(malformed:[^"]+)"/g),
].map((match) => match[1]);
const uniqueMalformedCaseIds = new Set(malformedCaseIds);
const validFixtureCount = insightIds.length;
const malformedCaseCount = malformedCaseIds.length;

const docBoundaryFound = [
  "static_contract_fixtures_only",
  "Pattern Discovery",
  "Learning Dataset aggregation",
  "provider/news/Supabase access remains blocked",
  "replay execution remains blocked",
  "deployment remains blocked",
  "Fixture metrics are fixed literal examples",
].every((item) => docSource.includes(item));

const forbiddenRuntimeChanges = changedFiles.filter(isForbiddenChangedFile);
const forbiddenRuntimeArtifacts = forbiddenRuntimePaths.filter(exists);
const forbiddenMarkersFound = [
  "action_307k_proxy_runtime_crash_isolation",
].filter(markerFound);

const passed =
  requiredFilesMissing.length === 0 &&
  staticContractReferenceFound &&
  noDuplicateInterfaceFound &&
  contractFieldsFound &&
  coverageFound &&
  malformedCoverageFound &&
  fixtureSourceForbiddenMarkersFound.length === 0 &&
  validFixtureCount >= 21 &&
  insightIds.length === uniqueInsightIds.size &&
  stableInsightOrdering &&
  malformedCaseCount >= 17 &&
  malformedCaseIds.length === uniqueMalformedCaseIds.size &&
  docBoundaryFound &&
  forbiddenRuntimeChanges.length === 0 &&
  forbiddenRuntimeArtifacts.length === 0 &&
  forbiddenMarkersFound.length === 0;

const result = {
  verification_status: passed ? "passed" : "failed",
  required_files_found: requiredFilesMissing.length === 0,
  required_files_missing: requiredFilesMissing,
  static_fixture_module_found: exists(fixturePath),
  implementation_doc_found: exists(docPath),
  focused_test_found: exists(testPath),
  action_343_contract_reference_found: staticContractReferenceFound,
  duplicate_pattern_insight_interface_absent: noDuplicateInterfaceFound,
  contract_fields_found: contractFieldsFound,
  positive_negative_neutral_quality_readiness_coverage_found: coverageFound,
  malformed_boundary_coverage_found: malformedCoverageFound,
  fixture_source_forbidden_markers_found: fixtureSourceForbiddenMarkersFound,
  valid_fixture_count: validFixtureCount,
  malformed_case_count: malformedCaseCount,
  fixture_ids_unique: insightIds.length === uniqueInsightIds.size,
  fixture_ids_stably_ordered: stableInsightOrdering,
  malformed_case_ids_unique: malformedCaseIds.length === uniqueMalformedCaseIds.size,
  doc_static_boundary_found: docBoundaryFound,
  runtime_route_changes_allowed: false,
  provider_call_allowed: false,
  news_call_allowed: false,
  supabase_read_allowed: false,
  supabase_write_allowed: false,
  replay_execution_allowed: false,
  scanner_ranking_mutation_allowed: false,
  confidence_mutation_allowed: false,
  persistence_allowed: false,
  deployment_allowed: false,
  forbidden_runtime_changes_detected:
    forbiddenRuntimeChanges.length > 0 || forbiddenRuntimeArtifacts.length > 0,
  forbidden_runtime_changed_files: forbiddenRuntimeChanges,
  forbidden_runtime_artifacts_found: forbiddenRuntimeArtifacts,
  forbidden_markers_found: forbiddenMarkersFound,
  no_effect_flags: {
    provider_call_executed: false,
    provider_call_attempted: false,
    news_call_executed: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    candles_persisted: false,
    raw_response_persisted: false,
    fetch_run_persisted: false,
    synthetic_outcomes_persisted: false,
    replay_executed: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    confidence_mutation_executed: false,
    recommendation_rows_mutated: false,
  },
  recommended_next_step: passed
    ? "use_static_pattern_insight_fixtures_only_for_future_static_adapter_tests"
    : "fix_action_357_static_fixture_package_before_continuing",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
