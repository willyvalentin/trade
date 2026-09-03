import { createHash, timingSafeEqual } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const transportPath =
  "lib/server/position-version-lineage-v2-writer-private-postgresql-transport.ts";
const proofPath =
  "lib/server/position-version-lineage-v2-writer-staging-rollback-proof.ts";
const routePath =
  "app/api/internal/staging-proof/position-version-lineage-v2-writer/route.ts";
const proxyPath = "proxy.ts";
const sourceContractPath =
  "lib/position-version-lineage-v2-writer-private-non-data-api-command-port-source-contract.ts";
const builderPath =
  "lib/server/position-version-lineage-v2-writer-canonical-command-digest.ts";
const decoderPath =
  "lib/server/position-version-lineage-v2-writer-strict-committed-result-decoder.ts";
const receiptPath =
  "lib/server/position-version-lineage-v2-writer-immutable-committed-result-receipt.ts";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const planPath = "tests/e2e/action-660j-parallel-provider-free-verification.spec.ts";
const thisTest = "tests/e2e/r01-staging-writer-rollback-preview-harness.spec.ts";

const owner = "9110b432-8559-49e7-9567-b9f049cd92f1";
const recommendation = "550e8400-e29b-41d4-a716-446655440000";
const position = "7d444840-e29b-41d4-a716-446655440000";
const token = "a".repeat(64);

type QueryResult = { rowCount: number | null; rows: readonly unknown[] };
type ClientFactory = () => {
  connect: () => Promise<void>;
  end: () => Promise<void>;
  query: (query: unknown) => Promise<QueryResult>;
};

type TransportModule = {
  POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_POSTGRESQL_TRANSPORT_CA_SECRET: string;
  POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_POSTGRESQL_TRANSPORT_CONNECTION_SECRET: string;
  PositionVersionLineageV2WriterPrivatePostgresqlTransportInvocationError: new () => Error;
  executePositionVersionLineageV2WriterPrivatePostgresqlRollbackProof: (
    input: unknown,
    options?: { environment?: Record<string, string | undefined>; clientFactory?: ClientFactory },
  ) => Promise<unknown>;
};

type RollbackProofModule = {
  POSITION_VERSION_LINEAGE_V2_WRITER_STAGING_PROOF_OWNER_ID_SECRET: string;
  POSITION_VERSION_LINEAGE_V2_WRITER_STAGING_PROOF_RECOMMENDATION_ID_SECRET: string;
  POSITION_VERSION_LINEAGE_V2_WRITER_STAGING_PROOF_TOKEN_SECRET: string;
  PositionVersionLineageV2WriterStagingRollbackProofAuthorizationError: new () => Error;
  runPositionVersionLineageV2WriterStagingRollbackProof: (
    suppliedToken: string | null,
    options?: { environment?: Record<string, string | undefined>; dependencies?: { executeRollbackProof: (command: unknown) => Promise<unknown> } },
  ) => Promise<unknown>;
};

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function transpile(relativePath: string) {
  return ts.transpileModule(source(relativePath), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: relativePath,
  }).outputText;
}

function runModule(relativePath: string, require: (specifier: string) => unknown) {
  const sandbox = { exports: {} as Record<string, unknown>, require, URL, Buffer };
  vm.runInNewContext(transpile(relativePath), sandbox, { filename: relativePath });
  return sandbox.exports;
}

function loadTransport(): TransportModule {
  const sourceContract = runModule(sourceContractPath, () => {
    throw new Error("source_contract_has_no_runtime_imports");
  });
  const builder = runModule(builderPath, (specifier) => {
    if (specifier === "server-only") return {};
    if (specifier === "node:crypto") return { createHash };
    if (specifier === "../position-version-lineage-v2-writer-private-non-data-api-command-port-source-contract") return sourceContract;
    throw new Error(`unexpected_builder_import:${specifier}`);
  });
  const decoder = runModule(decoderPath, (specifier) => {
    if (specifier === "server-only") return {};
    if (specifier === "../position-version-lineage-v2-writer-private-non-data-api-command-port-source-contract") return sourceContract;
    throw new Error(`unexpected_decoder_import:${specifier}`);
  });
  const receipt = runModule(receiptPath, (specifier) => {
    if (specifier === "server-only") return {};
    throw new Error(`unexpected_receipt_import:${specifier}`);
  });

  return runModule(transportPath, (specifier) => {
    if (specifier === "server-only") return {};
    if (specifier === "pg") return { Client: class Client {}, types: { getTypeParser: () => (value: string) => value } };
    if (specifier === "../position-version-lineage-v2-writer-private-non-data-api-command-port-source-contract") return sourceContract;
    if (specifier === "./position-version-lineage-v2-writer-canonical-command-digest") return builder;
    if (specifier === "./position-version-lineage-v2-writer-strict-committed-result-decoder") return decoder;
    if (specifier === "./position-version-lineage-v2-writer-immutable-committed-result-receipt") return receipt;
    throw new Error(`unexpected_transport_import:${specifier}`);
  }) as unknown as TransportModule;
}

function loadProof(): RollbackProofModule {
  const sourceContract = runModule(sourceContractPath, () => {
    throw new Error("source_contract_has_no_runtime_imports");
  });
  const builder = runModule(builderPath, (specifier) => {
    if (specifier === "server-only") return {};
    if (specifier === "node:crypto") return { createHash };
    if (specifier === "../position-version-lineage-v2-writer-private-non-data-api-command-port-source-contract") return sourceContract;
    throw new Error(`unexpected_builder_import:${specifier}`);
  });
  return runModule(proofPath, (specifier) => {
    if (specifier === "server-only") return {};
    if (specifier === "node:crypto") return { timingSafeEqual };
    if (specifier === "../position-version-lineage-v2-writer-private-non-data-api-command-port-source-contract") return sourceContract;
    if (specifier === "./position-version-lineage-v2-writer-canonical-command-digest") return builder;
    if (specifier === "./position-version-lineage-v2-writer-private-postgresql-transport") return { executePositionVersionLineageV2WriterPrivatePostgresqlRollbackProof: async () => ({}) };
    throw new Error(`unexpected_proof_import:${specifier}`);
  }) as unknown as RollbackProofModule;
}

