import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const wiringDraftPath = "lib/post-trade-write-service-client-wiring-draft.ts";
const writeServiceDraftPath = "lib/post-trade-write-service-draft.ts";
const factoryPath = "lib/post-trade-service-client-factory.ts";
const routePath = "app/api/post-trade/payload/validate/route.ts";
const tradeUiPath = "app/trade-app.tsx";

function readSource(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

test.describe("post-trade write service client wiring draft static checks", () => {
  test("wiring draft is server-only and references staging factory shape only", () => {
    const source = readSource(wiringDraftPath);

    expect(source).toContain('import "server-only"');
    expect(source).toContain("post-trade-service-client-factory");
    expect(source).toContain("POST_TRADE_STAGING_ENVIRONMENT_NAME");
    expect(source).toContain("POST_TRADE_STAGING_PROJECT_REF");
    expect(source).not.toContain("getPostTradeStagingServiceClient");
    expect(source).not.toContain("@supabase/supabase-js");
    expect(source).not.toContain("createClient(");
  });

  test("valid command path returns execution-blocked no-remote-write metadata", () => {
    const source = readSource(wiringDraftPath);

    expect(source).toContain(
      "buildPostTradeWriteServiceClientWiringDraft",
    );
    expect(source).toContain('"post_trade_write_service_client_wiring_draft_v1"');
    expect(source).toContain('"blocked_no_remote_write"');
    expect(source).toContain('"post_trade_staging_write_execution_gate"');
    expect(source).toContain("writeCommandsReceived");
    expect(source).toContain("writeCommandTables");
    expect(source).toContain("idempotencyKey");
    expect(source).toContain("auditCommand");
    expect(source).toContain("remoteExecution === false");
    expect(source).toContain('"execution:blocked_until_future_staging_write_execution_gate"');
  });

  test("wiring draft rejects invalid commands, missing audit, unsafe flags, and production target", () => {
    const source = readSource(wiringDraftPath);

    expect(source).toContain("blocked_invalid_write_command_result");
    expect(source).toContain("blocked_missing_write_commands");
    expect(source).toContain("blocked_missing_audit_command");
    expect(source).toContain("blocked_idempotency_mismatch");
    expect(source).toContain("blocked_unsafe_flags");
    expect(source).toContain("blocked_production_target");
    expect(source).toContain("ready_no_remote_write_required");
    expect(source).toContain("safe_write_commands_required");
    expect(source).toContain("safe_audit_command_required");
    expect(source).toContain("idempotency_alignment_required");
    expect(source).toContain("staging_target_required");
  });

  test("wiring draft contains no Supabase write-call fragments or remote execution methods", () => {
    const source = readSource(wiringDraftPath);
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

    expect(forbiddenFragments.filter((fragment) => source.includes(fragment))).toEqual([]);
    expect(source).toContain("noSupabaseWriteMethodCall: true");
    expect(source).toContain("noClientInstantiation: true");
    expect(source).toContain("noRemoteWrite: true");
    expect(source).toContain("noApiWriteBehavior: true");
  });

  test("wiring draft is not imported by write service, API route, factory, or Trade UI", () => {
    const forbiddenImport = "post-trade-write-service-client-wiring-draft";

    expect(readSource(writeServiceDraftPath)).not.toContain(forbiddenImport);
    expect(readSource(routePath)).not.toContain(forbiddenImport);
    expect(readSource(factoryPath)).not.toContain(forbiddenImport);
    expect(readSource(tradeUiPath)).not.toContain(forbiddenImport);
    expect(readSource(routePath)).not.toContain(
      "buildPostTradeWriteServiceClientWiringDraft",
    );
    expect(readSource(tradeUiPath)).not.toContain(
      "buildPostTradeWriteServiceClientWiringDraft",
    );
  });
});
