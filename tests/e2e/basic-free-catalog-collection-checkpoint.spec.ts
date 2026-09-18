import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  BASIC_FREE_CATALOG_COLLECTION_PAGE_SIZE,
  createBasicFreeCatalogCollectionCheckpointStore,
  type BasicFreeCatalogCollectionCheckpoint,
  type BasicFreeCatalogCollectionCheckpointDatabase,
} from "@/lib/basic-free-catalog-collection-checkpoint-store";

const ownerUserId = "7d2e0f9a-43db-4f62-9a78-aec2ae34c6d0";
const collectionId = "1e98f21d-488a-467a-a1f0-dcc517499835";
const fingerprint = "basic-free-us-common-stock-2026-09-18-provider-count-9";
const observedAt = "2026-09-18T13:30:00.000Z";
const migrationPath =
  "supabase/migrations/20260918020603_if2_basic_free_catalog_collection_checkpoint.sql";

function startInput() {
  return {
    collection_fingerprint: fingerprint,
    owner_user_id: ownerUserId,
    provider_catalog_count: 9,
    page_size: BASIC_FREE_CATALOG_COLLECTION_PAGE_SIZE,
    snapshot_observed_at: observedAt,
  };
}

function checkpoint(
  overrides: Partial<BasicFreeCatalogCollectionCheckpoint> = {},
): BasicFreeCatalogCollectionCheckpoint {
  return {
    collection_id: collectionId,
    collection_fingerprint: fingerprint,
    owner_user_id: ownerUserId,
    collection_status: "collecting" as const,
    provider_catalog_count: 9,
    page_size: BASIC_FREE_CATALOG_COLLECTION_PAGE_SIZE,
    total_pages: 2,
    next_page: 1,
    completed_page_count: 0,
    collected_record_count: 0,
    snapshot_observed_at: observedAt,
    last_page_observed_at: null,
    completed_at: null,
    ...overrides,
  };
}

function records(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    symbol: `TEST${index}`,
    source_index: index,
  }));
}

function database(
  overrides: Partial<BasicFreeCatalogCollectionCheckpointDatabase> = {},
): BasicFreeCatalogCollectionCheckpointDatabase {
  return {
    async start() {
      return {
        data: {
          collection_status: "collection_started",
          collection_id: collectionId,
          idempotent: false,
          next_page: 1,
          total_pages: 2,
          completed_page_count: 0,
          collected_record_count: 0,
          blocker: null,
        },
        error: null,
      };
    },
    async record() {
      return {
        data: {
          page_status: "page_recorded",
          collection_status: "collecting",
          next_page: 2,
          completed_page_count: 1,
          collected_record_count: 8,
          collection_complete: false,
          blocker: null,
        },
        error: null,
      };
    },
    async read() {
      return {
        data: {
          readback_status: "available",
          collection_id: collectionId,
          collection_status: "collecting",
          provider_catalog_count: 9,
          page_size: 8,
          total_pages: 2,
          next_page: 2,
          completed_page_count: 1,
          collected_record_count: 8,
          snapshot_observed_at: observedAt,
          last_page_observed_at: "2026-09-18T13:31:00.000Z",
          completed_at: null,
          blocker: null,
        },
        error: null,
      };
    },
    ...overrides,
  };
}

test("checkpoint start fails closed without a durable database receipt", async () => {
  const unavailable = createBasicFreeCatalogCollectionCheckpointStore(null);
  await expect(unavailable.start(startInput())).resolves.toMatchObject({
    status: "unavailable",
    checkpoint: null,
  });

  let calls = 0;
  const store = createBasicFreeCatalogCollectionCheckpointStore(database({
    async start() {
      calls += 1;
      throw new Error("must not be called for an invalid contract");
    },
  }));
  await expect(store.start({ ...startInput(), page_size: 7 })).resolves.toMatchObject({
    status: "unavailable",
    checkpoint: null,
  });
  expect(calls).toBe(0);
});

