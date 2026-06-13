import {
  Detail,
  FieldChecksList,
  SafetyLabelList,
  formatAgentCommandValue,
} from "@/components/execution/handoff-modal-shared";
import type { LocalhostBridgeClientInstrumentPageResult } from "@/lib/avanza-localhost-bridge-client";
import type { AvanzaInstrumentPageResult } from "@/lib/avanza-instrument-page-contract";

type InstrumentPagePreviewProps = {
  blocked: boolean;
  canCheck: boolean;
  expectedInstrumentValid: boolean;
  identified: boolean;
  instrumentVerified: boolean;
  isRunning: boolean;
  message: string;
  mismatch: boolean;
  noAvanzaTouched: boolean;
  noBrokerSubmission: boolean;
  noBrowserActions: boolean;
  noBuySellClick: boolean;
  noFormFill: boolean;
  noOrderPageOpened: boolean;
  onCheck: () => void;
  page?: AvanzaInstrumentPageResult | null;
  prohibitedControlsVisible: boolean;
  result: LocalhostBridgeClientInstrumentPageResult | null;
};

export function InstrumentPagePreview({
  blocked,
  canCheck,
  expectedInstrumentValid,
  identified,
  instrumentVerified,
  isRunning,
  message,
  mismatch,
  noAvanzaTouched,
  noBrokerSubmission,
  noBrowserActions,
  noBuySellClick,
  noFormFill,
  noOrderPageOpened,
  onCheck,
  page,
  prohibitedControlsVisible,
  result,
}: InstrumentPagePreviewProps) {
  return (
    <div className="rounded-md border border-fuchsia-300/15 bg-fuchsia-300/[0.045] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-fuchsia-300/30 bg-fuchsia-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-fuchsia-100">
              DEV ONLY
            </span>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-fuchsia-100">
              Instrument page preview
            </p>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Read-only stub check. No browser control. No Avanza page touched.
            No order page opened.
          </p>
        </div>
        <button
          className="inline-flex min-h-10 w-fit items-center justify-center rounded-md border border-fuchsia-300/30 bg-fuchsia-300/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-fuchsia-100 transition hover:border-fuchsia-200 hover:bg-fuchsia-300/15 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canCheck}
          onClick={() => onCheck()}
          type="button"
        >
          {isRunning ? "Checking..." : "Check instrument-page stub"}
        </button>
      </div>

      <SafetyLabelList
        labels={[
          "Instrument page identity only",
          "No order page",
          "No buy/sell click",
          "No form fill",
          "No broker submission",
          "No trade mutation",
          "Stub only",
        ]}
        tone="fuchsia"
      />

      {!expectedInstrumentValid && (
        <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
          Unavailable: invalid expected instrument.
        </p>
      )}

      {expectedInstrumentValid && !instrumentVerified && (
        <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
          Verified instrument required for the real instrument-page phase. This
          stub check can still return synthetic local metadata.
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

          {identified && (
            <p className="mt-3 rounded-md border border-emerald-300/20 bg-emerald-300/[0.06] p-3 text-sm leading-6 text-emerald-100">
              Ready for future order-page-open design. This does not enable
              order-page opening, browser control, buy/sell clicks, form fills,
              or broker submission.
            </p>
          )}

          {mismatch && (
            <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
              Page mismatch: manual review required.
            </p>
          )}

          {prohibitedControlsVisible && (
            <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
              Buy/sell controls visible - no click allowed.
            </p>
          )}

          {blocked && (
            <p className="mt-3 rounded-md border border-rose-300/20 bg-rose-300/[0.06] p-3 text-sm leading-6 text-rose-100">
              Blocked:{" "}
              {page?.blockers[0] ??
                page?.errors[0] ??
                "instrument-page identity cannot proceed safely."}
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
            <Detail label="Page identified" value={identified ? "Yes" : "No"} />
            <Detail label="Page mismatch" value={mismatch ? "Yes" : "No"} />
            <Detail
              label="Prohibited controls visible"
              value={prohibitedControlsVisible ? "Yes" : "No"}
            />
            <Detail
              label="No order page opened"
              value={noOrderPageOpened ? "Yes" : "No"}
            />
          </div>

          {page?.pageIdentity && (
            <div className="mt-3 rounded-md border border-fuchsia-300/20 bg-fuchsia-300/[0.06] p-3">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-fuchsia-100">
                Page identity
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <Detail label="Ticker" value={page.pageIdentity.ticker ?? "n/a"} />
                <Detail label="Name" value={page.pageIdentity.name ?? "n/a"} />
                <Detail label="Market" value={page.pageIdentity.market ?? "n/a"} />
                <Detail
                  label="Currency"
                  value={page.pageIdentity.currency ?? "n/a"}
                />
                <Detail
                  label="Instrument type"
                  value={page.pageIdentity.instrumentType ?? "n/a"}
                />
                <Detail
                  label="Page context"
                  value={page.pageIdentity.pageContext ?? "unknown"}
                />
                <Detail
                  label="Host class"
                  value={page.pageIdentity.sanitizedHostClass ?? "unknown"}
                />
                <Detail
                  label="Confidence"
                  value={
                    typeof page.pageIdentity.matchConfidence === "number"
                      ? String(page.pageIdentity.matchConfidence)
                      : "n/a"
                  }
                />
              </div>
            </div>
          )}

          <FieldChecksList
            checks={page?.fieldChecks ?? []}
            pillTone="fuchsia"
          />

          {page?.labels.length ? (
            <SafetyLabelList labels={page.labels} tone="fuchsia" />
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
                label="No Order Page Opened"
                value={noOrderPageOpened ? "Yes" : "No"}
              />
              <Detail
                label="No Buy/Sell Click"
                value={noBuySellClick ? "Yes" : "No"}
              />
              <Detail label="No Form Fill" value={noFormFill ? "Yes" : "No"} />
              <Detail
                label="No Broker Submission"
                value={noBrokerSubmission ? "Yes" : "No"}
              />
            </div>
          )}

          {((page?.riskFlags.length ?? 0) > 0 ||
            result.errors.length > 0 ||
            result.warnings.length > 0 ||
            (page?.blockers.length ?? 0) > 0 ||
            (page?.errors.length ?? 0) > 0) && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {(result.errors.length > 0 ||
                (page?.blockers.length ?? 0) > 0 ||
                (page?.errors.length ?? 0) > 0) && (
                <div className="rounded-md border border-rose-300/20 bg-rose-300/[0.06] p-3">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-rose-100">
                    Instrument-page blockers
                  </p>
                  <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
                    {[
                      ...result.errors,
                      ...(page?.blockers ?? []),
                      ...(page?.errors ?? []),
                    ].map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              {((page?.riskFlags.length ?? 0) > 0 ||
                result.warnings.length > 0 ||
                (page?.warnings.length ?? 0) > 0) && (
                <div className="rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100">
                    Instrument-page warnings
                  </p>
                  <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
                    {[
                      ...(page?.riskFlags ?? []),
                      ...result.warnings,
                      ...(page?.warnings ?? []),
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
