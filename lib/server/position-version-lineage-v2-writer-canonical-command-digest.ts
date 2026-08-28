import "server-only";

import { createHash } from "node:crypto";

import {
  POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_ROUTINE_SIGNATURE,
  POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_SOURCE_CONTRACT_VERSION,
} from "../position-version-lineage-v2-writer-private-non-data-api-command-port-source-contract";

export const POSITION_VERSION_LINEAGE_V2_WRITER_CANONICAL_COMMAND_DIGEST_BUILDER_VERSION =
  "position_version_lineage_v2_writer_canonical_command_digest_builder_v1" as const;

const CANONICAL_COMMAND_DIGEST_FIELDS = Object.freeze([
  "authenticated_server_owner",
  "contract_version",
  "opaque_recommendation_reference",
  "routine_signature",
] as const);

const CANONICAL_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export type PositionVersionLineageV2WriterCanonicalCommandDigestInput = Readonly<{
  contract_version: typeof POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_SOURCE_CONTRACT_VERSION;
  routine_signature: typeof POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_ROUTINE_SIGNATURE;
  authenticated_server_owner: string;
  opaque_recommendation_reference: string;
}>;

export class PositionVersionLineageV2WriterCanonicalCommandDigestInputError extends Error {
  constructor() {
    super("invalid_position_version_lineage_v2_writer_canonical_command_digest_input");
    this.name = "PositionVersionLineageV2WriterCanonicalCommandDigestInputError";
  }
}

function rejectInput(): never {
  throw new PositionVersionLineageV2WriterCanonicalCommandDigestInputError();
}

function isExactPlainRecord(value: unknown): value is Record<PropertyKey, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.prototype.toString.call(value) === "[object Object]";
}

function readValidatedInput(
  input: unknown,
): PositionVersionLineageV2WriterCanonicalCommandDigestInput {
  if (!isExactPlainRecord(input)) {
    return rejectInput();
  }

  const keys = Reflect.ownKeys(input);
  if (
    keys.length !== CANONICAL_COMMAND_DIGEST_FIELDS.length ||
    keys.some((key) => typeof key !== "string") ||
    [...keys].sort().some((key, index) => key !== CANONICAL_COMMAND_DIGEST_FIELDS[index])
  ) {
    return rejectInput();
  }

  const values = new Map<string, unknown>();
  for (const field of CANONICAL_COMMAND_DIGEST_FIELDS) {
    const descriptor = Object.getOwnPropertyDescriptor(input, field);
    if (!descriptor || !("value" in descriptor) || !descriptor.enumerable) {
      return rejectInput();
    }
    values.set(field, descriptor.value);
  }

  const contractVersion = values.get("contract_version");
  const routineSignature = values.get("routine_signature");
  const authenticatedServerOwner = values.get("authenticated_server_owner");
  const opaqueRecommendationReference = values.get("opaque_recommendation_reference");

  if (
    contractVersion !==
      POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_SOURCE_CONTRACT_VERSION ||
    routineSignature !==
      POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_ROUTINE_SIGNATURE ||
    typeof authenticatedServerOwner !== "string" ||
    typeof opaqueRecommendationReference !== "string" ||
    !CANONICAL_UUID.test(authenticatedServerOwner) ||
    !CANONICAL_UUID.test(opaqueRecommendationReference)
  ) {
    return rejectInput();
  }

  return Object.freeze({
    authenticated_server_owner: authenticatedServerOwner,
    contract_version: contractVersion,
    opaque_recommendation_reference: opaqueRecommendationReference,
    routine_signature: routineSignature,
  });
}

/**
 * Builds the frozen V2 private-command digest and deliberately performs no I/O
 * or runtime binding. Invalid, non-canonical or widened input fails closed.
 */
export function buildPositionVersionLineageV2WriterCanonicalCommandDigest(
  input: unknown,
): string {
  const canonicalInput = readValidatedInput(input);
  const canonicalJson = JSON.stringify(canonicalInput);

  return createHash("sha256").update(canonicalJson, "utf8").digest("hex");
}
