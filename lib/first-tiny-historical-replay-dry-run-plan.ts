import {
  buildFirstTinyCandlePersistenceResultVerification,
  type FirstTinyCandlePersistenceResultVerificationSummary,
} from "@/lib/first-tiny-historical-candle-persistence-result-verification";

export const firstTinyHistoricalReplayDryRunPlanMarker =
  "action_298_first_tiny_persisted_candle_replay_dry_run_plan";

export const firstTinyHistoricalReplayDryRunSourceVerification =
  "first_tiny_historical_candle_persistence_verified";

export type FirstTinyHistoricalReplayDryRunPlanStatus = "planned";

export type FirstTinyHistoricalReplayDryRunPlanSummary = {
  replay_plan_status: FirstTinyHistoricalReplayDryRunPlanStatus;
  plan_marker: typeof firstTinyHistoricalReplayDryRunPlanMarker;
  dry_run_only: true;
  source_verification: typeof firstTinyHistoricalReplayDryRunSourceVerification;
  source_table: "historical_candles";
  provider: "twelve_data";
  ticker: "AAPL";
  interval: "5min";
  trading_day: "2026-07-08";
  fetch_run_id: "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f";
  candle_rows_available: 73;
  candle_rows_verified: 73;
  replay_allowed_now: false;
  synthetic_outcome_persistence_allowed_now: false;
  scanner_use_allowed_now: false;
  ranking_change_allowed_now: false;
  requires_separate_operator_approval: true;
  lookahead_safety_required: true;
  candidate_replay_scope: {
    tickers: ["AAPL"];
    trading_days: ["2026-07-08"];
    intervals: ["5min"];
    verified_window_ny: "09:45-15:45 America/New_York";
    verified_window_utc: "2026-07-08T13:45:00.000Z-2026-07-08T19:45:00.000Z";
    source_candles: "persisted historical_candles";
    sample_origin: "historical_persisted_first_tiny";
    allowed_future_use: "dry_run_counterfactual_only";
    disallowed_current_use: [
      "scanner",
      "ranking",
      "live_recommendations",
    ];
  };
  lookahead_safety_gates: [
    "analysis_cutoff_required_per_candidate",
    "no_future_candles_visible_before_cutoff",
    "entry_exit_simulation_uses_only_candles_after_generated_signal_time",
    "no_synthetic_outcomes_persisted_without_separate_approval",
    "no_scanner_or_ranking_changes_without_separate_approval",
  ];
  future_approval_contract: {
    active_now: false;
    env_names: [
      "TURE_FIRST_TINY_REPLAY_APPROVED",
      "TURE_FIRST_TINY_REPLAY_OPERATOR_LABEL",
      "TURE_FIRST_TINY_REPLAY_REFERENCE",
      "TURE_FIRST_TINY_REPLAY_TICKER",
      "TURE_FIRST_TINY_REPLAY_TRADING_DAY",
      "TURE_FIRST_TINY_REPLAY_MAX_TICKERS",
      "TURE_FIRST_TINY_REPLAY_MAX_DAYS",
      "TURE_FIRST_TINY_REPLAY_SYNTHETIC_OUTCOME_PERSIST_ALLOWED",
      "TURE_FIRST_TINY_REPLAY_SCANNER_EFFECT_ALLOWED",
      "TURE_FIRST_TINY_REPLAY_RANKING_EFFECT_ALLOWED",
    ];
  };
  safety: {
    provider_call_executed: false;
    provider_call_attempted: false;
    historical_fetch_added: false;
    candles_persisted: false;
    raw_response_persisted: false;
    fetch_run_persisted: false;
    synthetic_outcomes_persisted: false;
    replay_executed: false;
    scanner_behavior_changed: false;
    live_ranking_changed: false;
  };
  blockers: [];
  warnings: [];
  recommended_next_steps: [
    "review_replay_dry_run_plan",
    "add_replay_approval_gate",
    "keep_synthetic_outcomes_scanner_and_ranking_disabled",
  ];
};

