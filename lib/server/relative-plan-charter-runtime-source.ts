import "server-only";
import { normalizeApplicationOwnerUserId } from "@/lib/application-session-core";
import { getServerSupabaseClient } from "@/lib/supabase-server";
import { relativePlanSemanticFingerprint, verifiedRelativePlanProspectiveFreeze } from "@/lib/server/relative-plan-prospective-comparison";
import { replayRelativePlanCharterRuntimePartition, RELATIVE_PLAN_OPERATIONAL_ROWS_LIMIT } from "@/lib/server/relative-plan-charter-runtime-replay";
import { hasObservedRelativePlanRecordingTime } from "@/lib/server/relative-plan-probability-measurement";

type Client = NonNullable<ReturnType<typeof getServerSupabaseClient>["client"]>;
type Rows = Record<string, unknown>[];
type WindowName = "held_out" | "walk_forward";
function exactRows(result: { data: unknown; count: number | null; error: unknown }): Rows | null {
  return !result.error && Array.isArray(result.data) && result.count === result.data.length &&
    result.data.length <= RELATIVE_PLAN_OPERATIONAL_ROWS_LIMIT && result.data.every(row => row && typeof row === "object" && !Array.isArray(row))
    ? result.data as Rows : null;
}
function fingerprint(rows: Rows) {
  return relativePlanSemanticFingerprint(rows.map(row => relativePlanSemanticFingerprint(row)).sort());
}

/** Complete stable owner-bound evidence. Failed and unattributed attempts stay
 * in the original denominator. Raw persisted rows remain reproducible later. */
export async function readRelativePlanCharterRuntimeSource(input: {
  owner: string; freeze: unknown; now: Date;
}, client: Client | null = getServerSupabaseClient().client) {
  const unavailable = (blocker: string) => ({ status: "unavailable" as const, partitions: null, blocker });
  const owner = normalizeApplicationOwnerUserId(input.owner);
  const freeze = owner ? verifiedRelativePlanProspectiveFreeze(input.freeze, owner) : null;
  if (!client || !owner || !freeze || !Number.isFinite(input.now.getTime())) return unavailable("relative_plan_runtime_source_binding_unavailable");
  const partitions = [];
  const readSignal = AbortSignal.timeout(20000);
  try {
    for (const name of ["held_out", "walk_forward"] as const) {
      const window = freeze.plan.windows[name];
      if (input.now.getTime() < Date.parse(window.start_at)) {
        partitions.push({ partition: name, status: "not_started" as const, evidence: [],
          observation_cycle_count: 0, scheduled_attempt_count: 0, unattributed_attempt_count: 0,
          original_window: window, read_as_of: input.now.toISOString(), retained_rows: null });
        continue;
      }
      const end = new Date(Math.min(Date.parse(window.end_at), input.now.getTime() + 1)).toISOString();
      const read = async () => {
        const [cycles, attempts] = await Promise.all([
          client.from("observation_cycle_receipts").select("*", { count: "exact" }).eq("owner_user_id", owner)
            .gte("route_received_at", window.start_at).lt("route_received_at", end)
            .order("route_received_at", { ascending: true }).order("cycle_fingerprint", { ascending: true })
            .limit(RELATIVE_PLAN_OPERATIONAL_ROWS_LIMIT + 1).abortSignal(readSignal),
          client.from("scheduled_scan_attempts").select("*", { count: "exact" })
            .gte("utc_timestamp", window.start_at).lt("utc_timestamp", end)
            .order("utc_timestamp", { ascending: true }).order("attempt_fingerprint", { ascending: true })
            .limit(RELATIVE_PLAN_OPERATIONAL_ROWS_LIMIT + 1).abortSignal(readSignal),
        ]);
        return { cycles: exactRows(cycles), attempts: exactRows(attempts) };
      };
      const first = await read();
      if (!first.cycles || !first.attempts) return unavailable("relative_plan_runtime_source_incomplete_or_unbounded");
      const second = await read();
      if (!second.cycles || !second.attempts || fingerprint(first.cycles) !== fingerprint(second.cycles) ||
        fingerprint(first.attempts) !== fingerprint(second.attempts)) return unavailable("relative_plan_runtime_source_changed_during_read");
      const replay = replayRelativePlanCharterRuntimePartition({ owner, freeze, now: input.now,
        rows: { partition: name, observation_cycles: second.cycles, scheduled_attempts: second.attempts } });
      if (!replay.partition) return unavailable(replay.blocker);
      // Event/generated time is not persistence availability. Check the WHOLE
      // stable read, including global unknown and failed attempts, without
      // filtering a favorable denominator. Cycle updated_at is generation
      // time and may legitimately precede its database created_at.
      if (![second.cycles, second.attempts].every(rows => rows.every(row =>
        hasObservedRelativePlanRecordingTime(row.created_at, input.now) &&
        hasObservedRelativePlanRecordingTime(row.updated_at, input.now)))) {
        return unavailable("relative_plan_runtime_source_recording_times_invalid");
      }
      partitions.push(replay.partition);
    }
    return { status: "available" as const, partitions, blocker: null };
  } catch { return unavailable("relative_plan_runtime_source_read_failed"); }
}
export type RelativePlanCharterRuntimeSource = Awaited<ReturnType<typeof readRelativePlanCharterRuntimeSource>>;
export type RelativePlanCharterRuntimePartition = Extract<RelativePlanCharterRuntimeSource,
  { status: "available" }>["partitions"][number] & { partition: WindowName };
