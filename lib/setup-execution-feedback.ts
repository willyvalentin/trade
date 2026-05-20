import { getSetupTypeLabel, normalizeSetupType, type SetupType } from "@/lib/setup-types";

export type SetupExecutionBucket = {
  key: string;
  label: string;
  total_trades: number;
  closed_trades: number;
  winning_trades: number;
  losing_trades: number;
  breakeven_trades: number;
  win_rate: number | null;
  average_r: number | null;
  median_r: number | null;
  total_pnl: number;
  average_pnl: number | null;
  average_handoff_quality_score: number | null;
  average_execution_slippage_bps: number | null;
  poor_execution_count: number;
  high_priority_suggestion_count: number;
  discarded_setups: number;
  missed_winners: number;
  correct_discards: number;
  notes: string[];
};

export type SetupExecutionInsight = {
  code: string;
  severity: "positive" | "neutral" | "warning" | "negative";
  title: string;
  description: string;
};

export type SetupExecutionFeedbackResult = {
  generated_at: string;
  total_closed_trades: number;
  total_discarded_setups: number;
  buckets_by_setup_type: SetupExecutionBucket[];
  buckets_by_handoff_quality: SetupExecutionBucket[];
  buckets_by_execution_quality: SetupExecutionBucket[];
  insights: SetupExecutionInsight[];
};

export type SetupExecutionFeedbackTrade = {
  setup_type?: unknown;
  pnl?: number | null;
  r_multiple?: number | null;
  handoff_quality_rating?: string | null;
  handoff_quality_score?: number | null;
  execution_quality_rating?: string | null;
  execution_slippage_bps?: number | null;
  high_priority_suggestion_count?: number | null;
};

export type SetupExecutionFeedbackDiscard = {
  setup_type?: unknown;
  decision_quality?: string | null;
};

