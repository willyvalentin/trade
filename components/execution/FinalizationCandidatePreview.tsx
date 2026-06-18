import type { ReactNode } from "react";

import {
  Detail,
  SafetyLabelList,
  formatAgentCommandLabel,
  formatAgentCommandValue,
} from "@/components/execution/handoff-modal-shared";
import type { FinalizationCandidateBuilderResult } from "@/lib/finalization-candidate-builder-contract";

type FinalizationCandidatePreviewProps = {
  canRun: boolean;
  isRunning: boolean;
  message: string;
  onRun: () => void;
  result: FinalizationCandidateBuilderResult | null;
  unavailableReason?: string | null;
};

type Tone = "amber" | "emerald" | "rose" | "sky" | "violet";

function toneClassName(tone: Tone) {
  switch (tone) {
    case "emerald":
      return "border-emerald-300/20 bg-emerald-300/[0.06] text-emerald-100";
    case "amber":
      return "border-amber-300/20 bg-amber-300/[0.06] text-amber-100";
    case "rose":
      return "border-rose-300/20 bg-rose-300/[0.06] text-rose-100";
    case "sky":
      return "border-sky-300/20 bg-sky-300/[0.06] text-sky-100";
    case "violet":
      return "border-violet-300/20 bg-violet-300/[0.06] text-violet-100";
  }
}

function headingClassName(tone: Tone) {
  switch (tone) {
    case "emerald":
      return "text-emerald-100";
    case "amber":
      return "text-amber-100";
    case "rose":
      return "text-rose-100";
    case "sky":
      return "text-sky-100";
    case "violet":
      return "text-violet-100";
  }
}

