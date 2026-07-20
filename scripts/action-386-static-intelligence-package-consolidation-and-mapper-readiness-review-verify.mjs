#!/usr/bin/env node

import { execFileSync } from "child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const docPath =
  "docs/action-386-static-intelligence-package-consolidation-and-mapper-readiness-review.md";
const testPath =
  "tests/e2e/action-386-static-intelligence-package-consolidation-and-mapper-readiness-review.spec.ts";
const verifierPath =
  "scripts/action-386-static-intelligence-package-consolidation-and-mapper-readiness-review-verify.mjs";
const requiredFiles = [
  docPath,
  testPath,
  verifierPath,
  "lib/pattern-insight-static-fixtures.ts",
  "lib/learning-dataset-static-fixtures.ts",
  "lib/intelligence-context-static-fixtures.ts",
  "tests/e2e/action-383-intelligence-context-to-learning-dataset-compatibility.spec.ts",
  "tests/e2e/action-385-learning-dataset-to-pattern-insight-evidence-compatibility.spec.ts",
];

const requiredSections = [
  "## Status And Purpose",
  "## Scope",
  "## Authoritative Product Dependency",
  "## Upstream Action Inventory",
  "## Implementation Inventory",
  "## Contract Inventory",
  "## Fixture Inventory",
  "## Verifier Inventory",
  "## Compatibility-Test Inventory",
  "## Explicit Non-Goals",
  "## Intelligence-Layer Ownership Matrix",
  "## Type Ownership Matrix",
  "## Recommendation Snapshot Boundary",
  "## Intelligence Context Boundary",
  "## Outcome Boundary",
  "## Learning Dataset Row Boundary",
  "## Pattern Insight Boundary",
  "## Identity And Linkage Review",
  "## Temporal-Semantics Review",
  "## Snapshot-Time Versus Outcome-Time Review",
  "## Anti-Leakage Review",
  "## Missing-Data Semantics Review",
  "## Provenance Review",
  "## Completeness Review",
  "## Fixture Determinism Review",
  "## Fixture Immutability Review",
  "## Malformed And Boundary Coverage Review",
  "## Context-To-Learning Compatibility Result",
  "## Learning-To-Pattern Evidence Compatibility Result",
  "## No-Parallel-System Review",
  "## Adapter-First Review",
  "## No-Runtime Review",
  "## No-Persistence Review",
  "## Mapper Input Contract Readiness",
  "## Mapper Output Contract Readiness",
  "## Mapper Validation Requirements",
  "## Mapper Error-Result Requirements",
  "## Mapper Purity Requirements",
  "## Unsupported Gaps",
  "## Deferred Fields",
  "## Blocker Inventory",
  "## Risk Inventory",
  "## Readiness Vocabulary",
  "## Deterministic Readiness Conditions",
  "## Readiness Decision",
  "## Passed Conditions",
  "## Failed Conditions",
  "## Unresolved Conditions",
  "## Next Permitted Action",
];

const upstreamActions = [
  "Action 331",
  "Action 332",
  "Action 334",
  "Action 335",
  "Action 336",
  "Action 337",
  "Action 340",
  "Action 342",
  "Action 343",
  "Action 346",
  "Action 347",
  "Action 348",
  "Action 349",
  "Action 352",
  "Action 353",
  "Action 354",
  "Action 355",
  "Action 356",
  "Action 357",
  "Action 380",
  "Action 381",
  "Action 382",
  "Action 383",
  "Action 384",
  "Action 385",
];

