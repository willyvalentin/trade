import { getSetupTypeLabel, normalizeSetupType, type SetupType } from "@/lib/setup-types";

export type CalibrationBucket = {
  key: string;
  label: string;
  total_items: number;
  closed_trades: number;
  discarded_setups: number;
  wins: number;
  losses: number;
  breakeven: number;
  win_rate: number | null;
  average_r: number | null;
  median_r: number | null;
  average_pnl: number | null;
  average_confidence: number | null;
  missed_winners: number;
  correct_discards: number;
  no_trade_count?: number;
  notes: string[];
};

export type CalibrationInsight = {
  code: string;
  severity: "positive" | "neutral" | "warning" | "negative";
  title: string;
  description: string;
};

export type RecommendationCalibrationResult = {
  generated_at: string;
  total_recommendations_analyzed: number;
  total_closed_trades: number;
  total_discarded_setups: number;
  total_scan_no_trade: number;
  confidence_buckets: CalibrationBucket[];
  setup_type_buckets: CalibrationBucket[];
  scan_decision_summary: {
    recommendation_created: number;
    no_trade: number;
    skipped: number;
    provider_or_openai_errors: number;
  };
  insights: CalibrationInsight[];
};

export type RecommendationCalibrationRecommendation = {
  id?: string | null;
  setup_type?: unknown;
  confidence_score?: number | null;
  status?: string | null;
};

export type RecommendationCalibrationClosedTrade = {
  recommendation_id?: string | null;
  setup_type?: unknown;
  confidence_score?: number | null;
  pnl?: number | null;
  r_multiple?: number | null;
};

export type RecommendationCalibrationDiscard = {
  id?: string | null;
  recommendation_id?: string | null;
  setup_type?: unknown;
  confidence_score?: number | null;
  decision_quality?: string | null;
};

export type RecommendationCalibrationScanLog = {
  result?: string | null;
  recommendations_created?: number | null;
};

export type BuildRecommendationCalibrationInput = {
  recommendations?: RecommendationCalibrationRecommendation[];
  closedTrades?: RecommendationCalibrationClosedTrade[];
  discardedSetups?: RecommendationCalibrationDiscard[];
  scanLogs?: RecommendationCalibrationScanLog[];
  generatedAt?: string;
};

const setupTypes: SetupType[] = [
  "VWAP_RECLAIM",
  "VWAP_HOLD_CONTINUATION",
  "BREAKOUT_CONTINUATION",
  "PULLBACK_CONTINUATION",
  "OPENING_RANGE_BREAKOUT",
  "HIGH_OF_DAY_BREAKOUT",
  "REVERSAL_FROM_SUPPORT",
  "FAILED_BREAKDOWN_RECLAIM",
  "UNKNOWN",
];

