import "server-only";

import {
  POST_TRADE_STAGING_ENVIRONMENT_NAME,
  POST_TRADE_STAGING_PROJECT_REF,
} from "@/lib/post-trade-service-client-factory";
import type {
  PostTradeWriteServiceDraftAuditCommand,
  PostTradeWriteServiceDraftCommand,
  PostTradeWriteServiceDraftResult,
} from "@/lib/post-trade-write-service-draft";

export type PostTradeWriteServiceClientWiringDraftStatus =
  | "blocked_no_remote_write"
  | "blocked_invalid_write_command_result"
  | "blocked_missing_write_commands"
  | "blocked_missing_audit_command"
  | "blocked_idempotency_mismatch"
  | "blocked_unsafe_flags"
  | "blocked_production_target";

export type PostTradeWriteServiceClientWiringDraftInput = {
  writeCommandResult: unknown;
  target?: {
    environmentName?: string | null;
    projectRef?: string | null;
  };
};

export type PostTradeWriteServiceClientWiringDraftResult = {
  contractVersion: "post_trade_write_service_client_wiring_draft_v1";
  status: PostTradeWriteServiceClientWiringDraftStatus;
  ready: false;
  executionStatus: "blocked_no_remote_write";
  clientTarget: {
    environmentName: typeof POST_TRADE_STAGING_ENVIRONMENT_NAME;
    projectRef: typeof POST_TRADE_STAGING_PROJECT_REF;
  };
  writeCommandsReceived: number;
  writeCommandTables: string[];
  idempotencyKey: string | null;
  auditCommand: {
    present: boolean;
    table: "execution_record_audit_events" | null;
    idempotencyKey: string | null;
  };
  requiredFutureApprovalGate: "post_trade_staging_write_execution_gate";
  safetyFlags: {
    serverOnlyModule: true;
    stagingOnlyClientFactoryReference: true;
    serviceClientFactoryShapeProven: true;
    noClientInstantiation: true;
    noRemoteWrite: true;
    noSupabaseWriteMethodCall: true;
    noApiWriteBehavior: true;
    noRuntimeActivation: true;
    noTradeUiExecution: true;
    productionBlocked: true;
  };
  rejectedFields: { field: string; reason: string }[];
  reasons: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isProductionLike(value: string | null | undefined) {
  if (!value) return false;
  return /\b(prod|production|trade)\b/i.test(value);
}

function safetyFlags() {
  return {
    serverOnlyModule: true,
    stagingOnlyClientFactoryReference: true,
    serviceClientFactoryShapeProven: true,
    noClientInstantiation: true,
    noRemoteWrite: true,
    noSupabaseWriteMethodCall: true,
    noApiWriteBehavior: true,
    noRuntimeActivation: true,
    noTradeUiExecution: true,
    productionBlocked: true,
  } as const;
}

function blockedResult(input: {
  status: PostTradeWriteServiceClientWiringDraftStatus;
  writeCommands?: PostTradeWriteServiceDraftCommand[];
  auditCommand?: PostTradeWriteServiceDraftAuditCommand | null;
  idempotencyKey?: string | null;
  rejectedFields: { field: string; reason: string }[];
  reasons: string[];
}): PostTradeWriteServiceClientWiringDraftResult {
  return {
    contractVersion: "post_trade_write_service_client_wiring_draft_v1",
    status: input.status,
    ready: false,
    executionStatus: "blocked_no_remote_write",
    clientTarget: {
      environmentName: POST_TRADE_STAGING_ENVIRONMENT_NAME,
      projectRef: POST_TRADE_STAGING_PROJECT_REF,
    },
    writeCommandsReceived: input.writeCommands?.length ?? 0,
    writeCommandTables: input.writeCommands?.map((command) => command.table) ?? [],
    idempotencyKey: input.idempotencyKey ?? null,
    auditCommand: {
      present: Boolean(input.auditCommand),
      table: input.auditCommand?.table ?? null,
      idempotencyKey: input.auditCommand?.idempotencyKey ?? null,
    },
    requiredFutureApprovalGate: "post_trade_staging_write_execution_gate",
    safetyFlags: safetyFlags(),
    rejectedFields: input.rejectedFields,
    reasons: input.reasons,
  };
}

function commandsAreSafe(commands: PostTradeWriteServiceDraftCommand[]) {
  return commands.every(
    (command) =>
      command.operationType === "prepared_insert_command" &&
      command.executionMode === "dry_run_command_only" &&
      command.remoteExecution === false &&
      typeof command.idempotencyKey === "string" &&
      command.idempotencyKey.length > 0 &&
      isRecord(command.recordBody),
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
    auditCommand.idempotencyKey.length > 0
  );
}

export function buildPostTradeWriteServiceClientWiringDraft(
  input: PostTradeWriteServiceClientWiringDraftInput,
): PostTradeWriteServiceClientWiringDraftResult {
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

  if (!isRecord(input.writeCommandResult)) {
    return blockedResult({
      status: "blocked_invalid_write_command_result",
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
      idempotencyKey: writeCommandResult.idempotencyKey,
      rejectedFields: [{ field: "safetyFlags", reason: "no_remote_write_required" }],
      reasons: ["safetyFlags:no_remote_write_required"],
    });
  }

  if (
    !Array.isArray(writeCommandResult.writeCommands) ||
    writeCommandResult.writeCommands.length === 0 ||
    !commandsAreSafe(writeCommandResult.writeCommands)
  ) {
    return blockedResult({
      status: "blocked_missing_write_commands",
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
      writeCommands: writeCommandResult.writeCommands,
      idempotencyKey: writeCommandResult.idempotencyKey,
      rejectedFields: [
        { field: "auditCommand", reason: "safe_audit_command_required" },
      ],
      reasons: ["auditCommand:safe_audit_command_required"],
    });
  }

  const commandIdempotencyMismatch = writeCommandResult.writeCommands.some(
    (command) => command.idempotencyKey !== writeCommandResult.idempotencyKey,
  );

  if (
    commandIdempotencyMismatch ||
    writeCommandResult.auditCommand.idempotencyKey !==
      writeCommandResult.idempotencyKey
  ) {
    return blockedResult({
      status: "blocked_idempotency_mismatch",
      writeCommands: writeCommandResult.writeCommands,
      auditCommand: writeCommandResult.auditCommand,
      idempotencyKey: writeCommandResult.idempotencyKey,
      rejectedFields: [
        { field: "idempotencyKey", reason: "idempotency_alignment_required" },
      ],
      reasons: ["idempotencyKey:idempotency_alignment_required"],
    });
  }

  return blockedResult({
    status: "blocked_no_remote_write",
    writeCommands: writeCommandResult.writeCommands,
    auditCommand: writeCommandResult.auditCommand,
    idempotencyKey: writeCommandResult.idempotencyKey,
    rejectedFields: [],
    reasons: ["execution:blocked_until_future_staging_write_execution_gate"],
  });
}
