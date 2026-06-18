import {
  FINALIZATION_TO_EXECUTION_RECORD_BRIDGE_CONTRACT_VERSION,
  FINALIZATION_TO_EXECUTION_RECORD_BRIDGE_DEFAULT_SAFETY_POLICY,
  type FinalizationToExecutionRecordAuditCorrectionSummary,
  type FinalizationToExecutionRecordBridgeBlockedReason,
  type FinalizationToExecutionRecordBridgeInput,
  type FinalizationToExecutionRecordBridgeResult,
  type FinalizationToExecutionRecordBridgeReviewItem,
  type FinalizationToExecutionRecordBridgeStatus,
  type FinalizationToExecutionRecordBridgeWarning,
  type FinalizationToExecutionRecordFieldName,
  type FinalizationToExecutionRecordFieldMappingSummary,
  type FinalizationToExecutionRecordIdempotencySummary,
  type FinalizationToExecutionRecordSourceEvidenceSummary,
  type FinalizationToExecutionRecordTargetSummary,
  type FinalizationToExecutionRecordValidationHandoffSummary,
} from "@/lib/finalization-to-execution-record-bridge-contract";
import type { ExecutionRecordCreationInput } from "@/lib/execution-record-creation-contract";
import type { FinalizationCandidate } from "@/lib/finalization-candidate-contract";
import type { FinalSettlementNoteMatchingResult } from "@/lib/final-settlement-note-matching-contract";

const DEFAULT_BRIDGE_WARNINGS: FinalizationToExecutionRecordBridgeWarning[] = [
  "candidate_only",
  "mapping_only",
  "proposed_impact_not_write",
  "dry_run_ready_not_write_approval",
  "audit_required_before_write",
  "duplicate_check_required",
  "stats_update_out_of_scope",
  "trade_mutation_out_of_scope",
];

function unique<T extends string>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function pushUnique<T extends string>(values: T[], value: T): void {
  if (!values.includes(value)) {
    values.push(value);
  }
}

