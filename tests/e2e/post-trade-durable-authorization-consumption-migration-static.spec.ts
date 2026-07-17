import { expect, test } from "@playwright/test";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const migrationFileName =
  "20260710000000_create_execution_authorization_consumptions.sql";
const migrationsDir = join(process.cwd(), "supabase", "migrations");
const migrationPath = join(migrationsDir, migrationFileName);
const migrationSql = readFileSync(migrationPath, "utf8");
const normalizedSql = migrationSql.toLowerCase();
const createTableMatches = normalizedSql.match(/\bcreate\s+table\b/g) ?? [];

function expectSqlContains(fragment: string) {
  expect(normalizedSql).toContain(fragment.toLowerCase());
}

function expectSqlDoesNotMatch(pattern: RegExp) {
  expect(migrationSql).not.toMatch(pattern);
}

test.describe("post-trade durable authorization consumption migration static review", () => {
  test("exactly one intended migration file exists for the durable authorization table", () => {
    const matches = readdirSync(migrationsDir).filter((fileName) =>
      fileName.endsWith("_create_execution_authorization_consumptions.sql"),
    );

    expect(matches).toEqual([migrationFileName]);
    expect(migrationFileName > "20260709000000_create_historical_candle_storage.sql").toBe(true);
    expect(createTableMatches).toHaveLength(1);
    expectSqlContains(
      "create table if not exists public.execution_authorization_consumptions",
    );
    expectSqlDoesNotMatch(/create\s+table\s+(?:if\s+not\s+exists\s+)?public\.execution_authorization_consumption\b/i);
    expectSqlDoesNotMatch(/create\s+(?:temporary|temp|unlogged)\s+table/i);
    expectSqlDoesNotMatch(/\bpartition\s+by\b/i);
    expectSqlDoesNotMatch(/\binherits\s*\(/i);
  });

  test("required identity binding lifecycle and evidence columns exist", () => {
    for (const column of [
      "id uuid primary key default gen_random_uuid()",
      "authorization_artifact_id text not null",
      "authorization_artifact_version text not null",
      "authorization_fingerprint text not null",
      "authorization_type text not null",
      "source_action_identity text not null",
      "execution_attempt_id text not null",
      "execution_plan_id text not null",
      "consumption_operation_id text not null",
      "execution_scope text not null",
      "target_project_id text not null",
      "rejected_production_project_id text not null",
      "execution_function_name text not null",
      "execution_function_contract_version text not null",
      "execution_function_implementation_decision text not null",
      "execution_function_review_decision text not null",
      "final_gate_identity text not null",
      "final_gate_implementation_decision text not null",
      "final_gate_review_decision text not null",
      "expected_operation_count integer not null",
      "expected_row_count integer not null",
      "first_target_table text not null",
      "second_target_table text not null",
      "audit_dependency_identity text not null",
      "authorization_state text not null",
      "issued_at timestamptz not null",
      "expires_at timestamptz not null",
      "consumed_at timestamptz null",
      "created_at timestamptz not null default now()",
      "updated_at timestamptz not null default now()",
      "execution_record_id uuid null references public.execution_records(id) on delete restrict",
      "execution_audit_event_id uuid null references public.execution_record_audit_events(id) on delete restrict",
      "affected_authorization_row_count integer null",
      "persistence_operation_identity text null",
      "result_classification text null",
    ]) {
      expectSqlContains(column);
    }
  });

  test("critical text identities are non-empty and no JSON payload or capability columns exist", () => {
    for (const fragment of [
      "length(btrim(authorization_artifact_id)) > 0",
      "length(btrim(authorization_artifact_version)) > 0",
      "length(btrim(authorization_fingerprint)) > 0",
      "length(btrim(source_action_identity)) > 0",
      "length(btrim(execution_attempt_id)) > 0",
      "length(btrim(execution_plan_id)) > 0",
      "length(btrim(consumption_operation_id)) > 0",
      "length(btrim(execution_function_name)) > 0",
      "length(btrim(final_gate_identity)) > 0",
    ]) {
      expectSqlContains(fragment);
    }

    expectSqlDoesNotMatch(/\bjsonb?\b/i);
    expectSqlDoesNotMatch(/\bpayload\b/i);
    expectSqlDoesNotMatch(/\bmetadata\b/i);
    expectSqlDoesNotMatch(/\bblob\b/i);
    expectSqlDoesNotMatch(/\bcredential\b/i);
    expectSqlDoesNotMatch(/\bcookie\b/i);
    expectSqlDoesNotMatch(/\bsession\b/i);
    expectSqlDoesNotMatch(/\bbankid\b/i);
    expectSqlDoesNotMatch(/\bbroker\b/i);
    expectSqlDoesNotMatch(/\bbrowser\b/i);
    expectSqlDoesNotMatch(/\bavanza\b/i);
    expectSqlDoesNotMatch(/\bproduction_access_allowed\b/i);
    expectSqlDoesNotMatch(/\bapi_invocation_allowed\b/i);
    expectSqlDoesNotMatch(/\bui_invocation_allowed\b/i);
    expectSqlDoesNotMatch(/\bclient_invocation_allowed\b/i);
  });

  test("semantic defaults and reviewed state model are fixed", () => {
    for (const fragment of [
      "authorization_state text not null default 'unused'",
      "mock_only boolean not null default true",
      "one_shot boolean not null default true",
      "retry_allowed boolean not null default false",
      "expected_operation_count integer not null default 2",
      "expected_row_count integer not null default 2",
      "target_project_id text not null default 'pdvzyuhykomwfqyyztru'",
      "rejected_production_project_id text not null default 'ekdyopdrrkphlrsilyoo'",
      "check (authorization_state in ('unused', 'consumed', 'invalid', 'expired'))",
    ]) {
      expectSqlContains(fragment);
    }

    expect(normalizedSql).not.toContain("'ambiguous'");
    expect(normalizedSql).not.toContain("'pending'");
    expect(normalizedSql).not.toContain("'reserved'");
  });

  test("project isolation contract count ordered-table audit dependency and one-shot constraints exist", () => {
    for (const fragment of [
      "target_project_id = 'pdvzyuhykomwfqyyztru'",
      "target_project_id <> 'ekdyopdrrkphlrsilyoo'",
      "rejected_production_project_id = 'ekdyopdrrkphlrsilyoo'",
      "execution_scope = 'staging_mock_post_trade_execution'",
      "expected_operation_count = 2 and expected_row_count = 2",
      "first_target_table = 'execution_records'",
      "second_target_table = 'execution_record_audit_events'",
      "first_target_table <> second_target_table",
      "audit_dependency_identity = 'execution_record_audit_events.execution_record_id_from_execution_records.id'",
      "check (mock_only = true and one_shot = true and retry_allowed = false)",
    ]) {
      expectSqlContains(fragment);
    }
  });

  test("time and evidence invariants prevent partial or stale consumption evidence", () => {
    for (const fragment of [
      "expires_at > issued_at",
      "expires_at <= issued_at + interval '15 minutes'",
      "authorization_state <> 'unused'",
      "consumed_at is null",
      "execution_record_id is null",
      "execution_audit_event_id is null",
      "authorization_state <> 'consumed'",
      "consumed_at is not null",
      "execution_record_id is not null",
      "execution_audit_event_id is not null",
      "affected_authorization_row_count = 1",
      "persistence_operation_identity is not null",
      "result_classification = 'transitioned_unused_to_consumed'",
      "authorization_state not in ('invalid', 'expired')",
    ]) {
      expectSqlContains(fragment);
    }
    expect(normalizedSql).not.toContain("result_classification = 'success'");
    expect(normalizedSql).not.toContain("result_classification = 'ok'");
    expect(normalizedSql).not.toContain("result_classification = 'ambiguous'");
  });

  test("reviewed uniqueness and non-redundant indexes exist", () => {
    for (const fragment of [
      "execution_authorization_consumptions_artifact_id_uidx",
      "on public.execution_authorization_consumptions (target_project_id, authorization_artifact_id)",
      "execution_authorization_consumptions_fingerprint_uidx",
      "on public.execution_authorization_consumptions (target_project_id, authorization_fingerprint)",
      "execution_authorization_consumptions_attempt_id_uidx",
      "on public.execution_authorization_consumptions (target_project_id, execution_attempt_id)",
      "execution_authorization_consumptions_plan_id_uidx",
      "on public.execution_authorization_consumptions (target_project_id, execution_plan_id)",
      "execution_authorization_consumptions_operation_id_uidx",
      "on public.execution_authorization_consumptions (target_project_id, consumption_operation_id)",
      "execution_authorization_consumptions_artifact_plan_uidx",
      "authorization_artifact_id",
      "execution_plan_id",
      "execution_authorization_consumptions_read_back_idx",
      "execution_authorization_consumptions_state_expiry_idx",
    ]) {
      expectSqlContains(fragment);
    }
  });

  test("foreign keys are conservative and do not cascade", () => {
    expectSqlContains(
      "execution_record_id uuid null references public.execution_records(id) on delete restrict",
    );
    expectSqlContains(
      "execution_audit_event_id uuid null references public.execution_record_audit_events(id) on delete restrict",
    );
    expect(normalizedSql).not.toContain("on delete cascade");
    expect(normalizedSql).not.toContain("on delete set null");
    expect(normalizedSql).not.toContain("on delete set default");
  });

  test("RLS is enabled and no client policies or grants are created", () => {
    expectSqlContains("alter table public.execution_authorization_consumptions");
    expectSqlContains("enable row level security");
    expectSqlContains("revoke all privileges on table public.execution_authorization_consumptions");
    expectSqlContains("from anon, authenticated");

    expectSqlDoesNotMatch(/create\s+policy/i);
    expectSqlDoesNotMatch(/using\s*\(\s*true\s*\)/i);
    expectSqlDoesNotMatch(/with\s+check\s*\(\s*true\s*\)/i);
    expectSqlDoesNotMatch(/grant\s+.+\s+to\s+anon/i);
    expectSqlDoesNotMatch(/grant\s+.+\s+to\s+authenticated/i);
    expectSqlDoesNotMatch(/grant\s+.+\s+to\s+service_role/i);
    expectSqlDoesNotMatch(/grant\s+.+\s+to\s+public/i);
  });

  test("migration is schema-only with no rows functions RPC dynamic SQL or runtime wiring", () => {
    expectSqlDoesNotMatch(/\binsert\s+into\b/i);
    expectSqlDoesNotMatch(/\bupdate\s+public\./i);
    expectSqlDoesNotMatch(/\bdelete\s+from\b/i);
    expectSqlDoesNotMatch(/\bmerge\s+into\b/i);
    expectSqlDoesNotMatch(/\btruncate\s+table\b/i);
    expectSqlDoesNotMatch(/\bdrop\s+table\b/i);
    expectSqlDoesNotMatch(/\bdrop\s+index\b/i);
    expectSqlDoesNotMatch(/\bcopy\s+public\./i);
    expectSqlDoesNotMatch(/\bcopy\s+.+\s+from\s+stdin\b/i);
    expectSqlDoesNotMatch(/create\s+(?:or\s+replace\s+)?function/i);
    expectSqlDoesNotMatch(/create\s+trigger/i);
    expectSqlDoesNotMatch(/\brpc\b/i);
    expectSqlDoesNotMatch(/\bexecute\s+format\b/i);
    expectSqlDoesNotMatch(/\bdo\s+\$\$/i);
    expectSqlDoesNotMatch(/\blanguage\s+plpgsql\b/i);
    expectSqlDoesNotMatch(/create\s+extension/i);
    expectSqlDoesNotMatch(/\bupsert\b/i);
    expectSqlDoesNotMatch(/alter\s+table\s+(?!public\.execution_authorization_consumptions\b)/i);
    expectSqlDoesNotMatch(/app\/api/i);
    expectSqlDoesNotMatch(/trade-app/i);
    expectSqlDoesNotMatch(/route\.ts/i);
    expectSqlDoesNotMatch(/api\s+route/i);
  });

  test("migration contains no unrelated broker runtime or sensitive operational references", () => {
    for (const forbidden of [
      /Avanza/,
      /\bBUY\b/,
      /\bSELL\b/,
      /browser automation/i,
      /credential/i,
      /cookie/i,
      /session/i,
      /BankID/,
      /\bbroker\b/i,
      /settlement/i,
      /live trade mutation/i,
      /order behavior/i,
      /position mutation/i,
    ]) {
      expectSqlDoesNotMatch(forbidden);
    }
  });
});
