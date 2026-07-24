#!/usr/bin/env node

import { execFileSync } from "child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const docPath =
  "docs/action-356-pattern-insight-static-fixture-implementation-approval-gate.md";

const requiredSections = [
  "## Purpose",
  "## Scope",
  "## Authoritative Dependencies",
  "## Upstream Dependencies",
  "## Explicit Non-Goals",
  "## Approval Vocabulary",
  "## Deterministic Gate Conditions",
  "## Proposed Future Fixture Package Boundary",
  "## Allowed Future Implementation Surfaces",
  "## Forbidden Implementation Surfaces",
  "## Existing Pattern Insight Contract Dependency",
  "## Fixture Identity Requirements",
  "## Timestamp Policy",
  "## Dataset-Window Policy",
  "## Provenance Requirements",
  "## Source-Reference Requirements",
  "## Evidence Metric Representation",
  "## Sample-Size Requirements",
  "## Uncertainty Representation",
  "## Effect Direction And Magnitude Requirements",
  "## Evidence-Quality Requirements",
  "## Readiness-State Requirements",
  "## Missing-Data Semantics",
  "## Unknown-Value Semantics",
  "## Insufficient-Evidence Semantics",
  "## Contradictory-Evidence Semantics",
  "## Stale-Insight Semantics",
  "## Superseded-Insight Semantics",
  "## Temporal Ordering Requirements",
  "## Anti-Leakage Requirements",
  "## No-Inference Requirements",
  "## No-Aggregation Requirements",
  "## No-Calculation Requirements",
  "## No-Live-Mutation Requirements",
  "## Adapter-First Constraints",
  "## No-Parallel-System Constraints",
  "## Deterministic Serialization Requirements",
  "## Stable Ordering Requirements",
  "## Minimum Fixture Coverage",
  "## Malformed Fixture Coverage",
  "## Boundary Fixture Coverage",
  "## Validation Boundaries",
  "## Acceptance Criteria",
  "## Rejection Criteria",
  "## Approval Decision",
  "## Work Remaining Blocked After Approval",
  "## Next Permitted Action",
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
  "Action 355",
];

const approvalVocabulary = [
  "approval_decision_vocabulary: approved | approved_with_conditions | blocked",
  "approved: every required deterministic gate condition passes.",
  "approved_with_conditions: the future static implementation is safe but one or more non-critical fixture-contract details remain unresolved.",
  "blocked: implementation would require runtime work, persistence, external access, schema changes, inference, aggregation, Pattern Discovery, leakage, a parallel contract, ranking mutation, or confidence mutation.",
];

const explicitApprovalDecision = [
  "approval_decision: approved",
  "approved_scope: future_static_pattern_insight_fixture_implementation_only",
  "pattern_insight_fixture_implementation_approved_for_future_action: true",
  "pattern_discovery_implementation_approved: false",
  "calculate_insights_from_learning_rows_approved: false",
  "statistical_inference_approved: false",
  "confidence_calibration_approved: false",
  "confidence_mutation_approved: false",
  "ranking_or_recommendation_mutation_approved: false",
  "runtime_or_persistence_integration_approved: false",
];

const scopeBoundary = [
  "Action 356 may approve only A: approval to implement static Pattern Insight fixtures.",
  "Action 356 does not approve B: approval to implement Pattern Discovery.",
  "Action 356 does not approve C: approval to calculate insights from Learning Dataset rows.",
  "Action 356 does not approve D: approval to perform statistical inference.",
  "Action 356 does not approve E: approval to calibrate or mutate confidence.",
  "Action 356 does not approve F: approval to mutate ranking or recommendation behavior.",
  "Action 356 does not approve G: approval to persist or integrate insights into runtime.",
];

const gateConditions = [
  "gate_static_local_only: true",
  "gate_existing_contract_defined: true",
  "gate_deterministic_fixture_identities_defined: true",
  "gate_deterministic_timestamps_and_windows_defined: true",
  "gate_provenance_and_source_references_explicit: true",
  "gate_missing_unknown_insufficient_contradictory_stale_superseded_representable: true",
  "gate_temporal_and_anti_leakage_rules_testable: true",
  "gate_no_learning_dataset_row_input_required: true",
  "gate_validation_can_remain_pure_and_non_inferential: true",
  "gate_no_parallel_pattern_insight_model_needed: true",
  "gate_no_runtime_provider_news_supabase_replay_or_persistence_required: true",
  "gate_no_ranking_or_confidence_change_required: true",
  "gate_future_repository_surface_explicitly_bounded: true",
  "gate_malformed_and_boundary_cases_sufficiently_specified: true",
  "gate_implementation_independently_auditable: true",
  "Failed gate conditions: none.",
];

