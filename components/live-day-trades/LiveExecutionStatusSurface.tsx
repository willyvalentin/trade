import type {
  ExecutionUiBadgeTone,
  ExecutionUiSeverity,
  ExecutionUiStatus,
} from "@/lib/execution-ui-status";

export type LiveExecutionStatusSurfaceProps = {
  onViewHandoff?: () => void;
  status: ExecutionUiStatus;
};

function executionUiStatusPanelClassName(severity: ExecutionUiSeverity) {
  if (severity === "danger") {
    return "border-rose-300/30 bg-rose-300/[0.08]";
  }

  if (severity === "success") {
    return "border-emerald-300/25 bg-emerald-300/[0.08]";
  }

  if (severity === "warning") {
    return "border-amber-300/25 bg-amber-300/[0.08]";
  }

  if (severity === "info") {
    return "border-cyan-300/20 bg-cyan-300/[0.06]";
  }

  return "border-white/10 bg-white/[0.035]";
}

function executionUiStatusBadgeClassName(tone: ExecutionUiBadgeTone) {
  if (tone === "danger") {
    return "border-rose-300/40 bg-rose-300/15 text-rose-100";
  }

  if (tone === "success") {
    return "border-emerald-300/35 bg-emerald-300/10 text-emerald-100";
  }

  if (tone === "warning") {
    return "border-amber-300/35 bg-amber-300/10 text-amber-100";
  }

  if (tone === "info") {
    return "border-cyan-300/30 bg-cyan-300/10 text-cyan-100";
  }

  return "border-white/10 bg-white/[0.04] text-zinc-300";
}

function executionModeUiLabel(mode: ExecutionUiStatus["mode"]) {
  if (mode === "automatic") {
    return "Automatic";
  }

  if (mode === "semi_automatic") {
    return "Semi-auto";
  }

  return null;
}

export function LiveExecutionStatusSurface({
  status,
  onViewHandoff,
}: LiveExecutionStatusSurfaceProps) {
  const modeLabel = executionModeUiLabel(status.mode);
  const nextAction =
    status.ctaLabel ??
    (status.canPrepareOrder ? "Prepare in Avanza" : null);

  return (
    <div
      className={`mx-5 mt-4 rounded-md border p-3 ${executionUiStatusPanelClassName(
        status.severity,
      )}`}
      aria-label={`${status.title}: ${status.description}`}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span
            className={`inline-flex rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${executionUiStatusBadgeClassName(
              status.badgeTone,
            )}`}
          >
            {status.label}
          </span>
          <p className="mt-2 text-sm font-semibold text-zinc-100">
            {status.title}
          </p>
        </div>
        {modeLabel && (
          <span className="w-fit rounded-full border border-white/10 bg-black/20 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400">
            {modeLabel}
          </span>
        )}
      </div>
      <p className="mt-2 text-xs leading-5 text-zinc-300">
        {status.description}
      </p>
      {nextAction && (
        <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400">
          Next action: {nextAction}
          {status.canSubmitFinalOrder
            ? " · Final submit allowed by authority"
            : ""}
        </p>
      )}
      {onViewHandoff && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onViewHandoff();
          }}
          className="mt-3 rounded-md border border-white/15 bg-black/20 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-200 transition hover:border-cyan-300/30 hover:text-cyan-100"
        >
          View handoff
        </button>
      )}
    </div>
  );
}
