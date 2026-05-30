import type { RecommendationLearningInsightsSummary } from "@/lib/recommendation-learning-insights";
import type {
  RecommendationPerformanceConfidenceBucket,
  RecommendationPerformanceStatistics,
} from "@/lib/recommendation-performance-statistics";
import type { RecommendationSampleQualitySummary } from "@/lib/recommendation-sample-quality";
import type { RecommendationTierPerformanceSummary } from "@/lib/recommendation-tier-performance";
import type { StatisticsTimeRange } from "@/lib/statistics-dashboard";

export type ConfidenceCalibrationReadinessStatus =
  | "not_enough_data"
  | "blocked_by_incomplete_outcomes"
  | "blocked_by_missing_confidence"
  | "too_skewed"
  | "early_observation_only"
  | "directionally_ready"
  | "ready_for_preliminary_calibration"
  | "unknown";

export type ConfidenceCalibrationReadinessCheck = {
  check_id: string;
  label: string;
  status: "pass" | "warn" | "block" | "unknown";
  value: number | string | null;
  unit: "count" | "percent" | "text" | "none";
  message: string;
};

export type ConfidenceCalibrationBucketSignal = {
  bucket_id: string;
  label: string;
  recommendation_count: number;
  evaluated_count: number;
  recommendation_share: number | null;
  evaluated_share: number | null;
  target_before_stop_rate: number | null;
  stop_before_target_rate: number | null;
  average_best_r: number | null;
  average_worst_r: number | null;
  average_eod_r: number | null;
  sample_status: "empty" | "thin" | "usable" | "unknown";
};

export type ConfidenceCalibrationWarning = {
  warning_id: string;
  severity: "info" | "warning" | "critical";
  message: string;
};

export type ConfidenceCalibrationBlocker = {
  blocker_id: string;
  severity: "warning" | "critical";
  message: string;
};

export type ConfidenceCalibrationSuggestion = {
  suggestion_id: string;
  priority: "low" | "medium" | "high";
  message: string;
};

export type ConfidenceCalibrationReadinessSummary = {
  summary_id: string;
  summary_version: "1.0";
  generated_at: string;
  range: StatisticsTimeRange;
  source_scope: RecommendationPerformanceStatistics["source_scope"];
  status: ConfidenceCalibrationReadinessStatus;
  total_recommendations: number;
  evaluated_recommendations: number;
  confidence_coverage_rate: number | null;
  confidence_missing_rate: number | null;
  outcome_evaluated_rate: number | null;
  outcome_incomplete_or_unknown_rate: number | null;
  populated_bucket_count: number;
  usable_bucket_count: number;
  bucket_signals: ConfidenceCalibrationBucketSignal[];
  monotonicity: {
    target_before_stop_direction:
      | "improving"
      | "mixed"
      | "weak"
      | "not_enough_data"
      | "unknown";
    average_best_r_direction:
      | "improving"
      | "mixed"
      | "weak"
      | "not_enough_data"
      | "unknown";
    stop_before_target_direction:
      | "improving"
      | "mixed"
      | "weak"
      | "not_enough_data"
      | "unknown";
    higher_confidence_outperforming: boolean | null;
    notes: string[];
  };
  overconfidence: {
    detected: boolean | null;
    message: string;
  };
  underconfidence: {
    detected: boolean | null;
    message: string;
  };
  calibration_recommendation:
    | "collect_more_samples"
    | "improve_outcome_completeness"
    | "improve_confidence_coverage"
    | "reduce_sample_skew"
    | "keep_observing"
    | "ready_for_preliminary_calibration_analysis"
    | "unknown";
  checks: ConfidenceCalibrationReadinessCheck[];
  blockers: ConfidenceCalibrationBlocker[];
  warnings: ConfidenceCalibrationWarning[];
  suggestions: ConfidenceCalibrationSuggestion[];
  copy: {
    purpose: string;
    sample_size: string;
    wait: string;
  };
};

export type ConfidenceCalibrationReadinessInput = {
  performance: RecommendationPerformanceStatistics;
  tier_performance?: RecommendationTierPerformanceSummary | null;
  learning_insights?: RecommendationLearningInsightsSummary | null;
  sample_quality?: RecommendationSampleQualitySummary | null;
  range?: StatisticsTimeRange;
  now?: Date | string | null;
  source_scope?: RecommendationPerformanceStatistics["source_scope"];
  thresholds?: Partial<ConfidenceCalibrationReadinessThresholds>;
};

