import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  POST_TRADE_CANONICAL_STAGING_EXECUTION_AUTHORIZATION_ARTIFACT,
  POST_TRADE_FINAL_GATE_IDENTITY,
  POST_TRADE_STAGING_EXECUTION_FUNCTION_IDENTITY,
  buildPostTradeStagingExecutionAuthorizationArtifactFingerprint,
  type PostTradeStagingExecutionAuthorizationArtifact,
  type PostTradeStagingExecutionAuthorizationArtifactCore,
} from "../../lib/post-trade-staging-execution-authorization-artifact-core";
import {
  buildPostTradeAuthorizationConsumptionPersistencePlan,
  buildPostTradeAuthorizationConsumptionReadBackRequest,
  buildPostTradeAuthorizationConsumptionRequest,
  classifyPostTradeAuthorizationConsumptionPersistenceResult,
  classifyPostTradeAuthorizationConsumptionReplay,
  evaluatePostTradeAuthorizationConsumptionReadBackResult,
  validatePostTradeAuthorizationConsumptionRequest,
  type PostTradeAuthorizationConsumptionEvidence,
  type PostTradeAuthorizationConsumptionRequest,
} from "../../lib/post-trade-durable-one-shot-authorization-consumption-contract";
import {
  POST_TRADE_FINAL_STAGING_PROJECT_REF,
  POST_TRADE_REJECTED_PRODUCTION_PROJECT_REF,
} from "../../lib/post-trade-final-staging-execution-gate-core";

const requestedConsumptionAtIso = "2026-07-11T13:00:00.000Z";
const consumptionOperationId = "post_trade_consumption_operation_001";

function artifact(
  overrides: Partial<PostTradeStagingExecutionAuthorizationArtifactCore> = {},
): PostTradeStagingExecutionAuthorizationArtifact {
  const core = {
    ...POST_TRADE_CANONICAL_STAGING_EXECUTION_AUTHORIZATION_ARTIFACT,
    ...overrides,
  };
  const coreWithoutFingerprint = Object.fromEntries(
    Object.entries(core).filter(([key]) => key !== "artifactFingerprint"),
  ) as PostTradeStagingExecutionAuthorizationArtifactCore;

  return {
    ...coreWithoutFingerprint,
    artifactFingerprint:
      buildPostTradeStagingExecutionAuthorizationArtifactFingerprint(
        coreWithoutFingerprint,
      ),
  };
}

function validRequest() {
  const decision = buildPostTradeAuthorizationConsumptionRequest({
    artifact: POST_TRADE_CANONICAL_STAGING_EXECUTION_AUTHORIZATION_ARTIFACT,
    consumptionOperationId,
    requestedConsumptionAtIso,
    evaluatedAtIso: requestedConsumptionAtIso,
  });
  expect(decision.valid).toBe(true);
  expect(decision.request).not.toBeNull();
  return decision.request as PostTradeAuthorizationConsumptionRequest;
}

function validEvidence(
  request: PostTradeAuthorizationConsumptionRequest,
): PostTradeAuthorizationConsumptionEvidence {
  return {
    durableConsumptionRecordId: "durable-consumption-record-001",
    authorizationArtifactId: request.authorizationArtifactId,
    previousState: "unused",
    newState: "consumed",
    consumedAtIso: requestedConsumptionAtIso,
    authorizationFingerprint: request.authorizationFingerprint,
    executionAttemptId: request.executionAttemptId,
    executionPlanId: request.executionPlanId,
    consumptionOperationId: request.consumptionOperationId,
    targetProjectRef: request.targetStagingProjectRef,
    affectedRows: 1,
    persistenceOperation: "compare_and_set_authorization_unused_to_consumed",
    resultClassification: "transitioned_unused_to_consumed",
  };
}

