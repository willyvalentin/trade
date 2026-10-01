import "server-only";

import { normalizeApplicationOwnerUserId } from "@/lib/application-session-core";
import { buildObservationCycleReadback } from "@/lib/observation-cycle-receipt";
import { buildScannerProviderCreditAllocationLiveEvaluation } from "@/lib/scanner-provider-credit-allocation-live-evaluation";
import { SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_CONTRACT as contract } from "@/lib/scanner-provider-credit-allocation-live-experiment";
import { getServerSupabaseClient } from "@/lib/supabase-server";

// Frozen before collection; never infer the observed revision from a later
// reader deployment, mutable flags or a caller-provided query parameter.
const OBSERVED_REVISION = "8e243b67a9819eb3f7901b0468cdb3651e099a79";
const MAX_ROWS = 100;

function unavailable(reason: string) {
  return { status: "unavailable" as const, reason_codes: [reason], evaluation: null };
}

export async function readScannerProviderCreditAllocationLiveEvaluation(
  ownerUserId: string,
) {
  const owner = normalizeApplicationOwnerUserId(ownerUserId);
  if (!owner) return unavailable("allocation_evaluation_owner_invalid");
  const { client } = getServerSupabaseClient();
  if (!client) return unavailable("allocation_evaluation_server_unavailable");

  try {
    const [attempts, cycles] = await Promise.all([
      client.from("scheduled_scan_attempts")
        .select("attempt_fingerprint,source,mode,utc_timestamp,trading_date,intraday_scan_window,payload_json", { count: "exact" })
        .eq("source", "netlify_scheduled_function")
        .eq("mode", "scheduled")
        .gte("scheduled_function_fired_at", contract.slots[0].slot_utc)
        .lt("scheduled_function_fired_at", contract.expires_at_utc)
        .order("scheduled_function_fired_at", { ascending: true })
        .limit(MAX_ROWS),
      client.from("observation_cycle_receipts")
        .select("receipt_version,cycle_fingerprint,owner_user_id,source_attempt_fingerprint,trigger_kind,cycle_status,disposition,observation_policy_version,scheduled_slot_at,triggered_at,route_received_at,finalized_at,scan_run_fingerprint,receipt_json,updated_at", { count: "exact" })
        .eq("owner_user_id", owner)
        .gte("scheduled_slot_at", contract.slots[0].slot_utc)
        .lt("scheduled_slot_at", contract.expires_at_utc)
        .order("scheduled_slot_at", { ascending: true })
        .limit(MAX_ROWS),
    ]);
    if (
      attempts.error || cycles.error ||
      !Array.isArray(attempts.data) || !Array.isArray(cycles.data) ||
      attempts.count !== attempts.data.length || cycles.count !== cycles.data.length
    ) return unavailable("allocation_evaluation_window_read_incomplete");

    const readback = buildObservationCycleReadback(cycles.data);
    if (readback.status !== "available" ||
      cycles.data.some((row) => row.owner_user_id !== owner) ||
      readback.receipts.some((receipt) => receipt.owner_user_id !== owner)
    ) return unavailable("allocation_evaluation_cycle_evidence_invalid");

    return {
      status: "available" as const,
      reason_codes: [],
      evaluation: buildScannerProviderCreditAllocationLiveEvaluation({
        receipts: readback.receipts,
        scheduledAttemptRows: attempts.data,
        expectedRevision: OBSERVED_REVISION,
        evaluatedAt: new Date(),
      }),
    };
  } catch {
    return unavailable("allocation_evaluation_window_read_failed");
  }
}
