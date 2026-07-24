import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  assertPostTradePersistencePayloadAllowlisted,
  buildMockLearningCandidatePayload,
  buildMockSafeSettlementReviewPayload,
  containsForbiddenPersistenceField,
  getPostTradePersistencePayloadAllowlistViolations,
  postTradePersistenceAllowedFields,
  postTradePersistenceNeverPersistFields,
  safeBrokerConfirmationMetadataPayloadFixture,
  safeCostBreakdownPayloadFixture,
  safeDeviationReviewPayloadFixture,
  safeLearningCandidatePayloadFixture,
  safeManualReviewStatusPayloadFixture,
  safePostTradePersistencePayloadFixtures,
  safeSettlementReviewPayloadFixture,
  type PostTradePersistencePayload,
} from "../fixtures/post-trade-persistence-payload-allowlist-fixtures";

const repoRoot = process.cwd();
const fixturePath = "tests/fixtures/post-trade-persistence-payload-allowlist-fixtures.ts";
const specPath = "tests/e2e/post-trade-persistence-payload-allowlist.spec.ts";

function readSource(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function unsafePayload(
  payload: PostTradePersistencePayload,
  patch: Record<string, unknown>,
) {
  return {
    ...payload,
    ...patch,
  };
}

test.describe("post-trade persistence payload allowlist tests", () => {
  test("all safe payload categories pass the allowlist validator", () => {
    expect(safePostTradePersistencePayloadFixtures.map((payload) => payload.payloadCategory)).toEqual([
      "settlement_review",
      "broker_confirmation_evidence_metadata",
      "cost_breakdown",
      "deviation_review",
      "manual_review_status",
      "learning_candidate",
    ]);

    for (const payload of safePostTradePersistencePayloadFixtures) {
      expect(getPostTradePersistencePayloadAllowlistViolations(payload), payload.payloadCategory).toEqual([]);
      expect(() => assertPostTradePersistencePayloadAllowlisted(payload)).not.toThrow();
    }
  });

  test("safe settlement review payload includes only safe redacted minimum fields", () => {
    expect(buildMockSafeSettlementReviewPayload()).toMatchObject({
      payloadCategory: "settlement_review",
      internalTradeId: "internal_trade_mock_001",
      planId: "mock_buy_plan_001",
      contractId: "mock_buy_contract_001",
      reviewId: "mock_buy_review_001",
      extractionId: "mock_buy_settlement_extraction_001",
      redactedEvidenceArtifactId: "redacted_artifact_mock_buy_001",
      side: "BUY",
      ticker: "TURBUY",
      quantity: 12,
      plannedPrice: 101.25,
      executionPrice: 101.4,
      slippage: 0.15,
      currency: "SEK",
      commission: 9,
      grossAmount: 1216.8,
      settlementAmount: 1225.8,
      deviationClassification: "execution_match",
      manualReviewStatus: "not_required",
      redactionStatus: "redacted",
      sensitiveDataPresent: false,
      supabaseWriteAuthority: false,
      productionPersistenceAllowed: false,
      rawArtifactStored: false,
      learningAutoUpdateAllowed: false,
    });
  });

  test("safe payload category fixtures cover metadata, cost, deviation, manual review, and staged learning", () => {
    expect(safeBrokerConfirmationMetadataPayloadFixture).toMatchObject({
      payloadCategory: "broker_confirmation_evidence_metadata",
      redactedEvidenceArtifactId: "redacted_artifact_mock_buy_001",
      sensitiveDataPresent: false,
      rawArtifactStored: false,
    });
    expect(safeCostBreakdownPayloadFixture).toMatchObject({
      payloadCategory: "cost_breakdown",
      commission: 9,
      fxRate: 1,
      grossAmount: 1216.8,
      settlementAmount: 1225.8,
    });
    expect(safeDeviationReviewPayloadFixture).toMatchObject({
      payloadCategory: "deviation_review",
      deviationClassification: "minor_execution_deviation",
      manualReviewStatus: "approved_for_review_only",
    });
    expect(safeManualReviewStatusPayloadFixture).toMatchObject({
      payloadCategory: "manual_review_status",
      deviationClassification: "requires_manual_review",
      manualReviewStatus: "required",
    });
    expect(buildMockLearningCandidatePayload()).toMatchObject({
      payloadCategory: "learning_candidate",
      learningCandidateStatus: "staged_manual_review_only",
      outcomeEligible: false,
      requiresSeparateLearningGate: true,
      learningAutoUpdateAllowed: false,
    });
  });

  test("allowlist fields and never-persist fields are explicit", () => {
    expect(postTradePersistenceAllowedFields).toContain("internalTradeId");
    expect(postTradePersistenceAllowedFields).toContain("redactedEvidenceArtifactId");
    expect(postTradePersistenceAllowedFields).toContain("learningCandidateStatus");
    expect(postTradePersistenceAllowedFields).toContain("requiresSeparateLearningGate");

    for (const forbidden of [
      "credentials",
      "password",
      "BankID",
      "cookie",
      "session",
      "rawPdf",
      "rawScreenshot",
      "rawHtml",
      "rawBrokerPage",
      "unredactedSettlementNote",
      "orderSubmissionAuthority",
      "finalBuyAuthority",
      "finalSellAuthority",
      "supabaseServiceKey",
      "tradeUiExecution",
      "apiRouteActivation",
    ]) {
      expect(postTradePersistenceNeverPersistFields).toContain(forbidden);
    }
  });

  test("sensitive fields, raw artifacts, and unknown fields are rejected", () => {
    const forbiddenPatches = [
      { credentials: "blocked" },
      { password: "blocked" },
      { BankID: "blocked" },
      { MFA: "blocked" },
      { cookie: "blocked" },
      { session: "blocked" },
      { rawBrowserStorage: "blocked" },
      { networkDump: "blocked" },
      { customerId: "blocked" },
      { accountNumber: "blocked" },
      { personalIdentityNumber: "blocked" },
      { accountBalance: "blocked" },
      { unrelatedHoldings: "blocked" },
      { envSecret: "blocked" },
      { supabaseServiceKey: "blocked" },
      { apiToken: "blocked" },
      { rawPdf: "blocked" },
      { rawScreenshot: "blocked" },
      { rawHtml: "blocked" },
      { rawBrokerPage: "blocked" },
      { unredactedSettlementNote: "blocked" },
      { unredactedBrokerConfirmation: "blocked" },
      { notOnAllowlist: "blocked" },
    ];

    for (const patch of forbiddenPatches) {
      const payload = unsafePayload(safeSettlementReviewPayloadFixture, patch);
      const violations = getPostTradePersistencePayloadAllowlistViolations(payload);

      expect(violations, Object.keys(patch).join(",")).not.toEqual([]);
      expect(() => assertPostTradePersistencePayloadAllowlisted(payload)).toThrow(
        /Unsafe post-trade persistence payload/u,
      );
    }
  });

  test("authority escalation and runtime activation fields are rejected", () => {
    const forbiddenPatches = [
      { orderSubmissionAuthority: true },
      { finalBuyAuthority: true },
      { finalSellAuthority: true },
      { brokerAuthority: true },
      { accountBinding: true },
      { liveOrderIntent: true },
      { liveTradeMutationAuthority: true },
      { livePositionMutationAuthority: true },
      { supabaseWriteAuthority: true },
      { productionPersistenceAllowed: true },
      { rawArtifactStored: true },
      { learningAutoUpdateAllowed: true },
      { apiRouteActivation: true },
      { tradeUiExecution: true },
      { browserAutomation: true },
      { avanzaBridgeSession: true },
      { cookieSessionExport: true },
      { bankIdAutomation: true },
    ];

    for (const patch of forbiddenPatches) {
      const payload = unsafePayload(safeSettlementReviewPayloadFixture, patch);
      const violations = getPostTradePersistencePayloadAllowlistViolations(payload);

      expect(violations, Object.keys(patch).join(",")).not.toEqual([]);
      expect(() => assertPostTradePersistencePayloadAllowlisted(payload)).toThrow(
        /Unsafe post-trade persistence payload/u,
      );
    }
  });

  test("data quality gates reject missing required fields and unsafe safety flags", () => {
    const unsafeCases: Array<{
      label: string;
      payload: Record<string, unknown>;
      expected: string;
    }> = [
      {
        label: "missing internal id",
        payload: unsafePayload(safeSettlementReviewPayloadFixture, { internalTradeId: "" }),
        expected: "internalTradeId is required",
      },
      {
        label: "missing side",
        payload: unsafePayload(safeSettlementReviewPayloadFixture, { side: "" }),
        expected: "side is required",
      },
      {
        label: "missing ticker",
        payload: unsafePayload(safeSettlementReviewPayloadFixture, { ticker: "" }),
        expected: "ticker is required",
      },
      {
        label: "missing quantity",
        payload: unsafePayload(safeSettlementReviewPayloadFixture, { quantity: undefined }),
        expected: "quantity must be a finite number",
      },
      {
        label: "missing execution price",
        payload: unsafePayload(safeSettlementReviewPayloadFixture, { executionPrice: undefined }),
        expected: "executionPrice must be a finite number",
      },
      {
        label: "missing deviation classification",
        payload: unsafePayload(safeSettlementReviewPayloadFixture, {
          deviationClassification: "",
        }),
        expected: "deviationClassification is required",
      },
      {
        label: "missing redaction status",
        payload: unsafePayload(safeSettlementReviewPayloadFixture, { redactionStatus: "" }),
        expected: "redactionStatus must be redacted or safe_summary_only",
      },
      {
        label: "sensitive data present",
        payload: unsafePayload(safeSettlementReviewPayloadFixture, {
          sensitiveDataPresent: true,
        }),
        expected: "sensitiveDataPresent must be false",
      },
      {
        label: "manual review deviation not flagged",
        payload: unsafePayload(safeManualReviewStatusPayloadFixture, {
          manualReviewStatus: "not_required",
        }),
        expected: "manual review deviation must be flagged for manual review",
      },
      {
        label: "blocked deviation not blocked",
        payload: unsafePayload(safeManualReviewStatusPayloadFixture, {
          deviationClassification: "blocked_sensitive_or_mismatched_evidence",
          manualReviewStatus: "required",
        }),
        expected: "blocked deviation must be blocked",
      },
    ];

    for (const { expected, label, payload } of unsafeCases) {
      expect(getPostTradePersistencePayloadAllowlistViolations(payload), label).toContain(expected);
    }
  });

  test("learning candidate safety remains staged, manual-review-only, and non-updating", () => {
    expect(getPostTradePersistencePayloadAllowlistViolations(safeLearningCandidatePayloadFixture)).toEqual([]);

    const unsafeCases: Array<{
      label: string;
      patch: Record<string, unknown>;
      expected: string;
    }> = [
      {
        label: "automatic learning update",
        patch: { learningAutoUpdateAllowed: true },
        expected: "learningAutoUpdateAllowed must be false",
      },
      {
        label: "missing separate learning gate",
        patch: { requiresSeparateLearningGate: false },
        expected: "learning candidate requiresSeparateLearningGate must be true",
      },
      {
        label: "blocked deviation marked eligible",
        patch: {
          deviationClassification: "blocked_sensitive_or_mismatched_evidence",
          manualReviewStatus: "blocked",
          outcomeEligible: true,
        },
        expected: "learning candidate outcomeEligible must be false before a future clean gate",
      },
      {
        label: "sensitive learning payload",
        patch: { sensitiveDataPresent: true },
        expected: "sensitiveDataPresent must be false",
      },
      {
        label: "production persistence",
        patch: { productionPersistenceAllowed: true },
        expected: "productionPersistenceAllowed must be false",
      },
      {
        label: "non-staged status",
        patch: { learningCandidateStatus: "ready_for_auto_update" },
        expected: "learningCandidateStatus must be staged_manual_review_only",
      },
    ];

    for (const { expected, label, patch } of unsafeCases) {
      const payload = unsafePayload(safeLearningCandidatePayloadFixture, patch);

      expect(getPostTradePersistencePayloadAllowlistViolations(payload), label).toContain(expected);
    }
  });

  test("containsForbiddenPersistenceField detects exact never-persist keys", () => {
    expect(containsForbiddenPersistenceField(safeSettlementReviewPayloadFixture)).toBe(false);
    expect(
      containsForbiddenPersistenceField({
        ...safeSettlementReviewPayloadFixture,
        rawPdf: "blocked",
      }),
    ).toBe(true);
    expect(
      containsForbiddenPersistenceField({
        ...safeSettlementReviewPayloadFixture,
        orderSubmissionAuthority: true,
      }),
    ).toBe(true);
  });

  test("payload allowlist fixture and spec sources stay isolated from runtime and write modules", () => {
    const fixtureSource = readSource(fixturePath);
    const specSource = readSource(specPath);
    const forbiddenImportFragments = [
      "@/lib/supabase",
      "supabase-server",
      "createClient(",
      "app/api/",
      "app/trade-app",
      "app/dev/avanza-visual-qa/page",
      "scripts/",
      "avanza-localhost-bridge",
      "avanza-login-smoke-test",
      "avanza-order-chain-smoke-test",
      "avanza-dry-run-runner",
      "safe-browser-action",
      "credential",
      "session",
      "process.env",
      "fetch(",
      "localStorage",
      "sessionStorage",
      "child_process",
    ];

    for (const [label, source] of [
      [fixturePath, fixtureSource],
      [specPath, specSource],
    ] as const) {
      const importLines = source
        .split("\n")
        .filter((line) => line.trim().startsWith("import "));
      const violations = forbiddenImportFragments.filter((fragment) =>
        importLines.some((line) => line.includes(fragment)),
      );

      expect(violations, `${label}\n${violations.join("\n")}`).toEqual([]);
    }
  });
});
