import type { AvanzaAgentRequest } from "@/lib/avanza-agent-adapter";
import type { ExecutionAction, ExecutionMode } from "@/lib/execution";

export type MockOrderPageFieldKey =
  | "ticker"
  | "action"
  | "quantity"
  | "orderType"
  | "limitPrice"
  | "intendedPrice"
  | "targetPrice"
  | "stopLossPrice"
  | "mode"
  | "requireManualFinalConfirmation"
  | "allowAutomaticFinalSubmit"
  | "requestId"
  | "intentId";

export type MockOrderPageControlKey =
  | "reviewButton"
  | "resetButton"
  | "submitDisabled";

export type MockOrderPageSelectorKey =
  | MockOrderPageFieldKey
  | MockOrderPageControlKey;

export type MockOrderPageFieldSelector = {
  fieldKey: MockOrderPageSelectorKey;
  testId: string;
  dataAgentField: string;
  description?: string;
};

export type MockOrderPageFillValue = {
  fieldKey: MockOrderPageFieldKey;
  selector: MockOrderPageFieldSelector;
  value: string;
};

export type MockOrderPageFillPlan = {
  version: "mock_order_page_fill_plan_v1";
  targetPath: "/mock-broker/order";
  source: "avanza_agent_request";
  requestId: string;
  intentId: string;
  intentIdExpected: boolean;
  values: MockOrderPageFillValue[];
};

export type MockOrderPageFillPlanValidationResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

export const MOCK_ORDER_PAGE_AGENT_SELECTORS = {
  ticker: {
    fieldKey: "ticker",
    testId: "mock-order-ticker",
    dataAgentField: "mock-order-ticker",
    description: "Ticker or symbol text input.",
  },
  action: {
    fieldKey: "action",
    testId: "mock-order-action",
    dataAgentField: "mock-order-action",
    description: "Buy/sell action select.",
  },
  quantity: {
    fieldKey: "quantity",
    testId: "mock-order-quantity",
    dataAgentField: "mock-order-quantity",
    description: "Share quantity text input.",
  },
  orderType: {
    fieldKey: "orderType",
    testId: "mock-order-type",
    dataAgentField: "mock-order-type",
    description: "Mock order type select.",
  },
  limitPrice: {
    fieldKey: "limitPrice",
    testId: "mock-order-limit-price",
    dataAgentField: "mock-order-limit-price",
    description: "Limit price text input.",
  },
  intendedPrice: {
    fieldKey: "intendedPrice",
    testId: "mock-order-intended-price",
    dataAgentField: "mock-order-intended-price",
    description: "Intended or current price text input.",
  },
  targetPrice: {
    fieldKey: "targetPrice",
    testId: "mock-order-target-price",
    dataAgentField: "mock-order-target-price",
    description: "Target price text input.",
  },
  stopLossPrice: {
    fieldKey: "stopLossPrice",
    testId: "mock-order-stop-loss-price",
    dataAgentField: "mock-order-stop-loss-price",
    description: "Stop-loss price text input.",
  },
  mode: {
    fieldKey: "mode",
    testId: "mock-order-mode",
    dataAgentField: "mock-order-mode",
    description: "Execution mode select.",
  },
  requireManualFinalConfirmation: {
    fieldKey: "requireManualFinalConfirmation",
    testId: "mock-order-require-manual-confirmation",
    dataAgentField: "mock-order-require-manual-confirmation",
    description: "Read-only manual final confirmation requirement.",
  },
  allowAutomaticFinalSubmit: {
    fieldKey: "allowAutomaticFinalSubmit",
    testId: "mock-order-allow-automatic-submit",
    dataAgentField: "mock-order-allow-automatic-submit",
    description: "Read-only automatic final submit allowance.",
  },
  requestId: {
    fieldKey: "requestId",
    testId: "mock-order-request-id",
    dataAgentField: "mock-order-request-id",
    description: "Agent request id text input.",
  },
  intentId: {
    fieldKey: "intentId",
    testId: "mock-order-intent-id",
    dataAgentField: "mock-order-intent-id",
    description: "Execution intent id text input.",
  },
  reviewButton: {
    fieldKey: "reviewButton",
    testId: "mock-order-review-button",
    dataAgentField: "mock-order-review-button",
    description: "Local review button. Does not submit or execute orders.",
  },
  resetButton: {
    fieldKey: "resetButton",
    testId: "mock-order-reset-button",
    dataAgentField: "mock-order-reset-button",
    description: "Local reset button.",
  },
  submitDisabled: {
    fieldKey: "submitDisabled",
    testId: "mock-order-submit-disabled",
    dataAgentField: "mock-order-submit-disabled",
    description: "Disabled final submit placeholder.",
  },
} as const satisfies Record<
  MockOrderPageSelectorKey,
  MockOrderPageFieldSelector
>;

const mockOrderPageFieldKeys: MockOrderPageFieldKey[] = [
  "ticker",
  "action",
  "quantity",
  "orderType",
  "limitPrice",
  "intendedPrice",
  "targetPrice",
  "stopLossPrice",
  "mode",
  "requireManualFinalConfirmation",
  "allowAutomaticFinalSubmit",
  "requestId",
  "intentId",
];

function textValue(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return typeof value === "string" ? value.trim() : "";
}

function booleanText(value: boolean | null | undefined): string {
  return value === true ? "true" : "false";
}

function normalizeMockOrderType(value: unknown): "market" | "limit" | "" {
  if (value === "limit" || value === "limit_reference") {
    return "limit";
  }

  if (value === "market" || value === "market_reference") {
    return "market";
  }

  return "";
}

