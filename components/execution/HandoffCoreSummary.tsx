import type { ReactNode } from "react";

export type HandoffCoreSummaryProps = {
  authorityMessage: string;
  handoffStatusLabel: string;
  handoffStatusToneClassName: string;
  identity: ReactNode;
  statusBadgeClassName: string;
  statusDescription: string;
  statusLabel: string;
  statusPanelClassName: string;
  statusTitle: string;
};

export function HandoffCoreSummary({
  authorityMessage,
  handoffStatusLabel,
  handoffStatusToneClassName,
  identity,
  statusBadgeClassName,
  statusDescription,
  statusLabel,
  statusPanelClassName,
  statusTitle,
}: HandoffCoreSummaryProps) {
  return (
    <>
      <header className="trade-recommendation-details-header">
        {identity}
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <span
            className={`inline-flex rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${statusBadgeClassName}`}
          >
            {statusLabel}
          </span>
          <span
            className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${handoffStatusToneClassName}`}
          >
            {handoffStatusLabel}
          </span>
        </div>
      </header>

      <div className={`rounded-md border p-4 ${statusPanelClassName}`}>
        <p className="text-sm font-semibold text-zinc-100">{statusTitle}</p>
        <p className="mt-2 text-sm leading-6 text-zinc-300">
          {statusDescription}
        </p>
        <p className="mt-3 text-xs leading-5 text-zinc-400">
          {authorityMessage}
        </p>
      </div>
    </>
  );
}
