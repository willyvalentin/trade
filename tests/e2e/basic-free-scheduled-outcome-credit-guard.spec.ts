import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { expect, test } from "@playwright/test";
import { buildSync } from "esbuild";

const ownerUserId = "7d2e0f9a-43db-4f62-9a78-aec2ae34c6d0";
const executionFingerprint = "scheduled_outcome_evaluation_20260923_1415";
const now = new Date("2026-09-23T14:15:12.000Z");

type Guard = {
  summary: Record<string, unknown>;
  claim: { claim_id: string; execution_fingerprint: string } | null;
};

async function loadGuard() {
  const directory = mkdtempSync(resolve(tmpdir(), "ture-outcome-credit-guard-"));
  const outfile = resolve(directory, "guard.cjs");
  buildSync({
    entryPoints: [
      resolve(process.cwd(), "lib/basic-free-scheduled-outcome-credit-guard.ts"),
    ],
    outfile,
    bundle: true,
    platform: "node",
    format: "cjs",
    conditions: ["react-server"],
  });
  const runtime = (await import(pathToFileURL(outfile).href)) as {
    capBasicFreeOutcomeCandleRequests: (input: {
      planMode: "free" | "grow" | "pro" | "custom";
      requestedLimit: number;
    }) => number;
    prepareBasicFreeScheduledOutcomeCreditGuard: (
      input: Record<string, unknown>,
    ) => Promise<Guard>;
    finalizeBasicFreeScheduledOutcomeCreditGuard: (
      guard: Guard,
      status: "completed" | "failed",
    ) => Promise<Record<string, unknown>>;
  };
  return {
    ...runtime,
    dispose() {
      rmSync(directory, { recursive: true, force: true });
    },
  };
}

function freeInput() {
  return {
    planMode: "free",
    maximumCandleRequests: 4,
    ownerUserId,
    executionFingerprint,
    now,
    env: {
      TURE_BASIC_FREE_CATALOG_DAILY_CREDIT_BUDGET: "800",
      TURE_BASIC_FREE_CATALOG_PER_MINUTE_CREDIT_BUDGET: "8",
    },
  };
}

test("Basic Free cannot enlarge the outcome candle ceiling through a request or env override", async () => {
  const runtime = await loadGuard();
  try {
    expect(runtime.capBasicFreeOutcomeCandleRequests({
      planMode: "free",
      requestedLimit: 50,
    })).toBe(4);
    expect(runtime.capBasicFreeOutcomeCandleRequests({
      planMode: "free",
      requestedLimit: 2,
    })).toBe(2);
    expect(runtime.capBasicFreeOutcomeCandleRequests({
      planMode: "free",
      requestedLimit: Number.NaN,
    })).toBe(0);
    expect(runtime.capBasicFreeOutcomeCandleRequests({
      planMode: "pro",
      requestedLimit: 25,
    })).toBe(25);
  } finally {
    runtime.dispose();
  }
});

test("reserves the Free outcome ceiling in the same durable daily and minute ledger as scans", async () => {
  const runtime = await loadGuard();
  const calls = { prepare: 0, finalize: 0 };
  try {
    const guard = await runtime.prepareBasicFreeScheduledOutcomeCreditGuard({
      ...freeInput(),
      lifecycle: {
        async prepare(input: Record<string, unknown>) {
          calls.prepare += 1;
          expect(input).toMatchObject({
            owner_user_id: ownerUserId,
            execution_fingerprint: executionFingerprint,
            trading_date: "2026-09-23",
            minute_bucket: "2026-09-23T14:15:00.000Z",
            catalog_observation: false,
            requested_credits: 4,
            declared_daily_credit_budget: 800,
            declared_per_minute_credit_budget: 8,
          });
          return {
            status: "provider_execution_allowed",
            provider_execution_allowed: true,
            claim_id: input.claim_id,
            idempotent: false,
            daily_reserved_credits: 12,
            daily_remaining_credits: 788,
            minute_reserved_credits: 4,
            minute_remaining_credits: 4,
            safe_blocker: null,
          };
        },
        async finalize(input: Record<string, unknown>) {
          calls.finalize += 1;
          expect(input).toMatchObject({
            execution_fingerprint: executionFingerprint,
            status: "completed",
          });
          return {
            status: "finalized",
            finalization_proven: true,
            safe_blocker: null,
          };
        },
      },
    });
    expect(guard.summary).toMatchObject({
      status: "provider_execution_allowed",
      scope: "scheduled_outcome_evaluation",
      provider_execution_allowed: true,
      requested_credits: 4,
      daily_reserved_credits: 12,
      minute_reserved_credits: 4,
      finalization_status: "not_started",
    });
    expect(guard.claim?.execution_fingerprint).toBe(executionFingerprint);
    expect(calls).toEqual({ prepare: 1, finalize: 0 });
    await expect(
      runtime.finalizeBasicFreeScheduledOutcomeCreditGuard(guard, "completed"),
    ).resolves.toMatchObject({
      finalization_status: "finalized",
      finalization_proven: true,
    });
    expect(calls).toEqual({ prepare: 1, finalize: 1 });
  } finally {
    runtime.dispose();
  }
});

