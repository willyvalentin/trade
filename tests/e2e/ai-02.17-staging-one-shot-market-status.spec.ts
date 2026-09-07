import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  ai02StagingOneShotSource,
  getAi02StagingOneShotMarketStatus,
  resolveAutomationMarketStatus,
} from "../../lib/ai-02-staging-one-shot-market-status";
import type { MarketStatus } from "../../lib/market-calendar";

const sourceRequest = {
  source: ai02StagingOneShotSource,
  providerBudgetRequested: true,
};
const repositoryRoot = path.resolve(__dirname, "../..");

test("AI-02.17 uses the verified static calendar without a default cold-cache lookup", async () => {
  let defaultCalendarCalls = 0;
  const status = await resolveAutomationMarketStatus({
    now: new Date("2026-09-08T14:00:00.000Z"),
    ...sourceRequest,
    getDefaultMarketStatus: async () => {
      defaultCalendarCalls += 1;
      throw new Error("default calendar must not run for AI-02.17");
    },
  });

  expect(defaultCalendarCalls).toBe(0);
  expect(status).toEqual({
    isOpenDay: true,
    reason: "Verified US-equity regular session.",
    date: "2026-09-08",
    dayType: "trading_day",
    marketOpenTime: "09:30",
    marketCloseTime: "16:00",
    provider: "verified_us_equity_market_calendar",
    fromCache: false,
  });
});

test("AI-02.17 fails closed from the same local calendar on a verified holiday", async () => {
  let defaultCalendarCalls = 0;
  const status = await resolveAutomationMarketStatus({
    now: new Date("2026-09-07T14:00:00.000Z"),
    ...sourceRequest,
    getDefaultMarketStatus: async () => {
      defaultCalendarCalls += 1;
      throw new Error("default calendar must not run for AI-02.17");
    },
  });

  expect(defaultCalendarCalls).toBe(0);
  expect(status).toMatchObject({
    isOpenDay: false,
    date: "2026-09-07",
    dayType: "holiday",
    marketOpenTime: null,
    marketCloseTime: null,
    provider: "verified_us_equity_market_calendar",
  });
});

test("AI-02.17 preserves a verified early-close market window without a default lookup", async () => {
  let defaultCalendarCalls = 0;
  const status = await resolveAutomationMarketStatus({
    now: new Date("2026-11-27T15:00:00.000Z"),
    ...sourceRequest,
    getDefaultMarketStatus: async () => {
      defaultCalendarCalls += 1;
      throw new Error("default calendar must not run for AI-02.17");
    },
  });

  expect(defaultCalendarCalls).toBe(0);
  expect(status).toMatchObject({
    isOpenDay: true,
    date: "2026-11-27",
    dayType: "early_close",
    marketOpenTime: "09:30",
    marketCloseTime: "13:00",
    provider: "verified_us_equity_market_calendar",
  });
});

test("ordinary automation requests keep the existing calendar lookup", async () => {
  const defaultStatus: MarketStatus = {
    isOpenDay: true,
    reason: "Existing calendar result",
    date: "2026-09-08",
    dayType: "trading_day",
    marketOpenTime: "09:30",
    marketCloseTime: "16:00",
    provider: "polygon",
    fromCache: false,
  };
  let defaultCalendarCalls = 0;

  const status = await resolveAutomationMarketStatus({
    now: new Date("2026-09-08T14:00:00.000Z"),
    source: "automation_route",
    providerBudgetRequested: false,
    getDefaultMarketStatus: async () => {
      defaultCalendarCalls += 1;
      return defaultStatus;
    },
  });

  expect(defaultCalendarCalls).toBe(1);
  expect(status).toBe(defaultStatus);
});

test("the AI-02 static status is not available without both exact request bindings", () => {
  const now = new Date("2026-09-08T14:00:00.000Z");

  expect(
    getAi02StagingOneShotMarketStatus({
      now,
      source: ai02StagingOneShotSource,
      providerBudgetRequested: false,
    }),
  ).toBeNull();
  expect(
    getAi02StagingOneShotMarketStatus({
      now,
      source: "automation_route",
      providerBudgetRequested: true,
    }),
  ).toBeNull();
});

test("the automation route uses the bounded resolver before its normal calendar lookup", async () => {
  const route = await readFile(
    path.join(repositoryRoot, "app/api/automation/run-scan/route.ts"),
    "utf8",
  );

  expect(route).toContain('from "@/lib/ai-02-staging-one-shot-market-status"');
  expect(route).toContain("const marketStatus = await resolveAutomationMarketStatus({");
  expect(route).toContain("providerBudgetRequested:");
  expect(route).toContain("getDefaultMarketStatus: getUsMarketStatus");
  expect(route).not.toContain("const marketStatus = await getUsMarketStatus();");
});
