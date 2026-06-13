import { expect, type Locator, type Page } from "@playwright/test";
import {
  buildMockOrderPageUrlFromFillPlan,
  MOCK_ORDER_PAGE_AGENT_SELECTORS,
  type MockOrderPageFieldKey,
  type MockOrderPageFillPlan,
  type MockOrderPageSelectorKey,
  validateMockOrderPageFillPlan,
} from "../../../lib/mock-order-page-agent-contract";

type EditableMockOrderPageFieldKey = Exclude<
  MockOrderPageFieldKey,
  "requireManualFinalConfirmation" | "allowAutomaticFinalSubmit"
>;

const editableTextFieldKeys: EditableMockOrderPageFieldKey[] = [
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

const editableSelectFieldKeys: EditableMockOrderPageFieldKey[] = [
  "action",
  "orderType",
  "mode",
  "orderMode",
];

function getPlanValue(
  plan: MockOrderPageFillPlan,
  fieldKey: MockOrderPageFieldKey,
) {
  return (
    plan.values.find((value) => value.fieldKey === fieldKey)?.value.trim() ?? ""
  );
}

function getContractLocator(page: Page, fieldKey: MockOrderPageSelectorKey) {
  const selector = MOCK_ORDER_PAGE_AGENT_SELECTORS[fieldKey];

  return page.locator(
    `[data-testid="${selector.testId}"][data-agent-field="${selector.dataAgentField}"]`,
  );
}

async function expectPlanValueInReview(
  reviewPanel: Locator,
  plan: MockOrderPageFillPlan,
  fieldKey: MockOrderPageFieldKey,
) {
  const value = getPlanValue(plan, fieldKey);

  if (value) {
    await expect(
      reviewPanel.getByText(value, { exact: true }).first(),
    ).toBeVisible();
  }
}

function assertValidFillPlan(plan: MockOrderPageFillPlan) {
  const validation = validateMockOrderPageFillPlan(plan);
  const orderMode = getPlanValue(plan, "orderMode");

  if (orderMode !== "advanced") {
    throw new Error("Mock order page fill runner requires orderMode=advanced.");
  }

  if (!validation.ok) {
    throw new Error(
      [
        "Mock order page fill plan is invalid.",
        ...validation.errors,
        ...validation.warnings.map((warning) => `Warning: ${warning}`),
      ].join(" "),
    );
  }
}

export async function expectMockOrderValidationErrors(
  page: Page,
  expectedCodes: string[] = [],
) {
  const validationErrors = getContractLocator(page, "validationErrors");

  await expect(validationErrors).toBeVisible();

  for (const expectedCode of expectedCodes) {
    await expect(
      validationErrors.locator(`[data-error-code="${expectedCode}"]`).first(),
    ).toBeVisible();
  }
}

async function expectNoMockOrderValidationErrors(page: Page) {
  await expect(getContractLocator(page, "validationErrors")).toHaveCount(0);
}

export async function openMockOrderPageWithPlan(
  page: Page,
  plan: MockOrderPageFillPlan,
) {
  assertValidFillPlan(plan);
  await page.goto(buildMockOrderPageUrlFromFillPlan(plan));
}

export async function fillMockOrderPageFromPlan(
  page: Page,
  plan: MockOrderPageFillPlan,
) {
  assertValidFillPlan(plan);

  for (const fieldKey of editableTextFieldKeys) {
    await getContractLocator(page, fieldKey).fill(getPlanValue(plan, fieldKey));
  }

  for (const fieldKey of editableSelectFieldKeys) {
    await getContractLocator(page, fieldKey).selectOption(
      getPlanValue(plan, fieldKey),
    );
  }

  await expect(getContractLocator(page, "requireManualFinalConfirmation")).toContainText(
    getPlanValue(plan, "requireManualFinalConfirmation"),
  );
  await expect(getContractLocator(page, "allowAutomaticFinalSubmit")).toContainText(
    getPlanValue(plan, "allowAutomaticFinalSubmit"),
  );
  await expect(getContractLocator(page, "orderMode")).toHaveValue("advanced");
  await expectNoMockOrderValidationErrors(page);
  await expect(getContractLocator(page, "submitDisabled")).toBeDisabled();
}

export async function verifyMockOrderPageReviewFromPlan(
  page: Page,
  plan: MockOrderPageFillPlan,
) {
  assertValidFillPlan(plan);

  await getContractLocator(page, "reviewButton").click();
  await expectNoMockOrderValidationErrors(page);

  const reviewPanel = page.locator("aside").filter({
    has: page.getByRole("heading", { name: "Review mock order" }),
  });

  await expect(reviewPanel).toBeVisible();
  await expectPlanValueInReview(reviewPanel, plan, "ticker");
  await expectPlanValueInReview(reviewPanel, plan, "action");
  await expectPlanValueInReview(reviewPanel, plan, "quantity");
  await expectPlanValueInReview(reviewPanel, plan, "orderType");
  await expectPlanValueInReview(reviewPanel, plan, "orderMode");
  await expectPlanValueInReview(reviewPanel, plan, "account");
  await expectPlanValueInReview(reviewPanel, plan, "amountSek");
  await expectPlanValueInReview(reviewPanel, plan, "priceCurrency");
  await expectPlanValueInReview(reviewPanel, plan, "instrumentMarket");
  await expectPlanValueInReview(reviewPanel, plan, "instrumentCurrency");
  await expectPlanValueInReview(reviewPanel, plan, "instrumentType");
  await expectPlanValueInReview(reviewPanel, plan, "validUntil");
  await expectPlanValueInReview(reviewPanel, plan, "estimatedFees");
  await expectPlanValueInReview(reviewPanel, plan, "estimatedCourtage");
  await expectPlanValueInReview(reviewPanel, plan, "estimatedFxFee");
  await expectPlanValueInReview(reviewPanel, plan, "estimatedTotalAmount");
  await expectPlanValueInReview(reviewPanel, plan, "preliminaryFxRate");
  await expectPlanValueInReview(reviewPanel, plan, "reviewButtonLabel");
  await expectPlanValueInReview(reviewPanel, plan, "confirmButtonLabel");
  await expectPlanValueInReview(reviewPanel, plan, "cancelButtonLabel");
  await expectPlanValueInReview(reviewPanel, plan, "mode");
  await expectPlanValueInReview(reviewPanel, plan, "requestId");
  await expectPlanValueInReview(reviewPanel, plan, "intentId");
  await expect(
    page.getByRole("link", { name: "Open mock confirmation page" }),
  ).toBeVisible();
  await expect(getContractLocator(page, "submitDisabled")).toBeDisabled();
}
