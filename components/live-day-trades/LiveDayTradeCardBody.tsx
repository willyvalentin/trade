import type {
  KeyboardEvent,
  MouseEvent,
  ReactNode,
} from "react";

import type { LiveDayTradeDisplayProps } from "@/components/live-day-trades/live-day-trade-display-mapper";

export type LiveDayTradeCardBodyProps = {
  actionLabel: string;
  detailsModal?: ReactNode;
  display: LiveDayTradeDisplayProps;
  executionPreviewModal?: ReactNode;
  identity: ReactNode;
  isCloseDisabled: boolean;
  metricGrid: ReactNode;
  onClosePositionClick: (event: MouseEvent<HTMLButtonElement>) => void;
  onOpenDetails: () => void;
  onOpenDetailsKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  realityBadgeRow: ReactNode;
  statusSurface?: ReactNode;
};

export function LiveDayTradeCardBody({
  actionLabel,
  detailsModal,
  display,
  executionPreviewModal,
  identity,
  isCloseDisabled,
  metricGrid,
  onClosePositionClick,
  onOpenDetails,
  onOpenDetailsKeyDown,
  realityBadgeRow,
  statusSurface,
}: LiveDayTradeCardBodyProps) {
  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={display.ariaLabel}
      onClick={onOpenDetails}
      onKeyDown={onOpenDetailsKeyDown}
      className={`trade-live-card ${display.cardClassName}`}
    >
      <div className="trade-live-card__header">
        {identity}
        <div className="flex flex-col items-start gap-2 sm:items-end">
          {realityBadgeRow}
          {display.isPartiallyClosed && (
            <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-100">
              Partially Closed
            </span>
          )}
          <span className={`trade-live-action-pill ${display.actionPillClassName}`}>
            {actionLabel}
          </span>
        </div>
      </div>

      {metricGrid}

      <div className="trade-live-guidance">
        <p>
          {display.guidancePrimaryMessage}
          <span className="mt-1 block text-xs leading-5 text-zinc-500">
            {display.guidanceNextStep}
          </span>
          {display.partialCloseMessage && (
            <span className="mt-1 block text-xs leading-5 text-cyan-100">
              {display.partialCloseMessage}
            </span>
          )}
          {display.profitFadeMessage && (
            <span className="mt-1 block text-xs leading-5 text-amber-100">
              {display.profitFadeMessage}
            </span>
          )}
        </p>
        <span>Updated {display.updatedAtDisplay}</span>
      </div>

      {statusSurface}

      <div className="trade-live-card__footer">
        <button
          type="button"
          onClick={onClosePositionClick}
          disabled={isCloseDisabled}
          className={`trade-live-close-button ${display.closeButtonTone}`}
        >
          {display.closeButtonLabel}
        </button>
      </div>

      {detailsModal}

      {executionPreviewModal}
    </article>
  );
}
