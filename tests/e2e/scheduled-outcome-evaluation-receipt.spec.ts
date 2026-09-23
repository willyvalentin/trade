import fs from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";
import {
  default as scheduledOutcomeHandler,
  outcomeOneShotAdmission,
  outcomeOneShotControlFromEnvironment,
} from "../../netlify/functions/scheduled-outcome-evaluation";
import {
  parseScheduledScanBuildDeploymentIdentity,
} from "../../netlify/functions/scheduled-scan";

import {
  SCHEDULED_OUTCOME_EVALUATION_RECEIPT_VERSION,
  SCHEDULED_OUTCOME_EVALUATION_SOURCE_PROVENANCE_VERSION,
  buildScheduledOutcomeEvaluationAttemptFingerprintForSlot,
  buildScheduledOutcomeEvaluationReceipt,
  scheduledOutcomeEvaluationAttemptFromRow,
  scheduledOutcomeEvaluationReceiptFromUnknown,
  scheduledOutcomeEvaluationSlotStartedAt,
} from "@/lib/scheduled-outcome-evaluation-receipt";
import type { RecommendationOutcomeHorizon } from "@/lib/recommendation-outcome-tracker";

const outcomeOneShotBuildIdentity = parseScheduledScanBuildDeploymentIdentity({
  schema_version: "scheduled_scan_deployment_identity_v1",
  deploy_id: "6ab1797d8ee5580008985f39",
  deploy_context: "production",
  commit_ref: "1f51d3ffcd392ab3491a966a4ba34ab93fab78cb",
  site_id: "2b582e03-ac97-4371-8051-558d9980fb94",
});

function oneShotControl(overrides: Record<string, string | undefined> = {}) {
  const values = {
    TURE_OUTCOME_EVALUATION_ONE_SHOT_ENABLED: "true",
    TURE_OUTCOME_EVALUATION_ONE_SHOT_DATE: "2026-09-23",
    TURE_OUTCOME_EVALUATION_ONE_SHOT_SLOT_UTC: "2026-09-23T20:15:00.000Z",
    ...overrides,
  };
  return outcomeOneShotControlFromEnvironment({
    get(name: string) { return values[name as keyof typeof values]; },
  });
}

function oneShotAdmission(overrides: Partial<Parameters<typeof outcomeOneShotAdmission>[0]> = {}) {
  return outcomeOneShotAdmission({
    control: oneShotControl(),
    scheduledFunctionsDisabled: true,
    nextRun: "2026-09-23T20:30:00.000Z",
    deliveryTime: new Date("2026-09-23T20:15:30.000Z"),
    context: {
      deploy: {
        id: "6ab1797d8ee5580008985f39",
        context: "production",
        published: true,
      },
    } as Parameters<typeof outcomeOneShotAdmission>[0]["context"],
    buildIdentity: outcomeOneShotBuildIdentity,
    runtimeSiteId: "2b582e03-ac97-4371-8051-558d9980fb94",
    ...overrides,
  });
}

