export type ServerPersistenceErrorType =
  | "server_persistence_unavailable"
  | "supabase_missing_env"
  | "supabase_insert_failed"
  | "rls_or_permission_error"
  | "table_missing"
  | "unknown";

export function classifySupabasePersistenceError(error: unknown): ServerPersistenceErrorType {
  const text = JSON.stringify(error ?? "").toLowerCase();
  const code =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
      ? error.code
      : "";

  if (code === "42P01" || text.includes("does not exist")) {
    return "table_missing";
  }

  if (
    code === "42501" ||
    text.includes("row-level security") ||
    text.includes("permission denied") ||
    text.includes("not authorized") ||
    text.includes("rls")
  ) {
    return "rls_or_permission_error";
  }

  if (text.includes("missing") && text.includes("supabase")) {
    return "supabase_missing_env";
  }

  if (text.trim().length > 2) {
    return "supabase_insert_failed";
  }

  return "unknown";
}
