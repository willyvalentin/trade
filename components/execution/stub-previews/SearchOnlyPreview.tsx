import { Detail } from "@/components/execution/handoff-modal-shared";
import type { LocalhostBridgeClientSearchOnlyResult } from "@/lib/avanza-localhost-bridge-client";
import type { AvanzaSearchOnlyResult } from "@/lib/avanza-search-only-result-contract";

type SearchOnlyPreviewProps = {
  ambiguous: boolean;
  blocked: boolean;
  canCheck: boolean;
  exactMatch: boolean;
  expectedInstrumentValid: boolean;
  isRunning: boolean;
  message: string;
  noAvanzaTouched: boolean;
  noBrokerSubmission: boolean;
  noBrowserActions: boolean;
  noMatch: boolean;
  noOrderPageOpened: boolean;
  onCheck: () => void;
  result: LocalhostBridgeClientSearchOnlyResult | null;
  searchOnly?: AvanzaSearchOnlyResult | null;
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

export function SearchOnlyPreview({
  ambiguous,
  blocked,
  canCheck,
  exactMatch,
  expectedInstrumentValid,
  isRunning,
  message,
  noAvanzaTouched,
  noBrokerSubmission,
  noBrowserActions,
  noMatch,
  noOrderPageOpened,
  onCheck,
  result,
  searchOnly,
}: SearchOnlyPreviewProps) {
  return (
    <div className="rounded-md border border-cyan-300/15 bg-cyan-300/[0.045] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-100">
              DEV ONLY
            </span>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-cyan-100">
              Search-only preview
            </p>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Read-only stub check. No browser control. No Avanza page touched.
            No order page opened.
          </p>
        </div>
        <button
          className="inline-flex min-h-10 w-fit items-center justify-center rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-200 hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canCheck}
          onClick={() => onCheck()}
          type="button"
        >
          {isRunning ? "Checking..." : "Check search-only stub"}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {[
          "Search-only",
          "No order page",
          "No buy/sell click",
          "No broker submission",
          "No trade mutation",
          "Stub only",
        ].map((label) => (
          <span
            className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-100"
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

      {message && (
        <p className="mt-3 rounded-md border border-white/10 bg-black/20 p-3 text-sm leading-6 text-zinc-300">
          {message}
        </p>
      )}

      {result && (
        <div className="mt-3 rounded-md border border-white/10 bg-black/20 p-3">
          <p className="text-sm leading-6 text-zinc-200">{result.summary}</p>

          {exactMatch && (
            <p className="mt-3 rounded-md border border-emerald-300/20 bg-emerald-300/[0.06] p-3 text-sm leading-6 text-emerald-100">
              Ready for future instrument-verification phase. This does not
              enable instrument verification, browser control, or order
              preparation.
            </p>
          )}

          {ambiguous && (
            <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
              Manual review required. The search-only stub found ambiguous
              candidates and no future phase is enabled.
            </p>
          )}

          {noMatch && (
            <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
              No matching instrument found. Search-only stops here.
            </p>
          )}

          {blocked && (
            <p className="mt-3 rounded-md border border-rose-300/20 bg-rose-300/[0.06] p-3 text-sm leading-6 text-rose-100">
              Blocked:{" "}
              {searchOnly?.blockers[0] ??
                searchOnly?.errors[0] ??
                "search-only cannot proceed safely."}
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
              label="Exact match found"
              value={exactMatch ? "Yes" : "No"}
            />
            <Detail
              label="Ambiguous candidates"
              value={ambiguous ? "Yes" : "No"}
            />
            <Detail
              label="No order page opened"
              value={noOrderPageOpened ? "Yes" : "No"}
            />
            <Detail
              label="No broker submission"
              value={noBrokerSubmission ? "Yes" : "No"}
            />
          </div>

          {searchOnly?.selectedCandidate && (
            <div className="mt-3 rounded-md border border-emerald-300/20 bg-emerald-300/[0.06] p-3">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-100">
                Selected candidate
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <Detail
                  label="Ticker"
                  value={searchOnly.selectedCandidate.ticker}
                />
                <Detail
                  label="Name"
                  value={searchOnly.selectedCandidate.displayName}
                />
                <Detail
                  label="Market"
                  value={searchOnly.selectedCandidate.market ?? "n/a"}
                />
                <Detail
                  label="Currency"
                  value={searchOnly.selectedCandidate.currency ?? "n/a"}
                />
              </div>
            </div>
          )}

          {(searchOnly?.candidates.length ?? 0) > 0 && (
            <div className="mt-3 rounded-md border border-white/10 bg-black/25 p-3">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-100">
                Candidates
              </p>
              <div className="mt-3 grid gap-2">
                {searchOnly?.candidates.map((candidate) => (
                  <div
                    className="rounded-md border border-white/10 bg-black/25 p-3"
                    key={candidate.candidateId}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-zinc-100">
                        {candidate.displayName}
                      </p>
                      <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-100">
                        {candidate.ticker}
                      </span>
                    </div>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      <Detail
                        label="Market"
                        value={candidate.market ?? "n/a"}
                      />
                      <Detail
                        label="Currency"
                        value={candidate.currency ?? "n/a"}
                      />
                      <Detail
                        label="Type"
                        value={candidate.instrumentType ?? "n/a"}
                      />
                      <Detail
                        label="Confidence"
                        value={String(candidate.matchConfidence)}
                      />
                    </div>
                    {(candidate.riskFlags.length > 0 ||
                      candidate.warnings.length > 0) && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {[...candidate.riskFlags, ...candidate.warnings].map(
                          (item) => (
                            <span
                              className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-amber-100"
                              key={`${candidate.candidateId}-${item}`}
                            >
                              {item}
                            </span>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchOnly?.labels.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {searchOnly.labels.map((label) => (
                <span
                  className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-100"
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
              <Detail
                label="No Broker Submission"
                value={noBrokerSubmission ? "Yes" : "No"}
              />
            </div>
          )}

          {(result.errors.length > 0 ||
            result.warnings.length > 0 ||
            (searchOnly?.blockers.length ?? 0) > 0 ||
            (searchOnly?.errors.length ?? 0) > 0) && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {(result.errors.length > 0 ||
                (searchOnly?.blockers.length ?? 0) > 0 ||
                (searchOnly?.errors.length ?? 0) > 0) && (
                <div className="rounded-md border border-rose-300/20 bg-rose-300/[0.06] p-3">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-rose-100">
                    Search-only blockers
                  </p>
                  <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
                    {[
                      ...result.errors,
                      ...(searchOnly?.blockers ?? []),
                      ...(searchOnly?.errors ?? []),
                    ].map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.warnings.length > 0 && (
                <div className="rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100">
                    Search-only warnings
                  </p>
                  <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
                    {result.warnings.map((warning) => (
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
