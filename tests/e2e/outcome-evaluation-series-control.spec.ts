import fs from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";
import {
  buildOutcomeEvaluationSeriesSlotAdmission,
  outcomeEvaluationSeriesControlFromEnvironment,
  outcomeEvaluationSeriesControlFromUnknown,
  outcomeEvaluationSeriesInvocationLineageFromUnknown,
  outcomeEvaluationSeriesSlotAdmissionFromUnknown,
} from "@/lib/outcome-evaluation-series-control";

function control(overrides: Record<string, string | undefined> = {}) {
  const values = {
    TURE_OUTCOME_EVALUATION_SERIES_ENABLED: "true",
    TURE_OUTCOME_EVALUATION_SERIES_DATE: "2026-09-28",
    TURE_OUTCOME_EVALUATION_SERIES_START_SLOT_UTC:
      "2026-09-28T15:30:00.000Z",
    TURE_OUTCOME_EVALUATION_SERIES_EXPIRES_AT_UTC:
      "2026-09-28T19:30:00.000Z",
    TURE_OUTCOME_EVALUATION_SERIES_MAX_ATTEMPTS: "16",
    TURE_OUTCOME_EVALUATION_SERIES_MAX_PROVIDER_CREDITS: "64",
    ...overrides,
  };
  return outcomeEvaluationSeriesControlFromEnvironment({
    get: (name) => values[name as keyof typeof values],
  });
}

