import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const transportPath =
  "lib/server/position-version-lineage-v2-writer-private-postgresql-transport.ts";
const sourceContractPath =
  "lib/position-version-lineage-v2-writer-private-non-data-api-command-port-source-contract.ts";
const builderPath =
  "lib/server/position-version-lineage-v2-writer-canonical-command-digest.ts";
const decoderPath =
  "lib/server/position-version-lineage-v2-writer-strict-committed-result-decoder.ts";
const receiptPath =
  "lib/server/position-version-lineage-v2-writer-immutable-committed-result-receipt.ts";
const ownerContextPath =
  "lib/server/position-version-lineage-v2-writer-authenticated-server-owner-context.ts";
const applicationSessionCorePath = "lib/application-session-core.ts";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const planPath = "tests/e2e/action-660j-parallel-provider-free-verification.spec.ts";
const documentationPath = "docs/action-666ja-b03-private-postgresql-transport.md";
const evidencePath = "docs/evidence/action-666ja-b03-private-postgresql-transport.json";
const thisTest =
  "tests/e2e/action-666ja-b03-private-postgresql-transport.spec.ts";

const owner = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";
const recommendation = "550e8400-e29b-41d4-a716-446655440000";
const position = "7d444840-e29b-41d4-a716-446655440000";

type ClientFactory = (configuration: unknown) => {
  connect: () => Promise<void>;
  end: () => Promise<void>;
  query: (query: unknown) => Promise<{ rowCount: number | null; rows: readonly unknown[] }>;
};

type TransportModule = {
  POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_POSTGRESQL_TRANSPORT_CA_SECRET: string;
  POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_POSTGRESQL_TRANSPORT_CONNECTION_SECRET: string;
  POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_POSTGRESQL_TRANSPORT_QUERY: string;
  PositionVersionLineageV2WriterPrivatePostgresqlTransportCommandError: new () => Error;
  PositionVersionLineageV2WriterPrivatePostgresqlTransportConfigurationError: new () => Error;
  PositionVersionLineageV2WriterPrivatePostgresqlTransportInvocationError: new () => Error;
  executePositionVersionLineageV2WriterPrivatePostgresqlTransport: (
    input: unknown,
    options?: { environment?: Record<string, string | undefined>; clientFactory?: ClientFactory },
  ) => Promise<unknown>;
};

