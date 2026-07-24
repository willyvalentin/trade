#!/usr/bin/env node

import { execFileSync } from "child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const docPath = "docs/action-355-pattern-insight-static-fixture-implementation-plan.md";

const requiredSections = [
  "## Purpose",
  "## Scope",
  "## Authoritative Dependencies",
  "## Upstream Action Dependencies",
  "## Explicit Non-Goals",
  "## Current Pattern Insight Contract Summary",
  "## Future Fixture Package Boundary",
  "## Allowed Future Implementation Surfaces",
  "## Forbidden Implementation Surfaces",
  "## Fixture Identity Strategy",
  "## Deterministic Timestamp Strategy",
  "## Provenance Strategy",
  "## Source Dataset Reference Strategy",
  "## Sample-Size Representation",
  "## Support-Count Representation",
  "## Outcome Metric Representation",
  "## Uncertainty Representation",
  "## Effect-Strength Representation",
  "## Confidence Representation",
  "## Quality And Readiness Representation",
  "## Segment And Filter Representation",
  "## Missing-Data Semantics",
  "## Unknown-Value Semantics",
  "## Insufficient-Evidence Semantics",
  "## Contradictory-Evidence Semantics",
  "## Stale-Insight Semantics",
  "## Superseded-Insight Semantics",
  "## Anti-Leakage Constraints",
  "## No-Inference Constraints",
  "## No-Live-Mutation Constraints",
  "## Adapter-First Constraints",
  "## No-Parallel-System Constraints",
  "## Deterministic Fixture Construction Rules",
  "## Minimum Fixture Families",
  "## Malformed Fixture Cases",
  "## Boundary Cases",
  "## Validation Strategy",
  "## Testing Strategy",
  "## Phased Future Implementation Sequence",
  "## Acceptance Criteria",
  "## Rejection Criteria",
  "## Blocked Work",
  "## Next Approval Gate Required Before Implementation",
];

const upstreamReferences = [
  "Action 309",
  "Action 331",
  "Action 335",
  "Action 337",
  "Action 343",
  "Action 349",
  "Action 352",
  "Action 353",
  "Action 354",
];

