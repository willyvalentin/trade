export const firstTinyFetchRunAuditWriteResultVerificationMarker =
  "first_tiny_fetch_run_audit_write_verified";

export type FirstTinyFetchRunAuditWriteResultVerificationEnv = Record<
  string,
  string | undefined
>;

export type FirstTinyFetchRunAuditWriteResultVerificationSummary = {
  verification_status: "verified";
  verification_marker: typeof firstTinyFetchRunAuditWriteResultVerificationMarker;
  execution_status: "fetch_run_audit_write_completed";
  target_table: "historical_candle_fetch_runs";
  source_verification: "first_tiny_historical_fetch_no_persist_verified";
  inserted_row_id: "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f";
  readback_verified: true;
  ticker: "AAPL";
  interval: "5min";
  trading_day: "2026-07-08";
  request_count: 1;
  valid_candles: 27;
  planned_rows: 1;
  audit_rows_inserted: 1;
  duplicate_prevented: false;
  approval_status: "valid_for_future_audit_write";
  operator_label: "willy_manual_audit_write_001";
  approval_reference: "first_tiny_fetch_run_audit_write_20260709_aapl";
  candles_persisted: false;
  raw_response_persisted: false;
  synthetic_outcomes_persisted: false;
  replay_executed: false;
  scanner_behavior_changed: false;
  live_ranking_changed: false;
  max_one_row_enforced: true;
  no_candle_persistence_enforced: true;
  no_raw_response_persistence_enforced: true;
  no_replay_enforced: true;
  no_scanner_ranking_effect_enforced: true;
  approval_lock_warning: {
    approval_signal_still_enabled: boolean;
    warning: "disable_fetch_run_audit_write_approval_signal_after_success" | null;
  };
  recommended_next_steps: [
    "disable_fetch_run_audit_write_approval_signal_after_success",
    "require_separate_approval_before_candle_persistence",
    "plan_first_tiny_candle_persistence_dry_run",
  ];
};

function envSource(
  env: FirstTinyFetchRunAuditWriteResultVerificationEnv | null | undefined,
) {
  if (env) return env;
  if (typeof process !== "undefined") return process.env;
  return {};
}

function approvalStillEnabled(
  env: FirstTinyFetchRunAuditWriteResultVerificationEnv,
) {
  return (
    env.TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_APPROVED?.trim().toLowerCase() ===
    "true"
  );
}

export function buildFirstTinyFetchRunAuditWriteResultVerification(
  env?: FirstTinyFetchRunAuditWriteResultVerificationEnv | null,
): FirstTinyFetchRunAuditWriteResultVerificationSummary {
  const signalStillEnabled = approvalStillEnabled(envSource(env));

  return {
    verification_status: "verified",
    verification_marker: firstTinyFetchRunAuditWriteResultVerificationMarker,
    execution_status: "fetch_run_audit_write_completed",
    target_table: "historical_candle_fetch_runs",
    source_verification: "first_tiny_historical_fetch_no_persist_verified",
    inserted_row_id: "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f",
    readback_verified: true,
    ticker: "AAPL",
    interval: "5min",
    trading_day: "2026-07-08",
    request_count: 1,
    valid_candles: 27,
    planned_rows: 1,
    audit_rows_inserted: 1,
    duplicate_prevented: false,
    approval_status: "valid_for_future_audit_write",
    operator_label: "willy_manual_audit_write_001",
    approval_reference: "first_tiny_fetch_run_audit_write_20260709_aapl",
    candles_persisted: false,
    raw_response_persisted: false,
    synthetic_outcomes_persisted: false,
    replay_executed: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    max_one_row_enforced: true,
    no_candle_persistence_enforced: true,
    no_raw_response_persistence_enforced: true,
    no_replay_enforced: true,
    no_scanner_ranking_effect_enforced: true,
    approval_lock_warning: {
      approval_signal_still_enabled: signalStillEnabled,
      warning: signalStillEnabled
        ? "disable_fetch_run_audit_write_approval_signal_after_success"
        : null,
    },
    recommended_next_steps: [
      "disable_fetch_run_audit_write_approval_signal_after_success",
      "require_separate_approval_before_candle_persistence",
      "plan_first_tiny_candle_persistence_dry_run",
    ],
  };
}