function source(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

test("outcome evaluation series is default-off and accepts one exact bounded window", () => {
  expect(
    outcomeEvaluationSeriesControlFromEnvironment({ get: () => undefined }),
  ).toMatchObject({
    requested: false,
    status: "disabled",
    series_id: null,
  });

  const ready = control();
  expect(ready).toMatchObject({
    requested: true,
    status: "ready",
    trading_date: "2026-09-28",
    starts_at_utc: "2026-09-28T15:30:00.000Z",
    expires_at_utc: "2026-09-28T19:30:00.000Z",
    max_attempts: 16,
    max_provider_credits: 64,
    provider_credits_per_attempt: 4,
  });
  expect(ready.series_id).toMatch(/^outcome_evaluation_series_[a-f0-9]{8}$/);
  expect(outcomeEvaluationSeriesControlFromUnknown(ready)).toEqual(ready);
});

test("outcome evaluation series rejects unbounded or incoherent budgets and dates", () => {
  for (const invalid of [
    control({ TURE_OUTCOME_EVALUATION_SERIES_DATE: "2026-09-99" }),
    control({
      TURE_OUTCOME_EVALUATION_SERIES_EXPIRES_AT_UTC:
        "2026-09-29T00:00:00.000Z",
    }),
    control({ TURE_OUTCOME_EVALUATION_SERIES_MAX_ATTEMPTS: "15" }),
    control({ TURE_OUTCOME_EVALUATION_SERIES_MAX_PROVIDER_CREDITS: "63" }),
    control({
      TURE_OUTCOME_EVALUATION_SERIES_EXPIRES_AT_UTC:
        "2026-09-28T19:45:00.000Z",
      TURE_OUTCOME_EVALUATION_SERIES_MAX_ATTEMPTS: "17",
      TURE_OUTCOME_EVALUATION_SERIES_MAX_PROVIDER_CREDITS: "68",
    }),
  ]) {
    expect(invalid.status).toBe("invalid");
    expect(invalid.series_id).toBeNull();
    expect(outcomeEvaluationSeriesControlFromUnknown(invalid)).toBeNull();
  }
});

test("only exact half-open series slots are admitted and their index is immutable", () => {
  const ready = control();
  expect(
    buildOutcomeEvaluationSeriesSlotAdmission({
      control: ready,
      scheduledSlotStartedAtUtc: "2026-09-28T15:15:00.000Z",
    }),
  ).toMatchObject({ decision: "no_request", status: "series_not_started" });

  const first = buildOutcomeEvaluationSeriesSlotAdmission({
    control: ready,
    scheduledSlotStartedAtUtc: "2026-09-28T15:30:00.000Z",
  });
  expect(first).toMatchObject({
    decision: "eligible",
    status: "eligible",
    slot_index: 0,
  });
  expect(outcomeEvaluationSeriesSlotAdmissionFromUnknown(first)).toEqual(first);

  expect(
    buildOutcomeEvaluationSeriesSlotAdmission({
      control: ready,
      scheduledSlotStartedAtUtc: "2026-09-28T19:15:00.000Z",
    }),
  ).toMatchObject({ decision: "eligible", slot_index: 15 });
  expect(
    buildOutcomeEvaluationSeriesSlotAdmission({
      control: ready,
      scheduledSlotStartedAtUtc: "2026-09-28T19:30:00.000Z",
    }),
  ).toMatchObject({ decision: "no_request", status: "series_expired" });
  expect(
    buildOutcomeEvaluationSeriesSlotAdmission({
      control: ready,
      scheduledSlotStartedAtUtc: "2026-09-29T15:30:00.000Z",
    }),
  ).toMatchObject({ decision: "no_request", status: "series_date_mismatch" });

  expect(
    outcomeEvaluationSeriesSlotAdmissionFromUnknown({
      ...first,
      slot_index: 1,
    }),
  ).not.toEqual(first);
});

test("the outcome route accepts only the recomputed exact series lineage", () => {
  const ready = control();
  const admission = buildOutcomeEvaluationSeriesSlotAdmission({
    control: ready,
    scheduledSlotStartedAtUtc: "2026-09-28T15:30:00.000Z",
  });
  const body = {
    scheduled_function_fired_at_utc: "2026-09-28T15:30:03.000Z",
    scheduled_slot_at_utc: "2026-09-28T15:30:00.000Z",
    scheduled_outcome_evaluation_attempt_fingerprint:
      "scheduled_outcome_evaluation_abcd1234",
    outcome_evaluation_series_control: ready,
    outcome_evaluation_series_slot_admission: admission,
  };

  expect(
    outcomeEvaluationSeriesInvocationLineageFromUnknown({
      control: body.outcome_evaluation_series_control,
      slotAdmission: body.outcome_evaluation_series_slot_admission,
      scheduledSlotStartedAtUtc: body.scheduled_slot_at_utc,
    }),
  ).toMatchObject({
    status: "ready",
    control: { series_id: ready.series_id },
    slot_admission: { slot_index: 0 },
  });
  expect(
    outcomeEvaluationSeriesInvocationLineageFromUnknown({
      control: ready,
      slotAdmission: { ...admission, slot_index: 1 },
      scheduledSlotStartedAtUtc: body.scheduled_slot_at_utc,
    }),
  ).toMatchObject({ status: "invalid" });
  expect(
    outcomeEvaluationSeriesInvocationLineageFromUnknown({
      control: ready,
      slotAdmission: null,
      scheduledSlotStartedAtUtc: body.scheduled_slot_at_utc,
    }),
  ).toMatchObject({ status: "invalid" });
});

test("scheduler and route keep the series deploy-bound, mutually exclusive and durable", () => {
  const scheduler = source("netlify/functions/scheduled-outcome-evaluation.ts");
  const scanScheduler = source("netlify/functions/scheduled-scan.ts");
  const route = source("app/api/recommendations/evaluate-outcomes/route.ts");

  expect(scheduler).toContain("outcomeEvaluationSeriesControlFromEnvironment");
  expect(scheduler).toContain("buildOutcomeEvaluationSeriesSlotAdmission");
  expect(scheduler).toContain("scheduledScanTimeBoundAdmission");
  expect(scheduler).toContain("Outcome series conflicts with runtime gates");
  expect(scheduler).toContain("outcome_evaluation_series_control");
  expect(scheduler).toContain("outcome_evaluation_series_slot_admission");
  expect(scanScheduler).toContain("TURE_OUTCOME_EVALUATION_SERIES_ENABLED");
  expect(route).toContain(
    "outcomeEvaluationSeriesInvocationLineageFromUnknown",
  );
  expect(route).toContain("outcome_evaluation_series_control:");
  expect(route).not.toContain("placeOrder");
  expect(route).not.toContain("executeBroker");
});
