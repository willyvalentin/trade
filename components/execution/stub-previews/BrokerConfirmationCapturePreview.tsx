import {
  Detail,
  FieldChecksList,
  SafetyLabelList,
  formatAgentCommandLabel,
  formatAgentCommandValue,
} from "@/components/execution/handoff-modal-shared";
import type { LocalhostBridgeClientBrokerConfirmationCaptureResult } from "@/lib/avanza-localhost-bridge-client";
import type { AvanzaBrokerConfirmationCaptureResult } from "@/lib/avanza-broker-confirmation-capture-contract";

type BrokerConfirmationCapturePreviewProps = {
  blocked: boolean;
  canCheck: boolean;
  captured: boolean;
  dryRunRequestValid: boolean;
  isRunning: boolean;
  message: string;
  mismatch: boolean;
  noAvanzaTouched: boolean;
  noBekrafta: boolean;
  noBrokerExecutionResult: boolean;
  noBrowserActions: boolean;
  noExecutionRecord: boolean;
  noSupabaseWrite: boolean;
  noTradeMutation: boolean;
  onCheck: () => void;
  partial: boolean;
  rejectedOrCancelled: boolean;
  result: LocalhostBridgeClientBrokerConfirmationCaptureResult | null;
  capture?: AvanzaBrokerConfirmationCaptureResult | null;
};

function valueOrNa(value: number | string | null | undefined) {
  return value === undefined || value === null ? "n/a" : String(value);
}

