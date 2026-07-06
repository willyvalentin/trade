import type {
  AvanzaOrderTicketFieldPlan,
  AvanzaOrderTicketOrderType,
  AvanzaOrderTicketSide,
} from "./avanza-order-ticket-field-contract";

export type AvanzaOrderTicketActionContractStatus =
  | "disabled"
  | "no_action_needed"
  | "action_plan_ready"
  | "waiting_for_field_plan"
  | "blocked"
  | "error"
  | "unknown";

export type AvanzaOrderTicketActionType =
  | "no_op"
  | "select_buy_side"
  | "select_sell_side"
  | "select_account"
  | "fill_ticker"
  | "confirm_instrument"
  | "fill_quantity"
  | "select_limit_order"
  | "fill_limit_price"
  | "select_time_in_force_day"
  | "review_order"
  | "stop_before_final_buy"
  | "stop_before_final_sell"
  | "stop_for_manual_user_action";

export type AvanzaOrderTicketActionExecutionMode =
  | "disabled"
  | "contract_only"
  | "local_dev_dry_run"
  | "local_dev_execute_later";

export type AvanzaOrderTicketActionValueSource =
  | "none"
  | "field_plan"
  | "static_safe_signal"
  | "user_review";

export type AvanzaOrderTicketAction = {
  actionId: string;
  type: AvanzaOrderTicketActionType;
  label: string;
  reason: string;
  targetSignalText?: string;
  valueSource: AvanzaOrderTicketActionValueSource;
  safeDisplayValue?: string;
  containsCredentialMaterial: false;
  executableInThisTask: false;
  dryRunOnly: true;
  requiresHumanAction: boolean;
  forbidden: boolean;
  expectedResult: string;
};

export type AvanzaOrderTicketActionContractSafetyFlags = {
  contractEnabled: boolean;
  canCreateActionPlan: boolean;
  canExecuteActions: false;
  canSelectBuySide: false;
  canSelectSellSide: false;
  canSelectAccount: false;
  canFillTicker: false;
  canConfirmInstrument: false;
  canFillQuantity: false;
  canSelectLimitOrder: false;
  canFillLimitPrice: false;
  canSelectTimeInForce: false;
  canReviewOrder: false;
  canClickFinalBuy: false;
  canClickFinalSell: false;
  canSubmitOrder: false;
  canUseMarketOrder: false;
  canReadCookies: false;
  canExportSession: false;
  canAutomateBankId: false;
  canBypassBankId: false;
  userMustConfirm: true;
  finalHumanClickRequired: true;
  controlsEnabled: false;
  gateLocked: true;
};

export type AvanzaOrderTicketActionContract =
  AvanzaOrderTicketActionContractSafetyFlags & {
    contractId: string;
    createdAt: string;
    mode: AvanzaOrderTicketActionExecutionMode;
    status: AvanzaOrderTicketActionContractStatus;
    label: string;
    reason: string;
    side: AvanzaOrderTicketSide;
    ticker: string;
    quantity?: number;
    orderType: AvanzaOrderTicketOrderType;
    limitPrice?: number;
    actions: AvanzaOrderTicketAction[];
    nextExpectedOrderState: string;
    warnings: string[];
    blockedReasons: string[];
    safetyFlags: AvanzaOrderTicketActionContractSafetyFlags;
  };

export type AvanzaOrderTicketActionContractInput = {
  mode?: AvanzaOrderTicketActionExecutionMode;
  contractEnabled?: boolean;
  orderTicketFieldPlan?: unknown;
  executionSettingsProfile?: unknown;
  realWorldOrderSignals?: unknown;
  now?: string;
  contractId?: string;
};

const defaultCreatedAt = "2026-07-06T12:00:00.000Z";
const unsafeTextPattern =
  /account\s*id|accountid|bankid|cookie|credential|password\s*[:=]|personnummer|\d{6}[-+]?\d{4}|\d{8}[-+]?\d{4}|secret|session|storage|token/i;

function safeText(value: unknown) {
  if (typeof value !== "string") return undefined;

  const text = value.trim();

  if (!text) return undefined;
  if (unsafeTextPattern.test(text)) return undefined;

  return text;
}

