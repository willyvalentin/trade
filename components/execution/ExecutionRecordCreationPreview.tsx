import {
  Detail,
  SafetyLabelList,
  formatAgentCommandLabel,
  formatAgentCommandValue,
} from "@/components/execution/handoff-modal-shared";
import type { ExecutionRecordCreationResult } from "@/lib/execution-record-creation-contract";

type ExecutionRecordCreationPreviewProps = {
  result: ExecutionRecordCreationResult | null;
  sourceDescription?: string;
  sourceLabel?: string;
};

function ResultTone({ result }: { result: ExecutionRecordCreationResult }) {
  if (result.status === "eligible" && result.recordCandidate) {
    return (
      <p className="mt-3 rounded-md border border-emerald-300/20 bg-emerald-300/[0.06] p-3 text-sm leading-6 text-emerald-100">
        Candidate preview available. Read-only only; safeToPersist remains false.
      </p>
    );
  }

  if (result.status === "eligible") {
    return (
      <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
        Eligible for candidate building, but no candidate was provided by this
        preview result.
      </p>
    );
  }

  if (result.status === "needs_review") {
    return (
      <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
        Needs review before any future candidate or persistence boundary.
      </p>
    );
  }

  return (
    <p className="mt-3 rounded-md border border-rose-300/20 bg-rose-300/[0.06] p-3 text-sm leading-6 text-rose-100">
      Creation candidate preview is blocked. No record was created.
    </p>
  );
}

export function ExecutionRecordCreationPreview({
  result,
  sourceDescription,
  sourceLabel = "Builder result",
}: ExecutionRecordCreationPreviewProps) {
  const candidate = result?.recordCandidate ?? null;

  return (
    <div className="rounded-md border border-cyan-300/15 bg-cyan-300/[0.04] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-100">
              DEV ONLY
            </span>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-cyan-100">
              Execution record creation preview
            </p>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Read-only creation result preview. No persistence, no Supabase
            write, no audit append, no trade mutation, no execution record
            storage.
          </p>
          <p className="mt-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-100">
            Source: {sourceLabel}
          </p>
          {sourceDescription && (
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              {sourceDescription}
            </p>
          )}
        </div>
      </div>

      <SafetyLabelList
        labels={[
          "Read-only",
          "No persistence",
          "No Supabase write",
          "No audit append",
          "No trade mutation",
          "No browser action",
        ]}
        tone="emerald"
      />

      {!result ? (
        <p className="mt-3 rounded-md border border-white/10 bg-black/20 p-3 text-sm leading-6 text-zinc-300">
          No creation result preview is available yet. Run the broker result
          preview diagnostics first; this panel will display rejection metadata
          when the latest source is preview-only or unsafe.
        </p>
      ) : (
        <div className="mt-3 rounded-md border border-white/10 bg-black/20 p-3">
          <ResultTone result={result} />

          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Detail label="Status" value={formatAgentCommandValue(result.status)} />
            <Detail label="Eligible" value={result.eligible ? "Yes" : "No"} />
            <Detail
              label="Safe to persist"
              value={result.safeToPersist ? "Yes" : "No"}
            />
            <Detail
              label="Candidate"
              value={candidate ? "Present" : "None"}
            />
            <Detail
              label="Idempotency"
              value={result.idempotencyKey ?? "n/a"}
            />
            <Detail
              label="Fingerprint"
              value={result.recordFingerprint ?? "n/a"}
            />
            <Detail
              label="No Supabase"
              value={result.auditMetadata.noSupabaseWrite ? "Yes" : "No"}
            />
            <Detail
              label="No trade mutation"
              value={result.auditMetadata.noTradeMutation ? "Yes" : "No"}
            />
          </div>

          {candidate && (
            <div className="mt-3 rounded-md border border-cyan-300/20 bg-cyan-300/[0.06] p-3">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-100">
                Candidate fields
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <Detail label="Record ID" value={candidate.recordId} />
                <Detail label="Broker" value={candidate.broker} />
                <Detail label="Side" value={candidate.side} />
                <Detail label="Ticker" value={candidate.ticker} />
                <Detail label="Quantity" value={String(candidate.quantity)} />
                <Detail label="Price" value={String(candidate.price)} />
                <Detail label="Currency" value={candidate.currency} />
                <Detail label="Phase" value={candidate.executionPhase} />
                <Detail
                  label="Confirmation"
                  value={candidate.confirmationTimestamp}
                />
                <Detail
                  label="Broker order"
                  value={candidate.brokerOrderId ?? "n/a"}
                />
                <Detail
                  label="Recommendation"
                  value={candidate.recommendationId ?? "n/a"}
                />
                <Detail label="Position" value={candidate.positionId ?? "n/a"} />
              </div>
            </div>
          )}

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
        </div>
      )}
    </div>
  );
}
