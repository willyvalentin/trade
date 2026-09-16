import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

function read(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

test("scheduled Basic Free route records a reference-only receipt before the normal generation path", () => {
  const route = read("app/api/automation/run-scan/route.ts");
  const scanLog = read("lib/scan-log-core.ts");
  const app = read("app/trade-app.tsx");
  const discovery = read("lib/basic-free-discovery.ts");
  const readback = read("lib/basic-free-discovery-readback.ts");
  const catalogPlan = read("lib/basic-free-catalog-collection-plan.ts");

  expect(route).toContain('scheduledRuntimeConfig.provider_plan_profile_mode === "free"');
  expect(route).toContain("observeBasicFreeDiscoveryBetweenPublicationWindows");
  expect(route).toContain("basic_free_discovery: basicFreeDiscovery");
  expect(route).toContain("outside_official_window_basic_catalog_observation_only");
  expect(route).toContain("recommendations_created: 0");
  expect(route).toContain("basic_free_discovery: scanLog?.basic_free_discovery ?? null");
  expect(scanLog).toContain("basic_free_discovery?: Record<string, unknown> | null");
  expect(app).toContain("Basic Free Catalog Observation");
  expect(app).toContain("Complete catalog capacity");
  expect(discovery).toContain("discovery_feed_allowed: false");
  expect(readback).toContain("catalog_collection_plan");
  expect(readback).toContain("buildBasicFreeCatalogCollectionPlan");
  expect(catalogPlan).toContain('execution_authority: "not_admitted"');
  expect(catalogPlan).toContain("discovery_feed_allowed: false");
  expect(catalogPlan).not.toContain("fetch(");
});
