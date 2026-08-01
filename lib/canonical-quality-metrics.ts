import type {
  CanonicalEvaluationCohort,
  CanonicalEvaluationMetricsCandidate,
} from "@/lib/server/canonical-evaluation-quality-read-model";

export const CANONICAL_QUALITY_METRICS_POLICY_VERSION =
  "canonical_quality_metrics_v1" as const;

export const canonicalQualityCalibrationBuckets = [
  { id: "p_0_20", lower: 0, upper: 0.2, include_upper: false },
  { id: "p_20_40", lower: 0.2, upper: 0.4, include_upper: false },
  { id: "p_40_60", lower: 0.4, upper: 0.6, include_upper: false },
  { id: "p_60_80", lower: 0.6, upper: 0.8, include_upper: false },
  { id: "p_80_100", lower: 0.8, upper: 1, include_upper: true },
] as const;

export const canonicalQualityRankingKValues = [1, 3, 5] as const;

export const canonicalQualityPublishabilityPolicy = {
  minimum_proportion_identities: 10,
  minimum_continuous_identities: 8,
  minimum_calibration_identities: 10,
  minimum_trading_days: 3,
  minimum_tickers: 3,
  minimum_ranking_opportunity_sets: 2,
  minimum_counterfactual_opportunity_sets: 2,
  bootstrap_iterations: 1_000,
  confidence_level: 0.95,
} as const;

export type CanonicalMetricStatus =
  | "measurable"
  | "not_measurable_yet"
  | "not_publishable";

export type CanonicalMetricConfidenceInterval = {
  method:
    | "wilson_score_interval_v1"
    | "conservative_wilson_interval_difference_v1"
    | "seeded_trading_day_cluster_bootstrap_v1";
  confidence_level: 0.95;
  lower: number;
  upper: number;
  bootstrap_seed: string | null;
  bootstrap_iterations: number | null;
};

export type CanonicalMetricResult = {
  policy_version: typeof CANONICAL_QUALITY_METRICS_POLICY_VERSION;
  metric: string;
  status: CanonicalMetricStatus;
  value: number | null;
  numerator: number | null;
  denominator: number;
  identity_count: number;
  trading_day_count: number;
  ticker_count: number;
  confidence_interval: CanonicalMetricConfidenceInterval | null;
  reason_codes: string[];
};

export type CanonicalCalibrationBucketResult = {
  policy_version: typeof CANONICAL_QUALITY_METRICS_POLICY_VERSION;
  bucket_id: (typeof canonicalQualityCalibrationBuckets)[number]["id"];
  lower: number;
  upper: number;
  include_upper: boolean;
  status: CanonicalMetricStatus;
  value: number | null;
  numerator: number | null;
  denominator: number;
  identity_count: number;
  trading_day_count: number;
  ticker_count: number;
  confidence_interval: CanonicalMetricConfidenceInterval | null;
  average_confidence: number | null;
  reason_codes: string[];
};

export type CanonicalConfidenceCalibrationResult = {
  brier_score: CanonicalMetricResult;
  expected_calibration_error: CanonicalMetricResult;
  buckets: CanonicalCalibrationBucketResult[];
};

export type CanonicalRankingCandidate = {
  canonical_identity: string;
  ticker: string;
  rank: number | null;
  selection_status: "selected" | "rejected" | "not_selected";
  outcome_evaluable: boolean;
  positive_outcome: boolean | null;
};

export type CanonicalRankingOpportunitySet = {
  opportunity_set_id: string;
  cohort: CanonicalEvaluationCohort;
  decision_day: string;
  ranking_version: string | null;
  complete: boolean;
  candidates: CanonicalRankingCandidate[];
};

export type CanonicalCounterfactualCandidate = {
  canonical_identity: string;
  ticker: string;
  outcome_evaluable: boolean;
  r_result: number | null;
};

export type CanonicalCounterfactualOpportunitySet = {
  opportunity_set_id: string;
  decision_canonical_identity: string;
  cohort:
    | "rejected_candidate_counterfactual"
    | "no_trade_counterfactual";
  decision_day: string;
  complete: boolean;
  candidates: CanonicalCounterfactualCandidate[];
};

export type CanonicalQualityMetricDiagnostics = {
  policy_version: typeof CANONICAL_QUALITY_METRICS_POLICY_VERSION;
  explicit_cohort: CanonicalEvaluationCohort | null;
  input_rows: number;
  cohort_rows: number;
  eligible_unique_identities: number;
  excluded_ineligible_rows: number;
  excluded_other_cohort_rows: number;
  duplicated_identity_count: number;
  diagnostic_horizon_count: number;
  denominator_identity_count: number;
  warning_codes: string[];
};

export type CanonicalQualityComparisonIdentityObservation = {
  canonical_identity: string;
  decision_day: string;
  ticker: string | null;
  terminal_binary: 0 | 1 | null;
  r_result: number | null;
  probability: number | null;
  brier_loss: number | null;
  versions: CanonicalQualityVersionTuple;
};

export type CanonicalQualityVersionTuple = {
  engine: string;
  scoring: string;
  ranking: string;
  evaluator: string;
  provider: string;
};

export type CanonicalQualityComparisonRankingObservation = {
  opportunity_set_id: string;
  decision_day: string;
  ranking_version: string;
  precision_at_k: Record<string, number>;
};

