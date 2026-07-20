#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const docPath = "docs/action-352-snapshot-to-learning-dataset-mapper-plan.md";

const actionReferences = [
  "Action 334",
  "Action 335",
  "Action 340",
  "Action 341",
  "Action 346",
  "Action 347",
];

const inputContract = [
  "recommendation_snapshot",
  "recommendation_identity",
  "trade_plan",
  "setup_and_confidence",
  "quality_gate_summary",
  "optional_context_snapshot_envelope",
  "evaluated_outcome",
  "data_provenance",
  "mapper_version",
  "inputs should adapt existing types where possible",
  "missing optional context must remain explicit",
  "outcome data must not be used to fill snapshot-time fields",
];

const outputContract = [
  "identity",
  "snapshot_time_inputs",
  "trade_plan",
  "setup_and_confidence",
  "quality_gates",
  "market_context",
  "sector_industry_context",
  "relative_strength_context",
  "news_catalyst_context",
  "calendar_event_context",
  "data_provenance",
  "outcome_fields",
  "derived_learning_fields",
  "anti_leakage_status",
  "learning_eligibility_status",
  "missing_context_reasons",
  "mapper_version",
];

const identityLinkageRules = [
  "one learning row per recommendation_snapshot_id plus outcome window/version",
  "recommendation identity preserved",
  "snapshot identity preserved",
  "outcome identity preserved where existing",
  "source scan/run linkage preserved",
  "no random IDs",
  "no duplicate row for same snapshot/outcome version",
  "deterministic learning_row_key",
];

const temporalSeparationRules = [
  "Snapshot-time fields:",
  "Outcome-time fields:",
  "recommendation geometry",
  "context available at recommendation time",
  "target/stop/no-entry/open-at-window-end",
  "realized gross R",
  "MFE/MAE",
  "Outcome fields must never influence snapshot-time fields",
];

const mappingDomains = [
  "recommendation identity",
  "snapshot identity",
  "ticker/direction",
  "timestamps/window",
  "entry/stop/target",
  "setup family",
  "confidence value/bucket",
  "quality gates",
  "market regime",
  "sector/industry",
  "relative strength",
  "catalyst/news",
  "calendar event",
  "provenance",
  "outcome classification",
  "R metrics",
  "derived labels",
  "learning eligibility",
];

const mappingMatrixRequirements = [
  "target learning field/group",
  "source object/field",
  "mapping type",
  "direct | normalized | derived | optional | missing",
  "anti-leakage requirement",
  "compatibility classification from Action 346",
  "fallback behavior",
  ...mappingDomains,
];

const missingDataRules = [
  "never silently invent context",
  "use null/unknown only where contract allows",
  "populate missing_context_reasons",
  "learning eligibility may be full, limited, or excluded",
  "missing news is not equivalent to no catalyst",
  "missing sector mapping is explicit",
  "uncertain provenance lowers eligibility",
  "missing outcome prevents completed learning row",
];

const antiLeakageRules = [
  "snapshot timestamps precede or equal all snapshot-time source timestamps",
  "later news excluded",
  "later regime labels excluded",
  "later relative strength excluded",
  "outcome timestamps remain outcome-only",
  "derived labels consume outcomes but cannot rewrite source snapshot",
  "mapper version auditable",
  "enrichment version auditable",
];

const adapterFirstRules = [
  "reuse existing snapshot/result/outcome types",
  "prefer adapters over parallel models",
  "preserve static replay result compatibility",
  "preserve History/Statistics compatibility",
  "no duplicate recommendation tables",
  "no duplicate outcome records",
  "no duplicate confidence fields",
  "no duplicate provider provenance concepts",
  "no learning row without snapshot linkage",
];

const allowedFutureFiles = [
  "`lib/snapshot-to-learning-dataset-mapper.ts`",
  "optionally one focused pure validation helper",
  "focused fixtures/tests",
  "one implementation result doc",
  "No app/api, provider, Supabase, migration, scanner, ranking, proxy, middleware, or Netlify files may change.",
];

const validationRequirements = [
  "deterministic mapping",
  "stable serialization",
  "same inputs produce same row",
  "duplicate-key detection",
  "all Action 341 scenarios mappable",
  "missing-context scenarios handled",
  "anti-leakage fixture rejected or limited correctly",
  "no provider/Supabase/runtime imports",
  "no writes",
  "no mutation of input objects",
];

const readinessLevels = [
  "LM0 mapper need undefined",
  "LM1 input/output contracts documented",
  "LM2 field mapping matrix defined",
  "LM3 identity/linkage rules defined",
  "LM4 missing-data rules defined",
  "LM5 anti-leakage validation defined",
  "LM6 implementation plan ready",
  "LM7 implementation approval granted",
  "LM8 local mapper implemented",
  "LM9 local fixture validation complete",
  "LM10 offline learning-row generation ready",
  "Current status is LM6",
  "Mapper implementation is not authorized",
];

const blockedWork = [
  "no mapper implementation",
  "no learning-row generation",
  "no dataset persistence",
  "no Supabase access",
  "no schema or migration changes",
  "no runtime routes",
  "no provider/news calls",
  "no replay execution",
  "no scanner/ranking/confidence mutation",
  "no deploy",
  "no main push",
];

