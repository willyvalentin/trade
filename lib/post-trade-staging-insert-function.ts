import "server-only";

import type { PostTradeExecutionRecordPrerequisiteCommandResult } from "@/lib/post-trade-execution-record-prerequisite-command";
import type { PostTradePersistenceDryRunPlan } from "@/lib/post-trade-persistence-service-plan";
import type { PostTradePayloadValidationResult } from "@/lib/post-trade-payload-validator";
import type { PostTradeOneShotExecutionApprovalContext } from "@/lib/post-trade-remote-execution-adapter";
import {
  POST_TRADE_STAGING_ENVIRONMENT_NAME,
  POST_TRADE_STAGING_PROJECT_REF,
} from "@/lib/post-trade-service-client-factory";
import type { PostTradeWriteServiceDraftResult } from "@/lib/post-trade-write-service-draft";

export type PostTradeStagingInsertFunctionStatus =
  | "ready_no_execution"
  | "blocked_missing_one_shot_context"
  | "blocked_production_target"
  | "blocked_invalid_validation_result"
  | "blocked_unready_dry_run_plan"
  | "blocked_invalid_write_commands"
  | "blocked_missing_prerequisite_command"
  | "blocked_missing_audit_command"
  | "blocked_missing_idempotency"
  | "blocked_unsafe_flags"
  | "blocked_unsafe_payload";

export type PostTradeStagingInsertFunctionInput = {
  validationResult: unknown;
  dryRunPlan: unknown;
  writeCommandResult: unknown;
  prerequisiteCommandResult: unknown;
  oneShotApprovalContext?: PostTradeOneShotExecutionApprovalContext | null;
  target?: {
    environmentName?: string | null;
    projectRef?: string | null;
  };
};

export type PostTradeStagingInsertFunctionStep = {
  step: 1 | 2;
  table: "execution_records" | "execution_record_audit_events";
  operation: "future_insert_returning_id" | "future_insert_with_execution_record_id";
  executionMode: "no_execution_without_separate_gate";
  remoteExecution: false;
  idempotencyKey: string;
  dependsOnStep: 1 | null;
  placeholderReference: "mock_execution_record_insert_result" | null;
};

export type PostTradeStagingInsertFunctionResult = {
  contractVersion: "post_trade_staging_insert_function_v1";
  status: PostTradeStagingInsertFunctionStatus;
  readyForFutureExecutionGate: boolean;
  executionMode: "no_execution_without_separate_gate";
  executionStatus: "not_executed";
  remoteExecution: false;
  target: {
    environmentName: typeof POST_TRADE_STAGING_ENVIRONMENT_NAME;
    projectRef: typeof POST_TRADE_STAGING_PROJECT_REF;
  };
  oneShotGatePresent: boolean;
  plannedSteps: PostTradeStagingInsertFunctionStep[];
  idempotency: {
    key: string | null;
    aligned: boolean;
    testScoped: boolean;
    status: "accepted_for_future_execution" | "rejected";
  };
  prerequisite: {
    present: boolean;
    ready: boolean;
    executionRecordCommandPresent: boolean;
    dependentAuditCommandPresent: boolean;
    placeholderReference: string | null;
  };
  safetyFlags: {
    serverOnlyModule: true;
    stagingOnly: true;
    oneShotOnly: true;
    productionBlocked: true;
    noExecutionInThisAction: true;
    noRemoteWrite: true;
    noSupabaseWriteMethodCall: true;
    noDirectSql: true;
    noBroadWrites: true;
    noBlindRetry: true;
    noApiWriteBehavior: true;
    noRuntimeActivation: true;
    noTradeUiExecution: true;
    noRawBrokerOrBrowserPayload: boolean;
    noCredentialSessionOrBankIdMaterial: boolean;
    noUnredactedBrokerDocument: boolean;
    noArbitraryJsonBlob: boolean;
    noRealBrokerOrAvanzaData: boolean;
    noSettlementOrOrderBehavior: boolean;
  };
  rejectedFields: { field: string; reason: string }[];
  reasons: string[];
};

const CONTRACT_VERSION = "post_trade_staging_insert_function_v1" as const;

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

