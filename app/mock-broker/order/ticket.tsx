"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  DEFAULT_EXECUTION_MODE,
  normalizeExecutionMode,
  type ExecutionAction,
  type ExecutionMode,
} from "@/lib/execution";
import {
  MOCK_ORDER_MIN_AMOUNT_SEK,
  MOCK_ORDER_PAGE_AGENT_SELECTORS,
  validateMockOrderPageFormValues,
  type MockOrderPageFieldKey,
  type MockOrderPageValidationError,
  type MockOrderPageValidationErrorCode,
} from "@/lib/mock-order-page-agent-contract";
import { buildMockOrderConfirmationUrl } from "@/lib/mock-order-confirmation-contract";

type MockBrokerOrderType = "market" | "limit";
type MockBrokerOrderMode = "advanced" | "stop_loss" | "trailing";

export type MockBrokerOrderInitialValues = {
  ticker?: string;
  action?: string;
  quantity?: string;
  orderType?: string;
  limitPrice?: string;
  intendedPrice?: string;
  targetPrice?: string;
  stopLossPrice?: string;
  mode?: string;
  account?: string;
  amountSek?: string;
  priceCurrency?: string;
  instrumentMarket?: string;
  instrumentCurrency?: string;
  instrumentType?: string;
  orderMode?: string;
  reviewButtonLabel?: string;
  confirmButtonLabel?: string;
  cancelButtonLabel?: string;
  validUntil?: string;
  estimatedFees?: string;
  estimatedCourtage?: string;
  estimatedFxFee?: string;
  estimatedTotalAmount?: string;
  preliminaryFxRate?: string;
  requestId?: string;
  intentId?: string;
};

type MockBrokerOrderFormState = {
  ticker: string;
  action: ExecutionAction;
  quantity: string;
  orderType: MockBrokerOrderType;
  limitPrice: string;
  intendedPrice: string;
  targetPrice: string;
  stopLossPrice: string;
  mode: ExecutionMode;
  account: string;
  amountSek: string;
  priceCurrency: string;
  instrumentMarket: string;
  instrumentCurrency: string;
  instrumentType: string;
  orderMode: MockBrokerOrderMode;
  reviewButtonLabel: string;
  confirmButtonLabel: string;
  cancelButtonLabel: string;
  validUntil: string;
  estimatedFees: string;
  estimatedCourtage: string;
  estimatedFxFee: string;
  estimatedTotalAmount: string;
  preliminaryFxRate: string;
  requestId: string;
  intentId: string;
};

function normalizeAction(value: unknown): ExecutionAction {
  return value === "sell" ? "sell" : "buy";
}

function normalizeOrderType(value: unknown): MockBrokerOrderType {
  return value === "limit" ? "limit" : "market";
}

function reviewLabelForAction(action: ExecutionAction) {
  return action === "sell" ? "Granska sälj" : "Granska köp";
}

function confirmLabelForAction(action: ExecutionAction) {
  return action === "sell" ? "Bekräfta sälj" : "Bekräfta köp";
}

function normalizeOrderMode(value: unknown): MockBrokerOrderMode {
  if (value === "stop_loss" || value === "trailing") {
    return value;
  }

  return "advanced";
}

function createInitialFormState(
  initialValues: MockBrokerOrderInitialValues,
): MockBrokerOrderFormState {
  const action = normalizeAction(initialValues.action);

  return {
    account: initialValues.account ?? "Mock account",
    action,
    amountSek: initialValues.amountSek ?? "",
    cancelButtonLabel: initialValues.cancelButtonLabel ?? "Avbryt",
    confirmButtonLabel:
      initialValues.confirmButtonLabel ?? confirmLabelForAction(action),
    estimatedCourtage: initialValues.estimatedCourtage ?? "",
    estimatedFees: initialValues.estimatedFees ?? "",
    estimatedFxFee: initialValues.estimatedFxFee ?? "",
    estimatedTotalAmount: initialValues.estimatedTotalAmount ?? "",
    instrumentCurrency: initialValues.instrumentCurrency ?? "USD",
    instrumentMarket: initialValues.instrumentMarket ?? "Mock market",
    instrumentType: initialValues.instrumentType ?? "stock",
    intendedPrice: initialValues.intendedPrice ?? "",
    intentId: initialValues.intentId ?? "",
    limitPrice: initialValues.limitPrice ?? "",
    mode: normalizeExecutionMode(initialValues.mode, {
      automaticEnabled: true,
    }),
    orderMode: normalizeOrderMode(initialValues.orderMode),
    orderType: normalizeOrderType(initialValues.orderType),
    preliminaryFxRate: initialValues.preliminaryFxRate ?? "",
    priceCurrency: initialValues.priceCurrency ?? "USD",
    quantity: initialValues.quantity ?? "",
    reviewButtonLabel:
      initialValues.reviewButtonLabel ?? reviewLabelForAction(action),
    requestId: initialValues.requestId ?? "",
    stopLossPrice: initialValues.stopLossPrice ?? "",
    targetPrice: initialValues.targetPrice ?? "",
    ticker: initialValues.ticker ?? "",
    validUntil:
      initialValues.validUntil ?? new Date().toISOString().slice(0, 10),
  };
}

