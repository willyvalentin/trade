import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  buildContinuousIntelligenceShadowCanaryUsageAccounting,
  continuousIntelligenceShadowCanaryUsageAccountingMaximumHistoricalDays,
  continuousIntelligenceShadowCanaryUsageAccountingRoutePath,
  resolveContinuousIntelligenceShadowCanaryUsageAccountingDate,
} from "../../lib/continuous-intelligence-shadow-canary-usage-accounting";

const routePath = "app/api/automation/continuous-intelligence/shadow-collector/canary/usage-accounting/route.ts";
const now = new Date("2026-07-23T15:00:00.000Z");

function read(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

test("Action 607 defaults to the current canonical UTC day and accepts the bounded Action 604 day", () => {
  expect(resolveContinuousIntelligenceShadowCanaryUsageAccountingDate({ now })).toEqual({
    ok: true,
    utc_day: "2026-07-23",
    start: "2026-07-23T00:00:00.000Z",
    end: "2026-07-24T00:00:00.000Z",
  });
  expect(resolveContinuousIntelligenceShadowCanaryUsageAccountingDate({
    requested_utc_date: "2026-07-22",
    now,
  })).toMatchObject({ ok: true, utc_day: "2026-07-22" });
});

test("Action 607 rejects malformed, future, and excessive historical UTC dates", () => {
  for (const requested_utc_date of ["2026-7-22", "2026-07-22T00:00:00Z", "2026-02-30", "22-07-2026", ""]) {
    expect(resolveContinuousIntelligenceShadowCanaryUsageAccountingDate({ requested_utc_date, now })).toEqual({
      ok: false,
      category: "invalid_utc_date",
    });
  }
  expect(resolveContinuousIntelligenceShadowCanaryUsageAccountingDate({
    requested_utc_date: "2026-07-24",
    now,
  })).toEqual({ ok: false, category: "future_utc_date" });
  expect(continuousIntelligenceShadowCanaryUsageAccountingMaximumHistoricalDays).toBe(31);
  expect(resolveContinuousIntelligenceShadowCanaryUsageAccountingDate({
    requested_utc_date: "2026-06-22",
    now,
  })).toMatchObject({ ok: true, utc_day: "2026-06-22" });
  expect(resolveContinuousIntelligenceShadowCanaryUsageAccountingDate({
    requested_utc_date: "2026-06-21",
    now,
  })).toEqual({ ok: false, category: "historical_range_exceeded" });
});

test("Action 607 reads the Action 604 day without conflating manual and scheduled credits", () => {
  expect(buildContinuousIntelligenceShadowCanaryUsageAccounting({
    utc_day: "2026-07-22",
    ledger_rows: [
      { entry_kind: "bounded_manual_proof", generated_at: "2026-07-22T16:00:00.000Z", provider_estimated_credits: 1 },
    ],
    claim_rows: [
      { utc_day: "2026-07-22", estimated_credits: 1, status: "completed" },
    ],
  })).toEqual({
    status: "available",
    scope: "utc_day",
    queried_utc_date: "2026-07-22",
    scheduled_shadow_collector_canary: { attempts: 0, estimated_credits: 0 },
    bounded_manual_proof: { attempts: 1, estimated_credits: 1 },
    total_ledger: { attempts: 1, estimated_credits: 1 },
    claim_capacity: { attempts: 1, estimated_credits: 1 },
  });
});

test("Action 607 route is authenticated, read-only, and preserves scheduled-cap semantics", () => {
  const route = read(routePath);
  expect(continuousIntelligenceShadowCanaryUsageAccountingRoutePath).toBe(
    "/api/automation/continuous-intelligence/shadow-collector/canary/usage-accounting",
  );
  expect(route).toContain("export async function GET");
  expect(route).toContain("x-automation-secret");
  expect(route).toContain("utc_date");
  expect(route).toContain("resolveContinuousIntelligenceShadowCanaryUsageAccountingDate");
  expect(route).toContain('"Cache-Control": "no-store"');
  for (const forbidden of [".insert(", ".update(", ".delete(", "getIntradayCandlesWithDiagnostics", "executeContinuousIntelligenceShadowCanary"]) {
    expect(route).not.toContain(forbidden);
  }
});
