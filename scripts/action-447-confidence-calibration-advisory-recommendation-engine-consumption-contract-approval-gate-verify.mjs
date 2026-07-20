#!/usr/bin/env node

import { spawnSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");

const paths = {
  doc: "docs/action-447-confidence-calibration-advisory-recommendation-engine-consumption-contract-approval-gate.md",
  verifier: "scripts/action-447-confidence-calibration-advisory-recommendation-engine-consumption-contract-approval-gate-verify.mjs",
  test: "tests/e2e/action-447-confidence-calibration-advisory-recommendation-engine-consumption-contract-approval-gate.spec.ts",
  action446Verifier: "scripts/action-446-static-confidence-calibration-advisory-shadow-release-gate-verify.mjs",
  projectionAdapter: "lib/confidence-calibration-recommendation-advisory-projection.ts",
};

const expected = {
  approvalDecision: "approved",
  approvalVocabulary: ["approved", "approved_with_conditions", "blocked"],
  action446Classification: "confidence_calibration_advisory_pure_static_verified",
  action446Decision: "released",
  nextAction: "action_448_confidence_calibration_recommendation_advisory_projection_implementation",
  projectionFunction: "buildConfidenceCalibrationRecommendationProjection",
  runtimePreviewStatus: "runtime_preview_waiting_for_operator_inputs",
  eligibleStatuses: ["advisory_ready", "advisory_ready_with_warnings", "advisory_no_adjustment"],
  blockedStatuses: [
    "advisory_insufficient_evidence",
    "blocked_invalid_input",
    "blocked_confidence_mismatch",
    "blocked_invalid_lineage",
    "blocked_future_leakage",
    "blocked_calibration_result",
    "blocked_unsupported_status",
  ],
  projectionStatuses: [
    "projection_ready",
    "projection_ready_with_warnings",
    "projection_no_adjustment",
    "projection_insufficient_evidence",
    "blocked_invalid_input",
    "blocked_confidence_mismatch",
    "blocked_invalid_lineage",
    "blocked_future_leakage",
    "blocked_advisory_result",
    "blocked_unsupported_status",
  ],
  validationOrder: [
    "Top-level input shape",
    "Projection configuration",
    "Recommendation envelope shape",
    "Recommendation fingerprint",
    "Recommendation snapshot lineage",
    "Recommendation original confidence",
    "Advisory result shape",
    "Advisory status eligibility",
    "Recommendation/advisory confidence agreement",
    "Advisory identity/result hashes",
    "Recommendation/advisory lineage agreement",
    "Anti-leakage",
    "Anti-feedback",
    "Warning/issue compatibility",
    "Projection output construction",
  ],
  futureSequence: [
    "Action 448 - Pure Recommendation Advisory Projection Implementation",
    "Action 449 - Independent Projection Verification",
    "Action 450 - Projection Fixture & Hash-Freeze Approval Gate",
    "Action 451 - Projection Fixture & Semantic Hash Freeze",
    "Action 452 - Independent Projection Hash-Freeze Verification",
    "Action 453 - Projection Shadow Execution Approval Gate",
    "Action 454 - Projection Shadow Execution",
    "Action 455 - Independent Projection Shadow Verification",
    "Action 456 - Projection Pure/Static Release Gate",
  ],
};

function runJson(command, args) {
  const result = spawnSync(command, args, { cwd: root, encoding: "utf8", maxBuffer: 120 * 1024 * 1024 });
  if (result.status !== 0) {
    throw new Error(result.stdout || result.stderr || `${command} failed`);
  }
  const start = result.stdout.indexOf("{");
  const end = result.stdout.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error(`json_output_missing:${command}`);
  return JSON.parse(result.stdout.slice(start, end + 1));
}

function rgFiles(pattern, targets) {
  const result = spawnSync("rg", ["-l", pattern, ...targets], { cwd: root, encoding: "utf8" });
  if (result.status !== 0 && result.status !== 1) throw new Error(result.stderr || `rg failed:${pattern}`);
  return result.stdout.trim() ? result.stdout.trim().split("\n").sort() : [];
}

const doc = exists(paths.doc) ? read(paths.doc) : "";
const action446 = exists(paths.action446Verifier) ? runJson("node", [paths.action446Verifier]) : {};

const runtimeOrConsumerPaths = [
  "app/api/confidence-calibration-recommendation-advisory-projection",
  "app/api/confidence-calibration-advisory-projection",
  "app/confidence-calibration-advisory-projection",
  "lib/confidence-calibration-recommendation-advisory-projection-consumer.ts",
  "lib/confidence-calibration-recommendation-advisory-projection-runtime.ts",
  "lib/recommendation-engine-advisory-projection-consumer.ts",
].filter(exists);

const projectionMentionsInRuntime = rgFiles("buildConfidenceCalibrationRecommendationProjection|confidence-calibration-recommendation-advisory-projection", ["app", "lib"])
  .filter((path) => path !== paths.projectionAdapter);

const advisoryConsumers = rgFiles("buildConfidenceCalibrationAdvisory|confidence-calibration-advisory-adapter", ["app", "lib"])
  .filter((path) => path !== "lib/confidence-calibration-advisory-adapter.ts" && path !== paths.projectionAdapter);

const checks = {
  documentation_exists: exists(paths.doc),
  verifier_exists: exists(paths.verifier),
  focused_test_exists: exists(paths.test),
  action446_released: action446.verification_status === "passed" &&
    action446.release_decision === expected.action446Decision &&
    action446.release_classification === expected.action446Classification &&
    action446.failed_conditions_count === 0 &&
    action446.unresolved_conditions_count === 0,
  approval_vocabulary_exact: JSON.stringify(expected.approvalVocabulary) === JSON.stringify(["approved", "approved_with_conditions", "blocked"]) &&
    expected.approvalVocabulary.every((item) => doc.includes(`\`${item}\``)),
  approval_decision_exact: doc.includes("Approval decision: `approved`"),
  projection_definition_complete: [
    "one immutable Recommendation projection envelope",
    "one verified ConfidenceCalibrationAdvisoryResult",
    "one explicit frozen projection configuration",
    "must not mutate a Recommendation",
    "must not replace the Recommendation original confidence",
  ].every((term) => doc.includes(term)),
  future_projection_api_proposed: doc.includes(expected.projectionFunction) &&
    doc.includes("ImmutableRecommendationProjectionEnvelope") &&
    doc.includes("FrozenRecommendationProjectionConfiguration") &&
    doc.includes("ConfidenceCalibrationRecommendationProjectionResult"),
  immutable_recommendation_contract: [
    "Recommendation fingerprint",
    "Recommendation snapshot hash",
    "Current original confidence in basis points",
    "No mutation callback",
    "No persistence command",
    "No ranking command",
    "No scanner command",
    "No publication command",
    "No execution command",
    "A mutable Recommendation object is not permitted",
  ].every((term) => doc.includes(term)),
  immutable_advisory_contract: [
    "Advisory status",
    "Advisory ID",
    "Proposed delta in basis points",
    "Proposed calibrated confidence in basis points",
    "Advisory identity hash",
    "Advisory result hash",
    "Missing or inconsistent advisory identity must block projection",
  ].every((term) => doc.includes(term)),
  eligible_statuses_exact: expected.eligibleStatuses.every((status) => doc.includes(`\`${status}\``)),
  blocked_statuses_exact: expected.blockedStatuses.every((status) => doc.includes(`\`${status}\``)) &&
    doc.includes("must not be silently converted into a successful no-adjustment projection"),
  projection_status_vocabulary_exact: expected.projectionStatuses.every((status) => doc.includes(`\`${status}\``)) &&
    doc.includes("must not invent statuses"),
  confidence_agreement_exact: doc.includes("exact equality between Recommendation original confidence and advisory original confidence") &&
    doc.includes("basis-point comparison") &&
    doc.includes("must not round into agreement") &&
    doc.includes("A mismatch must return `blocked_confidence_mismatch`"),
  no_adjustment_exact: [
    "Advisory delta: 0",
    "Projection status: `projection_no_adjustment`",
    "Recommendation confidence unchanged: true",
    "`ranking_affected=false`",
    "`scanner_affected=false`",
    "`publication_affected=false`",
    "`execution_affected=false`",
    "`applied=false`",
  ].every((term) => doc.includes(term)),
  warning_issue_contract_exact: [
    "\"code\"",
    "\"path\"",
    "\"severity\"",
    "\"messageKey\"",
    "RFC 6901 paths",
    "deterministic exact-record deduplication",
    "no raw rejected values",
    "no free-form dynamic messages",
    "no timestamps",
    "no sensitive values",
  ].every((term) => doc.includes(term)),
  lineage_policy_exact: [
    "Recommendation fingerprint",
    "Recommendation snapshot hash",
    "advisory recommendation fingerprint",
    "advisory recommendation snapshot hash",
    "Pattern Discovery lineage",
    "Pattern Insight lineage",
    "Any mismatch must fail closed",
  ].every((term) => doc.includes(term)),
  anti_leakage_feedback_exact: [
    "future outcomes",
    "post-entry evidence",
    "post-exit evidence",
    "advisory generated from the Recommendation outcome it is projected onto",
    "Learning Dataset input",
    "future calibration evidence",
    "feedback event",
    "circular lineage",
  ].every((term) => doc.includes(term)),
  output_contract_exact: [
    "`non_authoritative: true`",
    "`applied: false`",
    "`recommendation_confidence_unchanged: true`",
    "`ranking_affected: false`",
    "`scanner_affected: false`",
    "`publication_affected: false`",
    "`execution_affected: false`",
    "It must not contain a mutable Recommendation object",
    "Supabase payload",
    "runtime side effect",
  ].every((term) => doc.includes(term)),
  identity_hash_policy_exact: [
    "canonical JSON plus SHA-256",
    "projection schema/configuration version",
    "Recommendation fingerprint",
    "advisory identity/result hashes",
    "canonical warnings",
    "canonical issues",
    "Exclude timestamps",
    "randomness",
    "output array position",
  ].every((term) => doc.includes(term)),
  validation_order_exact: expected.validationOrder.every((term, index) => doc.includes(`${index + 1}. ${term}`)),
  action448_boundary_exact: [
    "lib/confidence-calibration-recommendation-advisory-projection.ts",
    "docs/action-448-confidence-calibration-recommendation-advisory-projection-implementation.md",
    "scripts/action-448-confidence-calibration-recommendation-advisory-projection-implementation-verify.mjs",
    "tests/e2e/action-448-confidence-calibration-recommendation-advisory-projection-implementation.spec.ts",
    "must not add Recommendation Engine runtime consumer",
  ].every((term) => doc.includes(term)),
  future_sequence_exact: expected.futureSequence.every((term) => doc.includes(term)),
  deployment_prohibition_exact: [
    "No deployment is required",
    "No preview deploy is authorized",
    "No production deploy is authorized",
    "No runtime-preview advancement is authorized",
    "No Netlify or branch deployment action should occur",
    "No environment variables are required",
    "No credentials are required",
  ].every((term) => doc.includes(term)),
  action448_pure_projection_adapter_recognized: exists(paths.projectionAdapter) &&
    read(paths.projectionAdapter).includes("export function buildConfidenceCalibrationRecommendationProjection") &&
    read(paths.projectionAdapter).includes("export type ImmutableRecommendationProjectionEnvelope") &&
    read(paths.projectionAdapter).includes("export type FrozenRecommendationProjectionConfiguration") &&
    read(paths.projectionAdapter).includes("export type ConfidenceCalibrationRecommendationProjectionResult") &&
    projectionMentionsInRuntime.length === 0,
  no_advisory_consumer_exists: advisoryConsumers.length === 0,
  no_runtime_ui_persistence_replay_provider_supabase_feedback: runtimeOrConsumerPaths.length === 0 &&
    action446.isolation_result?.safety?.provider_call_executed === false &&
    action446.isolation_result?.safety?.provider_call_attempted === false &&
    action446.isolation_result?.safety?.supabase_read_executed === false &&
    action446.isolation_result?.safety?.supabase_write_executed === false &&
    action446.isolation_result?.safety?.persistence_executed === false &&
    action446.isolation_result?.safety?.replay_executed === false &&
    action446.isolation_result?.safety?.runtime_route_created === false &&
    action446.isolation_result?.safety?.feedback_executed === false,
  no_recommendation_confidence_ranking_scanner_publication_execution_mutation: action446.isolation_result?.safety?.recommendation_mutated === false &&
    action446.isolation_result?.safety?.confidence_applied === false &&
    action446.isolation_result?.safety?.scanner_behavior_changed === false &&
    action446.isolation_result?.safety?.live_ranking_changed === false &&
    action446.isolation_result?.safety?.publication_changed === false &&
    doc.includes("execution_affected=false"),
  runtime_preview_untouched: action446.runtime_preview_status === expected.runtimePreviewStatus &&
    doc.includes(expected.runtimePreviewStatus),
  next_action_identified: doc.includes(expected.nextAction),
};

const failedConditions = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);

