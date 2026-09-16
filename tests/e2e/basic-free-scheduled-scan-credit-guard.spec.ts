import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { expect, test } from "@playwright/test";
import { buildSync } from "esbuild";

const now = new Date("2026-09-16T15:30:17.000Z");
const ownerUserId = "7d2e0f9a-43db-4f62-9a78-aec2ae34c6d0";
const executionFingerprint = "scheduled_scan_attempt_20260916_1530";

type Guard = {
  summary: Record<string, unknown>;
  claim: unknown;
};

async function loadRuntime() {
  const directory = mkdtempSync(resolve(tmpdir(), "ture-basic-free-scan-guard-"));
  const output = resolve(directory, "basic-free-scheduled-scan-credit-guard.cjs");
  buildSync({
    entryPoints: [
      resolve(
        process.cwd(),
        "lib/basic-free-scheduled-scan-credit-guard.ts",
      ),
    ],
    outfile: output,
    bundle: true,
    platform: "node",
    format: "cjs",
    conditions: ["react-server"],
  });
  const runtimeModule = (await import(pathToFileURL(output).href)) as {
    BASIC_FREE_SCHEDULED_SCAN_CREDIT_GUARD_VERSION: string;
    prepareBasicFreeScheduledScanCreditGuard: (
      input: Record<string, unknown>,
    ) => Promise<Guard>;
    finalizeBasicFreeScheduledScanCreditGuard: (
      guard: Guard,
      status: "completed" | "failed",
      finalizedAt: string,
    ) => Promise<Record<string, unknown>>;
  };
  return {
    ...runtimeModule,
    dispose() {
      rmSync(directory, { recursive: true, force: true });
    },
  };
}

function freeInput() {
  return {
    planMode: "free" as const,
    maximumKnownProviderCredits: 8,
    ownerUserId,
    executionFingerprint,
    now,
    env: {
      TURE_BASIC_FREE_CATALOG_DAILY_CREDIT_BUDGET: "800",
      TURE_BASIC_FREE_CATALOG_PER_MINUTE_CREDIT_BUDGET: "8",
    },
  };
}

