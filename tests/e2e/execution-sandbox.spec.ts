import { expect, type Locator, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import {
  buildAvanzaAgentProgressEvent,
  buildAvanzaAgentRequest,
  buildAvanzaAgentResult,
} from "../../lib/avanza-agent-adapter";
import { buildAvanzaExecutionHandoff } from "../../lib/avanza-execution-handoff";
import { createStoredAvanzaAgentRun } from "../../lib/avanza-agent-run-store";
import {
  getExecutionAuthorityForMode,
  type ExecutionIntent,
} from "../../lib/execution";
import {
  createExecutionLifecycleSnapshot,
  transitionExecutionLifecycle,
} from "../../lib/execution-state-machine";
import {
  EXECUTION_AUDIT_PERSISTENCE_CONTRACT_VERSION,
  type PersistExecutionLifecycleEventRequest,
  validatePersistExecutionAgentProgressEventRequest,
  validatePersistExecutionAgentRunRequest,
  validatePersistExecutionLifecycleEventRequest,
} from "../../lib/execution-audit-persistence-contract";
import {
  createNoopExecutionAuditPersistenceWriter,
  mapAgentProgressEventRequestToInsertPayload,
  mapAgentRunRequestToInsertPayload,
  mapLifecycleEventRequestToInsertPayload,
} from "../../lib/execution-audit-persistence-writer";
import {
  buildExecutionAuditPersistenceRouteResponse,
} from "../../lib/execution-audit-persistence-route-handler";
import {
  createSupabaseExecutionAuditPersistenceWriter,
  EXECUTION_AUDIT_TABLES,
  type ExecutionAuditSupabaseLikeClient,
  type SupabaseInsertResult,
} from "../../lib/execution-audit-supabase-writer";
import {
  assertExecutionAuditPersistenceAllowed,
  getExecutionPersistenceEnvironment,
  getExecutionPersistenceEnvironmentWarnings,
  isExecutionAuditSupabasePersistenceEnabled,
  isExecutionAuditSupabaseWriterEnabled,
} from "../../lib/execution-persistence-flags";
import {
  buildExecutionServerCaptureIdempotencyKey,
  EXECUTION_SERVER_CAPTURE_CONTRACT_VERSION,
  validateExecutionServerCaptureRequest,
} from "../../lib/execution-server-capture-contract";
import {
  buildMockOrderPageFillPlanFromAgentRequest,
  buildMockOrderPageUrlFromFillPlan,
  MOCK_ORDER_PAGE_AGENT_SELECTORS,
  validateMockOrderPageFillPlan,
} from "../../lib/mock-order-page-agent-contract";
import {
  buildMockOrderConfirmationUrl,
  MOCK_ORDER_CONFIRMATION_SELECTORS,
  validateMockOrderConfirmationPayload,
} from "../../lib/mock-order-confirmation-contract";
import {
  buildDevMockBrokerExecutionResultFromConfirmationPayload,
  buildDevMockBrokerExecutionResultFromParseResult,
  validateDevMockBrokerExecutionResult,
} from "../../lib/mock-broker-execution-result";
import { DEV_MOCK_BROKER_RESULT_STORAGE_KEY } from "../../lib/dev-mock-broker-result-store";
import {
  buildDevMockCaptureDuplicateKey,
  buildDevMockCaptureDuplicateKeyFromRecord,
  convertDevMockBrokerResultToBrokerExecutionResult,
} from "../../lib/dev-mock-to-broker-execution-result";
import {
  fillMockOrderPageFromPlan,
  openMockOrderPageWithPlan,
  verifyMockOrderPageReviewFromPlan,
} from "./helpers/mock-order-fill-runner";
import {
  parseMockConfirmationPage,
  verifyMockConfirmationParseResult,
} from "./helpers/mock-confirmation-parser";
import {
  buildInvalidExecutionServerCaptureRequestMissingBrokerResult,
  buildInvalidExecutionServerCaptureRequestMissingIntent,
  buildMismatchedExecutionServerCaptureRequest,
  buildProductionMockExecutionServerCaptureRequest,
  buildValidDevMockExecutionServerCaptureRequest,
} from "./helpers/execution-server-capture-fixtures";
import { EXECUTION_RECORD_STORE_KEY } from "../../lib/execution-record-store";

const tradeAuthCookieName = "trade_auth";

function readEnvValue(name: string) {
  const env = readFileSync(".env.local", "utf8");
  const line = env
    .split(/\r?\n/)
    .find((item) => item.trim().startsWith(`${name}=`));

  if (!line) {
    return "";
  }

  return line
    .slice(line.indexOf("=") + 1)
    .trim()
    .replace(/^['"]|['"]$/g, "");
}

function getTradeAuthToken(password: string) {
  return createHash("sha256").update(`trade-auth:${password}`).digest("hex");
}

async function isVisible(locator: Locator) {
  try {
    await expect(locator).toBeVisible({ timeout: 1_000 });
    return true;
  } catch {
    return false;
  }
}

async function expectStableAgentSelector(
  locator: Locator,
  selector: { testId: string; dataAgentField: string },
) {
  await expect(locator).toHaveAttribute("data-testid", selector.testId);
  await expect(locator).toHaveAttribute(
    "data-agent-field",
    selector.dataAgentField,
  );
}

function buildMockOrderPageExecutionIntentFixture(): ExecutionIntent {
  const mode = "semi_automatic";

  return {
    intent_version: "1.0",
    intent_id: "intent_mock_contract",
    created_at: "2026-06-10T08:00:00.000Z",
    mode,
    authority: getExecutionAuthorityForMode(mode),
    action: "buy",
    trigger_type: "entry_recommendation_ready",
    trigger_priority: 6,
    broker_hint: "AVANZA",
    source: "recommendation",
    trading_package: {
      package_version: "1.0",
      recommendation_id: "recommendation_mock_contract",
      live_position_id: null,
      ticker: "QA.TEST",
      market: "US",
      quantity: 42,
      order_type: "limit",
      limit_price: 123.45,
      stop_loss: 118,
      target_price: 130,
      expires_at: null,
      payload_id: "payload_mock_contract",
      payload_fingerprint: "payload_mock_contract_fingerprint",
    },
    safety_warnings: [],
    broker_result: null,
  };
}

function buildMockOrderPageAgentRequestFixture() {
  const intent = buildMockOrderPageExecutionIntentFixture();

  return buildAvanzaAgentRequest(
    buildAvanzaExecutionHandoff(intent, {
      createdAt: "2026-06-10T08:00:01.000Z",
    }),
    {
      createdAt: "2026-06-10T08:00:02.000Z",
      requestId: "request_mock_contract",
    },
  );
}

function buildPersistLifecycleEventRequestFixture() {
  const snapshot = createExecutionLifecycleSnapshot({
    lifecycleId: "lifecycle_audit_persistence_fixture",
    createdAt: "2026-06-10T09:00:00.000Z",
    mode: "semi_automatic",
    action: "buy",
    triggerType: "entry_recommendation_ready",
    intentId: "intent_audit_persistence_fixture",
    recommendationId: "recommendation_audit_persistence_fixture",
  });
  const transition = transitionExecutionLifecycle(snapshot, "create_intent", {
    eventId: "event_audit_persistence_fixture",
    createdAt: "2026-06-10T09:00:01.000Z",
    intentId: "intent_audit_persistence_fixture",
    message: "Audit persistence route fixture only.",
  });

  if (!transition.ok) {
    throw new Error(transition.error);
  }

  return {
    version: EXECUTION_AUDIT_PERSISTENCE_CONTRACT_VERSION,
    submittedAt: "2026-06-10T09:00:02.000Z",
    sourceEnvironment: "local_dev" as const,
    isMock: true,
    isDev: true,
    event: transition.event,
    metadata: {
      path: "execution_audit_lifecycle_stub_e2e",
      supabaseWriteExpected: false,
    },
  };
}

function buildInvalidPersistLifecycleEventRequestFixture(): Partial<PersistExecutionLifecycleEventRequest> {
  const request = buildPersistLifecycleEventRequestFixture();

  return {
    ...request,
    event: {
      ...request.event,
      type: "",
    },
  } as unknown as Partial<PersistExecutionLifecycleEventRequest>;
}

function buildPersistAgentRunRequestFixture() {
  const request = buildMockOrderPageAgentRequestFixture();
  const progressEvent = buildAvanzaAgentProgressEvent({
    eventId: "agent_progress_audit_fixture",
    requestId: request.requestId,
    createdAt: "2026-06-10T09:01:00.000Z",
    type: "agent_started",
    message: "Audit persistence agent progress fixture only.",
  });
  const result = buildAvanzaAgentResult({
    requestId: request.requestId,
    createdAt: "2026-06-10T09:01:30.000Z",
    status: "waiting_for_manual_confirmation",
    progressEvents: [progressEvent],
  });
  const run = createStoredAvanzaAgentRun({
    request,
    result,
    createdAt: "2026-06-10T09:01:00.000Z",
    updatedAt: "2026-06-10T09:01:30.000Z",
    runId: "agent_run_audit_persistence_fixture",
    runner: {
      runnerId: "runner_audit_fixture",
      name: "Audit Fixture Runner",
      version: "test",
      supportsRealBrokerAutomation: false,
    },
    metadata: {
      path: "execution_audit_agent_run_stub_e2e",
      supabaseWriteExpected: false,
    },
  });

  return {
    version: EXECUTION_AUDIT_PERSISTENCE_CONTRACT_VERSION,
    submittedAt: "2026-06-10T09:01:40.000Z",
    sourceEnvironment: "local_dev" as const,
    isMock: true,
    isDev: true,
    run,
    metadata: {
      path: "execution_audit_agent_run_stub_e2e",
      supabaseWriteExpected: false,
    },
  };
}

function buildPersistAgentProgressEventRequestFixture() {
  const requestId = "request_audit_progress_fixture";
  const progressEvent = buildAvanzaAgentProgressEvent({
    eventId: "agent_progress_event_audit_persistence_fixture",
    requestId,
    createdAt: "2026-06-10T09:02:00.000Z",
    type: "order_review_ready",
    message: "Audit persistence progress route fixture only.",
  });

  return {
    version: EXECUTION_AUDIT_PERSISTENCE_CONTRACT_VERSION,
    submittedAt: "2026-06-10T09:02:01.000Z",
    sourceEnvironment: "local_dev" as const,
    isMock: true,
    isDev: true,
    agentRunId: "agent_run_audit_persistence_fixture",
    progressEvent,
    metadata: {
      path: "execution_audit_progress_stub_e2e",
      supabaseWriteExpected: false,
    },
  };
}

function createFakeExecutionAuditDb(
  result: SupabaseInsertResult,
  calls: Array<{ table: string; payload: unknown }> = [],
): ExecutionAuditSupabaseLikeClient {
  return {
    from: (table) => ({
      insert: (payload) => {
        calls.push({ table, payload });

        return {
          select: () => ({
            single: async () => result,
          }),
        };
      },
    }),
  };
}

test.beforeEach(async ({ baseURL, context }) => {
  if (!baseURL) {
    throw new Error("Playwright baseURL is required for local QA smoke tests.");
  }

  const password = readEnvValue("TRADE_APP_PASSWORD");

  if (!password) {
    throw new Error(
      "TRADE_APP_PASSWORD is required in .env.local for authenticated local QA.",
    );
  }

  await context.addCookies([
    {
      httpOnly: true,
      name: tradeAuthCookieName,
      sameSite: "Lax",
      secure: false,
      url: baseURL,
      value: getTradeAuthToken(password),
    },
  ]);
});

test("builds and validates a mock order page fill plan without automation", () => {
  const plan = buildMockOrderPageFillPlanFromAgentRequest(
    buildMockOrderPageAgentRequestFixture(),
  );
  const validation = validateMockOrderPageFillPlan(plan);
  const url = buildMockOrderPageUrlFromFillPlan(plan);

  expect(validation).toEqual({ ok: true, errors: [], warnings: [] });
  expect(plan.values).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        fieldKey: "ticker",
        selector: MOCK_ORDER_PAGE_AGENT_SELECTORS.ticker,
        value: "QA.TEST",
      }),
      expect.objectContaining({
        fieldKey: "action",
        selector: MOCK_ORDER_PAGE_AGENT_SELECTORS.action,
        value: "buy",
      }),
      expect.objectContaining({
        fieldKey: "quantity",
        selector: MOCK_ORDER_PAGE_AGENT_SELECTORS.quantity,
        value: "42",
      }),
      expect.objectContaining({
        fieldKey: "orderType",
        selector: MOCK_ORDER_PAGE_AGENT_SELECTORS.orderType,
        value: "limit",
      }),
      expect.objectContaining({
        fieldKey: "requestId",
        selector: MOCK_ORDER_PAGE_AGENT_SELECTORS.requestId,
        value: "request_mock_contract",
      }),
      expect.objectContaining({
        fieldKey: "intentId",
        selector: MOCK_ORDER_PAGE_AGENT_SELECTORS.intentId,
        value: "intent_mock_contract",
      }),
    ]),
  );
  expect(url).toContain("/mock-broker/order?");
  expect(url).toContain("ticker=QA.TEST");
  expect(url).toContain("requestId=request_mock_contract");
  expect(url).not.toContain("broker_result");
});

