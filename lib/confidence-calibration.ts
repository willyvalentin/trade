export type TureConfidenceBucket =
  | "0_49"
  | "50_59"
  | "60_69"
  | "70_79"
  | "80_89"
  | "90_100"
  | "unknown";

export type TureConfidenceSampleConfidence = "low" | "medium" | "high";

export type TureConfidenceCalibrationLabel =
  | "too_early"
  | "underperforming"
  | "roughly_aligned"
  | "outperforming"
  | "unknown";

export type TureConfidenceCalibrationInputRow = {
  snapshot_identity?: string | null;
  confidence?: number | null;
  confidence_source?: "explicit" | "tier_fallback" | "missing" | string | null;
  visibility?: "visible" | "research_only" | "unknown_visibility" | string | null;
  entry_triggered?: boolean | null;
  entry_not_triggered?: boolean | null;
  target_hit?: boolean | null;
  stop_hit?: boolean | null;
  best_r?: number | null;
  worst_r?: number | null;
  terminal_r?: number | null;
  setup_family?: string | null;
  sector?: string | null;
  ticker?: string | null;
  regime?: string | null;
  quality_label?: string | null;
};

export type TureConfidenceCalibrationBucketSummary = {
  bucket: TureConfidenceBucket;
  min_confidence: number | null;
  max_confidence: number | null;
  outcome_count: number;
  unique_snapshot_count: number;
  visible_outcome_count: number;
  research_only_outcome_count: number;
  unknown_visibility_outcome_count: number;
  entry_triggered_count: number;
  entry_not_triggered_count: number;
  entry_trigger_rate: number | null;
  target_hit_count: number;
  stop_hit_count: number;
  neither_hit_count: number;
  avg_best_r: number | null;
  avg_worst_r: number | null;
  avg_terminal_r: number | null;
  setup_family_mix: Record<string, number>;
  sector_mix: Record<string, number>;
  ticker_mix: Record<string, number>;
  regime_mix: Record<string, number>;
  quality_mix: Record<string, number>;
  sample_confidence: TureConfidenceSampleConfidence;
  calibration_label: TureConfidenceCalibrationLabel;
  reason_codes: string[];
  caution_flags: string[];
  advisory_only: true;
};

export type TureConfidenceCalibrationSummary = {
  advisory_only: true;
  total_outcome_count: number;
  total_unique_snapshot_count: number;
  outcomes_with_confidence_count: number;
  unknown_confidence_count: number;
  buckets: TureConfidenceCalibrationBucketSummary[];
  monotonicity_check: {
    higher_confidence_outperforms_lower: boolean | null;
    reason_codes: string[];
    caution_flags: string[];
  };
  top_buckets: string[];
  weak_buckets: string[];
  metadata_gaps: string[];
  sample_confidence: TureConfidenceSampleConfidence;
};

const bucketDefinitions: Array<{
  bucket: TureConfidenceBucket;
  min: number | null;
  max: number | null;
}> = [
  { bucket: "0_49", min: 0, max: 49 },
  { bucket: "50_59", min: 50, max: 59 },
  { bucket: "60_69", min: 60, max: 69 },
  { bucket: "70_79", min: 70, max: 79 },
  { bucket: "80_89", min: 80, max: 89 },
  { bucket: "90_100", min: 90, max: 100 },
  { bucket: "unknown", min: null, max: null },
];

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function average(values: Array<number | null | undefined>) {
  const finiteValues = values.filter(
    (value): value is number => typeof value === "number" && Number.isFinite(value),
  );

  return finiteValues.length > 0
    ? finiteValues.reduce((sum, value) => sum + value, 0) / finiteValues.length
    : null;
}

function rate(part: number, total: number) {
  return total > 0 ? (part / total) * 100 : null;
}

function sampleConfidence(outcomeCount: number): TureConfidenceSampleConfidence {
  if (outcomeCount >= 100) return "high";
  if (outcomeCount >= 30) return "medium";
  return "low";
}

function normalizeKey(value: string | null | undefined, fallback = "unknown") {
  const text = value?.trim().toLowerCase() ?? "";
  return text.length > 0 ? text : fallback;
}

function normalizeTicker(value: string | null | undefined) {
  const text = value?.trim().toUpperCase() ?? "";
  return text.length > 0 ? text : "UNKNOWN";
}

function increment(record: Record<string, number>, key: string, amount = 1) {
  record[key] = (record[key] ?? 0) + amount;
}

function confidenceBucket(value: number | null | undefined): TureConfidenceBucket {
  const confidence = finiteNumber(value);
  if (confidence === null) return "unknown";
  if (confidence < 50) return "0_49";
  if (confidence < 60) return "50_59";
  if (confidence < 70) return "60_69";
  if (confidence < 80) return "70_79";
  if (confidence < 90) return "80_89";
  return "90_100";
}

