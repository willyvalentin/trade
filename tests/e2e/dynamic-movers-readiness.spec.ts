import { expect, test } from "@playwright/test";

import { buildMarketDiagnosticsConsoleSummary } from "../../lib/market-diagnostics-console";
import type { MarketDiagnosticsConsoleInput } from "../../lib/market-diagnostics-console";
import {
  buildDynamicMoversReadiness,
  type DynamicMoversReadinessMover,
} from "../../lib/dynamic-movers-readiness";
import { buildTickerUniverseReadiness } from "../../lib/ticker-universe-readiness";
import type { TureTickerProfile } from "../../lib/ticker-profile";

const evaluatedAt = "2026-07-06T15:00:00.000Z";

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
    visible_outcome_count: overrides.visible_outcome_count ?? 0,
    research_only_outcome_count: overrides.research_only_outcome_count ?? 6,
    unknown_visibility_outcome_count:
      overrides.unknown_visibility_outcome_count ?? 0,
    entry_triggered_count: overrides.entry_triggered_count ?? 3,
    entry_not_triggered_count: overrides.entry_not_triggered_count ?? 3,
    entry_trigger_rate: overrides.entry_trigger_rate ?? 50,
    target_hit_count: overrides.target_hit_count ?? 0,
    stop_hit_count: overrides.stop_hit_count ?? 0,
    neither_hit_count: overrides.neither_hit_count ?? 6,
    avg_best_r: overrides.avg_best_r ?? 0.5,
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

function completeMover(
  ticker: string,
  overrides: Partial<DynamicMoversReadinessMover> = {},
): DynamicMoversReadinessMover {
  return {
    ticker,
    source: "top_gainer",
    as_of: evaluatedAt,
    price: 100,
    percent_change: 4.2,
    volume: 1_000_000,
    relative_volume: 2.4,
    market_session: "regular",
    provider: "mock_provider",
    premarket_change_percent: 1.1,
    catalyst_headline: "Volume expansion",
    ...overrides,
  };
}

function baseDiagnosticsInput(
  overrides: Partial<MarketDiagnosticsConsoleInput> = {},
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
      next_action: { label: "Review movers readiness" },
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
      visible_recommendation_count: 0,
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
      selected_tickers: 2,
      selected_ticker_symbols: ["AAPL", "MSFT"],
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
        qa_checked_source_path: "dynamic_movers_readiness_test",
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
    scan_readback: null,
    outcome_evaluation: null,
    outcome_learning: null,
    daily_learning_review: null,
    entry_tuning_proposal: null,
    recommendation_output_enrichment: null,
    metadata_coverage: null,
    ...overrides,
  } as unknown as MarketDiagnosticsConsoleInput;
}

test("empty input does not throw and keeps scanner safety disabled", () => {
  const summary = buildDynamicMoversReadiness();

  expect(summary.advisory_only).toBe(true);
  expect(summary.provider_status.available).toBe(false);
  expect(summary.readiness.safe_to_use_for_scanner).toBe(false);
  expect(summary.readiness.safe_to_change_universe).toBe(false);
  expect(summary.safety.provider_fetch_added).toBe(false);
});

test("provider unavailable blocks preview and recommends connecting provider", () => {
  const summary = buildDynamicMoversReadiness({
    dynamic_movers_discovery: {
      summary_version: "1.0",
      summary_kind: "dynamic_movers_discovery",
      generated_at: evaluatedAt,
      discovery_enabled: true,
      provider_attempted: null,
      provider_used: null,
      provider_error_type: "missing_api_key",
      provider_error_message: "missing key",
      returned_count: 0,
      selected_preview_count: 0,
      stale_invalid_mover_count: 0,
      top_dynamic_movers: [],
    },
  });

  expect(summary.provider_status.enabled).toBe(true);
  expect(summary.provider_status.available).toBe(false);
  expect(summary.readiness.safe_to_preview).toBe(false);
  expect(summary.readiness.safe_to_shadow_compare).toBe(false);
  expect(summary.recommended_next_steps).toContain(
    "connect_dynamic_movers_provider",
  );
});

