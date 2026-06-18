import type {
  ExecutionRecordAssociationMetadata,
  ExecutionRecordBrokerConfirmationMetadata,
  ExecutionRecordDuplicateMatch,
  ExecutionRecordPersistenceAuditMetadata,
  ExecutionRecordPersistenceInput,
  ExecutionRecordPersistenceRejectionReason,
  ExecutionRecordPersistenceSafetyChecklist,
  ExecutionRecordPersistenceUserContext,
  ExecutionRecordPersistenceWarning,
  PersistedExecutionRecordReference,
} from "@/lib/execution-record-persistence-contract";

import type {
  ExecutionRecordCandidate,
  ExecutionRecordCreationSourceEnvironment,
} from "@/lib/execution-record-creation-contract";

export const EXECUTION_RECORD_INSERT_ROUTE_CONTRACT_VERSION =
  "execution_record_insert_route_v1" as const;

export type ExecutionRecordInsertRouteContractVersion =
  typeof EXECUTION_RECORD_INSERT_ROUTE_CONTRACT_VERSION;

export const EXECUTION_RECORD_INSERT_ROUTE_STATUSES = [
  "inserted",
  "duplicate",
  "rejected",
  "needs_review",
  "error",
  "dry_run",
] as const;

export type ExecutionRecordInsertRouteStatus =
  (typeof EXECUTION_RECORD_INSERT_ROUTE_STATUSES)[number];

export const EXECUTION_RECORD_INSERT_ROUTE_ERROR_CODES = [
  "invalid_json",
  "invalid_request_contract",
  "unauthenticated",
  "unauthorized",
  "user_context_mismatch",
  "persistence_validation_failed",
  "schema_unavailable",
  "migration_not_applied",
  "duplicate_conflict",
  "conflicting_duplicate_match",
  "supabase_write_disabled",
  "supabase_insert_failed",
  "unexpected_server_error",
  "trade_mutation_not_allowed",
  "audit_append_not_configured",
] as const;

export type ExecutionRecordInsertRouteErrorCode =
  (typeof EXECUTION_RECORD_INSERT_ROUTE_ERROR_CODES)[number];

export type ExecutionRecordInsertRouteMethod = "POST";

export type ExecutionRecordInsertRoutePath =
  "/api/execution/records/insert";

export type ExecutionRecordInsertRouteMode = "dry_run" | "insert";

export type ExecutionRecordInsertRouteActor = "authenticated_user" | "trusted_job";

export type ExecutionRecordInsertRouteValidationError = {
  code: ExecutionRecordInsertRouteErrorCode;
  message: string;
  fieldPath?: string | null;
  persistenceReason?: ExecutionRecordPersistenceRejectionReason | null;
};

export type ExecutionRecordInsertRouteServerContext = {
  actor: ExecutionRecordInsertRouteActor;
  sourceEnvironment: ExecutionRecordCreationSourceEnvironment;
  authenticatedUserId?: string | null;
  accountId?: string | null;
  sessionId?: string | null;
  requestId?: string | null;
};

export type ExecutionRecordInsertRouteDryRunMetadata = {
  dryRun: true;
  insertAttempted: false;
  supabaseWriteAttempted: false;
  auditAppendAttempted: false;
  tradeMutationAttempted: false;
  plannedRoutePath: ExecutionRecordInsertRoutePath;
  plannedMethod: ExecutionRecordInsertRouteMethod;
  plannedTableName: "execution_records";
  plannedDuplicateLookup: boolean;
  plannedInsertMapping: boolean;
  message: string;
};

export type ExecutionRecordInsertRouteSafetyMetadata = {
  serverOnly: true;
  directClientSupabaseWriteAllowed: false;
  noTradeMutation: true;
  noAuditAppendInInitialRoute: true;
  noBrokerResultCreation: true;
  noAvanzaAutomation: true;
  migrationMustBeAppliedBeforeRealInsert: boolean;
};

