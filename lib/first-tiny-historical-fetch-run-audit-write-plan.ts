import { buildFirstTinyHistoricalFetchNoPersistResultVerification } from "@/lib/first-tiny-historical-fetch-no-persist-result-verification";
import {
  buildHistoricalCandleStorageReadiness,
  type HistoricalCandleStorageReadinessInput,
  type HistoricalCandleStorageVerificationStatus,
} from "@/lib/historical-candle-storage-readiness";

export type FirstTinyHistoricalFetchRunAuditWritePlanSummary = {
  status: "planned";
  plan_mode: "dry_run_only";
  source_verification: "first_tiny_historical_fetch_no_persist_verified";
  target_table: "historical_candle_fetch_runs";
  table_readiness: {
    table_detected: HistoricalCandleStorageVerificationStatus;
    rls_enabled: HistoricalCandleStorageVerificationStatus;
    service_role_only_path_expected: true;
    client_writes_allowed: HistoricalCandleStorageVerificationStatus;
    client_writes_blocked: HistoricalCandleStorageVerificationStatus;
    schema_readback_attempted: boolean;
    schema_readback_status: "ok" | "partial" | "blocked" | "unavailable";
    detection_source: string;
  };
  planned_audit_record: {
    provider: "twelve_data";
    endpoint: "time_series";
    request_type: "time_series";
    ticker: "AAPL";
    ticker_count: 1;
    interval: "5min";
    trading_day: "2026-07-08";
    trading_day_start: "2026-07-08";
    trading_day_end: "2026-07-08";
    session: "regular";
    timezone: "America/New_York";
    adjusted: false;
    cache_key: "twelve_data:AAPL:5min:2026-07-08:official_windows:America/New_York:adjusted_false";
    request_count: 1;
    estimated_credits: 1;
    provider_credits_estimated: 1;
    provider_credits_used: 1;
    cache_hits: 0;
    cache_misses: 1;
    call_attempted: true;
    call_succeeded: true;
    http_status: 200;
    status: "completed_no_persist";
    parse_status: "ok";
    raw_candles: 27;
    normalized_candles: 27;
    valid_candles: 27;
    invalid_candles: 0;
    candle_count: 27;
    planned_inserts: 27;
    planned_updates: 0;
    planned_skips: 0;
    planned_invalid_rejections: 0;
    raw_response_persisted: false;
    candles_persisted: false;
    replay_executed: false;
    scanner_behavior_changed: false;
    live_ranking_changed: false;
  };
  write_gate: {
    dry_run_only: true;
    fetch_run_write_allowed_now: false;
    fetch_run_persisted: false;
    candles_persisted: false;
    raw_response_persisted: false;
    synthetic_outcomes_persisted: false;
    replay_executed: false;
    scanner_behavior_changed: false;
    live_ranking_changed: false;
    requires_separate_operator_approval: true;
    planned_audit_rows: 1;
    candle_rows_to_persist: 0;
    raw_response_to_persist: false;
  };
  future_approval_contract: {
    active_now: false;
    env_names: [
      "TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_APPROVED",
      "TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_OPERATOR_LABEL",
      "TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_REFERENCE",
      "TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_TICKER",
      "TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_MAX_ROWS",
      "TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_CANDLE_PERSIST_ALLOWED",
      "TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_REPLAY_ALLOWED",
      "TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_SCANNER_EFFECT_ALLOWED",
    ];
    validation_rules: [
      "approved_must_be_true",
      "operator_label_required",
      "approval_reference_required",
      "ticker_must_match_AAPL",
      "max_rows_must_equal_1",
      "candle_persistence_must_remain_false",
      "raw_response_persistence_must_remain_false",
      "replay_scanner_effects_must_remain_false",
    ];
  };
  recommended_next_steps: [
    "review_fetch_run_audit_write_plan",
    "require_separate_approval_before_fetch_run_audit_write",
    "keep_candle_persistence_disabled",
  ];
};

function invertedNoStatus(
  value: HistoricalCandleStorageVerificationStatus,
): HistoricalCandleStorageVerificationStatus {
  if (value === "no") return "yes";
  if (value === "yes") return "no";
  return "unknown";
}