const contractFields = [
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

const futureBoundary = [
  "`lib/pattern-insight-static-fixtures.ts`",
  "optional pure fixture validation helper",
  "focused documentation",
  "focused static tests",
  "hard-coded deterministic Pattern Insight literals",
  "stable fixture ordering",
];

const forbiddenSurfaces = [
  "pattern mining",
  "grouping algorithms",
  "clustering",
  "statistical testing",
  "significance calculation",
  "confidence recalibration",
  "recommendation mutation",
  "ranking mutation",
  "runtime reads",
  "persistence",
  "Supabase reads",
  "Supabase writes",
  "provider calls",
  "news calls",
  "replay execution",
];

const identityRequirements = [
  "fixture ID format: `pi_fixture:<schema_version>:<fixture_family>:<case_slug>`",
  "insight ID format: `pi_insight:<schema_version>:<pattern_dimension>:<segment_key>:<case_slug>`",
  "pattern key format: `<pattern_dimension>/<setup_family>/<segment_key>`",
  "segment key format: stable lowercase tokens joined with `|`",
  "source dataset reference format: `learning_dataset_fixture:<dataset_version>:<window_slug>`",
  "same input -> same fixture output",
  "no random IDs",
];

const deterministicRequirements = [
  "timestamps are fixed strings",
  ["no ", "Date", ".now"].join(""),
  ["no ", "new ", "Date"].join(""),
  ["no ", "Math", ".random"].join(""),
  "no runtime environment reads",
  "object serialization is stable",
  "nested arrays are sorted by stable keys",
];

const semanticRequirements = [
  "missing_data_reasons",
  "Unknown means the system cannot classify the value from the static fixture.",
  "Insufficient evidence must not be promoted into confidence calibration.",
  "Contradictory evidence should represent conflicts between windows, metrics, regimes, or provenance.",
  "Stale insight fixtures should show a source dataset or last observed timestamp that is too old for calibration readiness.",
  "Superseded fixtures should include a static superseded_by reference",
];

const antiLeakageRequirements = [
  "preserve observation-window boundaries",
  "distinguish source recommendation time from outcome time",
  "distinguish dataset window from insight generation time",
  "never embed future outcomes into recommendation-time context",
  "never claim causal inference from correlation",
  "never represent retrospective knowledge as live knowledge",
  "never mutate recommendation confidence",
  "never act as runtime Pattern Discovery output",
];

const noInferenceRequirements = [
  "must not calculate Pattern Insights from Learning Dataset rows",
  "aggregate rows",
  "calculate win rate",
  "calculate expectancy",
  "calculate significance",
  "compare cohorts",
  "rank patterns",
  "infer effects",
  "generate confidence recommendations",
];

const fixtureFamilies = [
  "setup performs better in bullish market regime",
  "setup performs better with sector alignment",
  "setup performs better with positive relative strength",
  "setup performs better when news catalyst is present",
  "setup performs better during trend days",
  "setup performs worse during chop days",
  "setup performs worse against index direction",
  "setup performs worse with weak sector context",
  "setup performs worse near high-impact macro events",
  "setup performs worse when data freshness is low",
  "no meaningful difference detected",
  "small sample with promising direction",
  "sufficient sample but weak effect",
  "conflicting metrics",
  "inconsistent outcome across windows",
  "insufficient sample",
  "partial provenance",
  "stale source dataset",
  "low completeness",
  "unknown segment value",
  "missing optional context",
  "contradictory evidence",
  "superseded insight",
  "invalid temporal range",
  "malformed source reference",
  "not ready",
  "collecting",
  "shadow eligible",
  "review required",
  "calibration candidate",
];

const validationRequirements = [
  "required identity fields",
  "supported categorical values",
  "sample-size bounds",
  "finite numeric metrics",
  "date ordering",
  "dataset window ordering",
  "provenance shape",
  "readiness state",
  "contradictory status combinations",
  "effect direction and magnitude consistency",
  "missing-data semantics",
  "stable serialization",
  "stable ordering",
  "schema version compatibility",
];

const acceptanceCriteria = [
  "fixture implementation remains absent",
  "Pattern Discovery remains absent",
  "statistical inference remains absent",
  "confidence mutation remains blocked",
  "ranking mutation remains blocked",
  "runtime remains blocked",
  "provider/news/Supabase remain blocked",
  "persistence remains blocked",
  "no schema or migration changes are made",
  "next approval gate is required before implementation",
];

const blockedWork = [
  "Pattern Insight fixture implementation is blocked",
  "Pattern Discovery implementation is blocked",
  "confidence calibration is blocked",
  "recommendation reranking is blocked",
  "mapper implementation is blocked",
  "Learning Dataset fixture implementation is blocked",
  "Intelligence Context fixture implementation is blocked",
  "runtime validation is blocked",
  "provider/news/Supabase access is blocked",
  "persistence is blocked",
  "schema and migration work is blocked",
  "replay execution is blocked",
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

const forbiddenImplementationPaths = [
  "lib/pattern-insight-static-fixtures.ts",
];

const action357AuthorizedImplementationFiles = [
  "docs/action-357-pattern-insight-static-fixture-implementation.md",
  "lib/pattern-insight-static-fixtures.ts",
  "scripts/action-357-pattern-insight-static-fixture-implementation-verify.mjs",
  "tests/e2e/action-357-pattern-insight-static-fixture-implementation.spec.ts",
];

const isolatedUnrelatedExecutionFiles = [
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
    if (!exists(relativePath)) return false;
    return read(relativePath).includes(marker);
  });
}

function includesAll(content, phrases) {
  return phrases.every((phrase) => content.includes(phrase));
}

function isForbiddenChangedFile(relativePath) {
  if (isolatedUnrelatedExecutionFiles.includes(relativePath)) return false;
  if (
    action357AuthorizedImplementationFiles.every(exists) &&
    action357AuthorizedImplementationFiles.includes(relativePath)
  ) {
    return false;
  }
  if (relativePath.startsWith("app/")) return true;
  if (relativePath.startsWith("supabase/")) return true;
  if (["proxy.ts", "middleware.ts", "middleware.js", "netlify.toml"].includes(relativePath)) {
    return true;
  }
  if (/^lib\/pattern-insight-static-fixtures\.ts$/.test(relativePath)) return true;
  if (/^lib\/pattern-discovery.*\.ts$/.test(relativePath)) return true;
  if (/^lib\/confidence-calibration.*\.ts$/.test(relativePath)) return true;
  if (/^lib\/snapshot-to-learning-dataset-mapper\.ts$/.test(relativePath)) return true;
  return forbiddenRuntimePaths.includes(relativePath);
}

const planFound = exists(docPath);
const content = planFound ? read(docPath) : "";
const changedFiles = statusFiles();
const forbiddenRuntimeChangedFiles = changedFiles.filter(isForbiddenChangedFile);
const forbiddenRuntimeArtifacts = forbiddenRuntimePaths.filter(exists);
const forbiddenImplementationArtifacts = forbiddenImplementationPaths.filter(exists);
const action357AuthorizedPatternInsightFixtureImplementationPresent =
  action357AuthorizedImplementationFiles.every(exists);
