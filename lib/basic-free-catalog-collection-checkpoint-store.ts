export const basicFreeCatalogCollectionCheckpointContractVersion =
  "basic_free_catalog_collection_checkpoint_v1" as const;
export const basicFreeCatalogCollectionCheckpointStartRpcName =
  "start_basic_free_catalog_collection" as const;
export const basicFreeCatalogCollectionCheckpointRecordRpcName =
  "record_basic_free_catalog_collection_page" as const;
export const basicFreeCatalogCollectionCheckpointReadRpcName =
  "read_basic_free_catalog_collection_checkpoint" as const;

export const BASIC_FREE_CATALOG_COLLECTION_PAGE_SIZE = 8;
export const BASIC_FREE_CATALOG_COLLECTION_MAX_DENOMINATOR = 1_000_000;
export const BASIC_FREE_CATALOG_COLLECTION_MAX_RAW_PAGE_BYTES = 65_536;

export type BasicFreeCatalogCollectionCheckpoint = {
  collection_id: string;
  collection_fingerprint: string;
  owner_user_id: string;
  collection_status: "collecting" | "complete";
  provider_catalog_count: number;
  page_size: typeof BASIC_FREE_CATALOG_COLLECTION_PAGE_SIZE;
  total_pages: number;
  next_page: number;
  completed_page_count: number;
  collected_record_count: number;
  snapshot_observed_at: string;
  last_page_observed_at: string | null;
  completed_at: string | null;
};

export type BasicFreeCatalogCollectionStartInput = {
  collection_fingerprint: string;
  owner_user_id: string;
  provider_catalog_count: number;
  page_size: number;
  snapshot_observed_at: string;
};

export type BasicFreeCatalogCollectionRecordInput = {
  checkpoint: BasicFreeCatalogCollectionCheckpoint;
  page_number: number;
  provider_catalog_count: number;
  raw_records: Record<string, unknown>[];
  observed_at: string;
};

export type BasicFreeCatalogCollectionReadInput = {
  collection_fingerprint: string;
  owner_user_id: string;
};

type BasicFreeCatalogCollectionStartRow = {
  collection_status: string;
  collection_id: string | null;
  idempotent: boolean;
  next_page: number | null;
  total_pages: number | null;
  completed_page_count: number | null;
  collected_record_count: number | null;
  blocker: string | null;
};

type BasicFreeCatalogCollectionRecordRow = {
  page_status: string;
  collection_status: string;
  next_page: number | null;
  completed_page_count: number | null;
  collected_record_count: number | null;
  collection_complete: boolean;
  blocker: string | null;
};

type BasicFreeCatalogCollectionReadRow = {
  readback_status: string;
  collection_id: string | null;
  collection_status: string | null;
  provider_catalog_count: number | null;
  page_size: number | null;
  total_pages: number | null;
  next_page: number | null;
  completed_page_count: number | null;
  collected_record_count: number | null;
  snapshot_observed_at: string | null;
  last_page_observed_at: string | null;
  completed_at: string | null;
  blocker: string | null;
};

export type BasicFreeCatalogCollectionCheckpointDatabase = {
  start: (input: BasicFreeCatalogCollectionStartInput) => Promise<{
    data: BasicFreeCatalogCollectionStartRow | null;
    error: { code?: string } | null;
  }>;
  record: (input: {
    collection_id: string;
    owner_user_id: string;
    page_number: number;
    provider_catalog_count: number;
    raw_records: Record<string, unknown>[];
    observed_at: string;
  }) => Promise<{
    data: BasicFreeCatalogCollectionRecordRow | null;
    error: { code?: string } | null;
  }>;
  read: (input: BasicFreeCatalogCollectionReadInput) => Promise<{
    data: BasicFreeCatalogCollectionReadRow | null;
    error: { code?: string } | null;
  }>;
};

export type BasicFreeCatalogCollectionStartResult =
  | {
      status: "started" | "available";
      checkpoint: BasicFreeCatalogCollectionCheckpoint;
      idempotent: boolean;
      safe_blocker: null;
    }
  | {
      status: "unavailable";
      checkpoint: null;
      idempotent: null;
      safe_blocker: string;
    };

export type BasicFreeCatalogCollectionRecordResult =
  | {
      status: "recorded" | "already_recorded" | "already_complete";
      checkpoint: BasicFreeCatalogCollectionCheckpoint;
      safe_blocker: null;
    }
  | {
      status: "unavailable";
      checkpoint: BasicFreeCatalogCollectionCheckpoint | null;
      safe_blocker: string;
    };

