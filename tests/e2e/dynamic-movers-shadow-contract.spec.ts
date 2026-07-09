import { expect, test } from "@playwright/test";

import {
  buildDynamicMoversShadowAudit,
  buildMockDynamicMoversFixture,
  validateDynamicMoverContract,
  type DynamicMoverContractMover,
} from "../../lib/dynamic-movers-shadow-fixture";
import { buildMarketDiagnosticsConsoleSummary } from "../../lib/market-diagnostics-console";
import type { MarketDiagnosticsConsoleInput } from "../../lib/market-diagnostics-console";
import { buildTickerUniverseReadiness } from "../../lib/ticker-universe-readiness";
import type { TureTickerProfile } from "../../lib/ticker-profile";

const evaluatedAt = "2026-07-09T15:00:00.000Z";

function mover(
  ticker: string,
  overrides: Partial<DynamicMoverContractMover> = {},
): DynamicMoverContractMover {
  return {
    ticker,
    source: "top_gainer",
    as_of: evaluatedAt,
    price: 100,
    percent_change: 3.2,
    volume: 1_000_000,
    relative_volume: 2.1,
    market_session: "regular",
    premarket_change_percent: 0.8,
    gap_percent: 1.1,
    catalyst_headline: "Mock catalyst",
    news_source: "mock_fixture",
    sector: "technology",
    industry: "software",
    reason_codes: ["mock_valid"],
    ...overrides,
  };
}

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
      next_action: { label: "Review shadow contract" },
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
      selected_tickers: 3,
      selected_ticker_symbols: ["AAPL", "PLTR", "DKNG"],
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
        qa_checked_source_path: "dynamic_movers_shadow_contract_test",
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

test("empty fixture does not throw and remains scanner safe", () => {
  const summary = buildDynamicMoversShadowAudit({
    movers: [],
    now: evaluatedAt,
  });

  expect(summary.fixture_summary.total_movers).toBe(0);
  expect(summary.shadow_readiness.safe_to_preview).toBe(false);
  expect(summary.shadow_readiness.safe_to_use_for_scanner).toBe(false);
  expect(summary.shadow_readiness.safe_to_change_universe).toBe(false);
  expect(summary.provider_fetch_added).toBe(false);
});

test("valid mover passes contract", () => {
  const validation = validateDynamicMoverContract(mover("PLTR"), {
    now: evaluatedAt,
  });

  expect(validation.status).toBe("valid");
  expect(validation.safe_to_preview).toBe(true);
  expect(validation.safe_to_shadow_compare).toBe(true);
  expect(validation.missing_required_fields).toEqual([]);
});

test("missing ticker source and as_of fails required identity", () => {
  const validation = validateDynamicMoverContract(
    mover("BAD", {
      ticker: null,
      source: null,
      as_of: null,
    }),
    { now: evaluatedAt },
  );

  expect(validation.status).toBe("missing_required_fields");
  expect(validation.safe_to_preview).toBe(false);
  expect(validation.missing_required_fields).toEqual(
    expect.arrayContaining(["ticker", "source", "as_of"]),
  );
});

test("missing price and change blocks shadow compare", () => {
  const validation = validateDynamicMoverContract(
    mover("SMCI", {
      price: null,
      last_price: null,
      percent_change: null,
      change_percent: null,
    }),
    { now: evaluatedAt },
  );

  expect(validation.status).toBe("preview_only");
  expect(validation.safe_to_preview).toBe(true);
  expect(validation.safe_to_shadow_compare).toBe(false);
  expect(validation.missing_required_fields).toEqual(
    expect.arrayContaining([
      "price_or_last_price",
      "percent_change_or_change_percent",
    ]),
  );
});

test("missing volume and relative volume blocks shadow compare", () => {
  const validation = validateDynamicMoverContract(
    mover("NKE", {
      volume: null,
      relative_volume: null,
    }),
    { now: evaluatedAt },
  );

  expect(validation.status).toBe("preview_only");
  expect(validation.safe_to_preview).toBe(true);
  expect(validation.safe_to_shadow_compare).toBe(false);
  expect(validation.missing_required_fields).toContain(
    "volume_or_relative_volume",
  );
});

test("stale timestamp is flagged", () => {
  const validation = validateDynamicMoverContract(
    mover("COIN", {
      as_of: "2026-07-09T12:00:00.000Z",
    }),
    { now: evaluatedAt },
  );

  expect(validation.status).toBe("stale");
  expect(validation.stale).toBe(true);
  expect(validation.safe_to_preview).toBe(false);
});

