import { expect, test } from "@playwright/test";

import {
  buildDailyLearningReviewSummary,
  type DailyLearningReviewSummary,
} from "../../lib/daily-learning-review";
import { buildMarketDiagnosticsConsoleSummary } from "../../lib/market-diagnostics-console";
import type { MarketDiagnosticsConsoleInput } from "../../lib/market-diagnostics-console";
import type { RecommendationOutcome } from "../../lib/recommendation-outcome-tracker";
import type { RecommendationSnapshot } from "../../lib/recommendation-snapshot";

const tradingDay = "2026-07-06";
const evaluatedAt = "2026-07-06T15:00:00.000Z";

function snapshot(
  ticker: string,
  overrides: Partial<RecommendationSnapshot> = {},
): RecommendationSnapshot {
  const fingerprint = overrides.snapshot_fingerprint ?? `snap-${ticker}`;
  const researchOnly =
    overrides.source_mode === "research_only" ||
    overrides.payload_json?.visibility_status === "research_only";

  return {
    id: overrides.id ?? fingerprint,
    snapshot_fingerprint: fingerprint,
    recommendation_id:
      "recommendation_id" in overrides
        ? (overrides.recommendation_id ?? null)
        : `rec-${ticker}`,
    scan_run_id: overrides.scan_run_id ?? "rec_scan_run_daily_review",
    ticker: overrides.ticker ?? ticker,
    company_name: overrides.company_name ?? null,
    recommended_at: overrides.recommended_at ?? "2026-07-06T14:30:00.000Z",
    app_timestamp: overrides.app_timestamp ?? "2026-07-06T14:30:00.000Z",
    window: overrides.window ?? "midday",
    status: overrides.status ?? (researchOnly ? "hidden" : "visible"),
    source_mode: overrides.source_mode ?? (researchOnly ? "research_only" : "official"),
    data_mode: overrides.data_mode ?? (researchOnly ? "research_only" : "supabase"),
    market_session_phase: overrides.market_session_phase ?? "regular",
    market_session_risk: overrides.market_session_risk ?? null,
    market_session_source: overrides.market_session_source ?? null,
    is_visible: overrides.is_visible ?? !researchOnly,
    is_demo: overrides.is_demo ?? false,
    is_mock: overrides.is_mock ?? false,
    is_real: overrides.is_real ?? true,
    entry: overrides.entry ?? 100,
    entry_low: overrides.entry_low ?? 100,
    entry_high: overrides.entry_high ?? 100,
    stop: overrides.stop ?? 98,
    target: overrides.target ?? 104,
    side: overrides.side ?? "long",
    risk_per_share: overrides.risk_per_share ?? 2,
    reward_per_share: overrides.reward_per_share ?? 4,
    planned_risk_reward: overrides.planned_risk_reward ?? 2,
    confidence: overrides.confidence ?? 70,
    score: overrides.score ?? 70,
    rating: overrides.rating ?? "valid",
    label: overrides.label ?? null,
    type: overrides.type ?? null,
    rationale: overrides.rationale ?? null,
    reason: overrides.reason ?? null,
    catalyst: overrides.catalyst ?? null,
    primary_risk: overrides.primary_risk ?? null,
    market_data_snapshot: overrides.market_data_snapshot ?? null,
    quote_price: overrides.quote_price ?? 100,
    volume: overrides.volume ?? null,
    liquidity: overrides.liquidity ?? null,
    spread: overrides.spread ?? null,
    freshness: overrides.freshness ?? null,
    data_age_minutes: overrides.data_age_minutes ?? null,
    intake_quality_json: overrides.intake_quality_json ?? null,
    scan_observability_json: overrides.scan_observability_json ?? null,
    empty_state_json: overrides.empty_state_json ?? null,
    quality_json: overrides.quality_json ?? null,
    payload_json: overrides.payload_json ?? {
      batch_fingerprint: "rec_batch_daily",
      visibility_status: researchOnly ? "research_only" : "visible",
      setup_type: "momentum",
      entry_type_metadata: {
        entry_type: "pullback_limit",
        trigger_semantics: "touch_entry",
      },
      day_trade_window_recommendation_target: { tier: "valid" },
    },
    was_taken: overrides.was_taken ?? false,
    linked_position_id: overrides.linked_position_id ?? null,
    created_at: overrides.created_at ?? "2026-07-06T14:30:00.000Z",
    updated_at: overrides.updated_at ?? "2026-07-06T14:30:00.000Z",
  };
}

