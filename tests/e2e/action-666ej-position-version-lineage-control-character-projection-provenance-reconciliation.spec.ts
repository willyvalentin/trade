import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666ej-position-version-lineage-control-character-projection-provenance-reconciliation.md";
const evidencePath =
  "docs/evidence/action-666ej-position-version-lineage-control-character-projection-provenance-reconciliation.json";
const queryPath =
  "scripts/action-666ej-position-version-lineage-control-character-projection-provenance-reconciliation.sql";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666ej-position-version-lineage-control-character-projection-provenance-reconciliation.spec.ts";
const evidenceSha256 =
  "36e5e0bcc11442f10fa21893e5b120e372c5fbd3deff6200b1d693be72a3738e";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

test("666EJ binds the exact green predecessor and boolean-only read-only query", () => {
  const raw = source(evidencePath);
  expect(sha256(raw)).toBe(evidenceSha256);
  const evidence = JSON.parse(raw);

  expect(evidence.predecessor).toEqual({
    protected_main_commit: "a0b5bf64e8e3da005ee2f433341b1b60c9b5e02f",
    exact_main_ci_run: 32710226247,
    exact_main_ci_conclusion: "success",
    action_666ei_evidence_path:
      "docs/evidence/action-666ei-position-version-lineage-owner-bound-backfill-admission-preflight.json",
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

test("666EJ chooses a versioned successor route without relaxing v1", () => {
  const evidence = JSON.parse(source(evidencePath));
  expect(evidence.reconciliation).toEqual({
    categorical_control_character_present: false,
    narrative_control_character_present: true,
    narrative_non_whitespace_control_character_present: false,
    legacy_narrative_preservation_candidate: true,
    explicit_data_quality_remediation_required: false,
    backfill_admitted: false,
    backfill_performed: false,
  });
  expect(evidence.decision).toEqual({
    bounded_objective_closed:
      "position_version_lineage_control_character_projection_provenance_reconciliation",
    classification: "legacy_narrative_preservation_candidate",
    action_666de_v1_contract_relaxed: false,
    next_bounded_objective:
      "position_version_lineage_versioned_projection_successor_contract",
    backfill_authorized: false,
    constraint_validation_authorized: false,
    v2_writer_activation_authorized: false,
  });
});

test("666EJ preserves privacy, no-write authority, and CI registration", () => {
  const evidence = JSON.parse(source(evidencePath));
  expect(evidence.privacy).toEqual({
    boolean_classification_only: true,
    aggregate_counts_returned: false,
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
  expect(documentation).toMatch(/versioned.*successor|successor.*versioned/i);
  expect(documentation).not.toMatch(
    /https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i,
  );
  expect(source(roadmapPath)).toMatch(/action 666ej/i);
  expect(source(ledgerPath)).toMatch(/action 666ej/i);

  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
