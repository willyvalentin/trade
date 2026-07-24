import {
  buildFirstTinyHistoricalReplaySignalPackageSelectionPlan,
  type FirstTinySignalPackageSelectionPlanSummary,
} from "@/lib/first-tiny-historical-replay-signal-package-selection-plan";

export const firstTinyHistoricalReplaySignalPackageSelectionApprovalMarker =
  "action_306_first_tiny_signal_package_selection_approval_gate";

export type FirstTinySignalPackageSelectionApprovalStatus =
  | "not_configured"
  | "invalid"
  | "valid_for_future_replay_with_signal_package";

export type FirstTinySignalPackageSelectionApprovalEnv = Record<
  string,
  string | undefined
>;

export type FirstTinySignalPackageSelectionApprovalSignal = {
  source_type: "none" | "server_env";
  source_present: boolean;
  signal_active: boolean;
  approved: boolean | null;
  operator_label_present: boolean;
  reference_present: boolean;
  candidate_id: string | null;
  source_type_value: string | null;
  source_row_id: string | null;
  ticker: string | null;
  interval: string | null;
  trading_day: string | null;
  analysis_cutoff: string | null;
  direction: string | null;
  entry: number | null;
  stop: number | null;
  target: number | null;
  synthetic_outcome_persist_allowed: boolean | null;
  scanner_effect_allowed: boolean | null;
  ranking_effect_allowed: boolean | null;
};

export type FirstTinySignalPackageSelectionApprovalInput = {
  env?: FirstTinySignalPackageSelectionApprovalEnv | null;
  selection_plan?: FirstTinySignalPackageSelectionPlanSummary | null;
};

export type FirstTinySignalPackageSelectionApprovalSummary = {
  approval_marker: typeof firstTinyHistoricalReplaySignalPackageSelectionApprovalMarker;
  approval_status: FirstTinySignalPackageSelectionApprovalStatus;
  approval_gate_only: true;
  advisory_only: true;
  signal: FirstTinySignalPackageSelectionApprovalSignal;
  source_verification: "signal_package_discovery_readback_verified";
  recommended_candidate_id: "recommendation_row:7dd59e66-7e54-4d35-92f9-5cc1ae11c557";
  source_type: "recommendation_row";
  source_row_id: "7dd59e66-7e54-4d35-92f9-5cc1ae11c557";
  ticker: "AAPL";
  interval: "5min";
  trading_day: "2026-07-08";
  analysis_cutoff: "2026-07-08T13:49:19.521608+00:00";
  direction: "long";
  entry: 304.86;
  stop: 295.62;
  target: 334.12;
  selected_candidate_authorized_now: boolean;
  ready_to_accept_future_signal: boolean;
  ready_to_propose_replay_with_signal_package: boolean;
  replay_allowed_now: false;
  synthetic_outcome_persistence_allowed_now: false;
  scanner_use_allowed_now: false;
  ranking_change_allowed_now: false;
  replay_executed: false;
  synthetic_outcomes_persisted: false;
  scanner_behavior_changed: false;
  live_ranking_changed: false;
  provider_call_executed: false;
  provider_call_attempted: false;
  candles_persisted: false;
  raw_response_persisted: false;
  fetch_run_persisted: false;
  recommendation_rows_mutated: false;
  supabase_read_executed: false;
  supabase_write_executed: false;
  scanner_universe_changed: false;
  thresholds_changed: false;
  outcome_evaluation_persistence_changed: false;
  learning_acceleration_changed: false;
  add_trade_affected: false;
  broker_execution_affected: false;
  risk_changed: false;
  expected_contract: {
    env_names: typeof envKeys;
    expected_candidate_id: "recommendation_row:7dd59e66-7e54-4d35-92f9-5cc1ae11c557";
    expected_source_type: "recommendation_row";
    expected_source_row_id: "7dd59e66-7e54-4d35-92f9-5cc1ae11c557";
    expected_ticker: "AAPL";
    expected_interval: "5min";
    expected_trading_day: "2026-07-08";
    expected_analysis_cutoff: "2026-07-08T13:49:19.521608+00:00";
    expected_direction: "long";
    expected_entry: 304.86;
    expected_stop: 295.62;
    expected_target: 334.12;
    expected_synthetic_outcome_persist_allowed: false;
    expected_scanner_effect_allowed: false;
    expected_ranking_effect_allowed: false;
  };
  blockers: string[];
  warnings: string[];
  recommended_next_steps: [
    "configure_valid_signal_package_selection_approval",
    "require_separate_action_before_replay_with_signal_package",
    "keep_synthetic_outcomes_scanner_and_ranking_disabled",
  ];
};