test("builds and validates a mock confirmation payload without broker result", () => {
  const payload = {
    action: "sell",
    executedPrice: "123.10",
    intentId: "intent_mock_confirmation",
    message: "Mock confirmation contract only.",
    orderId: "mock_order_001",
    positionId: "position_mock_confirmation",
    quantity: "5",
    recommendationId: "recommendation_mock_confirmation",
    requestId: "request_mock_confirmation",
    requestedPrice: "123.45",
    status: "filled" as const,
    ticker: "QA.CONFIRM",
  };
  const validation = validateMockOrderConfirmationPayload(payload);
  const url = buildMockOrderConfirmationUrl(payload);

  expect(validation).toEqual({ ok: true, errors: [], warnings: [] });
  expect(url).toContain("/mock-broker/confirmation?");
  expect(url).toContain("status=filled");
  expect(url).toContain("ticker=QA.CONFIRM");
  expect(url).toContain("requestId=request_mock_confirmation");
  expect(url).not.toContain("brokerResult");
  expect(url).not.toContain("broker_result");
});

test("maps mock confirmation payloads to dev mock broker results only", () => {
  const filledResult = buildDevMockBrokerExecutionResultFromConfirmationPayload(
    {
      action: "sell",
      executedPrice: "122.95",
      intentId: "intent_dev_mock_filled",
      message: "Mock filled mapping only.",
      orderId: "mock_order_filled_001",
      positionId: "position_dev_mock_filled",
      quantity: "8",
      recommendationId: "recommendation_dev_mock_filled",
      requestId: "request_dev_mock_filled",
      requestedPrice: "123.45",
      status: "filled",
      ticker: "QA.MAP",
    },
    {
      createdAt: "2026-06-10T10:00:00.000Z",
      requireQuantity: true,
      requireTicker: true,
    },
  );
  const filledValidation = validateDevMockBrokerExecutionResult(filledResult, {
    requireQuantity: true,
    requireTicker: true,
  });

  expect(filledValidation).toEqual({ ok: true, errors: [], warnings: [] });
  expect(filledResult).toEqual(
    expect.objectContaining({
      source: "mock_broker",
      isMock: true,
      status: "filled",
      ticker: "QA.MAP",
      action: "sell",
      quantity: 8,
      requestedPrice: 123.45,
      executedPrice: 122.95,
      orderId: "mock_order_filled_001",
      requestId: "request_dev_mock_filled",
      intentId: "intent_dev_mock_filled",
    }),
  );
  expect(filledResult).not.toHaveProperty("brokerResult");
  expect(filledResult).not.toHaveProperty("tureExecutionRecord");

  for (const status of ["rejected", "cancelled"] as const) {
    const result = buildDevMockBrokerExecutionResultFromConfirmationPayload(
      {
        action: "buy",
        executedPrice: "",
        intentId: `intent_dev_mock_${status}`,
        message: `Mock ${status} mapping only.`,
        orderId: `mock_order_${status}_001`,
        positionId: `position_dev_mock_${status}`,
        quantity: "3",
        recommendationId: `recommendation_dev_mock_${status}`,
        requestId: `request_dev_mock_${status}`,
        requestedPrice: "55.25",
        status,
        ticker: `QA.${status.toUpperCase()}`,
      },
      { requireQuantity: true, requireTicker: true },
    );
    const validation = validateDevMockBrokerExecutionResult(result, {
      requireQuantity: true,
      requireTicker: true,
    });

    expect(validation.ok).toBe(true);
    expect(result.source).toBe("mock_broker");
    expect(result.isMock).toBe(true);
    expect(result.status).toBe(status);
    expect(result.quantity).toBe(3);
    expect(result).not.toHaveProperty("brokerResult");
    expect(result).not.toHaveProperty("tureExecutionRecord");
  }
});

test("converts dev mock broker results to broker execution result previews only", () => {
  const filledMockResult = buildDevMockBrokerExecutionResultFromConfirmationPayload(
    {
      action: "sell",
      executedPrice: "122.95",
      intentId: "intent_dev_mock_conversion_filled",
      message: "Mock filled conversion only.",
      orderId: "mock_order_conversion_filled_001",
      positionId: "position_dev_mock_conversion_filled",
      quantity: "8",
      recommendationId: "recommendation_dev_mock_conversion_filled",
      requestId: "request_dev_mock_conversion_filled",
      requestedPrice: "123.45",
      status: "filled",
      ticker: "QA.CONVERT",
    },
    {
      createdAt: "2026-06-10T11:00:00.000Z",
      requireQuantity: true,
      requireTicker: true,
    },
  );
  const filledConversion = convertDevMockBrokerResultToBrokerExecutionResult(
    filledMockResult,
    {
      convertedAt: "2026-06-10T11:01:00.000Z",
      mode: "semi_automatic",
    },
  );

  expect(filledConversion.ok).toBe(true);
  expect(filledConversion.source).toBe("dev_mock_broker_result");
  expect(filledConversion.isMockConversion).toBe(true);
  expect(filledConversion.warnings).toContain(
    "Mock result converted to avanza-shaped BrokerExecutionResult for dev testing only.",
  );
  expect(filledConversion.brokerResult).toEqual(
    expect.objectContaining({
      broker_hint: "AVANZA",
      broker: "avanza",
      status: "filled",
      action: "sell",
      ticker: "QA.CONVERT",
      quantity: 8,
      filled_quantity: 8,
      average_fill_price: 122.95,
      broker_order_id: "mock_order_conversion_filled_001",
      rawBrokerSummary:
        "DEV MOCK CONVERSION - not a real Avanza confirmation.",
    }),
  );
  expect(filledConversion.brokerResult?.notes).toContain(
    "DEV MOCK CONVERSION - not a real Avanza confirmation.",
  );
  expect(filledConversion.brokerResult?.metadata).toEqual(
    expect.objectContaining({
      source: "dev_mock_broker_result",
      isMockConversion: true,
      originalSource: "mock_broker",
      mode: "semi_automatic",
    }),
  );
  expect(buildDevMockCaptureDuplicateKey(filledMockResult)).toBe(
    buildDevMockCaptureDuplicateKeyFromRecord({
      recordId: "dev_mock_capture_test",
      createdAt: "2026-06-10T11:02:00.000Z",
      broker: "avanza",
      mode: "semi_automatic",
      action: "sell",
      intentId: "intent_dev_mock_conversion_filled",
      recommendationId: "recommendation_dev_mock_conversion_filled",
      positionId: "position_dev_mock_conversion_filled",
      ticker: "QA.CONVERT",
      instrumentName: null,
      quantity: 8,
      requestedPrice: 123.45,
      executedPrice: 122.95,
      orderId: "mock_order_conversion_filled_001",
      brokerTimestamp: "2026-06-10T11:00:00.000Z",
      brokerStatus: "filled",
      intent: null,
      brokerResult: filledConversion.brokerResult ?? null,
      captureStatus: "captured",
      reason: "DEV MOCK CAPTURE - local diagnostics only.",
    }),
  );
  expect(filledConversion.brokerResult).not.toHaveProperty(
    "tureExecutionRecord",
  );

  for (const status of ["rejected", "cancelled"] as const) {
    const mockResult = buildDevMockBrokerExecutionResultFromConfirmationPayload(
      {
        action: "buy",
        executedPrice: "",
        intentId: `intent_dev_mock_conversion_${status}`,
        message: `Mock ${status} conversion only.`,
        orderId: `mock_order_conversion_${status}_001`,
        positionId: `position_dev_mock_conversion_${status}`,
        quantity: "3",
        recommendationId: `recommendation_dev_mock_conversion_${status}`,
        requestId: `request_dev_mock_conversion_${status}`,
        requestedPrice: "55.25",
        status,
        ticker: `QA.${status.toUpperCase()}`,
      },
      {
        createdAt: "2026-06-10T11:05:00.000Z",
        requireQuantity: true,
        requireTicker: true,
      },
    );
    const conversion = convertDevMockBrokerResultToBrokerExecutionResult(
      mockResult,
      {
        convertedAt: "2026-06-10T11:06:00.000Z",
      },
    );

    expect(conversion.ok).toBe(true);
    expect(conversion.brokerResult).toEqual(
      expect.objectContaining({
        broker_hint: "AVANZA",
        broker: "avanza",
        status,
        action: "buy",
        ticker: `QA.${status.toUpperCase()}`,
        quantity: 3,
        filled_quantity: null,
        average_fill_price: null,
        rawBrokerSummary:
          "DEV MOCK CONVERSION - not a real Avanza confirmation.",
      }),
    );
    expect(conversion.brokerResult).not.toHaveProperty("tureExecutionRecord");
  }

  const malformedConversion = convertDevMockBrokerResultToBrokerExecutionResult({
    ...filledMockResult,
    action: "hold",
    quantity: undefined,
  });

  expect(malformedConversion.ok).toBe(false);
  expect(malformedConversion.brokerResult).toBeUndefined();
  expect(malformedConversion.errors).toEqual(
    expect.arrayContaining([
      "Dev mock broker execution result action must be buy or sell when present.",
      "Dev mock broker execution result quantity is required.",
      "Dev mock broker result action must be buy or sell.",
      "Dev mock broker result quantity is required for conversion.",
    ]),
  );
});

test("validates execution server capture fixtures and deterministic idempotency", () => {
  const validRequest = buildValidDevMockExecutionServerCaptureRequest();
  const validValidation = validateExecutionServerCaptureRequest(validRequest);
  const rebuiltIdempotencyKey = buildExecutionServerCaptureIdempotencyKey({
    intent: validRequest.intent,
    brokerResult: validRequest.brokerResult,
    source: validRequest.source,
    environment: validRequest.environment,
    isMock: validRequest.isMock,
    isDev: validRequest.isDev,
  });

  expect(validValidation).toEqual(
    expect.objectContaining({
      ok: true,
      errors: [],
      idempotencyKey: validRequest.idempotencyKey,
      normalizedSource: "mock",
      normalizedEnvironment: "local_dev",
    }),
  );
  expect(validRequest.idempotencyKey).toBe(rebuiltIdempotencyKey);
  expect(buildValidDevMockExecutionServerCaptureRequest().idempotencyKey).toBe(
    validRequest.idempotencyKey,
  );

  const missingIntentValidation = validateExecutionServerCaptureRequest(
    buildInvalidExecutionServerCaptureRequestMissingIntent(),
  );

  expect(missingIntentValidation.ok).toBe(false);
  expect(missingIntentValidation.errors).toEqual(
    expect.arrayContaining(["Execution server capture intent is missing."]),
  );

  const missingBrokerResultValidation = validateExecutionServerCaptureRequest(
    buildInvalidExecutionServerCaptureRequestMissingBrokerResult(),
  );

  expect(missingBrokerResultValidation.ok).toBe(false);
  expect(missingBrokerResultValidation.errors).toEqual(
    expect.arrayContaining(["Broker execution result is missing."]),
  );

  const mismatchValidation = validateExecutionServerCaptureRequest(
    buildMismatchedExecutionServerCaptureRequest(),
  );

  expect(mismatchValidation.ok).toBe(false);
  expect(mismatchValidation.errors).toEqual(
    expect.arrayContaining([
      "Broker result action does not match execution intent action.",
      "Broker result ticker does not match execution intent ticker.",
      "Broker result quantity does not match execution intent quantity.",
      "Filled quantity does not match the execution intent quantity.",
    ]),
  );

  const productionMockValidation = validateExecutionServerCaptureRequest(
    buildProductionMockExecutionServerCaptureRequest(),
  );

  expect(productionMockValidation.ok).toBe(false);
  expect(productionMockValidation.errors).toEqual(
    expect.arrayContaining([
      "Production execution capture cannot be mock/dev data.",
    ]),
  );
});

