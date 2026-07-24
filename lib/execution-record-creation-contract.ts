export const EXECUTION_RECORD_CREATION_CONTRACT_VERSION =
  "execution_record_creation_v1" as const;

export type ExecutionRecordCreationContractVersion =
  typeof EXECUTION_RECORD_CREATION_CONTRACT_VERSION;

export const EXECUTION_RECORD_CREATION_STATUSES = [
  "eligible",
  "rejected",
  "needs_review",
  "duplicate",
] as const;

export type ExecutionRecordCreationStatus =
  (typeof EXECUTION_RECORD_CREATION_STATUSES)[number];

export const EXECUTION_RECORD_CREATION_REJECTION_REASONS = [
  "missing_confirmed_broker_result",
  "preview_only_result",
  "not_broker_execution_result",
  "missing_idempotency_key",
  "missing_source_fingerprint",
  "missing_order_id",
  "missing_confirmation_timestamp",
  "unsupported_broker",
  "unsupported_execution_mode",
  "unsupported_execution_phase",
  "unsupported_status",
  "placed_or_accepted_not_filled",
  "partial_fill_policy_missing",
  "synthetic_result_not_allowed",
  "dev_or_mock_result_not_allowed",
  "missing_side",
  "side_mismatch",
  "missing_instrument",
  "instrument_mismatch",
  "quantity_invalid",
  "quantity_mismatch",
  "price_invalid",
  "currency_missing",
  "ambiguous_trade_association",
  "missing_entry_recommendation",
  "missing_exit_position",
  "duplicate_idempotency_key",
  "duplicate_broker_reference",
  "duplicate_source_fingerprint",
  "sensitive_data_detected",
  "raw_data_detected",
  "supabase_write_attempted",
  "trade_mutation_attempted",
  "automatic_mode_not_supported",
  "production_policy_missing",
] as const;

export type ExecutionRecordCreationRejectionReason =
  (typeof EXECUTION_RECORD_CREATION_REJECTION_REASONS)[number];

export const EXECUTION_RECORD_CREATION_WARNINGS = [
  "manual_review_required",
  "missing_optional_fees",
  "missing_optional_amounts",
  "missing_optional_market",
  "missing_optional_instrument_type",
  "missing_planning_snapshot",
  "missing_handoff_payload_fingerprint",
  "missing_broker_reference_allowed_by_policy",
  "duplicate_check_local_only",
  "persistence_not_attempted",
  "trade_mutation_not_attempted",
] as const;

export type ExecutionRecordCreationWarning =
  (typeof EXECUTION_RECORD_CREATION_WARNINGS)[number];

export type ExecutionRecordCreationSourceEnvironment =
  | "local_dev"
  | "staging"
  | "production";

export type ExecutionRecordCreationMode = "semi_automatic" | "automatic";

export type ExecutionRecordCreationPhase = "entry" | "exit";

export type ExecutionRecordCreationSide = "buy" | "sell";

export type ExecutionRecordCreationBroker = "avanza";

export type ExecutionRecordCreationBrokerStatus =
  | "filled"
  | "executed"
  | "submitted"
  | "accepted"
  | "placed"
  | "partially_filled"
  | "rejected"
  | "cancelled"
  | "expired"
  | "unknown"
  | "blocked"
  | "failed"
  | "unavailable";

export type ExecutionRecordCreationActor =
  | "manual_user_confirmation"
  | "server_capture"
  | "dev_stub";

export type ExecutionRecordInstrumentReference = {
  ticker: string;
  name?: string | null;
  market?: string | null;
  currency?: string | null;
  instrumentType?: string | null;
};

export type ExecutionRecordBrokerMetadataInput = {
  broker: ExecutionRecordCreationBroker;
  brokerOrderId?: string | null;
  brokerConfirmationId?: string | null;
  brokerReference?: string | null;
  confirmationTimestamp: string;
};

export type ExecutionRecordIdempotencyInput = {
  idempotencyKey: string;
  sourceEvidenceFingerprint: string;
  brokerResultFingerprint?: string | null;
  handoffPayloadFingerprint?: string | null;
  captureId?: string | null;
  requestId?: string | null;
};

