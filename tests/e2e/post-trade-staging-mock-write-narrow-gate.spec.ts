import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { buildPostTradePersistenceDryRunPlan } from "../../lib/post-trade-persistence-service-plan";
import { buildPostTradeWriteServiceDraftCommands } from "../../lib/post-trade-write-service-draft";
import {
  validatePostTradePersistencePayload,
  type PostTradePayloadValidationAcceptedPayload,
} from "../../lib/post-trade-payload-validator";

const repoRoot = process.cwd();

function readSource(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function action457MockPayload(): PostTradePayloadValidationAcceptedPayload {
  return {
    payloadCategory: "settlement_review",
    internalTradeId: "action_457_mock_internal_trade_001",
    planId: "action_457_mock_plan_001",
    contractId: "action_457_mock_contract_001",
    reviewId: "action_457_mock_review_001",
    extractionId: "action_457_mock_extraction_001",
    idempotencyKey: "post_trade_mock_write:action_457:mock_review_001",
    duplicatePreventionKey:
      "post_trade_mock_write_duplicate:action_457:mock_contract_001",
    sourceFingerprint: "action_457_mock_source_fingerprint_001",
    redactedEvidenceArtifactId: "action_457_redacted_artifact_001",
    side: "BUY",
    ticker: "TURMOCK",
    quantity: 1,
    plannedPrice: 100,
    executionPrice: 100,
    slippage: 0,
    currency: "SEK",
    commission: 0,
    fxRate: 1,
    grossAmount: 100,
    settlementAmount: 100,
    deviationClassification: "execution_match",
    manualReviewStatus: "not_required",
    extractionTimestamp: "2026-07-08T00:00:00.000Z",
    reviewedBySafeActorLabel: "action_457_mock_review",
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

test.describe("Action 457 staging mock write narrow gate", () => {
  test("mock payload passes validation and builds sanitized no-remote-write commands only", () => {
    const validation = validatePostTradePersistencePayload(
      action457MockPayload(),
    );
    expect(validation.valid).toBe(true);
    expect(validation.safetyFlags).toMatchObject({
      allowlistedPayloadOnly: true,
      noRawBrokerPayload: true,
      noRawAvanzaOrBrowserState: true,
      noCredentialSessionOrBankIdMaterial: true,
      noUnredactedBrokerDocument: true,
      noArbitraryJsonBlob: true,
      noSupabaseWriteAuthority: true,
      noProductionPersistence: true,
      noRuntimeActivation: true,
      noLiveTradeOrPositionMutation: true,
      idempotencyReady: true,
      intentResultAligned: true,
    });

    const dryRunPlan = buildPostTradePersistenceDryRunPlan(validation);
    expect(dryRunPlan).toMatchObject({
      status: "ready_for_future_gated_write",
      ready: true,
      idempotencyKey: "post_trade_mock_write:action_457:mock_review_001",
    });
    expect(dryRunPlan.targetTables).toEqual([
      "execution_redacted_artifacts",
      "execution_confirmation_evidence",
      "execution_settlement_reviews",
      "execution_cost_breakdowns",
      "execution_deviation_reviews",
      "execution_record_audit_events",
    ]);
    expect(dryRunPlan.auditEventPlan).toMatchObject({
      table: "execution_record_audit_events",
      wouldWrite: false,
      idempotencyKey: "post_trade_mock_write:action_457:mock_review_001",
    });

    const writeCommandResult = buildPostTradeWriteServiceDraftCommands({
      validationResult: validation,
      dryRunPlan,
    });
    expect(writeCommandResult).toMatchObject({
      status: "ready_no_remote_write",
      ready: true,
      executionMode: "dry_run_command_only",
      idempotencyKey: "post_trade_mock_write:action_457:mock_review_001",
      safetyFlags: {
        noRemoteWrite: true,
        noDatabaseConnection: true,
        noRuntimeActivation: true,
        noTradeUiExecution: true,
        productionBlocked: true,
      },
    });
    expect(writeCommandResult.auditCommand).toMatchObject({
      table: "execution_record_audit_events",
      operationType: "prepared_audit_insert_command",
      executionMode: "dry_run_command_only",
      remoteExecution: false,
      idempotencyKey: writeCommandResult.idempotencyKey,
    });
    expect(writeCommandResult.writeCommands).toHaveLength(
      dryRunPlan.targetTables.length,
    );

    for (const command of writeCommandResult.writeCommands) {
      expect(command.operationType).toBe("prepared_insert_command");
      expect(command.executionMode).toBe("dry_run_command_only");
      expect(command.remoteExecution).toBe(false);
      expect(command.idempotencyKey).toBe(writeCommandResult.idempotencyKey);
      expect(Object.values(command.recordBody).every((value) => {
        return (
          value === null ||
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean"
        );
      })).toBe(true);
      expect(JSON.stringify(command.recordBody)).not.toMatch(
        /rawBroker|rawBrowser|credential|cookie|session|bankId|BankID|unredacted|jsonBlob|payloadBlob/i,
      );
    }
  });

  test("current reviewed implementation path remains blocked before remote execution", () => {
    const wiringSource = readSource(
      "lib/post-trade-write-service-client-wiring-draft.ts",
    );
    const routeSource = readSource("app/api/post-trade/payload/validate/route.ts");
    const tradeUiSource = readSource("app/trade-app.tsx");

    expect(wiringSource).toContain('executionStatus: "blocked_no_remote_write"');
    expect(wiringSource).toContain(
      'requiredFutureApprovalGate: "post_trade_staging_write_execution_gate"',
    );
    expect(wiringSource).not.toContain("getPostTradeStagingServiceClient(");
    expect(wiringSource).not.toMatch(
      /\.(insert|update|delete|upsert|rpc|storage)\s*\(/,
    );
    expect(routeSource).not.toContain(
      "buildPostTradeWriteServiceClientWiringDraft",
    );
    expect(routeSource).not.toContain("buildPostTradeWriteServiceDraftCommands");
    expect(tradeUiSource).not.toContain(
      "buildPostTradeWriteServiceClientWiringDraft",
    );
    expect(tradeUiSource).not.toContain("buildPostTradeWriteServiceDraftCommands");
  });
});
