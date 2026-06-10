#!/usr/bin/env node

import http from "node:http";
import { randomUUID } from "node:crypto";

const CONTRACT_VERSION = "avanza_localhost_bridge_v1";
const AGENT_REQUEST_VERSION = "avanza_agent_request_v1";
const BRIDGE_ENVELOPE_VERSION = "avanza_agent_bridge_v1";
const DEFAULT_PORT = 47831;
const HOST = "127.0.0.1";
const MAX_BODY_BYTES = 1024 * 1024;
const MOCK_ORDER_PAGE_TARGET_PATH = "/mock-broker/order";
const DEFAULT_MOCK_PAGE_BASE_URL = "http://localhost:3000";

const MOCK_ORDER_PAGE_AGENT_SELECTORS = {
  ticker: {
    fieldKey: "ticker",
    testId: "mock-order-ticker",
    dataAgentField: "mock-order-ticker",
    description: "Ticker or symbol text input.",
  },
  action: {
    fieldKey: "action",
    testId: "mock-order-action",
    dataAgentField: "mock-order-action",
    description: "Buy/sell action select.",
  },
  quantity: {
    fieldKey: "quantity",
    testId: "mock-order-quantity",
    dataAgentField: "mock-order-quantity",
    description: "Share quantity text input.",
  },
  orderType: {
    fieldKey: "orderType",
    testId: "mock-order-type",
    dataAgentField: "mock-order-type",
    description: "Mock order type select.",
  },
  limitPrice: {
    fieldKey: "limitPrice",
    testId: "mock-order-limit-price",
    dataAgentField: "mock-order-limit-price",
    description: "Limit price text input.",
  },
  intendedPrice: {
    fieldKey: "intendedPrice",
    testId: "mock-order-intended-price",
    dataAgentField: "mock-order-intended-price",
    description: "Intended or current price text input.",
  },
  targetPrice: {
    fieldKey: "targetPrice",
    testId: "mock-order-target-price",
    dataAgentField: "mock-order-target-price",
    description: "Target price text input.",
  },
  stopLossPrice: {
    fieldKey: "stopLossPrice",
    testId: "mock-order-stop-loss-price",
    dataAgentField: "mock-order-stop-loss-price",
    description: "Stop-loss price text input.",
  },
  mode: {
    fieldKey: "mode",
    testId: "mock-order-mode",
    dataAgentField: "mock-order-mode",
    description: "Execution mode select.",
  },
  requireManualFinalConfirmation: {
    fieldKey: "requireManualFinalConfirmation",
    testId: "mock-order-require-manual-confirmation",
    dataAgentField: "mock-order-require-manual-confirmation",
    description: "Read-only manual final confirmation requirement.",
  },
  allowAutomaticFinalSubmit: {
    fieldKey: "allowAutomaticFinalSubmit",
    testId: "mock-order-allow-automatic-submit",
    dataAgentField: "mock-order-allow-automatic-submit",
    description: "Read-only automatic final submit allowance.",
  },
  requestId: {
    fieldKey: "requestId",
    testId: "mock-order-request-id",
    dataAgentField: "mock-order-request-id",
    description: "Agent request id text input.",
  },
  intentId: {
    fieldKey: "intentId",
    testId: "mock-order-intent-id",
    dataAgentField: "mock-order-intent-id",
    description: "Execution intent id text input.",
  },
};

const mockOrderPageFieldKeys = [
  "ticker",
  "action",
  "quantity",
  "orderType",
  "limitPrice",
  "intendedPrice",
  "targetPrice",
  "stopLossPrice",
  "mode",
  "requireManualFinalConfirmation",
  "allowAutomaticFinalSubmit",
  "requestId",
  "intentId",
];

const port = normalizePort(process.env.AVANZA_LOCALHOST_BRIDGE_PORT);

const allowedOrigins = new Set([
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
]);

function normalizePort(value) {
  const parsed = Number.parseInt(String(value ?? ""), 10);

  return Number.isInteger(parsed) && parsed > 0 && parsed < 65536
    ? parsed
    : DEFAULT_PORT;
}

function now() {
  return new Date().toISOString();
}

