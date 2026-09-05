import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const stagingSupabaseProjectRef = "pdvzyuhykomwfqyyztru";
const script = resolve("scripts/verify-staging-diagnostic-readiness.mjs");

const completeStagingEnvironment = {
  AUTOMATION_SECRET: "redacted-test-secret",
  NEXT_PUBLIC_SUPABASE_URL: `https://${stagingSupabaseProjectRef}.supabase.co`,
  SUPABASE_SERVICE_ROLE_KEY: "redacted-test-service-role",
  TURE_APPLICATION_OWNER_USER_ID: "11111111-1111-4111-8111-111111111111",
  TURE_DYNAMIC_MOVERS_DISCOVERY_ENABLED: "false",
};

function runPreflight(environment: Record<string, string | undefined>) {
  const result = spawnSync(process.execPath, [script], {
    encoding: "utf8",
    env: {
      PATH: process.env.PATH ?? "",
      NODE_ENV: "test",
      ...environment,
    } as NodeJS.ProcessEnv,
  });

  return {
    status: result.status,
    stderr: result.stderr,
    stdout: result.stdout,
    result: JSON.parse(result.stdout),
  };
}

test("staging diagnostic preflight accepts only the explicit staging and no-provider env-check shape", () => {
  const run = runPreflight(completeStagingEnvironment);

  expect(run.status).toBe(0);
  expect(run.stderr).toBe("");
  expect(run.stdout).not.toContain(completeStagingEnvironment.AUTOMATION_SECRET);
  expect(run.stdout).not.toContain(
    completeStagingEnvironment.SUPABASE_SERVICE_ROLE_KEY,
  );
  expect(run.result).toEqual({
    contract: "ture_staging_diagnostic_readiness_v1",
    ready: true,
    failures: [],
    evidence: {
      expected_supabase_project_ref: stagingSupabaseProjectRef,
      configured_supabase_project_ref: stagingSupabaseProjectRef,
      automation_secret_configured: true,
      service_role_aliases_configured: ["SUPABASE_SERVICE_ROLE_KEY"],
      application_owner_id_valid: true,
      dynamic_movers_enabled: false,
      openai_key_configured: false,
      market_data_key_configured: false,
    },
  });
});

test("staging diagnostic preflight fails closed for an unconfigured or production-targeted runtime", () => {
  const run = runPreflight({
    AUTOMATION_SECRET: "redacted-test-secret",
    NEXT_PUBLIC_SUPABASE_URL: "https://ekdyopdrrkphlrsilyoo.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: "redacted-test-service-role",
    TURE_APPLICATION_OWNER_USER_ID: "not-a-uuid",
    TURE_DYNAMIC_MOVERS_DISCOVERY_ENABLED: "true",
  });

  expect(run.status).toBe(1);
  expect(run.result.ready).toBe(false);
  expect(run.result.failures).toEqual([
    "staging_supabase_project_mismatch",
    "staging_application_owner_missing_or_invalid",
    "dynamic_movers_must_be_disabled_for_env_check",
  ]);
  expect(run.result.evidence).toMatchObject({
    configured_supabase_project_ref: "ekdyopdrrkphlrsilyoo",
    dynamic_movers_enabled: true,
  });
});

test("staging diagnostic preflight rejects missing and ambiguous server authority without values", () => {
  const missing = runPreflight({
    NEXT_PUBLIC_SUPABASE_URL: `https://${stagingSupabaseProjectRef}.supabase.co`,
    TURE_APPLICATION_OWNER_USER_ID: "11111111-1111-4111-8111-111111111111",
  });
  const ambiguous = runPreflight({
    ...completeStagingEnvironment,
    SUPABASE_SERVICE_ROLE: "another-redacted-test-service-role",
  });

  expect(missing.status).toBe(1);
  expect(missing.result.failures).toEqual([
    "automation_secret_missing",
    "staging_service_role_missing",
  ]);
  expect(ambiguous.status).toBe(1);
  expect(ambiguous.result.failures).toEqual([
    "staging_service_role_alias_ambiguous",
  ]);
  expect(ambiguous.result.evidence.service_role_aliases_configured).toEqual([
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_SERVICE_ROLE",
  ]);
});
