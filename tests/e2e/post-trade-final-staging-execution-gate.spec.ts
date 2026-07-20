import { expect, test } from "@playwright/test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import {
  POST_TRADE_FINAL_EXECUTION_SCOPE,
  POST_TRADE_FINAL_STAGING_PROJECT_REF,
  POST_TRADE_REJECTED_PRODUCTION_PROJECT_REF,
  POST_TRADE_REVIEWED_EXECUTION_FUNCTION,
  buildPostTradeFinalStagingExecutionGateApprovalFingerprint,
  evaluatePostTradeFinalStagingExecutionGate,
  type PostTradeFinalStagingExecutionGateApproval,
  type PostTradeFinalStagingExecutionGateApprovalCore,
} from "../../lib/post-trade-final-staging-execution-gate-core";

const repoRoot = process.cwd();
const serverGatePath = "lib/post-trade-final-staging-execution-gate.ts";
const coreGatePath = "lib/post-trade-final-staging-execution-gate-core.ts";
const routePath = "app/api/post-trade/payload/validate/route.ts";
const tradeUiPath = "app/trade-app.tsx";
const evaluatedAtIso = "2026-07-11T12:00:00.000Z";

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

function approvalCore(
  overrides: Partial<PostTradeFinalStagingExecutionGateApprovalCore> = {},
): PostTradeFinalStagingExecutionGateApprovalCore {
  return {
    approvalId: "post_trade_final_staging_mock_write_approval_001",
    approvalState: "unused",
    issuedAtIso: "2026-07-11T11:45:00.000Z",
    expiresAtIso: "2026-07-11T12:15:00.000Z",
    reviewedFunction: POST_TRADE_REVIEWED_EXECUTION_FUNCTION,
    executionScope: POST_TRADE_FINAL_EXECUTION_SCOPE,
    targetProjectRef: POST_TRADE_FINAL_STAGING_PROJECT_REF,
    rejectedProductionProjectRef: POST_TRADE_REJECTED_PRODUCTION_PROJECT_REF,
    executionMode: "no_execution_without_final_gate",
    operationCount: 2,
    expectedRows: 2,
    targetTables: ["execution_records", "execution_record_audit_events"],
    auditDependsOnReturnedExecutionRecordId: true,
    retryAllowed: false,
    oneShot: true,
    serverOnly: true,
    stagingOnly: true,
    apiRouteInvocation: false,
    uiClientInvocation: false,
    brokerAction: false,
    avanzaInteraction: false,
    browserAutomation: false,
    credentialSessionCookieBankIdMaterial: false,
    productionAccess: false,
    migrationOrSchemaMutation: false,
    tradeOrPositionMutation: false,
    mockPayloadOnly: true,
    rawBrokerBrowserPayload: false,
    arbitraryJsonBlob: false,
    ...overrides,
  };
}

function approval(
  overrides: Partial<PostTradeFinalStagingExecutionGateApprovalCore> = {},
): PostTradeFinalStagingExecutionGateApproval {
  const core = approvalCore(overrides);

  return {
    ...core,
    approvalFingerprint:
      buildPostTradeFinalStagingExecutionGateApprovalFingerprint(core),
  };
}

function tamperedApproval(
  overrides: Partial<PostTradeFinalStagingExecutionGateApproval> = {},
) {
  return {
    ...approval(),
    ...overrides,
  };
}

