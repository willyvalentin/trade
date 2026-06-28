import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  RECENT_RECOMMENDATION_OUTCOMES_READ_LIMIT,
  RECENT_RECOMMENDATION_READBACK_STABILIZATION_BOUNDARY,
  RECENT_RECOMMENDATION_SNAPSHOTS_READ_LIMIT,
  resolveRecentRecommendationReadbackFailure,
} from "../../lib/recent-recommendation-readback";

const root = process.cwd();
const tradeAppPath = join(root, "app/trade-app.tsx");
const helperPath = join(root, "lib/recent-recommendation-readback.ts");

function read(path: string) {
  return readFileSync(path, "utf8");
}

function extractErrorBlock(source: string, operation: string) {
  const operationIndex = source.indexOf(`operation: "${operation}"`);

  expect(operationIndex).toBeGreaterThan(-1);

  const blockStart = source.lastIndexOf("if (", operationIndex);
  const blockEnd = source.indexOf("} else {", operationIndex);

  expect(blockStart).toBeGreaterThan(-1);
  expect(blockEnd).toBeGreaterThan(blockStart);

  return source.slice(blockStart, blockEnd);
}

test("recent recommendation readback limits are capped at 100", () => {
  expect(RECENT_RECOMMENDATION_SNAPSHOTS_READ_LIMIT).toBe(100);
  expect(RECENT_RECOMMENDATION_OUTCOMES_READ_LIMIT).toBe(100);

  const source = read(tradeAppPath);

  expect(source).toContain(
    ".limit(RECENT_RECOMMENDATION_SNAPSHOTS_READ_LIMIT)",
  );
  expect(source).toContain(
    ".limit(RECENT_RECOMMENDATION_OUTCOMES_READ_LIMIT)",
  );
  expect(source).not.toContain(".limit(1000)");
  expect(source).not.toContain(".limit(750)");
});

test("recent recommendation readback failures choose local fallback on initial load", () => {
  const fallback = resolveRecentRecommendationReadbackFailure({
    isInitialLoad: true,
    localItems: ["local-snapshot"],
    previousItems: ["previous-snapshot"],
  });

  expect(fallback).toEqual({
    items: ["local-snapshot"],
    source: "local_storage",
  });
});

test("recent recommendation readback failures preserve previous state after initial load", () => {
  const fallback = resolveRecentRecommendationReadbackFailure({
    isInitialLoad: false,
    localItems: ["local-outcome"],
    previousItems: ["previous-outcome"],
  });

  expect(fallback).toEqual({
    items: ["previous-outcome"],
    source: "previous_state",
  });
});

test("snapshot and outcome readback errors are warning-level fail-soft paths", () => {
  const source = read(tradeAppPath);
  const snapshotsBlock = extractErrorBlock(
    source,
    "select_recent_recommendation_snapshots",
  );
  const outcomesBlock = extractErrorBlock(
    source,
    "select_recent_recommendation_outcomes",
  );

  for (const block of [snapshotsBlock, outcomesBlock]) {
    expect(block).toContain("resolveRecentRecommendationReadbackFailure");
    expect(block).toContain("console.warn");
    expect(block).toContain("recent_recommendation_readback_unavailable");
    expect(block).toContain("fallbackSource");
    expect(block).toContain("fallbackCount");
    expect(block).not.toContain("console.error");
    expect(block).not.toContain("dashboard_data_load_error");
    expect(block).not.toContain("noteIslandError");
  }
});

test("recent readback stabilization helper remains client-safe and read-only", () => {
  const source = read(helperPath);

  expect(source).not.toContain("server-only");
  expect(source).not.toContain("process.env");
  expect(source).not.toContain("SUPABASE_SERVICE_ROLE");
  expect(source).not.toContain("createClient");
  expect(source).not.toContain("fetch(");
  expect(source).not.toContain(".from(");
  expect(source).not.toContain(".select(");
  expect(source).not.toContain(".insert(");
  expect(source).not.toContain(".update(");
  expect(source).not.toContain(".delete(");
  expect(source).not.toContain(".upsert(");
  expect(RECENT_RECOMMENDATION_READBACK_STABILIZATION_BOUNDARY).toMatchObject({
    readOnly: true,
    manualSupabaseCall: false,
    serviceRoleAdapterCall: false,
    providerCall: false,
    scanRouteInvocation: false,
    brokerOrAvanzaBehavior: false,
    automaticOrderBehavior: false,
  });
});
