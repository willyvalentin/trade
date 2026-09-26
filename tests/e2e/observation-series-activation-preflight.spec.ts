import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { expect, test } from "@playwright/test";
import { buildSync } from "esbuild";

const migrationPath =
  "supabase/migrations/20260926163715_a2_observation_series_activation_preflight.sql";

const control = {
  control_version: "observation_series_control_v1",
  requested: true,
  status: "ready",
  series_id: "observation_series_1234567890abcdef",
  trading_date: "2026-09-28",
  starts_at_utc: "2026-09-28T13:30:00.000Z",
  expires_at_utc: "2026-09-28T14:30:00.000Z",
  max_attempts: 4,
  max_provider_credits: 24,
  stop_on_publication: true,
  max_consecutive_failures: 3,
  reason_codes: ["observation_series_ready"],
  authority: {
    arms_scheduler: false,
    calls_provider: false,
    reserves_provider_credits: false,
    changes_ranking: false,
    publishes_candidate: false,
    executes_broker_order: false,
  },
} as const;

function validSnapshot() {
  return {
    preflight_version: "observation_series_activation_preflight_v1",
    trading_date: control.trading_date,
    starts_at_utc: control.starts_at_utc,
    expires_at_utc: control.expires_at_utc,
    available_slot_count: 4,
    requested_max_attempts: control.max_attempts,
    requested_max_provider_credits: control.max_provider_credits,
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
  };
}

async function loadRuntime() {
  const directory = mkdtempSync(resolve(tmpdir(), "ture-series-preflight-"));
  const output = resolve(directory, "series-preflight.cjs");
  buildSync({
    entryPoints: [
      resolve(process.cwd(), "lib/observation-series-activation-preflight.ts"),
    ],
    outfile: output,
    bundle: true,
    platform: "node",
    format: "cjs",
  });
  const runtime = (await import(pathToFileURL(output).href)) as {
    observationSeriesActivationPreflightReadbackFromUnknown: (
      value: unknown,
      expectedControl: typeof control,
    ) => Record<string, unknown>;
    evaluateObservationSeriesActivationDatabasePreflight: (
      readback: Record<string, unknown>,
    ) => Record<string, unknown>;
    buildObservationSeriesActivationManifest: (input: Record<string, unknown>) =>
      Record<string, unknown>;
    observationSeriesActivationEnvironmentFrom: (environment: {
      get(name: string): string | undefined;
    }) => Record<string, unknown>;
    observationSeriesActivationBuildIdentityFrom: (environment: {
      get(name: string): string | undefined;
    }) => Record<string, unknown> | null;
    observationSeriesActivationBuildIdentityFromUnknown: (
      value: unknown,
    ) => Record<string, unknown> | null;
  };
  return {
    ...runtime,
    dispose() {
      rmSync(directory, { recursive: true, force: true });
    },
  };
}

function environment(values: Record<string, string>) {
  return { get: (name: string) => values[name] };
}

const buildEnvironment = {
  CONTEXT: "production",
  DEPLOY_ID: "6ab7f287a62d650008bd2e4a",
  COMMIT_REF: "b7980ac2eb3ff6c7c9d120f9b593882a789d49f6",
  SITE_ID: "2b582e03-ac97-4371-8051-558d9980fb94",
};

const packagedBuildIdentity = {
  schema_version: "scheduled_scan_deployment_identity_v1",
  deploy_id: buildEnvironment.DEPLOY_ID,
  deploy_context: buildEnvironment.CONTEXT,
  commit_ref: buildEnvironment.COMMIT_REF,
  site_id: buildEnvironment.SITE_ID,
};

test("series activation preflight admits one coherent empty window", async () => {
  const runtime = await loadRuntime();
  try {
    const readback =
      runtime.observationSeriesActivationPreflightReadbackFromUnknown(
        validSnapshot(),
        control,
      );
    expect(readback).toMatchObject({
      status: "available",
      snapshot: {
        available_slot_count: 4,
        requested_max_attempts: 4,
        requested_max_provider_credits: 24,
      },
    });
    expect(
      runtime.evaluateObservationSeriesActivationDatabasePreflight(readback),
    ).toEqual({ status: "ready", readback, reason_codes: [] });
  } finally {
    runtime.dispose();
  }
});

