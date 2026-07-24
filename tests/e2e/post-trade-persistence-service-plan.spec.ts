import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { buildPostTradePersistenceDryRunPlan } from "../../lib/post-trade-persistence-service-plan";
import {
  validatePostTradePersistencePayload,
  type PostTradePayloadValidationAcceptedPayload,
  type PostTradePayloadValidationResult,
} from "../../lib/post-trade-payload-validator";

const repoRoot = process.cwd();
const servicePlanPath = "lib/post-trade-persistence-service-plan.ts";
const routePath = "app/api/post-trade/payload/validate/route.ts";
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

test.describe("post-trade persistence service plan draft", () => {
  test("valid accepted payload produces dry-run plan only", () => {
    const validation = validatePostTradePersistencePayload(validPayload());
    const plan = buildPostTradePersistenceDryRunPlan(validation);

    expect(plan).toMatchObject({
      contractVersion: "post_trade_persistence_service_plan_v1",
      status: "ready_for_future_gated_write",
      ready: true,
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
    expect(plan.targetTables).toEqual([
      "execution_redacted_artifacts",
      "execution_confirmation_evidence",
      "execution_settlement_reviews",
      "execution_cost_breakdowns",
      "execution_deviation_reviews",
      "execution_record_audit_events",
    ]);
    expect(plan.intendedOperations).toEqual(
      plan.targetTables.map((table) => ({
        table,
        operationType: "dry_run_planned_insert",
        mode: "no_write_plan_only",
      })),
    );
    expect(JSON.stringify(plan)).not.toContain("rawBrokerPayload");
  });

  test("payload categories map to expected dry-run target table plans", () => {
    const categoryCases = [
      {
        label: "broker confirmation metadata",
        payload: {
          ...validPayload(),
          payloadCategory: "broker_confirmation_evidence_metadata",
          brokerLabel: "avanza_redacted_metadata",
          evidenceKind: "redacted_confirmation_metadata",
          evidenceTimestamp: "2026-07-07T09:31:30.000Z",
        },
        expectedTables: [
          "execution_redacted_artifacts",
          "execution_confirmation_evidence",
          "execution_record_audit_events",
        ],
      },
      {
        label: "cost breakdown",
        payload: {
          ...validPayload(),
          payloadCategory: "cost_breakdown",
          redactedEvidenceArtifactId: undefined,
        },
        expectedTables: [
          "execution_cost_breakdowns",
          "execution_record_audit_events",
        ],
      },
      {
        label: "manual review status",
        payload: {
          ...validPayload(),
          payloadCategory: "manual_review_status",
          redactedEvidenceArtifactId: undefined,
        },
        expectedTables: [
          "execution_deviation_reviews",
          "execution_record_audit_events",
        ],
      },
      {
        label: "learning candidate",
        payload: {
          ...validPayload(),
          payloadCategory: "learning_candidate",
          redactedEvidenceArtifactId: undefined,
          learningCandidateStatus: "staged_manual_review_only",
          outcomeEligible: false,
          requiresSeparateLearningGate: true,
          manualReviewStatus: "approved_for_review_only",
        },
        expectedTables: [
          "execution_learning_candidates",
          "execution_record_audit_events",
        ],
      },
    ] as const;

    for (const scenario of categoryCases) {
      const validation = validatePostTradePersistencePayload(scenario.payload);
      const plan = buildPostTradePersistenceDryRunPlan(validation);

      expect(validation.valid, scenario.label).toBe(true);
      expect(plan.ready, scenario.label).toBe(true);
      expect(plan.targetTables, scenario.label).toEqual(scenario.expectedTables);
      expect(plan.intendedOperations, scenario.label).toEqual(
        scenario.expectedTables.map((table) => ({
          table,
          operationType: "dry_run_planned_insert",
          mode: "no_write_plan_only",
        })),
      );
    }
  });

  test("invalid validation result is rejected", () => {
    const validation = validatePostTradePersistencePayload({
      ...validPayload(),
      executionResultSide: "SELL",
    });
    const plan = buildPostTradePersistenceDryRunPlan(validation);

    expect(plan).toMatchObject({
      status: "blocked_invalid_validation_result",
      ready: false,
      targetTables: [],
      intendedOperations: [],
      idempotencyKey: null,
      auditEventPlan: null,
    });
    expect(plan.reasons).toContain("executionResultSide:intent_result_mismatch");
  });

  test("missing accepted payload is rejected", () => {
    const validation = {
      ...validatePostTradePersistencePayload(validPayload()),
      acceptedPayload: null,
    } as unknown as PostTradePayloadValidationResult;
    const plan = buildPostTradePersistenceDryRunPlan(validation);

    expect(plan).toMatchObject({
      status: "blocked_missing_accepted_payload",
      ready: false,
      rejectedFields: [
        { field: "acceptedPayload", reason: "accepted_payload_required" },
      ],
      reasons: ["acceptedPayload:accepted_payload_required"],
    });
  });

  test("raw unvalidated payload is rejected", () => {
    const plan = buildPostTradePersistenceDryRunPlan({
      ...validPayload(),
      rawBrokerPayload: "blocked_raw_payload",
    });
    const serialized = JSON.stringify(plan);

    expect(plan).toMatchObject({
      status: "blocked_unvalidated_payload",
      ready: false,
      rejectedFields: [
        { field: "validationResult", reason: "validation_result_required" },
      ],
      reasons: ["validationResult:validation_result_required"],
    });
    expect(serialized).not.toContain("blocked_raw_payload");
  });

  test("unsafe accepted payload shape is rejected even if wrapper claims valid", () => {
    const validation = validatePostTradePersistencePayload(validPayload());

    expect(validation.valid).toBe(true);

    const unsafeValidation = {
      ...validation,
      acceptedPayload: {
        ...validation.acceptedPayload,
        rawBrokerPayload: "blocked_raw_payload",
      },
    } as unknown as PostTradePayloadValidationResult;
    const plan = buildPostTradePersistenceDryRunPlan(unsafeValidation);
    const serialized = JSON.stringify(plan);

    expect(plan).toMatchObject({
      status: "blocked_unsafe_payload",
      ready: false,
      rejectedFields: [
        {
          field: "rawBrokerPayload",
          reason: "forbidden_field_in_accepted_payload",
        },
      ],
    });
    expect(serialized).not.toContain("blocked_raw_payload");
  });

  test("unsafe validation safety flags are rejected even when wrapper claims valid", () => {
    const validation = validatePostTradePersistencePayload(validPayload());

    expect(validation.valid).toBe(true);

    const unsafeValidation = {
      ...validation,
      safetyFlags: {
        ...validation.safetyFlags,
        noRuntimeActivation: false,
      },
    } as PostTradePayloadValidationResult;
    const plan = buildPostTradePersistenceDryRunPlan(unsafeValidation);

    expect(plan).toMatchObject({
      status: "blocked_unsafe_payload",
      ready: false,
      rejectedFields: [
        { field: "safetyFlags", reason: "unsafe_validation_safety_flags" },
      ],
      reasons: ["safetyFlags:unsafe_validation_safety_flags"],
      targetTables: [],
      intendedOperations: [],
    });
  });

  test("service plan module imports no Supabase client, service role, or write calls", () => {
    const source = readSource(servicePlanPath);
    const importLines = source
      .split("\n")
      .filter((line) => line.trim().startsWith("import "));
    const forbiddenImportFragments = [
      "@/lib/supabase",
      "supabase-server",
      "createClient(",
      "@/lib/server/",
      "execution-audit-supabase-writer",
      "execution-audit-persistence-writer",
      "execution-record-store",
      "execution-record-insert",
      "app/api/",
      "app/trade-app",
    ];
    const forbiddenSourceFragments = [
      "createClient(",
      "service_role",
      ".insert(",
      ".upsert(",
      ".update(",
      ".delete(",
      ".from(",
      "supabase.",
      "fetch(",
      "process.env",
      "localStorage",
      "sessionStorage",
      "document.cookie",
      "child_process",
    ];

    expect(
      forbiddenImportFragments.filter((fragment) =>
        importLines.some((line) => line.includes(fragment)),
      ),
    ).toEqual([]);
    expect(
      forbiddenSourceFragments.filter((fragment) => source.includes(fragment)),
    ).toEqual([]);
  });

  test("service plan module is wired only into API validation route and not Trade UI", () => {
    const routeSource = readSource(routePath);
    const tradeUiSource = readSource(tradeUiPath);
    const routeRequiredFragments = [
      "post-trade-persistence-service-plan",
      "buildPostTradePersistenceDryRunPlan",
    ];
    const tradeUiForbiddenFragments = [
      ...routeRequiredFragments,
      "post_trade_persistence_service_plan_v1",
    ];

    for (const fragment of routeRequiredFragments) {
      expect(routeSource, fragment).toContain(fragment);
    }
    expect(
      tradeUiForbiddenFragments.filter((fragment) =>
        tradeUiSource.includes(fragment),
      ),
    ).toEqual([]);
  });
});
