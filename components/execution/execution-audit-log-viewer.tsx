"use client";

import type {
  ExecutionAuditEvent,
  ExecutionEventLogReadResult,
} from "@/lib/execution-event-log";

export type ExecutionAuditLogViewerProps = {
  readResult: ExecutionEventLogReadResult;
  visibleEvents: ExecutionAuditEvent[];
  latestTimestamp: string | null;
  message: string;
  onRefresh: () => void;
  onClear: () => void;
};

export function ExecutionAuditLogViewer({
  readResult,
  visibleEvents,
  latestTimestamp,
  message,
  onRefresh,
  onClear,
}: ExecutionAuditLogViewerProps) {
  const hasEvents = readResult.events.length > 0;

  return (
    <section className="mt-6 rounded-lg border border-cyan-300/15 bg-cyan-300/[0.035] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-mono text-sm font-bold uppercase tracking-[0.16em] text-cyan-100">
            Execution Event Log
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Local browser audit data for execution handoff diagnostics. No
            broker orders are executed from this log.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-full border border-white/10 bg-black/25 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300 transition hover:border-cyan-300/30 hover:text-cyan-100"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={onClear}
            disabled={!readResult.storageAvailable}
            className="rounded-full border border-rose-300/25 bg-rose-300/10 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-rose-100 transition hover:border-rose-200/40 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.035] disabled:text-zinc-600"
          >
            Clear execution event log
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm leading-6 text-zinc-400 md:grid-cols-3">
        <div className="rounded-md border border-white/10 bg-black/25 p-3">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Total Events
          </div>
          <div className="mt-1 text-zinc-200">{readResult.events.length}</div>
        </div>
        <div className="rounded-md border border-white/10 bg-black/25 p-3">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Latest Event
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
        Stored locally in this browser. Refresh reads the current local log;
        clear removes only execution audit events.
      </p>

      {readResult.error && (
        <p className="mt-3 rounded-md border border-amber-300/25 bg-amber-300/[0.08] p-3 text-sm leading-6 text-amber-100">
          Event log could not be parsed safely: {readResult.error}
        </p>
      )}

      {readResult.discardedCount > 0 && (
        <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
          Ignored {readResult.discardedCount} malformed execution audit event
          {readResult.discardedCount === 1 ? "" : "s"}.
        </p>
      )}

      {message && (
        <p className="mt-3 rounded-md border border-white/10 bg-black/20 p-3 text-sm leading-6 text-zinc-300">
          {message}
        </p>
      )}

      <div className="mt-4 space-y-2">
        {!hasEvents ? (
          <div className="rounded-md border border-dashed border-white/10 bg-black/20 p-4 text-sm leading-6 text-zinc-500">
            No execution audit events are stored in this browser yet.
          </div>
        ) : (
          visibleEvents.map((event) => (
            <ExecutionAuditLogRow event={event} key={event.eventId} />
          ))
        )}
      </div>
    </section>
  );
}

function ExecutionAuditLogRow({ event }: { event: ExecutionAuditEvent }) {
  const status = event.handoffStatus ?? event.brokerStatus;

  return (
    <article className="rounded-md border border-white/10 bg-black/20 p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-100">
              {event.type}
            </span>
            {status && (
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
                {status}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            {event.message ?? "Execution audit event recorded locally."}
          </p>
        </div>
        <time className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
          {formatDateTime(event.createdAt)}
        </time>
      </div>

      <div className="mt-3 grid gap-2 text-xs leading-5 text-zinc-400 sm:grid-cols-2 lg:grid-cols-4">
        <AuditDetail label="Ticker" value={event.ticker} />
        <AuditDetail label="Action" value={event.action} />
        <AuditDetail label="Mode" value={event.mode} />
        <AuditDetail label="Trigger" value={event.triggerType} />
        <AuditDetail
          label="Intent"
          value={shortExecutionAuditId(event.intentId)}
        />
        <AuditDetail
          label="Position"
          value={shortExecutionAuditId(event.positionId)}
        />
        <AuditDetail
          label="Recommendation"
          value={shortExecutionAuditId(event.recommendationId)}
        />
        <AuditDetail label="Broker" value={event.broker} />
      </div>

      {event.metadata && (
        <details className="mt-3 rounded-md border border-white/10 bg-white/[0.025] p-3">
          <summary className="cursor-pointer font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
            Metadata
          </summary>
          <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-zinc-400">
            {JSON.stringify(event.metadata, null, 2)}
          </pre>
        </details>
      )}
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
