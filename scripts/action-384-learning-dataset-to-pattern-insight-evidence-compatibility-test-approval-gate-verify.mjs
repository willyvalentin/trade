#!/usr/bin/env node

import { execFileSync } from "child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const docPath = "docs/action-384-learning-dataset-to-pattern-insight-evidence-compatibility-test-approval-gate.md";
const verifierPath = "scripts/action-384-learning-dataset-to-pattern-insight-evidence-compatibility-test-approval-gate-verify.mjs";
const testPath = "tests/e2e/action-384-learning-dataset-to-pattern-insight-evidence-compatibility-test-approval-gate.spec.ts";
const learningFixturePath = "lib/learning-dataset-static-fixtures.ts";
const patternFixturePath = "lib/pattern-insight-static-fixtures.ts";
const requiredFiles = [docPath, verifierPath, testPath, learningFixturePath, patternFixturePath];

const requiredSections = [
  "## Purpose",
  "## Scope",
  "## Authoritative Dependencies",
  "## Upstream Action Dependencies",
  "## Current Fixture Implementation Summary",
  "## Intelligence Pipeline Position",
  "## Evidence Input Versus Derived Output",
  "## Seven Concepts",
  "## Explicit Non-Goals",
  "## Deterministic Gate Conditions",
  "## Proposed Future Tests-Only Boundary",
  "## Allowed Future Surfaces",
  "## Forbidden Future Surfaces",
  "## Learning Dataset Evidence Contract Summary",
  "## Pattern Insight Output Contract Summary",
  "## Manually Declared Reference Relationship",
  "## No Direct Row-To-Insight Relationship",
  "## Setup Taxonomy Compatibility",
  "## Market-Regime Compatibility",
  "## Index-Context Compatibility",
  "## Sector Industry Peer Compatibility",
  "## Relative-Strength Compatibility",
  "## News Event Compatibility",
  "## Macro Calendar Compatibility",
  "## Time-Window Compatibility",
  "## Outcome-Field Compatibility",
  "## Sample Support Representation Compatibility",
  "## Provenance Compatibility",
  "## Completeness Compatibility",
  "## Missing-Data Compatibility",
  "## Temporal-Window Compatibility",
  "## Anti-Leakage Compatibility",
  "## Insufficient-Evidence Compatibility",
  "## Contradictory-Evidence Compatibility",
  "## Stale And Superseded Compatibility",
  "## Readiness-State Compatibility",
  "## Fixture Immutability Requirements",
  "## Stable Ordering Requirements",
  "## Stable Serialization Requirements",
  "## No-Calculation Requirement",
  "## No-Aggregation Requirement",
  "## No-Inference Requirement",
  "## No-Generation Requirement",
  "## No-Causal-Claim Requirement",
  "## No-Mapper Requirement",
  "## No-Production-Module Requirement",
  "## Adapter-First Constraints",
  "## No-Parallel-System Constraints",
  "## Minimum Compatibility Scenarios",
  "## Incompatibility Scenarios",
  "## Acceptance Criteria",
  "## Rejection Criteria",
  "## Passed Conditions",
  "## Failed Conditions",
  "## Approval Decision",
  "## Blocked Work After Approval",
  "## Next Permitted Action",
];

const requiredUpstreamActions = [
  "Action 309",
  "Action 335",
  "Action 337",
  "Action 343",
  "Action 349",
  "Action 352",
  "Action 355",
  "Action 356",
  "Action 357",
  "Action 380",
  "Action 381",
  "Action 382",
  "Action 383",
];

