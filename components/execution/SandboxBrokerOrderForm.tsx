"use client";

import { useMemo, useState } from "react";

type SandboxOrderAction = "buy" | "sell";
type SandboxOrderType = "limit" | "market" | "stop_limit";

type SandboxBrokerOrderState = {
  action: SandboxOrderAction;
  entryPrice: string;
  orderType: SandboxOrderType;
  payloadId: string;
  plannedRisk: string;
  quantity: string;
  stop: string;
  target: string;
  ticker: string;
};

const defaultOrderState: SandboxBrokerOrderState = {
  action: "buy",
  entryPrice: "212.10",
  orderType: "limit",
  payloadId: "sandbox-payload-local-only",
  plannedRisk: "24.00",
  quantity: "8",
  stop: "209.10",
  target: "218.10",
  ticker: "AAPL",
};

const safetyItems = [
  ["Semi-auto only", "true"],
  ["Manual final confirmation required", "true"],
  ["Automatic submit allowed", "false"],
  ["Automatic submit attempted", "false"],
  ["No Avanza order", "true"],
  ["No broker submit", "true"],
  ["Local sandbox only", "true"],
] as const;

const fieldTestIds: Record<keyof SandboxBrokerOrderState, string> = {
  action: "sandbox-broker-field-side",
  entryPrice: "sandbox-broker-field-entry-price",
  orderType: "sandbox-broker-field-order-type",
  payloadId: "sandbox-broker-field-payload-id",
  plannedRisk: "sandbox-broker-field-planned-risk",
  quantity: "sandbox-broker-field-quantity",
  stop: "sandbox-broker-field-stop",
  target: "sandbox-broker-field-target",
  ticker: "sandbox-broker-field-ticker",
};

function FieldLabel({
  children,
  htmlFor,
}: {
  children: string;
  htmlFor: string;
}) {
  return (
    <label
      className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"
      htmlFor={htmlFor}
    >
      {children}
    </label>
  );
}

function TextInput({
  id,
  label,
  onChange,
  value,
}: {
  id: keyof SandboxBrokerOrderState;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <input
        className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
        data-sandbox-broker-field={id}
        data-testid={fieldTestIds[id]}
        id={id}
        name={id}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </div>
  );
}

function SummaryCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-950/70 px-3 py-2">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm font-medium text-slate-100">
        {value || "Not set"}
      </dd>
    </div>
  );
}

