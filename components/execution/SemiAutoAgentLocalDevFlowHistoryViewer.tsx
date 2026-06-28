"use client";

import type {
  SemiAutoAgentLocalDevFlowEvent,
  SemiAutoAgentLocalDevFlowReadResult,
} from "@/lib/semi-auto-agent-local-dev-flow-store";

export type SemiAutoAgentLocalDevFlowHistoryViewerProps = {
  readResult: SemiAutoAgentLocalDevFlowReadResult;
  visibleEvents: SemiAutoAgentLocalDevFlowEvent[];
  latestTimestamp: string | null;
  message: string;
  onRefresh: () => void;
  onClear: () => void;
};

export function SemiAutoAgentLocalDevFlowHistoryViewer({
  readResult,
  visibleEvents,
  latestTimestamp,
  message,
  onRefresh,
  onClear,
}: SemiAutoAgentLocalDevFlowHistoryViewerProps) {
  const hasEvents = readResult.items.length > 0;

  return (
    <section className="mt-6 rounded-lg border border-sky-300/15 bg-sky-300/[0.035] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-sky-300/30 bg-sky-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-sky-100">
              Local dev history only
            </span>
            <h3 className="font-mono text-sm font-bold uppercase tracking-[0.16em] text-sky-100">
              Semi-Auto Agent Local Dev Flow History
            </h3>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
            Browser-local review history for semi-auto handoff previews and
            local result capture outcomes. Not sent to Supabase, not an audit
            record, no Avanza order, and no broker action.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-full border border-white/10 bg-black/25 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300 transition hover:border-sky-300/30 hover:text-sky-100"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={onClear}
            disabled={!readResult.storageAvailable}
            className="rounded-full border border-rose-300/25 bg-rose-300/10 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-rose-100 transition hover:border-rose-200/40 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.035] disabled:text-zinc-600"
          >
            Clear local dev flow history
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm leading-6 text-zinc-400 md:grid-cols-3">
        <HistoryMetric label="Total Events" value={readResult.items.length} />
        <HistoryMetric
          label="Latest Local Event"
          value={formatDateTime(latestTimestamp)}
        />
        <HistoryMetric
          label="Storage"
          value={readResult.storageAvailable ? "Local browser" : "Unavailable"}
        />
      </div>

      <p className="mt-3 text-xs leading-5 text-zinc-500">
        Refresh reads only the browser-local semi-auto dev flow store; clear
        removes only that local history key.
      </p>

      {readResult.error && (
        <p className="mt-3 rounded-md border border-amber-300/25 bg-amber-300/[0.08] p-3 text-sm leading-6 text-amber-100">
          Semi-auto local dev flow history could not be parsed safely:{" "}
          {readResult.error}
        </p>
      )}

      {readResult.discardedCount > 0 && (
        <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
          Ignored {readResult.discardedCount} malformed semi-auto local dev
          flow event{readResult.discardedCount === 1 ? "" : "s"}.
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
            No semi-auto local dev flow history is stored in this browser yet.
          </div>
        ) : (
          visibleEvents.map((event) => (
            <SemiAutoLocalDevFlowHistoryRow event={event} key={event.event_id} />
          ))
        )}
      </div>
    </section>
  );
}

function SemiAutoLocalDevFlowHistoryRow({
  event,
}: {
  event: SemiAutoAgentLocalDevFlowEvent;
}) {
  return (
    <article className="rounded-md border border-white/10 bg-black/20 p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-sky-300/20 bg-sky-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-sky-100">
              {event.dev_flow_state}
            </span>
            {event.terminal_local_outcome && (
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
                {event.terminal_local_outcome}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Local dev history only. Not sent to Supabase, not an audit record,
            no Avanza order, and no broker action.
          </p>
        </div>
        <time className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
          {formatDateTime(event.created_at)}
        </time>
      </div>

      <div className="mt-3 grid gap-2 text-xs leading-5 text-zinc-400 sm:grid-cols-2 lg:grid-cols-4">
        <HistoryDetail label="Payload" value={shortId(event.payload_id)} />
        <HistoryDetail label="Ticker" value={event.ticker} />
        <HistoryDetail label="Action" value={event.action} />
        <HistoryDetail label="Quantity" value={formatNumber(event.quantity)} />
        <HistoryDetail
          label="Selected Result"
          value={event.selected_local_result}
        />
        <HistoryDetail
          label="Terminal Outcome"
          value={event.terminal_local_outcome}
        />
        <HistoryDetail label="Source" value={event.source_context} />
        <HistoryDetail label="Event" value={shortId(event.event_id)} />
      </div>

      <div className="mt-3 grid gap-2 text-xs leading-5 text-zinc-400 sm:grid-cols-2 lg:grid-cols-4">
        <HistoryDetail label="Local Only" value={event.local_only} />
        <HistoryDetail label="Dev Only" value={event.dev_only} />
        <HistoryDetail
          label="Manual Confirmation"
          value={event.manual_final_confirmation_required}
        />
        <HistoryDetail
          label="Automatic Submit Allowed"
          value={event.automatic_submit_allowed}
        />
        <HistoryDetail
          label="Automatic Submit Attempted"
          value={event.automatic_submit_attempted}
        />
        <HistoryDetail label="No Avanza Order" value={event.no_avanza_order_placed} />
        <HistoryDetail
          label="No Broker Submit"
          value={event.no_broker_submit_attempted}
        />
        <HistoryDetail label="Not Supabase" value={event.not_sent_to_supabase} />
        <HistoryDetail label="Not Audit" value={event.not_audit_record} />
        <HistoryDetail
          label="Trade/PnL Mutated"
          value={event.trade_stats_pnl_mutated}
        />
      </div>

      {(event.warnings.length > 0 || event.blocked_reasons.length > 0) && (
        <details className="mt-3 rounded-md border border-white/10 bg-white/[0.025] p-3">
          <summary className="cursor-pointer font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
            Warnings and blocked reasons
          </summary>
          {event.warnings.length > 0 && (
            <HistoryList title="Warnings" items={event.warnings} />
          )}
          {event.blocked_reasons.length > 0 && (
            <HistoryList title="Blocked reasons" items={event.blocked_reasons} />
          )}
        </details>
      )}
    </article>
  );
}

function HistoryMetric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-md border border-white/10 bg-black/25 p-3">
      <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </div>
      <div className="mt-1 text-zinc-200">{value}</div>
    </div>
  );
}

function HistoryDetail({
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
        {displayValue(value)}
      </div>
    </div>
  );
}

function HistoryList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-3">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
        {title}
      </p>
      <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-400">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
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

function shortId(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  return value.length > 14 ? `${value.slice(0, 6)}…${value.slice(-4)}` : value;
}

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "—";
  }

  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 4,
  }).format(value);
}

function displayValue(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return String(value);
}
