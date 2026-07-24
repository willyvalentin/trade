import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  buildBoundedShadowCollectorExecutionProofBlockedResult,
  buildBoundedShadowCollectorExecutionProofPlan,
  createBoundedShadowCollectorExecutionProofRuntime,
  parseBoundedShadowCollectorExecutionProofRequest,
  type BoundedShadowCollectorExecutionProofResult,
  type BoundedShadowCollectorExecutionProofProviderResult,
} from "../../lib/bounded-shadow-collector-execution-proof";
import { createBoundedShadowCollectorOperatorAuthorizationStore } from "../../lib/bounded-shadow-collector-operator-authorization";
import {
  boundedShadowCollectorLatestProofReceiptStore,
  buildBoundedShadowCollectorLiveProofReceipt,
  buildBoundedShadowCollectorLiveProofReceiptDiagnostics,
  createBoundedShadowCollectorLatestProofReceiptStore,
} from "../../lib/bounded-shadow-collector-live-proof-receipt";

const now = new Date("2026-07-21T14:30:00.000Z");
const readbackRoutePath =
  "app/api/automation/continuous-intelligence/shadow-collector/bounded-execution-proof/latest-receipt/route.ts";
const executionRoutePath =
  "app/api/automation/continuous-intelligence/shadow-collector/bounded-execution-proof/route.ts";
const runbookPath = "docs/action-571-live-proof-receipt-operator-runbook.md";

