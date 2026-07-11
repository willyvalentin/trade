import "server-only";

import type { PostTradeExecutionRecordPrerequisiteCommandResult } from "@/lib/post-trade-execution-record-prerequisite-command";
import type { PostTradePersistenceDryRunPlan } from "@/lib/post-trade-persistence-service-plan";
import type { PostTradePayloadValidationResult } from "@/lib/post-trade-payload-validator";
import type { PostTradeOneShotExecutionApprovalContext } from "@/lib/post-trade-remote-execution-adapter";
import {
  POST_TRADE_STAGING_ENVIRONMENT_NAME,
  POST_TRADE_STAGING_PROJECT_REF,
} from "@/lib/post-trade-service-client-factory";
import type { PostTradeStagingInsertFunctionResult } from "@/lib/post-trade-staging-insert-function";
import type { PostTradeWriteServiceDraftResult } from "@/lib/post-trade-write-service-draft";

export type PostTradeStagingExecutionFunctionStatus =
  | "ready_no_execution"
  | "blocked_missing_one_shot_context"
  | "blocked_production_target"
  | "blocked_invalid_validation_result"
  | "blocked_unready_dry_run_plan"
  | "blocked_invalid_write_commands"
  | "blocked_missing_prerequisite_command"
  | "blocked_missing_insert_planner"
  | "blocked_missing_audit_command"
  | "blocked_missing_idempotency"
  | "blocked_unsafe_flags"
  | "blocked_unsafe_payload";

export type PostTradeStagingExecutionFunctionInput = {
  validationResult: unknown;
  dryRunPlan: unknown;
  writeCommandResult: unknown;
  prerequisiteCommandResult: unknown;
  insertPlannerResult: unknown;
  oneShotApprovalContext?: PostTradeOneShotExecutionApprovalContext | null;
  target?: {
    environmentName?: string | null;
    projectRef?: string | null;
  };
};

export type PostTradeStagingExecutionFunctionOperation = {
  step: 1 | 2;
  table: "execution_records" | "execution_record_audit_events";
  operation:
    | "future_insert_execution_record_returning_id"
    | "future_insert_audit_event_with_execution_record_id";
  executionMode: "no_execution_without_final_gate";
  remoteExecution: false;
  idempotencyKey: string;
  sourceCommandId:
    | "mock_execution_record_prerequisite"
    | "mock_execution_record_audit_event";
  dependsOnStep: 1 | null;
  requiresReturnedExecutionRecordId: boolean;
  recordBody: Record<string, string | number | boolean | null>;
};

