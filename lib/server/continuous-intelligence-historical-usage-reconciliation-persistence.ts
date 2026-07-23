import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  continuousIntelligenceHistoricalUsageReconciliationRpcName,
  createContinuousIntelligenceHistoricalUsageReconciliationStore,
  type ContinuousIntelligenceHistoricalUsageReconciliationDatabase,
  type ContinuousIntelligenceHistoricalUsageReconciliationRpcInput,
} from "@/lib/continuous-intelligence-historical-usage-reconciliation-store";
import { getServerSupabaseClient } from "@/lib/supabase-server";

function database(client: SupabaseClient): ContinuousIntelligenceHistoricalUsageReconciliationDatabase {
  return {
    async rpc(name, args) {
      if (name !== continuousIntelligenceHistoricalUsageReconciliationRpcName) {
        return { data: null, error: { code: "unexpected_rpc" } };
      }
      const { data, error } = await client.rpc(continuousIntelligenceHistoricalUsageReconciliationRpcName, args);
      return { data, error };
    },
  };
}

export function reconcileContinuousIntelligenceHistoricalUsage(input: ContinuousIntelligenceHistoricalUsageReconciliationRpcInput) {
  const supabase = getServerSupabaseClient();
  return createContinuousIntelligenceHistoricalUsageReconciliationStore(
    supabase.client ? database(supabase.client) : null,
  ).reconcile(input);
}