export type ConfidenceCalibrationReadinessThresholds = {
  minimum_evaluated: number;
  directional_evaluated: number;
  preliminary_evaluated: number;
  minimum_confidence_coverage_rate: number;
  minimum_outcome_evaluated_rate: number;
  maximum_incomplete_or_unknown_rate: number;
  maximum_single_bucket_rate: number;
  minimum_usable_bucket_evaluated_count: number;
  minimum_populated_buckets: number;
  minimum_usable_buckets: number;
  directional_delta_percent: number;
  directional_delta_r: number;
};

const defaultThresholds: ConfidenceCalibrationReadinessThresholds = {
  minimum_evaluated: 20,
  directional_evaluated: 50,
  preliminary_evaluated: 100,
  minimum_confidence_coverage_rate: 70,
  minimum_outcome_evaluated_rate: 50,
  maximum_incomplete_or_unknown_rate: 35,
  maximum_single_bucket_rate: 70,
  minimum_usable_bucket_evaluated_count: 5,
  minimum_populated_buckets: 3,
  minimum_usable_buckets: 2,
  directional_delta_percent: 5,
  directional_delta_r: 0.2,
};

function percent(part: number, total: number) {
  return total > 0 ? (part / total) * 100 : null;
}

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function toDate(value: Date | string | null | undefined) {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date : null;
  }

  return null;
}

function bucketSampleStatus(
  bucket: RecommendationPerformanceConfidenceBucket,
  thresholds: ConfidenceCalibrationReadinessThresholds,
): ConfidenceCalibrationBucketSignal["sample_status"] {
  if (bucket.recommendation_count <= 0) {
    return "empty";
  }

  if (bucket.evaluated_count >= thresholds.minimum_usable_bucket_evaluated_count) {
    return "usable";
  }

  return "thin";
}

function buildBucketSignals(
  performance: RecommendationPerformanceStatistics,
  thresholds: ConfidenceCalibrationReadinessThresholds,
) {
  const totalRecommendations = performance.summary.total_recommendations;
  const totalEvaluated = performance.summary.evaluated_recommendations;

  return performance.confidence_buckets.map((bucket) => ({
    bucket_id: bucket.bucket_id,
    label: bucket.label,
    recommendation_count: bucket.recommendation_count,
    evaluated_count: bucket.evaluated_count,
    recommendation_share: percent(bucket.recommendation_count, totalRecommendations),
    evaluated_share: percent(bucket.evaluated_count, totalEvaluated),
    target_before_stop_rate: bucket.target_before_stop_rate,
    stop_before_target_rate: bucket.stop_before_target_rate,
    average_best_r: bucket.average_best_r,
    average_worst_r: bucket.average_worst_r,
    average_eod_r: bucket.average_eod_r,
    sample_status: bucketSampleStatus(bucket, thresholds),
  }));
}

function usableOrderedBuckets(
  bucketSignals: ConfidenceCalibrationBucketSignal[],
) {
  return bucketSignals.filter(
    (bucket) => bucket.bucket_id !== "unknown" && bucket.sample_status === "usable",
  );
}

function directionFromSeries(
  buckets: ConfidenceCalibrationBucketSignal[],
  metric: keyof Pick<
    ConfidenceCalibrationBucketSignal,
    "target_before_stop_rate" | "average_best_r" | "stop_before_target_rate"
  >,
  thresholds: ConfidenceCalibrationReadinessThresholds,
  lowerIsBetter = false,
) {
  const values = buckets
    .map((bucket) => finiteNumber(bucket[metric]))
    .filter((value): value is number => value !== null);

  if (values.length < 2) {
    return "not_enough_data" as const;
  }

  let improving = 0;
  let declining = 0;
  const deltaThreshold =
    metric === "average_best_r"
      ? thresholds.directional_delta_r
      : thresholds.directional_delta_percent;

  for (let index = 1; index < values.length; index += 1) {
    const rawDelta = values[index] - values[index - 1];
    const delta = lowerIsBetter ? -rawDelta : rawDelta;

    if (delta >= deltaThreshold) {
      improving += 1;
    } else if (delta <= -deltaThreshold) {
      declining += 1;
    }
  }

  if (improving > 0 && declining === 0) {
    return "improving" as const;
  }

  if (improving > 0 && declining > 0) {
    return "mixed" as const;
  }

  if (declining > 0) {
    return "mixed" as const;
  }

  return "weak" as const;
}

