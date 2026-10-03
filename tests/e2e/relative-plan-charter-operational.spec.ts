import { expect, test } from "@playwright/test";
import { summarizeRelativePlanCharterOperational } from "@/lib/server/relative-plan-charter-operational";
import { prospectiveSource } from "../fixtures/relative-plan-prospective-source";
import { prospectiveOwner, prospectiveReceipt, prospectiveInput } from "../fixtures/relative-plan-prospective";
import type { ScannerClockPriorShadowForwardRuntimeEvidence } from "@/lib/scanner-clock-prior-shadow-forward-runtime-evidence";
import type { RelativePlanCharterRuntimeSource } from "@/lib/server/relative-plan-charter-runtime-source";

const now = new Date("2026-10-12T19:00:00.000Z"), at = "2026-10-12T17:00:00.000Z";
// Synthetic decoded-receipt unit evidence only; no provider or DB is touched.
function evidence(id: string, fingerprint: string | null, failed = false): ScannerClockPriorShadowForwardRuntimeEvidence {
  return {
    receipt: {
      receipt_version: "observation_cycle_receipt_v1", cycle_fingerprint: id, owner_user_id: prospectiveOwner,
      source_attempt_fingerprint: id, cycle_status: failed ? "failed" : "completed", disposition: failed ? "failed" : "no_trade",
      observation_policy_version: "scheduled_scan_observation_cycle_v1", receipt_generated_at: "2026-10-12T17:00:01.000Z",
      finalized_at: "2026-10-12T17:00:01.000Z", scan_run_fingerprint: fingerprint,
      trigger: { status: "received", kind: "netlify_schedule", occurred_at: at, route_received_at: at,
        scheduled_slot_started_at_utc: at, build_deployment_identity: {
          schema_version: "scheduled_scan_deployment_identity_v1", deploy_id: "b".repeat(24), deploy_context: "production",
          commit_ref: "a".repeat(40), site_id: "11111111-1111-4111-8111-111111111111" } },
      admission: { status: "admitted", policy_version: "observation_cycle_admission_v3", market_status: "open",
        market_session: "regular", reason_codes: [], policy_receipt: null },
      provider_request: { status: "attempted", attempted_tickers: 4, reserved_credits: 8, provider_credit_policy_version: "basic_free_scheduled_scan_credit_guard_v1" },
      provider_response: { status: failed ? "failed" : "observed", success_count: failed ? 0 : 4, error_count: failed ? 4 : 0,
        empty_response_count: 0, latest_error_type: failed ? "provider_rate_limited" : null },
      freshness: { status: failed ? "unknown" : "fresh", stale_count: 0, reason_codes: [] },
      discovery_evaluation: { status: failed ? "failed" : "completed", raw_candidate_count: failed ? 0 : 4,
        ranked_count: failed ? 0 : 4, selected_count: 0, built_count: 0 },
      publication: { status: failed ? "failed" : "no_trade", published_count: 0, recommendations_created: 0,
        policy_version: "synthetic_no_trade", reason_codes: [] },
      decision: { outcome: failed ? "request_failed" : "scanned", reason_codes: failed ? ["provider_rate_limited"] : [] },
      authority: { can_arm_scheduler: false, can_call_provider: false, can_change_ranking: false,
        can_publish: false, can_execute_paper: false, can_execute_broker: false },
    },
    credit_readback: {
      status: "available", source_attempt: { observed_at: at, trading_date: "2026-10-12", window: "continuous" },
      reservation: { status: "provider_execution_allowed", provider_execution_allowed: true, trading_date: "2026-10-12",
        minute_bucket: at, requested_credits: 8, declared_daily_credit_budget: 800, declared_per_minute_credit_budget: 8,
        daily_reserved_credits: 8, daily_remaining_credits: 792, minute_reserved_credits: 8, minute_remaining_credits: 0,
        idempotent: false, finalization_status: "finalized", finalization_proven: true, safe_blocker: null }, reason_codes: [],
    },
  };
}
async function input() {
  const source = await prospectiveSource(); source.scanRuns[0].status = "completed";
  const fingerprint = source.scanRuns[0].run_fingerprint;
  const rows = [evidence("synthetic_completed_attempt_001", fingerprint), evidence("synthetic_failed_attempt_002", null, true)];
  const runtime: RelativePlanCharterRuntimeSource = { status: "available", blocker: null, partitions: [{
    partition: "held_out", status: "available", evidence: rows, observation_cycle_count: 2, scheduled_attempt_count: 2,
    unattributed_attempt_count: 0, original_window: prospectiveInput.windows.held_out, read_as_of: now.toISOString(),
  }] };
  return { owner: prospectiveOwner, freeze: prospectiveReceipt(), partition: "held_out" as const, source,
    runtime, enrolledFingerprints: [fingerprint], now };
}

