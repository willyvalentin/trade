import { expect, test } from "@playwright/test";

import {
  buildCanonicalOutcomeProviderCoverageReceipt,
  CANONICAL_OUTCOME_PROVIDER_COVERAGE_RECEIPT_VERSION,
} from "@/lib/recommendation-outcome-canonical-coverage";
import { runRecommendationOutcomeEvaluation } from "@/lib/recommendation-outcome-evaluation-runner";
import { hasBetterOutcomeCoverage } from "@/lib/recommendation-outcome-coverage";
import { buildRecommendationSnapshot } from "@/lib/recommendation-snapshot";

const alignedRequest = {
  interval: "5min" as const,
  horizon: "15m" as const,
  start_at: "2026-09-17T14:30:00.000Z",
  end_at: "2026-09-17T14:45:00.000Z",
  decision_timestamp: "2026-09-17T14:30:00.000Z",
  evaluation_anchor_start_at: "2026-09-17T14:30:00.000Z",
  decision_to_anchor_seconds: 0,
  decision_timestamp_interval_aligned: true,
};

const completeCandles = [
  {
    timestamp: "2026-09-17T14:30:00.000Z",
    open: 100,
    high: 101,
    low: 99,
    close: 100.5,
  },
  {
    timestamp: "2026-09-17T14:35:00.000Z",
    open: 100.5,
    high: 102,
    low: 100,
    close: 101,
  },
  {
    timestamp: "2026-09-17T14:40:00.000Z",
    open: 101,
    high: 103,
    low: 100.5,
    close: 102,
  },
];