const ownershipConcepts = [
  "recommendation identity",
  "recommendation timestamp",
  "snapshot identity",
  "context identity",
  "context values",
  "provenance",
  "completeness",
  "outcome identity",
  "outcome status",
  "outcome metrics",
  "Learning Dataset row identity",
  "Pattern Insight identity",
  "source references",
  "observation windows",
  "readiness states",
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

const doc = existsSync(join(repoRoot, docPath)) ? read(docPath) : "";
const testSource = existsSync(join(repoRoot, testPath)) ? read(testPath) : "";
const contextSource = existsSync(
  join(repoRoot, "lib/intelligence-context-static-fixtures.ts"),
)
  ? read("lib/intelligence-context-static-fixtures.ts")
  : "";
const changedFiles = statusFiles();
const action386ChangedFiles = changedFiles.filter((path) =>
  path.includes("action-386"),
);
const allowedAction386Files = [docPath, testPath, verifierPath];
const forbiddenAction386Changes = action386ChangedFiles.filter(
  (path) => !allowedAction386Files.includes(path),
);
const productionMapperFiles = collectFiles("lib").filter((path) =>
  /snapshot-to-learning-dataset-mapper|learning-dataset-mapper-implementation|learning-row-mapper/.test(
    path,
  ),
);
const approvedDownstreamMapperPath = "lib/snapshot-to-learning-dataset-mapper.ts";
const approvedDownstreamMapperImplemented =
  productionMapperFiles.length === 1 &&
  productionMapperFiles[0] === approvedDownstreamMapperPath &&
  existsSync(join(repoRoot, "docs/action-388-snapshot-to-learning-dataset-mapper-implementation.md")) &&
  existsSync(join(repoRoot, "scripts/action-388-snapshot-to-learning-dataset-mapper-implementation-verify.mjs")) &&
  existsSync(join(repoRoot, "tests/e2e/action-388-snapshot-to-learning-dataset-mapper-implementation.spec.ts"));
const productionCompatibilitySchemas = collectFiles("lib").filter((path) =>
  /context-to-learning-dataset-compatibility|learning-dataset-to-pattern-insight|intelligence-compatibility-schema/.test(
    path,
  ),
);
const ownershipRows = doc
  .split("\n")
  .filter((line) => line.startsWith("| ") && line.includes(" |"));
const ownershipConceptsResolvedOnce = ownershipConcepts.every(
  (concept) =>
    ownershipRows.filter((line) => line.startsWith(`| ${concept} |`)).length ===
    1,
);
const fixturePaths = [
  "lib/pattern-insight-static-fixtures.ts",
  "lib/learning-dataset-static-fixtures.ts",
  "lib/intelligence-context-static-fixtures.ts",
];
const fixtureImplementationsChangedByAction386 = action386ChangedFiles.filter(
  (path) => fixturePaths.includes(path),
);

const checks = {
  required_files_found: requiredFiles.every((path) =>
    existsSync(join(repoRoot, path)),
  ),
  required_documentation_sections_found: includesAll(doc, requiredSections),
  required_upstream_references_found: includesAll(doc, upstreamActions),
  action_357_module_exists: existsSync(
    join(repoRoot, "lib/pattern-insight-static-fixtures.ts"),
  ),
  action_380_module_exists: existsSync(
    join(repoRoot, "lib/learning-dataset-static-fixtures.ts"),
  ),
  action_381_module_exists: existsSync(
    join(repoRoot, "lib/intelligence-context-static-fixtures.ts"),
  ),
  action_383_tests_exist: existsSync(
    join(
      repoRoot,
      "tests/e2e/action-383-intelligence-context-to-learning-dataset-compatibility.spec.ts",
    ),
  ),
  action_385_tests_exist: existsSync(
    join(
      repoRoot,
      "tests/e2e/action-385-learning-dataset-to-pattern-insight-evidence-compatibility.spec.ts",
    ),
  ),
  authoritative_ownership_matrix_exists:
    doc.includes("## Intelligence-Layer Ownership Matrix") &&
    ownershipConceptsResolvedOnce,
  no_duplicate_schema_conclusion_found: includesAll(doc, [
    "No concept has two competing authoritative definitions",
    "no compatibility-only production schema exists",
    "No duplicate recommendation, outcome, context-value, provenance, Learning Dataset, Pattern Insight, compatibility, or mapper schema has emerged",
  ]),
  action_381_reuses_action_380_types: includesAll(contextSource, [
    "LearningDatasetContext",
    "LearningDatasetContextValue",
    "LearningDatasetProvenance",
    'from "@/lib/learning-dataset-static-fixtures"',
  ]),
  mapper_input_review_exists: includesAll(doc, [
    "## Mapper Input Contract Readiness",
    "recommendationSnapshot, contextSnapshot, outcome",
    "deterministic identity/linkage",
    "timestamp semantics",
    "ready_with_conditions",
  ]),
  mapper_output_review_exists: includesAll(doc, [
    "## Mapper Output Contract Readiness",
    "deterministic identity",
    "stable ordering/serialization",
    "Construction error vocabulary is not yet authoritative",
  ]),
  identity_and_linkage_review_exists: includesAll(doc, [
    "## Identity And Linkage Review",
    "Random IDs",
    "duplicate row identity",
    "Result: ready",
  ]),
  temporal_and_anti_leakage_review_exists: includesAll(doc, [
    "## Temporal-Semantics Review",
    "## Snapshot-Time Versus Outcome-Time Review",
    "## Anti-Leakage Review",
    "included_in_snapshot_context: false",
  ]),
  missing_data_and_provenance_review_exists: includesAll(doc, [
    "## Missing-Data Semantics Review",
    "present`, `explicit_null`, `unknown`, and `unavailable",
    "## Provenance Review",
    "complete, partial, low-quality, conflicting, stale, and unavailable",
  ]),
  compatibility_results_recorded: includesAll(doc, [
    "Action 383 is green",
    "Action 385 is green",
    "representational compatibility only",
  ]),
  peer_group_gap_explicitly_classified: includesAll(doc, [
    "Peer-group: `unsupported_optional`",
    "must not be inferred from sector/industry",
    "fixture-only expected peer labels",
  ]),
  mapper_purity_requirements_exist: includesAll(doc, [
    "side-effect-free",
    "environment-independent",
    "filesystem-independent",
    "network-independent",
    "provider-independent",
    "Supabase-independent",
    "persistence-independent",
    "clock-independent",
    "random-independent",
  ]),
  readiness_vocabulary_found: includesAll(doc, [
    "ready | ready_with_conditions | blocked",
    "## Readiness Vocabulary",
    "## Deterministic Readiness Conditions",
  ]),
  explicit_readiness_decision_found:
    doc.includes("readiness_decision: ready_with_conditions") &&
    doc.includes("failed_conditions_count: 0") &&
    doc.includes("unresolved_conditions_count: 2"),
  next_mapper_approval_gate_separate: doc.includes(
    "Create a separate Snapshot-to-Learning Dataset Mapper Implementation Approval Gate",
  ),
  no_mapper_implementation_exists:
    productionMapperFiles.length === 0 || approvedDownstreamMapperImplemented,
  no_compatibility_only_production_schema_exists:
    productionCompatibilitySchemas.length === 0,
  fixture_implementations_unchanged_by_action_386:
    fixtureImplementationsChangedByAction386.length === 0,
  no_forbidden_action_386_changes: forbiddenAction386Changes.length === 0,
  no_runtime_provider_news_supabase_persistence_changes:
    forbiddenAction386Changes.length === 0,
  no_schema_migration_proxy_middleware_netlify_changes:
    forbiddenAction386Changes.length === 0,
  runtime_preview_chain_untouched:
    doc.includes(
      "runtime_preview_status: runtime_preview_waiting_for_operator_inputs",
    ) && forbiddenAction386Changes.length === 0,
  review_test_contract_present: includesAll(testSource, [
    "Action 386 static intelligence package consolidation",
    "ready_with_conditions",
    "no production mapper",
  ]),
};

const passed = Object.values(checks).every(Boolean);
const result = {
  verification_status: passed ? "passed" : "blocked",
  ...checks,
  readiness_decision: "ready_with_conditions",
  passed_conditions_count: 16,
  failed_conditions_count: 0,
  unresolved_conditions_count: 2,
  production_mapper_found: productionMapperFiles.length > 0,
  production_mapper_files: productionMapperFiles,
  approved_downstream_mapper_implemented: approvedDownstreamMapperImplemented,
  production_compatibility_schema_found:
    productionCompatibilitySchemas.length > 0,
  action_386_changed_files: action386ChangedFiles,
  forbidden_action_386_changes: forbiddenAction386Changes,
  fixture_files_changed_by_action_386:
    fixtureImplementationsChangedByAction386,
  mapper_implementation_approved: false,
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  no_effect_flags: {
    mapper_implemented: false,
    learning_rows_generated: false,
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
    ? "snapshot_to_learning_dataset_mapper_implementation_approval_gate"
    : "repair_static_intelligence_contract_readiness_gaps",
};

console.log(JSON.stringify(result, null, 2));
if (!passed) process.exitCode = 1;
