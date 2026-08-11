import "server-only";

import { normalizeApplicationOwnerUserId } from "@/lib/application-session-core";

import {
  getIntradayCandles,
  type IntradayCandle,
} from "@/lib/market-data";
import {
  type DiscardDecisionQuality,
  type DiscardOutcome,
  type DiscardReviewStatus,
} from "@/lib/discard-review-types";
import { normalizeSetupType } from "@/lib/setup-types";
import { getServerSupabaseClient } from "@/lib/supabase-server";

export type DiscardReviewCandidate = {
  id?: string | null;
  status?: string | null;
  discard_review_status?: DiscardReviewStatus | string | null;
  reason_to_avoid?: string | null;
  ticker?: string | null;
  direction?: string | null;
  entry_low?: number | string | null;
  entry_high?: number | string | null;
  stop_loss?: number | string | null;
  target_1?: number | string | null;
  target_2?: number | string | null;
  created_at?: string | null;
  recommendation_id?: string | null;
  setup_type?: string | null;
};

export type DiscardReviewResult = {
  review_status: DiscardReviewStatus;
  outcome: DiscardOutcome;
  decision_quality: DiscardDecisionQuality;
  theoretical_r: number | null;
  triggered_at: string | null;
  resolved_at: string | null;
  max_favorable_r: number | null;
  max_adverse_r: number | null;
  notes: string[];
};

const discardStatuses = new Set(["ignored", "discarded", "rejected"]);
const reviewWindowMs = 24 * 60 * 60 * 1000;
const discardMetadataPrefix = "\n\n[discard_meta:";
const confidenceMetadataPrefix = "\n\n[confidence_meta:";
export const MAX_DISCARD_REVIEWS_PER_RUN = 3;

function serverSupabase() {
  const { client, unavailable_reason } = getServerSupabaseClient();
  if (!client) throw new Error(`server_supabase_unavailable:${unavailable_reason}`);
  return client;
}

function hasNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed);
}

function hasTradePlan(recommendation: DiscardReviewCandidate) {
  return Boolean(
    recommendation.ticker &&
      hasNumber(recommendation.entry_low) &&
      hasNumber(recommendation.entry_high) &&
      hasNumber(recommendation.stop_loss) &&
      (hasNumber(recommendation.target_1) || hasNumber(recommendation.target_2)),
  );
}

export function isDiscardReviewEligible(
  recommendation: DiscardReviewCandidate,
  now = new Date(),
) {
  const status = recommendation.status?.trim().toLowerCase();
  const reviewStatus =
    recommendation.discard_review_status ??
    getDiscardReviewStatusFromMetadata(recommendation.reason_to_avoid) ??
    "pending";
  const createdAt = recommendation.created_at
    ? new Date(recommendation.created_at).getTime()
    : Number.NaN;

  return Boolean(
    status &&
      discardStatuses.has(status) &&
      reviewStatus === "pending" &&
      hasTradePlan(recommendation) &&
      Number.isFinite(createdAt) &&
      now.getTime() - createdAt >= 0 &&
      now.getTime() - createdAt <= reviewWindowMs &&
      !recommendation.recommendation_id,
  );
}

function round(value: number) {
  return Number(value.toFixed(2));
}

function parseNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function candleTime(candle: IntradayCandle) {
  return new Date(candle.timestamp * 1000).toISOString();
}

function getInlineMetadataEnd(value: string, markerIndex: number) {
  const nextConfidenceMarker = value.indexOf(
    confidenceMetadataPrefix,
    markerIndex + 1,
  );
  const nextDiscardMarker = value.indexOf(discardMetadataPrefix, markerIndex + 1);
  const nextMarkerIndexes = [nextConfidenceMarker, nextDiscardMarker].filter(
    (index) => index !== -1,
  );

  return nextMarkerIndexes.length > 0 ? Math.min(...nextMarkerIndexes) : value.length;
}

