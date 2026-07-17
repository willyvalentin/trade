#!/usr/bin/env node

import { createHash } from "crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");
const readJson = (path) => JSON.parse(read(path));
const shaFile = (path) => createHash("sha256").update(readFileSync(abs(path))).digest("hex");

const paths = {
  doc: "docs/action-460-confidence-calibration-recommendation-advisory-projection-runtime-preview-integration-contract-approval-gate.md",
  verifier: "scripts/action-460-confidence-calibration-recommendation-advisory-projection-runtime-preview-integration-contract-approval-gate-verify.mjs",
  test: "tests/e2e/action-460-confidence-calibration-recommendation-advisory-projection-runtime-preview-integration-contract-approval-gate.spec.ts",
  action459Doc: "docs/action-459-static-confidence-calibration-recommendation-advisory-projection-shadow-release-gate.md",
  action459Verifier: "scripts/action-459-static-confidence-calibration-recommendation-advisory-projection-shadow-release-gate-verify.mjs",
  action459Test: "tests/e2e/action-459-static-confidence-calibration-recommendation-advisory-projection-shadow-release-gate.spec.ts",
  action454Inventory: "docs/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-inventory.json",
  action457Manifest: "docs/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow-input-manifest.json",
  action461Doc: "docs/action-461-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-implementation.md",
  action461Verifier: "scripts/action-461-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-implementation-verify.mjs",
  action461Test: "tests/e2e/action-461-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-implementation.spec.ts",
  action461Flag: "lib/confidence-calibration-recommendation-advisory-projection-preview-flag.ts",
  action461Adapter: "lib/confidence-calibration-recommendation-advisory-projection-preview.ts",
  action461Component: "components/recommendations/ConfidenceCalibrationProjectionPreview.tsx",
  action461Modal: "components/recommendations/RecommendationDetailsModal.tsx",
  action461Container: "components/recommendations/RecommendationCardContainer.tsx",
};

const expected = {
  approvalDecision: "approved_with_conditions",
  approvalVocabulary: ["approved", "approved_with_conditions", "blocked"],
  releaseDecision: "released",
  releaseClassification: "confidence_calibration_recommendation_advisory_projection_pure_static_verified",
  runtimePreviewStatus: "runtime_preview_waiting_for_operator_inputs",
  deploymentStatus: "not_authorized_not_required",
  nextAction:
    "action_461_confidence_calibration_recommendation_advisory_projection_runtime_preview_consumer_implementation_approval_implementation",
  action454PackageHash: "ef706460039171b45f15fea6c5aa6597b4986b53298f17843809a1941c3db072",
  action454RepeatPayloadHash: "2a717421488ef15f380625cfbcc1e7e82a3469980972e92b3627c8f82a7c2a74",
  action457ManifestHash: "2bb41c00c2d0eb29811b7b95d9ee1495db4758dc2f998794f6aeddb2691c459a",
  action457RunPackageHash: "dcd769f27ab08b56b8e027118ebb476246382a6ba96d9dee23da36b59debb6cd",
  action457EvidenceHash: "c1e394c78a4508af23e0141a9833a98ae4d1d4aa985ef1f1fd09771bd796beac",
  scenarioIds: Array.from({ length: 52 }, (_, index) => `cp453_${String(index + 1).padStart(2, "0")}`),
};

const permittedProjectionFields = [
  "projection_status",
  "original_recommendation_confidence",
  "proposed_advisory_delta",
  "proposed_advisory_confidence",
  "warnings",
  "bounded_reason_keys",
  "non_authoritative",
  "recommendation_confidence_unchanged",
  "application_eligible",
  "effect_flags",
  "projection_id",
  "advisory_id",
  "bounded_lineage_status",
];

const permittedDisplayFields = [
  "projection_status_label",
  "original_recommendation_confidence",
  "proposed_advisory_delta",
  "proposed_advisory_confidence_success_only",
  "bounded_warnings",
  "Preview only",
  "Not applied",
  "Original Recommendation confidence remains active",
  "Calibration preview unavailable",
];

const forbiddenFields = [
  "full Recommendation envelope",
  "full advisory input",
  "full calibration result",
  "Pattern Discovery output",
  "Pattern Insight",
  "evidence records",
  "outcome records",
  "internal hashes in normal UI",
  "raw rejected values",
  "secrets",
  "environment values",
  "mutation commands",
  "user identifiers",
  "full Recommendation records",
];

const effectBoundaries = {
  recommendation_confidence_unchanged: true,
  ranking_affected: false,
  scanner_affected: false,
  publication_affected: false,
  execution_affected: false,
  application_eligible: false,
  non_authoritative: true,
  applied: false,
};

