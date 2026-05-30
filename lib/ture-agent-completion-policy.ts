import type {
  FillCaptureReview,
  FillCaptureReviewStatus,
} from "@/lib/fill-capture-review";
import type { TureFillAutofillContract } from "@/lib/ture-fill-autofill-contract";

export type TureAgentCompletionSide = "BUY" | "SELL";

export type TureAgentCompletionTargetAction =
  | "create_live_day_trade"
  | "close_trade_in_ture";

export type TureAgentCompletionDecision =
  | "allowed_future_agent_completion"
  | "human_review_required"
  | "blocked"
  | "not_applicable";

export type TureAgentCompletionConditionStatus =
  | "met"
  | "missing"
  | "warning"
  | "blocked"
  | "not_applicable";

export type TureAgentCompletionCondition = {
  condition_id: string;
  label: string;
  status: TureAgentCompletionConditionStatus;
  required: boolean;
  message: string;
};

export type TureAgentCompletionBlocker = {
  blocker_id: string;
  label: string;
  message: string;
};

export type TureAgentCompletionWarning = {
  warning_id: string;
  label: string;
  message: string;
};

export type TureAgentCompletionAllowedAction =
  | "future_click_create_live_day_trade_in_ture_after_verified_manual_buy"
  | "future_click_close_trade_in_ture_after_verified_manual_sell"
  | "write_audit_metadata"
  | "stop_for_human_review_on_mismatch_or_uncertainty";

export type TureAgentCompletionForbiddenAction =
  | "click_avanza_buy"
  | "click_avanza_sell"
  | "submit_broker_order"
  | "modify_broker_order"
  | "handle_credentials"
  | "bypass_hard_stops"
  | "guess_missing_broker_values"
  | "create_or_close_ture_trade_when_review_status_is_not_ready"
  | "create_or_close_ture_trade_when_confirmations_are_missing"
  | "alter_planned_trade_data_to_force_match";

export type TureAgentCompletionPolicy = {
  policy_id: string;
  policy_version: "1.0";
  policy_kind: "ture_agent_completion_policy";
  created_at: string;
  side: TureAgentCompletionSide;
  broker: "AVANZA";
  mode: "policy_only_no_automatic_completion";
  target_action: TureAgentCompletionTargetAction;
  decision: TureAgentCompletionDecision;
  review_id: string;
  review_status: FillCaptureReviewStatus;
  autofill_contract_id: string;
  source_payload_id: string;
  source_payload_fingerprint: string | null;
  handoff_session_id: string;
  ticker: string;
  position_id: string | null;
  conditions: TureAgentCompletionCondition[];
  blockers: TureAgentCompletionBlocker[];
  warnings: TureAgentCompletionWarning[];
  allowed_future_agent_actions: TureAgentCompletionAllowedAction[];
  forbidden_actions: TureAgentCompletionForbiddenAction[];
  safety_attestations: {
    avanza_final_buy_sell_is_human_only: true;
    broker_order_submission_is_forbidden: true;
    policy_is_read_only: true;
    automatic_ture_completion_is_not_enabled: true;
    only_ture_recordkeeping_after_manual_broker_confirmation: true;
  };
  human_summary: string;
  machine_summary: {
    met_count: number;
    missing_count: number;
    warning_count: number;
    blocked_count: number;
    blocker_ids: string[];
    warning_ids: string[];
  };
};

type CommonBuildInput = {
  review: FillCaptureReview;
  autofillContract: TureFillAutofillContract;
  ticker: string;
  payloadId: string;
  payloadFingerprint?: string | null;
  handoffSessionId?: string | null;
  positionId?: string | null;
  userInitiatedFlow?: boolean;
  auditMetadataWritable?: boolean;
  guessedBrokerValuesDetected?: boolean;
  unresolvedHardStops?: string[];
  createdAt?: string;
};

export type BuildBuyTureAgentCompletionPolicyInput = CommonBuildInput & {
  brokerStatus: string;
  actualFillPrice: number | null;
  actualFilledShares: number | null;
  manualAvanzaBuyConfirmed: boolean;
  brokerOrderMatchesTradePlan: boolean;
};

export type BuildSellTureAgentCompletionPolicyInput = CommonBuildInput & {
  exitStatus: string;
  actualExitPrice: number | null;
  actualSoldShares: number | null;
  openPositionSize: number | null;
  manualAvanzaSellConfirmed: boolean;
  brokerOrderMatchesTurePosition: boolean;
};

