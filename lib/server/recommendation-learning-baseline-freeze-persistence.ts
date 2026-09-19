import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  createRecommendationLearningBaselineFreezeStore,
  recommendationLearningBaselineFreezeContractVersion,
  recommendationLearningBaselineFreezeReadRpcName,
  recommendationLearningBaselineFreezeRpcName,
  type RecommendationLearningBaselineFreezeDatabase,
  type RecommendationLearningBaselineFreezeInput,
} from "@/lib/recommendation-learning-baseline-freeze-store";
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
): RecommendationLearningBaselineFreezeDatabase {
  return {
    async freeze(input) {
      const { data, error } = await client.rpc(
        recommendationLearningBaselineFreezeRpcName,
        {
          p_baseline_fingerprint: input.baseline_fingerprint,
          p_owner_user_id: input.owner_user_id,
          p_segment_key: input.segment_key,
          p_decision_record_fingerprints: input.decision_record_fingerprints,
          p_evaluation_plan: input.evaluation_plan,
          p_evaluation_charter_fingerprint: input.evaluation_charter_fingerprint,
          p_expected_contract_version:
            recommendationLearningBaselineFreezeContractVersion,
        },
      );
      return { data: only(data), error };
    },
    async read(ownerUserId) {
      const { data, error } = await client.rpc(
        recommendationLearningBaselineFreezeReadRpcName,
        {
          p_owner_user_id: ownerUserId,
          p_expected_contract_version:
            recommendationLearningBaselineFreezeContractVersion,
        },
      );
      return { data: only(data), error };
    },
  };
}

function store() {
  const supabase = getServerSupabaseClient();
  return createRecommendationLearningBaselineFreezeStore(
    supabase.client ? database(supabase.client) : null,
  );
}

export function freezeRecommendationLearningBaseline(
  input: RecommendationLearningBaselineFreezeInput,
) {
  return store().freeze(input);
}

export function readRecommendationLearningBaselineFreeze(ownerUserId: string) {
  return store().read(ownerUserId);
}
