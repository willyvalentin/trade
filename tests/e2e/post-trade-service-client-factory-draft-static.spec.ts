import { expect, test } from "@playwright/test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const repoRoot = process.cwd();
const factoryPath = "lib/post-trade-service-client-factory.ts";
const tradeUiPath = "app/trade-app.tsx";
const routePath = "app/api/post-trade/payload/validate/route.ts";
const servicePlanPath = "lib/post-trade-persistence-service-plan.ts";
const expectedFutureStagingServiceRoleKey = "SUPABASE_STAGING_SERVICE_ROLE_KEY";

function readSource(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function collectSourceFiles(root: string): string[] {
  const absoluteRoot = join(repoRoot, root);
  const results: string[] = [];

  for (const entry of readdirSync(absoluteRoot)) {
    if (entry === ".next" || entry === "node_modules" || entry === "tmp") {
      continue;
    }

    const absolutePath = join(absoluteRoot, entry);
    const stats = statSync(absolutePath);

    if (stats.isDirectory()) {
      results.push(...collectSourceFiles(relative(repoRoot, absolutePath)));
      continue;
    }

    if (/\.(ts|tsx|js|jsx)$/.test(entry)) {
      results.push(relative(repoRoot, absolutePath));
    }
  }

  return results;
}

test.describe("post-trade service client factory draft static checks", () => {
  test("factory module is server-only and staging-key scoped", () => {
    const source = readSource(factoryPath);

    expect(source).toContain('import "server-only"');
    expect(source).toContain('from "@supabase/supabase-js"');
    expect(source).toContain("SUPABASE_STAGING_SERVICE_ROLE_KEY");
    expect(source).toContain("SUPABASE_STAGING_URL");
    expect(expectedFutureStagingServiceRoleKey).toBe(
      "SUPABASE_STAGING_SERVICE_ROLE_KEY",
    );
    expect(source).not.toMatch(/NEXT_PUBLIC_[A-Z0-9_]*SERVICE[_-]?ROLE/i);
    expect(source).not.toContain("SUPABASE_PRODUCTION_SERVICE_ROLE_KEY");
    expect(source).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
  });

  test("factory draft encodes fail-closed statuses for unsafe inputs", () => {
    const source = readSource(factoryPath);

    expect(source).toContain("blocked_missing_staging_service_role_key");
    expect(source).toContain("blocked_missing_staging_supabase_url");
    expect(source).toContain("blocked_client_exposed_service_role_key");
    expect(source).toContain("blocked_production_like_target");
    expect(source).toContain("blocked_ambiguous_target");
    expect(source).toContain('serviceRoleEnvKeyName.startsWith("NEXT_PUBLIC_")');
    expect(source).toContain("serviceRoleEnvKeyName !== POST_TRADE_STAGING_SERVICE_ROLE_ENV_KEY");
    expect(source).toContain("input.serviceRoleEnvKeyPresent !== true");
  });

  test("factory draft can become ready only for explicit staging target and key presence", () => {
    const source = readSource(factoryPath);

    expect(source).toContain('"ready_for_future_factory_gate"');
    expect(source).toContain('"ready_staging_service_client"');
    expect(source).toContain('"ture-staging"');
    expect(source).toContain('"pdvzyuhykomwfqyyztru"');
    expect(source).toContain("SUPABASE_STAGING_SERVICE_ROLE_KEY");
    expect(source).toContain("noDatabaseConnection: true");
    expect(source).toContain("noDatabaseWrite: true");
    expect(source).toContain("productionBlocked: true");
  });

  test("factory draft is not imported by route, service plan, or Trade UI", () => {
    expect(readSource(routePath)).not.toContain(
      "post-trade-service-client-factory",
    );
    expect(readSource(servicePlanPath)).not.toContain(
      "post-trade-service-client-factory",
    );
    expect(readSource(tradeUiPath)).not.toContain(
      "post-trade-service-client-factory",
    );
  });

  test("client and UI source files do not import the factory draft", () => {
    const files = [...collectSourceFiles("app")];
    const offenders = files.filter((file) =>
      readSource(file).includes("post-trade-service-client-factory"),
    );

    expect(offenders).toEqual([]);
  });

  test("factory contains real Supabase client creation only in the server-only factory and no write fragments", () => {
    const source = readSource(factoryPath);

    expect(source).toContain("@supabase/supabase-js");
    expect(source).toContain("createClient(");
    expect(source.match(/createClient\(/g)).toHaveLength(1);
    expect(source).not.toMatch(/\.from\s*\(/);
    expect(source).not.toMatch(/\.insert\s*\(/);
    expect(source).not.toMatch(/\.update\s*\(/);
    expect(source).not.toMatch(/\.upsert\s*\(/);
    expect(source).not.toMatch(/\.delete\s*\(/);
    expect(source).not.toMatch(/\.rpc\s*\(/);
    expect(source).not.toMatch(/\.storage\b/);
  });

  test("factory draft does not read, log, return, or expose service-role secret values", () => {
    const source = readSource(factoryPath);

    expect(source).toContain("process.env[POST_TRADE_STAGING_SERVICE_ROLE_ENV_KEY]");
    expect(source).toContain("process.env[POST_TRADE_STAGING_SUPABASE_URL_ENV_KEY]");
    expect(source).not.toMatch(/process\.env\.SUPABASE_STAGING_SERVICE_ROLE_KEY/);
    expect(source).not.toMatch(/process\.env\.SUPABASE_SERVICE_ROLE_KEY/);
    expect(source).not.toMatch(/console\.(?:log|info|warn|error)/);
    expect(source).not.toContain("NextResponse.json");
    expect(source).not.toContain("Response.json");
    expect(source).not.toContain("serviceRoleKey");
    expect(source).not.toMatch(
      /\b(serviceRoleSecret|serviceRoleToken|secretToken|secretValue|tokenValue)\b/,
    );
    expect(source).toContain("noSecretValueReturned: true");
  });

  test("real client factory remains confined away from routes and client source", () => {
    const appSources = collectSourceFiles("app");
    const appOffenders = appSources.filter((file) => {
      const source = readSource(file);
      return source.includes("@supabase/supabase-js") || source.includes("createClient(");
    });

    expect(appOffenders).not.toContain(routePath);
    expect(readSource(routePath)).not.toContain("getPostTradeStagingServiceClient");
    expect(readSource(servicePlanPath)).not.toContain(
      "getPostTradeStagingServiceClient",
    );
    expect(readSource(tradeUiPath)).not.toContain("getPostTradeStagingServiceClient");
  });
});
