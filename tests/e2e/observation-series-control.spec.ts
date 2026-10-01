import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import type {
  ObservationCycleReadback,
  ObservationCycleReceipt,
} from "../../lib/observation-cycle-receipt";
import {
  buildObservationSeriesRuntimeAdmission,
  buildObservationSeriesSlotAdmission,
  observationSeriesControlFromEnvironment,
} from "../../lib/observation-series-control";
import scheduledScanHandler from "../../netlify/functions/scheduled-scan";
import { buildScannerProviderCreditAllocationRuntimeAdmission } from "../../lib/scanner-provider-credit-allocation-runtime-admission";
import { SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_CONTRACT as allocationContract } from "../../lib/scanner-provider-credit-allocation-live-experiment";
import { buildContinuousMarketScanAdmission } from "../../lib/continuous-market-scan-admission";
import { buildMarketSessionEvaluation } from "../../lib/market-session";
import { getIntradayScanWindow } from "../../lib/intraday-scan-window";
import { resolveScheduledScanProviderCreditBudget } from "../../lib/scheduled-scan-ticker-cap";
import { buildScannerProviderCreditAllocationExecutionPlan } from "../../lib/scanner-provider-credit-allocation-plan";
import { buildScannerProviderCreditAllocationReconciliation } from "../../lib/scanner-provider-credit-allocation-reconciliation";

const ownerUserId = "00000000-0000-4000-8000-000000000001";
const buildIdentity = {
  schema_version: "scheduled_scan_deployment_identity_v1" as const,
  deploy_id: "6ab1797d8ee5580008985f39",
  deploy_context: "production" as const,
  commit_ref: "a".repeat(40),
  site_id: "2b582e03-ac97-4371-8051-558d9980fb94",
};

function withFixedDate<T>(timestamp: string, callback: () => T) {
  const OriginalDate = globalThis.Date;
  const fixedTimestamp = new OriginalDate(timestamp).getTime();

  class FixedDate extends OriginalDate {
    constructor(value?: string | number | Date) {
      super(
        value === undefined
          ? fixedTimestamp
          : value instanceof OriginalDate
            ? value.getTime()
            : value,
      );
    }

    static now() {
      return fixedTimestamp;
    }
  }

  globalThis.Date = FixedDate as DateConstructor;
  try {
    return callback();
  } finally {
    globalThis.Date = OriginalDate;
  }
}

async function invokeSchedulerWithEnvironment({
  values,
  firedAt,
  nextRun,
}: {
  values: Record<string, string | undefined>;
  firedAt: string;
  nextRun: string;
}) {
  const originalNetlify = Object.getOwnPropertyDescriptor(globalThis, "Netlify");
  const originalFetch = globalThis.fetch;
  let fetchCount = 0;

  try {
    Object.defineProperty(globalThis, "Netlify", {
      configurable: true,
      value: { env: { get: (key: string) => values[key] } },
    });
    globalThis.fetch = async () => {
      fetchCount += 1;
      return new Response("unexpected", { status: 500 });
    };
    const response = await withFixedDate(firedAt, () =>
      scheduledScanHandler(
        new Request("https://scheduled.example", {
          method: "POST",
          body: JSON.stringify({ next_run: nextRun }),
        }),
        {
          deploy: {
            id: "6ab1797d8ee5580008985f39",
            context: "production",
            published: true,
          },
        } as Parameters<typeof scheduledScanHandler>[1],
      ),
    );
    return { response, fetchCount };
  } finally {
    globalThis.fetch = originalFetch;
    if (originalNetlify) {
      Object.defineProperty(globalThis, "Netlify", originalNetlify);
    } else {
      Reflect.deleteProperty(globalThis, "Netlify");
    }
  }
}

function control(overrides: Record<string, string | undefined> = {}) {
  const environment: Record<string, string | undefined> = {
    TURE_OBSERVATION_SERIES_ENABLED: "true",
    TURE_OBSERVATION_SERIES_DATE: "2026-09-28",
    TURE_OBSERVATION_SERIES_START_SLOT_UTC: "2026-09-28T13:30:00.000Z",
    TURE_OBSERVATION_SERIES_EXPIRES_AT_UTC: "2026-09-28T15:00:00.000Z",
    TURE_OBSERVATION_SERIES_MAX_ATTEMPTS: "6",
    TURE_OBSERVATION_SERIES_MAX_PROVIDER_CREDITS: "32",
    ...overrides,
  };
  return observationSeriesControlFromEnvironment({
    get: (name) => environment[name],
  });
}

