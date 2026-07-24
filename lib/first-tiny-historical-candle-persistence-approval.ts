import {
  buildFirstTinyCorrectedOhlcvPayloadStaticCapture,
  firstTinyCorrectedOhlcvPayloadStaticCaptureMarker,
  type FirstTinyCorrectedOhlcvPayloadStaticCaptureSummary,
} from "@/lib/first-tiny-historical-candle-corrected-ohlcv-payload-static-capture";
import {
  buildFirstTinyHistoricalCandleExecutablePersistenceDryRunPlan,
  firstTinyHistoricalCandleExecutablePersistenceDryRunPlanVersion,
  firstTinyHistoricalCandleExecutablePersistenceDryRunSourceVerification,
  type FirstTinyHistoricalCandleExecutablePersistenceDryRunPlanSummary,
} from "@/lib/first-tiny-historical-candle-executable-persistence-dry-run-plan";

export type FirstTinyCandlePersistenceApprovalStatus =
  | "not_configured"
  | "invalid"
  | "valid_for_future_candle_persistence";

export type FirstTinyCandlePersistenceApprovalEnv = Record<
  string,
  string | undefined
>;

export type FirstTinyCandlePersistenceApprovalSignal = {
  source_type: "none" | "server_env";
  source_present: boolean;
  approved: boolean | null;
  operator_label: string | null;
  approval_reference: string | null;
  ticker: string | null;
  interval: string | null;
  trading_day: string | null;
  fetch_run_id: string | null;
  max_rows: number | null;
  expected_inserts: number | null;
  raw_response_persist_allowed: boolean | null;
  replay_allowed: boolean | null;
  scanner_effect_allowed: boolean | null;
};

export type FirstTinyCandlePersistenceApprovalInput = {
  env?: FirstTinyCandlePersistenceApprovalEnv | null;
  static_ohlcv_capture?: FirstTinyCorrectedOhlcvPayloadStaticCaptureSummary | null;
  dry_run_plan?: FirstTinyHistoricalCandleExecutablePersistenceDryRunPlanSummary | null;
};

export type FirstTinyCandlePersistenceApprovalSummary = {
  advisory_only: true;
  approval_gate_only: true;
  approval_status: FirstTinyCandlePersistenceApprovalStatus;
  signal: FirstTinyCandlePersistenceApprovalSignal & {
    signal_active: boolean;
    operator_label_present: boolean;
    approval_reference_present: boolean;
  };
  expected_contract: {
    env_names: string[];
    source_capture_marker: typeof firstTinyCorrectedOhlcvPayloadStaticCaptureMarker;
    source_verification: typeof firstTinyHistoricalCandleExecutablePersistenceDryRunSourceVerification;
    plan_version: typeof firstTinyHistoricalCandleExecutablePersistenceDryRunPlanVersion;
    target_table: "historical_candles";
    expected_ticker: "AAPL";
    expected_interval: "5min";
    expected_trading_day: "2026-07-08";
    expected_fetch_run_id: "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f";
    expected_max_rows: 73;
    expected_inserts: number;
    expected_raw_response_persist_allowed: false;
    expected_replay_allowed: false;
    expected_scanner_effect_allowed: false;
  };
  validation: {
    approved_valid: boolean;
    operator_label_valid: boolean;
    approval_reference_valid: boolean;
    ticker_valid: boolean;
    interval_valid: boolean;
    trading_day_valid: boolean;
    fetch_run_id_valid: boolean;
    max_rows_valid: boolean;
    expected_inserts_valid: boolean;
    raw_response_persist_scope_valid: boolean;
    replay_scope_valid: boolean;
    scanner_effect_scope_valid: boolean;
    static_ohlcv_capture_ready: boolean;
    source_capture_marker_valid: boolean;
    source_verification_valid: boolean;
    plan_version_valid: boolean;
    dry_run_plan_ready: boolean;
    target_table_valid: boolean;
    candle_write_valid_rows_valid: boolean;
    planned_invalid_rejections_valid: boolean;
    raw_response_persistence_blocked: boolean;
    fetch_run_write_blocked: boolean;
    replay_scanner_ranking_effects_blocked: boolean;
  };
  readiness: {
    ready_to_accept_future_signal: boolean;
    ready_to_propose_candle_persistence_write: boolean;
    candle_write_allowed_now: false;
    candles_persisted: false;
    raw_response_persisted: false;
    fetch_run_persisted: false;
    replay_executed: false;
    scanner_behavior_changed: false;
    live_ranking_changed: false;
  };
  dry_run_snapshot: {
    plan_version: typeof firstTinyHistoricalCandleExecutablePersistenceDryRunPlanVersion;
    source_verification: typeof firstTinyHistoricalCandleExecutablePersistenceDryRunSourceVerification;
    target_table: "historical_candles";
    candidate_candle_rows: number;
    timestamp_valid_rows: number;
    candle_write_valid_rows: number;
    invalid_candle_rows: number;
    planned_inserts: number;
    planned_updates: number;
    planned_skips: number;
    planned_invalid_rejections: number;
    conflict_target: string;
  };
  blockers: string[];
  warnings: string[];
  recommended_next_steps: [
    "configure_valid_candle_persistence_approval_signal",
    "require_separate_action_before_candle_insert",
    "keep_replay_and_scanner_effects_disabled",
  ];
  safety: {
    advisory_only: true;
    approval_gate_only: true;
    provider_call_executed: false;
    historical_fetch_added: false;
    candle_write_executed: false;
    candle_write_allowed_now: false;
    candles_persisted: false;
    raw_response_persisted: false;
    fetch_run_persisted: false;
    synthetic_outcomes_persisted: false;
    replay_executed: false;
    scanner_behavior_changed: false;
    live_ranking_changed: false;
    requires_separate_future_execute_action: true;
  };
};

