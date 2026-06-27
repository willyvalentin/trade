"use client";

import type {
  ExecutionRecordStoreReadResult,
  StoredExecutionRecord,
} from "@/lib/execution-record-store";

export type ExecutionLocalRecordsViewerProps = {
  readResult: ExecutionRecordStoreReadResult;
  visibleRecords: StoredExecutionRecord[];
  latestTimestamp: string | null;
  message: string;
  onRefresh: () => void;
  onClear: () => void;
};

export function ExecutionLocalRecordsViewer({
  readResult,
  visibleRecords,
  latestTimestamp,
  message,
  onRefresh,
  onClear,
}: ExecutionLocalRecordsViewerProps) {
  const hasRecords = readResult.records.length > 0;

  return (
    <section className="mt-6 rounded-lg border border-fuchsia-300/15 bg-fuchsia-300/[0.035] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-mono text-sm font-bold uppercase tracking-[0.16em] text-fuchsia-100">
            Execution Records
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Stored locally in this browser. Stub/dev records are not proof of
            real broker execution and do not affect History, Statistics, or live
            trades.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-full border border-white/10 bg-black/25 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300 transition hover:border-fuchsia-300/30 hover:text-fuchsia-100"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={onClear}
            disabled={!readResult.storageAvailable}
            className="rounded-full border border-rose-300/25 bg-rose-300/10 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-rose-100 transition hover:border-rose-200/40 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.035] disabled:text-zinc-600"
          >
            Clear execution records
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm leading-6 text-zinc-400 md:grid-cols-3">
        <div className="rounded-md border border-white/10 bg-black/25 p-3">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Total Records
          </div>
          <div className="mt-1 text-zinc-200">{readResult.records.length}</div>
        </div>
        <div className="rounded-md border border-white/10 bg-black/25 p-3">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Latest Record
          </div>
          <div className="mt-1 text-zinc-200">
            {formatDateTime(latestTimestamp)}
          </div>
        </div>
        <div className="rounded-md border border-white/10 bg-black/25 p-3">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Storage
          </div>
          <div className="mt-1 text-zinc-200">
            {readResult.storageAvailable ? "Local browser" : "Unavailable"}
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-zinc-500">
        Refresh reads the current local records store; clear removes only the
        local execution records key.
      </p>

      {readResult.error && (
        <p className="mt-3 rounded-md border border-amber-300/25 bg-amber-300/[0.08] p-3 text-sm leading-6 text-amber-100">
          Execution records could not be parsed safely: {readResult.error}
        </p>
      )}

      {readResult.discardedCount > 0 && (
        <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
          Ignored {readResult.discardedCount} malformed execution record
          {readResult.discardedCount === 1 ? "" : "s"}.
        </p>
      )}

      {message && (
        <p className="mt-3 rounded-md border border-white/10 bg-black/20 p-3 text-sm leading-6 text-zinc-300">
          {message}
        </p>
      )}

      <div className="mt-4 space-y-2">
        {!hasRecords ? (
          <div className="rounded-md border border-dashed border-white/10 bg-black/20 p-4 text-sm leading-6 text-zinc-500">
            No local execution records are stored in this browser yet.
          </div>
        ) : (
          visibleRecords.map((record) => (
            <ExecutionRecordRow key={record.recordId} record={record} />
          ))
        )}
      </div>
    </section>
  );
}

function ExecutionRecordRow({ record }: { record: StoredExecutionRecord }) {
  const triggerType = executionRecordTriggerType(record);
  const rawBrokerSummary = executionRecordRawBrokerSummary(record);

  return (
    <article className="rounded-md border border-white/10 bg-black/20 p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-fuchsia-300/20 bg-fuchsia-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-fuchsia-100">
              {record.captureStatus}
            </span>
            {record.brokerStatus && (
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
                {record.brokerStatus}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            {record.reason}
          </p>
        </div>
        <time className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
          {formatDateTime(record.createdAt)}
        </time>
      </div>

      <div className="mt-3 grid gap-2 text-xs leading-5 text-zinc-400 sm:grid-cols-2 lg:grid-cols-4">
        <AuditDetail label="Ticker" value={record.ticker} />
        <AuditDetail label="Action" value={record.action} />
        <AuditDetail label="Mode" value={record.mode} />
        <AuditDetail label="Trigger" value={triggerType} />
        <AuditDetail
          label="Quantity"
          value={formatExecutionRecordNumber(record.quantity)}
        />
        <AuditDetail
          label="Requested"
          value={formatExecutionRecordNumber(record.requestedPrice)}
        />
        <AuditDetail
          label="Executed"
          value={formatExecutionRecordNumber(record.executedPrice)}
        />
        <AuditDetail label="Order" value={record.orderId} />
        <AuditDetail label="Intent" value={shortExecutionAuditId(record.intentId)} />
        <AuditDetail
          label="Position"
          value={shortExecutionAuditId(record.positionId)}
        />
        <AuditDetail
          label="Recommendation"
          value={shortExecutionAuditId(record.recommendationId)}
        />
        <AuditDetail label="Record" value={shortExecutionAuditId(record.recordId)} />
      </div>

      <details className="mt-3 rounded-md border border-white/10 bg-white/[0.025] p-3">
        <summary className="cursor-pointer font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
          Broker result / record JSON
        </summary>
        {rawBrokerSummary && (
          <p className="mt-3 rounded-md border border-amber-300/15 bg-amber-300/[0.06] p-3 text-xs leading-5 text-amber-100">
            {rawBrokerSummary}
          </p>
        )}
        <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-zinc-400">
          {JSON.stringify(record, null, 2)}
        </pre>
      </details>
    </article>
  );
}

function AuditDetail({
  label,
  value,
}: {
  label: string;
  value: string | number | boolean | null | undefined;
}) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.025] p-2">
      <div className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-600">
        {label}
      </div>
      <div className="mt-1 break-words text-zinc-300">
        {executionAuditValue(value)}
      </div>
    </div>
  );
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not recorded";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function shortExecutionAuditId(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  return value.length > 14 ? `${value.slice(0, 6)}…${value.slice(-4)}` : value;
}

function executionAuditValue(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return String(value);
}

function formatExecutionRecordNumber(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "—";
  }

  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 4,
  }).format(value);
}

function executionRecordTriggerType(record: StoredExecutionRecord) {
  return record.intent?.trigger_type ?? null;
}

function executionRecordRawBrokerSummary(record: StoredExecutionRecord) {
  const brokerResult = record.brokerResult as
    | (Record<string, unknown> & { rawBrokerSummary?: unknown })
    | null;

  return typeof brokerResult?.rawBrokerSummary === "string"
    ? brokerResult.rawBrokerSummary
    : null;
}
