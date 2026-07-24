import { expect, test } from "@playwright/test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const repoRoot = process.cwd();
const adapterPath = "lib/post-trade-remote-execution-adapter.ts";
const routePath = "app/api/post-trade/payload/validate/route.ts";
const tradeUiPath = "app/trade-app.tsx";
const wiringDraftPath = "lib/post-trade-write-service-client-wiring-draft.ts";
const writeServiceDraftPath = "lib/post-trade-write-service-draft.ts";

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

test.describe("post-trade remote execution adapter no-remote-write static checks", () => {
  test("adapter is server-only, staging-only, and no-remote-write", () => {
    const source = readSource(adapterPath);

    expect(source).toContain('import "server-only"');
    expect(source).toContain("POST_TRADE_STAGING_ENVIRONMENT_NAME");
    expect(source).toContain("POST_TRADE_STAGING_PROJECT_REF");
    expect(source).toContain("post_trade_remote_execution_adapter_v1");
    expect(source).toContain('"blocked_no_remote_write"');
    expect(source).toContain('"dry_run_only"');
    expect(source).toContain("remoteExecution: false");
    expect(source).toContain("noRemoteWrite: true");
    expect(source).toContain("noSupabaseWriteMethodCall: true");
    expect(source).toContain(
      '"post_trade_staging_mock_write_execution_gate"',
    );
  });

  test("adapter requires validation, dry-run plan, write commands, audit command, and idempotency", () => {
    const source = readSource(adapterPath);

    expect(source).toContain("validationResult");
    expect(source).toContain("dryRunPlan");
    expect(source).toContain("writeCommandResult");
    expect(source).toContain("auditCommand");
    expect(source).toContain("idempotencyKey");
    expect(source).toContain("validationSafetyFlagsAreReady");
    expect(source).toContain("ready_no_remote_write");
    expect(source).toContain("ready_dry_run_plan_required");
    expect(source).toContain("safe_write_commands_required");
    expect(source).toContain("safe_audit_command_required");
    expect(source).toContain("idempotency_alignment_required");
  });

  test("valid command path can only produce blocked/no-remote-write metadata", () => {
    const source = readSource(adapterPath);

    expect(source).toContain("commands");
    expect(source).toContain("acceptedCount");
    expect(source).toContain("accepted_no_remote_write");
    expect(source).toContain(
      "execution:blocked_until_future_staging_mock_write_execution_gate",
    );
    expect(source).not.toContain("remoteExecution: true");
    expect(source).not.toContain('executionStatus: "executed"');
  });

  test("write-capable implementation path remains staging-only and execution-blocked", () => {
    const source = readSource(adapterPath);

    expect(source).toContain(
      "buildPostTradeWriteCapableStagingAdapterImplementationResult",
    );
    expect(source).toContain("post_trade_write_capable_staging_adapter_v1");
    expect(source).toContain('"implementation_ready_execution_blocked"');
    expect(source).toContain('"blocked_precondition_failed"');
    expect(source).toContain('implementationStatus: "implementation_ready"');
    expect(source).toContain('executionStatus: "execution_blocked"');
    expect(source).toContain('"no_execution_without_separate_gate"');
    expect(source).toContain(
      '"post_trade_staging_mock_write_execution_final_gate"',
    );
    expect(source).toContain("noExecutionInThisAction: true");
    expect(source).toContain("noBroadWrites: true");
    expect(source).toContain("sanitizedCommandsOnly: preconditionsReady");
    expect(source).toContain("remoteExecution: false");
  });

  test("one-shot unblock mechanism declares eligible and blocked states without execution", () => {
    const source = readSource(adapterPath);

    expect(source).toContain("PostTradeOneShotExecutionUnblockStatus");
    expect(source).toContain('"eligible_no_write"');
    expect(source).toContain('"blocked_missing_one_shot_context"');
    expect(source).toContain('"blocked_missing_prerequisite_command"');
    expect(source).toContain('"blocked_missing_audit_command"');
    expect(source).toContain('"blocked_missing_idempotency"');
    expect(source).toContain('"blocked_unsafe_flags"');
    expect(source).toContain('"blocked_unsafe_payload"');
    expect(source).toContain("oneShotGatePresent");
    expect(source).toContain("oneShotGateEligible");
    expect(source).toContain("executionStillRequiresNextAction: true");
    expect(source).toContain('executionStatus: "not_executed"');
    expect(source).toContain("remoteExecution: false");
  });

  test("one-shot unblock mechanism requires exact staging approval context and prerequisite dependency", () => {
    const source = readSource(adapterPath);

    expect(source).toContain("oneShotApprovalContextIsReady");
    expect(source).toContain("approvedForExactlyOneStagingMockWrite");
    expect(source).toContain("targetProjectRef === POST_TRADE_STAGING_PROJECT_REF");
    expect(source).toContain("stagingUrlPresentServerSide");
    expect(source).toContain("stagingServiceRoleKeyPresentServerSide");
    expect(source).toContain("noNextPublicServiceRoleKey");
    expect(source).toContain("apiUiRuntimeBlocked");
    expect(source).toContain("productionBlocked");
    expect(source).toContain("prerequisiteCommandIsReady");
    expect(source).toContain("mock_execution_record_prerequisite");
    expect(source).toContain("mock_execution_record_insert_result");
    expect(source).toContain("execution_record_id_reference");
  });

  test("adapter rejects production target, missing audit, missing idempotency, unsafe flags, and unsafe payloads", () => {
    const source = readSource(adapterPath);

    expect(source).toContain("blocked_production_target");
    expect(source).toContain("blocked_missing_audit_command");
    expect(source).toContain("blocked_missing_idempotency");
    expect(source).toContain("blocked_idempotency_mismatch");
    expect(source).toContain("blocked_unsafe_flags");
    expect(source).toContain("blocked_unsafe_payload");
    expect(source).toContain("staging_target_required");
    expect(source).toContain("idempotency_key_required");
    expect(source).toContain("unsafe_payload_fragment");
    expect(source).toContain("test_scoped_idempotency_alignment_required");
    expect(source).toContain('idempotencyKey.startsWith("post_trade:test:")');
  });

  test("adapter contains raw and sensitive key rejection coverage", () => {
    const source = readSource(adapterPath);

    for (const fragment of [
      "rawBrokerPayload",
      "rawAvanzaState",
      "rawBrowserState",
      "credentials",
      "cookie",
      "sessionToken",
      "bankIdData",
      "unredactedBrokerConfirmation",
      "brokerDocument",
      "arbitraryJson",
      "payloadBlob",
    ]) {
      expect(source).toContain(fragment);
    }
    expect(source).toContain("containsForbiddenKey");
    expect(source).toContain("blocked_unsafe_payload");
  });

  test("adapter has no Supabase client, write-call, remote execution, or logging fragments", () => {
    const source = readSource(adapterPath);
    const forbiddenFragments = [
      "@supabase/supabase-js",
      "createClient(",
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
      "console.log",
      "console.info",
      "console.warn",
      "console.error",
    ];

    expect(forbiddenFragments.filter((fragment) => source.includes(fragment))).toEqual(
      [],
    );
  });

  test("adapter has no client-exposed service role, broad execution helper, blind retry, or direct SQL fragments", () => {
    const source = readSource(adapterPath);
    const forbiddenFragments = [
      "NEXT_PUBLIC",
      "SERVICE_ROLE",
      "service_role",
      "executeWrite",
      "executeCommands",
      "executeRemote",
      "runWrite",
      "blindRetry",
      "retry",
      "directSql",
      "sql`",
      "dashboard",
    ];

    expect(forbiddenFragments.filter((fragment) => source.includes(fragment))).toEqual(
      [],
    );
  });

  test("adapter is not wired into API route, Trade UI, or existing draft modules", () => {
    const importName = "post-trade-remote-execution-adapter";

    expect(readSource(routePath)).not.toContain(importName);
    expect(readSource(tradeUiPath)).not.toContain(importName);
    expect(readSource(wiringDraftPath)).not.toContain(importName);
    expect(readSource(writeServiceDraftPath)).not.toContain(importName);
    expect(
      collectSourceFiles("app").filter((file) =>
        readSource(file).includes(importName),
      ),
    ).toEqual([]);
  });

  test("one-shot unblock source has no API/UI wiring or remote write activation", () => {
    const source = readSource(adapterPath);

    expect(source).toContain("buildPostTradeOneShotExecutionUnblockResult");
    expect(source).toContain('status: "eligible_no_write"');
    expect(source).toContain("readyForNextAction: true");
    expect(source).toContain("oneShotGateEligible");
    expect(source).toContain("executionStillRequiresNextAction");
    expect(source).toContain("executionStillRequiresNextAction: true");
    expect(source).toContain('executionStatus: "not_executed"');
    expect(source).toContain("remoteExecution: false");
    expect(source).toContain("noSupabaseWriteMethodCall: true");
    expect(source).not.toContain('executionStatus: "executed"');
    expect(source).not.toContain("oneShotGateEligible: true,\n    executionStillRequiresNextAction: false");
  });
});
