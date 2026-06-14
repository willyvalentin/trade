import type { ReactNode } from "react";
import Image from "next/image";

export type ExecutionHandoffModalShellProps = {
  children: ReactNode;
  onClose: () => void;
  title?: string;
  titleId?: string;
};

export function ExecutionHandoffModalShell({
  children,
  onClose,
  title = "Execution Handoff Preview",
  titleId = "trade-execution-handoff-preview-title",
}: ExecutionHandoffModalShellProps) {
  return (
    <div
      className="trade-recommendation-details-backdrop"
      role="presentation"
      onClick={(event) => {
        event.stopPropagation();
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      onMouseDown={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <section
        aria-labelledby={titleId}
        aria-modal="true"
        className="trade-recommendation-details-modal trade-live-details-modal"
        role="dialog"
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="trade-recommendation-details-titlebar">
          <h2 id={titleId}>{title}</h2>
          <button
            type="button"
            aria-label="Close execution handoff preview"
            onClick={(event) => {
              event.stopPropagation();
              onClose();
            }}
            className="trade-recommendation-details-close"
          >
            <Image
              src="/trade-assets/x-icn.svg"
              alt=""
              aria-hidden="true"
              width={29}
              height={29}
            />
          </button>
        </div>

        <div className="trade-recommendation-details-scroll">{children}</div>
      </section>
    </div>
  );
}
