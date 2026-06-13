import Link from "next/link";
import {
  MOCK_ORDER_CONFIRMATION_SELECTORS,
  type MockOrderConfirmationFieldKey,
  type MockOrderConfirmationPayload,
  type MockOrderConfirmationValidationResult,
} from "@/lib/mock-order-confirmation-contract";
import { SaveDevMockResultButton } from "./save-dev-mock-result-button";

type MockBrokerConfirmationProps = {
  payload: MockOrderConfirmationPayload;
  validation: MockOrderConfirmationValidationResult;
};

function selectorProps(fieldKey: MockOrderConfirmationFieldKey) {
  const selector = MOCK_ORDER_CONFIRMATION_SELECTORS[fieldKey];

  return {
    "data-agent-field": selector.dataAgentField,
    "data-testid": selector.testId,
  };
}

function statusLabel(status: MockOrderConfirmationPayload["status"]) {
  return status.replace(/_/g, " ");
}

function statusTone(status: MockOrderConfirmationPayload["status"]) {
  if (status === "filled" || status === "submitted") {
    return "border-emerald-400/40 bg-emerald-400/10 text-emerald-100";
  }

  if (status === "partially_filled") {
    return "border-cyan-400/40 bg-cyan-400/10 text-cyan-100";
  }

  if (status === "rejected" || status === "cancelled") {
    return "border-amber-400/40 bg-amber-400/10 text-amber-100";
  }

  return "border-slate-600 bg-slate-800 text-slate-200";
}

function ConfirmationRow({
  fieldKey,
  label,
  value,
}: {
  fieldKey: MockOrderConfirmationFieldKey;
  label: string;
  value: string;
}) {
  return (
    <div
      className="rounded-md border border-slate-800 bg-slate-950/80 px-3 py-2"
      {...selectorProps(fieldKey)}
    >
      <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm font-medium text-slate-100">
        {value || "Not set"}
      </dd>
    </div>
  );
}

