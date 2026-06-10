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
  "targetPrice",
  "stopLossPrice",
  "requestId",
  "intentId",
];

const editableSelectFieldKeys: EditableMockOrderPageFieldKey[] = [
  "action",
  "orderType",
  "mode",
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
    await expect(reviewPanel.getByText(value, { exact: true })).toBeVisible();
  }
}

function assertValidFillPlan(plan: MockOrderPageFillPlan) {
  const validation = validateMockOrderPageFillPlan(plan);

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
  await expect(getContractLocator(page, "submitDisabled")).toBeDisabled();
}

export async function verifyMockOrderPageReviewFromPlan(
  page: Page,
  plan: MockOrderPageFillPlan,
) {
  assertValidFillPlan(plan);

  await getContractLocator(page, "reviewButton").click();

  const reviewPanel = page.locator("aside").filter({
    has: page.getByRole("heading", { name: "Review mock order" }),
  });

  await expect(reviewPanel).toBeVisible();
  await expectPlanValueInReview(reviewPanel, plan, "ticker");
  await expectPlanValueInReview(reviewPanel, plan, "action");
  await expectPlanValueInReview(reviewPanel, plan, "quantity");
  await expectPlanValueInReview(reviewPanel, plan, "orderType");
  await expectPlanValueInReview(reviewPanel, plan, "mode");
  await expectPlanValueInReview(reviewPanel, plan, "requestId");
  await expectPlanValueInReview(reviewPanel, plan, "intentId");
  await expect(getContractLocator(page, "submitDisabled")).toBeDisabled();
}
