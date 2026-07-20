import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "@playwright/test";

const root = process.cwd();
const candidateRoot = "/private/tmp/ture-action-370-corrected-preview-candidate";
const documentPath = join(root,
  "docs/action-378-authentication-and-non-production-target-verification.md");
const evidencePath = join(root,
  "docs/action-378-authentication-and-non-production-target-verification-evidence.json");
const verifierPath = join(root,
  "scripts/action-378-authentication-and-non-production-target-verification-verify.mjs");
const document = readFileSync(documentPath, "utf8");
const evidenceText = readFileSync(evidencePath, "utf8");
const evidence = JSON.parse(evidenceText);
const result = JSON.parse(execFileSync("node", [verifierPath], { cwd: root, encoding: "utf8" }));

test("documentation and evidence schema are complete", () => {
  expect(evidence.schema_version).toBe("1.0.0");
  for (const section of [
    "## Purpose", "## Scope", "## Candidate Binding", "## Action 377 Gate",
    "## Operator Authorization", "## Exact Frozen Network Boundary", "## Synthetic Canary Test",
    "## Authentication Result", "## Account and Team Result", "## Exact-Site Result",
    "## Production-Risk Assessment", "## Target Classification",
    "## Filesystem and Configuration Result", "## Credential Cleanup",
    "## Stop Conditions Encountered", "## Final Capability Decision", "## Next Permitted Action",
  ]) expect(document).toContain(section);
});

test("preserves exact candidate and CLI bindings", () => {
  expect(result.candidate_exact_and_clean).toBe(true);
  expect(result.exact_cli_identity_preserved).toBe(true);
  expect(evidence.candidate.candidate_sha).toBe("b0bb5c4686d9cab3b682b3b06fadee4cf73cab07");
  expect(evidence.tooling.cli_version).toBe("26.2.0");
  expect(evidence.tooling.cli_executable_sha256)
    .toBe("e39432e46703049b6769e17c0a7a8f1748c345100a1f934d8a6c7076001d426c");
});

test("preserves Action 362 and consumes no attempt", () => {
  expect(result.action_362_approval_preserved).toBe(true);
  expect(result.preview_attempt_consumed).toBe(false);
  expect(result.deployment_attempt_count).toBe(0);
});

test("records missing operator authorization credential and exact site ID", () => {
  expect(result.operator_authorization_recorded).toBe(false);
  expect(result.credential_present).toBe(false);
  expect(result.exact_site_id_present).toBe(false);
  expect(evidence.operator_inputs.credential_source_searched).toBe(false);
  expect(evidence.operator_inputs.site_id_inferred_or_searched).toBe(false);
});

test("contains no token password cookie or authorization value", () => {
  expect(result.credential_value_absent_from_evidence).toBe(true);
  expect(evidence.authentication.credential_value_recorded).toBe(false);
  expect(evidence.authentication.credential_fingerprint_recorded).toBe(false);
  expect(evidence.authentication.authorization_header_created).toBe(false);
  expect(evidenceText).not.toMatch(/"(token|password|cookie|authorization|authorization_header)"\s*:/i);
});

test("passes the local synthetic canary and rejection pipeline", () => {
  expect(result.synthetic_canary_pipeline_passed).toBe(true);
  expect(evidence.synthetic_canary.result).toBe("passed");
  expect(evidence.synthetic_canary.real_credential_used).toBe(false);
  expect(evidence.synthetic_canary.canary_value_recorded).toBe(false);
  expect(evidence.synthetic_canary.token_like_pattern_rejected).toBe(true);
});

test("does not authenticate without required inputs", () => {
  expect(result.authentication_result).toBe("not_attempted_missing_required_inputs");
  expect(evidence.authentication.credential_valid).toBeNull();
  expect(result.credential_access_performed).toBe(false);
  expect(result.authentication_performed).toBe(false);
});

test("contacts no Netlify or application endpoint", () => {
  expect(result.contacted_endpoint_count).toBe(0);
  expect(evidence.frozen_read_only_boundary.netlify_network_window_opened).toBe(false);
  expect(result.netlify_call_performed).toBe(false);
  expect(evidence.frozen_read_only_boundary.application_endpoint_contacted).toBe(false);
  expect(evidence.frozen_read_only_boundary.unapproved_endpoint_contacted).toBe(false);
});

test("records account team site and ownership as not evaluated", () => {
  expect(evidence.identity.current_user_identity).toBeNull();
  expect(evidence.identity.account_identity).toBeNull();
  expect(evidence.identity.team_identity).toBeNull();
  expect(evidence.site.site_identity).toBeNull();
  expect(evidence.site.ownership_result).toBe("not_evaluated");
  expect(evidence.identity.unrelated_identity_enumerated).toBe(false);
});

test("does not claim production domain branch or preview evidence", () => {
  expect(evidence.site.production_domain_relationship).toBe("not_evaluated");
  expect(evidence.site.production_branch).toBeNull();
  expect(evidence.site.branch_deploy_state).toBe("not_evaluated");
  expect(evidence.site.deploy_preview_state).toBe("not_evaluated");
  expect(evidence.site.draft_deploy_support).toBe("not_evaluated");
});

test("keeps production risk unresolved and target unavailable", () => {
  expect(evidence.production_risk.production_alias_risk)
    .toBe("unresolved_without_exact_site_metadata");
  expect(evidence.production_risk.risk_bounded).toBe(false);
  expect(result.target_classification).toBe("unavailable_target");
  expect(evidence.target.verified_non_production_preview_requirements_met).toBe(false);
});

test("records static explicit-site support without claiming target verification", () => {
  expect(evidence.site.explicit_site_targeting).toBe("statically_supported_not_target_verified");
  expect(evidence.target.deterministic_future_target_binding_established).toBe(false);
});

test("creates no linkage or netlify state", () => {
  expect(result.site_linkage_created).toBe(false);
  expect(result.netlify_state_created).toBe(false);
  expect(existsSync(join(root, ".netlify"))).toBe(false);
  expect(existsSync(join(candidateRoot, ".netlify"))).toBe(false);
});

test("creates no repository candidate environment or global mutation", () => {
  expect(evidence.filesystem_and_config.repository_drift_detected).toBe(false);
  expect(evidence.filesystem_and_config.candidate_drift_detected).toBe(false);
  expect(evidence.filesystem_and_config.environment_file_changed).toBe(false);
  expect(evidence.filesystem_and_config.global_config_written).toBe(false);
  expect(evidence.mutation_and_deployment.mutation_performed).toBe(false);
  expect(result.repository_and_candidate_integrity_verified).toBe(true);
});

test("verifies credential cleanup without loading a credential", () => {
  expect(evidence.credential_cleanup.result).toBe("not_applicable_no_credential_loaded");
  expect(evidence.credential_cleanup.credential_persisted).toBe(false);
  expect(evidence.credential_cleanup.secret_bearing_output_persisted).toBe(false);
  expect(result.credential_cleanup_verified).toBe(true);
});

test("performs no deployment and keeps production and main blocked", () => {
  expect(result.deployment_performed).toBe(false);
  expect(evidence.mutation_and_deployment.preview_url_allocated).toBe(false);
  expect(result.production_blocked).toBe(true);
  expect(result.main_blocked).toBe(true);
});

test("returns capability_blocked with no preview execution action", () => {
  expect(result.verification_status).toBe("passed");
  expect(result.final_capability_decision).toBe("capability_blocked");
  expect(result.block_reason).toBe("required_operator_authorized_credential_and_exact_site_id_absent");
  expect(result.next_preview_execution_action).toBeNull();
  expect(result.action_377_gate_healthy).toBe(true);
});
