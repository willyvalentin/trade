import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  continuousIntelligenceCreditLedgerTableName,
  type ContinuousIntelligenceCreditLedgerBuilderInput,
  type ContinuousIntelligenceCreditLedgerEntry,
  type ContinuousIntelligenceProviderUsageEvidence,
} from "@/lib/continuous-intelligence-credit-ledger";
import {
  createContinuousIntelligenceCreditLedgerStore,
  type ContinuousIntelligenceCreditLedgerDatabase,
} from "@/lib/continuous-intelligence-credit-ledger-store";
import { getServerSupabaseClient } from "@/lib/supabase-server";

function createSupabaseContinuousIntelligenceCreditLedgerDatabase(
  client: SupabaseClient,
): ContinuousIntelligenceCreditLedgerDatabase {
  return {
    async insert(entry) {
      const { data, error } = await client
        .from(continuousIntelligenceCreditLedgerTableName)
        .insert(entry)
        .select("ledger_entry_id")
        .maybeSingle();
      return { data: (data as { ledger_entry_id: string } | null) ?? null, error };
    },
    async update(entry) {
      const { data, error } = await client
        .from(continuousIntelligenceCreditLedgerTableName)
        .update(entry)
        .eq("source_receipt_id", entry.source_receipt_id)
        .select("ledger_entry_id")
        .maybeSingle();
      return { data: (data as { ledger_entry_id: string } | null) ?? null, error };
    },
    async findBySourceReceiptId(receiptId) {
      const { data, error } = await client
        .from(continuousIntelligenceCreditLedgerTableName)
        .select("*")
        .eq("source_receipt_id", receiptId)
        .maybeSingle();
      return { data: (data as ContinuousIntelligenceCreditLedgerEntry | null) ?? null, error };
    },
    async findByLedgerEntryId(entryId) {
      const { data, error } = await client
        .from(continuousIntelligenceCreditLedgerTableName)
        .select("*")
        .eq("ledger_entry_id", entryId)
        .maybeSingle();
      return { data: (data as ContinuousIntelligenceCreditLedgerEntry | null) ?? null, error };
    },
    async latest() {
      const { data, error } = await client
        .from(continuousIntelligenceCreditLedgerTableName)
        .select("*")
        .order("generated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return { data: (data as ContinuousIntelligenceCreditLedgerEntry | null) ?? null, error };
    },
    async listCanaryEntriesForUtcDay(start, end) {
      const { data, error } = await client
        .from(continuousIntelligenceCreditLedgerTableName)
        .select("*")
        .eq("entry_kind", "scheduled_shadow_collector_canary")
        .gte("generated_at", start)
        .lt("generated_at", end);
      return { data: (data as ContinuousIntelligenceCreditLedgerEntry[] | null) ?? null, error };
    },
  };
}

function serverLedgerStore() {
  const serverSupabase = getServerSupabaseClient();
  return createContinuousIntelligenceCreditLedgerStore(
    serverSupabase.client
      ? createSupabaseContinuousIntelligenceCreditLedgerDatabase(serverSupabase.client)
      : null,
  );
}

export async function persistContinuousIntelligenceCreditLedger(
  input: ContinuousIntelligenceCreditLedgerBuilderInput,
) {
  return serverLedgerStore().persist(input);
}

export async function readContinuousIntelligenceCreditLedger(input: {
  sourceReceiptId?: string | null;
  ledgerEntryId?: string | null;
}) {
  const store = serverLedgerStore();
  if (input.sourceReceiptId) return store.findBySourceReceiptId(input.sourceReceiptId);
  if (input.ledgerEntryId) return store.findByLedgerEntryId(input.ledgerEntryId);
  return store.latest();
}

export async function reconcileContinuousIntelligenceCreditLedger(
  sourceReceiptId: string,
  evidence: ContinuousIntelligenceProviderUsageEvidence,
) {
  return serverLedgerStore().reconcile(sourceReceiptId, evidence);
}

export async function readContinuousIntelligenceCanaryDailyUsage(start: string, end: string) {
  return serverLedgerStore().canaryUsageForUtcDay(start, end);
}