const forbiddenActions: TureAgentCompletionForbiddenAction[] = [
  "click_avanza_buy",
  "click_avanza_sell",
  "submit_broker_order",
  "modify_broker_order",
  "handle_credentials",
  "bypass_hard_stops",
  "guess_missing_broker_values",
  "create_or_close_ture_trade_when_review_status_is_not_ready",
  "create_or_close_ture_trade_when_confirmations_are_missing",
  "alter_planned_trade_data_to_force_match",
];

function safeIdPart(value: string | null | undefined) {
  return value?.trim().replace(/[^a-zA-Z0-9_-]+/g, "_") || "unknown";
}

function positiveNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isAcceptableFillStatus(status: string) {
  return status === "filled" || status === "partially_filled";
}

function condition({
  conditionId,
  label,
  passed,
  message,
  required = true,
  warning = false,
}: {
  conditionId: string;
  label: string;
  passed: boolean;
  message: string;
  required?: boolean;
  warning?: boolean;
}): TureAgentCompletionCondition {
  return {
    condition_id: conditionId,
    label,
    status: passed ? "met" : warning ? "warning" : "blocked",
    required,
    message,
  };
}

function blockerFromCondition(
  item: TureAgentCompletionCondition,
): TureAgentCompletionBlocker | null {
  if (!item.required || item.status !== "blocked") {
    return null;
  }

  return {
    blocker_id: item.condition_id,
    label: item.label,
    message: item.message,
  };
}

function warningFromCondition(
  item: TureAgentCompletionCondition,
): TureAgentCompletionWarning | null {
  if (item.status !== "warning") {
    return null;
  }

  return {
    warning_id: item.condition_id,
    label: item.label,
    message: item.message,
  };
}

function decisionFrom({
  reviewStatus,
  blockers,
  warnings,
}: {
  reviewStatus: FillCaptureReviewStatus;
  blockers: TureAgentCompletionBlocker[];
  warnings: TureAgentCompletionWarning[];
}): TureAgentCompletionDecision {
  if (reviewStatus === "blocked" || reviewStatus === "incomplete") {
    return "blocked";
  }

  if (blockers.length > 0) {
    return "blocked";
  }

  if (reviewStatus === "needs_review" || warnings.length > 0) {
    return "human_review_required";
  }

  return "allowed_future_agent_completion";
}

function summaryFor(decision: TureAgentCompletionDecision) {
  if (decision === "allowed_future_agent_completion") {
    return "Policy conditions are satisfied for future Ture-side recordkeeping completion, but automatic completion is not enabled.";
  }

  if (decision === "human_review_required") {
    return "Human review is required before any future agent could complete Ture-side recordkeeping.";
  }

  if (decision === "blocked") {
    return "Future Ture-side completion is blocked until required broker fill and safety conditions are resolved.";
  }

  return "Policy is not applicable for the current Ture-side recordkeeping state.";
}

