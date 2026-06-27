import type {
  ActualPersistenceValidatorBoundaryCallImplementationDecisionRecommendation,
  ActualPersistenceValidatorBoundaryCallImplementationResult,
  ActualPersistenceValidatorBoundaryCallImplementationStatus,
} from "@/lib/execution-record-actual-persistence-validator-boundary-call-implementation-contract";
import type {
  ActualPersistenceValidatorBoundaryCallValidationResult,
} from "@/lib/execution-record-actual-persistence-validator-boundary-call-validator-contract";
import type {
  ExecutionRecordDuplicateMatch,
  ExecutionRecordPersistenceInput,
  ExecutionRecordPersistenceResult,
  ExecutionRecordPersistenceSchemaReference,
} from "@/lib/execution-record-persistence-contract";
import type { FinalizationActionValidatorManualApprovalContext } from "@/lib/finalization-action-validator-contract";

// Future insert-route readiness boundary contract metadata only. These types
// describe what a later readiness validator must prove before an
// execution-record insert route call may even be prepared. They do not
// implement readiness logic, call insert routes, create execution records,
// persist, write Supabase/localStorage, append audit records, update stats/PnL,
// roll back, mutate trades, wire UI, capture browser/Avanza behavior, run
// broker actions, or enable automatic mode.

export const EXECUTION_RECORD_INSERT_ROUTE_READINESS_BOUNDARY_CONTRACT_VERSION =
  "execution_record_insert_route_readiness_boundary_v1" as const;

export type ExecutionRecordInsertRouteReadinessBoundaryContractVersion =
  typeof EXECUTION_RECORD_INSERT_ROUTE_READINESS_BOUNDARY_CONTRACT_VERSION;

export const EXECUTION_RECORD_INSERT_ROUTE_READINESS_STATUSES = [
  "insert_route_readiness_ready",
  "insert_route_readiness_blocked",
  "insert_route_readiness_needs_review",
  "insert_route_readiness_invalid",
  "insert_route_readiness_unsupported",
] as const;

export type ExecutionRecordInsertRouteReadinessStatus =
  (typeof EXECUTION_RECORD_INSERT_ROUTE_READINESS_STATUSES)[number];

export const EXECUTION_RECORD_INSERT_ROUTE_READINESS_DECISION_RECOMMENDATIONS =
  [
    "may_prepare_insert_route_call_only",
    "needs_manual_review",
    "blocked_do_not_call_insert_route",
    "invalid_do_not_call_insert_route",
    "unsupported_do_not_call_insert_route",
  ] as const;

export type ExecutionRecordInsertRouteReadinessDecisionRecommendation =
  (typeof EXECUTION_RECORD_INSERT_ROUTE_READINESS_DECISION_RECOMMENDATIONS)[number];

export const EXECUTION_RECORD_INSERT_ROUTE_READINESS_BLOCKED_REASONS = [
  "missing_actual_validator_wrapper_result",
  "actual_validator_wrapper_not_validated",
  "actual_validator_decision_not_do_not_insert",
  "actual_validator_output_has_errors",
  "missing_normalized_persistence_input",
  "generated_types_absent_or_unknown",
  "migration_application_not_proven",
  "schema_readiness_absent_or_unknown",
  "missing_rls_security_proof",
  "missing_server_only_write_boundary",
  "missing_duplicate_prevention_metadata",
  "missing_idempotency_metadata",
  "missing_audit_correction_metadata",
  "missing_source_evidence",
  "missing_manual_approval",
  "missing_dry_run_route_status",
  "production_route_not_separated_from_dry_run",
  "automatic_mode_not_allowed",
  "write_authority_not_allowed_in_this_design",
  "trade_mutation_not_allowed",
  "broker_or_avanza_action_not_allowed",
] as const;

export type ExecutionRecordInsertRouteReadinessBlockedReason =
  (typeof EXECUTION_RECORD_INSERT_ROUTE_READINESS_BLOCKED_REASONS)[number];

