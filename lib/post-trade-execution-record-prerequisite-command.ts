import type {
  PostTradePayloadValidationAcceptedPayload,
  PostTradePayloadValidationRejectedField,
  PostTradePayloadValidationResult,
} from "@/lib/post-trade-payload-validator";
import type { PostTradePersistenceDryRunPlan } from "@/lib/post-trade-persistence-service-plan";

export type PostTradeExecutionRecordPrerequisiteCommandStatus =
  | "ready_no_execution"
  | "blocked_invalid_validation_result"
  | "blocked_missing_accepted_payload"
  | "blocked_missing_dry_run_plan"
  | "blocked_unready_dry_run_plan"
  | "blocked_missing_idempotency"
  | "blocked_idempotency_mismatch"
  | "blocked_unsafe_flags"
  | "blocked_unsafe_payload"
  | "blocked_production_target";

export type PostTradeExecutionRecordPrerequisiteTarget = {
  environmentName?: string | null;
  projectRef?: string | null;
};

export type PostTradeExecutionRecordPrerequisiteRecordValue =
  | string
  | number
  | boolean
  | null;

export type PostTradeExecutionRecordPrerequisiteRecordBody = Record<
  string,
  PostTradeExecutionRecordPrerequisiteRecordValue
>;

export type PostTradeExecutionRecordPrerequisiteCommand = {
  commandId: "mock_execution_record_prerequisite";
  table: "execution_records";
  operationType: "prepared_execution_record_insert_command";
  executionMode: "no_execution_without_separate_gate";
  remoteExecution: false;
  stagingOnly: true;
  mockOnly: true;
  idempotencyKey: string;
  recordReference: "mock_execution_record_insert_result";
  recordBody: PostTradeExecutionRecordPrerequisiteRecordBody;
};

export type PostTradeExecutionRecordDependentAuditCommand = {
  commandId: "mock_execution_record_audit_event";
  table: "execution_record_audit_events";
  operationType: "prepared_dependent_audit_insert_command";
  executionMode: "no_execution_without_separate_gate";
  remoteExecution: false;
  stagingOnly: true;
  mockOnly: true;
  dependsOnCommandId: "mock_execution_record_prerequisite";
  executionRecordReference: "mock_execution_record_insert_result";
  idempotencyKey: string;
  recordBody: PostTradeExecutionRecordPrerequisiteRecordBody;
};

export type PostTradeExecutionRecordPrerequisiteSafetyFlags = {
  stagingOnly: true;
  mockTestOnly: true;
  noExecutionInThisAction: true;
  requiresFutureOneShotExecutionGate: true;
  targetTableAllowlist: readonly ["execution_records", "execution_record_audit_events"];
  commandAllowlist: readonly [
    "prepared_execution_record_insert_command",
    "prepared_dependent_audit_insert_command",
  ];
  auditRequired: true;
  executionRecordPrerequisiteRequired: true;
  placeholderReferenceRequired: true;
  noRawBrokerPayload: boolean;
  noRawAvanzaOrBrowserState: boolean;
  noCredentialSessionOrBankIdMaterial: boolean;
  noUnredactedBrokerDocument: boolean;
  noArbitraryJsonBlob: boolean;
  noRealBrokerOrAvanzaData: true;
  noSettlementOrOrderBehavior: true;
  noSupabaseClientImport: true;
  noServiceClientInstantiation: true;
  noRemoteWrite: true;
  noDatabaseWrite: true;
  noApiWriteBehavior: true;
  noRuntimeActivation: true;
  noTradeUiExecution: true;
  productionBlocked: true;
};

