import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666ix-milestone-b-local-sandbox-acceptance-closeout.md";
const evidencePath =
  "docs/evidence/action-666ix-milestone-b-local-sandbox-acceptance-closeout.json";
const action666itEvidencePath =
  "docs/evidence/action-666it-milestone-b-reconciliation-closeout-decision.json";
const action666iuEvidencePath =
  "docs/evidence/action-666iu-b03-local-sandbox-v2-writer-capability-proof.json";
const action666ivEvidencePath =
  "docs/evidence/action-666iv-b03-remote-staging-admission.json";
const action666iwEvidencePath =
  "docs/evidence/action-666iw-b03-staging-principal-scope-attestation-availability.json";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const governancePath = "docs/roadmap-operating-governance.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const planPath = "tests/e2e/action-660j-parallel-provider-free-verification.spec.ts";
const plannedApplicationTransportPath =
  "lib/server/position-version-lineage-v2-writer-private-postgresql-transport.ts";
const thisTest =
  "tests/e2e/action-666ix-milestone-b-local-sandbox-acceptance-closeout.spec.ts";

const evidenceSha256 =
  "851b65514e3e59fe290517eb09d7793bea094116b741d3bc21e78c5af87d9aff";
const action666itEvidenceSha256 =
  "7d6a530b2f827fc4ed16733556fe255a355dc923aa115dd8a684c815e2284d66";
const action666iuEvidenceSha256 =
  "ba0e9fdcc2dedf7582e18abdb5fa47b902aac0dc8e85e49b50b1881c14a5acf4";
const action666ivEvidenceSha256 =
  "af31724962e24255750568b6b90001965c8f0d2e5eefd706074c47227948c3e8";
const action666iwEvidenceSha256 =
  "dd6421032400a13270ee1aa621c54169fb410ade6d41b151c3140b766dce5455";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

