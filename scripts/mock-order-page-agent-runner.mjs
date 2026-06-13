#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const DEFAULT_BASE_URL = "http://localhost:3000";
const TRADE_AUTH_COOKIE = "trade_auth";
const SAFE_ACTION_DIAGNOSTICS_RUNNER_NAME =
  "Localhost Mock Order Page Agent Runner";

const selectors = {
  ticker: {
    testId: "mock-order-ticker",
    dataAgentField: "mock-order-ticker",
  },
  action: {
    testId: "mock-order-action",
    dataAgentField: "mock-order-action",
  },
  quantity: {
    testId: "mock-order-quantity",
    dataAgentField: "mock-order-quantity",
  },
  orderType: {
    testId: "mock-order-type",
    dataAgentField: "mock-order-type",
  },
  limitPrice: {
    testId: "mock-order-limit-price",
    dataAgentField: "mock-order-limit-price",
  },
  intendedPrice: {
    testId: "mock-order-intended-price",
    dataAgentField: "mock-order-intended-price",
  },
  targetPrice: {
    testId: "mock-order-target-price",
    dataAgentField: "mock-order-target-price",
  },
  stopLossPrice: {
    testId: "mock-order-stop-loss-price",
    dataAgentField: "mock-order-stop-loss-price",
  },
  mode: {
    testId: "mock-order-mode",
    dataAgentField: "mock-order-mode",
  },
  account: {
    testId: "mock-order-account",
    dataAgentField: "mock-order-account",
  },
  amountSek: {
    testId: "mock-order-amount-sek",
    dataAgentField: "mock-order-amount-sek",
  },
  priceCurrency: {
    testId: "mock-order-price-currency",
    dataAgentField: "mock-order-price-currency",
  },
  instrumentMarket: {
    testId: "mock-order-instrument-market",
    dataAgentField: "mock-order-instrument-market",
  },
  instrumentCurrency: {
    testId: "mock-order-instrument-currency",
    dataAgentField: "mock-order-instrument-currency",
  },
  instrumentType: {
    testId: "mock-order-instrument-type",
    dataAgentField: "mock-order-instrument-type",
  },
  orderMode: {
    testId: "mock-order-mode-advanced",
    dataAgentField: "mock-order-mode-advanced",
  },
  reviewButtonLabel: {
    testId: "mock-order-review-label",
    dataAgentField: "mock-order-review-label",
  },
  confirmButtonLabel: {
    testId: "mock-order-confirm-label",
    dataAgentField: "mock-order-confirm-label",
  },
  cancelButtonLabel: {
    testId: "mock-order-cancel-label",
    dataAgentField: "mock-order-cancel-label",
  },
  validUntil: {
    testId: "mock-order-valid-until",
    dataAgentField: "mock-order-valid-until",
  },
  estimatedFees: {
    testId: "mock-order-estimated-fees",
    dataAgentField: "mock-order-estimated-fees",
  },
  estimatedCourtage: {
    testId: "mock-order-estimated-courtage",
    dataAgentField: "mock-order-estimated-courtage",
  },
  estimatedFxFee: {
    testId: "mock-order-estimated-fx-fee",
    dataAgentField: "mock-order-estimated-fx-fee",
  },
  estimatedTotalAmount: {
    testId: "mock-order-estimated-total-amount",
    dataAgentField: "mock-order-estimated-total-amount",
  },
  preliminaryFxRate: {
    testId: "mock-order-preliminary-fx-rate",
    dataAgentField: "mock-order-preliminary-fx-rate",
  },
  requireManualFinalConfirmation: {
    testId: "mock-order-require-manual-confirmation",
    dataAgentField: "mock-order-require-manual-confirmation",
  },
  allowAutomaticFinalSubmit: {
    testId: "mock-order-allow-automatic-submit",
    dataAgentField: "mock-order-allow-automatic-submit",
  },
  requestId: {
    testId: "mock-order-request-id",
    dataAgentField: "mock-order-request-id",
  },
  intentId: {
    testId: "mock-order-intent-id",
    dataAgentField: "mock-order-intent-id",
  },
  reviewButton: {
    testId: "mock-order-review-button",
    dataAgentField: "mock-order-review-button",
  },
  submitDisabled: {
    testId: "mock-order-submit-disabled",
    dataAgentField: "mock-order-submit-disabled",
  },
  validationErrors: {
    testId: "mock-order-validation-errors",
    dataAgentField: "mock-order-validation-errors",
  },
  validationError: {
    testId: "mock-order-validation-error",
    dataAgentField: "mock-order-validation-error",
  },
};

