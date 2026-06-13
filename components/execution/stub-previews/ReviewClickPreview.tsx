import {
  Detail,
  FieldChecksList,
  SafetyLabelList,
  formatAgentCommandLabel,
  formatAgentCommandValue,
} from "@/components/execution/handoff-modal-shared";
import type { LocalhostBridgeClientReviewClickResult } from "@/lib/avanza-localhost-bridge-client";
import type { AvanzaReviewClickResult } from "@/lib/avanza-review-click-contract";

type ReviewClickPreviewProps = {
  advancedFormFilled: boolean;
  blocked: boolean;
  canCheck: boolean;
  confirmationMismatch: boolean;
  confirmationReady: boolean;
  dryRunRequestValid: boolean;
  finalConfirmBlocked: boolean;
  isRunning: boolean;
  message: string;
  noAvanzaTouched: boolean;
  noBrokerResult: boolean;
  noBrowserActions: boolean;
  noFinalConfirmClick: boolean;
  noRealReviewClick: boolean;
  noTradeMutation: boolean;
  onCheck: () => void;
  result: LocalhostBridgeClientReviewClickResult | null;
  reviewClick?: AvanzaReviewClickResult | null;
  validationError: boolean;
  waitingForManualConfirmation: boolean;
};

function valueOrNa(value: number | string | null | undefined) {
  return value === undefined || value === null ? "n/a" : String(value);
}