export function bucketForConfidence(
  value: number | null | undefined,
): TureConfidenceBucket {
  return confidenceBucket(value);
}

function performanceScore(bucket: TureConfidenceCalibrationBucketSummary) {
  if (bucket.avg_best_r === null && bucket.avg_worst_r === null) return null;

  const best = bucket.avg_best_r ?? 0;
  const worstPenalty = Math.abs(Math.min(bucket.avg_worst_r ?? 0, 0)) * 0.4;
  const targetBonus = ((bucket.target_hit_count / Math.max(1, bucket.outcome_count)) || 0) * 0.5;
  const stopPenalty = ((bucket.stop_hit_count / Math.max(1, bucket.outcome_count)) || 0) * 0.5;

  return best - worstPenalty + targetBonus - stopPenalty;
}

function labelBucket(
  bucket: TureConfidenceCalibrationBucketSummary,
  lowerBuckets: TureConfidenceCalibrationBucketSummary[],
): TureConfidenceCalibrationLabel {
  if (bucket.outcome_count === 0) return "unknown";
  if (bucket.sample_confidence === "low") return "too_early";

  const score = performanceScore(bucket);
  const lowerScores = lowerBuckets
    .filter((item) => item.sample_confidence !== "low")
    .map(performanceScore)
    .filter((value): value is number => value !== null);

  if (score === null || lowerScores.length === 0) return "unknown";

  const lowerAverage =
    lowerScores.reduce((sum, value) => sum + value, 0) / lowerScores.length;
  if (score >= lowerAverage + 0.15) return "outperforming";
  if (score <= lowerAverage - 0.15) return "underperforming";
  return "roughly_aligned";
}

function buildMonotonicityCheck(
  buckets: TureConfidenceCalibrationBucketSummary[],
): TureConfidenceCalibrationSummary["monotonicity_check"] {
  const eligible = buckets.filter(
    (bucket) =>
      bucket.bucket !== "unknown" &&
      bucket.sample_confidence !== "low" &&
      performanceScore(bucket) !== null,
  );

  if (eligible.length < 2) {
    return {
      higher_confidence_outperforms_lower: null,
      reason_codes: [],
      caution_flags: ["insufficient_sample_size"],
    };
  }

  const reversals: string[] = [];
  let previous = eligible[0];
  for (const current of eligible.slice(1)) {
    const previousScore = performanceScore(previous);
    const currentScore = performanceScore(current);
    if (previousScore !== null && currentScore !== null && currentScore < previousScore - 0.15) {
      reversals.push(`${current.bucket}_below_${previous.bucket}`);
    }
    previous = current;
  }

  if (reversals.length > 0) {
    return {
      higher_confidence_outperforms_lower: false,
      reason_codes: ["higher_confidence_underperformed_lower_bucket"],
      caution_flags: reversals,
    };
  }

  return {
    higher_confidence_outperforms_lower: true,
    reason_codes: ["higher_confidence_directionally_outperformed_lower"],
    caution_flags: [],
  };
}