test("validates execution capture requests through the dev-only API stub", async ({
  context,
}) => {
  const captureRequest = buildValidDevMockExecutionServerCaptureRequest();
  const response = await context.request.post("/api/execution/capture", {
    data: captureRequest,
  });
  const body = await response.json();

  if (process.env.NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS === "false") {
    expect(response.status()).toBe(403);
    expect(body).toEqual(
      expect.objectContaining({
        version: EXECUTION_SERVER_CAPTURE_CONTRACT_VERSION,
        status: "invalid",
        message: "Execution capture stub is disabled in this build.",
      }),
    );
    expect(body).not.toHaveProperty("record");
    return;
  }

  expect(response.status()).toBe(202);
  expect(body).toEqual(
    expect.objectContaining({
      version: EXECUTION_SERVER_CAPTURE_CONTRACT_VERSION,
      status: "accepted",
      idempotencyKey: captureRequest.idempotencyKey,
      message:
        "Capture request accepted by dev stub only. No Supabase write or trade mutation occurred.",
    }),
  );
  expect(body).not.toHaveProperty("record");
  expect(body).not.toHaveProperty("brokerResult");
  expect(body.message).toContain("No Supabase write");
  expect(body.message).toContain("trade mutation");
});

test("rejects invalid missing-field execution capture API stub requests", async ({
  context,
}) => {
  const response = await context.request.post("/api/execution/capture", {
    data: buildInvalidExecutionServerCaptureRequestMissingIntent(),
  });
  const body = await response.json();

  if (process.env.NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS === "false") {
    expect(response.status()).toBe(403);
    expect(body.message).toBe(
      "Execution capture stub is disabled in this build.",
    );
    return;
  }

  expect(response.status()).toBe(400);
  expect(body).toEqual(
    expect.objectContaining({
      version: EXECUTION_SERVER_CAPTURE_CONTRACT_VERSION,
      status: "invalid",
      idempotencyKey:
        buildInvalidExecutionServerCaptureRequestMissingIntent().idempotencyKey,
    }),
  );
  expect(body.errors).toEqual(
    expect.arrayContaining([
      "Execution server capture intent is missing.",
    ]),
  );
  expect(body).not.toHaveProperty("record");

  const missingBrokerResultResponse = await context.request.post(
    "/api/execution/capture",
    {
      data: buildInvalidExecutionServerCaptureRequestMissingBrokerResult(),
    },
  );
  const missingBrokerResultBody = await missingBrokerResultResponse.json();

  expect(missingBrokerResultResponse.status()).toBe(400);
  expect(missingBrokerResultBody.errors).toEqual(
    expect.arrayContaining([
      "Broker execution result is missing.",
    ]),
  );
  expect(missingBrokerResultBody).not.toHaveProperty("record");
});

test("rejects mismatched execution capture API stub requests", async ({
  context,
}) => {
  const response = await context.request.post("/api/execution/capture", {
    data: buildMismatchedExecutionServerCaptureRequest(),
  });
  const body = await response.json();

  if (process.env.NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS === "false") {
    expect(response.status()).toBe(403);
    expect(body.message).toBe(
      "Execution capture stub is disabled in this build.",
    );
    return;
  }

  expect(response.status()).toBe(400);
  expect(body.errors).toEqual(
    expect.arrayContaining([
      "Broker result action does not match execution intent action.",
      "Broker result ticker does not match execution intent ticker.",
      "Broker result quantity does not match execution intent quantity.",
    ]),
  );
  expect(body).not.toHaveProperty("record");
});

test("rejects production mock execution capture requests", async ({
  context,
}) => {
  const response = await context.request.post("/api/execution/capture", {
    data: buildProductionMockExecutionServerCaptureRequest(),
  });
  const body = await response.json();

  if (process.env.NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS === "false") {
    expect(response.status()).toBe(403);
    expect(body.message).toBe(
      "Execution capture stub is disabled in this build.",
    );
    return;
  }

  expect(response.status()).toBe(400);
  expect(body.errors).toEqual(
    expect.arrayContaining([
      "Production execution capture cannot be mock/dev data.",
    ]),
  );
  expect(body).not.toHaveProperty("record");
});

test("rejects malformed JSON for the execution capture API stub", async ({
  context,
}) => {
  const response = await context.request.post("/api/execution/capture", {
    data: Buffer.from("{not-json"),
    headers: {
      "content-type": "application/json",
    },
  });
  const body = await response.json();

  if (process.env.NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS === "false") {
    expect(response.status()).toBe(403);
    expect(body.message).toBe(
      "Execution capture stub is disabled in this build.",
    );
    return;
  }

  expect(response.status()).toBe(400);
  expect(body).toEqual(
    expect.objectContaining({
      version: EXECUTION_SERVER_CAPTURE_CONTRACT_VERSION,
      status: "invalid",
      message: "Execution capture request body must be valid JSON.",
    }),
  );
  expect(body.errors).toEqual(
    expect.arrayContaining([
      "Execution capture request body must be valid JSON.",
    ]),
  );
});

test("validates execution audit persistence contract fixtures", () => {
  const lifecycleValidation = validatePersistExecutionLifecycleEventRequest(
    buildPersistLifecycleEventRequestFixture(),
  );
  const invalidLifecycleValidation = validatePersistExecutionLifecycleEventRequest(
    buildInvalidPersistLifecycleEventRequestFixture(),
  );
  const runValidation = validatePersistExecutionAgentRunRequest(
    buildPersistAgentRunRequestFixture(),
  );
  const progressValidation = validatePersistExecutionAgentProgressEventRequest(
    buildPersistAgentProgressEventRequestFixture(),
  );
  const productionMockValidation = validatePersistExecutionAgentRunRequest({
    ...buildPersistAgentRunRequestFixture(),
    sourceEnvironment: "production",
    isMock: true,
    isDev: false,
  });

  expect(lifecycleValidation).toEqual(
    expect.objectContaining({
      ok: true,
      errors: [],
      normalizedSourceEnvironment: "local_dev",
    }),
  );
  expect(invalidLifecycleValidation.ok).toBe(false);
  expect(invalidLifecycleValidation.errors).toEqual(
    expect.arrayContaining(["Execution lifecycle event type is missing."]),
  );
  expect(runValidation).toEqual(
    expect.objectContaining({
      ok: true,
      errors: [],
      normalizedSourceEnvironment: "local_dev",
    }),
  );
  expect(progressValidation).toEqual(
    expect.objectContaining({
      ok: true,
      errors: [],
      normalizedSourceEnvironment: "local_dev",
    }),
  );
  expect(productionMockValidation.ok).toBe(false);
  expect(productionMockValidation.errors).toEqual(
    expect.arrayContaining([
      "Production execution audit persistence cannot be mock/dev data.",
    ]),
  );
});

test("maps execution audit persistence requests to insert payload drafts", () => {
  const lifecycleRequest = buildPersistLifecycleEventRequestFixture();
  const lifecycleMapping =
    mapLifecycleEventRequestToInsertPayload(lifecycleRequest);

  expect(lifecycleMapping).toEqual(
    expect.objectContaining({
      ok: true,
      errors: [],
    }),
  );
  expect(lifecycleMapping.payload).toEqual(
    expect.objectContaining({
      created_at: "2026-06-10T09:00:01.000Z",
      user_id: null,
      intent_id: "intent_audit_persistence_fixture",
      event_type: "create_intent",
      state_from: "idle",
      state_to: "intent_created",
      source: "api_stub",
      source_environment: "local_dev",
      is_mock: true,
      is_dev: true,
      message: "Audit persistence route fixture only.",
    }),
  );
  expect(lifecycleMapping.payload?.payload).toEqual(
    expect.objectContaining({
      submittedAt: lifecycleRequest.submittedAt,
    }),
  );
  expect(lifecycleMapping.payload?.metadata).toEqual(
    expect.objectContaining({
      path: "execution_audit_lifecycle_stub_e2e",
      eventId: "event_audit_persistence_fixture",
    }),
  );

  const runMapping = mapAgentRunRequestToInsertPayload(
    buildPersistAgentRunRequestFixture(),
  );

  expect(runMapping).toEqual(
    expect.objectContaining({
      ok: true,
      errors: [],
    }),
  );
  expect(runMapping.payload).toEqual(
    expect.objectContaining({
      created_at: "2026-06-10T09:01:00.000Z",
      updated_at: "2026-06-10T09:01:30.000Z",
      user_id: null,
      request_id: "request_mock_contract",
      intent_id: "intent_mock_contract",
      recommendation_id: "recommendation_mock_contract",
      ticker: "QA.TEST",
      action: "buy",
      mode: "semi_automatic",
      broker: "avanza",
      result_status: "waiting_for_manual_confirmation",
      broker_result_present: false,
      source_environment: "local_dev",
      is_mock: true,
      is_dev: true,
    }),
  );
  expect(runMapping.payload?.request_summary).toEqual(
    expect.objectContaining({
      requestId: "request_mock_contract",
      version: "avanza_agent_request_v1",
    }),
  );
  expect(runMapping.payload?.metadata).toEqual(
    expect.objectContaining({
      runId: "agent_run_audit_persistence_fixture",
      progressEventCount: 1,
    }),
  );

  const progressMapping = mapAgentProgressEventRequestToInsertPayload(
    buildPersistAgentProgressEventRequestFixture(),
  );

  expect(progressMapping).toEqual(
    expect.objectContaining({
      ok: true,
      errors: [],
    }),
  );
  expect(progressMapping.payload).toEqual(
    expect.objectContaining({
      created_at: "2026-06-10T09:02:00.000Z",
      user_id: null,
      agent_run_id: null,
      request_id: "request_audit_progress_fixture",
      event_type: "order_review_ready",
      lifecycle_event_type: null,
      message: "Audit persistence progress route fixture only.",
      source_environment: "local_dev",
      is_mock: true,
      is_dev: true,
    }),
  );
  expect(progressMapping.warnings).toEqual(
    expect.arrayContaining([
      "Agent run id is not a database UUID; storing it in metadata only.",
    ]),
  );
  expect(progressMapping.payload?.metadata).toEqual(
    expect.objectContaining({
      externalAgentRunId: "agent_run_audit_persistence_fixture",
      eventId: "agent_progress_event_audit_persistence_fixture",
    }),
  );

  const invalidMapping = mapLifecycleEventRequestToInsertPayload(
    buildInvalidPersistLifecycleEventRequestFixture() as PersistExecutionLifecycleEventRequest,
  );

  expect(invalidMapping.ok).toBe(false);
  expect(invalidMapping.payload).toBeUndefined();
  expect(invalidMapping.errors).toEqual(
    expect.arrayContaining(["Execution lifecycle event type is missing."]),
  );

  const noopWriter = createNoopExecutionAuditPersistenceWriter();
  const noopResult = noopWriter.persistLifecycleEvent(lifecycleRequest);

  expect(noopResult).toEqual(
    expect.objectContaining({
      ok: true,
      persisted: false,
      message:
        "Execution audit persistence writer draft did not write to Supabase.",
    }),
  );
  expect(noopResult.warnings).toEqual(
    expect.arrayContaining([
      "No-op writer draft only. Routes are not wired to persist audit data.",
    ]),
  );
});

