import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { buildRecommendationScanRun } from "@/lib/recommendation-scan-run";
import { buildRecommendationScanRunHistorySummary } from "@/lib/recommendation-scan-run-history";

const repositoryRoot = path.resolve(__dirname, "../..");

function scanRun(observedAt: string, status: "completed" | "empty" | "failed") {
  return {
    ...buildRecommendationScanRun({
      observed_at: observedAt,
      visible_recommendations: status === "completed" ? [{ ticker: "TURE" }] : [],
    }),
    status,
    scan_observability_status: "healthy",
  };
}

test.describe("MVP-05 scan recovery visibility", () => {
  test("keeps the last clean scan visible after a later failed attempt", () => {
    const summary = buildRecommendationScanRunHistorySummary({
      scan_runs: [
        scanRun("2026-09-10T13:00:00.000Z", "completed"),
        scanRun("2026-09-10T14:00:00.000Z", "empty"),
        scanRun("2026-09-10T15:00:00.000Z", "failed"),
      ],
      now: "2026-09-10T15:05:00.000Z",
    });

    expect(summary).toMatchObject({
      latest_run_status: "failed",
      latest_run_recovery_state: "review_required",
      last_successful_run_status: "empty",
      last_successful_run_timestamp: "2026-09-10T14:00:00.000Z",
    });
  });

  test("treats a clean no-trade run as successful without calling it a trade signal", () => {
    const summary = buildRecommendationScanRunHistorySummary({
      scan_runs: [scanRun("2026-09-10T14:00:00.000Z", "empty")],
      now: "2026-09-10T14:05:00.000Z",
    });

    expect(summary).toMatchObject({
      latest_run_status: "empty",
      latest_run_recovery_state: "not_required",
      last_successful_run_status: "empty",
      last_successful_run_timestamp: "2026-09-10T14:00:00.000Z",
    });
  });

  test("never treats an unobserved empty result as a clean recovery point", () => {
    const summary = buildRecommendationScanRunHistorySummary({
      scan_runs: [
        scanRun("2026-09-10T13:00:00.000Z", "completed"),
        {
          ...scanRun("2026-09-10T14:00:00.000Z", "empty"),
          scan_observability_status: "unknown",
        },
      ],
      now: "2026-09-10T14:05:00.000Z",
    });

    expect(summary).toMatchObject({
      latest_run_status: "empty",
      latest_run_recovery_state: "review_required",
      last_successful_run_status: "completed",
      last_successful_run_timestamp: "2026-09-10T13:00:00.000Z",
    });
  });

  test("renders the distinct last-successful and recovery labels in scan history", async () => {
    const appSource = await readFile(
      path.join(repositoryRoot, "app/trade-app.tsx"),
      "utf8",
    );

    expect(appSource).toContain('label="Last Successful Scan"');
    expect(appSource).toContain("Latest scan needs review");
    expect(appSource).toContain("data-last-successful-run-timestamp");
    expect(appSource).toContain("Refreshing this dashboard reads the latest stored state");
  });
});
