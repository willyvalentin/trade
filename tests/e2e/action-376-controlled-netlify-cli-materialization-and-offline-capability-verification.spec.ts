import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "@playwright/test";

const root = process.cwd();
const toolingRoot = "/private/tmp/ture-action-376-netlify-cli-tooling";
const reportPath = join(root,
  "docs/action-376-controlled-netlify-cli-materialization-and-offline-capability-verification.md");
const evidencePath = join(root,
  "docs/action-376-controlled-netlify-cli-materialization-and-offline-capability-evidence.json");
const verifierPath = join(root,
  "scripts/action-376-controlled-netlify-cli-materialization-and-offline-capability-verification-verify.mjs");
const report = readFileSync(reportPath, "utf8");
const evidence = JSON.parse(readFileSync(evidencePath, "utf8"));
const result = JSON.parse(execFileSync("node", [verifierPath], { cwd: root, encoding: "utf8" }));

function sha256(path: string) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

test("documentation and evidence contracts are complete", () => {
  expect(evidence.schema_version).toBe("1.0.0");
  for (const section of [
    "## Purpose", "## Scope", "## Action 375 Resolution", "## Candidate Binding",
    "## Tooling Context Definition", "## Bounded Registry Window", "## Installed Integrity",
    "## Network Enforcement", "## Draft and Site-Targeting Semantics",
    "## Capability Vocabulary", "## Capability Decision", "## Next Permitted Action",
  ]) expect(report).toContain(section);
});

test("preserves exact candidate binding and Action 362 attempt state", () => {
  expect(evidence.candidate.candidate_sha).toBe("b0bb5c4686d9cab3b682b3b06fadee4cf73cab07");
  expect(evidence.candidate.route_sha256)
    .toBe("98c7de74c94364eed9a447469ef367f1f454b42ae17d3911b3ebfad6ed5213bb");
  expect(evidence.candidate.drift_detected).toBe(false);
  expect(result.action_362_approval_preserved).toBe(true);
  expect(result.preview_attempt_consumed).toBe(false);
  expect(result.deployment_attempt_count).toBe(0);
});

test("materializes one exact tooling-only dependency and lock", () => {
  const manifest = JSON.parse(readFileSync(join(toolingRoot, "package.json"), "utf8"));
  expect(manifest.private).toBe(true);
  expect(manifest.dependencies).toEqual({ "netlify-cli": "26.2.0" });
  expect(sha256(join(toolingRoot, "package.json"))).toBe(evidence.tooling_definition.package_json_sha256);
  expect(sha256(join(toolingRoot, "package-lock.json")))
    .toBe(evidence.tooling_definition.package_lock_sha256);
  expect(evidence.tooling_definition.lock_resolved_hosts).toEqual(["registry.npmjs.org"]);
});

test("matches Action 375 package provenance and hashes", () => {
  expect(evidence.materialization.selected_package).toBe("netlify-cli");
  expect(evidence.materialization.selected_version).toBe("26.2.0");
  expect(evidence.materialization.resolved_integrity).toBe(evidence.action_375_artifact.registry_integrity);
  expect(evidence.materialization.installed_cli_manifest_sha256)
    .toBe(evidence.action_375_artifact.package_manifest_sha256);
  expect(evidence.materialization.cli_executable_sha256)
    .toBe(evidence.action_375_artifact.executable_sha256);
  expect(evidence.materialization.normalized_inventory_exact_match).toBe(true);
});

test("records deterministic installed dependency symlink and executable inventories", () => {
  expect(evidence.materialization.installed_dependency_count).toBe(1106);
  expect(evidence.materialization.installed_dependency_inventory_digest).toMatch(/^[a-f0-9]{64}$/);
  expect(evidence.materialization.symlink_count).toBe(64);
  expect(evidence.materialization.executable_file_count).toBe(137);
  expect(result.installed_inventories_verified).toBe(true);
});

test("disables lifecycle postinstall audit funding and package update behavior", () => {
  expect(evidence.materialization_policy.lifecycle_scripts_disabled).toBe(true);
  expect(evidence.materialization_policy.lifecycle_script_execution_count).toBe(0);
  expect(evidence.materialization_policy.postinstall_executed).toBe(false);
  expect(evidence.materialization_policy.audit_disabled).toBe(true);
  expect(evidence.materialization_policy.funding_calls_disabled).toBe(true);
  expect(result.lifecycle_and_postinstall_disabled).toBe(true);
});

