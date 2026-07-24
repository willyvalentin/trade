import { expect, test } from "@playwright/test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import { buildPostTradeExecutionRecordPrerequisiteCommands } from "../../lib/post-trade-execution-record-prerequisite-command";
import { buildPostTradePersistenceDryRunPlan } from "../../lib/post-trade-persistence-service-plan";
import {
  validatePostTradePersistencePayload,
  type PostTradePayloadValidationAcceptedPayload,
  type PostTradePayloadValidationResult,
} from "../../lib/post-trade-payload-validator";

const repoRoot = process.cwd();
const prerequisiteCommandPath =
  "lib/post-trade-execution-record-prerequisite-command.ts";
const adapterPath = "lib/post-trade-remote-execution-adapter.ts";
const routePath = "app/api/post-trade/payload/validate/route.ts";
const tradeUiPath = "app/trade-app.tsx";

function readSource(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function collectSourceFiles(root: string): string[] {
  const absoluteRoot = join(repoRoot, root);
  const results: string[] = [];

  for (const entry of readdirSync(absoluteRoot)) {
    if (entry === ".next" || entry === "node_modules" || entry === "tmp") {
      continue;
    }

    const absolutePath = join(absoluteRoot, entry);
    const stats = statSync(absolutePath);

    if (stats.isDirectory()) {
      results.push(...collectSourceFiles(relative(repoRoot, absolutePath)));
      continue;
    }

    if (/\.(ts|tsx|js|jsx)$/.test(entry)) {
      results.push(relative(repoRoot, absolutePath));
    }
  }

  return results;
}

function validPayload(): PostTradePayloadValidationAcceptedPayload {
  return {
    payloadCategory: "settlement_review",
    internalTradeId: "internal_trade_mock_execution_record_001",
    planId: "mock_execution_record_plan_001",
    contractId: "mock_execution_record_contract_001",
    reviewId: "mock_execution_record_review_001",
    extractionId: "mock_execution_record_extraction_001",
    idempotencyKey:
      "post_trade:test:execution_record_prerequisite:mock_001",
    duplicatePreventionKey:
      "post_trade:test:execution_record_prerequisite_duplicate:mock_001",
    sourceFingerprint: "source_fingerprint_mock_execution_record_001",
    redactedEvidenceArtifactId: "redacted_artifact_mock_execution_record_001",
    side: "BUY",
    ticker: "TURMOCK",
    quantity: 1,
    plannedPrice: 10,
    executionPrice: 10.25,
    slippage: 0.25,
    currency: "SEK",
    commission: 1,
    fxRate: 1,
    grossAmount: 10.25,
    settlementAmount: 11.25,
    deviationClassification: "execution_match",
    manualReviewStatus: "not_required",
    extractionTimestamp: "2026-07-09T10:00:00.000Z",
    reviewedBySafeActorLabel: "codex_staging_mock_gate",
    executionIntentSide: "BUY",
    executionResultSide: "BUY",
    executionIntentTicker: "TURMOCK",
    executionResultTicker: "TURMOCK",
    executionIntentQuantity: 1,
    executionResultQuantity: 1,
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

test.describe("post-trade execution-record prerequisite command builder", () => {
  test("valid mock payload builds exactly one execution record command and one dependent audit command", () => {
    const { validation, dryRunPlan } = validValidationAndPlan();
    const result = buildPostTradeExecutionRecordPrerequisiteCommands({
      validationResult: validation,
      dryRunPlan,
    });

    expect(result).toMatchObject({
      contractVersion: "post_trade_execution_record_prerequisite_command_v1",
      status: "ready_no_execution",
      ready: true,
      executionMode: "no_execution_without_separate_gate",
      remoteExecution: false,
      target: {
        environmentName: "ture-staging",
        projectRef: "pdvzyuhykomwfqyyztru",
      },
      safetyFlags: {
        stagingOnly: true,
        mockTestOnly: true,
        noExecutionInThisAction: true,
        requiresFutureOneShotExecutionGate: true,
        auditRequired: true,
        executionRecordPrerequisiteRequired: true,
        placeholderReferenceRequired: true,
        noRemoteWrite: true,
        noDatabaseWrite: true,
        productionBlocked: true,
      },
    });
    expect(result.commandSet).toHaveLength(2);
    expect(result.ready).toBe(true);
    if (!result.ready) throw new Error("expected ready prerequisite result");
    expect(result.executionRecordCommand).toMatchObject({
      commandId: "mock_execution_record_prerequisite",
      table: "execution_records",
      operationType: "prepared_execution_record_insert_command",
      executionMode: "no_execution_without_separate_gate",
      remoteExecution: false,
      stagingOnly: true,
      mockOnly: true,
      recordReference: "mock_execution_record_insert_result",
    });
    expect(result.executionRecordCommand.recordBody).toMatchObject({
      broker: "avanza",
      ticker: "TURMOCK",
      side: "buy",
      execution_phase: "entry",
      execution_mode: "semi_automatic",
      quantity: 1,
      price: 10.25,
      source_environment: "staging",
      is_mock: true,
      is_dev: true,
      validation_status: "eligible",
    });
    expect(result.auditCommand).toMatchObject({
      commandId: "mock_execution_record_audit_event",
      table: "execution_record_audit_events",
      operationType: "prepared_dependent_audit_insert_command",
      dependsOnCommandId: "mock_execution_record_prerequisite",
      executionRecordReference: "mock_execution_record_insert_result",
      executionMode: "no_execution_without_separate_gate",
      remoteExecution: false,
    });
    expect(result.auditCommand.recordBody).toMatchObject({
      execution_record_id_reference: "mock_execution_record_insert_result",
      event_type: "post_trade_staging_mock_execution_record_command_created",
      event_status: "blocked",
      source_system: "post_trade_staging_mock",
      remoteExecution: false,
    });
  });

  test("dependent audit command is always tied to the prerequisite reference", () => {
    const { validation, dryRunPlan } = validValidationAndPlan();
    const result = buildPostTradeExecutionRecordPrerequisiteCommands({
      validationResult: validation,
      dryRunPlan,
    });

    expect(result.ready).toBe(true);
    if (!result.ready) throw new Error("expected ready prerequisite result");
    expect(result.auditCommand.dependsOnCommandId).toBe(
      result.executionRecordCommand.commandId,
    );
    expect(result.auditCommand.executionRecordReference).toBe(
      result.executionRecordCommand.recordReference,
    );
    expect(result.auditCommand.recordBody.execution_record_id_reference).toBe(
      result.executionRecordCommand.recordReference,
    );
  });

  test("invalid validation result is rejected before commands are built", () => {
    const validation = validatePostTradePersistencePayload({
      ...validPayload(),
      executionResultSide: "SELL",
    });
    const dryRunPlan = buildPostTradePersistenceDryRunPlan(validation);
    const result = buildPostTradeExecutionRecordPrerequisiteCommands({
      validationResult: validation,
      dryRunPlan,
    });

    expect(result).toMatchObject({
      status: "blocked_invalid_validation_result",
      ready: false,
      executionRecordCommand: null,
      auditCommand: null,
      commandSet: [],
    });
    expect(result.reasons).toContain("executionResultSide:intent_result_mismatch");
  });

  test("missing dry-run plan is rejected", () => {
    const { validation } = validValidationAndPlan();
    const result = buildPostTradeExecutionRecordPrerequisiteCommands({
      validationResult: validation,
      dryRunPlan: null,
    });

    expect(result).toMatchObject({
      status: "blocked_missing_dry_run_plan",
      ready: false,
      rejectedFields: [
        { field: "dryRunPlan", reason: "dry_run_plan_required" },
      ],
    });
  });

  test("missing audit plan blocks both prerequisite and dependent audit commands", () => {
    const { validation, dryRunPlan } = validValidationAndPlan();
    const planWithoutAudit = {
      ...dryRunPlan,
      auditEventPlan: null,
    };
    const result = buildPostTradeExecutionRecordPrerequisiteCommands({
      validationResult: validation,
      dryRunPlan: planWithoutAudit,
    });

    expect(result).toMatchObject({
      status: "blocked_unready_dry_run_plan",
      ready: false,
      executionRecordCommand: null,
      auditCommand: null,
      commandSet: [],
      rejectedFields: [
        { field: "dryRunPlan", reason: "ready_dry_run_plan_required" },
      ],
    });
  });

  test("idempotency mismatch rejects prerequisite and audit command creation", () => {
    const { validation, dryRunPlan } = validValidationAndPlan();
    const mismatchedPlan = {
      ...dryRunPlan,
      idempotencyKey: "post_trade:test:mismatch",
    };
    const result = buildPostTradeExecutionRecordPrerequisiteCommands({
      validationResult: validation,
      dryRunPlan: mismatchedPlan,
    });

    expect(result).toMatchObject({
      status: "blocked_idempotency_mismatch",
      ready: false,
      executionRecordCommand: null,
      auditCommand: null,
      commandSet: [],
      rejectedFields: [
        { field: "idempotencyKey", reason: "idempotency_alignment_required" },
      ],
    });
  });

  test("missing idempotency is rejected", () => {
    const { validation, dryRunPlan } = validValidationAndPlan();
    const unsafeValidation = {
      ...validation,
      acceptedPayload: {
        ...validation.acceptedPayload,
        idempotencyKey: "",
      },
    } as PostTradePayloadValidationResult;
    const result = buildPostTradeExecutionRecordPrerequisiteCommands({
      validationResult: unsafeValidation,
      dryRunPlan,
    });

    expect(result).toMatchObject({
      status: "blocked_missing_idempotency",
      ready: false,
      rejectedFields: [
        { field: "idempotencyKey", reason: "idempotency_key_required" },
      ],
    });
  });

  test("production target is rejected", () => {
    const { validation, dryRunPlan } = validValidationAndPlan();
    const result = buildPostTradeExecutionRecordPrerequisiteCommands({
      validationResult: validation,
      dryRunPlan,
      target: {
        environmentName: "Trade production",
        projectRef: "ekdyopdrrkphlrsilyoo",
      },
    });

    expect(result).toMatchObject({
      status: "blocked_production_target",
      ready: false,
      rejectedFields: [{ field: "target", reason: "staging_target_required" }],
    });
  });

  test("unsafe flags and raw sensitive payloads are rejected", () => {
    const { validation, dryRunPlan } = validValidationAndPlan();
    const unsafeFlagsValidation = {
      ...validation,
      safetyFlags: {
        ...validation.safetyFlags,
        noCredentialSessionOrBankIdMaterial: false,
      },
    } as PostTradePayloadValidationResult;
    const unsafePayloadValidation = {
      ...validation,
      acceptedPayload: {
        ...validation.acceptedPayload,
        rawBrokerPayload: "blocked_raw_payload",
        sessionToken: "blocked_session",
      },
    } as unknown as PostTradePayloadValidationResult;

    const unsafeFlagsResult = buildPostTradeExecutionRecordPrerequisiteCommands({
      validationResult: unsafeFlagsValidation,
      dryRunPlan,
    });
    const unsafePayloadResult = buildPostTradeExecutionRecordPrerequisiteCommands({
      validationResult: unsafePayloadValidation,
      dryRunPlan,
    });
    const serialized = JSON.stringify(unsafePayloadResult);

    expect(unsafeFlagsResult).toMatchObject({
      status: "blocked_unsafe_flags",
      ready: false,
    });
    expect(unsafePayloadResult).toMatchObject({
      status: "blocked_unsafe_payload",
      ready: false,
    });
    expect(serialized).not.toContain("blocked_raw_payload");
    expect(serialized).not.toContain("blocked_session");
  });

  test("prerequisite command builder has no Supabase write fragments or execution activation", () => {
    const source = readSource(prerequisiteCommandPath);
    const forbiddenFragments = [
      "@supabase/supabase-js",
      "createClient(",
      "post-trade-service-client-factory",
      "getPostTradeStagingServiceClient",
      "process.env",
      "fetch(",
      ".from(",
      ".insert(",
      ".update(",
      ".upsert(",
      ".delete(",
      ".rpc(",
      ".storage",
      "sql`",
      "directSql",
      "dashboard",
      "executeWrite",
      "executeCommands",
      "executeRemote",
      "runWrite",
      "console.log",
      "console.info",
      "console.warn",
      "console.error",
    ];

    expect(forbiddenFragments.filter((fragment) => source.includes(fragment))).toEqual(
      [],
    );
    expect(source).toContain("remoteExecution: false");
    expect(source).toContain('"no_execution_without_separate_gate"');
    expect(source).toContain("mock_execution_record_insert_result");
    expect(source).toContain("noRealBrokerOrAvanzaData: true");
    expect(source).toContain("noSettlementOrOrderBehavior: true");
    expect(source).not.toContain("export function buildAudit");
    expect(source).not.toContain("export function buildPostTradeExecutionRecordAudit");
  });

  test("prerequisite command builder is not wired into API route or Trade UI", () => {
    const importName = "post-trade-execution-record-prerequisite-command";

    expect(readSource(routePath)).not.toContain(importName);
    expect(readSource(adapterPath)).toContain(importName);
    expect(readSource(tradeUiPath)).not.toContain(importName);
    expect(
      collectSourceFiles("app").filter((file) =>
        readSource(file).includes(importName),
      ),
    ).toEqual([]);
  });
});
