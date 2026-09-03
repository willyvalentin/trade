import "server-only";

import { Client, types, type ClientConfig } from "pg";

import {
  POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_ROUTINE_SIGNATURE,
  POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_SOURCE_CONTRACT_VERSION,
  type PositionVersionLineageV2WriterPrivateNonDataApiCommand,
} from "../position-version-lineage-v2-writer-private-non-data-api-command-port-source-contract";
import { buildPositionVersionLineageV2WriterCanonicalCommandDigest } from "./position-version-lineage-v2-writer-canonical-command-digest";
import {
  projectPositionVersionLineageV2WriterImmutableCommittedResultReceipt,
  type PositionVersionLineageV2WriterImmutableCommittedResultReceipt,
} from "./position-version-lineage-v2-writer-immutable-committed-result-receipt";
import { decodePositionVersionLineageV2WriterCommittedResult } from "./position-version-lineage-v2-writer-strict-committed-result-decoder";

export const POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_POSTGRESQL_TRANSPORT_VERSION =
  "position_version_lineage_v2_writer_private_postgresql_transport_v1" as const;

export const POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_POSTGRESQL_TRANSPORT_CONNECTION_SECRET =
  "TURE_POSITION_VERSION_LINEAGE_V2_WRITER_POSTGRES_URL" as const;

export const POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_POSTGRESQL_TRANSPORT_CA_SECRET =
  "TURE_POSITION_VERSION_LINEAGE_V2_WRITER_POSTGRES_CA_PEM" as const;

export const POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_POSTGRESQL_TRANSPORT_STAGING_HOST =
  "db.pdvzyuhykomwfqyyztru.supabase.co" as const;

export const POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_POSTGRESQL_TRANSPORT_STAGING_PORT =
  "5432" as const;

export const POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_POSTGRESQL_TRANSPORT_STAGING_DATABASE =
  "postgres" as const;

export const POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_POSTGRESQL_TRANSPORT_QUERY =
  "select * from private.write_owner_bound_recommendation_position_v2($1, $2, $3)" as const;

const CANONICAL_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const CANONICAL_COMMAND_DIGEST = /^[a-f0-9]{64}$/;
const POSTGRES_INT8_OID = 20;
const COMMAND_FIELDS = Object.freeze([
  "authenticatedServerOwner",
  "canonicalCommandDigest",
  "opaqueRecommendationReference",
] as const);

type QueryResult = Readonly<{
  rowCount: number | null;
  rows: readonly unknown[];
}>;

export type PositionVersionLineageV2WriterPrivatePostgresqlClient = Readonly<{
  connect: () => Promise<unknown>;
  end: () => Promise<void>;
  query: (query: Readonly<{ name: string; text: string; values: readonly string[] }>) => Promise<QueryResult>;
}>;

export type PositionVersionLineageV2WriterPrivatePostgresqlClientFactory = (
  configuration: Readonly<ClientConfig>,
) => PositionVersionLineageV2WriterPrivatePostgresqlClient;

export type PositionVersionLineageV2WriterPrivatePostgresqlTransportOptions = Readonly<{
  environment?: Readonly<Record<string, string | undefined>>;
  clientFactory?: PositionVersionLineageV2WriterPrivatePostgresqlClientFactory;
}>;

export class PositionVersionLineageV2WriterPrivatePostgresqlTransportConfigurationError extends Error {
  constructor() {
    super("invalid_position_version_lineage_v2_writer_private_postgresql_transport_configuration");
    this.name = "PositionVersionLineageV2WriterPrivatePostgresqlTransportConfigurationError";
  }
}

export class PositionVersionLineageV2WriterPrivatePostgresqlTransportCommandError extends Error {
  constructor() {
    super("invalid_position_version_lineage_v2_writer_private_postgresql_transport_command");
    this.name = "PositionVersionLineageV2WriterPrivatePostgresqlTransportCommandError";
  }
}

export class PositionVersionLineageV2WriterPrivatePostgresqlTransportInvocationError extends Error {
  constructor() {
    super("position_version_lineage_v2_writer_private_postgresql_transport_invocation_failed");
    this.name = "PositionVersionLineageV2WriterPrivatePostgresqlTransportInvocationError";
  }
}

