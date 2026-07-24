#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, lstatSync, readFileSync, readdirSync, readlinkSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const toolingRoot = "/private/tmp/ture-action-376-netlify-cli-tooling";
const candidateRoot = "/private/tmp/ture-action-370-corrected-preview-candidate";
const documentPath = join(root,
  "docs/action-376-controlled-netlify-cli-materialization-and-offline-capability-verification.md");
const evidencePath = join(root,
  "docs/action-376-controlled-netlify-cli-materialization-and-offline-capability-evidence.json");

const expected = {
  candidateSha: "b0bb5c4686d9cab3b682b3b06fadee4cf73cab07",
  baselineSha: "51aced66782ec9a37cd358238f02b6f5c0ae97bd",
  routeSha: "98c7de74c94364eed9a447469ef367f1f454b42ae17d3911b3ebfad6ed5213bb",
  candidateManifestSha: "b7ac9ddaf40cc516bcdbdc7208dc6669f6b34a18a1810c0bde72209b25710892",
  toolingManifestSha: "0f29e999e8930f4718361c55f855cac4be053839f0ed317e49e01a561fb9be27",
  toolingLockSha: "c4debb7fd8121b93021194a5b6f76e62a7278f804e97ebdd8057f97981d78ef2",
  cliManifestSha: "a145ebb0632b2fee19d5f1cce90812041541bfdaf59d5de6f39cb89be75b4887",
  executableSha: "e39432e46703049b6769e17c0a7a8f1748c345100a1f934d8a6c7076001d426c",
  normalizedCliInventory: "7dc1e74e6e0bdc0d53f9442d452178c2dbe33065c2420010eb96d5b066578f2c",
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

function normalizedFileInventory(rootPath) {
  if (!existsSync(rootPath)) return { count: 0, digest: null };
  const lines = [];
  function walk(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.isFile()) {
        const bytes = readFileSync(path);
        const relativePath = relative(rootPath, path).split(sep).join("/");
        lines.push(`${relativePath}\t${bytes.length}\t${createHash("sha256").update(bytes).digest("hex")}`);
      }
    }
  }
  walk(rootPath);
  lines.sort();
  return {
    count: lines.length,
    digest: createHash("sha256").update(`${lines.join("\n")}\n`).digest("hex"),
  };
}

function installedDependencyInventory(lock) {
  const lines = [];
  for (const [path, lockEntry] of Object.entries(lock?.packages ?? {})) {
    if (!path.startsWith("node_modules/")) continue;
    const manifestPath = join(toolingRoot, path, "package.json");
    if (!existsSync(manifestPath)) continue;
    const manifest = json(manifestPath);
    lines.push([
      path,
      manifest?.name ?? lockEntry?.name ?? "",
      manifest?.version ?? lockEntry?.version ?? "",
      sha256(manifestPath),
    ].join("\t"));
  }
  lines.sort();
  return {
    count: lines.length,
    digest: createHash("sha256").update(`${lines.join("\n")}\n`).digest("hex"),
  };
}

function symlinkAndExecutableInventories(rootPath) {
  const links = [];
  const executables = [];
  function walk(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      const relativePath = `node_modules/${relative(rootPath, path).split(sep).join("/")}`;
      const stat = lstatSync(path);
      if (stat.isSymbolicLink()) links.push(`${relativePath}\t${readlinkSync(path)}`);
      else if (stat.isDirectory()) walk(path);
      else if (stat.isFile() && (stat.mode & 0o111)) {
        executables.push(`${relativePath}\t${(stat.mode & 0o777).toString(8)}\t${sha256(path)}`);
      }
    }
  }
  if (existsSync(rootPath)) walk(rootPath);
  links.sort();
  executables.sort();
  const digest = (lines) => createHash("sha256").update(`${lines.join("\n")}\n`).digest("hex");
  return {
    symlinkCount: links.length,
    symlinkDigest: digest(links),
    executableCount: executables.length,
    executableDigest: digest(executables),
  };
}

const document = read(documentPath);
const evidence = json(evidencePath);
const toolingManifest = json(join(toolingRoot, "package.json"));
const toolingLock = json(join(toolingRoot, "package-lock.json"));
const installedManifest = json(join(toolingRoot, "node_modules/netlify-cli/package.json"));
const cliInventory = normalizedFileInventory(join(toolingRoot, "node_modules/netlify-cli"));
const dependencyInventory = installedDependencyInventory(toolingLock);
const installedInventories = symlinkAndExecutableInventories(join(toolingRoot, "node_modules"));

let action375 = null;
try {
  action375 = JSON.parse(execFileSync("node", [join(root,
    "scripts/action-375-netlify-cli-version-package-provenance-and-integrity-resolution-verify.mjs")], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }));
} catch {
  action375 = null;
}

const candidateExact = git(["rev-parse", "HEAD"], candidateRoot) === expected.candidateSha &&
  git(["rev-parse", "HEAD^"], candidateRoot) === expected.baselineSha &&
  git(["status", "--porcelain=v1", "--untracked-files=all"], candidateRoot) === "" &&
  sha256(join(candidateRoot, "app/api/runtime-health/ping/route.ts")) === expected.routeSha &&
  sha256(join(candidateRoot, "docs/action-370-preview-deployment-input-manifest.json")) ===
    expected.candidateManifestSha;
