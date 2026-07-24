import {
  buildFirstTinyCorrectedCandlePayloadRefetchPlan,
  firstTinyCorrectedCandlePayloadRefetchPlanMarker,
  type FirstTinyCorrectedPayloadRefetchPlan,
} from "@/lib/first-tiny-historical-candle-corrected-payload-refetch-plan";
import {
  buildFirstTinyCandlePayloadWindowSanityReview,
  type FirstTinyCandlePayloadWindowSanityReview,
} from "@/lib/first-tiny-historical-candle-payload-window-sanity-review";

export type FirstTinyCorrectedPayloadRefetchApprovalStatus =
  | "not_configured"
  | "invalid"
  | "valid_for_future_corrected_payload_refetch";

export type FirstTinyCorrectedPayloadRefetchApprovalEnv = Record<
  string,
  string | undefined
>;

export type FirstTinyCorrectedPayloadRefetchApprovalSignal = {
  source_type: "none" | "server_env";
  source_present: boolean;
  approved: boolean | null;
  operator_label: string | null;
  approval_reference: string | null;
  ticker: string | null;
  strategy: string | null;
  max_requests: number | null;
  estimated_credits: number | null;
  candle_persist_allowed: boolean | null;
  raw_response_persist_allowed: boolean | null;
  replay_allowed: boolean | null;
  scanner_effect_allowed: boolean | null;
};

export type FirstTinyCorrectedPayloadRefetchApprovalInput = {
  env?: FirstTinyCorrectedPayloadRefetchApprovalEnv | null;
  window_review?: FirstTinyCandlePayloadWindowSanityReview | null;
  corrected_plan?: FirstTinyCorrectedPayloadRefetchPlan | null;
};

export type FirstTinyCorrectedPayloadRefetchApprovalSummary = {
  advisory_only: true;
  approval_gate_only: true;
  approval_status: FirstTinyCorrectedPayloadRefetchApprovalStatus;
  signal: FirstTinyCorrectedPayloadRefetchApprovalSignal & {
    signal_active: boolean;
    operator_label_present: boolean;
    approval_reference_present: boolean;
  };
  expected_contract: {
    env_names: string[];
    source_plan: typeof firstTinyCorrectedCandlePayloadRefetchPlanMarker;
    expected_ticker: "AAPL";
    expected_strategy: "full_day_fetch_then_filter_locally";
    expected_max_requests: 1;
    expected_estimated_credits: 1;
    expected_candle_persist_allowed: false;
    expected_raw_response_persist_allowed: false;
    expected_replay_allowed: false;
    expected_scanner_effect_allowed: false;
  };
  validation: {
    approved_valid: boolean;
    operator_label_valid: boolean;
    approval_reference_valid: boolean;
    ticker_valid: boolean;
    strategy_valid: boolean;
    max_requests_valid: boolean;
    estimated_credits_valid: boolean;
    candle_persist_scope_valid: boolean;
    raw_response_persist_scope_valid: boolean;
    replay_scope_valid: boolean;
    scanner_effect_scope_valid: boolean;
    source_plan_ready: boolean;
    prior_window_review_requires_correction: boolean;
    previous_payload_not_accepted_for_write: boolean;
    provider_call_disabled_in_this_action: boolean;
    candle_write_disabled_in_this_action: boolean;
  };
  readiness: {
    ready_to_accept_future_signal: boolean;
    ready_to_propose_corrected_refetch_action: boolean;
    provider_call_allowed_now: false;
    candle_persistence_allowed_now: false;
    raw_response_persistence_allowed_now: false;
    replay_allowed_now: false;
    scanner_effect_allowed_now: false;
  };
  blockers: string[];
  warnings: string[];
  recommended_next_steps: [
    "configure_valid_corrected_payload_refetch_approval_signal",
    "require_separate_action_before_corrected_provider_refetch",
    "keep_candle_persistence_disabled",
  ];
  safety: {
    advisory_only: true;
    approval_gate_only: true;
    provider_call_executed: false;
    provider_fetch_added: false;
    historical_fetch_added: false;
    candles_persisted: false;
    raw_response_persisted: false;
    fetch_run_persisted: false;
    synthetic_outcomes_persisted: false;
    replay_executed: false;
    scanner_behavior_changed: false;
    live_ranking_changed: false;
    requires_separate_future_action: true;
  };
};

