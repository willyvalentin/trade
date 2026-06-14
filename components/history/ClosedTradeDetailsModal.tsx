"use client";

import { useEffect, type ReactNode } from "react";

export type ClosedTradeDetailsModalProps = {
  children: ReactNode;
  identity: ReactNode;
  onClose: () => void;
  status?: ReactNode;
};

export function ClosedTradeDetailsModal({
  children,
  identity,
  onClose,
  status,
}: ClosedTradeDetailsModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-5"
      onMouseDown={(event) => {
        event.stopPropagation();
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      onClick={(event) => {
        event.stopPropagation();
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-lg border border-white/10 bg-[#0b0c0c] p-5 shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div className="min-w-0">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Closed Trade details
            </p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              {identity}
              {status && <div className="shrink-0">{status}</div>}
            </div>
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onClose();
            }}
            className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 font-mono text-xs uppercase tracking-[0.12em] text-zinc-400 transition hover:border-white/20 hover:text-white"
          >
            X
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
