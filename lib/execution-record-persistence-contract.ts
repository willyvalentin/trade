import type {
  ExecutionRecordCandidate,
  ExecutionRecordCreationBroker,
  ExecutionRecordCreationMode,
  ExecutionRecordCreationPhase,
  ExecutionRecordCreationSide,
  ExecutionRecordCreationSourceEnvironment,
} from "@/lib/execution-record-creation-contract";

export const EXECUTION_RECORD_PERSISTENCE_CONTRACT_VERSION =
  "execution_record_persistence_v1" as const;

export type ExecutionRecordPersistenceContractVersion =
  typeof EXECUTION_RECORD_PERSISTENCE_CONTRACT_VERSION;

export const EXECUTION_RECORD_PERSISTENCE_STATUSES = [
  "eligible",
  "persisted",
  "rejected",
  "duplicate",
  "needs_review",
  "error",
] as const;

export type ExecutionRecordPersistenceStatus =
  (typeof EXECUTION_RECORD_PERSISTENCE_STATUSES)[number];

export const EXECUTION_RECORD_PERSISTENCE_REJECTION_REASONS = [
  "candidate_not_validated",
  "candidate_not_safe_to_persist",
  "missing_idempotency_key",
  "missing_record_fingerprint",
  "missing_source_fingerprint",
  "missing_user_context",
  "missing_broker_confirmation",
  "missing_confirmation_timestamp",
  "preview_only_candidate",
  "dev_fixture_candidate_not_allowed",
  "synthetic_candidate_not_allowed",
  "mock_candidate_not_allowed",
  "duplicate_execution_record",
  "conflicting_duplicate_match",
  "ambiguous_trade_association",
  "schema_unavailable",
  "rls_context_missing",
  "unsupported_broker",
  "unsupported_execution_mode",
  "unsupported_execution_phase",
  "invalid_quantity",
  "invalid_price",
  "instrument_mismatch",
  "side_mismatch",
  "automatic_mode_requires_review",
  "audit_policy_missing",
  "supabase_write_not_configured",
  "trade_mutation_not_allowed",
] as const;

export type ExecutionRecordPersistenceRejectionReason =
  (typeof EXECUTION_RECORD_PERSISTENCE_REJECTION_REASONS)[number];

export const EXECUTION_RECORD_PERSISTENCE_WARNINGS = [
  "duplicate_check_pending",
  "missing_optional_account_context",
  "missing_optional_broker_confirmation_id",
  "missing_optional_broker_result_reference",
  "missing_optional_planning_snapshot",
  "audit_append_deferred",
  "trade_mutation_deferred",
  "statistics_integration_deferred",
  "rls_policy_pending_review",
] as const;

export type ExecutionRecordPersistenceWarning =
  (typeof EXECUTION_RECORD_PERSISTENCE_WARNINGS)[number];

export const EXECUTION_RECORD_DUPLICATE_MATCH_TYPES = [
  "idempotency_key",
  "record_fingerprint",
  "broker_confirmation",
  "broker_order",
  "broker_result",
  "source_fingerprint",
] as const;

export type ExecutionRecordDuplicateMatchType =
  (typeof EXECUTION_RECORD_DUPLICATE_MATCH_TYPES)[number];

export type ExecutionRecordPersistenceActor =
  | "server_route"
  | "trusted_job"
  | "manual_admin_review";

export type ExecutionRecordPersistenceSchemaReference = {
  tableName: "execution_records";
  expectedColumnsVersion?: string | null;
  migrationVersion?: string | null;
};

export type ExecutionRecordPersistenceUserContext = {
  userId?: string | null;
  accountId?: string | null;
  sessionId?: string | null;
  actor: ExecutionRecordPersistenceActor;
  sourceEnvironment: ExecutionRecordCreationSourceEnvironment;
};

export type ExecutionRecordBrokerConfirmationMetadata = {
  broker: ExecutionRecordCreationBroker;
  brokerOrderId?: string | null;
  brokerConfirmationId?: string | null;
  brokerResultId?: string | null;
  brokerResultFingerprint?: string | null;
  confirmedAt: string;
  capturedAt?: string | null;
  sourceFingerprint: string;
};

export type ExecutionRecordAssociationMetadata = {
  sourceRecommendationId?: string | null;
  sourcePositionId?: string | null;
  handoffSessionId?: string | null;
  planningSnapshotId?: string | null;
  tradeAssociationConfidence?: "confirmed" | "needs_review" | "ambiguous";
  associationWarnings?: ExecutionRecordPersistenceWarning[];
};

export type ExecutionRecordPersistenceSafetyChecklist = {
  candidateValidated: boolean;
  candidateSafeToPersist: boolean;
  notPreviewOnly: boolean;
  notDevFixture: boolean;
  notSynthetic: boolean;
  notMock: boolean;
  hasConfirmedBrokerResult: boolean;
  hasIdempotencyKey: boolean;
  hasRecordFingerprint: boolean;
  hasSourceFingerprint: boolean;
  hasUserOrAccountContext: boolean;
  hasUnambiguousTradeAssociation: boolean;
  schemaAvailable: boolean;
  rlsContextPresent: boolean;
  auditPolicyReviewed: boolean;
  tradeMutationSeparated: boolean;
  automaticModeReviewed: boolean;
};

