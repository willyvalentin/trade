import { Detail } from "@/components/execution/handoff-modal-shared";
import type {
  AvanzaBridgeReadinessSummary,
  AvanzaBridgeReadinessSummarySeverity,
} from "@/lib/avanza-bridge-readiness-checklist";

export type AvanzaReadOnlyReadinessBadgeProps = {
  summary: AvanzaBridgeReadinessSummary;
};

function displayValue(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value).replaceAll("_", " ");
}

function summarySeverityTone(severity: AvanzaBridgeReadinessSummarySeverity) {
  if (severity === "success") {
    return "border-emerald-300/25 bg-emerald-300/10 text-emerald-100";
  }

  if (severity === "warning") {
    return "border-sky-300/25 bg-sky-300/10 text-sky-100";
  }

  if (severity === "danger") {
    return "border-rose-300/25 bg-rose-300/10 text-rose-100";
  }

  return "border-white/10 bg-white/[0.04] text-zinc-300";
}

export function AvanzaReadOnlyReadinessBadge({
  summary,
}: AvanzaReadOnlyReadinessBadgeProps) {
  return (
    <div className="rounded-md border border-white/10 bg-black/20 p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-300">
            Read-only readiness summary
          </p>
          <p className="mt-2 text-sm font-semibold text-zinc-100">
            {summary.label}
          </p>
          <p className="mt-1 text-sm leading-6 text-zinc-300">
            {summary.shortCopy}
          </p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
            Read-only observation, not execution readiness or an order action
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${summarySeverityTone(
            summary.severity,
          )}`}
        >
          {displayValue(summary.status)}
        </span>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Detail label="Ready" value={displayValue(summary.ready_count)} />
        <Detail label="Blocked" value={displayValue(summary.blocked_count)} />
        <Detail
          label="Advisory"
          value={displayValue(summary.advisory_count)}
        />
        <Detail label="Unknown" value={displayValue(summary.unknown_count)} />
      </div>
    </div>
  );
}
