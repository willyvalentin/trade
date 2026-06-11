import { getServerSupabaseClient } from "@/lib/supabase-server";
import type {
  ExecutionAuditSupabaseLikeClient,
} from "@/lib/execution-audit-supabase-writer";

export function getExecutionAuditSupabaseDbClient(): ExecutionAuditSupabaseLikeClient | null {
  const serverSupabase = getServerSupabaseClient();

  return serverSupabase.client as unknown as ExecutionAuditSupabaseLikeClient | null;
}
