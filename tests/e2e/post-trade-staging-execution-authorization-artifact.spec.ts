import { expect, test } from "@playwright/test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import {
  POST_TRADE_CANONICAL_STAGING_EXECUTION_AUTHORIZATION_ARTIFACT,
  POST_TRADE_FINAL_GATE_IDENTITY,
  POST_TRADE_STAGING_EXECUTION_FUNCTION_IDENTITY,
  buildFinalGateApprovalFromStagingExecutionAuthorizationArtifact,
  buildPostTradeStagingExecutionAuthorizationArtifactFingerprint,
  evaluatePostTradeStagingExecutionAuthorizationArtifact,
  type PostTradeStagingExecutionAuthorizationArtifact,
  type PostTradeStagingExecutionAuthorizationArtifactCore,
  type PostTradeStagingExecutionAuthorizationCapabilities,
} from "../../lib/post-trade-staging-execution-authorization-artifact-core";
import {
  POST_TRADE_FINAL_STAGING_PROJECT_REF,
  POST_TRADE_REJECTED_PRODUCTION_PROJECT_REF,
} from "../../lib/post-trade-final-staging-execution-gate-core";

const repoRoot = process.cwd();
const serverArtifactPath =
  "lib/post-trade-staging-execution-authorization-artifact.ts";
const coreArtifactPath =
  "lib/post-trade-staging-execution-authorization-artifact-core.ts";
const routePath = "app/api/post-trade/payload/validate/route.ts";
const tradeUiPath = "app/trade-app.tsx";
const evaluatedAtIso = "2026-07-11T13:00:00.000Z";

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

function tamperedArtifact(
  overrides: Partial<PostTradeStagingExecutionAuthorizationArtifact> = {},
) {
  return {
    ...POST_TRADE_CANONICAL_STAGING_EXECUTION_AUTHORIZATION_ARTIFACT,
    ...overrides,
  };
}

