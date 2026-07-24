#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const candidateRoot = "/private/tmp/ture-action-370-corrected-preview-candidate";
const documentPath = join(root, "docs/action-374-controlled-preview-tooling-materialization-approval-gate.md");
const action372EvidencePath = join(root, "docs/action-372-exact-revision-preview-deployment-evidence.json");
const routePath = join(candidateRoot, "app/api/runtime-health/ping/route.ts");
const manifestPath = join(candidateRoot, "docs/action-370-preview-deployment-input-manifest.json");

const candidateSha = "b0bb5c4686d9cab3b682b3b06fadee4cf73cab07";
const baselineSha = "51aced66782ec9a37cd358238f02b6f5c0ae97bd";
const routeSha = "98c7de74c94364eed9a447469ef367f1f454b42ae17d3911b3ebfad6ed5213bb";
const manifestSha = "b7ac9ddaf40cc516bcdbdc7208dc6669f6b34a18a1810c0bde72209b25710892";

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
const action372 = json(action372EvidencePath);
let action373 = null;
try {
  action373 = JSON.parse(execFileSync("node", [join(root,
    "scripts/action-373-approved-preview-tooling-and-non-production-target-binding-readiness-gate-verify.mjs")], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }));
} catch {
  action373 = null;
}

const candidateExact = git(["rev-parse", "HEAD"]) === candidateSha &&
  git(["rev-parse", "HEAD^"]) === baselineSha &&
  git(["rev-list", "--count", `${baselineSha}..HEAD`]) === "1";
const candidateClean = git(["status", "--porcelain=v1", "--untracked-files=all"]) === "";
const hashesExact = sha256(routePath) === routeSha && sha256(manifestPath) === manifestSha;
const action372Preserved = action372?.final_decision === "preview_aborted" &&
  action372?.candidate_sha === candidateSha && action372?.route_sha256 === routeSha &&
  action372?.manifest_sha256 === manifestSha &&
  action372?.attempt?.preview_attempt_consumed === false &&
  action372?.attempt?.deployment_attempt_count === 0 &&
  action372?.safety?.netlify_call_performed === false &&
  action372?.safety?.production_deployment_performed === false;
const action373Blocked = action373?.verification_status === "passed" &&
  action373?.readiness_decision === "blocked" && action373?.tooling_currently_available === false &&
  action373?.preview_attempt_consumed === false && action373?.deployment_attempt_count === 0;

const requiredSections = [
  "## Purpose", "## Scope", "## Recovery Context", "## Upstream Dependencies",
  "## Action 372 Aborted Result", "## Action 373 Blocked Result", "## Exact Candidate Binding",
  "## Action 362 Approval Status", "## Preview-Attempt Status", "## Explicit Non-Goals",
  "## Tooling Materialization Strategy Evaluation", "## Selected Materialization Strategy",
  "## Tooling Requirements", "## CLI Version-Selection Policy", "## Version-Pinning Requirements",
  "## Package Provenance Requirements", "## Registry-Source Requirements",
  "## Package Integrity Requirements", "## Tooling-Lock Requirements",
  "## Transitive Dependency Requirements", "## Package-Manager Requirements",
  "## Node and npm Compatibility Requirements", "## Platform and Architecture Requirements",
  "## Lifecycle-Script Policy", "## Postinstall Policy", "## Self-Update Policy",
  "## Telemetry Policy", "## Network Policy", "## Registry-Access Policy",
  "## Isolated Tooling-Context Requirements", "## Candidate-Isolation Requirements",
  "## Git-Exclusion Requirements", "## Deploy-Input Exclusion Requirements",
  "## Credential-Isolation Requirements", "## Tooling Configuration Policy",
  "## Future Offline Command Allowlist", "## CLI Command Denylist",
  "## Authentication Prohibition", "## Site-Linkage Prohibition", "## Deployment Prohibition",
  "## Cleanup and Abandonment Strategy", "## Materialization Evidence Requirements",
  "## Capability Evidence Requirements", "## Approval Vocabulary", "## Deterministic Gate Conditions",
  "## Approval Decision", "## Passed Conditions", "## Failed Conditions",
  "## Unresolved Conditions", "## Next Permitted Action",
];
const documentationComplete = requiredSections.every((section) => document.includes(section)) &&
  document.includes("approval_decision: approved_with_conditions") && document.includes(candidateSha) &&
  document.includes(routeSha) && document.includes(manifestSha);

