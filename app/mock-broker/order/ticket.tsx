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
  MOCK_ORDER_PAGE_AGENT_SELECTORS,
  type MockOrderPageFieldKey,
} from "@/lib/mock-order-page-agent-contract";
import { buildMockOrderConfirmationUrl } from "@/lib/mock-order-confirmation-contract";

type MockBrokerOrderType = "market" | "limit";

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
  requestId: string;
  intentId: string;
};

function normalizeAction(value: unknown): ExecutionAction {
  return value === "sell" ? "sell" : "buy";
}

function normalizeOrderType(value: unknown): MockBrokerOrderType {
  return value === "limit" ? "limit" : "market";
}

function createInitialFormState(
  initialValues: MockBrokerOrderInitialValues,
): MockBrokerOrderFormState {
  return {
    action: normalizeAction(initialValues.action),
    intendedPrice: initialValues.intendedPrice ?? "",
    intentId: initialValues.intentId ?? "",
    limitPrice: initialValues.limitPrice ?? "",
    mode: normalizeExecutionMode(initialValues.mode, {
      automaticEnabled: true,
    }),
    orderType: normalizeOrderType(initialValues.orderType),
    quantity: initialValues.quantity ?? "",
    requestId: initialValues.requestId ?? "",
    stopLossPrice: initialValues.stopLossPrice ?? "",
    targetPrice: initialValues.targetPrice ?? "",
    ticker: initialValues.ticker ?? "",
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

  const requiresManualFinalConfirmation =
    formState.mode === DEFAULT_EXECUTION_MODE;
  const allowsAutomaticFinalSubmit = formState.mode === "automatic";
  const mockConfirmationHref = reviewState
    ? buildMockOrderConfirmationUrl({
        action: reviewState.action,
        executedPrice: "",
        intentId: reviewState.intentId,
        message:
          "Local mock confirmation preview only. No brokerResult created.",
        orderId: "mock_order_preview_only",
        quantity: reviewState.quantity,
        requestId: reviewState.requestId,
        requestedPrice: reviewState.limitPrice || reviewState.intendedPrice,
        status: "submitted",
        ticker: reviewState.ticker,
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
  }

  function reviewMockOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setReviewState({ ...formState });
  }

  function resetMockForm() {
    setFormState(initialFormState);
    setReviewState(null);
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
                    onChange={(event) =>
                      updateFormField(
                        "action",
                        normalizeAction(event.target.value),
                      )
                    }
                    value={formState.action}
                  >
                    <option value="buy">Buy</option>
                    <option value="sell">Sell</option>
                  </select>
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
                  Fill the fake ticket and choose Review mock order. The review
                  panel is local component state only.
                </p>
              )}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
