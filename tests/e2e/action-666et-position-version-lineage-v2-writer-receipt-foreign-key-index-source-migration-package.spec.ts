import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666et-position-version-lineage-v2-writer-receipt-foreign-key-index-source-migration-package.md";
const evidencePath =
  "docs/evidence/action-666et-position-version-lineage-v2-writer-receipt-foreign-key-index-source-migration-package.json";
const migrationPath =
  "supabase/migrations/20260824230454_position_version_lineage_v2_writer_receipt_foreign_key_indexes.sql";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666et-position-version-lineage-v2-writer-receipt-foreign-key-index-source-migration-package.spec.ts";
const evidenceSha256 =
  "858dc10b35cea7140bff23332d576fb82c8bf720dc19a2e2ac83c6bbf43ea2ef";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function normalized(value: string) {
  return value.replaceAll("\r\n", "\n").replaceAll(/--.*$/gm, "").toLowerCase();
}

test("666ET pins the exact-green 666ES predecessor and source bytes", () => {
  const raw = source(evidencePath);
  const evidence = JSON.parse(raw);

  expect(sha256(raw)).toBe(evidenceSha256);
  expect(evidence.predecessor).toEqual({
    protected_main_commit: "e88aca4e6156d819c4e315791464489820346a49",
    exact_main_ci_run: 32785082992,
    exact_main_ci_conclusion: "success",
    action_666es_staging_catalog_proof_path:
      "docs/evidence/action-666es-position-version-lineage-v2-writer-staging-apply-catalog-proof.json",
  });
  expect(sha256(source(migrationPath))).toBe(evidence.migration.sha256);
  expect(evidence.migration).toMatchObject({
    created_with_supabase_migration_new: true,
    source_bytes_reviewed_only: true,
    database_apply_performed: false,
  });
});

test("666ET adds only the two owner-bound foreign-key index paths behind fail-closed guards", () => {
  const sql = normalized(source(migrationPath));
  const evidence = JSON.parse(source(evidencePath));

  for (const fragment of [
    "action_666et_receipt_relation_missing",
    "action_666et_recommendation_owner_foreign_key_missing",
    "action_666et_position_owner_foreign_key_missing",
    "action_666et_recommendation_owner_index_conflict",
    "action_666et_position_owner_index_conflict",
    "create index obpciv2_receipt_recommendation_owner_idx",
    "opaque_recommendation_reference",
    "create index obpciv2_receipt_position_owner_idx",
    "server_generated_position_identity",
  ]) {
    expect(sql).toContain(fragment);
  }
  expect(sql).not.toContain("create index concurrently");
  expect(sql).not.toMatch(/\b(?:insert|update|delete)\s+into\b/);
  expect(evidence.index_contract).toEqual({
    receipt_relation_required_before_index_creation: true,
    recommendation_owner_foreign_key_required: true,
    position_owner_foreign_key_required: true,
    index_name_conflicts_fail_closed: true,
    recommendation_owner_index: {
      identifier: "obpciv2_receipt_recommendation_owner_idx",
      columns: [
        "opaque_recommendation_reference",
        "authenticated_server_owner",
      ],
    },
    position_owner_index: {
      identifier: "obpciv2_receipt_position_owner_idx",
      columns: [
        "server_generated_position_identity",
        "authenticated_server_owner",
      ],
    },
  });
});

test("666ET remains source-only, secret-free, roadmap-bound and registered once", () => {
  const evidence = JSON.parse(source(evidencePath));
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(evidence.authority_limits).toEqual({
    database_connection_opened: false,
    database_ddl_or_dml_applied: false,
    staging_targeted: false,
    production_targeted: false,
    row_values_read: false,
    row_values_written: false,
    writer_invoked: false,
    generated_types_refresh: false,
    runtime_wiring: false,
    route_added: false,
    backfill: false,
    deployment: false,
    provider_or_broker_contact: false,
    v2_writer_activated: false,
  });
  expect(evidence.decision).toEqual({
    bounded_objective_closed:
      "position_version_lineage_v2_writer_receipt_foreign_key_index_source_migration_package",
    next_bounded_objective:
      "position_version_lineage_v2_writer_receipt_foreign_key_index_isolated_staging_apply_and_catalog_proof",
    isolated_staging_apply_authorized_by_this_action: false,
    production_apply_authorized_by_this_action: false,
    runtime_activation_authorized: false,
  });
  expect(documentation).toMatch(/source.*migration|migration.*source/i);
  expect(documentation).not.toMatch(
    /https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i,
  );
  expect(source(roadmapPath)).toMatch(/action 666et/i);
  expect(source(ledgerPath)).toMatch(/action 666et/i);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