export type PostTradeExecutionRecordPrerequisiteCommandResult =
  | {
      contractVersion: "post_trade_execution_record_prerequisite_command_v1";
      status: "ready_no_execution";
      ready: true;
      executionMode: "no_execution_without_separate_gate";
      remoteExecution: false;
      target: {
        environmentName: "ture-staging";
        projectRef: "pdvzyuhykomwfqyyztru";
      };
      idempotencyKey: string;
      executionRecordCommand: PostTradeExecutionRecordPrerequisiteCommand;
      auditCommand: PostTradeExecutionRecordDependentAuditCommand;
      commandSet: [
        PostTradeExecutionRecordPrerequisiteCommand,
        PostTradeExecutionRecordDependentAuditCommand,
      ];
      safetyFlags: PostTradeExecutionRecordPrerequisiteSafetyFlags;
      rejectedFields: [];
      reasons: [];
    }
  | {
      contractVersion: "post_trade_execution_record_prerequisite_command_v1";
      status: Exclude<
        PostTradeExecutionRecordPrerequisiteCommandStatus,
        "ready_no_execution"
      >;
      ready: false;
      executionMode: "blocked_no_execution";
      remoteExecution: false;
      target: {
        environmentName: "ture-staging";
        projectRef: "pdvzyuhykomwfqyyztru";
      };
      idempotencyKey: null;
      executionRecordCommand: null;
      auditCommand: null;
      commandSet: [];
      safetyFlags: PostTradeExecutionRecordPrerequisiteSafetyFlags;
      rejectedFields: PostTradePayloadValidationRejectedField[];
      reasons: string[];
    };

const CONTRACT_VERSION =
  "post_trade_execution_record_prerequisite_command_v1" as const;
const STAGING_ENVIRONMENT_NAME = "ture-staging" as const;
const STAGING_PROJECT_REF = "pdvzyuhykomwfqyyztru" as const;
const TARGET_TABLE_ALLOWLIST = [
  "execution_records",
  "execution_record_audit_events",
] as const;
const COMMAND_ALLOWLIST = [
  "prepared_execution_record_insert_command",
  "prepared_dependent_audit_insert_command",
] as const;

