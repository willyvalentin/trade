import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const actionPath = "docs/action-666ec-transactional-recommendation-position-writer-private-server-adapter.md";
const evidencePath = "docs/evidence/action-666ec-transactional-recommendation-position-writer-private-server-adapter.json";
const modulePath = "lib/server/transactional-recommendation-position-writer-private-adapter.ts";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest = "tests/e2e/action-666ec-transactional-recommendation-position-writer-private-server-adapter.spec.ts";
const evidenceSha256 = "7202462a55ba3d0911cc01da7d46c5ad3f75c25a646685c67ddb3a20a730eb79";

type RuntimeWriter = {
  adapterVersion: string;
  authorityDecisionVersion: string;
  commandVersion: string;
  write(owner: unknown, command: unknown): Promise<unknown>;
};

type RuntimeAdapterModule = {
  TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_PRIVATE_ADAPTER_VERSION: string;
  TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_PRIVATE_COMMAND_VERSION: string;
  createTransactionalRecommendationPositionWriter(commandPort: {
    openOwnedPosition(owner: unknown, command: unknown): Promise<unknown>;
  }): RuntimeWriter;
};

function source(relativePath: string) { return readFileSync(resolve(root, relativePath), "utf8"); }
function sha256(value: string) { return createHash("sha256").update(value, "utf8").digest("hex"); }

function loadAdapterModule(): RuntimeAdapterModule {
  const moduleSource = source(modulePath).replace('import "server-only";\n\n', "");
  const transpiled = ts.transpileModule(moduleSource, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: modulePath,
  }).outputText;
  const sandbox = {
    exports: {} as Partial<RuntimeAdapterModule>,
    require: (specifier: string) => {
      if (specifier === "@/lib/transactional-recommendation-position-writer-implementation-authority-decision") {
        return {
          TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_IMPLEMENTATION_AUTHORITY_DECISION_VERSION:
            "transactional_recommendation_position_writer_implementation_authority_decision_v1",
        };
      }

      throw new Error(`unexpected private-adapter dependency: ${specifier}`);
    },
  };

  vm.runInNewContext(transpiled, sandbox, { filename: modulePath });
  return sandbox.exports as RuntimeAdapterModule;
}

const owner = {
  ownerUserId: "01234567-89ab-4cde-8fab-0123456789ab",
  source: "authenticated_server_session",
};
const command = {
  recommendationId: "89abcdef-0123-4abc-8def-0123456789ab",
  ticker: "ACME",
  companyName: "Acme Holdings",
  entryPrice: 10,
  positionSize: 5,
  currentStop: 8,
  target1: 12,
  target2: 14,
  executionMetadata: { source: "test" },
};
const createdResult = {
  positionId: "76543210-fedc-4cba-8fed-cba987654321",
  disposition: "created",
  snapshotLinkCount: 1,
};

test("666EC validates a server-owner command and exposes only the normalized writer result", async () => {
  const adapter = loadAdapterModule();
  const calls: unknown[][] = [];
  const writer = adapter.createTransactionalRecommendationPositionWriter({
    async openOwnedPosition(receivedOwner, receivedCommand) {
      calls.push([receivedOwner, receivedCommand]);
      return createdResult;
    },
  });

  expect(Object.isFrozen(writer)).toBe(true);
  expect(writer.adapterVersion).toBe(
    "transactional_recommendation_position_writer_private_server_adapter_v1",
  );
  expect(writer.authorityDecisionVersion).toBe(
    "transactional_recommendation_position_writer_implementation_authority_decision_v1",
  );
  expect(writer.commandVersion).toBe("application_open_owned_position_v1");
  expect(await writer.write(owner, command)).toEqual({
    status: "created",
    positionId: createdResult.positionId,
    snapshotLinkCount: 1,
  });
  expect(calls).toEqual([[owner, command]]);
});

test("666EC rejects invalid input before the command port and contains command-port faults", async () => {
  const adapter = loadAdapterModule();
  let calls = 0;
  const writer = adapter.createTransactionalRecommendationPositionWriter({
    async openOwnedPosition() {
      calls += 1;
      return createdResult;
    },
  });

  expect(await writer.write({ ...owner, source: "untrusted" }, command)).toEqual({ status: "invalid" });
  expect(await writer.write(owner, { ...command, ticker: "acme" })).toEqual({ status: "invalid" });
  expect(calls).toBe(0);

  const replayWriter = adapter.createTransactionalRecommendationPositionWriter({
    async openOwnedPosition() {
      return { ...createdResult, disposition: "reused" };
    },
  });
  expect(await replayWriter.write(owner, command)).toEqual({
    status: "replayed",
    positionId: createdResult.positionId,
    snapshotLinkCount: 1,
  });

  const failedWriter = adapter.createTransactionalRecommendationPositionWriter({
    async openOwnedPosition() {
      throw new Error("injected command-port failure");
    },
  });
  expect(await failedWriter.write(owner, command)).toEqual({ status: "failed" });

  const malformedWriter = adapter.createTransactionalRecommendationPositionWriter({
    async openOwnedPosition() {
      return { ...createdResult, snapshotLinkCount: 0 };
    },
  });
  expect(await malformedWriter.write(owner, command)).toEqual({ status: "failed" });
});

test("666EC records exact predecessor evidence and remains a private, inert adapter", () => {
  const raw = source(evidencePath);
  expect(sha256(raw)).toBe(evidenceSha256);
  const evidence = JSON.parse(raw);
  expect(evidence.predecessor).toEqual({
    protected_main_commit: "9ba3ad61d191488fc411554e2f974513692a8f26",
    protected_main_tree: "a0a9cf23da8dc99e4008e8b0e5d18b38e8c03fd0",
    exact_main_ci_run: 32664222438,
    exact_main_ci_conclusion: "success",
  });
  expect(evidence.delivery).toEqual({
    kind: "private_server_adapter_implementation",
    database_operations: false,
    migration_file_added: false,
    runtime_wiring: false,
    provider_calls: false,
    broker_operations: false,
    deployment: false,
  });
  expect(evidence.decision).toEqual({
    bounded_objective_closed: "transactional_recommendation_to_position_writer_private_server_adapter_implementation",
    next_bounded_objective: "transactional_recommendation_to_position_writer_owner_bound_command_port_integration",
    concrete_port_bound: false,
    production_authority_granted: false,
  });
  for (const [relativePath, expectedHash] of Object.entries(evidence.source_artifact_sha256)) {
    expect(sha256(source(relativePath))).toBe(expectedHash);
  }

  const adapterSource = source(modulePath);
  expect(adapterSource.startsWith('import "server-only";')).toBe(true);
  expect(adapterSource).not.toMatch(/\b(?:fetch|createClient|execute_sql|insert|update|delete|select|rpc)\s*\(/);
  expect(adapterSource).not.toMatch(/from\s+['"](?:@\/lib\/supabase|@supabase|next\/server|node:net|node:https|node:http)/);
  expect(source(roadmapPath)).toMatch(/action 666ec/i);
  expect(source(ledgerPath)).toMatch(/action 666ec/i);
  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});

test("666EC documentation contains no operational endpoint or secret material", () => {
  const documentation = `${source(actionPath)}\n${source(evidencePath)}`;
  expect(documentation).not.toMatch(/https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i);
  expect(documentation).toMatch(/no\s+database\s+client/i);
  expect(documentation).toMatch(/no\s+external\s+effect/i);
  expect(documentation).toMatch(/inert\s+private\s+seam/i);
});