export function BrokerConfirmationCapturePreview({
  blocked,
  canCheck,
  captured,
  capture,
  dryRunRequestValid,
  isRunning,
  message,
  mismatch,
  noAvanzaTouched,
  noBekrafta,
  noBrokerExecutionResult,
  noBrowserActions,
  noExecutionRecord,
  noSupabaseWrite,
  noTradeMutation,
  onCheck,
  partial,
  rejectedOrCancelled,
  result,
}: BrokerConfirmationCapturePreviewProps) {
  return (
    <div className="rounded-md border border-pink-300/15 bg-pink-300/[0.04] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-pink-300/30 bg-pink-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-pink-100">
              DEV ONLY
            </span>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-pink-100">
              Broker confirmation capture preview
            </p>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Read-only stub check. No browser control. No Avanza page touched.
            No BrokerExecutionResult created.
          </p>
        </div>
        <button
          className="inline-flex min-h-10 w-fit items-center justify-center rounded-md border border-pink-300/30 bg-pink-300/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-pink-100 transition hover:border-pink-200 hover:bg-pink-300/15 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canCheck}
          onClick={() => onCheck()}
          type="button"
        >
          {isRunning ? "Checking..." : "Check broker-confirmation-capture stub"}
        </button>
      </div>

      <SafetyLabelList
        labels={[
          "Broker confirmation capture only",
          "No browser actions",
          "No Avanza touched",
          "No Bekräfta by agent",
          "No BrokerExecutionResult",
          "No execution record",
          "No Supabase write",
          "No trade mutation",
          "Stub only",
        ]}
        tone="pink"
      />

      {!dryRunRequestValid && (
        <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
          Unavailable: invalid dry-run request.
        </p>
      )}

      {dryRunRequestValid && (
        <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
          Real broker confirmation capture would require a
          user_confirmed_unverified manual-confirmation-wait result. This stub
          check can still return synthetic local metadata.
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

          {captured && (
            <p className="mt-3 rounded-md border border-emerald-300/20 bg-emerald-300/[0.06] p-3 text-sm leading-6 text-emerald-100">
              Ready for future BrokerExecutionResult conversion design. No
              BrokerExecutionResult, execution record, Supabase write, or trade
              mutation is created.
            </p>
          )}

          {partial && (
            <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
              Partial confirmation: manual review required.
            </p>
          )}

          {mismatch && (
            <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
              Confirmation mismatch: manual review required.
            </p>
          )}

          {rejectedOrCancelled && (
            <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
              Rejected/cancelled: no execution result.
            </p>
          )}

          {blocked && (
            <p className="mt-3 rounded-md border border-rose-300/20 bg-rose-300/[0.06] p-3 text-sm leading-6 text-rose-100">
              Blocked:{" "}
              {capture?.blockers[0] ??
                capture?.errors[0] ??
                "Broker confirmation capture cannot proceed safely."}
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
              label="Order status"
              value={
                capture?.orderStatus
                  ? formatAgentCommandValue(capture.orderStatus)
                  : "unknown"
              }
            />
            <Detail
              label="Expected action"
              value={
                capture?.expectedAction
                  ? formatAgentCommandLabel(capture.expectedAction)
                  : "unknown"
              }
            />
            <Detail
              label="Expected quantity"
              value={valueOrNa(capture?.expectedQuantity)}
            />
            <Detail
              label="Expected price"
              value={valueOrNa(capture?.expectedPrice)}
            />
          </div>

          {capture?.brokerConfirmationReadback && (
            <div className="mt-3 rounded-md border border-pink-300/20 bg-pink-300/[0.06] p-3">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-pink-100">
                Broker confirmation readback
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <Detail
                  label="Action"
                  value={
                    capture.brokerConfirmationReadback.action
                      ? formatAgentCommandLabel(
                          capture.brokerConfirmationReadback.action,
                        )
                      : "unknown"
                  }
                />
                <Detail
                  label="Ticker"
                  value={capture.brokerConfirmationReadback.ticker ?? "n/a"}
                />
                <Detail
                  label="Quantity"
                  value={valueOrNa(
                    capture.brokerConfirmationReadback.quantityValue,
                  )}
                />
                <Detail
                  label="Price"
                  value={valueOrNa(capture.brokerConfirmationReadback.priceValue)}
                />
                <Detail
                  label="Order status"
                  value={
                    capture.brokerConfirmationReadback.orderStatus
                      ? formatAgentCommandValue(
                          capture.brokerConfirmationReadback.orderStatus,
                        )
                      : "unknown"
                  }
                />
                <Detail
                  label="Order ID"
                  value={
                    capture.brokerConfirmationReadback.orderIdSanitized ?? "n/a"
                  }
                />
                <Detail
                  label="Timestamp"
                  value={capture.brokerConfirmationReadback.timestamp ?? "n/a"}
                />
                <Detail
                  label="Confirmation page"
                  value={
                    capture.brokerConfirmationReadback.confirmationPageVisible
                      ? "Visible"
                      : "Not visible"
                  }
                />
              </div>
            </div>
          )}

          <FieldChecksList
            checks={capture?.fieldChecks ?? []}
            pillTone="pink"
          />

          {capture?.labels.length ? (
            <SafetyLabelList labels={capture.labels} tone="pink" />
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
              <Detail label="No Bekräfta" value={noBekrafta ? "Yes" : "No"} />
              <Detail
                label="No BrokerExecutionResult"
                value={noBrokerExecutionResult ? "Yes" : "No"}
              />
              <Detail
                label="No Execution Record"
                value={noExecutionRecord ? "Yes" : "No"}
              />
              <Detail
                label="No Supabase Write"
                value={noSupabaseWrite ? "Yes" : "No"}
              />
              <Detail
                label="No Trade Mutation"
                value={noTradeMutation ? "Yes" : "No"}
              />
            </div>
          )}

          {((capture?.riskFlags.length ?? 0) > 0 ||
            result.errors.length > 0 ||
            result.warnings.length > 0 ||
            (capture?.blockers.length ?? 0) > 0 ||
            (capture?.errors.length ?? 0) > 0) && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {(result.errors.length > 0 ||
                (capture?.blockers.length ?? 0) > 0 ||
                (capture?.errors.length ?? 0) > 0) && (
                <div className="rounded-md border border-rose-300/20 bg-rose-300/[0.06] p-3">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-rose-100">
                    Broker confirmation blockers
                  </p>
                  <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
                    {[
                      ...result.errors,
                      ...(capture?.blockers ?? []),
                      ...(capture?.errors ?? []),
                    ].map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              {((capture?.riskFlags.length ?? 0) > 0 ||
                result.warnings.length > 0 ||
                (capture?.warnings.length ?? 0) > 0) && (
                <div className="rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100">
                    Broker confirmation warnings
                  </p>
                  <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
                    {[
                      ...(capture?.riskFlags ?? []),
                      ...result.warnings,
                      ...(capture?.warnings ?? []),
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
