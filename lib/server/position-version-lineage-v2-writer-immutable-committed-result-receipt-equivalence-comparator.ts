import "server-only";

import type { PositionVersionLineageV2WriterImmutableCommittedResultReceipt } from "./position-version-lineage-v2-writer-immutable-committed-result-receipt";

export const POSITION_VERSION_LINEAGE_V2_WRITER_IMMUTABLE_COMMITTED_RESULT_RECEIPT_EQUIVALENCE_COMPARATOR_VERSION =
  "position_version_lineage_v2_writer_immutable_committed_result_receipt_equivalence_comparator_v1" as const;

const RECEIPT_FIELDS = Object.freeze([
  "canonicalCommandDigest",
  "disposition",
  "initialHistoryIdentity",
  "positionId",
  "positionVersion",
] as const);

const CANONICAL_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const CANONICAL_COMMAND_DIGEST = /^[a-f0-9]{64}$/;

export type PositionVersionLineageV2WriterImmutableCommittedResultReceiptEquivalenceVerdict =
  Readonly<{
    equivalent: boolean;
  }>;

export class PositionVersionLineageV2WriterImmutableCommittedResultReceiptEquivalenceComparatorError extends Error {
  constructor() {
    super(
      "invalid_position_version_lineage_v2_writer_immutable_committed_result_receipt_equivalence_input",
    );
    this.name =
      "PositionVersionLineageV2WriterImmutableCommittedResultReceiptEquivalenceComparatorError";
  }
}

function rejectReceipt(): never {
  throw new PositionVersionLineageV2WriterImmutableCommittedResultReceiptEquivalenceComparatorError();
}

function isExactFrozenReceipt(
  value: unknown,
): value is PositionVersionLineageV2WriterImmutableCommittedResultReceipt {
  try {
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      return false;
    }

    if (
      Object.getPrototypeOf(value) !== Object.prototype ||
      !Object.isFrozen(value)
    ) {
      return false;
    }

    const keys = Reflect.ownKeys(value);
    if (
      keys.length !== RECEIPT_FIELDS.length ||
      keys.some((key) => typeof key !== "string") ||
      [...keys].sort().some((key, index) => key !== RECEIPT_FIELDS[index])
    ) {
      return false;
    }

    const descriptors = Object.getOwnPropertyDescriptors(value);
    for (const field of RECEIPT_FIELDS) {
      const descriptor = descriptors[field];
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

    const canonicalCommandDigest = descriptors.canonicalCommandDigest.value;
    const disposition = descriptors.disposition.value;
    const initialHistoryIdentity = descriptors.initialHistoryIdentity.value;
    const positionId = descriptors.positionId.value;
    const positionVersion = descriptors.positionVersion.value;
    const initialHistoryParts =
      typeof initialHistoryIdentity === "string"
        ? initialHistoryIdentity.split(":")
        : [];

    return (
      typeof canonicalCommandDigest === "string" &&
      CANONICAL_COMMAND_DIGEST.test(canonicalCommandDigest) &&
      (disposition === "created" || disposition === "replayed") &&
      typeof positionId === "string" &&
      CANONICAL_UUID.test(positionId) &&
      positionVersion === 1 &&
      initialHistoryParts.length === 3 &&
      initialHistoryParts[0] === positionId &&
      CANONICAL_UUID.test(initialHistoryParts[1]) &&
      initialHistoryParts[2] === "1"
    );
  } catch {
    return false;
  }
}

function readValidatedReceipt(
  value: unknown,
): PositionVersionLineageV2WriterImmutableCommittedResultReceipt {
  if (!isExactFrozenReceipt(value)) {
    return rejectReceipt();
  }

  return value;
}

/**
 * Compares only the already frozen V2 committed-result receipt scalars. It
 * performs no I/O, storage, identity resolution, transport or runtime binding.
 */
export function comparePositionVersionLineageV2WriterImmutableCommittedResultReceipts(
  left: unknown,
  right: unknown,
): PositionVersionLineageV2WriterImmutableCommittedResultReceiptEquivalenceVerdict {
  try {
    const leftReceipt = readValidatedReceipt(left);
    const rightReceipt = readValidatedReceipt(right);

    return Object.freeze({
      equivalent:
        leftReceipt.canonicalCommandDigest === rightReceipt.canonicalCommandDigest &&
        leftReceipt.disposition === rightReceipt.disposition &&
        leftReceipt.initialHistoryIdentity === rightReceipt.initialHistoryIdentity &&
        leftReceipt.positionId === rightReceipt.positionId &&
        leftReceipt.positionVersion === rightReceipt.positionVersion,
    });
  } catch {
    return rejectReceipt();
  }
}
