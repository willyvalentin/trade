#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const docPath =
  "docs/action-353-learning-dataset-static-fixture-implementation-approval-gate.md";

const requiredSections = [
  "## Purpose",
  "## Scope",
  "## Upstream Dependencies",
  "## Explicit Non-Goals",
  "## Proposed Future Fixture Package Boundary",
  "## Allowed Future Implementation Surfaces",
  "## Forbidden Implementation Surfaces",
  "## Fixture Input Contract",
  "## Fixture Output Contract",
  "## Identity Requirements",
  "## Time Semantics",
  "## Anti-Leakage Requirements",
  "## Missing-Data Requirements",
  "## Provenance Requirements",
  "## Schema Compatibility Requirements",
  "## Deterministic Behavior Requirements",
  "## Adapter-First Constraints",
  "## No-Parallel-System Constraints",
  "## Expected Future Fixture Categories",
  "## Minimum Representative Cases",
  "## Malformed And Incomplete Cases",
  "## Boundary Cases",
  "## Gate Conditions",
  "## Acceptance Criteria",
  "## Rejection Criteria",
  "## Approval Decision",
  "## Blocked Work After Approval",
  "## Next Permitted Action",
];

const approvalVocabulary = [
  "approval_decision_vocabulary: approved | approved_with_conditions | blocked",
  "approved: every gate condition is passed",
  "approved_with_conditions: at least one non-critical condition is unresolved but no forbidden surface is required",
  "blocked: any forbidden surface is required or any critical condition fails",
];

const approvalDecision = [
  "approval_decision: approved",
  "approval_scope: future_static_learning_dataset_fixture_implementation_only",
  "fixture_implementation_approved_for_future_action: true",
  "mapper_implementation_approved: false",
  "runtime_work_approved: false",
  "persistence_approved: false",
  "provider_or_supabase_access_approved: false",
  "deploy_approved: false",
  "main_push_approved: false",
];

const fixtureOnlyBoundary = [
  "Action 353 approves only A: a future static fixture implementation for Learning Dataset rows.",
  "Action 353 does not approve B: a mapper implementation.",
  "approved_scope: future_static_learning_dataset_fixture_implementation_only",
  "mapper_implementation_approved: false",
];

const upstreamReferences = [
  "Action 309",
  "Action 334",
  "Action 335",
  "Action 340",
  "Action 341",
  "Action 346",
  "Action 347",
  "Action 352",
];

const futureCoverage = [
  "complete valid row",
  "missing optional context",
  "missing required identity",
  "incomplete outcome",
  "no-outcome-yet state",
  "invalid temporal ordering",
  "snapshot/outcome leakage attempt",
  "unknown categorical values",
  "low provenance completeness",
  "conflicting identity linkage",
  "partial market context",
  "absent news context",
  "absent event context",
  "deterministic reproduction of the same row",
  "explicit null versus unavailable versus unknown semantics",
];

const gateConditions = [
  "fixture implementation can be local-only and static",
  "no runtime integration is required",
  "no database schema changes are required",
  "no Supabase access is required",
  "no provider access is required",
  "no replay is required",
  "no mapper implementation is required",
  "no ranking or confidence behavior changes are required",
  "anti-leakage rules are testable",
  "temporal separation is testable",
  "identities are deterministic",
  "missing-data semantics are explicit",
  "fixtures will extend existing contracts rather than create a parallel system",
  "the future implementation surface is explicitly bounded",
  "All gate conditions are passed, so the deterministic approval_decision is approved.",
];

const safetyProhibitions = [
  "no app/api routes",
  "no proxy.ts changes",
  "no middleware changes",
  "no netlify.toml changes",
  "no migrations",
  "no database schema changes",
  "no Supabase reads or writes",
  "no provider calls",
  "no news API calls",
  "no replay execution",
  "no scanner behavior changes",
  "no ranking behavior changes",
  "no confidence behavior changes",
  "no recommendation generation behavior changes",
  "no persistence",
  "no runtime environment reads",
  "no deploy configuration",
];

const antiLeakageLanguage = [
  "anti-leakage rules are testable",
  "later news must be excluded from snapshot-time context",
  "later market regime labels must be excluded from snapshot-time context",
  "later relative strength must be excluded from snapshot-time context",
  "snapshot/outcome leakage attempt must be represented as a rejection case",
];

const temporalSeparationLanguage = [
  "snapshot-time versus outcome-time separation is testable",
  "snapshot-time features are recommendation geometry",
  "outcome-time fields are target/stop/no-entry/open-at-window-end",
  "outcome fields must never rewrite snapshot-time fields",
];

const deterministicLanguage = [
  "deterministic fixture_case_id",
  "deterministic recommendation_snapshot_id",
  "deterministic evaluated_outcome_id where present",
  "deterministic learning_row_key expectation",
  "stable serialization",
  "no random IDs",
  ["no ", "Date", ".now"].join(""),
  ["no ", "Math", ".random"].join(""),
];

const adapterFirstLanguage = [
  "use existing Recommendation Snapshot contract concepts",
  "use existing Context Snapshot contract concepts",
  "use existing Outcome contract concepts",
  "use existing Learning Dataset Row contract concepts",
  "preserve static replay result compatibility",
  "preserve History and Statistics compatibility",
];

const noParallelSystemLanguage = [
  "no parallel recommendation model",
  "no parallel outcome model",
  "no parallel confidence model",
  "no parallel provider provenance model",
  "no detached learning identity system",
  "no fixture rows disconnected from recommendation snapshot identity",
];