test("contention, malformed result, over-budget and missing declarations fail closed", async () => {
  const runtime = await loadGuard();
  let prepared = 0;
  try {
    const lifecycle = {
      async prepare() {
        prepared += 1;
        return {
          status: "per_minute_credit_limit_reached",
          provider_execution_allowed: false,
          claim_id: null,
          idempotent: false,
          daily_reserved_credits: 20,
          daily_remaining_credits: 780,
          minute_reserved_credits: 8,
          minute_remaining_credits: 0,
          safe_blocker: "per_minute_credit_limit_reached",
        };
      },
      async finalize() {
        throw new Error("no claim may be finalized");
      },
    };
    const blocked = await runtime.prepareBasicFreeScheduledOutcomeCreditGuard({
      ...freeInput(),
      lifecycle,
    });
    expect(blocked.claim).toBeNull();
    expect(blocked.summary).toMatchObject({
      status: "per_minute_credit_limit_reached",
      provider_execution_allowed: false,
    });
    for (const override of [
      { maximumCandleRequests: 5 },
      { env: { TURE_BASIC_FREE_CATALOG_PER_MINUTE_CREDIT_BUDGET: "8" } },
    ]) {
      const unavailable = await runtime.prepareBasicFreeScheduledOutcomeCreditGuard({
        ...freeInput(),
        ...override,
        lifecycle,
      });
      expect(unavailable.claim).toBeNull();
      expect(unavailable.summary).toMatchObject({
        status: "reservation_unavailable",
        provider_execution_allowed: false,
      });
    }
    const mismatchedClaim = await runtime.prepareBasicFreeScheduledOutcomeCreditGuard({
      ...freeInput(),
      lifecycle: {
        async prepare() {
          return {
            status: "provider_execution_allowed",
            provider_execution_allowed: true,
            claim_id: "wrong-claim",
            idempotent: false,
            daily_reserved_credits: 4,
            daily_remaining_credits: 796,
            minute_reserved_credits: 4,
            minute_remaining_credits: 4,
            safe_blocker: null,
          };
        },
        async finalize() {
          throw new Error("mismatched claim must not finalize");
        },
      },
    });
    expect(mismatchedClaim.claim).toBeNull();
    expect(mismatchedClaim.summary).toMatchObject({
      status: "reservation_unavailable",
      provider_execution_allowed: false,
    });
    expect(prepared).toBe(1);
  } finally {
    runtime.dispose();
  }
});

test("zero-request and non-Free paths do not reserve shared credits", async () => {
  const runtime = await loadGuard();
  const lifecycle = {
    async prepare() {
      throw new Error("no reservation expected");
    },
    async finalize() {
      throw new Error("no finalization expected");
    },
  };
  try {
    const zero = await runtime.prepareBasicFreeScheduledOutcomeCreditGuard({
      ...freeInput(),
      maximumCandleRequests: 0,
      lifecycle,
    });
    const paid = await runtime.prepareBasicFreeScheduledOutcomeCreditGuard({
      ...freeInput(),
      planMode: "pro",
      lifecycle,
    });
    expect(zero.summary).toMatchObject({
      status: "no_provider_work",
      provider_execution_allowed: true,
      requested_credits: 0,
    });
    expect(paid.summary).toMatchObject({
      status: "not_required",
      provider_execution_allowed: true,
    });
    expect(zero.claim).toBeNull();
    expect(paid.claim).toBeNull();
  } finally {
    runtime.dispose();
  }
});

test("an uncertain finalization stays explicit after a one-winner reservation", async () => {
  const runtime = await loadGuard();
  try {
    const guard = await runtime.prepareBasicFreeScheduledOutcomeCreditGuard({
      ...freeInput(),
      lifecycle: {
        async prepare(input: Record<string, unknown>) {
          return {
            status: "provider_execution_allowed",
            provider_execution_allowed: true,
            claim_id: input.claim_id,
            idempotent: false,
            daily_reserved_credits: 4,
            daily_remaining_credits: 796,
            minute_reserved_credits: 4,
            minute_remaining_credits: 4,
            safe_blocker: null,
          };
        },
        async finalize() {
          throw new Error("simulated database interruption");
        },
      },
    });
    await expect(
      runtime.finalizeBasicFreeScheduledOutcomeCreditGuard(guard, "failed"),
    ).resolves.toMatchObject({
      finalization_status: "reservation_unavailable",
      finalization_proven: false,
      safe_blocker: "scheduled_outcome_credit_finalization_unavailable",
    });
  } finally {
    runtime.dispose();
  }
});

test("the scheduled route must reserve before its first possible candle request", () => {
  const route = readFileSync(
    resolve(process.cwd(), "app/api/recommendations/evaluate-outcomes/route.ts"),
    "utf8",
  );
  const claim = route.indexOf("await claimScheduledOutcomeEvaluationAttempt({");
  const reservation = route.indexOf("await prepareBasicFreeScheduledOutcomeCreditGuard({");
  const evaluation = route.indexOf("const run = await runRecommendationOutcomeEvaluation({");
  expect(claim).toBeGreaterThan(-1);
  expect(reservation).toBeGreaterThan(claim);
  expect(evaluation).toBeGreaterThan(reservation);
  expect(route).toContain("finalizeBasicFreeScheduledOutcomeCreditGuard(");
  expect(route).toContain('run: creditFinalizationBlocker && run.status === "completed"');
  expect(route).toContain('          ? { ...run, status: "partial" }');
  expect(route).toContain("nextRetrySuggestion: creditFinalizationBlocker");
});