function buildPolicy({
  side,
  targetAction,
  common,
  conditions,
}: {
  side: TureAgentCompletionSide;
  targetAction: TureAgentCompletionTargetAction;
  common: CommonBuildInput;
  conditions: TureAgentCompletionCondition[];
}): TureAgentCompletionPolicy {
  const now = common.createdAt ?? new Date().toISOString();
  const reviewBlockers: TureAgentCompletionBlocker[] =
    common.review.blockers.map((blocker) => ({
      blocker_id: `review_${blocker.blocker_id}`,
      label: blocker.label,
      message: blocker.message,
    }));
  const reviewWarnings: TureAgentCompletionWarning[] =
    common.review.warnings.map((warning) => ({
      warning_id: `review_${warning.warning_id}`,
      label: warning.label,
      message: warning.message,
    }));
  const conditionBlockers = conditions
    .map(blockerFromCondition)
    .filter((item): item is TureAgentCompletionBlocker => item !== null);
  const conditionWarnings = conditions
    .map(warningFromCondition)
    .filter((item): item is TureAgentCompletionWarning => item !== null);
  const unresolvedHardStopBlockers = (
    common.unresolvedHardStops ?? []
  ).map<TureAgentCompletionBlocker>((hardStopId) => ({
    blocker_id: `unresolved_hard_stop_${safeIdPart(hardStopId)}`,
    label: "Unresolved hard stop",
    message: `Unresolved hard stop remains: ${hardStopId}.`,
  }));
  const blockers = [
    ...reviewBlockers,
    ...conditionBlockers,
    ...unresolvedHardStopBlockers,
  ];
  const warnings = [...reviewWarnings, ...conditionWarnings];
  const decision = decisionFrom({
    reviewStatus: common.review.status,
    blockers,
    warnings,
  });
  const metCount = conditions.filter((item) => item.status === "met").length;
  const missingCount = conditions.filter(
    (item) => item.status === "missing",
  ).length;
  const warningCount = conditions.filter(
    (item) => item.status === "warning",
  ).length;
  const blockedCount = conditions.filter(
    (item) => item.status === "blocked",
  ).length;

  return {
    policy_id: `ture_${side.toLowerCase()}_agent_completion_policy_${safeIdPart(
      common.payloadId,
    )}_${safeIdPart(now)}`,
    policy_version: "1.0",
    policy_kind: "ture_agent_completion_policy",
    created_at: now,
    side,
    broker: "AVANZA",
    mode: "policy_only_no_automatic_completion",
    target_action: targetAction,
    decision,
    review_id: common.review.review_id,
    review_status: common.review.status,
    autofill_contract_id: common.autofillContract.contract_id,
    source_payload_id: common.payloadId,
    source_payload_fingerprint: common.payloadFingerprint ?? null,
    handoff_session_id:
      common.handoffSessionId ?? common.autofillContract.handoff_session_id,
    ticker: common.ticker,
    position_id: common.positionId ?? null,
    conditions,
    blockers,
    warnings,
    allowed_future_agent_actions:
      side === "BUY"
        ? [
            "future_click_create_live_day_trade_in_ture_after_verified_manual_buy",
            "write_audit_metadata",
            "stop_for_human_review_on_mismatch_or_uncertainty",
          ]
        : [
            "future_click_close_trade_in_ture_after_verified_manual_sell",
            "write_audit_metadata",
            "stop_for_human_review_on_mismatch_or_uncertainty",
          ],
    forbidden_actions: forbiddenActions,
    safety_attestations: {
      avanza_final_buy_sell_is_human_only: true,
      broker_order_submission_is_forbidden: true,
      policy_is_read_only: true,
      automatic_ture_completion_is_not_enabled: true,
      only_ture_recordkeeping_after_manual_broker_confirmation: true,
    },
    human_summary: summaryFor(decision),
    machine_summary: {
      met_count: metCount,
      missing_count: missingCount,
      warning_count: warningCount,
      blocked_count: blockedCount,
      blocker_ids: blockers.map((blocker) => blocker.blocker_id),
      warning_ids: warnings.map((warning) => warning.warning_id),
    },
  };
}