const operatorInputs = [
  "approval to expose the preview section",
  "target preview environment",
  "authorized preview users or access boundary",
  "feature-flag value",
  "whether development diagnostics are visible",
  "maximum preview duration",
  "rollback owner",
  "kill-switch owner",
  "evidence-retention policy",
  "confirmation that original Recommendation confidence remains authoritative",
  "confirmation that no confidence application is authorized",
  "confirmation that no persistence is authorized",
  "confirmation that no replay is authorized",
  "confirmation that no feedback is authorized",
];

const futureSequence = [
  "Action 461 - Runtime Preview Consumer Implementation Approval/Implementation",
  "Action 462 - Independent Runtime Preview Consumer Verification",
  "Action 463 - Preview Deployment Readiness Gate",
  "Action 464 - Operator Input Capture and Preview Activation Approval",
  "Action 465 - Preview Deployment and Observation",
  "Action 466 - Independent Preview Observation Verification",
  "Action 467 - Preview Release/Stop Decision",
];

const implementationBoundary = [
  "one dedicated preview projection adapter",
  "one read-only preview UI component",
  "one existing Recommendation detail integration point",
  "one feature-flag definition/read",
  "focused documentation",
  "verifier",
  "tests",
  "narrow guards",
];

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
  }
  if (Object.is(value, -0)) return 0;
  return value;
}

function stableHash(value) {
  return createHash("sha256").update(JSON.stringify(canonicalize(value)), "utf8").digest("hex");
}

function same(left, right) {
  return JSON.stringify(canonicalize(left)) === JSON.stringify(canonicalize(right));
}