function valueFromRecord(
  record: Record<string, unknown> | null,
  keys: readonly string[],
): unknown {
  const matchingKey = keys.find((key) => record?.[key] !== undefined);

  return matchingKey ? record?.[matchingKey] : undefined;
}

function fillValue(
  fieldKey: MockOrderPageFieldKey,
  value: string,
): MockOrderPageFillValue {
  return {
    fieldKey,
    selector: MOCK_ORDER_PAGE_AGENT_SELECTORS[fieldKey],
    value,
  };
}

function readPlanValue(
  plan: MockOrderPageFillPlan,
  fieldKey: MockOrderPageFieldKey,
): string {
  return (
    plan.values.find((value) => value.fieldKey === fieldKey)?.value.trim() ?? ""
  );
}

export function buildMockOrderPageFillPlanFromAgentRequest(
  request: AvanzaAgentRequest,
): MockOrderPageFillPlan {
  const intent = request.handoff?.intent ?? null;
  const intentRecord = intent as Record<string, unknown> | null;
  const tradingPackage = intent?.trading_package ?? null;
  const packageRecord = tradingPackage as Record<string, unknown> | null;
  const requestId = textValue(request.requestId);
  const intentId = textValue(
    valueFromRecord(intentRecord, ["intentId", "intent_id"]),
  );
  const action = textValue(request.action ?? request.handoff?.action) as
    | ExecutionAction
    | "";
  const mode = textValue(request.mode ?? request.handoff?.mode) as
    | ExecutionMode
    | "";

  return {
    version: "mock_order_page_fill_plan_v1",
    targetPath: "/mock-broker/order",
    source: "avanza_agent_request",
    requestId,
    intentId,
    intentIdExpected: Boolean(intent),
    values: [
      fillValue(
        "ticker",
        textValue(
          valueFromRecord(intentRecord, ["ticker", "symbol"]) ??
            tradingPackage?.ticker,
        ),
      ),
      fillValue("action", action),
      fillValue(
        "quantity",
        textValue(
          valueFromRecord(intentRecord, ["quantity"]) ??
            tradingPackage?.quantity,
        ),
      ),
      fillValue(
        "orderType",
        normalizeMockOrderType(
          valueFromRecord(intentRecord, ["orderType", "order_type"]) ??
            tradingPackage?.order_type,
        ),
      ),
      fillValue(
        "limitPrice",
        textValue(
          valueFromRecord(intentRecord, ["limitPrice", "limit_price"]) ??
            tradingPackage?.limit_price,
        ),
      ),
      fillValue(
        "intendedPrice",
        textValue(
          valueFromRecord(intentRecord, ["intendedPrice", "intended_price"]) ??
            valueFromRecord(packageRecord, ["intendedPrice", "intended_price"]),
        ),
      ),
      fillValue(
        "targetPrice",
        textValue(
          valueFromRecord(intentRecord, ["targetPrice", "target_price"]) ??
            tradingPackage?.target_price,
        ),
      ),
      fillValue(
        "stopLossPrice",
        textValue(
          valueFromRecord(intentRecord, ["stopLossPrice", "stop_loss_price"]) ??
            tradingPackage?.stop_loss,
        ),
      ),
      fillValue("mode", mode),
      fillValue(
        "requireManualFinalConfirmation",
        booleanText(request.requireManualFinalConfirmation),
      ),
      fillValue(
        "allowAutomaticFinalSubmit",
        booleanText(request.allowAutomaticFinalSubmit),
      ),
      fillValue("requestId", requestId),
      fillValue("intentId", intentId),
    ],
  };
}

export function validateMockOrderPageFillPlan(
  plan: MockOrderPageFillPlan | null | undefined,
): MockOrderPageFillPlanValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!plan) {
    return {
      ok: false,
      errors: ["Mock order page fill plan is missing."],
      warnings,
    };
  }

  for (const value of plan.values) {
    if (!MOCK_ORDER_PAGE_AGENT_SELECTORS[value.fieldKey]) {
      errors.push(`Selector is missing for ${value.fieldKey}.`);
    }
  }

  const ticker = readPlanValue(plan, "ticker");
  const action = readPlanValue(plan, "action");
  const quantity = Number(readPlanValue(plan, "quantity"));
  const orderType = readPlanValue(plan, "orderType");
  const mode = readPlanValue(plan, "mode");
  const requestId = readPlanValue(plan, "requestId");
  const intentId = readPlanValue(plan, "intentId");

  if (!ticker) {
    errors.push("Ticker is missing.");
  }

  if (action !== "buy" && action !== "sell") {
    errors.push("Action must be buy or sell.");
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    errors.push("Quantity must be greater than 0.");
  }

  if (!orderType) {
    errors.push("Order type is missing.");
  }

  if (mode !== "semi_automatic" && mode !== "automatic") {
    errors.push("Mode must be semi_automatic or automatic.");
  }

  if (!requestId) {
    errors.push("Request id is missing.");
  }

  if (plan.intentIdExpected && !intentId) {
    errors.push("Intent id is missing.");
  }

  for (const fieldKey of mockOrderPageFieldKeys) {
    if (!plan.values.some((value) => value.fieldKey === fieldKey)) {
      warnings.push(`Fill value is missing for ${fieldKey}.`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

export function buildMockOrderPageUrlFromFillPlan(
  plan: MockOrderPageFillPlan,
): string {
  const params = new URLSearchParams();

  for (const fieldKey of mockOrderPageFieldKeys) {
    const value = readPlanValue(plan, fieldKey);

    if (value) {
      params.set(fieldKey, value);
    }
  }

  const queryString = params.toString();

  return queryString
    ? `${plan.targetPath}?${queryString}`
    : plan.targetPath;
}
