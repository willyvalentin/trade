import { createHash } from "node:crypto";

export const SCANNER_SCORE_PROBABILITY_CALIBRATION_MODEL_VERSION =
  "scanner_score_probability_calibration_model_v1" as const;
export const SCANNER_SCORE_PROBABILITY_CALIBRATION_POLICY_VERSION =
  "fixed_score_bucket_beta_binomial_v1" as const;
export const SCANNER_SCORE_PROBABILITY_CALIBRATION_MINIMUM_SAMPLE = 30;
export const SCANNER_SCORE_PROBABILITY_CALIBRATION_MINIMUM_BUCKET_SAMPLE = 10;

const scoreBuckets = [
  { id: "score_0_20", lower: 0, upper: 20, include_upper: false },
  { id: "score_20_40", lower: 20, upper: 40, include_upper: false },
  { id: "score_40_60", lower: 40, upper: 60, include_upper: false },
  { id: "score_60_80", lower: 60, upper: 80, include_upper: false },
  { id: "score_80_100", lower: 80, upper: 100, include_upper: true },
] as const;

export type ScannerScoreProbabilityCalibrationTrainingInput = {
  candidate_id: string;
  ticker: string;
  decision_at: string;
  outcome_evaluated_at: string;
  baseline_score: number;
  candidate_score: number;
  terminal_outcome: "target_before_stop" | "stop_before_target";
};

type ArmCalibration = {
  wins: number;
  sample_count: number;
  probability: number | null;
};

export type ScannerScoreProbabilityCalibrationBucket = {
  bucket_id: (typeof scoreBuckets)[number]["id"];
  lower: number;
  upper: number;
  include_upper: boolean;
  baseline: ArmCalibration;
  candidate: ArmCalibration;
};

export type ScannerScoreProbabilityCalibrationModel = {
  contract_version: typeof SCANNER_SCORE_PROBABILITY_CALIBRATION_MODEL_VERSION;
  policy_version: typeof SCANNER_SCORE_PROBABILITY_CALIBRATION_POLICY_VERSION;
  model_fingerprint: string;
  fitted_at: string;
  training_window: {
    start_at: string;
    end_at: string;
  };
  sample_count: number;
  trading_day_count: number;
  ticker_count: number;
  minimum_sample: typeof SCANNER_SCORE_PROBABILITY_CALIBRATION_MINIMUM_SAMPLE;
  minimum_bucket_sample:
    typeof SCANNER_SCORE_PROBABILITY_CALIBRATION_MINIMUM_BUCKET_SAMPLE;
  probability_estimator: "beta_binomial_uniform_prior_mean";
  buckets: ScannerScoreProbabilityCalibrationBucket[];
  live_ranking_effect: false;
  publication_effect: false;
  provider_effect: false;
  broker_effect: false;
};

export type ScannerScoreProbabilityCalibrationApplication = {
  model_version: typeof SCANNER_SCORE_PROBABILITY_CALIBRATION_MODEL_VERSION;
  model_fingerprint: string;
  policy_version: typeof SCANNER_SCORE_PROBABILITY_CALIBRATION_POLICY_VERSION;
  arm: "baseline" | "candidate";
  bucket_id: ScannerScoreProbabilityCalibrationBucket["bucket_id"];
  score: number;
  probability: number;
  training_sample_count: number;
  probability_semantics: "calibrated_probability_0_1";
};

function finite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function iso(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, canonical(nested)]),
    );
  }
  return value;
}

function fingerprint(value: unknown) {
  return createHash("sha256")
    .update(JSON.stringify(canonical(value)))
    .digest("hex");
}

function normalizedTicker(value: string) {
  return value.trim().toUpperCase();
}

function matchingBucket(score: number) {
  return scoreBuckets.find(
    (bucket) =>
      score >= bucket.lower &&
      (score < bucket.upper || (bucket.include_upper && score === bucket.upper)),
  ) ?? null;
}

function armCalibration(wins: number, sampleCount: number): ArmCalibration {
  return {
    wins,
    sample_count: sampleCount,
    probability:
      sampleCount >= SCANNER_SCORE_PROBABILITY_CALIBRATION_MINIMUM_BUCKET_SAMPLE
        ? (wins + 1) / (sampleCount + 2)
        : null,
  };
}

function modelPayload(
  value: Omit<ScannerScoreProbabilityCalibrationModel, "model_fingerprint"> |
    ScannerScoreProbabilityCalibrationModel,
) {
  const payload = { ...value } as Partial<ScannerScoreProbabilityCalibrationModel>;
  delete payload.model_fingerprint;
  return payload as Omit<
    ScannerScoreProbabilityCalibrationModel,
    "model_fingerprint"
  >;
}