test("series activation preflight blocks overlap, unresolved lineage, and insufficient whole-series budget", async () => {
  const runtime = await loadRuntime();
  try {
    for (const [change, reason] of [
      [
        {
          daily_scheduled_attempt_count: 1,
          window_scheduled_attempt_count: 1,
          window_distinct_attempt_slot_count: 1,
        },
        "series_window_attempt_already_exists",
      ],
      [
        {
          daily_scheduled_attempt_count: 1,
          unresolved_scheduled_attempt_count: 1,
        },
        "unresolved_scheduled_attempt_exists",
      ],
      [
        {
          daily_scheduled_attempt_count: 1,
          unattributed_scheduled_attempt_count: 1,
        },
        "unattributed_scheduled_attempt_exists",
      ],
      [
        {
          total_reservation_count: 98,
          total_reserved_credits: 784,
          normal_scan_reservation_count: 98,
          normal_scan_reserved_credits: 784,
          terminal_reservation_count: 98,
          terminal_reserved_credits: 784,
          minimum_declared_daily_credit_budget: 800,
          maximum_declared_daily_credit_budget: 800,
          minimum_declared_per_minute_credit_budget: 8,
          maximum_declared_per_minute_credit_budget: 8,
        },
        "series_daily_credit_capacity_unavailable",
      ],
    ] as const) {
      const readback =
        runtime.observationSeriesActivationPreflightReadbackFromUnknown(
          { ...validSnapshot(), ...change },
          control,
        );
      expect(readback).toMatchObject({ status: "available" });
      expect(
        runtime.evaluateObservationSeriesActivationDatabasePreflight(readback),
      ).toMatchObject({
        status: "blocked",
        reason_codes: expect.arrayContaining([reason]),
      });
    }
  } finally {
    runtime.dispose();
  }
});

test("series activation readback rejects mismatched or incoherent aggregates", async () => {
  const runtime = await loadRuntime();
  try {
    for (const snapshot of [
      { ...validSnapshot(), starts_at_utc: "2026-09-28T13:45:00.000Z" },
      { ...validSnapshot(), available_slot_count: 3 },
      { ...validSnapshot(), requested_max_provider_credits: 16 },
      {
        ...validSnapshot(),
        daily_scheduled_attempt_count: 1,
        window_scheduled_attempt_count: 1,
        window_distinct_attempt_slot_count: 0,
        window_duplicate_attempt_slot_count: 0,
      },
      {
        ...validSnapshot(),
        daily_scheduled_attempt_count: 1,
        unresolved_scheduled_attempt_count: 2,
      },
      {
        ...validSnapshot(),
        daily_scheduled_attempt_count: 1,
        unattributed_scheduled_attempt_count: 2,
      },
      {
        ...validSnapshot(),
        available_slot_count: 4,
        daily_scheduled_attempt_count: 5,
        window_scheduled_attempt_count: 5,
        window_distinct_attempt_slot_count: 5,
      },
      {
        ...validSnapshot(),
        total_reservation_count: 1,
        total_reserved_credits: 8,
        normal_scan_reservation_count: 1,
        normal_scan_reserved_credits: 8,
        terminal_reservation_count: 1,
        terminal_reserved_credits: 8,
      },
      null,
    ]) {
      expect(
        runtime.observationSeriesActivationPreflightReadbackFromUnknown(
          snapshot,
          control,
        ),
      ).toEqual({
        status: "unavailable",
        reason_codes: ["observation_series_activation_preflight_invalid"],
      });
    }
  } finally {
    runtime.dispose();
  }
});

