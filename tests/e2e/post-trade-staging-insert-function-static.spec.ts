import { expect, test } from "@playwright/test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const repoRoot = process.cwd();
const insertFunctionPath = "lib/post-trade-staging-insert-function.ts";
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

test.describe("post-trade staging insert function no-execution implementation", () => {
  test("module is server-only, staging-only, one-shot only, and default no-execution", () => {
    const source = readSource(insertFunctionPath);

    expect(source).toContain('import "server-only"');
    expect(source).toContain("POST_TRADE_STAGING_PROJECT_REF");
    expect(source).toContain("POST_TRADE_STAGING_ENVIRONMENT_NAME");
    expect(source).toContain("post_trade_staging_insert_function_v1");
    expect(source).toContain('"ready_no_execution"');
    expect(source).toContain('"no_execution_without_separate_gate"');
    expect(source).toContain('executionStatus: "not_executed"');
    expect(source).toContain("remoteExecution: false");
    expect(source).toContain("oneShotOnly: true");
    expect(source).toContain("stagingOnly: true");
    expect(source).toContain("productionBlocked: true");
  });

  test("module declares exactly two future insert steps and their dependency", () => {
    const source = readSource(insertFunctionPath);

    expect(source.match(/\n        table: "execution_records"/g)).toHaveLength(1);
    expect(
      source.match(/\n        operation: "future_insert_returning_id"/g),
    ).toHaveLength(1);
    expect(
      source.match(/\n        table: "execution_record_audit_events"/g),
    ).toHaveLength(1);
    expect(
      source.match(
        /\n        operation: "future_insert_with_execution_record_id"/g,
      ),
    ).toHaveLength(1);
    expect(source).toContain("dependsOnStep: 1");
    expect(source).toContain("mock_execution_record_insert_result");
    expect(source).toContain("placeholderReference");
  });

  test("module requires one-shot context, prerequisite, audit, and idempotency", () => {
    const source = readSource(insertFunctionPath);

    expect(source).toContain("oneShotApprovalContextReady");
    expect(source).toContain("approvedForExactlyOneStagingMockWrite");
    expect(source).toContain("stagingUrlPresentServerSide");
    expect(source).toContain("stagingServiceRoleKeyPresentServerSide");
    expect(source).toContain("noNextPublicServiceRoleKey");
    expect(source).toContain("blocked_missing_one_shot_context");
    expect(source).toContain("blocked_missing_prerequisite_command");
    expect(source).toContain("blocked_missing_audit_command");
    expect(source).toContain("blocked_missing_idempotency");
    expect(source).toContain("test_scoped_idempotency_alignment_required");
    expect(source).toContain('idempotencyKey.startsWith("post_trade:test:")');
  });

  test("module rejects production targets, unsafe flags, and unsafe payloads", () => {
    const source = readSource(insertFunctionPath);

    expect(source).toContain("blocked_production_target");
    expect(source).toContain("staging_target_required");
    expect(source).toContain("isProductionLike");
    expect(source).toContain("blocked_unsafe_flags");
    expect(source).toContain("blocked_unsafe_payload");
    expect(source).toContain("unsafe_payload_fragment");
    expect(source).toContain("unsafe_validation_safety_flags");
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
  });

  test("module has no Supabase write calls, direct SQL, broad writes, blind retry, or logging", () => {
    const source = readSource(insertFunctionPath);
    const forbiddenFragments = [
      "@supabase/supabase-js",
      "createClient(",
      "getPostTradeStagingServiceClient(",
      "process.env",
      "fetch(",
      ".from(",
      ".insert(",
      ".update(",
      ".upsert(",
      ".delete(",
      ".rpc(",
      ".storage",
      "executeWrite",
      "executeCommands",
      "executeRemote",
      "runWrite",
      "broadWrite",
      "blindRetry",
      "retry",
      "directSql",
      "sql`",
      "dashboard",
      "console.log",
      "console.info",
      "console.warn",
      "console.error",
    ];

    expect(forbiddenFragments.filter((fragment) => source.includes(fragment))).toEqual(
      [],
    );
  });

  test("module is not wired into API route, Trade UI, or client app code", () => {
    const importName = "post-trade-staging-insert-function";

    expect(readSource(routePath)).not.toContain(importName);
    expect(readSource(tradeUiPath)).not.toContain(importName);
    expect(
      collectSourceFiles("app").filter((file) =>
        readSource(file).includes(importName),
      ),
    ).toEqual([]);
  });
});
