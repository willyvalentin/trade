import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666iw-b03-staging-principal-scope-attestation-availability.md";
const evidencePath =
  "docs/evidence/action-666iw-b03-staging-principal-scope-attestation-availability.json";
const predecessorEvidencePath =
  "docs/evidence/action-666iv-b03-remote-staging-admission.json";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const planPath = "tests/e2e/action-660j-parallel-provider-free-verification.spec.ts";
const thisTest =
  "tests/e2e/action-666iw-b03-staging-principal-scope-attestation-availability.spec.ts";
const predecessorEvidenceSha256 =
  "af31724962e24255750568b6b90001965c8f0d2e5eefd706074c47227948c3e8";
const evidenceSha256 =
  "dd6421032400a13270ee1aa621c54169fb410ade6d41b151c3140b766dce5455";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

test("666IW preserves B-03 remote staging as not admitted when no attestation is supplied", () => {
  const evidenceRaw = source(evidencePath);
  const evidence = JSON.parse(evidenceRaw);
  const predecessorEvidenceRaw = source(predecessorEvidencePath);
  const predecessorEvidence = JSON.parse(predecessorEvidenceRaw);
  const action = source(actionPath);
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(sha256(evidenceRaw)).toBe(evidenceSha256);
  expect(evidence.contract_version).toBe(
    "trade.action666iw.b03-staging-principal-scope-attestation-availability.v1",
  );
  expect(evidence.action_id).toBe("ACTION_666IW");
  expect(evidence.reviewed_revision).toEqual({
    protected_main_commit: "fe28c2f112c5dcff4865f50aba3f4a58df9f02ef",
    protected_main_tree: "a4815baa842e315cd3728c7d8a2a19e151de38b6",
    predecessor_merged_pr_number: 287,
    predecessor_ready_full_ci_run: 33496782839,
    predecessor_ready_full_ci_conclusion: "success",
    predecessor_exact_main_ci_run: 33499528502,
    predecessor_exact_main_ci_conclusion: "success",
    predecessor_post_merge_poc_status: "matched",
    predecessor_post_merge_poc_mismatches: [],
  });
  expect(evidence.predecessor_remote_staging_decision).toEqual({
    evidence_path: predecessorEvidencePath,
    evidence_sha256: predecessorEvidenceSha256,
    remote_staging_admission: "not_admitted",
    required_next_bounded_objective:
      "separately_authorized_value_free_staging_principal_and_scope_attestation",
  });
  expect(sha256(predecessorEvidenceRaw)).toBe(predecessorEvidenceSha256);
  expect(predecessorEvidence.decision).toMatchObject({
    remote_staging_admission: "not_admitted",
    next_bounded_objective:
      "separately_authorized_value_free_staging_principal_and_scope_attestation",
  });
  expect(evidence.attestation_availability).toEqual({
    independent_non_secret_attestation_reference_supplied: false,
    status: "not_supplied_in_action_scope",
    scope_statement:
      "This records only unavailable-in-scope input; it does not assert external nonexistence or create a remote attestation.",
    required_field_status: {
      staging_only_principal_reference: "not_supplied_in_action_scope",
      protected_non_public_material_provenance_descriptor_reference:
        "not_supplied_in_action_scope",
      dedicated_writer_identity_and_minimum_grant_matrix_reference:
        "not_supplied_in_action_scope",
      private_non_data_api_transport_criteria_reference:
        "not_supplied_in_action_scope",
      staging_rollback_and_containment_plan_reference:
        "not_supplied_in_action_scope",
    },
    future_attestation_acceptance_requirements: [
      "independent_non_secret_immutable_reference",
      "exact_staging_scope_binding",
      "named_staging_only_principal",
      "non_secret_protected_material_provenance_descriptor",
      "dedicated_writer_identity_with_minimum_grant_matrix",
      "private_non_data_api_transport_criteria",
      "staging_rollback_and_containment_plan",
    ],
  });
  expect(evidence.historical_and_program_tracking_boundary).toEqual({
    historical_catalog_proofs_are_context_only: true,
    local_sandbox_proof_is_context_only: true,
    program_tracking_attests_remote_authority: false,
    program_tracking_is_runtime_or_deployment_authority: false,
  });
  expect(evidence.writer_boundary).toEqual({
    future_private_routine_signature:
      "private.write_owner_bound_recommendation_position_v2(uuid,uuid,text)",
    future_argument_order: [
      "owner_id",
      "recommendation_id",
      "canonical_command_digest",
    ],
    planned_private_transport_module_present: false,
  });
  expect(evidence.authority_limits).toEqual({
    staging_authentication_admitted: false,
    protected_material_inspection_or_provisioning_admitted: false,
    remote_role_or_grant_change_admitted: false,
    remote_connection_admitted: false,
    action_666iw_remote_connection_executed: false,
    database_query_or_mutation_admitted: false,
    migration_apply_admitted: false,
    writer_invocation_admitted: false,
    action_666iw_remote_writer_invocation_executed: false,
    application_transport_or_runtime_binding_admitted: false,
    route_or_ui_binding_admitted: false,
    provider_or_broker_contact_admitted: false,
    netlify_or_deployment_change_admitted: false,
    production_authority_granted: false,
    branch_protection_change_authorized: false,
    required_check_change_authorized: false,
    full_ci_deduplication_authorized: false,
  });
  expect(evidence.decision).toEqual({
    type: "b03_staging_principal_scope_attestation_availability",
    staging_principal_scope_attestation_status: "not_supplied_in_action_scope",
    remote_staging_admission: "not_admitted",
    b03_disposition: "in_progress_local_proof_only",
    milestone_b_disposition: "not_complete",
    runtime_activation_authorized: false,
    next_bounded_objective:
      "separately_authorized_independent_non_secret_staging_principal_and_scope_attestation_reference",
    reason:
      "no_independent_non_secret_attestation_reference_was_supplied_within_this_actions_static_scope",
  });
  expect(evidence.milestone_disposition).toEqual({
    b01: "in_progress",
    b03: "in_progress",
    b05_through_b08: "blocked_for_real_environment",
    b09_through_b12: "planned",
    notion_is_program_tracking_only: true,
  });

  expect(`${action}\n${evidenceRaw}`).toContain("not_supplied_in_action_scope");
  expect(`${action}\n${evidenceRaw}`).toContain("Notion is\nprogram tracking only");
  expect(`${action}\n${evidenceRaw}`).not.toMatch(
    /https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*[\"']?\S+/i,
  );
  expect(source(roadmapPath)).toMatch(/Action 666IW/i);
  expect(source(ledgerPath)).toMatch(/ACTION 666IW/);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
  expect(source(planPath).match(new RegExp(thisTest, "g")) ?? []).toHaveLength(1);
});