test("activation manifest is short-lived, build-bound, and inert", async () => {
  const runtime = await loadRuntime();
  try {
    const readback =
      runtime.observationSeriesActivationPreflightReadbackFromUnknown(
        validSnapshot(),
        control,
      );
    const databasePreflight =
      runtime.evaluateObservationSeriesActivationDatabasePreflight(readback);
    const safeEnvironment = {
      ...buildEnvironment,
      TURE_DISABLE_SCHEDULED_FUNCTIONS: "true",
      TWELVE_DATA_PLAN_MODE: "free",
      NEXT_PUBLIC_TWELVE_DATA_PLAN_MODE: "free",
      TURE_BASIC_FREE_CATALOG_DAILY_CREDIT_BUDGET: "800",
      TURE_BASIC_FREE_CATALOG_PER_MINUTE_CREDIT_BUDGET: "8",
    };
    const manifest = runtime.buildObservationSeriesActivationManifest({
      control,
      database_preflight: databasePreflight,
      environment: runtime.observationSeriesActivationEnvironmentFrom(
        environment(safeEnvironment),
      ),
      build_identity: runtime.observationSeriesActivationBuildIdentityFrom(
        environment(safeEnvironment),
      ),
      now: new Date("2026-09-28T13:20:00.000Z"),
    });
    expect(manifest).toMatchObject({
      status: "ready",
      evaluated_at: "2026-09-28T13:20:00.000Z",
      valid_until: "2026-09-28T13:25:00.000Z",
      build_identity: {
        commit_ref: buildEnvironment.COMMIT_REF,
        deploy_id: buildEnvironment.DEPLOY_ID,
      },
      authority: {
        mutates_configuration: false,
        arms_scheduler: false,
        calls_provider: false,
        reserves_provider_credits: false,
        publishes_candidate: false,
        executes_paper_trade: false,
        executes_broker_order: false,
      },
    });

    for (const [change, reason] of [
      [
        { TURE_DISABLE_SCHEDULED_FUNCTIONS: "false" },
        "global_scheduler_not_disabled",
      ],
      [
        { TURE_BASIC_FREE_CATALOG_OBSERVATION_ONE_SHOT_ENABLED: "true" },
        "catalog_observation_one_shot_enabled",
      ],
      [
        { TURE_OBSERVATION_SERIES_ENABLED: "true" },
        "observation_series_already_enabled",
      ],
      [
        { TWELVE_DATA_PLAN_MODE: "grow" },
        "basic_free_provider_plan_unavailable",
      ],
      [
        { NEXT_PUBLIC_TWELVE_DATA_PLAN_MODE: "grow" },
        "provider_plan_mode_mismatch",
      ],
      [
        { TURE_BASIC_FREE_CATALOG_DAILY_CREDIT_BUDGET: "799" },
        "basic_free_daily_credit_budget_invalid",
      ],
      [
        { TURE_BASIC_FREE_CATALOG_DAILY_CREDIT_BUDGET: "8e2" },
        "basic_free_daily_credit_budget_invalid",
      ],
      [
        { TURE_BASIC_FREE_CATALOG_PER_MINUTE_CREDIT_BUDGET: "7" },
        "basic_free_per_minute_credit_budget_invalid",
      ],
    ] as const) {
      const unsafe = { ...safeEnvironment, ...change };
      const blocked = runtime.buildObservationSeriesActivationManifest({
        control,
        database_preflight: databasePreflight,
        environment: runtime.observationSeriesActivationEnvironmentFrom(
          environment(unsafe),
        ),
        build_identity: runtime.observationSeriesActivationBuildIdentityFrom(
          environment(unsafe),
        ),
        now: new Date("2026-09-28T13:20:00.000Z"),
      });
      expect(blocked).toMatchObject({
        status: "blocked",
        reason_codes: expect.arrayContaining([reason]),
      });
    }

    expect(
      runtime.buildObservationSeriesActivationManifest({
        control,
        database_preflight: databasePreflight,
        environment: runtime.observationSeriesActivationEnvironmentFrom(
          environment(safeEnvironment),
        ),
        build_identity: null,
        now: new Date("2026-09-28T13:20:00.000Z"),
      }),
    ).toMatchObject({
      status: "unavailable",
      reason_codes: expect.arrayContaining([
        "production_build_identity_unavailable",
      ]),
    });

    expect(
      runtime.observationSeriesActivationBuildIdentityFromUnknown(
        packagedBuildIdentity,
      ),
    ).toEqual({
      deploy_id: buildEnvironment.DEPLOY_ID,
      deploy_context: "production",
      commit_ref: buildEnvironment.COMMIT_REF,
      site_id: buildEnvironment.SITE_ID,
    });
    expect(
      runtime.observationSeriesActivationBuildIdentityFromUnknown({
        ...packagedBuildIdentity,
        schema_version: "unknown",
      }),
    ).toBeNull();

    expect(
      runtime.buildObservationSeriesActivationManifest({
        control,
        database_preflight: databasePreflight,
        environment: runtime.observationSeriesActivationEnvironmentFrom(
          environment(safeEnvironment),
        ),
        build_identity:
          runtime.observationSeriesActivationBuildIdentityFromUnknown(
            packagedBuildIdentity,
          ),
        now: new Date("2026-09-28T13:25:00.000Z"),
      }),
    ).toMatchObject({
      status: "blocked",
      reason_codes: expect.arrayContaining([
        "activation_manifest_not_valid_before_series_start",
      ]),
    });
  } finally {
    runtime.dispose();
  }
});

test("SQL and authenticated GET route preserve aggregate-only authority", () => {
  const migration = readFileSync(resolve(process.cwd(), migrationPath), "utf8");
  const route = readFileSync(
    resolve(
      process.cwd(),
      "app/api/app/observation-series-activation-preflight/route.ts",
    ),
    "utf8",
  );
  const adapter = readFileSync(
    resolve(
      process.cwd(),
      "lib/server/observation-series-activation-preflight-readback.ts",
    ),
    "utf8",
  );

  expect(migration).toContain("language sql");
  expect(migration).toContain("stable");
  expect(migration).toContain("security definer");
  expect(migration).toContain("set search_path = pg_catalog, public");
  expect(migration).toContain("date_bin(");
  expect(migration).toContain("America/New_York");
  expect(migration).toContain("count(attempt_fingerprint)");
  expect(migration).toContain(
    "revoke all on function public.read_basic_free_observation_series_preflight_v1",
  );
  expect(migration).toContain("from public, anon, authenticated;");
  expect(migration).toContain(
    "grant execute on function public.read_basic_free_observation_series_preflight_v1",
  );
  expect(migration).toContain("to service_role;");
  expect(migration).not.toMatch(/\b(insert|update|delete)\s+(into|public\.)/i);
  expect(route).toContain("requireApplicationSession");
  expect(route).toContain("export async function GET");
  expect(route).not.toContain("export async function POST");
  expect(route).toContain('"Cache-Control": "no-store"');
  expect(route).toContain("readObservationSeriesActivationPreflight");
  expect(route).toContain(
    "@/lib/generated/scheduled-scan-deployment-identity.json",
  );
  expect(route).toContain("observationSeriesActivationBuildIdentityFromUnknown");
  expect(adapter).toContain("observationSeriesActivationPreflightRpcName");
  expect(adapter).not.toContain(".from(");
});