function FieldLabel({
  children,
  htmlFor,
}: {
  children: ReactNode;
  htmlFor: string;
}) {
  return (
    <label
      className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
      htmlFor={htmlFor}
    >
      {children}
    </label>
  );
}

function TextInput({
  id,
  onChange,
  placeholder,
  selectorKey,
  value,
}: {
  id: keyof MockBrokerOrderFormState;
  onChange: (value: string) => void;
  placeholder?: string;
  selectorKey: MockOrderPageFieldKey;
  value: string;
}) {
  const selector = MOCK_ORDER_PAGE_AGENT_SELECTORS[selectorKey];

  return (
    <input
      className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
      data-agent-field={selector.dataAgentField}
      data-testid={selector.testId}
      id={id}
      name={id}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      value={value}
    />
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-950/80 px-3 py-2">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm font-medium text-slate-100">
        {value || "Not set"}
      </dd>
    </div>
  );
}

function validationSelectorProps(
  selectorKey:
    | "validationErrors"
    | "validationError"
    | "validationErrorRequired"
    | "validationErrorMinimumAmount"
    | "validationErrorUnsupportedOrderMode",
) {
  const selector = MOCK_ORDER_PAGE_AGENT_SELECTORS[selectorKey];

  return {
    "data-agent-field": selector.dataAgentField,
    "data-testid": selector.testId,
  };
}

function validationGroupSelectorKey(code: MockOrderPageValidationErrorCode) {
  if (code === "minimum_amount") {
    return "validationErrorMinimumAmount" as const;
  }

  if (code === "unsupported_order_mode") {
    return "validationErrorUnsupportedOrderMode" as const;
  }

  return "validationErrorRequired" as const;
}