function command() {
  return {
    authenticatedServerOwner: owner,
    opaqueRecommendationReference: recommendation,
    canonicalCommandDigest: createHash("sha256").update(JSON.stringify({
      authenticated_server_owner: owner,
      contract_version: "position_version_lineage_v2_writer_private_non_data_api_command_port_source_contract_v1",
      opaque_recommendation_reference: recommendation,
      routine_signature: "private.write_owner_bound_recommendation_position_v2(uuid,uuid,text)",
    }), "utf8").digest("hex"),
  };
}

function environment(transport: TransportModule) {
  return {
    [transport.POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_POSTGRESQL_TRANSPORT_CONNECTION_SECRET]:
      "postgresql://ture_staging_b03_writer:not-a-real-password@db.pdvzyuhykomwfqyyztru.supabase.co:5432/postgres?sslmode=verify-full",
    [transport.POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_POSTGRESQL_TRANSPORT_CA_SECRET]:
      "-----BEGIN CERTIFICATE-----\nunit-test-certificate-authority\n-----END CERTIFICATE-----",
  };
}

async function rejection(promise: Promise<unknown>) {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  throw new Error("expected_rejection");
}

test("R-01 preview proof always rolls back the exact private writer transaction", async () => {
  const transport = loadTransport();
  const trace: unknown[] = [];
  let ended = 0;
  const result = await transport.executePositionVersionLineageV2WriterPrivatePostgresqlRollbackProof(
    command(),
    {
      environment: environment(transport),
      clientFactory: () => ({
        connect: async () => undefined,
        end: async () => { ended += 1; },
        query: async (query) => {
          trace.push(query);
          if (query === "BEGIN" || query === "ROLLBACK") return { rowCount: null, rows: [] };
          return {
            rowCount: 1,
            rows: [{ disposition: "created", position_id: position, position_version: 1, initial_history_identity: `${position}:${owner}:1` }],
          };
        },
      }),
    },
  );

  expect(result).toEqual(expect.objectContaining({ disposition: "created" }));
  expect(trace).toHaveLength(3);
  expect(trace[0]).toBe("BEGIN");
  expect(trace[1]).toEqual(expect.objectContaining({ values: [owner, recommendation, command().canonicalCommandDigest] }));
  expect(trace[2]).toBe("ROLLBACK");
  expect(ended).toBe(1);

  const failedTrace: unknown[] = [];
  expect(await rejection(
    transport.executePositionVersionLineageV2WriterPrivatePostgresqlRollbackProof(command(), {
      environment: environment(transport),
      clientFactory: () => ({
        connect: async () => undefined,
        end: async () => undefined,
        query: async (query) => {
          failedTrace.push(query);
          if (query === "BEGIN" || query === "ROLLBACK") return { rowCount: null, rows: [] };
          throw new Error("writer_failed");
        },
      }),
    }),
  )).toBeInstanceOf(transport.PositionVersionLineageV2WriterPrivatePostgresqlTransportInvocationError);
  expect(failedTrace).toEqual(["BEGIN", expect.any(Object), "ROLLBACK"]);
  expect(source(transportPath)).not.toContain('"COMMIT"');
});

test("R-01 preview endpoint accepts only a protected token and fixed staging fixture", async () => {
  const proof = loadProof();
  const invoked: unknown[] = [];
  const proofEnvironment = {
    [proof.POSITION_VERSION_LINEAGE_V2_WRITER_STAGING_PROOF_TOKEN_SECRET]: token,
    [proof.POSITION_VERSION_LINEAGE_V2_WRITER_STAGING_PROOF_OWNER_ID_SECRET]: owner,
    [proof.POSITION_VERSION_LINEAGE_V2_WRITER_STAGING_PROOF_RECOMMENDATION_ID_SECRET]: recommendation,
  };

  expect(await proof.runPositionVersionLineageV2WriterStagingRollbackProof(token, {
    environment: proofEnvironment,
    dependencies: { executeRollbackProof: async (received) => { invoked.push(received); return {}; } },
  })).toEqual({ outcome: "rolled_back" });
  expect(invoked).toEqual([command()]);
  expect(await rejection(proof.runPositionVersionLineageV2WriterStagingRollbackProof(null, {
    environment: proofEnvironment,
    dependencies: { executeRollbackProof: async () => { throw new Error("must_not_invoke"); } },
  }))).toBeInstanceOf(proof.PositionVersionLineageV2WriterStagingRollbackProofAuthorizationError);

  const route = source(routePath);
  expect(route).toContain('"x-ture-staging-proof-token"');
  expect(route).not.toMatch(/request\.json|NEXT_PUBLIC_|createClient/i);
  expect(source(proxyPath).split('"/api/internal/staging-proof/position-version-lineage-v2-writer"').length - 1).toBe(1);
  expect(source(proofPath)).toContain("timingSafeEqual");
  expect(source(proofPath)).not.toMatch(/NEXT_PUBLIC_|request\.|createClient/i);

  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
  expect(source(planPath).match(new RegExp(thisTest, "g")) ?? []).toHaveLength(1);
});
