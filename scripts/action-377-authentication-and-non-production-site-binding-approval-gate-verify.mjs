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
  "docs/action-377-authentication-and-non-production-site-binding-approval-gate.md");
const action376EvidencePath = join(root,
  "docs/action-376-controlled-netlify-cli-materialization-and-offline-capability-evidence.json");

const expected = {
  candidateSha: "b0bb5c4686d9cab3b682b3b06fadee4cf73cab07",
  baselineSha: "51aced66782ec9a37cd358238f02b6f5c0ae97bd",
  routeSha: "98c7de74c94364eed9a447469ef367f1f454b42ae17d3911b3ebfad6ed5213bb",
  manifestSha: "b7ac9ddaf40cc516bcdbdc7208dc6669f6b34a18a1810c0bde72209b25710892",
  toolingLockSha: "c4debb7fd8121b93021194a5b6f76e62a7278f804e97ebdd8057f97981d78ef2",
  cliManifestSha: "a145ebb0632b2fee19d5f1cce90812041541bfdaf59d5de6f39cb89be75b4887",
  executableSha: "e39432e46703049b6769e17c0a7a8f1748c345100a1f934d8a6c7076001d426c",
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

const document = read(documentPath);
const action376Evidence = json(action376EvidencePath);
let action376 = null;
try {
  action376 = JSON.parse(execFileSync("node", [join(root,
    "scripts/action-376-controlled-netlify-cli-materialization-and-offline-capability-verification-verify.mjs")], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }));
} catch {
  action376 = null;
}

const upstreamExact = action376?.verification_status === "passed" &&
  action376?.capability_decision === "capable_with_conditions" &&
  action376?.action_362_approval_preserved === true &&
  action376?.preview_attempt_consumed === false && action376?.deployment_attempt_count === 0 &&
  action376?.authentication_performed === false && action376?.site_linkage_created === false &&
  action376?.deployment_performed === false;
const candidateExact = git(["rev-parse", "HEAD"], candidateRoot) === expected.candidateSha &&
  git(["rev-parse", "HEAD^"], candidateRoot) === expected.baselineSha &&
  git(["status", "--porcelain=v1", "--untracked-files=all"], candidateRoot) === "" &&
  sha256(join(candidateRoot, "app/api/runtime-health/ping/route.ts")) === expected.routeSha &&
  sha256(join(candidateRoot, "docs/action-370-preview-deployment-input-manifest.json")) ===
    expected.manifestSha;
const cliExact = action376Evidence?.materialization?.selected_package === "netlify-cli" &&
  action376Evidence?.materialization?.selected_version === "26.2.0" &&
  sha256(join(toolingRoot, "package-lock.json")) === expected.toolingLockSha &&
  sha256(join(toolingRoot, "node_modules/netlify-cli/package.json")) === expected.cliManifestSha &&
  sha256(join(toolingRoot, "node_modules/netlify-cli/bin/run.js")) === expected.executableSha;

const requiredSections = [
  "## Purpose", "## Scope", "## Recovery Context", "## Upstream Dependencies",
  "## Action 376 Capability Result", "## Exact Candidate Binding", "## Exact CLI Identity",
  "## Approval and Attempt State", "## Explicit Non-Goals", "## Authentication Strategy Options",
  "## Selected Future Authentication Strategy", "## Credential Source Requirements",
  "## Credential Provenance Requirements", "## Credential Validity Requirements",
  "## Permission-Scope Requirements", "## Credential Redaction Requirements",
  "## Secret Non-Persistence Requirements", "## Disposable HOME and Configuration Policy",
  "## Account Identity Requirements", "## Team Identity Requirements", "## Site Identity Requirements",
  "## Site Ownership Requirements", "## Production Domain Requirements",
  "## Production Branch Requirements", "## Preview Capability Requirements",
  "## Production Alias Risk Requirements", "## Target-Classification Vocabulary",
  "## Verified Non-Production Preview Requirements", "## Exact Read-Only Network Boundary",
  "## Future Command Allowlist", "## Command Denylist", "## Local Linkage Options",
  "## Selected Linkage Policy", "## `.netlify` State Policy", "## Candidate-Local Isolation",
  "## Drift Prohibitions", "## Source-Binding Requirements", "## Stop Conditions",
  "## Action 378 Evidence Contract", "## Approval Vocabulary", "## Deterministic Gate Conditions",
  "## Approval Decision", "## Passed Conditions", "## Failed Conditions",
  "## Unresolved Conditions", "## No-Effect Record", "## Next Permitted Action",
];
const documentationComplete = existsSync(documentPath) &&
  requiredSections.every((section) => document.includes(section));