const envKeys = [
  "TURE_FIRST_TINY_CANDLE_PERSISTENCE_APPROVED",
  "TURE_FIRST_TINY_CANDLE_PERSISTENCE_OPERATOR_LABEL",
  "TURE_FIRST_TINY_CANDLE_PERSISTENCE_REFERENCE",
  "TURE_FIRST_TINY_CANDLE_PERSISTENCE_TICKER",
  "TURE_FIRST_TINY_CANDLE_PERSISTENCE_INTERVAL",
  "TURE_FIRST_TINY_CANDLE_PERSISTENCE_TRADING_DAY",
  "TURE_FIRST_TINY_CANDLE_PERSISTENCE_FETCH_RUN_ID",
  "TURE_FIRST_TINY_CANDLE_PERSISTENCE_MAX_ROWS",
  "TURE_FIRST_TINY_CANDLE_PERSISTENCE_EXPECTED_INSERTS",
  "TURE_FIRST_TINY_CANDLE_PERSISTENCE_RAW_RESPONSE_PERSIST_ALLOWED",
  "TURE_FIRST_TINY_CANDLE_PERSISTENCE_REPLAY_ALLOWED",
  "TURE_FIRST_TINY_CANDLE_PERSISTENCE_SCANNER_EFFECT_ALLOWED",
] as const;

function normalizeText(value: string | null | undefined) {
  const text = value?.trim() ?? "";
  return text.length > 0 ? text : null;
}

function normalizeTicker(value: string | null | undefined) {
  return normalizeText(value)?.toUpperCase() ?? null;
}

function parseBoolean(value: string | undefined) {
  if (value === undefined) return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return null;
}

