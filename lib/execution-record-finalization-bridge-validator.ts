import {
  FINALIZATION_TO_EXECUTION_RECORD_BRIDGE_STATUSES,
  type FinalizationToExecutionRecordBridgeResult,
} from "@/lib/finalization-to-execution-record-bridge-contract";
import {
  EXECUTION_RECORD_FINALIZATION_BRIDGE_DEFAULT_AUTHORITY_FLAGS,
  EXECUTION_RECORD_FINALIZATION_BRIDGE_FINGERPRINT_COMPONENTS,
  EXECUTION_RECORD_FINALIZATION_BRIDGE_STATUS_METADATA,
  EXECUTION_RECORD_FINALIZATION_BRIDGE_VALIDATOR_CONTRACT_VERSION,
  type ExecutionRecordFinalizationBridgeAuditCorrectionValidationSummary,
  type ExecutionRecordFinalizationBridgeAuthorityFlags,
  type ExecutionRecordFinalizationBridgeBlockedReason,
  type ExecutionRecordFinalizationBridgeDecisionRecommendation,
  type ExecutionRecordFinalizationBridgeFieldValidationStatus,
  type ExecutionRecordFinalizationBridgeFingerprintComponent,
  type ExecutionRecordFinalizationBridgeIdempotencyValidationSummary,
  type ExecutionRecordFinalizationBridgeReviewItem,
  type ExecutionRecordFinalizationBridgeSafetyPolicyValidationSummary,
  type ExecutionRecordFinalizationBridgeSummaryValidation,
  type ExecutionRecordFinalizationBridgeValidatedFieldSummary,
  type ExecutionRecordFinalizationBridgeValidationInput,
  type ExecutionRecordFinalizationBridgeValidationResult,
  type ExecutionRecordFinalizationBridgeValidationStatus,
  type ExecutionRecordFinalizationBridgeWarning,
} from "@/lib/execution-record-finalization-bridge-validator-contract";

const DEFAULT_VALIDATOR_WARNINGS: ExecutionRecordFinalizationBridgeWarning[] = [
  "validation_only",
  "bridge_candidate_ready_not_write_approval",
  "dry_run_proposed_impact_not_write",
  "candidate_only",
  "mapping_only",
  "audit_required_before_write",
  "duplicate_check_required",
  "stats_update_out_of_scope",
  "trade_mutation_out_of_scope",
];

const AUTHORITY_FLAG_KEYS = [
  "safeToCreateExecutionRecord",
  "safeToPersist",
  "safeToFinalize",
  "safeToUpdateStats",
  "safeToAppendAudit",
  "safeToRollback",
  "safeToMutateTrade",
  "safeToRunBrokerAction",
  "automaticModeAllowed",
  "executionRecordCreationAttempted",
  "persistenceAttempted",
  "finalizationAttempted",
  "statsUpdateAttempted",
  "auditAppendAttempted",
  "rollbackAttempted",
  "tradeMutationAttempted",
  "brokerAutomationAttempted",
  "avanzaAutomationAttempted",
  "browserAutomationAttempted",
] as const;

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

function bridgeValue(
  bridgeResult: FinalizationToExecutionRecordBridgeResult | null,
  key: (typeof AUTHORITY_FLAG_KEYS)[number],
): unknown {
  if (!bridgeResult) {
    return false;
  }

  return (bridgeResult as unknown as Record<string, unknown>)[key];
}

function bridgeSafetyPolicyValue(
  bridgeResult: FinalizationToExecutionRecordBridgeResult | null,
  key: string,
): unknown {
  if (!bridgeResult?.safetyPolicy) {
    return false;
  }

  return (bridgeResult.safetyPolicy as unknown as Record<string, unknown>)[key];
}

function unexpectedTrueAuthorityFlags(
  bridgeResult: FinalizationToExecutionRecordBridgeResult | null,
): string[] {
  return AUTHORITY_FLAG_KEYS.filter((key) => bridgeValue(bridgeResult, key) === true);
}