function receipt({
  slot,
  status = "completed",
  disposition = "no_trade",
  reservedCredits = 8,
  publishedCount = 0,
  admissionDecision = "request_current_data",
  attemptFingerprint,
  receiptBuildIdentity = buildIdentity,
}: {
  slot: string;
  status?: ObservationCycleReceipt["cycle_status"];
  disposition?: ObservationCycleReceipt["disposition"];
  reservedCredits?: number;
  publishedCount?: number;
  admissionDecision?: "request_current_data" | "no_request";
  attemptFingerprint?: string;
  receiptBuildIdentity?: Record<string, unknown> | null;
}): ObservationCycleReceipt {
  const suffix = slot.replace(/\D/g, "");
  const fingerprint =
    attemptFingerprint ?? `scheduled_scan_attempt_${suffix}`;
  return {
    receipt_version: "observation_cycle_receipt_v1",
    cycle_fingerprint: fingerprint,
    owner_user_id: ownerUserId,
    source_attempt_fingerprint: fingerprint,
    cycle_status: status,
    disposition,
    observation_policy_version: "scheduled_scan_observation_cycle_v1",
    receipt_generated_at: slot,
    finalized_at: status === "active" ? null : slot,
    scan_run_fingerprint:
      status === "completed" ? `scan_run_${suffix}` : null,
    trigger: {
      status: "received",
      kind: "netlify_schedule",
      occurred_at: slot,
      route_received_at: slot,
      scheduled_slot_started_at_utc: slot,
      build_deployment_identity: receiptBuildIdentity,
    },
    admission: {
      status: "admitted",
      policy_version: "observation_cycle_admission_v3",
      market_status: "open",
      market_session: "regular",
      reason_codes: [],
      policy_receipt: {
        decision: admissionDecision,
      } as ObservationCycleReceipt["admission"]["policy_receipt"],
    },
    provider_request: {
      status: reservedCredits > 0 ? "attempted" : "not_attempted",
      attempted_tickers: reservedCredits > 0 ? 8 : 0,
      reserved_credits: reservedCredits,
      provider_credit_policy_version: "basic_free_scheduled_scan_credit_guard_v1",
    },
    provider_response: {
      status: status === "failed" ? "failed" : "observed",
      success_count: status === "completed" ? 8 : 0,
      error_count: status === "failed" ? 1 : 0,
      empty_response_count: 0,
      latest_error_type: status === "failed" ? "provider_failure" : null,
    },
    freshness: {
      status: status === "completed" ? "fresh" : "not_evaluated",
      stale_count: 0,
      reason_codes: [],
    },
    discovery_evaluation: {
      status: status === "completed" ? "completed" : "failed",
      raw_candidate_count: 0,
      ranked_count: 0,
      selected_count: 0,
      built_count: 0,
    },
    publication: {
      status: publishedCount > 0 ? "published" : "no_trade",
      published_count: publishedCount,
      recommendations_created: publishedCount,
      policy_version: "test",
      reason_codes: [],
    },
    decision: {
      outcome: publishedCount > 0 ? "published" : "no_trade",
      reason_codes: [],
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

function attemptRow({
  slot,
  currentControl = control(),
  attemptFingerprint,
  attemptBuildIdentity = buildIdentity,
}: {
  slot: string;
  currentControl?: ReturnType<typeof control>;
  attemptFingerprint?: string;
  attemptBuildIdentity?: typeof buildIdentity;
}) {
  const suffix = slot.replace(/\D/g, "");
  return {
    attempt_fingerprint:
      attemptFingerprint ?? `scheduled_scan_attempt_${suffix}`,
    source: "netlify_scheduled_function",
    mode: "scheduled",
    scheduled_function_fired_at: slot,
    utc_timestamp: slot,
    payload_json: {
      scheduled_slot_started_at_utc: slot,
      scheduled_slot_identity_source: "netlify_event_next_run",
      build_deployment_identity: attemptBuildIdentity,
      observation_series_control: currentControl,
      observation_series_slot_admission: buildObservationSeriesSlotAdmission({
        control: currentControl,
        scheduledSlotStartedAtUtc: slot,
      }),
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
    invalid_row_count: status === "available" ? 0 : 1,
    reason_codes: status === "available" ? [] : ["invalid"],
  };
}

function runtimeAdmission({
  currentControl = control(),
  receipts = [],
  readbackStatus = "available",
  slot = "2026-09-28T13:30:00.000Z",
  scheduledAttemptRows,
  currentAttemptFingerprint,
  providerCreditAllocationRuntimeAdmission,
}: {
  currentControl?: ReturnType<typeof control>;
  receipts?: ObservationCycleReceipt[];
  readbackStatus?: ObservationCycleReadback["status"];
  slot?: string;
  scheduledAttemptRows?: readonly unknown[] | null;
  currentAttemptFingerprint?: string;
  providerCreditAllocationRuntimeAdmission?: unknown;
} = {}) {
  const schedulerSlotAdmission = buildObservationSeriesSlotAdmission({
    control: currentControl,
    scheduledSlotStartedAtUtc: slot,
  });
  const currentAttempt = attemptRow({ slot, currentControl });
  const defaultRows = [
    ...receipts.map((item) =>
      attemptRow({
        slot: item.trigger.scheduled_slot_started_at_utc!,
        currentControl,
        attemptFingerprint: item.source_attempt_fingerprint,
      }),
    ),
    currentAttempt,
  ];
  const uniqueDefaultRows = Array.from(
    new Map(
      defaultRows.map((row) => [row.attempt_fingerprint, row]),
    ).values(),
  );
  return buildObservationSeriesRuntimeAdmission({
    control: currentControl,
    schedulerControl: currentControl,
    schedulerSlotAdmission,
    scheduledSlotStartedAtUtc: slot,
    now: new Date(slot),
    ownerUserId,
    readback: readback(receipts, readbackStatus),
    scheduledAttemptRows:
      scheduledAttemptRows === undefined
        ? uniqueDefaultRows
        : scheduledAttemptRows,
    currentAttemptFingerprint:
      currentAttemptFingerprint ?? currentAttempt.attempt_fingerprint,
    perAttemptProviderCredits: 8,
    providerCreditAllocationRuntimeAdmission,
  });
}

function allocationControl() {
  return control({
    TURE_OBSERVATION_SERIES_DATE: allocationContract.trading_date,
    TURE_OBSERVATION_SERIES_START_SLOT_UTC: allocationContract.slots[0].slot_utc,
    TURE_OBSERVATION_SERIES_EXPIRES_AT_UTC: allocationContract.expires_at_utc,
    TURE_OBSERVATION_SERIES_MAX_ATTEMPTS: String(allocationContract.max_attempts),
    TURE_OBSERVATION_SERIES_MAX_PROVIDER_CREDITS: String(allocationContract.max_total_provider_credits),
  });
}

function allocationAdmission(slot: string, revision = buildIdentity.commit_ref) {
  return buildScannerProviderCreditAllocationRuntimeAdmission({
    enabled: true,
    experimentId: allocationContract.experiment_id,
    scheduledInvocationBound: true,
    scheduledSlotUtc: slot,
    now: new Date(slot),
    expectedRevision: revision,
    deployedRevision: revision,
  });
}

test("allocation experiment immediately stops on an attributable plan-versus-actual divergence", () => {
  const [previousSlot, currentSlot] = allocationContract.slots.map((entry) => entry.slot_utc);
  const previousAdmission = allocationAdmission(previousSlot);
  const plan = buildScannerProviderCreditAllocationExecutionPlan({
    policyVersion: previousAdmission.selected_policy_version,
    providerCreditCap: 6, intradayProviderCreditCap: 3,
    candidateDemands: Array.from({ length: 8 }, (_, index) => ({
      ticker: `T${index}`, ticker_index: index,
      daily_refresh_required: true, intraday_refresh_required: true,
    })),
  });
  const previous = {
    ...receipt({ slot: previousSlot, reservedCredits: 0 }),
    provider_credit_allocation_runtime_admission: previousAdmission,
    provider_credit_allocation_execution_plan: plan,
    provider_credit_allocation_reconciliation: buildScannerProviderCreditAllocationReconciliation({
      plan, actualAllocations: [], admissionFingerprint: previousAdmission.admission_fingerprint,
    }),
  };
  expect(previous.provider_credit_allocation_reconciliation.status).toBe("diverged");
  expect(runtimeAdmission({
    currentControl: allocationControl(), slot: currentSlot, receipts: [previous],
    providerCreditAllocationRuntimeAdmission: allocationAdmission(currentSlot),
  })).toMatchObject({ decision: "reject", status: "series_history_invalid",
    reason_codes: ["allocation_experiment_reconciliation_diverged"] });
  // This experiment-specific stop must not redefine generic series behavior.
  expect(runtimeAdmission({
    currentControl: allocationControl(), slot: currentSlot, receipts: [previous],
  })).toMatchObject({ decision: "allow" });
});

test("the bound allocation experiment stops before current-data work after two failures, not one", () => {
  const slots = allocationContract.slots.map((item) => item.slot_utc);
  const failed = slots.slice(0, 2).map((slot) => receipt({
    slot, status: "failed", disposition: "failed", reservedCredits: 0,
    admissionDecision: "no_request",
  }));
  for (const failureCount of [1, 2]) {
    const slot = slots[failureCount];
    const experimentAdmission = allocationAdmission(slot);
    const seriesAdmission = runtimeAdmission({
      currentControl: allocationControl(), slot,
      receipts: failed.slice(0, failureCount),
      providerCreditAllocationRuntimeAdmission: experimentAdmission,
    });
    expect(seriesAdmission).toMatchObject({
      admission_version: "observation_series_runtime_admission_v3",
      decision: failureCount === 1 ? "allow" : "no_request",
      status: failureCount === 1 ? "eligible" : "series_failure_stop_reached",
      facts: {
        consecutive_failures: failureCount, max_consecutive_failures: 2,
        failure_stop_reached: failureCount === 2,
        allocation_admission_fingerprint: experimentAdmission.admission_fingerprint,
      },
    });
    const now = new Date(slot);
    const marketStatus = {
      isOpenDay: true, reason: "Synthetic CLOSED fixture", date: allocationContract.trading_date,
      dayType: "trading_day" as const, marketOpenTime: "09:30", marketCloseTime: "16:00", provider: "polygon",
    };
    const gate = buildContinuousMarketScanAdmission({
      now, marketStatus, marketSession: buildMarketSessionEvaluation({ now, marketStatus }),
      scanWindow: getIntradayScanWindow(now), recentScanRuns: [], recentPreRunFailures: [],
      legacyPowerHourWindowGate: {
        official_window_detected: false, scheduled_gate_window: getIntradayScanWindow(now),
        scheduled_gate_allowed: true, scheduled_gate_block_reason: null, schedule_window_mismatch: false,
      },
      providerBudget: resolveScheduledScanProviderCreditBudget({ planMode: "free" }),
      observationSeriesAdmission: seriesAdmission,
    });
    expect(gate.scheduled_gate_allowed).toBe(failureCount === 1);
    if (failureCount === 2) expect(gate.scheduled_gate_block_reason).toBe("series_failure_stop_reached");
  }
  // Generic control identity and its historical three-failure rule stay intact.
  expect(allocationControl().max_consecutive_failures).toBe(3);
  expect(runtimeAdmission({
    currentControl: allocationControl(), slot: slots[2], receipts: failed,
  })).toMatchObject({ decision: "allow", facts: { max_consecutive_failures: 3 } });
});

test("allocation failure stop remains latched across later rejected slot receipts", () => {
  const slots = allocationContract.slots.map((item) => item.slot_utc);
  const failed = slots.slice(0, 2).map((slot) => receipt({
    slot, status: "failed", disposition: "failed", reservedCredits: 0,
  }));
  const rejected = receipt({
    slot: slots[2], status: "rejected", disposition: "no_request", reservedCredits: 0,
    admissionDecision: "no_request",
  });
  expect(runtimeAdmission({
    currentControl: allocationControl(), slot: slots[3], receipts: [...failed, rejected],
    providerCreditAllocationRuntimeAdmission: allocationAdmission(slots[3]),
  })).toMatchObject({
    decision: "no_request", status: "series_failure_stop_reached",
    facts: { consecutive_failures: 0, failure_stop_reached: true },
  });
  // Before a stop occurs, a complete no_trade truthfully breaks the chain.
  expect(runtimeAdmission({
    currentControl: allocationControl(), slot: slots[3],
    receipts: [failed[0], receipt({ slot: slots[1], reservedCredits: 0 }),
      receipt({ slot: slots[2], status: "failed", disposition: "failed", reservedCredits: 0 })],
    providerCreditAllocationRuntimeAdmission: allocationAdmission(slots[3]),
  })).toMatchObject({ decision: "allow", facts: { consecutive_failures: 1, failure_stop_reached: false } });
});

test("allocation failure control rejects tampered, wrong-slot, wrong-revision and blocked admissions", () => {
  const slot = allocationContract.slots[2].slot_utc;
  const admission = allocationAdmission(slot);
  for (const invalid of [
    { ...admission, admission_fingerprint: "b".repeat(64) },
    allocationAdmission(allocationContract.slots[1].slot_utc),
    allocationAdmission(slot, "b".repeat(40)),
    allocationAdmission("2026-10-01T14:15:00.000Z"),
  ]) {
    expect(runtimeAdmission({
      currentControl: allocationControl(), slot,
      providerCreditAllocationRuntimeAdmission: invalid,
    })).toMatchObject({ decision: "reject", status: "allocation_experiment_identity_mismatch" });
  }
});

test("is default-off and requires one exact bounded immutable series contract", () => {
  expect(
    observationSeriesControlFromEnvironment({ get: () => undefined }),
  ).toMatchObject({
    requested: false,
    status: "disabled",
    authority: {
      arms_scheduler: false,
      calls_provider: false,
      executes_broker_order: false,
    },
  });

  const readyControl = control();
  expect(readyControl).toMatchObject({
    requested: true,
    status: "ready",
    trading_date: "2026-09-28",
    starts_at_utc: "2026-09-28T13:30:00.000Z",
    expires_at_utc: "2026-09-28T15:00:00.000Z",
    max_attempts: 6,
    max_provider_credits: 32,
    stop_on_publication: true,
    max_consecutive_failures: 3,
  });
  expect(readyControl.series_id).toMatch(/^observation_series_[a-f0-9]{16}$/);
  expect(
    control({
      TURE_OBSERVATION_SERIES_MAX_PROVIDER_CREDITS: "24",
    }).series_id,
  ).not.toBe(readyControl.series_id);

  for (const invalid of [
    { TURE_OBSERVATION_SERIES_DATE: "2026-09-31" },
    { TURE_OBSERVATION_SERIES_START_SLOT_UTC: "2026-09-28T13:31:00.000Z" },
    { TURE_OBSERVATION_SERIES_EXPIRES_AT_UTC: "2026-09-29T14:00:00.000Z" },
    { TURE_OBSERVATION_SERIES_MAX_ATTEMPTS: "7" },
    { TURE_OBSERVATION_SERIES_MAX_PROVIDER_CREDITS: "31" },
    { TURE_OBSERVATION_SERIES_MAX_PROVIDER_CREDITS: "56" },
  ]) {
    expect(control(invalid).status).toBe("invalid");
  }
});

test("admits only aligned slots inside the half-open series window", () => {
  const currentControl = control();
  expect(
    buildObservationSeriesSlotAdmission({
      control: currentControl,
      scheduledSlotStartedAtUtc: "2026-09-28T13:15:00.000Z",
    }),
  ).toMatchObject({
    decision: "no_request",
    status: "series_not_started",
    next_eligible_at: "2026-09-28T13:30:00.000Z",
  });
  expect(
    buildObservationSeriesSlotAdmission({
      control: currentControl,
      scheduledSlotStartedAtUtc: "2026-09-28T14:45:00.000Z",
    }),
  ).toMatchObject({ decision: "eligible", status: "eligible" });
  expect(
    buildObservationSeriesSlotAdmission({
      control: currentControl,
      scheduledSlotStartedAtUtc: "2026-09-28T15:00:00.000Z",
    }),
  ).toMatchObject({ decision: "no_request", status: "series_expired" });
});

test("keeps invalid, conflicting and out-of-window series inert before persistence", async () => {
  const validEnvironment = {
    TURE_DISABLE_SCHEDULED_FUNCTIONS: "true",
    TURE_BASIC_FREE_CATALOG_CAPABILITY_PROBE_ENABLED: "false",
    TURE_BASIC_FREE_CATALOG_OBSERVATION_ONE_SHOT_ENABLED: "false",
    TURE_OUTCOME_EVALUATION_ONE_SHOT_ENABLED: "false",
    TURE_INTERNAL_PAPER_WORKER_ENABLED: "false",
    TURE_OBSERVATION_SERIES_ENABLED: "true",
    TURE_OBSERVATION_SERIES_DATE: "2026-09-28",
    TURE_OBSERVATION_SERIES_START_SLOT_UTC: "2026-09-28T13:30:00.000Z",
    TURE_OBSERVATION_SERIES_EXPIRES_AT_UTC: "2026-09-28T15:00:00.000Z",
    TURE_OBSERVATION_SERIES_MAX_ATTEMPTS: "6",
    TURE_OBSERVATION_SERIES_MAX_PROVIDER_CREDITS: "32",
  };

  const invalid = await invokeSchedulerWithEnvironment({
    values: {
      ...validEnvironment,
      TURE_OBSERVATION_SERIES_MAX_PROVIDER_CREDITS: "31",
    },
    firedAt: "2026-09-28T13:30:20.000Z",
    nextRun: "2026-09-28T13:45:00.000Z",
  });
  expect(invalid.response.status).toBe(503);
  expect(invalid.fetchCount).toBe(0);

  const conflicting = await invokeSchedulerWithEnvironment({
    values: {
      ...validEnvironment,
      TURE_NORMAL_SCAN_ONE_SHOT_ENABLED: "true",
      TURE_NORMAL_SCAN_ONE_SHOT_DATE: "2026-09-28",
      TURE_NORMAL_SCAN_ONE_SHOT_SLOT_UTC: "2026-09-28T13:30:00.000Z",
    },
    firedAt: "2026-09-28T13:30:20.000Z",
    nextRun: "2026-09-28T13:45:00.000Z",
  });
  expect(conflicting.response.status).toBe(503);
  expect(conflicting.fetchCount).toBe(0);

  const beforeStart = await invokeSchedulerWithEnvironment({
    values: validEnvironment,
    firedAt: "2026-09-28T13:15:20.000Z",
    nextRun: "2026-09-28T13:30:00.000Z",
  });
  expect(beforeStart.response.status).toBe(204);
  expect(beforeStart.fetchCount).toBe(0);

  const expired = await invokeSchedulerWithEnvironment({
    values: validEnvironment,
    firedAt: "2026-09-28T15:00:20.000Z",
    nextRun: "2026-09-28T15:15:00.000Z",
  });
  expect(expired.response.status).toBe(204);
  expect(expired.fetchCount).toBe(0);
});

test("allows a first bounded cycle and keeps a truthful no_trade series alive", () => {
  expect(runtimeAdmission()).toMatchObject({
    decision: "allow",
    status: "eligible",
    facts: {
      attempted_cycles: 0,
      remaining_attempts: 6,
      remaining_provider_credits: 32,
    },
  });

  expect(
    runtimeAdmission({
      slot: "2026-09-28T13:45:00.000Z",
      receipts: [receipt({ slot: "2026-09-28T13:30:00.000Z" })],
    }),
  ).toMatchObject({
    decision: "allow",
    status: "eligible",
    facts: {
      attempted_cycles: 1,
      reserved_provider_credits: 8,
      published_recommendations: 0,
    },
  });
});

test("stops on publication, unresolved overlap, repeated failure, attempt cap and credit cap", () => {
  const slots = [
    "2026-09-28T13:30:00.000Z",
    "2026-09-28T13:45:00.000Z",
    "2026-09-28T14:00:00.000Z",
    "2026-09-28T14:15:00.000Z",
  ];
  expect(
    runtimeAdmission({
      slot: "2026-09-28T14:30:00.000Z",
      receipts: [receipt({ slot: slots[0], publishedCount: 1, disposition: "published" })],
    }).status,
  ).toBe("series_terminal_publication_observed");
  expect(
    runtimeAdmission({
      slot: "2026-09-28T14:30:00.000Z",
      receipts: [receipt({ slot: slots[0], status: "active", reservedCredits: 0 })],
    }).status,
  ).toBe("series_active_cycle_unresolved");
  expect(
    runtimeAdmission({
      slot: "2026-09-28T14:30:00.000Z",
      receipts: slots.slice(0, 3).map((slot) =>
        receipt({
          slot,
          status: "failed",
          disposition: "failed",
          reservedCredits: 0,
          admissionDecision: "no_request",
        }),
      ),
    }).status,
  ).toBe("series_failure_stop_reached");
  expect(
    runtimeAdmission({
      slot: "2026-09-28T14:45:00.000Z",
      receipts: [
        receipt({
          slot: slots[0],
          status: "failed",
          disposition: "failed",
          reservedCredits: 0,
          admissionDecision: "no_request",
        }),
        receipt({ slot: slots[1] }),
        receipt({
          slot: slots[2],
          status: "failed",
          disposition: "failed",
          reservedCredits: 0,
          admissionDecision: "no_request",
        }),
        receipt({
          slot: slots[3],
          status: "failed",
          disposition: "failed",
          reservedCredits: 0,
          admissionDecision: "no_request",
        }),
      ],
    }),
  ).toMatchObject({
    decision: "allow",
    status: "eligible",
    facts: { consecutive_failures: 2 },
  });
  expect(
    runtimeAdmission({
      currentControl: control({
        TURE_OBSERVATION_SERIES_MAX_ATTEMPTS: "4",
        TURE_OBSERVATION_SERIES_MAX_PROVIDER_CREDITS: "32",
      }),
      slot: "2026-09-28T14:30:00.000Z",
      receipts: slots.map((slot) => receipt({ slot })),
    }).status,
  ).toBe("series_attempt_cap_reached");
  expect(
    runtimeAdmission({
      slot: "2026-09-28T14:30:00.000Z",
      receipts: slots.map((slot) => receipt({ slot })),
    }).status,
  ).toBe("series_credit_cap_reached");
});

test("fails closed on scheduler identity, history or provider-ceiling ambiguity", () => {
  const currentControl = control();
  const slot = "2026-09-28T13:30:00.000Z";
  const schedulerSlotAdmission = buildObservationSeriesSlotAdmission({
    control: currentControl,
    scheduledSlotStartedAtUtc: slot,
  });

  expect(
    buildObservationSeriesRuntimeAdmission({
      control: currentControl,
      schedulerControl: null,
      schedulerSlotAdmission,
      scheduledSlotStartedAtUtc: slot,
      now: new Date(slot),
      ownerUserId,
      readback: readback([]),
      perAttemptProviderCredits: 8,
    }).status,
  ).toBe("scheduler_series_identity_mismatch");
  expect(runtimeAdmission({ readbackStatus: "partial" }).status).toBe(
    "series_history_invalid",
  );
  expect(
    buildObservationSeriesRuntimeAdmission({
      control: currentControl,
      schedulerControl: currentControl,
      schedulerSlotAdmission,
      scheduledSlotStartedAtUtc: slot,
      now: new Date(slot),
      ownerUserId,
      readback: readback([]),
      scheduledAttemptRows: [attemptRow({ slot, currentControl })],
      currentAttemptFingerprint:
        attemptRow({ slot, currentControl }).attempt_fingerprint,
      perAttemptProviderCredits: 7,
    }).status,
  ).toBe("series_history_invalid");
});

test("attributes every series receipt to one exact claim, slot and deploy", () => {
  const currentControl = control();
  const priorSlot = "2026-09-28T13:30:00.000Z";
  const currentSlot = "2026-09-28T13:45:00.000Z";
  const priorReceipt = receipt({ slot: priorSlot });
  const priorAttempt = attemptRow({ slot: priorSlot, currentControl });
  const currentAttempt = attemptRow({ slot: currentSlot, currentControl });

  expect(
    runtimeAdmission({
      currentControl,
      slot: currentSlot,
      scheduledAttemptRows: null,
    }),
  ).toMatchObject({
    decision: "reject",
    status: "series_history_unavailable",
    reason_codes: ["series_attempt_history_unavailable"],
  });

  expect(
    runtimeAdmission({
      currentControl,
      slot: currentSlot,
      receipts: [priorReceipt],
      scheduledAttemptRows: [currentAttempt],
    }),
  ).toMatchObject({
    decision: "reject",
    status: "series_history_invalid",
    reason_codes: ["series_receipt_attempt_attribution_invalid"],
  });

  expect(
    runtimeAdmission({
      currentControl,
      slot: currentSlot,
      scheduledAttemptRows: [priorAttempt, currentAttempt],
    }),
  ).toMatchObject({
    decision: "reject",
    status: "series_history_invalid",
    reason_codes: ["series_prior_attempt_receipt_missing"],
  });

  expect(
    runtimeAdmission({
      currentControl,
      slot: currentSlot,
      receipts: [priorReceipt],
      scheduledAttemptRows: [
        attemptRow({
          slot: priorSlot,
          currentControl: control({
            TURE_OBSERVATION_SERIES_MAX_PROVIDER_CREDITS: "24",
          }),
        }),
        currentAttempt,
      ],
    }),
  ).toMatchObject({
    decision: "reject",
    status: "series_history_invalid",
    reason_codes: ["series_attempt_lineage_invalid"],
  });

  const changedBuildIdentity = {
    ...buildIdentity,
    deploy_id: "b".repeat(24),
  };
  expect(
    runtimeAdmission({
      currentControl,
      slot: currentSlot,
      receipts: [
        receipt({
          slot: priorSlot,
          receiptBuildIdentity: changedBuildIdentity,
        }),
      ],
      scheduledAttemptRows: [
        attemptRow({
          slot: priorSlot,
          currentControl,
          attemptBuildIdentity: changedBuildIdentity,
        }),
        currentAttempt,
      ],
    }),
  ).toMatchObject({
    decision: "reject",
    status: "series_history_invalid",
    reason_codes: ["series_attempt_build_identity_mismatch"],
  });

  expect(
    runtimeAdmission({
      currentControl,
      slot: currentSlot,
      scheduledAttemptRows: [
        currentAttempt,
        attemptRow({
          slot: currentSlot,
          currentControl,
          attemptFingerprint: "scheduled_scan_attempt_duplicate_slot",
        }),
      ],
    }),
  ).toMatchObject({
    decision: "reject",
    status: "series_history_invalid",
    reason_codes: ["series_attempt_slot_duplicate"],
  });

  expect(
    runtimeAdmission({
      currentControl,
      slot: currentSlot,
      receipts: [receipt({ slot: currentSlot })],
    }),
  ).toMatchObject({
    decision: "no_request",
    status: "series_current_cycle_already_observed",
  });
});

test("wires series control into the scheduler, route admission and durable attempt payload", () => {
  const root = resolve(__dirname, "../..");
  const scheduledFunction = readFileSync(
    resolve(root, "netlify/functions/scheduled-scan.ts"),
    "utf8",
  );
  const route = readFileSync(
    resolve(root, "app/api/automation/run-scan/route.ts"),
    "utf8",
  );
  expect(scheduledFunction).toContain(
    "observationSeriesControlFromEnvironment(Netlify.env)",
  );
  expect(scheduledFunction).toContain(
    "observation_series_slot_admission",
  );
  expect(route).toContain("buildObservationSeriesRuntimeAdmission");
  expect(route).toContain("observation_series_admission: observationSeriesAdmission");
  expect(route).toContain(
    "readRecentObservationCycleReadback(ownerUserId, observationSeriesControl)",
  );
  expect(route).toContain(
    '.gte("scheduled_slot_at", observationSeriesControl.starts_at_utc!)',
  );
  expect(route).toContain(
    '.lt("scheduled_slot_at", observationSeriesControl.expires_at_utc!)',
  );
  expect(route).toContain("readObservationSeriesScheduledAttemptRows");
  expect(route).toContain("currentAttemptFingerprint: scheduledScanAttemptFingerprint");
  expect(route).toContain("shouldApplyLegacySameWindowCooldown({");
  expect(route).toContain(
    "observationSeriesAdmission:\n          scheduledGateDiagnostics.observation_series_admission",
  );
  expect(route).toContain(
    "observationAdmission: scheduledGateDiagnostics.observation_admission",
  );
  expect(route).toContain('{ count: "exact" }');
});