export type CanonicalQualityComparisonCounterfactualObservation = {
  canonical_identity: string;
  opportunity_set_id: string;
  decision_day: string;
  ticker: string | null;
  opportunity_cost_r: number;
  versions: CanonicalQualityVersionTuple;
};

export type CanonicalQualityComparisonEvidence = {
  evidence_version: "canonical_quality_comparison_evidence_v1";
  eligible_identity_observations: CanonicalQualityComparisonIdentityObservation[];
  complete_ranking_opportunity_sets: CanonicalQualityComparisonRankingObservation[];
  complete_counterfactual_opportunity_sets: CanonicalQualityComparisonCounterfactualObservation[];
};

export type CanonicalQualityMetricsScorecard = {
  policy_version: typeof CANONICAL_QUALITY_METRICS_POLICY_VERSION;
  synthetic_test_evidence_only: true;
  cohort: CanonicalEvaluationCohort | null;
  bootstrap_seed: string;
  performance: {
    win_rate: CanonicalMetricResult;
    expectancy_r: CanonicalMetricResult;
    average_winning_r: CanonicalMetricResult;
    average_losing_r: CanonicalMetricResult;
    average_mfe_r: CanonicalMetricResult;
    average_mae_r: CanonicalMetricResult;
    target_before_stop_rate: CanonicalMetricResult;
    no_entry_rate_diagnostic: CanonicalMetricResult;
    ambiguous_rate_diagnostic: CanonicalMetricResult;
  };
  calibration: CanonicalConfidenceCalibrationResult;
  ranking: {
    precision_at_k: Record<string, CanonicalMetricResult>;
  };
  counterfactual: {
    opportunity_cost_r: CanonicalMetricResult;
  };
  comparison_evidence: CanonicalQualityComparisonEvidence;
  diagnostics: CanonicalQualityMetricDiagnostics;
};

type MetricObservation = {
  canonical_identity: string;
  decision_day: string;
  ticker: string | null;
  value: number;
};

type MetricCounts = {
  identity_count: number;
  trading_day_count: number;
  ticker_count: number;
};

const binaryWins = new Set(["target_before_stop"]);
const binaryLosses = new Set(["stop_before_target"]);

function finite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function round(value: number) {
  return Math.round(value * 1_000_000_000_000) / 1_000_000_000_000;
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort();
}

function metricCounts(observations: MetricObservation[]): MetricCounts {
  return {
    identity_count: new Set(
      observations.map((observation) => observation.canonical_identity),
    ).size,
    trading_day_count: new Set(
      observations.map((observation) => observation.decision_day),
    ).size,
    ticker_count: new Set(
      observations
        .map((observation) => observation.ticker)
        .filter((ticker): ticker is string => Boolean(ticker)),
    ).size,
  };
}

function mean(values: number[]) {
  return values.length > 0
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : null;
}

function quantile(sorted: number[], probability: number) {
  if (sorted.length === 0) return null;
  const position = (sorted.length - 1) * probability;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sorted[lower];
  const fraction = position - lower;
  return sorted[lower] + (sorted[upper] - sorted[lower]) * fraction;
}

function hashSeed(seed: string) {
  let hash = 2_166_136_261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
}