function safeStringArray(values: unknown) {
  return Array.isArray(values)
    ? values.flatMap((value) => {
        const text = safeText(value);

        return text ? [text] : [];
      })
    : [];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFieldPlan(value: unknown): value is AvanzaOrderTicketFieldPlan {
  if (!isPlainObject(value)) return false;

  return (
    typeof value.fieldPlanId === "string" &&
    typeof value.status === "string" &&
    typeof value.side === "string" &&
    typeof value.ticker === "string" &&
    typeof value.orderType === "string" &&
    Array.isArray(value.fields) &&
    Array.isArray(value.warnings) &&
    Array.isArray(value.blockedReasons)
  );
}

function findSafeFieldValue(
  fieldPlan: AvanzaOrderTicketFieldPlan,
  key: string,
) {
  const field = fieldPlan.fields.find((candidate) => candidate.key === key);

  if (!field || !field.valuePresent) return undefined;

  return safeText(field.safeDisplayValue);
}

function buildSafetyFlags(
  contractEnabled: boolean,
  canCreateActionPlan: boolean,
): AvanzaOrderTicketActionContractSafetyFlags {
  return {
    contractEnabled,
    canCreateActionPlan,
    canExecuteActions: false,
    canSelectBuySide: false,
    canSelectSellSide: false,
    canSelectAccount: false,
    canFillTicker: false,
    canConfirmInstrument: false,
    canFillQuantity: false,
    canSelectLimitOrder: false,
    canFillLimitPrice: false,
    canSelectTimeInForce: false,
    canReviewOrder: false,
    canClickFinalBuy: false,
    canClickFinalSell: false,
    canSubmitOrder: false,
    canUseMarketOrder: false,
    canReadCookies: false,
    canExportSession: false,
    canAutomateBankId: false,
    canBypassBankId: false,
    userMustConfirm: true,
    finalHumanClickRequired: true,
    controlsEnabled: false,
    gateLocked: true,
  };
}

function action(
  actionId: string,
  type: AvanzaOrderTicketActionType,
  label: string,
  reason: string,
  expectedResult: string,
  options: {
    targetSignalText?: string;
    valueSource?: AvanzaOrderTicketActionValueSource;
    safeDisplayValue?: string | number;
    requiresHumanAction?: boolean;
    forbidden?: boolean;
  } = {},
): AvanzaOrderTicketAction {
  return {
    actionId,
    type,
    label,
    reason,
    targetSignalText: options.targetSignalText,
    valueSource: options.valueSource ?? "none",
    safeDisplayValue:
      options.safeDisplayValue === undefined
        ? undefined
        : String(options.safeDisplayValue),
    containsCredentialMaterial: false,
    executableInThisTask: false,
    dryRunOnly: true,
    requiresHumanAction: options.requiresHumanAction ?? false,
    forbidden: options.forbidden ?? false,
    expectedResult,
  };
}

function disabledAction(reason: string) {
  return [
    action(
      "no_op_disabled",
      "no_op",
      "No order ticket action",
      reason,
      "No action is planned.",
      { forbidden: true },
    ),
  ];
}

function statusLabel(status: AvanzaOrderTicketActionContractStatus) {
  switch (status) {
    case "disabled":
      return "Order ticket action contract disabled";
    case "no_action_needed":
      return "No order ticket action needed";
    case "action_plan_ready":
      return "Order ticket action plan ready";
    case "waiting_for_field_plan":
      return "Order ticket action contract waiting for field plan";
    case "blocked":
      return "Order ticket action contract blocked";
    case "error":
      return "Order ticket action contract error";
    case "unknown":
      return "Order ticket action contract unknown";
  }
}

function baseContract(
  input: AvanzaOrderTicketActionContractInput,
  status: AvanzaOrderTicketActionContractStatus,
  reason: string,
  options: {
    fieldPlan?: AvanzaOrderTicketFieldPlan;
    actions?: AvanzaOrderTicketAction[];
    warnings?: string[];
    blockedReasons?: string[];
    canCreateActionPlan?: boolean;
    nextExpectedOrderState?: string;
  } = {},
): AvanzaOrderTicketActionContract {
  const contractEnabled = input.contractEnabled === true;
  const safetyFlags = buildSafetyFlags(
    contractEnabled,
    options.canCreateActionPlan === true,
  );
  const fieldPlan = options.fieldPlan;

  return {
    ...safetyFlags,
    contractId: safeText(input.contractId) ?? "avanza-order-ticket-action-contract",
    createdAt: safeText(input.now) ?? defaultCreatedAt,
    mode: input.mode ?? "disabled",
    status,
    label: statusLabel(status),
    reason,
    side: fieldPlan?.side ?? "unknown",
    ticker: fieldPlan?.ticker ?? "missing",
    quantity: fieldPlan?.quantity,
    orderType: fieldPlan?.orderType ?? "unknown",
    limitPrice: fieldPlan?.limitPrice,
    actions: options.actions ?? disabledAction(reason),
    nextExpectedOrderState:
      options.nextExpectedOrderState ?? "No order ticket action state change.",
    warnings: options.warnings ?? safeStringArray(fieldPlan?.warnings),
    blockedReasons: options.blockedReasons ?? safeStringArray(fieldPlan?.blockedReasons),
    safetyFlags,
  };
}

function buildReadyActions(fieldPlan: AvanzaOrderTicketFieldPlan) {
  const accountType = findSafeFieldValue(fieldPlan, "accountType");
  const side = fieldPlan.side;
  const finalStopType =
    side === "buy" ? "stop_before_final_buy" : "stop_before_final_sell";
  const finalStopLabel =
    side === "buy" ? "Stop before final KÖP" : "Stop before final SÄLJ";
  const finalSignal = side === "buy" ? "KÖP" : "SÄLJ";
  const actions: AvanzaOrderTicketAction[] = [
    action(
      side === "buy" ? "select_buy_side" : "select_sell_side",
      side === "buy" ? "select_buy_side" : "select_sell_side",
      side === "buy" ? "Select BUY side" : "Select SELL side",
      "The field plan side determines the order ticket side.",
      side === "buy"
        ? "The future order ticket would show BUY selected."
        : "The future order ticket would show SELL selected.",
      {
        targetSignalText: side === "buy" ? "Köp" : "Sälj",
        valueSource: "field_plan",
        safeDisplayValue: side,
      },
    ),
  ];

  if (accountType) {
    actions.push(
      action(
        "select_account",
        "select_account",
        "Select account type",
        "A safe account label is present in the field plan.",
        "The future order ticket would use the selected safe account label.",
        {
          targetSignalText: "Konto",
          valueSource: "field_plan",
          safeDisplayValue: accountType,
        },
      ),
    );
  }

  actions.push(
    action(
      "fill_ticker",
      "fill_ticker",
      "Fill ticker",
      "The ticker is present in the field plan.",
      "The future order ticket would search the instrument.",
      {
        targetSignalText: "Sök instrument",
        valueSource: "field_plan",
        safeDisplayValue: fieldPlan.ticker,
      },
    ),
    action(
      "confirm_instrument",
      "confirm_instrument",
      "Confirm instrument",
      "The instrument selection must be reviewed before order preparation.",
      "The future order ticket would show the selected instrument for review.",
      {
        targetSignalText: "Instrument",
        valueSource: "user_review",
        safeDisplayValue: fieldPlan.ticker,
        requiresHumanAction: true,
      },
    ),
    action(
      "fill_quantity",
      "fill_quantity",
      "Fill quantity",
      "The quantity is present in the field plan.",
      "The future order ticket would show the planned quantity.",
      {
        targetSignalText: "Antal",
        valueSource: "field_plan",
        safeDisplayValue: fieldPlan.quantity,
      },
    ),
    action(
      "select_limit_order",
      "select_limit_order",
      "Select limit order",
      "Only limit orders are supported by this contract.",
      "The future order ticket would use limit order mode.",
      {
        targetSignalText: "Limit",
        valueSource: "static_safe_signal",
        safeDisplayValue: "limit",
      },
    ),
    action(
      "fill_limit_price",
      "fill_limit_price",
      "Fill limit price",
      "The limit price is present in the field plan.",
      "The future order ticket would show the planned limit price.",
      {
        targetSignalText: "Pris",
        valueSource: "field_plan",
        safeDisplayValue: fieldPlan.limitPrice,
      },
    ),
    action(
      "select_time_in_force_day",
      "select_time_in_force_day",
      "Select day time in force",
      "The current contract only models day validity.",
      "The future order ticket would show day validity.",
      {
        targetSignalText: "Giltighet",
        valueSource: "field_plan",
        safeDisplayValue: fieldPlan.timeInForce,
      },
    ),
    action(
      "review_order",
      "review_order",
      "Review prepared order fields",
      "The user must review the prepared fields before any final decision.",
      "The future order ticket would stop for manual review.",
      {
        targetSignalText: "Kontrollera order",
        valueSource: "user_review",
        requiresHumanAction: true,
      },
    ),
    action(
      finalStopType,
      finalStopType,
      finalStopLabel,
      "The final order confirmation is human-only.",
      "The agent stops before final order confirmation.",
      {
        targetSignalText: finalSignal,
        valueSource: "user_review",
        requiresHumanAction: true,
        forbidden: true,
      },
    ),
  );

  return actions;
}

export function buildAvanzaOrderTicketActionContract(
  input: AvanzaOrderTicketActionContractInput = {},
): AvanzaOrderTicketActionContract {
  if (input.contractEnabled !== true || input.mode === "disabled") {
    return baseContract(
      input,
      "disabled",
      "Order ticket action contract is disabled.",
      { blockedReasons: ["Contract disabled."] },
    );
  }

  if (input.orderTicketFieldPlan === undefined) {
    return baseContract(
      input,
      "waiting_for_field_plan",
      "Order ticket action contract requires a field plan before actions can be modeled.",
      { blockedReasons: ["Missing order ticket field plan."] },
    );
  }

  if (!isFieldPlan(input.orderTicketFieldPlan)) {
    return baseContract(
      input,
      "blocked",
      "Order ticket action contract received an invalid field plan.",
      { blockedReasons: ["Invalid order ticket field plan."] },
    );
  }

  const fieldPlan = input.orderTicketFieldPlan;

  if (fieldPlan.status === "error") {
    return baseContract(input, "error", "Field plan returned an error.", {
      fieldPlan,
      blockedReasons: ["Field plan error."],
    });
  }

  if (fieldPlan.status === "unknown") {
    return baseContract(input, "unknown", "Field plan state is unknown.", {
      fieldPlan,
      blockedReasons: ["Field plan unknown."],
    });
  }

  if (fieldPlan.orderType === "market_forbidden") {
    return baseContract(
      input,
      "blocked",
      "Market order plans are blocked; limit orders only.",
      {
        fieldPlan,
        blockedReasons: [
          ...fieldPlan.blockedReasons,
          "Market order blocked by action contract.",
        ],
      },
    );
  }

  if (fieldPlan.status === "disabled") {
    return baseContract(input, "disabled", "Field plan is disabled.", {
      fieldPlan,
      blockedReasons: ["Field plan disabled."],
    });
  }

  if (fieldPlan.status === "blocked") {
    return baseContract(input, "blocked", "Field plan is blocked.", {
      fieldPlan,
    });
  }

  if (
    fieldPlan.status !== "field_mapping_ready" ||
    fieldPlan.orderType !== "limit" ||
    (fieldPlan.side !== "buy" && fieldPlan.side !== "sell") ||
    fieldPlan.quantity === undefined ||
    fieldPlan.limitPrice === undefined ||
    fieldPlan.ticker === "missing"
  ) {
    return baseContract(
      input,
      "waiting_for_field_plan",
      "A complete BUY or SELL limit field plan is required before actions can be modeled.",
      {
        fieldPlan,
        blockedReasons: ["Waiting for complete limit field plan."],
      },
    );
  }

  const actions = buildReadyActions(fieldPlan);

  return baseContract(
    input,
    "action_plan_ready",
    "BUY/SELL limit order preparation actions are modeled but not executable.",
    {
      fieldPlan,
      actions,
      canCreateActionPlan: true,
      nextExpectedOrderState:
        fieldPlan.side === "buy"
          ? "Future local-dev preparation would stop before final KÖP."
          : "Future local-dev preparation would stop before final SÄLJ.",
    },
  );
}
