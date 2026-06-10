import { expect, type Locator, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { buildAvanzaAgentRequest } from "../../lib/avanza-agent-adapter";
import { buildAvanzaExecutionHandoff } from "../../lib/avanza-execution-handoff";
import {
  getExecutionAuthorityForMode,
  type ExecutionIntent,
} from "../../lib/execution";
import {
  buildMockOrderPageFillPlanFromAgentRequest,
  buildMockOrderPageUrlFromFillPlan,
  MOCK_ORDER_PAGE_AGENT_SELECTORS,
  validateMockOrderPageFillPlan,
} from "../../lib/mock-order-page-agent-contract";
import {
  fillMockOrderPageFromPlan,
  openMockOrderPageWithPlan,
  verifyMockOrderPageReviewFromPlan,
} from "./helpers/mock-order-fill-runner";

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
  selector: (typeof MOCK_ORDER_PAGE_AGENT_SELECTORS)[keyof typeof MOCK_ORDER_PAGE_AGENT_SELECTORS],
) {
  await expect(locator).toHaveAttribute("data-testid", selector.testId);
  await expect(locator).toHaveAttribute(
    "data-agent-field",
    selector.dataAgentField,
  );
}

function buildMockOrderPageAgentRequestFixture() {
  const mode = "semi_automatic";
  const intent: ExecutionIntent = {
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

  await page.route("http://127.0.0.1:47831/run", async (route) => {
    const payload = route.request().postDataJSON() as {
      request?: { requestId?: string };
      envelope?: { requestId?: string };
    };
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
          "Mock order fill plan generated for local testing only. No browser was opened.",
        mockOrderFillPlan,
        mockOrderFillPlanValid: mockOrderFillPlanValidation.ok,
        mockOrderFillPlanErrors: mockOrderFillPlanValidation.errors,
        mockOrderFillPlanWarnings: mockOrderFillPlanValidation.warnings,
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
                "Playwright localhost bridge echo started. No broker page opened.",
            },
            {
              eventId: "avanza_agent_progress_playwright_ready",
              requestId,
              createdAt,
              type: "order_review_ready",
              message:
                "Playwright localhost bridge echo reached review-ready protocol state only.",
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
    await expect(
      page.getByRole("heading", { name: "Agent Adapter Diagnostics" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Avanza Agent Runs" }),
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

  await page
    .getByTestId(MOCK_ORDER_PAGE_AGENT_SELECTORS.resetButton.testId)
    .click();
  await expect(page.getByLabel("Ticker / symbol")).toHaveValue("QA.TEST");
  await expect(
    page.getByText("Fill the fake ticket and choose Review mock order."),
  ).toBeVisible();
});
