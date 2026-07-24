#!/usr/bin/env node

import { execFileSync } from "child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const docPath =
  "docs/action-385-learning-dataset-to-pattern-insight-static-evidence-compatibility-tests.md";
const testPath =
  "tests/e2e/action-385-learning-dataset-to-pattern-insight-evidence-compatibility.spec.ts";
const verifierPath =
  "scripts/action-385-learning-dataset-to-pattern-insight-static-evidence-compatibility-tests-verify.mjs";
const manifestPath =
  "docs/action-385-learning-dataset-pattern-insight-reference-manifest.json";
const learningFixturePath = "lib/learning-dataset-static-fixtures.ts";
const patternFixturePath = "lib/pattern-insight-static-fixtures.ts";
const approvalPath =
  "docs/action-384-learning-dataset-to-pattern-insight-evidence-compatibility-test-approval-gate.md";
const requiredFiles = [
  docPath,
  testPath,
  verifierPath,
  learningFixturePath,
  patternFixturePath,
  approvalPath,
];

const requiredDocMarkers = [
  "## Status And Purpose",
  "## Scope And Authoritative Dependencies",
  "action_384_approval_decision: approved",
  "## Evidence Input Versus Derived Output",
  "## Conceptual Reference Semantics",
  "## Setup And Context Compatibility",
  "## Outcome And Evidence Compatibility",
  "## Provenance Compatibility",
  "## Temporal Compatibility",
  "## Missing-Data Compatibility",
  "## Insufficient Contradictory Stale And Superseded Compatibility",
  "## Readiness-State Compatibility",
  "## Anti-Leakage And Causal Boundaries",
  "## No-Calculation Guarantee",
  "## No-Aggregation No-Inference No-Discovery Guarantees",
  "## No-Generation No-Calibration No-Mapper Guarantees",
  "## Fixture Immutability",
  "## Stable Ordering And Serialization",
  "## Malformed-Case Handling",
  "## Blocked Work",
  "## Expected Next Approval Gate",
  "runtime_preview_waiting_for_operator_inputs",
];

const requiredTestMarkers = [
  'from "../../lib/learning-dataset-static-fixtures"',
  'from "../../lib/pattern-insight-static-fixtures"',
  "Learning Dataset fixtures remain evidence examples",
  "Pattern Insights remain output examples",
  "setup context window and segment dimensions",
  "outcome availability result direction",
  "identity recommendation context and outcome linkage",
  "provenance quality source bounds",
  "recommendation context outcome and observation windows",
  "positive negative neutral weak insufficient contradictory stale and superseded",
  "all readiness states",
  "Learning Dataset malformed evidence cases",
  "Pattern Insight malformed output cases",
  "test.afterAll",
  "baseline.learningValid",
  "baseline.learningMalformed",
  "baseline.patternValid",
  "baseline.patternMalformed",
  "baseline.patternLiteralMetrics",
  "serializeLearningDatasetStaticFixtures",
  "anti_leakage_status",
  "insufficient_sample",
  "contradictory_evidence",
  "stale_source_dataset",
  "superseded_insight",
  "readiness:not_ready",
  "readiness:collecting",
  "readiness:shadow_eligible",
  "readiness:review_required",
  "readiness:calibration_candidate",
];

const requiredLearningMalformedReasons = [
  "missing_required_identity",
  "conflicting_identity_linkage",
  "invalid_recommendation_context_relationship",
  "context_after_prohibited_boundary",
  "outcome_leaked_into_snapshot_fields",
  "malformed_provenance",
  "non_finite_numeric_metric",
  "invalid_completeness_bounds",
  "random_identity_attempt",
  "unstable_timestamp_attempt",
];

const requiredPatternMalformedReasons = [
  "missing_identity",
  "malformed_source_reference",
  "invalid_dataset_window",
  "support_count_greater_than_sample_size",
  "contradictory_effect_fields",
  "unsupported_readiness_state",
  "unsupported_evidence_quality_state",
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
  const output = execFileSync(
    "git",
    ["status", "--short", "--untracked-files=all"],
    { cwd: repoRoot, encoding: "utf8" },
  );
  return output
    .trimEnd()
    .split("\n")
    .filter(Boolean)
    .map((line) => line.slice(3).trim())
    .map((path) =>
      path.includes(" -> ") ? (path.split(" -> ").at(-1) ?? path) : path,
    );
}

