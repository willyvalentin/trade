#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const docPath = "docs/action-346-existing-schema-compatibility-matrix.md";

const classifications = [
  "existing_compatible",
  "adapter_needed",
  "extension_candidate",
  "migration_candidate",
  "duplicate_risk",
  "needs_audit",
  "blocked",
];

const sourceSurfaces = [
  "Supabase migrations",
  "recommendation tables/docs",
  "recommendation snapshot types",
  "outcome/replay types",
  "historical candle tables",
  "fetch-run/audit tables",
  "History/Statistics helpers",
  "static replay model",
  "scan run metadata",
  "provider data helpers",
  "tests that encode existing field expectations",
];

const compatibilityDomains = [
  "recommendation identity",
  "trade plan",
  "setup taxonomy",
  "confidence",
  "quality gates",
  "market regime context",
  "sector/industry context",
  "relative strength context",
  "news/catalyst context",
  "calendar/event context",
  "data provenance",
  "historical candles",
  "fetch-run audit",
  "replay/outcome result",
  "learning outcome dataset",
  "pattern insight",
  "History/Statistics reporting",
  "provider capacity experiment",
];

const migrationCandidateRules = [
  "no migration should be created from this action",
  "migration candidates require exact existing schema proof",
  "migration candidates require backward compatibility analysis",
  "migration candidates require History/Statistics impact review",
  "migration candidates require production migration safety plan",
  "migration candidates require rollback/readback strategy",
];

const adapterFirstRules = [
  "prefer mapping existing fields into learning dataset rows",
  "prefer context envelope adapters over parallel tables",
  "prefer outcome adapters over duplicate outcome records",
  "prefer provider audit adapters over new audit concepts",
  "preserve existing static replay result model compatibility",
  "preserve History/Statistics compatibility",
];

const duplicateRiskWarnings = [
  "duplicate recommendation rows",
  "duplicate snapshot ids",
  "duplicate outcome records",
  "duplicate confidence fields",
  "duplicate setup taxonomy fields",
  "duplicate provider audit rows",
  "duplicate candle persistence tables",
  "duplicate learning dataset rows not linked to snapshots",
  "duplicate pattern insight persistence without dataset linkage",
];

const gapProofRequirements = [
  "exact file/schema reference",
  "missing field proof",
  "inability to adapt existing field",
  "downstream consumer impact",
  "migration need",
  "test coverage plan",
  "rollback/readback plan",
];

const blockedWork = [
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
  "Action 347: Learning Dataset Static Fixture Implementation Plan",
  "Action 348: Intelligence Context Static Fixture Implementation Plan",
  "Action 349: Pattern Insight Static Fixture Spec",
  "Action 350: Runtime Ping-Only Route Approval Gate",
  "Action 351: First Tiny Provider Capacity Experiment Approval Gate",
  "Action 352: Snapshot-to-Learning Dataset Mapper Plan",
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

const compatibilityMatrixFound = exists(docPath);
const content = compatibilityMatrixFound ? read(docPath) : "";

const matrixStatusFound = includesAll(content, [
  "existing_schema_compatibility_status: matrix_ready",
  "branch: dev/safe-post-recovery-work",
  "rollback deploy protected: 6a501645908e4100088b7396",
  "clean base commit: 512a0c5",
  "schema compatibility planning only",
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
const classificationModelFound = classifications.every((item) => content.includes(item));
const sourceSurfacesFound = sourceSurfaces.every((item) => content.includes(item));
const compatibilityDomainsFound = compatibilityDomains.every((item) =>
  content.includes(item),
);
const migrationCandidateRulesFound = migrationCandidateRules.every((item) =>
  content.includes(item),
);
const adapterFirstRulesFound = adapterFirstRules.every((item) => content.includes(item));
const duplicateRiskWarningsFound = duplicateRiskWarnings.every((item) =>
  content.includes(item),
);
const gapProofRequirementsFound = gapProofRequirements.every((item) =>
  content.includes(item),
);
const blockedWorkFound = blockedWork.every((item) => content.includes(item));
const nextActionsFound = nextActions.every((item) => content.includes(item));
const blocksUnsafeWorkFound = includesAll(content, [
  "does not authorize schema changes",
  "migrations",
  "Supabase remote reads",
  "Supabase reads",
  "Supabase writes",
  "runtime route changes",
  "provider calls",
  "news API calls",
  "replay execution",
  "scanner mutations",
  "ranking mutations",
  "confidence threshold changes",
  "deploys",
  "main pushes",
]);

const forbiddenRuntimeArtifacts = forbiddenRuntimePaths.filter(exists);
const forbiddenMarkersFound = [
  "action_307k_proxy_runtime_crash_isolation",
].filter(markerFound);

const passed =
  compatibilityMatrixFound &&
  matrixStatusFound &&
  classificationModelFound &&
  sourceSurfacesFound &&
  compatibilityDomainsFound &&
  migrationCandidateRulesFound &&
  adapterFirstRulesFound &&
  duplicateRiskWarningsFound &&
  gapProofRequirementsFound &&
  blockedWorkFound &&
  nextActionsFound &&
  blocksUnsafeWorkFound &&
  forbiddenRuntimeArtifacts.length === 0 &&
  forbiddenMarkersFound.length === 0;

const result = {
  verification_status: passed ? "passed" : "failed",
  compatibility_matrix_found: compatibilityMatrixFound,
  matrix_status_found: matrixStatusFound,
  classification_model_found: classificationModelFound,
  source_surfaces_found: sourceSurfacesFound,
  compatibility_domains_found: compatibilityDomainsFound,
  migration_candidate_rules_found: migrationCandidateRulesFound,
  adapter_first_rules_found: adapterFirstRulesFound,
  duplicate_risk_warnings_found: duplicateRiskWarningsFound,
  gap_proof_requirements_found: gapProofRequirementsFound,
  blocked_work_found: blockedWorkFound,
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
    learning_dataset_persisted: false,
    context_snapshots_persisted: false,
    pattern_insights_persisted: false,
    route_implemented: false,
    app_api_route_added: false,
    app_page_route_added: false,
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
  recommended_next_step: "action_347_learning_dataset_static_fixture_implementation_plan",
};

console.log(JSON.stringify(result, null, 2));

if (!passed) {
  process.exitCode = 1;
}
