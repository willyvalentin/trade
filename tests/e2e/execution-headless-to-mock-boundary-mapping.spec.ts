import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  assertMappedBuyBoundarySafe,
  assertMappedSellBoundarySafe,
  mapMockHeadlessBuyContractToBoundaryFixture,
  mapMockHeadlessSellExitContractToBoundaryFixture,
  mockHeadlessBuyExecutionInputFixture,
  mockHeadlessSellExitInputFixture,
  type MockHeadlessBuyExecutionInput,
  type MockHeadlessSellExitInput,
} from "../fixtures/execution-boundary-mapping-fixtures";
import {
  getMockBuyBoundaryContractSafetyViolations,
  getMockSellBoundaryContractSafetyViolations,
} from "../fixtures/execution-boundary-mock-contracts";

const repoRoot = process.cwd();
const mappingFixturePath = "tests/fixtures/execution-boundary-mapping-fixtures.ts";
const mappingSpecPath = "tests/e2e/execution-headless-to-mock-boundary-mapping.spec.ts";

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

test.describe("headless execution contract to mock boundary mapping", () => {
  test("maps headless-ish BUY input to safe mock BUY boundary shape", () => {
    const mapped = mapMockHeadlessBuyContractToBoundaryFixture(
      mockHeadlessBuyExecutionInputFixture,
    );

    expect(mapped).toMatchObject({
      mode: "mock_review_only",
      side: "BUY",
      ticker: mockHeadlessBuyExecutionInputFixture.ticker,
      company: mockHeadlessBuyExecutionInputFixture.company,
      quantity: mockHeadlessBuyExecutionInputFixture.quantity,
      entry: mockHeadlessBuyExecutionInputFixture.entry,
      stop: mockHeadlessBuyExecutionInputFixture.stop,
      target: mockHeadlessBuyExecutionInputFixture.target,
      orderType: mockHeadlessBuyExecutionInputFixture.orderType,
    });
    expect(mapped.authority).toMatchObject({
      brokerAuthority: false,
      accountBinding: false,
      liveOrderIntent: false,
      finalBuyAuthority: false,
      orderSubmissionAuthority: false,
      supabaseExecutionWriteAuthority: false,
      humanFinalRequired: true,
    });
    expect(mapped.safety).toMatchObject({
      noSubmit: true,
      stopAtReview: true,
      noFinalClick: true,
      noAvanza: true,
      noCredentials: true,
      noBankID: true,
      noCookieSession: true,
      redactedEvidenceOnly: true,
    });
    expect(getMockBuyBoundaryContractSafetyViolations(mapped)).toEqual([]);
    expect(() => assertMappedBuyBoundarySafe(mapped)).not.toThrow();
  });

  test("maps headless-ish SELL exit input to safe mock SELL boundary shape", () => {
    const mapped = mapMockHeadlessSellExitContractToBoundaryFixture(
      mockHeadlessSellExitInputFixture,
    );

    expect(mapped).toMatchObject({
      mode: "mock_review_only",
      side: "SELL",
      ticker: mockHeadlessSellExitInputFixture.ticker,
      company: mockHeadlessSellExitInputFixture.company,
      quantity: mockHeadlessSellExitInputFixture.quantity,
      plannedExitReason: mockHeadlessSellExitInputFixture.plannedExitReason,
      referenceEntry: mockHeadlessSellExitInputFixture.referenceEntry,
      stop: mockHeadlessSellExitInputFixture.stop,
      target: mockHeadlessSellExitInputFixture.target,
      orderType: mockHeadlessSellExitInputFixture.orderType,
    });
    expect(mapped.authority).toMatchObject({
      brokerAuthority: false,
      accountBinding: false,
      liveOrderIntent: false,
      finalSellAuthority: false,
      orderSubmissionAuthority: false,
      supabaseExecutionWriteAuthority: false,
      livePositionMutationAuthority: false,
      humanFinalRequired: true,
    });
    expect(mapped.safety).toMatchObject({
      noSubmit: true,
      stopAtReview: true,
      noFinalClick: true,
      noAvanza: true,
      noCredentials: true,
      noBankID: true,
      noCookieSession: true,
      noLivePositionMutation: true,
      redactedEvidenceOnly: true,
    });
    expect(mapped.positionReference).toMatchObject({
      ticker: mapped.ticker,
      company: mapped.company,
      quantity: mapped.quantity,
      referenceEntry: mapped.referenceEntry,
    });
    expect(mapped.planReference).toMatchObject({
      ticker: mapped.ticker,
      plannedExitReason: mapped.plannedExitReason,
      stop: mapped.stop,
      target: mapped.target,
    });
    expect(getMockSellBoundaryContractSafetyViolations(mapped)).toEqual([]);
    expect(() => assertMappedSellBoundarySafe(mapped)).not.toThrow();
  });

  test("rejects unsafe BUY mapping authority and safety inputs", () => {
    const unsafeCases: [string, Partial<MockHeadlessBuyExecutionInput>][] = [
      ["orderSubmissionAuthority", { authority: { orderSubmissionAuthority: true } }],
      ["finalBuyAuthority", { authority: { finalBuyAuthority: true } }],
      ["brokerAuthority", { authority: { brokerAuthority: true } }],
      [
        "supabaseExecutionWriteAuthority",
        { authority: { supabaseExecutionWriteAuthority: true } },
      ],
      ["noSubmit", { safety: { noSubmit: false } }],
      ["stopAtReview", { safety: { stopAtReview: false } }],
    ];

    for (const [label, override] of unsafeCases) {
      const unsafe = {
        ...mockHeadlessBuyExecutionInputFixture,
        ...override,
        authority: {
          ...mockHeadlessBuyExecutionInputFixture.authority,
          ...override.authority,
        },
        safety: {
          ...mockHeadlessBuyExecutionInputFixture.safety,
          ...override.safety,
        },
      };

      expect(
        () => mapMockHeadlessBuyContractToBoundaryFixture(unsafe),
        label,
      ).toThrow(/Unsafe mock headless BUY mapping input/u);
    }
  });

  test("rejects unsafe SELL mapping authority, mutation, and missing consistency inputs", () => {
    const unsafeCases: [string, Partial<MockHeadlessSellExitInput>][] = [
      ["orderSubmissionAuthority", { authority: { orderSubmissionAuthority: true } }],
      ["finalSellAuthority", { authority: { finalSellAuthority: true } }],
      ["brokerAuthority", { authority: { brokerAuthority: true } }],
      [
        "supabaseExecutionWriteAuthority",
        { authority: { supabaseExecutionWriteAuthority: true } },
      ],
      [
        "livePositionMutationAuthority",
        { authority: { livePositionMutationAuthority: true } },
      ],
      ["noLivePositionMutation", { safety: { noLivePositionMutation: false } }],
      [
        "position quantity mismatch",
        {
          positionReference: {
            ...mockHeadlessSellExitInputFixture.positionReference!,
            quantity: mockHeadlessSellExitInputFixture.quantity + 1,
          },
        },
      ],
      ["missing positionReference", { positionReference: undefined }],
      ["missing planReference", { planReference: undefined }],
    ];

    for (const [label, override] of unsafeCases) {
      const unsafe = {
        ...mockHeadlessSellExitInputFixture,
        ...override,
        authority: {
          ...mockHeadlessSellExitInputFixture.authority,
          ...override.authority,
        },
        safety: {
          ...mockHeadlessSellExitInputFixture.safety,
          ...override.safety,
        },
      };

      expect(
        () => mapMockHeadlessSellExitContractToBoundaryFixture(unsafe),
        label,
      ).toThrow(/Unsafe mock headless SELL mapping input/u);
    }
  });

  test("source isolation keeps mapping helpers and tests away from runtime and restricted modules", () => {
    const mappingFixtureSource = readRepoFile(mappingFixturePath);
    const mappingSpecSource = readRepoFile(mappingSpecPath);
    const forbiddenFragments = [
      "scripts/",
      "avanza-login-smoke-test",
      "avanza-order-chain-smoke-test",
      "avanza-localhost-bridge-server",
      "avanza-dry-run-runner-skeleton",
      "mock-order-page-agent-runner",
      "avanza-agent-bridge",
      "avanza-local-playwright",
      "safe-browser-action",
      "avanza-secure-credential-provider",
      "avanza-macos-keychain-credential-provider",
      "avanza-login-credential-resolution-bridge",
      "@/lib/supabase",
      "createClient(",
      "supabaseServer",
      "process.env",
      "fetch(",
      "localStorage",
      "sessionStorage",
      "app/trade-app",
      "app/api/",
      "child_process",
    ];

    const fixtureViolations = forbiddenFragments
      .filter((fragment) => mappingFixtureSource.includes(fragment))
      .map((fragment) => `${mappingFixturePath} contains ${fragment}`);
    const specImportViolations = [
      ...mappingSpecSource.matchAll(/\bimport\s+[\s\S]*?\s+from\s+["']([^"']+)["']/g),
    ]
      .map((match) => match[1] ?? "")
      .filter((specifier) =>
        forbiddenFragments.some((fragment) => specifier.includes(fragment)),
      )
      .map((specifier) => `${mappingSpecPath} imports ${specifier}`);

    expect(
      [...fixtureViolations, ...specImportViolations],
      [...fixtureViolations, ...specImportViolations].join("\n"),
    ).toEqual([]);
  });
});
