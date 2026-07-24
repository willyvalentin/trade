import { expect, test } from "@playwright/test";

import { buildDailyLearningReviewSummary } from "../../lib/daily-learning-review";
import { buildHistoricalBackfillFetchPlan } from "../../lib/historical-backfill-fetch-planner";
import { buildMarketDiagnosticsConsoleSummary } from "../../lib/market-diagnostics-console";
import { buildProviderBudgetGuardSummary } from "../../lib/provider-budget-guard";
import { buildProviderPlanProfile } from "../../lib/provider-plan-profile";
import { buildTickerProfileSummary, type TureTickerProfile } from "../../lib/ticker-profile";
import { buildTickerUniverseReadiness } from "../../lib/ticker-universe-readiness";
import type { MarketDiagnosticsConsoleInput } from "../../lib/market-diagnostics-console";
import type { ScannerUniverseCoverageSummary } from "../../lib/scanner-universe";

const evaluatedAt = "2026-07-09T15:00:00.000Z";

function profile(
  ticker: string,
  overrides: Partial<TureTickerProfile> = {},
): TureTickerProfile {
  return {
    ticker,
    sector: overrides.sector ?? "technology",
    industry: overrides.industry ?? "software",
    sector_group: overrides.sector_group ?? "technology",
    ticker_status: overrides.ticker_status ?? "observed",
    ticker_confidence: overrides.ticker_confidence ?? "low",
    sample_confidence: overrides.sample_confidence ?? "low",
    outcome_count: overrides.outcome_count ?? 12,
    unique_snapshot_count: overrides.unique_snapshot_count ?? 12,
    visible_outcome_count: overrides.visible_outcome_count ?? 4,
    research_only_outcome_count: overrides.research_only_outcome_count ?? 8,
    unknown_visibility_outcome_count:
      overrides.unknown_visibility_outcome_count ?? 0,
    entry_triggered_count: overrides.entry_triggered_count ?? 6,
    entry_not_triggered_count: overrides.entry_not_triggered_count ?? 6,
    entry_trigger_rate: overrides.entry_trigger_rate ?? 50,
    target_hit_count: overrides.target_hit_count ?? 1,
    stop_hit_count: overrides.stop_hit_count ?? 1,
    neither_hit_count: overrides.neither_hit_count ?? 10,
    avg_best_r: overrides.avg_best_r ?? 0.18,
    avg_worst_r: overrides.avg_worst_r ?? -0.35,
    avg_terminal_r: overrides.avg_terminal_r ?? null,
    setup_family_mix: overrides.setup_family_mix ?? { momentum_breakout: 12 },
    window_mix: overrides.window_mix ?? { midday: 12 },
    tier_mix: overrides.tier_mix ?? { research_only: 12 },
    best_setup_families: overrides.best_setup_families ?? [],
    weak_setup_families: overrides.weak_setup_families ?? [],
    reason_codes: overrides.reason_codes ?? [],
    caution_flags: overrides.caution_flags ?? ["weak_follow_through"],
    advisory_only: true,
  };
}

const plannerProfiles = [
  profile("PLTR", {
    research_only_outcome_count: 18,
    visible_outcome_count: 0,
    caution_flags: ["research_only_heavy_sample"],
  }),
  profile("DKNG", {
    caution_flags: ["weak_follow_through"],
    avg_best_r: 0.08,
  }),
  profile("BAC", {
    caution_flags: ["high_entry_not_triggering_rate"],
    entry_trigger_rate: 35,
  }),
  profile("XOM", {
    sector: "energy",
    sector_group: "energy",
    industry: "oil_gas",
    caution_flags: ["insufficient_outcome_history"],
  }),
];

function plannerInput() {
  const tickerProfileSummary = buildTickerProfileSummary(plannerProfiles);
  const tickerUniverseReadiness = buildTickerUniverseReadiness({
    configured_static_universe_count: 50,
    observed_tickers: ["AAPL", "AMD", "PLTR", "DKNG", "BAC", "XOM"],
    evaluated_tickers: ["PLTR", "DKNG", "BAC", "XOM"],
    visible_tickers: ["AAPL", "AMD"],
    ticker_profiles: plannerProfiles,
    ticker_profile_summary: tickerProfileSummary,
    dynamic_movers: {
      status: "disabled",
      fetched_count: 0,
      selected_count: 0,
      gaps: ["dynamic_movers_disabled"],
    },
  });
  const providerPlanProfile = buildProviderPlanProfile({
    TWELVE_DATA_PLAN_MODE: "grow",
  });
  const providerBudgetGuard = buildProviderBudgetGuardSummary({
    plan_mode: "grow",
    scanner_universe: {
      selected_tickers: 6,
      scan_budget: {
        requested_tickers: 6,
        effective_tickers: 6,
      },
    } as ScannerUniverseCoverageSummary,
    custom_limits: {
      daily_soft_limit: 2500,
      window_soft_limit: 450,
    },
    provider_env: { twelve_data_configured: true },
    now: evaluatedAt,
  });

  return {
    provider_plan_profile: providerPlanProfile,
    provider_budget_guard: providerBudgetGuard,
    ticker_universe_readiness: tickerUniverseReadiness,
    ticker_profiles: plannerProfiles,
    ticker_profile_summary: tickerProfileSummary,
    visible_recent_tickers: ["AAPL", "AMD"],
    static_universe_tickers: ["AAPL", "AMD", "PLTR", "DKNG", "BAC", "XOM"],
  };
}

