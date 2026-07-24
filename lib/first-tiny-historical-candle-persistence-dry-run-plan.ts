import { firstTinyFetchRunAuditWriteResultVerificationMarker } from "@/lib/first-tiny-historical-fetch-run-audit-write-result-verification";

export const firstTinyHistoricalCandlePersistenceDryRunPlanMarker =
  "first_tiny_historical_candle_persistence_dry_run_planned";

export type FirstTinyHistoricalCandlePersistenceDryRunPlanSummary = {
  plan_status: "planned";
  plan_marker: typeof firstTinyHistoricalCandlePersistenceDryRunPlanMarker;
  plan_mode: "dry_run_only";
  source_verification: typeof firstTinyFetchRunAuditWriteResultVerificationMarker;
  target_table: "historical_candles";
  dry_run_only: true;
  candle_write_allowed_now: false;
  request_scope: {
    provider: "twelve_data";
    ticker: "AAPL";
    interval: "5min";
    trading_day: "2026-07-08";
    session: "regular";
    timezone: "America/New_York";
    adjusted: false;
    cache_key: "twelve_data:AAPL:5min:2026-07-08:official_windows:America/New_York:adjusted_false";
  };
  fetch_run: {
    fetch_run_id: "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f";
    fetch_run_id_attached: true;
    audit_write_verified: true;
  };
  count_level_plan: {
    count_level_plan_ready: true;
    expected_candle_rows: 27;
    planned_inserts: 27;
    planned_updates: 0;
    planned_skips: 0;
    planned_invalid_rejections: 0;
    conflict_target: ["provider", "ticker", "interval", "timestamp", "adjusted"];
  };
  payload_availability: {
    candle_payload_available: false;
    executable_candle_rows_available: false;
    executable_candle_write_ready: false;
    ready_for_future_candle_write: false;
    reason: "raw_or_normalized_candle_payload_intentionally_not_persisted_during_no_persist_test";
    no_ohlcv_values_invented: true;
    normalized_candle_rows: [];
  };
  safety: {
    lookahead_safety_required: true;
    scanner_use_disabled: true;
    replay_use_disabled: true;
    synthetic_outcomes_disabled: true;
    provider_fetch_added: false;
    historical_fetch_added: false;
    candles_persisted: false;
    raw_response_persisted: false;
    fetch_run_persisted_by_this_plan: false;
    synthetic_outcomes_persisted: false;
    replay_executed: false;
    scanner_behavior_changed: false;
    live_ranking_changed: false;
  };
  recommended_next_steps: [
    "review_candle_payload_availability",
    "require_separate_provider_refetch_or_payload_capture_before_candle_write_if_payload_missing",
    "keep_replay_and_scanner_effects_disabled",
  ];
  caution_flags: [
    "dry_run_only",
    "candle_payload_unavailable",
    "executable_candle_write_not_ready",
  ];
};

export function buildFirstTinyHistoricalCandlePersistenceDryRunPlan(): FirstTinyHistoricalCandlePersistenceDryRunPlanSummary {
  return {
    plan_status: "planned",
    plan_marker: firstTinyHistoricalCandlePersistenceDryRunPlanMarker,
    plan_mode: "dry_run_only",
    source_verification: firstTinyFetchRunAuditWriteResultVerificationMarker,
    target_table: "historical_candles",
    dry_run_only: true,
    candle_write_allowed_now: false,
    request_scope: {
      provider: "twelve_data",
      ticker: "AAPL",
      interval: "5min",
      trading_day: "2026-07-08",
      session: "regular",
      timezone: "America/New_York",
      adjusted: false,
      cache_key:
        "twelve_data:AAPL:5min:2026-07-08:official_windows:America/New_York:adjusted_false",
    },
    fetch_run: {
      fetch_run_id: "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f",
      fetch_run_id_attached: true,
      audit_write_verified: true,
    },
    count_level_plan: {
      count_level_plan_ready: true,
      expected_candle_rows: 27,
      planned_inserts: 27,
      planned_updates: 0,
      planned_skips: 0,
      planned_invalid_rejections: 0,
      conflict_target: [
        "provider",
        "ticker",
        "interval",
        "timestamp",
        "adjusted",
      ],
    },
    payload_availability: {
      candle_payload_available: false,
      executable_candle_rows_available: false,
      executable_candle_write_ready: false,
      ready_for_future_candle_write: false,
      reason:
        "raw_or_normalized_candle_payload_intentionally_not_persisted_during_no_persist_test",
      no_ohlcv_values_invented: true,
      normalized_candle_rows: [],
    },
    safety: {
      lookahead_safety_required: true,
      scanner_use_disabled: true,
      replay_use_disabled: true,
      synthetic_outcomes_disabled: true,
      provider_fetch_added: false,
      historical_fetch_added: false,
      candles_persisted: false,
      raw_response_persisted: false,
      fetch_run_persisted_by_this_plan: false,
      synthetic_outcomes_persisted: false,
      replay_executed: false,
      scanner_behavior_changed: false,
      live_ranking_changed: false,
    },
    recommended_next_steps: [
      "review_candle_payload_availability",
      "require_separate_provider_refetch_or_payload_capture_before_candle_write_if_payload_missing",
      "keep_replay_and_scanner_effects_disabled",
    ],
    caution_flags: [
      "dry_run_only",
      "candle_payload_unavailable",
      "executable_candle_write_not_ready",
    ],
  };
}
