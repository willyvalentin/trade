import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  createActiveScanTrace,
  SCAN_PROVIDER_CANDIDATE_OBSERVATION_VERSION,
  summarizeScanProviderCandidateObservations,
  type ScanProviderCandidateObservation,
} from "../../lib/active-scan-trace";
import { buildObservationCycleAdmission } from "../../lib/observation-cycle-admission-policy";
import {
  buildObservationCycleReadback,
  buildObservationCycleReceipt,
  observationCyclePreRunFailuresFromUnknown,
  observationCycleReadbackFromUnknown,
  observationCycleReceiptFromUnknown,
} from "../../lib/observation-cycle-receipt";
import { resolveScheduledScanProviderCreditBudget } from "../../lib/scheduled-scan-ticker-cap";
import { scheduledScanInvocationReceiptFromAttempt } from "../../lib/scheduled-scan-invocation-receipt";
import { buildScannerProviderCreditAllocationShadow } from "../../lib/scanner-provider-credit-allocation-shadow";
import { buildScannerProviderCreditAllocationRuntimeAdmission } from "../../lib/scanner-provider-credit-allocation-runtime-admission";
import { SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_CONTRACT } from "../../lib/scanner-provider-credit-allocation-live-experiment";
import {
  buildScannerProviderCreditAllocationExecutionPlan,
} from "../../lib/scanner-provider-credit-allocation-plan";
import { buildScannerProviderCreditAllocationReconciliation } from "../../lib/scanner-provider-credit-allocation-reconciliation";
import type { ScanLogEntry } from "../../lib/scan-log-core";

const ownerUserId = "11111111-1111-4111-8111-111111111111";
const attemptFingerprint = "scheduled_scan_attempt_receipt_001";
const routeReceivedAtUtc = "2026-09-25T16:15:04.000Z";

function buildReceipt({
  outcome = "route_received",
  allowed = true,
  mode = "scheduled",
  scanRunFingerprint = null,
  scanLog = null,
  configure,
}: {
  outcome?: "route_received" | "skipped" | "failed" | "scanned";
  allowed?: boolean;
  mode?: "scheduled" | "manual" | "diagnostic";
  scanRunFingerprint?: string | null;
  scanLog?: ScanLogEntry | null;
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
  const scheduledInvocationReceipt =
    mode === "scheduled"
      ? scheduledScanInvocationReceiptFromAttempt({
          source: "netlify_scheduled_function",
          mode: "scheduled",
          payload: {
            scheduled_slot_started_at_utc: "2026-09-25T16:15:00.000Z",
            scheduled_slot_identity_source: "netlify_event_next_run",
            build_deployment_identity: {
              schema_version: "scheduled_scan_deployment_identity_v1",
              deploy_id: "6ab68ce0a6abfb5a4ca86657",
              deploy_context: "production",
              commit_ref: "a".repeat(40),
              site_id: "2b582e03-ac97-4371-8051-558d9980fb94",
            },
          },
        })
      : null;

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
    scanLog,
    activeScanTrace: recorder.trace,
    scanRunFingerprint,
    scheduledInvocationReceipt,
    observationAdmission,
  });
}

