import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const functionPath = "netlify/functions/scheduled-outcome-evaluation.ts";
const routePath = "app/api/recommendations/evaluate-outcomes/route.ts";
const scheduledScanPath = "netlify/functions/scheduled-scan.ts";
const action550Path = "app/trade-app.tsx";

function read(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function horizonElapsedAt(scanTimestamp: string, minutes: number) {
  return new Date(new Date(scanTimestamp).getTime() + minutes * 60 * 1000)
    .toISOString();
}

test.describe("Action 552 official outcome evaluator schedule verification", () => {
  test("production schedule has a dedicated official outcome evaluator wrapper", () => {
    const source = read(functionPath);

    expect(source).toContain("export const config");
    expect(source).toContain('schedule: "*/15 14-21 * * 1-5"');
    expect(source).toContain('const outcomeEvaluationRoute = "/api/recommendations/evaluate-outcomes"');
    expect(source).toContain('"x-automation-secret": automationSecret');
    expect(source).toContain('mode: "official_live_today"');
    expect(source).toContain('const officialIntradayHorizons = ["15m", "30m", "60m"] as const');
    expect(source).toContain("scheduled_outcome_evaluation_attempt_fingerprint");
    expect(source).not.toContain("/api/automation/run-scan");
  });

  test("existing scheduled scan remains scan-only and does not call the outcome evaluator", () => {
    const source = read(scheduledScanPath);

    expect(source).toContain('schedule: "*/15 13-19 * * 1-5"');
    expect(source).toContain("/api/automation/run-scan");
    expect(source).not.toContain("/api/recommendations/evaluate-outcomes");
  });

  test("official route requires automation auth and defaults to explicit intraday horizons", () => {
    const source = read(routePath);

    expect(source).toContain("const expectedSecret = process.env.AUTOMATION_SECRET");
    expect(source).toContain('request.headers.get("x-automation-secret")');
    expect(source).toContain('return ["15m", "30m", "60m"]');
    expect(source).toContain('item !== "unknown"');
    expect(source).toContain('item !== "next_open"');
    expect(source).toContain("mode === \"official_live_today\"");
    expect(source).toContain("persistRecommendationOutcome(outcome");
  });

  test("July 20 morning horizons were elapsed before the scheduled outcome window", () => {
    const scanTimestamp = "2026-07-20T13:49:29.581Z";

    expect(horizonElapsedAt(scanTimestamp, 15)).toBe("2026-07-20T14:04:29.581Z");
    expect(horizonElapsedAt(scanTimestamp, 30)).toBe("2026-07-20T14:19:29.581Z");
    expect(horizonElapsedAt(scanTimestamp, 60)).toBe("2026-07-20T14:49:29.581Z");

    const scheduledTicks = [
      "2026-07-20T14:15:00.000Z",
      "2026-07-20T14:30:00.000Z",
      "2026-07-20T15:00:00.000Z",
    ];

    expect(new Date(scheduledTicks[0]).getTime()).toBeGreaterThan(
      new Date(horizonElapsedAt(scanTimestamp, 15)).getTime(),
    );
    expect(new Date(scheduledTicks[1]).getTime()).toBeGreaterThan(
      new Date(horizonElapsedAt(scanTimestamp, 30)).getTime(),
    );
    expect(new Date(scheduledTicks[2]).getTime()).toBeGreaterThan(
      new Date(horizonElapsedAt(scanTimestamp, 60)).getTime(),
    );
  });

  test("UI placeholder guard remains in place and is separate from official scheduled evaluation", () => {
    const source = read(action550Path);

    expect(source).toContain("function isSnapshotOnlyUnknownHorizonOutcome");
    expect(source).toContain('outcome.horizon === "unknown"');
    expect(source).toContain('outcome.source === "snapshot_only"');
    expect(source).toContain('outcome.data_completeness === "none"');
    expect(source).toContain("const persistableOutcomes = pendingOutcomes.filter");
  });

  test("schedule fix has no ranking scanner execution provider or trade side effects", () => {
    const source = read(functionPath);

    expect(source).not.toContain("/api/automation/run-scan");
    expect(source).not.toContain("run-scan");
    expect(source).not.toContain("broker");
    expect(source).not.toContain("execution");
    expect(source).not.toContain("Add Trade");
    expect(source).not.toContain("placeOrder");
    expect(source).not.toContain("persistRecommendationSnapshot");
    expect(source).not.toContain("persistTrade");
  });
});
