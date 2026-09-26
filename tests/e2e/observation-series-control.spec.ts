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

const ownerUserId = "00000000-0000-4000-8000-000000000001";

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
}: {
  slot: string;
  status?: ObservationCycleReceipt["cycle_status"];
  disposition?: ObservationCycleReceipt["disposition"];
  reservedCredits?: number;
  publishedCount?: number;
  admissionDecision?: "request_current_data" | "no_request";
}): ObservationCycleReceipt {
  const suffix = slot.replace(/\D/g, "");
  return {
    receipt_version: "observation_cycle_receipt_v1",
    cycle_fingerprint: `scheduled_scan_attempt_${suffix}`,
    owner_user_id: ownerUserId,
    source_attempt_fingerprint: `scheduled_scan_attempt_${suffix}`,
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
      build_deployment_identity: null,
    },
    admission: {
      status: "admitted",
      policy_version: "observation_cycle_admission_v2",
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
}: {
  currentControl?: ReturnType<typeof control>;
  receipts?: ObservationCycleReceipt[];
  readbackStatus?: ObservationCycleReadback["status"];
  slot?: string;
} = {}) {
  const schedulerSlotAdmission = buildObservationSeriesSlotAdmission({
    control: currentControl,
    scheduledSlotStartedAtUtc: slot,
  });
  return buildObservationSeriesRuntimeAdmission({
    control: currentControl,
    schedulerControl: currentControl,
    schedulerSlotAdmission,
    scheduledSlotStartedAtUtc: slot,
    now: new Date(slot),
    ownerUserId,
    readback: readback(receipts, readbackStatus),
    perAttemptProviderCredits: 8,
  });
}

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
      perAttemptProviderCredits: 7,
    }).status,
  ).toBe("series_history_invalid");
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
});
