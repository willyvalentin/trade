import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  createRecommendationEvaluationCharterStore,
  recommendationEvaluationCharterReadRpcName,
  recommendationEvaluationCharterRpcName,
  type RecommendationEvaluationCharterDatabase,
} from "@/lib/recommendation-evaluation-charter-store";
import {
  RECOMMENDATION_EVALUATION_CHARTER_VERSION,
  type RecommendationEvaluationCharterInput,
} from "@/lib/recommendation-evaluation-charter";
import { getServerSupabaseClient } from "@/lib/supabase-server";

function only<T>(value: T[] | T | null) {
  return Array.isArray(value)
    ? value.length === 1
      ? value[0] ?? null
      : null
    : value;
}

function database(client: SupabaseClient): RecommendationEvaluationCharterDatabase {
  return {
    async write(input) {
      const { data, error } = await client.rpc(
        recommendationEvaluationCharterRpcName,
        {
          p_charter_fingerprint: input.charter_fingerprint,
          p_owner_user_id: input.owner_user_id,
          p_segment_key: input.segment_key,
          p_policy_attribution: input.policy_attribution,
          p_charter_json: input.charter,
          p_expected_contract_version: RECOMMENDATION_EVALUATION_CHARTER_VERSION,
        },
      );
      return { data: only(data), error };
    },
    async read(ownerUserId) {
      const { data, error } = await client.rpc(
        recommendationEvaluationCharterReadRpcName,
        {
          p_owner_user_id: ownerUserId,
          p_expected_contract_version: RECOMMENDATION_EVALUATION_CHARTER_VERSION,
        },
      );
      return { data: Array.isArray(data) ? data : null, error };
    },
  };
}

function store() {
  const supabase = getServerSupabaseClient();
  return createRecommendationEvaluationCharterStore(
    supabase.client ? database(supabase.client) : null,
  );
}

export function recordRecommendationEvaluationCharter(
  input: RecommendationEvaluationCharterInput,
) {
  return store().write(input);
}

export function readRecommendationEvaluationCharters(ownerUserId: string) {
  return store().read(ownerUserId);
}
