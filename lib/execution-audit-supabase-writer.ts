import type {
  PersistExecutionAgentProgressEventRequest,
  PersistExecutionAgentRunRequest,
  PersistExecutionLifecycleEventRequest,
} from "@/lib/execution-audit-persistence-contract";
import {
  mapAgentProgressEventRequestToInsertPayload,
  mapAgentRunRequestToInsertPayload,
  mapLifecycleEventRequestToInsertPayload,
  type ExecutionAgentProgressEventInsertPayload,
  type ExecutionAgentRunInsertPayload,
  type ExecutionAuditPersistenceMappingResult,
  type ExecutionLifecycleEventInsertPayload,
} from "@/lib/execution-audit-persistence-writer";
import {
  assertExecutionAuditPersistenceAllowed,
  type ExecutionPersistenceFlagEnv,
} from "@/lib/execution-persistence-flags";

export const EXECUTION_AUDIT_TABLES = {
  lifecycleEvents: "execution_lifecycle_events",
  agentRuns: "execution_agent_runs",
  agentProgressEvents: "execution_agent_progress_events",
} as const;

export type ExecutionAuditTableName =
  (typeof EXECUTION_AUDIT_TABLES)[keyof typeof EXECUTION_AUDIT_TABLES];

export type SupabaseInsertResult = {
  data?: unknown;
  error?: { message?: string | null } | null;
};

export type ExecutionAuditSupabaseLikeClient = {
  from: (table: ExecutionAuditTableName) => {
    insert: (payload: unknown) => {
      select: (columns?: string) => {
        single: () => Promise<SupabaseInsertResult>;
      };
    };
  };
};

export type ExecutionAuditSupabaseWriterOptions = {
  db?: ExecutionAuditSupabaseLikeClient | null;
  env?: ExecutionPersistenceFlagEnv;
  userId?: string | null;
  source?: string | null;
};

export type ExecutionAuditSupabaseWriterResult<TPayload> = {
  ok: boolean;
  persisted: boolean;
  table: ExecutionAuditTableName;
  id?: string;
  payload?: TPayload;
  errors: string[];
  warnings: string[];
  message: string;
};

export type ExecutionAuditSupabasePersistenceWriter = {
  persistLifecycleEvent: (
    request: PersistExecutionLifecycleEventRequest,
    context?: ExecutionAuditSupabaseWriterOptions,
  ) => Promise<
    ExecutionAuditSupabaseWriterResult<ExecutionLifecycleEventInsertPayload>
  >;
  persistAgentRun: (
    request: PersistExecutionAgentRunRequest,
    context?: ExecutionAuditSupabaseWriterOptions,
  ) => Promise<ExecutionAuditSupabaseWriterResult<ExecutionAgentRunInsertPayload>>;
  persistAgentProgressEvent: (
    request: PersistExecutionAgentProgressEventRequest,
    context?: ExecutionAuditSupabaseWriterOptions,
  ) => Promise<
    ExecutionAuditSupabaseWriterResult<ExecutionAgentProgressEventInsertPayload>
  >;
};

type PersistMappedPayloadOptions<TPayload> = ExecutionAuditSupabaseWriterOptions & {
  mapping: ExecutionAuditPersistenceMappingResult<TPayload>;
  table: ExecutionAuditTableName;
};

function extractReturnedId(data: unknown): string | undefined {
  return data &&
    typeof data === "object" &&
    !Array.isArray(data) &&
    typeof (data as { id?: unknown }).id === "string"
    ? (data as { id: string }).id
    : undefined;
}

async function persistMappedPayload<TPayload>({
  db,
  env,
  mapping,
  table,
}: PersistMappedPayloadOptions<TPayload>): Promise<
  ExecutionAuditSupabaseWriterResult<TPayload>
> {
  const persistenceDecision = assertExecutionAuditPersistenceAllowed(env);

  if (!persistenceDecision.ok) {
    return {
      ok: false,
      persisted: false,
      table,
      ...(mapping.payload ? { payload: mapping.payload } : {}),
      errors: persistenceDecision.errors,
      warnings: [...persistenceDecision.warnings, ...mapping.warnings],
      message:
        "Execution audit Supabase writer skipped persistence because flags do not allow writes.",
    };
  }

  if (!mapping.ok || !mapping.payload) {
    return {
      ok: false,
      persisted: false,
      table,
      errors: mapping.errors,
      warnings: mapping.warnings,
      message:
        "Execution audit Supabase writer skipped persistence because request mapping failed.",
    };
  }

  if (!db) {
    return {
      ok: false,
      persisted: false,
      table,
      payload: mapping.payload,
      errors: ["Supabase writer requires a server DB client."],
      warnings: mapping.warnings,
      message:
        "Execution audit Supabase writer requires a server DB client. No database write occurred.",
    };
  }

  try {
    const result = await db
      .from(table)
      .insert(mapping.payload)
      .select("id")
      .single();

    if (result.error) {
      return {
        ok: false,
        persisted: false,
        table,
        payload: mapping.payload,
        errors: [
          result.error.message ||
            "Supabase insert failed without an error message.",
        ],
        warnings: mapping.warnings,
        message:
          "Execution audit Supabase writer insert failed. No confirmed database row was persisted.",
      };
    }

    return {
      ok: true,
      persisted: true,
      table,
      ...(extractReturnedId(result.data)
        ? { id: extractReturnedId(result.data) }
        : {}),
      payload: mapping.payload,
      errors: [],
      warnings: mapping.warnings,
      message: "Execution audit Supabase writer inserted the audit row.",
    };
  } catch (error) {
    return {
      ok: false,
      persisted: false,
      table,
      payload: mapping.payload,
      errors: [
        error instanceof Error
          ? error.message
          : "Supabase insert threw an unknown error.",
      ],
      warnings: mapping.warnings,
      message:
        "Execution audit Supabase writer caught an insert error. No confirmed database row was persisted.",
    };
  }
}

export function createSupabaseExecutionAuditPersistenceWriter(
  options: ExecutionAuditSupabaseWriterOptions = {},
): ExecutionAuditSupabasePersistenceWriter {
  return {
    persistLifecycleEvent: (request, context = {}) =>
      persistMappedPayload({
        ...options,
        ...context,
        table: EXECUTION_AUDIT_TABLES.lifecycleEvents,
        mapping: mapLifecycleEventRequestToInsertPayload(request, {
          userId: context.userId ?? options.userId,
          source: context.source ?? options.source,
        }),
      }),
    persistAgentRun: (request, context = {}) =>
      persistMappedPayload({
        ...options,
        ...context,
        table: EXECUTION_AUDIT_TABLES.agentRuns,
        mapping: mapAgentRunRequestToInsertPayload(request, {
          userId: context.userId ?? options.userId,
          source: context.source ?? options.source,
        }),
      }),
    persistAgentProgressEvent: (request, context = {}) =>
      persistMappedPayload({
        ...options,
        ...context,
        table: EXECUTION_AUDIT_TABLES.agentProgressEvents,
        mapping: mapAgentProgressEventRequestToInsertPayload(request, {
          userId: context.userId ?? options.userId,
          source: context.source ?? options.source,
        }),
      }),
  };
}
