import type {
  ExecutionAuditPersistenceResponse,
  PersistExecutionAgentProgressEventRequest,
  PersistExecutionAgentRunRequest,
  PersistExecutionLifecycleEventRequest,
} from "@/lib/execution-audit-persistence-contract";
import {
  createAcceptedExecutionAuditPersistenceResponse,
  createRejectedExecutionAuditPersistenceResponse,
} from "@/lib/execution-audit-persistence-contract";
import {
  createNoopExecutionAuditPersistenceWriter,
} from "@/lib/execution-audit-persistence-writer";
import {
  createSupabaseExecutionAuditPersistenceWriter,
  EXECUTION_AUDIT_TABLES,
  type ExecutionAuditSupabaseLikeClient,
  type ExecutionAuditSupabaseWriterResult,
} from "@/lib/execution-audit-supabase-writer";
import {
  assertExecutionAuditPersistenceAllowed,
  isExecutionAuditSupabaseWriterEnabled,
  type ExecutionPersistenceFlagEnv,
} from "@/lib/execution-persistence-flags";

export type ExecutionAuditPersistenceRouteKind =
  | "lifecycle_event"
  | "agent_run"
  | "agent_progress_event";

export type BuildExecutionAuditPersistenceRouteResponseInput = {
  kind: ExecutionAuditPersistenceRouteKind;
  request:
    | PersistExecutionLifecycleEventRequest
    | PersistExecutionAgentRunRequest
    | PersistExecutionAgentProgressEventRequest;
  id?: string | null;
  validationWarnings?: string[] | null;
  stubMessage: string;
  env?: ExecutionPersistenceFlagEnv;
  getDbClient?: () => ExecutionAuditSupabaseLikeClient | null;
};

export type ExecutionAuditPersistenceRouteResponseResult = {
  statusCode: number;
  response: ExecutionAuditPersistenceResponse;
};

type WriterMode = "stub" | "no_op" | "supabase";

const noopWriterWarning =
  "Supabase persistence flag is enabled, but this build uses no-op writer. No database write occurred.";

function persistWithNoopWriter(
  kind: ExecutionAuditPersistenceRouteKind,
  request: BuildExecutionAuditPersistenceRouteResponseInput["request"],
) {
  const writer = createNoopExecutionAuditPersistenceWriter();

  if (kind === "lifecycle_event") {
    return writer.persistLifecycleEvent(
      request as PersistExecutionLifecycleEventRequest,
    );
  }

  if (kind === "agent_run") {
    return writer.persistAgentRun(request as PersistExecutionAgentRunRequest);
  }

  return writer.persistAgentProgressEvent(
    request as PersistExecutionAgentProgressEventRequest,
  );
}

function tableForKind(kind: ExecutionAuditPersistenceRouteKind) {
  if (kind === "lifecycle_event") {
    return EXECUTION_AUDIT_TABLES.lifecycleEvents;
  }

  if (kind === "agent_run") {
    return EXECUTION_AUDIT_TABLES.agentRuns;
  }

  return EXECUTION_AUDIT_TABLES.agentProgressEvents;
}

async function persistWithSupabaseWriter(
  kind: ExecutionAuditPersistenceRouteKind,
  request: BuildExecutionAuditPersistenceRouteResponseInput["request"],
  env: ExecutionPersistenceFlagEnv | undefined,
  getDbClient: (() => ExecutionAuditSupabaseLikeClient | null) | undefined,
): Promise<ExecutionAuditSupabaseWriterResult<unknown>> {
  const writer = createSupabaseExecutionAuditPersistenceWriter({
    db: getDbClient?.() ?? null,
    env,
  });

  if (kind === "lifecycle_event") {
    return writer.persistLifecycleEvent(
      request as PersistExecutionLifecycleEventRequest,
    );
  }

  if (kind === "agent_run") {
    return writer.persistAgentRun(request as PersistExecutionAgentRunRequest);
  }

  return writer.persistAgentProgressEvent(
    request as PersistExecutionAgentProgressEventRequest,
  );
}

