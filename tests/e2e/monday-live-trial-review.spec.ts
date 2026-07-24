import { expect, test } from "@playwright/test";

import {
  buildMondayLiveTrialReviewSummary,
  type MondayLiveTrialReviewClassification,
} from "../../lib/monday-live-trial-review";
import type { RecommendationBatch } from "../../lib/recommendation-batch-memory";
import type { RecommendationOutcome } from "../../lib/recommendation-outcome-tracker";
import type { RecommendationSnapshot } from "../../lib/recommendation-snapshot";

function batch(
  overrides: Partial<RecommendationBatch> = {},
): RecommendationBatch {
  return {
    id: "batch-row-1",
    batch_fingerprint: "rec_batch_2cvp3v",
    trading_date: "2026-06-29",
    window: "morning",
    batch_type: "official",
    status: "published",
    serving_decision: "publish_official_batch",
    freshness_status: "fresh",
    published_at: "2026-06-29T13:50:00.000Z",
    served_at: "2026-06-29T13:50:00.000Z",
    observed_at: "2026-06-29T13:50:00.000Z",
    expires_at: null,
    scan_run_id: "scan-row-1",
    scan_run_fingerprint: "rec_scan_run_monday",
    recommendation_snapshot_ids: [],
    recommendation_snapshot_fingerprints: [],
    recommendation_tickers: ["BAC", "CAT", "MSFT", "AAPL", "NVDA", "JPM"],
    recommendation_count: 6,
    strong_count: 3,
    valid_count: 3,
    experimental_count: 0,
    rejected_count: 0,
    incomplete_count: 0,
    unknown_tier_count: 0,
    target_status: "within_target",
    gap_to_target: null,
    overflow_above_target: null,
    source_mode: "supabase",
    data_mode: "supabase_record",
    market_session_phase: "regular",
    warnings: [],
    gaps: [],
    metadata_score: 100,
    payload_json: { time_window: "09:45-11:00 ET" },
    created_at: "2026-06-29T13:50:00.000Z",
    updated_at: "2026-06-29T13:50:00.000Z",
    ...overrides,
  };
}

function snapshot(input: {
  ticker: string;
  index?: number;
  recommendationId?: string;
  fingerprint?: string;
  tier?: "strong" | "valid" | "experimental";
}): RecommendationSnapshot {
  const index = input.index ?? 1;
  const ticker = input.ticker.toUpperCase();

  return {
    id: `snapshot-${ticker}-${index}`,
    snapshot_fingerprint: input.fingerprint ?? `snap-${ticker}-${index}`,
    recommendation_id: input.recommendationId ?? `rec-${ticker}`,
    scan_run_id: "rec_scan_run_monday",
    ticker,
    company_name: ticker,
    recommended_at: "2026-06-29T13:50:00.000Z",
    app_timestamp: "2026-06-29T13:50:00.000Z",
    window: "morning",
    status: "visible",
    source_mode: "supabase",
    data_mode: "supabase_record",
    market_session_phase: "regular",
    market_session_risk: null,
    market_session_source: null,
    is_visible: true,
    is_demo: false,
    is_mock: false,
    is_real: true,
    entry: 100,
    entry_low: null,
    entry_high: null,
    stop: 98,
    target: 104,
    side: "long",
    risk_per_share: 2,
    reward_per_share: 4,
    planned_risk_reward: 2,
    confidence: 80,
    score: 80,
    rating: input.tier ?? "valid",
    label: input.tier ?? "valid",
    type: "VWAP_HOLD_CONTINUATION",
    rationale: null,
    reason: null,
    catalyst: null,
    primary_risk: null,
    market_data_snapshot: null,
    quote_price: 100,
    volume: null,
    liquidity: null,
    spread: null,
    freshness: "fresh",
    data_age_minutes: 1,
    intake_quality_json: null,
    scan_observability_json: null,
    empty_state_json: null,
    quality_json: null,
    payload_json: {
      batch_fingerprint: "rec_batch_2cvp3v",
      day_trade_window_recommendation_target: {
        tier: input.tier ?? "valid",
      },
    },
    was_taken: false,
    linked_position_id: null,
    created_at: "2026-06-29T13:50:00.000Z",
    updated_at: "2026-06-29T13:50:00.000Z",
  };
}

