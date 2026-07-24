import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "@playwright/test";

const root = process.cwd();
const candidateRoot = "/private/tmp/ture-action-370-corrected-preview-candidate";
const documentPath = join(root,
  "docs/action-379-operator-authorized-authentication-and-exact-non-production-target-verification.md");
const evidencePath = join(root,
  "docs/action-379-operator-authorized-authentication-and-target-evidence.json");
const verifierPath = join(root,
  "scripts/action-379-operator-authorized-authentication-and-target-verification-verify.mjs");
const document = readFileSync(documentPath, "utf8");
const evidenceText = readFileSync(evidencePath, "utf8");
const evidence = JSON.parse(evidenceText);
const result = JSON.parse(execFileSync("node", [verifierPath], { cwd: root, encoding: "utf8" }));

test("documentation and evidence contracts are complete", () => {
  expect(evidence.schema_version).toBe("1.0.0");
  for (const section of [
    "## Purpose", "## Scope", "## Candidate Binding", "## CLI Binding",
    "## Action 377 Approval", "## Action 378 Blocked Result", "## Operator Authorization",
    "## Synthetic-Canary Result", "## Secret-Handling Boundary",
    "## Exact Read-Only Operation Inventory", "## Contacted Endpoint Inventory",
    "## Authentication Result", "## Account and Team Result", "## Exact-Site Result",
    "## Ownership Result", "## Domain and Branch Result", "## Preview Capability Result",
    "## Production-Risk Result", "## Target Classification", "## Credential Cleanup",
    "## Final Capability Decision", "## Next Permitted Action",
  ]) expect(document).toContain(section);
});

test("preserves exact candidate and CLI binding", () => {
  expect(result.candidate_exact_and_clean).toBe(true);
  expect(result.exact_cli_identity_preserved).toBe(true);
  expect(evidence.candidate.candidate_sha).toBe("b0bb5c4686d9cab3b682b3b06fadee4cf73cab07");
  expect(evidence.tooling.cli_version).toBe("26.2.0");
  expect(evidence.tooling.executable_sha256)
    .toBe("e39432e46703049b6769e17c0a7a8f1748c345100a1f934d8a6c7076001d426c");
});

test("preserves Action 362 and consumes no deployment attempt", () => {
  expect(result.action_362_approval_preserved).toBe(true);
  expect(result.preview_attempt_consumed).toBe(false);
  expect(result.deployment_attempt_count).toBe(0);
});

test("does not inherit or infer current operator authorization", () => {
  expect(result.operator_authorized).toBe(false);
  expect(result.credential_present).toBe(false);
  expect(result.exact_site_id_present).toBe(false);
  expect(evidence.operator_inputs.ambient_authorization_inferred).toBe(false);
  expect(evidence.operator_inputs.credential_discovery_performed).toBe(false);
  expect(evidence.operator_inputs.site_id_discovery_performed).toBe(false);
  expect(document).toContain("does not inherit authorization from that prior request");
});

test("stores no secret or token fingerprint", () => {
  expect(result.secret_value_absent).toBe(true);
  expect(result.token_fingerprint_absent).toBe(true);
  expect(evidence.authentication.credential_value_recorded).toBe(false);
  expect(evidence.authentication.credential_fingerprint_recorded).toBe(false);
  expect(evidenceText).not.toMatch(/"(token|password|cookie|authorization|authorization_header)"\s*:/i);
});

test("passes the complete synthetic canary pipeline", () => {
  expect(result.synthetic_canary_pipeline_passed).toBe(true);
  expect(evidence.synthetic_canary.result).toBe("passed");
  expect(evidence.synthetic_canary.authorization_header_rejection_passed).toBe(true);
  expect(evidence.synthetic_canary.token_pattern_rejection_passed).toBe(true);
  expect(evidence.synthetic_canary.environment_dump_rejection_passed).toBe(true);
  expect(evidence.synthetic_canary.raw_output_bypass_rejected).toBe(true);
  expect(evidence.synthetic_canary.forbidden_evidence_field_rejection_passed).toBe(true);
  expect(evidence.synthetic_canary.real_credential_loaded).toBe(false);
});

test("does not authenticate without current inputs", () => {
  expect(result.authentication_result).toBe("not_attempted_missing_current_operator_inputs");
  expect(evidence.authentication.credential_valid).toBeNull();
  expect(result.authentication_performed).toBe(false);
});

