import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { expect, test } from "@playwright/test";
import { buildSync } from "esbuild";

import {
  createBasicFreeDiscoveryCreditReservationStore,
  type BasicFreeDiscoveryCreditReservationDatabase,
} from "@/lib/basic-free-discovery-credit-reservation-store";

const now = new Date("2026-09-15T15:30:00.000Z");
const ownerUserId = "7d2e0f9a-43db-4f62-9a78-aec2ae34c6d0";
const executionFingerprint = "scheduled_scan_attempt_20260915_1530";
const migrationPath =
  "supabase/migrations/20260915222537_basic_free_discovery_credit_reservations.sql";
const dailyClaimMigrationPath =
  "supabase/migrations/20260917135646_if2_basic_free_daily_observation_claim.sql";

function read(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

async function loadBasicFreeDiscoveryRuntime() {
  const directory = mkdtempSync(resolve(tmpdir(), "ture-basic-free-discovery-"));
  const output = resolve(directory, "basic-free-discovery.cjs");
  buildSync({
    entryPoints: [resolve(process.cwd(), "lib/basic-free-discovery.ts")],
    outfile: output,
    bundle: true,
    platform: "node",
    format: "cjs",
    conditions: ["react-server"],
  });
  const runtimeModule = (await import(pathToFileURL(output).href)) as {
    observeBasicFreeCatalog: (input: Record<string, unknown>) => Promise<{
      summary: {
        admission: Record<string, unknown>;
        attempt: Record<string, unknown>;
        credit_reservation: Record<string, unknown>;
        catalog: Record<string, unknown>;
        gaps: string[];
      };
    }>;
  };
  return {
    observe: runtimeModule.observeBasicFreeCatalog,
    dispose() {
      rmSync(directory, { recursive: true, force: true });
    },
  };
}

function discoveryInput() {
  return {
    scanWindow: "opening",
    runtimeEnabled: true,
    ownerUserId,
    executionFingerprint,
    now,
    env: {
      TWELVE_DATA_PLAN_MODE: "free",
      TURE_BASIC_FREE_CATALOG_OBSERVATION_ENABLED: "true",
      TURE_BASIC_FREE_CATALOG_DAILY_CREDIT_BUDGET: "800",
      TURE_BASIC_FREE_CATALOG_PER_MINUTE_CREDIT_BUDGET: "8",
    },
  };
}

function allowedLifecycle() {
  const calls = { prepared: 0, finalized: 0 };
  return {
    calls,
    lifecycle: {
      async prepare() {
        calls.prepared += 1;
        return {
          status: "provider_execution_allowed" as const,
          provider_execution_allowed: true,
          claim_id: "basic_free_discovery_claim_20260915_deadbeef",
          idempotent: false,
          daily_reserved_credits: 1,
          daily_remaining_credits: 799,
          minute_reserved_credits: 1,
          minute_remaining_credits: 7,
          safe_blocker: null,
        };
      },
      async finalize() {
        calls.finalized += 1;
        return {
          status: "finalized" as const,
          finalization_proven: true,
          safe_blocker: null,
        };
      },
    },
  };
}

function stockRecord(symbol = "NEWM") {
  return {
    symbol,
    name: "New Market, Inc.",
    currency: "USD",
    exchange: "NASDAQ",
    mic_code: "XNAS",
    country: "United States",
    type: "Common Stock",
  };
}

test("Basic catalog observation enters the provider only after one durable reservation", async () => {
  const runtime = await loadBasicFreeDiscoveryRuntime();
  const fixture = allowedLifecycle();
  let providerCalls = 0;

  try {
    const result = await runtime.observe({
      ...discoveryInput(),
      creditReservation: fixture.lifecycle,
      fetchCatalogPage: async () => {
        providerCalls += 1;
        return {
          fetched_at: now.toISOString(),
          provider_catalog_count: 4200,
          records: [stockRecord()],
        };
      },
    });

    expect(providerCalls).toBe(1);
    expect(fixture.calls).toEqual({ prepared: 1, finalized: 1 });
    expect(result.summary.attempt).toEqual({
      attempted_at: now.toISOString(),
      outcome: "available",
      provider_response_observed: true,
    });
    expect(result.summary.credit_reservation).toMatchObject({
      status: "provider_execution_allowed",
      daily_reserved_credits: 1,
      daily_remaining_credits: 799,
      minute_reserved_credits: 1,
      minute_remaining_credits: 7,
      finalization_status: "finalized",
      finalization_proven: true,
    });
    expect(result.summary.catalog).toMatchObject({
      observed_record_count: 1,
      provider_catalog_count: 4200,
      collection_complete: false,
      discovery_feed_allowed: false,
    });
    expect(result.summary.gaps).toContain(
      "catalog_observation_is_not_candidate_discovery",
    );
  } finally {
    runtime.dispose();
  }
});

test("a quota or missing explicit enablement prevents the provider request", async () => {
  const runtime = await loadBasicFreeDiscoveryRuntime();
  let providerCalls = 0;
  try {
    const quotaBlocked = await runtime.observe({
      ...discoveryInput(),
      creditReservation: {
        async prepare() {
          return {
            status: "per_minute_credit_limit_reached" as const,
            provider_execution_allowed: false,
            claim_id: null,
            idempotent: false,
            daily_reserved_credits: 2,
            daily_remaining_credits: 798,
            minute_reserved_credits: 8,
            minute_remaining_credits: 0,
            safe_blocker: "per_minute_credit_limit_reached",
          };
        },
        async finalize() {
          throw new Error("must not finalize an unstarted attempt");
        },
      },
      fetchCatalogPage: async () => {
        providerCalls += 1;
        throw new Error("provider must not be called");
      },
    });
    const disabled = await runtime.observe({
      ...discoveryInput(),
      runtimeEnabled: false,
      fetchCatalogPage: async () => {
        providerCalls += 1;
        throw new Error("provider must not be called");
      },
    });

    expect(providerCalls).toBe(0);
    expect(quotaBlocked.summary.admission).toMatchObject({
      status: "per_minute_credit_limit_reached",
      safe_to_request_catalog: false,
      reason_codes: ["per_minute_credit_limit_reached"],
    });
    expect(disabled.summary.admission).toMatchObject({
      status: "disabled",
      safe_to_request_catalog: false,
      reason_codes: ["runtime_disabled"],
    });
  } finally {
    runtime.dispose();
  }
});

test("a prior daily catalog claim blocks a new provider request even without a terminal receipt", async () => {
  const runtime = await loadBasicFreeDiscoveryRuntime();
  let providerCalls = 0;
  try {
    const result = await runtime.observe({
      ...discoveryInput(),
      creditReservation: {
        async prepare() {
          return {
            status: "daily_catalog_observation_already_claimed" as const,
            provider_execution_allowed: false,
            claim_id: null,
            idempotent: false,
            daily_reserved_credits: 1,
            daily_remaining_credits: 799,
            minute_reserved_credits: 1,
            minute_remaining_credits: 7,
            safe_blocker: "daily_catalog_observation_already_claimed",
          };
        },
        async finalize() {
          throw new Error("must not finalize an unstarted attempt");
        },
      },
      fetchCatalogPage: async () => {
        providerCalls += 1;
        throw new Error("provider must not be called");
      },
    });

    expect(providerCalls).toBe(0);
    expect(result.summary.admission).toMatchObject({
      status: "refresh_interval_active",
      safe_to_request_catalog: false,
      reason_codes: ["daily_catalog_observation_already_claimed"],
    });
    expect(result.summary.credit_reservation).toMatchObject({
      status: "daily_catalog_observation_already_claimed",
      finalization_status: "not_started",
    });
    expect(result.summary.gaps).toContain(
      "daily_catalog_observation_already_claimed",
    );
  } finally {
    runtime.dispose();
  }
});

test("store accepts only an exact durable claim and preserves both budget dimensions", async () => {
  const database: BasicFreeDiscoveryCreditReservationDatabase = {
    async claim() {
      return {
        data: {
          claim_status: "claimed",
          claim_id: "claim-1",
          reservation_status: "claimed",
          idempotent: false,
          daily_reserved_credits: 1,
          daily_remaining_credits: 799,
          minute_reserved_credits: 1,
          minute_remaining_credits: 7,
          blocker: null,
        },
        error: null,
      };
    },
    async beginAttempt() {
      return {
        data: {
          attempt_status: "attempt_started",
          claim_id: "claim-1",
          reservation_status: "attempted",
          blocker: null,
        },
        error: null,
      };
    },
    async finalize() {
      return {
        data: {
          finalization_status: "finalized",
          claim_id: "claim-1",
          reservation_status: "completed",
          blocker: null,
        },
        error: null,
      };
    },
  };
  const store = createBasicFreeDiscoveryCreditReservationStore(database);
  const prepared = await store.prepare({
    claim_id: "claim-1",
    execution_fingerprint: executionFingerprint,
    owner_user_id: ownerUserId,
    trading_date: "2026-09-15",
    minute_bucket: now.toISOString(),
    catalog_observation: true,
    requested_credits: 1,
    declared_daily_credit_budget: 800,
    declared_per_minute_credit_budget: 8,
  });

  expect(prepared).toMatchObject({
    status: "provider_execution_allowed",
    provider_execution_allowed: true,
    claim_id: "claim-1",
  });
  expect(
    await store.finalize({
      claim_id: "claim-1",
      execution_fingerprint: executionFingerprint,
      status: "completed",
      finalized_at: now.toISOString(),
    }),
  ).toMatchObject({ status: "finalized", finalization_proven: true });
});

test("store denies a daily catalog claim before beginning a provider attempt", async () => {
  let beginCalls = 0;
  const store = createBasicFreeDiscoveryCreditReservationStore({
    async claim() {
      return {
        data: {
          claim_status: "daily_catalog_observation_already_claimed",
          claim_id: null,
          reservation_status: null,
          idempotent: false,
          daily_reserved_credits: 1,
          daily_remaining_credits: 799,
          minute_reserved_credits: 1,
          minute_remaining_credits: 7,
          blocker: "daily_catalog_observation_already_claimed",
        },
        error: null,
      };
    },
    async beginAttempt() {
      beginCalls += 1;
      throw new Error("must not begin a blocked provider attempt");
    },
    async finalize() {
      throw new Error("must not finalize a blocked provider attempt");
    },
  });

  await expect(
    store.prepare({
      claim_id: "claim-2",
      execution_fingerprint: "scheduled_scan_attempt_20260915_1545",
      owner_user_id: ownerUserId,
      trading_date: "2026-09-15",
      minute_bucket: now.toISOString(),
      catalog_observation: true,
      requested_credits: 1,
      declared_daily_credit_budget: 800,
      declared_per_minute_credit_budget: 8,
    }),
  ).resolves.toMatchObject({
    status: "daily_catalog_observation_already_claimed",
    provider_execution_allowed: false,
  });
  expect(beginCalls).toBe(0);
});

test("migration locks and retains Basic Free reservations under server-only access", () => {
  const migration = read(migrationPath);

  expect(migration).toContain("execution_fingerprint text not null unique");
  expect(migration).toContain("minute_bucket timestamptz not null");
  expect(migration).toContain("pg_advisory_xact_lock");
  expect(migration).toContain("daily_credit_budget_changed");
  expect(migration).toContain("per_minute_credit_budget_changed");
  expect(migration).toContain("and reservation.status = 'claimed'");
  expect(migration).toContain("provider_attempted = true");
  expect(migration).toContain("enable row level security");
  expect(migration).toContain(
    "revoke all on table public.basic_free_discovery_credit_reservations",
  );
  expect(migration).toContain(
    "grant execute on function public.claim_basic_free_discovery_credit_reservation",
  );
  expect(migration).toContain("to service_role");
  expect(migration).not.toContain(
    "delete from public.basic_free_discovery_credit_reservations",
  );
});

test("daily catalog claim migration preserves normal scan capacity and fails closed", () => {
  const migration = read(dailyClaimMigrationPath);

  expect(migration).toContain("catalog_observation boolean not null default false");
  expect(migration).toContain("where catalog_observation;");
  expect(migration).toContain("p_catalog_observation boolean");
  expect(migration).toContain("daily_catalog_observation_already_claimed");
  expect(migration).toContain("pg_advisory_xact_lock");
  expect(migration).toContain("to service_role");
  expect(migration).not.toContain(
    "delete from public.basic_free_discovery_credit_reservations",
  );
});
