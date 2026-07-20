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
  "docs/action-379-operator-authorized-authentication-and-exact-non-production-target-verification.md");
const evidencePath = join(root,
  "docs/action-379-operator-authorized-authentication-and-target-evidence.json");

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

const canary = "ACTION_379_SYNTHETIC_CANARY_NOT_A_SECRET_4d6a8b1e";
const tokenLike = "nfp_SYNTHETIC_REJECT_PATTERN_fedcba9876543210";
const forbiddenKey = /^(authorization|authorization_header|token|password|cookie|secret|environment)$/i;

function sanitize(value) {
  if (typeof value === "string") {
    return value
      .replaceAll(canary, "[REDACTED_CANARY]")
      .replace(/Bearer\s+\S+/gi, "[REDACTED_AUTHORIZATION]")
      .replace(/nfp_[A-Za-z0-9_-]{16,}/g, "[REDACTED_TOKEN_PATTERN]");
  }
  if (Array.isArray(value)) return value.map(sanitize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [
      key,
      forbiddenKey.test(key) ? "[REJECTED_FIELD]" : sanitize(entry),
    ]));
  }
  return value;
}

const rawPipelineInput = {
  stdout: `before:${canary}:after`,
  stderr: `Bearer ${canary}`,
  authorization_header: `Bearer ${canary}`,
  token: tokenLike,
  environment: { NETLIFY_AUTH_TOKEN: canary },
};
const rawPipelineText = JSON.stringify(rawPipelineInput);
const sanitizedPipelineText = JSON.stringify(sanitize(rawPipelineInput));
const canaryPipelinePassed = rawPipelineText.includes(canary) && rawPipelineText.includes(tokenLike) &&
  !sanitizedPipelineText.includes(canary) && !sanitizedPipelineText.includes(tokenLike) &&
  !sanitizedPipelineText.includes("Bearer ") && sanitizedPipelineText.includes("[REJECTED_FIELD]");

const document = read(documentPath);
const evidenceText = read(evidencePath);
const evidence = json(evidencePath);
let action378 = null;
try {
  action378 = JSON.parse(execFileSync("node", [join(root,
    "scripts/action-378-authentication-and-non-production-target-verification-verify.mjs")], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }));
} catch {
  action378 = null;
}

const upstreamExact = action378?.verification_status === "passed" &&
  action378?.final_capability_decision === "capability_blocked" &&
  action378?.action_362_approval_preserved === true &&
  action378?.preview_attempt_consumed === false && action378?.deployment_attempt_count === 0 &&
  action378?.authentication_performed === false && action378?.netlify_call_performed === false &&
  action378?.deployment_performed === false;
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
  evidence?.tooling?.cli_executed === false && evidence?.tooling?.npx_used === false;
const operatorInputsAbsent = evidence?.operator_inputs?.operator_authorized === false &&
  evidence?.operator_inputs?.credential_present === false &&
  evidence?.operator_inputs?.exact_site_id_present === false &&
  evidence?.operator_inputs?.read_only_inspection_authorized === false &&
  evidence?.operator_inputs?.action_379_only_use_authorized === false &&
  evidence?.operator_inputs?.immediate_credential_destruction_authorized === false &&
  evidence?.operator_inputs?.ambient_authorization_inferred === false &&
  evidence?.operator_inputs?.credential_discovery_performed === false &&
  evidence?.operator_inputs?.site_id_discovery_performed === false;
const noSecretFields = !evidenceText.includes(canary) && !evidenceText.includes(tokenLike) &&
  !/"(token|password|cookie|authorization|authorization_header)"\s*:/i.test(evidenceText);
const canaryExact = canaryPipelinePassed && noSecretFields &&
  evidence?.synthetic_canary?.result === "passed" &&
  evidence?.synthetic_canary?.canary_detected === true &&
  evidence?.synthetic_canary?.irreversible_redaction_passed === true &&
  evidence?.synthetic_canary?.authorization_header_rejection_passed === true &&
  evidence?.synthetic_canary?.token_pattern_rejection_passed === true &&
  evidence?.synthetic_canary?.environment_dump_rejection_passed === true &&
  evidence?.synthetic_canary?.raw_output_bypass_rejected === true &&
  evidence?.synthetic_canary?.forbidden_evidence_field_rejection_passed === true &&
  evidence?.synthetic_canary?.real_credential_loaded === false;
