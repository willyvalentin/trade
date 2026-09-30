import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  evaluateObservationSeriesActivationDatabasePreflight,
  observationSeriesActivationPreflightReadbackFromUnknown,
} from "@/lib/observation-series-activation-preflight";
import {
  buildScannerProviderCreditAllocationActivationManifest,
  buildScannerProviderCreditAllocationScheduledSlotAdmission,
  scannerProviderCreditAllocationActivationControlFromEnvironment,
  scannerProviderCreditAllocationActivationEnvironmentFrom,
  scannerProviderCreditAllocationExpectedObservationSeriesControl,
} from "@/lib/scanner-provider-credit-allocation-activation";
import { SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_CONTRACT } from "@/lib/scanner-provider-credit-allocation-live-experiment";
import {
  SCANNER_PROVIDER_CREDIT_ALLOCATION_EXPERIMENT_ENABLED_ENV,
  SCANNER_PROVIDER_CREDIT_ALLOCATION_EXPERIMENT_EXPECTED_REVISION_ENV,
  SCANNER_PROVIDER_CREDIT_ALLOCATION_EXPERIMENT_ID_ENV,
} from "@/lib/scanner-provider-credit-allocation-runtime-admission";
import scheduledScanHandler from "../../netlify/functions/scheduled-scan";

const contract =
  SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_CONTRACT;
const revision = "a".repeat(40);

function environment(values: Record<string, string>) {
  return { get: (name: string) => values[name] };
}

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

function activationValues(overrides: Record<string, string> = {}) {
  return {
    [SCANNER_PROVIDER_CREDIT_ALLOCATION_EXPERIMENT_ENABLED_ENV]: "true",
    [SCANNER_PROVIDER_CREDIT_ALLOCATION_EXPERIMENT_ID_ENV]:
      contract.experiment_id,
    [SCANNER_PROVIDER_CREDIT_ALLOCATION_EXPERIMENT_EXPECTED_REVISION_ENV]:
      revision,
    TURE_OBSERVATION_SERIES_ENABLED: "true",
    TURE_OBSERVATION_SERIES_DATE: contract.trading_date,
    TURE_OBSERVATION_SERIES_START_SLOT_UTC: contract.slots[0].slot_utc,
    TURE_OBSERVATION_SERIES_EXPIRES_AT_UTC: contract.expires_at_utc,
    TURE_OBSERVATION_SERIES_MAX_ATTEMPTS: String(contract.max_attempts),
    TURE_OBSERVATION_SERIES_MAX_PROVIDER_CREDITS: String(
      contract.max_total_provider_credits,
    ),
    ...overrides,
  };
}

function emptyDatabaseDecision() {
  const control =
    scannerProviderCreditAllocationExpectedObservationSeriesControl();
  const readback = observationSeriesActivationPreflightReadbackFromUnknown(
    {
      preflight_version: "observation_series_activation_preflight_v1",
      trading_date: contract.trading_date,
      starts_at_utc: contract.slots[0].slot_utc,
      expires_at_utc: contract.expires_at_utc,
      available_slot_count: 15,
      requested_max_attempts: contract.max_attempts,
      requested_max_provider_credits: contract.max_total_provider_credits,
      total_reservation_count: 0,
      total_reserved_credits: 0,
      normal_scan_reservation_count: 0,
      normal_scan_reserved_credits: 0,
      catalog_observation_reservation_count: 0,
      catalog_observation_reserved_credits: 0,
      active_reservation_count: 0,
      active_reserved_credits: 0,
      terminal_reservation_count: 0,
      terminal_reserved_credits: 0,
      window_reservation_count: 0,
      window_reserved_credits: 0,
      minimum_declared_daily_credit_budget: null,
      maximum_declared_daily_credit_budget: null,
      minimum_declared_per_minute_credit_budget: null,
      maximum_declared_per_minute_credit_budget: null,
      daily_scheduled_attempt_count: 0,
      window_scheduled_attempt_count: 0,
      window_distinct_attempt_slot_count: 0,
      window_duplicate_attempt_slot_count: 0,
      unresolved_scheduled_attempt_count: 0,
      unattributed_scheduled_attempt_count: 0,
    },
    control,
  );
  return evaluateObservationSeriesActivationDatabasePreflight(readback);
}

test("freezes the exact six-slot switchback series control", () => {
  const control =
    scannerProviderCreditAllocationExpectedObservationSeriesControl();
  expect(control).toMatchObject({
    status: "ready",
    trading_date: "2026-10-01",
    starts_at_utc: "2026-10-01T13:45:00.000Z",
    expires_at_utc: "2026-10-01T17:30:00.000Z",
    max_attempts: 6,
    max_provider_credits: 48,
  });
  expect(contract.slots).toHaveLength(6);
  expect(new Set(contract.slots.map((slot) => slot.slot_utc)).size).toBe(6);
});