function baseDiagnosticsInput(
  overrides: Partial<MarketDiagnosticsConsoleInput> = {},
): MarketDiagnosticsConsoleInput {
  const input = plannerInput();
  const dailyLearningReview = buildDailyLearningReviewSummary({
    snapshots: [],
    outcomes: [],
    configured_static_universe_count: 50,
    now: evaluatedAt,
  });

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
        evaluated_recommendations: 0,
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
      next_action: { label: "Review backfill planner" },
      blockers: [],
      warnings: [],
    },
    scan_orchestration: {
      current_utc_time: evaluatedAt,
      current_ny_time: "2026-07-09 11:00 America/New_York",
      calendar_confidence: "high",
      provider_calendar_available: true,
      fallback_calendar_scan_allowed: false,
      active_window: "midday",
      decision: "scan_allowed",
      should_scan_now: true,
      next_window: "power_hour",
      next_window_label: "Power Hour",
      next_window_starts_at: "2026-07-09T19:00:00.000Z",
      warnings: [],
      official_scan_windows: [],
      official_window_statuses: [],
    },
    serving_cadence: {
      warnings: [],
      serving_decision: "served",
      no_trade_valid: false,
      visible_recommendation_count: 2,
      batch_status: "served",
      batch_target: { min: 2, max: 12 },
    },
    provider_budget_guard: input.provider_budget_guard,
    provider_plan_profile: input.provider_plan_profile,
    scanner_universe: {
      warnings: [],
      selected_tickers: 6,
      selected_ticker_symbols: ["AAPL", "AMD", "PLTR", "DKNG", "BAC", "XOM"],
      total_universe_size: 50,
    },
    scanner_output_qa: {
      overall_status: "healthy",
      summary: "healthy",
      warnings: [],
      recommended_next_action: { label: "No action" },
      candidate_count: 0,
      metadata_coverage: {
        recommendation_rows_with_data_timestamp: 0,
        recommendation_rows_with_provider_source: 0,
        explicit_gap_count: 0,
        missing_metadata_fields: [],
        qa_checked_source_path: "historical_backfill_fetch_planner_test",
        metadata_missing_at_stage: null,
      },
    },
    real_output_readiness: {
      overall_status: "ready",
      blockers: [],
      warnings: [],
      coverage: {
        strong_count: 0,
        valid_count: 0,
        experimental_count: 0,
      },
    },
    batch_memory: {
      warnings: [],
      latest_batch: null,
      persistence_status: "ok",
      persistence_mode: "persisted",
      total_batches: 0,
    },
    scan_run_history: {
      top_warnings: [],
      latest_run_status: "completed",
      total_scan_runs: 0,
    },
    daily_targets: {
      warnings: [],
      total_recommendations_today: 0,
      full_day_recommendation_target_min: 4,
      full_day_recommendation_target_max: 12,
    },
    day_window_target: {
      status: "served",
      strong_candidate_gate: {
        candidates_considered_for_strong: 0,
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
        total_recommendations: 0,
        pending_outcomes: 0,
        evaluated_recommendations: 0,
      },
    },
    daily_learning_review: {
      ...dailyLearningReview,
      ticker_universe_readiness: input.ticker_universe_readiness,
      ticker_profiles: input.ticker_profiles,
      ticker_profile_summary: input.ticker_profile_summary,
    },
    historical_candle_storage_detection: {
      historical_candles_table_detected: true,
      historical_candle_fetch_runs_table_detected: true,
      expected_unique_key_detected: true,
      expected_indexes_detected: true,
      rls_enabled_detected: true,
      client_write_policies_detected: false,
      client_read_policies_detected: false,
      detection_source: "mock_schema_readback",
      checked_at: evaluatedAt,
    },
    scan_readback: null,
    outcome_evaluation: null,
    outcome_learning: null,
    entry_tuning_proposal: null,
    recommendation_output_enrichment: null,
    metadata_coverage: null,
    ...overrides,
  } as unknown as MarketDiagnosticsConsoleInput;
}

