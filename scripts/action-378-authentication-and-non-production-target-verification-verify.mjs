#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const candidateRoot = "/private/tmp/ture-action-370-corrected-preview-candidate";
const toolingRoot = "/private/tmp/ture-action-376-netlify-cli-tooling";
const documentPath = join(root,
  "docs/action-378-authentication-and-non-production-target-verification.md");
const evidencePath = join(root,
  "docs/action-378-authentication-and-non-production-target-verification-evidence.json");

const expected = {
  candidateSha: "b0bb5c4686d9cab3b682b3b06fadee4cf73cab07",
  baselineSha: "51aced66782ec9a37cd358238f02b6f5c0ae97bd",
  routeSha: "98c7de74c94364eed9a447469ef367f1f454b42ae17d3911b3ebfad6ed5213bb",
  manifestSha: "b7ac9ddaf40cc516bcdbdc7208dc6669f6b34a18a1810c0bde72209b25710892",
  toolingLockSha: "c4debb7fd8121b93021194a5b6f76e62a7278f804e97ebdd8057f97981d78ef2",
  cliManifestSha: "a145ebb0632b2fee19d5f1cce90812041541bfdaf59d5de6f39cb89be75b4887",
  executableSha: "e39432e46703049b6769e17c0a7a8f1748c345100a1f934d8a6c7076001d426c",
  appPackageSha: "7ff6ae8890b52d4879ce88248c22f152fffab327e8a5ef3a92eccccad217ef58",
  appLockSha: "859f498ee4d7d64259ad07d6117e25e284a29bd7d7169126100564fe90943657",
};

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

function git(args, cwd) {
  try {
    return execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

const canary = "ACTION_378_SYNTHETIC_CANARY_NOT_A_SECRET_7f4b9c2d";
const tokenLike = "nfp_SYNTHETIC_TOKEN_PATTERN_0123456789abcdef";
const forbiddenKey = /^(authorization|authorization_header|token|password|cookie|secret|environment)$/i;

function redact(value) {
  if (typeof value === "string") {
    return value
      .replaceAll(canary, "[REDACTED_CANARY]")
      .replace(/Bearer\s+\S+/gi, "[REDACTED_AUTHORIZATION]")
      .replace(/nfp_[A-Za-z0-9_-]{16,}/g, "[REDACTED_TOKEN_PATTERN]");
  }
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [
      key,
      forbiddenKey.test(key) ? "[REDACTED_FIELD]" : redact(entry),
    ]));
  }
  return value;
}

const rawCanaryPayload = {
  message: `synthetic-before:${canary}:synthetic-after`,
  authorization: `Bearer ${canary}`,
  token: tokenLike,
  environment: { NETLIFY_AUTH_TOKEN: canary },
};
const rawCanaryText = JSON.stringify(rawCanaryPayload);
const redactedCanaryText = JSON.stringify(redact(rawCanaryPayload));
const canaryPipelinePassed = rawCanaryText.includes(canary) && rawCanaryText.includes(tokenLike) &&
  !redactedCanaryText.includes(canary) && !redactedCanaryText.includes(tokenLike) &&
  !redactedCanaryText.includes("Bearer ") && redactedCanaryText.includes("[REDACTED_FIELD]");

const document = read(documentPath);
const evidenceText = read(evidencePath);
const evidence = json(evidencePath);
let action377 = null;
try {
  action377 = JSON.parse(execFileSync("node", [join(root,
    "scripts/action-377-authentication-and-non-production-site-binding-approval-gate-verify.mjs")], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }));
} catch {
  action377 = null;
}

const upstreamExact = action377?.verification_status === "passed" &&
  action377?.approval_decision === "approved_with_conditions" &&
  action377?.action_362_approval_preserved === true &&
  action377?.preview_attempt_consumed === false && action377?.deployment_attempt_count === 0 &&
  action377?.credential_access_performed === false && action377?.authentication_performed === false &&
  action377?.netlify_call_performed === false && action377?.deployment_performed === false;
const candidateExact = git(["rev-parse", "HEAD"], candidateRoot) === expected.candidateSha &&
  git(["rev-parse", "HEAD^"], candidateRoot) === expected.baselineSha &&
  git(["status", "--porcelain=v1", "--untracked-files=all"], candidateRoot) === "" &&
  sha256(join(candidateRoot, "app/api/runtime-health/ping/route.ts")) === expected.routeSha &&
  sha256(join(candidateRoot, "docs/action-370-preview-deployment-input-manifest.json")) ===
    expected.manifestSha;