function read(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function request() {
  const parsed = parseBoundedShadowCollectorExecutionProofRequest(
    {
      tickers: ["AAPL"],
      interval: "5min",
      start: "2026-07-21T14:00:00.000Z",
      end: "2026-07-21T14:30:00.000Z",
    },
    { now },
  );
  if (!parsed.ok) throw new Error("Expected valid receipt request fixture.");
  return parsed.value;
}

function preflight() {
  const parsedRequest = request();
  const planner = buildBoundedShadowCollectorExecutionProofPlan({
    now,
    provider_metadata_status: "within_budget",
    proof_ticker: parsedRequest.ticker,
  });
  const runtime = createBoundedShadowCollectorExecutionProofRuntime();
  return {
    request: parsedRequest,
    planner,
    preflight: runtime.preflight({
      request: parsedRequest,
      budget_plan: planner.budget_plan,
      provider_configured: true,
      provider_metadata_status: "within_budget",
      execution_feature_enabled: true,
      ticker_input_source: planner.ticker_input_source,
      evaluation_now: planner.evaluation_now,
    }),
  };
}

function providerResult(
  candles: BoundedShadowCollectorExecutionProofProviderResult["candles"],
): BoundedShadowCollectorExecutionProofProviderResult {
  return {
    provider: "twelve_data",
    provider_call_count: 1,
    estimated_credits: 1,
    actual_credits: 1,
    provider_outcome: "success",
    provider_status: candles.length > 0 ? "available" : "empty",
    provider_error_category: null,
    fallback_used: false,
    response_structurally_valid: true,
    retry_count: 0,
    rate_limited: false,
    candles,
  };
}

async function execution(candles: BoundedShadowCollectorExecutionProofProviderResult["candles"]) {
  const fixture = preflight();
  const runtime = createBoundedShadowCollectorExecutionProofRuntime();
  const result = await runtime.execute({
    request: fixture.request,
    budget_plan: fixture.planner.budget_plan,
    provider_configured: true,
    provider_metadata_status: "within_budget",
    execution_feature_enabled: true,
    ticker_input_source: fixture.planner.ticker_input_source,
    evaluation_now: fixture.planner.evaluation_now,
    provider: async () => providerResult(candles),
  });
  return { ...fixture, result };
}

test("Action 571 canonical receipts distinguish blocked, candle-success, valid-empty, and provider failures", async () => {
  const candle = {
    timestamp: Date.parse("2026-07-21T14:05:00.000Z") / 1000,
    open: 99,
    high: 101,
    low: 98,
    close: 100,
    volume: 50,
  };
  const success = await execution([candle]);
  const successReceipt = buildBoundedShadowCollectorLiveProofReceipt({
    ...success,
    operator_authorization_verified: true,
    authorization_consumed: true,
    receipt_id: "receipt-success",
    now,
  });
  expect(successReceipt).toMatchObject({
    primary_result_category: "provider_success_with_candles",
    provider_attempt_occurred: true,
    provider_request_count: 1,
    candle_count: 1,
    hard_reserve_preserved: true,
    execution_ready_reserve_consumed: false,
    authorization_consumed: true,
  });
  const empty = await execution([]);
  const emptyReceipt = buildBoundedShadowCollectorLiveProofReceipt({
    ...empty,
    operator_authorization_verified: true,
    authorization_consumed: true,
    receipt_id: "receipt-empty",
    now,
  });
  expect(emptyReceipt).toMatchObject({
    primary_result_category: "provider_success_empty",
    candle_count: 0,
    first_candle_at: null,
    last_candle_at: null,
    provider_status_category: "empty",
  });
  const blockedFixture = preflight();
  const blockedReceipt = buildBoundedShadowCollectorLiveProofReceipt({
    request: blockedFixture.request,
    preflight: blockedFixture.preflight,
    result: buildBoundedShadowCollectorExecutionProofBlockedResult(
      "runtime_capacity_unavailable",
      blockedFixture.preflight.request_fingerprint,
      "Another bounded proof request is already in flight.",
    ),
    operator_authorization_verified: true,
    authorization_consumed: true,
    receipt_id: "receipt-blocked",
    now,
  });
  expect(blockedReceipt).toMatchObject({
    primary_result_category: "blocked_before_provider_attempt",
    provider_attempt_occurred: false,
    provider_request_count: 0,
  });
});

test("Action 571 receipts contain no candles, token material, raw provider data, or persistence claims", async () => {
  const fixture = await execution([]);
  const receipt = buildBoundedShadowCollectorLiveProofReceipt({
    ...fixture,
    operator_authorization_verified: true,
    authorization_consumed: true,
    receipt_id: "safe-receipt-id",
    now,
  });
  const serialized = JSON.stringify(receipt);
  expect(serialized).not.toContain("authorization_token");
  expect(serialized).not.toContain("token_hash");
  expect(serialized).not.toContain("TWELVE_DATA_API_KEY");
  expect(serialized).not.toContain("provider_url");
  expect(receipt.persisted).toBe(false);
  expect(receipt.no_effect_boundary).toMatchObject({
    shared_cache_mutated: false,
    supabase_writes_executed: false,
    schedule_changes: false,
  });
});

test("Action 571 records one safe internal-failure receipt after authorization consumption", async () => {
  const fixture = preflight();
  const authorizationStore = createBoundedShadowCollectorOperatorAuthorizationStore({
    now: () => now,
    token_generator: () => "authorized-internal-failure-token",
    hash_token: async (token) => `hash:${token}`,
  });
  const issued = await authorizationStore.issue(fixture.request);
  if (!issued.ok) throw new Error("Expected authorization fixture.");
  const lease = await authorizationStore.begin(issued.token, fixture.request);
  if (!lease.ok) throw new Error("Expected consuming authorization fixture.");

  const receiptStore = createBoundedShadowCollectorLatestProofReceiptStore();
  let providerAttemptOccurred = false;
  let result: BoundedShadowCollectorExecutionProofResult;
  try {
    throw new Error("https://provider.example/path?api_key=fixture-secret");
  } catch {
    result = buildBoundedShadowCollectorExecutionProofBlockedResult(
      "internal_execution_failure",
      fixture.preflight.request_fingerprint,
      "Bounded execution proof could not be completed safely.",
      providerAttemptOccurred ? 1 : 0,
    );
  } finally {
    authorizationStore.consume(lease.lease);
  }

  const noProviderReceipt = buildBoundedShadowCollectorLiveProofReceipt({
    request: fixture.request,
    preflight: fixture.preflight,
    result,
    operator_authorization_verified: true,
    authorization_consumed: true,
    receipt_id: "receipt-internal-before-provider",
    now,
  });
  receiptStore.record(noProviderReceipt);
  expect(noProviderReceipt).toMatchObject({
    execution_status: "failed",
    primary_result_category: "internal_execution_failure",
    provider_attempt_occurred: false,
    provider_request_count: 0,
    operator_authorization_verified: true,
    authorization_consumed: true,
  });
  expect(receiptStore.snapshot()).toMatchObject({ receipt_count: 1 });
  expect(await authorizationStore.begin(issued.token, fixture.request)).toEqual({
    ok: false,
    blocker: "operator_authorization_already_consumed",
  });

  providerAttemptOccurred = true;
  const afterProviderReceipt = buildBoundedShadowCollectorLiveProofReceipt({
    request: fixture.request,
    preflight: fixture.preflight,
    result: buildBoundedShadowCollectorExecutionProofBlockedResult(
      "internal_execution_failure",
      fixture.preflight.request_fingerprint,
      "Bounded execution proof could not be completed safely.",
      providerAttemptOccurred ? 1 : 0,
    ),
    operator_authorization_verified: true,
    authorization_consumed: true,
    receipt_id: "receipt-internal-after-provider",
    now,
  });
  expect(afterProviderReceipt).toMatchObject({
    primary_result_category: "internal_execution_failure",
    provider_attempt_occurred: true,
    provider_request_count: 1,
  });
  const serialized = JSON.stringify(noProviderReceipt);
  expect(serialized).not.toContain("fixture-secret");
  expect(serialized).not.toContain("provider.example");
  expect(serialized).not.toContain("authorized-internal-failure-token");
  expect(serialized).not.toContain("hash:authorized-internal-failure-token");

  const executionRoute = read(executionRoutePath);
  expect(executionRoute).toContain('"internal_execution_failure"');
  expect(executionRoute).toContain("providerAttemptOccurred ? 1 : 0");
  expect(executionRoute).toContain("} finally {\n      boundedShadowCollectorOperatorAuthorizationStore.consume");
  expect(executionRoute).toContain('result.blocker === "internal_execution_failure"');
});

test("Action 571 latest receipt storage is one-record, sanitized, process-local, and never creates a receipt before submission", async () => {
  const store = createBoundedShadowCollectorLatestProofReceiptStore();
  expect(store.latest()).toBeNull();
  expect(store.snapshot()).toMatchObject({ status: "not_observed", receipt_count: 0, persisted: false });
  const fixture = await execution([]);
  const first = buildBoundedShadowCollectorLiveProofReceipt({
    ...fixture,
    operator_authorization_verified: true,
    authorization_consumed: true,
    receipt_id: "first-safe-receipt",
    now,
  });
  const replacement = { ...first, receipt_id: "replacement-safe-receipt" };
  store.record(first);
  first.safe_operator_message = "caller-mutated-message";
  expect(store.latest()?.safe_operator_message).not.toBe("caller-mutated-message");
  const returned = store.latest();
  if (!returned) throw new Error("Expected stored receipt.");
  returned.safe_operator_message = "readback-mutated-message";
  expect(store.latest()?.safe_operator_message).not.toBe("readback-mutated-message");
  store.record(replacement);
  expect(store.latest()?.receipt_id).toBe("replacement-safe-receipt");
  expect(store.snapshot()).toMatchObject({ status: "observed", receipt_count: 1, process_local_only: true });
  expect(boundedShadowCollectorLatestProofReceiptStore.snapshot().receipt_count).toBeLessThanOrEqual(1);
});

test("Action 571 readback, diagnostics, and runbook stay authenticated, passive, and manual", () => {
  const route = read(readbackRoutePath);
  const runbook = read(runbookPath);
  const diagnostics = buildBoundedShadowCollectorLiveProofReceiptDiagnostics();
  expect(route).toContain("export async function GET");
  expect(route).toContain("x-automation-secret");
  expect(route).toContain('"Cache-Control": "no-store"');
  expect(route).not.toContain("getIntradayCandlesWithDiagnostics");
  expect(diagnostics).toMatchObject({
    status: "not_observed",
    receipt_persisted: false,
    browser_route_invocation: false,
    provider_call_inferred_by_client: false,
    token_present_in_diagnostics: false,
  });
  expect(runbook).toContain("Never retry automatically.");
  expect(runbook).toContain("Disable the Action 568 execution feature flag immediately after the proof.");
  expect(runbook).toContain("Read the Action 571 receipt.");
  expect(runbook).toContain("Abort without retry");
});