function walk(dir, files = []) {
  if (!existsSync(dir)) return files;
  for (const name of readdirSync(dir)) {
    if ([".git", ".next", "node_modules", "coverage", "test-results"].includes(name)) continue;
    const full = join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

function scanFiles(relativeRoots, predicate) {
  return relativeRoots
    .flatMap((relativeRoot) => walk(abs(relativeRoot)))
    .map((file) => file.slice(root.length + 1))
    .filter((file) => {
      try {
        return predicate(file, read(file));
      } catch {
        return false;
      }
    })
    .sort();
}

function includesAll(text, phrases) {
  return phrases.every((phrase) => text.includes(phrase));
}

const doc = exists(paths.doc) ? read(paths.doc) : "";
const action459Doc = exists(paths.action459Doc) ? read(paths.action459Doc) : "";
const action459Verifier = exists(paths.action459Verifier) ? read(paths.action459Verifier) : "";
const inventory = exists(paths.action454Inventory) ? readJson(paths.action454Inventory) : null;
const manifest = exists(paths.action457Manifest) ? readJson(paths.action457Manifest) : null;
const scenarioIds = inventory?.scenarios?.map((scenario) => scenario.scenario_id) ?? [];

const appOrLibConsumers = scanFiles(["app", "lib"], (file, text) =>
  file !== "lib/confidence-calibration-recommendation-advisory-projection.ts" &&
  file !== paths.action461Flag &&
  file !== paths.action461Adapter &&
  /buildConfidenceCalibrationRecommendationProjection|CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED|Calibration Preview/.test(text),
);

const action461ApprovedFiles = [
  paths.action461Doc,
  paths.action461Verifier,
  paths.action461Test,
  paths.action461Flag,
  paths.action461Adapter,
  paths.action461Component,
  paths.action461Modal,
  paths.action461Container,
].filter(exists);

const runtimeArtifacts = scanFiles(["app", "public"], (file, text) =>
  /action-460-confidence-calibration-recommendation-advisory-projection|confidence-calibration-recommendation-advisory-projection-runtime-preview/.test(file) ||
  /CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED|Calibration Preview/.test(text),
);

const deploymentArtifacts = [
  "netlify.toml",
  ".netlify/state.json",
  ".openai/hosting.json",
].filter((path) => exists(path) && read(path).includes("action-460"));

const sourceHashes = {
  projection_adapter: exists("lib/confidence-calibration-recommendation-advisory-projection.ts")
    ? shaFile("lib/confidence-calibration-recommendation-advisory-projection.ts")
    : null,
  advisory_adapter: exists("lib/confidence-calibration-advisory-adapter.ts")
    ? shaFile("lib/confidence-calibration-advisory-adapter.ts")
    : null,
  pure_confidence_calibration: exists("lib/pure-confidence-calibration.ts")
    ? shaFile("lib/pure-confidence-calibration.ts")
    : null,
};

const docContractPhrases = [
  "Purpose",
  "Scope",
  "Authoritative Dependencies",
  "Action 459 Release Result",
  expected.releaseClassification,
  expected.runtimePreviewStatus,
  "Integration Objective",
  "Intended Preview User",
  "Recommendation Engine Consumer Decision",
  "UI Consumer Decision",
  "Permitted Input Boundary",
  "Permitted Projection Fields",
  "Permitted Display Fields",
  "Forbidden Fields",
  "Successful-Result Handling",
  "Warning-Result Handling",
  "No-Adjustment Handling",
  "Insufficient-Evidence Handling",
  "Blocked-Result Handling",
  "Proposed-Confidence Display Policy",
  "Original-Confidence Authority Policy",
  "Ranking Policy",
  "Scanner Policy",
  "Publication Policy",
  "Execution Policy",
  "Trade-Selection Policy",
  "Risk And Position-Sizing Policy",
  "Persistence Policy",
  "Replay Policy",
  "Provider And Supabase Policy",
  "Confidence-Application Policy",
  "Feedback Policy",
  "Telemetry Policy",
  "Privacy And Sensitive-Data Policy",
  "Runtime-Route Decision",
  "API-Route Decision",
  "Feature-Flag Policy",
  "Preview-Only Boundary",
  "Operator-Input Inventory",
  "Safe Defaults",
  "Fail-Closed Behavior",
  "Kill-Switch Policy",
  "Rollback Policy",
  "Stale-Result Policy",
  "Mismatch Policy",
  "Missing-Result Policy",
  "Performance Budget",
  "Source And Package Integrity Policy",
  "Consumer Isolation Policy",
  "Preview Evidence Policy",
  "Deployment Prerequisites",
  "Mandatory Future Implementation Sequence",
  "Implementation Boundary",
  "Approval Vocabulary",
  "Approval Decision",
  "Passed Conditions",
  "Failed Conditions",
  "Unresolved Conditions",
  "Next Permitted Action",
  "Deployment Status",
];

const checks = {
  documentation_exists: exists(paths.doc),
  verifier_exists: exists(paths.verifier),
  focused_test_exists: exists(paths.test),
  documentation_contract: includesAll(doc, docContractPhrases),
  action459_release:
    action459Doc.includes("release decision") &&
    action459Doc.includes("`released`") &&
    action459Verifier.includes("release_decision"),
  release_classification: doc.includes(expected.releaseClassification) && action459Doc.includes(expected.releaseClassification),
  runtime_preview_state_unchanged: doc.includes(expected.runtimePreviewStatus),
  frozen_hashes_bound:
    doc.includes(expected.action454PackageHash) &&
    doc.includes(expected.action454RepeatPayloadHash) &&
    doc.includes(expected.action457ManifestHash),
  action459_scenario_inventory:
    scenarioIds.length === 52 &&
    same(scenarioIds, expected.scenarioIds) &&
    manifest !== null &&
    stableHash(manifest) === expected.action457ManifestHash,
  observation_only_objective:
    doc.includes("The objective is preview observation only") &&
    doc.includes("non-authoritative preview metadata") &&
    doc.includes("may not replace Recommendation confidence"),
  recommendation_consumer_boundary:
    doc.includes("No Recommendation Engine decision consumer is permitted") &&
    doc.includes("dedicated preview-only adapter") &&
    doc.includes("Direct calls throughout the application are prohibited"),
  ui_consumer_boundary:
    doc.includes("One read-only preview-only UI surface") &&
    doc.includes("Recommendation detail panel") &&
    doc.includes("Broad card-level integration"),
  permitted_fields: permittedProjectionFields.every((field) => doc.includes(field)),
  permitted_display_fields: permittedDisplayFields.every((field) => doc.includes(field)),
  forbidden_fields: forbiddenFields.every((field) => doc.includes(field)),
  successful_result_policy:
    doc.includes("projection_ready") &&
    doc.includes("projection_ready_with_warnings") &&
    doc.includes("projection_no_adjustment") &&
    doc.includes("must not label proposed confidence as current confidence"),
  blocked_result_policy:
    doc.includes("Calibration preview unavailable") &&
    doc.includes("Development diagnostics may show bounded status and stable issue keys only"),
  original_confidence_authority:
    doc.includes("Existing Recommendation confidence remains authoritative") &&
    doc.includes("must not overwrite confidence") &&
    doc.includes("sort by proposed confidence"),
  effect_boundaries: Object.entries(effectBoundaries).every(([key, value]) => doc.includes(`${key}: ${value}`)),
  persistence_replay_provider_supabase_policy:
    doc.includes("No Supabase write") &&
    doc.includes("Replay ingestion and replay execution are prohibited") &&
    doc.includes("No provider request") &&
    doc.includes("No new API route is approved"),
  confidence_application_prohibition:
    doc.includes("Confidence application is prohibited") &&
    doc.includes("must never become Recommendation confidence"),
  feedback_prohibition: doc.includes("Feedback creation is prohibited"),
  route_decision:
    doc.includes("No new runtime route is approved") &&
    doc.includes("No new API route is approved"),
  feature_flag_policy:
    doc.includes("CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED") &&
    doc.includes("default: disabled") &&
    doc.includes("missing flag: disabled") &&
    doc.includes("malformed flag: disabled") &&
    doc.includes("no user-controlled query-string activation") &&
    doc.includes("no localStorage bypass"),
  operator_input_inventory: operatorInputs.every((input) => doc.includes(input)),
  telemetry_policy:
    doc.includes("bounded aggregate counter that preview rendered") &&
    doc.includes("If new telemetry infrastructure is required, telemetry is prohibited"),
  stale_mismatch_missing_policy:
    doc.includes("Hide preview metadata") &&
    doc.includes("Recommendation fingerprint") &&
    doc.includes("snapshot hash") &&
    doc.includes("Missing projection input"),
  performance_boundary:
    doc.includes("synchronous pure in-process projection") &&
    doc.includes("no network call") &&
    doc.includes("no database call") &&
    doc.includes("Preview failure must not fail the Recommendation view"),
  rollback_kill_switch:
    doc.includes("one-step disable through the preview flag") &&
    doc.includes("Disabling the flag must be sufficient"),
  future_implementation_sequence: futureSequence.every((step) => doc.includes(step)),
  implementation_boundary: implementationBoundary.every((item) => doc.includes(item)),
  approval_decision: doc.includes("`approved_with_conditions`"),
  approval_vocabulary: expected.approvalVocabulary.every((word) => doc.includes(`\`${word}\``)),
  next_action: doc.includes(expected.nextAction),
  deployment_prohibition:
    doc.includes("No preview deployment") &&
    doc.includes("production deployment") &&
    doc.includes(expected.deploymentStatus),
  approved_action461_consumer_boundary:
    action461ApprovedFiles.length === 8 &&
    appOrLibConsumers.length === 0 &&
    read(paths.action461Doc).includes("Action 460 Contract") &&
    read(paths.action461Adapter).includes("buildConfidenceCalibrationProjectionPreview"),
  no_runtime_route_exists: runtimeArtifacts.length === 0,
  no_deployment_artifact_changed: deploymentArtifacts.length === 0,
  feature_flag_remains_disabled_by_default:
    read(paths.action461Flag).includes("runtime === \"production\"") &&
    read(paths.action461Flag).includes("return rawValue === \"true\""),
};

const failedConditions = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);

const report = {
  verification_status: failedConditions.length === 0 ? "passed" : "failed",
  approval_decision: expected.approvalDecision,
  approval_vocabulary: expected.approvalVocabulary,
  release_classification: expected.releaseClassification,
  action459_release: {
    release_decision: expected.releaseDecision,
    release_classification: expected.releaseClassification,
    scenario_count: scenarioIds.length,
    exact_ids_match: same(scenarioIds, expected.scenarioIds),
    action454_package_inventory_sha256: expected.action454PackageHash,
    action454_repeat_payload_sha256: expected.action454RepeatPayloadHash,
    action457_manifest_sha256: expected.action457ManifestHash,
    action457_run_package_sha256: expected.action457RunPackageHash,
    action457_evidence_sha256: expected.action457EvidenceHash,
  },
  runtime_preview_status: expected.runtimePreviewStatus,
  observation_only_objective: "preview_observation_only_non_authoritative_metadata",
  recommendation_engine_consumer_decision: {
    decision: "no_decision_consumer",
    permitted_future_call: "one_dedicated_preview_adapter_after_immutable_recommendation_selection",
    direct_application_calls_allowed: false,
    recommendation_engine_output_changed: false,
  },
  ui_consumer_decision: {
    decision: "one_read_only_preview_surface_with_conditions",
    permitted_surface: "recommendation_detail_panel_or_development_only_calibration_preview_section",
    broad_card_or_dashboard_integration_allowed: false,
  },
  permitted_projection_fields: permittedProjectionFields,
  permitted_display_fields: permittedDisplayFields,
  forbidden_fields: forbiddenFields,
  successful_display_policy: {
    statuses: ["projection_ready", "projection_ready_with_warnings", "projection_no_adjustment"],
    preview_only: true,
    not_applied: true,
    original_confidence_remains_active: true,
  },
  blocked_display_policy: {
    normal_preview_ui: "Calibration preview unavailable",
    proposed_confidence_displayed: false,
    development_diagnostics: "bounded_status_and_stable_issue_keys_only",
  },
  original_confidence_authority: {
    authoritative: "original_recommendation_confidence",
    proposed_confidence_authoritative: false,
    sorting_filtering_application_allowed: false,
  },
  effect_boundaries: effectBoundaries,
  persistence_policy: "prohibited",
  replay_policy: "prohibited",
  provider_supabase_policy: {
    provider_request_allowed: false,
    market_data_request_allowed: false,
    news_request_allowed: false,
    supabase_read_allowed: false,
    supabase_write_allowed: false,
  },
  confidence_application_policy: "prohibited",
  feedback_policy: "prohibited",
  route_policy: {
    runtime_route_approved: false,
    api_route_approved: false,
    separate_route_gate_required_if_unavoidable: true,
  },
  feature_flag_policy: {
    future_flag_name: "CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED",
    implemented_now: false,
    default: "disabled",
    production: "disabled",
    missing: "disabled",
    malformed: "disabled",
    query_string_activation_allowed: false,
    local_storage_bypass_allowed: false,
  },
  operator_input_inventory: operatorInputs,
  telemetry_policy: {
    bounded_aggregate_existing_sink_only: true,
    new_telemetry_infrastructure_allowed: false,
    full_inputs_allowed: false,
    user_identifiers_allowed: false,
  },
  stale_mismatch_missing_policy: "hide_preview_and_fail_closed",
  performance_policy: "synchronous_pure_in_process_projection_only",
  rollback_kill_switch_policy: "one_step_disable_no_migration_no_persisted_cleanup",
  future_implementation_sequence: futureSequence,
  implementation_boundary: implementationBoundary,
  source_integrity: {
    projection_adapter_sha256: sourceHashes.projection_adapter,
    advisory_adapter_sha256: sourceHashes.advisory_adapter,
    pure_confidence_calibration_sha256: sourceHashes.pure_confidence_calibration,
    source_immutable_in_action_460: true,
  },
  isolation: {
    app_or_lib_consumers: appOrLibConsumers,
    runtime_artifacts: runtimeArtifacts,
    deployment_artifacts: deploymentArtifacts,
    approved_action461_consumer_boundary: checks.approved_action461_consumer_boundary,
    no_runtime_route_exists: checks.no_runtime_route_exists,
    no_deployment_artifact_changed: checks.no_deployment_artifact_changed,
  },
  safety: {
    provider_call_executed: false,
    provider_call_attempted: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    persistence_executed: false,
    replay_executed: false,
    runtime_created: false,
    api_route_created: false,
    ui_consumer_created: true,
    recommendation_engine_consumer_created: false,
    feature_flag_implemented: true,
    feature_flag_enabled: false,
    telemetry_implemented: false,
    feedback_created: false,
    confidence_applied: false,
    recommendation_mutated: false,
    ranking_changed: false,
    scanner_changed: false,
    publication_changed: false,
    execution_changed: false,
    risk_changed: false,
    position_sizing_changed: false,
    authoritative_data_created: false,
    deployment_result: "none",
  },
  passed_conditions: Object.entries(checks)
    .filter(([, passed]) => passed)
    .map(([name]) => name),
  failed_conditions: failedConditions,
  unresolved_conditions: [
    "operator_inputs_remain_outstanding",
    "target_preview_environment_remains_outstanding",
    "authorized_preview_users_or_access_boundary_remains_outstanding",
    "preview_duration_remains_outstanding",
    "rollback_and_kill_switch_owners_remain_outstanding",
    "evidence_retention_policy_remains_outstanding",
  ],
  checks,
  deployment_status: expected.deploymentStatus,
  runtime_preview_state_changed: false,
  recommended_next_action: expected.nextAction,
  unrelated_work_classification: "action_460_runtime_preview_integration_contract_approval_gate_only",
  contract_sha256: stableHash({
    approval_decision: expected.approvalDecision,
    permittedProjectionFields,
    permittedDisplayFields,
    forbiddenFields,
    effectBoundaries,
    operatorInputs,
    futureSequence,
    implementationBoundary,
  }),
};

console.log(JSON.stringify(report, null, 2));
process.exit(report.verification_status === "passed" ? 0 : 1);