function outcome(
  ticker: string,
  overrides: Partial<RecommendationOutcome> = {},
): RecommendationOutcome {
  const fingerprint = overrides.snapshot_fingerprint ?? `snap-${ticker}`;

  return {
    id: overrides.id ?? `outcome-${ticker}-${overrides.horizon ?? "15m"}`,
    snapshot_id: overrides.snapshot_id ?? fingerprint,
    snapshot_fingerprint:
      "snapshot_fingerprint" in overrides
        ? (overrides.snapshot_fingerprint ?? null)
        : fingerprint,
    recommendation_id:
      "recommendation_id" in overrides
        ? (overrides.recommendation_id ?? null)
        : `rec-${ticker}`,
    ticker: "ticker" in overrides ? (overrides.ticker ?? null) : ticker,
    side: overrides.side ?? "long",
    recommended_at: overrides.recommended_at ?? "2026-07-06T14:30:00.000Z",
    evaluated_at: overrides.evaluated_at ?? evaluatedAt,
    horizon: overrides.horizon ?? "15m",
    status: overrides.status ?? "neither_hit",
    entry: overrides.entry ?? 100,
    stop: overrides.stop ?? 98,
    target: overrides.target ?? 104,
    entry_triggered: overrides.entry_triggered ?? true,
    entry_triggered_at: overrides.entry_triggered_at ?? evaluatedAt,
    target_hit: overrides.target_hit ?? false,
    target_hit_at: overrides.target_hit_at ?? null,
    stop_hit: overrides.stop_hit ?? false,
    stop_hit_at: overrides.stop_hit_at ?? null,
    first_terminal_event: overrides.first_terminal_event ?? "neither",
    best_price_after_recommendation:
      overrides.best_price_after_recommendation ?? 101,
    worst_price_after_recommendation:
      overrides.worst_price_after_recommendation ?? 99,
    best_r: "best_r" in overrides ? (overrides.best_r ?? null) : 0.2,
    worst_r: "worst_r" in overrides ? (overrides.worst_r ?? null) : -0.1,
    eod_price: overrides.eod_price ?? null,
    eod_r: overrides.eod_r ?? null,
    current_price: overrides.current_price ?? 100,
    current_r: overrides.current_r ?? 0,
    max_favorable_excursion: overrides.max_favorable_excursion ?? 1,
    max_adverse_excursion: overrides.max_adverse_excursion ?? -1,
    time_to_entry_minutes: overrides.time_to_entry_minutes ?? 2,
    time_to_target_minutes: overrides.time_to_target_minutes ?? null,
    time_to_stop_minutes: overrides.time_to_stop_minutes ?? null,
    source: overrides.source ?? "intraday_candles",
    provider: overrides.provider ?? "twelve_data",
    data_completeness: overrides.data_completeness ?? "complete",
    warnings: overrides.warnings ?? [],
    blockers: overrides.blockers ?? [],
    payload_json: overrides.payload_json ?? {},
    created_at: overrides.created_at ?? evaluatedAt,
    updated_at: overrides.updated_at ?? evaluatedAt,
  };
}

function confidenceSummary(count: number): DailyLearningReviewSummary {
  const snapshots = Array.from({ length: count }, (_, index) =>
    snapshot(`T${index}`, {
      snapshot_fingerprint: `snap-confidence-${index}`,
      recommendation_id: `rec-confidence-${index}`,
    }),
  );
  const outcomes = snapshots.map((item, index) =>
    outcome(item.ticker ?? `T${index}`, {
      id: `outcome-confidence-${index}`,
      snapshot_fingerprint: item.snapshot_fingerprint,
      recommendation_id: item.recommendation_id,
    }),
  );

  return buildDailyLearningReviewSummary({
    trading_day: tradingDay,
    latest_batch_fingerprint: "rec_batch_daily",
    snapshots,
    outcomes,
    now: evaluatedAt,
  });
}