function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function booleanValue(value) {
  return typeof value === "boolean" ? value : null;
}

function textValue(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return typeof value === "string" ? value.trim() : "";
}

function booleanText(value) {
  return value === true ? "true" : "false";
}

function isLocalhostUrl(url) {
  return (
    (url.protocol === "http:" || url.protocol === "https:") &&
    ["localhost", "127.0.0.1", "::1"].includes(url.hostname)
  );
}

function normalizeLocalhostBaseUrl(value) {
  const url = new URL(value);

  if (!isLocalhostUrl(url)) {
    throw new Error("mockPageBaseUrl must use localhost, 127.0.0.1, or ::1.");
  }

  url.pathname = "";
  url.search = "";
  url.hash = "";

  return url.toString().replace(/\/+$/, "");
}

function valueFromRecord(record, keys) {
  if (!isObject(record)) {
    return undefined;
  }

  const matchingKey = keys.find((key) => record[key] !== undefined);

  return matchingKey ? record[matchingKey] : undefined;
}

function normalizeMockOrderType(value) {
  if (value === "limit" || value === "limit_reference") {
    return "limit";
  }

  if (value === "market" || value === "market_reference") {
    return "market";
  }

  return "";
}

function mockFillValue(fieldKey, value) {
  return {
    fieldKey,
    selector: MOCK_ORDER_PAGE_AGENT_SELECTORS[fieldKey],
    value,
  };
}

function readMockFillPlanValue(plan, fieldKey) {
  return (
    plan.values.find((value) => value.fieldKey === fieldKey)?.value.trim() ??
    ""
  );
}

function buildMockOrderPageFillPlanFromAgentRequest(request) {
  const intent = isObject(request?.handoff?.intent)
    ? request.handoff.intent
    : null;
  const tradingPackage = isObject(intent?.trading_package)
    ? intent.trading_package
    : null;
  const requestId = textValue(request?.requestId);
  const intentId = textValue(valueFromRecord(intent, ["intentId", "intent_id"]));
  const action = textValue(request?.action ?? request?.handoff?.action);
  const mode = textValue(request?.mode ?? request?.handoff?.mode);

  return {
    version: "mock_order_page_fill_plan_v1",
    targetPath: MOCK_ORDER_PAGE_TARGET_PATH,
    source: "avanza_agent_request",
    requestId,
    intentId,
    intentIdExpected: Boolean(intent),
    values: [
      mockFillValue(
        "ticker",
        textValue(
          valueFromRecord(intent, ["ticker", "symbol"]) ??
            tradingPackage?.ticker,
        ),
      ),
      mockFillValue("action", action),
      mockFillValue(
        "quantity",
        textValue(
          valueFromRecord(intent, ["quantity"]) ?? tradingPackage?.quantity,
        ),
      ),
      mockFillValue(
        "orderType",
        normalizeMockOrderType(
          valueFromRecord(intent, ["orderType", "order_type"]) ??
            tradingPackage?.order_type,
        ),
      ),
      mockFillValue(
        "limitPrice",
        textValue(
          valueFromRecord(intent, ["limitPrice", "limit_price"]) ??
            tradingPackage?.limit_price,
        ),
      ),
      mockFillValue(
        "intendedPrice",
        textValue(
          valueFromRecord(intent, ["intendedPrice", "intended_price"]) ??
            valueFromRecord(tradingPackage, ["intendedPrice", "intended_price"]),
        ),
      ),
      mockFillValue(
        "targetPrice",
        textValue(
          valueFromRecord(intent, ["targetPrice", "target_price"]) ??
            tradingPackage?.target_price,
        ),
      ),
      mockFillValue(
        "stopLossPrice",
        textValue(
          valueFromRecord(intent, ["stopLossPrice", "stop_loss_price"]) ??
            tradingPackage?.stop_loss,
        ),
      ),
      mockFillValue(
        "mode",
        mode,
      ),
      mockFillValue(
        "requireManualFinalConfirmation",
        booleanText(request?.requireManualFinalConfirmation),
      ),
      mockFillValue(
        "allowAutomaticFinalSubmit",
        booleanText(request?.allowAutomaticFinalSubmit),
      ),
      mockFillValue("requestId", requestId),
      mockFillValue("intentId", intentId),
    ],
  };
}

