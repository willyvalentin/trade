import { readFileSync } from "node:fs";

import { expect, test } from "@playwright/test";

const migrationPath = "supabase/migrations/20260723002000_create_historical_usage_reconciliation_persistence.sql";

test("Action 631 retains explicit short catalog names and service-role-only definer RPCs", () => {
  const migration = readFileSync(migrationPath, "utf8");
  expect(migration).toContain("create table if not exists public.ci_hur_authorizations");
  expect(migration).toContain("create table if not exists public.ci_hur_reconciliations");
  expect(migration).toContain("create table if not exists public.ci_hur_audits");
  expect(migration).toContain("security definer");
  expect(migration).toContain("set search_path = public");
  expect(migration).toContain("revoke all on table public.ci_hur_authorizations from service_role");
  expect(migration).toContain("grant execute on function public.ci_hur_issue");
  expect(migration).toContain("grant execute on function public.ci_hur_reconcile");
  expect(migration).not.toContain("continuous_intelligence_historical_usage_reconciliation_authorizations");
});

test("Action 631 rejects ineligible authorization state before inserting an authorization", () => {
  const migration = readFileSync(migrationPath, "utf8");
  for (const marker of [
    "return query select 'target_claim_not_found'::text",
    "return query select 'target_claim_scope_mismatch'::text",
    "return query select 'target_claim_not_completed'::text",
    "return query select 'source_audit_missing'::text",
    "return query select 'source_audit_mismatch'::text",
    "return query select 'provider_usage_unverified'::text",
    "return query select 'ledger_failure_evidence_mismatch'::text",
    "return query select 'ordinary_ledger_already_present'::text",
    "return query select 'reconciliation_precondition_mismatch'::text",
  ]) expect(migration).toContain(marker);
  expect(migration.indexOf("return query select 'target_claim_not_found'::text"))
    .toBeLessThan(migration.indexOf("insert into public.ci_hur_authorizations"));
});

test("Action 631 prevents ambiguous output-column SQL and multi-row idempotency results", () => {
  const migration = readFileSync(migrationPath, "utf8");
  expect(migration).toContain("authorization_row.authorization_id = p_authorization_id");
  expect(migration).toContain("reconciliation_row.target_claim_id = p_target_claim_id");
  expect(migration).toContain("return query select 'reconciliation_already_applied'");
  expect(migration).toContain("return;\n    end if;");
  const store = readFileSync("lib/continuous-intelligence-historical-usage-reconciliation-store.ts", "utf8");
  expect(store).toContain("Array.isArray(value) && value.length !== 1");
});
