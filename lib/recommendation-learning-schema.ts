import { normalizeUnknownError } from "@/lib/error-logging";
import { classifySupabasePersistenceError } from "@/lib/persistence-error-classifier";

export const recommendationLearningTables = [
  "recommendation_scan_runs",
  "recommendation_batches",
  "recommendation_snapshots",
  "recommendation_outcomes",
] as const;

export type RecommendationLearningTable =
  (typeof recommendationLearningTables)[number];

export type RecommendationLearningSchemaCheck = {
  checked_at: string;
  schema_ready: boolean;
  required_tables: RecommendationLearningTable[];
  existing_tables: RecommendationLearningTable[];
  missing_tables: RecommendationLearningTable[];
  last_schema_error: string | null;
};

type SupabaseTableProbeClient = {
  from: (table: string) => {
    select?: (
      columns: string,
      options?: Record<string, unknown>,
    ) => {
      limit?: (count: number) => PromiseLike<{ error?: unknown }>;
    };
  };
};

function errorMessage(error: unknown) {
  const normalized = normalizeUnknownError(error);
  return (
    normalized.message ??
    (error instanceof Error ? error.message : "Unknown schema probe error")
  );
}

function isMissingTableError(error: unknown) {
  const normalized = normalizeUnknownError(error);
  const message = errorMessage(error).toLowerCase();

  return (
    normalized.code === "PGRST205" ||
    message.includes("could not find the table") ||
    message.includes("does not exist")
  );
}

export async function checkRecommendationLearningSchema({
  supabaseClient,
  unavailableReason = null,
}: {
  supabaseClient?: SupabaseTableProbeClient | null;
  unavailableReason?: string | null;
}): Promise<RecommendationLearningSchemaCheck> {
  const existingTables: RecommendationLearningTable[] = [];
  const missingTables: RecommendationLearningTable[] = [];
  let lastSchemaError: string | null = unavailableReason
    ? `server_supabase_unavailable:${unavailableReason}`
    : null;

  if (!supabaseClient?.from) {
    return {
      checked_at: new Date().toISOString(),
      schema_ready: false,
      required_tables: [...recommendationLearningTables],
      existing_tables: existingTables,
      missing_tables: [...recommendationLearningTables],
      last_schema_error: lastSchemaError ?? "server_supabase_unavailable",
    };
  }

  for (const table of recommendationLearningTables) {
    try {
      const result = await supabaseClient
        .from(table)
        .select?.("id", { head: true, count: "exact" })
        .limit?.(0);
      const error = result?.error;

      if (!error) {
        existingTables.push(table);
        continue;
      }

      if (isMissingTableError(error)) {
        missingTables.push(table);
      } else {
        lastSchemaError = `${table}:${classifySupabasePersistenceError(error)}:${errorMessage(error)}`;
      }
    } catch (error) {
      if (isMissingTableError(error)) {
        missingTables.push(table);
      } else {
        lastSchemaError = `${table}:${classifySupabasePersistenceError(error)}:${errorMessage(error)}`;
      }
    }
  }

  return {
    checked_at: new Date().toISOString(),
    schema_ready: missingTables.length === 0 && lastSchemaError === null,
    required_tables: [...recommendationLearningTables],
    existing_tables: existingTables,
    missing_tables: missingTables,
    last_schema_error: lastSchemaError,
  };
}
