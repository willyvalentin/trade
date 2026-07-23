import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  buildContinuousIntelligenceShadowCanaryLifecycleIdentity,
  buildContinuousIntelligenceShadowCanaryPreflight,
  continuousIntelligenceShadowCollectorCanaryLimits,
} from "../../lib/continuous-intelligence-shadow-collector-canary";
import { buildContinuousIntelligenceShadowCanaryUsageAccounting } from "../../lib/continuous-intelligence-shadow-canary-usage-accounting";
import { buildUsEquityMarketCalendarEvaluation } from "../../lib/us-equity-market-calendar";

const scheduledFunctionPath = "netlify/functions/scheduled-shadow-collector-canary.ts";
const scheduledRoutePath = "app/api/automation/continuous-intelligence/shadow-collector/canary/route.ts";
const rolloutPlanPath = "docs/action-618-controlled-scheduled-shadow-rollout-plan.md";

function read(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function preflight(overrides: Partial<Parameters<typeof buildContinuousIntelligenceShadowCanaryPreflight>[0]> = {}) {
  const now = new Date("2026-07-23T15:15:00.000Z");
  return buildContinuousIntelligenceShadowCanaryPreflight({
    now,
    calendar: buildUsEquityMarketCalendarEvaluation(now),
    enabled_flag: "true",
    kill_switch: "false",
    provider_configured: true,
    provider_metadata_status: "within_budget",
    daily_usage: { status: "available", run_count: 0, estimated_credits: 0 },
    ...overrides,
  });
}

test("Action 618 retains the disabled and kill-switch baseline before provider work", () => {
  expect(preflight({ enabled_flag: "false" }).blockers).toContain("canary_disabled");
  expect(preflight({ kill_switch: "true" }).blockers).toContain("canary_kill_switch_active");
  expect(preflight({
    daily_usage: { status: "persistence_failed", run_count: null, estimated_credits: null },
  })).toMatchObject({
    eligible: false,
    blockers: expect.arrayContaining(["daily_usage_unavailable"]),
  });
  expect(continuousIntelligenceShadowCollectorCanaryLimits).toMatchObject({
    max_tickers_per_run: 1,
    max_provider_requests_per_run: 1,
    max_estimated_credits_per_run: 1,
    max_runs_per_utc_day: 2,
    max_estimated_credits_per_utc_day: 2,
    reserve_credits: 0,
    automatic_retries: 0,
  });
});

test("Action 618 preserves scheduled occurrence retry idempotency and separates windows", () => {
  const first = preflight();
  const repeat = buildContinuousIntelligenceShadowCanaryLifecycleIdentity({
    preflight: first,
    now: new Date("2026-07-23T15:15:00.000Z"),
  });
  const sameOccurrence = buildContinuousIntelligenceShadowCanaryLifecycleIdentity({
    preflight: first,
    now: new Date("2026-07-23T15:20:00.000Z"),
  });
  const laterNow = new Date("2026-07-23T15:45:00.000Z");
  const later = buildContinuousIntelligenceShadowCanaryLifecycleIdentity({
    preflight: buildContinuousIntelligenceShadowCanaryPreflight({
      now: laterNow,
      calendar: buildUsEquityMarketCalendarEvaluation(laterNow),
      enabled_flag: "true",
      kill_switch: "false",
      provider_configured: true,
      provider_metadata_status: "within_budget",
      daily_usage: { status: "available", run_count: 0, estimated_credits: 0 },
    }),
    now: laterNow,
  });
  expect(repeat).not.toBeNull();
  expect(sameOccurrence).toEqual(repeat);
  expect(later).not.toBeNull();
  expect(later?.execution_id).not.toBe(repeat?.execution_id);
  expect(later?.claim_id).not.toBe(repeat?.claim_id);
});

test("Action 618 keeps scheduled and manual usage separate without reserve use", () => {
  expect(buildContinuousIntelligenceShadowCanaryUsageAccounting({
    utc_day: "2026-07-23",
    ledger_rows: [
      { entry_kind: "bounded_manual_proof", generated_at: "2026-07-23T14:00:00.000Z", provider_estimated_credits: 1 },
      { entry_kind: "scheduled_shadow_collector_canary", generated_at: "2026-07-23T15:00:00.000Z", provider_estimated_credits: 1 },
    ],
    claim_rows: [
      { utc_day: "2026-07-23", estimated_credits: 1, status: "completed" },
      { utc_day: "2026-07-23", estimated_credits: 1, status: "failed" },
    ],
  })).toMatchObject({
    status: "available",
    scheduled_shadow_collector_canary: { attempts: 1, estimated_credits: 1 },
    bounded_manual_proof: { attempts: 1, estimated_credits: 1 },
    total_ledger: { attempts: 2, estimated_credits: 2 },
    claim_capacity: { attempts: 2, estimated_credits: 2 },
  });
});

test("Action 618 records the scheduled-only activation gaps instead of activating the foundation", () => {
  const scheduledFunction = read(scheduledFunctionPath);
  const route = read(scheduledRoutePath);
  const plan = read(rolloutPlanPath);
  expect(scheduledFunction).not.toContain("schedule:");
  expect(scheduledFunction).not.toContain("cron");
  expect(route).toContain("x-automation-secret");
  expect(route).toContain("scheduled_shadow_collector_canary");
  expect(plan).toContain("Stage 1: Authenticated Schedule Reachability");
  expect(plan).toContain("schedule_dry_reachability_only");
  expect(plan).toContain("Deployment-bound occurrence identity");
  expect(plan).toContain("Persistence-stop behavior");
  expect(plan).toContain("Action 619");
});
