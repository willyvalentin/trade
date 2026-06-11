import { expect, type Locator, type Page } from "@playwright/test";
import {
  MOCK_ORDER_CONFIRMATION_SELECTORS,
  parseMockOrderConfirmationFields,
  type MockOrderConfirmationFieldKey,
  type MockOrderConfirmationParseResult,
  type MockOrderConfirmationPayload,
} from "../../../lib/mock-order-confirmation-contract";

const parseFieldKeys: (keyof MockOrderConfirmationPayload)[] = [
  "status",
  "ticker",
  "action",
  "quantity",
  "requestedPrice",
  "executedPrice",
  "orderId",
  "requestId",
  "intentId",
  "positionId",
  "recommendationId",
  "message",
];

function confirmationLocator(page: Page, fieldKey: MockOrderConfirmationFieldKey) {
  const selector = MOCK_ORDER_CONFIRMATION_SELECTORS[fieldKey];

  return page.locator(
    `[data-testid="${selector.testId}"][data-agent-field="${selector.dataAgentField}"]`,
  );
}

async function readFieldValue(locator: Locator) {
  const valueLocator = locator.locator("dd").last();
  const text = (await valueLocator.isVisible().catch(() => false))
    ? ((await valueLocator.textContent()) ?? "")
    : ((await locator.textContent()) ?? "");
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.at(-1) === "Not set" ? "" : (lines.at(-1) ?? "");
}

export async function parseMockConfirmationPage(
  page: Page,
): Promise<MockOrderConfirmationParseResult> {
  const fields: Partial<Record<keyof MockOrderConfirmationPayload, string>> = {};

  for (const fieldKey of parseFieldKeys) {
    const locator = confirmationLocator(page, fieldKey);

    await expect(locator).toBeVisible();
    fields[fieldKey] = await readFieldValue(locator);
  }

  return parseMockOrderConfirmationFields(fields);
}

export function verifyMockConfirmationParseResult(
  result: MockOrderConfirmationParseResult,
  expected: Partial<MockOrderConfirmationPayload> = {},
) {
  expect(result.ok).toBe(true);
  expect(result.errors).toEqual([]);
  expect(Number.isFinite(Date.parse(result.parsedAt))).toBe(true);
  expect(result.payload).toEqual(expect.objectContaining(expected));
  expect(result.payload).not.toHaveProperty("brokerResult");
}
