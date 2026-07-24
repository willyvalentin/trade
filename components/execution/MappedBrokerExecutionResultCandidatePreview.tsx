import {
  Detail,
  SafetyLabelList,
  formatAgentCommandLabel,
  formatAgentCommandValue,
} from "@/components/execution/handoff-modal-shared";
import type { EvidenceToBrokerExecutionResultMapperResult } from "@/lib/evidence-to-broker-execution-result-mapper-contract";

type MappedBrokerExecutionResultCandidatePreviewProps = {
  canRun: boolean;
  isRunning: boolean;
  message: string;
  onRun: () => void;
  result: EvidenceToBrokerExecutionResultMapperResult | null;
  unavailableReason?: string | null;
};

function StatusTone({
  result,
}: {
  result: EvidenceToBrokerExecutionResultMapperResult;
}) {
  if (result.status === "mapped_candidate" && result.mappedCandidate) {
    return (
      <p className="mt-3 rounded-md border border-emerald-300/20 bg-emerald-300/[0.06] p-3 text-sm leading-6 text-emerald-100">
        Mapped candidate available. No runtime BrokerExecutionResult was
        created, no execution record was created, and no trade state was
        changed.
      </p>
    );
  }

  if (result.status === "partial_fill_review") {
    return (
      <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
        Mapping requires partial-fill review. Partial or uncertain evidence
        remains non-persistent and non-mutating.
      </p>
    );
  }

  if (result.status === "needs_review") {
    return (
      <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
        Mapping requires review. No candidate was created, persisted, or used
        to mutate trades.
      </p>
    );
  }

  return (
    <p className="mt-3 rounded-md border border-rose-300/20 bg-rose-300/[0.06] p-3 text-sm leading-6 text-rose-100">
      Mapping rejected. No candidate was created, persisted, or used to mutate
      trades.
    </p>
  );
}

