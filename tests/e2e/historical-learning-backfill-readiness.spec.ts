import { expect, test } from "@playwright/test";

import {
  buildHistoricalLearningBackfillReadiness,
  type HistoricalLearningBackfillReadinessInput,
} from "../../lib/historical-learning-backfill-readiness";
import { buildMarketDiagnosticsConsoleSummary } from "../../lib/market-diagnostics-console";
import type { MarketDiagnosticsConsoleInput } from "../../lib/market-diagnostics-console";

const evaluatedAt = "2026-07-09T15:00:00.000Z";

function readiness(input: HistoricalLearningBackfillReadinessInput = {}) {
  return buildHistoricalLearningBackfillReadiness(input);
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
      next_action: { label: "Review historical backfill readiness" },
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
      summary_id: "provider_budget_guard_test",
      summary_version: "1.0",
      summary_kind: "provider_budget_guard",
      generated_at: evaluatedAt,
      plan_mode: "grow",
      status: "within_budget",
      status_message: "ok",
      selected_tickers_per_window: 25,
      configured_scan_budget: 25,
      safe_selected_ticker_cap: 75,
      estimates: {
        scan_candidate_generation: {
          estimate_id: "scan",
          label: "scan",
          calls_per_window: 25,
          calls_per_day: 75,
          assumptions: [],
        },
        outcome_evaluation: {
          estimate_id: "outcome",
          label: "outcome",
          calls_per_window: 25,
          calls_per_day: 75,
          assumptions: [],
        },
        daily_schedule: {
          estimate_id: "daily",
          label: "daily",
          calls_per_window: 50,
          calls_per_day: 150,
          assumptions: [],
        },
      },
      totals: {
        estimated_calls_per_window: 50,
        estimated_calls_per_day: 150,
        estimated_outcome_calls: 75,
        official_scan_windows_per_day: 3,
        background_scans_per_day: 0,
      },
      budget_limits: {
        daily_soft_limit: 2500,
        window_soft_limit: 450,
        source: "internal_conservative_default",
      },
      dynamic_movers: {
        status: "provider_unavailable",
        provider: null,
        estimated_calls_per_window: 0,
      },
      outcome_evaluation: {
        pending_snapshots: 0,
        horizons: ["15m", "30m", "60m"],
        estimated_calls: 0,
      },
      latest_limit_signal: {
        signal_id: "none",
        status: "none",
        provider: null,
        source: "test",
        message: "none",
        observed_at: null,
      },
      warnings: [],
      next_action: {
        action_id: "none",
        priority: "watch",
        label: "No action",
        message: "No action",
      },
      copy: {
        conservative_estimates: "",
        broad_scanning: "",
        rate_limits: "",
        plan_boundary: "",
      },
    },
    provider_plan_profile: {
      mode: "grow",
      effective_mode: "grow",
      source: "server_env",
      server_plan_mode: "grow",
      public_plan_mode: "unknown",
      plan_mode_mismatch: false,
      profile_scan_ticker_cap: 25,
      profile_outcome_candle_requests_per_run: 25,
      profile_background_scan_cadence_minutes: 10,
      profile_scheduled_skip_openai: true,
      profile_scheduled_timeout_ms: 23_000,
      provider_budget_warning_threshold: 0.75,
      profile_notes: [],
      profile_warnings: [],
      overrides: {
        scan_ticker_cap: null,
        outcome_candle_requests_per_run: null,
        background_scan_cadence_minutes: null,
        scheduled_skip_openai: null,
        scheduled_timeout_ms: null,
      },
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
        qa_checked_source_path: "historical_learning_backfill_readiness_test",
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

test("empty input does not throw and remains advisory", () => {
  const summary = readiness();

  expect(summary.advisory_only).toBe(true);
  expect(summary.readiness.ready_to_plan).toBe(true);
  expect(summary.provider_capacity.provider).toBe("twelve_data");
});

test("safety flags prevent fetch persistence and scanner changes", () => {
  const summary = readiness();

  expect(summary.safety.provider_fetch_added).toBe(false);
  expect(summary.safety.historical_fetch_added).toBe(false);
  expect(summary.safety.synthetic_outcomes_persisted).toBe(false);
  expect(summary.safety.scanner_behavior_changed).toBe(false);
  expect(summary.safety.live_ranking_changed).toBe(false);
  expect(summary.readiness.ready_to_fetch_historical_data).toBe(false);
  expect(summary.readiness.ready_to_persist_synthetic_outcomes).toBe(false);
  expect(summary.readiness.safe_to_affect_scanner).toBe(false);
});

test("lookahead safety is required and explicit", () => {
  const summary = readiness();

  expect(summary.lookahead_safety.required).toBe(true);
  expect(summary.lookahead_safety.analysis_cutoff_required).toBe(true);
  expect(summary.lookahead_safety.outcome_after_cutoff_only).toBe(true);
  expect(summary.lookahead_safety.future_data_allowed_in_signal_generation).toBe(
    false,
  );
  expect(summary.lookahead_safety.rule).toContain(
    "simulated analysis timestamp",
  );
});

test("live and synthetic sample origins are separated", () => {
  const summary = readiness();

  expect(summary.sample_types.live_visible).toBe(true);
  expect(summary.sample_types.research_only).toBe(true);
  expect(summary.sample_types.shadow_intraday).toBe(true);
  expect(summary.sample_types.historical_synthetic).toBe(true);
  expect(summary.storage_readiness.must_mark_sample_origin).toBe(true);
  expect(summary.storage_readiness.must_separate_live_from_synthetic).toBe(true);
});

test("background jobs are planned but inactive", () => {
  const summary = readiness();

  for (const job of Object.values(summary.proposed_jobs)) {
    expect(job.status).toBe("planned");
    expect(job.active).toBe(false);
    expect(job.safety).toContain("not_active");
  }
});

test("provider headroom can be unknown safely", () => {
  const summary = readiness();

  expect(summary.provider_capacity.estimated_available_headroom).toBeNull();
  expect(summary.provider_capacity.safe_background_budget_per_minute).toBeNull();
  expect(summary.caution_flags).toContain("provider_headroom_unknown");
});

test("provider capacity uses existing budget diagnostics when available", () => {
  const diagnosticsInput = baseDiagnosticsInput();
  const summary = readiness({
    provider_plan_profile: diagnosticsInput.provider_plan_profile,
    provider_budget_guard: diagnosticsInput.provider_budget_guard,
  });

  expect(summary.provider_capacity.plan_profile).toBe("grow");
  expect(summary.provider_capacity.current_usage_observed).toBe(150);
  expect(summary.provider_capacity.estimated_available_headroom).toBe(2350);
  expect(summary.provider_capacity.safe_background_budget_per_minute).not.toBeNull();
});

test("recommended next steps include storage and budget planning", () => {
  const summary = readiness();

  expect(summary.recommended_next_steps).toContain(
    "plan_historical_backfill_storage",
  );
  expect(summary.recommended_next_steps).toContain(
    "define_backfill_budget_policy",
  );
});

test("diagnostics section prints expected safety lines", () => {
  const diagnostics = buildMarketDiagnosticsConsoleSummary(baseDiagnosticsInput());
  const section = diagnostics.sections.find(
    (item) => item.section_id === "historical_learning_backfill_readiness",
  );
  const intelligence = diagnostics.sections.find(
    (item) => item.section_id === "intelligence_overview",
  );

  expect(section).toBeTruthy();
  expect(section?.lines).toContain("Advisory mode: yes");
  expect(section?.lines).toContain("Provider: twelve_data");
  expect(section?.lines).toContain("Plan profile: grow");
  expect(section?.lines).toContain("Preferred interval: 5min");
  expect(section?.lines).toContain("Initial history days: 5-20");
  expect(section?.lines).toContain("Lookahead safety: required");
  expect(section?.lines).toContain(
    "Nightly historical backfill: planned / not active",
  );
  expect(section?.lines).toContain("Ready to fetch historical data: no");
  expect(section?.lines).toContain(
    "Ready to persist synthetic outcomes: no",
  );
  expect(section?.lines).toContain("Safe to affect scanner: no");
  expect(section?.lines).toContain("Provider fetch added: no");
  expect(section?.lines).toContain("Historical fetch added: no");
  expect(section?.lines).toContain("Synthetic outcomes persisted: no");
  expect(section?.lines).toContain("Scanner behavior changed: no");
  expect(
    intelligence?.lines.some((line) =>
      line.startsWith("Historical backfill readiness: planned"),
    ),
  ).toBe(true);
});