test("freezes three read-only operations but executes none", () => {
  expect(evidence.frozen_operation_inventory.map((entry: { operation: string }) => entry.operation))
    .toEqual(["getCurrentUser", "listAccountsForUser", "getSite"]);
  expect(evidence.frozen_operation_inventory.every((entry: { classification: string }) =>
    entry.classification === "official_read_only_not_executed")).toBe(true);
  expect(result.contacted_endpoint_count).toBe(0);
  expect(result.netlify_call_performed).toBe(false);
});

test("records minimal identities and ownership as unavailable", () => {
  expect(evidence.identity.authenticated_user_identity).toBeNull();
  expect(evidence.identity.account_identity).toBeNull();
  expect(evidence.identity.team_identity).toBeNull();
  expect(evidence.identity.site_identity).toBeNull();
  expect(evidence.ownership.result).toBe("not_evaluated");
  expect(evidence.identity.unrelated_accounts_or_teams_enumerated).toBe(false);
  expect(evidence.identity.unrelated_sites_retrieved).toBe(false);
});

test("does not claim production domain branch or preview evidence", () => {
  expect(evidence.site_capability.production_domain_relationship).toBe("not_evaluated");
  expect(evidence.site_capability.deploy_subdomain_relationship).toBe("not_evaluated");
  expect(evidence.site_capability.production_branch).toBeNull();
  expect(evidence.site_capability.branch_deploy_state).toBe("not_evaluated");
  expect(evidence.site_capability.deploy_preview_state).toBe("not_evaluated");
  expect(evidence.site_capability.draft_deploy_support).toBe("not_evaluated");
});

test("records static targeting support without exact target verification", () => {
  expect(evidence.site_capability.explicit_site_targeting)
    .toBe("statically_supported_not_exact_target_verified");
  expect(evidence.target.deterministic_candidate_to_target_binding).toBe(false);
});

test("keeps production alias risk unresolved and target unavailable", () => {
  expect(evidence.site_capability.production_alias_risk)
    .toBe("unresolved_without_exact_site_metadata");
  expect(evidence.target.production_risk_bounded).toBe(false);
  expect(result.target_classification).toBe("unavailable_target");
  expect(evidence.target.verified_non_production_preview).toBe(false);
});

test("creates no linkage or netlify state", () => {
  expect(result.site_linkage_created).toBe(false);
  expect(result.netlify_state_created).toBe(false);
  expect(existsSync(join(root, ".netlify"))).toBe(false);
  expect(existsSync(join(candidateRoot, ".netlify"))).toBe(false);
});

test("creates no source environment config or deployment mutation", () => {
  expect(evidence.filesystem_and_config.repository_mutation).toBe(false);
  expect(evidence.filesystem_and_config.candidate_mutation).toBe(false);
  expect(evidence.filesystem_and_config.environment_file_changed).toBe(false);
  expect(evidence.filesystem_and_config.global_config_changed).toBe(false);
  expect(evidence.filesystem_and_config.deployment_artifact_created).toBe(false);
  expect(result.repository_and_candidate_integrity_verified).toBe(true);
});

test("verifies cleanup with no credential loaded", () => {
  expect(evidence.credential_cleanup.result).toBe("not_applicable_no_credential_loaded");
  expect(evidence.credential_cleanup.credential_bearing_child_process_remaining).toBe(false);
  expect(evidence.credential_cleanup.credential_in_files).toBe(false);
  expect(evidence.credential_cleanup.credential_in_output).toBe(false);
  expect(evidence.credential_cleanup.credential_in_evidence).toBe(false);
  expect(result.credential_cleanup_verified).toBe(true);
});

test("performs no deployment and keeps production and main blocked", () => {
  expect(result.deployment_performed).toBe(false);
  expect(evidence.safety.preview_url_allocated).toBe(false);
  expect(result.production_blocked).toBe(true);
  expect(result.main_blocked).toBe(true);
});

test("returns capability_blocked with no execution approval refresh", () => {
  expect(result.verification_status).toBe("passed");
  expect(result.final_capability_decision).toBe("capability_blocked");
  expect(result.block_reason).toBe("current_operator_authorization_credential_and_exact_site_id_absent");
  expect(result.next_execution_approval_refresh).toBeNull();
  expect(result.action_378_gate_healthy).toBe(true);
});
