import {
  buildRecommendationEvaluationCharterInput,
  recommendationEvaluationCharterFromRow,
  type RecommendationEvaluationCharter,
  type RecommendationEvaluationCharterInput,
} from "@/lib/recommendation-evaluation-charter";

export const recommendationEvaluationCharterRpcName =
  "record_recommendation_evaluation_charter" as const;
export const recommendationEvaluationCharterReadRpcName =
  "read_recommendation_evaluation_charters" as const;

type CharterWriteRow = {
  write_status: string;
  charter_id: string | null;
  charter_fingerprint: string | null;
  owner_user_id: string | null;
  segment_key: string | null;
  policy_attribution: unknown;
  charter_json: unknown;
  created_at: string | null;
  idempotent: boolean;
  blocker: string | null;
};

type CharterReadRow = {
  readback_status: string;
  charter_id: string | null;
  charter_fingerprint: string | null;
  owner_user_id: string | null;
  segment_key: string | null;
  policy_attribution: unknown;
  charter_json: unknown;
  created_at: string | null;
  blocker: string | null;
};

export type RecommendationEvaluationCharterDatabase = {
  write: (input: RecommendationEvaluationCharterInput) => Promise<{
    data: CharterWriteRow | null;
    error: { code?: string } | null;
  }>;
  read: (ownerUserId: string) => Promise<{
    data: CharterReadRow[] | null;
    error: { code?: string } | null;
  }>;
};

export type RecommendationEvaluationCharterWriteResult =
  | { status: "recorded" | "already_recorded"; charter: RecommendationEvaluationCharter; safe_blocker: null }
  | { status: "unavailable" | "different_charter_already_recorded"; charter: null; safe_blocker: string };

export type RecommendationEvaluationCharterReadResult =
  | { status: "available"; charters: RecommendationEvaluationCharter[]; safe_blocker: null }
  | { status: "not_found" | "unavailable"; charters: []; safe_blocker: string };

function sameInput(
  charter: RecommendationEvaluationCharter,
  input: RecommendationEvaluationCharterInput,
) {
  return charter.charter_fingerprint === input.charter_fingerprint &&
    charter.owner_user_id === input.owner_user_id &&
    charter.segment_key === input.segment_key &&
    JSON.stringify(charter.policy_attribution) === JSON.stringify(input.policy_attribution) &&
    JSON.stringify(charter.charter) === JSON.stringify(input.charter);
}

function validInput(input: RecommendationEvaluationCharterInput) {
  const rebuilt = buildRecommendationEvaluationCharterInput({
    ownerUserId: input.owner_user_id,
    segmentKey: input.segment_key,
    policy: input.policy_attribution,
    charter: input.charter,
  });
  return rebuilt !== null && JSON.stringify(rebuilt) === JSON.stringify(input);
}

function unavailableWrite(
  status: "unavailable" | "different_charter_already_recorded" = "unavailable",
  safeBlocker = "recommendation_evaluation_charter_unavailable",
): RecommendationEvaluationCharterWriteResult {
  return { status, charter: null, safe_blocker: safeBlocker };
}

function unavailableRead(
  status: "not_found" | "unavailable" = "unavailable",
  safeBlocker = "recommendation_evaluation_charter_unavailable",
): RecommendationEvaluationCharterReadResult {
  return { status, charters: [], safe_blocker: safeBlocker };
}

export function createRecommendationEvaluationCharterStore(
  database: RecommendationEvaluationCharterDatabase | null,
) {
  return {
    async write(
      input: RecommendationEvaluationCharterInput,
    ): Promise<RecommendationEvaluationCharterWriteResult> {
      if (!database || !validInput(input)) return unavailableWrite();
      try {
        const result = await database.write(input);
        if (!result.data || result.error) return unavailableWrite();
        if (result.data.write_status === "different_evaluation_charter_already_recorded") {
          return unavailableWrite(
            "different_charter_already_recorded",
            "different_recommendation_evaluation_charter_already_recorded",
          );
        }
        const charter = recommendationEvaluationCharterFromRow(result.data);
        if (!charter || !sameInput(charter, input)) return unavailableWrite();
        if (result.data.write_status === "evaluation_charter_recorded" && !result.data.idempotent) {
          return { status: "recorded", charter, safe_blocker: null };
        }
        if (result.data.write_status === "evaluation_charter_already_recorded" && result.data.idempotent) {
          return { status: "already_recorded", charter, safe_blocker: null };
        }
      } catch {
        // Durable state must remain unknown when the server response is ambiguous.
      }
      return unavailableWrite();
    },

    async read(ownerUserId: string): Promise<RecommendationEvaluationCharterReadResult> {
      if (!database || typeof ownerUserId !== "string") return unavailableRead();
      try {
        const result = await database.read(ownerUserId);
        if (result.error || !result.data) return unavailableRead();
        if (result.data.length === 0) {
          return unavailableRead(
            "not_found",
            "recommendation_evaluation_charter_not_found",
          );
        }
        const charters = result.data.map((row) =>
          row.readback_status === "available"
            ? recommendationEvaluationCharterFromRow(row)
            : null
        );
        if (charters.some((charter) => charter === null)) return unavailableRead();
        const exact = charters as RecommendationEvaluationCharter[];
        if (new Set(exact.map((charter) => charter.charter_id)).size !== exact.length) {
          return unavailableRead();
        }
        return { status: "available", charters: exact, safe_blocker: null };
      } catch {
        return unavailableRead();
      }
    },
  };
}
