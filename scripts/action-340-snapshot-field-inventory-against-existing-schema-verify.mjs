#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const docPath = "docs/action-340-snapshot-field-inventory-against-existing-schema.md";

const sourceSurfaces = [
  "Supabase migrations and schema docs",
  "recommendation-related TypeScript types",
  "recommendation generation helpers",
  "snapshot helpers",
  "history/statistics helpers",
  "outcome/replay helpers",
  "static replay model files",
  "scan run / provider audit files",
  "tests referencing recommendation/snapshot/outcome fields",
];

const inventoryMethod = [
  "local source inspection only",
  "no Supabase remote reads",
  "no provider calls",
  "no migrations",
  "no runtime imports",
  "no schema changes",
  "conservative classification",
  "unknown fields must be marked needs_audit rather than guessed",
];

const fieldGroups = [
  "identity",
  "trade_plan",
  "setup_classification",
  "confidence",
  "quality_gates",
  "market_context",
  "sector_industry_context",
  "relative_strength_context",
  "news_catalyst_context",
  "scan_context",
  "data_provenance",
  "learning_linkage",
  "outcome_fields",
  "derived_learning_fields",
];

const fileCandidateSections = [
  "Schema/Migrations",
  "Lib Helpers",
  "App Surfaces",
  "Tests",
  "Docs",
];

const gapSummary = [
  "Fields Likely Already Covered",
  "Fields Likely Partial",
  "Fields Likely Missing",
  "Fields Requiring Schema Audit",
  "Fields Requiring Type Audit",
  "Fields Requiring History/Statistics Compatibility Audit",
];

const doNotDuplicateRules = [
  "do not create duplicate snapshot IDs",
  "do not create parallel recommendation records",
  "do not create unlinked learning dataset rows",
  "do not create duplicate outcome fields if existing result/outcome model can be mapped",
  "do not create duplicate confidence fields",
  "do not create duplicate provider audit fields",
  "prefer adapters/mappers over parallel architecture",
  "preserve existing History/Statistics compatibility",
];

const additiveNextBuildCandidates = [
  "snapshot field inventory script against concrete files",
  "snapshot completeness static checker",
  "snapshot-to-learning-row mapper design",
  "existing schema compatibility matrix",
  "migration proposal only after concrete gap proof",
  "context field adapter design",
  "outcome field adapter design",
];

const runtimeBlockingStatus = [
  "no schema changes yet",
  "no migrations yet",
  "no Supabase writes yet",
  "no runtime routes yet",
  "no provider calls yet",
  "no news API calls yet",
  "no replay execution yet",
  "no scanner/ranking mutation yet",
  "no confidence threshold changes yet",
  "no deploy",
  "no main push",
];

