import fs from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

import {
  SCHEDULED_OUTCOME_EVALUATION_RECEIPT_VERSION,
  buildScheduledOutcomeEvaluationAttemptFingerprintForSlot,
  buildScheduledOutcomeEvaluationReceipt,
  scheduledOutcomeEvaluationAttemptFromRow,
  scheduledOutcomeEvaluationReceiptFromUnknown,
  scheduledOutcomeEvaluationSlotStartedAt,
} from "@/lib/scheduled-outcome-evaluation-receipt";
import type { RecommendationOutcomeHorizon } from "@/lib/recommendation-outcome-tracker";

function completedRun() {
  return {
    run_version: "1.0" as const,
    status: "completed" as const,
    provider: "twelve_data",
    horizons: ["15m", "30m", "60m"] as RecommendationOutcomeHorizon[],
    eligible_snapshot_count: 3,
    evaluated_snapshot_count: 2,
    incomplete_snapshot_count: 1,
    missing_candle_count: 1,
    provider_error_count: 0,
    empty_candle_response_count: 1,
    provider_limit_count: 0,
    provider_budget_limit: 5,
    candle_requests_planned: 3,
    candle_requests_executed: 2,
    candle_requests_saved_by_reuse: 1,
  };
}

function decisionSnapshots() {
  return [
    {
      source_mode: "supabase",
      payload_json: {
        recommendation_publish_policy_version: "recommendation_publish_policy_v1",
        market_data_source: "twelve_data",
      },
    },
  ];
}

function receipt() {
  return buildScheduledOutcomeEvaluationReceipt({
    attemptFingerprint: "scheduled_outcome_evaluation_15m_receipt",
    marketDate: "2026-09-21",
    scheduledSlotAt: "2026-09-21T20:15:00.000Z",
    routeReceivedAt: "2026-09-21T20:15:03.000Z",
    completedAt: "2026-09-21T20:15:05.000Z",
    routeVersion: "outcome-evaluation-route-v1.0",
    selectedBatchFingerprint: "batch_abc",
    run: completedRun(),
    outcomesCreatedCount: 2,
    outcomesUpdatedCount: 0,
    outcomesSkippedEqualOrBetterCount: 1,
    persistenceStatus: "success",
    persistenceError: null,
    firstBlocker: null,
    nextRetrySuggestion: "Retry when the next eligible horizon has elapsed.",
    decisionSnapshots: decisionSnapshots(),
  });
}

