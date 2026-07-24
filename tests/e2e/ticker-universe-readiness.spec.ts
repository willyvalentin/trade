import { expect, test } from "@playwright/test";

import {
  buildDailyLearningReviewSummary,
  type DailyLearningReviewSummary,
} from "../../lib/daily-learning-review";
import { buildMarketDiagnosticsConsoleSummary } from "../../lib/market-diagnostics-console";
import type { MarketDiagnosticsConsoleInput } from "../../lib/market-diagnostics-console";
import {
  buildTickerUniverseReadiness,
  type TickerUniverseReadinessInput,
} from "../../lib/ticker-universe-readiness";
import type { RecommendationOutcome } from "../../lib/recommendation-outcome-tracker";
import type { RecommendationSnapshot } from "../../lib/recommendation-snapshot";
import type { TureTickerProfile } from "../../lib/ticker-profile";

const evaluatedAt = "2026-07-06T15:00:00.000Z";
const tradingDay = "2026-07-06";

function profile(
  ticker: string,
  overrides: Partial<TureTickerProfile> = {},
): TureTickerProfile {
  return {
    ticker,
    sector: overrides.sector ?? "technology",
    industry: overrides.industry ?? "software",
    sector_group: overrides.sector_group ?? overrides.sector ?? "technology",
    ticker_status: overrides.ticker_status ?? "observed",
    ticker_confidence: overrides.ticker_confidence ?? "low",
    sample_confidence: overrides.sample_confidence ?? "low",
    outcome_count: overrides.outcome_count ?? 6,
    unique_snapshot_count: overrides.unique_snapshot_count ?? 2,
    visible_outcome_count: overrides.visible_outcome_count ?? 3,
    research_only_outcome_count: overrides.research_only_outcome_count ?? 3,
    unknown_visibility_outcome_count:
      overrides.unknown_visibility_outcome_count ?? 0,
    entry_triggered_count: overrides.entry_triggered_count ?? 3,
    entry_not_triggered_count: overrides.entry_not_triggered_count ?? 3,
    entry_trigger_rate: overrides.entry_trigger_rate ?? 50,
    target_hit_count: overrides.target_hit_count ?? 0,
    stop_hit_count: overrides.stop_hit_count ?? 0,
    neither_hit_count: overrides.neither_hit_count ?? 6,
    avg_best_r: overrides.avg_best_r ?? 0.2,
    avg_worst_r: overrides.avg_worst_r ?? -0.2,
    avg_terminal_r: overrides.avg_terminal_r ?? 0,
    setup_family_mix: overrides.setup_family_mix ?? { momentum: 6 },
    window_mix: overrides.window_mix ?? { midday: 6 },
    tier_mix: overrides.tier_mix ?? { valid: 6 },
    best_setup_families: overrides.best_setup_families ?? [],
    weak_setup_families: overrides.weak_setup_families ?? [],
    reason_codes: overrides.reason_codes ?? [],
    caution_flags: overrides.caution_flags ?? [],
    advisory_only: true,
  };
}

