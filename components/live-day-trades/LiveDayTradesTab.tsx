import type { ReactNode } from "react";

import { EmptyState } from "@/components/execution/handoff-modal-shared";

export type LiveDayTradesTabProps = {
  children: ReactNode;
  continuedItems?: ReactNode;
  emptyMessage: string;
  fixturePanel: ReactNode;
  hasTrades: boolean;
  isLoading: boolean;
  statusbar: ReactNode;
};

export function LiveDayTradesTab({
  children,
  continuedItems,
  emptyMessage,
  fixturePanel,
  hasTrades,
  isLoading,
  statusbar,
}: LiveDayTradesTabProps) {
  return (
    <section className="trade-live-section">
      {statusbar}

      {fixturePanel}

      {isLoading ? (
        <div className="trade-live-grid">
          <EmptyState
            title="Loading live day trades"
            message="Trade is reading your open Supabase positions."
          />
        </div>
      ) : !hasTrades ? (
        <div className="trade-live-grid">
          <EmptyState title="No live day trades" message={emptyMessage} />
        </div>
      ) : (
        <>
          <div className="trade-live-grid">{children}</div>

          {continuedItems && (
            <>
              <div className="trade-live-divider" aria-hidden="true" />
              <div className="trade-live-grid trade-live-grid--continued">
                {continuedItems}
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}