function source(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

test.describe("scheduled outcome-evaluation receipts", () => {
  test("uses one stable durable identity for every delivery in a quarter-hour slot", () => {
    const first = scheduledOutcomeEvaluationSlotStartedAt(
      new Date("2026-09-21T20:15:01.000Z"),
    );
    const retry = scheduledOutcomeEvaluationSlotStartedAt(
      new Date("2026-09-21T20:29:59.999Z"),
    );
    const next = scheduledOutcomeEvaluationSlotStartedAt(
      new Date("2026-09-21T20:30:00.000Z"),
    );

    expect(first.toISOString()).toBe("2026-09-21T20:15:00.000Z");
    expect(retry.toISOString()).toBe(first.toISOString());
    expect(buildScheduledOutcomeEvaluationAttemptFingerprintForSlot(retry)).toBe(
      buildScheduledOutcomeEvaluationAttemptFingerprintForSlot(first),
    );
    expect(buildScheduledOutcomeEvaluationAttemptFingerprintForSlot(next)).not.toBe(
      buildScheduledOutcomeEvaluationAttemptFingerprintForSlot(first),
    );
  });

  test("retains coverage, provider cost and research-only disposition without a candidate or policy mutation", () => {
    const built = receipt();

    expect(built).toMatchObject({
      contract_version: SCHEDULED_OUTCOME_EVALUATION_RECEIPT_VERSION,
      status: "completed",
      disposition: "research_only",
      scope: {
        selected_batch_fingerprint: "batch_abc",
        eligible_snapshot_count: 3,
        evaluated_snapshot_count: 2,
      },
      coverage: {
        incomplete_snapshot_count: 1,
        missing_candle_count: 1,
      },
      cost: {
        provider_budget_limit: 5,
        candle_requests_planned: 3,
        candle_requests_executed: 2,
        candle_requests_saved_by_reuse: 1,
      },
      decision_lineage: {
        status: "complete",
        eligible_snapshot_count: 1,
        policy_versioned_snapshot_count: 1,
        missing_policy_version_count: 0,
        recommendation_publish_policy_versions: [
          "recommendation_publish_policy_v1",
        ],
        market_data_sources: ["twelve_data"],
        missing_market_data_source_count: 0,
      },
    });
    expect(scheduledOutcomeEvaluationReceiptFromUnknown(built)).toEqual(built);
    expect(JSON.stringify(built)).not.toContain('"recommendation":');
    expect(JSON.stringify(built)).not.toContain('"ranking":');
    expect(JSON.stringify(built)).not.toContain('"broker":');
  });

  test("rejects a receipt with a non-slot timestamp or unversioned payload", () => {
    const built = receipt();

    expect(
      scheduledOutcomeEvaluationReceiptFromUnknown({
        ...built,
        scheduled_slot_at: "2026-09-21T20:16:00.000Z",
      }),
    ).toBeNull();
    expect(
      scheduledOutcomeEvaluationReceiptFromUnknown({
        ...built,
        contract_version: "receipt_v0",
      }),
    ).toBeNull();
    expect(
      scheduledOutcomeEvaluationReceiptFromUnknown({
        ...built,
        decision_lineage: {
          ...built.decision_lineage,
          status: "complete",
          recommendation_publish_policy_versions: [],
        },
      }),
    ).toBeNull();
    expect(
      scheduledOutcomeEvaluationReceiptFromUnknown({
        ...built,
        decision_lineage: {
          ...built.decision_lineage,
          status: "incomplete",
          eligible_snapshot_count: 2,
          policy_versioned_snapshot_count: 2,
          missing_policy_version_count: 0,
          recommendation_publish_policy_versions: [
            "recommendation_publish_policy_v2",
            "recommendation_publish_policy_v1",
          ],
          missing_market_data_source_count: 1,
        },
      }),
    ).toBeNull();
  });

  test("keeps missing or mixed decision policy provenance explicit", () => {
    const incomplete = buildScheduledOutcomeEvaluationReceipt({
      attemptFingerprint: "scheduled_outcome_evaluation_incompletepolicy",
      marketDate: "2026-09-21",
      scheduledSlotAt: "2026-09-21T20:30:00.000Z",
      routeReceivedAt: "2026-09-21T20:30:03.000Z",
      completedAt: "2026-09-21T20:30:05.000Z",
      routeVersion: "outcome-evaluation-route-v1.0",
      selectedBatchFingerprint: "batch_incomplete",
      run: completedRun(),
      outcomesCreatedCount: 0,
      outcomesUpdatedCount: 0,
      outcomesSkippedEqualOrBetterCount: 0,
      persistenceStatus: "not_attempted",
      persistenceError: null,
      firstBlocker: "no_policy_lineage",
      nextRetrySuggestion: null,
      decisionSnapshots: [
        {
          source_mode: "supabase",
          payload_json: {},
        },
      ],
    });

    expect(incomplete.decision_lineage).toMatchObject({
      status: "incomplete",
      missing_policy_version_count: 1,
      missing_market_data_source_count: 1,
      recommendation_publish_policy_versions: [],
    });
  });

  test("only admits a claimed row without a receipt and a finalized row with an exact receipt", () => {
    const built = receipt();
    const base = {
      id: "00000000-0000-4000-8000-000000000001",
      contract_version: SCHEDULED_OUTCOME_EVALUATION_RECEIPT_VERSION,
      attempt_fingerprint: built.attempt_fingerprint,
      owner_user_id: "00000000-0000-4000-8000-000000000002",
      market_date: built.market_date,
      scheduled_slot_at: built.scheduled_slot_at,
      route_received_at: built.route_received_at,
      request_json: { contract_version: "scheduled_outcome_evaluation_request_v1" },
      created_at: built.route_received_at,
      updated_at: built.completed_at,
    };

    expect(
      scheduledOutcomeEvaluationAttemptFromRow({
        ...base,
        status: "claimed",
        receipt_json: {},
        finalized_at: null,
      }),
    ).toMatchObject({ status: "claimed", receipt_json: null });
    expect(
      scheduledOutcomeEvaluationAttemptFromRow({
        ...base,
        status: "completed",
        receipt_json: built,
        finalized_at: built.completed_at,
      }),
    ).toMatchObject({ status: "completed", receipt_json: built });
    expect(
      scheduledOutcomeEvaluationAttemptFromRow({
        ...base,
        status: "completed",
        receipt_json: {},
        finalized_at: built.completed_at,
      }),
    ).toBeNull();
    expect(
      scheduledOutcomeEvaluationAttemptFromRow({
        ...base,
        status: "completed",
        receipt_json: { ...built, attempt_fingerprint: "scheduled_outcome_evaluation_otherreceipt" },
        finalized_at: built.completed_at,
      }),
    ).toBeNull();
  });

  test("claims the scheduled slot before snapshot or provider work and finalizes unexpected failures", () => {
    const route = source("app/api/recommendations/evaluate-outcomes/route.ts");
    const scheduledFunction = source(
      "netlify/functions/scheduled-outcome-evaluation.ts",
    );

    expect(
      route.indexOf("const claim = await claimScheduledOutcomeEvaluationAttempt"),
    ).toBeGreaterThan(-1);
    expect(
      route.indexOf("const claim = await claimScheduledOutcomeEvaluationAttempt"),
    ).toBeLessThan(
      route.indexOf("const officialSnapshotLoad ="),
    );
    expect(route).toContain("finalizeScheduledOutcomeEvaluationReceipt");
    expect(route).toContain("Scheduled outcome evaluation failed before completion.");
    expect(scheduledFunction).toContain("scheduled_slot_at_utc: scheduledSlotAtUtc");
    expect(scheduledFunction).toContain(
      "buildScheduledOutcomeEvaluationAttemptFingerprintForSlot(scheduledSlot)",
    );
    expect(route).not.toContain("placeOrder");
    expect(route).not.toContain("executeBroker");
  });
});