export type FirstTinyHistoricalReplayDryRunPlanInput = {
  candle_persistence_result?: FirstTinyCandlePersistenceResultVerificationSummary | null;
};

export function buildFirstTinyHistoricalReplayDryRunPlan(
  input: FirstTinyHistoricalReplayDryRunPlanInput = {},
): FirstTinyHistoricalReplayDryRunPlanSummary {
  const result =
    input.candle_persistence_result ??
    buildFirstTinyCandlePersistenceResultVerification();

  return {
    replay_plan_status: "planned",
    plan_marker: firstTinyHistoricalReplayDryRunPlanMarker,
    dry_run_only: true,
    source_verification: firstTinyHistoricalReplayDryRunSourceVerification,
    source_table: result.target_table,
    provider: result.provider,
    ticker: result.ticker,
    interval: result.interval,
    trading_day: result.trading_day,
    fetch_run_id: result.fetch_run_id,
    candle_rows_available: result.readback_rows,
    candle_rows_verified: result.matched_rows,
    replay_allowed_now: false,
    synthetic_outcome_persistence_allowed_now: false,
    scanner_use_allowed_now: false,
    ranking_change_allowed_now: false,
    requires_separate_operator_approval: true,
    lookahead_safety_required: true,
    candidate_replay_scope: {
      tickers: ["AAPL"],
      trading_days: ["2026-07-08"],
      intervals: ["5min"],
      verified_window_ny: "09:45-15:45 America/New_York",
      verified_window_utc:
        "2026-07-08T13:45:00.000Z-2026-07-08T19:45:00.000Z",
      source_candles: "persisted historical_candles",
      sample_origin: "historical_persisted_first_tiny",
      allowed_future_use: "dry_run_counterfactual_only",
      disallowed_current_use: [
        "scanner",
        "ranking",
        "live_recommendations",
      ],
    },
    lookahead_safety_gates: [
      "analysis_cutoff_required_per_candidate",
      "no_future_candles_visible_before_cutoff",
      "entry_exit_simulation_uses_only_candles_after_generated_signal_time",
      "no_synthetic_outcomes_persisted_without_separate_approval",
      "no_scanner_or_ranking_changes_without_separate_approval",
    ],
    future_approval_contract: {
      active_now: false,
      env_names: [
        "TURE_FIRST_TINY_REPLAY_APPROVED",
        "TURE_FIRST_TINY_REPLAY_OPERATOR_LABEL",
        "TURE_FIRST_TINY_REPLAY_REFERENCE",
        "TURE_FIRST_TINY_REPLAY_TICKER",
        "TURE_FIRST_TINY_REPLAY_TRADING_DAY",
        "TURE_FIRST_TINY_REPLAY_MAX_TICKERS",
        "TURE_FIRST_TINY_REPLAY_MAX_DAYS",
        "TURE_FIRST_TINY_REPLAY_SYNTHETIC_OUTCOME_PERSIST_ALLOWED",
        "TURE_FIRST_TINY_REPLAY_SCANNER_EFFECT_ALLOWED",
        "TURE_FIRST_TINY_REPLAY_RANKING_EFFECT_ALLOWED",
      ],
    },
    safety: {
      provider_call_executed: false,
      provider_call_attempted: false,
      historical_fetch_added: false,
      candles_persisted: false,
      raw_response_persisted: false,
      fetch_run_persisted: false,
      synthetic_outcomes_persisted: false,
      replay_executed: false,
      scanner_behavior_changed: false,
      live_ranking_changed: false,
    },
    blockers: [],
    warnings: [],
    recommended_next_steps: [
      "review_replay_dry_run_plan",
      "add_replay_approval_gate",
      "keep_synthetic_outcomes_scanner_and_ranking_disabled",
    ],
  };
}
