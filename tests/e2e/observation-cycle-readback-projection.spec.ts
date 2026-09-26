import { expect, test } from "@playwright/test";

import {
  buildObservationCycleScanReadbackSelection,
  OBSERVATION_CYCLE_SCAN_READBACK_PROJECTION_VERSION,
} from "../../lib/observation-cycle-readback-projection";
import type {
  ObservationCycleDisposition,
  ObservationCycleReadback,
  ObservationCycleReceipt,
  ObservationCycleStatus,
} from "../../lib/observation-cycle-receipt";

function receipt(input: {
  fingerprint: string;
  occurredAt: string;
  status: ObservationCycleStatus;
  disposition: ObservationCycleDisposition;
  triggerKind?: ObservationCycleReceipt["trigger"]["kind"];
  publishedCount?: number;
  reasonCodes?: string[];
  finalizedAt?: string | null;
  scheduledSlotAt?: string | null;
}): ObservationCycleReceipt {
  const finalizedAt =
    input.finalizedAt === undefined ? input.occurredAt : input.finalizedAt;
  const publishedCount = input.publishedCount ?? 0;
  const noTrade = input.disposition === "no_trade";
  const published = input.disposition === "published";

  return {
    receipt_version: "observation_cycle_receipt_v1",
    cycle_fingerprint: input.fingerprint,
    owner_user_id: "11111111-1111-4111-8111-111111111111",
    source_attempt_fingerprint: input.fingerprint,
    cycle_status: input.status,
    disposition: input.disposition,
    observation_policy_version: "scheduled_scan_observation_cycle_v1",
    receipt_generated_at: finalizedAt ?? input.occurredAt,
    finalized_at: finalizedAt,
    scan_run_fingerprint:
      noTrade || published ? `scan_run_${input.fingerprint}` : null,
    trigger: {
      status: "received",
      kind: input.triggerKind ?? "netlify_schedule",
      occurred_at: input.occurredAt,
      route_received_at: input.occurredAt,
      scheduled_slot_started_at_utc:
        input.scheduledSlotAt === undefined
          ? input.occurredAt
          : input.scheduledSlotAt,
      build_deployment_identity: null,
    },
    admission: {
      status: input.status === "rejected" ? "rejected" : "admitted",
      policy_version: "observation_cycle_admission_v2",
      market_status: "open",
      market_session: "regular",
      reason_codes: [],
      policy_receipt: null,
    },
    provider_request: {
      status: noTrade || published ? "attempted" : "not_attempted",
      attempted_tickers: noTrade || published ? 4 : 0,
      reserved_credits: noTrade || published ? 4 : 0,
      provider_credit_policy_version:
        noTrade || published ? "basic_free_scan_credit_guard_v1" : null,
    },
    provider_response: {
      status: noTrade || published ? "observed" : "not_observed",
      success_count: noTrade || published ? 4 : 0,
      error_count: 0,
      empty_response_count: 0,
      latest_error_type: null,
    },
    freshness: {
      status: noTrade || published ? "fresh" : "not_evaluated",
      stale_count: 0,
      reason_codes: [],
    },
    discovery_evaluation: {
      status: noTrade || published ? "completed" : "not_attempted",
      raw_candidate_count: noTrade || published ? 2 : 0,
      ranked_count: noTrade || published ? 2 : 0,
      selected_count: noTrade || published ? 1 : 0,
      built_count: published ? publishedCount : 0,
    },
    publication: {
      status: published
        ? "published"
        : noTrade
          ? "no_trade"
          : "not_attempted",
      published_count: publishedCount,
      recommendations_created: publishedCount,
      policy_version: published || noTrade ? "selective_publication_v1" : null,
      reason_codes: input.reasonCodes ?? [],
    },
    decision: {
      outcome:
        input.status === "active"
          ? "route_received"
          : published || noTrade
            ? "scanned"
            : "skipped",
      reason_codes: input.reasonCodes ?? [],
    },
    authority: {
      can_arm_scheduler: false,
      can_call_provider: false,
      can_change_ranking: false,
      can_publish: false,
      can_execute_paper: false,
      can_execute_broker: false,
    },
  };
}

function readback(
  receipts: ObservationCycleReceipt[],
  status: ObservationCycleReadback["status"] = "available",
): ObservationCycleReadback {
  return {
    readback_version: "observation_cycle_readback_v1",
    status,
    receipts,
    invalid_row_count: status === "partial" ? 1 : 0,
    reason_codes:
      status === "partial" ? ["observation_cycle_receipt_invalid"] : [],
  };
}