export function buildFirstTinyHistoricalFetchRunAuditWritePlan(
  input: HistoricalCandleStorageReadinessInput = {},
): FirstTinyHistoricalFetchRunAuditWritePlanSummary {
  const verification = buildFirstTinyHistoricalFetchNoPersistResultVerification();
  const storageReadiness = buildHistoricalCandleStorageReadiness(input);
  const clientWritesAllowed =
    storageReadiness.migration_readiness.client_writes_allowed;

  return {
    status: "planned",
    plan_mode: "dry_run_only",
    source_verification: verification.verification_marker,
    target_table: "historical_candle_fetch_runs",
    table_readiness: {
      table_detected:
        storageReadiness.migration_readiness
          .historical_candle_fetch_runs_table_detected,
      rls_enabled: storageReadiness.migration_readiness.rls_enabled_detected,
      service_role_only_path_expected:
        storageReadiness.migration_readiness
          .service_role_internal_access_expected,
      client_writes_allowed: clientWritesAllowed,
      client_writes_blocked: invertedNoStatus(clientWritesAllowed),
      schema_readback_attempted:
        storageReadiness.migration_readiness.schema_readback_attempted,
      schema_readback_status:
        storageReadiness.migration_readiness.schema_readback_status,
      detection_source: storageReadiness.migration_readiness.detection_source,
    },
    planned_audit_record: {
      provider: verification.request_scope.provider,
      endpoint: verification.request_scope.endpoint,
      request_type: verification.request_scope.endpoint,
      ticker: verification.request_scope.ticker,
      ticker_count: 1,
      interval: verification.request_scope.interval,
      trading_day: verification.request_scope.trading_day,
      trading_day_start: verification.request_scope.trading_day,
      trading_day_end: verification.request_scope.trading_day,
      session: verification.request_scope.session,
      timezone: verification.request_scope.timezone,
      adjusted: verification.request_scope.adjusted,
      cache_key: verification.request_scope.cache_key,
      request_count: verification.request_scope.request_count,
      estimated_credits: verification.request_scope.estimated_credits,
      provider_credits_estimated:
        verification.request_scope.estimated_credits,
      provider_credits_used: verification.request_scope.estimated_credits,
      cache_hits: 0,
      cache_misses: 1,
      call_attempted: verification.provider_result.call_attempted,
      call_succeeded: verification.provider_result.call_succeeded,
      http_status: verification.provider_result.http_status,
      status: "completed_no_persist",
      parse_status: verification.parser_result.parse_status,
      raw_candles: verification.parser_result.raw_candles,
      normalized_candles: verification.parser_result.normalized_candles,
      valid_candles: verification.parser_result.valid_candles,
      invalid_candles: verification.parser_result.invalid_candles,
      candle_count: verification.parser_result.valid_candles,
      planned_inserts: verification.persistence_plan.planned_inserts,
      planned_updates: verification.persistence_plan.planned_updates,
      planned_skips: verification.persistence_plan.planned_skips,
      planned_invalid_rejections:
        verification.persistence_plan.planned_invalid_rejections,
      raw_response_persisted: false,
      candles_persisted: false,
      replay_executed: false,
      scanner_behavior_changed: false,
      live_ranking_changed: false,
    },
    write_gate: {
      dry_run_only: true,
      fetch_run_write_allowed_now: false,
      fetch_run_persisted: false,
      candles_persisted: false,
      raw_response_persisted: false,
      synthetic_outcomes_persisted: false,
      replay_executed: false,
      scanner_behavior_changed: false,
      live_ranking_changed: false,
      requires_separate_operator_approval: true,
      planned_audit_rows: 1,
      candle_rows_to_persist: 0,
      raw_response_to_persist: false,
    },
    future_approval_contract: {
      active_now: false,
      env_names: [
        "TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_APPROVED",
        "TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_OPERATOR_LABEL",
        "TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_REFERENCE",
        "TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_TICKER",
        "TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_MAX_ROWS",
        "TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_CANDLE_PERSIST_ALLOWED",
        "TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_REPLAY_ALLOWED",
        "TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_SCANNER_EFFECT_ALLOWED",
      ],
      validation_rules: [
        "approved_must_be_true",
        "operator_label_required",
        "approval_reference_required",
        "ticker_must_match_AAPL",
        "max_rows_must_equal_1",
        "candle_persistence_must_remain_false",
        "raw_response_persistence_must_remain_false",
        "replay_scanner_effects_must_remain_false",
      ],
    },
    recommended_next_steps: [
      "review_fetch_run_audit_write_plan",
      "require_separate_approval_before_fetch_run_audit_write",
      "keep_candle_persistence_disabled",
    ],
  };
}