const envKeys = [
  "TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_APPROVED",
  "TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_OPERATOR_LABEL",
  "TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_REFERENCE",
  "TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_CANDIDATE_ID",
  "TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_SOURCE_TYPE",
  "TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_SOURCE_ROW_ID",
  "TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_TICKER",
  "TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_INTERVAL",
  "TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_TRADING_DAY",
  "TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_ANALYSIS_CUTOFF",
  "TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_DIRECTION",
  "TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_ENTRY",
  "TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_STOP",
  "TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_TARGET",
  "TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_SYNTHETIC_OUTCOME_PERSIST_ALLOWED",
  "TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_SCANNER_EFFECT_ALLOWED",
  "TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_RANKING_EFFECT_ALLOWED",
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

function parseNumber(value: string | undefined) {
  if (value === undefined || value.trim().length === 0) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function pushUnique(values: string[], value: string) {
  if (!values.includes(value)) values.push(value);
}

function sameNumber(left: number | null, right: number) {
  return left !== null && Math.abs(left - right) < 0.000001;
}

export function buildFirstTinySignalPackageSelectionApprovalSignalFromEnv(
  env: FirstTinySignalPackageSelectionApprovalEnv = process.env,
): FirstTinySignalPackageSelectionApprovalSignal {
  const sourcePresent = envKeys.some(
    (key) => normalizeText(env[key]) !== null,
  );
  const approved = parseBoolean(
    env.TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_APPROVED,
  );

  return {
    source_type: sourcePresent ? "server_env" : "none",
    source_present: sourcePresent,
    signal_active: sourcePresent && approved === true,
    approved,
    operator_label_present:
      normalizeText(
        env.TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_OPERATOR_LABEL,
      ) !== null,
    reference_present:
      normalizeText(env.TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_REFERENCE) !==
      null,
    candidate_id: normalizeText(
      env.TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_CANDIDATE_ID,
    ),
    source_type_value: normalizeText(
      env.TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_SOURCE_TYPE,
    ),
    source_row_id: normalizeText(
      env.TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_SOURCE_ROW_ID,
    ),
    ticker: normalizeTicker(env.TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_TICKER),
    interval: normalizeText(
      env.TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_INTERVAL,
    ),
    trading_day: normalizeText(
      env.TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_TRADING_DAY,
    ),
    analysis_cutoff: normalizeText(
      env.TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_ANALYSIS_CUTOFF,
    ),
    direction:
      normalizeText(env.TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_DIRECTION)
        ?.toLowerCase() ?? null,
    entry: parseNumber(env.TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_ENTRY),
    stop: parseNumber(env.TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_STOP),
    target: parseNumber(env.TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_TARGET),
    synthetic_outcome_persist_allowed: parseBoolean(
      env
        .TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_SYNTHETIC_OUTCOME_PERSIST_ALLOWED,
    ),
    scanner_effect_allowed: parseBoolean(
      env.TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_SCANNER_EFFECT_ALLOWED,
    ),
    ranking_effect_allowed: parseBoolean(
      env.TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_RANKING_EFFECT_ALLOWED,
    ),
  };
}

function planReady(plan: FirstTinySignalPackageSelectionPlanSummary) {
  return (
    plan.selection_plan_status === "planned" &&
    plan.source_verification === "signal_package_discovery_readback_verified" &&
    plan.ready_for_selection_approval_gate === true &&
    plan.recommended_candidate_available === true &&
    plan.selected_candidate_now === false &&
    plan.replay_executed === false &&
    plan.synthetic_outcomes_persisted === false &&
    plan.scanner_behavior_changed === false &&
    plan.live_ranking_changed === false &&
    plan.recommendation_rows_mutated === false &&
    plan.replay_allowed_now === false &&
    plan.synthetic_outcome_persistence_allowed_now === false &&
    plan.scanner_use_allowed_now === false &&
    plan.ranking_change_allowed_now === false
  );
}

function validateSignal(input: {
  signal: FirstTinySignalPackageSelectionApprovalSignal;
  plan: FirstTinySignalPackageSelectionPlanSummary;
}) {
  const blockers: string[] = [];
  const { signal, plan } = input;

  if (signal.approved !== true) pushUnique(blockers, "approved_not_true");
  if (!signal.operator_label_present) {
    pushUnique(blockers, "missing_operator_label");
  }
  if (!signal.reference_present) pushUnique(blockers, "missing_reference");
  if (
    signal.candidate_id !==
    "recommendation_row:7dd59e66-7e54-4d35-92f9-5cc1ae11c557"
  ) {
    pushUnique(blockers, "candidate_id_mismatch");
  }
  if (signal.source_type_value !== "recommendation_row") {
    pushUnique(blockers, "source_type_mismatch");
  }
  if (signal.source_row_id !== "7dd59e66-7e54-4d35-92f9-5cc1ae11c557") {
    pushUnique(blockers, "source_row_id_mismatch");
  }
  if (signal.ticker !== "AAPL") pushUnique(blockers, "ticker_mismatch");
  if (signal.interval !== "5min") pushUnique(blockers, "interval_mismatch");
  if (signal.trading_day !== "2026-07-08") {
    pushUnique(blockers, "trading_day_mismatch");
  }
  if (signal.analysis_cutoff !== "2026-07-08T13:49:19.521608+00:00") {
    pushUnique(blockers, "analysis_cutoff_mismatch");
  }
  if (signal.direction !== "long") pushUnique(blockers, "direction_mismatch");
  if (!sameNumber(signal.entry, 304.86)) pushUnique(blockers, "entry_mismatch");
  if (!sameNumber(signal.stop, 295.62)) pushUnique(blockers, "stop_mismatch");
  if (!sameNumber(signal.target, 334.12)) {
    pushUnique(blockers, "target_mismatch");
  }
  if (signal.synthetic_outcome_persist_allowed !== false) {
    pushUnique(blockers, "synthetic_outcome_persist_not_false");
  }
  if (signal.scanner_effect_allowed !== false) {
    pushUnique(blockers, "scanner_effect_not_false");
  }
  if (signal.ranking_effect_allowed !== false) {
    pushUnique(blockers, "ranking_effect_not_false");
  }
  if (plan.source_verification !== "signal_package_discovery_readback_verified") {
    pushUnique(blockers, "source_verification_mismatch");
  }
  if (plan.ready_for_selection_approval_gate !== true) {
    pushUnique(blockers, "selection_approval_gate_not_ready");
  }
  if (plan.replay_executed !== false) {
    pushUnique(blockers, "replay_execution_not_false");
  }
  if (!planReady(plan)) pushUnique(blockers, "selection_plan_not_ready");

  return blockers;
}

export function buildFirstTinyHistoricalReplaySignalPackageSelectionApproval(
  input: FirstTinySignalPackageSelectionApprovalInput = {},
): FirstTinySignalPackageSelectionApprovalSummary {
  const plan =
    input.selection_plan ??
    buildFirstTinyHistoricalReplaySignalPackageSelectionPlan();
  const signal = buildFirstTinySignalPackageSelectionApprovalSignalFromEnv(
    input.env ?? process.env,
  );
  const readyToAccept = planReady(plan);
  const blockers = signal.source_present
    ? validateSignal({ signal, plan })
    : [];
  const valid =
    signal.source_present && blockers.length === 0 && readyToAccept === true;

  return {
    approval_marker:
      firstTinyHistoricalReplaySignalPackageSelectionApprovalMarker,
    approval_status: !signal.source_present
      ? "not_configured"
      : valid
        ? "valid_for_future_replay_with_signal_package"
        : "invalid",
    approval_gate_only: true,
    advisory_only: true,
    signal,
    source_verification: plan.source_verification,
    recommended_candidate_id: plan.recommended_candidate.candidate_id,
    source_type: plan.recommended_candidate.source_type,
    source_row_id: plan.recommended_candidate.source_row_id,
    ticker: plan.ticker,
    interval: plan.interval,
    trading_day: plan.trading_day,
    analysis_cutoff: plan.recommended_candidate.analysis_cutoff,
    direction: plan.recommended_candidate.direction,
    entry: plan.recommended_candidate.entry,
    stop: plan.recommended_candidate.stop,
    target: plan.recommended_candidate.target,
    selected_candidate_authorized_now: valid,
    ready_to_accept_future_signal: readyToAccept,
    ready_to_propose_replay_with_signal_package: valid,
    replay_allowed_now: false,
    synthetic_outcome_persistence_allowed_now: false,
    scanner_use_allowed_now: false,
    ranking_change_allowed_now: false,
    replay_executed: false,
    synthetic_outcomes_persisted: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    provider_call_executed: false,
    provider_call_attempted: false,
    candles_persisted: false,
    raw_response_persisted: false,
    fetch_run_persisted: false,
    recommendation_rows_mutated: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    scanner_universe_changed: false,
    thresholds_changed: false,
    outcome_evaluation_persistence_changed: false,
    learning_acceleration_changed: false,
    add_trade_affected: false,
    broker_execution_affected: false,
    risk_changed: false,
    expected_contract: {
      env_names: envKeys,
      expected_candidate_id:
        "recommendation_row:7dd59e66-7e54-4d35-92f9-5cc1ae11c557",
      expected_source_type: "recommendation_row",
      expected_source_row_id: "7dd59e66-7e54-4d35-92f9-5cc1ae11c557",
      expected_ticker: "AAPL",
      expected_interval: "5min",
      expected_trading_day: "2026-07-08",
      expected_analysis_cutoff: "2026-07-08T13:49:19.521608+00:00",
      expected_direction: "long",
      expected_entry: 304.86,
      expected_stop: 295.62,
      expected_target: 334.12,
      expected_synthetic_outcome_persist_allowed: false,
      expected_scanner_effect_allowed: false,
      expected_ranking_effect_allowed: false,
    },
    blockers,
    warnings: valid
      ? ["valid_signal_does_not_execute_replay"]
      : [],
    recommended_next_steps: [
      "configure_valid_signal_package_selection_approval",
      "require_separate_action_before_replay_with_signal_package",
      "keep_synthetic_outcomes_scanner_and_ranking_disabled",
    ],
  };
}
