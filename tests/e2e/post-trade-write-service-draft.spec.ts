import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { buildPostTradePersistenceDryRunPlan } from "../../lib/post-trade-persistence-service-plan";
import {
  buildPostTradeWriteServiceDraftCommands,
} from "../../lib/post-trade-write-service-draft";
import {
  validatePostTradePersistencePayload,
  type PostTradePayloadValidationAcceptedPayload,
  type PostTradePayloadValidationResult,
} from "../../lib/post-trade-payload-validator";

const repoRoot = process.cwd();
const writeServiceDraftPath = "lib/post-trade-write-service-draft.ts";
const routePath = "app/api/post-trade/payload/validate/route.ts";
const servicePlanPath = "lib/post-trade-persistence-service-plan.ts";
const tradeUiPath = "app/trade-app.tsx";

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

function validValidationAndPlan() {
  const validation = validatePostTradePersistencePayload(validPayload());
  const dryRunPlan = buildPostTradePersistenceDryRunPlan(validation);

  expect(validation.valid).toBe(true);
  expect(dryRunPlan.ready).toBe(true);

  return { validation, dryRunPlan };
}

test.describe("post-trade write service draft command builder", () => {
  test("valid validator result and dry-run plan build no-remote-write command objects", () => {
    const { validation, dryRunPlan } = validValidationAndPlan();
    const result = buildPostTradeWriteServiceDraftCommands({
      validationResult: validation,
      dryRunPlan,
    });

    expect(result).toMatchObject({
      contractVersion: "post_trade_write_service_draft_v1",
      status: "ready_no_remote_write",
      ready: true,
      executionMode: "dry_run_command_only",
      idempotencyKey: "post_trade:review:mock_buy_review_001",
      safetyFlags: {
        noServiceClientFactoryImport: true,
        noSupabaseClientImport: true,
        noServiceRoleUsage: true,
        noRemoteWrite: true,
        noDatabaseConnection: true,
        noRuntimeActivation: true,
        noTradeUiExecution: true,
        productionBlocked: true,
      },
    });
    expect(result.writeCommands).toHaveLength(dryRunPlan.targetTables.length);
    expect(result.writeCommands.map((command) => command.table)).toEqual(
      dryRunPlan.targetTables,
    );
    for (const command of result.writeCommands) {
      expect(command.operationType).toBe("prepared_insert_command");
      expect(command.executionMode).toBe("dry_run_command_only");
      expect(command.remoteExecution).toBe(false);
      expect(command.idempotencyKey).toBe(result.idempotencyKey);
      expect(command.recordBody).toMatchObject({
        reviewId: "mock_buy_review_001",
        extractionId: "mock_buy_settlement_extraction_001",
        sensitiveDataPresent: false,
        productionPersistenceAllowed: false,
        rawArtifactStored: false,
      });
    }
    expect(result.auditCommand).toMatchObject({
      table: "execution_record_audit_events",
      operationType: "prepared_audit_insert_command",
      executionMode: "dry_run_command_only",
      remoteExecution: false,
      eventType: "post_trade_write_command_draft_created",
      idempotencyKey: result.idempotencyKey,
    });
  });

  test("invalid validator result is rejected", () => {
    const validation = validatePostTradePersistencePayload({
      ...validPayload(),
      executionResultSide: "SELL",
    });
    const dryRunPlan = buildPostTradePersistenceDryRunPlan(validation);
    const result = buildPostTradeWriteServiceDraftCommands({
      validationResult: validation,
      dryRunPlan,
    });

    expect(result).toMatchObject({
      status: "blocked_invalid_validation_result",
      ready: false,
      writeCommands: [],
      auditCommand: null,
      idempotencyKey: null,
    });
    expect(result.reasons).toContain("executionResultSide:intent_result_mismatch");
  });

  test("missing dry-run plan is rejected", () => {
    const { validation } = validValidationAndPlan();
    const result = buildPostTradeWriteServiceDraftCommands({
      validationResult: validation,
      dryRunPlan: null,
    });

    expect(result).toMatchObject({
      status: "blocked_missing_dry_run_plan",
      ready: false,
      rejectedFields: [
        { field: "dryRunPlan", reason: "dry_run_plan_required" },
      ],
      reasons: ["dryRunPlan:dry_run_plan_required"],
    });
  });

  test("unsafe safety flags are rejected", () => {
    const { validation, dryRunPlan } = validValidationAndPlan();
    const unsafeValidation = {
      ...validation,
      safetyFlags: {
        ...validation.safetyFlags,
        noRawBrokerPayload: false,
      },
    } as PostTradePayloadValidationResult;
    const result = buildPostTradeWriteServiceDraftCommands({
      validationResult: unsafeValidation,
      dryRunPlan,
    });

    expect(result).toMatchObject({
      status: "blocked_unsafe_safety_flags",
      ready: false,
      writeCommands: [],
      auditCommand: null,
      rejectedFields: [
        { field: "safetyFlags", reason: "unsafe_validation_safety_flags" },
      ],
    });
  });

  test("missing or mismatched idempotency alignment is rejected", () => {
    const { validation, dryRunPlan } = validValidationAndPlan();
    const mismatchedPlan = {
      ...dryRunPlan,
      idempotencyKey: "post_trade:mismatch",
    };
    const result = buildPostTradeWriteServiceDraftCommands({
      validationResult: validation,
      dryRunPlan: mismatchedPlan,
    });

    expect(result).toMatchObject({
      status: "blocked_idempotency_mismatch",
      ready: false,
      rejectedFields: [
        { field: "idempotencyKey", reason: "idempotency_alignment_required" },
      ],
    });
  });

  test("sanitized record body excludes raw payloads and secrets", () => {
    const { validation, dryRunPlan } = validValidationAndPlan();
    const unsafeValidation = {
      ...validation,
      acceptedPayload: {
        ...validation.acceptedPayload,
        rawBrokerPayload: "blocked_raw_payload",
        serviceRoleKey: "blocked_secret",
      },
    } as unknown as PostTradePayloadValidationResult;
    const result = buildPostTradeWriteServiceDraftCommands({
      validationResult: unsafeValidation,
      dryRunPlan,
    });
    const serialized = JSON.stringify(result);

    expect(result).toMatchObject({
      status: "blocked_unsafe_payload",
      ready: false,
    });
    expect(serialized).not.toContain("blocked_raw_payload");
    expect(serialized).not.toContain("blocked_secret");
  });

  test("arbitrary JSON blob values are rejected before command building", () => {
    const { validation, dryRunPlan } = validValidationAndPlan();
    const unsafeValidation = {
      ...validation,
      acceptedPayload: {
        ...validation.acceptedPayload,
        brokerLabel: { nested: "blocked" },
      },
    } as unknown as PostTradePayloadValidationResult;
    const result = buildPostTradeWriteServiceDraftCommands({
      validationResult: unsafeValidation,
      dryRunPlan,
    });

    expect(result).toMatchObject({
      status: "blocked_unsafe_payload",
      ready: false,
      rejectedFields: [
        { field: "brokerLabel", reason: "unsafe_accepted_payload_value" },
      ],
    });
  });

  test("write service draft has no Supabase write fragments or remote execution", () => {
    const source = readSource(writeServiceDraftPath);
    const forbiddenFragments = [
      "@supabase/supabase-js",
      "createClient(",
      "post-trade-service-client-factory",
      "process.env",
      "fetch(",
      ".from(",
      ".insert(",
      ".update(",
      ".upsert(",
      ".delete(",
      ".rpc(",
      ".storage",
      "service_role",
      "console.log",
      "console.info",
      "console.warn",
      "console.error",
    ];

    expect(forbiddenFragments.filter((fragment) => source.includes(fragment))).toEqual([]);
    expect(source).toContain("remoteExecution: false");
    expect(source).toContain('"dry_run_command_only"');
    expect(source).toContain('"no_remote_write"');
  });

  test("write service draft is not wired into API route, service plan, or Trade UI", () => {
    const routeSource = readSource(routePath);
    const servicePlanSource = readSource(servicePlanPath);
    const tradeUiSource = readSource(tradeUiPath);

    expect(routeSource).not.toContain("post-trade-write-service-draft");
    expect(routeSource).not.toContain("buildPostTradeWriteServiceDraftCommands");
    expect(servicePlanSource).not.toContain("post-trade-write-service-draft");
    expect(servicePlanSource).not.toContain("buildPostTradeWriteServiceDraftCommands");
    expect(tradeUiSource).not.toContain("post-trade-write-service-draft");
    expect(tradeUiSource).not.toContain("buildPostTradeWriteServiceDraftCommands");
  });
});
