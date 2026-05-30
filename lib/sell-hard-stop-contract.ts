import type { TradeExitExecutionPayload } from "@/lib/exit-execution-payload";

export type SellHardStopId =
  | "missing_exit_payload"
  | "expired_exit_payload"
  | "wrong_payload_kind"
  | "missing_payload_id"
  | "missing_payload_fingerprint"
  | "missing_handoff_session_id"
  | "missing_position_id"
  | "position_already_closed"
  | "missing_ticker"
  | "missing_company_name"
  | "missing_position_size"
  | "missing_quantity_to_sell"
  | "quantity_to_sell_invalid"
  | "quantity_exceeds_open_position"
  | "broker_not_avanza"
  | "broker_mode_not_prepare_only"
  | "order_intent_not_sell"
  | "missing_submit_guard"
  | "missing_human_confirmation_requirement"
  | "missing_stop_before_final_confirmation"
  | "missing_exit_price_reference"
  | "missing_current_price"
  | "stale_exit_payload"
  | "missing_exit_reason"
  | "partial_close_unverified"
  | "credentials_required_or_detected"
  | "unknown_broker_ui_state"
  | "unsafe_to_continue"
  | "exact_broker_labels_unverified";

export type SellHardStopSeverity = "info" | "warning" | "critical";

export type SellHardStopStatus =
  | "passed"
  | "warning"
  | "failed"
  | "not_applicable"
  | "unknown";

export type SellHardStopCategory =
  | "payload"
  | "position"
  | "broker"
  | "order_fields"
  | "exit_context"
  | "freshness"
  | "human_confirmation"
  | "security"
  | "unknown_state";

export type SellHardStopOverallStatus = "ready" | "warning" | "blocked";

export type SellHardStopRule = {
  id: SellHardStopId;
  label: string;
  description: string;
  category: SellHardStopCategory;
  severity: SellHardStopSeverity;
  blocks_agent: boolean;
  blocks_mark_ready: boolean;
  blocks_sell_handoff: boolean;
  blocks_close_trade_creation: boolean;
  remediation: string;
  source: string;
};

export type SellHardStopEvaluation = SellHardStopRule & {
  status: SellHardStopStatus;
  message: string;
  evaluated_at: string;
};

export type SellHardStopContract = {
  contract_version: "1.0";
  evaluated_at: string;
  overall_status: SellHardStopOverallStatus;
  can_prepare_sell_form: boolean;
  can_mark_sell_ready_for_agent: boolean;
  can_continue_to_manual_review: boolean;
  can_close_trade_now: boolean;
  failed_count: number;
  warning_count: number;
  unknown_count: number;
  rules: SellHardStopEvaluation[];
  top_blockers: SellHardStopEvaluation[];
  top_warnings: SellHardStopEvaluation[];
  machine_summary: {
    top_blocker_ids: SellHardStopId[];
    top_warning_ids: SellHardStopId[];
    failed_rule_ids: SellHardStopId[];
    warning_rule_ids: SellHardStopId[];
    unknown_rule_ids: SellHardStopId[];
  };
  human_summary: string;
};

export type SellHardStopContractMetadataSnapshot = {
  contract_version: SellHardStopContract["contract_version"];
  overall_status: SellHardStopOverallStatus;
  failed_count: number;
  warning_count: number;
  unknown_count: number;
  evaluated_at: string;
  top_blocker_ids: SellHardStopId[];
  top_warning_ids: SellHardStopId[];
};

export type EvaluateSellHardStopContractInput = {
  payload?: TradeExitExecutionPayload | null;
  positionStatus?: "open" | "closed" | string | null;
  brokerUiState?: "not_applicable" | "known_safe" | "unknown" | "unsafe" | null;
  credentialsRequiredOrDetected?: boolean | null;
  unsafeToContinue?: boolean | null;
  exactBrokerLabelsVerified?: boolean | null;
  existingCanCloseTradeNow?: boolean | null;
  now?: Date;
};

function positiveNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : null;
}

function secondsUntilExpiry(payload: TradeExitExecutionPayload, now: Date) {
  const expiresAt = new Date(payload.expires_at).getTime();

  if (!Number.isFinite(expiresAt)) {
    return null;
  }

  return Math.ceil((expiresAt - now.getTime()) / 1000);
}