const editableTextFields = [
  "ticker",
  "quantity",
  "limitPrice",
  "intendedPrice",
  "account",
  "amountSek",
  "priceCurrency",
  "instrumentMarket",
  "instrumentCurrency",
  "instrumentType",
  "targetPrice",
  "stopLossPrice",
  "validUntil",
  "estimatedFees",
  "estimatedCourtage",
  "estimatedFxFee",
  "estimatedTotalAmount",
  "preliminaryFxRate",
  "reviewButtonLabel",
  "confirmButtonLabel",
  "cancelButtonLabel",
  "requestId",
  "intentId",
];

const editableSelectFields = ["action", "orderType", "mode", "orderMode"];

const requiredReviewFields = [
  "ticker",
  "action",
  "quantity",
  "orderType",
  "orderMode",
  "account",
  "priceCurrency",
  "instrumentMarket",
  "instrumentCurrency",
  "instrumentType",
  "validUntil",
  "estimatedFees",
  "estimatedCourtage",
  "estimatedFxFee",
  "estimatedTotalAmount",
  "reviewButtonLabel",
  "confirmButtonLabel",
  "cancelButtonLabel",
  "mode",
  "requestId",
  "intentId",
];

const defaultFillPlan = {
  version: "mock_order_page_fill_plan_v1",
  targetPath: "/mock-broker/order",
  source: "avanza_agent_request",
  requestId: "mock_agent_runner_request_001",
  intentId: "mock_agent_runner_intent_001",
  intentIdExpected: true,
  values: [
    fillValue("ticker", "QA.RUNNER"),
    fillValue("action", "buy"),
    fillValue("quantity", "7"),
    fillValue("orderType", "limit"),
    fillValue("limitPrice", "25.50"),
    fillValue("intendedPrice", "25.25"),
    fillValue("targetPrice", "30.00"),
    fillValue("stopLossPrice", "22.00"),
    fillValue("mode", "semi_automatic"),
    fillValue("account", "Mock account"),
    fillValue("amountSek", "178.50"),
    fillValue("priceCurrency", "USD"),
    fillValue("instrumentMarket", "Mock market"),
    fillValue("instrumentCurrency", "USD"),
    fillValue("instrumentType", "stock"),
    fillValue("orderMode", "advanced"),
    fillValue("reviewButtonLabel", "Granska köp"),
    fillValue("confirmButtonLabel", "Bekräfta köp"),
    fillValue("cancelButtonLabel", "Avbryt"),
    fillValue("validUntil", "2026-06-11"),
    fillValue("estimatedFees", "2.50"),
    fillValue("estimatedCourtage", "1.50"),
    fillValue("estimatedFxFee", "1.00"),
    fillValue("estimatedTotalAmount", "181.00"),
    fillValue("preliminaryFxRate", "10.50"),
    fillValue("requireManualFinalConfirmation", "true"),
    fillValue("allowAutomaticFinalSubmit", "false"),
    fillValue("requestId", "mock_agent_runner_request_001"),
    fillValue("intentId", "mock_agent_runner_intent_001"),
  ],
};

function fillValue(fieldKey, value) {
  return {
    fieldKey,
    selector: {
      fieldKey,
      ...selectors[fieldKey],
    },
    value,
  };
}