export function buildBuyTureAgentCompletionPolicy({
  brokerStatus,
  actualFillPrice,
  actualFilledShares,
  manualAvanzaBuyConfirmed,
  brokerOrderMatchesTradePlan,
  userInitiatedFlow = true,
  auditMetadataWritable = true,
  guessedBrokerValuesDetected = false,
  ...common
}: BuildBuyTureAgentCompletionPolicyInput): TureAgentCompletionPolicy {
  const conditions: TureAgentCompletionCondition[] = [
    condition({
      conditionId: "user_initiated_add_trade",
      label: "User initiated ADD TRADE",
      passed: userInitiatedFlow,
      message: userInitiatedFlow
        ? "ADD TRADE / prepare buy order was initiated in Ture."
        : "User must initiate ADD TRADE in Ture.",
    }),
    condition({
      conditionId: "manual_avanza_buy_confirmation",
      label: "Manual Avanza KÖP confirmed",
      passed: manualAvanzaBuyConfirmed,
      message: manualAvanzaBuyConfirmed
        ? "Manual Avanza KÖP confirmation is recorded."
        : "Manual Avanza KÖP confirmation is required.",
    }),
    condition({
      conditionId: "broker_fill_status_acceptable",
      label: "Broker status filled",
      passed: isAcceptableFillStatus(brokerStatus),
      message: isAcceptableFillStatus(brokerStatus)
        ? "Broker status is filled or partially filled."
        : "Broker status must be filled or partially filled.",
    }),
    condition({
      conditionId: "actual_fill_price_positive",
      label: "Actual fill price positive",
      passed: positiveNumber(actualFillPrice),
      message: positiveNumber(actualFillPrice)
        ? "Actual fill price is positive."
        : "Actual fill price must be greater than zero.",
    }),
    condition({
      conditionId: "actual_filled_shares_positive",
      label: "Actual filled shares positive",
      passed: positiveNumber(actualFilledShares),
      message: positiveNumber(actualFilledShares)
        ? "Actual filled shares are positive."
        : "Actual filled shares must be greater than zero.",
    }),
    condition({
      conditionId: "ticker_matches_expected",
      label: "Ticker matches expected instrument",
      passed: Boolean(common.ticker.trim()),
      message: common.ticker.trim()
        ? "Expected ticker is present for review."
        : "Expected ticker is missing.",
    }),
    condition({
      conditionId: "side_matches_buy",
      label: "Side is BUY",
      passed: common.review.side === "BUY" && common.autofillContract.side === "BUY",
      message:
        common.review.side === "BUY" && common.autofillContract.side === "BUY"
          ? "Review and autofill contract both target BUY."
          : "Review and autofill contract must both target BUY.",
    }),
    condition({
      conditionId: "broker_is_avanza",
      label: "Broker is AVANZA",
      passed: common.autofillContract.broker === "AVANZA",
      message:
        common.autofillContract.broker === "AVANZA"
          ? "Broker is AVANZA."
          : "Broker must be AVANZA.",
    }),
    condition({
      conditionId: "order_matches_ture_trade_plan",
      label: "Order matches Ture trade plan",
      passed: brokerOrderMatchesTradePlan,
      message: brokerOrderMatchesTradePlan
        ? "Broker order match is confirmed."
        : "Broker order must match the Ture trade plan.",
    }),
    condition({
      conditionId: "fill_capture_review_ready",
      label: "Fill capture review ready",
      passed: common.review.status === "ready",
      message:
        common.review.status === "ready"
          ? "Fill Capture Review is ready."
          : "Fill Capture Review must be ready for future automatic completion.",
      warning: common.review.status === "needs_review",
    }),
    condition({
      conditionId: "autofill_contract_satisfied",
      label: "Ture autofill contract available",
      passed:
        common.autofillContract.contract_kind ===
          "ture_fill_autofill_contract" &&
        common.autofillContract.target_form === "broker_fill_confirmation",
      message:
        common.autofillContract.target_form === "broker_fill_confirmation"
          ? "Ture fill autofill contract targets Broker Fill Confirmation."
          : "Ture fill autofill contract must target Broker Fill Confirmation.",
    }),
    condition({
      conditionId: "no_guessed_broker_values",
      label: "No guessed broker values",
      passed: !guessedBrokerValuesDetected,
      message: guessedBrokerValuesDetected
        ? "Guessed broker values block future completion."
        : "No guessed broker values are recorded.",
    }),
    condition({
      conditionId: "audit_metadata_writable",
      label: "Audit metadata writable",
      passed: auditMetadataWritable,
      message: auditMetadataWritable
        ? "Audit metadata can be written by a future version."
        : "Audit metadata must be writable before future completion.",
    }),
  ];

  return buildPolicy({
    side: "BUY",
    targetAction: "create_live_day_trade",
    common,
    conditions,
  });
}

