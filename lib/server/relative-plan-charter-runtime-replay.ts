import "server-only";
import { buildScannerClockPriorShadowForwardRuntimeEvidence } from "@/lib/scanner-clock-prior-shadow-forward-runtime-evidence";
import { buildObservationCycleReadback } from "@/lib/observation-cycle-receipt";
import { scheduledScanInvocationReceiptFromAttempt } from "@/lib/scheduled-scan-invocation-receipt";
import { getNyMarketTime } from "@/lib/market-session";
import { relativePlanSemanticJson, verifiedRelativePlanProspectiveFreeze } from "@/lib/server/relative-plan-prospective-comparison";

export const RELATIVE_PLAN_OPERATIONAL_ROWS_LIMIT = 1000;
export type RelativePlanRetainedRuntimeRows = {
  partition: "held_out" | "walk_forward";
  observation_cycles: Record<string, unknown>[];
  scheduled_attempts: Record<string, unknown>[];
};

/** Replays actual persisted columns AND JSON, not a self-hashed aggregate.
 * The same decoder serves the complete SDK read and the retained result. */
export function replayRelativePlanCharterRuntimePartition(input: {
  owner: string; freeze: unknown; now: Date; rows: RelativePlanRetainedRuntimeRows;
}) {
  const unavailable = (blocker: string) => ({ status: "unavailable" as const, partition: null, blocker });
  const freeze = verifiedRelativePlanProspectiveFreeze(input.freeze, input.owner);
  if (!freeze || !Number.isFinite(input.now.getTime()) || !input.rows ||
    !["held_out", "walk_forward"].includes(input.rows.partition)) return unavailable("relative_plan_runtime_source_binding_unavailable");
  const window = freeze.plan.windows[input.rows.partition];
  const cycles = input.rows.observation_cycles, attempts = input.rows.scheduled_attempts;
  if (![cycles, attempts].every(rows => Array.isArray(rows) && rows.length <= RELATIVE_PLAN_OPERATIONAL_ROWS_LIMIT &&
    rows.every(row => row && typeof row === "object" && !Array.isArray(row)))) {
    return unavailable("relative_plan_runtime_source_incomplete_or_unbounded");
  }
  if (attempts.some(row => {
    const at = Date.parse(String(row.utc_timestamp ?? ""));
    return !Number.isFinite(at) || at < Date.parse(window.start_at) || at >= Date.parse(window.end_at) || at > input.now.getTime();
  })) return unavailable("relative_plan_runtime_original_clock_binding_invalid");
  if (buildObservationCycleReadback(cycles).status !== "available") return unavailable("relative_plan_runtime_receipt_or_attempt_binding_invalid");
  const decoded = buildScannerClockPriorShadowForwardRuntimeEvidence({ ownerUserId: input.owner,
    observationCycleRows: cycles, scheduledAttemptRows: attempts });
  if (decoded.status !== "available") return unavailable("relative_plan_runtime_receipt_or_attempt_binding_invalid");
  const cycleIds = new Set(decoded.evidence.map(row => row.receipt.cycle_fingerprint));
  const attemptIds = new Set(decoded.evidence.map(row => row.receipt.source_attempt_fingerprint));
  if (cycleIds.size !== decoded.evidence.length || attemptIds.size !== decoded.evidence.length) return unavailable("relative_plan_runtime_original_attempt_duplicated");
  if (decoded.evidence.some(({ receipt }) => {
    const attempt = attempts.find(row => row.attempt_fingerprint === receipt.source_attempt_fingerprint);
    const invocation = attempt ? scheduledScanInvocationReceiptFromAttempt({ source: attempt.source, mode: attempt.mode, payload: attempt.payload_json }) : null;
    const at = Date.parse(String(attempt?.utc_timestamp ?? ""));
    return !attempt || !invocation || !Number.isFinite(at) ||
      at < Date.parse(receipt.trigger.occurred_at) || at > Date.parse(receipt.trigger.route_received_at) ||
      Date.parse(String(attempt.route_received_at ?? "")) !== Date.parse(receipt.trigger.route_received_at) ||
      attempt.trading_date !== getNyMarketTime(receipt.trigger.route_received_at).ny_date ||
      (attempt.scan_run_fingerprint ?? null) !== receipt.scan_run_fingerprint ||
      invocation.scheduled_slot_started_at_utc !== receipt.trigger.scheduled_slot_started_at_utc ||
      relativePlanSemanticJson(invocation.build_deployment_identity) !== relativePlanSemanticJson(receipt.trigger.build_deployment_identity);
  })) return unavailable("relative_plan_runtime_scheduler_owned_attempt_binding_invalid");
  if (decoded.evidence.some(({ receipt }) => {
    const row = cycles.find(value => value.cycle_fingerprint === receipt.cycle_fingerprint);
    const at = Date.parse(String(row?.route_received_at ?? ""));
    return !Number.isFinite(at) || at !== Date.parse(receipt.trigger.route_received_at) ||
      at < Date.parse(window.start_at) || at >= Date.parse(window.end_at) || at > input.now.getTime() ||
      Date.parse(receipt.receipt_generated_at) > input.now.getTime() ||
      (receipt.finalized_at !== null && Date.parse(receipt.finalized_at) > input.now.getTime());
  })) return unavailable("relative_plan_runtime_original_clock_binding_invalid");
  const unbound = attempts.filter(row => typeof row.attempt_fingerprint !== "string" || !attemptIds.has(row.attempt_fingerprint));
  return { status: "available" as const, blocker: null, partition: {
    partition: input.rows.partition, status: "available" as const, evidence: decoded.evidence,
    observation_cycle_count: decoded.evidence.length, scheduled_attempt_count: attempts.length,
    unattributed_attempt_count: unbound.length, original_window: window, read_as_of: input.now.toISOString(),
    // Global scheduler rows with no owned receipt are an unknown denominator,
    // not permission to expose another owner's raw payload in a result API.
    // Preserve every original identity/clock; only owned rows retain details.
    retained_rows: { ...input.rows, scheduled_attempts: attempts.map(row =>
      typeof row.attempt_fingerprint === "string" && attemptIds.has(row.attempt_fingerprint) ? row : {
        attempt_fingerprint: typeof row.attempt_fingerprint === "string" ? row.attempt_fingerprint : null,
        utc_timestamp: row.utc_timestamp,
      }) },
  } };
}