function ResultSection({
  children,
  title,
  tone,
}: {
  children: ReactNode;
  title: string;
  tone: Tone;
}) {
  return (
    <div className={`mt-3 rounded-md border p-3 ${toneClassName(tone)}`}>
      <p
        className={`font-mono text-[10px] font-bold uppercase tracking-[0.14em] ${headingClassName(tone)}`}
      >
        {title}
      </p>
      {children}
    </div>
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
  tone: Tone;
}) {
  return (
    <div className={`mt-3 rounded-md border p-3 ${toneClassName(tone)}`}>
      <p
        className={`font-mono text-[10px] font-bold uppercase tracking-[0.14em] ${headingClassName(tone)}`}
      >
        {title}
      </p>
      {items.length === 0 ? (
        <p className="mt-2 text-xs leading-5 text-zinc-300">{emptyLabel}</p>
      ) : (
        <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
          {items.map((item, index) => (
            <li key={`${item}-${index}`}>{formatAgentCommandLabel(item)}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatMoney(
  amount:
    | {
        currency: string;
        rawLabel?: string | null;
        value: number;
      }
    | null
    | undefined,
) {
  if (!amount) {
    return "—";
  }

  return `${amount.value} ${amount.currency}`;
}

function StatusTone({ result }: { result: FinalizationCandidateBuilderResult }) {
  if (result.status === "candidate_built") {
    return (
      <p className="mt-3 rounded-md border border-emerald-300/20 bg-emerald-300/[0.06] p-3 text-sm leading-6 text-emerald-100">
        Candidate metadata was built from controlled fixture data. This is not
        finalization-ready, not persistence-ready, and not trade mutation
        approval.
      </p>
    );
  }

  if (
    result.status === "needs_review" ||
    result.status === "partial_fill_review" ||
    result.status === "duplicate_review"
  ) {
    return (
      <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
        Candidate metadata requires review. No finalization, persistence,
        execution record, stats update, PnL update, or trade mutation occurred.
      </p>
    );
  }

  return (
    <p className="mt-3 rounded-md border border-rose-300/20 bg-rose-300/[0.06] p-3 text-sm leading-6 text-rose-100">
      Candidate preview is blocked or unsupported. No finalization,
      persistence, execution record, stats update, PnL update, or trade
      mutation occurred.
    </p>
  );
}

function PreconditionRows({
  result,
}: {
  result: FinalizationCandidateBuilderResult;
}) {
  return (
    <div className="mt-3 grid gap-2">
      {result.preconditionResults.map((precondition) => (
        <div
          className="rounded-md border border-white/10 bg-black/25 p-3"
          key={precondition.precondition}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-zinc-100">
              {formatAgentCommandLabel(precondition.precondition)}
            </p>
            <span
              className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${
                precondition.status === "passed"
                  ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
                  : precondition.status === "review_required"
                    ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
                    : "border-rose-300/20 bg-rose-300/10 text-rose-100"
              }`}
            >
              {formatAgentCommandLabel(precondition.status)}
            </span>
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Detail
              label="Satisfied"
              value={precondition.satisfied ? "Yes" : "No"}
            />
            <Detail
              label="Rejection reason"
              value={formatAgentCommandValue(precondition.rejectionReason)}
            />
            <Detail
              label="Warning"
              value={formatAgentCommandValue(precondition.warning)}
            />
            <Detail
              label="Details"
              value={formatAgentCommandValue(precondition.details)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FinalizationCandidatePreview({
  canRun,
  isRunning,
  message,
  onRun,
  result,
  unavailableReason,
}: FinalizationCandidatePreviewProps) {
  const candidate = result?.candidate ?? null;

  return (
    <details className="rounded-md border border-violet-300/15 bg-violet-300/[0.04] p-4">
      <summary className="cursor-pointer select-none font-mono text-xs font-bold uppercase tracking-[0.16em] text-violet-100">
        Finalization Candidate Preview
      </summary>

      <div className="mt-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-violet-300/30 bg-violet-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-violet-100">
                Candidate Preview Only
              </span>
              <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-100">
                Controlled fixture only
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              Read-only finalization candidate preview from controlled fixture
              data. This does not finalize, persist, create an execution
              record, update stats or PnL, mutate trade state, run browser
              automation, send to broker, or interact with Avanza.
            </p>
          </div>

          <button
            className="rounded-md border border-violet-300/30 bg-violet-300/10 px-3 py-2 text-left font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-violet-100 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canRun || isRunning}
            onClick={onRun}
            type="button"
          >
            {isRunning
              ? "Running finalization candidate preview..."
              : "Run finalization candidate preview"}
          </button>
        </div>

        <SafetyLabelList
          labels={[
            "Dev preview only",
            "Candidate only",
            "Not finalization approval",
            "Not persistence approval",
            "Not execution record approval",
            "Not stats/PnL update approval",
            "Does not mutate trade state",
            "safeToFinalize=false",
            "safeToPersist=false",
            "safeToCreateExecutionRecord=false",
            "safeToUpdateStats=false",
            "safeToMutateTrade=false",
            "automatic mode disabled",
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

            <ResultSection title="Builder status" tone="violet">
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <Detail
                  label="Builder status"
                  value={formatAgentCommandValue(result.status)}
                />
                <Detail
                  label="Candidate status"
                  value={formatAgentCommandValue(result.candidateStatus)}
                />
                <Detail
                  label="Candidate present"
                  value={candidate ? "Yes" : "No"}
                />
                <Detail
                  label="Evaluated at"
                  value={formatAgentCommandValue(result.evaluatedAt)}
                />
                <Detail
                  label="Safe to finalize"
                  value={result.safeToFinalize ? "True" : "False"}
                />
                <Detail
                  label="Safe to persist"
                  value={result.safeToPersist ? "True" : "False"}
                />
                <Detail
                  label="Safe to create execution record"
                  value={result.safeToCreateExecutionRecord ? "True" : "False"}
                />
                <Detail
                  label="Safe to mutate trade"
                  value={result.safeToMutateTrade ? "True" : "False"}
                />
              </div>
            </ResultSection>

            <ResultSection title="Finalization candidate status" tone="emerald">
              <p className="mt-2 text-sm leading-6 text-zinc-300">
                Candidate status is metadata only. Candidate ready is not
                finalization-ready and does not bypass a future validator.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <Detail
                  label="Candidate id"
                  value={formatAgentCommandValue(candidate?.candidateId)}
                />
                <Detail
                  label="Candidate status"
                  value={formatAgentCommandValue(candidate?.status)}
                />
                <Detail
                  label="Partial-fill status"
                  value={formatAgentCommandValue(candidate?.partialFillStatus)}
                />
                <Detail
                  label="Finalization attempted"
                  value={candidate?.finalizationAttempted ? "Yes" : "No"}
                />
              </div>
            </ResultSection>

            <ResultSection title="Evidence summary" tone="sky">
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <Detail
                  label="Broker"
                  value={formatAgentCommandValue(
                    candidate?.evidenceSummary.broker,
                  )}
                />
                <Detail
                  label="Source"
                  value={formatAgentCommandValue(
                    candidate?.evidenceSummary.sourceClassification,
                  )}
                />
                <Detail
                  label="Final note fingerprint"
                  value={formatAgentCommandValue(
                    candidate?.evidenceSummary.finalNoteEvidenceFingerprint,
                  )}
                />
                <Detail
                  label="Handoff fingerprint"
                  value={formatAgentCommandValue(
                    candidate?.evidenceSummary.handoffPayloadFingerprint,
                  )}
                />
              </div>
            </ResultSection>

            <ResultSection title="Match summary" tone="violet">
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <Detail
                  label="Match status"
                  value={formatAgentCommandValue(candidate?.matchSummary.status)}
                />
                <Detail
                  label="Confidence"
                  value={formatAgentCommandValue(
                    candidate?.matchSummary.confidence,
                  )}
                />
                <Detail
                  label="Matched"
                  value={candidate?.matchSummary.matched ? "Yes" : "No"}
                />
                <Detail
                  label="Lifecycle suggestion"
                  value={formatAgentCommandValue(
                    candidate?.matchSummary.lifecycleTransitionSuggestion,
                  )}
                />
              </div>
            </ResultSection>

            <ResultSection title="Settlement summary" tone="emerald">
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <Detail
                  label="Instrument"
                  value={`${candidate?.settlementSummary.instrument.instrumentName ?? "—"} / ${
                    candidate?.settlementSummary.instrument.ticker ?? "—"
                  }`}
                />
                <Detail
                  label="Side"
                  value={formatAgentCommandValue(
                    candidate?.settlementSummary.side,
                  )}
                />
                <Detail
                  label="Quantity"
                  value={formatAgentCommandValue(
                    candidate?.settlementSummary.quantity,
                  )}
                />
                <Detail
                  label="Execution price"
                  value={formatMoney(
                    candidate?.settlementSummary.executionPrice,
                  )}
                />
                <Detail
                  label="Business date"
                  value={formatAgentCommandValue(
                    candidate?.settlementSummary.businessDate,
                  )}
                />
                <Detail
                  label="Settlement date"
                  value={formatAgentCommandValue(
                    candidate?.settlementSummary.settlementDate,
                  )}
                />
                <Detail
                  label="Note reference"
                  value={formatAgentCommandValue(
                    candidate?.settlementSummary.noteReferenceNumber,
                  )}
                />
                <Detail
                  label="Total amount"
                  value={formatMoney(candidate?.settlementSummary.totalAmount)}
                />
              </div>
            </ResultSection>

            <ResultSection title="Fee summary" tone="amber">
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <Detail
                  label="Commission"
                  value={formatMoney(candidate?.feeSummary.commission)}
                />
                <Detail
                  label="Total fees"
                  value={formatMoney(candidate?.feeSummary.totalFees)}
                />
                <Detail
                  label="Missing fee data"
                  value={candidate?.feeSummary.missingFeeData ? "Yes" : "No"}
                />
                <Detail
                  label="Review required"
                  value={candidate?.feeSummary.reviewRequired ? "Yes" : "No"}
                />
              </div>
            </ResultSection>

            <ResultSection title="FX summary" tone="sky">
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <Detail
                  label="Base currency"
                  value={formatAgentCommandValue(
                    candidate?.fxSummary.baseCurrency,
                  )}
                />
                <Detail
                  label="Settlement currency"
                  value={formatAgentCommandValue(
                    candidate?.fxSummary.settlementCurrency,
                  )}
                />
                <Detail
                  label="Missing FX data"
                  value={candidate?.fxSummary.missingFxData ? "Yes" : "No"}
                />
                <Detail
                  label="FX rates"
                  value={String(candidate?.fxSummary.fxRates.length ?? 0)}
                />
              </div>
            </ResultSection>

            <ResultSection title="PnL adjustment summary" tone="amber">
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <Detail
                  label="Status"
                  value={formatAgentCommandValue(
                    candidate?.pnlAdjustmentSummary.status,
                  )}
                />
                <Detail
                  label="Preview only"
                  value={candidate?.pnlAdjustmentSummary.previewOnly ? "Yes" : "No"}
                />
                <Detail
                  label="Cash impact"
                  value={formatMoney(candidate?.pnlAdjustmentSummary.cashImpact)}
                />
                <Detail
                  label="Stats update attempted"
                  value={
                    candidate?.pnlAdjustmentSummary.statsUpdateAttempted
                      ? "Yes"
                      : "No"
                  }
                />
              </div>
            </ResultSection>

            <ResultSection title="Precondition results" tone="violet">
              <PreconditionRows result={result} />
            </ResultSection>

            <div className="grid gap-3 lg:grid-cols-3">
              <InlineList
                emptyLabel="No review flags."
                items={(candidate?.reviewFlags ?? []).map(String)}
                title="Review flags"
                tone="violet"
              />
              <InlineList
                emptyLabel="No warnings."
                items={result.warnings.map(String)}
                title="Warnings"
                tone="amber"
              />
              <InlineList
                emptyLabel="No rejection reasons."
                items={result.rejectionReasons.map(String)}
                title="Rejection reasons"
                tone="rose"
              />
            </div>

            <ResultSection title="Policy snapshot" tone="sky">
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <Detail
                  label="Allows candidate build"
                  value={result.policySnapshot.allowsCandidateBuild ? "Yes" : "No"}
                />
                <Detail
                  label="Allows finalization"
                  value={result.policySnapshot.allowsFinalization ? "Yes" : "No"}
                />
                <Detail
                  label="Allows persistence"
                  value={result.policySnapshot.allowsPersistence ? "Yes" : "No"}
                />
                <Detail
                  label="Automatic mode"
                  value={
                    result.policySnapshot.allowsAutomaticMode
                      ? "Enabled"
                      : "Disabled"
                  }
                />
              </div>
            </ResultSection>

            <ResultSection title="Safety policy" tone="rose">
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <Detail
                  label="Finalization implementation"
                  value={
                    result.safetyPolicy.finalizationImplementationEnabled
                      ? "Enabled"
                      : "Disabled"
                  }
                />
                <Detail
                  label="Persistence implementation"
                  value={
                    result.safetyPolicy.persistenceImplementationEnabled
                      ? "Enabled"
                      : "Disabled"
                  }
                />
                <Detail
                  label="Execution record creation"
                  value={
                    result.safetyPolicy.executionRecordCreationEnabled
                      ? "Enabled"
                      : "Disabled"
                  }
                />
                <Detail
                  label="Stats update"
                  value={
                    result.safetyPolicy.statsUpdateEnabled
                      ? "Enabled"
                      : "Disabled"
                  }
                />
                <Detail
                  label="Trade mutation"
                  value={
                    result.safetyPolicy.tradeMutationEnabled
                      ? "Enabled"
                      : "Disabled"
                  }
                />
                <Detail
                  label="Audit append"
                  value={
                    result.safetyPolicy.auditAppendEnabled
                      ? "Enabled"
                      : "Disabled"
                  }
                />
                <Detail
                  label="Browser automation"
                  value={
                    result.safetyPolicy.browserAutomationEnabled
                      ? "Enabled"
                      : "Disabled"
                  }
                />
                <Detail
                  label="Avanza automation"
                  value={
                    result.safetyPolicy.avanzaAutomationEnabled
                      ? "Enabled"
                      : "Disabled"
                  }
                />
              </div>
            </ResultSection>
          </div>
        )}
      </div>
    </details>
  );
}