function seededRandom(seed: string) {
  let state = hashSeed(seed);
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function clusteredBootstrapInterval(
  observations: MetricObservation[],
  seed: string,
): CanonicalMetricConfidenceInterval | null {
  const byDay = new Map<string, MetricObservation[]>();
  for (const observation of observations) {
    const items = byDay.get(observation.decision_day) ?? [];
    items.push(observation);
    byDay.set(observation.decision_day, items);
  }
  const days = [...byDay.keys()].sort();
  if (days.length < 2 || observations.length < 2) return null;

  const random = seededRandom(seed);
  const samples: number[] = [];
  for (
    let iteration = 0;
    iteration < canonicalQualityPublishabilityPolicy.bootstrap_iterations;
    iteration += 1
  ) {
    const values: number[] = [];
    for (let index = 0; index < days.length; index += 1) {
      const sampledDay = days[Math.floor(random() * days.length)];
      values.push(
        ...(byDay.get(sampledDay) ?? []).map((observation) => observation.value),
      );
    }
    const sampleMean = mean(values);
    if (sampleMean !== null) samples.push(sampleMean);
  }
  samples.sort((first, second) => first - second);
  const lower = quantile(samples, 0.025);
  const upper = quantile(samples, 0.975);
  if (lower === null || upper === null) return null;

  return {
    method: "seeded_trading_day_cluster_bootstrap_v1",
    confidence_level: 0.95,
    lower: round(lower),
    upper: round(upper),
    bootstrap_seed: seed,
    bootstrap_iterations:
      canonicalQualityPublishabilityPolicy.bootstrap_iterations,
  };
}

function wilsonInterval(
  numerator: number,
  denominator: number,
): CanonicalMetricConfidenceInterval | null {
  if (denominator <= 0) return null;
  const z = 1.959963984540054;
  const proportion = numerator / denominator;
  const zSquared = z * z;
  const denominatorAdjustment = 1 + zSquared / denominator;
  const center =
    (proportion + zSquared / (2 * denominator)) / denominatorAdjustment;
  const margin =
    (z *
      Math.sqrt(
        (proportion * (1 - proportion) + zSquared / (4 * denominator)) /
          denominator,
      )) /
    denominatorAdjustment;
  return {
    method: "wilson_score_interval_v1",
    confidence_level: 0.95,
    lower: round(Math.max(0, center - margin)),
    upper: round(Math.min(1, center + margin)),
    bootstrap_seed: null,
    bootstrap_iterations: null,
  };
}

type CalibrationObservation = {
  candidate: CanonicalEvaluationMetricsCandidate;
  probability: number;
  actual: number;
};

function expectedCalibrationError(rows: CalibrationObservation[]) {
  if (rows.length === 0) return null;
  let value = 0;
  for (const bucket of canonicalQualityCalibrationBuckets) {
    const members = rows.filter(
      ({ probability }) =>
        probability >= bucket.lower &&
        (probability < bucket.upper ||
          (bucket.include_upper && probability === bucket.upper)),
    );
    if (members.length === 0) continue;
    const averageProbability =
      members.reduce((sum, row) => sum + row.probability, 0) / members.length;
    const observedRate =
      members.reduce((sum, row) => sum + row.actual, 0) / members.length;
    value +=
      Math.abs(averageProbability - observedRate) *
      (members.length / rows.length);
  }
  return value;
}

function clusteredCalibrationEceInterval(
  rows: CalibrationObservation[],
  seed: string,
): CanonicalMetricConfidenceInterval | null {
  const byDay = new Map<string, CalibrationObservation[]>();
  for (const row of rows) {
    const items = byDay.get(row.candidate.decision_day) ?? [];
    items.push(row);
    byDay.set(row.candidate.decision_day, items);
  }
  const days = [...byDay.keys()].sort();
  if (days.length < 2 || rows.length < 2) return null;
  const random = seededRandom(seed);
  const samples: number[] = [];
  for (
    let iteration = 0;
    iteration < canonicalQualityPublishabilityPolicy.bootstrap_iterations;
    iteration += 1
  ) {
    const sampledRows: CalibrationObservation[] = [];
    for (let index = 0; index < days.length; index += 1) {
      const sampledDay = days[Math.floor(random() * days.length)];
      sampledRows.push(...(byDay.get(sampledDay) ?? []));
    }
    const value = expectedCalibrationError(sampledRows);
    if (value !== null) samples.push(value);
  }
  samples.sort((first, second) => first - second);
  const lower = quantile(samples, 0.025);
  const upper = quantile(samples, 0.975);
  if (lower === null || upper === null) return null;
  return {
    method: "seeded_trading_day_cluster_bootstrap_v1",
    confidence_level: 0.95,
    lower: round(lower),
    upper: round(upper),
    bootstrap_seed: seed,
    bootstrap_iterations:
      canonicalQualityPublishabilityPolicy.bootstrap_iterations,
  };
}

function publishabilityReasons(
  counts: MetricCounts,
  minimumIdentities: number,
) {
  return [
    ...(counts.identity_count < minimumIdentities
      ? ["minimum_identity_count_not_met"]
      : []),
    ...(counts.trading_day_count <
    canonicalQualityPublishabilityPolicy.minimum_trading_days
      ? ["minimum_trading_day_count_not_met"]
      : []),
    ...(counts.ticker_count <
    canonicalQualityPublishabilityPolicy.minimum_tickers
      ? ["minimum_ticker_count_not_met"]
      : []),
  ];
}

function emptyMetric(
  metric: string,
  reasonCodes: string[],
): CanonicalMetricResult {
  return {
    policy_version: CANONICAL_QUALITY_METRICS_POLICY_VERSION,
    metric,
    status: "not_measurable_yet",
    value: null,
    numerator: null,
    denominator: 0,
    identity_count: 0,
    trading_day_count: 0,
    ticker_count: 0,
    confidence_interval: null,
    reason_codes: uniqueSorted(reasonCodes),
  };
}

function proportionMetric(
  metric: string,
  observations: MetricObservation[],
  reasonCodes: string[] = [],
): CanonicalMetricResult {
  if (observations.length === 0) {
    return emptyMetric(metric, ["denominator_undefined", ...reasonCodes]);
  }
  const counts = metricCounts(observations);
  const numerator = observations.reduce(
    (sum, observation) => sum + observation.value,
    0,
  );
  const publishability = publishabilityReasons(
    counts,
    canonicalQualityPublishabilityPolicy.minimum_proportion_identities,
  );
  return {
    policy_version: CANONICAL_QUALITY_METRICS_POLICY_VERSION,
    metric,
    status: publishability.length === 0 ? "measurable" : "not_publishable",
    value: round(numerator / observations.length),
    numerator,
    denominator: observations.length,
    ...counts,
    confidence_interval: wilsonInterval(numerator, observations.length),
    reason_codes: uniqueSorted([...reasonCodes, ...publishability]),
  };
}

function continuousMetric(
  metric: string,
  observations: MetricObservation[],
  seed: string,
  minimumIdentities: number =
    canonicalQualityPublishabilityPolicy.minimum_continuous_identities,
  reasonCodes: string[] = [],
): CanonicalMetricResult {
  if (observations.length === 0) {
    return emptyMetric(metric, ["denominator_undefined", ...reasonCodes]);
  }
  const counts = metricCounts(observations);
  const numerator = observations.reduce(
    (sum, observation) => sum + observation.value,
    0,
  );
  const publishability = publishabilityReasons(counts, minimumIdentities);
  const confidenceInterval = clusteredBootstrapInterval(
    observations,
    `${seed}:${metric}`,
  );
  return {
    policy_version: CANONICAL_QUALITY_METRICS_POLICY_VERSION,
    metric,
    status: publishability.length === 0 ? "measurable" : "not_publishable",
    value: round(numerator / observations.length),
    numerator: round(numerator),
    denominator: observations.length,
    ...counts,
    confidence_interval: confidenceInterval,
    reason_codes: uniqueSorted([
      ...reasonCodes,
      ...publishability,
      ...(!confidenceInterval ? ["confidence_interval_not_defined"] : []),
    ]),
  };
}

function observation(
  candidate: CanonicalEvaluationMetricsCandidate,
  value: number,
): MetricObservation {
  return {
    canonical_identity: candidate.canonical_identity,
    decision_day: candidate.decision_day,
    ticker: candidate.ticker,
    value,
  };
}

function deterministicUniqueEligible(
  candidates: CanonicalEvaluationMetricsCandidate[],
  cohort: CanonicalEvaluationCohort,
) {
  const cohortRows = candidates.filter((candidate) => candidate.cohort === cohort);
  const grouped = new Map<string, CanonicalEvaluationMetricsCandidate[]>();
  for (const candidate of cohortRows) {
    const values = grouped.get(candidate.canonical_identity) ?? [];
    values.push(candidate);
    grouped.set(candidate.canonical_identity, values);
  }
  const duplicated = [...grouped.entries()]
    .filter(([, values]) => values.length > 1)
    .map(([identity]) => identity)
    .sort();
  const eligible = [...grouped.entries()]
    .filter(([, values]) => values.length === 1)
    .map(([, values]) => values[0])
    .filter(
      (candidate) =>
        candidate.eligibility_status === "eligible" &&
        candidate.cohort_quality_eligible,
    )
    .sort((first, second) =>
      first.canonical_identity.localeCompare(second.canonical_identity),
    );
  return { cohortRows, eligible, duplicated };
}

function performanceMetrics(
  eligible: CanonicalEvaluationMetricsCandidate[],
  cohortRows: CanonicalEvaluationMetricsCandidate[],
  seed: string,
) {
  const winsAndLosses = eligible
    .filter(
      (candidate) =>
        binaryWins.has(candidate.terminal_outcome) ||
        binaryLosses.has(candidate.terminal_outcome),
    )
    .map((candidate) =>
      observation(
        candidate,
        binaryWins.has(candidate.terminal_outcome) ? 1 : 0,
      ),
    );
  const rObservations = eligible
    .filter((candidate) => finite(candidate.r_result))
    .map((candidate) => observation(candidate, candidate.r_result as number));
  const winningR = rObservations.filter((item) => item.value > 0);
  const losingR = rObservations.filter((item) => item.value < 0);
  const mfe = eligible
    .filter((candidate) => finite(candidate.mfe_r))
    .map((candidate) => observation(candidate, candidate.mfe_r as number));
  const mae = eligible
    .filter((candidate) => finite(candidate.mae_r))
    .map((candidate) => observation(candidate, candidate.mae_r as number));
  const targetBeforeStop = eligible
    .filter(
      (candidate) =>
        candidate.target_before_stop === "yes" ||
        candidate.target_before_stop === "no",
    )
    .map((candidate) =>
      observation(candidate, candidate.target_before_stop === "yes" ? 1 : 0),
    );
  const noEntry = eligible.map((candidate) =>
    observation(candidate, candidate.terminal_outcome === "no_entry" ? 1 : 0),
  );
  const ambiguityCohort = cohortRows.map((candidate) =>
    observation(
      candidate,
      candidate.terminal_outcome === "ambiguous_same_candle" ? 1 : 0,
    ),
  );

  return {
    win_rate: proportionMetric("win_rate", winsAndLosses, [
      "terminal_policy_target_before_stop_is_win",
      "terminal_policy_stop_before_target_is_loss",
      "no_entry_and_ambiguous_excluded_from_win_loss_denominator",
    ]),
    expectancy_r: continuousMetric("expectancy_r", rObservations, seed),
    average_winning_r: continuousMetric(
      "average_winning_r",
      winningR,
      seed,
    ),
    average_losing_r: continuousMetric("average_losing_r", losingR, seed),
    average_mfe_r: continuousMetric("average_mfe_r", mfe, seed),
    average_mae_r: continuousMetric("average_mae_r", mae, seed),
    target_before_stop_rate: proportionMetric(
      "target_before_stop_rate",
      targetBeforeStop,
    ),
    no_entry_rate_diagnostic: proportionMetric(
      "no_entry_rate_diagnostic",
      noEntry,
      ["diagnostic_metric_not_win_loss"],
    ),
    ambiguous_rate_diagnostic: proportionMetric(
      "ambiguous_rate_diagnostic",
      ambiguityCohort,
      ["diagnostic_metric_includes_ineligible_ambiguous_rows"],
    ),
  };
}

function calibrationMetrics(
  eligible: CanonicalEvaluationMetricsCandidate[],
  seed: string,
): CanonicalConfidenceCalibrationResult {
  const terminal = eligible.filter(
    (candidate) =>
      binaryWins.has(candidate.terminal_outcome) ||
      binaryLosses.has(candidate.terminal_outcome),
  );
  const missingSemantics = terminal.filter(
    (candidate) =>
      candidate.confidence_probability_semantics !== "probability_0_1",
  );
  const invalidProbability = terminal.filter(
    (candidate) =>
      !finite(candidate.numeric_confidence) ||
      (candidate.numeric_confidence as number) < 0 ||
      (candidate.numeric_confidence as number) > 1,
  );
  const reasonCodes = [
    ...(missingSemantics.length > 0
      ? ["confidence_probability_semantics_missing"]
      : []),
    ...(invalidProbability.length > 0
      ? ["numeric_confidence_probability_missing_or_invalid"]
      : []),
  ];
  if (reasonCodes.length > 0 || terminal.length === 0) {
    const reasons = [
      ...reasonCodes,
      ...(terminal.length === 0 ? ["calibration_denominator_undefined"] : []),
      "confidence_label_not_probability",
    ];
    return {
      brier_score: emptyMetric("brier_score", reasons),
      expected_calibration_error: emptyMetric(
        "expected_calibration_error",
        reasons,
      ),
      buckets: canonicalQualityCalibrationBuckets.map((bucket) => ({
        policy_version: CANONICAL_QUALITY_METRICS_POLICY_VERSION,
        bucket_id: bucket.id,
        lower: bucket.lower,
        upper: bucket.upper,
        include_upper: bucket.include_upper,
        status: "not_measurable_yet",
        value: null,
        numerator: null,
        denominator: 0,
        identity_count: 0,
        trading_day_count: 0,
        ticker_count: 0,
        confidence_interval: null,
        average_confidence: null,
        reason_codes: uniqueSorted(reasons),
      })),
    };
  }

  const calibrationRows: CalibrationObservation[] = terminal.map((candidate) => ({
    candidate,
    probability: candidate.numeric_confidence as number,
    actual: binaryWins.has(candidate.terminal_outcome) ? 1 : 0,
  }));
  const brierObservations = calibrationRows.map(({ candidate, probability, actual }) =>
    observation(candidate, (probability - actual) ** 2),
  );
  const bucketResults: CanonicalCalibrationBucketResult[] =
    canonicalQualityCalibrationBuckets.map((bucket) => {
      const rows = calibrationRows.filter(
        ({ probability }) =>
          probability >= bucket.lower &&
          (probability < bucket.upper ||
            (bucket.include_upper && probability === bucket.upper)),
      );
      if (rows.length === 0) {
        return {
          policy_version: CANONICAL_QUALITY_METRICS_POLICY_VERSION,
          bucket_id: bucket.id,
          lower: bucket.lower,
          upper: bucket.upper,
          include_upper: bucket.include_upper,
          status: "not_measurable_yet",
          value: null,
          numerator: null,
          denominator: 0,
          identity_count: 0,
          trading_day_count: 0,
          ticker_count: 0,
          confidence_interval: null,
          average_confidence: null,
          reason_codes: ["calibration_bucket_empty"],
        };
      }
      const observations = rows.map(({ candidate, actual }) =>
        observation(candidate, actual),
      );
      const metric = proportionMetric(
        `calibration_bucket_${bucket.id}`,
        observations,
      );
      return {
        policy_version: CANONICAL_QUALITY_METRICS_POLICY_VERSION,
        bucket_id: bucket.id,
        lower: bucket.lower,
        upper: bucket.upper,
        include_upper: bucket.include_upper,
        status: metric.status,
        value: metric.value,
        numerator: metric.numerator,
        denominator: metric.denominator,
        identity_count: metric.identity_count,
        trading_day_count: metric.trading_day_count,
        ticker_count: metric.ticker_count,
        confidence_interval: metric.confidence_interval,
        average_confidence: round(
          rows.reduce((sum, row) => sum + row.probability, 0) / rows.length,
        ),
        reason_codes: metric.reason_codes,
      };
    });

  const ece = expectedCalibrationError(calibrationRows) as number;
  const calibrationObservations = calibrationRows.map(({ candidate }) =>
    observation(candidate, ece),
  );
  const eceMetric = continuousMetric(
    "expected_calibration_error",
    calibrationObservations,
    seed,
    canonicalQualityPublishabilityPolicy.minimum_calibration_identities,
    ["fixed_calibration_buckets_v1"],
  );
  eceMetric.value = round(ece);
  eceMetric.numerator = round(ece * calibrationRows.length);
  eceMetric.confidence_interval = clusteredCalibrationEceInterval(
    calibrationRows,
    `${seed}:expected_calibration_error`,
  );

  return {
    brier_score: continuousMetric(
      "brier_score",
      brierObservations,
      seed,
      canonicalQualityPublishabilityPolicy.minimum_calibration_identities,
      ["numeric_probability_only", "confidence_label_not_probability"],
    ),
    expected_calibration_error: eceMetric,
    buckets: bucketResults,
  };
}

function rankingMetrics(
  cohort: CanonicalEvaluationCohort,
  opportunitySets: CanonicalRankingOpportunitySet[],
) {
  const sets = opportunitySets
    .filter((set) => set.cohort === cohort)
    .sort((first, second) =>
      first.opportunity_set_id.localeCompare(second.opportunity_set_id),
    );
  const invalidReasons: string[] = [];
  for (const set of sets) {
    if (!set.complete) invalidReasons.push("ranking_opportunity_set_incomplete");
    if (!set.ranking_version) invalidReasons.push("stable_ranking_version_missing");
    const identities = set.candidates.map((candidate) => candidate.canonical_identity);
    if (new Set(identities).size !== identities.length) {
      invalidReasons.push("ranking_candidate_identity_duplicate");
    }
    const ranks = set.candidates.map((candidate) => candidate.rank);
    if (
      ranks.some((rank) => !Number.isInteger(rank) || (rank as number) < 1) ||
      new Set(ranks).size !== ranks.length
    ) {
      invalidReasons.push("ranking_rank_missing_or_duplicate");
    }
    if (
      set.candidates.some(
        (candidate) =>
          !candidate.outcome_evaluable || candidate.positive_outcome === null,
      )
    ) {
      invalidReasons.push("ranking_candidate_outcome_missing");
    }
    if (
      !set.candidates.some(
        (candidate) =>
          candidate.selection_status === "rejected" ||
          candidate.selection_status === "not_selected",
      )
    ) {
      invalidReasons.push("ranking_unselected_candidates_missing");
    }
  }

  const precision: Record<string, CanonicalMetricResult> = {};
  for (const k of canonicalQualityRankingKValues) {
    const metricName = `precision_at_${k}`;
    if (sets.length === 0 || invalidReasons.length > 0) {
      precision[String(k)] = emptyMetric(metricName, [
        ...(sets.length === 0
          ? ["ranking_opportunity_set_missing"]
          : []),
        ...invalidReasons,
      ]);
      continue;
    }
    const observations: MetricObservation[] = [];
    for (const set of sets) {
      const top = [...set.candidates]
        .sort((first, second) => (first.rank as number) - (second.rank as number))
        .slice(0, k);
      observations.push(
        ...top.map((candidate) => ({
          canonical_identity: candidate.canonical_identity,
          decision_day: set.decision_day,
          ticker: candidate.ticker,
          value: candidate.positive_outcome ? 1 : 0,
        })),
      );
    }
    const metric = proportionMetric(metricName, observations, [
      `ranking_k_${k}_v1`,
      "complete_explicit_opportunity_sets_only",
    ]);
    if (
      sets.length <
      canonicalQualityPublishabilityPolicy.minimum_ranking_opportunity_sets
    ) {
      metric.status = "not_publishable";
      metric.reason_codes = uniqueSorted([
        ...metric.reason_codes,
        "minimum_ranking_opportunity_set_count_not_met",
      ]);
    }
    precision[String(k)] = metric;
  }
  return { precision_at_k: precision };
}

function counterfactualMetrics(
  cohort: CanonicalEvaluationCohort,
  opportunitySets: CanonicalCounterfactualOpportunitySet[],
  cohortRows: CanonicalEvaluationMetricsCandidate[],
  seed: string,
) {
  if (
    cohort !== "no_trade_counterfactual" &&
    cohort !== "rejected_candidate_counterfactual"
  ) {
    return {
      opportunity_cost_r: emptyMetric("opportunity_cost_r", [
        "counterfactual_metric_not_applicable_to_cohort",
      ]),
    };
  }
  const sets = opportunitySets
    .filter((set) => set.cohort === cohort)
    .sort((first, second) =>
      first.opportunity_set_id.localeCompare(second.opportunity_set_id),
    );
  const invalid = sets.some(
    (set) =>
      !set.decision_canonical_identity.trim() ||
      !set.complete ||
      set.candidates.length === 0 ||
      set.candidates.some(
        (candidate) =>
          !candidate.outcome_evaluable || !finite(candidate.r_result),
      ),
  );
  const decisionIdentities = sets.map(
    (set) => set.decision_canonical_identity,
  );
  const candidateByIdentity = new Map(
    cohortRows.map((candidate) => [
      candidate.canonical_identity,
      candidate,
    ]),
  );
  const brokenDecisionLineage =
    new Set(decisionIdentities).size !== decisionIdentities.length ||
    decisionIdentities.some((identity) => !candidateByIdentity.has(identity));
  if (sets.length === 0 || invalid || brokenDecisionLineage) {
    return {
      opportunity_cost_r: emptyMetric("opportunity_cost_r", [
        ...(sets.length === 0
          ? ["counterfactual_opportunity_set_missing"]
          : []),
        ...(invalid
          ? ["counterfactual_opportunity_set_not_evaluable"]
          : []),
        ...(brokenDecisionLineage
          ? ["counterfactual_decision_lineage_invalid"]
          : []),
      ]),
    };
  }
  const observations = sets.map((set) => {
    const best = [...set.candidates].sort(
      (first, second) =>
        (second.r_result as number) - (first.r_result as number) ||
        first.canonical_identity.localeCompare(second.canonical_identity),
    )[0];
    return {
      canonical_identity: set.decision_canonical_identity,
      decision_day: set.decision_day,
      ticker: best.ticker,
      value: Math.max(0, best.r_result as number),
    };
  });
  const metric = continuousMetric(
    "opportunity_cost_r",
    observations,
    seed,
    canonicalQualityPublishabilityPolicy.minimum_counterfactual_opportunity_sets,
    ["best_positive_counterfactual_r_per_complete_opportunity_set"],
  );
  if (
    sets.length <
    canonicalQualityPublishabilityPolicy.minimum_counterfactual_opportunity_sets
  ) {
    metric.status = "not_publishable";
    metric.reason_codes = uniqueSorted([
      ...metric.reason_codes,
      "minimum_counterfactual_opportunity_set_count_not_met",
    ]);
  }
  return { opportunity_cost_r: metric };
}

function undefinedCohortScorecard(
  candidates: CanonicalEvaluationMetricsCandidate[],
  seed: string,
): CanonicalQualityMetricsScorecard {
  const reason = ["explicit_cohort_required", "denominator_undefined"];
  const performance = {
    win_rate: emptyMetric("win_rate", reason),
    expectancy_r: emptyMetric("expectancy_r", reason),
    average_winning_r: emptyMetric("average_winning_r", reason),
    average_losing_r: emptyMetric("average_losing_r", reason),
    average_mfe_r: emptyMetric("average_mfe_r", reason),
    average_mae_r: emptyMetric("average_mae_r", reason),
    target_before_stop_rate: emptyMetric("target_before_stop_rate", reason),
    no_entry_rate_diagnostic: emptyMetric(
      "no_entry_rate_diagnostic",
      reason,
    ),
    ambiguous_rate_diagnostic: emptyMetric(
      "ambiguous_rate_diagnostic",
      reason,
    ),
  };
  return {
    policy_version: CANONICAL_QUALITY_METRICS_POLICY_VERSION,
    synthetic_test_evidence_only: true,
    cohort: null,
    bootstrap_seed: seed,
    performance,
    calibration: {
      brier_score: emptyMetric("brier_score", reason),
      expected_calibration_error: emptyMetric(
        "expected_calibration_error",
        reason,
      ),
      buckets: canonicalQualityCalibrationBuckets.map((bucket) => ({
        policy_version: CANONICAL_QUALITY_METRICS_POLICY_VERSION,
        bucket_id: bucket.id,
        lower: bucket.lower,
        upper: bucket.upper,
        include_upper: bucket.include_upper,
        status: "not_measurable_yet",
        value: null,
        numerator: null,
        denominator: 0,
        identity_count: 0,
        trading_day_count: 0,
        ticker_count: 0,
        confidence_interval: null,
        average_confidence: null,
        reason_codes: reason,
      })),
    },
    ranking: {
      precision_at_k: Object.fromEntries(
        canonicalQualityRankingKValues.map((k) => [
          String(k),
          emptyMetric(`precision_at_${k}`, reason),
        ]),
      ),
    },
    counterfactual: {
      opportunity_cost_r: emptyMetric("opportunity_cost_r", reason),
    },
    comparison_evidence: {
      evidence_version: "canonical_quality_comparison_evidence_v1",
      eligible_identity_observations: [],
      complete_ranking_opportunity_sets: [],
      complete_counterfactual_opportunity_sets: [],
    },
    diagnostics: {
      policy_version: CANONICAL_QUALITY_METRICS_POLICY_VERSION,
      explicit_cohort: null,
      input_rows: candidates.length,
      cohort_rows: 0,
      eligible_unique_identities: 0,
      excluded_ineligible_rows: 0,
      excluded_other_cohort_rows: candidates.length,
      duplicated_identity_count: 0,
      diagnostic_horizon_count: 0,
      denominator_identity_count: 0,
      warning_codes: reason,
    },
  };
}

export function computeCanonicalQualityMetrics(input: {
  cohort: CanonicalEvaluationCohort | null;
  candidates: CanonicalEvaluationMetricsCandidate[];
  ranking_opportunity_sets?: CanonicalRankingOpportunitySet[];
  counterfactual_opportunity_sets?: CanonicalCounterfactualOpportunitySet[];
  bootstrap_seed: string;
}): CanonicalQualityMetricsScorecard {
  const candidates = structuredClone(input.candidates);
  const seed = input.bootstrap_seed.trim();
  if (!input.cohort) return undefinedCohortScorecard(candidates, seed);

  const { cohortRows, eligible, duplicated } = deterministicUniqueEligible(
    candidates,
    input.cohort,
  );
  const performance = performanceMetrics(eligible, cohortRows, seed);
  const calibration = calibrationMetrics(eligible, seed);
  const ranking = rankingMetrics(
    input.cohort,
    structuredClone(input.ranking_opportunity_sets ?? []),
  );
  const counterfactual = counterfactualMetrics(
    input.cohort,
    structuredClone(input.counterfactual_opportunity_sets ?? []),
    cohortRows,
    seed,
  );
  const denominatorIdentities = new Set(
    eligible.map((candidate) => candidate.canonical_identity),
  );
  const completeRankingOpportunitySets = structuredClone(
    input.ranking_opportunity_sets ?? [],
  )
    .filter(
      (set) =>
        set.cohort === input.cohort &&
        set.complete &&
        Boolean(set.ranking_version) &&
        set.candidates.length > 0 &&
        set.candidates.every(
          (candidate) =>
            Number.isInteger(candidate.rank) &&
            (candidate.rank as number) > 0 &&
            candidate.outcome_evaluable &&
            candidate.positive_outcome !== null,
        ) &&
        new Set(set.candidates.map((candidate) => candidate.canonical_identity))
          .size === set.candidates.length &&
        new Set(set.candidates.map((candidate) => candidate.rank)).size ===
          set.candidates.length,
    )
    .sort((first, second) =>
      first.opportunity_set_id.localeCompare(second.opportunity_set_id),
    )
    .map((set) => ({
      opportunity_set_id: set.opportunity_set_id,
      decision_day: set.decision_day,
      ranking_version: set.ranking_version as string,
      precision_at_k: Object.fromEntries(
        canonicalQualityRankingKValues.map((k) => {
          const top = [...set.candidates]
            .sort(
              (first, second) =>
                (first.rank as number) - (second.rank as number) ||
                first.canonical_identity.localeCompare(
                  second.canonical_identity,
                ),
            )
            .slice(0, k);
          return [
            String(k),
            round(
              top.filter((candidate) => candidate.positive_outcome).length /
                top.length,
            ),
          ];
        }),
      ),
    }));
  const candidateByIdentity = new Map(
    cohortRows.map((candidate) => [
      candidate.canonical_identity,
      candidate,
    ]),
  );
  const counterfactualSets = structuredClone(
    input.counterfactual_opportunity_sets ?? [],
  )
    .filter(
      (set) =>
        set.cohort === input.cohort &&
        Boolean(set.decision_canonical_identity.trim()) &&
        set.complete &&
        set.candidates.length > 0 &&
        set.candidates.every(
          (candidate) =>
            candidate.outcome_evaluable && finite(candidate.r_result),
        ),
    )
    .sort((first, second) =>
      first.opportunity_set_id.localeCompare(second.opportunity_set_id),
    );
  const counterfactualDecisionIdentities = counterfactualSets.map(
    (set) => set.decision_canonical_identity,
  );
  const completeCounterfactualOpportunitySets =
    new Set(counterfactualDecisionIdentities).size ===
    counterfactualDecisionIdentities.length
      ? counterfactualSets.flatMap((set) => {
          const decision = candidateByIdentity.get(
            set.decision_canonical_identity,
          );
          if (!decision) return [];
          const best = [...set.candidates].sort(
            (first, second) =>
              (second.r_result as number) - (first.r_result as number) ||
              first.canonical_identity.localeCompare(
                second.canonical_identity,
              ),
          )[0];
          return [
            {
              canonical_identity: decision.canonical_identity,
              opportunity_set_id: set.opportunity_set_id,
              decision_day: set.decision_day,
              ticker: best.ticker,
              opportunity_cost_r: round(
                Math.max(0, best.r_result as number),
              ),
              versions: structuredClone(decision.versions),
            },
          ];
        })
      : [];

  return {
    policy_version: CANONICAL_QUALITY_METRICS_POLICY_VERSION,
    synthetic_test_evidence_only: true,
    cohort: input.cohort,
    bootstrap_seed: seed,
    performance,
    calibration,
    ranking,
    counterfactual,
    comparison_evidence: {
      evidence_version: "canonical_quality_comparison_evidence_v1",
      eligible_identity_observations: eligible.map((candidate) => {
        const terminalBinary = binaryWins.has(candidate.terminal_outcome)
          ? 1
          : binaryLosses.has(candidate.terminal_outcome)
            ? 0
            : null;
        const probability =
          terminalBinary !== null &&
          candidate.confidence_probability_semantics === "probability_0_1" &&
          finite(candidate.numeric_confidence) &&
          candidate.numeric_confidence >= 0 &&
          candidate.numeric_confidence <= 1
            ? candidate.numeric_confidence
            : null;
        return {
          canonical_identity: candidate.canonical_identity,
          decision_day: candidate.decision_day,
          ticker: candidate.ticker,
          terminal_binary: terminalBinary,
          r_result: finite(candidate.r_result) ? candidate.r_result : null,
          probability,
          brier_loss:
            probability !== null && terminalBinary !== null
              ? round((probability - terminalBinary) ** 2)
              : null,
          versions: structuredClone(candidate.versions),
        };
      }),
      complete_ranking_opportunity_sets: completeRankingOpportunitySets,
      complete_counterfactual_opportunity_sets:
        completeCounterfactualOpportunitySets,
    },
    diagnostics: {
      policy_version: CANONICAL_QUALITY_METRICS_POLICY_VERSION,
      explicit_cohort: input.cohort,
      input_rows: candidates.length,
      cohort_rows: cohortRows.length,
      eligible_unique_identities: denominatorIdentities.size,
      excluded_ineligible_rows: cohortRows.filter(
        (candidate) =>
          candidate.eligibility_status !== "eligible" ||
          !candidate.cohort_quality_eligible,
      ).length,
      excluded_other_cohort_rows: candidates.length - cohortRows.length,
      duplicated_identity_count: duplicated.length,
      diagnostic_horizon_count: cohortRows.reduce(
        (sum, candidate) => sum + candidate.diagnostic_horizons.length,
        0,
      ),
      denominator_identity_count: denominatorIdentities.size,
      warning_codes: uniqueSorted([
        ...(duplicated.length > 0
          ? ["duplicated_identity_excluded_from_denominator"]
          : []),
        ...(cohortRows.length === 0 ? ["cohort_denominator_undefined"] : []),
      ]),
    },
  };
}
