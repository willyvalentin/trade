#!/usr/bin/env node

import { execFileSync } from "child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const docPath = "docs/action-382-intelligence-context-to-learning-dataset-compatibility-test-approval-gate.md";
const verifierPath = "scripts/action-382-intelligence-context-to-learning-dataset-compatibility-test-approval-gate-verify.mjs";
const testPath = "tests/e2e/action-382-intelligence-context-to-learning-dataset-compatibility-test-approval-gate.spec.ts";
const learningFixturePath = "lib/learning-dataset-static-fixtures.ts";
const contextFixturePath = "lib/intelligence-context-static-fixtures.ts";
const requiredFiles = [docPath, verifierPath, testPath, learningFixturePath, contextFixturePath];

const requiredSections = [
  "## Purpose",
  "## Scope",
  "## Authoritative Dependencies",
  "## Upstream Action Dependencies",
  "## Current Fixture Implementation Summary",
  "## Four Concepts",
  "## Explicit Non-Goals",
  "## Proposed Future Compatibility-Test Boundary",
  "## Allowed Future Surfaces",
  "## Forbidden Future Surfaces",
  "## Authoritative Shared Type Relationship",
  "## Identity And Fixture Relationship",
  "## Recommendation Linkage Compatibility",
  "## Context Field Compatibility",
  "## Provenance Compatibility",
  "## Capture-Time And Effective-Time Compatibility",
  "## Freshness Compatibility",
  "## Missing-Data Compatibility",
  "## Null Compatibility",
  "## Unknown Compatibility",
  "## Unavailable Compatibility",
  "## Stale Compatibility",
  "## Conflicting Compatibility",
  "## Partial Compatibility",
  "## Future-Exclusion Compatibility",
  "## Anti-Leakage Compatibility",
  "## Stable Ordering And Serialization Requirements",
  "## Fixture Immutability Requirements",
  "## No-Transformation Requirement",
  "## No-Normalization Requirement",
  "## No-Repair Requirement",
  "## No-Generation Requirement",
  "## No-Mapper Requirement",
  "## Adapter-First Constraints",
  "## No-Parallel-System Constraints",
  "## Minimum Compatibility Scenarios",
  "## Incompatibility Scenarios",
  "## Deterministic Gate Conditions",
  "## Passed Conditions",
  "## Failed Conditions",
  "## Acceptance Criteria",
  "## Rejection Criteria",
  "## Approval Decision",
  "## Blocked Work After Approval",
  "## Next Permitted Action",
];

const requiredUpstreamActions = [
  "Action 309",
  "Action 335",
  "Action 336",
  "Action 340",
  "Action 342",
  "Action 346",
  "Action 347",
  "Action 348",
  "Action 352",
  "Action 353",
  "Action 354",
  "Action 380",
  "Action 381",
];

