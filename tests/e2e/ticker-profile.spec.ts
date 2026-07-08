import { expect, test } from "@playwright/test";

import {
  buildDailyLearningReviewSummary,
  type DailyLearningReviewSummary,
} from "../../lib/daily-learning-review";
import { buildMarketDiagnosticsConsoleSummary } from "../../lib/market-diagnostics-console";
import type { MarketDiagnosticsConsoleInput } from "../../lib/market-diagnostics-console";
import type { RecommendationOutcome } from "../../lib/recommendation-outcome-tracker";
import type { RecommendationSnapshot } from "../../lib/recommendation-snapshot";
import {
  buildTickerProfileForTicker,
  buildTickerProfiles,
  buildTickerProfileSummary,
  type TureTickerProfileInputOutcome,
} from "../../lib/ticker-profile";

const tradingDay = "2026-07-06";
const evaluatedAt = "2026-07-06T15:00:00.000Z";

function profileOutcome(
  ticker: string | null,
  overrides: Partial<TureTickerProfileInputOutcome> = {},
): TureTickerProfileInputOutcome {
  return {
    ticker,
    snapshot_identity: overrides.snapshot_identity ?? `snap-${ticker ?? "unknown"}`,
    visibility: overrides.visibility ?? "visible",
    entry_triggered: overrides.entry_triggered ?? true,
    entry_not_triggered: overrides.entry_not_triggered ?? false,
    target_hit: overrides.target_hit ?? false,
    stop_hit: overrides.stop_hit ?? false,
    best_r: "best_r" in overrides ? (overrides.best_r ?? null) : 0.4,
    worst_r: "worst_r" in overrides ? (overrides.worst_r ?? null) : -0.1,
    terminal_r:
      "terminal_r" in overrides ? (overrides.terminal_r ?? null) : 0.1,
    setup_family:
      "setup_family" in overrides
        ? (overrides.setup_family ?? null)
        : "momentum_breakout",
    window: "window" in overrides ? (overrides.window ?? null) : "midday",
    tier: "tier" in overrides ? (overrides.tier ?? null) : "valid",
  };
}

function repeatedOutcomes(
  ticker: string,
  count: number,
  overrides: Partial<TureTickerProfileInputOutcome> = {},
) {
  return Array.from({ length: count }, (_, index) =>
    profileOutcome(ticker, {
      ...overrides,
      snapshot_identity: `snap-${ticker}-${index}`,
    }),
  );
}

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
    scan_run_id: overrides.scan_run_id ?? "rec_scan_run_ticker_profile",
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
      batch_fingerprint: "rec_batch_ticker_profile",
      visibility_status: researchOnly ? "research_only" : "visible",
      setup_type: "momentum breakout",
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
    best_r: "best_r" in overrides ? (overrides.best_r ?? null) : 0.4,
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
      scanner_readiness: { selected_ticker_count: 2 },
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
      selected_tickers: ["AAPL", "PLTR"],
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
        qa_checked_source_path: "ticker_profile_test",
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
        batch_fingerprint: "rec_batch_ticker_profile",
        scan_run_fingerprint: "rec_scan_run_ticker_profile",
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

test("ticker profile builds visible outcome profile", () => {
  const profile = buildTickerProfileForTicker({
    ticker: "AAPL",
    outcomes: [profileOutcome("AAPL", { target_hit: true, best_r: 1.2 })],
  });

  expect(profile.ticker).toBe("AAPL");
  expect(profile.visible_outcome_count).toBe(1);
  expect(profile.research_only_outcome_count).toBe(0);
  expect(profile.target_hit_count).toBe(1);
  expect(profile.sector_group).toBe("technology");
  expect(profile.reason_codes).toContain("has_visible_outcomes");
  expect(profile.advisory_only).toBe(true);
});