test("missing required fields produce metadata gaps", () => {
  const summary = buildDynamicMoversReadiness({
    movers: [{ ticker: "XYZ" }],
  });

  expect(summary.provider_status.available).toBe(true);
  expect(summary.metadata_gaps).toContain("missing_source");
  expect(summary.metadata_gaps).toContain("missing_as_of");
  expect(summary.metadata_gaps).toContain("missing_price_or_last_price");
  expect(summary.metadata_gaps).toContain(
    "missing_percent_change_or_change_percent",
  );
  expect(summary.metadata_gaps).toContain("missing_volume_or_relative_volume");
  expect(summary.metadata_gaps).toContain("missing_market_session");
});

test("complete mock movers can preview and shadow compare but not drive scanner", () => {
  const summary = buildDynamicMoversReadiness({
    movers: [completeMover("XYZ")],
  });

  expect(summary.readiness.intake_ready).toBe(true);
  expect(summary.readiness.safe_to_preview).toBe(true);
  expect(summary.readiness.safe_to_shadow_compare).toBe(true);
  expect(summary.readiness.safe_to_use_for_scanner).toBe(false);
  expect(summary.safety.scanner_universe_changed).toBe(false);
  expect(summary.safety.live_ranking_changed).toBe(false);
  expect(summary.safety.provider_fetch_added).toBe(false);
});

test("static universe comparison reports overlap and outside candidates", () => {
  const summary = buildDynamicMoversReadiness({
    static_universe_count: 2,
    static_universe_symbols: ["AAPL", "MSFT"],
    movers: [completeMover("AAPL"), completeMover("XYZ")],
  });

  expect(
    summary.static_universe_comparison.overlap_with_static_universe,
  ).toContain("AAPL");
  expect(
    summary.static_universe_comparison.outside_static_universe_candidates,
  ).toContain("XYZ");
});

test("research-heavy tickers become dynamic gap candidates when provider unavailable", () => {
  const tickerUniverseReadiness = buildTickerUniverseReadiness({
    configured_static_universe_count: 50,
    dynamic_movers: {
      status: "provider_unavailable",
      fetched_count: 0,
      selected_count: 0,
      gaps: ["No dynamic movers provider connected."],
    },
    ticker_profiles: [profile("PLTR"), profile("DKNG")],
  });
  const summary = buildDynamicMoversReadiness({
    ticker_universe_readiness: tickerUniverseReadiness,
    static_universe_count: 50,
    static_universe_symbols: ["AAPL", "MSFT"],
  });

  expect(summary.provider_status.available).toBe(false);
  expect(summary.static_universe_comparison.dynamic_gap_candidates).toContain(
    "PLTR",
  );
  expect(summary.static_universe_comparison.dynamic_gap_candidates).toContain(
    "DKNG",
  );
});

test("diagnostics section prints expected readiness lines", () => {
  const diagnostics = buildMarketDiagnosticsConsoleSummary(
    baseDiagnosticsInput({
      dynamic_movers_discovery: {
        summary_version: "1.0",
        summary_kind: "dynamic_movers_discovery",
        generated_at: evaluatedAt,
        discovery_enabled: true,
        provider_attempted: null,
        provider_used: null,
        provider_error_type: "missing_api_key",
        provider_error_message: "missing key",
        returned_count: 0,
        selected_preview_count: 0,
        stale_invalid_mover_count: 0,
        top_dynamic_movers: [],
      },
    } as unknown as Partial<MarketDiagnosticsConsoleInput>),
  );
  const section = diagnostics.sections.find(
    (item) => item.section_id === "dynamic_movers_readiness",
  );
  const intelligence = diagnostics.sections.find(
    (item) => item.section_id === "intelligence_overview",
  );

  expect(section).toBeTruthy();
  expect(section?.lines).toContain("Advisory mode: yes");
  expect(section?.lines).toContain("Provider enabled: yes");
  expect(section?.lines).toContain("Provider available: no");
  expect(section?.lines).toContain("Safe to use for scanner: no");
  expect(section?.lines).toContain("Safe to change universe: no");
  expect(section?.lines).toContain("Provider fetch added: no");
  expect(intelligence?.lines.some((line) =>
    line.startsWith("Dynamic movers readiness: provider unavailable"),
  )).toBe(true);
});