export function MockBrokerConfirmation({
  payload,
  validation,
}: MockBrokerConfirmationProps) {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
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
              <span
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-slate-200"
                {...selectorProps("safetyLabel")}
              >
                No real broker confirmation
              </span>
            </div>
            <h1 className="mt-4 text-3xl font-semibold text-white">
              Mock broker confirmation
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              Local execution sandbox page for testing a fake broker result
              screen. It does not create brokerResult, does not create
              execution records, does not write Supabase, and never changes real
              trade state.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              className="inline-flex w-fit rounded-md border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 hover:border-slate-500 hover:text-white"
              href="/mock-broker/order"
            >
              Mock order page
            </Link>
            <Link
              className="inline-flex w-fit rounded-md border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 hover:border-slate-500 hover:text-white"
              href="/settings"
            >
              Settings
            </Link>
          </div>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-lg border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/30">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Fake confirmation result
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  Review parsed fields
                </h2>
              </div>
              <span
                className={`w-fit rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${statusTone(
                  payload.status,
                )}`}
                {...selectorProps("status")}
              >
                {statusLabel(payload.status)}
              </span>
            </div>

            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              <ConfirmationRow
                fieldKey="ticker"
                label="Ticker"
                value={payload.ticker}
              />
              <ConfirmationRow
                fieldKey="action"
                label="Action"
                value={payload.action}
              />
              <ConfirmationRow
                fieldKey="orderMode"
                label="Order mode"
                value={payload.orderMode}
              />
              <ConfirmationRow
                fieldKey="account"
                label="Account"
                value={payload.account}
              />
              <ConfirmationRow
                fieldKey="quantity"
                label="Quantity"
                value={payload.quantity}
              />
              <ConfirmationRow
                fieldKey="requestedPrice"
                label="Requested price"
                value={payload.requestedPrice}
              />
              <ConfirmationRow
                fieldKey="executedPrice"
                label="Executed price"
                value={payload.executedPrice}
              />
              <ConfirmationRow
                fieldKey="priceCurrency"
                label="Price currency"
                value={payload.priceCurrency}
              />
              <ConfirmationRow
                fieldKey="instrumentMarket"
                label="Instrument market"
                value={payload.instrumentMarket}
              />
              <ConfirmationRow
                fieldKey="instrumentCurrency"
                label="Instrument currency"
                value={payload.instrumentCurrency}
              />
              <ConfirmationRow
                fieldKey="instrumentType"
                label="Instrument type"
                value={payload.instrumentType}
              />
              <ConfirmationRow
                fieldKey="amountExcludingFees"
                label="Amount excluding fees"
                value={payload.amountExcludingFees}
              />
              <ConfirmationRow
                fieldKey="courtage"
                label="Courtage"
                value={payload.courtage}
              />
              <ConfirmationRow
                fieldKey="fxFee"
                label="FX fee"
                value={payload.fxFee}
              />
              <ConfirmationRow
                fieldKey="preliminaryFxRate"
                label="Preliminary FX rate"
                value={payload.preliminaryFxRate}
              />
              <ConfirmationRow
                fieldKey="validUntil"
                label="Valid until"
                value={payload.validUntil}
              />
              <ConfirmationRow
                fieldKey="totalAmount"
                label="Total amount"
                value={payload.totalAmount}
              />
              <ConfirmationRow
                fieldKey="reviewButtonLabel"
                label="Review button label"
                value={payload.reviewButtonLabel}
              />
              <ConfirmationRow
                fieldKey="confirmButtonLabel"
                label="Final confirm label"
                value={payload.confirmButtonLabel}
              />
              <ConfirmationRow
                fieldKey="cancelButtonLabel"
                label="Cancel label"
                value={payload.cancelButtonLabel}
              />
              <ConfirmationRow
                fieldKey="orderId"
                label="Order ID"
                value={payload.orderId}
              />
              <ConfirmationRow
                fieldKey="requestId"
                label="Request ID"
                value={payload.requestId}
              />
              <ConfirmationRow
                fieldKey="intentId"
                label="Intent ID"
                value={payload.intentId}
              />
              <ConfirmationRow
                fieldKey="positionId"
                label="Position ID"
                value={payload.positionId}
              />
              <ConfirmationRow
                fieldKey="recommendationId"
                label="Recommendation ID"
                value={payload.recommendationId}
              />
              <div className="sm:col-span-2">
                <ConfirmationRow
                  fieldKey="message"
                  label="Message"
                  value={payload.message}
                />
              </div>
            </dl>
          </section>

          <aside className="space-y-6">
            <section className="rounded-lg border border-rose-400/30 bg-rose-950/20 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-rose-200">
                No real broker confirmation
              </p>
              <ul className="mt-4 space-y-2 text-sm leading-6 text-rose-100/90">
                <li>Not Avanza and not connected to any broker.</li>
                <li>No order is submitted, confirmed, rejected, or cancelled.</li>
                <li>No brokerResult or TureExecutionRecord is created.</li>
                <li>No Supabase writes and no real trade state mutation.</li>
              </ul>
            </section>

            <section className="rounded-lg border border-slate-800 bg-slate-900/80 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Final action labels
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                These controls are disabled readback labels only. This mock page
                cannot confirm, cancel, submit, or create broker records.
              </p>
              <div className="mt-4 grid gap-2">
                <button
                  className="rounded-md border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm font-semibold text-emerald-100 opacity-60"
                  disabled
                  type="button"
                >
                  {payload.confirmButtonLabel || "Confirm disabled"}
                </button>
                <button
                  className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-semibold text-slate-200 opacity-60"
                  disabled
                  type="button"
                >
                  {payload.cancelButtonLabel || "Cancel disabled"}
                </button>
              </div>
            </section>

            <SaveDevMockResultButton payload={payload} />

            <section className="rounded-lg border border-slate-800 bg-slate-900/80 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Contract validation
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Payload validation is local and diagnostic only. Warnings mean
                the mock query params are incomplete for future parsing tests.
              </p>
              <div className="mt-4 rounded-md border border-slate-800 bg-slate-950/80 p-3">
                <p className="text-sm font-semibold text-slate-100">
                  {validation.ok ? "Payload shape accepted" : "Payload invalid"}
                </p>
                {validation.errors.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs leading-5 text-amber-100">
                    {validation.errors.map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                )}
                {validation.warnings.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-400">
                    {validation.warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
