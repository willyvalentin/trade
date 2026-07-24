#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const docPath =
  "docs/action-354-intelligence-context-static-fixture-implementation-approval-gate.md";

const requiredSections = [
  "## Purpose",
  "## Scope",
  "## Authoritative Dependencies",
  "## Upstream Action Dependencies",
  "## Explicit Non-Goals",
  "## Proposed Future Fixture Package Boundary",
  "## Allowed Future Implementation Surfaces",
  "## Forbidden Implementation Surfaces",
  "## Context Fixture Contract",
  "## Fixture Identity Requirements",
  "## Capture-Time Semantics",
  "## Effective-Time Semantics",
  "## Freshness Semantics",
  "## Provenance Requirements",
  "## Confidence And Source-Quality Metadata Requirements",
  "## Missing-Data Semantics",
  "## Unavailable Versus Unknown Semantics",
  "## Stale-Data Semantics",
  "## Conflicting-Source Semantics",
  "## Partial-Context Semantics",
  "## Anti-Leakage Requirements",
  "## Adapter-First Constraints",
  "## No-Parallel-System Constraints",
  "## Deterministic Behavior Requirements",
  "## Schema Compatibility Requirements",
  "## Minimum Representative Fixture Families",
  "## Malformed And Incomplete Cases",
  "## Boundary Cases",
  "## Gate Conditions",
  "## Acceptance Criteria",
  "## Rejection Criteria",
  "## Approval Decision",
  "## Blocked Work After Approval",
  "## Next Permitted Action",
];

const upstreamReferences = [
  "Action 309",
  "Action 331",
  "Action 332",
  "Action 336",
  "Action 342",
  "Action 348",
  "Action 352",
  "Action 353",
];

const approvalVocabulary = [
  "approval_decision_vocabulary: approved | approved_with_conditions | blocked",
  "approved: every required condition passes",
  "approved_with_conditions: the future static implementation is safe but one or more non-critical contract details must be resolved before implementation",
  "blocked: runtime, external access, schema mutation, persistence, leakage risk, or parallel-system creation would be required",
];

const approvalDecision = [
  "approval_decision: approved",
  "approval_scope: future_static_intelligence_context_fixture_implementation_only",
  "intelligence_context_fixture_implementation_approved_for_future_action: true",
  "live_context_collection_approved: false",
  "provider_or_news_api_access_approved: false",
  "context_persistence_approved: false",
  "runtime_recommendation_integration_approved: false",
  "mapper_implementation_approved: false",
  "pattern_discovery_implementation_approved: false",
  "ranking_or_confidence_change_approved: false",
  "deploy_approved: false",
  "main_push_approved: false",
];

const approvalBoundary = [
  "Action 354 may approve only A: approval to implement static Intelligence Context fixtures.",
  "Action 354 does not approve B: approval to perform live context collection.",
  "Action 354 does not approve C: approval to call provider or news APIs.",
  "Action 354 does not approve D: approval to persist context.",
  "Action 354 does not approve E: approval to integrate context into runtime recommendation behavior.",
];

const contextContract = [
  "fixture_id",
  "fixture_version",
  "fixture_family",
  "ticker",
  "symbol",
  "capture_timestamp",
  "effective_timestamp",
  "source_timestamp",
  "market_context",
  "index_context",
  "sector_industry_context",
  "peer_context",
  "relative_strength_context",
  "company_news_context",
  "company_event_context",
  "macro_calendar_context",
  "data_quality_context",
  "provenance_context",
  "freshness_status",
  "source_quality_metadata",
  "expected_context_labels",
  "expected_missing_context_reasons",
  "anti_leakage_expectation",
  "context_eligibility_status",
];

