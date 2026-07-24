import "server-only";

import {
  POST_TRADE_STAGING_ENVIRONMENT_NAME,
  POST_TRADE_STAGING_PROJECT_REF,
} from "@/lib/post-trade-service-client-factory";
import type { PostTradePersistenceDryRunPlan } from "@/lib/post-trade-persistence-service-plan";
import type { PostTradePayloadValidationResult } from "@/lib/post-trade-payload-validator";
import type { PostTradeExecutionRecordPrerequisiteCommandResult } from "@/lib/post-trade-execution-record-prerequisite-command";
import type {
  PostTradeWriteServiceDraftAuditCommand,
  PostTradeWriteServiceDraftCommand,
  PostTradeWriteServiceDraftResult,
} from "@/lib/post-trade-write-service-draft";

export type PostTradeRemoteExecutionAdapterStatus =
  | "blocked_no_remote_write"
  | "blocked_invalid_validation_result"
  | "blocked_unready_dry_run_plan"
  | "blocked_invalid_write_command_result"
  | "blocked_missing_write_commands"
  | "blocked_missing_audit_command"
  | "blocked_missing_idempotency"
  | "blocked_idempotency_mismatch"
  | "blocked_unsafe_flags"
  | "blocked_production_target"
  | "blocked_unsafe_payload";

export type PostTradeRemoteExecutionAdapterInput = {
  validationResult: unknown;
  dryRunPlan: unknown;
  writeCommandResult: unknown;
  target?: {
    environmentName?: string | null;
    projectRef?: string | null;
  };
};

export type PostTradeRemoteExecutionAdapterResult = {
  contractVersion: "post_trade_remote_execution_adapter_v1";
  status: PostTradeRemoteExecutionAdapterStatus;
  ready: false;
  executionMode: "dry_run_only";
  executionStatus: "blocked_no_remote_write";
  remoteExecution: false;
  target: {
    environmentName: typeof POST_TRADE_STAGING_ENVIRONMENT_NAME;
    projectRef: typeof POST_TRADE_STAGING_PROJECT_REF;
  };
  commands: {
    acceptedCount: number;
    rejectedCount: number;
    tables: string[];
  };
  auditCommand: {
    present: boolean;
    table: "execution_record_audit_events" | null;
    status: "accepted_no_remote_write" | "rejected";
  };
  idempotency: {
    key: string | null;
    aligned: boolean;
    status: "accepted" | "rejected";
  };
  safetyFlags: {
    serverOnlyModule: true;
    stagingOnly: true;
    productionBlocked: true;
    serviceRoleServerOnly: true;
    noClientInstantiation: true;
    noRemoteWrite: true;
    noSupabaseWriteMethodCall: true;
    noApiWriteBehavior: true;
    noRuntimeActivation: true;
    noTradeUiExecution: true;
    noRawBrokerOrBrowserPayload: boolean;
    noCredentialSessionOrBankIdMaterial: boolean;
    noUnredactedBrokerDocument: boolean;
    noArbitraryJsonBlob: boolean;
  };
  requiredFutureApprovalGate: "post_trade_staging_mock_write_execution_gate";
  rejectedFields: { field: string; reason: string }[];
  reasons: string[];
};

export type PostTradeWriteCapableStagingAdapterStatus =
  | "implementation_ready_execution_blocked"
  | "blocked_precondition_failed";

export type PostTradeWriteCapableStagingAdapterResult = {
  contractVersion: "post_trade_write_capable_staging_adapter_v1";
  status: PostTradeWriteCapableStagingAdapterStatus;
  implementationStatus: "implementation_ready" | "blocked";
  executionStatus: "execution_blocked";
  executionMode: "no_execution_without_separate_gate";
  stagingOnly: true;
  remoteExecution: false;
  target: {
    environmentName: typeof POST_TRADE_STAGING_ENVIRONMENT_NAME;
    projectRef: typeof POST_TRADE_STAGING_PROJECT_REF;
  };
  commandSummary: {
    acceptedCount: number;
    rejectedCount: number;
    tables: string[];
  };
  auditCommand: {
    required: true;
    present: boolean;
    status: "accepted_for_future_execution" | "rejected";
  };
  idempotency: {
    required: true;
    key: string | null;
    aligned: boolean;
    status: "accepted_for_future_execution" | "rejected";
  };
  requiredFutureApprovalGate: "post_trade_staging_mock_write_execution_final_gate";
  safetyFlags: {
    serverOnlyModule: true;
    stagingOnly: true;
    productionBlocked: true;
    serviceRoleServerOnly: true;
    noApiWriteBehavior: true;
    noRuntimeActivation: true;
    noTradeUiExecution: true;
    noExecutionInThisAction: true;
    noBroadWrites: true;
    sanitizedCommandsOnly: boolean;
    noRawBrokerOrBrowserPayload: boolean;
    noCredentialSessionOrBankIdMaterial: boolean;
    noUnredactedBrokerDocument: boolean;
    noArbitraryJsonBlob: boolean;
  };
  rejectedFields: { field: string; reason: string }[];
  reasons: string[];
};