export type BasicFreeCatalogCollectionReadResult =
  | {
      status: "available";
      checkpoint: BasicFreeCatalogCollectionCheckpoint;
      safe_blocker: null;
    }
  | {
      status: "not_found" | "unavailable";
      checkpoint: null;
      safe_blocker: string;
    };

function validUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function validFingerprint(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 240;
}

function validIso(value: unknown): value is string {
  return typeof value === "string" &&
    value.length > 0 &&
    Number.isFinite(Date.parse(value));
}

function positiveInteger(value: unknown): value is number {
  return typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value > 0;
}

function validDenominator(value: unknown): value is number {
  return positiveInteger(value) && value <= BASIC_FREE_CATALOG_COLLECTION_MAX_DENOMINATOR;
}

function totalPagesFor(denominator: number) {
  return Math.ceil(denominator / BASIC_FREE_CATALOG_COLLECTION_PAGE_SIZE);
}

function rawPageIsJsonObjectArray(value: unknown): value is Record<string, unknown>[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > BASIC_FREE_CATALOG_COLLECTION_PAGE_SIZE) {
    return false;
  }
  if (!value.every(isJsonObject)) return false;
  try {
    return new TextEncoder().encode(JSON.stringify(value)).byteLength <=
      BASIC_FREE_CATALOG_COLLECTION_MAX_RAW_PAGE_BYTES;
  } catch {
    return false;
  }
}

function isJsonObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return false;
  return Object.values(value).every(isJsonValue);
}