test("empty input does not throw and remains dry-run only", () => {
  const plan = buildHistoricalBackfillFetchPlan();

  expect(plan.advisory_only).toBe(true);
  expect(plan.dry_run_only).toBe(true);
  expect(plan.plan_context.preferred_interval).toBe("5min");
  expect(plan.plan_context.history_days_planned).toBe(5);
  expect(plan.safety.provider_fetch_added).toBe(false);
  expect(plan.safety.historical_fetch_added).toBe(false);
  expect(plan.safety.candles_persisted).toBe(false);
  expect(plan.safety.synthetic_outcomes_persisted).toBe(false);
  expect(plan.safety.scanner_behavior_changed).toBe(false);
  expect(plan.safety.live_ranking_changed).toBe(false);
});

test("visible and research-heavy tickers are prioritized conservatively", () => {
  const plan = buildHistoricalBackfillFetchPlan(plannerInput());

  expect(plan.ticker_selection.selected_tickers.slice(0, 2)).toEqual([
    "AAPL",
    "AMD",
  ]);
  expect(plan.ticker_selection.selected_tickers).toContain("PLTR");
  expect(plan.ticker_selection.source_counts.visible_recent).toBe(2);
  expect(plan.ticker_selection.source_counts.research_heavy).toBeGreaterThan(0);
});

test("weak follow-through and entry-not-triggering sources appear in source mix", () => {
  const plan = buildHistoricalBackfillFetchPlan(plannerInput());

  expect(plan.plan_context.ticker_source_mix.weak_follow_through).toBeGreaterThan(
    0,
  );
  expect(
    plan.plan_context.ticker_source_mix.high_entry_not_triggering,
  ).toBeGreaterThan(0);
  expect(plan.plan_context.ticker_source_mix.dynamic_gap).toBeGreaterThan(0);
});

test("request and budget policy stay background-only", () => {
  const plan = buildHistoricalBackfillFetchPlan(plannerInput());

  expect(plan.request_plan.total_planned_requests).toBeGreaterThan(0);
  expect(plan.request_plan.estimated_provider_credits).toBe(
    plan.request_plan.total_planned_requests,
  );
  expect(plan.budget_policy.background_backfill_priority).toBe("low");
  expect(plan.budget_policy.pause_near_scan_windows).toBe(true);
  expect(plan.budget_policy.pause_on_provider_warnings).toBe(true);
  expect(plan.budget_policy.pause_when_market_open_if_needed).toBe(true);
});

test("migration unknown keeps historical fetch and persistence disabled", () => {
  const plan = buildHistoricalBackfillFetchPlan({
    ...plannerInput(),
    migration_applied: "unknown",
  });

  expect(plan.readiness.migration_applied).toBe("unknown");
  expect(plan.readiness.ready_to_fetch_historical_data).toBe(false);
  expect(plan.readiness.ready_to_persist_candles).toBe(false);
  expect(plan.readiness.ready_to_create_synthetic_outcomes).toBe(false);
  expect(plan.readiness.ready_to_run_replay).toBe(false);
  expect(plan.readiness.safe_to_affect_scanner).toBe(false);
});

test("diagnostics section prints expected safety lines", () => {
  const diagnostics = buildMarketDiagnosticsConsoleSummary(baseDiagnosticsInput());
  const section = diagnostics.sections.find(
    (item) => item.section_id === "historical_backfill_fetch_planner",
  );
  const intelligence = diagnostics.sections.find(
    (item) => item.section_id === "intelligence_overview",
  );

  expect(section).toBeTruthy();
  expect(section?.lines).toContain("Advisory mode: yes");
  expect(section?.lines).toContain("Dry run only: yes");
  expect(section?.lines).toContain("Provider: Twelve Data");
  expect(section?.lines).toContain("Preferred interval: 5min");
  expect(section?.lines).toContain("History days planned: 5");
  expect(section?.lines).toContain("Background priority: low");
  expect(section?.lines).toContain("Budget policy: background low priority");
  expect(section?.lines).toContain("Pause near scan windows: yes");
  expect(section?.lines).toContain("Pause on provider warnings: yes");
  expect(section?.lines).toContain("Migration applied: yes");
  expect(section?.lines).toContain("Ready to fetch historical data: no");
  expect(section?.lines).toContain("Ready to persist candles: no");
  expect(section?.lines).toContain("Ready to create synthetic outcomes: no");
  expect(section?.lines).toContain("Ready to run replay: no");
  expect(section?.lines).toContain("Safe to affect scanner: no");
  expect(section?.lines).toContain("Provider fetch added: no");
  expect(section?.lines).toContain("Historical fetch added: no");
  expect(section?.lines).toContain("Candles persisted: no");
  expect(section?.lines).toContain("Synthetic outcomes persisted: no");
  expect(section?.lines).toContain("Scanner behavior changed: no");
  expect(
    intelligence?.lines.some((line) =>
      line.startsWith("Historical backfill planner: dry-run"),
    ),
  ).toBe(true);
});
