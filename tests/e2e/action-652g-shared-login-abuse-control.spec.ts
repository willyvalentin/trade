import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const repositoryRoot = path.resolve(__dirname, "../..");

async function source(relativePath: string) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

test("shared limiter migration is service-role-only and digest-only", async () => {
  const migration = await source(
    "supabase/migrations/20260724001600_create_shared_login_abuse_control.sql",
  );
  expect(migration).toContain("security definer");
  expect(migration).toContain("set search_path = pg_catalog, public");
  expect(migration).toContain("pg_advisory_xact_lock");
  expect(migration).toContain("'^client:[0-9a-f]{64}$'");
  expect(migration).toContain("revoke all on table public.application_login_abuse_buckets");
  expect(migration).toContain("to service_role");
  expect(migration).not.toMatch(/password_[a-z_]+/);
  expect(migration).not.toContain("raw_ip");
});

test("production shared limiter fails closed and ignores spoofable forwarded identity", async () => {
  const control = await source("lib/server/application-login-abuse-control.ts");
  const identity = await source("lib/application-login-runtime-proof.ts");
  const loginRoute = await source("app/api/auth/login/route.ts");

  expect(identity).toContain('request.headers.get("x-nf-client-connection-ip")');
  expect(identity).not.toContain('request.headers.get("x-forwarded-for")');
  expect(control).toContain('process.env.NODE_ENV === "production"');
  expect(control).toContain('{ status: "unavailable" }');
  expect(loginRoute).toContain("reserveSharedLoginAttempt");
  expect(loginRoute).toContain("finalizeSharedLoginSuccess");
  expect(loginRoute).toContain("login_protection_unavailable");
});

test("origin contract anchors production identity without trusting URL decoration", async () => {
  const guard = await source("lib/application-mutation-guard-core.ts");
  expect(guard).toContain('parsed.protocol !== "https:"');
  expect(guard).toContain("parsed.username");
  expect(guard).toContain("applicationCanonicalProductionOrigin");
  expect(guard).toContain("runtimeApplicationUrl");
  expect(guard).not.toContain("environment.CONTEXT");
  expect(guard).toContain("applicationOriginReadiness");
});