const authExact = evidence?.authentication?.credential_valid === null &&
  evidence?.authentication?.authentication_result ===
    "not_attempted_missing_current_operator_inputs" &&
  evidence?.authentication?.credential_fingerprint_recorded === false &&
  evidence?.authentication?.credential_value_recorded === false &&
  evidence?.authentication?.authentication_performed === false;
const operationsExact = evidence?.frozen_operation_inventory?.map((entry) => entry.operation).join("|") ===
  "getCurrentUser|listAccountsForUser|getSite" &&
  evidence?.frozen_operation_inventory?.every((entry) =>
    entry.classification === "official_read_only_not_executed") &&
  evidence?.network?.network_boundary_opened === false &&
  evidence?.network?.contacted_endpoint_classifications?.length === 0 &&
  evidence?.network?.netlify_api_called === false &&
  evidence?.network?.application_endpoint_called === false;
const identityOwnershipExact = evidence?.identity?.authenticated_user_identity === null &&
  evidence?.identity?.account_identity === null && evidence?.identity?.team_identity === null &&
  evidence?.identity?.site_identity === null &&
  evidence?.identity?.site_identity_representation ===
    "absent_no_current_operator_approved_site_id" &&
  evidence?.identity?.unrelated_accounts_or_teams_enumerated === false &&
  evidence?.identity?.unrelated_sites_retrieved === false &&
  evidence?.ownership?.result === "not_evaluated";
const targetExact = evidence?.target?.classification_vocabulary?.join("|") ===
  "verified_non_production_preview|verified_production|ambiguous_target|unavailable_target" &&
  evidence?.target?.classification === "unavailable_target" &&
  evidence?.target?.verified_non_production_preview === false &&
  evidence?.target?.production_risk_bounded === false &&
  evidence?.site_capability?.production_alias_risk ===
    "unresolved_without_exact_site_metadata" &&
  evidence?.site_capability?.explicit_site_targeting ===
    "statically_supported_not_exact_target_verified";
const linkageExact = evidence?.linkage?.policy ===
  "explicit_verified_site_id_no_persistent_linkage" &&
  evidence?.linkage?.linkage_performed === false &&
  evidence?.linkage?.netlify_state_created === false &&
  !existsSync(join(root, ".netlify")) && !existsSync(join(candidateRoot, ".netlify"));
const filesystemExact = sha256(join(root, "package.json")) === expected.appPackageSha &&
  sha256(join(root, "package-lock.json")) === expected.appLockSha &&
  evidence?.filesystem_and_config?.repository_mutation === false &&
  evidence?.filesystem_and_config?.candidate_mutation === false &&
  evidence?.filesystem_and_config?.environment_file_changed === false &&
  evidence?.filesystem_and_config?.global_config_changed === false &&
  evidence?.filesystem_and_config?.credential_file_created === false && candidateExact;
const cleanupExact = evidence?.credential_cleanup?.result ===
  "not_applicable_no_credential_loaded" &&
  evidence?.credential_cleanup?.bounded_process_terminated === true &&
  evidence?.credential_cleanup?.credential_bearing_child_process_remaining === false &&
  evidence?.credential_cleanup?.credential_in_files === false &&
  evidence?.credential_cleanup?.credential_in_output === false &&
  evidence?.credential_cleanup?.credential_in_evidence === false;
const safetyExact = evidence?.safety && [
  "mutation_performed", "linkage_performed", "deployment_performed", "preview_url_allocated",
  "preview_attempt_consumed", "production_changed", "main_changed",
].every((key) => evidence.safety[key] === false) && evidence.safety.deployment_attempt_count === 0 &&
  evidence.safety.production_blocked === true && evidence.safety.main_blocked === true;