function outcome(input: {
  ticker: string;
  horizon: "15m" | "30m" | "60m";
  recommendationId?: string;
  snapshotFingerprint?: string;
  status?: RecommendationOutcome["status"];
  entryTriggered?: boolean | null;
  targetHit?: boolean | null;
  stopHit?: boolean | null;
  bestR?: number | null;
  worstR?: number | null;
  freshness?: string;
  entryDriftPct?: number | null;
  targetDistancePct?: number | null;
  dataCompleteness?: RecommendationOutcome["data_completeness"];
}): RecommendationOutcome {
  const ticker = input.ticker.toUpperCase();

  return {
    id: `outcome-${ticker}-${input.snapshotFingerprint ?? "snap"}-${input.horizon}`,
    snapshot_id: null,
    snapshot_fingerprint: input.snapshotFingerprint ?? `snap-${ticker}-1`,
    recommendation_id: input.recommendationId ?? `rec-${ticker}`,
    ticker,
    side: "long",
    recommended_at: "2026-06-29T13:50:00.000Z",
    evaluated_at: `2026-06-29T14:${input.horizon === "15m" ? "05" : input.horizon === "30m" ? "20" : "50"}:00.000Z`,
    horizon: input.horizon,
    status: input.status ?? "neither_hit",
    entry: 100,
    stop: 98,
    target: 104,
    entry_triggered: input.entryTriggered ?? true,
    entry_triggered_at: "2026-06-29T13:51:00.000Z",
    target_hit: input.targetHit ?? false,
    target_hit_at: input.targetHit ? "2026-06-29T14:00:00.000Z" : null,
    stop_hit: input.stopHit ?? false,
    stop_hit_at: input.stopHit ? "2026-06-29T14:00:00.000Z" : null,
    first_terminal_event: input.targetHit
      ? "target_hit"
      : input.stopHit
        ? "stop_hit"
        : "neither",
    best_price_after_recommendation: null,
    worst_price_after_recommendation: null,
    best_r: typeof input.bestR === "undefined" ? 0.2 : input.bestR,
    worst_r: typeof input.worstR === "undefined" ? -0.1 : input.worstR,
    eod_price: null,
    eod_r: null,
    current_price: null,
    current_r: null,
    max_favorable_excursion: null,
    max_adverse_excursion: null,
    time_to_entry_minutes: null,
    time_to_target_minutes: null,
    time_to_stop_minutes: null,
    source: "intraday_candles",
    provider: "fixture",
    data_completeness: input.dataCompleteness ?? "complete",
    warnings: [],
    blockers: [],
    payload_json: {
      plan_price_freshness: {
        entry_distance_from_first_candle_close_pct:
          input.entryDriftPct ?? 0.2,
        target_distance_from_first_candle_close_pct:
          input.targetDistancePct ?? 3.5,
        classification: input.freshness ?? "fresh",
      },
    },
    created_at: "2026-06-29T14:00:00.000Z",
    updated_at: "2026-06-29T14:00:00.000Z",
  };
}

test("latest evaluated batch summarizes 6 recommendations and 18 outcomes", () => {
  const tickers = ["BAC", "CAT", "MSFT", "AAPL", "NVDA", "JPM"];
  const snapshots = tickers.map((ticker, index) =>
    snapshot({ ticker, index: index + 1, tier: index < 3 ? "strong" : "valid" }),
  );
  const outcomes = snapshots.flatMap((item) =>
    (["15m", "30m", "60m"] as const).map((horizon) =>
      outcome({
        ticker: item.ticker ?? "UNKNOWN",
        horizon,
        recommendationId: item.recommendation_id ?? undefined,
        snapshotFingerprint: item.snapshot_fingerprint,
        bestR: 0.2,
        worstR: -0.1,
      }),
    ),
  );

  const summary = buildMondayLiveTrialReviewSummary({
    batch: batch({
      recommendation_snapshot_fingerprints: snapshots.map(
        (item) => item.snapshot_fingerprint,
      ),
    }),
    snapshots,
    outcomes,
    visibleRecommendationCount: 6,
  });

  expect(summary.batch_fingerprint).toBe("rec_batch_2cvp3v");
  expect(summary.scan_run_fingerprint).toBe("rec_scan_run_monday");
  expect(summary.trading_day).toBe("2026-06-29");
  expect(summary.stored_window).toBe("morning");
  expect(summary.time_window).toBe("09:45-11:00 ET");
  expect(summary.visible_recommendation_count).toBe(6);
  expect(summary.outcome_rows_evaluated).toBe(18);
  expect(summary.horizons_covered).toEqual(["15m", "30m", "60m"]);
  expect(summary.rows).toHaveLength(6);
  expect(summary.aggregate.recommendation_count).toBe(6);
});

test("target hit classification wins when any horizon hit target", () => {
  const item = snapshot({ ticker: "CAT" });
  const summary = buildMondayLiveTrialReviewSummary({
    batch: batch(),
    snapshots: [item],
    outcomes: [
      outcome({
        ticker: "CAT",
        horizon: "15m",
        snapshotFingerprint: item.snapshot_fingerprint,
        status: "target_hit",
        targetHit: true,
        bestR: 2,
      }),
    ],
  });

  expect(summary.rows[0].classification).toBe("target_hit");
  expect(summary.aggregate.target_hit_count).toBe(1);
});