function findBucket(
  bucketSignals: ConfidenceCalibrationBucketSignal[],
  bucketId: string,
) {
  return bucketSignals.find((bucket) => bucket.bucket_id === bucketId) ?? null;
}

function bucketOutperforms(
  candidate: ConfidenceCalibrationBucketSignal | null,
  baseline: ConfidenceCalibrationBucketSignal | null,
  thresholds: ConfidenceCalibrationReadinessThresholds,
) {
  if (
    !candidate ||
    !baseline ||
    candidate.sample_status !== "usable" ||
    baseline.sample_status !== "usable"
  ) {
    return false;
  }

  const candidateTargetRate = finiteNumber(candidate.target_before_stop_rate);
  const baselineTargetRate = finiteNumber(baseline.target_before_stop_rate);
  const candidateBestR = finiteNumber(candidate.average_best_r);
  const baselineBestR = finiteNumber(baseline.average_best_r);
  const candidateStopRate = finiteNumber(candidate.stop_before_target_rate);
  const baselineStopRate = finiteNumber(baseline.stop_before_target_rate);

  return (
    (candidateTargetRate !== null &&
      baselineTargetRate !== null &&
      candidateTargetRate >=
        baselineTargetRate + thresholds.directional_delta_percent) ||
    (candidateBestR !== null &&
      baselineBestR !== null &&
      candidateBestR >= baselineBestR + thresholds.directional_delta_r) ||
    (candidateStopRate !== null &&
      baselineStopRate !== null &&
      candidateStopRate <=
        baselineStopRate - thresholds.directional_delta_percent)
  );
}

function addCheck(
  checks: ConfidenceCalibrationReadinessCheck[],
  check: ConfidenceCalibrationReadinessCheck,
) {
  checks.push(check);
}