function baseDiagnosticsInput(
  dailyLearningReview: DailyLearningReviewSummary,
): MarketDiagnosticsConsoleInput {
  return {
    now: evaluatedAt,
    market_session: {
      evaluated_at: evaluatedAt,
      market_is_open: true,
      phase: "regular",
    },
    market_status: { dayType: "trading" },
    data_mode_clarity: {
      overall_mode: "paper",
      execution_reality: "human_confirmed_required",
    },
    engine_control_center: { overall_status: "ready" },
    live_market_trial_readiness: {
      overall_status: "ready",
      blockers: [],
      warnings: [],
      checks: [],
      provider_env_readiness: {
        server_secret_status: "inferred_available",
        supabase_public_env_available: true,
      },
      persistence_readiness: {
        scan_runs_available: true,
        batches_available: true,
        snapshots_available: true,
      },
      scanner_readiness: { selected_ticker_count: 6 },
      outcome_readiness: {
        route_available: true,
        evaluated_recommendations: dailyLearningReview.evaluated_outcome_count,
      },
      can_do_now: {
        observe_only: true,
        log_recommendations: true,
        evaluate_outcomes: true,
        paper_or_manual_tracking_ready: true,
      },
      not_enabled: {
        broker_automation: true,
        order_submission: true,
        automatic_avanza_execution: true,
        automatic_trading_execution: true,
      },
      latest_automation_scan: { decision: "completed" },
    },
    live_market_trial_runbook: {
      status: "ready",
      phase: "regular",
      next_action: { label: "Review learning" },
      blockers: [],
      warnings: [],
    },
    scan_orchestration: {
      current_utc_time: evaluatedAt,
      current_ny_time: "2026-07-06 11:00 America/New_York",
      calendar_confidence: "high",
      provider_calendar_available: true,
      fallback_calendar_scan_allowed: false,
      active_window: "midday",
      decision: "scan_allowed",
      should_scan_now: true,
      next_window: "power_hour",
      next_window_label: "Power Hour",
      next_window_starts_at: "2026-07-06T19:00:00.000Z",
      warnings: [],
      official_scan_windows: [],
      official_window_statuses: [],
    },
    serving_cadence: {
      warnings: [],
      serving_decision: "served",
      no_trade_valid: false,
      visible_recommendation_count: dailyLearningReview.visible_evaluated_count,
      batch_status: "served",
      batch_target: { min: 2, max: 12 },
    },
    provider_budget_guard: {
      status: "ok",
      next_action: { label: "No action" },
      warnings: [],
      plan_mode: "grow",
      totals: {
        estimated_calls_per_window: 0,
        estimated_calls_per_day: 0,
      },
      latest_limit_signal: { status: "ok" },
    },
    scanner_universe: {
      warnings: [],
      selected_tickers: ["AAPL", "MSFT"],
    },
    scanner_output_qa: {
      overall_status: "healthy",
      summary: "healthy",
      warnings: [],
      recommended_next_action: { label: "No action" },
      candidate_count: 2,
      metadata_coverage: {
        recommendation_rows_with_data_timestamp: 2,
        recommendation_rows_with_provider_source: 2,
        explicit_gap_count: 0,
        missing_metadata_fields: [],
        qa_checked_source_path: "daily_learning_review_test",
        metadata_missing_at_stage: null,
      },
    },
    real_output_readiness: {
      overall_status: "ready",
      blockers: [],
      warnings: [],
      coverage: {
        strong_count: 1,
        valid_count: 1,
        experimental_count: 0,
      },
    },
    batch_memory: {
      warnings: [],
      latest_batch: {
        batch_fingerprint: "rec_batch_daily",
        scan_run_fingerprint: "rec_scan_run_daily",
      },
      persistence_status: "ok",
      persistence_mode: "persisted",
      total_batches: 1,
    },
    scan_run_history: {
      top_warnings: [],
      latest_run_status: "completed",
      total_scan_runs: 1,
    },
    daily_targets: {
      warnings: [],
      total_recommendations_today: 2,
      full_day_recommendation_target_min: 4,
      full_day_recommendation_target_max: 12,
    },
    day_window_target: {
      status: "served",
      strong_candidate_gate: {
        candidates_considered_for_strong: 2,
        candidates_blocked_from_strong: 0,
        top_blocking_reasons: [],
        blocked_by_stale_plan_count: 0,
        blocked_by_entry_distance_too_large_count: 0,
        blocked_by_invalid_risk_geometry_count: 0,
        blocked_by_missing_provider_reference_count: 0,
        blocked_by_setup_quality_below_minimum_count: 0,
      },
    },
    performance: {
      summary: {
        total_recommendations: 2,
        pending_outcomes: 0,
        evaluated_recommendations: dailyLearningReview.evaluated_outcome_count,
      },
    },
    daily_learning_review: dailyLearningReview,
    scan_readback: null,
    outcome_evaluation: null,
    outcome_learning: null,
    entry_tuning_proposal: null,
    recommendation_output_enrichment: null,
    metadata_coverage: null,
  } as unknown as MarketDiagnosticsConsoleInput;
}

test("daily learning review summarizes visible-only outcomes", () => {
  const summary = buildDailyLearningReviewSummary({
    trading_day: tradingDay,
    latest_batch_fingerprint: "rec_batch_daily",
    snapshots: [snapshot("AAPL"), snapshot("MSFT")],
    outcomes: [
      outcome("AAPL", {
        status: "target_hit",
        target_hit: true,
        best_r: 1.2,
        current_r: 0.9,
      }),
      outcome("MSFT", {
        status: "stop_hit",
        stop_hit: true,
        best_r: 0.1,
        worst_r: -1,
        current_r: -1,
      }),
    ],
    now: evaluatedAt,
  });

  expect(summary.evaluated_outcome_count).toBe(2);
  expect(summary.visible_evaluated_count).toBe(2);
  expect(summary.research_only_evaluated_count).toBe(0);
  expect(summary.unknown_visibility_evaluated_count).toBe(0);
  expect(summary.visible_unique_snapshot_count).toBe(2);
  expect(summary.research_only_unique_snapshot_count).toBe(0);
  expect(summary.metrics.target_hit_count).toBe(1);
  expect(summary.metrics.stop_hit_count).toBe(1);
  expect(summary.metrics.average_terminal_r).toBeCloseTo(-0.05);
});

