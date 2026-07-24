import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  boundedShadowCollectorExecutionProofAuthorizationLimits,
  boundedShadowCollectorExecutionProofAuthorizationRoutePath,
  buildBoundedShadowCollectorExecutionProofPlan,
  createBoundedShadowCollectorExecutionProofRuntime,
  parseBoundedShadowCollectorExecutionProofRequest,
} from "../../lib/bounded-shadow-collector-execution-proof";
import {
  buildBoundedShadowCollectorOperatorAuthorizationDiagnostics,
  createBoundedShadowCollectorOperatorAuthorizationStore,
} from "../../lib/bounded-shadow-collector-operator-authorization";

const issuanceRoutePath =
  "app/api/automation/continuous-intelligence/shadow-collector/bounded-execution-proof/authorization/route.ts";
const executionRoutePath =
  "app/api/automation/continuous-intelligence/shadow-collector/bounded-execution-proof/route.ts";
const now = new Date("2026-07-21T14:30:00.000Z");

function read(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function request(ticker = "AAPL") {
  const parsed = parseBoundedShadowCollectorExecutionProofRequest(
    {
      tickers: [ticker],
      interval: "5min",
      start: "2026-07-21T14:00:00.000Z",
      end: "2026-07-21T14:30:00.000Z",
    },
    { now },
  );
  if (!parsed.ok) throw new Error("Expected valid authorization request fixture.");
  return parsed.value;
}

function readyPreflight(ticker = "AAPL") {
  const planner = buildBoundedShadowCollectorExecutionProofPlan({
    now,
    provider_metadata_status: "within_budget",
    proof_ticker: ticker,
  });
  return createBoundedShadowCollectorExecutionProofRuntime().preflight({
    request: request(ticker),
    budget_plan: planner.budget_plan,
    provider_configured: true,
    provider_metadata_status: "within_budget",
    execution_feature_enabled: true,
    ticker_input_source: planner.ticker_input_source,
    evaluation_now: planner.evaluation_now,
  });
}

function storeFixture(clock = now) {
  let serial = 0;
  return createBoundedShadowCollectorOperatorAuthorizationStore({
    now: () => clock,
    token_generator: () => `test-token-${++serial}-not-a-request-fingerprint`,
    hash_token: async (token) => `hash:${token}`,
  });
}

test("Action 570 exposes authenticated POST-only issuance and requires the dedicated execution header", () => {
  const issuanceRoute = read(issuanceRoutePath);
  const executionRoute = read(executionRoutePath);
  expect(issuanceRoute).toContain('export const dynamic = "force-dynamic"');
  expect(issuanceRoute).toContain('export const maxDuration = 5');
  expect(issuanceRoute).toContain('"Cache-Control": "no-store"');
  expect(issuanceRoute).toContain("x-automation-secret");
  expect(issuanceRoute).not.toContain("getIntradayCandlesWithDiagnostics");
  expect(issuanceRoute).not.toContain("export async function GET");
  expect(issuanceRoute.indexOf("if (!preflight.eligible)")).toBeLessThan(
    issuanceRoute.indexOf("boundedShadowCollectorOperatorAuthorizationStore.issue"),
  );
  expect(executionRoute).toContain("boundedShadowCollectorExecutionProofAuthorizationHeaderName");
  expect(executionRoute).toContain("boundedShadowCollectorOperatorAuthorizationStore.begin");
  expect(executionRoute).toContain("boundedShadowCollectorOperatorAuthorizationStore.consume");
  expect(boundedShadowCollectorExecutionProofAuthorizationRoutePath).toContain("/authorization");
});

test("Action 570 issues only after canonical preflight eligibility and returns an opaque request-bound token", async () => {
  const preflight = readyPreflight();
  expect(preflight.eligible).toBe(true);
  expect(preflight.operator_authorization_required_for_execution).toBe(true);
  expect(preflight.authorization_issuance_route_present).toBe(true);

  const store = storeFixture();
  const issued = await store.issue(request());
  expect(issued).toMatchObject({
    ok: true,
    ttl_seconds: 60,
    request_fingerprint: "AAPL|5min|2026-07-21T14:00:00.000Z|2026-07-21T14:30:00.000Z",
  });
  if (!issued.ok) throw new Error("Expected issued authorization.");
  expect(issued.token).not.toContain("AAPL|5min");
  expect(store.snapshot()).toEqual({
    record_count: 1,
    issued_count: 1,
    consuming_count: 0,
    consumed_count: 0,
    pending_issuance_count: 0,
    max_records: 8,
  });
});

test("Action 570 authorization binding, expiration, and single-use consumption fail closed", async () => {
  let clock = new Date(now);
  const store = createBoundedShadowCollectorOperatorAuthorizationStore({
    now: () => clock,
    token_generator: () => "opaque-fixture-token",
    hash_token: async (token) => `hash:${token}`,
  });
  const issued = await store.issue(request());
  if (!issued.ok) throw new Error("Expected issued authorization.");
  expect(await store.begin(null, request())).toMatchObject({
    ok: false,
    blocker: "operator_authorization_required",
  });
  expect(await store.begin("unknown", request())).toMatchObject({
    ok: false,
    blocker: "operator_authorization_invalid",
  });
  expect(await store.begin(issued.token, request("MSFT"))).toMatchObject({
    ok: false,
    blocker: "operator_authorization_mismatch",
  });
  const first = await store.begin(issued.token, request());
  expect(first.ok).toBe(true);
  expect(await store.begin(issued.token, request())).toMatchObject({
    ok: false,
    blocker: "operator_authorization_in_use",
  });
  if (!first.ok) throw new Error("Expected active authorization lease.");
  store.consume(first.lease);
  expect(await store.begin(issued.token, request())).toMatchObject({
    ok: false,
    blocker: "operator_authorization_already_consumed",
  });

  const expiryStore = createBoundedShadowCollectorOperatorAuthorizationStore({
    now: () => clock,
    token_generator: () => "expiring-token",
    hash_token: async (token) => `hash:${token}`,
  });
  const expiring = await expiryStore.issue(request());
  if (!expiring.ok) throw new Error("Expected expiring authorization.");
  clock = new Date(clock.getTime() + 60_001);
  expect(await expiryStore.begin(expiring.token, request())).toMatchObject({
    ok: false,
    blocker: "operator_authorization_expired",
  });
});

test("Action 570 keeps process-local authorization capacity bounded without silent valid-record eviction", async () => {
  const store = storeFixture();
  for (let index = 0; index < boundedShadowCollectorExecutionProofAuthorizationLimits.max_records; index += 1) {
    const issued = await store.issue(request());
    expect(issued.ok).toBe(true);
  }
  expect(await store.issue(request())).toEqual({
    ok: false,
    blocker: "authorization_capacity_unavailable",
  });
  expect(store.snapshot().record_count).toBe(8);
});

test("Action 570 reserves issuance capacity before asynchronous hashing and releases failed reservations", async () => {
  let releaseHashing = () => {};
  const hashingPending = new Promise<void>((resolve) => {
    releaseHashing = resolve;
  });
  let hashCalls = 0;
  const store = createBoundedShadowCollectorOperatorAuthorizationStore({
    now: () => now,
    token_generator: (() => {
      let serial = 0;
      return () => `concurrent-token-${++serial}`;
    })(),
    hash_token: async (token) => {
      hashCalls += 1;
      await hashingPending;
      return `hash:${token}`;
    },
  });
  const attempts = Array.from({ length: 12 }, () => store.issue(request()));

  await Promise.resolve();
  expect(hashCalls).toBe(8);
  expect(store.snapshot()).toMatchObject({
    record_count: 0,
    pending_issuance_count: 8,
    max_records: 8,
  });

  releaseHashing();
  const results = await Promise.all(attempts);
  expect(results.filter((result) => result.ok)).toHaveLength(8);
  expect(results.filter((result) => !result.ok)).toEqual(
    Array.from({ length: 4 }, () => ({
      ok: false,
      blocker: "authorization_capacity_unavailable",
    })),
  );
  expect(store.snapshot()).toMatchObject({
    record_count: 8,
    pending_issuance_count: 0,
  });

  let failGeneration = true;
  let failHash = true;
  const failureStore = createBoundedShadowCollectorOperatorAuthorizationStore({
    now: () => now,
    token_generator: () => {
      if (failGeneration) throw new Error("fixture token failure");
      return "failure-fixture-token";
    },
    hash_token: async (token) => {
      if (failHash) throw new Error("fixture hash failure");
      return `hash:${token}`;
    },
  });
  expect(await failureStore.issue(request())).toEqual({
    ok: false,
    blocker: "authorization_generation_failed",
  });
  expect(failureStore.snapshot()).toMatchObject({
    record_count: 0,
    pending_issuance_count: 0,
  });
  failGeneration = false;
  expect(await failureStore.issue(request())).toEqual({
    ok: false,
    blocker: "authorization_generation_failed",
  });
  expect(failureStore.snapshot()).toMatchObject({
    record_count: 0,
    pending_issuance_count: 0,
  });
  failHash = false;
  expect((await failureStore.issue(request())).ok).toBe(true);
});

test("Action 570 fails closed on duplicate token hashes without replacing the valid authorization", async () => {
  const store = createBoundedShadowCollectorOperatorAuthorizationStore({
    now: () => now,
    token_generator: () => "duplicate-fixture-token",
    hash_token: async () => "duplicate-fixture-hash",
  });
  const first = await store.issue(request());
  if (!first.ok) throw new Error("Expected initial authorization.");
  const duplicate = await store.issue(request("MSFT"));
  expect(duplicate).toEqual({
    ok: false,
    blocker: "authorization_generation_failed",
  });
  expect(store.snapshot()).toMatchObject({
    record_count: 1,
    issued_count: 1,
    pending_issuance_count: 0,
  });
  expect(await store.begin(first.token, request("MSFT"))).toEqual({
    ok: false,
    blocker: "operator_authorization_mismatch",
  });
  expect(store.snapshot()).toMatchObject({
    record_count: 1,
    issued_count: 1,
  });
});

test("Action 570 diagnostics are passive and never carry a token, provider result, persistence, or route invocation", () => {
  const diagnostics = buildBoundedShadowCollectorOperatorAuthorizationDiagnostics();
  expect(diagnostics).toMatchObject({
    status: "not_observed",
    ttl_seconds: 60,
    single_use: true,
    request_bound: true,
    process_local_only: true,
    durable: false,
    browser_route_invocation: false,
    token_present_in_diagnostics: false,
  });
  const serialized = JSON.stringify(diagnostics);
  expect(serialized).not.toContain("test-token");
  expect(serialized).not.toContain("authorization_token");
  expect(serialized).not.toContain("supabase");
});