test("audit identifies outside-static-universe mover and research overlap", () => {
  const tickerUniverseReadiness = buildTickerUniverseReadiness({
    configured_static_universe_count: 50,
    ticker_profiles: [profile("PLTR"), profile("DKNG")],
  });
  const summary = buildDynamicMoversShadowAudit({
    movers: [mover("PLTR"), mover("AAPL"), mover("NEWM")],
    static_universe_count: 50,
    static_universe_symbols: ["AAPL", "PLTR"],
    ticker_universe_readiness: tickerUniverseReadiness,
    now: evaluatedAt,
  });

  expect(
    summary.static_universe_comparison.movers_inside_static_universe,
  ).toEqual(expect.arrayContaining(["AAPL", "PLTR"]));
  expect(
    summary.static_universe_comparison.movers_outside_static_universe,
  ).toContain("NEWM");
  expect(summary.static_universe_comparison.overlap_with_research_heavy).toContain(
    "PLTR",
  );
});

test("safe preview and shadow compare require valid mock data", () => {
  const validSummary = buildDynamicMoversShadowAudit({
    movers: [mover("PLTR")],
    now: evaluatedAt,
  });
  const invalidSummary = buildDynamicMoversShadowAudit({
    movers: [
      mover("BAD", {
        ticker: null,
        source: null,
        as_of: null,
      }),
    ],
    now: evaluatedAt,
  });

  expect(validSummary.shadow_readiness.safe_to_preview).toBe(true);
  expect(validSummary.shadow_readiness.safe_to_shadow_compare).toBe(true);
  expect(invalidSummary.shadow_readiness.safe_to_preview).toBe(false);
  expect(invalidSummary.shadow_readiness.safe_to_shadow_compare).toBe(false);
});

test("safety flags are always disabled for scanner and provider fetch", () => {
  const summary = buildDynamicMoversShadowAudit({
    movers: [mover("PLTR")],
    now: evaluatedAt,
  });

  expect(summary.shadow_readiness.safe_to_use_for_scanner).toBe(false);
  expect(summary.shadow_readiness.safe_to_change_universe).toBe(false);
  expect(summary.provider_fetch_added).toBe(false);
  expect(summary.safety.provider_fetch_added).toBe(false);
  expect(summary.safety.scanner_universe_changed).toBe(false);
  expect(summary.safety.live_ranking_changed).toBe(false);
});

test("default mock fixture includes valid flawed stale and outside examples", () => {
  const fixture = buildMockDynamicMoversFixture({ now: evaluatedAt });
  const summary = buildDynamicMoversShadowAudit({
    movers: fixture,
    static_universe_symbols: ["AAPL", "PLTR", "DKNG"],
    research_heavy_tickers: ["PLTR", "DKNG", "COIN"],
    visible_tickers: ["AAPL"],
    observed_tickers: ["AAPL", "PLTR", "COIN"],
    now: evaluatedAt,
  });

  expect(summary.fixture_summary.valid_movers).toBeGreaterThan(0);
  expect(summary.fixture_summary.preview_only_movers).toBeGreaterThan(0);
  expect(summary.fixture_summary.stale_movers).toBeGreaterThan(0);
  expect(summary.fixture_summary.missing_required_field_count).toBeGreaterThan(0);
  expect(
    summary.static_universe_comparison.movers_outside_static_universe,
  ).toContain("NEWM");
  expect(summary.static_universe_comparison.overlap_with_visible).toContain(
    "AAPL",
  );
});

test("diagnostics section prints expected lines", () => {
  const diagnostics = buildMarketDiagnosticsConsoleSummary(baseDiagnosticsInput());
  const section = diagnostics.sections.find(
    (item) => item.section_id === "dynamic_movers_shadow_contract",
  );
  const intelligence = diagnostics.sections.find(
    (item) => item.section_id === "intelligence_overview",
  );

  expect(section).toBeTruthy();
  expect(section?.lines).toContain("Advisory mode: yes");
  expect(section?.lines).toContain("Mock mode: yes");
  expect(section?.lines).toContain("Provider fetch added: no");
  expect(section?.lines).toContain("Safe to use for scanner: no");
  expect(section?.lines).toContain("Safe to change universe: no");
  expect(section?.lines).toContain("Scanner universe changed: no");
  expect(section?.lines).toContain("Live ranking changed: no");
  expect(
    intelligence?.lines.some((line) =>
      line.startsWith("Dynamic movers shadow contract: mock"),
    ),
  ).toBe(true);
});
