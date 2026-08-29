import "server-only";

import type { PositionVersionLineageV2WriterPrivateNonDataApiCommittedResult } from "../position-version-lineage-v2-writer-private-non-data-api-command-port-source-contract";

export const POSITION_VERSION_LINEAGE_V2_WRITER_IMMUTABLE_COMMITTED_RESULT_RECEIPT_VERSION =
  "position_version_lineage_v2_writer_immutable_committed_result_receipt_v1" as const;

const COMMITTED_RESULT_FIELDS = Object.freeze([
  "disposition",
  "initialHistoryIdentity",
  "positionId",
  "positionVersion",
] as const);

const CANONICAL_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const CANONICAL_COMMAND_DIGEST = /^[a-f0-9]{64}$/;

export type PositionVersionLineageV2WriterImmutableCommittedResultReceipt = Readonly<{
  canonicalCommandDigest: string;
  disposition: "created" | "replayed";
  initialHistoryIdentity: string;
  positionId: string;
  positionVersion: 1;
}>;

export class PositionVersionLineageV2WriterImmutableCommittedResultReceiptError extends Error {
  constructor() {
    super("invalid_position_version_lineage_v2_writer_immutable_committed_result_receipt");
    this.name = "PositionVersionLineageV2WriterImmutableCommittedResultReceiptError";
  }
}

function rejectReceipt(): never {
  throw new PositionVersionLineageV2WriterImmutableCommittedResultReceiptError();
}

function isExactFrozenDecodedResult(
  value: unknown,
): value is PositionVersionLineageV2WriterPrivateNonDataApiCommittedResult {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  if (
    prototype === null ||
    Object.getPrototypeOf(prototype) !== null ||
    !Object.isFrozen(value)
  ) {
    return false;
  }

  const keys = Reflect.ownKeys(value);
  if (
    keys.length !== COMMITTED_RESULT_FIELDS.length ||
    keys.some((key) => typeof key !== "string") ||
    [...keys].sort().some((key, index) => key !== COMMITTED_RESULT_FIELDS[index])
  ) {
    return false;
  }

  for (const field of COMMITTED_RESULT_FIELDS) {
    const descriptor = Object.getOwnPropertyDescriptor(value, field);
    if (
      !descriptor ||
      !("value" in descriptor) ||
      !descriptor.enumerable ||
      descriptor.configurable ||
      descriptor.writable
    ) {
      return false;
    }
  }

  return true;
}

function readValidatedReceipt(
  decodedResult: unknown,
  canonicalCommandDigest: unknown,
): PositionVersionLineageV2WriterImmutableCommittedResultReceipt {
  try {
    if (
      typeof canonicalCommandDigest !== "string" ||
      !CANONICAL_COMMAND_DIGEST.test(canonicalCommandDigest) ||
      !isExactFrozenDecodedResult(decodedResult)
    ) {
      return rejectReceipt();
    }

    const { disposition, initialHistoryIdentity, positionId, positionVersion } = decodedResult;
    const initialHistoryParts = initialHistoryIdentity.split(":");

    if (
      (disposition !== "created" && disposition !== "replayed") ||
      typeof positionId !== "string" ||
      !CANONICAL_UUID.test(positionId) ||
      positionVersion !== 1 ||
      initialHistoryParts.length !== 3 ||
      initialHistoryParts[0] !== positionId ||
      !CANONICAL_UUID.test(initialHistoryParts[1]) ||
      initialHistoryParts[2] !== "1"
    ) {
      return rejectReceipt();
    }

    return Object.freeze({
      canonicalCommandDigest,
      disposition,
      initialHistoryIdentity,
      positionId,
      positionVersion: 1 as const,
    });
  } catch {
    return rejectReceipt();
  }
}

/**
 * Projects only previously decoded V2 committed-result scalars and an existing
 * canonical command digest into a fresh, frozen in-memory receipt. It performs
 * no I/O, identity resolution, transport, persistence or runtime binding.
 */
export function projectPositionVersionLineageV2WriterImmutableCommittedResultReceipt(
  decodedResult: unknown,
  canonicalCommandDigest: unknown,
): PositionVersionLineageV2WriterImmutableCommittedResultReceipt {
  return readValidatedReceipt(decodedResult, canonicalCommandDigest);
}