test("ticker profile builds research-only and mixed profiles", () => {
  const profiles = buildTickerProfiles({
    outcomes: [
      profileOutcome("PLTR", {
        visibility: "research_only",
        setup_family: "vwap_pullback",
      }),
      profileOutcome("AMD", { visibility: "visible" }),
      profileOutcome("AMD", {
        visibility: "research_only",
        snapshot_identity: "snap-AMD-research",
      }),
    ],
  });
  const pltr = profiles.find((item) => item.ticker === "PLTR");
  const amd = profiles.find((item) => item.ticker === "AMD");

  expect(pltr?.research_only_outcome_count).toBe(1);
  expect(pltr?.reason_codes).toContain("has_research_only_outcomes");
  expect(amd?.visible_outcome_count).toBe(1);
  expect(amd?.research_only_outcome_count).toBe(1);
});

test("ticker profile handles unknown ticker and missing R metrics", () => {
  const profile = buildTickerProfileForTicker({
    ticker: null,
    outcomes: [
      profileOutcome(null, {
        ticker: null,
        best_r: null,
        worst_r: null,
        terminal_r: null,
        setup_family: null,
      }),
    ],
  });

  expect(profile.ticker).toBe("UNKNOWN");
  expect(profile.ticker_status).toBe("unknown");
  expect(profile.avg_best_r).toBeNull();
  expect(profile.avg_worst_r).toBeNull();
  expect(profile.caution_flags).toContain("unknown_sector_mapping");
  expect(profile.caution_flags).toContain("unknown_setup_mix");
});

test("ticker profile enriches sector, setup, window, and tier mixes", () => {
  const profile = buildTickerProfileForTicker({
    ticker: "NVDA",
    outcomes: [
      profileOutcome("NVDA", {
        setup_family: "momentum_breakout",
        window: "morning",
        tier: "strong",
      }),
      profileOutcome("NVDA", {
        snapshot_identity: "snap-NVDA-2",
        setup_family: "vwap_pullback",
        window: "power_hour",
        tier: "experimental",
      }),
    ],
  });

  expect(profile.industry).toBe("semiconductors");
  expect(profile.setup_family_mix.momentum_breakout).toBe(1);
  expect(profile.setup_family_mix.vwap_pullback).toBe(1);
  expect(profile.window_mix.morning).toBe(1);
  expect(profile.tier_mix.experimental).toBe(1);
  expect(profile.best_setup_families[0]?.setup_family).toBe("momentum_breakout");
});

test("ticker profile confidence and status thresholds are conservative", () => {
  const fresh = buildTickerProfileForTicker({
    ticker: "AAPL",
    outcomes: repeatedOutcomes("AAPL", 4),
  });
  const observed = buildTickerProfileForTicker({
    ticker: "AAPL",
    outcomes: repeatedOutcomes("AAPL", 30, {
      best_r: 0.35,
      worst_r: -0.2,
    }),
  });
  const trusted = buildTickerProfileForTicker({
    ticker: "AAPL",
    outcomes: repeatedOutcomes("AAPL", 100, {
      best_r: 0.6,
      worst_r: -0.2,
      entry_triggered: true,
    }),
  });

  expect(fresh.ticker_status).toBe("new");
  expect(fresh.sample_confidence).toBe("low");
  expect(observed.ticker_status).toBe("observed");
  expect(observed.sample_confidence).toBe("medium");
  expect(observed.ticker_confidence).toBe("medium");
  expect(trusted.ticker_status).toBe("trusted");
  expect(trusted.sample_confidence).toBe("high");
  expect(trusted.ticker_confidence).toBe("high");
});

test("ticker profile flags weak follow-through and deprioritizes only with enough data", () => {
  const weak = buildTickerProfileForTicker({
    ticker: "SMCI",
    outcomes: repeatedOutcomes("SMCI", 30, {
      best_r: 0.05,
      worst_r: -0.9,
      stop_hit: true,
    }),
  });
  const earlyWeak = buildTickerProfileForTicker({
    ticker: "SMCI",
    outcomes: repeatedOutcomes("SMCI", 3, {
      best_r: 0.05,
      worst_r: -0.9,
    }),
  });

  expect(weak.ticker_status).toBe("deprioritized");
  expect(weak.caution_flags).toContain("weak_follow_through");
  expect(weak.caution_flags).toContain("high_stop_hit_rate");
  expect(earlyWeak.ticker_status).toBe("new");
  expect(earlyWeak.caution_flags).toContain("insufficient_outcome_history");
});

