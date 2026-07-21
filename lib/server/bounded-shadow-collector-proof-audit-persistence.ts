import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { boundedShadowCollectorProofAuditTableName } from "@/lib/bounded-shadow-collector-proof-audit-contract";
import {
  createBoundedShadowCollectorProofAuditStore,
  type BoundedShadowCollectorProofAuditDatabase,
  type BoundedShadowCollectorProofAuditRow,
} from "@/lib/bounded-shadow-collector-proof-audit-store";
import type { BoundedShadowCollectorLiveProofReceipt } from "@/lib/bounded-shadow-collector-live-proof-receipt";
import { getServerSupabaseClient } from "@/lib/supabase-server";

function createSupabaseBoundedShadowCollectorProofAuditDatabase(
  client: SupabaseClient,
): BoundedShadowCollectorProofAuditDatabase {
  return {
    async insert(row) {
      const { data, error } = await client
        .from(boundedShadowCollectorProofAuditTableName)
        .insert(row)
        .select("receipt_id")
        .maybeSingle();
      return { data: (data as { receipt_id: string } | null) ?? null, error };
    },
    async findByReceiptId(receiptId) {
      const { data, error } = await client
        .from(boundedShadowCollectorProofAuditTableName)
        .select("*")
        .eq("receipt_id", receiptId)
        .maybeSingle();
      return { data: (data as BoundedShadowCollectorProofAuditRow | null) ?? null, error };
    },
    async latest() {
      const { data, error } = await client
        .from(boundedShadowCollectorProofAuditTableName)
        .select("*")
        .order("generated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return { data: (data as BoundedShadowCollectorProofAuditRow | null) ?? null, error };
    },
  };
}

function serverAuditStore() {
  const serverSupabase = getServerSupabaseClient();
  return createBoundedShadowCollectorProofAuditStore(
    serverSupabase.client
      ? createSupabaseBoundedShadowCollectorProofAuditDatabase(serverSupabase.client)
      : null,
  );
}

export async function persistBoundedShadowCollectorProofAudit(
  receipt: BoundedShadowCollectorLiveProofReceipt,
) {
  return serverAuditStore().persist(receipt);
}

export async function readBoundedShadowCollectorProofAudit(receiptId: string | null) {
  const store = serverAuditStore();
  return receiptId ? store.findByReceiptId(receiptId) : store.latest();
}