const strategiesExact = [
  "### A. User-Provided Process-Scoped Personal Access Token",
  "### B. Existing User-Home CLI State",
  "### C. Interactive Browser Login",
  "### D. OAuth or Device Flow",
  "### E. Existing Approved Deployment Connector",
  "### F. Repository or Application Environment Discovery",
  "Strategy A is selected for Action 378",
  "Assessment: rejected and prohibited",
].every((phrase) => document.includes(phrase));
const credentialBoundaryExact = [
  "operator_supplied_existing_personal_access_token",
  "never written to disk", "never echoed", "never passed on a command line",
  "Token fingerprints are prohibited by default",
  "synthetic canary secret", "Repository files, application environment files",
  "Real-user home and Netlify state remain inaccessible",
].every((phrase) => document.includes(phrase));
const identityOwnershipExact = [
  "## Account Identity Requirements", "## Team Identity Requirements",
  "A site-name match is insufficient", "operator-approved exact site ID",
  "ownership_match: true", "Production domain", "production branch",
  "deploy-preview configuration", "target identity is provable before deployment",
].every((phrase) => document.includes(phrase));
const targetVocabularyExact = [
  "`verified_non_production_preview`", "`verified_production`",
  "`ambiguous_target`", "`unavailable_target`",
].every((phrase) => document.includes(phrase)) &&
  document.includes("Only `verified_non_production_preview` may permit");
const readOnlyBoundaryExact = [
  "`getCurrentUser`", "`listAccountsForUser`", "`getSite`",
  "All must be GET/read-only", "it may not broaden the boundary dynamically",
  "No account mutation", "No broad site listing or fuzzy site-name selection",
].every((phrase) => document.includes(phrase));
const linkageExact = [
  "### A. No Persistent Linkage", "Assessment: selected",
  "### B. Temporary Disposable Linkage State", "fallback only; not approved",
  "### C. Link the Immutable Candidate", "### D. Link the Shared Worktree",
  "Policy A: no persistent linkage", "Action 378 must not create `.netlify` anywhere",
].every((phrase) => document.includes(phrase));
const commandsAndStopsExact = [
  "purpose-built local evidence helper", "Broad CLI commands such as `status`",
  "deploy, link, unlink, init, login, logout, status, generic API dispatch",
  "Target classification is not `verified_non_production_preview`",
  "The preview attempt would be consumed",
].every((phrase) => document.includes(phrase));
const evidenceContractExact = [
  "Evidence schema version", "Credential-present, credential-valid",
  "Redacted account and team identity", "Exact site ID",
  "Target classification using the exact vocabulary", "Frozen endpoint/helper inventory",
  "It must not contain tokens, passwords, cookies, authorization headers",
].every((phrase) => document.includes(phrase));
const decisionExact = document.includes("`approval_decision: approved_with_conditions`") &&
  document.includes("No operator-authorized credential has been supplied or validated") &&
  document.includes("action_378_user_authorized_read_only_authentication_and_exact_site_metadata_capability_verification");
const noEffectsExact = [
  "credential_access_performed: false", "authentication_performed: false",
  "Netlify_call_performed: false", "account_site_inspection_performed: false",
  "site_linkage_created: false", ".netlify_state_created: false",
  "deployment_performed: false", "preview_attempt_consumed: false",
  "deployment_attempt_count: 0", "production_blocked: true", "main_blocked: true",
].every((phrase) => document.includes(phrase));
const forbiddenStateAbsent = !existsSync(join(root, ".netlify")) &&
  !existsSync(join(candidateRoot, ".netlify"));

const passed = documentationComplete && upstreamExact && candidateExact && cliExact &&
  strategiesExact && credentialBoundaryExact && identityOwnershipExact && targetVocabularyExact &&
  readOnlyBoundaryExact && linkageExact && commandsAndStopsExact && evidenceContractExact &&
  decisionExact && noEffectsExact && forbiddenStateAbsent;

const result = {
  verification_status: passed ? "passed" : "failed",
  approval_decision: passed ? "approved_with_conditions" : "blocked",
  action_376_capability_preserved: upstreamExact,
  candidate_exact_and_clean: candidateExact,
  exact_cli_identity_preserved: cliExact,
  action_362_approval_preserved: action376?.action_362_approval_preserved ?? null,
  preview_attempt_consumed: action376?.preview_attempt_consumed ?? null,
  deployment_attempt_count: action376?.deployment_attempt_count ?? null,
  selected_authentication_strategy: "operator_supplied_process_scoped_personal_access_token",
  selected_linkage_policy: "explicit_verified_site_id_without_persistent_linkage",
  target_classification_required: "verified_non_production_preview",
  authentication_strategies_complete: strategiesExact,
  credential_redaction_and_nonpersistence_complete: credentialBoundaryExact,
  account_team_site_ownership_contract_complete: identityOwnershipExact,
  read_only_boundary_complete: readOnlyBoundaryExact,
  linkage_contract_complete: linkageExact,
  action_378_evidence_contract_complete: evidenceContractExact,
  credential_access_performed: false,
  authentication_performed: false,
  netlify_call_performed: false,
  account_site_inspection_performed: false,
  site_linkage_created: false,
  netlify_state_created: false,
  deployment_performed: false,
  production_blocked: true,
  main_blocked: true,
  recommended_next_action:
    "action_378_user_authorized_read_only_authentication_and_exact_site_metadata_capability_verification",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
