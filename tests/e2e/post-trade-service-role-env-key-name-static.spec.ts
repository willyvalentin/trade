import { expect, test } from "@playwright/test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const repoRoot = process.cwd();
const tradeUiPath = "app/trade-app.tsx";
const routePath = "app/api/post-trade/payload/validate/route.ts";
const servicePlanPath = "lib/post-trade-persistence-service-plan.ts";
const validatorPath = "lib/post-trade-payload-validator.ts";

const expectedFutureStagingServiceRoleKey = "SUPABASE_STAGING_SERVICE_ROLE_KEY";
const forbiddenClientServiceRolePattern =
  /NEXT_PUBLIC_[A-Z0-9_]*(?:SERVICE[_-]?ROLE|SERVICE_ROLE)[A-Z0-9_]*/i;
const serviceRoleReferencePattern =
  /(?:SERVICE[_-]?ROLE|service[_-]?role|serviceRole)/i;
const serviceRoleLoggingPattern =
  /(?:console\.(?:log|info|warn|error)|return\s+NextResponse\.json|Response\.json)\s*\([\s\S]*?(?:SERVICE[_-]?ROLE|service[_-]?role|serviceRole)/i;

function readSource(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function collectSourceFiles(root: string): string[] {
  const absoluteRoot = join(repoRoot, root);
  const results: string[] = [];
  const entries = readdirSync(absoluteRoot);

  for (const entry of entries) {
    if (
      entry === "node_modules" ||
      entry === ".next" ||
      entry === "tmp" ||
      entry === ".git"
    ) {
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

test.describe("post-trade service-role env key-name static check", () => {
  test("future staging service-role key pattern is server-only and non-public", () => {
    expect(expectedFutureStagingServiceRoleKey).toBe(
      "SUPABASE_STAGING_SERVICE_ROLE_KEY",
    );
    expect(expectedFutureStagingServiceRoleKey).not.toMatch(/^NEXT_PUBLIC_/);
    expect(expectedFutureStagingServiceRoleKey).toContain("STAGING");
    expect(expectedFutureStagingServiceRoleKey).not.toContain("PRODUCTION");
    expect(expectedFutureStagingServiceRoleKey).not.toContain("TRADE");
  });

  test("source files do not declare public service-role environment key names", () => {
    const files = [...collectSourceFiles("app"), ...collectSourceFiles("lib")];
    const offenders = files.filter((file) =>
      forbiddenClientServiceRolePattern.test(readSource(file)),
    );

    expect(offenders).toEqual([]);
  });

  test("Trade UI has no service-role references or planned env names", () => {
    const tradeUiSource = readSource(tradeUiPath);

    expect(tradeUiSource).not.toMatch(serviceRoleReferencePattern);
    expect(tradeUiSource).not.toContain(expectedFutureStagingServiceRoleKey);
    expect(tradeUiSource).not.toMatch(forbiddenClientServiceRolePattern);
  });

  test("no-write route, validator, and service-plan sources do not read service-role env keys", () => {
    for (const path of [routePath, validatorPath, servicePlanPath]) {
      const source = readSource(path);

      expect(source, path).not.toContain("process.env.SUPABASE_STAGING_SERVICE_ROLE_KEY");
      expect(source, path).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
      expect(source, path).not.toContain("SUPABASE_PRODUCTION_SERVICE_ROLE_KEY");
      expect(source, path).not.toMatch(forbiddenClientServiceRolePattern);
    }
  });

  test("service-role material is not logged or returned from current no-write sources", () => {
    for (const path of [routePath, validatorPath, servicePlanPath]) {
      const source = readSource(path);

      expect(source, path).not.toMatch(serviceRoleLoggingPattern);
    }
  });
});