export type PostTradeOneShotExecutionUnblockStatus =
  | "eligible_no_write"
  | "blocked_missing_one_shot_context"
  | "blocked_production_target"
  | "blocked_precondition_failed"
  | "blocked_missing_prerequisite_command"
  | "blocked_missing_audit_command"
  | "blocked_missing_idempotency"
  | "blocked_unsafe_flags"
  | "blocked_unsafe_payload";

export type PostTradeOneShotExecutionApprovalContext = {
  approvedForExactlyOneStagingMockWrite?: boolean;
  targetProjectRef?: string | null;
  stagingUrlPresentServerSide?: boolean;
  stagingServiceRoleKeyPresentServerSide?: boolean;
  noNextPublicServiceRoleKey?: boolean;
  apiUiRuntimeBlocked?: boolean;
  productionBlocked?: boolean;
  idempotencyKey?: string | null;
};

export type PostTradeOneShotExecutionUnblockInput =
  PostTradeRemoteExecutionAdapterInput & {
    prerequisiteCommandResult: unknown;
    oneShotApprovalContext?: PostTradeOneShotExecutionApprovalContext | null;
  };

export type PostTradeOneShotExecutionUnblockResult = {
  contractVersion: "post_trade_one_shot_execution_unblock_v1";
  status: PostTradeOneShotExecutionUnblockStatus;
  readyForNextAction: boolean;
  oneShotGatePresent: boolean;
  oneShotGateEligible: boolean;
  executionStillRequiresNextAction: true;
  executionStatus: "not_executed";
  remoteExecution: false;
  target: {
    environmentName: typeof POST_TRADE_STAGING_ENVIRONMENT_NAME;
    projectRef: typeof POST_TRADE_STAGING_PROJECT_REF;
  };
  idempotency: {
    key: string | null;
    aligned: boolean;
    testScoped: boolean;
    status: "accepted_for_next_action" | "rejected";
  };
  prerequisiteCommand: {
    present: boolean;
    ready: boolean;
    table: "execution_records" | null;
    status: "accepted_for_next_action" | "rejected";
  };
  auditDependency: {
    present: boolean;
    ready: boolean;
    placeholderReference: string | null;
    status: "accepted_for_next_action" | "rejected";
  };
  safetyFlags: {
    serverOnlyModule: true;
    stagingOnly: true;
    productionBlocked: boolean;
    apiUiRuntimeBlocked: boolean;
    oneShotOnly: true;
    noExecutionInThisAction: true;
    noRemoteWrite: true;
    noSupabaseWriteMethodCall: true;
    noRuntimeActivation: true;
    noTradeUiExecution: true;
    noRawBrokerOrBrowserPayload: boolean;
    noCredentialSessionOrBankIdMaterial: boolean;
    noUnredactedBrokerDocument: boolean;
    noArbitraryJsonBlob: boolean;
    noRealBrokerOrAvanzaData: boolean;
    noSettlementOrOrderBehavior: boolean;
  };
  requiredNextAction: "post_trade_one_staging_mock_write_execution_action";
  rejectedFields: { field: string; reason: string }[];
  reasons: string[];
};

const CONTRACT_VERSION = "post_trade_remote_execution_adapter_v1" as const;
const WRITE_CAPABLE_CONTRACT_VERSION =
  "post_trade_write_capable_staging_adapter_v1" as const;
const ONE_SHOT_UNBLOCK_CONTRACT_VERSION =
  "post_trade_one_shot_execution_unblock_v1" as const;

const allowedTargetTables = new Set([
  "execution_redacted_artifacts",
  "execution_confirmation_evidence",
  "execution_settlement_reviews",
  "execution_cost_breakdowns",
  "execution_deviation_reviews",
  "execution_learning_candidates",
  "execution_record_audit_events",
]);

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