test("guards audit Supabase persistence behind server-side flags", () => {
  expect(isExecutionAuditSupabasePersistenceEnabled({})).toBe(false);
  expect(isExecutionAuditSupabaseWriterEnabled({})).toBe(false);
  expect(getExecutionPersistenceEnvironment({})).toBe("local_dev");

  const disabled = assertExecutionAuditPersistenceAllowed({});

  expect(disabled).toEqual(
    expect.objectContaining({
      ok: false,
      environment: "local_dev",
      persistenceEnabled: false,
      writerEnabled: false,
      productionAllowed: false,
    }),
  );
  expect(disabled.errors).toEqual(
    expect.arrayContaining([
      "Execution audit Supabase persistence is disabled. Set EXECUTION_AUDIT_SUPABASE_PERSISTENCE_ENABLED=true to enable future writes.",
    ]),
  );

  const enabledLocal = assertExecutionAuditPersistenceAllowed({
    EXECUTION_AUDIT_SUPABASE_PERSISTENCE_ENABLED: "true",
    EXECUTION_PERSISTENCE_ENVIRONMENT: "local_dev",
    NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS: "true",
  });

  expect(enabledLocal).toEqual(
    expect.objectContaining({
      ok: true,
      environment: "local_dev",
      persistenceEnabled: true,
      writerEnabled: false,
      productionAllowed: false,
      errors: [],
      warnings: [],
    }),
  );

  const enabledStagingWithoutDevTools =
    assertExecutionAuditPersistenceAllowed({
      EXECUTION_AUDIT_SUPABASE_PERSISTENCE_ENABLED: "true",
      EXECUTION_PERSISTENCE_ENVIRONMENT: "staging",
    });

  expect(enabledStagingWithoutDevTools).toEqual(
    expect.objectContaining({
      ok: true,
      environment: "staging",
      persistenceEnabled: true,
      writerEnabled: false,
    }),
  );
  expect(enabledStagingWithoutDevTools.warnings).toEqual(
    expect.arrayContaining([
      "Execution audit Supabase persistence is enabled while execution dev tools are disabled; confirm this is intentional for server-side writes.",
    ]),
  );

  const unknownEnvironment = assertExecutionAuditPersistenceAllowed({
    EXECUTION_AUDIT_SUPABASE_PERSISTENCE_ENABLED: "true",
    EXECUTION_PERSISTENCE_ENVIRONMENT: "qa",
    NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS: "true",
  });

  expect(unknownEnvironment).toEqual(
    expect.objectContaining({
      ok: true,
      environment: "local_dev",
      persistenceEnabled: true,
      writerEnabled: false,
    }),
  );
  expect(getExecutionPersistenceEnvironmentWarnings({
    EXECUTION_PERSISTENCE_ENVIRONMENT: "qa",
  })).toEqual([
    'Unknown EXECUTION_PERSISTENCE_ENVIRONMENT "qa" normalized to local_dev.',
  ]);

  const productionBlocked = assertExecutionAuditPersistenceAllowed({
    EXECUTION_AUDIT_SUPABASE_PERSISTENCE_ENABLED: "true",
    EXECUTION_PERSISTENCE_ENVIRONMENT: "production",
    NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS: "true",
  });

  expect(productionBlocked).toEqual(
    expect.objectContaining({
      ok: false,
      environment: "production",
      persistenceEnabled: true,
      writerEnabled: false,
      productionAllowed: false,
    }),
  );
  expect(productionBlocked.errors).toEqual(
    expect.arrayContaining([
      "Execution audit Supabase persistence is blocked in production unless EXECUTION_AUDIT_SUPABASE_ALLOW_PRODUCTION=true is also set.",
    ]),
  );

  const productionAllowed = assertExecutionAuditPersistenceAllowed({
    EXECUTION_AUDIT_SUPABASE_PERSISTENCE_ENABLED: "true",
    EXECUTION_PERSISTENCE_ENVIRONMENT: "production",
    EXECUTION_AUDIT_SUPABASE_ALLOW_PRODUCTION: "true",
    NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS: "true",
  });

  expect(productionAllowed).toEqual(
    expect.objectContaining({
      ok: true,
      environment: "production",
      persistenceEnabled: true,
      writerEnabled: false,
      productionAllowed: true,
    }),
  );
  expect(productionAllowed.warnings).toEqual(
    expect.arrayContaining([
      "Production audit persistence was explicitly allowed. This is not recommended until RLS and user_id ownership are finalized.",
    ]),
  );

  const writerWithoutPersistence = assertExecutionAuditPersistenceAllowed({
    EXECUTION_AUDIT_SUPABASE_WRITER_ENABLED: "true",
    NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS: "true",
  });

  expect(writerWithoutPersistence).toEqual(
    expect.objectContaining({
      ok: false,
      environment: "local_dev",
      persistenceEnabled: false,
      writerEnabled: true,
    }),
  );
  expect(writerWithoutPersistence.warnings).toEqual(
    expect.arrayContaining([
      "Execution audit Supabase writer flag is enabled while persistence is disabled; writer will not be used.",
    ]),
  );
});

test("branches audit route persistence through flags without database writes", async () => {
  const lifecycleRequest = buildPersistLifecycleEventRequestFixture();
  const flagOffResponse = await buildExecutionAuditPersistenceRouteResponse({
    kind: "lifecycle_event",
    request: lifecycleRequest,
    id: lifecycleRequest.event.eventId,
    stubMessage:
      "Execution lifecycle event accepted by dev stub only. No Supabase write occurred.",
    env: {},
  });

  expect(flagOffResponse).toEqual(
    expect.objectContaining({
      statusCode: 202,
    }),
  );
  expect(flagOffResponse.response).toEqual(
    expect.objectContaining({
      status: "accepted",
      id: "event_audit_persistence_fixture",
      message:
        "Execution lifecycle event accepted by dev stub only. No Supabase write occurred.",
      warnings: [],
    }),
  );
  expect(flagOffResponse.response.metadata).toEqual(
    expect.objectContaining({
      persisted: false,
      writerMode: "stub",
    }),
  );

  const noOpResponse = await buildExecutionAuditPersistenceRouteResponse({
    kind: "agent_run",
    request: buildPersistAgentRunRequestFixture(),
    id: "agent_run_audit_persistence_fixture",
    stubMessage:
      "Execution agent run accepted by dev stub only. No Supabase write occurred.",
    env: {
      EXECUTION_AUDIT_SUPABASE_PERSISTENCE_ENABLED: "true",
      EXECUTION_PERSISTENCE_ENVIRONMENT: "local_dev",
      NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS: "true",
    },
  });

  expect(noOpResponse.statusCode).toBe(202);
  expect(noOpResponse.response).toEqual(
    expect.objectContaining({
      status: "accepted",
      id: "agent_run_audit_persistence_fixture",
      message:
        "Execution audit request accepted by no-op persistence writer. Supabase persistence flag is enabled, but no database write occurred.",
    }),
  );
  expect(noOpResponse.response.warnings).toEqual(
    expect.arrayContaining([
      "Supabase persistence flag is enabled, but this build uses no-op writer. No database write occurred.",
      "No-op writer draft only. Routes are not wired to persist audit data.",
    ]),
  );
  expect(noOpResponse.response.metadata).toEqual(
    expect.objectContaining({
      persisted: false,
      table: EXECUTION_AUDIT_TABLES.agentRuns,
      writerMode: "no_op",
    }),
  );

  const productionBlockedResponse = await buildExecutionAuditPersistenceRouteResponse({
    kind: "agent_progress_event",
    request: buildPersistAgentProgressEventRequestFixture(),
    id: "agent_progress_event_audit_persistence_fixture",
    stubMessage:
      "Execution agent progress event accepted by dev stub only. No Supabase write occurred.",
    env: {
      EXECUTION_AUDIT_SUPABASE_PERSISTENCE_ENABLED: "true",
      EXECUTION_PERSISTENCE_ENVIRONMENT: "production",
      NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS: "true",
    },
  });

  expect(productionBlockedResponse.statusCode).toBe(403);
  expect(productionBlockedResponse.response).toEqual(
    expect.objectContaining({
      status: "disabled",
      message:
        "Execution audit Supabase persistence is not allowed for this environment. No database write occurred.",
    }),
  );
  expect(productionBlockedResponse.response.errors).toEqual(
    expect.arrayContaining([
      "Execution audit Supabase persistence is blocked in production unless EXECUTION_AUDIT_SUPABASE_ALLOW_PRODUCTION=true is also set.",
    ]),
  );

  const missingClientResponse = await buildExecutionAuditPersistenceRouteResponse({
    kind: "lifecycle_event",
    request: lifecycleRequest,
    id: lifecycleRequest.event.eventId,
    stubMessage:
      "Execution lifecycle event accepted by dev stub only. No Supabase write occurred.",
    env: {
      EXECUTION_AUDIT_SUPABASE_PERSISTENCE_ENABLED: "true",
      EXECUTION_AUDIT_SUPABASE_WRITER_ENABLED: "true",
      EXECUTION_PERSISTENCE_ENVIRONMENT: "local_dev",
      NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS: "true",
    },
  });

  expect(missingClientResponse.statusCode).toBe(503);
  expect(missingClientResponse.response).toEqual(
    expect.objectContaining({
      status: "failed",
      message:
        "Execution audit Supabase writer failed or was unavailable. No confirmed database write occurred.",
    }),
  );
  expect(missingClientResponse.response.errors).toEqual([
    "Supabase writer requires a server DB client.",
  ]);
  expect(missingClientResponse.response.metadata).toEqual(
    expect.objectContaining({
      persisted: false,
      table: EXECUTION_AUDIT_TABLES.lifecycleEvents,
      writerMode: "supabase",
    }),
  );

  const routeDbCalls: Array<{ table: string; payload: unknown }> = [];
  const supabaseResponse = await buildExecutionAuditPersistenceRouteResponse({
    kind: "agent_progress_event",
    request: buildPersistAgentProgressEventRequestFixture(),
    id: "agent_progress_event_audit_persistence_fixture",
    getDbClient: () =>
      createFakeExecutionAuditDb(
        { data: { id: "route_inserted_progress" }, error: null },
        routeDbCalls,
      ),
    stubMessage:
      "Execution agent progress event accepted by dev stub only. No Supabase write occurred.",
    env: {
      EXECUTION_AUDIT_SUPABASE_PERSISTENCE_ENABLED: "true",
      EXECUTION_AUDIT_SUPABASE_WRITER_ENABLED: "true",
      EXECUTION_PERSISTENCE_ENVIRONMENT: "local_dev",
      NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS: "true",
    },
  });

  expect(supabaseResponse.statusCode).toBe(202);
  expect(supabaseResponse.response).toEqual(
    expect.objectContaining({
      status: "accepted",
      id: "route_inserted_progress",
      message: "Execution audit Supabase writer inserted the audit row.",
    }),
  );
  expect(supabaseResponse.response.metadata).toEqual(
    expect.objectContaining({
      persisted: true,
      table: EXECUTION_AUDIT_TABLES.agentProgressEvents,
      writerMode: "supabase",
    }),
  );
  expect(routeDbCalls).toHaveLength(1);
  expect(routeDbCalls[0]?.table).toBe(
    EXECUTION_AUDIT_TABLES.agentProgressEvents,
  );
});