function rule(
  id: SellHardStopId,
  label: string,
  description: string,
  category: SellHardStopCategory,
  severity: SellHardStopSeverity,
  options: {
    blocksAgent?: boolean;
    blocksMarkReady?: boolean;
    blocksSellHandoff?: boolean;
    blocksCloseTradeCreation?: boolean;
    remediation: string;
    source: string;
  },
): SellHardStopRule {
  return {
    id,
    label,
    description,
    category,
    severity,
    blocks_agent: options.blocksAgent ?? severity === "critical",
    blocks_mark_ready: options.blocksMarkReady ?? severity === "critical",
    blocks_sell_handoff: options.blocksSellHandoff ?? severity === "critical",
    blocks_close_trade_creation: options.blocksCloseTradeCreation ?? false,
    remediation: options.remediation,
    source: options.source,
  };
}

function evaluate(
  baseRule: SellHardStopRule,
  status: SellHardStopStatus,
  message: string,
  evaluatedAt: string,
): SellHardStopEvaluation {
  return {
    ...baseRule,
    status,
    message,
    evaluated_at: evaluatedAt,
  };
}

function isBlockingStatus(status: SellHardStopStatus) {
  return status === "failed" || status === "unknown";
}

function ruleBlocks(
  item: SellHardStopEvaluation,
  field:
    | "blocks_agent"
    | "blocks_mark_ready"
    | "blocks_sell_handoff"
    | "blocks_close_trade_creation",
) {
  return isBlockingStatus(item.status) && item[field];
}