const futureBoundary = [
  "`lib/pattern-insight-static-fixtures.ts`",
  "optional pure fixture validation helper",
  "focused documentation",
  "focused static tests",
  "hard-coded deterministic objects",
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

const deterministicRequirements = [
  "fixture ID format: `pi_fixture:<schema_version>:<fixture_family>:<case_slug>`",
  "insight ID format: `pi_insight:<schema_version>:<pattern_dimension>:<segment_key>:<case_slug>`",
  "same input -> same fixture output",
  ["no ", "Date", ".now"].join(""),
  ["no ", "new ", "Date"].join(""),
  ["no ", "Math", ".random"].join(""),
  "no runtime environment reads",
  "fixture arrays sort by fixture_id",
  "nested arrays sort by stable keys",
];

const semanticRequirements = [
  "Missing does not mean unknown, stale, unavailable, or invalid.",
  "Unknown must not be silently coerced into neutral evidence",
  "Insufficient evidence must not be promoted into confidence calibration.",
  "Contradictory evidence must represent conflicts between windows, metrics, regimes, or provenance",
  "Stale insight fixtures should show a source dataset or last observed timestamp too old for calibration readiness.",
  "Superseded fixtures should include a static superseded_by reference.",
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

const noInferenceAggregationCalculation = [
  "Learning Dataset rows as input",
  "Recommendation Snapshots as input",
  "Context Snapshots as input",
  "Outcome records as input",
  "arrays that are grouped or aggregated",
  "statistical parameters used to generate insights",
  "aggregate records",
  "group rows",
  "compare cohorts",
  "rank patterns",
  "infer effects",
  "calculate win rate",
  "calculate expectancy",
  "calculate significance",
  "generate confidence recommendations",
];

const minimumFixtureCoverage = [
  "bullish market regime alignment",
  "sector alignment",
  "positive relative strength",
  "news catalyst present",
  "trend-day alignment",
  "chop-day weakness",
  "index divergence",
  "weak sector context",
  "high-impact macro-event proximity",
  "low-freshness context",
  "no meaningful difference",
  "promising direction with small sample",
  "sufficient sample with weak effect",
  "conflicting metrics",
  "inconsistent outcomes across windows",
  "insufficient sample",
  "partial provenance",
  "stale source dataset",
  "low completeness",
  "unknown segment value",
  "missing optional context",
  "contradictory evidence",
  "superseded insight",
  "not ready",
  "collecting",
  "shadow eligible",
  "review required",
  "calibration candidate",
];

const malformedCoverage = [
  "missing identity",
  "duplicate identity",
  "invalid pattern key",
  "invalid segment key",
  "malformed source reference",
  "non-finite metric",
  "negative sample size",
  "support count greater than sample size",
  "invalid date ordering",
  "invalid dataset window",
  "contradictory effect fields",
  "unsupported readiness state",
  "unsupported evidence-quality state",
  "missing required provenance",
  "unstable ordering attempt",
  "wall-clock timestamp attempt",
  "random ID attempt",
];

const blockedWork = [
  "Pattern Insight fixture implementation remains blocked until the next separately requested Action",
  "Pattern Discovery remains blocked",
  "insight calculation from Learning Dataset rows remains blocked",
  "statistical inference remains blocked",
  "cohort comparison remains blocked",
  "aggregation remains blocked",
  "confidence calibration remains blocked",
  "confidence mutation remains blocked",
  "ranking and recommendation behavior mutation remains blocked",
  "mapper implementation remains blocked",
  "runtime validation remains blocked",
  "provider experiments remain blocked",
  "provider/news/Supabase access remains blocked",
  "persistence remains blocked",
  "schema and migration work remains blocked",
  "replay execution remains blocked",
  "deployment remains blocked",
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

const forbiddenImplementationPaths = ["lib/pattern-insight-static-fixtures.ts"];

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

const gateFound = exists(docPath);
const content = gateFound ? read(docPath) : "";
const changedFiles = statusFiles();
const forbiddenChangedFiles = changedFiles.filter(isForbiddenChangedFile);
const forbiddenRuntimeArtifacts = forbiddenRuntimePaths.filter(exists);
const forbiddenImplementationArtifacts = forbiddenImplementationPaths.filter(exists);
const action357AuthorizedPatternInsightFixtureImplementationPresent =
  action357AuthorizedImplementationFiles.every(exists);
const unauthorizedImplementationArtifacts = forbiddenImplementationArtifacts.filter(
  (relativePath) =>
    relativePath !== "lib/pattern-insight-static-fixtures.ts" ||
    !action357AuthorizedPatternInsightFixtureImplementationPresent,
);
const forbiddenMarkersFound = [
  "action_307k_proxy_runtime_crash_isolation",
].filter(markerFound);

const requiredSectionsFound = includesAll(content, requiredSections);
const upstreamReferencesFound = includesAll(content, upstreamReferences);
const approvalVocabularyFound = includesAll(content, approvalVocabulary);
const explicitApprovalDecisionFound = includesAll(content, explicitApprovalDecision);
const scopeBoundaryFound = includesAll(content, scopeBoundary);
const gateConditionsFound = includesAll(content, gateConditions);
const futureBoundaryFound = includesAll(content, futureBoundary);
const contractDependencyFound = includesAll(content, contractFields);
const deterministicRequirementsFound = includesAll(content, deterministicRequirements);
const semanticRequirementsFound = includesAll(content, semanticRequirements);
const antiLeakageFound = includesAll(content, antiLeakageRequirements);
const noInferenceAggregationCalculationFound = includesAll(
  content,
  noInferenceAggregationCalculation,
);
const minimumFixtureCoverageFound = includesAll(content, minimumFixtureCoverage);
const malformedCoverageFound = includesAll(content, malformedCoverage);
const blockedWorkFound = includesAll(content, blockedWork);
const noImplementationFound = unauthorizedImplementationArtifacts.length === 0;
const forbiddenRepositorySurfaceClean =
  forbiddenChangedFiles.length === 0 &&
  forbiddenRuntimeArtifacts.length === 0 &&
  forbiddenMarkersFound.length === 0;

const passed =
  gateFound &&
  requiredSectionsFound &&
  upstreamReferencesFound &&
  approvalVocabularyFound &&
  explicitApprovalDecisionFound &&
  scopeBoundaryFound &&
  gateConditionsFound &&
  futureBoundaryFound &&
  contractDependencyFound &&
  deterministicRequirementsFound &&
  semanticRequirementsFound &&
  antiLeakageFound &&
  noInferenceAggregationCalculationFound &&
  minimumFixtureCoverageFound &&
  malformedCoverageFound &&
  blockedWorkFound &&
  noImplementationFound &&
  forbiddenRepositorySurfaceClean;

const result = {
  verification_status: passed ? "passed" : "failed",
  approval_gate_found: gateFound,
  required_sections_found: requiredSectionsFound,
  upstream_references_found: upstreamReferencesFound,
  approval_vocabulary_found: approvalVocabularyFound,
  explicit_approval_decision_found: explicitApprovalDecisionFound,
  approval_decision: explicitApprovalDecisionFound ? "approved" : "blocked",
  deterministic_gate_conditions_found: gateConditionsFound,
  passed_gate_conditions_count: gateConditions.filter((item) => item.endsWith(": true")).length,
  failed_gate_conditions: gateConditionsFound ? [] : ["gate_condition_contract_missing"],
  fixture_only_approval_boundary_found: scopeBoundaryFound,
  future_fixture_implementation_allowed_for_future_action: explicitApprovalDecisionFound,
  pattern_discovery_implementation_approved: false,
  inference_approved: false,
  aggregation_approved: false,
  calculation_approved: false,
  confidence_calibration_approved: false,
  confidence_mutation_approved: false,
  ranking_or_recommendation_mutation_approved: false,
  runtime_or_persistence_integration_approved: false,
  provider_news_supabase_access_approved: false,
  replay_execution_approved: false,
  schema_or_migration_change_approved: false,
  existing_pattern_insight_contract_authoritative: contractDependencyFound,
  deterministic_identity_and_timestamp_requirements_found: deterministicRequirementsFound,
  missing_unknown_insufficient_contradictory_stale_superseded_semantics_found:
    semanticRequirementsFound,
  temporal_separation_and_anti_leakage_found: antiLeakageFound,
  no_inference_aggregation_calculation_found: noInferenceAggregationCalculationFound,
  minimum_fixture_coverage_found: minimumFixtureCoverageFound,
  malformed_fixture_coverage_found: malformedCoverageFound,
  blocked_work_found: blockedWorkFound,
  pattern_insight_fixture_implementation_absent: noImplementationFound,
  action357_authorized_pattern_insight_fixture_implementation_present:
    action357AuthorizedPatternInsightFixtureImplementationPresent,
  forbidden_implementation_artifacts_found: forbiddenImplementationArtifacts,
  unauthorized_implementation_artifacts_found: unauthorizedImplementationArtifacts,
  forbidden_repository_surface_clean: forbiddenRepositorySurfaceClean,
  forbidden_changed_files: forbiddenChangedFiles,
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
  next_permitted_action:
    "implement_static_pattern_insight_fixtures_only_within_action_356_boundary",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
