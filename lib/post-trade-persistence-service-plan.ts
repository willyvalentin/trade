import type {
  PostTradePayloadCategory,
  PostTradePayloadValidationAcceptedPayload,
  PostTradePayloadValidationRejectedField,
  PostTradePayloadValidationResult,
} from "@/lib/post-trade-payload-validator";

export type PostTradePersistenceTargetTable =
  | "execution_settlement_reviews"
  | "execution_confirmation_evidence"
  | "execution_cost_breakdowns"
  | "execution_deviation_reviews"
  | "execution_learning_candidates"
  | "execution_redacted_artifacts"
  | "execution_record_audit_events";

export type PostTradePersistenceDryRunOperation = {
  table: PostTradePersistenceTargetTable;
  operationType: "dry_run_planned_insert";
  mode: "no_write_plan_only";
};

export type PostTradePersistenceDryRunSafetyFlags = {
  validationResultRequired: true;
  acceptedPayloadRequired: true;
  allowlistedPayloadOnly: boolean;
  metadataOnlyBrokerConfirmation: boolean;
  noRawBrokerPayload: boolean;
  noRawAvanzaOrBrowserState: boolean;
  noCredentialSessionOrBankIdMaterial: boolean;
  noUnredactedBrokerDocument: boolean;
  noArbitraryJsonBlob: boolean;
  noSupabaseClientImport: true;
  noServiceRoleUsage: true;
  noDatabaseConnection: true;
  noDatabaseWrite: true;
  noRuntimeActivation: true;
  noTradeUiExecution: true;
  noLiveTradeOrPositionMutation: true;
  productionBlocked: true;
  stagingApplicationWriteBlocked: true;
};

export type PostTradePersistenceDryRunAuditEventPlan = {
  table: "execution_record_audit_events";
  eventType: "post_trade_persistence_dry_run_plan_created";
  wouldWrite: false;
  payloadCategory: PostTradePayloadCategory;
  reviewId: string;
  extractionId: string;
  idempotencyKey: string;
};

export type PostTradePersistenceDryRunPlan =
  | {
      contractVersion: "post_trade_persistence_service_plan_v1";
      status: "ready_for_future_gated_write";
      ready: true;
      targetTables: PostTradePersistenceTargetTable[];
      intendedOperations: PostTradePersistenceDryRunOperation[];
      idempotencyKey: string;
      duplicatePreventionKey: string | null;
      auditEventPlan: PostTradePersistenceDryRunAuditEventPlan;
      safetyFlags: PostTradePersistenceDryRunSafetyFlags;
      rejectedFields: [];
      reasons: [];
    }
  | {
      contractVersion: "post_trade_persistence_service_plan_v1";
      status:
        | "blocked_unvalidated_payload"
        | "blocked_invalid_validation_result"
        | "blocked_missing_accepted_payload"
        | "blocked_unsafe_payload";
      ready: false;
      targetTables: [];
      intendedOperations: [];
      idempotencyKey: null;
      duplicatePreventionKey: null;
      auditEventPlan: null;
      safetyFlags: PostTradePersistenceDryRunSafetyFlags;
      rejectedFields: PostTradePayloadValidationRejectedField[];
      reasons: string[];
    };

const CONTRACT_VERSION = "post_trade_persistence_service_plan_v1" as const;

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function baseSafetyFlags(
  validation?: PostTradePayloadValidationResult,
): PostTradePersistenceDryRunSafetyFlags {
  return {
    validationResultRequired: true,
    acceptedPayloadRequired: true,
    allowlistedPayloadOnly:
      validation?.valid === true && validation.safetyFlags.allowlistedPayloadOnly,
    metadataOnlyBrokerConfirmation:
      validation?.valid === true &&
      validation.safetyFlags.metadataOnlyBrokerConfirmation,
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
    noSupabaseClientImport: true,
    noServiceRoleUsage: true,
    noDatabaseConnection: true,
    noDatabaseWrite: true,
    noRuntimeActivation: true,
    noTradeUiExecution: true,
    noLiveTradeOrPositionMutation: true,
    productionBlocked: true,
    stagingApplicationWriteBlocked: true,
  };
}