test("failed admitted attempts and their credits remain in the original operational denominator", async () => {
  const value = await input(), result = summarizeRelativePlanCharterOperational(value);
  expect(result.reliability).toMatchObject({ admitted_attempt_count: 2, completed_attempt_count: 1,
    terminal_failure_count: 1, linked_enrolled_decision_count: 1, value: { value: 0.5, denominator: 2 },
    failure_classes: { rate_limit: 1 } });
  expect(result.cost).toMatchObject({ admitted_attempt_denominator: 2, exact_finalized_credit_receipt_count: 2,
    reserved_provider_credits: 16, credits_per_decision: 8 });
  expect(result.blockers).toEqual([]);
});

test("missing finalization or inconsistent reserved credits cannot become zero-cost evidence", async () => {
  for (const mode of ["missing", "conflicting"] as const) {
    const value = await input();
    if (value.runtime.status !== "available") throw new Error("fixture source unavailable");
    const row = value.runtime.partitions[0].evidence[1];
    if (mode === "missing") row.credit_readback.reservation.finalization_proven = false;
    else row.credit_readback.reservation.requested_credits = 7;
    const result = summarizeRelativePlanCharterOperational(value);
    expect(result.cost?.reserved_provider_credits).toBeNull();
    expect(result.cost?.credits_per_decision).toBeNull();
    expect(result.reliability?.value?.value).toBe(0.5);
    expect(result.reliability?.terminal_failure_count).toBe(1);
    expect(result.blockers).toContain("relative_plan_operational_exact_finalized_credit_evidence_incomplete");
  }
});

test("unattributed attempts or missing original completed decisions prevent qualified reliability", async () => {
  for (const mode of ["unattributed", "lineage"] as const) {
    const value = await input();
    if (value.runtime.status !== "available") throw new Error("fixture source unavailable");
    if (mode === "unattributed") value.runtime.partitions[0].unattributed_attempt_count = 1;
    else value.source.scanRuns = [];
    const result = summarizeRelativePlanCharterOperational(value);
    expect(result.reliability?.value).toBeNull();
    expect(result.cost?.credits_per_decision).toBeNull();
    expect(result.blockers.length).toBeGreaterThan(0);
  }
});

test("a wrong owner, revision, window or as-of clock cannot qualify original operational evidence", async () => {
  for (const mode of ["owner", "revision", "window", "as_of"] as const) {
    const value = await input();
    if (value.runtime.status !== "available") throw new Error("fixture source unavailable");
    const partition = value.runtime.partitions[0];
    if (mode === "owner") value.owner = "99999999-9999-4999-8999-999999999999";
    else if (mode === "revision") Object.assign(partition.evidence[0].receipt.trigger.build_deployment_identity!, { commit_ref: "c".repeat(40) });
    else if (mode === "window") partition.original_window = prospectiveInput.windows.walk_forward;
    else partition.read_as_of = "2026-10-12T20:00:00.000Z";
    const result = summarizeRelativePlanCharterOperational(value);
    expect(result.reliability?.value ?? null).toBeNull();
    expect(result.blockers.length).toBeGreaterThan(0);
  }
});
