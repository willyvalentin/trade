import type { ReactNode } from "react";

import {
  Detail,
  SafetyLabelList,
  formatAgentCommandLabel,
  formatAgentCommandValue,
} from "@/components/execution/handoff-modal-shared";
import type { ExecutionRecordCandidateBuilderInvocationDevFixtureResult } from "@/lib/execution-record-candidate-builder-invocation-dev-fixture";

type ExecutionRecordCandidateBuilderInvocationPreviewProps = {
  canRun: boolean;
  isRunning: boolean;
  message: string;
  onRun: () => void;
  result: ExecutionRecordCandidateBuilderInvocationDevFixtureResult | null;
  unavailableReason?: string | null;
};

type Tone = "amber" | "emerald" | "fuchsia" | "rose" | "sky" | "violet";

const toneClassNames: Record<Tone, string> = {
  amber: "border-amber-300/20 bg-amber-300/[0.06] text-amber-100",
  emerald: "border-emerald-300/20 bg-emerald-300/[0.06] text-emerald-100",
  fuchsia: "border-fuchsia-300/20 bg-fuchsia-300/[0.06] text-fuchsia-100",
  rose: "border-rose-300/20 bg-rose-300/[0.06] text-rose-100",
  sky: "border-sky-300/20 bg-sky-300/[0.06] text-sky-100",
  violet: "border-violet-300/20 bg-violet-300/[0.06] text-violet-100",
};

const headingClassNames: Record<Tone, string> = {
  amber: "text-amber-100",
  emerald: "text-emerald-100",
  fuchsia: "text-fuchsia-100",
  rose: "text-rose-100",
  sky: "text-sky-100",
  violet: "text-violet-100",
};

function yesNo(value: boolean) {
  return value ? "Yes" : "No";
}

function PreviewSection({
  children,
  title,
  tone,
}: {
  children: ReactNode;
  title: string;
  tone: Tone;
}) {
  return (
    <section className={`mt-3 rounded-md border p-3 ${toneClassNames[tone]}`}>
      <h3
        className={`font-mono text-[10px] font-bold uppercase tracking-[0.14em] ${headingClassNames[tone]}`}
      >
        {title}
      </h3>
      {children}
    </section>
  );
}

function DetailGrid({ children }: { children: ReactNode }) {
  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {children}
    </div>
  );
}

function StringList({
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
    <PreviewSection title={title} tone={tone}>
      {items.length === 0 ? (
        <p className="mt-2 text-xs leading-5 text-zinc-300">{emptyLabel}</p>
      ) : (
        <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
          {items.map((item, index) => (
            <li key={`${item}-${index}`}>{formatAgentCommandLabel(item)}</li>
          ))}
        </ul>
      )}
    </PreviewSection>
  );
}

