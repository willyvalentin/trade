import {
  buildFirstTinyHistoricalReplayDryRunPlan,
  firstTinyHistoricalReplayDryRunSourceVerification,
  type FirstTinyHistoricalReplayDryRunPlanSummary,
} from "@/lib/first-tiny-historical-replay-dry-run-plan";

export const firstTinyHistoricalReplayDryRunApprovalMarker =
  "action_299_first_tiny_replay_dry_run_approval_gate";

export type FirstTinyHistoricalReplayDryRunApprovalStatus =
  | "not_configured"
  | "invalid"
  | "valid_for_future_replay_dry_run";

export type FirstTinyHistoricalReplayDryRunApprovalEnv = Record<
  string,
  string | undefined
>;

export type FirstTinyHistoricalReplayDryRunApprovalSignal = {
  source_type: "none" | "server_env";
  source_present: boolean;
  signal_active: boolean;
  approved: boolean | null;
  operator_label_present: boolean;
  reference_present: boolean;
  ticker: string | null;
  trading_day: string | null;
  interval: string | null;
  fetch_run_id: string | null;
  max_tickers: number | null;
  max_days: number | null;
  synthetic_outcome_persist_allowed: boolean | null;
  scanner_effect_allowed: boolean | null;
  ranking_effect_allowed: boolean | null;
};