test("ticker profile summary counts statuses and caution flags", () => {
  const profiles = buildTickerProfiles({
    outcomes: [
      ...repeatedOutcomes("AAPL", 4),
      ...repeatedOutcomes("PLTR", 5, {
        visibility: "research_only",
        best_r: 0.7,
      }),
      ...repeatedOutcomes("MSTR", 30, {
        best_r: 0.05,
        worst_r: -0.9,
        stop_hit: true,
      }),
    ],
  });
  const summary = buildTickerProfileSummary(profiles);

  expect(summary.advisory_mode).toBe(true);
  expect(summary.profiles_built_count).toBe(3);
  expect(summary.new_count).toBe(1);
  expect(summary.observed_count).toBe(1);
  expect(summary.deprioritized_count).toBe(1);
  expect(summary.top_caution_flags.insufficient_outcome_history).toBe(2);
  expect(summary.tickers_needing_more_data).toContain("AAPL");
});

test("daily learning review includes ticker profiles", () => {
  const visibleAapl = snapshot("AAPL");
  const researchPltr = snapshot("PLTR", {
    source_mode: "research_only",
    data_mode: "research_only",
    payload_json: {
      batch_fingerprint: "rec_batch_ticker_profile",
      visibility_status: "research_only",
      learning_acceleration_sample: true,
      setup_type: "VWAP reclaim pullback",
    },
  });
  const summary = buildDailyLearningReviewSummary({
    trading_day: tradingDay,
    latest_batch_fingerprint: "rec_batch_ticker_profile",
    snapshots: [visibleAapl, researchPltr],
    outcomes: [
      outcome("AAPL", {
        snapshot_fingerprint: visibleAapl.snapshot_fingerprint,
        recommendation_id: visibleAapl.recommendation_id,
      }),
      outcome("PLTR", {
        snapshot_fingerprint: researchPltr.snapshot_fingerprint,
        recommendation_id: researchPltr.recommendation_id,
        best_r: 0.8,
      }),
    ],
    now: evaluatedAt,
  });

  expect(summary.ticker_profiles).toHaveLength(2);
  expect(summary.ticker_profile_summary.profiles_built_count).toBe(2);
  expect(summary.ticker_profile_summary.new_count).toBe(2);
  expect(
    summary.ticker_profiles.find((item) => item.ticker === "PLTR")
      ?.research_only_outcome_count,
  ).toBe(1);
});

test("market diagnostics renders ticker profiles section", () => {
  const visibleAapl = snapshot("AAPL");
  const summary = buildDailyLearningReviewSummary({
    trading_day: tradingDay,
    latest_batch_fingerprint: "rec_batch_ticker_profile",
    snapshots: [visibleAapl],
    outcomes: [
      outcome("AAPL", {
        snapshot_fingerprint: visibleAapl.snapshot_fingerprint,
        recommendation_id: visibleAapl.recommendation_id,
        best_r: 0.9,
      }),
    ],
    now: evaluatedAt,
  });
  const diagnostics = buildMarketDiagnosticsConsoleSummary(
    baseDiagnosticsInput(summary),
  );
  const section = diagnostics.sections.find(
    (item) => item.section_id === "ticker_profiles",
  );
  const dailySection = diagnostics.sections.find(
    (item) => item.section_id === "daily_learning_review",
  );

  expect(section).toBeTruthy();
  expect(section?.lines.join("\n")).toContain("Advisory mode: yes");
  expect(section?.lines.join("\n")).toContain("Profiles built: 1");
  expect(section?.lines.join("\n")).toContain(
    "Sample confidence low/medium/high: 1/0/0",
  );
  expect(section?.lines.join("\n")).toContain("Top caution flags");
  expect(dailySection?.lines.join("\n")).toContain("Ticker profiles built");
  expect(dailySection?.lines.join("\n")).toContain(
    "Top ticker profiles by avg best R",
  );
});