function baseResult(input: {
  status: PostTradeStagingInsertFunctionStatus;
  validation?: PostTradePayloadValidationResult;
  approvalContext?: PostTradeOneShotExecutionApprovalContext | null;
  prerequisite?: PostTradeExecutionRecordPrerequisiteCommandResult | null;
  idempotencyKey?: string | null;
  idempotencyAligned?: boolean;
  idempotencyTestScoped?: boolean;
  plannedSteps?: PostTradeStagingInsertFunctionStep[];
  rejectedFields: { field: string; reason: string }[];
  reasons: string[];
}): PostTradeStagingInsertFunctionResult {
  const prerequisite = input.prerequisite ?? null;
  const prerequisiteReady = prerequisite?.ready === true;
  const executionRecordCommand = prerequisiteReady
    ? prerequisite.executionRecordCommand
    : null;
  const auditCommand = prerequisiteReady ? prerequisite.auditCommand : null;
  const unsafePayload =
    containsForbiddenKey(input.validation) || containsForbiddenKey(prerequisite);

  return {
    contractVersion: CONTRACT_VERSION,
    status: input.status,
    readyForFutureExecutionGate: input.status === "ready_no_execution",
    executionMode: "no_execution_without_separate_gate",
    executionStatus: "not_executed",
    remoteExecution: false,
    target: {
      environmentName: POST_TRADE_STAGING_ENVIRONMENT_NAME,
      projectRef: POST_TRADE_STAGING_PROJECT_REF,
    },
    oneShotGatePresent: Boolean(input.approvalContext),
    plannedSteps: input.plannedSteps ?? [],
    idempotency: {
      key: input.idempotencyKey ?? null,
      aligned: input.idempotencyAligned ?? false,
      testScoped: input.idempotencyTestScoped ?? false,
      status:
        input.idempotencyAligned === true && input.idempotencyTestScoped === true
          ? "accepted_for_future_execution"
          : "rejected",
    },
    prerequisite: {
      present: Boolean(prerequisite),
      ready: prerequisiteReady,
      executionRecordCommandPresent: Boolean(executionRecordCommand),
      dependentAuditCommandPresent: Boolean(auditCommand),
      placeholderReference: auditCommand?.executionRecordReference ?? null,
    },
    safetyFlags: {
      serverOnlyModule: true,
      stagingOnly: true,
      oneShotOnly: true,
      productionBlocked: true,
      noExecutionInThisAction: true,
      noRemoteWrite: true,
      noSupabaseWriteMethodCall: true,
      noDirectSql: true,
      noBroadWrites: true,
      noBlindRetry: true,
      noApiWriteBehavior: true,
      noRuntimeActivation: true,
      noTradeUiExecution: true,
      noRawBrokerOrBrowserPayload:
        input.validation?.valid === true &&
        input.validation.safetyFlags.noRawBrokerPayload &&
        input.validation.safetyFlags.noRawAvanzaOrBrowserState &&
        !unsafePayload,
      noCredentialSessionOrBankIdMaterial:
        input.validation?.valid === true &&
        input.validation.safetyFlags.noCredentialSessionOrBankIdMaterial &&
        !unsafePayload,
      noUnredactedBrokerDocument:
        input.validation?.valid === true &&
        input.validation.safetyFlags.noUnredactedBrokerDocument &&
        !unsafePayload,
      noArbitraryJsonBlob:
        input.validation?.valid === true &&
        input.validation.safetyFlags.noArbitraryJsonBlob &&
        !unsafePayload,
      noRealBrokerOrAvanzaData: !unsafePayload,
      noSettlementOrOrderBehavior: !unsafePayload,
    },
    rejectedFields: input.rejectedFields,
    reasons: input.reasons,
  };
}

function oneShotApprovalContextReady(
  context: PostTradeOneShotExecutionApprovalContext | null | undefined,
): context is PostTradeOneShotExecutionApprovalContext & {
  idempotencyKey: string;
} {
  return (
    context?.approvedForExactlyOneStagingMockWrite === true &&
    context.targetProjectRef === POST_TRADE_STAGING_PROJECT_REF &&
    context.stagingUrlPresentServerSide === true &&
    context.stagingServiceRoleKeyPresentServerSide === true &&
    context.noNextPublicServiceRoleKey === true &&
    context.apiUiRuntimeBlocked === true &&
    context.productionBlocked === true &&
    typeof context.idempotencyKey === "string" &&
    context.idempotencyKey.length > 0
  );
}

function validationSafetyFlagsReady(validation: PostTradePayloadValidationResult) {
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
    validation.safetyFlags.idempotencyReady &&
    validation.safetyFlags.intentResultAligned
  );
}