const confidenceBucketDefinitions = [
  { key: "90_100", label: "Very high confidence", min: 90, max: 100 },
  { key: "80_89", label: "High confidence", min: 80, max: 89.999 },
  { key: "70_79", label: "Medium confidence", min: 70, max: 79.999 },
  { key: "60_69", label: "Low confidence", min: 60, max: 69.999 },
  {
    key: "very_low_unknown",
    label: "Very low / unknown",
    min: Number.NEGATIVE_INFINITY,
    max: 59.999,
  },
];

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function average(values: number[]) {
  return values.length === 0
    ? null
    : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function median(values: number[]) {
  if (values.length === 0) return null;

  const sorted = [...values].sort((first, second) => first - second);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function createBucket(key: string, label: string): CalibrationBucket {
  return {
    key,
    label,
    total_items: 0,
    closed_trades: 0,
    discarded_setups: 0,
    wins: 0,
    losses: 0,
    breakeven: 0,
    win_rate: null,
    average_r: null,
    median_r: null,
    average_pnl: null,
    average_confidence: null,
    missed_winners: 0,
    correct_discards: 0,
    notes: [],
  };
}

function buildBucketMap(keys: { key: string; label: string }[]) {
  return new Map(keys.map((item) => [item.key, createBucket(item.key, item.label)]));
}

function confidenceBucketKey(score: number | null) {
  if (score === null) return "very_low_unknown";

  return (
    confidenceBucketDefinitions.find(
      (bucket) => score >= bucket.min && score <= bucket.max,
    )?.key ?? "very_low_unknown"
  );
}

function scanDecisionSummary(scanLogs: RecommendationCalibrationScanLog[]) {
  const summary = {
    recommendation_created: 0,
    no_trade: 0,
    skipped: 0,
    provider_or_openai_errors: 0,
  };

  for (const log of scanLogs) {
    const result = typeof log.result === "string" ? log.result : "unknown";
    const created = finiteNumber(log.recommendations_created) ?? 0;

    if (created > 0 || result === "recommendation_created") {
      summary.recommendation_created += Math.max(1, created);
      continue;
    }

    if (result === "openai_no_trade" || result === "no_high_quality_setup") {
      summary.no_trade += 1;
      continue;
    }

    if (
      result === "provider_error" ||
      result === "provider_rate_limited" ||
      result === "openai_error"
    ) {
      summary.provider_or_openai_errors += 1;
      continue;
    }

    if (
      result === "market_closed" ||
      result === "pre_market" ||
      result === "pre_market_watchlist_updated" ||
      result === "pre_market_no_candidates" ||
      result === "pre_market_skipped_holiday" ||
      result === "power_hour_blocked" ||
      result === "recommendation_limit_reached" ||
      result === "duplicate_ticker_skipped" ||
      result === "active_position_exists" ||
      result === "skipped"
    ) {
      summary.skipped += 1;
    }
  }

  return summary;
}

function insight(
  code: string,
  severity: CalibrationInsight["severity"],
  title: string,
  description: string,
): CalibrationInsight {
  return { code, severity, title, description };
}

function finalizeBucket(
  bucket: CalibrationBucket,
  values: {
    rValues: number[];
    pnlValues: number[];
    confidenceValues: number[];
  },
) {
  bucket.win_rate =
    bucket.closed_trades > 0 ? (bucket.wins / bucket.closed_trades) * 100 : null;
  bucket.average_r = average(values.rValues);
  bucket.median_r = median(values.rValues);
  bucket.average_pnl = average(values.pnlValues);
  bucket.average_confidence = average(values.confidenceValues);

  if (bucket.closed_trades > 0 && bucket.closed_trades < 3) {
    bucket.notes.push("Small sample.");
  }

  if (bucket.discarded_setups > 0 && bucket.closed_trades === 0) {
    bucket.notes.push("Discard-only bucket.");
  }

  if (bucket.missed_winners > bucket.correct_discards && bucket.discarded_setups > 0) {
    bucket.notes.push("Missed winners exceed correct discards.");
  }
}

export function buildRecommendationCalibration({
  recommendations = [],
  closedTrades = [],
  discardedSetups = [],
  scanLogs = [],
  generatedAt = new Date().toISOString(),
}: BuildRecommendationCalibrationInput): RecommendationCalibrationResult {
  const confidenceBuckets = buildBucketMap(confidenceBucketDefinitions);
  const setupBuckets = buildBucketMap(
    setupTypes.map((setupType) => ({
      key: setupType,
      label: getSetupTypeLabel(setupType),
    })),
  );
  const valueStore = new Map<
    CalibrationBucket,
    { rValues: number[]; pnlValues: number[]; confidenceValues: number[] }
  >();
  const recommendationIds = new Set(
    recommendations
      .map((recommendation) => recommendation.id)
      .filter((id): id is string => typeof id === "string" && id.length > 0),
  );

  function valuesFor(bucket: CalibrationBucket) {
    const existing = valueStore.get(bucket);
    if (existing) return existing;

    const created = {
      rValues: [] as number[],
      pnlValues: [] as number[],
      confidenceValues: [] as number[],
    };
    valueStore.set(bucket, created);
    return created;
  }

  function addRecommendation(score: number | null, setupType: SetupType) {
    const confidenceBucket = confidenceBuckets.get(confidenceBucketKey(score));
    const setupBucket = setupBuckets.get(setupType) ?? setupBuckets.get("UNKNOWN");

    for (const bucket of [confidenceBucket, setupBucket]) {
      if (!bucket) continue;
      bucket.total_items += 1;
      if (score !== null) valuesFor(bucket).confidenceValues.push(score);
    }
  }

  function addClosedTrade(trade: RecommendationCalibrationClosedTrade) {
    const score = finiteNumber(trade.confidence_score);
    const setupType = normalizeSetupType(trade.setup_type);
    const confidenceBucket = confidenceBuckets.get(confidenceBucketKey(score));
    const setupBucket = setupBuckets.get(setupType) ?? setupBuckets.get("UNKNOWN");
    const pnl = finiteNumber(trade.pnl);
    const rMultiple = finiteNumber(trade.r_multiple);

    for (const bucket of [confidenceBucket, setupBucket]) {
      if (!bucket) continue;

      if (
        !trade.recommendation_id ||
        !recommendationIds.has(trade.recommendation_id)
      ) {
        bucket.total_items += 1;
      }

      bucket.closed_trades += 1;
      if (score !== null) valuesFor(bucket).confidenceValues.push(score);
      if (rMultiple !== null) valuesFor(bucket).rValues.push(rMultiple);
      if (pnl !== null) {
        valuesFor(bucket).pnlValues.push(pnl);
        if (pnl > 0) bucket.wins += 1;
        else if (pnl < 0) bucket.losses += 1;
        else bucket.breakeven += 1;
      }
    }
  }

  function addDiscard(discard: RecommendationCalibrationDiscard) {
    const score = finiteNumber(discard.confidence_score);
    const setupType = normalizeSetupType(discard.setup_type);
    const confidenceBucket = confidenceBuckets.get(confidenceBucketKey(score));
    const setupBucket = setupBuckets.get(setupType) ?? setupBuckets.get("UNKNOWN");

    for (const bucket of [confidenceBucket, setupBucket]) {
      if (!bucket) continue;

      bucket.discarded_setups += 1;
      if (score !== null) valuesFor(bucket).confidenceValues.push(score);

      if (discard.decision_quality === "missed_winner") {
        bucket.missed_winners += 1;
      } else if (discard.decision_quality === "correct_discard") {
        bucket.correct_discards += 1;
      }
    }
  }

  for (const recommendation of recommendations) {
    addRecommendation(
      finiteNumber(recommendation.confidence_score),
      normalizeSetupType(recommendation.setup_type),
    );
  }

  for (const trade of closedTrades) {
    addClosedTrade(trade);
  }

  for (const discard of discardedSetups) {
    addDiscard(discard);
  }

  for (const bucket of [...confidenceBuckets.values(), ...setupBuckets.values()]) {
    finalizeBucket(bucket, valuesFor(bucket));
  }

  const confidenceBucketList = [...confidenceBuckets.values()].sort(
    (first, second) => {
      const firstIndex = confidenceBucketDefinitions.findIndex(
        (bucket) => bucket.key === first.key,
      );
      const secondIndex = confidenceBucketDefinitions.findIndex(
        (bucket) => bucket.key === second.key,
      );
      return firstIndex - secondIndex;
    },
  );
  const setupBucketList = [...setupBuckets.values()].sort(
    (first, second) =>
      second.closed_trades - first.closed_trades ||
      second.total_items - first.total_items ||
      (second.average_r ?? -Infinity) - (first.average_r ?? -Infinity),
  );
  const decisionSummary = scanDecisionSummary(scanLogs);
  const insights: CalibrationInsight[] = [];
  const highConfidenceBuckets = confidenceBucketList.filter((bucket) =>
    ["90_100", "80_89"].includes(bucket.key),
  );
  const lowConfidenceBuckets = confidenceBucketList.filter((bucket) =>
    ["60_69", "very_low_unknown"].includes(bucket.key),
  );
  const highConfidenceAverageR = average(
    highConfidenceBuckets
      .map((bucket) => bucket.average_r)
      .filter((value): value is number => value !== null),
  );
  const lowConfidenceAverageR = average(
    lowConfidenceBuckets
      .map((bucket) => bucket.average_r)
      .filter((value): value is number => value !== null),
  );
  const eligibleSetupBuckets = setupBucketList.filter(
    (bucket) => bucket.closed_trades >= 3 && bucket.average_r !== null,
  );
  const overestimatedSetup = eligibleSetupBuckets.find(
    (bucket) =>
      (bucket.average_confidence ?? 0) >= 80 && (bucket.average_r ?? 0) < 0,
  );
  const underestimatedSetup = eligibleSetupBuckets.find(
    (bucket) =>
      (bucket.average_confidence ?? 100) < 75 && (bucket.average_r ?? 0) > 0.5,
  );
  const missedWinnerBucket = setupBucketList.find(
    (bucket) => bucket.missed_winners > bucket.correct_discards,
  );

  if (closedTrades.length < 5) {
    insights.push(
      insight(
        "not_enough_closed_trades",
        "neutral",
        "Not enough closed trades yet",
        "Need at least five closed trades before recommendation calibration becomes reliable.",
      ),
    );
  }

  if (
    highConfidenceAverageR !== null &&
    lowConfidenceAverageR !== null &&
    highConfidenceAverageR > 0 &&
    highConfidenceAverageR >= lowConfidenceAverageR + 0.25
  ) {
    insights.push(
      insight(
        "confidence_directionally_aligned",
        "positive",
        "Confidence scores are directionally aligned",
        `High-confidence trades average ${highConfidenceAverageR.toFixed(2)}R vs lower-confidence trades at ${lowConfidenceAverageR.toFixed(2)}R.`,
      ),
    );
  }

  if (highConfidenceAverageR !== null && highConfidenceAverageR < 0) {
    insights.push(
      insight(
        "high_confidence_underperforming",
        "warning",
        "High-confidence trades are not yet outperforming",
        `High-confidence buckets average ${highConfidenceAverageR.toFixed(2)}R. Review confidence breakdowns before changing scoring.`,
      ),
    );
  }

  if (
    highConfidenceAverageR !== null &&
    lowConfidenceAverageR !== null &&
    lowConfidenceAverageR > highConfidenceAverageR + 0.25
  ) {
    insights.push(
      insight(
        "confidence_miscalibration",
        "warning",
        "Confidence may be miscalibrated",
        `Lower-confidence buckets average ${lowConfidenceAverageR.toFixed(2)}R vs high-confidence buckets at ${highConfidenceAverageR.toFixed(2)}R.`,
      ),
    );
  }

  if (overestimatedSetup) {
    insights.push(
      insight(
        "setup_overestimated",
        "warning",
        `${overestimatedSetup.label} may be overestimated`,
        `${overestimatedSetup.label} averages ${overestimatedSetup.average_confidence?.toFixed(0) ?? "—"}/100 confidence but ${overestimatedSetup.average_r?.toFixed(2) ?? "—"}R.`,
      ),
    );
  }

  if (underestimatedSetup) {
    insights.push(
      insight(
        "setup_underestimated",
        "positive",
        `${underestimatedSetup.label} may be underestimated`,
        `${underestimatedSetup.label} averages ${underestimatedSetup.average_confidence?.toFixed(0) ?? "—"}/100 confidence and ${underestimatedSetup.average_r?.toFixed(2) ?? "—"}R.`,
      ),
    );
  }

  if (missedWinnerBucket) {
    insights.push(
      insight(
        "discarded_setup_strictness",
        "warning",
        "Discarded setups may be too strict for one setup type",
        `${missedWinnerBucket.label} has ${missedWinnerBucket.missed_winners} missed winners vs ${missedWinnerBucket.correct_discards} correct discards.`,
      ),
    );
  }

  if (
    decisionSummary.no_trade >= Math.max(3, decisionSummary.recommendation_created * 2) &&
    scanLogs.length > 0
  ) {
    insights.push(
      insight(
        "scanner_highly_selective",
        "neutral",
        "Scanner is highly selective",
        `${decisionSummary.no_trade} scans produced no-trade decisions vs ${decisionSummary.recommendation_created} created recommendations.`,
      ),
    );
  }

  if (
    decisionSummary.recommendation_created >= 5 &&
    highConfidenceAverageR !== null &&
    highConfidenceAverageR < 0
  ) {
    insights.push(
      insight(
        "recommendations_permissive",
        "warning",
        "Recommendation generation may be too permissive",
        "Several recommendations were created, but higher-confidence outcomes are weak so far.",
      ),
    );
  }

  return {
    generated_at: generatedAt,
    total_recommendations_analyzed: recommendations.length,
    total_closed_trades: closedTrades.length,
    total_discarded_setups: discardedSetups.length,
    total_scan_no_trade: decisionSummary.no_trade,
    confidence_buckets: confidenceBucketList,
    setup_type_buckets: setupBucketList,
    scan_decision_summary: decisionSummary,
    insights: insights.slice(0, 5),
  };
}
