#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const DEFAULT_BASE_URL = "http://localhost:3000";
const TRADE_AUTH_COOKIE = "trade_auth";

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
};

const editableTextFields = [
  "ticker",
  "quantity",
  "limitPrice",
  "intendedPrice",
  "targetPrice",
  "stopLossPrice",
  "requestId",
  "intentId",
];

const editableSelectFields = ["action", "orderType", "mode"];

const requiredReviewFields = [
  "ticker",
  "action",
  "quantity",
  "orderType",
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

function createRunResult(ok, message, errors, startedAt) {
  return {
    ok,
    message,
    errors,
    startedAt,
    completedAt: new Date().toISOString(),
  };
}

export async function runMockOrderPageAgent(options = {}) {
  const startedAt = new Date().toISOString();
  let browser = null;

  try {
    const baseUrl = normalizeBaseUrl(options.baseUrl ?? DEFAULT_BASE_URL);
    const plan = options.fillPlan ?? defaultFillPlan;
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
      await contractLocator(page, fieldKey).fill(getPlanValue(plan, fieldKey));
    }

    for (const fieldKey of editableSelectFields) {
      await contractLocator(page, fieldKey).selectOption(
        getPlanValue(plan, fieldKey),
      );
    }

    await expectText(
      contractLocator(page, "requireManualFinalConfirmation"),
      getPlanValue(plan, "requireManualFinalConfirmation"),
      "Manual confirmation field did not reflect the fill plan.",
    );
    await expectText(
      contractLocator(page, "allowAutomaticFinalSubmit"),
      getPlanValue(plan, "allowAutomaticFinalSubmit"),
      "Automatic submit field did not reflect the fill plan.",
    );

    if (!(await contractLocator(page, "submitDisabled").isDisabled())) {
      throw new Error("Disabled final submit button was unexpectedly enabled.");
    }

    await contractLocator(page, "reviewButton").click();

    const reviewPanel = page.locator("aside").filter({
      has: page.getByRole("heading", { name: "Review mock order" }),
    });

    await expectVisible(reviewPanel, "Mock review panel did not appear.");

    for (const fieldKey of requiredReviewFields) {
      const value = getPlanValue(plan, fieldKey);

      await expectVisible(
        reviewPanel.getByText(value, { exact: true }),
        `Review panel did not include ${fieldKey}: ${value}.`,
      );
    }

    if (!(await contractLocator(page, "submitDisabled").isDisabled())) {
      throw new Error("Disabled final submit button changed after review.");
    }

    return createRunResult(
      true,
      `Mock order page agent runner passed for ${getPlanValue(plan, "ticker")}. No submit was clicked.`,
      [],
      startedAt,
    );
  } catch (error) {
    return createRunResult(
      false,
      "Mock order page agent runner failed safely. No submit was clicked.",
      [error instanceof Error ? error.message : "Unknown mock-agent error."],
      startedAt,
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