export type PostTradeStagingExecutionFunctionResult = {
  contractVersion: "post_trade_staging_execution_function_v1";
  status: PostTradeStagingExecutionFunctionStatus;
  readyForFinalExecutionGate: boolean;
  executionEnabled: false;
  executionMode: "no_execution_without_final_gate";
  executionStatus: "not_executed";
  remoteExecution: false;
  rowsCreated: 0;
  target: {
    environmentName: typeof POST_TRADE_STAGING_ENVIRONMENT_NAME;
    projectRef: typeof POST_TRADE_STAGING_PROJECT_REF;
  };
  oneShotGatePresent: boolean;
  futureOperations: PostTradeStagingExecutionFunctionOperation[];
  idempotency: {
    key: string | null;
    aligned: boolean;
    testScoped: boolean;
    status: "accepted_for_final_execution_gate" | "rejected";
  };
  prerequisite: {
    present: boolean;
    ready: boolean;
    executionRecordCommandPresent: boolean;
    dependentAuditCommandPresent: boolean;
    placeholderReference: string | null;
  };
  insertPlanner: {
    present: boolean;
    ready: boolean;
    plannedStepCount: number;
    status: "accepted_for_final_execution_gate" | "rejected";
  };
  safetyFlags: {
    serverOnlyModule: true;
    stagingOnly: true;
    oneShotOnly: true;
    productionBlocked: true;
    noExecutionInThisAction: true;
    noRowsCreated: true;
    noUpdateDeleteUpsertRpcStorage: true;
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

const CONTRACT_VERSION = "post_trade_staging_execution_function_v1" as const;

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
    prerequisite.commandSet.length === 2 &&
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

function insertPlannerReady(planner: PostTradeStagingInsertFunctionResult) {
  return (
    planner.status === "ready_no_execution" &&
    planner.readyForFutureExecutionGate === true &&
    planner.executionMode === "no_execution_without_separate_gate" &&
    planner.executionStatus === "not_executed" &&
    planner.remoteExecution === false &&
    planner.plannedSteps.length === 2 &&
    planner.plannedSteps[0]?.table === "execution_records" &&
    planner.plannedSteps[0]?.operation === "future_insert_returning_id" &&
    planner.plannedSteps[1]?.table === "execution_record_audit_events" &&
    planner.plannedSteps[1]?.operation === "future_insert_with_execution_record_id" &&
    planner.plannedSteps[1]?.dependsOnStep === 1 &&
    planner.prerequisite.dependentAuditCommandPresent === true &&
    planner.safetyFlags.noRemoteWrite === true &&
    planner.safetyFlags.noSupabaseWriteMethodCall === true &&
    planner.safetyFlags.noApiWriteBehavior === true &&
    planner.safetyFlags.noTradeUiExecution === true &&
    !containsForbiddenKey(planner)
  );
}

function isSafeRecordBody(value: unknown): value is Record<
  string,
  string | number | boolean | null
> {
  return (
    isRecord(value) &&
    Object.values(value).every(
      (item) =>
        item === null ||
        typeof item === "string" ||
        typeof item === "boolean" ||
        (typeof item === "number" && Number.isFinite(item)),
    ) &&
    !containsForbiddenKey(value)
  );
}

function baseResult(input: {
  status: PostTradeStagingExecutionFunctionStatus;
  validation?: PostTradePayloadValidationResult;
  approvalContext?: PostTradeOneShotExecutionApprovalContext | null;
  prerequisite?: PostTradeExecutionRecordPrerequisiteCommandResult | null;
  insertPlanner?: PostTradeStagingInsertFunctionResult | null;
  idempotencyKey?: string | null;
  idempotencyAligned?: boolean;
  idempotencyTestScoped?: boolean;
  futureOperations?: PostTradeStagingExecutionFunctionOperation[];
  rejectedFields: { field: string; reason: string }[];
  reasons: string[];
}): PostTradeStagingExecutionFunctionResult {
  const prerequisite = input.prerequisite ?? null;
  const prerequisiteIsReady = prerequisite?.ready === true;
  const planner = input.insertPlanner ?? null;
  const plannerIsReady = planner?.status === "ready_no_execution";
  const unsafePayload =
    containsForbiddenKey(input.validation) ||
    containsForbiddenKey(prerequisite) ||
    containsForbiddenKey(planner);

  return {
    contractVersion: CONTRACT_VERSION,
    status: input.status,
    readyForFinalExecutionGate: input.status === "ready_no_execution",
    executionEnabled: false,
    executionMode: "no_execution_without_final_gate",
    executionStatus: "not_executed",
    remoteExecution: false,
    rowsCreated: 0,
    target: {
      environmentName: POST_TRADE_STAGING_ENVIRONMENT_NAME,
      projectRef: POST_TRADE_STAGING_PROJECT_REF,
    },
    oneShotGatePresent: Boolean(input.approvalContext),
    futureOperations: input.futureOperations ?? [],
    idempotency: {
      key: input.idempotencyKey ?? null,
      aligned: input.idempotencyAligned ?? false,
      testScoped: input.idempotencyTestScoped ?? false,
      status:
        input.idempotencyAligned === true && input.idempotencyTestScoped === true
          ? "accepted_for_final_execution_gate"
          : "rejected",
    },
    prerequisite: {
      present: Boolean(prerequisite),
      ready: prerequisiteIsReady,
      executionRecordCommandPresent: Boolean(
        prerequisiteIsReady ? prerequisite.executionRecordCommand : null,
      ),
      dependentAuditCommandPresent: Boolean(
        prerequisiteIsReady ? prerequisite.auditCommand : null,
      ),
      placeholderReference:
        prerequisiteIsReady ? prerequisite.auditCommand.executionRecordReference : null,
    },
    insertPlanner: {
      present: Boolean(planner),
      ready: plannerIsReady,
      plannedStepCount: planner?.plannedSteps.length ?? 0,
      status: plannerIsReady ? "accepted_for_final_execution_gate" : "rejected",
    },
    safetyFlags: {
      serverOnlyModule: true,
      stagingOnly: true,
      oneShotOnly: true,
      productionBlocked: true,
      noExecutionInThisAction: true,
      noRowsCreated: true,
      noUpdateDeleteUpsertRpcStorage: true,
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

export function buildPostTradeStagingExecutionFunction(
  input: PostTradeStagingExecutionFunctionInput,
): PostTradeStagingExecutionFunctionResult {
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

  if (!isRecord(input.insertPlannerResult)) {
    return baseResult({
      status: "blocked_missing_insert_planner",
      approvalContext,
      validation,
      prerequisite,
      rejectedFields: [
        { field: "insertPlannerResult", reason: "insert_planner_required" },
      ],
      reasons: ["insertPlannerResult:insert_planner_required"],
    });
  }

  const insertPlanner =
    input.insertPlannerResult as PostTradeStagingInsertFunctionResult;

  if (!insertPlannerReady(insertPlanner)) {
    return baseResult({
      status: "blocked_missing_insert_planner",
      approvalContext,
      validation,
      prerequisite,
      insertPlanner,
      rejectedFields: [
        {
          field: "insertPlannerResult",
          reason: "ready_no_execution_insert_planner_required",
        },
      ],
      reasons: [
        "insertPlannerResult:ready_no_execution_insert_planner_required",
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
    idempotencyKey === prerequisite.idempotencyKey &&
    idempotencyKey === insertPlanner.idempotency.key;
  const idempotencyTestScoped =
    typeof idempotencyKey === "string" &&
    idempotencyKey.startsWith("post_trade:test:");

  if (!idempotencyAligned || !idempotencyTestScoped) {
    return baseResult({
      status: "blocked_missing_idempotency",
      approvalContext,
      validation,
      prerequisite,
      insertPlanner,
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

  if (
    !isSafeRecordBody(prerequisite.executionRecordCommand.recordBody) ||
    !isSafeRecordBody(prerequisite.auditCommand.recordBody)
  ) {
    return baseResult({
      status: "blocked_unsafe_payload",
      approvalContext,
      validation,
      prerequisite,
      insertPlanner,
      idempotencyKey,
      idempotencyAligned,
      idempotencyTestScoped,
      rejectedFields: [
        { field: "recordBody", reason: "unsafe_record_body_value" },
      ],
      reasons: ["recordBody:unsafe_record_body_value"],
    });
  }

  return baseResult({
    status: "ready_no_execution",
    approvalContext,
    validation,
    prerequisite,
    insertPlanner,
    idempotencyKey,
    idempotencyAligned: true,
    idempotencyTestScoped: true,
    futureOperations: [
      {
        step: 1,
        table: "execution_records",
        operation: "future_insert_execution_record_returning_id",
        executionMode: "no_execution_without_final_gate",
        remoteExecution: false,
        idempotencyKey: prerequisite.executionRecordCommand.idempotencyKey,
        sourceCommandId: prerequisite.executionRecordCommand.commandId,
        dependsOnStep: null,
        requiresReturnedExecutionRecordId: true,
        recordBody: prerequisite.executionRecordCommand.recordBody,
      },
      {
        step: 2,
        table: "execution_record_audit_events",
        operation: "future_insert_audit_event_with_execution_record_id",
        executionMode: "no_execution_without_final_gate",
        remoteExecution: false,
        idempotencyKey: prerequisite.auditCommand.idempotencyKey,
        sourceCommandId: prerequisite.auditCommand.commandId,
        dependsOnStep: 1,
        requiresReturnedExecutionRecordId: true,
        recordBody: prerequisite.auditCommand.recordBody,
      },
    ],
    rejectedFields: [],
    reasons: ["execution:function_ready_but_blocked_until_final_execution_gate"],
  });
}
