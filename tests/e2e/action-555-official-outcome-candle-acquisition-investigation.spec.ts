import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import { runRecommendationOutcomeEvaluation } from "../../lib/recommendation-outcome-evaluation-runner";
import type {
  RecommendationOutcome,
  RecommendationOutcomeCandle,
  RecommendationOutcomePersistenceResult,
} from "../../lib/recommendation-outcome-tracker";
import { buildRecommendationSnapshot } from "../../lib/recommendation-snapshot";

const routePath = "app/api/recommendations/evaluate-outcomes/route.ts";
const scheduledFunctionPath = "netlify/functions/scheduled-outcome-evaluation.ts";

function read(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function action555Snapshot() {
  return buildRecommendationSnapshot({
    recommendation_id: "rec_action_555_aapl",
    scan_run_id: "rec_scan_action_555",
    ticker: "AAPL",
    recommended_at: "2026-07-20T16:45:41.799Z",
    app_timestamp: "2026-07-20T16:45:41.799Z",
    window: "midday",
    entry: 324.41,
    stop: 311.43,
    target: 351.98,
    side: "long",
    confidence: 82,
    score: 82,
    rating: "valid",
    label: "valid",
    type: "MOMENTUM_CONTINUATION",
    payload: {
      setup_type: "MOMENTUM_CONTINUATION",
      recommendation_tier: "valid",
      scan_window: "midday",
      reference_price_used_for_plan: 324.41,
      reference_price_used_for_plan_at: "2026-07-20T16:45:41.158Z",
      reference_price_source: "provider_intraday_reference_refresh",
      reference_price_provider: "twelve_data",
    },
  });
}

function action555Candles(): RecommendationOutcomeCandle[] {
  return [
    {
      timestamp: "2026-07-20T16:50:00.000Z",
      open: 324.82,
      high: 324.84,
      low: 324,
      close: 324.2,
      volume: 85328,
    },
    {
      timestamp: "2026-07-20T16:55:00.000Z",
      open: 324.26,
      high: 324.63,
      low: 324.13,
      close: 324.25,
      volume: 43436,
    },
    {
      timestamp: "2026-07-20T17:00:00.000Z",
      open: 324.275,
      high: 324.54,
      low: 324.13,
      close: 324.25,
      volume: 66888,
    },
    {
      timestamp: "2026-07-20T17:05:00.000Z",
      open: 324.2,
      high: 324.755,
      low: 323.91,
      close: 324.54,
      volume: 50436,
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

test("complete horizon prices measure positive, negative and flat R without the future boundary bar", async () => {
  const snapshot = action555Snapshot();
  const start = Date.parse("2026-07-20T16:50:00Z");
  for (const move of [2, -2, 0]) {
    const candles = Array.from({ length: 13 }, (_, i) => ({
      timestamp: new Date(start + i * 300000).toISOString(), open: snapshot.entry!,
      high: snapshot.entry! + 5, low: snapshot.entry! - 5,
      close: snapshot.entry! + (i === 11 ? move : i === 12 ? 4 : 0), volume: 1000,
    }));
    let requests = 0;
    const run = await runRecommendationOutcomeEvaluation({ snapshots: [snapshot], existingOutcomes: [],
      horizons: ["60m"], now: "2026-07-20T18:05:00Z", maxCandleRequests: 1,
      fetchCandles: async request => { requests += 1; return { request, candles: [...candles].reverse(),
        status: "available", provider: "twelve_data", error: null, warnings: [] }; }, persistOutcome: async outcome => savedResult(outcome) });
    expect(requests).toBe(1);
    const outcome = run.outcomes[0];
    expect(outcome.status).toBe("neither_hit");
    expect(outcome.current_price).toBe(snapshot.entry! + move);
    expect(outcome.current_r).toBeCloseTo(move / (snapshot.entry! - snapshot.stop!));
    expect(outcome.payload_json.canonical_horizon_price_mark).toMatchObject({
      contract_version: "canonical_horizon_price_mark_v1", status: "available",
      price: snapshot.entry! + move, candle_started_at: "2026-07-20T17:45:00.000Z",
      marked_at: "2026-07-20T17:50:00.000Z", horizon: "60m", source: "original_horizon_candle_close",
    });
  }
});

test("a target touched only by the post-horizon candle cannot resolve the original horizon", async () => {
  const snapshot = action555Snapshot();
  const start = Date.parse("2026-07-20T16:50:00Z");
  const candles = Array.from({ length: 13 }, (_, i) => ({
    timestamp: new Date(start + i * 300000).toISOString(), open: snapshot.entry!,
    high: i === 12 ? snapshot.target! + 1 : snapshot.entry! + 1,
    low: snapshot.entry! - 1, close: snapshot.entry!, volume: 1000,
  }));
  const run = await runRecommendationOutcomeEvaluation({ snapshots: [snapshot], existingOutcomes: [],
    horizons: ["60m"], now: "2026-07-20T18:05:00Z", maxCandleRequests: 1,
    fetchCandles: async request => ({ request, candles, status: "available", provider: "twelve_data",
      error: null, warnings: [] }), persistOutcome: async outcome => savedResult(outcome) });
  expect(run.outcomes[0].status).toBe("neither_hit");
  expect(run.outcomes[0].target_hit).toBe(false);
  expect(run.outcomes[0].payload_json.retained_candle_count).toBe(12);
});

test("missing, duplicated, unclosed and incoherent horizon candles never manufacture measured R", async () => {
  const snapshot = action555Snapshot();
  const start = Date.parse("2026-07-20T16:50:00Z");
  const complete = Array.from({ length: 12 }, (_, i) => ({
    timestamp: new Date(start + i * 300000).toISOString(), open: snapshot.entry!,
    high: snapshot.entry! + 5, low: snapshot.entry! - 5, close: snapshot.entry! + 1, volume: 1000,
  }));
  for (const [fault, candles] of [
    ["missing_last", complete.slice(0, 11)], ["missing_middle", complete.filter((_, i) => i !== 5)],
    ["duplicate", [...complete, complete[11]]],
    ["unclosed", complete],
    ["negative", complete.map((bar, i) => i === 11 ? { ...bar, close: -1 } : bar)],
    ["incoherent", complete.map((bar, i) => i === 11 ? { ...bar, close: bar.high + 1 } : bar)],
  ] as const) {
    const run = await runRecommendationOutcomeEvaluation({ snapshots: [snapshot], existingOutcomes: [],
      horizons: ["60m"], now: fault === "unclosed" ? "2026-07-20T17:49:00Z" : "2026-07-20T18:05:00Z",
      maxCandleRequests: 1, fetchCandles: async request => ({ request, candles: [...candles], status: "available",
        provider: "twelve_data", error: null, warnings: [] }), persistOutcome: async outcome => savedResult(outcome) });
    expect(run.candle_requests_executed, fault).toBe(1);
    expect(run.outcomes[0].current_price, fault).toBeNull();
    expect(run.outcomes[0].current_r, fault).toBeNull();
    expect(run.outcomes[0].payload_json.canonical_horizon_price_mark, fault).toMatchObject({ status: "unavailable", price: null });
  }
});

test("one acquired response supplies only each original fully closed 15/30/60m mark", async () => {
  const snapshot = action555Snapshot();
  const start = Date.parse("2026-07-20T16:50:00Z");
  const candles = Array.from({ length: 13 }, (_, i) => ({
    timestamp: new Date(start + i * 300000).toISOString(), open: snapshot.entry!,
    high: snapshot.entry! + 5, low: snapshot.entry! - 5, close: snapshot.entry! + i / 10, volume: 1000,
  }));
  const run = await runRecommendationOutcomeEvaluation({ snapshots: [snapshot], existingOutcomes: [],
    horizons: ["15m", "30m", "60m"], now: "2026-07-20T18:05:00Z", maxCandleRequests: 1,
    fetchCandles: async request => ({ request, candles, status: "available", provider: "twelve_data",
      error: null, warnings: [] }), persistOutcome: async outcome => savedResult(outcome) });
  expect(run.candle_requests_executed).toBe(1);
  expect(run.outcomes.map(outcome => outcome.payload_json.retained_candle_count)).toEqual([3, 6, 12]);
  expect(run.outcomes.map(outcome => outcome.current_price)).toEqual([snapshot.entry! + 0.2, snapshot.entry! + 0.5, snapshot.entry! + 1.1]);
  expect(run.outcomes.map(outcome => (outcome.payload_json.canonical_horizon_price_mark as Record<string, unknown>).marked_at))
    .toEqual(["2026-07-20T17:05:00.000Z", "2026-07-20T17:20:00.000Z", "2026-07-20T17:50:00.000Z"]);
});

test.describe("Action 555 official outcome candle acquisition investigation", () => {
  test("empty provider response attempts one reusable request and keeps explicit horizons", async () => {
    const snapshot = action555Snapshot();
    const persisted: RecommendationOutcome[] = [];

    const run = await runRecommendationOutcomeEvaluation({
      snapshots: [snapshot],
      existingOutcomes: [],
      horizons: ["15m", "30m", "60m"],
      now: "2026-07-20T17:09:49.737Z",
      source: "api",
      provider: "twelve_data",
      maxSnapshots: 1,
      fetchCandles: async (request) => ({
        request,
        status: "missing_candles",
        candles: [],
        provider: "twelve_data",
        error:
          "No data is available on the specified dates. Try setting different start/end dates.",
        warnings: [
          "No data is available on the specified dates. Try setting different start/end dates.",
        ],
        diagnostics: {
          response_status: "empty",
          response_category: "empty_response",
          returned_candle_count: 0,
        },
      }),
      persistOutcome: async (outcome) => {
        persisted.push(outcome);
        return savedResult(outcome);
      },
    });

    expect(run.candle_requests_planned).toBe(1);
    expect(run.candle_requests_executed).toBe(1);
    expect(run.candle_requests_saved_by_reuse).toBe(2);
    expect(run.missing_candle_count).toBe(3);
    expect(persisted).toHaveLength(3);
    expect(persisted.map((outcome) => outcome.horizon)).toEqual([
      "15m",
      "30m",
      "60m",
    ]);
    expect(persisted.every((outcome) => outcome.horizon !== "unknown")).toBe(true);
    expect(
      persisted.every((outcome) => outcome.source === "intraday_candles"),
    ).toBe(true);
    expect(
      persisted.every((outcome) => outcome.data_completeness === "none"),
    ).toBe(true);
    expect(
      persisted.every(
        (outcome) => outcome.payload_json.pending_reason === "missing_candles",
      ),
    ).toBe(true);
  });

  test("later scheduled retry turns explicit incomplete rows into candle-backed outcomes", async () => {
    const snapshot = action555Snapshot();
    const firstRunOutcomes: RecommendationOutcome[] = [];

    await runRecommendationOutcomeEvaluation({
      snapshots: [snapshot],
      existingOutcomes: [],
      horizons: ["15m", "30m", "60m"],
      now: "2026-07-20T17:09:49.737Z",
      source: "api",
      provider: "twelve_data",
      maxSnapshots: 1,
      fetchCandles: async (request) => ({
        request,
        status: "missing_candles",
        candles: [],
        provider: "twelve_data",
        error: "provider_response_empty",
        warnings: ["provider_response_empty"],
      }),
      persistOutcome: async (outcome) => {
        firstRunOutcomes.push(outcome);
        return savedResult(outcome);
      },
    });

    const secondRunOutcomes: RecommendationOutcome[] = [];
    const secondRun = await runRecommendationOutcomeEvaluation({
      snapshots: [snapshot],
      existingOutcomes: firstRunOutcomes,
      horizons: ["15m", "30m", "60m"],
      now: "2026-07-20T17:09:49.737Z",
      source: "api",
      provider: "twelve_data",
      maxSnapshots: 1,
      fetchCandles: async (request) => ({
        request,
        status: "available",
        candles: action555Candles(),
        provider: "twelve_data",
        error: null,
        warnings: [],
        diagnostics: {
          response_status: "available",
          response_category: "available",
          returned_candle_count: 4,
        },
      }),
      persistOutcome: async (outcome) => {
        secondRunOutcomes.push(outcome);
        return savedResult(outcome);
      },
    });

    expect(secondRun.candle_requests_planned).toBe(1);
    expect(secondRun.candle_requests_executed).toBe(1);
    expect(secondRun.status).toBe("completed");
    expect(secondRunOutcomes).toHaveLength(3);
    expect(
      secondRunOutcomes.every(
        (outcome) =>
          outcome.source === "intraday_candles" &&
          outcome.data_completeness === "complete" &&
          outcome.snapshot_fingerprint === snapshot.snapshot_fingerprint,
      ),
    ).toBe(true);
    expect(secondRunOutcomes.map((outcome) => outcome.horizon)).toEqual([
      "15m",
      "30m",
      "60m",
    ]);
    expect(
      secondRunOutcomes.map(
        (outcome) => outcome.payload_json.horizon_filtered_candle_count,
      ),
    // The 17:05 bar closes at 17:10, after the 17:09:49 evaluation clock.
    // It is retained in raw response diagnostics, never in an outcome window.
    ).toEqual([3, 3, 3]);
    expect(
      secondRunOutcomes.every(
        (outcome) =>
          outcome.payload_json.first_horizon_candle_time ===
          "2026-07-20T16:50:00.000Z",
      ),
    ).toBe(true);
    expect(
      secondRunOutcomes.every(
        (outcome) =>
          outcome.payload_json.last_reused_candle_time ===
          "2026-07-20T17:05:00.000Z",
      ),
    ).toBe(true);
  });

  test("request windows preserve UTC/NY safety and do not look ahead past evaluator time", async () => {
    const snapshot = action555Snapshot();
    const capturedRequests: Array<{
      ticker: string;
      interval: string;
      start_at: string;
      end_at: string;
    }> = [];

    await runRecommendationOutcomeEvaluation({
      snapshots: [snapshot],
      existingOutcomes: [],
      horizons: ["15m", "30m", "60m"],
      now: "2026-07-20T17:09:49.737Z",
      source: "api",
      provider: "twelve_data",
      maxSnapshots: 1,
      fetchCandles: async (request) => {
        capturedRequests.push({
          ticker: request.ticker,
          interval: request.interval,
          start_at: request.start_at,
          end_at: request.end_at,
        });

        return {
          request,
          status: "available",
          candles: action555Candles(),
          provider: "twelve_data",
          error: null,
          warnings: [],
        };
      },
    });

    expect(capturedRequests).toEqual([
      {
        ticker: "AAPL",
        interval: "5min",
        start_at: "2026-07-20T16:50:00.000Z",
        end_at: "2026-07-20T17:09:49.737Z",
      },
    ]);
  });

  test("official_live_today now uses same-day batch revisit when no batch fingerprint is supplied", () => {
    const routeSource = read(routePath);
    const scheduledSource = read(scheduledFunctionPath);

    expect(routeSource).toContain(
      "function resolveOfficialLiveMaxBatchesPerRun",
    );
    expect(routeSource).toContain("officialLiveBatchDiscoveryLimit");
    expect(routeSource).toContain("sortBatchesOldestFirst");
    expect(routeSource).toContain("filterOfficialSnapshotsNeedingOutcomeEvaluation");
    expect(routeSource).toContain('snapshotOrder:');
    expect(routeSource).toContain('"input"');
    expect(scheduledSource).toContain('mode: "official_live_today"');
    expect(scheduledSource).toContain("max_batches: 5");
    expect(scheduledSource).not.toContain("batch_fingerprint:");
  });

  test("scheduled candle acquisition has no scanner ranking execution trade or projection side effects", () => {
    const scheduledSource = read(scheduledFunctionPath);

    expect(scheduledSource).toContain("/api/recommendations/evaluate-outcomes");
    expect(scheduledSource).not.toContain("/api/automation/run-scan");
    expect(scheduledSource).not.toContain("broker");
    expect(scheduledSource).not.toContain("placeOrder");
    expect(scheduledSource).not.toContain("persistTrade");
    expect(scheduledSource).not.toContain("confidence_projection");
  });
});
