import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { prepareSandboxBrowserAgentFill } from "../../lib/sandbox-browser-agent-adapter";
import { buildSemiAutoRecommendationBuyPayload } from "../../lib/semi-auto-agent-payload-builder";

const repoRoot = process.cwd();
const componentPath = join(
  repoRoot,
  "components/execution/SandboxBrokerOrderForm.tsx",
);
const testPath = join(
  repoRoot,
  "tests/e2e/sandbox-browser-agent-selector-stability.spec.ts",
);
const now = "2026-06-29T14:30:00.000Z";
const tradeAuthCookieName = "trade_auth";

const requiredSelectors = [
  "sandbox-broker-form",
  "sandbox-broker-field-ticker",
  "sandbox-broker-field-side",
  "sandbox-broker-field-quantity",
  "sandbox-broker-field-order-type",
  "sandbox-broker-field-entry-price",
  "sandbox-broker-field-stop",
  "sandbox-broker-field-target",
  "sandbox-broker-field-planned-risk",
  "sandbox-broker-field-payload-id",
  "sandbox-broker-preview",
  "sandbox-broker-safety-checklist",
  "sandbox-broker-final-control",
  "sandbox-broker-no-avanza-copy",
  "sandbox-broker-no-broker-submit-copy",
  "sandbox-broker-no-automatic-submit-copy",
] as const;

const landmarkSelectors = [
  "sandbox-broker-form",
  "sandbox-broker-preview",
  "sandbox-broker-safety-checklist",
  "sandbox-broker-final-control",
  "sandbox-broker-no-avanza-copy",
  "sandbox-broker-no-broker-submit-copy",
  "sandbox-broker-no-automatic-submit-copy",
] as const;