function rejectConfiguration(): never {
  throw new PositionVersionLineageV2WriterPrivatePostgresqlTransportConfigurationError();
}

function rejectCommand(): never {
  throw new PositionVersionLineageV2WriterPrivatePostgresqlTransportCommandError();
}

function isExactPlainRecord(value: unknown): value is Record<PropertyKey, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype !== null && Object.getPrototypeOf(prototype) === null;
}

function readConnectionString(
  environment: Readonly<Record<string, string | undefined>>,
): string {
  const connectionString =
    environment[POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_POSTGRESQL_TRANSPORT_CONNECTION_SECRET];

  try {
    if (
      typeof connectionString !== "string" ||
      connectionString.length === 0 ||
      connectionString.length > 4096 ||
      connectionString.trim() !== connectionString
    ) {
      return rejectConfiguration();
    }

    const url = new URL(connectionString);
    if (
      (url.protocol !== "postgres:" && url.protocol !== "postgresql:") ||
      url.username !== "ture_staging_b03_writer" ||
      url.password.length === 0 ||
      url.hostname !== POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_POSTGRESQL_TRANSPORT_STAGING_HOST ||
      url.port !== POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_POSTGRESQL_TRANSPORT_STAGING_PORT ||
      url.pathname !==
        `/${POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_POSTGRESQL_TRANSPORT_STAGING_DATABASE}` ||
      url.searchParams.get("sslmode") !== "verify-full"
    ) {
      return rejectConfiguration();
    }

    return connectionString;
  } catch {
    return rejectConfiguration();
  }
}

function readCertificateAuthority(
  environment: Readonly<Record<string, string | undefined>>,
): string {
  const certificateAuthority =
    environment[POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_POSTGRESQL_TRANSPORT_CA_SECRET];

  if (
    typeof certificateAuthority !== "string" ||
    certificateAuthority.length === 0 ||
    certificateAuthority.length > 16_384 ||
    certificateAuthority.trim() !== certificateAuthority ||
    !certificateAuthority.startsWith("-----BEGIN CERTIFICATE-----\n") ||
    !certificateAuthority.endsWith("\n-----END CERTIFICATE-----")
  ) {
    return rejectConfiguration();
  }

  return certificateAuthority;
}

function readValidatedCommand(
  input: unknown,
): PositionVersionLineageV2WriterPrivateNonDataApiCommand {
  try {
    if (!isExactPlainRecord(input)) {
      return rejectCommand();
    }

    const keys = Reflect.ownKeys(input);
    if (
      keys.length !== COMMAND_FIELDS.length ||
      keys.some((key) => typeof key !== "string") ||
      [...keys].sort().some((key, index) => key !== COMMAND_FIELDS[index])
    ) {
      return rejectCommand();
    }

    const values = new Map<string, unknown>();
    for (const field of COMMAND_FIELDS) {
      const descriptor = Object.getOwnPropertyDescriptor(input, field);
      if (!descriptor || !("value" in descriptor) || !descriptor.enumerable) {
        return rejectCommand();
      }
      values.set(field, descriptor.value);
    }

    const authenticatedServerOwner = values.get("authenticatedServerOwner");
    const opaqueRecommendationReference = values.get("opaqueRecommendationReference");
    const canonicalCommandDigest = values.get("canonicalCommandDigest");

    if (
      typeof authenticatedServerOwner !== "string" ||
      typeof opaqueRecommendationReference !== "string" ||
      typeof canonicalCommandDigest !== "string" ||
      !CANONICAL_UUID.test(authenticatedServerOwner) ||
      !CANONICAL_UUID.test(opaqueRecommendationReference) ||
      !CANONICAL_COMMAND_DIGEST.test(canonicalCommandDigest) ||
      buildPositionVersionLineageV2WriterCanonicalCommandDigest({
        authenticated_server_owner: authenticatedServerOwner,
        contract_version:
          POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_SOURCE_CONTRACT_VERSION,
        opaque_recommendation_reference: opaqueRecommendationReference,
        routine_signature:
          POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_ROUTINE_SIGNATURE,
      }) !== canonicalCommandDigest
    ) {
      return rejectCommand();
    }

    return Object.freeze({
      authenticatedServerOwner,
      canonicalCommandDigest,
      opaqueRecommendationReference,
    });
  } catch {
    return rejectCommand();
  }
}

