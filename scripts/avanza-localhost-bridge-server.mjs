#!/usr/bin/env node

import http from "node:http";
import { randomUUID } from "node:crypto";
import {
  getAvanzaDryRunRunnerSkeletonCapability,
  getAvanzaDryRunRunnerSkeletonSelfCheck,
  runAvanzaDryRunRunnerSkeleton,
} from "./avanza-dry-run-runner-skeleton.mjs";

const CONTRACT_VERSION = "avanza_localhost_bridge_v1";
const AGENT_REQUEST_VERSION = "avanza_agent_request_v1";
const BRIDGE_ENVELOPE_VERSION = "avanza_agent_bridge_v1";
const AVANZA_DRY_RUN_RUNNER_SELF_CHECK_VERSION =
  "avanza_dry_run_runner_self_check_v1";
const AVANZA_SESSION_DETECTION_CONTRACT_VERSION =
  "avanza_session_detection_v1";
const AVANZA_SEARCH_ONLY_RESULT_CONTRACT_VERSION =
  "avanza_search_only_result_v1";
const AVANZA_INSTRUMENT_VERIFICATION_CONTRACT_VERSION =
  "avanza_instrument_verification_v1";
const AVANZA_INSTRUMENT_PAGE_CONTRACT_VERSION =
  "avanza_instrument_page_v1";
const AVANZA_ORDER_PAGE_OPEN_CONTRACT_VERSION =
  "avanza_order_page_open_v1";
const AVANZA_ADVANCED_FORM_FILL_CONTRACT_VERSION =
  "avanza_advanced_form_fill_v1";
const AVANZA_REVIEW_CLICK_CONTRACT_VERSION = "avanza_review_click_v1";
const AVANZA_MANUAL_CONFIRMATION_WAIT_CONTRACT_VERSION =
  "avanza_manual_confirmation_wait_v1";
const AVANZA_BROKER_CONFIRMATION_CAPTURE_CONTRACT_VERSION =
  "avanza_broker_confirmation_capture_v1";
const AVANZA_ORDER_FORM_PREFLIGHT_CONTRACT_VERSION =
  "avanza_order_form_preflight_observation_v1";
const DEFAULT_PORT = 47831;
const HOST = "127.0.0.1";
const MAX_BODY_BYTES = 1024 * 1024;
const MOCK_ORDER_PAGE_TARGET_PATH = "/mock-broker/order";
const DEFAULT_MOCK_PAGE_BASE_URL = "http://localhost:3000";
const DEFAULT_MANUAL_OBSERVATION_CDP_URL = "http://127.0.0.1:9222";
const MANUAL_OBSERVATION_MODE = "cdp_readonly";
const ENABLE_LIVE_FILL_ONLY_RUNNER_VALUE = "true";
const APPROVED_LIVE_FILL_ONLY_VALUES = {
  account: "Valentin Labs KF",
  instrument: "GameStop",
  side: "buy",
  orderMode: "Avancerad/Limit",
  amountSek: 427.26,
  amountSekText: "427,26",
  priceUsd: 21.98,
  priceUsdText: "21,98",
  capSek: 1000,
};
const AVANZA_LIVE_FILL_ONLY_SELECTORS = {
  amount: ['input[data-e2e="inputAmount"]', "input#inputAmount"],
  price: ['input[data-e2e="inputPrice"]', "input#inputPrice"],
  total: [
    '[data-e2e="totalAmount"]',
    '[data-e2e="orderTotalAmount"]',
    '[data-e2e="estimatedTotalAmount"]',
  ],
};

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

