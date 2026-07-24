import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "@playwright/test";

const root = process.cwd();
const reportPath = join(root,
  "docs/action-375-netlify-cli-version-package-provenance-and-integrity-resolution.md");
const evidencePath = join(root,
  "docs/action-375-netlify-cli-version-package-provenance-and-integrity-evidence.json");
const verifierPath = join(root,
  "scripts/action-375-netlify-cli-version-package-provenance-and-integrity-resolution-verify.mjs");
const report = readFileSync(reportPath, "utf8");
const evidence = JSON.parse(readFileSync(evidencePath, "utf8"));

function verify() {
  return JSON.parse(execFileSync("node", [verifierPath], { cwd: root, encoding: "utf8" }));
}

test("resolves the exact official package and stable version", () => {
  expect(evidence.schema_version).toBe("1.0.0");
  expect(evidence.package_identity.name).toBe("netlify-cli");
  expect(evidence.package_identity.official_registry).toBe("https://registry.npmjs.org");
  expect(evidence.package_identity.repository).toBe("https://github.com/netlify/cli");
  expect(evidence.selected_package.version).toBe("26.2.0");
  expect(evidence.evaluated_versions.map((item: { version: string }) => item.version))
    .toEqual(["26.2.0", "26.1.0"]);
  expect(evidence.release_channels.floating_version_rejected).toBe(true);
  expect(report).toContain("## Version-Selection Policy");
});

test("records exact registry and computed integrity evidence", () => {
  expect(evidence.selected_package.computed_tarball_sha512_integrity)
    .toBe(evidence.selected_package.registry_integrity);
  expect(evidence.selected_package.computed_tarball_sha1)
    .toBe(evidence.selected_package.registry_shasum_sha1);
  expect(evidence.selected_package.computed_tarball_sha256)
    .toBe("741d46f0f18df96a8d3ee27614f51bfa529d2f9937a1122976358e54e40f6747");
  expect(evidence.archive_inspection.path_safety).toBe("passed");
  expect(evidence.archive_inspection.unexpected_executable_count).toBe(0);
});

test("classifies Node macOS and arm64 compatibility conservatively", () => {
  expect(evidence.compatibility.required_node).toBe(">=20.12.2");
  expect(evidence.compatibility.node_compatible).toBe(true);
  expect(evidence.compatibility.platform).toBe("darwin");
  expect(evidence.compatibility.architecture).toBe("arm64");
  expect(evidence.compatibility.transitive_native_compatibility)
    .toBe("conditional_pending_exact_lock_materialization");
});

test("keeps package lifecycle hooks disabled", () => {
  expect(evidence.lifecycle_scripts.postinstall).toBe("node ./scripts/postinstall.js");
  expect(evidence.lifecycle_scripts.postinstall_classification)
    .toBe("requires_separate_approval_and_must_remain_disabled");
  expect(evidence.lifecycle_scripts.lifecycle_scripts_executed).toBe(false);
  expect(report).toContain("No lifecycle script was run");
  expect(evidence.lifecycle_classifications).toEqual({
    preinstall: "absent",
    install: "absent",
    postinstall: "requires_separate_approval",
    prepare: "absent",
    prepublish: "absent",
  });
});

test("documents update telemetry and configuration write risks", () => {
  expect(evidence.runtime_behavior.update_check_present).toBe(true);
  expect(evidence.runtime_behavior.telemetry_present).toBe(true);
  expect(evidence.runtime_behavior.global_config_write_risk).toBe(true);
  expect(evidence.runtime_behavior.offline_version_help_containment_verified).toBe(false);
  expect(report).toContain("disposable `HOME` and `XDG_CONFIG_HOME`");
});

test("confirms draft deploy capability while denying production options", () => {
  expect(evidence.command_semantics.draft_deploy_is_default).toBe(true);
  expect(evidence.command_semantics.production_requires_explicit_prod_option).toBe(true);
  expect(evidence.command_semantics.deploy_preview_context_supported).toBe(true);
  expect(evidence.command_semantics.production_options_denylisted)
    .toEqual(["--prod", "--prod-if-unlocked"]);
  expect(evidence.command_semantics.deploy_command_executed).toBe(false);
  expect(evidence.credential_and_configuration_behavior
    .explicit_site_id_can_avoid_persistent_linkage_in_principle).toBe(true);
  expect(evidence.production_risk.production_blocked).toBe(true);
  expect(evidence.production_risk.main_blocked).toBe(true);
});

test("contacted only the bounded read-only official evidence hosts", () => {
  expect(evidence.contacted_hosts.map((entry: { host: string }) => entry.host).sort()).toEqual([
    "docs.netlify.com",
    "github.com",
    "registry.npmjs.org",
    "www.npmjs.com",
  ]);
  expect(evidence.contacted_hosts.every((entry: { read_only: boolean }) => entry.read_only))
    .toBe(true);
});

test("returns resolved_with_conditions with an exact next boundary", () => {
  const result = verify();
  expect(result.verification_status).toBe("passed");
  expect(result.resolution_status).toBe("resolved_with_conditions");
  expect(result.provenance_resolved).toBe(true);
  expect(result.artifact_integrity_verified).toBe(true);
  expect(result.runtime_containment_pending).toBe(true);
  expect(result.exact_transitive_lock_created).toBe(false);
  expect(result.transitive_lock_strategy_defined).toBe(true);
});

test("preserves candidate approval and preview-attempt state", () => {
  const result = verify();
  expect(result.candidate_exact_and_clean).toBe(true);
  expect(result.candidate_hashes_exact).toBe(true);
  expect(result.action_374_preserved).toBe(true);
  expect(result.preview_attempt_consumed).toBe(false);
  expect(result.deployment_attempt_count).toBe(0);
});

test("performs no install execution auth linkage deploy or production change", () => {
  const result = verify();
  expect(result.package_installed).toBe(false);
  expect(result.cli_executed).toBe(false);
  expect(result.lifecycle_scripts_executed).toBe(false);
  expect(result.authentication_performed).toBe(false);
  expect(result.site_linkage_created).toBe(false);
  expect(result.netlify_deploy_api_called).toBe(false);
  expect(result.deployment_performed).toBe(false);
  expect(result.production_changed).toBe(false);
  expect(result.production_blocked).toBe(true);
  expect(result.main_blocked).toBe(true);
});

test("documents the complete report contract", () => {
  for (const section of [
    "## Purpose", "## Scope", "## Recovery Context", "## Upstream Dependencies",
    "## Action 362 Approval Status", "## Explicit Non-Goals", "## Evaluated Versions",
    "## Package Contents Inventory", "## Production-Promotion Risk",
    "## Resolution Vocabulary", "## Deterministic Resolution Conditions",
    "## Final Resolution Decision", "## Next Permitted Action",
  ]) expect(report).toContain(section);
});
