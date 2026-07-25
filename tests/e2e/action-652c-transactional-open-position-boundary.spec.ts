import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const repositoryRoot = path.resolve(__dirname, "../..");

async function source(relativePath: string) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

test("open-position route delegates to one bounded transactional RPC", async () => {
  const service = await source("lib/server/application-data-access.ts");
  const route = await source("app/api/app/positions/route.ts");

  expect(service).toContain('client.rpc("app_open_position_transaction"');
  expect(service).not.toContain('client.from("positions").insert');
  expect(service).not.toContain('client.from("recommendations").update');
  expect(service).not.toContain('client.from("recommendation_snapshots").update');
  expect(service).toContain('p_command_version: "application_open_position_v1"');
  expect(route).toContain("requireApplicationSession");
  expect(route).toContain("openApplicationPosition(body)");
});

test("transactional RPC locks and validates one recommendation before linked writes", async () => {
  const migration = await source(
    "supabase/migrations/20260724001500_create_transactional_open_position_command.sql",
  );

  expect(migration).toContain("security definer");
  expect(migration).toContain("set search_path = pg_catalog, public");
  expect(migration).toContain("for update");
  expect(migration).toContain("open_position_command_conflict");
  expect(migration).toContain("recommendation_snapshot_linkage_conflict");
  expect(migration).toContain("revoke all on function public.app_open_position_transaction");
  expect(migration).toContain(") to service_role;");
  expect(migration).not.toContain(") to anon;");
});

test("disposable database harness proves rollback and idempotency with real SQL", async () => {
  const harness = await source("scripts/action-652c-local-db-transaction-test.mjs");

  expect(harness).toContain("success state was not committed");
  expect(harness).toContain("idempotency created a duplicate");
  expect(harness).toContain("post-insert rollback failed");
  expect(harness).toContain("snapshot-link rollback failed");
  expect(harness).toContain("anon unexpectedly executed RPC");
});