test.describe("observation-cycle scan readback projection", () => {
  test("keeps a truthful no-trade as the latest completed evaluation while a later no-request remains the latest attempt", () => {
    const noTrade = receipt({
      fingerprint: "cycle_no_trade_001",
      occurredAt: "2026-09-25T14:45:00.000Z",
      status: "completed",
      disposition: "no_trade",
      reasonCodes: ["below_publish_threshold"],
    });
    const noRequest = receipt({
      fingerprint: "cycle_no_request_002",
      occurredAt: "2026-09-25T15:00:00.000Z",
      status: "rejected",
      disposition: "no_request",
      reasonCodes: ["cadence_not_due"],
    });
    const laterManualDiagnostic = receipt({
      fingerprint: "cycle_manual_003",
      occurredAt: "2026-09-25T15:15:00.000Z",
      status: "failed",
      disposition: "failed",
      triggerKind: "manual_diagnostic",
      reasonCodes: ["diagnostic_only"],
    });

    const projection = buildObservationCycleScanReadbackSelection({
      readback: readback(
        [noTrade, laterManualDiagnostic, noRequest],
        "partial",
      ),
      tradingDate: "2026-09-25",
    });

    expect(projection).toMatchObject({
      projection_version:
        OBSERVATION_CYCLE_SCAN_READBACK_PROJECTION_VERSION,
      source_status: "partial",
      eligible_cycle_count: 2,
      latest_attempted_cycle: {
        cycle_fingerprint: "cycle_no_request_002",
        result: "no_request",
        visible_recommendation_count: 0,
        message: "cadence_not_due",
      },
      latest_completed_evaluation: {
        cycle_fingerprint: "cycle_no_trade_001",
        result: "no_trade",
        visible_recommendation_count: 0,
        message: "below_publish_threshold",
        source: "observation_cycle_receipts",
      },
    });
  });

  test("maps a published cycle to the legacy-compatible recommendation-created result", () => {
    const projection = buildObservationCycleScanReadbackSelection({
      readback: readback([
        receipt({
          fingerprint: "cycle_published_001",
          occurredAt: "2026-09-25T16:30:00.000Z",
          status: "completed",
          disposition: "published",
          publishedCount: 2,
        }),
      ]),
      tradingDate: "2026-09-25",
    });

    expect(projection.latest_attempted_cycle).toMatchObject({
      result: "recommendation_created",
      visible_recommendation_count: 2,
      publication_status: "published",
    });
    expect(projection.latest_completed_evaluation).toEqual(
      projection.latest_attempted_cycle,
    );
  });

  test("uses New York trading date at the UTC boundary and excludes other dates", () => {
    const projection = buildObservationCycleScanReadbackSelection({
      readback: readback([
        receipt({
          fingerprint: "cycle_ny_boundary_001",
          occurredAt: "2026-09-26T01:00:00.000Z",
          status: "active",
          disposition: "pending",
          finalizedAt: null,
        }),
        receipt({
          fingerprint: "cycle_next_day_002",
          occurredAt: "2026-09-26T14:45:00.000Z",
          status: "active",
          disposition: "pending",
          finalizedAt: null,
        }),
      ]),
      tradingDate: "2026-09-25",
    });

    expect(projection.eligible_cycle_count).toBe(1);
    expect(projection.latest_attempted_cycle).toMatchObject({
      cycle_fingerprint: "cycle_ny_boundary_001",
      result: "pending",
      created_at: "2026-09-26T01:00:00.000Z",
    });
    expect(projection.latest_completed_evaluation).toBeNull();
  });

  test("orders attempts by their attributable slot instead of a late finalization", () => {
    const olderLateReceipt = receipt({
      fingerprint: "cycle_older_late_001",
      occurredAt: "2026-09-25T14:45:00.000Z",
      status: "completed",
      disposition: "no_trade",
      finalizedAt: "2026-09-25T15:10:00.000Z",
    });
    const newerAttempt = receipt({
      fingerprint: "cycle_newer_attempt_002",
      occurredAt: "2026-09-25T15:00:00.000Z",
      status: "rejected",
      disposition: "no_request",
      finalizedAt: "2026-09-25T15:00:04.000Z",
    });

    const projection = buildObservationCycleScanReadbackSelection({
      readback: readback([olderLateReceipt, newerAttempt]),
      tradingDate: "2026-09-25",
    });

    expect(projection.latest_attempted_cycle).toMatchObject({
      cycle_fingerprint: "cycle_newer_attempt_002",
      created_at: "2026-09-25T15:00:00.000Z",
      finalized_at: "2026-09-25T15:00:04.000Z",
    });
    expect(projection.latest_completed_evaluation).toMatchObject({
      cycle_fingerprint: "cycle_older_late_001",
      created_at: "2026-09-25T14:45:00.000Z",
      finalized_at: "2026-09-25T15:10:00.000Z",
    });
  });

  test("uses the scheduled slot for trading-date attribution when delivery crosses midnight", () => {
    const projection = buildObservationCycleScanReadbackSelection({
      readback: readback([
        receipt({
          fingerprint: "cycle_delayed_delivery_001",
          occurredAt: "2026-09-26T04:01:00.000Z",
          scheduledSlotAt: "2026-09-26T03:45:00.000Z",
          status: "rejected",
          disposition: "no_request",
          finalizedAt: "2026-09-26T04:01:02.000Z",
        }),
      ]),
      tradingDate: "2026-09-25",
    });

    expect(projection.latest_attempted_cycle).toMatchObject({
      cycle_fingerprint: "cycle_delayed_delivery_001",
      created_at: "2026-09-26T03:45:00.000Z",
    });
  });

  test("returns no projection for unavailable readback or an invalid trading date", () => {
    const available = readback([
      receipt({
        fingerprint: "cycle_ignored_001",
        occurredAt: "2026-09-25T16:30:00.000Z",
        status: "completed",
        disposition: "no_trade",
      }),
    ]);

    expect(
      buildObservationCycleScanReadbackSelection({
        readback: { ...available, status: "unavailable", receipts: [] },
        tradingDate: "2026-09-25",
      }),
    ).toMatchObject({
      source_status: "unavailable",
      latest_attempted_cycle: null,
      latest_completed_evaluation: null,
      eligible_cycle_count: 0,
    });
    expect(
      buildObservationCycleScanReadbackSelection({
        readback: available,
        tradingDate: "not-a-date",
      }).eligible_cycle_count,
    ).toBe(0);
  });
});