test.describe("post-trade final staging execution gate", () => {
  test("default gate is blocked and creates no rows", () => {
    const decision = evaluatePostTradeFinalStagingExecutionGate();

    expect(decision.approved).toBe(false);
    expect(decision.executionEnabled).toBe(false);
    expect(decision.executionStatus).toBe("not_executed");
    expect(decision.executionMode).toBe("no_execution_without_final_gate");
    expect(decision.remoteExecution).toBe(false);
    expect(decision.rowsCreated).toBe(0);
    expect(decision.blockingReasons).toContain("approval:required");
  });

  test("complete exact approval can produce an approved decision without execution", () => {
    const decision = evaluatePostTradeFinalStagingExecutionGate({
      approval: approval(),
      evaluatedAtIso,
    });

    expect(decision.approved).toBe(true);
    expect(decision.blockingReasons).toEqual([]);
    expect(decision.executionEnabled).toBe(false);
    expect(decision.remoteExecution).toBe(false);
    expect(decision.rowsCreated).toBe(0);
    expect(decision.expectedOperationCount).toBe(2);
    expect(decision.expectedRowCount).toBe(2);
    expect(decision.expectedTargetTables).toEqual([
      "execution_records",
      "execution_record_audit_events",
    ]);
  });

  test("environment variables alone and broad execution booleans cannot approve", () => {
    const previous = process.env.ENABLE_EXECUTION;
    process.env.ENABLE_EXECUTION = "true";

    try {
      const envOnlyDecision = evaluatePostTradeFinalStagingExecutionGate({
        evaluatedAtIso,
      });
      const broadBooleanDecision = evaluatePostTradeFinalStagingExecutionGate({
        approval: {
          ...approval(),
          ENABLE_EXECUTION: true,
        },
        evaluatedAtIso,
      });

      expect(envOnlyDecision.approved).toBe(false);
      expect(envOnlyDecision.blockingReasons).toContain("approval:required");
      expect(broadBooleanDecision.approved).toBe(false);
      expect(broadBooleanDecision.blockingReasons).toContain(
        "approval:unknown_or_missing_fields",
      );
    } finally {
      if (previous === undefined) {
        delete process.env.ENABLE_EXECUTION;
      } else {
        process.env.ENABLE_EXECUTION = previous;
      }
    }
  });

  test("staging project mismatch is blocked", () => {
    const decision = evaluatePostTradeFinalStagingExecutionGate({
      approval: approval({ targetProjectRef: "wrong" as never }),
      evaluatedAtIso,
    });

    expect(decision.approved).toBe(false);
    expect(decision.blockingReasons).toContain(
      "targetProjectRef:staging_project_required",
    );
  });

  test("production project id is blocked", () => {
    const decision = evaluatePostTradeFinalStagingExecutionGate({
      approval: approval({
        targetProjectRef: POST_TRADE_REJECTED_PRODUCTION_PROJECT_REF as never,
      }),
      evaluatedAtIso,
    });

    expect(decision.approved).toBe(false);
    expect(decision.blockingReasons).toContain("productionProjectRef:rejected");
  });

  test("missing approval identifier is blocked", () => {
    const decision = evaluatePostTradeFinalStagingExecutionGate({
      approval: tamperedApproval({ approvalId: "" }),
      evaluatedAtIso,
    });

    expect(decision.approved).toBe(false);
    expect(decision.blockingReasons).toContain("approvalId:required");
  });

  test("fingerprint mismatch is blocked", () => {
    const decision = evaluatePostTradeFinalStagingExecutionGate({
      approval: tamperedApproval({ approvalFingerprint: "bad_fingerprint" }),
      evaluatedAtIso,
    });

    expect(decision.approved).toBe(false);
    expect(decision.blockingReasons).toContain("approvalFingerprint:mismatch");
  });

  test("partial fingerprint match is rejected", () => {
    const validApproval = approval();
    const decision = evaluatePostTradeFinalStagingExecutionGate({
      approval: tamperedApproval({
        approvalFingerprint: validApproval.approvalFingerprint.slice(0, 12),
      }),
      evaluatedAtIso,
    });

    expect(decision.approved).toBe(false);
    expect(decision.blockingReasons).toContain("approvalFingerprint:mismatch");
  });

  test("altered approval id invalidates approval", () => {
    const decision = evaluatePostTradeFinalStagingExecutionGate({
      approval: tamperedApproval({
        approvalId: "post_trade_final_staging_mock_write_approval_002",
      }),
      evaluatedAtIso,
    });

    expect(decision.approved).toBe(false);
    expect(decision.blockingReasons).toContain("approvalFingerprint:mismatch");
  });

  test("altered execution scope invalidates approval", () => {
    const decision = evaluatePostTradeFinalStagingExecutionGate({
      approval: approval({ executionScope: "different_scope" as never }),
      evaluatedAtIso,
    });

    expect(decision.approved).toBe(false);
    expect(decision.blockingReasons).toContain(
      "executionScope:single_mock_staging_attempt_required",
    );
  });

  test("reviewed function version mismatch is blocked", () => {
    const decision = evaluatePostTradeFinalStagingExecutionGate({
      approval: approval({
        reviewedFunction: {
          ...POST_TRADE_REVIEWED_EXECUTION_FUNCTION,
          contractVersion: "changed",
        } as never,
      }),
      evaluatedAtIso,
    });

    expect(decision.approved).toBe(false);
    expect(decision.blockingReasons).toContain("reviewedFunction:version_mismatch");
  });

  test("reviewed function unknown nested field and missing nested field are blocked", () => {
    const unknownNestedDecision = evaluatePostTradeFinalStagingExecutionGate({
      approval: approval({
        reviewedFunction: {
          ...POST_TRADE_REVIEWED_EXECUTION_FUNCTION,
          unexpectedNestedCapability: true,
        } as never,
      }),
      evaluatedAtIso,
    });
    const missingContractVersion = { ...POST_TRADE_REVIEWED_EXECUTION_FUNCTION };
    delete (missingContractVersion as Partial<typeof missingContractVersion>)
      .contractVersion;
    const missingNestedDecision = evaluatePostTradeFinalStagingExecutionGate({
      approval: approval({
        reviewedFunction: missingContractVersion as never,
      }),
      evaluatedAtIso,
    });

    expect(unknownNestedDecision.approved).toBe(false);
    expect(unknownNestedDecision.blockingReasons).toContain(
      "reviewedFunction:unknown_or_missing_fields",
    );
    expect(missingNestedDecision.approved).toBe(false);
    expect(missingNestedDecision.blockingReasons).toContain(
      "reviewedFunction:unknown_or_missing_fields",
    );
  });

  test("altered function name, implementation identity, and review identity are blocked", () => {
    const functionNameDecision = evaluatePostTradeFinalStagingExecutionGate({
      approval: approval({
        reviewedFunction: {
          ...POST_TRADE_REVIEWED_EXECUTION_FUNCTION,
          exportName: "changedFunction",
        } as never,
      }),
      evaluatedAtIso,
    });
    const implementationDecision = evaluatePostTradeFinalStagingExecutionGate({
      approval: approval({
        reviewedFunction: {
          ...POST_TRADE_REVIEWED_EXECUTION_FUNCTION,
          implementationDecision: "changed_implementation",
        } as never,
      }),
      evaluatedAtIso,
    });
    const reviewDecision = evaluatePostTradeFinalStagingExecutionGate({
      approval: approval({
        reviewedFunction: {
          ...POST_TRADE_REVIEWED_EXECUTION_FUNCTION,
          staticReviewDecision: "changed_review",
        } as never,
      }),
      evaluatedAtIso,
    });

    expect(functionNameDecision.approved).toBe(false);
    expect(functionNameDecision.blockingReasons).toContain(
      "reviewedFunction:version_mismatch",
    );
    expect(implementationDecision.approved).toBe(false);
    expect(implementationDecision.blockingReasons).toContain(
      "reviewedFunction:version_mismatch",
    );
    expect(reviewDecision.approved).toBe(false);
    expect(reviewDecision.blockingReasons).toContain(
      "reviewedFunction:version_mismatch",
    );
  });

  test("production id in reviewed function identity is blocked", () => {
    const decision = evaluatePostTradeFinalStagingExecutionGate({
      approval: approval({
        reviewedFunction: {
          ...POST_TRADE_REVIEWED_EXECUTION_FUNCTION,
          modulePath: POST_TRADE_REJECTED_PRODUCTION_PROJECT_REF,
        } as never,
      }),
      evaluatedAtIso,
    });

    expect(decision.approved).toBe(false);
    expect(decision.blockingReasons).toContain(
      "productionProjectRef:unexpected_reference",
    );
  });

  test("stale or expired approval is blocked", () => {
    const decision = evaluatePostTradeFinalStagingExecutionGate({
      approval: approval({ expiresAtIso: "2026-07-11T11:59:59.000Z" }),
      evaluatedAtIso,
    });

    expect(decision.approved).toBe(false);
    expect(decision.blockingReasons).toContain("approval:stale_or_expired");
  });

  test("approval issued in the future is stale and blocked", () => {
    const decision = evaluatePostTradeFinalStagingExecutionGate({
      approval: approval({ issuedAtIso: "2026-07-11T12:05:00.000Z" }),
      evaluatedAtIso,
    });

    expect(decision.approved).toBe(false);
    expect(decision.blockingReasons).toContain("approval:stale_or_expired");
  });

  test("operation count other than two is blocked", () => {
    const decision = evaluatePostTradeFinalStagingExecutionGate({
      approval: approval({ operationCount: 3 as never }),
      evaluatedAtIso,
    });

    expect(decision.approved).toBe(false);
    expect(decision.blockingReasons).toContain("operationCount:exactly_two_required");
  });

  test("expected rows other than two is blocked", () => {
    const decision = evaluatePostTradeFinalStagingExecutionGate({
      approval: approval({ expectedRows: 1 as never }),
      evaluatedAtIso,
    });

    expect(decision.approved).toBe(false);
    expect(decision.blockingReasons).toContain("expectedRows:exactly_two_required");
  });

  test("reversed table order is blocked", () => {
    const decision = evaluatePostTradeFinalStagingExecutionGate({
      approval: approval({
        targetTables: [
          "execution_record_audit_events",
          "execution_records",
        ] as never,
      }),
      evaluatedAtIso,
    });

    expect(decision.approved).toBe(false);
    expect(decision.blockingReasons).toContain("targetTables:exact_order_required");
  });

  test("missing audit dependency is blocked", () => {
    const decision = evaluatePostTradeFinalStagingExecutionGate({
      approval: approval({ auditDependsOnReturnedExecutionRecordId: false as never }),
      evaluatedAtIso,
    });

    expect(decision.approved).toBe(false);
    expect(decision.blockingReasons).toContain(
      "auditDependency:execution_record_id_required",
    );
  });

  test("retry-enabled configuration is blocked", () => {
    const decision = evaluatePostTradeFinalStagingExecutionGate({
      approval: approval({ retryAllowed: true as never }),
      evaluatedAtIso,
    });

    expect(decision.approved).toBe(false);
    expect(decision.blockingReasons).toContain("retryAllowed:false_required");
  });

  test("non-one-shot approval is blocked", () => {
    const decision = evaluatePostTradeFinalStagingExecutionGate({
      approval: approval({ oneShot: false as never }),
      evaluatedAtIso,
    });

    expect(decision.approved).toBe(false);
    expect(decision.blockingReasons).toContain("oneShot:true_required");
  });

  test("consumed approval is blocked", () => {
    const decision = evaluatePostTradeFinalStagingExecutionGate({
      approval: approval({ approvalState: "consumed" }),
      evaluatedAtIso,
    });

    expect(decision.approved).toBe(false);
    expect(decision.oneShotStatus).toBe("consumed");
    expect(decision.blockingReasons).toContain("approvalState:unused_required");
  });

  test("invalid and expired approval states are blocked", () => {
    const invalidDecision = evaluatePostTradeFinalStagingExecutionGate({
      approval: approval({ approvalState: "invalid" }),
      evaluatedAtIso,
    });
    const expiredDecision = evaluatePostTradeFinalStagingExecutionGate({
      approval: approval({ approvalState: "expired" }),
      evaluatedAtIso,
    });

    expect(invalidDecision.approved).toBe(false);
    expect(invalidDecision.oneShotStatus).toBe("invalid");
    expect(invalidDecision.blockingReasons).toContain(
      "approvalState:unused_required",
    );
    expect(expiredDecision.approved).toBe(false);
    expect(expiredDecision.oneShotStatus).toBe("expired");
    expect(expiredDecision.blockingReasons).toContain(
      "approvalState:unused_required",
    );
  });

  test("unknown fields are blocked", () => {
    const decision = evaluatePostTradeFinalStagingExecutionGate({
      approval: {
        ...approval(),
        unexpectedExecutionCapability: true,
      },
      evaluatedAtIso,
    });

    expect(decision.approved).toBe(false);
    expect(decision.blockingReasons).toContain("approval:unknown_or_missing_fields");
  });

  test("sensitive browser session credential fields are blocked", () => {
    const decision = evaluatePostTradeFinalStagingExecutionGate({
      approval: {
        ...approval(),
        sessionToken: "redacted-but-still-not-allowed",
      },
      evaluatedAtIso,
    });

    expect(decision.approved).toBe(false);
    expect(decision.blockingReasons).toContain(
      "approval:sensitive_or_raw_payload_field_present",
    );
  });

  test("credential cookie session and BankID fields are individually blocked", () => {
    for (const sensitiveField of ["credentials", "cookie", "session", "BankID"]) {
      const decision = evaluatePostTradeFinalStagingExecutionGate({
        approval: {
          ...approval(),
          [sensitiveField]: "not_allowed",
        },
        evaluatedAtIso,
      });

      expect(decision.approved).toBe(false);
      expect(decision.blockingReasons).toContain(
        "approval:sensitive_or_raw_payload_field_present",
      );
    }
  });

  test("raw arbitrary JSON or unvalidated blob fields are blocked", () => {
    const decision = evaluatePostTradeFinalStagingExecutionGate({
      approval: {
        ...approval(),
        arbitraryJson: { unsafe: true },
      },
      evaluatedAtIso,
    });

    expect(decision.approved).toBe(false);
    expect(decision.blockingReasons).toContain(
      "approval:sensitive_or_raw_payload_field_present",
    );
  });

  test("API or UI invocation scope is blocked", () => {
    const apiDecision = evaluatePostTradeFinalStagingExecutionGate({
      approval: approval({ apiRouteInvocation: true as never }),
      evaluatedAtIso,
    });
    const uiDecision = evaluatePostTradeFinalStagingExecutionGate({
      approval: approval({ uiClientInvocation: true as never }),
      evaluatedAtIso,
    });

    expect(apiDecision.approved).toBe(false);
    expect(apiDecision.blockingReasons).toContain(
      "apiRouteInvocation:false_required",
    );
    expect(uiDecision.approved).toBe(false);
    expect(uiDecision.blockingReasons).toContain(
      "uiClientInvocation:false_required",
    );
  });

  test("broker or Avanza behavior is blocked", () => {
    const brokerDecision = evaluatePostTradeFinalStagingExecutionGate({
      approval: approval({ brokerAction: true as never }),
      evaluatedAtIso,
    });
    const avanzaDecision = evaluatePostTradeFinalStagingExecutionGate({
      approval: approval({ avanzaInteraction: true as never }),
      evaluatedAtIso,
    });

    expect(brokerDecision.approved).toBe(false);
    expect(brokerDecision.blockingReasons).toContain("brokerAction:false_required");
    expect(avanzaDecision.approved).toBe(false);
    expect(avanzaDecision.blockingReasons).toContain(
      "avanzaInteraction:false_required",
    );
  });

  test("browser migration schema and live mutation capabilities are blocked", () => {
    const browserDecision = evaluatePostTradeFinalStagingExecutionGate({
      approval: approval({ browserAutomation: true as never }),
      evaluatedAtIso,
    });
    const migrationDecision = evaluatePostTradeFinalStagingExecutionGate({
      approval: approval({ migrationOrSchemaMutation: true as never }),
      evaluatedAtIso,
    });
    const mutationDecision = evaluatePostTradeFinalStagingExecutionGate({
      approval: approval({ tradeOrPositionMutation: true as never }),
      evaluatedAtIso,
    });

    expect(browserDecision.approved).toBe(false);
    expect(browserDecision.blockingReasons).toContain(
      "browserAutomation:false_required",
    );
    expect(migrationDecision.approved).toBe(false);
    expect(migrationDecision.blockingReasons).toContain(
      "migrationOrSchemaMutation:false_required",
    );
    expect(mutationDecision.approved).toBe(false);
    expect(mutationDecision.blockingReasons).toContain(
      "tradeOrPositionMutation:false_required",
    );
  });

  test("valid gate evaluation performs no write and creates no rows", () => {
    const decision = evaluatePostTradeFinalStagingExecutionGate({
      approval: approval(),
      evaluatedAtIso,
    });

    expect(decision.approved).toBe(true);
    expect(decision.executionEnabled).toBe(false);
    expect(decision.executionStatus).toBe("not_executed");
    expect(decision.remoteExecution).toBe(false);
    expect(decision.rowsCreated).toBe(0);
    expect(decision.safetyFlags.noDatabaseWrite).toBe(true);
    expect(decision.safetyFlags.noSupabaseWriteCall).toBe(true);
  });

  test("valid gate evaluation does not consume approval and repeated evaluation creates no execution", () => {
    const exactApproval = approval();
    const firstDecision = evaluatePostTradeFinalStagingExecutionGate({
      approval: exactApproval,
      evaluatedAtIso,
    });
    const secondDecision = evaluatePostTradeFinalStagingExecutionGate({
      approval: exactApproval,
      evaluatedAtIso,
    });

    expect(firstDecision.approved).toBe(true);
    expect(secondDecision.approved).toBe(true);
    expect(firstDecision.oneShotStatus).toBe("unused");
    expect(secondDecision.oneShotStatus).toBe("unused");
    expect(firstDecision.executionStatus).toBe("not_executed");
    expect(secondDecision.executionStatus).toBe("not_executed");
    expect(firstDecision.rowsCreated).toBe(0);
    expect(secondDecision.rowsCreated).toBe(0);
    expect(firstDecision.safetyFlags.noMutableProcessLocalConsumptionState).toBe(
      true,
    );
  });

  test("server-only boundary exists and is not wired into API route or Trade UI", () => {
    const serverSource = readSource(serverGatePath);
    const coreSource = readSource(coreGatePath);
    const importName = "post-trade-final-staging-execution-gate";

    expect(serverSource).toContain('import "server-only"');
    expect(coreSource).toContain("sideEffectFree: true");
    expect(coreSource).not.toContain("buildPostTradeStagingExecutionFunction(");
    expect(coreSource).not.toContain(".insert(");
    expect(coreSource).not.toContain(".update(");
    expect(coreSource).not.toContain(".upsert(");
    expect(coreSource).not.toContain(".delete(");
    expect(coreSource).not.toContain(".rpc(");
    expect(coreSource).not.toContain(".storage");
    expect(coreSource).not.toContain("getPostTradeStagingServiceClient(");
    expect(readSource(routePath)).not.toContain(importName);
    expect(readSource(tradeUiPath)).not.toContain(importName);
    expect(
      collectSourceFiles("app").filter((file) =>
        readSource(file).includes(importName),
      ),
    ).toEqual([]);
  });
});