function numberFromInput(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
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
      mockAgentRunValidationErrors: result.validationErrors,
      mockAgentRunReviewVisible: result.reviewVisible,
      mockAgentRunConfirmationLinkAvailable: result.confirmationLinkAvailable,
      mockAgentRunSubmitDisabled: result.submitDisabled,
      mockAgentRunOrderModeVerified: result.orderModeVerified,
      safeActionDiagnosticsAvailable: Boolean(result.safeActionDiagnostics),
      safeActionDiagnosticsMessage: result.safeActionDiagnostics
        ? "Safe action diagnostics generated for local mock-page testing only."
        : "Safe action diagnostics were not returned by the local mock runner.",
      ...(result.safeActionDiagnostics
        ? { safeActionDiagnostics: result.safeActionDiagnostics }
        : {}),
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

function createUnavailableRunnerSelfCheck(checkedAt) {
  const blocker = "No Avanza dry-run runner is installed/available.";

  return {
    ok: false,
    status: "unavailable",
    checkedAt,
    runnerId: "avanza_dry_run_runner_unavailable",
    runnerName: "Avanza Dry-Run Runner",
    version: AVANZA_DRY_RUN_RUNNER_SELF_CHECK_VERSION,
    capabilityValidation: {
      ok: false,
      blocked: true,
      errors: [blocker],
      warnings: [],
      safetyLevel: "unknown_blocked",
      canRunMockBrowserActions: false,
      canRunAvanzaDryRun: false,
      canSubmitBrokerOrder: false,
    },
    readinessLabels: [
      "Runner unavailable",
      "No Avanza automation",
      "No broker submission",
      "Final confirm disabled",
    ],
    blockers: [blocker],
    warnings: [],
    errors: [blocker],
    metadata: {
      selfCheckVersion: AVANZA_DRY_RUN_RUNNER_SELF_CHECK_VERSION,
      runnerImplemented: false,
      noBrowserControl: true,
      noAvanzaAutomation: true,
      noAvanzaSelectors: true,
      noAvanzaUrls: true,
    },
  };
}

function createMockOnlyRunnerCapability(checkedAt) {
  return {
    runnerId: "localhost_bridge_mock_order_page_runner",
    runnerName: "Localhost Bridge Mock Order Page Runner",
    targetEnvironment: "mock_order_page",
    supportsBrowserExecution: true,
    supportsBrokerSubmission: false,
    supportsFinalConfirmClick: false,
    mockOnly: true,
    devOnly: true,
    automaticModeCapable: false,
    createdAt: checkedAt,
    metadata: {
      capabilityGateVersion: "browser_runner_capability_gate_v1",
      targetEnvironment: "mock_order_page",
      mockOnly: true,
      devOnly: true,
      supportsBrokerSubmission: false,
      supportsFinalConfirmClick: false,
      source: "localhost_bridge_self_check_stub",
    },
  };
}

function createMockOnlyRunnerSelfCheck(checkedAt, capability) {
  return {
    ok: true,
    status: "available_mock_only",
    checkedAt,
    runnerId: capability.runnerId,
    runnerName: capability.runnerName,
    version: AVANZA_DRY_RUN_RUNNER_SELF_CHECK_VERSION,
    capabilityValidation: {
      ok: true,
      blocked: false,
      errors: [],
      warnings: [],
      safetyLevel: "safe_mock_only",
      canRunMockBrowserActions: true,
      canRunAvanzaDryRun: false,
      canSubmitBrokerOrder: false,
    },
    readinessLabels: [
      "Mock-only browser diagnostics",
      "Cannot run Avanza dry-run",
      "No broker submission",
      "Final confirm disabled",
    ],
    blockers: [],
    warnings: [
      "Mock-only runner is available for mock diagnostics but cannot run Avanza dry-run.",
    ],
    errors: [],
    metadata: {
      selfCheckVersion: AVANZA_DRY_RUN_RUNNER_SELF_CHECK_VERSION,
      mockOnly: true,
      noAvanzaAutomation: true,
      noBrokerSubmission: true,
    },
  };
}

function buildRunnerSelfCheckResponse() {
  const checkedAt = now();
  const mode = stringValue(process.env.AVANZA_LOCALHOST_BRIDGE_SELF_CHECK_MODE);
  const useMockOnly = mode === "mock_only";
  const useDryRunSkeleton = mode === "dry_run_skeleton";
  const capability = useMockOnly
    ? createMockOnlyRunnerCapability(checkedAt)
    : useDryRunSkeleton
      ? getAvanzaDryRunRunnerSkeletonCapability(checkedAt)
    : undefined;
  const selfCheck = useMockOnly
    ? createMockOnlyRunnerSelfCheck(checkedAt, capability)
    : useDryRunSkeleton
      ? getAvanzaDryRunRunnerSkeletonSelfCheck(checkedAt)
    : createUnavailableRunnerSelfCheck(checkedAt);

  return {
    version: CONTRACT_VERSION,
    ok: true,
    bridgeVersion: CONTRACT_VERSION,
    checkedAt,
    selfCheck,
    ...(capability ? { capability } : {}),
    message: useDryRunSkeleton
      ? "Localhost bridge self-check reports the Avanza dry-run runner skeleton. It is dry-run-only and does not control a browser."
      : useMockOnly
        ? "Localhost bridge self-check reports mock-only browser diagnostics. It cannot run Avanza dry-run."
        : "Localhost bridge self-check completed. No Avanza dry-run runner is installed or available.",
    errors: [],
    warnings: [
      "Self-check is diagnostics only. It does not open a browser, touch Avanza, submit orders, create broker results, write Supabase, or mutate trades.",
      ...(useDryRunSkeleton
        ? [
            "Dry-run skeleton capability is not browser automation.",
            "Skeleton mode reports no browser control.",
          ]
        : useMockOnly
          ? ["Mock-only capability is not Avanza dry-run capability."]
          : ["Current Avanza dry-run runner status is unavailable."]),
    ],
    metadata: {
      localhost_bridge_stub: true,
      self_check_only: true,
      no_browser_control: true,
      no_avanza_session: true,
      no_broker_result_created: true,
      ...(useDryRunSkeleton
        ? {
            dry_run_skeleton: true,
            skeleton_only: true,
            no_browser_actions_executed: true,
          }
        : {}),
    },
  };
}

function createSessionDetectionResult(status, context, options = {}) {
  const checkedAt = options.checkedAt ?? now();
  const baseLabels = [
    "Session detection only",
    "No browser actions",
    "No broker submission",
    "No order preparation",
    "Local diagnostics only",
  ];
  const statusLabels = {
    unavailable: ["Session detection unavailable"],
    browser_not_connected: ["Browser not connected"],
    avanza_not_visible: ["Avanza not visible"],
    login_required: ["Login required"],
    ready_for_search_only: ["Ready for search-only"],
    blocked: ["Session detection blocked"],
    failed: ["Session detection failed"],
  };

  return {
    ok: status === "ready_for_search_only",
    status,
    checkedAt,
    context: {
      loginState: "unknown",
      language: "unknown",
      pageContext: "unknown",
      marketContext: "unknown",
      sanitizedHostClass: "unknown",
      sensitiveDataDetected: false,
      ...(context ?? {}),
    },
    blockers: options.blockers ?? [],
    warnings: options.warnings ?? [],
    errors: options.errors ?? [],
    labels: [...new Set([...baseLabels, ...(statusLabels[status] ?? [])])],
    metadata: {
      ...(options.metadata ?? {}),
      contractVersion: AVANZA_SESSION_DETECTION_CONTRACT_VERSION,
      targetEnvironment: "avanza_broker",
      sessionDetectionOnly: true,
      noBrowserActions: true,
      noBrokerSubmission: true,
      noFinalConfirm: true,
      noOrderPreparation: true,
    },
  };
}

function evaluateSessionDetectionContext(context, checkedAt) {
  const normalized = {
    loginState: "unknown",
    language: "unknown",
    pageContext: "unknown",
    marketContext: "unknown",
    sanitizedHostClass: "unknown",
    sensitiveDataDetected: false,
    ...(context ?? {}),
  };

  if (normalized.browserConnected === false) {
    return createSessionDetectionResult(
      "browser_not_connected",
      normalized,
      {
        checkedAt,
        blockers: ["Browser connection is not available."],
        errors: ["Browser connection is not available."],
      },
    );
  }

  if (normalized.sensitiveDataDetected === true) {
    return createSessionDetectionResult("blocked", normalized, {
      checkedAt,
      blockers: ["Sensitive data was detected and must be redacted."],
      errors: ["Sensitive data was detected and must be redacted."],
    });
  }

  if (normalized.pageContext === "confirmation_modal") {
    return createSessionDetectionResult("blocked", normalized, {
      checkedAt,
      blockers: [
        "Confirmation modal context is outside session-detection-only scope.",
      ],
      errors: [
        "Confirmation modal context is outside session-detection-only scope.",
      ],
    });
  }

  if (normalized.pageContext === "order_page") {
    return createSessionDetectionResult("blocked", normalized, {
      checkedAt,
      blockers: ["Order page context is outside session-detection-only scope."],
      errors: ["Order page context is outside session-detection-only scope."],
    });
  }

  if (
    normalized.avanzaVisible === false ||
    normalized.sanitizedHostClass === "other"
  ) {
    return createSessionDetectionResult("avanza_not_visible", normalized, {
      checkedAt,
      blockers: ["Avanza UI is not visible in the watched browser context."],
      errors: ["Avanza UI is not visible in the watched browser context."],
    });
  }

  if (
    normalized.loginState === "logged_out" ||
    normalized.loginState === "login_challenge" ||
    normalized.pageContext === "login"
  ) {
    return createSessionDetectionResult("login_required", normalized, {
      checkedAt,
      blockers: ["Avanza login is required before search-only readiness."],
      warnings: ["User must complete login manually."],
    });
  }

  if (
    normalized.loginState === "logged_in" &&
    normalized.avanzaVisible === true &&
    ["app_shell", "instrument_page", "unknown"].includes(
      normalized.pageContext,
    )
  ) {
    return createSessionDetectionResult(
      "ready_for_search_only",
      normalized,
      {
        checkedAt,
        warnings:
          normalized.pageContext === "instrument_page"
            ? [
                "Instrument page is visible; future search-only phase must avoid order preparation.",
              ]
            : [],
      },
    );
  }

  return createSessionDetectionResult("unavailable", normalized, {
    checkedAt,
    blockers: [
      "Session detection context is incomplete or cannot be classified safely.",
    ],
    warnings: [
      "Session detection needs browser, Avanza visibility, and login-state context.",
    ],
  });
}

function buildSessionDetectionResponse() {
  const checkedAt = now();
  const mode =
    stringValue(process.env.AVANZA_LOCALHOST_BRIDGE_SESSION_DETECTION_MODE) ??
    "unavailable";
  const supportedModes = new Set([
    "unavailable",
    "browser_not_connected",
    "avanza_not_visible",
    "login_required",
    "ready_for_search_only",
    "blocked_sensitive",
    "blocked_order_page",
  ]);
  const normalizedMode = supportedModes.has(mode) ? mode : "unavailable";
  const contextByMode = {
    unavailable: {},
    browser_not_connected: {
      browserConnected: false,
    },
    avanza_not_visible: {
      browserConnected: true,
      avanzaVisible: false,
      sanitizedHostClass: "other",
    },
    login_required: {
      browserConnected: true,
      avanzaVisible: true,
      sanitizedHostClass: "avanza",
      loginState: "login_challenge",
      pageContext: "login",
      language: "sv",
    },
    ready_for_search_only: {
      browserConnected: true,
      avanzaVisible: true,
      sanitizedHostClass: "avanza",
      loginState: "logged_in",
      pageContext: "app_shell",
      language: "sv",
      sensitiveDataDetected: false,
    },
    blocked_sensitive: {
      browserConnected: true,
      avanzaVisible: true,
      sanitizedHostClass: "avanza",
      loginState: "logged_in",
      pageContext: "app_shell",
      language: "sv",
      sensitiveDataDetected: true,
    },
    blocked_order_page: {
      browserConnected: true,
      avanzaVisible: true,
      sanitizedHostClass: "avanza",
      loginState: "logged_in",
      pageContext: "order_page",
      language: "sv",
      sensitiveDataDetected: false,
    },
  };
  const sessionDetection =
    normalizedMode === "unavailable"
      ? createSessionDetectionResult("unavailable", {}, {
          checkedAt,
          blockers: ["Session detection runner is not implemented."],
          errors: ["Session detection runner is not implemented."],
        })
      : evaluateSessionDetectionContext(contextByMode[normalizedMode], checkedAt);
  const baseWarnings = [
    "Session detection runner is not implemented.",
    "No browser actions were executed.",
    "No Avanza page was touched.",
  ];

  return {
    version: CONTRACT_VERSION,
    ok: sessionDetection.ok,
    bridgeVersion: CONTRACT_VERSION,
    checkedAt,
    sessionDetection,
    message:
      sessionDetection.status === "ready_for_search_only"
        ? "Localhost bridge session-detection stub reports ready-for-search-only metadata. No browser was controlled."
        : "Localhost bridge session-detection stub completed safely. No browser was controlled.",
    errors: [...sessionDetection.errors],
    warnings: [...new Set([...baseWarnings, ...sessionDetection.warnings])],
    metadata: {
      localhost_bridge_stub: true,
      session_detection_stub: true,
      session_detection_only: true,
      session_detection_mode: normalizedMode,
      no_browser_control: true,
      no_browser_actions_executed: true,
      no_avanza_page_touched: true,
      no_avanza_urls: true,
      no_avanza_selectors: true,
      no_broker_submission: true,
      no_broker_result_created: true,
      no_trade_mutation: true,
    },
  };
}

function normalizeSearchText(value) {
  return typeof value === "string"
    ? value.trim().toLocaleLowerCase("sv-SE").replace(/\s+/g, " ")
    : "";
}

function createSearchOnlyCandidate(expectedInstrument, options = {}) {
  const ticker = stringValue(options.ticker) ?? stringValue(expectedInstrument.ticker) ?? "";
  const displayName =
    stringValue(options.displayName) ??
    stringValue(expectedInstrument.name) ??
    ticker;

  return {
    candidateId:
      stringValue(options.candidateId) ??
      `synthetic_candidate_${ticker.replace(/\W+/g, "_").toLowerCase()}`,
    displayName,
    ticker,
    ...(stringValue(options.market) ?? stringValue(expectedInstrument.market)
      ? {
          market:
            stringValue(options.market) ?? stringValue(expectedInstrument.market),
        }
      : {}),
    ...(stringValue(options.currency) ?? stringValue(expectedInstrument.currency)
      ? {
          currency:
            stringValue(options.currency) ??
            stringValue(expectedInstrument.currency),
        }
      : {}),
    ...(stringValue(options.instrumentType) ??
    stringValue(expectedInstrument.instrumentType)
      ? {
          instrumentType:
            stringValue(options.instrumentType) ??
            stringValue(expectedInstrument.instrumentType),
        }
      : {}),
    matchConfidence:
      typeof options.matchConfidence === "number" &&
      Number.isFinite(options.matchConfidence)
        ? Math.min(1, Math.max(0, options.matchConfidence))
        : 0.98,
    sanitizedSource: stringValue(options.sanitizedSource) ?? "synthetic_stub",
    riskFlags: Array.isArray(options.riskFlags) ? options.riskFlags : [],
    warnings: Array.isArray(options.warnings) ? options.warnings : [],
  };
}

function createSearchOnlyResult(status, expectedInstrument, options = {}) {
  const checkedAt = options.checkedAt ?? now();
  const safetyLabels = [
    "Search-only",
    "No order page",
    "No buy/sell click",
    "No broker submission",
    "No trade mutation",
  ];
  const statusLabels = {
    unavailable: ["Search unavailable"],
    session_not_ready: ["Session not ready"],
    search_not_available: ["Search not available"],
    no_match: ["No instrument match"],
    ambiguous: ["Ambiguous candidates"],
    exact_match: ["Exact instrument match"],
    blocked: ["Search-only blocked"],
    failed: ["Search-only failed"],
  };

  return {
    ok: status === "exact_match",
    status,
    checkedAt,
    expectedInstrument: {
      ticker: stringValue(expectedInstrument?.ticker) ?? "",
      ...(stringValue(expectedInstrument?.name)
        ? { name: stringValue(expectedInstrument.name) }
        : {}),
      ...(stringValue(expectedInstrument?.market)
        ? { market: stringValue(expectedInstrument.market) }
        : {}),
      ...(stringValue(expectedInstrument?.currency)
        ? { currency: stringValue(expectedInstrument.currency) }
        : {}),
      ...(stringValue(expectedInstrument?.instrumentType)
        ? { instrumentType: stringValue(expectedInstrument.instrumentType) }
        : {}),
    },
    candidates: options.candidates ?? [],
    ...(options.selectedCandidate
      ? { selectedCandidate: options.selectedCandidate }
      : {}),
    blockers: options.blockers ?? [],
    warnings: options.warnings ?? [],
    errors: options.errors ?? [],
    labels: [
      ...new Set([
        ...safetyLabels,
        ...(statusLabels[status] ?? []),
        ...(options.labels ?? []),
      ]),
    ],
    metadata: {
      ...(options.metadata ?? {}),
      contractVersion: AVANZA_SEARCH_ONLY_RESULT_CONTRACT_VERSION,
      searchOnly: true,
      noOrderPage: true,
      noBuySellClick: true,
      noBrokerSubmission: true,
      noTradeMutation: true,
      noBrokerResult: true,
    },
  };
}

function classifySearchOnlyCandidates(expectedInstrument, candidates, checkedAt) {
  if (!stringValue(expectedInstrument?.ticker)) {
    return createSearchOnlyResult("failed", expectedInstrument, {
      checkedAt,
      blockers: ["Expected instrument ticker is required for search-only."],
      errors: ["Expected instrument ticker is required for search-only."],
    });
  }

  if (candidates.some((candidate) => candidate.riskFlags.includes("order_flow_detected"))) {
    return createSearchOnlyResult("blocked", expectedInstrument, {
      checkedAt,
      candidates,
      blockers: ["Order flow was detected during search-only candidate parsing."],
      errors: ["Order flow was detected during search-only candidate parsing."],
    });
  }

  if (candidates.some((candidate) => candidate.riskFlags.includes("sensitive_data_detected"))) {
    return createSearchOnlyResult("blocked", expectedInstrument, {
      checkedAt,
      candidates,
      blockers: ["Sensitive data was detected during search-only candidate parsing."],
      errors: ["Sensitive data was detected during search-only candidate parsing."],
    });
  }

  if (candidates.length === 0) {
    return createSearchOnlyResult("no_match", expectedInstrument, {
      checkedAt,
      warnings: ["No search candidates were returned."],
    });
  }

  const expectedTicker = normalizeSearchText(expectedInstrument.ticker);
  const tickerMatches = candidates.filter(
    (candidate) => normalizeSearchText(candidate.ticker) === expectedTicker,
  );

  if (tickerMatches.length > 1) {
    return createSearchOnlyResult("ambiguous", expectedInstrument, {
      checkedAt,
      candidates: candidates.map((candidate) =>
        normalizeSearchText(candidate.ticker) === expectedTicker
          ? {
              ...candidate,
              riskFlags: [...new Set([...candidate.riskFlags, "duplicate_ticker"])],
              warnings: [
                ...new Set([
                  ...candidate.warnings,
                  "Multiple candidates share the expected ticker.",
                ]),
              ],
            }
          : candidate,
      ),
      blockers: ["Multiple candidates share the expected ticker."],
      warnings: ["Duplicate ticker candidates require manual review."],
    });
  }

  if (tickerMatches.length === 1) {
    return createSearchOnlyResult("exact_match", expectedInstrument, {
      checkedAt,
      candidates,
      selectedCandidate: tickerMatches[0],
    });
  }

  return createSearchOnlyResult("no_match", expectedInstrument, {
    checkedAt,
    candidates: candidates.map((candidate) => ({
      ...candidate,
      riskFlags: [...new Set([...candidate.riskFlags, "ticker_mismatch"])],
      warnings: [
        ...new Set([
          ...candidate.warnings,
          "Candidate ticker does not match expected ticker.",
        ]),
      ],
    })),
    warnings: ["No safe exact instrument match was found."],
  });
}

function validateSearchOnlyPayload(payload) {
  const errors = [];

  if (!isObject(payload)) {
    return ["Search-only payload must be a JSON object."];
  }

  if (payload.version !== CONTRACT_VERSION) {
    errors.push(`Search-only request version must be ${CONTRACT_VERSION}.`);
  }

  if (!stringValue(payload.requestId)) {
    errors.push("Search-only request requestId is missing.");
  }

  if (!stringValue(payload.createdAt) || !Number.isFinite(Date.parse(payload.createdAt))) {
    errors.push("Search-only request createdAt must be a valid timestamp.");
  }

  if (!isObject(payload.expectedInstrument)) {
    errors.push("Search-only request expectedInstrument is missing.");
  } else if (!stringValue(payload.expectedInstrument.ticker)) {
    errors.push("Search-only request expectedInstrument.ticker is required.");
  }

  if (hasUnsafeDryRunMetadata(payload.metadata)) {
    errors.push("Search-only request metadata contains unsafe submit or broker automation flags.");
  }

  return errors;
}

function requestIdFromSearchOnlyPayload(payload) {
  return stringValue(payload?.requestId) ?? "unknown_search_only_request";
}

function buildSearchOnlyResponse(payload) {
  const receivedAt = now();
  const checkedAt = receivedAt;
  const requestId = requestIdFromSearchOnlyPayload(payload);
  const errors = validateSearchOnlyPayload(payload);
  const expectedInstrument =
    isObject(payload?.expectedInstrument) &&
    stringValue(payload.expectedInstrument.ticker)
      ? payload.expectedInstrument
      : { ticker: "UNKNOWN" };
  const mode =
    stringValue(process.env.AVANZA_LOCALHOST_BRIDGE_SEARCH_ONLY_MODE) ??
    "unavailable";
  const supportedModes = new Set([
    "unavailable",
    "search_not_available",
    "no_match",
    "exact_match",
    "ambiguous",
    "blocked_sensitive",
    "blocked_order_flow",
    "session_not_ready",
  ]);
  const normalizedMode = supportedModes.has(mode) ? mode : "unavailable";
  let searchOnly;

  if (errors.length > 0) {
    searchOnly = createSearchOnlyResult("failed", expectedInstrument, {
      checkedAt,
      blockers: errors,
      errors,
    });
  } else if (normalizedMode === "session_not_ready") {
    searchOnly = createSearchOnlyResult("session_not_ready", expectedInstrument, {
      checkedAt,
      blockers: ["Session detection is not ready for search-only."],
      warnings: ["Search-only requires ready_for_search_only session detection."],
    });
  } else if (
    normalizedMode === "unavailable" ||
    normalizedMode === "search_not_available"
  ) {
    searchOnly = createSearchOnlyResult("search_not_available", expectedInstrument, {
      checkedAt,
      blockers: ["Search-only runner is not implemented."],
      errors: ["Search-only runner is not implemented."],
    });
  } else if (normalizedMode === "exact_match") {
    searchOnly = classifySearchOnlyCandidates(
      expectedInstrument,
      [createSearchOnlyCandidate(expectedInstrument)],
      checkedAt,
    );
  } else if (normalizedMode === "ambiguous") {
    searchOnly = classifySearchOnlyCandidates(
      expectedInstrument,
      [
        createSearchOnlyCandidate(expectedInstrument, {
          candidateId: "synthetic_candidate_exact_1",
        }),
        createSearchOnlyCandidate(expectedInstrument, {
          candidateId: "synthetic_candidate_exact_2",
          displayName: `${stringValue(expectedInstrument.name) ?? stringValue(expectedInstrument.ticker)} secondary`,
        }),
      ],
      checkedAt,
    );
  } else if (normalizedMode === "no_match") {
    searchOnly = classifySearchOnlyCandidates(
      expectedInstrument,
      [
        createSearchOnlyCandidate(expectedInstrument, {
          candidateId: "synthetic_candidate_mismatch",
          ticker: "NO.MATCH",
          displayName: "No matching synthetic candidate",
        }),
      ],
      checkedAt,
    );
  } else if (normalizedMode === "blocked_sensitive") {
    searchOnly = classifySearchOnlyCandidates(
      expectedInstrument,
      [
        createSearchOnlyCandidate(expectedInstrument, {
          candidateId: "synthetic_candidate_sensitive_block",
          riskFlags: ["sensitive_data_detected"],
        }),
      ],
      checkedAt,
    );
  } else {
    searchOnly = classifySearchOnlyCandidates(
      expectedInstrument,
      [
        createSearchOnlyCandidate(expectedInstrument, {
          candidateId: "synthetic_candidate_order_flow_block",
          riskFlags: ["order_flow_detected"],
        }),
      ],
      checkedAt,
    );
  }

  const statusCode =
    errors.length > 0 || searchOnly.status === "blocked"
      ? 400
      : searchOnly.status === "search_not_available" ||
          searchOnly.status === "unavailable"
        ? 501
        : 200;
  const baseWarnings = [
    "Search-only runner is not implemented.",
    "No browser actions were executed.",
    "No Avanza page was touched.",
    "No order page was opened.",
  ];

  return {
    statusCode,
    body: {
      version: CONTRACT_VERSION,
      ok: searchOnly.ok,
      bridgeVersion: CONTRACT_VERSION,
      requestId,
      receivedAt,
      completedAt: now(),
      searchOnly,
      message:
        searchOnly.status === "exact_match"
          ? "Localhost bridge search-only stub returned a synthetic exact match. No browser was controlled."
          : "Localhost bridge search-only stub completed safely. No browser was controlled.",
      errors: [...errors, ...searchOnly.errors],
      warnings: [...new Set([...baseWarnings, ...searchOnly.warnings])],
      metadata: {
        ...(isObject(payload?.metadata) ? payload.metadata : {}),
        localhost_bridge_stub: true,
        search_only_endpoint_stub: true,
        search_only_mode: normalizedMode,
        no_browser_control: true,
        no_browser_actions_executed: true,
        no_avanza_page_touched: true,
        no_avanza_urls: true,
        no_avanza_selectors: true,
        no_order_page_opened: true,
        no_buy_sell_click: true,
        no_broker_submission: true,
        no_broker_result_created: true,
        no_trade_mutation: true,
      },
    },
  };
}

function createInstrumentVerificationFieldCheck(
  field,
  expected,
  actual,
  required,
  options = {},
) {
  if (!stringValue(expected)) {
    return {
      field,
      ...(stringValue(actual) ? { actual: stringValue(actual) } : {}),
      status: "missing_expected",
      required: false,
      message:
        options.missingExpectedMessage ??
        `Expected ${field} is missing; verification confidence is lower.`,
    };
  }

  if (!stringValue(actual)) {
    return {
      field,
      expected: stringValue(expected),
      status: "missing_candidate",
      required,
      message: options.missingCandidateMessage ?? `Candidate ${field} is missing.`,
    };
  }

  if (normalizeSearchText(expected) === normalizeSearchText(actual)) {
    return {
      field,
      expected: stringValue(expected),
      actual: stringValue(actual),
      status: "match",
      required,
    };
  }

  return {
    field,
    expected: stringValue(expected),
    actual: stringValue(actual),
    status: "mismatch",
    required,
    message: options.mismatchMessage ?? `Candidate ${field} does not match.`,
  };
}

function createInstrumentVerificationResult(
  status,
  expectedInstrument,
  options = {},
) {
  const labelsByStatus = {
    unavailable: ["Instrument verification unavailable"],
    search_not_ready: ["Search-only result not ready"],
    missing_candidate: ["Selected candidate missing"],
    verified: ["Instrument verified"],
    rejected: ["Instrument rejected"],
    ambiguous: ["Instrument ambiguous"],
    blocked: ["Instrument verification blocked"],
    failed: ["Instrument verification failed"],
  };

  return {
    ok: status === "verified",
    status,
    checkedAt: options.checkedAt ?? now(),
    expectedInstrument: {
      ticker: stringValue(expectedInstrument?.ticker) ?? "",
      ...(stringValue(expectedInstrument?.name)
        ? { name: stringValue(expectedInstrument.name) }
        : {}),
      ...(stringValue(expectedInstrument?.market)
        ? { market: stringValue(expectedInstrument.market) }
        : {}),
      ...(stringValue(expectedInstrument?.currency)
        ? { currency: stringValue(expectedInstrument.currency) }
        : {}),
      ...(stringValue(expectedInstrument?.instrumentType)
        ? { instrumentType: stringValue(expectedInstrument.instrumentType) }
        : {}),
    },
    ...(options.selectedCandidate
      ? { selectedCandidate: options.selectedCandidate }
      : {}),
    fieldChecks: options.fieldChecks ?? [],
    riskFlags: [...new Set(options.riskFlags ?? [])],
    blockers: [...new Set(options.blockers ?? [])],
    warnings: [...new Set(options.warnings ?? [])],
    errors: [...new Set(options.errors ?? [])],
    labels: [
      ...new Set([
        "Instrument verification only",
        "No order page",
        "No buy/sell click",
        "No form fill",
        "No broker submission",
        "No trade mutation",
        ...(labelsByStatus[status] ?? []),
        ...(options.labels ?? []),
      ]),
    ],
    metadata: {
      ...(options.metadata ?? {}),
      contractVersion: AVANZA_INSTRUMENT_VERIFICATION_CONTRACT_VERSION,
      instrumentVerificationOnly: true,
      noOrderPage: true,
      noBuySellClick: true,
      noFormFill: true,
      noBrokerSubmission: true,
      noTradeMutation: true,
      noBrokerResult: true,
    },
  };
}

function verifyInstrumentStub(expectedInstrument, searchOnlyResult, selectedCandidate, checkedAt) {
  if (!isObject(searchOnlyResult) || searchOnlyResult.status !== "exact_match") {
    if (isObject(searchOnlyResult) && searchOnlyResult.status === "ambiguous") {
      return createInstrumentVerificationResult("ambiguous", expectedInstrument, {
        checkedAt,
        blockers: ["Search-only result is ambiguous and requires manual review."],
        warnings: Array.isArray(searchOnlyResult.warnings)
          ? searchOnlyResult.warnings
          : [],
        riskFlags: ["duplicate_or_ambiguous_candidate"],
      });
    }

    if (isObject(searchOnlyResult) && searchOnlyResult.status === "blocked") {
      const blocker =
        Array.isArray(searchOnlyResult.blockers) && searchOnlyResult.blockers[0]
          ? searchOnlyResult.blockers[0]
          : "Search-only result is blocked and cannot be verified.";

      return createInstrumentVerificationResult("blocked", expectedInstrument, {
        checkedAt,
        blockers: [blocker],
        errors: [blocker],
        riskFlags: ["candidate_has_critical_risk"],
      });
    }

    return createInstrumentVerificationResult("search_not_ready", expectedInstrument, {
      checkedAt,
      blockers: [
        `Search-only result must be exact_match before instrument verification; received ${
          stringValue(searchOnlyResult?.status) ?? "missing"
        }.`,
      ],
    });
  }

  const candidate = selectedCandidate ?? searchOnlyResult.selectedCandidate;

  if (!isObject(candidate)) {
    return createInstrumentVerificationResult("missing_candidate", expectedInstrument, {
      checkedAt,
      blockers: ["Selected search-only candidate is required for verification."],
      errors: ["Selected search-only candidate is required for verification."],
    });
  }

  if (Array.isArray(candidate.riskFlags)) {
    if (candidate.riskFlags.includes("sensitive_data_detected")) {
      return createInstrumentVerificationResult("blocked", expectedInstrument, {
        checkedAt,
        selectedCandidate: candidate,
        blockers: ["Sensitive data risk detected on selected candidate."],
        errors: ["Sensitive data risk detected on selected candidate."],
        riskFlags: ["sensitive_data_detected", "candidate_has_critical_risk"],
      });
    }

    if (candidate.riskFlags.includes("order_flow_detected")) {
      return createInstrumentVerificationResult("blocked", expectedInstrument, {
        checkedAt,
        selectedCandidate: candidate,
        blockers: ["Order-flow risk detected on selected candidate."],
        errors: ["Order-flow risk detected on selected candidate."],
        riskFlags: ["order_flow_detected", "candidate_has_critical_risk"],
      });
    }
  }

  const expected = isObject(expectedInstrument) ? expectedInstrument : { ticker: "" };
  const fieldChecks = [
    createInstrumentVerificationFieldCheck(
      "ticker",
      expected.ticker,
      candidate.ticker,
      true,
      { mismatchMessage: "Candidate ticker does not match expected ticker." },
    ),
    createInstrumentVerificationFieldCheck(
      "name",
      expected.name,
      candidate.displayName,
      Boolean(stringValue(expected.name)),
      {
        mismatchMessage: "Candidate name does not match expected instrument name.",
        missingCandidateMessage: "Candidate name is missing.",
      },
    ),
    createInstrumentVerificationFieldCheck(
      "market",
      expected.market,
      candidate.market,
      Boolean(stringValue(expected.market)),
      { mismatchMessage: "Candidate market does not match expected market." },
    ),
    createInstrumentVerificationFieldCheck(
      "currency",
      expected.currency,
      candidate.currency,
      Boolean(stringValue(expected.currency)),
      { mismatchMessage: "Candidate currency does not match expected currency." },
    ),
    createInstrumentVerificationFieldCheck(
      "instrumentType",
      expected.instrumentType,
      candidate.instrumentType,
      Boolean(stringValue(expected.instrumentType)),
      {
        mismatchMessage:
          "Candidate instrument type does not match expected instrument type.",
      },
    ),
  ];
  const riskFlags = [];
  const blockers = [];
  const warnings = Array.isArray(candidate.warnings) ? [...candidate.warnings] : [];
  const errors = [];

  for (const check of fieldChecks) {
    if (check.status === "mismatch") {
      const riskByField = {
        ticker: "ticker_mismatch",
        name: "name_mismatch",
        market: "market_mismatch",
        currency: "currency_mismatch",
        instrumentType: "instrument_type_mismatch",
      };
      riskFlags.push(riskByField[check.field]);
      if (check.required) {
        blockers.push(check.message);
        errors.push(check.message);
      } else {
        warnings.push(check.message);
      }
    }

    if (check.status === "missing_candidate") {
      const missingRiskByField = {
        market: "missing_market",
        currency: "missing_currency",
        instrumentType: "missing_instrument_type",
      };
      if (missingRiskByField[check.field]) {
        riskFlags.push(missingRiskByField[check.field]);
      }
      warnings.push(check.message);
    }
  }

  if (
    typeof candidate.matchConfidence === "number" &&
    Number.isFinite(candidate.matchConfidence) &&
    candidate.matchConfidence < 0.85
  ) {
    riskFlags.push("low_confidence");
    warnings.push("Candidate match confidence is below 0.85.");
  }

  if (fieldChecks.some((check) => check.required && check.status === "mismatch")) {
    return createInstrumentVerificationResult("rejected", expectedInstrument, {
      checkedAt,
      selectedCandidate: candidate,
      fieldChecks,
      riskFlags,
      blockers,
      warnings,
      errors,
    });
  }

  if (
    fieldChecks.some(
      (check) => check.required && check.status === "missing_candidate",
    ) ||
    riskFlags.includes("low_confidence")
  ) {
    return createInstrumentVerificationResult("ambiguous", expectedInstrument, {
      checkedAt,
      selectedCandidate: candidate,
      fieldChecks,
      riskFlags,
      blockers: ["Instrument identity requires manual review before any future phase."],
      warnings,
    });
  }

  return createInstrumentVerificationResult("verified", expectedInstrument, {
    checkedAt,
    selectedCandidate: candidate,
    fieldChecks,
    riskFlags,
    warnings,
  });
}

function validateInstrumentVerificationPayload(payload) {
  const errors = [];

  if (!isObject(payload)) {
    return ["Instrument verification payload must be a JSON object."];
  }

  if (payload.version !== CONTRACT_VERSION) {
    errors.push(`Instrument verification request version must be ${CONTRACT_VERSION}.`);
  }

  if (!stringValue(payload.requestId)) {
    errors.push("Instrument verification request requestId is missing.");
  }

  if (!stringValue(payload.createdAt) || !Number.isFinite(Date.parse(payload.createdAt))) {
    errors.push("Instrument verification request createdAt must be a valid timestamp.");
  }

  if (!isObject(payload.expectedInstrument)) {
    errors.push("Instrument verification request expectedInstrument is missing.");
  } else if (!stringValue(payload.expectedInstrument.ticker)) {
    errors.push("Instrument verification request expectedInstrument.ticker is required.");
  }

  if (hasUnsafeDryRunMetadata(payload.metadata)) {
    errors.push(
      "Instrument verification request metadata contains unsafe submit or broker automation flags.",
    );
  }

  return errors;
}

function buildInstrumentVerificationResponse(payload) {
  const receivedAt = now();
  const checkedAt = receivedAt;
  const requestId =
    stringValue(payload?.requestId) ?? "unknown_instrument_verification_request";
  const errors = validateInstrumentVerificationPayload(payload);
  const expectedInstrument =
    isObject(payload?.expectedInstrument) &&
    stringValue(payload.expectedInstrument.ticker)
      ? payload.expectedInstrument
      : { ticker: "UNKNOWN" };
  const mode =
    stringValue(process.env.AVANZA_LOCALHOST_BRIDGE_INSTRUMENT_VERIFICATION_MODE) ??
    "unavailable";
  const supportedModes = new Set([
    "unavailable",
    "verified",
    "rejected_ticker",
    "rejected_market",
    "rejected_currency",
    "ambiguous_missing_currency",
    "ambiguous_low_confidence",
    "blocked_sensitive",
    "blocked_order_flow",
    "search_not_ready",
    "missing_candidate",
  ]);
  const normalizedMode = supportedModes.has(mode) ? mode : "unavailable";
  const baseCandidate = createSearchOnlyCandidate(expectedInstrument);
  let searchOnlyResult = payload?.searchOnlyResult;
  let selectedCandidate = payload?.selectedCandidate;
  let instrumentVerification;

  if (errors.length > 0) {
    instrumentVerification = createInstrumentVerificationResult("failed", expectedInstrument, {
      checkedAt,
      blockers: errors,
      errors,
    });
  } else if (normalizedMode === "unavailable") {
    instrumentVerification = createInstrumentVerificationResult(
      "unavailable",
      expectedInstrument,
      {
        checkedAt,
        blockers: ["Instrument verification runner is not implemented."],
        errors: ["Instrument verification runner is not implemented."],
      },
    );
  } else {
    if (!isObject(searchOnlyResult)) {
      if (normalizedMode === "search_not_ready") {
        searchOnlyResult = createSearchOnlyResult("ambiguous", expectedInstrument, {
          checkedAt,
          candidates: [baseCandidate],
          blockers: ["Search-only result is ambiguous and requires manual review."],
          warnings: ["Instrument verification requires exact_match search-only result."],
        });
      } else {
        searchOnlyResult = createSearchOnlyResult("exact_match", expectedInstrument, {
          checkedAt,
          candidates: [baseCandidate],
          selectedCandidate: baseCandidate,
        });
      }
    }

    if (normalizedMode === "verified") {
      selectedCandidate = baseCandidate;
    } else if (normalizedMode === "rejected_ticker") {
      selectedCandidate = {
        ...baseCandidate,
        candidateId: "synthetic_instrument_rejected_ticker",
        ticker: "NO.MATCH",
      };
    } else if (normalizedMode === "rejected_market") {
      selectedCandidate = {
        ...baseCandidate,
        candidateId: "synthetic_instrument_rejected_market",
        market: "Oslo",
      };
    } else if (normalizedMode === "rejected_currency") {
      selectedCandidate = {
        ...baseCandidate,
        candidateId: "synthetic_instrument_rejected_currency",
        currency: "NOK",
      };
    } else if (normalizedMode === "ambiguous_missing_currency") {
      selectedCandidate = {
        ...baseCandidate,
        candidateId: "synthetic_instrument_missing_currency",
        currency: undefined,
      };
    } else if (normalizedMode === "ambiguous_low_confidence") {
      selectedCandidate = {
        ...baseCandidate,
        candidateId: "synthetic_instrument_low_confidence",
        matchConfidence: 0.5,
      };
    } else if (normalizedMode === "blocked_sensitive") {
      selectedCandidate = {
        ...baseCandidate,
        candidateId: "synthetic_instrument_sensitive_block",
        riskFlags: ["sensitive_data_detected"],
      };
    } else if (normalizedMode === "blocked_order_flow") {
      selectedCandidate = {
        ...baseCandidate,
        candidateId: "synthetic_instrument_order_flow_block",
        riskFlags: ["order_flow_detected"],
      };
    } else if (normalizedMode === "missing_candidate") {
      selectedCandidate = undefined;
    }

    instrumentVerification = verifyInstrumentStub(
      expectedInstrument,
      searchOnlyResult,
      selectedCandidate,
      checkedAt,
    );
  }

  const statusCode =
    errors.length > 0 || instrumentVerification.status === "blocked"
      ? 400
      : instrumentVerification.status === "unavailable"
        ? 501
        : 200;
  const baseWarnings = [
    "Instrument verification runner is not implemented.",
    "No browser actions were executed.",
    "No Avanza page was touched.",
    "No order page was opened.",
  ];

  return {
    statusCode,
    body: {
      version: CONTRACT_VERSION,
      ok: instrumentVerification.ok,
      bridgeVersion: CONTRACT_VERSION,
      requestId,
      receivedAt,
      completedAt: now(),
      instrumentVerification,
      message:
        instrumentVerification.status === "verified"
          ? "Localhost bridge instrument verification stub returned a synthetic verified result. No browser was controlled."
          : "Localhost bridge instrument verification stub completed safely. No browser was controlled.",
      errors: [...errors, ...instrumentVerification.errors],
      warnings: [...new Set([...baseWarnings, ...instrumentVerification.warnings])],
      metadata: {
        ...(isObject(payload?.metadata) ? payload.metadata : {}),
        localhost_bridge_stub: true,
        instrument_verification_endpoint_stub: true,
        instrument_verification_mode: normalizedMode,
        no_browser_control: true,
        no_browser_actions_executed: true,
        no_avanza_page_touched: true,
        no_avanza_urls: true,
        no_avanza_selectors: true,
        no_order_page_opened: true,
        no_buy_sell_click: true,
        no_form_fill: true,
        no_broker_submission: true,
        no_broker_result_created: true,
        no_trade_mutation: true,
      },
    },
  };
}

function createInstrumentPageFieldCheck(
  field,
  expected,
  actual,
  required,
  options = {},
) {
  if (!stringValue(expected)) {
    return {
      field,
      ...(stringValue(actual) ? { actual: stringValue(actual) } : {}),
      status: "missing_expected",
      required: false,
      message:
        options.missingExpectedMessage ??
        `Expected ${field} is missing; page identity confidence is lower.`,
    };
  }

  if (!stringValue(actual)) {
    return {
      field,
      expected: stringValue(expected),
      status: "missing_page",
      required,
      message: options.missingPageMessage ?? `Page ${field} is missing.`,
    };
  }

  if (normalizeSearchText(expected) === normalizeSearchText(actual)) {
    return {
      field,
      expected: stringValue(expected),
      actual: stringValue(actual),
      status: "match",
      required,
    };
  }

  return {
    field,
    expected: stringValue(expected),
    actual: stringValue(actual),
    status: "mismatch",
    required,
    message: options.mismatchMessage ?? `Page ${field} does not match.`,
  };
}

function createInstrumentPageResult(status, expectedInstrument, options = {}) {
  const labelsByStatus = {
    unavailable: ["Instrument page unavailable"],
    verification_not_ready: ["Instrument verification not ready"],
    page_not_open: ["Instrument page not open"],
    page_identified: ["Instrument page identified"],
    page_mismatch: ["Instrument page mismatch"],
    prohibited_order_controls_detected: ["Prohibited order controls visible"],
    blocked: ["Instrument page blocked"],
    failed: ["Instrument page failed"],
  };

  return {
    ok: status === "page_identified",
    status,
    checkedAt: options.checkedAt ?? now(),
    expectedInstrument: {
      ticker: stringValue(expectedInstrument?.ticker) ?? "",
      ...(stringValue(expectedInstrument?.name)
        ? { name: stringValue(expectedInstrument.name) }
        : {}),
      ...(stringValue(expectedInstrument?.market)
        ? { market: stringValue(expectedInstrument.market) }
        : {}),
      ...(stringValue(expectedInstrument?.currency)
        ? { currency: stringValue(expectedInstrument.currency) }
        : {}),
      ...(stringValue(expectedInstrument?.instrumentType)
        ? { instrumentType: stringValue(expectedInstrument.instrumentType) }
        : {}),
    },
    ...(options.pageIdentity ? { pageIdentity: options.pageIdentity } : {}),
    fieldChecks: options.fieldChecks ?? [],
    riskFlags: [...new Set(options.riskFlags ?? [])],
    blockers: [...new Set(options.blockers ?? [])],
    warnings: [...new Set(options.warnings ?? [])],
    errors: [...new Set(options.errors ?? [])],
    labels: [
      ...new Set([
        "Instrument page identity only",
        "No order page",
        "No buy/sell click",
        "No form fill",
        "No broker submission",
        "No trade mutation",
        ...(labelsByStatus[status] ?? []),
        ...(options.labels ?? []),
      ]),
    ],
    metadata: {
      ...(options.metadata ?? {}),
      contractVersion: AVANZA_INSTRUMENT_PAGE_CONTRACT_VERSION,
      instrumentPageIdentityOnly: true,
      noOrderPage: true,
      noBuySellClick: true,
      noFormFill: true,
      noBrokerSubmission: true,
      noTradeMutation: true,
      noBrokerResult: true,
    },
  };
}

function createInstrumentPageIdentity(expectedInstrument, options = {}) {
  return {
    ticker: stringValue(options.ticker) ?? stringValue(expectedInstrument?.ticker) ?? "",
    ...(stringValue(options.name) ?? stringValue(expectedInstrument?.name)
      ? { name: stringValue(options.name) ?? stringValue(expectedInstrument.name) }
      : {}),
    ...(stringValue(options.market) ?? stringValue(expectedInstrument?.market)
      ? {
          market:
            stringValue(options.market) ?? stringValue(expectedInstrument.market),
        }
      : {}),
    ...(stringValue(options.currency) ?? stringValue(expectedInstrument?.currency)
      ? {
          currency:
            stringValue(options.currency) ??
            stringValue(expectedInstrument.currency),
        }
      : {}),
    ...(stringValue(options.instrumentType) ??
    stringValue(expectedInstrument?.instrumentType)
      ? {
          instrumentType:
            stringValue(options.instrumentType) ??
            stringValue(expectedInstrument.instrumentType),
        }
      : {}),
    sanitizedTitle:
      stringValue(options.sanitizedTitle) ??
      `${stringValue(options.name) ?? stringValue(expectedInstrument?.name) ?? stringValue(expectedInstrument?.ticker) ?? "Instrument"} - synthetic instrument page`,
    sanitizedHostClass: stringValue(options.sanitizedHostClass) ?? "avanza",
    pageContext: stringValue(options.pageContext) ?? "instrument_page",
    matchConfidence:
      typeof options.matchConfidence === "number" &&
      Number.isFinite(options.matchConfidence)
        ? Math.min(1, Math.max(0, options.matchConfidence))
        : 0.98,
    ...(isObject(options.prohibitedControls)
      ? { prohibitedControls: options.prohibitedControls }
      : {}),
    ...(isObject(options.sensitiveSignals)
      ? { sensitiveSignals: options.sensitiveSignals }
      : {}),
    metadata: {
      synthetic_stub: true,
      no_browser_inspection: true,
    },
  };
}

function evaluateInstrumentPageStub(
  expectedInstrument,
  instrumentVerificationResult,
  pageIdentity,
  checkedAt,
  options = {},
) {
  if (
    !isObject(instrumentVerificationResult) ||
    instrumentVerificationResult.ok !== true ||
    instrumentVerificationResult.status !== "verified"
  ) {
    const blocker =
      stringValue(instrumentVerificationResult?.blockers?.[0]) ??
      stringValue(instrumentVerificationResult?.errors?.[0]) ??
      `Instrument verification must be verified before page identity checks; received ${
        stringValue(instrumentVerificationResult?.status) ?? "missing"
      }.`;

    return createInstrumentPageResult("verification_not_ready", expectedInstrument, {
      checkedAt,
      blockers: [blocker],
      errors: [blocker],
      riskFlags: ["verification_not_verified"],
    });
  }

  if (!isObject(pageIdentity)) {
    return createInstrumentPageResult("page_not_open", expectedInstrument, {
      checkedAt,
      blockers: [
        "Sanitized instrument page identity is required before page checks.",
      ],
      warnings: ["No browser page was opened or inspected by this stub."],
    });
  }

  const riskFlags = [];
  const blockers = [];
  const warnings = [];
  const errors = [];

  if (
    pageIdentity.pageContext === "order_page" ||
    pageIdentity.pageContext === "confirmation_modal"
  ) {
    riskFlags.push("order_page_detected");
    blockers.push("Order page context detected during instrument-page identity check.");
  }

  if (pageIdentity.prohibitedControls?.orderFormVisible) {
    riskFlags.push("order_form_detected");
    blockers.push("Order form detected during instrument-page identity check.");
  }

  if (pageIdentity.prohibitedControls?.finalConfirmVisible) {
    riskFlags.push("final_confirm_detected");
    blockers.push(
      "Final-confirm-like control detected during instrument-page identity check.",
    );
  }

  if (pageIdentity.sensitiveSignals?.accountDataDetected) {
    riskFlags.push("account_data_detected");
    blockers.push("Account data detected during instrument-page identity check.");
  }

  if (pageIdentity.sensitiveSignals?.balanceDataDetected) {
    riskFlags.push("balance_data_detected");
    blockers.push("Balance data detected during instrument-page identity check.");
  }

  if (pageIdentity.sensitiveSignals?.holdingsDataDetected) {
    riskFlags.push("holdings_data_detected");
    blockers.push("Holdings data detected during instrument-page identity check.");
  }

  if (pageIdentity.sensitiveSignals?.sensitiveDataDetected) {
    riskFlags.push("sensitive_data_detected");
    blockers.push("Sensitive data detected during instrument-page identity check.");
  }

  if (blockers.length > 0) {
    return createInstrumentPageResult("blocked", expectedInstrument, {
      checkedAt,
      pageIdentity,
      blockers,
      errors: blockers,
      riskFlags,
    });
  }

  const requiredByField = {
    ticker: true,
    name: Boolean(stringValue(expectedInstrument?.name)),
    market: Boolean(stringValue(expectedInstrument?.market)),
    currency: Boolean(stringValue(expectedInstrument?.currency)),
    instrumentType: Boolean(stringValue(expectedInstrument?.instrumentType)),
  };
  const riskByMismatch = {
    ticker: "ticker_mismatch",
    name: "name_mismatch",
    market: "market_mismatch",
    currency: "currency_mismatch",
    instrumentType: "instrument_type_mismatch",
  };
  const riskByMissing = {
    ticker: "missing_page_ticker",
    name: "missing_page_name",
    market: "missing_page_market",
    currency: "missing_page_currency",
    instrumentType: "missing_page_instrument_type",
  };
  const fieldChecks = [
    createInstrumentPageFieldCheck(
      "ticker",
      expectedInstrument.ticker,
      pageIdentity.ticker,
      requiredByField.ticker,
      {
        mismatchMessage: "Page ticker does not match expected ticker.",
        missingPageMessage: "Page ticker is missing.",
      },
    ),
    createInstrumentPageFieldCheck(
      "name",
      expectedInstrument.name,
      pageIdentity.name,
      requiredByField.name,
      {
        mismatchMessage: "Page name does not match expected instrument name.",
        missingPageMessage: "Page name is missing.",
      },
    ),
    createInstrumentPageFieldCheck(
      "market",
      expectedInstrument.market,
      pageIdentity.market,
      requiredByField.market,
      {
        mismatchMessage: "Page market does not match expected market.",
        missingPageMessage: "Page market is missing.",
      },
    ),
    createInstrumentPageFieldCheck(
      "currency",
      expectedInstrument.currency,
      pageIdentity.currency,
      requiredByField.currency,
      {
        mismatchMessage: "Page currency does not match expected currency.",
        missingPageMessage: "Page currency is missing.",
      },
    ),
    createInstrumentPageFieldCheck(
      "instrumentType",
      expectedInstrument.instrumentType,
      pageIdentity.instrumentType,
      requiredByField.instrumentType,
      {
        mismatchMessage:
          "Page instrument type does not match expected instrument type.",
        missingPageMessage: "Page instrument type is missing.",
      },
    ),
  ];

  for (const check of fieldChecks) {
    if (check.status === "mismatch") {
      riskFlags.push(riskByMismatch[check.field]);
      if (check.required) {
        blockers.push(check.message);
        errors.push(check.message);
      } else {
        warnings.push(check.message);
      }
    }

    if (check.status === "missing_page") {
      riskFlags.push(riskByMissing[check.field]);
      if (check.required) {
        blockers.push(check.message);
        errors.push(check.message);
      } else {
        warnings.push(check.message);
      }
    }
  }

  if (pageIdentity.prohibitedControls?.buyButtonVisible) {
    riskFlags.push("prohibited_buy_button_visible");
    warnings.push("Buy button visible as a prohibited guarded control.");
  }

  if (pageIdentity.prohibitedControls?.sellButtonVisible) {
    riskFlags.push("prohibited_sell_button_visible");
    warnings.push("Sell button visible as a prohibited guarded control.");
  }

  if (options.allowProhibitedControlVisibility === false) {
    if (pageIdentity.prohibitedControls?.buyButtonVisible) {
      blockers.push("Buy button visibility is not allowed in this check.");
      errors.push("Buy button visibility is not allowed in this check.");
    }
    if (pageIdentity.prohibitedControls?.sellButtonVisible) {
      blockers.push("Sell button visibility is not allowed in this check.");
      errors.push("Sell button visibility is not allowed in this check.");
    }
  }

  if (blockers.length > 0) {
    return createInstrumentPageResult(
      riskFlags.some((flag) => String(flag).includes("mismatch") || String(flag).startsWith("missing_page_"))
        ? "page_mismatch"
        : "prohibited_order_controls_detected",
      expectedInstrument,
      {
        checkedAt,
        pageIdentity,
        fieldChecks,
        riskFlags,
        blockers,
        warnings,
        errors,
      },
    );
  }

  return createInstrumentPageResult("page_identified", expectedInstrument, {
    checkedAt,
    pageIdentity,
    fieldChecks,
    riskFlags,
    warnings,
  });
}

function validateInstrumentPagePayload(payload) {
  const errors = [];

  if (!isObject(payload)) {
    return ["Instrument page payload must be a JSON object."];
  }

  if (payload.version !== CONTRACT_VERSION) {
    errors.push(`Instrument page request version must be ${CONTRACT_VERSION}.`);
  }

  if (!stringValue(payload.requestId)) {
    errors.push("Instrument page request requestId is missing.");
  }

  if (!stringValue(payload.createdAt) || !Number.isFinite(Date.parse(payload.createdAt))) {
    errors.push("Instrument page request createdAt must be a valid timestamp.");
  }

  if (!isObject(payload.expectedInstrument)) {
    errors.push("Instrument page request expectedInstrument is missing.");
  } else if (!stringValue(payload.expectedInstrument.ticker)) {
    errors.push("Instrument page request expectedInstrument.ticker is required.");
  }

  if (
    typeof payload.pageIdentity !== "undefined" &&
    !isObject(payload.pageIdentity)
  ) {
    errors.push("Instrument page request pageIdentity must be an object when provided.");
  }

  if (hasUnsafeDryRunMetadata(payload.metadata)) {
    errors.push(
      "Instrument page request metadata contains unsafe submit or broker automation flags.",
    );
  }

  return errors;
}

function buildInstrumentPageResponse(payload) {
  const receivedAt = now();
  const checkedAt = receivedAt;
  const requestId = stringValue(payload?.requestId) ?? "unknown_instrument_page_request";
  const errors = validateInstrumentPagePayload(payload);
  const expectedInstrument =
    isObject(payload?.expectedInstrument) &&
    stringValue(payload.expectedInstrument.ticker)
      ? payload.expectedInstrument
      : { ticker: "UNKNOWN" };
  const mode =
    stringValue(process.env.AVANZA_LOCALHOST_BRIDGE_INSTRUMENT_PAGE_MODE) ??
    "unavailable";
  const supportedModes = new Set([
    "unavailable",
    "page_identified",
    "page_identified_with_buy_sell_visible",
    "page_mismatch_ticker",
    "page_mismatch_currency",
    "page_mismatch_missing_field",
    "prohibited_controls",
    "blocked_order_page",
    "blocked_order_form",
    "blocked_final_confirm",
    "blocked_sensitive",
    "verification_not_ready",
    "page_not_open",
  ]);
  const normalizedMode = supportedModes.has(mode) ? mode : "unavailable";
  const baseCandidate = createSearchOnlyCandidate(expectedInstrument);
  let instrumentVerificationResult = payload?.instrumentVerificationResult;
  let pageIdentity = payload?.pageIdentity;
  let instrumentPage;

  if (errors.length > 0) {
    instrumentPage = createInstrumentPageResult("failed", expectedInstrument, {
      checkedAt,
      blockers: errors,
      errors,
    });
  } else if (normalizedMode === "unavailable") {
    instrumentPage = createInstrumentPageResult("unavailable", expectedInstrument, {
      checkedAt,
      blockers: ["Instrument page runner is not implemented."],
      errors: ["Instrument page runner is not implemented."],
    });
  } else {
    if (!isObject(instrumentVerificationResult)) {
      instrumentVerificationResult =
        normalizedMode === "verification_not_ready"
          ? createInstrumentVerificationResult("search_not_ready", expectedInstrument, {
              checkedAt,
              blockers: ["Instrument verification is not ready for page checks."],
              errors: ["Instrument verification is not ready for page checks."],
            })
          : createInstrumentVerificationResult("verified", expectedInstrument, {
              checkedAt,
              selectedCandidate: baseCandidate,
              fieldChecks: [],
            });
    }

    if (normalizedMode === "page_not_open" || normalizedMode === "verification_not_ready") {
      pageIdentity = undefined;
    } else if (normalizedMode === "page_identified") {
      pageIdentity = createInstrumentPageIdentity(expectedInstrument);
    } else if (normalizedMode === "page_identified_with_buy_sell_visible") {
      pageIdentity = createInstrumentPageIdentity(expectedInstrument, {
        prohibitedControls: {
          buyButtonVisible: true,
          sellButtonVisible: true,
        },
      });
    } else if (normalizedMode === "page_mismatch_ticker") {
      pageIdentity = createInstrumentPageIdentity(expectedInstrument, {
        ticker: "NO.MATCH",
      });
    } else if (normalizedMode === "page_mismatch_currency") {
      pageIdentity = createInstrumentPageIdentity(expectedInstrument, {
        currency: "NOK",
      });
    } else if (normalizedMode === "page_mismatch_missing_field") {
      pageIdentity = createInstrumentPageIdentity(expectedInstrument);
      delete pageIdentity.currency;
    } else if (normalizedMode === "prohibited_controls") {
      pageIdentity = createInstrumentPageIdentity(expectedInstrument, {
        prohibitedControls: {
          buyButtonVisible: true,
          sellButtonVisible: true,
        },
      });
    } else if (normalizedMode === "blocked_order_page") {
      pageIdentity = createInstrumentPageIdentity(expectedInstrument, {
        pageContext: "order_page",
      });
    } else if (normalizedMode === "blocked_order_form") {
      pageIdentity = createInstrumentPageIdentity(expectedInstrument, {
        prohibitedControls: { orderFormVisible: true },
      });
    } else if (normalizedMode === "blocked_final_confirm") {
      pageIdentity = createInstrumentPageIdentity(expectedInstrument, {
        prohibitedControls: { finalConfirmVisible: true },
      });
    } else if (normalizedMode === "blocked_sensitive") {
      pageIdentity = createInstrumentPageIdentity(expectedInstrument, {
        sensitiveSignals: {
          accountDataDetected: true,
          balanceDataDetected: true,
          holdingsDataDetected: true,
          sensitiveDataDetected: true,
        },
      });
    }

    instrumentPage = evaluateInstrumentPageStub(
      expectedInstrument,
      instrumentVerificationResult,
      pageIdentity,
      checkedAt,
      {
        allowProhibitedControlVisibility:
          normalizedMode !== "prohibited_controls",
      },
    );
  }

  const statusCode =
    errors.length > 0 || instrumentPage.status === "blocked"
      ? 400
      : instrumentPage.status === "unavailable" ||
          instrumentPage.status === "page_not_open" ||
          instrumentPage.status === "verification_not_ready"
        ? 501
        : 200;
  const baseWarnings = [
    "Instrument page runner is not implemented.",
    "No browser actions were executed.",
    "No Avanza page was touched.",
    "No order page was opened.",
    "No buy/sell click occurred.",
    "No form fill occurred.",
  ];

  return {
    statusCode,
    body: {
      version: CONTRACT_VERSION,
      ok: instrumentPage.ok,
      bridgeVersion: CONTRACT_VERSION,
      requestId,
      receivedAt,
      completedAt: now(),
      instrumentPage,
      message:
        instrumentPage.status === "page_identified"
          ? "Localhost bridge instrument-page stub returned a synthetic page identity result. No browser was controlled."
          : "Localhost bridge instrument-page stub completed safely. No browser was controlled.",
      errors: [...errors, ...instrumentPage.errors],
      warnings: [...new Set([...baseWarnings, ...instrumentPage.warnings])],
      metadata: {
        ...(isObject(payload?.metadata) ? payload.metadata : {}),
        localhost_bridge_stub: true,
        instrument_page_endpoint_stub: true,
        instrument_page_mode: normalizedMode,
        no_browser_control: true,
        no_browser_actions_executed: true,
        no_avanza_page_touched: true,
        no_avanza_urls: true,
        no_avanza_selectors: true,
        no_order_page_opened: true,
        no_buy_sell_click: true,
        no_form_fill: true,
        no_broker_submission: true,
        no_broker_result_created: true,
        no_trade_mutation: true,
      },
    },
  };
}

function createOrderPageOpenResult(status, dryRunOrderInput, options = {}) {
  const expectedInstrument = isObject(dryRunOrderInput?.instrument)
    ? dryRunOrderInput.instrument
    : { ticker: "UNKNOWN" };
  const labelsByStatus = {
    unavailable: ["Order page open unavailable"],
    instrument_page_not_ready: ["Instrument page not ready"],
    action_not_supported: ["Order page action not supported"],
    order_page_opened: ["Order page opened"],
    order_page_mismatch: ["Order page mismatch"],
    wrong_action_opened: ["Wrong action opened"],
    prohibited_form_interaction_detected: [
      "Prohibited form interaction detected",
    ],
    blocked: ["Order page open blocked"],
    failed: ["Order page open failed"],
  };

  return {
    ok: status === "order_page_opened",
    status,
    checkedAt: options.checkedAt ?? now(),
    ...(dryRunOrderInput?.action === "buy" || dryRunOrderInput?.action === "sell"
      ? { expectedAction: dryRunOrderInput.action }
      : {}),
    expectedInstrument: {
      ticker: stringValue(expectedInstrument?.ticker) ?? "",
      ...(stringValue(expectedInstrument?.name)
        ? { name: stringValue(expectedInstrument.name) }
        : {}),
      ...(stringValue(expectedInstrument?.market)
        ? { market: stringValue(expectedInstrument.market) }
        : {}),
      ...(stringValue(expectedInstrument?.currency)
        ? { currency: stringValue(expectedInstrument.currency) }
        : {}),
      ...(stringValue(expectedInstrument?.instrumentType)
        ? { instrumentType: stringValue(expectedInstrument.instrumentType) }
        : {}),
    },
    ...(options.orderPageIdentity
      ? { orderPageIdentity: options.orderPageIdentity }
      : {}),
    fieldChecks: options.fieldChecks ?? [],
    riskFlags: [...new Set(options.riskFlags ?? [])],
    blockers: [...new Set(options.blockers ?? [])],
    warnings: [...new Set(options.warnings ?? [])],
    errors: [...new Set(options.errors ?? [])],
    labels: [
      ...new Set([
        "Order page open only",
        "No form fill",
        "No Granska click",
        "No Bekräfta click",
        "No broker submission",
        "No trade mutation",
        ...(labelsByStatus[status] ?? []),
        ...(options.labels ?? []),
      ]),
    ],
    metadata: {
      ...(options.metadata ?? {}),
      contractVersion: AVANZA_ORDER_PAGE_OPEN_CONTRACT_VERSION,
      orderPageOpenOnly: true,
      noFormFill: true,
      noReviewClick: true,
      noFinalConfirmClick: true,
      noBrokerSubmission: true,
      noTradeMutation: true,
      noBrokerResult: true,
    },
  };
}

function createOrderPageIdentity(dryRunOrderInput, options = {}) {
  const instrument = isObject(dryRunOrderInput?.instrument)
    ? dryRunOrderInput.instrument
    : { ticker: "UNKNOWN" };

  return {
    action:
      stringValue(options.action) ??
      (dryRunOrderInput?.action === "buy" || dryRunOrderInput?.action === "sell"
        ? dryRunOrderInput.action
        : "unknown"),
    ticker: stringValue(options.ticker) ?? stringValue(instrument.ticker) ?? "",
    ...(stringValue(options.name) ?? stringValue(instrument.name)
      ? { name: stringValue(options.name) ?? stringValue(instrument.name) }
      : {}),
    ...(stringValue(options.market) ?? stringValue(instrument.market)
      ? {
          market:
            stringValue(options.market) ?? stringValue(instrument.market),
        }
      : {}),
    ...(stringValue(options.currency) ?? stringValue(instrument.currency)
      ? {
          currency:
            stringValue(options.currency) ?? stringValue(instrument.currency),
        }
      : {}),
    ...(stringValue(options.instrumentType) ?? stringValue(instrument.instrumentType)
      ? {
          instrumentType:
            stringValue(options.instrumentType) ??
            stringValue(instrument.instrumentType),
        }
      : {}),
    pageContext: stringValue(options.pageContext) ?? "order_page",
    sanitizedTitle:
      stringValue(options.sanitizedTitle) ??
      `${stringValue(instrument.name) ?? stringValue(instrument.ticker) ?? "Instrument"} synthetic order page`,
    sanitizedHostClass: stringValue(options.sanitizedHostClass) ?? "avanza",
    controls: isObject(options.controls)
      ? options.controls
      : {
          reviewButtonVisible: true,
          finalConfirmVisible: false,
        },
    formSignals: isObject(options.formSignals)
      ? options.formSignals
      : {
          quantityFieldVisible: true,
          priceFieldVisible: true,
          accountFieldVisible: true,
          anyFieldPrefilled: false,
        },
    ...(isObject(options.sensitiveSignals)
      ? { sensitiveSignals: options.sensitiveSignals }
      : {
          sensitiveSignals: {
            accountDataDetected: false,
            balanceDataDetected: false,
            holdingsDataDetected: false,
            sensitiveDataDetected: false,
          },
        }),
    metadata: {
      synthetic_stub: true,
      no_browser_inspection: true,
    },
  };
}

function createOrderPageFieldCheck(field, expected, actual, required, options = {}) {
  if (!stringValue(expected)) {
    return {
      field,
      actual: stringValue(actual),
      status: "missing_expected",
      required: false,
      message:
        options.missingExpectedMessage ??
        `Expected ${field} is missing; order page identity confidence is lower.`,
    };
  }

  if (!stringValue(actual)) {
    return {
      field,
      expected: stringValue(expected),
      status: "missing_page",
      required,
      message: options.missingPageMessage ?? `Order page ${field} is missing.`,
    };
  }

  if (normalizeSearchText(expected) === normalizeSearchText(actual)) {
    return {
      field,
      expected: stringValue(expected),
      actual: stringValue(actual),
      status: "match",
      required,
    };
  }

  return {
    field,
    expected: stringValue(expected),
    actual: stringValue(actual),
    status: "mismatch",
    required,
    message:
      options.mismatchMessage ?? `Order page ${field} does not match.`,
  };
}

function evaluateOrderPageOpenStub(
  dryRunOrderInput,
  instrumentPageResult,
  orderPageIdentity,
  attemptedAction,
  checkedAt,
  metadata = {},
) {
  if (
    !isObject(instrumentPageResult) ||
    instrumentPageResult.ok !== true ||
    instrumentPageResult.status !== "page_identified"
  ) {
    const blocker =
      stringValue(instrumentPageResult?.blockers?.[0]) ??
      stringValue(instrumentPageResult?.errors?.[0]) ??
      `Instrument page must be page_identified before opening an order page; received ${
        stringValue(instrumentPageResult?.status) ?? "missing"
      }.`;

    return createOrderPageOpenResult(
      "instrument_page_not_ready",
      dryRunOrderInput,
      {
        checkedAt,
        blockers: [blocker],
        errors: [blocker],
        riskFlags: ["instrument_page_not_identified"],
      },
    );
  }

  if (dryRunOrderInput?.action !== "buy" && dryRunOrderInput?.action !== "sell") {
    const blocker = "Order-page-open action must be buy or sell.";

    return createOrderPageOpenResult("action_not_supported", dryRunOrderInput, {
      checkedAt,
      blockers: [blocker],
      errors: [blocker],
      riskFlags: ["unsupported_action"],
    });
  }

  const earlyRiskFlags = [];
  const earlyBlockers = [];

  if (attemptedAction && attemptedAction !== dryRunOrderInput.action) {
    earlyRiskFlags.push("action_mismatch", "order_page_wrong_action");
    earlyBlockers.push(
      `Attempted action ${attemptedAction} does not match expected ${dryRunOrderInput.action}.`,
    );
  }

  if (metadata.reviewButtonClickedOrAttempted === true) {
    earlyRiskFlags.push("review_button_clicked_or_attempted");
    earlyBlockers.push("Review/Granska click was attempted.");
  }

  if (metadata.finalConfirmClickedOrAttempted === true) {
    earlyRiskFlags.push("final_confirm_clicked_or_attempted");
    earlyBlockers.push("Final-confirm/Bekrafta click was attempted.");
  }

  if (metadata.keyboardSubmitDetected === true) {
    earlyRiskFlags.push("keyboard_submit_detected");
    earlyBlockers.push("Keyboard submit was detected.");
  }

  if (earlyBlockers.length > 0) {
    return createOrderPageOpenResult(
      earlyRiskFlags.includes("order_page_wrong_action")
        ? "wrong_action_opened"
        : "blocked",
      dryRunOrderInput,
      {
        checkedAt,
        blockers: earlyBlockers,
        errors: earlyBlockers,
        riskFlags: earlyRiskFlags,
      },
    );
  }

  if (!isObject(orderPageIdentity)) {
    const blocker = "Sanitized order page identity is required.";

    return createOrderPageOpenResult("unavailable", dryRunOrderInput, {
      checkedAt,
      blockers: [blocker],
      errors: [blocker],
      warnings: ["No browser page was opened or inspected by this stub."],
    });
  }

  const riskFlags = [];
  const blockers = [];
  const warnings = [];
  const errors = [];

  if (orderPageIdentity.pageContext === "confirmation_modal") {
    riskFlags.push("final_confirm_detected");
    blockers.push("Confirmation modal detected during order-page-open check.");
  }

  if (orderPageIdentity.controls?.finalConfirmVisible) {
    riskFlags.push("final_confirm_detected");
    blockers.push("Final-confirm-like control detected on order page.");
  }

  for (const [key, risk, message] of [
    ["accountDataDetected", "account_data_detected", "Account data detected during order-page-open check."],
    ["balanceDataDetected", "balance_data_detected", "Balance data detected during order-page-open check."],
    ["holdingsDataDetected", "holdings_data_detected", "Holdings data detected during order-page-open check."],
    ["sensitiveDataDetected", "sensitive_data_detected", "Sensitive data detected during order-page-open check."],
  ]) {
    if (orderPageIdentity.sensitiveSignals?.[key]) {
      riskFlags.push(risk);
      blockers.push(message);
    }
  }

  if (blockers.length > 0) {
    return createOrderPageOpenResult("blocked", dryRunOrderInput, {
      checkedAt,
      orderPageIdentity,
      blockers,
      errors: blockers,
      riskFlags,
    });
  }

  if (orderPageIdentity.pageContext !== "order_page") {
    const blocker = "Order page context is missing or unknown.";

    return createOrderPageOpenResult("order_page_mismatch", dryRunOrderInput, {
      checkedAt,
      orderPageIdentity,
      blockers: [blocker],
      errors: [blocker],
      riskFlags: ["missing_order_page_instrument"],
    });
  }

  const instrument = dryRunOrderInput.instrument ?? {};
  const requiredByField = {
    action: true,
    ticker: true,
    name: Boolean(stringValue(instrument.name)),
    market: Boolean(stringValue(instrument.market)),
    currency: Boolean(stringValue(instrument.currency)),
    instrumentType: Boolean(stringValue(instrument.instrumentType)),
  };
  const fieldChecks = [
    createOrderPageFieldCheck(
      "action",
      dryRunOrderInput.action,
      orderPageIdentity.action,
      requiredByField.action,
      {
        mismatchMessage: "Order page action does not match expected action.",
        missingPageMessage: "Order page action is missing.",
      },
    ),
    createOrderPageFieldCheck(
      "ticker",
      instrument.ticker,
      orderPageIdentity.ticker,
      requiredByField.ticker,
      {
        mismatchMessage: "Order page ticker does not match expected ticker.",
        missingPageMessage: "Order page ticker is missing.",
      },
    ),
    createOrderPageFieldCheck(
      "name",
      instrument.name,
      orderPageIdentity.name,
      requiredByField.name,
      {
        mismatchMessage:
          "Order page name does not match expected instrument name.",
        missingPageMessage: "Order page name is missing.",
      },
    ),
    createOrderPageFieldCheck(
      "market",
      instrument.market,
      orderPageIdentity.market,
      requiredByField.market,
      {
        mismatchMessage: "Order page market does not match expected market.",
        missingPageMessage: "Order page market is missing.",
      },
    ),
    createOrderPageFieldCheck(
      "currency",
      instrument.currency,
      orderPageIdentity.currency,
      requiredByField.currency,
      {
        mismatchMessage: "Order page currency does not match expected currency.",
        missingPageMessage: "Order page currency is missing.",
      },
    ),
    createOrderPageFieldCheck(
      "instrumentType",
      instrument.instrumentType,
      orderPageIdentity.instrumentType,
      requiredByField.instrumentType,
      {
        mismatchMessage:
          "Order page instrument type does not match expected instrument type.",
        missingPageMessage: "Order page instrument type is missing.",
      },
    ),
  ];

  for (const check of fieldChecks) {
    if (check.status === "mismatch") {
      riskFlags.push(
        check.field === "action"
          ? "order_page_wrong_action"
          : "order_page_wrong_instrument",
      );
      if (check.required) {
        blockers.push(check.message);
        errors.push(check.message);
      } else {
        warnings.push(check.message);
      }
    }

    if (check.status === "missing_page") {
      riskFlags.push(
        check.field === "action"
          ? "missing_order_page_action"
          : "missing_order_page_instrument",
      );
      if (check.required) {
        blockers.push(check.message);
        errors.push(check.message);
      } else {
        warnings.push(check.message);
      }
    }

    if (check.status === "missing_expected") {
      warnings.push(check.message);
    }
  }

  if (orderPageIdentity.controls?.reviewButtonVisible) {
    riskFlags.push("review_button_visible");
    warnings.push("Review/Granska button visible; no click allowed.");
  }

  if (orderPageIdentity.formSignals?.anyFieldPrefilled) {
    riskFlags.push("order_form_prefilled");
    blockers.push("Order form was prefilled before approved form-fill phase.");
    errors.push("Order form was prefilled before approved form-fill phase.");
  }

  if (blockers.length > 0) {
    const status = riskFlags.includes("order_page_wrong_action")
      ? "wrong_action_opened"
      : riskFlags.includes("order_page_wrong_instrument") ||
          riskFlags.includes("missing_order_page_instrument") ||
          riskFlags.includes("missing_order_page_action")
        ? "order_page_mismatch"
        : riskFlags.includes("order_form_prefilled") ||
            riskFlags.includes("review_button_visible")
          ? "prohibited_form_interaction_detected"
          : "order_page_mismatch";

    return createOrderPageOpenResult(status, dryRunOrderInput, {
      checkedAt,
      orderPageIdentity,
      fieldChecks,
      riskFlags,
      blockers,
      warnings,
      errors,
    });
  }

  return createOrderPageOpenResult("order_page_opened", dryRunOrderInput, {
    checkedAt,
    orderPageIdentity,
    fieldChecks,
    riskFlags,
    warnings,
  });
}

function validateOrderPageOpenPayload(payload) {
  const errors = [];

  if (!isObject(payload)) {
    return ["Order-page-open payload must be a JSON object."];
  }

  if (payload.version !== CONTRACT_VERSION) {
    errors.push(`Order-page-open request version must be ${CONTRACT_VERSION}.`);
  }

  if (!stringValue(payload.requestId)) {
    errors.push("Order-page-open request requestId is missing.");
  }

  if (!stringValue(payload.createdAt) || !Number.isFinite(Date.parse(payload.createdAt))) {
    errors.push("Order-page-open request createdAt must be a valid timestamp.");
  }

  const dryRunValidation = validateAvanzaDryRunOrderInput(
    payload.dryRunOrderInput,
  );
  errors.push(...dryRunValidation.errors);

  if (
    typeof payload.orderPageIdentity !== "undefined" &&
    !isObject(payload.orderPageIdentity)
  ) {
    errors.push("Order-page-open request orderPageIdentity must be an object when provided.");
  }

  if (
    typeof payload.attemptedAction !== "undefined" &&
    payload.attemptedAction !== "buy" &&
    payload.attemptedAction !== "sell"
  ) {
    errors.push("Order-page-open request attemptedAction must be buy or sell when provided.");
  }

  if (hasUnsafeDryRunMetadata(payload.metadata)) {
    errors.push(
      "Order-page-open request metadata contains unsafe submit or broker automation flags.",
    );
  }

  return errors;
}

function buildOrderPageOpenResponse(payload) {
  const receivedAt = now();
  const checkedAt = receivedAt;
  const requestId = stringValue(payload?.requestId) ?? "unknown_order_page_open_request";
  const errors = validateOrderPageOpenPayload(payload);
  const dryRunValidation = validateAvanzaDryRunOrderInput(
    payload?.dryRunOrderInput,
  );
  const dryRunOrderInput = dryRunValidation.normalized ?? {
    action: "buy",
    instrument: { ticker: "UNKNOWN" },
    quantity: 1,
    price: 1,
    orderMode: "advanced",
    accountPolicy: "require_manual_review",
    stopPolicy: "stop_at_confirmation_modal",
    createdAt: checkedAt,
  };
  const mode =
    stringValue(process.env.AVANZA_LOCALHOST_BRIDGE_ORDER_PAGE_OPEN_MODE) ??
    "unavailable";
  const supportedModes = new Set([
    "unavailable",
    "order_page_opened_buy",
    "order_page_opened_sell",
    "wrong_action_opened",
    "order_page_mismatch_ticker",
    "order_page_mismatch_currency",
    "prohibited_form_prefilled",
    "blocked_final_confirm",
    "blocked_review_click_attempt",
    "blocked_keyboard_submit",
    "blocked_sensitive",
    "instrument_page_not_ready",
    "missing_order_page_identity",
  ]);
  const normalizedMode = supportedModes.has(mode) ? mode : "unavailable";
  const instrumentPageResult =
    normalizedMode === "instrument_page_not_ready"
      ? createInstrumentPageResult("page_not_open", dryRunOrderInput.instrument, {
          checkedAt,
          blockers: ["Instrument page is not identified for order-page-open."],
          errors: ["Instrument page is not identified for order-page-open."],
        })
      : isObject(payload?.instrumentPageResult)
        ? payload.instrumentPageResult
        : createInstrumentPageResult("page_identified", dryRunOrderInput.instrument, {
            checkedAt,
            pageIdentity: createInstrumentPageIdentity(dryRunOrderInput.instrument),
            fieldChecks: [],
          });
  let orderPageIdentity = payload?.orderPageIdentity;
  let attemptedAction = payload?.attemptedAction;
  const metadata = isObject(payload?.metadata) ? { ...payload.metadata } : {};
  let orderPageOpen;

  if (errors.length > 0) {
    orderPageOpen = createOrderPageOpenResult("failed", dryRunOrderInput, {
      checkedAt,
      blockers: errors,
      errors,
    });
  } else if (normalizedMode === "unavailable") {
    orderPageOpen = createOrderPageOpenResult("unavailable", dryRunOrderInput, {
      checkedAt,
      blockers: ["Order-page-open runner is not implemented."],
      errors: ["Order-page-open runner is not implemented."],
    });
  } else {
    if (normalizedMode === "order_page_opened_buy") {
      dryRunOrderInput.action = "buy";
      orderPageIdentity = createOrderPageIdentity(dryRunOrderInput, {
        action: "buy",
      });
      attemptedAction = "buy";
    } else if (normalizedMode === "order_page_opened_sell") {
      dryRunOrderInput.action = "sell";
      orderPageIdentity = createOrderPageIdentity(dryRunOrderInput, {
        action: "sell",
      });
      attemptedAction = "sell";
    } else if (normalizedMode === "wrong_action_opened") {
      dryRunOrderInput.action = "buy";
      orderPageIdentity = createOrderPageIdentity(dryRunOrderInput, {
        action: "sell",
      });
      attemptedAction = "buy";
    } else if (normalizedMode === "order_page_mismatch_ticker") {
      orderPageIdentity = createOrderPageIdentity(dryRunOrderInput, {
        ticker: "NO.MATCH",
      });
    } else if (normalizedMode === "order_page_mismatch_currency") {
      orderPageIdentity = createOrderPageIdentity(dryRunOrderInput, {
        currency: "NOK",
      });
    } else if (normalizedMode === "prohibited_form_prefilled") {
      orderPageIdentity = createOrderPageIdentity(dryRunOrderInput, {
        formSignals: {
          quantityFieldVisible: true,
          priceFieldVisible: true,
          accountFieldVisible: true,
          anyFieldPrefilled: true,
        },
      });
    } else if (normalizedMode === "blocked_final_confirm") {
      orderPageIdentity = createOrderPageIdentity(dryRunOrderInput, {
        controls: {
          reviewButtonVisible: true,
          finalConfirmVisible: true,
        },
      });
    } else if (normalizedMode === "blocked_review_click_attempt") {
      orderPageIdentity = createOrderPageIdentity(dryRunOrderInput);
      metadata.reviewButtonClickedOrAttempted = true;
    } else if (normalizedMode === "blocked_keyboard_submit") {
      orderPageIdentity = createOrderPageIdentity(dryRunOrderInput);
      metadata.keyboardSubmitDetected = true;
    } else if (normalizedMode === "blocked_sensitive") {
      orderPageIdentity = createOrderPageIdentity(dryRunOrderInput, {
        sensitiveSignals: {
          accountDataDetected: true,
          balanceDataDetected: true,
          holdingsDataDetected: true,
          sensitiveDataDetected: true,
        },
      });
    } else if (normalizedMode === "missing_order_page_identity") {
      orderPageIdentity = undefined;
    }

    orderPageOpen = evaluateOrderPageOpenStub(
      dryRunOrderInput,
      instrumentPageResult,
      orderPageIdentity,
      attemptedAction,
      checkedAt,
      metadata,
    );
  }

  const statusCode =
    errors.length > 0 ||
    orderPageOpen.status === "blocked" ||
    orderPageOpen.status === "failed" ||
    orderPageOpen.status === "prohibited_form_interaction_detected"
      ? 400
      : orderPageOpen.status === "unavailable" ||
          orderPageOpen.status === "instrument_page_not_ready"
        ? 501
        : 200;
  const baseWarnings = [
    "Order-page-open runner is not implemented.",
    "No browser actions were executed.",
    "No Avanza page was touched.",
    "No form fields were filled.",
    "No Granska click occurred.",
    "No Bekräfta click occurred.",
  ];

  return {
    statusCode,
    body: {
      version: CONTRACT_VERSION,
      ok: orderPageOpen.ok,
      bridgeVersion: CONTRACT_VERSION,
      requestId,
      receivedAt,
      completedAt: now(),
      orderPageOpen,
      message:
        orderPageOpen.status === "order_page_opened"
          ? "Localhost bridge order-page-open stub returned a synthetic opened result. No browser was controlled."
          : "Localhost bridge order-page-open stub completed safely. No browser was controlled.",
      errors: [...errors, ...orderPageOpen.errors],
      warnings: [...new Set([...baseWarnings, ...orderPageOpen.warnings])],
      metadata: {
        ...(isObject(payload?.metadata) ? payload.metadata : {}),
        localhost_bridge_stub: true,
        order_page_open_endpoint_stub: true,
        order_page_open_mode: normalizedMode,
        synthetic_order_page_opened:
          orderPageOpen.status === "order_page_opened",
        no_browser_control: true,
        no_browser_actions_executed: true,
        no_avanza_page_touched: true,
        no_avanza_urls: true,
        no_avanza_selectors: true,
        no_real_order_page_opened: true,
        no_form_fill: true,
        no_review_click: true,
        no_final_confirm_click: true,
        no_broker_submission: true,
        no_broker_result_created: true,
        no_trade_mutation: true,
      },
    },
  };
}

function createAdvancedFormFillResult(status, dryRunOrderInput, options = {}) {
  const instrument = isObject(dryRunOrderInput?.instrument)
    ? dryRunOrderInput.instrument
    : { ticker: "UNKNOWN" };
  const labelsByStatus = {
    unavailable: ["Advanced form fill unavailable"],
    order_page_not_ready: ["Order page not ready"],
    unsupported_order_mode: ["Unsupported order mode"],
    form_filled: ["Advanced form filled"],
    field_mismatch: ["Advanced form field mismatch"],
    validation_error: ["Advanced form validation error"],
    prohibited_review_detected: ["Prohibited review detected"],
    prohibited_final_confirm_detected: ["Prohibited final confirm detected"],
    blocked: ["Advanced form fill blocked"],
    failed: ["Advanced form fill failed"],
  };

  return {
    ok: status === "form_filled",
    status,
    checkedAt: options.checkedAt ?? now(),
    expectedAction:
      dryRunOrderInput?.action === "buy" || dryRunOrderInput?.action === "sell"
        ? dryRunOrderInput.action
        : "buy",
    expectedInstrument: {
      ticker: stringValue(instrument?.ticker) ?? "",
      ...(stringValue(instrument?.name)
        ? { name: stringValue(instrument.name) }
        : {}),
      ...(stringValue(instrument?.market)
        ? { market: stringValue(instrument.market) }
        : {}),
      ...(stringValue(instrument?.currency)
        ? { currency: stringValue(instrument.currency) }
        : {}),
      ...(stringValue(instrument?.instrumentType)
        ? { instrumentType: stringValue(instrument.instrumentType) }
        : {}),
    },
    expectedQuantity: numberFromInput(dryRunOrderInput?.quantity) ?? 1,
    expectedPrice: numberFromInput(dryRunOrderInput?.price) ?? 1,
    ...(options.formState ? { formState: options.formState } : {}),
    fieldChecks: options.fieldChecks ?? [],
    riskFlags: [...new Set(options.riskFlags ?? [])],
    blockers: [...new Set(options.blockers ?? [])],
    warnings: [...new Set(options.warnings ?? [])],
    errors: [...new Set(options.errors ?? [])],
    labels: [
      ...new Set([
        "Advanced form fill only",
        "No Granska click",
        "No Bekräfta click",
        "No keyboard submit",
        "No broker submission",
        "No trade mutation",
        ...(labelsByStatus[status] ?? []),
        ...(options.labels ?? []),
      ]),
    ],
    metadata: {
      ...(options.metadata ?? {}),
      contractVersion: AVANZA_ADVANCED_FORM_FILL_CONTRACT_VERSION,
      advancedFormFillOnly: true,
      noReviewClick: true,
      noFinalConfirmClick: true,
      noKeyboardSubmit: true,
      noBrokerSubmission: true,
      noBrokerResult: true,
      noSupabaseWrite: true,
      noTradeMutation: true,
    },
  };
}

function createAdvancedFormState(dryRunOrderInput, options = {}) {
  const instrument = isObject(dryRunOrderInput?.instrument)
    ? dryRunOrderInput.instrument
    : { ticker: "UNKNOWN" };

  return {
    action:
      stringValue(options.action) ??
      (dryRunOrderInput?.action === "buy" || dryRunOrderInput?.action === "sell"
        ? dryRunOrderInput.action
        : "buy"),
    ticker: stringValue(options.ticker) ?? stringValue(instrument.ticker) ?? "",
    ...(stringValue(options.name) ?? stringValue(instrument.name)
      ? { name: stringValue(options.name) ?? stringValue(instrument.name) }
      : {}),
    ...(stringValue(options.market) ?? stringValue(instrument.market)
      ? {
          market:
            stringValue(options.market) ?? stringValue(instrument.market),
        }
      : {}),
    ...(stringValue(options.currency) ?? stringValue(instrument.currency)
      ? {
          currency:
            stringValue(options.currency) ?? stringValue(instrument.currency),
        }
      : {}),
    ...(stringValue(options.instrumentType) ?? stringValue(instrument.instrumentType)
      ? {
          instrumentType:
            stringValue(options.instrumentType) ??
            stringValue(instrument.instrumentType),
        }
      : {}),
    orderMode: stringValue(options.orderMode) ?? "advanced",
    quantity:
      typeof options.quantity !== "undefined"
        ? options.quantity
        : dryRunOrderInput?.quantity,
    price:
      typeof options.price !== "undefined"
        ? options.price
        : dryRunOrderInput?.price,
    controls: isObject(options.controls)
      ? options.controls
      : {
          reviewButtonVisible: true,
          reviewButtonClickedOrAttempted: false,
          finalConfirmVisible: false,
          finalConfirmClickedOrAttempted: false,
        },
    interactions: isObject(options.interactions)
      ? options.interactions
      : {
          keyboardSubmitDetected: false,
          accountChanged: false,
          unsupportedFieldTouched: false,
          stopLossTabActive: false,
          glidandeTabActive: false,
        },
    sensitiveSignals: isObject(options.sensitiveSignals)
      ? options.sensitiveSignals
      : {
          accountDataDetected: false,
          balanceDataDetected: false,
          holdingsDataDetected: false,
          sensitiveDataDetected: false,
        },
    validation: isObject(options.validation)
      ? options.validation
      : {
          validationErrorsVisible: false,
          validationMessages: [],
        },
    metadata: {
      synthetic_stub: true,
      no_browser_inspection: true,
    },
  };
}

function createAdvancedFormFieldCheck(field, expected, actual, required, options = {}) {
  const expectedText = textValue(expected);
  const actualText = textValue(actual);

  if (!expectedText) {
    return {
      field,
      actual: actualText || undefined,
      status: "missing_expected",
      required: false,
      message:
        options.missingExpectedMessage ??
        `Expected ${field} is missing; form-fill confidence is lower.`,
    };
  }

  if (!actualText) {
    return {
      field,
      expected: expectedText,
      status: "missing_actual",
      required,
      message: options.missingActualMessage ?? `Advanced form ${field} is missing.`,
    };
  }

  if (
    (options.numeric === true &&
      numberFromInput(expected) !== null &&
      numberFromInput(actual) !== null &&
      numberFromInput(expected) === numberFromInput(actual)) ||
    normalizeSearchText(expectedText) === normalizeSearchText(actualText)
  ) {
    return {
      field,
      expected: expectedText,
      actual: actualText,
      status: "match",
      required,
    };
  }

  return {
    field,
    expected: expectedText,
    actual: actualText,
    status: "mismatch",
    required,
    message: options.mismatchMessage ?? `Advanced form ${field} does not match.`,
  };
}

function evaluateAdvancedFormFillStub(
  dryRunOrderInput,
  orderPageOpenResult,
  formState,
  checkedAt,
  metadata = {},
) {
  if (
    !isObject(orderPageOpenResult) ||
    orderPageOpenResult.ok !== true ||
    orderPageOpenResult.status !== "order_page_opened"
  ) {
    const blocker =
      stringValue(orderPageOpenResult?.blockers?.[0]) ??
      stringValue(orderPageOpenResult?.errors?.[0]) ??
      `Order page must be order_page_opened before advanced form fill; received ${
        stringValue(orderPageOpenResult?.status) ?? "missing"
      }.`;

    return createAdvancedFormFillResult(
      "order_page_not_ready",
      dryRunOrderInput,
      {
        checkedAt,
        blockers: [blocker],
        errors: [blocker],
        riskFlags: ["order_page_not_opened"],
      },
    );
  }

  if (!isObject(formState)) {
    const blocker = "Sanitized advanced form state is required.";

    return createAdvancedFormFillResult("unavailable", dryRunOrderInput, {
      checkedAt,
      blockers: [blocker],
      errors: [blocker],
      riskFlags: ["missing_form_state"],
      warnings: ["No browser page was opened or inspected by this stub."],
    });
  }

  const riskFlags = [];
  const blockers = [];
  const warnings = [];
  const errors = [];
  const orderMode = stringValue(formState.orderMode) ?? "unknown";

  if (orderMode !== "advanced") {
    riskFlags.push("unsupported_order_mode");
    blockers.push("Only Advanced order mode is supported for form-fill diagnostics.");

    if (orderMode === "stop_loss") {
      riskFlags.push("stop_loss_mode_detected");
    }

    if (orderMode === "glidande") {
      riskFlags.push("glidande_mode_detected");
    }
  }

  if (formState.controls?.reviewButtonClickedOrAttempted || metadata.reviewButtonClickedOrAttempted === true) {
    riskFlags.push("review_button_clicked_or_attempted");
    blockers.push("Review/Granska click was attempted during form-fill.");
  }

  if (formState.controls?.finalConfirmVisible) {
    riskFlags.push("final_confirm_detected");
    blockers.push("Final-confirm/Bekrafta control was visible during form-fill.");
  }

  if (formState.controls?.finalConfirmClickedOrAttempted || metadata.finalConfirmClickedOrAttempted === true) {
    riskFlags.push("final_confirm_clicked_or_attempted");
    blockers.push("Final-confirm/Bekrafta click was attempted during form-fill.");
  }

  if (formState.interactions?.keyboardSubmitDetected || metadata.keyboardSubmitDetected === true) {
    riskFlags.push("keyboard_submit_detected");
    blockers.push("Keyboard submit was detected during form-fill.");
  }

  if (formState.interactions?.accountChanged || metadata.accountChanged === true) {
    riskFlags.push("account_changed");
    blockers.push("Account change was detected during form-fill.");
  }

  if (formState.interactions?.unsupportedFieldTouched || metadata.unsupportedFieldTouched === true) {
    riskFlags.push("unsupported_field_touched");
    blockers.push("Unsupported field interaction was detected during form-fill.");
  }

  for (const [key, risk, message] of [
    ["accountDataDetected", "account_data_detected", "Account data detected during form-fill."],
    ["balanceDataDetected", "balance_data_detected", "Balance data detected during form-fill."],
    ["holdingsDataDetected", "holdings_data_detected", "Holdings data detected during form-fill."],
    ["sensitiveDataDetected", "sensitive_data_detected", "Sensitive data detected during form-fill."],
  ]) {
    if (formState.sensitiveSignals?.[key]) {
      riskFlags.push(risk);
      blockers.push(message);
    }
  }

  if (formState.validation?.validationErrorsVisible) {
    riskFlags.push("validation_error_visible");
    blockers.push("Advanced form validation errors are visible.");
    errors.push(...(formState.validation.validationMessages ?? []));
  }

  const instrument = dryRunOrderInput.instrument ?? {};
  const fieldChecks = [
    createAdvancedFormFieldCheck("action", dryRunOrderInput.action, formState.action, true, {
      mismatchMessage: "Advanced form action does not match expected action.",
    }),
    createAdvancedFormFieldCheck("ticker", instrument.ticker, formState.ticker, true, {
      mismatchMessage: "Advanced form ticker does not match expected ticker.",
    }),
    createAdvancedFormFieldCheck("quantity", dryRunOrderInput.quantity, formState.quantity, true, {
      numeric: true,
      mismatchMessage: "Advanced form quantity does not match expected quantity.",
    }),
    createAdvancedFormFieldCheck("price", dryRunOrderInput.price, formState.price, true, {
      numeric: true,
      mismatchMessage: "Advanced form price does not match expected price.",
    }),
  ];

  for (const check of fieldChecks) {
    if (check.status === "mismatch") {
      const riskByField = {
        action: "action_mismatch",
        ticker: "ticker_mismatch",
        quantity: "quantity_mismatch",
        price: "price_mismatch",
      };
      riskFlags.push(riskByField[check.field] ?? "instrument_mismatch");
      blockers.push(check.message);
      errors.push(check.message);
    }

    if (check.status === "missing_actual") {
      const riskByField = {
        quantity: "missing_quantity",
        price: "missing_price",
      };
      riskFlags.push(riskByField[check.field] ?? "instrument_mismatch");
      blockers.push(check.message);
      errors.push(check.message);
    }
  }

  if (blockers.length > 0) {
    const status = riskFlags.includes("review_button_clicked_or_attempted")
      ? "prohibited_review_detected"
      : riskFlags.includes("final_confirm_detected") ||
          riskFlags.includes("final_confirm_clicked_or_attempted")
        ? "prohibited_final_confirm_detected"
        : riskFlags.includes("unsupported_order_mode") ||
            riskFlags.includes("stop_loss_mode_detected") ||
            riskFlags.includes("glidande_mode_detected")
          ? "unsupported_order_mode"
          : riskFlags.includes("validation_error_visible")
            ? "validation_error"
            : riskFlags.includes("action_mismatch") ||
                riskFlags.includes("ticker_mismatch") ||
                riskFlags.includes("quantity_mismatch") ||
                riskFlags.includes("price_mismatch") ||
                riskFlags.includes("missing_quantity") ||
                riskFlags.includes("missing_price")
              ? "field_mismatch"
              : "blocked";

    return createAdvancedFormFillResult(status, dryRunOrderInput, {
      checkedAt,
      formState,
      fieldChecks,
      riskFlags,
      blockers,
      warnings,
      errors: [...new Set([...errors, ...blockers])],
    });
  }

  if (formState.controls?.reviewButtonVisible) {
    riskFlags.push("review_button_visible");
    warnings.push("Review/Granska button visible; no click occurred.");
  }

  return createAdvancedFormFillResult("form_filled", dryRunOrderInput, {
    checkedAt,
    formState,
    fieldChecks,
    riskFlags,
    warnings,
  });
}

function validateAdvancedFormFillPayload(payload) {
  const errors = [];

  if (!isObject(payload)) {
    return ["Advanced form-fill payload must be a JSON object."];
  }

  if (payload.version !== CONTRACT_VERSION) {
    errors.push(`Advanced form-fill request version must be ${CONTRACT_VERSION}.`);
  }

  if (!stringValue(payload.requestId)) {
    errors.push("Advanced form-fill request requestId is missing.");
  }

  if (!stringValue(payload.createdAt) || !Number.isFinite(Date.parse(payload.createdAt))) {
    errors.push("Advanced form-fill request createdAt must be a valid timestamp.");
  }

  const dryRunValidation = validateAvanzaDryRunOrderInput(
    payload.dryRunOrderInput,
  );
  errors.push(...dryRunValidation.errors);

  if (
    typeof payload.orderPageOpenResult !== "undefined" &&
    !isObject(payload.orderPageOpenResult)
  ) {
    errors.push(
      "Advanced form-fill request orderPageOpenResult must be an object when provided.",
    );
  }

  if (typeof payload.formState !== "undefined" && !isObject(payload.formState)) {
    errors.push(
      "Advanced form-fill request formState must be an object when provided.",
    );
  }

  if (hasUnsafeDryRunMetadata(payload.metadata)) {
    errors.push(
      "Advanced form-fill request metadata contains unsafe submit or broker automation flags.",
    );
  }

  return errors;
}

function buildAdvancedFormFillResponse(payload) {
  const receivedAt = now();
  const checkedAt = receivedAt;
  const requestId =
    stringValue(payload?.requestId) ?? "unknown_advanced_form_fill_request";
  const errors = validateAdvancedFormFillPayload(payload);
  const dryRunValidation = validateAvanzaDryRunOrderInput(
    payload?.dryRunOrderInput,
  );
  const dryRunOrderInput = dryRunValidation.normalized ?? {
    action: "buy",
    instrument: { ticker: "UNKNOWN" },
    quantity: 1,
    price: 1,
    orderMode: "advanced",
    accountPolicy: "require_manual_review",
    stopPolicy: "stop_at_confirmation_modal",
    createdAt: checkedAt,
  };
  const mode =
    stringValue(process.env.AVANZA_LOCALHOST_BRIDGE_ADVANCED_FORM_FILL_MODE) ??
    "unavailable";
  const supportedModes = new Set([
    "unavailable",
    "form_filled_buy",
    "form_filled_sell",
    "field_mismatch_quantity",
    "field_mismatch_price",
    "field_mismatch_ticker",
    "validation_error",
    "unsupported_order_mode_stop_loss",
    "unsupported_order_mode_glidande",
    "prohibited_review_detected",
    "prohibited_final_confirm_detected",
    "blocked_keyboard_submit",
    "blocked_account_change",
    "blocked_sensitive",
    "order_page_not_ready",
    "missing_form_state",
  ]);
  const normalizedMode = supportedModes.has(mode) ? mode : "unavailable";
  let orderPageOpenResult = isObject(payload?.orderPageOpenResult)
    ? payload.orderPageOpenResult
    : createOrderPageOpenResult("order_page_opened", dryRunOrderInput, {
        checkedAt,
        orderPageIdentity: createOrderPageIdentity(dryRunOrderInput),
      });
  let formState = isObject(payload?.formState) ? payload.formState : undefined;
  const metadata = isObject(payload?.metadata) ? { ...payload.metadata } : {};
  let advancedFormFill;

  if (errors.length > 0) {
    advancedFormFill = createAdvancedFormFillResult("failed", dryRunOrderInput, {
      checkedAt,
      blockers: errors,
      errors,
    });
  } else if (normalizedMode === "unavailable") {
    advancedFormFill = createAdvancedFormFillResult(
      "unavailable",
      dryRunOrderInput,
      {
        checkedAt,
        blockers: ["Advanced form-fill runner is not implemented."],
        errors: ["Advanced form-fill runner is not implemented."],
      },
    );
  } else {
    if (normalizedMode === "order_page_not_ready") {
      orderPageOpenResult = createOrderPageOpenResult(
        "instrument_page_not_ready",
        dryRunOrderInput,
        {
          checkedAt,
          blockers: ["Order page is not opened for advanced form fill."],
          errors: ["Order page is not opened for advanced form fill."],
        },
      );
      formState = createAdvancedFormState(dryRunOrderInput);
    } else if (normalizedMode === "missing_form_state") {
      formState = undefined;
    } else {
      if (normalizedMode === "form_filled_buy") {
        dryRunOrderInput.action = "buy";
      } else if (normalizedMode === "form_filled_sell") {
        dryRunOrderInput.action = "sell";
      }

      formState = createAdvancedFormState(dryRunOrderInput, {
        ...(normalizedMode === "field_mismatch_quantity"
          ? { quantity: Number(dryRunOrderInput.quantity) + 1 }
          : {}),
        ...(normalizedMode === "field_mismatch_price"
          ? { price: Number(dryRunOrderInput.price) + 1 }
          : {}),
        ...(normalizedMode === "field_mismatch_ticker"
          ? { ticker: "NO.MATCH" }
          : {}),
        ...(normalizedMode === "validation_error"
          ? {
              validation: {
                validationErrorsVisible: true,
                validationMessages: ["Synthetic advanced form validation error."],
              },
            }
          : {}),
        ...(normalizedMode === "unsupported_order_mode_stop_loss"
          ? {
              orderMode: "stop_loss",
              interactions: { stopLossTabActive: true },
            }
          : {}),
        ...(normalizedMode === "unsupported_order_mode_glidande"
          ? {
              orderMode: "glidande",
              interactions: { glidandeTabActive: true },
            }
          : {}),
        ...(normalizedMode === "prohibited_review_detected"
          ? {
              controls: {
                reviewButtonVisible: true,
                reviewButtonClickedOrAttempted: true,
                finalConfirmVisible: false,
                finalConfirmClickedOrAttempted: false,
              },
            }
          : {}),
        ...(normalizedMode === "prohibited_final_confirm_detected"
          ? {
              controls: {
                reviewButtonVisible: true,
                reviewButtonClickedOrAttempted: false,
                finalConfirmVisible: true,
                finalConfirmClickedOrAttempted: true,
              },
            }
          : {}),
        ...(normalizedMode === "blocked_keyboard_submit"
          ? {
              interactions: {
                keyboardSubmitDetected: true,
              },
            }
          : {}),
        ...(normalizedMode === "blocked_account_change"
          ? {
              interactions: {
                accountChanged: true,
              },
            }
          : {}),
        ...(normalizedMode === "blocked_sensitive"
          ? {
              sensitiveSignals: {
                accountDataDetected: true,
                balanceDataDetected: true,
                holdingsDataDetected: true,
                sensitiveDataDetected: true,
              },
            }
          : {}),
      });
    }

    advancedFormFill = evaluateAdvancedFormFillStub(
      dryRunOrderInput,
      orderPageOpenResult,
      formState,
      checkedAt,
      metadata,
    );
  }

  const statusCode =
    errors.length > 0 ||
    advancedFormFill.status === "blocked" ||
    advancedFormFill.status === "failed" ||
    advancedFormFill.status === "field_mismatch" ||
    advancedFormFill.status === "validation_error" ||
    advancedFormFill.status === "unsupported_order_mode" ||
    advancedFormFill.status === "prohibited_review_detected" ||
    advancedFormFill.status === "prohibited_final_confirm_detected"
      ? 400
      : advancedFormFill.status === "unavailable" ||
          advancedFormFill.status === "order_page_not_ready"
        ? 501
        : 200;
  const baseWarnings = [
    "Advanced form-fill runner is not implemented.",
    "No browser actions were executed.",
    "No Avanza page was touched.",
    "No real form fields were filled.",
    "No Granska click occurred.",
    "No Bekräfta click occurred.",
    "No broker result was created.",
  ];

  return {
    statusCode,
    body: {
      version: CONTRACT_VERSION,
      ok: advancedFormFill.ok,
      bridgeVersion: CONTRACT_VERSION,
      requestId,
      receivedAt,
      completedAt: now(),
      advancedFormFill,
      message:
        advancedFormFill.status === "form_filled"
          ? "Localhost bridge advanced form-fill stub returned a synthetic filled result. No browser was controlled."
          : "Localhost bridge advanced form-fill stub completed safely. No browser was controlled.",
      errors: [...new Set([...errors, ...advancedFormFill.errors])],
      warnings: [...new Set([...baseWarnings, ...advancedFormFill.warnings])],
      metadata: {
        ...(isObject(payload?.metadata) ? payload.metadata : {}),
        localhost_bridge_stub: true,
        advanced_form_fill_endpoint_stub: true,
        advanced_form_fill_mode: normalizedMode,
        synthetic_advanced_form_filled:
          advancedFormFill.status === "form_filled",
        no_browser_control: true,
        no_browser_actions_executed: true,
        no_avanza_page_touched: true,
        no_avanza_urls: true,
        no_avanza_selectors: true,
        no_real_form_fields_filled: true,
        no_review_click: true,
        no_final_confirm_click: true,
        no_broker_submission: true,
        no_broker_result_created: true,
        no_supabase_write: true,
        no_trade_mutation: true,
      },
    },
  };
}

function createAvanzaDryRunStubCapability(createdAt) {
  return {
    runnerId: "avanza_dry_run_browser_runner_stub",
    runnerName: "Avanza Dry-Run Browser Runner Stub",
    targetEnvironment: "avanza_broker",
    supportsBrowserExecution: true,
    supportsBrokerSubmission: false,
    supportsFinalConfirmClick: false,
    mockOnly: false,
    devOnly: true,
    automaticModeCapable: false,
    createdAt,
    metadata: {
      capabilityGateVersion: "browser_runner_capability_gate_v1",
      dryRunOnly: true,
      mockOnly: false,
      devOnly: true,
      targetEnvironment: "avanza_broker",
      supportsBrokerSubmission: false,
      supportsFinalConfirmClick: false,
      automaticModeCapable: false,
      source: "localhost_bridge_dry_run_stub",
    },
  };
}

function validateAvanzaDryRunCapability(capability, options) {
  const errors = [];
  const warnings = [];
  let safetyLevel =
    options?.allowAvanzaDryRun === true ? "dry_run_only" : "real_broker_blocked";

  if (options?.allowAvanzaDryRun !== true) {
    errors.push("Avanza broker browser capability is blocked by default.");
  } else {
    warnings.push(
      "Avanza dry-run capability is dry-run only: no broker submission, no final confirmation, and no broker result.",
    );
  }

  if (capability.supportsBrokerSubmission === true) {
    safetyLevel = "real_broker_blocked";
    errors.push("Avanza dry-run capability must not support broker submission.");
  }

  if (capability.supportsFinalConfirmClick === true) {
    safetyLevel = "real_broker_blocked";
    errors.push("Avanza dry-run capability must not support final-confirm clicks.");
  }

  if (capability.automaticModeCapable === true || options?.allowAutomaticMode === true) {
    safetyLevel = "real_broker_blocked";
    errors.push("Automatic-mode browser capability is blocked by default.");
  }

  if (options?.allowBrokerSubmission === true) {
    safetyLevel = "real_broker_blocked";
    errors.push("Broker submission capability is blocked by default.");
  }

  const blocked = errors.length > 0;

  return {
    ok: !blocked,
    blocked,
    errors,
    warnings,
    safetyLevel,
    canRunMockBrowserActions: false,
    canRunAvanzaDryRun:
      !blocked &&
      options?.allowAvanzaDryRun === true &&
      capability.targetEnvironment === "avanza_broker" &&
      capability.supportsBrowserExecution === true &&
      capability.supportsBrokerSubmission === false &&
      capability.supportsFinalConfirmClick === false &&
      capability.automaticModeCapable === false,
    canSubmitBrokerOrder: false,
  };
}

function validateAvanzaDryRunOrderInput(input) {
  const errors = [];
  const warnings = [];

  if (!isObject(input)) {
    return {
      ok: false,
      errors: ["Avanza dry-run request must be an object."],
      warnings,
    };
  }

  const instrument = isObject(input.instrument) ? input.instrument : null;
  const ticker = stringValue(instrument?.ticker);
  const quantity = numberFromInput(input.quantity);
  const price = numberFromInput(input.price);
  const orderMode = stringValue(input.orderMode) ?? "advanced";
  const stopPolicy = stringValue(input.stopPolicy) ?? "stop_at_confirmation_modal";
  const accountPolicy =
    stringValue(input.accountPolicy) ?? "require_manual_review";

  if (input.action !== "buy" && input.action !== "sell") {
    errors.push("Avanza dry-run action must be buy or sell.");
  }

  if (!ticker) {
    errors.push("Instrument ticker is required.");
  }

  if (!stringValue(instrument?.currency)) {
    warnings.push("Instrument currency is missing and must be verified manually.");
  }

  if (!stringValue(instrument?.market)) {
    warnings.push("Instrument market is missing and must be verified manually.");
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    errors.push("Avanza dry-run quantity must be a positive integer.");
  }

  if (price === null || price <= 0) {
    errors.push("Avanza dry-run price must be a positive finite number.");
  }

  if (orderMode !== "advanced") {
    errors.push("Avanza dry-run order mode must be advanced.");
  }

  if (
    stopPolicy !== "stop_at_confirmation_modal" &&
    stopPolicy !== "stop_before_review"
  ) {
    errors.push(
      "Avanza dry-run stop policy must stop before review or at confirmation modal.",
    );
  }

  if (
    accountPolicy !== "use_current_default" &&
    accountPolicy !== "require_manual_review" &&
    accountPolicy !== "require_exact_match"
  ) {
    errors.push("Avanza dry-run account policy is unsupported.");
  }

  if (
    accountPolicy === "require_exact_match" &&
    !stringValue(input.expectedAccountLabel)
  ) {
    errors.push(
      "Avanza dry-run account policy require_exact_match requires expectedAccountLabel.",
    );
  }

  if (isObject(input.metadata)) {
    if (input.metadata.allowFinalSubmit === true) {
      errors.push("Avanza dry-run request metadata must not allow final submit.");
    }

    if (input.metadata.supportsBrokerSubmission === true) {
      errors.push(
        "Avanza dry-run request metadata must not support broker submission.",
      );
    }

    if (input.metadata.supportsFinalConfirmClick === true) {
      errors.push(
        "Avanza dry-run request metadata must not support final-confirm clicks.",
      );
    }

    if (input.metadata.automaticModeCapable === true) {
      errors.push(
        "Avanza dry-run request metadata must not enable automatic mode.",
      );
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    ...(errors.length === 0
      ? {
          normalized: {
            action: input.action,
            instrument: {
              ticker,
              name: stringValue(instrument?.name),
              market: stringValue(instrument?.market),
              currency: stringValue(instrument?.currency),
              instrumentType: stringValue(instrument?.instrumentType),
            },
            quantity,
            price,
            orderMode,
            accountPolicy,
            expectedAccountLabel: stringValue(input.expectedAccountLabel),
            stopPolicy,
            sourceRecommendationId: stringValue(input.sourceRecommendationId),
            executionIntentId: stringValue(input.executionIntentId),
            createdAt: stringValue(input.createdAt) ?? now(),
            metadata: isObject(input.metadata) ? input.metadata : undefined,
          },
        }
      : {}),
  };
}

function hasUnsafeDryRunMetadata(metadata) {
  return (
    isObject(metadata) &&
    (metadata.allowFinalSubmit === true ||
      metadata.supportsBrokerSubmission === true ||
      metadata.supportsFinalConfirmClick === true ||
      metadata.automaticModeCapable === true)
  );
}

function validateDryRunPayload(payload) {
  const errors = [];
  const warnings = [];

  if (!isObject(payload)) {
    return {
      ok: false,
      errors: ["Dry-run payload must be a JSON object."],
      warnings,
      dryRunRequestValidation: {
        ok: false,
        errors: ["Avanza dry-run request must be an object."],
        warnings: [],
      },
    };
  }

  if (payload.version !== CONTRACT_VERSION) {
    errors.push(`Dry-run request version must be ${CONTRACT_VERSION}.`);
  }

  if (!stringValue(payload.requestId)) {
    errors.push("Dry-run request requestId is missing.");
  }

  if (!stringValue(payload.createdAt) || !Number.isFinite(Date.parse(payload.createdAt))) {
    errors.push("Dry-run request createdAt must be a valid timestamp.");
  }

  if (
    typeof payload.capabilityValidationOptions !== "undefined" &&
    !isObject(payload.capabilityValidationOptions)
  ) {
    errors.push("Dry-run request capabilityValidationOptions must be an object when provided.");
  }

  if (isObject(payload.capabilityValidationOptions)) {
    if (payload.capabilityValidationOptions.allowBrokerSubmission === true) {
      errors.push("Dry-run request must not allow broker submission.");
    }

    if (payload.capabilityValidationOptions.allowAutomaticMode === true) {
      errors.push("Dry-run request must not allow automatic mode.");
    }
  }

  const dryRunRequestValidation = validateAvanzaDryRunOrderInput(
    payload.dryRunOrderInput,
  );

  if (!dryRunRequestValidation.ok) {
    errors.push(
      ...dryRunRequestValidation.errors.map(
        (error) => `Avanza dry-run request: ${error}`,
      ),
    );
  }

  warnings.push(
    ...dryRunRequestValidation.warnings.map(
      (warning) => `Avanza dry-run request: ${warning}`,
    ),
  );

  if (hasUnsafeDryRunMetadata(payload.metadata)) {
    errors.push("Dry-run request metadata contains unsafe submit or broker automation flags.");
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    dryRunRequestValidation,
  };
}

function requestIdFromDryRunPayload(payload) {
  return stringValue(payload?.requestId) ?? "unknown_dry_run_request";
}

function buildDryRunResponse(payload) {
  const receivedAt = now();
  const requestId = requestIdFromDryRunPayload(payload);
  const payloadValidation = validateDryRunPayload(payload);
  const capability = createAvanzaDryRunStubCapability(receivedAt);
  const capabilityValidation = validateAvanzaDryRunCapability(
    capability,
    isObject(payload?.capabilityValidationOptions)
      ? payload.capabilityValidationOptions
      : {},
  );
  const unavailableSelfCheck = createUnavailableRunnerSelfCheck(receivedAt);
  const status =
    payloadValidation.errors.length > 0 || capabilityValidation.blocked
      ? "blocked"
      : "not_implemented";
  const errors =
    status === "blocked"
      ? [
          ...payloadValidation.errors,
          ...capabilityValidation.errors.map(
            (error) => `Capability: ${error}`,
          ),
        ]
      : payloadValidation.errors;

  if (
    stringValue(process.env.AVANZA_LOCALHOST_BRIDGE_SELF_CHECK_MODE) ===
      "dry_run_skeleton" &&
    payloadValidation.errors.length === 0 &&
    !capabilityValidation.blocked
  ) {
    return runAvanzaDryRunRunnerSkeleton(payload);
  }

  return {
    statusCode: status === "blocked" ? 400 : 501,
    body: {
      version: CONTRACT_VERSION,
      ok: false,
      status,
      bridgeVersion: CONTRACT_VERSION,
      requestId,
      receivedAt,
      completedAt: now(),
      dryRunRequestValidation: payloadValidation.dryRunRequestValidation,
      capabilityValidation,
      selfCheck: unavailableSelfCheck,
      diagnostics: null,
      message:
        status === "blocked"
          ? "Localhost bridge dry-run request was blocked by validation. No browser action occurred."
          : "Localhost bridge dry-run request validated, but the Avanza dry-run runner is not implemented. No browser action occurred.",
      errors,
      warnings: [
        ...payloadValidation.warnings,
        ...capabilityValidation.warnings,
        "Avanza dry-run runner is not implemented.",
        "No browser actions were executed.",
        "No broker submission was performed.",
      ],
      metadata: {
        ...(isObject(payload?.metadata) ? payload.metadata : {}),
        localhost_bridge_stub: true,
        dry_run_endpoint_stub: true,
        no_browser_actions_executed: true,
        no_avanza_session: true,
        no_broker_submission: true,
        no_broker_result_created: true,
      },
    },
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

function buildOrderFormPreflightCheck(name, ok, observed, expected, details) {
  return {
    name,
    ok,
    observed,
    expected,
    ...(details ? { details } : {}),
  };
}

function createOrderFormPreflightResponse(status, options = {}) {
  const checkedAt = options.checkedAt ?? now();
  const checks = options.checks ?? [];
  const ready = status === "ready";
  const statusLabels = {
    unavailable: ["Manual browser observation unavailable"],
    browser_not_connected: ["Browser not connected"],
    avanza_not_visible: ["Avanza not visible"],
    ambiguous: ["Multiple Avanza pages visible"],
    mismatch: ["Order-form preflight mismatch"],
    blocked: ["Order-form preflight blocked"],
    failed: ["Order-form preflight failed"],
    ready: ["Order-form preflight ready"],
  };

  return {
    version: CONTRACT_VERSION,
    ok: ready,
    bridgeVersion: CONTRACT_VERSION,
    checkedAt,
    preflight: {
      version: AVANZA_ORDER_FORM_PREFLIGHT_CONTRACT_VERSION,
      ok: ready,
      status,
      checkedAt,
      expected: {
        account: "Valentin Labs KF",
        instrument: "GameStop",
        side: "buy",
        orderMode: "Avancerad/Limit",
        stopBefore: "Granska köp",
      },
      checks,
      labels: [
        "Manual browser observation only",
        "No browser launch",
        "No field fill",
        "No click",
        "No review modal open",
        "No final confirm",
        "No order submission",
        ...(statusLabels[status] ?? []),
      ],
      blockers: options.blockers ?? [],
      warnings: options.warnings ?? [],
      errors: options.errors ?? [],
      ...(options.observation
        ? {
            observation: options.observation,
          }
        : {}),
      metadata: {
        contractVersion: AVANZA_ORDER_FORM_PREFLIGHT_CONTRACT_VERSION,
        manualObservationOnly: true,
        readonlyCdpObservation: options.readonlyCdpObservation === true,
        noBrowserLaunch: true,
        noBrowserControlActions: true,
        noFieldFill: true,
        noAmountFill: true,
        noPriceFill: true,
        noClick: true,
        noReviewClick: true,
        noFinalConfirmClick: true,
        noBrokerSubmission: true,
        noCredentialsHandling: true,
        noBankIdHandling: true,
        noCookiesRead: true,
        noLocalStorageRead: true,
        noSessionStorageRead: true,
        noBrokerResultCreated: true,
        noTradeMutation: true,
        ...(options.metadata ?? {}),
      },
    },
    message: ready
      ? "Manual browser observation preflight passed. No fill, click, review, confirm, submit, or order placement occurred."
      : "Manual browser observation preflight did not pass. No fill, click, review, confirm, submit, or order placement occurred.",
    errors: options.errors ?? [],
    warnings: [
      "Preflight is observation-only. It must not be used as a fill/click/order trigger.",
      ...(options.warnings ?? []),
    ],
    metadata: {
      localhost_bridge_stub: true,
      preflight_order_form_observation_only: true,
      no_browser_launch: true,
      no_fill: true,
      no_click: true,
      no_review_modal_opened: true,
      no_submit: true,
      no_order_placement: true,
    },
  };
}

function manualObservationModeEnabled() {
  return (
    stringValue(process.env.AVANZA_LOCALHOST_BRIDGE_MANUAL_OBSERVATION_MODE) ===
    MANUAL_OBSERVATION_MODE
  );
}

function normalizeManualObservationCdpUrl(value) {
  const url = new URL(value ?? DEFAULT_MANUAL_OBSERVATION_CDP_URL);

  if (!isLocalhostUrl(url)) {
    throw new Error("Manual observation CDP URL must be localhost only.");
  }

  url.pathname = "";
  url.search = "";
  url.hash = "";

  return url.toString().replace(/\/+$/, "");
}

function sanitizedUrlDetails(value) {
  try {
    const url = new URL(value);

    return {
      protocol: url.protocol,
      host: url.host,
      pathname: url.pathname,
    };
  } catch {
    return {
      protocol: "unknown",
      host: "unknown",
      pathname: "unknown",
    };
  }
}

function stringIncludesAvanza(value) {
  return typeof value === "string" && /(^|\.)avanza\.se$/i.test(value);
}

async function listCdpTargets(cdpBaseUrl) {
  const response = await fetch(`${cdpBaseUrl}/json/list`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`CDP target list returned HTTP ${response.status}.`);
  }

  const targets = await response.json();

  return Array.isArray(targets) ? targets : [];
}

function cdpTargetIsAvanzaPage(target) {
  if (!isObject(target) || target.type !== "page") {
    return false;
  }

  try {
    const targetUrl = new URL(String(target.url ?? ""));

    return stringIncludesAvanza(targetUrl.hostname);
  } catch {
    return false;
  }
}

function sendReadonlyCdpCommand(webSocketDebuggerUrl, method, params = {}) {
  return new Promise((resolve, reject) => {
    if (typeof globalThis.WebSocket !== "function") {
      reject(new Error("Node WebSocket support is not available."));
      return;
    }

    const socket = new globalThis.WebSocket(webSocketDebuggerUrl);
    const id = 1;
    const timeout = setTimeout(() => {
      try {
        socket.close();
      } catch {
        // Ignore close errors during timeout cleanup.
      }
      reject(new Error("Readonly CDP observation timed out."));
    }, 5000);

    socket.addEventListener("open", () => {
      socket.send(JSON.stringify({ id, method, params }));
    });

    socket.addEventListener("message", (event) => {
      let message;

      try {
        message = JSON.parse(String(event.data));
      } catch {
        return;
      }

      if (message.id !== id) {
        return;
      }

      clearTimeout(timeout);

      try {
        socket.close();
      } catch {
        // Ignore close errors after a completed observation.
      }

      if (message.error) {
        reject(
          new Error(
            typeof message.error.message === "string"
              ? message.error.message
              : "Readonly CDP command failed.",
          ),
        );
        return;
      }

      resolve(message.result);
    });

    socket.addEventListener("error", () => {
      clearTimeout(timeout);
      reject(new Error("Readonly CDP WebSocket connection failed."));
    });
  });
}

function buildOrderFormObservationExpression() {
  return `(() => {
    const normalize = (value) => String(value || "").replace(/\\s+/g, " ").trim();
    const lower = (value) => normalize(value).toLocaleLowerCase("sv-SE");
    const visible = (element) => {
      if (!element) return false;
      const style = window.getComputedStyle(element);
      return style.display !== "none" &&
        style.visibility !== "hidden" &&
        style.opacity !== "0" &&
        (element.offsetWidth > 0 || element.offsetHeight > 0 || element.getClientRects().length > 0);
    };
    const visibleText = normalize(document.body ? document.body.innerText : "");
    const visibleTextLower = lower(visibleText);
    const controlText = Array.from(document.querySelectorAll("button,input,textarea,select,[role='button'],a,label"))
      .filter(visible)
      .map((element) => lower([
        element.tagName,
        element.getAttribute("type"),
        element.getAttribute("aria-label"),
        element.getAttribute("placeholder"),
        element.getAttribute("name"),
        element.getAttribute("id"),
        element.getAttribute("title"),
        element.innerText,
        element.value,
      ].filter(Boolean).join(" ")))
      .join(" ");
    const includesAny = (needles) => needles.some((needle) => visibleTextLower.includes(lower(needle)) || controlText.includes(lower(needle)));
    const finalConfirmVisible = includesAny(["Bekräfta köp", "Bekrafta kop", "Bekräfta sälj", "Bekrafta salj"]);
    return {
      url: window.location.href,
      title: document.title || "",
      checks: {
        avanzaPageVisible: /(^|\\.)avanza\\.se$/i.test(window.location.hostname) || includesAny(["Avanza"]),
        accountVisible: includesAny(["Valentin Labs KF"]),
        instrumentVisible: includesAny(["GameStop", "GME"]),
        buySideVisible: includesAny(["Köp", "Kop", "Buy", "Granska köp", "Granska kop"]),
        advancedLimitModeVisible: (includesAny(["Avancerad", "Advanced"]) && includesAny(["Limit", "Limitorder"])),
        amountFieldVisible: includesAny(["Belopp", "Amount", "Summa", "427,26"]),
        priceFieldVisible: includesAny(["Pris", "Price", "Limit", "21,98"]),
        reviewButtonVisible: includesAny(["Granska köp", "Granska kop"]),
        reviewModalOpen: finalConfirmVisible,
        finalConfirmVisible,
      },
      metadata: {
        visibleTextLength: visibleText.length,
        observedControlTextLength: controlText.length,
      },
    };
  })()`;
}

async function observeAvanzaOrderFormWithCdp() {
  const cdpBaseUrl = normalizeManualObservationCdpUrl(
    process.env.AVANZA_LOCALHOST_BRIDGE_MANUAL_OBSERVATION_CDP_URL,
  );
  const targets = await listCdpTargets(cdpBaseUrl);
  const avanzaTargets = targets.filter(cdpTargetIsAvanzaPage);

  if (avanzaTargets.length === 0) {
    return createOrderFormPreflightResponse("avanza_not_visible", {
      checkedAt: now(),
      readonlyCdpObservation: true,
      blockers: ["No Avanza page target was visible through the local CDP endpoint."],
      errors: ["No Avanza page target was visible through the local CDP endpoint."],
      metadata: {
        cdp_base_host: sanitizedUrlDetails(cdpBaseUrl).host,
        avanza_target_count: 0,
      },
    });
  }

  if (avanzaTargets.length > 1) {
    return createOrderFormPreflightResponse("ambiguous", {
      checkedAt: now(),
      readonlyCdpObservation: true,
      blockers: [
        "Multiple Avanza page targets were visible. Keep exactly one Avanza order-form tab open for preflight.",
      ],
      errors: ["Multiple Avanza page targets were visible."],
      metadata: {
        cdp_base_host: sanitizedUrlDetails(cdpBaseUrl).host,
        avanza_target_count: avanzaTargets.length,
      },
    });
  }

  const target = avanzaTargets[0];

  if (!stringValue(target.webSocketDebuggerUrl)) {
    return createOrderFormPreflightResponse("browser_not_connected", {
      checkedAt: now(),
      readonlyCdpObservation: true,
      blockers: ["The Avanza target did not expose a CDP WebSocket URL."],
      errors: ["The Avanza target did not expose a CDP WebSocket URL."],
      metadata: {
        cdp_base_host: sanitizedUrlDetails(cdpBaseUrl).host,
        avanza_target_count: 1,
      },
    });
  }

  const result = await sendReadonlyCdpCommand(
    target.webSocketDebuggerUrl,
    "Runtime.evaluate",
    {
      expression: buildOrderFormObservationExpression(),
      returnByValue: true,
      awaitPromise: false,
      userGesture: false,
    },
  );
  const observed = isObject(result?.result?.value) ? result.result.value : {};
  const observedChecks = isObject(observed.checks) ? observed.checks : {};
  const checks = [
    buildOrderFormPreflightCheck(
      "avanza_page_visible",
      observedChecks.avanzaPageVisible === true,
      observedChecks.avanzaPageVisible === true,
      true,
    ),
    buildOrderFormPreflightCheck(
      "account_visible",
      observedChecks.accountVisible === true,
      observedChecks.accountVisible === true ? "Valentin Labs KF" : "not_visible",
      "Valentin Labs KF",
    ),
    buildOrderFormPreflightCheck(
      "instrument_visible",
      observedChecks.instrumentVisible === true,
      observedChecks.instrumentVisible === true ? "GameStop" : "not_visible",
      "GameStop",
    ),
    buildOrderFormPreflightCheck(
      "buy_side_order_form_visible",
      observedChecks.buySideVisible === true,
      observedChecks.buySideVisible === true,
      true,
    ),
    buildOrderFormPreflightCheck(
      "order_mode_avancerad_limit_visible",
      observedChecks.advancedLimitModeVisible === true,
      observedChecks.advancedLimitModeVisible === true,
      true,
    ),
    buildOrderFormPreflightCheck(
      "amount_field_visible",
      observedChecks.amountFieldVisible === true,
      observedChecks.amountFieldVisible === true,
      true,
    ),
    buildOrderFormPreflightCheck(
      "price_field_visible",
      observedChecks.priceFieldVisible === true,
      observedChecks.priceFieldVisible === true,
      true,
    ),
    buildOrderFormPreflightCheck(
      "granska_kop_visible_not_clicked",
      observedChecks.reviewButtonVisible === true,
      observedChecks.reviewButtonVisible === true,
      true,
      "Visibility only; no click command exists in this endpoint.",
    ),
    buildOrderFormPreflightCheck(
      "no_review_modal_open",
      observedChecks.reviewModalOpen !== true,
      observedChecks.reviewModalOpen === true ? "open" : "not_open",
      "not_open",
    ),
    buildOrderFormPreflightCheck(
      "no_bekrafta_kop_salj_visible",
      observedChecks.finalConfirmVisible !== true,
      observedChecks.finalConfirmVisible === true ? "visible" : "not_visible",
      "not_visible",
    ),
  ];
  const failedChecks = checks.filter((check) => check.ok !== true);
  const targetUrl = sanitizedUrlDetails(observed.url ?? target.url);

  return createOrderFormPreflightResponse(
    failedChecks.length === 0 ? "ready" : "mismatch",
    {
      checkedAt: now(),
      checks,
      readonlyCdpObservation: true,
      blockers: failedChecks.map((check) => `${check.name}:mismatch`),
      warnings: [
        "Observation used sanitized visible page text/control labels only; raw page text is not returned.",
      ],
      errors: failedChecks.map((check) => `${check.name}:mismatch`),
      observation: {
        url: targetUrl,
        titleVisible: Boolean(stringValue(observed.title)),
        avanzaTargetCount: 1,
      },
      metadata: {
        cdp_base_host: sanitizedUrlDetails(cdpBaseUrl).host,
        avanza_target_count: 1,
        ...(isObject(observed.metadata)
          ? {
              visible_text_length: observed.metadata.visibleTextLength,
              observed_control_text_length:
                observed.metadata.observedControlTextLength,
            }
          : {}),
      },
    },
  );
}

async function buildOrderFormPreflightResponse() {
  const checkedAt = now();

  if (!manualObservationModeEnabled()) {
    return createOrderFormPreflightResponse("unavailable", {
      checkedAt,
      blockers: [
        `Manual observation mode must be explicitly enabled with AVANZA_LOCALHOST_BRIDGE_MANUAL_OBSERVATION_MODE=${MANUAL_OBSERVATION_MODE}.`,
      ],
      errors: ["Manual observation mode is not enabled."],
      metadata: {
        manual_observation_mode: "disabled",
      },
    });
  }

  try {
    return await observeAvanzaOrderFormWithCdp();
  } catch (error) {
    return createOrderFormPreflightResponse("failed", {
      checkedAt,
      readonlyCdpObservation: true,
      blockers: ["Manual browser observation failed before a safe preflight result could be produced."],
      errors: [
        error instanceof Error
          ? error.message
          : "Unknown manual observation failure.",
      ],
      metadata: {
        manual_observation_mode: MANUAL_OBSERVATION_MODE,
      },
    });
  }
}

function liveFillOnlyRunnerEnabled() {
  return (
    manualObservationModeEnabled() &&
    stringValue(process.env.AVANZA_LOCALHOST_BRIDGE_ENABLE_LIVE_FILL_ONLY_RUNNER) ===
      ENABLE_LIVE_FILL_ONLY_RUNNER_VALUE
  );
}

function createLiveFillOnlyRunnerResponse(action, status, options = {}) {
  const checkedAt = options.checkedAt ?? now();
  const ok = status === "ok";

  return {
    version: CONTRACT_VERSION,
    ok,
    status,
    action,
    checkedAt,
    runnerResult: {
      ok,
      evidence_id: options.evidenceId ?? null,
      observed_total_amount_sek: options.observedTotalAmountSek ?? null,
      note: options.note ?? null,
    },
    report: {
      verified_account: options.verifiedAccount ?? null,
      verified_instrument: options.verifiedInstrument ?? null,
      verified_side: options.verifiedSide ?? null,
      verified_order_mode: options.verifiedOrderMode ?? null,
      amount_field_filled: options.amountFieldFilled === true,
      price_field_filled: options.priceFieldFilled === true,
      total_amount_read: options.observedTotalAmountSek ?? null,
      evidence_captured: Boolean(options.evidenceId),
      stopped_before_granska_kop: options.stoppedBeforeReview === true,
      no_review_modal_opened: options.noReviewModalOpened !== false,
      no_final_confirmation_visible_or_clicked:
        options.noFinalConfirmationVisibleOrClicked !== false,
      no_order_placement: true,
    },
    blockers: options.blockers ?? [],
    errors: options.errors ?? [],
    warnings: [
      "Live fill-only runner endpoint is restricted to approved fill-only methods and must be called only through the explicit trigger/wrapper boundary.",
      ...(options.warnings ?? []),
    ],
    metadata: {
      live_fill_only_runner: true,
      disabled_by_default: true,
      explicit_env_enablement_required: true,
      manual_observation_mode_required: true,
      no_browser_launch: true,
      no_credentials_handling: true,
      no_bankid_handling: true,
      no_cookie_read: true,
      no_local_storage_read: true,
      no_session_storage_read: true,
      no_review_click: true,
      no_final_confirm_click: true,
      no_submit_or_order_placement: true,
      no_trade_mutation: true,
      ...(options.metadata ?? {}),
    },
  };
}

function createLiveFillOnlyRunnerBlockedResponse(action, blocker) {
  return createLiveFillOnlyRunnerResponse(action, "blocked", {
    blockers: [blocker],
    errors: [blocker],
    note: blocker,
    metadata: {
      live_fill_only_runner_enabled: false,
    },
  });
}

function liveFillOnlyRunnerGate(action) {
  if (liveFillOnlyRunnerEnabled()) {
    return null;
  }

  return createLiveFillOnlyRunnerBlockedResponse(
    action,
    "Live fill-only runner requires AVANZA_LOCALHOST_BRIDGE_MANUAL_OBSERVATION_MODE=cdp_readonly and AVANZA_LOCALHOST_BRIDGE_ENABLE_LIVE_FILL_ONLY_RUNNER=true.",
  );
}

function parseAmountSek(value) {
  const text = String(value ?? "")
    .replace(/\s/g, "")
    .replace(/[^\d,.-]/g, "")
    .replace(",", ".");
  const parsed = Number(text);

  return Number.isFinite(parsed) ? parsed : null;
}

function buildLiveFillOnlyObservationExpression() {
  return `(() => {
    const normalize = (value) => String(value || "").replace(/\\s+/g, " ").trim();
    const lower = (value) => normalize(value).toLocaleLowerCase("sv-SE");
    const visible = (element) => {
      if (!element) return false;
      const style = window.getComputedStyle(element);
      return style.display !== "none" &&
        style.visibility !== "hidden" &&
        style.opacity !== "0" &&
        (element.offsetWidth > 0 || element.offsetHeight > 0 || element.getClientRects().length > 0);
    };
    const findFirstVisible = (selectors) => {
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (visible(element)) return element;
      }
      return null;
    };
    const visibleText = normalize(document.body ? document.body.innerText : "");
    const visibleTextLower = lower(visibleText);
    const controlText = Array.from(document.querySelectorAll("button,input,textarea,select,[role='button'],a,label"))
      .filter(visible)
      .map((element) => lower([
        element.tagName,
        element.getAttribute("type"),
        element.getAttribute("aria-label"),
        element.getAttribute("placeholder"),
        element.getAttribute("name"),
        element.getAttribute("id"),
        element.getAttribute("title"),
        element.innerText,
        element.value,
      ].filter(Boolean).join(" ")))
      .join(" ");
    const includesAny = (needles) => needles.some((needle) => visibleTextLower.includes(lower(needle)) || controlText.includes(lower(needle)));
    const finalConfirmVisible = includesAny(["Bekräfta köp", "Bekrafta kop", "Bekräfta sälj", "Bekrafta salj"]);
    const amountField = findFirstVisible(${JSON.stringify(AVANZA_LIVE_FILL_ONLY_SELECTORS.amount)});
    const priceField = findFirstVisible(${JSON.stringify(AVANZA_LIVE_FILL_ONLY_SELECTORS.price)});
    const totalField = findFirstVisible(${JSON.stringify(AVANZA_LIVE_FILL_ONLY_SELECTORS.total)});
    return {
      url: window.location.href,
      titlePresent: Boolean(document.title),
      checks: {
        avanzaPageVisible: /(^|\\.)avanza\\.se$/i.test(window.location.hostname) || includesAny(["Avanza"]),
        accountVisible: includesAny(["${APPROVED_LIVE_FILL_ONLY_VALUES.account}"]),
        instrumentVisible: includesAny(["${APPROVED_LIVE_FILL_ONLY_VALUES.instrument}", "GME"]),
        buySideVisible: includesAny(["Köp", "Kop", "Buy", "Granska köp", "Granska kop"]),
        advancedLimitModeVisible: (includesAny(["Avancerad", "Advanced"]) && includesAny(["Limit", "Limitorder"])),
        amountFieldVisible: Boolean(amountField),
        priceFieldVisible: Boolean(priceField),
        reviewButtonVisible: includesAny(["Granska köp", "Granska kop"]),
        reviewModalOpen: finalConfirmVisible,
        finalConfirmVisible,
      },
      values: {
        amount: amountField && "value" in amountField ? amountField.value : null,
        price: priceField && "value" in priceField ? priceField.value : null,
        totalText: totalField ? normalize(totalField.innerText || totalField.textContent || "") : null,
      },
    };
  })()`;
}

function buildLiveFillOnlySetFieldExpression(field, value) {
  const selectors = field === "amount"
    ? AVANZA_LIVE_FILL_ONLY_SELECTORS.amount
    : AVANZA_LIVE_FILL_ONLY_SELECTORS.price;

  return `(() => {
    const selectors = ${JSON.stringify(selectors)};
    const value = ${JSON.stringify(value)};
    const visible = (element) => {
      if (!element) return false;
      const style = window.getComputedStyle(element);
      return style.display !== "none" &&
        style.visibility !== "hidden" &&
        style.opacity !== "0" &&
        (element.offsetWidth > 0 || element.offsetHeight > 0 || element.getClientRects().length > 0);
    };
    const element = selectors.map((selector) => document.querySelector(selector)).find(visible);
    if (!element || !("value" in element)) {
      return { ok: false, reason: "field_not_visible" };
    }
    const proto = Object.getPrototypeOf(element);
    const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
    if (descriptor && typeof descriptor.set === "function") {
      descriptor.set.call(element, value);
    } else {
      element.value = value;
    }
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
    return { ok: element.value === value, value: element.value };
  })()`;
}

async function getSingleAvanzaCdpTarget() {
  const cdpBaseUrl = normalizeManualObservationCdpUrl(
    process.env.AVANZA_LOCALHOST_BRIDGE_MANUAL_OBSERVATION_CDP_URL,
  );
  const targets = await listCdpTargets(cdpBaseUrl);
  const avanzaTargets = targets.filter(cdpTargetIsAvanzaPage);

  if (avanzaTargets.length !== 1) {
    throw new Error(
      avanzaTargets.length === 0
        ? "No Avanza page target was visible through the local CDP endpoint."
        : "Multiple Avanza page targets were visible through the local CDP endpoint.",
    );
  }

  if (!stringValue(avanzaTargets[0].webSocketDebuggerUrl)) {
    throw new Error("The Avanza target did not expose a CDP WebSocket URL.");
  }

  return avanzaTargets[0];
}

async function evaluateInSingleAvanzaTarget(expression) {
  const target = await getSingleAvanzaCdpTarget();

  const result = await sendReadonlyCdpCommand(
    target.webSocketDebuggerUrl,
    "Runtime.evaluate",
    {
      expression,
      returnByValue: true,
      awaitPromise: false,
      userGesture: false,
    },
  );

  return isObject(result?.result?.value) ? result.result.value : {};
}

function liveObservationPasses(observed) {
  const checks = isObject(observed?.checks) ? observed.checks : {};

  return (
    checks.avanzaPageVisible === true &&
    checks.accountVisible === true &&
    checks.instrumentVisible === true &&
    checks.buySideVisible === true &&
    checks.advancedLimitModeVisible === true &&
    checks.amountFieldVisible === true &&
    checks.priceFieldVisible === true &&
    checks.reviewButtonVisible === true &&
    checks.reviewModalOpen !== true &&
    checks.finalConfirmVisible !== true
  );
}

function liveObservationBlockers(observed) {
  const checks = isObject(observed?.checks) ? observed.checks : {};
  const pairs = [
    ["account_visible", checks.accountVisible === true],
    ["instrument_visible", checks.instrumentVisible === true],
    ["buy_side_visible", checks.buySideVisible === true],
    ["advanced_limit_mode_visible", checks.advancedLimitModeVisible === true],
    ["amount_field_visible", checks.amountFieldVisible === true],
    ["price_field_visible", checks.priceFieldVisible === true],
    ["granska_kop_visible", checks.reviewButtonVisible === true],
    ["no_review_modal_open", checks.reviewModalOpen !== true],
    ["no_final_confirm_visible", checks.finalConfirmVisible !== true],
  ];

  return pairs
    .filter(([, ok]) => ok !== true)
    .map(([name]) => `${name}:mismatch`);
}

function liveObservationReportOptions(observed, extra = {}) {
  return {
    verifiedAccount: APPROVED_LIVE_FILL_ONLY_VALUES.account,
    verifiedInstrument: APPROVED_LIVE_FILL_ONLY_VALUES.instrument,
    verifiedSide: APPROVED_LIVE_FILL_ONLY_VALUES.side,
    verifiedOrderMode: APPROVED_LIVE_FILL_ONLY_VALUES.orderMode,
    noReviewModalOpened: observed?.checks?.reviewModalOpen !== true,
    noFinalConfirmationVisibleOrClicked: observed?.checks?.finalConfirmVisible !== true,
    ...extra,
  };
}

async function verifyLiveFillOnlyVisibleState() {
  const observed = await evaluateInSingleAvanzaTarget(
    buildLiveFillOnlyObservationExpression(),
  );

  if (!liveObservationPasses(observed)) {
    return createLiveFillOnlyRunnerResponse("verifyVisibleOrderFormState", "aborted", {
      ...liveObservationReportOptions(observed),
      blockers: liveObservationBlockers(observed),
      errors: liveObservationBlockers(observed),
      note: "Visible order-form state did not match the approved fill-only preflight.",
    });
  }

  return createLiveFillOnlyRunnerResponse("verifyVisibleOrderFormState", "ok", {
    ...liveObservationReportOptions(observed),
    evidenceId: `visible-state-${Date.now()}`,
    note: "Approved visible order-form state verified.",
  });
}

async function fillLiveFillOnlyField(action, field, expectedNumericValue, expectedTextValue) {
  const before = await verifyLiveFillOnlyVisibleState();

  if (before.ok !== true) {
    return createLiveFillOnlyRunnerResponse(action, "aborted", {
      blockers: ["visible_state_mismatch_before_fill"],
      errors: ["visible_state_mismatch_before_fill"],
      note: "Aborted before fill because visible state verification failed.",
    });
  }

  const result = await evaluateInSingleAvanzaTarget(
    buildLiveFillOnlySetFieldExpression(field, expectedTextValue),
  );

  if (result.ok !== true || result.value !== expectedTextValue) {
    return createLiveFillOnlyRunnerResponse(action, "aborted", {
      blockers: [`${field}_field_fill_failed`],
      errors: [`${field}_field_fill_failed`],
      note: `${field} field did not confirm the approved value.`,
    });
  }

  const after = await evaluateInSingleAvanzaTarget(
    buildLiveFillOnlyObservationExpression(),
  );

  if (!liveObservationPasses(after)) {
    return createLiveFillOnlyRunnerResponse(action, "aborted", {
      ...liveObservationReportOptions(after),
      blockers: liveObservationBlockers(after),
      errors: liveObservationBlockers(after),
      note: "Aborted after fill because visible state became unsafe.",
    });
  }

  return createLiveFillOnlyRunnerResponse(action, "ok", {
    ...liveObservationReportOptions(after, {
      amountFieldFilled: field === "amount",
      priceFieldFilled: field === "price",
    }),
    evidenceId: `${field}-filled-${Date.now()}`,
    note: `${field} field filled with approved value ${expectedNumericValue}.`,
  });
}

async function readLiveFillOnlyTotalAmount() {
  const observed = await evaluateInSingleAvanzaTarget(
    buildLiveFillOnlyObservationExpression(),
  );

  if (!liveObservationPasses(observed)) {
    return createLiveFillOnlyRunnerResponse("readTotalAmount", "aborted", {
      ...liveObservationReportOptions(observed),
      blockers: liveObservationBlockers(observed),
      errors: liveObservationBlockers(observed),
      note: "Visible state was unsafe before total read.",
    });
  }

  const total = parseAmountSek(observed?.values?.totalText);

  if (!Number.isFinite(total)) {
    return createLiveFillOnlyRunnerResponse("readTotalAmount", "aborted", {
      ...liveObservationReportOptions(observed),
      blockers: ["total_amount_parse_failure"],
      errors: ["total_amount_parse_failure"],
      note: "Could not parse total amount from the visible order form.",
    });
  }

  if (total > APPROVED_LIVE_FILL_ONLY_VALUES.capSek) {
    return createLiveFillOnlyRunnerResponse("readTotalAmount", "aborted", {
      ...liveObservationReportOptions(observed, {
        observedTotalAmountSek: total,
      }),
      blockers: ["total_amount_above_cap"],
      errors: ["total_amount_above_cap"],
      note: "Parsed total amount is above the approved cap.",
    });
  }

  return createLiveFillOnlyRunnerResponse("readTotalAmount", "ok", {
    ...liveObservationReportOptions(observed, {
      observedTotalAmountSek: total,
    }),
    evidenceId: `total-read-${Date.now()}`,
    note: "Total amount read and cap checked.",
  });
}

async function captureLiveFillOnlyEvidence(payload) {
  const observed = await evaluateInSingleAvanzaTarget(
    buildLiveFillOnlyObservationExpression(),
  );
  const label = stringValue(payload?.label) ?? "live_fill_only_evidence";

  if (!liveObservationPasses(observed)) {
    return createLiveFillOnlyRunnerResponse("captureEvidence", "aborted", {
      ...liveObservationReportOptions(observed),
      blockers: liveObservationBlockers(observed),
      errors: liveObservationBlockers(observed),
      note: "Visible state was unsafe during evidence capture.",
    });
  }

  return createLiveFillOnlyRunnerResponse("captureEvidence", "ok", {
    ...liveObservationReportOptions(observed),
    evidenceId: `${label}-${Date.now()}`,
    note: "Sanitized visible-state evidence captured. No screenshot or raw text returned.",
    metadata: {
      evidence_label: label,
      raw_text_returned: false,
      screenshot_taken: false,
    },
  });
}

async function stopLiveFillOnlyBeforeReview() {
  const observed = await evaluateInSingleAvanzaTarget(
    buildLiveFillOnlyObservationExpression(),
  );

  if (!liveObservationPasses(observed)) {
    return createLiveFillOnlyRunnerResponse("stopBeforeReview", "aborted", {
      ...liveObservationReportOptions(observed),
      blockers: liveObservationBlockers(observed),
      errors: liveObservationBlockers(observed),
      note: "Visible state was unsafe at stop-before-review.",
    });
  }

  return createLiveFillOnlyRunnerResponse("stopBeforeReview", "ok", {
    ...liveObservationReportOptions(observed, {
      stoppedBeforeReview: true,
    }),
    evidenceId: `stopped-before-review-${Date.now()}`,
    note: "Stopped before Granska köp. No review/final/submit/order action exists in this runner.",
  });
}

async function buildLiveFillOnlyRunnerEndpointResponse(action, payload = {}) {
  const gateResponse = liveFillOnlyRunnerGate(action);

  if (gateResponse) {
    return gateResponse;
  }

  try {
    if (action === "verifyVisibleOrderFormState") {
      return await verifyLiveFillOnlyVisibleState();
    }

    if (action === "fillAmountField") {
      const amount = numberFromInput(payload?.amountSek);

      if (amount !== APPROVED_LIVE_FILL_ONLY_VALUES.amountSek) {
        return createLiveFillOnlyRunnerResponse(action, "blocked", {
          blockers: ["amount_mismatch"],
          errors: ["amount_mismatch"],
          note: "Only the approved amount may be filled.",
        });
      }

      return await fillLiveFillOnlyField(
        action,
        "amount",
        APPROVED_LIVE_FILL_ONLY_VALUES.amountSek,
        APPROVED_LIVE_FILL_ONLY_VALUES.amountSekText,
      );
    }

    if (action === "fillPriceField") {
      const price = numberFromInput(payload?.priceUsd);

      if (price !== APPROVED_LIVE_FILL_ONLY_VALUES.priceUsd) {
        return createLiveFillOnlyRunnerResponse(action, "blocked", {
          blockers: ["price_mismatch"],
          errors: ["price_mismatch"],
          note: "Only the approved price may be filled.",
        });
      }

      return await fillLiveFillOnlyField(
        action,
        "price",
        APPROVED_LIVE_FILL_ONLY_VALUES.priceUsd,
        APPROVED_LIVE_FILL_ONLY_VALUES.priceUsdText,
      );
    }

    if (action === "readTotalAmount") {
      return await readLiveFillOnlyTotalAmount();
    }

    if (action === "captureEvidence") {
      return await captureLiveFillOnlyEvidence(payload);
    }

    if (action === "stopBeforeReview") {
      return await stopLiveFillOnlyBeforeReview();
    }

    return createLiveFillOnlyRunnerResponse(action, "blocked", {
      blockers: ["unsupported_runner_method"],
      errors: ["unsupported_runner_method"],
      note: "Unsupported live fill-only runner action.",
    });
  } catch (error) {
    return createLiveFillOnlyRunnerResponse(action, "aborted", {
      blockers: ["runner_exception"],
      errors: [
        error instanceof Error ? error.message : "Unknown live fill-only runner error.",
      ],
      note: "Live fill-only runner aborted safely.",
    });
  }
}

function createReviewClickResult(status, dryRunOrderInput, options = {}) {
  const instrument = isObject(dryRunOrderInput?.instrument)
    ? dryRunOrderInput.instrument
    : { ticker: "UNKNOWN" };
  const labelsByStatus = {
    unavailable: ["Review click unavailable"],
    form_not_ready: ["Advanced form not ready"],
    review_click_allowed: ["Review click allowed"],
    confirmation_detected: ["Confirmation modal detected"],
    confirmation_ready: ["Confirmation ready for manual final confirmation"],
    confirmation_mismatch: ["Confirmation readback mismatch"],
    validation_error: ["Confirmation validation error"],
    prohibited_final_confirm_detected: ["Prohibited Bekräfta detected"],
    blocked: ["Review click blocked"],
    failed: ["Review click failed"],
  };

  return {
    ok: status === "confirmation_ready",
    status,
    checkedAt: options.checkedAt ?? now(),
    expectedAction:
      dryRunOrderInput?.action === "buy" || dryRunOrderInput?.action === "sell"
        ? dryRunOrderInput.action
        : "buy",
    expectedInstrument: {
      ticker: stringValue(instrument?.ticker) ?? "",
      ...(stringValue(instrument?.name)
        ? { name: stringValue(instrument.name) }
        : {}),
      ...(stringValue(instrument?.market)
        ? { market: stringValue(instrument.market) }
        : {}),
      ...(stringValue(instrument?.currency)
        ? { currency: stringValue(instrument.currency) }
        : {}),
      ...(stringValue(instrument?.instrumentType)
        ? { instrumentType: stringValue(instrument.instrumentType) }
        : {}),
    },
    expectedQuantity: numberFromInput(dryRunOrderInput?.quantity) ?? 1,
    expectedPrice: numberFromInput(dryRunOrderInput?.price) ?? 1,
    ...(options.confirmationReadback
      ? { confirmationReadback: options.confirmationReadback }
      : {}),
    fieldChecks: options.fieldChecks ?? [],
    riskFlags: [...new Set(options.riskFlags ?? [])],
    blockers: [...new Set(options.blockers ?? [])],
    warnings: [...new Set(options.warnings ?? [])],
    errors: [...new Set(options.errors ?? [])],
    labels: [
      ...new Set([
        "Review click / confirmation readback only",
        "No Bekräfta click",
        "Manual final confirmation required",
        "No order submission",
        "No broker result",
        "No trade mutation",
        ...(labelsByStatus[status] ?? []),
        ...(options.labels ?? []),
      ]),
    ],
    metadata: {
      ...(options.metadata ?? {}),
      contractVersion: AVANZA_REVIEW_CLICK_CONTRACT_VERSION,
      reviewClickReadbackOnly: true,
      waitingForManualConfirmation: status === "confirmation_ready",
      noFinalConfirmClick: true,
      noKeyboardSubmit: true,
      noBrokerSubmission: true,
      noBrokerResult: true,
      noSupabaseWrite: true,
      noTradeMutation: true,
    },
  };
}

function createConfirmationReadback(dryRunOrderInput, options = {}) {
  const instrument = isObject(dryRunOrderInput?.instrument)
    ? dryRunOrderInput.instrument
    : { ticker: "UNKNOWN" };

  return {
    action:
      stringValue(options.action) ??
      (dryRunOrderInput?.action === "buy" || dryRunOrderInput?.action === "sell"
        ? dryRunOrderInput.action
        : "buy"),
    ticker: stringValue(options.ticker) ?? stringValue(instrument.ticker) ?? "",
    ...(stringValue(options.name) ?? stringValue(instrument.name)
      ? { name: stringValue(options.name) ?? stringValue(instrument.name) }
      : {}),
    ...(stringValue(options.market) ?? stringValue(instrument.market)
      ? {
          market:
            stringValue(options.market) ?? stringValue(instrument.market),
        }
      : {}),
    ...(stringValue(options.currency) ?? stringValue(instrument.currency)
      ? {
          currency:
            stringValue(options.currency) ?? stringValue(instrument.currency),
        }
      : {}),
    ...(stringValue(options.instrumentType) ??
    stringValue(instrument.instrumentType)
      ? {
          instrumentType:
            stringValue(options.instrumentType) ??
            stringValue(instrument.instrumentType),
        }
      : {}),
    quantityValue:
      typeof options.quantityValue !== "undefined"
        ? options.quantityValue
        : dryRunOrderInput?.quantity,
    priceValue:
      typeof options.priceValue !== "undefined"
        ? options.priceValue
        : dryRunOrderInput?.price,
    accountLabelSanitized:
      stringValue(options.accountLabelSanitized) ?? "Manual review account",
    fees: typeof options.fees !== "undefined" ? options.fees : "1.00",
    totalAmount:
      typeof options.totalAmount !== "undefined"
        ? options.totalAmount
        : String(
            ((numberFromInput(dryRunOrderInput?.quantity) ?? 1) *
              (numberFromInput(dryRunOrderInput?.price) ?? 1) +
              1).toFixed(2),
          ),
    validUntil: stringValue(options.validUntil) ?? "2026-06-12",
    confirmationModalVisible: options.confirmationModalVisible !== false,
    cancelButtonVisible: options.cancelButtonVisible !== false,
    finalConfirmVisible: options.finalConfirmVisible !== false,
    finalConfirmLabel:
      stringValue(options.finalConfirmLabel) ??
      (dryRunOrderInput?.action === "sell" ? "Bekräfta sälj" : "Bekräfta köp"),
    validationErrors: Array.isArray(options.validationErrors)
      ? options.validationErrors
      : [],
    sensitiveSignals: isObject(options.sensitiveSignals)
      ? options.sensitiveSignals
      : {
          accountDataDetected: false,
          balanceDataDetected: false,
          holdingsDataDetected: false,
          sensitiveDataDetected: false,
        },
    interactionSignals: isObject(options.interactionSignals)
      ? options.interactionSignals
      : {
          finalConfirmClickedOrAttempted: false,
          keyboardSubmitDetected: false,
        },
    metadata: {
      synthetic_stub: true,
      no_browser_inspection: true,
    },
  };
}

function createReviewClickFieldCheck(
  field,
  expected,
  actual,
  required,
  options = {},
) {
  const expectedText = textValue(expected);
  const actualText = textValue(actual);

  if (!expectedText) {
    return {
      field,
      actual: actualText || undefined,
      status: "missing_expected",
      required: false,
      message:
        options.missingExpectedMessage ??
        `Expected ${field} is missing; confirmation confidence is lower.`,
    };
  }

  if (!actualText) {
    return {
      field,
      expected: expectedText,
      status: "missing_modal",
      required,
      message:
        options.missingModalMessage ??
        `Confirmation modal ${field} is missing.`,
    };
  }

  if (
    (options.numeric === true &&
      numberFromInput(expected) !== null &&
      numberFromInput(actual) !== null &&
      Math.abs(numberFromInput(expected) - numberFromInput(actual)) <=
        (options.tolerance ?? 0)) ||
    normalizeSearchText(expectedText) === normalizeSearchText(actualText)
  ) {
    return {
      field,
      expected: expectedText,
      actual: actualText,
      status: "match",
      required,
    };
  }

  return {
    field,
    expected: expectedText,
    actual: actualText,
    status: "mismatch",
    required,
    message:
      options.mismatchMessage ??
      `Confirmation modal ${field} does not match.`,
  };
}

function reviewLabelMatches(action, label) {
  const normalized = normalizeSearchText(label);
  const expected =
    action === "sell"
      ? new Set(["granska sälj", "granska salj"])
      : new Set(["granska köp", "granska kop"]);

  return expected.has(normalized);
}

function evaluateReviewClickStub(
  dryRunOrderInput,
  advancedFormFillResult,
  confirmationReadback,
  checkedAt,
  options = {},
) {
  if (
    !isObject(advancedFormFillResult) ||
    advancedFormFillResult.ok !== true ||
    advancedFormFillResult.status !== "form_filled"
  ) {
    const blocker =
      stringValue(advancedFormFillResult?.blockers?.[0]) ??
      stringValue(advancedFormFillResult?.errors?.[0]) ??
      `Advanced form must be form_filled before review; received ${
        stringValue(advancedFormFillResult?.status) ?? "missing"
      }.`;

    return createReviewClickResult("form_not_ready", dryRunOrderInput, {
      checkedAt,
      blockers: [blocker],
      errors: [blocker],
      riskFlags: ["form_not_filled"],
    });
  }

  if (
    stringValue(options.reviewLabel) &&
    !reviewLabelMatches(dryRunOrderInput.action, options.reviewLabel)
  ) {
    const blocker =
      "Review/Granska label does not match the dry-run request action.";

    return createReviewClickResult("blocked", dryRunOrderInput, {
      checkedAt,
      blockers: [blocker],
      errors: [blocker],
      riskFlags: ["review_label_mismatch"],
    });
  }

  if (!isObject(confirmationReadback)) {
    const blocker = "Sanitized confirmation modal readback is required.";

    return createReviewClickResult("unavailable", dryRunOrderInput, {
      checkedAt,
      blockers: [blocker],
      errors: [blocker],
      riskFlags: ["confirmation_modal_missing"],
      warnings: ["No browser confirmation modal was inspected by this stub."],
    });
  }

  const riskFlags = [];
  const blockers = [];
  const warnings = [];
  const errors = [];

  if (options.reviewClickAttempted === true) {
    riskFlags.push("review_click_attempted");
    warnings.push(
      "Review/Granska click attempt is represented as synthetic diagnostics only.",
    );
  }

  if (confirmationReadback.confirmationModalVisible !== true) {
    const blocker = "Confirmation modal is not visible.";

    return createReviewClickResult("failed", dryRunOrderInput, {
      checkedAt,
      confirmationReadback,
      blockers: [blocker],
      errors: [blocker],
      riskFlags: ["confirmation_modal_missing"],
    });
  }

  if (
    Array.isArray(confirmationReadback.validationErrors) &&
    confirmationReadback.validationErrors.length > 0
  ) {
    return createReviewClickResult("validation_error", dryRunOrderInput, {
      checkedAt,
      confirmationReadback,
      blockers: confirmationReadback.validationErrors,
      errors: confirmationReadback.validationErrors,
      riskFlags: ["validation_error_visible"],
    });
  }

  if (
    confirmationReadback.interactionSignals?.finalConfirmClickedOrAttempted ||
    options.finalConfirmClickedOrAttempted === true
  ) {
    const blocker =
      "Final-confirm/Bekrafta click was attempted during review-click phase.";

    return createReviewClickResult(
      "prohibited_final_confirm_detected",
      dryRunOrderInput,
      {
        checkedAt,
        confirmationReadback,
        blockers: [blocker],
        errors: [blocker],
        riskFlags: ["final_confirm_clicked_or_attempted"],
      },
    );
  }

  if (
    confirmationReadback.interactionSignals?.keyboardSubmitDetected ||
    options.keyboardSubmitDetected === true
  ) {
    riskFlags.push("keyboard_submit_detected");
    blockers.push("Keyboard submit was detected during review-click phase.");
  }

  for (const [key, risk, message] of [
    [
      "accountDataDetected",
      "account_data_detected",
      "Account data detected in confirmation readback.",
    ],
    [
      "balanceDataDetected",
      "balance_data_detected",
      "Balance data detected in confirmation readback.",
    ],
    [
      "holdingsDataDetected",
      "holdings_data_detected",
      "Holdings data detected in confirmation readback.",
    ],
    [
      "sensitiveDataDetected",
      "sensitive_data_detected",
      "Sensitive data detected in confirmation readback.",
    ],
  ]) {
    if (confirmationReadback.sensitiveSignals?.[key]) {
      riskFlags.push(risk);
      blockers.push(message);
    }
  }

  if (blockers.length > 0) {
    return createReviewClickResult("blocked", dryRunOrderInput, {
      checkedAt,
      confirmationReadback,
      blockers,
      errors: blockers,
      riskFlags,
    });
  }

  if (confirmationReadback.finalConfirmVisible) {
    riskFlags.push("final_confirm_visible");
    warnings.push(
      "Final-confirm/Bekrafta control is visible as read-only evidence only.",
    );
  }

  const instrument = dryRunOrderInput.instrument ?? {};
  const fieldChecks = [
    createReviewClickFieldCheck(
      "action",
      dryRunOrderInput.action,
      confirmationReadback.action,
      true,
      {
        mismatchMessage:
          "Confirmation modal action does not match expected action.",
      },
    ),
    createReviewClickFieldCheck(
      "ticker",
      instrument.ticker,
      confirmationReadback.ticker,
      true,
      {
        mismatchMessage:
          "Confirmation modal ticker does not match expected ticker.",
      },
    ),
    createReviewClickFieldCheck(
      "quantity",
      dryRunOrderInput.quantity,
      confirmationReadback.quantityValue,
      true,
      {
        numeric: true,
        mismatchMessage:
          "Confirmation modal quantity does not match expected quantity.",
      },
    ),
    createReviewClickFieldCheck(
      "price",
      dryRunOrderInput.price,
      confirmationReadback.priceValue,
      true,
      {
        numeric: true,
        tolerance: 0.0001,
        mismatchMessage:
          "Confirmation modal price does not match expected price.",
      },
    ),
  ];

  for (const check of fieldChecks) {
    if (check.status === "mismatch" || check.status === "missing_modal") {
      const riskByField = {
        action: "confirmation_action_mismatch",
        ticker: "confirmation_ticker_mismatch",
        quantity: "confirmation_quantity_mismatch",
        price: "confirmation_price_mismatch",
      };
      const message = check.message ?? `Confirmation ${check.field} mismatch.`;
      riskFlags.push(
        riskByField[check.field] ?? "confirmation_missing_core_field",
      );
      blockers.push(message);
      errors.push(message);
    }
  }

  if (typeof confirmationReadback.fees === "undefined") {
    warnings.push("Confirmation modal fees/courtage are missing.");
  }

  if (typeof confirmationReadback.totalAmount === "undefined") {
    warnings.push("Confirmation modal total amount is missing.");
  }

  if (!stringValue(confirmationReadback.validUntil)) {
    warnings.push("Confirmation modal valid-until value is missing.");
  }

  if (blockers.length > 0) {
    return createReviewClickResult("confirmation_mismatch", dryRunOrderInput, {
      checkedAt,
      confirmationReadback,
      fieldChecks,
      riskFlags,
      blockers,
      warnings,
      errors,
    });
  }

  return createReviewClickResult("confirmation_ready", dryRunOrderInput, {
    checkedAt,
    confirmationReadback,
    fieldChecks,
    riskFlags,
    warnings,
  });
}

function validateReviewClickPayload(payload) {
  const errors = [];

  if (!isObject(payload)) {
    return ["Review-click payload must be a JSON object."];
  }

  if (payload.version !== CONTRACT_VERSION) {
    errors.push(`Review-click request version must be ${CONTRACT_VERSION}.`);
  }

  if (!stringValue(payload.requestId)) {
    errors.push("Review-click request requestId is missing.");
  }

  if (!stringValue(payload.createdAt) || !Number.isFinite(Date.parse(payload.createdAt))) {
    errors.push("Review-click request createdAt must be a valid timestamp.");
  }

  const dryRunValidation = validateAvanzaDryRunOrderInput(
    payload.dryRunOrderInput,
  );
  errors.push(...dryRunValidation.errors);

  if (
    typeof payload.advancedFormFillResult !== "undefined" &&
    !isObject(payload.advancedFormFillResult)
  ) {
    errors.push(
      "Review-click request advancedFormFillResult must be an object when provided.",
    );
  }

  if (
    typeof payload.confirmationReadback !== "undefined" &&
    !isObject(payload.confirmationReadback)
  ) {
    errors.push(
      "Review-click request confirmationReadback must be an object when provided.",
    );
  }

  if (hasUnsafeDryRunMetadata(payload.metadata)) {
    errors.push(
      "Review-click request metadata contains unsafe submit or broker automation flags.",
    );
  }

  return errors;
}

function buildReviewClickResponse(payload) {
  const receivedAt = now();
  const checkedAt = receivedAt;
  const requestId =
    stringValue(payload?.requestId) ?? "unknown_review_click_request";
  const errors = validateReviewClickPayload(payload);
  const dryRunValidation = validateAvanzaDryRunOrderInput(
    payload?.dryRunOrderInput,
  );
  const dryRunOrderInput = dryRunValidation.normalized ?? {
    action: "buy",
    instrument: { ticker: "UNKNOWN" },
    quantity: 1,
    price: 1,
    orderMode: "advanced",
    accountPolicy: "require_manual_review",
    stopPolicy: "stop_at_confirmation_modal",
    createdAt: checkedAt,
  };
  const mode =
    stringValue(process.env.AVANZA_LOCALHOST_BRIDGE_REVIEW_CLICK_MODE) ??
    "unavailable";
  const supportedModes = new Set([
    "unavailable",
    "confirmation_ready_buy",
    "confirmation_ready_sell",
    "confirmation_mismatch_action",
    "confirmation_mismatch_ticker",
    "confirmation_mismatch_quantity",
    "confirmation_mismatch_price",
    "validation_error",
    "final_confirm_visible_read_only",
    "prohibited_final_confirm_detected",
    "blocked_keyboard_submit",
    "blocked_sensitive",
    "review_label_mismatch",
    "confirmation_modal_missing",
    "form_not_ready",
  ]);
  const normalizedMode = supportedModes.has(mode) ? mode : "unavailable";
  let advancedFormFillResult = isObject(payload?.advancedFormFillResult)
    ? payload.advancedFormFillResult
    : createAdvancedFormFillResult("form_filled", dryRunOrderInput, {
        checkedAt,
        formState: createAdvancedFormState(dryRunOrderInput),
      });
  let confirmationReadback = isObject(payload?.confirmationReadback)
    ? payload.confirmationReadback
    : createConfirmationReadback(dryRunOrderInput);
  let reviewLabel =
    stringValue(payload?.reviewLabel) ??
    (dryRunOrderInput.action === "sell" ? "Granska sälj" : "Granska köp");
  let reviewClickAttempted = payload?.reviewClickAttempted === true;
  let reviewClick;

  if (errors.length > 0) {
    reviewClick = createReviewClickResult("failed", dryRunOrderInput, {
      checkedAt,
      blockers: errors,
      errors,
    });
  } else if (normalizedMode === "unavailable") {
    reviewClick = createReviewClickResult("unavailable", dryRunOrderInput, {
      checkedAt,
      blockers: ["Review-click runner is not implemented."],
      errors: ["Review-click runner is not implemented."],
      warnings: ["No browser confirmation modal was inspected by this stub."],
    });
  } else {
    if (normalizedMode === "confirmation_ready_buy") {
      dryRunOrderInput.action = "buy";
      reviewLabel = "Granska köp";
      confirmationReadback = createConfirmationReadback(dryRunOrderInput);
    } else if (normalizedMode === "confirmation_ready_sell") {
      dryRunOrderInput.action = "sell";
      reviewLabel = "Granska sälj";
      confirmationReadback = createConfirmationReadback(dryRunOrderInput);
    } else if (normalizedMode === "form_not_ready") {
      advancedFormFillResult = createAdvancedFormFillResult(
        "field_mismatch",
        dryRunOrderInput,
        {
          checkedAt,
          blockers: ["Synthetic advanced form is not filled."],
          errors: ["Synthetic advanced form is not filled."],
          riskFlags: ["quantity_mismatch"],
        },
      );
    } else if (normalizedMode === "confirmation_modal_missing") {
      confirmationReadback = createConfirmationReadback(dryRunOrderInput, {
        confirmationModalVisible: false,
      });
    } else {
      confirmationReadback = createConfirmationReadback(dryRunOrderInput, {
        ...(normalizedMode === "confirmation_mismatch_action"
          ? { action: dryRunOrderInput.action === "buy" ? "sell" : "buy" }
          : {}),
        ...(normalizedMode === "confirmation_mismatch_ticker"
          ? { ticker: "NO.MATCH" }
          : {}),
        ...(normalizedMode === "confirmation_mismatch_quantity"
          ? { quantityValue: Number(dryRunOrderInput.quantity) + 1 }
          : {}),
        ...(normalizedMode === "confirmation_mismatch_price"
          ? { priceValue: Number(dryRunOrderInput.price) + 1 }
          : {}),
        ...(normalizedMode === "validation_error"
          ? { validationErrors: ["Synthetic confirmation validation error."] }
          : {}),
        ...(normalizedMode === "prohibited_final_confirm_detected"
          ? {
              interactionSignals: {
                finalConfirmClickedOrAttempted: true,
                keyboardSubmitDetected: false,
              },
            }
          : {}),
        ...(normalizedMode === "blocked_keyboard_submit"
          ? {
              interactionSignals: {
                finalConfirmClickedOrAttempted: false,
                keyboardSubmitDetected: true,
              },
            }
          : {}),
        ...(normalizedMode === "blocked_sensitive"
          ? {
              sensitiveSignals: {
                accountDataDetected: true,
                balanceDataDetected: true,
                holdingsDataDetected: true,
                sensitiveDataDetected: true,
              },
            }
          : {}),
      });
    }

    if (normalizedMode === "review_label_mismatch") {
      reviewLabel = dryRunOrderInput.action === "buy" ? "Granska sälj" : "Granska köp";
    }

    reviewClickAttempted =
      normalizedMode === "confirmation_ready_buy" ||
      normalizedMode === "confirmation_ready_sell" ||
      normalizedMode === "final_confirm_visible_read_only" ||
      reviewClickAttempted;

    reviewClick = evaluateReviewClickStub(
      dryRunOrderInput,
      advancedFormFillResult,
      confirmationReadback,
      checkedAt,
      {
        reviewClickAttempted,
        reviewLabel,
      },
    );
  }

  const statusCode =
    errors.length > 0 ||
    reviewClick.status === "blocked" ||
    reviewClick.status === "failed" ||
    reviewClick.status === "confirmation_mismatch" ||
    reviewClick.status === "validation_error" ||
    reviewClick.status === "prohibited_final_confirm_detected"
      ? 400
      : reviewClick.status === "unavailable" ||
          reviewClick.status === "form_not_ready"
        ? 501
        : 200;
  const baseWarnings = [
    "Review-click runner is not implemented.",
    "No browser actions were executed.",
    "No Avanza page was touched.",
    "No real Granska was clicked.",
    "No Bekräfta was clicked.",
    "No broker result was created.",
  ];

  return {
    statusCode,
    body: {
      version: CONTRACT_VERSION,
      ok: reviewClick.ok,
      bridgeVersion: CONTRACT_VERSION,
      requestId,
      receivedAt,
      completedAt: now(),
      reviewClick,
      message:
        reviewClick.status === "confirmation_ready"
          ? "Localhost bridge review-click stub returned synthetic confirmation-ready diagnostics. No browser was controlled."
          : "Localhost bridge review-click stub completed safely. No browser was controlled.",
      errors: [...new Set([...errors, ...reviewClick.errors])],
      warnings: [...new Set([...baseWarnings, ...reviewClick.warnings])],
      metadata: {
        ...(isObject(payload?.metadata) ? payload.metadata : {}),
        localhost_bridge_stub: true,
        review_click_endpoint_stub: true,
        review_click_mode: normalizedMode,
        synthetic_confirmation_ready:
          reviewClick.status === "confirmation_ready",
        no_browser_control: true,
        no_browser_actions_executed: true,
        no_avanza_page_touched: true,
        no_avanza_urls: true,
        no_avanza_selectors: true,
        no_real_granska_clicked: true,
        no_bekrafta_clicked: true,
        no_final_confirm_click: true,
        no_broker_submission: true,
        no_broker_result_created: true,
        no_supabase_write: true,
        no_trade_mutation: true,
      },
    },
  };
}

function createManualConfirmationWaitResult(
  status,
  reviewClickResult,
  options = {},
) {
  const labelsByStatus = {
    unavailable: ["Manual confirmation wait unavailable"],
    confirmation_not_ready: ["Confirmation not ready"],
    waiting_for_manual_confirmation: ["Waiting for manual confirmation"],
    user_cancelled: ["User cancelled manually"],
    user_confirmed_unverified: ["User confirmed unverified"],
    timed_out: ["Manual confirmation wait timed out"],
    blocked: ["Manual confirmation wait blocked"],
    failed: ["Manual confirmation wait failed"],
  };

  return {
    ok: status === "waiting_for_manual_confirmation",
    status,
    checkedAt: options.checkedAt ?? now(),
    reviewClickStatus: stringValue(reviewClickResult?.status) ?? "failed",
    waitingForManualConfirmation: status === "waiting_for_manual_confirmation",
    ...(isObject(options.observation)
      ? { observation: normalizeManualConfirmationWaitObservation(options.observation) }
      : {}),
    riskFlags: [...new Set(options.riskFlags ?? [])],
    blockers: [...new Set(options.blockers ?? [])],
    warnings: [...new Set(options.warnings ?? [])],
    errors: [...new Set(options.errors ?? [])],
    labels: [
      ...new Set([
        "Manual confirmation wait only",
        "Human final action required",
        "No Bekräfta by agent",
        "No broker result",
        "No trade mutation",
        "Separate confirmation capture required",
        ...(labelsByStatus[status] ?? []),
        ...(options.labels ?? []),
      ]),
    ],
    metadata: {
      ...(options.metadata ?? {}),
      contractVersion: AVANZA_MANUAL_CONFIRMATION_WAIT_CONTRACT_VERSION,
      manualConfirmationWaitOnly: true,
      noFinalConfirmClick: true,
      noKeyboardSubmit: true,
      noBrokerResult: true,
      noSupabaseWrite: true,
      noTradeMutation: true,
      separateConfirmationCaptureRequired: true,
    },
  };
}

function normalizeManualConfirmationWaitObservation(observation) {
  return {
    modalStillVisible: observation.modalStillVisible === true,
    finalConfirmVisible: observation.finalConfirmVisible === true,
    cancelButtonVisible: observation.cancelButtonVisible === true,
    userCancelled: observation.userCancelled === true,
    userConfirmed: observation.userConfirmed === true,
    timedOut: observation.timedOut === true,
    ...(typeof observation.elapsedMs === "number" &&
    Number.isFinite(observation.elapsedMs)
      ? { elapsedMs: observation.elapsedMs }
      : {}),
    ...(isObject(observation.interactionSignals)
      ? {
          interactionSignals: {
            finalConfirmClickedByAgentOrAttempted:
              observation.interactionSignals
                .finalConfirmClickedByAgentOrAttempted === true,
            keyboardSubmitDetected:
              observation.interactionSignals.keyboardSubmitDetected === true,
          },
        }
      : {}),
    ...(isObject(observation.unexpectedSignals)
      ? {
          unexpectedSignals: {
            brokerResultDetected:
              observation.unexpectedSignals.brokerResultDetected === true,
            tradeMutationDetected:
              observation.unexpectedSignals.tradeMutationDetected === true,
          },
        }
      : {}),
    ...(isObject(observation.sensitiveSignals)
      ? {
          sensitiveSignals: {
            accountDataDetected:
              observation.sensitiveSignals.accountDataDetected === true,
            balanceDataDetected:
              observation.sensitiveSignals.balanceDataDetected === true,
            holdingsDataDetected:
              observation.sensitiveSignals.holdingsDataDetected === true,
            sensitiveDataDetected:
              observation.sensitiveSignals.sensitiveDataDetected === true,
          },
        }
      : {}),
    ...(isObject(observation.metadata)
      ? { metadata: { ...observation.metadata } }
      : {}),
  };
}

function createFallbackReviewClickResult(status = "confirmation_ready") {
  return createReviewClickResult(
    status,
    {
      action: "buy",
      instrument: { ticker: "UNKNOWN" },
      quantity: 1,
      price: 1,
      orderMode: "advanced",
      accountPolicy: "require_manual_review",
      stopPolicy: "stop_at_confirmation_modal",
      createdAt: now(),
    },
    {
      ...(status === "confirmation_ready"
        ? { confirmationReadback: createConfirmationReadback({ action: "buy", instrument: { ticker: "UNKNOWN" }, quantity: 1, price: 1 }) }
        : {}),
    },
  );
}

function evaluateManualConfirmationWaitStub(
  reviewClickResult,
  observation,
  checkedAt,
  options = {},
) {
  const timeoutMs =
    typeof options.timeoutMs === "number" &&
    Number.isFinite(options.timeoutMs) &&
    options.timeoutMs > 0
      ? options.timeoutMs
      : 300000;
  const metadata = {
    ...(options.metadata ?? {}),
    timeoutMs,
  };

  if (
    !isObject(reviewClickResult) ||
    reviewClickResult.status !== "confirmation_ready" ||
    reviewClickResult.ok !== true ||
    reviewClickResult.metadata?.waitingForManualConfirmation !== true
  ) {
    const blocker =
      "Review-click confirmation_ready result is required before manual confirmation wait.";

    return createManualConfirmationWaitResult(
      "confirmation_not_ready",
      isObject(reviewClickResult)
        ? reviewClickResult
        : createFallbackReviewClickResult("failed"),
      {
        checkedAt,
        riskFlags: ["confirmation_not_ready"],
        blockers: [blocker],
        errors: [blocker],
        metadata,
      },
    );
  }

  if (!isObject(observation)) {
    return createManualConfirmationWaitResult(
      "waiting_for_manual_confirmation",
      reviewClickResult,
      {
        checkedAt,
        warnings: [
          "Waiting for human action. No broker result is captured in this phase.",
        ],
        metadata,
      },
    );
  }

  const normalizedObservation =
    normalizeManualConfirmationWaitObservation(observation);
  const riskFlags = [];
  const blockers = [];
  const warnings = [];

  if (normalizedObservation.finalConfirmVisible) {
    riskFlags.push("final_confirm_visible_read_only");
    warnings.push(
      "Final-confirm control is visible as read-only evidence only.",
    );
  }

  if (
    normalizedObservation.interactionSignals
      ?.finalConfirmClickedByAgentOrAttempted
  ) {
    riskFlags.push("final_confirm_clicked_by_agent_or_attempted");
    blockers.push(
      "Agent attempted final confirmation during manual confirmation wait.",
    );
  }

  if (normalizedObservation.interactionSignals?.keyboardSubmitDetected) {
    riskFlags.push("keyboard_submit_detected");
    blockers.push(
      "Keyboard submit was detected during manual confirmation wait.",
    );
  }

  if (normalizedObservation.unexpectedSignals?.brokerResultDetected) {
    riskFlags.push("broker_result_detected_unexpectedly");
    blockers.push(
      "Broker result was detected unexpectedly during manual confirmation wait.",
    );
  }

  if (normalizedObservation.unexpectedSignals?.tradeMutationDetected) {
    riskFlags.push("trade_mutation_detected_unexpectedly");
    blockers.push(
      "Trade mutation was detected unexpectedly during manual confirmation wait.",
    );
  }

  for (const [key, risk, message] of [
    [
      "accountDataDetected",
      "account_data_detected",
      "Account data detected during manual confirmation wait.",
    ],
    [
      "balanceDataDetected",
      "balance_data_detected",
      "Balance data detected during manual confirmation wait.",
    ],
    [
      "holdingsDataDetected",
      "holdings_data_detected",
      "Holdings data detected during manual confirmation wait.",
    ],
    [
      "sensitiveDataDetected",
      "sensitive_data_detected",
      "Sensitive data detected during manual confirmation wait.",
    ],
  ]) {
    if (normalizedObservation.sensitiveSignals?.[key]) {
      riskFlags.push(risk);
      blockers.push(message);
    }
  }

  if (blockers.length > 0) {
    return createManualConfirmationWaitResult("blocked", reviewClickResult, {
      checkedAt,
      observation: normalizedObservation,
      riskFlags,
      blockers,
      errors: blockers,
      warnings,
      metadata,
    });
  }

  if (normalizedObservation.userCancelled) {
    return createManualConfirmationWaitResult(
      "user_cancelled",
      reviewClickResult,
      {
        checkedAt,
        observation: normalizedObservation,
        riskFlags: [...riskFlags, "user_cancelled"],
        warnings: [
          ...warnings,
          "User cancelled manually. No trade mutation occurred.",
        ],
        metadata,
      },
    );
  }

  if (
    normalizedObservation.timedOut ||
    (typeof normalizedObservation.elapsedMs === "number" &&
      normalizedObservation.elapsedMs > timeoutMs)
  ) {
    return createManualConfirmationWaitResult("timed_out", reviewClickResult, {
      checkedAt,
      observation: normalizedObservation,
      riskFlags: [...riskFlags, "timeout_elapsed"],
      warnings: [
        ...warnings,
        "Manual confirmation wait timed out. No trade mutation occurred.",
      ],
      metadata,
    });
  }

  if (normalizedObservation.userConfirmed) {
    return createManualConfirmationWaitResult(
      "user_confirmed_unverified",
      reviewClickResult,
      {
        checkedAt,
        observation: normalizedObservation,
        riskFlags: [...riskFlags, "user_confirmed_unverified"],
        warnings: [
          ...warnings,
          "User appears to have confirmed, but broker result is not captured. Separate confirmation capture is required.",
        ],
        metadata,
      },
    );
  }

  return createManualConfirmationWaitResult(
    "waiting_for_manual_confirmation",
    reviewClickResult,
    {
      checkedAt,
      observation: normalizedObservation,
      riskFlags,
      warnings: [
        ...warnings,
        "Waiting for human action. No broker result is captured in this phase.",
      ],
      metadata,
    },
  );
}

function validateManualConfirmationWaitPayload(payload) {
  const errors = [];

  if (!isObject(payload)) {
    return ["Manual confirmation wait payload must be a JSON object."];
  }

  if (payload.version !== CONTRACT_VERSION) {
    errors.push(
      `Manual confirmation wait request version must be ${CONTRACT_VERSION}.`,
    );
  }

  if (!stringValue(payload.requestId)) {
    errors.push("Manual confirmation wait request requestId is missing.");
  }

  if (
    !stringValue(payload.createdAt) ||
    !Number.isFinite(Date.parse(payload.createdAt))
  ) {
    errors.push(
      "Manual confirmation wait request createdAt must be a valid timestamp.",
    );
  }

  if (
    typeof payload.reviewClickResult !== "undefined" &&
    !isObject(payload.reviewClickResult)
  ) {
    errors.push(
      "Manual confirmation wait request reviewClickResult must be an object when provided.",
    );
  }

  if (
    typeof payload.observation !== "undefined" &&
    !isObject(payload.observation)
  ) {
    errors.push(
      "Manual confirmation wait request observation must be an object when provided.",
    );
  }

  if (
    typeof payload.timeoutMs !== "undefined" &&
    !(
      typeof payload.timeoutMs === "number" &&
      Number.isFinite(payload.timeoutMs) &&
      payload.timeoutMs > 0
    )
  ) {
    errors.push(
      "Manual confirmation wait request timeoutMs must be a positive finite number when provided.",
    );
  }

  if (hasUnsafeDryRunMetadata(payload.metadata)) {
    errors.push(
      "Manual confirmation wait request metadata contains unsafe submit or broker automation flags.",
    );
  }

  return errors;
}

function buildManualConfirmationWaitResponse(payload) {
  const receivedAt = now();
  const checkedAt = receivedAt;
  const requestId =
    stringValue(payload?.requestId) ??
    "unknown_manual_confirmation_wait_request";
  const errors = validateManualConfirmationWaitPayload(payload);
  const mode =
    stringValue(process.env.AVANZA_LOCALHOST_BRIDGE_MANUAL_CONFIRMATION_WAIT_MODE) ??
    "unavailable";
  const supportedModes = new Set([
    "unavailable",
    "waiting",
    "user_cancelled",
    "user_confirmed_unverified",
    "timed_out",
    "final_confirm_visible_read_only",
    "blocked_final_confirm_attempt",
    "blocked_keyboard_submit",
    "blocked_unexpected_broker_result",
    "blocked_trade_mutation",
    "blocked_sensitive",
    "confirmation_not_ready",
  ]);
  const normalizedMode = supportedModes.has(mode) ? mode : "unavailable";
  const reviewClickResult = isObject(payload?.reviewClickResult)
    ? payload.reviewClickResult
    : normalizedMode === "confirmation_not_ready" || errors.length > 0
      ? createFallbackReviewClickResult("form_not_ready")
      : createFallbackReviewClickResult("confirmation_ready");
  let observation = isObject(payload?.observation) ? payload.observation : null;
  let manualConfirmationWait;

  if (errors.length > 0) {
    manualConfirmationWait = createManualConfirmationWaitResult(
      "failed",
      reviewClickResult,
      {
        checkedAt,
        blockers: errors,
        errors,
        metadata: { timeoutMs: payload?.timeoutMs },
      },
    );
  } else if (normalizedMode === "unavailable") {
    manualConfirmationWait = createManualConfirmationWaitResult(
      "unavailable",
      reviewClickResult,
      {
        checkedAt,
        blockers: ["Manual confirmation wait runner is not implemented."],
        errors: ["Manual confirmation wait runner is not implemented."],
        warnings: [
          "No browser confirmation modal was observed by this stub.",
        ],
        metadata: { timeoutMs: payload?.timeoutMs },
      },
    );
  } else {
    if (!observation) {
      observation =
        normalizedMode === "waiting"
          ? {
              modalStillVisible: true,
              finalConfirmVisible: true,
              cancelButtonVisible: true,
            }
          : normalizedMode === "user_cancelled"
            ? { modalStillVisible: false, userCancelled: true }
            : normalizedMode === "user_confirmed_unverified"
              ? { modalStillVisible: false, userConfirmed: true }
              : normalizedMode === "timed_out"
                ? { modalStillVisible: true, timedOut: true, elapsedMs: 300001 }
                : normalizedMode === "final_confirm_visible_read_only"
                  ? {
                      modalStillVisible: true,
                      finalConfirmVisible: true,
                      cancelButtonVisible: true,
                    }
                  : normalizedMode === "blocked_final_confirm_attempt"
                    ? {
                        modalStillVisible: true,
                        finalConfirmVisible: true,
                        interactionSignals: {
                          finalConfirmClickedByAgentOrAttempted: true,
                        },
                      }
                    : normalizedMode === "blocked_keyboard_submit"
                      ? {
                          modalStillVisible: true,
                          interactionSignals: { keyboardSubmitDetected: true },
                        }
                      : normalizedMode === "blocked_unexpected_broker_result"
                        ? {
                            modalStillVisible: false,
                            unexpectedSignals: { brokerResultDetected: true },
                          }
                        : normalizedMode === "blocked_trade_mutation"
                          ? {
                              modalStillVisible: false,
                              unexpectedSignals: {
                                tradeMutationDetected: true,
                              },
                            }
                          : normalizedMode === "blocked_sensitive"
                            ? {
                                modalStillVisible: true,
                                sensitiveSignals: {
                                  accountDataDetected: true,
                                  balanceDataDetected: true,
                                  holdingsDataDetected: true,
                                  sensitiveDataDetected: true,
                                },
                              }
                            : null;
    }

    manualConfirmationWait = evaluateManualConfirmationWaitStub(
      reviewClickResult,
      observation,
      checkedAt,
      {
        timeoutMs: payload?.timeoutMs,
        metadata: {
          manual_confirmation_wait_mode: normalizedMode,
        },
      },
    );
  }

  const statusCode =
    errors.length > 0 ||
    manualConfirmationWait.status === "failed" ||
    manualConfirmationWait.status === "blocked" ||
    manualConfirmationWait.status === "confirmation_not_ready"
      ? 400
      : manualConfirmationWait.status === "unavailable"
        ? 501
        : 200;
  const baseWarnings = [
    "Manual confirmation wait runner is not implemented.",
    "No browser actions were executed.",
    "No Avanza page was touched.",
    "No Bekräfta was clicked.",
    "No broker result was created.",
    "No trade mutation occurred.",
  ];

  return {
    statusCode,
    body: {
      version: CONTRACT_VERSION,
      ok: manualConfirmationWait.ok,
      bridgeVersion: CONTRACT_VERSION,
      requestId,
      receivedAt,
      completedAt: now(),
      manualConfirmationWait,
      message:
        manualConfirmationWait.status === "waiting_for_manual_confirmation"
          ? "Localhost bridge manual-confirmation-wait stub returned synthetic waiting diagnostics. No browser was controlled."
          : "Localhost bridge manual-confirmation-wait stub completed safely. No browser was controlled.",
      errors: [...new Set([...errors, ...manualConfirmationWait.errors])],
      warnings: [...new Set([...baseWarnings, ...manualConfirmationWait.warnings])],
      metadata: {
        ...(isObject(payload?.metadata) ? payload.metadata : {}),
        localhost_bridge_stub: true,
        manual_confirmation_wait_endpoint_stub: true,
        manual_confirmation_wait_mode: normalizedMode,
        no_browser_control: true,
        no_browser_actions_executed: true,
        no_avanza_page_touched: true,
        no_avanza_urls: true,
        no_avanza_selectors: true,
        no_bekrafta_clicked: true,
        no_final_confirm_click: true,
        no_keyboard_submit: true,
        no_broker_submission: true,
        no_broker_result_created: true,
        no_supabase_write: true,
        no_trade_mutation: true,
      },
    },
  };
}

function createFallbackManualConfirmationWaitResult(
  status = "user_confirmed_unverified",
) {
  const reviewClickResult = createFallbackReviewClickResult("confirmation_ready");
  const observation =
    status === "user_confirmed_unverified"
      ? { modalStillVisible: false, userConfirmed: true }
      : status === "waiting_for_manual_confirmation"
        ? { modalStillVisible: true, finalConfirmVisible: true }
        : undefined;

  return createManualConfirmationWaitResult(status, reviewClickResult, {
    ...(observation ? { observation } : {}),
  });
}

function createBrokerConfirmationReadback(dryRunOrderInput, options = {}) {
  const instrument = isObject(dryRunOrderInput?.instrument)
    ? dryRunOrderInput.instrument
    : { ticker: "UNKNOWN" };
  const quantity =
    typeof options.quantityValue !== "undefined"
      ? options.quantityValue
      : dryRunOrderInput?.quantity;
  const price =
    typeof options.priceValue !== "undefined"
      ? options.priceValue
      : dryRunOrderInput?.price;
  const quantityNumber = numberFromInput(quantity) ?? 1;
  const priceNumber = numberFromInput(price) ?? 1;

  return {
    action:
      stringValue(options.action) ??
      (dryRunOrderInput?.action === "sell" ? "sell" : "buy"),
    ticker: stringValue(options.ticker) ?? stringValue(instrument.ticker) ?? "",
    ...(stringValue(options.name) ?? stringValue(instrument.name)
      ? { name: stringValue(options.name) ?? stringValue(instrument.name) }
      : {}),
    ...(stringValue(options.market) ?? stringValue(instrument.market)
      ? {
          market:
            stringValue(options.market) ?? stringValue(instrument.market),
        }
      : {}),
    ...(stringValue(options.currency) ?? stringValue(instrument.currency)
      ? {
          currency:
            stringValue(options.currency) ?? stringValue(instrument.currency),
        }
      : {}),
    ...(stringValue(options.instrumentType) ??
    stringValue(instrument.instrumentType)
      ? {
          instrumentType:
            stringValue(options.instrumentType) ??
            stringValue(instrument.instrumentType),
        }
      : {}),
    quantityValue: quantity,
    priceValue: price,
    fees: typeof options.fees !== "undefined" ? options.fees : "1.00",
    totalAmount:
      typeof options.totalAmount !== "undefined"
        ? options.totalAmount
        : String((quantityNumber * priceNumber + 1).toFixed(2)),
    timestamp: stringValue(options.timestamp) ?? now(),
    orderIdSanitized:
      typeof options.orderIdSanitized !== "undefined"
        ? options.orderIdSanitized
        : "AVZ-STUB-ORDER-001",
    accountLabelSanitized:
      stringValue(options.accountLabelSanitized) ?? "Sanitized account",
    orderStatus: stringValue(options.orderStatus) ?? "filled",
    statusTextSanitized:
      stringValue(options.statusTextSanitized) ??
      stringValue(options.orderStatus) ??
      "filled",
    warnings: Array.isArray(options.warnings) ? options.warnings : [],
    confirmationPageVisible: options.confirmationPageVisible !== false,
    ...(isObject(options.sensitiveSignals)
      ? { sensitiveSignals: options.sensitiveSignals }
      : {}),
    ...(isObject(options.forbiddenSignals)
      ? { forbiddenSignals: options.forbiddenSignals }
      : {}),
    metadata: {
      synthetic_stub: true,
      sanitized_readback_only: true,
      ...(isObject(options.metadata) ? options.metadata : {}),
    },
  };
}

function createBrokerConfirmationFieldCheck(
  field,
  expected,
  actual,
  required,
  options = {},
) {
  const expectedText = textValue(expected);
  const actualText = textValue(actual);

  if (!expectedText) {
    return {
      field,
      actual: actualText || undefined,
      status: "missing_expected",
      required: false,
      message:
        options.missingExpectedMessage ??
        `Expected ${field} is missing; broker confirmation confidence is lower.`,
    };
  }

  if (!actualText) {
    return {
      field,
      expected: expectedText,
      status: "missing_confirmation",
      required,
      message:
        options.missingConfirmationMessage ??
        `Broker confirmation ${field} is missing.`,
    };
  }

  if (
    (options.numeric === true &&
      numberFromInput(expected) !== null &&
      numberFromInput(actual) !== null &&
      Math.abs(numberFromInput(expected) - numberFromInput(actual)) <=
        (options.tolerance ?? 0)) ||
    normalizeSearchText(expectedText) === normalizeSearchText(actualText)
  ) {
    return {
      field,
      expected: expectedText,
      actual: actualText,
      status: "match",
      required,
    };
  }

  return {
    field,
    expected: expectedText,
    actual: actualText,
    status: "mismatch",
    required,
    message:
      options.mismatchMessage ??
      `Broker confirmation ${field} does not match.`,
  };
}

function createBrokerConfirmationCaptureResult(
  status,
  dryRunOrderInput,
  manualConfirmationWaitResult,
  options = {},
) {
  const instrument = isObject(dryRunOrderInput?.instrument)
    ? dryRunOrderInput.instrument
    : { ticker: "UNKNOWN" };
  const labelsByStatus = {
    unavailable: ["Broker confirmation capture unavailable"],
    manual_confirmation_not_observed: ["Manual confirmation not observed"],
    confirmation_page_not_found: ["Broker confirmation page not found"],
    confirmation_captured: ["Broker confirmation captured"],
    confirmation_partial: ["Broker confirmation partial"],
    confirmation_mismatch: ["Broker confirmation mismatch"],
    confirmation_rejected_or_cancelled: ["Broker rejected/cancelled/expired"],
    blocked: ["Broker confirmation capture blocked"],
    failed: ["Broker confirmation capture failed"],
  };

  return {
    ok: status === "confirmation_captured",
    status,
    checkedAt: options.checkedAt ?? now(),
    expectedAction:
      dryRunOrderInput?.action === "sell" ? "sell" : "buy",
    expectedInstrument: {
      ticker: stringValue(instrument.ticker) ?? "",
      ...(stringValue(instrument.name)
        ? { name: stringValue(instrument.name) }
        : {}),
      ...(stringValue(instrument.market)
        ? { market: stringValue(instrument.market) }
        : {}),
      ...(stringValue(instrument.currency)
        ? { currency: stringValue(instrument.currency) }
        : {}),
      ...(stringValue(instrument.instrumentType)
        ? { instrumentType: stringValue(instrument.instrumentType) }
        : {}),
    },
    expectedQuantity: numberFromInput(dryRunOrderInput?.quantity) ?? 1,
    expectedPrice: numberFromInput(dryRunOrderInput?.price) ?? 1,
    orderStatus: stringValue(options.orderStatus) ?? "unknown",
    ...(isObject(options.brokerConfirmationReadback)
      ? { brokerConfirmationReadback: options.brokerConfirmationReadback }
      : {}),
    fieldChecks: Array.isArray(options.fieldChecks)
      ? options.fieldChecks
      : [],
    riskFlags: [...new Set(options.riskFlags ?? [])],
    blockers: [...new Set(options.blockers ?? [])],
    warnings: [...new Set(options.warnings ?? [])],
    errors: [...new Set(options.errors ?? [])],
    labels: [
      ...new Set([
        "Broker confirmation capture only",
        "No Bekräfta by agent",
        "No BrokerExecutionResult",
        "No execution record",
        "No Supabase write",
        "No trade mutation",
        ...(labelsByStatus[status] ?? []),
        ...(options.labels ?? []),
      ]),
    ],
    metadata: {
      ...(isObject(options.metadata) ? options.metadata : {}),
      contractVersion: AVANZA_BROKER_CONFIRMATION_CAPTURE_CONTRACT_VERSION,
      brokerConfirmationCaptureOnly: true,
      noBekraftaByAgent: true,
      noBrokerExecutionResult: true,
      noExecutionRecord: true,
      noSupabaseWrite: true,
      noTradeMutation: true,
      sanitizedEvidenceOnly: true,
      manualConfirmationStatus:
        stringValue(manualConfirmationWaitResult?.status) ?? "unknown",
    },
  };
}

function evaluateBrokerConfirmationCaptureStub(
  dryRunOrderInput,
  manualConfirmationWaitResult,
  brokerConfirmationReadback,
  checkedAt,
  options = {},
) {
  if (
    !isObject(manualConfirmationWaitResult) ||
    manualConfirmationWaitResult.status !== "user_confirmed_unverified" ||
    manualConfirmationWaitResult.metadata?.separateConfirmationCaptureRequired !==
      true
  ) {
    const blocker =
      "Manual confirmation wait must report user_confirmed_unverified before broker confirmation capture.";

    return createBrokerConfirmationCaptureResult(
      "manual_confirmation_not_observed",
      dryRunOrderInput,
      isObject(manualConfirmationWaitResult)
        ? manualConfirmationWaitResult
        : createFallbackManualConfirmationWaitResult("waiting_for_manual_confirmation"),
      {
        checkedAt,
        blockers: [blocker],
        errors: [blocker],
        riskFlags: ["manual_confirmation_not_observed"],
      },
    );
  }

  if (!isObject(brokerConfirmationReadback)) {
    const blocker = "Sanitized broker confirmation readback is required.";

    return createBrokerConfirmationCaptureResult(
      "confirmation_page_not_found",
      dryRunOrderInput,
      manualConfirmationWaitResult,
      {
        checkedAt,
        blockers: [blocker],
        errors: [blocker],
        riskFlags: ["confirmation_page_missing"],
      },
    );
  }

  if (brokerConfirmationReadback.confirmationPageVisible === false) {
    const blocker = "Broker confirmation page is not visible.";

    return createBrokerConfirmationCaptureResult(
      "confirmation_page_not_found",
      dryRunOrderInput,
      manualConfirmationWaitResult,
      {
        checkedAt,
        brokerConfirmationReadback,
        blockers: [blocker],
        errors: [blocker],
        riskFlags: ["confirmation_page_missing"],
      },
    );
  }

  const riskFlags = [];
  const blockers = [];
  const warnings = [];

  if (brokerConfirmationReadback.forbiddenSignals?.brokerResultCreationAttempted) {
    riskFlags.push("broker_result_creation_attempted");
    blockers.push(
      "BrokerExecutionResult creation was attempted during broker confirmation capture.",
    );
  }

  if (brokerConfirmationReadback.forbiddenSignals?.tradeMutationAttempted) {
    riskFlags.push("trade_mutation_attempted");
    blockers.push(
      "Trade mutation was attempted during broker confirmation capture.",
    );
  }

  for (const [key, risk, message] of [
    [
      "accountDataDetected",
      "account_data_detected",
      "Account data detected in broker confirmation readback.",
    ],
    [
      "balanceDataDetected",
      "balance_data_detected",
      "Balance data detected in broker confirmation readback.",
    ],
    [
      "holdingsDataDetected",
      "holdings_data_detected",
      "Holdings data detected in broker confirmation readback.",
    ],
    [
      "sensitiveDataDetected",
      "sensitive_data_detected",
      "Sensitive data detected in broker confirmation readback.",
    ],
    [
      "rawDomDetected",
      "raw_dom_detected",
      "Raw DOM was detected in broker confirmation readback.",
    ],
    [
      "unsanitizedScreenshotDetected",
      "unsanitized_screenshot_detected",
      "Unsanitized screenshot was detected in broker confirmation readback.",
    ],
  ]) {
    if (brokerConfirmationReadback.sensitiveSignals?.[key]) {
      riskFlags.push(risk);
      blockers.push(message);
    }
  }

  if (blockers.length > 0) {
    return createBrokerConfirmationCaptureResult(
      "blocked",
      dryRunOrderInput,
      manualConfirmationWaitResult,
      {
        checkedAt,
        brokerConfirmationReadback,
        orderStatus:
          stringValue(brokerConfirmationReadback.orderStatus) ?? "unknown",
        blockers,
        errors: blockers,
        riskFlags,
      },
    );
  }

  const instrument = dryRunOrderInput.instrument ?? {};
  const fieldChecks = [
    createBrokerConfirmationFieldCheck(
      "action",
      dryRunOrderInput.action,
      brokerConfirmationReadback.action,
      true,
      {
        mismatchMessage:
          "Broker confirmation action does not match the dry-run request.",
      },
    ),
    createBrokerConfirmationFieldCheck(
      "ticker",
      instrument.ticker,
      brokerConfirmationReadback.ticker,
      true,
      {
        mismatchMessage:
          "Broker confirmation ticker does not match the dry-run request.",
      },
    ),
    createBrokerConfirmationFieldCheck(
      "quantity",
      dryRunOrderInput.quantity,
      brokerConfirmationReadback.quantityValue,
      true,
      {
        numeric: true,
        mismatchMessage:
          "Broker confirmation quantity does not match the dry-run request.",
      },
    ),
    createBrokerConfirmationFieldCheck(
      "price",
      dryRunOrderInput.price,
      brokerConfirmationReadback.priceValue,
      true,
      {
        numeric: true,
        tolerance: 0.0001,
        mismatchMessage:
          "Broker confirmation price/course does not match the dry-run request.",
      },
    ),
  ];

  for (const check of fieldChecks) {
    if (check.status === "mismatch" || check.status === "missing_confirmation") {
      const riskByField = {
        action: "action_mismatch",
        ticker: "ticker_mismatch",
        quantity: "quantity_mismatch",
        price: "price_mismatch",
      };
      const message = check.message ?? `Broker confirmation ${check.field} mismatch.`;

      riskFlags.push(riskByField[check.field] ?? "missing_order_id");
      blockers.push(message);
    }
  }

  const orderStatus =
    stringValue(brokerConfirmationReadback.orderStatus) ?? "unknown";

  if (blockers.length > 0) {
    return createBrokerConfirmationCaptureResult(
      "confirmation_mismatch",
      dryRunOrderInput,
      manualConfirmationWaitResult,
      {
        checkedAt,
        brokerConfirmationReadback,
        orderStatus,
        fieldChecks,
        blockers,
        errors: blockers,
        riskFlags,
      },
    );
  }

  if (orderStatus === "rejected" || orderStatus === "cancelled" || orderStatus === "expired") {
    const risk =
      orderStatus === "rejected"
        ? "order_rejected"
        : orderStatus === "cancelled"
          ? "order_cancelled"
          : "ambiguous_confirmation_wording";

    return createBrokerConfirmationCaptureResult(
      "confirmation_rejected_or_cancelled",
      dryRunOrderInput,
      manualConfirmationWaitResult,
      {
        checkedAt,
        brokerConfirmationReadback,
        orderStatus,
        fieldChecks,
        warnings: [`Broker confirmation order status is ${orderStatus}.`],
        riskFlags: [risk],
      },
    );
  }

  if (orderStatus === "placed" || orderStatus === "accepted") {
    return createBrokerConfirmationCaptureResult(
      "confirmation_partial",
      dryRunOrderInput,
      manualConfirmationWaitResult,
      {
        checkedAt,
        brokerConfirmationReadback,
        orderStatus,
        fieldChecks,
        warnings: [
          "Order appears placed/accepted, but fill is not confirmed.",
        ],
        riskFlags: ["order_placed_not_filled"],
      },
    );
  }

  if (orderStatus === "partially_filled") {
    return createBrokerConfirmationCaptureResult(
      "confirmation_partial",
      dryRunOrderInput,
      manualConfirmationWaitResult,
      {
        checkedAt,
        brokerConfirmationReadback,
        orderStatus,
        fieldChecks,
        warnings: ["Order appears partially filled."],
        riskFlags: ["partial_fill"],
      },
    );
  }

  if (!stringValue(brokerConfirmationReadback.orderIdSanitized)) {
    riskFlags.push("missing_order_id");
    warnings.push("Sanitized order id is missing.");
  }

  if (!stringValue(brokerConfirmationReadback.timestamp)) {
    riskFlags.push("missing_timestamp");
    warnings.push("Broker timestamp is missing.");
  }

  if (typeof brokerConfirmationReadback.fees === "undefined") {
    riskFlags.push("missing_fee");
    warnings.push("Broker fee readback is missing.");
  }

  if (typeof brokerConfirmationReadback.totalAmount === "undefined") {
    riskFlags.push("missing_total");
    warnings.push("Broker total readback is missing.");
  }

  if (orderStatus === "unknown") {
    return createBrokerConfirmationCaptureResult(
      "confirmation_partial",
      dryRunOrderInput,
      manualConfirmationWaitResult,
      {
        checkedAt,
        brokerConfirmationReadback,
        orderStatus,
        fieldChecks,
        warnings: ["Broker confirmation order status is unknown."],
        riskFlags: [...riskFlags, "status_unknown"],
      },
    );
  }

  return createBrokerConfirmationCaptureResult(
    "confirmation_captured",
    dryRunOrderInput,
    manualConfirmationWaitResult,
    {
      checkedAt,
      brokerConfirmationReadback,
      orderStatus: "filled",
      fieldChecks,
      warnings,
      riskFlags,
      metadata: {
        broker_confirmation_capture_mode:
          stringValue(options.mode) ?? "confirmation_captured_filled",
      },
    },
  );
}

function validateBrokerConfirmationCapturePayload(payload) {
  const errors = [];
  const warnings = [];

  if (!isObject(payload)) {
    return {
      errors: ["Broker confirmation capture payload must be a JSON object."],
      warnings,
      dryRunRequestValidation: {
        ok: false,
        errors: ["Avanza dry-run request must be an object."],
        warnings: [],
      },
    };
  }

  if (payload.version !== CONTRACT_VERSION) {
    errors.push(
      `Broker confirmation capture request version must be ${CONTRACT_VERSION}.`,
    );
  }

  if (!stringValue(payload.requestId)) {
    errors.push("Broker confirmation capture request requestId is missing.");
  }

  if (
    !stringValue(payload.createdAt) ||
    !Number.isFinite(Date.parse(payload.createdAt))
  ) {
    errors.push(
      "Broker confirmation capture request createdAt must be a valid timestamp.",
    );
  }

  const dryRunRequestValidation = validateAvanzaDryRunOrderInput(
    payload.dryRunOrderInput,
  );

  if (!dryRunRequestValidation.ok) {
    errors.push(
      ...dryRunRequestValidation.errors.map(
        (error) => `Avanza dry-run request: ${error}`,
      ),
    );
  }

  warnings.push(
    ...dryRunRequestValidation.warnings.map(
      (warning) => `Avanza dry-run request: ${warning}`,
    ),
  );

  if (
    typeof payload.manualConfirmationWaitResult !== "undefined" &&
    !isObject(payload.manualConfirmationWaitResult)
  ) {
    errors.push(
      "Broker confirmation capture request manualConfirmationWaitResult must be an object when provided.",
    );
  }

  if (
    typeof payload.brokerConfirmationReadback !== "undefined" &&
    !isObject(payload.brokerConfirmationReadback)
  ) {
    errors.push(
      "Broker confirmation capture request brokerConfirmationReadback must be an object when provided.",
    );
  }

  if (hasUnsafeDryRunMetadata(payload.metadata)) {
    errors.push(
      "Broker confirmation capture request metadata contains unsafe submit or broker automation flags.",
    );
  }

  if (hasUnsafeDryRunMetadata(payload.dryRunOrderInput?.metadata)) {
    errors.push(
      "Broker confirmation capture request dryRunOrderInput metadata contains unsafe submit or broker automation flags.",
    );
  }

  return { errors, warnings, dryRunRequestValidation };
}

function buildBrokerConfirmationCaptureResponse(payload) {
  const receivedAt = now();
  const checkedAt = receivedAt;
  const requestId =
    stringValue(payload?.requestId) ??
    "unknown_broker_confirmation_capture_request";
  const payloadValidation = validateBrokerConfirmationCapturePayload(payload);
  const mode =
    stringValue(
      process.env.AVANZA_LOCALHOST_BRIDGE_BROKER_CONFIRMATION_CAPTURE_MODE,
    ) ?? "unavailable";
  const supportedModes = new Set([
    "unavailable",
    "confirmation_captured_filled",
    "confirmation_partial_placed",
    "confirmation_partial_accepted",
    "confirmation_partial_partially_filled",
    "confirmation_mismatch_action",
    "confirmation_mismatch_ticker",
    "confirmation_mismatch_quantity",
    "confirmation_mismatch_price",
    "confirmation_rejected",
    "confirmation_cancelled",
    "confirmation_expired",
    "blocked_sensitive",
    "blocked_raw_dom",
    "blocked_broker_result_attempt",
    "blocked_trade_mutation_attempt",
    "manual_confirmation_not_observed",
    "confirmation_page_not_found",
  ]);
  const normalizedMode = supportedModes.has(mode) ? mode : "unavailable";
  const dryRunOrderInput = isObject(payload?.dryRunOrderInput)
    ? payload.dryRunOrderInput
    : {
        action: "buy",
        instrument: { ticker: "UNKNOWN" },
        quantity: 1,
        price: 1,
        orderMode: "advanced",
        accountPolicy: "require_manual_review",
        stopPolicy: "stop_at_confirmation_modal",
        createdAt: checkedAt,
      };
  const manualConfirmationWaitResult = isObject(payload?.manualConfirmationWaitResult)
    ? payload.manualConfirmationWaitResult
    : normalizedMode === "manual_confirmation_not_observed" ||
        payloadValidation.errors.length > 0
      ? createFallbackManualConfirmationWaitResult(
          "waiting_for_manual_confirmation",
        )
      : createFallbackManualConfirmationWaitResult(
          "user_confirmed_unverified",
        );
  let brokerConfirmationReadback = isObject(payload?.brokerConfirmationReadback)
    ? payload.brokerConfirmationReadback
    : null;

  if (!brokerConfirmationReadback && payloadValidation.errors.length === 0) {
    brokerConfirmationReadback =
      normalizedMode === "confirmation_captured_filled"
        ? createBrokerConfirmationReadback(dryRunOrderInput, {
            orderStatus: "filled",
          })
        : normalizedMode === "confirmation_partial_placed"
          ? createBrokerConfirmationReadback(dryRunOrderInput, {
              orderStatus: "placed",
            })
          : normalizedMode === "confirmation_partial_accepted"
            ? createBrokerConfirmationReadback(dryRunOrderInput, {
                orderStatus: "accepted",
              })
            : normalizedMode === "confirmation_partial_partially_filled"
              ? createBrokerConfirmationReadback(dryRunOrderInput, {
                  orderStatus: "partially_filled",
                })
              : normalizedMode === "confirmation_mismatch_action"
                ? createBrokerConfirmationReadback(dryRunOrderInput, {
                    action: dryRunOrderInput.action === "sell" ? "buy" : "sell",
                  })
                : normalizedMode === "confirmation_mismatch_ticker"
                  ? createBrokerConfirmationReadback(dryRunOrderInput, {
                      ticker: "OTHER",
                    })
                  : normalizedMode === "confirmation_mismatch_quantity"
                    ? createBrokerConfirmationReadback(dryRunOrderInput, {
                        quantityValue:
                          (numberFromInput(dryRunOrderInput.quantity) ?? 1) + 1,
                      })
                    : normalizedMode === "confirmation_mismatch_price"
                      ? createBrokerConfirmationReadback(dryRunOrderInput, {
                          priceValue:
                            (numberFromInput(dryRunOrderInput.price) ?? 1) + 1,
                        })
                      : normalizedMode === "confirmation_rejected"
                        ? createBrokerConfirmationReadback(dryRunOrderInput, {
                            orderStatus: "rejected",
                          })
                        : normalizedMode === "confirmation_cancelled"
                          ? createBrokerConfirmationReadback(dryRunOrderInput, {
                              orderStatus: "cancelled",
                            })
                          : normalizedMode === "confirmation_expired"
                            ? createBrokerConfirmationReadback(dryRunOrderInput, {
                                orderStatus: "expired",
                              })
                            : normalizedMode === "blocked_sensitive"
                              ? createBrokerConfirmationReadback(dryRunOrderInput, {
                                  sensitiveSignals: {
                                    accountDataDetected: true,
                                    balanceDataDetected: true,
                                    holdingsDataDetected: true,
                                    sensitiveDataDetected: true,
                                  },
                                })
                              : normalizedMode === "blocked_raw_dom"
                                ? createBrokerConfirmationReadback(
                                    dryRunOrderInput,
                                    {
                                      sensitiveSignals: {
                                        rawDomDetected: true,
                                        unsanitizedScreenshotDetected: true,
                                      },
                                    },
                                  )
                                : normalizedMode ===
                                    "blocked_broker_result_attempt"
                                  ? createBrokerConfirmationReadback(
                                      dryRunOrderInput,
                                      {
                                        forbiddenSignals: {
                                          brokerResultCreationAttempted: true,
                                        },
                                      },
                                    )
                                  : normalizedMode ===
                                      "blocked_trade_mutation_attempt"
                                    ? createBrokerConfirmationReadback(
                                        dryRunOrderInput,
                                        {
                                          forbiddenSignals: {
                                            tradeMutationAttempted: true,
                                          },
                                        },
                                      )
                                    : normalizedMode ===
                                        "confirmation_page_not_found"
                                      ? createBrokerConfirmationReadback(
                                          dryRunOrderInput,
                                          {
                                            confirmationPageVisible: false,
                                          },
                                        )
                                      : null;
  }

  let brokerConfirmationCapture;

  if (payloadValidation.errors.length > 0) {
    brokerConfirmationCapture = createBrokerConfirmationCaptureResult(
      "failed",
      dryRunOrderInput,
      manualConfirmationWaitResult,
      {
        checkedAt,
        blockers: payloadValidation.errors,
        errors: payloadValidation.errors,
        riskFlags: ["manual_confirmation_not_observed"],
      },
    );
  } else if (normalizedMode === "unavailable") {
    brokerConfirmationCapture = createBrokerConfirmationCaptureResult(
      "unavailable",
      dryRunOrderInput,
      manualConfirmationWaitResult,
      {
        checkedAt,
        blockers: ["Broker confirmation capture runner is not implemented."],
        errors: ["Broker confirmation capture runner is not implemented."],
        warnings: [
          "No browser broker confirmation page was inspected by this stub.",
        ],
      },
    );
  } else {
    brokerConfirmationCapture = evaluateBrokerConfirmationCaptureStub(
      dryRunOrderInput,
      manualConfirmationWaitResult,
      brokerConfirmationReadback,
      checkedAt,
      { mode: normalizedMode },
    );
  }

  const statusCode =
    payloadValidation.errors.length > 0 ||
    brokerConfirmationCapture.status === "failed" ||
    brokerConfirmationCapture.status === "blocked" ||
    brokerConfirmationCapture.status === "manual_confirmation_not_observed" ||
    brokerConfirmationCapture.status === "confirmation_page_not_found" ||
    brokerConfirmationCapture.status === "confirmation_mismatch" ||
    brokerConfirmationCapture.status === "confirmation_rejected_or_cancelled"
      ? 400
      : brokerConfirmationCapture.status === "unavailable"
        ? 501
        : 200;
  const baseWarnings = [
    "Broker confirmation capture runner is not implemented.",
    "No browser actions were executed.",
    "No Avanza page was touched.",
    "No Bekräfta was clicked by the agent.",
    "No BrokerExecutionResult was created.",
    "No execution record was created.",
    "No Supabase write occurred.",
    "No trade mutation occurred.",
  ];

  return {
    statusCode,
    body: {
      version: CONTRACT_VERSION,
      ok: brokerConfirmationCapture.ok,
      bridgeVersion: CONTRACT_VERSION,
      requestId,
      receivedAt,
      completedAt: now(),
      brokerConfirmationCapture,
      message:
        brokerConfirmationCapture.status === "confirmation_captured"
          ? "Localhost bridge broker-confirmation-capture stub returned synthetic sanitized confirmation diagnostics. No browser was controlled."
          : "Localhost bridge broker-confirmation-capture stub completed safely. No browser was controlled.",
      errors: [
        ...new Set([
          ...payloadValidation.errors,
          ...brokerConfirmationCapture.errors,
        ]),
      ],
      warnings: [
        ...new Set([
          ...baseWarnings,
          ...payloadValidation.warnings,
          ...brokerConfirmationCapture.warnings,
        ]),
      ],
      metadata: {
        ...(isObject(payload?.metadata) ? payload.metadata : {}),
        localhost_bridge_stub: true,
        broker_confirmation_capture_endpoint_stub: true,
        broker_confirmation_capture_mode: normalizedMode,
        no_browser_control: true,
        no_browser_actions_executed: true,
        no_avanza_page_touched: true,
        no_avanza_urls: true,
        no_avanza_selectors: true,
        no_bekrafta_clicked: true,
        no_final_confirm_click: true,
        no_broker_submission: true,
        no_broker_execution_result_created: true,
        no_execution_record_created: true,
        no_supabase_write: true,
        no_trade_mutation: true,
      },
    },
  };
}

const AVANZA_BROKER_EXECUTION_RESULT_ELIGIBILITY_VERSION =
  "avanza_broker_execution_result_eligibility_v1";

function normalizeEligibilityOptions(options) {
  return {
    allowMissingOrderId: options?.allowMissingOrderId === true,
    allowMissingTimestamp: options?.allowMissingTimestamp === true,
    allowPlacedAsExecution: options?.allowPlacedAsExecution === true,
    allowPartialFillConversion: options?.allowPartialFillConversion === true,
    blockOnAnyRiskFlag: options?.blockOnAnyRiskFlag !== false,
    requireFilledStatus: options?.requireFilledStatus !== false,
  };
}

function buildBrokerConfirmationEvidenceFingerprint(captureResult) {
  const readback = isObject(captureResult?.brokerConfirmationReadback)
    ? captureResult.brokerConfirmationReadback
    : {};
  const part = (value) => {
    const normalized = normalizeSearchText(value);
    return normalized.length > 0 ? normalized : "missing";
  };
  const numberPart = (value) =>
    typeof value === "number" && Number.isFinite(value)
      ? String(value)
      : "missing";

  return [
    "avanza",
    part(captureResult?.expectedAction),
    part(captureResult?.expectedInstrument?.ticker),
    numberPart(captureResult?.expectedQuantity),
    numberPart(captureResult?.expectedPrice),
    part(captureResult?.orderStatus),
    part(readback.timestamp ?? captureResult?.checkedAt),
    part(readback.orderIdSanitized),
  ].join("|");
}

function createBrokerExecutionResultEligibilityResult(
  captureResult,
  status,
  options = {},
) {
  const normalizedOptions = normalizeEligibilityOptions(options.options);
  const reasons = [...new Set(options.reasons ?? [])];
  const blockers = [...new Set(options.blockers ?? [])];
  const warnings = [...new Set(options.warnings ?? [])];
  const errors = [...new Set(options.errors ?? blockers)];

  return {
    ok: status === "eligible",
    status,
    checkedAt: options.checkedAt ?? now(),
    eligible: status === "eligible",
    reasons,
    blockers,
    warnings,
    errors,
    evidenceFingerprint:
      options.evidenceFingerprint ??
      buildBrokerConfirmationEvidenceFingerprint(captureResult),
    labels: [
      "Eligibility check only",
      "No BrokerExecutionResult created",
      "No execution record",
      "No Supabase write",
      "No trade mutation",
    ],
    metadata: {
      version: AVANZA_BROKER_EXECUTION_RESULT_ELIGIBILITY_VERSION,
      eligibilityCheckOnly: true,
      noBrokerExecutionResultCreated: true,
      noExecutionRecordCreated: true,
      noSupabaseWrite: true,
      noTradeMutation: true,
      captureStatus: stringValue(captureResult?.status) ?? "failed",
      orderStatus: stringValue(captureResult?.orderStatus) ?? "unknown",
      options: normalizedOptions,
    },
  };
}

function evaluateBrokerExecutionResultEligibilityStub(input) {
  const captureResult = input.captureResult;
  const options = normalizeEligibilityOptions(input.options);
  const evidenceFingerprint =
    buildBrokerConfirmationEvidenceFingerprint(captureResult);
  const existingFingerprints = new Set(input.existingFingerprints ?? []);
  const warnings = [];

  if (!isObject(captureResult)) {
    return createBrokerExecutionResultEligibilityResult(
      createBrokerConfirmationCaptureResult(
        "failed",
        {
          action: "buy",
          instrument: { ticker: "UNKNOWN" },
          quantity: 1,
          price: 1,
        },
        createFallbackManualConfirmationWaitResult(
          "waiting_for_manual_confirmation",
        ),
        {
          blockers: ["Broker confirmation capture result is missing."],
          errors: ["Broker confirmation capture result is missing."],
        },
      ),
      "not_eligible",
      {
        checkedAt: input.checkedAt,
        reasons: ["capture_not_captured"],
        blockers: ["Broker confirmation capture result is missing."],
        evidenceFingerprint: "missing",
        options,
      },
    );
  }

  if (existingFingerprints.has(evidenceFingerprint)) {
    return createBrokerExecutionResultEligibilityResult(
      captureResult,
      "duplicate_risk",
      {
        checkedAt: input.checkedAt,
        reasons: ["duplicate_fingerprint_detected"],
        blockers: [
          "Evidence fingerprint has already been seen; conversion would risk a duplicate execution result.",
        ],
        evidenceFingerprint,
        options,
      },
    );
  }

  if (captureResult.status !== "confirmation_captured") {
    const reasons = ["capture_not_captured"];

    if (captureResult.status === "confirmation_partial") {
      reasons.push("capture_partial", "manual_review_required");
      return createBrokerExecutionResultEligibilityResult(
        captureResult,
        "partial_only",
        {
          checkedAt: input.checkedAt,
          reasons,
          blockers: [
            "Broker confirmation capture is partial and cannot become a completed BrokerExecutionResult.",
          ],
          evidenceFingerprint,
          options,
        },
      );
    }

    if (captureResult.status === "confirmation_mismatch") {
      reasons.push("capture_mismatch");
    }

    if (captureResult.status === "confirmation_rejected_or_cancelled") {
      reasons.push("capture_rejected_or_cancelled");
    }

    if (captureResult.status === "blocked" || captureResult.status === "failed") {
      reasons.push("capture_blocked");
    }

    if (captureResult.riskFlags?.includes("order_placed_not_filled")) {
      reasons.push("order_not_filled");
    }

    if (captureResult.riskFlags?.includes("partial_fill")) {
      reasons.push("order_partially_filled");
    }

    if (
      ["account_data_detected", "balance_data_detected", "holdings_data_detected", "sensitive_data_detected", "unsanitized_screenshot_detected"].some((flag) =>
        captureResult.riskFlags?.includes(flag),
      )
    ) {
      reasons.push("sensitive_data_detected");
    }

    if (captureResult.riskFlags?.includes("raw_dom_detected")) {
      reasons.push("raw_data_detected");
    }

    if (captureResult.riskFlags?.includes("broker_result_creation_attempted")) {
      reasons.push("broker_result_attempt_detected");
    }

    if (captureResult.riskFlags?.includes("trade_mutation_attempted")) {
      reasons.push("trade_mutation_attempt_detected");
    }

    return createBrokerExecutionResultEligibilityResult(
      captureResult,
      captureResult.status === "unavailable" ? "not_eligible" : "blocked",
      {
        checkedAt: input.checkedAt,
        reasons,
        blockers: [
          `Capture status ${captureResult.status} is not eligible for BrokerExecutionResult conversion.`,
        ],
        evidenceFingerprint,
        options,
      },
    );
  }

  const reasons = [];
  const blockers = [];

  if (options.requireFilledStatus && captureResult.orderStatus !== "filled") {
    if (
      captureResult.orderStatus === "placed" ||
      captureResult.orderStatus === "accepted"
    ) {
      reasons.push("order_not_filled");
      return createBrokerExecutionResultEligibilityResult(
        captureResult,
        "partial_only",
        {
          checkedAt: input.checkedAt,
          reasons,
          blockers: ["Order is placed or accepted, but fill is not confirmed."],
          evidenceFingerprint,
          options,
        },
      );
    }

    if (captureResult.orderStatus === "partially_filled") {
      reasons.push("order_partially_filled");
      return createBrokerExecutionResultEligibilityResult(
        captureResult,
        "partial_only",
        {
          checkedAt: input.checkedAt,
          reasons,
          blockers: [
            "Order is partially filled; partial-fill conversion requires a separate design.",
          ],
          evidenceFingerprint,
          options,
        },
      );
    }

    reasons.push("unsupported_order_status");
    blockers.push(
      `Order status ${captureResult.orderStatus} is not supported for BrokerExecutionResult conversion.`,
    );
  }

  if (!stringValue(captureResult.expectedInstrument?.ticker)) {
    reasons.push("missing_instrument");
    blockers.push("Capture result instrument ticker is missing.");
  }

  if (
    typeof captureResult.expectedQuantity !== "number" ||
    !Number.isFinite(captureResult.expectedQuantity) ||
    captureResult.expectedQuantity <= 0
  ) {
    reasons.push("missing_quantity");
    blockers.push("Capture result quantity is missing or invalid.");
  }

  if (
    typeof captureResult.expectedPrice !== "number" ||
    !Number.isFinite(captureResult.expectedPrice) ||
    captureResult.expectedPrice <= 0
  ) {
    reasons.push("missing_price");
    blockers.push("Capture result price is missing or invalid.");
  }

  if (!stringValue(captureResult.brokerConfirmationReadback?.timestamp)) {
    reasons.push("missing_timestamp");
    if (options.allowMissingTimestamp) {
      warnings.push("Broker confirmation timestamp is missing.");
    } else {
      blockers.push("Broker confirmation timestamp is missing.");
    }
  }

  if (!stringValue(captureResult.brokerConfirmationReadback?.orderIdSanitized)) {
    reasons.push("missing_order_id");
    if (options.allowMissingOrderId) {
      warnings.push("Broker confirmation order id is missing.");
    } else {
      blockers.push("Broker confirmation order id is missing.");
    }
  }

  if (
    ["account_data_detected", "balance_data_detected", "holdings_data_detected", "sensitive_data_detected", "unsanitized_screenshot_detected"].some((flag) =>
      captureResult.riskFlags?.includes(flag),
    )
  ) {
    reasons.push("sensitive_data_detected");
    blockers.push("Sensitive data was detected in broker confirmation capture.");
  }

  if (captureResult.riskFlags?.includes("raw_dom_detected")) {
    reasons.push("raw_data_detected");
    blockers.push("Raw or unsanitized evidence was detected in broker confirmation capture.");
  }

  if (captureResult.riskFlags?.includes("broker_result_creation_attempted")) {
    reasons.push("broker_result_attempt_detected");
    blockers.push(
      "BrokerExecutionResult creation was attempted before eligibility was approved.",
    );
  }

  if (captureResult.riskFlags?.includes("trade_mutation_attempted")) {
    reasons.push("trade_mutation_attempt_detected");
    blockers.push("Trade mutation was attempted before eligibility was approved.");
  }

  if ((captureResult.riskFlags?.length ?? 0) > 0 && options.blockOnAnyRiskFlag) {
    reasons.push("risk_flags_present");
    blockers.push(
      "Broker confirmation capture has risk flags and blockOnAnyRiskFlag is enabled.",
    );
  }

  if (blockers.length > 0) {
    return createBrokerExecutionResultEligibilityResult(
      captureResult,
      "blocked",
      {
        checkedAt: input.checkedAt,
        reasons,
        blockers,
        warnings,
        evidenceFingerprint,
        options,
      },
    );
  }

  return createBrokerExecutionResultEligibilityResult(captureResult, "eligible", {
    checkedAt: input.checkedAt,
    reasons,
    warnings,
    evidenceFingerprint,
    options,
  });
}

function buildEligibilityCaptureForMode(mode, checkedAt, payload) {
  if (isObject(payload?.captureResult) && mode === "unavailable") {
    return payload.captureResult;
  }

  const dryRunOrderInput = {
    action: mode === "eligible_filled_sell" ? "sell" : "buy",
    instrument: {
      ticker: "QA.ELIG",
      name: "QA Eligibility Instrument",
      market: "Stockholm",
      currency: "SEK",
      instrumentType: "stock",
    },
    quantity: 10,
    price: 123.45,
    orderMode: "advanced",
    accountPolicy: "require_manual_review",
    stopPolicy: "stop_at_confirmation_modal",
    createdAt: checkedAt,
  };
  const manualConfirmationWaitResult =
    createFallbackManualConfirmationWaitResult("user_confirmed_unverified");
  const readback = createBrokerConfirmationReadback(dryRunOrderInput, {
    orderStatus:
      mode === "partial_placed"
        ? "placed"
        : mode === "partial_accepted"
          ? "accepted"
          : mode === "partial_partially_filled"
            ? "partially_filled"
            : mode === "blocked_rejected"
              ? "rejected"
              : "filled",
    ...(mode === "blocked_missing_price" ? { priceValue: undefined } : {}),
    ...(mode === "blocked_missing_quantity" ? { quantityValue: undefined } : {}),
    ...(mode === "blocked_mismatch" ? { ticker: "OTHER" } : {}),
    ...(mode === "blocked_sensitive"
      ? {
          sensitiveSignals: {
            accountDataDetected: true,
            balanceDataDetected: true,
            holdingsDataDetected: true,
            sensitiveDataDetected: true,
          },
        }
      : {}),
    ...(mode === "blocked_broker_result_attempt"
      ? { forbiddenSignals: { brokerResultCreationAttempted: true } }
      : {}),
    ...(mode === "blocked_trade_mutation_attempt"
      ? { forbiddenSignals: { tradeMutationAttempted: true } }
      : {}),
  });

  if (mode === "not_eligible_capture_missing") {
    return null;
  }

  if (mode === "unavailable") {
    return createBrokerConfirmationCaptureResult(
      "unavailable",
      dryRunOrderInput,
      manualConfirmationWaitResult,
      {
        checkedAt,
        blockers: ["BrokerExecutionResult eligibility runner is not implemented."],
        errors: ["BrokerExecutionResult eligibility runner is not implemented."],
      },
    );
  }

  if (mode === "blocked_missing_price" || mode === "blocked_missing_quantity") {
    const capture = evaluateBrokerConfirmationCaptureStub(
      dryRunOrderInput,
      manualConfirmationWaitResult,
      readback,
      checkedAt,
      { mode },
    );

    return {
      ...capture,
      expectedPrice:
        mode === "blocked_missing_price" ? 0 : capture.expectedPrice,
      expectedQuantity:
        mode === "blocked_missing_quantity" ? 0 : capture.expectedQuantity,
      riskFlags: [],
      status: "confirmation_captured",
      ok: true,
      orderStatus: "filled",
    };
  }

  return evaluateBrokerConfirmationCaptureStub(
    dryRunOrderInput,
    manualConfirmationWaitResult,
    readback,
    checkedAt,
    {
      mode:
        mode === "partial_placed"
          ? "confirmation_partial_placed"
          : mode === "partial_accepted"
            ? "confirmation_partial_accepted"
            : mode === "partial_partially_filled"
              ? "confirmation_partial_partially_filled"
              : mode === "blocked_mismatch"
                ? "confirmation_mismatch_ticker"
                : mode === "blocked_rejected"
                  ? "confirmation_rejected"
                  : mode,
    },
  );
}

function validateBrokerExecutionResultEligibilityPayload(payload) {
  const errors = [];
  const warnings = [];

  if (!isObject(payload)) {
    return {
      errors: ["BrokerExecutionResult eligibility payload must be a JSON object."],
      warnings,
    };
  }

  if (payload.version !== CONTRACT_VERSION) {
    errors.push(
      `BrokerExecutionResult eligibility request version must be ${CONTRACT_VERSION}.`,
    );
  }

  if (!stringValue(payload.requestId)) {
    errors.push("BrokerExecutionResult eligibility request requestId is missing.");
  }

  if (
    !stringValue(payload.createdAt) ||
    !Number.isFinite(Date.parse(payload.createdAt))
  ) {
    errors.push(
      "BrokerExecutionResult eligibility request createdAt must be a valid timestamp.",
    );
  }

  if (
    typeof payload.existingFingerprints !== "undefined" &&
    !Array.isArray(payload.existingFingerprints)
  ) {
    errors.push(
      "BrokerExecutionResult eligibility request existingFingerprints must be an array when provided.",
    );
  }

  if (hasUnsafeDryRunMetadata(payload.metadata)) {
    errors.push(
      "BrokerExecutionResult eligibility request metadata contains unsafe submit or broker automation flags.",
    );
  }

  return { errors, warnings };
}

function summarizeBrokerExecutionResultEligibility(eligibility) {
  switch (eligibility.status) {
    case "eligible":
      return "Eligible for future BrokerExecutionResult conversion. No BrokerExecutionResult was created.";
    case "partial_only":
      return `Not eligible: ${
        eligibility.blockers?.[0] ?? "capture is partial or order is not filled"
      }. No BrokerExecutionResult was created.`;
    case "duplicate_risk":
      return "Duplicate risk: evidence fingerprint already exists. No BrokerExecutionResult was created.";
    case "blocked":
      return `Blocked: ${
        eligibility.blockers?.[0] ?? "eligibility checks failed"
      }. No BrokerExecutionResult was created.`;
    case "failed":
      return "Eligibility check failed. No BrokerExecutionResult was created.";
    default:
      return `Not eligible: ${
        eligibility.blockers?.[0] ?? "capture is not eligible"
      }. No BrokerExecutionResult was created.`;
  }
}

function buildBrokerExecutionResultEligibilityResponse(payload) {
  const receivedAt = now();
  const checkedAt = receivedAt;
  const requestId =
    stringValue(payload?.requestId) ??
    "unknown_broker_execution_result_eligibility_request";
  const payloadValidation =
    validateBrokerExecutionResultEligibilityPayload(payload);
  const mode =
    stringValue(
      process.env
        .AVANZA_LOCALHOST_BRIDGE_BROKER_EXECUTION_RESULT_ELIGIBILITY_MODE,
    ) ?? "unavailable";
  const supportedModes = new Set([
    "unavailable",
    "eligible_filled",
    "eligible_filled_sell",
    "partial_placed",
    "partial_accepted",
    "partial_partially_filled",
    "blocked_mismatch",
    "blocked_rejected",
    "blocked_missing_price",
    "blocked_missing_quantity",
    "blocked_sensitive",
    "blocked_broker_result_attempt",
    "blocked_trade_mutation_attempt",
    "duplicate_risk",
    "not_eligible_capture_missing",
  ]);
  const normalizedMode = supportedModes.has(mode) ? mode : "unavailable";
  const captureResult =
    payloadValidation.errors.length === 0
      ? buildEligibilityCaptureForMode(normalizedMode, checkedAt, payload)
      : null;
  const existingFingerprints = Array.isArray(payload?.existingFingerprints)
    ? payload.existingFingerprints
    : [];
  const fingerprint = captureResult
    ? buildBrokerConfirmationEvidenceFingerprint(captureResult)
    : "missing";
  const eligibility =
    payloadValidation.errors.length > 0
      ? createBrokerExecutionResultEligibilityResult(
          createBrokerConfirmationCaptureResult(
            "failed",
            {
              action: "buy",
              instrument: { ticker: "UNKNOWN" },
              quantity: 1,
              price: 1,
            },
            createFallbackManualConfirmationWaitResult(
              "waiting_for_manual_confirmation",
            ),
            {
              checkedAt,
              blockers: payloadValidation.errors,
              errors: payloadValidation.errors,
            },
          ),
          "failed",
          {
            checkedAt,
            reasons: ["capture_not_captured"],
            blockers: payloadValidation.errors,
            errors: payloadValidation.errors,
            evidenceFingerprint: "missing",
            options: payload?.options,
          },
        )
      : evaluateBrokerExecutionResultEligibilityStub({
          captureResult,
          existingFingerprints:
            normalizedMode === "duplicate_risk"
              ? [...existingFingerprints, fingerprint]
              : existingFingerprints,
          options: payload?.options,
          checkedAt,
        });
  const statusCode =
    payloadValidation.errors.length > 0 || eligibility.status === "failed"
      ? 400
      : eligibility.status === "eligible"
        ? 200
        : eligibility.status === "not_eligible" && normalizedMode === "unavailable"
          ? 501
          : 400;
  const baseWarnings = [
    "BrokerExecutionResult conversion is not implemented.",
    "Eligibility check only.",
    "No BrokerExecutionResult was created.",
    "No execution record was created.",
    "No Supabase write occurred.",
    "No trade mutation occurred.",
  ];

  return {
    statusCode,
    body: {
      version: CONTRACT_VERSION,
      ok: eligibility.ok,
      bridgeVersion: CONTRACT_VERSION,
      requestId,
      receivedAt,
      completedAt: now(),
      eligibility,
      message:
        eligibility.status === "eligible"
          ? "Localhost bridge BrokerExecutionResult eligibility stub returned synthetic eligibility. No BrokerExecutionResult was created."
          : "Localhost bridge BrokerExecutionResult eligibility stub completed safely. No BrokerExecutionResult was created.",
      errors: [
        ...new Set([...payloadValidation.errors, ...eligibility.errors]),
      ],
      warnings: [
        ...new Set([
          ...baseWarnings,
          ...payloadValidation.warnings,
          ...eligibility.warnings,
        ]),
      ],
      metadata: {
        ...(isObject(payload?.metadata) ? payload.metadata : {}),
        localhost_bridge_stub: true,
        broker_execution_result_eligibility_endpoint_stub: true,
        broker_execution_result_eligibility_mode: normalizedMode,
        eligibility_check_only: true,
        no_browser_control: true,
        no_browser_actions_executed: true,
        no_avanza_page_touched: true,
        no_avanza_urls: true,
        no_avanza_selectors: true,
        no_bekrafta_clicked: true,
        no_final_confirm_click: true,
        no_broker_submission: true,
        no_broker_execution_result_created: true,
        no_execution_record_created: true,
        no_supabase_write: true,
        no_trade_mutation: true,
        summary: summarizeBrokerExecutionResultEligibility(eligibility),
      },
    },
  };
}

const AVANZA_BROKER_EXECUTION_RESULT_PREVIEW_VERSION =
  "avanza_broker_execution_result_preview_v1";

function createBrokerExecutionResultPreviewResult(
  captureResult,
  eligibility,
  status,
  options = {},
) {
  const blockers = [...new Set(options.blockers ?? [])];
  const warnings = [...new Set(options.warnings ?? [])];
  const errors = [...new Set(options.errors ?? blockers)];
  const fields = options.fields ?? [];

  return {
    ok: status === "preview_available",
    status,
    checkedAt: options.checkedAt ?? now(),
    ...(options.preview ? { preview: options.preview } : {}),
    eligibility,
    fields,
    blockers,
    warnings,
    errors,
    labels: [
      "BrokerExecutionResult preview only",
      "Not a real BrokerExecutionResult",
      "No execution record",
      "No Supabase write",
      "No trade mutation",
    ],
    metadata: {
      version: AVANZA_BROKER_EXECUTION_RESULT_PREVIEW_VERSION,
      previewOnly: true,
      notBrokerExecutionResult: true,
      noExecutionRecord: true,
      noSupabaseWrite: true,
      noTradeMutation: true,
      source: "avanza_broker_execution_result_preview",
      ...(isObject(options.metadata)
        ? { metadata: { ...options.metadata } }
        : {}),
    },
  };
}

function mapPreviewStatusFromEligibility(eligibilityStatus) {
  switch (eligibilityStatus) {
    case "eligible":
      return "preview_available";
    case "partial_only":
      return "partial_only";
    case "duplicate_risk":
      return "duplicate_risk";
    case "blocked":
      return "blocked";
    case "failed":
      return "failed";
    default:
      return "not_eligible";
  }
}

function summarizeBrokerExecutionResultPreview(previewResult) {
  switch (previewResult.status) {
    case "preview_available":
      return "BrokerExecutionResult preview available. No real BrokerExecutionResult was created.";
    case "partial_only":
      return "Preview blocked: capture is partial only. No real BrokerExecutionResult was created.";
    case "duplicate_risk":
      return "Preview blocked: duplicate evidence fingerprint. No real BrokerExecutionResult was created.";
    case "blocked":
      return `Preview blocked: ${
        previewResult.blockers?.[0] ?? "mapping checks failed"
      }. No real BrokerExecutionResult was created.`;
    case "failed":
      return "Preview failed. No real BrokerExecutionResult was created.";
    default:
      return "Preview unavailable: not eligible. No real BrokerExecutionResult was created.";
  }
}

function buildBrokerExecutionResultPreviewFromCapture(input) {
  const captureResult = input.captureResult;
  const eligibility =
    isObject(input.eligibilityResult)
      ? input.eligibilityResult
      : evaluateBrokerExecutionResultEligibilityStub({
          captureResult,
          existingFingerprints: input.existingFingerprints,
          options: input.options,
          checkedAt: input.checkedAt,
        });

  if (!eligibility.ok || eligibility.status !== "eligible") {
    return createBrokerExecutionResultPreviewResult(
      captureResult,
      eligibility,
      mapPreviewStatusFromEligibility(eligibility.status),
      {
        checkedAt: input.checkedAt,
        blockers:
          eligibility.blockers?.length > 0
            ? eligibility.blockers
            : ["Capture evidence is not eligible for preview conversion."],
        warnings: eligibility.warnings,
        errors: eligibility.errors,
        metadata: input.metadata,
      },
    );
  }

  const readback = isObject(captureResult?.brokerConfirmationReadback)
    ? captureResult.brokerConfirmationReadback
    : null;

  if (!readback) {
    return createBrokerExecutionResultPreviewResult(
      captureResult,
      eligibility,
      "blocked",
      {
        checkedAt: input.checkedAt,
        blockers: ["Broker confirmation readback is missing."],
        errors: ["Broker confirmation readback is missing."],
        metadata: input.metadata,
      },
    );
  }

  const action =
    readback.action === "buy" || readback.action === "sell"
      ? readback.action
      : null;
  const ticker = stringValue(readback.ticker);
  const quantity = numberFromInput(readback.quantityValue);
  const price = numberFromInput(readback.priceValue);
  const fees = numberFromInput(readback.fees);
  const totalAmount = numberFromInput(readback.totalAmount);
  const timestamp = stringValue(readback.timestamp);
  const brokerOrderId = stringValue(readback.orderIdSanitized);
  const blockers = [];
  const warnings = [...(eligibility.warnings ?? [])];
  const fields = [
    {
      field: "broker",
      value: "avanza",
      source: "constant",
      required: true,
    },
    {
      field: "action",
      value: action,
      source: "brokerConfirmationReadback.action",
      required: true,
      ...(action ? {} : { warning: "Action is missing or unsupported." }),
    },
    {
      field: "ticker",
      value: ticker ?? null,
      source: "brokerConfirmationReadback.ticker",
      required: true,
      ...(ticker ? {} : { warning: "Ticker is missing." }),
    },
    {
      field: "quantity",
      value: quantity,
      source: "brokerConfirmationReadback.quantityValue",
      required: true,
      ...(quantity !== null && quantity > 0
        ? {}
        : { warning: "Quantity is missing or invalid." }),
    },
    {
      field: "price",
      value: price,
      source: "brokerConfirmationReadback.priceValue",
      required: true,
      ...(price !== null && price > 0
        ? {}
        : { warning: "Price is missing or invalid." }),
    },
    {
      field: "timestamp",
      value: timestamp ?? null,
      source: "brokerConfirmationReadback.timestamp",
      required: true,
      ...(timestamp ? {} : { warning: "Broker timestamp is missing." }),
    },
    {
      field: "brokerOrderId",
      value: brokerOrderId ?? null,
      source: "brokerConfirmationReadback.orderIdSanitized",
      required: true,
      ...(brokerOrderId ? {} : { warning: "Broker order id is missing." }),
    },
    {
      field: "fees",
      value: fees,
      source: "brokerConfirmationReadback.fees",
      required: false,
      ...(fees === null ? { warning: "Broker fees/courtage are missing." } : {}),
    },
    {
      field: "totalAmount",
      value: totalAmount,
      source: "brokerConfirmationReadback.totalAmount",
      required: false,
      ...(totalAmount === null
        ? { warning: "Broker total amount is missing." }
        : {}),
    },
    {
      field: "sourceCaptureFingerprint",
      value: eligibility.evidenceFingerprint,
      source: "eligibility.evidenceFingerprint",
      required: true,
    },
  ];

  if (!action) {
    blockers.push("Broker confirmation action is missing or unsupported.");
  }

  if (!ticker) {
    blockers.push("Broker confirmation ticker is missing.");
  }

  if (quantity === null || quantity <= 0) {
    blockers.push("Broker confirmation quantity is missing or invalid.");
  }

  if (price === null || price <= 0) {
    blockers.push("Broker confirmation price is missing or invalid.");
  }

  if (!timestamp) {
    warnings.push("Broker confirmation timestamp is missing.");
  }

  if (!brokerOrderId) {
    warnings.push("Broker confirmation order id is missing.");
  }

  if (fees === null) {
    warnings.push("Broker fees/courtage are missing.");
  }

  if (totalAmount === null) {
    warnings.push("Broker total amount is missing.");
  }

  const fieldWarnings = fields
    .map((field) => field.warning)
    .filter((warning) => typeof warning === "string");

  if (blockers.length > 0) {
    return createBrokerExecutionResultPreviewResult(
      captureResult,
      eligibility,
      "blocked",
      {
        checkedAt: input.checkedAt,
        fields,
        blockers,
        errors: blockers,
        warnings: [...warnings, ...fieldWarnings],
        metadata: input.metadata,
      },
    );
  }

  const previewWarnings = [...new Set([...warnings, ...fieldWarnings])];
  const preview = {
    broker: "avanza",
    action,
    ticker,
    ...(stringValue(readback.name)
      ? { instrumentName: stringValue(readback.name) }
      : {}),
    ...(stringValue(readback.market) ? { market: stringValue(readback.market) } : {}),
    ...(stringValue(readback.currency)
      ? { currency: stringValue(readback.currency) }
      : {}),
    ...(stringValue(readback.instrumentType)
      ? { instrumentType: stringValue(readback.instrumentType) }
      : {}),
    quantity,
    price,
    ...(fees !== null ? { fees } : {}),
    ...(totalAmount !== null ? { totalAmount } : {}),
    ...(timestamp ? { timestamp } : {}),
    ...(brokerOrderId ? { brokerOrderId } : {}),
    orderStatus: captureResult.orderStatus,
    sourceCaptureFingerprint: eligibility.evidenceFingerprint,
    ...(stringValue(input.metadata?.sourceRequestId)
      ? { sourceRequestId: stringValue(input.metadata.sourceRequestId) }
      : {}),
    ...(stringValue(input.metadata?.sourceCaptureId)
      ? { sourceCaptureId: stringValue(input.metadata.sourceCaptureId) }
      : {}),
    warnings: previewWarnings,
    metadata: {
      version: AVANZA_BROKER_EXECUTION_RESULT_PREVIEW_VERSION,
      previewOnly: true,
      notBrokerExecutionResult: true,
      noExecutionRecord: true,
      noSupabaseWrite: true,
      noTradeMutation: true,
      eligibilityStatus: eligibility.status,
      captureStatus: captureResult.status,
      orderStatus: captureResult.orderStatus,
      source: "avanza_broker_confirmation_capture",
      ...(isObject(input.metadata)
        ? { metadata: { ...input.metadata } }
        : {}),
    },
  };

  return createBrokerExecutionResultPreviewResult(
    captureResult,
    eligibility,
    "preview_available",
    {
      checkedAt: input.checkedAt,
      preview,
      fields,
      warnings: previewWarnings,
      metadata: input.metadata,
    },
  );
}

function buildPreviewCaptureForMode(mode, checkedAt, payload) {
  if (isObject(payload?.captureResult) && mode === "unavailable") {
    return payload.captureResult;
  }

  const eligibilityMode =
    mode === "preview_available_filled"
      ? "eligible_filled"
      : mode === "preview_available_missing_optional"
        ? "eligible_filled"
        : mode === "partial_only_placed"
          ? "partial_placed"
          : mode === "partial_only_partially_filled"
            ? "partial_partially_filled"
            : mode === "duplicate_risk"
              ? "eligible_filled"
              : mode;
  const capture = buildEligibilityCaptureForMode(
    eligibilityMode,
    checkedAt,
    payload,
  );

  if (mode !== "preview_available_missing_optional" || !isObject(capture)) {
    return capture;
  }

  return {
    ...capture,
    brokerConfirmationReadback: {
      ...capture.brokerConfirmationReadback,
      fees: undefined,
      totalAmount: undefined,
      timestamp: undefined,
      orderIdSanitized: undefined,
    },
  };
}

function validateBrokerExecutionResultPreviewPayload(payload) {
  const errors = [];
  const warnings = [];

  if (!isObject(payload)) {
    return {
      errors: ["BrokerExecutionResult preview payload must be a JSON object."],
      warnings,
    };
  }

  if (payload.version !== CONTRACT_VERSION) {
    errors.push(
      `BrokerExecutionResult preview request version must be ${CONTRACT_VERSION}.`,
    );
  }

  if (!stringValue(payload.requestId)) {
    errors.push("BrokerExecutionResult preview request requestId is missing.");
  }

  if (
    !stringValue(payload.createdAt) ||
    !Number.isFinite(Date.parse(payload.createdAt))
  ) {
    errors.push(
      "BrokerExecutionResult preview request createdAt must be a valid timestamp.",
    );
  }

  if (
    typeof payload.existingFingerprints !== "undefined" &&
    !Array.isArray(payload.existingFingerprints)
  ) {
    errors.push(
      "BrokerExecutionResult preview request existingFingerprints must be an array when provided.",
    );
  }

  if (hasUnsafeDryRunMetadata(payload.metadata)) {
    errors.push(
      "BrokerExecutionResult preview request metadata contains unsafe submit or broker automation flags.",
    );
  }

  return { errors, warnings };
}

function buildBrokerExecutionResultPreviewResponse(payload) {
  const receivedAt = now();
  const checkedAt = receivedAt;
  const requestId =
    stringValue(payload?.requestId) ??
    "unknown_broker_execution_result_preview_request";
  const payloadValidation =
    validateBrokerExecutionResultPreviewPayload(payload);
  const mode =
    stringValue(
      process.env.AVANZA_LOCALHOST_BRIDGE_BROKER_EXECUTION_RESULT_PREVIEW_MODE,
    ) ?? "unavailable";
  const supportedModes = new Set([
    "unavailable",
    "preview_available_filled",
    "preview_available_missing_optional",
    "partial_only_placed",
    "partial_only_partially_filled",
    "blocked_mismatch",
    "blocked_rejected",
    "blocked_sensitive",
    "duplicate_risk",
    "not_eligible_capture_missing",
  ]);
  const normalizedMode = supportedModes.has(mode) ? mode : "unavailable";
  const captureResult =
    payloadValidation.errors.length === 0
      ? buildPreviewCaptureForMode(normalizedMode, checkedAt, payload)
      : null;
  const fingerprint = captureResult
    ? buildBrokerConfirmationEvidenceFingerprint(captureResult)
    : "missing";
  const previewResult =
    payloadValidation.errors.length > 0
      ? createBrokerExecutionResultPreviewResult(
          createBrokerConfirmationCaptureResult(
            "failed",
            {
              action: "buy",
              instrument: { ticker: "UNKNOWN" },
              quantity: 1,
              price: 1,
            },
            createFallbackManualConfirmationWaitResult(
              "waiting_for_manual_confirmation",
            ),
            {
              checkedAt,
              blockers: payloadValidation.errors,
              errors: payloadValidation.errors,
            },
          ),
          createBrokerExecutionResultEligibilityResult(
            createBrokerConfirmationCaptureResult(
              "failed",
              {
                action: "buy",
                instrument: { ticker: "UNKNOWN" },
                quantity: 1,
                price: 1,
              },
              createFallbackManualConfirmationWaitResult(
                "waiting_for_manual_confirmation",
              ),
              {
                checkedAt,
                blockers: payloadValidation.errors,
                errors: payloadValidation.errors,
              },
            ),
            "failed",
            {
              checkedAt,
              reasons: ["capture_not_captured"],
              blockers: payloadValidation.errors,
              errors: payloadValidation.errors,
              evidenceFingerprint: "missing",
              options: payload?.options,
            },
          ),
          "failed",
          {
            checkedAt,
            blockers: payloadValidation.errors,
            errors: payloadValidation.errors,
            metadata: payload?.metadata,
          },
        )
      : buildBrokerExecutionResultPreviewFromCapture({
          captureResult,
          eligibilityResult: payload?.eligibilityResult,
          existingFingerprints:
            normalizedMode === "duplicate_risk"
              ? [...(payload?.existingFingerprints ?? []), fingerprint]
              : payload?.existingFingerprints,
          options:
            normalizedMode === "preview_available_missing_optional"
              ? {
                  ...(payload?.options ?? {}),
                  allowMissingOrderId: true,
                  allowMissingTimestamp: true,
                }
              : payload?.options,
          checkedAt,
          metadata: payload?.metadata,
        });
  const statusCode =
    payloadValidation.errors.length > 0 || previewResult.status === "failed"
      ? 400
      : previewResult.status === "preview_available"
        ? 200
        : previewResult.status === "not_eligible" &&
            normalizedMode === "unavailable"
          ? 501
          : 400;
  const baseWarnings = [
    "BrokerExecutionResult preview is not a real BrokerExecutionResult.",
    "No execution record was created.",
    "No Supabase write occurred.",
    "No trade mutation occurred.",
  ];

  return {
    statusCode,
    body: {
      version: CONTRACT_VERSION,
      ok: previewResult.ok,
      bridgeVersion: CONTRACT_VERSION,
      requestId,
      receivedAt,
      completedAt: now(),
      brokerExecutionResultPreview: previewResult,
      message:
        previewResult.status === "preview_available"
          ? "Localhost bridge BrokerExecutionResult preview stub returned synthetic preview-only data. No real BrokerExecutionResult was created."
          : "Localhost bridge BrokerExecutionResult preview stub completed safely. No real BrokerExecutionResult was created.",
      errors: [
        ...new Set([...payloadValidation.errors, ...previewResult.errors]),
      ],
      warnings: [
        ...new Set([
          ...baseWarnings,
          ...payloadValidation.warnings,
          ...previewResult.warnings,
        ]),
      ],
      metadata: {
        ...(isObject(payload?.metadata) ? payload.metadata : {}),
        localhost_bridge_stub: true,
        broker_execution_result_preview_endpoint_stub: true,
        broker_execution_result_preview_mode: normalizedMode,
        preview_only: true,
        no_browser_control: true,
        no_browser_actions_executed: true,
        no_avanza_page_touched: true,
        no_avanza_urls: true,
        no_avanza_selectors: true,
        no_bekrafta_clicked: true,
        no_final_confirm_click: true,
        no_broker_submission: true,
        no_real_broker_execution_result_created: true,
        no_execution_record_created: true,
        no_supabase_write: true,
        no_trade_mutation: true,
        summary: summarizeBrokerExecutionResultPreview(previewResult),
      },
    },
  };
}

const EXECUTION_RECORD_ELIGIBILITY_VERSION =
  "execution_record_eligibility_v1";

function normalizeExecutionRecordEligibilityOptions(options) {
  return {
    allowPreviewOnly: options?.allowPreviewOnly === true,
    allowMissingBrokerReference:
      options?.allowMissingBrokerReference === true,
    allowMissingTimestamp: options?.allowMissingTimestamp === true,
    requireFilledStatus: options?.requireFilledStatus !== false,
  };
}

function buildExecutionRecordCandidateFingerprint(candidate) {
  const textPart = (value) => {
    const normalized = String(value ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");

    return encodeURIComponent(normalized.length > 0 ? normalized : "missing");
  };
  const numberPart = (value) =>
    typeof value === "number" && Number.isFinite(value)
      ? String(value)
      : "missing";

  return [
    "execution_record_candidate",
    textPart(candidate?.broker),
    textPart(candidate?.action),
    textPart(candidate?.ticker),
    numberPart(candidate?.quantity),
    numberPart(candidate?.price),
    textPart(candidate?.timestamp),
    textPart(candidate?.brokerOrderId),
    textPart(candidate?.sourceEvidenceFingerprint),
    textPart(candidate?.sourceBrokerResultFingerprint),
  ].join("|");
}

function createExecutionRecordEligibilityResult(status, options = {}) {
  const normalizedOptions = normalizeExecutionRecordEligibilityOptions(
    options.options,
  );
  const reasons = [...new Set(options.reasons ?? [])];
  const blockers = [...new Set(options.blockers ?? [])];
  const warnings = [...new Set(options.warnings ?? [])];
  const errors = [...new Set(options.errors ?? blockers)];

  return {
    ok: status === "eligible",
    status,
    checkedAt: options.checkedAt ?? now(),
    eligible: status === "eligible",
    reasons,
    blockers,
    warnings,
    errors,
    ...(options.recordFingerprint
      ? { recordFingerprint: options.recordFingerprint }
      : {}),
    labels: [
      "Execution record eligibility only",
      "No execution record created",
      "No Supabase write",
      "No trade mutation",
    ],
    metadata: {
      version: EXECUTION_RECORD_ELIGIBILITY_VERSION,
      eligibilityOnly: true,
      noExecutionRecordCreated: true,
      noSupabaseWrite: true,
      noTradeMutation: true,
      options: normalizedOptions,
    },
  };
}

function createExecutionRecordCandidate(overrides = {}) {
  return {
    broker: "avanza",
    action: "buy",
    ticker: "QA.RECORD",
    instrumentName: "QA Record Instrument",
    market: "Stockholm",
    currency: "SEK",
    instrumentType: "stock",
    quantity: 10,
    price: 123.45,
    fees: 1,
    totalAmount: 1235.5,
    timestamp: "2026-06-11T16:05:00.000Z",
    brokerOrderId: "AVZ-RECORD-ELIGIBILITY-001",
    sourceEvidenceFingerprint: "evidence-record-eligibility-001",
    sourceRequestId: "execution_record_eligibility_request_stub",
    sourceCaptureId: "execution_record_capture_stub",
    sourceBrokerResultFingerprint: "broker-result-record-eligibility-001",
    status: "filled",
    warnings: [],
    metadata: {
      previewOnly: false,
    },
    ...overrides,
    metadata: {
      previewOnly: false,
      ...(isObject(overrides.metadata) ? overrides.metadata : {}),
    },
  };
}

function evaluateExecutionRecordEligibilityStub(input) {
  const candidate = input.candidate;
  const options = normalizeExecutionRecordEligibilityOptions(input.options);

  if (!isObject(candidate)) {
    return createExecutionRecordEligibilityResult("not_eligible", {
      checkedAt: input.checkedAt,
      reasons: ["broker_result_missing"],
      blockers: ["Broker result candidate is missing."],
      options,
    });
  }

  const recordFingerprint = buildExecutionRecordCandidateFingerprint(candidate);
  const reasons = [];
  const blockers = [];
  const warnings = [...(Array.isArray(candidate.warnings) ? candidate.warnings : [])];

  if (
    candidate.metadata?.previewOnly === true ||
    candidate.metadata?.notBrokerExecutionResult === true
  ) {
    reasons.push("broker_result_preview_only");
    if (options.allowPreviewOnly) {
      reasons.push("manual_review_required");
      warnings.push(
        "Preview-only broker result was allowed by explicit option; manual review is required before any future record creation.",
      );
    } else {
      blockers.push(
        "Broker result candidate is preview-only and cannot become an execution record.",
      );
    }
  }

  if (candidate.action !== "buy" && candidate.action !== "sell") {
    reasons.push("missing_action");
    blockers.push("Broker result candidate action is missing or unsupported.");
  }

  if (!stringValue(candidate.ticker)) {
    reasons.push("missing_instrument");
    blockers.push("Broker result candidate ticker/instrument is missing.");
  }

  if (
    typeof candidate.quantity !== "number" ||
    !Number.isFinite(candidate.quantity) ||
    candidate.quantity <= 0
  ) {
    reasons.push("missing_quantity");
    blockers.push("Broker result candidate quantity is missing or invalid.");
  }

  if (
    typeof candidate.price !== "number" ||
    !Number.isFinite(candidate.price) ||
    candidate.price <= 0
  ) {
    reasons.push("missing_price");
    blockers.push("Broker result candidate price is missing or invalid.");
  }

  if (!stringValue(candidate.timestamp)) {
    reasons.push("missing_timestamp");
    if (options.allowMissingTimestamp) {
      warnings.push("Broker result candidate timestamp is missing.");
    } else {
      blockers.push("Broker result candidate timestamp is missing.");
    }
  }

  if (!stringValue(candidate.brokerOrderId)) {
    reasons.push("missing_broker_reference");
    if (options.allowMissingBrokerReference) {
      warnings.push("Broker result candidate broker reference is missing.");
    } else {
      blockers.push("Broker result candidate broker reference is missing.");
    }
  }

  if (
    !stringValue(candidate.sourceEvidenceFingerprint) &&
    !stringValue(candidate.sourceBrokerResultFingerprint)
  ) {
    reasons.push("missing_source_fingerprint");
    blockers.push("Broker result candidate source fingerprint is missing.");
  }

  if (
    options.requireFilledStatus &&
    !["filled", "executed"].includes(
      String(candidate.status ?? "").trim().toLowerCase(),
    )
  ) {
    reasons.push("broker_result_not_filled");
    blockers.push("Broker result candidate status is not filled/executed.");
  }

  if (
    candidate.metadata?.sensitiveDataDetected === true ||
    candidate.metadata?.accountDataDetected === true ||
    candidate.metadata?.balanceDataDetected === true ||
    candidate.metadata?.holdingsDataDetected === true
  ) {
    reasons.push("sensitive_data_detected");
    blockers.push(
      "Sensitive account, balance, holdings, or personal data was detected.",
    );
  }

  if (candidate.metadata?.rawDataDetected === true) {
    reasons.push("raw_data_detected");
    blockers.push("Raw or unsanitized source data was detected.");
  }

  if (candidate.metadata?.supabaseWriteAttempted === true) {
    reasons.push("supabase_write_attempted");
    blockers.push(
      "Supabase write was attempted during eligibility evaluation.",
    );
  }

  if (candidate.metadata?.tradeMutationAttempted === true) {
    reasons.push("trade_mutation_attempted");
    blockers.push(
      "Trade mutation was attempted during eligibility evaluation.",
    );
  }

  if (candidate.metadata?.executionRecordCreationAttempted === true) {
    reasons.push("execution_record_creation_attempted");
    blockers.push(
      "Execution record creation was attempted before eligibility was approved.",
    );
  }

  if (blockers.length > 0) {
    return createExecutionRecordEligibilityResult("blocked", {
      checkedAt: input.checkedAt,
      reasons,
      blockers,
      warnings,
      recordFingerprint,
      options,
    });
  }

  const existingSourceFingerprints = new Set(
    input.existingSourceFingerprints ?? [],
  );
  const sourceFingerprints = [
    stringValue(candidate.sourceEvidenceFingerprint),
    stringValue(candidate.sourceBrokerResultFingerprint),
    recordFingerprint,
  ].filter(Boolean);

  if (
    sourceFingerprints.some((fingerprint) =>
      existingSourceFingerprints.has(fingerprint),
    )
  ) {
    return createExecutionRecordEligibilityResult("duplicate_risk", {
      checkedAt: input.checkedAt,
      reasons: ["duplicate_source_fingerprint"],
      blockers: [
        "Source fingerprint already exists; creating another execution record would risk a duplicate.",
      ],
      warnings,
      recordFingerprint,
      options,
    });
  }

  const brokerReference = stringValue(candidate.brokerOrderId);
  const existingBrokerReferences = new Set(
    input.existingBrokerReferences ?? [],
  );

  if (brokerReference && existingBrokerReferences.has(brokerReference)) {
    return createExecutionRecordEligibilityResult("duplicate_risk", {
      checkedAt: input.checkedAt,
      reasons: ["duplicate_broker_reference"],
      blockers: [
        "Broker reference already exists; creating another execution record would risk a duplicate.",
      ],
      warnings,
      recordFingerprint,
      options,
    });
  }

  return createExecutionRecordEligibilityResult("eligible", {
    checkedAt: input.checkedAt,
    reasons,
    warnings,
    recordFingerprint,
    options,
  });
}

function buildExecutionRecordEligibilityCandidateForMode(mode, payload) {
  if (isObject(payload?.candidate) && mode === "unavailable") {
    return payload.candidate;
  }

  switch (mode) {
    case "eligible_filled":
      return createExecutionRecordCandidate();
    case "blocked_preview_only":
      return createExecutionRecordCandidate({
        metadata: { previewOnly: true, notBrokerExecutionResult: true },
      });
    case "blocked_missing_price":
      return createExecutionRecordCandidate({ price: undefined });
    case "blocked_missing_quantity":
      return createExecutionRecordCandidate({ quantity: undefined });
    case "blocked_missing_timestamp":
      return createExecutionRecordCandidate({ timestamp: undefined });
    case "blocked_missing_broker_reference":
      return createExecutionRecordCandidate({ brokerOrderId: undefined });
    case "blocked_not_filled":
      return createExecutionRecordCandidate({
        status: "placed",
        brokerOrderId: "AVZ-RECORD-NOT-FILLED",
        sourceEvidenceFingerprint: "evidence-record-not-filled",
      });
    case "blocked_sensitive":
      return createExecutionRecordCandidate({
        metadata: { sensitiveDataDetected: true, rawDataDetected: true },
      });
    case "blocked_supabase_write_attempt":
      return createExecutionRecordCandidate({
        metadata: { supabaseWriteAttempted: true },
      });
    case "blocked_trade_mutation_attempt":
      return createExecutionRecordCandidate({
        metadata: { tradeMutationAttempted: true },
      });
    case "blocked_record_creation_attempt":
      return createExecutionRecordCandidate({
        metadata: { executionRecordCreationAttempted: true },
      });
    case "duplicate_source_fingerprint":
    case "duplicate_broker_reference":
      return createExecutionRecordCandidate();
    case "not_eligible_missing_candidate":
    case "unavailable":
    default:
      return null;
  }
}

function validateExecutionRecordEligibilityPayload(payload) {
  const errors = [];
  const warnings = [];

  if (!isObject(payload)) {
    return {
      errors: ["Execution record eligibility payload must be a JSON object."],
      warnings,
    };
  }

  if (payload.version !== CONTRACT_VERSION) {
    errors.push(
      `Execution record eligibility request version must be ${CONTRACT_VERSION}.`,
    );
  }

  if (!stringValue(payload.requestId)) {
    errors.push("Execution record eligibility request requestId is missing.");
  }

  if (
    !stringValue(payload.createdAt) ||
    !Number.isFinite(Date.parse(payload.createdAt))
  ) {
    errors.push(
      "Execution record eligibility request createdAt must be a valid timestamp.",
    );
  }

  for (const key of [
    "existingSourceFingerprints",
    "existingBrokerReferences",
  ]) {
    if (typeof payload[key] !== "undefined" && !Array.isArray(payload[key])) {
      errors.push(
        `Execution record eligibility request ${key} must be an array when provided.`,
      );
    }
  }

  if (hasUnsafeDryRunMetadata(payload.metadata)) {
    errors.push(
      "Execution record eligibility request metadata contains unsafe submit or broker automation flags.",
    );
  }

  return { errors, warnings };
}

function summarizeExecutionRecordEligibility(eligibility) {
  switch (eligibility.status) {
    case "eligible":
      return "Eligible for future local execution record creation. No execution record was created.";
    case "duplicate_risk":
      return `Duplicate risk: ${
        eligibility.blockers?.[0] ??
        "source evidence or broker reference already exists"
      }. No execution record was created.`;
    case "blocked":
      return `Blocked: ${
        eligibility.blockers?.[0] ?? "eligibility checks failed"
      }. No execution record was created.`;
    case "failed":
      return "Execution record eligibility check failed. No execution record was created.";
    default:
      return `Not eligible: ${
        eligibility.blockers?.[0] ?? "candidate is not eligible"
      }. No execution record was created.`;
  }
}

function buildExecutionRecordEligibilityResponse(payload) {
  const receivedAt = now();
  const checkedAt = receivedAt;
  const requestId =
    stringValue(payload?.requestId) ??
    "unknown_execution_record_eligibility_request";
  const payloadValidation = validateExecutionRecordEligibilityPayload(payload);
  const mode =
    stringValue(
      process.env.AVANZA_LOCALHOST_BRIDGE_EXECUTION_RECORD_ELIGIBILITY_MODE,
    ) ?? "unavailable";
  const supportedModes = new Set([
    "unavailable",
    "eligible_filled",
    "blocked_preview_only",
    "blocked_missing_price",
    "blocked_missing_quantity",
    "blocked_missing_timestamp",
    "blocked_missing_broker_reference",
    "blocked_not_filled",
    "blocked_sensitive",
    "blocked_supabase_write_attempt",
    "blocked_trade_mutation_attempt",
    "blocked_record_creation_attempt",
    "duplicate_source_fingerprint",
    "duplicate_broker_reference",
    "not_eligible_missing_candidate",
  ]);
  const normalizedMode = supportedModes.has(mode) ? mode : "unavailable";
  const candidate =
    payloadValidation.errors.length === 0
      ? buildExecutionRecordEligibilityCandidateForMode(normalizedMode, payload)
      : null;
  const candidateFingerprint = candidate
    ? buildExecutionRecordCandidateFingerprint(candidate)
    : "missing";
  const existingSourceFingerprints =
    normalizedMode === "duplicate_source_fingerprint"
      ? [candidateFingerprint]
      : Array.isArray(payload?.existingSourceFingerprints)
        ? payload.existingSourceFingerprints
        : [];
  const existingBrokerReferences =
    normalizedMode === "duplicate_broker_reference" && candidate?.brokerOrderId
      ? [candidate.brokerOrderId]
      : Array.isArray(payload?.existingBrokerReferences)
        ? payload.existingBrokerReferences
        : [];
  const executionRecordEligibility =
    payloadValidation.errors.length > 0
      ? createExecutionRecordEligibilityResult("failed", {
          checkedAt,
          reasons: ["broker_result_missing"],
          blockers: payloadValidation.errors,
          errors: payloadValidation.errors,
          options: payload?.options,
        })
      : evaluateExecutionRecordEligibilityStub({
          candidate,
          existingSourceFingerprints,
          existingBrokerReferences,
          options: payload?.options,
          checkedAt,
        });
  const statusCode =
    payloadValidation.errors.length > 0 ||
    executionRecordEligibility.status === "failed"
      ? 400
      : executionRecordEligibility.status === "eligible"
        ? 200
        : normalizedMode === "unavailable"
          ? 501
          : 400;
  const baseWarnings = [
    "Execution record creation is not implemented.",
    "Eligibility check only.",
    "No BrokerExecutionResult was created.",
    "No execution record was created.",
    "No Supabase write occurred.",
    "No trade mutation occurred.",
  ];

  return {
    statusCode,
    body: {
      version: CONTRACT_VERSION,
      ok: executionRecordEligibility.ok,
      bridgeVersion: CONTRACT_VERSION,
      requestId,
      receivedAt,
      completedAt: now(),
      executionRecordEligibility,
      message:
        executionRecordEligibility.status === "eligible"
          ? "Localhost bridge execution-record-eligibility stub returned synthetic eligible metadata. No execution record was created."
          : "Localhost bridge execution-record-eligibility stub completed safely. No execution record was created.",
      errors: [
        ...new Set([
          ...payloadValidation.errors,
          ...executionRecordEligibility.errors,
        ]),
      ],
      warnings: [
        ...new Set([
          ...baseWarnings,
          ...payloadValidation.warnings,
          ...executionRecordEligibility.warnings,
        ]),
      ],
      metadata: {
        ...(isObject(payload?.metadata) ? payload.metadata : {}),
        localhost_bridge_stub: true,
        execution_record_eligibility_endpoint_stub: true,
        execution_record_eligibility_mode: normalizedMode,
        execution_record_eligibility_check_only: true,
        no_browser_control: true,
        no_browser_actions_executed: true,
        no_avanza_page_touched: true,
        no_avanza_urls: true,
        no_avanza_selectors: true,
        no_bekrafta_clicked: true,
        no_final_confirm_click: true,
        no_broker_submission: true,
        no_broker_execution_result_created: true,
        no_execution_record_created: true,
        no_supabase_write: true,
        no_trade_mutation: true,
        summary: summarizeExecutionRecordEligibility(
          executionRecordEligibility,
        ),
      },
    },
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
      selfCheck: "/self-check",
      avanzaOrderFormPreflight: "/preflight/avanza-order-form",
      liveFillOnlyRunnerVerify:
        "/live-fill-only-runner/verify-visible-order-form-state",
      liveFillOnlyRunnerFillAmount: "/live-fill-only-runner/fill-amount",
      liveFillOnlyRunnerFillPrice: "/live-fill-only-runner/fill-price",
      liveFillOnlyRunnerReadTotal: "/live-fill-only-runner/read-total",
      liveFillOnlyRunnerCaptureEvidence:
        "/live-fill-only-runner/capture-evidence",
      liveFillOnlyRunnerStopBeforeReview:
        "/live-fill-only-runner/stop-before-review",
      sessionDetection: "/session-detection",
      searchOnly: "/search-only",
      instrumentVerification: "/instrument-verification",
      instrumentPage: "/instrument-page",
      orderPageOpen: "/order-page-open",
      advancedFormFill: "/advanced-form-fill",
      reviewClick: "/review-click",
      manualConfirmationWait: "/manual-confirmation-wait",
      brokerConfirmationCapture: "/broker-confirmation-capture",
      brokerExecutionResultEligibility: "/broker-execution-result-eligibility",
      brokerExecutionResultPreview: "/broker-execution-result-preview",
      executionRecordEligibility: "/execution-record-eligibility",
      dryRun: "/dry-run",
      run: "/run",
      cancel: "/cancel",
    },
    message:
      "Local development stub only. No Avanza session opens, no real broker automation runs by default, and no broker result is created. /preflight/avanza-order-form is explicit manual browser observation only when enabled; /live-fill-only-runner/* is disabled unless the explicit live fill-only env gate is enabled and exposes no review/final/submit/order placement endpoints; /search-only, /instrument-verification, /instrument-page, /order-page-open, /advanced-form-fill, /review-click, /manual-confirmation-wait, /broker-confirmation-capture, /broker-execution-result-eligibility, /broker-execution-result-preview, /execution-record-eligibility, and /dry-run are contract validation stubs only; mock-page review runs only when explicitly requested.",
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

  if (request.method === "GET" && url.pathname === "/self-check") {
    writeJson(response, request, 200, buildRunnerSelfCheckResponse());
    return;
  }

  if (
    request.method === "GET" &&
    url.pathname === "/preflight/avanza-order-form"
  ) {
    writeJson(response, request, 200, await buildOrderFormPreflightResponse());
    return;
  }

  if (
    request.method === "POST" &&
    url.pathname === "/live-fill-only-runner/verify-visible-order-form-state"
  ) {
    writeJson(
      response,
      request,
      200,
      await buildLiveFillOnlyRunnerEndpointResponse(
        "verifyVisibleOrderFormState",
      ),
    );
    return;
  }

  if (
    request.method === "POST" &&
    url.pathname === "/live-fill-only-runner/fill-amount"
  ) {
    try {
      const payload = await readJsonBody(request);
      writeJson(
        response,
        request,
        200,
        await buildLiveFillOnlyRunnerEndpointResponse("fillAmountField", payload),
      );
    } catch (error) {
      writeJson(response, request, 400, {
        version: CONTRACT_VERSION,
        ok: false,
        status: "blocked",
        action: "fillAmountField",
        errors: [error instanceof Error ? error.message : "Invalid request."],
        message: "Live fill-only amount request could not be parsed.",
      });
    }
    return;
  }

  if (
    request.method === "POST" &&
    url.pathname === "/live-fill-only-runner/fill-price"
  ) {
    try {
      const payload = await readJsonBody(request);
      writeJson(
        response,
        request,
        200,
        await buildLiveFillOnlyRunnerEndpointResponse("fillPriceField", payload),
      );
    } catch (error) {
      writeJson(response, request, 400, {
        version: CONTRACT_VERSION,
        ok: false,
        status: "blocked",
        action: "fillPriceField",
        errors: [error instanceof Error ? error.message : "Invalid request."],
        message: "Live fill-only price request could not be parsed.",
      });
    }
    return;
  }

  if (
    request.method === "POST" &&
    url.pathname === "/live-fill-only-runner/read-total"
  ) {
    writeJson(
      response,
      request,
      200,
      await buildLiveFillOnlyRunnerEndpointResponse("readTotalAmount"),
    );
    return;
  }

  if (
    request.method === "POST" &&
    url.pathname === "/live-fill-only-runner/capture-evidence"
  ) {
    try {
      const payload = await readJsonBody(request);
      writeJson(
        response,
        request,
        200,
        await buildLiveFillOnlyRunnerEndpointResponse("captureEvidence", payload),
      );
    } catch (error) {
      writeJson(response, request, 400, {
        version: CONTRACT_VERSION,
        ok: false,
        status: "blocked",
        action: "captureEvidence",
        errors: [error instanceof Error ? error.message : "Invalid request."],
        message: "Live fill-only evidence request could not be parsed.",
      });
    }
    return;
  }

  if (
    request.method === "POST" &&
    url.pathname === "/live-fill-only-runner/stop-before-review"
  ) {
    writeJson(
      response,
      request,
      200,
      await buildLiveFillOnlyRunnerEndpointResponse("stopBeforeReview"),
    );
    return;
  }

  if (request.method === "GET" && url.pathname === "/session-detection") {
    writeJson(response, request, 200, buildSessionDetectionResponse());
    return;
  }

  if (request.method === "POST" && url.pathname === "/search-only") {
    try {
      const payload = await readJsonBody(request);
      const { statusCode, body } = buildSearchOnlyResponse(payload);
      writeJson(response, request, statusCode, body);
    } catch (error) {
      const receivedAt = now();
      const requestId = "unknown_search_only_request";

      writeJson(response, request, 400, {
        version: CONTRACT_VERSION,
        ok: false,
        bridgeVersion: CONTRACT_VERSION,
        requestId,
        receivedAt,
        completedAt: now(),
        searchOnly: createSearchOnlyResult("failed", { ticker: "UNKNOWN" }, {
          checkedAt: receivedAt,
          blockers: ["Search-only request could not be parsed."],
          errors: ["Search-only request could not be parsed."],
        }),
        message:
          "Localhost bridge stub could not parse search-only request. No browser action occurred.",
        errors: [error instanceof Error ? error.message : "Invalid request."],
        warnings: [
          "No browser actions were executed.",
          "No Avanza page was touched.",
          "No order page was opened.",
        ],
        metadata: {
          localhost_bridge_stub: true,
          search_only_endpoint_stub: true,
          no_browser_actions_executed: true,
          no_avanza_page_touched: true,
          no_order_page_opened: true,
          no_broker_result_created: true,
          no_trade_mutation: true,
        },
      });
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/instrument-verification") {
    try {
      const payload = await readJsonBody(request);
      const { statusCode, body } = buildInstrumentVerificationResponse(payload);
      writeJson(response, request, statusCode, body);
    } catch (error) {
      const receivedAt = now();

      writeJson(response, request, 400, {
        version: CONTRACT_VERSION,
        ok: false,
        bridgeVersion: CONTRACT_VERSION,
        requestId: "unknown_instrument_verification_request",
        receivedAt,
        completedAt: now(),
        instrumentVerification: createInstrumentVerificationResult(
          "failed",
          { ticker: "UNKNOWN" },
          {
            checkedAt: receivedAt,
            blockers: ["Instrument verification request could not be parsed."],
            errors: ["Instrument verification request could not be parsed."],
          },
        ),
        message:
          "Localhost bridge stub could not parse instrument verification request. No browser action occurred.",
        errors: [error instanceof Error ? error.message : "Invalid request."],
        warnings: [
          "No browser actions were executed.",
          "No Avanza page was touched.",
          "No order page was opened.",
        ],
        metadata: {
          localhost_bridge_stub: true,
          instrument_verification_endpoint_stub: true,
          no_browser_actions_executed: true,
          no_avanza_page_touched: true,
          no_order_page_opened: true,
          no_broker_result_created: true,
          no_trade_mutation: true,
        },
      });
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/instrument-page") {
    try {
      const payload = await readJsonBody(request);
      const { statusCode, body } = buildInstrumentPageResponse(payload);
      writeJson(response, request, statusCode, body);
    } catch (error) {
      const receivedAt = now();

      writeJson(response, request, 400, {
        version: CONTRACT_VERSION,
        ok: false,
        bridgeVersion: CONTRACT_VERSION,
        requestId: "unknown_instrument_page_request",
        receivedAt,
        completedAt: now(),
        instrumentPage: createInstrumentPageResult(
          "failed",
          { ticker: "UNKNOWN" },
          {
            checkedAt: receivedAt,
            blockers: ["Instrument page request could not be parsed."],
            errors: ["Instrument page request could not be parsed."],
          },
        ),
        message:
          "Localhost bridge stub could not parse instrument page request. No browser action occurred.",
        errors: [error instanceof Error ? error.message : "Invalid request."],
        warnings: [
          "No browser actions were executed.",
          "No Avanza page was touched.",
          "No order page was opened.",
          "No buy/sell click occurred.",
          "No form fill occurred.",
        ],
        metadata: {
          localhost_bridge_stub: true,
          instrument_page_endpoint_stub: true,
          no_browser_actions_executed: true,
          no_avanza_page_touched: true,
          no_order_page_opened: true,
          no_buy_sell_click: true,
          no_form_fill: true,
          no_broker_result_created: true,
          no_trade_mutation: true,
        },
      });
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/order-page-open") {
    try {
      const payload = await readJsonBody(request);
      const { statusCode, body } = buildOrderPageOpenResponse(payload);
      writeJson(response, request, statusCode, body);
    } catch (error) {
      const receivedAt = now();

      writeJson(response, request, 400, {
        version: CONTRACT_VERSION,
        ok: false,
        bridgeVersion: CONTRACT_VERSION,
        requestId: "unknown_order_page_open_request",
        receivedAt,
        completedAt: now(),
        orderPageOpen: createOrderPageOpenResult(
          "failed",
          {
            action: "buy",
            instrument: { ticker: "UNKNOWN" },
          },
          {
            checkedAt: receivedAt,
            blockers: ["Order-page-open request could not be parsed."],
            errors: ["Order-page-open request could not be parsed."],
          },
        ),
        message:
          "Localhost bridge stub could not parse order-page-open request. No browser action occurred.",
        errors: [error instanceof Error ? error.message : "Invalid request."],
        warnings: [
          "No browser actions were executed.",
          "No Avanza page was touched.",
          "No form fields were filled.",
          "No Granska click occurred.",
          "No Bekräfta click occurred.",
        ],
        metadata: {
          localhost_bridge_stub: true,
          order_page_open_endpoint_stub: true,
          no_browser_actions_executed: true,
          no_avanza_page_touched: true,
          no_real_order_page_opened: true,
          no_form_fill: true,
          no_review_click: true,
          no_final_confirm_click: true,
          no_broker_submission: true,
          no_broker_result_created: true,
          no_trade_mutation: true,
        },
      });
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/advanced-form-fill") {
    try {
      const payload = await readJsonBody(request);
      const { statusCode, body } = buildAdvancedFormFillResponse(payload);
      writeJson(response, request, statusCode, body);
    } catch (error) {
      const receivedAt = now();

      writeJson(response, request, 400, {
        version: CONTRACT_VERSION,
        ok: false,
        bridgeVersion: CONTRACT_VERSION,
        requestId: "unknown_advanced_form_fill_request",
        receivedAt,
        completedAt: now(),
        advancedFormFill: createAdvancedFormFillResult(
          "failed",
          {
            action: "buy",
            instrument: { ticker: "UNKNOWN" },
            quantity: 1,
            price: 1,
          },
          {
            checkedAt: receivedAt,
            blockers: ["Advanced form-fill request could not be parsed."],
            errors: ["Advanced form-fill request could not be parsed."],
          },
        ),
        message:
          "Localhost bridge stub could not parse advanced form-fill request. No browser action occurred.",
        errors: [error instanceof Error ? error.message : "Invalid request."],
        warnings: [
          "No browser actions were executed.",
          "No Avanza page was touched.",
          "No real form fields were filled.",
          "No Granska click occurred.",
          "No Bekräfta click occurred.",
        ],
        metadata: {
          localhost_bridge_stub: true,
          advanced_form_fill_endpoint_stub: true,
          no_browser_actions_executed: true,
          no_avanza_page_touched: true,
          no_real_form_fields_filled: true,
          no_review_click: true,
          no_final_confirm_click: true,
          no_broker_submission: true,
          no_broker_result_created: true,
          no_supabase_write: true,
          no_trade_mutation: true,
        },
      });
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/review-click") {
    try {
      const payload = await readJsonBody(request);
      const { statusCode, body } = buildReviewClickResponse(payload);
      writeJson(response, request, statusCode, body);
    } catch (error) {
      const receivedAt = now();

      writeJson(response, request, 400, {
        version: CONTRACT_VERSION,
        ok: false,
        bridgeVersion: CONTRACT_VERSION,
        requestId: "unknown_review_click_request",
        receivedAt,
        completedAt: now(),
        reviewClick: createReviewClickResult(
          "failed",
          {
            action: "buy",
            instrument: { ticker: "UNKNOWN" },
            quantity: 1,
            price: 1,
          },
          {
            checkedAt: receivedAt,
            blockers: ["Review-click request could not be parsed."],
            errors: ["Review-click request could not be parsed."],
          },
        ),
        message:
          "Localhost bridge stub could not parse review-click request. No browser action occurred.",
        errors: [error instanceof Error ? error.message : "Invalid request."],
        warnings: [
          "No browser actions were executed.",
          "No Avanza page was touched.",
          "No real Granska was clicked.",
          "No Bekräfta was clicked.",
          "No broker result was created.",
        ],
        metadata: {
          localhost_bridge_stub: true,
          review_click_endpoint_stub: true,
          no_browser_actions_executed: true,
          no_avanza_page_touched: true,
          no_real_granska_clicked: true,
          no_bekrafta_clicked: true,
          no_final_confirm_click: true,
          no_broker_submission: true,
          no_broker_result_created: true,
          no_supabase_write: true,
          no_trade_mutation: true,
        },
      });
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/manual-confirmation-wait") {
    try {
      const payload = await readJsonBody(request);
      const { statusCode, body } = buildManualConfirmationWaitResponse(payload);
      writeJson(response, request, statusCode, body);
    } catch (error) {
      const receivedAt = now();

      writeJson(response, request, 400, {
        version: CONTRACT_VERSION,
        ok: false,
        bridgeVersion: CONTRACT_VERSION,
        requestId: "unknown_manual_confirmation_wait_request",
        receivedAt,
        completedAt: now(),
        manualConfirmationWait: createManualConfirmationWaitResult(
          "failed",
          createFallbackReviewClickResult("failed"),
          {
            checkedAt: receivedAt,
            blockers: [
              "Manual confirmation wait request could not be parsed.",
            ],
            errors: ["Manual confirmation wait request could not be parsed."],
          },
        ),
        message:
          "Localhost bridge stub could not parse manual confirmation wait request. No browser action occurred.",
        errors: [error instanceof Error ? error.message : "Invalid request."],
        warnings: [
          "No browser actions were executed.",
          "No Avanza page was touched.",
          "No Bekräfta was clicked.",
          "No broker result was created.",
          "No trade mutation occurred.",
        ],
        metadata: {
          localhost_bridge_stub: true,
          manual_confirmation_wait_endpoint_stub: true,
          no_browser_control: true,
          no_browser_actions_executed: true,
          no_avanza_page_touched: true,
          no_avanza_urls: true,
          no_avanza_selectors: true,
          no_bekrafta_clicked: true,
          no_final_confirm_click: true,
          no_keyboard_submit: true,
          no_broker_submission: true,
          no_broker_result_created: true,
          no_supabase_write: true,
          no_trade_mutation: true,
        },
      });
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/broker-confirmation-capture") {
    try {
      const payload = await readJsonBody(request);
      const { statusCode, body } = buildBrokerConfirmationCaptureResponse(payload);
      writeJson(response, request, statusCode, body);
    } catch (error) {
      const receivedAt = now();
      const dryRunOrderInput = {
        action: "buy",
        instrument: { ticker: "UNKNOWN" },
        quantity: 1,
        price: 1,
        orderMode: "advanced",
        accountPolicy: "require_manual_review",
        stopPolicy: "stop_at_confirmation_modal",
        createdAt: receivedAt,
      };

      writeJson(response, request, 400, {
        version: CONTRACT_VERSION,
        ok: false,
        bridgeVersion: CONTRACT_VERSION,
        requestId: "unknown_broker_confirmation_capture_request",
        receivedAt,
        completedAt: now(),
        brokerConfirmationCapture: createBrokerConfirmationCaptureResult(
          "failed",
          dryRunOrderInput,
          createFallbackManualConfirmationWaitResult(
            "waiting_for_manual_confirmation",
          ),
          {
            checkedAt: receivedAt,
            blockers: [
              "Broker confirmation capture request could not be parsed.",
            ],
            errors: [
              "Broker confirmation capture request could not be parsed.",
            ],
          },
        ),
        message:
          "Localhost bridge stub could not parse broker confirmation capture request. No browser action occurred.",
        errors: [error instanceof Error ? error.message : "Invalid request."],
        warnings: [
          "No browser actions were executed.",
          "No Avanza page was touched.",
          "No Bekräfta was clicked by the agent.",
          "No BrokerExecutionResult was created.",
          "No execution record was created.",
          "No Supabase write occurred.",
          "No trade mutation occurred.",
        ],
        metadata: {
          localhost_bridge_stub: true,
          broker_confirmation_capture_endpoint_stub: true,
          no_browser_control: true,
          no_browser_actions_executed: true,
          no_avanza_page_touched: true,
          no_avanza_urls: true,
          no_avanza_selectors: true,
          no_bekrafta_clicked: true,
          no_final_confirm_click: true,
          no_broker_submission: true,
          no_broker_execution_result_created: true,
          no_execution_record_created: true,
          no_supabase_write: true,
          no_trade_mutation: true,
        },
      });
    }
    return;
  }

  if (
    request.method === "POST" &&
    url.pathname === "/broker-execution-result-eligibility"
  ) {
    try {
      const payload = await readJsonBody(request);
      const { statusCode, body } =
        buildBrokerExecutionResultEligibilityResponse(payload);
      writeJson(response, request, statusCode, body);
    } catch (error) {
      const receivedAt = now();
      const captureResult = createBrokerConfirmationCaptureResult(
        "failed",
        {
          action: "buy",
          instrument: { ticker: "UNKNOWN" },
          quantity: 1,
          price: 1,
        },
        createFallbackManualConfirmationWaitResult(
          "waiting_for_manual_confirmation",
        ),
        {
          checkedAt: receivedAt,
          blockers: [
            "BrokerExecutionResult eligibility request could not be parsed.",
          ],
          errors: [
            "BrokerExecutionResult eligibility request could not be parsed.",
          ],
        },
      );
      const eligibility = createBrokerExecutionResultEligibilityResult(
        captureResult,
        "failed",
        {
          checkedAt: receivedAt,
          reasons: ["capture_not_captured"],
          blockers: [
            "BrokerExecutionResult eligibility request could not be parsed.",
          ],
          errors: [
            "BrokerExecutionResult eligibility request could not be parsed.",
          ],
          evidenceFingerprint: "missing",
        },
      );

      writeJson(response, request, 400, {
        version: CONTRACT_VERSION,
        ok: false,
        bridgeVersion: CONTRACT_VERSION,
        requestId: "unknown_broker_execution_result_eligibility_request",
        receivedAt,
        completedAt: now(),
        eligibility,
        message:
          "Localhost bridge stub could not parse BrokerExecutionResult eligibility request. No BrokerExecutionResult was created.",
        errors: [error instanceof Error ? error.message : "Invalid request."],
        warnings: [
          "BrokerExecutionResult conversion is not implemented.",
          "Eligibility check only.",
          "No BrokerExecutionResult was created.",
          "No execution record was created.",
          "No Supabase write occurred.",
          "No trade mutation occurred.",
        ],
        metadata: {
          localhost_bridge_stub: true,
          broker_execution_result_eligibility_endpoint_stub: true,
          eligibility_check_only: true,
          no_browser_control: true,
          no_browser_actions_executed: true,
          no_avanza_page_touched: true,
          no_avanza_urls: true,
          no_avanza_selectors: true,
          no_bekrafta_clicked: true,
          no_final_confirm_click: true,
          no_broker_submission: true,
          no_broker_execution_result_created: true,
          no_execution_record_created: true,
          no_supabase_write: true,
          no_trade_mutation: true,
        },
      });
    }
    return;
  }

  if (
    request.method === "POST" &&
    url.pathname === "/broker-execution-result-preview"
  ) {
    try {
      const payload = await readJsonBody(request);
      const { statusCode, body } =
        buildBrokerExecutionResultPreviewResponse(payload);
      writeJson(response, request, statusCode, body);
    } catch (error) {
      const receivedAt = now();
      const captureResult = createBrokerConfirmationCaptureResult(
        "failed",
        {
          action: "buy",
          instrument: { ticker: "UNKNOWN" },
          quantity: 1,
          price: 1,
        },
        createFallbackManualConfirmationWaitResult(
          "waiting_for_manual_confirmation",
        ),
        {
          checkedAt: receivedAt,
          blockers: [
            "BrokerExecutionResult preview request could not be parsed.",
          ],
          errors: [
            "BrokerExecutionResult preview request could not be parsed.",
          ],
        },
      );
      const eligibility = createBrokerExecutionResultEligibilityResult(
        captureResult,
        "failed",
        {
          checkedAt: receivedAt,
          reasons: ["capture_not_captured"],
          blockers: [
            "BrokerExecutionResult preview request could not be parsed.",
          ],
          errors: [
            "BrokerExecutionResult preview request could not be parsed.",
          ],
          evidenceFingerprint: "missing",
        },
      );
      const brokerExecutionResultPreview =
        createBrokerExecutionResultPreviewResult(
          captureResult,
          eligibility,
          "failed",
          {
            checkedAt: receivedAt,
            blockers: [
              "BrokerExecutionResult preview request could not be parsed.",
            ],
            errors: [
              "BrokerExecutionResult preview request could not be parsed.",
            ],
          },
        );

      writeJson(response, request, 400, {
        version: CONTRACT_VERSION,
        ok: false,
        bridgeVersion: CONTRACT_VERSION,
        requestId: "unknown_broker_execution_result_preview_request",
        receivedAt,
        completedAt: now(),
        brokerExecutionResultPreview,
        message:
          "Localhost bridge stub could not parse BrokerExecutionResult preview request. No real BrokerExecutionResult was created.",
        errors: [error instanceof Error ? error.message : "Invalid request."],
        warnings: [
          "BrokerExecutionResult preview is not a real BrokerExecutionResult.",
          "No execution record was created.",
          "No Supabase write occurred.",
          "No trade mutation occurred.",
        ],
        metadata: {
          localhost_bridge_stub: true,
          broker_execution_result_preview_endpoint_stub: true,
          preview_only: true,
          no_browser_control: true,
          no_browser_actions_executed: true,
          no_avanza_page_touched: true,
          no_avanza_urls: true,
          no_avanza_selectors: true,
          no_bekrafta_clicked: true,
          no_final_confirm_click: true,
          no_broker_submission: true,
          no_real_broker_execution_result_created: true,
          no_execution_record_created: true,
          no_supabase_write: true,
          no_trade_mutation: true,
        },
      });
    }
    return;
  }

  if (
    request.method === "POST" &&
    url.pathname === "/execution-record-eligibility"
  ) {
    try {
      const payload = await readJsonBody(request);
      const { statusCode, body } =
        buildExecutionRecordEligibilityResponse(payload);
      writeJson(response, request, statusCode, body);
    } catch (error) {
      const receivedAt = now();
      const executionRecordEligibility =
        createExecutionRecordEligibilityResult("failed", {
          checkedAt: receivedAt,
          reasons: ["broker_result_missing"],
          blockers: [
            "Execution record eligibility request could not be parsed.",
          ],
          errors: [
            "Execution record eligibility request could not be parsed.",
          ],
          options: {},
        });

      writeJson(response, request, 400, {
        version: CONTRACT_VERSION,
        ok: false,
        bridgeVersion: CONTRACT_VERSION,
        requestId: "unknown_execution_record_eligibility_request",
        receivedAt,
        completedAt: now(),
        executionRecordEligibility,
        message:
          "Localhost bridge stub could not parse execution record eligibility request. No execution record was created.",
        errors: [error instanceof Error ? error.message : "Invalid request."],
        warnings: [
          "Execution record creation is not implemented.",
          "Eligibility check only.",
          "No BrokerExecutionResult was created.",
          "No execution record was created.",
          "No Supabase write occurred.",
          "No trade mutation occurred.",
        ],
        metadata: {
          localhost_bridge_stub: true,
          execution_record_eligibility_endpoint_stub: true,
          execution_record_eligibility_check_only: true,
          no_browser_control: true,
          no_browser_actions_executed: true,
          no_avanza_page_touched: true,
          no_avanza_urls: true,
          no_avanza_selectors: true,
          no_bekrafta_clicked: true,
          no_final_confirm_click: true,
          no_broker_submission: true,
          no_broker_execution_result_created: true,
          no_execution_record_created: true,
          no_supabase_write: true,
          no_trade_mutation: true,
        },
      });
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/dry-run") {
    try {
      const payload = await readJsonBody(request);
      const { statusCode, body } = buildDryRunResponse(payload);
      writeJson(response, request, statusCode, body);
    } catch (error) {
      const receivedAt = now();

      writeJson(response, request, 400, {
        version: CONTRACT_VERSION,
        ok: false,
        status: "blocked",
        bridgeVersion: CONTRACT_VERSION,
        requestId: "unknown_dry_run_request",
        receivedAt,
        completedAt: now(),
        dryRunRequestValidation: {
          ok: false,
          errors: ["Avanza dry-run request could not be parsed."],
          warnings: [],
        },
        capabilityValidation: {
          ok: false,
          blocked: true,
          errors: ["Dry-run request could not be parsed."],
          warnings: [],
          safetyLevel: "unknown_blocked",
          canRunMockBrowserActions: false,
          canRunAvanzaDryRun: false,
          canSubmitBrokerOrder: false,
        },
        diagnostics: null,
        message:
          "Localhost bridge stub could not parse dry-run request. No browser action occurred.",
        errors: [error instanceof Error ? error.message : "Invalid request."],
        warnings: [
          "No browser actions were executed.",
          "No broker submission was performed.",
        ],
      });
    }
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
