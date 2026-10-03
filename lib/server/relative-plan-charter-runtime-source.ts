import "server-only";
import { normalizeApplicationOwnerUserId } from "@/lib/application-session-core";
import { getServerSupabaseClient } from "@/lib/supabase-server";
import { buildScannerClockPriorShadowForwardRuntimeEvidence } from "@/lib/scanner-clock-prior-shadow-forward-runtime-evidence";
import { buildObservationCycleReadback } from "@/lib/observation-cycle-receipt";
import { scheduledScanInvocationReceiptFromAttempt } from "@/lib/scheduled-scan-invocation-receipt";
import { getNyMarketTime } from "@/lib/market-session";
import { relativePlanSemanticFingerprint, relativePlanSemanticJson, verifiedRelativePlanProspectiveFreeze } from "@/lib/server/relative-plan-prospective-comparison";

// Physical read bound, not a sample cap: any excess or unstable source is
// unavailable, never truncated into a better reliability or cost denominator.
const MAXIMUM_OPERATIONAL_ROWS = 1000;
type Client = NonNullable<ReturnType<typeof getServerSupabaseClient>["client"]>;
type Rows = Record<string, unknown>[];
type WindowName = "held_out" | "walk_forward";

function exactRows(result: { data: unknown; count: number | null; error: unknown }): Rows | null {
  return !result.error && Array.isArray(result.data) && result.count === result.data.length &&
    result.data.length <= MAXIMUM_OPERATIONAL_ROWS && result.data.every(row => row && typeof row === "object" && !Array.isArray(row))
    ? result.data as Rows : null;
}
function fingerprint(rows: Rows) {
  return relativePlanSemanticFingerprint(rows.map(row => relativePlanSemanticFingerprint(row)).sort());
}

/** Owner-bound read-only operational evidence for the same frozen forward
 * windows. Reuses the real receipt/credit decoder, not the old clock-prior
 * experiment's enrollment or scorecard. Failed admitted attempts remain in
 * evidence. Unattributed scheduled rows are disclosed, not assigned an owner
 * or silently erased to manufacture reliability. */