test("scheduler admission permits only declared slots on the exact revision", () => {
  const control =
    scannerProviderCreditAllocationActivationControlFromEnvironment(
      environment(activationValues()),
    );
  expect(control).toMatchObject({
    requested: true,
    status: "ready",
    expected_revision: revision,
  });

  for (const slot of contract.slots) {
    expect(
      buildScannerProviderCreditAllocationScheduledSlotAdmission({
        control,
        scheduledSlotUtc: slot.slot_utc,
        now: new Date(Date.parse(slot.slot_utc) + 30_000),
        deployedRevision: revision,
      }),
    ).toMatchObject({
      decision: "eligible",
      status: "eligible",
      scheduled_slot_utc: slot.slot_utc,
    });
  }

  expect(
    buildScannerProviderCreditAllocationScheduledSlotAdmission({
      control,
      scheduledSlotUtc: "2026-10-01T14:15:00.000Z",
      now: new Date("2026-10-01T14:15:30.000Z"),
      deployedRevision: revision,
    }),
  ).toMatchObject({ decision: "no_request", status: "slot_not_declared" });
  expect(
    buildScannerProviderCreditAllocationScheduledSlotAdmission({
      control,
      scheduledSlotUtc: contract.slots[0].slot_utc,
      now: new Date("2026-10-01T13:45:30.000Z"),
      deployedRevision: "b".repeat(40),
    }),
  ).toMatchObject({
    decision: "reject",
    status: "runtime_admission_rejected",
    reason_codes: expect.arrayContaining([
      "live_allocation_experiment_revision_mismatch",
    ]),
  });
});

test("activation control rejects any experiment or observation-series drift", () => {
  for (const values of [
    activationValues({
      [SCANNER_PROVIDER_CREDIT_ALLOCATION_EXPERIMENT_ID_ENV]: "different",
    }),
    activationValues({
      [SCANNER_PROVIDER_CREDIT_ALLOCATION_EXPERIMENT_EXPECTED_REVISION_ENV]:
        "invalid",
    }),
    activationValues({
      [SCANNER_PROVIDER_CREDIT_ALLOCATION_EXPERIMENT_ENABLED_ENV]: "false",
    }),
    activationValues({ TURE_OBSERVATION_SERIES_MAX_ATTEMPTS: "5" }),
    activationValues({
      TURE_OBSERVATION_SERIES_START_SLOT_UTC:
        "2026-10-01T14:00:00.000Z",
    }),
  ]) {
    expect(
      scannerProviderCreditAllocationActivationControlFromEnvironment(
        environment(values),
      ),
    ).toMatchObject({ requested: true, status: "invalid" });
  }
});

test("scheduled function keeps gap slots and invalid activation inert before I/O", async () => {
  const originalNetlify = Object.getOwnPropertyDescriptor(globalThis, "Netlify");
  const originalFetch = globalThis.fetch;
  let values: Record<string, string | undefined> = {};
  let fetchCount = 0;
  try {
    Object.defineProperty(globalThis, "Netlify", {
      configurable: true,
      value: { env: { get: (name: string) => values[name] } },
    });
    globalThis.fetch = async () => {
      fetchCount += 1;
      return new Response("unexpected", { status: 500 });
    };
    const safeRuntime = {
      ...activationValues(),
      TURE_DISABLE_SCHEDULED_FUNCTIONS: "true",
      TURE_BASIC_FREE_CATALOG_CAPABILITY_PROBE_ENABLED: "false",
      TURE_BASIC_FREE_CATALOG_OBSERVATION_ONE_SHOT_ENABLED: "false",
      TURE_OUTCOME_EVALUATION_ONE_SHOT_ENABLED: "false",
      TURE_OUTCOME_EVALUATION_SERIES_ENABLED: "false",
      TURE_INTERNAL_PAPER_WORKER_ENABLED: "false",
    };
    values = safeRuntime;
    const gapResponse = await withFixedDate(
      "2026-10-01T14:15:20.000Z",
      () =>
        scheduledScanHandler(
          new Request("https://scheduled.example", {
            method: "POST",
            body: JSON.stringify({ next_run: "2026-10-01T14:30:00.000Z" }),
          }),
          {} as Parameters<typeof scheduledScanHandler>[1],
        ),
    );
    expect(gapResponse.status).toBe(204);

    values = {
      ...safeRuntime,
      TURE_OBSERVATION_SERIES_MAX_PROVIDER_CREDITS: "40",
    };
    const invalidResponse = await withFixedDate(
      "2026-10-01T13:45:20.000Z",
      () =>
        scheduledScanHandler(
          new Request("https://scheduled.example", {
            method: "POST",
            body: JSON.stringify({ next_run: "2026-10-01T14:00:00.000Z" }),
          }),
          {} as Parameters<typeof scheduledScanHandler>[1],
        ),
    );
    expect(invalidResponse.status).toBe(503);
    expect(fetchCount).toBe(0);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalNetlify) {
      Object.defineProperty(globalThis, "Netlify", originalNetlify);
    } else {
      Reflect.deleteProperty(globalThis, "Netlify");
    }
  }
});