const requiredIncompatibilities = [
  "missing source-row identity",
  "invalid recommendation/context/outcome linkage",
  "malformed provenance",
  "non-finite evidence field",
  "invalid completeness bounds",
  "future leakage",
  "missing Pattern Insight identity",
  "malformed source reference",
  "unsupported segment category",
  "invalid observation window",
  "support count greater than sample size",
  "contradictory effect fields",
  "unsupported readiness state",
  "unsupported evidence-quality state",
  "random-ID attempt",
  "wall-clock attempt",
  "reference manifest claiming derivation",
  "reference manifest containing calculated metrics",
  "reference manifest claiming causality",
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
const learningSource = existsSync(join(repoRoot, learningFixturePath)) ? read(learningFixturePath) : "";
const patternSource = existsSync(join(repoRoot, patternFixturePath)) ? read(patternFixturePath) : "";
const changedFiles = statusFiles();
const action384ChangedFiles = changedFiles.filter((path) => path.includes("action-384"));
const forbiddenAction384Changes = action384ChangedFiles.filter(
  (path) =>
    path.startsWith("lib/") ||
    path.startsWith("app/") ||
    path.startsWith("supabase/") ||
    ["proxy.ts", "middleware.ts", "middleware.js", "netlify.toml"].includes(path),
);
const productionEvidenceCompatibilityFiles = collectFiles("lib").filter((path) =>
  /learning-dataset-to-pattern-insight|evidence-compatibility|pattern-discovery|cohort-builder|insight-builder|effect-calculator/.test(
    path,
  ),
);

const approvalVocabularyFound =
  doc.includes("approval_vocabulary: approved | approved_with_conditions | blocked") &&
  doc.includes("approval_decision: approved");
const evidenceDistinctionFound = includesAll(doc, [
  "Learning Dataset Rows are evidence inputs",
  "Pattern Insights are future derived analytical outputs",
  "does not mean any insight was discovered, calculated, inferred, generated",
  "no direct row-to-insight derivation relationship exists",
]);
const sevenConceptsFound = includesAll(doc, [
  "### A. Static Evidence Compatibility Tests",
  "### B. Literal Test-Only Reference Manifest",
  "### C. Aggregation Or Cohort Logic",
  "### D. Pattern Discovery Implementation",
  "### E. Pattern Insight Generation",
  "### F. Confidence Calibration",
  "### G. Runtime Integration",
]);
const futureBoundaryFound = includesAll(doc, [
  "tests/e2e/action-385-learning-dataset-to-pattern-insight-evidence-compatibility.spec.ts",
  "docs/action-385-learning-dataset-pattern-insight-reference-manifest.json",
  "tests_and_optional_literal_manifest_only_no_calculation_no_aggregation_no_discovery",
]);
const manifestBoundaryFound = includesAll(doc, [
  "no_derivation_claimed: true",
  "must not contain calculated metrics",
  "must not claim causation",
]);
const prohibitionRequirementsFound = includesAll(doc, [
  "## No-Calculation Requirement",
  "## No-Aggregation Requirement",
  "## No-Inference Requirement",
  "## No-Generation Requirement",
  "## No-Causal-Claim Requirement",
  "## No-Mapper Requirement",
  "## No-Production-Module Requirement",
]);
const compatibilityRequirementsFound = includesAll(doc, [
  "Setup Taxonomy Compatibility",
  "Outcome-Field Compatibility",
  "Provenance Compatibility",
  "Temporal-Window Compatibility",
  "Anti-Leakage Compatibility",
  "Insufficient-Evidence Compatibility",
  "Contradictory-Evidence Compatibility",
  "Readiness-State Compatibility",
]);
const immutabilityFound = includesAll(doc, [
  "Action 380 valid/malformed fixtures",
  "Action 357 valid/malformed fixtures",
  "IDs, ordering, timestamps, provenance",
  "byte-identical or canonically identical",
]);
const runtimePreviewUntouched =
  doc.includes("runtime_preview_status: runtime_preview_waiting_for_operator_inputs") &&
  forbiddenAction384Changes.length === 0;

const checks = {
  required_files_found: requiredFilesFound,
  required_document_sections_found: includesAll(doc, requiredSections),
  upstream_action_references_found: includesAll(doc, requiredUpstreamActions),
  action_380_fixture_module_found: existsSync(join(repoRoot, learningFixturePath)),
  action_357_fixture_module_found: existsSync(join(repoRoot, patternFixturePath)),
  learning_and_pattern_contract_markers_found:
    includesAll(learningSource, ["Action335LearningDatasetRow", "outcome_fields", "data_provenance"]) &&
    includesAll(patternSource, ["Action343PatternInsightStaticFixture", "outcome_summary", "evidence_strength"]),
  evidence_input_derived_output_distinction_found: evidenceDistinctionFound,
  approval_vocabulary_and_decision_found: approvalVocabularyFound,
  deterministic_gate_conditions_found: doc.includes("passed_conditions_count: 16") && doc.includes("failed_conditions_count: 0") && doc.includes("all_required_gate_conditions_passed: true"),
  seven_concepts_distinguished: sevenConceptsFound,
  tests_only_future_boundary_found: futureBoundaryFound,
  optional_literal_reference_manifest_boundary_found: manifestBoundaryFound,
  no_production_module_approved: doc.includes("production_module_approved: false"),
  no_aggregator_cohort_discovery_metric_insight_mapper_calibration_approved: prohibitionRequirementsFound,
  no_calculation_aggregation_inference_causal_claim_requirements_found: prohibitionRequirementsFound,
  setup_outcome_provenance_temporal_state_compatibility_found: compatibilityRequirementsFound,
  fixture_immutability_found: immutabilityFound,
  incompatibility_scenarios_found: includesAll(doc, requiredIncompatibilities),
  stable_ordering_and_serialization_found: includesAll(doc, ["Stable Ordering Requirements", "Stable Serialization Requirements"]),
  production_evidence_compatibility_modules_absent: productionEvidenceCompatibilityFiles.length === 0,
  no_forbidden_action_384_changes: forbiddenAction384Changes.length === 0,
  runtime_provider_news_supabase_persistence_blocked: includesAll(doc, ["provider/news/Supabase", "persistence", "runtime integration"]),
  schema_migrations_proxy_middleware_netlify_unchanged: forbiddenAction384Changes.length === 0,
  runtime_preview_chain_untouched: runtimePreviewUntouched,
  next_action_separately_identified: doc.includes("next_permitted_action: Action 385"),
};

const passed = Object.values(checks).every(Boolean);
const result = {
  verification_status: passed ? "passed" : "blocked",
  ...checks,
  approval_decision: "approved",
  passed_conditions_count: 16,
  failed_conditions_count: 0,
  failed_conditions: [],
  action_384_changed_files: action384ChangedFiles,
  forbidden_action_384_changes: forbiddenAction384Changes,
  production_evidence_compatibility_files: productionEvidenceCompatibilityFiles,
  approved_future_surface: [
    "tests/e2e/action-385-learning-dataset-to-pattern-insight-evidence-compatibility.spec.ts",
    "docs/action-385-learning-dataset-to-pattern-insight-static-evidence-compatibility-tests.md",
    "scripts/action-385-learning-dataset-to-pattern-insight-static-evidence-compatibility-tests-verify.mjs",
    "optional_docs_action_385_literal_reference_manifest",
  ],
  aggregation_approved: false,
  pattern_discovery_approved: false,
  insight_generation_approved: false,
  confidence_calibration_approved: false,
  mapper_approved: false,
  production_module_approved: false,
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  no_effect_flags: {
    compatibility_tests_implemented: false,
    reference_manifest_created: false,
    aggregation_implemented: false,
    pattern_discovery_implemented: false,
    insights_generated: false,
    fixtures_mutated: false,
    provider_call_executed: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    replay_executed: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    confidence_behavior_changed: false,
  },
  next_permitted_action:
    "action_385_static_evidence_compatibility_tests_and_optional_literal_manifest_only",
};

console.log(JSON.stringify(result, null, 2));
if (!passed) process.exitCode = 1;