test("draft Supabase audit writer uses injected DB and fails safely", async () => {
  const successCalls: Array<{ table: string; payload: unknown }> = [];
  const successDb = createFakeExecutionAuditDb(
    {
      data: { id: "audit_row_inserted" },
      error: null,
    },
    successCalls,
  );
  const writer = createSupabaseExecutionAuditPersistenceWriter({
    db: successDb,
    env: {
      EXECUTION_AUDIT_SUPABASE_PERSISTENCE_ENABLED: "true",
      EXECUTION_PERSISTENCE_ENVIRONMENT: "local_dev",
      NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS: "true",
    },
  });
  const lifecycleResult = await writer.persistLifecycleEvent(
    buildPersistLifecycleEventRequestFixture(),
  );

  expect(lifecycleResult).toEqual(
    expect.objectContaining({
      ok: true,
      persisted: true,
      table: EXECUTION_AUDIT_TABLES.lifecycleEvents,
      id: "audit_row_inserted",
      message: "Execution audit Supabase writer inserted the audit row.",
      errors: [],
    }),
  );
  expect(successCalls).toHaveLength(1);
  expect(successCalls[0]).toEqual(
    expect.objectContaining({
      table: EXECUTION_AUDIT_TABLES.lifecycleEvents,
    }),
  );
  expect(successCalls[0]?.payload).toEqual(
    expect.objectContaining({
      event_type: "create_intent",
      source_environment: "local_dev",
      is_mock: true,
      is_dev: true,
    }),
  );

  const errorCalls: Array<{ table: string; payload: unknown }> = [];
  const errorDb = createFakeExecutionAuditDb(
    {
      error: { message: "relation does not exist" },
    },
    errorCalls,
  );
  const errorWriter = createSupabaseExecutionAuditPersistenceWriter({
    db: errorDb,
    env: {
      EXECUTION_AUDIT_SUPABASE_PERSISTENCE_ENABLED: "true",
      EXECUTION_PERSISTENCE_ENVIRONMENT: "staging",
      NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS: "true",
    },
  });
  const runResult = await errorWriter.persistAgentRun(
    buildPersistAgentRunRequestFixture(),
  );

  expect(runResult).toEqual(
    expect.objectContaining({
      ok: false,
      persisted: false,
      table: EXECUTION_AUDIT_TABLES.agentRuns,
      message:
        "Execution audit Supabase writer insert failed. No confirmed database row was persisted.",
    }),
  );
  expect(runResult.errors).toEqual(["relation does not exist"]);
  expect(errorCalls).toHaveLength(1);
  expect(errorCalls[0]?.table).toBe(EXECUTION_AUDIT_TABLES.agentRuns);

  const blockedCalls: Array<{ table: string; payload: unknown }> = [];
  const blockedWriter = createSupabaseExecutionAuditPersistenceWriter({
    db: createFakeExecutionAuditDb({ data: { id: "should_not_insert" } }, blockedCalls),
    env: {
      EXECUTION_AUDIT_SUPABASE_PERSISTENCE_ENABLED: "true",
      EXECUTION_PERSISTENCE_ENVIRONMENT: "production",
      NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS: "true",
    },
  });
  const blockedResult = await blockedWriter.persistAgentProgressEvent(
    buildPersistAgentProgressEventRequestFixture(),
  );

  expect(blockedResult).toEqual(
    expect.objectContaining({
      ok: false,
      persisted: false,
      table: EXECUTION_AUDIT_TABLES.agentProgressEvents,
      message:
        "Execution audit Supabase writer skipped persistence because flags do not allow writes.",
    }),
  );
  expect(blockedResult.errors).toEqual(
    expect.arrayContaining([
      "Execution audit Supabase persistence is blocked in production unless EXECUTION_AUDIT_SUPABASE_ALLOW_PRODUCTION=true is also set.",
    ]),
  );
  expect(blockedCalls).toHaveLength(0);

  const missingClientWriter = createSupabaseExecutionAuditPersistenceWriter({
    env: {
      EXECUTION_AUDIT_SUPABASE_PERSISTENCE_ENABLED: "true",
      EXECUTION_PERSISTENCE_ENVIRONMENT: "local_dev",
      NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS: "true",
    },
  });
  const missingClientResult = await missingClientWriter.persistLifecycleEvent(
    buildPersistLifecycleEventRequestFixture(),
  );

  expect(missingClientResult).toEqual(
    expect.objectContaining({
      ok: false,
      persisted: false,
      table: EXECUTION_AUDIT_TABLES.lifecycleEvents,
      message:
        "Execution audit Supabase writer requires a server DB client. No database write occurred.",
    }),
  );
  expect(missingClientResult.errors).toEqual([
    "Supabase writer requires a server DB client.",
  ]);
});

test("accepts valid execution audit persistence route stub requests", async ({
  context,
}) => {
  const lifecycleResponse = await context.request.post(
    "/api/execution/audit/lifecycle-events",
    {
      data: buildPersistLifecycleEventRequestFixture(),
    },
  );
  const lifecycleBody = await lifecycleResponse.json();

  if (process.env.NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS === "false") {
    expect(lifecycleResponse.status()).toBe(403);
    expect(lifecycleBody).toEqual(
      expect.objectContaining({
        version: EXECUTION_AUDIT_PERSISTENCE_CONTRACT_VERSION,
        status: "disabled",
        message: "Execution audit persistence stub is disabled in this build.",
      }),
    );
    const disabledRunResponse = await context.request.post(
      "/api/execution/audit/agent-runs",
      {
        data: buildPersistAgentRunRequestFixture(),
      },
    );
    const disabledProgressResponse = await context.request.post(
      "/api/execution/audit/agent-progress-events",
      {
        data: buildPersistAgentProgressEventRequestFixture(),
      },
    );

    expect(disabledRunResponse.status()).toBe(403);
    expect(disabledProgressResponse.status()).toBe(403);
    return;
  }

  expect(lifecycleResponse.status()).toBe(202);
  expect(lifecycleBody).toEqual(
    expect.objectContaining({
      version: EXECUTION_AUDIT_PERSISTENCE_CONTRACT_VERSION,
      status: "accepted",
      id: "event_audit_persistence_fixture",
      message:
        "Execution lifecycle event accepted by dev stub only. No Supabase write occurred.",
    }),
  );

  const runResponse = await context.request.post(
    "/api/execution/audit/agent-runs",
    {
      data: buildPersistAgentRunRequestFixture(),
    },
  );
  const runBody = await runResponse.json();

  expect(runResponse.status()).toBe(202);
  expect(runBody).toEqual(
    expect.objectContaining({
      version: EXECUTION_AUDIT_PERSISTENCE_CONTRACT_VERSION,
      status: "accepted",
      id: "agent_run_audit_persistence_fixture",
      message:
        "Execution agent run accepted by dev stub only. No Supabase write occurred.",
    }),
  );

  const progressResponse = await context.request.post(
    "/api/execution/audit/agent-progress-events",
    {
      data: buildPersistAgentProgressEventRequestFixture(),
    },
  );
  const progressBody = await progressResponse.json();

  expect(progressResponse.status()).toBe(202);
  expect(progressBody).toEqual(
    expect.objectContaining({
      version: EXECUTION_AUDIT_PERSISTENCE_CONTRACT_VERSION,
      status: "accepted",
      id: "agent_progress_event_audit_persistence_fixture",
      message:
        "Execution agent progress event accepted by dev stub only. No Supabase write occurred.",
    }),
  );
});

test("rejects invalid execution audit persistence route stub requests", async ({
  context,
}) => {
  const response = await context.request.post(
    "/api/execution/audit/lifecycle-events",
    {
      data: buildInvalidPersistLifecycleEventRequestFixture(),
    },
  );
  const body = await response.json();

  if (process.env.NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS === "false") {
    expect(response.status()).toBe(403);
    expect(body.message).toBe(
      "Execution audit persistence stub is disabled in this build.",
    );
    return;
  }

  expect(response.status()).toBe(400);
  expect(body).toEqual(
    expect.objectContaining({
      version: EXECUTION_AUDIT_PERSISTENCE_CONTRACT_VERSION,
      status: "invalid",
    }),
  );
  expect(body.errors).toEqual(
    expect.arrayContaining(["Execution lifecycle event type is missing."]),
  );
});

test("rejects malformed JSON for audit persistence route stubs", async ({
  context,
}) => {
  const response = await context.request.post(
    "/api/execution/audit/agent-progress-events",
    {
      data: Buffer.from("{not-json"),
      headers: {
        "content-type": "application/json",
      },
    },
  );
  const body = await response.json();

  if (process.env.NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS === "false") {
    expect(response.status()).toBe(403);
    expect(body.message).toBe(
      "Execution audit persistence stub is disabled in this build.",
    );
    return;
  }

  expect(response.status()).toBe(400);
  expect(body).toEqual(
    expect.objectContaining({
      version: EXECUTION_AUDIT_PERSISTENCE_CONTRACT_VERSION,
      status: "invalid",
      message: "Execution audit persistence request body must be valid JSON.",
    }),
  );
});

test("fills the mock broker order page from the fill plan runner", async ({
  page,
}) => {
  const plan = buildMockOrderPageFillPlanFromAgentRequest(
    buildMockOrderPageAgentRequestFixture(),
  );

  await openMockOrderPageWithPlan(page, plan);

  const disabledHeading = page.getByRole("heading", {
    name: "Mock broker order page unavailable",
  });

  if (await isVisible(disabledHeading)) {
    await expect(disabledHeading).toBeVisible();
    await expect(
      page.getByText("Execution dev tools disabled", { exact: true }),
    ).toBeVisible();
    return;
  }

  await fillMockOrderPageFromPlan(page, plan);
  await verifyMockOrderPageReviewFromPlan(page, plan);
});

test("renders the main trade UI without touching broker or trade state", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page).not.toHaveURL(/\/login/);
  await expect(page.locator("body")).not.toContainText(
    "Element type is invalid",
  );
  await expect(
    page.getByText("Recommendations", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    page.getByText("Live Day Trades", { exact: true }).first(),
  ).toBeVisible();
});

