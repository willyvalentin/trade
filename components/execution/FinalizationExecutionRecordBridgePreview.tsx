import type { ReactNode } from "react";

import {
  Detail,
  SafetyLabelList,
  formatAgentCommandLabel,
  formatAgentCommandValue,
} from "@/components/execution/handoff-modal-shared";
import type { FinalizationExecutionRecordBridgeDevFixtureResult } from "@/lib/finalization-execution-record-bridge-dev-fixture";

type FinalizationExecutionRecordBridgePreviewProps = {
  canRun: boolean;
  isRunning: boolean;
  message: string;
  onRun: () => void;
  result: FinalizationExecutionRecordBridgeDevFixtureResult | null;
  unavailableReason?: string | null;
};

type Tone = "amber" | "emerald" | "fuchsia" | "rose" | "sky" | "violet";

function toneClassName(tone: Tone) {
  switch (tone) {
    case "emerald":
      return "border-emerald-300/20 bg-emerald-300/[0.06] text-emerald-100";
    case "fuchsia":
      return "border-fuchsia-300/20 bg-fuchsia-300/[0.06] text-fuchsia-100";
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
    case "fuchsia":
      return "text-fuchsia-100";
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
    <section className={`mt-3 rounded-md border p-3 ${toneClassName(tone)}`}>
      <h3
        className={`font-mono text-[10px] font-bold uppercase tracking-[0.14em] ${headingClassName(tone)}`}
      >
        {title}
      </h3>
      {children}
    </section>
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

function DetailGrid({ children }: { children: ReactNode }) {
  return <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{children}</div>;
}

function yesNo(value: boolean) {
  return value ? "Yes" : "No";
}

export function FinalizationExecutionRecordBridgePreview({
  canRun,
  isRunning,
  message,
  onRun,
  result,
  unavailableReason,
}: FinalizationExecutionRecordBridgePreviewProps) {
  const bridgeResult = result?.bridgeResult ?? null;
  const validatorResult = result?.validatorResult ?? null;

  return (
    <details className="rounded-md border border-fuchsia-300/15 bg-fuchsia-300/[0.04] p-4">
      <summary className="cursor-pointer select-none font-mono text-xs font-bold uppercase tracking-[0.16em] text-fuchsia-100">
        Execution Record Bridge Preview
      </summary>

      <div className="mt-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-fuchsia-300/30 bg-fuchsia-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-fuchsia-100">
                Bridge preview only
              </span>
              <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-100">
                Controlled fixture only
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              Read-only bridge preview from controlled fixture data. This calls
              the pure bridge mapper and pure bridge validator only. It does not
              build an execution-record candidate, create or persist an
              execution record, finalize, update stats or PnL, append audit,
              rollback, correct, mutate trade state, send to broker, run
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
              ? "Running execution-record bridge preview..."
              : "Run execution-record bridge preview"}
          </button>
        </div>

        <SafetyLabelList
          labels={[
            "Dev preview only",
            "Bridge preview only",
            "Candidate-only",
            "Mapping-only",
            "Validation-only",
            "Not execution-record creation",
            "Not persistence approval",
            "Not finalization approval",
            "Not audit append approval",
            "Not stats/PnL update approval",
            "Not rollback/correction approval",
            "Does not mutate trade state",
            "Does not send to broker",
            "No Avanza/browser action",
            "automatic mode disabled",
            "safeToCreateExecutionRecord=false",
            "safeToPersist=false",
            "safeToFinalize=false",
            "safeToUpdateStats=false",
            "safeToAppendAudit=false",
            "safeToRollback=false",
            "safeToMutateTrade=false",
            "safeToRunBrokerAction=false",
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

        {bridgeResult && validatorResult && (
          <div className="mt-3 rounded-md border border-white/10 bg-black/20 p-3">
            <PreviewSection title="Bridge mapper status" tone="fuchsia">
              <p className="mt-2 text-sm leading-6 text-zinc-300">
                Mapper status is candidate metadata only. A ready bridge
                candidate is not write-ready.
              </p>
              <DetailGrid>
                <Detail
                  label="Mapper status"
                  value={formatAgentCommandValue(bridgeResult.status)}
                />
                <Detail
                  label="Candidate-only"
                  value={yesNo(bridgeResult.candidateOnly)}
                />
                <Detail
                  label="Mapping-only"
                  value={yesNo(bridgeResult.mappingOnly)}
                />
                <Detail
                  label="Bridge executed"
                  value={yesNo(bridgeResult.bridgeExecuted)}
                />
              </DetailGrid>
            </PreviewSection>

            <PreviewSection title="Bridge source evidence summary" tone="sky">
              <DetailGrid>
                <Detail
                  label="Evidence complete"
                  value={yesNo(bridgeResult.sourceEvidenceSummary.evidenceChainComplete)}
                />
                <Detail
                  label="Final note matched"
                  value={yesNo(bridgeResult.sourceEvidenceSummary.finalSettlementNoteMatched)}
                />
                <Detail
                  label="Provisional only"
                  value={yesNo(bridgeResult.sourceEvidenceSummary.provisionalEvidenceOnly)}
                />
                <Detail
                  label="Match status"
                  value={formatAgentCommandValue(
                    bridgeResult.sourceEvidenceSummary
                      .finalSettlementNoteMatchStatus,
                  )}
                />
              </DetailGrid>
            </PreviewSection>

            <PreviewSection title="Bridge target execution-record summary" tone="violet">
              <DetailGrid>
                <Detail
                  label="Creation input available"
                  value={yesNo(
                    bridgeResult.targetSummary
                      .intendedExecutionRecordCandidateInputAvailable,
                  )}
                />
                <Detail
                  label="Source block ready"
                  value={yesNo(bridgeResult.targetSummary.sourceEvidenceBlockReady)}
                />
                <Detail
                  label="Validation block ready"
                  value={yesNo(bridgeResult.targetSummary.validationBlockReady)}
                />
                <Detail
                  label="Safe to persist"
                  value={yesNo(bridgeResult.targetSummary.safeToPersist)}
                />
              </DetailGrid>
            </PreviewSection>

            <PreviewSection title="Bridge field mapping summary" tone="emerald">
              <div className="mt-3 grid gap-2">
                {bridgeResult.fieldMappingSummary.slice(0, 8).map((field) => (
                  <div
                    className="rounded-md border border-white/10 bg-black/25 p-3"
                    key={field.field}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-zinc-100">
                        {formatAgentCommandLabel(field.field)}
                      </p>
                      <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-100">
                        {field.available ? "AVAILABLE" : "MISSING"}
                      </span>
                    </div>
                    <DetailGrid>
                      <Detail
                        label="Source"
                        value={formatAgentCommandValue(field.source)}
                      />
                      <Detail
                        label="Target"
                        value={formatAgentCommandValue(field.targetPath)}
                      />
                      <Detail
                        label="Required"
                        value={yesNo(field.requiredForCandidateInput)}
                      />
                      <Detail
                        label="Needs review"
                        value={yesNo(field.requiresReview)}
                      />
                    </DetailGrid>
                  </div>
                ))}
              </div>
            </PreviewSection>

            <PreviewSection title="Bridge idempotency summary" tone="amber">
              <DetailGrid>
                <Detail
                  label="Fingerprints present"
                  value={yesNo(
                    bridgeResult.idempotencySummary
                      .requiredFingerprintsPresent,
                  )}
                />
                <Detail
                  label="Duplicate check"
                  value={yesNo(bridgeResult.idempotencySummary.duplicateCheckRequired)}
                />
                <Detail
                  label="Duplicate detected"
                  value={yesNo(bridgeResult.idempotencySummary.duplicateDetected)}
                />
                <Detail
                  label="Retry safe"
                  value={yesNo(bridgeResult.idempotencySummary.retrySafe)}
                />
              </DetailGrid>
            </PreviewSection>

            <PreviewSection title="Bridge audit/correction summary" tone="rose">
              <DetailGrid>
                <Detail
                  label="Audit required"
                  value={yesNo(
                    bridgeResult.auditCorrectionSummary.auditRequiredBeforeWrite,
                  )}
                />
                <Detail
                  label="Audit metadata"
                  value={yesNo(bridgeResult.auditCorrectionSummary.auditMetadataPresent)}
                />
                <Detail
                  label="Audit append attempted"
                  value={yesNo(bridgeResult.auditCorrectionSummary.auditAppendAttempted)}
                />
                <Detail
                  label="Rollback attempted"
                  value={yesNo(bridgeResult.auditCorrectionSummary.rollbackAttempted)}
                />
              </DetailGrid>
            </PreviewSection>

            <PreviewSection title="Bridge validation handoff summary" tone="sky">
              <DetailGrid>
                <Detail
                  label="Candidate present"
                  value={yesNo(
                    bridgeResult.validationHandoffSummary
                      .finalizationCandidatePresent,
                  )}
                />
                <Detail
                  label="Action dry-run"
                  value={formatAgentCommandValue(
                    bridgeResult.validationHandoffSummary.actionDryRunStatus,
                  )}
                />
                <Detail
                  label="Manual approval"
                  value={yesNo(
                    bridgeResult.validationHandoffSummary.manualApprovalPresent,
                  )}
                />
                <Detail
                  label="Executable write"
                  value={yesNo(
                    bridgeResult.validationHandoffSummary
                      .executableWriteCandidateProduced,
                  )}
                />
              </DetailGrid>
            </PreviewSection>

            <div className="grid gap-3 lg:grid-cols-3">
              <StringList
                emptyLabel="No bridge blocked reasons."
                items={bridgeResult.blockedReasons.map(String)}
                title="Bridge blocked reasons"
                tone="rose"
              />
              <StringList
                emptyLabel="No bridge warnings."
                items={bridgeResult.warnings.map(String)}
                title="Bridge warnings"
                tone="amber"
              />
              <StringList
                emptyLabel="No bridge review items."
                items={bridgeResult.reviewItems.map(String)}
                title="Bridge review items"
                tone="sky"
              />
            </div>

            <PreviewSection title="Bridge safety policy" tone="rose">
              <DetailGrid>
                <Detail
                  label="Create record"
                  value={yesNo(bridgeResult.safetyPolicy.safeToCreateExecutionRecord)}
                />
                <Detail
                  label="Persist"
                  value={yesNo(bridgeResult.safetyPolicy.safeToPersist)}
                />
                <Detail
                  label="Broker action"
                  value={yesNo(bridgeResult.safetyPolicy.safeToRunBrokerAction)}
                />
                <Detail
                  label="Automatic mode"
                  value={yesNo(bridgeResult.safetyPolicy.automaticModeAllowed)}
                />
              </DetailGrid>
            </PreviewSection>

            <PreviewSection title="Bridge validator status" tone="fuchsia">
              <p className="mt-2 text-sm leading-6 text-zinc-300">
                Validator status is validation-only metadata. A valid validator
                result is not execution-record creation approval.
              </p>
              <DetailGrid>
                <Detail
                  label="Validator status"
                  value={formatAgentCommandValue(validatorResult.status)}
                />
                <Detail
                  label="Decision recommendation"
                  value={formatAgentCommandValue(
                    validatorResult.decisionRecommendation,
                  )}
                />
                <Detail
                  label="Validation-only"
                  value={yesNo(validatorResult.validationOnly)}
                />
                <Detail
                  label="Automatic mode"
                  value={yesNo(validatorResult.automaticModeAllowed)}
                />
              </DetailGrid>
            </PreviewSection>

            <PreviewSection title="Validated field summary" tone="emerald">
              <DetailGrid>
                <Detail
                  label="Validated fields"
                  value={String(validatorResult.validatedFieldSummary.length)}
                />
                <Detail
                  label="Missing fields"
                  value={String(
                    validatorResult.validatedFieldSummary.filter(
                      (field) => field.status === "field_missing",
                    ).length,
                  )}
                />
                <Detail
                  label="Mismatched fields"
                  value={String(
                    validatorResult.validatedFieldSummary.filter(
                      (field) => field.status === "field_mismatched",
                    ).length,
                  )}
                />
                <Detail
                  label="Valid fields"
                  value={String(
                    validatorResult.validatedFieldSummary.filter(
                      (field) => field.status === "field_valid",
                    ).length,
                  )}
                />
              </DetailGrid>
            </PreviewSection>

            <PreviewSection title="Idempotency validation summary" tone="amber">
              <DetailGrid>
                <Detail
                  label="Required present"
                  value={yesNo(
                    validatorResult.idempotencyValidationSummary
                      .requiredFingerprintsPresent,
                  )}
                />
                <Detail
                  label="Missing fingerprints"
                  value={String(
                    validatorResult.idempotencyValidationSummary
                      .missingFingerprintComponents.length,
                  )}
                />
                <Detail
                  label="Duplicate check"
                  value={yesNo(
                    validatorResult.idempotencyValidationSummary
                      .duplicateCheckRequired,
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

            <PreviewSection title="Audit/correction validation summary" tone="rose">
              <DetailGrid>
                <Detail
                  label="Audit metadata"
                  value={yesNo(
                    validatorResult.auditCorrectionValidationSummary
                      .auditMetadataPresent,
                  )}
                />
                <Detail
                  label="Correction metadata"
                  value={yesNo(
                    validatorResult.auditCorrectionValidationSummary
                      .correctionMetadataPresent,
                  )}
                />
                <Detail
                  label="Audit attempted"
                  value={yesNo(
                    validatorResult.auditCorrectionValidationSummary
                      .auditAppendAttempted,
                  )}
                />
                <Detail
                  label="Rollback attempted"
                  value={yesNo(
                    validatorResult.auditCorrectionValidationSummary
                      .rollbackAttempted,
                  )}
                />
              </DetailGrid>
            </PreviewSection>

            <PreviewSection title="Safety policy validation summary" tone="rose">
              <DetailGrid>
                <Detail
                  label="All authority false"
                  value={yesNo(
                    validatorResult.safetyPolicyValidationSummary
                      .allAuthorityFlagsFalse,
                  )}
                />
                <Detail
                  label="Candidate-only"
                  value={yesNo(
                    validatorResult.safetyPolicyValidationSummary.candidateOnly,
                  )}
                />
                <Detail
                  label="Mapping-only"
                  value={yesNo(
                    validatorResult.safetyPolicyValidationSummary.mappingOnly,
                  )}
                />
                <Detail
                  label="Safe to create"
                  value={yesNo(validatorResult.safeToCreateExecutionRecord)}
                />
              </DetailGrid>
            </PreviewSection>

            <div className="grid gap-3 lg:grid-cols-3">
              <StringList
                emptyLabel="No validator blocked reasons."
                items={validatorResult.blockedReasons.map(String)}
                title="Validator blocked reasons"
                tone="rose"
              />
              <StringList
                emptyLabel="No validator warnings."
                items={validatorResult.warnings.map(String)}
                title="Validator warnings"
                tone="amber"
              />
              <StringList
                emptyLabel="No validator review items."
                items={validatorResult.reviewItems.map(String)}
                title="Validator review items"
                tone="sky"
              />
            </div>

            <PreviewSection title="Validator authority flags" tone="rose">
              <DetailGrid>
                <Detail
                  label="Create record"
                  value={yesNo(validatorResult.authorityFlags.safeToCreateExecutionRecord)}
                />
                <Detail
                  label="Persist"
                  value={yesNo(validatorResult.authorityFlags.safeToPersist)}
                />
                <Detail
                  label="Finalize"
                  value={yesNo(validatorResult.authorityFlags.safeToFinalize)}
                />
                <Detail
                  label="Append audit"
                  value={yesNo(validatorResult.authorityFlags.safeToAppendAudit)}
                />
                <Detail
                  label="Update stats"
                  value={yesNo(validatorResult.authorityFlags.safeToUpdateStats)}
                />
                <Detail
                  label="Rollback"
                  value={yesNo(validatorResult.authorityFlags.safeToRollback)}
                />
                <Detail
                  label="Mutate trade"
                  value={yesNo(validatorResult.authorityFlags.safeToMutateTrade)}
                />
                <Detail
                  label="Broker action"
                  value={yesNo(validatorResult.authorityFlags.safeToRunBrokerAction)}
                />
              </DetailGrid>
            </PreviewSection>
          </div>
        )}
      </div>
    </details>
  );
}