export type BuildSetupExecutionFeedbackInput = {
  closedTrades?: SetupExecutionFeedbackTrade[];
  discardedSetups?: SetupExecutionFeedbackDiscard[];
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

const handoffQualityRatings = ["excellent", "good", "acceptable", "poor", "unknown"];
const executionQualityRatings = ["excellent", "good", "acceptable", "poor", "unknown"];

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function average(values: number[]) {
  return values.length === 0
    ? null
    : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function median(values: number[]) {
  if (values.length === 0) {
    return null;
  }

  const sorted = [...values].sort((first, second) => first - second);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function createBucket(key: string, label: string): SetupExecutionBucket {
  return {
    key,
    label,
    total_trades: 0,
    closed_trades: 0,
    winning_trades: 0,
    losing_trades: 0,
    breakeven_trades: 0,
    win_rate: null,
    average_r: null,
    median_r: null,
    total_pnl: 0,
    average_pnl: null,
    average_handoff_quality_score: null,
    average_execution_slippage_bps: null,
    poor_execution_count: 0,
    high_priority_suggestion_count: 0,
    discarded_setups: 0,
    missed_winners: 0,
    correct_discards: 0,
    notes: [],
  };
}

function normalizeRating(value: string | null | undefined) {
  return value && ["excellent", "good", "acceptable", "poor"].includes(value)
    ? value
    : "unknown";
}

function buildBucketMap(keys: string[], labelForKey: (key: string) => string) {
  return new Map(keys.map((key) => [key, createBucket(key, labelForKey(key))]));
}

function finalizeBucket(
  bucket: SetupExecutionBucket,
  rValues: number[],
  pnlValues: number[],
  qualityScores: number[],
  slippageValues: number[],
) {
  bucket.win_rate =
    bucket.closed_trades > 0
      ? (bucket.winning_trades / bucket.closed_trades) * 100
      : null;
  bucket.average_r = average(rValues);
  bucket.median_r = median(rValues);
  bucket.average_pnl = average(pnlValues);
  bucket.average_handoff_quality_score = average(qualityScores);
  bucket.average_execution_slippage_bps = average(slippageValues);

  if (bucket.closed_trades < 3) {
    bucket.notes.push("Small sample.");
  }

  if (bucket.poor_execution_count > 0) {
    bucket.notes.push("Poor execution observed.");
  }

  if (bucket.missed_winners > bucket.correct_discards && bucket.discarded_setups > 0) {
    bucket.notes.push("Missed winners exceed correct discards.");
  }
}

function insight(
  code: string,
  severity: SetupExecutionInsight["severity"],
  title: string,
  description: string,
): SetupExecutionInsight {
  return { code, severity, title, description };
}

function topByClosedTrades(buckets: SetupExecutionBucket[]) {
  return [...buckets].sort(
    (first, second) =>
      second.closed_trades - first.closed_trades ||
      (second.average_r ?? -Infinity) - (first.average_r ?? -Infinity),
  );
}

export function buildSetupExecutionFeedback({
  closedTrades = [],
  discardedSetups = [],
  generatedAt = new Date().toISOString(),
}: BuildSetupExecutionFeedbackInput): SetupExecutionFeedbackResult {
  const setupBuckets = buildBucketMap(setupTypes, (key) =>
    getSetupTypeLabel(key),
  );
  const handoffBuckets = buildBucketMap(handoffQualityRatings, (key) =>
    key.replaceAll("_", " "),
  );
  const executionBuckets = buildBucketMap(executionQualityRatings, (key) =>
    key.replaceAll("_", " "),
  );
  const valueStore = new Map<
    SetupExecutionBucket,
    {
      rValues: number[];
      pnlValues: number[];
      qualityScores: number[];
      slippageValues: number[];
    }
  >();

  function valuesFor(bucket: SetupExecutionBucket) {
    const existing = valueStore.get(bucket);

    if (existing) {
      return existing;
    }

    const created = {
      rValues: [] as number[],
      pnlValues: [] as number[],
      qualityScores: [] as number[],
      slippageValues: [] as number[],
    };
    valueStore.set(bucket, created);
    return created;
  }

  function addTradeToBucket(bucket: SetupExecutionBucket, trade: SetupExecutionFeedbackTrade) {
    const pnl = finiteNumber(trade.pnl);
    const rMultiple = finiteNumber(trade.r_multiple);
    const qualityScore = finiteNumber(trade.handoff_quality_score);
    const slippageBps = finiteNumber(trade.execution_slippage_bps);
    const values = valuesFor(bucket);

    bucket.total_trades += 1;
    bucket.closed_trades += 1;

    if (pnl !== null) {
      bucket.total_pnl += pnl;
      values.pnlValues.push(pnl);

      if (pnl > 0) {
        bucket.winning_trades += 1;
      } else if (pnl < 0) {
        bucket.losing_trades += 1;
      } else {
        bucket.breakeven_trades += 1;
      }
    }

    if (rMultiple !== null) values.rValues.push(rMultiple);
    if (qualityScore !== null) values.qualityScores.push(qualityScore);
    if (slippageBps !== null) values.slippageValues.push(slippageBps);

    if (trade.execution_quality_rating === "poor") {
      bucket.poor_execution_count += 1;
    }

    bucket.high_priority_suggestion_count +=
      finiteNumber(trade.high_priority_suggestion_count) ?? 0;
  }

  for (const trade of closedTrades) {
    const setupType = normalizeSetupType(trade.setup_type);
    const setupBucket = setupBuckets.get(setupType) ?? setupBuckets.get("UNKNOWN");
    const handoffBucket =
      handoffBuckets.get(normalizeRating(trade.handoff_quality_rating)) ??
      handoffBuckets.get("unknown");
    const executionBucket =
      executionBuckets.get(normalizeRating(trade.execution_quality_rating)) ??
      executionBuckets.get("unknown");

    if (setupBucket) addTradeToBucket(setupBucket, trade);
    if (handoffBucket) addTradeToBucket(handoffBucket, trade);
    if (executionBucket) addTradeToBucket(executionBucket, trade);
  }

  for (const discarded of discardedSetups) {
    const setupType = normalizeSetupType(discarded.setup_type);
    const bucket = setupBuckets.get(setupType) ?? setupBuckets.get("UNKNOWN");

    if (!bucket) continue;

    bucket.discarded_setups += 1;

    if (discarded.decision_quality === "missed_winner") {
      bucket.missed_winners += 1;
    } else if (discarded.decision_quality === "correct_discard") {
      bucket.correct_discards += 1;
    }
  }

  const allBuckets = [
    ...setupBuckets.values(),
    ...handoffBuckets.values(),
    ...executionBuckets.values(),
  ];

  for (const bucket of allBuckets) {
    const values = valuesFor(bucket);
    finalizeBucket(
      bucket,
      values.rValues,
      values.pnlValues,
      values.qualityScores,
      values.slippageValues,
    );
  }

  const setupBucketList = topByClosedTrades([...setupBuckets.values()]);
  const handoffBucketList = topByClosedTrades([...handoffBuckets.values()]);
  const executionBucketList = topByClosedTrades([...executionBuckets.values()]);
  const insights: SetupExecutionInsight[] = [];
  const eligibleSetupBuckets = setupBucketList.filter(
    (bucket) => bucket.closed_trades >= 3 && bucket.average_r !== null,
  );
  const bestSetup = [...eligibleSetupBuckets].sort(
    (first, second) => (second.average_r ?? 0) - (first.average_r ?? 0),
  )[0];
  const worstSetup = [...eligibleSetupBuckets].sort(
    (first, second) => (first.average_r ?? 0) - (second.average_r ?? 0),
  )[0];
  const poorHandoff = handoffBuckets.get("poor");
  const goodHandoffAverage = average(
    ["excellent", "good"]
      .map((key) => handoffBuckets.get(key)?.average_r)
      .filter((value): value is number => value !== null && value !== undefined),
  );
  const poorExecutionLosingTrades =
    executionBuckets.get("poor")?.losing_trades ?? 0;
  const missedWinnerBucket = setupBucketList.find(
    (bucket) => bucket.missed_winners > bucket.correct_discards,
  );

  if (closedTrades.length < 5) {
    insights.push(
      insight(
        "not_enough_closed_trades",
        "neutral",
        "Not enough closed trades yet",
        "Need at least five closed trades before setup conclusions become reliable.",
      ),
    );
  }

  if (bestSetup && (bestSetup.average_r ?? 0) > 0) {
    insights.push(
      insight(
        "best_setup_average_r",
        "positive",
        `${bestSetup.label} has the strongest average R so far`,
        `${bestSetup.label} averages ${(bestSetup.average_r ?? 0).toFixed(2)}R across ${bestSetup.closed_trades} closed trades.`,
      ),
    );
  }

  if (worstSetup && (worstSetup.average_r ?? 0) < 0) {
    insights.push(
      insight(
        "weak_setup_average_r",
        (worstSetup.average_r ?? 0) < -0.5 ? "negative" : "warning",
        `${worstSetup.label} is underperforming`,
        `${worstSetup.label} averages ${(worstSetup.average_r ?? 0).toFixed(2)}R across ${worstSetup.closed_trades} closed trades.`,
      ),
    );
  }

  if (
    poorHandoff?.average_r !== null &&
    poorHandoff?.average_r !== undefined &&
    goodHandoffAverage !== null &&
    goodHandoffAverage - poorHandoff.average_r >= 0.5
  ) {
    insights.push(
      insight(
        "poor_handoff_lower_r",
        "warning",
        "Poor handoff quality is associated with lower R",
        `Good/excellent handoffs average ${goodHandoffAverage.toFixed(2)}R vs poor handoffs at ${poorHandoff.average_r.toFixed(2)}R.`,
      ),
    );
  }

  if (poorExecutionLosingTrades >= 2) {
    insights.push(
      insight(
        "poor_execution_losing_trades",
        "warning",
        "Poor execution quality appears in multiple losing trades",
        `${poorExecutionLosingTrades} losing trades are in the poor execution-quality bucket.`,
      ),
    );
  }

  if (missedWinnerBucket) {
    insights.push(
      insight(
        "missed_winners_by_setup",
        "warning",
        "Missed winners are concentrated by setup type",
        `${missedWinnerBucket.label} has ${missedWinnerBucket.missed_winners} missed winners vs ${missedWinnerBucket.correct_discards} correct discards.`,
      ),
    );
  }

  return {
    generated_at: generatedAt,
    total_closed_trades: closedTrades.length,
    total_discarded_setups: discardedSetups.length,
    buckets_by_setup_type: setupBucketList,
    buckets_by_handoff_quality: handoffBucketList,
    buckets_by_execution_quality: executionBucketList,
    insights: insights.slice(0, 5),
  };
}
