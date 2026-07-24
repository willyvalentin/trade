import "server-only";

import {
  buildContinuousIntelligenceShadowCanaryUsageAccounting,
  unavailableContinuousIntelligenceShadowCanaryUsageAccounting,
} from "@/lib/continuous-intelligence-shadow-canary-usage-accounting";
import { continuousIntelligenceCreditLedgerTableName } from "@/lib/continuous-intelligence-credit-ledger";
import { continuousIntelligenceShadowCanaryClaimTableName } from "@/lib/continuous-intelligence-shadow-canary-claim-store";
import { getServerSupabaseClient } from "@/lib/supabase-server";

const continuousIntelligenceHistoricalUsageReconciliationReadRpcName =
  "ci_hur_read_for_usage_accounting";

export async function readContinuousIntelligenceShadowCanaryUsageAccounting(input: {
  utc_day: string;
  start: string;
  end: string;
}) {
  const supabase = getServerSupabaseClient();
  if (!supabase.client) return unavailableContinuousIntelligenceShadowCanaryUsageAccounting(input.utc_day);
  try {
    const [ledger, claims, reconciliations] = await Promise.all([
      supabase.client
        .from(continuousIntelligenceCreditLedgerTableName)
        .select("entry_kind,generated_at,provider_estimated_credits")
        .gte("generated_at", input.start)
        .lt("generated_at", input.end),
      supabase.client
        .from(continuousIntelligenceShadowCanaryClaimTableName)
        .select("utc_day,estimated_credits,status")
        .eq("utc_day", input.utc_day),
      supabase.client.rpc(
        continuousIntelligenceHistoricalUsageReconciliationReadRpcName,
        { p_historical_utc_day: input.utc_day },
      ),
    ]);
    if (
      ledger.error ||
      claims.error ||
      reconciliations.error ||
      ledger.data === null ||
      claims.data === null ||
      reconciliations.data === null
    ) {
      return unavailableContinuousIntelligenceShadowCanaryUsageAccounting(input.utc_day);
    }
    return buildContinuousIntelligenceShadowCanaryUsageAccounting({
      utc_day: input.utc_day,
      ledger_rows: ledger.data,
      claim_rows: claims.data,
      reconciliation_rows: reconciliations.data,
    });
  } catch {
    return unavailableContinuousIntelligenceShadowCanaryUsageAccounting(input.utc_day);
  }
}
