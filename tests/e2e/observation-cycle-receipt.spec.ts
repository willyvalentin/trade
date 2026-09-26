import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { createActiveScanTrace } from "../../lib/active-scan-trace";
import { buildObservationCycleAdmission } from "../../lib/observation-cycle-admission-policy";
import {
  buildObservationCycleReadback,
  buildObservationCycleReceipt,
  observationCyclePreRunFailuresFromUnknown,
  observationCycleReadbackFromUnknown,
  observationCycleReceiptFromUnknown,
} from "../../lib/observation-cycle-receipt";
import { resolveScheduledScanProviderCreditBudget } from "../../lib/scheduled-scan-ticker-cap";

const ownerUserId = "11111111-1111-4111-8111-111111111111";
const attemptFingerprint = "scheduled_scan_attempt_receipt_001";
const routeReceivedAtUtc = "2026-09-25T16:15:04.000Z";

function buildReceipt({
  outcome = "route_received",
  allowed = true,
  mode = "scheduled",
  scanRunFingerprint = null,
  configure,
}: {
  outcome?: "route_received" | "skipped" | "failed" | "scanned";
  allowed?: boolean;
  mode?: "scheduled" | "manual" | "diagnostic";
  scanRunFingerprint?: string | null;
  configure?: (
    recorder: ReturnType<typeof createActiveScanTrace>,
  ) => void;
} = {}) {
  const recorder = createActiveScanTrace({
    routeReceivedAt: routeReceivedAtUtc,
    scheduledFunctionFiredAtUtc: "2026-09-25T16:15:00.000Z",
    scanWindow: "midday",
  });
  recorder.update({
    scheduled_gate_allowed: allowed,
    scheduled_gate_policy_version: "continuous_market_scan_admission_v1",
    market_status: "open",
    market_session: "regular",
  });
  configure?.(recorder);
  const observationAdmission = buildObservationCycleAdmission({
    now: new Date(routeReceivedAtUtc),
    sessionVerifiedOpen: allowed,
    recentScanRuns: [],
    recentPreRunFailures: [],
    providerBudget: resolveScheduledScanProviderCreditBudget({
      planMode: "free",
    }),
  });

  return buildObservationCycleReceipt({
    ownerUserId,
    attemptFingerprint,
    source:
      mode === "scheduled" ? "netlify_scheduled_function" : "manual_route",
    mode,
    outcome,
    allowed,
    routeReceivedAtUtc,
    scheduledFunctionFiredAtUtc: "2026-09-25T16:15:00.000Z",
    orchestrationDecision: "continuous_market_scan_admission_v1",
    skipReason: outcome === "skipped" ? "market_closed" : null,
    scanLog: null,
    activeScanTrace: recorder.trace,
    scanRunFingerprint,
    scheduledInvocationReceipt: null,
    observationAdmission,
  });
}

