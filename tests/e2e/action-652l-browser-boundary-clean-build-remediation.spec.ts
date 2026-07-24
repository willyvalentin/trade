import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const repositoryRoot = path.resolve(__dirname, "../..");

async function source(relativePath: string) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

const browserSafeRecommendationModules = [
  "lib/recommendation-snapshot.ts",
  "lib/recommendation-scan-run.ts",
  "lib/recommendation-batch-memory.ts",
  "lib/recommendation-outcome-tracker.ts",
];

const serverPersistenceModules = [
  "lib/server/recommendation-snapshot-persistence.ts",
  "lib/server/recommendation-scan-run-persistence.ts",
  "lib/server/recommendation-batch-persistence.ts",
  "lib/server/recommendation-outcome-persistence.ts",
];

test("recommendation browser modules contain no database persistence surface", async () => {
  for (const relativePath of browserSafeRecommendationModules) {
    const contents = await source(relativePath);
    expect(contents, relativePath).not.toContain('import "server-only"');
    expect(contents, relativePath).not.toContain("SupabaseClient");
    expect(contents, relativePath).not.toMatch(
      /\.from\(\s*["']recommendation_(?:snapshots|scan_runs|batches|outcomes)["']\s*\)/,
    );
    expect(contents, relativePath).not.toMatch(
      /export async function persistRecommendation(?:Snapshot|ScanRun|Batch|Outcome)\(/,
    );
  }
});

test("recommendation database writes are isolated behind explicit server-only modules", async () => {
  for (const relativePath of serverPersistenceModules) {
    const contents = await source(relativePath);
    expect(contents, relativePath).toContain('import "server-only"');
    expect(contents, relativePath).toMatch(
      /export async function persistRecommendation(?:Snapshot|ScanRun|Batch|Outcome)\(/,
    );
    expect(contents, relativePath).toContain("server_persistence_unavailable");
    expect(contents, relativePath).not.toContain("window.localStorage");
  }
});

test("stale server clients were replaced by the canonical fail-closed boundary", async () => {
  const scheduledScan = await source("app/api/automation/run-scan/route.ts");
  const outcomeRoute = await source(
    "app/api/recommendations/evaluate-outcomes/route.ts",
  );

  expect(scheduledScan).toContain(
    'await serverSupabase()\n    .from("scheduled_scan_attempts")',
  );
  expect(scheduledScan).not.toMatch(/\bawait supabase\s*\.\s*from/);
  expect(outcomeRoute).toContain(
    "supabaseClient: serverSupabase?.client",
  );
  expect(outcomeRoute).toContain(
    "unavailableReason: serverSupabase?.unavailable_reason",
  );
  expect(outcomeRoute).not.toContain("supabaseClient: supabase");
});

test("clean-install server-only marker is explicitly declared", async () => {
  const packageJson = JSON.parse(await source("package.json")) as {
    dependencies?: Record<string, string>;
  };
  const lockfile = await source("package-lock.json");

  expect(packageJson.dependencies?.["server-only"]).toBe("0.0.1");
  expect(lockfile).toContain('"node_modules/server-only"');
});