export type ExecutionRecordCreationAuditContext = {
  handoffSessionId?: string | null;
  payloadId?: string | null;
  sourceEventIds?: string[];
  sourceCaptureStatus?: string | null;
  sourceOrderStatus?: string | null;
  createdBy?: ExecutionRecordCreationActor;
  isSynthetic?: boolean;
  isDevOnly?: boolean;
  isMock?: boolean;
};

export type ExecutionRecordPlanningSnapshotReference = {
  snapshotId?: string | null;
  snapshotVersion?: string | null;
};

export type ExecutionRecordExistingTradeReference = {
  positionId?: string | null;
  recommendationId?: string | null;
  ticker?: string | null;
};

export type ExecutionRecordSourceBrokerResultMetadata = {
  previewOnly?: boolean;
  notBrokerExecutionResult?: boolean;
  isSynthetic?: boolean;
  isDevOnly?: boolean;
  isMock?: boolean;
  containsSensitiveData?: boolean;
  containsRawData?: boolean;
  noSupabaseWrite?: boolean;
  noTradeMutation?: boolean;
  noBrokerExecution?: boolean;
  noAvanzaAutomation?: boolean;
  [key: string]: unknown;
};

export type ExecutionRecordSourceBrokerExecutionResult = {
  broker?: ExecutionRecordCreationBroker | string | null;
  brokerHint?: ExecutionRecordCreationBroker | "AVANZA" | string | null;
  broker_hint?: ExecutionRecordCreationBroker | "AVANZA" | string | null;
  status?: ExecutionRecordCreationBrokerStatus | string | null;
  side?: ExecutionRecordCreationSide | string | null;
  action?: ExecutionRecordCreationSide | string | null;
  ticker?: string | null;
  instrumentName?: string | null;
  market?: string | null;
  currency?: string | null;
  instrumentType?: string | null;
  quantity?: number | null;
  filledQuantity?: number | null;
  filled_quantity?: number | null;
  price?: number | null;
  averageFillPrice?: number | null;
  average_fill_price?: number | null;
  grossAmount?: number | null;
  netAmount?: number | null;
  fees?: number | null;
  brokerOrderId?: string | null;
  broker_order_id?: string | null;
  brokerConfirmationId?: string | null;
  broker_confirmation_id?: string | null;
  brokerReference?: string | null;
  broker_reference?: string | null;
  confirmationTimestamp?: string | null;
  confirmation_timestamp?: string | null;
  confirmedAt?: string | null;
  confirmed_at?: string | null;
  capturedAt?: string | null;
  captured_at?: string | null;
  rawStatus?: string | null;
  raw_status?: string | null;
  metadata?: ExecutionRecordSourceBrokerResultMetadata | null;
};

export type ExecutionRecordCreationInput = {
  contractVersion: ExecutionRecordCreationContractVersion;
  requestedAt: string;
  sourceEnvironment: ExecutionRecordCreationSourceEnvironment;
  executionMode: ExecutionRecordCreationMode;
  executionPhase: ExecutionRecordCreationPhase;
  expectedAction: ExecutionRecordCreationSide;
  expectedInstrument: ExecutionRecordInstrumentReference;
  expectedQuantity?: number | null;
  expectedPositionId?: string | null;
  recommendationId?: string | null;
  positionId?: string | null;
  sourceBrokerExecutionResult: ExecutionRecordSourceBrokerExecutionResult;
  brokerMetadata: ExecutionRecordBrokerMetadataInput;
  idempotency: ExecutionRecordIdempotencyInput;
  auditContext: ExecutionRecordCreationAuditContext;
  planningSnapshotRef?: ExecutionRecordPlanningSnapshotReference | null;
  existingTradeRef?: ExecutionRecordExistingTradeReference | null;
};

export type ExecutionRecordCreationAuditMetadata = {
  noSupabaseWrite: true;
  noTradeMutation: true;
  noBrokerExecution: true;
  noAvanzaAutomation: true;
  creationAttempted: false;
  persistenceAttempted: false;
  tradeMutationAttempted: false;
  sourceEventIds: string[];
  sourceEvidenceFingerprint?: string | null;
  brokerResultFingerprint?: string | null;
  handoffPayloadFingerprint?: string | null;
  handoffSessionId?: string | null;
  payloadId?: string | null;
  captureId?: string | null;
  requestId?: string | null;
  createdBy?: ExecutionRecordCreationActor | null;
};