const envNames = [
  "TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_APPROVED",
  "TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_OPERATOR_LABEL",
  "TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_REFERENCE",
  "TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_TICKER",
  "TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_STRATEGY",
  "TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_MAX_REQUESTS",
  "TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_ESTIMATED_CREDITS",
  "TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_CANDLE_PERSIST_ALLOWED",
  "TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_RAW_RESPONSE_PERSIST_ALLOWED",
  "TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_REPLAY_ALLOWED",
  "TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_SCANNER_EFFECT_ALLOWED",
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

export function buildFirstTinyCorrectedPayloadRefetchApprovalSignalFromEnv(
  env: FirstTinyCorrectedPayloadRefetchApprovalEnv = process.env,
): FirstTinyCorrectedPayloadRefetchApprovalSignal {
  const sourcePresent = envNames.some(
    (key) => normalizeText(env[key]) !== null,
  );

  return {
    source_type: sourcePresent ? "server_env" : "none",
    source_present: sourcePresent,
    approved: parseBoolean(
      env.TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_APPROVED,
    ),
    operator_label: normalizeText(
      env.TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_OPERATOR_LABEL,
    ),
    approval_reference: normalizeText(
      env.TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_REFERENCE,
    ),
    ticker: normalizeTicker(
      env.TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_TICKER,
    ),
    strategy: normalizeText(
      env.TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_STRATEGY,
    ),
    max_requests: parsePositiveInteger(
      env.TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_MAX_REQUESTS,
    ),
    estimated_credits: parsePositiveInteger(
      env.TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_ESTIMATED_CREDITS,
    ),
    candle_persist_allowed: parseBoolean(
      env.TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_CANDLE_PERSIST_ALLOWED,
    ),
    raw_response_persist_allowed: parseBoolean(
      env.TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_RAW_RESPONSE_PERSIST_ALLOWED,
    ),
    replay_allowed: parseBoolean(
      env.TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_REPLAY_ALLOWED,
    ),
    scanner_effect_allowed: parseBoolean(
      env.TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_SCANNER_EFFECT_ALLOWED,
    ),
  };
}

function correctedPlanReady(plan: FirstTinyCorrectedPayloadRefetchPlan) {
  return (
    plan.corrected_refetch_plan_status === "planned" &&
    plan.plan_marker === firstTinyCorrectedCandlePayloadRefetchPlanMarker &&
    plan.dry_run_only === true &&
    plan.reason === "prior_payload_window_mismatch" &&
    plan.ticker === "AAPL" &&
    plan.recommended_strategy_id === "full_day_fetch_then_filter_locally" &&
    plan.provider_call_allowed_now === false &&
    plan.candle_persistence_allowed_now === false &&
    plan.raw_response_persistence_allowed_now === false &&
    plan.replay_allowed_now === false &&
    plan.scanner_effect_allowed_now === false &&
    plan.requires_separate_operator_approval === true
  );
}

export function buildFirstTinyCorrectedPayloadRefetchApproval(
  input: FirstTinyCorrectedPayloadRefetchApprovalInput = {},
): FirstTinyCorrectedPayloadRefetchApprovalSummary {
  const windowReview =
    input.window_review ?? buildFirstTinyCandlePayloadWindowSanityReview();
  const correctedPlan =
    input.corrected_plan ??
    buildFirstTinyCorrectedCandlePayloadRefetchPlan(undefined, windowReview);
  const signal = buildFirstTinyCorrectedPayloadRefetchApprovalSignalFromEnv(
    input.env ?? process.env,
  );
  const validation = {
    approved_valid: signal.approved === true,
    operator_label_valid: normalizeText(signal.operator_label) !== null,
    approval_reference_valid:
      normalizeText(signal.approval_reference) !== null,
    ticker_valid: normalizeTicker(signal.ticker) === "AAPL",
    strategy_valid:
      normalizeText(signal.strategy) === "full_day_fetch_then_filter_locally",
    max_requests_valid: signal.max_requests === 1,
    estimated_credits_valid: signal.estimated_credits === 1,
    candle_persist_scope_valid: signal.candle_persist_allowed === false,
    raw_response_persist_scope_valid:
      signal.raw_response_persist_allowed === false,
    replay_scope_valid: signal.replay_allowed === false,
    scanner_effect_scope_valid: signal.scanner_effect_allowed === false,
    source_plan_ready: correctedPlanReady(correctedPlan),
    prior_window_review_requires_correction:
      windowReview.review_status === "corrected_refetch_required" &&
      windowReview.corrected_refetch_required === true,
    previous_payload_not_accepted_for_write:
      correctedPlan.prior_payload.accepted_for_write === false,
    provider_call_disabled_in_this_action:
      correctedPlan.provider_call_allowed_now === false,
    candle_write_disabled_in_this_action:
      correctedPlan.candle_persistence_allowed_now === false &&
      windowReview.candle_write_ready === false,
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
    if (!validation.strategy_valid) pushUnique(blockers, "strategy_mismatch");
    if (!validation.max_requests_valid) {
      pushUnique(blockers, "max_requests_not_one");
    }
    if (!validation.estimated_credits_valid) {
      pushUnique(blockers, "estimated_credits_not_one");
    }
    if (!validation.candle_persist_scope_valid) {
      pushUnique(blockers, "candle_persist_not_allowed");
    }
    if (!validation.raw_response_persist_scope_valid) {
      pushUnique(blockers, "raw_response_persist_not_allowed");
    }
    if (!validation.replay_scope_valid) {
      pushUnique(blockers, "replay_not_allowed");
    }
    if (!validation.scanner_effect_scope_valid) {
      pushUnique(blockers, "scanner_effect_not_allowed");
    }
    if (!validation.source_plan_ready) {
      pushUnique(blockers, "source_plan_not_ready");
    }
    if (!validation.prior_window_review_requires_correction) {
      pushUnique(blockers, "prior_window_review_not_corrected_required");
    }
    if (!validation.previous_payload_not_accepted_for_write) {
      pushUnique(blockers, "previous_payload_accepted_for_write");
    }
    if (!validation.provider_call_disabled_in_this_action) {
      pushUnique(blockers, "provider_call_not_disabled_in_this_action");
    }
    if (!validation.candle_write_disabled_in_this_action) {
      pushUnique(blockers, "candle_write_not_disabled_in_this_action");
    }
  }

  const approvalStatus: FirstTinyCorrectedPayloadRefetchApprovalStatus =
    !signal.source_present
      ? "not_configured"
      : blockers.length === 0
        ? "valid_for_future_corrected_payload_refetch"
        : "invalid";
  const correctedPlanReadyForSignal = correctedPlanReady(correctedPlan);

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
      env_names: [...envNames],
      source_plan: firstTinyCorrectedCandlePayloadRefetchPlanMarker,
      expected_ticker: "AAPL",
      expected_strategy: "full_day_fetch_then_filter_locally",
      expected_max_requests: 1,
      expected_estimated_credits: 1,
      expected_candle_persist_allowed: false,
      expected_raw_response_persist_allowed: false,
      expected_replay_allowed: false,
      expected_scanner_effect_allowed: false,
    },
    validation,
    readiness: {
      ready_to_accept_future_signal: correctedPlanReadyForSignal,
      ready_to_propose_corrected_refetch_action:
        approvalStatus === "valid_for_future_corrected_payload_refetch",
      provider_call_allowed_now: false,
      candle_persistence_allowed_now: false,
      raw_response_persistence_allowed_now: false,
      replay_allowed_now: false,
      scanner_effect_allowed_now: false,
    },
    blockers,
    warnings:
      approvalStatus === "valid_for_future_corrected_payload_refetch"
        ? ["separate_execute_action_required_before_provider_refetch"]
        : ["corrected_payload_refetch_not_executable_in_this_action"],
    recommended_next_steps: [
      "configure_valid_corrected_payload_refetch_approval_signal",
      "require_separate_action_before_corrected_provider_refetch",
      "keep_candle_persistence_disabled",
    ],
    safety: {
      advisory_only: true,
      approval_gate_only: true,
      provider_call_executed: false,
      provider_fetch_added: false,
      historical_fetch_added: false,
      candles_persisted: false,
      raw_response_persisted: false,
      fetch_run_persisted: false,
      synthetic_outcomes_persisted: false,
      replay_executed: false,
      scanner_behavior_changed: false,
      live_ranking_changed: false,
      requires_separate_future_action: true,
    },
  };
}
