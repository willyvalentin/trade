import type { ReactNode } from "react";

import {
  Detail,
  SafetyLabelList,
  formatAgentCommandLabel,
  formatAgentCommandValue,
} from "@/components/execution/handoff-modal-shared";
import type { FinalizationActionDevFixtureResult } from "@/lib/finalization-action-dev-fixture";
import type {
  FinalizationActionDryRunImpactSummary,
  FinalizationActionDryRunProposedImpact,
} from "@/lib/finalization-action-dry-run-contract";
import {
  FINALIZATION_ACTION_DRY_RUN_STATUS_METADATA,
} from "@/lib/finalization-action-dry-run-contract";

type FinalizationActionPreviewProps = {
  canRun: boolean;
  isRunning: boolean;
  message: string;
  onRun: () => void;
  result: FinalizationActionDevFixtureResult | null;
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

function StatusTone({ result }: { result: FinalizationActionDevFixtureResult }) {
  const dryRunResult = result.dryRunResult;

  if (dryRunResult.status === "dry_run_ready") {
    return (
      <p className="mt-3 rounded-md border border-emerald-300/20 bg-emerald-300/[0.06] p-3 text-sm leading-6 text-emerald-100">
        Dry-run is ready to preview proposed impacts from controlled fixture
        data. This is not action execution, not finalization approval, and not
        write authority.
      </p>
    );
  }

  if (dryRunResult.status === "dry_run_needs_review") {
    return (
      <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
        Dry-run preview needs review. No finalization action, persistence,
        execution record, stats/PnL update, audit append, rollback, correction,
        or trade mutation occurred.
      </p>
    );
  }

  return (
    <p className="mt-3 rounded-md border border-rose-300/20 bg-rose-300/[0.06] p-3 text-sm leading-6 text-rose-100">
      Dry-run preview is blocked, unsupported, or not ready. No action was run
      and no writes or trade mutations occurred.
    </p>
  );
}

function ImpactSafetyRows({
  impact,
}: {
  impact: FinalizationActionDryRunProposedImpact;
}) {
  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      <Detail label="Disposition" value={formatAgentCommandValue(impact.disposition)} />
      <Detail label="Descriptive only" value={impact.descriptiveOnly ? "Yes" : "No"} />
      <Detail label="Proposed" value={impact.proposed ? "Yes" : "No"} />
      <Detail label="Safe to apply" value={impact.safeToApply ? "Yes" : "No"} />
    </div>
  );
}