export type FirstTinyHistoricalReplayDryRunApprovalSummary = {
  approval_status: FirstTinyHistoricalReplayDryRunApprovalStatus;
  approval_marker: typeof firstTinyHistoricalReplayDryRunApprovalMarker;
  advisory_only: true;
  approval_gate_only: true;
  signal: FirstTinyHistoricalReplayDryRunApprovalSignal;
  source_verification: typeof firstTinyHistoricalReplayDryRunSourceVerification;
  ticker: "AAPL";
  interval: "5min";
  trading_day: "2026-07-08";
  fetch_run_id: "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f";
  candle_rows_verified: 73;
  max_tickers: 1;
  max_days: 1;
  lookahead_safety_present: boolean;
  ready_to_accept_future_signal: boolean;
  ready_to_propose_replay_dry_run_action: boolean;
  replay_allowed_now: false;
  synthetic_outcome_persistence_allowed_now: false;
  scanner_use_allowed_now: false;
  ranking_change_allowed_now: false;
  expected_contract: {
    env_names: typeof envKeys;
    expected_ticker: "AAPL";
    expected_interval: "5min";
    expected_trading_day: "2026-07-08";
    expected_fetch_run_id: "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f";
    expected_max_tickers: 1;
    expected_max_days: 1;
    expected_synthetic_outcome_persist_allowed: false;
    expected_scanner_effect_allowed: false;
    expected_ranking_effect_allowed: false;
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
  blockers: string[];
  warnings: string[];
  recommended_next_steps: [
    "configure_valid_replay_dry_run_approval_signal",
    "require_separate_action_before_replay_execution",
    "keep_synthetic_outcomes_scanner_and_ranking_disabled",
  ];
};

export type FirstTinyHistoricalReplayDryRunApprovalInput = {
  env?: FirstTinyHistoricalReplayDryRunApprovalEnv | null;
  replay_plan?: FirstTinyHistoricalReplayDryRunPlanSummary | null;
};

const envKeys = [
  "TURE_FIRST_TINY_REPLAY_DRY_RUN_APPROVED",
  "TURE_FIRST_TINY_REPLAY_DRY_RUN_OPERATOR_LABEL",
  "TURE_FIRST_TINY_REPLAY_DRY_RUN_REFERENCE",
  "TURE_FIRST_TINY_REPLAY_DRY_RUN_TICKER",
  "TURE_FIRST_TINY_REPLAY_DRY_RUN_TRADING_DAY",
  "TURE_FIRST_TINY_REPLAY_DRY_RUN_INTERVAL",
  "TURE_FIRST_TINY_REPLAY_DRY_RUN_FETCH_RUN_ID",
  "TURE_FIRST_TINY_REPLAY_DRY_RUN_MAX_TICKERS",
  "TURE_FIRST_TINY_REPLAY_DRY_RUN_MAX_DAYS",
  "TURE_FIRST_TINY_REPLAY_DRY_RUN_SYNTHETIC_OUTCOME_PERSIST_ALLOWED",
  "TURE_FIRST_TINY_REPLAY_DRY_RUN_SCANNER_EFFECT_ALLOWED",
  "TURE_FIRST_TINY_REPLAY_DRY_RUN_RANKING_EFFECT_ALLOWED",
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

export function buildFirstTinyHistoricalReplayDryRunApprovalSignalFromEnv(
  env: FirstTinyHistoricalReplayDryRunApprovalEnv = process.env,
): FirstTinyHistoricalReplayDryRunApprovalSignal {
  const sourcePresent = envKeys.some(
    (key) => normalizeText(env[key]) !== null,
  );
  const approved = parseBoolean(
    env.TURE_FIRST_TINY_REPLAY_DRY_RUN_APPROVED,
  );

  return {
    source_type: sourcePresent ? "server_env" : "none",
    source_present: sourcePresent,
    signal_active: sourcePresent && approved === true,
    approved,
    operator_label_present:
      normalizeText(env.TURE_FIRST_TINY_REPLAY_DRY_RUN_OPERATOR_LABEL) !==
      null,
    reference_present:
      normalizeText(env.TURE_FIRST_TINY_REPLAY_DRY_RUN_REFERENCE) !== null,
    ticker: normalizeTicker(env.TURE_FIRST_TINY_REPLAY_DRY_RUN_TICKER),
    trading_day: normalizeText(
      env.TURE_FIRST_TINY_REPLAY_DRY_RUN_TRADING_DAY,
    ),
    interval: normalizeText(env.TURE_FIRST_TINY_REPLAY_DRY_RUN_INTERVAL),
    fetch_run_id: normalizeText(
      env.TURE_FIRST_TINY_REPLAY_DRY_RUN_FETCH_RUN_ID,
    ),
    max_tickers: parsePositiveInteger(
      env.TURE_FIRST_TINY_REPLAY_DRY_RUN_MAX_TICKERS,
    ),
    max_days: parsePositiveInteger(
      env.TURE_FIRST_TINY_REPLAY_DRY_RUN_MAX_DAYS,
    ),
    synthetic_outcome_persist_allowed: parseBoolean(
      env.TURE_FIRST_TINY_REPLAY_DRY_RUN_SYNTHETIC_OUTCOME_PERSIST_ALLOWED,
    ),
    scanner_effect_allowed: parseBoolean(
      env.TURE_FIRST_TINY_REPLAY_DRY_RUN_SCANNER_EFFECT_ALLOWED,
    ),
    ranking_effect_allowed: parseBoolean(
      env.TURE_FIRST_TINY_REPLAY_DRY_RUN_RANKING_EFFECT_ALLOWED,
    ),
  };
}

function planReady(plan: FirstTinyHistoricalReplayDryRunPlanSummary) {
  return (
    plan.replay_plan_status === "planned" &&
    plan.dry_run_only === true &&
    plan.source_verification ===
      firstTinyHistoricalReplayDryRunSourceVerification &&
    plan.candle_rows_verified === 73 &&
    plan.lookahead_safety_required === true &&
    plan.replay_allowed_now === false &&
    plan.synthetic_outcome_persistence_allowed_now === false &&
    plan.scanner_use_allowed_now === false &&
    plan.ranking_change_allowed_now === false
  );
}

function validateSignal(input: {
  signal: FirstTinyHistoricalReplayDryRunApprovalSignal;
  plan: FirstTinyHistoricalReplayDryRunPlanSummary;
}) {
  const blockers: string[] = [];
  const signal = input.signal;
  const plan = input.plan;

  if (signal.approved !== true) pushUnique(blockers, "approved_not_true");
  if (!signal.operator_label_present) {
    pushUnique(blockers, "missing_operator_label");
  }
  if (!signal.reference_present) pushUnique(blockers, "missing_reference");
  if (signal.ticker !== "AAPL") pushUnique(blockers, "ticker_mismatch");
  if (signal.trading_day !== "2026-07-08") {
    pushUnique(blockers, "trading_day_mismatch");
  }
  if (signal.interval !== "5min") pushUnique(blockers, "interval_mismatch");
  if (signal.fetch_run_id !== "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f") {
    pushUnique(blockers, "fetch_run_id_mismatch");
  }
  if (signal.max_tickers !== 1) pushUnique(blockers, "max_tickers_not_1");
  if (signal.max_days !== 1) pushUnique(blockers, "max_days_not_1");
  if (signal.synthetic_outcome_persist_allowed !== false) {
    pushUnique(blockers, "synthetic_outcome_persist_not_false");
  }
  if (signal.scanner_effect_allowed !== false) {
    pushUnique(blockers, "scanner_effect_not_false");
  }
  if (signal.ranking_effect_allowed !== false) {
    pushUnique(blockers, "ranking_effect_not_false");
  }
  if (
    plan.source_verification !== firstTinyHistoricalReplayDryRunSourceVerification
  ) {
    pushUnique(blockers, "source_verification_mismatch");
  }
  if (plan.candle_rows_verified !== 73) {
    pushUnique(blockers, "candle_rows_verified_not_73");
  }
  if (!plan.lookahead_safety_required) {
    pushUnique(blockers, "lookahead_safety_missing");
  }
  if (plan.safety.replay_executed !== false) {
    pushUnique(blockers, "replay_execution_not_false");
  }

  return blockers;
}

export function buildFirstTinyHistoricalReplayDryRunApproval(
  input: FirstTinyHistoricalReplayDryRunApprovalInput = {},
): FirstTinyHistoricalReplayDryRunApprovalSummary {
  const plan = input.replay_plan ?? buildFirstTinyHistoricalReplayDryRunPlan();
  const signal = buildFirstTinyHistoricalReplayDryRunApprovalSignalFromEnv(
    input.env ?? process.env,
  );
  const readyToAccept = planReady(plan);
  const blockers = signal.source_present
    ? validateSignal({ signal, plan })
    : [];
  const approvalStatus: FirstTinyHistoricalReplayDryRunApprovalStatus =
    !signal.source_present
      ? "not_configured"
      : blockers.length === 0
        ? "valid_for_future_replay_dry_run"
        : "invalid";

  return {
    approval_status: approvalStatus,
    approval_marker: firstTinyHistoricalReplayDryRunApprovalMarker,
    advisory_only: true,
    approval_gate_only: true,
    signal,
    source_verification: firstTinyHistoricalReplayDryRunSourceVerification,
    ticker: "AAPL",
    interval: "5min",
    trading_day: "2026-07-08",
    fetch_run_id: "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f",
    candle_rows_verified: 73,
    max_tickers: 1,
    max_days: 1,
    lookahead_safety_present: plan.lookahead_safety_required,
    ready_to_accept_future_signal: readyToAccept,
    ready_to_propose_replay_dry_run_action:
      approvalStatus === "valid_for_future_replay_dry_run" && readyToAccept,
    replay_allowed_now: false,
    synthetic_outcome_persistence_allowed_now: false,
    scanner_use_allowed_now: false,
    ranking_change_allowed_now: false,
    expected_contract: {
      env_names: envKeys,
      expected_ticker: "AAPL",
      expected_interval: "5min",
      expected_trading_day: "2026-07-08",
      expected_fetch_run_id: "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f",
      expected_max_tickers: 1,
      expected_max_days: 1,
      expected_synthetic_outcome_persist_allowed: false,
      expected_scanner_effect_allowed: false,
      expected_ranking_effect_allowed: false,
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
    blockers,
    warnings:
      approvalStatus === "valid_for_future_replay_dry_run"
        ? ["valid_signal_requires_separate_execute_action"]
        : [],
    recommended_next_steps: [
      "configure_valid_replay_dry_run_approval_signal",
      "require_separate_action_before_replay_execution",
      "keep_synthetic_outcomes_scanner_and_ranking_disabled",
    ],
  };
}
