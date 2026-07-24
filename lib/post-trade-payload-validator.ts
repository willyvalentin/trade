export type PostTradePayloadCategory =
  | "settlement_review"
  | "broker_confirmation_evidence_metadata"
  | "cost_breakdown"
  | "deviation_review"
  | "manual_review_status"
  | "learning_candidate";

export type PostTradeDeviationClassification =
  | "execution_match"
  | "minor_execution_deviation"
  | "major_execution_deviation"
  | "requires_manual_review"
  | "blocked_sensitive_or_mismatched_evidence";

export type PostTradeManualReviewStatus =
  | "not_required"
  | "required"
  | "approved_for_review_only"
  | "blocked";

export type PostTradePayloadValidationAcceptedPayload = {
  payloadCategory: PostTradePayloadCategory;
  internalTradeId?: string;
  planId?: string;
  contractId?: string;
  reviewId: string;
  extractionId: string;
  idempotencyKey: string;
  duplicatePreventionKey?: string;
  sourceFingerprint?: string;
  redactedEvidenceArtifactId?: string;
  side?: "BUY" | "SELL";
  ticker?: string;
  quantity?: number;
  plannedPrice?: number;
  executionPrice?: number;
  slippage?: number;
  currency?: string;
  commission?: number;
  fxRate?: number;
  grossAmount?: number;
  settlementAmount?: number;
  deviationClassification?: PostTradeDeviationClassification;
  manualReviewStatus: PostTradeManualReviewStatus;
  extractionTimestamp: string;
  reviewedBySafeActorLabel?: string;
  brokerLabel?: string;
  evidenceKind?: "redacted_confirmation_metadata";
  evidenceTimestamp?: string;
  executionIntentSide?: "BUY" | "SELL";
  executionResultSide?: "BUY" | "SELL";
  executionIntentTicker?: string;
  executionResultTicker?: string;
  executionIntentQuantity?: number;
  executionResultQuantity?: number;
  redactionStatus: "redacted" | "safe_summary_only";
  sensitiveDataPresent: false;
  supabaseWriteAuthority: false;
  productionPersistenceAllowed: false;
  rawArtifactStored: false;
  learningAutoUpdateAllowed: false;
  learningCandidateStatus?: "staged_manual_review_only";
  outcomeEligible?: false;
  requiresSeparateLearningGate?: true;
};

export type PostTradePayloadSafetyFlags = {
  allowlistedPayloadOnly: boolean;
  noUnknownTopLevelFields: boolean;
  noRawBrokerPayload: boolean;
  noRawAvanzaOrBrowserState: boolean;
  noCredentialSessionOrBankIdMaterial: boolean;
  noUnredactedBrokerDocument: boolean;
  metadataOnlyBrokerConfirmation: boolean;
  noArbitraryJsonBlob: boolean;
  noSupabaseWriteAuthority: boolean;
  noProductionPersistence: boolean;
  noRuntimeActivation: boolean;
  noLiveTradeOrPositionMutation: boolean;
  redactedOrSafeSummaryOnly: boolean;
  idempotencyReady: boolean;
  intentResultAligned: boolean;
};

export type PostTradePayloadValidationRejectedField = {
  field: string;
  reason: string;
};

export type PostTradePayloadValidationResult =
  | {
      valid: true;
      acceptedPayload: PostTradePayloadValidationAcceptedPayload;
      rejectedFields: [];
      reasons: [];
      safetyFlags: PostTradePayloadSafetyFlags;
    }
  | {
      valid: false;
      acceptedPayload: null;
      rejectedFields: PostTradePayloadValidationRejectedField[];
      reasons: string[];
      safetyFlags: PostTradePayloadSafetyFlags;
    };