const upstreamExact = action375?.verification_status === "passed" &&
  action375?.resolution_status === "resolved_with_conditions" &&
  action375?.preview_attempt_consumed === false && action375?.deployment_attempt_count === 0;
const toolingDefinitionExact = toolingManifest?.private === true &&
  Object.keys(toolingManifest?.dependencies ?? {}).length === 1 &&
  toolingManifest?.dependencies?.["netlify-cli"] === "26.2.0" &&
  sha256(join(toolingRoot, "package.json")) === expected.toolingManifestSha &&
  sha256(join(toolingRoot, "package-lock.json")) === expected.toolingLockSha &&
  toolingLock?.lockfileVersion === 3 &&
  toolingLock?.packages?.[""]?.dependencies?.["netlify-cli"] === "26.2.0";
const lockHosts = [...new Set(Object.values(toolingLock?.packages ?? {})
  .map((entry) => entry?.resolved)
  .filter(Boolean)
  .map((url) => new URL(url).host))].sort();
const lockExact = lockHosts.join("|") === "registry.npmjs.org" &&
  toolingLock?.packages?.["node_modules/netlify-cli"]?.version === "26.2.0" &&
  toolingLock?.packages?.["node_modules/netlify-cli"]?.integrity ===
    evidence?.action_375_artifact?.registry_integrity;
const installedIdentityExact = installedManifest?.name === "netlify-cli" &&
  installedManifest?.version === "26.2.0" &&
  sha256(join(toolingRoot, "node_modules/netlify-cli/package.json")) === expected.cliManifestSha &&
  sha256(join(toolingRoot, "node_modules/netlify-cli/bin/run.js")) === expected.executableSha &&
  readlinkSync(join(toolingRoot, "node_modules/.bin/netlify")) === "../netlify-cli/bin/run.js" &&
  cliInventory.count === 1113 && cliInventory.digest === expected.normalizedCliInventory;
const inventoriesExact = dependencyInventory.count === evidence?.materialization?.installed_dependency_count &&
  dependencyInventory.digest === evidence?.materialization?.installed_dependency_inventory_digest &&
  installedInventories.symlinkCount === evidence?.materialization?.symlink_count &&
  installedInventories.symlinkDigest === evidence?.materialization?.symlink_inventory_digest &&
  installedInventories.executableCount === evidence?.materialization?.executable_file_count &&
  installedInventories.executableDigest === evidence?.materialization?.executable_inventory_digest;
const isolationExact = evidence?.tooling_context?.classification ===
  "disposable_isolated_nonproduction_untracked_sibling" &&
  evidence?.tooling_context?.inside_shared_worktree === false &&
  evidence?.tooling_context?.inside_candidate === false &&
  evidence?.tooling_context?.application_credentials_inherited === false &&
  ["home", "config", "cache", "temp"].every((key) =>
    evidence?.isolation?.[key]?.startsWith(`${toolingRoot}/`));
const lifecycleExact = evidence?.materialization_policy?.lifecycle_scripts_disabled === true &&
  evidence?.materialization_policy?.lifecycle_script_execution_count === 0 &&
  evidence?.materialization_policy?.postinstall_executed === false &&
  evidence?.materialization_policy?.audit_disabled === true &&
  evidence?.materialization_policy?.funding_calls_disabled === true;
const commandsExact = evidence?.offline_commands?.allowlist?.join("|") ===
  "netlify --version|netlify --help|netlify deploy --help" &&
  evidence?.offline_commands?.executed?.length === 3 &&
  evidence.offline_commands.executed.every((entry) => entry.exit_code === 0) &&
  evidence?.offline_commands?.executed?.[0]?.result ===
    "netlify-cli/26.2.0 darwin-arm64 node-v26.3.1" &&
  evidence?.offline_commands?.denylisted_command_executed === false &&
  evidence?.offline_commands?.npx_used === false;
const networkExact = evidence?.network_enforcement?.result === "outbound_access_prevented" &&
  evidence?.network_enforcement?.enforced_for_every_cli_command === true &&
  evidence?.network_enforcement?.dns_control_blocked === true &&
  evidence?.network_enforcement?.direct_ip_control_blocked === true &&
  evidence?.network_enforcement?.netlify_api_access_possible_during_commands === false;
const semanticsExact = evidence?.command_capabilities?.draft_deploy_default_confirmed === true &&
  evidence?.command_capabilities?.deploy_preview_context_option_confirmed === true &&
  evidence?.command_capabilities?.explicit_site_targeting_confirmed === true &&
  evidence?.command_capabilities?.machine_readable_json_option_confirmed === true &&
  evidence?.command_capabilities?.production_flags_present_and_denylisted?.join("|") ===
    "--prod|--prod-if-unlocked" &&
  evidence?.command_capabilities?.anonymous_site_creation_present_and_denylisted === true;
