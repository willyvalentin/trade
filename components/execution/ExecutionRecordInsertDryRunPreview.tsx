import {
  Detail,
  SafetyLabelList,
  formatAgentCommandLabel,
  formatAgentCommandValue,
} from "@/components/execution/handoff-modal-shared";
import type { ExecutionRecordInsertRouteResponse } from "@/lib/execution-record-insert-route-contract";

type ExecutionRecordInsertDryRunPreviewProps = {
  canRun: boolean;
  isRunning: boolean;
  message: string;
  onRun: () => void;
  result: ExecutionRecordInsertRouteResponse | null;
  unavailableReason?: string | null;
};

function StatusTone({ result }: { result: ExecutionRecordInsertRouteResponse }) {
  if (result.status === "dry_run") {
    return (
      <p className="mt-3 rounded-md border border-emerald-300/20 bg-emerald-300/[0.06] p-3 text-sm leading-6 text-emerald-100">
        Dry-run accepted. No execution record was created.
      </p>
    );
  }

  if (result.status === "duplicate") {
    return (
      <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
        Dry-run duplicate simulation. No database lookup was performed and no
        persisted record was returned.
      </p>
    );
  }

  if (result.status === "needs_review") {
    return (
      <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
        Dry-run requires review. No write, mutation, or audit append occurred.
      </p>
    );
  }

  if (result.status === "error") {
    return (
      <p className="mt-3 rounded-md border border-rose-300/20 bg-rose-300/[0.06] p-3 text-sm leading-6 text-rose-100">
        Dry-run route preview failed safely. No write, mutation, or audit append
        occurred.
      </p>
    );
  }

  return (
    <p className="mt-3 rounded-md border border-rose-300/20 bg-rose-300/[0.06] p-3 text-sm leading-6 text-rose-100">
      Dry-run rejected by validation. No execution record was created.
    </p>
  );
}

export function ExecutionRecordInsertDryRunPreview({
  canRun,
  isRunning,
  message,
  onRun,
  result,
  unavailableReason,
}: ExecutionRecordInsertDryRunPreviewProps) {
  const duplicateMatches = result?.duplicate?.duplicateMatches ?? [];
  const dryRunMetadata = result?.dryRunMetadata ?? null;

  return (
    <details className="rounded-md border border-sky-300/15 bg-sky-300/[0.04] p-4" open>
      <summary className="cursor-pointer select-none font-mono text-xs font-bold uppercase tracking-[0.16em] text-sky-100">
        Execution record insert dry-run preview
      </summary>

      <div className="mt-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-sky-300/30 bg-sky-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-sky-100">
                Dry-run only
              </span>
              <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-100">
                Dev fixture / sandbox only
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              Read-only dry-run of the future insert route. This does not
              persist an execution record, write to Supabase, append audit
              events, or mutate trades.
            </p>
          </div>

          <button
            className="rounded-md border border-sky-300/30 bg-sky-300/10 px-3 py-2 text-left font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canRun || isRunning}
            onClick={onRun}
            type="button"
          >
            {isRunning ? "Running dry-run preview..." : "Run dry-run preview"}
          </button>
        </div>

        <SafetyLabelList
          labels={[
            "No Supabase write",
            "No trade mutation",
            "No audit append",
            "No record persisted",
            "Read-only",
          ]}
          tone="emerald"
        />

        {unavailableReason && (
          <p className="mt-3 rounded-md border border-white/10 bg-black/20 p-3 text-sm leading-6 text-zinc-300">
            {unavailableReason}
          </p>
        )}

        {message && (
          <p className="mt-3 rounded-md border border-white/10 bg-black/20 p-3 text-sm leading-6 text-zinc-300">
            {message}
          </p>
        )}

        {result && (
          <div className="mt-3 rounded-md border border-white/10 bg-black/20 p-3">
            <StatusTone result={result} />

            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <Detail label="Route status" value={formatAgentCommandValue(result.status)} />
              <Detail
                label="Dry-run"
                value={dryRunMetadata?.dryRun ? "True" : "False"}
              />
              <Detail
                label="Wrote Supabase"
                value={dryRunMetadata?.supabaseWriteAttempted ? "True" : "False"}
              />
              <Detail
                label="Mutated trade"
                value={dryRunMetadata?.tradeMutationAttempted ? "True" : "False"}
              />
              <Detail
                label="Appended audit"
                value={dryRunMetadata?.auditAppendAttempted ? "True" : "False"}
              />
              <Detail
                label="Persisted record"
                value={"No record persisted"}
              />
              <Detail
                label="Idempotency"
                value={result.idempotencyKey ?? "n/a"}
              />
              <Detail
                label="Fingerprint"
                value={result.recordFingerprint ?? "n/a"}
              />
            </div>

            {result.rejectionReasons.length > 0 && (
              <div className="mt-3 rounded-md border border-rose-300/20 bg-rose-300/[0.06] p-3">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-rose-100">
                  Rejection reasons
                </p>
                <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
                  {result.rejectionReasons.map((reason) => (
                    <li key={reason}>{formatAgentCommandLabel(reason)}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.validationErrors.length > 0 && (
              <div className="mt-3 rounded-md border border-rose-300/20 bg-rose-300/[0.06] p-3">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-rose-100">
                  Validation errors
                </p>
                <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
                  {result.validationErrors.map((error, index) => (
                    <li key={`${error.code}-${index}`}>
                      {formatAgentCommandLabel(error.code)}
                      {error.persistenceReason
                        ? ` - ${formatAgentCommandLabel(error.persistenceReason)}`
                        : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.warnings.length > 0 && (
              <div className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100">
                  Warnings
                </p>
                <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
                  {result.warnings.map((warning) => (
                    <li key={warning}>{formatAgentCommandLabel(warning)}</li>
                  ))}
                </ul>
              </div>
            )}

            {duplicateMatches.length > 0 && (
              <div className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100">
                  Duplicate simulation metadata
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {duplicateMatches.map((match) => (
                    <Detail
                      key={`${match.matchType}-${match.existingRecordId}`}
                      label={formatAgentCommandLabel(match.matchType)}
                      value={match.existingRecordId}
                    />
                  ))}
                </div>
              </div>
            )}

            {result.status === "error" && (
              <div className="mt-3 rounded-md border border-rose-300/20 bg-rose-300/[0.06] p-3">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-rose-100">
                  Helper or route error
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-300">
                  {result.errorMessage}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </details>
  );
}