export type ExecutionRecordSafetyMetadata = {
  noSupabaseWrite: true;
  noTradeMutation: true;
  noBrokerExecution: true;
  noAvanzaAutomation: true;
  previewOnlySourceRejected: boolean;
  syntheticSourceAllowed: boolean;
  automaticModeAllowed: boolean;
  validationWarnings: ExecutionRecordCreationWarning[];
};

export type ExecutionRecordCandidate = {
  recordId: string;
  recordFingerprint: string;
  idempotencyKey: string;
  contractVersion: ExecutionRecordCreationContractVersion;
  createdAt: string;
  broker: ExecutionRecordCreationBroker;
  side: ExecutionRecordCreationSide;
  ticker: string;
  quantity: number;
  price: number;
  currency: string;
  brokerStatus: ExecutionRecordCreationBrokerStatus;
  confirmationTimestamp: string;
  sourceEvidenceFingerprint: string;
  sourceEnvironment: ExecutionRecordCreationSourceEnvironment;
  executionMode: ExecutionRecordCreationMode;
  executionPhase: ExecutionRecordCreationPhase;
  safetyMetadata: ExecutionRecordSafetyMetadata;
  auditMetadata: ExecutionRecordCreationAuditMetadata;
  brokerOrderId?: string | null;
  brokerConfirmationId?: string | null;
  brokerReference?: string | null;
  recommendationId?: string | null;
  positionId?: string | null;
  handoffSessionId?: string | null;
  payloadId?: string | null;
  instrumentName?: string | null;
  market?: string | null;
  instrumentType?: string | null;
  grossAmount?: number | null;
  netAmount?: number | null;
  fees?: number | null;
  requestedPrice?: number | null;
  plannedPrice?: number | null;
  planningSnapshotId?: string | null;
  planningSnapshotVersion?: string | null;
  captureId?: string | null;
  requestId?: string | null;
  brokerResultFingerprint?: string | null;
  handoffPayloadFingerprint?: string | null;
  sourceEventIds?: string[];
  warnings?: ExecutionRecordCreationWarning[];
  provenanceMetadata?: Record<string, unknown>;
};

type ExecutionRecordCreationResultBase = {
  contractVersion: ExecutionRecordCreationContractVersion;
  evaluatedAt: string;
  warnings: ExecutionRecordCreationWarning[];
  blockers: string[];
  idempotencyKey: string | null;
  recordFingerprint: string | null;
  duplicateOfRecordId?: string | null;
  auditMetadata: ExecutionRecordCreationAuditMetadata;
};

export type ExecutionRecordCreationEligibleResult =
  ExecutionRecordCreationResultBase & {
    status: "eligible";
    eligible: true;
    safeToPersist: boolean;
    recordCandidate?: ExecutionRecordCandidate;
    rejectionReasons: [];
  };

export type ExecutionRecordCreationRejectedResult =
  ExecutionRecordCreationResultBase & {
    status: "rejected";
    eligible: false;
    safeToPersist: false;
    recordCandidate?: undefined;
    rejectionReasons: ExecutionRecordCreationRejectionReason[];
  };

export type ExecutionRecordCreationNeedsReviewResult =
  ExecutionRecordCreationResultBase & {
    status: "needs_review";
    eligible: false;
    safeToPersist: false;
    recordCandidate?: ExecutionRecordCandidate;
    rejectionReasons: ExecutionRecordCreationRejectionReason[];
  };

export type ExecutionRecordCreationDuplicateResult =
  ExecutionRecordCreationResultBase & {
    status: "duplicate";
    eligible: false;
    safeToPersist: false;
    recordCandidate?: undefined;
    rejectionReasons: ExecutionRecordCreationRejectionReason[];
    duplicateOfRecordId: string | null;
  };

export type ExecutionRecordCreationResult =
  | ExecutionRecordCreationEligibleResult
  | ExecutionRecordCreationRejectedResult
  | ExecutionRecordCreationNeedsReviewResult
  | ExecutionRecordCreationDuplicateResult;
