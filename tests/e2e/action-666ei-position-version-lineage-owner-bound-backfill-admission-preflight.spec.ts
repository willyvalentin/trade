import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666ei-position-version-lineage-owner-bound-backfill-admission-preflight.md";
const evidencePath =
  "docs/evidence/action-666ei-position-version-lineage-owner-bound-backfill-admission-preflight.json";
const queryPath =
  "scripts/action-666ei-position-version-lineage-owner-bound-backfill-admission-preflight.sql";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666ei-position-version-lineage-owner-bound-backfill-admission-preflight.spec.ts";
const evidenceSha256 = "e99d7a9e7fe5337a3c5223b72269649641a0d7bf45c02e40d4771847fd5e1ad6";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

test("666EI binds the exact green predecessor and aggregate-only read-only query", () => {
  const raw = source(evidencePath);
  expect(sha256(raw)).toBe(evidenceSha256);
  const evidence = JSON.parse(raw);

  expect(evidence.predecessor).toEqual({
    protected_main_commit: "da17511a9e07563c41fc6d519d607ff06c40dd43",
    exact_main_ci_run: 32691349831,
    exact_main_ci_conclusion: "success",
    action_666de_contract_path:
      "docs/evidence/action-666de-deterministic-recommendation-lineage-backfill-contract.json",
    action_666eh_catalog_proof_path:
      "docs/evidence/action-666eh-position-version-lineage-authorized-production-apply-and-catalog-proof.json",
  });
  expect(sha256(source(queryPath))).toBe(evidence.execution.query_sha256);
  expect(evidence.execution).toMatchObject({
    execution_channel: "supabase_mcp_execute_sql",
    query_result_rows: 1,
    transaction_read_only: true,
    transaction_isolation: "repeatable read",
    row_security_fail_closed: true,
    rollback_statement_bound_in_source: true,
  });
});

test("666EI records only the privacy-preserving failed admission outcome", () => {
  const evidence = JSON.parse(source(evidencePath));
  expect(evidence.reconciliation).toEqual({
    control_character_projection_blocker_present: true,
    backfill_admitted: false,
    backfill_performed: false,
  });
  expect(evidence.decision).toEqual({
    bounded_objective_closed:
      "position_version_lineage_owner_bound_backfill_admission_preflight",
    admission_result: "blocked_control_character_projection",
    next_bounded_objective:
      "position_version_lineage_control_character_projection_provenance_reconciliation",
    backfill_authorized: false,
    constraint_validation_authorized: false,
    v2_writer_activation_authorized: false,
  });
});

test("666EI preserves privacy and no-write authority while it is registered once in CI", () => {
  const evidence = JSON.parse(source(evidencePath));
  expect(evidence.privacy).toEqual({
    aggregate_counts_and_booleans_only: true,
    row_contents_returned: false,
    row_identifiers_returned: false,
    owner_identifiers_returned: false,
    connection_identifier_returned: false,
    credential_returned: false,
  });
  expect(evidence.authority_limits).toEqual({
    database_mutation_performed: false,
    schema_mutation_performed: false,
    durable_backfill_performed: false,
    constraint_validation_performed: false,
    physical_not_null_activation_performed: false,
    generated_types_refresh_performed: false,
    runtime_wiring_performed: false,
    grant_or_policy_change_performed: false,
    production_deployment_performed: false,
    provider_or_broker_contact_performed: false,
  });

  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  expect(documentation).toMatch(/not admitted|not_admitted|blocked/i);
  expect(documentation).not.toMatch(
    /https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i,
  );
  expect(source(roadmapPath)).toMatch(/action 666ei/i);
  expect(source(ledgerPath)).toMatch(/action 666ei/i);

  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