function InlineList({
  emptyLabel,
  items,
  title,
  tone,
}: {
  emptyLabel: string;
  items: string[];
  title: string;
  tone: "amber" | "rose" | "violet";
}) {
  const toneClassName =
    tone === "rose"
      ? "border-rose-300/20 bg-rose-300/[0.06] text-rose-100"
      : tone === "amber"
        ? "border-amber-300/20 bg-amber-300/[0.06] text-amber-100"
        : "border-violet-300/20 bg-violet-300/[0.06] text-violet-100";

  return (
    <div className={`mt-3 rounded-md border p-3 ${toneClassName}`}>
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em]">
        {title}
      </p>
      {items.length === 0 ? (
        <p className="mt-2 text-xs leading-5 text-zinc-300">{emptyLabel}</p>
      ) : (
        <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
          {items.map((item) => (
            <li key={item}>{formatAgentCommandLabel(item)}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function MappedBrokerExecutionResultCandidatePreview({
  canRun,
  isRunning,
  message,
  onRun,
  result,
  unavailableReason,
}: MappedBrokerExecutionResultCandidatePreviewProps) {
  const candidate = result?.mappedCandidate ?? null;
  const partialFill = candidate?.partialFill ?? result?.partialFillMapping ?? null;

  return (
    <details className="rounded-md border border-violet-300/15 bg-violet-300/[0.04] p-4">
      <summary className="cursor-pointer select-none font-mono text-xs font-bold uppercase tracking-[0.16em] text-violet-100">
        Mapped BrokerExecutionResult candidate preview
      </summary>

      <div className="mt-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-violet-300/30 bg-violet-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-violet-100">
                Preview only
              </span>
              <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-100">
                Dev fixture / sandbox only
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              Read-only preview of the mapped broker-result candidate. This
              does not create a runtime BrokerExecutionResult, persist an
              execution record, append audit events, mutate trades, or interact
              with Avanza.
            </p>
          </div>

          <button
            className="rounded-md border border-violet-300/30 bg-violet-300/10 px-3 py-2 text-left font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-violet-100 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canRun || isRunning}
            onClick={onRun}
            type="button"
          >
            {isRunning
              ? "Running mapped candidate preview..."
              : "Run mapped candidate preview"}
          </button>
        </div>

        <SafetyLabelList
          labels={[
            "Candidate only",
            "Not runtime BrokerExecutionResult",
            "Not execution record",
            "Not persisted",
            "Does not mutate trade state",
            "safeToPersist=false",
            "safeToMutateTrade=false",
          ]}
          tone="violet"
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
              <Detail label="Mapper status" value={formatAgentCommandValue(result.status)} />
              <Detail
                label="Candidate"
                value={candidate ? "Present" : "None"}
              />
              <Detail
                label="Safe to persist"
                value={result.safeToPersist ? "True" : "False"}
              />
              <Detail
                label="Safe to mutate trade"
                value={result.safeToMutateTrade ? "True" : "False"}
              />
              <Detail
                label="Runtime broker result"
                value={result.brokerExecutionResultCreated ? "Created" : "Not created"}
              />
              <Detail
                label="Persistence"
                value={result.persistenceAttempted ? "Attempted" : "Not attempted"}
              />
              <Detail
                label="Trade mutation"
                value={result.tradeMutationAttempted ? "Attempted" : "Not attempted"}
              />
              <Detail
                label="Audit append"
                value={result.auditAppendAttempted ? "Attempted" : "Not attempted"}
              />
            </div>

            {candidate && (
              <div className="mt-3 rounded-md border border-violet-300/20 bg-violet-300/[0.06] p-3">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-violet-100">
                  Candidate summary
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <Detail label="Broker" value={candidate.broker} />
                  <Detail
                    label="Source"
                    value={formatAgentCommandValue(candidate.sourceClassification)}
                  />
                  <Detail
                    label="Instrument"
                    value={candidate.instrument.instrumentName}
                  />
                  <Detail
                    label="Ticker"
                    value={candidate.instrument.ticker ?? "n/a"}
                  />
                  <Detail label="Side" value={candidate.execution.side} />
                  <Detail
                    label="Quantity"
                    value={String(candidate.execution.quantity)}
                  />
                  <Detail
                    label="Price"
                    value={String(candidate.price.executionPrice)}
                  />
                  <Detail label="Currency" value={candidate.price.currency} />
                  <Detail
                    label="Confirmation"
                    value={candidate.confirmationTimestamp}
                  />
                  <Detail
                    label="Captured"
                    value={candidate.capturedTimestamp}
                  />
                  <Detail
                    label="Broker order"
                    value={candidate.brokerReferences.brokerOrderId ?? "n/a"}
                  />
                  <Detail
                    label="Broker confirmation"
                    value={
                      candidate.brokerReferences.brokerConfirmationId ?? "n/a"
                    }
                  />
                </div>
              </div>
            )}

            <div className="mt-3 rounded-md border border-white/10 bg-black/20 p-3">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-violet-100">
                Provenance and fingerprint
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <Detail
                  label="Evidence fingerprint"
                  value={result.provenanceSnapshot.evidenceFingerprint ?? "n/a"}
                />
                <Detail
                  label="Capture ID"
                  value={result.provenanceSnapshot.captureId ?? "n/a"}
                />
                <Detail
                  label="Request ID"
                  value={result.provenanceSnapshot.requestId ?? "n/a"}
                />
                <Detail
                  label="Handoff fingerprint"
                  value={
                    result.fingerprintContribution.handoffPayloadFingerprint ??
                    "n/a"
                  }
                />
                <Detail
                  label="Broker reference fingerprint"
                  value={
                    result.fingerprintContribution
                      .brokerReferenceFingerprintInput ?? "n/a"
                  }
                />
                <Detail
                  label="Field mappings"
                  value={String(result.fieldMappingSnapshot.length)}
                />
              </div>
            </div>

            {partialFill && (
              <div className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100">
                  Partial-fill status
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <Detail
                    label="Status"
                    value={formatAgentCommandValue(partialFill.status)}
                  />
                  <Detail
                    label="Requires review"
                    value={partialFill.requiresReview ? "True" : "False"}
                  />
                  <Detail
                    label="Filled quantity"
                    value={
                      partialFill.filledQuantity == null
                        ? "n/a"
                        : String(partialFill.filledQuantity)
                    }
                  />
                  <Detail
                    label="Average fill"
                    value={
                      partialFill.averageFillPrice == null
                        ? "n/a"
                        : String(partialFill.averageFillPrice)
                    }
                  />
                </div>
              </div>
            )}

            <InlineList
              emptyLabel="No mapper rejection reasons."
              items={result.rejectionReasons}
              title="Rejection reasons"
              tone="rose"
            />
            <InlineList
              emptyLabel="No mapper warnings."
              items={result.warnings}
              title="Warnings"
              tone="amber"
            />
            <InlineList
              emptyLabel="No candidate review flags."
              items={candidate?.reviewFlags ?? []}
              title="Review flags"
              tone="violet"
            />
          </div>
        )}
      </div>
    </details>
  );
}