function ImpactSections({
  impactSummary,
}: {
  impactSummary: FinalizationActionDryRunImpactSummary;
}) {
  const { finalizationImpact } = impactSummary;
  const { executionRecordImpact } = impactSummary;
  const { persistenceImpact } = impactSummary;
  const { statsPnlImpact } = impactSummary;
  const { auditImpact } = impactSummary;
  const { correctionImpact } = impactSummary;
  const { tradeMutationImpact } = impactSummary;

  return (
    <>
      <ResultSection title="Proposed finalization impact" tone="emerald">
        <p className="mt-2 text-sm leading-6 text-zinc-300">
          Proposed finalization impact is descriptive only and is not
          finalization approval.
        </p>
        <ImpactSafetyRows impact={finalizationImpact} />
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Detail
            label="Candidate id"
            value={formatAgentCommandValue(finalizationImpact.candidateId)}
          />
          <Detail
            label="Current state"
            value={formatAgentCommandValue(finalizationImpact.currentState)}
          />
          <Detail
            label="Proposed target"
            value={formatAgentCommandValue(
              finalizationImpact.proposedTargetState,
            )}
          />
          <Detail
            label="Finalization attempted"
            value={finalizationImpact.finalizationAttempted ? "Yes" : "No"}
          />
        </div>
      </ResultSection>

      <ResultSection title="Proposed execution-record impact" tone="sky">
        <p className="mt-2 text-sm leading-6 text-zinc-300">
          Proposed execution-record impact is descriptive only and is not
          execution record approval.
        </p>
        <ImpactSafetyRows impact={executionRecordImpact} />
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Detail
            label="Candidate present"
            value={executionRecordImpact.executionRecordCandidate ? "Yes" : "No"}
          />
          <Detail
            label="Fingerprint"
            value={formatAgentCommandValue(
              executionRecordImpact.proposedRecordFingerprint,
            )}
          />
          <Detail
            label="Idempotency key"
            value={formatAgentCommandValue(
              executionRecordImpact.proposedIdempotencyKey,
            )}
          />
          <Detail
            label="Record creation attempted"
            value={
              executionRecordImpact.executionRecordCreationAttempted
                ? "Yes"
                : "No"
            }
          />
        </div>
      </ResultSection>

      <ResultSection title="Proposed persistence impact" tone="violet">
        <p className="mt-2 text-sm leading-6 text-zinc-300">
          Proposed persistence impact is descriptive only and is not persistence
          approval.
        </p>
        <ImpactSafetyRows impact={persistenceImpact} />
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Detail
            label="Storage target"
            value={formatAgentCommandValue(
              persistenceImpact.proposedStorageTarget,
            )}
          />
          <Detail
            label="Boundary"
            value={formatAgentCommandValue(
              persistenceImpact.targetBoundary?.status,
            )}
          />
          <Detail
            label="Would persist"
            value={persistenceImpact.wouldPersist ? "Yes" : "No"}
          />
          <Detail
            label="Persistence attempted"
            value={persistenceImpact.persistenceAttempted ? "Yes" : "No"}
          />
        </div>
      </ResultSection>

      <ResultSection title="Proposed stats/PnL impact" tone="amber">
        <p className="mt-2 text-sm leading-6 text-zinc-300">
          Proposed stats/PnL impact is descriptive only and is not stats or PnL
          update approval.
        </p>
        <ImpactSafetyRows impact={statsPnlImpact} />
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Detail
            label="Quantity"
            value={formatAgentCommandValue(statsPnlImpact.proposedQuantity)}
          />
          <Detail
            label="Execution price"
            value={formatAgentCommandValue(
              statsPnlImpact.proposedExecutionPrice,
            )}
          />
          <Detail
            label="Fees"
            value={formatAgentCommandValue(statsPnlImpact.proposedFees)}
          />
          <Detail
            label="Stats update attempted"
            value={statsPnlImpact.statsUpdateAttempted ? "Yes" : "No"}
          />
        </div>
      </ResultSection>

      <ResultSection title="Proposed audit impact" tone="sky">
        <p className="mt-2 text-sm leading-6 text-zinc-300">
          Proposed audit impact is descriptive only and is not audit append
          approval.
        </p>
        <ImpactSafetyRows impact={auditImpact} />
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Detail
            label="Event types"
            value={auditImpact.proposedAuditEventTypes.join(", ") || "—"}
          />
          <Detail
            label="Evidence refs"
            value={String(auditImpact.sourceEvidenceReferences.length)}
          />
          <Detail
            label="Manual approval"
            value={formatAgentCommandValue(
              auditImpact.manualApprovalReference,
            )}
          />
          <Detail
            label="Audit append attempted"
            value={auditImpact.auditAppendAttempted ? "Yes" : "No"}
          />
        </div>
      </ResultSection>

      <ResultSection title="Proposed correction/rollback impact" tone="rose">
        <p className="mt-2 text-sm leading-6 text-zinc-300">
          Proposed correction/rollback impact is descriptive only and is not
          rollback or correction approval.
        </p>
        <ImpactSafetyRows impact={correctionImpact} />
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Detail
            label="Correction strategy"
            value={formatAgentCommandValue(
              correctionImpact.correctionStrategyReference,
            )}
          />
          <Detail
            label="Would rollback"
            value={correctionImpact.wouldRollback ? "Yes" : "No"}
          />
          <Detail
            label="Would correct"
            value={correctionImpact.wouldCorrect ? "Yes" : "No"}
          />
          <Detail
            label="Rollback attempted"
            value={correctionImpact.rollbackAttempted ? "Yes" : "No"}
          />
        </div>
      </ResultSection>

      <ResultSection title="Proposed trade mutation impact" tone="rose">
        <p className="mt-2 text-sm leading-6 text-zinc-300">
          Trade mutation impact is always none/out-of-scope and does not mutate
          trade state.
        </p>
        <ImpactSafetyRows impact={tradeMutationImpact} />
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Detail
            label="Disposition"
            value={formatAgentCommandValue(tradeMutationImpact.disposition)}
          />
          <Detail
            label="Would mutate trade"
            value={tradeMutationImpact.wouldMutateTrade ? "Yes" : "No"}
          />
          <Detail
            label="Trade mutation attempted"
            value={tradeMutationImpact.tradeMutationAttempted ? "Yes" : "No"}
          />
          <Detail
            label="Out of scope"
            value={formatAgentCommandValue(
              tradeMutationImpact.outOfScopeReason,
            )}
          />
        </div>
      </ResultSection>
    </>
  );
}