export async function readRelativePlanCharterRuntimeSource(input: {
  owner: string; freeze: unknown; now: Date;
}, client: Client | null = getServerSupabaseClient().client) {
  const unavailable = (blocker: string) => ({ status: "unavailable" as const, partitions: null, blocker });
  const owner = normalizeApplicationOwnerUserId(input.owner);
  const freeze = owner ? verifiedRelativePlanProspectiveFreeze(input.freeze, owner) : null;
  if (!client || !owner || !freeze || !Number.isFinite(input.now.getTime())) return unavailable("relative_plan_runtime_source_binding_unavailable");
  const partitions = [];
  // One shared bound across both partitions and both complete passes, not a
  // fresh timeout per query that could exhaust the synchronous API runtime.
  const readSignal = AbortSignal.timeout(20000);
  try {
    for (const name of ["held_out", "walk_forward"] as const) {
      const window = freeze.plan.windows[name];
      if (input.now.getTime() < Date.parse(window.start_at)) {
        partitions.push({ partition: name, status: "not_started" as const, evidence: [],
          observation_cycle_count: 0, scheduled_attempt_count: 0, unattributed_attempt_count: 0,
          original_window: window, read_as_of: input.now.toISOString() });
        continue;
      }
      const end = new Date(Math.min(Date.parse(window.end_at), input.now.getTime() + 1)).toISOString();
      const read = async () => {
        const [cycles, attempts] = await Promise.all([
          client.from("observation_cycle_receipts").select("*", { count: "exact" }).eq("owner_user_id", owner)
            .gte("route_received_at", window.start_at).lt("route_received_at", end)
            .order("route_received_at", { ascending: true }).order("cycle_fingerprint", { ascending: true })
            .limit(MAXIMUM_OPERATIONAL_ROWS + 1).abortSignal(readSignal),
          client.from("scheduled_scan_attempts").select("*", { count: "exact" })
            .gte("utc_timestamp", window.start_at).lt("utc_timestamp", end)
            .order("utc_timestamp", { ascending: true }).order("attempt_fingerprint", { ascending: true })
            .limit(MAXIMUM_OPERATIONAL_ROWS + 1).abortSignal(readSignal),
        ]);
        return { cycles: exactRows(cycles), attempts: exactRows(attempts) };
      };
      const first = await read();
      if (!first.cycles || !first.attempts) return unavailable("relative_plan_runtime_source_incomplete_or_unbounded");
      const second = await read();
      if (!second.cycles || !second.attempts || fingerprint(first.cycles) !== fingerprint(second.cycles) ||
        fingerprint(first.attempts) !== fingerprint(second.attempts)) return unavailable("relative_plan_runtime_source_changed_during_read");
      if (buildObservationCycleReadback(second.cycles).status !== "available") {
        return unavailable("relative_plan_runtime_receipt_or_attempt_binding_invalid");
      }
      const decoded = buildScannerClockPriorShadowForwardRuntimeEvidence({ ownerUserId: owner,
        observationCycleRows: second.cycles, scheduledAttemptRows: second.attempts });
      if (decoded.status !== "available") return unavailable("relative_plan_runtime_receipt_or_attempt_binding_invalid");
      const cycleIds = new Set(decoded.evidence.map(row => row.receipt.cycle_fingerprint));
      const attemptIds = new Set(decoded.evidence.map(row => row.receipt.source_attempt_fingerprint));
      if (cycleIds.size !== decoded.evidence.length || attemptIds.size !== decoded.evidence.length) {
        return unavailable("relative_plan_runtime_original_attempt_duplicated");
      }
      // An equal fingerprint alone cannot bind a cost receipt. Retain the
      // scheduler-owned slot/build envelope and both actual persisted clocks;
      // route enrichment or a later failure may retain the earlier fired time.
      if (decoded.evidence.some(({ receipt }) => {
        const attempt = second.attempts!.find(row => row.attempt_fingerprint === receipt.source_attempt_fingerprint);
        const invocation = attempt ? scheduledScanInvocationReceiptFromAttempt({
          source: attempt.source, mode: attempt.mode, payload: attempt.payload_json }) : null;
        const at = Date.parse(String(attempt?.utc_timestamp ?? ""));
        return !attempt || !invocation || !Number.isFinite(at) ||
          at < Date.parse(receipt.trigger.occurred_at) || at > Date.parse(receipt.trigger.route_received_at) ||
          Date.parse(String(attempt.route_received_at ?? "")) !== Date.parse(receipt.trigger.route_received_at) ||
          attempt.trading_date !== getNyMarketTime(receipt.trigger.route_received_at).ny_date ||
          (attempt.scan_run_fingerprint ?? null) !== receipt.scan_run_fingerprint ||
          invocation.scheduled_slot_started_at_utc !== receipt.trigger.scheduled_slot_started_at_utc ||
          relativePlanSemanticJson(invocation.build_deployment_identity) !== relativePlanSemanticJson(receipt.trigger.build_deployment_identity);
      })) return unavailable("relative_plan_runtime_scheduler_owned_attempt_binding_invalid");
      // The DB range is not enough: bind each retained receipt to its actual
      // persisted clock and the fixed as-of time before using it as evidence.
      if (decoded.evidence.some(({ receipt }) => {
        const row = second.cycles!.find(value => value.cycle_fingerprint === receipt.cycle_fingerprint);
        const at = Date.parse(String(row?.route_received_at ?? ""));
        return !Number.isFinite(at) || at !== Date.parse(receipt.trigger.route_received_at) ||
          at < Date.parse(window.start_at) || at >= Date.parse(window.end_at) || at > input.now.getTime() ||
          Date.parse(receipt.receipt_generated_at) > input.now.getTime() ||
          (receipt.finalized_at !== null && Date.parse(receipt.finalized_at) > input.now.getTime());
      })) return unavailable("relative_plan_runtime_original_clock_binding_invalid");
      const unbound = second.attempts.filter(row => typeof row.attempt_fingerprint !== "string" || !attemptIds.has(row.attempt_fingerprint));
      partitions.push({ partition: name, status: "available" as const, evidence: decoded.evidence,
        observation_cycle_count: decoded.evidence.length, scheduled_attempt_count: second.attempts.length,
        unattributed_attempt_count: unbound.length, original_window: window, read_as_of: input.now.toISOString() });
    }
    return { status: "available" as const, partitions, blocker: null };
  } catch { return unavailable("relative_plan_runtime_source_read_failed"); }
}

export type RelativePlanCharterRuntimeSource = Awaited<ReturnType<typeof readRelativePlanCharterRuntimeSource>>;
export type RelativePlanCharterRuntimePartition = Extract<RelativePlanCharterRuntimeSource,
  { status: "available" }>["partitions"][number] & { partition: WindowName };