function isSafeRecordValue(value: unknown) {
  return (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean" ||
    (typeof value === "number" && Number.isFinite(value))
  );
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

function oneShotBlockedResult(input: {
  status: Exclude<PostTradeOneShotExecutionUnblockStatus, "eligible_no_write">;
  validation?: PostTradePayloadValidationResult;
  approvalContext?: PostTradeOneShotExecutionApprovalContext | null;
  prerequisite?: PostTradeExecutionRecordPrerequisiteCommandResult | null;
  idempotencyKey?: string | null;
  idempotencyAligned?: boolean;
  idempotencyTestScoped?: boolean;
  unsafePayload?: boolean;
  rejectedFields: { field: string; reason: string }[];
  reasons: string[];
}): PostTradeOneShotExecutionUnblockResult {
  const prerequisite = input.prerequisite ?? null;
  const prerequisiteReady = prerequisite?.ready === true;
  const auditCommand = prerequisiteReady ? prerequisite.auditCommand : null;

  return {
    contractVersion: ONE_SHOT_UNBLOCK_CONTRACT_VERSION,
    status: input.status,
    readyForNextAction: false,
    oneShotGatePresent: Boolean(input.approvalContext),
    oneShotGateEligible: false,
    executionStillRequiresNextAction: true,
    executionStatus: "not_executed",
    remoteExecution: false,
    target: {
      environmentName: POST_TRADE_STAGING_ENVIRONMENT_NAME,
      projectRef: POST_TRADE_STAGING_PROJECT_REF,
    },
    idempotency: {
      key: input.idempotencyKey ?? null,
      aligned: input.idempotencyAligned ?? false,
      testScoped: input.idempotencyTestScoped ?? false,
      status:
        input.idempotencyAligned === true && input.idempotencyTestScoped === true
          ? "accepted_for_next_action"
          : "rejected",
    },
    prerequisiteCommand: {
      present: Boolean(prerequisite),
      ready: prerequisiteReady,
      table: prerequisiteReady ? prerequisite.executionRecordCommand.table : null,
      status: prerequisiteReady ? "accepted_for_next_action" : "rejected",
    },
    auditDependency: {
      present: Boolean(auditCommand),
      ready:
        Boolean(auditCommand) &&
        auditCommand?.dependsOnCommandId ===
          "mock_execution_record_prerequisite" &&
        auditCommand?.executionRecordReference ===
          "mock_execution_record_insert_result",
      placeholderReference: auditCommand?.executionRecordReference ?? null,
      status:
        auditCommand?.executionRecordReference ===
        "mock_execution_record_insert_result"
          ? "accepted_for_next_action"
          : "rejected",
    },
    safetyFlags: {
      serverOnlyModule: true,
      stagingOnly: true,
      productionBlocked: input.approvalContext?.productionBlocked === true,
      apiUiRuntimeBlocked: input.approvalContext?.apiUiRuntimeBlocked === true,
      oneShotOnly: true,
      noExecutionInThisAction: true,
      noRemoteWrite: true,
      noSupabaseWriteMethodCall: true,
      noRuntimeActivation: true,
      noTradeUiExecution: true,
      noRawBrokerOrBrowserPayload:
        input.validation?.valid === true &&
        input.validation.safetyFlags.noRawBrokerPayload &&
        input.validation.safetyFlags.noRawAvanzaOrBrowserState &&
        !input.unsafePayload,
      noCredentialSessionOrBankIdMaterial:
        input.validation?.valid === true &&
        input.validation.safetyFlags.noCredentialSessionOrBankIdMaterial &&
        !input.unsafePayload,
      noUnredactedBrokerDocument:
        input.validation?.valid === true &&
        input.validation.safetyFlags.noUnredactedBrokerDocument &&
        !input.unsafePayload,
      noArbitraryJsonBlob:
        input.validation?.valid === true &&
        input.validation.safetyFlags.noArbitraryJsonBlob &&
        !input.unsafePayload,
      noRealBrokerOrAvanzaData: !input.unsafePayload,
      noSettlementOrOrderBehavior: !input.unsafePayload,
    },
    requiredNextAction: "post_trade_one_staging_mock_write_execution_action",
    rejectedFields: input.rejectedFields,
    reasons: input.reasons,
  };
}

function baseSafetyFlags(input: {
  validation?: PostTradePayloadValidationResult;
  unsafePayload: boolean;
}): PostTradeRemoteExecutionAdapterResult["safetyFlags"] {
  return {
    serverOnlyModule: true,
    stagingOnly: true,
    productionBlocked: true,
    serviceRoleServerOnly: true,
    noClientInstantiation: true,
    noRemoteWrite: true,
    noSupabaseWriteMethodCall: true,
    noApiWriteBehavior: true,
    noRuntimeActivation: true,
    noTradeUiExecution: true,
    noRawBrokerOrBrowserPayload:
      input.validation?.valid === true &&
      input.validation.safetyFlags.noRawBrokerPayload &&
      input.validation.safetyFlags.noRawAvanzaOrBrowserState &&
      !input.unsafePayload,
    noCredentialSessionOrBankIdMaterial:
      input.validation?.valid === true &&
      input.validation.safetyFlags.noCredentialSessionOrBankIdMaterial &&
      !input.unsafePayload,
    noUnredactedBrokerDocument:
      input.validation?.valid === true &&
      input.validation.safetyFlags.noUnredactedBrokerDocument &&
      !input.unsafePayload,
    noArbitraryJsonBlob:
      input.validation?.valid === true &&
      input.validation.safetyFlags.noArbitraryJsonBlob &&
      !input.unsafePayload,
  };
}

function blockedResult(input: {
  status: PostTradeRemoteExecutionAdapterStatus;
  validation?: PostTradePayloadValidationResult;
  writeCommands?: PostTradeWriteServiceDraftCommand[];
  auditCommand?: PostTradeWriteServiceDraftAuditCommand | null;
  idempotencyKey?: string | null;
  idempotencyAligned?: boolean;
  unsafePayload?: boolean;
  rejectedFields: { field: string; reason: string }[];
  reasons: string[];
}): PostTradeRemoteExecutionAdapterResult {
  const auditCommand = input.auditCommand ?? null;
  const acceptedCount =
    input.status === "blocked_no_remote_write"
      ? (input.writeCommands?.length ?? 0)
      : 0;

  return {
    contractVersion: CONTRACT_VERSION,
    status: input.status,
    ready: false,
    executionMode: "dry_run_only",
    executionStatus: "blocked_no_remote_write",
    remoteExecution: false,
    target: {
      environmentName: POST_TRADE_STAGING_ENVIRONMENT_NAME,
      projectRef: POST_TRADE_STAGING_PROJECT_REF,
    },
    commands: {
      acceptedCount,
      rejectedCount: Math.max(0, (input.writeCommands?.length ?? 0) - acceptedCount),
      tables: input.writeCommands?.map((command) => command.table) ?? [],
    },
    auditCommand: {
      present: Boolean(auditCommand),
      table: auditCommand?.table ?? null,
      status:
        input.status === "blocked_no_remote_write" && auditCommand
          ? "accepted_no_remote_write"
          : "rejected",
    },
    idempotency: {
      key: input.idempotencyKey ?? null,
      aligned: input.idempotencyAligned ?? false,
      status: input.idempotencyAligned === true ? "accepted" : "rejected",
    },
    safetyFlags: baseSafetyFlags({
      validation: input.validation,
      unsafePayload: input.unsafePayload ?? false,
    }),
    requiredFutureApprovalGate: "post_trade_staging_mock_write_execution_gate",
    rejectedFields: input.rejectedFields,
    reasons: input.reasons,
  };
}

function validationSafetyFlagsAreReady(
  validation: PostTradePayloadValidationResult,
) {
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

function commandIsSafe(command: PostTradeWriteServiceDraftCommand) {
  return (
    command.operationType === "prepared_insert_command" &&
    command.executionMode === "dry_run_command_only" &&
    command.remoteExecution === false &&
    allowedTargetTables.has(command.table) &&
    typeof command.idempotencyKey === "string" &&
    command.idempotencyKey.length > 0 &&
    isRecord(command.recordBody) &&
    Object.values(command.recordBody).every(isSafeRecordValue) &&
    !containsForbiddenKey(command.recordBody)
  );
}

function auditCommandIsSafe(
  auditCommand: PostTradeWriteServiceDraftAuditCommand | null,
) {
  return (
    auditCommand?.table === "execution_record_audit_events" &&
    auditCommand.operationType === "prepared_audit_insert_command" &&
    auditCommand.executionMode === "dry_run_command_only" &&
    auditCommand.remoteExecution === false &&
    typeof auditCommand.idempotencyKey === "string" &&
    auditCommand.idempotencyKey.length > 0 &&
    isRecord(auditCommand.recordBody) &&
    Object.values(auditCommand.recordBody).every(isSafeRecordValue) &&
    !containsForbiddenKey(auditCommand.recordBody)
  );
}

export function buildPostTradeRemoteExecutionAdapterResult(
  input: PostTradeRemoteExecutionAdapterInput,
): PostTradeRemoteExecutionAdapterResult {
  const environmentName =
    input.target?.environmentName ?? POST_TRADE_STAGING_ENVIRONMENT_NAME;
  const projectRef = input.target?.projectRef ?? POST_TRADE_STAGING_PROJECT_REF;

  if (
    environmentName !== POST_TRADE_STAGING_ENVIRONMENT_NAME ||
    projectRef !== POST_TRADE_STAGING_PROJECT_REF ||
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
      status: "blocked_invalid_validation_result",
      validation: validationResult,
      rejectedFields: [
        { field: "acceptedPayload", reason: "accepted_payload_required" },
      ],
      reasons: ["acceptedPayload:accepted_payload_required"],
    });
  }

  const unsafePayload =
    containsForbiddenKey(validationResult.acceptedPayload) ||
    containsForbiddenKey(input.dryRunPlan) ||
    containsForbiddenKey(input.writeCommandResult);

  if (unsafePayload) {
    return blockedResult({
      status: "blocked_unsafe_payload",
      validation: validationResult,
      unsafePayload: true,
      rejectedFields: [{ field: "payload", reason: "unsafe_payload_fragment" }],
      reasons: ["payload:unsafe_payload_fragment"],
    });
  }

  if (!validationSafetyFlagsAreReady(validationResult)) {
    return blockedResult({
      status: "blocked_unsafe_flags",
      validation: validationResult,
      rejectedFields: [
        { field: "safetyFlags", reason: "unsafe_validation_safety_flags" },
      ],
      reasons: ["safetyFlags:unsafe_validation_safety_flags"],
    });
  }

  if (!isRecord(input.dryRunPlan)) {
    return blockedResult({
      status: "blocked_unready_dry_run_plan",
      validation: validationResult,
      rejectedFields: [
        { field: "dryRunPlan", reason: "ready_dry_run_plan_required" },
      ],
      reasons: ["dryRunPlan:ready_dry_run_plan_required"],
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

  if (!isRecord(input.writeCommandResult)) {
    return blockedResult({
      status: "blocked_invalid_write_command_result",
      validation: validationResult,
      rejectedFields: [
        { field: "writeCommandResult", reason: "write_command_result_required" },
      ],
      reasons: ["writeCommandResult:write_command_result_required"],
    });
  }

  const writeCommandResult =
    input.writeCommandResult as PostTradeWriteServiceDraftResult;

  if (
    writeCommandResult.ready !== true ||
    writeCommandResult.status !== "ready_no_remote_write" ||
    writeCommandResult.executionMode !== "dry_run_command_only"
  ) {
    return blockedResult({
      status: "blocked_invalid_write_command_result",
      validation: validationResult,
      idempotencyKey: writeCommandResult.idempotencyKey,
      rejectedFields: [
        { field: "writeCommandResult", reason: "ready_no_remote_write_required" },
      ],
      reasons: ["writeCommandResult:ready_no_remote_write_required"],
    });
  }

  if (writeCommandResult.safetyFlags.noRemoteWrite !== true) {
    return blockedResult({
      status: "blocked_unsafe_flags",
      validation: validationResult,
      idempotencyKey: writeCommandResult.idempotencyKey,
      rejectedFields: [{ field: "safetyFlags", reason: "no_remote_write_required" }],
      reasons: ["safetyFlags:no_remote_write_required"],
    });
  }

  if (
    !Array.isArray(writeCommandResult.writeCommands) ||
    writeCommandResult.writeCommands.length === 0 ||
    !writeCommandResult.writeCommands.every(commandIsSafe)
  ) {
    return blockedResult({
      status: "blocked_missing_write_commands",
      validation: validationResult,
      idempotencyKey: writeCommandResult.idempotencyKey,
      rejectedFields: [
        { field: "writeCommands", reason: "safe_write_commands_required" },
      ],
      reasons: ["writeCommands:safe_write_commands_required"],
    });
  }

  if (!auditCommandIsSafe(writeCommandResult.auditCommand)) {
    return blockedResult({
      status: "blocked_missing_audit_command",
      validation: validationResult,
      writeCommands: writeCommandResult.writeCommands,
      idempotencyKey: writeCommandResult.idempotencyKey,
      rejectedFields: [
        { field: "auditCommand", reason: "safe_audit_command_required" },
      ],
      reasons: ["auditCommand:safe_audit_command_required"],
    });
  }

  const acceptedPayload = validationResult.acceptedPayload;
  const idempotencyKey = acceptedPayload.idempotencyKey;

  if (!idempotencyKey) {
    return blockedResult({
      status: "blocked_missing_idempotency",
      validation: validationResult,
      writeCommands: writeCommandResult.writeCommands,
      auditCommand: writeCommandResult.auditCommand,
      rejectedFields: [
        { field: "idempotencyKey", reason: "idempotency_key_required" },
      ],
      reasons: ["idempotencyKey:idempotency_key_required"],
    });
  }

  const idempotencyAligned =
    dryRunPlan.idempotencyKey === idempotencyKey &&
    dryRunPlan.auditEventPlan.idempotencyKey === idempotencyKey &&
    writeCommandResult.idempotencyKey === idempotencyKey &&
    writeCommandResult.auditCommand.idempotencyKey === idempotencyKey &&
    writeCommandResult.writeCommands.every(
      (command) => command.idempotencyKey === idempotencyKey,
    );

  if (!idempotencyAligned) {
    return blockedResult({
      status: "blocked_idempotency_mismatch",
      validation: validationResult,
      writeCommands: writeCommandResult.writeCommands,
      auditCommand: writeCommandResult.auditCommand,
      idempotencyKey,
      idempotencyAligned: false,
      rejectedFields: [
        { field: "idempotencyKey", reason: "idempotency_alignment_required" },
      ],
      reasons: ["idempotencyKey:idempotency_alignment_required"],
    });
  }

  return blockedResult({
    status: "blocked_no_remote_write",
    validation: validationResult,
    writeCommands: writeCommandResult.writeCommands,
    auditCommand: writeCommandResult.auditCommand,
    idempotencyKey,
    idempotencyAligned: true,
    rejectedFields: [],
    reasons: ["execution:blocked_until_future_staging_mock_write_execution_gate"],
  });
}

export function buildPostTradeWriteCapableStagingAdapterImplementationResult(
  input: PostTradeRemoteExecutionAdapterInput,
): PostTradeWriteCapableStagingAdapterResult {
  const boundaryResult = buildPostTradeRemoteExecutionAdapterResult(input);
  const preconditionsReady =
    boundaryResult.status === "blocked_no_remote_write" &&
    boundaryResult.idempotency.aligned &&
    boundaryResult.auditCommand.present &&
    boundaryResult.commands.acceptedCount > 0 &&
    boundaryResult.safetyFlags.noRawBrokerOrBrowserPayload &&
    boundaryResult.safetyFlags.noCredentialSessionOrBankIdMaterial &&
    boundaryResult.safetyFlags.noUnredactedBrokerDocument &&
    boundaryResult.safetyFlags.noArbitraryJsonBlob;

  return {
    contractVersion: WRITE_CAPABLE_CONTRACT_VERSION,
    status: preconditionsReady
      ? "implementation_ready_execution_blocked"
      : "blocked_precondition_failed",
    implementationStatus: preconditionsReady ? "implementation_ready" : "blocked",
    executionStatus: "execution_blocked",
    executionMode: "no_execution_without_separate_gate",
    stagingOnly: true,
    remoteExecution: false,
    target: boundaryResult.target,
    commandSummary: {
      acceptedCount: preconditionsReady ? boundaryResult.commands.acceptedCount : 0,
      rejectedCount: preconditionsReady
        ? 0
        : Math.max(
            boundaryResult.commands.rejectedCount,
            boundaryResult.commands.acceptedCount,
          ),
      tables: boundaryResult.commands.tables,
    },
    auditCommand: {
      required: true,
      present: boundaryResult.auditCommand.present,
      status:
        preconditionsReady && boundaryResult.auditCommand.present
          ? "accepted_for_future_execution"
          : "rejected",
    },
    idempotency: {
      required: true,
      key: boundaryResult.idempotency.key,
      aligned: boundaryResult.idempotency.aligned,
      status:
        preconditionsReady && boundaryResult.idempotency.aligned
          ? "accepted_for_future_execution"
          : "rejected",
    },
    requiredFutureApprovalGate:
      "post_trade_staging_mock_write_execution_final_gate",
    safetyFlags: {
      serverOnlyModule: true,
      stagingOnly: true,
      productionBlocked: true,
      serviceRoleServerOnly: true,
      noApiWriteBehavior: true,
      noRuntimeActivation: true,
      noTradeUiExecution: true,
      noExecutionInThisAction: true,
      noBroadWrites: true,
      sanitizedCommandsOnly: preconditionsReady,
      noRawBrokerOrBrowserPayload:
        boundaryResult.safetyFlags.noRawBrokerOrBrowserPayload,
      noCredentialSessionOrBankIdMaterial:
        boundaryResult.safetyFlags.noCredentialSessionOrBankIdMaterial,
      noUnredactedBrokerDocument:
        boundaryResult.safetyFlags.noUnredactedBrokerDocument,
      noArbitraryJsonBlob: boundaryResult.safetyFlags.noArbitraryJsonBlob,
    },
    rejectedFields: boundaryResult.rejectedFields,
    reasons: preconditionsReady
      ? ["execution:blocked_until_final_staging_mock_write_execution_gate"]
      : boundaryResult.reasons,
  };
}

function oneShotApprovalContextIsReady(
  context: PostTradeOneShotExecutionApprovalContext | null | undefined,
) {
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

function prerequisiteCommandIsReady(
  prerequisite: PostTradeExecutionRecordPrerequisiteCommandResult,
) {
  return (
    prerequisite.ready === true &&
    prerequisite.status === "ready_no_execution" &&
    prerequisite.remoteExecution === false &&
    prerequisite.executionMode === "no_execution_without_separate_gate" &&
    prerequisite.commandSet.length === 2 &&
    prerequisite.executionRecordCommand.table === "execution_records" &&
    prerequisite.executionRecordCommand.operationType ===
      "prepared_execution_record_insert_command" &&
    prerequisite.executionRecordCommand.recordReference ===
      "mock_execution_record_insert_result" &&
    prerequisite.auditCommand.table === "execution_record_audit_events" &&
    prerequisite.auditCommand.operationType ===
      "prepared_dependent_audit_insert_command" &&
    prerequisite.auditCommand.dependsOnCommandId ===
      prerequisite.executionRecordCommand.commandId &&
    prerequisite.auditCommand.executionRecordReference ===
      prerequisite.executionRecordCommand.recordReference &&
    prerequisite.auditCommand.recordBody.execution_record_id_reference ===
      prerequisite.executionRecordCommand.recordReference &&
    prerequisite.safetyFlags.noRemoteWrite === true &&
    prerequisite.safetyFlags.noDatabaseWrite === true &&
    prerequisite.safetyFlags.noApiWriteBehavior === true &&
    prerequisite.safetyFlags.noTradeUiExecution === true &&
    prerequisite.safetyFlags.noRealBrokerOrAvanzaData === true &&
    prerequisite.safetyFlags.noSettlementOrOrderBehavior === true &&
    !containsForbiddenKey(prerequisite)
  );
}

export function buildPostTradeOneShotExecutionUnblockResult(
  input: PostTradeOneShotExecutionUnblockInput,
): PostTradeOneShotExecutionUnblockResult {
  const boundaryResult = buildPostTradeRemoteExecutionAdapterResult(input);
  const approvalContext = input.oneShotApprovalContext ?? null;
  const maybePrerequisite = input.prerequisiteCommandResult as
    | PostTradeExecutionRecordPrerequisiteCommandResult
    | undefined;

  if (!oneShotApprovalContextIsReady(approvalContext)) {
    return oneShotBlockedResult({
      status: "blocked_missing_one_shot_context",
      validation:
        isRecord(input.validationResult) && input.validationResult.valid === true
          ? (input.validationResult as PostTradePayloadValidationResult)
          : undefined,
      approvalContext,
      prerequisite: isRecord(input.prerequisiteCommandResult)
        ? maybePrerequisite
        : null,
      idempotencyKey: approvalContext?.idempotencyKey ?? null,
      rejectedFields: [
        { field: "oneShotApprovalContext", reason: "one_shot_context_required" },
      ],
      reasons: ["oneShotApprovalContext:one_shot_context_required"],
    });
  }

  const readyApprovalContext =
    approvalContext as Required<PostTradeOneShotExecutionApprovalContext>;

  if (boundaryResult.status === "blocked_production_target") {
    return oneShotBlockedResult({
      status: "blocked_production_target",
      approvalContext,
      rejectedFields: boundaryResult.rejectedFields,
      reasons: boundaryResult.reasons,
    });
  }

  if (boundaryResult.status === "blocked_unsafe_payload") {
    return oneShotBlockedResult({
      status: "blocked_unsafe_payload",
      validation:
        isRecord(input.validationResult) && input.validationResult.valid === true
          ? (input.validationResult as PostTradePayloadValidationResult)
          : undefined,
      approvalContext,
      unsafePayload: true,
      rejectedFields: boundaryResult.rejectedFields,
      reasons: boundaryResult.reasons,
    });
  }

  if (boundaryResult.status === "blocked_unsafe_flags") {
    return oneShotBlockedResult({
      status: "blocked_unsafe_flags",
      validation:
        isRecord(input.validationResult) && input.validationResult.valid === true
          ? (input.validationResult as PostTradePayloadValidationResult)
          : undefined,
      approvalContext,
      rejectedFields: boundaryResult.rejectedFields,
      reasons: boundaryResult.reasons,
    });
  }

  if (boundaryResult.status !== "blocked_no_remote_write") {
    return oneShotBlockedResult({
      status: "blocked_precondition_failed",
      approvalContext,
      idempotencyKey: boundaryResult.idempotency.key,
      idempotencyAligned: boundaryResult.idempotency.aligned,
      rejectedFields: boundaryResult.rejectedFields,
      reasons: boundaryResult.reasons,
    });
  }

  if (!isRecord(input.prerequisiteCommandResult)) {
    return oneShotBlockedResult({
      status: "blocked_missing_prerequisite_command",
      validation: input.validationResult as PostTradePayloadValidationResult,
      approvalContext,
      idempotencyKey: boundaryResult.idempotency.key,
      idempotencyAligned: boundaryResult.idempotency.aligned,
      idempotencyTestScoped: true,
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

  if (!prerequisiteCommandIsReady(prerequisite)) {
    const missingAudit =
      prerequisite.ready === true &&
      (!prerequisite.auditCommand ||
        prerequisite.auditCommand.executionRecordReference !==
          "mock_execution_record_insert_result");

    return oneShotBlockedResult({
      status: missingAudit
        ? "blocked_missing_audit_command"
        : "blocked_missing_prerequisite_command",
      validation: input.validationResult as PostTradePayloadValidationResult,
      approvalContext,
      prerequisite,
      idempotencyKey: boundaryResult.idempotency.key,
      idempotencyAligned: boundaryResult.idempotency.aligned,
      idempotencyTestScoped: true,
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

  const validationResult = input.validationResult as PostTradePayloadValidationResult;
  const idempotencyKey = validationResult.acceptedPayload?.idempotencyKey ?? null;
  const idempotencyTestScoped =
    typeof idempotencyKey === "string" &&
    idempotencyKey.startsWith("post_trade:test:");
  const idempotencyAligned =
    boundaryResult.idempotency.aligned &&
    boundaryResult.idempotency.key === idempotencyKey &&
    readyApprovalContext.idempotencyKey === idempotencyKey &&
    prerequisite.idempotencyKey === idempotencyKey;

  if (!idempotencyKey) {
    return oneShotBlockedResult({
      status: "blocked_missing_idempotency",
      validation: validationResult,
      approvalContext,
      prerequisite,
      rejectedFields: [
        { field: "idempotencyKey", reason: "idempotency_key_required" },
      ],
      reasons: ["idempotencyKey:idempotency_key_required"],
    });
  }

  if (!idempotencyAligned || !idempotencyTestScoped) {
    return oneShotBlockedResult({
      status: "blocked_missing_idempotency",
      validation: validationResult,
      approvalContext,
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

  const readyPrerequisite = prerequisite as Extract<
    PostTradeExecutionRecordPrerequisiteCommandResult,
    { ready: true }
  >;

  return {
    contractVersion: ONE_SHOT_UNBLOCK_CONTRACT_VERSION,
    status: "eligible_no_write",
    readyForNextAction: true,
    oneShotGatePresent: true,
    oneShotGateEligible: true,
    executionStillRequiresNextAction: true,
    executionStatus: "not_executed",
    remoteExecution: false,
    target: {
      environmentName: POST_TRADE_STAGING_ENVIRONMENT_NAME,
      projectRef: POST_TRADE_STAGING_PROJECT_REF,
    },
    idempotency: {
      key: idempotencyKey,
      aligned: true,
      testScoped: true,
      status: "accepted_for_next_action",
    },
    prerequisiteCommand: {
      present: true,
      ready: true,
      table: readyPrerequisite.executionRecordCommand.table,
      status: "accepted_for_next_action",
    },
    auditDependency: {
      present: true,
      ready: true,
      placeholderReference: readyPrerequisite.auditCommand.executionRecordReference,
      status: "accepted_for_next_action",
    },
    safetyFlags: {
      serverOnlyModule: true,
      stagingOnly: true,
      productionBlocked: true,
      apiUiRuntimeBlocked: true,
      oneShotOnly: true,
      noExecutionInThisAction: true,
      noRemoteWrite: true,
      noSupabaseWriteMethodCall: true,
      noRuntimeActivation: true,
      noTradeUiExecution: true,
      noRawBrokerOrBrowserPayload: true,
      noCredentialSessionOrBankIdMaterial: true,
      noUnredactedBrokerDocument: true,
      noArbitraryJsonBlob: true,
      noRealBrokerOrAvanzaData: true,
      noSettlementOrOrderBehavior: true,
    },
    requiredNextAction: "post_trade_one_staging_mock_write_execution_action",
    rejectedFields: [],
    reasons: ["execution:eligible_only_for_next_action_no_write"],
  };
}
