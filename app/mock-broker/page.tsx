"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildMockBrokerDryRunSession,
  buildMockBrokerFillConfirmation,
  createMockBrokerOrderFormState,
  mockBrokerFillConfirmationJson,
  parseMockBrokerHandoffJson,
  validateMockBrokerOrderForm,
  type MockBrokerFillConfirmation,
  type MockBrokerOrderFormState,
  type MockBrokerOrderStatus,
} from "@/lib/mock-broker-dry-run";
import {
  buildDataModeClaritySummary,
  dataModeClaritySummaryJson,
} from "@/lib/data-mode-clarity";

const isMockBrokerHarnessEnabled =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_ENABLE_DEMO_TRADING_FLOW === "true";

const latestMockFillStorageKey = "trade-mock-broker-latest-fill";
const latestMockHandoffStorageKey = "trade-mock-broker-latest-handoff";

type MockBrokerAuditEventType =
  | "mock_broker_dry_run_opened"
  | "mock_broker_handoff_loaded"
  | "mock_broker_order_prepared"
  | "mock_broker_manual_confirmation_clicked"
  | "mock_broker_fill_generated"
  | "mock_broker_fill_copied";

export default function MockBrokerDryRunPage() {
  const [sessionCreatedAt] = useState(() => new Date().toISOString());
  const [handoffJson, setHandoffJson] = useState(() => readStoredMockHandoff());
  const [parsedSource, setParsedSource] = useState<unknown | null>(null);
  const [handoffLoaded, setHandoffLoaded] = useState(false);
  const [formState, setFormState] = useState<MockBrokerOrderFormState>(() =>
    createMockBrokerOrderFormState(),
  );
  const [orderStatus, setOrderStatus] = useState<MockBrokerOrderStatus>("draft");
  const [filledShares, setFilledShares] = useState("");
  const [actualPrice, setActualPrice] = useState("");
  const [fillConfirmation, setFillConfirmation] =
    useState<MockBrokerFillConfirmation | null>(null);
  const [message, setMessage] = useState("");
  const openedLoggedRef = useRef(false);

  const validation = useMemo(
    () =>
      validateMockBrokerOrderForm(formState, {
        handoffLoaded,
        source: parsedSource,
      }),
    [formState, handoffLoaded, parsedSource],
  );
  const effectiveStatus =
    validation.status === "blocked" ? "blocked" : orderStatus;
  const session = useMemo(
    () =>
      buildMockBrokerDryRunSession({
        formState,
        status: effectiveStatus,
        fillConfirmation,
        handoffLoaded,
        createdAt: sessionCreatedAt,
        source: parsedSource,
      }),
    [
      effectiveStatus,
      fillConfirmation,
      formState,
      handoffLoaded,
      parsedSource,
      sessionCreatedAt,
    ],
  );
  const fillJson = fillConfirmation
    ? mockBrokerFillConfirmationJson(fillConfirmation)
    : "";
  const dataModeClaritySummary = buildDataModeClaritySummary({
    environment: process.env.NODE_ENV,
    demo_mode_enabled: isMockBrokerHarnessEnabled,
    mock_broker_tools_enabled: true,
    future_agent_packages: {
      available: true,
      count: handoffLoaded ? 1 : 0,
    },
    now: sessionCreatedAt,
  });

  useEffect(() => {
    if (!isMockBrokerHarnessEnabled || openedLoggedRef.current) {
      return;
    }

    openedLoggedRef.current = true;
    logMockBrokerEvent("mock_broker_dry_run_opened", {
      session_id: session.session_id,
    });

  }, [session.session_id]);

  function updateFormField(
    field: keyof MockBrokerOrderFormState,
    value: string | boolean,
  ) {
    setFormState((current) => ({
      ...current,
      [field]: value,
      broker: "MOCK_BROKER",
    }));
    setFillConfirmation(null);
    if (orderStatus !== "draft") {
      setOrderStatus("draft");
    }
  }

  function loadHandoffJson() {
    const result = parseMockBrokerHandoffJson(handoffJson);
    setParsedSource(result.parsed);
    setFormState(result.form_state);
    setHandoffLoaded(Boolean(result.parsed));
    setFillConfirmation(null);
    setOrderStatus(result.validation.status === "blocked" ? "blocked" : "draft");

    try {
      if (handoffJson.trim()) {
        window.localStorage.setItem(latestMockHandoffStorageKey, handoffJson);
      }
    } catch {
      // Mock handoff cache is best-effort only.
    }

    logMockBrokerEvent("mock_broker_handoff_loaded", {
      session_id: session.session_id,
      side: result.form_state.side,
      ticker: result.form_state.ticker,
      status: result.validation.status,
      blocker_count: result.validation.blockers.length,
      warning_count: result.validation.warnings.length,
    });

    setMessage(
      result.parse_error ??
        (result.validation.status === "blocked"
          ? "Handoff loaded with blockers."
          : "Handoff loaded into the local mock form."),
    );
  }

  function prepareMockOrder() {
    const nextValidation = validateMockBrokerOrderForm(formState, {
      handoffLoaded,
      source: parsedSource,
    });

    if (!nextValidation.can_prepare_order) {
      setOrderStatus("blocked");
      setMessage("Resolve blockers before preparing the mock order.");
      return;
    }

    setOrderStatus("waiting_for_manual_confirmation");
    setFilledShares(formState.quantity);
    setActualPrice(formState.price_reference);
    logMockBrokerEvent("mock_broker_order_prepared", {
      session_id: session.session_id,
      side: formState.side,
      ticker: formState.ticker,
      quantity: formState.quantity,
      price_reference: formState.price_reference,
      status: nextValidation.status,
    });
    setMessage("Mock order prepared. Stop here until you manually confirm the mock order.");
  }

  function manuallyConfirmMockOrder() {
    const nextValidation = validateMockBrokerOrderForm(formState, {
      handoffLoaded,
      source: parsedSource,
      requirePrepared: true,
    });

    if (
      !nextValidation.can_generate_fill ||
      orderStatus !== "waiting_for_manual_confirmation"
    ) {
      setMessage("Prepare the mock order before manual mock confirmation.");
      return;
    }

    const requestedShares = Number(formState.quantity);
    const sharesToFill = Number(filledShares || formState.quantity);
    const priceToFill = Number(actualPrice || formState.price_reference);

    if (
      !Number.isFinite(requestedShares) ||
      !Number.isFinite(sharesToFill) ||
      !Number.isFinite(priceToFill) ||
      requestedShares <= 0 ||
      sharesToFill <= 0 ||
      priceToFill <= 0
    ) {
      setMessage("Mock fill price and shares must be valid positive numbers.");
      return;
    }

    if (sharesToFill > requestedShares) {
      setMessage("Mock filled shares cannot exceed requested shares.");
      return;
    }

    const confirmation = buildMockBrokerFillConfirmation({
      formState,
      filledShares,
      actualPrice,
    });

    setFillConfirmation(confirmation);
    setOrderStatus("filled");

    try {
      window.localStorage.setItem(
        latestMockFillStorageKey,
        mockBrokerFillConfirmationJson(confirmation),
      );
    } catch {
      // Local mock output persistence is best-effort only.
    }

    logMockBrokerEvent("mock_broker_manual_confirmation_clicked", {
      session_id: session.session_id,
      side: confirmation.side,
      ticker: confirmation.ticker,
      actual_price: confirmation.actual_price,
      actual_shares: confirmation.actual_shares,
    });
    logMockBrokerEvent("mock_broker_fill_generated", {
      session_id: session.session_id,
      confirmation_id: confirmation.confirmation_id,
      side: confirmation.side,
      ticker: confirmation.ticker,
      status: confirmation.status,
      actual_price: confirmation.actual_price,
      actual_shares: confirmation.actual_shares,
    });
    setMessage("Mock fill generated locally. No broker order was submitted.");
  }

  async function copyMockFillJson() {
    if (!fillConfirmation) {
      setMessage("Generate a mock fill before copying JSON.");
      return;
    }

    try {
      await navigator.clipboard.writeText(fillJson);
      logMockBrokerEvent("mock_broker_fill_copied", {
        session_id: session.session_id,
        confirmation_id: fillConfirmation.confirmation_id,
        side: fillConfirmation.side,
        ticker: fillConfirmation.ticker,
      });
      setMessage("Mock fill confirmation JSON copied.");
    } catch {
      setMessage("Copy failed. Open the JSON panel and copy manually.");
    }
  }

  if (!isMockBrokerHarnessEnabled) {
    return <MockBrokerDisabled />;
  }

  return (
    <main className="min-h-screen bg-[#060707] text-zinc-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-6 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              <span>Developer dry run</span>
              <span className="h-1 w-1 rounded-full bg-cyan-300" />
              <span>MOCK ONLY</span>
            </div>
            <div>
              <h1 className="font-mono text-4xl font-semibold tracking-normal text-white sm:text-5xl">
                Mock Broker Dry Run
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400 sm:text-base">
                Local/dev harness for Ture handoff JSON. This mock broker does
                not connect to Avanza, cannot submit orders, and cannot handle
                credentials.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/settings"
              className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-zinc-300 transition hover:border-white/25 hover:text-white"
            >
              Back to Settings
            </Link>
            <Link
              href="/"
              className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-zinc-300 transition hover:border-white/25 hover:text-white"
            >
              Back to Ture
            </Link>
          </div>
        </header>

        <section className="rounded-lg border border-amber-300/25 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
          <div className="font-mono text-xs font-bold uppercase tracking-[0.14em]">
            MOCK ONLY - local dry run
          </div>
          <p className="mt-2">
            Mock broker fills are test data. No real order can be submitted
            here. Final Avanza KÖP/SÄLJ remains human-only in future prototypes.
          </p>
          <p className="mt-2">
            Agent packages are read/prepare-only unless a future policy
            explicitly allows more.
          </p>
          <div
            id="trade-data-mode-clarity-json"
            data-agent-readable="true"
            className="sr-only"
          >
            {dataModeClaritySummaryJson(dataModeClaritySummary)}
          </div>
        </section>

        {message && (
          <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm leading-6 text-cyan-100">
            {message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <section className="bg-surface-subtle rounded-lg border border-white/10 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Ture Handoff JSON
                </div>
                <h2 className="mt-2 font-mono text-xl font-semibold text-white">
                  Load handoff package
                </h2>
              </div>
              <StatusPill value={session.validation.status} />
            </div>

            <textarea
              value={handoffJson}
              onChange={(event) => setHandoffJson(event.target.value)}
              placeholder="Paste Ture execution payload, agent command, hard stop contract, or form mapping JSON..."
              className="mt-4 min-h-72 w-full rounded-md border border-white/10 bg-black/35 p-3 font-mono text-xs leading-5 text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-cyan-200/50"
            />

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-6 text-zinc-500">
                Input is parsed locally in your browser. Nothing is sent to a broker.
              </p>
              <button
                type="button"
                onClick={loadHandoffJson}
                className="min-h-11 cursor-pointer rounded-full bg-white px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-zinc-950 transition hover:bg-cyan-100"
              >
                Load Handoff JSON
              </button>
            </div>

            <ValidationPanel validation={session.validation} />
          </section>

          <section className="bg-surface-subtle rounded-lg border border-white/10 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Mock Broker Form
                </div>
                <h2 className="mt-2 font-mono text-xl font-semibold text-white">
                  Prepare mock {formState.side} order
                </h2>
              </div>
              <StatusPill value={effectiveStatus} />
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <MockField label="Ticker / Instrument">
                <input
                  value={formState.ticker}
                  onChange={(event) => updateFormField("ticker", event.target.value)}
                  className="mt-2 min-h-11 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none focus:border-cyan-200/50"
                />
              </MockField>

              <MockField label="Instrument Name">
                <input
                  value={formState.instrument_name}
                  onChange={(event) =>
                    updateFormField("instrument_name", event.target.value)
                  }
                  className="mt-2 min-h-11 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none focus:border-cyan-200/50"
                />
              </MockField>

              <MockField label="Side">
                <select
                  value={formState.side}
                  onChange={(event) =>
                    updateFormField("side", event.target.value as "BUY" | "SELL")
                  }
                  className="mt-2 min-h-11 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none focus:border-cyan-200/50"
                >
                  <option value="BUY">BUY</option>
                  <option value="SELL">SELL</option>
                </select>
              </MockField>

              <MockField label="Quantity">
                <input
                  type="number"
                  min="0"
                  step="0.0001"
                  value={formState.quantity}
                  onChange={(event) => updateFormField("quantity", event.target.value)}
                  className="mt-2 min-h-11 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none focus:border-cyan-200/50"
                />
              </MockField>

              <MockField label="Price Type">
                <select
                  value={formState.price_type}
                  onChange={(event) =>
                    updateFormField(
                      "price_type",
                      event.target.value as MockBrokerOrderFormState["price_type"],
                    )
                  }
                  className="mt-2 min-h-11 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none focus:border-cyan-200/50"
                >
                  <option value="limit_reference">Limit/reference</option>
                  <option value="market_reference">Market reference</option>
                  <option value="review_required">Review required</option>
                </select>
              </MockField>

              <MockField label="Limit / Reference Price">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formState.price_reference}
                  onChange={(event) =>
                    updateFormField("price_reference", event.target.value)
                  }
                  className="mt-2 min-h-11 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none focus:border-cyan-200/50"
                />
              </MockField>

              <MockField label="Currency">
                <input
                  value={formState.currency}
                  onChange={(event) => updateFormField("currency", event.target.value)}
                  className="mt-2 min-h-11 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none focus:border-cyan-200/50"
                />
              </MockField>

              <MockField label="Broker">
                <input
                  value="MOCK_BROKER"
                  readOnly
                  className="mt-2 min-h-11 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-zinc-400 outline-none"
                />
              </MockField>
            </div>

            <label className="mt-4 flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-md border border-white/10 bg-black/25 px-4 py-3">
              <span className="text-sm text-zinc-300">
                Stop before final mock confirmation
              </span>
              <input
                type="checkbox"
                checked={formState.stop_before_final_confirmation}
                onChange={(event) =>
                  updateFormField(
                    "stop_before_final_confirmation",
                    event.target.checked,
                  )
                }
                className="h-4 w-4 shrink-0 accent-cyan-200"
              />
            </label>

            <div className="mt-5 rounded-md border border-white/10 bg-black/25 p-4">
              <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                Mock Fill Simulation
              </div>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <MockField label="Actual mock fill price">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={actualPrice}
                    onChange={(event) => setActualPrice(event.target.value)}
                    placeholder={formState.price_reference || "0.00"}
                    className="mt-2 min-h-11 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none placeholder:text-zinc-600 focus:border-cyan-200/50"
                  />
                </MockField>
                <MockField label="Actual mock filled shares">
                  <input
                    type="number"
                    min="0"
                    step="0.0001"
                    value={filledShares}
                    onChange={(event) => setFilledShares(event.target.value)}
                    placeholder={formState.quantity || "0"}
                    className="mt-2 min-h-11 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none placeholder:text-zinc-600 focus:border-cyan-200/50"
                  />
                </MockField>
              </div>
              <p className="mt-3 text-sm leading-6 text-zinc-500">
                Use a smaller filled share value to simulate a partial mock fill.
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={prepareMockOrder}
                disabled={!validation.can_prepare_order}
                className="min-h-11 cursor-pointer rounded-full border border-cyan-200/20 bg-cyan-200/[0.06] px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-cyan-100 transition hover:border-cyan-100/40 hover:text-white disabled:cursor-not-allowed disabled:border-white/10 disabled:text-zinc-600"
              >
                Prepare Mock Order
              </button>
              <button
                type="button"
                onClick={manuallyConfirmMockOrder}
                disabled={effectiveStatus !== "waiting_for_manual_confirmation"}
                className="min-h-11 cursor-pointer rounded-full bg-white px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-zinc-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
              >
                Manually Confirm Mock {formState.side}
              </button>
            </div>
          </section>
        </div>

        <section className="bg-surface-subtle rounded-lg border border-white/10 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                Mock Fill Confirmation
              </div>
              <h2 className="mt-2 font-mono text-xl font-semibold text-white">
                Local output JSON
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                Saved to localStorage key{" "}
                <span className="font-mono text-zinc-200">
                  {latestMockFillStorageKey}
                </span>
                . It does not create or close a Ture trade.
              </p>
            </div>
            <button
              type="button"
              onClick={copyMockFillJson}
              disabled={!fillConfirmation}
              className="min-h-11 cursor-pointer rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-zinc-300 transition hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:text-zinc-600"
            >
              Copy Mock Fill Confirmation JSON
            </button>
          </div>

          {fillConfirmation ? (
            <pre className="mt-4 max-h-96 overflow-auto rounded-md border border-white/10 bg-black/40 p-4 text-xs leading-5 text-zinc-300">
              {fillJson}
            </pre>
          ) : (
            <div className="mt-4 rounded-lg border border-dashed border-white/15 bg-white/[0.025] p-6 text-center text-sm leading-6 text-zinc-500">
              No mock fill generated yet.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function MockBrokerDisabled() {
  return (
    <main className="min-h-screen bg-[#060707] text-zinc-100">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-10 sm:px-8">
        <section className="rounded-lg border border-amber-300/25 bg-amber-300/10 p-6">
          <div className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-amber-100">
            Mock broker harness disabled
          </div>
          <h1 className="mt-3 font-mono text-3xl font-semibold text-white">
            Local dry run only
          </h1>
          <p className="mt-3 text-sm leading-6 text-amber-100">
            This route is only available in development or when
            NEXT_PUBLIC_ENABLE_DEMO_TRADING_FLOW is true. It is not a real
            broker feature and cannot contact Avanza.
          </p>
          <Link
            href="/settings"
            className="mt-5 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-zinc-200 transition hover:border-white/25 hover:text-white"
          >
            Back to Settings
          </Link>
        </section>
      </div>
    </main>
  );
}

function MockField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block rounded-md border border-white/10 bg-black/25 p-4">
      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function ValidationPanel({
  validation,
}: {
  validation: ReturnType<typeof validateMockBrokerOrderForm>;
}) {
  return (
    <div className="mt-4 rounded-md border border-white/10 bg-black/25 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Dry Run Validation
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            {validation.next_action}
          </p>
        </div>
        <StatusPill value={validation.status} />
      </div>

      {validation.blockers.length > 0 && (
        <div className="mt-4">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-red-200">
            Blockers
          </div>
          <ul className="mt-2 space-y-2 text-sm leading-6 text-red-100">
            {validation.blockers.map((blocker) => (
              <li key={blocker.id}>{blocker.message}</li>
            ))}
          </ul>
        </div>
      )}

      {validation.warnings.length > 0 && (
        <div className="mt-4">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-200">
            Warnings
          </div>
          <ul className="mt-2 space-y-2 text-sm leading-6 text-amber-100">
            {validation.warnings.map((warning) => (
              <li key={warning.id}>{warning.message}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function StatusPill({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  const className =
    normalized === "ready" ||
    normalized === "filled" ||
    normalized === "prepared"
      ? "border-[#00db94]/30 bg-[#00db94]/10 text-emerald-100"
      : normalized === "blocked" || normalized === "cancelled"
        ? "border-red-300/30 bg-red-300/10 text-red-100"
        : "border-amber-300/30 bg-amber-300/10 text-amber-100";

  return (
    <span
      className={`rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${className}`}
    >
      {formatStatus(value)}
    </span>
  );
}

function formatStatus(value: string) {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function logMockBrokerEvent(
  type: MockBrokerAuditEventType,
  payload: Record<string, unknown>,
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const current = JSON.parse(
      window.localStorage.getItem("trade-management-events") ?? "[]",
    );
    const events = Array.isArray(current) ? current : [];
    events.push({
      type,
      timestamp: new Date().toISOString(),
      source: "mock_broker_dry_run",
      mock_only: true,
      avanza_not_contacted: true,
      no_real_order_submitted: true,
      ...payload,
    });
    window.localStorage.setItem(
      "trade-management-events",
      JSON.stringify(events.slice(-200)),
    );
  } catch {
    // Mock broker audit is local diagnostic state only.
  }
}

function readStoredMockHandoff() {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    return window.localStorage.getItem(latestMockHandoffStorageKey) ?? "";
  } catch {
    return "";
  }
}
