import "server-only";

import { buildScanLogMessage, type ScanLogPersistenceInput } from "@/lib/scan-log-core";
import { getServerSupabaseClient } from "@/lib/supabase-server";

export async function recordScanLog(input: ScanLogPersistenceInput) {
  const { client } = getServerSupabaseClient();
  if (!client) return { status: "unavailable" as const };

  const { error } = await client.from("scheduled_scan_runs").insert({
    scan_date: input.scanDate,
    session_type: input.sessionType,
    status: input.status ?? "completed",
    recommendations_created: input.scanLog.recommendations_created,
    message: buildScanLogMessage(input.scanLog.message, input.scanLog),
  });

  return error ? { status: "failed" as const } : { status: "available" as const };
}