const configExact = evidence?.telemetry_and_update?.outbound_network_denied === true &&
  evidence?.telemetry_and_update?.telemetry_egress_possible === false &&
  evidence?.telemetry_and_update?.update_check_egress_possible === false &&
  evidence?.telemetry_and_update?.self_update_executed === false &&
  evidence?.telemetry_and_update?.isolated_config_keys?.join("|") ===
    "cliId|telemetryDisabled" &&
  evidence?.telemetry_and_update?.isolated_config_cli_id_value_recorded === false &&
  evidence?.filesystem_and_config?.global_config_write_detected === false &&
  evidence?.filesystem_and_config?.real_user_home_write_detected === false;
const worktreesExact = sha256(join(root, "package.json")) === expected.appPackageSha &&
  sha256(join(root, "package-lock.json")) === expected.appLockSha &&
  evidence?.shared_worktree?.materialization_or_cli_drift_detected === false &&
  evidence?.candidate?.drift_detected === false && candidateExact;
const securityExact = evidence?.security_results && [
  "credential_access_performed", "authentication_performed", "site_or_account_inspection_performed",
  "site_linkage_created", "netlify_authenticated_api_called", "deployment_performed",
  "preview_url_allocated", "production_changed", "main_changed",
].every((key) => evidence.security_results[key] === false) &&
  evidence.security_results.production_blocked === true && evidence.security_results.main_blocked === true;
const capabilityExact = evidence?.capability_vocabulary?.join("|") ===
  "capable|capable_with_conditions|blocked" &&
  evidence?.capability_decision === "capable_with_conditions" &&
  evidence?.failed_conditions?.length === 0 && evidence?.unresolved_conditions?.length === 1 &&
  evidence?.recommended_next_action ===
    "separate_authentication_and_nonproduction_site_binding_readiness_gate_without_deployment";

const requiredPhrases = [
  "## Purpose", "## Scope", "## Recovery Context", "## Upstream Dependencies",
  "## Action 375 Resolution", "## Candidate Binding", "## Approval and Attempt State",
  "## Explicit Non-Goals", "## Tooling Context Definition", "## Tooling-Only Manifest",
  "## Bounded Registry Window", "## Lifecycle, Audit, and Update Policy",
  "## Installed Integrity", "## Credential and Configuration Isolation",
  "## Telemetry and Self-Update", "## Offline Command Allowlist", "## Network Enforcement",
  "## Offline Command Results", "## Draft and Site-Targeting Semantics",
  "## Filesystem Before and After", "## Cleanup Policy", "## Capability Vocabulary",
  "## Deterministic Capability Conditions", "## Capability Decision", "## Passed Conditions",
  "## Failed Conditions", "## Unresolved Conditions", "## Next Permitted Action",
  "`capable_with_conditions`", "preview_attempt_consumed: false",
  "deployment_attempt_count: 0", "No deployment command", "production/main blocked",
];
const documentationExact = requiredPhrases.every((phrase) => document.includes(phrase));

const passed = existsSync(documentPath) && existsSync(evidencePath) && upstreamExact && candidateExact &&
  toolingDefinitionExact && lockExact && installedIdentityExact && inventoriesExact && isolationExact &&
  lifecycleExact && commandsExact && networkExact && semanticsExact && configExact && worktreesExact &&
  securityExact && capabilityExact && documentationExact;

const result = {
  verification_status: passed ? "passed" : "failed",
  capability_decision: passed ? "capable_with_conditions" : "blocked",
  action_375_gate_healthy: upstreamExact,
  action_362_approval_preserved: evidence?.upstream_state?.action_362_approval_preserved ?? null,
  preview_attempt_consumed: evidence?.upstream_state?.preview_attempt_consumed ?? null,
  deployment_attempt_count: evidence?.upstream_state?.deployment_attempt_count ?? null,
  candidate_exact_and_clean: candidateExact,
  tooling_definition_exact: toolingDefinitionExact,
  lock_registry_boundary_exact: lockExact,
  exact_cli_identity_verified: installedIdentityExact,
  installed_inventories_verified: inventoriesExact,
  lifecycle_and_postinstall_disabled: lifecycleExact,
  isolated_context_verified: isolationExact,
  offline_allowlist_verified: commandsExact,
  outbound_network_denied: networkExact,
  draft_site_and_production_semantics_bounded: semanticsExact,
  telemetry_update_and_config_contained: configExact,
  shared_worktree_and_candidate_integrity_verified: worktreesExact,
  credential_access_performed: evidence?.security_results?.credential_access_performed ?? null,
  authentication_performed: evidence?.security_results?.authentication_performed ?? null,
  site_linkage_created: evidence?.security_results?.site_linkage_created ?? null,
  netlify_authenticated_api_called: evidence?.security_results?.netlify_authenticated_api_called ?? null,
  deployment_performed: evidence?.security_results?.deployment_performed ?? null,
  production_blocked: evidence?.security_results?.production_blocked ?? null,
  main_blocked: evidence?.security_results?.main_blocked ?? null,
  recommended_next_action: evidence?.recommended_next_action ?? null,
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
