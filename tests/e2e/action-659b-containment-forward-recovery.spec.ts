import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test, expect } from "@playwright/test";

const root = process.cwd();
const incidentRoot = resolve(root, "supabase/incident-recovery/20260724003000-action-650-containment");
const source = readFileSync(resolve(incidentRoot, "recovery.sql"), "utf8");
const bundle = readFileSync(resolve(incidentRoot, "sql-editor-bundle.sql"), "utf8");
const readback = readFileSync(resolve(incidentRoot, "readback.sql"), "utf8");
const manifest = JSON.parse(readFileSync(resolve(incidentRoot, "manifest.json"), "utf8")) as {
  normal_migration_discovery: boolean;
  recovery_version: string;
};

test("Action 661B keeps 03000 out of normal migration discovery", () => {
  expect(existsSync(resolve(root, "supabase/migrations/20260724003000_repair_contained_trading_data_access_acl_rls.sql"))).toBeFalsy();
  expect(manifest.normal_migration_discovery).toBeFalsy();
  expect(manifest.recovery_version).toBe("20260724003000");
});

test("Action 659B recovery is transaction-scoped and requires containment history", () => {
  for (const artifact of [source, bundle]) {
    expect(artifact).toContain("begin;");
    expect(artifact).toContain("pg_advisory_xact_lock(65920260724003000)");
    expect(artifact).toContain("20260724002000");
    expect(artifact).toContain("20260724003000");
    expect(artifact).toContain("Action 659B recovery history already exists");
    expect(artifact).toContain("PUBLIC privilege postcondition failed");
    expect(artifact).toContain("commit;");
  }
  expect(bundle.indexOf("insert into supabase_migrations.schema_migrations")).toBeGreaterThan(bundle.indexOf("Action 659B postcondition failed"));
});

test("Action 659B can only repair the contained server-only ACL/RLS contract", () => {
  for (const artifact of [source, bundle]) {
    expect(artifact).toContain("revoke all privileges on table public.%I from public, anon, authenticated, service_role");
    expect(artifact).toContain("grant select, insert, update, delete on table public.%I to service_role");
    expect(artifact).toContain("alter table public.%I enable row level security");
    expect(artifact).not.toMatch(/grant\s+.*\s+to\s+(anon|authenticated|public)/i);
    expect(artifact).not.toMatch(/create\s+or\s+replace/i);
    expect(artifact).not.toMatch(/drop\s+trigger/i);
  }
});

test("Action 661B uses target-scoped relation, function, trigger, ACL, and platform-membership allowlists before repair", () => {
  for (const artifact of [source, bundle]) {
    expect(artifact).toContain("target_tables constant text[]");
    expect(artifact).not.toContain("allowed_public_tables");
    expect(artifact).not.toContain("rejects unknown public table scope");
    expect(artifact).toContain("rejects policy drift");
    expect(artifact).toContain("rejects unknown Action 650 function state");
    expect(artifact).toContain("rejects unknown Action 650 trigger state");
    expect(artifact).toContain("expected_append_only_body");
    expect(artifact).toContain("regexp_replace(procs.prosrc");
    expect(artifact).toContain("pg_language where lanname = 'plpgsql'");
    expect(artifact).toContain("not triggers.tgisinternal");
    expect(artifact).toContain("rejects Action 652 RPC drift");
    expect(artifact).toContain("rejects unknown ACL grantee");
    expect(artifact).toContain("rejects direct column ACL state");
    expect(artifact).toContain("attributes.attacl");
    expect(artifact).toContain("pg_auth_members");
    expect(artifact).toContain("authenticator");
    expect(artifact).toContain("unallowlisted platform membership");
  }
  expect(readback).toContain("blocked_by_policy_drift");
  expect(readback).toContain("blocked_by_target_relation_scope");
  expect(readback).toContain("blocked_by_unknown_acl_grantee");
  expect(readback).toContain("blocked_by_platform_membership");
  expect(readback).toContain("blocked_by_direct_column_acl");
  expect(readback).toContain("runtime_roles");
  expect(readback).toContain("blocked_by_append_only_function_drift");
  expect(readback).toContain("blocked_by_append_only_trigger_drift");
  expect(readback).toContain("blocked_by_action_652_drift");
  expect(readback).toContain("action_659b_acl_rls_recovery_ready");
  expect(readback).toContain("action_659b_recovery_verified");
});