export function FinalizationActionPreview({
  canRun,
  isRunning,
  message,
  onRun,
  result,
  unavailableReason,
}: FinalizationActionPreviewProps) {
  const dryRunResult = result?.dryRunResult ?? null;
  const statusMetadata = dryRunResult
    ? FINALIZATION_ACTION_DRY_RUN_STATUS_METADATA[dryRunResult.status]
    : null;

  return (
    <details className="rounded-md border border-sky-300/15 bg-sky-300/[0.04] p-4">
      <summary className="cursor-pointer select-none font-mono text-xs font-bold uppercase tracking-[0.16em] text-sky-100">
        Finalization Action Dry-run Preview
      </summary>

      <div className="mt-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-sky-300/30 bg-sky-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-sky-100">
                Dry-run Preview Only
              </span>
              <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-100">
                Controlled fixture only
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              Read-only finalization action dry-run preview from controlled
              fixture data. This does not run an action, finalize, persist,
              create an execution record, update stats or PnL, append audit,
              rollback, correct, mutate trade state, run browser automation,
              send to broker, or interact with Avanza.
            </p>
          </div>

          <button
            className="rounded-md border border-sky-300/30 bg-sky-300/10 px-3 py-2 text-left font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canRun || isRunning}
            onClick={onRun}
            type="button"
          >
            {isRunning
              ? "Running finalization action dry-run preview..."
              : "Run finalization action dry-run preview"}
          </button>
        </div>

        <SafetyLabelList
          labels={[
            "Dev preview only",
            "Dry-run only",
            "Proposed impact only",
            "Not action execution",
            "Not finalization approval",
            "Not persistence approval",
            "Not execution record approval",
            "Not stats/PnL update approval",
            "Not audit append approval",
            "Not rollback/correction approval",
            "Does not mutate trade state",
            "dryRunOnly=true",
            "safeToRunFinalizationAction=false",
            "safeToFinalize=false",
            "safeToPersist=false",
            "safeToCreateExecutionRecord=false",
            "safeToUpdateStats=false",
            "safeToAppendAudit=false",
            "safeToRollback=false",
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

        {result && dryRunResult && (
          <div className="mt-3 rounded-md border border-white/10 bg-black/20 p-3">
            <StatusTone result={result} />

            <ResultSection title="Dry-run status" tone="violet">
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <Detail
                  label="Dry-run status"
                  value={formatAgentCommandValue(dryRunResult.status)}
                />
                <Detail
                  label="Action validation"
                  value={formatAgentCommandValue(
                    result.actionValidationResult.status,
                  )}
                />
                <Detail
                  label="Dry-run only"
                  value={dryRunResult.dryRunOnly ? "Yes" : "No"}
                />
                <Detail
                  label="Writes attempted"
                  value={
                    dryRunResult.impactSummary.writesAttempted ? "Yes" : "No"
                  }
                />
              </div>
            </ResultSection>

            <ResultSection title="Validation summary" tone="emerald">
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <Detail
                  label="Validation present"
                  value={
                    dryRunResult.validationSummary.validationResultPresent
                      ? "Yes"
                      : "No"
                  }
                />
                <Detail
                  label="Validation status"
                  value={formatAgentCommandValue(
                    dryRunResult.validationSummary.validationStatus,
                  )}
                />
                <Detail
                  label="Finalization validation"
                  value={formatAgentCommandValue(
                    dryRunResult.validationSummary.finalizationValidationStatus,
                  )}
                />
                <Detail
                  label="Transition validation"
                  value={formatAgentCommandValue(
                    dryRunResult.validationSummary.transitionValidationStatus,
                  )}
                />
                <Detail
                  label="Action candidate valid"
                  value={
                    dryRunResult.validationSummary.actionCandidateValid
                      ? "Yes"
                      : "No"
                  }
                />
                <Detail
                  label="Requires manual review"
                  value={
                    dryRunResult.validationSummary.requiresManualReview
                      ? "Yes"
                      : "No"
                  }
                />
              </div>
            </ResultSection>

            <ImpactSections impactSummary={dryRunResult.impactSummary} />

            <div className="grid gap-3 lg:grid-cols-2">
              <InlineList
                emptyLabel="No blocked reasons."
                items={dryRunResult.blockedReasons.map(String)}
                title="Blocked reasons"
                tone="rose"
              />
              <InlineList
                emptyLabel="No warnings."
                items={dryRunResult.warnings.map(String)}
                title="Warnings"
                tone="amber"
              />
            </div>

            <ResultSection title="Safety policy" tone="rose">
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <Detail
                  label="Run action"
                  value={dryRunResult.safeToRunFinalizationAction ? "Yes" : "No"}
                />
                <Detail
                  label="Finalize"
                  value={dryRunResult.safeToFinalize ? "Yes" : "No"}
                />
                <Detail
                  label="Persist"
                  value={dryRunResult.safeToPersist ? "Yes" : "No"}
                />
                <Detail
                  label="Create execution record"
                  value={
                    dryRunResult.safeToCreateExecutionRecord ? "Yes" : "No"
                  }
                />
                <Detail
                  label="Update stats"
                  value={dryRunResult.safeToUpdateStats ? "Yes" : "No"}
                />
                <Detail
                  label="Append audit"
                  value={dryRunResult.safeToAppendAudit ? "Yes" : "No"}
                />
                <Detail
                  label="Rollback"
                  value={dryRunResult.safeToRollback ? "Yes" : "No"}
                />
                <Detail
                  label="Mutate trade"
                  value={dryRunResult.safeToMutateTrade ? "Yes" : "No"}
                />
              </div>
            </ResultSection>

            <ResultSection title="Status metadata" tone="sky">
              <p className="mt-2 text-sm leading-6 text-zinc-300">
                {statusMetadata?.reason ??
                  "Status metadata unavailable for this dry-run status."}
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <Detail
                  label="Requires manual review"
                  value={statusMetadata?.requiresManualReview ? "Yes" : "No"}
                />
                <Detail
                  label="Blocks writes"
                  value={statusMetadata?.blocksWrites ? "Yes" : "No"}
                />
                <Detail
                  label="Dry-run executed"
                  value={dryRunResult.dryRunExecuted ? "Yes" : "No"}
                />
                <Detail
                  label="Trade mutation attempted"
                  value={dryRunResult.tradeMutationAttempted ? "Yes" : "No"}
                />
              </div>
            </ResultSection>
          </div>
        )}
      </div>
    </details>
  );
}