function responseMetadata(input: {
  persisted: boolean;
  table?: string | null;
  writerMode: WriterMode;
}) {
  return {
    persisted: input.persisted,
    writerMode: input.writerMode,
    ...(input.table ? { table: input.table } : {}),
  };
}

export async function buildExecutionAuditPersistenceRouteResponse({
  env,
  getDbClient,
  id,
  kind,
  request,
  stubMessage,
  validationWarnings = [],
}: BuildExecutionAuditPersistenceRouteResponseInput): Promise<ExecutionAuditPersistenceRouteResponseResult> {
  const persistenceDecision = assertExecutionAuditPersistenceAllowed(env);
  const baseWarnings = validationWarnings?.filter(Boolean) ?? [];

  if (!persistenceDecision.persistenceEnabled) {
    return {
      statusCode: 202,
      response: createAcceptedExecutionAuditPersistenceResponse({
        id,
        warnings: baseWarnings,
        message: stubMessage,
        metadata: responseMetadata({
          persisted: false,
          writerMode: "stub",
        }),
      }),
    };
  }

  if (!persistenceDecision.ok) {
    return {
      statusCode: 403,
      response: createRejectedExecutionAuditPersistenceResponse({
        status: "disabled",
        errors: persistenceDecision.errors,
        warnings: [...baseWarnings, ...persistenceDecision.warnings],
        message:
          "Execution audit Supabase persistence is not allowed for this environment. No database write occurred.",
        metadata: responseMetadata({
          persisted: false,
          writerMode: "stub",
        }),
      }),
    };
  }

  const writerMode = isExecutionAuditSupabaseWriterEnabled(env)
    ? "supabase"
    : "no_op";

  if (writerMode === "supabase") {
    const writerResult = await persistWithSupabaseWriter(
      kind,
      request,
      env,
      getDbClient,
    );

    if (!writerResult.ok) {
      return {
        statusCode: 503,
        response: createRejectedExecutionAuditPersistenceResponse({
          status: "failed",
          errors: writerResult.errors,
          warnings: [
            ...baseWarnings,
            ...persistenceDecision.warnings,
            ...writerResult.warnings,
          ],
          message:
            "Execution audit Supabase writer failed or was unavailable. No confirmed database write occurred.",
          metadata: responseMetadata({
            persisted: writerResult.persisted,
            table: writerResult.table,
            writerMode,
          }),
        }),
      };
    }

    return {
      statusCode: 202,
      response: createAcceptedExecutionAuditPersistenceResponse({
        id: writerResult.id ?? id,
        warnings: [
          ...baseWarnings,
          ...persistenceDecision.warnings,
          ...writerResult.warnings,
        ],
        message:
          writerResult.message ||
          "Execution audit request persisted by Supabase writer.",
        metadata: responseMetadata({
          persisted: writerResult.persisted,
          table: writerResult.table,
          writerMode,
        }),
      }),
    };
  }

  const writerResult = persistWithNoopWriter(kind, request);

  if (!writerResult.ok) {
    return {
      statusCode: 400,
      response: createRejectedExecutionAuditPersistenceResponse({
        status: "failed",
        errors: writerResult.errors,
        warnings: [
          ...baseWarnings,
          ...persistenceDecision.warnings,
          ...writerResult.warnings,
        ],
        message:
          "Execution audit persistence writer draft rejected the mapped request. No database write occurred.",
        metadata: responseMetadata({
          persisted: writerResult.persisted,
          table: tableForKind(kind),
          writerMode,
        }),
      }),
    };
  }

  return {
    statusCode: 202,
    response: createAcceptedExecutionAuditPersistenceResponse({
      id,
      warnings: [
        ...baseWarnings,
        ...persistenceDecision.warnings,
        noopWriterWarning,
        ...writerResult.warnings,
      ],
      message:
        "Execution audit request accepted by no-op persistence writer. Supabase persistence flag is enabled, but no database write occurred.",
      metadata: responseMetadata({
        persisted: false,
        table: tableForKind(kind),
        writerMode,
      }),
    }),
  };
}