function ValidationErrorBlock({
  errors,
}: {
  errors: MockOrderPageValidationError[];
}) {
  if (errors.length === 0) {
    return null;
  }

  const groupedErrors = errors.reduce<
    Partial<Record<MockOrderPageValidationErrorCode, MockOrderPageValidationError[]>>
  >((groups, error) => {
    groups[error.code] = [...(groups[error.code] ?? []), error];

    return groups;
  }, {});

  return (
    <section
      className="rounded-lg border border-amber-400/30 bg-amber-950/20 p-4"
      {...validationSelectorProps("validationErrors")}
    >
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-100">
        Mock validation errors
      </p>
      <p className="mt-2 text-sm leading-6 text-amber-50/90">
        Review is blocked in this local sandbox until the mock Advanced order
        fields are valid. No submit or broker action is available.
      </p>
      <div className="mt-3 space-y-3">
        {Object.entries(groupedErrors).map(([code, groupErrors]) => (
          <ul
            className="space-y-2"
            key={code}
            {...validationSelectorProps(
              validationGroupSelectorKey(code as MockOrderPageValidationErrorCode),
            )}
          >
            {groupErrors.map((error) => (
              <li
                className="rounded-md border border-amber-300/20 bg-slate-950/70 px-3 py-2 text-sm text-amber-50"
                data-error-code={error.code}
                key={`${error.code}-${error.fieldKey ?? "form"}-${error.message}`}
                {...validationSelectorProps("validationError")}
              >
                {error.message}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}

export function MockBrokerOrderTicket({
  initialValues,
}: {
  initialValues: MockBrokerOrderInitialValues;
}) {
  const initialFormState = useMemo(
    () => createInitialFormState(initialValues),
    [initialValues],
  );
  const [formState, setFormState] =
    useState<MockBrokerOrderFormState>(initialFormState);
  const [reviewState, setReviewState] =
    useState<MockBrokerOrderFormState | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    MockOrderPageValidationError[]
  >([]);

  const requiresManualFinalConfirmation =
    formState.mode === DEFAULT_EXECUTION_MODE;
  const allowsAutomaticFinalSubmit = formState.mode === "automatic";
  const mockConfirmationHref = reviewState
    ? buildMockOrderConfirmationUrl({
        account: reviewState.account,
        action: reviewState.action,
        amountExcludingFees: reviewState.amountSek,
        cancelButtonLabel: reviewState.cancelButtonLabel,
        confirmButtonLabel: reviewState.confirmButtonLabel,
        courtage: reviewState.estimatedCourtage,
        executedPrice: "",
        fxFee: reviewState.estimatedFxFee,
        instrumentCurrency: reviewState.instrumentCurrency,
        instrumentMarket: reviewState.instrumentMarket,
        instrumentType: reviewState.instrumentType,
        intentId: reviewState.intentId,
        message:
          "Local mock confirmation preview only. No brokerResult created.",
        orderMode: reviewState.orderMode,
        orderId: "mock_order_preview_only",
        preliminaryFxRate: reviewState.preliminaryFxRate,
        priceCurrency: reviewState.priceCurrency,
        quantity: reviewState.quantity,
        requestId: reviewState.requestId,
        requestedPrice: reviewState.limitPrice || reviewState.intendedPrice,
        reviewButtonLabel: reviewState.reviewButtonLabel,
        status: "submitted",
        ticker: reviewState.ticker,
        totalAmount: reviewState.estimatedTotalAmount,
        validUntil: reviewState.validUntil,
      })
    : "";

  function updateFormField<K extends keyof MockBrokerOrderFormState>(
    field: K,
    value: MockBrokerOrderFormState[K],
  ) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
    setReviewState(null);
    setValidationErrors([]);
  }

  function updateAction(value: string) {
    const nextAction = normalizeAction(value);

    setFormState((current) => {
      const previousReviewLabel = reviewLabelForAction(current.action);
      const previousConfirmLabel = confirmLabelForAction(current.action);

      return {
        ...current,
        action: nextAction,
        reviewButtonLabel:
          current.reviewButtonLabel === previousReviewLabel
            ? reviewLabelForAction(nextAction)
            : current.reviewButtonLabel,
        confirmButtonLabel:
          current.confirmButtonLabel === previousConfirmLabel
            ? confirmLabelForAction(nextAction)
            : current.confirmButtonLabel,
      };
    });
    setReviewState(null);
    setValidationErrors([]);
  }

  function reviewMockOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateMockOrderPageFormValues(formState);

    if (!validation.ok) {
      setValidationErrors(validation.errors);
      setReviewState(null);
      return;
    }

    setValidationErrors([]);
    setReviewState({ ...formState });
  }

  function resetMockForm() {
    setFormState(initialFormState);
    setReviewState(null);
    setValidationErrors([]);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-amber-200">
                MOCK BROKER
              </span>
              <span className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-cyan-200">
                DEV ONLY
              </span>
              <span className="rounded-full border border-rose-400/40 bg-rose-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-rose-200">
                Not Avanza
              </span>
            </div>
            <h1 className="mt-4 text-3xl font-semibold text-white">
              Mock broker order ticket
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              Local execution sandbox page for testing a fake order form. No
              real order can be placed, no broker is contacted, no Supabase data
              is written, and real trade state is never changed.
            </p>
          </div>
          <Link
            className="inline-flex w-fit rounded-md border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 hover:border-slate-500 hover:text-white"
            href="/settings"
          >
            Settings
          </Link>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <section className="rounded-lg border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/30">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Fake order form
              </p>
              <h2 className="text-xl font-semibold text-white">
                Order details
              </h2>
            </div>

            <form className="mt-5 space-y-5" onSubmit={reviewMockOrder}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="ticker">Ticker / symbol</FieldLabel>
                  <TextInput
                    id="ticker"
                    onChange={(value) => updateFormField("ticker", value)}
                    placeholder="AAPL"
                    selectorKey="ticker"
                    value={formState.ticker}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="quantity">Quantity</FieldLabel>
                  <TextInput
                    id="quantity"
                    onChange={(value) => updateFormField("quantity", value)}
                    placeholder="100"
                    selectorKey="quantity"
                    value={formState.quantity}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="action">Action</FieldLabel>
                  <select
                    className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                    data-agent-field={
                      MOCK_ORDER_PAGE_AGENT_SELECTORS.action.dataAgentField
                    }
                    data-testid={MOCK_ORDER_PAGE_AGENT_SELECTORS.action.testId}
                    id="action"
                    name="action"
                    onChange={(event) => updateAction(event.target.value)}
                    value={formState.action}
                  >
                    <option value="buy">Buy</option>
                    <option value="sell">Sell</option>
                  </select>
                </div>
                <div>
                  <FieldLabel htmlFor="account">Account</FieldLabel>
                  <TextInput
                    id="account"
                    onChange={(value) => updateFormField("account", value)}
                    placeholder="Mock account"
                    selectorKey="account"
                    value={formState.account}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="orderType">Order type</FieldLabel>
                  <select
                    className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                    data-agent-field={
                      MOCK_ORDER_PAGE_AGENT_SELECTORS.orderType.dataAgentField
                    }
                    data-testid={
                      MOCK_ORDER_PAGE_AGENT_SELECTORS.orderType.testId
                    }
                    id="orderType"
                    name="orderType"
                    onChange={(event) =>
                      updateFormField(
                        "orderType",
                        normalizeOrderType(event.target.value),
                      )
                    }
                    value={formState.orderType}
                  >
                    <option value="market">Market</option>
                    <option value="limit">Limit</option>
                  </select>
                </div>
                <div>
                  <FieldLabel htmlFor="orderMode">Order mode</FieldLabel>
                  <select
                    className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                    data-agent-field={
                      MOCK_ORDER_PAGE_AGENT_SELECTORS.orderMode.dataAgentField
                    }
                    data-testid={MOCK_ORDER_PAGE_AGENT_SELECTORS.orderMode.testId}
                    id="orderMode"
                    name="orderMode"
                    onChange={(event) =>
                      updateFormField(
                        "orderMode",
                        normalizeOrderMode(event.target.value),
                      )
                    }
                    value={formState.orderMode}
                  >
                    <option value="advanced">Advanced</option>
                    <option value="stop_loss">Stop Loss - unsupported</option>
                    <option value="trailing">Trailing - unsupported</option>
                  </select>
                </div>
                <div>
                  <FieldLabel htmlFor="limitPrice">Limit price</FieldLabel>
                  <TextInput
                    id="limitPrice"
                    onChange={(value) => updateFormField("limitPrice", value)}
                    placeholder="145.50"
                    selectorKey="limitPrice"
                    value={formState.limitPrice}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="intendedPrice">
                    Intended / current price
                  </FieldLabel>
                  <TextInput
                    id="intendedPrice"
                    onChange={(value) =>
                      updateFormField("intendedPrice", value)
                    }
                    placeholder="145.50"
                    selectorKey="intendedPrice"
                    value={formState.intendedPrice}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="amountSek">Amount SEK</FieldLabel>
                  <TextInput
                    id="amountSek"
                    onChange={(value) => updateFormField("amountSek", value)}
                    placeholder="15000"
                    selectorKey="amountSek"
                    value={formState.amountSek}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="priceCurrency">Price currency</FieldLabel>
                  <TextInput
                    id="priceCurrency"
                    onChange={(value) =>
                      updateFormField("priceCurrency", value.toUpperCase())
                    }
                    placeholder="USD"
                    selectorKey="priceCurrency"
                    value={formState.priceCurrency}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="instrumentMarket">
                    Instrument market
                  </FieldLabel>
                  <TextInput
                    id="instrumentMarket"
                    onChange={(value) =>
                      updateFormField("instrumentMarket", value)
                    }
                    placeholder="NASDAQ"
                    selectorKey="instrumentMarket"
                    value={formState.instrumentMarket}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="instrumentCurrency">
                    Instrument currency
                  </FieldLabel>
                  <TextInput
                    id="instrumentCurrency"
                    onChange={(value) =>
                      updateFormField("instrumentCurrency", value.toUpperCase())
                    }
                    placeholder="USD"
                    selectorKey="instrumentCurrency"
                    value={formState.instrumentCurrency}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="instrumentType">Instrument type</FieldLabel>
                  <TextInput
                    id="instrumentType"
                    onChange={(value) =>
                      updateFormField("instrumentType", value)
                    }
                    placeholder="stock"
                    selectorKey="instrumentType"
                    value={formState.instrumentType}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="targetPrice">Target price</FieldLabel>
                  <TextInput
                    id="targetPrice"
                    onChange={(value) => updateFormField("targetPrice", value)}
                    placeholder="152.00"
                    selectorKey="targetPrice"
                    value={formState.targetPrice}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="stopLossPrice">
                    Stop loss price
                  </FieldLabel>
                  <TextInput
                    id="stopLossPrice"
                    onChange={(value) =>
                      updateFormField("stopLossPrice", value)
                    }
                    placeholder="139.00"
                    selectorKey="stopLossPrice"
                    value={formState.stopLossPrice}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="mode">Mode</FieldLabel>
                  <select
                    className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                    data-agent-field={
                      MOCK_ORDER_PAGE_AGENT_SELECTORS.mode.dataAgentField
                    }
                    data-testid={MOCK_ORDER_PAGE_AGENT_SELECTORS.mode.testId}
                    id="mode"
                    name="mode"
                    onChange={(event) =>
                      updateFormField(
                        "mode",
                        normalizeExecutionMode(event.target.value, {
                          automaticEnabled: true,
                        }),
                      )
                    }
                    value={formState.mode}
                  >
                    <option value="semi_automatic">Semi-automatic</option>
                    <option value="automatic">Automatic</option>
                  </select>
                </div>
                <div>
                  <FieldLabel htmlFor="validUntil">Valid until</FieldLabel>
                  <TextInput
                    id="validUntil"
                    onChange={(value) => updateFormField("validUntil", value)}
                    placeholder="2026-06-11"
                    selectorKey="validUntil"
                    value={formState.validUntil}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="estimatedFees">Estimated fees</FieldLabel>
                  <TextInput
                    id="estimatedFees"
                    onChange={(value) => updateFormField("estimatedFees", value)}
                    placeholder="19.00"
                    selectorKey="estimatedFees"
                    value={formState.estimatedFees}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="estimatedCourtage">
                    Estimated courtage
                  </FieldLabel>
                  <TextInput
                    id="estimatedCourtage"
                    onChange={(value) =>
                      updateFormField("estimatedCourtage", value)
                    }
                    placeholder="9.00"
                    selectorKey="estimatedCourtage"
                    value={formState.estimatedCourtage}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="estimatedFxFee">Estimated FX fee</FieldLabel>
                  <TextInput
                    id="estimatedFxFee"
                    onChange={(value) =>
                      updateFormField("estimatedFxFee", value)
                    }
                    placeholder="10.00"
                    selectorKey="estimatedFxFee"
                    value={formState.estimatedFxFee}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="estimatedTotalAmount">
                    Estimated total amount
                  </FieldLabel>
                  <TextInput
                    id="estimatedTotalAmount"
                    onChange={(value) =>
                      updateFormField("estimatedTotalAmount", value)
                    }
                    placeholder="15019.00"
                    selectorKey="estimatedTotalAmount"
                    value={formState.estimatedTotalAmount}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="preliminaryFxRate">
                    Preliminary FX rate
                  </FieldLabel>
                  <TextInput
                    id="preliminaryFxRate"
                    onChange={(value) =>
                      updateFormField("preliminaryFxRate", value)
                    }
                    placeholder="10.50"
                    selectorKey="preliminaryFxRate"
                    value={formState.preliminaryFxRate}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="reviewButtonLabel">
                    Review button label
                  </FieldLabel>
                  <TextInput
                    id="reviewButtonLabel"
                    onChange={(value) =>
                      updateFormField("reviewButtonLabel", value)
                    }
                    placeholder="Granska köp"
                    selectorKey="reviewButtonLabel"
                    value={formState.reviewButtonLabel}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="confirmButtonLabel">
                    Confirm button label
                  </FieldLabel>
                  <TextInput
                    id="confirmButtonLabel"
                    onChange={(value) =>
                      updateFormField("confirmButtonLabel", value)
                    }
                    placeholder="Bekräfta köp"
                    selectorKey="confirmButtonLabel"
                    value={formState.confirmButtonLabel}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="cancelButtonLabel">
                    Cancel button label
                  </FieldLabel>
                  <TextInput
                    id="cancelButtonLabel"
                    onChange={(value) =>
                      updateFormField("cancelButtonLabel", value)
                    }
                    placeholder="Avbryt"
                    selectorKey="cancelButtonLabel"
                    value={formState.cancelButtonLabel}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="requestId">Request ID</FieldLabel>
                  <TextInput
                    id="requestId"
                    onChange={(value) => updateFormField("requestId", value)}
                    placeholder="avanza_agent_request_..."
                    selectorKey="requestId"
                    value={formState.requestId}
                  />
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel htmlFor="intentId">Intent ID</FieldLabel>
                  <TextInput
                    id="intentId"
                    onChange={(value) => updateFormField("intentId", value)}
                    placeholder="execution_intent_..."
                    selectorKey="intentId"
                    value={formState.intentId}
                  />
                </div>
              </div>

              <ValidationErrorBlock errors={validationErrors} />

              <div className="grid gap-3 rounded-lg border border-slate-800 bg-slate-950/70 p-4 sm:grid-cols-2">
                <div
                  data-agent-field={
                    MOCK_ORDER_PAGE_AGENT_SELECTORS
                      .requireManualFinalConfirmation.dataAgentField
                  }
                  data-testid={
                    MOCK_ORDER_PAGE_AGENT_SELECTORS
                      .requireManualFinalConfirmation.testId
                  }
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Require manual final confirmation
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-100">
                    {requiresManualFinalConfirmation ? "true" : "false"}
                  </p>
                </div>
                <div
                  data-agent-field={
                    MOCK_ORDER_PAGE_AGENT_SELECTORS.allowAutomaticFinalSubmit
                      .dataAgentField
                  }
                  data-testid={
                    MOCK_ORDER_PAGE_AGENT_SELECTORS.allowAutomaticFinalSubmit
                      .testId
                  }
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Allow automatic final submit
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-100">
                    {allowsAutomaticFinalSubmit ? "true" : "false"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  className="rounded-md bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                  data-agent-field={
                    MOCK_ORDER_PAGE_AGENT_SELECTORS.reviewButton.dataAgentField
                  }
                  data-testid={
                    MOCK_ORDER_PAGE_AGENT_SELECTORS.reviewButton.testId
                  }
                  type="submit"
                >
                  Review mock order
                </button>
                <button
                  className="rounded-md border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white"
                  data-agent-field={
                    MOCK_ORDER_PAGE_AGENT_SELECTORS.resetButton.dataAgentField
                  }
                  data-testid={MOCK_ORDER_PAGE_AGENT_SELECTORS.resetButton.testId}
                  onClick={resetMockForm}
                  type="button"
                >
                  Reset mock form
                </button>
                <button
                  className="cursor-not-allowed rounded-md border border-slate-800 px-4 py-2 text-sm font-semibold text-slate-500"
                  data-agent-field={
                    MOCK_ORDER_PAGE_AGENT_SELECTORS.submitDisabled
                      .dataAgentField
                  }
                  data-testid={
                    MOCK_ORDER_PAGE_AGENT_SELECTORS.submitDisabled.testId
                  }
                  disabled
                  type="button"
                >
                  Disabled - no real or mock execution in this action
                </button>
              </div>
            </form>
          </section>

          <aside className="space-y-6">
            <section className="rounded-lg border border-rose-400/30 bg-rose-950/20 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-rose-200">
                No real order can be placed
              </p>
              <ul className="mt-4 space-y-2 text-sm leading-6 text-rose-100/90">
                <li>Not Avanza and not connected to any broker.</li>
                <li>No order is prepared, submitted, simulated, or captured.</li>
                <li>No Supabase writes and no real trade state mutation.</li>
                <li>Query params are only local prefill hints.</li>
              </ul>
            </section>

            <section className="rounded-lg border border-slate-800 bg-slate-900/80 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Mock review panel
              </p>
              <h2 className="mt-2 text-lg font-semibold text-white">
                Review mock order
              </h2>
              {reviewState ? (
                <dl className="mt-4 grid gap-3">
                  <SummaryRow label="Ticker" value={reviewState.ticker} />
                  <SummaryRow label="Action" value={reviewState.action} />
                  <SummaryRow label="Quantity" value={reviewState.quantity} />
                  <SummaryRow
                    label="Order type"
                    value={reviewState.orderType}
                  />
                  <SummaryRow
                    label="Order mode"
                    value={reviewState.orderMode}
                  />
                  <SummaryRow label="Account" value={reviewState.account} />
                  <SummaryRow
                    label="Amount SEK"
                    value={reviewState.amountSek}
                  />
                  <SummaryRow
                    label="Price currency"
                    value={reviewState.priceCurrency}
                  />
                  <SummaryRow
                    label="Instrument market"
                    value={reviewState.instrumentMarket}
                  />
                  <SummaryRow
                    label="Instrument currency"
                    value={reviewState.instrumentCurrency}
                  />
                  <SummaryRow
                    label="Instrument type"
                    value={reviewState.instrumentType}
                  />
                  <SummaryRow
                    label="Limit price"
                    value={reviewState.limitPrice}
                  />
                  <SummaryRow
                    label="Intended/current price"
                    value={reviewState.intendedPrice}
                  />
                  <SummaryRow
                    label="Target price"
                    value={reviewState.targetPrice}
                  />
                  <SummaryRow
                    label="Stop loss price"
                    value={reviewState.stopLossPrice}
                  />
                  <SummaryRow
                    label="Valid until"
                    value={reviewState.validUntil}
                  />
                  <SummaryRow
                    label="Estimated fees"
                    value={reviewState.estimatedFees}
                  />
                  <SummaryRow
                    label="Estimated courtage"
                    value={reviewState.estimatedCourtage}
                  />
                  <SummaryRow
                    label="Estimated FX fee"
                    value={reviewState.estimatedFxFee}
                  />
                  <SummaryRow
                    label="Estimated total amount"
                    value={reviewState.estimatedTotalAmount}
                  />
                  <SummaryRow
                    label="Preliminary FX rate"
                    value={reviewState.preliminaryFxRate}
                  />
                  <SummaryRow
                    label="Review button label"
                    value={reviewState.reviewButtonLabel}
                  />
                  <SummaryRow
                    label="Confirm button label"
                    value={reviewState.confirmButtonLabel}
                  />
                  <SummaryRow
                    label="Cancel button label"
                    value={reviewState.cancelButtonLabel}
                  />
                  <SummaryRow label="Mode" value={reviewState.mode} />
                  <SummaryRow
                    label="Manual confirmation required"
                    value={
                      reviewState.mode === DEFAULT_EXECUTION_MODE
                        ? "true"
                        : "false"
                    }
                  />
                  <SummaryRow
                    label="Automatic final submit allowed"
                    value={reviewState.mode === "automatic" ? "true" : "false"}
                  />
                  <SummaryRow
                    label="Request ID"
                    value={reviewState.requestId}
                  />
                  <SummaryRow label="Intent ID" value={reviewState.intentId} />
                  <div className="rounded-md border border-emerald-400/20 bg-emerald-400/[0.06] p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100">
                      Mock confirmation preview
                    </p>
                    <p className="mt-2 text-xs leading-5 text-slate-300">
                      Opens a local mock confirmation page only. It does not
                      submit this order and does not create brokerResult.
                    </p>
                    <Link
                      className="mt-3 inline-flex rounded-md border border-emerald-300/30 px-3 py-2 text-xs font-semibold text-emerald-100 transition hover:border-emerald-200/60 hover:text-white"
                      href={mockConfirmationHref}
                    >
                      Open mock confirmation page
                    </Link>
                  </div>
                </dl>
              ) : (
                <p className="mt-4 rounded-md border border-slate-800 bg-slate-950/70 p-4 text-sm leading-6 text-slate-400">
                  {validationErrors.length > 0
                    ? `Fix the mock validation errors before reviewing. Minimum amount threshold: ${MOCK_ORDER_MIN_AMOUNT_SEK} SEK.`
                    : "Fill the fake ticket and choose Review mock order. The review panel is local component state only."}
                </p>
              )}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
