import type { ReactNode } from "react";

import {
  Detail,
  SafetyLabelList,
  formatAgentCommandLabel,
  formatAgentCommandValue,
} from "@/components/execution/handoff-modal-shared";
import type {
  ExecutionRecordPersistenceValidatorIntegrationDevFixtureResult,
  ExecutionRecordPersistenceValidatorIntegrationDevFixtureScenario,
} from "@/lib/execution-record-persistence-validator-integration-dev-fixture";

type ExecutionRecordPersistenceValidatorIntegrationPreviewProps = {
  canRun: boolean;
  isRunning: boolean;
  message: string;
  onRun: () => void;
  result: ExecutionRecordPersistenceValidatorIntegrationDevFixtureResult | null;
  unavailableReason?: string | null;
};

type Tone = "amber" | "emerald" | "rose" | "sky" | "violet";

const toneClassNames: Record<Tone, string> = {
  amber: "border-amber-300/20 bg-amber-300/[0.06] text-amber-100",
  emerald: "border-emerald-300/20 bg-emerald-300/[0.06] text-emerald-100",
  rose: "border-rose-300/20 bg-rose-300/[0.06] text-rose-100",
  sky: "border-sky-300/20 bg-sky-300/[0.06] text-sky-100",
  violet: "border-violet-300/20 bg-violet-300/[0.06] text-violet-100",
};

const headingClassNames: Record<Tone, string> = {
  amber: "text-amber-100",
  emerald: "text-emerald-100",
  rose: "text-rose-100",
  sky: "text-sky-100",
  violet: "text-violet-100",
};