const decisionExact = evidence?.capability_vocabulary?.join("|") ===
  "target_verified|target_verified_with_conditions|capability_blocked" &&
  evidence?.final_capability_decision === "capability_blocked" &&
  evidence?.block_reason === "current_operator_authorization_credential_and_exact_site_id_absent" &&
  evidence?.stop_conditions_encountered?.join("|") ===
    "current_operator_authorization_absent|process_scoped_credential_absent|exact_operator_approved_site_id_absent" &&
  evidence?.next_execution_approval_refresh === null;

const requiredSections = [
  "## Purpose", "## Scope", "## Recovery Context", "## Upstream Dependencies",
  "## Candidate Binding", "## CLI Binding", "## Action 377 Approval",
  "## Action 378 Blocked Result", "## Operator Authorization", "## Synthetic-Canary Result",
  "## Secret-Handling Boundary", "## Exact Read-Only Operation Inventory",
  "## Contacted Endpoint Inventory", "## Authentication Result", "## Account and Team Result",
  "## Exact-Site Result", "## Ownership Result", "## Domain and Branch Result",
  "## Preview Capability Result", "## Production-Risk Result",
  "## Explicit Site-Targeting Result", "## Linkage Result", "## Target Classification",
  "## Filesystem and Configuration Result", "## Credential Cleanup",
  "## Action 362 and Attempt State", "## Final Capability Decision", "## Next Permitted Action",
];
const documentationComplete = existsSync(documentPath) && existsSync(evidencePath) &&
  requiredSections.every((section) => document.includes(section)) &&
  document.includes("`capability_blocked`") && document.includes("`unavailable_target`") &&
  document.includes("Empty. The Netlify network boundary was not opened") &&
  document.includes("does not inherit authorization from that prior request");

const passed = upstreamExact && candidateExact && cliExact && operatorInputsAbsent && noSecretFields &&
  canaryExact && authExact && operationsExact && identityOwnershipExact && targetExact && linkageExact &&
  filesystemExact && cleanupExact && safetyExact && decisionExact && documentationComplete;

const result = {
  verification_status: passed ? "passed" : "failed",
  final_capability_decision: "capability_blocked",
  block_reason: evidence?.block_reason ?? null,
  action_378_gate_healthy: upstreamExact,
  candidate_exact_and_clean: candidateExact,
  exact_cli_identity_preserved: cliExact,
  action_362_approval_preserved: evidence?.upstream_state?.action_362_approval_preserved ?? null,
  preview_attempt_consumed: evidence?.upstream_state?.preview_attempt_consumed ?? null,
  deployment_attempt_count: evidence?.upstream_state?.deployment_attempt_count ?? null,
  operator_authorized: evidence?.operator_inputs?.operator_authorized ?? null,
  credential_present: evidence?.operator_inputs?.credential_present ?? null,
  exact_site_id_present: evidence?.operator_inputs?.exact_site_id_present ?? null,
  secret_value_absent: noSecretFields,
  token_fingerprint_absent: evidence?.authentication?.credential_fingerprint_recorded === false,
  synthetic_canary_pipeline_passed: canaryExact,
  authentication_result: evidence?.authentication?.authentication_result ?? null,
  target_classification: evidence?.target?.classification ?? null,
  contacted_endpoint_count: evidence?.network?.contacted_endpoint_classifications?.length ?? null,
  authentication_performed: evidence?.authentication?.authentication_performed ?? null,
  netlify_call_performed: evidence?.network?.netlify_api_called ?? null,
  site_linkage_created: evidence?.linkage?.linkage_performed ?? null,
  netlify_state_created: evidence?.linkage?.netlify_state_created ?? null,
  repository_and_candidate_integrity_verified: filesystemExact,
  credential_cleanup_verified: cleanupExact,
  deployment_performed: evidence?.safety?.deployment_performed ?? null,
  production_blocked: evidence?.safety?.production_blocked ?? null,
  main_blocked: evidence?.safety?.main_blocked ?? null,
  next_execution_approval_refresh: evidence?.next_execution_approval_refresh ?? null,
  recommended_next_action: evidence?.recommended_next_action ?? null,
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