test("uses the dev-only execution fixture to QA the handoff modal", async ({
  page,
}) => {
  await page.goto("/settings");
  const echoBridgeOption = page.locator("button").filter({
    hasText: "Echo bridge - Dev only",
  }).first();

  if (await isVisible(echoBridgeOption)) {
    await echoBridgeOption.click();
    await expect(
      page.getByText(
        "Avanza agent bridge configuration saved locally. Echo bridge - Dev only is selected for local diagnostics only.",
      ),
    ).toBeVisible();
  }

  await page.goto("/");
  await page.getByRole("button", { name: "Live Day Trades" }).click();

  const fixtureHeading = page.getByRole("heading", {
    name: "Execution Sandbox Fixture",
  });

  if (!(await isVisible(fixtureHeading))) {
    await expect(
      page.getByText("Execution Sandbox Fixture", { exact: true }),
    ).toBeHidden();
    return;
  }

  await expect(fixtureHeading).toBeVisible();
  await expect(page.getByText("DEV FIXTURE", { exact: true }).first()).toBeVisible();
  await expect(
    page.getByText("Not a real trade", { exact: true }).first(),
  ).toBeVisible();
  await expect(page.getByText("Does not write Supabase")).toBeVisible();

  const fixturePanel = page.locator("section").filter({
    has: fixtureHeading,
  });
  const stopLossFixture = fixturePanel.locator("article").filter({
    hasText: "Stop loss reached",
  });

  await expect(stopLossFixture).toBeVisible();
  await expect(stopLossFixture.getByText("STOP LOSS REACHED")).toBeVisible();
  await stopLossFixture.getByRole("button", { name: "View handoff" }).click();

  const modal = page.getByRole("dialog");

  await expect(modal).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Execution Handoff Preview" }),
  ).toBeVisible();
  await expect(modal.getByText("Future agent request")).toBeVisible();
  await expect(modal.getByText("Bridge request envelope")).toBeVisible();
  await expect(modal.getByText("Execution Sandbox QA")).toBeVisible();
  await expect(modal.getByText("Safety checks")).toBeVisible();

  let mockAgentRunWasRequested = false;

  await page.route("http://127.0.0.1:47831/run", async (route) => {
    const payload = route.request().postDataJSON() as {
      enableMockAgentRun?: boolean;
      mockPageBaseUrl?: string;
      request?: { requestId?: string };
      envelope?: { requestId?: string };
    };
    const isMockAgentRun = payload.enableMockAgentRun === true;
    mockAgentRunWasRequested = mockAgentRunWasRequested || isMockAgentRun;
    const requestId =
      payload.request?.requestId ??
      payload.envelope?.requestId ??
      "avanza_agent_request_playwright";
    const createdAt = new Date().toISOString();
    const mockOrderFillPlan = buildMockOrderPageFillPlanFromAgentRequest(
      payload.request as ReturnType<typeof buildMockOrderPageAgentRequestFixture>,
    );
    const mockOrderFillPlanValidation =
      validateMockOrderPageFillPlan(mockOrderFillPlan);
    const mockOrderPageUrl =
      buildMockOrderPageUrlFromFillPlan(mockOrderFillPlan);

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        version: "avanza_localhost_bridge_v1",
        requestId,
        accepted: true,
        mockOrderPageAvailable: true,
        mockOrderPageUrl,
        mockOrderPageMessage:
          isMockAgentRun
            ? "Mock order fill plan generated for local testing. Mock-page browser execution was explicitly requested separately."
            : "Mock order fill plan generated for local testing only. No browser was opened.",
        mockOrderFillPlan,
        mockOrderFillPlanValid: mockOrderFillPlanValidation.ok,
        mockOrderFillPlanErrors: mockOrderFillPlanValidation.errors,
        mockOrderFillPlanWarnings: mockOrderFillPlanValidation.warnings,
        ...(isMockAgentRun
          ? {
              mockAgentRunAttempted: true,
              mockAgentRunOk: true,
              mockAgentRunMessage:
                "Playwright mock agent reviewed local mock page. No submit was clicked.",
              mockAgentRunErrors: [],
              mockAgentRunStartedAt: createdAt,
              mockAgentRunCompletedAt: createdAt,
            }
          : {}),
        message:
          "Echo run completed by localhost bridge stub. No Avanza session opened and no broker result created.",
        warnings: [
          "Playwright intercepted localhost bridge stub response.",
          "brokerResult is intentionally undefined.",
        ],
        result: {
          requestId,
          createdAt,
          status: "unknown",
          progressEvents: [
            {
              eventId: "avanza_agent_progress_playwright_started",
              requestId,
              createdAt,
              type: "agent_started",
              message:
                isMockAgentRun
                  ? "Playwright localhost bridge mock-agent run started for the local mock page only."
                  : "Playwright localhost bridge echo started. No broker page opened.",
            },
            {
              eventId: "avanza_agent_progress_playwright_ready",
              requestId,
              createdAt,
              type: "order_review_ready",
              message:
                isMockAgentRun
                  ? "Playwright localhost bridge mock agent reviewed the local mock page without submit."
                  : "Playwright localhost bridge echo reached review-ready protocol state only.",
            },
          ],
          rawSummary:
            "Echo run completed by localhost bridge stub. No Avanza session opened and no broker result created.",
        },
      }),
    });
  });
  await page.route("http://127.0.0.1:47831/cancel", async (route) => {
    const payload = route.request().postDataJSON() as {
      requestId?: string;
    };
    const requestId = payload.requestId ?? "avanza_agent_request_playwright";

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        version: "avanza_localhost_bridge_v1",
        requestId,
        cancelled: true,
        message:
          "Localhost bridge stub cancel acknowledged locally only. No broker action occurred.",
      }),
    });
  });

  await modal.getByRole("button", { name: "Run localhost bridge echo" }).click();
  await expect(modal.getByText("Localhost bridge echo result")).toBeVisible();
  await expect(
    modal.getByText(
      "Echo run completed by localhost bridge stub. No Avanza session opened and no broker result created.",
    ),
  ).toBeVisible();
  await expect(
    modal.getByText(
      "Localhost bridge stub only. Avanza was not opened, no browser automation ran, no order was prepared or submitted, and no broker result was created.",
    ),
  ).toBeVisible();
  await expect(modal.getByText("Mock order page fill plan")).toBeVisible();
  await expect(
    modal.getByText(
      "Mock order fill plan generated for local testing only. No browser was opened.",
    ),
  ).toBeVisible();
  await expect(modal.getByText("/mock-broker/order?")).toBeVisible();
  await expect(modal.getByText("Mock Fill Plan")).toBeVisible();
  await expect(modal.getByText("Valid", { exact: true }).first()).toBeVisible();
  await expect(
    modal.getByRole("link", { name: "Open mock order page" }),
  ).toBeVisible();
  await expect(modal.getByText("Broker Result").first()).toBeVisible();
  await expect(modal.getByText("Absent").first()).toBeVisible();
  await modal.getByRole("button", { name: "Run localhost mock agent" }).click();
  await expect
    .poll(() => mockAgentRunWasRequested)
    .toBe(true);
  await expect(modal.getByText("Localhost mock agent result")).toBeVisible();
  await expect(
    modal.getByText(
      "Playwright mock agent reviewed local mock page. No submit was clicked.",
    ),
  ).toBeVisible();
  await expect(modal.getByText("Mock Agent Attempted")).toBeVisible();
  await expect(modal.getByText("Mock Agent OK")).toBeVisible();
  await expect(modal.getByText("Broker Result").first()).toBeVisible();
  await expect(modal.getByText("Absent").first()).toBeVisible();
  await modal
    .getByRole("button", { name: "Cancel localhost bridge run" })
    .click();
  await expect(modal.getByText("Localhost bridge cancel result")).toBeVisible();
  await expect(
    modal.getByText(
      "Localhost bridge stub cancel acknowledged locally only. No broker action occurred.",
    ),
  ).toBeVisible();
  await expect(
    modal.getByText(
      "Localhost bridge cancel stub only. No Avanza session, browser automation, broker order, or trade state was cancelled.",
    ),
  ).toBeVisible();

  await modal.getByRole("button", { name: "Prepare in Avanza" }).click();
  await expect(
    modal.getByText("Bridge-backed diagnostics runner result"),
  ).toBeVisible();
  await expect(
    modal.getByText(
      "Echo bridge completed protocol test. No Avanza session was opened and no broker result was created.",
    ),
  ).toBeVisible();
  await expect(
    modal.getByText(
      "Bridge-backed diagnostics runner only. Echo bridge and no-op bridge are local protocol tools only. Avanza was not opened, no order was prepared or submitted, and no broker result was created.",
    ),
  ).toBeVisible();
  await expect(modal.getByText("Broker Result")).toBeVisible();
  await expect(modal.getByText("Absent")).toBeVisible();

  await page
    .getByRole("button", { name: "Close execution handoff preview" })
    .click();
  await expect(modal).toBeHidden();

  await page.goto("/settings");
  const agentRunsPanel = page.locator("section").filter({
    has: page.getByRole("heading", { name: "Avanza Agent Runs" }),
  });

  await expect(agentRunsPanel).toBeVisible();
  await expect(
    agentRunsPanel.getByText(
      "Echo bridge completed protocol test. No Avanza session was opened and no broker result was created.",
    ),
  ).toBeVisible();
  await expect(agentRunsPanel.getByText("No broker result").first()).toBeVisible();
  await expect(agentRunsPanel.getByText("Selected Bridge").first()).toBeVisible();
  await expect(agentRunsPanel.getByText("Resolved Bridge").first()).toBeVisible();
  await expect(agentRunsPanel.getByText("echo").first()).toBeVisible();
});

test("renders execution sandbox diagnostics gate in Settings", async ({ page }) => {
  await page.goto("/settings");

  await expect(page).not.toHaveURL(/\/login/);
  await expect(page.locator("body")).not.toContainText(
    "Element type is invalid",
  );
  await expect(
    page.getByRole("heading", { name: "Settings", exact: true }),
  ).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "Execution Mode" }),
  ).toBeVisible({ timeout: 30000 });
  await expect(page.getByText("Locked", { exact: true }).first()).toBeVisible();

  const smokeChecklistHeading = page.getByRole("heading", {
    name: "Execution Sandbox Smoke Test",
  });

  if (await isVisible(smokeChecklistHeading)) {
    await expect(smokeChecklistHeading).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Avanza Agent Bridge Configuration" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Avanza Agent Bridge" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Check localhost stub" }),
    ).toBeVisible();
    await expect(page.getByText("Health check only.")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Execution Event Log" }),
    ).toBeVisible();
    const auditApiStubsPanel = page.locator("section").filter({
      has: page.getByRole("heading", { name: "Execution Audit API Stubs" }),
    });

    await expect(auditApiStubsPanel).toBeVisible();
    await expect(
      auditApiStubsPanel.getByText("Dev-only route validation. No Supabase write."),
    ).toBeVisible();
    await auditApiStubsPanel
      .getByRole("button", { name: "Test lifecycle event audit stub" })
      .click();
    await expect(
      auditApiStubsPanel.getByText(
        "Execution lifecycle event accepted by dev stub only. No Supabase write occurred.",
      ),
    ).toBeVisible();
    await expect(auditApiStubsPanel.getByText("HTTP").first()).toBeVisible();
    await expect(auditApiStubsPanel.getByText("202").first()).toBeVisible();
    await expect(auditApiStubsPanel.getByText("accepted").first()).toBeVisible();

    await auditApiStubsPanel
      .getByRole("button", { name: "Test agent run audit stub" })
      .click();
    await expect(
      auditApiStubsPanel.getByText(
        "Execution agent run accepted by dev stub only. No Supabase write occurred.",
      ),
    ).toBeVisible();

    await auditApiStubsPanel
      .getByRole("button", { name: "Test agent progress audit stub" })
      .click();
    await expect(
      auditApiStubsPanel.getByText(
        "Execution agent progress event accepted by dev stub only. No Supabase write occurred.",
      ),
    ).toBeVisible();
    await expect(
      auditApiStubsPanel.getByText(
        "No localStorage write, execution record, audit event, trade update, History update, Statistics update, broker execution, or Avanza automation is performed by these UI tests.",
      ),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Agent Adapter Diagnostics" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Avanza Agent Runs" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Dev Mock Broker Results" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Execution Records" }),
    ).toBeVisible();
    await expect(page.getByText("No bridge", { exact: true }).first()).toBeVisible();
    return;
  }

  await expect(
    page.getByRole("heading", { name: "Execution Dev Tools" }),
  ).toBeVisible();
  await expect(
    page.getByText("Execution dev tools are disabled in this build."),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Dev Mock Broker Results" }),
  ).toBeHidden();
  await expect(
    page.getByRole("heading", { name: "Execution Audit API Stubs" }),
  ).toBeHidden();
});