function createDefaultClient(
  configuration: Readonly<ClientConfig>,
): PositionVersionLineageV2WriterPrivatePostgresqlClient {
  return new Client(configuration);
}

function parseWriterResultInt8(value: string): string | 1 {
  // PostgreSQL's bigint wire type is parsed as a string by default. This
  // frozen routine can only return the initial version (1); preserve every
  // other value as text so the strict result decoder rejects it rather than
  // accepting a widened value.
  return value === "1" ? 1 : value;
}

const WRITER_RESULT_TYPE_OVERRIDES = Object.freeze({
  getTypeParser: (...args: Parameters<typeof types.getTypeParser>) => {
    const [oid, format] = args;

    if (oid === POSTGRES_INT8_OID && (format === "text" || format === undefined)) {
      return parseWriterResultInt8;
    }

    return types.getTypeParser(...args);
  },
});

function connectionConfiguration(
  connectionString: string,
  certificateAuthority: string,
): Readonly<ClientConfig> {
  const url = new URL(connectionString);

  // `pg` parses TLS options from a connection string after applying this
  // explicit configuration. Passing `sslmode` through would therefore replace
  // the supplied project CA with an empty TLS object. The input was already
  // admitted only when it required verify-full; remove that parser control
  // parameter so the explicit CA plus hostname-verifying TLS options remain
  // authoritative for the actual connection.
  url.searchParams.delete("sslmode");

  return Object.freeze({
    connectionString: url.toString(),
    connectionTimeoutMillis: 5_000,
    query_timeout: 5_000,
    statement_timeout: 5_000,
    ssl: Object.freeze({ ca: certificateAuthority, rejectUnauthorized: true }),
    types: WRITER_RESULT_TYPE_OVERRIDES,
  });
}

/**
 * Invokes exactly the frozen private V2 routine with a short-lived, server-only
 * PostgreSQL client. It has no route, UI, queue, deployment, or external-system
 * binding. Missing or widened configuration and command material fails before
 * a connection can be created.
 */
export async function executePositionVersionLineageV2WriterPrivatePostgresqlTransport(
  input: unknown,
  options: PositionVersionLineageV2WriterPrivatePostgresqlTransportOptions = {},
): Promise<PositionVersionLineageV2WriterImmutableCommittedResultReceipt> {
  const command = readValidatedCommand(input);
  const connectionString = readConnectionString(options.environment ?? process.env);
  const certificateAuthority = readCertificateAuthority(options.environment ?? process.env);
  const client = (options.clientFactory ?? createDefaultClient)(
    connectionConfiguration(connectionString, certificateAuthority),
  );

  let receipt: PositionVersionLineageV2WriterImmutableCommittedResultReceipt | null = null;
  let failed = false;

  try {
    await client.connect();
    const result = await client.query({
      name: "position-version-lineage-v2-writer-private-routine-v1",
      text: POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_POSTGRESQL_TRANSPORT_QUERY,
      values: [
        command.authenticatedServerOwner,
        command.opaqueRecommendationReference,
        command.canonicalCommandDigest,
      ],
    });

    if (result.rowCount !== 1 || result.rows.length !== 1) {
      failed = true;
      throw new PositionVersionLineageV2WriterPrivatePostgresqlTransportInvocationError();
    }

    const decodedResult = decodePositionVersionLineageV2WriterCommittedResult(
      result.rows[0],
      command.authenticatedServerOwner,
    );
    receipt = projectPositionVersionLineageV2WriterImmutableCommittedResultReceipt(
      decodedResult,
      command.canonicalCommandDigest,
    );
  } catch {
    failed = true;
  }

  try {
    await client.end();
  } catch {
    failed = true;
  }

  if (failed || receipt === null) {
    throw new PositionVersionLineageV2WriterPrivatePostgresqlTransportInvocationError();
  }

  return receipt;
}