test.describe("post-trade single-use staging execution authorization artifact", () => {
  test("canonical authorization artifact is structurally valid and execution-disabled", () => {
    const evaluation = evaluatePostTradeStagingExecutionAuthorizationArtifact({
      artifact: POST_TRADE_CANONICAL_STAGING_EXECUTION_AUTHORIZATION_ARTIFACT,
      evaluatedAtIso,
    });

    expect(evaluation.valid).toBe(true);
    expect(evaluation.status).toBe("valid");
    expect(evaluation.executionEnabled).toBe(false);
    expect(evaluation.executionStatus).toBe("not_executed");
    expect(evaluation.remoteExecution).toBe(false);
    expect(evaluation.rowsCreated).toBe(0);
    expect(evaluation.authorizationState).toBe("unused");
  });

  test("artifact is scoped only to staging and production cannot be target", () => {
    const validArtifact = POST_TRADE_CANONICAL_STAGING_EXECUTION_AUTHORIZATION_ARTIFACT;
    const productionTarget = evaluatePostTradeStagingExecutionAuthorizationArtifact({
      artifact: artifact({
        targetStagingProjectRef: POST_TRADE_REJECTED_PRODUCTION_PROJECT_REF as never,
      }),
      evaluatedAtIso,
    });

    expect(validArtifact.targetStagingProjectRef).toBe(
      POST_TRADE_FINAL_STAGING_PROJECT_REF,
    );
    expect(productionTarget.valid).toBe(false);
    expect(productionTarget.blockingReasons).toContain(
      "targetStagingProjectRef:production_project_blocked",
    );
  });

  test("production reference outside rejection marker is blocked", () => {
    const evaluation = evaluatePostTradeStagingExecutionAuthorizationArtifact({
      artifact: artifact({
        executionFunction: {
          ...POST_TRADE_STAGING_EXECUTION_FUNCTION_IDENTITY,
          modulePath: POST_TRADE_REJECTED_PRODUCTION_PROJECT_REF,
        } as never,
      }),
      evaluatedAtIso,
    });

    expect(evaluation.valid).toBe(false);
    expect(evaluation.blockingReasons).toContain(
      "productionProjectRef:unexpected_reference",
    );
  });

  test("operation count, row count, table ordering, and audit dependency are exact", () => {
    const operationCount = evaluatePostTradeStagingExecutionAuthorizationArtifact({
      artifact: artifact({
        plan: {
          ...POST_TRADE_CANONICAL_STAGING_EXECUTION_AUTHORIZATION_ARTIFACT.plan,
          operationCount: 3,
        } as never,
      }),
      evaluatedAtIso,
    });
    const rowCount = evaluatePostTradeStagingExecutionAuthorizationArtifact({
      artifact: artifact({
        plan: {
          ...POST_TRADE_CANONICAL_STAGING_EXECUTION_AUTHORIZATION_ARTIFACT.plan,
          expectedRows: 1,
        } as never,
      }),
      evaluatedAtIso,
    });
    const reversedTables = evaluatePostTradeStagingExecutionAuthorizationArtifact({
      artifact: artifact({
        plan: {
          ...POST_TRADE_CANONICAL_STAGING_EXECUTION_AUTHORIZATION_ARTIFACT.plan,
          orderedTargetTables: [
            "execution_record_audit_events",
            "execution_records",
          ],
        } as never,
      }),
      evaluatedAtIso,
    });
    const auditDependency = evaluatePostTradeStagingExecutionAuthorizationArtifact({
      artifact: artifact({
        plan: {
          ...POST_TRADE_CANONICAL_STAGING_EXECUTION_AUTHORIZATION_ARTIFACT.plan,
          auditDependency: "missing_dependency",
        } as never,
      }),
      evaluatedAtIso,
    });

    expect(operationCount.blockingReasons).toContain(
      "plan.operationCount:exactly_two_required",
    );
    expect(rowCount.blockingReasons).toContain(
      "plan.expectedRows:exactly_two_required",
    );
    expect(reversedTables.blockingReasons).toContain(
      "plan.orderedTargetTables:exact_order_required",
    );
    expect(auditDependency.blockingReasons).toContain(
      "plan.auditDependency:execution_record_id_required",
    );
  });

  test("duplicate tables, extra tables, and alternate production references fail closed", () => {
    const duplicateTables = evaluatePostTradeStagingExecutionAuthorizationArtifact({
      artifact: artifact({
        plan: {
          ...POST_TRADE_CANONICAL_STAGING_EXECUTION_AUTHORIZATION_ARTIFACT.plan,
          orderedTargetTables: ["execution_records", "execution_records"],
        } as never,
      }),
      evaluatedAtIso,
    });
    const extraTable = evaluatePostTradeStagingExecutionAuthorizationArtifact({
      artifact: artifact({
        plan: {
          ...POST_TRADE_CANONICAL_STAGING_EXECUTION_AUTHORIZATION_ARTIFACT.plan,
          orderedTargetTables: [
            "execution_records",
            "execution_record_audit_events",
            "positions",
          ],
        } as never,
      }),
      evaluatedAtIso,
    });
    const productionUrl = evaluatePostTradeStagingExecutionAuthorizationArtifact({
      artifact: artifact({
        executionFunction: {
          ...POST_TRADE_STAGING_EXECUTION_FUNCTION_IDENTITY,
          modulePath: `https://${POST_TRADE_REJECTED_PRODUCTION_PROJECT_REF}.supabase.co`,
        } as never,
      }),
      evaluatedAtIso,
    });

    expect(duplicateTables.valid).toBe(false);
    expect(duplicateTables.blockingReasons).toContain(
      "plan.orderedTargetTables:exact_order_required",
    );
    expect(extraTable.valid).toBe(false);
    expect(extraTable.blockingReasons).toContain(
      "plan.orderedTargetTables:exact_order_required",
    );
    expect(productionUrl.valid).toBe(false);
    expect(productionUrl.blockingReasons).toContain(
      "productionProjectRef:unexpected_reference",
    );
  });

  test("one-shot, retry, state, mock-only, and execution-disabled fields are enforced", () => {
    const cases: Array<
      [Partial<PostTradeStagingExecutionAuthorizationArtifactCore>, string]
    > = [
      [{ oneShot: false as never }, "oneShot:true_required"],
      [{ retryAllowed: true as never }, "retryAllowed:false_required"],
      [{ authorizationState: "consumed" }, "authorizationState:unused_required"],
      [{ authorizationState: "invalid" }, "authorizationState:unused_required"],
      [{ authorizationState: "expired" }, "authorizationState:unused_required"],
      [{ mockOnly: false as never }, "mockOnly:true_required"],
      [{ executionEnabled: true as never }, "executionEnabled:false_required"],
      [{ executionStatus: "executed" as never }, "executionStatus:not_executed_required"],
      [{ remoteExecution: true as never }, "remoteExecution:false_required"],
      [{ rowsCreated: 1 as never }, "rowsCreated:zero_required"],
      [{ rowsCreated: Number.NaN as never }, "rowsCreated:zero_required"],
      [{ rowsCreated: Number.POSITIVE_INFINITY as never }, "rowsCreated:zero_required"],
      [{ oneShot: "true" as never }, "oneShot:true_required"],
      [{ retryAllowed: "false" as never }, "retryAllowed:false_required"],
      [{ executionEnabled: "false" as never }, "executionEnabled:false_required"],
      [{ artifactId: null as never }, "artifactId:mismatch"],
    ];

    for (const [overrides, reason] of cases) {
      const evaluation = evaluatePostTradeStagingExecutionAuthorizationArtifact({
        artifact: artifact(overrides),
        evaluatedAtIso,
      });

      expect(evaluation.valid).toBe(false);
      expect(evaluation.blockingReasons).toContain(reason);
    }
  });

  test("artifact fingerprint binds artifact identity, version, attempt, plan, function, gate, implementation, and review", () => {
    const cases: Array<
      [Partial<PostTradeStagingExecutionAuthorizationArtifact>, string]
    > = [
      [{ artifactId: "changed" as never }, "artifactFingerprint:mismatch"],
      [{ artifactVersion: "changed" as never }, "artifactFingerprint:mismatch"],
      [{ authorizationType: "changed" as never }, "artifactFingerprint:mismatch"],
      [{ sourceAction: "changed" as never }, "artifactFingerprint:mismatch"],
      [{ executionScope: "changed" as never }, "artifactFingerprint:mismatch"],
      [
        { targetStagingProjectRef: "changed" as never },
        "artifactFingerprint:mismatch",
      ],
      [{ executionAttemptId: "changed" as never }, "artifactFingerprint:mismatch"],
      [{ executionPlanId: "changed" as never }, "artifactFingerprint:mismatch"],
      [
        {
          executionFunction: {
            ...POST_TRADE_STAGING_EXECUTION_FUNCTION_IDENTITY,
            exportName: "changed",
          } as never,
        },
        "artifactFingerprint:mismatch",
      ],
      [
        {
          executionFunction: {
            ...POST_TRADE_STAGING_EXECUTION_FUNCTION_IDENTITY,
            contractVersion: "changed",
          } as never,
        },
        "artifactFingerprint:mismatch",
      ],
      [
        {
          finalGate: {
            ...POST_TRADE_FINAL_GATE_IDENTITY,
            exportName: "changed",
          } as never,
        },
        "artifactFingerprint:mismatch",
      ],
      [
        {
          executionFunction: {
            ...POST_TRADE_STAGING_EXECUTION_FUNCTION_IDENTITY,
            implementationDecision: "changed",
          } as never,
        },
        "artifactFingerprint:mismatch",
      ],
      [
        {
          executionFunction: {
            ...POST_TRADE_STAGING_EXECUTION_FUNCTION_IDENTITY,
            staticReviewDecision: "changed",
          } as never,
        },
        "artifactFingerprint:mismatch",
      ],
      [
        {
          finalGate: {
            ...POST_TRADE_FINAL_GATE_IDENTITY,
            contractVersion: "changed",
          } as never,
        },
        "artifactFingerprint:mismatch",
      ],
      [
        {
          finalGate: {
            ...POST_TRADE_FINAL_GATE_IDENTITY,
            implementationDecision: "changed",
          } as never,
        },
        "artifactFingerprint:mismatch",
      ],
      [
        {
          finalGate: {
            ...POST_TRADE_FINAL_GATE_IDENTITY,
            staticReviewDecision: "changed",
          } as never,
        },
        "artifactFingerprint:mismatch",
      ],
      [{ artifactFingerprint: "fnv1a32:bad" }, "artifactFingerprint:mismatch"],
      [{ artifactFingerprint: "" }, "artifactFingerprint:mismatch"],
      [{ artifactFingerprint: "sha256:bad" }, "artifactFingerprint:mismatch"],
      [
        {
          artifactFingerprint:
            POST_TRADE_CANONICAL_STAGING_EXECUTION_AUTHORIZATION_ARTIFACT.artifactFingerprint.slice(
              0,
              8,
            ),
        },
        "artifactFingerprint:mismatch",
      ],
    ];

    for (const [overrides, reason] of cases) {
      const evaluation = evaluatePostTradeStagingExecutionAuthorizationArtifact({
        artifact: tamperedArtifact(overrides),
        evaluatedAtIso,
      });

      expect(evaluation.valid).toBe(false);
      expect(evaluation.blockingReasons).toContain(reason);
    }
  });

  test("expired, future-issued beyond tolerance, and malformed timestamps are rejected", () => {
    const expired = evaluatePostTradeStagingExecutionAuthorizationArtifact({
      artifact: artifact({ expiresAtIso: "2026-07-11T12:59:59.000Z" }),
      evaluatedAtIso,
    });
    const futureIssued = evaluatePostTradeStagingExecutionAuthorizationArtifact({
      artifact: artifact({ createdAtIso: "2026-07-11T13:10:01.000Z" }),
      evaluatedAtIso,
    });
    const malformed = evaluatePostTradeStagingExecutionAuthorizationArtifact({
      artifact: artifact({ createdAtIso: "not-a-date" }),
      evaluatedAtIso,
    });

    expect(expired.status).toBe("expired");
    expect(expired.blockingReasons).toContain("artifact:expired");
    expect(futureIssued.blockingReasons).toContain("artifact:expired");
    expect(malformed.blockingReasons).toContain(
      "artifact:valid_timestamps_required",
    );
  });

  test("expiry before issuance and excessive validity windows are rejected", () => {
    const expiryBeforeIssued = evaluatePostTradeStagingExecutionAuthorizationArtifact({
      artifact: artifact({
        createdAtIso: "2026-07-11T12:30:00.000Z",
        expiresAtIso: "2026-07-11T12:29:59.000Z",
      }),
      evaluatedAtIso: "2026-07-11T12:20:00.000Z",
    });
    const excessiveWindow = evaluatePostTradeStagingExecutionAuthorizationArtifact({
      artifact: artifact({
        expiresAtIso: "2026-07-19T12:30:01.000Z",
      }),
      evaluatedAtIso,
    });

    expect(expiryBeforeIssued.valid).toBe(false);
    expect(expiryBeforeIssued.blockingReasons).toContain(
      "artifact:expiry_after_issued_required",
    );
    expect(excessiveWindow.valid).toBe(false);
    expect(excessiveWindow.blockingReasons).toContain(
      "artifact:validity_window_too_long",
    );
  });

  test("missing and unknown fields are rejected at top level and nested levels", () => {
    const missingTopLevel = Object.fromEntries(
      Object.entries(
        POST_TRADE_CANONICAL_STAGING_EXECUTION_AUTHORIZATION_ARTIFACT,
      ).filter(([key]) => key !== "artifactId"),
    );
    const unknownTopLevel = {
      ...POST_TRADE_CANONICAL_STAGING_EXECUTION_AUTHORIZATION_ARTIFACT,
      unknownCapability: true,
    };
    const unknownNested = artifact({
      finalGate: {
        ...POST_TRADE_FINAL_GATE_IDENTITY,
        unknownNested: true,
      } as never,
    });
    const missingNestedFunctionField = Object.fromEntries(
      Object.entries(POST_TRADE_STAGING_EXECUTION_FUNCTION_IDENTITY).filter(
        ([key]) => key !== "exportName",
      ),
    );
    const missingNested = artifact({
      executionFunction: missingNestedFunctionField as never,
    });

    for (const candidate of [
      missingTopLevel,
      unknownTopLevel,
      unknownNested,
      missingNested,
    ]) {
      const evaluation = evaluatePostTradeStagingExecutionAuthorizationArtifact({
        artifact: candidate,
        evaluatedAtIso,
      });

      expect(evaluation.valid).toBe(false);
      expect(evaluation.blockingReasons.some((reason) =>
        reason.includes("unknown_or_missing_fields"),
      )).toBe(true);
    }
  });

  test("browser broker Avanza BUY SELL credential cookie session BankID API UI migration live mutation and settlement capabilities are rejected", () => {
    const capabilityCases: Array<keyof PostTradeStagingExecutionAuthorizationCapabilities> = [
      "browserAutomation",
      "brokerInteraction",
      "avanzaInteraction",
      "buyBehavior",
      "sellBehavior",
      "credentialHandling",
      "cookieHandling",
      "sessionHandling",
      "bankIdHandling",
      "apiRouteInvocation",
      "tradeUiInvocation",
      "clientInvocation",
      "migrationExecution",
      "schemaMutation",
      "tradeMutation",
      "positionMutation",
      "orderMutation",
      "settlementRetrieval",
      "rpcExecution",
      "storageExecution",
      "retry",
      "multipleExecutionAttempts",
      "brokerStateHandling",
      "rawBrokerBrowserPayload",
      "arbitraryJsonBlob",
    ];

    for (const capability of capabilityCases) {
      const evaluation = evaluatePostTradeStagingExecutionAuthorizationArtifact({
        artifact: artifact({
          capabilities: {
            ...POST_TRADE_CANONICAL_STAGING_EXECUTION_AUTHORIZATION_ARTIFACT.capabilities,
            [capability]: true,
          },
        } as never),
        evaluatedAtIso,
      });

      expect(evaluation.valid).toBe(false);
      expect(evaluation.blockingReasons).toContain(
        `capabilities.${capability}:false_required`,
      );
    }
  });

  test("sensitive fields and raw arbitrary JSON blob fields are rejected recursively", () => {
    const candidates = [
      { credentials: "not_allowed" },
      { cookie: "not_allowed" },
      { session: "not_allowed" },
      { BankID: "not_allowed" },
      { arbitraryJson: "not_allowed" },
      { nested: { brokerState: "not_allowed" } },
      { nested: [{ unvalidatedPayload: "not_allowed" }] },
      { nested: [{ rawBrowserState: "not_allowed" }] },
    ];

    for (const candidate of candidates) {
      const evaluation = evaluatePostTradeStagingExecutionAuthorizationArtifact({
        artifact: {
          ...POST_TRADE_CANONICAL_STAGING_EXECUTION_AUTHORIZATION_ARTIFACT,
          ...candidate,
        },
        evaluatedAtIso,
      });

      expect(evaluation.valid).toBe(false);
      expect(evaluation.blockingReasons).toContain(
        "artifact:sensitive_or_raw_payload_field_present",
      );
    }
  });

  test("repeated validation causes no consumption and no rows", () => {
    const first = evaluatePostTradeStagingExecutionAuthorizationArtifact({
      artifact: POST_TRADE_CANONICAL_STAGING_EXECUTION_AUTHORIZATION_ARTIFACT,
      evaluatedAtIso,
    });
    const second = evaluatePostTradeStagingExecutionAuthorizationArtifact({
      artifact: POST_TRADE_CANONICAL_STAGING_EXECUTION_AUTHORIZATION_ARTIFACT,
      evaluatedAtIso,
    });

    expect(first.valid).toBe(true);
    expect(second.valid).toBe(true);
    expect(first.authorizationState).toBe("unused");
    expect(second.authorizationState).toBe("unused");
    expect(first.rowsCreated).toBe(0);
    expect(second.rowsCreated).toBe(0);
    expect(first.safetyFlags.noAuthorizationConsumption).toBe(true);
  });

  test("environment variables and broad booleans cannot enable execution", () => {
    const previous = process.env.POST_TRADE_ENABLE_STAGING_EXECUTION;
    process.env.POST_TRADE_ENABLE_STAGING_EXECUTION = "true";

    try {
      const evaluation = evaluatePostTradeStagingExecutionAuthorizationArtifact({
        artifact: POST_TRADE_CANONICAL_STAGING_EXECUTION_AUTHORIZATION_ARTIFACT,
        evaluatedAtIso,
      });
      const broadBoolean = evaluatePostTradeStagingExecutionAuthorizationArtifact({
        artifact: {
          ...POST_TRADE_CANONICAL_STAGING_EXECUTION_AUTHORIZATION_ARTIFACT,
          approved: true,
        },
        evaluatedAtIso,
      });

      expect(evaluation.valid).toBe(true);
      expect(evaluation.executionEnabled).toBe(false);
      expect(evaluation.remoteExecution).toBe(false);
      expect(broadBoolean.valid).toBe(false);
      expect(broadBoolean.blockingReasons).toContain(
        "artifact:unknown_or_missing_fields",
      );
    } finally {
      if (previous === undefined) {
        delete process.env.POST_TRADE_ENABLE_STAGING_EXECUTION;
      } else {
        process.env.POST_TRADE_ENABLE_STAGING_EXECUTION = previous;
      }
    }
  });

  test("mapping to final gate contract is side-effect free and does not enable execution", () => {
    const compatibility =
      buildFinalGateApprovalFromStagingExecutionAuthorizationArtifact(
        POST_TRADE_CANONICAL_STAGING_EXECUTION_AUTHORIZATION_ARTIFACT,
        evaluatedAtIso,
      );

    expect(compatibility.compatible).toBe(true);
    expect(compatibility.approval?.approvalState).toBe("unused");
    expect(compatibility.approval?.operationCount).toBe(2);
    expect(compatibility.approval?.expectedRows).toBe(2);
    expect(compatibility.approval?.targetProjectRef).toBe(
      POST_TRADE_FINAL_STAGING_PROJECT_REF,
    );
    expect(compatibility.approval?.targetTables).toEqual([
      "execution_records",
      "execution_record_audit_events",
    ]);
    expect(compatibility.approval?.auditDependsOnReturnedExecutionRecordId).toBe(
      true,
    );
    expect(compatibility.approval?.retryAllowed).toBe(false);
    expect(compatibility.approval?.oneShot).toBe(true);
    expect(compatibility.approval?.apiRouteInvocation).toBe(false);
    expect(compatibility.approval?.uiClientInvocation).toBe(false);
    expect(compatibility.approval?.productionAccess).toBe(false);
    expect(compatibility.approval?.mockPayloadOnly).toBe(true);
    expect(compatibility.executionEnabled).toBe(false);
    expect(compatibility.executionStatus).toBe("not_executed");
    expect(compatibility.remoteExecution).toBe(false);
    expect(compatibility.rowsCreated).toBe(0);
  });

  test("repeated final gate mapping causes no consumption and no rows", () => {
    const first = buildFinalGateApprovalFromStagingExecutionAuthorizationArtifact(
      POST_TRADE_CANONICAL_STAGING_EXECUTION_AUTHORIZATION_ARTIFACT,
      evaluatedAtIso,
    );
    const second = buildFinalGateApprovalFromStagingExecutionAuthorizationArtifact(
      POST_TRADE_CANONICAL_STAGING_EXECUTION_AUTHORIZATION_ARTIFACT,
      evaluatedAtIso,
    );

    expect(first.compatible).toBe(true);
    expect(second.compatible).toBe(true);
    expect(first.approval?.approvalState).toBe("unused");
    expect(second.approval?.approvalState).toBe("unused");
    expect(first.rowsCreated).toBe(0);
    expect(second.rowsCreated).toBe(0);
  });

  test("invalid artifact cannot map to final gate approval", () => {
    const compatibility =
      buildFinalGateApprovalFromStagingExecutionAuthorizationArtifact(
        artifact({ authorizationState: "consumed" }),
        evaluatedAtIso,
      );

    expect(compatibility.compatible).toBe(false);
    expect(compatibility.approval).toBeNull();
    expect(compatibility.executionEnabled).toBe(false);
  });

  test("artifact boundary is server-only and validation has no Supabase, execution, adapter, API, or UI wiring", () => {
    const serverSource = readSource(serverArtifactPath);
    const coreSource = readSource(coreArtifactPath);
    const importName = "post-trade-staging-execution-authorization-artifact";

    expect(serverSource).toContain('import "server-only"');
    expect(coreSource).not.toContain(".insert(");
    expect(coreSource).not.toContain(".update(");
    expect(coreSource).not.toContain(".upsert(");
    expect(coreSource).not.toContain(".delete(");
    expect(coreSource).not.toContain(".rpc(");
    expect(coreSource).not.toContain(".storage");
    expect(coreSource).not.toContain("getPostTradeStagingServiceClient(");
    expect(coreSource).not.toContain("buildPostTradeStagingExecutionFunction(");
    expect(coreSource).not.toContain("evaluatePostTradeFinalStagingExecutionGate(");
    expect(coreSource).not.toContain("process.env");
    expect(coreSource).not.toContain("localStorage");
    expect(coreSource).not.toContain("writeFileSync");
    expect(coreSource).not.toContain("appendFileSync");
    expect(coreSource).not.toContain("write-capable");
    expect(readSource(routePath)).not.toContain(importName);
    expect(readSource(tradeUiPath)).not.toContain(importName);
    expect(
      collectSourceFiles("app").filter((file) =>
        readSource(file).includes(importName),
      ),
    ).toEqual([]);
  });
});