export function buildSellTureAgentCompletionPolicy({
  exitStatus,
  actualExitPrice,
  actualSoldShares,
  openPositionSize,
  manualAvanzaSellConfirmed,
  brokerOrderMatchesTurePosition,
  userInitiatedFlow = true,
  auditMetadataWritable = true,
  guessedBrokerValuesDetected = false,
  ...common
}: BuildSellTureAgentCompletionPolicyInput): TureAgentCompletionPolicy {
  const soldSharesWithinOpenPosition =
    typeof actualSoldShares === "number" &&
    Number.isFinite(actualSoldShares) &&
    actualSoldShares > 0 &&
    typeof openPositionSize === "number" &&
    Number.isFinite(openPositionSize) &&
    openPositionSize > 0 &&
    actualSoldShares <= openPositionSize;
  const conditions: TureAgentCompletionCondition[] = [
    condition({
      conditionId: "user_initiated_prepare_sell_order",
      label: "User initiated Prepare Sell Order",
      passed: userInitiatedFlow,
      message: userInitiatedFlow
        ? "Prepare Sell Order / Close Trade was initiated in Ture."
        : "User must initiate Prepare Sell Order / Close Trade in Ture.",
    }),
    condition({
      conditionId: "manual_avanza_sell_confirmation",
      label: "Manual Avanza SÄLJ confirmed",
      passed: manualAvanzaSellConfirmed,
      message: manualAvanzaSellConfirmed
        ? "Manual Avanza SÄLJ confirmation is recorded."
        : "Manual Avanza SÄLJ confirmation is required.",
    }),
    condition({
      conditionId: "broker_exit_status_acceptable",
      label: "Broker exit status filled",
      passed: isAcceptableFillStatus(exitStatus),
      message: isAcceptableFillStatus(exitStatus)
        ? "Broker exit status is filled or partially filled."
        : "Broker exit status must be filled or partially filled.",
    }),
    condition({
      conditionId: "actual_exit_price_positive",
      label: "Actual exit price positive",
      passed: positiveNumber(actualExitPrice),
      message: positiveNumber(actualExitPrice)
        ? "Actual exit price is positive."
        : "Actual exit price must be greater than zero.",
    }),
    condition({
      conditionId: "actual_sold_shares_positive",
      label: "Actual sold shares positive",
      passed: positiveNumber(actualSoldShares),
      message: positiveNumber(actualSoldShares)
        ? "Actual sold shares are positive."
        : "Actual sold shares must be greater than zero.",
    }),
    condition({
      conditionId: "sold_shares_within_open_position",
      label: "Sold shares within open position",
      passed: soldSharesWithinOpenPosition,
      message: soldSharesWithinOpenPosition
        ? "Sold shares do not exceed open position size."
        : "Sold shares must not exceed open position size.",
    }),
    condition({
      conditionId: "ticker_matches_expected",
      label: "Ticker matches expected instrument",
      passed: Boolean(common.ticker.trim()),
      message: common.ticker.trim()
        ? "Expected ticker is present for review."
        : "Expected ticker is missing.",
    }),
    condition({
      conditionId: "side_matches_sell",
      label: "Side is SELL",
      passed:
        common.review.side === "SELL" && common.autofillContract.side === "SELL",
      message:
        common.review.side === "SELL" && common.autofillContract.side === "SELL"
          ? "Review and autofill contract both target SELL."
          : "Review and autofill contract must both target SELL.",
    }),
    condition({
      conditionId: "broker_is_avanza",
      label: "Broker is AVANZA",
      passed: common.autofillContract.broker === "AVANZA",
      message:
        common.autofillContract.broker === "AVANZA"
          ? "Broker is AVANZA."
          : "Broker must be AVANZA.",
    }),
    condition({
      conditionId: "order_matches_ture_position",
      label: "Order matches Ture position",
      passed: brokerOrderMatchesTurePosition,
      message: brokerOrderMatchesTurePosition
        ? "Broker order match is confirmed."
        : "Broker order must match the Ture position.",
    }),
    condition({
      conditionId: "exit_capture_review_ready",
      label: "Exit capture review ready",
      passed: common.review.status === "ready",
      message:
        common.review.status === "ready"
          ? "Exit Capture Review is ready."
          : "Exit Capture Review must be ready for future automatic completion.",
      warning: common.review.status === "needs_review",
    }),
    condition({
      conditionId: "autofill_contract_satisfied",
      label: "Ture exit autofill contract available",
      passed:
        common.autofillContract.contract_kind ===
          "ture_fill_autofill_contract" &&
        common.autofillContract.target_form === "broker_exit_confirmation",
      message:
        common.autofillContract.target_form === "broker_exit_confirmation"
          ? "Ture exit autofill contract targets Broker Exit Confirmation."
          : "Ture exit autofill contract must target Broker Exit Confirmation.",
    }),
    condition({
      conditionId: "no_guessed_broker_values",
      label: "No guessed broker values",
      passed: !guessedBrokerValuesDetected,
      message: guessedBrokerValuesDetected
        ? "Guessed broker values block future completion."
        : "No guessed broker values are recorded.",
    }),
    condition({
      conditionId: "audit_metadata_writable",
      label: "Audit metadata writable",
      passed: auditMetadataWritable,
      message: auditMetadataWritable
        ? "Audit metadata can be written by a future version."
        : "Audit metadata must be writable before future completion.",
    }),
  ];

  return buildPolicy({
    side: "SELL",
    targetAction: "close_trade_in_ture",
    common,
    conditions,
  });
}

export function tureAgentCompletionPolicyJson(
  policy: TureAgentCompletionPolicy,
) {
  return JSON.stringify(policy, null, 2);
}
