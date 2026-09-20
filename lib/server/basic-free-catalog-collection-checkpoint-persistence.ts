import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  basicFreeCatalogCollectionCheckpointContractVersion,
  basicFreeCatalogCollectionCheckpointReadRpcName,
  basicFreeCatalogCollectionCheckpointRecordRpcName,
  basicFreeCatalogCollectionCheckpointStartRpcName,
  createBasicFreeCatalogCollectionCheckpointStore,
  type BasicFreeCatalogCollectionCheckpointDatabase,
  type BasicFreeCatalogCollectionReadInput,
  type BasicFreeCatalogCollectionRecordInput,
  type BasicFreeCatalogCollectionStartInput,
} from "@/lib/basic-free-catalog-collection-checkpoint-store";
import { getServerSupabaseClient } from "@/lib/supabase-server";

function only<T>(value: T[] | T | null) {
  return Array.isArray(value)
    ? value.length === 1
      ? value[0] ?? null
      : null
    : value;
}

function database(
  client: SupabaseClient,
): BasicFreeCatalogCollectionCheckpointDatabase {
  return {
    async start(input) {
      const { data, error } = await client.rpc(
        basicFreeCatalogCollectionCheckpointStartRpcName,
        {
          p_collection_fingerprint: input.collection_fingerprint,
          p_owner_user_id: input.owner_user_id,
          p_provider_catalog_count: input.provider_catalog_count,
          p_provider_snapshot_id: input.provider_snapshot_id,
          p_page_size: input.page_size,
          p_snapshot_observed_at: input.snapshot_observed_at,
          p_expected_contract_version:
            basicFreeCatalogCollectionCheckpointContractVersion,
        },
      );
      return { data: only(data), error };
    },
    async record(input) {
      const { data, error } = await client.rpc(
        basicFreeCatalogCollectionCheckpointRecordRpcName,
        {
          p_collection_id: input.collection_id,
          p_owner_user_id: input.owner_user_id,
          p_page_number: input.page_number,
          p_provider_catalog_count: input.provider_catalog_count,
          p_provider_snapshot_id: input.provider_snapshot_id,
          p_raw_records: input.raw_records,
          p_observed_at: input.observed_at,
          p_expected_contract_version:
            basicFreeCatalogCollectionCheckpointContractVersion,
        },
      );
      return { data: only(data), error };
    },
    async read(input) {
      const { data, error } = await client.rpc(
        basicFreeCatalogCollectionCheckpointReadRpcName,
        {
          p_collection_fingerprint: input.collection_fingerprint,
          p_owner_user_id: input.owner_user_id,
          p_expected_contract_version:
            basicFreeCatalogCollectionCheckpointContractVersion,
        },
      );
      return { data: only(data), error };
    },
  };
}

function store() {
  const supabase = getServerSupabaseClient();
  return createBasicFreeCatalogCollectionCheckpointStore(
    supabase.client ? database(supabase.client) : null,
  );
}

/**
 * This persistence boundary is intentionally unreferenced by runtime paths.
 * A separately authorized collector must first obtain a provider request
 * allowance; it may only use this module to durably start, resume and record
 * its already-observed pages.
 */
export function startBasicFreeCatalogCollectionCheckpoint(
  input: BasicFreeCatalogCollectionStartInput,
) {
  return store().start(input);
}

export function recordBasicFreeCatalogCollectionCheckpointPage(
  input: BasicFreeCatalogCollectionRecordInput,
) {
  return store().record(input);
}

export function readBasicFreeCatalogCollectionCheckpoint(
  input: BasicFreeCatalogCollectionReadInput,
) {
  return store().read(input);
}
