import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { POST } from "../../app/api/post-trade/payload/validate/route";
import type { PostTradePayloadValidationAcceptedPayload } from "../../lib/post-trade-payload-validator";

const repoRoot = process.cwd();
const routePath = "app/api/post-trade/payload/validate/route.ts";
const routeLiteral = "/api/post-trade/payload/validate";

function readSource(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function validPayload(): PostTradePayloadValidationAcceptedPayload {
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

async function postJson(payload: unknown) {
  const response = await POST(
    new Request(`http://localhost${routeLiteral}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );

  return {
    status: response.status,
    body: await response.json(),
  };
}

async function postRaw(body: string) {
  const response = await POST(
    new Request(`http://localhost${routeLiteral}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
    }),
  );

  return {
    status: response.status,
    body: await response.json(),
  };
}

test.describe("post-trade payload validation route stub", () => {
  test("valid payload returns validation success without echoing accepted payload", async () => {
    const result = await postJson(validPayload());

    expect(result.status).toBe(200);
    expect(result.body).toMatchObject({
      routeContractVersion: "post_trade_payload_validation_route_stub_v1",
      routePath: routeLiteral,
      method: "POST",
      status: "validation_success",
      result: {
        valid: true,
        rejectedFields: [],
        reasons: [],
        safetyFlags: {
          allowlistedPayloadOnly: true,
          noSupabaseWriteAuthority: true,
          noProductionPersistence: true,
          noRuntimeActivation: true,
        },
      },
      safety: {
        validationOnly: true,
        servicePlanDryRunOnly: true,
        acceptedPayloadPersisted: false,
        acceptedPayloadReturned: false,
        rawRejectedPayloadReturned: false,
        supabaseClientImported: false,
        supabaseWriteAllowed: false,
        writeServiceCalled: false,
        runtimeWritePathActivated: false,
      },
    });
    expect(result.body.persistencePlan).toMatchObject({
      status: "dry_run_only",
      mode: "no_write",
      ready: true,
      targetTables: [
        "execution_redacted_artifacts",
        "execution_confirmation_evidence",
        "execution_settlement_reviews",
        "execution_cost_breakdowns",
        "execution_deviation_reviews",
        "execution_record_audit_events",
      ],
      plannedOperations: [
        {
          table: "execution_redacted_artifacts",
          operationType: "dry_run_planned_insert",
          mode: "no_write_plan_only",
        },
        {
          table: "execution_confirmation_evidence",
          operationType: "dry_run_planned_insert",
          mode: "no_write_plan_only",
        },
        {
          table: "execution_settlement_reviews",
          operationType: "dry_run_planned_insert",
          mode: "no_write_plan_only",
        },
        {
          table: "execution_cost_breakdowns",
          operationType: "dry_run_planned_insert",
          mode: "no_write_plan_only",
        },
        {
          table: "execution_deviation_reviews",
          operationType: "dry_run_planned_insert",
          mode: "no_write_plan_only",
        },
        {
          table: "execution_record_audit_events",
          operationType: "dry_run_planned_insert",
          mode: "no_write_plan_only",
        },
      ],
      idempotencyKey: "post_trade:review:mock_buy_review_001",
      duplicatePreventionKey: "post_trade:duplicate:mock_buy_contract_001",
      auditEventPlan: {
        table: "execution_record_audit_events",
        eventType: "post_trade_persistence_dry_run_plan_created",
        wouldWrite: false,
      },
      safetyFlags: {
        noSupabaseClientImport: true,
        noServiceRoleUsage: true,
        noDatabaseConnection: true,
        noDatabaseWrite: true,
        noRuntimeActivation: true,
        noTradeUiExecution: true,
        productionBlocked: true,
        stagingApplicationWriteBlocked: true,
      },
    });
    expect(result.body.result.acceptedPayload).toBeUndefined();
    expect(JSON.stringify(result.body)).not.toContain("internal_trade_mock_001");
  });

  test("invalid payload returns structured validation failure", async () => {
    const result = await postJson({
      ...validPayload(),
      unexpectedField: "blocked",
    });

    expect(result.status).toBe(400);
    expect(result.body.status).toBe("validation_failed");
    expect(result.body.result.valid).toBe(false);
    expect(result.body.result.reasons).toContain(
      "unexpectedField:unknown_top_level_field",
    );
    expect(result.body.result.rejectedFields).toContainEqual({
      field: "unexpectedField",
      reason: "unknown_top_level_field",
    });
    expect(result.body.persistencePlan).toBeNull();
    expect(result.body.result.acceptedPayload).toBeUndefined();
  });

  test("raw broker, credential, session, and BankID payload is rejected", async () => {
    const result = await postJson({
      ...validPayload(),
      rawBrokerPayload: "blocked_raw_broker",
      credentials: "blocked_credentials",
      sessionToken: "blocked_session",
      bankIdData: "blocked_bankid",
    });

    expect(result.status).toBe(400);
    expect(result.body.result.reasons).toEqual(
      expect.arrayContaining([
        "rawBrokerPayload:rejected_sensitive_or_authority_field",
        "credentials:rejected_sensitive_or_authority_field",
        "sessionToken:rejected_sensitive_or_authority_field",
        "bankIdData:rejected_sensitive_or_authority_field",
      ]),
    );
    expect(result.body.result.safetyFlags).toMatchObject({
      noRawBrokerPayload: false,
      noCredentialSessionOrBankIdMaterial: false,
    });
    expect(result.body.persistencePlan).toBeNull();
  });

  test("route does not import Supabase client or write services", () => {
    const source = readSource(routePath);
    const forbiddenImportFragments = [
      "@/lib/supabase",
      "supabase-server",
      "createClient(",
      "serviceRole",
      "service_role",
      "@/lib/server/",
      "execution-audit-supabase-writer",
      "execution-audit-persistence-writer",
      "execution-record-store",
      "execution-record-insert",
      "appendExecutionRecordAuditEvent",
      "insert(",
      "upsert(",
      "update(",
      "delete(",
      "supabase.",
    ];
    const forbiddenSourceFragments = [
      "createClient(",
      "serviceRole",
      "service_role",
      "@/lib/server/",
      "execution-audit-supabase-writer",
      "execution-audit-persistence-writer",
      "execution-record-store",
      "execution-record-insert",
      "appendExecutionRecordAuditEvent",
      "insert(",
      "upsert(",
      "update(",
      "delete(",
      "supabase.",
    ];
    const importLines = source
      .split("\n")
      .filter((line) => line.trim().startsWith("import "));
    const importViolations = forbiddenImportFragments.filter((fragment) =>
      importLines.some((line) => line.includes(fragment)),
    );
    const sourceViolations = forbiddenSourceFragments.filter((fragment) =>
      source.includes(fragment),
    );

    expect(importViolations).toEqual([]);
    expect(sourceViolations).toEqual([]);
  });

  test("route builds service plan only after validation succeeds", () => {
    const source = readSource(routePath);
    const validationIndex = source.indexOf(
      "const validation = validatePostTradePersistencePayload(body);",
    );
    const planIndex = source.indexOf(
      "const persistencePlan = validation.valid",
    );
    const buildIndex = source.indexOf("buildPostTradePersistenceDryRunPlan(validation)");

    expect(validationIndex).toBeGreaterThan(-1);
    expect(planIndex).toBeGreaterThan(validationIndex);
    expect(buildIndex).toBeGreaterThan(planIndex);
    expect(source).toContain(
      "const persistencePlan = validation.valid\n    ? buildPostTradePersistenceDryRunPlan(validation)\n    : null;",
    );
  });

  test("route response does not expose secrets or raw rejected payload values", async () => {
    const result = await postJson({
      ...validPayload(),
      rawBrokerPayload: "RAW_BROKER_SECRET_VALUE",
      sessionToken: "SESSION_SECRET_VALUE",
      bankIdData: "BANKID_SECRET_VALUE",
      unredactedBrokerConfirmation: "UNREDACTED_DOC_SECRET_VALUE",
    });
    const serialized = JSON.stringify(result.body);

    expect(result.status).toBe(400);
    expect(serialized).not.toContain("RAW_BROKER_SECRET_VALUE");
    expect(serialized).not.toContain("SESSION_SECRET_VALUE");
    expect(serialized).not.toContain("BANKID_SECRET_VALUE");
    expect(serialized).not.toContain("UNREDACTED_DOC_SECRET_VALUE");
    expect(serialized).not.toContain("rawBrokerPayload\":\"RAW");
    expect(result.body.persistencePlan).toBeNull();
    expect(result.body.result.acceptedPayload).toBeUndefined();
  });

  test("malformed JSON returns sanitized validation failure", async () => {
    const result = await postRaw('{"rawBrokerPayload":"RAW_SECRET_VALUE"');
    const serialized = JSON.stringify(result.body);

    expect(result.status).toBe(400);
    expect(result.body).toMatchObject({
      status: "validation_failed",
      result: {
        valid: false,
        rejectedFields: [{ field: "payload", reason: "invalid_json" }],
        reasons: ["payload:invalid_json"],
      },
      safety: {
        validationOnly: true,
        acceptedPayloadPersisted: false,
        acceptedPayloadReturned: false,
        rawRejectedPayloadReturned: false,
      },
    });
    expect(result.body.persistencePlan).toBeNull();
    expect(serialized).not.toContain("RAW_SECRET_VALUE");
    expect(result.body.result.acceptedPayload).toBeUndefined();
  });

  test("route exposes only POST and remains unwired from Trade UI", () => {
    const source = readSource(routePath);
    const tradeUiSource = readSource("app/trade-app.tsx");

    expect(source).toContain("export async function POST");
    for (const method of ["GET", "PUT", "PATCH", "DELETE"]) {
      expect(source).not.toContain(`export async function ${method}`);
    }
    expect(tradeUiSource).not.toContain(routeLiteral);
    expect(tradeUiSource).not.toContain("post-trade/payload/validate");
  });
});