test("daily learning review summarizes research-only outcomes without recommendation ids", () => {
  const researchSnapshot = snapshot("PLTR", {
    recommendation_id: null,
    source_mode: "research_only",
    data_mode: "research_only",
    payload_json: {
      batch_fingerprint: "rec_batch_daily",
      visibility_status: "research_only",
      learning_acceleration_sample: true,
      source_window: "midday",
    },
  });
  const summary = buildDailyLearningReviewSummary({
    trading_day: tradingDay,
    latest_batch_fingerprint: "rec_batch_daily",
    snapshots: [researchSnapshot],
    outcomes: [
      outcome("PLTR", {
        recommendation_id: null,
        snapshot_fingerprint: researchSnapshot.snapshot_fingerprint,
        best_r: 0.8,
      }),
    ],
    now: evaluatedAt,
  });

  expect(summary.visible_evaluated_count).toBe(0);
  expect(summary.research_only_evaluated_count).toBe(1);
  expect(summary.unknown_visibility_evaluated_count).toBe(0);
  expect(summary.latest_batch_research_only_evaluated_count).toBe(1);
  expect(summary.research_only_unique_snapshot_count).toBe(1);
  expect(summary.scan_windows).toContain("midday");
});

test("daily learning review detects research-only from outcome payload without snapshot", () => {
  const summary = buildDailyLearningReviewSummary({
    trading_day: tradingDay,
    latest_batch_fingerprint: "rec_batch_daily",
    snapshots: [],
    outcomes: [
      outcome("SMCI", {
        recommendation_id: null,
        snapshot_fingerprint: "research-only-no-snapshot",
        payload_json: {
          batch_fingerprint: "rec_batch_daily",
          recommendation_snapshot: {
            visibility_status: "research_only",
            learning_acceleration_sample: true,
            not_live_trade_signal: true,
          },
        },
      }),
    ],
    now: evaluatedAt,
  });

  expect(summary.visible_evaluated_count).toBe(0);
  expect(summary.research_only_evaluated_count).toBe(1);
  expect(summary.latest_batch_research_only_evaluated_count).toBe(1);
  expect(summary.research_only_unique_snapshot_count).toBe(1);
});

test("daily learning review compares mixed visible and research-only samples", () => {
  const visibleSnapshots = ["AAPL", "MSFT", "NVDA"].map((ticker) =>
    snapshot(ticker),
  );
  const researchSnapshots = ["PLTR", "DIS", "DKNG"].map((ticker) =>
    snapshot(ticker, {
      source_mode: "research_only",
      data_mode: "research_only",
      payload_json: {
        batch_fingerprint: "rec_batch_daily",
        visibility_status: "research_only",
        learning_acceleration_sample: true,
      },
    }),
  );
  const summary = buildDailyLearningReviewSummary({
    trading_day: tradingDay,
    latest_batch_fingerprint: "rec_batch_daily",
    snapshots: [...visibleSnapshots, ...researchSnapshots],
    outcomes: [
      ...visibleSnapshots.map((item) =>
        outcome(item.ticker ?? "VISIBLE", {
          snapshot_fingerprint: item.snapshot_fingerprint,
          recommendation_id: item.recommendation_id,
          best_r: 0.1,
        }),
      ),
      ...researchSnapshots.map((item) =>
        outcome(item.ticker ?? "RESEARCH", {
          snapshot_fingerprint: item.snapshot_fingerprint,
          recommendation_id: item.recommendation_id,
          best_r: 0.8,
        }),
      ),
    ],
    now: evaluatedAt,
  });

  expect(summary.visible_evaluated_count).toBe(3);
  expect(summary.research_only_evaluated_count).toBe(3);
  expect(summary.unknown_visibility_evaluated_count).toBe(0);
  expect(summary.visible_unique_snapshot_count).toBe(3);
  expect(summary.research_only_unique_snapshot_count).toBe(3);
  expect(
    summary.visible_vs_research_only_comparison
      .average_best_r_delta_research_minus_visible,
  ).toBeCloseTo(0.7);
  expect(summary.engine_adjustment_candidates.map((item) => item.candidate)).toContain(
    "research_outperforming_visible",
  );
});

test("daily learning review handles missing metadata without crashing", () => {
  const summary = buildDailyLearningReviewSummary({
    trading_day: tradingDay,
    latest_batch_fingerprint: null,
    snapshots: [],
    outcomes: [
      outcome("UNKNOWN", {
        ticker: null,
        snapshot_fingerprint: null,
        recommendation_id: null,
        payload_json: {},
        best_r: null,
        worst_r: null,
      }),
    ],
    now: evaluatedAt,
  });

  expect(summary.evaluated_outcome_count).toBe(1);
  expect(summary.unknown_visibility_evaluated_count).toBe(1);
  expect(summary.unknown_visibility_unique_snapshot_count).toBe(1);
  expect(summary.top_positive_tickers_by_avg_best_r).toEqual([]);
  expect(summary.group_breakdowns.some((group) => group.key === "unknown")).toBe(
    true,
  );
});