export function ExecutionRecordCandidateBuilderInvocationPreview({
  canRun,
  isRunning,
  message,
  onRun,
  result,
  unavailableReason,
}: ExecutionRecordCandidateBuilderInvocationPreviewProps) {
  const invocationResult = result?.invocationResult ?? null;
  const validatorResult = result?.validatorResult ?? null;
  const prerequisiteSummary = invocationResult?.prerequisiteSummary ?? null;
  const inputSourceSummary = invocationResult?.inputSourceSummary ?? null;
  const outputSummary = invocationResult?.outputSummary ?? null;
  const idempotencySummary = invocationResult?.idempotencySummary ?? null;
  const auditProvenanceSummary =
    invocationResult?.auditProvenanceSummary ?? null;
  const schemaReadinessSummary =
    invocationResult?.schemaReadinessSummary ?? null;
  const safetyPolicy = invocationResult?.safetyPolicy ?? null;
  const proposedCreationInput =
    inputSourceSummary?.proposedCreationInput ?? null;
  const builderResult = outputSummary?.candidateBuilderResult ?? null;
  const builderCandidate = outputSummary?.candidateOutput ?? null;
  const builderWarnings = builderResult?.warnings ?? [];
  const builderBlockedReasons = builderResult?.blockers ?? [];
  const builderReviewItems = builderResult?.rejectionReasons ?? [];

  return (
    <details className="rounded-md border border-fuchsia-300/15 bg-fuchsia-300/[0.04] p-4">
      <summary className="cursor-pointer select-none font-mono text-xs font-bold uppercase tracking-[0.16em] text-fuchsia-100">
        Execution Record Candidate Builder Invocation Preview
      </summary>

      <div className="mt-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-fuchsia-300/30 bg-fuchsia-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-fuchsia-100">
                Candidate builder invocation preview only
              </span>
              <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-100">
                Controlled fixture only
              </span>
              <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-amber-100">
                Boundary preview only
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              Dev-gated read-only preview from controlled fixture data. This
              calls validateExecutionRecordCandidateBuilderInvocation(...) and
              then invokeExecutionRecordCandidateBuilder(...). The wrapper may
              call buildExecutionRecordCandidate(...) only through its valid
              invocation-validation gate. Output is candidate-only and does not
              create an execution record, persist, append audit, update stats or
              PnL, rollback, correct, mutate trade state, send to broker, run
              browser automation, or interact with Avanza.
            </p>
          </div>

          <button
            className="rounded-md border border-fuchsia-300/30 bg-fuchsia-300/10 px-3 py-2 text-left font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-fuchsia-100 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canRun || isRunning}
            onClick={onRun}
            type="button"
          >
            {isRunning
              ? "Running candidate builder invocation preview..."
              : "Run candidate builder invocation preview"}
          </button>
        </div>

        <SafetyLabelList
          labels={[
            "Dev preview only",
            "Candidate builder invocation preview only",
            "Candidate-only output",
            "Fixture-only",
            "Explicit trigger only",
            "Wrapper invocation only",
            "Does not create execution record",
            "Does not persist",
            "Not persistence approval",
            "Not audit append approval",
            "Not stats/PnL update approval",
            "Not rollback/correction approval",
            "Does not mutate trade state",
            "Does not send to broker",
            "No Avanza/browser action",
            "automatic mode disabled",
            "safeToCallCandidateBuilder=false",
            "safeToCreateExecutionRecordCandidate=false",
            "safeToCreateExecutionRecord=false",
            "safeToPersist=false",
            "safeToUpdateStats=false",
            "safeToAppendAudit=false",
            "safeToRollback=false",
            "safeToMutateTrade=false",
          ]}
          tone="fuchsia"
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

        {invocationResult && validatorResult && (
          <div className="mt-3 rounded-md border border-white/10 bg-black/20 p-3">
            <PreviewSection title="Invocation status" tone="fuchsia">
              <p className="mt-2 text-sm leading-6 text-zinc-300">
                Invocation ready means boundary-ready only. The preview keeps
                safeToCallCandidateBuilder=false. The pure wrapper may call the
                candidate builder after valid invocation validation, but the
                returned output remains candidate-only and is not a write
                approval.
              </p>
              <DetailGrid>
                <Detail
                  label="Invocation status"
                  value={formatAgentCommandValue(invocationResult.status)}
                />
                <Detail
                  label="Decision recommendation"
                  value={formatAgentCommandValue(
                    invocationResult.decisionRecommendation,
                  )}
                />
                <Detail
                  label="Contract only"
                  value={yesNo(invocationResult.contractOnly)}
                />
                <Detail
                  label="Builder called"
                  value={yesNo(outputSummary?.candidateBuilderCalled ?? false)}
                />
              </DetailGrid>
            </PreviewSection>

            <PreviewSection title="Prerequisite summary" tone="sky">
              <DetailGrid>
                <Detail
                  label="Adapter result present"
                  value={yesNo(prerequisiteSummary?.adapterResultPresent ?? false)}
                />
                <Detail
                  label="Adapter validation valid"
                  value={yesNo(prerequisiteSummary?.adapterValidationValid ?? false)}
                />
                <Detail
                  label="Proposed input present"
                  value={yesNo(
                    prerequisiteSummary?.proposedCreationInputPresent ?? false,
                  )}
                />
                <Detail
                  label="Builder input fields"
                  value={yesNo(
                    prerequisiteSummary?.requiredBuilderInputFieldsPresent ??
                      false,
                  )}
                />
              </DetailGrid>
            </PreviewSection>

            <PreviewSection title="Input source summary" tone="violet">
              <DetailGrid>
                <Detail
                  label="From adapter input"
                  value={yesNo(
                    inputSourceSummary?.inputComesFromAdapterShapedProposedInput ??
                      false,
                  )}
                />
                <Detail
                  label="Adapter output validated"
                  value={yesNo(inputSourceSummary?.adapterOutputValidated ?? false)}
                />
                <Detail
                  label="Ticker"
                  value={formatAgentCommandValue(
                    proposedCreationInput?.expectedInstrument?.ticker,
                  )}
                />
                <Detail
                  label="Expected action"
                  value={formatAgentCommandValue(
                    proposedCreationInput?.expectedAction,
                  )}
                />
              </DetailGrid>
            </PreviewSection>

            <PreviewSection title="Output summary" tone="emerald">
              <p className="mt-2 text-sm leading-6 text-zinc-300">
                Candidate-only builder output is displayed for review. It is not
                persisted and is not approval to create, finalize, audit,
                rollback, mutate, or send anything.
              </p>
              <DetailGrid>
                <Detail
                  label="Candidate output only"
                  value={yesNo(outputSummary?.candidateOutputOnly ?? false)}
                />
                <Detail
                  label="Builder implemented"
                  value={yesNo(outputSummary?.builderInvocationImplemented ?? false)}
                />
                <Detail
                  label="Candidate output present"
                  value={yesNo(Boolean(outputSummary?.candidateOutput))}
                />
                <Detail
                  label="Safe to persist"
                  value={yesNo(outputSummary?.safeToPersist ?? false)}
                />
              </DetailGrid>
            </PreviewSection>

            <PreviewSection
              title="Candidate-builder invocation wrapper status"
              tone="fuchsia"
            >
              <DetailGrid>
                <Detail
                  label="Wrapper status"
                  value={formatAgentCommandValue(invocationResult.status)}
                />
                <Detail
                  label="Builder result status"
                  value={formatAgentCommandValue(builderResult?.status)}
                />
                <Detail
                  label="Builder eligible"
                  value={yesNo(builderResult?.eligible ?? false)}
                />
                <Detail
                  label="Not persisted"
                  value={yesNo(outputSummary?.safeToPersist === false)}
                />
              </DetailGrid>
            </PreviewSection>

            <PreviewSection
              title="Candidate-only builder output summary"
              tone="emerald"
            >
              <DetailGrid>
                <Detail
                  label="Record id"
                  value={formatAgentCommandValue(builderCandidate?.recordId)}
                />
                <Detail
                  label="Ticker"
                  value={formatAgentCommandValue(builderCandidate?.ticker)}
                />
                <Detail
                  label="Side"
                  value={formatAgentCommandValue(builderCandidate?.side)}
                />
                <Detail
                  label="Broker status"
                  value={formatAgentCommandValue(
                    builderCandidate?.brokerStatus,
                  )}
                />
                <Detail
                  label="Quantity"
                  value={formatAgentCommandValue(builderCandidate?.quantity)}
                />
                <Detail
                  label="Price"
                  value={formatAgentCommandValue(builderCandidate?.price)}
                />
                <Detail
                  label="Currency"
                  value={formatAgentCommandValue(builderCandidate?.currency)}
                />
                <Detail
                  label="Confirmation"
                  value={formatAgentCommandValue(
                    builderCandidate?.confirmationTimestamp,
                  )}
                />
              </DetailGrid>
            </PreviewSection>

            <PreviewSection
              title="Builder candidate fingerprint and idempotency"
              tone="amber"
            >
              <DetailGrid>
                <Detail
                  label="Record fingerprint"
                  value={formatAgentCommandValue(
                    builderCandidate?.recordFingerprint,
                  )}
                />
                <Detail
                  label="Idempotency key"
                  value={formatAgentCommandValue(
                    builderCandidate?.idempotencyKey,
                  )}
                />
                <Detail
                  label="Source evidence"
                  value={formatAgentCommandValue(
                    builderCandidate?.sourceEvidenceFingerprint,
                  )}
                />
                <Detail
                  label="Broker result fingerprint"
                  value={formatAgentCommandValue(
                    builderCandidate?.brokerResultFingerprint,
                  )}
                />
              </DetailGrid>
            </PreviewSection>

            <StringList
              emptyLabel="No builder candidate blockers."
              items={builderBlockedReasons}
              title="Builder candidate blocked reasons"
              tone="rose"
            />
            <StringList
              emptyLabel="No builder candidate warnings."
              items={builderWarnings}
              title="Builder candidate warnings"
              tone="amber"
            />
            <StringList
              emptyLabel="No builder candidate review items."
              items={builderReviewItems}
              title="Builder candidate review items"
              tone="sky"
            />

            <PreviewSection title="Idempotency summary" tone="amber">
              <DetailGrid>
                <Detail
                  label="Idempotency key"
                  value={formatAgentCommandValue(
                    idempotencySummary?.intendedExecutionRecordIdempotencyKey,
                  )}
                />
                <Detail
                  label="Candidate fingerprint"
                  value={formatAgentCommandValue(
                    idempotencySummary
                      ?.intendedExecutionRecordCandidateFingerprint,
                  )}
                />
                <Detail
                  label="Duplicate check separate"
                  value={yesNo(idempotencySummary?.duplicateDetectionSeparate ?? false)}
                />
                <Detail
                  label="Safe for write"
                  value={yesNo(idempotencySummary?.safeForWrite ?? false)}
                />
              </DetailGrid>
            </PreviewSection>

            <PreviewSection title="Audit/provenance summary" tone="sky">
              <DetailGrid>
                <Detail
                  label="Source chain"
                  value={yesNo(
                    auditProvenanceSummary?.sourceEvidenceChainPreserved ??
                      false,
                  )}
                />
                <Detail
                  label="Manual approval metadata"
                  value={yesNo(
                    auditProvenanceSummary?.manualApprovalMetadataPreserved ??
                      false,
                  )}
                />
                <Detail
                  label="Audit append separate"
                  value={yesNo(auditProvenanceSummary?.auditAppendSeparate ?? false)}
                />
                <Detail
                  label="Audit attempted"
                  value={yesNo(auditProvenanceSummary?.auditAppendAttempted ?? false)}
                />
              </DetailGrid>
            </PreviewSection>

            <PreviewSection title="Schema readiness summary" tone="violet">
              <DetailGrid>
                <Detail
                  label="Generated types"
                  value={yesNo(schemaReadinessSummary?.generatedTypesAvailable ?? false)}
                />
                <Detail
                  label="Migration proven"
                  value={yesNo(schemaReadinessSummary?.migrationApplicationProven ?? false)}
                />
                <Detail
                  label="Persistence boundary"
                  value={yesNo(schemaReadinessSummary?.persistenceBoundaryEnabled ?? false)}
                />
                <Detail
                  label="Production write"
                  value={yesNo(schemaReadinessSummary?.productionWriteEnabled ?? false)}
                />
              </DetailGrid>
            </PreviewSection>

            <PreviewSection title="Safety policy" tone="rose">
              <DetailGrid>
                <Detail
                  label="safeToCallCandidateBuilder"
                  value={yesNo(safetyPolicy?.safeToCallCandidateBuilder ?? false)}
                />
                <Detail
                  label="safeToCreateExecutionRecordCandidate"
                  value={yesNo(
                    safetyPolicy?.safeToCreateExecutionRecordCandidate ?? false,
                  )}
                />
                <Detail
                  label="safeToCreateExecutionRecord"
                  value={yesNo(safetyPolicy?.safeToCreateExecutionRecord ?? false)}
                />
                <Detail
                  label="automatic mode"
                  value={yesNo(safetyPolicy?.automaticModeAllowed ?? false)}
                />
              </DetailGrid>
            </PreviewSection>

            <StringList
              emptyLabel="No invocation blocked reasons."
              items={invocationResult.blockedReasons}
              title="Blocked reasons"
              tone="rose"
            />
            <StringList
              emptyLabel="No invocation warnings."
              items={invocationResult.warnings}
              title="Warnings"
              tone="amber"
            />
            <StringList
              emptyLabel="No invocation review items."
              items={invocationResult.reviewItems}
              title="Review items"
              tone="sky"
            />

            <PreviewSection title="Invocation validator status" tone="fuchsia">
              <DetailGrid>
                <Detail
                  label="Validation status"
                  value={formatAgentCommandValue(validatorResult.status)}
                />
                <Detail
                  label="Decision recommendation"
                  value={formatAgentCommandValue(
                    validatorResult.decisionRecommendation,
                  )}
                />
                <Detail
                  label="Validation only"
                  value={yesNo(validatorResult.validationOnly)}
                />
                <Detail
                  label="Builder attempted"
                  value={yesNo(
                    validatorResult.candidateBuilderInvocationAttempted,
                  )}
                />
              </DetailGrid>
            </PreviewSection>

            <PreviewSection
              title="Prerequisite validation summary"
              tone="sky"
            >
              <DetailGrid>
                <Detail
                  label="Invocation present"
                  value={yesNo(
                    validatorResult.prerequisiteValidationSummary
                      .invocationResultPresent,
                  )}
                />
                <Detail
                  label="Status recognized"
                  value={yesNo(
                    validatorResult.prerequisiteValidationSummary
                      .invocationStatusRecognized,
                  )}
                />
                <Detail
                  label="Proposed input complete"
                  value={yesNo(
                    validatorResult.prerequisiteValidationSummary
                      .proposedInputComplete,
                  )}
                />
                <Detail
                  label="Can validate boundary"
                  value={yesNo(
                    validatorResult.prerequisiteValidationSummary
                      .canValidateInvocationBoundary,
                  )}
                />
              </DetailGrid>
            </PreviewSection>

            <PreviewSection
              title="Input source validation summary"
              tone="violet"
            >
              <DetailGrid>
                <Detail
                  label="Adapter result"
                  value={yesNo(
                    validatorResult.inputSourceValidationSummary
                      .adapterResultPresent,
                  )}
                />
                <Detail
                  label="Adapter validation"
                  value={yesNo(
                    validatorResult.inputSourceValidationSummary
                      .adapterValidationPresent,
                  )}
                />
                <Detail
                  label="Proposed input from adapter"
                  value={yesNo(
                    validatorResult.inputSourceValidationSummary
                      .proposedInputComesFromAdapter,
                  )}
                />
                <Detail
                  label="Live Avanza consumed"
                  value={yesNo(
                    validatorResult.inputSourceValidationSummary
                      .liveBrokerOrAvanzaDataConsumed,
                  )}
                />
              </DetailGrid>
            </PreviewSection>

            <PreviewSection
              title="Proposed input validation summary"
              tone="emerald"
            >
              <DetailGrid>
                <Detail
                  label="Proposed input present"
                  value={yesNo(
                    validatorResult.proposedInputValidationSummary
                      .proposedInputPresent,
                  )}
                />
                <Detail
                  label="Required fields"
                  value={yesNo(
                    validatorResult.proposedInputValidationSummary
                      .requiredFieldsPresent,
                  )}
                />
                <Detail
                  label="Source provenance"
                  value={yesNo(
                    validatorResult.proposedInputValidationSummary
                      .sourceEvidenceProvenancePresent,
                  )}
                />
                <Detail
                  label="Candidate created"
                  value={yesNo(
                    validatorResult.proposedInputValidationSummary
                      .executionRecordCandidateCreated,
                  )}
                />
              </DetailGrid>
            </PreviewSection>

            <PreviewSection
              title="Idempotency validation summary"
              tone="amber"
            >
              <DetailGrid>
                <Detail
                  label="Required fingerprints"
                  value={yesNo(
                    validatorResult.idempotencyValidationSummary
                      .requiredFingerprintsPresent,
                  )}
                />
                <Detail
                  label="Invocation fingerprint"
                  value={yesNo(
                    validatorResult.idempotencyValidationSummary
                      .invocationFingerprintPreserved,
                  )}
                />
                <Detail
                  label="Candidate fingerprint ready"
                  value={yesNo(
                    validatorResult.idempotencyValidationSummary
                      .candidateBuilderFingerprintReady,
                  )}
                />
                <Detail
                  label="Safe for write"
                  value={yesNo(
                    validatorResult.idempotencyValidationSummary.safeForWrite,
                  )}
                />
              </DetailGrid>
            </PreviewSection>

            <PreviewSection
              title="Audit/provenance validation summary"
              tone="sky"
            >
              <DetailGrid>
                <Detail
                  label="Source evidence chain"
                  value={yesNo(
                    validatorResult.auditProvenanceValidationSummary
                      .sourceEvidenceChainPresent,
                  )}
                />
                <Detail
                  label="Manual approval"
                  value={yesNo(
                    validatorResult.auditProvenanceValidationSummary
                      .manualApprovalContextPresent,
                  )}
                />
                <Detail
                  label="Audit append attempted"
                  value={yesNo(
                    validatorResult.auditProvenanceValidationSummary
                      .auditAppendAttempted,
                  )}
                />
                <Detail
                  label="Safe for write"
                  value={yesNo(
                    validatorResult.auditProvenanceValidationSummary.safeForWrite,
                  )}
                />
              </DetailGrid>
            </PreviewSection>

            <PreviewSection
              title="Schema readiness validation summary"
              tone="violet"
            >
              <DetailGrid>
                <Detail
                  label="Generated types status"
                  value={formatAgentCommandValue(
                    validatorResult.schemaReadinessValidationSummary
                      .generatedTypesStatus,
                  )}
                />
                <Detail
                  label="Migration status"
                  value={formatAgentCommandValue(
                    validatorResult.schemaReadinessValidationSummary
                      .migrationApplicationStatus,
                  )}
                />
                <Detail
                  label="Runtime DB writes"
                  value={yesNo(
                    validatorResult.schemaReadinessValidationSummary
                      .runtimeDbWritesAllowed,
                  )}
                />
                <Detail
                  label="Safe to persist"
                  value={yesNo(
                    validatorResult.schemaReadinessValidationSummary
                      .safeToPersist,
                  )}
                />
              </DetailGrid>
            </PreviewSection>

            <PreviewSection
              title="Safety policy validation summary"
              tone="rose"
            >
              <DetailGrid>
                <Detail
                  label="All authority false"
                  value={yesNo(
                    validatorResult.safetyPolicyValidationSummary
                      .allAuthorityFlagsFalse,
                  )}
                />
                <Detail
                  label="Builder enabled"
                  value={yesNo(
                    validatorResult.safetyPolicyValidationSummary
                      .candidateBuilderInvocationEnabled,
                  )}
                />
                <Detail
                  label="Persistence enabled"
                  value={yesNo(
                    validatorResult.safetyPolicyValidationSummary
                      .persistenceImplementationEnabled,
                  )}
                />
                <Detail
                  label="Browser enabled"
                  value={yesNo(
                    validatorResult.safetyPolicyValidationSummary
                      .browserAutomationEnabled,
                  )}
                />
              </DetailGrid>
            </PreviewSection>

            <PreviewSection title="Authority flags" tone="rose">
              <DetailGrid>
                <Detail
                  label="safeToCallCandidateBuilder"
                  value={yesNo(
                    validatorResult.authorityFlags.safeToCallCandidateBuilder,
                  )}
                />
                <Detail
                  label="safeToCreateExecutionRecordCandidate"
                  value={yesNo(
                    validatorResult.authorityFlags
                      .safeToCreateExecutionRecordCandidate,
                  )}
                />
                <Detail
                  label="safeToPersist"
                  value={yesNo(validatorResult.authorityFlags.safeToPersist)}
                />
                <Detail
                  label="automatic mode"
                  value={yesNo(
                    validatorResult.authorityFlags.automaticModeAllowed,
                  )}
                />
              </DetailGrid>
            </PreviewSection>

            <StringList
              emptyLabel="No invocation-validator blocked reasons."
              items={validatorResult.blockedReasons}
              title="Validator blocked reasons"
              tone="rose"
            />
            <StringList
              emptyLabel="No invocation-validator warnings."
              items={validatorResult.warnings}
              title="Validator warnings"
              tone="amber"
            />
            <StringList
              emptyLabel="No invocation-validator review items."
              items={validatorResult.reviewItems}
              title="Validator review items"
              tone="sky"
            />
          </div>
        )}
      </div>
    </details>
  );
}
