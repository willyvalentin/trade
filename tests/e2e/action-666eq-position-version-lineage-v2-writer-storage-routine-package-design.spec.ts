import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666eq-position-version-lineage-projection-contract-v2-writer-storage-routine-package-design.md";
const evidencePath =
  "docs/evidence/action-666eq-position-version-lineage-projection-contract-v2-writer-storage-routine-package-design.json";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666eq-position-version-lineage-v2-writer-storage-routine-package-design.spec.ts";
const evidenceSha256 = "83ce3ad83f1a44ae4e5b33ba16515dbf6352903fc816e7d2d4d6c510e7e5b999";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

test("666EQ pins the exact green 666EP delivery", () => {
  const raw = source(evidencePath);
  expect(sha256(raw)).toBe(evidenceSha256);

  const evidence = JSON.parse(raw);
  expect(evidence.predecessor).toEqual({
    protected_main_commit: "e8fad011c442af64cdc23cc6d3ba4a6c7cd3486b",
    exact_main_ci_run: 32760333735,
    exact_main_ci_conclusion: "success",
    action_666ep_admission_preflight_path:
      "docs/evidence/action-666ep-position-version-lineage-projection-contract-v2-writer-command-port-admission-preflight.json",
  });
});

test("666EQ freezes the private v2 routine and immutable receipt package", () => {
  const evidence = JSON.parse(source(evidencePath));

  expect(evidence.design.reserved_database_objects).toEqual({
    routine_identifier: "write_owner_bound_recommendation_position_v2",
    idempotency_relation_identifier: "owner_bound_position_command_idempotency_v2",
    database_objects_created: false,
  });
  expect(evidence.design.routine_boundary).toEqual({
    operational_inputs: [
      "authenticated_server_owner",
      "opaque_recommendation_reference",
      "canonical_command_digest",
    ],
    caller_cannot_supply_authoritative_fields: [
      "recommendation_version",
      "recommendation_identity",
      "recommendation_normative_digest",
      "recommendation_projection_contract",
      "position_identity",
    ],
    security_definer_required: true,
    empty_fixed_search_path_and_explicit_relation_qualification_required: true,
    service_role_only_execution_required: true,
    ordinary_client_and_public_execution_denied: true,
    existing_v1_adapter_remains_non_v2: true,
  });
  expect(evidence.design.durable_receipt).toEqual({
    address_key: ["authenticated_server_owner", "canonical_command_digest"],
    address_key_unique_required: true,
    immutable_after_commit_required: true,
    complete_binding_fields: [
      "authenticated_server_owner",
      "opaque_recommendation_reference",
      "recommendation_version",
      "recommendation_identity",
      "recommendation_normative_digest",
      "recommendation_projection_contract",
      "server_generated_position_identity",
      "initial_position_version",
      "canonical_command_digest",
      "committed_outcome",
      "initial_history_identity",
    ],
    exact_committed_retry_outcome: "replay_original_committed_result_only",
    missing_partial_different_or_collision_outcome:
      "conflict_or_refused_without_second_effect",
    direct_client_read_or_write_admitted: false,
  });
});

test("666EQ requires an all-or-nothing effect and preserves the closed authority", () => {
  const evidence = JSON.parse(source(evidencePath));

  expect(evidence.design.atomic_sequence).toEqual({
    one_database_invocation_and_transaction_required: true,
    owner_scoped_recommendation_lock_before_receipt_reservation_required: true,
    complete_exact_v2_tuple_required_before_effect: true,
    receipt_reservation_and_effect_are_atomic: true,
    initial_position_version: 1,
    initial_owner_scoped_history_row_required: true,
    result_visible_only_after_commit: true,
    exception_outcome: "rollback_reservation_position_and_history_together",
    durable_pending_success_admitted: false,
  });
  expect(evidence.authority_limits).toEqual({
    source_only: true,
    database_queried: false,
    database_ddl_or_dml: false,
    migration_file_added: false,
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
      "position_version_lineage_projection_contract_v2_writer_command_port_storage_and_routine_package_design",
    next_bounded_objective:
      "position_version_lineage_projection_contract_v2_writer_command_port_storage_and_routine_source_migration_package",
    database_package_admitted: false,
    production_change_authorized: false,
    backfill_authorized: false,
    runtime_activation_authorized: false,
  });
});

test("666EQ is secret-free, source-only, roadmap-bound, and registered exactly once", () => {
  const documentation = [source(actionPath), source(evidencePath)].join("\n");

  expect(documentation).toMatch(/source-only/i);
  expect(documentation).toMatch(/creates no database\s+bytes/i);
  expect(documentation).not.toMatch(
    /https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i,
  );
  expect(source(roadmapPath)).toMatch(/action 666eq/i);
  expect(source(ledgerPath)).toMatch(/action 666eq/i);

  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