export const EXECUTION_RECORD_INSERT_ROUTE_READINESS_WARNINGS = [
  "contract_only",
  "readiness_not_implemented",
  "insert_route_not_called",
  "insert_readiness_not_insert_execution",
  "dry_run_route_not_production_route",
  "actual_validator_do_not_insert_required",
  "generated_types_required_before_insert_readiness",
  "migration_application_required_before_insert_readiness",
  "rls_security_required_before_insert_readiness",
  "server_only_boundary_required_before_insert_readiness",
  "duplicate_prevention_required_before_insert_readiness",
  "audit_required_before_post_insert_mutation",
  "stats_update_out_of_scope",
  "trade_mutation_out_of_scope",
  "broker_avanza_action_out_of_scope",
] as const;

export type ExecutionRecordInsertRouteReadinessWarning =
  (typeof EXECUTION_RECORD_INSERT_ROUTE_READINESS_WARNINGS)[number];

export const EXECUTION_RECORD_INSERT_ROUTE_READINESS_REVIEW_ITEMS = [
  "actual_validator_wrapper_result_review",
  "actual_validator_output_review",
  "normalized_persistence_input_review",
  "schema_readiness_review",
  "generated_types_review",
  "migration_application_review",
  "rls_security_review",
  "server_only_write_boundary_review",
  "idempotency_fingerprint_review",
  "duplicate_prevention_review",
  "audit_correction_review",
  "evidence_provenance_review",
  "manual_approval_review",
  "dry_run_route_review",
  "production_route_separation_review",
  "authority_flags_review",
  "post_insert_boundary_review",
  "future_insert_route_boundary_review",
] as const;

export type ExecutionRecordInsertRouteReadinessReviewItem =
  (typeof EXECUTION_RECORD_INSERT_ROUTE_READINESS_REVIEW_ITEMS)[number];

export type ExecutionRecordInsertRouteReadinessSafetyPolicy = {
  contractOnly: true;
  readinessOnly: true;
  insertRouteCallImplemented: false;
  safeToCallInsertRoute: false;
  safeToCreateExecutionRecord: false;
  safeToPersist: false;
  safeToFinalize: false;
  safeToAppendAudit: false;
  safeToUpdateStats: false;
  safeToRollback: false;
  safeToMutateTrade: false;
  safeToRunBrokerAction: false;
  safeToRunAvanzaBrowserAction: false;
  automaticModeAllowed: false;
  insertRouteCallAttempted: false;
  executionRecordCreationAttempted: false;
  persistenceAttempted: false;
  finalizationAttempted: false;
  auditAppendAttempted: false;
  statsUpdateAttempted: false;
  rollbackAttempted: false;
  tradeMutationAttempted: false;
  brokerAutomationAttempted: false;
  avanzaAutomationAttempted: false;
  browserAutomationAttempted: false;
  policyReason: string;
};

export const EXECUTION_RECORD_INSERT_ROUTE_READINESS_DEFAULT_SAFETY_POLICY = {
  contractOnly: true,
  readinessOnly: true,
  insertRouteCallImplemented: false,
  safeToCallInsertRoute: false,
  safeToCreateExecutionRecord: false,
  safeToPersist: false,
  safeToFinalize: false,
  safeToAppendAudit: false,
  safeToUpdateStats: false,
  safeToRollback: false,
  safeToMutateTrade: false,
  safeToRunBrokerAction: false,
  safeToRunAvanzaBrowserAction: false,
  automaticModeAllowed: false,
  insertRouteCallAttempted: false,
  executionRecordCreationAttempted: false,
  persistenceAttempted: false,
  finalizationAttempted: false,
  auditAppendAttempted: false,
  statsUpdateAttempted: false,
  rollbackAttempted: false,
  tradeMutationAttempted: false,
  brokerAutomationAttempted: false,
  avanzaAutomationAttempted: false,
  browserAutomationAttempted: false,
  policyReason:
    "Insert route readiness boundary contract types are contract-only and readiness-only. They do not implement readiness logic, call insert routes, create execution records, persist, finalize, append audit records, update stats/PnL, roll back, mutate trades, run broker actions, automate browser/Avanza behavior, or enable automatic mode.",
} as const satisfies ExecutionRecordInsertRouteReadinessSafetyPolicy;