function readiness(input: Partial<TickerUniverseReadinessInput> = {}) {
  return buildTickerUniverseReadiness({
    configured_static_universe_count: 50,
    dynamic_movers: {
      status: "provider_unavailable",
      fetched_count: 0,
      selected_count: 0,
      gaps: ["No dynamic movers provider connected."],
    },
    ...input,
  });
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
    scan_run_id: overrides.scan_run_id ?? "rec_scan_run_readiness",
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
      batch_fingerprint: "rec_batch_readiness",
      visibility_status: researchOnly ? "research_only" : "visible",
      setup_type: "momentum",
      entry_type_metadata: {
        entry_type: "breakout",
        entry_trigger_semantics: "touch_entry",
      },
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
  const snapshotFingerprint = overrides.snapshot_fingerprint ?? `snap-${ticker}`;

  return {
    id: overrides.id ?? `outcome-${ticker}-${overrides.horizon ?? "15m"}`,
    snapshot_id: overrides.snapshot_id ?? snapshotFingerprint,
    recommendation_id:
      "recommendation_id" in overrides
        ? (overrides.recommendation_id ?? null)
        : `rec-${ticker}`,
    snapshot_fingerprint: snapshotFingerprint,
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
    best_r: overrides.best_r ?? 0.3,
    worst_r: overrides.worst_r ?? -0.1,
    eod_price: overrides.eod_price ?? null,
    eod_r: overrides.eod_r ?? null,
    current_price: overrides.current_price ?? 100,
    current_r: overrides.current_r ?? 0.1,
    max_favorable_excursion: overrides.max_favorable_excursion ?? 1,
    max_adverse_excursion: overrides.max_adverse_excursion ?? -1,
    time_to_entry_minutes: overrides.time_to_entry_minutes ?? 1,
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
        qa_checked_source_path: "ticker_universe_readiness_test",
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
        batch_fingerprint: "rec_batch_readiness",
        scan_run_fingerprint: "rec_scan_run_readiness",
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

test("empty readiness is advisory and cannot change scanner state", () => {
  const summary = buildTickerUniverseReadiness();

  expect(summary.advisory_only).toBe(true);
  expect(summary.summary.safe_to_change_universe).toBe(false);
  expect(summary.safety.scanner_universe_changed).toBe(false);
  expect(summary.safety.live_ranking_changed).toBe(false);
  expect(summary.safety.requires_manual_review).toBe(true);
  expect(summary.universe_status.profile_count).toBe(0);
});

test("low sample visible ticker is observed and needs more data, not core", () => {
  const summary = readiness({
    ticker_profiles: [
      profile("AAPL", {
        outcome_count: 6,
        visible_outcome_count: 6,
        research_only_outcome_count: 0,
        sample_confidence: "low",
      }),
    ],
  });

  expect(summary.ticker_classification.observed_candidates).toContain("AAPL");
  expect(summary.ticker_classification.needs_more_data).toContain("AAPL");
  expect(summary.ticker_classification.core_candidates).not.toContain("AAPL");
});

test("research-heavy tickers are classified separately", () => {
  const summary = readiness({
    ticker_profiles: [
      profile("PLTR", {
        visible_outcome_count: 1,
        research_only_outcome_count: 8,
        sample_confidence: "low",
      }),
    ],
  });

  expect(summary.ticker_classification.research_heavy_candidates).toEqual([
    "PLTR",
  ]);
  expect(summary.ticker_metrics[0]?.readiness_label).toBe("research_heavy");
});

test("medium sample visible ticker can become core candidate", () => {
  const summary = readiness({
    ticker_profiles: [
      profile("MSFT", {
        outcome_count: 35,
        unique_snapshot_count: 12,
        visible_outcome_count: 35,
        research_only_outcome_count: 0,
        sample_confidence: "medium",
        ticker_confidence: "medium",
        avg_best_r: 0.45,
        avg_worst_r: -0.2,
      }),
    ],
  });

  expect(summary.ticker_classification.core_candidates).toContain("MSFT");
});

test("weak low sample ticker is not aggressively deprioritized", () => {
  const summary = readiness({
    ticker_profiles: [
      profile("DIS", {
        outcome_count: 6,
        visible_outcome_count: 6,
        research_only_outcome_count: 0,
        sample_confidence: "low",
        avg_best_r: 0.02,
        avg_worst_r: -1.2,
        caution_flags: ["weak_follow_through"],
      }),
    ],
  });

  expect(summary.ticker_classification.observed_candidates).toContain("DIS");
  expect(
    summary.ticker_classification.possible_deprioritization_candidates,
  ).not.toContain("DIS");
});

test("high sample weak ticker becomes manual deprioritization candidate", () => {
  const summary = readiness({
    ticker_profiles: [
      profile("INTC", {
        outcome_count: 120,
        unique_snapshot_count: 40,
        visible_outcome_count: 120,
        research_only_outcome_count: 0,
        sample_confidence: "high",
        ticker_confidence: "high",
        avg_best_r: 0.04,
        avg_worst_r: -0.9,
      }),
    ],
  });

  expect(
    summary.ticker_classification.possible_deprioritization_candidates,
  ).toContain("INTC");
});

test("sector coverage reports overrepresentation and signals", () => {
  const summary = readiness({
    ticker_profiles: [
      profile("AAPL", { avg_best_r: 0.6 }),
      profile("MSFT", { avg_best_r: 0.5 }),
      profile("NVDA", { avg_worst_r: -0.7 }),
      profile("JPM", {
        sector: "financials",
        sector_group: "financials",
        industry: "banks",
      }),
      profile("XOM", {
        sector: "energy",
        sector_group: "energy",
        industry: "oil_gas",
      }),
    ],
  });

  expect(summary.sector_coverage.overrepresented_sectors).toContain(
    "technology",
  );
  expect(summary.sector_coverage.sectors_with_positive_signal).toContain(
    "technology",
  );
  expect(summary.sector_coverage.sectors_with_negative_signal).toContain(
    "technology",
  );
  expect(summary.sector_coverage.underrepresented_sectors.length).toBeGreaterThan(
    0,
  );
});

test("dynamic mover unavailable gap highlights research-only positive tickers", () => {
  const summary = readiness({
    ticker_profiles: [
      profile("DKNG", {
        visible_outcome_count: 0,
        research_only_outcome_count: 5,
        avg_best_r: 0.7,
      }),
    ],
  });

  expect(summary.dynamic_movers_gap.provider_available).toBe(false);
  expect(summary.ticker_classification.dynamic_mover_gap_candidates).toContain(
    "DKNG",
  );
  expect(summary.summary.recommended_focus).toContain(
    "connect_or_review_dynamic_movers_provider",
  );
});

test("daily learning review includes ticker universe readiness counts", () => {
  const summary = buildDailyLearningReviewSummary({
    trading_day: tradingDay,
    latest_batch_fingerprint: "rec_batch_readiness",
    configured_static_universe_count: 50,
    dynamic_movers: {
      status: "provider_unavailable",
      fetched_count: 0,
      selected_count: 0,
      gaps: ["No dynamic movers provider connected."],
    },
    snapshots: [snapshot("AAPL"), snapshot("PLTR", { source_mode: "research_only" })],
    outcomes: [
      outcome("AAPL", { best_r: 0.4 }),
      outcome("PLTR", {
        id: "outcome-PLTR-research",
        recommendation_id: null,
        snapshot_fingerprint: "snap-PLTR",
        best_r: 0.8,
        payload_json: { visibility_status: "research_only" },
      }),
    ],
    now: evaluatedAt,
  });

  expect(
    summary.ticker_universe_readiness.universe_status
      .configured_static_universe_count,
  ).toBe(50);
  expect(summary.ticker_universe_readiness.universe_status.evaluated_today_count).toBe(
    2,
  );
  expect(
    summary.ticker_universe_readiness.ticker_classification
      .research_heavy_candidates,
  ).toContain("PLTR");
  expect(summary.ticker_universe_readiness.summary.safe_to_change_universe).toBe(
    false,
  );
});

test("market diagnostics renders ticker universe readiness section", () => {
  const dailyReview = buildDailyLearningReviewSummary({
    trading_day: tradingDay,
    latest_batch_fingerprint: "rec_batch_readiness",
    configured_static_universe_count: 50,
    dynamic_movers: {
      status: "provider_unavailable",
      fetched_count: 0,
      selected_count: 0,
      gaps: ["No dynamic movers provider connected."],
    },
    snapshots: [snapshot("AAPL"), snapshot("PLTR", { source_mode: "research_only" })],
    outcomes: [
      outcome("AAPL", { best_r: 0.4 }),
      outcome("PLTR", {
        id: "outcome-PLTR-research",
        recommendation_id: null,
        snapshot_fingerprint: "snap-PLTR",
        best_r: 0.8,
        payload_json: { visibility_status: "research_only" },
      }),
    ],
    now: evaluatedAt,
  });

  const diagnostics = buildMarketDiagnosticsConsoleSummary(
    baseDiagnosticsInput(dailyReview),
  );
  const readinessSection = diagnostics.sections.find(
    (item) => item.section_id === "ticker_universe_readiness",
  );
  const dailySection = diagnostics.sections.find(
    (item) => item.section_id === "daily_learning_review",
  );

  expect(readinessSection).toBeTruthy();
  expect(readinessSection?.lines).toContain("Advisory mode: yes");
  expect(readinessSection?.lines).toContain("Static universe count: 50");
  expect(readinessSection?.lines).toContain(
    "Safe to change universe: no",
  );
  expect(readinessSection?.lines).toContain(
    "Scanner universe changed: no",
  );
  expect(dailySection?.lines.some((line) =>
    line.startsWith("Ticker universe readiness: observed 2"),
  )).toBe(true);
});