test.describe("SV-A.2 observation-cycle receipts", () => {
  test("records an active route receipt with inert authority", () => {
    const record = buildReceipt();

    expect(record).not.toBeNull();
    expect(record?.cycle_status).toBe("active");
    expect(record?.disposition).toBe("pending");
    expect(record?.receipt_json.provider_request.status).toBe("unknown");
    expect(record?.receipt_json.admission.policy_receipt).toMatchObject({
      policy_version: "observation_cycle_admission_v2",
      decision: "request_current_data",
      request_current_data: true,
    });
    expect(record?.receipt_json.authority).toEqual({
      can_arm_scheduler: false,
      can_call_provider: false,
      can_change_ranking: false,
      can_publish: false,
      can_execute_paper: false,
      can_execute_broker: false,
    });
  });

  test("distinguishes rejected admission from a provider request", () => {
    const record = buildReceipt({ outcome: "skipped", allowed: false });

    expect(record?.cycle_status).toBe("rejected");
    expect(record?.disposition).toBe("no_request");
    expect(record?.receipt_json.admission.status).toBe("rejected");
    expect(record?.receipt_json.provider_request.status).toBe("not_attempted");
    expect(record?.receipt_json.publication.status).toBe("not_attempted");
  });

  test("records a truthful no-trade after observed data and ranking", () => {
    const record = buildReceipt({
      outcome: "scanned",
      configure(recorder) {
        recorder.updateMarketDataFetch({
          attempted_tickers: 4,
          provider_calls_reserved_count: 4,
          quote_success_count: 4,
          provider_credit_policy_version: "basic_free_scan_credit_guard_v1",
        });
        recorder.updateRawCandidates({ raw_candidate_count: 2 });
        recorder.updateRanking({
          ranking_attempted: true,
          ranked_count: 2,
          selected_count: 1,
        });
        recorder.updateFinal({
          recommendations_created: 0,
          recommendations_published_count: 0,
          no_publish_reason: "below_publish_threshold",
          scan_run_fingerprint: "scan_run_receipt_001",
        });
      },
    });

    expect(record?.cycle_status).toBe("completed");
    expect(record?.disposition).toBe("no_trade");
    expect(record?.receipt_json.provider_response.status).toBe("observed");
    expect(record?.receipt_json.freshness.status).toBe("fresh");
    expect(record?.receipt_json.discovery_evaluation.status).toBe("completed");
    expect(record?.receipt_json.publication.status).toBe("no_trade");
    expect(record?.receipt_json.publication.reason_codes).toContain(
      "below_publish_threshold",
    );
  });

  test("rejects authority escalation and detects corrupted persistence rows", () => {
    const record = buildReceipt({ outcome: "skipped", allowed: false });
    expect(record).not.toBeNull();
    if (!record) return;

    const escalated = structuredClone(record.receipt_json);
    const escalatedAuthority = escalated.authority as Record<string, boolean>;
    escalatedAuthority.can_publish = true;
    expect(observationCycleReceiptFromUnknown(escalated)).toBeNull();

    const nestedEscalation = structuredClone(record.receipt_json);
    if (nestedEscalation.admission.policy_receipt) {
      const nestedAuthority = nestedEscalation.admission.policy_receipt
        .authority as Record<string, boolean>;
      nestedAuthority.calls_provider = true;
    }
    expect(observationCycleReceiptFromUnknown(nestedEscalation)).toBeNull();

    const validRow = { ...record };
    const corruptedRow = { ...record, cycle_status: "completed" };
    const readback = buildObservationCycleReadback([validRow, corruptedRow]);
    expect(readback.status).toBe("partial");
    expect(readback.receipts).toHaveLength(1);
    expect(readback.invalid_row_count).toBe(1);
  });

  test("fails closed when browser readback contains a malformed receipt", () => {
    const parsed = observationCycleReadbackFromUnknown({
      readback_version: "observation_cycle_readback_v1",
      status: "available",
      receipts: [{ receipt_version: "wrong" }],
      invalid_row_count: 0,
      reason_codes: [],
    });

    expect(parsed.status).toBe("unavailable");
    expect(parsed.receipts).toEqual([]);
    expect(parsed.reason_codes).toContain("observation_cycle_readback_invalid");
  });

  test("extracts only owner-validated terminal pre-run failures for policy backoff", () => {
    const preRunFailure = buildReceipt({ outcome: "failed" });
    const linkedFailure = buildReceipt({
      outcome: "failed",
      scanRunFingerprint: "scan_run_linked_failure_001",
    });
    const manualFailure = buildReceipt({
      outcome: "failed",
      mode: "diagnostic",
    });

    expect(
      observationCyclePreRunFailuresFromUnknown([
        preRunFailure?.receipt_json,
        linkedFailure?.receipt_json,
        manualFailure?.receipt_json,
      ]),
    ).toEqual([
      {
        cycle_fingerprint: attemptFingerprint,
        finalized_at: preRunFailure?.receipt_json.finalized_at,
      },
    ]);
    expect(observationCyclePreRunFailuresFromUnknown([{}])).toBeNull();
  });

  test("is wired to the normal scan attempt, owner-bound dashboard and diagnostics", () => {
    const root = resolve(__dirname, "../..");
    const route = readFileSync(
      resolve(root, "app/api/automation/run-scan/route.ts"),
      "utf8",
    );
    const dashboard = readFileSync(
      resolve(root, "lib/server/application-data-access.ts"),
      "utf8",
    );
    const diagnostics = readFileSync(
      resolve(root, "lib/market-diagnostics-console.ts"),
      "utf8",
    );
    const tradeApp = readFileSync(resolve(root, "app/trade-app.tsx"), "utf8");

    expect(route).toContain("buildObservationCycleReceipt({");
    expect(route).toContain('.from("observation_cycle_receipts")');
    expect(route).toContain(
      'onConflict: "owner_user_id,cycle_fingerprint"',
    );
    expect(route).toContain("ownerUserId,");
    expect(dashboard).toContain('.eq("owner_user_id", owner)');
    expect(dashboard).toContain("buildObservationCycleReadback(");
    expect(diagnostics).toContain(
      'section_id: "observation_cycle_receipt"',
    );
    expect(diagnostics).toContain('"Cadence anchor"');
    expect(diagnostics).toContain("observation_cadence_anchor_source");
    expect(tradeApp).toContain("buildObservationCycleScanReadbackSelection({");
    expect(tradeApp).toContain("latestCompletedObservationCycleReadback");
    expect(tradeApp).toContain("legacyLatestSuccessfulReadbackScan");
  });
});