function unexpectedTrueSafetyPolicyFlags(
  bridgeResult: FinalizationToExecutionRecordBridgeResult | null,
): string[] {
  const keys = [
    "safeToCreateExecutionRecord",
    "safeToPersist",
    "safeToFinalize",
    "safeToUpdateStats",
    "safeToAppendAudit",
    "safeToRollback",
    "safeToMutateTrade",
    "safeToRunBrokerAction",
    "automaticModeAllowed",
    "bridgeImplementationEnabled",
    "mapperImplementationEnabled",
    "validatorImplementationEnabled",
    "executionRecordCreationEnabled",
    "persistenceImplementationEnabled",
    "finalizationActionImplementationEnabled",
    "statsUpdateEnabled",
    "auditAppendEnabled",
    "rollbackImplementationEnabled",
    "tradeMutationEnabled",
    "browserAutomationEnabled",
    "avanzaAutomationEnabled",
    "brokerAutomationEnabled",
  ];

  return keys.filter((key) => bridgeSafetyPolicyValue(bridgeResult, key) === true);
}

function requiredSummaryMissing(
  bridgeResult: FinalizationToExecutionRecordBridgeResult | null,
): ExecutionRecordFinalizationBridgeBlockedReason[] {
  if (!bridgeResult) {
    return [
      "missing_source_evidence_summary",
      "missing_target_summary",
      "missing_field_mapping_summary",
      "missing_idempotency_summary",
      "missing_audit_correction_summary",
      "missing_validation_handoff_summary",
    ];
  }

  const reasons: ExecutionRecordFinalizationBridgeBlockedReason[] = [];

  if (!bridgeResult.sourceEvidenceSummary) {
    reasons.push("missing_source_evidence_summary");
  }
  if (!bridgeResult.targetSummary) {
    reasons.push("missing_target_summary");
  }
  if (!bridgeResult.fieldMappingSummary || bridgeResult.fieldMappingSummary.length === 0) {
    reasons.push("missing_field_mapping_summary");
  }
  if (!bridgeResult.idempotencySummary) {
    reasons.push("missing_idempotency_summary");
  }
  if (!bridgeResult.auditCorrectionSummary) {
    reasons.push("missing_audit_correction_summary");
  }
  if (!bridgeResult.validationHandoffSummary) {
    reasons.push("missing_validation_handoff_summary");
  }

  return reasons;
}

function mapBridgeBlockedReasons(
  bridgeResult: FinalizationToExecutionRecordBridgeResult | null,
): ExecutionRecordFinalizationBridgeBlockedReason[] {
  const bridgeReasons = bridgeResult?.blockedReasons ?? [];
  const reasons: ExecutionRecordFinalizationBridgeBlockedReason[] = [];

  for (const reason of bridgeReasons) {
    if (reason === "unsupported_source") {
      pushUnique(reasons, "unsupported_source");
    }
    if (reason === "unsupported_broker") {
      pushUnique(reasons, "unsupported_broker");
    }
    if (
      reason === "mismatched_amount" ||
      reason === "mismatched_quantity" ||
      reason === "mismatched_currency" ||
      reason === "mismatched_fees" ||
      reason === "mismatched_fx_rate"
    ) {
      pushUnique(reasons, "field_mismatch");
    }
    if (reason === "manual_approval_missing") {
      pushUnique(reasons, "manual_approval_missing");
    }
    if (reason === "missing_audit_correction_metadata") {
      pushUnique(reasons, "audit_correction_metadata_missing");
    }
    if (reason === "missing_idempotency_fingerprint") {
      pushUnique(reasons, "missing_required_fingerprint");
    }
  }

  return reasons;
}

function presentFingerprintComponents(
  bridgeResult: FinalizationToExecutionRecordBridgeResult | null,
): ExecutionRecordFinalizationBridgeFingerprintComponent[] {
  const idempotency = bridgeResult?.idempotencySummary;
  const present: ExecutionRecordFinalizationBridgeFingerprintComponent[] = [];

  if (hasValue(idempotency?.sourceEvidenceFingerprint)) {
    present.push("source_evidence_fingerprint");
  }
  if (hasValue(idempotency?.finalSettlementNoteMatchIdentity)) {
    present.push("final_settlement_note_match_identity");
  }
  if (hasValue(idempotency?.handoffPayloadFingerprint)) {
    present.push("handoff_payload_fingerprint");
  }
  if (hasValue(idempotency?.finalizationCandidateFingerprint)) {
    present.push("finalization_candidate_fingerprint");
  }
  if (hasValue(idempotency?.intendedExecutionRecordCandidateFingerprint)) {
    present.push("intended_execution_record_candidate_fingerprint");
  }
  if (hasValue(idempotency?.intendedExecutionRecordIdempotencyKey)) {
    present.push("intended_execution_record_idempotency_key");
  }

  return present;
}