function read(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

test("normal Basic Free scheduled scans claim the whole known provider ceiling before execution", async () => {
  const runtime = await loadRuntime();
  const calls = { prepared: 0, finalized: 0 };
  try {
    const guard = await runtime.prepareBasicFreeScheduledScanCreditGuard({
    ...freeInput(),
    lifecycle: {
      async prepare(input: Record<string, unknown>) {
        calls.prepared += 1;
        expect(input).toMatchObject({
          owner_user_id: ownerUserId,
          trading_date: "2026-09-16",
          minute_bucket: "2026-09-16T15:30:00.000Z",
          requested_credits: 8,
          declared_daily_credit_budget: 800,
          declared_per_minute_credit_budget: 8,
        });
        return {
          status: "provider_execution_allowed" as const,
          provider_execution_allowed: true,
          claim_id: "basic_free_discovery_claim_20260916_deadbeef",
          idempotent: false,
          daily_reserved_credits: 8,
          daily_remaining_credits: 792,
          minute_reserved_credits: 8,
          minute_remaining_credits: 0,
          safe_blocker: null,
        };
      },
      async finalize(input: Record<string, unknown>) {
        calls.finalized += 1;
        expect(input).toMatchObject({
          status: "completed",
          execution_fingerprint: executionFingerprint,
        });
        return {
          status: "finalized" as const,
          finalization_proven: true,
          safe_blocker: null,
        };
      },
    },
  });

    expect(calls).toEqual({ prepared: 1, finalized: 0 });
    expect(guard.summary).toMatchObject({
    guard_version: runtime.BASIC_FREE_SCHEDULED_SCAN_CREDIT_GUARD_VERSION,
    scope: "normal_scheduled_scan",
    status: "provider_execution_allowed",
    provider_execution_allowed: true,
    requested_credits: 8,
    minute_remaining_credits: 0,
    finalization_status: "not_started",
  });

    await expect(
      runtime.finalizeBasicFreeScheduledScanCreditGuard(
      guard,
      "completed",
      now.toISOString(),
    ),
    ).resolves.toMatchObject({
    status: "provider_execution_allowed",
    finalization_status: "finalized",
    finalization_proven: true,
  });
    expect(calls).toEqual({ prepared: 1, finalized: 1 });
  } finally {
    runtime.dispose();
  }
});

test("shared Basic Free quota contention and incomplete configuration fail closed before a provider call", async () => {
  const runtime = await loadRuntime();
  let prepareCalls = 0;
  let finalizeCalls = 0;
  try {
    const blocked = await runtime.prepareBasicFreeScheduledScanCreditGuard({
    ...freeInput(),
    lifecycle: {
      async prepare() {
        prepareCalls += 1;
        return {
          status: "per_minute_credit_limit_reached" as const,
          provider_execution_allowed: false,
          claim_id: null,
          idempotent: false,
          daily_reserved_credits: 17,
          daily_remaining_credits: 783,
          minute_reserved_credits: 8,
          minute_remaining_credits: 0,
          safe_blocker: "per_minute_credit_limit_reached",
        };
      },
      async finalize() {
        finalizeCalls += 1;
        throw new Error("an unstarted reservation must not finalize");
      },
    },
  });
    const unconfigured = await runtime.prepareBasicFreeScheduledScanCreditGuard({
    ...freeInput(),
    env: { TURE_BASIC_FREE_CATALOG_PER_MINUTE_CREDIT_BUDGET: "8" },
    lifecycle: {
      async prepare() {
        throw new Error("missing declared daily budget must not claim");
      },
      async finalize() {
        throw new Error("missing declared daily budget must not finalize");
      },
    },
  });

    expect(blocked.claim).toBeNull();
    expect(blocked.summary).toMatchObject({
    status: "per_minute_credit_limit_reached",
    provider_execution_allowed: false,
    safe_blocker: "per_minute_credit_limit_reached",
  });
    await expect(
      runtime.finalizeBasicFreeScheduledScanCreditGuard(
        blocked,
        "failed",
        now.toISOString(),
      ),
    ).resolves.toEqual(blocked.summary);
    expect(unconfigured.summary).toMatchObject({
    status: "reservation_unavailable",
    provider_execution_allowed: false,
    safe_blocker: "basic_free_credit_budget_unavailable",
  });
    expect(prepareCalls).toBe(1);
    expect(finalizeCalls).toBe(0);
  } finally {
    runtime.dispose();
  }
});

test("paid plan scans remain outside the Basic Free reservation contract", async () => {
  const runtime = await loadRuntime();
  try {
    const guard = await runtime.prepareBasicFreeScheduledScanCreditGuard({
    ...freeInput(),
    planMode: "pro",
    lifecycle: {
      async prepare() {
        throw new Error("paid profiles must not claim Basic Free capacity");
      },
      async finalize() {
        throw new Error("paid profiles must not finalize Basic Free capacity");
      },
    },
  });

    expect(guard).toMatchObject({
    claim: null,
    summary: {
      status: "not_required",
      provider_execution_allowed: true,
      scope: "normal_scheduled_scan",
    },
    });
  } finally {
    runtime.dispose();
  }
});

test("the scheduled route persists its shared-credit receipt and admits generation only after the claim", () => {
  const route = read("app/api/automation/run-scan/route.ts");
  const guardIndex = route.indexOf(
    "await prepareBasicFreeScheduledScanCreditGuard({",
  );
  const generationIndex = route.indexOf("generationResult = await generateRecommendations");

  expect(guardIndex).toBeGreaterThan(-1);
  expect(generationIndex).toBeGreaterThan(guardIndex);
  expect(route).toContain("finalizeBasicFreeScheduledScanCreditGuard(");
  expect(route).toContain("basic_free_scheduled_scan_credit_reservation:");
  expect(route).toContain(
    '"basic_free_scheduled_scan_credit_reservation"',
  );
});
