import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const actionPath = "docs/action-666iv-b03-remote-staging-admission.md";
const evidencePath =
  "docs/evidence/action-666iv-b03-remote-staging-admission.json";
const predecessorEvidencePath =
  "docs/evidence/action-666iu-b03-local-sandbox-v2-writer-capability-proof.json";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const planPath = "tests/e2e/action-660j-parallel-provider-free-verification.spec.ts";
const plannedApplicationTransportPath =
  "lib/server/position-version-lineage-v2-writer-private-postgresql-transport.ts";
const thisTest =
  "tests/e2e/action-666iv-b03-remote-staging-admission.spec.ts";
const predecessorEvidenceSha256 =
  "ba0e9fdcc2dedf7582e18abdb5fa47b902aac0dc8e85e49b50b1881c14a5acf4";
const evidenceSha256 =
  "af31724962e24255750568b6b90001965c8f0d2e5eefd706074c47227948c3e8";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

test("666IV retains remote B-03 staging as not admitted without contacting it", () => {
  const evidenceRaw = source(evidencePath);
  const evidence = JSON.parse(evidenceRaw);
  const predecessorEvidenceRaw = source(predecessorEvidencePath);
  const predecessorEvidence = JSON.parse(predecessorEvidenceRaw);
  const action = source(actionPath);
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(sha256(evidenceRaw)).toBe(evidenceSha256);
  expect(evidence.contract_version).toBe(
    "trade.action666iv.b03-remote-staging-admission-prerequisites-and-containment.v1",
  );
  expect(evidence.action_id).toBe("ACTION_666IV");
  expect(evidence.reviewed_revision).toEqual({
    protected_main_commit: "0b8a4aca80399612159432a77c428d3d97d586bf",
    protected_main_tree: "dcad858c1c9c5d62c45ebdfc4abf5068f822e343",
    predecessor_merged_pr_number: 286,
    predecessor_ready_full_ci_run: 33489385288,
    predecessor_ready_full_ci_conclusion: "success",
    predecessor_exact_main_ci_run: 33492189251,
    predecessor_exact_main_ci_conclusion: "success",
    predecessor_post_merge_poc_job: 99814335305,
    predecessor_post_merge_poc_status: "matched",
    predecessor_post_merge_poc_mismatches: [],
    predecessor_candidate_commit: "d89d61eb35035a370ff50a33d6fd7faafedbd735",
    predecessor_candidate_tree: "dcad858c1c9c5d62c45ebdfc4abf5068f822e343",
  });
  expect(evidence.predecessor_local_sandbox_proof).toEqual({
    evidence_path: predecessorEvidencePath,
    evidence_sha256: predecessorEvidenceSha256,
    local_ephemeral_postgresql_sandbox_only: true,
    remote_staging_targeted: false,
    production_targeted: false,
    provider_or_broker_contacted: false,
    application_runtime_bound: false,
    local_behavior_proof_completed: true,
  });
  expect(sha256(predecessorEvidenceRaw)).toBe(predecessorEvidenceSha256);
  expect(predecessorEvidence.scope).toMatchObject({
    local_ephemeral_postgresql_sandbox_only: true,
    remote_staging_targeted: false,
    production_targeted: false,
    provider_or_broker_contacted: false,
    application_runtime_bound: false,
  });
  expect(evidence.remote_staging_admission_requirements).toEqual({
    named_staging_only_principal_attested: false,
    protected_non_public_material_provenance_attested: false,
    dedicated_least_privileged_writer_identity_and_grants_attested: false,
    private_non_data_api_transport_attested: false,
    remote_rollback_and_containment_plan_attested: false,
    remote_connection_admitted: false,
    action_666iv_remote_connection_executed: false,
    remote_writer_invocation_admitted: false,
    action_666iv_remote_writer_invocation_executed: false,
  });
  expect(evidence.historical_context_boundary).toEqual({
    isolated_staging_catalog_proofs_reviewed: true,
    historical_catalog_proofs_grant_current_b03_administration_authority: false,
    historical_catalog_proofs_are_context_only: true,
  });
  expect(evidence.writer_boundary).toEqual({
    future_private_routine_signature:
      "private.write_owner_bound_recommendation_position_v2(uuid,uuid,text)",
    future_argument_order: [
      "owner_id",
      "recommendation_id",
      "canonical_command_digest",
    ],
    existing_service_role_reuse_admitted: false,
    planned_private_transport_module_present: false,
  });
  expect(evidence.authority_limits).toEqual({
    staging_authentication_admitted: false,
    protected_material_inspection_or_provisioning_admitted: false,
    remote_role_or_grant_change_admitted: false,
    remote_connection_admitted: false,
    database_query_or_mutation_admitted: false,
    migration_apply_admitted: false,
    writer_invocation_admitted: false,
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
    type: "b03_remote_staging_admission_prerequisites_and_containment",
    remote_staging_admission: "not_admitted",
    b03_disposition: "in_progress_local_proof_only",
    milestone_b_disposition: "not_complete",
    runtime_activation_authorized: false,
    next_bounded_objective:
      "separately_authorized_value_free_staging_principal_and_scope_attestation",
    reason:
      "local_behavior_proof_does_not_attest_current_remote_principal_material_provenance_least_privilege_private_transport_or_recovery_control",
  });
  expect(evidence.milestone_disposition).toEqual({
    b01: "in_progress",
    b03: "in_progress",
    b05_through_b08: "blocked_for_real_environment",
    b09_through_b12: "planned",
    notion_is_program_tracking_only: true,
  });

  expect(existsSync(resolve(root, plannedApplicationTransportPath))).toBe(false);
  expect(`${action}\n${evidenceRaw}`).toContain("not_admitted");
  expect(`${action}\n${evidenceRaw}`).toContain("Notion remains program tracking only");
  expect(`${action}\n${evidenceRaw}`).not.toMatch(
    /https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i,
  );
  expect(source(roadmapPath)).toMatch(/Action 666IV/i);
  expect(source(ledgerPath)).toMatch(/ACTION 666IV/);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
  expect(source(planPath).match(new RegExp(thisTest, "g")) ?? []).toHaveLength(1);
});
