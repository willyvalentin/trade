import {
  Detail,
  FieldChecksList,
  SafetyLabelList,
  formatAgentCommandLabel,
  formatAgentCommandValue,
} from "@/components/execution/handoff-modal-shared";
import type { LocalhostBridgeClientAdvancedFormFillResult } from "@/lib/avanza-localhost-bridge-client";
import type { AvanzaAdvancedFormFillResult } from "@/lib/avanza-advanced-form-fill-contract";

type AdvancedFormFillPreviewProps = {
  blocked: boolean;
  canCheck: boolean;
  dryRunRequestValid: boolean;
  fieldMismatch: boolean;
  filled: boolean;
  isRunning: boolean;
  message: string;
  noAvanzaTouched: boolean;
  noBrokerSubmission: boolean;
  noBrowserActions: boolean;
  noFinalConfirmClick: boolean;
  noRealFormFieldsFilled: boolean;
  noReviewClick: boolean;
  onCheck: () => void;
  orderPageOpened: boolean;
  result: LocalhostBridgeClientAdvancedFormFillResult | null;
  unsupportedMode: boolean;
  validationError: boolean;
  formFill?: AvanzaAdvancedFormFillResult | null;
};

function valueOrNa(value: number | string | null | undefined) {
  return value === undefined || value === null ? "n/a" : String(value);
}

export function AdvancedFormFillPreview({
  blocked,
  canCheck,
  dryRunRequestValid,
  fieldMismatch,
  filled,
  formFill,
  isRunning,
  message,
  noAvanzaTouched,
  noBrokerSubmission,
  noBrowserActions,
  noFinalConfirmClick,
  noRealFormFieldsFilled,
  noReviewClick,
  onCheck,
  orderPageOpened,
  result,
  unsupportedMode,
  validationError,
}: AdvancedFormFillPreviewProps) {
  return (
    <div className="rounded-md border border-lime-300/15 bg-lime-300/[0.045] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-lime-300/30 bg-lime-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-lime-100">
              DEV ONLY
            </span>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-lime-100">
              Advanced form-fill preview
            </p>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Read-only stub check. No browser control. No Avanza page touched.
            No real form fields filled.
          </p>
        </div>
        <button
          className="inline-flex min-h-10 w-fit items-center justify-center rounded-md border border-lime-300/30 bg-lime-300/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-lime-100 transition hover:border-lime-200 hover:bg-lime-300/15 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canCheck}
          onClick={() => onCheck()}
          type="button"
        >
          {isRunning ? "Checking..." : "Check Advanced form-fill stub"}
        </button>
      </div>

      <SafetyLabelList
        labels={[
          "Advanced form-fill only",
          "No real form fields filled",
          "No Granska click",
          "No Bekräfta click",
          "No order submission",
          "No broker result",
          "No trade mutation",
          "Stub only",
        ]}
        tone="lime"
      />

      {!dryRunRequestValid && (
        <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
          Unavailable: invalid dry-run request.
        </p>
      )}

      {dryRunRequestValid && !orderPageOpened && (
        <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
          Opened order page required for the real Advanced form-fill phase.
          This stub check can still return synthetic local metadata.
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

          {filled && (
            <p className="mt-3 rounded-md border border-emerald-300/20 bg-emerald-300/[0.06] p-3 text-sm leading-6 text-emerald-100">
              Ready for future review-click design. This does not enable form
              fill, browser control, Granska, Bekrafta, or broker submission.
            </p>
          )}

          {fieldMismatch && (
            <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
              Field mismatch: manual review required.
            </p>
          )}

          {validationError && (
            <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
              Validation error: manual review required.
            </p>
          )}

          {unsupportedMode && (
            <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
              Unsupported order mode: manual review required.
            </p>
          )}

          {blocked && (
            <p className="mt-3 rounded-md border border-rose-300/20 bg-rose-300/[0.06] p-3 text-sm leading-6 text-rose-100">
              Blocked:{" "}
              {formFill?.blockers[0] ??
                formFill?.errors[0] ??
                "Advanced form-fill cannot proceed safely."}
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
                formFill?.expectedAction
                  ? formatAgentCommandLabel(formFill.expectedAction)
                  : "unknown"
              }
            />
            <Detail
              label="Expected quantity"
              value={valueOrNa(formFill?.expectedQuantity)}
            />
            <Detail
              label="Expected price"
              value={valueOrNa(formFill?.expectedPrice)}
            />
            <Detail label="Form filled" value={filled ? "Yes" : "No"} />
          </div>

          {formFill?.formState && (
            <div className="mt-3 rounded-md border border-lime-300/20 bg-lime-300/[0.06] p-3">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-lime-100">
                Sanitized form state
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <Detail
                  label="Action"
                  value={
                    formFill.formState.action
                      ? formatAgentCommandLabel(formFill.formState.action)
                      : "unknown"
                  }
                />
                <Detail label="Ticker" value={formFill.formState.ticker ?? "n/a"} />
                <Detail
                  label="Order mode"
                  value={formFill.formState.orderMode ?? "unknown"}
                />
                <Detail
                  label="Quantity"
                  value={valueOrNa(formFill.formState.quantity)}
                />
                <Detail label="Price" value={valueOrNa(formFill.formState.price)} />
                <Detail
                  label="Currency"
                  value={formFill.formState.currency ?? "n/a"}
                />
                <Detail
                  label="Review visible"
                  value={
                    formFill.formState.controls?.reviewButtonVisible
                      ? "Yes"
                      : "No"
                  }
                />
                <Detail
                  label="Validation visible"
                  value={
                    formFill.formState.validation?.validationErrorsVisible
                      ? "Yes"
                      : "No"
                  }
                />
              </div>
            </div>
          )}

          <FieldChecksList
            checks={formFill?.fieldChecks ?? []}
            pillTone="lime"
          />

          {formFill?.labels.length ? (
            <SafetyLabelList labels={formFill.labels} tone="lime" />
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
                label="No Real Form Fields Filled"
                value={noRealFormFieldsFilled ? "Yes" : "No"}
              />
              <Detail
                label="No Granska Click"
                value={noReviewClick ? "Yes" : "No"}
              />
              <Detail
                label="No Bekräfta Click"
                value={noFinalConfirmClick ? "Yes" : "No"}
              />
              <Detail
                label="No Broker Submission"
                value={noBrokerSubmission ? "Yes" : "No"}
              />
            </div>
          )}

          {((formFill?.riskFlags.length ?? 0) > 0 ||
            result.errors.length > 0 ||
            result.warnings.length > 0 ||
            (formFill?.blockers.length ?? 0) > 0 ||
            (formFill?.errors.length ?? 0) > 0) && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {(result.errors.length > 0 ||
                (formFill?.blockers.length ?? 0) > 0 ||
                (formFill?.errors.length ?? 0) > 0) && (
                <div className="rounded-md border border-rose-300/20 bg-rose-300/[0.06] p-3">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-rose-100">
                    Advanced form-fill blockers
                  </p>
                  <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
                    {[
                      ...result.errors,
                      ...(formFill?.blockers ?? []),
                      ...(formFill?.errors ?? []),
                    ].map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              {((formFill?.riskFlags.length ?? 0) > 0 ||
                result.warnings.length > 0 ||
                (formFill?.warnings.length ?? 0) > 0) && (
                <div className="rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100">
                    Advanced form-fill warnings
                  </p>
                  <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
                    {[
                      ...(formFill?.riskFlags ?? []),
                      ...result.warnings,
                      ...(formFill?.warnings ?? []),
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
