import "server-only";

import {
  POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_ROUTINE_SIGNATURE,
  POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_SOURCE_CONTRACT_VERSION,
  type PositionVersionLineageV2WriterPrivateNonDataApiCommand,
} from "../position-version-lineage-v2-writer-private-non-data-api-command-port-source-contract";
import { buildPositionVersionLineageV2WriterCanonicalCommandDigest } from "./position-version-lineage-v2-writer-canonical-command-digest";
import {
  resolvePositionVersionLineageV2WriterAuthenticatedServerOwnerContext,
  type PositionVersionLineageV2WriterAuthenticatedServerOwnerContext,
} from "./position-version-lineage-v2-writer-authenticated-server-owner-context";
import {
  executePositionVersionLineageV2WriterPrivatePostgresqlTransport,
} from "./position-version-lineage-v2-writer-private-postgresql-transport";
import type { PositionVersionLineageV2WriterImmutableCommittedResultReceipt } from "./position-version-lineage-v2-writer-immutable-committed-result-receipt";

export const POSITION_VERSION_LINEAGE_V2_WRITER_AUTHENTICATED_SERVER_COMMAND_PORT_VERSION =
  "position_version_lineage_v2_writer_authenticated_server_command_port_v1" as const;

const CANONICAL_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const COMMAND_FIELDS = Object.freeze(["opaqueRecommendationReference"] as const);

export type PositionVersionLineageV2WriterAuthenticatedServerCommandPortDependencies =
  Readonly<{
    resolveAuthenticatedServerOwnerContext: () => Promise<PositionVersionLineageV2WriterAuthenticatedServerOwnerContext | null>;
    executePrivateTransport: (
      command: PositionVersionLineageV2WriterPrivateNonDataApiCommand,
    ) => Promise<PositionVersionLineageV2WriterImmutableCommittedResultReceipt>;
  }>;

export class PositionVersionLineageV2WriterAuthenticatedServerCommandPortInputError extends Error {
  constructor() {
    super("invalid_position_version_lineage_v2_writer_authenticated_server_command_port_input");
    this.name = "PositionVersionLineageV2WriterAuthenticatedServerCommandPortInputError";
  }
}

export class PositionVersionLineageV2WriterAuthenticatedServerCommandPortAuthenticationError extends Error {
  constructor() {
    super("position_version_lineage_v2_writer_authenticated_server_owner_required");
    this.name = "PositionVersionLineageV2WriterAuthenticatedServerCommandPortAuthenticationError";
  }
}

function rejectInput(): never {
  throw new PositionVersionLineageV2WriterAuthenticatedServerCommandPortInputError();
}

function isExactPlainRecord(value: unknown): value is Record<PropertyKey, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype !== null && Object.getPrototypeOf(prototype) === null;
}

function readOpaqueRecommendationReference(input: unknown): string {
  if (!isExactPlainRecord(input)) return rejectInput();

  const keys = Reflect.ownKeys(input);
  if (
    keys.length !== COMMAND_FIELDS.length ||
    keys.some((key) => typeof key !== "string") ||
    [...keys].sort().some((key, index) => key !== COMMAND_FIELDS[index])
  ) {
    return rejectInput();
  }

  const descriptor = Object.getOwnPropertyDescriptor(input, "opaqueRecommendationReference");
  if (!descriptor || !("value" in descriptor) || !descriptor.enumerable) {
    return rejectInput();
  }

  const opaqueRecommendationReference = descriptor.value;
  if (
    typeof opaqueRecommendationReference !== "string" ||
    !CANONICAL_UUID.test(opaqueRecommendationReference)
  ) {
    return rejectInput();
  }

  return opaqueRecommendationReference;
}

const DEFAULT_DEPENDENCIES: PositionVersionLineageV2WriterAuthenticatedServerCommandPortDependencies =
  Object.freeze({
    resolveAuthenticatedServerOwnerContext:
      resolvePositionVersionLineageV2WriterAuthenticatedServerOwnerContext,
    executePrivateTransport:
      executePositionVersionLineageV2WriterPrivatePostgresqlTransport,
  });

/**
 * Binds a writer command to exactly one verified server-session owner.
 *
 * This server-only adapter accepts only an opaque recommendation reference;
 * it neither accepts nor derives an owner from request input. It has no route,
 * UI, queue, deployment, provider, broker, or production binding. A caller is
 * still separately required before any live invocation can occur.
 */
export async function executePositionVersionLineageV2WriterAuthenticatedServerCommandPort(
  input: unknown,
  dependencies: PositionVersionLineageV2WriterAuthenticatedServerCommandPortDependencies =
    DEFAULT_DEPENDENCIES,
): Promise<PositionVersionLineageV2WriterImmutableCommittedResultReceipt> {
  const opaqueRecommendationReference = readOpaqueRecommendationReference(input);
  const ownerContext = await dependencies.resolveAuthenticatedServerOwnerContext();

  if (
    !ownerContext ||
    !isExactPlainRecord(ownerContext) ||
    Reflect.ownKeys(ownerContext).length !== 1 ||
    typeof ownerContext.authenticatedServerOwner !== "string" ||
    !CANONICAL_UUID.test(ownerContext.authenticatedServerOwner)
  ) {
    throw new PositionVersionLineageV2WriterAuthenticatedServerCommandPortAuthenticationError();
  }

  const authenticatedServerOwner = ownerContext.authenticatedServerOwner;
  const canonicalCommandDigest = buildPositionVersionLineageV2WriterCanonicalCommandDigest({
    authenticated_server_owner: authenticatedServerOwner,
    contract_version:
      POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_SOURCE_CONTRACT_VERSION,
    opaque_recommendation_reference: opaqueRecommendationReference,
    routine_signature:
      POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_ROUTINE_SIGNATURE,
  });

  return dependencies.executePrivateTransport({
    authenticatedServerOwner,
    canonicalCommandDigest,
    opaqueRecommendationReference,
  });
}
