import {
  buildExecutionServerCaptureIdempotencyKey,
  buildExecutionServerCaptureRequest,
  type ExecutionServerCaptureRequest,
} from "../../../lib/execution-server-capture-contract";
import {
  getExecutionAuthorityForMode,
  type BrokerExecutionResult,
  type ExecutionAction,
  type ExecutionIntent,
  type ExecutionTriggerType,
} from "../../../lib/execution";

export function buildExecutionServerCaptureIntentFixture(
  overrides: Partial<ExecutionIntent> = {},
): ExecutionIntent {
  const mode = "semi_automatic";
  const authority = getExecutionAuthorityForMode(mode);

  return {
    intent_version: "1.0",
    intent_id: "intent_capture_contract",
    created_at: "2026-06-10T08:00:00.000Z",
    mode,
    authority,
    action: "buy",
    trigger_type: "entry_recommendation_ready",
    trigger_priority: 6,
    broker_hint: "AVANZA",
    source: "recommendation",
    trading_package: {
      package_version: "1.0",
      recommendation_id: "recommendation_capture_contract",
      live_position_id: null,
      ticker: "QA.CAPTURE",
      market: "US",
      quantity: 42,
      order_type: "limit",
      limit_price: 123.45,
      stop_loss: 118,
      target_price: 130,
      expires_at: null,
      payload_id: "payload_capture_contract",
      payload_fingerprint: "payload_capture_contract_fingerprint",
    },
    safety_warnings: [],
    broker_result: null,
    ...overrides,
  };
}

export function buildExecutionServerCaptureBrokerResultFixture(
  overrides: Partial<BrokerExecutionResult> &
    Partial<{
      action: ExecutionAction | string;
      ticker: string;
      quantity: number;
    }> = {},
): BrokerExecutionResult & {
  action: ExecutionAction;
  ticker: string;
  quantity: number;
} {
  return {
    broker_hint: "AVANZA",
    status: "filled",
    captured_at: "2026-06-10T08:05:00.000Z",
    broker_order_id: "mock_capture_order_001",
    submitted_at: "2026-06-10T08:04:00.000Z",
    filled_at: "2026-06-10T08:05:00.000Z",
    filled_quantity: 42,
    average_fill_price: 123.45,
    rejection_reason: null,
    cancellation_reason: null,
    raw_status: "DEV MOCK FILLED",
    notes: ["Dev capture route stub test only."],
    action: "buy",
    ticker: "QA.CAPTURE",
    quantity: 42,
    ...overrides,
  } as BrokerExecutionResult & {
    action: ExecutionAction;
    ticker: string;
    quantity: number;
  };
}

export function buildValidDevMockExecutionServerCaptureRequest() {
  const intent = buildExecutionServerCaptureIntentFixture();
  const brokerResult = buildExecutionServerCaptureBrokerResultFixture();

  return buildExecutionServerCaptureRequest({
    environment: "local_dev",
    source: "mock",
    isMock: true,
    isDev: true,
    submittedAt: "2026-06-10T08:06:00.000Z",
    intent,
    brokerResult,
    authoritySnapshot: intent.authority,
    safetyChecks: intent.authority.required_safety_checks,
    metadata: {
      path: "execution_capture_stub_fixture",
      supabaseWriteExpected: false,
      tradeMutationExpected: false,
    },
  });
}

export function buildInvalidExecutionServerCaptureRequestMissingIntent() {
  const request: Partial<ExecutionServerCaptureRequest> = {
    ...buildValidDevMockExecutionServerCaptureRequest(),
  };

  delete request.intent;

  return request;
}

export function buildInvalidExecutionServerCaptureRequestMissingBrokerResult() {
  const request: Partial<ExecutionServerCaptureRequest> = {
    ...buildValidDevMockExecutionServerCaptureRequest(),
  };

  delete request.brokerResult;

  return request;
}

export function buildMismatchedExecutionServerCaptureRequest() {
  const intent = buildExecutionServerCaptureIntentFixture({
    action: "buy",
    trigger_type: "entry_recommendation_ready" as ExecutionTriggerType,
    trigger_priority: 6,
    trading_package: {
      ...buildExecutionServerCaptureIntentFixture().trading_package,
      ticker: "QA.CAPTURE",
      quantity: 42,
    },
  });
  const brokerResult = buildExecutionServerCaptureBrokerResultFixture({
    action: "sell",
    ticker: "QA.MISMATCH",
    quantity: 7,
    filled_quantity: 7,
  });

  return buildExecutionServerCaptureRequest({
    environment: "local_dev",
    source: "mock",
    isMock: true,
    isDev: true,
    submittedAt: "2026-06-10T08:07:00.000Z",
    intent,
    brokerResult,
    authoritySnapshot: intent.authority,
    safetyChecks: intent.authority.required_safety_checks,
  });
}

export function buildProductionMockExecutionServerCaptureRequest() {
  const request = buildValidDevMockExecutionServerCaptureRequest();

  return {
    ...request,
    environment: "production" as const,
    isMock: true,
    isDev: false,
    idempotencyKey: buildExecutionServerCaptureIdempotencyKey({
      intent: request.intent,
      brokerResult: request.brokerResult,
      source: request.source,
      environment: "production",
      isMock: true,
      isDev: false,
    }),
  };
}
