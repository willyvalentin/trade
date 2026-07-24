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
      ["accountBinding", { authority: { accountBinding: true } }],
      ["liveOrderIntent", { authority: { liveOrderIntent: true } }],
      [
        "supabaseExecutionWriteAuthority",
        { authority: { supabaseExecutionWriteAuthority: true } },
      ],
      ["humanFinalRequired", { authority: { humanFinalRequired: false } }],
      ["noFinalClick", { safety: { noFinalClick: false } }],
      ["noSubmit", { safety: { noSubmit: false } }],
      ["stopAtReview", { safety: { stopAtReview: false } }],
      ["noAvanza", { safety: { noAvanza: false } }],
      ["noCredentials", { safety: { noCredentials: false } }],
      ["noBankID", { safety: { noBankID: false } }],
      ["noCookieSession", { safety: { noCookieSession: false } }],
      ["redactedEvidenceOnly", { safety: { redactedEvidenceOnly: false } }],
      ["side mismatch", { side: "SELL" as MockHeadlessBuyExecutionInput["side"] }],
      ["action mismatch", { action: "SELL" as MockHeadlessBuyExecutionInput["action"] }],
      ["missing ticker", { ticker: "" }],
      ["zero quantity", { quantity: 0 }],
      ["negative quantity", { quantity: -1 }],
      ["invalid stop entry target", { stop: 102, entry: 101.25, target: 113.4 }],
      ["missing planReference", { planReference: undefined }],
      ["plan ticker mismatch", { planReference: { ...mockHeadlessBuyExecutionInputFixture.planReference, ticker: "OTHER" } }],
      ["unsafe order type", { orderType: "MARKET" }],
      ["account id coupling", { forbiddenCoupling: { accountId: "account-123" } }],
      ["broker order id coupling", { forbiddenCoupling: { brokerOrderId: "broker-order-123" } }],
      [
        "production execution id coupling",
        { forbiddenCoupling: { productionExecutionId: "execution-123" } },
      ],
      ["credential coupling", { forbiddenCoupling: { credential: "secret" } }],
      ["session coupling", { forbiddenCoupling: { session: "session-token" } }],
      ["cookie coupling", { forbiddenCoupling: { cookie: "cookie=value" } }],
      ["final KOP authority marker", { forbiddenCoupling: { finalKopAuthority: true } }],
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
      ["accountBinding", { authority: { accountBinding: true } }],
      ["liveOrderIntent", { authority: { liveOrderIntent: true } }],
      [
        "supabaseExecutionWriteAuthority",
        { authority: { supabaseExecutionWriteAuthority: true } },
      ],
      [
        "livePositionMutationAuthority",
        { authority: { livePositionMutationAuthority: true } },
      ],
      ["humanFinalRequired", { authority: { humanFinalRequired: false } }],
      ["noFinalClick", { safety: { noFinalClick: false } }],
      ["noSubmit", { safety: { noSubmit: false } }],
      ["stopAtReview", { safety: { stopAtReview: false } }],
      ["noLivePositionMutation", { safety: { noLivePositionMutation: false } }],
      ["noAvanza", { safety: { noAvanza: false } }],
      ["noCredentials", { safety: { noCredentials: false } }],
      ["noBankID", { safety: { noBankID: false } }],
      ["noCookieSession", { safety: { noCookieSession: false } }],
      ["redactedEvidenceOnly", { safety: { redactedEvidenceOnly: false } }],
      [
        "position quantity mismatch",
        {
          positionReference: {
            ...mockHeadlessSellExitInputFixture.positionReference!,
            quantity: mockHeadlessSellExitInputFixture.quantity + 1,
          },
        },
      ],
      [
        "sell quantity greater than position quantity",
        {
          quantity: mockHeadlessSellExitInputFixture.quantity + 1,
        },
      ],
      ["missing positionReference", { positionReference: undefined }],
      ["missing planReference", { planReference: undefined }],
      ["side mismatch", { side: "BUY" as MockHeadlessSellExitInput["side"] }],
      ["action mismatch", { action: "BUY" as MockHeadlessSellExitInput["action"] }],
      ["missing ticker", { ticker: "" }],
      [
        "missing planned exit reason",
        { plannedExitReason: undefined as unknown as MockHeadlessSellExitInput["plannedExitReason"] },
      ],
      [
        "invalid planned exit reason",
        { plannedExitReason: "live_submit" as MockHeadlessSellExitInput["plannedExitReason"] },
      ],
      ["missing reference entry", { referenceEntry: 0 }],
      [
        "target mismatch",
        {
          planReference: {
            ...mockHeadlessSellExitInputFixture.planReference!,
            target: mockHeadlessSellExitInputFixture.target + 1,
          },
        },
      ],
      [
        "stop mismatch",
        {
          planReference: {
            ...mockHeadlessSellExitInputFixture.planReference!,
            stop: mockHeadlessSellExitInputFixture.stop + 1,
          },
        },
      ],
      [
        "planned exit reason mismatch",
        {
          planReference: {
            ...mockHeadlessSellExitInputFixture.planReference!,
            plannedExitReason: "stop_review",
          },
        },
      ],
      ["unsafe order type", { orderType: "MARKET" }],
      ["real broker order id", { forbiddenCoupling: { brokerOrderId: "broker-order-123" } }],
      ["real account id", { forbiddenCoupling: { accountId: "account-123" } }],
      [
        "production execution id",
        { forbiddenCoupling: { productionExecutionId: "execution-123" } },
      ],
      ["credential-like field", { forbiddenCoupling: { credential: "secret" } }],
      ["session-like field", { forbiddenCoupling: { session: "session-token" } }],
      ["cookie-like field", { forbiddenCoupling: { cookie: "cookie=value" } }],
      ["final SALJ authority marker", { forbiddenCoupling: { finalSaljAuthority: true } }],
      [
        "live trade mutation marker",
        { forbiddenCoupling: { liveTradeMutationAuthority: true } },
      ],
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