const unauthorizedImplementationArtifacts = forbiddenImplementationArtifacts.filter(
  (relativePath) =>
    relativePath !== "lib/pattern-insight-static-fixtures.ts" ||
    !action357AuthorizedPatternInsightFixtureImplementationPresent,
);
const forbiddenImplementationChangedFiles = changedFiles.filter((relativePath) =>
  isForbiddenChangedFile(relativePath),
);
const forbiddenMarkersFound = [
  "action_307k_proxy_runtime_crash_isolation",
].filter(markerFound);

const requiredSectionsFound = includesAll(content, requiredSections);
const upstreamReferencesFound = includesAll(content, upstreamReferences);
const contractSummaryFound = includesAll(content, contractFields);
const futureBoundaryFound = includesAll(content, futureBoundary);
const forbiddenSurfacesFound = includesAll(content, forbiddenSurfaces);
const identityRequirementsFound = includesAll(content, identityRequirements);
const deterministicRequirementsFound = includesAll(content, deterministicRequirements);
const semanticRequirementsFound = includesAll(content, semanticRequirements);
const antiLeakageFound = includesAll(content, antiLeakageRequirements);
const noInferenceFound = includesAll(content, noInferenceRequirements);
const fixtureFamiliesFound = includesAll(content, fixtureFamilies);
const validationStrategyFound = includesAll(content, validationRequirements);
const acceptanceCriteriaFound = includesAll(content, acceptanceCriteria);
const blockedWorkFound = includesAll(content, blockedWork);
const noImplementationFound = unauthorizedImplementationArtifacts.length === 0;
const runtimeBlocked =
  forbiddenRuntimeChangedFiles.length === 0 &&
  forbiddenRuntimeArtifacts.length === 0 &&
  forbiddenMarkersFound.length === 0;

const passed =
  planFound &&
  requiredSectionsFound &&
  upstreamReferencesFound &&
  contractSummaryFound &&
  futureBoundaryFound &&
  forbiddenSurfacesFound &&
  identityRequirementsFound &&
  deterministicRequirementsFound &&
  semanticRequirementsFound &&
  antiLeakageFound &&
  noInferenceFound &&
  fixtureFamiliesFound &&
  validationStrategyFound &&
  acceptanceCriteriaFound &&
  blockedWorkFound &&
  noImplementationFound &&
  runtimeBlocked;

const result = {
  verification_status: passed ? "passed" : "failed",
  plan_found: planFound,
  required_sections_found: requiredSectionsFound,
  upstream_references_found: upstreamReferencesFound,
  contract_summary_found: contractSummaryFound,
  future_fixture_boundary_found: futureBoundaryFound,
  forbidden_implementation_surfaces_found: forbiddenSurfacesFound,
  deterministic_identity_contract_found: identityRequirementsFound,
  deterministic_timestamp_contract_found: deterministicRequirementsFound,
  missing_unknown_stale_superseded_semantics_found: semanticRequirementsFound,
  anti_leakage_contract_found: antiLeakageFound,
  no_inference_contract_found: noInferenceFound,
  minimum_fixture_families_found: fixtureFamiliesFound,
  validation_strategy_found: validationStrategyFound,
  acceptance_criteria_found: acceptanceCriteriaFound,
  blocked_work_found: blockedWorkFound,
  pattern_insight_fixture_implementation_absent: noImplementationFound,
  action357_authorized_pattern_insight_fixture_implementation_present:
    action357AuthorizedPatternInsightFixtureImplementationPresent,
  pattern_discovery_implementation_absent: noImplementationFound,
  confidence_calibration_implementation_absent: noImplementationFound,
  forbidden_implementation_artifacts_found: forbiddenImplementationArtifacts,
  unauthorized_implementation_artifacts_found: unauthorizedImplementationArtifacts,
  forbidden_implementation_changed_files: forbiddenImplementationChangedFiles,
  runtime_blocked: runtimeBlocked,
  forbidden_runtime_changed_files: forbiddenRuntimeChangedFiles,
  forbidden_runtime_artifacts_found: forbiddenRuntimeArtifacts,
  forbidden_markers_found: forbiddenMarkersFound,
  no_effect_flags: {
    provider_call_executed: false,
    provider_call_attempted: false,
    news_call_executed: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    persistence_executed: false,
    migration_executed: false,
    replay_executed: false,
    synthetic_outcomes_persisted: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    confidence_mutation_executed: false,
    recommendation_rows_mutated: false,
  },
  recommended_next_step: passed
    ? "add_separate_pattern_insight_fixture_implementation_approval_gate_before_code"
    : "fix_static_plan_or_remove_forbidden_runtime_changes",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
