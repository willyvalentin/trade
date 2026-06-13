import { Detail } from "@/components/execution/handoff-modal-shared";
import type { LocalhostBridgeClientInstrumentVerificationResult } from "@/lib/avanza-localhost-bridge-client";
import type { AvanzaInstrumentVerificationResult } from "@/lib/avanza-instrument-verification-contract";

type InstrumentVerificationPreviewProps = {
  ambiguous: boolean;
  blocked: boolean;
  canCheck: boolean;
  expectedInstrumentValid: boolean;
  isRunning: boolean;
  message: string;
  noAvanzaTouched: boolean;
  noBrokerSubmission: boolean;
  noBrowserActions: boolean;
  noFormFill: boolean;
  noOrderPageOpened: boolean;
  onCheck: () => void;
  rejected: boolean;
  result: LocalhostBridgeClientInstrumentVerificationResult | null;
  searchOnlyExactMatch: boolean;
  verification?: AvanzaInstrumentVerificationResult | null;
  verified: boolean;
};

function agentCommandValue(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value).replaceAll("_", " ");
}

function agentCommandLabel(value: string) {
  return value.replaceAll("_", " ").toUpperCase();
}

export function InstrumentVerificationPreview({
  ambiguous,
  blocked,
  canCheck,
  expectedInstrumentValid,
  isRunning,
  message,
  noAvanzaTouched,
  noBrokerSubmission,
  noBrowserActions,
  noFormFill,
  noOrderPageOpened,
  onCheck,
  rejected,
  result,
  searchOnlyExactMatch,
  verification,
  verified,
}: InstrumentVerificationPreviewProps) {
  return (
    <div className="rounded-md border border-indigo-300/15 bg-indigo-300/[0.045] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-indigo-300/30 bg-indigo-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-indigo-100">
              DEV ONLY
            </span>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-indigo-100">
              Instrument verification preview
            </p>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Read-only stub check. No browser control. No Avanza page touched.
            No order page opened.
          </p>
        </div>
        <button
          className="inline-flex min-h-10 w-fit items-center justify-center rounded-md border border-indigo-300/30 bg-indigo-300/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-indigo-100 transition hover:border-indigo-200 hover:bg-indigo-300/15 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canCheck}
          onClick={() => onCheck()}
          type="button"
        >
          {isRunning ? "Checking..." : "Check instrument-verification stub"}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {[
          "Instrument verification only",
          "No order page",
          "No buy/sell click",
          "No form fill",
          "No broker submission",
          "No trade mutation",
          "Stub only",
        ].map((label) => (
          <span
            className="rounded-full border border-indigo-300/20 bg-indigo-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-indigo-100"
            key={label}
          >
            {label}
          </span>
        ))}
      </div>

      {!expectedInstrumentValid && (
        <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
          Unavailable: invalid expected instrument.
        </p>
      )}

      {expectedInstrumentValid && !searchOnlyExactMatch && (
        <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
          Search-only exact match required for real verification. This stub
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

          {verified && (
            <p className="mt-3 rounded-md border border-emerald-300/20 bg-emerald-300/[0.06] p-3 text-sm leading-6 text-emerald-100">
              Ready for future instrument-page phase. This does not enable an
              instrument-page, order page, browser control, or broker
              submission.
            </p>
          )}

          {rejected && (
            <p className="mt-3 rounded-md border border-rose-300/20 bg-rose-300/[0.06] p-3 text-sm leading-6 text-rose-100">
              Rejected: manual review required.
            </p>
          )}

          {ambiguous && (
            <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
              Ambiguous: manual review required.
            </p>
          )}

          {blocked && (
            <p className="mt-3 rounded-md border border-rose-300/20 bg-rose-300/[0.06] p-3 text-sm leading-6 text-rose-100">
              Blocked:{" "}
              {verification?.blockers[0] ??
                verification?.errors[0] ??
                "instrument verification cannot proceed safely."}
            </p>
          )}

          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Detail
              label="Status"
              value={result.status ? agentCommandValue(result.status) : "unknown"}
            />
            <Detail label="Client OK" value={result.ok ? "Yes" : "No"} />
            <Detail
              label="HTTP"
              value={result.statusCode ? String(result.statusCode) : "n/a"}
            />
            <Detail label="Elapsed" value={`${result.elapsedMs}ms`} />
            <Detail
              label="Instrument verified"
              value={verified ? "Yes" : "No"}
            />
            <Detail label="Rejected" value={rejected ? "Yes" : "No"} />
            <Detail label="Ambiguous" value={ambiguous ? "Yes" : "No"} />
            <Detail
              label="No order page opened"
              value={noOrderPageOpened ? "Yes" : "No"}
            />
          </div>

          {verification?.selectedCandidate && (
            <div className="mt-3 rounded-md border border-emerald-300/20 bg-emerald-300/[0.06] p-3">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-100">
                Selected candidate
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <Detail
                  label="Ticker"
                  value={verification.selectedCandidate.ticker}
                />
                <Detail
                  label="Name"
                  value={verification.selectedCandidate.displayName}
                />
                <Detail
                  label="Market"
                  value={verification.selectedCandidate.market ?? "n/a"}
                />
                <Detail
                  label="Currency"
                  value={verification.selectedCandidate.currency ?? "n/a"}
                />
              </div>
            </div>
          )}

          {(verification?.fieldChecks.length ?? 0) > 0 && (
            <div className="mt-3 rounded-md border border-white/10 bg-black/25 p-3">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-100">
                Field checks
              </p>
              <div className="mt-3 grid gap-2">
                {verification?.fieldChecks.map((check) => (
                  <div
                    className="rounded-md border border-white/10 bg-black/25 p-3"
                    key={`${check.field}-${check.status}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-zinc-100">
                        {agentCommandLabel(check.field)}
                      </p>
                      <span className="rounded-full border border-indigo-300/20 bg-indigo-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-indigo-100">
                        {agentCommandLabel(check.status)}
                      </span>
                    </div>
                    <div className="mt-2 grid gap-2 sm:grid-cols-3">
                      <Detail label="Expected" value={check.expected ?? "n/a"} />
                      <Detail label="Actual" value={check.actual ?? "n/a"} />
                      <Detail
                        label="Required"
                        value={check.required ? "Yes" : "No"}
                      />
                    </div>
                    {check.message && (
                      <p className="mt-2 text-xs leading-5 text-zinc-400">
                        {check.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {verification?.labels.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {verification.labels.map((label) => (
                <span
                  className="rounded-full border border-indigo-300/20 bg-indigo-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-indigo-100"
                  key={label}
                >
                  {label}
                </span>
              ))}
            </div>
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
              <Detail label="No Form Fill" value={noFormFill ? "Yes" : "No"} />
              <Detail
                label="No Broker Submission"
                value={noBrokerSubmission ? "Yes" : "No"}
              />
            </div>
          )}

          {((verification?.riskFlags.length ?? 0) > 0 ||
            result.errors.length > 0 ||
            result.warnings.length > 0 ||
            (verification?.blockers.length ?? 0) > 0 ||
            (verification?.errors.length ?? 0) > 0) && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {(result.errors.length > 0 ||
                (verification?.blockers.length ?? 0) > 0 ||
                (verification?.errors.length ?? 0) > 0) && (
                <div className="rounded-md border border-rose-300/20 bg-rose-300/[0.06] p-3">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-rose-100">
                    Instrument-verification blockers
                  </p>
                  <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
                    {[
                      ...result.errors,
                      ...(verification?.blockers ?? []),
                      ...(verification?.errors ?? []),
                    ].map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              {((verification?.riskFlags.length ?? 0) > 0 ||
                result.warnings.length > 0) && (
                <div className="rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100">
                    Instrument-verification warnings
                  </p>
                  <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
                    {[
                      ...(verification?.riskFlags ?? []),
                      ...result.warnings,
                      ...(verification?.warnings ?? []),
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