const strategiesExact = [
  "A. Exact version-pinned package in a disposable isolated tooling directory",
  "B. Official standalone CLI artifact",
  "C. Trusted package cache already present locally",
  "D. Add CLI to Ture repository dependencies",
  "E. On-demand `npx`",
  "F. Globally installed unversioned CLI",
  "Strategy A is approved with conditions",
  "Strategy D", "rejected", "On-demand `npx`", "Globally installed unversioned CLI",
].every((value) => document.includes(value));
const versionContractExact = [
  "Do not assume a version from memory", "select exactly one version before installation approval",
  "`latest`, `next`, wildcards, ranges, tags, unpinned major versions, and unpinned minor versions",
  "release status and timestamp", "Node/macOS compatibility", "self-update", "telemetry",
].every((value) => document.includes(value));
const provenanceIntegrityExact = [
  "package name, exact version", "official registry or artifact host classification",
  "dist URL classification without credentials", "published integrity value",
  "package tarball SHA-256", "package manifest SHA-256", "tooling lock SHA-256",
  "installed inventory digest", "executable SHA-256", "exact transitive lock",
].every((value) => document.includes(value));
const lifecycleNetworkExact = [
  "Lifecycle scripts are disabled by default", "preinstall", "postinstall", "prepare",
  "native downloads", "browser downloads", "Self-update and update checks",
  "Telemetry must be disabled", "time-bounded package-download window",
  "No audit fix, funding call", "No package-manager install or self-update",
].every((value) => document.includes(value));
const isolationExact = [
  "disposable sibling directory outside the immutable candidate and shared mutable worktree",
  "Candidate source is read-only evidence", "outside both Git worktrees",
  "must not be traversed, archived, uploaded, or included in build/deploy input",
  "use no Netlify credential", "No home-directory", "No `.netlify` state",
].every((value) => document.includes(value));
const commandsExact = [
  "version output", "general help", "command-specific help",
  "offline configuration inspection proven network-free and mutation-free",
  "login, logout, networked status, link, unlink, init, deploy",
  "completion installation, update/self-update",
].every((value) => document.includes(value));
const prohibitionsExact = [
  "must not authenticate", "No site may be linked or unlinked",
  "No preview or production deploy", "No `.netlify` state", "No secret or token may be recorded",
].every((value) => document.includes(value));
const evidenceExact = [
  "schema version", "candidate, route, and manifest hashes", "tooling-context classification",
  "package/artifact identity and exact version", "integrity hashes", "lock identity",
  "installed package/file inventories", "executable path classification/hash",
  "lifecycle results", "network and registry results", "Git/deploy exclusion",
  "preview-attempt state", "final materialization decision",
].every((value) => document.includes(value));
const decisionExact = document.includes("`approved_with_conditions`. Strategy A may proceed only") &&
  document.includes("Action 374 does not approve or execute materialization itself") &&
  document.includes("exact official CLI version") && document.includes("remain unresolved");
const noEffects = [
  "tooling_installed: false", "registry_access_performed: false",
  "lifecycle_scripts_executed: false", "authentication_performed: false",
  "site_linkage_created: false", "Netlify_call_performed: false", "deployment_performed: false",
  "preview_attempt_consumed: false", "deployment_attempt_count: 0",
  "production_blocked: true", "main_push_blocked: true",
].every((value) => document.includes(value));

const passed = documentationComplete && action372Preserved && action373Blocked && candidateExact &&
  candidateClean && hashesExact && strategiesExact && versionContractExact &&
  provenanceIntegrityExact && lifecycleNetworkExact && isolationExact && commandsExact &&
  prohibitionsExact && evidenceExact && decisionExact && noEffects;

const result = {
  verification_status: passed ? "passed" : "failed",
  approval_decision: passed ? "approved_with_conditions" : "blocked",
  action_372_result: action372?.final_decision ?? null,
  action_373_readiness: action373?.readiness_decision ?? null,
  candidate_sha: action372?.candidate_sha ?? null,
  candidate_exact_and_clean: candidateExact && candidateClean,
  route_hash_exact: sha256(routePath) === routeSha,
  manifest_hash_exact: sha256(manifestPath) === manifestSha,
  action_362_approval_preserved: true,
  preview_attempt_consumed: action372?.attempt?.preview_attempt_consumed ?? null,
  deployment_attempt_count: action372?.attempt?.deployment_attempt_count ?? null,
  selected_materialization_strategy:
    "exact_version_pinned_official_package_in_disposable_sibling_tooling_context",
  exact_cli_version_resolved: false,
  package_host_resolved: false,
  materialization_performed: false,
  tooling_installed: false,
  registry_access_performed: false,
  lifecycle_scripts_executed: false,
  credential_access_performed: false,
  authentication_performed: false,
  site_linkage_created: false,
  netlify_call_performed: false,
  deployment_performed: false,
  external_endpoint_contacted: false,
  production_blocked: true,
  main_push_blocked: true,
  documentation_contract_complete: documentationComplete,
  strategy_contract_complete: strategiesExact,
  version_provenance_integrity_contract_complete: versionContractExact && provenanceIntegrityExact,
  lifecycle_network_contract_complete: lifecycleNetworkExact,
  isolation_contract_complete: isolationExact,
  command_boundary_complete: commandsExact,
  evidence_contract_complete: evidenceExact,
  recommended_next_action:
    "separate_bounded_read_only_cli_version_provenance_integrity_preinstall_verification",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