function prerequisiteReady(
  prerequisite: PostTradeExecutionRecordPrerequisiteCommandResult,
) {
  return (
    prerequisite.ready === true &&
    prerequisite.status === "ready_no_execution" &&
    prerequisite.executionRecordCommand.table === "execution_records" &&
    prerequisite.auditCommand.table === "execution_record_audit_events" &&
    prerequisite.auditCommand.dependsOnCommandId ===
      prerequisite.executionRecordCommand.commandId &&
    prerequisite.auditCommand.executionRecordReference ===
      prerequisite.executionRecordCommand.recordReference &&
    prerequisite.auditCommand.executionRecordReference ===
      "mock_execution_record_insert_result" &&
    prerequisite.remoteExecution === false &&
    prerequisite.safetyFlags.noRemoteWrite === true &&
    prerequisite.safetyFlags.noDatabaseWrite === true &&
    prerequisite.safetyFlags.noApiWriteBehavior === true &&
    prerequisite.safetyFlags.noTradeUiExecution === true &&
    !containsForbiddenKey(prerequisite)
  );
}

export function buildPostTradeStagingInsertFunctionPlan(
  input: PostTradeStagingInsertFunctionInput,
): PostTradeStagingInsertFunctionResult {
  const environmentName =
    input.target?.environmentName ?? POST_TRADE_STAGING_ENVIRONMENT_NAME;
  const projectRef = input.target?.projectRef ?? POST_TRADE_STAGING_PROJECT_REF;

  if (
    environmentName !== POST_TRADE_STAGING_ENVIRONMENT_NAME ||
    projectRef !== POST_TRADE_STAGING_PROJECT_REF ||
    isProductionLike(environmentName) ||
    isProductionLike(projectRef)
  ) {
    return baseResult({
      status: "blocked_production_target",
      rejectedFields: [{ field: "target", reason: "staging_target_required" }],
      reasons: ["target:staging_target_required"],
    });
  }

  const approvalContext = input.oneShotApprovalContext ?? null;

  if (!oneShotApprovalContextReady(approvalContext)) {
    return baseResult({
      status: "blocked_missing_one_shot_context",
      approvalContext,
      idempotencyKey: approvalContext?.idempotencyKey ?? null,
      rejectedFields: [
        { field: "oneShotApprovalContext", reason: "one_shot_context_required" },
      ],
      reasons: ["oneShotApprovalContext:one_shot_context_required"],
    });
  }
  const readyApprovalContext = approvalContext;

  if (!isRecord(input.validationResult) || input.validationResult.valid !== true) {
    const invalidValidation = input.validationResult as
      | PostTradePayloadValidationResult
      | undefined;

    return baseResult({
      status: "blocked_invalid_validation_result",
      approvalContext,
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

  const validation = input.validationResult as PostTradePayloadValidationResult;

  if (!validationSafetyFlagsReady(validation) || containsForbiddenKey(validation)) {
    return baseResult({
      status: containsForbiddenKey(validation)
        ? "blocked_unsafe_payload"
        : "blocked_unsafe_flags",
      approvalContext,
      validation,
      rejectedFields: [
        {
          field: containsForbiddenKey(validation) ? "payload" : "safetyFlags",
          reason: containsForbiddenKey(validation)
            ? "unsafe_payload_fragment"
            : "unsafe_validation_safety_flags",
        },
      ],
      reasons: [
        containsForbiddenKey(validation)
          ? "payload:unsafe_payload_fragment"
          : "safetyFlags:unsafe_validation_safety_flags",
      ],
    });
  }

  if (!isRecord(input.dryRunPlan)) {
    return baseResult({
      status: "blocked_unready_dry_run_plan",
      approvalContext,
      validation,
      rejectedFields: [
        { field: "dryRunPlan", reason: "ready_dry_run_plan_required" },
      ],
      reasons: ["dryRunPlan:ready_dry_run_plan_required"],
    });
  }

  const dryRunPlan = input.dryRunPlan as PostTradePersistenceDryRunPlan;

  if (dryRunPlan.ready !== true || dryRunPlan.auditEventPlan === null) {
    return baseResult({
      status: "blocked_unready_dry_run_plan",
      approvalContext,
      validation,
      rejectedFields: [
        { field: "dryRunPlan", reason: "ready_dry_run_plan_required" },
      ],
      reasons: ["dryRunPlan:ready_dry_run_plan_required"],
    });
  }

  if (!isRecord(input.writeCommandResult)) {
    return baseResult({
      status: "blocked_invalid_write_commands",
      approvalContext,
      validation,
      rejectedFields: [
        { field: "writeCommandResult", reason: "write_commands_required" },
      ],
      reasons: ["writeCommandResult:write_commands_required"],
    });
  }

  const writeCommandResult =
    input.writeCommandResult as PostTradeWriteServiceDraftResult;

  if (
    writeCommandResult.ready !== true ||
    writeCommandResult.status !== "ready_no_remote_write" ||
    writeCommandResult.executionMode !== "dry_run_command_only" ||
    writeCommandResult.auditCommand === null ||
    writeCommandResult.safetyFlags.noRemoteWrite !== true
  ) {
    return baseResult({
      status: "blocked_invalid_write_commands",
      approvalContext,
      validation,
      rejectedFields: [
        {
          field: "writeCommandResult",
          reason: "ready_no_remote_write_commands_required",
        },
      ],
      reasons: ["writeCommandResult:ready_no_remote_write_commands_required"],
    });
  }

  if (!isRecord(input.prerequisiteCommandResult)) {
    return baseResult({
      status: "blocked_missing_prerequisite_command",
      approvalContext,
      validation,
      rejectedFields: [
        {
          field: "prerequisiteCommandResult",
          reason: "execution_record_prerequisite_required",
        },
      ],
      reasons: [
        "prerequisiteCommandResult:execution_record_prerequisite_required",
      ],
    });
  }

  const prerequisite =
    input.prerequisiteCommandResult as PostTradeExecutionRecordPrerequisiteCommandResult;

  if (!prerequisiteReady(prerequisite)) {
    const missingAudit =
      prerequisite.ready === true &&
      prerequisite.auditCommand?.executionRecordReference !==
        "mock_execution_record_insert_result";

    return baseResult({
      status: missingAudit
        ? "blocked_missing_audit_command"
        : "blocked_missing_prerequisite_command",
      approvalContext,
      validation,
      prerequisite,
      rejectedFields: [
        {
          field: missingAudit ? "auditCommand" : "prerequisiteCommandResult",
          reason: missingAudit
            ? "dependent_audit_command_required"
            : "ready_execution_record_prerequisite_required",
        },
      ],
      reasons: [
        missingAudit
          ? "auditCommand:dependent_audit_command_required"
          : "prerequisiteCommandResult:ready_execution_record_prerequisite_required",
      ],
    });
  }

  const idempotencyKey = validation.acceptedPayload?.idempotencyKey ?? null;
  const idempotencyAligned =
    typeof idempotencyKey === "string" &&
    idempotencyKey.length > 0 &&
    idempotencyKey === readyApprovalContext.idempotencyKey &&
    idempotencyKey === dryRunPlan.idempotencyKey &&
    idempotencyKey === writeCommandResult.idempotencyKey &&
    idempotencyKey === prerequisite.idempotencyKey;
  const idempotencyTestScoped =
    typeof idempotencyKey === "string" &&
    idempotencyKey.startsWith("post_trade:test:");

  if (!idempotencyAligned || !idempotencyTestScoped) {
    return baseResult({
      status: "blocked_missing_idempotency",
      approvalContext,
      validation,
      prerequisite,
      idempotencyKey,
      idempotencyAligned,
      idempotencyTestScoped,
      rejectedFields: [
        {
          field: "idempotencyKey",
          reason: "test_scoped_idempotency_alignment_required",
        },
      ],
      reasons: [
        "idempotencyKey:test_scoped_idempotency_alignment_required",
      ],
    });
  }

  return baseResult({
    status: "ready_no_execution",
    approvalContext,
    validation,
    prerequisite,
    idempotencyKey,
    idempotencyAligned: true,
    idempotencyTestScoped: true,
    plannedSteps: [
      {
        step: 1,
        table: "execution_records",
        operation: "future_insert_returning_id",
        executionMode: "no_execution_without_separate_gate",
        remoteExecution: false,
        idempotencyKey: prerequisite.executionRecordCommand.idempotencyKey,
        dependsOnStep: null,
        placeholderReference: "mock_execution_record_insert_result",
      },
      {
        step: 2,
        table: "execution_record_audit_events",
        operation: "future_insert_with_execution_record_id",
        executionMode: "no_execution_without_separate_gate",
        remoteExecution: false,
        idempotencyKey: prerequisite.auditCommand.idempotencyKey,
        dependsOnStep: 1,
        placeholderReference: "mock_execution_record_insert_result",
      },
    ],
    rejectedFields: [],
    reasons: ["execution:blocked_until_separate_write_execution_action"],
  });
}