export function buildScannerScoreProbabilityCalibrationModel(input: {
  fittedAt: string;
  trainingStartAt: string;
  trainingEndAt: string;
  observations: ScannerScoreProbabilityCalibrationTrainingInput[];
}): ScannerScoreProbabilityCalibrationModel | null {
  if (
    !iso(input.fittedAt) ||
    !iso(input.trainingStartAt) ||
    !iso(input.trainingEndAt) ||
    Date.parse(input.trainingStartAt) >= Date.parse(input.trainingEndAt) ||
    Date.parse(input.fittedAt) !== Date.parse(input.trainingEndAt) ||
    input.observations.length <
      SCANNER_SCORE_PROBABILITY_CALIBRATION_MINIMUM_SAMPLE ||
    input.observations.length > 100_000
  ) return null;

  const identities = new Set<string>();
  const tickers = new Set<string>();
  const tradingDays = new Set<string>();
  for (const observation of input.observations) {
    const ticker = normalizedTicker(observation.ticker);
    if (
      !observation.candidate_id.trim() ||
      identities.has(observation.candidate_id) ||
      !ticker ||
      !iso(observation.decision_at) ||
      !iso(observation.outcome_evaluated_at) ||
      Date.parse(observation.decision_at) < Date.parse(input.trainingStartAt) ||
      Date.parse(observation.decision_at) >= Date.parse(input.trainingEndAt) ||
      Date.parse(observation.outcome_evaluated_at) <
        Date.parse(observation.decision_at) ||
      Date.parse(observation.outcome_evaluated_at) > Date.parse(input.fittedAt) ||
      !finite(observation.baseline_score) ||
      !finite(observation.candidate_score) ||
      observation.baseline_score < 0 || observation.baseline_score > 100 ||
      observation.candidate_score < 0 || observation.candidate_score > 100 ||
      !matchingBucket(observation.baseline_score) ||
      !matchingBucket(observation.candidate_score)
    ) return null;
    identities.add(observation.candidate_id);
    tickers.add(ticker);
    tradingDays.add(observation.decision_at.slice(0, 10));
  }
  if (tickers.size < 3 || tradingDays.size < 3) return null;

  const buckets = scoreBuckets.map((bucket) => {
    const baseline = input.observations.filter((observation) =>
      matchingBucket(observation.baseline_score)?.id === bucket.id
    );
    const candidate = input.observations.filter((observation) =>
      matchingBucket(observation.candidate_score)?.id === bucket.id
    );
    return {
      bucket_id: bucket.id,
      lower: bucket.lower,
      upper: bucket.upper,
      include_upper: bucket.include_upper,
      baseline: armCalibration(
        baseline.filter((item) => item.terminal_outcome === "target_before_stop")
          .length,
        baseline.length,
      ),
      candidate: armCalibration(
        candidate.filter((item) => item.terminal_outcome === "target_before_stop")
          .length,
        candidate.length,
      ),
    } satisfies ScannerScoreProbabilityCalibrationBucket;
  });
  const payload = modelPayload({
    contract_version: SCANNER_SCORE_PROBABILITY_CALIBRATION_MODEL_VERSION,
    policy_version: SCANNER_SCORE_PROBABILITY_CALIBRATION_POLICY_VERSION,
    fitted_at: new Date(input.fittedAt).toISOString(),
    training_window: {
      start_at: new Date(input.trainingStartAt).toISOString(),
      end_at: new Date(input.trainingEndAt).toISOString(),
    },
    sample_count: input.observations.length,
    trading_day_count: tradingDays.size,
    ticker_count: tickers.size,
    minimum_sample: SCANNER_SCORE_PROBABILITY_CALIBRATION_MINIMUM_SAMPLE,
    minimum_bucket_sample:
      SCANNER_SCORE_PROBABILITY_CALIBRATION_MINIMUM_BUCKET_SAMPLE,
    probability_estimator: "beta_binomial_uniform_prior_mean",
    buckets,
    live_ranking_effect: false,
    publication_effect: false,
    provider_effect: false,
    broker_effect: false,
  });
  return Object.freeze({
    ...payload,
    model_fingerprint: fingerprint(payload),
  });
}

export function applyScannerScoreProbabilityCalibration(input: {
  model: ScannerScoreProbabilityCalibrationModel | null;
  arm: "baseline" | "candidate";
  score: number;
  decisionAt: string;
}): ScannerScoreProbabilityCalibrationApplication | null {
  const model = input.model;
  if (
    !model ||
    model.contract_version !== SCANNER_SCORE_PROBABILITY_CALIBRATION_MODEL_VERSION ||
    model.policy_version !== SCANNER_SCORE_PROBABILITY_CALIBRATION_POLICY_VERSION ||
    fingerprint(modelPayload(model)) !== model.model_fingerprint ||
    !finite(input.score) || input.score < 0 || input.score > 100 ||
    !iso(input.decisionAt) ||
    Date.parse(input.decisionAt) < Date.parse(model.fitted_at)
  ) return null;
  const bucket = model.buckets.find((item) =>
    input.score >= item.lower &&
    (input.score < item.upper ||
      (item.include_upper && input.score === item.upper))
  );
  const calibration = bucket?.[input.arm];
  if (!bucket || !calibration || calibration.probability === null) return null;
  return {
    model_version: SCANNER_SCORE_PROBABILITY_CALIBRATION_MODEL_VERSION,
    model_fingerprint: model.model_fingerprint,
    policy_version: SCANNER_SCORE_PROBABILITY_CALIBRATION_POLICY_VERSION,
    arm: input.arm,
    bucket_id: bucket.bucket_id,
    score: input.score,
    probability: calibration.probability,
    training_sample_count: calibration.sample_count,
    probability_semantics: "calibrated_probability_0_1",
  };
}