function validateMockOrderPageFillPlan(plan) {
  const errors = [];
  const warnings = [];

  if (!isObject(plan)) {
    return {
      ok: false,
      errors: ["Mock order page fill plan is missing."],
      warnings,
    };
  }

  const values = Array.isArray(plan.values) ? plan.values : [];

  if (!Array.isArray(plan.values)) {
    errors.push("Fill plan values must be an array.");
  }

  for (const value of values) {
    if (!MOCK_ORDER_PAGE_AGENT_SELECTORS[value.fieldKey]) {
      errors.push(`Selector is missing for ${value.fieldKey}.`);
    }
  }

  const ticker = readMockFillPlanValue(plan, "ticker");
  const action = readMockFillPlanValue(plan, "action");
  const quantity = Number(readMockFillPlanValue(plan, "quantity"));
  const orderType = readMockFillPlanValue(plan, "orderType");
  const mode = readMockFillPlanValue(plan, "mode");
  const requestId = readMockFillPlanValue(plan, "requestId");
  const intentId = readMockFillPlanValue(plan, "intentId");

  if (!ticker) {
    errors.push("Ticker is missing.");
  }

  if (action !== "buy" && action !== "sell") {
    errors.push("Action must be buy or sell.");
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    errors.push("Quantity must be greater than 0.");
  }

  if (!orderType) {
    errors.push("Order type is missing.");
  }

  if (mode !== "semi_automatic" && mode !== "automatic") {
    errors.push("Mode must be semi_automatic or automatic.");
  }

  if (!requestId) {
    errors.push("Request id is missing.");
  }

  if (plan.intentIdExpected && !intentId) {
    errors.push("Intent id is missing.");
  }

  for (const fieldKey of mockOrderPageFieldKeys) {
    if (!values.some((value) => value.fieldKey === fieldKey)) {
      warnings.push(`Fill value is missing for ${fieldKey}.`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

function buildMockOrderPageUrlFromFillPlan(plan) {
  const params = new URLSearchParams();

  for (const fieldKey of mockOrderPageFieldKeys) {
    const value = readMockFillPlanValue(plan, fieldKey);

    if (value) {
      params.set(fieldKey, value);
    }
  }

  const queryString = params.toString();

  return queryString
    ? `${MOCK_ORDER_PAGE_TARGET_PATH}?${queryString}`
    : MOCK_ORDER_PAGE_TARGET_PATH;
}

function buildMockOrderPageRunMetadata(request) {
  try {
    const fillPlan = buildMockOrderPageFillPlanFromAgentRequest(request);
    const validation = validateMockOrderPageFillPlan(fillPlan);

    return {
      mockOrderPageAvailable: true,
      mockOrderPageUrl: buildMockOrderPageUrlFromFillPlan(fillPlan),
      mockOrderPageMessage:
        "Mock order fill plan generated for local testing only. No browser was opened.",
      mockOrderFillPlan: fillPlan,
      mockOrderFillPlanValid: validation.ok,
      mockOrderFillPlanErrors: validation.errors,
      mockOrderFillPlanWarnings: validation.warnings,
    };
  } catch (error) {
    return {
      mockOrderPageAvailable: false,
      mockOrderPageMessage:
        "Mock order fill plan could not be generated. No browser was opened.",
      mockOrderFillPlanValid: false,
      mockOrderFillPlanErrors: [
        error instanceof Error ? error.message : "Unknown fill-plan error.",
      ],
      mockOrderFillPlanWarnings: [],
    };
  }
}

function readMockAgentRunOptions(payload) {
  const metadata = isObject(payload?.metadata) ? payload.metadata : {};
  const enableMockAgentRun =
    booleanValue(payload?.enableMockAgentRun) ??
    booleanValue(metadata.enableMockAgentRun) ??
    false;
  const mockPageBaseUrl =
    stringValue(payload?.mockPageBaseUrl) ??
    stringValue(metadata.mockPageBaseUrl) ??
    DEFAULT_MOCK_PAGE_BASE_URL;
  const mockAgentHeaded =
    booleanValue(payload?.mockAgentHeaded) ??
    booleanValue(metadata.mockAgentHeaded) ??
    false;

  return {
    enableMockAgentRun,
    mockPageBaseUrl,
    mockAgentHeaded,
  };
}

async function buildMockAgentRunMetadata(payload, mockOrderPageMetadata) {
  const options = readMockAgentRunOptions(payload);

  if (options.enableMockAgentRun !== true) {
    return {};
  }

  const startedAt = now();

  if (mockOrderPageMetadata.mockOrderFillPlanValid !== true) {
    const errors =
      mockOrderPageMetadata.mockOrderFillPlanErrors?.length > 0
        ? mockOrderPageMetadata.mockOrderFillPlanErrors
        : ["Mock order fill plan is invalid."];

    return {
      mockAgentRunAttempted: true,
      mockAgentRunOk: false,
      mockAgentRunMessage:
        "Mock agent run was requested but skipped because the mock fill plan is invalid.",
      mockAgentRunErrors: errors,
      mockAgentRunStartedAt: startedAt,
      mockAgentRunCompletedAt: now(),
    };
  }

  try {
    const baseUrl = normalizeLocalhostBaseUrl(options.mockPageBaseUrl);
    const { runMockOrderPageAgent } = await import(
      "./mock-order-page-agent-runner.mjs"
    );
    const result = await runMockOrderPageAgent({
      baseUrl,
      fillPlan: mockOrderPageMetadata.mockOrderFillPlan,
      headed: options.mockAgentHeaded,
      pageUrl: mockOrderPageMetadata.mockOrderPageUrl,
    });

    return {
      mockAgentRunAttempted: true,
      mockAgentRunOk: result.ok,
      mockAgentRunMessage: result.message,
      mockAgentRunErrors: result.errors,
      mockAgentRunStartedAt: result.startedAt,
      mockAgentRunCompletedAt: result.completedAt,
    };
  } catch (error) {
    return {
      mockAgentRunAttempted: true,
      mockAgentRunOk: false,
      mockAgentRunMessage:
        "Mock agent run was requested but failed safely before any submit action.",
      mockAgentRunErrors: [
        error instanceof Error ? error.message : "Unknown mock-agent run error.",
      ],
      mockAgentRunStartedAt: startedAt,
      mockAgentRunCompletedAt: now(),
    };
  }
}

function requestIdFromRunPayload(payload) {
  return (
    stringValue(payload?.request?.requestId) ??
    stringValue(payload?.envelope?.requestId) ??
    stringValue(payload?.envelope?.payload?.requestId) ??
    "unknown_request"
  );
}

function createProgressEvent(requestId, type, message, metadata = undefined) {
  return {
    eventId: `avanza_agent_progress_${randomUUID()}`,
    requestId,
    createdAt: now(),
    type,
    message,
    ...(metadata ? { metadata } : {}),
  };
}

function createEchoProgressEvents(requestId, mockAgentRunRequested = false) {
  const metadata = {
    localhost_bridge_stub: true,
    dry_run: true,
    no_avanza_session: true,
    no_browser_automation: !mockAgentRunRequested,
    mock_agent_run_requested: mockAgentRunRequested,
    no_broker_result_created: true,
  };

  return [
    createProgressEvent(
      requestId,
      "agent_started",
      mockAgentRunRequested
        ? "Localhost bridge stub started a dry-run echo request with an explicit local mock-page review attempt. No Avanza session opened."
        : "Localhost bridge stub started a dry-run echo request. No broker page opened.",
      metadata,
    ),
    createProgressEvent(
      requestId,
      "broker_session_check_started",
      "Localhost bridge stub performed a protocol-only session check. No Avanza session exists.",
      metadata,
    ),
    createProgressEvent(
      requestId,
      "broker_session_ready",
      "Localhost bridge stub marked the dry-run protocol ready without connecting to a broker.",
      metadata,
    ),
    createProgressEvent(
      requestId,
      "order_review_ready",
      mockAgentRunRequested
        ? "Localhost bridge stub reached review-ready protocol state. Only the local mock order page may be reviewed; no order was submitted."
        : "Localhost bridge stub reached review-ready protocol state. No order form was opened, prepared, or submitted.",
      metadata,
    ),
  ];
}

function buildCapabilities() {
  return {
    transport: "local_process",
    supportsProgressEvents: true,
    supportsCancellation: true,
    supportsAutomaticSubmit: false,
    supportsManualConfirmationWait: true,
    supportsBrokerResultReturn: false,
    supportsRealBrokerAutomation: false,
    maxConcurrentRuns: 1,
    version: CONTRACT_VERSION,
  };
}

function buildHealthResponse() {
  const checkedAt = now();
  const capabilities = buildCapabilities();

  return {
    version: CONTRACT_VERSION,
    bridgeName: "Ture Localhost Bridge Stub",
    bridgeStatus: "available",
    transport: "http",
    health: {
      status: "available",
      transport: "local_process",
      checkedAt,
      message:
        "Localhost bridge stub is running. No Avanza or real broker integration is implemented; mock-page browser review is explicit local QA only.",
      capabilities,
    },
    capabilities,
    serverTime: checkedAt,
    message:
      "Localhost bridge stub is running. No Avanza or real broker integration is implemented; mock-page browser review is explicit local QA only.",
  };
}

function buildInfoResponse() {
  return {
    name: "Ture Localhost Bridge Stub",
    version: CONTRACT_VERSION,
    host: HOST,
    port,
    endpoints: {
      health: "/health",
      run: "/run",
      cancel: "/cancel",
    },
    message:
      "Local development stub only. No Avanza session opens, no real broker automation runs, and no broker result is created. Mock-page review runs only when explicitly requested.",
  };
}

function validateRunPayload(payload) {
  const errors = [];

  if (!isObject(payload)) {
    return ["Run payload must be a JSON object."];
  }

  if (payload.version !== CONTRACT_VERSION) {
    errors.push(`Run request version must be ${CONTRACT_VERSION}.`);
  }

  if (payload.dryRun !== true) {
    errors.push("Run request dryRun must be true.");
  }

  if (
    typeof payload.enableMockAgentRun !== "undefined" &&
    typeof payload.enableMockAgentRun !== "boolean"
  ) {
    errors.push("Run request enableMockAgentRun must be boolean when provided.");
  }

  if (
    typeof payload.mockAgentHeaded !== "undefined" &&
    typeof payload.mockAgentHeaded !== "boolean"
  ) {
    errors.push("Run request mockAgentHeaded must be boolean when provided.");
  }

  if (
    typeof payload.mockPageBaseUrl !== "undefined" &&
    !stringValue(payload.mockPageBaseUrl)
  ) {
    errors.push("Run request mockPageBaseUrl must be non-empty when provided.");
  }

  if (!isObject(payload.envelope)) {
    errors.push("Run request envelope is missing.");
  }

  if (!isObject(payload.request)) {
    errors.push("Run request request is missing.");
  }

  if (isObject(payload.envelope)) {
    if (payload.envelope.version !== BRIDGE_ENVELOPE_VERSION) {
      errors.push(`Envelope version must be ${BRIDGE_ENVELOPE_VERSION}.`);
    }

    if (payload.envelope.type !== "request") {
      errors.push("Envelope type must be request.");
    }

    if (!isObject(payload.envelope.payload)) {
      errors.push("Envelope payload is missing.");
    }
  }

  if (isObject(payload.request)) {
    if (!stringValue(payload.request.requestId)) {
      errors.push("Avanza agent request requestId is missing.");
    }

    if (payload.request.version !== AGENT_REQUEST_VERSION) {
      errors.push(`Avanza agent request version must be ${AGENT_REQUEST_VERSION}.`);
    }

    if (payload.request.broker !== "avanza") {
      errors.push("Avanza agent request broker must be avanza.");
    }
  }

  const requestId = stringValue(payload.request?.requestId);
  const envelopeRequestId = stringValue(payload.envelope?.requestId);
  const payloadRequestId = stringValue(payload.envelope?.payload?.requestId);

  if (requestId && envelopeRequestId && requestId !== envelopeRequestId) {
    errors.push("Envelope requestId must match request requestId.");
  }

  if (requestId && payloadRequestId && requestId !== payloadRequestId) {
    errors.push("Envelope payload requestId must match request requestId.");
  }

  if (isObject(payload.metadata)) {
    if (
      typeof payload.metadata.enableMockAgentRun !== "undefined" &&
      typeof payload.metadata.enableMockAgentRun !== "boolean"
    ) {
      errors.push("Run request metadata.enableMockAgentRun must be boolean when provided.");
    }

    if (
      typeof payload.metadata.mockAgentHeaded !== "undefined" &&
      typeof payload.metadata.mockAgentHeaded !== "boolean"
    ) {
      errors.push("Run request metadata.mockAgentHeaded must be boolean when provided.");
    }

    if (
      typeof payload.metadata.mockPageBaseUrl !== "undefined" &&
      !stringValue(payload.metadata.mockPageBaseUrl)
    ) {
      errors.push("Run request metadata.mockPageBaseUrl must be non-empty when provided.");
    }
  }

  return errors;
}

async function buildRunResponse(payload) {
  const errors = validateRunPayload(payload);
  const requestId = requestIdFromRunPayload(payload);

  if (errors.length > 0) {
    return {
      statusCode: 400,
      body: {
        version: CONTRACT_VERSION,
        requestId,
        accepted: false,
        message:
          "Localhost bridge stub rejected the dry-run request. No broker action occurred.",
        errors,
      },
    };
  }

  const mockOrderPageMetadata = buildMockOrderPageRunMetadata(payload.request);
  const mockAgentRunOptions = readMockAgentRunOptions(payload);
  const progressEvents = createEchoProgressEvents(
    requestId,
    mockAgentRunOptions.enableMockAgentRun === true,
  );
  const mockAgentRunMetadata = await buildMockAgentRunMetadata(
    payload,
    mockOrderPageMetadata,
  );

  return {
    statusCode: 200,
    body: {
      version: CONTRACT_VERSION,
      requestId,
      accepted: true,
      ...mockOrderPageMetadata,
      ...mockAgentRunMetadata,
      ...(mockAgentRunMetadata.mockAgentRunAttempted
        ? {
            mockOrderPageMessage:
              "Mock order fill plan generated for local testing. Mock-page browser execution was explicitly requested separately.",
          }
        : {}),
      message:
        "Echo run completed by localhost bridge stub. No Avanza session opened and no broker result created.",
      warnings: [
        "Localhost bridge stub only. No Avanza/browser/broker integration is implemented.",
        "brokerResult is intentionally undefined.",
        mockAgentRunMetadata.mockAgentRunAttempted
          ? "Mock order fill plan metadata is response-level only; the explicit mock-agent run does not create broker results."
          : "Mock order fill plan metadata is dry-run payload only; no browser was opened.",
        ...(mockAgentRunMetadata.mockAgentRunAttempted
          ? [
              "Mock agent run was explicitly requested and can only drive the local mock order page review flow.",
            ]
          : []),
        ...(mockOrderPageMetadata.mockOrderFillPlanWarnings ?? []),
      ],
      result: {
        requestId,
        createdAt: now(),
        status: "unknown",
        progressEvents,
        rawSummary:
          "Echo run completed by localhost bridge stub. No Avanza session opened and no broker result created.",
      },
    },
  };
}

function buildCancelResponse(payload) {
  const errors = [];

  if (!isObject(payload)) {
    errors.push("Cancel payload must be a JSON object.");
  }

  if (isObject(payload) && payload.version !== CONTRACT_VERSION) {
    errors.push(`Cancel request version must be ${CONTRACT_VERSION}.`);
  }

  const requestId = stringValue(payload?.requestId);

  if (!requestId) {
    errors.push("Cancel request requestId is missing.");
  }

  if (errors.length > 0) {
    return {
      statusCode: 400,
      body: {
        version: CONTRACT_VERSION,
        requestId: requestId ?? "unknown_request",
        cancelled: false,
        message:
          "Localhost bridge stub could not acknowledge cancel. No broker action occurred.",
        errors,
      },
    };
  }

  return {
    statusCode: 200,
    body: {
      version: CONTRACT_VERSION,
      requestId,
      cancelled: true,
      message:
        "Localhost bridge stub cancel acknowledged locally only. No broker action occurred.",
    },
  };
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    let bytes = 0;

    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      bytes += Buffer.byteLength(chunk, "utf8");

      if (bytes > MAX_BODY_BYTES) {
        reject(new Error("Request body is too large."));
        request.destroy();
        return;
      }

      body += chunk;
    });
    request.on("end", () => {
      if (!body.trim()) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Request body must be valid JSON."));
      }
    });
    request.on("error", reject);
  });
}