test("checkpoint start accepts only an exact initial durable state", async () => {
  const store = createBasicFreeCatalogCollectionCheckpointStore(database());
  await expect(store.start(startInput())).resolves.toEqual({
    status: "started",
    checkpoint: checkpoint(),
    idempotent: false,
    safe_blocker: null,
  });

  const idempotent = createBasicFreeCatalogCollectionCheckpointStore(database({
    async start() {
      return {
        data: {
          collection_status: "collection_available",
          collection_id: collectionId,
          idempotent: true,
          next_page: 1,
          total_pages: 2,
          completed_page_count: 0,
          collected_record_count: 0,
          blocker: null,
        },
        error: null,
      };
    },
  }));
  await expect(idempotent.start(startInput())).resolves.toMatchObject({
    status: "available",
    idempotent: true,
    checkpoint: checkpoint(),
  });
});

test("another active collection is a blocker, not a resumable alias", async () => {
  const store = createBasicFreeCatalogCollectionCheckpointStore(database({
    async start() {
      return {
        data: {
          collection_status: "collection_already_in_progress",
          collection_id: "a51aa76b-750a-4a34-8d2c-a4a13c7455c4",
          idempotent: false,
          next_page: 5,
          total_pages: 2000,
          completed_page_count: 4,
          collected_record_count: 32,
          blocker: "collection_already_in_progress",
        },
        error: null,
      };
    },
  }));

  await expect(store.start(startInput())).resolves.toEqual({
    status: "unavailable",
    checkpoint: null,
    idempotent: null,
    safe_blocker: "basic_free_catalog_collection_already_in_progress",
  });
});

test("a page is persisted only in strict sequence with its exact expected count", async () => {
  const calls: unknown[] = [];
  const store = createBasicFreeCatalogCollectionCheckpointStore(database({
    async record(input) {
      calls.push(input);
      return {
        data: {
          page_status: "page_recorded",
          collection_status: "collecting",
          next_page: 2,
          completed_page_count: 1,
          collected_record_count: 8,
          collection_complete: false,
          blocker: null,
        },
        error: null,
      };
    },
  }));

  const result = await store.record({
    checkpoint: checkpoint(),
    page_number: 1,
    provider_catalog_count: 9,
    raw_records: records(8),
    observed_at: "2026-09-18T13:31:00.000Z",
  });
  expect(result).toMatchObject({
    status: "recorded",
    checkpoint: {
      next_page: 2,
      completed_page_count: 1,
      collected_record_count: 8,
      collection_status: "collecting",
    },
  });
  expect(calls).toHaveLength(1);

  await expect(store.record({
    checkpoint: checkpoint(),
    page_number: 2,
    provider_catalog_count: 9,
    raw_records: records(1),
    observed_at: "2026-09-18T13:32:00.000Z",
  })).resolves.toMatchObject({ status: "unavailable" });
  await expect(store.record({
    checkpoint: checkpoint(),
    page_number: 1,
    provider_catalog_count: 8,
    raw_records: records(8),
    observed_at: "2026-09-18T13:32:00.000Z",
  })).resolves.toMatchObject({ status: "unavailable" });
  await expect(store.record({
    checkpoint: checkpoint(),
    page_number: 1,
    provider_catalog_count: 9,
    raw_records: [
      { received_at: new Date() },
      ...records(7),
    ],
    observed_at: "2026-09-18T13:32:00.000Z",
  })).resolves.toMatchObject({ status: "unavailable" });
  expect(calls).toHaveLength(1);
});