const nextActions = [
  "Action 353: Learning Dataset Static Fixture Implementation Approval Gate",
  "Action 354: Intelligence Context Static Fixture Implementation Approval Gate",
  "Action 355: Pattern Insight Static Fixture Implementation Plan",
  "Action 356: Runtime Ping-Only Route Implementation Readiness Review",
  "Action 357: First Tiny Provider Capacity Experiment Implementation Readiness Review",
  "Action 358: Snapshot-to-Learning Dataset Mapper Implementation Approval Gate",
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

const mapperPlanFound = exists(docPath);
const content = mapperPlanFound ? read(docPath) : "";

const planStatusFound = includesAll(content, [
  "snapshot_to_learning_dataset_mapper_plan_status: mapper_plan_ready",
  "mapper_implementation_allowed: false",
  "learning_dataset_persistence_allowed: false",
  "deploy_readiness: false",
  "main_push_allowed: false",
  "branch: dev/safe-post-recovery-work",
  "rollback deploy protected: 6a501645908e4100088b7396",
  "clean base commit: 512a0c5",
  "This is mapper planning only",
]);
const actionReferencesFound = actionReferences.every((item) => content.includes(item));
const inputContractFound = inputContract.every((item) => content.includes(item));
const outputContractFound = outputContract.every((item) => content.includes(item));
const identityLinkageRulesFound = identityLinkageRules.every((item) => content.includes(item));
const temporalSeparationFound = temporalSeparationRules.every((item) => content.includes(item));
const mappingMatrixFound = mappingMatrixRequirements.every((item) => content.includes(item));
const missingDataBehaviorFound = missingDataRules.every((item) => content.includes(item));
const antiLeakageRulesFound = antiLeakageRules.every((item) => content.includes(item));
const adapterFirstRulesFound = adapterFirstRules.every((item) => content.includes(item));
const allowedFutureFilesFound = allowedFutureFiles.every((item) => content.includes(item));
const validationRequirementsFound = validationRequirements.every((item) => content.includes(item));
const readinessLevelsFound = readinessLevels.every((item) => content.includes(item));
const blockedWorkFound = blockedWork.every((item) => content.includes(item));
const nextActionsFound = nextActions.every((item) => content.includes(item));

const forbiddenRuntimeArtifacts = forbiddenRuntimePaths.filter(exists);
const forbiddenMarkersFound = [
  "action_307k_proxy_runtime_crash_isolation",
  "action_307c_hb307c_canary",
  "action_307e_global_api_boundary_regression_fix",
  "action_307l_runtime_boundary_status_static",
].filter(markerFound);

const passed =
  mapperPlanFound &&
  planStatusFound &&
  actionReferencesFound &&
  inputContractFound &&
  outputContractFound &&
  identityLinkageRulesFound &&
  temporalSeparationFound &&
  mappingMatrixFound &&
  missingDataBehaviorFound &&
  antiLeakageRulesFound &&
  adapterFirstRulesFound &&
  allowedFutureFilesFound &&
  validationRequirementsFound &&
  readinessLevelsFound &&
  blockedWorkFound &&
  nextActionsFound &&
  forbiddenRuntimeArtifacts.length === 0 &&
  forbiddenMarkersFound.length === 0;

const result = {
  verification_status: passed ? "passed" : "failed",
  mapper_plan_found: mapperPlanFound,
  plan_status_found: planStatusFound,
  action_references_found: actionReferencesFound,
  input_contract_found: inputContractFound,
  output_contract_found: outputContractFound,
  identity_linkage_rules_found: identityLinkageRulesFound,
  temporal_separation_found: temporalSeparationFound,
  mapping_matrix_found: mappingMatrixFound,
  mapping_domains_found: Object.fromEntries(
    mappingDomains.map((domain) => [domain, content.includes(domain)]),
  ),
  missing_data_behavior_found: missingDataBehaviorFound,
  anti_leakage_rules_found: antiLeakageRulesFound,
  adapter_first_rules_found: adapterFirstRulesFound,
  allowed_future_files_found: allowedFutureFilesFound,
  validation_requirements_found: validationRequirementsFound,
  readiness_levels_found: readinessLevelsFound,
  blocked_work_found: blockedWorkFound,
  next_actions_found: nextActionsFound,
  mapper_implementation_allowed: false,
  learning_row_generation_allowed: false,
  learning_dataset_persistence_allowed: false,
  supabase_read_allowed: false,
  supabase_write_allowed: false,
  schema_change_allowed: false,
  migration_allowed: false,
  runtime_route_changes_allowed: false,
  provider_call_allowed: false,
  news_api_call_allowed: false,
  replay_execution_allowed: false,
  scanner_ranking_mutation_allowed: false,
  confidence_threshold_mutation_allowed: false,
  deploy_readiness: false,
  main_push_allowed: false,
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
    mapper_implemented: false,
    fixtures_implemented: false,
    learning_rows_generated: false,
    learning_dataset_persisted: false,
    schema_changed: false,
    migration_created: false,
    migration_altered: false,
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
  recommended_next_step: "action_353_learning_dataset_static_fixture_implementation_approval_gate",
};

console.log(JSON.stringify(result, null, 2));

if (!passed) {
  process.exitCode = 1;
}