const minimumFixtureFamilies = [
  "bullish market regime",
  "bearish market regime",
  "neutral or mixed regime",
  "trend day",
  "chop day",
  "elevated volatility",
  "low volatility",
  "incomplete market regime",
  "SPY aligned",
  "SPY diverging",
  "QQQ aligned",
  "QQQ diverging",
  "IWM aligned",
  "IWM diverging",
  "missing index context",
  "strong sector",
  "weak sector",
  "strong industry",
  "weak industry",
  "strong peer group",
  "weak peer group",
  "positive relative strength",
  "negative relative strength",
  "conflicting relative signals",
  "positive company news",
  "negative company news",
  "neutral company news",
  "no material news",
  "news unavailable",
  "earnings event",
  "guidance event",
  "FDA event",
  "SEC event",
  "conflicting event signals",
  "CPI",
  "FOMC",
  "jobs report",
  "options expiration",
  "other high-impact calendar event",
  "no relevant event",
  "event timing before recommendation",
  "event timing after recommendation",
  "invalid future leakage attempt",
  "complete provenance",
  "partial provenance",
  "low-quality provenance",
  "stale source",
  "conflicting sources",
  "unavailable source",
  "unknown categorical value",
  "explicit null",
  "absent optional domain",
  "deterministic reproduction of identical fixture data",
];

const gateConditions = [
  "future fixtures can be implemented entirely locally",
  "no live data collection is required",
  "no provider or news access is required",
  "no Supabase or persistence is required",
  "no schema or migration changes are required",
  "no runtime integration is required",
  "fixture identities and timestamps are deterministic",
  "capture-time semantics are explicit",
  "anti-leakage rules are testable",
  "freshness and provenance are testable",
  "missing/unavailable/unknown states are explicit",
  "stale and conflicting data can be represented",
  "fixture domains extend existing Intelligence Context contracts",
  "no parallel context model is created",
  "the implementation surface is explicitly bounded",
  "mapper, Pattern Discovery, ranking, and confidence changes remain independently blocked",
  "All gate conditions are passed, so the deterministic approval_decision is approved.",
];

const semanticRequirements = [
  "capture-time semantics are explicit",
  "effective-time semantics are explicit where applicable",
  "freshness semantics are explicit and testable",
  "provenance requirements are explicit and testable",
  "source_quality_metadata is required",
  "missing-data semantics are explicit",
  "unavailable versus unknown semantics are explicit",
  "stale-data semantics are explicit",
  "conflicting-source semantics are explicit",
  "partial-context semantics are explicit",
];

const antiLeakageRequirements = [
  "anti-leakage rules are testable",
  "context capture-time semantics prevent future/outcome leakage",
  "event timing after recommendation must not become recommendation-time context",
  "later company news must not become recommendation-time context",
  "future market regime labels must not become recommendation-time context",
  "future relative strength must not become recommendation-time context",
  "outcome fields must not influence context fixture labels",
];

const adapterFirstLanguage = [
  "fixtures should extend existing Intelligence Context contracts",
  "use the Action 336 Intelligence Context Schema concepts",
  "use the Action 342 Intelligence Context Static Fixture Spec concepts",
  "preserve mapper contract compatibility from Action 352",
  "preserve Learning Dataset contract compatibility from Action 353",
  "prefer adapters over new persistence architecture",
];

const noParallelSystemLanguage = [
  "no parallel context model",
  "no parallel provider provenance model",
  "no parallel market regime system",
  "no parallel news/catalyst system",
  "no parallel event/calendar system",
  "no detached context identity system",
  "no runtime collection system",
];

const deterministicRequirements = [
  "fixture identities and timestamps are deterministic",
  "same fixture data serializes the same way",
  "stable array ordering is required",
  ["no ", "Date", ".now"].join(""),
  ["no ", "new ", "Date"].join(""),
  ["no ", "Math", ".random"].join(""),
  "no runtime environment reads",
  "no network calls",
];

const allowedFutureSurfaces = [
  "`lib/intelligence-context-static-fixtures.ts`",
  "focused pure validation helper if required",
  "focused documentation",
  "focused static tests",
];

