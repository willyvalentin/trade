import "server-only";

import { timingSafeEqual } from "node:crypto";

import {
  POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_ROUTINE_SIGNATURE,
  POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_SOURCE_CONTRACT_VERSION,
  type PositionVersionLineageV2WriterPrivateNonDataApiCommand,
} from "../position-version-lineage-v2-writer-private-non-data-api-command-port-source-contract";
import { buildPositionVersionLineageV2WriterCanonicalCommandDigest } from "./position-version-lineage-v2-writer-canonical-command-digest";
import {
  executePositionVersionLineageV2WriterPrivatePostgresqlRollbackProof,
} from "./position-version-lineage-v2-writer-private-postgresql-transport";
import type { PositionVersionLineageV2WriterImmutableCommittedResultReceipt } from "./position-version-lineage-v2-writer-immutable-committed-result-receipt";

export const POSITION_VERSION_LINEAGE_V2_WRITER_STAGING_ROLLBACK_PROOF_VERSION =
  "position_version_lineage_v2_writer_staging_rollback_proof_v1" as const;

export const POSITION_VERSION_LINEAGE_V2_WRITER_STAGING_PROOF_TOKEN_SECRET =
  "TURE_POSITION_VERSION_LINEAGE_V2_WRITER_STAGING_PROOF_TOKEN" as const;

export const POSITION_VERSION_LINEAGE_V2_WRITER_STAGING_PROOF_OWNER_ID_SECRET =
  "TURE_POSITION_VERSION_LINEAGE_V2_WRITER_STAGING_PROOF_OWNER_ID" as const;

export const POSITION_VERSION_LINEAGE_V2_WRITER_STAGING_PROOF_RECOMMENDATION_ID_SECRET =
  "TURE_POSITION_VERSION_LINEAGE_V2_WRITER_STAGING_PROOF_RECOMMENDATION_ID" as const;

const CANONICAL_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const PROOF_TOKEN = /^[a-f0-9]{64}$/;

type StagingRollbackProofConfiguration = Readonly<{
  authenticatedServerOwner: string;
  opaqueRecommendationReference: string;
  token: string;
}>;

export type PositionVersionLineageV2WriterStagingRollbackProofDependencies = Readonly<{
  executeRollbackProof: (
    command: PositionVersionLineageV2WriterPrivateNonDataApiCommand,
  ) => Promise<PositionVersionLineageV2WriterImmutableCommittedResultReceipt>;
}>;

export class PositionVersionLineageV2WriterStagingRollbackProofAuthorizationError extends Error {
  constructor() {
    super("position_version_lineage_v2_writer_staging_rollback_proof_not_authorized");
    this.name = "PositionVersionLineageV2WriterStagingRollbackProofAuthorizationError";
  }
}

export class PositionVersionLineageV2WriterStagingRollbackProofUnavailableError extends Error {
  constructor() {
    super("position_version_lineage_v2_writer_staging_rollback_proof_unavailable");
    this.name = "PositionVersionLineageV2WriterStagingRollbackProofUnavailableError";
  }
}

function rejectAuthorization(): never {
  throw new PositionVersionLineageV2WriterStagingRollbackProofAuthorizationError();
}

function rejectUnavailable(): never {
  throw new PositionVersionLineageV2WriterStagingRollbackProofUnavailableError();
}

function exactUuid(value: string | undefined): string {
  if (
    typeof value !== "string" ||
    value.length !== 36 ||
    value !== value.toLowerCase() ||
    !CANONICAL_UUID.test(value)
  ) {
    return rejectUnavailable();
  }

  return value;
}

function readConfiguration(
  environment: Readonly<Record<string, string | undefined>>,
): StagingRollbackProofConfiguration {
  const token = environment[POSITION_VERSION_LINEAGE_V2_WRITER_STAGING_PROOF_TOKEN_SECRET];
  if (typeof token !== "string" || token.length !== 64 || !PROOF_TOKEN.test(token)) {
    return rejectUnavailable();
  }

  return Object.freeze({
    authenticatedServerOwner: exactUuid(
      environment[POSITION_VERSION_LINEAGE_V2_WRITER_STAGING_PROOF_OWNER_ID_SECRET],
    ),
    opaqueRecommendationReference: exactUuid(
      environment[POSITION_VERSION_LINEAGE_V2_WRITER_STAGING_PROOF_RECOMMENDATION_ID_SECRET],
    ),
    token,
  });
}

function authorize(suppliedToken: string | null, expectedToken: string) {
  if (
    typeof suppliedToken !== "string" ||
    suppliedToken.length !== expectedToken.length ||
    !PROOF_TOKEN.test(suppliedToken) ||
    !timingSafeEqual(Buffer.from(suppliedToken), Buffer.from(expectedToken))
  ) {
    return rejectAuthorization();
  }
}

const DEFAULT_DEPENDENCIES: PositionVersionLineageV2WriterStagingRollbackProofDependencies =
  Object.freeze({
    executeRollbackProof:
      executePositionVersionLineageV2WriterPrivatePostgresqlRollbackProof,
  });

/**
 * Executes one fixed staging fixture through the private writer in a mandatory
 * rollback transaction. Neither the owner nor recommendation may be supplied
 * by a request, and the return value deliberately withholds database IDs.
 */
export async function runPositionVersionLineageV2WriterStagingRollbackProof(
  suppliedToken: string | null,
  options: Readonly<{
    dependencies?: PositionVersionLineageV2WriterStagingRollbackProofDependencies;
    environment?: Readonly<Record<string, string | undefined>>;
  }> = {},
): Promise<Readonly<{ outcome: "rolled_back" }>> {
  const configuration = readConfiguration(options.environment ?? process.env);
  authorize(suppliedToken, configuration.token);

  const command = Object.freeze({
    authenticatedServerOwner: configuration.authenticatedServerOwner,
    canonicalCommandDigest: buildPositionVersionLineageV2WriterCanonicalCommandDigest({
      authenticated_server_owner: configuration.authenticatedServerOwner,
      contract_version:
        POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_SOURCE_CONTRACT_VERSION,
      opaque_recommendation_reference: configuration.opaqueRecommendationReference,
      routine_signature:
        POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_ROUTINE_SIGNATURE,
    }),
    opaqueRecommendationReference: configuration.opaqueRecommendationReference,
  });

  try {
    await (options.dependencies ?? DEFAULT_DEPENDENCIES).executeRollbackProof(command);
  } catch {
    return rejectUnavailable();
  }

  return Object.freeze({ outcome: "rolled_back" });
}
