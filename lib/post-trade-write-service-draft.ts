import type {
  PostTradePayloadValidationAcceptedPayload,
  PostTradePayloadValidationRejectedField,
  PostTradePayloadValidationResult,
} from "@/lib/post-trade-payload-validator";
import type {
  PostTradePersistenceDryRunPlan,
  PostTradePersistenceTargetTable,
} from "@/lib/post-trade-persistence-service-plan";

export type PostTradeWriteServiceDraftStatus =
  | "ready_no_remote_write"
  | "blocked_invalid_validation_result"
  | "blocked_missing_accepted_payload"
  | "blocked_missing_dry_run_plan"
  | "blocked_unready_dry_run_plan"
  | "blocked_idempotency_mismatch"
  | "blocked_unsafe_safety_flags"
  | "blocked_unsafe_payload";

export type PostTradeWriteServiceDraftRecordValue =
  | string
  | number
  | boolean
  | null;

export type PostTradeWriteServiceDraftRecordBody = Record<
  string,
  PostTradeWriteServiceDraftRecordValue
>;

export type PostTradeWriteServiceDraftCommand = {
  table: PostTradePersistenceTargetTable;
  operationType: "prepared_insert_command";
  executionMode: "dry_run_command_only";
  remoteExecution: false;
  idempotencyKey: string;
  recordBody: PostTradeWriteServiceDraftRecordBody;
};

export type PostTradeWriteServiceDraftAuditCommand = {
  table: "execution_record_audit_events";
  operationType: "prepared_audit_insert_command";
  executionMode: "dry_run_command_only";
  remoteExecution: false;
  eventType: "post_trade_write_command_draft_created";
  idempotencyKey: string;
  recordBody: PostTradeWriteServiceDraftRecordBody;
};

export type PostTradeWriteServiceDraftSafetyFlags = {
  validationResultRequired: true;
  acceptedPayloadRequired: true;
  dryRunPlanRequired: true;
  dryRunPlanReadyRequired: true;
  allowlistedPayloadOnly: boolean;
  noRawBrokerPayload: boolean;
  noRawAvanzaOrBrowserState: boolean;
  noCredentialSessionOrBankIdMaterial: boolean;
  noUnredactedBrokerDocument: boolean;
  noArbitraryJsonBlob: boolean;
  sanitizedRecordBodyOnly: boolean;
  noServiceClientFactoryImport: true;
  noSupabaseClientImport: true;
  noServiceRoleUsage: true;
  noRemoteWrite: true;
  noDatabaseConnection: true;
  noRuntimeActivation: true;
  noTradeUiExecution: true;
  productionBlocked: true;
};

export type PostTradeWriteServiceDraftResult =
  | {
      contractVersion: "post_trade_write_service_draft_v1";
      status: "ready_no_remote_write";
      ready: true;
      executionMode: "dry_run_command_only";
      writeCommands: PostTradeWriteServiceDraftCommand[];
      auditCommand: PostTradeWriteServiceDraftAuditCommand;
      idempotencyKey: string;
      safetyFlags: PostTradeWriteServiceDraftSafetyFlags;
      rejectedFields: [];
      reasons: [];
    }
  | {
      contractVersion: "post_trade_write_service_draft_v1";
      status: Exclude<PostTradeWriteServiceDraftStatus, "ready_no_remote_write">;
      ready: false;
      executionMode: "no_remote_write";
      writeCommands: [];
      auditCommand: null;
      idempotencyKey: null;
      safetyFlags: PostTradeWriteServiceDraftSafetyFlags;
      rejectedFields: PostTradePayloadValidationRejectedField[];
      reasons: string[];
    };

const CONTRACT_VERSION = "post_trade_write_service_draft_v1" as const;

