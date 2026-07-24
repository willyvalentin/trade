import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const repositoryRoot = path.resolve(__dirname, "../..");

async function source(relativePath: string) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

const serverPaths = [
  "app/api/automation/run-scan/route.ts",
  "app/api/positions/update/route.ts",
  "app/api/recommendations/generate/route.ts",
  "app/api/recommendations/evaluate-outcomes/route.ts",
  "lib/scanner.ts",
  "lib/market-calendar.ts",
  "lib/intraday-indicator-cache.ts",
  "lib/discard-review.ts",
  "lib/symbol-metadata.ts",
];

test("contained server paths use only fail-closed service-role clients", async () => {
  for (const relativePath of serverPaths) {
    const contents = await source(relativePath);
    expect(contents, relativePath).not.toContain('from "@/lib/supabase"');
  }
  const clientFactory = await source("lib/supabase-server.ts");
  expect(clientFactory).not.toContain("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  expect(clientFactory).toContain('import "server-only"');
  expect(clientFactory).toContain("supabase_service_role_missing");
  expect(clientFactory).toContain("client: null");
  expect(clientFactory).toContain("persistSession: false");
});

test("scan-log parsing is pure and persistence is server-only", async () => {
  const core = await source("lib/scan-log-core.ts");
  const compatibility = await source("lib/scan-logs.ts");
  const persistence = await source("lib/server/scan-log-persistence.ts");

  expect(core).not.toContain("supabase");
  expect(compatibility).not.toContain("supabase");
  expect(persistence).toContain('import "server-only"');
  expect(persistence).toContain("getServerSupabaseClient");
});
