#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const candidateRoot = "/private/tmp/ture-action-370-corrected-preview-candidate";
const documentPath = join(root,
  "docs/action-375-netlify-cli-version-package-provenance-and-integrity-resolution.md");
const evidencePath = join(root,
  "docs/action-375-netlify-cli-version-package-provenance-and-integrity-evidence.json");
const routePath = join(candidateRoot, "app/api/runtime-health/ping/route.ts");
const manifestPath = join(candidateRoot, "docs/action-370-preview-deployment-input-manifest.json");

const expected = {
  candidateSha: "b0bb5c4686d9cab3b682b3b06fadee4cf73cab07",
  baselineSha: "51aced66782ec9a37cd358238f02b6f5c0ae97bd",
  routeSha: "98c7de74c94364eed9a447469ef367f1f454b42ae17d3911b3ebfad6ed5213bb",
  manifestSha: "b7ac9ddaf40cc516bcdbdc7208dc6669f6b34a18a1810c0bde72209b25710892",
  version: "26.2.0",
  integrity: "sha512-3jQg9WQoa1H74478fHZisj3T8dLM67x4F4Sgi7kROBHzJD9NNCYYw99dKRYWJOtEa1dUNyZu2W4VTdPzA1kjiw==",
  tarballSha256: "741d46f0f18df96a8d3ee27614f51bfa529d2f9937a1122976358e54e40f6747",
  manifestSha256: "a145ebb0632b2fee19d5f1cce90812041541bfdaf59d5de6f39cb89be75b4887",
  inventorySha256: "1654fff9d1c845e0b62070461e2b4575d78d5b9e0ac2eb5ae05b16cd21b1541a",
  executableSha256: "e39432e46703049b6769e17c0a7a8f1748c345100a1f934d8a6c7076001d426c",
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
let action374 = null;
try {
  action374 = JSON.parse(execFileSync("node", [join(root,
    "scripts/action-374-controlled-preview-tooling-materialization-approval-gate-verify.mjs")], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }));
} catch {
  action374 = null;
}

const candidateExact = git(["rev-parse", "HEAD"]) === expected.candidateSha &&
  git(["rev-parse", "HEAD^"]) === expected.baselineSha &&
  git(["status", "--porcelain=v1", "--untracked-files=all"]) === "";
const candidateHashesExact = sha256(routePath) === expected.routeSha &&
  sha256(manifestPath) === expected.manifestSha;
const upstreamExact = action374?.verification_status === "passed" &&
  action374?.approval_decision === "approved_with_conditions" &&
  action374?.preview_attempt_consumed === false && action374?.deployment_attempt_count === 0;

const identityExact = evidence?.package_identity?.name === "netlify-cli" &&
  evidence?.package_identity?.official_registry === "https://registry.npmjs.org" &&
  evidence?.package_identity?.repository === "https://github.com/netlify/cli" &&
  evidence?.package_identity?.latest_dist_tag === expected.version &&
  evidence?.package_identity?.deprecated === false &&
  evidence?.selected_package?.version === expected.version;
const versionsExact = evidence?.evaluated_versions?.length === 2 &&
  evidence.evaluated_versions[0]?.version === "26.2.0" &&
  evidence.evaluated_versions[1]?.version === "26.1.0" &&
  evidence.evaluated_versions.every((item) => item.deprecated === false &&
    item.node_engine === ">=20.12.2" && item.release_status === "stable" &&
    item.tarball_available === true && item.preview_deploy_supported === true &&
    item.explicit_site_targeting_supported === true) &&
  evidence?.release_channels?.floating_version_rejected === true &&
  evidence?.release_channels?.prerelease_selected === false;
const integrityExact = evidence?.selected_package?.registry_integrity === expected.integrity &&
  evidence?.selected_package?.computed_tarball_sha512_integrity === expected.integrity &&
  evidence?.selected_package?.computed_tarball_sha1 ===
    evidence?.selected_package?.registry_shasum_sha1 &&
  evidence?.selected_package?.computed_tarball_sha256 === expected.tarballSha256 &&
  evidence?.archive_inspection?.package_manifest_sha256 === expected.manifestSha256 &&
  evidence?.archive_inspection?.inventory_sha256 === expected.inventorySha256 &&
  evidence?.archive_inspection?.executable_files?.[0]?.sha256 === expected.executableSha256 &&
  evidence?.archive_inspection?.path_safety === "passed" &&
  evidence?.archive_inspection?.unexpected_executable_count === 0;
const compatibilityExact = evidence?.compatibility?.required_node === ">=20.12.2" &&
  evidence?.compatibility?.node_compatible === true &&
  evidence?.compatibility?.platform === "darwin" &&
  evidence?.compatibility?.architecture === "arm64" &&
  evidence?.compatibility?.platform_compatible_by_manifest === true;
const lifecycleExact = evidence?.lifecycle_scripts?.preinstall === null &&
  evidence?.lifecycle_scripts?.install === null &&
  evidence?.lifecycle_scripts?.postinstall === "node ./scripts/postinstall.js" &&
  evidence?.lifecycle_scripts?.postinstall_classification ===
    "requires_separate_approval_and_must_remain_disabled" &&
  evidence?.lifecycle_scripts?.lifecycle_scripts_executed === false &&
  evidence?.lifecycle_classifications?.preinstall === "absent" &&
  evidence?.lifecycle_classifications?.install === "absent" &&
  evidence?.lifecycle_classifications?.postinstall === "requires_separate_approval" &&
  evidence?.optional_native_binary_behavior?.transitive_behavior === "requires_exact_lock_review";