function parseArgs(argv) {
  const args = {
    baseUrl: process.env.MOCK_ORDER_AGENT_BASE_URL ?? DEFAULT_BASE_URL,
    headed: process.env.MOCK_ORDER_AGENT_HEADED === "true",
    pageUrl: "",
    planFile: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    const next = argv[index + 1];

    if (item === "--base-url" && next) {
      args.baseUrl = next;
      index += 1;
    } else if (item === "--page-url" && next) {
      args.pageUrl = next;
      index += 1;
    } else if (item === "--plan-file" && next) {
      args.planFile = next;
      index += 1;
    } else if (item === "--headed") {
      args.headed = true;
    } else if (item === "--help" || item === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown or incomplete argument: ${item}`);
    }
  }

  return args;
}

function printHelp() {
  console.log(`Usage: npm run mock-agent:run -- [options]

Options:
  --base-url <url>    Local app origin. Default: ${DEFAULT_BASE_URL}
  --page-url <url>    Relative or localhost mock page URL to open.
  --plan-file <path>  JSON file containing a MockOrderPageFillPlan.
  --headed            Show Chromium while the runner executes.

This runner only automates the local /mock-broker/order review flow. It does
not open Avanza, submit orders, create broker results, write Supabase, or
mutate trade state.`);
}

function isLocalhostUrl(url) {
  return (
    (url.protocol === "http:" || url.protocol === "https:") &&
    ["localhost", "127.0.0.1", "::1"].includes(url.hostname)
  );
}

function normalizeBaseUrl(value) {
  const url = new URL(value);

  if (!isLocalhostUrl(url)) {
    throw new Error("Base URL must use localhost, 127.0.0.1, or ::1.");
  }

  url.pathname = "";
  url.search = "";
  url.hash = "";

  return url.toString().replace(/\/+$/, "");
}

function normalizeMockPageUrl(baseUrl, value, plan) {
  const requestedUrl = value || buildMockPageUrlFromPlan(plan);
  const url = new URL(requestedUrl, baseUrl);

  if (!isLocalhostUrl(url)) {
    throw new Error("Mock page URL must be relative or localhost-only.");
  }

  if (url.origin !== new URL(baseUrl).origin) {
    throw new Error("Mock page URL origin must match the local app base URL.");
  }

  if (url.pathname !== "/mock-broker/order") {
    throw new Error("Mock page URL must target /mock-broker/order.");
  }

  return url.toString();
}

function loadFillPlan(planFile) {
  if (!planFile) {
    return defaultFillPlan;
  }

  const fullPath = resolve(planFile);
  const parsed = JSON.parse(readFileSync(fullPath, "utf8"));

  return parsed?.mockOrderFillPlan ?? parsed;
}

function getPlanValue(plan, fieldKey) {
  return (
    plan.values.find((value) => value.fieldKey === fieldKey)?.value?.trim() ??
    ""
  );
}

function createDiagnosticsId() {
  return `mock_agent_safe_action_diagnostics_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function getDiagnosticsMode(plan) {
  const mode = getPlanValue(plan, "mode");

  return mode === "automatic" ? "automatic" : "semi_automatic";
}

function createDiagnosticsStep({
  actionId,
  kind,
  targetDescription,
  targetTestId,
  status = "executed",
  validationOk = true,
  blocked = false,
  message,
  startedAt,
  completedAt = new Date().toISOString(),
  errors = [],
  warnings = [],
  metadata = undefined,
}) {
  return {
    actionId,
    kind,
    targetDescription,
    ...(targetTestId ? { targetTestId } : {}),
    status,
    validationOk,
    blocked,
    message,
    startedAt,
    completedAt,
    errors,
    warnings,
    ...(metadata ? { metadata } : {}),
  };
}

function createFieldStep(fieldKey, kind, startedAt, message) {
  return createDiagnosticsStep({
    actionId: `mock_agent_${kind}_${fieldKey}`,
    kind,
    targetDescription: `Mock order ${fieldKey}`,
    targetTestId: selectors[fieldKey]?.testId,
    startedAt,
    message,
    metadata: {
      mockOnly: true,
      fieldKey,
    },
  });
}

function createSafeActionDiagnostics({
  startedAt,
  completedAt = new Date().toISOString(),
  plan,
  steps,
  errors = [],
  warnings = [],
}) {
  const validatedCount = steps.filter((step) => step.status === "validated").length;
  const executedCount = steps.filter((step) => step.status === "executed").length;
  const blockedCount = steps.filter((step) => step.status === "blocked").length;
  const skippedCount = steps.filter((step) => step.status === "skipped").length;
  const failedCount = steps.filter((step) => step.status === "failed").length;
  const finalConfirmBlocked = steps.some(
    (step) => step.metadata?.finalConfirmBlocked === true,
  );

  return {
    diagnosticsId: createDiagnosticsId(),
    createdAt: startedAt,
    completedAt,
    mode: getDiagnosticsMode(plan),
    runnerName: SAFE_ACTION_DIAGNOSTICS_RUNNER_NAME,
    supportsRealBrowserExecution: true,
    ok: errors.length === 0 && blockedCount === 0 && failedCount === 0,
    blocked: blockedCount > 0,
    finalConfirmBlocked,
    steps,
    validatedCount,
    executedCount,
    blockedCount,
    skippedCount,
    failedCount,
    errors,
    warnings,
    metadata: {
      mockOnly: true,
      devOnly: true,
      targetEnvironment: "mock_order_page",
      supportsBrokerSubmission: false,
      supportsFinalConfirmClick: false,
      automaticModeCapable: false,
      localMockPageReviewOnly: true,
      noAvanzaAutomation: true,
      noBrokerResult: true,
      noSubmit: true,
      requestId: getPlanValue(plan, "requestId"),
      intentId: getPlanValue(plan, "intentId"),
    },
  };
}

function validateFillPlan(plan) {
  const errors = [];

  if (!plan || typeof plan !== "object") {
    return ["Fill plan is missing."];
  }

  if (plan.version !== "mock_order_page_fill_plan_v1") {
    errors.push("Fill plan version must be mock_order_page_fill_plan_v1.");
  }

  if (!Array.isArray(plan.values)) {
    errors.push("Fill plan values must be an array.");
  }

  for (const fieldKey of [
    "ticker",
    "action",
    "quantity",
    "orderType",
    "mode",
    "account",
    "priceCurrency",
    "orderMode",
    "reviewButtonLabel",
    "confirmButtonLabel",
    "cancelButtonLabel",
    "requestId",
    "intentId",
  ]) {
    if (!getPlanValue(plan, fieldKey)) {
      errors.push(`Fill plan ${fieldKey} is missing.`);
    }
  }

  if (!["buy", "sell"].includes(getPlanValue(plan, "action"))) {
    errors.push("Fill plan action must be buy or sell.");
  }

  if (!["market", "limit"].includes(getPlanValue(plan, "orderType"))) {
    errors.push("Fill plan orderType must be market or limit.");
  }

  if (!["semi_automatic", "automatic"].includes(getPlanValue(plan, "mode"))) {
    errors.push("Fill plan mode must be semi_automatic or automatic.");
  }

  if (getPlanValue(plan, "orderMode") !== "advanced") {
    errors.push("Fill plan orderMode must be advanced.");
  }

  const quantity = Number(getPlanValue(plan, "quantity"));

  if (!Number.isFinite(quantity) || quantity <= 0) {
    errors.push("Fill plan quantity must be greater than 0.");
  }

  return errors;
}

function buildMockPageUrlFromPlan(plan) {
  const params = new URLSearchParams();

  for (const value of plan.values ?? []) {
    if (value?.fieldKey && value?.value) {
      params.set(value.fieldKey, value.value);
    }
  }

  const query = params.toString();

  return query ? `/mock-broker/order?${query}` : "/mock-broker/order";
}

function readEnvValueFromLocalFile(name) {
  if (!existsSync(".env.local")) {
    return "";
  }

  const line = readFileSync(".env.local", "utf8")
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

function getTradeAuthCookieValue() {
  const password =
    process.env.TRADE_APP_PASSWORD ||
    readEnvValueFromLocalFile("TRADE_APP_PASSWORD");

  if (!password) {
    return "";
  }

  return createHash("sha256").update(`trade-auth:${password}`).digest("hex");
}

function contractLocator(page, fieldKey) {
  const selector = selectors[fieldKey];

  return page.locator(
    `[data-testid="${selector.testId}"][data-agent-field="${selector.dataAgentField}"]`,
  );
}

async function expectVisible(locator, message) {
  if (!(await locator.isVisible({ timeout: 10_000 }).catch(() => false))) {
    throw new Error(message);
  }
}

async function expectText(locator, expected, message) {
  const text = await locator.textContent({ timeout: 10_000 }).catch(() => "");

  if (!text?.includes(expected)) {
    throw new Error(message);
  }
}

function createRunResult(ok, message, errors, startedAt, metadata = {}) {
  const completedAt = new Date().toISOString();

  return {
    ok,
    message,
    errors,
    validationErrors: metadata.validationErrors ?? [],
    reviewVisible: metadata.reviewVisible ?? false,
    confirmationLinkAvailable: metadata.confirmationLinkAvailable ?? false,
    submitDisabled: metadata.submitDisabled ?? false,
    orderModeVerified: metadata.orderModeVerified ?? false,
    startedAt,
    completedAt,
    safeActionDiagnostics:
      metadata.safeActionDiagnostics ??
      createSafeActionDiagnostics({
        startedAt,
        completedAt,
        plan: metadata.plan ?? defaultFillPlan,
        steps: metadata.safeActionSteps ?? [],
        errors,
        warnings: metadata.safeActionWarnings ?? [],
      }),
  };
}

async function readValidationErrors(page) {
  const container = contractLocator(page, "validationErrors");

  if (!(await container.isVisible({ timeout: 500 }).catch(() => false))) {
    return [];
  }

  const items = await container
    .locator(
      `[data-testid="${selectors.validationError.testId}"][data-agent-field="${selectors.validationError.dataAgentField}"]`,
    )
    .allTextContents()
    .catch(() => []);

  return items.map((item) => item.trim()).filter(Boolean);
}

export async function runMockOrderPageAgent(options = {}) {
  const startedAt = new Date().toISOString();
  const diagnosticSteps = [];
  let browser = null;
  let plan = options.fillPlan ?? defaultFillPlan;

  try {
    const baseUrl = normalizeBaseUrl(options.baseUrl ?? DEFAULT_BASE_URL);
    const fillPlanErrors = validateFillPlan(plan);

    if (fillPlanErrors.length > 0) {
      throw new Error(`Invalid fill plan: ${fillPlanErrors.join(" ")}`);
    }

    const pageUrl = normalizeMockPageUrl(baseUrl, options.pageUrl ?? "", plan);
    browser = await chromium.launch({ headless: options.headed !== true });
    const context = await browser.newContext({ baseURL: baseUrl });
    const authCookie = getTradeAuthCookieValue();
    const navigationTimeout =
      Number.isFinite(options.timeoutMs) && options.timeoutMs > 0
        ? options.timeoutMs
        : 30_000;

    if (authCookie) {
      await context.addCookies([
        {
          httpOnly: true,
          name: TRADE_AUTH_COOKIE,
          sameSite: "Lax",
          secure: false,
          url: baseUrl,
          value: authCookie,
        },
      ]);
    }

    const page = await context.newPage();

    await page.goto(pageUrl, { timeout: navigationTimeout });

    const unavailableHeading = page.getByRole("heading", {
      name: "Mock broker order page unavailable",
    });

    if (await unavailableHeading.isVisible({ timeout: 1500 }).catch(() => false)) {
      throw new Error(
        "Mock broker order page is unavailable. Start the app with NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=true.",
      );
    }

    await expectVisible(
      page.getByRole("heading", { name: "Mock broker order ticket" }),
      "Mock broker order ticket did not render.",
    );

    for (const fieldKey of editableTextFields) {
      const stepStartedAt = new Date().toISOString();
      await contractLocator(page, fieldKey).fill(getPlanValue(plan, fieldKey));
      diagnosticSteps.push(
        createFieldStep(
          fieldKey,
          "fill",
          stepStartedAt,
          "Filled a known mock order page field.",
        ),
      );
    }

    for (const fieldKey of editableSelectFields) {
      const stepStartedAt = new Date().toISOString();
      await contractLocator(page, fieldKey).selectOption(
        getPlanValue(plan, fieldKey),
      );
      diagnosticSteps.push(
        createFieldStep(
          fieldKey,
          "select",
          stepStartedAt,
          "Selected a known mock order page field.",
        ),
      );
    }

    const orderModeStepStartedAt = new Date().toISOString();
    const orderModeVerified =
      (await contractLocator(page, "orderMode").inputValue()) === "advanced";

    if (!orderModeVerified) {
      diagnosticSteps.push(
        createDiagnosticsStep({
          actionId: "mock_agent_read_order_mode_advanced",
          kind: "read",
          targetDescription: "Verify mock order mode is advanced",
          targetTestId: selectors.orderMode.testId,
          status: "failed",
          validationOk: false,
          message: "Mock order mode was not advanced after fill.",
          startedAt: orderModeStepStartedAt,
          errors: ["Mock order page orderMode was not advanced after fill."],
          metadata: { mockOnly: true },
        }),
      );
      throw new Error("Mock order page orderMode was not advanced after fill.");
    }
    diagnosticSteps.push(
      createDiagnosticsStep({
        actionId: "mock_agent_read_order_mode_advanced",
        kind: "read",
        targetDescription: "Verify mock order mode is advanced",
        targetTestId: selectors.orderMode.testId,
        message: "Verified mock order mode is advanced.",
        startedAt: orderModeStepStartedAt,
        metadata: { mockOnly: true },
      }),
    );

    const manualConfirmationStepStartedAt = new Date().toISOString();
    await expectText(
      contractLocator(page, "requireManualFinalConfirmation"),
      getPlanValue(plan, "requireManualFinalConfirmation"),
      "Manual confirmation field did not reflect the fill plan.",
    );
    diagnosticSteps.push(
      createDiagnosticsStep({
        actionId: "mock_agent_read_manual_confirmation_required",
        kind: "read",
        targetDescription: "Verify manual confirmation requirement",
        targetTestId: selectors.requireManualFinalConfirmation.testId,
        message: "Verified manual confirmation requirement readback.",
        startedAt: manualConfirmationStepStartedAt,
        metadata: { mockOnly: true },
      }),
    );
    const automaticSubmitStepStartedAt = new Date().toISOString();
    await expectText(
      contractLocator(page, "allowAutomaticFinalSubmit"),
      getPlanValue(plan, "allowAutomaticFinalSubmit"),
      "Automatic submit field did not reflect the fill plan.",
    );
    diagnosticSteps.push(
      createDiagnosticsStep({
        actionId: "mock_agent_read_automatic_submit_disallowed",
        kind: "read",
        targetDescription: "Verify automatic submit readback",
        targetTestId: selectors.allowAutomaticFinalSubmit.testId,
        message: "Verified automatic submit readback.",
        startedAt: automaticSubmitStepStartedAt,
        metadata: { mockOnly: true },
      }),
    );

    const submitDisabledStepStartedAt = new Date().toISOString();
    let submitDisabled = await contractLocator(page, "submitDisabled").isDisabled();

    if (!submitDisabled) {
      diagnosticSteps.push(
        createDiagnosticsStep({
          actionId: "mock_agent_read_submit_disabled_before_review",
          kind: "read",
          targetDescription: "Verify disabled final submit before review",
          targetTestId: selectors.submitDisabled.testId,
          status: "failed",
          validationOk: false,
          message: "Disabled final submit button was unexpectedly enabled.",
          startedAt: submitDisabledStepStartedAt,
          errors: ["Disabled final submit button was unexpectedly enabled."],
          metadata: { mockOnly: true, noSubmit: true },
        }),
      );
      throw new Error("Disabled final submit button was unexpectedly enabled.");
    }
    diagnosticSteps.push(
      createDiagnosticsStep({
        actionId: "mock_agent_read_submit_disabled_before_review",
        kind: "read",
        targetDescription: "Verify disabled final submit before review",
        targetTestId: selectors.submitDisabled.testId,
        message: "Verified disabled final submit before review.",
        startedAt: submitDisabledStepStartedAt,
        metadata: { mockOnly: true, noSubmit: true },
      }),
    );

    const preReviewValidationStepStartedAt = new Date().toISOString();
    const preReviewValidationErrors = await readValidationErrors(page);

    if (preReviewValidationErrors.length > 0) {
      diagnosticSteps.push(
        createDiagnosticsStep({
          actionId: "mock_agent_read_pre_review_validation_errors",
          kind: "read",
          targetDescription: "Read mock validation errors before review",
          targetTestId: selectors.validationErrors.testId,
          status: "failed",
          validationOk: false,
          message: "Mock validation errors were visible before review.",
          startedAt: preReviewValidationStepStartedAt,
          errors: preReviewValidationErrors,
          metadata: { mockOnly: true },
        }),
      );
      throw new Error(
        `Mock validation errors were visible before review: ${preReviewValidationErrors.join(" ")}`,
      );
    }
    diagnosticSteps.push(
      createDiagnosticsStep({
        actionId: "mock_agent_read_pre_review_validation_errors",
        kind: "read",
        targetDescription: "Read mock validation errors before review",
        targetTestId: selectors.validationErrors.testId,
        message: "Verified no mock validation errors were visible before review.",
        startedAt: preReviewValidationStepStartedAt,
        metadata: { mockOnly: true },
      }),
    );

    const reviewClickStartedAt = new Date().toISOString();
    await contractLocator(page, "reviewButton").click();
    diagnosticSteps.push(
      createDiagnosticsStep({
        actionId: "mock_agent_click_review_mock_order",
        kind: "click",
        targetDescription: "Review mock order",
        targetTestId: selectors.reviewButton.testId,
        message: "Clicked only the local Review mock order button.",
        startedAt: reviewClickStartedAt,
        metadata: { mockOnly: true, reviewOnly: true },
      }),
    );

    const postReviewValidationStartedAt = new Date().toISOString();
    const validationErrors = await readValidationErrors(page);

    if (validationErrors.length > 0) {
      diagnosticSteps.push(
        createDiagnosticsStep({
          actionId: "mock_agent_read_post_review_validation_errors",
          kind: "read",
          targetDescription: "Read mock validation errors after review",
          targetTestId: selectors.validationErrors.testId,
          status: "failed",
          validationOk: false,
          message: "Mock validation errors appeared after review.",
          startedAt: postReviewValidationStartedAt,
          errors: validationErrors,
          metadata: { mockOnly: true },
        }),
      );
      return createRunResult(
        false,
        "Mock order page agent runner stopped on mock validation errors. No submit was clicked.",
        validationErrors,
        startedAt,
        {
          plan,
          safeActionSteps: diagnosticSteps,
          validationErrors,
          orderModeVerified,
          submitDisabled,
        },
      );
    }

    const reviewPanel = page.locator("aside").filter({
      has: page.getByRole("heading", { name: "Review mock order" }),
    });

    const reviewPanelStartedAt = new Date().toISOString();
    await expectVisible(reviewPanel, "Mock review panel did not appear.");
    const reviewVisible = true;

    for (const fieldKey of requiredReviewFields) {
      const value = getPlanValue(plan, fieldKey);

      await expectVisible(
        reviewPanel.getByText(value, { exact: true }),
        `Review panel did not include ${fieldKey}: ${value}.`,
      );
    }
    diagnosticSteps.push(
      createDiagnosticsStep({
        actionId: "mock_agent_read_review_panel",
        kind: "read",
        targetDescription: "Verify mock review panel readback",
        message: "Verified mock review panel and required readback fields.",
        startedAt: reviewPanelStartedAt,
        metadata: { mockOnly: true },
      }),
    );

    const confirmationLinkStartedAt = new Date().toISOString();
    const confirmationLinkAvailable = await page
      .getByRole("link", { name: "Open mock confirmation page" })
      .isVisible({ timeout: 1500 })
      .catch(() => false);

    if (!confirmationLinkAvailable) {
      diagnosticSteps.push(
        createDiagnosticsStep({
          actionId: "mock_agent_read_confirmation_link",
          kind: "read",
          targetDescription: "Verify mock confirmation link availability",
          status: "failed",
          validationOk: false,
          message: "Mock confirmation link was not available after review.",
          startedAt: confirmationLinkStartedAt,
          errors: ["Mock confirmation link was not available after review."],
          metadata: { mockOnly: true },
        }),
      );
      throw new Error("Mock confirmation link was not available after review.");
    }
    diagnosticSteps.push(
      createDiagnosticsStep({
        actionId: "mock_agent_read_confirmation_link",
        kind: "read",
        targetDescription: "Verify mock confirmation link availability",
        message: "Verified mock confirmation link is available.",
        startedAt: confirmationLinkStartedAt,
        metadata: { mockOnly: true, notClicked: true },
      }),
    );

    const submitDisabledAfterReviewStartedAt = new Date().toISOString();
    submitDisabled = await contractLocator(page, "submitDisabled").isDisabled();

    if (!submitDisabled) {
      diagnosticSteps.push(
        createDiagnosticsStep({
          actionId: "mock_agent_read_submit_disabled_after_review",
          kind: "read",
          targetDescription: "Verify disabled final submit after review",
          targetTestId: selectors.submitDisabled.testId,
          status: "failed",
          validationOk: false,
          message: "Disabled final submit button changed after review.",
          startedAt: submitDisabledAfterReviewStartedAt,
          errors: ["Disabled final submit button changed after review."],
          metadata: { mockOnly: true, noSubmit: true },
        }),
      );
      throw new Error("Disabled final submit button changed after review.");
    }
    diagnosticSteps.push(
      createDiagnosticsStep({
        actionId: "mock_agent_read_submit_disabled_after_review",
        kind: "read",
        targetDescription: "Verify disabled final submit after review",
        targetTestId: selectors.submitDisabled.testId,
        message: "Verified disabled final submit after review.",
        startedAt: submitDisabledAfterReviewStartedAt,
        metadata: { mockOnly: true, noSubmit: true },
      }),
    );

    return createRunResult(
      true,
      `Mock order page agent runner passed for ${getPlanValue(plan, "ticker")}. No submit was clicked.`,
      [],
      startedAt,
      {
        plan,
        safeActionSteps: diagnosticSteps,
        confirmationLinkAvailable,
        orderModeVerified,
        reviewVisible,
        submitDisabled,
        validationErrors: [],
      },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown mock-agent error.";

    if (!diagnosticSteps.some((step) => step.status === "failed")) {
      diagnosticSteps.push(
        createDiagnosticsStep({
          actionId: "mock_agent_safe_stop",
          kind: "stop",
          targetDescription: "Mock agent safe stop",
          status: "failed",
          validationOk: false,
          message: "Mock order page agent runner failed safely.",
          startedAt: new Date().toISOString(),
          errors: [message],
          metadata: { mockOnly: true, safeStop: true },
        }),
      );
    }

    return createRunResult(
      false,
      "Mock order page agent runner failed safely. No submit was clicked.",
      [message],
      startedAt,
      {
        plan,
        safeActionSteps: diagnosticSteps,
      },
    );
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}

async function runCli() {
  const args = parseArgs(process.argv.slice(2));
  const result = await runMockOrderPageAgent({
    baseUrl: args.baseUrl,
    fillPlan: loadFillPlan(args.planFile),
    headed: args.headed,
    pageUrl: args.pageUrl,
  });

  if (!result.ok) {
    throw new Error(`${result.message} ${result.errors.join(" ")}`.trim());
  }

  console.log(result.message);
}

const executedPath = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : "";

if (import.meta.url === executedPath) {
  runCli().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
