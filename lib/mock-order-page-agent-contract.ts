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
  | "account"
  | "amountSek"
  | "priceCurrency"
  | "instrumentMarket"
  | "instrumentCurrency"
  | "instrumentType"
  | "orderMode"
  | "reviewButtonLabel"
  | "confirmButtonLabel"
  | "cancelButtonLabel"
  | "validUntil"
  | "estimatedFees"
  | "estimatedCourtage"
  | "estimatedFxFee"
  | "estimatedTotalAmount"
  | "preliminaryFxRate"
  | "requireManualFinalConfirmation"
  | "allowAutomaticFinalSubmit"
  | "requestId"
  | "intentId";

export type MockOrderPageControlKey =
  | "reviewButton"
  | "resetButton"
  | "submitDisabled"
  | "validationErrors"
  | "validationError"
  | "validationErrorRequired"
  | "validationErrorMinimumAmount"
  | "validationErrorUnsupportedOrderMode";

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

export type MockOrderPageValidationErrorCode =
  | "required"
  | "invalid_number"
  | "invalid_price"
  | "minimum_amount"
  | "unsupported_order_mode";

export type MockOrderPageValidationError = {
  code: MockOrderPageValidationErrorCode;
  fieldKey?: MockOrderPageFieldKey;
  message: string;
};

export type MockOrderPageFormValues = Partial<
  Record<MockOrderPageFieldKey, string>
>;

export type MockOrderPageFormValidationResult = {
  ok: boolean;
  errors: MockOrderPageValidationError[];
  warnings: string[];
};

