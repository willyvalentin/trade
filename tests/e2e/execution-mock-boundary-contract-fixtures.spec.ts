import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  assertMockBuyBoundaryContractSafe,
  assertMockSellBoundaryContractSafe,
  getMockBuyBoundaryContractSafetyViolations,
  getMockSellBoundaryContractSafetyViolations,
  isMockBuyBoundaryContractSafe,
  isMockSellBoundaryContractSafe,
  mockBoundaryContractFixtures,
  mockBuyBoundaryContractFixture,
  mockSellBoundaryContractFixture,
  type MockBuyBoundaryContract,
  type MockSellBoundaryContract,
} from "../fixtures/execution-boundary-mock-contracts";

const repoRoot = process.cwd();
const fixturePath = "tests/fixtures/execution-boundary-mock-contracts.ts";

function readFixtureSource() {
  return readFileSync(join(repoRoot, fixturePath), "utf8");
}

test.describe("execution mock boundary contract fixtures", () => {
  test("BUY fixture passes mock/review-only safety assertions", () => {
    expect(mockBuyBoundaryContractFixture.scenarioId).toBe(
      "scenario_b_buy_order_prep_mock_review_boundary",
    );
    expect(mockBuyBoundaryContractFixture.mode).toBe("mock_review_only");
    expect(mockBuyBoundaryContractFixture.side).toBe("BUY");
    expect(isMockBuyBoundaryContractSafe(mockBuyBoundaryContractFixture)).toBe(true);
    expect(getMockBuyBoundaryContractSafetyViolations(mockBuyBoundaryContractFixture)).toEqual([]);
    expect(() =>
      assertMockBuyBoundaryContractSafe(mockBuyBoundaryContractFixture),
    ).not.toThrow();
  });

  test("SELL fixture passes mock/review-only safety assertions", () => {
    expect(mockSellBoundaryContractFixture.scenarioId).toBe(
      "scenario_c_sell_order_prep_mock_review_boundary",
    );
    expect(mockSellBoundaryContractFixture.mode).toBe("mock_review_only");
    expect(mockSellBoundaryContractFixture.side).toBe("SELL");
    expect(isMockSellBoundaryContractSafe(mockSellBoundaryContractFixture)).toBe(true);
    expect(getMockSellBoundaryContractSafetyViolations(mockSellBoundaryContractFixture)).toEqual(
      [],
    );
    expect(() =>
      assertMockSellBoundaryContractSafe(mockSellBoundaryContractFixture),
    ).not.toThrow();
  });

  test("BUY fixture has no broker, order, Supabase, or final-click authority", () => {
    expect(mockBuyBoundaryContractFixture.authority).toMatchObject({
      brokerAuthority: false,
      accountBinding: false,
      liveOrderIntent: false,
      finalBuyAuthority: false,
      orderSubmissionAuthority: false,
      supabaseExecutionWriteAuthority: false,
      humanFinalRequired: true,
    });
    expect(mockBuyBoundaryContractFixture.safety).toMatchObject({
      noSubmit: true,
      stopAtReview: true,
      noFinalClick: true,
      redactedEvidenceOnly: true,
    });
  });

  test("SELL fixture has no broker, order, Supabase, final-click, or live-position-mutation authority", () => {
    expect(mockSellBoundaryContractFixture.authority).toMatchObject({
      brokerAuthority: false,
      accountBinding: false,
      liveOrderIntent: false,
      finalSellAuthority: false,
      orderSubmissionAuthority: false,
      supabaseExecutionWriteAuthority: false,
      livePositionMutationAuthority: false,
      humanFinalRequired: true,
    });
    expect(mockSellBoundaryContractFixture.safety).toMatchObject({
      noSubmit: true,
      stopAtReview: true,
      noFinalClick: true,
      noLivePositionMutation: true,
      redactedEvidenceOnly: true,
    });
  });

  test("SELL fixture has position and exit consistency fields", () => {
    expect(mockSellBoundaryContractFixture.positionReference).toMatchObject({
      ticker: mockSellBoundaryContractFixture.ticker,
      company: mockSellBoundaryContractFixture.company,
      quantity: mockSellBoundaryContractFixture.quantity,
      referenceEntry: mockSellBoundaryContractFixture.referenceEntry,
    });
    expect(mockSellBoundaryContractFixture.planReference).toMatchObject({
      ticker: mockSellBoundaryContractFixture.ticker,
      plannedExitReason: mockSellBoundaryContractFixture.plannedExitReason,
      stop: mockSellBoundaryContractFixture.stop,
      target: mockSellBoundaryContractFixture.target,
    });
  });

  test("fixtures contain no-submit, no-final-click, and stop-at-review markers", () => {
    for (const contract of mockBoundaryContractFixtures) {
      expect(contract.safety.noSubmit).toBe(true);
      expect(contract.safety.noFinalClick).toBe(true);
      expect(contract.safety.stopAtReview).toBe(true);
      expect(contract.mode).toBe("mock_review_only");
    }
  });

  test("fixtures exclude Avanza, credential, BankID, and cookie/session authority", () => {
    for (const contract of mockBoundaryContractFixtures) {
      expect(contract.safety.noAvanza).toBe(true);
      expect(contract.safety.noCredentials).toBe(true);
      expect(contract.safety.noBankID).toBe(true);
      expect(contract.safety.noCookieSession).toBe(true);
      expect(contract.safety.redactedEvidenceOnly).toBe(true);
    }
  });

  test("BUY assertion rejects unsafe authority changes", () => {
    const unsafe = {
      ...mockBuyBoundaryContractFixture,
      authority: {
        ...mockBuyBoundaryContractFixture.authority,
        orderSubmissionAuthority: true,
      },
    } as unknown as MockBuyBoundaryContract;

    expect(isMockBuyBoundaryContractSafe(unsafe)).toBe(false);
    expect(getMockBuyBoundaryContractSafetyViolations(unsafe)).toContain(
      "orderSubmissionAuthority must be false",
    );
    expect(() => assertMockBuyBoundaryContractSafe(unsafe)).toThrow(
      /Unsafe mock BUY boundary contract/u,
    );
  });

  test("SELL assertion rejects live-position mutation authority and inconsistent exit fields", () => {
    const unsafe = {
      ...mockSellBoundaryContractFixture,
      positionReference: {
        ...mockSellBoundaryContractFixture.positionReference,
        quantity: mockSellBoundaryContractFixture.quantity + 1,
      },
      authority: {
        ...mockSellBoundaryContractFixture.authority,
        livePositionMutationAuthority: true,
      },
    } as unknown as MockSellBoundaryContract;

    expect(isMockSellBoundaryContractSafe(unsafe)).toBe(false);
    expect(getMockSellBoundaryContractSafetyViolations(unsafe)).toEqual(
      expect.arrayContaining([
        "livePositionMutationAuthority must be false",
        "positionReference quantity must match contract quantity",
      ]),
    );
    expect(() => assertMockSellBoundaryContractSafe(unsafe)).toThrow(
      /Unsafe mock SELL boundary contract/u,
    );
  });

  test("fixture source imports no restricted scripts, browser helpers, Supabase clients, env, fetch, storage, or Trade UI runtime", () => {
    const source = readFixtureSource();
    const forbiddenFragments = [
      "scripts/",
      "avanza-login-smoke-test",
      "avanza-order-chain-smoke-test",
      "avanza-localhost-bridge-server",
      "avanza-dry-run-runner-skeleton",
      "mock-order-page-agent-runner",
      "safe-browser-action",
      "playwright",
      "@/lib/supabase",
      "createClient(",
      "supabaseServer",
      "process.env",
      "fetch(",
      "localStorage",
      "sessionStorage",
      "app/trade-app",
      "app/dev/avanza-visual-qa/page",
      "child_process",
    ];

    const violations = forbiddenFragments.filter((fragment) => source.includes(fragment));

    expect(violations, violations.join("\n")).toEqual([]);
  });
});