type OwnerContextModule = {
  POSITION_VERSION_LINEAGE_V2_WRITER_AUTHENTICATED_SERVER_OWNER_CONTEXT_VERSION: string;
  resolvePositionVersionLineageV2WriterAuthenticatedServerOwnerContext: () => Promise<unknown>;
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

function loadTransport(): TransportModule {
  const sourceContract = runModule(sourceContractPath, () => {
    throw new Error("source_contract_has_no_runtime_imports");
  });
  const builder = runModule(builderPath, (specifier) => {
    if (specifier === "server-only") return {};
    if (specifier === "node:crypto") return { createHash };
    if (specifier === "../position-version-lineage-v2-writer-private-non-data-api-command-port-source-contract") {
      return sourceContract;
    }
    throw new Error(`unexpected_builder_import:${specifier}`);
  });
  const decoder = runModule(decoderPath, (specifier) => {
    if (specifier === "server-only") return {};
    if (specifier === "../position-version-lineage-v2-writer-private-non-data-api-command-port-source-contract") {
      return sourceContract;
    }
    throw new Error(`unexpected_decoder_import:${specifier}`);
  });
  const receipt = runModule(receiptPath, (specifier) => {
    if (specifier === "server-only") return {};
    throw new Error(`unexpected_receipt_import:${specifier}`);
  });

  return runModule(transportPath, (specifier) => {
    if (specifier === "server-only") return {};
    if (specifier === "pg") {
      return {
        Client: class Client {},
        types: { getTypeParser: () => (value: string) => value },
      };
    }
    if (specifier === "../position-version-lineage-v2-writer-private-non-data-api-command-port-source-contract") {
      return sourceContract;
    }
    if (specifier === "./position-version-lineage-v2-writer-canonical-command-digest") {
      return builder;
    }
    if (specifier === "./position-version-lineage-v2-writer-immutable-committed-result-receipt") {
      return receipt;
    }
    if (specifier === "./position-version-lineage-v2-writer-strict-committed-result-decoder") {
      return decoder;
    }
    throw new Error(`unexpected_transport_import:${specifier}`);
  }) as unknown as TransportModule;
}

function loadOwnerContext(session: unknown): OwnerContextModule {
  const applicationSessionCore = runModule(applicationSessionCorePath, () => {
    throw new Error("application_session_core_has_no_runtime_imports");
  });

  return runModule(ownerContextPath, (specifier) => {
    if (specifier === "server-only") return {};
    if (specifier === "@/lib/application-session-core") return applicationSessionCore;
    if (specifier === "@/lib/server/application-session") {
      return { requireApplicationSession: async () => session };
    }
    throw new Error(`unexpected_owner_context_import:${specifier}`);
  }) as unknown as OwnerContextModule;
}

function command() {
  return {
    authenticatedServerOwner: owner,
    opaqueRecommendationReference: recommendation,
    canonicalCommandDigest: createHash("sha256")
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
      .digest("hex"),
  };
}

function environment(
  transport: TransportModule,
  connectionString?: string,
  certificateAuthority = validCertificateAuthority(),
) {
  return connectionString
    ? {
      [transport.POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_POSTGRESQL_TRANSPORT_CONNECTION_SECRET]: connectionString,
      [transport.POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_POSTGRESQL_TRANSPORT_CA_SECRET]: certificateAuthority,
    }
    : {};
}

function validConnectionString() {
  return "postgresql://ture_staging_b03_writer:not-a-real-password@db.pdvzyuhykomwfqyyztru.supabase.co:5432/postgres?sslmode=verify-full";
}

function validCertificateAuthority() {
  return "-----BEGIN CERTIFICATE-----\nunit-test-certificate-authority\n-----END CERTIFICATE-----";
}

function factory(
  result: { rowCount: number | null; rows: readonly unknown[] },
  trace: { config: unknown[]; connect: number; end: number; queries: unknown[] },
): ClientFactory {
  return (configuration) => {
    trace.config.push(configuration);
    return {
      connect: async () => {
        trace.connect += 1;
      },
      end: async () => {
        trace.end += 1;
      },
      query: async (query) => {
        trace.queries.push(query);
        return result;
      },
    };
  };
}

async function rejection(promise: Promise<unknown>) {
  try {
    await promise;
  } catch (error) {
    return error;
  }

  throw new Error("expected_transport_rejection");
}

test("666JA exposes one server-only, parameterized, fail-closed private V2 transport", async () => {
  const transport = loadTransport();
  const transportSource = source(transportPath);
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(existsSync(resolve(root, transportPath))).toBe(true);
  expect(transportSource.startsWith('import "server-only";')).toBe(true);
  expect(transportSource).toContain('from "pg"');
  expect(transportSource).toContain(transport.POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_POSTGRESQL_TRANSPORT_CONNECTION_SECRET);
  expect(transportSource).toContain(transport.POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_POSTGRESQL_TRANSPORT_CA_SECRET);
  expect(transportSource).toContain('url.hostname !== POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_POSTGRESQL_TRANSPORT_STAGING_HOST');
  expect(transportSource).toContain('url.port !== POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_POSTGRESQL_TRANSPORT_STAGING_PORT');
  expect(transportSource).toContain('`/${POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_POSTGRESQL_TRANSPORT_STAGING_DATABASE}`');
  expect(transportSource).toContain('url.searchParams.get("sslmode") !== "verify-full"');
  expect(transportSource).toContain('url.searchParams.delete("sslmode")');
  expect(transportSource).toContain(transport.POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_POSTGRESQL_TRANSPORT_QUERY);
  expect(transportSource).not.toMatch(/NEXT_PUBLIC_/);
  expect(transportSource).not.toMatch(/createClient|fetch\s*\(|@\/lib\/supabase|@supabase/);
  expect(transportSource).not.toMatch(/broker|avanza|netlify/i);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
  expect(source(planPath).match(new RegExp(thisTest, "g")) ?? []).toHaveLength(1);

  let factoryCalls = 0;
  expect(await rejection(
    transport.executePositionVersionLineageV2WriterPrivatePostgresqlTransport(command(), {
      environment: environment(transport),
      clientFactory: () => {
        factoryCalls += 1;
        throw new Error("must_not_construct_client");
      },
    }),
  )).toBeInstanceOf(
    transport.PositionVersionLineageV2WriterPrivatePostgresqlTransportConfigurationError,
  );
  expect(factoryCalls).toBe(0);
});

test("R-01 resolves an unwired writer owner only from the verified server session", async () => {
  const ownerContextSource = source(ownerContextPath);
  const ownerContext = loadOwnerContext({
    status: "authenticated",
    owner_user_id: "3F2504E0-4F89-41D3-9A0C-0305E82C3301",
  });

  expect(ownerContextSource.startsWith('import "server-only";')).toBe(true);
  expect(ownerContextSource).toContain('from "@/lib/server/application-session"');
  expect(ownerContextSource).toContain("requireApplicationSession()");
  expect(ownerContextSource).toContain("session.status !== \"authenticated\"");
  expect(ownerContextSource).toContain("normalizeApplicationOwnerUserId(session.owner_user_id)");
  expect(ownerContextSource).not.toMatch(/@supabase|createClient|fetch\s*\(|\.from\s*\(|\.rpc\s*\(|\.insert\s*\(/);
  expect(ownerContext.POSITION_VERSION_LINEAGE_V2_WRITER_AUTHENTICATED_SERVER_OWNER_CONTEXT_VERSION).toBe(
    "position_version_lineage_v2_writer_authenticated_server_owner_context_v1",
  );

  const resolved = await ownerContext.resolvePositionVersionLineageV2WriterAuthenticatedServerOwnerContext();
  expect(resolved).toEqual({ authenticatedServerOwner: owner });
  expect(Object.isFrozen(resolved)).toBe(true);

  for (const session of [
    null,
    { status: "missing", owner_user_id: owner },
    { status: "authenticated", owner_user_id: "not-a-uuid" },
  ]) {
    expect(
      await loadOwnerContext(session).resolvePositionVersionLineageV2WriterAuthenticatedServerOwnerContext(),
    ).toBeNull();
  }

  const appSources = [
    "app/trade-app.tsx",
    "app/api/app/positions/route.ts",
    "app/api/post-trade/payload/validate/route.ts",
  ].map(source);
  for (const appSource of appSources) {
    expect(appSource).not.toContain("position-version-lineage-v2-writer-authenticated-server-owner-context");
  }
});

test("666JA records the approved staging writer invocation and its verified rollback", () => {
  const documentation = source(documentationPath);
  const evidence = JSON.parse(source(evidencePath));

  expect(evidence).toMatchObject({
    contract_version: "trade.action666ja.b03-private-postgresql-transport.v3",
    action_id: "ACTION_666JA",
    scope: {
      source_only_transport_delivery: true,
      staging_connection_attempted: true,
      staging_connection_executed: true,
      writer_invoked: true,
      temporary_login_enabled_then_revoked: true,
      branch_deploy_secret_created_then_removed: true,
      synthetic_fixture_removed: true,
      rollback_verified: true,
      secret_value_logged_or_committed: false,
      runtime_or_route_bound: false,
      netlify_deploy_preview_completed: true,
      netlify_production_deploy_triggered: false,
      production_targeted: false,
      provider_or_broker_contacted: false,
    },
    staging_attempt: {
      result: "created_then_rolled_back",
      authenticated_database_session_established: true,
      writer_routine_invoked: true,
      committed_result_disposition: "created",
      committed_result_position_version: 1,
      client_transaction_rollback_executed: true,
      no_durable_writer_result_remains: true,
    },
    preview_deployment: {
      context: "deploy-preview",
      transport_invoked: false,
      production_targeted: false,
    },
    staging_completion: {
      least_privileged_role_grants_revoked: true,
      ipv4_addon_disabled_after_proof: true,
      production_targeted: false,
      provider_or_broker_contacted: false,
    },
  });
  expect(documentation).toContain("`NOLOGIN`");
  expect(documentation).toContain("`created` receipt");
  expect(documentation).toContain("`ROLLBACK`");
  expect(documentation).toContain("Netlify completed the normal PR preview");
  expect(documentation).toContain("deployment was triggered.");
});

test("666JA sends only the frozen routine statement and projects one immutable created receipt", async () => {
  const transport = loadTransport();
  const trace = { config: [] as unknown[], connect: 0, end: 0, queries: [] as unknown[] };
  const canonicalCommandDigest = command().canonicalCommandDigest;
  const result = await transport.executePositionVersionLineageV2WriterPrivatePostgresqlTransport(command(), {
    environment: environment(transport, validConnectionString()),
    clientFactory: factory(
      {
        rowCount: 1,
        rows: [{
          disposition: "created",
          initial_history_identity: `${position}:${owner}:1`,
          position_id: position,
          position_version: 1,
        }],
      },
      trace,
    ),
  });

  expect(result).toEqual({
    canonicalCommandDigest,
    disposition: "created",
    initialHistoryIdentity: `${position}:${owner}:1`,
    positionId: position,
    positionVersion: 1,
  });
  expect(Object.isFrozen(result)).toBe(true);
  expect(trace.connect).toBe(1);
  expect(trace.end).toBe(1);
  expect(trace.config).toEqual([
    expect.objectContaining({
      connectionString: expect.not.stringContaining("sslmode"),
      connectionTimeoutMillis: 5_000,
      query_timeout: 5_000,
      ssl: { ca: validCertificateAuthority(), rejectUnauthorized: true },
      statement_timeout: 5_000,
    }),
  ]);
  const configuration = trace.config[0] as {
    types: { getTypeParser: (oid: number, format?: "text" | "binary") => (value: string) => unknown };
  };
  expect(configuration.types.getTypeParser(20, "text")("1")).toBe(1);
  expect(configuration.types.getTypeParser(20, "text")("2")).toBe("2");
  expect(trace.queries).toEqual([
    {
      name: "position-version-lineage-v2-writer-private-routine-v1",
      text: transport.POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_POSTGRESQL_TRANSPORT_QUERY,
      values: [owner, recommendation, canonicalCommandDigest],
    },
  ]);
});

test("666JA rejects widened or noncanonical input before connecting", async () => {
  const transport = loadTransport();
  const trace = { config: [] as unknown[], connect: 0, end: 0, queries: [] as unknown[] };
  expect(await rejection(
    transport.executePositionVersionLineageV2WriterPrivatePostgresqlTransport(
      { ...command(), canonicalCommandDigest: createHash("sha256").update("different").digest("hex") },
      {
        environment: environment(transport, validConnectionString()),
        clientFactory: factory({ rowCount: 1, rows: [] }, trace),
      },
    ),
  )).toBeInstanceOf(
    transport.PositionVersionLineageV2WriterPrivatePostgresqlTransportCommandError,
  );
  expect(trace.config).toEqual([]);
  expect(trace.connect).toBe(0);
  expect(trace.end).toBe(0);
  expect(trace.queries).toEqual([]);
});

test("666JA rejects a missing or malformed certificate authority before connecting", async () => {
  const transport = loadTransport();
  const missingTrace = { config: [] as unknown[], connect: 0, end: 0, queries: [] as unknown[] };
  expect(await rejection(
    transport.executePositionVersionLineageV2WriterPrivatePostgresqlTransport(command(), {
      environment: {
        [transport.POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_POSTGRESQL_TRANSPORT_CONNECTION_SECRET]: validConnectionString(),
      },
      clientFactory: factory({ rowCount: 1, rows: [] }, missingTrace),
    }),
  )).toBeInstanceOf(
    transport.PositionVersionLineageV2WriterPrivatePostgresqlTransportConfigurationError,
  );
  expect(missingTrace.config).toEqual([]);

  const malformedTrace = { config: [] as unknown[], connect: 0, end: 0, queries: [] as unknown[] };
  expect(await rejection(
    transport.executePositionVersionLineageV2WriterPrivatePostgresqlTransport(command(), {
      environment: environment(transport, validConnectionString(), "not-a-pem"),
      clientFactory: factory({ rowCount: 1, rows: [] }, malformedTrace),
    }),
  )).toBeInstanceOf(
    transport.PositionVersionLineageV2WriterPrivatePostgresqlTransportConfigurationError,
  );
  expect(malformedTrace.config).toEqual([]);
});

test("666JA rejects non-staging credentials and ambiguous database results after cleanup", async () => {
  const transport = loadTransport();
  const badRoleTrace = { config: [] as unknown[], connect: 0, end: 0, queries: [] as unknown[] };
  expect(await rejection(
    transport.executePositionVersionLineageV2WriterPrivatePostgresqlTransport(command(), {
      environment: environment(transport, validConnectionString().replace("ture_staging_b03_writer", "postgres")),
      clientFactory: factory({ rowCount: 1, rows: [] }, badRoleTrace),
    }),
  )).toBeInstanceOf(
    transport.PositionVersionLineageV2WriterPrivatePostgresqlTransportConfigurationError,
  );
  expect(badRoleTrace.config).toEqual([]);

  for (const connectionString of [
    validConnectionString().replace(
      "db.pdvzyuhykomwfqyyztru.supabase.co",
      "db.ekdyopdrrkphlrsilyoo.supabase.co",
    ),
    validConnectionString().replace(":5432/", ":6543/"),
    validConnectionString().replace("/postgres?", "/not-postgres?"),
  ]) {
    const targetMismatchTrace = {
      config: [] as unknown[],
      connect: 0,
      end: 0,
      queries: [] as unknown[],
    };

    expect(await rejection(
      transport.executePositionVersionLineageV2WriterPrivatePostgresqlTransport(command(), {
        environment: environment(transport, connectionString),
        clientFactory: factory({ rowCount: 1, rows: [] }, targetMismatchTrace),
      }),
    )).toBeInstanceOf(
      transport.PositionVersionLineageV2WriterPrivatePostgresqlTransportConfigurationError,
    );
    expect(targetMismatchTrace.config).toEqual([]);
    expect(targetMismatchTrace.connect).toBe(0);
    expect(targetMismatchTrace.end).toBe(0);
    expect(targetMismatchTrace.queries).toEqual([]);
  }

  const ambiguousTrace = { config: [] as unknown[], connect: 0, end: 0, queries: [] as unknown[] };
  expect(await rejection(
    transport.executePositionVersionLineageV2WriterPrivatePostgresqlTransport(command(), {
      environment: environment(transport, validConnectionString()),
      clientFactory: factory({ rowCount: 2, rows: [{}, {}] }, ambiguousTrace),
    }),
  )).toBeInstanceOf(
    transport.PositionVersionLineageV2WriterPrivatePostgresqlTransportInvocationError,
  );
  expect(ambiguousTrace.connect).toBe(1);
  expect(ambiguousTrace.end).toBe(1);
  expect(ambiguousTrace.queries).toHaveLength(1);
});
