import { Detail } from "@/components/execution/handoff-modal-shared";
import type { BrokerExecutionCaptureResult } from "@/lib/broker-execution-capture";
import type { BrokerExecutionStatus } from "@/lib/execution";

export type ExecutionBrokerCaptureStubPanelProps = {
  agentCommandValue: (value: string | number | boolean | null | undefined) => string;
  brokerTimestamp: string;
  brokerStatus: BrokerExecutionStatus;
  canRunCaptureStub: boolean;
  captureResult: BrokerExecutionCaptureResult | null;
  currentLifecycleLabel: string;
  currentLifecycleToneClassName: string;
  executedPrice: string;
  formatCurrency: (value: number | null | undefined) => string;
  formatShares: (value: number | null | undefined) => string;
  message: string;
  onBrokerStatusChange: (status: BrokerExecutionStatus) => void;
  onBrokerTimestampChange: (value: string) => void;
  onCaptureStubBrokerResult: () => void;
  onExecutedPriceChange: (value: string) => void;
  onOrderIdChange: (value: string) => void;
  orderId: string;
  shortPayloadId: (value: string | null) => string;
  error: string;
};

export function ExecutionBrokerCaptureStubPanel({
  agentCommandValue,
  brokerTimestamp,
  brokerStatus,
  canRunCaptureStub,
  captureResult,
  currentLifecycleLabel,
  currentLifecycleToneClassName,
  executedPrice,
  formatCurrency,
  formatShares,
  message,
  onBrokerStatusChange,
  onBrokerTimestampChange,
  onCaptureStubBrokerResult,
  onExecutedPriceChange,
  onOrderIdChange,
  orderId,
  shortPayloadId,
  error,
}: ExecutionBrokerCaptureStubPanelProps) {
  return (
    <div className="rounded-md border border-fuchsia-300/20 bg-fuchsia-300/[0.045] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-fuchsia-300/30 bg-fuchsia-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-fuchsia-100">
              DEV ONLY
            </span>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-fuchsia-100">
              Broker result capture stub
            </p>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Test Ture&apos;s capture pipeline without Avanza. This does not
            confirm a real KÖP/SÄLJ, update the trade, close the position, or
            write to Supabase.
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${currentLifecycleToneClassName}`}
        >
          {currentLifecycleLabel}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Broker status
          </span>
          <select
            value={brokerStatus}
            disabled={!canRunCaptureStub}
            onChange={(event) =>
              onBrokerStatusChange(event.target.value as BrokerExecutionStatus)
            }
            className="mt-2 min-h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none transition focus:border-fuchsia-300 disabled:cursor-not-allowed disabled:text-zinc-600"
          >
            <option value="submitted">Submitted</option>
            <option value="filled">Filled</option>
            <option value="partially_filled">Partially filled</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
            <option value="unknown">Unknown</option>
          </select>
        </label>

        <label className="block">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Executed price
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={executedPrice}
            disabled={!canRunCaptureStub}
            onChange={(event) => onExecutedPriceChange(event.target.value)}
            placeholder="Optional"
            className="mt-2 min-h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none placeholder:text-zinc-600 transition focus:border-fuchsia-300 disabled:cursor-not-allowed disabled:text-zinc-600"
          />
        </label>

        <label className="block">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Order id
          </span>
          <input
            value={orderId}
            disabled={!canRunCaptureStub}
            onChange={(event) => onOrderIdChange(event.target.value)}
            placeholder="Optional local stub id"
            className="mt-2 min-h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none placeholder:text-zinc-600 transition focus:border-fuchsia-300 disabled:cursor-not-allowed disabled:text-zinc-600"
          />
        </label>

        <label className="block">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Broker timestamp
          </span>
          <input
            value={brokerTimestamp}
            disabled={!canRunCaptureStub}
            onChange={(event) => onBrokerTimestampChange(event.target.value)}
            placeholder="Optional, defaults to now"
            className="mt-2 min-h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none placeholder:text-zinc-600 transition focus:border-fuchsia-300 disabled:cursor-not-allowed disabled:text-zinc-600"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-zinc-500">
          Capturing creates a modal-local execution record and a local audit
          event only. It is not production broker evidence.
        </p>
        <button
          type="button"
          disabled={!canRunCaptureStub}
          onClick={(event) => {
            event.stopPropagation();
            onCaptureStubBrokerResult();
          }}
          className="min-h-10 rounded-md border border-fuchsia-300/25 bg-fuchsia-300/10 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-fuchsia-100 transition hover:border-fuchsia-200/50 hover:bg-fuchsia-300/15 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.035] disabled:text-zinc-600"
        >
          Capture stub broker result
        </button>
      </div>

      {message && (
        <p className="mt-3 rounded-md border border-cyan-300/20 bg-cyan-300/[0.06] p-3 text-sm leading-6 text-cyan-100">
          {message}
        </p>
      )}

      {error && (
        <p className="mt-3 rounded-md border border-rose-300/25 bg-rose-300/[0.08] p-3 text-sm leading-6 text-rose-100">
          {error}
        </p>
      )}

      {captureResult && (
        <div className="mt-4 rounded-md border border-white/10 bg-black/25 p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-zinc-300">
                Local capture result
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                {captureResult.reason}
              </p>
            </div>
            <span className="w-fit rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
              {captureResult.captureStatus}
            </span>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <Detail
              label="Record"
              value={shortPayloadId(captureResult.record.recordId)}
            />
            <Detail
              label="Broker Status"
              value={agentCommandValue(captureResult.record.brokerStatus)}
            />
            <Detail label="Ticker" value={captureResult.record.ticker ?? "—"} />
            <Detail
              label="Quantity"
              value={formatShares(captureResult.record.quantity)}
            />
            <Detail
              label="Requested Price"
              value={formatCurrency(captureResult.record.requestedPrice)}
            />
            <Detail
              label="Executed Price"
              value={formatCurrency(captureResult.record.executedPrice)}
            />
            <Detail
              label="Order Id"
              value={captureResult.record.orderId ?? "—"}
            />
            <Detail label="Lifecycle" value={currentLifecycleLabel} />
            <Detail label="Reason" value={captureResult.record.reason} />
          </div>
        </div>
      )}
    </div>
  );
}