function corsOrigin(request) {
  const origin = request.headers.origin;

  return typeof origin === "string" && allowedOrigins.has(origin)
    ? origin
    : null;
}

function writeJson(response, request, statusCode, body) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Avanza-Bridge-Stub": "local-dev-only",
  };
  const origin = corsOrigin(request);

  if (origin) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Vary"] = "Origin";
  }

  response.writeHead(statusCode, headers);
  response.end(`${JSON.stringify(body, null, 2)}\n`);
}

function writeOptions(response, request) {
  const headers = {
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "600",
  };
  const origin = corsOrigin(request);

  if (origin) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Vary"] = "Origin";
  }

  response.writeHead(204, headers);
  response.end();
}

async function handleRequest(request, response) {
  const url = new URL(request.url ?? "/", `http://${HOST}:${port}`);

  if (request.method === "OPTIONS") {
    writeOptions(response, request);
    return;
  }

  if (request.method === "GET" && url.pathname === "/") {
    writeJson(response, request, 200, buildInfoResponse());
    return;
  }

  if (request.method === "GET" && url.pathname === "/health") {
    writeJson(response, request, 200, buildHealthResponse());
    return;
  }

  if (request.method === "POST" && url.pathname === "/run") {
    try {
      const payload = await readJsonBody(request);
      const { statusCode, body } = await buildRunResponse(payload);
      writeJson(response, request, statusCode, body);
    } catch (error) {
      writeJson(response, request, 400, {
        version: CONTRACT_VERSION,
        requestId: "unknown_request",
        accepted: false,
        message:
          "Localhost bridge stub could not parse run request. No broker action occurred.",
        errors: [error instanceof Error ? error.message : "Invalid request."],
      });
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/cancel") {
    try {
      const payload = await readJsonBody(request);
      const { statusCode, body } = buildCancelResponse(payload);
      writeJson(response, request, statusCode, body);
    } catch (error) {
      writeJson(response, request, 400, {
        version: CONTRACT_VERSION,
        requestId: "unknown_request",
        cancelled: false,
        message:
          "Localhost bridge stub could not parse cancel request. No broker action occurred.",
        errors: [error instanceof Error ? error.message : "Invalid request."],
      });
    }
    return;
  }

  writeJson(response, request, 404, {
    version: CONTRACT_VERSION,
    message: "Localhost bridge stub endpoint not found.",
    path: url.pathname,
  });
}

const server = http.createServer((request, response) => {
  handleRequest(request, response).catch((error) => {
    writeJson(response, request, 500, {
      version: CONTRACT_VERSION,
      message:
        "Localhost bridge stub failed safely. No broker action occurred.",
      error: error instanceof Error ? error.message : "Unknown error.",
    });
  });
});

server.on("error", (error) => {
  console.error(
    `Localhost bridge stub failed to listen on http://${HOST}:${port}.`,
  );
  console.error(error instanceof Error ? error.message : error);
  console.error(
    "No Avanza/browser/broker integration was started. This stub binds only to 127.0.0.1.",
  );
  process.exit(1);
});

server.listen(port, HOST, () => {
  console.log(
    `Ture localhost bridge stub listening on http://${HOST}:${port}`,
  );
  console.log(
    "Local dev stub only: no Avanza, no real broker execution, no brokerResult. Mock-page review requires explicit enableMockAgentRun.",
  );
});

function shutdown(signal) {
  console.log(`Received ${signal}; stopping localhost bridge stub.`);
  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
