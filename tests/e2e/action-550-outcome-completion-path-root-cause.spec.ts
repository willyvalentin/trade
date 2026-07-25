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
import { hasBetterOutcomeCoverage } from "../../lib/recommendation-outcome-coverage";
import { buildRecommendationSnapshot } from "../../lib/recommendation-snapshot";

function action550Snapshot() {
  return buildRecommendationSnapshot({
    recommendation_id: "rec_action_550_aapl",
    scan_run_id: "rec_scan_action_550",
    ticker: "AAPL",
    recommended_at: "2026-07-17T13:45:00.000Z",
    app_timestamp: "2026-07-17T13:45:00.000Z",
    window: "morning",
    entry: 100,
    stop: 98,
    target: 104,
    side: "long",
    confidence: 82,
    score: 82,
    rating: "valid",
    label: "valid",
    type: "PULLBACK_CONTINUATION",
    payload: {
      setup_type: "PULLBACK_CONTINUATION",
      recommendation_tier: "valid",
      scan_window: "morning",
    },
  });
}

function action550Candles(): RecommendationOutcomeCandle[] {
  return [
    {
      timestamp: "2026-07-17T13:45:00.000Z",
      open: 100,
      high: 100.5,
      low: 99.5,
      close: 100.2,
    },
    {
      timestamp: "2026-07-17T13:50:00.000Z",
      open: 100.2,
      high: 104.5,
      low: 100,
      close: 104.2,
    },
    {
      timestamp: "2026-07-17T14:05:00.000Z",
      open: 104.2,
      high: 104.8,
      low: 103.9,
      close: 104.4,
    },
    {
      timestamp: "2026-07-17T14:30:00.000Z",
      open: 104.4,
      high: 105,
      low: 104,
      close: 104.7,
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

test.describe("Action 550 outcome completion path root-cause investigation", () => {
  test("UI snapshot-only unknown-horizon placeholders have no browser durable persistence path", () => {
    const source = readFileSync(
      resolve(process.cwd(), "app/trade-app.tsx"),
      "utf8",
    );

    expect(source).not.toContain('from "@/lib/supabase"');
    expect(source).not.toContain("persistRecommendationOutcome(");
    expect(source).not.toContain("readRecommendationOutcomesFromLocalStorage(");
    expect(source).toContain('fetch("/api/recommendations/evaluate-outcomes"');
  });

  test("reproduces the production placeholder signature without candle evaluation", () => {
    const snapshot = action550Snapshot();
    const { outcome } = computeRecommendationOutcome({
      snapshot,
      horizon: "unknown",
      evaluated_at: "2026-07-17T22:46:38.857Z",
      source: "snapshot_only",
      provider: null,
      data_completeness: "none",
    });

    expect(outcome.snapshot_id).toBe(snapshot.id);
    expect(outcome.snapshot_fingerprint).toBe(snapshot.snapshot_fingerprint);
    expect(outcome.recommendation_id).toBe(snapshot.recommendation_id);
    expect(outcome.horizon).toBe("unknown");
    expect(outcome.source).toBe("snapshot_only");
    expect(outcome.data_completeness).toBe("none");
    expect(outcome.status).toBe("incomplete");
    expect(outcome.entry_triggered).toBeNull();
    expect(outcome.target_hit).toBeNull();
    expect(outcome.stop_hit).toBeNull();
  });

  test("official evaluation persists explicit horizons when candles are available", async () => {
    const snapshot = action550Snapshot();
    const persisted: RecommendationOutcome[] = [];

    const run = await runRecommendationOutcomeEvaluation({
      snapshots: [snapshot],
      existingOutcomes: [],
      horizons: ["15m", "30m", "60m"],
      now: "2026-07-17T15:00:00.000Z",
      source: "api",
      provider: "fixture",
      maxSnapshots: 1,
      fetchCandles: async (request) => ({
        request,
        status: "available",
        candles: action550Candles(),
        provider: "fixture",
        error: null,
        warnings: [],
      }),
      persistOutcome: async (outcome) => {
        persisted.push(outcome);
        return savedResult(outcome);
      },
    });

    expect(run.status).toBe("completed");
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
      persisted.every((outcome) => outcome.data_completeness === "complete"),
    ).toBe(true);
    expect(
      persisted.every(
        (outcome) =>
          outcome.snapshot_id === snapshot.id &&
          outcome.snapshot_fingerprint === snapshot.snapshot_fingerprint &&
          outcome.recommendation_id === snapshot.recommendation_id,
      ),
    ).toBe(true);
  });

  test("missing candles remain incomplete with explicit horizon and retry reason", async () => {
    const snapshot = action550Snapshot();
    const persisted: RecommendationOutcome[] = [];

    await runRecommendationOutcomeEvaluation({
      snapshots: [snapshot],
      existingOutcomes: [],
      horizons: ["15m"],
      now: "2026-07-17T14:30:00.000Z",
      source: "api",
      provider: "fixture",
      maxSnapshots: 1,
      fetchCandles: async (request) => ({
        request,
        status: "missing_candles",
        candles: [],
        provider: "fixture",
        error: "fixture_missing_candles",
        warnings: ["fixture_missing_candles"],
      }),
      persistOutcome: async (outcome) => {
        persisted.push(outcome);
        return savedResult(outcome);
      },
    });

    expect(persisted).toHaveLength(1);
    expect(persisted[0]?.horizon).toBe("15m");
    expect(persisted[0]?.source).toBe("intraday_candles");
    expect(persisted[0]?.data_completeness).toBe("none");
    expect(persisted[0]?.status).toBe("incomplete");
    expect(persisted[0]?.payload_json.pending_reason).toBe("missing_candles");
  });

  test("later explicit completed outcomes can supersede incomplete rows without losing contract identity", () => {
    const snapshot = action550Snapshot();
    const incomplete = computeRecommendationOutcome({
      snapshot,
      horizon: "15m",
      evaluated_at: "2026-07-17T14:00:00.000Z",
      source: "intraday_candles",
      provider: "fixture",
      data_completeness: "none",
      warnings: ["fixture_missing_candles"],
    }).outcome;
    const completed = computeRecommendationOutcome({
      snapshot,
      horizon: "15m",
      evaluated_at: "2026-07-17T14:15:00.000Z",
      source: "intraday_candles",
      provider: "fixture",
      data_completeness: "complete",
      candles: action550Candles(),
    }).outcome;
    const snapshotContract = snapshot.payload_json
      .confidence_projection_observation_contract as Record<string, unknown>;
    const outcomeContract = completed.payload_json
      .confidence_projection_observation_contract as Record<string, unknown>;

    expect(hasBetterOutcomeCoverage(completed, incomplete)).toBe(true);
    expect(completed.horizon).toBe("15m");
    expect(["target_hit", "target_before_stop"]).toContain(completed.status);
    expect(completed.target_hit).toBe(true);
    expect(completed.snapshot_id).toBe(snapshot.id);
    expect(completed.snapshot_fingerprint).toBe(snapshot.snapshot_fingerprint);
    expect(completed.recommendation_id).toBe(snapshot.recommendation_id);
    expect(snapshotContract).toBeTruthy();
    expect(outcomeContract).toBeTruthy();
    expect(JSON.stringify(snapshotContract)).not.toContain("target_hit");
    expect(JSON.stringify(snapshotContract)).not.toContain("stop_hit");
    expect(JSON.stringify(snapshotContract)).not.toContain("completed_success");
    expect(JSON.stringify(outcomeContract)).toContain("completed_success");
  });
});