const blockedDownstreamWork = [
  "no live context collection",
  "no provider calls",
  "no news API calls",
  "no Supabase reads",
  "no Supabase writes",
  "no context persistence",
  "no schema changes",
  "no migrations",
  "no runtime routes",
  "no scanner integration",
  "no ranking integration",
  "no confidence mutation",
  "no mapper implementation",
  "no Pattern Discovery implementation",
  "no replay execution",
  "no deploy",
  "no main push",
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
const upstreamReferencesFound = upstreamReferences.every((item) => content.includes(item));
const approvalVocabularyFound = approvalVocabulary.every((item) => content.includes(item));
const explicitApprovalDecisionFound = approvalDecision.every((item) =>
  content.includes(item),
);
const fixturesOnlyApprovalBoundaryFound = approvalBoundary.every((item) =>
  content.includes(item),
);
const contextContractFound = contextContract.every((item) => content.includes(item));
const minimumFixtureFamiliesFound = minimumFixtureFamilies.every((item) =>
  content.includes(item),
);
const gateConditionsFound = gateConditions.every((item) => content.includes(item));
const semanticRequirementsFound = semanticRequirements.every((item) =>
  content.includes(item),
);
const antiLeakageRequirementsFound = antiLeakageRequirements.every((item) =>
  content.includes(item),
);
const adapterFirstLanguageFound = adapterFirstLanguage.every((item) =>
  content.includes(item),
);
const noParallelSystemLanguageFound = noParallelSystemLanguage.every((item) =>
  content.includes(item),
);
const deterministicRequirementsFound = deterministicRequirements.every((item) =>
  content.includes(item),
);
const allowedFutureSurfacesFound = allowedFutureSurfaces.every((item) =>
  content.includes(item),
);
const blockedDownstreamWorkFound = blockedDownstreamWork.every((item) =>
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
  upstreamReferencesFound &&
  approvalVocabularyFound &&
  explicitApprovalDecisionFound &&
  fixturesOnlyApprovalBoundaryFound &&
  contextContractFound &&
  minimumFixtureFamiliesFound &&
  gateConditionsFound &&
  semanticRequirementsFound &&
  antiLeakageRequirementsFound &&
  adapterFirstLanguageFound &&
  noParallelSystemLanguageFound &&
  deterministicRequirementsFound &&
  allowedFutureSurfacesFound &&
  blockedDownstreamWorkFound &&
  forbiddenRuntimeArtifacts.length === 0 &&
  forbiddenMarkersFound.length === 0;

const result = {
  verification_status: passed ? "passed" : "failed",
  approval_gate_found: approvalGateFound,
  required_sections_found: requiredSectionsFound,
  upstream_references_found: upstreamReferencesFound,
  approval_vocabulary_found: approvalVocabularyFound,
  explicit_approval_decision_found: explicitApprovalDecisionFound,
  approval_decision: explicitApprovalDecisionFound ? "approved" : "blocked",
  fixtures_only_approval_boundary_found: fixturesOnlyApprovalBoundaryFound,
  context_contract_found: contextContractFound,
  minimum_fixture_families_found: minimumFixtureFamiliesFound,
  gate_conditions_found: gateConditionsFound,
  semantic_requirements_found: semanticRequirementsFound,
  anti_leakage_requirements_found: antiLeakageRequirementsFound,
  adapter_first_language_found: adapterFirstLanguageFound,
  no_parallel_system_language_found: noParallelSystemLanguageFound,
  deterministic_requirements_found: deterministicRequirementsFound,
  allowed_future_surfaces_found: allowedFutureSurfacesFound,
  blocked_downstream_work_found: blockedDownstreamWorkFound,
  intelligence_context_fixture_implementation_allowed_for_future_action: true,
  live_context_collection_approved: false,
  provider_or_news_api_access_approved: false,
  context_persistence_approved: false,
  runtime_recommendation_integration_approved: false,
  mapper_implementation_approved: false,
  pattern_discovery_implementation_approved: false,
  ranking_or_confidence_change_approved: false,
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
    intelligence_context_fixtures_implemented: false,
    learning_dataset_fixtures_implemented: false,
    mapper_implemented: false,
    pattern_insight_fixtures_implemented: false,
    learning_rows_generated: false,
    context_persisted: false,
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
  next_permitted_action: "action_355_pattern_insight_static_fixture_implementation_plan",
};

console.log(JSON.stringify(result, null, 2));

if (!passed) {
  process.exitCode = 1;
}
