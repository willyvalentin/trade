import { useEffect } from "react";

export type DiscardRecommendationModalProps = {
  companyName?: string | null;
  isSaving: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
  ticker: string;
};

function discardRecommendationDisplayValue(value: unknown, fallback = "—") {
  if (value === null || value === undefined) {
    return fallback;
  }

  const text = String(value).trim();
  return text.length > 0 ? text : fallback;
}

export function DiscardRecommendationModal({
  ticker,
  companyName,
  isSaving,
  onCancel,
  onConfirm,
}: DiscardRecommendationModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div
      className="trade-discard-modal-backdrop"
      role="presentation"
      onClick={(event) => {
        event.stopPropagation();
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
      onMouseDown={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <section
        aria-describedby="trade-discard-modal-description"
        aria-labelledby="trade-discard-modal-title"
        aria-modal="true"
        className="trade-discard-modal"
        role="dialog"
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id="trade-discard-modal-title">Discard Recommendation</h2>
        <p id="trade-discard-modal-description">
          Are you sure about discarding this trade recommendation?
        </p>
        <div className="trade-discard-modal__divider" />
        <div className="trade-discard-modal__actions">
          <button
            type="button"
            className="trade-discard-modal__button trade-discard-modal__button--danger"
            disabled={isSaving}
            onClick={async (event) => {
              event.stopPropagation();
              await onConfirm();
            }}
            title={`Discard ${discardRecommendationDisplayValue(
              ticker,
            )} ${discardRecommendationDisplayValue(companyName)}`}
          >
            Discard
          </button>
          <button
            type="button"
            className="trade-discard-modal__button trade-discard-modal__button--neutral"
            disabled={isSaving}
            onClick={(event) => {
              event.stopPropagation();
              onCancel();
            }}
          >
            No
          </button>
        </div>
      </section>
    </div>
  );
}
