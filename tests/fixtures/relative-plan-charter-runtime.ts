import { createActiveScanTrace } from "@/lib/active-scan-trace";
import { buildObservationCycleReceipt } from "@/lib/observation-cycle-receipt";
import { scheduledScanInvocationReceiptFromAttempt } from "@/lib/scheduled-scan-invocation-receipt";
import { getNyMarketTime } from "@/lib/market-session";
import type { ScanLogEntry } from "@/lib/scan-log-core";
import { prospectiveOwner, prospectiveInput } from "./relative-plan-prospective";

/** Synthetic CLOSED fixtures built through the actual trace/receipt producers.
 * No scheduled function, provider, production database or broker is invoked. */
export function charterRuntimeRows(input: { at: string; fingerprint: string | null; failed?: boolean; owner?: string }) {
  const owner = input.owner ?? prospectiveOwner;
  const id = `synthetic_charter_attempt_${input.at.replace(/[^0-9]/g, "")}`;
  const at = Date.parse(input.at), finalizedAt = new Date(at + 10000).toISOString();
  const payload = {
    scheduled_slot_started_at_utc: new Date(Math.floor(at / 900000) * 900000).toISOString(),
    scheduled_slot_identity_source: "netlify_event_next_run",
    build_deployment_identity: { schema_version: "scheduled_scan_deployment_identity_v1",
      deploy_id: prospectiveInput.source_revision.deploy_id, deploy_context: "production",
      commit_ref: prospectiveInput.source_revision.commit_ref, site_id: "11111111-1111-4111-8111-111111111111" },
    basic_free_scheduled_scan_credit_reservation: {
      guard_version: "basic_free_scheduled_scan_credit_guard_v1", contract_version: "basic_free_discovery_credit_reservation_v1",
      scope: "normal_scheduled_scan", status: "provider_execution_allowed", provider_execution_allowed: true,
      trading_date: getNyMarketTime(input.at).ny_date, minute_bucket: new Date(Math.floor(at / 60000) * 60000).toISOString(),
      requested_credits: 8, declared_daily_credit_budget: 800, declared_per_minute_credit_budget: 8,
      daily_reserved_credits: 8, daily_remaining_credits: 792, minute_reserved_credits: 8, minute_remaining_credits: 0,
      idempotent: false, finalization_status: "finalized", finalization_proven: true, safe_blocker: null,
    },
  };
  const invocation = scheduledScanInvocationReceiptFromAttempt({ source: "netlify_scheduled_function", mode: "scheduled", payload });
  if (!invocation) throw new Error("synthetic_charter_invocation_invalid");
  const trace = createActiveScanTrace({ routeReceivedAt: input.at, scheduledFunctionFiredAtUtc: input.at, scanWindow: "unknown" });
  trace.update({ generated_at: finalizedAt, scheduled_gate_allowed: true, market_status: "open", market_session: "regular" });
  trace.updateMarketDataFetch({ attempted_tickers: 4, provider_calls_reserved_count: 8,
    quote_success_count: input.failed ? 0 : 4, quote_error_count: input.failed ? 4 : 0,
    latest_provider_error_type: input.failed ? "provider_rate_limited" : null,
    provider_credit_policy_version: "basic_free_scan_credit_guard_v1" });
  trace.updateRawCandidates({ raw_candidate_count: input.failed ? 0 : 4 });
  trace.updateRanking({ ranking_attempted: !input.failed, ranked_count: input.failed ? 0 : 4, selected_count: 0 });
  trace.updateFinal({ recommendations_created: 0, recommendations_published_count: 0, scan_run_fingerprint: input.fingerprint });
  const outcome = input.failed ? "request_failed" : "scanned";
  const cycle = buildObservationCycleReceipt({ ownerUserId: owner, attemptFingerprint: id,
    source: "netlify_scheduled_function", mode: "scheduled", outcome, allowed: true,
    routeReceivedAtUtc: input.at, scheduledFunctionFiredAtUtc: input.at,
    orchestrationDecision: "continuous_market_scan_admission_v1", skipReason: null,
    scanLog: { created_at: finalizedAt, source: "scheduled", scan_window: "continuous", market_status: "open",
      result: input.failed ? "error" : "no_high_quality_setup", recommendations_created: 0 } as ScanLogEntry,
    activeScanTrace: trace.trace, scanRunFingerprint: input.fingerprint, scheduledInvocationReceipt: invocation });
  if (!cycle) throw new Error("synthetic_charter_cycle_invalid");
  return { cycle, attempt: { attempt_fingerprint: id, created_at: input.at, utc_timestamp: input.at,
    trading_date: getNyMarketTime(input.at).ny_date, source: "netlify_scheduled_function", mode: "scheduled", outcome,
    route_received_at: input.at, scheduled_function_fired_at: input.at, intraday_scan_window: "continuous",
    scan_run_fingerprint: input.fingerprint, allowed: true, official_window: "none", payload_json: payload } };
}
