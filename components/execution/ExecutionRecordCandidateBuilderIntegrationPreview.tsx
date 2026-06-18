import type { ReactNode } from "react";

import {
  Detail,
  SafetyLabelList,
  formatAgentCommandLabel,
  formatAgentCommandValue,
} from "@/components/execution/handoff-modal-shared";
import type { ExecutionRecordCandidateBuilderIntegrationDevFixtureResult } from "@/lib/execution-record-candidate-builder-integration-dev-fixture";

type ExecutionRecordCandidateBuilderIntegrationPreviewProps = {
  canRun: boolean;
  isRunning: boolean;
  message: string;
  onRun: () => void;
  result: ExecutionRecordCandidateBuilderIntegrationDevFixtureResult | null;
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
  return <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{children}</div>;
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

export function ExecutionRecordCandidateBuilderIntegrationPreview({
  canRun,
  isRunning,
  message,
  onRun,
  result,
  unavailableReason,
}: ExecutionRecordCandidateBuilderIntegrationPreviewProps) {
  const adapterResult = result?.adapterResult ?? null;
  const validatorResult = result?.validatorResult ?? null;
  const proposedInput =
    adapterResult?.proposedInputSummary.proposedCreationInput ?? null;
  const proposedBrokerResult =
    adapterResult?.proposedInputSummary.proposedSourceBrokerExecutionResult ??
    null;

  return (
    <details className="rounded-md border border-sky-300/15 bg-sky-300/[0.04] p-4">
      <summary className="cursor-pointer select-none font-mono text-xs font-bold uppercase tracking-[0.16em] text-sky-100">
        Execution Record Candidate Builder Integration Preview
      </summary>

      <div className="mt-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-sky-300/30 bg-sky-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-sky-100">
                Candidate builder integration preview only
              </span>
              <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-100">
                Controlled fixture only
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              Dev-gated read-only preview from controlled fixture data. This
              calls the pure adapter and pure adapter-validator only. It does
              not call buildExecutionRecordCandidate(...), create an
              execution-record candidate, create or persist an execution
              record, finalize, update stats or PnL, append audit, rollback,
              correct, mutate trade state, send to broker, run browser
              automation, or interact with Avanza.
            </p>
          </div>

          <button
            className="rounded-md border border-sky-300/30 bg-sky-300/10 px-3 py-2 text-left font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canRun || isRunning}
            onClick={onRun}
            type="button"
          >
            {isRunning
              ? "Running candidate builder integration preview..."
              : "Run candidate builder integration preview"}
          </button>
        </div>

        <SafetyLabelList
          labels={[
            "Dev preview only",
            "Candidate builder integration preview only",
            "Proposed input only",
            "Validation-only",
            "Does not call buildExecutionRecordCandidate(...)",
            "Does not create execution-record candidate",
            "Does not create execution record",
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

        {adapterResult && validatorResult && (
          <div className="mt-3 rounded-md border border-white/10 bg-black/20 p-3">
            <PreviewSection title="Adapter status" tone="sky">
              <p className="mt-2 text-sm leading-6 text-zinc-300">
                Adapter input ready means proposed-input-ready only. It is not
                builder-ready, candidate-ready, record-ready, or write-ready.
              </p>
              <DetailGrid>
                <Detail
                  label="Adapter status"
                  value={formatAgentCommandValue(adapterResult.status)}
                />
                <Detail
                  label="Decision"
                  value={formatAgentCommandValue(
                    adapterResult.decisionRecommendation,
                  )}
                />
                <Detail
                  label="Proposed input only"
                  value={yesNo(adapterResult.proposedInputOnly)}
                />
                <Detail
                  label="Builder called"
                  value={yesNo(
                    adapterResult.candidateBuilderInvocationAttempted,
                  )}
                />
              </DetailGrid>
            </PreviewSection>

            <PreviewSection
              title="Proposed ExecutionRecordCreationInput summary"
              tone="violet"
            >
              <DetailGrid>
                <Detail
                  label="Required fields"
                  value={yesNo(
                    adapterResult.proposedInputSummary.requiredFieldsPresent,
                  )}
                />
                <Detail
                  label="Missing fields"
                  value={String(
                    adapterResult.proposedInputSummary.missingRequiredFields
                      .length,
                  )}
                />
                <Detail
                  label="Expected action"
                  value={formatAgentCommandValue(
                    proposedInput?.expectedAction,
                  )}
                />
                <Detail
                  label="Ticker"
                  value={formatAgentCommandValue(
                    proposedInput?.expectedInstrument?.ticker,
                  )}
                />
                <Detail
                  label="Broker"
                  value={formatAgentCommandValue(proposedBrokerResult?.broker)}
                />
                <Detail
                  label="Quantity"
                  value={formatAgentCommandValue(
                    proposedBrokerResult?.filledQuantity,
                  )}
                />
                <Detail
                  label="Price"
                  value={formatAgentCommandValue(
                    proposedBrokerResult?.averageFillPrice,
                  )}
                />
                <Detail
                  label="Candidate created"
                  value={yesNo(
                    adapterResult
                      .executionRecordCandidateCreationAttempted,
                  )}
                />
              </DetailGrid>
            </PreviewSection>

            <PreviewSection title="Field mapping summary" tone="fuchsia">
              <DetailGrid>
                <Detail
                  label="Mapped fields"
                  value={String(
                    adapterResult.fieldMappingSummary.filter(
                      (field) => field.mapped,
                    ).length,
                  )}
                />
                <Detail
                  label="Total fields"
                  value={String(adapterResult.fieldMappingSummary.length)}
                />
                <Detail
                  label="Review fields"
                  value={String(
                    adapterResult.fieldMappingSummary.filter(
                      (field) => field.requiresReview,
                    ).length,
                  )}
                />
                <Detail
                  label="Required proposed"
                  value={String(
                    adapterResult.fieldMappingSummary.filter(
                      (field) => field.requiredForProposedInput,
                    ).length,
                  )}
                />
              </DetailGrid>
            </PreviewSection>

            <PreviewSection title="Precondition summary" tone="emerald">
              <DetailGrid>
                <Detail
                  label="Bridge result"
                  value={yesNo(adapterResult.preconditionSummary.bridgeResultPresent)}
                />
                <Detail
                  label="Bridge validation"
                  value={yesNo(
                    adapterResult.preconditionSummary.bridgeValidationValid,
                  )}
                />
                <Detail
                  label="Manual approval"
                  value={yesNo(
                    adapterResult.preconditionSummary.manualApprovalPresent,
                  )}
                />
                <Detail
                  label="Can shape input"
                  value={yesNo(
                    adapterResult.preconditionSummary.canShapeProposedInput,
                  )}
                />
              </DetailGrid>
            </PreviewSection>

            <PreviewSection title="Schema readiness summary" tone="amber">
              <DetailGrid>
                <Detail
                  label="Generated types"
                  value={yesNo(
                    adapterResult.schemaReadinessSummary.generatedTypesAvailable,
                  )}
                />
                <Detail
                  label="Generated reviewed"
                  value={yesNo(
                    adapterResult.schemaReadinessSummary.generatedTypesReviewed,
                  )}
                />
                <Detail
                  label="Migration proven"
                  value={yesNo(
                    adapterResult.schemaReadinessSummary
                      .migrationApplicationProven,
                  )}
                />
                <Detail
                  label="Safe to persist"
                  value={yesNo(adapterResult.schemaReadinessSummary.safeToPersist)}
                />
              </DetailGrid>
            </PreviewSection>

            <PreviewSection title="Idempotency summary" tone="sky">
              <DetailGrid>
                <Detail
                  label="Required fingerprints"
                  value={yesNo(
                    adapterResult.idempotencySummary.requiredFingerprintsPresent,
                  )}
                />
                <Detail
                  label="Duplicate check"
                  value={yesNo(
                    adapterResult.idempotencySummary.duplicateCheckRequired,
                  )}
                />
                <Detail
                  label="Duplicate detected"
                  value={yesNo(adapterResult.idempotencySummary.duplicateDetected)}
                />
                <Detail
                  label="Safe for write"
                  value={yesNo(adapterResult.idempotencySummary.safeForWrite)}
                />
              </DetailGrid>
            </PreviewSection>

            <PreviewSection title="Audit/provenance summary" tone="violet">
              <DetailGrid>
                <Detail
                  label="Audit metadata"
                  value={yesNo(
                    adapterResult.auditProvenanceSummary.auditMetadataPresent,
                  )}
                />
                <Detail
                  label="Manual approval"
                  value={yesNo(
                    adapterResult.auditProvenanceSummary.manualApprovalPresent,
                  )}
                />
                <Detail
                  label="Audit appended"
                  value={yesNo(
                    adapterResult.auditProvenanceSummary.auditAppendAttempted,
                  )}
                />
                <Detail
                  label="Rollback attempted"
                  value={yesNo(
                    adapterResult.auditProvenanceSummary.rollbackAttempted,
                  )}
                />
              </DetailGrid>
            </PreviewSection>

            <PreviewSection title="Safety policy" tone="rose">
              <DetailGrid>
                <Detail
                  label="Call builder"
                  value={yesNo(adapterResult.safeToCallCandidateBuilder)}
                />
                <Detail
                  label="Create candidate"
                  value={yesNo(
                    adapterResult.safeToCreateExecutionRecordCandidate,
                  )}
                />
                <Detail
                  label="Create record"
                  value={yesNo(adapterResult.safeToCreateExecutionRecord)}
                />
                <Detail
                  label="Persist"
                  value={yesNo(adapterResult.safeToPersist)}
                />
                <Detail
                  label="Append audit"
                  value={yesNo(adapterResult.safeToAppendAudit)}
                />
                <Detail
                  label="Update stats"
                  value={yesNo(adapterResult.safeToUpdateStats)}
                />
                <Detail
                  label="Rollback"
                  value={yesNo(adapterResult.safeToRollback)}
                />
                <Detail
                  label="Mutate trade"
                  value={yesNo(adapterResult.safeToMutateTrade)}
                />
              </DetailGrid>
            </PreviewSection>

            <StringList
              emptyLabel="No adapter blockers."
              items={adapterResult.blockedReasons}
              title="Adapter blocked reasons"
              tone="rose"
            />
            <StringList
              emptyLabel="No adapter warnings."
              items={adapterResult.warnings}
              title="Adapter warnings"
              tone="amber"
            />
            <StringList
              emptyLabel="No adapter review items."
              items={adapterResult.reviewItems}
              title="Adapter review items"
              tone="violet"
            />

            <PreviewSection title="Validation status" tone="emerald">
              <p className="mt-2 text-sm leading-6 text-zinc-300">
                Adapter validation valid is validation-valid only. It is not
                candidate builder invocation approval.
              </p>
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
              title="Validated proposed input summary"
              tone="sky"
            >
              <DetailGrid>
                <Detail
                  label="Required fields"
                  value={yesNo(
                    validatorResult.proposedInputValidationSummary
                      .requiredFieldsPresent,
                  )}
                />
                <Detail
                  label="Broker result"
                  value={yesNo(
                    validatorResult.proposedInputValidationSummary
                      .proposedSourceBrokerExecutionResultPresent,
                  )}
                />
                <Detail
                  label="Is candidate"
                  value={yesNo(
                    validatorResult.proposedInputValidationSummary
                      .proposedInputIsExecutionRecordCandidate,
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
              title="Field mapping validation summary"
              tone="fuchsia"
            >
              <DetailGrid>
                <Detail
                  label="Field checks"
                  value={String(
                    validatorResult.fieldMappingValidationSummary.length,
                  )}
                />
                <Detail
                  label="Valid"
                  value={String(
                    validatorResult.fieldMappingValidationSummary.filter(
                      (field) => field.status === "field_valid",
                    ).length,
                  )}
                />
                <Detail
                  label="Missing"
                  value={String(
                    validatorResult.fieldMappingValidationSummary.filter(
                      (field) => field.status === "field_missing",
                    ).length,
                  )}
                />
                <Detail
                  label="Needs review"
                  value={String(
                    validatorResult.fieldMappingValidationSummary.filter(
                      (field) => field.status === "field_needs_review",
                    ).length,
                  )}
                />
              </DetailGrid>
            </PreviewSection>

            <PreviewSection
              title="Precondition validation summary"
              tone="emerald"
            >
              <DetailGrid>
                <Detail
                  label="Can validate"
                  value={yesNo(
                    validatorResult.preconditionValidationSummary
                      .canValidateAdapterOutput,
                  )}
                />
                <Detail
                  label="Adapter present"
                  value={yesNo(
                    validatorResult.preconditionValidationSummary
                      .adapterResultPresent,
                  )}
                />
                <Detail
                  label="Manual approval"
                  value={yesNo(
                    validatorResult.preconditionValidationSummary
                      .manualApprovalPresent,
                  )}
                />
                <Detail
                  label="Authority false"
                  value={yesNo(
                    validatorResult.preconditionValidationSummary
                      .allAuthorityFlagsFalse,
                  )}
                />
              </DetailGrid>
            </PreviewSection>

            <PreviewSection
              title="Schema readiness validation summary"
              tone="amber"
            >
              <DetailGrid>
                <Detail
                  label="Generated types"
                  value={yesNo(
                    validatorResult.schemaReadinessValidationSummary
                      .generatedTypesAvailable,
                  )}
                />
                <Detail
                  label="Migration proven"
                  value={yesNo(
                    validatorResult.schemaReadinessValidationSummary
                      .migrationApplicationProven,
                  )}
                />
                <Detail
                  label="Production write"
                  value={yesNo(
                    validatorResult.schemaReadinessValidationSummary
                      .productionWriteEnabled,
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

            <PreviewSection title="Idempotency validation summary" tone="sky">
              <DetailGrid>
                <Detail
                  label="Fingerprints"
                  value={yesNo(
                    validatorResult.idempotencyValidationSummary
                      .requiredFingerprintsPresent,
                  )}
                />
                <Detail
                  label="Duplicate"
                  value={yesNo(
                    validatorResult.idempotencyValidationSummary
                      .duplicateDetected,
                  )}
                />
                <Detail
                  label="Retry safe"
                  value={yesNo(
                    validatorResult.idempotencyValidationSummary.retrySafe,
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
              tone="violet"
            >
              <DetailGrid>
                <Detail
                  label="Audit metadata"
                  value={yesNo(
                    validatorResult.auditProvenanceValidationSummary
                      .auditMetadataPresent,
                  )}
                />
                <Detail
                  label="Source traceable"
                  value={yesNo(
                    validatorResult.auditProvenanceValidationSummary
                      .sourceEvidenceTraceable,
                  )}
                />
                <Detail
                  label="Manual approval"
                  value={yesNo(
                    validatorResult.auditProvenanceValidationSummary
                      .manualApprovalPresent,
                  )}
                />
                <Detail
                  label="Audit appended"
                  value={yesNo(
                    validatorResult.auditProvenanceValidationSummary
                      .auditAppendAttempted,
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
                  label="Authority flags"
                  value={yesNo(
                    validatorResult.safetyPolicyValidationSummary
                      .allAuthorityFlagsFalse,
                  )}
                />
                <Detail
                  label="Call builder enabled"
                  value={yesNo(
                    validatorResult.safetyPolicyValidationSummary
                      .candidateBuilderInvocationEnabled,
                  )}
                />
                <Detail
                  label="Candidate creation"
                  value={yesNo(
                    validatorResult.safetyPolicyValidationSummary
                      .executionRecordCandidateCreationEnabled,
                  )}
                />
                <Detail
                  label="Persistence"
                  value={yesNo(
                    validatorResult.safetyPolicyValidationSummary
                      .persistenceImplementationEnabled,
                  )}
                />
              </DetailGrid>
            </PreviewSection>

            <PreviewSection title="Authority flags" tone="rose">
              <DetailGrid>
                <Detail
                  label="Call builder"
                  value={yesNo(validatorResult.safeToCallCandidateBuilder)}
                />
                <Detail
                  label="Create candidate"
                  value={yesNo(
                    validatorResult.safeToCreateExecutionRecordCandidate,
                  )}
                />
                <Detail
                  label="Create record"
                  value={yesNo(validatorResult.safeToCreateExecutionRecord)}
                />
                <Detail
                  label="Persist"
                  value={yesNo(validatorResult.safeToPersist)}
                />
                <Detail
                  label="Append audit"
                  value={yesNo(validatorResult.safeToAppendAudit)}
                />
                <Detail
                  label="Update stats"
                  value={yesNo(validatorResult.safeToUpdateStats)}
                />
                <Detail
                  label="Rollback"
                  value={yesNo(validatorResult.safeToRollback)}
                />
                <Detail
                  label="Mutate trade"
                  value={yesNo(validatorResult.safeToMutateTrade)}
                />
              </DetailGrid>
            </PreviewSection>

            <StringList
              emptyLabel="No validator blockers."
              items={validatorResult.blockedReasons}
              title="Validator blocked reasons"
              tone="rose"
            />
            <StringList
              emptyLabel="No validator warnings."
              items={validatorResult.warnings}
              title="Validator warnings"
              tone="amber"
            />
            <StringList
              emptyLabel="No validator review items."
              items={validatorResult.reviewItems}
              title="Validator review items"
              tone="violet"
            />
          </div>
        )}
      </div>
    </details>
  );
}