test("daily learning review dedupes duplicate outcome rows by snapshot and horizon", () => {
  const summary = buildDailyLearningReviewSummary({
    trading_day: tradingDay,
    latest_batch_fingerprint: "rec_batch_daily",
    snapshots: [snapshot("AAPL")],
    outcomes: [
      outcome("AAPL", {
        id: "stale-incomplete",
        status: "incomplete",
        data_completeness: "partial",
        best_r: 0.1,
      }),
      outcome("AAPL", {
        id: "complete-row",
        status: "target_hit",
        data_completeness: "complete",
        target_hit: true,
        best_r: 1,
        updated_at: "2026-07-06T15:05:00.000Z",
      }),
    ],
    now: evaluatedAt,
  });

  expect(summary.evaluated_outcome_count).toBe(1);
  expect(summary.duplicate_outcome_rows_ignored_count).toBe(1);
  expect(summary.visible_unique_snapshot_count).toBe(1);
  expect(summary.metrics.target_hit_count).toBe(1);
  expect(summary.metrics.average_best_r).toBe(1);
});

test("daily learning review groups by setup family ticker window and tier", () => {
  const visibleMomentum = snapshot("AAPL", {
    window: "morning",
    rating: "valid",
    payload_json: {
      batch_fingerprint: "rec_batch_daily",
      visibility_status: "visible",
      setup_type: "momentum breakout",
      day_trade_window_recommendation_target: { tier: "valid" },
    },
  });
  const researchVwap = snapshot("PLTR", {
    source_mode: "research_only",
    data_mode: "research_only",
    window: "power_hour",
    payload_json: {
      batch_fingerprint: "rec_batch_daily",
      visibility_status: "research_only",
      learning_acceleration_sample: true,
      setup_type: "VWAP reclaim pullback",
      day_trade_window_recommendation_target: { tier: "experimental" },
    },
  });
  const unknown = outcome("MYST", {
    ticker: "MYST",
    snapshot_fingerprint: "snap-mystery",
    recommendation_id: null,
    payload_json: {
      batch_fingerprint: "rec_batch_daily",
      scan_window: "midday",
    },
  });
  const summary = buildDailyLearningReviewSummary({
    trading_day: tradingDay,
    latest_batch_fingerprint: "rec_batch_daily",
    snapshots: [visibleMomentum, researchVwap],
    outcomes: [
      outcome("AAPL", {
        snapshot_fingerprint: visibleMomentum.snapshot_fingerprint,
        recommendation_id: visibleMomentum.recommendation_id,
        best_r: 0.7,
      }),
      outcome("PLTR", {
        snapshot_fingerprint: researchVwap.snapshot_fingerprint,
        recommendation_id: researchVwap.recommendation_id,
        best_r: 0.9,
      }),
      unknown,
    ],
    now: evaluatedAt,
  });

  expect(summary.latest_batch_visible_evaluated_count).toBe(1);
  expect(summary.latest_batch_research_only_evaluated_count).toBe(1);
  expect(summary.latest_batch_unknown_visibility_evaluated_count).toBe(1);
  expect(summary.setup_family_breakdowns.map((item) => item.setup_family)).toEqual(
    expect.arrayContaining(["momentum_breakout", "vwap_pullback", "unknown"]),
  );
  expect(
    summary.ticker_breakdowns.find((item) => item.key === "PLTR")
      ?.research_only_count,
  ).toBe(1);
  expect(
    summary.window_breakdowns.find((item) => item.key === "power_hour")
      ?.research_only_count,
  ).toBe(1);
  expect(
    summary.tier_breakdowns.find((item) => item.key === "experimental")
      ?.research_only_count,
  ).toBe(1);
});

test("daily learning review sample confidence labels follow outcome count", () => {
  expect(confidenceSummary(29).sample_size_label).toBe("low");
  expect(confidenceSummary(30).sample_size_label).toBe("medium");
  expect(confidenceSummary(100).sample_size_label).toBe("high");
});