test.describe("outcome one-slot scheduler admission", () => {
  test("keeps disabled and conflicting schedules inert before route or provider work", async () => {
    const originalNetlify = Object.getOwnPropertyDescriptor(globalThis, "Netlify");
    const originalFetch = globalThis.fetch;
    let values: Record<string, string | undefined> = {};
    let requests = 0;
    try {
      Object.defineProperty(globalThis, "Netlify", {
        configurable: true,
        value: { env: { get(name: string) { return values[name]; } } },
      });
      globalThis.fetch = async () => {
        requests += 1;
        throw new Error("Unexpected external request");
      };
      const request = () => new Request("https://scheduled.example", {
        method: "POST",
        body: JSON.stringify({ next_run: "2026-09-23T20:30:00.000Z" }),
      });
      const context = {} as Parameters<typeof scheduledOutcomeHandler>[1];

      values = { TURE_DISABLE_SCHEDULED_FUNCTIONS: "true" };
      expect((await scheduledOutcomeHandler(request(), context)).status).toBe(204);

      values = { TURE_OUTCOME_EVALUATION_ONE_SHOT_ENABLED: "true" };
      expect((await scheduledOutcomeHandler(request(), context)).status).toBe(503);
      expect(requests).toBe(0);
    } finally {
      globalThis.fetch = originalFetch;
      if (originalNetlify) Object.defineProperty(globalThis, "Netlify", originalNetlify);
      else Reflect.deleteProperty(globalThis, "Netlify");
    }
  });

  test("admits only the configured production event while global schedules remain disabled", () => {
    expect(oneShotAdmission()).toMatchObject({
      admitted: true,
      status: "admitted_runtime_context",
      event_evidence: {
        scheduled_slot_started_at_utc: "2026-09-23T20:15:00.000Z",
      },
    });
    expect(oneShotAdmission({ scheduledFunctionsDisabled: false })).toMatchObject({
      admitted: false,
      status: "runtime_gate_conflict",
    });
    expect(oneShotAdmission({ control: oneShotControl({ TURE_OUTCOME_EVALUATION_ONE_SHOT_ENABLED: "false" }) })).toMatchObject({
      admitted: false,
      status: "runtime_gate_conflict",
    });
    for (const conflictingFlag of [
      "TURE_NORMAL_SCAN_ONE_SHOT_ENABLED",
      "TURE_BASIC_FREE_CATALOG_CAPABILITY_PROBE_ENABLED",
    ]) {
      expect(oneShotAdmission({ control: oneShotControl({ [conflictingFlag]: "true" }) })).toMatchObject({
        admitted: false,
        status: "runtime_gate_conflict",
      });
    }
  });

  test("rejects wrong date/slot, malformed controls and manual or late delivery", () => {
    for (const control of [
      oneShotControl({ TURE_OUTCOME_EVALUATION_ONE_SHOT_DATE: "2026-09-22" }),
      oneShotControl({ TURE_OUTCOME_EVALUATION_ONE_SHOT_DATE: "2026-09-99" }),
      oneShotControl({ TURE_OUTCOME_EVALUATION_ONE_SHOT_SLOT_UTC: "2026-09-23T20:30:00.000Z" }),
      oneShotControl({ TURE_OUTCOME_EVALUATION_ONE_SHOT_SLOT_UTC: "2026-09-23T20:16:00.000Z" }),
    ]) {
      expect(oneShotAdmission({ control }).admitted).toBe(false);
    }
    expect(oneShotAdmission({ nextRun: null })).toMatchObject({
      admitted: false,
      status: "scheduled_event_unavailable",
    });
    expect(oneShotAdmission({ deliveryTime: new Date("2026-09-23T20:18:01.000Z") })).toMatchObject({
      admitted: false,
      status: "scheduled_event_unavailable",
    });
  });

  test("rejects missing, mismatched or non-production deployment identity", () => {
    expect(oneShotAdmission({ buildIdentity: null })).toMatchObject({
      admitted: false,
      status: "build_identity_unavailable",
    });
    expect(oneShotAdmission({ runtimeSiteId: "another-site" })).toMatchObject({
      admitted: false,
      status: "build_identity_unavailable",
    });
    expect(oneShotAdmission({
      context: { deploy: { id: "6ab1797d8ee5580008985f38", context: "production", published: true } } as Parameters<typeof outcomeOneShotAdmission>[0]["context"],
    })).toMatchObject({ admitted: false, status: "deployment_identity_conflict" });
    expect(oneShotAdmission({
      context: { deploy: { id: "6ab1797d8ee5580008985f39", context: "deploy-preview", published: false } } as Parameters<typeof outcomeOneShotAdmission>[0]["context"],
    }).admitted).toBe(false);
  });
});

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
      recommended_at: "2026-09-21T20:14:00.000Z",
      source_mode: "supabase",
      payload_json: {
        recommendation_publish_policy_version: "recommendation_publish_policy_v1",
        market_data_source: "twelve_data",
        data_timestamp: "2026-09-21T20:13:00.000Z",
        provider_source: "twelve_data",
        provider_version: "twelve_data_api_v1",
        market_data_adapter_version: "automation_scan_market_data_adapter_v1",
        build_marker: "test-build-marker",
      },
      intake_quality_json: {
        result_kind: "recommendation_intake_quality",
        result_version: "1.1",
        status: "accepted",
        grade: "A",
        accepted_for_visible_list: true,
        internal_only: true,
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
        intake_quality: {
          status: "complete",
          valid_receipt_count: 1,
          missing_receipt_count: 0,
          invalid_receipt_count: 0,
          accepted_for_visible_list_count: 1,
          result_versions: ["1.1"],
          result_statuses: ["accepted"],
          grades: ["A"],
        },
      },
      source_provenance: {
        contract_version:
          SCHEDULED_OUTCOME_EVALUATION_SOURCE_PROVENANCE_VERSION,
        status: "complete",
        source_timestamped_snapshot_count: 1,
        source_timestamp_after_decision_count: 0,
        provider_versioned_snapshot_count: 1,
        market_data_adapter_versions: [
          "automation_scan_market_data_adapter_v1",
        ],
        source_build_markers: ["test-build-marker"],
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
        decision_lineage: {
          ...built.decision_lineage,
          intake_quality: {
            ...built.decision_lineage.intake_quality,
            result_versions: [],
          },
        },
      }),
    ).toBeNull();
    expect(
      scheduledOutcomeEvaluationReceiptFromUnknown({
        ...built,
        market_date: "2026-09-22",
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
    expect(
      scheduledOutcomeEvaluationReceiptFromUnknown({
        ...built,
        source_provenance: {
          ...built.source_provenance,
          provider_versions: [],
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
          recommended_at: null,
          source_mode: "supabase",
          payload_json: {},
          intake_quality_json: null,
        },
      ],
    });

    expect(incomplete.decision_lineage).toMatchObject({
      status: "incomplete",
      missing_policy_version_count: 1,
      missing_market_data_source_count: 1,
      recommendation_publish_policy_versions: [],
    });
    expect(incomplete.source_provenance).toMatchObject({
      status: "incomplete",
      missing_decision_timestamp_count: 1,
      missing_source_timestamp_count: 1,
      missing_provider_version_count: 1,
    });
  });

  test("keeps decision-time source/version gaps and look-ahead explicit", () => {
    const built = buildScheduledOutcomeEvaluationReceipt({
      attemptFingerprint: "scheduled_outcome_evaluation_sourcegap",
      marketDate: "2026-09-21",
      scheduledSlotAt: "2026-09-21T20:45:00.000Z",
      routeReceivedAt: "2026-09-21T20:45:03.000Z",
      completedAt: "2026-09-21T20:45:05.000Z",
      routeVersion: "outcome-evaluation-route-v1.0",
      selectedBatchFingerprint: "batch_source_gap",
      run: completedRun(),
      outcomesCreatedCount: 0,
      outcomesUpdatedCount: 0,
      outcomesSkippedEqualOrBetterCount: 0,
      persistenceStatus: "not_attempted",
      persistenceError: null,
      firstBlocker: "decision_time_provenance_incomplete",
      nextRetrySuggestion: null,
      decisionSnapshots: [
        {
          recommended_at: "2026-09-21T20:44:00.000Z",
          source_mode: "supabase",
          payload_json: {
            recommendation_publish_policy_version:
              "recommendation_publish_policy_v1",
            market_data_source: "twelve_data",
            data_timestamp: "2026-09-21T20:44:01.000Z",
            provider_source: "twelve_data",
            market_data_adapter_version:
              "automation_scan_market_data_adapter_v1",
            build_marker: "test-build-marker",
          },
          intake_quality_json: null,
        },
      ],
    });

    expect(built.source_provenance).toMatchObject({
      status: "incomplete",
      source_timestamped_snapshot_count: 1,
      source_timestamp_after_decision_count: 1,
      missing_provider_version_count: 1,
    });
    expect(scheduledOutcomeEvaluationReceiptFromUnknown(built)).toEqual(built);
    expect(
      scheduledOutcomeEvaluationReceiptFromUnknown({
        ...built,
        source_provenance: {
          ...built.source_provenance,
          status: "complete",
        },
      }),
    ).toBeNull();
  });

  test("reads existing v1 receipts with provenance explicitly not recorded", () => {
    const built = receipt();

    expect(
      scheduledOutcomeEvaluationReceiptFromUnknown({
        ...built,
        source_provenance: undefined,
      }),
    ).toMatchObject({
      source_provenance: {
        contract_version:
          SCHEDULED_OUTCOME_EVALUATION_SOURCE_PROVENANCE_VERSION,
        status: "not_recorded",
      },
    });
    expect(
      scheduledOutcomeEvaluationReceiptFromUnknown({
        ...built,
        decision_lineage: {
          ...built.decision_lineage,
          intake_quality: undefined,
        },
      }),
    ).toMatchObject({
      decision_lineage: {
        intake_quality: {
          status: "not_recorded",
          eligible_snapshot_count: 1,
          valid_receipt_count: 0,
          missing_receipt_count: 1,
        },
      },
    });
  });

  test("keeps missing and malformed intake-quality receipts explicit for later evaluation", () => {
    const missing = buildScheduledOutcomeEvaluationReceipt({
      attemptFingerprint: "scheduled_outcome_evaluation_missingquality",
      marketDate: "2026-09-21",
      scheduledSlotAt: "2026-09-21T21:00:00.000Z",
      routeReceivedAt: "2026-09-21T21:00:03.000Z",
      completedAt: "2026-09-21T21:00:05.000Z",
      routeVersion: "outcome-evaluation-route-v1.0",
      selectedBatchFingerprint: "batch_missing_quality",
      run: completedRun(),
      outcomesCreatedCount: 0,
      outcomesUpdatedCount: 0,
      outcomesSkippedEqualOrBetterCount: 0,
      persistenceStatus: "not_attempted",
      persistenceError: null,
      firstBlocker: "intake_quality_not_recorded",
      nextRetrySuggestion: null,
      decisionSnapshots: [
        {
          ...decisionSnapshots()[0],
          intake_quality_json: null,
        },
      ],
    });
    const malformed = buildScheduledOutcomeEvaluationReceipt({
      attemptFingerprint: "scheduled_outcome_evaluation_invalidquality",
      marketDate: "2026-09-21",
      scheduledSlotAt: "2026-09-21T21:15:00.000Z",
      routeReceivedAt: "2026-09-21T21:15:03.000Z",
      completedAt: "2026-09-21T21:15:05.000Z",
      routeVersion: "outcome-evaluation-route-v1.0",
      selectedBatchFingerprint: "batch_invalid_quality",
      run: completedRun(),
      outcomesCreatedCount: 0,
      outcomesUpdatedCount: 0,
      outcomesSkippedEqualOrBetterCount: 0,
      persistenceStatus: "not_attempted",
      persistenceError: null,
      firstBlocker: "intake_quality_invalid",
      nextRetrySuggestion: null,
      decisionSnapshots: [
        {
          ...decisionSnapshots()[0],
          intake_quality_json: { result_kind: "recommendation_intake_quality" },
        },
      ],
    });

    expect(missing.decision_lineage.intake_quality).toMatchObject({
      status: "not_recorded",
      missing_receipt_count: 1,
      invalid_receipt_count: 0,
    });
    expect(malformed.decision_lineage.intake_quality).toMatchObject({
      status: "incomplete",
      valid_receipt_count: 0,
      missing_receipt_count: 0,
      invalid_receipt_count: 1,
    });
    expect(scheduledOutcomeEvaluationReceiptFromUnknown(missing)).toEqual(missing);
    expect(scheduledOutcomeEvaluationReceiptFromUnknown(malformed)).toEqual(malformed);
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
        market_date: "2026-09-22",
        status: "claimed",
        receipt_json: {},
        finalized_at: null,
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
    expect(source("app/trade-app.tsx")).toContain(
      "Decision-time source provenance",
    );
    expect(source("app/api/automation/run-scan/route.ts")).toContain(
      "automation_scan_market_data_adapter_v1",
    );
    expect(
      source(
        "supabase/migrations/20260918233411_if4_after_market_outcome_evaluation_receipts.sql",
      ),
    ).toContain("scheduled_outcome_evaluation_attempts_market_date_check");
  });
});
