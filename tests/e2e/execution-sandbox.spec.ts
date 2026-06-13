import { expect, type Locator, type Page, test } from "@playwright/test";
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
  FINAL_CONFIRM_DENYLIST_TERMS,
  createSafeBrowserAction,
  isFinalConfirmLikeTarget,
  validateSafeBrowserAction,
} from "../../lib/safe-browser-action-contract";
import {
  hasFinalConfirmBlocked,
  summarizeSafeBrowserActionExecutionDiagnostics,
} from "../../lib/safe-browser-action-diagnostics";
import {
  createAvanzaDryRunBrowserRunnerCapability,
  createMockOnlyBrowserRunnerCapability,
  summarizeBrowserRunnerCapabilityValidation,
  validateBrowserRunnerCapability,
  type BrowserRunnerExecutionCapability,
} from "../../lib/browser-runner-capability-gate";
import {
  checkLocalhostBridgeAdvancedFormFill,
  checkLocalhostBridgeBrokerConfirmationCapture,
  checkLocalhostBridgeBrokerExecutionResultEligibility,
  checkLocalhostBridgeBrokerExecutionResultPreview,
  checkLocalhostBridgeExecutionRecordEligibility,
  checkLocalhostBridgeManualConfirmationWait,
  checkLocalhostBridgeReviewClick,
  checkLocalhostBridgeRunnerSelfCheck,
  checkLocalhostBridgeInstrumentPage,
  checkLocalhostBridgeInstrumentVerification,
  checkLocalhostBridgeOrderPageOpen,
  checkLocalhostBridgeSessionDetection,
  checkLocalhostBridgeSearchOnly,
  runLocalhostBridgeAvanzaDryRunStub,
  summarizeLocalhostAdvancedFormFillBridgeResponse,
  summarizeLocalhostBrokerConfirmationCaptureBridgeResponse,
  summarizeLocalhostBrokerExecutionResultEligibilityBridgeResponse,
  summarizeLocalhostBrokerExecutionResultPreviewBridgeResponse,
  summarizeLocalhostDryRunBridgeResponse,
  summarizeLocalhostExecutionRecordEligibilityBridgeResponse,
  summarizeLocalhostInstrumentPageBridgeResponse,
  summarizeLocalhostInstrumentVerificationBridgeResponse,
  summarizeLocalhostManualConfirmationWaitBridgeResponse,
  summarizeLocalhostOrderPageOpenBridgeResponse,
  summarizeLocalhostReviewClickBridgeResponse,
  summarizeLocalhostSessionDetectionBridgeResponse,
  summarizeLocalhostSearchOnlyBridgeResponse,
} from "../../lib/avanza-localhost-bridge-client";
import {
  buildLocalhostBridgeAdvancedFormFillRequest,
  buildLocalhostBridgeBrokerConfirmationCaptureRequest,
  buildLocalhostBridgeBrokerExecutionResultEligibilityRequest,
  buildLocalhostBridgeBrokerExecutionResultPreviewRequest,
  buildLocalhostBridgeDryRunRequest,
  buildLocalhostBridgeExecutionRecordEligibilityRequest,
  buildLocalhostBridgeInstrumentPageRequest,
  buildLocalhostBridgeInstrumentVerificationRequest,
  buildLocalhostBridgeOrderPageOpenRequest,
  buildLocalhostBridgeManualConfirmationWaitRequest,
  buildLocalhostBridgeReviewClickRequest,
  buildLocalhostBridgeSearchOnlyRequest,
  createLocalhostBridgeDryRunStubResponse,
  validateLocalhostBridgeAdvancedFormFillRequest,
  validateLocalhostBridgeAdvancedFormFillResponse,
  validateLocalhostBridgeBrokerConfirmationCaptureRequest,
  validateLocalhostBridgeBrokerConfirmationCaptureResponse,
  validateLocalhostBridgeBrokerExecutionResultEligibilityRequest,
  validateLocalhostBridgeBrokerExecutionResultEligibilityResponse,
  validateLocalhostBridgeBrokerExecutionResultPreviewRequest,
  validateLocalhostBridgeBrokerExecutionResultPreviewResponse,
  validateLocalhostBridgeDryRunRequest,
  validateLocalhostBridgeDryRunResponse,
  validateLocalhostBridgeExecutionRecordEligibilityRequest,
  validateLocalhostBridgeExecutionRecordEligibilityResponse,
  validateLocalhostBridgeInstrumentPageRequest,
  validateLocalhostBridgeInstrumentPageResponse,
  validateLocalhostBridgeInstrumentVerificationRequest,
  validateLocalhostBridgeInstrumentVerificationResponse,
  validateLocalhostBridgeOrderPageOpenRequest,
  validateLocalhostBridgeOrderPageOpenResponse,
  validateLocalhostBridgeManualConfirmationWaitRequest,
  validateLocalhostBridgeManualConfirmationWaitResponse,
  validateLocalhostBridgeReviewClickRequest,
  validateLocalhostBridgeReviewClickResponse,
  validateLocalhostBridgeRunnerSelfCheckResponse,
  validateLocalhostBridgeSearchOnlyRequest,
  validateLocalhostBridgeSearchOnlyResponse,
  validateLocalhostBridgeSessionDetectionResponse,
} from "../../lib/avanza-localhost-bridge-contract";
import {
  createUnavailableAvanzaDryRunRunnerSelfCheck,
  evaluateAvanzaDryRunRunnerSelfCheck,
  getAvanzaDryRunRunnerSelfCheckLabels,
  summarizeAvanzaDryRunRunnerSelfCheck,
} from "../../lib/avanza-dry-run-runner-self-check";
import {
  AVANZA_SESSION_DETECTION_CONTRACT_VERSION,
  createAvanzaSessionDetectionResult,
  evaluateAvanzaSessionDetectionContext,
  getAvanzaSessionDetectionSafetyLabels,
  isAvanzaSessionReadyForSearchOnly,
  summarizeAvanzaSessionDetectionResult,
} from "../../lib/avanza-session-detection-contract";
import {
  AVANZA_SEARCH_ONLY_MIN_EXACT_MATCH_CONFIDENCE,
  classifyAvanzaSearchOnlyCandidates,
  getAvanzaSearchOnlySafetyLabels,
  isAvanzaSearchOnlyExactMatch,
  normalizeAvanzaSearchOnlyText,
  scoreAvanzaSearchOnlyCandidate,
  summarizeAvanzaSearchOnlyResult,
  type AvanzaSearchOnlyCandidate,
  type AvanzaSearchOnlyExpectedInstrument,
} from "../../lib/avanza-search-only-result-contract";
import {
  AVANZA_INSTRUMENT_VERIFICATION_CONTRACT_VERSION,
  getAvanzaInstrumentVerificationSafetyLabels,
  isAvanzaInstrumentVerified,
  summarizeAvanzaInstrumentVerificationResult,
  verifyAvanzaInstrument,
} from "../../lib/avanza-instrument-verification-contract";
import {
  AVANZA_INSTRUMENT_PAGE_CONTRACT_VERSION,
  evaluateAvanzaInstrumentPage,
  getAvanzaInstrumentPageSafetyLabels,
  isAvanzaInstrumentPageIdentified,
  summarizeAvanzaInstrumentPageResult,
  type AvanzaInstrumentPageIdentity,
} from "../../lib/avanza-instrument-page-contract";
import {
  AVANZA_ORDER_PAGE_OPEN_CONTRACT_VERSION,
  evaluateAvanzaOrderPageOpen,
  getAvanzaOrderPageOpenSafetyLabels,
  isAvanzaOrderPageOpened,
  summarizeAvanzaOrderPageOpenResult,
  type AvanzaOrderPageIdentity,
} from "../../lib/avanza-order-page-open-contract";
import {
  AVANZA_ADVANCED_FORM_FILL_CONTRACT_VERSION,
  evaluateAvanzaAdvancedFormFill,
  getAvanzaAdvancedFormFillSafetyLabels,
  isAvanzaAdvancedFormFilled,
  summarizeAvanzaAdvancedFormFillResult,
  type AvanzaAdvancedFormFillResult,
  type AvanzaAdvancedFormState,
} from "../../lib/avanza-advanced-form-fill-contract";
import {
  AVANZA_REVIEW_CLICK_CONTRACT_VERSION,
  evaluateAvanzaReviewClick,
  getAvanzaReviewClickSafetyLabels,
  isAvanzaConfirmationReady,
  summarizeAvanzaReviewClickResult,
  type AvanzaConfirmationModalReadback,
  type AvanzaReviewClickResult,
} from "../../lib/avanza-review-click-contract";
import {
  AVANZA_MANUAL_CONFIRMATION_WAIT_CONTRACT_VERSION,
  evaluateAvanzaManualConfirmationWait,
  getAvanzaManualConfirmationWaitSafetyLabels,
  isAvanzaUserConfirmedUnverified,
  isAvanzaWaitingForManualConfirmation,
  summarizeAvanzaManualConfirmationWaitResult,
  type AvanzaManualConfirmationWaitObservation,
} from "../../lib/avanza-manual-confirmation-wait-contract";
import {
  AVANZA_BROKER_CONFIRMATION_CAPTURE_CONTRACT_VERSION,
  evaluateAvanzaBrokerConfirmationCapture,
  getAvanzaBrokerConfirmationCaptureSafetyLabels,
  isAvanzaBrokerConfirmationCaptured,
  isAvanzaBrokerConfirmationPartial,
  summarizeAvanzaBrokerConfirmationCaptureResult,
  type AvanzaBrokerConfirmationCaptureResult,
  type AvanzaBrokerConfirmationReadback,
} from "../../lib/avanza-broker-confirmation-capture-contract";
import {
  buildAvanzaBrokerConfirmationEvidenceFingerprint,
  evaluateAvanzaBrokerExecutionResultEligibility,
  getAvanzaBrokerExecutionResultEligibilityLabels,
  isAvanzaBrokerExecutionResultEligible,
  summarizeAvanzaBrokerExecutionResultEligibility,
  type AvanzaBrokerExecutionResultEligibilityResult,
} from "../../lib/avanza-broker-execution-result-eligibility";
import {
  buildAvanzaBrokerExecutionResultPreview,
  getAvanzaBrokerExecutionResultPreviewLabels,
  isAvanzaBrokerExecutionResultPreviewAvailable,
  summarizeAvanzaBrokerExecutionResultPreview,
} from "../../lib/avanza-broker-execution-result-preview";
import {
  buildExecutionRecordCandidateFingerprint,
  evaluateExecutionRecordEligibility,
  getExecutionRecordEligibilityLabels,
  isExecutionRecordEligible,
  summarizeExecutionRecordEligibility,
  type ExecutionRecordCandidate,
} from "../../lib/execution-record-eligibility";
import {
  createAvanzaDryRunOrderInput,
  getAvanzaDryRunSafetyLabels,
  isAvanzaDryRunSubmitBlocked,
  summarizeAvanzaDryRunOrderInput,
  validateAvanzaDryRunOrderInput,
} from "../../lib/avanza-dry-run-request-contract";
import {
  buildAvanzaDryRunOrderInputFromExecutionIntent,
  summarizeExecutionIntentToAvanzaDryRunResult,
} from "../../lib/execution-intent-to-avanza-dry-run";
import {
  createNoopSafeBrowserActionRunner,
  runSafeBrowserActions,
  summarizeSafeBrowserActionRunnerResult,
} from "../../lib/safe-browser-action-runner";
import {
  buildMockOrderPageFillPlanFromAgentRequest,
  buildMockOrderPageUrlFromFillPlan,
  MOCK_ORDER_MIN_AMOUNT_SEK,
  MOCK_ORDER_PAGE_AGENT_SELECTORS,
  validateMockOrderPageFormValues,
  validateMockOrderPageFillPlan,
} from "../../lib/mock-order-page-agent-contract";
import {
  buildMockOrderSafeActionPlan,
  summarizeMockOrderSafeActionPlan,
  validateMockOrderSafeActionPlan,
} from "../../lib/mock-order-safe-action-plan";
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
  expectMockOrderValidationErrors,
  fillMockOrderPageFromPlan,
  openMockOrderPageWithPlan,
  verifyMockOrderPageReviewFromPlan,
} from "./helpers/mock-order-fill-runner";
import {
  executeMockOrderSafeActionPlan,
  executeSafeBrowserActionsOnMockPage,
} from "./helpers/safe-browser-action-playwright-adapter";
import { SAFE_BROWSER_ACTION_DIAGNOSTICS_STORAGE_KEY } from "../../lib/safe-browser-action-diagnostics-store";
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

async function isVisible(locator: Locator, timeout = 1_000) {
  try {
    await expect(locator).toBeVisible({ timeout });
    return true;
  } catch {
    return false;
  }
}

async function stubSettingsRemoteReads(page: Page) {
  await page.route("**/rest/v1/user_settings**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "settings-playwright",
        created_at: "2026-06-11T00:00:00.000Z",
        updated_at: "2026-06-11T00:00:00.000Z",
        portfolio_size: 100000,
        risk_per_trade_percent: 0.5,
        max_recommendations_per_session: 5,
        max_open_positions: 5,
        preferred_timeframe: "Intraday / day trade",
        long_only: true,
      }),
    });
  });
  await page.route("**/rest/v1/scheduled_scan_runs**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });
  await page.route("**/api/market-calendar/status", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        market_status: {
          isOpenDay: true,
          reason: "Playwright local settings stub.",
          date: "2026-06-11",
          dayType: "trading_day",
          marketOpenTime: "09:30",
          marketCloseTime: "16:00",
          provider: "playwright_stub",
          fromCache: true,
        },
      }),
    });
  });
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
        fieldKey: "account",
        selector: MOCK_ORDER_PAGE_AGENT_SELECTORS.account,
        value: "Mock account",
      }),
      expect.objectContaining({
        fieldKey: "priceCurrency",
        selector: MOCK_ORDER_PAGE_AGENT_SELECTORS.priceCurrency,
        value: "USD",
      }),
      expect.objectContaining({
        fieldKey: "instrumentMarket",
        selector: MOCK_ORDER_PAGE_AGENT_SELECTORS.instrumentMarket,
        value: "Mock market",
      }),
      expect.objectContaining({
        fieldKey: "instrumentCurrency",
        selector: MOCK_ORDER_PAGE_AGENT_SELECTORS.instrumentCurrency,
        value: "USD",
      }),
      expect.objectContaining({
        fieldKey: "instrumentType",
        selector: MOCK_ORDER_PAGE_AGENT_SELECTORS.instrumentType,
        value: "stock",
      }),
      expect.objectContaining({
        fieldKey: "orderMode",
        selector: MOCK_ORDER_PAGE_AGENT_SELECTORS.orderMode,
        value: "advanced",
      }),
      expect.objectContaining({
        fieldKey: "reviewButtonLabel",
        selector: MOCK_ORDER_PAGE_AGENT_SELECTORS.reviewButtonLabel,
        value: "Granska köp",
      }),
      expect.objectContaining({
        fieldKey: "confirmButtonLabel",
        selector: MOCK_ORDER_PAGE_AGENT_SELECTORS.confirmButtonLabel,
        value: "Bekräfta köp",
      }),
      expect.objectContaining({
        fieldKey: "cancelButtonLabel",
        selector: MOCK_ORDER_PAGE_AGENT_SELECTORS.cancelButtonLabel,
        value: "Avbryt",
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
  expect(url).toContain("account=Mock+account");
  expect(url).toContain("orderMode=advanced");
  expect(url).toContain("priceCurrency=USD");
  expect(url).toContain("reviewButtonLabel=Granska");
  expect(url).toContain("requestId=request_mock_contract");
  expect(url).not.toContain("broker_result");
});

test("validates mock order form values with Avanza-like categories", () => {
  const validation = validateMockOrderPageFormValues({
    account: "",
    action: "buy",
    amountSek: String(MOCK_ORDER_MIN_AMOUNT_SEK - 1),
    cancelButtonLabel: "Avbryt",
    confirmButtonLabel: "Bekräfta köp",
    estimatedTotalAmount: String(MOCK_ORDER_MIN_AMOUNT_SEK - 1),
    limitPrice: "",
    orderMode: "stop_loss",
    orderType: "limit",
    priceCurrency: "USD",
    quantity: "0",
    reviewButtonLabel: "Granska köp",
    ticker: "",
    validUntil: "2026-06-11",
  });

  expect(validation.ok).toBe(false);
  expect(validation.errors).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        code: "required",
        fieldKey: "account",
      }),
      expect.objectContaining({
        code: "required",
        fieldKey: "ticker",
      }),
      expect.objectContaining({
        code: "invalid_number",
        fieldKey: "quantity",
      }),
      expect.objectContaining({
        code: "invalid_price",
        fieldKey: "limitPrice",
      }),
      expect.objectContaining({
        code: "minimum_amount",
        fieldKey: "amountSek",
      }),
      expect.objectContaining({
        code: "unsupported_order_mode",
        fieldKey: "orderMode",
      }),
    ]),
  );
});

test("builds and validates a mock confirmation payload without broker result", () => {
  const payload = {
    account: "Mock ISK",
    action: "sell",
    amountExcludingFees: "617.25",
    cancelButtonLabel: "Avbryt",
    confirmButtonLabel: "Bekräfta sälj",
    courtage: "19.00",
    executedPrice: "123.10",
    fxFee: "10.00",
    instrumentCurrency: "USD",
    instrumentMarket: "Nasdaq Mock",
    instrumentType: "stock",
    intentId: "intent_mock_confirmation",
    message: "Mock confirmation contract only.",
    orderMode: "advanced",
    orderId: "mock_order_001",
    preliminaryFxRate: "10.50",
    priceCurrency: "USD",
    positionId: "position_mock_confirmation",
    quantity: "5",
    recommendationId: "recommendation_mock_confirmation",
    requestId: "request_mock_confirmation",
    requestedPrice: "123.45",
    reviewButtonLabel: "Granska sälj",
    status: "filled" as const,
    ticker: "QA.CONFIRM",
    totalAmount: "646.25",
    validUntil: "2026-06-11",
  };
  const validation = validateMockOrderConfirmationPayload(payload);
  const url = buildMockOrderConfirmationUrl(payload);

  expect(validation).toEqual({ ok: true, errors: [], warnings: [] });
  expect(url).toContain("/mock-broker/confirmation?");
  expect(url).toContain("status=filled");
  expect(url).toContain("ticker=QA.CONFIRM");
  expect(url).toContain("account=Mock+ISK");
  expect(url).toContain("orderMode=advanced");
  expect(url).toContain("confirmButtonLabel=Bekr");
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

test("validates safe browser action final-confirm blocking contract", () => {
  expect(FINAL_CONFIRM_DENYLIST_TERMS).toEqual(
    expect.arrayContaining(["Bekräfta köp", "Bekräfta sälj"]),
  );
  expect(isFinalConfirmLikeTarget({ label: "Bekräfta köp" })).toBe(true);
  expect(isFinalConfirmLikeTarget({ text: "Granska köp" })).toBe(false);

  const blockedBuyConfirm = validateSafeBrowserAction(
    createSafeBrowserAction({
      actionId: "safe_action_confirm_buy",
      createdAt: "2026-06-11T10:00:00.000Z",
      kind: "click",
      mode: "semi_automatic",
      target: {
        label: "Bekräfta köp",
        role: "button",
      },
      reason: "Regression fixture: semi-auto must not click final buy.",
    }),
  );
  const blockedSellConfirm = validateSafeBrowserAction(
    createSafeBrowserAction({
      actionId: "safe_action_confirm_sell",
      createdAt: "2026-06-11T10:00:01.000Z",
      kind: "click",
      mode: "semi_automatic",
      target: {
        text: "Bekräfta sälj",
        role: "button",
      },
      reason: "Regression fixture: semi-auto must not click final sell.",
    }),
  );
  const allowedConfirmRead = validateSafeBrowserAction(
    createSafeBrowserAction({
      actionId: "safe_action_read_confirm_buy",
      createdAt: "2026-06-11T10:00:02.000Z",
      kind: "read",
      mode: "semi_automatic",
      target: {
        label: "Bekräfta köp",
        role: "button",
      },
      reason: "Read final button as a stop boundary.",
    }),
  );
  const allowedReviewClick = validateSafeBrowserAction(
    createSafeBrowserAction({
      actionId: "safe_action_review_buy",
      createdAt: "2026-06-11T10:00:03.000Z",
      kind: "click",
      mode: "semi_automatic",
      target: {
        label: "Granska köp",
        role: "button",
        riskLevel: "medium",
      },
      reason: "Review-only semi-auto action.",
    }),
  );
  const automaticConfirmWarning = validateSafeBrowserAction(
    createSafeBrowserAction({
      actionId: "safe_action_auto_confirm_warning",
      createdAt: "2026-06-11T10:00:04.000Z",
      kind: "click",
      mode: "automatic",
      target: {
        label: "Confirm sell",
        role: "button",
      },
      reason: "Automatic path is a documented warning only.",
    }),
  );
  const criticalSemiAutoClick = validateSafeBrowserAction(
    createSafeBrowserAction({
      actionId: "safe_action_critical_click",
      createdAt: "2026-06-11T10:00:05.000Z",
      kind: "click",
      mode: "semi_automatic",
      target: {
        label: "Critical unrelated action",
        role: "button",
        riskLevel: "critical",
      },
      reason: "Critical clicks are blocked in semi-auto.",
    }),
  );

  expect(blockedBuyConfirm).toEqual(
    expect.objectContaining({
      ok: false,
      blocked: true,
      riskLevel: "critical",
      matchedDenylistTerms: ["Bekräfta köp"],
    }),
  );
  expect(blockedBuyConfirm.errors).toEqual(
    expect.arrayContaining([
      "Semi-automatic mode must not click or select final confirmation targets.",
    ]),
  );
  expect(blockedSellConfirm.blocked).toBe(true);
  expect(blockedSellConfirm.matchedDenylistTerms).toEqual(["Bekräfta sälj"]);
  expect(allowedConfirmRead).toEqual(
    expect.objectContaining({
      ok: true,
      blocked: false,
      riskLevel: "critical",
      matchedDenylistTerms: ["Bekräfta köp"],
    }),
  );
  expect(allowedReviewClick).toEqual(
    expect.objectContaining({
      ok: true,
      blocked: false,
      riskLevel: "medium",
      matchedDenylistTerms: [],
    }),
  );
  expect(automaticConfirmWarning).toEqual(
    expect.objectContaining({
      ok: true,
      blocked: false,
      riskLevel: "critical",
      matchedDenylistTerms: ["Confirm sell"],
    }),
  );
  expect(automaticConfirmWarning.warnings).toEqual(
    expect.arrayContaining([
      "Automatic final confirmation is out of scope for the first Avanza prototype and requires separate approval.",
    ]),
  );
  expect(criticalSemiAutoClick.blocked).toBe(true);
  expect(criticalSemiAutoClick.errors).toEqual(
    expect.arrayContaining([
      "Semi-automatic mode blocks critical-risk browser actions unless they are read, wait_for, or stop.",
    ]),
  );
});

test("validates browser runner capability gates", () => {
  const mockCapability = createMockOnlyBrowserRunnerCapability({
    runnerId: "mock_capability_fixture",
    runnerName: "Mock Capability Fixture",
    createdAt: "2026-06-11T12:20:00.000Z",
  });
  const avanzaDryRunCapability = createAvanzaDryRunBrowserRunnerCapability({
    runnerId: "future_avanza_dry_run_fixture",
    runnerName: "Future Avanza Dry-Run Fixture",
    createdAt: "2026-06-11T12:21:00.000Z",
  });
  const brokerSubmissionCapability: BrowserRunnerExecutionCapability = {
    ...mockCapability,
    runnerId: "unsafe_submission_fixture",
    supportsBrokerSubmission: true,
  };
  const unknownCapability: BrowserRunnerExecutionCapability = {
    ...mockCapability,
    runnerId: "unknown_capability_fixture",
    targetEnvironment: "unknown",
    mockOnly: false,
  };
  const avanzaSubmissionCapability: BrowserRunnerExecutionCapability = {
    ...avanzaDryRunCapability,
    runnerId: "future_avanza_submission_fixture",
    supportsBrokerSubmission: true,
    metadata: {
      ...(avanzaDryRunCapability.metadata ?? {}),
      supportsBrokerSubmission: true,
    },
  };
  const avanzaFinalConfirmCapability: BrowserRunnerExecutionCapability = {
    ...avanzaDryRunCapability,
    runnerId: "future_avanza_final_confirm_fixture",
    supportsFinalConfirmClick: true,
    metadata: {
      ...(avanzaDryRunCapability.metadata ?? {}),
      supportsFinalConfirmClick: true,
    },
  };
  const avanzaAutomaticCapability: BrowserRunnerExecutionCapability = {
    ...avanzaDryRunCapability,
    runnerId: "future_avanza_automatic_fixture",
    automaticModeCapable: true,
    metadata: {
      ...(avanzaDryRunCapability.metadata ?? {}),
      automaticModeCapable: true,
    },
  };

  const mockValidation = validateBrowserRunnerCapability(mockCapability);
  const avanzaValidation = validateBrowserRunnerCapability(
    avanzaDryRunCapability,
  );
  const brokerSubmissionValidation = validateBrowserRunnerCapability(
    brokerSubmissionCapability,
  );
  const unknownValidation = validateBrowserRunnerCapability(unknownCapability);
  const avanzaDryRunValidation = validateBrowserRunnerCapability(
    avanzaDryRunCapability,
    { allowAvanzaDryRun: true },
  );
  const avanzaSubmissionValidation = validateBrowserRunnerCapability(
    avanzaSubmissionCapability,
    { allowAvanzaDryRun: true },
  );
  const avanzaFinalConfirmValidation = validateBrowserRunnerCapability(
    avanzaFinalConfirmCapability,
    { allowAvanzaDryRun: true },
  );
  const avanzaAutomaticBlockedValidation = validateBrowserRunnerCapability(
    avanzaAutomaticCapability,
    { allowAvanzaDryRun: true },
  );
  const avanzaAutomaticExplicitValidation = validateBrowserRunnerCapability(
    avanzaAutomaticCapability,
    { allowAvanzaDryRun: true, allowAutomaticMode: true },
  );

  expect(mockValidation).toEqual(
    expect.objectContaining({
      ok: true,
      blocked: false,
      safetyLevel: "safe_mock_only",
      canRunMockBrowserActions: true,
      canSubmitBrokerOrder: false,
    }),
  );
  expect(summarizeBrowserRunnerCapabilityValidation(mockValidation)).toContain(
    "safe_mock_only",
  );
  expect(avanzaValidation).toEqual(
    expect.objectContaining({
      ok: false,
      blocked: true,
      safetyLevel: "real_broker_blocked",
    }),
  );
  expect(avanzaValidation.errors).toEqual(
    expect.arrayContaining([
      "Avanza broker browser capability is blocked by default.",
    ]),
  );
  expect(avanzaDryRunValidation).toEqual(
    expect.objectContaining({
      ok: true,
      blocked: false,
      safetyLevel: "dry_run_only",
      canRunMockBrowserActions: false,
      canRunAvanzaDryRun: true,
      canSubmitBrokerOrder: false,
    }),
  );
  expect(avanzaDryRunValidation.warnings).toEqual(
    expect.arrayContaining([
      "Avanza dry-run capability is dry-run only: no broker submission, no final confirmation, and no broker result.",
    ]),
  );
  expect(
    summarizeBrowserRunnerCapabilityValidation(avanzaDryRunValidation),
  ).toContain("avanza-dry-run");
  expect(avanzaSubmissionValidation).toEqual(
    expect.objectContaining({
      ok: false,
      blocked: true,
      safetyLevel: "real_broker_blocked",
      canRunAvanzaDryRun: false,
      canSubmitBrokerOrder: false,
    }),
  );
  expect(avanzaSubmissionValidation.errors).toEqual(
    expect.arrayContaining([
      "Avanza dry-run capability must not support broker submission.",
    ]),
  );
  expect(avanzaFinalConfirmValidation).toEqual(
    expect.objectContaining({
      ok: false,
      blocked: true,
      safetyLevel: "real_broker_blocked",
      canRunAvanzaDryRun: false,
      canSubmitBrokerOrder: false,
    }),
  );
  expect(avanzaFinalConfirmValidation.errors).toEqual(
    expect.arrayContaining([
      "Avanza dry-run capability must not support final-confirm clicks.",
    ]),
  );
  expect(avanzaAutomaticBlockedValidation).toEqual(
    expect.objectContaining({
      ok: false,
      blocked: true,
      safetyLevel: "real_broker_blocked",
      canRunAvanzaDryRun: false,
    }),
  );
  expect(avanzaAutomaticBlockedValidation.errors).toEqual(
    expect.arrayContaining([
      "Automatic-mode browser capability is blocked by default.",
    ]),
  );
  expect(avanzaAutomaticExplicitValidation).toEqual(
    expect.objectContaining({
      ok: true,
      blocked: false,
      safetyLevel: "dry_run_only",
      canRunAvanzaDryRun: false,
      canSubmitBrokerOrder: false,
    }),
  );
  expect(brokerSubmissionValidation).toEqual(
    expect.objectContaining({
      ok: false,
      blocked: true,
      safetyLevel: "real_broker_blocked",
      canSubmitBrokerOrder: false,
    }),
  );
  expect(brokerSubmissionValidation.errors).toEqual(
    expect.arrayContaining([
      "Broker submission capability is blocked by default.",
    ]),
  );
  expect(unknownValidation).toEqual(
    expect.objectContaining({
      ok: false,
      blocked: true,
      safetyLevel: "unknown_blocked",
    }),
  );
});

test("evaluates Avanza dry-run runner self-check statuses", () => {
  const unavailable = createUnavailableAvanzaDryRunRunnerSelfCheck({
    checkedAt: "2026-06-11T12:30:00.000Z",
  });
  const mockCapability = createMockOnlyBrowserRunnerCapability({
    runnerId: "mock_self_check_fixture",
    runnerName: "Mock Self-Check Fixture",
    createdAt: "2026-06-11T12:31:00.000Z",
  });
  const avanzaDryRunCapability = createAvanzaDryRunBrowserRunnerCapability({
    runnerId: "avanza_self_check_fixture",
    runnerName: "Avanza Self-Check Fixture",
    createdAt: "2026-06-11T12:32:00.000Z",
  });
  const brokerSubmissionCapability: BrowserRunnerExecutionCapability = {
    ...avanzaDryRunCapability,
    runnerId: "avanza_self_check_submission_fixture",
    supportsBrokerSubmission: true,
    metadata: {
      ...(avanzaDryRunCapability.metadata ?? {}),
      supportsBrokerSubmission: true,
    },
  };
  const finalConfirmCapability: BrowserRunnerExecutionCapability = {
    ...avanzaDryRunCapability,
    runnerId: "avanza_self_check_final_confirm_fixture",
    supportsFinalConfirmClick: true,
    metadata: {
      ...(avanzaDryRunCapability.metadata ?? {}),
      supportsFinalConfirmClick: true,
    },
  };

  const mockSelfCheck = evaluateAvanzaDryRunRunnerSelfCheck({
    runnerId: "mock_self_check_fixture",
    runnerName: "Mock Self-Check Fixture",
    version: "mock-self-check-v1",
    capability: mockCapability,
    checkedAt: "2026-06-11T12:33:00.000Z",
  });
  const blockedDefaultDryRun = evaluateAvanzaDryRunRunnerSelfCheck({
    runnerId: "avanza_self_check_fixture",
    runnerName: "Avanza Self-Check Fixture",
    version: "avanza-self-check-v1",
    capability: avanzaDryRunCapability,
    checkedAt: "2026-06-11T12:34:00.000Z",
  });
  const allowedDryRun = evaluateAvanzaDryRunRunnerSelfCheck(
    {
      runnerId: "avanza_self_check_fixture",
      runnerName: "Avanza Self-Check Fixture",
      version: "avanza-self-check-v1",
      capability: avanzaDryRunCapability,
      checkedAt: "2026-06-11T12:35:00.000Z",
    },
    { allowAvanzaDryRun: true },
  );
  const brokerSubmissionSelfCheck = evaluateAvanzaDryRunRunnerSelfCheck(
    {
      runnerId: "avanza_self_check_submission_fixture",
      runnerName: "Avanza Submission Fixture",
      version: "avanza-self-check-v1",
      capability: brokerSubmissionCapability,
      checkedAt: "2026-06-11T12:36:00.000Z",
    },
    { allowAvanzaDryRun: true },
  );
  const finalConfirmSelfCheck = evaluateAvanzaDryRunRunnerSelfCheck(
    {
      runnerId: "avanza_self_check_final_confirm_fixture",
      runnerName: "Avanza Final Confirm Fixture",
      version: "avanza-self-check-v1",
      capability: finalConfirmCapability,
      checkedAt: "2026-06-11T12:37:00.000Z",
    },
    { allowAvanzaDryRun: true },
  );

  expect(unavailable).toEqual(
    expect.objectContaining({
      ok: false,
      status: "unavailable",
      runnerId: "avanza_dry_run_runner_unavailable",
    }),
  );
  expect(unavailable.blockers).toEqual(
    expect.arrayContaining([
      "No Avanza dry-run runner is installed/available.",
    ]),
  );
  expect(mockSelfCheck).toEqual(
    expect.objectContaining({
      ok: true,
      status: "available_mock_only",
    }),
  );
  expect(mockSelfCheck.warnings).toEqual(
    expect.arrayContaining([
      "Mock-only runner is available for mock diagnostics but cannot run Avanza dry-run.",
    ]),
  );
  expect(getAvanzaDryRunRunnerSelfCheckLabels(mockSelfCheck)).toEqual(
    expect.arrayContaining(["Mock-only browser diagnostics"]),
  );
  expect(blockedDefaultDryRun).toEqual(
    expect.objectContaining({
      ok: false,
      status: "blocked",
    }),
  );
  expect(blockedDefaultDryRun.errors).toEqual(
    expect.arrayContaining([
      "Avanza broker browser capability is blocked by default.",
    ]),
  );
  expect(allowedDryRun).toEqual(
    expect.objectContaining({
      ok: true,
      status: "available_dry_run_only",
    }),
  );
  expect(allowedDryRun.capabilityValidation).toEqual(
    expect.objectContaining({
      canRunAvanzaDryRun: true,
      canSubmitBrokerOrder: false,
      safetyLevel: "dry_run_only",
    }),
  );
  expect(getAvanzaDryRunRunnerSelfCheckLabels(allowedDryRun)).toEqual(
    expect.arrayContaining([
      "Avanza dry-run capable",
      "No broker submission",
      "Final confirm disabled",
      "Semi-auto only",
    ]),
  );
  expect(summarizeAvanzaDryRunRunnerSelfCheck(allowedDryRun)).toContain(
    "no-broker-submit",
  );
  expect(brokerSubmissionSelfCheck).toEqual(
    expect.objectContaining({
      ok: false,
      status: "blocked",
    }),
  );
  expect(brokerSubmissionSelfCheck.errors).toEqual(
    expect.arrayContaining([
      "Avanza dry-run capability must not support broker submission.",
    ]),
  );
  expect(finalConfirmSelfCheck).toEqual(
    expect.objectContaining({
      ok: false,
      status: "blocked",
    }),
  );
  expect(finalConfirmSelfCheck.errors).toEqual(
    expect.arrayContaining([
      "Avanza dry-run capability must not support final-confirm clicks.",
    ]),
  );
});

test("evaluates Avanza session detection statuses without browser control", () => {
  const browserNotConnected = evaluateAvanzaSessionDetectionContext({
    browserConnected: false,
  });
  const avanzaNotVisible = evaluateAvanzaSessionDetectionContext({
    browserConnected: true,
    avanzaVisible: false,
    sanitizedHostClass: "other",
  });
  const loggedOut = evaluateAvanzaSessionDetectionContext({
    browserConnected: true,
    avanzaVisible: true,
    sanitizedHostClass: "avanza",
    loginState: "logged_out",
    pageContext: "login",
  });
  const loginChallenge = evaluateAvanzaSessionDetectionContext({
    browserConnected: true,
    avanzaVisible: true,
    sanitizedHostClass: "avanza",
    loginState: "login_challenge",
    pageContext: "login",
  });
  const sensitiveData = evaluateAvanzaSessionDetectionContext({
    browserConnected: true,
    avanzaVisible: true,
    sanitizedHostClass: "avanza",
    loginState: "logged_in",
    pageContext: "app_shell",
    sensitiveDataDetected: true,
  });
  const confirmationModal = evaluateAvanzaSessionDetectionContext({
    browserConnected: true,
    avanzaVisible: true,
    sanitizedHostClass: "avanza",
    loginState: "logged_in",
    pageContext: "confirmation_modal",
  });
  const orderPage = evaluateAvanzaSessionDetectionContext({
    browserConnected: true,
    avanzaVisible: true,
    sanitizedHostClass: "avanza",
    loginState: "logged_in",
    pageContext: "order_page",
  });
  const ready = evaluateAvanzaSessionDetectionContext({
    browserConnected: true,
    avanzaVisible: true,
    sanitizedHostClass: "avanza",
    loginState: "logged_in",
    language: "sv",
    pageContext: "app_shell",
    marketContext: "open",
    sanitizedTitle: "Sanitized Avanza shell",
  });
  const readyFromFactory = createAvanzaSessionDetectionResult({
    checkedAt: "2026-06-11T12:50:00.000Z",
    context: {
      browserConnected: true,
      avanzaVisible: true,
      sanitizedHostClass: "avanza",
      loginState: "logged_in",
      pageContext: "instrument_page",
    },
  });
  const malformed = evaluateAvanzaSessionDetectionContext(null);

  expect(browserNotConnected).toEqual(
    expect.objectContaining({
      ok: false,
      status: "browser_not_connected",
    }),
  );
  expect(summarizeAvanzaSessionDetectionResult(browserNotConnected)).toBe(
    "Browser not connected.",
  );
  expect(avanzaNotVisible).toEqual(
    expect.objectContaining({
      ok: false,
      status: "avanza_not_visible",
    }),
  );
  expect(loggedOut).toEqual(
    expect.objectContaining({
      ok: false,
      status: "login_required",
    }),
  );
  expect(loginChallenge).toEqual(
    expect.objectContaining({
      ok: false,
      status: "login_required",
    }),
  );
  expect(summarizeAvanzaSessionDetectionResult(loginChallenge)).toBe(
    "Avanza visible but login required.",
  );
  expect(sensitiveData).toEqual(
    expect.objectContaining({
      ok: false,
      status: "blocked",
    }),
  );
  expect(sensitiveData.blockers).toEqual(
    expect.arrayContaining([
      "Sensitive data was detected and must be redacted.",
    ]),
  );
  expect(confirmationModal).toEqual(
    expect.objectContaining({
      ok: false,
      status: "blocked",
    }),
  );
  expect(confirmationModal.blockers).toEqual(
    expect.arrayContaining([
      "Confirmation modal context is outside session-detection-only scope.",
    ]),
  );
  expect(orderPage).toEqual(
    expect.objectContaining({
      ok: false,
      status: "blocked",
    }),
  );
  expect(orderPage.blockers).toEqual(
    expect.arrayContaining([
      "Order page context is outside session-detection-only scope.",
    ]),
  );
  expect(ready).toEqual(
    expect.objectContaining({
      ok: true,
      status: "ready_for_search_only",
    }),
  );
  expect(ready.metadata).toEqual(
    expect.objectContaining({
      contractVersion: AVANZA_SESSION_DETECTION_CONTRACT_VERSION,
      targetEnvironment: "avanza_broker",
      sessionDetectionOnly: true,
      noBrowserActions: true,
      noBrokerSubmission: true,
      noFinalConfirm: true,
      noOrderPreparation: true,
    }),
  );
  expect(isAvanzaSessionReadyForSearchOnly(ready)).toBe(true);
  expect(summarizeAvanzaSessionDetectionResult(ready)).toContain(
    "Session appears ready for search-only",
  );
  expect(getAvanzaSessionDetectionSafetyLabels(ready)).toEqual(
    expect.arrayContaining([
      "Session detection only",
      "No browser actions",
      "No broker submission",
      "No order preparation",
      "Local diagnostics only",
      "Ready for search-only",
    ]),
  );
  expect(readyFromFactory).toEqual(
    expect.objectContaining({
      ok: true,
      status: "ready_for_search_only",
      checkedAt: "2026-06-11T12:50:00.000Z",
    }),
  );
  expect(readyFromFactory.warnings).toEqual(
    expect.arrayContaining([
      "Instrument page is visible; future search-only phase must avoid order preparation.",
    ]),
  );
  expect(malformed).toEqual(
    expect.objectContaining({
      ok: false,
      status: "failed",
    }),
  );
});

test("classifies Avanza search-only candidates without browser control", () => {
  const checkedAt = "2026-06-11T13:20:00.000Z";
  const expected: AvanzaSearchOnlyExpectedInstrument = {
    ticker: "VOLV B",
    name: "Volvo B",
    market: "Stockholm",
    currency: "SEK",
    instrumentType: "stock",
  };
  const exactCandidate: AvanzaSearchOnlyCandidate = {
    candidateId: "candidate_exact_volv_b",
    displayName: "Volvo B",
    ticker: "VOLV B",
    market: "Stockholm",
    currency: "SEK",
    instrumentType: "stock",
    matchConfidence: 0.98,
    sanitizedSource: "search_result",
    riskFlags: [],
    warnings: [],
  };

  expect(normalizeAvanzaSearchOnlyText("  VOLV   B ")).toBe("volv b");

  const exactScore = scoreAvanzaSearchOnlyCandidate(exactCandidate, expected);
  expect(exactScore.tickerMatches).toBe(true);
  expect(exactScore.score).toBeGreaterThanOrEqual(
    AVANZA_SEARCH_ONLY_MIN_EXACT_MATCH_CONFIDENCE,
  );

  const exact = classifyAvanzaSearchOnlyCandidates(
    expected,
    [exactCandidate],
    {
      checkedAt,
      requireMarketMatch: true,
      requireCurrencyMatch: true,
      requireInstrumentTypeMatch: true,
    },
  );

  expect(exact).toEqual(
    expect.objectContaining({
      ok: true,
      status: "exact_match",
      checkedAt,
    }),
  );
  expect(isAvanzaSearchOnlyExactMatch(exact)).toBe(true);
  expect(exact.selectedCandidate?.candidateId).toBe("candidate_exact_volv_b");
  expect(summarizeAvanzaSearchOnlyResult(exact)).toBe(
    "Exact instrument match found.",
  );
  expect(getAvanzaSearchOnlySafetyLabels(exact)).toEqual(
    expect.arrayContaining([
      "Search-only",
      "No order page",
      "No buy/sell click",
      "No broker submission",
      "No trade mutation",
      "Exact instrument match",
    ]),
  );
  expect(exact.metadata).toEqual(
    expect.objectContaining({
      searchOnly: true,
      noOrderPage: true,
      noBuySellClick: true,
      noBrokerSubmission: true,
      noTradeMutation: true,
      noBrokerResult: true,
    }),
  );

  const noCandidates = classifyAvanzaSearchOnlyCandidates(expected, [], {
    checkedAt,
  });
  expect(noCandidates.status).toBe("no_match");
  expect(summarizeAvanzaSearchOnlyResult(noCandidates)).toBe(
    "No matching instrument found.",
  );

  const duplicate = classifyAvanzaSearchOnlyCandidates(
    expected,
    [
      exactCandidate,
      {
        ...exactCandidate,
        candidateId: "candidate_duplicate_volv_b",
        displayName: "Volvo B Preferens",
      },
    ],
    { checkedAt },
  );
  expect(duplicate.status).toBe("ambiguous");
  expect(duplicate.blockers).toEqual(
    expect.arrayContaining(["Multiple candidates share the expected ticker."]),
  );
  expect(
    duplicate.candidates.some((candidate) =>
      candidate.riskFlags.includes("duplicate_ticker"),
    ),
  ).toBe(true);

  const tickerMismatch = classifyAvanzaSearchOnlyCandidates(
    expected,
    [
      {
        ...exactCandidate,
        candidateId: "candidate_wrong_ticker",
        displayName: "Ericsson B",
        ticker: "ERIC B",
      },
    ],
    { checkedAt },
  );
  expect(tickerMismatch.status).toBe("no_match");
  expect(tickerMismatch.candidates[0].riskFlags).toEqual(
    expect.arrayContaining(["ticker_mismatch"]),
  );

  const missingCurrency = classifyAvanzaSearchOnlyCandidates(
    expected,
    [
      {
        ...exactCandidate,
        candidateId: "candidate_missing_currency",
        currency: undefined,
      },
    ],
    {
      checkedAt,
      requireCurrencyMatch: true,
    },
  );
  expect(missingCurrency.status).toBe("ambiguous");
  expect(missingCurrency.candidates[0].riskFlags).toEqual(
    expect.arrayContaining(["missing_currency"]),
  );
  expect(missingCurrency.candidates[0].warnings).toEqual(
    expect.arrayContaining(["Candidate currency is missing."]),
  );

  const sensitive = classifyAvanzaSearchOnlyCandidates(
    expected,
    [
      {
        ...exactCandidate,
        candidateId: "candidate_sensitive",
        riskFlags: ["sensitive_data_detected"],
      },
    ],
    { checkedAt },
  );
  expect(sensitive.status).toBe("blocked");
  expect(summarizeAvanzaSearchOnlyResult(sensitive)).toContain(
    "Sensitive data",
  );

  const orderFlow = classifyAvanzaSearchOnlyCandidates(
    expected,
    [
      {
        ...exactCandidate,
        candidateId: "candidate_order_flow",
        riskFlags: ["order_flow_detected"],
      },
    ],
    { checkedAt },
  );
  expect(orderFlow.status).toBe("blocked");
  expect(orderFlow.errors).toEqual(
    expect.arrayContaining([
      "Order flow was detected during search-only candidate parsing.",
    ]),
  );
});

test("verifies Avanza instrument identity from search-only candidates without browser control", () => {
  const checkedAt = "2026-06-11T13:28:00.000Z";
  const expected: AvanzaSearchOnlyExpectedInstrument = {
    ticker: "VOLV B",
    name: "Volvo B",
    market: "Stockholm",
    currency: "SEK",
    instrumentType: "stock",
  };
  const candidate: AvanzaSearchOnlyCandidate = {
    candidateId: "candidate_verify_volv_b",
    displayName: "Volvo B",
    ticker: "VOLV B",
    market: "Stockholm",
    currency: "SEK",
    instrumentType: "stock",
    matchConfidence: 0.98,
    sanitizedSource: "search_result",
    riskFlags: [],
    warnings: [],
  };
  const exactSearch = classifyAvanzaSearchOnlyCandidates(expected, [candidate], {
    checkedAt,
    requireMarketMatch: true,
    requireCurrencyMatch: true,
    requireInstrumentTypeMatch: true,
  });
  const verified = verifyAvanzaInstrument(
    {
      expectedInstrument: expected,
      searchOnlyResult: exactSearch,
    },
    { checkedAt },
  );

  expect(verified).toEqual(
    expect.objectContaining({
      ok: true,
      status: "verified",
      checkedAt,
    }),
  );
  expect(isAvanzaInstrumentVerified(verified)).toBe(true);
  expect(verified.fieldChecks).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ field: "ticker", status: "match" }),
      expect.objectContaining({ field: "market", status: "match" }),
      expect.objectContaining({ field: "currency", status: "match" }),
      expect.objectContaining({ field: "instrumentType", status: "match" }),
    ]),
  );
  expect(verified.metadata).toEqual(
    expect.objectContaining({
      contractVersion: AVANZA_INSTRUMENT_VERIFICATION_CONTRACT_VERSION,
      instrumentVerificationOnly: true,
      noOrderPage: true,
      noBuySellClick: true,
      noFormFill: true,
      noBrokerSubmission: true,
      noTradeMutation: true,
      noBrokerResult: true,
    }),
  );
  expect(summarizeAvanzaInstrumentVerificationResult(verified)).toBe(
    "Instrument verified.",
  );
  expect(getAvanzaInstrumentVerificationSafetyLabels(verified)).toEqual(
    expect.arrayContaining([
      "Instrument verification only",
      "No order page",
      "No buy/sell click",
      "No form fill",
      "No broker submission",
      "No trade mutation",
      "Instrument verified",
    ]),
  );

  const ambiguousSearch = classifyAvanzaSearchOnlyCandidates(
    expected,
    [
      candidate,
      {
        ...candidate,
        candidateId: "candidate_verify_duplicate",
        displayName: "Volvo B duplicate",
      },
    ],
    { checkedAt },
  );
  const ambiguousFromSearch = verifyAvanzaInstrument(
    {
      expectedInstrument: expected,
      searchOnlyResult: ambiguousSearch,
    },
    { checkedAt },
  );
  expect(ambiguousFromSearch).toEqual(
    expect.objectContaining({
      ok: false,
      status: "ambiguous",
    }),
  );
  expect(ambiguousFromSearch.riskFlags).toEqual(
    expect.arrayContaining(["duplicate_or_ambiguous_candidate"]),
  );

  const missingCandidate = verifyAvanzaInstrument(
    {
      expectedInstrument: expected,
      searchOnlyResult: {
        ...exactSearch,
        selectedCandidate: undefined,
      },
    },
    { checkedAt },
  );
  expect(missingCandidate).toEqual(
    expect.objectContaining({
      ok: false,
      status: "missing_candidate",
    }),
  );

  const tickerMismatch = verifyAvanzaInstrument(
    {
      expectedInstrument: expected,
      searchOnlyResult: exactSearch,
      selectedCandidate: {
        ...candidate,
        candidateId: "candidate_verify_wrong_ticker",
        ticker: "ERIC B",
      },
    },
    { checkedAt },
  );
  expect(tickerMismatch.status).toBe("rejected");
  expect(tickerMismatch.riskFlags).toEqual(
    expect.arrayContaining(["ticker_mismatch"]),
  );
  expect(summarizeAvanzaInstrumentVerificationResult(tickerMismatch)).toContain(
    "Instrument rejected",
  );

  const marketMismatch = verifyAvanzaInstrument(
    {
      expectedInstrument: expected,
      searchOnlyResult: exactSearch,
      selectedCandidate: {
        ...candidate,
        candidateId: "candidate_verify_wrong_market",
        market: "Oslo",
      },
    },
    { checkedAt },
  );
  expect(marketMismatch.status).toBe("rejected");
  expect(marketMismatch.riskFlags).toEqual(
    expect.arrayContaining(["market_mismatch"]),
  );

  const currencyMismatch = verifyAvanzaInstrument(
    {
      expectedInstrument: expected,
      searchOnlyResult: exactSearch,
      selectedCandidate: {
        ...candidate,
        candidateId: "candidate_verify_wrong_currency",
        currency: "NOK",
      },
    },
    { checkedAt },
  );
  expect(currencyMismatch.status).toBe("rejected");
  expect(currencyMismatch.riskFlags).toEqual(
    expect.arrayContaining(["currency_mismatch"]),
  );

  const missingCurrency = verifyAvanzaInstrument(
    {
      expectedInstrument: expected,
      searchOnlyResult: exactSearch,
      selectedCandidate: {
        ...candidate,
        candidateId: "candidate_verify_missing_currency",
        currency: undefined,
      },
    },
    { checkedAt },
  );
  expect(missingCurrency.status).toBe("ambiguous");
  expect(missingCurrency.riskFlags).toEqual(
    expect.arrayContaining(["missing_currency"]),
  );
  expect(summarizeAvanzaInstrumentVerificationResult(missingCurrency)).toContain(
    "Instrument ambiguous",
  );

  const lowConfidence = verifyAvanzaInstrument(
    {
      expectedInstrument: expected,
      searchOnlyResult: exactSearch,
      selectedCandidate: {
        ...candidate,
        candidateId: "candidate_verify_low_confidence",
        matchConfidence: 0.5,
      },
    },
    { checkedAt },
  );
  expect(lowConfidence.status).toBe("ambiguous");
  expect(lowConfidence.riskFlags).toEqual(
    expect.arrayContaining(["low_confidence"]),
  );

  const sensitive = verifyAvanzaInstrument(
    {
      expectedInstrument: expected,
      searchOnlyResult: exactSearch,
      selectedCandidate: {
        ...candidate,
        candidateId: "candidate_verify_sensitive",
        riskFlags: ["sensitive_data_detected"],
      },
    },
    { checkedAt },
  );
  expect(sensitive.status).toBe("blocked");
  expect(sensitive.riskFlags).toEqual(
    expect.arrayContaining([
      "sensitive_data_detected",
      "candidate_has_critical_risk",
    ]),
  );
  expect(summarizeAvanzaInstrumentVerificationResult(sensitive)).toContain(
    "Blocked",
  );

  const orderFlow = verifyAvanzaInstrument(
    {
      expectedInstrument: expected,
      searchOnlyResult: exactSearch,
      selectedCandidate: {
        ...candidate,
        candidateId: "candidate_verify_order_flow",
        riskFlags: ["order_flow_detected"],
      },
    },
    { checkedAt },
  );
  expect(orderFlow.status).toBe("blocked");
  expect(orderFlow.riskFlags).toEqual(
    expect.arrayContaining(["order_flow_detected", "candidate_has_critical_risk"]),
  );
  expect(orderFlow.errors).toEqual(
    expect.arrayContaining(["Order-flow risk detected on selected candidate."]),
  );
});

test("evaluates Avanza instrument page identity without browser control", () => {
  const checkedAt = "2026-06-11T13:30:00.000Z";
  const expected: AvanzaSearchOnlyExpectedInstrument = {
    ticker: "VOLV B",
    name: "Volvo B",
    market: "Stockholm",
    currency: "SEK",
    instrumentType: "stock",
  };
  const candidate: AvanzaSearchOnlyCandidate = {
    candidateId: "candidate_page_volv_b",
    displayName: "Volvo B",
    ticker: "VOLV B",
    market: "Stockholm",
    currency: "SEK",
    instrumentType: "stock",
    matchConfidence: 0.98,
    sanitizedSource: "search_result",
    riskFlags: [],
    warnings: [],
  };
  const exactSearch = classifyAvanzaSearchOnlyCandidates(expected, [candidate], {
    checkedAt,
    requireMarketMatch: true,
    requireCurrencyMatch: true,
    requireInstrumentTypeMatch: true,
  });
  const verifiedInstrument = verifyAvanzaInstrument(
    {
      expectedInstrument: expected,
      searchOnlyResult: exactSearch,
    },
    { checkedAt },
  );
  const matchingPageIdentity = {
    ticker: "VOLV B",
    name: "Volvo B",
    market: "Stockholm",
    currency: "SEK",
    instrumentType: "stock",
    sanitizedTitle: "Volvo B - instrument page",
    sanitizedHostClass: "avanza",
    pageContext: "instrument_page" as const,
    matchConfidence: 0.98,
  };
  const pageIdentified = evaluateAvanzaInstrumentPage(
    {
      expectedInstrument: expected,
      instrumentVerificationResult: verifiedInstrument,
      pageIdentity: matchingPageIdentity,
    },
    { checkedAt },
  );

  expect(pageIdentified).toEqual(
    expect.objectContaining({
      ok: true,
      status: "page_identified",
      checkedAt,
    }),
  );
  expect(isAvanzaInstrumentPageIdentified(pageIdentified)).toBe(true);
  expect(pageIdentified.fieldChecks).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ field: "ticker", status: "match" }),
      expect.objectContaining({ field: "market", status: "match" }),
      expect.objectContaining({ field: "currency", status: "match" }),
      expect.objectContaining({ field: "instrumentType", status: "match" }),
    ]),
  );
  expect(pageIdentified.metadata).toEqual(
    expect.objectContaining({
      contractVersion: AVANZA_INSTRUMENT_PAGE_CONTRACT_VERSION,
      instrumentPageIdentityOnly: true,
      noOrderPage: true,
      noBuySellClick: true,
      noFormFill: true,
      noBrokerSubmission: true,
      noTradeMutation: true,
      noBrokerResult: true,
    }),
  );
  expect(summarizeAvanzaInstrumentPageResult(pageIdentified)).toBe(
    "Instrument page identified.",
  );
  expect(getAvanzaInstrumentPageSafetyLabels(pageIdentified)).toEqual(
    expect.arrayContaining([
      "Instrument page identity only",
      "No order page",
      "No buy/sell click",
      "No form fill",
      "No broker submission",
      "No trade mutation",
      "Instrument page identified",
    ]),
  );

  const verificationNotReady = evaluateAvanzaInstrumentPage(
    {
      expectedInstrument: expected,
      instrumentVerificationResult: verifyAvanzaInstrument(
        {
          expectedInstrument: expected,
          searchOnlyResult: exactSearch,
          selectedCandidate: {
            ...candidate,
            candidateId: "candidate_page_wrong_ticker",
            ticker: "ERIC B",
          },
        },
        { checkedAt },
      ),
      pageIdentity: matchingPageIdentity,
    },
    { checkedAt },
  );
  expect(verificationNotReady.status).toBe("verification_not_ready");
  expect(verificationNotReady.riskFlags).toEqual(
    expect.arrayContaining(["verification_not_verified"]),
  );

  const pageNotOpen = evaluateAvanzaInstrumentPage(
    {
      expectedInstrument: expected,
      instrumentVerificationResult: verifiedInstrument,
    },
    { checkedAt },
  );
  expect(pageNotOpen.status).toBe("page_not_open");
  expect(summarizeAvanzaInstrumentPageResult(pageNotOpen)).toBe(
    "Instrument page is not open.",
  );

  const tickerMismatch = evaluateAvanzaInstrumentPage(
    {
      expectedInstrument: expected,
      instrumentVerificationResult: verifiedInstrument,
      pageIdentity: {
        ...matchingPageIdentity,
        ticker: "ERIC B",
      },
    },
    { checkedAt },
  );
  expect(tickerMismatch.status).toBe("page_mismatch");
  expect(tickerMismatch.riskFlags).toEqual(
    expect.arrayContaining(["ticker_mismatch"]),
  );
  expect(summarizeAvanzaInstrumentPageResult(tickerMismatch)).toContain(
    "Page mismatch",
  );

  const currencyMismatch = evaluateAvanzaInstrumentPage(
    {
      expectedInstrument: expected,
      instrumentVerificationResult: verifiedInstrument,
      pageIdentity: {
        ...matchingPageIdentity,
        currency: "NOK",
      },
    },
    { checkedAt },
  );
  expect(currencyMismatch.status).toBe("page_mismatch");
  expect(currencyMismatch.riskFlags).toEqual(
    expect.arrayContaining(["currency_mismatch"]),
  );

  const missingCurrency = evaluateAvanzaInstrumentPage(
    {
      expectedInstrument: expected,
      instrumentVerificationResult: verifiedInstrument,
      pageIdentity: {
        ...matchingPageIdentity,
        currency: undefined,
      },
    },
    { checkedAt },
  );
  expect(missingCurrency.status).toBe("page_mismatch");
  expect(missingCurrency.riskFlags).toEqual(
    expect.arrayContaining(["missing_page_currency"]),
  );

  const orderPage = evaluateAvanzaInstrumentPage(
    {
      expectedInstrument: expected,
      instrumentVerificationResult: verifiedInstrument,
      pageIdentity: {
        ...matchingPageIdentity,
        pageContext: "order_page",
      },
    },
    { checkedAt },
  );
  expect(orderPage.status).toBe("blocked");
  expect(orderPage.riskFlags).toEqual(
    expect.arrayContaining(["order_page_detected"]),
  );

  const orderForm = evaluateAvanzaInstrumentPage(
    {
      expectedInstrument: expected,
      instrumentVerificationResult: verifiedInstrument,
      pageIdentity: {
        ...matchingPageIdentity,
        prohibitedControls: { orderFormVisible: true },
      },
    },
    { checkedAt },
  );
  expect(orderForm.status).toBe("blocked");
  expect(orderForm.riskFlags).toEqual(
    expect.arrayContaining(["order_form_detected"]),
  );

  const finalConfirm = evaluateAvanzaInstrumentPage(
    {
      expectedInstrument: expected,
      instrumentVerificationResult: verifiedInstrument,
      pageIdentity: {
        ...matchingPageIdentity,
        prohibitedControls: { finalConfirmVisible: true },
      },
    },
    { checkedAt },
  );
  expect(finalConfirm.status).toBe("blocked");
  expect(finalConfirm.riskFlags).toEqual(
    expect.arrayContaining(["final_confirm_detected"]),
  );

  for (const [signal, expectedRisk] of [
    ["accountDataDetected", "account_data_detected"],
    ["balanceDataDetected", "balance_data_detected"],
    ["holdingsDataDetected", "holdings_data_detected"],
    ["sensitiveDataDetected", "sensitive_data_detected"],
  ] as const) {
    const sensitive = evaluateAvanzaInstrumentPage(
      {
        expectedInstrument: expected,
        instrumentVerificationResult: verifiedInstrument,
        pageIdentity: {
          ...matchingPageIdentity,
          sensitiveSignals: { [signal]: true },
        },
      },
      { checkedAt },
    );

    expect(sensitive.status).toBe("blocked");
    expect(sensitive.riskFlags).toEqual(expect.arrayContaining([expectedRisk]));
  }

  const prohibitedButtonsVisible = evaluateAvanzaInstrumentPage(
    {
      expectedInstrument: expected,
      instrumentVerificationResult: verifiedInstrument,
      pageIdentity: {
        ...matchingPageIdentity,
        prohibitedControls: {
          buyButtonVisible: true,
          sellButtonVisible: true,
        },
      },
    },
    { checkedAt },
  );
  expect(prohibitedButtonsVisible.status).toBe("page_identified");
  expect(prohibitedButtonsVisible.riskFlags).toEqual(
    expect.arrayContaining([
      "prohibited_buy_button_visible",
      "prohibited_sell_button_visible",
    ]),
  );
  expect(prohibitedButtonsVisible.warnings).toEqual(
    expect.arrayContaining([
      "Buy button visible as a prohibited guarded control.",
      "Sell button visible as a prohibited guarded control.",
    ]),
  );
  expect(summarizeAvanzaInstrumentPageResult(prohibitedButtonsVisible)).toContain(
    "Prohibited controls visible; no click allowed",
  );

  const prohibitedButtonsBlocked = evaluateAvanzaInstrumentPage(
    {
      expectedInstrument: expected,
      instrumentVerificationResult: verifiedInstrument,
      pageIdentity: {
        ...matchingPageIdentity,
        prohibitedControls: {
          buyButtonVisible: true,
          sellButtonVisible: true,
        },
      },
    },
    { checkedAt, allowProhibitedControlVisibility: false },
  );
  expect(prohibitedButtonsBlocked.status).toBe(
    "prohibited_order_controls_detected",
  );
  expect(prohibitedButtonsBlocked.errors).toEqual(
    expect.arrayContaining([
      "Buy button visibility is not allowed in this check.",
      "Sell button visibility is not allowed in this check.",
    ]),
  );
});

test("evaluates Avanza order page open results without browser control", () => {
  const checkedAt = "2026-06-11T13:45:00.000Z";
  const expected: AvanzaSearchOnlyExpectedInstrument = {
    ticker: "VOLV B",
    name: "Volvo B",
    market: "Stockholm",
    currency: "SEK",
    instrumentType: "stock",
  };
  const dryRunBuy = createAvanzaDryRunOrderInput({
    action: "buy",
    instrument: expected,
    quantity: 10,
    price: 220.5,
  });
  const dryRunSell = createAvanzaDryRunOrderInput({
    action: "sell",
    instrument: expected,
    quantity: 10,
    price: 220.5,
  });
  const candidate: AvanzaSearchOnlyCandidate = {
    candidateId: "candidate_order_page_volv_b",
    displayName: "Volvo B",
    ticker: "VOLV B",
    market: "Stockholm",
    currency: "SEK",
    instrumentType: "stock",
    matchConfidence: 0.98,
    sanitizedSource: "search_result",
    riskFlags: [],
    warnings: [],
  };
  const exactSearch = classifyAvanzaSearchOnlyCandidates(expected, [candidate], {
    checkedAt,
    requireMarketMatch: true,
    requireCurrencyMatch: true,
    requireInstrumentTypeMatch: true,
  });
  const verifiedInstrument = verifyAvanzaInstrument(
    {
      expectedInstrument: expected,
      searchOnlyResult: exactSearch,
    },
    { checkedAt },
  );
  const instrumentPage = evaluateAvanzaInstrumentPage(
    {
      expectedInstrument: expected,
      instrumentVerificationResult: verifiedInstrument,
      pageIdentity: {
        ticker: "VOLV B",
        name: "Volvo B",
        market: "Stockholm",
        currency: "SEK",
        instrumentType: "stock",
        sanitizedTitle: "Volvo B - instrument page",
        sanitizedHostClass: "avanza",
        pageContext: "instrument_page",
      },
    },
    { checkedAt },
  );
  const matchingOrderPageIdentity = {
    action: "buy" as const,
    ticker: "VOLV B",
    name: "Volvo B",
    market: "Stockholm",
    currency: "SEK",
    instrumentType: "stock",
    sanitizedTitle: "Volvo B - buy order page",
    sanitizedHostClass: "avanza",
    pageContext: "order_page" as const,
    controls: {
      reviewButtonVisible: true,
      finalConfirmVisible: false,
    },
    formSignals: {
      quantityFieldVisible: true,
      priceFieldVisible: true,
      accountFieldVisible: true,
      anyFieldPrefilled: false,
    },
    sensitiveSignals: {
      accountDataDetected: false,
      balanceDataDetected: false,
      holdingsDataDetected: false,
      sensitiveDataDetected: false,
    },
  };
  const buyOpened = evaluateAvanzaOrderPageOpen(
    {
      dryRunOrderInput: dryRunBuy,
      instrumentPageResult: instrumentPage,
      orderPageIdentity: matchingOrderPageIdentity,
      attemptedAction: "buy",
    },
    { checkedAt },
  );

  expect(buyOpened).toEqual(
    expect.objectContaining({
      ok: true,
      status: "order_page_opened",
      checkedAt,
      expectedAction: "buy",
    }),
  );
  expect(isAvanzaOrderPageOpened(buyOpened)).toBe(true);
  expect(buyOpened.fieldChecks).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ field: "action", status: "match" }),
      expect.objectContaining({ field: "ticker", status: "match" }),
      expect.objectContaining({ field: "market", status: "match" }),
      expect.objectContaining({ field: "currency", status: "match" }),
      expect.objectContaining({ field: "instrumentType", status: "match" }),
    ]),
  );
  expect(buyOpened.riskFlags).toEqual(
    expect.arrayContaining(["review_button_visible"]),
  );
  expect(buyOpened.warnings).toEqual(
    expect.arrayContaining(["Review/Granska button visible; no click allowed."]),
  );
  expect(buyOpened.metadata).toEqual(
    expect.objectContaining({
      contractVersion: AVANZA_ORDER_PAGE_OPEN_CONTRACT_VERSION,
      orderPageOpenOnly: true,
      noFormFill: true,
      noReviewClick: true,
      noFinalConfirmClick: true,
      noBrokerSubmission: true,
      noTradeMutation: true,
      noBrokerResult: true,
    }),
  );
  expect(summarizeAvanzaOrderPageOpenResult(buyOpened)).toBe(
    "Order page opened for expected buy action.",
  );
  expect(getAvanzaOrderPageOpenSafetyLabels(buyOpened)).toEqual(
    expect.arrayContaining([
      "Order page open only",
      "No form fill",
      "No Granska click",
      "No Bekräfta click",
      "No broker submission",
      "No trade mutation",
      "Order page opened",
    ]),
  );

  const sellOpened = evaluateAvanzaOrderPageOpen(
    {
      dryRunOrderInput: dryRunSell,
      instrumentPageResult: instrumentPage,
      orderPageIdentity: {
        ...matchingOrderPageIdentity,
        action: "sell",
        sanitizedTitle: "Volvo B - sell order page",
      },
      attemptedAction: "sell",
    },
    { checkedAt },
  );
  expect(sellOpened.status).toBe("order_page_opened");
  expect(summarizeAvanzaOrderPageOpenResult(sellOpened)).toBe(
    "Order page opened for expected sell action.",
  );

  const instrumentNotReady = evaluateAvanzaOrderPageOpen(
    {
      dryRunOrderInput: dryRunBuy,
      instrumentPageResult: evaluateAvanzaInstrumentPage(
        {
          expectedInstrument: expected,
          instrumentVerificationResult: verifiedInstrument,
        },
        { checkedAt },
      ),
      orderPageIdentity: matchingOrderPageIdentity,
    },
    { checkedAt },
  );
  expect(instrumentNotReady.status).toBe("instrument_page_not_ready");
  expect(instrumentNotReady.riskFlags).toEqual(
    expect.arrayContaining(["instrument_page_not_identified"]),
  );

  const unsupportedAction = evaluateAvanzaOrderPageOpen(
    {
      dryRunOrderInput: {
        ...dryRunBuy,
        action: "hold" as never,
      },
      instrumentPageResult: instrumentPage,
      orderPageIdentity: matchingOrderPageIdentity,
    },
    { checkedAt },
  );
  expect(unsupportedAction.status).toBe("action_not_supported");
  expect(unsupportedAction.riskFlags).toEqual(
    expect.arrayContaining(["unsupported_action"]),
  );

  const wrongAttemptedAction = evaluateAvanzaOrderPageOpen(
    {
      dryRunOrderInput: dryRunBuy,
      instrumentPageResult: instrumentPage,
      orderPageIdentity: matchingOrderPageIdentity,
      attemptedAction: "sell",
    },
    { checkedAt },
  );
  expect(wrongAttemptedAction.status).toBe("wrong_action_opened");
  expect(wrongAttemptedAction.riskFlags).toEqual(
    expect.arrayContaining(["action_mismatch", "order_page_wrong_action"]),
  );

  const wrongOpenedAction = evaluateAvanzaOrderPageOpen(
    {
      dryRunOrderInput: dryRunBuy,
      instrumentPageResult: instrumentPage,
      orderPageIdentity: {
        ...matchingOrderPageIdentity,
        action: "sell",
      },
      attemptedAction: "buy",
    },
    { checkedAt },
  );
  expect(wrongOpenedAction.status).toBe("wrong_action_opened");
  expect(summarizeAvanzaOrderPageOpenResult(wrongOpenedAction)).toBe(
    "Wrong action opened: expected buy, got sell.",
  );

  const tickerMismatch = evaluateAvanzaOrderPageOpen(
    {
      dryRunOrderInput: dryRunBuy,
      instrumentPageResult: instrumentPage,
      orderPageIdentity: {
        ...matchingOrderPageIdentity,
        ticker: "ERIC B",
      },
    },
    { checkedAt },
  );
  expect(tickerMismatch.status).toBe("order_page_mismatch");
  expect(tickerMismatch.riskFlags).toEqual(
    expect.arrayContaining(["order_page_wrong_instrument"]),
  );

  const currencyMismatch = evaluateAvanzaOrderPageOpen(
    {
      dryRunOrderInput: dryRunBuy,
      instrumentPageResult: instrumentPage,
      orderPageIdentity: {
        ...matchingOrderPageIdentity,
        currency: "NOK",
      },
    },
    { checkedAt },
  );
  expect(currencyMismatch.status).toBe("order_page_mismatch");
  expect(currencyMismatch.riskFlags).toEqual(
    expect.arrayContaining(["order_page_wrong_instrument"]),
  );

  const missingIdentity = evaluateAvanzaOrderPageOpen(
    {
      dryRunOrderInput: dryRunBuy,
      instrumentPageResult: instrumentPage,
    },
    { checkedAt },
  );
  expect(missingIdentity.status).toBe("unavailable");
  expect(summarizeAvanzaOrderPageOpenResult(missingIdentity)).toContain(
    "Sanitized order page identity is required",
  );

  const confirmationModal = evaluateAvanzaOrderPageOpen(
    {
      dryRunOrderInput: dryRunBuy,
      instrumentPageResult: instrumentPage,
      orderPageIdentity: {
        ...matchingOrderPageIdentity,
        pageContext: "confirmation_modal",
      },
    },
    { checkedAt },
  );
  expect(confirmationModal.status).toBe("blocked");
  expect(confirmationModal.riskFlags).toEqual(
    expect.arrayContaining(["final_confirm_detected"]),
  );

  const finalConfirmVisible = evaluateAvanzaOrderPageOpen(
    {
      dryRunOrderInput: dryRunBuy,
      instrumentPageResult: instrumentPage,
      orderPageIdentity: {
        ...matchingOrderPageIdentity,
        controls: {
          ...matchingOrderPageIdentity.controls,
          finalConfirmVisible: true,
        },
      },
    },
    { checkedAt },
  );
  expect(finalConfirmVisible.status).toBe("blocked");
  expect(finalConfirmVisible.riskFlags).toEqual(
    expect.arrayContaining(["final_confirm_detected"]),
  );

  const reviewClicked = evaluateAvanzaOrderPageOpen(
    {
      dryRunOrderInput: dryRunBuy,
      instrumentPageResult: instrumentPage,
      orderPageIdentity: matchingOrderPageIdentity,
      metadata: {
        reviewButtonClickedOrAttempted: true,
      },
    },
    { checkedAt },
  );
  expect(reviewClicked.status).toBe("blocked");
  expect(reviewClicked.riskFlags).toEqual(
    expect.arrayContaining(["review_button_clicked_or_attempted"]),
  );

  const finalConfirmClicked = evaluateAvanzaOrderPageOpen(
    {
      dryRunOrderInput: dryRunBuy,
      instrumentPageResult: instrumentPage,
      orderPageIdentity: matchingOrderPageIdentity,
      metadata: {
        finalConfirmClickedOrAttempted: true,
      },
    },
    { checkedAt },
  );
  expect(finalConfirmClicked.status).toBe("blocked");
  expect(finalConfirmClicked.riskFlags).toEqual(
    expect.arrayContaining(["final_confirm_clicked_or_attempted"]),
  );

  const keyboardSubmit = evaluateAvanzaOrderPageOpen(
    {
      dryRunOrderInput: dryRunBuy,
      instrumentPageResult: instrumentPage,
      orderPageIdentity: matchingOrderPageIdentity,
      metadata: {
        keyboardSubmitDetected: true,
      },
    },
    { checkedAt },
  );
  expect(keyboardSubmit.status).toBe("blocked");
  expect(keyboardSubmit.riskFlags).toEqual(
    expect.arrayContaining(["keyboard_submit_detected"]),
  );

  const prefilledForm = evaluateAvanzaOrderPageOpen(
    {
      dryRunOrderInput: dryRunBuy,
      instrumentPageResult: instrumentPage,
      orderPageIdentity: {
        ...matchingOrderPageIdentity,
        formSignals: {
          ...matchingOrderPageIdentity.formSignals,
          anyFieldPrefilled: true,
        },
      },
    },
    { checkedAt },
  );
  expect(prefilledForm.status).toBe("prohibited_form_interaction_detected");
  expect(prefilledForm.riskFlags).toEqual(
    expect.arrayContaining(["order_form_prefilled"]),
  );
  expect(summarizeAvanzaOrderPageOpenResult(prefilledForm)).toContain(
    "Order form was prefilled",
  );

  for (const [signal, expectedRisk] of [
    ["accountDataDetected", "account_data_detected"],
    ["balanceDataDetected", "balance_data_detected"],
    ["holdingsDataDetected", "holdings_data_detected"],
    ["sensitiveDataDetected", "sensitive_data_detected"],
  ] as const) {
    const sensitive = evaluateAvanzaOrderPageOpen(
      {
        dryRunOrderInput: dryRunBuy,
        instrumentPageResult: instrumentPage,
        orderPageIdentity: {
          ...matchingOrderPageIdentity,
          sensitiveSignals: { [signal]: true },
        },
      },
      { checkedAt },
    );

    expect(sensitive.status).toBe("blocked");
    expect(sensitive.riskFlags).toEqual(expect.arrayContaining([expectedRisk]));
  }

  const reviewVisibleBlocked = evaluateAvanzaOrderPageOpen(
    {
      dryRunOrderInput: dryRunBuy,
      instrumentPageResult: instrumentPage,
      orderPageIdentity: matchingOrderPageIdentity,
    },
    { checkedAt, blockOnReviewButtonVisible: true },
  );
  expect(reviewVisibleBlocked.status).toBe(
    "prohibited_form_interaction_detected",
  );
  expect(reviewVisibleBlocked.riskFlags).toEqual(
    expect.arrayContaining(["review_button_visible"]),
  );
});

test("evaluates Avanza Advanced form fill results without browser control", () => {
  const checkedAt = "2026-06-11T14:15:00.000Z";
  const dryRunOrderInput = createAvanzaDryRunOrderInput({
    action: "buy",
    instrument: {
      ticker: "VOLV B",
      name: "Volvo B",
      market: "Stockholm",
      currency: "SEK",
      instrumentType: "stock",
    },
    quantity: 10,
    price: 220.5,
  });
  const candidate: AvanzaSearchOnlyCandidate = {
    candidateId: "candidate_form_fill_volv_b",
    displayName: "Volvo B",
    ticker: "VOLV B",
    market: "Stockholm",
    currency: "SEK",
    instrumentType: "stock",
    matchConfidence: 0.98,
    sanitizedSource: "search_result",
    riskFlags: [],
    warnings: [],
  };
  const exactSearch = classifyAvanzaSearchOnlyCandidates(
    dryRunOrderInput.instrument,
    [candidate],
    {
      checkedAt,
      requireMarketMatch: true,
      requireCurrencyMatch: true,
      requireInstrumentTypeMatch: true,
    },
  );
  const verifiedInstrument = verifyAvanzaInstrument(
    {
      expectedInstrument: dryRunOrderInput.instrument,
      searchOnlyResult: exactSearch,
    },
    { checkedAt },
  );
  const instrumentPage = evaluateAvanzaInstrumentPage(
    {
      expectedInstrument: dryRunOrderInput.instrument,
      instrumentVerificationResult: verifiedInstrument,
      pageIdentity: {
        ticker: "VOLV B",
        name: "Volvo B",
        market: "Stockholm",
        currency: "SEK",
        instrumentType: "stock",
        sanitizedTitle: "Volvo B - instrument page",
        sanitizedHostClass: "avanza",
        pageContext: "instrument_page",
      },
    },
    { checkedAt },
  );
  const orderPageOpen = evaluateAvanzaOrderPageOpen(
    {
      dryRunOrderInput,
      instrumentPageResult: instrumentPage,
      attemptedAction: "buy",
      orderPageIdentity: {
        action: "buy",
        ticker: "VOLV B",
        name: "Volvo B",
        market: "Stockholm",
        currency: "SEK",
        instrumentType: "stock",
        sanitizedTitle: "Volvo B - buy order page",
        sanitizedHostClass: "avanza",
        pageContext: "order_page",
        controls: {
          reviewButtonVisible: true,
          finalConfirmVisible: false,
        },
        formSignals: {
          quantityFieldVisible: true,
          priceFieldVisible: true,
          accountFieldVisible: true,
          anyFieldPrefilled: false,
        },
      },
    },
    { checkedAt },
  );
  const matchingForm: AvanzaAdvancedFormState = {
    action: "buy",
    ticker: "VOLV B",
    name: "Volvo B",
    market: "Stockholm",
    currency: "SEK",
    instrumentType: "stock",
    orderMode: "advanced",
    quantity: 10,
    price: 220.5,
    controls: {
      reviewButtonVisible: true,
      finalConfirmVisible: false,
    },
    interactions: {
      keyboardSubmitDetected: false,
      accountChanged: false,
      unsupportedFieldTouched: false,
    },
    sensitiveSignals: {
      accountDataDetected: false,
      balanceDataDetected: false,
      holdingsDataDetected: false,
      sensitiveDataDetected: false,
    },
    validation: {
      validationErrorsVisible: false,
    },
  };
  const filled = evaluateAvanzaAdvancedFormFill(
    {
      dryRunOrderInput,
      orderPageOpenResult: orderPageOpen,
      formState: matchingForm,
    },
    { checkedAt },
  );

  expect(filled).toEqual(
    expect.objectContaining({
      ok: true,
      status: "form_filled",
      checkedAt,
      expectedAction: "buy",
      expectedQuantity: 10,
      expectedPrice: 220.5,
    }),
  );
  expect(isAvanzaAdvancedFormFilled(filled)).toBe(true);
  expect(filled.fieldChecks).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ field: "action", status: "match" }),
      expect.objectContaining({ field: "ticker", status: "match" }),
      expect.objectContaining({ field: "quantity", status: "match" }),
      expect.objectContaining({ field: "price", status: "match" }),
    ]),
  );
  expect(filled.riskFlags).toEqual(
    expect.arrayContaining(["review_button_visible"]),
  );
  expect(filled.metadata).toEqual(
    expect.objectContaining({
      contractVersion: AVANZA_ADVANCED_FORM_FILL_CONTRACT_VERSION,
      advancedFormFillOnly: true,
      noReviewClick: true,
      noFinalConfirmClick: true,
      noKeyboardSubmit: true,
      noBrokerSubmission: true,
      noBrokerResult: true,
      noSupabaseWrite: true,
      noTradeMutation: true,
    }),
  );
  expect(summarizeAvanzaAdvancedFormFillResult(filled)).toContain(
    "Advanced form filled for buy VOLV B",
  );
  expect(getAvanzaAdvancedFormFillSafetyLabels(filled)).toEqual(
    expect.arrayContaining([
      "Advanced form fill only",
      "No Granska click",
      "No Bekräfta click",
      "No keyboard submit",
      "No broker submission",
      "No trade mutation",
      "Advanced form filled",
    ]),
  );

  const orderPageNotReady = evaluateAvanzaAdvancedFormFill(
    {
      dryRunOrderInput,
      orderPageOpenResult: {
        ...orderPageOpen,
        ok: false,
        status: "order_page_mismatch",
        blockers: ["Order page mismatch."],
        errors: ["Order page mismatch."],
      },
      formState: matchingForm,
    },
    { checkedAt },
  );
  expect(orderPageNotReady.status).toBe("order_page_not_ready");
  expect(orderPageNotReady.riskFlags).toEqual(
    expect.arrayContaining(["order_page_not_opened"]),
  );

  const missingFormState = evaluateAvanzaAdvancedFormFill(
    {
      dryRunOrderInput,
      orderPageOpenResult: orderPageOpen,
    },
    { checkedAt },
  );
  expect(missingFormState.status).toBe("unavailable");
  expect(missingFormState.riskFlags).toEqual(
    expect.arrayContaining(["missing_form_state"]),
  );

  for (const [orderMode, expectedRisk] of [
    ["stop_loss", "stop_loss_mode_detected"],
    ["glidande", "glidande_mode_detected"],
    ["unknown", "unsupported_order_mode"],
  ] as const) {
    const unsupportedMode = evaluateAvanzaAdvancedFormFill(
      {
        dryRunOrderInput,
        orderPageOpenResult: orderPageOpen,
        formState: {
          ...matchingForm,
          orderMode,
        },
      },
      { checkedAt },
    );

    expect(unsupportedMode.status).toBe("unsupported_order_mode");
    expect(unsupportedMode.riskFlags).toEqual(
      expect.arrayContaining([expectedRisk]),
    );
  }

  for (const [patch, expectedRisk] of [
    [{ action: "sell" as const }, "action_mismatch"],
    [{ ticker: "ERIC B" }, "ticker_mismatch"],
    [{ quantity: undefined }, "missing_quantity"],
    [{ quantity: 0 }, "invalid_quantity"],
    [{ quantity: 11 }, "quantity_mismatch"],
    [{ price: undefined }, "missing_price"],
    [{ price: 0 }, "invalid_price"],
    [{ price: 221 }, "price_mismatch"],
  ] as const) {
    const mismatch = evaluateAvanzaAdvancedFormFill(
      {
        dryRunOrderInput,
        orderPageOpenResult: orderPageOpen,
        formState: {
          ...matchingForm,
          ...patch,
        },
      },
      { checkedAt },
    );

    expect(mismatch.status).toBe("field_mismatch");
    expect(mismatch.riskFlags).toEqual(expect.arrayContaining([expectedRisk]));
  }

  const validationError = evaluateAvanzaAdvancedFormFill(
    {
      dryRunOrderInput,
      orderPageOpenResult: orderPageOpen,
      formState: {
        ...matchingForm,
        validation: {
          validationErrorsVisible: true,
          validationMessages: ["Kurs saknas."],
        },
      },
    },
    { checkedAt },
  );
  expect(validationError.status).toBe("validation_error");
  expect(validationError.errors).toEqual(expect.arrayContaining(["Kurs saknas."]));
  expect(validationError.riskFlags).toEqual(
    expect.arrayContaining(["validation_error_visible"]),
  );

  const reviewClicked = evaluateAvanzaAdvancedFormFill(
    {
      dryRunOrderInput,
      orderPageOpenResult: orderPageOpen,
      formState: {
        ...matchingForm,
        controls: {
          ...matchingForm.controls,
          reviewButtonClickedOrAttempted: true,
        },
      },
    },
    { checkedAt },
  );
  expect(reviewClicked.status).toBe("prohibited_review_detected");
  expect(reviewClicked.riskFlags).toEqual(
    expect.arrayContaining(["review_button_clicked_or_attempted"]),
  );

  const finalConfirmVisible = evaluateAvanzaAdvancedFormFill(
    {
      dryRunOrderInput,
      orderPageOpenResult: orderPageOpen,
      formState: {
        ...matchingForm,
        controls: {
          ...matchingForm.controls,
          finalConfirmVisible: true,
        },
      },
    },
    { checkedAt },
  );
  expect(finalConfirmVisible.status).toBe(
    "prohibited_final_confirm_detected",
  );
  expect(finalConfirmVisible.riskFlags).toEqual(
    expect.arrayContaining(["final_confirm_detected"]),
  );

  const finalConfirmAttempted = evaluateAvanzaAdvancedFormFill(
    {
      dryRunOrderInput,
      orderPageOpenResult: orderPageOpen,
      formState: matchingForm,
      metadata: {
        finalConfirmClickedOrAttempted: true,
      },
    },
    { checkedAt },
  );
  expect(finalConfirmAttempted.status).toBe(
    "prohibited_final_confirm_detected",
  );
  expect(finalConfirmAttempted.riskFlags).toEqual(
    expect.arrayContaining(["final_confirm_clicked_or_attempted"]),
  );

  for (const [formStatePatch, metadata, expectedRisk] of [
    [
      { interactions: { keyboardSubmitDetected: true } },
      {},
      "keyboard_submit_detected",
    ],
    [{ interactions: { accountChanged: true } }, {}, "account_changed"],
    [
      { interactions: { unsupportedFieldTouched: true } },
      {},
      "unsupported_field_touched",
    ],
    [
      { sensitiveSignals: { accountDataDetected: true } },
      {},
      "account_data_detected",
    ],
    [
      { sensitiveSignals: { balanceDataDetected: true } },
      {},
      "balance_data_detected",
    ],
    [
      { sensitiveSignals: { holdingsDataDetected: true } },
      {},
      "holdings_data_detected",
    ],
    [
      { sensitiveSignals: { sensitiveDataDetected: true } },
      {},
      "sensitive_data_detected",
    ],
    [{}, { unsupportedFieldTouched: true }, "unsupported_field_touched"],
  ] as const) {
    const blocked = evaluateAvanzaAdvancedFormFill(
      {
        dryRunOrderInput,
        orderPageOpenResult: orderPageOpen,
        formState: {
          ...matchingForm,
          ...formStatePatch,
        },
        metadata,
      },
      { checkedAt },
    );

    expect(blocked.status).toBe("blocked");
    expect(blocked.riskFlags).toEqual(expect.arrayContaining([expectedRisk]));
  }

  const reviewVisibleBlocked = evaluateAvanzaAdvancedFormFill(
    {
      dryRunOrderInput,
      orderPageOpenResult: orderPageOpen,
      formState: matchingForm,
    },
    { checkedAt, blockOnReviewButtonVisible: true },
  );
  expect(reviewVisibleBlocked.status).toBe("field_mismatch");
  expect(reviewVisibleBlocked.riskFlags).toEqual(
    expect.arrayContaining(["review_button_visible"]),
  );
});

test("evaluates Avanza review-click confirmation readback without browser control", () => {
  const checkedAt = "2026-06-11T14:20:00.000Z";
  const dryRunOrderInput = createAvanzaDryRunOrderInput({
    action: "buy",
    instrument: {
      ticker: "VOLV B",
      name: "Volvo B",
      market: "Stockholm",
      currency: "SEK",
      instrumentType: "stock",
    },
    quantity: 10,
    price: 220.5,
  });
  const advancedFormFillResult: AvanzaAdvancedFormFillResult = {
    ok: true,
    status: "form_filled",
    checkedAt,
    expectedAction: "buy",
    expectedInstrument: dryRunOrderInput.instrument,
    expectedQuantity: 10,
    expectedPrice: 220.5,
    fieldChecks: [],
    riskFlags: [],
    blockers: [],
    warnings: [],
    errors: [],
    labels: ["Advanced form filled"],
    metadata: {
      noReviewClick: true,
      noFinalConfirmClick: true,
    },
  };
  const matchingReadback: AvanzaConfirmationModalReadback = {
    action: "buy",
    ticker: "VOLV B",
    name: "Volvo B",
    market: "Stockholm",
    currency: "SEK",
    instrumentType: "stock",
    quantityValue: 10,
    priceValue: 220.5,
    accountLabelSanitized: "Manual review account",
    fees: "1.00",
    totalAmount: "2206.00",
    validUntil: "2026-06-11",
    confirmationModalVisible: true,
    cancelButtonVisible: true,
    finalConfirmVisible: true,
    finalConfirmLabel: "Bekräfta köp",
    validationErrors: [],
    sensitiveSignals: {
      accountDataDetected: false,
      balanceDataDetected: false,
      holdingsDataDetected: false,
      sensitiveDataDetected: false,
    },
    interactionSignals: {
      finalConfirmClickedOrAttempted: false,
      keyboardSubmitDetected: false,
    },
  };

  const ready = evaluateAvanzaReviewClick(
    {
      dryRunOrderInput,
      advancedFormFillResult,
      confirmationReadback: matchingReadback,
      reviewClickAttempted: true,
      reviewLabel: "Granska köp",
    },
    { checkedAt },
  );

  expect(ready).toEqual(
    expect.objectContaining({
      ok: true,
      status: "confirmation_ready",
      checkedAt,
      expectedAction: "buy",
      expectedQuantity: 10,
      expectedPrice: 220.5,
    }),
  );
  expect(isAvanzaConfirmationReady(ready)).toBe(true);
  expect(ready.fieldChecks).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ field: "action", status: "match" }),
      expect.objectContaining({ field: "ticker", status: "match" }),
      expect.objectContaining({ field: "quantity", status: "match" }),
      expect.objectContaining({ field: "price", status: "match" }),
    ]),
  );
  expect(ready.riskFlags).toEqual(
    expect.arrayContaining(["review_click_attempted", "final_confirm_visible"]),
  );
  expect(ready.warnings).toEqual(
    expect.arrayContaining([
      "Final-confirm/Bekrafta control is visible as read-only evidence only.",
    ]),
  );
  expect(ready.metadata).toEqual(
    expect.objectContaining({
      contractVersion: AVANZA_REVIEW_CLICK_CONTRACT_VERSION,
      reviewClickReadbackOnly: true,
      waitingForManualConfirmation: true,
      noFinalConfirmClick: true,
      noKeyboardSubmit: true,
      noBrokerSubmission: true,
      noBrokerResult: true,
      noSupabaseWrite: true,
      noTradeMutation: true,
    }),
  );
  expect(summarizeAvanzaReviewClickResult(ready)).toContain(
    "manual confirmation",
  );
  expect(summarizeAvanzaReviewClickResult(ready)).toContain(
    "No broker result or order submission occurred",
  );
  expect(getAvanzaReviewClickSafetyLabels(ready)).toEqual(
    expect.arrayContaining([
      "Review click / confirmation readback only",
      "No Bekräfta click",
      "Manual final confirmation required",
      "No broker result",
      "Confirmation ready for manual final confirmation",
    ]),
  );

  const formNotReady = evaluateAvanzaReviewClick(
    {
      dryRunOrderInput,
      advancedFormFillResult: {
        ...advancedFormFillResult,
        ok: false,
        status: "field_mismatch",
        blockers: ["Advanced form quantity mismatch."],
        errors: ["Advanced form quantity mismatch."],
      },
      confirmationReadback: matchingReadback,
    },
    { checkedAt },
  );
  expect(formNotReady.status).toBe("form_not_ready");
  expect(formNotReady.riskFlags).toEqual(
    expect.arrayContaining(["form_not_filled"]),
  );

  const missingReadback = evaluateAvanzaReviewClick(
    {
      dryRunOrderInput,
      advancedFormFillResult,
    },
    { checkedAt },
  );
  expect(missingReadback.status).toBe("unavailable");
  expect(missingReadback.riskFlags).toEqual(
    expect.arrayContaining(["confirmation_modal_missing"]),
  );

  const modalMissing = evaluateAvanzaReviewClick(
    {
      dryRunOrderInput,
      advancedFormFillResult,
      confirmationReadback: {
        ...matchingReadback,
        confirmationModalVisible: false,
      },
    },
    { checkedAt },
  );
  expect(modalMissing.status).toBe("failed");
  expect(modalMissing.riskFlags).toEqual(
    expect.arrayContaining(["confirmation_modal_missing"]),
  );

  const reviewLabelMismatch = evaluateAvanzaReviewClick(
    {
      dryRunOrderInput,
      advancedFormFillResult,
      confirmationReadback: matchingReadback,
      reviewLabel: "Granska sälj",
    },
    { checkedAt },
  );
  expect(reviewLabelMismatch.status).toBe("blocked");
  expect(reviewLabelMismatch.riskFlags).toEqual(
    expect.arrayContaining(["review_label_mismatch"]),
  );

  for (const [patch, expectedRisk] of [
    [{ action: "sell" as const }, "confirmation_action_mismatch"],
    [{ ticker: "ERIC B" }, "confirmation_ticker_mismatch"],
    [{ quantityValue: undefined }, "confirmation_quantity_mismatch"],
    [{ quantityValue: 11 }, "confirmation_quantity_mismatch"],
    [{ priceValue: undefined }, "confirmation_price_mismatch"],
    [{ priceValue: 221 }, "confirmation_price_mismatch"],
  ] as const) {
    const mismatch = evaluateAvanzaReviewClick(
      {
        dryRunOrderInput,
        advancedFormFillResult,
        confirmationReadback: {
          ...matchingReadback,
          ...patch,
        },
      },
      { checkedAt },
    );

    expect(mismatch.status).toBe("confirmation_mismatch");
    expect(mismatch.riskFlags).toEqual(expect.arrayContaining([expectedRisk]));
  }

  const validationError = evaluateAvanzaReviewClick(
    {
      dryRunOrderInput,
      advancedFormFillResult,
      confirmationReadback: {
        ...matchingReadback,
        validationErrors: ["Kurs saknas."],
      },
    },
    { checkedAt },
  );
  expect(validationError.status).toBe("validation_error");
  expect(validationError.errors).toEqual(
    expect.arrayContaining(["Kurs saknas."]),
  );
  expect(validationError.riskFlags).toEqual(
    expect.arrayContaining(["validation_error_visible"]),
  );

  const finalConfirmAttempted = evaluateAvanzaReviewClick(
    {
      dryRunOrderInput,
      advancedFormFillResult,
      confirmationReadback: {
        ...matchingReadback,
        interactionSignals: {
          finalConfirmClickedOrAttempted: true,
        },
      },
    },
    { checkedAt },
  );
  expect(finalConfirmAttempted.status).toBe(
    "prohibited_final_confirm_detected",
  );
  expect(finalConfirmAttempted.riskFlags).toEqual(
    expect.arrayContaining(["final_confirm_clicked_or_attempted"]),
  );

  const keyboardSubmit = evaluateAvanzaReviewClick(
    {
      dryRunOrderInput,
      advancedFormFillResult,
      confirmationReadback: {
        ...matchingReadback,
        interactionSignals: {
          keyboardSubmitDetected: true,
        },
      },
    },
    { checkedAt },
  );
  expect(keyboardSubmit.status).toBe("blocked");
  expect(keyboardSubmit.riskFlags).toEqual(
    expect.arrayContaining(["keyboard_submit_detected"]),
  );

  for (const [signal, expectedRisk] of [
    ["accountDataDetected", "account_data_detected"],
    ["balanceDataDetected", "balance_data_detected"],
    ["holdingsDataDetected", "holdings_data_detected"],
    ["sensitiveDataDetected", "sensitive_data_detected"],
  ] as const) {
    const sensitive = evaluateAvanzaReviewClick(
      {
        dryRunOrderInput,
        advancedFormFillResult,
        confirmationReadback: {
          ...matchingReadback,
          sensitiveSignals: { [signal]: true },
        },
      },
      { checkedAt },
    );

    expect(sensitive.status).toBe("blocked");
    expect(sensitive.riskFlags).toEqual(expect.arrayContaining([expectedRisk]));
  }

  const optionalFieldsMissing = evaluateAvanzaReviewClick(
    {
      dryRunOrderInput,
      advancedFormFillResult,
      confirmationReadback: {
        ...matchingReadback,
        fees: undefined,
        totalAmount: undefined,
        validUntil: undefined,
      },
    },
    { checkedAt },
  );
  expect(optionalFieldsMissing.status).toBe("confirmation_ready");
  expect(optionalFieldsMissing.warnings).toEqual(
    expect.arrayContaining([
      "Confirmation modal fees/courtage are missing.",
      "Confirmation modal total amount is missing.",
      "Confirmation modal valid-until value is missing.",
    ]),
  );
});

test("evaluates Avanza manual confirmation wait states without browser control", () => {
  const checkedAt = "2026-06-11T14:35:00.000Z";
  const reviewClickReady = {
    ok: true,
    status: "confirmation_ready" as const,
    checkedAt,
    expectedAction: "buy" as const,
    expectedInstrument: {
      ticker: "VOLV B",
      name: "Volvo B",
      market: "Stockholm",
      currency: "SEK",
      instrumentType: "stock",
    },
    expectedQuantity: 10,
    expectedPrice: 220.5,
    fieldChecks: [],
    riskFlags: [],
    blockers: [],
    warnings: [],
    errors: [],
    labels: ["Confirmation ready for manual final confirmation"],
    metadata: {
      contractVersion: AVANZA_REVIEW_CLICK_CONTRACT_VERSION,
      waitingForManualConfirmation: true,
      noFinalConfirmClick: true,
      noBrokerResult: true,
      noTradeMutation: true,
    },
  };
  const reviewClickNotReady = {
    ...reviewClickReady,
    ok: false,
    status: "confirmation_mismatch" as const,
    blockers: ["Quantity mismatch."],
    errors: ["Quantity mismatch."],
    metadata: {
      ...reviewClickReady.metadata,
      waitingForManualConfirmation: false,
    },
  };

  const notReady = evaluateAvanzaManualConfirmationWait(
    { reviewClickResult: reviewClickNotReady },
    { checkedAt },
  );
  expect(notReady.status).toBe("confirmation_not_ready");
  expect(notReady.riskFlags).toEqual(
    expect.arrayContaining(["confirmation_not_ready"]),
  );

  const waiting = evaluateAvanzaManualConfirmationWait(
    { reviewClickResult: reviewClickReady },
    { checkedAt },
  );
  expect(waiting).toEqual(
    expect.objectContaining({
      ok: true,
      status: "waiting_for_manual_confirmation",
      checkedAt,
      reviewClickStatus: "confirmation_ready",
      waitingForManualConfirmation: true,
    }),
  );
  expect(isAvanzaWaitingForManualConfirmation(waiting)).toBe(true);
  expect(waiting.metadata).toEqual(
    expect.objectContaining({
      contractVersion: AVANZA_MANUAL_CONFIRMATION_WAIT_CONTRACT_VERSION,
      manualConfirmationWaitOnly: true,
      noFinalConfirmClick: true,
      noBrokerResult: true,
      noSupabaseWrite: true,
      noTradeMutation: true,
      separateConfirmationCaptureRequired: true,
    }),
  );
  expect(summarizeAvanzaManualConfirmationWaitResult(waiting)).toContain(
    "Waiting for manual confirmation",
  );
  expect(getAvanzaManualConfirmationWaitSafetyLabels(waiting)).toEqual(
    expect.arrayContaining([
      "Manual confirmation wait only",
      "Human final action required",
      "No Bekräfta by agent",
      "No broker result",
      "No trade mutation",
      "Separate confirmation capture required",
    ]),
  );

  const finalVisibleReadOnly = evaluateAvanzaManualConfirmationWait(
    {
      reviewClickResult: reviewClickReady,
      observation: {
        modalStillVisible: true,
        finalConfirmVisible: true,
        cancelButtonVisible: true,
      },
    },
    { checkedAt },
  );
  expect(finalVisibleReadOnly.status).toBe(
    "waiting_for_manual_confirmation",
  );
  expect(finalVisibleReadOnly.riskFlags).toEqual(
    expect.arrayContaining(["final_confirm_visible_read_only"]),
  );
  expect(finalVisibleReadOnly.warnings).toEqual(
    expect.arrayContaining([
      "Final-confirm control is visible as read-only evidence only.",
    ]),
  );

  const userCancelled = evaluateAvanzaManualConfirmationWait(
    {
      reviewClickResult: reviewClickReady,
      observation: { userCancelled: true },
    },
    { checkedAt },
  );
  expect(userCancelled.status).toBe("user_cancelled");
  expect(userCancelled.riskFlags).toEqual(
    expect.arrayContaining(["user_cancelled"]),
  );

  const timedOut = evaluateAvanzaManualConfirmationWait(
    {
      reviewClickResult: reviewClickReady,
      observation: { timedOut: true },
    },
    { checkedAt },
  );
  expect(timedOut.status).toBe("timed_out");
  expect(timedOut.riskFlags).toEqual(
    expect.arrayContaining(["timeout_elapsed"]),
  );

  const elapsedTimeout = evaluateAvanzaManualConfirmationWait(
    {
      reviewClickResult: reviewClickReady,
      observation: { elapsedMs: 301_000 },
      timeoutMs: 300_000,
    },
    { checkedAt },
  );
  expect(elapsedTimeout.status).toBe("timed_out");

  const userConfirmed = evaluateAvanzaManualConfirmationWait(
    {
      reviewClickResult: reviewClickReady,
      observation: { userConfirmed: true },
    },
    { checkedAt },
  );
  expect(userConfirmed.status).toBe("user_confirmed_unverified");
  expect(isAvanzaUserConfirmedUnverified(userConfirmed)).toBe(true);
  expect(userConfirmed.warnings).toEqual(
    expect.arrayContaining([
      "User appears to have confirmed, but broker result is not captured. Separate confirmation capture is required.",
    ]),
  );
  expect(summarizeAvanzaManualConfirmationWaitResult(userConfirmed)).toContain(
    "broker result is not captured",
  );

  const finalAttempt = evaluateAvanzaManualConfirmationWait(
    {
      reviewClickResult: reviewClickReady,
      observation: {
        interactionSignals: {
          finalConfirmClickedByAgentOrAttempted: true,
        },
      },
    },
    { checkedAt },
  );
  expect(finalAttempt.status).toBe("blocked");
  expect(finalAttempt.riskFlags).toEqual(
    expect.arrayContaining(["final_confirm_clicked_by_agent_or_attempted"]),
  );

  const keyboardSubmit = evaluateAvanzaManualConfirmationWait(
    {
      reviewClickResult: reviewClickReady,
      observation: {
        interactionSignals: {
          keyboardSubmitDetected: true,
        },
      },
    },
    { checkedAt },
  );
  expect(keyboardSubmit.status).toBe("blocked");
  expect(keyboardSubmit.riskFlags).toEqual(
    expect.arrayContaining(["keyboard_submit_detected"]),
  );

  const unexpectedBrokerResult = evaluateAvanzaManualConfirmationWait(
    {
      reviewClickResult: reviewClickReady,
      observation: {
        unexpectedSignals: {
          brokerResultDetected: true,
        },
      },
    },
    { checkedAt },
  );
  expect(unexpectedBrokerResult.status).toBe("blocked");
  expect(unexpectedBrokerResult.riskFlags).toEqual(
    expect.arrayContaining(["broker_result_detected_unexpectedly"]),
  );

  const tradeMutation = evaluateAvanzaManualConfirmationWait(
    {
      reviewClickResult: reviewClickReady,
      observation: {
        unexpectedSignals: {
          tradeMutationDetected: true,
        },
      },
    },
    { checkedAt },
  );
  expect(tradeMutation.status).toBe("blocked");
  expect(tradeMutation.riskFlags).toEqual(
    expect.arrayContaining(["trade_mutation_detected_unexpectedly"]),
  );

  for (const [signal, expectedRisk] of [
    ["accountDataDetected", "account_data_detected"],
    ["balanceDataDetected", "balance_data_detected"],
    ["holdingsDataDetected", "holdings_data_detected"],
    ["sensitiveDataDetected", "sensitive_data_detected"],
  ] as const) {
    const sensitive = evaluateAvanzaManualConfirmationWait(
      {
        reviewClickResult: reviewClickReady,
        observation: {
          sensitiveSignals: { [signal]: true },
        },
      },
      { checkedAt },
    );

    expect(sensitive.status).toBe("blocked");
    expect(sensitive.riskFlags).toEqual(
      expect.arrayContaining([expectedRisk]),
    );
  }
});

test("evaluates Avanza broker confirmation capture results without browser control", () => {
  const checkedAt = "2026-06-11T14:55:00.000Z";
  const dryRunOrderInput = createAvanzaDryRunOrderInput({
    action: "buy",
    instrument: {
      ticker: "VOLV B",
      name: "Volvo B",
      market: "Stockholm",
      currency: "SEK",
      instrumentType: "stock",
    },
    quantity: 10,
    price: 220.5,
    metadata: {
      allowFinalSubmit: false,
      supportsBrokerSubmission: false,
      supportsFinalConfirmClick: false,
      automaticModeCapable: false,
    },
    createdAt: checkedAt,
  });
  const reviewClickReady = {
    ok: true,
    status: "confirmation_ready" as const,
    checkedAt,
    expectedAction: "buy" as const,
    expectedInstrument: dryRunOrderInput.instrument,
    expectedQuantity: 10,
    expectedPrice: 220.5,
    fieldChecks: [],
    riskFlags: [],
    blockers: [],
    warnings: [],
    errors: [],
    labels: ["Confirmation ready for manual final confirmation"],
    metadata: {
      contractVersion: AVANZA_REVIEW_CLICK_CONTRACT_VERSION,
      waitingForManualConfirmation: true,
      noFinalConfirmClick: true,
      noBrokerResult: true,
      noTradeMutation: true,
    },
  };
  const waiting = evaluateAvanzaManualConfirmationWait(
    { reviewClickResult: reviewClickReady },
    { checkedAt },
  );
  const userConfirmedUnverified = evaluateAvanzaManualConfirmationWait(
    {
      reviewClickResult: reviewClickReady,
      observation: {
        modalStillVisible: false,
        userConfirmed: true,
      },
    },
    { checkedAt },
  );
  const matchingReadback: AvanzaBrokerConfirmationReadback = {
    action: "buy",
    ticker: "VOLV B",
    name: "Volvo B",
    market: "Stockholm",
    currency: "SEK",
    instrumentType: "stock",
    quantityValue: 10,
    priceValue: 220.5,
    fees: "1.00",
    totalAmount: "2206.00",
    timestamp: checkedAt,
    orderIdSanitized: "AVZ-ORDER-001",
    accountLabelSanitized: "Sanitized account",
    orderStatus: "filled",
    statusTextSanitized: "Filled",
    confirmationPageVisible: true,
  };
  const evaluate = (
    brokerConfirmationReadback: AvanzaBrokerConfirmationReadback | undefined,
    options: Parameters<typeof evaluateAvanzaBrokerConfirmationCapture>[1] = {},
  ) =>
    evaluateAvanzaBrokerConfirmationCapture(
      {
        dryRunOrderInput,
        manualConfirmationWaitResult: userConfirmedUnverified,
        ...(brokerConfirmationReadback ? { brokerConfirmationReadback } : {}),
      },
      { checkedAt, ...options },
    );

  const manualNotObserved = evaluateAvanzaBrokerConfirmationCapture(
    {
      dryRunOrderInput,
      manualConfirmationWaitResult: waiting,
      brokerConfirmationReadback: matchingReadback,
    },
    { checkedAt },
  );
  expect(manualNotObserved.status).toBe("manual_confirmation_not_observed");
  expect(manualNotObserved.riskFlags).toEqual(
    expect.arrayContaining(["manual_confirmation_not_observed"]),
  );

  expect(evaluate(undefined).status).toBe("confirmation_page_not_found");
  expect(
    evaluate({ ...matchingReadback, confirmationPageVisible: false }).status,
  ).toBe("confirmation_page_not_found");

  const captured = evaluate(matchingReadback);
  expect(captured).toEqual(
    expect.objectContaining({
      ok: true,
      status: "confirmation_captured",
      checkedAt,
      expectedAction: "buy",
      expectedQuantity: 10,
      expectedPrice: 220.5,
      orderStatus: "filled",
    }),
  );
  expect(isAvanzaBrokerConfirmationCaptured(captured)).toBe(true);
  expect(captured.metadata).toEqual(
    expect.objectContaining({
      contractVersion: AVANZA_BROKER_CONFIRMATION_CAPTURE_CONTRACT_VERSION,
      brokerConfirmationCaptureOnly: true,
      noBekraftaByAgent: true,
      noBrokerExecutionResult: true,
      noExecutionRecord: true,
      noSupabaseWrite: true,
      noTradeMutation: true,
      sanitizedEvidenceOnly: true,
    }),
  );
  expect(getAvanzaBrokerConfirmationCaptureSafetyLabels(captured)).toEqual(
    expect.arrayContaining([
      "Broker confirmation capture only",
      "No Bekräfta by agent",
      "No BrokerExecutionResult",
      "No execution record",
      "No Supabase write",
      "No trade mutation",
    ]),
  );
  expect(summarizeAvanzaBrokerConfirmationCaptureResult(captured)).toContain(
    "No BrokerExecutionResult",
  );

  const placed = evaluate({ ...matchingReadback, orderStatus: "placed" });
  expect(placed.status).toBe("confirmation_partial");
  expect(isAvanzaBrokerConfirmationPartial(placed)).toBe(true);
  expect(placed.riskFlags).toEqual(
    expect.arrayContaining(["order_placed_not_filled"]),
  );
  expect(summarizeAvanzaBrokerConfirmationCaptureResult(placed)).toContain(
    "fill is not confirmed",
  );

  const accepted = evaluate({ ...matchingReadback, orderStatus: "accepted" });
  expect(accepted.status).toBe("confirmation_partial");
  expect(accepted.riskFlags).toEqual(
    expect.arrayContaining(["order_placed_not_filled"]),
  );

  const partialFill = evaluate({
    ...matchingReadback,
    orderStatus: "partially_filled",
  });
  expect(partialFill.status).toBe("confirmation_partial");
  expect(partialFill.riskFlags).toEqual(
    expect.arrayContaining(["partial_fill"]),
  );

  for (const orderStatus of ["rejected", "cancelled", "expired"] as const) {
    const rejectedOrCancelled = evaluate({
      ...matchingReadback,
      orderStatus,
    });
    expect(rejectedOrCancelled.status).toBe(
      "confirmation_rejected_or_cancelled",
    );
  }

  expect(evaluate({ ...matchingReadback, action: "sell" }).status).toBe(
    "confirmation_mismatch",
  );
  expect(evaluate({ ...matchingReadback, ticker: "ERIC B" }).riskFlags).toEqual(
    expect.arrayContaining(["ticker_mismatch"]),
  );
  expect(evaluate({ ...matchingReadback, quantityValue: 11 }).riskFlags).toEqual(
    expect.arrayContaining(["quantity_mismatch"]),
  );
  expect(evaluate({ ...matchingReadback, priceValue: 221 }).riskFlags).toEqual(
    expect.arrayContaining(["price_mismatch"]),
  );

  const missingRequiredOptional = evaluate(
    {
      ...matchingReadback,
      orderIdSanitized: undefined,
      timestamp: undefined,
      fees: undefined,
      totalAmount: undefined,
    },
    { requireOrderId: true, requireTimestamp: true },
  );
  expect(missingRequiredOptional.status).toBe("confirmation_partial");
  expect(missingRequiredOptional.riskFlags).toEqual(
    expect.arrayContaining([
      "missing_order_id",
      "missing_timestamp",
      "missing_fee",
      "missing_total",
    ]),
  );

  const ambiguous = evaluate({
    ...matchingReadback,
    orderStatus: "unknown",
    statusTextSanitized: "Oklar status, manual review",
  });
  expect(ambiguous.status).toBe("confirmation_partial");
  expect(ambiguous.riskFlags).toEqual(
    expect.arrayContaining([
      "status_unknown",
      "ambiguous_confirmation_wording",
    ]),
  );

  const sensitive = evaluate({
    ...matchingReadback,
    sensitiveSignals: {
      accountDataDetected: true,
      balanceDataDetected: true,
      holdingsDataDetected: true,
      sensitiveDataDetected: true,
      rawDomDetected: true,
      unsanitizedScreenshotDetected: true,
    },
  });
  expect(sensitive.status).toBe("blocked");
  expect(sensitive.riskFlags).toEqual(
    expect.arrayContaining([
      "account_data_detected",
      "balance_data_detected",
      "holdings_data_detected",
      "sensitive_data_detected",
      "raw_dom_detected",
      "unsanitized_screenshot_detected",
    ]),
  );
  expect(summarizeAvanzaBrokerConfirmationCaptureResult(sensitive)).toContain(
    "Blocked",
  );

  const brokerResultAttempt = evaluate({
    ...matchingReadback,
    forbiddenSignals: { brokerResultCreationAttempted: true },
  });
  expect(brokerResultAttempt.status).toBe("blocked");
  expect(brokerResultAttempt.riskFlags).toEqual(
    expect.arrayContaining(["broker_result_creation_attempted"]),
  );

  const tradeMutationAttempt = evaluate({
    ...matchingReadback,
    forbiddenSignals: { tradeMutationAttempted: true },
  });
  expect(tradeMutationAttempt.status).toBe("blocked");
  expect(tradeMutationAttempt.riskFlags).toEqual(
    expect.arrayContaining(["trade_mutation_attempted"]),
  );
});

test("evaluates Avanza broker execution result conversion eligibility without creating results", () => {
  const checkedAt = "2026-06-11T15:05:00.000Z";
  const dryRunOrderInput = createAvanzaDryRunOrderInput({
    action: "buy",
    instrument: {
      ticker: "VOLV B",
      name: "Volvo B",
      market: "Stockholm",
      currency: "SEK",
      instrumentType: "stock",
    },
    quantity: 10,
    price: 220.5,
    createdAt: checkedAt,
  });
  const reviewClickReady = {
    ok: true,
    status: "confirmation_ready" as const,
    checkedAt,
    expectedAction: "buy" as const,
    expectedInstrument: dryRunOrderInput.instrument,
    expectedQuantity: 10,
    expectedPrice: 220.5,
    fieldChecks: [],
    riskFlags: [],
    blockers: [],
    warnings: [],
    errors: [],
    labels: ["Confirmation ready for manual final confirmation"],
    metadata: {
      contractVersion: AVANZA_REVIEW_CLICK_CONTRACT_VERSION,
      waitingForManualConfirmation: true,
      noFinalConfirmClick: true,
      noBrokerResult: true,
      noTradeMutation: true,
    },
  };
  const userConfirmedUnverified = evaluateAvanzaManualConfirmationWait(
    {
      reviewClickResult: reviewClickReady,
      observation: { userConfirmed: true },
    },
    { checkedAt },
  );
  const matchingReadback: AvanzaBrokerConfirmationReadback = {
    action: "buy",
    ticker: "VOLV B",
    name: "Volvo B",
    market: "Stockholm",
    currency: "SEK",
    instrumentType: "stock",
    quantityValue: 10,
    priceValue: 220.5,
    fees: "1.00",
    totalAmount: "2206.00",
    timestamp: checkedAt,
    orderIdSanitized: "AVZ-ORDER-ELIGIBLE-001",
    accountLabelSanitized: "Sanitized account",
    orderStatus: "filled",
    statusTextSanitized: "Filled",
    confirmationPageVisible: true,
  };
  const evaluateCapture = (
    brokerConfirmationReadback: AvanzaBrokerConfirmationReadback,
  ) =>
    evaluateAvanzaBrokerConfirmationCapture(
      {
        dryRunOrderInput,
        manualConfirmationWaitResult: userConfirmedUnverified,
        brokerConfirmationReadback,
      },
      { checkedAt },
    );
  const captured = evaluateCapture(matchingReadback);
  const fingerprint =
    buildAvanzaBrokerConfirmationEvidenceFingerprint(captured);
  const eligible = evaluateAvanzaBrokerExecutionResultEligibility({
    captureResult: captured,
  });

  expect(eligible).toEqual(
    expect.objectContaining({
      ok: true,
      status: "eligible",
      eligible: true,
      evidenceFingerprint: fingerprint,
      reasons: [],
      blockers: [],
      errors: [],
    }),
  );
  expect(isAvanzaBrokerExecutionResultEligible(eligible)).toBe(true);
  expect(eligible.metadata).toEqual(
    expect.objectContaining({
      eligibilityCheckOnly: true,
      noBrokerExecutionResultCreated: true,
      noExecutionRecordCreated: true,
      noSupabaseWrite: true,
      noTradeMutation: true,
      captureStatus: "confirmation_captured",
      orderStatus: "filled",
    }),
  );
  expect(getAvanzaBrokerExecutionResultEligibilityLabels(eligible)).toEqual(
    expect.arrayContaining([
      "Eligibility check only",
      "No BrokerExecutionResult created",
      "No execution record",
      "No Supabase write",
      "No trade mutation",
    ]),
  );
  expect(summarizeAvanzaBrokerExecutionResultEligibility(eligible)).toContain(
    "Eligible for future BrokerExecutionResult conversion",
  );

  const duplicate = evaluateAvanzaBrokerExecutionResultEligibility({
    captureResult: captured,
    existingFingerprints: [fingerprint],
  });
  expect(duplicate.status).toBe("duplicate_risk");
  expect(duplicate.reasons).toEqual(
    expect.arrayContaining(["duplicate_fingerprint_detected"]),
  );

  for (const orderStatus of ["placed", "accepted"] as const) {
    const placed = evaluateAvanzaBrokerExecutionResultEligibility({
      captureResult: evaluateCapture({
        ...matchingReadback,
        orderStatus,
        orderIdSanitized: `AVZ-ORDER-${orderStatus}`,
      }),
    });

    expect(placed.status).toBe("partial_only");
    expect(placed.reasons).toEqual(
      expect.arrayContaining(["capture_partial", "manual_review_required"]),
    );
  }

  const partialFill = evaluateAvanzaBrokerExecutionResultEligibility({
    captureResult: evaluateCapture({
      ...matchingReadback,
      orderStatus: "partially_filled",
      orderIdSanitized: "AVZ-ORDER-PARTIAL",
    }),
  });
  expect(partialFill.status).toBe("partial_only");

  const quantityMismatch = evaluateAvanzaBrokerExecutionResultEligibility({
    captureResult: evaluateCapture({
      ...matchingReadback,
      quantityValue: 11,
      orderIdSanitized: "AVZ-ORDER-MISMATCH",
    }),
  });
  expect(quantityMismatch.status).toBe("blocked");
  expect(quantityMismatch.reasons).toEqual(
    expect.arrayContaining(["capture_mismatch"]),
  );

  const rejected = evaluateAvanzaBrokerExecutionResultEligibility({
    captureResult: evaluateCapture({
      ...matchingReadback,
      orderStatus: "rejected",
      orderIdSanitized: "AVZ-ORDER-REJECTED",
    }),
  });
  expect(rejected.status).toBe("blocked");
  expect(rejected.reasons).toEqual(
    expect.arrayContaining(["capture_rejected_or_cancelled"]),
  );

  const missingCore = evaluateAvanzaBrokerExecutionResultEligibility({
    captureResult: {
      ...captured,
      expectedQuantity: 0,
      expectedPrice: 0,
      brokerConfirmationReadback: {
        ...matchingReadback,
        timestamp: undefined,
        orderIdSanitized: undefined,
      },
    },
  });
  expect(missingCore.status).toBe("blocked");
  expect(missingCore.reasons).toEqual(
    expect.arrayContaining([
      "missing_quantity",
      "missing_price",
      "missing_timestamp",
      "missing_order_id",
    ]),
  );

  const missingAllowed = evaluateAvanzaBrokerExecutionResultEligibility({
    captureResult: {
      ...captured,
      brokerConfirmationReadback: {
        ...matchingReadback,
        timestamp: undefined,
        orderIdSanitized: undefined,
      },
    },
    options: {
      allowMissingOrderId: true,
      allowMissingTimestamp: true,
    },
  });
  expect(missingAllowed.status).toBe("eligible");
  expect(missingAllowed.warnings).toEqual(
    expect.arrayContaining([
      "Broker confirmation timestamp is missing.",
      "Broker confirmation order id is missing.",
    ]),
  );

  const sensitive = evaluateAvanzaBrokerExecutionResultEligibility({
    captureResult: evaluateCapture({
      ...matchingReadback,
      orderIdSanitized: "AVZ-ORDER-SENSITIVE",
      sensitiveSignals: {
        sensitiveDataDetected: true,
        rawDomDetected: true,
      },
    }),
  });
  expect(sensitive.status).toBe("blocked");
  expect(sensitive.reasons).toEqual(
    expect.arrayContaining([
      "capture_blocked",
      "capture_not_captured",
      "sensitive_data_detected",
      "raw_data_detected",
    ]),
  );

  const capturedWithSensitiveRiskFlag =
    evaluateAvanzaBrokerExecutionResultEligibility({
      captureResult: {
        ...captured,
        riskFlags: ["sensitive_data_detected", "raw_dom_detected"],
      },
    });
  expect(capturedWithSensitiveRiskFlag.status).toBe("blocked");
  expect(capturedWithSensitiveRiskFlag.reasons).toEqual(
    expect.arrayContaining([
      "sensitive_data_detected",
      "raw_data_detected",
      "risk_flags_present",
    ]),
  );

  const brokerResultAttempt = evaluateAvanzaBrokerExecutionResultEligibility({
    captureResult: evaluateCapture({
      ...matchingReadback,
      orderIdSanitized: "AVZ-ORDER-BROKER-RESULT",
      forbiddenSignals: {
        brokerResultCreationAttempted: true,
      },
    }),
  });
  expect(brokerResultAttempt.status).toBe("blocked");
  expect(brokerResultAttempt.reasons).toEqual(
    expect.arrayContaining([
      "broker_result_attempt_detected",
      "capture_blocked",
    ]),
  );

  const capturedWithBrokerResultRiskFlag =
    evaluateAvanzaBrokerExecutionResultEligibility({
      captureResult: {
        ...captured,
        riskFlags: ["broker_result_creation_attempted"],
      },
    });
  expect(capturedWithBrokerResultRiskFlag.status).toBe("blocked");
  expect(capturedWithBrokerResultRiskFlag.reasons).toEqual(
    expect.arrayContaining([
      "broker_result_attempt_detected",
      "risk_flags_present",
    ]),
  );

  const tradeMutationAttempt = evaluateAvanzaBrokerExecutionResultEligibility({
    captureResult: evaluateCapture({
      ...matchingReadback,
      orderIdSanitized: "AVZ-ORDER-TRADE-MUTATION",
      forbiddenSignals: {
        tradeMutationAttempted: true,
      },
    }),
  });
  expect(tradeMutationAttempt.status).toBe("blocked");
  expect(tradeMutationAttempt.reasons).toEqual(
    expect.arrayContaining([
      "capture_blocked",
      "trade_mutation_attempt_detected",
    ]),
  );

  const capturedWithTradeMutationRiskFlag =
    evaluateAvanzaBrokerExecutionResultEligibility({
      captureResult: {
        ...captured,
        riskFlags: ["trade_mutation_attempted"],
      },
    });
  expect(capturedWithTradeMutationRiskFlag.status).toBe("blocked");
  expect(capturedWithTradeMutationRiskFlag.reasons).toEqual(
    expect.arrayContaining([
      "trade_mutation_attempt_detected",
      "risk_flags_present",
    ]),
  );
});

test("builds Avanza broker execution result previews without creating real results", () => {
  const checkedAt = "2026-06-11T15:35:00.000Z";
  const dryRunOrderInput = createAvanzaDryRunOrderInput({
    action: "buy",
    instrument: {
      ticker: "ERIC B",
      name: "Ericsson B",
      market: "Stockholm",
      currency: "SEK",
      instrumentType: "stock",
    },
    quantity: 12,
    price: 84.25,
    createdAt: checkedAt,
  });
  const reviewClickReady = {
    ok: true,
    status: "confirmation_ready" as const,
    checkedAt,
    expectedAction: "buy" as const,
    expectedInstrument: dryRunOrderInput.instrument,
    expectedQuantity: dryRunOrderInput.quantity,
    expectedPrice: dryRunOrderInput.price,
    fieldChecks: [],
    riskFlags: [],
    blockers: [],
    warnings: [],
    errors: [],
    labels: ["Confirmation ready for manual final confirmation"],
    metadata: {
      contractVersion: AVANZA_REVIEW_CLICK_CONTRACT_VERSION,
      waitingForManualConfirmation: true,
      noFinalConfirmClick: true,
      noBrokerResult: true,
      noTradeMutation: true,
    },
  };
  const userConfirmedUnverified = evaluateAvanzaManualConfirmationWait(
    {
      reviewClickResult: reviewClickReady,
      observation: { userConfirmed: true },
    },
    { checkedAt },
  );
  const matchingReadback: AvanzaBrokerConfirmationReadback = {
    action: "buy",
    ticker: "ERIC B",
    name: "Ericsson B",
    market: "Stockholm",
    currency: "SEK",
    instrumentType: "stock",
    quantityValue: 12,
    priceValue: 84.25,
    fees: "1.50",
    totalAmount: "1012.50",
    timestamp: checkedAt,
    orderIdSanitized: "AVZ-ORDER-PREVIEW-001",
    orderStatus: "filled",
    statusTextSanitized: "Filled",
    confirmationPageVisible: true,
  };
  const evaluateCapture = (
    brokerConfirmationReadback: AvanzaBrokerConfirmationReadback,
  ) =>
    evaluateAvanzaBrokerConfirmationCapture(
      {
        dryRunOrderInput,
        manualConfirmationWaitResult: userConfirmedUnverified,
        brokerConfirmationReadback,
      },
      { checkedAt },
    );
  const captured = evaluateCapture(matchingReadback);
  const previewResult = buildAvanzaBrokerExecutionResultPreview({
    captureResult: captured,
    metadata: {
      sourceRequestId: "dry_run_request_preview_001",
      sourceCaptureId: "capture_preview_001",
    },
  });

  expect(previewResult).toEqual(
    expect.objectContaining({
      ok: true,
      status: "preview_available",
      blockers: [],
      errors: [],
    }),
  );
  expect(isAvanzaBrokerExecutionResultPreviewAvailable(previewResult)).toBe(
    true,
  );
  expect(previewResult.preview).toEqual(
    expect.objectContaining({
      broker: "avanza",
      action: "buy",
      ticker: "ERIC B",
      instrumentName: "Ericsson B",
      market: "Stockholm",
      currency: "SEK",
      instrumentType: "stock",
      quantity: 12,
      price: 84.25,
      fees: 1.5,
      totalAmount: 1012.5,
      timestamp: checkedAt,
      brokerOrderId: "AVZ-ORDER-PREVIEW-001",
      orderStatus: "filled",
      sourceCaptureFingerprint:
        buildAvanzaBrokerConfirmationEvidenceFingerprint(captured),
      sourceRequestId: "dry_run_request_preview_001",
      sourceCaptureId: "capture_preview_001",
    }),
  );
  expect(previewResult.preview?.metadata).toEqual(
    expect.objectContaining({
      previewOnly: true,
      notBrokerExecutionResult: true,
      noExecutionRecord: true,
      noSupabaseWrite: true,
      noTradeMutation: true,
      eligibilityStatus: "eligible",
      captureStatus: "confirmation_captured",
      orderStatus: "filled",
    }),
  );
  expect(previewResult.metadata).toEqual(
    expect.objectContaining({
      previewOnly: true,
      notBrokerExecutionResult: true,
      noExecutionRecord: true,
      noSupabaseWrite: true,
      noTradeMutation: true,
    }),
  );
  expect(getAvanzaBrokerExecutionResultPreviewLabels(previewResult)).toEqual(
    expect.arrayContaining([
      "BrokerExecutionResult preview only",
      "Not a real BrokerExecutionResult",
      "No execution record",
      "No Supabase write",
      "No trade mutation",
    ]),
  );
  expect(summarizeAvanzaBrokerExecutionResultPreview(previewResult)).toContain(
    "BrokerExecutionResult preview available",
  );

  const partial = buildAvanzaBrokerExecutionResultPreview({
    captureResult: evaluateCapture({
      ...matchingReadback,
      orderStatus: "placed",
      orderIdSanitized: "AVZ-ORDER-PREVIEW-PLACED",
    }),
  });
  expect(partial.status).toBe("partial_only");
  expect(partial.preview).toBeUndefined();

  const mismatch = buildAvanzaBrokerExecutionResultPreview({
    captureResult: evaluateCapture({
      ...matchingReadback,
      quantityValue: 13,
      orderIdSanitized: "AVZ-ORDER-PREVIEW-MISMATCH",
    }),
  });
  expect(mismatch.status).toBe("blocked");
  expect(mismatch.preview).toBeUndefined();

  const duplicateFingerprint =
    buildAvanzaBrokerConfirmationEvidenceFingerprint(captured);
  const duplicate = buildAvanzaBrokerExecutionResultPreview({
    captureResult: captured,
    existingFingerprints: [duplicateFingerprint],
  });
  expect(duplicate.status).toBe("duplicate_risk");
  expect(duplicate.preview).toBeUndefined();

  const missingOptional = buildAvanzaBrokerExecutionResultPreview({
    captureResult: {
      ...captured,
      brokerConfirmationReadback: {
        ...matchingReadback,
        fees: undefined,
        totalAmount: undefined,
        timestamp: undefined,
        orderIdSanitized: undefined,
      },
    },
    options: {
      allowMissingOrderId: true,
      allowMissingTimestamp: true,
    },
  });
  expect(missingOptional.status).toBe("preview_available");
  expect(missingOptional.preview?.metadata.notBrokerExecutionResult).toBe(true);
  expect(missingOptional.warnings).toEqual(
    expect.arrayContaining([
      "Broker confirmation timestamp is missing.",
      "Broker confirmation order id is missing.",
      "Broker fees/courtage are missing.",
      "Broker total amount is missing.",
    ]),
  );
});

test("evaluates execution record eligibility without creating records", () => {
  const filledCandidate: ExecutionRecordCandidate = {
    broker: "avanza",
    action: "buy",
    ticker: "ERIC B",
    instrumentName: "Ericsson B",
    market: "Stockholm",
    currency: "SEK",
    instrumentType: "stock",
    quantity: 12,
    price: 84.25,
    fees: 1.5,
    totalAmount: 1012.5,
    timestamp: "2026-06-11T16:05:00.000Z",
    brokerOrderId: "AVZ-RECORD-ELIGIBLE-001",
    sourceEvidenceFingerprint: "evidence-record-eligible-001",
    sourceRequestId: "dry_run_request_record_001",
    sourceCaptureId: "capture_record_001",
    sourceBrokerResultFingerprint: "broker-result-record-001",
    status: "filled",
    metadata: {
      previewOnly: false,
    },
  };
  const fingerprint =
    buildExecutionRecordCandidateFingerprint(filledCandidate);
  const eligible = evaluateExecutionRecordEligibility({
    candidate: filledCandidate,
  });

  expect(eligible).toEqual(
    expect.objectContaining({
      ok: true,
      status: "eligible",
      eligible: true,
      reasons: [],
      blockers: [],
      errors: [],
      recordFingerprint: fingerprint,
    }),
  );
  expect(isExecutionRecordEligible(eligible)).toBe(true);
  expect(eligible.metadata).toEqual(
    expect.objectContaining({
      eligibilityOnly: true,
      noExecutionRecordCreated: true,
      noSupabaseWrite: true,
      noTradeMutation: true,
    }),
  );
  expect(getExecutionRecordEligibilityLabels(eligible)).toEqual(
    expect.arrayContaining([
      "Execution record eligibility only",
      "No execution record created",
      "No Supabase write",
      "No trade mutation",
    ]),
  );
  expect(summarizeExecutionRecordEligibility(eligible)).toContain(
    "Eligible for future local execution record creation",
  );

  const missingCandidate = evaluateExecutionRecordEligibility({});
  expect(missingCandidate.status).toBe("not_eligible");
  expect(missingCandidate.reasons).toEqual(
    expect.arrayContaining(["broker_result_missing"]),
  );

  const previewOnly = evaluateExecutionRecordEligibility({
    candidate: {
      ...filledCandidate,
      metadata: { previewOnly: true, notBrokerExecutionResult: true },
    },
  });
  expect(previewOnly.status).toBe("blocked");
  expect(previewOnly.reasons).toEqual(
    expect.arrayContaining(["broker_result_preview_only"]),
  );

  const previewAllowed = evaluateExecutionRecordEligibility({
    candidate: {
      ...filledCandidate,
      metadata: { previewOnly: true },
    },
    options: { allowPreviewOnly: true },
  });
  expect(previewAllowed.status).toBe("eligible");
  expect(previewAllowed.reasons).toEqual(
    expect.arrayContaining([
      "broker_result_preview_only",
      "manual_review_required",
    ]),
  );
  expect(previewAllowed.warnings.join(" ")).toContain("manual review");

  for (const [field, reason] of [
    ["action", "missing_action"],
    ["ticker", "missing_instrument"],
    ["quantity", "missing_quantity"],
    ["price", "missing_price"],
  ] as const) {
    const invalidCandidate: ExecutionRecordCandidate = {
      ...filledCandidate,
      [field]: undefined,
    };
    const result = evaluateExecutionRecordEligibility({
      candidate: invalidCandidate,
    });

    expect(result.status).toBe("blocked");
    expect(result.reasons).toEqual(expect.arrayContaining([reason]));
  }

  const missingTimestampAndReference = evaluateExecutionRecordEligibility({
    candidate: {
      ...filledCandidate,
      timestamp: undefined,
      brokerOrderId: undefined,
    },
  });
  expect(missingTimestampAndReference.status).toBe("blocked");
  expect(missingTimestampAndReference.reasons).toEqual(
    expect.arrayContaining([
      "missing_timestamp",
      "missing_broker_reference",
    ]),
  );

  const missingAllowed = evaluateExecutionRecordEligibility({
    candidate: {
      ...filledCandidate,
      timestamp: undefined,
      brokerOrderId: undefined,
    },
    options: {
      allowMissingBrokerReference: true,
      allowMissingTimestamp: true,
    },
  });
  expect(missingAllowed.status).toBe("eligible");
  expect(missingAllowed.warnings).toEqual(
    expect.arrayContaining([
      "Broker result candidate timestamp is missing.",
      "Broker result candidate broker reference is missing.",
    ]),
  );

  const missingSourceFingerprint = evaluateExecutionRecordEligibility({
    candidate: {
      ...filledCandidate,
      sourceEvidenceFingerprint: undefined,
      sourceBrokerResultFingerprint: undefined,
    },
  });
  expect(missingSourceFingerprint.status).toBe("blocked");
  expect(missingSourceFingerprint.reasons).toEqual(
    expect.arrayContaining(["missing_source_fingerprint"]),
  );

  const notFilled = evaluateExecutionRecordEligibility({
    candidate: {
      ...filledCandidate,
      brokerOrderId: "AVZ-RECORD-PLACED-001",
      sourceEvidenceFingerprint: "evidence-record-placed-001",
      status: "placed",
    },
  });
  expect(notFilled.status).toBe("blocked");
  expect(notFilled.reasons).toEqual(
    expect.arrayContaining(["broker_result_not_filled"]),
  );

  for (const metadata of [
    { sensitiveDataDetected: true },
    { rawDataDetected: true },
    { supabaseWriteAttempted: true },
    { tradeMutationAttempted: true },
    { executionRecordCreationAttempted: true },
  ]) {
    const result = evaluateExecutionRecordEligibility({
      candidate: {
        ...filledCandidate,
        brokerOrderId: `AVZ-RECORD-${Object.keys(metadata)[0]}`,
        sourceEvidenceFingerprint: `evidence-${Object.keys(metadata)[0]}`,
        metadata,
      },
    });

    expect(result.status).toBe("blocked");
  }

  const duplicateSource = evaluateExecutionRecordEligibility({
    candidate: filledCandidate,
    existingSourceFingerprints: [filledCandidate.sourceEvidenceFingerprint!],
  });
  expect(duplicateSource.status).toBe("duplicate_risk");
  expect(duplicateSource.reasons).toEqual(
    expect.arrayContaining(["duplicate_source_fingerprint"]),
  );

  const duplicateBrokerReference = evaluateExecutionRecordEligibility({
    candidate: filledCandidate,
    existingBrokerReferences: [filledCandidate.brokerOrderId!],
  });
  expect(duplicateBrokerReference.status).toBe("duplicate_risk");
  expect(duplicateBrokerReference.reasons).toEqual(
    expect.arrayContaining(["duplicate_broker_reference"]),
  );
});

test("normalizes localhost bridge execution record eligibility stub responses safely", async () => {
  const checkedAt = "2026-06-11T16:22:00.000Z";
  const candidate: ExecutionRecordCandidate = {
    broker: "avanza",
    action: "sell",
    ticker: "QA.RECORD",
    instrumentName: "QA Record Instrument",
    market: "Stockholm",
    currency: "SEK",
    instrumentType: "stock",
    quantity: 6,
    price: 177.5,
    fees: 1.25,
    totalAmount: 1066.25,
    timestamp: checkedAt,
    brokerOrderId: "AVZ-EXEC-RECORD-ELIG-001",
    sourceEvidenceFingerprint: "evidence-exec-record-elig-001",
    sourceRequestId: "execution_record_eligibility_request_test",
    sourceCaptureId: "capture-exec-record-elig-001",
    sourceBrokerResultFingerprint: "broker-result-exec-record-elig-001",
    status: "filled",
    metadata: { previewOnly: false },
  };
  const buildEligibilityResponse = (
    executionRecordEligibility: ReturnType<
      typeof evaluateExecutionRecordEligibility
    >,
    statusCode: number,
  ) => ({
    version: "avanza_localhost_bridge_v1" as const,
    ok: executionRecordEligibility.ok,
    bridgeVersion: "avanza_localhost_bridge_v1" as const,
    requestId: "execution_record_eligibility_request_test",
    receivedAt: checkedAt,
    completedAt: checkedAt,
    executionRecordEligibility,
    message:
      "Execution record eligibility bridge stub completed safely. No execution record was created.",
    errors: executionRecordEligibility.errors,
    warnings: [
      "Execution record creation is not implemented.",
      "Eligibility check only.",
      "No BrokerExecutionResult was created.",
      "No execution record was created.",
      "No Supabase write occurred.",
      "No trade mutation occurred.",
      ...executionRecordEligibility.warnings,
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
    statusCode,
  });
  const eligible = buildEligibilityResponse(
    evaluateExecutionRecordEligibility({ candidate }),
    200,
  );
  const previewOnly = buildEligibilityResponse(
    evaluateExecutionRecordEligibility({
      candidate: {
        ...candidate,
        brokerOrderId: "AVZ-EXEC-RECORD-PREVIEW-ONLY",
        sourceEvidenceFingerprint: "evidence-exec-record-preview-only",
        metadata: { previewOnly: true, notBrokerExecutionResult: true },
      },
    }),
    400,
  );
  const missingPrice = buildEligibilityResponse(
    evaluateExecutionRecordEligibility({
      candidate: {
        ...candidate,
        price: undefined,
        brokerOrderId: "AVZ-EXEC-RECORD-MISSING-PRICE",
        sourceEvidenceFingerprint: "evidence-exec-record-missing-price",
      },
    }),
    400,
  );
  const notFilled = buildEligibilityResponse(
    evaluateExecutionRecordEligibility({
      candidate: {
        ...candidate,
        status: "placed",
        brokerOrderId: "AVZ-EXEC-RECORD-NOT-FILLED",
        sourceEvidenceFingerprint: "evidence-exec-record-not-filled",
      },
    }),
    400,
  );
  const sensitive = buildEligibilityResponse(
    evaluateExecutionRecordEligibility({
      candidate: {
        ...candidate,
        brokerOrderId: "AVZ-EXEC-RECORD-SENSITIVE",
        sourceEvidenceFingerprint: "evidence-exec-record-sensitive",
        metadata: { sensitiveDataDetected: true, rawDataDetected: true },
      },
    }),
    400,
  );
  const supabaseAttempt = buildEligibilityResponse(
    evaluateExecutionRecordEligibility({
      candidate: {
        ...candidate,
        brokerOrderId: "AVZ-EXEC-RECORD-SUPABASE",
        sourceEvidenceFingerprint: "evidence-exec-record-supabase",
        metadata: { supabaseWriteAttempted: true },
      },
    }),
    400,
  );
  const tradeAttempt = buildEligibilityResponse(
    evaluateExecutionRecordEligibility({
      candidate: {
        ...candidate,
        brokerOrderId: "AVZ-EXEC-RECORD-TRADE",
        sourceEvidenceFingerprint: "evidence-exec-record-trade",
        metadata: { tradeMutationAttempted: true },
      },
    }),
    400,
  );
  const recordAttempt = buildEligibilityResponse(
    evaluateExecutionRecordEligibility({
      candidate: {
        ...candidate,
        brokerOrderId: "AVZ-EXEC-RECORD-CREATION",
        sourceEvidenceFingerprint: "evidence-exec-record-creation",
        metadata: { executionRecordCreationAttempted: true },
      },
    }),
    400,
  );
  const duplicateSource = buildEligibilityResponse(
    evaluateExecutionRecordEligibility({
      candidate,
      existingSourceFingerprints: [candidate.sourceEvidenceFingerprint!],
    }),
    400,
  );
  const duplicateBroker = buildEligibilityResponse(
    evaluateExecutionRecordEligibility({
      candidate,
      existingBrokerReferences: [candidate.brokerOrderId!],
    }),
    400,
  );
  const responses = [
    eligible,
    previewOnly,
    missingPrice,
    notFilled,
    sensitive,
    supabaseAttempt,
    tradeAttempt,
    recordAttempt,
    duplicateSource,
    duplicateBroker,
  ];
  const request = buildLocalhostBridgeExecutionRecordEligibilityRequest({
    requestId: "execution_record_eligibility_request_test",
    createdAt: checkedAt,
    candidate,
    existingSourceFingerprints: [],
    existingBrokerReferences: [],
  });

  expect(validateLocalhostBridgeExecutionRecordEligibilityRequest(request)).toEqual(
    expect.objectContaining({ ok: true, errors: [] }),
  );
  expect(
    validateLocalhostBridgeExecutionRecordEligibilityResponse(eligible),
  ).toEqual(expect.objectContaining({ ok: true, errors: [] }));
  expect(
    summarizeLocalhostExecutionRecordEligibilityBridgeResponse(eligible),
  ).toContain("No execution record");

  let responseIndex = 0;
  const fetchFn: typeof fetch = async (input, init) => {
    expect(String(input)).toBe(
      "http://127.0.0.1:47833/execution-record-eligibility",
    );
    expect(init?.method).toBe("POST");
    const body =
      typeof init?.body === "string"
        ? (JSON.parse(init.body) as Record<string, unknown>)
        : {};

    expect(body).toEqual(
      expect.objectContaining({
        requestId: "execution_record_eligibility_request_test",
        metadata: expect.objectContaining({
          execution_record_eligibility_stub_check: true,
          execution_record_eligibility_check_only: true,
          no_broker_execution_result_created: true,
          no_execution_record_created: true,
          no_supabase_write: true,
        }),
      }),
    );

    const responseBody = responses[responseIndex++];

    return new Response(JSON.stringify(responseBody), {
      status: responseBody.statusCode,
      headers: { "Content-Type": "application/json" },
    });
  };
  const callClient = () =>
    checkLocalhostBridgeExecutionRecordEligibility({
      requestId: "execution_record_eligibility_request_test",
      createdAt: checkedAt,
      candidate,
      baseUrl: "http://127.0.0.1:47833",
      fetchFn,
    });

  const eligibleResponse = await callClient();
  expect(eligibleResponse).toEqual(
    expect.objectContaining({
      ok: true,
      reachable: true,
      status: "eligible",
      statusCode: 200,
    }),
  );
  expect(eligibleResponse.summary).toContain("No Supabase write");

  const previewOnlyResponse = await callClient();
  expect(previewOnlyResponse.status).toBe("blocked");
  expect(previewOnlyResponse.errors.join(" ")).toContain("preview-only");

  const missingPriceResponse = await callClient();
  expect(missingPriceResponse.status).toBe("blocked");
  expect(missingPriceResponse.errors.join(" ")).toContain("price");

  const notFilledResponse = await callClient();
  expect(notFilledResponse.status).toBe("blocked");
  expect(notFilledResponse.errors.join(" ")).toContain("filled");

  const sensitiveResponse = await callClient();
  expect(sensitiveResponse.status).toBe("blocked");
  expect(sensitiveResponse.errors.join(" ")).toContain("Sensitive");

  const supabaseAttemptResponse = await callClient();
  expect(supabaseAttemptResponse.status).toBe("blocked");
  expect(supabaseAttemptResponse.errors.join(" ")).toContain("Supabase write");

  const tradeAttemptResponse = await callClient();
  expect(tradeAttemptResponse.status).toBe("blocked");
  expect(tradeAttemptResponse.errors.join(" ")).toContain("Trade mutation");

  const recordAttemptResponse = await callClient();
  expect(recordAttemptResponse.status).toBe("blocked");
  expect(recordAttemptResponse.errors.join(" ")).toContain(
    "Execution record creation",
  );

  const duplicateSourceResponse = await callClient();
  expect(duplicateSourceResponse.status).toBe("duplicate_risk");
  expect(duplicateSourceResponse.errors.join(" ")).toContain("duplicate");

  const duplicateBrokerResponse = await callClient();
  expect(duplicateBrokerResponse.status).toBe("duplicate_risk");
  expect(duplicateBrokerResponse.errors.join(" ")).toContain("duplicate");

  const invalidJson = await checkLocalhostBridgeExecutionRecordEligibility({
    candidate,
    fetchFn: async () =>
      new Response("not json", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
  });
  expect(invalidJson).toEqual(
    expect.objectContaining({
      ok: false,
      reachable: true,
      status: "failed",
    }),
  );
  expect(invalidJson.errors[0]).toContain("invalid JSON");

  const invalidShape = await checkLocalhostBridgeExecutionRecordEligibility({
    candidate,
    fetchFn: async () =>
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
  });
  expect(invalidShape.ok).toBe(false);
  expect(invalidShape.errors.join(" ")).toContain(
    "execution record eligibility response",
  );
});

test("normalizes localhost bridge broker execution result preview stub responses safely", async () => {
  const checkedAt = "2026-06-11T15:48:00.000Z";
  const dryRunOrderInput = createAvanzaDryRunOrderInput({
    action: "sell",
    instrument: {
      ticker: "QA.PREV",
      name: "QA Preview Instrument",
      market: "Stockholm",
      currency: "SEK",
      instrumentType: "stock",
    },
    quantity: 5,
    price: 211.5,
    createdAt: checkedAt,
  });
  const reviewClickReady = {
    ok: true,
    status: "confirmation_ready" as const,
    checkedAt,
    expectedAction: "sell" as const,
    expectedInstrument: dryRunOrderInput.instrument,
    expectedQuantity: 5,
    expectedPrice: 211.5,
    fieldChecks: [],
    riskFlags: [],
    blockers: [],
    warnings: [],
    errors: [],
    labels: ["Confirmation ready for manual final confirmation"],
    metadata: {
      contractVersion: AVANZA_REVIEW_CLICK_CONTRACT_VERSION,
      waitingForManualConfirmation: true,
      noFinalConfirmClick: true,
      noBrokerResult: true,
      noTradeMutation: true,
    },
  };
  const userConfirmedUnverified = evaluateAvanzaManualConfirmationWait(
    {
      reviewClickResult: reviewClickReady,
      observation: { userConfirmed: true },
    },
    { checkedAt },
  );
  const matchingReadback: AvanzaBrokerConfirmationReadback = {
    action: "sell",
    ticker: "QA.PREV",
    name: "QA Preview Instrument",
    market: "Stockholm",
    currency: "SEK",
    instrumentType: "stock",
    quantityValue: 5,
    priceValue: 211.5,
    fees: "2.00",
    totalAmount: "1055.50",
    timestamp: checkedAt,
    orderIdSanitized: "AVZ-PREVIEW-001",
    accountLabelSanitized: "Sanitized account",
    orderStatus: "filled",
    statusTextSanitized: "Filled",
    confirmationPageVisible: true,
  };
  const captureFromReadback = (
    brokerConfirmationReadback: AvanzaBrokerConfirmationReadback,
  ) =>
    evaluateAvanzaBrokerConfirmationCapture(
      {
        dryRunOrderInput,
        manualConfirmationWaitResult: userConfirmedUnverified,
        brokerConfirmationReadback,
      },
      { checkedAt },
    );
  const captured = captureFromReadback(matchingReadback);
  const duplicateFingerprint =
    buildAvanzaBrokerConfirmationEvidenceFingerprint(captured);
  const buildPreviewResponse = (
    brokerExecutionResultPreview: ReturnType<
      typeof buildAvanzaBrokerExecutionResultPreview
    >,
    statusCode: number,
  ) => ({
    version: "avanza_localhost_bridge_v1" as const,
    ok: brokerExecutionResultPreview.ok,
    bridgeVersion: "avanza_localhost_bridge_v1" as const,
    requestId: "broker_execution_result_preview_request_test",
    receivedAt: checkedAt,
    completedAt: checkedAt,
    brokerExecutionResultPreview,
    message:
      brokerExecutionResultPreview.status === "preview_available"
        ? "BrokerExecutionResult preview bridge stub returned preview-only data. No real BrokerExecutionResult was created."
        : "BrokerExecutionResult preview bridge stub completed safely. No real BrokerExecutionResult was created.",
    errors: brokerExecutionResultPreview.errors,
    warnings: [
      "BrokerExecutionResult preview only.",
      "No real BrokerExecutionResult was created.",
      "No execution record was created.",
      "No Supabase write occurred.",
      "No trade mutation occurred.",
      ...brokerExecutionResultPreview.warnings,
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
    statusCode,
  });
  const previewAvailable = buildPreviewResponse(
    buildAvanzaBrokerExecutionResultPreview({
      captureResult: captured,
      metadata: {
        sourceRequestId: "broker_execution_result_preview_request_test",
        sourceCaptureId: "capture_preview_test_001",
      },
    }),
    200,
  );
  const missingOptional = buildPreviewResponse(
    buildAvanzaBrokerExecutionResultPreview({
      captureResult: {
        ...captured,
        brokerConfirmationReadback: {
          ...matchingReadback,
          fees: undefined,
          totalAmount: undefined,
          timestamp: undefined,
          orderIdSanitized: undefined,
        },
      },
      options: {
        allowMissingOrderId: true,
        allowMissingTimestamp: true,
      },
    }),
    200,
  );
  const partial = buildPreviewResponse(
    buildAvanzaBrokerExecutionResultPreview({
      captureResult: captureFromReadback({
        ...matchingReadback,
        orderStatus: "placed",
        orderIdSanitized: "AVZ-PREVIEW-PLACED",
      }),
    }),
    400,
  );
  const mismatch = buildPreviewResponse(
    buildAvanzaBrokerExecutionResultPreview({
      captureResult: captureFromReadback({
        ...matchingReadback,
        priceValue: 212.5,
        orderIdSanitized: "AVZ-PREVIEW-MISMATCH",
      }),
    }),
    400,
  );
  const duplicate = buildPreviewResponse(
    buildAvanzaBrokerExecutionResultPreview({
      captureResult: captured,
      existingFingerprints: [duplicateFingerprint],
    }),
    400,
  );
  const responses = [
    previewAvailable,
    missingOptional,
    partial,
    mismatch,
    duplicate,
  ];
  const request = buildLocalhostBridgeBrokerExecutionResultPreviewRequest({
    requestId: "broker_execution_result_preview_request_test",
    createdAt: checkedAt,
    captureResult: captured,
    existingFingerprints: [],
  });

  expect(
    validateLocalhostBridgeBrokerExecutionResultPreviewRequest(request),
  ).toEqual(expect.objectContaining({ ok: true, errors: [] }));
  expect(
    validateLocalhostBridgeBrokerExecutionResultPreviewResponse(
      previewAvailable,
    ),
  ).toEqual(expect.objectContaining({ ok: true, errors: [] }));
  expect(
    summarizeLocalhostBrokerExecutionResultPreviewBridgeResponse(
      previewAvailable,
    ),
  ).toContain("No execution record");

  let responseIndex = 0;
  const fetchFn: typeof fetch = async (input, init) => {
    expect(String(input)).toBe(
      "http://127.0.0.1:47832/broker-execution-result-preview",
    );
    expect(init?.method).toBe("POST");
    const body =
      typeof init?.body === "string"
        ? (JSON.parse(init.body) as Record<string, unknown>)
        : {};

    expect(body).toEqual(
      expect.objectContaining({
        requestId: "broker_execution_result_preview_request_test",
        metadata: expect.objectContaining({
          broker_execution_result_preview_stub_only: true,
          preview_only: true,
          no_real_broker_execution_result_created: true,
          no_execution_record_created: true,
          no_supabase_write: true,
        }),
      }),
    );

    const responseBody = responses[responseIndex++];

    return new Response(JSON.stringify(responseBody), {
      status: responseBody.statusCode,
      headers: { "Content-Type": "application/json" },
    });
  };
  const callClient = () =>
    checkLocalhostBridgeBrokerExecutionResultPreview({
      requestId: "broker_execution_result_preview_request_test",
      createdAt: checkedAt,
      captureResult: captured,
      baseUrl: "http://127.0.0.1:47832",
      fetchFn,
    });

  const available = await callClient();
  expect(available).toEqual(
    expect.objectContaining({
      ok: true,
      reachable: true,
      status: "preview_available",
      statusCode: 200,
    }),
  );
  expect(available.summary).toContain("No Supabase write");
  expect(available.response?.brokerExecutionResultPreview.preview).toEqual(
    expect.objectContaining({
      broker: "avanza",
      action: "sell",
      ticker: "QA.PREV",
      metadata: expect.objectContaining({
        previewOnly: true,
        notBrokerExecutionResult: true,
      }),
    }),
  );

  const optionalWarning = await callClient();
  expect(optionalWarning.status).toBe("preview_available");
  expect(optionalWarning.ok).toBe(true);
  expect(optionalWarning.warnings).toEqual(
    expect.arrayContaining(["Broker fees/courtage are missing."]),
  );

  const partialResponse = await callClient();
  expect(partialResponse.status).toBe("partial_only");
  expect(partialResponse.ok).toBe(false);
  expect(
    partialResponse.response?.brokerExecutionResultPreview.preview,
  ).toBeUndefined();

  const blockedResponse = await callClient();
  expect(blockedResponse.status).toBe("blocked");
  expect(blockedResponse.ok).toBe(false);
  expect(blockedResponse.errors.join(" ")).toContain("not eligible");

  const duplicateResponse = await callClient();
  expect(duplicateResponse.status).toBe("duplicate_risk");
  expect(duplicateResponse.ok).toBe(false);
  expect(duplicateResponse.errors.join(" ")).toContain("duplicate");

  const invalidJson =
    await checkLocalhostBridgeBrokerExecutionResultPreview({
      captureResult: captured,
      fetchFn: async () =>
        new Response("not json", {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
    });
  expect(invalidJson).toEqual(
    expect.objectContaining({
      ok: false,
      reachable: true,
      status: "failed",
    }),
  );
  expect(invalidJson.errors[0]).toContain("invalid JSON");

  const invalidShape =
    await checkLocalhostBridgeBrokerExecutionResultPreview({
      captureResult: captured,
      fetchFn: async () =>
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
    });
  expect(invalidShape.ok).toBe(false);
  expect(invalidShape.errors.join(" ")).toContain(
    "broker execution result preview response",
  );
});

test("normalizes localhost bridge broker execution result eligibility stub responses safely", async () => {
  const checkedAt = "2026-06-11T15:22:00.000Z";
  const dryRunOrderInput = createAvanzaDryRunOrderInput({
    action: "buy",
    instrument: {
      ticker: "QA.ELIG",
      name: "QA Eligibility Instrument",
      market: "Stockholm",
      currency: "SEK",
      instrumentType: "stock",
    },
    quantity: 8,
    price: 155.25,
    createdAt: checkedAt,
  });
  const reviewClickReady = {
    ok: true,
    status: "confirmation_ready" as const,
    checkedAt,
    expectedAction: "buy" as const,
    expectedInstrument: dryRunOrderInput.instrument,
    expectedQuantity: 8,
    expectedPrice: 155.25,
    fieldChecks: [],
    riskFlags: [],
    blockers: [],
    warnings: [],
    errors: [],
    labels: ["Confirmation ready for manual final confirmation"],
    metadata: {
      contractVersion: AVANZA_REVIEW_CLICK_CONTRACT_VERSION,
      waitingForManualConfirmation: true,
      noFinalConfirmClick: true,
      noBrokerResult: true,
      noTradeMutation: true,
    },
  };
  const userConfirmedUnverified = evaluateAvanzaManualConfirmationWait(
    {
      reviewClickResult: reviewClickReady,
      observation: { userConfirmed: true },
    },
    { checkedAt },
  );
  const matchingReadback: AvanzaBrokerConfirmationReadback = {
    action: "buy",
    ticker: "QA.ELIG",
    name: "QA Eligibility Instrument",
    market: "Stockholm",
    currency: "SEK",
    instrumentType: "stock",
    quantityValue: 8,
    priceValue: 155.25,
    fees: "1.00",
    totalAmount: "1243.00",
    timestamp: checkedAt,
    orderIdSanitized: "AVZ-ELIG-001",
    accountLabelSanitized: "Sanitized account",
    orderStatus: "filled",
    statusTextSanitized: "Filled",
    confirmationPageVisible: true,
  };
  const captureFromReadback = (
    brokerConfirmationReadback: AvanzaBrokerConfirmationReadback,
  ) =>
    evaluateAvanzaBrokerConfirmationCapture(
      {
        dryRunOrderInput,
        manualConfirmationWaitResult: userConfirmedUnverified,
        brokerConfirmationReadback,
      },
      { checkedAt },
    );
  const captured = captureFromReadback(matchingReadback);
  const buildEligibilityResponse = (
    eligibility: AvanzaBrokerExecutionResultEligibilityResult,
    statusCode: number,
  ) => ({
    version: "avanza_localhost_bridge_v1" as const,
    ok: eligibility.ok,
    bridgeVersion: "avanza_localhost_bridge_v1" as const,
    requestId: "broker_execution_result_eligibility_request_test",
    receivedAt: checkedAt,
    completedAt: checkedAt,
    eligibility,
    message:
      "BrokerExecutionResult eligibility bridge stub completed safely. No BrokerExecutionResult was created.",
    errors: eligibility.errors,
    warnings: [
      "BrokerExecutionResult conversion is not implemented.",
      "Eligibility check only.",
      "No BrokerExecutionResult was created.",
      "No execution record was created.",
      "No Supabase write occurred.",
      "No trade mutation occurred.",
      ...eligibility.warnings,
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
    statusCode,
  });
  const eligible = evaluateAvanzaBrokerExecutionResultEligibility({
    captureResult: captured,
  });
  const duplicateFingerprint =
    buildAvanzaBrokerConfirmationEvidenceFingerprint(captured);
  const responses = [
    buildEligibilityResponse(eligible, 200),
    buildEligibilityResponse(
      evaluateAvanzaBrokerExecutionResultEligibility({
        captureResult: captureFromReadback({
          ...matchingReadback,
          orderStatus: "placed",
          orderIdSanitized: "AVZ-ELIG-PLACED",
        }),
      }),
      400,
    ),
    buildEligibilityResponse(
      evaluateAvanzaBrokerExecutionResultEligibility({
        captureResult: captureFromReadback({
          ...matchingReadback,
          quantityValue: 9,
          orderIdSanitized: "AVZ-ELIG-MISMATCH",
        }),
      }),
      400,
    ),
    buildEligibilityResponse(
      evaluateAvanzaBrokerExecutionResultEligibility({
        captureResult: {
          ...captured,
          expectedPrice: 0,
          brokerConfirmationReadback: {
            ...matchingReadback,
            orderIdSanitized: "AVZ-ELIG-MISSING-PRICE",
          },
        },
      }),
      400,
    ),
    buildEligibilityResponse(
      evaluateAvanzaBrokerExecutionResultEligibility({
        captureResult: {
          ...captured,
          expectedQuantity: 0,
          brokerConfirmationReadback: {
            ...matchingReadback,
            orderIdSanitized: "AVZ-ELIG-MISSING-QUANTITY",
          },
        },
      }),
      400,
    ),
    buildEligibilityResponse(
      evaluateAvanzaBrokerExecutionResultEligibility({
        captureResult: {
          ...captured,
          riskFlags: ["sensitive_data_detected"],
        },
      }),
      400,
    ),
    buildEligibilityResponse(
      evaluateAvanzaBrokerExecutionResultEligibility({
        captureResult: {
          ...captured,
          riskFlags: ["broker_result_creation_attempted"],
        },
      }),
      400,
    ),
    buildEligibilityResponse(
      evaluateAvanzaBrokerExecutionResultEligibility({
        captureResult: {
          ...captured,
          riskFlags: ["trade_mutation_attempted"],
        },
      }),
      400,
    ),
    buildEligibilityResponse(
      evaluateAvanzaBrokerExecutionResultEligibility({
        captureResult: captured,
        existingFingerprints: [duplicateFingerprint],
      }),
      400,
    ),
  ];
  const request =
    buildLocalhostBridgeBrokerExecutionResultEligibilityRequest({
      requestId: "broker_execution_result_eligibility_request_test",
      createdAt: checkedAt,
      captureResult: captured,
      existingFingerprints: [],
    });

  expect(
    validateLocalhostBridgeBrokerExecutionResultEligibilityRequest(request),
  ).toEqual(expect.objectContaining({ ok: true, errors: [] }));
  expect(
    validateLocalhostBridgeBrokerExecutionResultEligibilityResponse(
      responses[0],
    ),
  ).toEqual(expect.objectContaining({ ok: true, errors: [] }));
  expect(
    summarizeLocalhostBrokerExecutionResultEligibilityBridgeResponse(
      responses[0],
    ),
  ).toContain("No execution record");

  let responseIndex = 0;
  const fetchFn: typeof fetch = async (input, init) => {
    expect(String(input)).toBe(
      "http://127.0.0.1:47831/broker-execution-result-eligibility",
    );
    expect(init?.method).toBe("POST");
    const body =
      typeof init?.body === "string"
        ? (JSON.parse(init.body) as Record<string, unknown>)
        : {};

    expect(body).toEqual(
      expect.objectContaining({
        requestId: "broker_execution_result_eligibility_request_test",
        metadata: expect.objectContaining({
          broker_execution_result_eligibility_stub_check: true,
          eligibility_check_only: true,
          no_broker_execution_result_created: true,
          no_execution_record_created: true,
          no_supabase_write: true,
        }),
      }),
    );

    const responseBody = responses[responseIndex++];

    return new Response(JSON.stringify(responseBody), {
      status: responseBody.statusCode,
      headers: { "Content-Type": "application/json" },
    });
  };
  const callClient = () =>
    checkLocalhostBridgeBrokerExecutionResultEligibility({
      requestId: "broker_execution_result_eligibility_request_test",
      createdAt: checkedAt,
      captureResult: captured,
      baseUrl: "http://127.0.0.1:47831",
      fetchFn,
    });

  const eligibleResponse = await callClient();
  expect(eligibleResponse).toEqual(
    expect.objectContaining({
      ok: true,
      reachable: true,
      status: "eligible",
      statusCode: 200,
    }),
  );
  expect(eligibleResponse.summary).toContain("No Supabase write");

  const partial = await callClient();
  expect(partial.status).toBe("partial_only");
  expect(partial.ok).toBe(false);

  const mismatch = await callClient();
  expect(mismatch.status).toBe("blocked");
  expect(mismatch.errors.join(" ")).toContain("not eligible");

  const missingPrice = await callClient();
  expect(missingPrice.status).toBe("blocked");
  expect(missingPrice.errors.join(" ")).toContain("price");

  const missingQuantity = await callClient();
  expect(missingQuantity.status).toBe("blocked");
  expect(missingQuantity.errors.join(" ")).toContain("quantity");

  const sensitive = await callClient();
  expect(sensitive.status).toBe("blocked");
  expect(sensitive.errors.join(" ")).toContain("Sensitive data");

  const brokerResultAttempt = await callClient();
  expect(brokerResultAttempt.status).toBe("blocked");
  expect(brokerResultAttempt.errors.join(" ")).toContain(
    "BrokerExecutionResult creation",
  );

  const tradeMutationAttempt = await callClient();
  expect(tradeMutationAttempt.status).toBe("blocked");
  expect(tradeMutationAttempt.errors.join(" ")).toContain("Trade mutation");

  const duplicate = await callClient();
  expect(duplicate.status).toBe("duplicate_risk");
  expect(duplicate.errors.join(" ")).toContain("duplicate");

  const invalidJson = await checkLocalhostBridgeBrokerExecutionResultEligibility({
    captureResult: captured,
    fetchFn: async () =>
      new Response("not json", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
  });
  expect(invalidJson).toEqual(
    expect.objectContaining({
      ok: false,
      reachable: true,
      status: "failed",
    }),
  );
  expect(invalidJson.errors[0]).toContain("invalid JSON");

  const invalidShape = await checkLocalhostBridgeBrokerExecutionResultEligibility({
    captureResult: captured,
    fetchFn: async () =>
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
  });
  expect(invalidShape.ok).toBe(false);
  expect(invalidShape.errors.join(" ")).toContain(
    "broker execution result eligibility response",
  );

  const missingCaptureRequest =
    buildLocalhostBridgeBrokerExecutionResultEligibilityRequest({
      requestId: "broker_execution_result_eligibility_missing_capture_test",
      createdAt: checkedAt,
    });
  expect(
    validateLocalhostBridgeBrokerExecutionResultEligibilityRequest(
      missingCaptureRequest,
    ),
  ).toEqual(expect.objectContaining({ ok: true, errors: [] }));
});

test("normalizes localhost bridge instrument page stub responses safely", async () => {
  const checkedAt = "2026-06-11T13:34:00.000Z";
  const expected: AvanzaSearchOnlyExpectedInstrument = {
    ticker: "QA.PAGE",
    name: "QA Page Instrument",
    market: "Stockholm",
    currency: "SEK",
    instrumentType: "stock",
  };
  const candidate: AvanzaSearchOnlyCandidate = {
    candidateId: "candidate_page_exact",
    displayName: "QA Page Instrument",
    ticker: "QA.PAGE",
    market: "Stockholm",
    currency: "SEK",
    instrumentType: "stock",
    matchConfidence: 0.98,
    sanitizedSource: "synthetic_stub",
    riskFlags: [],
    warnings: [],
  };
  const exactSearch = classifyAvanzaSearchOnlyCandidates(expected, [candidate], {
    checkedAt,
    requireMarketMatch: true,
    requireCurrencyMatch: true,
    requireInstrumentTypeMatch: true,
  });
  const verifiedInstrument = verifyAvanzaInstrument(
    {
      expectedInstrument: expected,
      searchOnlyResult: exactSearch,
    },
    { checkedAt },
  );
  const pageIdentity = {
    ticker: "QA.PAGE",
    name: "QA Page Instrument",
    market: "Stockholm",
    currency: "SEK",
    instrumentType: "stock",
    sanitizedTitle: "QA Page Instrument - synthetic instrument page",
    sanitizedHostClass: "avanza",
    pageContext: "instrument_page" as const,
    matchConfidence: 0.98,
  };
  const buildResponse = (
    instrumentPage: ReturnType<typeof evaluateAvanzaInstrumentPage>,
  ) => ({
    version: "avanza_localhost_bridge_v1" as const,
    ok: instrumentPage.ok,
    bridgeVersion: "avanza_localhost_bridge_v1" as const,
    requestId: "instrument_page_request_test",
    receivedAt: checkedAt,
    completedAt: checkedAt,
    instrumentPage,
    message:
      "Instrument page bridge stub completed safely. No browser was controlled.",
    errors: instrumentPage.errors,
    warnings: [
      "Instrument page runner is not implemented.",
      "No browser actions were executed.",
      "No Avanza page was touched.",
      "No order page was opened.",
      "No buy/sell click occurred.",
      "No form fill occurred.",
      ...instrumentPage.warnings,
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
  const identifiedResponse = buildResponse(
    evaluateAvanzaInstrumentPage(
      {
        expectedInstrument: expected,
        instrumentVerificationResult: verifiedInstrument,
        pageIdentity,
      },
      { checkedAt },
    ),
  );
  const buySellVisibleResponse = buildResponse(
    evaluateAvanzaInstrumentPage(
      {
        expectedInstrument: expected,
        instrumentVerificationResult: verifiedInstrument,
        pageIdentity: {
          ...pageIdentity,
          prohibitedControls: {
            buyButtonVisible: true,
            sellButtonVisible: true,
          },
        },
      },
      { checkedAt },
    ),
  );
  const mismatchResponse = buildResponse(
    evaluateAvanzaInstrumentPage(
      {
        expectedInstrument: expected,
        instrumentVerificationResult: verifiedInstrument,
        pageIdentity: { ...pageIdentity, ticker: "NO.MATCH" },
      },
      { checkedAt },
    ),
  );
  const blockedOrderPageResponse = buildResponse(
    evaluateAvanzaInstrumentPage(
      {
        expectedInstrument: expected,
        instrumentVerificationResult: verifiedInstrument,
        pageIdentity: { ...pageIdentity, pageContext: "order_page" },
      },
      { checkedAt },
    ),
  );
  const blockedFinalConfirmResponse = buildResponse(
    evaluateAvanzaInstrumentPage(
      {
        expectedInstrument: expected,
        instrumentVerificationResult: verifiedInstrument,
        pageIdentity: {
          ...pageIdentity,
          prohibitedControls: { finalConfirmVisible: true },
        },
      },
      { checkedAt },
    ),
  );
  const pageNotOpenResponse = buildResponse(
    evaluateAvanzaInstrumentPage(
      {
        expectedInstrument: expected,
        instrumentVerificationResult: verifiedInstrument,
      },
      { checkedAt },
    ),
  );
  const verificationNotReadyResponse = buildResponse(
    evaluateAvanzaInstrumentPage(
      {
        expectedInstrument: expected,
        instrumentVerificationResult: verifyAvanzaInstrument(
          {
            expectedInstrument: expected,
            searchOnlyResult: exactSearch,
            selectedCandidate: { ...candidate, ticker: "NO.MATCH" },
          },
          { checkedAt },
        ),
        pageIdentity,
      },
      { checkedAt },
    ),
  );
  const request = buildLocalhostBridgeInstrumentPageRequest(expected, {
    requestId: "instrument_page_request_test",
    createdAt: checkedAt,
    instrumentVerificationResult: verifiedInstrument,
    pageIdentity,
  });

  expect(validateLocalhostBridgeInstrumentPageRequest(request)).toEqual(
    expect.objectContaining({ ok: true, errors: [] }),
  );
  expect(validateLocalhostBridgeInstrumentPageResponse(identifiedResponse)).toEqual(
    expect.objectContaining({ ok: true, errors: [] }),
  );
  expect(summarizeLocalhostInstrumentPageBridgeResponse(identifiedResponse)).toContain(
    "Instrument page identified",
  );

  const responses = [
    identifiedResponse,
    buySellVisibleResponse,
    mismatchResponse,
    blockedOrderPageResponse,
    blockedFinalConfirmResponse,
    pageNotOpenResponse,
    verificationNotReadyResponse,
  ];
  let responseIndex = 0;
  const fetchFn = async () => {
    const responseBody = responses[responseIndex++];
    const status =
      responseBody.instrumentPage.status === "blocked"
        ? 400
        : responseBody.instrumentPage.status === "page_not_open" ||
            responseBody.instrumentPage.status === "verification_not_ready"
          ? 501
          : 200;

    return new Response(JSON.stringify(responseBody), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  };

  const identified = await checkLocalhostBridgeInstrumentPage({
    expectedInstrument: expected,
    instrumentVerificationResult: verifiedInstrument,
    pageIdentity,
    requestId: "instrument_page_request_test",
    fetchFn,
  });
  expect(identified).toEqual(
    expect.objectContaining({
      ok: true,
      reachable: true,
      status: "page_identified",
    }),
  );
  expect(identified.summary).toContain("Instrument page identified");
  expect(identified.summary).toContain("No browser actions were executed");

  const buySellVisible = await checkLocalhostBridgeInstrumentPage({
    expectedInstrument: expected,
    instrumentVerificationResult: verifiedInstrument,
    pageIdentity,
    requestId: "instrument_page_request_test",
    fetchFn,
  });
  expect(buySellVisible.status).toBe("page_identified");
  expect(buySellVisible.warnings).toEqual(
    expect.arrayContaining([
      "Buy button visible as a prohibited guarded control.",
      "Sell button visible as a prohibited guarded control.",
    ]),
  );

  const mismatch = await checkLocalhostBridgeInstrumentPage({
    expectedInstrument: expected,
    instrumentVerificationResult: verifiedInstrument,
    pageIdentity,
    requestId: "instrument_page_request_test",
    fetchFn,
  });
  expect(mismatch.status).toBe("page_mismatch");
  expect(mismatch.summary).toContain("Page mismatch");

  const blockedOrderPage = await checkLocalhostBridgeInstrumentPage({
    expectedInstrument: expected,
    instrumentVerificationResult: verifiedInstrument,
    pageIdentity,
    requestId: "instrument_page_request_test",
    fetchFn,
  });
  expect(blockedOrderPage.status).toBe("blocked");
  expect(blockedOrderPage.errors).toEqual(
    expect.arrayContaining([
      "Order page context detected during instrument-page identity check.",
    ]),
  );

  const blockedFinalConfirm = await checkLocalhostBridgeInstrumentPage({
    expectedInstrument: expected,
    instrumentVerificationResult: verifiedInstrument,
    pageIdentity,
    requestId: "instrument_page_request_test",
    fetchFn,
  });
  expect(blockedFinalConfirm.status).toBe("blocked");
  expect(blockedFinalConfirm.errors).toEqual(
    expect.arrayContaining([
      "Final-confirm-like control detected during instrument-page identity check.",
    ]),
  );

  const pageNotOpen = await checkLocalhostBridgeInstrumentPage({
    expectedInstrument: expected,
    instrumentVerificationResult: verifiedInstrument,
    requestId: "instrument_page_request_test",
    fetchFn,
  });
  expect(pageNotOpen.status).toBe("page_not_open");
  expect(pageNotOpen.summary).toContain("Instrument page is not open");

  const verificationNotReady = await checkLocalhostBridgeInstrumentPage({
    expectedInstrument: expected,
    instrumentVerificationResult: verifiedInstrument,
    pageIdentity,
    requestId: "instrument_page_request_test",
    fetchFn,
  });
  expect(verificationNotReady.status).toBe("verification_not_ready");
  expect(verificationNotReady.summary).toContain(
    "Instrument verification is not ready",
  );

  const invalidJson = await checkLocalhostBridgeInstrumentPage({
    expectedInstrument: expected,
    fetchFn: async () =>
      new Response("not json", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
  });
  expect(invalidJson).toEqual(
    expect.objectContaining({
      ok: false,
      reachable: true,
      status: "failed",
    }),
  );
  expect(invalidJson.errors[0]).toContain("invalid JSON");

  const missingTicker = await checkLocalhostBridgeInstrumentPage({
    expectedInstrument: { ticker: "" },
    fetchFn,
  });
  expect(missingTicker).toEqual(
    expect.objectContaining({
      ok: false,
      reachable: false,
      status: "failed",
    }),
  );
  expect(missingTicker.errors[0]).toContain(
    "requires expectedInstrument.ticker",
  );
});

test("normalizes localhost bridge order page open stub responses safely", async () => {
  const checkedAt = "2026-06-11T13:36:00.000Z";
  const dryRunOrderInput = createAvanzaDryRunOrderInput({
    action: "buy",
    instrument: {
      ticker: "QA.ORDER",
      name: "QA Order Instrument",
      market: "Stockholm",
      currency: "SEK",
      instrumentType: "stock",
    },
    quantity: 5,
    price: 122.4,
    metadata: {
      allowFinalSubmit: false,
      supportsBrokerSubmission: false,
      supportsFinalConfirmClick: false,
      automaticModeCapable: false,
    },
    createdAt: checkedAt,
  });
  const expected: AvanzaSearchOnlyExpectedInstrument = {
    ticker: "QA.ORDER",
    name: "QA Order Instrument",
    market: "Stockholm",
    currency: "SEK",
    instrumentType: "stock",
  };
  const candidate: AvanzaSearchOnlyCandidate = {
    candidateId: "candidate_order_exact",
    displayName: "QA Order Instrument",
    ticker: "QA.ORDER",
    market: "Stockholm",
    currency: "SEK",
    instrumentType: "stock",
    matchConfidence: 0.99,
    sanitizedSource: "synthetic_stub",
    riskFlags: [],
    warnings: [],
  };
  const exactSearch = classifyAvanzaSearchOnlyCandidates(expected, [candidate], {
    checkedAt,
    requireMarketMatch: true,
    requireCurrencyMatch: true,
    requireInstrumentTypeMatch: true,
  });
  const verifiedInstrument = verifyAvanzaInstrument(
    {
      expectedInstrument: expected,
      searchOnlyResult: exactSearch,
    },
    { checkedAt },
  );
  const instrumentPageResult = evaluateAvanzaInstrumentPage(
    {
      expectedInstrument: expected,
      instrumentVerificationResult: verifiedInstrument,
      pageIdentity: {
        ticker: "QA.ORDER",
        name: "QA Order Instrument",
        market: "Stockholm",
        currency: "SEK",
        instrumentType: "stock",
        sanitizedTitle: "QA Order Instrument - synthetic instrument page",
        sanitizedHostClass: "avanza",
        pageContext: "instrument_page",
        matchConfidence: 0.99,
      },
    },
    { checkedAt },
  );
  const orderPageIdentity: AvanzaOrderPageIdentity = {
    action: "buy",
    ticker: "QA.ORDER",
    name: "QA Order Instrument",
    market: "Stockholm",
    currency: "SEK",
    instrumentType: "stock",
    pageContext: "order_page",
    sanitizedTitle: "QA Order Instrument - synthetic buy order",
    sanitizedHostClass: "avanza",
    controls: { reviewButtonVisible: true },
    formSignals: {
      quantityFieldVisible: true,
      priceFieldVisible: true,
      accountFieldVisible: true,
      anyFieldPrefilled: false,
    },
  };
  const buildResponse = (
    orderPageOpen: ReturnType<typeof evaluateAvanzaOrderPageOpen>,
  ) => ({
    version: "avanza_localhost_bridge_v1" as const,
    ok: orderPageOpen.ok,
    bridgeVersion: "avanza_localhost_bridge_v1" as const,
    requestId: "order_page_open_request_test",
    receivedAt: checkedAt,
    completedAt: checkedAt,
    orderPageOpen,
    message:
      "Order-page-open bridge stub completed safely. No browser was controlled.",
    errors: orderPageOpen.errors,
    warnings: [
      "Order-page-open runner is not implemented.",
      "No browser actions were executed.",
      "No Avanza page was touched.",
      "No form fields were filled.",
      "No Granska click occurred.",
      "No Bekräfta click occurred.",
      ...orderPageOpen.warnings,
    ],
    metadata: {
      localhost_bridge_stub: true,
      order_page_open_endpoint_stub: true,
      no_browser_actions_executed: true,
      no_avanza_page_touched: true,
      no_form_fill: true,
      no_review_click: true,
      no_final_confirm_click: true,
      no_broker_submission: true,
      no_broker_result_created: true,
      no_trade_mutation: true,
    },
  });
  const openedResponse = buildResponse(
    evaluateAvanzaOrderPageOpen(
      {
        dryRunOrderInput,
        instrumentPageResult,
        orderPageIdentity,
        attemptedAction: "buy",
      },
      { checkedAt },
    ),
  );
  const wrongActionResponse = buildResponse(
    evaluateAvanzaOrderPageOpen(
      {
        dryRunOrderInput,
        instrumentPageResult,
        orderPageIdentity: { ...orderPageIdentity, action: "sell" },
        attemptedAction: "buy",
      },
      { checkedAt },
    ),
  );
  const mismatchResponse = buildResponse(
    evaluateAvanzaOrderPageOpen(
      {
        dryRunOrderInput,
        instrumentPageResult,
        orderPageIdentity: { ...orderPageIdentity, ticker: "NO.MATCH" },
        attemptedAction: "buy",
      },
      { checkedAt },
    ),
  );
  const prefilledResponse = buildResponse(
    evaluateAvanzaOrderPageOpen(
      {
        dryRunOrderInput,
        instrumentPageResult,
        orderPageIdentity: {
          ...orderPageIdentity,
          formSignals: { ...orderPageIdentity.formSignals, anyFieldPrefilled: true },
        },
        attemptedAction: "buy",
      },
      { checkedAt },
    ),
  );
  const finalConfirmResponse = buildResponse(
    evaluateAvanzaOrderPageOpen(
      {
        dryRunOrderInput,
        instrumentPageResult,
        orderPageIdentity: {
          ...orderPageIdentity,
          controls: { reviewButtonVisible: true, finalConfirmVisible: true },
        },
        attemptedAction: "buy",
      },
      { checkedAt },
    ),
  );
  const reviewClickResponse = buildResponse(
    evaluateAvanzaOrderPageOpen(
      {
        dryRunOrderInput,
        instrumentPageResult,
        orderPageIdentity,
        attemptedAction: "buy",
        metadata: { reviewButtonClickedOrAttempted: true },
      },
      { checkedAt },
    ),
  );
  const keyboardSubmitResponse = buildResponse(
    evaluateAvanzaOrderPageOpen(
      {
        dryRunOrderInput,
        instrumentPageResult,
        orderPageIdentity,
        attemptedAction: "buy",
        metadata: { keyboardSubmitDetected: true },
      },
      { checkedAt },
    ),
  );
  const blockedSensitiveResponse = buildResponse(
    evaluateAvanzaOrderPageOpen(
      {
        dryRunOrderInput,
        instrumentPageResult,
        orderPageIdentity: {
          ...orderPageIdentity,
          sensitiveSignals: { sensitiveDataDetected: true },
        },
        attemptedAction: "buy",
      },
      { checkedAt },
    ),
  );
  const instrumentNotReadyResponse = buildResponse(
    evaluateAvanzaOrderPageOpen(
      {
        dryRunOrderInput,
        instrumentPageResult: {
          ...instrumentPageResult,
          ok: false,
          status: "page_not_open",
          blockers: ["Instrument page is not ready."],
          errors: ["Instrument page is not ready."],
        },
        orderPageIdentity,
        attemptedAction: "buy",
      },
      { checkedAt },
    ),
  );
  const missingIdentityResponse = buildResponse(
    evaluateAvanzaOrderPageOpen(
      {
        dryRunOrderInput,
        instrumentPageResult,
        attemptedAction: "buy",
      },
      { checkedAt },
    ),
  );
  const request = buildLocalhostBridgeOrderPageOpenRequest(dryRunOrderInput, {
    requestId: "order_page_open_request_test",
    createdAt: checkedAt,
    instrumentPageResult,
    orderPageIdentity,
    attemptedAction: "buy",
  });

  expect(validateLocalhostBridgeOrderPageOpenRequest(request)).toEqual(
    expect.objectContaining({ ok: true, errors: [] }),
  );
  expect(validateLocalhostBridgeOrderPageOpenResponse(openedResponse)).toEqual(
    expect.objectContaining({ ok: true, errors: [] }),
  );
  expect(summarizeLocalhostOrderPageOpenBridgeResponse(openedResponse)).toContain(
    "Order page opened",
  );

  const responses = [
    openedResponse,
    wrongActionResponse,
    mismatchResponse,
    prefilledResponse,
    finalConfirmResponse,
    reviewClickResponse,
    keyboardSubmitResponse,
    blockedSensitiveResponse,
    instrumentNotReadyResponse,
    missingIdentityResponse,
  ];
  let responseIndex = 0;
  const fetchFn = async () => {
    const responseBody = responses[responseIndex++];
    const status =
      responseBody.orderPageOpen.status === "blocked" ||
      responseBody.orderPageOpen.status ===
        "prohibited_form_interaction_detected"
        ? 400
        : responseBody.orderPageOpen.status === "unavailable" ||
            responseBody.orderPageOpen.status === "instrument_page_not_ready"
          ? 501
          : 200;

    return new Response(JSON.stringify(responseBody), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  };

  const opened = await checkLocalhostBridgeOrderPageOpen({
    dryRunOrderInput,
    instrumentPageResult,
    orderPageIdentity,
    attemptedAction: "buy",
    requestId: "order_page_open_request_test",
    fetchFn,
  });
  expect(opened).toEqual(
    expect.objectContaining({
      ok: true,
      reachable: true,
      status: "order_page_opened",
    }),
  );
  expect(opened.summary).toContain("Order page opened");
  expect(opened.summary).toContain("No browser actions were executed");

  const wrongAction = await checkLocalhostBridgeOrderPageOpen({
    dryRunOrderInput,
    instrumentPageResult,
    orderPageIdentity,
    attemptedAction: "buy",
    requestId: "order_page_open_request_test",
    fetchFn,
  });
  expect(wrongAction.status).toBe("wrong_action_opened");
  expect(wrongAction.errors).toEqual(
    expect.arrayContaining(["Order page action does not match expected action."]),
  );

  const mismatch = await checkLocalhostBridgeOrderPageOpen({
    dryRunOrderInput,
    instrumentPageResult,
    orderPageIdentity,
    attemptedAction: "buy",
    requestId: "order_page_open_request_test",
    fetchFn,
  });
  expect(mismatch.status).toBe("order_page_mismatch");
  expect(mismatch.summary).toContain("Order page mismatch");

  const prefilled = await checkLocalhostBridgeOrderPageOpen({
    dryRunOrderInput,
    instrumentPageResult,
    orderPageIdentity,
    attemptedAction: "buy",
    requestId: "order_page_open_request_test",
    fetchFn,
  });
  expect(prefilled.status).toBe("prohibited_form_interaction_detected");
  expect(prefilled.errors).toEqual(
    expect.arrayContaining([
      "Order form was prefilled before approved form-fill phase.",
    ]),
  );

  const finalConfirm = await checkLocalhostBridgeOrderPageOpen({
    dryRunOrderInput,
    instrumentPageResult,
    orderPageIdentity,
    attemptedAction: "buy",
    requestId: "order_page_open_request_test",
    fetchFn,
  });
  expect(finalConfirm.status).toBe("blocked");
  expect(finalConfirm.errors).toEqual(
    expect.arrayContaining([
      "Final-confirm-like control detected on order page.",
    ]),
  );

  const reviewClick = await checkLocalhostBridgeOrderPageOpen({
    dryRunOrderInput,
    instrumentPageResult,
    orderPageIdentity,
    attemptedAction: "buy",
    requestId: "order_page_open_request_test",
    fetchFn,
  });
  expect(reviewClick.status).toBe("blocked");
  expect(reviewClick.errors).toEqual(
    expect.arrayContaining(["Review/Granska click was attempted."]),
  );

  const keyboardSubmit = await checkLocalhostBridgeOrderPageOpen({
    dryRunOrderInput,
    instrumentPageResult,
    orderPageIdentity,
    attemptedAction: "buy",
    requestId: "order_page_open_request_test",
    fetchFn,
  });
  expect(keyboardSubmit.status).toBe("blocked");
  expect(keyboardSubmit.errors).toEqual(
    expect.arrayContaining(["Keyboard submit was detected."]),
  );

  const blockedSensitive = await checkLocalhostBridgeOrderPageOpen({
    dryRunOrderInput,
    instrumentPageResult,
    orderPageIdentity,
    attemptedAction: "buy",
    requestId: "order_page_open_request_test",
    fetchFn,
  });
  expect(blockedSensitive.status).toBe("blocked");
  expect(blockedSensitive.errors).toEqual(
    expect.arrayContaining([
      "Sensitive data detected during order-page-open check.",
    ]),
  );

  const instrumentNotReady = await checkLocalhostBridgeOrderPageOpen({
    dryRunOrderInput,
    instrumentPageResult,
    orderPageIdentity,
    attemptedAction: "buy",
    requestId: "order_page_open_request_test",
    fetchFn,
  });
  expect(instrumentNotReady.status).toBe("instrument_page_not_ready");
  expect(instrumentNotReady.summary).toContain("Instrument page is not ready");

  const missingIdentity = await checkLocalhostBridgeOrderPageOpen({
    dryRunOrderInput,
    instrumentPageResult,
    attemptedAction: "buy",
    requestId: "order_page_open_request_test",
    fetchFn,
  });
  expect(missingIdentity.status).toBe("unavailable");
  expect(missingIdentity.errors).toEqual(
    expect.arrayContaining(["Sanitized order page identity is required."]),
  );

  const invalidJson = await checkLocalhostBridgeOrderPageOpen({
    dryRunOrderInput,
    fetchFn: async () =>
      new Response("not json", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
  });
  expect(invalidJson).toEqual(
    expect.objectContaining({
      ok: false,
      reachable: true,
      status: "failed",
    }),
  );
  expect(invalidJson.errors[0]).toContain("invalid JSON");

  const missingDryRunInput = await checkLocalhostBridgeOrderPageOpen({
    dryRunOrderInput: { ...dryRunOrderInput, instrument: { ticker: "" } },
    fetchFn,
  });
  expect(missingDryRunInput).toEqual(
    expect.objectContaining({
      ok: false,
      reachable: false,
      status: "failed",
    }),
  );
  expect(missingDryRunInput.errors[0]).toContain("Instrument ticker is required.");
});

test("normalizes localhost bridge advanced form-fill stub responses safely", async () => {
  const checkedAt = "2026-06-11T13:46:00.000Z";
  const dryRunOrderInput = createAvanzaDryRunOrderInput({
    action: "buy",
    instrument: {
      ticker: "QA.FILL",
      name: "QA Fill Instrument",
      market: "Stockholm",
      currency: "SEK",
      instrumentType: "stock",
    },
    quantity: 8,
    price: 144.2,
    metadata: {
      allowFinalSubmit: false,
      supportsBrokerSubmission: false,
      supportsFinalConfirmClick: false,
      automaticModeCapable: false,
    },
    createdAt: checkedAt,
  });
  const instrumentPageResult = evaluateAvanzaInstrumentPage(
    {
      expectedInstrument: dryRunOrderInput.instrument,
      instrumentVerificationResult: {
        ok: true,
        status: "verified",
        checkedAt,
        expectedInstrument: dryRunOrderInput.instrument,
        selectedCandidate: {
          candidateId: "candidate_fill_exact",
          displayName: "QA Fill Instrument",
          ticker: "QA.FILL",
          market: "Stockholm",
          currency: "SEK",
          instrumentType: "stock",
          matchConfidence: 0.99,
          sanitizedSource: "synthetic_stub",
          riskFlags: [],
          warnings: [],
        },
        fieldChecks: [],
        riskFlags: [],
        blockers: [],
        warnings: [],
        errors: [],
        labels: [],
        metadata: {
          instrumentVerificationOnly: true,
          noOrderPage: true,
          noBuySellClick: true,
          noFormFill: true,
          noBrokerSubmission: true,
          noTradeMutation: true,
          noBrokerResult: true,
        },
      },
      pageIdentity: {
        ticker: "QA.FILL",
        name: "QA Fill Instrument",
        market: "Stockholm",
        currency: "SEK",
        instrumentType: "stock",
        sanitizedTitle: "QA Fill Instrument - synthetic instrument page",
        sanitizedHostClass: "avanza",
        pageContext: "instrument_page",
      },
    },
    { checkedAt },
  );
  const orderPageOpen = evaluateAvanzaOrderPageOpen(
    {
      dryRunOrderInput,
      instrumentPageResult,
      attemptedAction: "buy",
      orderPageIdentity: {
        action: "buy",
        ticker: "QA.FILL",
        name: "QA Fill Instrument",
        market: "Stockholm",
        currency: "SEK",
        instrumentType: "stock",
        pageContext: "order_page",
        sanitizedTitle: "QA Fill Instrument - synthetic buy order",
        sanitizedHostClass: "avanza",
        controls: { reviewButtonVisible: true, finalConfirmVisible: false },
        formSignals: {
          quantityFieldVisible: true,
          priceFieldVisible: true,
          accountFieldVisible: true,
          anyFieldPrefilled: false,
        },
      },
    },
    { checkedAt },
  );
  const matchingForm: AvanzaAdvancedFormState = {
    action: "buy",
    ticker: "QA.FILL",
    name: "QA Fill Instrument",
    market: "Stockholm",
    currency: "SEK",
    instrumentType: "stock",
    orderMode: "advanced",
    quantity: 8,
    price: 144.2,
    controls: {
      reviewButtonVisible: true,
      reviewButtonClickedOrAttempted: false,
      finalConfirmVisible: false,
      finalConfirmClickedOrAttempted: false,
    },
    interactions: {
      keyboardSubmitDetected: false,
      accountChanged: false,
      unsupportedFieldTouched: false,
    },
    sensitiveSignals: {
      accountDataDetected: false,
      balanceDataDetected: false,
      holdingsDataDetected: false,
      sensitiveDataDetected: false,
    },
    validation: {
      validationErrorsVisible: false,
      validationMessages: [],
    },
  };
  const buildResponse = (
    formState: AvanzaAdvancedFormState | undefined,
    statusCode: number,
    options: {
      dryRun?: typeof dryRunOrderInput;
      orderPage?: typeof orderPageOpen;
      metadata?: Record<string, unknown>;
    } = {},
  ) => {
    const advancedFormFill = evaluateAvanzaAdvancedFormFill(
      {
        dryRunOrderInput: options.dryRun ?? dryRunOrderInput,
        orderPageOpenResult: options.orderPage ?? orderPageOpen,
        ...(formState ? { formState } : {}),
        ...(options.metadata ? { metadata: options.metadata } : {}),
      },
      { checkedAt },
    );

    return {
      version: "avanza_localhost_bridge_v1" as const,
      ok: advancedFormFill.ok,
      bridgeVersion: "avanza_localhost_bridge_v1" as const,
      requestId: "advanced_form_fill_request_test",
      receivedAt: checkedAt,
      completedAt: checkedAt,
      advancedFormFill,
      message:
        "Advanced form-fill bridge stub completed safely. No browser was controlled.",
      errors: advancedFormFill.errors,
      warnings: [
        "Advanced form-fill runner is not implemented.",
        "No browser actions were executed.",
        "No Avanza page was touched.",
        "No real form fields were filled.",
        "No Granska click occurred.",
        "No Bekräfta click occurred.",
        ...advancedFormFill.warnings,
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
      statusCode,
    };
  };
  const responses = [
    buildResponse(matchingForm, 200),
    buildResponse({ ...matchingForm, action: "sell" }, 200, {
      dryRun: { ...dryRunOrderInput, action: "sell" },
    }),
    buildResponse({ ...matchingForm, quantity: 9 }, 400),
    buildResponse({ ...matchingForm, price: 145.2 }, 400),
    buildResponse(
      {
        ...matchingForm,
        validation: {
          validationErrorsVisible: true,
          validationMessages: ["Synthetic validation error."],
        },
      },
      400,
    ),
    buildResponse({ ...matchingForm, orderMode: "stop_loss" }, 400),
    buildResponse(
      {
        ...matchingForm,
        controls: {
          ...matchingForm.controls,
          reviewButtonClickedOrAttempted: true,
        },
      },
      400,
    ),
    buildResponse(
      {
        ...matchingForm,
        controls: {
          ...matchingForm.controls,
          finalConfirmVisible: true,
          finalConfirmClickedOrAttempted: true,
        },
      },
      400,
    ),
    buildResponse(
      {
        ...matchingForm,
        interactions: {
          ...matchingForm.interactions,
          keyboardSubmitDetected: true,
        },
      },
      400,
    ),
    buildResponse(matchingForm, 501, {
      orderPage: {
        ...orderPageOpen,
        ok: false,
        status: "order_page_mismatch",
        blockers: ["Order page is not ready."],
        errors: ["Order page is not ready."],
      },
    }),
    buildResponse(undefined, 501),
  ];
  const request = buildLocalhostBridgeAdvancedFormFillRequest(
    dryRunOrderInput,
    {
      requestId: "advanced_form_fill_request_test",
      createdAt: checkedAt,
      orderPageOpenResult: orderPageOpen,
      formState: matchingForm,
    },
  );

  expect(validateLocalhostBridgeAdvancedFormFillRequest(request)).toEqual(
    expect.objectContaining({ ok: true, errors: [] }),
  );
  expect(validateLocalhostBridgeAdvancedFormFillResponse(responses[0])).toEqual(
    expect.objectContaining({ ok: true, errors: [] }),
  );
  expect(summarizeLocalhostAdvancedFormFillBridgeResponse(responses[0])).toContain(
    "Advanced form filled",
  );

  let responseIndex = 0;
  const fetchFn: typeof fetch = async (input, init) => {
    expect(String(input)).toBe("http://127.0.0.1:47831/advanced-form-fill");
    expect(init?.method).toBe("POST");
    const body =
      typeof init?.body === "string"
        ? (JSON.parse(init.body) as Record<string, unknown>)
        : {};

    expect(body).toEqual(
      expect.objectContaining({
        requestId: "advanced_form_fill_request_test",
        metadata: expect.objectContaining({
          advanced_form_fill_stub_check: true,
          no_real_form_fields_filled: true,
          no_review_click: true,
          no_final_confirm_click: true,
          no_broker_result_created: true,
          no_supabase_write: true,
        }),
      }),
    );

    const responseBody = responses[responseIndex++];

    return new Response(JSON.stringify(responseBody), {
      status: responseBody.statusCode,
      headers: { "Content-Type": "application/json" },
    });
  };
  const callClient = () =>
    checkLocalhostBridgeAdvancedFormFill({
      dryRunOrderInput,
      orderPageOpenResult: orderPageOpen,
      formState: matchingForm,
      requestId: "advanced_form_fill_request_test",
      baseUrl: "http://127.0.0.1:47831",
      fetchFn,
    });

  const filledBuy = await callClient();
  expect(filledBuy).toEqual(
    expect.objectContaining({
      ok: true,
      reachable: true,
      status: "form_filled",
      statusCode: 200,
    }),
  );
  expect(filledBuy.summary).toContain("No real form fields were filled");

  const filledSell = await callClient();
  expect(filledSell.status).toBe("form_filled");

  const quantityMismatch = await callClient();
  expect(quantityMismatch.status).toBe("field_mismatch");
  expect(quantityMismatch.errors).toEqual(
    expect.arrayContaining([
      "Advanced form quantity does not match the dry-run request.",
    ]),
  );

  const priceMismatch = await callClient();
  expect(priceMismatch.status).toBe("field_mismatch");
  expect(priceMismatch.errors).toEqual(
    expect.arrayContaining([
      "Advanced form price/course does not match the dry-run request.",
    ]),
  );

  const validationError = await callClient();
  expect(validationError.status).toBe("validation_error");
  expect(validationError.errors).toEqual(
    expect.arrayContaining(["Synthetic validation error."]),
  );

  const unsupportedMode = await callClient();
  expect(unsupportedMode.status).toBe("unsupported_order_mode");

  const prohibitedReview = await callClient();
  expect(prohibitedReview.status).toBe("prohibited_review_detected");

  const prohibitedFinal = await callClient();
  expect(prohibitedFinal.status).toBe("prohibited_final_confirm_detected");

  const keyboardSubmit = await callClient();
  expect(keyboardSubmit.status).toBe("blocked");
  expect(keyboardSubmit.errors).toEqual(
    expect.arrayContaining([
      "Keyboard submit was detected during form fill.",
    ]),
  );

  const orderPageNotReady = await callClient();
  expect(orderPageNotReady.status).toBe("order_page_not_ready");

  const missingFormState = await callClient();
  expect(missingFormState.status).toBe("unavailable");
  expect(missingFormState.errors).toEqual(
    expect.arrayContaining(["Sanitized Advanced form state is required."]),
  );

  const invalidJson = await checkLocalhostBridgeAdvancedFormFill({
    dryRunOrderInput,
    fetchFn: async () =>
      new Response("not json", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
  });
  expect(invalidJson).toEqual(
    expect.objectContaining({
      ok: false,
      reachable: true,
      status: "failed",
    }),
  );
  expect(invalidJson.errors[0]).toContain("invalid JSON");

  const missingDryRunInputValidation =
    validateLocalhostBridgeAdvancedFormFillRequest({
      version: "avanza_localhost_bridge_v1",
      requestId: "advanced_form_fill_missing_input",
      createdAt: checkedAt,
    });
  expect(missingDryRunInputValidation.ok).toBe(false);
  expect(missingDryRunInputValidation.errors.join(" ")).toContain(
    "Avanza dry-run request",
  );

  const invalidDryRunInput = await checkLocalhostBridgeAdvancedFormFill({
    dryRunOrderInput: { ...dryRunOrderInput, instrument: { ticker: "" } },
    fetchFn,
  });
  expect(invalidDryRunInput).toEqual(
    expect.objectContaining({
      ok: false,
      reachable: false,
      status: "failed",
    }),
  );
  expect(invalidDryRunInput.errors[0]).toContain(
    "Instrument ticker is required.",
  );
});

test("normalizes localhost bridge review-click stub responses safely", async () => {
  const checkedAt = "2026-06-11T14:25:00.000Z";
  const dryRunOrderInput = createAvanzaDryRunOrderInput({
    action: "buy",
    instrument: {
      ticker: "QA.REVIEW",
      name: "QA Review Instrument",
      market: "Stockholm",
      currency: "SEK",
      instrumentType: "stock",
    },
    quantity: 12,
    price: 88.4,
    metadata: {
      allowFinalSubmit: false,
      supportsBrokerSubmission: false,
      supportsFinalConfirmClick: false,
      automaticModeCapable: false,
    },
    createdAt: checkedAt,
  });
  const advancedFormFillResult: AvanzaAdvancedFormFillResult = {
    ok: true,
    status: "form_filled",
    checkedAt,
    expectedAction: "buy",
    expectedInstrument: dryRunOrderInput.instrument,
    expectedQuantity: 12,
    expectedPrice: 88.4,
    fieldChecks: [],
    riskFlags: [],
    blockers: [],
    warnings: [],
    errors: [],
    labels: ["Advanced form filled"],
    metadata: {
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
  const matchingReadback: AvanzaConfirmationModalReadback = {
    action: "buy",
    ticker: "QA.REVIEW",
    name: "QA Review Instrument",
    market: "Stockholm",
    currency: "SEK",
    instrumentType: "stock",
    quantityValue: 12,
    priceValue: 88.4,
    accountLabelSanitized: "Manual review account",
    fees: "1.00",
    totalAmount: "1061.80",
    validUntil: "2026-06-11",
    confirmationModalVisible: true,
    cancelButtonVisible: true,
    finalConfirmVisible: true,
    finalConfirmLabel: "Bekräfta köp",
    validationErrors: [],
    sensitiveSignals: {
      accountDataDetected: false,
      balanceDataDetected: false,
      holdingsDataDetected: false,
      sensitiveDataDetected: false,
    },
    interactionSignals: {
      finalConfirmClickedOrAttempted: false,
      keyboardSubmitDetected: false,
    },
  };
  const buildResponse = (
    confirmationReadback: AvanzaConfirmationModalReadback | undefined,
    statusCode: number,
    options: {
      dryRun?: typeof dryRunOrderInput;
      formFill?: AvanzaAdvancedFormFillResult;
      reviewLabel?: string;
      reviewClickAttempted?: boolean;
    } = {},
  ) => {
    const reviewClick = evaluateAvanzaReviewClick(
      {
        dryRunOrderInput: options.dryRun ?? dryRunOrderInput,
        advancedFormFillResult:
          options.formFill ?? advancedFormFillResult,
        ...(confirmationReadback ? { confirmationReadback } : {}),
        reviewClickAttempted: options.reviewClickAttempted ?? true,
        reviewLabel: options.reviewLabel ?? "Granska köp",
      },
      { checkedAt },
    );

    return {
      version: "avanza_localhost_bridge_v1" as const,
      ok: reviewClick.ok,
      bridgeVersion: "avanza_localhost_bridge_v1" as const,
      requestId: "review_click_request_test",
      receivedAt: checkedAt,
      completedAt: checkedAt,
      reviewClick,
      message:
        "Review-click bridge stub completed safely. No browser was controlled.",
      errors: reviewClick.errors,
      warnings: [
        "Review-click runner is not implemented.",
        "No browser actions were executed.",
        "No Avanza page was touched.",
        "No real Granska was clicked.",
        "No Bekräfta was clicked.",
        "No broker result was created.",
        ...reviewClick.warnings,
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
      statusCode,
    };
  };
  const responses = [
    buildResponse(matchingReadback, 200),
    buildResponse(
      { ...matchingReadback, action: "sell", finalConfirmLabel: "Bekräfta sälj" },
      200,
      {
        dryRun: { ...dryRunOrderInput, action: "sell" },
        reviewLabel: "Granska sälj",
      },
    ),
    buildResponse({ ...matchingReadback, quantityValue: 13 }, 400),
    buildResponse({ ...matchingReadback, priceValue: 89.4 }, 400),
    buildResponse(
      { ...matchingReadback, validationErrors: ["Synthetic validation error."] },
      400,
    ),
    buildResponse(matchingReadback, 200),
    buildResponse(
      {
        ...matchingReadback,
        interactionSignals: {
          finalConfirmClickedOrAttempted: true,
        },
      },
      400,
    ),
    buildResponse(
      {
        ...matchingReadback,
        interactionSignals: {
          keyboardSubmitDetected: true,
        },
      },
      400,
    ),
    buildResponse(
      {
        ...matchingReadback,
        sensitiveSignals: {
          accountDataDetected: true,
          balanceDataDetected: true,
          holdingsDataDetected: true,
          sensitiveDataDetected: true,
        },
      },
      400,
    ),
    buildResponse(
      { ...matchingReadback, confirmationModalVisible: false },
      400,
    ),
    buildResponse(matchingReadback, 501, {
      formFill: {
        ...advancedFormFillResult,
        ok: false,
        status: "field_mismatch",
        blockers: ["Advanced form is not filled."],
        errors: ["Advanced form is not filled."],
      },
    }),
    buildResponse(matchingReadback, 400, {
      reviewLabel: "Granska sälj",
    }),
  ];
  const request = buildLocalhostBridgeReviewClickRequest(dryRunOrderInput, {
    requestId: "review_click_request_test",
    createdAt: checkedAt,
    advancedFormFillResult,
    confirmationReadback: matchingReadback,
    reviewClickAttempted: true,
    reviewLabel: "Granska köp",
  });

  expect(validateLocalhostBridgeReviewClickRequest(request)).toEqual(
    expect.objectContaining({ ok: true, errors: [] }),
  );
  expect(validateLocalhostBridgeReviewClickResponse(responses[0])).toEqual(
    expect.objectContaining({ ok: true, errors: [] }),
  );
  expect(summarizeLocalhostReviewClickBridgeResponse(responses[0])).toContain(
    "No real Granska was clicked",
  );

  let responseIndex = 0;
  const fetchFn: typeof fetch = async (input, init) => {
    expect(String(input)).toBe("http://127.0.0.1:47831/review-click");
    expect(init?.method).toBe("POST");
    const body =
      typeof init?.body === "string"
        ? (JSON.parse(init.body) as Record<string, unknown>)
        : {};

    expect(body).toEqual(
      expect.objectContaining({
        requestId: "review_click_request_test",
        metadata: expect.objectContaining({
          review_click_stub_check: true,
          no_real_granska_clicked: true,
          no_bekrafta_clicked: true,
          no_broker_result_created: true,
          no_supabase_write: true,
        }),
      }),
    );

    const responseBody = responses[responseIndex++];

    return new Response(JSON.stringify(responseBody), {
      status: responseBody.statusCode,
      headers: { "Content-Type": "application/json" },
    });
  };
  const callClient = () =>
    checkLocalhostBridgeReviewClick({
      dryRunOrderInput,
      advancedFormFillResult,
      confirmationReadback: matchingReadback,
      reviewClickAttempted: true,
      reviewLabel: "Granska köp",
      requestId: "review_click_request_test",
      baseUrl: "http://127.0.0.1:47831",
      fetchFn,
    });

  const readyBuy = await callClient();
  expect(readyBuy).toEqual(
    expect.objectContaining({
      ok: true,
      reachable: true,
      status: "confirmation_ready",
      statusCode: 200,
    }),
  );
  expect(readyBuy.summary).toContain("No Bekräfta was clicked");

  const readySell = await callClient();
  expect(readySell.status).toBe("confirmation_ready");

  const quantityMismatch = await callClient();
  expect(quantityMismatch.status).toBe("confirmation_mismatch");
  expect(quantityMismatch.errors).toEqual(
    expect.arrayContaining([
      "Confirmation modal quantity does not match the dry-run request.",
    ]),
  );

  const priceMismatch = await callClient();
  expect(priceMismatch.status).toBe("confirmation_mismatch");
  expect(priceMismatch.errors).toEqual(
    expect.arrayContaining([
      "Confirmation modal price/course does not match the dry-run request.",
    ]),
  );

  const validationError = await callClient();
  expect(validationError.status).toBe("validation_error");
  expect(validationError.errors).toEqual(
    expect.arrayContaining(["Synthetic validation error."]),
  );

  const finalVisibleOnly = await callClient();
  expect(finalVisibleOnly.status).toBe("confirmation_ready");
  expect(finalVisibleOnly.warnings.join(" ")).toContain("read-only evidence");

  const finalConfirmAttempted = await callClient();
  expect(finalConfirmAttempted.status).toBe(
    "prohibited_final_confirm_detected",
  );

  const keyboardSubmit = await callClient();
  expect(keyboardSubmit.status).toBe("blocked");
  expect(keyboardSubmit.errors).toEqual(
    expect.arrayContaining([
      "Keyboard submit was detected during review-click phase.",
    ]),
  );

  const sensitive = await callClient();
  expect(sensitive.status).toBe("blocked");
  expect(sensitive.errors).toEqual(
    expect.arrayContaining([
      "Sensitive data detected in confirmation modal readback.",
    ]),
  );

  const modalMissing = await callClient();
  expect(modalMissing.status).toBe("failed");

  const formNotReady = await callClient();
  expect(formNotReady.status).toBe("form_not_ready");

  const reviewLabelMismatch = await callClient();
  expect(reviewLabelMismatch.status).toBe("blocked");
  expect(reviewLabelMismatch.errors).toEqual(
    expect.arrayContaining([
      "Review/Granska label does not match the dry-run request action.",
    ]),
  );

  const invalidJson = await checkLocalhostBridgeReviewClick({
    dryRunOrderInput,
    fetchFn: async () =>
      new Response("not json", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
  });
  expect(invalidJson).toEqual(
    expect.objectContaining({
      ok: false,
      reachable: true,
      status: "failed",
    }),
  );
  expect(invalidJson.errors[0]).toContain("invalid JSON");

  const missingDryRunInputValidation =
    validateLocalhostBridgeReviewClickRequest({
      version: "avanza_localhost_bridge_v1",
      requestId: "review_click_missing_input",
      createdAt: checkedAt,
    });
  expect(missingDryRunInputValidation.ok).toBe(false);
  expect(missingDryRunInputValidation.errors.join(" ")).toContain(
    "Avanza dry-run request",
  );

  const invalidDryRunInput = await checkLocalhostBridgeReviewClick({
    dryRunOrderInput: { ...dryRunOrderInput, instrument: { ticker: "" } },
    fetchFn,
  });
  expect(invalidDryRunInput).toEqual(
    expect.objectContaining({
      ok: false,
      reachable: false,
      status: "failed",
    }),
  );
  expect(invalidDryRunInput.errors[0]).toContain(
    "Instrument ticker is required.",
  );
});

test("normalizes localhost bridge manual confirmation wait stub responses safely", async () => {
  const checkedAt = "2026-06-11T14:42:00.000Z";
  const reviewClickReady: AvanzaReviewClickResult = {
    ok: true,
    status: "confirmation_ready",
    checkedAt,
    expectedAction: "buy",
    expectedInstrument: {
      ticker: "QA.WAIT",
      name: "QA Wait Instrument",
      market: "Stockholm",
      currency: "SEK",
      instrumentType: "stock",
    },
    expectedQuantity: 7,
    expectedPrice: 123.45,
    confirmationReadback: {
      action: "buy",
      ticker: "QA.WAIT",
      name: "QA Wait Instrument",
      market: "Stockholm",
      currency: "SEK",
      instrumentType: "stock",
      quantityValue: 7,
      priceValue: 123.45,
      accountLabelSanitized: "Manual review account",
      fees: "1.00",
      totalAmount: "865.15",
      validUntil: "2026-06-11",
      confirmationModalVisible: true,
      cancelButtonVisible: true,
      finalConfirmVisible: true,
      finalConfirmLabel: "Bekräfta köp",
      validationErrors: [],
      sensitiveSignals: {
        accountDataDetected: false,
        balanceDataDetected: false,
        holdingsDataDetected: false,
        sensitiveDataDetected: false,
      },
      interactionSignals: {
        finalConfirmClickedOrAttempted: false,
        keyboardSubmitDetected: false,
      },
    },
    fieldChecks: [],
    riskFlags: [],
    blockers: [],
    warnings: [],
    errors: [],
    labels: ["Confirmation ready for manual final confirmation"],
    metadata: {
      contractVersion: AVANZA_REVIEW_CLICK_CONTRACT_VERSION,
      reviewClickReadbackOnly: true,
      waitingForManualConfirmation: true,
      noFinalConfirmClick: true,
      noKeyboardSubmit: true,
      noBrokerSubmission: true,
      noBrokerResult: true,
      noSupabaseWrite: true,
      noTradeMutation: true,
    },
  };
  const buildResponse = (
    observation: AvanzaManualConfirmationWaitObservation | undefined,
    statusCode: number,
    options: {
      reviewClickResult?: AvanzaReviewClickResult;
      timeoutMs?: number;
    } = {},
  ) => {
    const manualConfirmationWait = evaluateAvanzaManualConfirmationWait(
      {
        reviewClickResult: options.reviewClickResult ?? reviewClickReady,
        ...(observation ? { observation } : {}),
        timeoutMs: options.timeoutMs,
      },
      { checkedAt },
    );

    return {
      version: "avanza_localhost_bridge_v1" as const,
      ok: manualConfirmationWait.ok,
      bridgeVersion: "avanza_localhost_bridge_v1" as const,
      requestId: "manual_confirmation_wait_request_test",
      receivedAt: checkedAt,
      completedAt: checkedAt,
      manualConfirmationWait,
      message:
        "Manual confirmation wait bridge stub completed safely. No browser was controlled.",
      errors: manualConfirmationWait.errors,
      warnings: [
        "Manual confirmation wait runner is not implemented.",
        "No browser actions were executed.",
        "No Avanza page was touched.",
        "No Bekräfta was clicked.",
        "No broker result was created.",
        "No trade mutation occurred.",
        ...manualConfirmationWait.warnings,
      ],
      metadata: {
        localhost_bridge_stub: true,
        manual_confirmation_wait_endpoint_stub: true,
        no_browser_actions_executed: true,
        no_avanza_page_touched: true,
        no_bekrafta_clicked: true,
        no_broker_result_created: true,
        no_supabase_write: true,
        no_trade_mutation: true,
      },
      statusCode,
    };
  };
  const notReadyReviewClick: AvanzaReviewClickResult = {
    ...reviewClickReady,
    ok: false,
    status: "confirmation_mismatch",
    blockers: ["Quantity mismatch."],
    errors: ["Quantity mismatch."],
    metadata: {
      ...reviewClickReady.metadata,
      waitingForManualConfirmation: false,
    },
  };
  const responses = [
    buildResponse(undefined, 200),
    buildResponse({ modalStillVisible: false, userCancelled: true }, 200),
    buildResponse({ modalStillVisible: false, userConfirmed: true }, 200),
    buildResponse(
      { modalStillVisible: true, finalConfirmVisible: true },
      200,
    ),
    buildResponse(
      {
        modalStillVisible: true,
        finalConfirmVisible: true,
        interactionSignals: { finalConfirmClickedByAgentOrAttempted: true },
      },
      400,
    ),
    buildResponse(
      {
        modalStillVisible: true,
        interactionSignals: { keyboardSubmitDetected: true },
      },
      400,
    ),
    buildResponse(
      {
        modalStillVisible: false,
        unexpectedSignals: { brokerResultDetected: true },
      },
      400,
    ),
    buildResponse(
      {
        modalStillVisible: false,
        unexpectedSignals: { tradeMutationDetected: true },
      },
      400,
    ),
    buildResponse(
      {
        modalStillVisible: true,
        sensitiveSignals: {
          accountDataDetected: true,
          balanceDataDetected: true,
          holdingsDataDetected: true,
          sensitiveDataDetected: true,
        },
      },
      400,
    ),
    buildResponse({ modalStillVisible: true, timedOut: true }, 200),
    buildResponse(undefined, 400, { reviewClickResult: notReadyReviewClick }),
  ];
  const request = buildLocalhostBridgeManualConfirmationWaitRequest({
    requestId: "manual_confirmation_wait_request_test",
    createdAt: checkedAt,
    reviewClickResult: reviewClickReady,
    timeoutMs: 300000,
  });

  expect(validateLocalhostBridgeManualConfirmationWaitRequest(request)).toEqual(
    expect.objectContaining({ ok: true, errors: [] }),
  );
  expect(validateLocalhostBridgeManualConfirmationWaitResponse(responses[0])).toEqual(
    expect.objectContaining({ ok: true, errors: [] }),
  );
  expect(
    summarizeLocalhostManualConfirmationWaitBridgeResponse(responses[0]),
  ).toContain("No Bekräfta was clicked");

  let responseIndex = 0;
  const fetchFn: typeof fetch = async (input, init) => {
    expect(String(input)).toBe(
      "http://127.0.0.1:47831/manual-confirmation-wait",
    );
    expect(init?.method).toBe("POST");
    const body =
      typeof init?.body === "string"
        ? (JSON.parse(init.body) as Record<string, unknown>)
        : {};

    expect(body).toEqual(
      expect.objectContaining({
        requestId: "manual_confirmation_wait_request_test",
        metadata: expect.objectContaining({
          manual_confirmation_wait_stub_check: true,
          no_bekrafta_clicked: true,
          no_broker_result_created: true,
          no_supabase_write: true,
        }),
      }),
    );

    const responseBody = responses[responseIndex++];

    return new Response(JSON.stringify(responseBody), {
      status: responseBody.statusCode,
      headers: { "Content-Type": "application/json" },
    });
  };
  const callClient = () =>
    checkLocalhostBridgeManualConfirmationWait({
      requestId: "manual_confirmation_wait_request_test",
      createdAt: checkedAt,
      reviewClickResult: reviewClickReady,
      timeoutMs: 300000,
      baseUrl: "http://127.0.0.1:47831",
      fetchFn,
    });

  const waiting = await callClient();
  expect(waiting).toEqual(
    expect.objectContaining({
      ok: true,
      reachable: true,
      status: "waiting_for_manual_confirmation",
      statusCode: 200,
    }),
  );
  expect(waiting.summary).toContain("No broker result");

  const userCancelled = await callClient();
  expect(userCancelled.status).toBe("user_cancelled");
  expect(userCancelled.ok).toBe(false);

  const userConfirmed = await callClient();
  expect(userConfirmed.status).toBe("user_confirmed_unverified");
  expect(userConfirmed.warnings.join(" ")).toContain(
    "Separate confirmation capture",
  );

  const finalConfirmVisible = await callClient();
  expect(finalConfirmVisible.status).toBe("waiting_for_manual_confirmation");
  expect(finalConfirmVisible.warnings.join(" ")).toContain(
    "read-only evidence",
  );

  const finalConfirmAttempt = await callClient();
  expect(finalConfirmAttempt.status).toBe("blocked");
  expect(finalConfirmAttempt.errors).toEqual(
    expect.arrayContaining([
      "Agent attempted final confirmation during manual confirmation wait.",
    ]),
  );

  const keyboardSubmit = await callClient();
  expect(keyboardSubmit.status).toBe("blocked");
  expect(keyboardSubmit.errors).toEqual(
    expect.arrayContaining([
      "Keyboard submit was detected during manual confirmation wait.",
    ]),
  );

  const unexpectedBrokerResult = await callClient();
  expect(unexpectedBrokerResult.status).toBe("blocked");
  expect(unexpectedBrokerResult.errors.join(" ")).toContain(
    "Broker result was detected unexpectedly",
  );

  const tradeMutation = await callClient();
  expect(tradeMutation.status).toBe("blocked");
  expect(tradeMutation.errors.join(" ")).toContain(
    "Trade mutation was detected unexpectedly",
  );

  const sensitive = await callClient();
  expect(sensitive.status).toBe("blocked");
  expect(sensitive.errors).toEqual(
    expect.arrayContaining([
      "Sensitive data detected during manual confirmation wait.",
    ]),
  );

  const timedOut = await callClient();
  expect(timedOut.status).toBe("timed_out");

  const confirmationNotReady = await callClient();
  expect(confirmationNotReady.status).toBe("confirmation_not_ready");

  const invalidJson = await checkLocalhostBridgeManualConfirmationWait({
    reviewClickResult: reviewClickReady,
    fetchFn: async () =>
      new Response("not json", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
  });
  expect(invalidJson).toEqual(
    expect.objectContaining({
      ok: false,
      reachable: true,
      status: "failed",
    }),
  );
  expect(invalidJson.errors[0]).toContain("invalid JSON");

  const invalidShape = await checkLocalhostBridgeManualConfirmationWait({
    reviewClickResult: reviewClickReady,
    fetchFn: async () =>
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
  });
  expect(invalidShape.ok).toBe(false);
  expect(invalidShape.errors.join(" ")).toContain(
    "manual confirmation wait response",
  );
});

test("normalizes localhost bridge broker confirmation capture stub responses safely", async () => {
  const checkedAt = "2026-06-11T15:12:00.000Z";
  const dryRunOrderInput = createAvanzaDryRunOrderInput({
    action: "buy",
    instrument: {
      ticker: "QA.CAPTURE",
      name: "QA Capture Instrument",
      market: "Stockholm",
      currency: "SEK",
      instrumentType: "stock",
    },
    quantity: 12,
    price: 145.5,
    createdAt: checkedAt,
  });
  const reviewClickReady: AvanzaReviewClickResult = {
    ok: true,
    status: "confirmation_ready",
    checkedAt,
    expectedAction: "buy",
    expectedInstrument: dryRunOrderInput.instrument,
    expectedQuantity: 12,
    expectedPrice: 145.5,
    fieldChecks: [],
    riskFlags: [],
    blockers: [],
    warnings: [],
    errors: [],
    labels: ["Confirmation ready for manual final confirmation"],
    metadata: {
      contractVersion: AVANZA_REVIEW_CLICK_CONTRACT_VERSION,
      reviewClickReadbackOnly: true,
      waitingForManualConfirmation: true,
      noFinalConfirmClick: true,
      noKeyboardSubmit: true,
      noBrokerSubmission: true,
      noBrokerResult: true,
      noSupabaseWrite: true,
      noTradeMutation: true,
    },
  };
  const manualConfirmationWaitResult = evaluateAvanzaManualConfirmationWait(
    {
      reviewClickResult: reviewClickReady,
      observation: {
        modalStillVisible: false,
        userConfirmed: true,
      },
    },
    { checkedAt },
  );
  const matchingReadback: AvanzaBrokerConfirmationReadback = {
    action: "buy",
    ticker: "QA.CAPTURE",
    name: "QA Capture Instrument",
    market: "Stockholm",
    currency: "SEK",
    instrumentType: "stock",
    quantityValue: 12,
    priceValue: 145.5,
    fees: "1.00",
    totalAmount: "1747.00",
    timestamp: checkedAt,
    orderIdSanitized: "AVZ-STUB-001",
    accountLabelSanitized: "Sanitized account",
    orderStatus: "filled",
    statusTextSanitized: "Filled",
    confirmationPageVisible: true,
  };
  const buildResponse = (
    brokerConfirmationReadback: AvanzaBrokerConfirmationReadback | undefined,
    statusCode: number,
    manualResult = manualConfirmationWaitResult,
  ) => {
    const brokerConfirmationCapture = evaluateAvanzaBrokerConfirmationCapture(
      {
        dryRunOrderInput,
        manualConfirmationWaitResult: manualResult,
        ...(brokerConfirmationReadback
          ? { brokerConfirmationReadback }
          : {}),
      },
      { checkedAt },
    );

    return {
      version: "avanza_localhost_bridge_v1" as const,
      ok: brokerConfirmationCapture.ok,
      bridgeVersion: "avanza_localhost_bridge_v1" as const,
      requestId: "broker_confirmation_capture_request_test",
      receivedAt: checkedAt,
      completedAt: checkedAt,
      brokerConfirmationCapture,
      message:
        "Broker confirmation capture bridge stub completed safely. No browser was controlled.",
      errors: brokerConfirmationCapture.errors,
      warnings: [
        "Broker confirmation capture runner is not implemented.",
        "No browser actions were executed.",
        "No Avanza page was touched.",
        "No Bekräfta was clicked by the agent.",
        "No BrokerExecutionResult was created.",
        "No execution record was created.",
        "No Supabase write occurred.",
        "No trade mutation occurred.",
        ...brokerConfirmationCapture.warnings,
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
      statusCode,
    };
  };
  const notObserved = evaluateAvanzaManualConfirmationWait(
    { reviewClickResult: reviewClickReady },
    { checkedAt },
  );
  const responses = [
    buildResponse(matchingReadback, 200),
    buildResponse({ ...matchingReadback, orderStatus: "placed" }, 200),
    buildResponse({ ...matchingReadback, orderStatus: "accepted" }, 200),
    buildResponse(
      { ...matchingReadback, orderStatus: "partially_filled" },
      200,
    ),
    buildResponse({ ...matchingReadback, quantityValue: 13 }, 400),
    buildResponse({ ...matchingReadback, priceValue: 146.5 }, 400),
    buildResponse({ ...matchingReadback, orderStatus: "rejected" }, 400),
    buildResponse({ ...matchingReadback, orderStatus: "cancelled" }, 400),
    buildResponse({ ...matchingReadback, orderStatus: "expired" }, 400),
    buildResponse(
      {
        ...matchingReadback,
        sensitiveSignals: {
          accountDataDetected: true,
          balanceDataDetected: true,
          holdingsDataDetected: true,
          sensitiveDataDetected: true,
        },
      },
      400,
    ),
    buildResponse(
      {
        ...matchingReadback,
        sensitiveSignals: {
          rawDomDetected: true,
          unsanitizedScreenshotDetected: true,
        },
      },
      400,
    ),
    buildResponse(
      {
        ...matchingReadback,
        forbiddenSignals: { brokerResultCreationAttempted: true },
      },
      400,
    ),
    buildResponse(
      {
        ...matchingReadback,
        forbiddenSignals: { tradeMutationAttempted: true },
      },
      400,
    ),
    buildResponse(matchingReadback, 400, notObserved),
    buildResponse(undefined, 400),
  ];
  const request = buildLocalhostBridgeBrokerConfirmationCaptureRequest(
    dryRunOrderInput,
    {
      requestId: "broker_confirmation_capture_request_test",
      createdAt: checkedAt,
      manualConfirmationWaitResult,
      brokerConfirmationReadback: matchingReadback,
    },
  );

  expect(validateLocalhostBridgeBrokerConfirmationCaptureRequest(request)).toEqual(
    expect.objectContaining({ ok: true, errors: [] }),
  );
  expect(
    validateLocalhostBridgeBrokerConfirmationCaptureResponse(responses[0]),
  ).toEqual(expect.objectContaining({ ok: true, errors: [] }));
  expect(
    summarizeLocalhostBrokerConfirmationCaptureBridgeResponse(responses[0]),
  ).toContain("No BrokerExecutionResult");

  let responseIndex = 0;
  const fetchFn: typeof fetch = async (input, init) => {
    expect(String(input)).toBe(
      "http://127.0.0.1:47831/broker-confirmation-capture",
    );
    expect(init?.method).toBe("POST");
    const body =
      typeof init?.body === "string"
        ? (JSON.parse(init.body) as Record<string, unknown>)
        : {};

    expect(body).toEqual(
      expect.objectContaining({
        requestId: "broker_confirmation_capture_request_test",
        metadata: expect.objectContaining({
          broker_confirmation_capture_stub_check: true,
          no_bekrafta_clicked: true,
          no_broker_execution_result_created: true,
          no_execution_record_created: true,
          no_supabase_write: true,
        }),
      }),
    );

    const responseBody = responses[responseIndex++];

    return new Response(JSON.stringify(responseBody), {
      status: responseBody.statusCode,
      headers: { "Content-Type": "application/json" },
    });
  };
  const callClient = () =>
    checkLocalhostBridgeBrokerConfirmationCapture({
      dryRunOrderInput,
      requestId: "broker_confirmation_capture_request_test",
      createdAt: checkedAt,
      manualConfirmationWaitResult,
      brokerConfirmationReadback: matchingReadback,
      baseUrl: "http://127.0.0.1:47831",
      fetchFn,
    });

  const captured = await callClient();
  expect(captured).toEqual(
    expect.objectContaining({
      ok: true,
      reachable: true,
      status: "confirmation_captured",
      statusCode: 200,
    }),
  );
  expect(captured.summary).toContain("No execution record");

  const placed = await callClient();
  expect(placed.status).toBe("confirmation_partial");
  expect(placed.ok).toBe(false);
  expect(placed.warnings.join(" ")).toContain("fill is not confirmed");

  const accepted = await callClient();
  expect(accepted.status).toBe("confirmation_partial");

  const partial = await callClient();
  expect(partial.status).toBe("confirmation_partial");
  expect(partial.warnings.join(" ")).toContain("partial fill");

  const quantityMismatch = await callClient();
  expect(quantityMismatch.status).toBe("confirmation_mismatch");
  expect(quantityMismatch.errors.join(" ")).toContain(
    "quantity does not match",
  );

  const priceMismatch = await callClient();
  expect(priceMismatch.status).toBe("confirmation_mismatch");
  expect(priceMismatch.errors.join(" ")).toContain("price does not match");

  const rejected = await callClient();
  expect(rejected.status).toBe("confirmation_rejected_or_cancelled");

  const cancelled = await callClient();
  expect(cancelled.status).toBe("confirmation_rejected_or_cancelled");

  const expired = await callClient();
  expect(expired.status).toBe("confirmation_rejected_or_cancelled");

  const sensitive = await callClient();
  expect(sensitive.status).toBe("blocked");
  expect(sensitive.errors).toEqual(
    expect.arrayContaining([
      "Sensitive data detected in broker confirmation capture.",
    ]),
  );

  const rawDom = await callClient();
  expect(rawDom.status).toBe("blocked");
  expect(rawDom.errors.join(" ")).toContain("Raw DOM");

  const brokerResultAttempt = await callClient();
  expect(brokerResultAttempt.status).toBe("blocked");
  expect(brokerResultAttempt.errors.join(" ")).toContain(
    "BrokerExecutionResult creation",
  );

  const tradeMutationAttempt = await callClient();
  expect(tradeMutationAttempt.status).toBe("blocked");
  expect(tradeMutationAttempt.errors.join(" ")).toContain("Trade mutation");

  const manualNotObserved = await callClient();
  expect(manualNotObserved.status).toBe("manual_confirmation_not_observed");

  const pageNotFound = await callClient();
  expect(pageNotFound.status).toBe("confirmation_page_not_found");

  const invalidJson = await checkLocalhostBridgeBrokerConfirmationCapture({
    dryRunOrderInput,
    manualConfirmationWaitResult,
    fetchFn: async () =>
      new Response("not json", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
  });
  expect(invalidJson).toEqual(
    expect.objectContaining({
      ok: false,
      reachable: true,
      status: "failed",
    }),
  );
  expect(invalidJson.errors[0]).toContain("invalid JSON");

  const invalidShape = await checkLocalhostBridgeBrokerConfirmationCapture({
    dryRunOrderInput,
    manualConfirmationWaitResult,
    fetchFn: async () =>
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
  });
  expect(invalidShape.ok).toBe(false);
  expect(invalidShape.errors.join(" ")).toContain(
    "broker confirmation capture response",
  );

  const invalidDryRunInput = await checkLocalhostBridgeBrokerConfirmationCapture({
    dryRunOrderInput: {
      ...dryRunOrderInput,
      quantity: 0,
    },
    fetchFn: async () => {
      throw new Error("fetch should not be called for invalid dry-run input");
    },
  });
  expect(invalidDryRunInput).toEqual(
    expect.objectContaining({
      ok: false,
      reachable: false,
      status: "failed",
    }),
  );
  expect(invalidDryRunInput.errors.join(" ")).toContain(
    "quantity must be a positive integer",
  );
});

test("normalizes localhost bridge instrument verification stub responses safely", async () => {
  const checkedAt = "2026-06-11T13:32:00.000Z";
  const expected: AvanzaSearchOnlyExpectedInstrument = {
    ticker: "QA.VERIFY",
    name: "QA Verify Instrument",
    market: "Stockholm",
    currency: "SEK",
    instrumentType: "stock",
  };
  const candidate: AvanzaSearchOnlyCandidate = {
    candidateId: "candidate_exact_verify",
    displayName: "QA Verify Instrument",
    ticker: "QA.VERIFY",
    market: "Stockholm",
    currency: "SEK",
    instrumentType: "stock",
    matchConfidence: 0.98,
    sanitizedSource: "synthetic_stub",
    riskFlags: [],
    warnings: [],
  };
  const exactSearch = classifyAvanzaSearchOnlyCandidates(expected, [candidate], {
    checkedAt,
    requireMarketMatch: true,
    requireCurrencyMatch: true,
    requireInstrumentTypeMatch: true,
  });
  const buildResponse = (
    instrumentVerification: ReturnType<typeof verifyAvanzaInstrument>,
  ) => ({
    version: "avanza_localhost_bridge_v1" as const,
    ok: instrumentVerification.ok,
    bridgeVersion: "avanza_localhost_bridge_v1" as const,
    requestId: "instrument_verification_request_test",
    receivedAt: checkedAt,
    completedAt: checkedAt,
    instrumentVerification,
    message:
      "Instrument verification bridge stub completed safely. No browser was controlled.",
    errors: instrumentVerification.errors,
    warnings: [
      "Instrument verification runner is not implemented.",
      "No browser actions were executed.",
      "No Avanza page was touched.",
      "No order page was opened.",
      ...instrumentVerification.warnings,
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
  const verifiedResponse = buildResponse(
    verifyAvanzaInstrument(
      {
        expectedInstrument: expected,
        searchOnlyResult: exactSearch,
      },
      { checkedAt },
    ),
  );
  const rejectedResponse = buildResponse(
    verifyAvanzaInstrument(
      {
        expectedInstrument: expected,
        searchOnlyResult: exactSearch,
        selectedCandidate: {
          ...candidate,
          candidateId: "candidate_rejected_verify",
          ticker: "NO.MATCH",
        },
      },
      { checkedAt },
    ),
  );
  const ambiguousResponse = buildResponse(
    verifyAvanzaInstrument(
      {
        expectedInstrument: expected,
        searchOnlyResult: exactSearch,
        selectedCandidate: {
          ...candidate,
          candidateId: "candidate_ambiguous_verify",
          currency: undefined,
        },
      },
      { checkedAt },
    ),
  );
  const blockedResponse = buildResponse(
    verifyAvanzaInstrument(
      {
        expectedInstrument: expected,
        searchOnlyResult: exactSearch,
        selectedCandidate: {
          ...candidate,
          candidateId: "candidate_blocked_verify",
          riskFlags: ["order_flow_detected"],
        },
      },
      { checkedAt },
    ),
  );
  const missingCandidateResponse = buildResponse(
    verifyAvanzaInstrument(
      {
        expectedInstrument: expected,
        searchOnlyResult: {
          ...exactSearch,
          selectedCandidate: undefined,
        },
      },
      { checkedAt },
    ),
  );
  const searchNotReadyResponse = buildResponse(
    verifyAvanzaInstrument(
      {
        expectedInstrument: expected,
        searchOnlyResult: classifyAvanzaSearchOnlyCandidates(
          expected,
          [
            candidate,
            {
              ...candidate,
              candidateId: "candidate_duplicate_verify",
              displayName: "QA Verify Instrument duplicate",
            },
          ],
          { checkedAt },
        ),
      },
      { checkedAt },
    ),
  );
  const request = buildLocalhostBridgeInstrumentVerificationRequest(expected, {
    requestId: "instrument_verification_request_test",
    createdAt: checkedAt,
    searchOnlyResult: exactSearch,
  });

  expect(validateLocalhostBridgeInstrumentVerificationRequest(request)).toEqual(
    expect.objectContaining({ ok: true, errors: [] }),
  );
  expect(validateLocalhostBridgeInstrumentVerificationResponse(verifiedResponse)).toEqual(
    expect.objectContaining({ ok: true, errors: [] }),
  );
  expect(summarizeLocalhostInstrumentVerificationBridgeResponse(verifiedResponse)).toContain(
    "Instrument verified",
  );

  const responses = [
    verifiedResponse,
    rejectedResponse,
    ambiguousResponse,
    blockedResponse,
    missingCandidateResponse,
    searchNotReadyResponse,
  ];
  let responseIndex = 0;
  const fetchFn = async () =>
    new Response(JSON.stringify(responses[responseIndex++]), {
      status:
        responses[Math.max(0, responseIndex - 1)].instrumentVerification
          .status === "blocked"
          ? 400
          : 200,
      headers: { "Content-Type": "application/json" },
    });

  const verified = await checkLocalhostBridgeInstrumentVerification({
    expectedInstrument: expected,
    searchOnlyResult: exactSearch,
    requestId: "instrument_verification_request_test",
    fetchFn,
  });
  expect(verified).toEqual(
    expect.objectContaining({
      ok: true,
      reachable: true,
      status: "verified",
    }),
  );
  expect(verified.summary).toContain("Instrument verified");
  expect(verified.summary).toContain("No browser actions were executed");

  const rejected = await checkLocalhostBridgeInstrumentVerification({
    expectedInstrument: expected,
    searchOnlyResult: exactSearch,
    requestId: "instrument_verification_request_test",
    fetchFn,
  });
  expect(rejected.status).toBe("rejected");
  expect(rejected.summary).toContain("Instrument rejected");

  const ambiguous = await checkLocalhostBridgeInstrumentVerification({
    expectedInstrument: expected,
    searchOnlyResult: exactSearch,
    requestId: "instrument_verification_request_test",
    fetchFn,
  });
  expect(ambiguous.status).toBe("ambiguous");
  expect(ambiguous.summary).toContain("Instrument ambiguous");

  const blocked = await checkLocalhostBridgeInstrumentVerification({
    expectedInstrument: expected,
    searchOnlyResult: exactSearch,
    requestId: "instrument_verification_request_test",
    fetchFn,
  });
  expect(blocked.status).toBe("blocked");
  expect(blocked.errors).toEqual(
    expect.arrayContaining(["Order-flow risk detected on selected candidate."]),
  );

  const missingCandidate = await checkLocalhostBridgeInstrumentVerification({
    expectedInstrument: expected,
    searchOnlyResult: exactSearch,
    requestId: "instrument_verification_request_test",
    fetchFn,
  });
  expect(missingCandidate.status).toBe("missing_candidate");
  expect(missingCandidate.summary).toContain("missing selected candidate");

  const searchNotReady = await checkLocalhostBridgeInstrumentVerification({
    expectedInstrument: expected,
    searchOnlyResult: exactSearch,
    requestId: "instrument_verification_request_test",
    fetchFn,
  });
  expect(searchNotReady.status).toBe("ambiguous");
  expect(searchNotReady.summary).toContain("Instrument ambiguous");

  const invalidJson = await checkLocalhostBridgeInstrumentVerification({
    expectedInstrument: expected,
    fetchFn: async () =>
      new Response("not json", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
  });
  expect(invalidJson).toEqual(
    expect.objectContaining({
      ok: false,
      reachable: true,
      status: "failed",
    }),
  );
  expect(invalidJson.errors[0]).toContain("invalid JSON");

  const missingTicker = await checkLocalhostBridgeInstrumentVerification({
    expectedInstrument: { ticker: "" },
    fetchFn,
  });
  expect(missingTicker).toEqual(
    expect.objectContaining({
      ok: false,
      reachable: false,
      status: "failed",
    }),
  );
  expect(missingTicker.errors[0]).toContain(
    "requires expectedInstrument.ticker",
  );
});

test("normalizes localhost bridge search-only stub responses safely", async () => {
  const checkedAt = "2026-06-11T13:35:00.000Z";
  const expected: AvanzaSearchOnlyExpectedInstrument = {
    ticker: "QA.SEARCH",
    name: "QA Search Instrument",
    market: "Stockholm",
    currency: "SEK",
    instrumentType: "stock",
  };
  const exactCandidate: AvanzaSearchOnlyCandidate = {
    candidateId: "candidate_exact_search",
    displayName: "QA Search Instrument",
    ticker: "QA.SEARCH",
    market: "Stockholm",
    currency: "SEK",
    instrumentType: "stock",
    matchConfidence: 0.98,
    sanitizedSource: "synthetic_stub",
    riskFlags: [],
    warnings: [],
  };
  const buildResponse = (
    searchOnly: ReturnType<typeof classifyAvanzaSearchOnlyCandidates>,
  ) => ({
    version: "avanza_localhost_bridge_v1" as const,
    ok: searchOnly.ok,
    bridgeVersion: "avanza_localhost_bridge_v1" as const,
    requestId: "search_only_request_test",
    receivedAt: checkedAt,
    completedAt: checkedAt,
    searchOnly,
    message: "Search-only bridge stub completed safely.",
    errors: searchOnly.errors,
    warnings: [
      "Search-only runner is not implemented.",
      "No browser actions were executed.",
      "No Avanza page was touched.",
      "No order page was opened.",
      ...searchOnly.warnings,
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
  const exactResponse = buildResponse(
    classifyAvanzaSearchOnlyCandidates(expected, [exactCandidate], {
      checkedAt,
      requireMarketMatch: true,
      requireCurrencyMatch: true,
      requireInstrumentTypeMatch: true,
    }),
  );
  const ambiguousResponse = buildResponse(
    classifyAvanzaSearchOnlyCandidates(
      expected,
      [
        exactCandidate,
        {
          ...exactCandidate,
          candidateId: "candidate_duplicate_search",
          displayName: "QA Search Instrument duplicate",
        },
      ],
      { checkedAt },
    ),
  );
  const noMatchResponse = buildResponse(
    classifyAvanzaSearchOnlyCandidates(
      expected,
      [
        {
          ...exactCandidate,
          candidateId: "candidate_mismatch_search",
          displayName: "Mismatch",
          ticker: "NO.MATCH",
        },
      ],
      { checkedAt },
    ),
  );
  const blockedOrderFlowResponse = buildResponse(
    classifyAvanzaSearchOnlyCandidates(
      expected,
      [
        {
          ...exactCandidate,
          candidateId: "candidate_order_flow_search",
          riskFlags: ["order_flow_detected"],
        },
      ],
      { checkedAt },
    ),
  );
  const request = buildLocalhostBridgeSearchOnlyRequest(expected, {
    requestId: "search_only_request_test",
    createdAt: checkedAt,
  });
  const requestValidation = validateLocalhostBridgeSearchOnlyRequest(request);

  expect(requestValidation).toEqual(expect.objectContaining({ ok: true }));
  expect(validateLocalhostBridgeSearchOnlyResponse(exactResponse)).toEqual(
    expect.objectContaining({ ok: true }),
  );
  expect(summarizeLocalhostSearchOnlyBridgeResponse(exactResponse)).toContain(
    "Exact instrument match found.",
  );

  const exactFetch = async () =>
    new Response(JSON.stringify(exactResponse), { status: 200 });
  const exactResult = await checkLocalhostBridgeSearchOnly({
    expectedInstrument: expected,
    requestId: "search_only_request_test",
    createdAt: checkedAt,
    fetchFn: exactFetch,
  });

  expect(exactResult).toEqual(
    expect.objectContaining({
      ok: true,
      reachable: true,
      status: "exact_match",
      statusCode: 200,
    }),
  );
  expect(exactResult.summary).toContain("No order page was opened");
  expect(exactResult.response?.searchOnly.metadata).toEqual(
    expect.objectContaining({
      searchOnly: true,
      noOrderPage: true,
      noBuySellClick: true,
      noBrokerSubmission: true,
      noBrokerResult: true,
    }),
  );

  const ambiguousResult = await checkLocalhostBridgeSearchOnly({
    expectedInstrument: expected,
    fetchFn: async () =>
      new Response(JSON.stringify(ambiguousResponse), { status: 200 }),
  });

  expect(ambiguousResult.status).toBe("ambiguous");
  expect(ambiguousResult.ok).toBe(false);
  expect(ambiguousResult.summary).toContain("Ambiguous candidates");

  const noMatchResult = await checkLocalhostBridgeSearchOnly({
    expectedInstrument: expected,
    fetchFn: async () =>
      new Response(JSON.stringify(noMatchResponse), { status: 200 }),
  });

  expect(noMatchResult.status).toBe("no_match");
  expect(noMatchResult.summary).toContain("No matching instrument found");

  const blockedResult = await checkLocalhostBridgeSearchOnly({
    expectedInstrument: expected,
    fetchFn: async () =>
      new Response(JSON.stringify(blockedOrderFlowResponse), { status: 400 }),
  });

  expect(blockedResult.status).toBe("blocked");
  expect(blockedResult.errors).toEqual(
    expect.arrayContaining([
      "Order flow was detected during search-only candidate parsing.",
    ]),
  );
  expect(blockedResult.summary).toContain("Blocked");

  const invalidJsonResult = await checkLocalhostBridgeSearchOnly({
    expectedInstrument: expected,
    fetchFn: async () => new Response("{not-json", { status: 200 }),
  });

  expect(invalidJsonResult).toEqual(
    expect.objectContaining({
      ok: false,
      reachable: true,
      status: "failed",
    }),
  );
  expect(invalidJsonResult.errors[0]).toContain("invalid JSON");

  const missingTickerResult = await checkLocalhostBridgeSearchOnly({
    expectedInstrument: { ticker: "" },
    fetchFn: exactFetch,
  });

  expect(missingTickerResult).toEqual(
    expect.objectContaining({
      ok: false,
      reachable: false,
      status: "failed",
    }),
  );
  expect(missingTickerResult.errors[0]).toContain(
    "expectedInstrument.ticker",
  );
});

test("validates and normalizes localhost bridge runner self-check responses", async () => {
  const checkedAt = "2026-06-11T12:45:00.000Z";
  const selfCheck = createUnavailableAvanzaDryRunRunnerSelfCheck({
    checkedAt,
  });
  const responseBody = {
    version: "avanza_localhost_bridge_v1" as const,
    ok: true,
    bridgeVersion: "avanza_localhost_bridge_v1" as const,
    checkedAt,
    selfCheck,
    message:
      "Localhost bridge self-check completed. No Avanza dry-run runner is installed or available.",
    errors: [],
    warnings: [
      "Self-check is diagnostics only. It does not open a browser, touch Avanza, submit orders, create broker results, write Supabase, or mutate trades.",
    ],
    metadata: {
      self_check_only: true,
      no_browser_control: true,
    },
  };
  const validation =
    validateLocalhostBridgeRunnerSelfCheckResponse(responseBody);
  const fetchFn: typeof fetch = async () =>
    new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  const clientResult = await checkLocalhostBridgeRunnerSelfCheck({
    fetchFn,
    baseUrl: "http://127.0.0.1:47831",
  });

  expect(validation).toEqual(
    expect.objectContaining({
      ok: true,
      errors: [],
    }),
  );
  expect(clientResult).toEqual(
    expect.objectContaining({
      ok: true,
      reachable: true,
      statusCode: 200,
      baseUrl: "http://127.0.0.1:47831",
    }),
  );
  expect(clientResult.response?.selfCheck).toEqual(
    expect.objectContaining({
      ok: false,
      status: "unavailable",
    }),
  );
  expect(clientResult.response?.selfCheck.blockers).toEqual(
    expect.arrayContaining([
      "No Avanza dry-run runner is installed/available.",
    ]),
  );
  expect(clientResult.warnings).toEqual(
    expect.arrayContaining([
      "Self-check is diagnostics only. It does not open a browser, touch Avanza, submit orders, create broker results, write Supabase, or mutate trades.",
    ]),
  );
});

test("validates and normalizes localhost bridge session-detection responses", async () => {
  const checkedAt = "2026-06-11T12:55:00.000Z";
  const makeResponse = (
    sessionDetection: ReturnType<typeof evaluateAvanzaSessionDetectionContext>,
  ) => ({
    version: "avanza_localhost_bridge_v1" as const,
    ok: sessionDetection.ok,
    bridgeVersion: "avanza_localhost_bridge_v1" as const,
    checkedAt,
    sessionDetection,
    message:
      "Localhost bridge session-detection stub completed safely. No browser was controlled.",
    errors: [...sessionDetection.errors],
    warnings: [
      "Session detection runner is not implemented.",
      "No browser actions were executed.",
      "No Avanza page was touched.",
      ...sessionDetection.warnings,
    ],
    metadata: {
      localhost_bridge_stub: true,
      session_detection_stub: true,
      session_detection_only: true,
      no_browser_control: true,
      no_browser_actions_executed: true,
      no_avanza_page_touched: true,
      no_broker_submission: true,
      no_broker_result_created: true,
    },
  });
  const readyResponse = makeResponse(
    evaluateAvanzaSessionDetectionContext({
      browserConnected: true,
      avanzaVisible: true,
      sanitizedHostClass: "avanza",
      loginState: "logged_in",
      pageContext: "app_shell",
      language: "sv",
      sensitiveDataDetected: false,
    }),
  );
  const loginRequiredResponse = makeResponse(
    evaluateAvanzaSessionDetectionContext({
      browserConnected: true,
      avanzaVisible: true,
      sanitizedHostClass: "avanza",
      loginState: "login_challenge",
      pageContext: "login",
      language: "sv",
    }),
  );
  const blockedSensitiveResponse = makeResponse(
    evaluateAvanzaSessionDetectionContext({
      browserConnected: true,
      avanzaVisible: true,
      sanitizedHostClass: "avanza",
      loginState: "logged_in",
      pageContext: "app_shell",
      language: "sv",
      sensitiveDataDetected: true,
    }),
  );

  expect(validateLocalhostBridgeSessionDetectionResponse(readyResponse)).toEqual(
    expect.objectContaining({
      ok: true,
      errors: [],
    }),
  );
  expect(
    summarizeLocalhostSessionDetectionBridgeResponse(readyResponse),
  ).toContain("Session appears ready for search-only");

  const responses = [
    readyResponse,
    loginRequiredResponse,
    blockedSensitiveResponse,
  ];
  const capturedUrls: string[] = [];
  const fetchFn: typeof fetch = async (input) => {
    capturedUrls.push(String(input));
    const body = responses.shift() ?? readyResponse;

    return new Response(JSON.stringify(body), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  const readyClientResult = await checkLocalhostBridgeSessionDetection({
    fetchFn,
    baseUrl: "http://127.0.0.1:47831",
  });
  const loginClientResult = await checkLocalhostBridgeSessionDetection({
    fetchFn,
    baseUrl: "http://127.0.0.1:47831",
  });
  const blockedClientResult = await checkLocalhostBridgeSessionDetection({
    fetchFn,
    baseUrl: "http://127.0.0.1:47831",
  });

  expect(capturedUrls).toEqual([
    "http://127.0.0.1:47831/session-detection",
    "http://127.0.0.1:47831/session-detection",
    "http://127.0.0.1:47831/session-detection",
  ]);
  expect(readyClientResult).toEqual(
    expect.objectContaining({
      ok: true,
      reachable: true,
      status: "ready_for_search_only",
      statusCode: 200,
    }),
  );
  expect(readyClientResult.summary).toContain("ready for search-only");
  expect(loginClientResult).toEqual(
    expect.objectContaining({
      ok: false,
      reachable: true,
      status: "login_required",
      statusCode: 200,
    }),
  );
  expect(loginClientResult.summary).toContain("login required");
  expect(blockedClientResult).toEqual(
    expect.objectContaining({
      ok: false,
      reachable: true,
      status: "blocked",
      statusCode: 200,
    }),
  );
  expect(blockedClientResult.errors).toEqual(
    expect.arrayContaining(["Sensitive data was detected and must be redacted."]),
  );
  expect(blockedClientResult.summary).toContain("Sensitive data");

  const invalidJsonFetch: typeof fetch = async () =>
    new Response("not-json", {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  const invalidJsonResult = await checkLocalhostBridgeSessionDetection({
    fetchFn: invalidJsonFetch,
    baseUrl: "http://127.0.0.1:47831",
  });

  expect(invalidJsonResult).toEqual(
    expect.objectContaining({
      ok: false,
      reachable: true,
      statusCode: 200,
    }),
  );
  expect(invalidJsonResult.errors[0]).toContain("invalid JSON");
});

test("validates Avanza dry-run request contract without automation", () => {
  const validBuy = createAvanzaDryRunOrderInput({
    action: "buy",
    instrument: {
      ticker: "VOLV B",
      name: "Volvo B",
      market: "Stockholm",
      currency: "SEK",
      instrumentType: "stock",
    },
    quantity: 10,
    price: 250.5,
    executionIntentId: "intent_avanza_dry_run_buy",
    sourceRecommendationId: "recommendation_avanza_dry_run_buy",
    createdAt: "2026-06-11T12:30:00.000Z",
  });
  const validSell = createAvanzaDryRunOrderInput({
    action: "sell",
    instrument: {
      ticker: "ERIC B",
      market: "Stockholm",
      currency: "SEK",
    },
    quantity: 4,
    price: 88.1,
    accountPolicy: "require_exact_match",
    expectedAccountLabel: "ISK",
    stopPolicy: "stop_before_review",
    createdAt: "2026-06-11T12:31:00.000Z",
  });

  const validBuyValidation = validateAvanzaDryRunOrderInput(validBuy);
  const validSellValidation = validateAvanzaDryRunOrderInput(validSell);

  expect(validBuy).toEqual(
    expect.objectContaining({
      orderMode: "advanced",
      accountPolicy: "require_manual_review",
      stopPolicy: "stop_at_confirmation_modal",
    }),
  );
  expect(validBuyValidation).toEqual(
    expect.objectContaining({
      ok: true,
      errors: [],
    }),
  );
  expect(validBuyValidation.normalized).toEqual(
    expect.objectContaining({
      action: "buy",
      quantity: 10,
      price: 250.5,
      orderMode: "advanced",
      stopPolicy: "stop_at_confirmation_modal",
      accountPolicy: "require_manual_review",
    }),
  );
  expect(validSellValidation).toEqual(
    expect.objectContaining({
      ok: true,
      errors: [],
    }),
  );
  expect(summarizeAvanzaDryRunOrderInput(validBuy)).toContain(
    "BUY VOLV B 10 @ 250.5 / Advanced / Stop at confirmation modal / No broker submission",
  );
  expect(summarizeAvanzaDryRunOrderInput(validSell)).toContain(
    "SELL ERIC B 4 @ 88.1 / Advanced / Stop before review / No broker submission",
  );
  expect(isAvanzaDryRunSubmitBlocked()).toBe(true);
  expect(getAvanzaDryRunSafetyLabels(validBuy)).toEqual(
    expect.arrayContaining([
      "Avanza dry-run only",
      "Advanced order mode",
      "Stop at confirmation modal",
      "No broker submission",
      "No final confirmation",
      "No broker result",
    ]),
  );

  expect(
    validateAvanzaDryRunOrderInput({
      ...validBuy,
      instrument: { ...validBuy.instrument, ticker: "" },
    }),
  ).toEqual(
    expect.objectContaining({
      ok: false,
      errors: expect.arrayContaining(["Instrument ticker is required."]),
    }),
  );
  expect(
    validateAvanzaDryRunOrderInput({
      ...validBuy,
      quantity: 0,
    }),
  ).toEqual(
    expect.objectContaining({
      ok: false,
      errors: expect.arrayContaining([
        "Avanza dry-run quantity must be a positive integer.",
      ]),
    }),
  );
  expect(
    validateAvanzaDryRunOrderInput({
      ...validBuy,
      quantity: -1,
    }),
  ).toEqual(
    expect.objectContaining({
      ok: false,
      errors: expect.arrayContaining([
        "Avanza dry-run quantity must be a positive integer.",
      ]),
    }),
  );
  expect(
    validateAvanzaDryRunOrderInput({
      ...validBuy,
      price: 0,
    }),
  ).toEqual(
    expect.objectContaining({
      ok: false,
      errors: expect.arrayContaining([
        "Avanza dry-run price must be a positive finite number.",
      ]),
    }),
  );
  expect(
    validateAvanzaDryRunOrderInput({
      ...validBuy,
      price: -1,
    }),
  ).toEqual(
    expect.objectContaining({
      ok: false,
      errors: expect.arrayContaining([
        "Avanza dry-run price must be a positive finite number.",
      ]),
    }),
  );
  expect(
    validateAvanzaDryRunOrderInput({
      ...validBuy,
      orderMode: "stop_loss",
    }),
  ).toEqual(
    expect.objectContaining({
      ok: false,
      errors: expect.arrayContaining([
        "Avanza dry-run order mode must be advanced.",
      ]),
    }),
  );
  expect(
    validateAvanzaDryRunOrderInput({
      ...validBuy,
      accountPolicy: "require_exact_match",
      expectedAccountLabel: "",
    }),
  ).toEqual(
    expect.objectContaining({
      ok: false,
      errors: expect.arrayContaining([
        "Avanza dry-run account policy require_exact_match requires expectedAccountLabel.",
      ]),
    }),
  );
  expect(
    validateAvanzaDryRunOrderInput({
      ...validBuy,
      metadata: {
        allowFinalSubmit: true,
        supportsBrokerSubmission: true,
        supportsFinalConfirmClick: true,
        automaticModeCapable: true,
      },
    }),
  ).toEqual(
    expect.objectContaining({
      ok: false,
      errors: expect.arrayContaining([
        "Avanza dry-run request metadata must not allow final submit.",
        "Avanza dry-run request metadata must not support broker submission.",
        "Avanza dry-run request metadata must not support final-confirm clicks.",
        "Avanza dry-run request metadata must not enable automatic mode.",
      ]),
    }),
  );
  expect(
    validateAvanzaDryRunOrderInput({
      ...validBuy,
      instrument: {
        ticker: "NO.META",
      },
    }),
  ).toEqual(
    expect.objectContaining({
      ok: true,
      warnings: expect.arrayContaining([
        "Instrument currency is missing and must be verified manually.",
        "Instrument market is missing and must be verified manually.",
      ]),
    }),
  );
});

test("validates localhost bridge Avanza dry-run endpoint contract without automation", () => {
  const dryRunOrderInput = createAvanzaDryRunOrderInput({
    action: "buy",
    instrument: {
      ticker: "ATCO A",
      name: "Atlas Copco A",
      market: "Stockholm",
      currency: "SEK",
      instrumentType: "stock",
    },
    quantity: 5,
    price: 155.25,
    executionIntentId: "execution_intent_bridge_dry_run_contract",
    sourceRecommendationId: "recommendation_bridge_dry_run_contract",
    createdAt: "2026-06-11T12:45:00.000Z",
    metadata: {
      allowFinalSubmit: false,
      supportsBrokerSubmission: false,
      supportsFinalConfirmClick: false,
      automaticModeCapable: false,
    },
  });
  const request = buildLocalhostBridgeDryRunRequest(dryRunOrderInput, {
    requestId: "localhost_bridge_dry_run_contract_001",
    createdAt: "2026-06-11T12:46:00.000Z",
    capabilityValidationOptions: {
      allowAvanzaDryRun: true,
      allowBrokerSubmission: false,
      allowAutomaticMode: false,
    },
    metadata: {
      local_contract_test: true,
      no_browser_actions_requested: true,
    },
  });
  const requestValidation = validateLocalhostBridgeDryRunRequest(request);
  const response = createLocalhostBridgeDryRunStubResponse(request);
  const responseValidation = validateLocalhostBridgeDryRunResponse(response);

  expect(requestValidation).toEqual(
    expect.objectContaining({
      ok: true,
      errors: [],
    }),
  );
  expect(response).toEqual(
    expect.objectContaining({
      ok: false,
      status: "not_implemented",
      requestId: "localhost_bridge_dry_run_contract_001",
      diagnostics: null,
      message: expect.stringContaining(
        "Avanza dry-run runner is not implemented",
      ),
    }),
  );
  expect(response.dryRunRequestValidation).toEqual(
    expect.objectContaining({
      ok: true,
      errors: [],
    }),
  );
  expect(response.capabilityValidation).toEqual(
    expect.objectContaining({
      ok: true,
      canRunAvanzaDryRun: true,
      canSubmitBrokerOrder: false,
    }),
  );
  expect(response.selfCheck).toBeUndefined();
  expect(response.warnings).toEqual(
    expect.arrayContaining([
      "Avanza dry-run runner is not implemented.",
      "No browser actions were executed.",
      "No broker submission was performed.",
    ]),
  );
  expect(response).not.toHaveProperty("brokerResult");
  expect(responseValidation).toEqual(
    expect.objectContaining({
      ok: true,
      errors: [],
    }),
  );

  const blockedByDefaultRequest = buildLocalhostBridgeDryRunRequest(
    dryRunOrderInput,
    {
      requestId: "localhost_bridge_dry_run_contract_blocked_default",
      createdAt: "2026-06-11T12:47:00.000Z",
    },
  );
  const blockedByDefaultResponse =
    createLocalhostBridgeDryRunStubResponse(blockedByDefaultRequest);

  expect(blockedByDefaultResponse).toEqual(
    expect.objectContaining({
      ok: false,
      status: "blocked",
    }),
  );
  expect(blockedByDefaultResponse.capabilityValidation.errors).toEqual(
    expect.arrayContaining([
      "Avanza broker browser capability is blocked by default.",
    ]),
  );

  const unsafeRequest = {
    ...request,
    requestId: "localhost_bridge_dry_run_contract_unsafe",
    capabilityValidationOptions: {
      allowAvanzaDryRun: true,
      allowBrokerSubmission: true,
      allowAutomaticMode: true,
    },
    dryRunOrderInput: {
      ...request.dryRunOrderInput,
      metadata: {
        allowFinalSubmit: true,
        supportsBrokerSubmission: true,
        supportsFinalConfirmClick: true,
        automaticModeCapable: true,
      },
    },
    metadata: {
      allowFinalSubmit: true,
    },
  };
  const unsafeRequestValidation =
    validateLocalhostBridgeDryRunRequest(unsafeRequest);
  const unsafeResponse = createLocalhostBridgeDryRunStubResponse(unsafeRequest);

  expect(unsafeRequestValidation).toEqual(
    expect.objectContaining({
      ok: false,
      errors: expect.arrayContaining([
        "Localhost bridge dry-run request must not allow broker submission.",
        "Localhost bridge dry-run request must not allow automatic mode.",
        "Localhost bridge dry-run request metadata contains unsafe submit or broker automation flags.",
      ]),
    }),
  );
  expect(unsafeResponse).toEqual(
    expect.objectContaining({
      ok: false,
      status: "blocked",
      diagnostics: null,
    }),
  );
  expect(unsafeResponse.capabilityValidation.canSubmitBrokerOrder).toBe(false);
  expect(unsafeResponse.errors).toEqual(
    expect.arrayContaining([
      "Localhost bridge dry-run request must not allow broker submission.",
      "Localhost bridge dry-run request must not allow automatic mode.",
    ]),
  );
  expect(unsafeResponse).not.toHaveProperty("brokerResult");
});

test("normalizes localhost bridge Avanza dry-run stub client responses safely", async () => {
  const dryRunOrderInput = createAvanzaDryRunOrderInput({
    action: "sell",
    instrument: {
      ticker: "SAND",
      name: "Sandvik",
      market: "Stockholm",
      currency: "SEK",
      instrumentType: "stock",
    },
    quantity: 7,
    price: 210.4,
    executionIntentId: "execution_intent_bridge_dry_run_client",
    sourceRecommendationId: "recommendation_bridge_dry_run_client",
    createdAt: "2026-06-11T13:00:00.000Z",
    metadata: {
      allowFinalSubmit: false,
      supportsBrokerSubmission: false,
      supportsFinalConfirmClick: false,
      automaticModeCapable: false,
    },
  });
  const responseBody = createLocalhostBridgeDryRunStubResponse(
    buildLocalhostBridgeDryRunRequest(dryRunOrderInput, {
      requestId: "localhost_bridge_dry_run_client_response",
      createdAt: "2026-06-11T13:01:00.000Z",
      capabilityValidationOptions: {
        allowAvanzaDryRun: true,
        allowBrokerSubmission: false,
        allowAutomaticMode: false,
      },
    }),
  );
  let capturedUrl = "";
  let capturedMethod = "";
  let capturedBody: Record<string, unknown> | null = null;
  const fetchOk: typeof fetch = async (input, init) => {
    capturedUrl = String(input);
    capturedMethod = init?.method ?? "";
    capturedBody =
      typeof init?.body === "string"
        ? (JSON.parse(init.body) as Record<string, unknown>)
        : null;

    return new Response(JSON.stringify(responseBody), {
      status: 501,
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  const result = await runLocalhostBridgeAvanzaDryRunStub({
    dryRunOrderInput,
    requestId: "localhost_bridge_dry_run_client_request",
    createdAt: "2026-06-11T13:02:00.000Z",
    baseUrl: "http://127.0.0.1:47831",
    capabilityValidationOptions: {
      allowAvanzaDryRun: true,
      allowBrokerSubmission: false,
      allowAutomaticMode: false,
    },
    metadata: {
      client_test: true,
    },
    fetchFn: fetchOk,
  });

  expect(capturedUrl).toBe("http://127.0.0.1:47831/dry-run");
  expect(capturedMethod).toBe("POST");
  expect(capturedBody).toEqual(
    expect.objectContaining({
      version: "avanza_localhost_bridge_v1",
      requestId: "localhost_bridge_dry_run_client_request",
      dryRunOrderInput: expect.objectContaining({
        action: "sell",
        quantity: 7,
        orderMode: "advanced",
        stopPolicy: "stop_at_confirmation_modal",
      }),
      metadata: expect.objectContaining({
        client_test: true,
        no_browser_actions_requested: true,
        no_broker_submission: true,
        no_broker_result_created: true,
      }),
    }),
  );
  expect(result).toEqual(
    expect.objectContaining({
      ok: true,
      reachable: true,
      status: "not_implemented",
      statusCode: 501,
      baseUrl: "http://127.0.0.1:47831",
    }),
  );
  expect(result.elapsedMs).toBeGreaterThanOrEqual(0);
  expect(result.response?.dryRunRequestValidation.ok).toBe(true);
  expect(result.response?.capabilityValidation.canRunAvanzaDryRun).toBe(true);
  expect(result.response).not.toHaveProperty("brokerResult");
  expect(result.summary).toContain(
    "Dry-run bridge accepted request but no runner is implemented",
  );
  expect(result.summary).toContain("No browser actions were executed");
  expect(summarizeLocalhostDryRunBridgeResponse(result.response)).toBe(
    result.summary,
  );
  expect(result.warnings).toEqual(
    expect.arrayContaining([
      "No browser actions were executed.",
      "No broker submission was performed.",
    ]),
  );

  const blockedResponse = createLocalhostBridgeDryRunStubResponse(
    buildLocalhostBridgeDryRunRequest(dryRunOrderInput, {
      requestId: "localhost_bridge_dry_run_client_blocked_response",
      createdAt: "2026-06-11T13:03:00.000Z",
    }),
  );
  const blockedResult = await runLocalhostBridgeAvanzaDryRunStub({
    dryRunOrderInput,
    requestId: "localhost_bridge_dry_run_client_blocked_request",
    fetchFn: async () =>
      new Response(JSON.stringify(blockedResponse), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }),
  });

  expect(blockedResult).toEqual(
    expect.objectContaining({
      ok: false,
      reachable: true,
      status: "blocked",
      statusCode: 400,
    }),
  );
  expect(blockedResult.summary).toContain(
    "Dry-run bridge blocked unsafe request",
  );
  expect(blockedResult.summary).toContain("no broker submission was performed");
  expect(blockedResult.errors).toEqual(
    expect.arrayContaining([
      "Capability: Avanza broker browser capability is blocked by default.",
    ]),
  );

  const invalidJsonResult = await runLocalhostBridgeAvanzaDryRunStub({
    dryRunOrderInput,
    fetchFn: async () =>
      new Response("not-json", {
        status: 200,
        headers: {
          "Content-Type": "text/plain",
        },
      }),
  });

  expect(invalidJsonResult).toEqual(
    expect.objectContaining({
      ok: false,
      reachable: true,
      status: "failed",
      statusCode: 200,
      summary: "Dry-run bridge returned an invalid response.",
    }),
  );
  expect(invalidJsonResult.errors.join(" ")).toContain("invalid JSON");

  const networkFailureResult = await runLocalhostBridgeAvanzaDryRunStub({
    dryRunOrderInput,
    fetchFn: async () => {
      throw new Error("connection refused");
    },
  });

  expect(networkFailureResult).toEqual(
    expect.objectContaining({
      ok: false,
      reachable: false,
      status: "failed",
      summary: "Dry-run bridge unavailable.",
      errors: ["connection refused"],
    }),
  );

  const invalidBeforeCallResult = await runLocalhostBridgeAvanzaDryRunStub({
    dryRunOrderInput: {
      ...dryRunOrderInput,
      metadata: {
        allowFinalSubmit: true,
      },
    },
    fetchFn: async () => {
      throw new Error("fetch should not be called for invalid dry-run input");
    },
  });

  expect(invalidBeforeCallResult).toEqual(
    expect.objectContaining({
      ok: false,
      reachable: false,
      status: "failed",
      summary: "Dry-run bridge request could not be built.",
    }),
  );
  expect(invalidBeforeCallResult.errors.join(" ")).toContain(
    "must not allow final submit",
  );
});

test("converts execution intents to Avanza dry-run requests without automation", () => {
  const buyIntent = buildMockOrderPageExecutionIntentFixture();
  const sellIntent: ExecutionIntent = {
    ...buyIntent,
    intent_id: "intent_avanza_dry_run_sell",
    action: "sell",
    trigger_type: "exit_target_reached",
    trigger_priority: 4,
    source: "live_day_trade_position",
    trading_package: {
      ...buyIntent.trading_package,
      recommendation_id: null,
      live_position_id: "position_avanza_dry_run_sell",
      ticker: "QA.SELL",
      quantity: 12,
      limit_price: null,
      target_price: 131.25,
      stop_loss: 118,
    },
  };
  const buyHandoff = buildAvanzaExecutionHandoff(buyIntent, {
    createdAt: "2026-06-11T12:40:00.000Z",
  });
  const buyResult = buildAvanzaDryRunOrderInputFromExecutionIntent({
    executionIntent: buyIntent,
    handoffPayload: buyHandoff,
  });
  const sellResult = buildAvanzaDryRunOrderInputFromExecutionIntent({
    executionIntent: sellIntent,
    accountPolicy: "require_exact_match",
    expectedAccountLabel: "ISK",
  });

  expect(buyResult).toEqual(
    expect.objectContaining({
      ok: true,
      errors: [],
    }),
  );
  expect(buyResult.request).toEqual(
    expect.objectContaining({
      action: "buy",
      quantity: 42,
      price: 123.45,
      orderMode: "advanced",
      accountPolicy: "require_manual_review",
      stopPolicy: "stop_at_confirmation_modal",
      executionIntentId: "intent_mock_contract",
      sourceRecommendationId: "recommendation_mock_contract",
    }),
  );
  expect(buyResult.request?.instrument).toEqual(
    expect.objectContaining({
      ticker: "QA.TEST",
      market: "US",
    }),
  );
  expect(buyResult.request?.metadata).toEqual(
    expect.objectContaining({
      source: "execution_intent",
      allowFinalSubmit: false,
      supportsBrokerSubmission: false,
      supportsFinalConfirmClick: false,
      automaticModeCapable: false,
      priceSource: "limit_price",
    }),
  );
  expect(summarizeExecutionIntentToAvanzaDryRunResult(buyResult)).toContain(
    "No broker submission",
  );
  expect(summarizeExecutionIntentToAvanzaDryRunResult(buyResult)).toContain(
    "Stop at confirmation modal",
  );

  expect(sellResult).toEqual(
    expect.objectContaining({
      ok: true,
      errors: [],
    }),
  );
  expect(sellResult.request).toEqual(
    expect.objectContaining({
      action: "sell",
      quantity: 12,
      price: 131.25,
      accountPolicy: "require_exact_match",
      expectedAccountLabel: "ISK",
      stopPolicy: "stop_at_confirmation_modal",
      executionIntentId: "intent_avanza_dry_run_sell",
    }),
  );
  expect(sellResult.request?.metadata).toEqual(
    expect.objectContaining({
      priceSource: "target_price",
      allowFinalSubmit: false,
      supportsBrokerSubmission: false,
    }),
  );

  const missingTickerResult = buildAvanzaDryRunOrderInputFromExecutionIntent({
    executionIntent: {
      ...buyIntent,
      trading_package: {
        ...buyIntent.trading_package,
        ticker: "",
      },
    },
  });
  const missingQuantityResult = buildAvanzaDryRunOrderInputFromExecutionIntent({
    executionIntent: {
      ...buyIntent,
      trading_package: {
        ...buyIntent.trading_package,
        quantity: null,
      },
    },
  });
  const missingPriceResult = buildAvanzaDryRunOrderInputFromExecutionIntent({
    executionIntent: {
      ...buyIntent,
      trading_package: {
        ...buyIntent.trading_package,
        limit_price: null,
        target_price: null,
        stop_loss: null,
      },
    },
  });
  const automaticIntent: ExecutionIntent = {
    ...buyIntent,
    mode: "automatic",
    authority: getExecutionAuthorityForMode("automatic"),
  };
  const automaticResult = buildAvanzaDryRunOrderInputFromExecutionIntent({
    executionIntent: automaticIntent,
  });
  const unsafeMetadataResult = buildAvanzaDryRunOrderInputFromExecutionIntent({
    executionIntent: buyIntent,
    metadata: {
      allowFinalSubmit: true,
      supportsBrokerSubmission: true,
      supportsFinalConfirmClick: true,
      automaticModeCapable: true,
    },
  });
  const unsupportedActionResult = buildAvanzaDryRunOrderInputFromExecutionIntent({
    executionIntent: {
      ...buyIntent,
      action: "hold",
    } as unknown as Partial<ExecutionIntent>,
  });

  expect(missingTickerResult).toEqual(
    expect.objectContaining({
      ok: false,
      errors: expect.arrayContaining([
        "Execution intent ticker is missing.",
        "Instrument ticker is required.",
      ]),
    }),
  );
  expect(missingQuantityResult).toEqual(
    expect.objectContaining({
      ok: false,
      errors: expect.arrayContaining([
        "Execution intent quantity is missing or not positive.",
        "Avanza dry-run quantity must be a positive integer.",
      ]),
    }),
  );
  expect(missingPriceResult).toEqual(
    expect.objectContaining({
      ok: false,
      errors: expect.arrayContaining([
        "Execution intent price is missing.",
        "Avanza dry-run price must be a positive finite number.",
      ]),
    }),
  );
  expect(automaticResult).toEqual(
    expect.objectContaining({
      ok: false,
      errors: expect.arrayContaining([
        "Automatic execution mode is not allowed for Avanza dry-run.",
        "Execution authority must not allow final submit for dry-run.",
        "Execution authority must not allow broker submission for dry-run.",
      ]),
    }),
  );
  expect(unsafeMetadataResult).toEqual(
    expect.objectContaining({
      ok: false,
      errors: expect.arrayContaining([
        "Adapter metadata must not request final submit.",
        "Adapter metadata must not request broker submission.",
        "Adapter metadata must not request final-confirm clicks.",
        "Adapter metadata must not request automatic mode.",
      ]),
    }),
  );
  expect(unsupportedActionResult).toEqual(
    expect.objectContaining({
      ok: false,
      errors: expect.arrayContaining([
        "Execution intent action must be buy or sell.",
        "Avanza dry-run action must be buy or sell.",
      ]),
    }),
  );
});

test("runs safe browser actions through the no-op runner without browser execution", async () => {
  const runner = createNoopSafeBrowserActionRunner({
    runnerId: "noop_safe_browser_runner_fixture",
  });
  const reviewAction = createSafeBrowserAction({
    actionId: "safe_runner_review",
    createdAt: "2026-06-11T10:10:00.000Z",
    kind: "click",
    mode: "semi_automatic",
    target: {
      label: "Granska köp",
      role: "button",
      riskLevel: "medium",
    },
    reason: "Validate review click only.",
  });
  const finalConfirmAction = createSafeBrowserAction({
    actionId: "safe_runner_final_confirm",
    createdAt: "2026-06-11T10:10:01.000Z",
    kind: "click",
    mode: "semi_automatic",
    target: {
      label: "Bekräfta köp",
      role: "button",
    },
    reason: "Regression fixture: final confirm must block.",
  });
  const readAfterBlockedAction = createSafeBrowserAction({
    actionId: "safe_runner_read_after_block",
    createdAt: "2026-06-11T10:10:02.000Z",
    kind: "read",
    mode: "semi_automatic",
    target: {
      label: "Bekräfta köp",
      role: "button",
    },
    reason: "Would be skipped when stopOnBlocked is true.",
  });

  expect(runner.supportsRealBrowserExecution).toBe(false);

  const allowedResult = await runSafeBrowserActions([reviewAction], runner);

  expect(allowedResult).toEqual(
    expect.objectContaining({
      ok: true,
      blockedCount: 0,
      executedCount: 0,
      failedCount: 0,
      errors: [],
    }),
  );
  expect(allowedResult.results).toHaveLength(1);
  expect(allowedResult.results[0]).toEqual(
    expect.objectContaining({
      actionId: "safe_runner_review",
      status: "validated",
      message:
        "Action validated by no-op safe browser action runner. No browser action occurred.",
    }),
  );

  const blockedResult = await runSafeBrowserActions(
    [finalConfirmAction, readAfterBlockedAction],
    runner,
  );

  expect(blockedResult.ok).toBe(false);
  expect(blockedResult.blockedCount).toBe(1);
  expect(blockedResult.executedCount).toBe(0);
  expect(blockedResult.failedCount).toBe(0);
  expect(blockedResult.results.map((result) => result.status)).toEqual([
    "blocked",
    "skipped",
  ]);
  expect(blockedResult.results[0].validation.matchedDenylistTerms).toEqual([
    "Bekräfta köp",
  ]);
  expect(blockedResult.errors).toEqual(
    expect.arrayContaining([
      "Semi-automatic mode must not click or select final confirmation targets.",
    ]),
  );

  const continueAfterBlockedResult = await runSafeBrowserActions(
    [finalConfirmAction, reviewAction],
    runner,
    {
      stopOnBlocked: false,
    },
  );

  expect(continueAfterBlockedResult.ok).toBe(false);
  expect(continueAfterBlockedResult.blockedCount).toBe(1);
  expect(continueAfterBlockedResult.executedCount).toBe(0);
  expect(continueAfterBlockedResult.results.map((result) => result.status)).toEqual([
    "blocked",
    "validated",
  ]);
  expect(summarizeSafeBrowserActionRunnerResult(continueAfterBlockedResult)).toContain(
    "executed=0",
  );

  const missingRunnerResult = await runSafeBrowserActions([reviewAction], null);

  expect(missingRunnerResult.ok).toBe(false);
  expect(missingRunnerResult.errors).toEqual([
    "Safe browser action runner is required.",
  ]);
});

test("builds mock order safe action plans for no-op validation only", async () => {
  const fillPlan = buildMockOrderPageFillPlanFromAgentRequest(
    buildMockOrderPageAgentRequestFixture(),
  );
  const safePlan = buildMockOrderSafeActionPlan(fillPlan, {
    metadata: {
      fixture: "mock_order_safe_action_plan",
    },
  });

  expect(safePlan).toEqual(
    expect.objectContaining({
      mode: "semi_automatic",
      errors: [],
    }),
  );
  expect(safePlan.actions.length).toBeGreaterThan(20);
  expect(safePlan.validation).toEqual(
    expect.objectContaining({
      ok: true,
      errors: [],
    }),
  );
  expect(summarizeMockOrderSafeActionPlan(safePlan)).toContain("ok=true");

  const reviewAction = safePlan.actions.find(
    (action) => action.target.testId === "mock-order-review-button",
  );
  const confirmLabelActions = safePlan.actions.filter((action) =>
    action.target.testId === "mock-order-confirm-label",
  );
  const finalConfirmClickActions = safePlan.actions.filter(
    (action) =>
      action.kind === "click" &&
      (action.target.label === "Bekräfta köp" ||
        action.target.text === "Bekräfta köp" ||
        action.target.description?.includes("Bekräfta köp")),
  );

  expect(reviewAction).toEqual(
    expect.objectContaining({
      kind: "click",
      mode: "semi_automatic",
    }),
  );
  expect(validateSafeBrowserAction(reviewAction!)).toEqual(
    expect.objectContaining({
      ok: true,
      blocked: false,
      matchedDenylistTerms: [],
    }),
  );
  expect(confirmLabelActions.length).toBeGreaterThan(0);
  expect(confirmLabelActions.every((action) => action.kind !== "click")).toBe(true);
  expect(finalConfirmClickActions).toEqual([]);

  const runner = createNoopSafeBrowserActionRunner({
    runnerId: "mock_order_safe_plan_noop_runner",
  });
  const runnerResult = await runSafeBrowserActions(safePlan.actions, runner);

  expect(runnerResult).toEqual(
    expect.objectContaining({
      ok: true,
      blockedCount: 0,
      executedCount: 0,
      failedCount: 0,
      errors: [],
    }),
  );
  expect(
    runnerResult.results.every((result) => result.status === "validated"),
  ).toBe(true);

  const unsafePlan = {
    ...safePlan,
    actions: [
      ...safePlan.actions,
      createSafeBrowserAction({
        actionId: "mock_order_unsafe_final_confirm_click",
        createdAt: "2026-06-11T10:20:00.000Z",
        kind: "click",
        mode: "semi_automatic",
        target: {
          label: "Bekräfta köp",
          role: "button",
        },
        reason: "Regression fixture: unsafe final confirm click must block.",
      }),
    ],
  };
  const unsafeValidation = validateMockOrderSafeActionPlan(unsafePlan);

  expect(unsafeValidation.ok).toBe(false);
  expect(unsafeValidation.errors).toEqual(
    expect.arrayContaining([
      expect.stringContaining(
        "Semi-automatic mode must not click or select final confirmation targets.",
      ),
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

test("executes mock order safe action plans through the Playwright adapter", async ({
  page,
}) => {
  const fillPlan = buildMockOrderPageFillPlanFromAgentRequest(
    buildMockOrderPageAgentRequestFixture(),
  );
  const safePlan = buildMockOrderSafeActionPlan(fillPlan);

  await page.goto("/mock-broker/order");

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

  const adapterResult = await executeMockOrderSafeActionPlan(page, safePlan);

  expect(adapterResult).toEqual(
    expect.objectContaining({
      ok: true,
      errors: [],
    }),
  );
  expect(adapterResult.actionsExecuted).toBe(safePlan.actions.length);
  expect(adapterResult.diagnostics).toEqual(
    expect.objectContaining({
      ok: true,
      blocked: false,
      finalConfirmBlocked: false,
      failedCount: 0,
    }),
  );
  expect(adapterResult.diagnostics.executedCount).toBeGreaterThan(0);
  expect(adapterResult.diagnostics.executedCount).toBe(
    adapterResult.actionsExecuted,
  );
  expect(hasFinalConfirmBlocked(adapterResult.diagnostics)).toBe(false);
  expect(
    summarizeSafeBrowserActionExecutionDiagnostics(adapterResult.diagnostics),
  ).toContain("finalConfirmBlocked=false");

  const reviewPanel = page.locator("aside").filter({
    has: page.getByRole("heading", { name: "Review mock order" }),
  });

  await expect(reviewPanel).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Open mock confirmation page" }),
  ).toBeVisible();
  await expect(
    page.getByTestId(MOCK_ORDER_PAGE_AGENT_SELECTORS.submitDisabled.testId),
  ).toBeDisabled();

  await page.goto("/mock-broker/order");

  const unsafeFinalConfirmClick = createSafeBrowserAction({
    actionId: "playwright_adapter_unsafe_final_confirm_click",
    createdAt: "2026-06-11T11:00:00.000Z",
    kind: "click",
    mode: "semi_automatic",
    target: {
      label: "Bekräfta köp",
      role: "button",
    },
    reason: "Regression fixture: adapter must block final confirm.",
  });
  const blockedResult = await executeSafeBrowserActionsOnMockPage(page, [
    unsafeFinalConfirmClick,
    ...safePlan.actions,
  ]);

  expect(blockedResult).toEqual(
    expect.objectContaining({
      ok: false,
      actionsExecuted: 0,
      blockedActionId: "playwright_adapter_unsafe_final_confirm_click",
    }),
  );
  expect(blockedResult.errors).toEqual(
    expect.arrayContaining([
      "Semi-automatic mode must not click or select final confirmation targets.",
    ]),
  );
  expect(blockedResult.diagnostics).toEqual(
    expect.objectContaining({
      ok: false,
      blocked: true,
      finalConfirmBlocked: true,
    }),
  );
  expect(blockedResult.diagnostics.blockedCount).toBeGreaterThanOrEqual(1);
  expect(hasFinalConfirmBlocked(blockedResult.diagnostics)).toBe(true);
  await expect(
    page.getByTestId(MOCK_ORDER_PAGE_AGENT_SELECTORS.submitDisabled.testId),
  ).toBeDisabled();
});

test("mock fill runner stops safely on unsupported order mode or validation errors", async ({
  page,
}) => {
  const plan = buildMockOrderPageFillPlanFromAgentRequest(
    buildMockOrderPageAgentRequestFixture(),
  );
  const unsupportedOrderModePlan = {
    ...plan,
    values: plan.values.map((value) =>
      value.fieldKey === "orderMode" ? { ...value, value: "stop_loss" } : value,
    ),
  };

  await expect(
    openMockOrderPageWithPlan(page, unsupportedOrderModePlan),
  ).rejects.toThrow(/orderMode=advanced|Only Advanced/);

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
  await page
    .getByTestId(MOCK_ORDER_PAGE_AGENT_SELECTORS.account.testId)
    .fill("");
  await page
    .getByTestId(MOCK_ORDER_PAGE_AGENT_SELECTORS.reviewButton.testId)
    .click();

  await expectMockOrderValidationErrors(page, ["required"]);
  await expect(page.getByRole("link", {
    name: "Open mock confirmation page",
  })).toHaveCount(0);
  await expect(
    page.getByTestId(MOCK_ORDER_PAGE_AGENT_SELECTORS.submitDisabled.testId),
  ).toBeDisabled();
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
  await stubSettingsRemoteReads(page);
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
    await expect(page.getByText("Session-detection preview")).toBeHidden();
    await expect(page.getByText("Search-only preview")).toBeHidden();
    await expect(page.getByText("Instrument verification preview")).toBeHidden();
    await expect(page.getByText("Instrument page preview")).toBeHidden();
    await expect(page.getByText("Order page open preview")).toBeHidden();
    await expect(page.getByText("Advanced form-fill preview")).toBeHidden();
    await expect(page.getByText("Review click preview")).toBeHidden();
    await expect(
      page.getByText("BrokerExecutionResult eligibility preview"),
    ).toBeHidden();
    await expect(
      page.getByText("BrokerExecutionResult conversion preview"),
    ).toBeHidden();
    await expect(
      page.getByText("Execution record eligibility preview"),
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
  await expect(modal.getByText("Avanza dry-run request preview")).toBeVisible();
  await expect(
    modal.getByText(
      "Read-only preview. No Avanza runner exists. No broker submission.",
    ),
  ).toBeVisible();
  await expect(modal.getByText("Avanza dry-run only")).toBeVisible();
  await expect(modal.getByText("Advanced order mode")).toBeVisible();
  await expect(modal.getByText("Stop at confirmation modal")).toBeVisible();
  await expect(modal.getByText("No broker submission").first()).toBeVisible();
  await expect(modal.getByText("Final confirm disabled")).toBeVisible();
  await expect(modal.getByText("Manual account review")).toBeVisible();
  await expect(modal.getByText("STOP LOSS FIXTURE")).toBeVisible();
  await expect(modal.getByText("$118.00")).toBeVisible();
  await expect(modal.getByText("Session-detection preview")).toBeVisible();
  await expect(
    modal.getByText(
      "Read-only stub check. No browser control. No Avanza page touched.",
    ),
  ).toBeVisible();
  await expect(
    modal.getByRole("button", { name: "Check session-detection stub" }),
  ).toBeEnabled();
  await expect(modal.getByText("No browser control").first()).toBeVisible();
  await expect(modal.getByText("No Avanza page touched")).toBeVisible();
  await expect(modal.getByText("Search-only preview")).toBeVisible();
  await expect(
    modal.getByText(
      "Read-only stub check. No browser control. No Avanza page touched. No order page opened.",
    ),
  ).toBeVisible();
  await expect(
    modal.getByRole("button", { name: "Check search-only stub" }),
  ).toBeEnabled();
  await expect(modal.getByText("No order page").first()).toBeVisible();
  await expect(modal.getByText("No buy/sell click").first()).toBeVisible();
  await expect(modal.getByText("Instrument verification preview")).toBeVisible();
  await expect(
    modal.getByText(
      "Read-only stub check. No browser control. No Avanza page touched. No order page opened.",
    ),
  ).toBeVisible();
  await expect(
    modal.getByRole("button", {
      name: "Check instrument-verification stub",
    }),
  ).toBeEnabled();
  await expect(
    modal.getByText("Instrument verification only"),
  ).toBeVisible();
  await expect(modal.getByText("No form fill").first()).toBeVisible();
  await expect(modal.getByText("Instrument page preview")).toBeVisible();
  await expect(
    modal.getByRole("button", { name: "Check instrument-page stub" }),
  ).toBeEnabled();
  await expect(
    modal.getByText("Instrument page identity only").first(),
  ).toBeVisible();
  await expect(modal.getByText("Order page open preview")).toBeVisible();
  await expect(
    modal.getByText(
      "Read-only stub check. No browser control. No Avanza page touched. No real order page opened.",
    ),
  ).toBeVisible();
  await expect(
    modal.getByRole("button", { name: "Check order-page-open stub" }),
  ).toBeEnabled();
  await expect(modal.getByText("Order page open only").first()).toBeVisible();
  await expect(modal.getByText("No Granska click").first()).toBeVisible();
  await expect(modal.getByText("No Bekräfta click").first()).toBeVisible();
  await expect(modal.getByText("Advanced form-fill preview")).toBeVisible();
  await expect(
    modal.getByText(
      "Read-only stub check. No browser control. No Avanza page touched. No real form fields filled.",
    ),
  ).toBeVisible();
  await expect(
    modal.getByRole("button", { name: "Check Advanced form-fill stub" }),
  ).toBeEnabled();
  await expect(
    modal.getByText("Advanced form-fill only").first(),
  ).toBeVisible();
  await expect(
    modal.getByText("No real form fields filled").first(),
  ).toBeVisible();
  await expect(modal.getByText("Review click preview")).toBeVisible();
  await expect(
    modal.getByText(
      "Read-only stub check. No browser control. No real Granska. No Bekräfta. No broker result.",
    ),
  ).toBeVisible();
  await expect(
    modal.getByRole("button", { name: "Check review-click stub" }),
  ).toBeEnabled();
  await expect(
    modal.getByText("Review-click readback only").first(),
  ).toBeVisible();
  await expect(modal.getByText("No real Granska").first()).toBeVisible();
  await expect(
    modal.getByText("BrokerExecutionResult eligibility preview"),
  ).toBeVisible();
  await expect(
    modal.getByText(
      "Read-only eligibility check. No BrokerExecutionResult. No execution record. No Supabase write. No trade mutation.",
    ),
  ).toBeVisible();
  await expect(
    modal.getByRole("button", {
      name: "Check BrokerExecutionResult eligibility stub",
    }),
  ).toBeEnabled();
  await expect(modal.getByText("Eligibility check only").first()).toBeVisible();
  await expect(
    modal.getByText("No BrokerExecutionResult created").first(),
  ).toBeVisible();
  await expect(
    modal.getByText("BrokerExecutionResult conversion preview"),
  ).toBeVisible();
  await expect(
    modal.getByText(
      "Read-only stub check. Preview only. No real BrokerExecutionResult created.",
    ),
  ).toBeVisible();
  await expect(
    modal.getByRole("button", {
      name: "Check BrokerExecutionResult preview stub",
    }),
  ).toBeEnabled();
  await expect(
    modal.getByText("BrokerExecutionResult preview only").first(),
  ).toBeVisible();
  await expect(
    modal.getByText("Not a real BrokerExecutionResult").first(),
  ).toBeVisible();
  await expect(
    modal.getByText("Execution record eligibility preview"),
  ).toBeVisible();
  await expect(
    modal.getByText(
      "Read-only eligibility check. No execution record. No Supabase write. No trade mutation.",
    ),
  ).toBeVisible();
  await expect(
    modal.getByRole("button", {
      name: "Check execution-record eligibility stub",
    }),
  ).toBeEnabled();
  await expect(
    modal.getByText("Execution record eligibility only").first(),
  ).toBeVisible();
  await expect(modal.getByText("Dry-run bridge response preview")).toBeVisible();
  await expect(
    modal.getByText(
      "Read-only stub check. No browser actions. No broker submission.",
    ),
  ).toBeVisible();
  await expect(
    modal.getByRole("button", { name: "Test dry-run bridge stub" }),
  ).toBeEnabled();
  await expect(
    modal.getByText("No browser actions were executed"),
  ).toBeVisible();
  await expect(modal.getByText("No broker submission").first()).toBeVisible();
  await expect(modal.getByText("No broker result").first()).toBeVisible();
  await expect(modal.getByText("No trade mutation").first()).toBeVisible();
  await expect(modal.getByText("Stub only")).toBeVisible();
  await expect(modal.getByText("Avanza dry-run readiness")).toBeVisible();
  await expect(
    modal.getByText(
      "Read-only readiness checklist. Localhost self-check is informational only and does not start a runner.",
    ),
  ).toBeVisible();
  await expect(modal.getByText("Not ready to run")).toBeVisible();
  await expect(
    modal.getByText(
      "Not ready to run because the Avanza runner implementation is intentionally missing. This panel only shows readiness gates.",
    ),
  ).toBeVisible();
  await expect(
    modal.getByText("No Avanza dry-run runner is installed/available."),
  ).toBeVisible();
  await expect(modal.getByText("Dev tools enabled")).toBeVisible();
  await expect(
    modal.getByText("Execution mode is semi_automatic"),
  ).toBeVisible();
  await expect(
    modal.getByText("Avanza dry-run request is valid"),
  ).toBeVisible();
  await expect(modal.getByText("Default capability gate")).toBeVisible();
  await expect(
    modal.getByText("Default gate: blocked", { exact: false }),
  ).toBeVisible();
  await expect(
    modal.getByText("Dry-run classification: dry_run_only", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(
    modal.getByText("Broker submission disabled").first(),
  ).toBeVisible();
  await expect(modal.getByText("Final confirm disabled").first()).toBeVisible();
  await expect(modal.getByText("Automatic mode disabled")).toBeVisible();
  await expect(
    modal.getByText("Avanza runner implementation missing"),
  ).toBeVisible();
  await expect(
    modal.getByText("Avanza selectors/URLs missing intentionally"),
  ).toBeVisible();
  await expect(
    modal.getByText("User manual final confirmation required"),
  ).toBeVisible();
  await expect(
    modal.getByRole("button", {
      name: /run avanza|start avanza|open avanza|verify avanza|search avanza|start search|run search|start verify|run verify|open instrument|open order|start order/i,
    }),
  ).toHaveCount(0);
  await expect(modal.getByText("Bridge request envelope")).toBeVisible();
  await expect(modal.getByText("Execution Sandbox QA")).toBeVisible();
  await expect(modal.getByText("Safety checks")).toBeVisible();

  let searchOnlyMode:
    | "exact_match"
    | "ambiguous"
    | "no_match"
    | "blocked_order_flow" = "exact_match";

  await page.route("http://127.0.0.1:47831/search-only", async (route) => {
    const payload = route.request().postDataJSON() as {
      requestId?: string;
      expectedInstrument?: AvanzaSearchOnlyExpectedInstrument;
    };
    const completedAt = new Date().toISOString();
    const expected = payload.expectedInstrument ?? {
      ticker: "STOPLOSS",
      name: "Stop Loss Fixture",
      market: "Stockholm",
      currency: "SEK",
      instrumentType: "stock",
    };
    const baseCandidate: AvanzaSearchOnlyCandidate = {
      candidateId: "candidate_search_exact",
      displayName: expected.name ?? "Stop Loss Fixture",
      ticker: expected.ticker,
      market: expected.market,
      currency: expected.currency,
      instrumentType: expected.instrumentType,
      matchConfidence: 0.98,
      sanitizedSource: "playwright_search_only_stub",
      riskFlags: [],
      warnings: [],
    };
    const candidates: AvanzaSearchOnlyCandidate[] =
      searchOnlyMode === "ambiguous"
        ? [
            baseCandidate,
            {
              ...baseCandidate,
              candidateId: "candidate_search_duplicate",
              displayName: `${baseCandidate.displayName} duplicate`,
            },
          ]
        : searchOnlyMode === "no_match"
          ? [
              {
                ...baseCandidate,
                candidateId: "candidate_search_mismatch",
                displayName: "Synthetic mismatch candidate",
                ticker: "NO.MATCH",
              },
            ]
          : searchOnlyMode === "blocked_order_flow"
            ? [
                {
                  ...baseCandidate,
                  candidateId: "candidate_search_order_flow",
                  riskFlags: ["order_flow_detected"],
                },
              ]
            : [baseCandidate];
    const searchOnly = classifyAvanzaSearchOnlyCandidates(
      expected,
      candidates,
      {
        checkedAt: completedAt,
        requireMarketMatch: searchOnlyMode === "exact_match",
        requireCurrencyMatch: searchOnlyMode === "exact_match",
        requireInstrumentTypeMatch: searchOnlyMode === "exact_match",
      },
    );

    await route.fulfill({
      status: searchOnly.status === "blocked" ? 400 : 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      contentType: "application/json",
      body: JSON.stringify({
        version: "avanza_localhost_bridge_v1",
        ok: searchOnly.ok,
        bridgeVersion: "avanza_localhost_bridge_v1",
        requestId: payload.requestId ?? "playwright_search_only_request",
        receivedAt: completedAt,
        completedAt,
        searchOnly,
        message:
          "Localhost bridge search-only stub completed safely. No browser was controlled.",
        errors: [...searchOnly.errors],
        warnings: [
          "Search-only runner is not implemented.",
          "No browser actions were executed.",
          "No Avanza page was touched.",
          "No order page was opened.",
          ...searchOnly.warnings,
        ],
        metadata: {
          localhost_bridge_stub: true,
          search_only_endpoint_stub: true,
          no_browser_control: true,
          no_browser_actions_executed: true,
          no_avanza_page_touched: true,
          no_order_page_opened: true,
          no_broker_submission: true,
          no_broker_result_created: true,
          no_trade_mutation: true,
        },
      }),
    });
  });

  await modal
    .getByRole("button", { name: "Check search-only stub" })
    .click();
  await expect(modal.getByText("Exact instrument match found.")).toBeVisible();
  await expect(modal.getByText("exact match")).toBeVisible();
  await expect(modal.getByText("Selected candidate")).toBeVisible();
  await expect(modal.getByText("Stop Loss Fixture").first()).toBeVisible();
  await expect(
    modal.getByText("Ready for future instrument-verification phase", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(modal.getByText("Search-only status")).toBeVisible();
  await expect(modal.getByText("Exact match found")).toBeVisible();
  await expect(modal.getByText("No Order Page Opened")).toBeVisible();
  await expect(modal.getByText("No Broker Submission")).toBeVisible();
  await expect(
    modal.getByRole("button", {
      name: /run avanza|start avanza|open avanza|verify avanza|search avanza|start search|run search|start verify|run verify|open instrument|open order|start order/i,
    }),
  ).toHaveCount(0);

  let instrumentVerificationMode:
    | "verified"
    | "rejected_ticker"
    | "ambiguous_missing_currency"
    | "blocked_order_flow" = "verified";

  await page.route(
    "http://127.0.0.1:47831/instrument-verification",
    async (route) => {
      const payload = route.request().postDataJSON() as {
        requestId?: string;
        expectedInstrument?: AvanzaSearchOnlyExpectedInstrument;
        searchOnlyResult?: ReturnType<typeof classifyAvanzaSearchOnlyCandidates>;
        selectedCandidate?: AvanzaSearchOnlyCandidate;
      };
      const completedAt = new Date().toISOString();
      const expected = payload.expectedInstrument ?? {
        ticker: "STOPLOSS",
        name: "Stop Loss Fixture",
        market: "Stockholm",
        currency: "SEK",
        instrumentType: "stock",
      };
      const baseCandidate: AvanzaSearchOnlyCandidate =
        payload.selectedCandidate ?? {
          candidateId: "candidate_instrument_verified",
          displayName: expected.name ?? "Stop Loss Fixture",
          ticker: expected.ticker,
          market: expected.market,
          currency: expected.currency,
          instrumentType: expected.instrumentType,
          matchConfidence: 0.98,
          sanitizedSource: "playwright_instrument_verification_stub",
          riskFlags: [],
          warnings: [],
        };
      const selectedCandidate: AvanzaSearchOnlyCandidate =
        instrumentVerificationMode === "rejected_ticker"
          ? {
              ...baseCandidate,
              candidateId: "candidate_instrument_rejected_ticker",
              ticker: `${baseCandidate.ticker}.MISMATCH`,
            }
          : instrumentVerificationMode === "ambiguous_missing_currency"
            ? {
                ...baseCandidate,
                candidateId: "candidate_instrument_ambiguous_currency",
                currency: undefined,
              }
            : instrumentVerificationMode === "blocked_order_flow"
              ? {
                  ...baseCandidate,
                  candidateId: "candidate_instrument_order_flow",
                  riskFlags: ["order_flow_detected"],
                }
              : baseCandidate;
      const searchOnlyResult =
        payload.searchOnlyResult ??
        classifyAvanzaSearchOnlyCandidates(expected, [selectedCandidate], {
          checkedAt: completedAt,
          requireMarketMatch: false,
          requireCurrencyMatch: false,
          requireInstrumentTypeMatch: false,
        });
      const instrumentVerification = verifyAvanzaInstrument({
        expectedInstrument: expected,
        searchOnlyResult: {
          ...searchOnlyResult,
          status: "exact_match",
          ok: true,
          selectedCandidate,
          candidates: [selectedCandidate],
          errors: [],
          blockers: [],
        },
        selectedCandidate,
        metadata: {
          instrumentVerificationOnly: true,
          noOrderPage: true,
          noBuySellClick: true,
          noFormFill: true,
          noBrokerSubmission: true,
          noBrokerResult: true,
        },
      });

      await route.fulfill({
        status: instrumentVerification.status === "blocked" ? 400 : 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        contentType: "application/json",
        body: JSON.stringify({
          version: "avanza_localhost_bridge_v1",
          ok: instrumentVerification.ok,
          bridgeVersion: "avanza_localhost_bridge_v1",
          requestId:
            payload.requestId ??
            "playwright_instrument_verification_request",
          receivedAt: completedAt,
          completedAt,
          instrumentVerification,
          message:
            "Localhost bridge instrument-verification stub completed safely. No browser was controlled.",
          errors: [...instrumentVerification.errors],
          warnings: [
            "Instrument verification runner is not implemented.",
            "No browser actions were executed.",
            "No Avanza page was touched.",
            "No order page was opened.",
            "No form was filled.",
            ...instrumentVerification.warnings,
          ],
          metadata: {
            localhost_bridge_stub: true,
            instrument_verification_endpoint_stub: true,
            no_browser_control: true,
            no_browser_actions_executed: true,
            no_avanza_page_touched: true,
            no_order_page_opened: true,
            no_buy_sell_click: true,
            no_form_fill: true,
            no_broker_submission: true,
            no_broker_result_created: true,
            no_trade_mutation: true,
          },
        }),
      });
    },
  );

  await modal
    .getByRole("button", { name: "Check instrument-verification stub" })
    .click();
  await expect(modal.getByText("Instrument verified.")).toBeVisible();
  await expect(modal.getByText("verified")).toBeVisible();
  await expect(modal.getByText("Field checks")).toBeVisible();
  await expect(modal.getByText("Ready for future instrument-page phase", {
    exact: false,
  })).toBeVisible();
  await expect(modal.getByText("Instrument verification status")).toBeVisible();
  await expect(modal.getByText("Instrument verified")).toBeVisible();
  await expect(modal.getByText("Instrument no order page opened")).toBeVisible();
  await expect(modal.getByText("No Order Page Opened")).toBeVisible();
  await expect(modal.getByText("No Buy/Sell Click")).toBeVisible();
  await expect(modal.getByText("No Broker Submission")).toBeVisible();
  await expect(
    modal.getByRole("button", {
      name: /run avanza|start avanza|open avanza|verify avanza|search avanza|start search|run search|start verify|run verify|open instrument|open order|start order/i,
    }),
  ).toHaveCount(0);

  let instrumentPageMode:
    | "page_identified"
    | "buy_sell_visible"
    | "page_mismatch"
    | "blocked_order_page" = "page_identified";

  await page.route("http://127.0.0.1:47831/instrument-page", async (route) => {
    const payload = route.request().postDataJSON() as {
      requestId?: string;
      expectedInstrument?: AvanzaSearchOnlyExpectedInstrument;
      instrumentVerificationResult?: ReturnType<typeof verifyAvanzaInstrument>;
    };
    const completedAt = new Date().toISOString();
    const expected = payload.expectedInstrument ?? {
      ticker: "STOPLOSS",
      name: "Stop Loss Fixture",
      market: "Stockholm",
      currency: "SEK",
      instrumentType: "stock",
    };
    const verifiedInstrument =
      payload.instrumentVerificationResult ??
      verifyAvanzaInstrument({
        expectedInstrument: expected,
        searchOnlyResult: classifyAvanzaSearchOnlyCandidates(
          expected,
          [
            {
              candidateId: "candidate_page_verified",
              displayName: expected.name ?? "Stop Loss Fixture",
              ticker: expected.ticker,
              market: expected.market,
              currency: expected.currency,
              instrumentType: expected.instrumentType,
              matchConfidence: 0.98,
              sanitizedSource: "playwright_instrument_page_stub",
              riskFlags: [],
              warnings: [],
            },
          ],
          {
            checkedAt: completedAt,
            requireMarketMatch: false,
            requireCurrencyMatch: false,
            requireInstrumentTypeMatch: false,
          },
        ),
        metadata: {
          instrumentVerificationOnly: true,
          noOrderPage: true,
          noBuySellClick: true,
          noFormFill: true,
          noBrokerSubmission: true,
          noBrokerResult: true,
        },
      });
    const pageIdentity: AvanzaInstrumentPageIdentity = {
      ticker:
        instrumentPageMode === "page_mismatch"
          ? `${expected.ticker}.MISMATCH`
          : expected.ticker,
      name: expected.name,
      market: expected.market,
      currency: expected.currency,
      instrumentType: expected.instrumentType,
      sanitizedTitle: `${expected.name ?? expected.ticker} - synthetic instrument page`,
      sanitizedHostClass: "avanza",
      pageContext:
        instrumentPageMode === "blocked_order_page"
          ? "order_page"
          : "instrument_page",
      matchConfidence: 0.98,
      prohibitedControls: {
        buyButtonVisible: instrumentPageMode === "buy_sell_visible",
        sellButtonVisible: instrumentPageMode === "buy_sell_visible",
        orderFormVisible: false,
        finalConfirmVisible: false,
      },
      sensitiveSignals: {
        accountDataDetected: false,
        balanceDataDetected: false,
        holdingsDataDetected: false,
        sensitiveDataDetected: false,
      },
    };
    const instrumentPage = evaluateAvanzaInstrumentPage(
      {
        expectedInstrument: expected,
        instrumentVerificationResult: verifiedInstrument,
        pageIdentity,
        metadata: {
          instrumentPageIdentityOnly: true,
          noOrderPage: true,
          noBuySellClick: true,
          noFormFill: true,
          noBrokerSubmission: true,
          noBrokerResult: true,
          noTradeMutation: true,
        },
      },
      {
        checkedAt: completedAt,
        allowProhibitedControlVisibility: true,
      },
    );

    await route.fulfill({
      status: instrumentPage.status === "blocked" ? 400 : 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      contentType: "application/json",
      body: JSON.stringify({
        version: "avanza_localhost_bridge_v1",
        ok: instrumentPage.ok,
        bridgeVersion: "avanza_localhost_bridge_v1",
        requestId: payload.requestId ?? "playwright_instrument_page_request",
        receivedAt: completedAt,
        completedAt,
        instrumentPage,
        message:
          "Localhost bridge instrument-page stub completed safely. No browser was controlled.",
        errors: [...instrumentPage.errors],
        warnings: [
          "Instrument page runner is not implemented.",
          "No browser actions were executed.",
          "No Avanza page was touched.",
          "No order page was opened.",
          "No buy/sell click occurred.",
          "No form was filled.",
          ...instrumentPage.warnings,
        ],
        metadata: {
          localhost_bridge_stub: true,
          instrument_page_endpoint_stub: true,
          no_browser_control: true,
          no_browser_actions_executed: true,
          no_avanza_page_touched: true,
          no_order_page_opened: true,
          no_buy_sell_click: true,
          no_form_fill: true,
          no_broker_submission: true,
          no_broker_result_created: true,
          no_trade_mutation: true,
        },
      }),
    });
  });

  await modal
    .getByRole("button", { name: "Check instrument-page stub" })
    .click();
  await expect(modal.getByText("Instrument page identified.")).toBeVisible();
  await expect(modal.getByText("page identified")).toBeVisible();
  await expect(modal.getByText("Page identity")).toBeVisible();
  await expect(modal.getByText("Field checks")).toBeVisible();
  await expect(
    modal.getByText("Ready for future order-page-open design", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(modal.getByText("Instrument page status")).toBeVisible();
  await expect(modal.getByText("Page identified")).toBeVisible();
  await expect(modal.getByText("Instrument page no order page opened")).toBeVisible();
  await expect(modal.getByText("No Order Page Opened")).toBeVisible();
  await expect(modal.getByText("No Buy/Sell Click")).toBeVisible();
  await expect(modal.getByText("No Broker Submission")).toBeVisible();
  await expect(
    modal.getByRole("button", {
      name: /run avanza|start avanza|open avanza|verify avanza|search avanza|start search|run search|start verify|run verify|open instrument|open order|start order/i,
    }),
  ).toHaveCount(0);

  let orderPageOpenMode:
    | "order_page_opened_buy"
    | "order_page_opened_sell"
    | "wrong_action_opened"
    | "order_page_mismatch_ticker"
    | "order_page_mismatch_currency"
    | "blocked_final_confirm"
    | "blocked_review_click_attempt" = "order_page_opened_buy";

  await page.route("http://127.0.0.1:47831/order-page-open", async (route) => {
    const payload = route.request().postDataJSON() as {
      requestId?: string;
      dryRunOrderInput?: ReturnType<typeof createAvanzaDryRunOrderInput>;
      instrumentPageResult?: ReturnType<typeof evaluateAvanzaInstrumentPage>;
      attemptedAction?: "buy" | "sell";
    };
    const completedAt = new Date().toISOString();
    const baseDryRunOrderInput =
      payload.dryRunOrderInput ??
      createAvanzaDryRunOrderInput({
        action: "sell",
        instrument: {
          ticker: "STOPLOSS",
          name: "Stop Loss Fixture",
          market: "Stockholm",
          currency: "SEK",
          instrumentType: "stock",
        },
        quantity: 1,
        price: 118,
        createdAt: completedAt,
      });
    const expectedAction: "buy" | "sell" =
      orderPageOpenMode === "order_page_opened_buy" ? "buy" : "sell";
    const dryRunOrderInput = {
      ...baseDryRunOrderInput,
      action: expectedAction,
    };
    const expectedInstrument = {
      ticker: dryRunOrderInput.instrument.ticker,
      name: dryRunOrderInput.instrument.name,
      market: dryRunOrderInput.instrument.market,
      currency: dryRunOrderInput.instrument.currency,
      instrumentType: dryRunOrderInput.instrument.instrumentType,
    };
    const fallbackInstrumentPage =
      payload.instrumentPageResult ??
      evaluateAvanzaInstrumentPage(
        {
          expectedInstrument,
          instrumentVerificationResult: verifyAvanzaInstrument({
            expectedInstrument,
            searchOnlyResult: classifyAvanzaSearchOnlyCandidates(
              expectedInstrument,
              [
                {
                  candidateId: "candidate_order_page_open_verified",
                  displayName:
                    expectedInstrument.name ?? expectedInstrument.ticker,
                  ticker: expectedInstrument.ticker,
                  market: expectedInstrument.market,
                  currency: expectedInstrument.currency,
                  instrumentType: expectedInstrument.instrumentType,
                  matchConfidence: 0.98,
                  sanitizedSource: "playwright_order_page_open_stub",
                  riskFlags: [],
                  warnings: [],
                },
              ],
              {
                checkedAt: completedAt,
                requireMarketMatch: false,
                requireCurrencyMatch: false,
                requireInstrumentTypeMatch: false,
              },
            ),
          }),
          pageIdentity: {
            ticker: expectedInstrument.ticker,
            name: expectedInstrument.name,
            market: expectedInstrument.market,
            currency: expectedInstrument.currency,
            instrumentType: expectedInstrument.instrumentType,
            sanitizedTitle: `${expectedInstrument.name ?? expectedInstrument.ticker} - synthetic instrument page`,
            sanitizedHostClass: "avanza",
            pageContext: "instrument_page",
            matchConfidence: 0.98,
          },
        },
        { checkedAt: completedAt },
      );
    const identityAction =
      orderPageOpenMode === "wrong_action_opened"
        ? expectedAction === "buy"
          ? "sell"
          : "buy"
        : expectedAction;
    const orderPageIdentity: AvanzaOrderPageIdentity = {
      action: identityAction,
      ticker:
        orderPageOpenMode === "order_page_mismatch_ticker"
          ? `${expectedInstrument.ticker}.MISMATCH`
          : expectedInstrument.ticker,
      name: expectedInstrument.name,
      market: expectedInstrument.market,
      currency:
        orderPageOpenMode === "order_page_mismatch_currency"
          ? "NOK"
          : expectedInstrument.currency,
      instrumentType: expectedInstrument.instrumentType,
      pageContext: "order_page",
      sanitizedTitle: `${expectedInstrument.name ?? expectedInstrument.ticker} - synthetic ${identityAction} order`,
      sanitizedHostClass: "avanza",
      controls: {
        reviewButtonVisible: true,
        finalConfirmVisible: orderPageOpenMode === "blocked_final_confirm",
      },
      formSignals: {
        quantityFieldVisible: true,
        priceFieldVisible: true,
        accountFieldVisible: true,
        anyFieldPrefilled: false,
      },
    };
    const orderPageOpen = evaluateAvanzaOrderPageOpen(
      {
        dryRunOrderInput,
        instrumentPageResult: fallbackInstrumentPage,
        orderPageIdentity,
        attemptedAction: expectedAction,
        metadata: {
          reviewButtonClickedOrAttempted:
            orderPageOpenMode === "blocked_review_click_attempt",
        },
      },
      { checkedAt: completedAt },
    );
    const status =
      orderPageOpen.status === "blocked" ||
      orderPageOpen.status === "prohibited_form_interaction_detected"
        ? 400
        : orderPageOpen.status === "instrument_page_not_ready" ||
            orderPageOpen.status === "unavailable"
          ? 501
          : 200;

    await route.fulfill({
      status,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      contentType: "application/json",
      body: JSON.stringify({
        version: "avanza_localhost_bridge_v1",
        ok: orderPageOpen.ok,
        bridgeVersion: "avanza_localhost_bridge_v1",
        requestId: payload.requestId ?? "playwright_order_page_open_request",
        receivedAt: completedAt,
        completedAt,
        orderPageOpen,
        message:
          "Localhost bridge order-page-open stub completed safely. No browser was controlled.",
        errors: [...orderPageOpen.errors],
        warnings: [
          "Order-page-open runner is not implemented.",
          "No browser actions were executed.",
          "No Avanza page was touched.",
          "No form fields were filled.",
          "No Granska click occurred.",
          "No Bekräfta click occurred.",
          ...orderPageOpen.warnings,
        ],
        metadata: {
          localhost_bridge_stub: true,
          order_page_open_endpoint_stub: true,
          no_browser_control: true,
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
      }),
    });
  });

  await modal
    .getByRole("button", { name: "Check order-page-open stub" })
    .click();
  await expect(
    modal.getByText("Order page opened for expected buy action."),
  ).toBeVisible();
  await expect(modal.getByText("order page opened")).toBeVisible();
  await expect(modal.getByText("Order page identity")).toBeVisible();
  await expect(modal.getByText("Field checks")).toBeVisible();
  await expect(
    modal.getByText("Ready for future form-fill design", { exact: false }),
  ).toBeVisible();
  await expect(modal.getByText("Order page open status")).toBeVisible();
  await expect(modal.getByText("Expected action")).toBeVisible();
  await expect(modal.getByText("buy")).toBeVisible();
  await expect(modal.getByText("Order page opened")).toBeVisible();
  await expect(modal.getByText("No Form Fill")).toBeVisible();
  await expect(modal.getByText("No Granska Click")).toBeVisible();
  await expect(modal.getByText("No Bekräfta Click")).toBeVisible();
  await expect(modal.getByText("No Broker Submission")).toBeVisible();
  await expect(
    modal.getByRole("button", {
      name: /run avanza|start avanza|open avanza|verify avanza|search avanza|start search|run search|start verify|run verify|open instrument|open order|start order|fill avanza|review avanza|click granska|click bekräfta/i,
    }),
  ).toHaveCount(0);

  orderPageOpenMode = "order_page_opened_sell";
  await modal
    .getByRole("button", { name: "Check order-page-open stub" })
    .click();
  await expect(
    modal.getByText("Order page opened for expected sell action."),
  ).toBeVisible();
  await expect(modal.getByText("sell")).toBeVisible();

  orderPageOpenMode = "wrong_action_opened";
  await modal
    .getByRole("button", { name: "Check order-page-open stub" })
    .click();
  await expect(
    modal.getByText("Wrong action opened: manual review required."),
  ).toBeVisible();
  await expect(modal.getByText("order_page_wrong_action")).toBeVisible();

  orderPageOpenMode = "order_page_mismatch_ticker";
  await modal
    .getByRole("button", { name: "Check order-page-open stub" })
    .click();
  await expect(
    modal.getByText("Order page mismatch: manual review required."),
  ).toBeVisible();
  await expect(modal.getByText("order_page_wrong_instrument")).toBeVisible();

  orderPageOpenMode = "order_page_mismatch_currency";
  await modal
    .getByRole("button", { name: "Check order-page-open stub" })
    .click();
  await expect(
    modal.getByText("Order page mismatch: manual review required."),
  ).toBeVisible();

  orderPageOpenMode = "blocked_final_confirm";
  await modal
    .getByRole("button", { name: "Check order-page-open stub" })
    .click();
  await expect(
    modal.getByText("Blocked: Final-confirm-like control detected", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(modal.getByText("final_confirm_detected")).toBeVisible();

  orderPageOpenMode = "blocked_review_click_attempt";
  await modal
    .getByRole("button", { name: "Check order-page-open stub" })
    .click();
  await expect(
    modal.getByText("Blocked: Review/Granska click was attempted."),
  ).toBeVisible();
  await expect(
    modal.getByText("review_button_clicked_or_attempted"),
  ).toBeVisible();

  let advancedFormFillMode:
    | "form_filled"
    | "field_mismatch_quantity"
    | "field_mismatch_price"
    | "validation_error"
    | "unsupported_order_mode_stop_loss"
    | "prohibited_review_detected"
    | "prohibited_final_confirm_detected"
    | "blocked_keyboard_submit"
    | "order_page_not_ready" = "form_filled";

  await page.route(
    "http://127.0.0.1:47831/advanced-form-fill",
    async (route) => {
      const payload = route.request().postDataJSON() as {
        requestId?: string;
        dryRunOrderInput?: ReturnType<typeof createAvanzaDryRunOrderInput>;
        orderPageOpenResult?: ReturnType<typeof evaluateAvanzaOrderPageOpen>;
      };
      const completedAt = new Date().toISOString();
      const dryRunOrderInput =
        payload.dryRunOrderInput ??
        createAvanzaDryRunOrderInput({
          action: "buy",
          instrument: {
            ticker: "ADV.FILL",
            name: "Advanced Fill Fixture",
            market: "Stockholm",
            currency: "SEK",
            instrumentType: "stock",
          },
          quantity: 4,
          price: 101.25,
          createdAt: completedAt,
        });
      const expectedInstrument = {
        ticker: dryRunOrderInput.instrument.ticker,
        name: dryRunOrderInput.instrument.name,
        market: dryRunOrderInput.instrument.market,
        currency: dryRunOrderInput.instrument.currency,
        instrumentType: dryRunOrderInput.instrument.instrumentType,
      };
      const fallbackInstrumentPage = evaluateAvanzaInstrumentPage(
        {
          expectedInstrument,
          instrumentVerificationResult: verifyAvanzaInstrument({
            expectedInstrument,
            searchOnlyResult: classifyAvanzaSearchOnlyCandidates(
              expectedInstrument,
              [
                {
                  candidateId: "candidate_advanced_form_fill_verified",
                  displayName:
                    expectedInstrument.name ?? expectedInstrument.ticker,
                  ticker: expectedInstrument.ticker,
                  market: expectedInstrument.market,
                  currency: expectedInstrument.currency,
                  instrumentType: expectedInstrument.instrumentType,
                  matchConfidence: 0.98,
                  sanitizedSource: "playwright_advanced_form_fill_stub",
                  riskFlags: [],
                  warnings: [],
                },
              ],
              {
                checkedAt: completedAt,
                requireMarketMatch: false,
                requireCurrencyMatch: false,
                requireInstrumentTypeMatch: false,
              },
            ),
          }),
          pageIdentity: {
            ticker: expectedInstrument.ticker,
            name: expectedInstrument.name,
            market: expectedInstrument.market,
            currency: expectedInstrument.currency,
            instrumentType: expectedInstrument.instrumentType,
            sanitizedTitle: `${expectedInstrument.name ?? expectedInstrument.ticker} - synthetic instrument page`,
            sanitizedHostClass: "avanza",
            pageContext: "instrument_page",
            matchConfidence: 0.98,
          },
        },
        { checkedAt: completedAt },
      );
      const fallbackOrderPageOpen = evaluateAvanzaOrderPageOpen(
        {
          dryRunOrderInput,
          instrumentPageResult: fallbackInstrumentPage,
          attemptedAction: dryRunOrderInput.action,
          orderPageIdentity: {
            action: dryRunOrderInput.action,
            ticker: expectedInstrument.ticker,
            name: expectedInstrument.name,
            market: expectedInstrument.market,
            currency: expectedInstrument.currency,
            instrumentType: expectedInstrument.instrumentType,
            pageContext: "order_page",
            sanitizedTitle: `${expectedInstrument.name ?? expectedInstrument.ticker} - synthetic Advanced order`,
            sanitizedHostClass: "avanza",
            controls: {
              reviewButtonVisible: true,
              finalConfirmVisible: false,
            },
            formSignals: {
              quantityFieldVisible: true,
              priceFieldVisible: true,
              accountFieldVisible: true,
              anyFieldPrefilled: false,
            },
          },
        },
        { checkedAt: completedAt },
      );
      const orderPageOpen =
        advancedFormFillMode === "order_page_not_ready"
          ? {
              ...fallbackOrderPageOpen,
              ok: false,
              status: "order_page_mismatch" as const,
              blockers: ["Order page is not ready."],
              errors: ["Order page is not ready."],
            }
          : payload.orderPageOpenResult ?? fallbackOrderPageOpen;
      const formState: AvanzaAdvancedFormState = {
        action: dryRunOrderInput.action,
        ticker: expectedInstrument.ticker,
        name: expectedInstrument.name,
        market: expectedInstrument.market,
        currency: expectedInstrument.currency,
        instrumentType: expectedInstrument.instrumentType,
        orderMode:
          advancedFormFillMode === "unsupported_order_mode_stop_loss"
            ? "stop_loss"
            : "advanced",
        quantity:
          advancedFormFillMode === "field_mismatch_quantity"
            ? dryRunOrderInput.quantity + 1
            : dryRunOrderInput.quantity,
        price:
          advancedFormFillMode === "field_mismatch_price"
            ? dryRunOrderInput.price + 1
            : dryRunOrderInput.price,
        controls: {
          reviewButtonVisible: true,
          reviewButtonClickedOrAttempted:
            advancedFormFillMode === "prohibited_review_detected",
          finalConfirmVisible:
            advancedFormFillMode ===
            "prohibited_final_confirm_detected",
          finalConfirmClickedOrAttempted:
            advancedFormFillMode ===
            "prohibited_final_confirm_detected",
        },
        interactions: {
          keyboardSubmitDetected:
            advancedFormFillMode === "blocked_keyboard_submit",
          accountChanged: false,
          unsupportedFieldTouched: false,
        },
        sensitiveSignals: {
          accountDataDetected: false,
          balanceDataDetected: false,
          holdingsDataDetected: false,
          sensitiveDataDetected: false,
        },
        validation: {
          validationErrorsVisible:
            advancedFormFillMode === "validation_error",
          validationMessages:
            advancedFormFillMode === "validation_error"
              ? ["Synthetic Advanced validation error."]
              : [],
        },
      };
      const advancedFormFill = evaluateAvanzaAdvancedFormFill(
        {
          dryRunOrderInput,
          orderPageOpenResult: orderPageOpen,
          formState,
          metadata: {
            advanced_form_fill_preview_only: true,
            noReviewClick: true,
            noFinalConfirmClick: true,
            noBrokerSubmission: true,
          },
        },
        { checkedAt: completedAt },
      );
      const status =
        advancedFormFill.status === "form_filled"
          ? 200
          : advancedFormFill.status === "order_page_not_ready" ||
              advancedFormFill.status === "unavailable"
            ? 501
            : 400;

      await route.fulfill({
        status,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        contentType: "application/json",
        body: JSON.stringify({
          version: "avanza_localhost_bridge_v1",
          ok: advancedFormFill.ok,
          bridgeVersion: "avanza_localhost_bridge_v1",
          requestId:
            payload.requestId ?? "playwright_advanced_form_fill_request",
          receivedAt: completedAt,
          completedAt,
          advancedFormFill,
          message:
            "Localhost bridge advanced form-fill stub completed safely. No browser was controlled.",
          errors: [...advancedFormFill.errors],
          warnings: [
            "Advanced form-fill runner is not implemented.",
            "No browser actions were executed.",
            "No Avanza page was touched.",
            "No real form fields were filled.",
            "No Granska click occurred.",
            "No Bekräfta click occurred.",
            ...advancedFormFill.warnings,
          ],
          metadata: {
            localhost_bridge_stub: true,
            advanced_form_fill_endpoint_stub: true,
            no_browser_control: true,
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
        }),
      });
    },
  );

  let reviewClickMode:
    | "confirmation_ready_buy"
    | "confirmation_ready_sell"
    | "confirmation_mismatch_quantity"
    | "confirmation_mismatch_price"
    | "validation_error"
    | "prohibited_final_confirm_detected"
    | "blocked_keyboard_submit"
    | "blocked_sensitive" = "confirmation_ready_buy";

  await page.route("http://127.0.0.1:47831/review-click", async (route) => {
    const payload = route.request().postDataJSON() as {
      requestId?: string;
      dryRunOrderInput?: ReturnType<typeof createAvanzaDryRunOrderInput>;
      advancedFormFillResult?: AvanzaAdvancedFormFillResult;
      reviewClickAttempted?: boolean;
      reviewLabel?: string;
    };
    const completedAt = new Date().toISOString();
    const baseDryRunOrderInput =
      payload.dryRunOrderInput ??
      createAvanzaDryRunOrderInput({
        action: "buy",
        instrument: {
          ticker: "REVIEW.CLICK",
          name: "Review Click Fixture",
          market: "Stockholm",
          currency: "SEK",
          instrumentType: "stock",
        },
        quantity: 4,
        price: 101.25,
        createdAt: completedAt,
      });
    const dryRunOrderInput =
      reviewClickMode === "confirmation_ready_sell"
        ? {
            ...baseDryRunOrderInput,
            action: "sell" as const,
          }
        : {
            ...baseDryRunOrderInput,
            action: "buy" as const,
          };
    const expectedInstrument = {
      ticker: dryRunOrderInput.instrument.ticker,
      name: dryRunOrderInput.instrument.name,
      market: dryRunOrderInput.instrument.market,
      currency: dryRunOrderInput.instrument.currency,
      instrumentType: dryRunOrderInput.instrument.instrumentType,
    };
    const fallbackInstrumentPage = evaluateAvanzaInstrumentPage(
      {
        expectedInstrument,
        instrumentVerificationResult: verifyAvanzaInstrument({
          expectedInstrument,
          searchOnlyResult: classifyAvanzaSearchOnlyCandidates(
            expectedInstrument,
            [
              {
                candidateId: "candidate_review_click_verified",
                displayName: expectedInstrument.name ?? expectedInstrument.ticker,
                ticker: expectedInstrument.ticker,
                market: expectedInstrument.market,
                currency: expectedInstrument.currency,
                instrumentType: expectedInstrument.instrumentType,
                matchConfidence: 0.98,
                sanitizedSource: "playwright_review_click_stub",
                riskFlags: [],
                warnings: [],
              },
            ],
            {
              checkedAt: completedAt,
              requireMarketMatch: false,
              requireCurrencyMatch: false,
              requireInstrumentTypeMatch: false,
            },
          ),
        }),
        pageIdentity: {
          ticker: expectedInstrument.ticker,
          name: expectedInstrument.name,
          market: expectedInstrument.market,
          currency: expectedInstrument.currency,
          instrumentType: expectedInstrument.instrumentType,
          sanitizedTitle: `${expectedInstrument.name ?? expectedInstrument.ticker} - synthetic instrument page`,
          sanitizedHostClass: "avanza",
          pageContext: "instrument_page",
          matchConfidence: 0.98,
        },
      },
      { checkedAt: completedAt },
    );
    const fallbackOrderPageOpen = evaluateAvanzaOrderPageOpen(
      {
        dryRunOrderInput,
        instrumentPageResult: fallbackInstrumentPage,
        attemptedAction: dryRunOrderInput.action,
        orderPageIdentity: {
          action: dryRunOrderInput.action,
          ticker: expectedInstrument.ticker,
          name: expectedInstrument.name,
          market: expectedInstrument.market,
          currency: expectedInstrument.currency,
          instrumentType: expectedInstrument.instrumentType,
          pageContext: "order_page",
          sanitizedTitle: `${expectedInstrument.name ?? expectedInstrument.ticker} - synthetic Advanced order`,
          sanitizedHostClass: "avanza",
          controls: {
            reviewButtonVisible: true,
            finalConfirmVisible: false,
          },
          formSignals: {
            quantityFieldVisible: true,
            priceFieldVisible: true,
            accountFieldVisible: true,
            anyFieldPrefilled: false,
          },
        },
      },
      { checkedAt: completedAt },
    );
    const fallbackAdvancedFormFill = evaluateAvanzaAdvancedFormFill(
      {
        dryRunOrderInput,
        orderPageOpenResult: fallbackOrderPageOpen,
        formState: {
          action: dryRunOrderInput.action,
          ticker: expectedInstrument.ticker,
          name: expectedInstrument.name,
          market: expectedInstrument.market,
          currency: expectedInstrument.currency,
          instrumentType: expectedInstrument.instrumentType,
          orderMode: "advanced",
          quantity: dryRunOrderInput.quantity,
          price: dryRunOrderInput.price,
          controls: {
            reviewButtonVisible: true,
            reviewButtonClickedOrAttempted: false,
            finalConfirmVisible: false,
            finalConfirmClickedOrAttempted: false,
          },
          interactions: {
            keyboardSubmitDetected: false,
            accountChanged: false,
            unsupportedFieldTouched: false,
          },
          sensitiveSignals: {
            accountDataDetected: false,
            balanceDataDetected: false,
            holdingsDataDetected: false,
            sensitiveDataDetected: false,
          },
          validation: {
            validationErrorsVisible: false,
            validationMessages: [],
          },
        },
        metadata: {
          advanced_form_fill_preview_only: true,
          noReviewClick: true,
          noFinalConfirmClick: true,
          noBrokerSubmission: true,
        },
      },
      { checkedAt: completedAt },
    );
    const confirmationReadback: AvanzaConfirmationModalReadback = {
      action: dryRunOrderInput.action,
      ticker: expectedInstrument.ticker,
      name: expectedInstrument.name,
      market: expectedInstrument.market,
      currency: expectedInstrument.currency,
      instrumentType: expectedInstrument.instrumentType,
      quantityValue:
        reviewClickMode === "confirmation_mismatch_quantity"
          ? dryRunOrderInput.quantity + 1
          : dryRunOrderInput.quantity,
      priceValue:
        reviewClickMode === "confirmation_mismatch_price"
          ? dryRunOrderInput.price + 1
          : dryRunOrderInput.price,
      accountLabelSanitized: "Manual review required",
      fees: 1,
      totalAmount: dryRunOrderInput.quantity * dryRunOrderInput.price + 1,
      validUntil: "today",
      confirmationModalVisible: true,
      cancelButtonVisible: true,
      finalConfirmVisible:
        reviewClickMode === "prohibited_final_confirm_detected",
      finalConfirmLabel:
        reviewClickMode === "prohibited_final_confirm_detected"
          ? dryRunOrderInput.action === "sell"
            ? "Bekräfta sälj"
            : "Bekräfta köp"
          : undefined,
      validationErrors:
        reviewClickMode === "validation_error"
          ? ["Synthetic review validation error."]
          : [],
      interactionSignals: {
        finalConfirmClickedOrAttempted:
          reviewClickMode === "prohibited_final_confirm_detected",
        keyboardSubmitDetected: reviewClickMode === "blocked_keyboard_submit",
      },
      sensitiveSignals: {
        accountDataDetected: false,
        balanceDataDetected: false,
        holdingsDataDetected: false,
        sensitiveDataDetected: reviewClickMode === "blocked_sensitive",
      },
    };
    const reviewClick = evaluateAvanzaReviewClick(
      {
        dryRunOrderInput,
        advancedFormFillResult:
          payload.advancedFormFillResult ?? fallbackAdvancedFormFill,
        confirmationReadback,
        reviewClickAttempted: true,
        reviewLabel:
          dryRunOrderInput.action === "sell" ? "Granska sälj" : "Granska köp",
        metadata: {
          review_click_preview_only: true,
          noRealReviewClick: true,
          noFinalConfirmClick: true,
          noBrokerResult: true,
          noTradeMutation: true,
        },
      },
      { checkedAt: completedAt },
    );
    const status =
      reviewClick.status === "confirmation_ready"
        ? 200
        : reviewClick.status === "unavailable" ||
            reviewClick.status === "form_not_ready"
          ? 501
          : 400;

    await route.fulfill({
      status,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      contentType: "application/json",
      body: JSON.stringify({
        version: "avanza_localhost_bridge_v1",
        ok: reviewClick.ok,
        bridgeVersion: "avanza_localhost_bridge_v1",
        requestId: payload.requestId ?? "playwright_review_click_request",
        receivedAt: completedAt,
        completedAt,
        reviewClick,
        message:
          "Localhost bridge review-click stub completed safely. No browser was controlled.",
        errors: [...reviewClick.errors],
        warnings: [
          "Review-click runner is not implemented.",
          "No browser actions were executed.",
          "No Avanza page was touched.",
          "No real Granska click occurred.",
          "No Bekräfta click occurred.",
          "No broker result was created.",
          ...reviewClick.warnings,
        ],
        metadata: {
          localhost_bridge_stub: true,
          review_click_endpoint_stub: true,
          no_browser_control: true,
          no_browser_actions_executed: true,
          no_avanza_page_touched: true,
          no_real_granska_clicked: true,
          no_review_click: true,
          no_final_confirm_click: true,
          no_broker_submission: true,
          no_broker_result_created: true,
          no_supabase_write: true,
          no_trade_mutation: true,
        },
      }),
    });
  });

  let brokerConfirmationCaptureMode:
    | "confirmation_captured_filled"
    | "confirmation_partial_placed"
    | "confirmation_mismatch_quantity"
    | "confirmation_mismatch_price"
    | "confirmation_rejected"
    | "confirmation_cancelled"
    | "blocked_broker_result_attempt"
    | "blocked_trade_mutation_attempt" = "confirmation_captured_filled";

  await page.route(
    "http://127.0.0.1:47831/broker-confirmation-capture",
    async (route) => {
      const payload = route.request().postDataJSON() as {
        requestId?: string;
        dryRunOrderInput?: ReturnType<typeof createAvanzaDryRunOrderInput>;
      };
      const completedAt = new Date().toISOString();
      const dryRunOrderInput =
        payload.dryRunOrderInput ??
        createAvanzaDryRunOrderInput({
          action: "buy",
          instrument: {
            ticker: "BROKER.CONF",
            name: "Broker Confirmation Fixture",
            market: "Stockholm",
            currency: "SEK",
            instrumentType: "stock",
          },
          quantity: 4,
          price: 101.25,
          createdAt: completedAt,
        });
      const reviewClickReady: AvanzaReviewClickResult = {
        ok: true,
        status: "confirmation_ready",
        checkedAt: completedAt,
        expectedAction: dryRunOrderInput.action,
        expectedInstrument: dryRunOrderInput.instrument,
        expectedQuantity: dryRunOrderInput.quantity,
        expectedPrice: dryRunOrderInput.price,
        confirmationReadback: {
          action: dryRunOrderInput.action,
          ticker: dryRunOrderInput.instrument.ticker,
          name: dryRunOrderInput.instrument.name,
          market: dryRunOrderInput.instrument.market,
          currency: dryRunOrderInput.instrument.currency,
          instrumentType: dryRunOrderInput.instrument.instrumentType,
          quantityValue: dryRunOrderInput.quantity,
          priceValue: dryRunOrderInput.price,
          confirmationModalVisible: true,
          finalConfirmVisible: false,
        },
        fieldChecks: [],
        riskFlags: [],
        blockers: [],
        warnings: [],
        errors: [],
        labels: ["Confirmation ready for manual final confirmation"],
        metadata: {
          contractVersion: AVANZA_REVIEW_CLICK_CONTRACT_VERSION,
          waitingForManualConfirmation: true,
          noFinalConfirmClick: true,
          noBrokerResult: true,
          noTradeMutation: true,
        },
      };
      const manualConfirmationWaitResult =
        evaluateAvanzaManualConfirmationWait(
          {
            reviewClickResult: reviewClickReady,
            observation: { userConfirmed: true },
          },
          { checkedAt: completedAt },
        );
      const brokerConfirmationReadback: AvanzaBrokerConfirmationReadback = {
        action: dryRunOrderInput.action,
        ticker: dryRunOrderInput.instrument.ticker,
        name: dryRunOrderInput.instrument.name,
        market: dryRunOrderInput.instrument.market,
        currency: dryRunOrderInput.instrument.currency,
        instrumentType: dryRunOrderInput.instrument.instrumentType,
        quantityValue:
          brokerConfirmationCaptureMode === "confirmation_mismatch_quantity"
            ? dryRunOrderInput.quantity + 1
            : dryRunOrderInput.quantity,
        priceValue:
          brokerConfirmationCaptureMode === "confirmation_mismatch_price"
            ? dryRunOrderInput.price + 1
            : dryRunOrderInput.price,
        fees: 1,
        totalAmount: dryRunOrderInput.quantity * dryRunOrderInput.price + 1,
        timestamp: completedAt,
        orderIdSanitized: "MOCK-ORDER-123",
        orderStatus:
          brokerConfirmationCaptureMode === "confirmation_partial_placed"
            ? "placed"
            : brokerConfirmationCaptureMode === "confirmation_rejected"
              ? "rejected"
              : brokerConfirmationCaptureMode === "confirmation_cancelled"
                ? "cancelled"
                : "filled",
        statusTextSanitized: "Synthetic broker confirmation readback.",
        confirmationPageVisible: true,
        warnings:
          brokerConfirmationCaptureMode === "confirmation_partial_placed"
            ? ["Synthetic placed order; not filled yet."]
            : [],
        forbiddenSignals: {
          brokerResultCreationAttempted:
            brokerConfirmationCaptureMode === "blocked_broker_result_attempt",
          tradeMutationAttempted:
            brokerConfirmationCaptureMode === "blocked_trade_mutation_attempt",
        },
        sensitiveSignals: {
          accountDataDetected: false,
          balanceDataDetected: false,
          holdingsDataDetected: false,
          sensitiveDataDetected: false,
          rawDomDetected: false,
          unsanitizedScreenshotDetected: false,
        },
      };
      const brokerConfirmationCapture = evaluateAvanzaBrokerConfirmationCapture(
        {
          dryRunOrderInput,
          manualConfirmationWaitResult,
          brokerConfirmationReadback,
          metadata: {
            broker_confirmation_capture_preview_only: true,
            noBekraftaByAgent: true,
            noBrokerExecutionResult: true,
            noExecutionRecord: true,
            noSupabaseWrite: true,
            noTradeMutation: true,
            sanitizedEvidenceOnly: true,
          },
        },
        { checkedAt: completedAt },
      );
      const status =
        brokerConfirmationCapture.status === "blocked" ? 400 : 200;

      await route.fulfill({
        status,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        contentType: "application/json",
        body: JSON.stringify({
          version: "avanza_localhost_bridge_v1",
          ok: brokerConfirmationCapture.ok,
          bridgeVersion: "avanza_localhost_bridge_v1",
          requestId:
            payload.requestId ??
            "playwright_broker_confirmation_capture_request",
          receivedAt: completedAt,
          completedAt,
          brokerConfirmationCapture,
          message:
            "Localhost bridge broker-confirmation-capture stub completed safely. No browser was controlled.",
          errors: [...brokerConfirmationCapture.errors],
          warnings: [
            "Broker confirmation capture runner is not implemented.",
            "No browser actions were executed.",
            "No Avanza page was touched.",
            "No Bekräfta click occurred.",
            "No BrokerExecutionResult was created.",
            "No execution record was created.",
            "No Supabase write occurred.",
            "No trade mutation occurred.",
            ...brokerConfirmationCapture.warnings,
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
            no_broker_execution_result_created: true,
            no_execution_record_created: true,
            no_supabase_write: true,
            no_trade_mutation: true,
          },
        }),
      });
    },
  );

  let brokerExecutionEligibilityMode:
    | "eligible_filled"
    | "partial_placed"
    | "blocked_mismatch"
    | "duplicate_risk" = "eligible_filled";

  await page.route(
    "http://127.0.0.1:47831/broker-execution-result-eligibility",
    async (route) => {
      const payload = route.request().postDataJSON() as {
        requestId?: string;
        captureResult?: AvanzaBrokerConfirmationCaptureResult;
      };
      const completedAt = new Date().toISOString();
      const baseCapture = payload.captureResult;
      const captureResult: AvanzaBrokerConfirmationCaptureResult | null =
        baseCapture
          ? brokerExecutionEligibilityMode === "partial_placed"
            ? {
                ...baseCapture,
                ok: false,
                status: "confirmation_partial",
                orderStatus: "placed",
                brokerConfirmationReadback: {
                  ...baseCapture.brokerConfirmationReadback,
                  orderStatus: "placed",
                  warnings: [
                    "Synthetic placed order; not filled yet.",
                    ...(baseCapture.brokerConfirmationReadback?.warnings ?? []),
                  ],
                },
                riskFlags: [
                  "order_placed_not_filled",
                  ...baseCapture.riskFlags.filter(
                    (flag) => flag !== "order_placed_not_filled",
                  ),
                ],
                blockers: [
                  "Order is placed or accepted, but fill is not confirmed.",
                ],
                warnings: [
                  "Partial-only eligibility requires manual review.",
                  ...baseCapture.warnings,
                ],
                errors: [
                  "Order is placed or accepted, but fill is not confirmed.",
                ],
              }
            : brokerExecutionEligibilityMode === "blocked_mismatch"
              ? {
                  ...baseCapture,
                  ok: false,
                  status: "confirmation_mismatch",
                  brokerConfirmationReadback: {
                    ...baseCapture.brokerConfirmationReadback,
                    quantityValue: baseCapture.expectedQuantity + 1,
                  },
                  fieldChecks: [
                    ...baseCapture.fieldChecks,
                    {
                      field: "quantity",
                      expected: String(baseCapture.expectedQuantity),
                      actual: String(baseCapture.expectedQuantity + 1),
                      status: "mismatch",
                      required: true,
                      message: "Synthetic quantity mismatch.",
                    },
                  ],
                  riskFlags: [
                    "quantity_mismatch",
                    ...baseCapture.riskFlags.filter(
                      (flag) => flag !== "quantity_mismatch",
                    ),
                  ],
                  blockers: ["Quantity mismatch blocks eligibility."],
                  warnings: [
                    "Broker confirmation evidence mismatch.",
                    ...baseCapture.warnings,
                  ],
                  errors: ["Quantity mismatch blocks eligibility."],
                }
              : baseCapture
          : null;
      const eligibility = captureResult
        ? evaluateAvanzaBrokerExecutionResultEligibility({
            captureResult,
            existingFingerprints:
              brokerExecutionEligibilityMode === "duplicate_risk"
                ? [
                    buildAvanzaBrokerConfirmationEvidenceFingerprint(
                      captureResult,
                    ),
                  ]
                : [],
          })
        : ({
            ok: false,
            status: "failed",
            checkedAt: completedAt,
            eligible: false,
            reasons: ["capture_not_captured"],
            blockers: ["Broker confirmation capture result is required."],
            warnings: [],
            errors: ["Broker confirmation capture result is required."],
            evidenceFingerprint: "missing_capture_result",
            labels: [
              "Eligibility check only",
              "No BrokerExecutionResult created",
              "No execution record",
              "No Supabase write",
              "No trade mutation",
            ],
            metadata: {
              version: "avanza_broker_execution_result_eligibility_v1",
              eligibilityCheckOnly: true,
              noBrokerExecutionResultCreated: true,
              noExecutionRecordCreated: true,
              noSupabaseWrite: true,
              noTradeMutation: true,
              captureStatus: "failed",
              orderStatus: "unknown",
              options: {
                allowMissingOrderId: false,
                allowMissingTimestamp: false,
                allowPlacedAsExecution: false,
                allowPartialFillConversion: false,
                blockOnAnyRiskFlag: true,
                requireFilledStatus: true,
              },
            },
          } satisfies AvanzaBrokerExecutionResultEligibilityResult);
      const status = eligibility.status === "eligible" ? 200 : 400;

      await route.fulfill({
        status,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        contentType: "application/json",
        body: JSON.stringify({
          version: "avanza_localhost_bridge_v1",
          ok: eligibility.ok,
          bridgeVersion: "avanza_localhost_bridge_v1",
          requestId:
            payload.requestId ??
            "playwright_broker_execution_result_eligibility_request",
          receivedAt: completedAt,
          completedAt,
          eligibility,
          message:
            "Localhost bridge BrokerExecutionResult eligibility stub completed safely. No BrokerExecutionResult was created.",
          errors: [...eligibility.errors],
          warnings: [
            "BrokerExecutionResult conversion is not implemented.",
            "No BrokerExecutionResult was created.",
            "No execution record was created.",
            "No Supabase write occurred.",
            "No trade mutation occurred.",
            ...eligibility.warnings,
          ],
          metadata: {
            localhost_bridge_stub: true,
            broker_execution_result_eligibility_endpoint_stub: true,
            eligibility_check_only: true,
            no_browser_control: true,
            no_browser_actions_executed: true,
            no_avanza_page_touched: true,
            no_broker_execution_result_created: true,
            no_execution_record_created: true,
            no_supabase_write: true,
            no_trade_mutation: true,
          },
        }),
      });
    },
  );

  let brokerExecutionPreviewMode:
    | "preview_available_filled"
    | "preview_available_missing_optional"
    | "partial_only_placed"
    | "blocked_mismatch"
    | "duplicate_risk" = "preview_available_filled";

  await page.route(
    "http://127.0.0.1:47831/broker-execution-result-preview",
    async (route) => {
      const payload = route.request().postDataJSON() as {
        requestId?: string;
        captureResult?: AvanzaBrokerConfirmationCaptureResult;
      };
      const completedAt = new Date().toISOString();
      const baseCapture = payload.captureResult;
      const captureResult: AvanzaBrokerConfirmationCaptureResult | null =
        baseCapture
          ? brokerExecutionPreviewMode === "preview_available_missing_optional"
            ? {
                ...baseCapture,
                brokerConfirmationReadback: {
                  ...baseCapture.brokerConfirmationReadback,
                  fees: undefined,
                  totalAmount: undefined,
                  timestamp: undefined,
                  orderIdSanitized: undefined,
                },
              }
            : brokerExecutionPreviewMode === "partial_only_placed"
              ? {
                  ...baseCapture,
                  ok: false,
                  status: "confirmation_partial",
                  orderStatus: "placed",
                  brokerConfirmationReadback: {
                    ...baseCapture.brokerConfirmationReadback,
                    orderStatus: "placed",
                  },
                  riskFlags: [
                    "order_placed_not_filled",
                    ...baseCapture.riskFlags.filter(
                      (flag) => flag !== "order_placed_not_filled",
                    ),
                  ],
                  blockers: [
                    "Order is placed or accepted, but fill is not confirmed.",
                  ],
                  warnings: [
                    "Partial-only preview requires manual review.",
                    ...baseCapture.warnings,
                  ],
                  errors: [
                    "Order is placed or accepted, but fill is not confirmed.",
                  ],
                }
              : brokerExecutionPreviewMode === "blocked_mismatch"
                ? {
                    ...baseCapture,
                    ok: false,
                    status: "confirmation_mismatch",
                    brokerConfirmationReadback: {
                      ...baseCapture.brokerConfirmationReadback,
                      quantityValue: baseCapture.expectedQuantity + 1,
                    },
                    fieldChecks: [
                      ...baseCapture.fieldChecks,
                      {
                        field: "quantity",
                        expected: String(baseCapture.expectedQuantity),
                        actual: String(baseCapture.expectedQuantity + 1),
                        status: "mismatch",
                        required: true,
                        message: "Synthetic quantity mismatch.",
                      },
                    ],
                    riskFlags: [
                      "quantity_mismatch",
                      ...baseCapture.riskFlags.filter(
                        (flag) => flag !== "quantity_mismatch",
                      ),
                    ],
                    blockers: ["Quantity mismatch blocks preview."],
                    warnings: [
                      "Broker confirmation evidence mismatch.",
                      ...baseCapture.warnings,
                    ],
                    errors: ["Quantity mismatch blocks preview."],
                  }
                : baseCapture
          : null;
      const duplicateFingerprint = captureResult
        ? buildAvanzaBrokerConfirmationEvidenceFingerprint(captureResult)
        : "missing_capture";
      const brokerExecutionResultPreview = captureResult
        ? buildAvanzaBrokerExecutionResultPreview({
            captureResult,
            existingFingerprints:
              brokerExecutionPreviewMode === "duplicate_risk"
                ? [duplicateFingerprint]
                : [],
            options:
              brokerExecutionPreviewMode === "preview_available_missing_optional"
                ? {
                    allowMissingOrderId: true,
                    allowMissingTimestamp: true,
                  }
                : undefined,
            metadata: {
              sourceRequestId:
                payload.requestId ??
                "playwright_broker_execution_result_preview_request",
              sourceCaptureId: "playwright_broker_confirmation_capture",
            },
          })
        : ({
            ok: false,
            status: "failed",
            checkedAt: completedAt,
            eligibility: {
              ok: false,
              status: "failed",
              checkedAt: completedAt,
              eligible: false,
              reasons: ["capture_not_captured"],
              blockers: ["Broker confirmation capture result is required."],
              warnings: [],
              errors: ["Broker confirmation capture result is required."],
              evidenceFingerprint: "missing_capture_result",
              labels: [
                "Eligibility check only",
                "No BrokerExecutionResult created",
                "No execution record",
                "No Supabase write",
                "No trade mutation",
              ],
              metadata: {
                version: "avanza_broker_execution_result_eligibility_v1",
                eligibilityCheckOnly: true,
                noBrokerExecutionResultCreated: true,
                noExecutionRecordCreated: true,
                noSupabaseWrite: true,
                noTradeMutation: true,
                captureStatus: "failed",
                orderStatus: "unknown",
                options: {
                  allowMissingOrderId: false,
                  allowMissingTimestamp: false,
                  allowPlacedAsExecution: false,
                  allowPartialFillConversion: false,
                  blockOnAnyRiskFlag: true,
                  requireFilledStatus: true,
                },
              },
            },
            preview: undefined,
            fields: [],
            blockers: ["Broker confirmation capture result is required."],
            warnings: [],
            errors: ["Broker confirmation capture result is required."],
            labels: [
              "BrokerExecutionResult preview only",
              "Not a real BrokerExecutionResult",
              "No execution record",
              "No Supabase write",
              "No trade mutation",
            ],
            metadata: {
              version: "avanza_broker_execution_result_preview_v1",
              previewOnly: true,
              notBrokerExecutionResult: true,
              noExecutionRecord: true,
              noSupabaseWrite: true,
              noTradeMutation: true,
              source: "avanza_broker_execution_result_preview",
            },
          } satisfies ReturnType<typeof buildAvanzaBrokerExecutionResultPreview>);
      const status =
        brokerExecutionResultPreview.status === "preview_available" ? 200 : 400;

      await route.fulfill({
        status,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        contentType: "application/json",
        body: JSON.stringify({
          version: "avanza_localhost_bridge_v1",
          ok: brokerExecutionResultPreview.ok,
          bridgeVersion: "avanza_localhost_bridge_v1",
          requestId:
            payload.requestId ??
            "playwright_broker_execution_result_preview_request",
          receivedAt: completedAt,
          completedAt,
          brokerExecutionResultPreview,
          message:
            brokerExecutionResultPreview.status === "preview_available"
              ? "Localhost bridge BrokerExecutionResult preview stub returned preview-only data. No real BrokerExecutionResult was created."
              : "Localhost bridge BrokerExecutionResult preview stub completed safely. No real BrokerExecutionResult was created.",
          errors: [...brokerExecutionResultPreview.errors],
          warnings: [
            "BrokerExecutionResult preview only.",
            "No real BrokerExecutionResult was created.",
            "No execution record was created.",
            "No Supabase write occurred.",
            "No trade mutation occurred.",
            ...brokerExecutionResultPreview.warnings,
          ],
          metadata: {
            localhost_bridge_stub: true,
            broker_execution_result_preview_endpoint_stub: true,
            preview_only: true,
            no_browser_control: true,
            no_browser_actions_executed: true,
            no_avanza_page_touched: true,
            no_real_broker_execution_result_created: true,
            no_execution_record_created: true,
            no_supabase_write: true,
            no_trade_mutation: true,
          },
        }),
      });
    },
  );

  let executionRecordEligibilityMode:
    | "eligible"
    | "blocked_preview_only"
    | "blocked_missing_price"
    | "blocked_not_filled"
    | "duplicate_source_fingerprint" = "eligible";

  await page.route(
    "http://127.0.0.1:47831/execution-record-eligibility",
    async (route) => {
      const payload = route.request().postDataJSON() as {
        requestId?: string;
        candidate?: ExecutionRecordCandidate;
      };
      const completedAt = new Date().toISOString();
      const fallbackCandidate: ExecutionRecordCandidate = {
        broker: "avanza",
        action: "buy",
        ticker: "EXEC.RECORD",
        instrumentName: "Execution Record Fixture",
        market: "Stockholm",
        currency: "SEK",
        instrumentType: "stock",
        quantity: 4,
        price: 101.25,
        fees: 1,
        totalAmount: 406,
        timestamp: completedAt,
        brokerOrderId: "MOCK-ORDER-123",
        sourceEvidenceFingerprint: "playwright-execution-record-fingerprint",
        sourceRequestId:
          payload.requestId ??
          "playwright_execution_record_eligibility_request",
        sourceCaptureId: "playwright_broker_confirmation_capture",
        sourceBrokerResultFingerprint:
          "playwright-broker-result-fingerprint",
        status: "filled",
        metadata: { previewOnly: false },
      };
      const baseCandidate =
        executionRecordEligibilityMode === "eligible"
          ? fallbackCandidate
          : (payload.candidate ?? fallbackCandidate);
      const candidate: ExecutionRecordCandidate =
        executionRecordEligibilityMode === "blocked_preview_only"
          ? {
              ...baseCandidate,
              metadata: {
                ...(baseCandidate.metadata ?? {}),
                notBrokerExecutionResult: true,
                previewOnly: true,
              },
            }
          : executionRecordEligibilityMode === "blocked_missing_price"
            ? {
                ...baseCandidate,
                price: undefined,
                metadata: {
                  ...(baseCandidate.metadata ?? {}),
                  previewOnly: false,
                  notBrokerExecutionResult: false,
                },
              }
            : executionRecordEligibilityMode === "blocked_not_filled"
              ? {
                  ...baseCandidate,
                  status: "placed",
                  metadata: {
                    ...(baseCandidate.metadata ?? {}),
                    previewOnly: false,
                    notBrokerExecutionResult: false,
                  },
                }
              : executionRecordEligibilityMode === "duplicate_source_fingerprint"
                ? {
                    ...baseCandidate,
                    metadata: {
                      ...(baseCandidate.metadata ?? {}),
                      previewOnly: false,
                      notBrokerExecutionResult: false,
                    },
                  }
                : fallbackCandidate;
      const existingSourceFingerprints =
        executionRecordEligibilityMode === "duplicate_source_fingerprint"
          ? [
              candidate.sourceEvidenceFingerprint ??
                buildExecutionRecordCandidateFingerprint(candidate),
            ]
          : [];
      const executionRecordEligibility = evaluateExecutionRecordEligibility({
        candidate,
        existingSourceFingerprints,
      });
      const status =
        executionRecordEligibility.status === "eligible" ? 200 : 400;

      await route.fulfill({
        status,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        contentType: "application/json",
        body: JSON.stringify({
          version: "avanza_localhost_bridge_v1",
          ok: executionRecordEligibility.ok,
          bridgeVersion: "avanza_localhost_bridge_v1",
          requestId:
            payload.requestId ??
            "playwright_execution_record_eligibility_request",
          receivedAt: completedAt,
          completedAt,
          executionRecordEligibility,
          message:
            "Localhost bridge execution-record eligibility stub completed safely. No execution record was created.",
          errors: [...executionRecordEligibility.errors],
          warnings: [
            "Execution record creation is not implemented.",
            "Eligibility check only.",
            "No BrokerExecutionResult was created.",
            "No execution record was created.",
            "No Supabase write occurred.",
            "No trade mutation occurred.",
            ...executionRecordEligibility.warnings,
          ],
          metadata: {
            localhost_bridge_stub: true,
            execution_record_eligibility_endpoint_stub: true,
            execution_record_eligibility_check_only: true,
            no_browser_control: true,
            no_browser_actions_executed: true,
            no_avanza_page_touched: true,
            no_broker_execution_result_created: true,
            no_execution_record_created: true,
            no_supabase_write: true,
            no_trade_mutation: true,
          },
        }),
      });
    },
  );

  await modal
    .getByRole("button", { name: "Check Advanced form-fill stub" })
    .click();
  await expect(
    modal.getByText("Advanced form filled", { exact: false }),
  ).toBeVisible();
  await expect(
    modal.getByText("Ready for future review-click design", { exact: false }),
  ).toBeVisible();
  await expect(modal.getByText("Advanced form-fill status")).toBeVisible();
  await expect(modal.getByText("Advanced form filled")).toBeVisible();
  await expect(modal.getByText("Sanitized form state")).toBeVisible();
  await expect(modal.getByText("Field checks")).toBeVisible();
  await expect(modal.getByText("Expected quantity")).toBeVisible();
  await expect(modal.getByText("Expected price")).toBeVisible();
  await expect(modal.getByText("No Real Form Fields Filled")).toBeVisible();
  await expect(modal.getByText("No Granska Click")).toBeVisible();
  await expect(modal.getByText("No Bekräfta Click")).toBeVisible();
  await expect(modal.getByText("No Broker Submission")).toBeVisible();
  await expect(
    modal.getByRole("button", {
      name: /run avanza|start avanza|fill avanza|review avanza|click granska|click bekräfta|submit order|open order|start order/i,
    }),
  ).toHaveCount(0);

  await modal
    .getByRole("button", { name: "Check review-click stub" })
    .click();
  await expect(
    modal.getByText("Confirmation is ready for manual final confirmation."),
  ).toBeVisible();
  await expect(
    modal.getByText("Ready for future manual-confirmation wait design", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(modal.getByText("Review click status")).toBeVisible();
  await expect(modal.getByText("Confirmation ready")).toBeVisible();
  await expect(
    modal.getByText("Waiting for manual confirmation"),
  ).toBeVisible();
  await expect(modal.getByText("Confirmation readback")).toBeVisible();
  await expect(modal.getByText("Field checks")).toBeVisible();
  await expect(modal.getByText("Expected quantity")).toBeVisible();
  await expect(modal.getByText("Expected price")).toBeVisible();
  await expect(modal.getByText("No Real Granska")).toBeVisible();
  await expect(modal.getByText("No Bekräfta Click")).toBeVisible();
  await expect(modal.getByText("No Broker Result")).toBeVisible();
  await expect(modal.getByText("No Trade Mutation")).toBeVisible();
  await expect(
    modal.getByRole("button", {
      name: /run avanza|start avanza|search avanza|open avanza|fill avanza|review avanza|click granska|click bekräfta|submit order|open order|start order/i,
    }),
  ).toHaveCount(0);

  await modal
    .getByRole("button", {
      name: "Check broker-confirmation-capture stub",
    })
    .click();
  await expect(
    modal.getByText("Broker confirmation captured.", { exact: false }),
  ).toBeVisible();
  await expect(
    modal.getByText("Ready for future BrokerExecutionResult conversion design", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(
    modal.getByText("Broker confirmation capture status"),
  ).toBeVisible();
  await expect(modal.getByText("Order status").first()).toBeVisible();
  await expect(modal.getByText("Broker confirmation readback")).toBeVisible();
  await expect(modal.getByText("Field checks").first()).toBeVisible();
  await expect(modal.getByText("No BrokerExecutionResult").first()).toBeVisible();
  await expect(modal.getByText("No execution record").first()).toBeVisible();
  await expect(modal.getByText("No Supabase write").first()).toBeVisible();
  await expect(modal.getByText("No trade mutation").first()).toBeVisible();
  await expect(
    modal.getByRole("button", {
      name: /run avanza|start avanza|search avanza|open avanza|fill avanza|review avanza|click granska|click bekräfta|submit order|open order|start order|create broker result|create result/i,
    }),
  ).toHaveCount(0);

  brokerExecutionEligibilityMode = "eligible_filled";
  await modal
    .getByRole("button", {
      name: "Check BrokerExecutionResult eligibility stub",
    })
    .click();
  await expect(
    modal.getByText("Eligible for future BrokerExecutionResult conversion.", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(
    modal.getByText(
      "Ready for future BrokerExecutionResult conversion preview design",
      { exact: false },
    ),
  ).toBeVisible();
  await expect(
    modal.getByText("BrokerExecutionResult eligibility status"),
  ).toBeVisible();
  await expect(modal.getByText("Evidence fingerprint")).toBeVisible();
  await expect(modal.getByText("Eligibility check only").first()).toBeVisible();
  await expect(
    modal.getByText("No BrokerExecutionResult created").first(),
  ).toBeVisible();
  await expect(modal.getByText("No execution record").first()).toBeVisible();
  await expect(modal.getByText("No Supabase write").first()).toBeVisible();
  await expect(modal.getByText("No trade mutation").first()).toBeVisible();
  await expect(
    modal.getByRole("button", {
      name: /run avanza|start avanza|search avanza|open avanza|fill avanza|review avanza|click granska|click bekräfta|submit order|open order|start order|convert broker|create broker|create result|execute broker/i,
    }),
  ).toHaveCount(0);

  brokerExecutionPreviewMode = "preview_available_filled";
  await modal
    .getByRole("button", {
      name: "Check BrokerExecutionResult preview stub",
    })
    .click();
  await expect(modal.getByText("Preview available.")).toBeVisible();
  await expect(
    modal.getByText("Ready for future execution-record boundary design", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(
    modal.getByText("BrokerExecutionResult preview status"),
  ).toBeVisible();
  await expect(
    modal.getByText("BrokerExecutionResult-shaped preview data"),
  ).toBeVisible();
  await expect(modal.getByText("Broker order id")).toBeVisible();
  await expect(modal.getByText("Source capture fingerprint")).toBeVisible();
  await expect(modal.getByText("PreviewOnly")).toBeVisible();
  await expect(modal.getByText("Not BrokerExecutionResult")).toBeVisible();
  await expect(modal.getByText("No Execution Record").first()).toBeVisible();
  await expect(modal.getByText("No Supabase Write").first()).toBeVisible();
  await expect(modal.getByText("No Trade Mutation").first()).toBeVisible();
  await expect(
    modal.getByRole("button", {
      name: /run avanza|start avanza|search avanza|open avanza|fill avanza|review avanza|click granska|click bekräfta|submit order|open order|start order|convert broker|create broker|create result|execute broker/i,
    }),
  ).toHaveCount(0);

  executionRecordEligibilityMode = "eligible";
  await modal
    .getByRole("button", {
      name: "Check execution-record eligibility stub",
    })
    .click();
  await expect(
    modal.getByText("Eligible for future local execution record creation.", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(
    modal.getByText("Ready for future local execution record preview design", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(
    modal.getByText("Execution record eligibility status"),
  ).toBeVisible();
  await expect(modal.getByText("Record fingerprint")).toBeVisible();
  await expect(modal.getByText("No BrokerExecutionResult").first()).toBeVisible();
  await expect(modal.getByText("No Execution Record").first()).toBeVisible();
  await expect(modal.getByText("No Supabase Write").first()).toBeVisible();
  await expect(modal.getByText("No Trade Mutation").first()).toBeVisible();
  await expect(
    modal.getByRole("button", {
      name: /start avanza|run avanza|create execution record|persist execution record|execute execution record|run execution record|start execution record/i,
    }),
  ).toHaveCount(0);

  executionRecordEligibilityMode = "blocked_preview_only";
  await modal
    .getByRole("button", {
      name: "Check execution-record eligibility stub",
    })
    .click();
  await expect(modal.getByText("Blocked: not eligible.")).toBeVisible();
  await expect(
    modal.getByText(
      "Broker result candidate is preview-only and cannot become an execution record.",
    ),
  ).toBeVisible();
  await expect(modal.getByText("BROKER RESULT PREVIEW ONLY")).toBeVisible();

  executionRecordEligibilityMode = "blocked_missing_price";
  await modal
    .getByRole("button", {
      name: "Check execution-record eligibility stub",
    })
    .click();
  await expect(modal.getByText("Blocked: not eligible.")).toBeVisible();
  await expect(
    modal.getByText("Broker result candidate price is missing or invalid."),
  ).toBeVisible();
  await expect(modal.getByText("MISSING PRICE")).toBeVisible();

  executionRecordEligibilityMode = "blocked_not_filled";
  await modal
    .getByRole("button", {
      name: "Check execution-record eligibility stub",
    })
    .click();
  await expect(modal.getByText("Blocked: not eligible.")).toBeVisible();
  await expect(
    modal.getByText("Broker result candidate status is not filled/executed."),
  ).toBeVisible();
  await expect(modal.getByText("BROKER RESULT NOT FILLED")).toBeVisible();

  executionRecordEligibilityMode = "duplicate_source_fingerprint";
  await modal
    .getByRole("button", {
      name: "Check execution-record eligibility stub",
    })
    .click();
  await expect(modal.getByText("Duplicate risk detected.")).toBeVisible();
  await expect(
    modal.getByText("Duplicate risk: idempotency review required."),
  ).toBeVisible();
  await expect(
    modal.getByText(
      "Source fingerprint already exists; creating another execution record would risk a duplicate.",
    ),
  ).toBeVisible();

  brokerExecutionPreviewMode = "preview_available_missing_optional";
  await modal
    .getByRole("button", {
      name: "Check BrokerExecutionResult preview stub",
    })
    .click();
  await expect(
    modal.getByText("Broker fees/courtage are missing."),
  ).toBeVisible();
  await expect(
    modal.getByText("Broker confirmation order id is missing."),
  ).toBeVisible();

  brokerExecutionPreviewMode = "partial_only_placed";
  await modal
    .getByRole("button", {
      name: "Check BrokerExecutionResult preview stub",
    })
    .click();
  await expect(
    modal.getByText("Partial only: no preview conversion."),
  ).toBeVisible();
  await expect(
    modal
      .locator("div")
      .filter({ hasText: "Preview shape" })
      .filter({ hasText: "None" })
      .first(),
  ).toBeVisible();

  brokerExecutionPreviewMode = "blocked_mismatch";
  await modal
    .getByRole("button", {
      name: "Check BrokerExecutionResult preview stub",
    })
    .click();
  await expect(modal.getByText("Preview blocked.")).toBeVisible();
  await expect(modal.getByText("Quantity mismatch blocks preview.")).toBeVisible();

  brokerExecutionPreviewMode = "duplicate_risk";
  await modal
    .getByRole("button", {
      name: "Check BrokerExecutionResult preview stub",
    })
    .click();
  await expect(modal.getByText("Duplicate risk.")).toBeVisible();
  await expect(
    modal.getByText("Duplicate risk: idempotency review required."),
  ).toBeVisible();

  brokerExecutionEligibilityMode = "partial_placed";
  await modal
    .getByRole("button", {
      name: "Check BrokerExecutionResult eligibility stub",
    })
    .click();
  await expect(
    modal.getByText("Partial only: manual review required."),
  ).toBeVisible();
  await expect(
    modal.getByText(
      "Partial only: conversion blocked until separate policy.",
    ),
  ).toBeVisible();

  brokerExecutionEligibilityMode = "blocked_mismatch";
  await modal
    .getByRole("button", {
      name: "Check BrokerExecutionResult eligibility stub",
    })
    .click();
  await expect(modal.getByText("Blocked: not eligible.")).toBeVisible();
  await expect(modal.getByText("Quantity mismatch blocks eligibility.")).toBeVisible();

  brokerExecutionEligibilityMode = "duplicate_risk";
  await modal
    .getByRole("button", {
      name: "Check BrokerExecutionResult eligibility stub",
    })
    .click();
  await expect(modal.getByText("Duplicate risk detected.")).toBeVisible();
  await expect(
    modal.getByText(
      "Duplicate risk: conversion blocked/idempotency review required.",
    ),
  ).toBeVisible();

  brokerConfirmationCaptureMode = "confirmation_partial_placed";
  await modal
    .getByRole("button", {
      name: "Check broker-confirmation-capture stub",
    })
    .click();
  await expect(
    modal.getByText("Partial confirmation: manual review required."),
  ).toBeVisible();
  await expect(modal.getByText("order_placed_not_filled")).toBeVisible();

  brokerConfirmationCaptureMode = "confirmation_mismatch_quantity";
  await modal
    .getByRole("button", {
      name: "Check broker-confirmation-capture stub",
    })
    .click();
  await expect(
    modal.getByText("Confirmation mismatch: manual review required."),
  ).toBeVisible();
  await expect(modal.getByText("quantity_mismatch")).toBeVisible();

  brokerConfirmationCaptureMode = "confirmation_mismatch_price";
  await modal
    .getByRole("button", {
      name: "Check broker-confirmation-capture stub",
    })
    .click();
  await expect(
    modal.getByText("Confirmation mismatch: manual review required."),
  ).toBeVisible();
  await expect(modal.getByText("price_mismatch")).toBeVisible();

  brokerConfirmationCaptureMode = "confirmation_rejected";
  await modal
    .getByRole("button", {
      name: "Check broker-confirmation-capture stub",
    })
    .click();
  await expect(
    modal.getByText("Rejected/cancelled: no execution result."),
  ).toBeVisible();
  await expect(modal.getByText("order_rejected")).toBeVisible();

  brokerConfirmationCaptureMode = "confirmation_cancelled";
  await modal
    .getByRole("button", {
      name: "Check broker-confirmation-capture stub",
    })
    .click();
  await expect(
    modal.getByText("Rejected/cancelled: no execution result."),
  ).toBeVisible();
  await expect(modal.getByText("order_cancelled")).toBeVisible();

  brokerConfirmationCaptureMode = "blocked_broker_result_attempt";
  await modal
    .getByRole("button", {
      name: "Check broker-confirmation-capture stub",
    })
    .click();
  await expect(
    modal.getByText("Blocked: BrokerExecutionResult creation was attempted", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(
    modal.getByText("broker_result_creation_attempted"),
  ).toBeVisible();

  brokerConfirmationCaptureMode = "blocked_trade_mutation_attempt";
  await modal
    .getByRole("button", {
      name: "Check broker-confirmation-capture stub",
    })
    .click();
  await expect(
    modal.getByText("Blocked: Trade mutation was attempted", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(modal.getByText("trade_mutation_attempted")).toBeVisible();

  reviewClickMode = "confirmation_ready_sell";
  await modal
    .getByRole("button", { name: "Check review-click stub" })
    .click();
  await expect(
    modal.getByText("Confirmation is ready for manual final confirmation."),
  ).toBeVisible();
  await expect(modal.getByText("sell")).toBeVisible();

  reviewClickMode = "confirmation_mismatch_quantity";
  await modal
    .getByRole("button", { name: "Check review-click stub" })
    .click();
  await expect(
    modal.getByText("Confirmation mismatch: manual review required."),
  ).toBeVisible();
  await expect(
    modal.getByText("confirmation_quantity_mismatch"),
  ).toBeVisible();

  reviewClickMode = "confirmation_mismatch_price";
  await modal
    .getByRole("button", { name: "Check review-click stub" })
    .click();
  await expect(
    modal.getByText("Confirmation mismatch: manual review required."),
  ).toBeVisible();
  await expect(modal.getByText("confirmation_price_mismatch")).toBeVisible();

  reviewClickMode = "validation_error";
  await modal
    .getByRole("button", { name: "Check review-click stub" })
    .click();
  await expect(
    modal.getByText("Validation error: manual review required."),
  ).toBeVisible();
  await expect(modal.getByText("validation_error_visible")).toBeVisible();

  reviewClickMode = "prohibited_final_confirm_detected";
  await modal
    .getByRole("button", { name: "Check review-click stub" })
    .click();
  await expect(modal.getByText("Final-confirm attempt blocked.")).toBeVisible();
  await expect(
    modal.getByText("final_confirm_clicked_or_attempted"),
  ).toBeVisible();

  reviewClickMode = "blocked_keyboard_submit";
  await modal
    .getByRole("button", { name: "Check review-click stub" })
    .click();
  await expect(
    modal.getByText("Blocked: Keyboard submit was detected", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(modal.getByText("keyboard_submit_detected")).toBeVisible();

  reviewClickMode = "blocked_sensitive";
  await modal
    .getByRole("button", { name: "Check review-click stub" })
    .click();
  await expect(
    modal.getByText("Blocked: Sensitive data detected", { exact: false }),
  ).toBeVisible();
  await expect(modal.getByText("sensitive_data_detected")).toBeVisible();

  advancedFormFillMode = "field_mismatch_quantity";
  await modal
    .getByRole("button", { name: "Check Advanced form-fill stub" })
    .click();
  await expect(
    modal.getByText("Field mismatch: manual review required."),
  ).toBeVisible();
  await expect(modal.getByText("quantity_mismatch")).toBeVisible();

  advancedFormFillMode = "field_mismatch_price";
  await modal
    .getByRole("button", { name: "Check Advanced form-fill stub" })
    .click();
  await expect(
    modal.getByText("Field mismatch: manual review required."),
  ).toBeVisible();
  await expect(modal.getByText("price_mismatch")).toBeVisible();

  advancedFormFillMode = "validation_error";
  await modal
    .getByRole("button", { name: "Check Advanced form-fill stub" })
    .click();
  await expect(
    modal.getByText("Validation error: manual review required."),
  ).toBeVisible();
  await expect(modal.getByText("validation_error_visible")).toBeVisible();

  advancedFormFillMode = "unsupported_order_mode_stop_loss";
  await modal
    .getByRole("button", { name: "Check Advanced form-fill stub" })
    .click();
  await expect(
    modal.getByText("Unsupported order mode: manual review required."),
  ).toBeVisible();
  await expect(modal.getByText("stop_loss_mode_detected")).toBeVisible();

  advancedFormFillMode = "prohibited_review_detected";
  await modal
    .getByRole("button", { name: "Check Advanced form-fill stub" })
    .click();
  await expect(
    modal.getByText("Blocked: Review/Granska click was attempted", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(
    modal.getByText("review_button_clicked_or_attempted"),
  ).toBeVisible();

  advancedFormFillMode = "prohibited_final_confirm_detected";
  await modal
    .getByRole("button", { name: "Check Advanced form-fill stub" })
    .click();
  await expect(
    modal.getByText("Blocked: Final-confirm/Bekrafta control detected", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(
    modal.getByText("final_confirm_clicked_or_attempted"),
  ).toBeVisible();

  advancedFormFillMode = "blocked_keyboard_submit";
  await modal
    .getByRole("button", { name: "Check Advanced form-fill stub" })
    .click();
  await expect(
    modal.getByText("Blocked: Keyboard submit was detected", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(modal.getByText("keyboard_submit_detected")).toBeVisible();

  advancedFormFillMode = "order_page_not_ready";
  await modal
    .getByRole("button", { name: "Check Advanced form-fill stub" })
    .click();
  await expect(
    modal.getByText("Blocked: Order page is not ready.", { exact: false }),
  ).toBeVisible();
  await expect(modal.getByText("order_page_not_opened")).toBeVisible();

  instrumentPageMode = "buy_sell_visible";
  await modal
    .getByRole("button", { name: "Check instrument-page stub" })
    .click();
  await expect(
    modal.getByText("Buy/sell controls visible - no click allowed."),
  ).toBeVisible();
  await expect(modal.getByText("prohibited_buy_button_visible")).toBeVisible();
  await expect(modal.getByText("prohibited_sell_button_visible")).toBeVisible();

  instrumentPageMode = "page_mismatch";
  await modal
    .getByRole("button", { name: "Check instrument-page stub" })
    .click();
  await expect(
    modal.getByText("Page mismatch: manual review required."),
  ).toBeVisible();
  await expect(modal.getByText("ticker_mismatch")).toBeVisible();

  instrumentPageMode = "blocked_order_page";
  await modal
    .getByRole("button", { name: "Check instrument-page stub" })
    .click();
  await expect(
    modal.getByText("Blocked: Order page context detected", { exact: false }),
  ).toBeVisible();
  await expect(modal.getByText("order_page_detected")).toBeVisible();

  instrumentVerificationMode = "rejected_ticker";
  await modal
    .getByRole("button", { name: "Check instrument-verification stub" })
    .click();
  await expect(modal.getByText("Instrument rejected", { exact: false })).toBeVisible();
  await expect(
    modal.getByText("Rejected: manual review required", { exact: false }),
  ).toBeVisible();
  await expect(modal.getByText("ticker_mismatch")).toBeVisible();

  instrumentVerificationMode = "ambiguous_missing_currency";
  await modal
    .getByRole("button", { name: "Check instrument-verification stub" })
    .click();
  await expect(modal.getByText("Instrument ambiguous", { exact: false })).toBeVisible();
  await expect(
    modal.getByText("Ambiguous: manual review required", { exact: false }),
  ).toBeVisible();
  await expect(modal.getByText("missing_currency")).toBeVisible();

  instrumentVerificationMode = "blocked_order_flow";
  await modal
    .getByRole("button", { name: "Check instrument-verification stub" })
    .click();
  await expect(
    modal.getByText("Blocked: Order flow was detected", { exact: false }),
  ).toBeVisible();
  await expect(modal.getByText("order_flow_detected")).toBeVisible();

  searchOnlyMode = "ambiguous";
  await modal
    .getByRole("button", { name: "Check search-only stub" })
    .click();
  await expect(
    modal.getByText("Ambiguous candidates; manual review required."),
  ).toBeVisible();
  await expect(
    modal.getByText("Manual review required", { exact: false }),
  ).toBeVisible();
  await expect(modal.getByText("Candidates")).toBeVisible();
  await expect(modal.getByText("duplicate_ticker")).toBeVisible();
  await expect(
    modal.getByRole("button", {
      name: /run avanza|start avanza|open avanza|search avanza|start search|run search|open order|start order/i,
    }),
  ).toHaveCount(0);

  searchOnlyMode = "no_match";
  await modal
    .getByRole("button", { name: "Check search-only stub" })
    .click();
  await expect(modal.getByText("No matching instrument found.")).toBeVisible();
  await expect(
    modal.getByText("No matching instrument found. Search-only stops here."),
  ).toBeVisible();
  await expect(
    modal.getByText("Synthetic mismatch candidate"),
  ).toBeVisible();
  await expect(
    modal.getByRole("button", {
      name: /run avanza|start avanza|open avanza|search avanza|start search|run search|open order|start order/i,
    }),
  ).toHaveCount(0);

  searchOnlyMode = "blocked_order_flow";
  await modal
    .getByRole("button", { name: "Check search-only stub" })
    .click();
  await expect(
    modal.getByText("Blocked: Order flow was detected", { exact: false }),
  ).toBeVisible();
  await expect(modal.getByText("order_flow_detected")).toBeVisible();
  await expect(
    modal.getByText(
      "Order flow was detected during search-only candidate parsing.",
    ),
  ).toBeVisible();
  await expect(
    modal.getByRole("button", {
      name: /run avanza|start avanza|open avanza|search avanza|start search|run search|open order|start order/i,
    }),
  ).toHaveCount(0);

  let dryRunBridgeMode: "not_implemented" | "blocked" | "skeleton" =
    "not_implemented";

  await page.route("http://127.0.0.1:47831/dry-run", async (route) => {
    const payload = route.request().postDataJSON() as {
      requestId?: string;
      dryRunOrderInput?: unknown;
    };
    const receivedAt = new Date().toISOString();
    const isBlocked = dryRunBridgeMode === "blocked";
    const isSkeleton = dryRunBridgeMode === "skeleton";

    await route.fulfill({
      status: isBlocked ? 400 : isSkeleton ? 200 : 501,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      contentType: "application/json",
      body: JSON.stringify({
        version: "avanza_localhost_bridge_v1",
        ok: isSkeleton,
        status: isBlocked
          ? "blocked"
          : isSkeleton
            ? "accepted_stub"
            : "not_implemented",
        bridgeVersion: "avanza_localhost_bridge_v1",
        requestId: payload.requestId ?? "playwright_dry_run_bridge_request",
        receivedAt,
        completedAt: receivedAt,
        dryRunRequestValidation: {
          ok: !isBlocked,
          errors: isBlocked
            ? ["Playwright blocked unsafe dry-run request."]
            : [],
          warnings: [],
          ...(!isBlocked && payload.dryRunOrderInput
            ? { normalized: payload.dryRunOrderInput }
            : {}),
        },
        capabilityValidation: {
          ok: !isBlocked,
          blocked: isBlocked,
          errors: isBlocked
            ? ["Broker submission capability is blocked by default."]
            : [],
          warnings: isBlocked
            ? []
            : [
                "Avanza dry-run capability is dry-run only: no broker submission, no final confirmation, and no broker result.",
              ],
          safetyLevel: isBlocked ? "real_broker_blocked" : "dry_run_only",
          canRunMockBrowserActions: false,
          canRunAvanzaDryRun: !isBlocked,
          canSubmitBrokerOrder: false,
        },
        diagnostics: null,
        message: isBlocked
          ? "Localhost bridge dry-run request was blocked by validation. No browser action occurred."
          : isSkeleton
            ? "Avanza dry-run runner skeleton accepted the request as a non-executing stub. No browser action occurred."
          : "Localhost bridge dry-run request validated, but the Avanza dry-run runner is not implemented. No browser action occurred.",
        errors: isBlocked
          ? [
              "Playwright blocked unsafe dry-run request.",
              "Broker submission capability is blocked by default.",
            ]
          : [],
        warnings: [
          ...(isBlocked
            ? []
            : isSkeleton
              ? [
                  "Avanza dry-run runner skeleton only.",
                  "No browser control is implemented.",
                ]
              : ["Avanza dry-run runner is not implemented."]),
          "No browser actions were executed.",
          "No broker submission was performed.",
        ],
        metadata: {
          localhost_bridge_stub: true,
          dry_run_endpoint_stub: true,
          skeletonOnly: isSkeleton,
          no_browser_control: isSkeleton,
          no_browser_actions_executed: true,
          no_avanza_session: true,
          no_broker_submission: true,
          no_broker_result_created: true,
        },
      }),
    });
  });

  await modal
    .getByRole("button", { name: "Test dry-run bridge stub" })
    .click();
  await expect(
    modal.getByText(
      "Dry-run bridge accepted request but no runner is implemented",
      { exact: false },
    ),
  ).toBeVisible();
  await expect(modal.getByText("not implemented")).toBeVisible();
  await expect(modal.getByText("Client OK")).toBeVisible();
  await expect(modal.getByText("dry_run_only")).toBeVisible();
  await expect(modal.getByText("No Browser Actions")).toBeVisible();
  await expect(modal.getByText("No Broker Submission")).toBeVisible();
  await expect(modal.getByText("No Broker Result")).toBeVisible();
  await expect(
    modal.getByText("No browser actions were executed."),
  ).toBeVisible();
  await expect(
    modal.getByText("No broker submission was performed."),
  ).toBeVisible();
  await expect(
    modal.getByRole("button", {
      name: /run avanza|start avanza|open avanza|search avanza|start search|run search|open order|start order/i,
    }),
  ).toHaveCount(0);

  dryRunBridgeMode = "skeleton";
  await modal
    .getByRole("button", { name: "Test dry-run bridge stub" })
    .click();
  await expect(
    modal.getByText("Dry-run bridge accepted a non-executing stub response", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(modal.getByText("accepted stub")).toBeVisible();
  await expect(modal.getByText("Avanza dry-run runner skeleton only.")).toBeVisible();
  await expect(
    modal.getByText("No browser control is implemented."),
  ).toBeVisible();
  await expect(modal.getByText("No Browser Actions")).toBeVisible();
  await expect(modal.getByText("No Broker Submission")).toBeVisible();
  await expect(
    modal.getByRole("button", {
      name: /run avanza|start avanza|open avanza|search avanza|start search|run search|open order|start order/i,
    }),
  ).toHaveCount(0);

  dryRunBridgeMode = "blocked";
  await modal
    .getByRole("button", { name: "Test dry-run bridge stub" })
    .click();
  await expect(
    modal.getByText("Dry-run bridge blocked unsafe request", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(modal.getByText("blocked")).toBeVisible();
  await expect(modal.getByText("real_broker_blocked")).toBeVisible();
  await expect(
    modal.getByText("Playwright blocked unsafe dry-run request."),
  ).toBeVisible();
  await expect(
    modal.getByText("Broker submission capability is blocked by default."),
  ).toBeVisible();
  await expect(
    modal.getByRole("button", {
      name: /run avanza|start avanza|open avanza|search avanza|start search|run search|open order|start order/i,
    }),
  ).toHaveCount(0);

  let sessionDetectionMode: "ready" | "login_required" | "blocked_sensitive" =
    "ready";

  await page.route(
    "http://127.0.0.1:47831/session-detection",
    async (route) => {
      const checkedAt = new Date().toISOString();
      const sessionDetection =
        sessionDetectionMode === "ready"
          ? evaluateAvanzaSessionDetectionContext({
              browserConnected: true,
              avanzaVisible: true,
              sanitizedHostClass: "avanza",
              loginState: "logged_in",
              pageContext: "app_shell",
              language: "sv",
              sensitiveDataDetected: false,
            })
          : sessionDetectionMode === "login_required"
            ? evaluateAvanzaSessionDetectionContext({
                browserConnected: true,
                avanzaVisible: true,
                sanitizedHostClass: "avanza",
                loginState: "login_challenge",
                pageContext: "login",
                language: "sv",
              })
            : evaluateAvanzaSessionDetectionContext({
                browserConnected: true,
                avanzaVisible: true,
                sanitizedHostClass: "avanza",
                loginState: "logged_in",
                pageContext: "app_shell",
                language: "sv",
                sensitiveDataDetected: true,
              });

      await route.fulfill({
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        contentType: "application/json",
        body: JSON.stringify({
          version: "avanza_localhost_bridge_v1",
          ok: sessionDetection.ok,
          bridgeVersion: "avanza_localhost_bridge_v1",
          checkedAt,
          sessionDetection: {
            ...sessionDetection,
            checkedAt,
          },
          message:
            "Localhost bridge session-detection stub completed safely. No browser was controlled.",
          errors: [...sessionDetection.errors],
          warnings: [
            "Session detection runner is not implemented.",
            "No browser actions were executed.",
            "No Avanza page was touched.",
            ...sessionDetection.warnings,
          ],
          metadata: {
            localhost_bridge_stub: true,
            session_detection_stub: true,
            session_detection_only: true,
            no_browser_control: true,
            no_browser_actions_executed: true,
            no_avanza_page_touched: true,
            no_broker_submission: true,
            no_broker_result_created: true,
          },
        }),
      });
    },
  );

  await modal
    .getByRole("button", { name: "Check session-detection stub" })
    .click();
  await expect(
    modal.getByText("Session appears ready for search-only", { exact: false }),
  ).toBeVisible();
  await expect(
    modal.getByText("Latest session-detection status: ready_for_search_only."),
  ).toBeVisible();
  await expect(
    modal.getByText("Ready for future search-only phase", { exact: false }),
  ).toBeVisible();
  await expect(modal.getByText("No browser control").first()).toBeVisible();
  await expect(modal.getByText("No Avanza page touched").first()).toBeVisible();
  await expect(modal.getByText("No browser actions")).toBeVisible();
  await expect(modal.getByText("Session detection status")).toBeVisible();
  await expect(modal.getByText("Ready for search-only").first()).toBeVisible();
  await expect(
    modal.getByText(
      "Ready for future search-only phase. This does not enable search or dry-run execution.",
    ),
  ).toBeVisible();
  await expect(
    modal.getByRole("button", {
      name: /run avanza|start avanza|open avanza|search avanza|start search|run search|open order|start order/i,
    }),
  ).toHaveCount(0);

  sessionDetectionMode = "login_required";
  await modal
    .getByRole("button", { name: "Check session-detection stub" })
    .click();
  await expect(
    modal.getByText("Avanza visible but login required."),
  ).toBeVisible();
  await expect(
    modal.getByText("Latest session-detection status: login_required."),
  ).toBeVisible();
  await expect(modal.getByText("Login required").first()).toBeVisible();
  await expect(
    modal.getByText(
      "Login required before any future search-only phase.",
    ),
  ).toBeVisible();
  await expect(
    modal.getByRole("button", {
      name: /run avanza|start avanza|open avanza|search avanza|start search|run search|open order|start order/i,
    }),
  ).toHaveCount(0);

  sessionDetectionMode = "blocked_sensitive";
  await modal
    .getByRole("button", { name: "Check session-detection stub" })
    .click();
  await expect(
    modal.getByText("Blocked: Sensitive data was detected", { exact: false }),
  ).toBeVisible();
  await expect(
    modal.getByText("Latest session-detection status: blocked."),
  ).toBeVisible();
  await expect(
    modal.getByText("Sensitive data was detected and must be redacted."),
  ).toBeVisible();
  await expect(modal.getByText("Sensitive data")).toBeVisible();
  await expect(
    modal.getByRole("button", {
      name: /run avanza|start avanza|open avanza|search avanza|start search|run search|open order|start order/i,
    }),
  ).toHaveCount(0);

  let selfCheckMode: "unavailable" | "mock_only" | "dry_run_only" =
    "unavailable";

  await page.route("http://127.0.0.1:47831/self-check", async (route) => {
    const checkedAt = new Date().toISOString();
    const isMockOnly = selfCheckMode === "mock_only";
    const isDryRunOnly = selfCheckMode === "dry_run_only";
    const blocker = "No Avanza dry-run runner is installed/available.";
    const capability = isMockOnly
      ? {
          runnerId: "playwright_mock_only_self_check",
          runnerName: "Playwright Mock-only Self-check",
          targetEnvironment: "mock_order_page",
          supportsBrowserExecution: true,
          supportsBrokerSubmission: false,
          supportsFinalConfirmClick: false,
          mockOnly: true,
          devOnly: true,
          automaticModeCapable: false,
          createdAt: checkedAt,
          metadata: {
            targetEnvironment: "mock_order_page",
            mockOnly: true,
            noAvanzaAutomation: true,
          },
        }
      : isDryRunOnly
        ? {
            runnerId: "playwright_dry_run_self_check",
            runnerName: "Playwright Dry-run Self-check",
            targetEnvironment: "avanza_broker",
            supportsBrowserExecution: true,
            supportsBrokerSubmission: false,
            supportsFinalConfirmClick: false,
            mockOnly: false,
            devOnly: true,
            automaticModeCapable: false,
            createdAt: checkedAt,
            metadata: {
              targetEnvironment: "avanza_broker",
              dryRunOnly: true,
              skeletonOnly: true,
              noBrowserControl: true,
              mockOnly: false,
              devOnly: true,
              supportsBrokerSubmission: false,
              supportsFinalConfirmClick: false,
              automaticModeCapable: false,
            },
          }
      : undefined;
    const selfCheck = isMockOnly
      ? {
          ok: true,
          status: "available_mock_only",
          checkedAt,
          runnerId: "playwright_mock_only_self_check",
          runnerName: "Playwright Mock-only Self-check",
          version: "avanza_dry_run_runner_self_check_v1",
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
          metadata: { mockOnly: true, noAvanzaAutomation: true },
        }
      : isDryRunOnly
        ? {
            ok: true,
            status: "available_dry_run_only",
            checkedAt,
            runnerId: "playwright_dry_run_self_check",
            runnerName: "Playwright Dry-run Self-check",
            version: "avanza_dry_run_runner_self_check_v1",
            capabilityValidation: {
              ok: true,
              blocked: false,
              errors: [],
              warnings: [
                "Avanza dry-run capability is dry-run only: no broker submission, no final confirmation, and no broker result.",
                "Avanza dry-run runner skeleton only. No browser control is implemented.",
              ],
              safetyLevel: "dry_run_only",
              canRunMockBrowserActions: false,
              canRunAvanzaDryRun: true,
              canSubmitBrokerOrder: false,
            },
            readinessLabels: [
              "Avanza dry-run capable",
              "Skeleton only",
              "No browser control",
              "No broker submission",
              "Final confirm disabled",
              "Semi-auto only",
            ],
            blockers: [],
            warnings: [
              "Avanza dry-run capability is dry-run only: no broker submission, no final confirmation, and no broker result.",
              "Avanza dry-run runner skeleton is installed for contract testing only.",
              "No browser control is implemented.",
            ],
            errors: [],
            metadata: {
              dryRunOnly: true,
              skeletonOnly: true,
              noBrowserControl: true,
              noBrokerSubmission: true,
              noFinalConfirmClick: true,
            },
          }
      : {
          ok: false,
          status: "unavailable",
          checkedAt,
          runnerId: "avanza_dry_run_runner_unavailable",
          runnerName: "Avanza Dry-Run Runner",
          version: "avanza_dry_run_runner_self_check_v1",
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
            runnerImplemented: false,
            noBrowserControl: true,
          },
        };

    await route.fulfill({
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      contentType: "application/json",
      body: JSON.stringify({
        version: "avanza_localhost_bridge_v1",
        ok: true,
        bridgeVersion: "avanza_localhost_bridge_v1",
        checkedAt,
        selfCheck,
        ...(capability ? { capability } : {}),
        message: isDryRunOnly
          ? "Localhost bridge self-check reports Avanza dry-run-only capability. No broker submission is enabled."
          : isMockOnly
            ? "Localhost bridge self-check reports mock-only browser diagnostics. It cannot run Avanza dry-run."
            : "Localhost bridge self-check completed. No Avanza dry-run runner is installed or available.",
        errors: [],
        warnings: [
          "Self-check is diagnostics only. It does not open a browser, touch Avanza, submit orders, create broker results, write Supabase, or mutate trades.",
          isDryRunOnly
            ? "Dry-run capability is readiness metadata only and does not enable a run button."
            : isMockOnly
            ? "Mock-only capability is not Avanza dry-run capability."
            : "Current Avanza dry-run runner status is unavailable.",
        ],
        metadata: {
          localhost_bridge_stub: true,
          self_check_only: true,
          no_browser_control: true,
          no_avanza_session: true,
          no_broker_result_created: true,
        },
      }),
    });
  });

  await modal
    .getByRole("button", { name: "Check localhost runner self-check" })
    .click();
  await expect(modal.getByText("Localhost runner self-check")).toBeVisible();
  await expect(modal.getByText("unavailable")).toBeVisible();
  await expect(
    modal.getByText("No Avanza dry-run runner is installed/available."),
  ).toBeVisible();
  await expect(
    modal.getByText("Latest localhost self-check: unavailable", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(modal.getByText("Runner unavailable")).toBeVisible();
  await expect(modal.getByText("Localhost self-check status")).toBeVisible();
  await expect(modal.getByText("Runner capability")).toBeVisible();
  await expect(modal.getByText("Runner Avanza dry-run capable")).toBeVisible();
  await expect(modal.getByText("Can run Avanza dry-run")).toBeVisible();
  await expect(modal.getByText("Can submit broker order")).toBeVisible();

  selfCheckMode = "mock_only";
  await modal
    .getByRole("button", { name: "Check localhost runner self-check" })
    .click();
  await expect(modal.getByText("available_mock_only")).toBeVisible();
  await expect(
    modal.getByText(
      "Localhost bridge self-check reports mock-only browser diagnostics. It cannot run Avanza dry-run.",
    ),
  ).toBeVisible();
  await expect(modal.getByText("Not ready for Avanza dry-run")).toBeVisible();
  await expect(
    modal.getByText("Latest localhost self-check: available_mock_only", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(modal.getByText("Mock-only browser diagnostics")).toBeVisible();
  await expect(modal.getByText("Cannot run Avanza dry-run")).toBeVisible();
  await expect(
    modal.getByText("Mock-only runner detected. It cannot run Avanza dry-run."),
  ).toBeVisible();
  await expect(
    modal.getByText("Mock-only capability is not Avanza dry-run capability."),
  ).toBeVisible();

  selfCheckMode = "dry_run_only";
  await modal
    .getByRole("button", { name: "Check localhost runner self-check" })
    .click();
  await expect(modal.getByText("available_dry_run_only")).toBeVisible();
  await expect(modal.getByText("Dry-run runner available")).toBeVisible();
  await expect(
    modal.getByText("Latest localhost self-check: available_dry_run_only", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(modal.getByText("Avanza dry-run capable")).toBeVisible();
  await expect(modal.getByText("Skeleton only").first()).toBeVisible();
  await expect(modal.getByText("No browser control").first()).toBeVisible();
  await expect(modal.getByText("Semi-auto only")).toBeVisible();
  await expect(
    modal.getByText(
      "Runner self-check passed for Avanza dry-run only. This still does not enable submission.",
    ),
  ).toBeVisible();
  await expect(
    modal.getByText(
      "Latest self-check says the runner can run Avanza dry-run only.",
    ),
  ).toBeVisible();
  await expect(modal.getByText("Runner cannot submit broker orders.")).toBeVisible();
  await expect(
    modal.getByText("Runner cannot click final confirmation."),
  ).toBeVisible();
  await expect(
    modal.getByText(
      "Avanza dry-run runner skeleton is installed for contract testing only.",
    ),
  ).toBeVisible();
  await expect(
    modal.getByRole("button", {
      name: /run avanza|start avanza|open avanza|search avanza|start search|run search|open order|start order/i,
    }),
  ).toHaveCount(0);

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
    const safeActionDiagnostics = {
      diagnosticsId: "safe_action_diagnostics_mock_agent_intercept",
      createdAt,
      completedAt: createdAt,
      mode: "semi_automatic",
      runnerName: "Playwright Intercepted Localhost Mock Agent",
      supportsRealBrowserExecution: true,
      ok: true,
      blocked: false,
      finalConfirmBlocked: false,
      steps: [
        {
          actionId: "intercepted_mock_agent_fill_ticker",
          kind: "fill",
          targetDescription: "Mock order ticker",
          targetTestId: MOCK_ORDER_PAGE_AGENT_SELECTORS.ticker.testId,
          status: "executed",
          validationOk: true,
          blocked: false,
          message: "Filled ticker in intercepted mock-agent diagnostics.",
          startedAt: createdAt,
          completedAt: createdAt,
          errors: [],
          warnings: [],
          metadata: { mockOnly: true },
        },
        {
          actionId: "intercepted_mock_agent_click_review",
          kind: "click",
          targetDescription: "Review mock order",
          targetTestId: MOCK_ORDER_PAGE_AGENT_SELECTORS.reviewButton.testId,
          status: "executed",
          validationOk: true,
          blocked: false,
          message: "Clicked only Review mock order in intercepted diagnostics.",
          startedAt: createdAt,
          completedAt: createdAt,
          errors: [],
          warnings: [],
          metadata: { mockOnly: true, reviewOnly: true },
        },
        {
          actionId: "intercepted_mock_agent_read_disabled_submit",
          kind: "read",
          targetDescription: "Verify disabled final submit",
          targetTestId: MOCK_ORDER_PAGE_AGENT_SELECTORS.submitDisabled.testId,
          status: "executed",
          validationOk: true,
          blocked: false,
          message: "Verified disabled submit in intercepted diagnostics.",
          startedAt: createdAt,
          completedAt: createdAt,
          errors: [],
          warnings: [],
          metadata: { mockOnly: true, noSubmit: true },
        },
      ],
      validatedCount: 0,
      executedCount: 3,
      blockedCount: 0,
      skippedCount: 0,
      failedCount: 0,
      errors: [],
      warnings: [],
      metadata: {
        mockOnly: true,
        devOnly: true,
        targetEnvironment: "mock_order_page",
        supportsBrokerSubmission: false,
        supportsFinalConfirmClick: false,
        automaticModeCapable: false,
        noAvanzaAutomation: true,
        noBrokerResult: true,
      },
    };

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
              mockAgentRunValidationErrors: [],
              mockAgentRunReviewVisible: true,
              mockAgentRunConfirmationLinkAvailable: true,
              mockAgentRunSubmitDisabled: true,
              mockAgentRunOrderModeVerified: true,
              safeActionDiagnostics,
              safeActionDiagnosticsAvailable: true,
              safeActionDiagnosticsMessage:
                "Safe action diagnostics generated for local mock-page testing only.",
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
  await page.evaluate((storageKey) => {
    window.localStorage.removeItem(storageKey);
  }, SAFE_BROWSER_ACTION_DIAGNOSTICS_STORAGE_KEY);
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
  await expect(modal.getByText("Order Mode Verified")).toBeVisible();
  await expect(modal.getByText("Review Visible")).toBeVisible();
  await expect(modal.getByText("Confirmation Link")).toBeVisible();
  await expect(modal.getByText("Submit Disabled")).toBeVisible();
  await expect(modal.getByText("Safe action diagnostics")).toBeVisible();
  await expect(
    modal.getByText("Safe action diagnostics saved locally."),
  ).toBeVisible();
  await expect(modal.getByText("Diagnostics OK")).toBeVisible();
  await expect(
    modal.getByText("Playwright Intercepted Localhost Mock Agent"),
  ).toBeVisible();
  await expect(modal.getByText("Final Confirm Blocked")).toBeVisible();
  await expect(modal.getByText("Mock-only browser diagnostics")).toBeVisible();
  await expect(modal.getByText("No broker submission")).toBeVisible();
  await expect(modal.getByText("Final confirm disabled")).toBeVisible();
  await expect(modal.getByText("Available")).toBeVisible();
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

  await stubSettingsRemoteReads(page);
  await page.goto("/settings");
  const safeActionDiagnosticsPanel = page.locator("section").filter({
    has: page.getByRole("heading", {
      name: "Safe Browser Action Diagnostics",
    }),
  });
  const agentRunsPanel = page.locator("section").filter({
    has: page.getByRole("heading", { name: "Avanza Agent Runs" }),
  });

  await expect(safeActionDiagnosticsPanel).toBeVisible();
  await expect(
    safeActionDiagnosticsPanel.getByText(
      "Playwright Intercepted Localhost Mock Agent",
    ),
  ).toBeVisible();
  await expect(
    safeActionDiagnosticsPanel.getByText("Mock-only browser diagnostics"),
  ).toBeVisible();
  await expect(
    safeActionDiagnosticsPanel.getByText("No broker submission").first(),
  ).toBeVisible();
  await expect(
    safeActionDiagnosticsPanel.getByText("Final-confirm Blocked"),
  ).toBeVisible();
  await expect(
    safeActionDiagnosticsPanel.getByText("0", { exact: true }).first(),
  ).toBeVisible();
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
  await stubSettingsRemoteReads(page);
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

  if (await isVisible(smokeChecklistHeading, 15_000)) {
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

test("shows safe browser action diagnostics in Settings dev viewer", async ({
  page,
}) => {
  const seededDiagnostics = {
    diagnosticsId: "safe_action_diagnostics_seeded_final_confirm",
    createdAt: "2026-06-11T12:00:00.000Z",
    completedAt: "2026-06-11T12:00:02.000Z",
    mode: "semi_automatic",
    runnerName: "Seeded Safe Action Diagnostics Test Runner",
    supportsRealBrowserExecution: true,
    ok: false,
    blocked: true,
    finalConfirmBlocked: true,
    steps: [
      {
        actionId: "seeded_safe_action_review",
        kind: "click",
        targetDescription: "Review mock order",
        targetTestId: MOCK_ORDER_PAGE_AGENT_SELECTORS.reviewButton.testId,
        status: "executed",
        validationOk: true,
        blocked: false,
        message: "Seeded review click executed in mock diagnostics only.",
        startedAt: "2026-06-11T12:00:00.000Z",
        completedAt: "2026-06-11T12:00:01.000Z",
        errors: [],
        warnings: [],
        metadata: {
          path: "settings_safe_action_diagnostics_seed",
        },
      },
      {
        actionId: "seeded_safe_action_final_confirm_block",
        kind: "click",
        targetDescription: "Bekräfta köp",
        status: "blocked",
        validationOk: false,
        blocked: true,
        message: "Seeded final-confirm block for Settings viewer.",
        startedAt: "2026-06-11T12:00:01.000Z",
        completedAt: "2026-06-11T12:00:02.000Z",
        errors: [
          "Semi-automatic mode must not click or select final confirmation targets.",
        ],
        warnings: [],
        metadata: {
          finalConfirmBlocked: true,
        },
      },
    ],
    validatedCount: 0,
    executedCount: 1,
    blockedCount: 1,
    skippedCount: 0,
    failedCount: 0,
    errors: [
      "Semi-automatic mode must not click or select final confirmation targets.",
    ],
    warnings: [],
    metadata: {
      source: "playwright_seed_only",
      not_broker_result: true,
      mockOnly: true,
      devOnly: true,
      targetEnvironment: "mock_order_page",
      supportsBrokerSubmission: false,
      supportsFinalConfirmClick: false,
      automaticModeCapable: false,
    },
  };
  const unknownDiagnostics = {
    ...seededDiagnostics,
    diagnosticsId: "safe_action_diagnostics_seeded_unknown_capability",
    createdAt: "2026-06-11T12:05:00.000Z",
    completedAt: "2026-06-11T12:05:01.000Z",
    runnerName: "Seeded Unknown Capability Runner",
    ok: true,
    blocked: false,
    finalConfirmBlocked: false,
    steps: [
      {
        actionId: "seeded_unknown_read",
        kind: "read",
        targetDescription: "Unknown diagnostics target",
        status: "executed",
        validationOk: true,
        blocked: false,
        message: "Seeded unknown capability diagnostic.",
        startedAt: "2026-06-11T12:05:00.000Z",
        completedAt: "2026-06-11T12:05:01.000Z",
        errors: [],
        warnings: [],
      },
    ],
    executedCount: 1,
    blockedCount: 0,
    errors: [],
    metadata: {
      source: "playwright_unknown_capability_seed",
      targetEnvironment: "unknown",
      supportsBrokerSubmission: false,
      supportsFinalConfirmClick: false,
    },
  };
  const avanzaDryRunDiagnostics = {
    ...seededDiagnostics,
    diagnosticsId: "safe_action_diagnostics_seeded_avanza_dry_run",
    createdAt: "2026-06-11T12:10:00.000Z",
    completedAt: "2026-06-11T12:10:01.000Z",
    runnerName: "Seeded Avanza Dry-Run Diagnostics Runner",
    ok: true,
    blocked: false,
    finalConfirmBlocked: false,
    steps: [
      {
        actionId: "seeded_avanza_dry_run_read",
        kind: "read",
        targetDescription: "Avanza dry-run confirmation readback",
        status: "executed",
        validationOk: true,
        blocked: false,
        message: "Seeded Avanza dry-run diagnostic, no broker submission.",
        startedAt: "2026-06-11T12:10:00.000Z",
        completedAt: "2026-06-11T12:10:01.000Z",
        errors: [],
        warnings: [],
      },
    ],
    executedCount: 1,
    blockedCount: 0,
    errors: [],
    metadata: {
      source: "playwright_avanza_dry_run_capability_seed",
      targetEnvironment: "avanza_broker",
      mockOnly: false,
      devOnly: true,
      dryRunOnly: true,
      supportsBrokerSubmission: false,
      supportsFinalConfirmClick: false,
      automaticModeCapable: false,
    },
  };
  const avanzaSubmissionDiagnostics = {
    ...avanzaDryRunDiagnostics,
    diagnosticsId: "safe_action_diagnostics_seeded_avanza_submission",
    createdAt: "2026-06-11T12:15:00.000Z",
    completedAt: "2026-06-11T12:15:01.000Z",
    runnerName: "Seeded Avanza Submission Capability Runner",
    metadata: {
      source: "playwright_avanza_submission_capability_seed",
      targetEnvironment: "avanza_broker",
      mockOnly: false,
      devOnly: true,
      dryRunOnly: true,
      supportsBrokerSubmission: true,
      supportsFinalConfirmClick: false,
      automaticModeCapable: false,
    },
  };

  await page.addInitScript(
    ({ key, diagnostics, unknown, avanzaDryRun, avanzaSubmission }) => {
      window.localStorage.setItem(
        key,
        JSON.stringify([
          diagnostics,
          unknown,
          avanzaDryRun,
          avanzaSubmission,
        ]),
      );
    },
    {
      key: SAFE_BROWSER_ACTION_DIAGNOSTICS_STORAGE_KEY,
      diagnostics: seededDiagnostics,
      unknown: unknownDiagnostics,
      avanzaDryRun: avanzaDryRunDiagnostics,
      avanzaSubmission: avanzaSubmissionDiagnostics,
    },
  );

  page.on("dialog", (dialog) => void dialog.accept());
  await stubSettingsRemoteReads(page);
  await page.goto("/settings");

  const safeActionDiagnosticsPanel = page.locator("section").filter({
    has: page.getByRole("heading", {
      name: "Safe Browser Action Diagnostics",
    }),
  });

  if (await isVisible(safeActionDiagnosticsPanel, 15_000)) {
    await expect(safeActionDiagnosticsPanel).toBeVisible();
    await expect(
      safeActionDiagnosticsPanel.getByText(
        "Local diagnostics for mock/future browser action runs. Not broker results. Not order execution.",
      ),
    ).toBeVisible();
    await expect(
      safeActionDiagnosticsPanel.getByText("Total Diagnostics"),
    ).toBeVisible();
    await expect(
      safeActionDiagnosticsPanel.getByText("Final-confirm Blocked"),
    ).toBeVisible();
    await expect(
      safeActionDiagnosticsPanel.getByText("4", { exact: true }).first(),
    ).toBeVisible();
    await expect(
      safeActionDiagnosticsPanel.getByText(
        "Seeded Safe Action Diagnostics Test Runner",
      ),
    ).toBeVisible();
    await expect(
      safeActionDiagnosticsPanel.getByText("Final confirm blocked"),
    ).toBeVisible();
    await expect(
      safeActionDiagnosticsPanel.getByText("Mock-only browser diagnostics"),
    ).toBeVisible();
    await expect(
      safeActionDiagnosticsPanel.getByText("No broker submission").first(),
    ).toBeVisible();
    await expect(
      safeActionDiagnosticsPanel.getByText("Final confirm disabled").first(),
    ).toBeVisible();
    await expect(
      safeActionDiagnosticsPanel.getByText("Seeded Unknown Capability Runner"),
    ).toBeVisible();
    await expect(
      safeActionDiagnosticsPanel.getByText("unknown_blocked"),
    ).toBeVisible();
    await expect(
      safeActionDiagnosticsPanel.getByText(
        "Seeded Avanza Dry-Run Diagnostics Runner",
      ),
    ).toBeVisible();
    await expect(
      safeActionDiagnosticsPanel.getByText("Avanza dry-run diagnostics"),
    ).toBeVisible();
    await expect(
      safeActionDiagnosticsPanel.getByText("dry_run_only"),
    ).toBeVisible();
    await expect(
      safeActionDiagnosticsPanel.getByText(
        "Avanza dry-run diagnostics are non-submitting and must remain separate from broker execution.",
      ),
    ).toBeVisible();
    await expect(
      safeActionDiagnosticsPanel.getByText(
        "Seeded Avanza Submission Capability Runner",
      ),
    ).toBeVisible();
    await expect(
      safeActionDiagnosticsPanel.getByText("real_broker_blocked"),
    ).toBeVisible();
    await expect(
      safeActionDiagnosticsPanel.getByText(
        "This diagnostics item is blocked or unknown by default and must not be treated as broker execution.",
      ),
    ).toBeVisible();
    await expect(
      safeActionDiagnosticsPanel.getByText("Blocked or failed"),
    ).toBeVisible();
    await expect(
      safeActionDiagnosticsPanel.getByText("Executed"),
    ).toBeVisible();
    await expect(
      safeActionDiagnosticsPanel.getByText("Blocked Count"),
    ).toBeVisible();
    await safeActionDiagnosticsPanel.getByText("Safe action steps").click();
    await expect(
      safeActionDiagnosticsPanel.getByText("Review mock order"),
    ).toBeVisible();
    await expect(
      safeActionDiagnosticsPanel.getByText("Bekräfta köp"),
    ).toBeVisible();

    await safeActionDiagnosticsPanel
      .getByRole("button", { name: "Clear diagnostics" })
      .click();
    await expect(
      safeActionDiagnosticsPanel.getByText(
        "Safe browser action diagnostics cleared.",
      ),
    ).toBeVisible();
    await expect(
      safeActionDiagnosticsPanel.getByText(
        "No local safe browser action diagnostics are stored in this browser yet.",
      ),
    ).toBeVisible();

    const remainingValue = await page.evaluate(
      (key) => window.localStorage.getItem(key),
      SAFE_BROWSER_ACTION_DIAGNOSTICS_STORAGE_KEY,
    );

    expect(remainingValue).toBeNull();
    return;
  }

  await expect(
    page.getByRole("heading", { name: "Execution Dev Tools" }),
  ).toBeVisible();
  await expect(
    page.getByText("Execution dev tools are disabled in this build."),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Safe Browser Action Diagnostics" }),
  ).toBeHidden();
});

test("checks bridge health and safely exercises the smoke checklist", async ({
  page,
}) => {
  page.on("dialog", (dialog) => void dialog.accept());

  await stubSettingsRemoteReads(page);
  await page.goto("/settings");

  const smokeChecklistHeading = page.getByRole("heading", {
    name: "Execution Sandbox Smoke Test",
  });

  if (!(await isVisible(smokeChecklistHeading, 15_000))) {
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
    "/mock-broker/order?ticker=QA.TEST&action=sell&quantity=42&orderType=limit&limitPrice=123.45&intendedPrice=124.00&targetPrice=130.00&stopLossPrice=118.00&mode=semi_automatic&account=Mock%20ISK&amountSek=5200.00&priceCurrency=USD&instrumentMarket=Nasdaq%20Mock&instrumentCurrency=USD&instrumentType=stock&orderMode=advanced&reviewButtonLabel=Granska%20s%C3%A4lj&confirmButtonLabel=Bekr%C3%A4fta%20s%C3%A4lj&cancelButtonLabel=Avbryt&validUntil=2026-06-11&estimatedFees=29.00&estimatedCourtage=19.00&estimatedFxFee=10.00&estimatedTotalAmount=5229.00&preliminaryFxRate=10.50&requestId=request_playwright&intentId=intent_playwright",
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
  await expect(
    page.getByTestId(MOCK_ORDER_PAGE_AGENT_SELECTORS.mode.testId),
  ).toHaveValue("semi_automatic");
  await expect(page.getByLabel("Account")).toHaveValue("Mock ISK");
  await expect(page.getByLabel("Amount SEK")).toHaveValue("5200.00");
  await expect(page.getByLabel("Price currency")).toHaveValue("USD");
  await expect(page.getByLabel("Instrument market")).toHaveValue(
    "Nasdaq Mock",
  );
  await expect(page.getByLabel("Instrument currency")).toHaveValue("USD");
  await expect(page.getByLabel("Instrument type")).toHaveValue("stock");
  await expect(
    page.getByTestId(MOCK_ORDER_PAGE_AGENT_SELECTORS.orderMode.testId),
  ).toHaveValue("advanced");
  await expect(page.getByLabel("Valid until")).toHaveValue("2026-06-11");
  await expect(page.getByLabel("Estimated fees")).toHaveValue("29.00");
  await expect(page.getByLabel("Estimated courtage")).toHaveValue("19.00");
  await expect(page.getByLabel("Estimated FX fee")).toHaveValue("10.00");
  await expect(page.getByLabel("Estimated total amount")).toHaveValue(
    "5229.00",
  );
  await expect(page.getByLabel("Preliminary FX rate")).toHaveValue("10.50");
  await expect(page.getByLabel("Review button label")).toHaveValue(
    "Granska sälj",
  );
  await expect(page.getByLabel("Confirm button label")).toHaveValue(
    "Bekräfta sälj",
  );
  await expect(page.getByLabel("Cancel button label")).toHaveValue("Avbryt");
  await expect(page.getByLabel("Request ID")).toHaveValue("request_playwright");
  await expect(page.getByLabel("Intent ID")).toHaveValue("intent_playwright");

  for (const selectorKey of [
    "ticker",
    "action",
    "quantity",
    "orderType",
    "limitPrice",
    "intendedPrice",
    "targetPrice",
    "stopLossPrice",
    "mode",
    "account",
    "amountSek",
    "priceCurrency",
    "instrumentMarket",
    "instrumentCurrency",
    "instrumentType",
    "orderMode",
    "reviewButtonLabel",
    "confirmButtonLabel",
    "cancelButtonLabel",
    "validUntil",
    "estimatedFees",
    "estimatedCourtage",
    "estimatedFxFee",
    "estimatedTotalAmount",
    "preliminaryFxRate",
    "requireManualFinalConfirmation",
    "allowAutomaticFinalSubmit",
    "requestId",
    "intentId",
    "reviewButton",
    "resetButton",
    "submitDisabled",
  ] as const) {
    const selector = MOCK_ORDER_PAGE_AGENT_SELECTORS[selectorKey];

    await expectStableAgentSelector(
      page.getByTestId(selector.testId),
      selector,
    );
  }

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
    reviewPanel.getByText("advanced", { exact: true }),
  ).toBeVisible();
  await expect(
    reviewPanel.getByText("Mock ISK", { exact: true }),
  ).toBeVisible();
  await expect(
    reviewPanel.getByText("5200.00", { exact: true }),
  ).toBeVisible();
  await expect(reviewPanel.getByText("USD", { exact: true }).first()).toBeVisible();
  await expect(
    reviewPanel.getByText("Nasdaq Mock", { exact: true }),
  ).toBeVisible();
  await expect(
    reviewPanel.getByText("stock", { exact: true }),
  ).toBeVisible();
  await expect(
    reviewPanel.getByText("2026-06-11", { exact: true }),
  ).toBeVisible();
  await expect(reviewPanel.getByText("29.00", { exact: true })).toBeVisible();
  await expect(reviewPanel.getByText("19.00", { exact: true })).toBeVisible();
  await expect(reviewPanel.getByText("10.00", { exact: true })).toBeVisible();
  await expect(
    reviewPanel.getByText("5229.00", { exact: true }),
  ).toBeVisible();
  await expect(reviewPanel.getByText("10.50", { exact: true })).toBeVisible();
  await expect(
    reviewPanel.getByText("Granska sälj", { exact: true }),
  ).toBeVisible();
  await expect(
    reviewPanel.getByText("Bekräfta sälj", { exact: true }),
  ).toBeVisible();
  await expect(
    reviewPanel.getByText("Avbryt", { exact: true }),
  ).toBeVisible();
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
  await expect(mockConfirmationLink).toHaveAttribute("href", /account=Mock\+ISK/);
  await expect(mockConfirmationLink).toHaveAttribute(
    "href",
    /amountExcludingFees=5200.00/,
  );
  await expect(mockConfirmationLink).toHaveAttribute("href", /courtage=19.00/);
  await expect(mockConfirmationLink).toHaveAttribute("href", /fxFee=10.00/);
  await expect(mockConfirmationLink).toHaveAttribute(
    "href",
    /preliminaryFxRate=10.50/,
  );
  await expect(mockConfirmationLink).toHaveAttribute(
    "href",
    /validUntil=2026-06-11/,
  );
  await expect(mockConfirmationLink).toHaveAttribute(
    "href",
    /totalAmount=5229.00/,
  );
  await expect(mockConfirmationLink).toHaveAttribute("href", /orderMode=advanced/);
  await expect(mockConfirmationLink).toHaveAttribute(
    "href",
    /confirmButtonLabel=Bekr/,
  );
  await expect(mockConfirmationLink).toHaveAttribute(
    "href",
    /cancelButtonLabel=Avbryt/,
  );

  await page
    .getByTestId(MOCK_ORDER_PAGE_AGENT_SELECTORS.resetButton.testId)
    .click();
  await expect(page.getByLabel("Ticker / symbol")).toHaveValue("QA.TEST");
  await expect(
    page.getByText("Fill the fake ticket and choose Review mock order."),
  ).toBeVisible();
});

test("blocks mock order review on Avanza-like validation errors", async ({
  page,
}) => {
  await page.goto(
    "/mock-broker/order?ticker=QA.INVALID&action=buy&quantity=10&orderType=limit&limitPrice=123.45&intendedPrice=123.45&mode=semi_automatic&account=Mock%20ISK&amountSek=1000.00&priceCurrency=USD&orderMode=advanced&reviewButtonLabel=Granska%20k%C3%B6p&confirmButtonLabel=Bekr%C3%A4fta%20k%C3%B6p&cancelButtonLabel=Avbryt&validUntil=2026-06-11&estimatedTotalAmount=1000.00&requestId=request_invalid_playwright&intentId=intent_invalid_playwright",
  );

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

  const validationErrors = page.getByTestId(
    MOCK_ORDER_PAGE_AGENT_SELECTORS.validationErrors.testId,
  );
  const reviewButton = page.getByTestId(
    MOCK_ORDER_PAGE_AGENT_SELECTORS.reviewButton.testId,
  );
  const submitButton = page.getByTestId(
    MOCK_ORDER_PAGE_AGENT_SELECTORS.submitDisabled.testId,
  );

  await page
    .getByTestId(MOCK_ORDER_PAGE_AGENT_SELECTORS.ticker.testId)
    .fill("");
  await page
    .getByTestId(MOCK_ORDER_PAGE_AGENT_SELECTORS.account.testId)
    .fill("");
  await reviewButton.click();

  await expect(validationErrors).toBeVisible();
  await expectStableAgentSelector(
    validationErrors,
    MOCK_ORDER_PAGE_AGENT_SELECTORS.validationErrors,
  );
  await expect(
    page.getByTestId(
      MOCK_ORDER_PAGE_AGENT_SELECTORS.validationErrorRequired.testId,
    ),
  ).toContainText("Account is required");
  await expect(
    page.getByTestId(
      MOCK_ORDER_PAGE_AGENT_SELECTORS.validationErrorRequired.testId,
    ),
  ).toContainText("Ticker is required");
  await expect(page.getByRole("link", {
    name: "Open mock confirmation page",
  })).toHaveCount(0);
  await expect(submitButton).toBeDisabled();

  await page
    .getByTestId(MOCK_ORDER_PAGE_AGENT_SELECTORS.ticker.testId)
    .fill("QA.INVALID");
  await page
    .getByTestId(MOCK_ORDER_PAGE_AGENT_SELECTORS.account.testId)
    .fill("Mock ISK");
  await page
    .getByTestId(MOCK_ORDER_PAGE_AGENT_SELECTORS.amountSek.testId)
    .fill(String(MOCK_ORDER_MIN_AMOUNT_SEK - 1));
  await page
    .getByTestId(MOCK_ORDER_PAGE_AGENT_SELECTORS.estimatedTotalAmount.testId)
    .fill(String(MOCK_ORDER_MIN_AMOUNT_SEK - 1));
  await reviewButton.click();

  await expect(validationErrors).toBeVisible();
  await expect(
    page.getByTestId(
      MOCK_ORDER_PAGE_AGENT_SELECTORS.validationErrorMinimumAmount.testId,
    ),
  ).toContainText(`Lägsta belopp för köp är ${MOCK_ORDER_MIN_AMOUNT_SEK} SEK`);
  await expect(page.getByRole("link", {
    name: "Open mock confirmation page",
  })).toHaveCount(0);
  await expect(submitButton).toBeDisabled();

  await page
    .getByTestId(MOCK_ORDER_PAGE_AGENT_SELECTORS.amountSek.testId)
    .fill(String(MOCK_ORDER_MIN_AMOUNT_SEK));
  await page
    .getByTestId(MOCK_ORDER_PAGE_AGENT_SELECTORS.estimatedTotalAmount.testId)
    .fill(String(MOCK_ORDER_MIN_AMOUNT_SEK));
  await page
    .getByTestId(MOCK_ORDER_PAGE_AGENT_SELECTORS.orderMode.testId)
    .selectOption("stop_loss");
  await reviewButton.click();

  await expect(validationErrors).toBeVisible();
  await expect(
    page.getByTestId(
      MOCK_ORDER_PAGE_AGENT_SELECTORS.validationErrorUnsupportedOrderMode.testId,
    ),
  ).toContainText("Only Advanced mock orders are supported in this sandbox.");
  await expect(page.getByRole("link", {
    name: "Open mock confirmation page",
  })).toHaveCount(0);
  await expect(submitButton).toBeDisabled();

  await page
    .getByTestId(MOCK_ORDER_PAGE_AGENT_SELECTORS.orderMode.testId)
    .selectOption("advanced");
  await reviewButton.click();

  await expect(validationErrors).toHaveCount(0);
  await expect(page.getByRole("link", {
    name: "Open mock confirmation page",
  })).toBeVisible();
  await expect(submitButton).toBeDisabled();
});

test("renders the dev-only mock broker confirmation page safely", async ({
  page,
}) => {
  await page.goto(
    buildMockOrderConfirmationUrl({
      account: "Mock ISK",
      action: "sell",
      amountExcludingFees: "5200.00",
      cancelButtonLabel: "Avbryt",
      confirmButtonLabel: "Bekräfta sälj",
      courtage: "19.00",
      executedPrice: "123.10",
      fxFee: "10.00",
      instrumentCurrency: "USD",
      instrumentMarket: "Nasdaq Mock",
      instrumentType: "stock",
      intentId: "intent_confirmation_playwright",
      message: "Mock confirmation rendered for Playwright only.",
      orderMode: "advanced",
      orderId: "mock_order_playwright",
      preliminaryFxRate: "10.50",
      priceCurrency: "USD",
      positionId: "position_confirmation_playwright",
      quantity: "42",
      recommendationId: "recommendation_confirmation_playwright",
      requestId: "request_confirmation_playwright",
      requestedPrice: "123.45",
      reviewButtonLabel: "Granska sälj",
      status: "filled",
      ticker: "QA.CONFIRM",
      totalAmount: "5229.00",
      validUntil: "2026-06-11",
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

  for (const selectorKey of [
    "safetyLabel",
    "status",
    "ticker",
    "action",
    "quantity",
    "requestedPrice",
    "executedPrice",
    "account",
    "amountExcludingFees",
    "courtage",
    "fxFee",
    "preliminaryFxRate",
    "validUntil",
    "totalAmount",
    "priceCurrency",
    "instrumentMarket",
    "instrumentCurrency",
    "instrumentType",
    "orderMode",
    "reviewButtonLabel",
    "confirmButtonLabel",
    "cancelButtonLabel",
    "orderId",
    "requestId",
    "intentId",
    "positionId",
    "recommendationId",
    "message",
  ] as const) {
    const selector = MOCK_ORDER_CONFIRMATION_SELECTORS[selectorKey];

    await expectStableAgentSelector(
      page.getByTestId(selector.testId),
      selector,
    );
  }

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
  await expect(page.getByTestId("mock-confirmation-account")).toContainText(
    "Mock ISK",
  );
  await expect(
    page.getByTestId("mock-confirmation-amount-excluding-fees"),
  ).toContainText("5200.00");
  await expect(page.getByTestId("mock-confirmation-courtage")).toContainText(
    "19.00",
  );
  await expect(page.getByTestId("mock-confirmation-fx-fee")).toContainText(
    "10.00",
  );
  await expect(
    page.getByTestId("mock-confirmation-preliminary-fx-rate"),
  ).toContainText("10.50");
  await expect(page.getByTestId("mock-confirmation-valid-until")).toContainText(
    "2026-06-11",
  );
  await expect(
    page.getByTestId("mock-confirmation-total-amount"),
  ).toContainText("5229.00");
  await expect(
    page.getByTestId("mock-confirmation-price-currency"),
  ).toContainText("USD");
  await expect(
    page.getByTestId("mock-confirmation-instrument-market"),
  ).toContainText("Nasdaq Mock");
  await expect(
    page.getByTestId("mock-confirmation-instrument-currency"),
  ).toContainText("USD");
  await expect(
    page.getByTestId("mock-confirmation-instrument-type"),
  ).toContainText("stock");
  await expect(page.getByTestId("mock-confirmation-order-mode")).toContainText(
    "advanced",
  );
  await expect(page.getByTestId("mock-confirmation-review-label")).toContainText(
    "Granska sälj",
  );
  await expect(page.getByTestId("mock-confirmation-confirm-label")).toContainText(
    "Bekräfta sälj",
  );
  await expect(page.getByTestId("mock-confirmation-cancel-label")).toContainText(
    "Avbryt",
  );
  await expect(page.getByRole("button", { name: "Bekräfta sälj" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Avbryt" })).toBeDisabled();
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
    account: "Mock ISK",
    action: "sell",
    amountExcludingFees: "5200.00",
    cancelButtonLabel: "Avbryt",
    confirmButtonLabel: "Bekräfta sälj",
    courtage: "19.00",
    executedPrice: "123.10",
    fxFee: "10.00",
    instrumentCurrency: "USD",
    instrumentMarket: "Nasdaq Mock",
    instrumentType: "stock",
    intentId: "intent_confirmation_playwright",
    message: "Mock confirmation rendered for Playwright only.",
    orderMode: "advanced",
    orderId: "mock_order_playwright",
    preliminaryFxRate: "10.50",
    priceCurrency: "USD",
    positionId: "position_confirmation_playwright",
    quantity: "42",
    recommendationId: "recommendation_confirmation_playwright",
    requestId: "request_confirmation_playwright",
    requestedPrice: "123.45",
    reviewButtonLabel: "Granska sälj",
    status: "filled",
    ticker: "QA.CONFIRM",
    totalAmount: "5229.00",
    validUntil: "2026-06-11",
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

  await stubSettingsRemoteReads(page);
  await page.goto("/settings");

  const devMockResultsPanel = page.locator("section").filter({
    has: page.getByRole("heading", { name: "Dev Mock Broker Results" }),
  });

  if (await isVisible(devMockResultsPanel, 15_000)) {
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
