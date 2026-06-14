import type { ExecutionSandboxQaItem } from "@/lib/handoff-modal-data-mappers";
import { formatAgentCommandLabel } from "@/components/execution/handoff-modal-shared";

export type ExecutionSandboxQaOverallStatus =
  | "ready"
  | "blocked"
  | "incomplete";

export type ExecutionSandboxQaPanelProps = {
  items: ExecutionSandboxQaItem[];
  overallMessage: string;
  overallStatus: ExecutionSandboxQaOverallStatus;
};

function qaTone(status: ExecutionSandboxQaItem["status"]) {
  if (status === "pass") {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "warn") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  if (status === "fail") {
    return "border-rose-300/30 bg-rose-300/10 text-rose-100";
  }

  return "border-white/10 bg-white/[0.04] text-zinc-400";
}

function overallTone(status: ExecutionSandboxQaOverallStatus) {
  if (status === "ready") {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "blocked") {
    return "border-rose-300/30 bg-rose-300/10 text-rose-100";
  }

  return "border-amber-300/30 bg-amber-300/10 text-amber-100";
}

export function ExecutionSandboxQaPanel({
  items,
  overallMessage,
  overallStatus,
}: ExecutionSandboxQaPanelProps) {
  return (
    <div className="rounded-md border border-lime-300/15 bg-lime-300/[0.04] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-lime-300/30 bg-lime-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-lime-100">
              DEV ONLY
            </span>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-lime-100">
              Execution Sandbox QA
            </p>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Local checklist for the typed execution sandbox chain. No external
            bridge is connected, no Avanza session will open, and no broker
            order can be created from this panel.
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${overallTone(
            overallStatus,
          )}`}
        >
          {formatAgentCommandLabel(overallStatus)}
        </span>
      </div>

      <p className="mt-3 rounded-md border border-white/10 bg-black/20 p-3 text-sm leading-6 text-zinc-300">
        {overallMessage}
      </p>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-md border border-white/10 bg-black/25 p-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                {item.label}
              </p>
              <span
                className={`rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] ${qaTone(
                  item.status,
                )}`}
              >
                {formatAgentCommandLabel(item.status)}
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-zinc-300">
              {item.message}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs leading-5 text-zinc-500">
        QA status is derived in memory from this modal only. It is not
        persisted, logged, sent to a bridge, or used to change trade state.
      </p>
    </div>
  );
}