test.describe("SV-A.2 observation-cycle receipts", () => {
  test("retains the whole confirmed scan reservation, not just its scanner subset", () => {
    const summary = {
      guard_version: "basic_free_scheduled_scan_credit_guard_v1",
      contract_version: "basic_free_discovery_credit_reservation_v1",
      scope: "normal_scheduled_scan",
      status: "provider_execution_allowed",
      provider_execution_allowed: true,
      trading_date: "2026-09-25",
      minute_bucket: "2026-09-25T16:15:00.000Z",
      requested_credits: 8,
      declared_daily_credit_budget: 800,
      declared_per_minute_credit_budget: 8,
      daily_reserved_credits: 8,
      daily_remaining_credits: 792,
      minute_reserved_credits: 8,
      minute_remaining_credits: 0,
      idempotent: false,
      finalization_status: "finalized",
      finalization_proven: true,
      safe_blocker: null,
    };
    const receipt = (reservation: unknown = summary, scannerCredits = 6) =>
      buildReceipt({
        outcome: "scanned",
        scanLog: {
          basic_free_scheduled_scan_credit_reservation: reservation,
        } as ScanLogEntry,
        configure(recorder) {
          recorder.updateMarketDataFetch({
            attempted_tickers: 8,
            provider_calls_reserved_count: scannerCredits,
          });
        },
      });
    // Six acquisition credits plus two separately reserved benchmarks are
    // still one eight-credit scan. Reuse can allocate all eight to acquisition.
    for (const scannerCredits of [6, 8]) {
      const record = receipt(summary, scannerCredits);
      expect(record?.receipt_json.provider_request.reserved_credits).toBe(8);
      expect(observationCycleReceiptFromUnknown(record?.receipt_json)).not.toBeNull();
    }
    // A confirmed reservation is not a provider-success or outcome assertion.
    expect(receipt()?.receipt_json.provider_response.status).toBe("failed");
    for (const reservation of [
      null,
      { ...summary, guard_version: "unknown" },
      { ...summary, requested_credits: 99 },
      { ...summary, trading_date: "2026-09-24" },
      { ...summary, status: "per_minute_credit_limit_reached", provider_execution_allowed: false,
        finalization_status: "not_started", finalization_proven: null, safe_blocker: "per_minute_credit_limit_reached" },
    ]) expect(receipt(reservation)?.receipt_json.provider_request.reserved_credits).toBe(6);
    // Never hide a contradictory larger observed scanner allocation.
    expect(receipt(summary, 9)?.receipt_json.provider_request.reserved_credits).toBe(9);
  });

  test("records an active route receipt with inert authority", () => {
    const record = buildReceipt();

    expect(record).not.toBeNull();
    expect(record?.cycle_status).toBe("active");
    expect(record?.disposition).toBe("pending");
    expect(record?.receipt_json.provider_request.status).toBe("unknown");
    expect(record?.receipt_json.admission.policy_receipt).toMatchObject({
      policy_version: "observation_cycle_admission_v3",
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

  test("round-trips runtime allocation admission and rejects nested tampering", () => {
    const admission = buildScannerProviderCreditAllocationRuntimeAdmission({
      enabled: false,
      experimentId: null,
      scheduledInvocationBound: true,
      scheduledSlotUtc: "2026-09-25T16:15:00.000Z",
      now: new Date(routeReceivedAtUtc),
      expectedRevision: null,
      deployedRevision: "a".repeat(40),
    });
    const record = buildReceipt({
      configure(recorder) {
        recorder.updateMarketDataFetch({
          provider_credit_allocation_runtime_admission: admission,
        });
      },
    });

    expect(
      record?.receipt_json.provider_credit_allocation_runtime_admission,
    ).toEqual(admission);
    expect(observationCycleReceiptFromUnknown(record?.receipt_json)).not.toBeNull();

    const altered = structuredClone(record?.receipt_json);
    if (altered?.provider_credit_allocation_runtime_admission) {
      const alteredAdmission =
        altered.provider_credit_allocation_runtime_admission as unknown as Record<
          string,
          unknown
        >;
      alteredAdmission.admission_fingerprint = "0".repeat(64);
    }
    expect(observationCycleReceiptFromUnknown(altered)).toBeNull();
  });

  test("round-trips an exact execution plan and plan-to-actual reconciliation", () => {
    const revision = "a".repeat(40);
    const admittedAt = "2026-10-01T14:45:04.000Z";
    const admission = buildScannerProviderCreditAllocationRuntimeAdmission({
      enabled: true,
      experimentId:
        SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_CONTRACT.experiment_id,
      scheduledInvocationBound: true,
      scheduledSlotUtc: "2026-10-01T14:45:00.000Z",
      now: new Date(admittedAt),
      expectedRevision: revision,
      deployedRevision: revision,
    });
    expect(admission.status).toBe("admitted");
    const plan = buildScannerProviderCreditAllocationExecutionPlan({
      policyVersion: admission.selected_policy_version,
      providerCreditCap: 2,
      intradayProviderCreditCap: 1,
      candidateDemands: [
        {
          ticker: "NVO",
          ticker_index: 0,
          daily_refresh_required: true,
          intraday_refresh_required: true,
        },
        {
          ticker: "SLB",
          ticker_index: 1,
          daily_refresh_required: true,
          intraday_refresh_required: true,
        },
      ],
    });
    const reconciliation =
      buildScannerProviderCreditAllocationReconciliation({
        plan,
        actualAllocations: plan.allocations,
        admissionFingerprint: admission.admission_fingerprint,
      });
    const record = buildReceipt({
      configure(recorder) {
        recorder.updateMarketDataFetch({
          provider_credit_allocation_runtime_admission: admission,
          provider_credit_allocation_execution_plan: plan,
          provider_credit_allocation_reconciliation: reconciliation,
        });
      },
    });

    expect(record?.receipt_json.provider_credit_allocation_execution_plan).toEqual(
      plan,
    );
    expect(record?.receipt_json.provider_credit_allocation_reconciliation).toEqual(
      reconciliation,
    );
    expect(observationCycleReceiptFromUnknown(record?.receipt_json)).not.toBeNull();

    const altered = structuredClone(record?.receipt_json);
    if (altered?.provider_credit_allocation_reconciliation) {
      const nested = altered.provider_credit_allocation_reconciliation as unknown as Record<
        string,
        unknown
      >;
      nested.actual_reserved_credits = 99;
    }
    expect(observationCycleReceiptFromUnknown(altered)).toBeNull();

    const wrongAdmission = structuredClone(record?.receipt_json);
    if (wrongAdmission?.provider_credit_allocation_runtime_admission) {
      const nestedAdmission =
        wrongAdmission.provider_credit_allocation_runtime_admission as unknown as Record<
          string,
          unknown
        >;
      nestedAdmission.admission_fingerprint = "b".repeat(64);
    }
    expect(observationCycleReceiptFromUnknown(wrongAdmission)).toBeNull();
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
      scanLog: {
        created_at: "2026-09-25T16:15:08.000Z",
        source: "scheduled",
        scan_window: "continuous",
        market_status: "open",
        result: "no_high_quality_setup",
        message: "fixture",
        recommendations_created: 0,
        publishable_threshold: 60,
        scanner_candidate_ranking: {
          selected_count: 1,
          results: [
            {
              ticker: "NVO",
              rank: 1,
              selected: true,
              score: { normalized_score: 77, tier: "valid" },
            },
          ],
          selection: { selected_tickers: ["NVO"] },
        },
        selected_candidate_build_diagnostics: [
          {
            ticker: "NVO",
            score: 59,
            built: false,
            rejection_reason: "below_publish_threshold",
          },
        ],
      } as unknown as ScanLogEntry,
      configure(recorder) {
        const candidateObservations: ScanProviderCandidateObservation[] = [
          "NVO",
          "SLB",
          "GS",
          "RDDT",
        ].map((ticker, tickerIndex) => ({
          observation_version: SCAN_PROVIDER_CANDIDATE_OBSERVATION_VERSION,
          ticker,
          ticker_index: tickerIndex,
          status: "rankable",
          daily_data_source: "provider",
          intraday_data_source: "not_observed",
          provider_credits_reserved: 1,
          reason_codes: [],
        }));
        recorder.updateMarketDataFetch({
          attempted_tickers: 4,
          provider_calls_reserved_count: 4,
          daily_candle_provider_calls_reserved_count: 4,
          quote_success_count: 4,
          provider_credit_policy_version: "basic_free_scan_credit_guard_v1",
          candidate_observations: candidateObservations,
          candidate_observation_summary:
            summarizeScanProviderCandidateObservations(candidateObservations),
          provider_credit_allocation_shadow:
            buildScannerProviderCreditAllocationShadow({
              candidateObservations,
              providerCreditCap: 4,
              terminal: true,
            }),
        });
        recorder.updateRawCandidates({ raw_candidate_count: 4 });
        recorder.updateRanking({
          ranking_attempted: true,
          ranked_count: 4,
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
    expect(record?.receipt_json.provider_candidate_coverage).toMatchObject({
      status: "observed",
      daily_provider_credits_reserved: 4,
      summary: {
        expected_candidate_count: 4,
        rankable_candidate_count: 4,
      },
    });
    expect(record?.receipt_json.provider_credit_allocation_shadow).toMatchObject({
      status: "observed",
      baseline: { candidates_receiving_credit: 4 },
      challenger: { candidates_receiving_credit: 4 },
      comparison: {
        signal: "no_projected_improvement",
        recommendation_quality: "unproven",
      },
    });
    expect(record?.receipt_json.score_gate_alignment).toMatchObject({
      status: "observed",
      publishable_threshold: 60,
      counts: {
        selected: 1,
        ranking_qualified_local_block: 1,
      },
      candidates: [
        {
          ticker: "NVO",
          ranking_score: 77,
          local_score: 59,
          alignment: "ranking_qualified_local_block",
        },
      ],
    });
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
        scheduled_slot_at:
          preRunFailure?.receipt_json.trigger.scheduled_slot_started_at_utc,
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
