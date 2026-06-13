import {
  Detail,
  FieldChecksList,
  SafetyLabelList,
  formatAgentCommandLabel,
  formatAgentCommandValue,
} from "@/components/execution/handoff-modal-shared";
import type { LocalhostBridgeClientOrderPageOpenResult } from "@/lib/avanza-localhost-bridge-client";
import type { AvanzaOrderPageOpenResult } from "@/lib/avanza-order-page-open-contract";

type OrderPageOpenPreviewProps = {
  blocked: boolean;
  canCheck: boolean;
  dryRunRequestValid: boolean;
  instrumentPageIdentified: boolean;
  isRunning: boolean;
  message: string;
  mismatch: boolean;
  noAvanzaTouched: boolean;
  noBrokerSubmission: boolean;
  noBrowserActions: boolean;
  noFinalConfirmClick: boolean;
  noFormFill: boolean;
  noRealOrderPageOpened: boolean;
  noReviewClick: boolean;
  onCheck: () => void;
  opened: boolean;
  orderPage?: AvanzaOrderPageOpenResult | null;
  result: LocalhostBridgeClientOrderPageOpenResult | null;
  wrongAction: boolean;
};

export function OrderPageOpenPreview({
  blocked,
  canCheck,
  dryRunRequestValid,
  instrumentPageIdentified,
  isRunning,
  message,
  mismatch,
  noAvanzaTouched,
  noBrokerSubmission,
  noBrowserActions,
  noFinalConfirmClick,
  noFormFill,
  noRealOrderPageOpened,
  noReviewClick,
  onCheck,
  opened,
  orderPage,
  result,
  wrongAction,
}: OrderPageOpenPreviewProps) {
  return (
    <div className="rounded-md border border-orange-300/15 bg-orange-300/[0.045] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-orange-300/30 bg-orange-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-orange-100">
              DEV ONLY
            </span>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-orange-100">
              Order page open preview
            </p>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Read-only stub check. No browser control. No Avanza page touched.
            No real order page opened.
          </p>
        </div>
        <button
          className="inline-flex min-h-10 w-fit items-center justify-center rounded-md border border-orange-300/30 bg-orange-300/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-orange-100 transition hover:border-orange-200 hover:bg-orange-300/15 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canCheck}
          onClick={() => onCheck()}
          type="button"
        >
          {isRunning ? "Checking..." : "Check order-page-open stub"}
        </button>
      </div>

      <SafetyLabelList
        labels={[
          "Order page open only",
          "No form fill",
          "No Granska click",
          "No Bekräfta click",
          "No broker submission",
          "No trade mutation",
          "Stub only",
        ]}
        tone="orange"
      />

      {!dryRunRequestValid && (
        <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
          Unavailable: invalid dry-run request.
        </p>
      )}

      {dryRunRequestValid && !instrumentPageIdentified && (
        <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
          Identified instrument page required for the real order-page-open
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

          {opened && (
            <p className="mt-3 rounded-md border border-emerald-300/20 bg-emerald-300/[0.06] p-3 text-sm leading-6 text-emerald-100">
              Ready for future form-fill design. This does not enable form fill,
              browser control, Granska, Bekrafta, or broker submission.
            </p>
          )}

          {wrongAction && (
            <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
              Wrong action opened: manual review required.
            </p>
          )}

          {mismatch && (
            <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
              Order page mismatch: manual review required.
            </p>
          )}

          {blocked && (
            <p className="mt-3 rounded-md border border-rose-300/20 bg-rose-300/[0.06] p-3 text-sm leading-6 text-rose-100">
              Blocked:{" "}
              {orderPage?.blockers[0] ??
                orderPage?.errors[0] ??
                "order-page-open cannot proceed safely."}
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
                orderPage?.expectedAction
                  ? formatAgentCommandLabel(orderPage.expectedAction)
                  : "unknown"
              }
            />
            <Detail label="Order page opened" value={opened ? "Yes" : "No"} />
            <Detail
              label="Wrong action opened"
              value={wrongAction ? "Yes" : "No"}
            />
            <Detail
              label="Order page mismatch"
              value={mismatch ? "Yes" : "No"}
            />
          </div>

          {orderPage?.orderPageIdentity && (
            <div className="mt-3 rounded-md border border-orange-300/20 bg-orange-300/[0.06] p-3">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-orange-100">
                Order page identity
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <Detail
                  label="Action"
                  value={
                    orderPage.orderPageIdentity.action
                      ? formatAgentCommandLabel(
                          orderPage.orderPageIdentity.action,
                        )
                      : "unknown"
                  }
                />
                <Detail
                  label="Ticker"
                  value={orderPage.orderPageIdentity.ticker ?? "n/a"}
                />
                <Detail
                  label="Name"
                  value={orderPage.orderPageIdentity.name ?? "n/a"}
                />
                <Detail
                  label="Market"
                  value={orderPage.orderPageIdentity.market ?? "n/a"}
                />
                <Detail
                  label="Currency"
                  value={orderPage.orderPageIdentity.currency ?? "n/a"}
                />
                <Detail
                  label="Instrument type"
                  value={orderPage.orderPageIdentity.instrumentType ?? "n/a"}
                />
                <Detail
                  label="Page context"
                  value={orderPage.orderPageIdentity.pageContext ?? "unknown"}
                />
                <Detail
                  label="Host class"
                  value={
                    orderPage.orderPageIdentity.sanitizedHostClass ?? "unknown"
                  }
                />
              </div>
            </div>
          )}

          <FieldChecksList
            checks={orderPage?.fieldChecks ?? []}
            pillTone="orange"
          />

          {orderPage?.labels.length ? (
            <SafetyLabelList labels={orderPage.labels} tone="orange" />
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
                label="No Real Order Page Opened"
                value={noRealOrderPageOpened ? "Yes" : "No"}
              />
              <Detail label="No Form Fill" value={noFormFill ? "Yes" : "No"} />
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

          {((orderPage?.riskFlags.length ?? 0) > 0 ||
            result.errors.length > 0 ||
            result.warnings.length > 0 ||
            (orderPage?.blockers.length ?? 0) > 0 ||
            (orderPage?.errors.length ?? 0) > 0) && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {(result.errors.length > 0 ||
                (orderPage?.blockers.length ?? 0) > 0 ||
                (orderPage?.errors.length ?? 0) > 0) && (
                <div className="rounded-md border border-rose-300/20 bg-rose-300/[0.06] p-3">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-rose-100">
                    Order-page-open blockers
                  </p>
                  <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
                    {[
                      ...result.errors,
                      ...(orderPage?.blockers ?? []),
                      ...(orderPage?.errors ?? []),
                    ].map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              {((orderPage?.riskFlags.length ?? 0) > 0 ||
                result.warnings.length > 0 ||
                (orderPage?.warnings.length ?? 0) > 0) && (
                <div className="rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100">
                    Order-page-open warnings
                  </p>
                  <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
                    {[
                      ...(orderPage?.riskFlags ?? []),
                      ...result.warnings,
                      ...(orderPage?.warnings ?? []),
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