const forbiddenPayloadKeys = [
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

function isSafeRecordValue(
  value: unknown,
): value is PostTradeExecutionRecordPrerequisiteRecordValue {
  return (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean" ||
    (typeof value === "number" && Number.isFinite(value))
  );
}

function isProductionLike(value: string | null | undefined) {
  if (!value) return false;
  return /\b(prod|production|trade)\b/i.test(value);
}

function containsForbiddenKey(value: unknown): boolean {
  if (!isRecord(value)) return false;

  for (const [key, nestedValue] of Object.entries(value)) {
    if ((forbiddenPayloadKeys as readonly string[]).includes(key)) {
      return true;
    }

    if (isRecord(nestedValue) && containsForbiddenKey(nestedValue)) {
      return true;
    }
  }

  return false;
}

function baseSafetyFlags(
  validation?: PostTradePayloadValidationResult,
): PostTradeExecutionRecordPrerequisiteSafetyFlags {
  return {
    stagingOnly: true,
    mockTestOnly: true,
    noExecutionInThisAction: true,
    requiresFutureOneShotExecutionGate: true,
    targetTableAllowlist: TARGET_TABLE_ALLOWLIST,
    commandAllowlist: COMMAND_ALLOWLIST,
    auditRequired: true,
    executionRecordPrerequisiteRequired: true,
    placeholderReferenceRequired: true,
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
    noRealBrokerOrAvanzaData: true,
    noSettlementOrOrderBehavior: true,
    noSupabaseClientImport: true,
    noServiceClientInstantiation: true,
    noRemoteWrite: true,
    noDatabaseWrite: true,
    noApiWriteBehavior: true,
    noRuntimeActivation: true,
    noTradeUiExecution: true,
    productionBlocked: true,
  };
}

function blockedResult(input: {
  status: Exclude<
    PostTradeExecutionRecordPrerequisiteCommandStatus,
    "ready_no_execution"
  >;
  validation?: PostTradePayloadValidationResult;
  rejectedFields: PostTradePayloadValidationRejectedField[];
  reasons: string[];
}): PostTradeExecutionRecordPrerequisiteCommandResult {
  return {
    contractVersion: CONTRACT_VERSION,
    status: input.status,
    ready: false,
    executionMode: "blocked_no_execution",
    remoteExecution: false,
    target: {
      environmentName: STAGING_ENVIRONMENT_NAME,
      projectRef: STAGING_PROJECT_REF,
    },
    idempotencyKey: null,
    executionRecordCommand: null,
    auditCommand: null,
    commandSet: [],
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

function unsafeAcceptedPayloadValues(
  payload: PostTradePayloadValidationAcceptedPayload,
) {
  return Object.entries(payload as Record<string, unknown>)
    .filter(([, value]) => value !== undefined && !isSafeRecordValue(value))
    .map(([field]) => ({ field, reason: "unsafe_accepted_payload_value" }));
}

function lowerSide(payload: PostTradePayloadValidationAcceptedPayload) {
  const side = payload.executionResultSide ?? payload.side;
  return side === "SELL" ? "sell" : "buy";
}

function positiveNumber(value: number | undefined, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : fallback;
}

function sanitizedExecutionRecordBody(
  payload: PostTradePayloadValidationAcceptedPayload,
): PostTradeExecutionRecordPrerequisiteRecordBody {
  const sourceFingerprint =
    payload.sourceFingerprint ?? `${payload.idempotencyKey}:source_fingerprint`;

  return {
    broker: "avanza",
    ticker: payload.executionResultTicker ?? payload.ticker ?? "TURMOCK",
    instrument_id: payload.contractId ?? null,
    instrument_name: "Ture mock post-trade execution",
    market: "STAGING_MOCK",
    instrument_type: "mock_equity",
    currency: payload.currency ?? "SEK",
    side: lowerSide(payload),
    execution_phase: "entry",
    execution_mode: "semi_automatic",
    quantity: positiveNumber(
      payload.executionResultQuantity ?? payload.quantity,
      1,
    ),
    price: positiveNumber(payload.executionPrice ?? payload.plannedPrice, 1),
    fees: payload.commission ?? null,
    gross_amount: payload.grossAmount ?? null,
    net_amount: payload.settlementAmount ?? null,
    confirmed_at: payload.extractionTimestamp,
    captured_at: payload.extractionTimestamp,
    idempotency_key: `${payload.idempotencyKey}:execution_record`,
    record_fingerprint: `${payload.idempotencyKey}:execution_record_fingerprint`,
    source_fingerprint: sourceFingerprint,
    source_environment: "staging",
    is_mock: true,
    is_dev: true,
    validation_status: "eligible",
  };
}

function sanitizedAuditRecordBody(
  payload: PostTradePayloadValidationAcceptedPayload,
): PostTradeExecutionRecordPrerequisiteRecordBody {
  return {
    execution_record_id_reference: "mock_execution_record_insert_result",
    event_type: "post_trade_staging_mock_execution_record_command_created",
    event_source: "post_trade_prerequisite_command_builder",
    event_status: "blocked",
    actor_type: "system",
    actor_id: "codex_staging_mock_write_gate",
    source_system: "post_trade_staging_mock",
    source_fingerprint:
      payload.sourceFingerprint ?? `${payload.idempotencyKey}:source_fingerprint`,
    idempotency_key: `${payload.idempotencyKey}:execution_record_audit`,
    duplicate_prevention_key:
      payload.duplicatePreventionKey ??
      `${payload.idempotencyKey}:execution_record_audit_duplicate`,
    payloadCategory: payload.payloadCategory,
    reviewId: payload.reviewId,
    extractionId: payload.extractionId,
    remoteExecution: false,
  };
}

function recordBodyIsSafe(
  body: PostTradeExecutionRecordPrerequisiteRecordBody,
) {
  return (
    Object.values(body).every(isSafeRecordValue) && !containsForbiddenKey(body)
  );
}

export function buildPostTradeExecutionRecordPrerequisiteCommands(input: {
  validationResult: unknown;
  dryRunPlan: unknown;
  target?: PostTradeExecutionRecordPrerequisiteTarget;
}): PostTradeExecutionRecordPrerequisiteCommandResult {
  const environmentName = input.target?.environmentName ?? STAGING_ENVIRONMENT_NAME;
  const projectRef = input.target?.projectRef ?? STAGING_PROJECT_REF;

  if (
    environmentName !== STAGING_ENVIRONMENT_NAME ||
    projectRef !== STAGING_PROJECT_REF ||
    isProductionLike(environmentName) ||
    isProductionLike(projectRef)
  ) {
    return blockedResult({
      status: "blocked_production_target",
      rejectedFields: [{ field: "target", reason: "staging_target_required" }],
      reasons: ["target:staging_target_required"],
    });
  }

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

  if (!acceptedPayload.idempotencyKey) {
    return blockedResult({
      status: "blocked_missing_idempotency",
      validation: validationResult,
      rejectedFields: [
        { field: "idempotencyKey", reason: "idempotency_key_required" },
      ],
      reasons: ["idempotencyKey:idempotency_key_required"],
    });
  }

  if (
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
      status: "blocked_unsafe_flags",
      validation: validationResult,
      rejectedFields: [
        { field: "safetyFlags", reason: "unsafe_validation_safety_flags" },
      ],
      reasons: ["safetyFlags:unsafe_validation_safety_flags"],
    });
  }

  const unsafeFields = unsafeAcceptedPayloadValues(acceptedPayload);
  const unsafePayload =
    unsafeFields.length > 0 ||
    containsForbiddenKey(acceptedPayload) ||
    containsForbiddenKey(dryRunPlan);

  if (unsafePayload) {
    return blockedResult({
      status: "blocked_unsafe_payload",
      validation: validationResult,
      rejectedFields:
        unsafeFields.length > 0
          ? unsafeFields
          : [{ field: "payload", reason: "unsafe_payload_fragment" }],
      reasons:
        unsafeFields.length > 0
          ? unsafeFields.map((field) => `${field.field}:${field.reason}`)
          : ["payload:unsafe_payload_fragment"],
    });
  }

  const executionRecordBody = sanitizedExecutionRecordBody(acceptedPayload);
  const auditRecordBody = sanitizedAuditRecordBody(acceptedPayload);

  if (!recordBodyIsSafe(executionRecordBody) || !recordBodyIsSafe(auditRecordBody)) {
    return blockedResult({
      status: "blocked_unsafe_payload",
      validation: validationResult,
      rejectedFields: [
        { field: "recordBody", reason: "unsafe_record_body_value" },
      ],
      reasons: ["recordBody:unsafe_record_body_value"],
    });
  }

  const executionRecordCommand: PostTradeExecutionRecordPrerequisiteCommand = {
    commandId: "mock_execution_record_prerequisite",
    table: "execution_records",
    operationType: "prepared_execution_record_insert_command",
    executionMode: "no_execution_without_separate_gate",
    remoteExecution: false,
    stagingOnly: true,
    mockOnly: true,
    idempotencyKey: `${acceptedPayload.idempotencyKey}:execution_record`,
    recordReference: "mock_execution_record_insert_result",
    recordBody: executionRecordBody,
  };

  const auditCommand: PostTradeExecutionRecordDependentAuditCommand = {
    commandId: "mock_execution_record_audit_event",
    table: "execution_record_audit_events",
    operationType: "prepared_dependent_audit_insert_command",
    executionMode: "no_execution_without_separate_gate",
    remoteExecution: false,
    stagingOnly: true,
    mockOnly: true,
    dependsOnCommandId: "mock_execution_record_prerequisite",
    executionRecordReference: executionRecordCommand.recordReference,
    idempotencyKey: `${acceptedPayload.idempotencyKey}:execution_record_audit`,
    recordBody: auditRecordBody,
  };

  return {
    contractVersion: CONTRACT_VERSION,
    status: "ready_no_execution",
    ready: true,
    executionMode: "no_execution_without_separate_gate",
    remoteExecution: false,
    target: {
      environmentName: STAGING_ENVIRONMENT_NAME,
      projectRef: STAGING_PROJECT_REF,
    },
    idempotencyKey: acceptedPayload.idempotencyKey,
    executionRecordCommand,
    auditCommand,
    commandSet: [executionRecordCommand, auditCommand],
    safetyFlags: baseSafetyFlags(validationResult),
    rejectedFields: [],
    reasons: [],
  };
}