export function buildConfidenceCalibrationReadinessSummary({
  performance,
  sample_quality,
  range,
  now,
  source_scope,
  thresholds: thresholdOverrides,
}: ConfidenceCalibrationReadinessInput): ConfidenceCalibrationReadinessSummary {
  const thresholds = { ...defaultThresholds, ...thresholdOverrides };
  const generatedAt = (toDate(now) ?? new Date()).toISOString();
  const totalRecommendations = performance.summary.total_recommendations;
  const evaluatedRecommendations = performance.summary.evaluated_recommendations;
  const outcomeEvaluatedRate =
    sample_quality?.outcome_completeness.evaluated_rate ??
    percent(evaluatedRecommendations, totalRecommendations);
  const incompleteOrUnknownCount =
    performance.summary.incomplete_outcomes + performance.summary.unknown_outcomes;
  const sampleQualityIncompleteRate =
    sample_quality?.outcome_completeness.incomplete_rate ?? null;
  const sampleQualityUnknownRate =
    sample_quality?.outcome_completeness.unknown_rate ?? null;
  const outcomeIncompleteOrUnknownRate =
    sampleQualityIncompleteRate !== null || sampleQualityUnknownRate !== null
      ? (sampleQualityIncompleteRate ?? 0) + (sampleQualityUnknownRate ?? 0)
      : percent(incompleteOrUnknownCount, totalRecommendations);
  const unknownConfidenceBucket = performance.confidence_buckets.find(
    (bucket) => bucket.bucket_id === "unknown",
  );
  const confidenceMissingRate = percent(
    unknownConfidenceBucket?.recommendation_count ?? 0,
    totalRecommendations,
  );
  const confidenceCoverageRate =
    confidenceMissingRate === null ? null : 100 - confidenceMissingRate;
  const bucketSignals = buildBucketSignals(performance, thresholds);
  const populatedBucketCount = bucketSignals.filter(
    (bucket) => bucket.bucket_id !== "unknown" && bucket.recommendation_count > 0,
  ).length;
  const usableBucketCount = bucketSignals.filter(
    (bucket) => bucket.bucket_id !== "unknown" && bucket.sample_status === "usable",
  ).length;
  const largestKnownBucketShare =
    bucketSignals
      .filter((bucket) => bucket.bucket_id !== "unknown")
      .reduce<number | null>((maxShare, bucket) => {
        if (bucket.recommendation_share === null) {
          return maxShare;
        }

        return maxShare === null
          ? bucket.recommendation_share
          : Math.max(maxShare, bucket.recommendation_share);
      }, null) ?? null;

  const orderedUsableBuckets = usableOrderedBuckets(bucketSignals);
  const targetBeforeStopDirection = directionFromSeries(
    orderedUsableBuckets,
    "target_before_stop_rate",
    thresholds,
  );
  const averageBestRDirection = directionFromSeries(
    orderedUsableBuckets,
    "average_best_r",
    thresholds,
  );
  const stopBeforeTargetDirection = directionFromSeries(
    orderedUsableBuckets,
    "stop_before_target_rate",
    thresholds,
    true,
  );
  const higherConfidenceOutperforming =
    orderedUsableBuckets.length < 2
      ? null
      : targetBeforeStopDirection === "improving" ||
        averageBestRDirection === "improving" ||
        stopBeforeTargetDirection === "improving";
  const topBucket = findBucket(bucketSignals, "90_100");
  const highBucket = findBucket(bucketSignals, "75_89");
  const midBucket = findBucket(bucketSignals, "60_74");
  const topUnderperformsHigh =
    bucketOutperforms(highBucket, topBucket, thresholds) ||
    bucketOutperforms(midBucket, topBucket, thresholds);
  const highConfidenceReference =
    topBucket?.sample_status === "usable" ? topBucket : highBucket;
  const lowerBuckets = ["0_39", "40_59", "60_74"]
    .map((bucketId) => findBucket(bucketSignals, bucketId))
    .filter((bucket): bucket is ConfidenceCalibrationBucketSignal => bucket !== null);
  const lowerOutperformingHigh = lowerBuckets.some((bucket) =>
    bucketOutperforms(bucket, highConfidenceReference, thresholds),
  );

  const checks: ConfidenceCalibrationReadinessCheck[] = [];
  const blockers: ConfidenceCalibrationBlocker[] = [];
  const warnings: ConfidenceCalibrationWarning[] = [];
  const suggestions: ConfidenceCalibrationSuggestion[] = [];

  const sampleSizeStatus =
    evaluatedRecommendations < thresholds.minimum_evaluated
      ? "block"
      : evaluatedRecommendations < thresholds.directional_evaluated
        ? "warn"
        : "pass";
  addCheck(checks, {
    check_id: "evaluated_sample_size",
    label: "Evaluated sample size",
    status: sampleSizeStatus,
    value: evaluatedRecommendations,
    unit: "count",
    message:
      evaluatedRecommendations < thresholds.minimum_evaluated
        ? "Too few evaluated recommendations for confidence analysis."
        : evaluatedRecommendations < thresholds.directional_evaluated
          ? "Enough to observe, but too thin for strong calibration conclusions."
          : "Evaluated sample size is usable for directional confidence review.",
  });

  if (sampleSizeStatus === "block") {
    blockers.push({
      blocker_id: "evaluated_sample_size",
      severity: "critical",
      message:
        "Calibration should wait until at least 20 recommendations have evaluated outcomes.",
    });
    suggestions.push({
      suggestion_id: "collect_more_evaluated_samples",
      priority: "high",
      message: "Collect more evaluated recommendation snapshots before calibration.",
    });
  } else if (sampleSizeStatus === "warn") {
    warnings.push({
      warning_id: "thin_evaluated_sample",
      severity: "warning",
      message:
        "Evaluated confidence samples are still thin, so trends should be treated as early observation only.",
    });
  }

  const outcomeCompletenessBlocks =
    (outcomeEvaluatedRate !== null &&
      outcomeEvaluatedRate < thresholds.minimum_outcome_evaluated_rate) ||
    (outcomeIncompleteOrUnknownRate !== null &&
      outcomeIncompleteOrUnknownRate >
        thresholds.maximum_incomplete_or_unknown_rate);
  addCheck(checks, {
    check_id: "outcome_completeness",
    label: "Outcome completeness",
    status:
      outcomeEvaluatedRate === null
        ? "unknown"
        : outcomeCompletenessBlocks
          ? "block"
          : "pass",
    value: outcomeEvaluatedRate,
    unit: "percent",
    message:
      outcomeEvaluatedRate === null
        ? "No outcome sample is available for completeness review yet."
        : outcomeCompletenessBlocks
          ? "Too many outcomes are pending, incomplete, or unknown for calibration."
          : "Outcome coverage is sufficient for cautious readiness analysis.",
  });

  if (outcomeCompletenessBlocks) {
    blockers.push({
      blocker_id: "outcome_completeness",
      severity: "critical",
      message:
        "Confidence calibration should wait until more recommendation outcomes are evaluated.",
    });
    suggestions.push({
      suggestion_id: "improve_outcome_completeness",
      priority: "high",
      message: "Improve candle-backed outcome coverage before calibrating confidence.",
    });
  }

  const missingConfidenceBlocks =
    confidenceCoverageRate !== null &&
    confidenceCoverageRate < thresholds.minimum_confidence_coverage_rate;
  addCheck(checks, {
    check_id: "confidence_availability",
    label: "Confidence availability",
    status:
      confidenceCoverageRate === null
        ? "unknown"
        : missingConfidenceBlocks
          ? "block"
          : "pass",
    value: confidenceCoverageRate,
    unit: "percent",
    message:
      confidenceCoverageRate === null
        ? "No confidence sample is available for coverage review yet."
        : missingConfidenceBlocks
          ? "Too many recommendations are missing usable confidence values."
          : "Most recommendations have usable confidence values.",
  });

  if (missingConfidenceBlocks) {
    blockers.push({
      blocker_id: "confidence_availability",
      severity: "critical",
      message:
        "Calibration needs more recommendations with explicit confidence values.",
    });
    suggestions.push({
      suggestion_id: "improve_confidence_coverage",
      priority: "high",
      message: "Keep storing confidence values on recommendation snapshots.",
    });
  }

  const bucketCoverageSkewed =
    populatedBucketCount < thresholds.minimum_populated_buckets ||
    usableBucketCount < thresholds.minimum_usable_buckets ||
    (largestKnownBucketShare !== null &&
      largestKnownBucketShare > thresholds.maximum_single_bucket_rate);
  addCheck(checks, {
    check_id: "confidence_bucket_coverage",
    label: "Confidence bucket coverage",
    status: bucketCoverageSkewed ? "warn" : "pass",
    value: usableBucketCount,
    unit: "count",
    message: bucketCoverageSkewed
      ? "Confidence samples are concentrated or too thin across buckets."
      : "Confidence buckets are populated enough for directional review.",
  });

  if (bucketCoverageSkewed) {
    warnings.push({
      warning_id: "confidence_bucket_skew",
      severity: "warning",
      message:
        "Confidence bucket coverage is skewed, so calibration would risk learning from an unbalanced sample.",
    });
    suggestions.push({
      suggestion_id: "reduce_confidence_bucket_skew",
      priority: "medium",
      message: "Keep collecting recommendations across more confidence bands.",
    });
  }

  if (topUnderperformsHigh) {
    warnings.push({
      warning_id: "top_bucket_overconfidence",
      severity: "warning",
      message:
        "The 90-100 confidence bucket is not outperforming lower confidence buckets in evaluated samples yet.",
    });
  }

  if (lowerOutperformingHigh) {
    warnings.push({
      warning_id: "possible_underconfidence",
      severity: "warning",
      message:
        "Lower-confidence recommendations are outperforming higher-confidence recommendations in some evaluated samples.",
    });
  }

  if (sample_quality) {
    const topTickerShare =
      sample_quality.ticker_concentration.top_ticker_concentration ?? null;

    if (topTickerShare !== null && topTickerShare > 50) {
      warnings.push({
        warning_id: "ticker_concentration",
        severity: "warning",
        message:
          "Recommendation samples are concentrated in a small number of tickers, which can distort confidence analysis.",
      });
    }
  }

  if (sample_quality?.window_coverage.status === "skewed") {
    warnings.push({
      warning_id: "window_concentration",
      severity: "warning",
      message:
        "Day-trade-window coverage is skewed, so confidence signals may be window-specific.",
    });
  }

  const status: ConfidenceCalibrationReadinessStatus =
    evaluatedRecommendations < thresholds.minimum_evaluated
      ? "not_enough_data"
      : outcomeCompletenessBlocks
        ? "blocked_by_incomplete_outcomes"
        : missingConfidenceBlocks
          ? "blocked_by_missing_confidence"
          : bucketCoverageSkewed
            ? "too_skewed"
            : evaluatedRecommendations < thresholds.directional_evaluated
              ? "early_observation_only"
              : evaluatedRecommendations < thresholds.preliminary_evaluated
                ? "directionally_ready"
                : "ready_for_preliminary_calibration";

  const calibrationRecommendation =
    status === "not_enough_data"
      ? "collect_more_samples"
      : status === "blocked_by_incomplete_outcomes"
        ? "improve_outcome_completeness"
        : status === "blocked_by_missing_confidence"
          ? "improve_confidence_coverage"
          : status === "too_skewed"
            ? "reduce_sample_skew"
            : status === "ready_for_preliminary_calibration"
              ? "ready_for_preliminary_calibration_analysis"
              : "keep_observing";

  if (status === "directionally_ready") {
    suggestions.push({
      suggestion_id: "directional_review",
      priority: "medium",
      message:
        "Use confidence signals for observation only; wait for more samples before calibration changes.",
    });
  }

  if (status === "ready_for_preliminary_calibration") {
    suggestions.push({
      suggestion_id: "preliminary_calibration_review",
      priority: "medium",
      message:
        "The dataset is ready for a future preliminary calibration analysis, without changing scoring in this version.",
    });
  }

  const monotonicityNotes = [
    targetBeforeStopDirection === "improving"
      ? "Higher confidence buckets are directionally better on target-before-stop rate."
      : null,
    averageBestRDirection === "improving"
      ? "Higher confidence buckets are directionally better on average best R."
      : null,
    stopBeforeTargetDirection === "improving"
      ? "Higher confidence buckets are directionally better on stop-before-target behavior."
      : null,
    orderedUsableBuckets.length < 2
      ? "There are not enough usable confidence buckets for monotonicity review."
      : null,
  ].filter((note): note is string => note !== null);

  return {
    summary_id: "confidence-calibration-readiness-v1",
    summary_version: "1.0",
    generated_at: generatedAt,
    range: range ?? performance.range,
    source_scope: source_scope ?? performance.source_scope,
    status,
    total_recommendations: totalRecommendations,
    evaluated_recommendations: evaluatedRecommendations,
    confidence_coverage_rate: confidenceCoverageRate,
    confidence_missing_rate: confidenceMissingRate,
    outcome_evaluated_rate: outcomeEvaluatedRate,
    outcome_incomplete_or_unknown_rate: outcomeIncompleteOrUnknownRate,
    populated_bucket_count: populatedBucketCount,
    usable_bucket_count: usableBucketCount,
    bucket_signals: bucketSignals,
    monotonicity: {
      target_before_stop_direction: targetBeforeStopDirection,
      average_best_r_direction: averageBestRDirection,
      stop_before_target_direction: stopBeforeTargetDirection,
      higher_confidence_outperforming: higherConfidenceOutperforming,
      notes: monotonicityNotes,
    },
    overconfidence: {
      detected: orderedUsableBuckets.length < 2 ? null : topUnderperformsHigh,
      message:
        orderedUsableBuckets.length < 2
          ? "Not enough usable confidence buckets to evaluate overconfidence."
          : topUnderperformsHigh
            ? "Top confidence is not outperforming lower buckets yet."
            : "No top-bucket overconfidence signal detected in evaluated samples.",
    },
    underconfidence: {
      detected: orderedUsableBuckets.length < 2 ? null : lowerOutperformingHigh,
      message:
        orderedUsableBuckets.length < 2
          ? "Not enough usable confidence buckets to evaluate underconfidence."
          : lowerOutperformingHigh
            ? "Some lower-confidence buckets are outperforming higher-confidence buckets."
            : "No underconfidence signal detected in evaluated samples.",
    },
    calibration_recommendation: calibrationRecommendation,
    checks,
    blockers,
    warnings,
    suggestions,
    copy: {
      purpose:
        "This section evaluates whether confidence scores are ready to be calibrated. It does not change scoring.",
      sample_size:
        "Small samples can make confidence look better or worse than it is.",
      wait:
        "Calibration should wait until outcomes and confidence buckets are sufficiently populated.",
    },
  };
}

export function confidenceCalibrationReadinessSummaryJson(
  summary: ConfidenceCalibrationReadinessSummary,
) {
  return JSON.stringify(summary, null, 2);
}