export const MOCK_ORDER_MIN_AMOUNT_SEK = 100;

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
  account: {
    fieldKey: "account",
    testId: "mock-order-account",
    dataAgentField: "mock-order-account",
    description: "Mock account selector/text input.",
  },
  amountSek: {
    fieldKey: "amountSek",
    testId: "mock-order-amount-sek",
    dataAgentField: "mock-order-amount-sek",
    description: "Mock amount in SEK text input.",
  },
  priceCurrency: {
    fieldKey: "priceCurrency",
    testId: "mock-order-price-currency",
    dataAgentField: "mock-order-price-currency",
    description: "Displayed price currency.",
  },
  instrumentMarket: {
    fieldKey: "instrumentMarket",
    testId: "mock-order-instrument-market",
    dataAgentField: "mock-order-instrument-market",
    description: "Mock instrument market.",
  },
  instrumentCurrency: {
    fieldKey: "instrumentCurrency",
    testId: "mock-order-instrument-currency",
    dataAgentField: "mock-order-instrument-currency",
    description: "Mock instrument currency.",
  },
  instrumentType: {
    fieldKey: "instrumentType",
    testId: "mock-order-instrument-type",
    dataAgentField: "mock-order-instrument-type",
    description: "Mock instrument type.",
  },
  orderMode: {
    fieldKey: "orderMode",
    testId: "mock-order-mode-advanced",
    dataAgentField: "mock-order-mode-advanced",
    description: "Mock Avanza-style order mode. Advanced only.",
  },
  reviewButtonLabel: {
    fieldKey: "reviewButtonLabel",
    testId: "mock-order-review-label",
    dataAgentField: "mock-order-review-label",
    description: "Expected review button label.",
  },
  confirmButtonLabel: {
    fieldKey: "confirmButtonLabel",
    testId: "mock-order-confirm-label",
    dataAgentField: "mock-order-confirm-label",
    description: "Expected final confirmation button label. Readback only.",
  },
  cancelButtonLabel: {
    fieldKey: "cancelButtonLabel",
    testId: "mock-order-cancel-label",
    dataAgentField: "mock-order-cancel-label",
    description: "Expected cancel button label.",
  },
  validUntil: {
    fieldKey: "validUntil",
    testId: "mock-order-valid-until",
    dataAgentField: "mock-order-valid-until",
    description: "Mock order valid-until date.",
  },
  estimatedFees: {
    fieldKey: "estimatedFees",
    testId: "mock-order-estimated-fees",
    dataAgentField: "mock-order-estimated-fees",
    description: "Mock estimated total fees.",
  },
  estimatedCourtage: {
    fieldKey: "estimatedCourtage",
    testId: "mock-order-estimated-courtage",
    dataAgentField: "mock-order-estimated-courtage",
    description: "Mock estimated courtage.",
  },
  estimatedFxFee: {
    fieldKey: "estimatedFxFee",
    testId: "mock-order-estimated-fx-fee",
    dataAgentField: "mock-order-estimated-fx-fee",
    description: "Mock estimated FX fee.",
  },
  estimatedTotalAmount: {
    fieldKey: "estimatedTotalAmount",
    testId: "mock-order-estimated-total-amount",
    dataAgentField: "mock-order-estimated-total-amount",
    description: "Mock estimated total amount.",
  },
  preliminaryFxRate: {
    fieldKey: "preliminaryFxRate",
    testId: "mock-order-preliminary-fx-rate",
    dataAgentField: "mock-order-preliminary-fx-rate",
    description: "Mock preliminary FX rate.",
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
  validationErrors: {
    fieldKey: "validationErrors",
    testId: "mock-order-validation-errors",
    dataAgentField: "mock-order-validation-errors",
    description: "Mock order validation error container.",
  },
  validationError: {
    fieldKey: "validationError",
    testId: "mock-order-validation-error",
    dataAgentField: "mock-order-validation-error",
    description: "Mock order validation error item.",
  },
  validationErrorRequired: {
    fieldKey: "validationErrorRequired",
    testId: "mock-order-validation-error-required",
    dataAgentField: "mock-order-validation-error-required",
    description: "Required-field validation errors.",
  },
  validationErrorMinimumAmount: {
    fieldKey: "validationErrorMinimumAmount",
    testId: "mock-order-validation-error-minimum-amount",
    dataAgentField: "mock-order-validation-error-minimum-amount",
    description: "Minimum-amount validation errors.",
  },
  validationErrorUnsupportedOrderMode: {
    fieldKey: "validationErrorUnsupportedOrderMode",
    testId: "mock-order-validation-error-unsupported-order-mode",
    dataAgentField: "mock-order-validation-error-unsupported-order-mode",
    description: "Unsupported order-mode validation errors.",
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
  "account",
  "amountSek",
  "priceCurrency",
  "instrumentMarket",
  "instrumentCurrency",
  "instrumentType",
  "orderMode",
  "reviewButtonLabel",
  "confirmButtonLabel",
  "cancelButtonLabel",
  "validUntil",
  "estimatedFees",
  "estimatedCourtage",
  "estimatedFxFee",
  "estimatedTotalAmount",
  "preliminaryFxRate",
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

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function safeCurrency(value: unknown, fallback = "USD") {
  const text = textValue(value).toUpperCase();

  return /^[A-Z]{3}$/.test(text) ? text : fallback;
}

function multiplyTextNumbers(first: string, second: string) {
  const firstNumber = Number(first);
  const secondNumber = Number(second);

  return Number.isFinite(firstNumber) && Number.isFinite(secondNumber)
    ? String(firstNumber * secondNumber)
    : "";
}

function numberFromText(value: unknown) {
  const text = textValue(value);

  if (!text) {
    return null;
  }

  const number = Number(text.replace(/,/g, "."));

  return Number.isFinite(number) ? number : Number.NaN;
}

function addRequiredError(
  errors: MockOrderPageValidationError[],
  values: MockOrderPageFormValues,
  fieldKey: MockOrderPageFieldKey,
  label: string,
) {
  if (!textValue(values[fieldKey])) {
    errors.push({
      code: "required",
      fieldKey,
      message: `${label} is required for this mock Advanced order.`,
    });
  }
}

export function validateMockOrderPageFormValues(
  values: MockOrderPageFormValues | null | undefined,
): MockOrderPageFormValidationResult {
  const errors: MockOrderPageValidationError[] = [];
  const warnings: string[] = [];

  if (!values || typeof values !== "object") {
    return {
      ok: false,
      errors: [
        {
          code: "required",
          message: "Mock order form values are missing.",
        },
      ],
      warnings,
    };
  }

  for (const [fieldKey, label] of [
    ["account", "Account"],
    ["ticker", "Ticker"],
    ["action", "Action"],
    ["quantity", "Quantity"],
    ["orderType", "Order type"],
    ["orderMode", "Order mode"],
    ["priceCurrency", "Price currency"],
    ["validUntil", "Valid until"],
    ["reviewButtonLabel", "Review button label"],
    ["confirmButtonLabel", "Confirm button label"],
    ["cancelButtonLabel", "Cancel button label"],
  ] as const) {
    addRequiredError(errors, values, fieldKey, label);
  }

  const action = textValue(values.action);

  if (action && action !== "buy" && action !== "sell") {
    errors.push({
      code: "required",
      fieldKey: "action",
      message: "Action must be buy or sell for this mock order.",
    });
  }

  const orderMode = textValue(values.orderMode);

  if (orderMode && orderMode !== "advanced") {
    errors.push({
      code: "unsupported_order_mode",
      fieldKey: "orderMode",
      message: "Only Advanced mock orders are supported in this sandbox.",
    });
  }

  const quantity = numberFromText(values.quantity);

  if (quantity !== null && (!Number.isFinite(quantity) || quantity <= 0)) {
    errors.push({
      code: "invalid_number",
      fieldKey: "quantity",
      message: "Quantity must be greater than 0.",
    });
  }

  const limitPrice = numberFromText(values.limitPrice);
  const intendedPrice = numberFromText(values.intendedPrice);
  const orderType = textValue(values.orderType);

  if (orderType === "limit") {
    if (
      limitPrice === null ||
      !Number.isFinite(limitPrice) ||
      limitPrice <= 0
    ) {
      errors.push({
        code: "invalid_price",
        fieldKey: "limitPrice",
        message: "Limit price must be greater than 0 for limit mock orders.",
      });
    }
  } else if (
    limitPrice !== null &&
    (!Number.isFinite(limitPrice) || limitPrice <= 0)
  ) {
    errors.push({
      code: "invalid_price",
      fieldKey: "limitPrice",
      message: "Limit price must be greater than 0 when provided.",
    });
  }

  if (
    intendedPrice !== null &&
    (!Number.isFinite(intendedPrice) || intendedPrice <= 0)
  ) {
    errors.push({
      code: "invalid_price",
      fieldKey: "intendedPrice",
      message: "Intended price must be greater than 0 when provided.",
    });
  }

  const amountSek = numberFromText(values.amountSek);

  if (amountSek !== null && (!Number.isFinite(amountSek) || amountSek <= 0)) {
    errors.push({
      code: "invalid_number",
      fieldKey: "amountSek",
      message: "Amount SEK must be greater than 0 when provided.",
    });
  }

  const estimatedTotalAmount = numberFromText(values.estimatedTotalAmount);

  if (
    estimatedTotalAmount !== null &&
    (!Number.isFinite(estimatedTotalAmount) || estimatedTotalAmount <= 0)
  ) {
    errors.push({
      code: "invalid_number",
      fieldKey: "estimatedTotalAmount",
      message: "Estimated total amount must be greater than 0 when provided.",
    });
  }

  const minimumAmountCandidate =
    amountSek !== null ? amountSek : estimatedTotalAmount;

  if (
    minimumAmountCandidate !== null &&
    Number.isFinite(minimumAmountCandidate) &&
    minimumAmountCandidate < MOCK_ORDER_MIN_AMOUNT_SEK
  ) {
    errors.push({
      code: "minimum_amount",
      fieldKey: amountSek !== null ? "amountSek" : "estimatedTotalAmount",
      message: `Lägsta belopp för köp är ${MOCK_ORDER_MIN_AMOUNT_SEK} SEK i denna mock-sandbox.`,
    });
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
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
  const priceCurrency = safeCurrency(
    valueFromRecord(intentRecord, [
      "priceCurrency",
      "price_currency",
      "instrumentCurrency",
      "instrument_currency",
      "currency",
    ]) ??
      valueFromRecord(packageRecord, [
        "priceCurrency",
        "price_currency",
        "currency",
      ]),
  );
  const instrumentCurrency = safeCurrency(
    valueFromRecord(intentRecord, ["instrumentCurrency", "instrument_currency"]) ??
      valueFromRecord(packageRecord, ["instrumentCurrency", "instrument_currency"]) ??
      priceCurrency,
    priceCurrency,
  );
  const quantity = textValue(
    valueFromRecord(intentRecord, ["quantity"]) ?? tradingPackage?.quantity,
  );
  const intendedPrice = textValue(
    valueFromRecord(intentRecord, ["intendedPrice", "intended_price"]) ??
      valueFromRecord(packageRecord, ["intendedPrice", "intended_price"]),
  );
  const limitPrice = textValue(
    valueFromRecord(intentRecord, ["limitPrice", "limit_price"]) ??
      tradingPackage?.limit_price,
  );
  const selectedPrice = limitPrice || intendedPrice;
  const amountSek =
    textValue(valueFromRecord(intentRecord, ["amountSek", "amount_sek"])) ||
    textValue(valueFromRecord(packageRecord, ["amountSek", "amount_sek"]));
  const estimatedTotalAmount =
    textValue(
      valueFromRecord(intentRecord, [
        "estimatedTotalAmount",
        "estimated_total_amount",
      ]),
    ) ||
    textValue(
      valueFromRecord(packageRecord, [
        "estimatedTotalAmount",
        "estimated_total_amount",
      ]),
    ) ||
    amountSek;
  const reviewButtonLabel =
    action === "sell" ? "Granska sälj" : "Granska köp";
  const confirmButtonLabel =
    action === "sell" ? "Bekräfta sälj" : "Bekräfta köp";

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
        quantity,
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
        limitPrice,
      ),
      fillValue(
        "intendedPrice",
        intendedPrice,
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
        "account",
        textValue(valueFromRecord(intentRecord, ["account", "accountName"])) ||
          "Mock account",
      ),
      fillValue("amountSek", amountSek),
      fillValue("priceCurrency", priceCurrency),
      fillValue(
        "instrumentMarket",
        textValue(
          valueFromRecord(intentRecord, ["instrumentMarket", "instrument_market"]) ??
            valueFromRecord(packageRecord, [
              "instrumentMarket",
              "instrument_market",
            ]),
        ) || "Mock market",
      ),
      fillValue("instrumentCurrency", instrumentCurrency),
      fillValue(
        "instrumentType",
        textValue(
          valueFromRecord(intentRecord, ["instrumentType", "instrument_type"]) ??
            valueFromRecord(packageRecord, ["instrumentType", "instrument_type"]),
        ) || "stock",
      ),
      fillValue("orderMode", "advanced"),
      fillValue("reviewButtonLabel", reviewButtonLabel),
      fillValue("confirmButtonLabel", confirmButtonLabel),
      fillValue("cancelButtonLabel", "Avbryt"),
      fillValue(
        "validUntil",
        textValue(valueFromRecord(intentRecord, ["validUntil", "valid_until"])) ||
          todayIsoDate(),
      ),
      fillValue(
        "estimatedFees",
        textValue(
          valueFromRecord(intentRecord, ["estimatedFees", "estimated_fees"]),
        ),
      ),
      fillValue(
        "estimatedCourtage",
        textValue(
          valueFromRecord(intentRecord, [
            "estimatedCourtage",
            "estimated_courtage",
          ]),
        ),
      ),
      fillValue(
        "estimatedFxFee",
        textValue(
          valueFromRecord(intentRecord, ["estimatedFxFee", "estimated_fx_fee"]),
        ),
      ),
      fillValue(
        "estimatedTotalAmount",
        estimatedTotalAmount ||
          (quantity && selectedPrice
            ? multiplyTextNumbers(quantity, selectedPrice)
            : ""),
      ),
      fillValue(
        "preliminaryFxRate",
        textValue(
          valueFromRecord(intentRecord, [
            "preliminaryFxRate",
            "preliminary_fx_rate",
          ]),
        ),
      ),
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

  const mode = readPlanValue(plan, "mode");
  const requestId = readPlanValue(plan, "requestId");
  const intentId = readPlanValue(plan, "intentId");
  const formValidation = validateMockOrderPageFormValues(
    Object.fromEntries(
      plan.values.map((value) => [value.fieldKey, value.value]),
    ) as MockOrderPageFormValues,
  );

  errors.push(...formValidation.errors.map((error) => error.message));
  warnings.push(...formValidation.warnings);

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