test("a repeated exact page is idempotent while an inconsistent receipt stays blocked", async () => {
  const store = createBasicFreeCatalogCollectionCheckpointStore(database({
    async record() {
      return {
        data: {
          page_status: "page_already_recorded",
          collection_status: "collecting",
          next_page: 2,
          completed_page_count: 1,
          collected_record_count: 8,
          collection_complete: false,
          blocker: null,
        },
        error: null,
      };
    },
  }));
  await expect(store.record({
    checkpoint: checkpoint(),
    page_number: 1,
    provider_catalog_count: 9,
    raw_records: records(8),
    observed_at: "2026-09-18T13:31:00.000Z",
  })).resolves.toMatchObject({
    status: "already_recorded",
    checkpoint: { next_page: 2, collected_record_count: 8 },
  });

  const inconsistent = createBasicFreeCatalogCollectionCheckpointStore(database({
    async record() {
      return {
        data: {
          page_status: "page_recorded",
          collection_status: "collecting",
          next_page: 2,
          completed_page_count: 1,
          collected_record_count: 7,
          collection_complete: false,
          blocker: null,
        },
        error: null,
      };
    },
  }));
  await expect(inconsistent.record({
    checkpoint: checkpoint(),
    page_number: 1,
    provider_catalog_count: 9,
    raw_records: records(8),
    observed_at: "2026-09-18T13:31:00.000Z",
  })).resolves.toMatchObject({ status: "unavailable" });
});

test("only the exact final remainder can make the durable checkpoint complete", async () => {
  const firstPage = checkpoint({
    next_page: 2,
    completed_page_count: 1,
    collected_record_count: 8,
    last_page_observed_at: "2026-09-18T13:31:00.000Z",
  });
  const store = createBasicFreeCatalogCollectionCheckpointStore(database({
    async record() {
      return {
        data: {
          page_status: "page_recorded",
          collection_status: "complete",
          next_page: 3,
          completed_page_count: 2,
          collected_record_count: 9,
          collection_complete: true,
          blocker: null,
        },
        error: null,
      };
    },
  }));
  await expect(store.record({
    checkpoint: firstPage,
    page_number: 2,
    provider_catalog_count: 9,
    raw_records: records(1),
    observed_at: "2026-09-18T13:32:00.000Z",
  })).resolves.toMatchObject({
    status: "recorded",
    checkpoint: {
      collection_status: "complete",
      next_page: 3,
      completed_page_count: 2,
      collected_record_count: 9,
    },
  });
});

test("readback supports resume state but never returns raw provider rows", async () => {
  const store = createBasicFreeCatalogCollectionCheckpointStore(database());
  const result = await store.read({
    collection_fingerprint: fingerprint,
    owner_user_id: ownerUserId,
  });
  expect(result).toEqual({
    status: "available",
    checkpoint: checkpoint({
      next_page: 2,
      completed_page_count: 1,
      collected_record_count: 8,
      last_page_observed_at: "2026-09-18T13:31:00.000Z",
    }),
    safe_blocker: null,
  });
  expect(JSON.stringify(result)).not.toContain("raw_records");
});

test("checkpoint schema is server-only and no collector runtime imports its persistence boundary", () => {
  const migration = readFileSync(resolve(process.cwd(), migrationPath), "utf8");
  const persistence = readFileSync(resolve(
    process.cwd(),
    "lib/server/basic-free-catalog-collection-checkpoint-persistence.ts",
  ), "utf8");
  const discoveryRuntime = readFileSync(resolve(
    process.cwd(),
    "lib/basic-free-discovery.ts",
  ), "utf8");

  expect(migration).toContain("enable row level security");
  expect(migration).toContain("revoke all on table public.basic_free_catalog_collections");
  expect(migration).toContain("grant execute on function public.start_basic_free_catalog_collection");
  expect(migration).toContain("collection_page_sequence_gap");
  expect(migration).toContain("collection_denominator_changed");
  expect(migration).toContain("cannot itself admit discovery");
  expect(migration).toMatch(
    /page_already_recorded[\s\S]{0,360}null::text;\s+return;/,
  );
  expect(persistence).toContain('import "server-only"');
  expect(persistence).toContain("value.length === 1");
  expect(discoveryRuntime).not.toContain(
    "basic-free-catalog-collection-checkpoint-persistence",
  );
});