export type ExecutionRecordPersistenceAuditMetadata = {
  noTradeMutation: true;
  noAuditAppendInContract: true;
  persistenceAttempted: boolean;
  supabaseWriteAttempted: boolean;
  tradeMutationAttempted: false;
  auditAppendAttempted: boolean;
  actor: ExecutionRecordPersistenceActor;
  sourceEnvironment: ExecutionRecordCreationSourceEnvironment;
  sourceEventIds: string[];
  persistenceAttemptId?: string | null;
  auditEventIds?: string[];
  idempotencyKey?: string | null;
  recordFingerprint?: string | null;
  sourceFingerprint?: string | null;
  brokerResultFingerprint?: string | null;
  handoffSessionId?: string | null;
};

export type ExecutionRecordDuplicateMatch = {
  matchType: ExecutionRecordDuplicateMatchType;
  existingRecordId: string;
  idempotencyKey?: string | null;
  recordFingerprint?: string | null;
  brokerOrderId?: string | null;
  brokerConfirmationId?: string | null;
  brokerResultId?: string | null;
  sourceFingerprint?: string | null;
  matchedAt?: string | null;
  conflictRequiresReview?: boolean;
};

export type PersistedExecutionRecordReference = {
  recordId: string;
  tableName: "execution_records";
  idempotencyKey: string;
  recordFingerprint: string;
  broker: ExecutionRecordCreationBroker;
  brokerOrderId?: string | null;
  brokerConfirmationId?: string | null;
  ticker: string;
  side: ExecutionRecordCreationSide;
  executionMode: ExecutionRecordCreationMode;
  executionPhase: ExecutionRecordCreationPhase;
  sourceRecommendationId?: string | null;
  sourcePositionId?: string | null;
  confirmedAt: string;
  persistedAt: string;
};

export type ExecutionRecordPersistenceInput = {
  contractVersion: ExecutionRecordPersistenceContractVersion;
  requestedAt: string;
  candidate: ExecutionRecordCandidate;
  idempotencyKey: string;
  recordFingerprint: string;
  sourceFingerprint: string;
  brokerConfirmation: ExecutionRecordBrokerConfirmationMetadata;
  association: ExecutionRecordAssociationMetadata;
  userContext: ExecutionRecordPersistenceUserContext;
  safetyChecklist: ExecutionRecordPersistenceSafetyChecklist;
  auditMetadata: ExecutionRecordPersistenceAuditMetadata;
  duplicateMatches?: ExecutionRecordDuplicateMatch[];
  schemaReference?: ExecutionRecordPersistenceSchemaReference | null;
  metadata?: Record<string, unknown>;
};

type ExecutionRecordPersistenceResultBase = {
  contractVersion: ExecutionRecordPersistenceContractVersion;
  evaluatedAt: string;
  status: ExecutionRecordPersistenceStatus;
  safeToWrite: boolean;
  warnings: ExecutionRecordPersistenceWarning[];
  rejectionReasons: ExecutionRecordPersistenceRejectionReason[];
  duplicateMatches: ExecutionRecordDuplicateMatch[];
  idempotencyKey: string | null;
  recordFingerprint: string | null;
  auditMetadata: ExecutionRecordPersistenceAuditMetadata;
};

export type ExecutionRecordPersistencePersistedResult =
  ExecutionRecordPersistenceResultBase & {
    status: "persisted";
    safeToWrite: true;
    persistedRecord: PersistedExecutionRecordReference;
    rejectionReasons: [];
  };

export type ExecutionRecordPersistenceEligibleResult =
  ExecutionRecordPersistenceResultBase & {
    status: "eligible";
    safeToWrite: true;
    persistedRecord?: undefined;
    rejectionReasons: [];
    duplicateMatches: [];
  };

export type ExecutionRecordPersistenceRejectedResult =
  ExecutionRecordPersistenceResultBase & {
    status: "rejected";
    safeToWrite: false;
    persistedRecord?: undefined;
    rejectionReasons: ExecutionRecordPersistenceRejectionReason[];
  };

export type ExecutionRecordPersistenceDuplicateResult =
  ExecutionRecordPersistenceResultBase & {
    status: "duplicate";
    safeToWrite: false;
    persistedRecord?: PersistedExecutionRecordReference;
    rejectionReasons: ExecutionRecordPersistenceRejectionReason[];
    duplicateMatches: ExecutionRecordDuplicateMatch[];
  };

export type ExecutionRecordPersistenceNeedsReviewResult =
  ExecutionRecordPersistenceResultBase & {
    status: "needs_review";
    safeToWrite: false;
    persistedRecord?: undefined;
    rejectionReasons: ExecutionRecordPersistenceRejectionReason[];
  };

export type ExecutionRecordPersistenceErrorResult =
  ExecutionRecordPersistenceResultBase & {
    status: "error";
    safeToWrite: false;
    persistedRecord?: undefined;
    rejectionReasons: ExecutionRecordPersistenceRejectionReason[];
    errorMessage?: string;
  };

export type ExecutionRecordPersistenceResult =
  | ExecutionRecordPersistenceEligibleResult
  | ExecutionRecordPersistencePersistedResult
  | ExecutionRecordPersistenceRejectedResult
  | ExecutionRecordPersistenceDuplicateResult
  | ExecutionRecordPersistenceNeedsReviewResult
  | ExecutionRecordPersistenceErrorResult;