test("read-only manifest binds build, budget, complete window and inert authority", () => {
  const safeEnvironment = {
    TURE_DISABLE_SCHEDULED_FUNCTIONS: "true",
    TWELVE_DATA_PLAN_MODE: "free",
    NEXT_PUBLIC_TWELVE_DATA_PLAN_MODE: "free",
    TURE_BASIC_FREE_CATALOG_DAILY_CREDIT_BUDGET: "800",
    TURE_BASIC_FREE_CATALOG_PER_MINUTE_CREDIT_BUDGET: "8",
  };
  const buildIdentity = {
    deploy_id: "a".repeat(24),
    deploy_context: "production" as const,
    commit_ref: revision,
    site_id: "2b582e03-ac97-4371-8051-558d9980fb94",
  };
  const manifest = buildScannerProviderCreditAllocationActivationManifest({
    database_preflight: emptyDatabaseDecision(),
    environment: scannerProviderCreditAllocationActivationEnvironmentFrom(
      environment(safeEnvironment),
    ),
    build_identity: buildIdentity,
    now: new Date("2026-10-01T13:30:00.000Z"),
  });
  expect(manifest).toMatchObject({
    status: "ready",
    valid_until: "2026-10-01T13:35:00.000Z",
    build_identity: { commit_ref: revision },
    activation_configuration: {
      experiment_enabled: true,
      experiment_id: contract.experiment_id,
      experiment_expected_revision: revision,
      observation_series_enabled: true,
      observation_series_max_attempts: 6,
      observation_series_max_provider_credits: 48,
    },
    authority: {
      mutates_configuration: false,
      arms_scheduler: false,
      calls_provider: false,
      reserves_provider_credits: false,
      changes_ranking: false,
      publishes_candidate: false,
      executes_paper_trade: false,
      executes_broker_order: false,
    },
  });

  const staleConfigurations: Array<Record<string, string>> = [
    { [SCANNER_PROVIDER_CREDIT_ALLOCATION_EXPERIMENT_ENABLED_ENV]: "true" },
    {
      [SCANNER_PROVIDER_CREDIT_ALLOCATION_EXPERIMENT_ID_ENV]:
        contract.experiment_id,
    },
    {
      [SCANNER_PROVIDER_CREDIT_ALLOCATION_EXPERIMENT_EXPECTED_REVISION_ENV]:
        revision,
    },
  ];
  for (const change of staleConfigurations) {
    expect(
      buildScannerProviderCreditAllocationActivationManifest({
        database_preflight: emptyDatabaseDecision(),
        environment: scannerProviderCreditAllocationActivationEnvironmentFrom(
          environment({ ...safeEnvironment, ...change }),
        ),
        build_identity: buildIdentity,
        now: new Date("2026-10-01T13:30:00.000Z"),
      }),
    ).toMatchObject({ status: "blocked" });
  }
});

test("scheduled runtime and authenticated route preserve the closed boundary", () => {
  const scheduledSource = readFileSync(
    resolve(process.cwd(), "netlify/functions/scheduled-scan.ts"),
    "utf8",
  );
  const routeSource = readFileSync(
    resolve(
      process.cwd(),
      "app/api/app/scanner-provider-credit-allocation-activation-preflight/route.ts",
    ),
    "utf8",
  );

  expect(scheduledSource).toContain(
    "scannerProviderCreditAllocationActivationControlFromEnvironment",
  );
  expect(scheduledSource).toContain(
    "buildScannerProviderCreditAllocationScheduledSlotAdmission",
  );
  expect(scheduledSource).toContain(
    "Provider-credit allocation experiment slot is not declared.",
  );
  expect(routeSource).toContain("requireApplicationSession");
  expect(routeSource).toContain("export async function GET");
  expect(routeSource).not.toContain("export async function POST");
  expect(routeSource).toContain('"Cache-Control": "no-store"');
  expect(routeSource).toContain("readObservationSeriesActivationPreflight");
  expect(routeSource).toContain(
    "@/lib/generated/scheduled-scan-deployment-identity.json",
  );
});
