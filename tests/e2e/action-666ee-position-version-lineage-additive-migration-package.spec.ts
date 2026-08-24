import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const actionPath = "docs/action-666ee-position-version-lineage-additive-migration-package.md";
const evidencePath = "docs/evidence/action-666ee-position-version-lineage-additive-migration-package.json";
const migrationPath = "supabase/migrations/20260824000000_add_position_version_lineage_columns.sql";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest = "tests/e2e/action-666ee-position-version-lineage-additive-migration-package.spec.ts";
const evidenceSha256 = "2f970e795f9acb61c35e04f63944fe156f55bdfb01bbce0515cd23bf4359de76";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function normalized(value: string) {
  return value.replaceAll("\r\n", "\n").toLowerCase();
}

test("666EE pins the verified 666ED predecessor and exact additive migration bytes", () => {
  const raw = source(evidencePath);
  expect(sha256(raw)).toBe(evidenceSha256);
  const evidence = JSON.parse(raw);

  expect(evidence.predecessor).toEqual({
    protected_main_commit: "cfb8fd503577cbe9aa5834f75b901a03ba5510e8",
    exact_main_ci_run: 32674389880,
    exact_main_ci_conclusion: "success",
    action_666ed_path:
      "docs/action-666ed-transactional-recommendation-position-writer-owner-bound-command-port-preflight.md",
    action_666ed_sha256:
      "3cd0d0f4b419828548622f63efbf0a02625636f4dbca76418db57821ec4ce6d2",
  });
  expect(sha256(source(evidence.predecessor.action_666ed_path))).toBe(
    evidence.predecessor.action_666ed_sha256,
  );
  expect(sha256(source(migrationPath))).toBe(evidence.migration.sha256);
});

test("666EE admits only nullable complete durable-lineage tuples", () => {
  const evidence = JSON.parse(source(evidencePath));
  expect(evidence.migration).toMatchObject({
    path: migrationPath,
    kind: "nullable_additive_lineage_schema",
    recommendation_columns: [
      "recommendation_version",
      "recommendation_identity",
      "recommendation_normative_digest",
    ],
    position_columns: [
      "position_version",
      "durable_recommendation_version",
      "recommendation_identity",
      "recommendation_normative_digest",
    ],
    named_not_valid_constraints: 9,
    dml_statements: false,
    runtime_function_added: false,
    grant_or_policy_change: false,
    physical_not_null_activation: false,
    recommendation_id_not_null_activation: false,
  });

  const sql = normalized(source(migrationPath));
  for (const fragment of [
    "alter table public.recommendations",
    "add column if not exists recommendation_version bigint null",
    "add column if not exists recommendation_identity text null",
    "add column if not exists recommendation_normative_digest text null",
    "alter table public.positions",
    "add column if not exists position_version bigint null",
    "add column if not exists durable_recommendation_version bigint null",
    "recommendations_lineage_tuple_complete_check",
    "positions_lineage_tuple_complete_check",
    "between 1 and 9007199254740991",
    "recommendation_normative_digest ~ '^[0-9a-f]{64}$'",
    "from pg_catalog.pg_attribute attribute_record",
    "from pg_catalog.pg_constraint",
    "not valid",
  ]) {
    expect(sql).toContain(fragment);
  }
  expect((sql.match(/\) not valid;/g) ?? []).length).toBe(9);
  expect(sql).not.toMatch(/\b(?:insert|update|delete)\s+(?:into\s+)?public\./);
  expect(sql).not.toMatch(/(?:^|\n)\s*(?:begin|commit|rollback)\s*;/m);
  expect(sql).not.toContain("create index concurrently");
  expect(sql).not.toMatch(/\b(?:grant|revoke|create function|create policy|drop policy)\b/);
  expect(sql).not.toContain("alter column recommendation_id set not null");
});

test("666EE stays source-only and is registered once in the foundation shard", () => {
  const documentation = `${source(actionPath)}\n${source(evidencePath)}`;
  expect(documentation).toMatch(/fail-closed/i);
  expect(documentation).toMatch(/source-controlled only/i);
  expect(documentation).not.toMatch(
    /https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i,
  );
  expect(source(roadmapPath)).toMatch(/action 666ee/i);
  expect(source(ledgerPath)).toMatch(/action 666ee/i);
  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