function buildValidatedFieldSummary(
  bridgeResult: FinalizationToExecutionRecordBridgeResult | null,
): ExecutionRecordFinalizationBridgeValidatedFieldSummary[] {
  return (bridgeResult?.fieldMappingSummary ?? []).map((mapping) => {
    const missing = mapping.requiredForCandidateInput && !mapping.available;
    const mismatch = mapping.requiresReview || Boolean(mapping.blockedReason);
    const status: ExecutionRecordFinalizationBridgeFieldValidationStatus = missing
      ? "field_missing"
      : mismatch
        ? "field_mismatched"
        : "field_valid";

    return {
      field: mapping.field,
      status,
      sourceMapping: mapping,
      requiredForReadyBridge: mapping.requiredForCandidateInput,
      available: mapping.available,
      consistent: !mismatch,
      sourceValuePreview: mapping.sourceValuePreview,
      targetValuePreview: mapping.targetValuePreview,
      blockedReason: mismatch ? "field_mismatch" : null,
      warning: null,
      reviewItem: mismatch ? "field_mapping_review" : null,
      details: null,
    };
  });
}

function determineStatus(args: {
  bridgeResult: FinalizationToExecutionRecordBridgeResult | null;
  invalidStatus: boolean;
  authorityViolation: boolean;
  missingSummaries: ExecutionRecordFinalizationBridgeBlockedReason[];
  blockedReasons: ExecutionRecordFinalizationBridgeBlockedReason[];
  reviewItems: ExecutionRecordFinalizationBridgeReviewItem[];
}): ExecutionRecordFinalizationBridgeValidationStatus {
  if (!args.bridgeResult) {
    return "bridge_validation_blocked";
  }

  if (
    args.invalidStatus ||
    args.authorityViolation ||
    args.missingSummaries.includes("missing_source_evidence_summary") ||
    args.missingSummaries.includes("missing_target_summary") ||
    args.missingSummaries.includes("missing_field_mapping_summary") ||
    args.missingSummaries.includes("missing_validation_handoff_summary")
  ) {
    return "bridge_validation_invalid";
  }

  if (
    args.bridgeResult.status === "bridge_candidate_unsupported" ||
    args.blockedReasons.includes("unsupported_source") ||
    args.blockedReasons.includes("unsupported_broker")
  ) {
    return "bridge_validation_unsupported";
  }

  if (
    args.bridgeResult.status === "bridge_candidate_blocked" ||
    args.blockedReasons.includes("bridge_ready_with_blocked_reasons") ||
    args.blockedReasons.includes("field_mismatch") ||
    args.blockedReasons.includes("manual_approval_missing") ||
    args.blockedReasons.includes("conflicting_fingerprint") ||
    args.blockedReasons.length > 0
  ) {
    return "bridge_validation_blocked";
  }

  if (
    args.bridgeResult.status === "bridge_candidate_needs_review" ||
    args.reviewItems.length > 0
  ) {
    return "bridge_validation_needs_review";
  }

  return "bridge_validation_valid";
}

function decisionForStatus(
  status: ExecutionRecordFinalizationBridgeValidationStatus,
): ExecutionRecordFinalizationBridgeDecisionRecommendation {
  return EXECUTION_RECORD_FINALIZATION_BRIDGE_STATUS_METADATA[status]
    .decisionRecommendation;
}