export type ExecutionRecordInsertRouteEligibilitySummary = {
  routeEligibilityKnown: boolean;
  mayPrepareInsertRouteCallOnly: boolean;
  insertRouteCallImplemented: false;
  insertRouteCallAttempted: false;
  safeToCallInsertRoute: false;
  safeToCreateExecutionRecord: false;
  safeToPersist: false;
  dryRunRouteOnly: boolean;
  productionRouteSeparated: boolean;
  automaticModeAllowed: false;
  blockedReasons: ExecutionRecordInsertRouteReadinessBlockedReason[];
  warnings: ExecutionRecordInsertRouteReadinessWarning[];
  reviewItems: ExecutionRecordInsertRouteReadinessReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordInsertRouteActualValidatorSummary = {
  wrapperResult?: ActualPersistenceValidatorBoundaryCallImplementationResult | null;
  wrapperResultPresent: boolean;
  wrapperStatus?: ActualPersistenceValidatorBoundaryCallImplementationStatus | null;
  wrapperValidated: boolean;
  wrapperDecision?: ActualPersistenceValidatorBoundaryCallImplementationDecisionRecommendation | null;
  wrapperDecisionDoNotInsert: boolean;
  actualValidatorOutput?: ExecutionRecordPersistenceResult | null;
  actualValidatorOutputPresent: boolean;
  actualValidatorOutputHasBlockingErrors: boolean;
  actualValidatorWarnings: string[];
  boundaryCallValidationResult?: ActualPersistenceValidatorBoundaryCallValidationResult | null;
  blockedReasons: ExecutionRecordInsertRouteReadinessBlockedReason[];
  warnings: ExecutionRecordInsertRouteReadinessWarning[];
  reviewItems: ExecutionRecordInsertRouteReadinessReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordInsertRouteNormalizedInputSummary = {
  proposedPersistenceInput?: ExecutionRecordPersistenceInput | null;
  proposedPersistenceInputPresent: boolean;
  proposedPersistenceInputNormalized: boolean;
  requiredPersistenceFieldsPresent: boolean;
  missingRequiredPersistenceFields: (keyof ExecutionRecordPersistenceInput | string)[];
  schemaReference?: ExecutionRecordPersistenceSchemaReference | null;
  idempotencyKeyPresent: boolean;
  recordFingerprintPresent: boolean;
  sourceFingerprintPresent: boolean;
  candidatePresent: boolean;
  brokerConfirmationPresent: boolean;
  associationPresent: boolean;
  userContextPresent: boolean;
  safetyChecklistPresent: boolean;
  auditMetadataPresent: boolean;
  blockedReasons: ExecutionRecordInsertRouteReadinessBlockedReason[];
  warnings: ExecutionRecordInsertRouteReadinessWarning[];
  reviewItems: ExecutionRecordInsertRouteReadinessReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordInsertRouteSchemaReadinessSummary = {
  schemaReadinessKnown: boolean;
  schemaReadyForInsertReadiness: boolean;
  schemaReference?: ExecutionRecordPersistenceSchemaReference | null;
  expectedTableName: "execution_records";
  expectedColumnsVersion?: string | null;
  blockedReasons: ExecutionRecordInsertRouteReadinessBlockedReason[];
  warnings: ExecutionRecordInsertRouteReadinessWarning[];
  reviewItems: ExecutionRecordInsertRouteReadinessReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordInsertRouteGeneratedTypesSummary = {
  generatedTypesStatus: "available" | "absent" | "unknown";
  generatedTypesPresent: boolean;
  generatedTypesVersion?: string | null;
  generatedTypesSource?: string | null;
  executionRecordsTableTyped: boolean;
  blockedReasons: ExecutionRecordInsertRouteReadinessBlockedReason[];
  warnings: ExecutionRecordInsertRouteReadinessWarning[];
  reviewItems: ExecutionRecordInsertRouteReadinessReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordInsertRouteMigrationSummary = {
  migrationApplicationStatus: "proven" | "unproven" | "unknown";
  migrationApplied: boolean;
  migrationVersion?: string | null;
  migrationCheckedAt?: string | null;
  blockedReasons: ExecutionRecordInsertRouteReadinessBlockedReason[];
  warnings: ExecutionRecordInsertRouteReadinessWarning[];
  reviewItems: ExecutionRecordInsertRouteReadinessReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordInsertRouteRlsSecuritySummary = {
  rlsSecurityProofPresent: boolean;
  rlsPolicyVerified: boolean;
  serviceRoleWriteBoundaryVerified: boolean;
  userScopedWriteBoundaryVerified: boolean;
  secretHandlingReviewed: boolean;
  blockedReasons: ExecutionRecordInsertRouteReadinessBlockedReason[];
  warnings: ExecutionRecordInsertRouteReadinessWarning[];
  reviewItems: ExecutionRecordInsertRouteReadinessReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordInsertRouteServerOnlyBoundarySummary = {
  serverOnlyBoundaryProofPresent: boolean;
  serverOnlyRequestContextPresent: boolean;
  clientWritePathAbsent: boolean;
  browserCallablePathAbsent: boolean;
  routeHandlerBoundaryVerified: boolean;
  blockedReasons: ExecutionRecordInsertRouteReadinessBlockedReason[];
  warnings: ExecutionRecordInsertRouteReadinessWarning[];
  reviewItems: ExecutionRecordInsertRouteReadinessReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordInsertRouteIdempotencyDuplicateSummary = {
  idempotencyMetadataPresent: boolean;
  idempotencyKeyPresent: boolean;
  recordFingerprintPresent: boolean;
  sourceFingerprintPresent: boolean;
  brokerResultFingerprintPresent: boolean;
  duplicatePreventionMetadataPresent: boolean;
  duplicateLookupCompleted: boolean;
  duplicateMatches: ExecutionRecordDuplicateMatch[];
  duplicateConflictsRequireReview: boolean;
  blockedReasons: ExecutionRecordInsertRouteReadinessBlockedReason[];
  warnings: ExecutionRecordInsertRouteReadinessWarning[];
  reviewItems: ExecutionRecordInsertRouteReadinessReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordInsertRouteAuditCorrectionSummary = {
  auditCorrectionMetadataPresent: boolean;
  auditPolicyReviewed: boolean;
  sourceEvidenceChainPresent: boolean;
  correctionRollbackSeparated: boolean;
  noAuditAppendInReadinessContract: true;
  noRollbackCorrectionInReadinessContract: true;
  blockedReasons: ExecutionRecordInsertRouteReadinessBlockedReason[];
  warnings: ExecutionRecordInsertRouteReadinessWarning[];
  reviewItems: ExecutionRecordInsertRouteReadinessReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordInsertRouteEvidenceProvenanceSummary = {
  sourceEvidencePresent: boolean;
  sourceEvidenceIds: string[];
  provenanceComplete: boolean;
  brokerConfirmationEvidencePresent: boolean;
  finalizationEvidencePresent: boolean;
  candidateBuilderEvidencePresent: boolean;
  persistenceAdapterEvidencePresent: boolean;
  blockedReasons: ExecutionRecordInsertRouteReadinessBlockedReason[];
  warnings: ExecutionRecordInsertRouteReadinessWarning[];
  reviewItems: ExecutionRecordInsertRouteReadinessReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordInsertRouteManualApprovalSummary = {
  manualApprovalMetadataPresent: boolean;
  manualApprovalRequired: boolean;
  manualApprovalSatisfied: boolean;
  manualApprovalContext?: FinalizationActionValidatorManualApprovalContext | null;
  automaticModeAllowed: false;
  automaticModeDisabled: true;
  blockedReasons: ExecutionRecordInsertRouteReadinessBlockedReason[];
  warnings: ExecutionRecordInsertRouteReadinessWarning[];
  reviewItems: ExecutionRecordInsertRouteReadinessReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordInsertRouteDryRunProductionSeparationSummary = {
  dryRunRouteStatus: "known" | "unknown" | "unsupported";
  dryRunRouteAvailable: boolean;
  dryRunRouteIsProductionRoute: false;
  productionRouteStatus: "absent" | "future_boundary_required" | "unknown";
  productionRouteSeparatedFromDryRun: boolean;
  dryRunSuccessIsNotProductionReadiness: true;
  productionInsertRequiresSeparateBoundary: true;
  blockedReasons: ExecutionRecordInsertRouteReadinessBlockedReason[];
  warnings: ExecutionRecordInsertRouteReadinessWarning[];
  reviewItems: ExecutionRecordInsertRouteReadinessReviewItem[];
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordInsertRoutePostInsertBoundarySummary = {
  safeToAppendAudit: false;
  safeToUpdateStats: false;
  safeToRollback: false;
  safeToMutateTrade: false;
  safeToRunBrokerAction: false;
  safeToRunAvanzaBrowserAction: false;
  automaticModeAllowed: false;
  auditAppendRequiresSeparateBoundary: true;
  statsUpdateRequiresSeparateBoundary: true;
  rollbackCorrectionRequiresSeparateBoundary: true;
  tradeMutationRequiresSeparateBoundary: true;
  uiStateMutationRequiresSeparateBoundary: true;
  reconciliationRequiresSeparateBoundary: true;
  duplicateHandlingRequiresSeparateBoundary: true;
  failureRecoveryRequiresSeparateBoundary: true;
  blockedReasons: ExecutionRecordInsertRouteReadinessBlockedReason[];
  warnings: ExecutionRecordInsertRouteReadinessWarning[];
  reviewItems: ExecutionRecordInsertRouteReadinessReviewItem[];
  metadata?: Record<string, unknown>;
};

export const EXECUTION_RECORD_INSERT_ROUTE_READINESS_DEFAULT_POST_INSERT_BOUNDARY =
  {
    safeToAppendAudit: false,
    safeToUpdateStats: false,
    safeToRollback: false,
    safeToMutateTrade: false,
    safeToRunBrokerAction: false,
    safeToRunAvanzaBrowserAction: false,
    automaticModeAllowed: false,
    auditAppendRequiresSeparateBoundary: true,
    statsUpdateRequiresSeparateBoundary: true,
    rollbackCorrectionRequiresSeparateBoundary: true,
    tradeMutationRequiresSeparateBoundary: true,
    uiStateMutationRequiresSeparateBoundary: true,
    reconciliationRequiresSeparateBoundary: true,
    duplicateHandlingRequiresSeparateBoundary: true,
    failureRecoveryRequiresSeparateBoundary: true,
    blockedReasons: [],
    warnings: [
      "audit_required_before_post_insert_mutation",
      "stats_update_out_of_scope",
      "trade_mutation_out_of_scope",
      "broker_avanza_action_out_of_scope",
    ],
    reviewItems: ["post_insert_boundary_review"],
  } as const satisfies ExecutionRecordInsertRoutePostInsertBoundarySummary;

export type ExecutionRecordInsertRouteServerOnlyRequestContext = {
  requestId?: string | null;
  requestedAt: string;
  sourceEnvironment: "staging" | "production";
  actor: "server_route" | "trusted_job" | "manual_admin_review";
  routeName?: string | null;
  isServerOnly: boolean;
  clientInitiatedWriteAllowed: false;
  browserAutomationAllowed: false;
  brokerAutomationAllowed: false;
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordInsertRouteReadinessInput = {
  contractVersion: ExecutionRecordInsertRouteReadinessBoundaryContractVersion;
  requestedAt: string;
  actualValidatorWrapperResult?: ActualPersistenceValidatorBoundaryCallImplementationResult | null;
  actualValidatorOutputSummary?: ExecutionRecordInsertRouteActualValidatorSummary | null;
  proposedNormalizedPersistenceInput?: ExecutionRecordPersistenceInput | null;
  normalizedInputSummary?: ExecutionRecordInsertRouteNormalizedInputSummary | null;
  schemaReadinessSummary?: ExecutionRecordInsertRouteSchemaReadinessSummary | null;
  generatedTypesSummary?: ExecutionRecordInsertRouteGeneratedTypesSummary | null;
  migrationSummary?: ExecutionRecordInsertRouteMigrationSummary | null;
  rlsSecuritySummary?: ExecutionRecordInsertRouteRlsSecuritySummary | null;
  serverOnlyBoundarySummary?: ExecutionRecordInsertRouteServerOnlyBoundarySummary | null;
  idempotencyDuplicateSummary?: ExecutionRecordInsertRouteIdempotencyDuplicateSummary | null;
  auditCorrectionSummary?: ExecutionRecordInsertRouteAuditCorrectionSummary | null;
  evidenceProvenanceSummary?: ExecutionRecordInsertRouteEvidenceProvenanceSummary | null;
  dryRunProductionSeparationSummary?: ExecutionRecordInsertRouteDryRunProductionSeparationSummary | null;
  manualApprovalSummary?: ExecutionRecordInsertRouteManualApprovalSummary | null;
  serverOnlyRequestContext?: ExecutionRecordInsertRouteServerOnlyRequestContext | null;
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordInsertRouteReadinessResult = {
  contractVersion: ExecutionRecordInsertRouteReadinessBoundaryContractVersion;
  evaluatedAt: string;
  status: ExecutionRecordInsertRouteReadinessStatus;
  decisionRecommendation: ExecutionRecordInsertRouteReadinessDecisionRecommendation;
  input?: ExecutionRecordInsertRouteReadinessInput | null;
  routeEligibilitySummary: ExecutionRecordInsertRouteEligibilitySummary;
  actualValidatorSummary: ExecutionRecordInsertRouteActualValidatorSummary;
  normalizedInputSummary: ExecutionRecordInsertRouteNormalizedInputSummary;
  schemaReadinessSummary: ExecutionRecordInsertRouteSchemaReadinessSummary;
  generatedTypesSummary: ExecutionRecordInsertRouteGeneratedTypesSummary;
  migrationSummary: ExecutionRecordInsertRouteMigrationSummary;
  rlsSecuritySummary: ExecutionRecordInsertRouteRlsSecuritySummary;
  serverOnlyBoundarySummary: ExecutionRecordInsertRouteServerOnlyBoundarySummary;
  idempotencyDuplicateSummary: ExecutionRecordInsertRouteIdempotencyDuplicateSummary;
  auditCorrectionSummary: ExecutionRecordInsertRouteAuditCorrectionSummary;
  evidenceProvenanceSummary: ExecutionRecordInsertRouteEvidenceProvenanceSummary;
  manualApprovalSummary: ExecutionRecordInsertRouteManualApprovalSummary;
  dryRunProductionSeparationSummary: ExecutionRecordInsertRouteDryRunProductionSeparationSummary;
  postInsertBoundarySummary: ExecutionRecordInsertRoutePostInsertBoundarySummary;
  safetyPolicy: ExecutionRecordInsertRouteReadinessSafetyPolicy;
  blockedReasons: ExecutionRecordInsertRouteReadinessBlockedReason[];
  warnings: ExecutionRecordInsertRouteReadinessWarning[];
  reviewItems: ExecutionRecordInsertRouteReadinessReviewItem[];
  metadata?: Record<string, unknown>;
};