test("daily learning review detects production-style research-only visibility split", () => {
  const visibleSnapshots = Array.from({ length: 16 }, (_, index) =>
    snapshot(`VIS${index}`, {
      snapshot_fingerprint: `snap-visible-${index}`,
      recommendation_id: `rec-visible-${index}`,
      payload_json: {
        batch_fingerprint: "rec_batch_daily",
        visibility_status: "visible",
        day_trade_window_recommendation_target: { tier: "valid" },
      },
    }),
  );
  const researchSnapshots = Array.from({ length: 15 }, (_, index) =>
    snapshot(`RES${index}`, {
      snapshot_fingerprint: `snap-research-${index}`,
      recommendation_id: null,
      status: "hidden",
      is_visible: false,
      source_mode: "research_only",
      data_mode: "research_only",
      payload_json: {
        batch_fingerprint: "rec_batch_daily",
        learning_metadata: {
          visibility_status: "research_only",
          learning_acceleration_sample: true,
          not_live_signal: true,
          not_live_trade_signal: true,
        },
        day_trade_window_recommendation_target: { tier: "experimental" },
      },
    }),
  );
  const horizons = ["15m", "30m", "60m"] as const;
  const summary = buildDailyLearningReviewSummary({
    trading_day: tradingDay,
    latest_batch_fingerprint: "rec_batch_daily",
    snapshots: [...visibleSnapshots, ...researchSnapshots],
    outcomes: [
      ...visibleSnapshots.flatMap((item) =>
        horizons.map((horizon) =>
          outcome(item.ticker ?? "VIS", {
            id: `outcome-${item.snapshot_fingerprint}-${horizon}`,
            horizon,
            snapshot_fingerprint: item.snapshot_fingerprint,
            recommendation_id: item.recommendation_id,
          }),
        ),
      ),
      ...researchSnapshots.flatMap((item) =>
        horizons.map((horizon) =>
          outcome(item.ticker ?? "RES", {
            id: `outcome-${item.snapshot_fingerprint}-${horizon}`,
            horizon,
            snapshot_fingerprint: item.snapshot_fingerprint,
            recommendation_id: null,
            payload_json: {
              learning_acceleration_sample: true,
              visibility_status: "research_only",
            },
          }),
        ),
      ),
    ],
    now: evaluatedAt,
  });

  expect(summary.visible_evaluated_count).toBe(48);
  expect(summary.research_only_evaluated_count).toBe(45);
  expect(summary.unknown_visibility_evaluated_count).toBe(0);
  expect(summary.visible_unique_snapshot_count).toBe(16);
  expect(summary.research_only_unique_snapshot_count).toBe(15);
  expect(summary.unknown_visibility_unique_snapshot_count).toBe(0);
  expect(
    summary.visibility_diagnostics.source_counts.recommendation_metadata,
  ).toBeGreaterThanOrEqual(45);
  expect(summary.visibility_diagnostics.unknown_examples).toHaveLength(0);
});

test("daily learning review does not classify visible rows as research-only from ambiguous outcome payload", () => {
  const visibleSnapshot = snapshot("AAPL", {
    confidence: "not_available",
    score: "not_available",
    payload_json: {
      batch_fingerprint: "rec_batch_daily",
      visibility_status: "visible",
      day_trade_window_recommendation_target: { tier: "strong" },
    },
  });
  const summary = buildDailyLearningReviewSummary({
    trading_day: tradingDay,
    latest_batch_fingerprint: "rec_batch_daily",
    snapshots: [visibleSnapshot],
    outcomes: [
      outcome("AAPL", {
        snapshot_fingerprint: visibleSnapshot.snapshot_fingerprint,
        recommendation_id: visibleSnapshot.recommendation_id,
        payload_json: {
          batch_fingerprint: "rec_batch_daily",
          run_fingerprint: "rec_scan_run_daily_review",
          not_live_signal: true,
        },
      }),
    ],
    now: evaluatedAt,
  });

  expect(summary.visible_evaluated_count).toBe(1);
  expect(summary.research_only_evaluated_count).toBe(0);
  expect(summary.unknown_visibility_evaluated_count).toBe(0);
  expect(
    summary.confidence_calibration.outcomes_with_tier_fallback_confidence_count,
  ).toBe(1);
  expect(summary.confidence_calibration.unknown_confidence_count).toBe(0);
});

