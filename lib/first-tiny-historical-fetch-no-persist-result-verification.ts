export const firstTinyHistoricalFetchNoPersistVerificationMarker =
  "first_tiny_historical_fetch_no_persist_verified";

export type FirstTinyHistoricalFetchNoPersistResultVerificationSummary = {
  verification_status: "verified";
  verification_marker: typeof firstTinyHistoricalFetchNoPersistVerificationMarker;
  manual_result_timestamp: string | null;
  timestamp_note: string;
  route_used: "POST /api/historical-backfill/first-tiny-fetch";
  request_body: {
    execute_provider_call: true;
  };
  approval_context: {
    approval_signal_status: "valid_for_future_action";
    signal_active: true;
    signal_valid_for_execution: true;
    operator_label: "willy_manual_approval_001";
    approval_reference: "first_tiny_historical_fetch_no_persist_20260709";
  };
  request_scope: {
    provider: "twelve_data";
    endpoint: "time_series";
    ticker: "AAPL";
    interval: "5min";
    trading_day: "2026-07-08";
    start_date: "2026-07-08T13:45:00.000Z";
    end_date: "2026-07-08T19:45:00.000Z";
    timezone: "America/New_York";
    session: "regular";
    adjusted: false;
    request_count: 1;
    estimated_credits: 1;
    cache_key: "twelve_data:AAPL:5min:2026-07-08:official_windows:America/New_York:adjusted_false";
  };
  preflight: {
    final_preflight_ready: true;
    request_preview_ready: true;
    execution_plan_ready: true;
    schema_readback_ok: true;
    provider_env_present: true;
    budget_policy_present: true;
    lookahead_safety_present: true;
    cache_lookup_required: true;
  };
  cache_result: {
    cache_lookup_attempted: true;
    cache_hit: false;
    provider_skipped_due_cache_hit: false;
  };
  provider_result: {
    execution_status: "provider_call_completed_no_persist";
    provider_call_capable: true;
    provider_call_executed: true;
    call_attempted: true;
    call_succeeded: true;
    http_status: 200;
    raw_response_received: true;
    raw_response_persisted: false;
    api_key_included_in_diagnostics: false;
  };
  parser_result: {
    parse_attempted: true;
    parse_status: "ok";
    raw_candles: 27;
    normalized_candles: 27;
    valid_candles: 27;
    invalid_candles: 0;
    duplicate_timestamps: 0;
    out_of_order_candles: 0;
  };
  persistence_plan: {
    persistence_planned: true;
    candles_persisted: false;
    fetch_run_persisted: false;
    planned_inserts: 27;
    planned_updates: 0;
    planned_skips: 0;
    planned_invalid_rejections: 0;
  };
  safety: {
    dry_execute_only: true;
    raw_response_persisted: false;
    candles_persisted: false;
    fetch_run_persisted: false;
    synthetic_outcomes_persisted: false;
    replay_executed: false;
    scanner_behavior_changed: false;
    live_ranking_changed: false;
    max_one_request_enforced: true;
    max_one_ticker_enforced: true;
    no_persistence_enforced: true;
  };
  recommended_next_steps: [
    "disable_or_remove_first_tiny_approval_signal",
    "disable_first_tiny_fetch_approval_signal_after_successful_no_persist_test",
    "review_no_persist_result_before_enabling_fetch_run_audit_write",
    "require_separate_approval_before_any_database_write",
  ];
};

export function buildFirstTinyHistoricalFetchNoPersistResultVerification(): FirstTinyHistoricalFetchNoPersistResultVerificationSummary {
  return {
    verification_status: "verified",
    verification_marker: firstTinyHistoricalFetchNoPersistVerificationMarker,
    manual_result_timestamp: null,
    timestamp_note:
      "manual production result timestamp was not captured in the reported result",
    route_used: "POST /api/historical-backfill/first-tiny-fetch",
    request_body: {
      execute_provider_call: true,
    },
    approval_context: {
      approval_signal_status: "valid_for_future_action",
      signal_active: true,
      signal_valid_for_execution: true,
      operator_label: "willy_manual_approval_001",
      approval_reference: "first_tiny_historical_fetch_no_persist_20260709",
    },
    request_scope: {
      provider: "twelve_data",
      endpoint: "time_series",
      ticker: "AAPL",
      interval: "5min",
      trading_day: "2026-07-08",
      start_date: "2026-07-08T13:45:00.000Z",
      end_date: "2026-07-08T19:45:00.000Z",
      timezone: "America/New_York",
      session: "regular",
      adjusted: false,
      request_count: 1,
      estimated_credits: 1,
      cache_key:
        "twelve_data:AAPL:5min:2026-07-08:official_windows:America/New_York:adjusted_false",
    },
    preflight: {
      final_preflight_ready: true,
      request_preview_ready: true,
      execution_plan_ready: true,
      schema_readback_ok: true,
      provider_env_present: true,
      budget_policy_present: true,
      lookahead_safety_present: true,
      cache_lookup_required: true,
    },
    cache_result: {
      cache_lookup_attempted: true,
      cache_hit: false,
      provider_skipped_due_cache_hit: false,
    },
    provider_result: {
      execution_status: "provider_call_completed_no_persist",
      provider_call_capable: true,
      provider_call_executed: true,
      call_attempted: true,
      call_succeeded: true,
      http_status: 200,
      raw_response_received: true,
      raw_response_persisted: false,
      api_key_included_in_diagnostics: false,
    },
    parser_result: {
      parse_attempted: true,
      parse_status: "ok",
      raw_candles: 27,
      normalized_candles: 27,
      valid_candles: 27,
      invalid_candles: 0,
      duplicate_timestamps: 0,
      out_of_order_candles: 0,
    },
    persistence_plan: {
      persistence_planned: true,
      candles_persisted: false,
      fetch_run_persisted: false,
      planned_inserts: 27,
      planned_updates: 0,
      planned_skips: 0,
      planned_invalid_rejections: 0,
    },
    safety: {
      dry_execute_only: true,
      raw_response_persisted: false,
      candles_persisted: false,
      fetch_run_persisted: false,
      synthetic_outcomes_persisted: false,
      replay_executed: false,
      scanner_behavior_changed: false,
      live_ranking_changed: false,
      max_one_request_enforced: true,
      max_one_ticker_enforced: true,
      no_persistence_enforced: true,
    },
    recommended_next_steps: [
      "disable_or_remove_first_tiny_approval_signal",
      "disable_first_tiny_fetch_approval_signal_after_successful_no_persist_test",
      "review_no_persist_result_before_enabling_fetch_run_audit_write",
      "require_separate_approval_before_any_database_write",
    ],
  };
}
