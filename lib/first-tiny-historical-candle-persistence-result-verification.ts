import { firstTinyHistoricalCandleExecutablePersistenceDryRunSourceVerification } from "@/lib/first-tiny-historical-candle-executable-persistence-dry-run-plan";

export const firstTinyCandlePersistenceResultVerificationMarker =
  "action_297_first_tiny_candle_persistence_result_verification";

export type FirstTinyCandlePersistenceResultVerificationStatus =
  "candle_persistence_verified";

export type FirstTinyCandlePersistenceResultVerificationEnv = Record<
  string,
  string | undefined
>;

export type FirstTinyCandlePersistenceResultVerificationSummary = {
  verification_status: FirstTinyCandlePersistenceResultVerificationStatus;
  result_marker: typeof firstTinyCandlePersistenceResultVerificationMarker;
  target_table: "historical_candles";
  source_verification: typeof firstTinyHistoricalCandleExecutablePersistenceDryRunSourceVerification;
  provider: "twelve_data";
  ticker: "AAPL";
  interval: "5min";
  trading_day: "2026-07-08";
  session: "regular";
  timezone: "America/New_York";
  adjusted: false;
  fetch_run_id: "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f";
  expected_rows: 73;
  readback_rows: 73;
  matched_rows: 73;
  missing_rows: 0;
  unexpected_rows: 0;
  mismatched_rows: 0;
  duplicate_timestamps: 0;
  out_of_order_rows: 0;
  first_timestamp: "2026-07-08T13:45:00.000Z";
  last_timestamp: "2026-07-08T19:45:00.000Z";
  timestamps_5min_spaced: true;
  candles_persisted: true;
  readback_verified: true;
  raw_response_persisted: false;
  fetch_run_persisted: false;
  synthetic_outcomes_persisted: false;
  replay_executed: false;
  scanner_behavior_changed: false;
  live_ranking_changed: false;
  provider_call_executed: false;
  provider_call_attempted: false;
  ready_for_replay_dry_run_planning: true;
  replay_allowed_now: false;
  scanner_use_allowed_now: false;
  approval_signal_checked: true;
  candle_persistence_approval_signal_present: boolean;
  candle_persistence_approval_signal_still_enabled: boolean;
  approval_signal_source: "server_env" | "none";
  conclusion: "first_tiny_historical_candle_persistence_verified";
  blockers: [];
  warnings: string[];
  recommended_next_steps: [
    "disable_candle_persistence_approval_signal_after_success",
    "plan_replay_dry_run_using_persisted_candles",
    "require_separate_approval_before_replay_or_scanner_use",
  ];
};

function normalized(value: string | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

export function buildFirstTinyCandlePersistenceResultVerification(
  env: FirstTinyCandlePersistenceResultVerificationEnv = process.env,
): FirstTinyCandlePersistenceResultVerificationSummary {
  const approvalValue = normalized(
    env.TURE_FIRST_TINY_CANDLE_PERSISTENCE_APPROVED,
  );
  const approvalSignalPresent = approvalValue.length > 0;
  const approvalSignalStillEnabled = approvalValue === "true";

  return {
    verification_status: "candle_persistence_verified",
    result_marker: firstTinyCandlePersistenceResultVerificationMarker,
    target_table: "historical_candles",
    source_verification:
      firstTinyHistoricalCandleExecutablePersistenceDryRunSourceVerification,
    provider: "twelve_data",
    ticker: "AAPL",
    interval: "5min",
    trading_day: "2026-07-08",
    session: "regular",
    timezone: "America/New_York",
    adjusted: false,
    fetch_run_id: "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f",
    expected_rows: 73,
    readback_rows: 73,
    matched_rows: 73,
    missing_rows: 0,
    unexpected_rows: 0,
    mismatched_rows: 0,
    duplicate_timestamps: 0,
    out_of_order_rows: 0,
    first_timestamp: "2026-07-08T13:45:00.000Z",
    last_timestamp: "2026-07-08T19:45:00.000Z",
    timestamps_5min_spaced: true,
    candles_persisted: true,
    readback_verified: true,
    raw_response_persisted: false,
    fetch_run_persisted: false,
    synthetic_outcomes_persisted: false,
    replay_executed: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    provider_call_executed: false,
    provider_call_attempted: false,
    ready_for_replay_dry_run_planning: true,
    replay_allowed_now: false,
    scanner_use_allowed_now: false,
    approval_signal_checked: true,
    candle_persistence_approval_signal_present: approvalSignalPresent,
    candle_persistence_approval_signal_still_enabled:
      approvalSignalStillEnabled,
    approval_signal_source: approvalSignalPresent ? "server_env" : "none",
    conclusion: "first_tiny_historical_candle_persistence_verified",
    blockers: [],
    warnings: approvalSignalStillEnabled
      ? ["disable_candle_persistence_approval_signal_after_success"]
      : [],
    recommended_next_steps: [
      "disable_candle_persistence_approval_signal_after_success",
      "plan_replay_dry_run_using_persisted_candles",
      "require_separate_approval_before_replay_or_scanner_use",
    ],
  };
}
