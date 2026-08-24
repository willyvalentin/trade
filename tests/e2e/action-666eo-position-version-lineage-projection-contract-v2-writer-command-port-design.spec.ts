import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666eo-position-version-lineage-projection-contract-v2-writer-command-port-design.md";
const evidencePath =
  "docs/evidence/action-666eo-position-version-lineage-projection-contract-v2-writer-command-port-design.json";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666eo-position-version-lineage-projection-contract-v2-writer-command-port-design.spec.ts";
const evidenceSha256 =
  "e308d3a51905fcba65c00450696364bcec1049a933b5ccb2fb72c0cb9087dcd2";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

test("666EO pins the exact green 666EN predecessor", () => {
  const raw = source(evidencePath);
  expect(sha256(raw)).toBe(evidenceSha256);
  const evidence = JSON.parse(raw);

  expect(evidence.predecessor).toEqual({
    protected_main_commit: "99b945a2db28dbcee4e92ddc5d43f260af8a13ba",
    exact_main_ci_run: 32744898801,
    exact_main_ci_conclusion: "success",
    action_666en_catalog_proof_path:
      "docs/evidence/action-666en-position-version-lineage-projection-contract-isolated-staging-apply-catalog-proof.json",
  });
});

test("666EO freezes the non-forgeable locked-source v2 writer design", () => {
  const evidence = JSON.parse(source(evidencePath));

  expect(evidence.design.private_boundary).toEqual({
    authenticated_server_owner_context_required: true,
    client_owner_or_lineage_authoritative: false,
    security_definer_routine_required: true,
    fixed_search_path_required: true,
    service_role_only_execution_required: true,
  });
  expect(evidence.design.locked_source).toEqual({
    owner_scoped_recommendation_for_update_required: true,
    complete_v2_tuple_required_before_write: true,
    required_fields: [
      "recommendation_version",
      "recommendation_identity",
      "recommendation_normative_digest",
      "recommendation_projection_contract",
    ],
    marker_must_equal_v2: true,
    all_null_legacy_tuple_outcome: "refused_without_inference_or_backfill",
    partial_tuple_outcome: "refused",
    owner_mismatch_outcome: "refused",
  });
  expect(evidence.design.atomic_effect).toEqual({
    one_private_transaction_required: true,
    lineage_is_derived_from_locked_source: true,
    position_v2_tuple_complete: true,
    initial_position_version: 1,
    initial_owner_scoped_history_row_required: true,
    result_visible_only_after_commit: true,
    exception_outcome: "rolled_back_without_partial_position_or_history",
  });
});

test("666EO rejects duplicate effects and keeps current v1 authority closed", () => {
  const evidence = JSON.parse(source(evidencePath));

  expect(evidence.design.idempotency).toEqual({
    binding_fields: [
      "authenticated_server_owner",
      "recommendation_id",
      "recommendation_version",
      "recommendation_identity",
      "recommendation_normative_digest",
      "recommendation_projection_contract",
      "position_identity",
      "canonical_command_digest",
    ],
    exact_retry_outcome: "replayed_original_committed_result",
    missing_partial_or_different_binding_outcome: "conflict_or_refused",
  });
  expect(evidence.design.existing_v1_adapter).toEqual({
    remains_non_v2_and_injected: true,
    route_or_runtime_binding_changed: false,
  });
  expect(evidence.authority_limits).toEqual({
    source_only: true,
    database_queried: false,
    database_ddl_or_dml: false,
    routine_or_rpc_created: false,
    grant_or_rls_change: false,
    backfill: false,
    generated_types_refresh: false,
    runtime_wiring: false,
    route_added: false,
    deployment: false,
    provider_or_broker_contact: false,
    production_targeted: false,
    v2_writer_activated: false,
  });
  expect(evidence.decision).toEqual({
    bounded_objective_closed:
      "position_version_lineage_projection_contract_v2_writer_command_port_design",
    next_bounded_objective:
      "position_version_lineage_projection_contract_v2_writer_command_port_admission_preflight",
    concrete_port_admitted: false,
    production_change_authorized: false,
    backfill_authorized: false,
    runtime_activation_authorized: false,
  });
});

test("666EO is secret-free, roadmap-bound and registered exactly once", () => {
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  expect(documentation).toMatch(/source-only/i);
  expect(documentation).not.toMatch(
    /https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i,
  );
  expect(source(roadmapPath)).toMatch(/action 666eo/i);
  expect(source(ledgerPath)).toMatch(/action 666eo/i);

  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
