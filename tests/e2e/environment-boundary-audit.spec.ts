import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { GET as environmentAuditGET } from "../../app/api/environment-boundary-audit/route";
import { POST as firstTinyFetchPOST } from "../../app/api/historical-backfill/first-tiny-fetch/route";
import {
  buildEnvironmentBoundaryAudit,
  expectedProductionSupabaseRef,
  firstTinyFetchRouteExpectedMarker,
  knownStagingSupabaseRef,
} from "../../lib/environment-boundary-audit";

const runbookPath = join(
  process.cwd(),
  "docs/production-staging-environment-boundary-audit.md",
);

async function firstTinyRoutePost(body: unknown) {
  return firstTinyFetchPOST(
    new Request("http://localhost/api/historical-backfill/first-tiny-fetch", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

async function withEnv<T>(
  env: Record<string, string | undefined>,
  callback: () => Promise<T>,
) {
  const keys = [
    "NODE_ENV",
    "VERCEL_ENV",
    "CONTEXT",
    "DEPLOY_URL",
    "URL",
    "SITE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "AUTOMATION_SECRET",
    "TWELVE_DATA_API_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_SERVICE_ROLE",
    "SUPABASE_SERVICE_ROLE_SECRET",
    "NEXT_PUBLIC_APP_BUILD_MARKER",
    "NEXT_PUBLIC_DEPLOY_MARKER",
  ];
  const previous = Object.fromEntries(
    keys.map((key) => [key, process.env[key]]),
  );

  for (const key of keys) {
    if (env[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = env[key];
    }
  }

  try {
    return await callback();
  } finally {
    for (const key of keys) {
      if (previous[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = previous[key];
      }
    }
  }
}

const productionEnv = {
  NODE_ENV: "production",
  CONTEXT: "production",
  DEPLOY_URL: "https://deploy-preview.example.netlify.app",
  URL: "https://trade.valentinlabs.com",
  NEXT_PUBLIC_SUPABASE_URL: `https://${expectedProductionSupabaseRef}.supabase.co`,
  AUTOMATION_SECRET: "a".repeat(64),
  TWELVE_DATA_API_KEY: "twelve-data-secret-value",
  SUPABASE_SERVICE_ROLE_KEY: "supabase-service-role-secret",
  NEXT_PUBLIC_APP_BUILD_MARKER: "test-build-marker",
};

test("runbook includes production audit and first tiny route ping commands", () => {
  const runbook = readFileSync(runbookPath, "utf8");

  expect(runbook).toContain("Production/Staging Environment Boundary Audit");
  expect(runbook).toContain(
    'curl -s "https://trade.valentinlabs.com/api/environment-boundary-audit"',
  );
  expect(runbook).toContain(
    "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-fetch",
  );
  expect(runbook).toContain("--data '{\"route_ping\":true}'");
  expect(runbook).toContain(expectedProductionSupabaseRef);
  expect(runbook).toContain(knownStagingSupabaseRef);
});

test("helper detects production Supabase ref and returns secret lengths only", () => {
  const audit = buildEnvironmentBoundaryAudit(productionEnv);
  const serialized = JSON.stringify(audit);

  expect(audit.advisory_only).toBe(true);
  expect(audit.environment_audit_only).toBe(true);
  expect(audit.app_runtime.node_env).toBe("production");
  expect(audit.app_runtime.netlify_context).toBe("production");
  expect(audit.app_runtime.deploy_url_present).toBe(true);
  expect(audit.app_runtime.site_url_present).toBe(true);
  expect(audit.supabase_refs.public_supabase_project_ref).toBe(
    expectedProductionSupabaseRef,
  );
  expect(audit.supabase_refs.points_to_production).toBe(true);
  expect(audit.supabase_refs.points_to_staging).toBe(false);
  expect(audit.secrets_presence.automation_secret_present).toBe(true);
  expect(audit.secrets_presence.automation_secret_length).toBe(64);
  expect(audit.secrets_presence.twelve_data_api_key_present).toBe(true);
  expect(audit.secrets_presence.twelve_data_api_key_length).toBe(
    "twelve-data-secret-value".length,
  );
  expect(audit.secrets_presence.supabase_service_role_present).toBe(true);
  expect(audit.secrets_presence.supabase_service_role_length).toBe(
    "supabase-service-role-secret".length,
  );
  expect(audit.route_versions.app_build_marker).toBe("test-build-marker");
  expect(audit.route_versions.first_tiny_fetch_route_expected_marker).toBe(
    firstTinyFetchRouteExpectedMarker,
  );
  expect(audit.route_versions.diagnostics_route_marker_present).toBe(true);
  expect(audit.safety.no_secret_values_returned).toBe(true);
  expect(audit.safety.no_secret_hashes_returned).toBe(true);
  expect(audit.safety.provider_fetch_added).toBe(false);
  expect(audit.safety.provider_call_executed).toBe(false);
  expect(audit.safety.candles_persisted).toBe(false);
  expect(audit.safety.fetch_run_persisted).toBe(false);
  expect(audit.safety.replay_executed).toBe(false);
  expect(audit.safety.scanner_behavior_changed).toBe(false);
  expect(serialized).not.toContain(productionEnv.AUTOMATION_SECRET);
  expect(serialized).not.toContain(productionEnv.TWELVE_DATA_API_KEY);
  expect(serialized).not.toContain(productionEnv.SUPABASE_SERVICE_ROLE_KEY);
});

test("helper detects staging Supabase ref with warning", () => {
  const audit = buildEnvironmentBoundaryAudit({
    ...productionEnv,
    NEXT_PUBLIC_SUPABASE_URL: `https://${knownStagingSupabaseRef}.supabase.co`,
  });

  expect(audit.supabase_refs.public_supabase_project_ref).toBe(
    knownStagingSupabaseRef,
  );
  expect(audit.supabase_refs.points_to_production).toBe(false);
  expect(audit.supabase_refs.points_to_staging).toBe(true);
  expect(audit.warnings).toContain(
    "public_supabase_points_to_known_staging_ref",
  );
  expect(audit.warnings).toContain(
    "public_supabase_not_expected_production_ref",
  );
});

test("audit route returns safe production runtime readback", async () => {
  const response = await withEnv(productionEnv, () => environmentAuditGET());
  const body = await response.json();
  const serialized = JSON.stringify(body);

  expect(response.status).toBe(200);
  expect(body.ok).toBe(true);
  expect(body.route_marker).toBe("action_275_environment_boundary_audit");
  expect(body.audit.supabase_refs.public_supabase_project_ref).toBe(
    expectedProductionSupabaseRef,
  );
  expect(body.audit.secrets_presence.automation_secret_present).toBe(true);
  expect(body.audit.secrets_presence.automation_secret_length).toBe(64);
  expect(body.audit.safety.provider_call_executed).toBe(false);
  expect(body.audit.safety.candles_persisted).toBe(false);
  expect(body.audit.safety.fetch_run_persisted).toBe(false);
  expect(body.audit.safety.replay_executed).toBe(false);
  expect(body.audit.safety.scanner_behavior_changed).toBe(false);
  expect(serialized).not.toContain(productionEnv.AUTOMATION_SECRET);
  expect(serialized).not.toContain(productionEnv.TWELVE_DATA_API_KEY);
  expect(serialized).not.toContain(productionEnv.SUPABASE_SERVICE_ROLE_KEY);
});

test("first tiny route_ping returns marker without auth", async () => {
  const response = await firstTinyRoutePost({ route_ping: true });
  const body = await response.json();

  expect(response.status).toBe(200);
  expect(body.ok).toBe(true);
  expect(body.route_ping).toBe(true);
  expect(body.route_version).toBe(firstTinyFetchRouteExpectedMarker);
  expect(body.route_build_marker).toBe(firstTinyFetchRouteExpectedMarker);
  expect(JSON.stringify(body)).not.toContain("AUTOMATION_SECRET");
});

test("first tiny unauthorized diagnostics remain safe", async () => {
  const secret = "z".repeat(64);
  const response = await withEnv(
    {
      ...productionEnv,
      AUTOMATION_SECRET: secret,
      TWELVE_DATA_API_KEY: "another-twelve-secret",
    },
    () => firstTinyRoutePost({ execute_provider_call: true }),
  );
  const body = await response.json();
  const serialized = JSON.stringify(body);

  expect(response.status).toBe(401);
  expect(body.error).toBe("Unauthorized.");
  expect(body.auth_diagnostics.server_secret_present).toBe(true);
  expect(body.auth_diagnostics.server_secret_length).toBe(64);
  expect(body.auth_diagnostics.header_present).toBe(false);
  expect(body.auth_diagnostics.header_matches).toBe(false);
  expect(body.provider_call_executed).toBe(false);
  expect(body.candles_persisted).toBe(false);
  expect(body.fetch_run_persisted).toBe(false);
  expect(body.replay_executed).toBe(false);
  expect(body.scanner_behavior_changed).toBe(false);
  expect(serialized).not.toContain(secret);
  expect(serialized).not.toContain("another-twelve-secret");
});