test.describe("versioned canonical outcome coverage receipts", () => {
  test("records a complete 15-minute provider window only when every expected slot is present", () => {
    expect(
      buildCanonicalOutcomeProviderCoverageReceipt({
        request: alignedRequest,
        candles: completeCandles,
        result: { status: "available", provider: "twelve_data" },
      }),
    ).toEqual({
      contract_version: CANONICAL_OUTCOME_PROVIDER_COVERAGE_RECEIPT_VERSION,
      provider_status: "available",
      freshness: "fresh",
      expected_candle_count: 3,
      observed_candle_count: 3,
      malformed_candle_count: 0,
      blockers: [],
      candle_interval: "5min",
      horizon: "15m",
      request_start_at: "2026-09-17T14:30:00.000Z",
      request_end_at: "2026-09-17T14:45:00.000Z",
      required_horizon_end_at: "2026-09-17T14:45:00.000Z",
      horizon_elapsed: true,
      response_status: "available",
      evaluation_anchor_contract_version:
        "recommendation_outcome_evaluation_anchor_v1",
      decision_timestamp: "2026-09-17T14:30:00.000Z",
      evaluation_anchor_start_at: "2026-09-17T14:30:00.000Z",
      decision_to_anchor_seconds: 0,
      decision_timestamp_interval_aligned: true,
    });
  });

  test("fails closed for an early, sparse, duplicate, or malformed candle window", () => {
    const receipt = buildCanonicalOutcomeProviderCoverageReceipt({
      request: { ...alignedRequest, end_at: "2026-09-17T14:40:00.000Z" },
      candles: [
        completeCandles[0],
        completeCandles[0],
        {
          timestamp: "2026-09-17T14:40:00.000Z",
          open: 101,
          high: 103,
          low: 100.5,
          close: null,
        },
      ],
      result: { status: "available", provider: "twelve_data" },
    });

    expect(receipt).toMatchObject({
      freshness: "unknown",
      expected_candle_count: 3,
      observed_candle_count: 1,
      malformed_candle_count: 1,
      horizon_elapsed: false,
    });
    expect(receipt.blockers).toEqual(
      expect.arrayContaining([
        "outcome_horizon_not_fully_elapsed",
        "duplicate_candle_interval_observed",
        "malformed_candle_observed",
        "candle_coverage_incomplete",
      ]),
    );
  });

  test("uses the first complete candle after an unaligned decision without borrowing the in-flight candle", () => {
    const receipt = buildCanonicalOutcomeProviderCoverageReceipt({
      request: {
        ...alignedRequest,
        decision_timestamp: "2026-09-17T14:30:15.000Z",
        evaluation_anchor_start_at: "2026-09-17T14:35:00.000Z",
        decision_to_anchor_seconds: 285,
        decision_timestamp_interval_aligned: false,
        start_at: "2026-09-17T14:35:00.000Z",
        end_at: "2026-09-17T14:50:00.000Z",
      },
      candles: completeCandles.slice(1).concat({
        timestamp: "2026-09-17T14:45:00.000Z",
        open: 102,
        high: 104,
        low: 101,
        close: 103,
      }),
      result: { status: "available", provider: "twelve_data" },
    });

    expect(receipt).toMatchObject({
      freshness: "fresh",
      observed_candle_count: 3,
      decision_timestamp: "2026-09-17T14:30:15.000Z",
      evaluation_anchor_start_at: "2026-09-17T14:35:00.000Z",
      decision_to_anchor_seconds: 285,
      decision_timestamp_interval_aligned: false,
    });
    expect(receipt.blockers).toEqual([]);
  });

  test("fails closed when a caller shifts or fabricates the recorded evaluation anchor", () => {
    const receipt = buildCanonicalOutcomeProviderCoverageReceipt({
      request: {
        ...alignedRequest,
        decision_timestamp: "2026-09-17T14:30:15.000Z",
        evaluation_anchor_start_at: "2026-09-17T14:40:00.000Z",
        decision_to_anchor_seconds: 585,
        decision_timestamp_interval_aligned: false,
        start_at: "2026-09-17T14:40:00.000Z",
        end_at: "2026-09-17T14:55:00.000Z",
      },
      candles: [
        completeCandles[2],
        {
          timestamp: "2026-09-17T14:45:00.000Z",
          open: 102,
          high: 104,
          low: 101,
          close: 103,
        },
        {
          timestamp: "2026-09-17T14:50:00.000Z",
          open: 103,
          high: 105,
          low: 102,
          close: 104,
        },
      ],
      result: { status: "available", provider: "twelve_data" },
    });

    expect(receipt.freshness).toBe("unknown");
    expect(receipt.blockers).toContain("outcome_evaluation_anchor_invalid");
  });

  test("persists a versioned receipt with every candle-backed runtime outcome without another provider request", async () => {
    const snapshot = buildRecommendationSnapshot({
      recommendation_id: "coverage-recommendation",
      scan_run_id: "coverage-scan",
      ticker: "AAPL",
      recommended_at: "2026-09-17T14:30:00.000Z",
      app_timestamp: "2026-09-17T14:30:00.000Z",
      window: "morning",
      entry: 100,
      stop: 98,
      target: 104,
      side: "long",
      confidence: 80,
      score: 80,
      rating: "valid",
      label: "valid",
      type: "MOMENTUM_CONTINUATION",
      payload: {},
    });
    const persisted: unknown[] = [];
    let requests = 0;

    const run = await runRecommendationOutcomeEvaluation({
      snapshots: [snapshot],
      horizons: ["15m"],
      now: "2026-09-17T14:50:00.000Z",
      maxSnapshots: 1,
      fetchCandles: async (request) => {
        requests += 1;
        return {
          request,
          status: "available" as const,
          candles: completeCandles,
          provider: "twelve_data",
          error: null,
          warnings: [],
        };
      },
      persistOutcome: async (outcome) => {
        persisted.push(outcome);
        return {
          status: "saved" as const,
          mode: "supabase" as const,
          outcome,
          error: null,
        };
      },
    });

    expect(requests).toBe(1);
    expect(persisted).toHaveLength(1);
    expect(
      (persisted[0] as { payload_json: Record<string, unknown> }).payload_json,
    ).toMatchObject({
      canonical_provider_coverage: {
        contract_version: CANONICAL_OUTCOME_PROVIDER_COVERAGE_RECEIPT_VERSION,
        freshness: "fresh",
        expected_candle_count: 3,
        observed_candle_count: 3,
      },
    });

    const coveredOutcome = run.outcomes[0];
    expect(coveredOutcome).toBeDefined();
    const legacyOutcome = {
      ...coveredOutcome!,
      payload_json: {
        ...coveredOutcome!.payload_json,
        canonical_provider_coverage: undefined,
      },
    };
    expect(hasBetterOutcomeCoverage(coveredOutcome!, legacyOutcome)).toBe(true);
    expect(hasBetterOutcomeCoverage(legacyOutcome, coveredOutcome!)).toBe(false);
  });

  test("stores an immutable next-candle anchor on a snapshot created between candle boundaries", async () => {
    const snapshot = buildRecommendationSnapshot({
      recommendation_id: "unaligned-coverage-recommendation",
      scan_run_id: "unaligned-coverage-scan",
      ticker: "AAPL",
      recommended_at: "2026-09-17T14:30:15.000Z",
      app_timestamp: "2026-09-17T14:30:15.000Z",
      window: "morning",
      entry: 100,
      stop: 98,
      target: 104,
      side: "long",
      payload: {},
    });
    let requestedStart: string | null = null;
    let requestedDecision: string | null = null;

    await runRecommendationOutcomeEvaluation({
      snapshots: [snapshot],
      horizons: ["15m"],
      now: "2026-09-17T14:55:00.000Z",
      fetchCandles: async (request) => {
        requestedStart = request.start_at;
        requestedDecision = request.decision_timestamp;
        return {
          request,
          status: "available" as const,
          candles: [
            completeCandles[1],
            completeCandles[2],
            {
              timestamp: "2026-09-17T14:45:00.000Z",
              open: 102,
              high: 104,
              low: 101,
              close: 103,
            },
          ],
          provider: "twelve_data",
          error: null,
          warnings: [],
        };
      },
    });

    expect(snapshot.payload_json.outcome_evaluation_anchor).toMatchObject({
      contract_version: "recommendation_outcome_evaluation_anchor_v1",
      decision_timestamp: "2026-09-17T14:30:15.000Z",
      evaluation_anchor_start_at: "2026-09-17T14:35:00.000Z",
      decision_to_anchor_seconds: 285,
      decision_timestamp_interval_aligned: false,
    });
    expect(requestedDecision).toBe("2026-09-17T14:30:15.000Z");
    expect(requestedStart).toBe("2026-09-17T14:35:00.000Z");
  });

  test("fails closed before a provider request when a legacy snapshot lacks a decision-bound anchor", async () => {
    const anchoredSnapshot = buildRecommendationSnapshot({
      recommendation_id: "legacy-anchor-recommendation",
      scan_run_id: "legacy-anchor-scan",
      ticker: "AAPL",
      recommended_at: "2026-09-17T14:30:00.000Z",
      app_timestamp: "2026-09-17T14:30:00.000Z",
      window: "morning",
      entry: 100,
      stop: 98,
      target: 104,
      side: "long",
      payload: {},
    });
    const legacySnapshot = {
      ...anchoredSnapshot,
      payload_json: { ...anchoredSnapshot.payload_json },
    };
    delete legacySnapshot.payload_json.outcome_evaluation_anchor;
    let requests = 0;

    const run = await runRecommendationOutcomeEvaluation({
      snapshots: [legacySnapshot],
      horizons: ["15m"],
      now: "2026-09-17T14:50:00.000Z",
      fetchCandles: async () => {
        requests += 1;
        throw new Error("legacy snapshot must not reach provider");
      },
    });

    expect(requests).toBe(0);
    expect(run.candle_requests_planned).toBe(0);
    expect(run.outcomes).toHaveLength(1);
    expect(run.outcomes[0]).toMatchObject({
      source: "snapshot_only",
      data_completeness: "none",
    });
    expect(run.outcomes[0]?.warnings).toContain(
      "Outcome evaluation anchor is missing, invalid, or not bound to the decision timestamp.",
    );
  });
});
