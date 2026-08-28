import "server-only";

import {
  POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_RESULT_MAPPING,
  type PositionVersionLineageV2WriterPrivateNonDataApiCommittedResult,
} from "../position-version-lineage-v2-writer-private-non-data-api-command-port-source-contract";

export const POSITION_VERSION_LINEAGE_V2_WRITER_STRICT_COMMITTED_RESULT_DECODER_VERSION =
  "position_version_lineage_v2_writer_strict_committed_result_decoder_v1" as const;

const RESULT_WIRE_COLUMNS = Object.freeze(
  [...POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_RESULT_MAPPING.wireColumns].sort(),
);

const CANONICAL_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export class PositionVersionLineageV2WriterStrictCommittedResultDecoderError extends Error {
  constructor() {
    super("invalid_position_version_lineage_v2_writer_committed_result");
    this.name = "PositionVersionLineageV2WriterStrictCommittedResultDecoderError";
  }
}

function rejectResult(): never {
  throw new PositionVersionLineageV2WriterStrictCommittedResultDecoderError();
}

function isExactPlainRecord(value: unknown): value is Record<PropertyKey, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return (
    prototype !== null &&
    Object.getPrototypeOf(prototype) === null
  );
}

function readValidatedCommittedResult(
  rawResult: unknown,
  authenticatedServerOwner: unknown,
): PositionVersionLineageV2WriterPrivateNonDataApiCommittedResult {
  try {
    if (
      typeof authenticatedServerOwner !== "string" ||
      !CANONICAL_UUID.test(authenticatedServerOwner) ||
      !isExactPlainRecord(rawResult)
    ) {
      return rejectResult();
    }

    const keys = Reflect.ownKeys(rawResult);
    if (
      keys.length !== RESULT_WIRE_COLUMNS.length ||
      keys.some((key) => typeof key !== "string") ||
      [...keys].sort().some((key, index) => key !== RESULT_WIRE_COLUMNS[index])
    ) {
      return rejectResult();
    }

    const values = new Map<string, unknown>();
    for (const column of RESULT_WIRE_COLUMNS) {
      const descriptor = Object.getOwnPropertyDescriptor(rawResult, column);
      if (!descriptor || !("value" in descriptor) || !descriptor.enumerable) {
        return rejectResult();
      }
      values.set(column, descriptor.value);
    }

    const disposition = values.get("disposition");
    const positionId = values.get("position_id");
    const positionVersion = values.get("position_version");
    const initialHistoryIdentity = values.get("initial_history_identity");

    if (
      (disposition !== "created" && disposition !== "replayed") ||
      typeof positionId !== "string" ||
      !CANONICAL_UUID.test(positionId) ||
      positionVersion !==
        POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_RESULT_MAPPING.initialPositionVersion ||
      typeof initialHistoryIdentity !== "string" ||
      initialHistoryIdentity !== `${positionId}:${authenticatedServerOwner}:${positionVersion}`
    ) {
      return rejectResult();
    }

    return Object.freeze({
      disposition,
      initialHistoryIdentity,
      positionId,
      positionVersion: 1 as const,
    });
  } catch {
    return rejectResult();
  }
}

/**
 * Decodes only the frozen V2 committed-result wire shape. It deliberately
 * performs no I/O, credential lookup, transport call, writer invocation or
 * runtime binding. Invalid or widened material fails closed.
 */
export function decodePositionVersionLineageV2WriterCommittedResult(
  rawResult: unknown,
  authenticatedServerOwner: unknown,
): PositionVersionLineageV2WriterPrivateNonDataApiCommittedResult {
  return readValidatedCommittedResult(rawResult, authenticatedServerOwner);
}