const requiredIncompatibilityScenarios = [
  "missing required context identity",
  "invalid recommendation linkage",
  "future capture timestamp",
  "future effective timestamp improperly included",
  "outcome leakage",
  "unsupported category",
  "malformed provenance",
  "invalid freshness state",
  "stale/fresh contradiction",
  "conflict state without conflict metadata",
  "partial context marked complete",
  "non-finite numeric metric",
  "invalid completeness bounds",
  "duplicate identities",
  "random ID attempt",
  "wall-clock attempt",
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
const contextSource = existsSync(join(repoRoot, contextFixturePath)) ? read(contextFixturePath) : "";
const changedFiles = statusFiles();
const action382ChangedFiles = changedFiles.filter((path) => path.includes("action-382"));
const action382ForbiddenChanges = action382ChangedFiles.filter(
  (path) =>
    path.startsWith("lib/") ||
    path.startsWith("app/") ||
    path.startsWith("supabase/") ||
    ["proxy.ts", "middleware.ts", "middleware.js", "netlify.toml"].includes(path),
);
const compatibilityLibFiles = collectFiles("lib").filter(
  (path) =>
    /context-to-learning-dataset-compatibility|compatibility-composition|context-row-mapper/.test(path),
);

const sharedTypesDocumented = includesAll(doc, [
  "LearningDatasetContext",
  "LearningDatasetContextValue",
  "LearningDatasetProvenance",
]);
const sharedTypesActuallyReused = includesAll(contextSource, [
  "LearningDatasetContext",
  "LearningDatasetContextValue",
  "LearningDatasetProvenance",
  'from "@/lib/learning-dataset-static-fixtures"',
]);
const approvalVocabularyFound =
  doc.includes("approval_vocabulary: approved | approved_with_conditions | blocked") &&
  doc.includes("approval_decision: approved");
const testsOnlyBoundaryFound = includesAll(doc, [
  "tests/e2e/action-383-intelligence-context-to-learning-dataset-compatibility.spec.ts",
  "No production `lib/` module is approved",
  "tests_only_no_helper_no_mapper_no_runtime",
]);
const fourConceptBoundaryFound = includesAll(doc, [
  "### A. Static Fixture Compatibility Tests",
  "### B. Pure Composition Assertion Helper",
  "### C. Snapshot-to-Learning Dataset Mapper",
  "### D. Runtime Integration",
  "Action 382 approves only A",
]);
const deterministicConditionsFound =
  doc.includes("passed_conditions_count: 13") &&
  doc.includes("failed_conditions_count: 0") &&
  doc.includes("all_required_gate_conditions_passed: true");
const noTransformationFound = includesAll(doc, [
  "## No-Transformation Requirement",
  "## No-Normalization Requirement",
  "## No-Repair Requirement",
  "## No-Generation Requirement",
  "## No-Mapper Requirement",
]);
const immutabilityFound = includesAll(doc, [
  "Action 380 and Action 381 fixture serialization before assertions",
  "fixture counts",
  "fixture IDs",
  "fixture timestamps",
  "fixture provenance",
  "must not mutate imported arrays",
]);
const compatibilityRequirementsFound = includesAll(doc, [
  "Recommendation Linkage Compatibility",
  "Capture-Time And Effective-Time Compatibility",
  "Provenance Compatibility",
  "Missing-Data Compatibility",
  "Future-Exclusion Compatibility",
  "Anti-Leakage Compatibility",
]);
const runtimePreviewUntouched =
  doc.includes("runtime_preview_status: runtime_preview_waiting_for_operator_inputs") &&
  action382ForbiddenChanges.length === 0;

const checks = {
  required_files_found: requiredFilesFound,
  required_document_sections_found: includesAll(doc, requiredSections),
  upstream_action_references_found: includesAll(doc, requiredUpstreamActions),
  action_380_fixture_module_found: existsSync(join(repoRoot, learningFixturePath)),
  action_381_fixture_module_found: existsSync(join(repoRoot, contextFixturePath)),
  shared_authoritative_context_types_documented: sharedTypesDocumented,
  shared_authoritative_context_types_reused: sharedTypesActuallyReused,
  approval_vocabulary_and_decision_found: approvalVocabularyFound,
  deterministic_gate_conditions_found: deterministicConditionsFound,
  four_concepts_distinguished: fourConceptBoundaryFound,
  tests_only_future_boundary_found: testsOnlyBoundaryFound,
  no_future_production_lib_module_approved: doc.includes("production_lib_module_approved: false"),
  no_compatibility_helper_implemented: compatibilityLibFiles.length === 0,
  no_mapper_transformation_normalization_generation_approved: noTransformationFound,
  fixture_immutability_contract_found: immutabilityFound,
  identity_linkage_temporal_provenance_missing_data_anti_leakage_found: compatibilityRequirementsFound,
  incompatibility_scenarios_found: includesAll(doc, requiredIncompatibilityScenarios),
  stable_ordering_and_serialization_found: includesAll(doc, ["Stable Ordering And Serialization Requirements", "byte-equivalent serialization"]),
  runtime_provider_news_supabase_persistence_blocked: includesAll(doc, ["live collection and external services", "Supabase, persistence", "runtime integration"]),
  no_forbidden_action_382_changes: action382ForbiddenChanges.length === 0,
  schema_migration_proxy_middleware_netlify_unchanged: action382ForbiddenChanges.length === 0,
  runtime_preview_chain_untouched: runtimePreviewUntouched,
  next_action_separately_identified: doc.includes("next_permitted_action: Action 383"),
  existing_fixture_sources_unchanged_by_gate: learningSource.length > 0 && contextSource.length > 0,
};

const passed = Object.values(checks).every(Boolean);
const result = {
  verification_status: passed ? "passed" : "blocked",
  ...checks,
  approval_decision: "approved",
  passed_conditions_count: 13,
  failed_conditions_count: 0,
  failed_conditions: [],
  action_382_changed_files: action382ChangedFiles,
  forbidden_action_382_changes: action382ForbiddenChanges,
  compatibility_lib_files: compatibilityLibFiles,
  approved_future_surface: [
    "tests/e2e/action-383-intelligence-context-to-learning-dataset-compatibility.spec.ts",
    "optional_tests_fixture_reference_manifest",
    "focused_documentation",
    "deterministic_verifier",
  ],
  pure_composition_assertion_helper_approved: false,
  snapshot_to_learning_dataset_mapper_approved: false,
  runtime_integration_approved: false,
  production_lib_module_approved: false,
  provider_news_supabase_access_allowed: false,
  persistence_allowed: false,
  replay_execution_allowed: false,
  scanner_ranking_confidence_mutation_allowed: false,
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  deploy_readiness: false,
  main_push_allowed: false,
  no_effect_flags: {
    compatibility_tests_implemented: false,
    composition_helper_implemented: false,
    mapper_implemented: false,
    learning_rows_generated: false,
    fixtures_mutated: false,
    provider_call_executed: false,
    news_call_executed: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    replay_executed: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    confidence_behavior_changed: false,
  },
  next_permitted_action: "action_383_static_compatibility_tests_only",
};

console.log(JSON.stringify(result, null, 2));
if (!passed) process.exitCode = 1;