const cliExact = evidence?.tooling?.cli_package === "netlify-cli" &&
  evidence?.tooling?.cli_version === "26.2.0" &&
  sha256(join(toolingRoot, "package-lock.json")) === expected.toolingLockSha &&
  sha256(join(toolingRoot, "node_modules/netlify-cli/package.json")) === expected.cliManifestSha &&
  sha256(join(toolingRoot, "node_modules/netlify-cli/bin/run.js")) === expected.executableSha &&
  evidence?.tooling?.cli_command_executed === false;
const operatorInputsAbsent = evidence?.operator_inputs?.operator_authorization_recorded === false &&
  evidence?.operator_inputs?.credential_present === false &&
  evidence?.operator_inputs?.exact_site_id_present === false &&
  evidence?.operator_inputs?.credential_source_searched === false &&
  evidence?.operator_inputs?.site_id_inferred_or_searched === false &&
  evidence?.operator_inputs?.network_preconditions_satisfied === false;
const evidenceContainsNoCanaryOrToken = !evidenceText.includes(canary) &&
  !evidenceText.includes(tokenLike) && !/"(token|password|cookie|authorization|authorization_header)"\s*:/i
    .test(evidenceText);
const canaryExact = canaryPipelinePassed && evidenceContainsNoCanaryOrToken &&
  evidence?.synthetic_canary?.result === "passed" &&
  evidence?.synthetic_canary?.real_credential_used === false &&
  evidence?.synthetic_canary?.canary_value_recorded === false &&
  evidence?.synthetic_canary?.token_like_pattern_rejected === true;
const authExact = evidence?.authentication?.credential_provenance === "unavailable_not_supplied" &&
  evidence?.authentication?.credential_valid === null &&
  evidence?.authentication?.authentication_result === "not_attempted_missing_required_inputs" &&
  evidence?.authentication?.credential_value_recorded === false &&
  evidence?.authentication?.credential_fingerprint_recorded === false &&
  evidence?.authentication?.authorization_header_created === false &&
  evidence?.authentication?.authentication_performed === false;
const networkExact = evidence?.frozen_read_only_boundary?.operations?.map((entry) => entry.operation)
  .join("|") === "getCurrentUser|listAccountsForUser|getSite" &&
  evidence?.frozen_read_only_boundary?.operations?.every((entry) =>
    entry.classification === "read_only_not_executed") &&
  evidence?.frozen_read_only_boundary?.contacted_endpoint_inventory?.length === 0 &&
  evidence?.frozen_read_only_boundary?.netlify_network_window_opened === false &&
  evidence?.frozen_read_only_boundary?.netlify_api_called === false &&
  evidence?.frozen_read_only_boundary?.unapproved_endpoint_contacted === false;
const identitiesAndOwnershipExact = evidence?.identity?.current_user_identity === null &&
  evidence?.identity?.account_identity === null && evidence?.identity?.team_identity === null &&
  evidence?.identity?.unrelated_identity_enumerated === false &&
  evidence?.site?.site_identity === null &&
  evidence?.site?.site_identity_representation === "absent_no_operator_approved_site_id" &&
  evidence?.site?.ownership_result === "not_evaluated";
const targetVocabularyExact = evidence?.target?.classification_vocabulary?.join("|") ===
  "verified_non_production_preview|verified_production|ambiguous_target|unavailable_target" &&
  evidence?.target?.classification === "unavailable_target" &&
  evidence?.target?.verified_non_production_preview_requirements_met === false &&
  evidence?.production_risk?.production_alias_risk ===
    "unresolved_without_exact_site_metadata" && evidence?.production_risk?.risk_bounded === false;
const linkageExact = evidence?.linkage?.policy ===
  "explicit_verified_site_id_without_persistent_linkage" &&
  evidence?.linkage?.linkage_attempted === false && evidence?.linkage?.linkage_created === false &&
  evidence?.linkage?.netlify_state_created === false &&
  !existsSync(join(root, ".netlify")) && !existsSync(join(candidateRoot, ".netlify"));
const filesystemExact = sha256(join(root, "package.json")) === expected.appPackageSha &&
  sha256(join(root, "package-lock.json")) === expected.appLockSha &&
  evidence?.filesystem_and_config?.repository_drift_detected === false &&
  evidence?.filesystem_and_config?.candidate_drift_detected === false &&
  evidence?.filesystem_and_config?.environment_file_changed === false &&
  evidence?.filesystem_and_config?.global_config_written === false &&
  evidence?.filesystem_and_config?.credential_file_written === false && candidateExact;
const cleanupExact = evidence?.credential_cleanup?.result ===
  "not_applicable_no_credential_loaded" &&
  evidence?.credential_cleanup?.bounded_process_secret_cleared === true &&
  evidence?.credential_cleanup?.credential_persisted === false &&
  evidence?.credential_cleanup?.secret_bearing_output_persisted === false;