test("daily learning review joins production-shaped intelligence metadata", () => {
  const horizons = ["15m", "30m", "60m"] as const;
  const visibleSnapshots = Array.from({ length: 16 }, (_, index) =>
    snapshot(`VIS${index}`, {
      snapshot_fingerprint: `snap_visible_prod_${index}`,
      recommendation_id: `rec-visible-prod-${index}`,
      confidence: "not_available",
      score: "not_available",
      payload_json: {
        batch_fingerprint: "rec_batch_prod",
        visibility_status: "visible",
        day_trade_window_recommendation_target: { tier: "valid" },
      },
    }),
  );
  const researchSnapshots = Array.from({ length: 15 }, (_, index) =>
    snapshot(`RES${index}`, {
      snapshot_fingerprint: `snap_research_rec_scan_run_prod_res_${index}`,
      recommendation_id: null,
      scan_run_id: "rec_scan_run_prod",
      status: "hidden",
      is_visible: false,
      source_mode: "research_only",
      data_mode: "research_only",
      confidence: "not_available",
      score: "not_available",
      payload_json: {
        batch_fingerprint: "rec_batch_prod",
        run_fingerprint: "rec_scan_run_prod",
        learning_metadata: {
          visibility_status: "research_only",
          learning_acceleration_sample: true,
          not_live_signal: true,
          not_live_trade_signal: true,
        },
        day_trade_window_recommendation_target: { tier: "experimental" },
      },
    }),
  );
  const summary = buildDailyLearningReviewSummary({
    trading_day: tradingDay,
    latest_batch_fingerprint: "rec_batch_prod",
    snapshots: [...visibleSnapshots, ...researchSnapshots],
    outcomes: [
      ...visibleSnapshots.flatMap((item) =>
        horizons.map((horizon) =>
          outcome(item.ticker ?? "VIS", {
            id: `outcome-${item.snapshot_fingerprint}-${horizon}`,
            horizon,
            snapshot_fingerprint: item.snapshot_fingerprint,
            recommendation_id: item.recommendation_id,
            payload_json: {
              batch_fingerprint: "rec_batch_prod",
              run_fingerprint: "rec_scan_run_prod",
              not_live_signal: true,
            },
          }),
        ),
      ),
      ...researchSnapshots.flatMap((item, index) =>
        horizons.map((horizon) =>
          outcome(item.ticker ?? "RES", {
            id: `outcome-research-${index}-${horizon}`,
            horizon,
            snapshot_fingerprint: `snap-research-rec-scan-run-prod-res-${index}`,
            snapshot_id: null,
            recommendation_id: null,
            payload_json: {
              batch_fingerprint: "rec_batch_prod",
              run_fingerprint: "rec_scan_run_prod",
            },
          }),
        ),
      ),
    ],
    now: evaluatedAt,
  });

  expect(summary.visible_evaluated_count).toBe(48);
  expect(summary.research_only_evaluated_count).toBe(45);
  expect(summary.unknown_visibility_evaluated_count).toBe(0);
  expect(summary.visible_unique_snapshot_count).toBe(16);
  expect(summary.research_only_unique_snapshot_count).toBe(15);
  expect(summary.unknown_visibility_unique_snapshot_count).toBe(0);
  expect(
    summary.snapshot_join_diagnostics.join_source_counts
      .snapshot_fingerprint_exact,
  ).toBe(48);
  expect(
    summary.snapshot_join_diagnostics.join_source_counts
      .normalized_snapshot_fingerprint,
  ).toBe(45);
  expect(
    summary.confidence_calibration.outcomes_with_tier_fallback_confidence_count,
  ).toBe(93);
  expect(summary.confidence_calibration.unknown_confidence_count).toBe(0);
  expect(
    summary.confidence_calibration.buckets.find((item) => item.bucket === "60_69")
      ?.outcome_count,
  ).toBe(45);
  expect(
    summary.confidence_calibration.buckets.find((item) => item.bucket === "70_79")
      ?.outcome_count,
  ).toBe(48);
  expect(
    summary.metadata_readback_diagnostics.snapshot_enrichment_success_count,
  ).toBe(93);
  expect(
    summary.metadata_readback_diagnostics
      .research_snapshot_enrichment_success_count,
  ).toBe(45);
  expect(
    summary.metadata_readback_diagnostics.confidence_after_enrichment
      .tier_fallback,
  ).toBe(93);
  expect(
    summary.metadata_readback_diagnostics.visibility_after_enrichment,
  ).toEqual({
    visible: 48,
    research_only: 45,
    unknown: 0,
  });
});

test("daily learning review joins snapshots by snapshot id batch ticker and scan run ticker", () => {
  const snapshotIdMatch = snapshot("SID", {
    id: "snapshot-row-id",
    snapshot_fingerprint: "snap-id-source",
    recommendation_id: null,
    payload_json: {
      batch_fingerprint: "rec_batch_join",
      visibility_status: "visible",
      day_trade_window_recommendation_target: { tier: "valid" },
    },
  });
  const batchTickerMatch = snapshot("BTCH", {
    snapshot_fingerprint: "snap-batch-source",
    recommendation_id: null,
    source_mode: "research_only",
    data_mode: "research_only",
    payload_json: {
      batch_fingerprint: "rec_batch_join",
      visibility_status: "research_only",
      learning_acceleration_sample: true,
      day_trade_window_recommendation_target: { tier: "experimental" },
    },
  });
  const scanRunTickerMatch = snapshot("RUN", {
    snapshot_fingerprint: "snap-run-source",
    recommendation_id: null,
    scan_run_id: "rec_scan_run_join",
    source_mode: "research_only",
    data_mode: "research_only",
    payload_json: {
      visibility_status: "research_only",
      learning_acceleration_sample: true,
      day_trade_window_recommendation_target: { tier: "experimental" },
    },
  });
  const summary = buildDailyLearningReviewSummary({
    trading_day: tradingDay,
    latest_batch_fingerprint: "rec_batch_join",
    snapshots: [snapshotIdMatch, batchTickerMatch, scanRunTickerMatch],
    outcomes: [
      outcome("SID", {
        id: "outcome-snapshot-id",
        snapshot_id: "snapshot-row-id",
        snapshot_fingerprint: null,
        recommendation_id: null,
      }),
      outcome("BTCH", {
        id: "outcome-batch-ticker",
        snapshot_id: null,
        snapshot_fingerprint: null,
        recommendation_id: null,
        payload_json: { batch_fingerprint: "rec_batch_join" },
      }),
      outcome("RUN", {
        id: "outcome-scan-run-ticker",
        snapshot_id: null,
        snapshot_fingerprint: null,
        recommendation_id: null,
        payload_json: { run_fingerprint: "rec_scan_run_join" },
      }),
    ],
    now: evaluatedAt,
  });

  expect(
    summary.snapshot_join_diagnostics.join_source_counts.snapshot_id_exact,
  ).toBe(1);
  expect(summary.snapshot_join_diagnostics.join_source_counts.batch_ticker).toBe(
    1,
  );
  expect(
    summary.snapshot_join_diagnostics.join_source_counts.scan_run_ticker,
  ).toBe(1);
  expect(summary.visible_evaluated_count).toBe(1);
  expect(summary.research_only_evaluated_count).toBe(2);
  expect(summary.unknown_visibility_evaluated_count).toBe(0);
});