test("checks bridge health and safely exercises the smoke checklist", async ({
  page,
}) => {
  page.on("dialog", (dialog) => void dialog.accept());

  await page.goto("/settings");

  const smokeChecklistHeading = page.getByRole("heading", {
    name: "Execution Sandbox Smoke Test",
  });

  if (!(await isVisible(smokeChecklistHeading))) {
    await expect(
      page.getByRole("heading", { name: "Execution Dev Tools" }),
    ).toBeVisible();
    return;
  }

  const smokeChecklist = page.locator("section").filter({
    has: smokeChecklistHeading,
  });
  const firstChecklistItem = smokeChecklist.locator("article").filter({
    hasText: "Dev tools flag is enabled.",
  });

  await expect(firstChecklistItem).toBeVisible();
  await firstChecklistItem.getByRole("button", { name: "Pass" }).click();
  await expect(
    page.getByText("Execution sandbox smoke checklist updated locally."),
  ).toBeVisible();
  await expect(firstChecklistItem.getByText("Pass", { exact: true }).first()).toBeVisible();

  await smokeChecklist.getByRole("button", { name: "Reset checklist" }).click();
  await expect(
    page.getByText("Execution sandbox smoke checklist reset."),
  ).toBeVisible();
  await expect(
    firstChecklistItem.getByText("Not tested", { exact: true }).first(),
  ).toBeVisible();

  await page.getByRole("button", { name: "Check bridge health" }).click();
  await expect(
    page.getByText("No external Avanza agent bridge is connected."),
  ).toBeVisible();
  await expect(page.getByText("Unavailable", { exact: true }).first()).toBeVisible();

  await page.route("http://127.0.0.1:47831/health", (route) =>
    route.abort(),
  );
  await page.getByRole("button", { name: "Check localhost stub" }).click();
  await expect(
    page.getByText(
      "Localhost bridge server not reachable. Start with npm run bridge:localhost.",
    ),
  ).toBeVisible();

  const echoBridgeOption = page.locator("button").filter({
    hasText: "Echo bridge - Dev only",
  }).first();

  if (await isVisible(echoBridgeOption)) {
    await echoBridgeOption.click();
    await expect(
      page.getByText(
        "Avanza agent bridge configuration saved locally. Echo bridge - Dev only is selected for local diagnostics only.",
      ),
    ).toBeVisible();
    await page.getByRole("button", { name: "Check bridge health" }).click();
    await expect(
      page.getByText(
        "Echo bridge is available for local diagnostics only. No broker connection exists.",
      ),
    ).toBeVisible();
    await expect(page.getByText("Available", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Echo bridge - Dev only").first()).toBeVisible();
  }
});

test("renders the dev-only mock broker order page safely", async ({ page }) => {
  await page.goto(
    "/mock-broker/order?ticker=QA.TEST&action=sell&quantity=42&orderType=limit&limitPrice=123.45&intendedPrice=124.00&targetPrice=130.00&stopLossPrice=118.00&mode=semi_automatic&requestId=request_playwright&intentId=intent_playwright",
  );

  const disabledHeading = page.getByRole("heading", {
    name: "Mock broker order page unavailable",
  });

  if (await isVisible(disabledHeading)) {
    await expect(disabledHeading).toBeVisible();
    await expect(
      page.getByText("Execution dev tools disabled", { exact: true }),
    ).toBeVisible();
    await expect(page.getByText("It is not Avanza")).toBeVisible();
    return;
  }

  await expect(
    page.getByRole("heading", { name: "Mock broker order ticket" }),
  ).toBeVisible();
  await expect(page.getByText("MOCK BROKER", { exact: true })).toBeVisible();
  await expect(page.getByText("DEV ONLY", { exact: true })).toBeVisible();
  await expect(page.getByText("Not Avanza", { exact: true })).toBeVisible();
  await expect(
    page.getByText("No real order can be placed", { exact: true }),
  ).toBeVisible();

  await expect(page.getByLabel("Ticker / symbol")).toHaveValue("QA.TEST");
  await expect(page.getByLabel("Action")).toHaveValue("sell");
  await expect(page.getByLabel("Quantity")).toHaveValue("42");
  await expect(page.getByLabel("Order type")).toHaveValue("limit");
  await expect(page.getByLabel("Limit price")).toHaveValue("123.45");
  await expect(page.getByLabel("Intended / current price")).toHaveValue(
    "124.00",
  );
  await expect(page.getByLabel("Target price")).toHaveValue("130.00");
  await expect(page.getByLabel("Stop loss price")).toHaveValue("118.00");
  await expect(page.getByLabel("Mode")).toHaveValue("semi_automatic");
  await expect(page.getByLabel("Request ID")).toHaveValue("request_playwright");
  await expect(page.getByLabel("Intent ID")).toHaveValue("intent_playwright");

  await expectStableAgentSelector(
    page.getByTestId(MOCK_ORDER_PAGE_AGENT_SELECTORS.ticker.testId),
    MOCK_ORDER_PAGE_AGENT_SELECTORS.ticker,
  );
  await expectStableAgentSelector(
    page.getByTestId(MOCK_ORDER_PAGE_AGENT_SELECTORS.action.testId),
    MOCK_ORDER_PAGE_AGENT_SELECTORS.action,
  );
  await expectStableAgentSelector(
    page.getByTestId(MOCK_ORDER_PAGE_AGENT_SELECTORS.quantity.testId),
    MOCK_ORDER_PAGE_AGENT_SELECTORS.quantity,
  );
  await expectStableAgentSelector(
    page.getByTestId(MOCK_ORDER_PAGE_AGENT_SELECTORS.orderType.testId),
    MOCK_ORDER_PAGE_AGENT_SELECTORS.orderType,
  );
  await expectStableAgentSelector(
    page.getByTestId(MOCK_ORDER_PAGE_AGENT_SELECTORS.limitPrice.testId),
    MOCK_ORDER_PAGE_AGENT_SELECTORS.limitPrice,
  );
  await expectStableAgentSelector(
    page.getByTestId(MOCK_ORDER_PAGE_AGENT_SELECTORS.intendedPrice.testId),
    MOCK_ORDER_PAGE_AGENT_SELECTORS.intendedPrice,
  );
  await expectStableAgentSelector(
    page.getByTestId(MOCK_ORDER_PAGE_AGENT_SELECTORS.targetPrice.testId),
    MOCK_ORDER_PAGE_AGENT_SELECTORS.targetPrice,
  );
  await expectStableAgentSelector(
    page.getByTestId(MOCK_ORDER_PAGE_AGENT_SELECTORS.stopLossPrice.testId),
    MOCK_ORDER_PAGE_AGENT_SELECTORS.stopLossPrice,
  );
  await expectStableAgentSelector(
    page.getByTestId(MOCK_ORDER_PAGE_AGENT_SELECTORS.mode.testId),
    MOCK_ORDER_PAGE_AGENT_SELECTORS.mode,
  );
  await expectStableAgentSelector(
    page.getByTestId(
      MOCK_ORDER_PAGE_AGENT_SELECTORS.requireManualFinalConfirmation.testId,
    ),
    MOCK_ORDER_PAGE_AGENT_SELECTORS.requireManualFinalConfirmation,
  );
  await expectStableAgentSelector(
    page.getByTestId(
      MOCK_ORDER_PAGE_AGENT_SELECTORS.allowAutomaticFinalSubmit.testId,
    ),
    MOCK_ORDER_PAGE_AGENT_SELECTORS.allowAutomaticFinalSubmit,
  );
  await expectStableAgentSelector(
    page.getByTestId(MOCK_ORDER_PAGE_AGENT_SELECTORS.requestId.testId),
    MOCK_ORDER_PAGE_AGENT_SELECTORS.requestId,
  );
  await expectStableAgentSelector(
    page.getByTestId(MOCK_ORDER_PAGE_AGENT_SELECTORS.intentId.testId),
    MOCK_ORDER_PAGE_AGENT_SELECTORS.intentId,
  );
  await expectStableAgentSelector(
    page.getByTestId(MOCK_ORDER_PAGE_AGENT_SELECTORS.reviewButton.testId),
    MOCK_ORDER_PAGE_AGENT_SELECTORS.reviewButton,
  );
  await expectStableAgentSelector(
    page.getByTestId(MOCK_ORDER_PAGE_AGENT_SELECTORS.resetButton.testId),
    MOCK_ORDER_PAGE_AGENT_SELECTORS.resetButton,
  );
  await expectStableAgentSelector(
    page.getByTestId(MOCK_ORDER_PAGE_AGENT_SELECTORS.submitDisabled.testId),
    MOCK_ORDER_PAGE_AGENT_SELECTORS.submitDisabled,
  );

  await page
    .getByTestId(MOCK_ORDER_PAGE_AGENT_SELECTORS.reviewButton.testId)
    .click();

  const reviewPanel = page.locator("aside").filter({
    has: page.getByRole("heading", { name: "Review mock order" }),
  });

  await expect(reviewPanel).toBeVisible();
  await expect(reviewPanel.getByText("QA.TEST", { exact: true })).toBeVisible();
  await expect(reviewPanel.getByText("sell", { exact: true })).toBeVisible();
  await expect(reviewPanel.getByText("42", { exact: true })).toBeVisible();
  await expect(reviewPanel.getByText("limit", { exact: true })).toBeVisible();
  await expect(reviewPanel.getByText("124.00", { exact: true })).toBeVisible();
  await expect(reviewPanel.getByText("130.00", { exact: true })).toBeVisible();
  await expect(reviewPanel.getByText("118.00", { exact: true })).toBeVisible();
  await expect(
    reviewPanel.getByText("Manual confirmation required"),
  ).toBeVisible();
  await expect(
    reviewPanel.getByText("Automatic final submit allowed"),
  ).toBeVisible();

  await expect(
    page.getByTestId(MOCK_ORDER_PAGE_AGENT_SELECTORS.submitDisabled.testId),
  ).toBeDisabled();
  const mockConfirmationLink = page.getByRole("link", {
    name: "Open mock confirmation page",
  });

  await expect(mockConfirmationLink).toBeVisible();
  await expect(mockConfirmationLink).toHaveAttribute(
    "href",
    /\/mock-broker\/confirmation\?/,
  );
  await expect(mockConfirmationLink).toHaveAttribute("href", /status=submitted/);
  await expect(mockConfirmationLink).toHaveAttribute("href", /ticker=QA.TEST/);
  await expect(mockConfirmationLink).toHaveAttribute(
    "href",
    /requestId=request_playwright/,
  );
  await expect(mockConfirmationLink).toHaveAttribute(
    "href",
    /intentId=intent_playwright/,
  );

  await page
    .getByTestId(MOCK_ORDER_PAGE_AGENT_SELECTORS.resetButton.testId)
    .click();
  await expect(page.getByLabel("Ticker / symbol")).toHaveValue("QA.TEST");
  await expect(
    page.getByText("Fill the fake ticket and choose Review mock order."),
  ).toBeVisible();
});

test("renders the dev-only mock broker confirmation page safely", async ({
  page,
}) => {
  await page.goto(
    buildMockOrderConfirmationUrl({
      action: "sell",
      executedPrice: "123.10",
      intentId: "intent_confirmation_playwright",
      message: "Mock confirmation rendered for Playwright only.",
      orderId: "mock_order_playwright",
      positionId: "position_confirmation_playwright",
      quantity: "42",
      recommendationId: "recommendation_confirmation_playwright",
      requestId: "request_confirmation_playwright",
      requestedPrice: "123.45",
      status: "filled",
      ticker: "QA.CONFIRM",
    }),
  );

  const disabledHeading = page.getByRole("heading", {
    name: "Mock broker confirmation page unavailable",
  });

  if (await isVisible(disabledHeading)) {
    await expect(disabledHeading).toBeVisible();
    await expect(
      page.getByText("Execution dev tools disabled", { exact: true }),
    ).toBeVisible();
    await expect(page.getByText("It is not Avanza")).toBeVisible();
    await expect(page.getByText("does not create broker results")).toBeVisible();
    return;
  }

  await expect(
    page.getByRole("heading", { name: "Mock broker confirmation" }),
  ).toBeVisible();
  await expect(page.getByText("MOCK BROKER", { exact: true })).toBeVisible();
  await expect(page.getByText("DEV ONLY", { exact: true })).toBeVisible();
  await expect(page.getByText("Not Avanza", { exact: true })).toBeVisible();
  await expect(
    page.getByText("No real broker confirmation", { exact: true }).first(),
  ).toBeVisible();
  await expect(page.getByText("No brokerResult")).toBeVisible();

  await expectStableAgentSelector(
    page.getByTestId(MOCK_ORDER_CONFIRMATION_SELECTORS.safetyLabel.testId),
    MOCK_ORDER_CONFIRMATION_SELECTORS.safetyLabel,
  );
  await expectStableAgentSelector(
    page.getByTestId(MOCK_ORDER_CONFIRMATION_SELECTORS.status.testId),
    MOCK_ORDER_CONFIRMATION_SELECTORS.status,
  );
  await expectStableAgentSelector(
    page.getByTestId(MOCK_ORDER_CONFIRMATION_SELECTORS.ticker.testId),
    MOCK_ORDER_CONFIRMATION_SELECTORS.ticker,
  );
  await expectStableAgentSelector(
    page.getByTestId(MOCK_ORDER_CONFIRMATION_SELECTORS.action.testId),
    MOCK_ORDER_CONFIRMATION_SELECTORS.action,
  );
  await expectStableAgentSelector(
    page.getByTestId(MOCK_ORDER_CONFIRMATION_SELECTORS.quantity.testId),
    MOCK_ORDER_CONFIRMATION_SELECTORS.quantity,
  );
  await expectStableAgentSelector(
    page.getByTestId(MOCK_ORDER_CONFIRMATION_SELECTORS.requestedPrice.testId),
    MOCK_ORDER_CONFIRMATION_SELECTORS.requestedPrice,
  );
  await expectStableAgentSelector(
    page.getByTestId(MOCK_ORDER_CONFIRMATION_SELECTORS.executedPrice.testId),
    MOCK_ORDER_CONFIRMATION_SELECTORS.executedPrice,
  );
  await expectStableAgentSelector(
    page.getByTestId(MOCK_ORDER_CONFIRMATION_SELECTORS.orderId.testId),
    MOCK_ORDER_CONFIRMATION_SELECTORS.orderId,
  );
  await expectStableAgentSelector(
    page.getByTestId(MOCK_ORDER_CONFIRMATION_SELECTORS.requestId.testId),
    MOCK_ORDER_CONFIRMATION_SELECTORS.requestId,
  );
  await expectStableAgentSelector(
    page.getByTestId(MOCK_ORDER_CONFIRMATION_SELECTORS.intentId.testId),
    MOCK_ORDER_CONFIRMATION_SELECTORS.intentId,
  );
  await expectStableAgentSelector(
    page.getByTestId(MOCK_ORDER_CONFIRMATION_SELECTORS.positionId.testId),
    MOCK_ORDER_CONFIRMATION_SELECTORS.positionId,
  );
  await expectStableAgentSelector(
    page.getByTestId(MOCK_ORDER_CONFIRMATION_SELECTORS.recommendationId.testId),
    MOCK_ORDER_CONFIRMATION_SELECTORS.recommendationId,
  );
  await expectStableAgentSelector(
    page.getByTestId(MOCK_ORDER_CONFIRMATION_SELECTORS.message.testId),
    MOCK_ORDER_CONFIRMATION_SELECTORS.message,
  );

  await expect(page.getByTestId("mock-confirmation-status")).toContainText(
    "filled",
  );
  await expect(page.getByTestId("mock-confirmation-ticker")).toContainText(
    "QA.CONFIRM",
  );
  await expect(page.getByTestId("mock-confirmation-action")).toContainText(
    "sell",
  );
  await expect(page.getByTestId("mock-confirmation-quantity")).toContainText(
    "42",
  );
  await expect(
    page.getByTestId("mock-confirmation-requested-price"),
  ).toContainText("123.45");
  await expect(
    page.getByTestId("mock-confirmation-executed-price"),
  ).toContainText("123.10");
  await expect(page.getByTestId("mock-confirmation-order-id")).toContainText(
    "mock_order_playwright",
  );
  await expect(page.getByTestId("mock-confirmation-request-id")).toContainText(
    "request_confirmation_playwright",
  );
  await expect(page.getByTestId("mock-confirmation-intent-id")).toContainText(
    "intent_confirmation_playwright",
  );
  await expect(page.getByTestId("mock-confirmation-position-id")).toContainText(
    "position_confirmation_playwright",
  );
  await expect(
    page.getByTestId("mock-confirmation-recommendation-id"),
  ).toContainText("recommendation_confirmation_playwright");
  await expect(page.getByTestId("mock-confirmation-message")).toContainText(
    "Mock confirmation rendered for Playwright only.",
  );

  const filledResult = await parseMockConfirmationPage(page);

  verifyMockConfirmationParseResult(filledResult, {
    action: "sell",
    executedPrice: "123.10",
    intentId: "intent_confirmation_playwright",
    message: "Mock confirmation rendered for Playwright only.",
    orderId: "mock_order_playwright",
    positionId: "position_confirmation_playwright",
    quantity: "42",
    recommendationId: "recommendation_confirmation_playwright",
    requestId: "request_confirmation_playwright",
    requestedPrice: "123.45",
    status: "filled",
    ticker: "QA.CONFIRM",
  });
  const filledDevResult =
    buildDevMockBrokerExecutionResultFromParseResult(filledResult, {
      requireQuantity: true,
      requireTicker: true,
    });

  expect(validateDevMockBrokerExecutionResult(filledDevResult).ok).toBe(true);
  expect(filledDevResult).toEqual(
    expect.objectContaining({
      source: "mock_broker",
      isMock: true,
      status: "filled",
      ticker: "QA.CONFIRM",
      quantity: 42,
      requestedPrice: 123.45,
      executedPrice: 123.1,
    }),
  );
  expect(filledDevResult).not.toHaveProperty("brokerResult");
  expect(filledDevResult).not.toHaveProperty("tureExecutionRecord");

  await page.evaluate(
    ({ devMockKey, executionRecordKey }) => {
      window.localStorage.removeItem(devMockKey);
      window.localStorage.removeItem(executionRecordKey);
    },
    {
      devMockKey: DEV_MOCK_BROKER_RESULT_STORAGE_KEY,
      executionRecordKey: EXECUTION_RECORD_STORE_KEY,
    },
  );
  await page.getByRole("button", { name: "Save dev mock result" }).click();
  await expect(page.getByText("Dev mock result saved locally.")).toBeVisible();

  await page.goto("/settings");

  const devMockResultsPanel = page.locator("section").filter({
    has: page.getByRole("heading", { name: "Dev Mock Broker Results" }),
  });

  if (await isVisible(devMockResultsPanel)) {
    await expect(devMockResultsPanel).toBeVisible();
    await expect(devMockResultsPanel.getByText("Total Results")).toBeVisible();
    await expect(
      devMockResultsPanel.getByText("1", { exact: true }).first(),
    ).toBeVisible();
    await expect(
      devMockResultsPanel.getByText("QA.CONFIRM").first(),
    ).toBeVisible();
    await expect(devMockResultsPanel.getByText("filled").first()).toBeVisible();
    await expect(
      devMockResultsPanel.getByText("mock_broker").first(),
    ).toBeVisible();
    await expect(devMockResultsPanel.getByText("Mock result")).toBeVisible();
    await expect(
      devMockResultsPanel.getByText("Not BrokerExecutionResult"),
    ).toBeVisible();
    await expect(
      devMockResultsPanel.getByText("Not real BrokerExecutionResult"),
    ).toBeVisible();
    await expect(
      devMockResultsPanel.getByText("Not broker confirmations"),
    ).toBeVisible();
    await expect(
      devMockResultsPanel.getByText(
        "Creates a local TureExecutionRecord from dev mock data only.",
      ),
    ).toBeVisible();
    await devMockResultsPanel
      .getByText("BrokerExecutionResult preview")
      .click();
    await expect(
      devMockResultsPanel.getByText(
        "Preview only - not saved, not real, not TureExecutionRecord.",
      ),
    ).toBeVisible();
    await expect(
      devMockResultsPanel.getByText(
        "DEV MOCK CONVERSION - not a real Avanza confirmation.",
      ),
    ).toBeVisible();
    await expect(
      devMockResultsPanel.getByText(
        "Dev-only route validation. No Supabase write. No trade update.",
      ),
    ).toBeVisible();
    await devMockResultsPanel
      .getByRole("button", { name: "Test server capture stub" })
      .click();
    await expect(
      devMockResultsPanel.getByText(
        "Capture request accepted by dev stub only. No Supabase write or trade mutation occurred.",
      ),
    ).toBeVisible();
    await expect(devMockResultsPanel.getByText("Stub OK")).toBeVisible();
    await expect(devMockResultsPanel.getByText("HTTP")).toBeVisible();
    await expect(devMockResultsPanel.getByText("202")).toBeVisible();
    await expect(devMockResultsPanel.getByText("Response")).toBeVisible();
    await expect(devMockResultsPanel.getByText("accepted")).toBeVisible();
    await expect(devMockResultsPanel.getByText("Idempotency")).toBeVisible();
    await expect(
      devMockResultsPanel.getByText("execution_server_capture_v1"),
    ).toBeVisible();
    await expect(
      devMockResultsPanel.getByText(
        "Route stub validation only. No Supabase write, execution record, trade update, History update, or Statistics update was created.",
      ),
    ).toBeVisible();
    const recordsAfterServerStub = await page.evaluate((storageKey) => {
      const records = JSON.parse(window.localStorage.getItem(storageKey) ?? "[]");

      return Array.isArray(records) ? records.length : 0;
    }, EXECUTION_RECORD_STORE_KEY);

    expect(recordsAfterServerStub).toBe(0);
    const captureButton = devMockResultsPanel.getByRole("button", {
      name: "Capture mock result locally",
    });

    await expect(captureButton).toBeEnabled();
    page.once("dialog", (dialog) => void dialog.accept());
    await captureButton.click();
    await expect(
      devMockResultsPanel.getByText(
        "DEV MOCK CAPTURE - local execution record created. Not real broker execution.",
      ),
    ).toBeVisible();
    await expect(devMockResultsPanel.getByText("Capture Status")).toBeVisible();
    await expect(devMockResultsPanel.getByText("captured")).toBeVisible();
    await expect(
      devMockResultsPanel.getByText(
        "No real broker confirmation, Supabase write, trade update, History update, or Statistics update was created.",
      ),
    ).toBeVisible();
    await expect(
      devMockResultsPanel.getByRole("button", { name: "Captured locally" }),
    ).toBeDisabled();
    await expect(
      devMockResultsPanel.getByText(
        "This mock result already has a local capture record.",
      ),
    ).toBeVisible();
    await expect(
      devMockResultsPanel.getByText("Duplicate guard checks localStorage only"),
    ).toBeVisible();

    const executionRecordsPanel = page.locator("section").filter({
      has: page.getByRole("heading", { name: "Execution Records" }),
    });

    await expect(executionRecordsPanel).toBeVisible();
    await expect(executionRecordsPanel.getByText("QA.CONFIRM").first()).toBeVisible();
    await expect(
      executionRecordsPanel.getByText("DEV MOCK CAPTURE").first(),
    ).toBeVisible();
    await expect(
      executionRecordsPanel.getByText("Not a real Avanza execution").first(),
    ).toBeVisible();
    const storedMockCaptureCount = await page.evaluate((storageKey) => {
      const records = JSON.parse(window.localStorage.getItem(storageKey) ?? "[]");

      return Array.isArray(records)
        ? records.filter(
            (record) =>
              record?.ticker === "QA.CONFIRM" &&
              typeof record?.reason === "string" &&
              record.reason.includes("DEV MOCK CAPTURE"),
          ).length
        : 0;
    }, EXECUTION_RECORD_STORE_KEY);

    expect(storedMockCaptureCount).toBe(1);

    page.once("dialog", (dialog) => void dialog.accept());
    await devMockResultsPanel
      .getByRole("button", { name: "Clear dev mock results" })
      .click();
    await expect(
      devMockResultsPanel.getByText("Local dev mock broker results cleared."),
    ).toBeVisible();
    await expect(
      devMockResultsPanel.getByText(
        "No local dev mock broker results are stored in this browser yet.",
      ),
    ).toBeVisible();
  } else {
    await expect(
      page.getByRole("heading", { name: "Execution Dev Tools" }),
    ).toBeVisible();
    await expect(
      page.getByText("Execution dev tools are disabled in this build."),
    ).toBeVisible();
    await page.evaluate((storageKey) => {
      window.localStorage.removeItem(storageKey);
    }, DEV_MOCK_BROKER_RESULT_STORAGE_KEY);
  }

  await page.goto(
    buildMockOrderConfirmationUrl({
      status: "rejected",
      ticker: "QA.REJECT",
      requestId: "request_rejected_playwright",
      intentId: "intent_rejected_playwright",
      quantity: "5",
      message: "Mock rejected state only.",
    }),
  );

  await expect(page.getByTestId("mock-confirmation-status")).toContainText(
    "rejected",
  );
  await expect(page.getByTestId("mock-confirmation-ticker")).toContainText(
    "QA.REJECT",
  );
  await expect(page.getByTestId("mock-confirmation-message")).toContainText(
    "Mock rejected state only.",
  );
  const rejectedResult = await parseMockConfirmationPage(page);

  verifyMockConfirmationParseResult(rejectedResult, {
    intentId: "intent_rejected_playwright",
    message: "Mock rejected state only.",
    quantity: "5",
    requestId: "request_rejected_playwright",
    status: "rejected",
    ticker: "QA.REJECT",
  });
  const rejectedDevResult =
    buildDevMockBrokerExecutionResultFromParseResult(rejectedResult, {
      requireQuantity: true,
      requireTicker: true,
    });

  expect(validateDevMockBrokerExecutionResult(rejectedDevResult).ok).toBe(true);
  expect(rejectedDevResult).toEqual(
    expect.objectContaining({
      source: "mock_broker",
      isMock: true,
      status: "rejected",
      ticker: "QA.REJECT",
      quantity: 5,
    }),
  );
  expect(rejectedDevResult).not.toHaveProperty("brokerResult");

  await page.goto(
    buildMockOrderConfirmationUrl({
      status: "cancelled",
      ticker: "QA.CANCEL",
      action: "buy",
      quantity: "10",
      requestId: "request_cancelled_playwright",
      intentId: "intent_cancelled_playwright",
      message: "Mock cancelled state only.",
    }),
  );

  const cancelledResult = await parseMockConfirmationPage(page);

  verifyMockConfirmationParseResult(cancelledResult, {
    action: "buy",
    intentId: "intent_cancelled_playwright",
    message: "Mock cancelled state only.",
    quantity: "10",
    requestId: "request_cancelled_playwright",
    status: "cancelled",
    ticker: "QA.CANCEL",
  });
  const cancelledDevResult =
    buildDevMockBrokerExecutionResultFromParseResult(cancelledResult, {
      requireQuantity: true,
      requireTicker: true,
    });

  expect(validateDevMockBrokerExecutionResult(cancelledDevResult).ok).toBe(true);
  expect(cancelledDevResult).toEqual(
    expect.objectContaining({
      source: "mock_broker",
      isMock: true,
      status: "cancelled",
      ticker: "QA.CANCEL",
      action: "buy",
      quantity: 10,
    }),
  );
  expect(cancelledDevResult).not.toHaveProperty("brokerResult");
});
