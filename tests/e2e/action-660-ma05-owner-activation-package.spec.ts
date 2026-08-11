import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const repositoryRoot = path.resolve(__dirname, "../..");
const operationRoot =
  "supabase/operations/action-660-ma05-owner-activation";

async function source(relativePath: string) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

test("derived recommendation records are owner-bound at persistence and read time", async () => {
  const dataAccess = await source("lib/server/application-data-access.ts");
  const automation = await source("app/api/automation/run-scan/route.ts");
  const evaluator = await source(
    "app/api/recommendations/evaluate-outcomes/route.ts",
  );
  const persistenceFiles = await Promise.all(
    [
      "lib/server/recommendation-scan-run-persistence.ts",
      "lib/server/recommendation-batch-persistence.ts",
      "lib/server/recommendation-outcome-persistence.ts",
    ].map(source),
  );

  for (const table of [
    "recommendation_scan_runs",
    "recommendation_batches",
    "recommendation_outcomes",
  ]) {
    expect(dataAccess).toMatch(
      new RegExp(
        `from\\(\\"${table}\\"\\)[\\s\\S]{0,180}eq\\(\\"owner_user_id\\", owner\\)`,
      ),
    );
  }

  expect(automation).toContain("readRecentRecommendationScanRuns(ownerUserId)");
  expect(automation).toMatch(
    /from\("recommendation_scan_runs"\)[\s\S]{0,180}eq\("owner_user_id", ownerUserId\)/,
  );
  expect(evaluator).toMatch(
    /from\("recommendation_batches"\)[\s\S]{0,180}eq\("owner_user_id", ownerUserId\)/,
  );
  expect(evaluator).toMatch(
    /from\("recommendation_outcomes"\)[\s\S]{0,180}eq\("owner_user_id", ownerUserId\)/,
  );

  for (const persistence of persistenceFiles) {
    expect(persistence).toContain("getConfiguredApplicationOwnerUserId()");
    expect(persistence).toContain("owner_user_id: ownerUserId");
    expect(persistence).toContain("application_owner_identity_unavailable");
  }
});

test("the migration protects every owner-bound derived table", async () => {
  const migration = await source(
    "supabase/migrations/20260811145040_add_fail_closed_application_owner_foundation.sql",
  );

  for (const table of [
    "recommendation_scan_runs",
    "recommendation_batches",
    "recommendation_outcomes",
  ]) {
    expect(migration).toContain(`alter table public.${table}`);
    expect(migration).toContain(
      `${table}_owner_user_id_fkey`,
    );
    expect(migration).toContain(`${table}_owner_required_check`);
    expect(migration).toContain(
      `revoke all privileges on table public.${table} from public, anon, authenticated`,
    );
    expect(migration).toContain(
      `create policy application_owner_access on public.${table}`,
    );
  }
});

test("the operator activation bundle is explicit, transactional, and fail-closed", async () => {
  const readme = await source(`${operationRoot}/README.md`);
  const preflight = await source(`${operationRoot}/preflight.sql`);
  const activation = await source(`${operationRoot}/activate.sql`);

  expect(readme).toContain("never executed by this action");
  expect(readme).toContain("Do not select or infer the only row");
  expect(readme).toContain("Keep them paused");
  expect(preflight).toContain(
    "REPLACE_WITH_EXPLICITLY_CONFIRMED_AUTH_USER_UUID",
  );
  expect(preflight).toContain("false::boolean as writers_paused");
  expect(preflight).toContain("ready_for_migration");

  expect(activation).toContain("begin;");
  expect(activation).toContain("commit;");
  expect(activation).toContain("pg_advisory_xact_lock");
  expect(activation).toContain("ma05_writers_not_confirmed_paused");
  expect(activation).toContain("ma05_conflicting_existing_owner_detected");
  expect(activation).toContain("where owner_user_id is null");
  expect(activation).toContain("where user_id is null");
  expect(activation).toContain("validate constraint");
  expect(activation).toContain("alter column owner_user_id set not null");
  expect(activation).toContain("alter column user_id set not null");
  expect(activation).toContain("ma05_row_count_reconciliation_failed");
  expect(activation).not.toMatch(/select\s+id\s+from\s+auth\.users\s+limit\s+1/i);
});

test("readback covers data, constraints, ACL, RPC and rollback-only RLS proof", async () => {
  const readback = await source(`${operationRoot}/readback.sql`);
  const negativeTest = await source(
    `${operationRoot}/two-principal-negative-test.sql`,
  );

  expect(readback).toContain("null_owner_count");
  expect(readback).toContain("foreign_owner_count");
  expect(readback).toContain("physical_not_null");
  expect(readback).toContain("constraint_validated");
  expect(readback).toContain("authenticated_select_revoked");
  expect(readback).toContain("public_rpc_execute_revoked");
  expect(readback).toContain("service_role_rpc_execute_granted");

  expect(negativeTest).toContain("NON-PRODUCTION ONLY");
  expect(negativeTest).toContain("owner_a");
  expect(negativeTest).toContain("owner_b");
  expect(negativeTest).toContain("set local role authenticated");
  expect(negativeTest).toContain("visible_other_rows");
  expect(negativeTest.trim().endsWith("rollback;")).toBe(true);
});