test("daily learning review records missing join diagnostics", () => {
  const summary = buildDailyLearningReviewSummary({
    trading_day: tradingDay,
    latest_batch_fingerprint: "rec_batch_missing",
    snapshots: [],
    outcomes: [
      outcome("MISS", {
        snapshot_id: "missing-snapshot-id",
        snapshot_fingerprint: "missing-snapshot-fingerprint",
        recommendation_id: null,
        payload_json: {
          batch_fingerprint: "rec_batch_missing",
          run_fingerprint: "rec_scan_run_missing",
        },
      }),
    ],
    now: evaluatedAt,
  });

  expect(summary.snapshot_join_diagnostics.outcomes_with_snapshot_join).toBe(0);
  expect(summary.snapshot_join_diagnostics.join_source_counts.missing).toBe(1);
  expect(summary.snapshot_join_diagnostics.missing_join_examples[0]).toMatchObject({
    ticker: "MISS",
    batch_fingerprint: "rec_batch_missing",
    scan_run_fingerprint: "rec_scan_run_missing",
  });
});

test("daily learning review generates engine adjustment candidates", () => {
  const powerHourSnapshots = Array.from({ length: 5 }, (_, index) =>
    snapshot(`PH${index}`, {
      snapshot_fingerprint: `snap-power-${index}`,
      recommendation_id: `rec-power-${index}`,
      window: "power_hour",
    }),
  );
  const summary = buildDailyLearningReviewSummary({
    trading_day: tradingDay,
    latest_batch_fingerprint: "rec_batch_daily",
    snapshots: powerHourSnapshots,
    outcomes: powerHourSnapshots.map((item, index) =>
      outcome(item.ticker ?? `PH${index}`, {
        snapshot_fingerprint: item.snapshot_fingerprint,
        recommendation_id: item.recommendation_id,
        status: "entry_not_triggered",
        entry_triggered: false,
        best_r: 0.65,
        worst_r: -0.05,
      }),
    ),
    now: evaluatedAt,
  });
  const candidates = summary.engine_adjustment_candidates.map(
    (item) => item.candidate,
  );

  expect(candidates).toContain("insufficient_sample_size");
  expect(candidates).toContain("target_too_far");
  expect(candidates).toContain("entry_not_triggering");
});

test("market diagnostics renders daily learning review section", () => {
  const dailyReview = buildDailyLearningReviewSummary({
    trading_day: tradingDay,
    latest_batch_fingerprint: "rec_batch_daily",
    snapshots: [snapshot("AAPL")],
    outcomes: [outcome("AAPL", { best_r: 0.7 })],
    now: evaluatedAt,
  });
  const diagnostics = buildMarketDiagnosticsConsoleSummary(
    baseDiagnosticsInput(dailyReview),
  );
  const section = diagnostics.sections.find(
    (item) => item.section_id === "daily_learning_review",
  );

  expect(section).toBeTruthy();
  expect(section?.metrics.latest_evaluated_batch_fingerprint).toBe(
    "rec_batch_daily",
  );
  expect(section?.lines.join("\n")).toContain("Visible/research-only/unknown");
  expect(section?.lines.join("\n")).toContain("Visibility detection sources");
  expect(section?.lines.join("\n")).toContain("Intelligence metadata readback");
  expect(section?.lines.join("\n")).toContain("Intelligence metadata enrichment");
  expect(section?.lines.join("\n")).toContain("Confidence after enrichment");
  expect(section?.lines.join("\n")).toContain("Snapshot join sources");
  expect(section?.lines.join("\n")).toContain("Window groups");
  expect(section?.lines.join("\n")).toContain("Tier groups");
  expect(section?.lines.join("\n")).toContain("Sample confidence");
});