const forbiddenAcceptedPayloadFields = [
  "credentials",
  "password",
  "BankID",
  "bankIdData",
  "cookie",
  "cookies",
  "session",
  "sessionToken",
  "authToken",
  "accessToken",
  "refreshToken",
  "apiToken",
  "supabaseServiceKey",
  "serviceRoleKey",
  "anonKey",
  "jwtSecret",
  "rawBrokerPayload",
  "rawBrokerPage",
  "rawBrokerState",
  "rawAvanzaState",
  "rawBrowserState",
  "rawBrowserStorage",
  "networkDump",
  "rawPdf",
  "rawScreenshot",
  "rawHtml",
  "unredactedSettlementNote",
  "unredactedBrokerConfirmation",
  "brokerDocument",
  "arbitraryJson",
  "jsonBlob",
  "payloadBlob",
  "orderSubmissionAuthority",
  "finalBuyAuthority",
  "finalSellAuthority",
  "brokerAuthority",
  "liveOrderIntent",
  "liveTradeMutationAuthority",
  "livePositionMutationAuthority",
] as const;

const commandAllowedPayloadFields = [
  "payloadCategory",
  "internalTradeId",
  "planId",
  "contractId",
  "reviewId",
  "extractionId",
  "idempotencyKey",
  "duplicatePreventionKey",
  "sourceFingerprint",
  "redactedEvidenceArtifactId",
  "side",
  "ticker",
  "quantity",
  "plannedPrice",
  "executionPrice",
  "slippage",
  "currency",
  "commission",
  "fxRate",
  "grossAmount",
  "settlementAmount",
  "deviationClassification",
  "manualReviewStatus",
  "extractionTimestamp",
  "reviewedBySafeActorLabel",
  "brokerLabel",
  "evidenceKind",
  "evidenceTimestamp",
  "executionIntentSide",
  "executionResultSide",
  "executionIntentTicker",
  "executionResultTicker",
  "executionIntentQuantity",
  "executionResultQuantity",
  "redactionStatus",
  "sensitiveDataPresent",
  "supabaseWriteAuthority",
  "productionPersistenceAllowed",
  "rawArtifactStored",
  "learningAutoUpdateAllowed",
  "learningCandidateStatus",
  "outcomeEligible",
  "requiresSeparateLearningGate",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isSafeRecordValue(
  value: unknown,
): value is PostTradeWriteServiceDraftRecordValue {
  return (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean" ||
    (typeof value === "number" && Number.isFinite(value))
  );
}

function baseSafetyFlags(
  validation?: PostTradePayloadValidationResult,
): PostTradeWriteServiceDraftSafetyFlags {
  return {
    validationResultRequired: true,
    acceptedPayloadRequired: true,
    dryRunPlanRequired: true,
    dryRunPlanReadyRequired: true,
    allowlistedPayloadOnly:
      validation?.valid === true && validation.safetyFlags.allowlistedPayloadOnly,
    noRawBrokerPayload:
      validation?.valid === true && validation.safetyFlags.noRawBrokerPayload,
    noRawAvanzaOrBrowserState:
      validation?.valid === true &&
      validation.safetyFlags.noRawAvanzaOrBrowserState,
    noCredentialSessionOrBankIdMaterial:
      validation?.valid === true &&
      validation.safetyFlags.noCredentialSessionOrBankIdMaterial,
    noUnredactedBrokerDocument:
      validation?.valid === true &&
      validation.safetyFlags.noUnredactedBrokerDocument,
    noArbitraryJsonBlob:
      validation?.valid === true && validation.safetyFlags.noArbitraryJsonBlob,
    sanitizedRecordBodyOnly: true,
    noServiceClientFactoryImport: true,
    noSupabaseClientImport: true,
    noServiceRoleUsage: true,
    noRemoteWrite: true,
    noDatabaseConnection: true,
    noRuntimeActivation: true,
    noTradeUiExecution: true,
    productionBlocked: true,
  };
}

function blockedResult(input: {
  status: Exclude<PostTradeWriteServiceDraftStatus, "ready_no_remote_write">;
  validation?: PostTradePayloadValidationResult;
  rejectedFields: PostTradePayloadValidationRejectedField[];
  reasons: string[];
}): PostTradeWriteServiceDraftResult {
  return {
    contractVersion: CONTRACT_VERSION,
    status: input.status,
    ready: false,
    executionMode: "no_remote_write",
    writeCommands: [],
    auditCommand: null,
    idempotencyKey: null,
    safetyFlags: baseSafetyFlags(input.validation),
    rejectedFields: input.rejectedFields,
    reasons: input.reasons,
  };
}

function safetyFlagsAreReady(validation: PostTradePayloadValidationResult) {
  return (
    validation.valid === true &&
    validation.safetyFlags.allowlistedPayloadOnly &&
    validation.safetyFlags.noRawBrokerPayload &&
    validation.safetyFlags.noRawAvanzaOrBrowserState &&
    validation.safetyFlags.noCredentialSessionOrBankIdMaterial &&
    validation.safetyFlags.noUnredactedBrokerDocument &&
    validation.safetyFlags.noArbitraryJsonBlob &&
    validation.safetyFlags.noSupabaseWriteAuthority &&
    validation.safetyFlags.noProductionPersistence &&
    validation.safetyFlags.noRuntimeActivation &&
    validation.safetyFlags.noLiveTradeOrPositionMutation &&
    validation.safetyFlags.redactedOrSafeSummaryOnly &&
    validation.safetyFlags.idempotencyReady &&
    validation.safetyFlags.intentResultAligned
  );
}

function unsafeAcceptedPayloadFields(
  payload: PostTradePayloadValidationAcceptedPayload,
) {
  const record = payload as Record<string, unknown>;

  return forbiddenAcceptedPayloadFields
    .filter((field) => field in record)
    .map((field) => ({
      field,
      reason: "forbidden_field_in_accepted_payload",
    }));
}

function unsafeAcceptedPayloadValues(
  payload: PostTradePayloadValidationAcceptedPayload,
) {
  const record = payload as Record<string, unknown>;

  return commandAllowedPayloadFields
    .filter((field) => {
      const value = record[field];

      return value !== undefined && !isSafeRecordValue(value);
    })
    .map((field) => ({
      field,
      reason: "unsafe_accepted_payload_value",
    }));
}

function sanitizedRecordBodyFor(
  payload: PostTradePayloadValidationAcceptedPayload,
  table: PostTradePersistenceTargetTable,
): PostTradeWriteServiceDraftRecordBody {
  const payloadRecord = payload as Record<string, unknown>;
  const recordBody: PostTradeWriteServiceDraftRecordBody = {
    targetTable: table,
    payloadCategory: payload.payloadCategory,
    reviewId: payload.reviewId,
    extractionId: payload.extractionId,
    idempotencyKey: payload.idempotencyKey,
    redactionStatus: payload.redactionStatus,
    sensitiveDataPresent: false,
    productionPersistenceAllowed: false,
    rawArtifactStored: false,
  };

  for (const field of commandAllowedPayloadFields) {
    const value = payloadRecord[field];

    if (value === undefined || field in recordBody) {
      continue;
    }

    if (isSafeRecordValue(value)) {
      recordBody[field] = value;
    }
  }

  return recordBody;
}

function recordBodyContainsUnsafeValue(
  recordBody: PostTradeWriteServiceDraftRecordBody,
) {
  return Object.values(recordBody).some((value) => !isSafeRecordValue(value));
}

export function buildPostTradeWriteServiceDraftCommands(input: {
  validationResult: unknown;
  dryRunPlan: unknown;
}): PostTradeWriteServiceDraftResult {
  if (!isRecord(input.validationResult) || input.validationResult.valid !== true) {
    const invalidValidation = input.validationResult as
      | PostTradePayloadValidationResult
      | undefined;

    return blockedResult({
      status: "blocked_invalid_validation_result",
      validation:
        invalidValidation?.valid === false ? invalidValidation : undefined,
      rejectedFields:
        invalidValidation?.valid === false
          ? invalidValidation.rejectedFields
          : [{ field: "validationResult", reason: "valid_validation_required" }],
      reasons:
        invalidValidation?.valid === false && invalidValidation.reasons.length > 0
          ? invalidValidation.reasons
          : ["validationResult:valid_validation_required"],
    });
  }

  const validationResult =
    input.validationResult as PostTradePayloadValidationResult;

  if (!isRecord(validationResult.acceptedPayload)) {
    return blockedResult({
      status: "blocked_missing_accepted_payload",
      validation: validationResult,
      rejectedFields: [
        { field: "acceptedPayload", reason: "accepted_payload_required" },
      ],
      reasons: ["acceptedPayload:accepted_payload_required"],
    });
  }

  if (!isRecord(input.dryRunPlan)) {
    return blockedResult({
      status: "blocked_missing_dry_run_plan",
      validation: validationResult,
      rejectedFields: [
        { field: "dryRunPlan", reason: "dry_run_plan_required" },
      ],
      reasons: ["dryRunPlan:dry_run_plan_required"],
    });
  }

  const dryRunPlan = input.dryRunPlan as PostTradePersistenceDryRunPlan;

  if (dryRunPlan.ready !== true || dryRunPlan.auditEventPlan === null) {
    return blockedResult({
      status: "blocked_unready_dry_run_plan",
      validation: validationResult,
      rejectedFields: [
        { field: "dryRunPlan", reason: "ready_dry_run_plan_required" },
      ],
      reasons: ["dryRunPlan:ready_dry_run_plan_required"],
    });
  }

  const acceptedPayload = validationResult.acceptedPayload;

  if (
    !acceptedPayload.idempotencyKey ||
    dryRunPlan.idempotencyKey !== acceptedPayload.idempotencyKey ||
    dryRunPlan.auditEventPlan.idempotencyKey !== acceptedPayload.idempotencyKey
  ) {
    return blockedResult({
      status: "blocked_idempotency_mismatch",
      validation: validationResult,
      rejectedFields: [
        { field: "idempotencyKey", reason: "idempotency_alignment_required" },
      ],
      reasons: ["idempotencyKey:idempotency_alignment_required"],
    });
  }

  if (!safetyFlagsAreReady(validationResult)) {
    return blockedResult({
      status: "blocked_unsafe_safety_flags",
      validation: validationResult,
      rejectedFields: [
        { field: "safetyFlags", reason: "unsafe_validation_safety_flags" },
      ],
      reasons: ["safetyFlags:unsafe_validation_safety_flags"],
    });
  }

  const unsafeFields = [
    ...unsafeAcceptedPayloadFields(acceptedPayload),
    ...unsafeAcceptedPayloadValues(acceptedPayload),
  ];

  if (unsafeFields.length > 0) {
    return blockedResult({
      status: "blocked_unsafe_payload",
      validation: validationResult,
      rejectedFields: unsafeFields,
      reasons: unsafeFields.map((field) => `${field.field}:${field.reason}`),
    });
  }

  const writeCommands = dryRunPlan.targetTables.map((table) => ({
    table,
    operationType: "prepared_insert_command" as const,
    executionMode: "dry_run_command_only" as const,
    remoteExecution: false as const,
    idempotencyKey: acceptedPayload.idempotencyKey,
    recordBody: sanitizedRecordBodyFor(acceptedPayload, table),
  }));

  const unsafeRecordBody = writeCommands.find((command) =>
    recordBodyContainsUnsafeValue(command.recordBody),
  );

  if (unsafeRecordBody) {
    return blockedResult({
      status: "blocked_unsafe_payload",
      validation: validationResult,
      rejectedFields: [
        { field: unsafeRecordBody.table, reason: "unsafe_record_body_value" },
      ],
      reasons: [`${unsafeRecordBody.table}:unsafe_record_body_value`],
    });
  }

  return {
    contractVersion: CONTRACT_VERSION,
    status: "ready_no_remote_write",
    ready: true,
    executionMode: "dry_run_command_only",
    writeCommands,
    auditCommand: {
      table: "execution_record_audit_events",
      operationType: "prepared_audit_insert_command",
      executionMode: "dry_run_command_only",
      remoteExecution: false,
      eventType: "post_trade_write_command_draft_created",
      idempotencyKey: acceptedPayload.idempotencyKey,
      recordBody: {
        eventType: "post_trade_write_command_draft_created",
        payloadCategory: acceptedPayload.payloadCategory,
        reviewId: acceptedPayload.reviewId,
        extractionId: acceptedPayload.extractionId,
        idempotencyKey: acceptedPayload.idempotencyKey,
        targetTableCount: writeCommands.length,
        remoteExecution: false,
      },
    },
    idempotencyKey: acceptedPayload.idempotencyKey,
    safetyFlags: baseSafetyFlags(validationResult),
    rejectedFields: [],
    reasons: [],
  };
}