const blockedDownstreamWork = [
  "no mapper implementation",
  "no runtime routes",
  "no provider calls",
  "no news API calls",
  "no Supabase reads",
  "no Supabase writes",
  "no persistence",
  "no schema changes",
  "no migrations",
  "no replay execution",
  "no scanner/ranking/confidence mutation",
  "no recommendation generation mutation",
  "no deploy",
  "no main push",
];

const allowedFutureSurfaces = [
  "`lib/learning-dataset-static-fixtures.ts`",
  "focused fixture documentation",
  "focused Playwright tests",
  "optionally one focused pure validation helper for fixture integrity",
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

const approvalGateFound = exists(docPath);
const content = approvalGateFound ? read(docPath) : "";

const requiredSectionsFound = requiredSections.every((item) => content.includes(item));
const approvalVocabularyFound = approvalVocabulary.every((item) => content.includes(item));
const explicitApprovalDecisionFound = approvalDecision.every((item) =>
  content.includes(item),
);
const fixtureMapperDistinctionFound = fixtureOnlyBoundary.every((item) =>
  content.includes(item),
);
const upstreamReferencesFound = upstreamReferences.every((item) => content.includes(item));
const futureCoverageFound = futureCoverage.every((item) => content.includes(item));
const gateConditionsFound = gateConditions.every((item) => content.includes(item));
const safetyProhibitionsFound = safetyProhibitions.every((item) =>
  content.includes(item),
);
const antiLeakageLanguageFound = antiLeakageLanguage.every((item) =>
  content.includes(item),
);
const temporalSeparationLanguageFound = temporalSeparationLanguage.every((item) =>
  content.includes(item),
);
const deterministicLanguageFound = deterministicLanguage.every((item) =>
  content.includes(item),
);
const adapterFirstLanguageFound = adapterFirstLanguage.every((item) =>
  content.includes(item),
);
const noParallelSystemLanguageFound = noParallelSystemLanguage.every((item) =>
  content.includes(item),
);
const blockedDownstreamWorkFound = blockedDownstreamWork.every((item) =>
  content.includes(item),
);
const allowedFutureSurfacesFound = allowedFutureSurfaces.every((item) =>
  content.includes(item),
);

const forbiddenRuntimeArtifacts = forbiddenRuntimePaths.filter(exists);
const forbiddenMarkersFound = [
  "action_307k_proxy_runtime_crash_isolation",
  "action_307c_hb307c_canary",
  "action_307e_global_api_boundary_regression_fix",
  "action_307l_runtime_boundary_status_static",
].filter(markerFound);

const passed =
  approvalGateFound &&
  requiredSectionsFound &&
  approvalVocabularyFound &&
  explicitApprovalDecisionFound &&
  fixtureMapperDistinctionFound &&
  upstreamReferencesFound &&
  futureCoverageFound &&
  gateConditionsFound &&
  safetyProhibitionsFound &&
  antiLeakageLanguageFound &&
  temporalSeparationLanguageFound &&
  deterministicLanguageFound &&
  adapterFirstLanguageFound &&
  noParallelSystemLanguageFound &&
  blockedDownstreamWorkFound &&
  allowedFutureSurfacesFound &&
  forbiddenRuntimeArtifacts.length === 0 &&
  forbiddenMarkersFound.length === 0;

const result = {
  verification_status: passed ? "passed" : "failed",
  approval_gate_found: approvalGateFound,
  required_sections_found: requiredSectionsFound,
  approval_vocabulary_found: approvalVocabularyFound,
  explicit_approval_decision_found: explicitApprovalDecisionFound,
  approval_decision: explicitApprovalDecisionFound ? "approved" : "blocked",
  fixture_approval_only_found: fixtureMapperDistinctionFound,
  mapper_implementation_approved: false,
  fixture_implementation_done: false,
  upstream_references_found: upstreamReferencesFound,
  future_coverage_found: futureCoverageFound,
  gate_conditions_found: gateConditionsFound,
  safety_prohibitions_found: safetyProhibitionsFound,
  anti_leakage_language_found: antiLeakageLanguageFound,
  temporal_separation_language_found: temporalSeparationLanguageFound,
  deterministic_identity_language_found: deterministicLanguageFound,
  adapter_first_language_found: adapterFirstLanguageFound,
  no_parallel_system_language_found: noParallelSystemLanguageFound,
  blocked_downstream_work_found: blockedDownstreamWorkFound,
  allowed_future_surfaces_found: allowedFutureSurfacesFound,
  fixture_implementation_allowed_for_future_action: true,
  runtime_route_changes_allowed: false,
  provider_call_allowed: false,
  news_api_call_allowed: false,
  supabase_read_allowed: false,
  supabase_write_allowed: false,
  schema_change_allowed: false,
  migration_allowed: false,
  replay_execution_allowed: false,
  scanner_ranking_mutation_allowed: false,
  confidence_behavior_mutation_allowed: false,
  recommendation_generation_mutation_allowed: false,
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
    fixture_implemented: false,
    mapper_implemented: false,
    context_fixtures_implemented: false,
    pattern_insight_fixtures_implemented: false,
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
    confidence_behavior_changed: false,
    recommendations_mutated: false,
    visible_recommendations_changed: false,
    outcome_persistence_changed: false,
    learning_acceleration_changed: false,
    add_trade_changed: false,
    broker_execution_risk_changed: false,
  },
  next_permitted_action:
    "action_354_intelligence_context_static_fixture_implementation_approval_gate",
};

console.log(JSON.stringify(result, null, 2));

if (!passed) {
  process.exitCode = 1;
}