function blockedPlan(input: {
  status: Extract<PostTradePersistenceDryRunPlan, { ready: false }>["status"];
  validation?: PostTradePayloadValidationResult;
  rejectedFields: PostTradePayloadValidationRejectedField[];
  reasons: string[];
}): PostTradePersistenceDryRunPlan {
  return {
    contractVersion: CONTRACT_VERSION,
    status: input.status,
    ready: false,
    targetTables: [],
    intendedOperations: [],
    idempotencyKey: null,
    duplicatePreventionKey: null,
    auditEventPlan: null,
    safetyFlags: baseSafetyFlags(input.validation),
    rejectedFields: input.rejectedFields,
    reasons: input.reasons,
  };
}

function targetTablesForPayload(
  payload: PostTradePayloadValidationAcceptedPayload,
): PostTradePersistenceTargetTable[] {
  const tables: PostTradePersistenceTargetTable[] = [];

  if (
    payload.redactedEvidenceArtifactId ||
    payload.payloadCategory === "broker_confirmation_evidence_metadata"
  ) {
    tables.push("execution_redacted_artifacts");
  }

  if (payload.payloadCategory === "broker_confirmation_evidence_metadata") {
    tables.push("execution_confirmation_evidence");
  }

  if (payload.payloadCategory === "settlement_review") {
    tables.push(
      "execution_confirmation_evidence",
      "execution_settlement_reviews",
      "execution_cost_breakdowns",
      "execution_deviation_reviews",
    );
  }

  if (payload.payloadCategory === "cost_breakdown") {
    tables.push("execution_cost_breakdowns");
  }

  if (
    payload.payloadCategory === "deviation_review" ||
    payload.payloadCategory === "manual_review_status"
  ) {
    tables.push("execution_deviation_reviews");
  }

  if (payload.payloadCategory === "learning_candidate") {
    tables.push("execution_learning_candidates");
  }

  tables.push("execution_record_audit_events");

  return [...new Set(tables)];
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

export function buildPostTradePersistenceDryRunPlan(
  validation: unknown,
): PostTradePersistenceDryRunPlan {
  if (!isRecord(validation) || typeof validation.valid !== "boolean") {
    return blockedPlan({
      status: "blocked_unvalidated_payload",
      rejectedFields: [
        { field: "validationResult", reason: "validation_result_required" },
      ],
      reasons: ["validationResult:validation_result_required"],
    });
  }

  const validationResult = validation as PostTradePayloadValidationResult;

  if (validationResult.valid !== true) {
    return blockedPlan({
      status: "blocked_invalid_validation_result",
      validation: validationResult,
      rejectedFields: validationResult.rejectedFields,
      reasons:
        validationResult.reasons.length > 0
          ? validationResult.reasons
          : ["validationResult:invalid"],
    });
  }

  if (!isRecord(validationResult.acceptedPayload)) {
    return blockedPlan({
      status: "blocked_missing_accepted_payload",
      validation: validationResult,
      rejectedFields: [
        { field: "acceptedPayload", reason: "accepted_payload_required" },
      ],
      reasons: ["acceptedPayload:accepted_payload_required"],
    });
  }

  const unsafeFields = unsafeAcceptedPayloadFields(validationResult.acceptedPayload);

  if (unsafeFields.length > 0 || !safetyFlagsAreReady(validationResult)) {
    const rejectedFields =
      unsafeFields.length > 0
        ? unsafeFields
        : [{ field: "safetyFlags", reason: "unsafe_validation_safety_flags" }];

    return blockedPlan({
      status: "blocked_unsafe_payload",
      validation: validationResult,
      rejectedFields,
      reasons: rejectedFields.map((field) => `${field.field}:${field.reason}`),
    });
  }

  const targetTables = targetTablesForPayload(validationResult.acceptedPayload);

  return {
    contractVersion: CONTRACT_VERSION,
    status: "ready_for_future_gated_write",
    ready: true,
    targetTables,
    intendedOperations: targetTables.map((table) => ({
      table,
      operationType: "dry_run_planned_insert",
      mode: "no_write_plan_only",
    })),
    idempotencyKey: validationResult.acceptedPayload.idempotencyKey,
    duplicatePreventionKey:
      validationResult.acceptedPayload.duplicatePreventionKey ?? null,
    auditEventPlan: {
      table: "execution_record_audit_events",
      eventType: "post_trade_persistence_dry_run_plan_created",
      wouldWrite: false,
      payloadCategory: validationResult.acceptedPayload.payloadCategory,
      reviewId: validationResult.acceptedPayload.reviewId,
      extractionId: validationResult.acceptedPayload.extractionId,
      idempotencyKey: validationResult.acceptedPayload.idempotencyKey,
    },
    safetyFlags: baseSafetyFlags(validationResult),
    rejectedFields: [],
    reasons: [],
  };
}