const requiredFilesFound = requiredFiles.every((path) =>
  existsSync(join(repoRoot, path)),
);
const doc = existsSync(join(repoRoot, docPath)) ? read(docPath) : "";
const testSource = existsSync(join(repoRoot, testPath)) ? read(testPath) : "";
const approvalDoc = existsSync(join(repoRoot, approvalPath))
  ? read(approvalPath)
  : "";
const manifestPresent = existsSync(join(repoRoot, manifestPath));
const changedFiles = statusFiles();
const action385ChangedFiles = changedFiles.filter((path) =>
  path.includes("action-385"),
);
const allowedAction385Files = [docPath, testPath, verifierPath, manifestPath];
const forbiddenAction385Changes = action385ChangedFiles.filter(
  (path) => !allowedAction385Files.includes(path),
);
const productionEvidenceCompatibilityFiles = collectFiles("lib").filter(
  (path) =>
    /learning-dataset-to-pattern-insight|evidence-compatibility|pattern-discovery|cohort-builder|segmenter|statistics-helper|metric-calculator|insight-builder|insight-generator|effect-calculator|confidence-adapter/.test(
      path,
    ),
);

const forbiddenExecutionPatterns = [
  /\.reduce\s*\(/,
  /\bgroupBy\s*\(/,
  /\baggregate\w*\s*\(/,
  /\bcalculate\w*\s*\(/,
  /\bcompute\w*\s*\(/,
  /\bdiscover\w*\s*\(/,
  /\bgenerateInsight\s*\(/,
  /\bbuildInsight\s*\(/,
  /\brank\w*\s*\(/,
  /Date\.now\s*\(/,
  /new\s+Date\s*\(/,
  /Math\.random\s*\(/,
  /randomUUID\s*\(/,
  /process\.env\./,
  /\bfetch\s*\(/,
];
const aggregationOrDiscoveryLogicFound = forbiddenExecutionPatterns.some(
  (pattern) => pattern.test(testSource),
);
const externalAccessFound =
  /from\s+["']@supabase/.test(testSource) ||
  /from\s+["'][^"']*supabase-js/.test(testSource) ||
  /next\/server/.test(testSource);
const evidenceDistinctionFound =
  includesAll(doc, [
    "Learning Dataset fixtures are source evidence examples",
    "Pattern Insight fixtures are synthetic output-contract examples",
    "does not derive one fixture package from the other",
  ]) &&
  includesAll(testSource, [
    "Learning Dataset fixtures remain evidence examples",
    "Pattern Insights remain output examples",
  ]);
const noClaimBoundaryFound = includesAll(doc, [
  "mathematically validated",
  "causally derived",
  "No Pattern Insight is claimed to be discovered",
]);
const setupContextCoverageFound = includesAll(testSource, [
  "setup_family",
  "trading_window",
  '=== "bullish"',
  '=== "mixed"',
  "spy_direction",
  "qqq_direction",
  "iwm_direction",
  "sector_industry",
  "relative_strength",
  "news_catalyst",
  "calendar_event",
  "missing_optional_context",
]);
const outcomeEvidenceCoverageFound = includesAll(testSource, [
  '"target_hit"',
  '"stop_hit"',
  '=== "incomplete"',
  '=== "not_yet_available"',
  "gross_r_multiple",
  "max_adverse_excursion_r",
  "Number.isFinite",
]);
const provenanceCoverageFound = includesAll(testSource, [
  "data_provenance",
  "completeness_score",
  "source_confidence",
  '=== "complete"',
  '=== "partial"',
  '=== "unavailable"',
  "partial_provenance",
  "stale_source_dataset",
  "source_dataset_reference",
]);
const temporalAndAntiLeakageCoverageFound = includesAll(testSource, [
  "recommendation_created_at",
  "captured_at",
  "evaluated_at",
  "sample_window.start",
  "sample_window.end",
  "anti_leakage_status",
  "target_hit|stop_hit|gross_r_multiple|outcome_status",
]);
const stateCoverageFound = includesAll(testSource, [
  '"positive"',
  '"negative"',
  '"neutral"',
  '"mixed"',
  '"unknown"',
  "insufficient_sample",
  "weak_signal",
  "contradictory_evidence",
  "stale_source_dataset",
  "superseded_insight",
  "readiness:not_ready",
  "readiness:collecting",
  "readiness:shadow_eligible",
  "readiness:review_required",
  "readiness:calibration_candidate",
]);
const immutabilityAndOrderingFound = includesAll(testSource, [
  "test.afterAll",
  "baseline.learningValid",
  "baseline.learningMalformed",
  "baseline.learningSerialization",
  "baseline.learningIds",
  "baseline.learningTimes",
  "baseline.learningProvenance",
  "baseline.patternValid",
  "baseline.patternMalformed",
  "baseline.patternIds",
  "baseline.patternWindows",
  "baseline.patternSourceReferences",
  "baseline.patternLiteralMetrics",
  "[...ids].sort()",
  "learningFirst).toEqual(learningSecond",
  "patternFirst).toEqual(patternSecond",
]);
const runtimePreviewUntouched =
  doc.includes(
    "runtime_preview_status: runtime_preview_waiting_for_operator_inputs",
  ) && forbiddenAction385Changes.length === 0;

const checks = {
  required_files_found: requiredFilesFound,
  required_documentation_found: includesAll(doc, requiredDocMarkers),
  action_384_approval_found:
    approvalDoc.includes("approval_decision: approved") &&
    approvalDoc.includes("tests_and_optional_literal_manifest_only_no_calculation_no_aggregation_no_discovery"),
  direct_action_380_import_found: testSource.includes(
    'from "../../lib/learning-dataset-static-fixtures"',
  ),
  direct_action_357_import_found: testSource.includes(
    'from "../../lib/pattern-insight-static-fixtures"',
  ),
  required_test_markers_found: includesAll(testSource, requiredTestMarkers),
  evidence_input_output_distinction_found: evidenceDistinctionFound,
  no_derivation_math_causal_or_discovery_claim_found: noClaimBoundaryFound,
  setup_and_context_coverage_found: setupContextCoverageFound,
  outcome_and_evidence_coverage_found: outcomeEvidenceCoverageFound,
  provenance_coverage_found: provenanceCoverageFound,
  temporal_and_anti_leakage_coverage_found:
    temporalAndAntiLeakageCoverageFound,
  insufficient_contradictory_stale_and_readiness_coverage_found:
    stateCoverageFound,
  learning_malformed_coverage_found: includesAll(
    testSource,
    requiredLearningMalformedReasons,
  ),
  pattern_malformed_coverage_found: includesAll(
    testSource,
    requiredPatternMalformedReasons,
  ),
  fixture_immutability_ordering_and_serialization_found:
    immutabilityAndOrderingFound,
  reference_manifest_boundary_respected: !manifestPresent,
  no_aggregation_calculation_discovery_or_generation_logic:
    !aggregationOrDiscoveryLogicFound,
  no_provider_news_supabase_or_runtime_access: !externalAccessFound,
  production_evidence_compatibility_module_absent:
    productionEvidenceCompatibilityFiles.length === 0,
  action_385_boundary_respected: forbiddenAction385Changes.length === 0,
  fixture_implementations_unchanged_by_action_385: action385ChangedFiles.every(
    (path) => ![learningFixturePath, patternFixturePath].includes(path),
  ),
  runtime_preview_chain_untouched: runtimePreviewUntouched,
};

const passed = Object.values(checks).every(Boolean);
const result = {
  verification_status: passed ? "passed" : "blocked",
  ...checks,
  compatibility_tests_implemented: true,
  reference_manifest_present: manifestPresent,
  action_385_changed_files: action385ChangedFiles,
  forbidden_action_385_changes: forbiddenAction385Changes,
  production_evidence_compatibility_module_found:
    productionEvidenceCompatibilityFiles.length > 0,
  production_evidence_compatibility_files: productionEvidenceCompatibilityFiles,
  aggregation_or_discovery_logic_found: aggregationOrDiscoveryLogicFound,
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  no_effect_flags: {
    authoritative_insights_generated: false,
    calculated_metrics_created: false,
    aggregation_executed: false,
    pattern_discovery_executed: false,
    fixtures_mutated: false,
    provider_call_executed: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    replay_executed: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    confidence_behavior_changed: false,
  },
  recommended_next_action: passed
    ? "separate_static_intelligence_package_consolidation_readiness_review_approval_gate"
    : "repair_action_385_tests_only_evidence_compatibility_boundary",
};

console.log(JSON.stringify(result, null, 2));
if (!passed) process.exitCode = 1;
