import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const repositoryRoot = path.resolve(__dirname, "../..");

async function source(relativePath: string) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

test("the application session is owner-bound and fails closed", async () => {
  const session = await source("lib/application-session-core.ts");
  const login = await source("app/api/auth/login/route.ts");
  const serverSession = await source("lib/server/application-session.ts");
  const principal = await source("lib/server/application-owner-principal.ts");

  expect(session).toContain("ture_application_session_v2_owner_bound");
  expect(session).toContain('"TURE_APPLICATION_OWNER_USER_ID"');
  expect(session).toContain("owner_user_id: ownerUserId");
  expect(session).toContain("payload.owner_user_id !== configuredOwnerUserId");
  expect(login).toContain("verifyConfiguredApplicationOwnerPrincipal()");
  expect(principal).toContain("client.auth.admin.getUserById(ownerUserId)");
  expect(serverSession).toContain("verifyConfiguredApplicationOwnerPrincipal()");
});

test("application routes pass only the verified session owner into data access", async () => {
  const routes = await Promise.all(
    [
      "app/api/app/dashboard/route.ts",
      "app/api/app/settings/route.ts",
      "app/api/app/execution-records/route.ts",
      "app/api/app/outcome-backfill/route.ts",
      "app/api/app/recommendation-lifecycle/route.ts",
      "app/api/app/positions/route.ts",
    ].map(source),
  );

  for (const route of routes) {
    expect(route).toContain("requireApplicationSession()");
    expect(route).toContain("session.owner_user_id");
    expect(route).not.toMatch(/body\.(?:owner_user_id|ownerUserId|user_id)/);
  }
});

test("service-role application data access is explicitly owner-scoped", async () => {
  const dataAccess = await source("lib/server/application-data-access.ts");
  const positionUpdate = await source("app/api/positions/update/route.ts");
  const generator = await source("lib/recommendation-generator.ts");
  const snapshotPersistence = await source(
    "lib/server/recommendation-snapshot-persistence.ts",
  );
  const discardReview = await source("lib/discard-review.ts");

  for (const table of [
    "recommendations",
    "positions",
    "position_updates",
    "user_settings",
    "recommendation_snapshots",
    "recommendation_scan_runs",
    "recommendation_batches",
    "recommendation_outcomes",
  ]) {
    expect(dataAccess).toContain(`.from("${table}")`);
  }
  expect(dataAccess).toContain('.eq("owner_user_id", owner)');
  expect(dataAccess).toContain('.eq("user_id", owner)');
  expect(dataAccess).toContain('client.rpc("app_open_owned_position_transaction"');
  expect(positionUpdate).toContain('.eq("owner_user_id", session.owner_user_id)');
  expect(positionUpdate).toContain("owner_user_id: ownerUserId");
  expect(generator).toContain("owner_user_id: owner");
  expect(snapshotPersistence).toContain("owner_user_id: ownerUserId");
  expect(discardReview).toContain('.eq("owner_user_id", owner)');
  expect(discardReview).toContain("options.ownerUserId");
});

test("the migration adds indexed Auth ownership without inferring or backfilling", async () => {
  const migration = await source(
    "supabase/migrations/20260811163228_add_fail_closed_application_owner_foundation.sql",
  );

  for (const table of [
    "recommendations",
    "positions",
    "position_updates",
    "user_settings",
    "recommendation_snapshots",
    "recommendation_scan_runs",
    "recommendation_batches",
    "recommendation_outcomes",
  ]) {
    expect(migration).toContain(`alter table public.${table}`);
  }
  expect(migration).toContain("references auth.users(id)");
  expect(migration).toContain("on delete restrict not valid");
  expect(migration).toContain("check (owner_user_id is not null) not valid");
  expect(migration).toContain("foreign key (recommendation_id, owner_user_id)");
  expect(migration).toContain("(select auth.uid()) = owner_user_id");
  expect(migration).toContain("(select auth.uid()) = user_id");
  expect(migration).toContain("from public, anon, authenticated");
  expect(migration).toContain("app_open_owned_position_transaction");
  expect(migration).toContain("from service_role");
  expect(migration).not.toMatch(/update\s+public\.[a-z_]+\s+set\s+(?:owner_user_id|user_id)\s*=/i);
  expect(migration).not.toMatch(/insert\s+into\s+auth\.users/i);
});

test("the source-only activation gate stays explicit", async () => {
  const contract = await source(
    "docs/action-659-ma05-fail-closed-owner-foundation.md",
  );

  expect(contract).toContain("source-only; draft; no production apply; no deployment");
  expect(contract).toContain("Never infer");
  expect(contract).toContain("two-principal negative tests");
  expect(contract).toContain("must not be merged or deployed");
});
