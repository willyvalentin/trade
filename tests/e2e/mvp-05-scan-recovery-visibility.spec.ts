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
      review_required_run_count: 1,
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
      review_required_run_count: 0,
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
      review_required_run_count: 1,
    });
  });

  test("never treats a provider-warning result as a clean recovery point", () => {
    const summary = buildRecommendationScanRunHistorySummary({
      scan_runs: [
        scanRun("2026-09-10T13:00:00.000Z", "completed"),
        {
          ...scanRun("2026-09-10T14:00:00.000Z", "empty"),
          provider_statuses: [
            {
              source_id: "licensed-feed",
              label: "Licensed feed",
              status: "unavailable",
              message: "The provider did not return a current result.",
            },
          ],
        },
      ],
      now: "2026-09-10T14:05:00.000Z",
    });

    expect(summary).toMatchObject({
      latest_run_status: "empty",
      latest_run_recovery_state: "review_required",
      last_successful_run_status: "completed",
      last_successful_run_timestamp: "2026-09-10T13:00:00.000Z",
      review_required_run_count: 1,
    });
  });

  test("does not count a clean no-trade result as needing recovery review", () => {
    const summary = buildRecommendationScanRunHistorySummary({
      scan_runs: [
        scanRun("2026-09-10T13:00:00.000Z", "empty"),
        scanRun("2026-09-10T14:00:00.000Z", "failed"),
      ],
      now: "2026-09-10T14:05:00.000Z",
    });

    expect(summary).toMatchObject({
      review_required_run_count: 1,
      review_required_run_rate: 50,
      latest_run_recovery_state: "review_required",
    });
    expect(summary.metrics).toContainEqual({
      metric_id: "review_required_runs",
      label: "Runs needing review",
      value: 1,
      formatted_value: "1",
    });
    expect(summary.warnings).toContainEqual(
      expect.objectContaining({ warning_id: "scan_runs_need_review" }),
    );
  });

  test("renders the distinct last-successful and recovery labels in scan history", async () => {
    const appSource = await readFile(
      path.join(repositoryRoot, "app/trade-app.tsx"),
      "utf8",
    );

    expect(appSource).toContain('label="Last Successful Scan"');
    expect(appSource).toContain('label="Runs Needing Review"');
    expect(appSource).toContain("summary.review_required_run_count");
    expect(appSource).toContain("Latest scan needs review");
    expect(appSource).toContain("data-last-successful-run-timestamp");
    expect(appSource).toContain("Refreshing this dashboard reads the latest stored state");
  });
});