export type ExecutionRecordInsertRouteRequest = {
  contractVersion: ExecutionRecordInsertRouteContractVersion;
  method: ExecutionRecordInsertRouteMethod;
  routePath: ExecutionRecordInsertRoutePath;
  requestedAt: string;
  mode: ExecutionRecordInsertRouteMode;
  dryRun?: boolean;
  persistenceInput: ExecutionRecordPersistenceInput;
  candidate: ExecutionRecordCandidate;
  idempotencyKey: string;
  recordFingerprint: string;
  sourceFingerprint: string;
  brokerConfirmation: ExecutionRecordBrokerConfirmationMetadata;
  association: ExecutionRecordAssociationMetadata;
  userContext: ExecutionRecordPersistenceUserContext;
  auditMetadata: ExecutionRecordPersistenceAuditMetadata;
  safetyChecklist: ExecutionRecordPersistenceSafetyChecklist;
  clientContext?: {
    expectedUserId?: string | null;
    expectedAccountId?: string | null;
    requestId?: string | null;
  } | null;
  metadata?: Record<string, unknown>;
};

export type ExecutionRecordInsertRouteDuplicatePayload = {
  duplicateMatches: ExecutionRecordDuplicateMatch[];
  idempotencyKey: string | null;
  recordFingerprint: string | null;
  conflictRequiresReview: boolean;
};

type ExecutionRecordInsertRouteResponseBase = {
  contractVersion: ExecutionRecordInsertRouteContractVersion;
  routePath: ExecutionRecordInsertRoutePath;
  method: ExecutionRecordInsertRouteMethod;
  receivedAt: string;
  evaluatedAt: string;
  status: ExecutionRecordInsertRouteStatus;
  idempotencyKey: string | null;
  recordFingerprint: string | null;
  warnings: ExecutionRecordPersistenceWarning[];
  validationErrors: ExecutionRecordInsertRouteValidationError[];
  rejectionReasons: ExecutionRecordPersistenceRejectionReason[];
  auditMetadata: ExecutionRecordPersistenceAuditMetadata;
  safetyMetadata: ExecutionRecordInsertRouteSafetyMetadata;
  dryRunMetadata?: ExecutionRecordInsertRouteDryRunMetadata;
  serverContext?: ExecutionRecordInsertRouteServerContext;
};

export type ExecutionRecordInsertRouteInsertedResponse =
  ExecutionRecordInsertRouteResponseBase & {
    status: "inserted";
    persistedRecord: PersistedExecutionRecordReference;
    duplicate?: undefined;
    dryRunMetadata?: undefined;
    validationErrors: [];
    rejectionReasons: [];
  };

export type ExecutionRecordInsertRouteDuplicateResponse =
  ExecutionRecordInsertRouteResponseBase & {
    status: "duplicate";
    persistedRecord?: PersistedExecutionRecordReference;
    duplicate: ExecutionRecordInsertRouteDuplicatePayload;
  };

export type ExecutionRecordInsertRouteRejectedResponse =
  ExecutionRecordInsertRouteResponseBase & {
    status: "rejected";
    persistedRecord?: undefined;
    duplicate?: ExecutionRecordInsertRouteDuplicatePayload;
    validationErrors: ExecutionRecordInsertRouteValidationError[];
  };

export type ExecutionRecordInsertRouteNeedsReviewResponse =
  ExecutionRecordInsertRouteResponseBase & {
    status: "needs_review";
    persistedRecord?: undefined;
    duplicate?: ExecutionRecordInsertRouteDuplicatePayload;
    rejectionReasons: ExecutionRecordPersistenceRejectionReason[];
  };

export type ExecutionRecordInsertRouteErrorResponse =
  ExecutionRecordInsertRouteResponseBase & {
    status: "error";
    persistedRecord?: undefined;
    duplicate?: ExecutionRecordInsertRouteDuplicatePayload;
    errorCode: ExecutionRecordInsertRouteErrorCode;
    errorMessage: string;
  };

export type ExecutionRecordInsertRouteDryRunResponse =
  ExecutionRecordInsertRouteResponseBase & {
    status: "dry_run";
    persistedRecord?: undefined;
    duplicate?: ExecutionRecordInsertRouteDuplicatePayload;
    dryRunMetadata: ExecutionRecordInsertRouteDryRunMetadata;
  };

export type ExecutionRecordInsertRouteResponse =
  | ExecutionRecordInsertRouteInsertedResponse
  | ExecutionRecordInsertRouteDuplicateResponse
  | ExecutionRecordInsertRouteRejectedResponse
  | ExecutionRecordInsertRouteNeedsReviewResponse
  | ExecutionRecordInsertRouteErrorResponse
  | ExecutionRecordInsertRouteDryRunResponse;