function parsePositiveInteger(value: string | undefined) {
  if (value === undefined || value.trim().length === 0) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function pushUnique(values: string[], value: string) {
  if (!values.includes(value)) values.push(value);
}

export function buildFirstTinyCandlePersistenceApprovalSignalFromEnv(
  env: FirstTinyCandlePersistenceApprovalEnv = process.env,
): FirstTinyCandlePersistenceApprovalSignal {
  const sourcePresent = envKeys.some(
    (key) => normalizeText(env[key]) !== null,
  );

  return {
    source_type: sourcePresent ? "server_env" : "none",
    source_present: sourcePresent,
    approved: parseBoolean(env.TURE_FIRST_TINY_CANDLE_PERSISTENCE_APPROVED),
    operator_label: normalizeText(
      env.TURE_FIRST_TINY_CANDLE_PERSISTENCE_OPERATOR_LABEL,
    ),
    approval_reference: normalizeText(
      env.TURE_FIRST_TINY_CANDLE_PERSISTENCE_REFERENCE,
    ),
    ticker: normalizeTicker(env.TURE_FIRST_TINY_CANDLE_PERSISTENCE_TICKER),
    interval: normalizeText(env.TURE_FIRST_TINY_CANDLE_PERSISTENCE_INTERVAL),
    trading_day: normalizeText(
      env.TURE_FIRST_TINY_CANDLE_PERSISTENCE_TRADING_DAY,
    ),
    fetch_run_id: normalizeText(
      env.TURE_FIRST_TINY_CANDLE_PERSISTENCE_FETCH_RUN_ID,
    ),
    max_rows: parsePositiveInteger(
      env.TURE_FIRST_TINY_CANDLE_PERSISTENCE_MAX_ROWS,
    ),
    expected_inserts: parsePositiveInteger(
      env.TURE_FIRST_TINY_CANDLE_PERSISTENCE_EXPECTED_INSERTS,
    ),
    raw_response_persist_allowed: parseBoolean(
      env.TURE_FIRST_TINY_CANDLE_PERSISTENCE_RAW_RESPONSE_PERSIST_ALLOWED,
    ),
    replay_allowed: parseBoolean(
      env.TURE_FIRST_TINY_CANDLE_PERSISTENCE_REPLAY_ALLOWED,
    ),
    scanner_effect_allowed: parseBoolean(
      env.TURE_FIRST_TINY_CANDLE_PERSISTENCE_SCANNER_EFFECT_ALLOWED,
    ),
  };
}

function staticCaptureReady(
  capture: FirstTinyCorrectedOhlcvPayloadStaticCaptureSummary,
) {
  return (
    capture.capture_marker === firstTinyCorrectedOhlcvPayloadStaticCaptureMarker &&
    capture.ready_for_executable_persistence_dry_run === true &&
    capture.provider === "twelve_data" &&
    capture.ticker === "AAPL" &&
    capture.interval === "5min" &&
    capture.trading_day === "2026-07-08" &&
    capture.fetch_run_id === "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f" &&
    capture.row_count === 73 &&
    capture.invalid_row_count === 0 &&
    capture.ohlcv_values_valid === true &&
    capture.candles_persisted === false &&
    capture.raw_response_persisted === false &&
    capture.fetch_run_persisted === false &&
    capture.replay_executed === false &&
    capture.scanner_behavior_changed === false &&
    capture.live_ranking_changed === false
  );
}

function dryRunPlanReady(
  plan: FirstTinyHistoricalCandleExecutablePersistenceDryRunPlanSummary,
) {
  return (
    plan.plan_status === "planned" &&
    plan.plan_version ===
      firstTinyHistoricalCandleExecutablePersistenceDryRunPlanVersion &&
    plan.source_verification ===
      firstTinyHistoricalCandleExecutablePersistenceDryRunSourceVerification &&
    plan.target_table === "historical_candles" &&
    plan.dry_run_only === true &&
    plan.request_scope.ticker === "AAPL" &&
    plan.request_scope.interval === "5min" &&
    plan.request_scope.trading_day === "2026-07-08" &&
    plan.fetch_run.fetch_run_id ===
      "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f" &&
    plan.payload_summary.candidate_candle_rows === 73 &&
    plan.payload_summary.timestamp_valid_rows === 73 &&
    plan.payload_summary.candle_write_valid_rows === 73 &&
    plan.payload_summary.invalid_candle_rows === 0 &&
    plan.upsert_plan.planned_invalid_rejections === 0 &&
    plan.safety.candle_write_allowed_now === false &&
    plan.safety.candles_persisted === false &&
    plan.safety.raw_response_persisted === false &&
    plan.safety.fetch_run_persisted === false &&
    plan.safety.replay_executed === false &&
    plan.safety.scanner_behavior_changed === false &&
    plan.safety.live_ranking_changed === false
  );
}

function expectedInsertsForPlan(
  plan: FirstTinyHistoricalCandleExecutablePersistenceDryRunPlanSummary,
) {
  return plan.upsert_plan.planned_inserts;
}

export function buildFirstTinyCandlePersistenceApproval(
  input: FirstTinyCandlePersistenceApprovalInput = {},
): FirstTinyCandlePersistenceApprovalSummary {
  const staticCapture =
    input.static_ohlcv_capture ??
    buildFirstTinyCorrectedOhlcvPayloadStaticCapture();
  const plan =
    input.dry_run_plan ??
    buildFirstTinyHistoricalCandleExecutablePersistenceDryRunPlan();
  const signal = buildFirstTinyCandlePersistenceApprovalSignalFromEnv(
    input.env ?? process.env,
  );
  const expectedInserts = expectedInsertsForPlan(plan);
  const rawResponsePersistenceBlocked =
    plan.safety.raw_response_persisted === false;
  const fetchRunWriteBlocked = plan.safety.fetch_run_persisted === false;
  const replayScannerRankingBlocked =
    plan.safety.replay_executed === false &&
    plan.safety.scanner_behavior_changed === false &&
    plan.safety.live_ranking_changed === false;
  const validation = {
    approved_valid: signal.approved === true,
    operator_label_valid: normalizeText(signal.operator_label) !== null,
    approval_reference_valid:
      normalizeText(signal.approval_reference) !== null,
    ticker_valid: normalizeTicker(signal.ticker) === "AAPL",
    interval_valid: normalizeText(signal.interval) === "5min",
    trading_day_valid: normalizeText(signal.trading_day) === "2026-07-08",
    fetch_run_id_valid:
      normalizeText(signal.fetch_run_id) ===
      "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f",
    max_rows_valid: signal.max_rows === 73,
    expected_inserts_valid: signal.expected_inserts === expectedInserts,
    raw_response_persist_scope_valid:
      signal.raw_response_persist_allowed === false,
    replay_scope_valid: signal.replay_allowed === false,
    scanner_effect_scope_valid: signal.scanner_effect_allowed === false,
    static_ohlcv_capture_ready: staticCaptureReady(staticCapture),
    source_capture_marker_valid:
      staticCapture.capture_marker ===
      firstTinyCorrectedOhlcvPayloadStaticCaptureMarker,
    source_verification_valid:
      plan.source_verification ===
      firstTinyHistoricalCandleExecutablePersistenceDryRunSourceVerification,
    plan_version_valid:
      plan.plan_version ===
      firstTinyHistoricalCandleExecutablePersistenceDryRunPlanVersion,
    dry_run_plan_ready: dryRunPlanReady(plan),
    target_table_valid: plan.target_table === "historical_candles",
    candle_write_valid_rows_valid:
      plan.payload_summary.candle_write_valid_rows === 73,
    planned_invalid_rejections_valid:
      plan.upsert_plan.planned_invalid_rejections === 0,
    raw_response_persistence_blocked: rawResponsePersistenceBlocked,
    fetch_run_write_blocked: fetchRunWriteBlocked,
    replay_scanner_ranking_effects_blocked: replayScannerRankingBlocked,
  };
  const blockers: string[] = [];

  if (signal.source_present) {
    if (!validation.approved_valid) pushUnique(blockers, "approval_not_true");
    if (!validation.operator_label_valid) {
      pushUnique(blockers, "operator_label_missing");
    }
    if (!validation.approval_reference_valid) {
      pushUnique(blockers, "approval_reference_missing");
    }
    if (!validation.ticker_valid) pushUnique(blockers, "ticker_mismatch");
    if (!validation.interval_valid) pushUnique(blockers, "interval_mismatch");
    if (!validation.trading_day_valid) {
      pushUnique(blockers, "trading_day_mismatch");
    }
    if (!validation.fetch_run_id_valid) {
      pushUnique(blockers, "fetch_run_id_mismatch");
    }
    if (!validation.max_rows_valid) pushUnique(blockers, "max_rows_not_73");
    if (!validation.expected_inserts_valid) {
      pushUnique(blockers, "expected_inserts_mismatch");
    }
    if (!validation.raw_response_persist_scope_valid) {
      pushUnique(blockers, "raw_response_persist_not_allowed");
    }
    if (!validation.replay_scope_valid) pushUnique(blockers, "replay_not_allowed");
    if (!validation.scanner_effect_scope_valid) {
      pushUnique(blockers, "scanner_effect_not_allowed");
    }
    if (!validation.static_ohlcv_capture_ready) {
      pushUnique(blockers, "static_ohlcv_capture_not_ready");
    }
    if (!validation.source_capture_marker_valid) {
      pushUnique(blockers, "source_capture_marker_mismatch");
    }
    if (!validation.source_verification_valid) {
      pushUnique(blockers, "source_verification_mismatch");
    }
    if (!validation.plan_version_valid) {
      pushUnique(blockers, "plan_version_mismatch");
    }
    if (!validation.dry_run_plan_ready) {
      pushUnique(blockers, "dry_run_plan_not_ready");
    }
    if (!validation.target_table_valid) {
      pushUnique(blockers, "target_table_mismatch");
    }
    if (!validation.candle_write_valid_rows_valid) {
      pushUnique(blockers, "candle_write_valid_rows_not_73");
    }
    if (!validation.planned_invalid_rejections_valid) {
      pushUnique(blockers, "planned_invalid_rejections_not_zero");
    }
    if (!validation.raw_response_persistence_blocked) {
      pushUnique(blockers, "raw_response_persistence_not_blocked");
    }
    if (!validation.fetch_run_write_blocked) {
      pushUnique(blockers, "fetch_run_write_not_blocked");
    }
    if (!validation.replay_scanner_ranking_effects_blocked) {
      pushUnique(blockers, "replay_scanner_ranking_effect_not_blocked");
    }
  }

  const approvalStatus: FirstTinyCandlePersistenceApprovalStatus =
    !signal.source_present
      ? "not_configured"
      : blockers.length === 0
        ? "valid_for_future_candle_persistence"
        : "invalid";
  const readyToAcceptFutureSignal =
    validation.static_ohlcv_capture_ready && validation.dry_run_plan_ready;
  const readyToPropose =
    approvalStatus === "valid_for_future_candle_persistence" &&
    readyToAcceptFutureSignal;

  return {
    advisory_only: true,
    approval_gate_only: true,
    approval_status: approvalStatus,
    signal: {
      ...signal,
      signal_active: signal.source_present,
      operator_label_present: validation.operator_label_valid,
      approval_reference_present: validation.approval_reference_valid,
    },
    expected_contract: {
      env_names: [...envKeys],
      source_capture_marker: firstTinyCorrectedOhlcvPayloadStaticCaptureMarker,
      source_verification:
        firstTinyHistoricalCandleExecutablePersistenceDryRunSourceVerification,
      plan_version: firstTinyHistoricalCandleExecutablePersistenceDryRunPlanVersion,
      target_table: "historical_candles",
      expected_ticker: "AAPL",
      expected_interval: "5min",
      expected_trading_day: "2026-07-08",
      expected_fetch_run_id: "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f",
      expected_max_rows: 73,
      expected_inserts: expectedInserts,
      expected_raw_response_persist_allowed: false,
      expected_replay_allowed: false,
      expected_scanner_effect_allowed: false,
    },
    validation,
    readiness: {
      ready_to_accept_future_signal: readyToAcceptFutureSignal,
      ready_to_propose_candle_persistence_write: readyToPropose,
      candle_write_allowed_now: false,
      candles_persisted: false,
      raw_response_persisted: false,
      fetch_run_persisted: false,
      replay_executed: false,
      scanner_behavior_changed: false,
      live_ranking_changed: false,
    },
    dry_run_snapshot: {
      plan_version: plan.plan_version,
      source_verification: plan.source_verification,
      target_table: plan.target_table,
      candidate_candle_rows: plan.payload_summary.candidate_candle_rows,
      timestamp_valid_rows: plan.payload_summary.timestamp_valid_rows,
      candle_write_valid_rows: plan.payload_summary.candle_write_valid_rows,
      invalid_candle_rows: plan.payload_summary.invalid_candle_rows,
      planned_inserts: plan.upsert_plan.planned_inserts,
      planned_updates: plan.upsert_plan.planned_updates,
      planned_skips: plan.upsert_plan.planned_skips,
      planned_invalid_rejections:
        plan.upsert_plan.planned_invalid_rejections,
      conflict_target: plan.conflict_target.join(", "),
    },
    blockers,
    warnings: signal.source_present
      ? ["separate_execute_action_required_before_candle_insert"]
      : ["candle_persistence_approval_signal_not_configured"],
    recommended_next_steps: [
      "configure_valid_candle_persistence_approval_signal",
      "require_separate_action_before_candle_insert",
      "keep_replay_and_scanner_effects_disabled",
    ],
    safety: {
      advisory_only: true,
      approval_gate_only: true,
      provider_call_executed: false,
      historical_fetch_added: false,
      candle_write_executed: false,
      candle_write_allowed_now: false,
      candles_persisted: false,
      raw_response_persisted: false,
      fetch_run_persisted: false,
      synthetic_outcomes_persisted: false,
      replay_executed: false,
      scanner_behavior_changed: false,
      live_ranking_changed: false,
      requires_separate_future_execute_action: true,
    },
  };
}