export function ReviewClickPreview({
  advancedFormFilled,
  blocked,
  canCheck,
  confirmationMismatch,
  confirmationReady,
  dryRunRequestValid,
  finalConfirmBlocked,
  isRunning,
  message,
  noAvanzaTouched,
  noBrokerResult,
  noBrowserActions,
  noFinalConfirmClick,
  noRealReviewClick,
  noTradeMutation,
  onCheck,
  result,
  reviewClick,
  validationError,
  waitingForManualConfirmation,
}: ReviewClickPreviewProps) {
  return (
    <div className="rounded-md border border-rose-300/15 bg-rose-300/[0.04] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-rose-300/30 bg-rose-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-rose-100">
              DEV ONLY
            </span>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-rose-100">
              Review click preview
            </p>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Read-only stub check. No browser control. No real Granska. No
            Bekräfta. No broker result.
          </p>
        </div>
        <button
          className="inline-flex min-h-10 w-fit items-center justify-center rounded-md border border-rose-300/30 bg-rose-300/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-rose-100 transition hover:border-rose-200 hover:bg-rose-300/15 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canCheck}
          onClick={() => onCheck()}
          type="button"
        >
          {isRunning ? "Checking..." : "Check review-click stub"}
        </button>
      </div>

      <SafetyLabelList
        labels={[
          "Review-click readback only",
          "No browser actions",
          "No Avanza touched",
          "No real Granska",
          "No Bekräfta click",
          "No broker result",
          "No trade mutation",
          "Stub only",
        ]}
        tone="rose"
      />

      {!dryRunRequestValid && (
        <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
          Unavailable: invalid dry-run request.
        </p>
      )}

      {dryRunRequestValid && !advancedFormFilled && (
        <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
          Advanced form_filled is required for the real future review-click
          phase. This stub check can still return synthetic local metadata.
        </p>
      )}

      {message && (
        <p className="mt-3 rounded-md border border-white/10 bg-black/20 p-3 text-sm leading-6 text-zinc-300">
          {message}
        </p>
      )}

      {result && (
        <div className="mt-3 rounded-md border border-white/10 bg-black/20 p-3">
          <p className="text-sm leading-6 text-zinc-200">{result.summary}</p>

          {confirmationReady && (
            <p className="mt-3 rounded-md border border-emerald-300/20 bg-emerald-300/[0.06] p-3 text-sm leading-6 text-emerald-100">
              Ready for future manual-confirmation wait design. This does not
              enable browser control, real Granska, Bekrafta, broker result, or
              trade mutation.
            </p>
          )}

          {confirmationMismatch && (
            <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
              Confirmation mismatch: manual review required.
            </p>
          )}

          {validationError && (
            <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
              Validation error: manual review required.
            </p>
          )}

          {finalConfirmBlocked && (
            <p className="mt-3 rounded-md border border-rose-300/20 bg-rose-300/[0.06] p-3 text-sm leading-6 text-rose-100">
              Final-confirm attempt blocked.
            </p>
          )}

          {blocked && (
            <p className="mt-3 rounded-md border border-rose-300/20 bg-rose-300/[0.06] p-3 text-sm leading-6 text-rose-100">
              Blocked:{" "}
              {reviewClick?.blockers[0] ??
                reviewClick?.errors[0] ??
                "Review-click cannot proceed safely."}
            </p>
          )}

          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Detail
              label="Status"
              value={result.status ? formatAgentCommandValue(result.status) : "unknown"}
            />
            <Detail label="Client OK" value={result.ok ? "Yes" : "No"} />
            <Detail
              label="HTTP"
              value={result.statusCode ? String(result.statusCode) : "n/a"}
            />
            <Detail label="Elapsed" value={`${result.elapsedMs}ms`} />
            <Detail
              label="Expected action"
              value={
                reviewClick?.expectedAction
                  ? formatAgentCommandLabel(reviewClick.expectedAction)
                  : "unknown"
              }
            />
            <Detail
              label="Expected quantity"
              value={valueOrNa(reviewClick?.expectedQuantity)}
            />
            <Detail
              label="Expected price"
              value={valueOrNa(reviewClick?.expectedPrice)}
            />
            <Detail
              label="Waiting for manual confirmation"
              value={waitingForManualConfirmation ? "Yes" : "No"}
            />
          </div>

          {reviewClick?.confirmationReadback && (
            <div className="mt-3 rounded-md border border-rose-300/20 bg-rose-300/[0.06] p-3">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-rose-100">
                Confirmation readback
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <Detail
                  label="Action"
                  value={
                    reviewClick.confirmationReadback.action
                      ? formatAgentCommandLabel(
                          reviewClick.confirmationReadback.action,
                        )
                      : "unknown"
                  }
                />
                <Detail
                  label="Ticker"
                  value={reviewClick.confirmationReadback.ticker ?? "n/a"}
                />
                <Detail
                  label="Quantity"
                  value={valueOrNa(
                    reviewClick.confirmationReadback.quantityValue,
                  )}
                />
                <Detail
                  label="Price"
                  value={valueOrNa(reviewClick.confirmationReadback.priceValue)}
                />
                <Detail
                  label="Currency"
                  value={reviewClick.confirmationReadback.currency ?? "n/a"}
                />
                <Detail
                  label="Confirmation visible"
                  value={
                    reviewClick.confirmationReadback.confirmationModalVisible
                      ? "Yes"
                      : "No"
                  }
                />
                <Detail
                  label="Final confirm visible"
                  value={
                    reviewClick.confirmationReadback.finalConfirmVisible
                      ? "Yes"
                      : "No"
                  }
                />
                <Detail
                  label="Final confirm label"
                  value={
                    reviewClick.confirmationReadback.finalConfirmLabel ?? "n/a"
                  }
                />
              </div>
            </div>
          )}

          <FieldChecksList
            checks={reviewClick?.fieldChecks ?? []}
            pillTone="rose"
          />

          {reviewClick?.labels.length ? (
            <SafetyLabelList labels={reviewClick.labels} tone="rose" />
          ) : null}

          {result.response?.metadata && (
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <Detail
                label="No Browser Actions"
                value={noBrowserActions ? "Yes" : "No"}
              />
              <Detail
                label="No Avanza Touched"
                value={noAvanzaTouched ? "Yes" : "No"}
              />
              <Detail
                label="No Real Granska"
                value={noRealReviewClick ? "Yes" : "No"}
              />
              <Detail
                label="No Bekräfta Click"
                value={noFinalConfirmClick ? "Yes" : "No"}
              />
              <Detail
                label="No Broker Result"
                value={noBrokerResult ? "Yes" : "No"}
              />
              <Detail
                label="No Trade Mutation"
                value={noTradeMutation ? "Yes" : "No"}
              />
            </div>
          )}

          {((reviewClick?.riskFlags.length ?? 0) > 0 ||
            result.errors.length > 0 ||
            result.warnings.length > 0 ||
            (reviewClick?.blockers.length ?? 0) > 0 ||
            (reviewClick?.errors.length ?? 0) > 0) && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {(result.errors.length > 0 ||
                (reviewClick?.blockers.length ?? 0) > 0 ||
                (reviewClick?.errors.length ?? 0) > 0) && (
                <div className="rounded-md border border-rose-300/20 bg-rose-300/[0.06] p-3">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-rose-100">
                    Review-click blockers
                  </p>
                  <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
                    {[
                      ...result.errors,
                      ...(reviewClick?.blockers ?? []),
                      ...(reviewClick?.errors ?? []),
                    ].map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              {((reviewClick?.riskFlags.length ?? 0) > 0 ||
                result.warnings.length > 0 ||
                (reviewClick?.warnings.length ?? 0) > 0) && (
                <div className="rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100">
                    Review-click warnings
                  </p>
                  <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
                    {[
                      ...(reviewClick?.riskFlags ?? []),
                      ...result.warnings,
                      ...(reviewClick?.warnings ?? []),
                    ].map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
