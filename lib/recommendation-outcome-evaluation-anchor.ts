export const RECOMMENDATION_OUTCOME_EVALUATION_ANCHOR_VERSION =
  "recommendation_outcome_evaluation_anchor_v1" as const;

export const RECOMMENDATION_OUTCOME_EVALUATION_CANDLE_INTERVAL =
  "5min" as const;

const candleIntervalMs = 5 * 60 * 1000;

type RecommendationOutcomeEvaluationAnchorBase = {
  contract_version: typeof RECOMMENDATION_OUTCOME_EVALUATION_ANCHOR_VERSION;
  candle_interval: typeof RECOMMENDATION_OUTCOME_EVALUATION_CANDLE_INTERVAL;
  decision_timestamp_interval_aligned: boolean;
  blockers: string[];
};

export type AnchoredRecommendationOutcomeEvaluationAnchor =
  RecommendationOutcomeEvaluationAnchorBase & {
    status: "anchored";
    decision_timestamp: string;
    evaluation_anchor_start_at: string;
    decision_to_anchor_seconds: number;
  };

type UnavailableRecommendationOutcomeEvaluationAnchor =
  RecommendationOutcomeEvaluationAnchorBase & {
    status: "unavailable";
    decision_timestamp: null;
    evaluation_anchor_start_at: null;
    decision_to_anchor_seconds: null;
  };

export type RecommendationOutcomeEvaluationAnchor =
  | AnchoredRecommendationOutcomeEvaluationAnchor
  | UnavailableRecommendationOutcomeEvaluationAnchor;

type SnapshotAnchorInput = {
  recommended_at: string | null;
  payload_json: Record<string, unknown>;
};

function timestamp(value: string | null | undefined) {
  const parsed = Date.parse(value ?? "");
  return Number.isFinite(parsed) ? parsed : null;
}

function iso(value: number) {
  return new Date(value).toISOString();
}

function anchorStartAt(decisionAt: number) {
  return Math.ceil(decisionAt / candleIntervalMs) * candleIntervalMs;
}

function objectOrNull(value: unknown) {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

/**
 * Records the first complete candle that begins on or after the decision. A
 * recommendation created inside a live candle must not borrow that candle's
 * pre-decision range for a future outcome calculation.
 */
export function buildRecommendationOutcomeEvaluationAnchor(
  decisionTimestamp: string | Date | null | undefined,
): RecommendationOutcomeEvaluationAnchor {
  const normalizedDecisionTimestamp =
    decisionTimestamp instanceof Date
      ? Number.isFinite(decisionTimestamp.getTime())
        ? decisionTimestamp.toISOString()
        : null
      : typeof decisionTimestamp === "string"
        ? decisionTimestamp
        : null;
  const decisionAt = timestamp(normalizedDecisionTimestamp);

  if (decisionAt === null) {
    return {
      contract_version: RECOMMENDATION_OUTCOME_EVALUATION_ANCHOR_VERSION,
      status: "unavailable",
      candle_interval: RECOMMENDATION_OUTCOME_EVALUATION_CANDLE_INTERVAL,
      decision_timestamp: null,
      evaluation_anchor_start_at: null,
      decision_to_anchor_seconds: null,
      decision_timestamp_interval_aligned: false,
      blockers: ["recommendation_timestamp_invalid"],
    };
  }

  const startAt = anchorStartAt(decisionAt);

  return {
    contract_version: RECOMMENDATION_OUTCOME_EVALUATION_ANCHOR_VERSION,
    status: "anchored",
    candle_interval: RECOMMENDATION_OUTCOME_EVALUATION_CANDLE_INTERVAL,
    decision_timestamp: iso(decisionAt),
    evaluation_anchor_start_at: iso(startAt),
    decision_to_anchor_seconds: (startAt - decisionAt) / 1000,
    decision_timestamp_interval_aligned: decisionAt % candleIntervalMs === 0,
    blockers: [],
  };
}

/**
 * Treats the persisted anchor as immutable decision evidence. The value is
 * accepted only when it is the exact deterministic anchor for the snapshot's
 * own recommendation timestamp; a caller cannot shift the start later to
 * select a more favorable candle window.
 */
export function recommendationOutcomeEvaluationAnchorFromSnapshot(
  snapshot: SnapshotAnchorInput,
): AnchoredRecommendationOutcomeEvaluationAnchor | null {
  const expected = buildRecommendationOutcomeEvaluationAnchor(
    snapshot.recommended_at,
  );
  const recorded = objectOrNull(snapshot.payload_json.outcome_evaluation_anchor);

  if (!recorded || expected.status !== "anchored") return null;

  const sameAnchor =
    recorded.contract_version === expected.contract_version &&
    recorded.status === expected.status &&
    recorded.candle_interval === expected.candle_interval &&
    recorded.decision_timestamp === expected.decision_timestamp &&
    recorded.evaluation_anchor_start_at === expected.evaluation_anchor_start_at &&
    recorded.decision_to_anchor_seconds === expected.decision_to_anchor_seconds &&
    recorded.decision_timestamp_interval_aligned ===
      expected.decision_timestamp_interval_aligned &&
    Array.isArray(recorded.blockers) &&
    recorded.blockers.length === 0;

  return sameAnchor ? expected : null;
}