test("666IX closes only the explicit local-sandbox Milestone B acceptance profile", () => {
  const evidenceRaw = source(evidencePath);
  const evidence = JSON.parse(evidenceRaw);
  const action666itEvidenceRaw = source(action666itEvidencePath);
  const action666iuEvidenceRaw = source(action666iuEvidencePath);
  const action666ivEvidenceRaw = source(action666ivEvidencePath);
  const action666iwEvidenceRaw = source(action666iwEvidencePath);
  const action666itEvidence = JSON.parse(action666itEvidenceRaw);
  const action666iuEvidence = JSON.parse(action666iuEvidenceRaw);
  const action666ivEvidence = JSON.parse(action666ivEvidenceRaw);
  const action666iwEvidence = JSON.parse(action666iwEvidenceRaw);
  const action = source(actionPath);
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(sha256(evidenceRaw)).toBe(evidenceSha256);
  expect(evidence.contract_version).toBe(
    "trade.action666ix.milestone-b-local-sandbox-acceptance-closeout.v1",
  );
  expect(evidence.action_id).toBe("ACTION_666IX");
  expect(evidence.reviewed_revision).toEqual({
    protected_main_commit: "8decbb5fe4643cc43af480897f1aca30da13a811",
    protected_main_tree: "2fced0e297cce76e9a64ef6b89f35dcdd54f8215",
    predecessor_merged_pr_number: 288,
    predecessor_ready_full_ci_run: 33503645899,
    predecessor_ready_full_ci_conclusion: "success",
    predecessor_exact_main_ci_run: 33506572953,
    predecessor_exact_main_ci_conclusion: "success",
    predecessor_post_merge_poc_status: "matched",
    predecessor_post_merge_poc_mismatches: [],
  });
  expect(evidence.user_decision).toEqual({
    selection: "alternative_2_local_sandbox_acceptance",
    staging_cost_control_state: "intentionally_paused",
    authorization_scope: "milestone_b_acceptance_profile_rebaseline_only",
    external_runtime_or_production_authority_granted: false,
  });
  expect(evidence.predecessor_evidence).toEqual({
    action_666it: {
      evidence_path: action666itEvidencePath,
      evidence_sha256: action666itEvidenceSha256,
      historical_milestone_b_disposition: "not_complete",
    },
    action_666iu: {
      evidence_path: action666iuEvidencePath,
      evidence_sha256: action666iuEvidenceSha256,
      local_ephemeral_postgresql_sandbox_only: true,
      created_then_replayed: true,
      direct_table_access_denied: true,
      rejected_invocation_rolled_back: true,
      container_and_network_destroyed: true,
    },
    action_666iv: {
      evidence_path: action666ivEvidencePath,
      evidence_sha256: action666ivEvidenceSha256,
      remote_staging_admission: "not_admitted",
    },
    action_666iw: {
      evidence_path: action666iwEvidencePath,
      evidence_sha256: action666iwEvidenceSha256,
      staging_principal_scope_attestation_status:
        "not_supplied_in_action_scope",
    },
  });
  expect(sha256(action666itEvidenceRaw)).toBe(action666itEvidenceSha256);
  expect(sha256(action666iuEvidenceRaw)).toBe(action666iuEvidenceSha256);
  expect(sha256(action666ivEvidenceRaw)).toBe(action666ivEvidenceSha256);
  expect(sha256(action666iwEvidenceRaw)).toBe(action666iwEvidenceSha256);
  expect(action666itEvidence.decision.milestone_b_disposition).toBe(
    "not_complete",
  );
  expect(action666iuEvidence.execution_receipt).toMatchObject({
    created_then_replayed: true,
    direct_table_access_denied: true,
    rejected_invocation_rolled_back: true,
    container_and_network_destroyed: true,
  });
  expect(action666ivEvidence.decision.remote_staging_admission).toBe(
    "not_admitted",
  );
  expect(
    action666iwEvidence.decision.staging_principal_scope_attestation_status,
  ).toBe("not_supplied_in_action_scope");
  expect(evidence.acceptance_profile).toEqual({
    id: "milestone_b_local_sandbox_acceptance_v1",
    criterion: "one_verified_ephemeral_local_b03_v2_writer_behavior_proof",
    criterion_satisfied: true,
    does_not_rewrite_historical_capability_facts: true,
    does_not_grant_runtime_or_remote_authority: true,
    no_staging_activation_required_while_paused: true,
  });
  expect(evidence.capability_gate_dispositions).toEqual({
    b01: "deferred_not_verified_follow_on_runtime_milestone",
    b02: "complete_foundation_retained",
    b03: "accepted_local_sandbox_behavior_proof_only",
    b04: "complete_foundation_retained",
    b05_through_b08: "deferred_not_verified_follow_on_runtime_milestone",
    b09_through_b12: "deferred_not_verified_follow_on_runtime_milestone",
  });
  expect(evidence.authority_limits).toEqual({
    staging_project_reactivation_authorized: false,
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
    type: "milestone_b_local_sandbox_acceptance_closeout",
    milestone_b_disposition:
      "complete_under_local_sandbox_acceptance_profile_v1",
    live_server_owned_trade_management_capability: "deferred_not_verified",
    runtime_disposition: "closed",
    remote_staging_admission: "not_admitted",
    production_disposition: "closed",
    broker_disposition: "closed",
    deployment_disposition: "closed",
    automatic_staging_restore_or_activation: false,
    follow_on_runtime_work_requires_new_explicit_authorization: true,
    notion_is_program_tracking_only: true,
  });

  expect(existsSync(resolve(root, plannedApplicationTransportPath))).toBe(false);
  expect(action).toContain(
    "complete_under_local_sandbox_acceptance_profile_v1",
  );
  expect(action).toContain("former live server-owned trade-management capability");
  expect(action).toContain("It does **not** claim that the");
  expect(`${action}\n${evidenceRaw}`).not.toMatch(
    /https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i,
  );
  expect(source(roadmapPath)).toContain(
    "Milestone B is `complete_under_local_sandbox_acceptance_profile_v1`",
  );
  const ledger = source(ledgerPath);
  expect(ledger).toContain("ACTION 666IX");
  expect(ledger).toContain(
    "Milestone B is `complete_under_local_sandbox_acceptance_profile_v1`",
  );
  expect(ledger).not.toContain(
    "Milestone B planning is active while runtime remains closed.",
  );
  expect(source(governancePath)).toContain(
    "Local-sandbox milestone acceptance closeout",
  );
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
  expect(source(planPath).match(new RegExp(thisTest, "g")) ?? []).toHaveLength(1);
});