const safetyExact = evidence?.mutation_and_deployment && [
  "mutation_performed", "site_configuration_changed", "environment_changed", "candidate_changed",
  "repository_config_changed", "deployment_performed", "preview_url_allocated",
  "preview_attempt_consumed", "production_changed", "main_changed",
].every((key) => evidence.mutation_and_deployment[key] === false) &&
  evidence.mutation_and_deployment.deployment_attempt_count === 0 &&
  evidence.mutation_and_deployment.production_blocked === true &&
  evidence.mutation_and_deployment.main_blocked === true;
const decisionExact = evidence?.capability_vocabulary?.join("|") ===
  "target_verified|target_verified_with_conditions|capability_blocked" &&
  evidence?.final_capability_decision === "capability_blocked" &&
  evidence?.block_reason === "required_operator_authorized_credential_and_exact_site_id_absent" &&
  evidence?.stop_conditions_encountered?.join("|") ===
    "operator_authorization_absent|process_scoped_credential_absent|exact_operator_approved_site_id_absent" &&
  evidence?.next_preview_execution_action === null;

const requiredSections = [
  "## Purpose", "## Scope", "## Recovery Context", "## Upstream Dependencies",
  "## Candidate Binding", "## Action 377 Gate", "## Operator Authorization",
  "## Tooling Identity", "## Exact Frozen Network Boundary", "## Synthetic Canary Test",
  "## Credential Handling", "## Authentication Result", "## Account and Team Result",
  "## Exact-Site Result", "## Ownership Result", "## Domain and Branch Result",
  "## Preview Capability Result", "## Production-Risk Assessment",
  "## Explicit Site-Targeting Result", "## Linkage Result", "## Target Classification",
  "## Filesystem and Configuration Result", "## Credential Cleanup",
  "## Preview and Deployment Attempt Result", "## Explicit Non-Goals",
  "## Stop Conditions Encountered", "## Capability Vocabulary",
  "## Final Capability Decision", "## Next Permitted Action",
];
const documentationComplete = existsSync(documentPath) && existsSync(evidencePath) &&
  requiredSections.every((section) => document.includes(section)) &&
  document.includes("`capability_blocked`") && document.includes("`unavailable_target`") &&
  document.includes("Contacted endpoint inventory: empty") &&
  document.includes("The action stopped before authentication and before network access");

const passed = upstreamExact && candidateExact && cliExact && operatorInputsAbsent && canaryExact &&
  authExact && networkExact && identitiesAndOwnershipExact && targetVocabularyExact && linkageExact &&
  filesystemExact && cleanupExact && safetyExact && decisionExact && documentationComplete;

const result = {
  verification_status: passed ? "passed" : "failed",
  final_capability_decision: passed ? "capability_blocked" : "capability_blocked",
  block_reason: evidence?.block_reason ?? null,
  action_377_gate_healthy: upstreamExact,
  candidate_exact_and_clean: candidateExact,
  exact_cli_identity_preserved: cliExact,
  action_362_approval_preserved: evidence?.upstream_state?.action_362_approval_preserved ?? null,
  preview_attempt_consumed: evidence?.upstream_state?.preview_attempt_consumed ?? null,
  deployment_attempt_count: evidence?.upstream_state?.deployment_attempt_count ?? null,
  operator_authorization_recorded: evidence?.operator_inputs?.operator_authorization_recorded ?? null,
  credential_present: evidence?.operator_inputs?.credential_present ?? null,
  exact_site_id_present: evidence?.operator_inputs?.exact_site_id_present ?? null,
  synthetic_canary_pipeline_passed: canaryExact,
  credential_value_absent_from_evidence: evidenceContainsNoCanaryOrToken,
  authentication_result: evidence?.authentication?.authentication_result ?? null,
  target_classification: evidence?.target?.classification ?? null,
  contacted_endpoint_count: evidence?.frozen_read_only_boundary?.contacted_endpoint_inventory?.length ?? null,
  credential_access_performed: false,
  authentication_performed: evidence?.authentication?.authentication_performed ?? null,
  netlify_call_performed: evidence?.frozen_read_only_boundary?.netlify_api_called ?? null,
  site_linkage_created: evidence?.linkage?.linkage_created ?? null,
  netlify_state_created: evidence?.linkage?.netlify_state_created ?? null,
  deployment_performed: evidence?.mutation_and_deployment?.deployment_performed ?? null,
  credential_cleanup_verified: cleanupExact,
  repository_and_candidate_integrity_verified: filesystemExact,
  production_blocked: evidence?.mutation_and_deployment?.production_blocked ?? null,
  main_blocked: evidence?.mutation_and_deployment?.main_blocked ?? null,
  next_preview_execution_action: evidence?.next_preview_execution_action ?? null,
  recommended_next_action: evidence?.recommended_next_action ?? null,
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