function hasValue(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function candidateSourceFingerprint(
  candidate: FinalizationCandidate | null,
): string | null {
  return (
    candidate?.executionRecordMetadata?.sourceEvidenceFingerprint ??
    candidate?.evidenceSummary.sourceReference?.evidenceFingerprint ??
    candidate?.evidenceSummary.finalNoteEvidenceFingerprint ??
    candidate?.evidenceSummary.provisionalEvidenceFingerprint ??
    null
  );
}

function finalNoteMatchIdentity(
  candidate: FinalizationCandidate | null,
  match: FinalSettlementNoteMatchingResult | null,
): string | null {
  return (
    candidate?.evidenceSummary.noteReferenceNumber ??
    candidate?.settlementSummary.noteReferenceNumber ??
    match?.metadata?.finalSettlementNoteMatchIdentity?.toString() ??
    match?.metadata?.noteReferenceNumber?.toString() ??
    null
  );
}

function brokerResultFingerprint(
  input: FinalizationToExecutionRecordBridgeInput,
): string | null {
  return (
    input.brokerExecutionResultCandidate?.fingerprintInput
      .candidateFingerprintDraft ??
    input.finalizationCandidate?.executionRecordMetadata
      ?.brokerResultFingerprint ??
    input.finalizationCandidate?.sourceReferences.brokerExecutionResultCandidate
      ?.fingerprintInput.candidateFingerprintDraft ??
    null
  );
}

function handoffFingerprint(
  input: FinalizationToExecutionRecordBridgeInput,
): string | null {
  return (
    input.brokerPayloadHandoffMetadata?.handoffPayloadFingerprint ??
    input.finalizationCandidate?.evidenceSummary.handoffPayloadFingerprint ??
    input.finalizationCandidate?.sourceReferences.handoffPayloadFingerprint ??
    input.brokerExecutionResultCandidate?.handoffPayloadFingerprint ??
    input.immediateBrokerReadback?.provenance?.handoffPayloadFingerprint ??
    null
  );
}

function classifyMatch(
  match: FinalSettlementNoteMatchingResult | null,
  blockedReasons: FinalizationToExecutionRecordBridgeBlockedReason[],
  reviewItems: FinalizationToExecutionRecordBridgeReviewItem[],
): void {
  if (!match) {
    pushUnique(blockedReasons, "missing_final_settlement_note_match");
    return;
  }

  if (
    match.status === "duplicate_candidates" ||
    match.confidence === "duplicate_candidates" ||
    match.confidence === "ambiguous_match"
  ) {
    pushUnique(blockedReasons, "ambiguous_final_settlement_note_match");
    pushUnique(reviewItems, "final_settlement_note_match_review");
  }

  if (match.status === "mismatch" || match.confidence === "mismatch") {
    pushUnique(reviewItems, "final_settlement_note_match_review");
  }

  for (const reason of match.mismatchReasons) {
    if (reason === "quantity_mismatch") {
      pushUnique(blockedReasons, "mismatched_quantity");
      pushUnique(reviewItems, "quantity_review");
    }
    if (reason === "currency_mismatch") {
      pushUnique(blockedReasons, "mismatched_currency");
      pushUnique(reviewItems, "currency_review");
    }
    if (reason === "fx_or_commission_mismatch") {
      pushUnique(blockedReasons, "mismatched_fees");
      pushUnique(blockedReasons, "mismatched_fx_rate");
      pushUnique(reviewItems, "fees_review");
      pushUnique(reviewItems, "fx_rate_review");
    }
    if (reason === "price_mismatch") {
      pushUnique(blockedReasons, "mismatched_amount");
      pushUnique(reviewItems, "amount_review");
    }
  }
}

function determineStatus(args: {
  blockedReasons: FinalizationToExecutionRecordBridgeBlockedReason[];
  reviewItems: FinalizationToExecutionRecordBridgeReviewItem[];
  unsupported: boolean;
}): FinalizationToExecutionRecordBridgeStatus {
  if (args.unsupported) {
    return "bridge_candidate_unsupported";
  }

  if (args.blockedReasons.length > 0) {
    return "bridge_candidate_blocked";
  }

  if (args.reviewItems.length > 0) {
    return "bridge_candidate_needs_review";
  }

  return "bridge_candidate_ready";
}

function buildCreationInputDraft(
  input: FinalizationToExecutionRecordBridgeInput,
  sourceEvidenceFingerprint: string | null,
  idempotencyKey: string | null,
): Partial<ExecutionRecordCreationInput> | null {
  const candidate = input.finalizationCandidate;

  if (!candidate || !sourceEvidenceFingerprint || !idempotencyKey) {
    return null;
  }

  return {
    contractVersion: "execution_record_creation_v1",
    requestedAt: input.requestedAt,
    sourceEnvironment:
      input.brokerPayloadHandoffMetadata?.sourceEnvironment ?? "local_dev",
    executionMode:
      input.brokerPayloadHandoffMetadata?.executionMode ?? "semi_automatic",
    executionPhase: candidate.settlementSummary.side === "buy" ? "entry" : "exit",
    expectedAction: candidate.settlementSummary.side,
    expectedInstrument: {
      ticker: candidate.settlementSummary.instrument.ticker ?? "",
      name: candidate.settlementSummary.instrument.instrumentName,
      market: candidate.settlementSummary.instrument.market,
      currency: candidate.settlementSummary.currency,
      instrumentType: null,
    },
    expectedQuantity: candidate.settlementSummary.quantity,
    recommendationId: input.brokerPayloadHandoffMetadata?.recommendationId,
    positionId: input.brokerPayloadHandoffMetadata?.positionId,
    brokerMetadata: {
      broker: "avanza",
      brokerOrderId:
        input.brokerExecutionResultCandidate?.brokerReferences.brokerOrderId ??
        null,
      brokerConfirmationId:
        input.brokerExecutionResultCandidate?.brokerReferences
          .brokerConfirmationId ?? null,
      brokerReference:
        input.brokerExecutionResultCandidate?.brokerReferences.brokerReference ??
        input.brokerExecutionResultCandidate?.brokerReferences
          .strongEquivalentReference ??
        candidate.settlementSummary.noteReferenceNumber ??
        null,
      confirmationTimestamp:
        candidate.settlementSummary.executionTimestamp ??
        input.brokerExecutionResultCandidate?.confirmationTimestamp ??
        input.requestedAt,
    },
    idempotency: {
      idempotencyKey,
      sourceEvidenceFingerprint,
      brokerResultFingerprint: brokerResultFingerprint(input),
      handoffPayloadFingerprint: handoffFingerprint(input),
    },
  };
}

function derivedIdentity(prefix: string, values: Array<string | null>): string | null {
  const parts = values.filter(hasValue);

  if (parts.length !== values.length) {
    return null;
  }

  return `${prefix}:${parts.join(":")}`;
}

function buildFieldMappingSummary(
  input: FinalizationToExecutionRecordBridgeInput,
): FinalizationToExecutionRecordFieldMappingSummary[] {
  const candidate = input.finalizationCandidate;
  const executionRecordImpact =
    input.actionDryRunResult?.impactSummary.executionRecordImpact;
  const finalNoteSource = input.finalSettlementNoteMatch
    ? "final_settlement_note_match"
    : "not_available";
  const candidateSource = candidate ? "finalization_candidate" : "not_available";
  const dryRunSource = executionRecordImpact ? "action_dry_run_result" : "not_available";

  const field = (
    name: FinalizationToExecutionRecordFieldName,
    source: FinalizationToExecutionRecordFieldMappingSummary["source"],
    available: boolean,
    targetPath: string,
    sourceValuePreview?: string | number | boolean | null,
  ): FinalizationToExecutionRecordFieldMappingSummary => ({
    field: name,
    source,
    targetPath,
    available,
    requiredForCandidateInput: true,
    requiresReview: false,
    sourceValuePreview,
  });

  return [
    field(
      "ticker",
      candidateSource,
      hasValue(candidate?.settlementSummary.instrument.ticker),
      "expectedInstrument.ticker",
      candidate?.settlementSummary.instrument.ticker,
    ),
    field(
      "side",
      candidateSource,
      Boolean(candidate?.settlementSummary.side),
      "expectedAction",
      candidate?.settlementSummary.side,
    ),
    field(
      "quantity",
      candidateSource,
      typeof candidate?.settlementSummary.quantity === "number",
      "expectedQuantity",
      candidate?.settlementSummary.quantity,
    ),
    field(
      "price",
      candidateSource,
      typeof candidate?.settlementSummary.executionPrice?.value === "number",
      "sourceBrokerExecutionResult.price",
      candidate?.settlementSummary.executionPrice?.value,
    ),
    field(
      "currency",
      candidateSource,
      hasValue(candidate?.settlementSummary.currency),
      "expectedInstrument.currency",
      candidate?.settlementSummary.currency,
    ),
    field(
      "fees",
      candidateSource,
      typeof candidate?.feeSummary.totalFees?.value === "number",
      "sourceBrokerExecutionResult.fees",
      candidate?.feeSummary.totalFees?.value,
    ),
    field(
      "commission",
      candidateSource,
      typeof candidate?.feeSummary.commission?.value === "number",
      "sourceBrokerExecutionResult.fees",
      candidate?.feeSummary.commission?.value,
    ),
    field(
      "fx_rate",
      candidateSource,
      (candidate?.fxSummary.fxRates.length ?? 0) > 0,
      "sourceBrokerExecutionResult.metadata.fxRate",
      candidate?.fxSummary.fxRates[0]?.rate,
    ),
    field(
      "gross_amount",
      candidateSource,
      typeof candidate?.settlementSummary.consideration?.value === "number",
      "sourceBrokerExecutionResult.grossAmount",
      candidate?.settlementSummary.consideration?.value,
    ),
    field(
      "net_amount",
      candidateSource,
      typeof candidate?.settlementSummary.totalAmount?.value === "number",
      "sourceBrokerExecutionResult.netAmount",
      candidate?.settlementSummary.totalAmount?.value,
    ),
    field(
      "broker_order_id",
      "broker_execution_result_candidate",
      hasValue(input.brokerExecutionResultCandidate?.brokerReferences.brokerOrderId),
      "brokerMetadata.brokerOrderId",
      input.brokerExecutionResultCandidate?.brokerReferences.brokerOrderId,
    ),
    field(
      "broker_confirmation_id",
      "broker_execution_result_candidate",
      hasValue(
        input.brokerExecutionResultCandidate?.brokerReferences
          .brokerConfirmationId,
      ),
      "brokerMetadata.brokerConfirmationId",
      input.brokerExecutionResultCandidate?.brokerReferences.brokerConfirmationId,
    ),
    field(
      "broker_reference",
      finalNoteSource,
      hasValue(candidate?.settlementSummary.noteReferenceNumber),
      "brokerMetadata.brokerReference",
      candidate?.settlementSummary.noteReferenceNumber,
    ),
    field(
      "execution_timestamp",
      candidateSource,
      hasValue(candidate?.settlementSummary.executionTimestamp),
      "brokerMetadata.confirmationTimestamp",
      candidate?.settlementSummary.executionTimestamp,
    ),
    field(
      "settlement_date",
      candidateSource,
      hasValue(candidate?.settlementSummary.settlementDate),
      "sourceBrokerExecutionResult.metadata.settlementDate",
      candidate?.settlementSummary.settlementDate,
    ),
    field(
      "payment_date",
      candidateSource,
      hasValue(candidate?.settlementSummary.settlementDate),
      "sourceBrokerExecutionResult.metadata.paymentDate",
      candidate?.settlementSummary.settlementDate,
    ),
    field(
      "final_note_reference",
      finalNoteSource,
      hasValue(candidate?.evidenceSummary.noteReferenceNumber),
      "sourceBrokerExecutionResult.brokerReference",
      candidate?.evidenceSummary.noteReferenceNumber,
    ),
    field(
      "source_evidence_type",
      finalNoteSource,
      Boolean(input.finalSettlementNoteMatch),
      "sourceBrokerExecutionResult.metadata.sourceEvidenceType",
      input.finalSettlementNoteMatch?.status,
    ),
    field(
      "broker_confirmation_status",
      "broker_execution_result_candidate",
      Boolean(input.brokerExecutionResultCandidate?.status),
      "sourceBrokerExecutionResult.status",
      input.brokerExecutionResultCandidate?.status,
    ),
    field(
      "finalization_status",
      candidateSource,
      Boolean(candidate?.status),
      "sourceBrokerExecutionResult.metadata.finalizationStatus",
      candidate?.status,
    ),
    field(
      "validation_status",
      "finalization_validation_result",
      Boolean(input.finalizationValidationResult?.status),
      "sourceBrokerExecutionResult.metadata.validationStatus",
      input.finalizationValidationResult?.status,
    ),
    field(
      "warnings",
      dryRunSource,
      Boolean(input.actionDryRunResult),
      "sourceBrokerExecutionResult.metadata.warnings",
      input.actionDryRunResult?.warnings.join(","),
    ),
    field(
      "blocked_reasons",
      dryRunSource,
      Boolean(input.actionDryRunResult),
      "sourceBrokerExecutionResult.metadata.blockedReasons",
      input.actionDryRunResult?.blockedReasons.join(","),
    ),
    field(
      "audit_correction_readiness",
      "audit_correction_metadata",
      Boolean(input.auditCorrectionMetadata),
      "auditContext",
      Boolean(input.auditCorrectionMetadata),
    ),
  ];
}

export function mapFinalizationToExecutionRecordBridge(
  input: FinalizationToExecutionRecordBridgeInput,
): FinalizationToExecutionRecordBridgeResult {
  const blockedReasons: FinalizationToExecutionRecordBridgeBlockedReason[] = [];
  const warnings: FinalizationToExecutionRecordBridgeWarning[] = [
    ...DEFAULT_BRIDGE_WARNINGS,
  ];
  const reviewItems: FinalizationToExecutionRecordBridgeReviewItem[] = [];
  const candidate = input.finalizationCandidate ?? null;
  const match =
    input.finalSettlementNoteMatch ??
    candidate?.sourceReferences.finalSettlementNoteMatchingResult ??
    null;

  if (!candidate) {
    pushUnique(blockedReasons, "missing_finalization_candidate");
  }
  if (!input.finalizationValidationResult) {
    pushUnique(blockedReasons, "missing_finalization_validation");
  }
  if (!input.transitionValidationResult) {
    pushUnique(blockedReasons, "missing_transition_validation");
  }
  if (!input.actionValidationResult) {
    pushUnique(blockedReasons, "missing_action_validation");
  }
  if (!input.actionDryRunResult) {
    pushUnique(blockedReasons, "missing_action_dry_run");
  }

  classifyMatch(match, blockedReasons, reviewItems);

  if (candidate?.status === "unsupported") {
    pushUnique(blockedReasons, "unsupported_source");
  }
  if (
    candidate?.evidenceSummary.sourceClassification === "preview_only" ||
    candidate?.evidenceSummary.sourceClassification === "dev_fixture" ||
    candidate?.evidenceSummary.sourceClassification === "mock_broker"
  ) {
    pushUnique(blockedReasons, "unsupported_source");
  }
  if (candidate && candidate.settlementSummary.broker !== "avanza") {
    pushUnique(blockedReasons, "unsupported_broker");
  }

  if (input.finalizationValidationResult?.status === "unsupported") {
    pushUnique(blockedReasons, "unsupported_source");
  }
  if (input.transitionValidationResult?.status === "unsupported") {
    pushUnique(blockedReasons, "unsupported_source");
  }
  if (input.actionValidationResult?.status === "unsupported") {
    pushUnique(blockedReasons, "unsupported_source");
  }

  if (candidate?.feeSummary.reviewRequired || candidate?.feeSummary.missingFeeData) {
    pushUnique(blockedReasons, "mismatched_fees");
    pushUnique(reviewItems, "fees_review");
  }
  if (candidate?.fxSummary.reviewRequired || candidate?.fxSummary.missingFxData) {
    pushUnique(blockedReasons, "mismatched_fx_rate");
    pushUnique(reviewItems, "fx_rate_review");
  }

  const sourceEvidenceFingerprint = candidateSourceFingerprint(candidate);
  const matchIdentity = finalNoteMatchIdentity(candidate, match);
  const brokerFingerprint = brokerResultFingerprint(input);
  const handoffPayloadFingerprint = handoffFingerprint(input);
  const finalizationCandidateFingerprint = candidate?.candidateId ?? null;
  const derivedExecutionRecordCandidateFingerprint = derivedIdentity(
    "execution_record_bridge_candidate",
    [
      sourceEvidenceFingerprint,
      matchIdentity,
      handoffPayloadFingerprint,
      finalizationCandidateFingerprint,
    ],
  );
  const derivedExecutionRecordIdempotencyKey = derivedIdentity(
    "finalization_bridge",
    [
      sourceEvidenceFingerprint,
      matchIdentity,
      handoffPayloadFingerprint,
      finalizationCandidateFingerprint,
    ],
  );
  const intendedExecutionRecordCandidateFingerprint =
    input.actionDryRunResult?.impactSummary.executionRecordImpact
      .proposedRecordFingerprint ??
    candidate?.executionRecordMetadata?.recordFingerprint ??
    input.existingExecutionRecordCandidateMetadata?.recordFingerprint ??
    derivedExecutionRecordCandidateFingerprint ??
    null;
  const intendedExecutionRecordIdempotencyKey =
    input.actionDryRunResult?.impactSummary.executionRecordImpact
      .proposedIdempotencyKey ??
    candidate?.executionRecordMetadata?.idempotencyKey ??
    input.existingExecutionRecordCandidateMetadata?.idempotencyKey ??
    derivedExecutionRecordIdempotencyKey ??
    null;

  if (
    !sourceEvidenceFingerprint ||
    !matchIdentity ||
    !finalizationCandidateFingerprint ||
    !handoffPayloadFingerprint
  ) {
    pushUnique(blockedReasons, "missing_idempotency_fingerprint");
    pushUnique(warnings, "idempotency_review_required");
    pushUnique(reviewItems, "idempotency_review");
  }

  if (!input.auditCorrectionMetadata) {
    pushUnique(blockedReasons, "missing_audit_correction_metadata");
    pushUnique(reviewItems, "audit_correction_review");
  }

  if (
    input.manualApprovalContext?.approvalRequired === true &&
    input.manualApprovalContext.approvalPresent !== true
  ) {
    pushUnique(blockedReasons, "manual_approval_missing");
    pushUnique(reviewItems, "manual_approval_review");
  }

  const unsupported =
    blockedReasons.includes("unsupported_source") ||
    blockedReasons.includes("unsupported_broker");
  const status = determineStatus({
    blockedReasons,
    reviewItems,
    unsupported,
  });
  const uniqueBlockedReasons = unique(blockedReasons);
  const uniqueWarnings = unique(warnings);
  const uniqueReviewItems = unique(reviewItems);
  const fieldMappingSummary = buildFieldMappingSummary(input);
  const missingFingerprintReasons =
    !sourceEvidenceFingerprint ||
    !matchIdentity ||
    !finalizationCandidateFingerprint ||
    !handoffPayloadFingerprint
      ? (["missing_idempotency_fingerprint"] satisfies FinalizationToExecutionRecordBridgeBlockedReason[])
      : [];
  const sourceEvidenceSummary: FinalizationToExecutionRecordSourceEvidenceSummary =
    {
      immediateBrokerReadback:
        input.immediateBrokerReadback ??
        candidate?.sourceReferences.provisionalImmediateReadbackEvidence ??
        null,
      brokerExecutionResultCandidate:
        input.brokerExecutionResultCandidate ??
        candidate?.sourceReferences.brokerExecutionResultCandidate ??
        null,
      finalSettlementNoteEvidence:
        candidate?.sourceReferences.finalSettlementNoteEvidence ?? null,
      finalSettlementNoteMatch: match,
      finalSettlementNoteMatchStatus: match?.status ?? null,
      sourceEvidenceFingerprint,
      brokerResultCandidateFingerprint: brokerFingerprint,
      finalSettlementNoteFingerprint:
        candidate?.evidenceSummary.finalNoteEvidenceFingerprint ?? null,
      finalSettlementNoteMatchIdentity: matchIdentity,
      handoffPayloadFingerprint,
      evidenceChainComplete: Boolean(
        candidate &&
          match &&
          sourceEvidenceFingerprint &&
          finalizationCandidateFingerprint,
      ),
      finalSettlementNoteMatched: match?.matched === true,
      provisionalEvidenceOnly: !match?.matched,
      warnings: uniqueWarnings,
      blockedReasons: uniqueBlockedReasons,
    };
  const idempotencySummary: FinalizationToExecutionRecordIdempotencySummary = {
    sourceEvidenceFingerprint,
    immediateReadbackIdentity:
      input.immediateBrokerReadback?.provenance.evidenceFingerprint ??
      candidate?.evidenceSummary.provisionalEvidenceFingerprint ??
      null,
    brokerExecutionResultCandidateFingerprint: brokerFingerprint,
    handoffPayloadFingerprint,
    finalSettlementNoteFingerprint:
      candidate?.evidenceSummary.finalNoteEvidenceFingerprint ?? null,
    finalSettlementNoteMatchIdentity: matchIdentity,
    finalizationCandidateFingerprint,
    finalizationValidationIdentity:
      input.finalizationValidationResult?.evaluatedAt ?? null,
    transitionValidationIdentity:
      input.transitionValidationResult?.evaluatedAt ?? null,
    actionValidationIdentity: input.actionValidationResult?.evaluatedAt ?? null,
    actionDryRunIdentity: input.actionDryRunResult?.evaluatedAt ?? null,
    intendedExecutionRecordCandidateFingerprint,
    intendedExecutionRecordIdempotencyKey,
    requiredFingerprintsPresent: missingFingerprintReasons.length === 0,
    duplicateCheckRequired: true,
    duplicateDetected: Boolean(input.existingExecutionRecordCandidateMetadata),
    duplicateOfRecordId: input.existingExecutionRecordCandidateMetadata?.recordId,
    retrySafe: missingFingerprintReasons.length === 0 && uniqueBlockedReasons.length === 0,
    mismatchRequiresReview: uniqueReviewItems.length > 0,
    missingFingerprintReasons,
  };
  const auditCorrectionSummary: FinalizationToExecutionRecordAuditCorrectionSummary =
    {
      auditRequiredBeforeWrite: true,
      auditMetadataPresent: Boolean(input.auditCorrectionMetadata?.auditRequired),
      correctionMetadataPresent: Boolean(
        input.auditCorrectionMetadata?.correctionRollbackRequired,
      ),
      beforeStateReference:
        input.auditCorrectionMetadata?.beforeStateReference ?? null,
      afterStateReference:
        input.auditCorrectionMetadata?.afterStateReference ?? null,
      sourceEvidenceReference:
        input.auditCorrectionMetadata?.sourceEvidenceReference ?? null,
      manualApprovalReference:
        input.manualApprovalContext?.approvalReference ?? null,
      duplicatePreventionReference:
        input.auditCorrectionMetadata?.duplicatePreventionReference ?? null,
      correctionStrategyReference:
        input.auditCorrectionMetadata?.correctionStrategyReference ?? null,
      rollbackMetadataReference: null,
      correctionEligible: Boolean(
        input.auditCorrectionMetadata?.correctionStrategyReference,
      ),
      rollbackMetadataRequired: true,
      auditAppendAttempted: false,
      rollbackAttempted: false,
      warnings: uniqueWarnings,
      blockedReasons: uniqueBlockedReasons,
    };
  const validationHandoffSummary: FinalizationToExecutionRecordValidationHandoffSummary =
    {
      finalizationCandidatePresent: Boolean(candidate),
      finalSettlementNoteMatchPresent: Boolean(match),
      finalizationValidationPresent: Boolean(input.finalizationValidationResult),
      finalizationValidationStatus:
        input.finalizationValidationResult?.status ?? null,
      transitionValidationPresent: Boolean(input.transitionValidationResult),
      transitionValidationStatus: input.transitionValidationResult?.status ?? null,
      actionValidationPresent: Boolean(input.actionValidationResult),
      actionValidationStatus: input.actionValidationResult?.status ?? null,
      actionDryRunPresent: Boolean(input.actionDryRunResult),
      actionDryRunStatus: input.actionDryRunResult?.status ?? null,
      unsupportedOrBlockedStatePresent:
        unsupported ||
        input.finalizationValidationResult?.status === "blocked" ||
        input.transitionValidationResult?.status === "blocked" ||
        input.actionValidationResult?.status === "blocked" ||
        input.actionDryRunResult?.status === "dry_run_blocked",
      manualApprovalRequired:
        input.manualApprovalContext?.approvalRequired === true,
      manualApprovalPresent:
        input.manualApprovalContext?.approvalPresent === true,
      bridgeOutputCandidateOnly: true,
      executableWriteCandidateProduced: false,
      blockedReasons: uniqueBlockedReasons,
      warnings: uniqueWarnings,
      reviewItems: uniqueReviewItems,
    };
  const targetSummary: FinalizationToExecutionRecordTargetSummary = {
    intendedExecutionRecordCandidateInputAvailable:
      status === "bridge_candidate_ready",
    intendedCreationInput: buildCreationInputDraft(
      input,
      sourceEvidenceFingerprint,
      intendedExecutionRecordIdempotencyKey,
    ),
    existingExecutionRecordCandidateMetadata:
      input.existingExecutionRecordCandidateMetadata ?? null,
    intendedExecutionRecordCandidateFingerprintInputs: unique(
      [
        sourceEvidenceFingerprint,
        matchIdentity,
        brokerFingerprint,
        handoffPayloadFingerprint,
        finalizationCandidateFingerprint,
        intendedExecutionRecordCandidateFingerprint,
      ].filter(hasValue),
    ),
    sourceEvidenceBlockReady: Boolean(sourceEvidenceFingerprint),
    brokerConfirmationBlockReady: Boolean(
      input.brokerExecutionResultCandidate ?? candidate?.sourceReferences.brokerExecutionResultCandidate,
    ),
    settlementNoteBlockReady: Boolean(match?.matched),
    finalizationBlockReady: Boolean(candidate),
    validationBlockReady: Boolean(
      input.finalizationValidationResult &&
        input.transitionValidationResult &&
        input.actionValidationResult,
    ),
    dryRunBlockReady: Boolean(input.actionDryRunResult),
    auditCorrectionBlockReady: Boolean(input.auditCorrectionMetadata),
    candidateOnly: true,
    mappingOnly: true,
    safeToCreateExecutionRecord: false,
    safeToPersist: false,
  };

  return {
    contractVersion: FINALIZATION_TO_EXECUTION_RECORD_BRIDGE_CONTRACT_VERSION,
    evaluatedAt: input.requestedAt,
    status,
    input,
    sourceEvidenceSummary,
    targetSummary,
    fieldMappingSummary,
    idempotencySummary,
    auditCorrectionSummary,
    validationHandoffSummary,
    blockedReasons: uniqueBlockedReasons,
    warnings: uniqueWarnings,
    reviewItems: uniqueReviewItems,
    safetyPolicy:
      input.safetyPolicy ??
      FINALIZATION_TO_EXECUTION_RECORD_BRIDGE_DEFAULT_SAFETY_POLICY,
    mappingOnly: true,
    candidateOnly: true,
    bridgeExecuted: false,
    mapperImplemented: false,
    validatorImplemented: false,
    safeToCreateExecutionRecord: false,
    safeToPersist: false,
    safeToFinalize: false,
    safeToUpdateStats: false,
    safeToAppendAudit: false,
    safeToRollback: false,
    safeToMutateTrade: false,
    safeToRunBrokerAction: false,
    automaticModeAllowed: false,
    executionRecordCreationAttempted: false,
    persistenceAttempted: false,
    finalizationActionAttempted: false,
    finalizationAttempted: false,
    statsUpdateAttempted: false,
    auditAppendAttempted: false,
    rollbackAttempted: false,
    tradeMutationAttempted: false,
    browserAutomationAttempted: false,
    avanzaAutomationAttempted: false,
    brokerAutomationAttempted: false,
  };
}