function readEnvValue(name: string) {
  const env = readFileSync(join(repoRoot, ".env.local"), "utf8");
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

function buildFillPlan() {
  const payload = buildSemiAutoRecommendationBuyPayload(
    {
      broker_target_label: "Sandbox selector-stability handoff",
      created_at: "2026-06-29T14:25:00.000Z",
      entry_price: 212.1,
      expires_at: "2026-06-29T14:45:00.000Z",
      limit_price: 212.1,
      order_type: "limit",
      quantity: 8,
      recommendation_fingerprint:
        "recommendation-selector-stability-fp-001",
      recommendation_id: "rec-selector-stability-001",
      stale_after: "2026-06-29T14:40:00.000Z",
      stop_price: 209.1,
      target_price: 218.1,
      ticker: "AAPL",
    },
    { now },
  ).payload;

  const result = prepareSandboxBrowserAgentFill(payload, { now });

  if (result.status !== "ready" || !result.prepared_fields) {
    throw new Error("Expected ready selector-stability sandbox fill plan");
  }

  return result.prepared_fields;
}

test.describe("sandbox browser agent selector stability", () => {
  test("keeps the required sandbox selector contract in source", () => {
    const source = readFileSync(componentPath, "utf8");

    for (const selector of requiredSelectors) {
      expect(source).toContain(selector);
    }

    for (const selector of landmarkSelectors) {
      expect(source).toContain(`data-testid="${selector}"`);
    }

    expect(source).toContain("data-testid={fieldTestIds[id]}");

    expect(source).toContain("data-sandbox-broker-field={id}");
    expect(source).toContain('data-sandbox-broker-field="action"');
    expect(source).toContain('data-sandbox-broker-field="orderType"');
  });

  test("fills sandbox fields through stable selectors without external calls", async ({
    baseURL,
    context,
    page,
  }) => {
    if (!baseURL) {
      throw new Error("Playwright baseURL is required for selector QA.");
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

    const requestedUrls: string[] = [];
    page.on("request", (request) => requestedUrls.push(request.url()));
    const fillPlan = buildFillPlan();

    await page.goto("/sandbox-broker");
    await expect(page).toHaveURL(/\/sandbox-broker$/);

    await expect(page.getByTestId("sandbox-broker-form")).toBeVisible();
    await expect(page.getByTestId("sandbox-broker-no-avanza-copy")).toBeVisible();
    await expect(
      page.getByTestId("sandbox-broker-no-broker-submit-copy"),
    ).toBeVisible();
    await expect(
      page.getByTestId("sandbox-broker-no-automatic-submit-copy"),
    ).toBeVisible();

    await page.getByTestId("sandbox-broker-field-ticker").fill(fillPlan.ticker);
    await page
      .getByTestId("sandbox-broker-field-side")
      .selectOption(fillPlan.action);
    await page
      .getByTestId("sandbox-broker-field-quantity")
      .fill(String(fillPlan.quantity));
    await page
      .getByTestId("sandbox-broker-field-order-type")
      .selectOption(fillPlan.order_type);
    await page
      .getByTestId("sandbox-broker-field-entry-price")
      .fill(fillPlan.entry_price?.toFixed(2) ?? "");
    await page
      .getByTestId("sandbox-broker-field-stop")
      .fill(fillPlan.stop.toFixed(2));
    await page
      .getByTestId("sandbox-broker-field-target")
      .fill(fillPlan.target.toFixed(2));
    await page
      .getByTestId("sandbox-broker-field-planned-risk")
      .fill(fillPlan.planned_risk.toFixed(2));
    await page
      .getByTestId("sandbox-broker-field-payload-id")
      .fill(fillPlan.payload_id);

    const preview = page.getByTestId("sandbox-broker-preview");
    await expect(preview.getByText(fillPlan.ticker).first()).toBeVisible();
    await expect(preview.getByText(fillPlan.action).first()).toBeVisible();
    await expect(preview.getByText(String(fillPlan.quantity)).first()).toBeVisible();
    await expect(preview.getByText(fillPlan.order_type).first()).toBeVisible();
    await expect(
      preview.getByText(fillPlan.entry_price?.toFixed(2) ?? "").first(),
    ).toBeVisible();
    await expect(preview.getByText(fillPlan.stop.toFixed(2)).first()).toBeVisible();
    await expect(preview.getByText(fillPlan.target.toFixed(2)).first()).toBeVisible();
    await expect(
      preview.getByText(fillPlan.planned_risk.toFixed(2)).first(),
    ).toBeVisible();
    await expect(preview.getByText(fillPlan.payload_id).first()).toBeVisible();

    const safetyChecklist = page.getByTestId("sandbox-broker-safety-checklist");
    await expect(safetyChecklist.getByText("No Avanza order")).toBeVisible();
    await expect(safetyChecklist.getByText("No broker submit")).toBeVisible();
    await expect(
      safetyChecklist.getByText("Automatic submit allowed"),
    ).toBeVisible();
    await expect(
      safetyChecklist.getByText("Automatic submit attempted"),
    ).toBeVisible();

    const finalControl = page.getByTestId("sandbox-broker-final-control");
    await expect(finalControl).toBeDisabled();
    await expect(finalControl).toContainText("Disabled fake KÖP");
    await expect(page.locator("form")).toHaveCount(0);

    const expectedOrigin = new URL(baseURL).origin;
    for (const url of requestedUrls) {
      expect(
        url.startsWith(expectedOrigin) || url.startsWith("data:"),
        `Unexpected external navigation/request: ${url}`,
      ).toBe(true);
      expect(url).not.toContain("/api/");
      expect(url).not.toMatch(/avanza/i);
    }
  });

  test("keeps selector-stability QA free of forbidden production behavior", () => {
    const guardedSource = readFileSync(componentPath, "utf8");
    const testSource = readFileSync(testPath, "utf8");

    const forbidden = [
      ["https://", "avanza"],
      ["http://", "avanza"],
      [".", "click", "("],
      ["fetch", "("],
      ["create", "Client"],
      [".", "from", "("],
      [".", "insert", "("],
      ["execution-record", "-audit-writer"],
      ["audit", "-writer"],
      ["SUPABASE", "_SERVICE_ROLE"],
      ["service", "-role"],
      ["process", ".env"],
      ["run", "-scan"],
      ["pro", "vider"],
      ["scan", "ner"],
      ["market", "-loop"],
      ["record", "Trade"],
      ["update", "Trade"],
      ["trade_stats_pnl_mutated", ": true"],
      ["automatic_submit_allowed", ": true"],
      ["automatic_submit_attempted", ": true"],
      ["agent_can_submit_order", ": true"],
    ].map((parts) => parts.join(""));

    for (const item of forbidden) {
      expect(guardedSource).not.toContain(item);
    }

    expect(testSource).not.toMatch(/https?:\/\/[^"']*avanza/i);
    expect(testSource).not.toContain([".", "click", "("].join(""));
  });
});