const behaviorExact = evidence?.runtime_behavior?.update_check_present === true &&
  evidence?.runtime_behavior?.automatic_self_replacement_observed === false &&
  evidence?.runtime_behavior?.telemetry_present === true &&
  evidence?.runtime_behavior?.global_config_write_risk === true &&
  evidence?.runtime_behavior?.offline_version_help_containment_verified === false;
const commandSemanticsExact = evidence?.command_semantics?.draft_deploy_is_default === true &&
  evidence?.command_semantics?.production_requires_explicit_prod_option === true &&
  evidence?.command_semantics?.deploy_preview_context_supported === true &&
  evidence?.command_semantics?.unique_draft_url_reported === true &&
  evidence?.command_semantics?.deploy_id_reported === true &&
  evidence?.command_semantics?.deploy_command_executed === false &&
  evidence?.credential_and_configuration_behavior?.help_requires_authentication === false &&
  evidence?.credential_and_configuration_behavior?.version_requires_authentication === false &&
  evidence?.credential_and_configuration_behavior
    ?.explicit_site_id_can_avoid_persistent_linkage_in_principle === true &&
  evidence?.production_risk?.production_blocked === true &&
  evidence?.production_risk?.main_blocked === true;
const lockStrategyExact = evidence?.dependency_surface?.exact_transitive_lock_created === false &&
  evidence?.dependency_surface?.lock_strategy ===
    "create_in_disposable_isolated_tooling_context_with_scripts_disabled_after_separate_approval" &&
  evidence?.future_materialization_network?.allowed_host === "registry.npmjs.org" &&
  evidence?.future_materialization_network?.registry_only === true &&
  evidence?.future_materialization_network?.netlify_api_free === true;
const expectedHosts = ["docs.netlify.com", "github.com", "registry.npmjs.org", "www.npmjs.com"];
const contactedHostsExact = evidence?.contacted_hosts?.length === expectedHosts.length &&
  evidence.contacted_hosts.every((entry) => entry.read_only === true) &&
  evidence.contacted_hosts.map((entry) => entry.host).sort().join("|") === expectedHosts.join("|");
const safetyExact = evidence?.safety &&
  Object.entries(evidence.safety).every(([key, value]) =>
    key === "preview_attempt_consumed" ? value === false : value === false);
const resolutionExact = evidence?.resolution_status === "resolved_with_conditions" &&
  evidence?.resolution_vocabulary?.join("|") === "resolved|resolved_with_conditions|blocked" &&
  evidence?.conditions_remaining?.length === 4 &&
  evidence?.recommended_next_action ===
    "isolated_exact_lock_materialization_and_network_denied_version_help_capability_verification";

const requiredDocumentPhrases = [
  "resolution_status: resolved_with_conditions",
  "Official package name: `netlify-cli`",
  "Selected exact version: `26.2.0`",
  "Floating `latest`, other dist-tags, ranges, wildcards, prereleases",
  expected.tarballSha256,
  expected.manifestSha256,
  expected.inventorySha256,
  "requires_separate_approval_and_must_remain_disabled",
  "postinstall: requires_separate_approval",
  "network-denied sandbox",
  "disposable `HOME` and `XDG_CONFIG_HOME`",
  "`--prod` and `--prod-if-unlocked` are permanently denied",
  "production_blocked: true",
  "main_blocked: true",
  "No deploy command, authentication, site linkage, Netlify API call",
  "preview_attempt_consumed: false",
  "deployment_attempt_count: 0",
  "Action 375 itself authorizes no installation or CLI execution",
];
const documentationExact = requiredDocumentPhrases.every((value) => document.includes(value));

const passed = candidateExact && candidateHashesExact && upstreamExact && identityExact &&
  versionsExact && integrityExact && compatibilityExact && lifecycleExact && behaviorExact &&
  commandSemanticsExact && lockStrategyExact && contactedHostsExact && safetyExact && resolutionExact &&
  documentationExact;

const result = {
  verification_status: passed ? "passed" : "failed",
  resolution_status: passed ? "resolved_with_conditions" : "blocked",
  package_name: evidence?.package_identity?.name ?? null,
  selected_version: evidence?.selected_package?.version ?? null,
  provenance_resolved: identityExact,
  artifact_integrity_verified: integrityExact,
  node_platform_compatibility_verified: compatibilityExact,
  lifecycle_risk_classified: lifecycleExact,
  transitive_lock_strategy_defined: lockStrategyExact,
  runtime_containment_pending: behaviorExact,
  exact_transitive_lock_created: evidence?.dependency_surface?.exact_transitive_lock_created ?? null,
  candidate_exact_and_clean: candidateExact,
  candidate_hashes_exact: candidateHashesExact,
  action_374_preserved: upstreamExact,
  contacted_hosts_exact_and_read_only: contactedHostsExact,
  preview_attempt_consumed: evidence?.upstream_state?.preview_attempt_consumed ?? null,
  deployment_attempt_count: evidence?.upstream_state?.deployment_attempt_count ?? null,
  package_installed: evidence?.safety?.package_installed ?? null,
  cli_executed: evidence?.safety?.cli_executed ?? null,
  lifecycle_scripts_executed: evidence?.safety?.lifecycle_scripts_executed ?? null,
  authentication_performed: evidence?.safety?.authentication_performed ?? null,
  site_linkage_created: evidence?.safety?.site_linkage_created ?? null,
  netlify_deploy_api_called: evidence?.safety?.netlify_deploy_api_called ?? null,
  deployment_performed: evidence?.safety?.deployment_performed ?? null,
  production_changed: evidence?.safety?.production_changed ?? null,
  production_blocked: evidence?.production_risk?.production_blocked ?? null,
  main_blocked: evidence?.production_risk?.main_blocked ?? null,
  recommended_next_action: evidence?.recommended_next_action ?? null,
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