const nextActions = [
  "Action 341: Learning Dataset Static Fixture Spec",
  "Action 342: Intelligence Context Static Fixture Spec",
  "Action 343: Pattern Insight Static Type Spec",
  "Action 344: Runtime Ping-Only Route Implementation Plan",
  "Action 345: First Tiny Provider Capacity Experiment Plan",
  "Action 346: Existing Schema Compatibility Matrix",
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

const markerRootPaths = ["app", "public"];
const markerFilePaths = ["proxy.ts", "middleware.ts", "middleware.js", "netlify.toml"];
const candidateScanRoots = ["lib", "supabase", "tests", "components", "docs"];

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

function uniqueSorted(items) {
  return [...new Set(items)].sort();
}

const inventoryDocFound = exists(docPath);
const content = inventoryDocFound ? read(docPath) : "";
const candidateFilesChecked = uniqueSorted(
  candidateScanRoots.flatMap((relativePath) => collectFiles(relativePath)),
);
const lowerCandidateFiles = candidateFilesChecked.map((relativePath) => [
  relativePath,
  relativePath.toLowerCase(),
]);
const recommendationRelatedFilesFound = lowerCandidateFiles
  .filter(([, lowerPath]) => lowerPath.includes("recommendation"))
  .map(([relativePath]) => relativePath)
  .slice(0, 40);
const snapshotRelatedFilesFound = lowerCandidateFiles
  .filter(([, lowerPath]) => lowerPath.includes("snapshot"))
  .map(([relativePath]) => relativePath)
  .slice(0, 40);
const outcomeRelatedFilesFound = lowerCandidateFiles
  .filter(([, lowerPath]) => lowerPath.includes("outcome"))
  .map(([relativePath]) => relativePath)
  .slice(0, 40);
const migrationRelatedFilesFound = lowerCandidateFiles
  .filter(([, lowerPath]) => lowerPath.includes("migration") || lowerPath.includes("supabase/migrations"))
  .map(([relativePath]) => relativePath)
  .slice(0, 40);

const inventoryStatusFound = includesAll(content, [
  "snapshot_field_inventory_status: inventory_ready",
  "branch: dev/safe-post-recovery-work",
  "rollback deploy protected: 6a501645908e4100088b7396",
  "clean base commit: 512a0c5",
  "field inventory only",
  "not schema implementation",
  "migration",
  "runtime implementation",
  "provider integration",
  "news integration",
  "Supabase persistence",
  "scanner mutation",
  "ranking mutation",
  "deploy readiness",
  "main-push authorization",
]);
const sourceSurfacesFound = sourceSurfaces.every((item) => content.includes(item));
const inventoryMethodFound = inventoryMethod.every((item) => content.includes(item));
const fieldInventoryTableFound = includesAll(content, [
  "| field group | ideal field from Action 334/335 | likely existing field/source | likely file/module | coverage | confidence | notes | additive next step |",
  "| identity |",
  "| trade_plan |",
  "| news_catalyst_context |",
  "| derived_learning_fields |",
  "| existing |",
  "| partial |",
  "| missing |",
  "| needs_audit |",
]);
const fieldGroupsFound = fieldGroups.every((item) => content.includes(item));
const existingSourceFileCandidatesFound = fileCandidateSections.every((item) =>
  content.includes(item),
);
const gapSummaryFound = gapSummary.every((item) => content.includes(item));
const doNotDuplicateRulesFound = doNotDuplicateRules.every((item) =>
  content.includes(item),
);
const additiveNextBuildCandidatesFound = additiveNextBuildCandidates.every((item) =>
  content.includes(item),
);
const runtimeBlockingStatusFound = runtimeBlockingStatus.every((item) =>
  content.includes(item),
);
const nextActionsFound = nextActions.every((item) => content.includes(item));
const blocksUnsafeWorkFound = includesAll(content, [
  "does not authorize deploys",
  "main pushes",
  "runtime route changes",
  "provider calls",
  "news API calls",
  "Supabase remote reads",
  "Supabase reads",
  "Supabase writes",
  "schema changes",
  "migrations",
  "scanner mutations",
  "ranking mutations",
  "confidence threshold changes",
]);

const forbiddenRuntimeArtifacts = forbiddenRuntimePaths.filter(exists);
const forbiddenMarkersFound = [
  "action_307k_proxy_runtime_crash_isolation",
].filter(markerFound);

const passed =
  inventoryDocFound &&
  inventoryStatusFound &&
  sourceSurfacesFound &&
  inventoryMethodFound &&
  fieldInventoryTableFound &&
  fieldGroupsFound &&
  existingSourceFileCandidatesFound &&
  gapSummaryFound &&
  doNotDuplicateRulesFound &&
  additiveNextBuildCandidatesFound &&
  runtimeBlockingStatusFound &&
  nextActionsFound &&
  blocksUnsafeWorkFound &&
  forbiddenRuntimeArtifacts.length === 0 &&
  forbiddenMarkersFound.length === 0;

const result = {
  verification_status: passed ? "passed" : "failed",
  inventory_doc_found: inventoryDocFound,
  inventory_status_found: inventoryStatusFound,
  source_surfaces_found: sourceSurfacesFound,
  inventory_method_found: inventoryMethodFound,
  field_inventory_table_found: fieldInventoryTableFound,
  field_groups_found: fieldGroupsFound,
  existing_source_file_candidates_found: existingSourceFileCandidatesFound,
  gap_summary_found: gapSummaryFound,
  do_not_duplicate_rules_found: doNotDuplicateRulesFound,
  additive_next_build_candidates_found: additiveNextBuildCandidatesFound,
  runtime_blocking_status_found: runtimeBlockingStatusFound,
  next_actions_found: nextActionsFound,
  deploy_readiness: false,
  main_push_allowed: false,
  runtime_route_changes_allowed: false,
  provider_call_allowed: false,
  news_api_call_allowed: false,
  supabase_write_allowed: false,
  schema_change_allowed: false,
  migration_allowed: false,
  scanner_ranking_mutation_allowed: false,
  confidence_threshold_mutation_allowed: false,
  candidate_files_checked: candidateFilesChecked.length,
  recommendation_related_files_found: recommendationRelatedFilesFound,
  snapshot_related_files_found: snapshotRelatedFilesFound,
  outcome_related_files_found: outcomeRelatedFilesFound,
  migration_related_files_found: migrationRelatedFilesFound,
  forbidden_runtime_artifacts_found: forbiddenRuntimeArtifacts,
  forbidden_markers_found: forbiddenMarkersFound,
  no_effect_flags: {
    provider_call_executed: false,
    provider_call_attempted: false,
    news_api_call_executed: false,
    news_api_call_attempted: false,
    supabase_remote_read_executed: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    schema_changed: false,
    migration_created: false,
    migration_altered: false,
    snapshots_persisted: false,
    candles_persisted: false,
    news_persisted: false,
    raw_response_persisted: false,
    fetch_run_persisted: false,
    synthetic_outcomes_persisted: false,
    replay_executed: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    recommendations_mutated: false,
    confidence_thresholds_mutated: false,
    visible_recommendations_changed: false,
    outcome_persistence_changed: false,
    learning_acceleration_changed: false,
    add_trade_changed: false,
    broker_execution_risk_changed: false,
  },
  recommended_next_step: passed
    ? "action_341_learning_dataset_static_fixture_spec"
    : "fix_snapshot_field_inventory_or_remove_forbidden_runtime_artifacts",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