test("stop hit classification wins when any horizon hit stop", () => {
  const item = snapshot({ ticker: "AAPL" });
  const summary = buildMondayLiveTrialReviewSummary({
    batch: batch(),
    snapshots: [item],
    outcomes: [
      outcome({
        ticker: "AAPL",
        horizon: "30m",
        snapshotFingerprint: item.snapshot_fingerprint,
        status: "stop_hit",
        stopHit: true,
        worstR: -1,
      }),
    ],
  });

  expect(summary.rows[0].classification).toBe("stop_hit");
  expect(summary.aggregate.stop_hit_count).toBe(1);
});

test("promising but target too far classification captures favorable non-target moves", () => {
  const item = snapshot({ ticker: "CAT" });
  const summary = buildMondayLiveTrialReviewSummary({
    batch: batch(),
    snapshots: [item],
    outcomes: [
      outcome({
        ticker: "CAT",
        horizon: "60m",
        snapshotFingerprint: item.snapshot_fingerprint,
        bestR: 0.6,
        worstR: -0.15,
        targetHit: false,
      }),
    ],
  });

  expect(summary.rows[0].classification).toBe("promising_but_target_too_far");
  expect(summary.rows[0].learning_note).toBe(
    "CAT moved +0.60R but target was too far away.",
  );
});

test("stale plan adverse move classification captures stale drift plus adverse movement", () => {
  const item = snapshot({ ticker: "MSFT" });
  const summary = buildMondayLiveTrialReviewSummary({
    batch: batch(),
    snapshots: [item],
    outcomes: [
      outcome({
        ticker: "MSFT",
        horizon: "60m",
        snapshotFingerprint: item.snapshot_fingerprint,
        bestR: 0.1,
        worstR: -0.7,
        freshness: "slightly_stale",
        entryDriftPct: 1.8,
      }),
    ],
  });

  expect(summary.rows[0].classification).toBe("stale_plan_adverse_move");
  expect(summary.rows[0].learning_note).toBe(
    "MSFT had slightly stale plan drift and adverse movement.",
  );
  expect(summary.aggregate.stale_plan_adverse_move_count).toBe(1);
});

test("duplicate grow max rows are rolled up and not double-counted", () => {
  const first = snapshot({
    ticker: "BAC",
    recommendationId: "rec-BAC-shared",
    fingerprint: "snap-BAC-a",
  });
  const duplicate = snapshot({
    ticker: "BAC",
    recommendationId: "rec-BAC-shared",
    fingerprint: "snap-BAC-b",
  });
  const summary = buildMondayLiveTrialReviewSummary({
    batch: batch({ recommendation_count: 1, recommendation_tickers: ["BAC"] }),
    snapshots: [first, duplicate],
    outcomes: [
      outcome({
        ticker: "BAC",
        horizon: "15m",
        recommendationId: "rec-BAC-shared",
        snapshotFingerprint: "snap-BAC-a",
        bestR: 0.05,
        worstR: -0.03,
      }),
      outcome({
        ticker: "BAC",
        horizon: "15m",
        recommendationId: "rec-BAC-shared",
        snapshotFingerprint: "snap-BAC-b",
        bestR: 0.04,
        worstR: -0.02,
      }),
      outcome({
        ticker: "BAC",
        horizon: "30m",
        recommendationId: "rec-BAC-shared",
        snapshotFingerprint: "snap-BAC-a",
        bestR: 0.08,
        worstR: -0.04,
      }),
      outcome({
        ticker: "BAC",
        horizon: "30m",
        recommendationId: "rec-BAC-shared",
        snapshotFingerprint: "snap-BAC-b",
        bestR: 0.07,
        worstR: -0.03,
      }),
    ],
  });

  expect(summary.rows).toHaveLength(1);
  expect(summary.aggregate.recommendation_count).toBe(1);
  expect(summary.rows[0].horizons).toEqual(["15m", "30m"]);
  expect(summary.rows[0].classification).toBe("flat_no_followthrough");
});

test("incomplete data renders unknown without crashing", () => {
  const item = snapshot({ ticker: "NVDA" });
  const summary = buildMondayLiveTrialReviewSummary({
    batch: batch(),
    snapshots: [item],
    outcomes: [
      outcome({
        ticker: "NVDA",
        horizon: "15m",
        snapshotFingerprint: item.snapshot_fingerprint,
        status: "incomplete",
        entryTriggered: null,
        targetHit: null,
        stopHit: null,
        bestR: null,
        worstR: null,
        dataCompleteness: "none",
      }),
    ],
  });

  expect(summary.rows[0].classification).toBe(
    "unknown" satisfies MondayLiveTrialReviewClassification,
  );
  expect(summary.rows[0].learning_note).toBe(
    "NVDA has incomplete outcome data; classification is unknown.",
  );
});
