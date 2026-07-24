#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const candidateRoot = "/private/tmp/ture-action-370-corrected-preview-candidate";
const documentPath = join(root, "docs/action-372-exact-revision-preview-deployment-and-validation.md");
const evidencePath = join(root, "docs/action-372-exact-revision-preview-deployment-evidence.json");
const bindingPath = join(root,
  "docs/action-370-corrected-immutable-preview-candidate-binding-evidence.json");
const routePath = join(candidateRoot, "app/api/runtime-health/ping/route.ts");
const manifestPath = join(candidateRoot, "docs/action-370-preview-deployment-input-manifest.json");

const candidateSha = "b0bb5c4686d9cab3b682b3b06fadee4cf73cab07";
const baselineSha = "51aced66782ec9a37cd358238f02b6f5c0ae97bd";
const routeSha = "98c7de74c94364eed9a447469ef367f1f454b42ae17d3911b3ebfad6ed5213bb";
const manifestSha = "b7ac9ddaf40cc516bcdbdc7208dc6669f6b34a18a1810c0bde72209b25710892";
const decisions = [
  "preview_validated",
  "preview_validated_with_conditions",
  "preview_failed",
  "preview_aborted",
];

function read(path) {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function json(path) {
  try {
    return JSON.parse(read(path));
  } catch {
    return null;
  }
}

function sha256(path) {
  return existsSync(path)
    ? createHash("sha256").update(readFileSync(path)).digest("hex")
    : null;
}

function git(args) {
  try {
    return execFileSync("git", args, {
      cwd: candidateRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

const document = read(documentPath);
const evidence = json(evidencePath);
const binding = json(bindingPath);
let action371 = null;
try {
  action371 = JSON.parse(execFileSync("node", [join(root,
    "scripts/action-371-exact-revision-preview-deployment-execution-approval-gate-verify.mjs")], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }));
} catch {
  action371 = null;
}

const candidateExact = git(["rev-parse", "HEAD"]) === candidateSha &&
  git(["rev-parse", "HEAD^"]) === baselineSha &&
  git(["rev-list", "--count", `${baselineSha}..HEAD`]) === "1";
const candidateClean = git(["status", "--porcelain=v1", "--untracked-files=all"]) === "";
const hashesExact = sha256(routePath) === routeSha && sha256(manifestPath) === manifestSha;
const bindingExact = binding?.preparation_decision === "prepared" &&
  binding?.immutable_candidate_sha === candidateSha && binding?.selected_baseline_sha === baselineSha &&
  binding?.route_sha256 === routeSha && binding?.manifest_sha256 === manifestSha &&
  binding?.frozen_tree_clean === true && binding?.preview_attempt_consumed === false &&
  binding?.deployment_performed === false;
const action371Approved = action371?.verification_status === "passed" &&
  action371?.approval_decision === "approved" && action371?.preview_attempt_consumed === false;

const requiredSections = [
  "## Purpose", "## Scope", "## Recovery Context", "## Upstream Dependencies",
  "## Exact Source Binding", "## Pre-Deploy Candidate Verification",
  "## Preview Target Classification", "## Attempt Consumption", "## Deployment Result",
  "## Exact Validation Contract", "## Route Validation Evidence", "## Runtime Safety Evidence",
  "## Stop Condition Result", "## Evidence Artifact", "## Production and Main Status",
  "## Final Preview Decision", "## Next Permitted Action",
];
const documentationComplete = requiredSections.every((section) => document.includes(section)) &&
  document.includes("final_preview_decision: preview_aborted") && document.includes(candidateSha) &&
  document.includes(baselineSha) && document.includes(routeSha) && document.includes(manifestSha);

const evidenceIdentityExact = evidence?.evidence_schema_version === "1.0.0" &&
  evidence?.action === 372 && JSON.stringify(evidence?.decision_vocabulary) === JSON.stringify(decisions) &&
  decisions.includes(evidence?.final_decision) && evidence?.final_decision === "preview_aborted" &&
  evidence?.candidate_sha === candidateSha && evidence?.baseline_sha === baselineSha &&
  evidence?.route_sha256 === routeSha && evidence?.manifest_sha256 === manifestSha;
const preflightExact = evidence?.pre_deploy_verification?.passed === true &&
  evidence?.pre_deploy_verification?.action_371_approval_valid === true &&
  evidence?.pre_deploy_verification?.candidate_sha_exact === true &&
  evidence?.pre_deploy_verification?.baseline_sha_exact === true &&
  evidence?.pre_deploy_verification?.candidate_clean === true &&
  evidence?.pre_deploy_verification?.candidate_unamended === true &&
  evidence?.pre_deploy_verification?.route_hash_exact === true &&
  evidence?.pre_deploy_verification?.manifest_hash_exact === true &&
  evidence?.pre_deploy_verification?.binding_evidence_exact === true &&
  evidence?.pre_deploy_verification?.unresolved_blocker_count === 0 &&
  evidence?.pre_deploy_verification?.runtime_route_inventory_exact === true &&
  evidence?.pre_deploy_verification?.untracked_deploy_input_count === 0 &&
  [
    evidence?.pre_deploy_verification?.migration_changes,
    evidence?.pre_deploy_verification?.schema_changes,
    evidence?.pre_deploy_verification?.proxy_middleware_netlify_changes,
    evidence?.pre_deploy_verification?.environment_file_changes,
  ].every((value) => Array.isArray(value) && value.length === 0);

const targetBlockedBeforeInitiation = evidence?.deployment_target?.non_production_proven === false &&
  evidence?.deployment_target?.classification === "unverified_no_approved_local_target_binding" &&
  evidence?.deployment_target?.classification_result === "blocked_before_external_initiation" &&
  evidence?.deployment_target?.preinstalled_netlify_cli_present === false &&
  evidence?.deployment_target?.local_site_linkage_present === false &&
  evidence?.deployment_target?.approved_auth_and_site_configuration_present === false;
const attemptUnconsumed = evidence?.attempt?.preview_attempt_consumed === false &&
  evidence?.attempt?.attempt_consumption_timestamp_utc === null &&
  evidence?.attempt?.external_deployment_operation_started === false &&
  evidence?.attempt?.deployment_attempt_count === 0 &&
  evidence?.attempt?.second_attempt_occurred === false;
const deploymentAbsent = evidence?.deployment?.deployment_identifier === null &&
  evidence?.deployment?.preview_url_reference === null &&
  evidence?.deployment?.preview_url_classification === "not_allocated_deployment_never_started" &&
  evidence?.deployment?.deployment_start_timestamp_utc === null &&
  evidence?.deployment?.deployment_completion_timestamp_utc === null &&
  evidence?.deployment?.build_status === "not_started" &&
  evidence?.deployment?.function_initialization_status === "not_started";
const validationScopeExact = evidence?.validation_scope?.endpoint === "/api/runtime-health/ping" &&
  JSON.stringify(evidence?.validation_scope?.permitted_methods) ===
    JSON.stringify(["GET", "GET", "POST", "PUT"]) &&
  evidence?.validation_scope?.additional_endpoints_requested === false;
const requestsNotPerformed = [
  evidence?.get_evidence,
  evidence?.repeated_get_evidence,
  evidence?.post_evidence,
  evidence?.put_evidence,
].every((value) => value?.performed === false &&
  value?.request_timestamp_utc === null &&
  value?.contract_result === "not_performed_pre_deploy_abort");
const redirectAndRegressionBounded = evidence?.redirect_evidence?.inspection_performed === false &&
  evidence?.redirect_evidence?.redirect_chain?.length === 0 &&
  evidence?.redirect_evidence?.unexpected_redirect_observed === false &&
  evidence?.redirect_evidence?.production_redirect_observed === false &&
  evidence?.recovery_regression_evidence?.http_400_observed === false &&
  evidence?.recovery_regression_evidence?.empty_body_observed === false &&
  evidence?.recovery_regression_evidence?.html_response_observed === false &&
  evidence?.recovery_regression_evidence?.caching_mismatch_observed === false;
const noRuntimeEffects = evidence?.runtime_safety?.provider_initialization_observed === false &&
  evidence?.runtime_safety?.supabase_initialization_observed === false &&
  evidence?.runtime_safety?.persistence_observed === false &&
  evidence?.runtime_safety?.external_side_effect_observed === false &&
  evidence?.runtime_safety?.unexpected_log_classification ===
    "no_external_deployment_or_runtime_logs_created";
const noRepositoryMutation = Object.values(evidence?.repository_changes_during_action ?? {})
  .every((value) => value === false);
const safetyExact = Object.values(evidence?.safety ?? {}).every((value) => value === false) &&
  evidence?.safety?.netlify_call_performed === false &&
  evidence?.safety?.external_endpoint_request_performed === false &&
  evidence?.safety?.production_deployment_performed === false &&
  evidence?.safety?.main_modified === false;
const stopConditionExact = evidence?.stop_condition?.triggered === true &&
  evidence?.stop_condition?.phase === "pre_deployment_target_verification" &&
  evidence?.stop_condition?.remediation_attempted === false &&
  evidence?.stop_condition?.retry_attempted === false;

const passed = documentationComplete && evidenceIdentityExact && candidateExact && candidateClean &&
  hashesExact && bindingExact && action371Approved && preflightExact &&
  targetBlockedBeforeInitiation && attemptUnconsumed && deploymentAbsent && validationScopeExact &&
  requestsNotPerformed && redirectAndRegressionBounded && noRuntimeEffects && noRepositoryMutation &&
  safetyExact && stopConditionExact;

const result = {
  verification_status: passed ? "passed" : "failed",
  final_decision: passed ? evidence.final_decision : "preview_aborted",
  candidate_sha: evidence?.candidate_sha ?? null,
  candidate_exact_and_clean: candidateExact && candidateClean,
  baseline_sha: evidence?.baseline_sha ?? null,
  route_hash_exact: hashesExact && evidence?.route_sha256 === routeSha,
  manifest_hash_exact: hashesExact && evidence?.manifest_sha256 === manifestSha,
  binding_exact: bindingExact,
  action_371_approval_valid: action371Approved,
  pre_deploy_verification_passed: preflightExact,
  deployment_target_classification: evidence?.deployment_target?.classification ?? null,
  non_production_target_proven: evidence?.deployment_target?.non_production_proven ?? null,
  preview_attempt_consumed: evidence?.attempt?.preview_attempt_consumed ?? null,
  external_deployment_operation_started:
    evidence?.attempt?.external_deployment_operation_started ?? null,
  deployment_attempt_count: evidence?.attempt?.deployment_attempt_count ?? null,
  deployment_identifier: evidence?.deployment?.deployment_identifier ?? null,
  preview_url_classification: evidence?.deployment?.preview_url_classification ?? null,
  build_status: evidence?.deployment?.build_status ?? null,
  function_initialization_status: evidence?.deployment?.function_initialization_status ?? null,
  exact_endpoint_scope: validationScopeExact,
  get_result: evidence?.get_evidence?.contract_result ?? null,
  repeated_get_result: evidence?.repeated_get_evidence?.contract_result ?? null,
  post_result: evidence?.post_evidence?.contract_result ?? null,
  put_result: evidence?.put_evidence?.contract_result ?? null,
  redirect_result: evidence?.redirect_evidence?.result ?? null,
  no_http_400_empty_html_or_cache_mismatch: redirectAndRegressionBounded,
  provider_supabase_initialization_observed: !noRuntimeEffects,
  side_effect_observed: evidence?.runtime_safety?.external_side_effect_observed ?? null,
  no_second_attempt: evidence?.attempt?.second_attempt_occurred === false,
  source_config_environment_unchanged: noRepositoryMutation,
  production_untouched: evidence?.safety?.production_deployment_performed === false &&
    evidence?.safety?.production_alias_modified === false &&
    evidence?.safety?.production_traffic_modified === false,
  main_untouched: evidence?.safety?.main_modified === false &&
    evidence?.repository_changes_during_action?.push_performed === false &&
    evidence?.repository_changes_during_action?.merge_performed === false,
  stop_condition_triggered: evidence?.stop_condition?.triggered ?? null,
  recommended_next_action: evidence?.next_permitted_action ?? null,
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
