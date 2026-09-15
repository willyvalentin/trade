import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";

import { expect, test } from "@playwright/test";
import { buildSync } from "esbuild";

import {
  createMarketWideDiscoveryCreditReservationStore,
  type MarketWideDiscoveryCreditReservationDatabase,
} from "@/lib/market-wide-discovery-credit-reservation-store";

const now = new Date("2026-09-15T15:30:00.000Z");
const ownerUserId = "7d2e0f9a-43db-4f62-9a78-aec2ae34c6d0";
const executionFingerprint = "scheduled_scan_attempt_20260915_1530";
const migrationPath =
  "supabase/migrations/20260915162302_market_wide_discovery_credit_reservations.sql";

function read(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

async function loadMarketWideDiscoveryRuntime() {
  const directory = mkdtempSync(resolve(tmpdir(), "ture-market-wide-discovery-"));
  const output = resolve(directory, "market-wide-discovery.cjs");
  buildSync({
    entryPoints: [resolve(process.cwd(), "lib/market-wide-discovery.ts")],
    outfile: output,
    bundle: true,
    platform: "node",
    format: "cjs",
    conditions: ["react-server"],
  });
  const runtimeModule = (await import(pathToFileURL(output).href)) as {
    discoverMarketWideDiscovery: (input: Record<string, unknown>) => Promise<{
      summary: {
        attempt: Record<string, unknown>;
        admission: Record<string, unknown>;
        credit_reservation: Record<string, unknown>;
        gaps: string[];
      };
    }>;
  };
  return {
    discover: runtimeModule.discoverMarketWideDiscovery,
    dispose() {
      rmSync(directory, { recursive: true, force: true });
    },
  };
}

function allowedLifecycle(overrides: {
  finalization?: "finalized" | "reservation_unavailable";
} = {}) {
  const calls = { prepared: 0, finalized: 0 };
  return {
    calls,
    lifecycle: {
      async prepare() {
        calls.prepared += 1;
        return {
          status: "provider_execution_allowed" as const,
          provider_execution_allowed: true,
          claim_id: "market_wide_discovery_claim_20260915_deadbeef",
          idempotent: false,
          reserved_credits: 100,
          remaining_credits: 0,
          safe_blocker: null,
        };
      },
      async finalize() {
        calls.finalized += 1;
        return overrides.finalization === "reservation_unavailable"
          ? {
              status: "reservation_unavailable" as const,
              finalization_proven: false,
              safe_blocker: "daily_credit_reservation_unavailable",
            }
          : {
              status: "finalized" as const,
              finalization_proven: true,
              safe_blocker: null,
            };
      },
    },
  };
}

function discoveryInput() {
  return {
    scanWindow: "opening" as const,
    runtimeEnabled: true,
    ownerUserId,
    executionFingerprint,
    now,
    env: {
      TWELVE_DATA_PLAN_MODE: "pro",
      TURE_MARKET_WIDE_DISCOVERY_DAILY_CREDIT_BUDGET: "100",
    },
  };
}

test("market-wide discovery never enters the provider before an exact reservation begins", async () => {
  const runtime = await loadMarketWideDiscoveryRuntime();
  const fixture = allowedLifecycle();
  let providerCalls = 0;

  try {
    const result = await runtime.discover({
      ...discoveryInput(),
      creditReservation: fixture.lifecycle,
      fetchMarketMovers: async () => {
        providerCalls += 1;
        return {
          direction: "gainers",
          fetched_at: now.toISOString(),
          movers: [
            {
              symbol: "NEWM",
              name: "New Market, Inc.",
              rank: 1,
              last: 10,
              volume: 100,
              percent_change: 5,
            },
          ],
        };
      },
    });

    expect(providerCalls).toBe(1);
    expect(fixture.calls).toEqual({ prepared: 1, finalized: 1 });
    expect(result.summary.credit_reservation).toMatchObject({
      status: "provider_execution_allowed",
      trading_date: "2026-09-15",
      reserved_credits: 100,
      remaining_credits: 0,
      finalization_status: "finalized",
      finalization_proven: true,
    });
  } finally {
    runtime.dispose();
  }
});

test("a daily-cap or ambiguous reservation prevents a provider request", async () => {
  const runtime = await loadMarketWideDiscoveryRuntime();
  let providerCalls = 0;
  try {
    const result = await runtime.discover({
      ...discoveryInput(),
      creditReservation: {
        async prepare() {
          return {
            status: "daily_credit_limit_reached" as const,
            provider_execution_allowed: false,
            claim_id: null,
            idempotent: false,
            reserved_credits: 100,
            remaining_credits: 0,
            safe_blocker: "daily_credit_limit_reached",
          };
        },
        async finalize() {
          throw new Error("finalization must not run without a started attempt");
        },
      },
      fetchMarketMovers: async () => {
        providerCalls += 1;
        throw new Error("provider must not be called");
      },
    });

    expect(providerCalls).toBe(0);
    expect(result.summary.attempt).toEqual({
      attempted_at: null,
      outcome: "not_attempted",
      provider_response_observed: false,
    });
    expect(result.summary.admission).toMatchObject({
      status: "daily_credit_limit_reached",
      safe_to_request_dynamic_movers: false,
      reason_codes: ["daily_credit_limit_reached"],
    });
    expect(result.summary.credit_reservation.status).toBe(
      "daily_credit_limit_reached",
    );
  } finally {
    runtime.dispose();
  }
});

test("missing execution identity fails closed before a provider request", async () => {
  const runtime = await loadMarketWideDiscoveryRuntime();
  let providerCalls = 0;
  try {
    const result = await runtime.discover({
      ...discoveryInput(),
      executionFingerprint: null,
      fetchMarketMovers: async () => {
        providerCalls += 1;
        throw new Error("provider must not be called");
      },
    });

    expect(providerCalls).toBe(0);
    expect(result.summary.admission.reason_codes).toEqual([
      "daily_credit_reservation_unavailable",
    ]);
    expect(result.summary.credit_reservation.status).toBe(
      "reservation_unavailable",
    );
  } finally {
    runtime.dispose();
  }
});

test("an unproven terminal write remains visible and never triggers a retry", async () => {
  const runtime = await loadMarketWideDiscoveryRuntime();
  const fixture = allowedLifecycle({ finalization: "reservation_unavailable" });
  let providerCalls = 0;
  try {
    const result = await runtime.discover({
      ...discoveryInput(),
      creditReservation: fixture.lifecycle,
      fetchMarketMovers: async () => {
        providerCalls += 1;
        return { direction: "gainers", fetched_at: now.toISOString(), movers: [] };
      },
    });

    expect(providerCalls).toBe(1);
    expect(fixture.calls).toEqual({ prepared: 1, finalized: 1 });
    expect(result.summary.credit_reservation).toMatchObject({
      finalization_status: "reservation_unavailable",
      finalization_proven: false,
    });
    expect(result.summary.gaps).toContain(
      "daily_credit_reservation_finalization_unavailable",
    );
  } finally {
    runtime.dispose();
  }
});

test("store accepts only a durable claim followed by a one-winner begin transition", async () => {
  const database: MarketWideDiscoveryCreditReservationDatabase = {
    async claim() {
      return {
        data: {
          claim_status: "claimed",
          claim_id: "claim-1",
          reservation_status: "claimed",
          idempotent: false,
          reserved_credits: 100,
          remaining_credits: 0,
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
  const store = createMarketWideDiscoveryCreditReservationStore(database);
  const prepared = await store.prepare({
    claim_id: "claim-1",
    execution_fingerprint: executionFingerprint,
    owner_user_id: ownerUserId,
    trading_date: "2026-09-15",
    requested_credits: 100,
    declared_daily_credit_budget: 100,
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

test("the migration retains spend after failure and limits execution to service role", () => {
  const migration = read(migrationPath);

  expect(migration).toContain(
    "execution_fingerprint text not null unique",
  );
  expect(migration).toContain("pg_advisory_xact_lock");
  expect(migration).toContain("daily_credit_budget_changed");
  expect(migration).toContain("and reservation.status = 'claimed'");
  expect(migration).toContain("reservation.claim_id = p_claim_id");
  expect(migration).toContain("provider_attempted = true");
  expect(migration).toContain("enable row level security");
  expect(migration).toContain(
    "revoke all on table public.market_wide_discovery_credit_reservations",
  );
  expect(migration).toContain(
    "grant execute on function public.claim_market_wide_discovery_credit_reservation",
  );
  expect(migration).toContain("to service_role");
  expect(migration).not.toContain(
    "delete from public.market_wide_discovery_credit_reservations",
  );
});
