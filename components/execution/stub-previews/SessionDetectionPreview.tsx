import { Detail } from "@/components/execution/handoff-modal-shared";
import type { LocalhostBridgeClientSessionDetectionResult } from "@/lib/avanza-localhost-bridge-client";
import type { AvanzaSessionDetectionResult } from "@/lib/avanza-session-detection-contract";

type SessionDetectionPreviewProps = {
  canCheck: boolean;
  isRunning: boolean;
  message: string;
  noAvanzaTouched: boolean;
  noBrowserActions: boolean;
  onCheck: () => void;
  readyForSearchOnly: boolean;
  result: LocalhostBridgeClientSessionDetectionResult | null;
  sessionDetection?: AvanzaSessionDetectionResult | null;
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

export function SessionDetectionPreview({
  canCheck,
  isRunning,
  message,
  noAvanzaTouched,
  noBrowserActions,
  onCheck,
  readyForSearchOnly,
  result,
  sessionDetection,
}: SessionDetectionPreviewProps) {
  return (
    <div className="rounded-md border border-teal-300/15 bg-teal-300/[0.045] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-teal-300/30 bg-teal-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-teal-100">
              DEV ONLY
            </span>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-teal-100">
              Session-detection preview
            </p>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Read-only stub check. No browser control. No Avanza page touched.
          </p>
        </div>
        <button
          className="inline-flex min-h-10 w-fit items-center justify-center rounded-md border border-teal-300/30 bg-teal-300/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-teal-100 transition hover:border-teal-200 hover:bg-teal-300/15 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canCheck}
          onClick={() => onCheck()}
          type="button"
        >
          {isRunning ? "Checking..." : "Check session-detection stub"}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {[
          "No browser control",
          "No Avanza page touched",
          "No broker submission",
          "No broker result",
          "Stub only",
        ].map((label) => (
          <span
            className="rounded-full border border-teal-300/20 bg-teal-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-teal-100"
            key={label}
          >
            {label}
          </span>
        ))}
      </div>

      {message && (
        <p className="mt-3 rounded-md border border-white/10 bg-black/20 p-3 text-sm leading-6 text-zinc-300">
          {message}
        </p>
      )}

      {result && (
        <div className="mt-3 rounded-md border border-white/10 bg-black/20 p-3">
          <p className="text-sm leading-6 text-zinc-200">{result.summary}</p>

          {readyForSearchOnly && (
            <p className="mt-3 rounded-md border border-emerald-300/20 bg-emerald-300/[0.06] p-3 text-sm leading-6 text-emerald-100">
              Ready for future search-only phase. No search control, dry-run
              runner, or broker submission is enabled.
            </p>
          )}

          {sessionDetection?.status === "login_required" && (
            <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
              Login required. The user must handle any future login manually;
              this stub does not control the browser.
            </p>
          )}

          {sessionDetection?.status === "blocked" && (
            <p className="mt-3 rounded-md border border-rose-300/20 bg-rose-300/[0.06] p-3 text-sm leading-6 text-rose-100">
              Blocked:{" "}
              {sessionDetection.blockers[0] ??
                sessionDetection.errors[0] ??
                "session detection cannot proceed safely."}
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
              label="Ready for search-only"
              value={readyForSearchOnly ? "Yes" : "No"}
            />
            <Detail
              label="Login state"
              value={sessionDetection?.context.loginState ?? "unknown"}
            />
            <Detail
              label="Page context"
              value={sessionDetection?.context.pageContext ?? "unknown"}
            />
            <Detail
              label="Host class"
              value={sessionDetection?.context.sanitizedHostClass ?? "unknown"}
            />
            <Detail
              label="Sensitive data"
              value={
                sessionDetection?.context.sensitiveDataDetected
                  ? "Detected"
                  : "No"
              }
            />
            <Detail
              label="No browser actions"
              value={noBrowserActions ? "Yes" : "No"}
            />
            <Detail
              label="No Avanza touched"
              value={noAvanzaTouched ? "Yes" : "No"}
            />
            <Detail
              label="No broker submission"
              value={
                sessionDetection?.metadata?.noBrokerSubmission === true ||
                result.response?.metadata?.no_broker_submission === true
                  ? "Yes"
                  : "No"
              }
            />
          </div>

          {sessionDetection?.labels.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {sessionDetection.labels.map((label) => (
                <span
                  className="rounded-full border border-teal-300/20 bg-teal-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-teal-100"
                  key={label}
                >
                  {label}
                </span>
              ))}
            </div>
          ) : null}

          {(result.errors.length > 0 ||
            result.warnings.length > 0 ||
            (sessionDetection?.blockers.length ?? 0) > 0 ||
            (sessionDetection?.errors.length ?? 0) > 0) && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {(result.errors.length > 0 ||
                (sessionDetection?.blockers.length ?? 0) > 0 ||
                (sessionDetection?.errors.length ?? 0) > 0) && (
                <div className="rounded-md border border-rose-300/20 bg-rose-300/[0.06] p-3">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-rose-100">
                    Session-detection blockers
                  </p>
                  <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
                    {[
                      ...result.errors,
                      ...(sessionDetection?.blockers ?? []),
                      ...(sessionDetection?.errors ?? []),
                    ].map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.warnings.length > 0 && (
                <div className="rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100">
                    Session-detection warnings
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