function parseDiscardMetadata(reasonToAvoid: string | null | undefined) {
  if (!reasonToAvoid) {
    return null;
  }

  const markerIndex = reasonToAvoid.lastIndexOf(discardMetadataPrefix);

  if (markerIndex === -1) {
    return null;
  }

  const metadataEnd = getInlineMetadataEnd(reasonToAvoid, markerIndex);
  const metadataText = reasonToAvoid
    .slice(markerIndex + discardMetadataPrefix.length, metadataEnd)
    .trim();
  const jsonText = metadataText.endsWith("]")
    ? metadataText.slice(0, -1)
    : metadataText;

  try {
    return JSON.parse(jsonText) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function getDiscardReviewStatusFromMetadata(
  reasonToAvoid: string | null | undefined,
) {
  const status = parseDiscardMetadata(reasonToAvoid)?.discard_review_status;

  return status === "pending" ||
    status === "reviewed" ||
    status === "skipped" ||
    status === "error"
    ? status
    : null;
}

function stripExistingDiscardMetadata(reasonToAvoid: string) {
  const markerIndex = reasonToAvoid.lastIndexOf(discardMetadataPrefix);

  if (markerIndex === -1) {
    return reasonToAvoid;
  }

  return reasonToAvoid.slice(0, markerIndex).trimEnd();
}

function buildDiscardMetadata(
  result: DiscardReviewResult,
  reviewedAt: string,
  existingMetadata: Record<string, unknown> | null,
  recommendation: DiscardReviewCandidate,
) {
  return `${discardMetadataPrefix}${JSON.stringify({
    discarded_at:
      typeof existingMetadata?.discarded_at === "string"
        ? existingMetadata.discarded_at
        : null,
    discard_review_status: result.review_status,
    discard_reviewed_at: reviewedAt,
    discard_outcome: result.outcome,
    discard_decision_quality: result.decision_quality,
    discard_theoretical_r: result.theoretical_r,
    max_favorable_r: result.max_favorable_r,
    max_adverse_r: result.max_adverse_r,
    triggered_at: result.triggered_at,
    resolved_at: result.resolved_at,
    review_notes: result.notes,
    archived_reason: "user_discarded",
    setup_type: normalizeSetupType(
      existingMetadata?.setup_type ?? recommendation.setup_type,
    ),
  })}]`;
}

function getNewYorkDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const valueByType = new Map(parts.map((part) => [part.type, part.value]));

  return {
    year: valueByType.get("year") ?? "1970",
    month: valueByType.get("month") ?? "01",
    day: valueByType.get("day") ?? "01",
  };
}

function getReviewWindow(recommendation: DiscardReviewCandidate, now = new Date()) {
  const createdAt = recommendation.created_at
    ? new Date(recommendation.created_at)
    : now;
  const { year, month, day } = getNewYorkDateParts(createdAt);

  // Review should evaluate what would have happened from recommendation creation
  // until market close.
  const marketClose = new Date(`${year}-${month}-${day}T16:00:00-04:00`);
  const end = now.getTime() < marketClose.getTime() ? now : marketClose;

  return { start: createdAt, end };
}

function baseResult(
  reviewStatus: DiscardReviewStatus,
  outcome: DiscardOutcome,
  decisionQuality: DiscardDecisionQuality,
  notes: string[],
): DiscardReviewResult {
  return {
    review_status: reviewStatus,
    outcome,
    decision_quality: decisionQuality,
    theoretical_r: null,
    triggered_at: null,
    resolved_at: null,
    max_favorable_r: null,
    max_adverse_r: null,
    notes,
  };
}

export function reviewDiscardedRecommendationOutcome(
  recommendation: DiscardReviewCandidate,
  candles: IntradayCandle[],
): DiscardReviewResult {
  if (recommendation.direction && recommendation.direction !== "long") {
    return baseResult("skipped", "unknown", "unknown", [
      "Only long day trade review is supported.",
    ]);
  }

  const entry = parseNumber(recommendation.entry_high);
  const stop = parseNumber(recommendation.stop_loss);
  const target = parseNumber(recommendation.target_1 ?? recommendation.target_2);

  if (entry === null || stop === null || target === null) {
    return baseResult("skipped", "unknown", "unknown", [
      "Missing entry, stop, or target.",
    ]);
  }

  const riskPerShare = entry - stop;

  if (riskPerShare <= 0) {
    return baseResult("skipped", "unknown", "unknown", [
      "Invalid risk structure.",
    ]);
  }

  let triggeredAt: string | null = null;
  let maxHigh = entry;
  let minLow = entry;
  let maxFavorableR = 0;
  let maxAdverseR = 0;

  for (const candle of candles) {
    if (!triggeredAt) {
      if (candle.high < entry) {
        continue;
      }

      triggeredAt = candleTime(candle);
    }

    maxHigh = Math.max(maxHigh, candle.high);
    minLow = Math.min(minLow, candle.low);
    maxFavorableR = Math.max(maxFavorableR, (maxHigh - entry) / riskPerShare);
    maxAdverseR = Math.min(maxAdverseR, (minLow - entry) / riskPerShare);

    const stopHit = candle.low <= stop;
    const targetHit = candle.high >= target;

    if (stopHit && targetHit) {
      return {
        review_status: "reviewed",
        outcome: "stop_hit",
        decision_quality: "correct_discard",
        theoretical_r: -1,
        triggered_at: triggeredAt,
        resolved_at: candleTime(candle),
        max_favorable_r: round(maxFavorableR),
        max_adverse_r: round(maxAdverseR),
        notes: [
          "Stop and target were both touched in the same candle; outcome assumed conservative.",
        ],
      };
    }

    if (stopHit) {
      return {
        review_status: "reviewed",
        outcome: "stop_hit",
        decision_quality: "correct_discard",
        theoretical_r: -1,
        triggered_at: triggeredAt,
        resolved_at: candleTime(candle),
        max_favorable_r: round(maxFavorableR),
        max_adverse_r: round(maxAdverseR),
        notes: ["Stop was hit after entry trigger."],
      };
    }

    if (targetHit) {
      const theoreticalR = (target - entry) / riskPerShare;

      return {
        review_status: "reviewed",
        outcome: "target_hit",
        decision_quality: "missed_winner",
        theoretical_r: round(theoreticalR),
        triggered_at: triggeredAt,
        resolved_at: candleTime(candle),
        max_favorable_r: round(maxFavorableR),
        max_adverse_r: round(maxAdverseR),
        notes: ["Target was hit after entry trigger."],
      };
    }
  }

  if (!triggeredAt) {
    return {
      ...baseResult("reviewed", "entry_not_triggered", "correct_discard", [
        "Entry trigger was never reached.",
      ]),
      theoretical_r: 0,
    };
  }

  const outcome = maxFavorableR > 0 ? "partial_move" : "sideways";

  return {
    review_status: "reviewed",
    outcome,
    decision_quality: maxFavorableR >= 1 ? "missed_opportunity" : "neutral",
    theoretical_r: round(maxFavorableR),
    triggered_at: triggeredAt,
    resolved_at: null,
    max_favorable_r: round(maxFavorableR),
    max_adverse_r: round(maxAdverseR),
    notes: ["Entry triggered but neither target nor stop resolved before review window ended."],
  };
}

export async function fetchIntradayCandlesForReview(
  ticker: string,
  start: Date,
  end: Date,
) {
  return getIntradayCandles(ticker, "5min", start, end);
}

export async function saveDiscardReviewResult(
  ownerUserId: string,
  recommendation: DiscardReviewCandidate,
  result: DiscardReviewResult,
) {
  const owner = normalizeApplicationOwnerUserId(ownerUserId);
  if (!owner) throw new Error("application_owner_identity_unavailable");
  if (!recommendation.id) {
    return;
  }

  const reviewedAt = new Date().toISOString();
  const reasonToAvoid = recommendation.reason_to_avoid ?? "";
  const existingMetadata = parseDiscardMetadata(reasonToAvoid);

  // TODO: Add discard review metadata fields or metadata JSON column.
  const { data: updatedRecommendation, error } = await serverSupabase()
    .from("recommendations")
    .update({
      reason_to_avoid: `${stripExistingDiscardMetadata(reasonToAvoid)}${buildDiscardMetadata(
        result,
        reviewedAt,
        existingMetadata,
        recommendation,
      )}`,
    })
    .eq("id", recommendation.id)
    .eq("owner_user_id", owner)
    .select("id")
    .maybeSingle();

  if (error || !updatedRecommendation) {
    throw error ?? new Error("Owned recommendation was not updated.");
  }
}

export async function reviewPendingDiscardedRecommendations(options: {
  ownerUserId: string;
  now?: Date;
  maxReviews?: number;
}) {
  const now = options?.now ?? new Date();
  const maxReviews = options?.maxReviews ?? MAX_DISCARD_REVIEWS_PER_RUN;
  const candidates = (
    await getPendingDiscardedRecommendationsForReview(options.ownerUserId, now)
  ).slice(0, maxReviews);
  const results: {
    ticker: string | null | undefined;
    review_status: DiscardReviewStatus;
    outcome: DiscardOutcome;
    error?: string;
  }[] = [];

  for (const recommendation of candidates) {
    try {
      const { start, end } = getReviewWindow(recommendation, now);
      const candles = await fetchIntradayCandlesForReview(
        recommendation.ticker ?? "",
        start,
        end,
      );
      const result = reviewDiscardedRecommendationOutcome(recommendation, candles);
      await saveDiscardReviewResult(options.ownerUserId, recommendation, result);
      results.push({
        ticker: recommendation.ticker,
        review_status: result.review_status,
        outcome: result.outcome,
      });
    } catch (error) {
      const message =
        error instanceof Error && error.message ? error.message : "Unknown error";

      console.error("[discard-review] review error", {
        ticker: recommendation.ticker,
        error: message,
      });
      results.push({
        ticker: recommendation.ticker,
        review_status: "error",
        outcome: "unknown",
        error: message,
      });
    }
  }

  return {
    candidates_count: candidates.length,
    reviewed_count: results.filter((result) => result.review_status === "reviewed")
      .length,
    skipped_count: results.filter((result) => result.review_status === "skipped")
      .length,
    error_count: results.filter((result) => result.review_status === "error")
      .length,
    results,
  };
}

export async function getPendingDiscardedRecommendationsForReview(
  ownerUserId: string,
  now = new Date(),
) {
  const owner = normalizeApplicationOwnerUserId(ownerUserId);
  if (!owner) throw new Error("application_owner_identity_unavailable");
  const since = new Date(now.getTime() - reviewWindowMs).toISOString();

  // TODO: Add discard review metadata fields or metadata JSON column.
  const { data, error } = await serverSupabase()
    .from("recommendations")
    .select("*")
    .eq("owner_user_id", owner)
    .in("status", ["ignored", "discarded", "rejected"])
    .gte("created_at", since);

  if (error) {
    throw error;
  }

  return ((data ?? []) as DiscardReviewCandidate[]).filter((recommendation) =>
    isDiscardReviewEligible(recommendation, now),
  );
}