export function evaluateSellHardStopContract({
  payload,
  positionStatus = "open",
  brokerUiState = "not_applicable",
  credentialsRequiredOrDetected = false,
  unsafeToContinue = false,
  exactBrokerLabelsVerified = false,
  existingCanCloseTradeNow = null,
  now = new Date(),
}: EvaluateSellHardStopContractInput): SellHardStopContract {
  const evaluatedAt = now.toISOString();
  const secondsLeft = payload ? secondsUntilExpiry(payload, now) : null;
  const payloadFresh = secondsLeft !== null && secondsLeft > 0;
  const positionIdPresent = Boolean(payload?.exit_context.position_id);
  const tickerPresent = Boolean(
    payload?.exit_context.ticker && payload.exit_context.ticker !== "UNKNOWN",
  );
  const companyNamePresent = Boolean(payload?.exit_context.company_name);
  const positionSize = positiveNumber(payload?.position_snapshot.position_size);
  const quantityToSell = positiveNumber(payload?.order_intent.quantity_to_sell);
  const priceReference = positiveNumber(payload?.order_intent.price_reference);
  const currentPrice = positiveNumber(payload?.position_snapshot.current_price);
  const manualConfirmationRequired =
    payload?.human_final_confirmation_required === true &&
    payload?.safety.manual_final_confirmation_required === true;
  const submitGuardPresent =
    payload?.do_not_submit_order === true &&
    payload?.safety.do_not_submit_order === true;
  const stopBeforeFinalConfirmation =
    payload?.safety.stop_before === "final_broker_confirmation";
  const exitReasonPresent = Boolean(
    payload?.exit_context.exit_reason || payload?.exit_context.close_reason,
  );
  const quantityExceedsOpenPosition =
    quantityToSell !== null &&
    positionSize !== null &&
    quantityToSell > positionSize;

  const rules: SellHardStopEvaluation[] = [
    evaluate(
      rule(
        "missing_exit_payload",
        "Sell payload available",
        "A machine-readable sell execution payload must exist before sell handoff.",
        "payload",
        "critical",
        {
          remediation: "Reopen Close Trade to regenerate the sell payload.",
          source: "exit_execution_payload",
        },
      ),
      payload ? "passed" : "failed",
      payload ? "Sell execution payload is available." : "Sell payload is missing.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "expired_exit_payload",
        "Sell payload is fresh",
        "Expired sell payloads must not be used for agent preparation.",
        "freshness",
        "critical",
        {
          remediation: "Reopen Close Trade to regenerate fresh sell details.",
          source: "exit_execution_payload.expires_at",
        },
      ),
      payload && payloadFresh ? "passed" : "failed",
      payload && payloadFresh
        ? "Sell payload expiry is valid and still in the future."
        : "Sell payload is expired or expiry could not be verified.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "wrong_payload_kind",
        "Payload kind is exit execution",
        "Sell handoff requires payload_kind exit_execution.",
        "payload",
        "critical",
        {
          remediation: "Use a sell execution payload from Close Trade.",
          source: "exit_execution_payload.payload_kind",
        },
      ),
      payload?.payload_kind === "exit_execution" ? "passed" : "failed",
      payload?.payload_kind === "exit_execution"
        ? "Payload kind is exit_execution."
        : "Payload kind is not exit_execution.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "missing_payload_id",
        "Payload id present",
        "A payload id is required for audit and handoff replay.",
        "payload",
        "critical",
        {
          remediation: "Regenerate the sell payload.",
          source: "exit_execution_payload.payload_id",
        },
      ),
      payload?.payload_id ? "passed" : "failed",
      payload?.payload_id ? "Payload id is present." : "Payload id is missing.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "missing_payload_fingerprint",
        "Payload fingerprint present",
        "A payload fingerprint is required to detect mismatches.",
        "payload",
        "critical",
        {
          remediation: "Regenerate the sell payload.",
          source: "exit_execution_payload.payload_fingerprint",
        },
      ),
      payload?.payload_fingerprint ? "passed" : "failed",
      payload?.payload_fingerprint
        ? "Payload fingerprint is present."
        : "Payload fingerprint is missing.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "missing_handoff_session_id",
        "Handoff session present",
        "A handoff session id is required for sell handoff audit.",
        "payload",
        "critical",
        {
          remediation: "Regenerate the sell payload.",
          source: "exit_execution_payload.handoff_session_id",
        },
      ),
      payload?.handoff_session_id ? "passed" : "failed",
      payload?.handoff_session_id
        ? "Handoff session id is present."
        : "Handoff session id is missing.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "missing_position_id",
        "Position id present",
        "Sell handoff must be tied to a known live position.",
        "position",
        "critical",
        {
          remediation: "Reopen Close Trade from a live position.",
          source: "exit_execution_payload.exit_context.position_id",
        },
      ),
      positionIdPresent ? "passed" : "failed",
      positionIdPresent ? "Position id is present." : "Position id is missing.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "position_already_closed",
        "Position is open",
        "Sell handoff should only prepare exits for open positions.",
        "position",
        "critical",
        {
          remediation: "Do not prepare a sell handoff for an already closed trade.",
          source: "position.status",
        },
      ),
      positionStatus === "closed" ? "failed" : "passed",
      positionStatus === "closed"
        ? "Position is already closed."
        : "Position is not marked closed.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "missing_ticker",
        "Ticker present",
        "Ticker/symbol is required to prepare the sell form.",
        "position",
        "critical",
        {
          remediation: "Regenerate payload from a position with a known ticker.",
          source: "exit_execution_payload.exit_context.ticker",
        },
      ),
      tickerPresent ? "passed" : "failed",
      tickerPresent ? "Ticker is present." : "Ticker is missing.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "missing_company_name",
        "Company name present",
        "Company name helps human review of the broker instrument match.",
        "position",
        "warning",
        {
          blocksAgent: false,
          blocksMarkReady: false,
          blocksSellHandoff: false,
          remediation: "Review ticker manually in Avanza.",
          source: "exit_execution_payload.exit_context.company_name",
        },
      ),
      companyNamePresent ? "passed" : "warning",
      companyNamePresent
        ? "Company name is present."
        : "Company name is missing; ticker must be reviewed manually.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "missing_position_size",
        "Open position size present",
        "Open position size is required before preparing a sell order.",
        "position",
        "critical",
        {
          remediation: "Refresh position data before sell handoff.",
          source: "exit_execution_payload.position_snapshot.position_size",
        },
      ),
      positionSize !== null ? "passed" : "failed",
      positionSize !== null
        ? "Open position size is present."
        : "Open position size is missing.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "missing_quantity_to_sell",
        "Quantity to sell present",
        "Quantity to sell must exist before form preparation.",
        "order_fields",
        "critical",
        {
          remediation: "Regenerate the sell payload with a quantity.",
          source: "exit_execution_payload.order_intent.quantity_to_sell",
        },
      ),
      payload?.order_intent.quantity_to_sell === null ||
        payload?.order_intent.quantity_to_sell === undefined
        ? "failed"
        : "passed",
      payload?.order_intent.quantity_to_sell === null ||
        payload?.order_intent.quantity_to_sell === undefined
        ? "Quantity to sell is missing."
        : "Quantity to sell is present.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "quantity_to_sell_invalid",
        "Quantity to sell valid",
        "Quantity to sell must be greater than zero.",
        "order_fields",
        "critical",
        {
          remediation: "Regenerate payload with a positive sell quantity.",
          source: "exit_execution_payload.order_intent.quantity_to_sell",
        },
      ),
      quantityToSell !== null ? "passed" : "failed",
      quantityToSell !== null
        ? "Quantity to sell is greater than zero."
        : "Quantity to sell is invalid.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "quantity_exceeds_open_position",
        "Quantity within open position",
        "Quantity to sell must not exceed open position size.",
        "order_fields",
        "critical",
        {
          remediation: "Refresh position size and regenerate sell payload.",
          source: "exit_execution_payload.order_intent + position_snapshot",
        },
      ),
      quantityExceedsOpenPosition ? "failed" : "passed",
      quantityExceedsOpenPosition
        ? "Quantity to sell exceeds open position size."
        : "Quantity to sell does not exceed open position size.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "broker_not_avanza",
        "Broker is Avanza",
        "Only AVANZA sell handoff contracts are supported.",
        "broker",
        "critical",
        {
          remediation: "Use an AVANZA sell execution payload.",
          source: "exit_execution_payload.broker_hint",
        },
      ),
      payload?.broker_hint === "AVANZA" ? "passed" : "failed",
      payload?.broker_hint === "AVANZA"
        ? "Broker hint is AVANZA."
        : "Only AVANZA sell handoff is supported.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "broker_mode_not_prepare_only",
        "Broker mode is prepare-only",
        "Sell handoff may prepare only; it must never submit orders.",
        "broker",
        "critical",
        {
          remediation: "Regenerate payload with broker_execution_mode prepare_only.",
          source: "exit_execution_payload.broker_execution_mode",
        },
      ),
      payload?.broker_execution_mode === "prepare_only" ? "passed" : "failed",
      payload?.broker_execution_mode === "prepare_only"
        ? "Broker execution mode is prepare-only."
        : "Broker execution mode is not prepare-only.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "order_intent_not_sell",
        "Order intent is sell",
        "Sell handoff requires SELL side.",
        "order_fields",
        "critical",
        {
          remediation: "Regenerate a SELL exit payload.",
          source: "exit_execution_payload.order_intent.side",
        },
      ),
      payload?.order_intent.side === "SELL" ? "passed" : "failed",
      payload?.order_intent.side === "SELL"
        ? "Order side is SELL."
        : "Order side is not SELL.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "missing_submit_guard",
        "Submit guard present",
        "Payload must explicitly forbid order submission.",
        "broker",
        "critical",
        {
          remediation: "Regenerate payload with do_not_submit_order=true.",
          source: "exit_execution_payload.do_not_submit_order + safety",
        },
      ),
      submitGuardPresent ? "passed" : "failed",
      submitGuardPresent
        ? "Payload explicitly forbids order submission."
        : "Payload does not explicitly forbid order submission.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "missing_human_confirmation_requirement",
        "Human confirmation required",
        "Final SÄLJ confirmation in Avanza must be manual.",
        "human_confirmation",
        "critical",
        {
          remediation: "Regenerate payload with manual final confirmation required.",
          source:
            "exit_execution_payload.human_final_confirmation_required + safety",
        },
      ),
      manualConfirmationRequired ? "passed" : "failed",
      manualConfirmationRequired
        ? "Payload requires manual final confirmation."
        : "Payload does not require manual final confirmation.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "missing_stop_before_final_confirmation",
        "Stop-before final confirmation present",
        "Agent must stop before final broker confirmation.",
        "human_confirmation",
        "critical",
        {
          remediation: "Regenerate payload with stop_before final_broker_confirmation.",
          source: "exit_execution_payload.safety.stop_before",
        },
      ),
      stopBeforeFinalConfirmation ? "passed" : "failed",
      stopBeforeFinalConfirmation
        ? "Payload requires stop before final broker confirmation."
        : "Payload does not require stop before final broker confirmation.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "missing_exit_price_reference",
        "Exit price reference present",
        "A price reference is required before preparing the sell form.",
        "order_fields",
        "critical",
        {
          remediation: "Refresh current price or enter exit context before handoff.",
          source: "exit_execution_payload.order_intent.price_reference",
        },
      ),
      priceReference !== null ? "passed" : "failed",
      priceReference !== null
        ? "Exit price reference is present."
        : "Exit price reference is missing.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "missing_current_price",
        "Current price available",
        "Current price should be available for sell-form review.",
        "order_fields",
        "warning",
        {
          blocksAgent: false,
          blocksMarkReady: false,
          blocksSellHandoff: false,
          remediation: "Review current price manually before SÄLJ confirmation.",
          source: "exit_execution_payload.position_snapshot.current_price",
        },
      ),
      currentPrice !== null ? "passed" : "warning",
      currentPrice !== null
        ? "Current price is available."
        : "Current price is unavailable; price reference requires review.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "stale_exit_payload",
        "Payload has freshness buffer",
        "Payloads close to expiry require extra caution before sell handoff.",
        "freshness",
        "warning",
        {
          blocksAgent: false,
          blocksMarkReady: false,
          blocksSellHandoff: false,
          remediation: "Regenerate the sell payload if delayed.",
          source: "exit_execution_payload.expires_at",
        },
      ),
      secondsLeft === null
        ? "unknown"
        : secondsLeft > 0 && secondsLeft < 60
          ? "warning"
          : "passed",
      secondsLeft === null
        ? "Payload freshness buffer could not be evaluated."
        : secondsLeft > 0 && secondsLeft < 60
          ? "Payload has less than one minute before expiry."
          : "Payload has enough freshness buffer.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "missing_exit_reason",
        "Exit reason present",
        "Exit reason helps human review the planned sell action.",
        "exit_context",
        "warning",
        {
          blocksAgent: false,
          blocksMarkReady: false,
          blocksSellHandoff: false,
          remediation: "Add an exit note or review why the trade is being closed.",
          source: "exit_execution_payload.exit_context",
        },
      ),
      exitReasonPresent ? "passed" : "warning",
      exitReasonPresent
        ? "Exit reason is present."
        : "Exit reason is missing.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "partial_close_unverified",
        "Partial close verified",
        "Partial close flow is not fully verified yet.",
        "exit_context",
        "warning",
        {
          blocksAgent: false,
          blocksMarkReady: false,
          blocksSellHandoff: false,
          remediation: "Use full close or manually verify partial-close quantity.",
          source: "exit_execution_payload.order_intent.action",
        },
      ),
      payload?.order_intent.action === "partial_close" ? "warning" : "passed",
      payload?.order_intent.action === "partial_close"
        ? "Partial close is not fully supported yet."
        : "Payload is not a partial close.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "credentials_required_or_detected",
        "No credentials required",
        "Sell handoff must never require or handle credentials.",
        "security",
        "critical",
        {
          remediation: "Stop immediately. Do not handle credentials.",
          source: "runtime_security",
        },
      ),
      credentialsRequiredOrDetected ? "failed" : "passed",
      credentialsRequiredOrDetected
        ? "Credentials are required or detected."
        : "No credential handling is required.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "unknown_broker_ui_state",
        "Broker UI state is known safe",
        "Unknown or unsafe broker UI state must stop sell handoff.",
        "unknown_state",
        "critical",
        {
          remediation: "Stop and require human review of the broker UI.",
          source: "broker_ui_state",
        },
      ),
      brokerUiState === "unsafe"
        ? "failed"
        : brokerUiState === "unknown"
          ? "unknown"
          : brokerUiState === "known_safe"
            ? "passed"
            : "not_applicable",
      brokerUiState === "unsafe"
        ? "Broker UI state is unsafe."
        : brokerUiState === "unknown"
          ? "Broker UI state is unknown."
          : brokerUiState === "known_safe"
            ? "Broker UI state is known safe."
            : "Broker UI state is not applicable for this preview.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "unsafe_to_continue",
        "No unsafe continuation flag",
        "Any unsafe-to-continue signal must block sell handoff.",
        "security",
        "critical",
        {
          remediation: "Stop and require human review.",
          source: "runtime_safety",
        },
      ),
      unsafeToContinue ? "failed" : "passed",
      unsafeToContinue
        ? "Unsafe-to-continue flag is active."
        : "No unsafe-to-continue flag is active.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "exact_broker_labels_unverified",
        "Exact broker labels verified",
        "Exact Avanza sell field labels should be verified before real agent use.",
        "unknown_state",
        "warning",
        {
          blocksAgent: false,
          blocksMarkReady: false,
          blocksSellHandoff: false,
          remediation: "Verify exact Avanza sell form labels before automation.",
          source: "sell_form_mapping.future",
        },
      ),
      exactBrokerLabelsVerified ? "passed" : "warning",
      exactBrokerLabelsVerified
        ? "Exact broker labels are verified."
        : "Exact Avanza sell field labels are unverified.",
      evaluatedAt,
    ),
  ];
  const blockers = rules.filter((item) => ruleBlocks(item, "blocks_sell_handoff"));
  const warningRules = rules.filter(
    (item) =>
      item.status === "warning" ||
      (item.status === "unknown" && !ruleBlocks(item, "blocks_sell_handoff")),
  );
  const failedRules = rules.filter((item) => item.status === "failed");
  const unknownRules = rules.filter((item) => item.status === "unknown");
  const overall_status: SellHardStopOverallStatus =
    blockers.length > 0 ? "blocked" : warningRules.length > 0 ? "warning" : "ready";
  const canPrepareSellForm = blockers.length === 0;
  const canMarkSellReadyForAgent = blockers.length === 0;
  const canContinueToManualReview = blockers.length === 0;
  const closeTradeBlockers = rules.filter((item) =>
    ruleBlocks(item, "blocks_close_trade_creation"),
  );
  const canCloseTradeNow =
    (existingCanCloseTradeNow ?? true) && closeTradeBlockers.length === 0;
  const topBlockers = blockers.slice(0, 5);
  const topWarnings = warningRules.slice(0, 5);

  return {
    contract_version: "1.0",
    evaluated_at: evaluatedAt,
    overall_status,
    can_prepare_sell_form: canPrepareSellForm,
    can_mark_sell_ready_for_agent: canMarkSellReadyForAgent,
    can_continue_to_manual_review: canContinueToManualReview,
    can_close_trade_now: canCloseTradeNow,
    failed_count: failedRules.length,
    warning_count: rules.filter((item) => item.status === "warning").length,
    unknown_count: unknownRules.length,
    rules,
    top_blockers: topBlockers,
    top_warnings: topWarnings,
    machine_summary: {
      top_blocker_ids: topBlockers.map((item) => item.id),
      top_warning_ids: topWarnings.map((item) => item.id),
      failed_rule_ids: failedRules.map((item) => item.id),
      warning_rule_ids: rules
        .filter((item) => item.status === "warning")
        .map((item) => item.id),
      unknown_rule_ids: unknownRules.map((item) => item.id),
    },
    human_summary:
      overall_status === "blocked"
        ? `${blockers.length} sell hard stop issue${
            blockers.length === 1 ? "" : "s"
          } must be resolved before agent sell handoff.`
        : overall_status === "warning"
          ? `${warningRules.length} sell handoff warning${
              warningRules.length === 1 ? "" : "s"
            } require manual review.`
          : "Sell hard stop contract is ready for prepare-only handoff.",
  };
}

export function toSellHardStopContractMetadataSnapshot(
  contract: SellHardStopContract,
): SellHardStopContractMetadataSnapshot {
  return {
    contract_version: contract.contract_version,
    overall_status: contract.overall_status,
    failed_count: contract.failed_count,
    warning_count: contract.warning_count,
    unknown_count: contract.unknown_count,
    evaluated_at: contract.evaluated_at,
    top_blocker_ids: contract.machine_summary.top_blocker_ids,
    top_warning_ids: contract.machine_summary.top_warning_ids,
  };
}
