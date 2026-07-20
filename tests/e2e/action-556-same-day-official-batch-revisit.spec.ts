import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import { runRecommendationOutcomeEvaluation } from "../../lib/recommendation-outcome-evaluation-runner";
import {
  computeRecommendationOutcome,
  type RecommendationOutcome,
  type RecommendationOutcomeCandle,
  type RecommendationOutcomePersistenceResult,
} from "../../lib/recommendation-outcome-tracker";
import {
  buildRecommendationSnapshot,
  type RecommendationSnapshot,
} from "../../lib/recommendation-snapshot";

const routePath = "app/api/recommendations/evaluate-outcomes/route.ts";
const scheduledFunctionPath = "netlify/functions/scheduled-outcome-evaluation.ts";

function read(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function fixtureSnapshot(input: {
  id: string;
  ticker: string;
  recommendedAt: string;
}) {
  return buildRecommendationSnapshot({
    recommendation_id: `rec_${input.id}`,
    scan_run_id: "rec_scan_action_556",
    ticker: input.ticker,
    recommended_at: input.recommendedAt,
    app_timestamp: input.recommendedAt,
    window: "morning",
    entry: 100,
    stop: 96,
    target: 108,
    side: "long",
    confidence: 82,
    score: 82,
    rating: "valid",
    label: "valid",
    type: "MOMENTUM_CONTINUATION",
    payload: {
      batch_type: "official",
      batch_fingerprint: input.id.startsWith("old")
        ? "rec_batch_old"
        : "rec_batch_new",
      recommendation_tier: "valid",
      setup_type: "MOMENTUM_CONTINUATION",
    },
  });
}

function candles(): RecommendationOutcomeCandle[] {
  return [
    {
      timestamp: "2026-07-20T14:00:00.000Z",
      open: 100,
      high: 101,
      low: 99,
      close: 100.5,
      volume: 1000,
    },
    {
      timestamp: "2026-07-20T14:05:00.000Z",
      open: 100.5,
      high: 109,
      low: 100.2,
      close: 108.5,
      volume: 1200,
    },
  ];
}

function savedResult(outcome: RecommendationOutcome): RecommendationOutcomePersistenceResult {
  return {
    status: "saved",
    mode: "supabase",
    outcome,
    error: null,
  };
}

function completedOutcome(snapshot: RecommendationSnapshot) {
  return computeRecommendationOutcome({
    snapshot,
    horizon: "15m",
    evaluated_at: "2026-07-20T14:15:00.000Z",
    source: "intraday_candles",
    provider: "fixture",
    data_completeness: "complete",
    candles: candles(),
  }).outcome;
}

function incompleteOutcome(snapshot: RecommendationSnapshot) {
  return computeRecommendationOutcome({
    snapshot,
    horizon: "15m",
    evaluated_at: "2026-07-20T14:15:00.000Z",
    source: "intraday_candles",
    provider: "fixture",
    data_completeness: "none",
    candles: [],
    warnings: ["No candles available for requested window."],
  }).outcome;
}

test.describe("Action 556 same-day official batch revisit", () => {
  test("runner can preserve oldest-first route order under the snapshot cap", async () => {
    const oldFirst = fixtureSnapshot({
      id: "old_first",
      ticker: "AAPL",
      recommendedAt: "2026-07-20T13:49:29.581Z",
    });
    const oldSecond = fixtureSnapshot({
      id: "old_second",
      ticker: "MSFT",
      recommendedAt: "2026-07-20T13:50:29.581Z",
    });
    const newest = fixtureSnapshot({
      id: "newest",
      ticker: "NVDA",
      recommendedAt: "2026-07-20T16:45:41.799Z",
    });
    const requested: string[] = [];

    const run = await runRecommendationOutcomeEvaluation({
      snapshots: [oldFirst, oldSecond, newest],
      existingOutcomes: [],
      horizons: ["15m"],
      now: "2026-07-20T17:10:00.000Z",
      source: "api",
      provider: "fixture",
      maxSnapshots: 2,
      maxCandleRequests: 2,
      snapshotOrder: "input",
      fetchCandles: async (request) => {
        requested.push(request.snapshot_fingerprint ?? "missing");

        return {
          request,
          status: "available",
          candles: candles(),
          provider: "fixture",
          error: null,
          warnings: [],
        };
      },
    });

    expect(run.eligible_snapshot_count).toBe(2);
    expect(requested).toEqual([
      oldFirst.snapshot_fingerprint,
      oldSecond.snapshot_fingerprint,
    ]);
    expect(requested).not.toContain(newest.snapshot_fingerprint);
  });

  test("completed horizons are skipped while incomplete horizons are revisited idempotently", async () => {
    const completed = fixtureSnapshot({
      id: "old_completed",
      ticker: "AAPL",
      recommendedAt: "2026-07-20T13:49:29.581Z",
    });
    const retryable = fixtureSnapshot({
      id: "old_retryable",
      ticker: "MSFT",
      recommendedAt: "2026-07-20T13:50:29.581Z",
    });
    const persisted: RecommendationOutcome[] = [];

    const run = await runRecommendationOutcomeEvaluation({
      snapshots: [completed, retryable],
      existingOutcomes: [completedOutcome(completed), incompleteOutcome(retryable)],
      horizons: ["15m"],
      now: "2026-07-20T17:10:00.000Z",
      source: "api",
      provider: "fixture",
      maxSnapshots: 2,
      maxCandleRequests: 2,
      snapshotOrder: "input",
      fetchCandles: async (request) => ({
        request,
        status: "available",
        candles: candles(),
        provider: "fixture",
        error: null,
        warnings: [],
      }),
      persistOutcome: async (outcome) => {
        persisted.push(outcome);
        return savedResult(outcome);
      },
    });

    expect(run.candidates.map((candidate) => candidate.status)).toEqual([
      "skipped",
      "evaluated",
    ]);
    expect(persisted).toHaveLength(1);
    expect(persisted[0]?.snapshot_fingerprint).toBe(
      retryable.snapshot_fingerprint,
    );
    expect(persisted[0]?.horizon).toBe("15m");
    expect(persisted[0]?.data_completeness).toBe("complete");
  });

  test("route and schedule expose same-day official batch revisit controls and diagnostics", () => {
    const routeSource = read(routePath);
    const scheduledSource = read(scheduledFunctionPath);

    expect(scheduledSource).toContain("max_batches: 5");
    expect(routeSource).toContain("same_day_official_batch_revisit");
    expect(routeSource).toContain("same_day_official_batches_discovered");
    expect(routeSource).toContain("oldest_pending_batch");
    expect(routeSource).toContain("snapshots_selected_per_batch");
    expect(routeSource).toContain("horizon_rows_missing");
    expect(routeSource).toContain("horizon_rows_incomplete");
    expect(routeSource).toContain("horizon_rows_complete");
    expect(routeSource).toContain("remaining_backlog_after_run");
    expect(routeSource).toContain("provider_requests_used");
  });

  test("same-day official revisit keeps explicit horizons and no placeholder rows", () => {
    const routeSource = read(routePath);

    expect(routeSource).toContain("filterOfficialSnapshotsNeedingOutcomeEvaluation");
    expect(routeSource).toContain('item !== "unknown"');
    expect(routeSource).toContain('item !== "next_open"');
    expect(routeSource).toContain('snapshotOrder:');
    expect(routeSource).toContain('"input"');
    expect(routeSource).not.toContain('horizon: "unknown"');
  });

  test("same-day official revisit has no scanner ranking execution or broker side effects", () => {
    const routeSource = read(routePath);
    const scheduledSource = read(scheduledFunctionPath);

    expect(scheduledSource).not.toContain("/api/automation/run-scan");
    expect(routeSource).not.toContain("placeOrder");
    expect(routeSource).not.toContain("persistTrade");
    expect(routeSource).not.toContain("broker");
    expect(routeSource).not.toContain("executeTrade");
    expect(routeSource).not.toContain("publishRecommendation");
    expect(routeSource).not.toContain("confidenceProjectionPreviewEnabled");
  });
});
