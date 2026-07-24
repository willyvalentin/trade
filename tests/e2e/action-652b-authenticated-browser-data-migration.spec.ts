import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const repositoryRoot = path.resolve(__dirname, "../..");

async function source(relativePath: string) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

function localModules(from: string, specifier: string) {
  if (!specifier.startsWith("@/") && !specifier.startsWith(".")) return [];
  const unresolved = specifier.startsWith("@/")
    ? specifier.slice(2)
    : path.normalize(path.join(path.dirname(from), specifier));
  return [`${unresolved}.ts`, `${unresolved}.tsx`, `${unresolved}/index.ts`, `${unresolved}/index.tsx`];
}

async function reachableRuntimeModules(entry: string, seen = new Set<string>()) {
  if (seen.has(entry)) return seen;
  seen.add(entry);
  const contents = await source(entry);
  const imports = contents.matchAll(/import(?!\s+type)\s+(?:[^"']+?\s+from\s+)?["']([^"']+)["']/g);
  for (const match of imports) {
    for (const target of localModules(entry, match[1]!)) {
      try {
        await reachableRuntimeModules(target, seen);
        break;
      } catch {
        // Try the next TypeScript resolution candidate.
      }
    }
  }
  return seen;
}

test("TradeApp has no direct Supabase persistence for contained recommendation data", async () => {
  const tradeApp = await source("app/trade-app.tsx");

  expect(tradeApp).not.toContain('from "@/lib/supabase"');
  expect(tradeApp).not.toContain("supabaseClient: supabase");
  expect(tradeApp).not.toContain("persistRecommendationScanRun(");
  expect(tradeApp).not.toContain("persistRecommendationBatch(");
  expect(tradeApp).not.toContain("persistRecommendationSnapshot(");
  expect(tradeApp).not.toContain("persistRecommendationOutcome(");
  expect(tradeApp).not.toContain("readRecommendationScanRunsFromLocalStorage(");
  expect(tradeApp).not.toContain("readRecommendationBatchesFromLocalStorage(");
  expect(tradeApp).not.toContain("readRecommendationSnapshotsFromLocalStorage(");
  expect(tradeApp).not.toContain("readRecommendationOutcomesFromLocalStorage(");
});

test("browser runtime dependency graph cannot reach Supabase or server persistence", async () => {
  const graph = await reachableRuntimeModules("app/trade-app.tsx");
  await reachableRuntimeModules("app/settings/page.tsx", graph);
  const prohibited = Array.from(graph).filter(
    (module) =>
      module === "lib/supabase.ts" ||
      module.startsWith("lib/server/") ||
      module.includes("persistence"),
  );

  expect(prohibited).toEqual([]);
  expect(graph).toContain("lib/scan-log-core.ts");
  expect(graph).not.toContain("lib/scan-logs.ts");
});

test("scheduled server workflows remain the authoritative publication owners", async () => {
  const scheduledScan = await source("app/api/automation/run-scan/route.ts");
  const diagnosticScan = await source("app/api/diagnostics/run-scan/route.ts");
  const outcomeEvaluation = await source(
    "app/api/recommendations/evaluate-outcomes/route.ts",
  );

  expect(scheduledScan).toContain("persistRecommendationScanRun(");
  expect(scheduledScan).toContain("persistRecommendationBatch(");
  expect(scheduledScan).toContain("persistRecommendationSnapshot(");
  expect(diagnosticScan).toContain("persistRecommendationScanRun(");
  expect(diagnosticScan).toContain("persistRecommendationBatch(");
  expect(diagnosticScan).toContain("persistRecommendationSnapshot(");
  expect(outcomeEvaluation).toContain("persistRecommendationOutcome(");
  expect(outcomeEvaluation).toContain("server: true");
});

test("application data routes are fixed-purpose authenticated commands, not a database proxy", async () => {
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
    expect(route).toContain("requireApplicationSession");
    expect(route).not.toMatch(/table_name|tableName|arbitrary table/i);
  }
});
