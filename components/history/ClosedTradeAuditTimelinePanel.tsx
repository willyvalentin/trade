import type { ReactNode } from "react";

export type ClosedTradeAuditTimelinePanelProps = {
  children: ReactNode;
};

export function ClosedTradeAuditTimelinePanel({
  children,
}: ClosedTradeAuditTimelinePanelProps) {
  return (
    <details className="rounded-md border border-white/10 bg-black/20 p-4">
      <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
        Audit details
      </summary>
      <div className="mt-4 space-y-4">{children}</div>
      <p className="mt-3 text-xs leading-5 text-zinc-500">
        History explanations are based on available structured data and may be
        incomplete.
      </p>
    </details>
  );
}