export const postTradePayloadValidatorAllowedFields = [
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

export const postTradePayloadValidatorRejectedFields = [
  "credentials",
  "password",
  "BankID",
  "bankIdData",
  "MFA",
  "mfaCode",
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
  "accountNumber",
  "accountId",
  "customerId",
  "personalIdentityNumber",
  "personnummer",
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
  "apiRouteActivation",
  "tradeUiExecution",
  "browserAutomation",
  "avanzaBridgeSession",
  "cookieSessionExport",
  "bankIdAutomation",
] as const;

const allowedFieldSet = new Set<string>(postTradePayloadValidatorAllowedFields);
const rejectedFieldSet = new Set<string>(postTradePayloadValidatorRejectedFields);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isBuySell(value: unknown): value is "BUY" | "SELL" {
  return value === "BUY" || value === "SELL";
}

function addRejection(
  rejectedFields: PostTradePayloadValidationRejectedField[],
  field: string,
  reason: string,
) {
  rejectedFields.push({ field, reason });
}

function requireText(
  payload: Record<string, unknown>,
  field: string,
  rejectedFields: PostTradePayloadValidationRejectedField[],
) {
  if (!hasText(payload[field])) {
    addRejection(rejectedFields, field, "required_text_missing");
  }
}

function requireNumber(
  payload: Record<string, unknown>,
  field: string,
  rejectedFields: PostTradePayloadValidationRejectedField[],
) {
  if (!isFiniteNumber(payload[field])) {
    addRejection(rejectedFields, field, "required_number_missing_or_invalid");
  }
}

function hasRejectedField(payload: Record<string, unknown>, fields: readonly string[]) {
  return fields.some((field) => field in payload);
}

function hasNestedOrBlobValue(payload: Record<string, unknown>) {
  return Object.entries(payload).some(([, value]) => {
    if (Array.isArray(value)) {
      return true;
    }

    return Boolean(value) && typeof value === "object";
  });
}

function buildSafetyFlags(
  payload: Record<string, unknown>,
  rejectedFields: PostTradePayloadValidationRejectedField[],
) {
  const rejectedFieldNames = new Set(rejectedFields.map((field) => field.field));
  const unknownFieldRejected = rejectedFields.some(
    (field) => field.reason === "unknown_top_level_field",
  );
  const arbitraryJsonRejected = rejectedFields.some(
    (field) => field.reason === "arbitrary_json_blob_rejected",
  );
  const rawBrokerFields = [
    "rawBrokerPayload",
    "rawBrokerPage",
    "rawBrokerState",
    "rawPdf",
    "rawScreenshot",
    "rawHtml",
    "unredactedSettlementNote",
    "unredactedBrokerConfirmation",
    "brokerDocument",
  ];
  const rawBrowserFields = [
    "rawAvanzaState",
    "rawBrowserState",
    "rawBrowserStorage",
    "networkDump",
  ];
  const credentialFields = [
    "credentials",
    "password",
    "BankID",
    "bankIdData",
    "MFA",
    "mfaCode",
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
  ];
  const runtimeFields = [
    "apiRouteActivation",
    "tradeUiExecution",
    "browserAutomation",
    "avanzaBridgeSession",
    "cookieSessionExport",
    "bankIdAutomation",
    "orderSubmissionAuthority",
    "finalBuyAuthority",
    "finalSellAuthority",
    "brokerAuthority",
    "liveOrderIntent",
  ];
  const liveMutationFields = [
    "liveTradeMutationAuthority",
    "livePositionMutationAuthority",
  ];

  return {
    allowlistedPayloadOnly: !unknownFieldRejected && !arbitraryJsonRejected,
    noUnknownTopLevelFields: !unknownFieldRejected,
    noRawBrokerPayload: !hasRejectedField(payload, rawBrokerFields),
    noRawAvanzaOrBrowserState: !hasRejectedField(payload, rawBrowserFields),
    noCredentialSessionOrBankIdMaterial: !hasRejectedField(
      payload,
      credentialFields,
    ),
    noUnredactedBrokerDocument: !hasRejectedField(payload, [
      "unredactedSettlementNote",
      "unredactedBrokerConfirmation",
      "brokerDocument",
    ]),
    metadataOnlyBrokerConfirmation:
      payload.payloadCategory !== "broker_confirmation_evidence_metadata" ||
      (payload.evidenceKind === "redacted_confirmation_metadata" &&
        payload.rawArtifactStored === false &&
        !hasRejectedField(payload, rawBrokerFields)),
    noArbitraryJsonBlob: !arbitraryJsonRejected,
    noSupabaseWriteAuthority: payload.supabaseWriteAuthority === false,
    noProductionPersistence: payload.productionPersistenceAllowed === false,
    noRuntimeActivation: !hasRejectedField(payload, runtimeFields),
    noLiveTradeOrPositionMutation: !hasRejectedField(payload, liveMutationFields),
    redactedOrSafeSummaryOnly:
      payload.redactionStatus === "redacted" ||
      payload.redactionStatus === "safe_summary_only",
    idempotencyReady:
      hasText(payload.idempotencyKey) &&
      !rejectedFieldNames.has("idempotencyKey"),
    intentResultAligned: !rejectedFields.some(
      (field) => field.reason === "intent_result_mismatch",
    ),
  } satisfies PostTradePayloadSafetyFlags;
}

function validateCommonFields(
  payload: Record<string, unknown>,
  rejectedFields: PostTradePayloadValidationRejectedField[],
) {
  for (const [field, value] of Object.entries(payload)) {
    if (!allowedFieldSet.has(field)) {
      addRejection(
        rejectedFields,
        field,
        rejectedFieldSet.has(field)
          ? "rejected_sensitive_or_authority_field"
          : "unknown_top_level_field",
      );
    }

    if (rejectedFieldSet.has(field)) {
      addRejection(rejectedFields, field, "rejected_sensitive_or_authority_field");
    }

    if (Array.isArray(value) || (Boolean(value) && typeof value === "object")) {
      addRejection(rejectedFields, field, "arbitrary_json_blob_rejected");
    }
  }

  requireText(payload, "reviewId", rejectedFields);
  requireText(payload, "extractionId", rejectedFields);
  requireText(payload, "idempotencyKey", rejectedFields);
  requireText(payload, "extractionTimestamp", rejectedFields);

  if (
    payload.redactionStatus !== "redacted" &&
    payload.redactionStatus !== "safe_summary_only"
  ) {
    addRejection(rejectedFields, "redactionStatus", "redaction_required");
  }
  if (payload.sensitiveDataPresent !== false) {
    addRejection(
      rejectedFields,
      "sensitiveDataPresent",
      "sensitive_data_must_be_false",
    );
  }
  if (payload.supabaseWriteAuthority !== false) {
    addRejection(
      rejectedFields,
      "supabaseWriteAuthority",
      "write_authority_must_be_false",
    );
  }
  if (payload.productionPersistenceAllowed !== false) {
    addRejection(
      rejectedFields,
      "productionPersistenceAllowed",
      "production_persistence_must_be_false",
    );
  }
  if (payload.rawArtifactStored !== false) {
    addRejection(rejectedFields, "rawArtifactStored", "raw_artifact_must_be_false");
  }
  if (payload.learningAutoUpdateAllowed !== false) {
    addRejection(
      rejectedFields,
      "learningAutoUpdateAllowed",
      "learning_auto_update_must_be_false",
    );
  }
}

function validateCategoryFields(
  payload: Record<string, unknown>,
  rejectedFields: PostTradePayloadValidationRejectedField[],
) {
  switch (payload.payloadCategory) {
    case "settlement_review":
      for (const field of [
        "internalTradeId",
        "planId",
        "contractId",
        "redactedEvidenceArtifactId",
        "side",
        "ticker",
        "currency",
        "deviationClassification",
        "manualReviewStatus",
      ]) {
        requireText(payload, field, rejectedFields);
      }
      for (const field of [
        "quantity",
        "plannedPrice",
        "executionPrice",
        "slippage",
        "commission",
        "grossAmount",
        "settlementAmount",
      ]) {
        requireNumber(payload, field, rejectedFields);
      }
      break;
    case "broker_confirmation_evidence_metadata":
      for (const field of [
        "internalTradeId",
        "redactedEvidenceArtifactId",
        "side",
        "ticker",
        "currency",
        "brokerLabel",
        "evidenceKind",
        "evidenceTimestamp",
      ]) {
        requireText(payload, field, rejectedFields);
      }
      for (const field of ["quantity", "executionPrice"]) {
        requireNumber(payload, field, rejectedFields);
      }
      if (payload.evidenceKind !== "redacted_confirmation_metadata") {
        addRejection(
          rejectedFields,
          "evidenceKind",
          "broker_confirmation_must_be_redacted_metadata",
        );
      }
      break;
    case "cost_breakdown":
      for (const field of ["internalTradeId", "currency"]) {
        requireText(payload, field, rejectedFields);
      }
      for (const field of ["commission", "grossAmount", "settlementAmount"]) {
        requireNumber(payload, field, rejectedFields);
      }
      break;
    case "deviation_review":
      for (const field of [
        "internalTradeId",
        "side",
        "ticker",
        "currency",
        "deviationClassification",
        "manualReviewStatus",
      ]) {
        requireText(payload, field, rejectedFields);
      }
      for (const field of [
        "quantity",
        "plannedPrice",
        "executionPrice",
        "slippage",
      ]) {
        requireNumber(payload, field, rejectedFields);
      }
      break;
    case "manual_review_status":
      for (const field of [
        "internalTradeId",
        "deviationClassification",
        "manualReviewStatus",
        "reviewedBySafeActorLabel",
      ]) {
        requireText(payload, field, rejectedFields);
      }
      break;
    case "learning_candidate":
      for (const field of [
        "internalTradeId",
        "deviationClassification",
        "manualReviewStatus",
        "learningCandidateStatus",
        "reviewedBySafeActorLabel",
      ]) {
        requireText(payload, field, rejectedFields);
      }
      if (payload.learningCandidateStatus !== "staged_manual_review_only") {
        addRejection(
          rejectedFields,
          "learningCandidateStatus",
          "learning_candidate_must_be_staged_only",
        );
      }
      if (payload.outcomeEligible !== false) {
        addRejection(
          rejectedFields,
          "outcomeEligible",
          "learning_candidate_outcome_must_not_be_eligible",
        );
      }
      if (payload.requiresSeparateLearningGate !== true) {
        addRejection(
          rejectedFields,
          "requiresSeparateLearningGate",
          "learning_candidate_requires_separate_gate",
        );
      }
      break;
    default:
      addRejection(
        rejectedFields,
        "payloadCategory",
        "payload_category_not_recognized",
      );
  }
}

function validateIntentResultAlignment(
  payload: Record<string, unknown>,
  rejectedFields: PostTradePayloadValidationRejectedField[],
) {
  if (
    hasText(payload.executionIntentSide) &&
    hasText(payload.executionResultSide) &&
    payload.executionIntentSide !== payload.executionResultSide
  ) {
    addRejection(rejectedFields, "executionResultSide", "intent_result_mismatch");
  }
  if (
    hasText(payload.executionIntentTicker) &&
    hasText(payload.executionResultTicker) &&
    payload.executionIntentTicker !== payload.executionResultTicker
  ) {
    addRejection(
      rejectedFields,
      "executionResultTicker",
      "intent_result_mismatch",
    );
  }
  if (
    isFiniteNumber(payload.executionIntentQuantity) &&
    isFiniteNumber(payload.executionResultQuantity) &&
    payload.executionIntentQuantity !== payload.executionResultQuantity
  ) {
    addRejection(
      rejectedFields,
      "executionResultQuantity",
      "intent_result_mismatch",
    );
  }

  if ("side" in payload && !isBuySell(payload.side)) {
    addRejection(rejectedFields, "side", "side_must_be_buy_or_sell");
  }
  if ("executionIntentSide" in payload && !isBuySell(payload.executionIntentSide)) {
    addRejection(
      rejectedFields,
      "executionIntentSide",
      "side_must_be_buy_or_sell",
    );
  }
  if ("executionResultSide" in payload && !isBuySell(payload.executionResultSide)) {
    addRejection(
      rejectedFields,
      "executionResultSide",
      "side_must_be_buy_or_sell",
    );
  }
}

function uniqueRejections(
  rejectedFields: PostTradePayloadValidationRejectedField[],
) {
  const seen = new Set<string>();

  return rejectedFields.filter((rejection) => {
    const key = `${rejection.field}:${rejection.reason}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function validatePostTradePersistencePayload(
  input: unknown,
): PostTradePayloadValidationResult {
  if (!isRecord(input)) {
    const rejectedFields = [
      { field: "payload", reason: "payload_must_be_object" },
    ];
    const safetyFlags = buildSafetyFlags({}, rejectedFields);

    return {
      valid: false,
      acceptedPayload: null,
      rejectedFields,
      reasons: rejectedFields.map((field) => `${field.field}:${field.reason}`),
      safetyFlags,
    };
  }

  const rejectedFields: PostTradePayloadValidationRejectedField[] = [];

  validateCommonFields(input, rejectedFields);
  validateCategoryFields(input, rejectedFields);
  validateIntentResultAlignment(input, rejectedFields);

  if (hasNestedOrBlobValue(input)) {
    for (const [field, value] of Object.entries(input)) {
      if (Array.isArray(value) || (Boolean(value) && typeof value === "object")) {
        addRejection(rejectedFields, field, "arbitrary_json_blob_rejected");
      }
    }
  }

  const uniqueRejectedFields = uniqueRejections(rejectedFields);
  const safetyFlags = buildSafetyFlags(input, uniqueRejectedFields);

  if (uniqueRejectedFields.length > 0) {
    return {
      valid: false,
      acceptedPayload: null,
      rejectedFields: uniqueRejectedFields,
      reasons: uniqueRejectedFields.map(
        (field) => `${field.field}:${field.reason}`,
      ),
      safetyFlags,
    };
  }

  return {
    valid: true,
    acceptedPayload: input as PostTradePayloadValidationAcceptedPayload,
    rejectedFields: [],
    reasons: [],
    safetyFlags,
  };
}