export function buildConfidenceCalibrationSummary(
  rows: TureConfidenceCalibrationInputRow[] | null | undefined,
): TureConfidenceCalibrationSummary {
  const safeRows = rows ?? [];
  const byBucket = new Map<TureConfidenceBucket, TureConfidenceCalibrationInputRow[]>();

  for (const definition of bucketDefinitions) {
    byBucket.set(definition.bucket, []);
  }

  for (const row of safeRows) {
    const bucket = confidenceBucket(row.confidence);
    byBucket.get(bucket)?.push(row);
  }

  const buckets = bucketDefinitions.map((definition) => {
    const bucketRows = byBucket.get(definition.bucket) ?? [];
    const visible = bucketRows.filter((row) => row.visibility === "visible").length;
    const researchOnly = bucketRows.filter(
      (row) => row.visibility === "research_only",
    ).length;
    const unknownVisibility = bucketRows.length - visible - researchOnly;
    const entryTriggered = bucketRows.filter(
      (row) => row.entry_triggered === true,
    ).length;
    const entryNotTriggered = bucketRows.filter(
      (row) => row.entry_not_triggered === true,
    ).length;
    const targetHits = bucketRows.filter((row) => row.target_hit === true).length;
    const stopHits = bucketRows.filter((row) => row.stop_hit === true).length;
    const neither = bucketRows.filter(
      (row) =>
        row.target_hit !== true &&
        row.stop_hit !== true &&
        row.entry_not_triggered !== true,
    ).length;
    const setupMix: Record<string, number> = {};
    const sectorMix: Record<string, number> = {};
    const tickerMix: Record<string, number> = {};
    const regimeMix: Record<string, number> = {};
    const qualityMix: Record<string, number> = {};
    const reasonCodes: string[] = [];
    const cautionFlags: string[] = [];

    for (const row of bucketRows) {
      increment(setupMix, normalizeKey(row.setup_family));
      increment(sectorMix, normalizeKey(row.sector));
      increment(tickerMix, normalizeTicker(row.ticker));
      increment(regimeMix, normalizeKey(row.regime));
      increment(qualityMix, normalizeKey(row.quality_label));
      if (row.confidence_source === "tier_fallback") {
        reasonCodes.push("tier_confidence_fallback");
      }
    }

    if (definition.bucket === "unknown" && bucketRows.length > 0) {
      cautionFlags.push("missing_confidence");
    }

    const sample = sampleConfidence(bucketRows.length);
    if (sample === "low" && bucketRows.length > 0) {
      cautionFlags.push("insufficient_sample_size");
    }

    return {
      bucket: definition.bucket,
      min_confidence: definition.min,
      max_confidence: definition.max,
      outcome_count: bucketRows.length,
      unique_snapshot_count: new Set(
        bucketRows.map(
          (row) => row.snapshot_identity ?? `${normalizeTicker(row.ticker)}:unknown`,
        ),
      ).size,
      visible_outcome_count: visible,
      research_only_outcome_count: researchOnly,
      unknown_visibility_outcome_count: unknownVisibility,
      entry_triggered_count: entryTriggered,
      entry_not_triggered_count: entryNotTriggered,
      entry_trigger_rate: rate(entryTriggered, bucketRows.length),
      target_hit_count: targetHits,
      stop_hit_count: stopHits,
      neither_hit_count: neither,
      avg_best_r: average(bucketRows.map((row) => row.best_r)),
      avg_worst_r: average(bucketRows.map((row) => row.worst_r)),
      avg_terminal_r: average(bucketRows.map((row) => row.terminal_r)),
      setup_family_mix: setupMix,
      sector_mix: sectorMix,
      ticker_mix: tickerMix,
      regime_mix: regimeMix,
      quality_mix: qualityMix,
      sample_confidence: sample,
      calibration_label: "unknown" as TureConfidenceCalibrationLabel,
      reason_codes: Array.from(new Set(reasonCodes)),
      caution_flags: Array.from(new Set(cautionFlags)),
      advisory_only: true as const,
    };
  });

  const labeledBuckets = buckets.map((bucket, index) => ({
    ...bucket,
    calibration_label: labelBucket(bucket, buckets.slice(0, index)),
  }));
  const monotonicityCheck = buildMonotonicityCheck(labeledBuckets);
  const nonEmptyBuckets = labeledBuckets.filter(
    (bucket) => bucket.bucket !== "unknown" && bucket.outcome_count > 0,
  );
  const topBuckets = [...nonEmptyBuckets]
    .filter((bucket) => bucket.avg_best_r !== null)
    .sort(
      (first, second) =>
        (second.avg_best_r ?? Number.NEGATIVE_INFINITY) -
        (first.avg_best_r ?? Number.NEGATIVE_INFINITY),
    )
    .slice(0, 3)
    .map((bucket) => bucket.bucket);
  const weakBuckets = [...nonEmptyBuckets]
    .filter((bucket) => bucket.avg_worst_r !== null)
    .sort(
      (first, second) =>
        (first.avg_worst_r ?? Number.POSITIVE_INFINITY) -
        (second.avg_worst_r ?? Number.POSITIVE_INFINITY),
    )
    .slice(0, 3)
    .map((bucket) => bucket.bucket);
  const unknownConfidenceCount =
    byBucket.get("unknown")?.length ?? 0;
  const metadataGaps = unknownConfidenceCount > 0 ? ["missing_confidence"] : [];

  return {
    advisory_only: true,
    total_outcome_count: safeRows.length,
    total_unique_snapshot_count: new Set(
      safeRows.map((row) => row.snapshot_identity ?? `${normalizeTicker(row.ticker)}:unknown`),
    ).size,
    outcomes_with_confidence_count: safeRows.length - unknownConfidenceCount,
    unknown_confidence_count: unknownConfidenceCount,
    buckets: labeledBuckets,
    monotonicity_check: monotonicityCheck,
    top_buckets: topBuckets,
    weak_buckets: weakBuckets,
    metadata_gaps: metadataGaps,
    sample_confidence: sampleConfidence(safeRows.length),
  };
}
