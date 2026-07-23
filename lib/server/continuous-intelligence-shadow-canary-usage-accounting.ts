import "server-only";

import {
  buildContinuousIntelligenceShadowCanaryUsageAccounting,
  unavailableContinuousIntelligenceShadowCanaryUsageAccounting,
} from "@/lib/continuous-intelligence-shadow-canary-usage-accounting";
import { continuousIntelligenceCreditLedgerTableName } from "@/lib/continuous-intelligence-credit-ledger";
import { continuousIntelligenceShadowCanaryClaimTableName } from "@/lib/continuous-intelligence-shadow-canary-claim-store";
import { getServerSupabaseClient } from "@/lib/supabase-server";

const continuousIntelligenceHistoricalUsageReconciliationsTableName = "ci_hur_reconciliations";

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
      supabase.client
        .from(continuousIntelligenceHistoricalUsageReconciliationsTableName)
        .select("reconciliation_identity,contract_version,operation_type,record_type,target_claim_id,source_execution_id,source_audit_id,authorization_id,usage_units,provider_request_count_for_reconciliation,reason_code,historical_utc_day")
        .eq("historical_utc_day", input.utc_day),
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
