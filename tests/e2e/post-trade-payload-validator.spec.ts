import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  postTradePayloadValidatorAllowedFields,
  postTradePayloadValidatorRejectedFields,
  validatePostTradePersistencePayload,
  type PostTradePayloadValidationAcceptedPayload,
} from "../../lib/post-trade-payload-validator";

const repoRoot = process.cwd();
const validatorPath = "lib/post-trade-payload-validator.ts";
const specPath = "tests/e2e/post-trade-payload-validator.spec.ts";

function readSource(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function validSettlementPayload(): PostTradePayloadValidationAcceptedPayload {
  return {
    payloadCategory: "settlement_review",
    internalTradeId: "internal_trade_mock_001",
    planId: "mock_buy_plan_001",
    contractId: "mock_buy_contract_001",
    reviewId: "mock_buy_review_001",
    extractionId: "mock_buy_settlement_extraction_001",
    idempotencyKey: "post_trade:review:mock_buy_review_001",
    duplicatePreventionKey: "post_trade:duplicate:mock_buy_contract_001",
    sourceFingerprint: "source_fingerprint_mock_buy_001",
    redactedEvidenceArtifactId: "redacted_artifact_mock_buy_001",
    side: "BUY",
    ticker: "TURBUY",
    quantity: 12,
    plannedPrice: 101.25,
    executionPrice: 101.4,
    slippage: 0.15,
    currency: "SEK",
    commission: 9,
    fxRate: 1,
    grossAmount: 1216.8,
    settlementAmount: 1225.8,
    deviationClassification: "execution_match",
    manualReviewStatus: "not_required",
    extractionTimestamp: "2026-07-07T09:31:30.000Z",
    reviewedBySafeActorLabel: "reviewer_internal_mock",
    executionIntentSide: "BUY",
    executionResultSide: "BUY",
    executionIntentTicker: "TURBUY",
    executionResultTicker: "TURBUY",
    executionIntentQuantity: 12,
    executionResultQuantity: 12,
    redactionStatus: "redacted",
    sensitiveDataPresent: false,
    supabaseWriteAuthority: false,
    productionPersistenceAllowed: false,
    rawArtifactStored: false,
    learningAutoUpdateAllowed: false,
  };
}

function validBrokerConfirmationMetadataPayload(): PostTradePayloadValidationAcceptedPayload {
  return {
    payloadCategory: "broker_confirmation_evidence_metadata",
    internalTradeId: "internal_trade_mock_001",
    reviewId: "mock_buy_review_001",
    extractionId: "mock_buy_settlement_extraction_001",
    idempotencyKey: "post_trade:evidence:mock_buy_review_001",
    duplicatePreventionKey: "post_trade:evidence_duplicate:mock_buy_review_001",
    sourceFingerprint: "source_fingerprint_mock_buy_001",
    redactedEvidenceArtifactId: "redacted_artifact_mock_buy_001",
    side: "BUY",
    ticker: "TURBUY",
    quantity: 12,
    executionPrice: 101.4,
    currency: "SEK",
    brokerLabel: "avanza_redacted_metadata",
    evidenceKind: "redacted_confirmation_metadata",
    evidenceTimestamp: "2026-07-07T09:31:30.000Z",
    extractionTimestamp: "2026-07-07T09:31:30.000Z",
    reviewedBySafeActorLabel: "reviewer_internal_mock",
    manualReviewStatus: "not_required",
    redactionStatus: "redacted",
    sensitiveDataPresent: false,
    supabaseWriteAuthority: false,
    productionPersistenceAllowed: false,
    rawArtifactStored: false,
    learningAutoUpdateAllowed: false,
  };
}

function expectInvalidReason(payload: Record<string, unknown>, expected: string) {
  const result = validatePostTradePersistencePayload(payload);

  expect(result.valid).toBe(false);
  expect(result.reasons).toContain(expected);
  expect(result.acceptedPayload).toBeNull();
}

test.describe("post-trade payload validator", () => {
  test("valid allowlisted settlement payload returns structured accepted result", () => {
    const result = validatePostTradePersistencePayload(validSettlementPayload());

    expect(result.valid).toBe(true);
    expect(result.acceptedPayload).toMatchObject({
      payloadCategory: "settlement_review",
      internalTradeId: "internal_trade_mock_001",
      idempotencyKey: "post_trade:review:mock_buy_review_001",
      redactionStatus: "redacted",
      sensitiveDataPresent: false,
      supabaseWriteAuthority: false,
      productionPersistenceAllowed: false,
    });
    expect(result.rejectedFields).toEqual([]);
    expect(result.reasons).toEqual([]);
    expect(result.safetyFlags).toMatchObject({
      allowlistedPayloadOnly: true,
      noUnknownTopLevelFields: true,
      noRawBrokerPayload: true,
      noCredentialSessionOrBankIdMaterial: true,
      noArbitraryJsonBlob: true,
      noSupabaseWriteAuthority: true,
      noProductionPersistence: true,
      noRuntimeActivation: true,
      idempotencyReady: true,
      intentResultAligned: true,
    });
  });

  test("unknown top-level field is rejected", () => {
    expectInvalidReason(
      {
        ...validSettlementPayload(),
        unexpectedField: "blocked",
      },
      "unexpectedField:unknown_top_level_field",
    );
  });

  test("raw broker payload and raw Avanza/browser state are rejected", () => {
    expectInvalidReason(
      {
        ...validSettlementPayload(),
        rawBrokerPayload: "blocked",
      },
      "rawBrokerPayload:rejected_sensitive_or_authority_field",
    );
    expectInvalidReason(
      {
        ...validSettlementPayload(),
        rawAvanzaState: "blocked",
      },
      "rawAvanzaState:rejected_sensitive_or_authority_field",
    );
    expectInvalidReason(
      {
        ...validSettlementPayload(),
        rawBrowserState: "blocked",
      },
      "rawBrowserState:rejected_sensitive_or_authority_field",
    );
  });

  test("credential, session, cookie, token, and BankID material are rejected", () => {
    for (const forbiddenPatch of [
      { credentials: "blocked" },
      { password: "blocked" },
      { cookie: "blocked" },
      { sessionToken: "blocked" },
      { authToken: "blocked" },
      { BankID: "blocked" },
      { bankIdData: "blocked" },
      { serviceRoleKey: "blocked" },
    ]) {
      const [field] = Object.keys(forbiddenPatch);

      expectInvalidReason(
        {
          ...validSettlementPayload(),
          ...forbiddenPatch,
        },
        `${field}:rejected_sensitive_or_authority_field`,
      );
    }
  });

  test("unredacted broker documents and arbitrary JSON blobs are rejected", () => {
    expectInvalidReason(
      {
        ...validSettlementPayload(),
        unredactedBrokerConfirmation: "blocked",
      },
      "unredactedBrokerConfirmation:rejected_sensitive_or_authority_field",
    );
    expectInvalidReason(
      {
        ...validSettlementPayload(),
        arbitraryJson: { unsafe: true },
      },
      "arbitraryJson:rejected_sensitive_or_authority_field",
    );
    expectInvalidReason(
      {
        ...validSettlementPayload(),
        metadataBlob: { unsafe: true },
      },
      "metadataBlob:unknown_top_level_field",
    );
  });

  test("nested objects and arrays are rejected even when field names are allowlisted", () => {
    expectInvalidReason(
      {
        ...validSettlementPayload(),
        brokerLabel: { source: "blocked_nested_object" },
      },
      "brokerLabel:arbitrary_json_blob_rejected",
    );
    expectInvalidReason(
      {
        ...validSettlementPayload(),
        reviewedBySafeActorLabel: ["blocked_array"],
      },
      "reviewedBySafeActorLabel:arbitrary_json_blob_rejected",
    );
  });

  test("execution intent and result mismatch is rejected", () => {
    expectInvalidReason(
      {
        ...validSettlementPayload(),
        executionIntentSide: "BUY",
        executionResultSide: "SELL",
      },
      "executionResultSide:intent_result_mismatch",
    );
    expectInvalidReason(
      {
        ...validSettlementPayload(),
        executionIntentTicker: "TURBUY",
        executionResultTicker: "OTHER",
      },
      "executionResultTicker:intent_result_mismatch",
    );
    expectInvalidReason(
      {
        ...validSettlementPayload(),
        executionIntentQuantity: 12,
        executionResultQuantity: 11,
      },
      "executionResultQuantity:intent_result_mismatch",
    );
  });

  test("missing idempotency or required identifiers are rejected", () => {
    expectInvalidReason(
      {
        ...validSettlementPayload(),
        idempotencyKey: "",
      },
      "idempotencyKey:required_text_missing",
    );
    expectInvalidReason(
      {
        ...validSettlementPayload(),
        reviewId: "",
      },
      "reviewId:required_text_missing",
    );
    expectInvalidReason(
      {
        ...validSettlementPayload(),
        extractionId: "",
      },
      "extractionId:required_text_missing",
    );
  });

  test("redacted broker confirmation metadata is accepted", () => {
    const result = validatePostTradePersistencePayload(
      validBrokerConfirmationMetadataPayload(),
    );

    expect(result.valid).toBe(true);
    expect(result.acceptedPayload).toMatchObject({
      payloadCategory: "broker_confirmation_evidence_metadata",
      evidenceKind: "redacted_confirmation_metadata",
      redactedEvidenceArtifactId: "redacted_artifact_mock_buy_001",
      rawArtifactStored: false,
    });
    expect(result.safetyFlags.metadataOnlyBrokerConfirmation).toBe(true);
  });

  test("allowlist and rejected field lists cover route design safety boundaries", () => {
    expect(postTradePayloadValidatorAllowedFields).toContain("idempotencyKey");
    expect(postTradePayloadValidatorAllowedFields).toContain("sourceFingerprint");
    expect(postTradePayloadValidatorAllowedFields).toContain("redactedEvidenceArtifactId");
    expect(postTradePayloadValidatorAllowedFields).toContain("executionIntentSide");
    expect(postTradePayloadValidatorRejectedFields).toContain("rawBrokerPayload");
    expect(postTradePayloadValidatorRejectedFields).toContain("rawAvanzaState");
    expect(postTradePayloadValidatorRejectedFields).toContain("sessionToken");
    expect(postTradePayloadValidatorRejectedFields).toContain("bankIdData");
    expect(postTradePayloadValidatorRejectedFields).toContain("unredactedBrokerConfirmation");
    expect(postTradePayloadValidatorRejectedFields).toContain("arbitraryJson");
  });

  test("validator and tests stay isolated from routes, Supabase clients, and runtime writes", () => {
    const validatorSource = readSource(validatorPath);
    const specSource = readSource(specPath);
    const forbiddenImportFragments = [
      "@/lib/supabase",
      "supabase-server",
      "createClient(",
      "app/api/",
      "app/trade-app",
      "scripts/",
      "avanza-localhost-bridge",
      "avanza-login-smoke-test",
      "avanza-order-chain-smoke-test",
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
      [validatorPath, validatorSource],
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

    expect(validatorSource).not.toContain("insert(");
    expect(validatorSource).not.toContain("upsert(");
    expect(validatorSource).not.toContain("update(");
    expect(validatorSource).not.toContain("delete(");
    expect(validatorSource).not.toContain("supabase.");
  });
});