test("uses disposable credential config cache and temp isolation", () => {
  expect(evidence.tooling_context.classification)
    .toBe("disposable_isolated_nonproduction_untracked_sibling");
  expect(evidence.tooling_context.application_environment_files_copied).toBe(false);
  expect(evidence.tooling_context.application_credentials_inherited).toBe(false);
  expect(evidence.isolation.real_user_home_used).toBe(false);
  expect(evidence.filesystem_and_config.global_config_write_detected).toBe(false);
  expect(evidence.filesystem_and_config.credential_file_created).toBe(false);
});

test("verifies exact version general help and deploy help offline", () => {
  expect(evidence.offline_commands.allowlist).toEqual([
    "netlify --version",
    "netlify --help",
    "netlify deploy --help",
  ]);
  expect(evidence.offline_commands.executed.every((entry: { exit_code: number }) => entry.exit_code === 0))
    .toBe(true);
  expect(evidence.offline_commands.executed[0].result)
    .toBe("netlify-cli/26.2.0 darwin-arm64 node-v26.3.1");
  expect(evidence.offline_commands.denylisted_command_executed).toBe(false);
});

test("enforces outbound denial for every offline CLI command", () => {
  expect(evidence.network_enforcement.result).toBe("outbound_access_prevented");
  expect(evidence.network_enforcement.enforced_for_every_cli_command).toBe(true);
  expect(evidence.network_enforcement.dns_control_blocked).toBe(true);
  expect(evidence.network_enforcement.direct_ip_control_blocked).toBe(true);
  expect(evidence.network_enforcement.netlify_api_access_possible_during_commands).toBe(false);
  expect(result.outbound_network_denied).toBe(true);
});

test("contains telemetry update and isolated configuration behavior", () => {
  expect(evidence.telemetry_and_update.telemetry_egress_possible).toBe(false);
  expect(evidence.telemetry_and_update.update_check_egress_possible).toBe(false);
  expect(evidence.telemetry_and_update.self_update_executed).toBe(false);
  expect(evidence.telemetry_and_update.isolated_config_keys).toEqual(["cliId", "telemetryDisabled"]);
  expect(evidence.telemetry_and_update.isolated_config_cli_id_value_recorded).toBe(false);
  expect(result.telemetry_update_and_config_contained).toBe(true);
});

test("bounds draft site JSON and production promotion semantics", () => {
  expect(evidence.command_capabilities.draft_deploy_default_confirmed).toBe(true);
  expect(evidence.command_capabilities.deploy_preview_context_option_confirmed).toBe(true);
  expect(evidence.command_capabilities.explicit_site_targeting_confirmed).toBe(true);
  expect(evidence.command_capabilities.machine_readable_json_option_confirmed).toBe(true);
  expect(evidence.command_capabilities.production_flags_present_and_denylisted)
    .toEqual(["--prod", "--prod-if-unlocked"]);
  expect(evidence.command_capabilities.anonymous_site_creation_present_and_denylisted).toBe(true);
});

test("performs no credential auth linkage API deploy or production action", () => {
  expect(result.credential_access_performed).toBe(false);
  expect(result.authentication_performed).toBe(false);
  expect(result.site_linkage_created).toBe(false);
  expect(result.netlify_authenticated_api_called).toBe(false);
  expect(result.deployment_performed).toBe(false);
  expect(result.production_blocked).toBe(true);
  expect(result.main_blocked).toBe(true);
});

test("preserves shared application package and candidate integrity", () => {
  expect(evidence.shared_worktree.materialization_or_cli_drift_detected).toBe(false);
  expect(evidence.shared_worktree.package_json_sha256_before)
    .toBe(evidence.shared_worktree.package_json_sha256_after);
  expect(evidence.shared_worktree.package_lock_sha256_before)
    .toBe(evidence.shared_worktree.package_lock_sha256_after);
  expect(result.shared_worktree_and_candidate_integrity_verified).toBe(true);
});

test("returns capable_with_conditions and keeps the next gate separate", () => {
  expect(result.verification_status).toBe("passed");
  expect(result.capability_decision).toBe("capable_with_conditions");
  expect(result.action_375_gate_healthy).toBe(true);
  expect(result.recommended_next_action)
    .toBe("separate_authentication_and_nonproduction_site_binding_readiness_gate_without_deployment");
});