const report = {
  verification_status: failedConditions.length === 0 ? "passed" : "failed",
  approval_decision: failedConditions.length === 0 ? expected.approvalDecision : "blocked",
  approval_vocabulary: expected.approvalVocabulary,
  passed_conditions_count: Object.values(checks).filter(Boolean).length,
  failed_conditions_count: failedConditions.length,
  unresolved_conditions_count: 0,
  failed_conditions: failedConditions,
  checks,
  action446_release: {
    release_decision: action446.release_decision,
    release_classification: action446.release_classification,
    passed_conditions_count: action446.passed_conditions_count,
    failed_conditions_count: action446.failed_conditions_count,
    unresolved_conditions_count: action446.unresolved_conditions_count,
  },
  projection_definition: {
    purpose: "future_pure_recommendation_facing_advisory_metadata_projection",
    mutates_recommendation: false,
    replaces_recommendation_confidence: false,
    projection_function: expected.projectionFunction,
  },
  input_contracts: {
    recommendation: "immutable_recommendation_projection_envelope",
    advisory: "verified_confidence_calibration_advisory_result",
    configuration: "frozen_recommendation_projection_configuration",
  },
  eligible_advisory_statuses: expected.eligibleStatuses,
  blocked_advisory_statuses: expected.blockedStatuses,
  projection_status_vocabulary: expected.projectionStatuses,
  confidence_agreement: {
    comparison: "basis_points_exact_equality",
    mismatch_status: "blocked_confidence_mismatch",
    repair_allowed: false,
    confidence_application_allowed: false,
  },
  validation_order: expected.validationOrder,
  output_and_mutation_boundaries: {
    recommendation_confidence_unchanged: true,
    ranking_affected: false,
    scanner_affected: false,
    publication_affected: false,
    execution_affected: false,
    non_authoritative: true,
    applied: false,
    persistence_allowed: false,
    runtime_allowed: false,
    feedback_allowed: false,
  },
  action448_boundary: {
    projection_adapter_path: paths.projectionAdapter,
    implementation_free_in_action_447: true,
    action448_adapter_recognized_after_approval: exists(paths.projectionAdapter),
    consumer_allowed: false,
    runtime_allowed: false,
    confidence_application_allowed: false,
  },
  future_sequence: expected.futureSequence,
  deployment_policy: {
    deployment_required: false,
    preview_deploy_authorized: false,
    production_deploy_authorized: false,
    runtime_preview_advancement_authorized: false,
    env_required: false,
    credentials_required: false,
  },
  safety_confirmation: {
    projection_adapter_exists: exists(paths.projectionAdapter),
    projection_mentions_in_runtime: projectionMentionsInRuntime,
    advisory_consumers: advisoryConsumers,
    runtime_or_consumer_paths: runtimeOrConsumerPaths,
    action446_safety: action446.isolation_result?.safety,
  },
  runtime_preview_status: action446.runtime_preview_status,
  unrelated_work_classification: "action_447_confidence_calibration_advisory_recommendation_engine_consumption_contract_approval_gate_only",
  recommended_next_action: expected.nextAction,
};

console.log(JSON.stringify(report, null, 2));
if (report.verification_status !== "passed") process.exitCode = 1;