test.describe("post-trade durable one-shot authorization consumption contract", () => {
  test("canonical unused artifact builds a valid non-executing staging consumption request", () => {
    const request = validRequest();
    const decision = validatePostTradeAuthorizationConsumptionRequest(request);

    expect(decision.valid).toBe(true);
    expect(decision.executionAllowed).toBe(false);
    expect(decision.persistencePerformed).toBe(false);
    expect(decision.rowsCreated).toBe(0);
    expect(request.targetStagingProjectRef).toBe(POST_TRADE_FINAL_STAGING_PROJECT_REF);
    expect(request.rejectedProductionProjectRef).toBe(
      POST_TRADE_REJECTED_PRODUCTION_PROJECT_REF,
    );
    expect(request.expectedCurrentState).toBe("unused");
    expect(request.requestedNewState).toBe("consumed");
    expect(request.noRetry).toBe(true);
    expect(request.oneShot).toBe(true);
    expect(request.mockOnly).toBe(true);
  });

  test("artifact identity, fingerprint, attempt, plan, function, gate, and state mismatches are blocked", () => {
    const cases = [
      artifact({ artifactId: "changed" as never }),
      artifact({ artifactVersion: "changed" as never }),
      {
        ...POST_TRADE_CANONICAL_STAGING_EXECUTION_AUTHORIZATION_ARTIFACT,
        artifactFingerprint: "fnv1a32:bad",
      },
      artifact({ executionAttemptId: "changed" as never }),
      artifact({ executionPlanId: "changed" as never }),
      artifact({
        executionFunction: {
          ...POST_TRADE_STAGING_EXECUTION_FUNCTION_IDENTITY,
          exportName: "changed",
        } as never,
      }),
      artifact({
        finalGate: {
          ...POST_TRADE_FINAL_GATE_IDENTITY,
          exportName: "changed",
        } as never,
      }),
      artifact({ authorizationState: "consumed" }),
      artifact({ authorizationState: "invalid" }),
      artifact({ authorizationState: "expired" }),
      artifact({ expiresAtIso: "2026-07-11T12:59:59.000Z" }),
    ];

    for (const candidate of cases) {
      const decision = buildPostTradeAuthorizationConsumptionRequest({
        artifact: candidate,
        consumptionOperationId,
        requestedConsumptionAtIso,
        evaluatedAtIso: requestedConsumptionAtIso,
      });

      expect(decision.valid).toBe(false);
      expect(decision.executionAllowed).toBe(false);
      expect(decision.persistencePerformed).toBe(false);
    }
  });

  test("missing operation id, production target, unsafe flags, wrong counts, table order, audit dependency, unknown fields, and sensitive fields are blocked", () => {
    const request = validRequest();
    const cases: unknown[] = [
      { ...request, consumptionOperationId: "" },
      { ...request, authorizationArtifactId: undefined },
      { ...request, targetStagingProjectRef: POST_TRADE_REJECTED_PRODUCTION_PROJECT_REF },
      { ...request, executionScope: "changed" },
      { ...request, expectedCurrentState: "consumed" },
      { ...request, requestedNewState: "unused" },
      { ...request, requestedConsumptionAtIso: "not-a-date" },
      { ...request, noRetry: false },
      { ...request, oneShot: false },
      { ...request, mockOnly: false },
      { ...request, expectedOperationCount: 3 },
      { ...request, expectedRowCount: 1 },
      {
        ...request,
        orderedTargetTables: [
          "execution_record_audit_events",
          "execution_records",
        ],
      },
      {
        ...request,
        orderedTargetTables: ["execution_records", "execution_records"],
      },
      {
        ...request,
        orderedTargetTables: [
          "execution_records",
          "execution_record_audit_events",
          "positions",
        ],
      },
      { ...request, auditDependency: "missing" },
      { ...request, unknownTopLevel: true },
      { ...request, executionFunction: { ...request.executionFunction, unknown: true } },
      { ...request, credentials: "not_allowed" },
      { ...request, nested: [{ rawBrokerPayload: "not_allowed" }] },
      { ...request, executionFunction: { ...request.executionFunction, modulePath: `https://${POST_TRADE_REJECTED_PRODUCTION_PROJECT_REF}.supabase.co` } },
    ];

    for (const candidate of cases) {
      const decision = validatePostTradeAuthorizationConsumptionRequest(candidate);
      expect(decision.valid).toBe(false);
      expect(decision.executionAllowed).toBe(false);
    }
  });

  test("valid request builds exactly one future compare-and-set persistence operation without persistence", () => {
    const request = validRequest();
    const decision = buildPostTradeAuthorizationConsumptionPersistencePlan(request);

    expect(decision.valid).toBe(true);
    expect(decision.plan?.operation).toBe(
      "compare_and_set_authorization_unused_to_consumed",
    );
    expect(decision.plan?.compareAndSet.requireCurrentState).toBe("unused");
    expect(decision.plan?.compareAndSet.updateToState).toBe("consumed");
    expect(decision.plan?.compareAndSet.requireExecutionScope).toBe(
      request.executionScope,
    );
    expect(decision.plan?.compareAndSet.requireExecutionFunction).toEqual(
      request.executionFunction,
    );
    expect(decision.plan?.compareAndSet.requireFinalGate).toEqual(
      request.finalGate,
    );
    expect(decision.plan?.compareAndSet.requireOneShot).toBe(true);
    expect(decision.plan?.compareAndSet.requireNoRetry).toBe(true);
    expect(decision.plan?.compareAndSet.requireMockOnly).toBe(true);
    expect(decision.plan?.compareAndSet.requireOperationCount).toBe(2);
    expect(decision.plan?.compareAndSet.requireExpectedRowCount).toBe(2);
    expect(decision.plan?.compareAndSet.requireOrderedTargetTables).toEqual([
      "execution_records",
      "execution_record_audit_events",
    ]);
    expect(decision.plan?.compareAndSet.requireAuditDependency).toBe(
      "execution_record_audit_events.execution_record_id_from_execution_records.id",
    );
    expect(decision.plan?.compareAndSet.affectedRowsMustEqual).toBe(1);
    expect(decision.plan?.persistencePerformed).toBe(false);
    expect(decision.plan?.executionAllowed).toBe(false);
  });

  test("hypothetical authoritative one-row transition can classify as success only with complete matching evidence", () => {
    const request = validRequest();
    const evidence = validEvidence(request);
    const decision = classifyPostTradeAuthorizationConsumptionPersistenceResult({
      request,
      result: {
        kind: "transition_result",
        affectedRows: 1,
        evidence,
      },
    });

    expect(decision.status).toBe("valid");
    expect(decision.resultClassification).toBe(
      "authoritatively_consumed_by_this_operation",
    );
    expect(decision.mayContinueToExecution).toBe(true);
    expect(decision.automaticRetryAllowed).toBe(false);
  });

  test("affected-row and evidence anomalies are blocked or ambiguous", () => {
    const request = validRequest();
    const evidence = validEvidence(request);
    const cases = [
      { affectedRows: 0, evidence, reason: "persistence:zero_rows_updated" },
      { affectedRows: 2, evidence, reason: "persistence:multiple_rows_updated" },
      { affectedRows: null, evidence, reason: "persistence:affected_row_count_unknown" },
      {
        affectedRows: 1,
        evidence: { ...evidence, durableConsumptionRecordId: null },
        reason: "persistence:missing_durable_record_id",
      },
      {
        affectedRows: 1,
        evidence: { ...evidence, affectedRows: 2 },
        reason: "evidence:affected_row_count_mismatch",
      },
      {
        affectedRows: 1,
        evidence: { ...evidence, consumedAtIso: null },
        reason: "evidence:consumed_at_required",
      },
      {
        affectedRows: 1,
        evidence: { ...evidence, consumedAtIso: "not-a-date" },
        reason: "evidence:consumed_at_required",
      },
      {
        affectedRows: 1,
        evidence: { ...evidence, authorizationArtifactId: "changed" },
        reason: "evidence:artifact_id_mismatch",
      },
      {
        affectedRows: 1,
        evidence: { ...evidence, authorizationFingerprint: "changed" },
        reason: "evidence:fingerprint_mismatch",
      },
      {
        affectedRows: 1,
        evidence: { ...evidence, executionAttemptId: "changed" },
        reason: "evidence:attempt_id_mismatch",
      },
      {
        affectedRows: 1,
        evidence: { ...evidence, executionPlanId: "changed" },
        reason: "evidence:plan_id_mismatch",
      },
      {
        affectedRows: 1,
        evidence: { ...evidence, consumptionOperationId: "changed" },
        reason: "evidence:operation_id_mismatch",
      },
      {
        affectedRows: 1,
        evidence: { ...evidence, previousState: "consumed" as const },
        reason: "evidence:previous_state_not_unused",
      },
      {
        affectedRows: 1,
        evidence: { ...evidence, newState: "unused" as const },
        reason: "evidence:new_state_not_consumed",
      },
      {
        affectedRows: 1,
        evidence: { ...evidence, persistenceOperation: "changed" as never },
        reason: "evidence:persistence_operation_mismatch",
      },
      {
        affectedRows: 1,
        evidence: { ...evidence, resultClassification: "blocked" as const },
        reason: "evidence:result_classification_mismatch",
      },
    ];

    for (const item of cases) {
      const decision = classifyPostTradeAuthorizationConsumptionPersistenceResult({
        request,
        result: {
          kind: "transition_result",
          affectedRows: item.affectedRows,
          evidence: item.evidence,
        },
      });

      expect(decision.mayContinueToExecution).toBe(false);
      expect(decision.blockingReasons).toContain(item.reason as never);
    }
  });

  test("generic ok, HTTP ok, timeout, connection loss, and malformed response do not allow execution or automatic retry", () => {
    const request = validRequest();
    const cases = [
      "generic_success_without_evidence",
      "http_success_without_evidence",
      "network_timeout_after_submission",
      "connection_lost_after_submission",
      "malformed_response",
    ] as const;

    for (const kind of cases) {
      const decision = classifyPostTradeAuthorizationConsumptionPersistenceResult({
        request,
        result: { kind },
      });

      expect(decision.mayContinueToExecution).toBe(false);
      expect(decision.automaticRetryAllowed).toBe(false);
      if (
        kind === "network_timeout_after_submission" ||
        kind === "connection_lost_after_submission" ||
        kind === "malformed_response"
      ) {
        expect(decision.status).toBe("ambiguous");
      } else {
        expect(decision.status).toBe("blocked");
      }
    }
  });

  test("replay and concurrent outcomes are classified without automatic retry", () => {
    const request = validRequest();
    const identicalReplay = classifyPostTradeAuthorizationConsumptionReplay({
      request,
      durableState: "consumed",
      existingConsumptionOperationId: request.consumptionOperationId,
      existingExecutionAttemptId: request.executionAttemptId,
    });
    const differentOperation = classifyPostTradeAuthorizationConsumptionReplay({
      request,
      durableState: "consumed",
      existingConsumptionOperationId: "different",
      existingExecutionAttemptId: request.executionAttemptId,
    });
    const stillUnused = classifyPostTradeAuthorizationConsumptionReplay({
      request,
      durableState: "unused",
    });
    const ambiguous = classifyPostTradeAuthorizationConsumptionReplay({
      request,
      durableState: "ambiguous",
    });

    expect(identicalReplay.blockingReasons).toContain(
      "replay:already_consumed_by_same_operation",
    );
    expect(identicalReplay.mayContinueToExecution).toBe(false);
    expect(identicalReplay.automaticRetryAllowed).toBe(false);
    expect(differentOperation.blockingReasons).toContain(
      "replay:already_consumed_by_different_operation",
    );
    expect(differentOperation.mayContinueToExecution).toBe(false);
    expect(stillUnused.blockingReasons).toContain("replay:still_unused");
    expect(stillUnused.mayContinueToExecution).toBe(false);
    expect(ambiguous.status).toBe("ambiguous");
    expect(ambiguous.automaticRetryAllowed).toBe(false);
  });

  test("read-back request preserves original identifiers and read-back classifications are fail-closed", () => {
    const request = validRequest();
    const readBackRequest = buildPostTradeAuthorizationConsumptionReadBackRequest(request);
    const evidence = validEvidence(request);

    expect(readBackRequest).toMatchObject({
      authorizationArtifactId: request.authorizationArtifactId,
      authorizationFingerprint: request.authorizationFingerprint,
      executionAttemptId: request.executionAttemptId,
      executionPlanId: request.executionPlanId,
      consumptionOperationId: request.consumptionOperationId,
      targetProjectRef: request.targetStagingProjectRef,
    });

    expect(
      evaluatePostTradeAuthorizationConsumptionReadBackResult({
        request: readBackRequest,
        result: { kind: "consumed", evidence },
      }).classification,
    ).toBe("authoritatively_consumed_by_this_operation");
    expect(
      evaluatePostTradeAuthorizationConsumptionReadBackResult({
        request: readBackRequest,
        result: {
          kind: "consumed",
          evidence: { ...evidence, consumptionOperationId: "different" },
        },
      }).classification,
    ).toBe("consumed_by_another_operation");
    expect(
      evaluatePostTradeAuthorizationConsumptionReadBackResult({
        request: readBackRequest,
        result: {
          kind: "consumed",
          evidence: { ...evidence, consumedAtIso: null },
        },
      }).classification,
    ).toBe("inconsistent");
    expect(
      evaluatePostTradeAuthorizationConsumptionReadBackResult({
        request: readBackRequest,
        result: { kind: "unused" },
      }).classification,
    ).toBe("still_unused");
    expect(
      evaluatePostTradeAuthorizationConsumptionReadBackResult({
        request: readBackRequest,
        result: { kind: "inconsistent", evidence },
      }).classification,
    ).toBe("inconsistent");
    expect(
      evaluatePostTradeAuthorizationConsumptionReadBackResult({
        request: readBackRequest,
        result: { kind: "ambiguous" },
      }).automaticRetryAllowed,
    ).toBe(false);
  });

  test("repeated planning causes no mutable state and source has no Supabase execution or persistence calls", () => {
    const request = validRequest();
    const first = buildPostTradeAuthorizationConsumptionPersistencePlan(request);
    const second = buildPostTradeAuthorizationConsumptionPersistencePlan(request);
    const source = readFileSync(
      join(
        process.cwd(),
        "lib/post-trade-durable-one-shot-authorization-consumption-contract.ts",
      ),
      "utf8",
    );

    expect(first).toEqual(second);
    expect(source).not.toContain("@supabase/supabase-js");
    expect(source).not.toContain("createClient");
    expect(source).not.toContain(".insert(");
    expect(source).not.toContain(".update(");
    expect(source).not.toContain(".upsert(");
    expect(source).not.toContain(".delete(");
    expect(source).not.toContain(".rpc(");
    expect(source).not.toContain(".storage");
    expect(source).not.toContain("buildPostTradeStagingExecutionFunction(");
    expect(source).not.toContain("evaluatePostTradeFinalStagingExecutionGate(");
    expect(source).not.toContain("getPostTradeStagingServiceClient(");
    expect(source).not.toContain("writeFileSync");
    expect(source).not.toContain("appendFileSync");
    expect(source).not.toContain("process.env");
  });
});