export function validateExecutionRecordFinalizationBridge(
  input: ExecutionRecordFinalizationBridgeValidationInput,
): ExecutionRecordFinalizationBridgeValidationResult {
  const bridgeResult = input.bridgeResult ?? null;
  const blockedReasons: ExecutionRecordFinalizationBridgeBlockedReason[] = [];
  const warnings: ExecutionRecordFinalizationBridgeWarning[] = [
    ...DEFAULT_VALIDATOR_WARNINGS,
  ];
  const reviewItems: ExecutionRecordFinalizationBridgeReviewItem[] = [];

  if (!bridgeResult) {
    pushUnique(blockedReasons, "missing_bridge_result");
  }

  const invalidStatus = Boolean(
    bridgeResult &&
      !FINALIZATION_TO_EXECUTION_RECORD_BRIDGE_STATUSES.includes(
        bridgeResult.status,
      ),
  );

  if (invalidStatus) {
    pushUnique(blockedReasons, "invalid_bridge_status");
  }

  for (const reason of requiredSummaryMissing(bridgeResult)) {
    pushUnique(blockedReasons, reason);
  }

  for (const reason of mapBridgeBlockedReasons(bridgeResult)) {
    pushUnique(blockedReasons, reason);
  }

  if (bridgeResult?.status === "bridge_candidate_ready" && bridgeResult.blockedReasons.length > 0) {
    pushUnique(blockedReasons, "bridge_ready_with_blocked_reasons");
  }

  if (
    bridgeResult?.status === "bridge_candidate_ready" &&
    requiredSummaryMissing(bridgeResult).length > 0
  ) {
    pushUnique(blockedReasons, "bridge_ready_with_missing_required_summary");
  }

  const presentFingerprints = presentFingerprintComponents(bridgeResult);
  const missingFingerprints =
    EXECUTION_RECORD_FINALIZATION_BRIDGE_FINGERPRINT_COMPONENTS.filter(
      (component) => !presentFingerprints.includes(component),
    );
  const duplicateDetected = Boolean(
    bridgeResult?.idempotencySummary?.duplicateDetected,
  );
  const conflictingFingerprints = duplicateDetected
    ? (["intended_execution_record_candidate_fingerprint"] satisfies ExecutionRecordFinalizationBridgeFingerprintComponent[])
    : [];

  if (
    bridgeResult?.idempotencySummary &&
    (!bridgeResult.idempotencySummary.requiredFingerprintsPresent ||
      missingFingerprints.length > 0)
  ) {
    pushUnique(blockedReasons, "missing_required_fingerprint");
    pushUnique(warnings, "idempotency_review_required");
    pushUnique(reviewItems, "idempotency_review");
  }

  if (conflictingFingerprints.length > 0) {
    pushUnique(blockedReasons, "conflicting_fingerprint");
    pushUnique(reviewItems, "duplicate_review");
  }

  if (
    bridgeResult?.sourceEvidenceSummary?.finalSettlementNoteMatched &&
    !hasValue(bridgeResult.idempotencySummary?.finalSettlementNoteMatchIdentity)
  ) {
    pushUnique(blockedReasons, "missing_final_settlement_note_match_identity");
    pushUnique(reviewItems, "final_settlement_note_match_review");
  }

  if (bridgeResult?.auditCorrectionSummary?.auditMetadataPresent === false) {
    pushUnique(blockedReasons, "audit_correction_metadata_missing");
    pushUnique(reviewItems, "audit_correction_review");
  }

  if (
    bridgeResult?.validationHandoffSummary?.manualApprovalRequired &&
    !bridgeResult.validationHandoffSummary.manualApprovalPresent
  ) {
    pushUnique(blockedReasons, "manual_approval_missing");
    pushUnique(reviewItems, "manual_approval_review");
  }

  const validatedFieldSummary = buildValidatedFieldSummary(bridgeResult);

  if (
    validatedFieldSummary.some(
      (field) =>
        field.status === "field_mismatched",
    )
  ) {
    pushUnique(blockedReasons, "field_mismatch");
    pushUnique(reviewItems, "field_mapping_review");
  }

  for (const reviewItem of bridgeResult?.reviewItems ?? []) {
    if (reviewItem === "final_settlement_note_match_review") {
      pushUnique(reviewItems, "final_settlement_note_match_review");
    }
    if (reviewItem === "idempotency_review") {
      pushUnique(reviewItems, "idempotency_review");
    }
    if (reviewItem === "audit_correction_review") {
      pushUnique(reviewItems, "audit_correction_review");
    }
    if (reviewItem === "manual_approval_review") {
      pushUnique(reviewItems, "manual_approval_review");
    }
    if (
      reviewItem === "amount_review" ||
      reviewItem === "quantity_review" ||
      reviewItem === "currency_review" ||
      reviewItem === "fees_review" ||
      reviewItem === "fx_rate_review"
    ) {
      pushUnique(reviewItems, "field_mapping_review");
    }
  }

  const unexpectedBridgeAuthorityFlagNames =
    unexpectedTrueAuthorityFlags(bridgeResult);
  const unexpectedPolicyAuthorityFlags =
    unexpectedTrueSafetyPolicyFlags(bridgeResult);
  const unexpectedAuthorityFlags = unique([
    ...unexpectedBridgeAuthorityFlagNames,
    ...unexpectedPolicyAuthorityFlags,
  ]);
  const authorityViolation = unexpectedAuthorityFlags.length > 0;

  if (authorityViolation) {
    pushUnique(blockedReasons, "safety_policy_authority_violation");
    pushUnique(blockedReasons, "write_authority_not_allowed");
    pushUnique(reviewItems, "safety_policy_review");
  }

  const missingSummaries = requiredSummaryMissing(bridgeResult);
  const uniqueBlockedReasons = unique(blockedReasons);
  const uniqueWarnings = unique(warnings);
  const uniqueReviewItems = unique(reviewItems);
  const status = determineStatus({
    bridgeResult,
    invalidStatus,
    authorityViolation,
    missingSummaries,
    blockedReasons: uniqueBlockedReasons,
    reviewItems: uniqueReviewItems,
  });
  const authorityFlags: ExecutionRecordFinalizationBridgeAuthorityFlags = {
    ...EXECUTION_RECORD_FINALIZATION_BRIDGE_DEFAULT_AUTHORITY_FLAGS,
  };
  const summaryValidation: ExecutionRecordFinalizationBridgeSummaryValidation = {
    sourceEvidenceSummary: bridgeResult?.sourceEvidenceSummary ?? null,
    targetSummary: bridgeResult?.targetSummary ?? null,
    fieldMappingSummary: bridgeResult?.fieldMappingSummary ?? null,
    idempotencySummary: bridgeResult?.idempotencySummary ?? null,
    auditCorrectionSummary: bridgeResult?.auditCorrectionSummary ?? null,
    validationHandoffSummary: bridgeResult?.validationHandoffSummary ?? null,
    sourceEvidenceSummaryPresent: Boolean(bridgeResult?.sourceEvidenceSummary),
    targetSummaryPresent: Boolean(bridgeResult?.targetSummary),
    fieldMappingSummaryPresent: Boolean(
      bridgeResult?.fieldMappingSummary && bridgeResult.fieldMappingSummary.length > 0,
    ),
    idempotencySummaryPresent: Boolean(bridgeResult?.idempotencySummary),
    auditCorrectionSummaryPresent: Boolean(bridgeResult?.auditCorrectionSummary),
    validationHandoffSummaryPresent: Boolean(
      bridgeResult?.validationHandoffSummary,
    ),
    blockedReasons: uniqueBlockedReasons,
    warnings: uniqueWarnings,
    reviewItems: uniqueReviewItems,
  };
  const idempotencyValidationSummary: ExecutionRecordFinalizationBridgeIdempotencyValidationSummary =
    {
      sourceSummary: bridgeResult?.idempotencySummary ?? null,
      requiredFingerprintComponents: [
        ...EXECUTION_RECORD_FINALIZATION_BRIDGE_FINGERPRINT_COMPONENTS,
      ],
      presentFingerprintComponents: presentFingerprints,
      missingFingerprintComponents: missingFingerprints,
      conflictingFingerprintComponents: conflictingFingerprints,
      requiredFingerprintsPresent:
        missingFingerprints.length === 0 &&
        bridgeResult?.idempotencySummary?.requiredFingerprintsPresent === true,
      finalSettlementNoteMatchIdentityPresent: hasValue(
        bridgeResult?.idempotencySummary?.finalSettlementNoteMatchIdentity,
      ),
      duplicateCheckRequired: true,
      duplicateDetected,
      retrySafe: Boolean(bridgeResult?.idempotencySummary?.retrySafe),
      mismatchRequiresReview:
        uniqueReviewItems.length > 0 ||
        Boolean(bridgeResult?.idempotencySummary?.mismatchRequiresReview),
      safeForValidationOnly: true,
      safeForWrite: false,
      blockedReason: uniqueBlockedReasons.includes("missing_required_fingerprint")
        ? "missing_required_fingerprint"
        : uniqueBlockedReasons.includes("conflicting_fingerprint")
          ? "conflicting_fingerprint"
          : null,
      warning: missingFingerprints.length > 0 ? "idempotency_review_required" : null,
      reviewItem:
        missingFingerprints.length > 0 || conflictingFingerprints.length > 0
          ? "idempotency_review"
          : null,
    };
  const auditCorrectionValidationSummary: ExecutionRecordFinalizationBridgeAuditCorrectionValidationSummary =
    {
      sourceSummary: bridgeResult?.auditCorrectionSummary ?? null,
      auditMetadataPresent:
        bridgeResult?.auditCorrectionSummary?.auditMetadataPresent === true,
      correctionMetadataPresent:
        bridgeResult?.auditCorrectionSummary?.correctionMetadataPresent === true,
      sourceEvidenceTraceable: hasValue(
        bridgeResult?.auditCorrectionSummary?.sourceEvidenceReference,
      ),
      beforeStateReferencePresent: hasValue(
        bridgeResult?.auditCorrectionSummary?.beforeStateReference,
      ),
      afterStateReferencePresent: hasValue(
        bridgeResult?.auditCorrectionSummary?.afterStateReference,
      ),
      manualApprovalRequired:
        bridgeResult?.validationHandoffSummary?.manualApprovalRequired === true,
      manualApprovalPresent:
        bridgeResult?.validationHandoffSummary?.manualApprovalPresent === true,
      rollbackMetadataRequired:
        bridgeResult?.auditCorrectionSummary?.rollbackMetadataRequired === true,
      rollbackMetadataPresent: hasValue(
        bridgeResult?.auditCorrectionSummary?.rollbackMetadataReference,
      ),
      readyForFutureWriteBoundary: false,
      auditAppendAttempted: false,
      rollbackAttempted: false,
      safeForValidationOnly: true,
      blockedReason: uniqueBlockedReasons.includes(
        "audit_correction_metadata_missing",
      )
        ? "audit_correction_metadata_missing"
        : null,
      warning: "audit_required_before_write",
      reviewItem: uniqueReviewItems.includes("audit_correction_review")
        ? "audit_correction_review"
        : null,
    };
  const safetyPolicyValidationSummary: ExecutionRecordFinalizationBridgeSafetyPolicyValidationSummary =
    {
      validationOnly: true,
      safetyPolicyPresent: Boolean(bridgeResult?.safetyPolicy),
      candidateOnly: bridgeResult?.candidateOnly === true,
      mappingOnly: bridgeResult?.mappingOnly === true,
      allAuthorityFlagsFalse: !authorityViolation,
      automaticModeAllowed: false,
      authorityFlags,
      unexpectedTrueAuthorityFlags: unexpectedAuthorityFlags,
      validatorImplementationEnabled: false,
      executionRecordCreationEnabled: false,
      persistenceImplementationEnabled: false,
      finalizationImplementationEnabled: false,
      statsUpdateEnabled: false,
      auditAppendEnabled: false,
      rollbackImplementationEnabled: false,
      tradeMutationEnabled: false,
      brokerAutomationEnabled: false,
      avanzaAutomationEnabled: false,
      browserAutomationEnabled: false,
      blockedReason: authorityViolation
        ? "safety_policy_authority_violation"
        : null,
      warning: "validation_only",
      reviewItem: authorityViolation ? "safety_policy_review" : null,
    };

  return {
    contractVersion:
      EXECUTION_RECORD_FINALIZATION_BRIDGE_VALIDATOR_CONTRACT_VERSION,
    evaluatedAt: input.requestedAt,
    status,
    decisionRecommendation: decisionForStatus(status),
    input,
    bridgeResult,
    summaryValidation,
    validatedFieldSummary,
    idempotencyValidationSummary,
    auditCorrectionValidationSummary,
    safetyPolicyValidationSummary,
    blockedReasons: uniqueBlockedReasons,
    warnings: uniqueWarnings,
    reviewItems: uniqueReviewItems,
    authorityFlags,
    validationOnly: true,
    safeToCreateExecutionRecord: false,
    safeToPersist: false,
    safeToFinalize: false,
    safeToUpdateStats: false,
    safeToAppendAudit: false,
    safeToRollback: false,
    safeToMutateTrade: false,
    safeToRunBrokerAction: false,
    automaticModeAllowed: false,
    validatorImplemented: false,
    executionRecordCreationAttempted: false,
    persistenceAttempted: false,
    finalizationAttempted: false,
    statsUpdateAttempted: false,
    auditAppendAttempted: false,
    rollbackAttempted: false,
    tradeMutationAttempted: false,
    brokerAutomationAttempted: false,
    avanzaAutomationAttempted: false,
    browserAutomationAttempted: false,
  };
}