function isJsonValue(value: unknown): boolean {
  if (value === null || typeof value === "string" || typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(isJsonValue);
  return isJsonObject(value);
}

function validCheckpoint(value: BasicFreeCatalogCollectionCheckpoint | null): value is BasicFreeCatalogCollectionCheckpoint {
  if (!value ||
    !validUuid(value.collection_id) ||
    !validFingerprint(value.collection_fingerprint) ||
    !validUuid(value.owner_user_id) ||
    !validDenominator(value.provider_catalog_count) ||
    value.page_size !== BASIC_FREE_CATALOG_COLLECTION_PAGE_SIZE ||
    value.total_pages !== totalPagesFor(value.provider_catalog_count) ||
    !positiveInteger(value.next_page) ||
    !Number.isSafeInteger(value.completed_page_count) ||
    value.completed_page_count < 0 ||
    value.completed_page_count !== value.next_page - 1 ||
    !Number.isSafeInteger(value.collected_record_count) ||
    value.collected_record_count < 0 ||
    value.collected_record_count > value.provider_catalog_count ||
    !validIso(value.snapshot_observed_at) ||
    (value.last_page_observed_at !== null && !validIso(value.last_page_observed_at)) ||
    (value.completed_at !== null && !validIso(value.completed_at))) {
    return false;
  }

  if (value.collection_status === "collecting") {
    return value.completed_page_count < value.total_pages &&
      value.next_page <= value.total_pages &&
      value.completed_at === null;
  }
  return value.collection_status === "complete" &&
    value.completed_page_count === value.total_pages &&
    value.next_page === value.total_pages + 1 &&
    value.collected_record_count === value.provider_catalog_count &&
    value.completed_at !== null;
}

function checkpointFromStartRow(
  row: BasicFreeCatalogCollectionStartRow,
  input: BasicFreeCatalogCollectionStartInput,
): BasicFreeCatalogCollectionCheckpoint | null {
  const checkpoint: BasicFreeCatalogCollectionCheckpoint = {
    collection_id: row.collection_id ?? "",
    collection_fingerprint: input.collection_fingerprint,
    owner_user_id: input.owner_user_id,
    collection_status: "collecting",
    provider_catalog_count: input.provider_catalog_count,
    page_size: BASIC_FREE_CATALOG_COLLECTION_PAGE_SIZE,
    total_pages: row.total_pages ?? 0,
    next_page: row.next_page ?? 0,
    completed_page_count: row.completed_page_count ?? -1,
    collected_record_count: row.collected_record_count ?? -1,
    snapshot_observed_at: input.snapshot_observed_at,
    last_page_observed_at: null,
    completed_at: null,
  };
  return validCheckpoint(checkpoint) ? checkpoint : null;
}

function checkpointFromReadRow(
  row: BasicFreeCatalogCollectionReadRow,
  input: BasicFreeCatalogCollectionReadInput,
): BasicFreeCatalogCollectionCheckpoint | null {
  const checkpoint: BasicFreeCatalogCollectionCheckpoint = {
    collection_id: row.collection_id ?? "",
    collection_fingerprint: input.collection_fingerprint,
    owner_user_id: input.owner_user_id,
    collection_status: row.collection_status === "complete" ? "complete" : "collecting",
    provider_catalog_count: row.provider_catalog_count ?? 0,
    page_size: row.page_size as typeof BASIC_FREE_CATALOG_COLLECTION_PAGE_SIZE,
    total_pages: row.total_pages ?? 0,
    next_page: row.next_page ?? 0,
    completed_page_count: row.completed_page_count ?? -1,
    collected_record_count: row.collected_record_count ?? -1,
    snapshot_observed_at: row.snapshot_observed_at ?? "",
    last_page_observed_at: row.last_page_observed_at,
    completed_at: row.completed_at,
  };
  return validCheckpoint(checkpoint) ? checkpoint : null;
}

function unavailableStart(
  safeBlocker = "basic_free_catalog_collection_checkpoint_unavailable",
): BasicFreeCatalogCollectionStartResult {
  return {
    status: "unavailable",
    checkpoint: null,
    idempotent: null,
    safe_blocker: safeBlocker,
  };
}

function unavailableRecord(
  checkpoint: BasicFreeCatalogCollectionCheckpoint | null = null,
): BasicFreeCatalogCollectionRecordResult {
  return {
    status: "unavailable",
    checkpoint,
    safe_blocker: "basic_free_catalog_collection_checkpoint_unavailable",
  };
}

function unavailableRead(): BasicFreeCatalogCollectionReadResult {
  return {
    status: "unavailable",
    checkpoint: null,
    safe_blocker: "basic_free_catalog_collection_checkpoint_unavailable",
  };
}

function validStartInput(input: BasicFreeCatalogCollectionStartInput) {
  return validFingerprint(input.collection_fingerprint) &&
    validUuid(input.owner_user_id) &&
    validDenominator(input.provider_catalog_count) &&
    input.page_size === BASIC_FREE_CATALOG_COLLECTION_PAGE_SIZE &&
    validIso(input.snapshot_observed_at);
}

function expectedPageRecordCount(
  checkpoint: BasicFreeCatalogCollectionCheckpoint,
  pageNumber: number,
) {
  return Math.min(
    checkpoint.page_size,
    checkpoint.provider_catalog_count - ((pageNumber - 1) * checkpoint.page_size),
  );
}

function validRecordInput(input: BasicFreeCatalogCollectionRecordInput) {
  return validCheckpoint(input.checkpoint) &&
    positiveInteger(input.page_number) &&
    input.page_number <= input.checkpoint.total_pages &&
    input.page_number <= input.checkpoint.next_page &&
    input.provider_catalog_count === input.checkpoint.provider_catalog_count &&
    validIso(input.observed_at) &&
    Date.parse(input.observed_at) >= Date.parse(input.checkpoint.snapshot_observed_at) &&
    rawPageIsJsonObjectArray(input.raw_records) &&
    input.raw_records.length === expectedPageRecordCount(input.checkpoint, input.page_number);
}

function checkpointAfterRecord(
  checkpoint: BasicFreeCatalogCollectionCheckpoint,
  input: BasicFreeCatalogCollectionRecordInput,
  row: BasicFreeCatalogCollectionRecordRow,
): BasicFreeCatalogCollectionCheckpoint | null {
  const completedPageCount = checkpoint.completed_page_count + 1;
  const collectedRecordCount = checkpoint.collected_record_count + input.raw_records.length;
  const complete = completedPageCount === checkpoint.total_pages &&
    collectedRecordCount === checkpoint.provider_catalog_count;
  if (
    row.next_page !== checkpoint.next_page + 1 ||
    row.completed_page_count !== completedPageCount ||
    row.collected_record_count !== collectedRecordCount ||
    row.collection_complete !== complete ||
    row.collection_status !== (complete ? "complete" : "collecting")
  ) {
    return null;
  }

  const next: BasicFreeCatalogCollectionCheckpoint = {
    ...checkpoint,
    collection_status: complete ? "complete" : "collecting",
    next_page: row.next_page,
    completed_page_count: row.completed_page_count,
    collected_record_count: row.collected_record_count,
    last_page_observed_at: input.observed_at,
    completed_at: complete ? input.observed_at : null,
  };
  return validCheckpoint(next) ? next : null;
}

function checkpointForAlreadyRecorded(
  checkpoint: BasicFreeCatalogCollectionCheckpoint,
  input: BasicFreeCatalogCollectionRecordInput,
  row: BasicFreeCatalogCollectionRecordRow,
) {
  if (input.page_number === checkpoint.next_page) {
    return checkpointAfterRecord(checkpoint, input, row);
  }
  return row.next_page === checkpoint.next_page &&
    row.completed_page_count === checkpoint.completed_page_count &&
    row.collected_record_count === checkpoint.collected_record_count &&
    row.collection_complete === (checkpoint.collection_status === "complete") &&
    row.collection_status === checkpoint.collection_status
    ? checkpoint
    : null;
}

export function createBasicFreeCatalogCollectionCheckpointStore(
  database: BasicFreeCatalogCollectionCheckpointDatabase | null,
) {
  return {
    async start(
      input: BasicFreeCatalogCollectionStartInput,
    ): Promise<BasicFreeCatalogCollectionStartResult> {
      if (!database || !validStartInput(input)) return unavailableStart();
      try {
        const result = await database.start(input);
        if (result.error || !result.data) return unavailableStart();
        if (result.data.collection_status === "collection_already_in_progress") {
          return unavailableStart("basic_free_catalog_collection_already_in_progress");
        }
        const checkpoint = checkpointFromStartRow(result.data, input);
        if (!checkpoint) return unavailableStart();

        if (
          result.data.collection_status === "collection_started" &&
          result.data.idempotent === false &&
          checkpoint.collection_status === "collecting" &&
          checkpoint.next_page === 1 &&
          checkpoint.completed_page_count === 0 &&
          checkpoint.collected_record_count === 0
        ) {
          return { status: "started", checkpoint, idempotent: false, safe_blocker: null };
        }
        if (
          result.data.collection_status === "collection_available" &&
          result.data.idempotent === true &&
          checkpoint.collection_status === "collecting" &&
          checkpoint.next_page === 1 &&
          checkpoint.completed_page_count === 0 &&
          checkpoint.collected_record_count === 0
        ) {
          return { status: "available", checkpoint, idempotent: true, safe_blocker: null };
        }
      } catch {
        // A collection must not begin without a durable checkpoint receipt.
      }
      return unavailableStart();
    },

    async record(
      input: BasicFreeCatalogCollectionRecordInput,
    ): Promise<BasicFreeCatalogCollectionRecordResult> {
      if (!database || !validRecordInput(input)) return unavailableRecord();
      try {
        const result = await database.record({
          collection_id: input.checkpoint.collection_id,
          owner_user_id: input.checkpoint.owner_user_id,
          page_number: input.page_number,
          provider_catalog_count: input.provider_catalog_count,
          raw_records: input.raw_records,
          observed_at: input.observed_at,
        });
        if (result.error || !result.data) return unavailableRecord(input.checkpoint);
        const checkpoint = checkpointAfterRecord(input.checkpoint, input, result.data);
        if (result.data.page_status === "page_recorded" && checkpoint) {
          return { status: "recorded", checkpoint, safe_blocker: null };
        }
        const idempotentCheckpoint = checkpointForAlreadyRecorded(
          input.checkpoint,
          input,
          result.data,
        );
        if (result.data.page_status === "page_already_recorded" && idempotentCheckpoint) {
          return {
            status: "already_recorded",
            checkpoint: idempotentCheckpoint,
            safe_blocker: null,
          };
        }
      } catch {
        // Never retry a provider page from an ambiguous persistence response.
      }
      return unavailableRecord(input.checkpoint);
    },

    async read(
      input: BasicFreeCatalogCollectionReadInput,
    ): Promise<BasicFreeCatalogCollectionReadResult> {
      if (!database || !validFingerprint(input.collection_fingerprint) || !validUuid(input.owner_user_id)) {
        return unavailableRead();
      }
      try {
        const result = await database.read(input);
        if (result.error || !result.data) return unavailableRead();
        if (result.data.readback_status === "not_found") {
          return {
            status: "not_found",
            checkpoint: null,
            safe_blocker: "basic_free_catalog_collection_checkpoint_not_found",
          };
        }
        const checkpoint = checkpointFromReadRow(result.data, input);
        if (result.data.readback_status === "available" && checkpoint) {
          return { status: "available", checkpoint, safe_blocker: null };
        }
      } catch {
        // Readback is required before a future process may resume collection.
      }
      return unavailableRead();
    },
  };
}
