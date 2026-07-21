import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  continuousIntelligenceShadowCanaryBeginAttemptRpcName,
  continuousIntelligenceShadowCanaryClaimContractVersion,
  continuousIntelligenceShadowCanaryFinalizeAttemptRpcName,
  continuousIntelligenceShadowCanaryClaimRpcName,
  createContinuousIntelligenceShadowCanaryClaimStore,
  type ContinuousIntelligenceShadowCanaryClaimDatabase,
  type ContinuousIntelligenceShadowCanaryClaimInput,
} from "@/lib/continuous-intelligence-shadow-canary-claim-store";
import { getServerSupabaseClient } from "@/lib/supabase-server";

function database(client: SupabaseClient): ContinuousIntelligenceShadowCanaryClaimDatabase {
  return {
    async claim(input) {
      const { data, error } = await client.rpc(continuousIntelligenceShadowCanaryClaimRpcName, {
        p_claim_id: input.claim_id,
        p_execution_id: input.execution_id,
        p_request_fingerprint: input.request_fingerprint,
        p_utc_day: input.utc_day,
        p_estimated_credits: input.estimated_credits,
      });
      const row = Array.isArray(data) ? data[0] : data;
      return { data: row ?? null, error };
    },
    async beginAttempt(input) {
      const { data, error } = await client.rpc(continuousIntelligenceShadowCanaryBeginAttemptRpcName, {
        p_claim_id: input.claim_id,
        p_execution_id: input.execution_id,
        p_request_fingerprint: input.request_fingerprint,
        p_expected_contract_version: input.expected_contract_version,
      });
      const row = Array.isArray(data) ? data[0] : data;
      return { data: row ?? null, error };
    },
    async finalize(input) {
      const { data, error } = await client.rpc(continuousIntelligenceShadowCanaryFinalizeAttemptRpcName, {
        p_claim_id: input.claim_id,
        p_execution_id: input.execution_id,
        p_request_fingerprint: input.request_fingerprint,
        p_expected_contract_version: input.expected_contract_version,
        p_terminal_status: input.status,
        p_provider_attempted: input.provider_attempted,
        p_source_receipt_id: input.source_receipt_id,
        p_finalized_at: input.finalized_at,
      });
      const row = Array.isArray(data) ? data[0] : data;
      return { data: row ?? null, error };
    },
  };
}

function store() {
  const supabase = getServerSupabaseClient();
  return createContinuousIntelligenceShadowCanaryClaimStore(
    supabase.client ? database(supabase.client) : null,
  );
}

export function claimContinuousIntelligenceShadowCanaryDailyCapacity(
  input: ContinuousIntelligenceShadowCanaryClaimInput,
) {
  return store().claim(input);
}

export function beginContinuousIntelligenceShadowCanaryAttempt(input: {
  claim_id: string;
  execution_id: string;
  request_fingerprint: string;
  expected_contract_version?: typeof continuousIntelligenceShadowCanaryClaimContractVersion;
}) {
  return store().beginAttempt({
    ...input,
    expected_contract_version: input.expected_contract_version ?? continuousIntelligenceShadowCanaryClaimContractVersion,
  });
}

export function finalizeContinuousIntelligenceShadowCanaryDailyClaim(input: {
  claim_id: string;
  execution_id: string;
  request_fingerprint: string;
  expected_contract_version?: typeof continuousIntelligenceShadowCanaryClaimContractVersion;
  status: "completed" | "failed";
  provider_attempted: boolean;
  source_receipt_id: string | null;
  finalized_at: string;
}) {
  return store().finalize({
    ...input,
    expected_contract_version: input.expected_contract_version ?? continuousIntelligenceShadowCanaryClaimContractVersion,
  });
}