function yesNo(value: boolean | null | undefined) {
  return value === true ? "Yes" : "No";
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

function ScenarioPanel({
  scenario,
}: {
  scenario: ExecutionRecordPersistenceValidatorIntegrationDevFixtureScenario;
}) {
  const {
    adapterResult,
    auditAppendBoundaryValidatorResult,
    auditAppendWriterContractValidationResult,
    auditAppendWriterDryRunExecutionImplementationResult,
    auditAppendWriterDryRunExecutionValidationResult,
    auditAppendWriterDryRunValidationResult,
    auditAppendWriterValidationResult,
    boundaryCallValidatorResult,
    boundaryCallWrapperResult,
    insertRouteCallWrapperResult,
    insertRouteReadinessValidatorResult,
    integrationResult,
    label,
    postInsertBoundaryValidatorResult,
    productionInsertRouteBoundaryValidatorResult,
    validatorResult,
  } = scenario;
  const proposedInput =
    adapterResult.proposedInputSummary.proposedPersistenceInput;
  const candidate = proposedInput?.candidate ?? null;

  return (
    <div className="mt-4 rounded-md border border-white/10 bg-black/20 p-3">
      <h3 className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-violet-100">
        {label}
      </h3>

      <PreviewSection title="Integration composer readiness" tone="violet">
        <p className="mt-2 text-sm leading-6 text-zinc-300">
          Integration ready means readiness-validated only. It is not actual
          persistence validator call approval, insert-route approval,
          execution-record creation approval, persistence/write approval, audit
          append approval, stats/PnL update approval, rollback/correction
          approval, or trade mutation approval.
        </p>
        <DetailGrid>
          <Detail
            label="Integration status"
            value={formatAgentCommandValue(integrationResult.status)}
          />
          <Detail
            label="Decision"
            value={formatAgentCommandValue(
              integrationResult.decisionRecommendation,
            )}
          />
          <Detail
            label="Readiness only"
            value={yesNo(integrationResult.readinessOnly)}
          />
          <Detail
            label="Actual validator called"
            value={yesNo(integrationResult.actualPersistenceValidatorCalled)}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection
        title="Actual Persistence Validator Boundary Call Readiness"
        tone="emerald"
      >
        <p className="mt-2 text-sm leading-6 text-zinc-300">
          Boundary call validation valid means actual validator call readiness
          only. The actual persistence validator is not called, the insert route
          is not called, no execution record is created, and no
          persistence/write, audit append, stats/PnL update, rollback,
          correction, trade mutation, broker/order, Avanza/browser, or
          automatic behavior is approved.
        </p>
        <DetailGrid>
          <Detail
            label="Validation status"
            value={formatAgentCommandValue(boundaryCallValidatorResult.status)}
          />
          <Detail
            label="Decision"
            value={formatAgentCommandValue(
              boundaryCallValidatorResult.decisionRecommendation,
            )}
          />
          <Detail
            label="Call-readiness only"
            value={yesNo(boundaryCallValidatorResult.validationOnly)}
          />
          <Detail
            label="Actual validator called"
            value={yesNo(boundaryCallValidatorResult.actualValidatorCalled)}
          />
          <Detail
            label="May call actual validator only"
            value={yesNo(
              boundaryCallValidatorResult.readinessSummary
                .mayCallActualPersistenceValidatorOnly,
            )}
          />
          <Detail
            label="Actual validator call readiness only"
            value={yesNo(
              boundaryCallValidatorResult.metadata
                ?.mayCallActualPersistenceValidatorOnly === true,
            )}
          />
          <Detail
            label="Not insert route approval"
            value={yesNo(
              boundaryCallValidatorResult.safeToCallInsertRoute === false,
            )}
          />
          <Detail
            label="Not persistence/write approval"
            value={yesNo(boundaryCallValidatorResult.safeToPersist === false)}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection
        title="Actual Persistence Validator Boundary Call Wrapper"
        tone="emerald"
      >
        <p className="mt-2 text-sm leading-6 text-zinc-300">
          Wrapper diagnostics use a fixture-injected validator callable only.
          A validated wrapper result means actual validator diagnostics only:
          do not insert. It is not insert route approval, execution-record
          creation approval, persistence/write approval, audit append approval,
          stats/PnL update approval, rollback/correction approval, trade
          mutation approval, broker/order approval, Avanza/browser approval, or
          automatic mode approval.
        </p>
        <DetailGrid>
          <Detail
            label="Wrapper status"
            value={formatAgentCommandValue(boundaryCallWrapperResult.status)}
          />
          <Detail
            label="Decision"
            value={formatAgentCommandValue(
              boundaryCallWrapperResult.decisionRecommendation,
            )}
          />
          <Detail
            label="Diagnostics only"
            value={yesNo(boundaryCallWrapperResult.validationOnly)}
          />
          <Detail
            label="Fixture-injected callable only"
            value={yesNo(
              boundaryCallWrapperResult.input?.metadata
                ?.fixtureInjectedCallableOnly === true,
            )}
          />
          <Detail
            label="Actual validator called"
            value={yesNo(boundaryCallWrapperResult.actualValidatorCalled)}
          />
          <Detail
            label="Callable status"
            value={formatAgentCommandValue(
              boundaryCallWrapperResult.validatorOutputSummary
                .actualValidatorStatus ?? "not_called",
            )}
          />
          <Detail
            label="Not insert approval"
            value={yesNo(
              boundaryCallWrapperResult.safeToCallInsertRoute === false,
            )}
          />
          <Detail
            label="Not persistence/write approval"
            value={yesNo(boundaryCallWrapperResult.safeToPersist === false)}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Wrapper summaries" tone="sky">
        <DetailGrid>
          <Detail
            label="Boundary validation valid"
            value={yesNo(
              boundaryCallWrapperResult.preconditionSummary
                .boundaryCallValidationValid,
            )}
          />
          <Detail
            label="Decision allows validator only"
            value={yesNo(
              boundaryCallWrapperResult.preconditionSummary
                .decisionAllowsActualValidatorOnly,
            )}
          />
          <Detail
            label="Proposed input present"
            value={yesNo(
              boundaryCallWrapperResult.validationInputSummary
                .proposedPersistenceInputPresent,
            )}
          />
          <Detail
            label="Input normalized"
            value={yesNo(
              boundaryCallWrapperResult.normalizedInputSummary
                .normalizedInputPresent,
            )}
          />
          <Detail
            label="Schema known"
            value={yesNo(
              boundaryCallWrapperResult.schemaValidationSummary
                .schemaReadinessKnown,
            )}
          />
          <Detail
            label="Generated types"
            value={yesNo(
              boundaryCallWrapperResult.schemaValidationSummary
                .generatedTypesPresent,
            )}
          />
          <Detail
            label="Migration proven"
            value={yesNo(
              boundaryCallWrapperResult.schemaValidationSummary
                .migrationApplicationProven,
            )}
          />
          <Detail
            label="Idempotency"
            value={yesNo(
              boundaryCallWrapperResult.idempotencyDuplicateSummary
                .idempotencyMetadataPresent,
            )}
          />
          <Detail
            label="Duplicate prevention"
            value={yesNo(
              boundaryCallWrapperResult.idempotencyDuplicateSummary
                .duplicatePreventionMetadataPresent,
            )}
          />
          <Detail
            label="Audit/correction"
            value={yesNo(
              boundaryCallWrapperResult.auditCorrectionSummary
                .auditCorrectionMetadataPresent,
            )}
          />
          <Detail
            label="RLS/security"
            value={yesNo(
              boundaryCallWrapperResult.securitySummary.rlsSecurityProofPresent,
            )}
          />
          <Detail
            label="Server-only boundary"
            value={yesNo(
              boundaryCallWrapperResult.securitySummary
                .serverOnlyBoundaryPresent,
            )}
          />
          <Detail
            label="Dry-run route"
            value={yesNo(
              boundaryCallWrapperResult.dryRunManualApprovalSummary
                .dryRunRouteStatusKnown,
            )}
          />
          <Detail
            label="Manual approval"
            value={yesNo(
              boundaryCallWrapperResult.dryRunManualApprovalSummary
                .manualApprovalSatisfied,
            )}
          />
          <Detail
            label="Post-call no insert"
            value={yesNo(
              boundaryCallWrapperResult.postCallBoundarySummary.noInsertRouteCall,
            )}
          />
          <Detail
            label="Safety policy validation-only"
            value={yesNo(boundaryCallWrapperResult.safetyPolicy.validationOnly)}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Wrapper authority flags" tone="rose">
        <DetailGrid>
          <Detail
            label="safeToCallInsertRoute"
            value={String(boundaryCallWrapperResult.safeToCallInsertRoute)}
          />
          <Detail
            label="safeToCreateExecutionRecord"
            value={String(boundaryCallWrapperResult.safeToCreateExecutionRecord)}
          />
          <Detail
            label="safeToPersist"
            value={String(boundaryCallWrapperResult.safeToPersist)}
          />
          <Detail
            label="safeToFinalize"
            value={String(boundaryCallWrapperResult.safeToFinalize)}
          />
          <Detail
            label="safeToUpdateStats"
            value={String(boundaryCallWrapperResult.safeToUpdateStats)}
          />
          <Detail
            label="safeToAppendAudit"
            value={String(boundaryCallWrapperResult.safeToAppendAudit)}
          />
          <Detail
            label="safeToRollback"
            value={String(boundaryCallWrapperResult.safeToRollback)}
          />
          <Detail
            label="safeToMutateTrade"
            value={String(boundaryCallWrapperResult.safeToMutateTrade)}
          />
          <Detail
            label="safeToRunBrokerAction"
            value={String(boundaryCallWrapperResult.safeToRunBrokerAction)}
          />
          <Detail
            label="safeToRunAvanzaBrowserAction"
            value={String(boundaryCallWrapperResult.safeToRunAvanzaBrowserAction)}
          />
          <Detail
            label="automaticModeAllowed"
            value={String(boundaryCallWrapperResult.automaticModeAllowed)}
          />
          <Detail
            label="Insert route attempted"
            value={yesNo(
              boundaryCallWrapperResult.safetyPolicy.insertRouteCallAttempted,
            )}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Insert Route Readiness Boundary" tone="amber">
        <p className="mt-2 text-sm leading-6 text-zinc-300">
          Insert route readiness is preparation-only. A ready result may only
          mean may_prepare_insert_route_call_only. It does not call the insert
          route, create an execution record, persist/write, append audit,
          update stats or PnL, rollback, correct, mutate trade state, send to
          broker, run browser automation, or interact with Avanza.
        </p>
        <DetailGrid>
          <Detail
            label="Readiness status"
            value={formatAgentCommandValue(
              insertRouteReadinessValidatorResult.status,
            )}
          />
          <Detail
            label="Decision"
            value={formatAgentCommandValue(
              insertRouteReadinessValidatorResult.decisionRecommendation,
            )}
          />
          <Detail
            label="Readiness only"
            value={yesNo(
              insertRouteReadinessValidatorResult.authorityFlags.readinessOnly,
            )}
          />
          <Detail
            label="Prepare-only, no route call"
            value={yesNo(
              insertRouteReadinessValidatorResult.decisionRecommendation ===
                "may_prepare_insert_route_call_only",
            )}
          />
          <Detail
            label="Wrapper validated"
            value={yesNo(
              insertRouteReadinessValidatorResult
                .actualValidatorValidationSummary.wrapperValidated,
            )}
          />
          <Detail
            label="Wrapper decision do not insert"
            value={yesNo(
              insertRouteReadinessValidatorResult
                .actualValidatorValidationSummary.wrapperDecisionDoNotInsert,
            )}
          />
          <Detail
            label="Normalized input"
            value={yesNo(
              insertRouteReadinessValidatorResult
                .normalizedInputValidationSummary
                .proposedPersistenceInputPresent,
            )}
          />
          <Detail
            label="Required fields"
            value={yesNo(
              insertRouteReadinessValidatorResult
                .normalizedInputValidationSummary
                .requiredNormalizedFieldsPresent,
            )}
          />
          <Detail
            label="Generated types"
            value={yesNo(
              insertRouteReadinessValidatorResult
                .generatedTypesValidationSummary.generatedTypesPresent,
            )}
          />
          <Detail
            label="Migration proven"
            value={yesNo(
              insertRouteReadinessValidatorResult.migrationValidationSummary
                .migrationApplied,
            )}
          />
          <Detail
            label="RLS/security"
            value={yesNo(
              insertRouteReadinessValidatorResult.rlsSecurityValidationSummary
                .rlsSecurityProofPresent,
            )}
          />
          <Detail
            label="Server-only boundary"
            value={yesNo(
              insertRouteReadinessValidatorResult
                .serverOnlyBoundaryValidationSummary
                .serverOnlyBoundaryProofPresent,
            )}
          />
          <Detail
            label="Idempotency"
            value={yesNo(
              insertRouteReadinessValidatorResult
                .idempotencyDuplicateValidationSummary
                .idempotencyMetadataPresent,
            )}
          />
          <Detail
            label="Duplicate prevention"
            value={yesNo(
              insertRouteReadinessValidatorResult
                .idempotencyDuplicateValidationSummary
                .duplicatePreventionMetadataPresent,
            )}
          />
          <Detail
            label="Audit/correction"
            value={yesNo(
              insertRouteReadinessValidatorResult
                .auditCorrectionValidationSummary
                .auditCorrectionMetadataPresent,
            )}
          />
          <Detail
            label="Evidence/provenance"
            value={yesNo(
              insertRouteReadinessValidatorResult
                .evidenceProvenanceValidationSummary.sourceEvidencePresent,
            )}
          />
          <Detail
            label="Manual approval"
            value={yesNo(
              insertRouteReadinessValidatorResult
                .manualApprovalValidationSummary.manualApprovalSatisfied,
            )}
          />
          <Detail
            label="Dry-run route known"
            value={yesNo(
              insertRouteReadinessValidatorResult
                .dryRunProductionSeparationValidationSummary
                .dryRunRouteStatus === "known",
            )}
          />
          <Detail
            label="Dry-run is production insert"
            value={yesNo(
              insertRouteReadinessValidatorResult
                .dryRunProductionSeparationValidationSummary
                .dryRunRouteIsProductionRoute,
            )}
          />
          <Detail
            label="Production route separated"
            value={yesNo(
              insertRouteReadinessValidatorResult
                .dryRunProductionSeparationValidationSummary
                .productionRouteSeparatedFromDryRun,
            )}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Insert route readiness safety policy" tone="rose">
        <DetailGrid>
          <Detail
            label="No insert route call"
            value={yesNo(
              insertRouteReadinessValidatorResult.safetyPolicyValidationSummary
                .noInsertRouteCall,
            )}
          />
          <Detail
            label="No execution record creation"
            value={yesNo(
              insertRouteReadinessValidatorResult.safetyPolicyValidationSummary
                .noExecutionRecordCreation,
            )}
          />
          <Detail
            label="No persistence/write"
            value={yesNo(
              insertRouteReadinessValidatorResult.safetyPolicyValidationSummary
                .noPersistenceWrite,
            )}
          />
          <Detail
            label="No audit append"
            value={yesNo(
              insertRouteReadinessValidatorResult.safetyPolicyValidationSummary
                .noAuditAppend,
            )}
          />
          <Detail
            label="No stats/PnL update"
            value={yesNo(
              insertRouteReadinessValidatorResult.safetyPolicyValidationSummary
                .noStatsPnlUpdate,
            )}
          />
          <Detail
            label="No rollback/correction"
            value={yesNo(
              insertRouteReadinessValidatorResult.safetyPolicyValidationSummary
                .noRollbackCorrection,
            )}
          />
          <Detail
            label="No trade mutation"
            value={yesNo(
              insertRouteReadinessValidatorResult.safetyPolicyValidationSummary
                .noTradeMutation,
            )}
          />
          <Detail
            label="No broker/order behavior"
            value={yesNo(
              insertRouteReadinessValidatorResult.safetyPolicyValidationSummary
                .noBrokerOrderBehavior,
            )}
          />
          <Detail
            label="No Avanza/browser behavior"
            value={yesNo(
              insertRouteReadinessValidatorResult.safetyPolicyValidationSummary
                .noAvanzaBrowserBehavior,
            )}
          />
          <Detail
            label="Automatic mode disabled"
            value={yesNo(
              insertRouteReadinessValidatorResult.safetyPolicyValidationSummary
                .automaticModeDisabled,
            )}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Insert route readiness authority flags" tone="rose">
        <DetailGrid>
          <Detail
            label="safeToCallInsertRoute"
            value={String(
              insertRouteReadinessValidatorResult.authorityFlags
                .safeToCallInsertRoute,
            )}
          />
          <Detail
            label="safeToCreateExecutionRecord"
            value={String(
              insertRouteReadinessValidatorResult.authorityFlags
                .safeToCreateExecutionRecord,
            )}
          />
          <Detail
            label="safeToPersist"
            value={String(
              insertRouteReadinessValidatorResult.authorityFlags.safeToPersist,
            )}
          />
          <Detail
            label="safeToFinalize"
            value={String(
              insertRouteReadinessValidatorResult.authorityFlags.safeToFinalize,
            )}
          />
          <Detail
            label="safeToUpdateStats"
            value={String(
              insertRouteReadinessValidatorResult.authorityFlags
                .safeToUpdateStats,
            )}
          />
          <Detail
            label="safeToAppendAudit"
            value={String(
              insertRouteReadinessValidatorResult.authorityFlags
                .safeToAppendAudit,
            )}
          />
          <Detail
            label="safeToRollback"
            value={String(
              insertRouteReadinessValidatorResult.authorityFlags.safeToRollback,
            )}
          />
          <Detail
            label="safeToMutateTrade"
            value={String(
              insertRouteReadinessValidatorResult.authorityFlags
                .safeToMutateTrade,
            )}
          />
          <Detail
            label="safeToRunBrokerAction"
            value={String(
              insertRouteReadinessValidatorResult.authorityFlags
                .safeToRunBrokerAction,
            )}
          />
          <Detail
            label="safeToRunAvanzaBrowserAction"
            value={String(
              insertRouteReadinessValidatorResult.authorityFlags
                .safeToRunAvanzaBrowserAction,
            )}
          />
          <Detail
            label="automaticModeAllowed"
            value={String(
              insertRouteReadinessValidatorResult.authorityFlags
                .automaticModeAllowed,
            )}
          />
          <Detail
            label="Insert route attempted"
            value={yesNo(
              insertRouteReadinessValidatorResult.authorityFlags
                .insertRouteCallAttempted,
            )}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection
        title="Insert Route Call Wrapper Diagnostics"
        tone="amber"
      >
        <p className="mt-2 text-sm leading-6 text-zinc-300">
          Insert route call wrapper diagnostics use a fixture-injected route
          callable only. A dry-run result is dry-run diagnostics only — no
          production insert. Route success is not full persistence workflow
          completion, audit append approval, stats/PnL update approval,
          rollback/correction approval, trade mutation approval, broker/order
          approval, Avanza/browser approval, or automatic mode approval.
        </p>
        <DetailGrid>
          <Detail
            label="Route call status"
            value={formatAgentCommandValue(insertRouteCallWrapperResult.status)}
          />
          <Detail
            label="Decision"
            value={formatAgentCommandValue(
              insertRouteCallWrapperResult.decisionRecommendation,
            )}
          />
          <Detail
            label="Fixture-injected route callable only"
            value={yesNo(
              insertRouteCallWrapperResult.metadata
                ?.routeCallableInjected === true,
            )}
          />
          <Detail
            label="Dry-run diagnostics only"
            value={yesNo(
              insertRouteCallWrapperResult.status ===
                "insert_route_call_dry_run_only",
            )}
          />
          <Detail
            label="Route mode"
            value={formatAgentCommandValue(
              insertRouteCallWrapperResult.dryRunProductionModeSummary
                .routeMode,
            )}
          />
          <Detail
            label="Route call attempted"
            value={yesNo(
              insertRouteCallWrapperResult.routeOutputSummary
                .insertRouteCallAttempted,
            )}
          />
          <Detail
            label="Dry-run is production insert"
            value={yesNo(
              insertRouteCallWrapperResult.dryRunProductionModeSummary
                .dryRunRouteIsProductionInsert,
            )}
          />
          <Detail
            label="Production route available"
            value={yesNo(
              insertRouteCallWrapperResult.dryRunProductionModeSummary
                .productionRouteAvailable,
            )}
          />
          <Detail
            label="Readiness ready"
            value={yesNo(
              insertRouteCallWrapperResult.preconditionSummary
                .readinessValidationReady,
            )}
          />
          <Detail
            label="Prepare-only decision"
            value={yesNo(
              insertRouteCallWrapperResult.preconditionSummary
                .readinessDecisionPrepareOnly,
            )}
          />
          <Detail
            label="Normalized input"
            value={yesNo(
              insertRouteCallWrapperResult.normalizedInputSummary
                .normalizedPersistenceInputPresent,
            )}
          />
          <Detail
            label="Generated types"
            value={yesNo(
              insertRouteCallWrapperResult
                .schemaGeneratedTypesMigrationSummary.generatedTypesPresent,
            )}
          />
          <Detail
            label="Migration proven"
            value={yesNo(
              insertRouteCallWrapperResult
                .schemaGeneratedTypesMigrationSummary
                .migrationApplicationProven,
            )}
          />
          <Detail
            label="RLS/security"
            value={yesNo(
              insertRouteCallWrapperResult.rlsSecurityServerOnlySummary
                .rlsSecurityProofPresent,
            )}
          />
          <Detail
            label="Server-only context"
            value={yesNo(
              insertRouteCallWrapperResult.rlsSecurityServerOnlySummary
                .serverOnlyRequestContextPresent,
            )}
          />
          <Detail
            label="Server-only boundary"
            value={yesNo(
              insertRouteCallWrapperResult.rlsSecurityServerOnlySummary
                .serverOnlyBoundaryProofPresent,
            )}
          />
          <Detail
            label="Idempotency"
            value={yesNo(
              insertRouteCallWrapperResult.idempotencyDuplicateSummary
                .idempotencyMetadataPresent,
            )}
          />
          <Detail
            label="Duplicate prevention"
            value={yesNo(
              insertRouteCallWrapperResult.idempotencyDuplicateSummary
                .duplicatePreventionMetadataPresent,
            )}
          />
          <Detail
            label="Audit/correction"
            value={yesNo(
              insertRouteCallWrapperResult.auditCorrectionSummary
                .auditCorrectionMetadataPresent,
            )}
          />
          <Detail
            label="Evidence/provenance"
            value={yesNo(
              insertRouteCallWrapperResult.evidenceProvenanceSummary
                .sourceEvidencePresent,
            )}
          />
          <Detail
            label="Manual approval"
            value={yesNo(
              insertRouteCallWrapperResult.manualApprovalSummary
                .manualApprovalSatisfied,
            )}
          />
          <Detail
            label="Route success is workflow completion"
            value="false"
          />
          <Detail
            label="Route success is audit approval"
            value="false"
          />
          <Detail
            label="Route success is stats approval"
            value="false"
          />
          <Detail
            label="Route success is trade approval"
            value="false"
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Insert route call route output" tone="sky">
        <DetailGrid>
          <Detail
            label="Output status"
            value={formatAgentCommandValue(
              insertRouteCallWrapperResult.routeOutputSummary
                .insertRouteCallStatus ?? "not_called",
            )}
          />
          <Detail
            label="Validation errors"
            value={formatAgentCommandValue(
              insertRouteCallWrapperResult.routeOutputSummary
                .routeValidationErrors.length,
            )}
          />
          <Detail
            label="Dry-run accepted"
            value={yesNo(
              insertRouteCallWrapperResult.routeOutputSummary.dryRunResult
                ?.accepted === true,
            )}
          />
          <Detail
            label="Production insert attempted"
            value={yesNo(
              insertRouteCallWrapperResult.routeOutputSummary.dryRunResult
                ?.productionInsertAttempted === true,
            )}
          />
          <Detail
            label="Supabase write attempted"
            value={yesNo(
              insertRouteCallWrapperResult.routeOutputSummary.dryRunResult
                ?.supabaseWriteAttempted === true,
            )}
          />
          <Detail
            label="Audit append attempted"
            value={yesNo(
              insertRouteCallWrapperResult.routeOutputSummary.dryRunResult
                ?.auditAppendAttempted === true,
            )}
          />
          <Detail
            label="Stats update attempted"
            value={yesNo(
              insertRouteCallWrapperResult.routeOutputSummary.dryRunResult
                ?.statsUpdateAttempted === true,
            )}
          />
          <Detail
            label="Trade mutation attempted"
            value={yesNo(
              insertRouteCallWrapperResult.routeOutputSummary.dryRunResult
                ?.tradeMutationAttempted === true,
            )}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Insert route call post-insert boundary" tone="rose">
        <DetailGrid>
          <Detail
            label="safeToAppendAudit"
            value={String(
              insertRouteCallWrapperResult.postInsertBoundarySummary
                .safeToAppendAudit,
            )}
          />
          <Detail
            label="safeToUpdateStats"
            value={String(
              insertRouteCallWrapperResult.postInsertBoundarySummary
                .safeToUpdateStats,
            )}
          />
          <Detail
            label="safeToRollback"
            value={String(
              insertRouteCallWrapperResult.postInsertBoundarySummary
                .safeToRollback,
            )}
          />
          <Detail
            label="safeToMutateTrade"
            value={String(
              insertRouteCallWrapperResult.postInsertBoundarySummary
                .safeToMutateTrade,
            )}
          />
          <Detail
            label="safeToRunBrokerAction"
            value={String(
              insertRouteCallWrapperResult.postInsertBoundarySummary
                .safeToRunBrokerAction,
            )}
          />
          <Detail
            label="safeToRunAvanzaBrowserAction"
            value={String(
              insertRouteCallWrapperResult.postInsertBoundarySummary
                .safeToRunAvanzaBrowserAction,
            )}
          />
          <Detail
            label="automaticModeAllowed"
            value={String(
              insertRouteCallWrapperResult.postInsertBoundarySummary
                .automaticModeAllowed,
            )}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Insert route call safety policy" tone="rose">
        <DetailGrid>
          <Detail
            label="safeToCreateExecutionRecord"
            value={String(
              insertRouteCallWrapperResult.safetyPolicy
                .safeToCreateExecutionRecord,
            )}
          />
          <Detail
            label="safeToPersist"
            value={String(insertRouteCallWrapperResult.safetyPolicy.safeToPersist)}
          />
          <Detail
            label="safeToFinalize"
            value={String(insertRouteCallWrapperResult.safetyPolicy.safeToFinalize)}
          />
          <Detail
            label="safeToAppendAudit"
            value={String(
              insertRouteCallWrapperResult.safetyPolicy.safeToAppendAudit,
            )}
          />
          <Detail
            label="safeToUpdateStats"
            value={String(
              insertRouteCallWrapperResult.safetyPolicy.safeToUpdateStats,
            )}
          />
          <Detail
            label="safeToRollback"
            value={String(insertRouteCallWrapperResult.safetyPolicy.safeToRollback)}
          />
          <Detail
            label="safeToMutateTrade"
            value={String(
              insertRouteCallWrapperResult.safetyPolicy.safeToMutateTrade,
            )}
          />
          <Detail
            label="safeToRunBrokerAction"
            value={String(
              insertRouteCallWrapperResult.safetyPolicy.safeToRunBrokerAction,
            )}
          />
          <Detail
            label="safeToRunAvanzaBrowserAction"
            value={String(
              insertRouteCallWrapperResult.safetyPolicy
                .safeToRunAvanzaBrowserAction,
            )}
          />
          <Detail
            label="automaticModeAllowed"
            value={String(
              insertRouteCallWrapperResult.safetyPolicy.automaticModeAllowed,
            )}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Production Insert Route Boundary" tone="rose">
        <p className="mt-2 text-sm leading-6 text-zinc-300">
          Production boundary diagnostics only. This dev preview is design/readiness
          only: production route is not implemented, production route is not
          called, and design-only means do not implement or call the production
          route. Production boundary ready is not production route creation
          approval, production route call approval, insert execution,
          execution-record creation approval, persistence/write approval, audit
          append approval, stats/PnL update approval, rollback/correction
          approval, trade mutation approval, broker/order approval,
          Avanza/browser approval, or automatic mode approval.
        </p>
        <DetailGrid>
          <Detail
            label="Production boundary validation status"
            value={formatAgentCommandValue(
              productionInsertRouteBoundaryValidatorResult.status,
            )}
          />
          <Detail
            label="Decision"
            value={formatAgentCommandValue(
              productionInsertRouteBoundaryValidatorResult
                .decisionRecommendation,
            )}
          />
          <Detail
            label="Ready for design diagnostics only"
            value={yesNo(
              productionInsertRouteBoundaryValidatorResult.status ===
                "production_insert_route_boundary_validation_ready_for_design_only",
            )}
          />
          <Detail
            label="Design-only, do not implement or call production route"
            value={yesNo(
              productionInsertRouteBoundaryValidatorResult
                .decisionRecommendation === "design_only_do_not_implement_route",
            )}
          />
          <Detail label="Dev preview only" value="Yes" />
          <Detail label="Production boundary diagnostics only" value="Yes" />
          <Detail label="Design/readiness only" value="Yes" />
          <Detail label="Production route is not implemented" value="Yes" />
          <Detail label="Production route is not called" value="Yes" />
          <Detail label="Dry-run route is not production insert" value="Yes" />
          <Detail
            label="Production boundary ready is not route creation approval"
            value="Yes"
          />
          <Detail
            label="Production boundary ready is not route call approval"
            value="Yes"
          />
          <Detail
            label="Production boundary ready is not execution-record creation approval"
            value="Yes"
          />
          <Detail
            label="Production boundary ready is not persistence/write approval"
            value="Yes"
          />
          <Detail label="Not audit append approval" value="Yes" />
          <Detail label="Not stats/PnL update approval" value="Yes" />
          <Detail label="Not rollback/correction approval" value="Yes" />
          <Detail label="Not trade mutation approval" value="Yes" />
          <Detail label="Not broker/order approval" value="Yes" />
          <Detail label="No Avanza/browser action" value="Yes" />
          <Detail label="Automatic mode disabled" value="Yes" />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection
        title="Production boundary validation summaries"
        tone="sky"
      >
        <DetailGrid>
          <Detail
            label="Current-state validation summary"
            value={yesNo(
              productionInsertRouteBoundaryValidatorResult
                .currentStateValidationSummary.boundaryInputPresent,
            )}
          />
          <Detail
            label="Precondition validation summary"
            value={yesNo(
              productionInsertRouteBoundaryValidatorResult
                .preconditionValidationSummary.generatedTypesPresent,
            )}
          />
          <Detail
            label="Route-shape validation summary"
            value={yesNo(
              productionInsertRouteBoundaryValidatorResult
                .routeShapeValidationSummary.routeModeProductionOnly,
            )}
          />
          <Detail
            label="Allowed-input validation summary"
            value={yesNo(
              productionInsertRouteBoundaryValidatorResult
                .allowedInputValidationSummary.normalizedInputPresent,
            )}
          />
          <Detail
            label="Allowed-output validation summary"
            value={yesNo(
              productionInsertRouteBoundaryValidatorResult
                .allowedOutputValidationSummary.safeSummaryOnly,
            )}
          />
          <Detail
            label="Dry-run separation validation summary"
            value={yesNo(
              productionInsertRouteBoundaryValidatorResult
                .dryRunSeparationValidationSummary
                .dryRunRouteDiagnosticsOnly,
            )}
          />
          <Detail
            label="Security validation summary"
            value={yesNo(
              productionInsertRouteBoundaryValidatorResult
                .securityValidationSummary.rlsSecurityProofPresent,
            )}
          />
          <Detail
            label="Server-only validation summary"
            value={yesNo(
              productionInsertRouteBoundaryValidatorResult
                .serverOnlyValidationSummary.serverOnlyBoundaryProven,
            )}
          />
          <Detail
            label="Schema/generated-types/migration validation summary"
            value={yesNo(
              productionInsertRouteBoundaryValidatorResult
                .schemaGeneratedTypesMigrationValidationSummary
                .generatedTypesPresent,
            )}
          />
          <Detail
            label="Idempotency/duplicate validation summary"
            value={yesNo(
              productionInsertRouteBoundaryValidatorResult
                .idempotencyDuplicateValidationSummary.idempotencyKeyPresent,
            )}
          />
          <Detail
            label="Audit/correction validation summary"
            value={yesNo(
              productionInsertRouteBoundaryValidatorResult
                .auditCorrectionValidationSummary
                .auditCorrectionMetadataPresent,
            )}
          />
          <Detail
            label="Evidence/provenance validation summary"
            value={yesNo(
              productionInsertRouteBoundaryValidatorResult
                .evidenceProvenanceValidationSummary
                .evidenceProvenanceChainPresent,
            )}
          />
          <Detail
            label="Post-insert boundary validation summary"
            value={yesNo(
              productionInsertRouteBoundaryValidatorResult
                .postInsertBoundaryValidationSummary.safeToAppendAudit ===
                false,
            )}
          />
          <Detail
            label="Safety policy validation summary"
            value={yesNo(
              productionInsertRouteBoundaryValidatorResult
                .safetyPolicyValidationSummary.noProductionRouteCall,
            )}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Production boundary authority flags" tone="rose">
        <DetailGrid>
          <Detail
            label="productionRouteImplementationAllowed"
            value={String(
              productionInsertRouteBoundaryValidatorResult.authorityFlags
                .productionRouteImplementationAllowed,
            )}
          />
          <Detail
            label="productionRouteCallAllowed"
            value={String(
              productionInsertRouteBoundaryValidatorResult.authorityFlags
                .productionRouteCallAllowed,
            )}
          />
          <Detail
            label="safeToCreateExecutionRecord"
            value={String(
              productionInsertRouteBoundaryValidatorResult.authorityFlags
                .safeToCreateExecutionRecord,
            )}
          />
          <Detail
            label="safeToPersist"
            value={String(
              productionInsertRouteBoundaryValidatorResult.authorityFlags
                .safeToPersist,
            )}
          />
          <Detail
            label="safeToAppendAudit"
            value={String(
              productionInsertRouteBoundaryValidatorResult.authorityFlags
                .safeToAppendAudit,
            )}
          />
          <Detail
            label="safeToUpdateStats"
            value={String(
              productionInsertRouteBoundaryValidatorResult.authorityFlags
                .safeToUpdateStats,
            )}
          />
          <Detail
            label="safeToRollback"
            value={String(
              productionInsertRouteBoundaryValidatorResult.authorityFlags
                .safeToRollback,
            )}
          />
          <Detail
            label="safeToMutateTrade"
            value={String(
              productionInsertRouteBoundaryValidatorResult.authorityFlags
                .safeToMutateTrade,
            )}
          />
          <Detail
            label="safeToRunBrokerAction"
            value={String(
              productionInsertRouteBoundaryValidatorResult.authorityFlags
                .safeToRunBrokerAction,
            )}
          />
          <Detail
            label="safeToRunAvanzaBrowserAction"
            value={String(
              productionInsertRouteBoundaryValidatorResult.authorityFlags
                .safeToRunAvanzaBrowserAction,
            )}
          />
          <Detail
            label="automaticModeAllowed"
            value={String(
              productionInsertRouteBoundaryValidatorResult.authorityFlags
                .automaticModeAllowed,
            )}
          />
          <Detail
            label="Production route call attempted"
            value={yesNo(
              productionInsertRouteBoundaryValidatorResult.authorityFlags
                .productionRouteCallAttempted,
            )}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Post-Insert Boundary Validator" tone="rose">
        <p className="mt-2 text-sm leading-6 text-zinc-300">
          Post-insert boundary diagnostics only. This preview calls the pure
          validateExecutionRecordPostInsertBoundary(...) fixture path for
          display-only readiness diagnostics. Ready means design-only do not run
          post-insert actions; insert success is not approval to append audit,
          update stats or PnL, mutate or reconcile trades, roll back or
          correct, recover failures, update UI source-of-truth state, notify a
          user, send a broker/order follow-up, automate Avanza/browser behavior,
          enable automatic mode, or mark the full workflow complete.
        </p>
        <DetailGrid>
          <Detail
            label="Post-insert boundary validation status"
            value={formatAgentCommandValue(
              postInsertBoundaryValidatorResult.status,
            )}
          />
          <Detail
            label="Decision"
            value={formatAgentCommandValue(
              postInsertBoundaryValidatorResult.decisionRecommendation,
            )}
          />
          <Detail
            label="Ready for design diagnostics only"
            value={yesNo(
              postInsertBoundaryValidatorResult.status ===
                "post_insert_boundary_validation_ready_for_design_only",
            )}
          />
          <Detail
            label="Design-only, do not run post-insert actions"
            value={yesNo(
              postInsertBoundaryValidatorResult.decisionRecommendation ===
                "design_only_do_not_run_post_insert_actions",
            )}
          />
          <Detail
            label="Validation only"
            value={yesNo(postInsertBoundaryValidatorResult.validationOnly)}
          />
          <Detail
            label="Design only"
            value={yesNo(postInsertBoundaryValidatorResult.designOnly)}
          />
          <Detail
            label="Validator implemented"
            value={String(
              postInsertBoundaryValidatorResult.validatorImplemented,
            )}
          />
          <Detail
            label="Validator readiness executes actions"
            value={String(
              postInsertBoundaryValidatorResult
                .validatorReadinessExecutesActions,
            )}
          />
          <Detail
            label="Insert success approves post-insert actions"
            value={String(
              postInsertBoundaryValidatorResult
                .insertSuccessApprovesPostInsertActions,
            )}
          />
          <Detail
            label="Insert success is full workflow completion"
            value={String(
              postInsertBoundaryValidatorResult
                .insertSuccessIsFullWorkflowCompletion,
            )}
          />
          <Detail
            label="No route call"
            value={yesNo(
              postInsertBoundaryValidatorResult.metadata?.noRouteCall === true,
            )}
          />
          <Detail
            label="No persistence/write"
            value={yesNo(
              postInsertBoundaryValidatorResult.metadata?.noPersistenceWrite ===
                true,
            )}
          />
          <Detail
            label="No post-insert actions"
            value={yesNo(
              postInsertBoundaryValidatorResult.metadata?.noPostInsertActions ===
                true,
            )}
          />
          <Detail
            label="Broker/Avanza disabled"
            value={yesNo(
              postInsertBoundaryValidatorResult.metadata
                ?.brokerAvanzaDisabled === true,
            )}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Post-insert category validations" tone="sky">
        <DetailGrid>
          <Detail
            label="Audit append ready for design only"
            value={yesNo(
              postInsertBoundaryValidatorResult.categoryValidations.auditAppend
                .readyForDesignOnly,
            )}
          />
          <Detail
            label="Stats/PnL ready for design only"
            value={yesNo(
              postInsertBoundaryValidatorResult.categoryValidations
                .statsPnlUpdate.readyForDesignOnly,
            )}
          />
          <Detail
            label="Trade reconciliation ready for design only"
            value={yesNo(
              postInsertBoundaryValidatorResult.categoryValidations
                .tradeReconciliation.readyForDesignOnly,
            )}
          />
          <Detail
            label="Correction/rollback ready for design only"
            value={yesNo(
              postInsertBoundaryValidatorResult.categoryValidations
                .correctionRollback.readyForDesignOnly,
            )}
          />
          <Detail
            label="Failure recovery ready for design only"
            value={yesNo(
              postInsertBoundaryValidatorResult.categoryValidations
                .failureRecovery.readyForDesignOnly,
            )}
          />
          <Detail
            label="UI state ready for design only"
            value={yesNo(
              postInsertBoundaryValidatorResult.categoryValidations.uiStateUpdate
                .readyForDesignOnly,
            )}
          />
          <Detail
            label="Notification ready for design only"
            value={yesNo(
              postInsertBoundaryValidatorResult.categoryValidations
                .userNotification.readyForDesignOnly,
            )}
          />
          <Detail
            label="Broker follow-up ready for design only"
            value={yesNo(
              postInsertBoundaryValidatorResult.categoryValidations
                .brokerOrderFollowUp.readyForDesignOnly,
            )}
          />
          <Detail
            label="Avanza/browser ready for design only"
            value={yesNo(
              postInsertBoundaryValidatorResult.categoryValidations
                .avanzaBrowserFollowUp.readyForDesignOnly,
            )}
          />
          <Detail
            label="Audit append action execution allowed"
            value={String(
              postInsertBoundaryValidatorResult.categoryValidations.auditAppend
                .actionExecutionAllowed,
            )}
          />
          <Detail
            label="Broker action execution allowed"
            value={String(
              postInsertBoundaryValidatorResult.categoryValidations
                .brokerOrderFollowUp.actionExecutionAllowed,
            )}
          />
          <Detail
            label="Avanza/browser action execution allowed"
            value={String(
              postInsertBoundaryValidatorResult.categoryValidations
                .avanzaBrowserFollowUp.actionExecutionAllowed,
            )}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Post-insert safety policy" tone="rose">
        <DetailGrid>
          <Detail
            label="validationReadinessIsActionExecution"
            value={String(
              postInsertBoundaryValidatorResult.safetyPolicy
                .validationReadinessIsActionExecution,
            )}
          />
          <Detail
            label="insertSuccessIsPostInsertApproval"
            value={String(
              postInsertBoundaryValidatorResult.safetyPolicy
                .insertSuccessIsPostInsertApproval,
            )}
          />
          <Detail
            label="insertSuccessIsFullWorkflowCompletion"
            value={String(
              postInsertBoundaryValidatorResult.safetyPolicy
                .insertSuccessIsFullWorkflowCompletion,
            )}
          />
          <Detail
            label="eachCategoryValidatedSeparately"
            value={String(
              postInsertBoundaryValidatorResult.safetyPolicy
                .eachCategoryValidatedSeparately,
            )}
          />
          <Detail
            label="evidenceProvenanceRequired"
            value={String(
              postInsertBoundaryValidatorResult.safetyPolicy
                .evidenceProvenanceRequired,
            )}
          />
          <Detail
            label="idempotencyRequired"
            value={String(
              postInsertBoundaryValidatorResult.safetyPolicy
                .idempotencyRequired,
            )}
          />
          <Detail
            label="duplicatePreventionRequired"
            value={String(
              postInsertBoundaryValidatorResult.safetyPolicy
                .duplicatePreventionRequired,
            )}
          />
          <Detail
            label="noChainedImplicitActions"
            value={String(
              postInsertBoundaryValidatorResult.safetyPolicy
                .noChainedImplicitActions,
            )}
          />
          <Detail
            label="brokerAvanzaDisabledUnlessApproved"
            value={String(
              postInsertBoundaryValidatorResult.safetyPolicy
                .brokerAvanzaDisabledUnlessApproved,
            )}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Post-insert authority flags" tone="rose">
        <DetailGrid>
          <Detail
            label="postInsertActionsImplemented"
            value={String(
              postInsertBoundaryValidatorResult.authority
                .postInsertActionsImplemented,
            )}
          />
          <Detail
            label="postInsertActionsAllowed"
            value={String(
              postInsertBoundaryValidatorResult.authority
                .postInsertActionsAllowed,
            )}
          />
          <Detail
            label="safeToAppendAudit"
            value={String(
              postInsertBoundaryValidatorResult.authority.safeToAppendAudit,
            )}
          />
          <Detail
            label="safeToUpdateStats"
            value={String(
              postInsertBoundaryValidatorResult.authority.safeToUpdateStats,
            )}
          />
          <Detail
            label="safeToMutateTrade"
            value={String(
              postInsertBoundaryValidatorResult.authority.safeToMutateTrade,
            )}
          />
          <Detail
            label="safeToReconcileTrade"
            value={String(
              postInsertBoundaryValidatorResult.authority.safeToReconcileTrade,
            )}
          />
          <Detail
            label="safeToRollback"
            value={String(
              postInsertBoundaryValidatorResult.authority.safeToRollback,
            )}
          />
          <Detail
            label="safeToRecoverFailure"
            value={String(
              postInsertBoundaryValidatorResult.authority.safeToRecoverFailure,
            )}
          />
          <Detail
            label="safeToUpdateUiState"
            value={String(
              postInsertBoundaryValidatorResult.authority.safeToUpdateUiState,
            )}
          />
          <Detail
            label="safeToNotifyUser"
            value={String(
              postInsertBoundaryValidatorResult.authority.safeToNotifyUser,
            )}
          />
          <Detail
            label="safeToRunBrokerAction"
            value={String(
              postInsertBoundaryValidatorResult.authority
                .safeToRunBrokerAction,
            )}
          />
          <Detail
            label="safeToRunAvanzaBrowserAction"
            value={String(
              postInsertBoundaryValidatorResult.authority
                .safeToRunAvanzaBrowserAction,
            )}
          />
          <Detail
            label="automaticModeAllowed"
            value={String(
              postInsertBoundaryValidatorResult.authority.automaticModeAllowed,
            )}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Post-insert evidence and dependencies" tone="sky">
        <DetailGrid>
          <Detail
            label="Execution record reference"
            value={yesNo(
              postInsertBoundaryValidatorResult.evidence
                .executionRecordReferencePresent,
            )}
          />
          <Detail
            label="Execution record evidence"
            value={yesNo(
              postInsertBoundaryValidatorResult.evidence
                .executionRecordEvidencePresent,
            )}
          />
          <Detail
            label="Evidence provenance"
            value={yesNo(
              postInsertBoundaryValidatorResult.evidence
                .evidenceProvenancePresent,
            )}
          />
          <Detail
            label="Generated types"
            value={yesNo(
              postInsertBoundaryValidatorResult.dependencies
                .generatedTypesPresent,
            )}
          />
          <Detail
            label="Migration proven"
            value={yesNo(
              postInsertBoundaryValidatorResult.dependencies
                .migrationApplicationProven,
            )}
          />
          <Detail
            label="RLS verified"
            value={yesNo(
              postInsertBoundaryValidatorResult.dependencies
                .rlsSecurityVerified,
            )}
          />
          <Detail
            label="Server-only boundary"
            value={yesNo(
              postInsertBoundaryValidatorResult.dependencies
                .serverOnlyBoundaryVerified,
            )}
          />
          <Detail
            label="Post-insert orchestrator present"
            value={String(
              postInsertBoundaryValidatorResult.dependencies
                .postInsertOrchestratorPresent,
            )}
          />
          <Detail
            label="Post-insert actions implemented"
            value={String(
              postInsertBoundaryValidatorResult.dependencies
                .postInsertActionsImplemented,
            )}
          />
          <Detail
            label="Idempotency present"
            value={yesNo(
              postInsertBoundaryValidatorResult.idempotency.idempotencyPresent,
            )}
          />
          <Detail
            label="Duplicate prevention present"
            value={yesNo(
              postInsertBoundaryValidatorResult.idempotency
                .duplicatePreventionPresent,
            )}
          />
          <Detail
            label="Partial failure representable"
            value={yesNo(
              postInsertBoundaryValidatorResult.failureModel
                .partialFailureRepresentable,
            )}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Audit Append Boundary Validator" tone="rose">
        <p className="mt-2 text-sm leading-6 text-zinc-300">
          Audit append diagnostics only. This preview calls the pure
          validateExecutionRecordAuditAppendBoundary(...) fixture path for
          display-only readiness diagnostics. Ready means design-only do not
          append audit. Audit validation readiness is not audit append
          execution. Insert success is not audit append approval. Post-insert
          validator readiness is not audit append approval. Orchestrator
          contract readiness is not audit append approval. Audit boundary
          contract readiness is not audit append approval. Audit validation
          success is not downstream action approval.
        </p>
        <DetailGrid>
          <Detail
            label="Audit append boundary validation status"
            value={formatAgentCommandValue(
              auditAppendBoundaryValidatorResult.status,
            )}
          />
          <Detail
            label="Decision"
            value={formatAgentCommandValue(
              auditAppendBoundaryValidatorResult.decisionRecommendation,
            )}
          />
          <Detail
            label="Ready for design diagnostics only"
            value={yesNo(
              auditAppendBoundaryValidatorResult.status ===
                "audit_append_boundary_validation_ready_for_design_only",
            )}
          />
          <Detail
            label="Design-only, do not append audit"
            value={yesNo(
              auditAppendBoundaryValidatorResult.decisionRecommendation ===
                "design_only_do_not_append_audit",
            )}
          />
          <Detail
            label="Validation only"
            value={yesNo(auditAppendBoundaryValidatorResult.validationOnly)}
          />
          <Detail
            label="Design only"
            value={yesNo(auditAppendBoundaryValidatorResult.designOnly)}
          />
          <Detail
            label="Audit validator implemented"
            value={String(
              auditAppendBoundaryValidatorResult.auditValidatorImplemented,
            )}
          />
          <Detail
            label="Audit validation readiness is audit append execution"
            value={String(
              auditAppendBoundaryValidatorResult
                .auditValidationReadinessIsAuditAppendExecution,
            )}
          />
          <Detail
            label="Audit append allowed"
            value={String(auditAppendBoundaryValidatorResult.auditAppendAllowed)}
          />
          <Detail
            label="Safe to append audit"
            value={String(auditAppendBoundaryValidatorResult.safeToAppendAudit)}
          />
          <Detail
            label="Audit validation success approves stats/PnL"
            value={String(
              auditAppendBoundaryValidatorResult
                .auditValidationSuccessApprovesStatsPnlUpdate,
            )}
          />
          <Detail
            label="Audit validation success approves trade mutation"
            value={String(
              auditAppendBoundaryValidatorResult
                .auditValidationSuccessApprovesTradeMutation,
            )}
          />
          <Detail
            label="No audit append"
            value={yesNo(
              auditAppendBoundaryValidatorResult.metadata?.noAuditAppend ===
                true,
            )}
          />
          <Detail
            label="No audit write"
            value={yesNo(
              auditAppendBoundaryValidatorResult.metadata?.noAuditWrite ===
                true,
            )}
          />
          <Detail
            label="No downstream actions"
            value={yesNo(
              auditAppendBoundaryValidatorResult.metadata
                ?.noStatsPnlUpdate === true &&
                auditAppendBoundaryValidatorResult.metadata
                  ?.noTradeMutation === true,
            )}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Audit append validation summaries" tone="sky">
        <DetailGrid>
          <Detail
            label="Audit event type present"
            value={yesNo(
              auditAppendBoundaryValidatorResult.candidate
                .auditEventTypePresent,
            )}
          />
          <Detail
            label="Audit event payload present"
            value={yesNo(
              auditAppendBoundaryValidatorResult.candidate
                .auditEventPayloadSummaryPresent,
            )}
          />
          <Detail
            label="Execution record reference present"
            value={yesNo(
              auditAppendBoundaryValidatorResult.evidence
                .executionRecordReferencePresent,
            )}
          />
          <Detail
            label="Evidence provenance present"
            value={yesNo(
              auditAppendBoundaryValidatorResult.evidence
                .evidenceProvenancePresent,
            )}
          />
          <Detail
            label="Idempotency key present"
            value={yesNo(
              auditAppendBoundaryValidatorResult.idempotency
                .idempotencyKeyPresent,
            )}
          />
          <Detail
            label="Duplicate prevention key present"
            value={yesNo(
              auditAppendBoundaryValidatorResult.duplicatePrevention
                .duplicatePreventionKeyPresent,
            )}
          />
          <Detail
            label="Audit schema table verified"
            value={yesNo(
              auditAppendBoundaryValidatorResult.schema
                .auditSchemaTableVerified,
            )}
          />
          <Detail
            label="Client-side audit write blocked"
            value={yesNo(
              auditAppendBoundaryValidatorResult.securityServerOnly
                .clientSideAuditWriteBlocked,
            )}
          />
          <Detail
            label="Audit write path present"
            value={String(
              auditAppendBoundaryValidatorResult.dependencies
                .auditWritePathPresent,
            )}
          />
          <Detail
            label="Audit writer implemented"
            value={String(
              auditAppendBoundaryValidatorResult.dependencies
                .auditWriterImplemented,
            )}
          />
          <Detail
            label="Future append write failure represented"
            value={yesNo(
              auditAppendBoundaryValidatorResult.failureModel
                .futureAppendWriteFailureRepresented,
            )}
          />
          <Detail
            label="Downstream actions remain blocked"
            value={yesNo(
              auditAppendBoundaryValidatorResult.failureModel
                .downstreamActionsRemainBlockedRepresented,
            )}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Audit append authority flags" tone="rose">
        <DetailGrid>
          <Detail
            label="auditValidatorImplemented"
            value={String(
              auditAppendBoundaryValidatorResult.authority
                .auditValidatorImplemented,
            )}
          />
          <Detail
            label="auditAppendImplemented"
            value={String(
              auditAppendBoundaryValidatorResult.authority
                .auditAppendImplemented,
            )}
          />
          <Detail
            label="auditWriterImplemented"
            value={String(
              auditAppendBoundaryValidatorResult.authority
                .auditWriterImplemented,
            )}
          />
          <Detail
            label="auditAppendAllowed"
            value={String(
              auditAppendBoundaryValidatorResult.authority.auditAppendAllowed,
            )}
          />
          <Detail
            label="safeToAppendAudit"
            value={String(
              auditAppendBoundaryValidatorResult.authority.safeToAppendAudit,
            )}
          />
          <Detail
            label="safeToUpdateStats"
            value={String(
              auditAppendBoundaryValidatorResult.authority.safeToUpdateStats,
            )}
          />
          <Detail
            label="safeToMutateTrade"
            value={String(
              auditAppendBoundaryValidatorResult.authority.safeToMutateTrade,
            )}
          />
          <Detail
            label="safeToReconcileTrade"
            value={String(
              auditAppendBoundaryValidatorResult.authority.safeToReconcileTrade,
            )}
          />
          <Detail
            label="safeToRollback"
            value={String(
              auditAppendBoundaryValidatorResult.authority.safeToRollback,
            )}
          />
          <Detail
            label="safeToUpdateUiState"
            value={String(
              auditAppendBoundaryValidatorResult.authority.safeToUpdateUiState,
            )}
          />
          <Detail
            label="safeToNotifyUser"
            value={String(
              auditAppendBoundaryValidatorResult.authority.safeToNotifyUser,
            )}
          />
          <Detail
            label="safeToRunBrokerAction"
            value={String(
              auditAppendBoundaryValidatorResult.authority.safeToRunBrokerAction,
            )}
          />
          <Detail
            label="safeToRunAvanzaBrowserAction"
            value={String(
              auditAppendBoundaryValidatorResult.authority
                .safeToRunAvanzaBrowserAction,
            )}
          />
          <Detail
            label="automaticModeAllowed"
            value={String(
              auditAppendBoundaryValidatorResult.authority.automaticModeAllowed,
            )}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Audit Append Writer Validator" tone="rose">
        <p className="mt-2 text-sm leading-6 text-zinc-300">
          Audit writer diagnostics only. This dev preview calls the pure
          validateExecutionRecordAuditAppendWriter(...) fixture path for
          design/readiness only. Ready means design-only do not write audit.
          Writer validation readiness is not audit write approval. Writer
          contract readiness is not audit write approval. Insert success is not
          audit write approval. Audit boundary validator readiness is not audit
          write approval. Dev-preview diagnostics are not audit write approval.
          Orchestrator readiness is not audit write approval. Production
          boundary readiness is not audit write approval. Dry-run success is
          not audit write approval. Writer validation success is not downstream
          action approval. No audit write, no audit append, no stats/PnL
          update, no trade mutation/reconciliation, no rollback/correction, no
          UI update, no notification execution, no broker/order action, no
          Avanza/browser action, automatic mode disabled.
        </p>
        <DetailGrid>
          <Detail
            label="Audit append writer validation status"
            value={formatAgentCommandValue(
              auditAppendWriterValidationResult.status,
            )}
          />
          <Detail
            label="Decision"
            value={formatAgentCommandValue(
              auditAppendWriterValidationResult.decisionRecommendation,
            )}
          />
          <Detail
            label="Ready for design diagnostics only"
            value={yesNo(
              auditAppendWriterValidationResult.status ===
                "audit_append_writer_validation_ready_for_design_only",
            )}
          />
          <Detail
            label="Design-only do not write audit"
            value={yesNo(
              auditAppendWriterValidationResult.decisionRecommendation ===
                "design_only_do_not_write_audit",
            )}
          />
          <Detail label="Dev preview only" value="Yes" />
          <Detail label="Audit writer diagnostics only" value="Yes" />
          <Detail label="Design/readiness only" value="Yes" />
          <Detail
            label="Writer validation readiness is not audit write approval"
            value={yesNo(
              auditAppendWriterValidationResult
                .writerValidationReadinessIsAuditWriteApproval === false,
            )}
          />
          <Detail
            label="Writer contract readiness is not audit write approval"
            value={yesNo(
              auditAppendWriterValidationResult
                .writerContractReadinessIsAuditWriteApproval === false,
            )}
          />
          <Detail
            label="Insert success is not audit write approval"
            value={yesNo(
              auditAppendWriterValidationResult
                .insertSuccessIsAuditWriteApproval === false,
            )}
          />
          <Detail
            label="Audit boundary validator readiness is not audit write approval"
            value={yesNo(
              auditAppendWriterValidationResult
                .auditBoundaryValidatorReadinessIsAuditWriteApproval === false,
            )}
          />
          <Detail
            label="Dev-preview diagnostics are not audit write approval"
            value={yesNo(
              auditAppendWriterValidationResult
                .devPreviewDiagnosticsAreAuditWriteApproval === false,
            )}
          />
          <Detail
            label="Orchestrator readiness is not audit write approval"
            value={yesNo(
              auditAppendWriterValidationResult
                .orchestratorReadinessIsAuditWriteApproval === false,
            )}
          />
          <Detail
            label="Production boundary readiness is not audit write approval"
            value={yesNo(
              auditAppendWriterValidationResult
                .productionBoundaryReadinessIsAuditWriteApproval === false,
            )}
          />
          <Detail
            label="Dry-run success is not audit write approval"
            value={yesNo(
              auditAppendWriterValidationResult
                .dryRunSuccessIsAuditWriteApproval === false,
            )}
          />
          <Detail
            label="Writer validation success is not downstream action approval"
            value={yesNo(
              auditAppendWriterValidationResult
                .writerValidationSuccessApprovesStatsPnlUpdate === false &&
                auditAppendWriterValidationResult
                  .writerValidationSuccessApprovesTradeMutation === false &&
                auditAppendWriterValidationResult
                  .writerValidationSuccessApprovesCorrectionRollback === false
            )}
          />
          <Detail
            label="Audit write allowed"
            value={String(auditAppendWriterValidationResult.auditWriteAllowed)}
          />
          <Detail
            label="Safe to write audit"
            value={String(auditAppendWriterValidationResult.safeToWriteAudit)}
          />
          <Detail
            label="Safe to append audit"
            value={String(auditAppendWriterValidationResult.safeToAppendAudit)}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Audit Append Writer Contract Validator" tone="rose">
        <p className="mt-2 text-sm leading-6 text-zinc-300">
          Contract validator diagnostics only. This dev preview calls the pure
          validateExecutionRecordAuditAppendWriterContract(...) fixture path for
          design/readiness only. Ready means design-only do not write audit.
          Contract validation is not audit write approval. Contract validation
          is not security proof. Contract validation is not server-only proof.
          Contract validation is not schema/table proof. Contract validation is
          not generated-types proof. Contract validation is not migration proof.
          Contract validation is not RLS/security proof. Checklist status is
          not proof. Dev-preview diagnostics are not proof/write approval.
          Writer validator readiness is not write approval. Writer contract
          readiness is not write approval. Insert success is not audit write
          approval. Contract validation success is not downstream approval. No
          audit write, no audit append, no route call, no record creation, no
          persistence/write, no Supabase/localStorage write, no stats/PnL
          update, no trade mutation/reconciliation, no rollback/correction, no
          UI update, no notification execution, no broker/order action, no
          Avanza/browser action, automatic mode disabled.
        </p>
        <DetailGrid>
          <Detail
            label="Contract validation status"
            value={formatAgentCommandValue(
              auditAppendWriterContractValidationResult.status,
            )}
          />
          <Detail
            label="Decision"
            value={formatAgentCommandValue(
              auditAppendWriterContractValidationResult.decisionRecommendation,
            )}
          />
          <Detail
            label="Ready for design diagnostics only"
            value={yesNo(
              auditAppendWriterContractValidationResult.status ===
                "audit_append_writer_contract_validation_ready_for_design_only",
            )}
          />
          <Detail
            label="Design-only do not write audit"
            value={yesNo(
              auditAppendWriterContractValidationResult.decisionRecommendation ===
                "design_only_do_not_write_audit",
            )}
          />
          <Detail label="Dev preview only" value="Yes" />
          <Detail label="Contract validator diagnostics only" value="Yes" />
          <Detail label="Design/readiness only" value="Yes" />
          <Detail
            label="Contract validation is not audit write approval"
            value={yesNo(
              auditAppendWriterContractValidationResult
                .contractValidationIsAuditWriteApproval === false,
            )}
          />
          <Detail
            label="Contract validation is not security proof"
            value={yesNo(
              auditAppendWriterContractValidationResult
                .contractValidationIsSecurityProof === false,
            )}
          />
          <Detail
            label="Contract validation is not server-only proof"
            value={yesNo(
              auditAppendWriterContractValidationResult
                .contractValidationIsServerOnlyProof === false,
            )}
          />
          <Detail
            label="Contract validation is not schema/table proof"
            value={yesNo(
              auditAppendWriterContractValidationResult
                .contractValidationIsSchemaProof === false,
            )}
          />
          <Detail
            label="Contract validation is not generated-types proof"
            value={yesNo(
              auditAppendWriterContractValidationResult
                .contractValidationIsGeneratedTypesProof === false,
            )}
          />
          <Detail
            label="Contract validation is not migration proof"
            value={yesNo(
              auditAppendWriterContractValidationResult
                .contractValidationIsMigrationProof === false,
            )}
          />
          <Detail
            label="Contract validation is not RLS/security proof"
            value={yesNo(
              auditAppendWriterContractValidationResult
                .contractValidationIsRlsSecurityProof === false,
            )}
          />
          <Detail
            label="Checklist status is not proof"
            value={yesNo(
              auditAppendWriterContractValidationResult
                .checklistStatusIsSecurityProof === false,
            )}
          />
          <Detail
            label="Dev-preview diagnostics are not proof/write approval"
            value={yesNo(
              auditAppendWriterContractValidationResult
                .devPreviewDiagnosticsAreProof === false &&
                auditAppendWriterContractValidationResult
                  .devPreviewDiagnosticsAreAuditWriteApproval === false
            )}
          />
          <Detail
            label="Writer validator readiness is not write approval"
            value={yesNo(
              auditAppendWriterContractValidationResult
                .writerValidatorReadinessIsAuditWriteApproval === false,
            )}
          />
          <Detail
            label="Writer contract readiness is not write approval"
            value={yesNo(
              auditAppendWriterContractValidationResult
                .writerContractReadinessIsAuditWriteApproval === false,
            )}
          />
          <Detail
            label="Insert success is not audit write approval"
            value={yesNo(
              auditAppendWriterContractValidationResult
                .insertSuccessIsAuditWriteApproval === false,
            )}
          />
          <Detail
            label="Contract validation success is not downstream approval"
            value={yesNo(
              auditAppendWriterContractValidationResult
                .auditWriteSuccessIsDownstreamApproval === false &&
                auditAppendWriterContractValidationResult
                  .contractValidationSuccessApprovesStatsPnlUpdate === false &&
                auditAppendWriterContractValidationResult
                  .contractValidationSuccessApprovesTradeMutation === false
            )}
          />
          <Detail
            label="Audit write allowed"
            value={String(
              auditAppendWriterContractValidationResult.auditWriteAllowed,
            )}
          />
          <Detail
            label="Safe to write audit"
            value={String(
              auditAppendWriterContractValidationResult.safeToWriteAudit,
            )}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection
        title="Audit Append Writer Dry-Run Validator"
        tone="rose"
      >
        <p className="mt-2 text-sm leading-6 text-zinc-300">
          Dry-run validator diagnostics only. This dev preview calls the pure
          validateExecutionRecordAuditAppendWriterDryRun(...) fixture path for
          design/readiness only. Ready means design-only do not write audit.
          Dry-run validation is not dry-run execution. Dry-run validation is
          not audit write approval. Dry-run validation is not audit append
          execution. Dry-run validation is not route call approval. Dry-run
          validation is not record creation approval. Dry-run validation is not
          persistence/write approval. Dry-run validation is not
          Supabase/localStorage write approval. Dry-run validation is not
          security proof. Dry-run validation is not server-only proof. Dry-run
          validation is not schema/table proof. Dry-run validation is not
          generated-types proof. Dry-run validation is not migration proof.
          Dry-run validation is not RLS/security proof. Dry-run validation is
          not downstream approval. Dry-run result success is not write approval.
          Contract validator readiness is not write approval. Writer validator
          readiness is not write approval. Insert success is not audit write
          approval. Dev-preview diagnostics are not write approval. No dry-run
          execution, no audit write, no audit append, no route call, no record
          creation, no persistence/write, no Supabase/localStorage write, no
          stats/PnL update, no trade mutation/reconciliation, no
          rollback/correction, no UI update, no notification execution, no
          broker/order action, no Avanza/browser action, automatic mode
          disabled.
        </p>
        <DetailGrid>
          <Detail
            label="Dry-run validation status"
            value={formatAgentCommandValue(
              auditAppendWriterDryRunValidationResult.status,
            )}
          />
          <Detail
            label="Decision"
            value={formatAgentCommandValue(
              auditAppendWriterDryRunValidationResult.decisionRecommendation,
            )}
          />
          <Detail
            label="Design-only do not write audit"
            value={yesNo(
              auditAppendWriterDryRunValidationResult.decisionRecommendation ===
                "design_only_do_not_write_audit",
            )}
          />
          <Detail label="Dev preview only" value="Yes" />
          <Detail label="Dry-run validator diagnostics only" value="Yes" />
          <Detail label="Design/readiness only" value="Yes" />
          <Detail
            label="Dry-run validation is not dry-run execution"
            value={yesNo(
              auditAppendWriterDryRunValidationResult
                .validationIsDryRunExecution === false,
            )}
          />
          <Detail
            label="Dry-run validation is not audit write approval"
            value={yesNo(
              auditAppendWriterDryRunValidationResult
                .validationIsAuditWriteApproval === false,
            )}
          />
          <Detail
            label="Dry-run validation is not audit append execution"
            value={yesNo(
              auditAppendWriterDryRunValidationResult
                .validationIsAuditAppendExecution === false,
            )}
          />
          <Detail
            label="Dry-run validation is not route call approval"
            value={yesNo(
              auditAppendWriterDryRunValidationResult
                .validationIsRouteCallApproval === false,
            )}
          />
          <Detail
            label="Dry-run validation is not record creation approval"
            value={yesNo(
              auditAppendWriterDryRunValidationResult
                .validationIsRecordCreationApproval === false,
            )}
          />
          <Detail
            label="Dry-run validation is not persistence/write approval"
            value={yesNo(
              auditAppendWriterDryRunValidationResult
                .validationIsPersistenceWriteApproval === false,
            )}
          />
          <Detail
            label="Dry-run validation is not Supabase/localStorage write approval"
            value={yesNo(
              auditAppendWriterDryRunValidationResult
                .validationIsSupabaseLocalStorageWriteApproval === false,
            )}
          />
          <Detail
            label="Dry-run validation is not security proof"
            value={yesNo(
              auditAppendWriterDryRunValidationResult
                .validationIsSecurityProof === false,
            )}
          />
          <Detail
            label="Dry-run validation is not server-only proof"
            value={yesNo(
              auditAppendWriterDryRunValidationResult
                .validationIsServerOnlyProof === false,
            )}
          />
          <Detail
            label="Dry-run validation is not schema/table proof"
            value={yesNo(
              auditAppendWriterDryRunValidationResult.validationIsSchemaProof ===
                false,
            )}
          />
          <Detail
            label="Dry-run validation is not generated-types proof"
            value={yesNo(
              auditAppendWriterDryRunValidationResult
                .validationIsGeneratedTypesProof === false,
            )}
          />
          <Detail
            label="Dry-run validation is not migration proof"
            value={yesNo(
              auditAppendWriterDryRunValidationResult
                .validationIsMigrationProof === false,
            )}
          />
          <Detail
            label="Dry-run validation is not RLS/security proof"
            value={yesNo(
              auditAppendWriterDryRunValidationResult
                .validationIsRlsSecurityProof === false,
            )}
          />
          <Detail
            label="Dry-run validation is not downstream approval"
            value={yesNo(
              auditAppendWriterDryRunValidationResult
                .validationIsDownstreamApproval === false,
            )}
          />
          <Detail
            label="Dry-run result success is not write approval"
            value={yesNo(
              auditAppendWriterDryRunValidationResult
                .dryRunResultSuccessIsWriteApproval === false,
            )}
          />
          <Detail
            label="Contract validator readiness is not write approval"
            value={yesNo(
              auditAppendWriterDryRunValidationResult
                .contractValidatorReadinessIsWriteApproval === false,
            )}
          />
          <Detail
            label="Writer validator readiness is not write approval"
            value={yesNo(
              auditAppendWriterDryRunValidationResult
                .writerValidatorReadinessIsWriteApproval === false,
            )}
          />
          <Detail
            label="Insert success is not audit write approval"
            value={yesNo(
              auditAppendWriterDryRunValidationResult
                .insertSuccessIsAuditWriteApproval === false,
            )}
          />
          <Detail
            label="Dev-preview diagnostics are not write approval"
            value={yesNo(
              auditAppendWriterDryRunValidationResult
                .devPreviewDiagnosticsAreWriteApproval === false,
            )}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection
        title="Audit append writer dry-run validator summaries"
        tone="sky"
      >
        <DetailGrid>
          <Detail
            label="Dry-run input present"
            value={yesNo(
              auditAppendWriterDryRunValidationResult.inputValidation
                .dryRunResultInputPresent,
            )}
          />
          <Detail
            label="Dry-run output present"
            value={yesNo(
              auditAppendWriterDryRunValidationResult.resultValidation
                .dryRunResultOutputPresent,
            )}
          />
          <Detail
            label="Would-write summary present"
            value={yesNo(
              auditAppendWriterDryRunValidationResult
                .wouldWriteAuditEventValidation.wouldWriteSummaryPresent,
            )}
          />
          <Detail
            label="Would attempt audit write"
            value={yesNo(
              auditAppendWriterDryRunValidationResult
                .wouldWriteAuditEventValidation.wouldAttemptAuditWrite,
            )}
          />
          <Detail
            label="Schema/table status known"
            value={yesNo(
              auditAppendWriterDryRunValidationResult
                .tableSchemaSimulationValidation.schemaTableStatusKnown,
            )}
          />
          <Detail
            label="Generated audit types status known"
            value={yesNo(
              auditAppendWriterDryRunValidationResult
                .tableSchemaSimulationValidation
                .generatedAuditTypesStatusKnown,
            )}
          />
          <Detail
            label="Idempotency key present"
            value={yesNo(
              auditAppendWriterDryRunValidationResult
                .idempotencyDuplicatePreventionValidation
                .idempotencyKeyPresent,
            )}
          />
          <Detail
            label="Duplicate prevention key present"
            value={yesNo(
              auditAppendWriterDryRunValidationResult
                .idempotencyDuplicatePreventionValidation
                .duplicatePreventionKeyPresent,
            )}
          />
          <Detail
            label="Evidence/provenance present"
            value={yesNo(
              auditAppendWriterDryRunValidationResult
                .evidenceProvenanceValidation.evidenceProvenancePresent,
            )}
          />
          <Detail
            label="Server-only status known"
            value={yesNo(
              auditAppendWriterDryRunValidationResult
                .serverOnlySecurityDependencyValidation
                .serverOnlySecurityStatusKnown,
            )}
          />
          <Detail
            label="No-write/no-action safety"
            value={yesNo(
              auditAppendWriterDryRunValidationResult
                .noWriteNoActionSafetyValidation.auditWriteAllowed === false &&
                auditAppendWriterDryRunValidationResult
                  .noWriteNoActionSafetyValidation.routeCallAllowed === false &&
                auditAppendWriterDryRunValidationResult
                  .noWriteNoActionSafetyValidation.persistenceWriteAllowed ===
                  false,
            )}
          />
          <Detail
            label="Dry-run implemented"
            value={String(
              auditAppendWriterDryRunValidationResult.dependencyValidation
                .dryRunImplemented,
            )}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection
        title="Audit append writer dry-run validator authority flags"
        tone="rose"
      >
        <DetailGrid>
          <Detail
            label="dryRunValidatorImplemented"
            value={String(
              auditAppendWriterDryRunValidationResult.authority
                .dryRunValidatorImplemented,
            )}
          />
          <Detail
            label="dryRunExecutionAllowed"
            value={String(
              auditAppendWriterDryRunValidationResult.authority
                .dryRunExecutionAllowed,
            )}
          />
          <Detail
            label="dryRunImplemented"
            value={String(
              auditAppendWriterDryRunValidationResult.authority
                .dryRunImplemented,
            )}
          />
          <Detail
            label="writerImplemented"
            value={String(
              auditAppendWriterDryRunValidationResult.authority
                .writerImplemented,
            )}
          />
          <Detail
            label="auditAppendImplemented"
            value={String(
              auditAppendWriterDryRunValidationResult.authority
                .auditAppendImplemented,
            )}
          />
          <Detail
            label="auditRouteImplemented"
            value={String(
              auditAppendWriterDryRunValidationResult.authority
                .auditRouteImplemented,
            )}
          />
          <Detail
            label="auditWriteAllowed"
            value={String(
              auditAppendWriterDryRunValidationResult.authority
                .auditWriteAllowed,
            )}
          />
          <Detail
            label="safeToWriteAudit"
            value={String(
              auditAppendWriterDryRunValidationResult.authority
                .safeToWriteAudit,
            )}
          />
          <Detail
            label="auditAppendAllowed"
            value={String(
              auditAppendWriterDryRunValidationResult.authority
                .auditAppendAllowed,
            )}
          />
          <Detail
            label="safeToAppendAudit"
            value={String(
              auditAppendWriterDryRunValidationResult.authority
                .safeToAppendAudit,
            )}
          />
          <Detail
            label="routeCallAllowed"
            value={String(
              auditAppendWriterDryRunValidationResult.authority
                .routeCallAllowed,
            )}
          />
          <Detail
            label="recordCreationAllowed"
            value={String(
              auditAppendWriterDryRunValidationResult.authority
                .recordCreationAllowed,
            )}
          />
          <Detail
            label="persistenceWriteAllowed"
            value={String(
              auditAppendWriterDryRunValidationResult.authority
                .persistenceWriteAllowed,
            )}
          />
          <Detail
            label="supabaseWriteAllowed"
            value={String(
              auditAppendWriterDryRunValidationResult.authority
                .supabaseWriteAllowed,
            )}
          />
          <Detail
            label="localStorageWriteAllowed"
            value={String(
              auditAppendWriterDryRunValidationResult.authority
                .localStorageWriteAllowed,
            )}
          />
          <Detail
            label="statsPnlUpdateAllowed"
            value={String(
              auditAppendWriterDryRunValidationResult.authority
                .statsPnlUpdateAllowed,
            )}
          />
          <Detail
            label="tradeMutationAllowed"
            value={String(
              auditAppendWriterDryRunValidationResult.authority
                .tradeMutationAllowed,
            )}
          />
          <Detail
            label="tradeReconciliationAllowed"
            value={String(
              auditAppendWriterDryRunValidationResult.authority
                .tradeReconciliationAllowed,
            )}
          />
          <Detail
            label="correctionRollbackAllowed"
            value={String(
              auditAppendWriterDryRunValidationResult.authority
                .correctionRollbackAllowed,
            )}
          />
          <Detail
            label="uiStateMutationAllowed"
            value={String(
              auditAppendWriterDryRunValidationResult.authority
                .uiStateMutationAllowed,
            )}
          />
          <Detail
            label="userNotificationAllowed"
            value={String(
              auditAppendWriterDryRunValidationResult.authority
                .userNotificationAllowed,
            )}
          />
          <Detail
            label="brokerOrderFollowUpAllowed"
            value={String(
              auditAppendWriterDryRunValidationResult.authority
                .brokerOrderFollowUpAllowed,
            )}
          />
          <Detail
            label="avanzaBrowserFollowUpAllowed"
            value={String(
              auditAppendWriterDryRunValidationResult.authority
                .avanzaBrowserFollowUpAllowed,
            )}
          />
          <Detail
            label="automaticModeAllowed"
            value={String(
              auditAppendWriterDryRunValidationResult.authority
                .automaticModeAllowed,
            )}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection
        title="Audit Append Writer Dry-Run Execution Validator"
        tone="rose"
      >
        <p className="mt-2 text-sm leading-6 text-zinc-300">
          Dev preview only. Dry-run execution validator diagnostics only.
          Design/readiness only. Ready means design-only do not write audit.
          This validation is not dry-run execution, audit write approval, audit
          append execution, route approval, record creation, persistence,
          Supabase/localStorage write approval, security proof, server-only
          proof, schema/table proof, generated-types proof, migration proof,
          RLS/security proof, downstream approval, or workflow completion. No
          dry-run execution, no audit write, no audit append, no route call, no
          record creation, no persistence/write, no Supabase/localStorage write,
          no stats/PnL update, no trade mutation/reconciliation, no
          rollback/correction, no UI update, no notification execution, no
          broker/order action, no Avanza/browser action, automatic mode
          disabled.
        </p>
        <DetailGrid>
          <Detail
            label="Dry-run execution validation status"
            value={formatAgentCommandValue(
              auditAppendWriterDryRunExecutionValidationResult.status,
            )}
          />
          <Detail
            label="Decision"
            value={formatAgentCommandValue(
              auditAppendWriterDryRunExecutionValidationResult.decisionRecommendation,
            )}
          />
          <Detail
            label="Design-only do not write audit"
            value={yesNo(
              auditAppendWriterDryRunExecutionValidationResult.decisionRecommendation ===
                "design_only_do_not_write_audit",
            )}
          />
          <Detail label="Dev preview only" value="Yes" />
          <Detail
            label="Dry-run execution validator diagnostics only"
            value="Yes"
          />
          <Detail label="Design/readiness only" value="Yes" />
          <Detail
            label="Validation is not dry-run execution"
            value={yesNo(
              auditAppendWriterDryRunExecutionValidationResult
                .validationIsDryRunExecution === false,
            )}
          />
          <Detail
            label="Validation is not audit write approval"
            value={yesNo(
              auditAppendWriterDryRunExecutionValidationResult
                .validationIsAuditWriteApproval === false,
            )}
          />
          <Detail
            label="Validation is not audit append execution"
            value={yesNo(
              auditAppendWriterDryRunExecutionValidationResult
                .validationIsAuditAppendExecution === false,
            )}
          />
          <Detail
            label="Validation is not route call approval"
            value={yesNo(
              auditAppendWriterDryRunExecutionValidationResult
                .validationIsRouteCallApproval === false,
            )}
          />
          <Detail
            label="Validation is not record creation approval"
            value={yesNo(
              auditAppendWriterDryRunExecutionValidationResult
                .validationIsRecordCreationApproval === false,
            )}
          />
          <Detail
            label="Validation is not persistence/write approval"
            value={yesNo(
              auditAppendWriterDryRunExecutionValidationResult
                .validationIsPersistenceWriteApproval === false,
            )}
          />
          <Detail
            label="Validation is not Supabase/localStorage write approval"
            value={yesNo(
              auditAppendWriterDryRunExecutionValidationResult
                .validationIsSupabaseLocalStorageWriteApproval === false,
            )}
          />
          <Detail
            label="Validation is not security proof"
            value={yesNo(
              auditAppendWriterDryRunExecutionValidationResult
                .validationIsSecurityProof === false,
            )}
          />
          <Detail
            label="Validation is not server-only proof"
            value={yesNo(
              auditAppendWriterDryRunExecutionValidationResult
                .validationIsServerOnlyProof === false,
            )}
          />
          <Detail
            label="Validation is not schema/table proof"
            value={yesNo(
              auditAppendWriterDryRunExecutionValidationResult
                .validationIsSchemaProof === false,
            )}
          />
          <Detail
            label="Validation is not generated-types proof"
            value={yesNo(
              auditAppendWriterDryRunExecutionValidationResult
                .validationIsGeneratedTypesProof === false,
            )}
          />
          <Detail
            label="Validation is not migration proof"
            value={yesNo(
              auditAppendWriterDryRunExecutionValidationResult
                .validationIsMigrationProof === false,
            )}
          />
          <Detail
            label="Validation is not RLS/security proof"
            value={yesNo(
              auditAppendWriterDryRunExecutionValidationResult
                .validationIsRlsSecurityProof === false,
            )}
          />
          <Detail
            label="Validation is not downstream approval"
            value={yesNo(
              auditAppendWriterDryRunExecutionValidationResult
                .validationIsDownstreamApproval === false,
            )}
          />
          <Detail
            label="Dry-run execution success is not write approval"
            value={yesNo(
              auditAppendWriterDryRunExecutionValidationResult
                .dryRunExecutionSuccessIsWriteApproval === false,
            )}
          />
          <Detail
            label="Dry-run validator readiness is not execution"
            value={yesNo(
              auditAppendWriterDryRunExecutionValidationResult
                .dryRunValidatorReadinessIsExecution === false,
            )}
          />
          <Detail
            label="Dev-preview diagnostics are not write approval"
            value={yesNo(
              auditAppendWriterDryRunExecutionValidationResult
                .devPreviewDiagnosticsAreWriteApproval === false,
            )}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection
        title="Audit append writer dry-run execution validator summaries"
        tone="sky"
      >
        <DetailGrid>
          <Detail
            label="Execution input present"
            value={yesNo(
              auditAppendWriterDryRunExecutionValidationResult.inputValidation
                .dryRunExecutionInputPresent,
            )}
          />
          <Detail
            label="Execution result present"
            value={yesNo(
              auditAppendWriterDryRunExecutionValidationResult.resultValidation
                .dryRunExecutionResultPresent,
            )}
          />
          <Detail
            label="Simulated audit event present"
            value={yesNo(
              auditAppendWriterDryRunExecutionValidationResult
                .simulatedAuditEventValidation
                .simulatedAuditEventPayloadPresent,
            )}
          />
          <Detail
            label="Would attempt audit write"
            value={yesNo(
              auditAppendWriterDryRunExecutionValidationResult
                .simulatedAuditEventValidation.wouldAttemptAuditWrite,
            )}
          />
          <Detail
            label="Audit write executed"
            value={yesNo(
              auditAppendWriterDryRunExecutionValidationResult
                .simulatedAuditEventValidation.auditWriteExecuted,
            )}
          />
          <Detail
            label="Schema/table status known"
            value={yesNo(
              auditAppendWriterDryRunExecutionValidationResult
                .simulatedTableSchemaValidation.schemaTableStatusKnown,
            )}
          />
          <Detail
            label="Generated audit types status known"
            value={yesNo(
              auditAppendWriterDryRunExecutionValidationResult
                .simulatedTableSchemaValidation.generatedAuditTypesStatusKnown,
            )}
          />
          <Detail
            label="Idempotency key present"
            value={yesNo(
              auditAppendWriterDryRunExecutionValidationResult
                .simulatedIdempotencyDuplicatePreventionValidation
                .idempotencyKeyPresent,
            )}
          />
          <Detail
            label="Duplicate prevention key present"
            value={yesNo(
              auditAppendWriterDryRunExecutionValidationResult
                .simulatedIdempotencyDuplicatePreventionValidation
                .duplicatePreventionKeyPresent,
            )}
          />
          <Detail
            label="Evidence/provenance present"
            value={yesNo(
              auditAppendWriterDryRunExecutionValidationResult
                .evidenceProvenanceValidation.evidenceProvenancePresent,
            )}
          />
          <Detail
            label="Server-only status known"
            value={yesNo(
              auditAppendWriterDryRunExecutionValidationResult
                .serverOnlySecurityDependencyValidation
                .serverOnlySecurityStatusKnown,
            )}
          />
          <Detail
            label="No-write/no-action safety"
            value={yesNo(
              auditAppendWriterDryRunExecutionValidationResult
                .noWriteNoActionSafetyValidation.dryRunExecuted === false &&
                auditAppendWriterDryRunExecutionValidationResult
                  .noWriteNoActionSafetyValidation.auditWriteExecuted ===
                  false &&
                auditAppendWriterDryRunExecutionValidationResult
                  .noWriteNoActionSafetyValidation.routeCallAllowed === false &&
                auditAppendWriterDryRunExecutionValidationResult
                  .noWriteNoActionSafetyValidation.persistenceWriteAllowed ===
                  false,
            )}
          />
          <Detail
            label="Dry-run execution contract present"
            value={yesNo(
              auditAppendWriterDryRunExecutionValidationResult
                .dependencyValidation.dryRunExecutionContractPresent,
            )}
          />
          <Detail
            label="Dry-run execution implemented"
            value={String(
              auditAppendWriterDryRunExecutionValidationResult
                .dependencyValidation.dryRunExecutionImplemented,
            )}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection
        title="Audit append writer dry-run execution validator authority flags"
        tone="rose"
      >
        <DetailGrid>
          <Detail
            label="dryRunExecutionValidatorImplemented"
            value={String(
              auditAppendWriterDryRunExecutionValidationResult.authority
                .dryRunExecutionValidatorImplemented,
            )}
          />
          <Detail
            label="dryRunExecutionAllowed"
            value={String(
              auditAppendWriterDryRunExecutionValidationResult.authority
                .dryRunExecutionAllowed,
            )}
          />
          <Detail
            label="dryRunExecutedAgainstRealData"
            value={String(
              auditAppendWriterDryRunExecutionValidationResult.authority
                .dryRunExecutedAgainstRealData,
            )}
          />
          <Detail
            label="dryRunExecutionImplemented"
            value={String(
              auditAppendWriterDryRunExecutionValidationResult.authority
                .dryRunExecutionImplemented,
            )}
          />
          <Detail
            label="dryRunImplemented"
            value={String(
              auditAppendWriterDryRunExecutionValidationResult.authority
                .dryRunImplemented,
            )}
          />
          <Detail
            label="writerImplemented"
            value={String(
              auditAppendWriterDryRunExecutionValidationResult.authority
                .writerImplemented,
            )}
          />
          <Detail
            label="auditAppendImplemented"
            value={String(
              auditAppendWriterDryRunExecutionValidationResult.authority
                .auditAppendImplemented,
            )}
          />
          <Detail
            label="auditRouteImplemented"
            value={String(
              auditAppendWriterDryRunExecutionValidationResult.authority
                .auditRouteImplemented,
            )}
          />
          <Detail
            label="auditWriteAllowed"
            value={String(
              auditAppendWriterDryRunExecutionValidationResult.authority
                .auditWriteAllowed,
            )}
          />
          <Detail
            label="safeToWriteAudit"
            value={String(
              auditAppendWriterDryRunExecutionValidationResult.authority
                .safeToWriteAudit,
            )}
          />
          <Detail
            label="auditAppendAllowed"
            value={String(
              auditAppendWriterDryRunExecutionValidationResult.authority
                .auditAppendAllowed,
            )}
          />
          <Detail
            label="safeToAppendAudit"
            value={String(
              auditAppendWriterDryRunExecutionValidationResult.authority
                .safeToAppendAudit,
            )}
          />
          <Detail
            label="routeCallAllowed"
            value={String(
              auditAppendWriterDryRunExecutionValidationResult.authority
                .routeCallAllowed,
            )}
          />
          <Detail
            label="recordCreationAllowed"
            value={String(
              auditAppendWriterDryRunExecutionValidationResult.authority
                .recordCreationAllowed,
            )}
          />
          <Detail
            label="persistenceWriteAllowed"
            value={String(
              auditAppendWriterDryRunExecutionValidationResult.authority
                .persistenceWriteAllowed,
            )}
          />
          <Detail
            label="supabaseWriteAllowed"
            value={String(
              auditAppendWriterDryRunExecutionValidationResult.authority
                .supabaseWriteAllowed,
            )}
          />
          <Detail
            label="localStorageWriteAllowed"
            value={String(
              auditAppendWriterDryRunExecutionValidationResult.authority
                .localStorageWriteAllowed,
            )}
          />
          <Detail
            label="statsPnlUpdateAllowed"
            value={String(
              auditAppendWriterDryRunExecutionValidationResult.authority
                .statsPnlUpdateAllowed,
            )}
          />
          <Detail
            label="tradeMutationAllowed"
            value={String(
              auditAppendWriterDryRunExecutionValidationResult.authority
                .tradeMutationAllowed,
            )}
          />
          <Detail
            label="tradeReconciliationAllowed"
            value={String(
              auditAppendWriterDryRunExecutionValidationResult.authority
                .tradeReconciliationAllowed,
            )}
          />
          <Detail
            label="correctionRollbackAllowed"
            value={String(
              auditAppendWriterDryRunExecutionValidationResult.authority
                .correctionRollbackAllowed,
            )}
          />
          <Detail
            label="uiStateMutationAllowed"
            value={String(
              auditAppendWriterDryRunExecutionValidationResult.authority
                .uiStateMutationAllowed,
            )}
          />
          <Detail
            label="userNotificationAllowed"
            value={String(
              auditAppendWriterDryRunExecutionValidationResult.authority
                .userNotificationAllowed,
            )}
          />
          <Detail
            label="brokerOrderFollowUpAllowed"
            value={String(
              auditAppendWriterDryRunExecutionValidationResult.authority
                .brokerOrderFollowUpAllowed,
            )}
          />
          <Detail
            label="avanzaBrowserFollowUpAllowed"
            value={String(
              auditAppendWriterDryRunExecutionValidationResult.authority
                .avanzaBrowserFollowUpAllowed,
            )}
          />
          <Detail
            label="automaticModeAllowed"
            value={String(
              auditAppendWriterDryRunExecutionValidationResult.authority
                .automaticModeAllowed,
            )}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Audit Append Writer Dry-Run Execution" tone="rose">
        <p className="mt-2 text-sm leading-6 text-zinc-300">
          Dev preview only. Dry-run execution diagnostics only. Non-persistent
          would-write simulation only. Design/readiness only. Design-only do
          not write audit. Dry-run execution result is not real write, audit
          write approval, audit append execution, route call approval, record
          creation approval, persistence/write approval, Supabase/localStorage
          write approval, security proof, server-only proof, schema/table proof,
          generated-types proof, migration proof, RLS/security proof,
          downstream approval, or workflow completion. No real dry-run against
          production data, no audit write, no audit append, no route call, no
          record creation, no persistence/write, no Supabase/localStorage write,
          no stats/PnL update, no trade mutation/reconciliation, no
          rollback/correction, no UI update, no notification execution, no
          broker/order action, no Avanza/browser action, automatic mode
          disabled.
        </p>
        <DetailGrid>
          <Detail
            label="Dry-run execution implementation status"
            value={formatAgentCommandValue(
              auditAppendWriterDryRunExecutionImplementationResult.status,
            )}
          />
          <Detail
            label="Decision"
            value={formatAgentCommandValue(
              auditAppendWriterDryRunExecutionImplementationResult.decisionRecommendation,
            )}
          />
          <Detail
            label="Design-only do not write audit"
            value={yesNo(
              auditAppendWriterDryRunExecutionImplementationResult.decisionRecommendation ===
                "design_only_do_not_write_audit",
            )}
          />
          <Detail label="Dev preview only" value="Yes" />
          <Detail
            label="Dry-run execution diagnostics only"
            value="Yes"
          />
          <Detail
            label="Non-persistent would-write simulation only"
            value={yesNo(
              auditAppendWriterDryRunExecutionImplementationResult
                .nonPersistent,
            )}
          />
          <Detail label="Design/readiness only" value="Yes" />
          <Detail
            label="Result is not real write"
            value={yesNo(
              auditAppendWriterDryRunExecutionImplementationResult
                .auditWriteExecuted === false,
            )}
          />
          <Detail
            label="Result is not audit write approval"
            value={yesNo(
              auditAppendWriterDryRunExecutionImplementationResult
                .implementationResultIsAuditWriteApproval === false,
            )}
          />
          <Detail
            label="Result is not audit append execution"
            value={yesNo(
              auditAppendWriterDryRunExecutionImplementationResult
                .implementationResultIsAuditAppendExecution === false,
            )}
          />
          <Detail
            label="Result is not route call approval"
            value={yesNo(
              auditAppendWriterDryRunExecutionImplementationResult
                .implementationResultIsRouteCallApproval === false,
            )}
          />
          <Detail
            label="Result is not record creation approval"
            value={yesNo(
              auditAppendWriterDryRunExecutionImplementationResult
                .implementationResultIsRecordCreationApproval === false,
            )}
          />
          <Detail
            label="Result is not persistence/write approval"
            value={yesNo(
              auditAppendWriterDryRunExecutionImplementationResult
                .implementationResultIsPersistenceWriteApproval === false,
            )}
          />
          <Detail
            label="Result is not Supabase/localStorage write approval"
            value={yesNo(
              auditAppendWriterDryRunExecutionImplementationResult
                .implementationResultIsSupabaseLocalStorageWriteApproval ===
                false,
            )}
          />
          <Detail
            label="Result is not security proof"
            value={yesNo(
              auditAppendWriterDryRunExecutionImplementationResult
                .implementationResultIsSecurityProof === false,
            )}
          />
          <Detail
            label="Result is not server-only proof"
            value={yesNo(
              auditAppendWriterDryRunExecutionImplementationResult
                .implementationResultIsServerOnlyProof === false,
            )}
          />
          <Detail
            label="Result is not schema/table proof"
            value={yesNo(
              auditAppendWriterDryRunExecutionImplementationResult
                .implementationResultIsSchemaProof === false,
            )}
          />
          <Detail
            label="Result is not generated-types proof"
            value={yesNo(
              auditAppendWriterDryRunExecutionImplementationResult
                .implementationResultIsGeneratedTypesProof === false,
            )}
          />
          <Detail
            label="Result is not migration proof"
            value={yesNo(
              auditAppendWriterDryRunExecutionImplementationResult
                .implementationResultIsMigrationProof === false,
            )}
          />
          <Detail
            label="Result is not RLS/security proof"
            value={yesNo(
              auditAppendWriterDryRunExecutionImplementationResult
                .implementationResultIsRlsSecurityProof === false,
            )}
          />
          <Detail
            label="Result is not downstream approval"
            value={yesNo(
              auditAppendWriterDryRunExecutionImplementationResult
                .implementationResultIsDownstreamApproval === false,
            )}
          />
          <Detail label="No real dry-run against production data" value="Yes" />
          <Detail label="No audit write" value="Yes" />
          <Detail label="No audit append" value="Yes" />
          <Detail label="No route call" value="Yes" />
          <Detail label="No record creation" value="Yes" />
          <Detail label="No persistence/write" value="Yes" />
          <Detail label="No Supabase/localStorage write" value="Yes" />
          <Detail label="No stats/PnL update" value="Yes" />
          <Detail label="No trade mutation/reconciliation" value="Yes" />
          <Detail label="No rollback/correction" value="Yes" />
          <Detail label="No UI update" value="Yes" />
          <Detail label="No notification execution" value="Yes" />
          <Detail label="No broker/order action" value="Yes" />
          <Detail label="No Avanza/browser action" value="Yes" />
          <Detail label="Automatic mode disabled" value="Yes" />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection
        title="Audit append writer dry-run execution summaries"
        tone="sky"
      >
        <DetailGrid>
          <Detail
            label="Simulated audit event present"
            value={yesNo(
              auditAppendWriterDryRunExecutionImplementationResult
                .simulatedAuditEventPayload.simulatedPayloadPresent,
            )}
          />
          <Detail
            label="Audit event type"
            value={formatAgentCommandValue(
              auditAppendWriterDryRunExecutionImplementationResult
                .simulatedAuditEventPayload.auditEventType ?? "missing",
            )}
          />
          <Detail
            label="Would attempt audit write"
            value={yesNo(
              auditAppendWriterDryRunExecutionImplementationResult
                .simulatedAuditEventPayload.wouldAttemptAuditWrite,
            )}
          />
          <Detail
            label="Audit write executed"
            value={yesNo(
              auditAppendWriterDryRunExecutionImplementationResult
                .simulatedAuditEventPayload.auditWriteExecuted,
            )}
          />
          <Detail
            label="Target table"
            value={formatAgentCommandValue(
              auditAppendWriterDryRunExecutionImplementationResult
                .simulatedTableSchemaTarget.targetTable ?? "missing",
            )}
          />
          <Detail
            label="Target schema"
            value={formatAgentCommandValue(
              auditAppendWriterDryRunExecutionImplementationResult
                .simulatedTableSchemaTarget.targetSchema ?? "missing",
            )}
          />
          <Detail
            label="Schema/table status known"
            value={yesNo(
              auditAppendWriterDryRunExecutionImplementationResult
                .simulatedTableSchemaTarget.schemaTableStatusKnown,
            )}
          />
          <Detail
            label="Generated execution-record types assumed enough"
            value={String(
              auditAppendWriterDryRunExecutionImplementationResult
                .simulatedTableSchemaTarget
                .generatedExecutionRecordTypesAssumedEnough,
            )}
          />
          <Detail
            label="Idempotency key present"
            value={yesNo(
              auditAppendWriterDryRunExecutionImplementationResult
                .simulatedIdempotency.idempotencyKeyPresent,
            )}
          />
          <Detail
            label="Idempotent write executed"
            value={yesNo(
              auditAppendWriterDryRunExecutionImplementationResult
                .simulatedIdempotency.idempotentWriteExecuted,
            )}
          />
          <Detail
            label="Duplicate prevention key present"
            value={yesNo(
              auditAppendWriterDryRunExecutionImplementationResult
                .simulatedDuplicatePrevention.duplicatePreventionKeyPresent,
            )}
          />
          <Detail
            label="Duplicate write executed"
            value={yesNo(
              auditAppendWriterDryRunExecutionImplementationResult
                .simulatedDuplicatePrevention.duplicateWriteExecuted,
            )}
          />
          <Detail
            label="Evidence/provenance present"
            value={yesNo(
              auditAppendWriterDryRunExecutionImplementationResult
                .evidenceProvenance.evidenceProvenancePresent,
            )}
          />
          <Detail
            label="Provenance trace complete"
            value={yesNo(
              auditAppendWriterDryRunExecutionImplementationResult
                .evidenceProvenance.provenanceTraceComplete,
            )}
          />
          <Detail
            label="Server-only status known"
            value={yesNo(
              auditAppendWriterDryRunExecutionImplementationResult
                .serverOnlySecurity.serverOnlySecurityStatusKnown,
            )}
          />
          <Detail
            label="Client-side write risk"
            value={yesNo(
              auditAppendWriterDryRunExecutionImplementationResult
                .serverOnlySecurity.clientSideWriteRisk,
            )}
          />
          <Detail
            label="No-write/no-action safety"
            value={yesNo(
              auditAppendWriterDryRunExecutionImplementationResult
                .noWriteNoAction.auditWriteExecuted === false &&
                auditAppendWriterDryRunExecutionImplementationResult
                  .noWriteNoAction.routeCallAllowed === false &&
                auditAppendWriterDryRunExecutionImplementationResult
                  .noWriteNoAction.persistenceWriteAllowed === false,
            )}
          />
          <Detail
            label="Dry-run execution implementation implemented"
            value={String(
              auditAppendWriterDryRunExecutionImplementationResult.dependencies
                .dryRunExecutionImplementationImplemented,
            )}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection
        title="Audit append writer dry-run execution authority flags"
        tone="rose"
      >
        <DetailGrid>
          <Detail
            label="dryRunExecutionImplementationImplemented"
            value={String(
              auditAppendWriterDryRunExecutionImplementationResult.authority
                .dryRunExecutionImplementationImplemented,
            )}
          />
          <Detail
            label="dryRunExecutionAllowed"
            value={String(
              auditAppendWriterDryRunExecutionImplementationResult.authority
                .dryRunExecutionAllowed,
            )}
          />
          <Detail
            label="dryRunExecutedAgainstRealData"
            value={String(
              auditAppendWriterDryRunExecutionImplementationResult.authority
                .dryRunExecutedAgainstRealData,
            )}
          />
          <Detail
            label="dryRunImplemented"
            value={String(
              auditAppendWriterDryRunExecutionImplementationResult.authority
                .dryRunImplemented,
            )}
          />
          <Detail
            label="writerImplemented"
            value={String(
              auditAppendWriterDryRunExecutionImplementationResult.authority
                .writerImplemented,
            )}
          />
          <Detail
            label="auditAppendImplemented"
            value={String(
              auditAppendWriterDryRunExecutionImplementationResult.authority
                .auditAppendImplemented,
            )}
          />
          <Detail
            label="auditRouteImplemented"
            value={String(
              auditAppendWriterDryRunExecutionImplementationResult.authority
                .auditRouteImplemented,
            )}
          />
          <Detail
            label="auditWriteAllowed"
            value={String(
              auditAppendWriterDryRunExecutionImplementationResult.authority
                .auditWriteAllowed,
            )}
          />
          <Detail
            label="safeToWriteAudit"
            value={String(
              auditAppendWriterDryRunExecutionImplementationResult.authority
                .safeToWriteAudit,
            )}
          />
          <Detail
            label="auditAppendAllowed"
            value={String(
              auditAppendWriterDryRunExecutionImplementationResult.authority
                .auditAppendAllowed,
            )}
          />
          <Detail
            label="safeToAppendAudit"
            value={String(
              auditAppendWriterDryRunExecutionImplementationResult.authority
                .safeToAppendAudit,
            )}
          />
          <Detail
            label="routeCallAllowed"
            value={String(
              auditAppendWriterDryRunExecutionImplementationResult.authority
                .routeCallAllowed,
            )}
          />
          <Detail
            label="recordCreationAllowed"
            value={String(
              auditAppendWriterDryRunExecutionImplementationResult.authority
                .recordCreationAllowed,
            )}
          />
          <Detail
            label="persistenceWriteAllowed"
            value={String(
              auditAppendWriterDryRunExecutionImplementationResult.authority
                .persistenceWriteAllowed,
            )}
          />
          <Detail
            label="supabaseWriteAllowed"
            value={String(
              auditAppendWriterDryRunExecutionImplementationResult.authority
                .supabaseWriteAllowed,
            )}
          />
          <Detail
            label="localStorageWriteAllowed"
            value={String(
              auditAppendWriterDryRunExecutionImplementationResult.authority
                .localStorageWriteAllowed,
            )}
          />
          <Detail
            label="statsPnlUpdateAllowed"
            value={String(
              auditAppendWriterDryRunExecutionImplementationResult.authority
                .statsPnlUpdateAllowed,
            )}
          />
          <Detail
            label="tradeMutationAllowed"
            value={String(
              auditAppendWriterDryRunExecutionImplementationResult.authority
                .tradeMutationAllowed,
            )}
          />
          <Detail
            label="tradeReconciliationAllowed"
            value={String(
              auditAppendWriterDryRunExecutionImplementationResult.authority
                .tradeReconciliationAllowed,
            )}
          />
          <Detail
            label="correctionRollbackAllowed"
            value={String(
              auditAppendWriterDryRunExecutionImplementationResult.authority
                .correctionRollbackAllowed,
            )}
          />
          <Detail
            label="uiStateMutationAllowed"
            value={String(
              auditAppendWriterDryRunExecutionImplementationResult.authority
                .uiStateMutationAllowed,
            )}
          />
          <Detail
            label="userNotificationAllowed"
            value={String(
              auditAppendWriterDryRunExecutionImplementationResult.authority
                .userNotificationAllowed,
            )}
          />
          <Detail
            label="brokerOrderFollowUpAllowed"
            value={String(
              auditAppendWriterDryRunExecutionImplementationResult.authority
                .brokerOrderFollowUpAllowed,
            )}
          />
          <Detail
            label="avanzaBrowserFollowUpAllowed"
            value={String(
              auditAppendWriterDryRunExecutionImplementationResult.authority
                .avanzaBrowserFollowUpAllowed,
            )}
          />
          <Detail
            label="automaticModeAllowed"
            value={String(
              auditAppendWriterDryRunExecutionImplementationResult.authority
                .automaticModeAllowed,
            )}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection
        title="Audit append writer contract validation summaries"
        tone="sky"
      >
        <DetailGrid>
          <Detail
            label="Writer contract input present"
            value={yesNo(
              auditAppendWriterContractValidationResult.inputShape
                .writerContractInputPresent,
            )}
          />
          <Detail
            label="Writer contract result present"
            value={yesNo(
              auditAppendWriterContractValidationResult.resultShape
                .writerContractResultPresent,
            )}
          />
          <Detail
            label="Writer validator result present"
            value={yesNo(
              auditAppendWriterContractValidationResult.dependencies
                .writerValidatorResultPresent,
            )}
          />
          <Detail
            label="Execution record reference present"
            value={yesNo(
              auditAppendWriterContractValidationResult.inputShape
                .executionRecordReferencePresent,
            )}
          />
          <Detail
            label="Audit event candidate present"
            value={yesNo(
              auditAppendWriterContractValidationResult.inputShape
                .auditEventCandidatePresent,
            )}
          />
          <Detail
            label="Evidence provenance present"
            value={yesNo(
              auditAppendWriterContractValidationResult.evidenceProvenance
                .evidenceProvenancePresent,
            )}
          />
          <Detail
            label="Idempotency key present"
            value={yesNo(
              auditAppendWriterContractValidationResult
                .idempotencyDuplicatePrevention.idempotencyKeyPresent,
            )}
          />
          <Detail
            label="Duplicate prevention key present"
            value={yesNo(
              auditAppendWriterContractValidationResult
                .idempotencyDuplicatePrevention
                .duplicatePreventionKeyPresent,
            )}
          />
          <Detail
            label="Server-only proof present"
            value={yesNo(
              auditAppendWriterContractValidationResult.serverOnlySecurity
                .serverOnlyProofPresent,
            )}
          />
          <Detail
            label="Service-role proof present"
            value={yesNo(
              auditAppendWriterContractValidationResult.serverOnlySecurity
                .serviceRoleProofPresent,
            )}
          />
          <Detail
            label="Audit schema/table proof present"
            value={yesNo(
              auditAppendWriterContractValidationResult.schemaType
                .auditSchemaTableProofPresent,
            )}
          />
          <Detail
            label="Generated audit types present"
            value={yesNo(
              auditAppendWriterContractValidationResult.schemaType
                .generatedAuditTypesPresent,
            )}
          />
          <Detail
            label="Migration proof present"
            value={yesNo(
              auditAppendWriterContractValidationResult.schemaType
                .migrationProofPresent,
            )}
          />
          <Detail
            label="RLS/security proof present"
            value={yesNo(
              auditAppendWriterContractValidationResult.schemaType
                .rlsSecurityProofPresent,
            )}
          />
          <Detail
            label="No-write/no-action safety"
            value={yesNo(
              auditAppendWriterContractValidationResult.noWriteNoAction
                .auditWriteAllowed === false &&
                auditAppendWriterContractValidationResult.noWriteNoAction
                  .routeCallAllowed === false &&
                auditAppendWriterContractValidationResult.noWriteNoAction
                  .persistenceWriteAllowed === false,
            )}
          />
          <Detail
            label="Audit write path present"
            value={String(
              auditAppendWriterContractValidationResult.dependencies
                .auditWritePathPresent,
            )}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection
        title="Audit append writer contract validator authority flags"
        tone="rose"
      >
        <DetailGrid>
          <Detail
            label="contractValidatorImplemented"
            value={String(
              auditAppendWriterContractValidationResult.authority
                .contractValidatorImplemented,
            )}
          />
          <Detail
            label="writerValidatorImplemented"
            value={String(
              auditAppendWriterContractValidationResult.authority
                .writerValidatorImplemented,
            )}
          />
          <Detail
            label="writerImplemented"
            value={String(
              auditAppendWriterContractValidationResult.authority
                .writerImplemented,
            )}
          />
          <Detail
            label="auditAppendImplemented"
            value={String(
              auditAppendWriterContractValidationResult.authority
                .auditAppendImplemented,
            )}
          />
          <Detail
            label="auditRouteImplemented"
            value={String(
              auditAppendWriterContractValidationResult.authority
                .auditRouteImplemented,
            )}
          />
          <Detail
            label="auditWriteAllowed"
            value={String(
              auditAppendWriterContractValidationResult.authority
                .auditWriteAllowed,
            )}
          />
          <Detail
            label="safeToWriteAudit"
            value={String(
              auditAppendWriterContractValidationResult.authority
                .safeToWriteAudit,
            )}
          />
          <Detail
            label="auditAppendAllowed"
            value={String(
              auditAppendWriterContractValidationResult.authority
                .auditAppendAllowed,
            )}
          />
          <Detail
            label="safeToAppendAudit"
            value={String(
              auditAppendWriterContractValidationResult.authority
                .safeToAppendAudit,
            )}
          />
          <Detail
            label="routeCallAllowed"
            value={String(
              auditAppendWriterContractValidationResult.authority
                .routeCallAllowed,
            )}
          />
          <Detail
            label="recordCreationAllowed"
            value={String(
              auditAppendWriterContractValidationResult.authority
                .recordCreationAllowed,
            )}
          />
          <Detail
            label="persistenceWriteAllowed"
            value={String(
              auditAppendWriterContractValidationResult.authority
                .persistenceWriteAllowed,
            )}
          />
          <Detail
            label="supabaseWriteAllowed"
            value={String(
              auditAppendWriterContractValidationResult.authority
                .supabaseWriteAllowed,
            )}
          />
          <Detail
            label="localStorageWriteAllowed"
            value={String(
              auditAppendWriterContractValidationResult.authority
                .localStorageWriteAllowed,
            )}
          />
          <Detail
            label="statsPnlUpdateAllowed"
            value={String(
              auditAppendWriterContractValidationResult.authority
                .statsPnlUpdateAllowed,
            )}
          />
          <Detail
            label="tradeMutationAllowed"
            value={String(
              auditAppendWriterContractValidationResult.authority
                .tradeMutationAllowed,
            )}
          />
          <Detail
            label="tradeReconciliationAllowed"
            value={String(
              auditAppendWriterContractValidationResult.authority
                .tradeReconciliationAllowed,
            )}
          />
          <Detail
            label="correctionRollbackAllowed"
            value={String(
              auditAppendWriterContractValidationResult.authority
                .correctionRollbackAllowed,
            )}
          />
          <Detail
            label="uiStateMutationAllowed"
            value={String(
              auditAppendWriterContractValidationResult.authority
                .uiStateMutationAllowed,
            )}
          />
          <Detail
            label="userNotificationAllowed"
            value={String(
              auditAppendWriterContractValidationResult.authority
                .userNotificationAllowed,
            )}
          />
          <Detail
            label="brokerOrderFollowUpAllowed"
            value={String(
              auditAppendWriterContractValidationResult.authority
                .brokerOrderFollowUpAllowed,
            )}
          />
          <Detail
            label="avanzaBrowserFollowUpAllowed"
            value={String(
              auditAppendWriterContractValidationResult.authority
                .avanzaBrowserFollowUpAllowed,
            )}
          />
          <Detail
            label="automaticModeAllowed"
            value={String(
              auditAppendWriterContractValidationResult.authority
                .automaticModeAllowed,
            )}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Audit append writer validation summaries" tone="sky">
        <DetailGrid>
          <Detail
            label="Writer validation input present"
            value={yesNo(
              auditAppendWriterValidationResult.readiness
                .writerValidationInputPresent,
            )}
          />
          <Detail
            label="Writer contract input present"
            value={yesNo(
              auditAppendWriterValidationResult.readiness
                .auditWriterContractInputPresent,
            )}
          />
          <Detail
            label="Validated audit boundary result"
            value={yesNo(
              auditAppendWriterValidationResult.readiness
                .validatedAuditBoundaryResultPresent,
            )}
          />
          <Detail
            label="Audit event type present"
            value={yesNo(
              auditAppendWriterValidationResult.auditEvent
                .auditEventTypePresent,
            )}
          />
          <Detail
            label="Execution record reference present"
            value={yesNo(
              auditAppendWriterValidationResult.evidenceProvenance
                .executionRecordReferencePresent,
            )}
          />
          <Detail
            label="Evidence provenance present"
            value={yesNo(
              auditAppendWriterValidationResult.evidenceProvenance
                .evidenceProvenancePresent,
            )}
          />
          <Detail
            label="Audit schema table proven"
            value={yesNo(
              auditAppendWriterValidationResult.schemaType
                .auditSchemaTableProven,
            )}
          />
          <Detail
            label="Generated types present"
            value={yesNo(
              auditAppendWriterValidationResult.schemaType.generatedTypesPresent,
            )}
          />
          <Detail
            label="Migration application proven"
            value={yesNo(
              auditAppendWriterValidationResult.schemaType
                .migrationApplicationProven,
            )}
          />
          <Detail
            label="RLS security verified"
            value={yesNo(
              auditAppendWriterValidationResult.serverOnlySecurity
                .rlsSecurityVerified,
            )}
          />
          <Detail
            label="Server-only boundary verified"
            value={yesNo(
              auditAppendWriterValidationResult.serverOnlySecurity
                .serverOnlyBoundaryVerified,
            )}
          />
          <Detail
            label="Idempotency key present"
            value={yesNo(
              auditAppendWriterValidationResult.idempotency
                .idempotencyKeyPresent,
            )}
          />
          <Detail
            label="Duplicate prevention key present"
            value={yesNo(
              auditAppendWriterValidationResult.duplicatePrevention
                .duplicatePreventionKeyPresent,
            )}
          />
          <Detail
            label="Writer blocked represented"
            value={yesNo(
              auditAppendWriterValidationResult.failureRetry
                .writerBlockedRepresented,
            )}
          />
          <Detail
            label="Downstream actions remain blocked"
            value={yesNo(
              auditAppendWriterValidationResult.failureRetry
                .downstreamActionsRemainBlocked,
            )}
          />
          <Detail
            label="Audit write path present"
            value={String(
              auditAppendWriterValidationResult.dependencies
                .auditWritePathPresent,
            )}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Audit append writer authority flags" tone="rose">
        <DetailGrid>
          <Detail
            label="writerValidatorImplemented"
            value={String(
              auditAppendWriterValidationResult.authority
                .writerValidatorImplemented,
            )}
          />
          <Detail
            label="writerImplemented"
            value={String(
              auditAppendWriterValidationResult.authority.writerImplemented,
            )}
          />
          <Detail
            label="auditWriteAllowed"
            value={String(
              auditAppendWriterValidationResult.authority.auditWriteAllowed,
            )}
          />
          <Detail
            label="safeToWriteAudit"
            value={String(
              auditAppendWriterValidationResult.authority.safeToWriteAudit,
            )}
          />
          <Detail
            label="safeToAppendAudit"
            value={String(
              auditAppendWriterValidationResult.authority.safeToAppendAudit,
            )}
          />
          <Detail
            label="safeToUpdateStats"
            value={String(
              auditAppendWriterValidationResult.authority.safeToUpdateStats,
            )}
          />
          <Detail
            label="safeToMutateTrade"
            value={String(
              auditAppendWriterValidationResult.authority.safeToMutateTrade,
            )}
          />
          <Detail
            label="safeToReconcileTrade"
            value={String(
              auditAppendWriterValidationResult.authority.safeToReconcileTrade,
            )}
          />
          <Detail
            label="safeToRollback"
            value={String(
              auditAppendWriterValidationResult.authority.safeToRollback,
            )}
          />
          <Detail
            label="safeToUpdateUiState"
            value={String(
              auditAppendWriterValidationResult.authority.safeToUpdateUiState,
            )}
          />
          <Detail
            label="safeToNotifyUser"
            value={String(
              auditAppendWriterValidationResult.authority.safeToNotifyUser,
            )}
          />
          <Detail
            label="safeToRunBrokerAction"
            value={String(
              auditAppendWriterValidationResult.authority.safeToRunBrokerAction,
            )}
          />
          <Detail
            label="safeToRunAvanzaBrowserAction"
            value={String(
              auditAppendWriterValidationResult.authority
                .safeToRunAvanzaBrowserAction,
            )}
          />
          <Detail
            label="automaticModeAllowed"
            value={String(
              auditAppendWriterValidationResult.authority.automaticModeAllowed,
            )}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Boundary call validation summaries" tone="sky">
        <DetailGrid>
          <Detail
            label="Composer ready"
            value={yesNo(
              boundaryCallValidatorResult.composerValidationSummary
                .composerReady,
            )}
          />
          <Detail
            label="Proposed input complete"
            value={yesNo(
              boundaryCallValidatorResult.proposedInputValidationSummary
                .proposedPersistenceInputComplete,
            )}
          />
          <Detail
            label="Schema sufficient"
            value={yesNo(
              boundaryCallValidatorResult.schemaGeneratedTypesValidationSummary
                .schemaSufficientForValidation,
            )}
          />
          <Detail
            label="Generated types"
            value={yesNo(
              boundaryCallValidatorResult.schemaGeneratedTypesValidationSummary
                .generatedTypesPresent,
            )}
          />
          <Detail
            label="Migration proven"
            value={yesNo(
              boundaryCallValidatorResult.migrationValidationSummary
                .migrationApplicationProven,
            )}
          />
          <Detail
            label="Idempotency"
            value={yesNo(
              boundaryCallValidatorResult.idempotencyDuplicateValidationSummary
                .idempotencyMetadataPresent,
            )}
          />
          <Detail
            label="Duplicate prevention"
            value={yesNo(
              boundaryCallValidatorResult.idempotencyDuplicateValidationSummary
                .duplicatePreventionReady,
            )}
          />
          <Detail
            label="Audit/correction"
            value={yesNo(
              boundaryCallValidatorResult.auditCorrectionValidationSummary
                .sourceEvidenceChainPresent,
            )}
          />
          <Detail
            label="RLS/security"
            value={yesNo(
              boundaryCallValidatorResult.securityServerOnlyValidationSummary
                .rlsSecurityProofPresent,
            )}
          />
          <Detail
            label="Server-only boundary"
            value={yesNo(
              boundaryCallValidatorResult.securityServerOnlyValidationSummary
                .serverOnlyBoundaryProofPresent,
            )}
          />
          <Detail
            label="Dry-run route"
            value={yesNo(
              boundaryCallValidatorResult.dryRunRouteValidationSummary
                .dryRunRouteStatusKnown,
            )}
          />
          <Detail
            label="Manual approval"
            value={yesNo(
              boundaryCallValidatorResult.manualApprovalValidationSummary
                .manualApprovalSatisfied,
            )}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Boundary call post-call boundary" tone="rose">
        <DetailGrid>
          <Detail
            label="No insert route call"
            value={yesNo(
              boundaryCallValidatorResult.postCallBoundaryValidationSummary
                .noInsertRouteCall,
            )}
          />
          <Detail
            label="No execution record creation"
            value={yesNo(
              boundaryCallValidatorResult.postCallBoundaryValidationSummary
                .noExecutionRecordCreation,
            )}
          />
          <Detail
            label="No persistence write"
            value={yesNo(
              boundaryCallValidatorResult.postCallBoundaryValidationSummary
                .noPersistenceWrite,
            )}
          />
          <Detail
            label="No Supabase/localStorage write"
            value={yesNo(
              boundaryCallValidatorResult.postCallBoundaryValidationSummary
                .noSupabaseLocalStorageWrite,
            )}
          />
          <Detail
            label="No audit append"
            value={yesNo(
              boundaryCallValidatorResult.postCallBoundaryValidationSummary
                .noAuditAppend,
            )}
          />
          <Detail
            label="No stats/PnL update"
            value={yesNo(
              boundaryCallValidatorResult.postCallBoundaryValidationSummary
                .noStatsPnlUpdate,
            )}
          />
          <Detail
            label="No rollback/correction"
            value={yesNo(
              boundaryCallValidatorResult.postCallBoundaryValidationSummary
                .noRollbackCorrection,
            )}
          />
          <Detail
            label="No trade mutation"
            value={yesNo(
              boundaryCallValidatorResult.postCallBoundaryValidationSummary
                .noTradeMutation,
            )}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Boundary call authority flags" tone="rose">
        <DetailGrid>
          <Detail
            label="safeToCallInsertRoute"
            value={String(boundaryCallValidatorResult.safeToCallInsertRoute)}
          />
          <Detail
            label="safeToCreateExecutionRecord"
            value={String(boundaryCallValidatorResult.safeToCreateExecutionRecord)}
          />
          <Detail
            label="safeToPersist"
            value={String(boundaryCallValidatorResult.safeToPersist)}
          />
          <Detail
            label="safeToFinalize"
            value={String(boundaryCallValidatorResult.safeToFinalize)}
          />
          <Detail
            label="safeToUpdateStats"
            value={String(boundaryCallValidatorResult.safeToUpdateStats)}
          />
          <Detail
            label="safeToAppendAudit"
            value={String(boundaryCallValidatorResult.safeToAppendAudit)}
          />
          <Detail
            label="safeToRollback"
            value={String(boundaryCallValidatorResult.safeToRollback)}
          />
          <Detail
            label="safeToMutateTrade"
            value={String(boundaryCallValidatorResult.safeToMutateTrade)}
          />
          <Detail
            label="safeToRunBrokerAction"
            value={String(boundaryCallValidatorResult.safeToRunBrokerAction)}
          />
          <Detail
            label="safeToRunAvanzaBrowserAction"
            value={String(
              boundaryCallValidatorResult.safeToRunAvanzaBrowserAction,
            )}
          />
          <Detail
            label="automaticModeAllowed"
            value={String(boundaryCallValidatorResult.automaticModeAllowed)}
          />
          <Detail
            label="authority actual call allowed only"
            value={String(
              boundaryCallValidatorResult.authorityFlags
                .actualPersistenceValidatorCallAllowedOnly,
            )}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Actual persistence validator boundary" tone="rose">
        <p className="mt-2 text-sm leading-6 text-zinc-300">
          The actual execution-record persistence validator is not called by
          this preview. It remains a future boundary.
        </p>
        <DetailGrid>
          <Detail
            label="Boundary"
            value={formatAgentCommandValue(
              integrationResult.actualPersistenceValidatorBoundarySummary.status,
            )}
          />
          <Detail
            label="Called"
            value={yesNo(
              integrationResult.actualPersistenceValidatorBoundarySummary.called,
            )}
          />
          <Detail
            label="Safe to call validator"
            value={String(
              integrationResult.actualPersistenceValidatorBoundarySummary
                .safeToCallPersistenceValidator,
            )}
          />
          <Detail
            label="Call attempted"
            value={yesNo(
              integrationResult.actualPersistenceValidatorBoundarySummary
                .persistenceValidatorCallAttempted,
            )}
          />
          <Detail
            label="Needs generated types"
            value={yesNo(
              integrationResult.actualPersistenceValidatorBoundarySummary
                .requiresGeneratedTypesProof,
            )}
          />
          <Detail
            label="Needs migration proof"
            value={yesNo(
              integrationResult.actualPersistenceValidatorBoundarySummary
                .requiresMigrationApplicationProof,
            )}
          />
          <Detail
            label="Needs RLS proof"
            value={yesNo(
              integrationResult.actualPersistenceValidatorBoundarySummary
                .requiresRlsSecurityProof,
            )}
          />
          <Detail
            label="Needs server-only boundary"
            value={yesNo(
              integrationResult.actualPersistenceValidatorBoundarySummary
                .requiresServerOnlyWriteBoundary,
            )}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Integration summaries" tone="sky">
        <DetailGrid>
          <Detail
            label="Proposed input complete"
            value={yesNo(
              integrationResult.validationResult?.proposedInputValidationSummary
                .proposedPersistenceInputComplete,
            )}
          />
          <Detail
            label="Readiness summary"
            value={yesNo(
              integrationResult.validationResult?.readinessValidationSummary
                .readinessSummaryPresent,
            )}
          />
          <Detail
            label="Generated types"
            value={yesNo(
              integrationResult.validationResult?.schemaReadinessValidationSummary
                .generatedTypesAvailable,
            )}
          />
          <Detail
            label="Migration proven"
            value={yesNo(
              integrationResult.validationResult?.schemaReadinessValidationSummary
                .migrationApplicationProven,
            )}
          />
          <Detail
            label="Fingerprints present"
            value={yesNo(
              integrationResult.validationResult?.idempotencyValidationSummary
                .requiredFingerprintsPresent,
            )}
          />
          <Detail
            label="Audit metadata"
            value={yesNo(
              integrationResult.validationResult?.auditCorrectionValidationSummary
                .auditProvenanceMetadataPresent,
            )}
          />
          <Detail
            label="RLS proof"
            value={yesNo(
              integrationResult.validationResult?.securityValidationSummary
                .rlsSecurityProofPresent,
            )}
          />
          <Detail
            label="Dry-run route known"
            value={yesNo(
              integrationResult.validationResult?.dryRunRouteValidationSummary
                .dryRunRouteKnown,
            )}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Integration authority flags" tone="rose">
        <DetailGrid>
          <Detail
            label="safeToCallPersistenceValidator"
            value={String(integrationResult.safeToCallPersistenceValidator)}
          />
          <Detail
            label="safeToCallInsertRoute"
            value={String(integrationResult.safeToCallInsertRoute)}
          />
          <Detail
            label="safeToCreateExecutionRecord"
            value={String(integrationResult.safeToCreateExecutionRecord)}
          />
          <Detail
            label="safeToPersist"
            value={String(integrationResult.safeToPersist)}
          />
          <Detail
            label="safeToUpdateStats"
            value={String(integrationResult.safeToUpdateStats)}
          />
          <Detail
            label="safeToAppendAudit"
            value={String(integrationResult.safeToAppendAudit)}
          />
          <Detail
            label="safeToRollback"
            value={String(integrationResult.safeToRollback)}
          />
          <Detail
            label="safeToMutateTrade"
            value={String(integrationResult.safeToMutateTrade)}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Adapter status" tone="violet">
        <p className="mt-2 text-sm leading-6 text-zinc-300">
          Adapter ready means proposed-input-ready only. It is not validation
          approval, persistence-validator call approval, insert-route approval,
          write approval, or execution-record creation approval.
        </p>
        <DetailGrid>
          <Detail
            label="Adapter status"
            value={formatAgentCommandValue(adapterResult.status)}
          />
          <Detail
            label="Decision"
            value={formatAgentCommandValue(adapterResult.decisionRecommendation)}
          />
          <Detail
            label="Proposed input"
            value={yesNo(
              adapterResult.proposedInputSummary.proposedPersistenceInputPresent,
            )}
          />
          <Detail
            label="Persistence validator called"
            value={yesNo(adapterResult.persistenceValidatorCallAttempted)}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Proposed ExecutionRecordPersistenceInput" tone="sky">
        <DetailGrid>
          <Detail label="Ticker" value={candidate?.ticker ?? "n/a"} />
          <Detail label="Side" value={candidate?.side ?? "n/a"} />
          <Detail
            label="Quantity"
            value={formatAgentCommandValue(candidate?.quantity)}
          />
          <Detail
            label="Record fingerprint"
            value={proposedInput?.recordFingerprint ?? "n/a"}
          />
          <Detail
            label="Idempotency key"
            value={proposedInput?.idempotencyKey ?? "n/a"}
          />
          <Detail
            label="Source fingerprint"
            value={proposedInput?.sourceFingerprint ?? "n/a"}
          />
          <Detail
            label="Broker order"
            value={proposedInput?.brokerConfirmation.brokerOrderId ?? "n/a"}
          />
          <Detail
            label="Schema"
            value={proposedInput?.schemaReference?.tableName ?? "n/a"}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Field mapping" tone="emerald">
        <DetailGrid>
          <Detail
            label="Candidate fingerprint"
            value={yesNo(adapterResult.fieldMappingSummary.candidateFingerprintMapped)}
          />
          <Detail
            label="Execution values"
            value={yesNo(adapterResult.fieldMappingSummary.executionValuesMapped)}
          />
          <Detail
            label="Idempotency keys"
            value={yesNo(adapterResult.fieldMappingSummary.idempotencyKeysMapped)}
          />
          <Detail
            label="Audit provenance"
            value={yesNo(
              adapterResult.fieldMappingSummary.auditProvenanceFieldsMapped,
            )}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Precondition" tone="amber">
        <DetailGrid>
          <Detail
            label="Candidate output only"
            value={yesNo(adapterResult.preconditionSummary.candidateOutputOnly)}
          />
          <Detail
            label="Manual approval present"
            value={yesNo(adapterResult.preconditionSummary.manualApprovalPresent)}
          />
          <Detail
            label="All authority flags false"
            value={yesNo(adapterResult.preconditionSummary.allAuthorityFlagsFalse)}
          />
          <Detail
            label="Can shape input"
            value={yesNo(
              adapterResult.preconditionSummary.canShapeProposedPersistenceInput,
            )}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Schema readiness" tone="sky">
        <DetailGrid>
          <Detail
            label="Generated types"
            value={yesNo(adapterResult.schemaReadinessSummary.generatedTypesAvailable)}
          />
          <Detail
            label="Migration proven"
            value={yesNo(
              adapterResult.schemaReadinessSummary.migrationApplicationProven,
            )}
          />
          <Detail
            label="RLS proof"
            value={yesNo(adapterResult.securitySummary.rlsSecurityProofPresent)}
          />
          <Detail
            label="Server-only boundary"
            value={yesNo(
              adapterResult.securitySummary.serverOnlyWriteBoundaryPresent,
            )}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Idempotency" tone="emerald">
        <DetailGrid>
          <Detail
            label="Required fingerprints"
            value={yesNo(adapterResult.idempotencySummary.requiredFingerprintsPresent)}
          />
          <Detail
            label="Duplicate prevention"
            value={yesNo(adapterResult.idempotencySummary.duplicatePreventionPresent)}
          />
          <Detail
            label="Duplicate lookup"
            value={yesNo(adapterResult.idempotencySummary.duplicateLookupCompleted)}
          />
          <Detail
            label="Safe for write"
            value={yesNo(adapterResult.idempotencySummary.safeForWrite)}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Audit/correction" tone="amber">
        <DetailGrid>
          <Detail
            label="Audit metadata"
            value={yesNo(
              adapterResult.auditCorrectionSummary.auditProvenanceMetadataPresent,
            )}
          />
          <Detail
            label="Source evidence"
            value={yesNo(
              adapterResult.auditCorrectionSummary.sourceEvidenceChainPresent,
            )}
          />
          <Detail
            label="Audit append attempted"
            value={yesNo(adapterResult.auditCorrectionSummary.auditAppendAttempted)}
          />
          <Detail
            label="Rollback attempted"
            value={yesNo(adapterResult.auditCorrectionSummary.rollbackAttempted)}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Security" tone="rose">
        <DetailGrid>
          <Detail
            label="Direct client write absent"
            value={yesNo(adapterResult.securitySummary.directClientWritePathAbsent)}
          />
          <Detail
            label="Production UI write"
            value={yesNo(!adapterResult.securitySummary.noProductionUiWriteAction)}
          />
          <Detail
            label="Automatic mode allowed"
            value={yesNo(adapterResult.securitySummary.automaticModeAllowed)}
          />
          <Detail
            label="Safe for write"
            value={yesNo(adapterResult.securitySummary.safeForWrite)}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Dry-run route" tone="sky">
        <DetailGrid>
          <Detail
            label="Dry-run route known"
            value={yesNo(adapterResult.dryRunRouteSummary.dryRunRouteKnown)}
          />
          <Detail
            label="Adapter calls validator"
            value={yesNo(
              adapterResult.dryRunRouteSummary.adapterCallsPersistenceValidator,
            )}
          />
          <Detail
            label="Adapter calls insert route"
            value={yesNo(adapterResult.dryRunRouteSummary.adapterCallsInsertRoute)}
          />
          <Detail
            label="Production insert ready"
            value={yesNo(adapterResult.dryRunRouteSummary.productionInsertRouteReady)}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Safety policy" tone="rose">
        <DetailGrid>
          <Detail
            label="safeToCallPersistenceValidator"
            value={String(adapterResult.safeToCallPersistenceValidator)}
          />
          <Detail
            label="safeToCallInsertRoute"
            value={String(adapterResult.safeToCallInsertRoute)}
          />
          <Detail
            label="safeToCreateExecutionRecord"
            value={String(adapterResult.safeToCreateExecutionRecord)}
          />
          <Detail
            label="safeToPersist"
            value={String(adapterResult.safeToPersist)}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Validator status" tone="violet">
        <p className="mt-2 text-sm leading-6 text-zinc-300">
          Validator valid means validation-valid only. It is not approval to
          call the persistence validator, insert route, or any production write
          path.
        </p>
        <DetailGrid>
          <Detail
            label="Validation status"
            value={formatAgentCommandValue(validatorResult.status)}
          />
          <Detail
            label="Decision"
            value={formatAgentCommandValue(
              validatorResult.decisionRecommendation,
            )}
          />
          <Detail
            label="Validation only"
            value={yesNo(validatorResult.validationOnly)}
          />
          <Detail
            label="Validator implemented"
            value={yesNo(validatorResult.validatorImplemented)}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Validator proposed input validation" tone="sky">
        <DetailGrid>
          <Detail
            label="Input complete"
            value={yesNo(
              validatorResult.proposedInputValidationSummary
                .proposedPersistenceInputComplete,
            )}
          />
          <Detail
            label="Candidate output only"
            value={yesNo(
              validatorResult.proposedInputValidationSummary.candidateOutputOnly,
            )}
          />
          <Detail
            label="Review only"
            value={yesNo(
              validatorResult.proposedInputValidationSummary
                .proposedPersistenceInputIsReviewOnly,
            )}
          />
          <Detail
            label="Safe for write"
            value={yesNo(
              validatorResult.proposedInputValidationSummary.proposedInputSafeForWrite,
            )}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Validator readiness" tone="amber">
        <DetailGrid>
          <Detail
            label="Adapter ready"
            value={yesNo(validatorResult.readinessValidationSummary.adapterReadyStatus)}
          />
          <Detail
            label="Readiness summary"
            value={yesNo(
              validatorResult.readinessValidationSummary.readinessSummaryPresent,
            )}
          />
          <Detail
            label="Manual approval"
            value={yesNo(
              validatorResult.readinessValidationSummary.manualApprovalPresent,
            )}
          />
          <Detail
            label="Validation only"
            value={yesNo(validatorResult.readinessValidationSummary.validationOnly)}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Validator schema readiness" tone="sky">
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
            label="Schema aligned"
            value={yesNo(
              validatorResult.schemaReadinessValidationSummary
                .schemaAlignedWithProposedInput,
            )}
          />
          <Detail
            label="Safe for write"
            value={yesNo(
              validatorResult.schemaReadinessValidationSummary.safeForWrite,
            )}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Validator idempotency" tone="emerald">
        <DetailGrid>
          <Detail
            label="Fingerprints present"
            value={yesNo(
              validatorResult.idempotencyValidationSummary
                .requiredFingerprintsPresent,
            )}
          />
          <Detail
            label="Duplicate prevention"
            value={yesNo(
              validatorResult.idempotencyValidationSummary
                .duplicatePreventionPresent,
            )}
          />
          <Detail
            label="Duplicate lookup"
            value={yesNo(
              validatorResult.idempotencyValidationSummary
                .duplicateLookupCompleted,
            )}
          />
          <Detail
            label="Safe for write"
            value={yesNo(validatorResult.idempotencyValidationSummary.safeForWrite)}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Validator audit/correction" tone="amber">
        <DetailGrid>
          <Detail
            label="Audit metadata"
            value={yesNo(
              validatorResult.auditCorrectionValidationSummary
                .auditProvenanceMetadataPresent,
            )}
          />
          <Detail
            label="Source evidence"
            value={yesNo(
              validatorResult.auditCorrectionValidationSummary
                .sourceEvidenceChainPresent,
            )}
          />
          <Detail
            label="Audit append"
            value={yesNo(
              validatorResult.auditCorrectionValidationSummary.auditAppendAttempted,
            )}
          />
          <Detail
            label="Rollback"
            value={yesNo(
              validatorResult.auditCorrectionValidationSummary.rollbackAttempted,
            )}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Validator security" tone="rose">
        <DetailGrid>
          <Detail
            label="RLS proof"
            value={yesNo(
              validatorResult.securityValidationSummary.rlsSecurityProofPresent,
            )}
          />
          <Detail
            label="Server-only boundary"
            value={yesNo(
              validatorResult.securityValidationSummary
                .serverOnlyWriteBoundaryPresent,
            )}
          />
          <Detail
            label="No production UI write"
            value={yesNo(
              validatorResult.securityValidationSummary.noProductionUiWriteAction,
            )}
          />
          <Detail
            label="Safe for write"
            value={yesNo(validatorResult.securityValidationSummary.safeForWrite)}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Validator dry-run route" tone="sky">
        <DetailGrid>
          <Detail
            label="Dry-run route known"
            value={yesNo(
              validatorResult.dryRunRouteValidationSummary.dryRunRouteKnown,
            )}
          />
          <Detail
            label="Calls validator"
            value={yesNo(
              validatorResult.dryRunRouteValidationSummary
                .validationContractCallsPersistenceValidator,
            )}
          />
          <Detail
            label="Calls insert route"
            value={yesNo(
              validatorResult.dryRunRouteValidationSummary
                .validationContractCallsInsertRoute,
            )}
          />
          <Detail
            label="Production insert ready"
            value={yesNo(
              validatorResult.dryRunRouteValidationSummary.productionInsertRouteReady,
            )}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Safety policy validation" tone="rose">
        <DetailGrid>
          <Detail
            label="All write flags false"
            value={yesNo(
              validatorResult.safetyPolicyValidationSummary
                .allWriteAuthorityFlagsFalse,
            )}
          />
          <Detail
            label="All mutation flags false"
            value={yesNo(
              validatorResult.safetyPolicyValidationSummary
                .allRuntimeMutationAttemptFlagsFalse,
            )}
          />
          <Detail
            label="Persistence allowed"
            value={yesNo(
              validatorResult.safetyPolicyValidationSummary.persistenceAllowed,
            )}
          />
          <Detail
            label="Audit append allowed"
            value={yesNo(
              validatorResult.safetyPolicyValidationSummary.auditAppendAllowed,
            )}
          />
        </DetailGrid>
      </PreviewSection>

      <PreviewSection title="Authority flags" tone="rose">
        <DetailGrid>
          <Detail
            label="safeToCallPersistenceValidator"
            value={String(validatorResult.authorityFlags.safeToCallPersistenceValidator)}
          />
          <Detail
            label="safeToCallInsertRoute"
            value={String(validatorResult.authorityFlags.safeToCallInsertRoute)}
          />
          <Detail
            label="safeToCreateExecutionRecord"
            value={String(validatorResult.authorityFlags.safeToCreateExecutionRecord)}
          />
          <Detail
            label="safeToPersist"
            value={String(validatorResult.authorityFlags.safeToPersist)}
          />
          <Detail
            label="safeToUpdateStats"
            value={String(validatorResult.authorityFlags.safeToUpdateStats)}
          />
          <Detail
            label="safeToAppendAudit"
            value={String(validatorResult.authorityFlags.safeToAppendAudit)}
          />
          <Detail
            label="safeToRollback"
            value={String(validatorResult.authorityFlags.safeToRollback)}
          />
          <Detail
            label="safeToMutateTrade"
            value={String(validatorResult.authorityFlags.safeToMutateTrade)}
          />
        </DetailGrid>
      </PreviewSection>

      <StringList
        emptyLabel="No integration blocked reasons."
        items={integrationResult.blockedReasons}
        title="Integration blocked reasons"
        tone="rose"
      />
      <StringList
        emptyLabel="No integration warnings."
        items={integrationResult.warnings}
        title="Integration warnings"
        tone="amber"
      />
      <StringList
        emptyLabel="No integration review items."
        items={integrationResult.reviewItems}
        title="Integration review items"
        tone="sky"
      />
      <StringList
        emptyLabel="No adapter blocked reasons."
        items={adapterResult.blockedReasons}
        title="Blocked reasons"
        tone="rose"
      />
      <StringList
        emptyLabel="No adapter warnings."
        items={adapterResult.warnings}
        title="Warnings"
        tone="amber"
      />
      <StringList
        emptyLabel="No adapter review items."
        items={adapterResult.reviewItems}
        title="Review items"
        tone="sky"
      />
      <StringList
        emptyLabel="No validator blocked reasons."
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
        tone="sky"
      />
      <StringList
        emptyLabel="No insert route readiness blocked reasons."
        items={insertRouteReadinessValidatorResult.blockedReasons}
        title="Insert route readiness blocked reasons"
        tone="rose"
      />
      <StringList
        emptyLabel="No insert route readiness warnings."
        items={insertRouteReadinessValidatorResult.warnings}
        title="Insert route readiness warnings"
        tone="amber"
      />
      <StringList
        emptyLabel="No insert route readiness review items."
        items={insertRouteReadinessValidatorResult.reviewItems}
        title="Insert route readiness review items"
        tone="sky"
      />
      <StringList
        emptyLabel="No insert route call blocked reasons."
        items={insertRouteCallWrapperResult.blockedReasons}
        title="Insert route call blocked reasons"
        tone="rose"
      />
      <StringList
        emptyLabel="No insert route call warnings."
        items={insertRouteCallWrapperResult.warnings}
        title="Insert route call warnings"
        tone="amber"
      />
      <StringList
        emptyLabel="No insert route call review items."
        items={insertRouteCallWrapperResult.reviewItems}
        title="Insert route call review items"
        tone="sky"
      />
      <StringList
        emptyLabel="No production boundary blocked reasons."
        items={productionInsertRouteBoundaryValidatorResult.blockedReasons}
        title="Production boundary blocked reasons"
        tone="rose"
      />
      <StringList
        emptyLabel="No production boundary warnings."
        items={productionInsertRouteBoundaryValidatorResult.warnings}
        title="Production boundary warnings"
        tone="amber"
      />
      <StringList
        emptyLabel="No production boundary review items."
        items={productionInsertRouteBoundaryValidatorResult.reviewItems}
        title="Production boundary review items"
        tone="sky"
      />
      <StringList
        emptyLabel="No post-insert boundary blocked reasons."
        items={postInsertBoundaryValidatorResult.blockedReasons}
        title="Post-insert boundary blocked reasons"
        tone="rose"
      />
      <StringList
        emptyLabel="No post-insert boundary warnings."
        items={postInsertBoundaryValidatorResult.warnings}
        title="Post-insert boundary warnings"
        tone="amber"
      />
      <StringList
        emptyLabel="No post-insert boundary review items."
        items={postInsertBoundaryValidatorResult.reviewItems}
        title="Post-insert boundary review items"
        tone="sky"
      />
      <StringList
        emptyLabel="No audit append boundary blocked reasons."
        items={auditAppendBoundaryValidatorResult.blockedReasons}
        title="Audit append boundary blocked reasons"
        tone="rose"
      />
      <StringList
        emptyLabel="No audit append boundary warnings."
        items={auditAppendBoundaryValidatorResult.warnings}
        title="Audit append boundary warnings"
        tone="amber"
      />
      <StringList
        emptyLabel="No audit append boundary review items."
        items={auditAppendBoundaryValidatorResult.reviewItems}
        title="Audit append boundary review items"
        tone="sky"
      />
      <StringList
        emptyLabel="No audit append writer validator blocked reasons."
        items={auditAppendWriterValidationResult.blockedReasons}
        title="Audit append writer validator blocked reasons"
        tone="rose"
      />
      <StringList
        emptyLabel="No audit append writer validator warnings."
        items={auditAppendWriterValidationResult.warnings}
        title="Audit append writer validator warnings"
        tone="amber"
      />
      <StringList
        emptyLabel="No audit append writer validator review items."
        items={auditAppendWriterValidationResult.reviewItems}
        title="Audit append writer validator review items"
        tone="sky"
      />
      <StringList
        emptyLabel="No audit append writer contract validator blocked reasons."
        items={auditAppendWriterContractValidationResult.blockedReasons}
        title="Audit append writer contract validator blocked reasons"
        tone="rose"
      />
      <StringList
        emptyLabel="No audit append writer contract validator warnings."
        items={auditAppendWriterContractValidationResult.warnings}
        title="Audit append writer contract validator warnings"
        tone="amber"
      />
      <StringList
        emptyLabel="No audit append writer contract validator review items."
        items={auditAppendWriterContractValidationResult.reviewItems}
        title="Audit append writer contract validator review items"
        tone="sky"
      />
      <StringList
        emptyLabel="No audit append writer dry-run validator blocked reasons."
        items={auditAppendWriterDryRunValidationResult.blockedReasons}
        title="Audit append writer dry-run validator blocked reasons"
        tone="rose"
      />
      <StringList
        emptyLabel="No audit append writer dry-run validator warnings."
        items={auditAppendWriterDryRunValidationResult.warnings}
        title="Audit append writer dry-run validator warnings"
        tone="amber"
      />
      <StringList
        emptyLabel="No audit append writer dry-run validator review items."
        items={auditAppendWriterDryRunValidationResult.reviewItems}
        title="Audit append writer dry-run validator review items"
        tone="sky"
      />
      <StringList
        emptyLabel="No audit append writer dry-run execution validator blocked reasons."
        items={auditAppendWriterDryRunExecutionValidationResult.blockedReasons}
        title="Audit append writer dry-run execution validator blocked reasons"
        tone="rose"
      />
      <StringList
        emptyLabel="No audit append writer dry-run execution validator warnings."
        items={auditAppendWriterDryRunExecutionValidationResult.warnings}
        title="Audit append writer dry-run execution validator warnings"
        tone="amber"
      />
      <StringList
        emptyLabel="No audit append writer dry-run execution validator review items."
        items={auditAppendWriterDryRunExecutionValidationResult.reviewItems}
        title="Audit append writer dry-run execution validator review items"
        tone="sky"
      />
      <StringList
        emptyLabel="No audit append writer dry-run execution blocked reasons."
        items={auditAppendWriterDryRunExecutionImplementationResult.blockedReasons}
        title="Audit append writer dry-run execution blocked reasons"
        tone="rose"
      />
      <StringList
        emptyLabel="No audit append writer dry-run execution warnings."
        items={auditAppendWriterDryRunExecutionImplementationResult.warnings}
        title="Audit append writer dry-run execution warnings"
        tone="amber"
      />
      <StringList
        emptyLabel="No audit append writer dry-run execution review items."
        items={auditAppendWriterDryRunExecutionImplementationResult.reviewItems}
        title="Audit append writer dry-run execution review items"
        tone="sky"
      />
      <StringList
        emptyLabel="No boundary-call validator blocked reasons."
        items={boundaryCallValidatorResult.blockedReasons}
        title="Boundary-call validator blocked reasons"
        tone="rose"
      />
      <StringList
        emptyLabel="No boundary-call validator warnings."
        items={boundaryCallValidatorResult.warnings}
        title="Boundary-call validator warnings"
        tone="amber"
      />
      <StringList
        emptyLabel="No boundary-call validator review items."
        items={boundaryCallValidatorResult.reviewItems}
        title="Boundary-call validator review items"
        tone="sky"
      />
    </div>
  );
}

export function ExecutionRecordPersistenceValidatorIntegrationPreview({
  canRun,
  isRunning,
  message,
  onRun,
  result,
  unavailableReason,
}: ExecutionRecordPersistenceValidatorIntegrationPreviewProps) {
  return (
    <details className="rounded-md border border-violet-300/15 bg-violet-300/[0.04] p-4">
      <summary className="cursor-pointer select-none font-mono text-xs font-bold uppercase tracking-[0.16em] text-violet-100">
        Execution Record Persistence Validator Integration Preview
      </summary>

      <div className="mt-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-violet-300/30 bg-violet-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-violet-100">
                Persistence validator integration preview only
              </span>
              <span className="rounded-full border border-sky-300/30 bg-sky-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-sky-100">
                Integration readiness only
              </span>
              <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-100">
                Boundary call readiness only
              </span>
              <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-100">
                Controlled fixture only
              </span>
              <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-amber-100">
                Proposed persistence input only
              </span>
              <span className="rounded-full border border-rose-300/30 bg-rose-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-rose-100">
                Wrapper diagnostics only
              </span>
              <span className="rounded-full border border-rose-300/30 bg-rose-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-rose-100">
                Fixture-injected validator callable only
              </span>
              <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-amber-100">
                Insert route readiness only
              </span>
              <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-amber-100">
                May prepare insert route call only
              </span>
              <span className="rounded-full border border-rose-300/30 bg-rose-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-rose-100">
                Dry-run execution diagnostics only
              </span>
              <span className="rounded-full border border-rose-300/30 bg-rose-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-rose-100">
                Non-persistent would-write simulation only
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              Dev-gated read-only preview from controlled fixture data. This
              calls buildExecutionRecordPersistenceValidatorIntegration(...),
              which composes only shapeExecutionRecordPersistenceValidatorInput(...)
              and validateExecutionRecordPersistenceIntegration(...), then runs
              validateActualPersistenceValidatorBoundaryCall(...) and
              callActualPersistenceValidatorBoundary(...) with a controlled
              fixture-injected validator callable for display-only diagnostics,
              then validateExecutionRecordInsertRouteReadiness(...) and
              callExecutionRecordInsertRoute(...) with a controlled
              fixture-injected route callable for display-only diagnostics.
              The insert route wrapper result remains dry-run diagnostics only,
              not production insert or full persistence workflow completion.
              It then calls validateExecutionRecordPostInsertBoundary(...) for
              post-insert boundary diagnostics only. It does not create an
              execution record, persist, append audit, update stats or PnL,
              rollback, correct, mutate or reconcile trade state, update UI
              source-of-truth state, send notifications, send to broker, run
              browser automation, or interact with Avanza. The audit append
              writer dry-run execution block calls
              executeAuditAppendWriterDryRun(...) with fixture-only data for
              non-persistent would-write diagnostics only; the result is not
              real write, audit write approval, proof, downstream approval, or
              workflow completion.
            </p>
          </div>

          <button
            className="rounded-md border border-violet-300/30 bg-violet-300/10 px-3 py-2 text-left font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-violet-100 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canRun || isRunning}
            onClick={onRun}
            type="button"
          >
            {isRunning
              ? "Running persistence validator integration preview..."
              : "Run persistence validator integration preview"}
          </button>
        </div>

        <SafetyLabelList
          labels={[
            "Dev preview only",
            "Persistence validator integration preview only",
            "Integration readiness only",
            "Boundary call readiness only",
            "Actual Persistence Validator Boundary Call Wrapper diagnostics only",
            "Fixture-injected validator callable only",
            "Actual validator wrapper result remains do_not_insert",
            "Insert route readiness only",
            "May prepare insert route call only",
            "Audit append writer dry-run execution diagnostics only",
            "Non-persistent would-write simulation only",
            "Insert route wrapper diagnostics only",
            "Fixture-injected route callable only",
            "Dry-run diagnostics only - no production insert",
            "Post-insert diagnostics only",
            "Design/readiness only",
            "Design-only do not run post-insert actions",
            "Audit writer diagnostics only",
            "Design-only do not write audit",
            "Writer validation readiness is not audit write approval",
            "Writer contract readiness is not audit write approval",
            "Insert success is not audit write approval",
            "Audit boundary validator readiness is not audit write approval",
            "Dev-preview diagnostics are not audit write approval",
            "Orchestrator readiness is not audit write approval",
            "Production boundary readiness is not audit write approval",
            "Dry-run success is not audit write approval",
            "Writer validation success is not downstream action approval",
            "Insert success is not post-insert action approval",
            "Insert success is not audit append approval",
            "Insert success is not stats/PnL update approval",
            "Insert success is not trade mutation approval",
            "Insert success is not trade reconciliation approval",
            "Insert success is not rollback/correction approval",
            "Insert success is not failure recovery approval",
            "Insert success is not UI state update approval",
            "Insert success is not user notification approval",
            "Insert success is not broker/order approval",
            "Insert success is not Avanza/browser approval",
            "Insert success is not automatic mode approval",
            "Insert success is not full workflow completion",
            "Route success is not full persistence workflow completion",
            "Route success is not audit append approval",
            "Route success is not stats/PnL update approval",
            "Route success is not rollback/correction approval",
            "Route success is not trade mutation approval",
            "Route success is not broker/order approval",
            "Insert route readiness ready is not insert execution",
            "Prepare-only, no route call",
            "Valid diagnostics only - do not insert",
            "May call actual persistence validator only",
            "Proposed persistence input only",
            "Validation-only",
            "Wrapper result is not insert route approval",
            "Ready result is not execution-record creation approval",
            "Ready result is not persistence/write approval",
            "Ready result is not audit append approval",
            "Ready result is not stats/PnL update approval",
            "Ready result is not rollback/correction approval",
            "Ready result is not trade mutation approval",
            "Ready result is not broker/order approval",
            "Ready result is not Avanza/browser approval",
            "Dry-run route is not production insert",
            "Production insert remains separate future boundary",
            "Wrapper result is not execution-record creation approval",
            "Wrapper result is not persistence/write approval",
            "Does not call insert route",
            "Does not create execution record",
            "Does not persist",
            "Not insert route approval",
            "Not execution-record creation approval",
            "Not persistence/write approval",
            "Not audit append approval",
            "Not stats/PnL update approval",
            "Not rollback/correction approval",
            "Not trade mutation approval",
            "Not broker/order approval",
            "No audit write",
            "No audit append",
            "No stats/PnL update",
            "No trade mutation/reconciliation",
            "No rollback/correction",
            "No UI update",
            "No notification execution",
            "No broker/order action",
            "Does not mutate trade state",
            "Does not send to broker",
            "No Avanza/browser action",
            "Automatic mode disabled",
            "safeToCallPersistenceValidator=false",
            "safeToCallInsertRoute=false",
            "safeToCreateExecutionRecord=false",
            "safeToPersist=false",
            "safeToUpdateStats=false",
            "safeToAppendAudit=false",
            "safeToRollback=false",
            "safeToMutateTrade=false",
            "safeToRunBrokerAction=false",
            "safeToRunAvanzaBrowserAction=false",
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
          <>
            <ScenarioPanel scenario={result.readyScenario} />
            <ScenarioPanel scenario={result.reviewScenario} />
          </>
        )}
      </div>
    </details>
  );
}
