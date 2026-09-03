import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const commandPortPath =
  "lib/server/position-version-lineage-v2-writer-authenticated-server-command-port.ts";
const sourceContractPath =
  "lib/position-version-lineage-v2-writer-private-non-data-api-command-port-source-contract.ts";
const digestBuilderPath =
  "lib/server/position-version-lineage-v2-writer-canonical-command-digest.ts";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const planPath = "tests/e2e/action-660j-parallel-provider-free-verification.spec.ts";
const thisTest =
  "tests/e2e/r01-staging-writer-authenticated-server-command-port.spec.ts";

const owner = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";
const recommendation = "550e8400-e29b-41d4-a716-446655440000";
const position = "7d444840-e29b-41d4-a716-446655440000";

type CommandPortModule = {
  PositionVersionLineageV2WriterAuthenticatedServerCommandPortAuthenticationError: new () => Error;
  PositionVersionLineageV2WriterAuthenticatedServerCommandPortInputError: new () => Error;
  executePositionVersionLineageV2WriterAuthenticatedServerCommandPort: (
    input: unknown,
    dependencies: {
      resolveAuthenticatedServerOwnerContext: () => Promise<unknown>;
      executePrivateTransport: (command: unknown) => Promise<unknown>;
    },
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

function runModule(
  relativePath: string,
  require: (specifier: string) => unknown,
): Record<string, unknown> {
  const sandbox = { exports: {} as Record<string, unknown>, require, URL };
  vm.runInNewContext(transpile(relativePath), sandbox, { filename: relativePath });
  return sandbox.exports;
}

function loadCommandPort(): CommandPortModule {
  const sourceContract = runModule(sourceContractPath, () => {
    throw new Error("source_contract_has_no_runtime_imports");
  });
  const digestBuilder = runModule(digestBuilderPath, (specifier) => {
    if (specifier === "server-only") return {};
    if (specifier === "node:crypto") return { createHash };
    if (
      specifier ===
      "../position-version-lineage-v2-writer-private-non-data-api-command-port-source-contract"
    ) {
      return sourceContract;
    }
    throw new Error(`unexpected_digest_builder_import:${specifier}`);
  });

  return runModule(commandPortPath, (specifier) => {
    if (specifier === "server-only") return {};
    if (
      specifier ===
      "../position-version-lineage-v2-writer-private-non-data-api-command-port-source-contract"
    ) {
      return sourceContract;
    }
    if (specifier === "./position-version-lineage-v2-writer-canonical-command-digest") {
      return digestBuilder;
    }
    if (specifier === "./position-version-lineage-v2-writer-authenticated-server-owner-context") {
      return {
        resolvePositionVersionLineageV2WriterAuthenticatedServerOwnerContext: async () => null,
      };
    }
    if (specifier === "./position-version-lineage-v2-writer-private-postgresql-transport") {
      return { executePositionVersionLineageV2WriterPrivatePostgresqlTransport: async () => {
        throw new Error("transport_must_be_injected");
      } };
    }
    throw new Error(`unexpected_command_port_import:${specifier}`);
  }) as unknown as CommandPortModule;
}

async function rejection(promise: Promise<unknown>) {
  try {
    await promise;
  } catch (error) {
    return error;
  }

  throw new Error("expected_rejection");
}

test("R-01 binds the V2 writer command to only the verified server owner", async () => {
  const commandPort = loadCommandPort();
  const commandPortSource = source(commandPortPath);
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(existsSync(resolve(root, commandPortPath))).toBe(true);
  expect(commandPortSource.startsWith('import "server-only";')).toBe(true);
  expect(commandPortSource).toContain(
    "resolvePositionVersionLineageV2WriterAuthenticatedServerOwnerContext",
  );
  expect(commandPortSource).toContain(
    "executePositionVersionLineageV2WriterPrivatePostgresqlTransport",
  );
  expect(commandPortSource).not.toMatch(/NEXT_PUBLIC_|NextResponse|fetch\s*\(|@\/lib\/supabase|@supabase\//i);
  expect(commandPortSource).not.toMatch(/from\s+["']next\//);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
  expect(source(planPath).match(new RegExp(thisTest, "g")) ?? []).toHaveLength(1);

  const received: unknown[] = [];
  const receipt = Object.freeze({
    canonicalCommandDigest: "a".repeat(64),
    disposition: "created",
    initialHistoryIdentity: `${position}:${owner}:1`,
    positionId: position,
    positionVersion: 1,
  });

  const result = await commandPort.executePositionVersionLineageV2WriterAuthenticatedServerCommandPort(
    { opaqueRecommendationReference: recommendation },
    {
      resolveAuthenticatedServerOwnerContext: async () =>
        Object.freeze({ authenticatedServerOwner: owner }),
      executePrivateTransport: async (command) => {
        received.push(command);
        return receipt;
      },
    },
  );

  const expectedDigest = createHash("sha256")
    .update(
      JSON.stringify({
        authenticated_server_owner: owner,
        contract_version:
          "position_version_lineage_v2_writer_private_non_data_api_command_port_source_contract_v1",
        opaque_recommendation_reference: recommendation,
        routine_signature:
          "private.write_owner_bound_recommendation_position_v2(uuid,uuid,text)",
      }),
      "utf8",
    )
    .digest("hex");

  expect(received).toEqual([{
    authenticatedServerOwner: owner,
    opaqueRecommendationReference: recommendation,
    canonicalCommandDigest: expectedDigest,
  }]);
  expect(result).toBe(receipt);
});

test("R-01 rejects client-projected owners and invokes no transport without a verified owner", async () => {
  const commandPort = loadCommandPort();
  let resolverCalls = 0;
  let transportCalls = 0;
  const dependencies = {
    resolveAuthenticatedServerOwnerContext: async () => {
      resolverCalls += 1;
      return null;
    },
    executePrivateTransport: async () => {
      transportCalls += 1;
      return Object.freeze({});
    },
  };

  expect(await rejection(
    commandPort.executePositionVersionLineageV2WriterAuthenticatedServerCommandPort(
      { authenticatedServerOwner: owner, opaqueRecommendationReference: recommendation },
      dependencies,
    ),
  )).toBeInstanceOf(
    commandPort.PositionVersionLineageV2WriterAuthenticatedServerCommandPortInputError,
  );
  expect(resolverCalls).toBe(0);
  expect(transportCalls).toBe(0);

  expect(await rejection(
    commandPort.executePositionVersionLineageV2WriterAuthenticatedServerCommandPort(
      { opaqueRecommendationReference: recommendation },
      dependencies,
    ),
  )).toBeInstanceOf(
    commandPort.PositionVersionLineageV2WriterAuthenticatedServerCommandPortAuthenticationError,
  );
  expect(resolverCalls).toBe(1);
  expect(transportCalls).toBe(0);
});