export function SandboxBrokerOrderForm() {
  const [order, setOrder] =
    useState<SandboxBrokerOrderState>(defaultOrderState);
  const finalLabel = order.action === "sell" ? "SÄLJ" : "KÖP";
  const localPreview = useMemo(
    () => ({
      ...order,
      ticker: order.ticker.trim().toUpperCase(),
    }),
    [order],
  );

  function updateField<Key extends keyof SandboxBrokerOrderState>(
    key: Key,
    value: SandboxBrokerOrderState[Key],
  ) {
    setOrder((current) => ({
      ...current,
      [key]: value,
    }));
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 border-b border-slate-800 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">
              Sandbox broker
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-white">
              Fake order form
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              Controlled local sandbox target for a future semi-auto browser
              agent POC. No real broker connection, no Avanza order, and no
              order will be placed.
            </p>
          </div>
          <div className="rounded-md border border-amber-300/25 bg-amber-300/[0.08] px-4 py-3 text-sm text-amber-100">
            Local sandbox only. Final confirmation is intentionally disabled.
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <section
            className="rounded-lg border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/20"
            data-testid="sandbox-broker-form"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-100"
                data-testid="sandbox-broker-no-broker-submit-copy"
              >
                No real broker connection
              </span>
              <span
                className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-100"
                data-testid="sandbox-broker-no-avanza-copy"
              >
                No Avanza order
              </span>
              <span
                className="rounded-full border border-rose-300/25 bg-rose-300/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-rose-100"
                data-testid="sandbox-broker-no-automatic-submit-copy"
              >
                No order will be placed
              </span>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <TextInput
                id="ticker"
                label="Ticker"
                onChange={(value) => updateField("ticker", value)}
                value={order.ticker}
              />
              <div>
                <FieldLabel htmlFor="action">Side/action</FieldLabel>
                <select
                  className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                  data-sandbox-broker-field="action"
                  data-testid="sandbox-broker-field-side"
                  id="action"
                  name="action"
                  onChange={(event) =>
                    updateField("action", event.target.value as SandboxOrderAction)
                  }
                  value={order.action}
                >
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
              </div>
              <TextInput
                id="quantity"
                label="Quantity"
                onChange={(value) => updateField("quantity", value)}
                value={order.quantity}
              />
              <div>
                <FieldLabel htmlFor="orderType">Order type</FieldLabel>
                <select
                  className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                  data-sandbox-broker-field="orderType"
                  data-testid="sandbox-broker-field-order-type"
                  id="orderType"
                  name="orderType"
                  onChange={(event) =>
                    updateField(
                      "orderType",
                      event.target.value as SandboxOrderType,
                    )
                  }
                  value={order.orderType}
                >
                  <option value="limit">Limit</option>
                  <option value="market">Market</option>
                  <option value="stop_limit">Stop limit</option>
                </select>
              </div>
              <TextInput
                id="entryPrice"
                label="Limit/entry price"
                onChange={(value) => updateField("entryPrice", value)}
                value={order.entryPrice}
              />
              <TextInput
                id="stop"
                label="Stop"
                onChange={(value) => updateField("stop", value)}
                value={order.stop}
              />
              <TextInput
                id="target"
                label="Target"
                onChange={(value) => updateField("target", value)}
                value={order.target}
              />
              <TextInput
                id="plannedRisk"
                label="Planned risk"
                onChange={(value) => updateField("plannedRisk", value)}
                value={order.plannedRisk}
              />
              <div className="sm:col-span-2">
                <TextInput
                  id="payloadId"
                  label="Payload id"
                  onChange={(value) => updateField("payloadId", value)}
                  value={order.payloadId}
                />
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <section
              className="rounded-lg border border-slate-800 bg-slate-900/80 p-5"
              data-testid="sandbox-broker-safety-checklist"
            >
              <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-cyan-100">
                Safety checklist
              </p>
              <dl className="mt-4 grid gap-2">
                {safetyItems.map(([label, value]) => (
                  <SummaryCell key={label} label={label} value={value} />
                ))}
              </dl>
            </section>

            <section
              className="rounded-lg border border-slate-800 bg-slate-900/80 p-5"
              data-testid="sandbox-broker-preview"
            >
              <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-cyan-100">
                Local preview only
              </p>
              <dl className="mt-4 grid gap-2 sm:grid-cols-2">
                <SummaryCell label="Ticker" value={localPreview.ticker} />
                <SummaryCell label="Action" value={localPreview.action} />
                <SummaryCell label="Quantity" value={localPreview.quantity} />
                <SummaryCell label="Order type" value={localPreview.orderType} />
                <SummaryCell label="Entry" value={localPreview.entryPrice} />
                <SummaryCell label="Stop" value={localPreview.stop} />
                <SummaryCell label="Target" value={localPreview.target} />
                <SummaryCell label="Risk" value={localPreview.plannedRisk} />
                <SummaryCell label="Payload" value={localPreview.payloadId} />
              </dl>
            </section>
          </aside>
        </div>

        <section
          className="mt-6 rounded-lg border border-rose-300/20 bg-rose-300/[0.06] p-5"
          data-testid="sandbox-broker-final-section"
        >
          <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-rose-100">
            Fake final confirmation
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-3xl text-sm leading-6 text-rose-50">
              The final {finalLabel} control is disabled and non-submitting.
              This sandbox cannot place orders, cannot connect to Avanza, and
              cannot submit to any broker.
            </p>
            <button
              className="w-full rounded-md border border-rose-300/30 bg-rose-300/10 px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.16em] text-rose-100 opacity-70 sm:w-auto"
              data-sandbox-broker-final-control="disabled"
              data-testid="sandbox-broker-final-control"
              disabled
              type="button"
            >
              Disabled fake {finalLabel}
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}
