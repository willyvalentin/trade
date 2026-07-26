import { createHash } from "node:crypto";

import {
  CANONICAL_QUALITY_METRICS_POLICY_VERSION,
  canonicalQualityCalibrationBuckets,
  type CanonicalMetricConfidenceInterval,
  type CanonicalMetricResult,
  type CanonicalQualityComparisonIdentityObservation,
  type CanonicalQualityMetricsScorecard,
  type CanonicalQualityVersionTuple,
} from "@/lib/canonical-quality-metrics";
import type { CanonicalEvaluationCohort } from "@/lib/server/canonical-evaluation-quality-read-model";

export const CANONICAL_QUALITY_SCORECARD_VERSION =
  "canonical_quality_scorecard_v1" as const;
export const CANONICAL_QUALITY_VERSION_COMPARISON_VERSION =
  "canonical_quality_version_comparison_v1" as const;
export const CANONICAL_SHADOW_MODEL_CHANGE_GATE_VERSION =
  "canonical_shadow_model_change_gate_v1" as const;
export const CANONICAL_QUALITY_ROLLBACK_METADATA_VERSION =
  "canonical_quality_rollback_metadata_v1" as const;

export const canonicalShadowModelChangePolicy = {
  minimum_identities: 100,
  minimum_trading_days: 20,
  minimum_tickers: 20,
  minimum_coverage_rate: 0.95,
  minimum_reproducibility_rate: 0.99,
  expectancy_non_inferiority_margin_r: -0.05,
  win_rate_non_inferiority_margin: -0.05,
  maximum_brier_regression: 0.01,
  maximum_ece_regression: 0.02,
  precision_at_5_non_inferiority_margin: -0.05,
  maximum_no_trade_opportunity_cost_regression_r: 0,
  maximum_missing_rate: 0.02,
  maximum_incomplete_rate: 0.02,
  maximum_ambiguous_rate: 0.01,
} as const;

export const canonicalScorecardComparabilityPolicy = {
  minimum_identities: 20,
  minimum_trading_days: 5,
  minimum_tickers: 4,
  minimum_coverage_rate: 0.95,
  minimum_reproducibility_rate: 0.99,
  bootstrap_iterations: 1_000,
  confidence_level: 0.95,
} as const;

export type CanonicalScorecardPeriod = {
  decided_at_or_after: string;
  decided_before: string;
  timezone: "UTC";
};

export type CanonicalScorecardVersions = {
  engine: string;
  scoring: string;
  ranking: string;
  evaluator: string;
  provider: string;
};

export type CanonicalScorecardBuildIdentity = {
  git_commit: string;
  build_identity: string;
};

export type CanonicalScorecardCoverageCounts = {
  expected_identity_count: number;
  eligible_identity_count: number;
  missing_identity_count: number;
  incomplete_identity_count: number;
  ambiguous_identity_count: number;
  conflicting_identity_count: number;
  excluded_identity_count: number;
  reason_codes: string[];
};

export type CanonicalScorecardCoverage =
  CanonicalScorecardCoverageCounts & {
  coverage_rate: number;
  reproducibility_rate: number;
};

export type CanonicalScorecardDenominatorIdentity = {
  method: "sha256_sorted_canonical_identities_v1";
  canonical_identity_count: number;
  canonical_identity_set_sha256: string;
  opportunity_set_count: number;
  opportunity_set_sha256: string | null;
};

export type CanonicalQualityScorecardStatus =
  | "publishable"
  | "not_publishable"
  | "conflicting";

export type CanonicalQualityScorecard = {
  scorecard_version: typeof CANONICAL_QUALITY_SCORECARD_VERSION;
  metrics_policy_version: typeof CANONICAL_QUALITY_METRICS_POLICY_VERSION;
  synthetic_test_evidence_only: true;
  production_baseline: false;
  status: CanonicalQualityScorecardStatus;
  cohort: CanonicalEvaluationCohort;
  period: CanonicalScorecardPeriod;
  versions: CanonicalScorecardVersions;
  version_provenance: {
    method: "sha256_sorted_metric_version_evidence_v1";
    evidence_identity_count: number;
    evidence_sha256: string;
  };
  denominator_identity: CanonicalScorecardDenominatorIdentity;
  coverage: CanonicalScorecardCoverage;
  data_quality: {
    eligible_for_version_comparison: boolean;
    required_metrics: string[];
    reason_codes: string[];
  };
  metrics: CanonicalQualityMetricsScorecard;
  generated_at: string;
  build: CanonicalScorecardBuildIdentity;
  automatic_promotion_allowed: false;
  semantic_digest_algorithm: "sha256_canonical_json_v1";
  semantic_digest: string;
};

export type CanonicalScorecardAssemblyResult = {
  status: "assembled" | "not_publishable" | "conflicting";
  scorecard: CanonicalQualityScorecard;
  reason_codes: string[];
};

export type CanonicalScorecardComparabilityStatus =
  | "comparable"
  | "not_comparable"
  | "insufficient_evidence";

export type CanonicalVersionComparisonClassification =
  | CanonicalScorecardComparabilityStatus
  | "candidate_improvement"
  | "non_inferior"
  | "regression";

export type CanonicalModelVersionIdentity = Pick<
  CanonicalScorecardVersions,
  "engine" | "scoring" | "ranking"
>;

export type CanonicalModelVersionTransitionEvidence = {
  method: "sha256_engine_scoring_ranking_transition_v1";
  baseline: CanonicalModelVersionIdentity;
  candidate: CanonicalModelVersionIdentity;
  semantic_digest: string;
};

export type CanonicalPairBoundComparabilityEvidence = {
  evidence_version: "canonical_pair_bound_comparability_evidence_v1";
  baseline_scorecard_digest: string;
  candidate_scorecard_digest: string;
  cohort: CanonicalEvaluationCohort | null;
  metrics_policy_version:
    | typeof CANONICAL_QUALITY_METRICS_POLICY_VERSION
    | null;
  period_sha256: string | null;
  denominator_sha256: string | null;
  opportunity_set_sha256: string | null;
  evaluator_contract: string | null;
  provider_contract: string | null;
  coverage_reproducibility_sha256: string | null;
  model_version_transition: CanonicalModelVersionTransitionEvidence;
  status: CanonicalScorecardComparabilityStatus;
  reason_codes: string[];
  semantic_digest_algorithm: "sha256_canonical_json_v1";
  semantic_digest: string;
};

export type CanonicalMetricDelta = {
  metric: string;
  status: "measurable" | "not_measurable_yet" | "not_comparable";
  baseline_value: number | null;
  candidate_value: number | null;
  delta: number | null;
  favorable_direction: "higher" | "lower";
  confidence_interval: CanonicalMetricConfidenceInterval | null;
  reason_codes: string[];
};

export type CanonicalQualityVersionComparison = {
  comparison_version: typeof CANONICAL_QUALITY_VERSION_COMPARISON_VERSION;
  synthetic_test_evidence_only: true;
  baseline_scorecard_digest: string;
  candidate_scorecard_digest: string;
  comparability_status: CanonicalScorecardComparabilityStatus;
  classification: CanonicalVersionComparisonClassification;
  comparison_evidence: CanonicalPairBoundComparabilityEvidence;
  deltas: {
    expectancy_r: CanonicalMetricDelta;
    win_rate: CanonicalMetricDelta;
    brier_score: CanonicalMetricDelta;
    expected_calibration_error: CanonicalMetricDelta;
    precision_at_k: Record<string, CanonicalMetricDelta>;
    opportunity_cost_r: CanonicalMetricDelta;
  };
  paired_identity_evidence: boolean;
  paired_opportunity_set_evidence: boolean;
  causal_improvement_claimed: false;
  reason_codes: string[];
  bootstrap_seed: string;
  automatic_promotion_executed: false;
  semantic_digest_algorithm: "sha256_canonical_json_v1";
  semantic_digest: string;
};

export type CanonicalShadowGateResult = {
  gate: string;
  status: "pass" | "fail" | "not_evaluable";
  observed: number | null;
  threshold: number | null;
  reason_codes: string[];
};

export type CanonicalShadowModelChangeAdvice = {
  gate_version: typeof CANONICAL_SHADOW_MODEL_CHANGE_GATE_VERSION;
  status: "advisory_pass" | "advisory_hold" | "advisory_reject";
  gates: CanonicalShadowGateResult[];
  reason_codes: string[];
  advisory_only: true;
  automatic_promotion_executed: false;
};

export type CanonicalQualityRollbackMetadata = {
  metadata_version: typeof CANONICAL_QUALITY_ROLLBACK_METADATA_VERSION;
  previous_versions: CanonicalScorecardVersions;
  candidate_versions: CanonicalScorecardVersions;
  change_reason: string;
  evidence_digests: string[];
  kill_switch_owner: string;
  rollback_trigger_categories: (
    | "expectancy_regression"
    | "win_rate_regression"
    | "calibration_regression"
    | "ranking_regression"
    | "coverage_regression"
    | "reproducibility_regression"
    | "no_trade_opportunity_cost_regression"
    | "data_integrity_conflict"
  )[];
  no_automatic_promotion: true;
};

const fullShaPattern = /^[a-f0-9]{64}$/;
const fullGitCommitPattern = /^[a-f0-9]{40}$/;

function round(value: number) {
  return Math.round(value * 1_000_000_000_000) / 1_000_000_000_000;
}

function finite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort();
}

function canonicalJsonValue(value: unknown): unknown {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error("Non-finite values are forbidden in canonical scorecards.");
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => canonicalJsonValue(item));
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    return Object.fromEntries(
      Object.keys(record)
        .filter((key) => record[key] !== undefined)
        .sort()
        .map((key) => [key, canonicalJsonValue(record[key])]),
    );
  }
  throw new Error("Unsupported value in canonical scorecard.");
}

export function canonicalQualitySemanticDigest(value: unknown) {
  return createHash("sha256")
    .update(JSON.stringify(canonicalJsonValue(value)))
    .digest("hex");
}

function scorecardSemanticPayload(
  scorecard: Omit<CanonicalQualityScorecard, "semantic_digest">,
) {
  return structuredClone(scorecard);
}

export function verifyCanonicalQualityScorecardDigest(
  scorecard: CanonicalQualityScorecard,
) {
  const { semantic_digest: semanticDigest, ...payload } = scorecard;
  return (
    fullShaPattern.test(semanticDigest) &&
    canonicalQualitySemanticDigest(scorecardSemanticPayload(payload)) ===
      semanticDigest
  );
}

function modelVersionIdentity(
  versions: CanonicalScorecardVersions,
): CanonicalModelVersionIdentity {
  return {
    engine: versions.engine,
    scoring: versions.scoring,
    ranking: versions.ranking,
  };
}

function modelVersionTransitionEvidence(
  baseline: CanonicalScorecardVersions,
  candidate: CanonicalScorecardVersions,
): CanonicalModelVersionTransitionEvidence {
  const payload = {
    method: "sha256_engine_scoring_ranking_transition_v1" as const,
    baseline: modelVersionIdentity(baseline),
    candidate: modelVersionIdentity(candidate),
  };
  return {
    ...payload,
    semantic_digest: canonicalQualitySemanticDigest(payload),
  };
}

function verifyCanonicalModelVersionTransitionEvidence(
  evidence: CanonicalModelVersionTransitionEvidence,
) {
  try {
    const { semantic_digest: semanticDigest, ...payload } = evidence;
    const versionsComplete = (
      ["baseline", "candidate"] as const
    ).every((side) =>
      (["engine", "scoring", "ranking"] as const).every(
        (field) =>
          typeof evidence[side][field] === "string" &&
          evidence[side][field].trim().length > 0,
      ),
    );
    return (
      evidence.method ===
        "sha256_engine_scoring_ranking_transition_v1" &&
      versionsComplete &&
      fullShaPattern.test(semanticDigest) &&
      canonicalQualitySemanticDigest(payload) === semanticDigest
    );
  } catch {
    return false;
  }
}

export function verifyCanonicalPairBoundComparabilityEvidence(
  evidence: CanonicalPairBoundComparabilityEvidence,
) {
  try {
    const { semantic_digest: semanticDigest, ...payload } = evidence;
    return (
      fullShaPattern.test(semanticDigest) &&
      fullShaPattern.test(evidence.baseline_scorecard_digest) &&
      fullShaPattern.test(evidence.candidate_scorecard_digest) &&
      verifyCanonicalModelVersionTransitionEvidence(
        evidence.model_version_transition,
      ) &&
      canonicalQualitySemanticDigest(payload) === semanticDigest
    );
  } catch {
    return false;
  }
}

function validInstant(value: string) {
  return (
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) &&
    Number.isFinite(Date.parse(value))
  );
}

function metricByName(
  metrics: CanonicalQualityMetricsScorecard,
  name: string,
): CanonicalMetricResult | null {
  const performance = Object.values(metrics.performance).find(
    (metric) => metric.metric === name,
  );
  if (performance) return performance;
  if (metrics.calibration.brier_score.metric === name) {
    return metrics.calibration.brier_score;
  }
  if (metrics.calibration.expected_calibration_error.metric === name) {
    return metrics.calibration.expected_calibration_error;
  }
  const ranking = Object.values(metrics.ranking.precision_at_k).find(
    (metric) => metric.metric === name,
  );
  if (ranking) return ranking;
  if (metrics.counterfactual.opportunity_cost_r.metric === name) {
    return metrics.counterfactual.opportunity_cost_r;
  }
  return null;
}

function normalizedCoverage(coverage: CanonicalScorecardCoverageCounts) {
  const expected = coverage.expected_identity_count;
  return {
    ...coverage,
    coverage_rate:
      expected > 0
        ? round(
            (expected - coverage.missing_identity_count) / expected,
          )
        : 0,
    reproducibility_rate:
      expected > 0
        ? round(coverage.eligible_identity_count / expected)
        : 0,
    reason_codes: uniqueSorted(coverage.reason_codes),
  };
}

function denominatorEvidence(
  metrics: CanonicalQualityMetricsScorecard,
  cohort: CanonicalEvaluationCohort,
) {
  return cohort === "no_trade_counterfactual" ||
    cohort === "rejected_candidate_counterfactual"
    ? metrics.comparison_evidence.complete_counterfactual_opportunity_sets
    : metrics.comparison_evidence.eligible_identity_observations;
}

function deriveVersionProvenance(input: {
  metrics: CanonicalQualityMetricsScorecard;
  cohort: CanonicalEvaluationCohort;
}) {
  const observations = denominatorEvidence(input.metrics, input.cohort);
  const evidence = observations
    .map((observation) => ({
      canonical_identity: observation.canonical_identity,
      versions: structuredClone(observation.versions),
    }))
    .sort((first, second) =>
      first.canonical_identity.localeCompare(second.canonical_identity),
    );
  const tuples = uniqueSorted(
    evidence.map((item) =>
      JSON.stringify(canonicalJsonValue(item.versions)),
    ),
  );
  const reasons: string[] = [];
  if (evidence.length === 0) reasons.push("version_evidence_missing");
  if (
    evidence.some((item) =>
      Object.values(item.versions).some(
        (version) => typeof version !== "string" || !version.trim(),
      ),
    )
  ) {
    reasons.push("version_metadata_incomplete");
  }
  if (tuples.length > 1) reasons.push("mixed_metric_versions");
  const versions =
    tuples.length === 1
      ? (JSON.parse(tuples[0]) as CanonicalQualityVersionTuple)
      : {
          engine: "",
          scoring: "",
          ranking: "",
          evaluator: "",
          provider: "",
        };
  const rankingVersions = uniqueSorted(
    input.metrics.comparison_evidence.complete_ranking_opportunity_sets.map(
      (set) => set.ranking_version,
    ),
  );
  if (
    rankingVersions.length > 1 ||
    (rankingVersions.length === 1 &&
      versions.ranking &&
      rankingVersions[0] !== versions.ranking)
  ) {
    reasons.push("ranking_version_evidence_conflict");
  }
  const evidencePayload = {
    identity_version_evidence: evidence,
    ranking_opportunity_set_versions:
      input.metrics.comparison_evidence.complete_ranking_opportunity_sets
        .map((set) => ({
          opportunity_set_id: set.opportunity_set_id,
          ranking_version: set.ranking_version,
        }))
        .sort((first, second) =>
          first.opportunity_set_id.localeCompare(second.opportunity_set_id),
        ),
  };
  return {
    versions: versions as CanonicalScorecardVersions,
    provenance: {
      method: "sha256_sorted_metric_version_evidence_v1" as const,
      evidence_identity_count: evidence.length,
      evidence_sha256: canonicalQualitySemanticDigest(evidencePayload),
    },
    reasons,
  };
}

export function assembleCanonicalQualityScorecard(input: {
  metrics: CanonicalQualityMetricsScorecard;
  cohort: CanonicalEvaluationCohort;
  period: CanonicalScorecardPeriod;
  coverage: CanonicalScorecardCoverageCounts;
  required_metrics: string[];
  generated_at: string;
  build: CanonicalScorecardBuildIdentity;
}): CanonicalScorecardAssemblyResult {
  const metrics = structuredClone(input.metrics);
  const reasons: string[] = [];
  const observations = denominatorEvidence(metrics, input.cohort);
  const identities = observations
    .map((item) => item.canonical_identity)
    .sort();
  const uniqueIdentities = uniqueSorted(identities);
  const opportunitySetIds = (
    input.cohort === "no_trade_counterfactual" ||
    input.cohort === "rejected_candidate_counterfactual"
      ? metrics.comparison_evidence
          ?.complete_counterfactual_opportunity_sets ?? []
      : metrics.comparison_evidence?.complete_ranking_opportunity_sets ?? []
  )
    .map((item) => item.opportunity_set_id)
    .sort();
  const periodStart = Date.parse(input.period.decided_at_or_after);
  const periodEnd = Date.parse(input.period.decided_before);
  const versionProvenance = deriveVersionProvenance({
    metrics,
    cohort: input.cohort,
  });
  reasons.push(...versionProvenance.reasons);

  if (metrics.policy_version !== CANONICAL_QUALITY_METRICS_POLICY_VERSION) {
    reasons.push("metrics_policy_version_conflict");
  }
  if (!metrics.cohort || metrics.cohort !== input.cohort) {
    reasons.push("explicit_cohort_conflict");
  }
  if (
    !validInstant(input.period.decided_at_or_after) ||
    !validInstant(input.period.decided_before) ||
    periodStart >= periodEnd ||
    input.period.timezone !== "UTC"
  ) {
    reasons.push("invalid_explicit_period");
  }
  if (!validInstant(input.generated_at)) reasons.push("invalid_generated_at");
  if (!fullGitCommitPattern.test(input.build.git_commit)) {
    reasons.push("invalid_full_git_identity");
  }
  if (!input.build.build_identity.trim()) reasons.push("build_identity_missing");
  if (
    uniqueIdentities.length !== identities.length ||
    ((input.cohort !== "no_trade_counterfactual" &&
      input.cohort !== "rejected_candidate_counterfactual") &&
      uniqueIdentities.length !==
        metrics.diagnostics.denominator_identity_count) ||
    uniqueIdentities.length !== input.coverage.eligible_identity_count
  ) {
    reasons.push("denominator_identity_conflict");
  }
  if (
    observations.some((item) => {
      const timestamp = Date.parse(`${item.decision_day}T00:00:00.000Z`);
      return timestamp < periodStart || timestamp >= periodEnd;
    })
  ) {
    reasons.push("metric_observation_outside_explicit_period");
  }
  const coverageCounts = [
    input.coverage.expected_identity_count,
    input.coverage.eligible_identity_count,
    input.coverage.missing_identity_count,
    input.coverage.incomplete_identity_count,
    input.coverage.ambiguous_identity_count,
    input.coverage.conflicting_identity_count,
    input.coverage.excluded_identity_count,
  ];
  const classifiedCoverageCount =
    input.coverage.eligible_identity_count +
    input.coverage.missing_identity_count +
    input.coverage.incomplete_identity_count +
    input.coverage.ambiguous_identity_count +
    input.coverage.conflicting_identity_count +
    input.coverage.excluded_identity_count;
  if (
    coverageCounts.some(
      (value) => !Number.isInteger(value) || value < 0,
    ) ||
    classifiedCoverageCount !== input.coverage.expected_identity_count
  ) {
    reasons.push("coverage_arithmetic_conflict");
  }

  const requiredMetrics = uniqueSorted(input.required_metrics);
  if (requiredMetrics.length === 0) reasons.push("required_metrics_undefined");
  for (const name of requiredMetrics) {
    const metric = metricByName(metrics, name);
    if (!metric) reasons.push(`required_metric_missing:${name}`);
    else if (metric.status !== "measurable") {
      reasons.push(`required_metric_not_publishable:${name}`);
    }
  }
  if (uniqueIdentities.length === 0) {
    reasons.push("denominator_undefined");
  }

  const conflicts = reasons.filter((reason) =>
    /conflict|invalid|outside|mixed_metric_versions|version_metadata_incomplete|version_evidence_missing/.test(
      reason,
    ),
  );
  const status: CanonicalQualityScorecardStatus =
    conflicts.length > 0
      ? "conflicting"
      : reasons.length > 0
        ? "not_publishable"
        : "publishable";
  const payload: Omit<CanonicalQualityScorecard, "semantic_digest"> = {
    scorecard_version: CANONICAL_QUALITY_SCORECARD_VERSION,
    metrics_policy_version: CANONICAL_QUALITY_METRICS_POLICY_VERSION,
    synthetic_test_evidence_only: true,
    production_baseline: false,
    status,
    cohort: input.cohort,
    period: structuredClone(input.period),
    versions: structuredClone(versionProvenance.versions),
    version_provenance: structuredClone(versionProvenance.provenance),
    denominator_identity: {
      method: "sha256_sorted_canonical_identities_v1",
      canonical_identity_count: uniqueIdentities.length,
      canonical_identity_set_sha256:
        canonicalQualitySemanticDigest(uniqueIdentities),
      opportunity_set_count: opportunitySetIds.length,
      opportunity_set_sha256:
        opportunitySetIds.length > 0
          ? canonicalQualitySemanticDigest(opportunitySetIds)
          : null,
    },
    coverage: normalizedCoverage(input.coverage),
    data_quality: {
      eligible_for_version_comparison: status === "publishable",
      required_metrics: requiredMetrics,
      reason_codes: uniqueSorted(reasons),
    },
    metrics,
    generated_at: input.generated_at,
    build: structuredClone(input.build),
    automatic_promotion_allowed: false,
    semantic_digest_algorithm: "sha256_canonical_json_v1",
  };
  const scorecard: CanonicalQualityScorecard = {
    ...payload,
    semantic_digest: canonicalQualitySemanticDigest(
      scorecardSemanticPayload(payload),
    ),
  };
  return {
    status:
      status === "publishable"
        ? "assembled"
        : status === "conflicting"
          ? "conflicting"
          : "not_publishable",
    scorecard,
    reason_codes: uniqueSorted(reasons),
  };
}

export function deriveCanonicalPairBoundComparabilityEvidence(input: {
  baseline: CanonicalQualityScorecard;
  candidate: CanonicalQualityScorecard;
}): CanonicalPairBoundComparabilityEvidence {
  const structural: string[] = [];
  const insufficient: string[] = [];
  const { baseline, candidate } = input;
  if (
    !verifyCanonicalQualityScorecardDigest(baseline) ||
    !verifyCanonicalQualityScorecardDigest(candidate)
  ) {
    structural.push("scorecard_semantic_digest_mismatch");
  }
  if (baseline.cohort !== candidate.cohort) {
    structural.push("cohort_not_comparable");
  }
  if (baseline.metrics_policy_version !== candidate.metrics_policy_version) {
    structural.push("metrics_policy_not_comparable");
  }
  if (JSON.stringify(baseline.period) !== JSON.stringify(candidate.period)) {
    structural.push("period_not_comparable");
  }
  if (baseline.versions.evaluator !== candidate.versions.evaluator) {
    structural.push("evaluator_contract_not_comparable");
  }
  if (baseline.versions.provider !== candidate.versions.provider) {
    structural.push("provider_contract_not_comparable");
  }
  if (
    baseline.denominator_identity.canonical_identity_set_sha256 !==
      candidate.denominator_identity.canonical_identity_set_sha256
  ) {
    structural.push("denominator_not_comparable");
  }
  if (
    baseline.denominator_identity.opportunity_set_sha256 !==
      candidate.denominator_identity.opportunity_set_sha256
  ) {
    structural.push("opportunity_set_not_comparable");
  }
  if (
    baseline.status !== "publishable" ||
    candidate.status !== "publishable"
  ) {
    insufficient.push("scorecard_not_publishable");
  }
  for (const scorecard of [baseline, candidate]) {
    if (
      scorecard.denominator_identity.canonical_identity_count <
      canonicalScorecardComparabilityPolicy.minimum_identities
    ) {
      insufficient.push("comparison_minimum_identity_count_not_met");
    }
    const evidence = denominatorEvidence(scorecard.metrics, scorecard.cohort);
    if (
      new Set(evidence.map((item) => item.decision_day)).size <
      canonicalScorecardComparabilityPolicy.minimum_trading_days
    ) {
      insufficient.push("comparison_minimum_trading_day_count_not_met");
    }
    if (
      new Set(evidence.map((item) => item.ticker).filter(Boolean)).size <
      canonicalScorecardComparabilityPolicy.minimum_tickers
    ) {
      insufficient.push("comparison_minimum_ticker_count_not_met");
    }
    if (
      scorecard.coverage.coverage_rate <
      canonicalScorecardComparabilityPolicy.minimum_coverage_rate
    ) {
      insufficient.push("comparison_coverage_below_minimum");
    }
    if (
      scorecard.coverage.reproducibility_rate <
      canonicalScorecardComparabilityPolicy.minimum_reproducibility_rate
    ) {
      insufficient.push("comparison_reproducibility_below_minimum");
    }
  }
  const status = (structural.length > 0
      ? "not_comparable"
      : insufficient.length > 0
        ? "insufficient_evidence"
        : "comparable") as CanonicalScorecardComparabilityStatus;
  const common = {
    cohort:
      baseline.cohort === candidate.cohort ? baseline.cohort : null,
    metrics_policy_version:
      baseline.metrics_policy_version === candidate.metrics_policy_version
        ? baseline.metrics_policy_version
        : null,
    period_sha256:
      JSON.stringify(baseline.period) === JSON.stringify(candidate.period)
        ? canonicalQualitySemanticDigest(baseline.period)
        : null,
    denominator_sha256:
      baseline.denominator_identity.canonical_identity_set_sha256 ===
      candidate.denominator_identity.canonical_identity_set_sha256
        ? baseline.denominator_identity.canonical_identity_set_sha256
        : null,
    opportunity_set_sha256:
      baseline.denominator_identity.opportunity_set_sha256 ===
      candidate.denominator_identity.opportunity_set_sha256
        ? baseline.denominator_identity.opportunity_set_sha256
        : null,
    evaluator_contract:
      baseline.versions.evaluator === candidate.versions.evaluator
        ? baseline.versions.evaluator
        : null,
    provider_contract:
      baseline.versions.provider === candidate.versions.provider
        ? baseline.versions.provider
        : null,
    coverage_reproducibility_sha256: canonicalQualitySemanticDigest({
      baseline: {
        coverage_rate: baseline.coverage.coverage_rate,
        reproducibility_rate: baseline.coverage.reproducibility_rate,
      },
      candidate: {
        coverage_rate: candidate.coverage.coverage_rate,
        reproducibility_rate: candidate.coverage.reproducibility_rate,
      },
    }),
    model_version_transition: modelVersionTransitionEvidence(
      baseline.versions,
      candidate.versions,
    ),
  };
  const payload: Omit<
    CanonicalPairBoundComparabilityEvidence,
    "semantic_digest"
  > = {
    evidence_version: "canonical_pair_bound_comparability_evidence_v1",
    baseline_scorecard_digest: baseline.semantic_digest,
    candidate_scorecard_digest: candidate.semantic_digest,
    ...common,
    status,
    reason_codes: uniqueSorted([...structural, ...insufficient]),
    semantic_digest_algorithm: "sha256_canonical_json_v1",
  };
  return {
    ...payload,
    semantic_digest: canonicalQualitySemanticDigest(payload),
  };
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

function quantile(sorted: number[], probability: number) {
  if (sorted.length === 0) return null;
  const position = (sorted.length - 1) * probability;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sorted[lower];
  const fraction = position - lower;
  return sorted[lower] + (sorted[upper] - sorted[lower]) * fraction;
}

function mean(values: number[]) {
  return values.length > 0
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : null;
}

function valuesByDay(
  observations: CanonicalQualityComparisonIdentityObservation[],
  pick: (item: CanonicalQualityComparisonIdentityObservation) => number | null,
) {
  const result = new Map<string, number[]>();
  for (const item of observations) {
    const value = pick(item);
    if (!finite(value)) continue;
    const values = result.get(item.decision_day) ?? [];
    values.push(value);
    result.set(item.decision_day, values);
  }
  return result;
}

function clusteredDeltaInterval(input: {
  baseline: Map<string, number[]>;
  candidate: Map<string, number[]>;
  seed: string;
  statistic?: (values: number[]) => number | null;
}): CanonicalMetricConfidenceInterval | null {
  const days = [...input.baseline.keys()]
    .filter((day) => input.candidate.has(day))
    .sort();
  if (
    days.length < 2 ||
    days.length !== input.baseline.size ||
    days.length !== input.candidate.size
  ) {
    return null;
  }
  const statistic = input.statistic ?? mean;
  const random = seededRandom(input.seed);
  const samples: number[] = [];
  for (
    let iteration = 0;
    iteration < canonicalScorecardComparabilityPolicy.bootstrap_iterations;
    iteration += 1
  ) {
    const baselineValues: number[] = [];
    const candidateValues: number[] = [];
    for (let index = 0; index < days.length; index += 1) {
      const sampledDay = days[Math.floor(random() * days.length)];
      baselineValues.push(...(input.baseline.get(sampledDay) ?? []));
      candidateValues.push(...(input.candidate.get(sampledDay) ?? []));
    }
    const baselineValue = statistic(baselineValues);
    const candidateValue = statistic(candidateValues);
    if (baselineValue !== null && candidateValue !== null) {
      samples.push(candidateValue - baselineValue);
    }
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
    bootstrap_seed: input.seed,
    bootstrap_iterations:
      canonicalScorecardComparabilityPolicy.bootstrap_iterations,
  };
}

function conservativeIntervalDifference(
  baseline: CanonicalMetricResult,
  candidate: CanonicalMetricResult,
): CanonicalMetricConfidenceInterval | null {
  const baselineInterval = baseline.confidence_interval;
  const candidateInterval = candidate.confidence_interval;
  if (!baselineInterval || !candidateInterval) return null;
  return {
    method: "conservative_wilson_interval_difference_v1",
    confidence_level: 0.95,
    lower: round(candidateInterval.lower - baselineInterval.upper),
    upper: round(candidateInterval.upper - baselineInterval.lower),
    bootstrap_seed: null,
    bootstrap_iterations: null,
  };
}

function unavailableDelta(
  metric: string,
  status: CanonicalMetricDelta["status"],
  reasons: string[],
  favorableDirection: CanonicalMetricDelta["favorable_direction"],
): CanonicalMetricDelta {
  return {
    metric,
    status,
    baseline_value: null,
    candidate_value: null,
    delta: null,
    favorable_direction: favorableDirection,
    confidence_interval: null,
    reason_codes: uniqueSorted(reasons),
  };
}

function deltaResult(input: {
  metric: string;
  baseline: CanonicalMetricResult;
  candidate: CanonicalMetricResult;
  interval: CanonicalMetricConfidenceInterval | null;
  favorable_direction: CanonicalMetricDelta["favorable_direction"];
  reasons?: string[];
}): CanonicalMetricDelta {
  if (
    !finite(input.baseline.value) ||
    !finite(input.candidate.value) ||
    !input.interval
  ) {
    return unavailableDelta(
      input.metric,
      "not_measurable_yet",
      [
        ...(input.reasons ?? []),
        "delta_value_or_uncertainty_not_defined",
      ],
      input.favorable_direction,
    );
  }
  return {
    metric: input.metric,
    status: "measurable",
    baseline_value: input.baseline.value,
    candidate_value: input.candidate.value,
    delta: round(input.candidate.value - input.baseline.value),
    favorable_direction: input.favorable_direction,
    confidence_interval: input.interval,
    reason_codes: uniqueSorted(input.reasons ?? []),
  };
}

function ece(values: number[]) {
  if (values.length === 0 || values.length % 2 !== 0) return null;
  const pairs = Array.from({ length: values.length / 2 }, (_, index) => ({
    probability: values[index * 2],
    actual: values[index * 2 + 1],
  }));
  let result = 0;
  for (const bucket of canonicalQualityCalibrationBuckets) {
    const members = pairs.filter(
      (item) =>
        item.probability >= bucket.lower &&
        (item.probability < bucket.upper ||
          (bucket.include_upper && item.probability === bucket.upper)),
    );
    if (members.length === 0) continue;
    const averageProbability =
      members.reduce((sum, item) => sum + item.probability, 0) /
      members.length;
    const actualRate =
      members.reduce((sum, item) => sum + item.actual, 0) / members.length;
    result +=
      Math.abs(averageProbability - actualRate) *
      (members.length / pairs.length);
  }
  return result;
}

function eceValuesByDay(
  observations: CanonicalQualityComparisonIdentityObservation[],
) {
  const result = new Map<string, number[]>();
  for (const item of observations) {
    if (!finite(item.probability) || item.terminal_binary === null) continue;
    const values = result.get(item.decision_day) ?? [];
    values.push(item.probability, item.terminal_binary);
    result.set(item.decision_day, values);
  }
  return result;
}

function comparisonSemanticPayload(
  comparison: Omit<CanonicalQualityVersionComparison, "semantic_digest">,
) {
  return structuredClone(comparison);
}

export function verifyCanonicalQualityVersionComparisonDigest(
  comparison: CanonicalQualityVersionComparison,
) {
  try {
    const { semantic_digest: semanticDigest, ...payload } = comparison;
    return (
      fullShaPattern.test(semanticDigest) &&
      verifyCanonicalPairBoundComparabilityEvidence(
        comparison.comparison_evidence,
      ) &&
      comparison.baseline_scorecard_digest ===
        comparison.comparison_evidence.baseline_scorecard_digest &&
      comparison.candidate_scorecard_digest ===
        comparison.comparison_evidence.candidate_scorecard_digest &&
      comparison.comparability_status ===
        comparison.comparison_evidence.status &&
      canonicalQualitySemanticDigest(comparisonSemanticPayload(payload)) ===
        semanticDigest
    );
  } catch {
    return false;
  }
}

export function compareCanonicalQualityScorecards(input: {
  baseline: CanonicalQualityScorecard;
  candidate: CanonicalQualityScorecard;
  bootstrap_seed: string;
}): CanonicalQualityVersionComparison {
  const baseline = structuredClone(input.baseline);
  const candidate = structuredClone(input.candidate);
  const seed = input.bootstrap_seed.trim();
  const comparisonEvidence = deriveCanonicalPairBoundComparabilityEvidence({
    baseline,
    candidate,
  });
  const gate = comparisonEvidence;
  const unavailableStatus =
    gate.status === "not_comparable"
      ? ("not_comparable" as const)
      : ("not_measurable_yet" as const);
  const unavailable = (metric: string, direction: "higher" | "lower") =>
    unavailableDelta(metric, unavailableStatus, gate.reason_codes, direction);

  let expectancy = unavailable("expectancy_r", "higher");
  let winRate = unavailable("win_rate", "higher");
  let brier = unavailable("brier_score", "lower");
  let calibrationError = unavailable(
    "expected_calibration_error",
    "lower",
  );
  const precision: Record<string, CanonicalMetricDelta> = Object.fromEntries(
    ["1", "3", "5"].map((k) => [
      k,
      unavailable(`precision_at_${k}`, "higher"),
    ]),
  );
  let opportunityCost = unavailable("opportunity_cost_r", "lower");

  if (gate.status === "comparable") {
    const baselineEvidence =
      baseline.metrics.comparison_evidence.eligible_identity_observations;
    const candidateEvidence =
      candidate.metrics.comparison_evidence.eligible_identity_observations;
    expectancy = deltaResult({
      metric: "expectancy_r",
      baseline: baseline.metrics.performance.expectancy_r,
      candidate: candidate.metrics.performance.expectancy_r,
      interval: clusteredDeltaInterval({
        baseline: valuesByDay(baselineEvidence, (item) => item.r_result),
        candidate: valuesByDay(candidateEvidence, (item) => item.r_result),
        seed: `${seed}:expectancy_r`,
      }),
      favorable_direction: "higher",
      reasons: ["trading_day_clustered_delta_v1"],
    });
    winRate = deltaResult({
      metric: "win_rate",
      baseline: baseline.metrics.performance.win_rate,
      candidate: candidate.metrics.performance.win_rate,
      interval: conservativeIntervalDifference(
        baseline.metrics.performance.win_rate,
        candidate.metrics.performance.win_rate,
      ),
      favorable_direction: "higher",
      reasons: ["conservative_wilson_interval_difference_v1"],
    });
    brier = deltaResult({
      metric: "brier_score",
      baseline: baseline.metrics.calibration.brier_score,
      candidate: candidate.metrics.calibration.brier_score,
      interval: clusteredDeltaInterval({
        baseline: valuesByDay(baselineEvidence, (item) => item.brier_loss),
        candidate: valuesByDay(candidateEvidence, (item) => item.brier_loss),
        seed: `${seed}:brier_score`,
      }),
      favorable_direction: "lower",
      reasons: ["trading_day_clustered_delta_v1"],
    });
    calibrationError = deltaResult({
      metric: "expected_calibration_error",
      baseline: baseline.metrics.calibration.expected_calibration_error,
      candidate: candidate.metrics.calibration.expected_calibration_error,
      interval: clusteredDeltaInterval({
        baseline: eceValuesByDay(baselineEvidence),
        candidate: eceValuesByDay(candidateEvidence),
        seed: `${seed}:expected_calibration_error`,
        statistic: ece,
      }),
      favorable_direction: "lower",
      reasons: [
        "fixed_calibration_buckets_v1",
        "trading_day_clustered_delta_v1",
      ],
    });
    for (const k of ["1", "3", "5"]) {
      const baselineMetric = baseline.metrics.ranking.precision_at_k[k];
      const candidateMetric = candidate.metrics.ranking.precision_at_k[k];
      precision[k] =
        baselineMetric && candidateMetric
          ? deltaResult({
              metric: `precision_at_${k}`,
              baseline: baselineMetric,
              candidate: candidateMetric,
              interval: conservativeIntervalDifference(
                baselineMetric,
                candidateMetric,
              ),
              favorable_direction: "higher",
              reasons: ["conservative_wilson_interval_difference_v1"],
            })
          : unavailableDelta(
              `precision_at_${k}`,
              "not_measurable_yet",
              ["precision_metric_missing"],
              "higher",
            );
    }
    const baselineCounterfactual =
      baseline.metrics.comparison_evidence
        .complete_counterfactual_opportunity_sets;
    const candidateCounterfactual =
      candidate.metrics.comparison_evidence
        .complete_counterfactual_opportunity_sets;
    opportunityCost = deltaResult({
      metric: "opportunity_cost_r",
      baseline: baseline.metrics.counterfactual.opportunity_cost_r,
      candidate: candidate.metrics.counterfactual.opportunity_cost_r,
      interval: clusteredDeltaInterval({
        baseline: valuesByDay(
          baselineCounterfactual.map((item) => ({
            ...item,
            terminal_binary: null,
            r_result: item.opportunity_cost_r,
            probability: null,
            brier_loss: null,
          })),
          (item) => item.r_result,
        ),
        candidate: valuesByDay(
          candidateCounterfactual.map((item) => ({
            ...item,
            terminal_binary: null,
            r_result: item.opportunity_cost_r,
            probability: null,
            brier_loss: null,
          })),
          (item) => item.r_result,
        ),
        seed: `${seed}:opportunity_cost_r`,
      }),
      favorable_direction: "lower",
      reasons: ["trading_day_clustered_delta_v1"],
    });
  }

  const pairedIdentityEvidence =
    baseline.denominator_identity.canonical_identity_set_sha256 ===
    candidate.denominator_identity.canonical_identity_set_sha256;
  const pairedOpportunitySetEvidence =
    baseline.denominator_identity.opportunity_set_sha256 !== null &&
    baseline.denominator_identity.opportunity_set_sha256 ===
      candidate.denominator_identity.opportunity_set_sha256;
  let classification: CanonicalVersionComparisonClassification = gate.status;
  if (gate.status === "comparable") {
    if (
      baseline.cohort === "no_trade_counterfactual" ||
      baseline.cohort === "rejected_candidate_counterfactual"
    ) {
      const interval = opportunityCost.confidence_interval;
      classification =
        interval &&
        interval.lower >
          canonicalShadowModelChangePolicy
            .maximum_no_trade_opportunity_cost_regression_r
          ? "regression"
          : interval && interval.upper <= 0
            ? "candidate_improvement"
            : interval
              ? "non_inferior"
              : "comparable";
    } else {
    const expectancyInterval = expectancy.confidence_interval;
    const winInterval = winRate.confidence_interval;
    const brierInterval = brier.confidence_interval;
    const precisionFiveInterval = precision["5"].confidence_interval;
    if (baseline.semantic_digest === candidate.semantic_digest) {
      classification = "non_inferior";
    } else if (
      expectancyInterval &&
      brierInterval &&
      precisionFiveInterval &&
      (expectancyInterval.upper <
        canonicalShadowModelChangePolicy.expectancy_non_inferiority_margin_r ||
        brierInterval.lower >
          canonicalShadowModelChangePolicy.maximum_brier_regression ||
        precisionFiveInterval.upper <
          canonicalShadowModelChangePolicy
            .precision_at_5_non_inferiority_margin)
    ) {
      classification = "regression";
    } else if (
      expectancyInterval &&
      brierInterval &&
      precisionFiveInterval &&
      expectancyInterval.lower > 0 &&
      brierInterval.upper <=
        canonicalShadowModelChangePolicy.maximum_brier_regression &&
      precisionFiveInterval.lower >=
        canonicalShadowModelChangePolicy
          .precision_at_5_non_inferiority_margin
    ) {
      classification = "candidate_improvement";
    } else if (
      expectancyInterval &&
      winInterval &&
      brierInterval &&
      precisionFiveInterval &&
      expectancyInterval.lower >=
        canonicalShadowModelChangePolicy.expectancy_non_inferiority_margin_r &&
      winInterval.lower >=
        canonicalShadowModelChangePolicy.win_rate_non_inferiority_margin &&
      brierInterval.upper <=
        canonicalShadowModelChangePolicy.maximum_brier_regression &&
      precisionFiveInterval.lower >=
        canonicalShadowModelChangePolicy
          .precision_at_5_non_inferiority_margin
    ) {
      classification = "non_inferior";
    }
    }
  }

  const payload: Omit<CanonicalQualityVersionComparison, "semantic_digest"> = {
    comparison_version: CANONICAL_QUALITY_VERSION_COMPARISON_VERSION,
    synthetic_test_evidence_only: true,
    baseline_scorecard_digest: baseline.semantic_digest,
    candidate_scorecard_digest: candidate.semantic_digest,
    comparability_status: gate.status,
    classification,
    comparison_evidence: comparisonEvidence,
    deltas: {
      expectancy_r: expectancy,
      win_rate: winRate,
      brier_score: brier,
      expected_calibration_error: calibrationError,
      precision_at_k: precision,
      opportunity_cost_r: opportunityCost,
    },
    paired_identity_evidence: pairedIdentityEvidence,
    paired_opportunity_set_evidence: pairedOpportunitySetEvidence,
    causal_improvement_claimed: false,
    reason_codes: uniqueSorted([
      ...gate.reason_codes,
      ...(!pairedIdentityEvidence
        ? ["paired_identity_evidence_missing_no_causal_claim"]
        : []),
      ...(!pairedOpportunitySetEvidence
        ? ["paired_opportunity_set_evidence_missing_no_causal_claim"]
        : []),
      "comparison_is_advisory_not_causal",
    ]),
    bootstrap_seed: seed,
    automatic_promotion_executed: false,
    semantic_digest_algorithm: "sha256_canonical_json_v1",
  };
  return {
    ...payload,
    semantic_digest: canonicalQualitySemanticDigest(
      comparisonSemanticPayload(payload),
    ),
  };
}

function rate(count: number, denominator: number) {
  return denominator > 0 ? count / denominator : null;
}

function numericGate(
  gate: string,
  observed: number | null,
  threshold: number,
  pass: (observed: number, threshold: number) => boolean,
): CanonicalShadowGateResult {
  if (!finite(observed)) {
    return {
      gate,
      status: "not_evaluable",
      observed: null,
      threshold,
      reason_codes: [`${gate}_not_evaluable`],
    };
  }
  const passed = pass(observed, threshold);
  return {
    gate,
    status: passed ? "pass" : "fail",
    observed: round(observed),
    threshold,
    reason_codes: passed ? [] : [`${gate}_failed`],
  };
}

function structuralGate(
  gate: string,
  reasonCodes: string[],
  missingReason?: string,
): CanonicalShadowGateResult {
  if (missingReason) {
    return {
      gate,
      status: "not_evaluable",
      observed: null,
      threshold: null,
      reason_codes: [missingReason],
    };
  }
  return {
    gate,
    status: reasonCodes.length === 0 ? "pass" : "fail",
    observed: null,
    threshold: null,
    reason_codes: uniqueSorted(reasonCodes),
  };
}

function advisoryComparisonBindingReasons(
  comparison: CanonicalQualityVersionComparison,
  prefix: "primary" | "no_trade",
) {
  const reasons: string[] = [];
  const evidence = comparison?.comparison_evidence;

  if (!evidence) {
    return [
      `${prefix}_comparison_digest_or_pair_binding_invalid`,
      `${prefix}_pair_bound_evidence_missing`,
    ];
  }

  if (!verifyCanonicalQualityVersionComparisonDigest(comparison)) {
    reasons.push(`${prefix}_comparison_digest_or_pair_binding_invalid`);
  }
  if (!verifyCanonicalPairBoundComparabilityEvidence(evidence)) {
    reasons.push(`${prefix}_pair_bound_evidence_invalid`);
  }
  if (
    comparison.baseline_scorecard_digest !==
    evidence.baseline_scorecard_digest
  ) {
    reasons.push(`${prefix}_baseline_scorecard_digest_mismatch`);
  }
  if (
    comparison.candidate_scorecard_digest !==
    evidence.candidate_scorecard_digest
  ) {
    reasons.push(`${prefix}_candidate_scorecard_digest_mismatch`);
  }
  if (
    comparison.comparability_status !== "comparable" ||
    evidence.status !== "comparable"
  ) {
    reasons.push(`${prefix}_comparison_not_comparable`);
  }
  if (!evidence.cohort) reasons.push(`${prefix}_cohort_binding_missing`);
  if (
    evidence.metrics_policy_version !==
    CANONICAL_QUALITY_METRICS_POLICY_VERSION
  ) {
    reasons.push(`${prefix}_metrics_policy_binding_invalid`);
  }
  for (const [field, value] of [
    ["period", evidence.period_sha256],
    ["denominator", evidence.denominator_sha256],
    ["opportunity_set", evidence.opportunity_set_sha256],
    ["coverage_reproducibility", evidence.coverage_reproducibility_sha256],
  ] as const) {
    if (!value || !fullShaPattern.test(value)) {
      reasons.push(`${prefix}_${field}_binding_missing`);
    }
  }
  if (!evidence.evaluator_contract?.trim()) {
    reasons.push(`${prefix}_evaluator_contract_binding_missing`);
  }
  if (!evidence.provider_contract?.trim()) {
    reasons.push(`${prefix}_provider_contract_binding_missing`);
  }
  if (
    !verifyCanonicalModelVersionTransitionEvidence(
      evidence.model_version_transition,
    )
  ) {
    reasons.push(`${prefix}_model_version_transition_invalid`);
  }

  return uniqueSorted(reasons);
}

function candidateScorecardBindingReasons(
  scorecard: CanonicalQualityScorecard,
  comparison: CanonicalQualityVersionComparison,
) {
  const reasons: string[] = [];
  const evidence = comparison?.comparison_evidence;
  if (!evidence) {
    return [
      "candidate_scorecard_comparison_digest_mismatch",
      "candidate_scorecard_pair_bound_evidence_missing",
    ];
  }
  const transition = evidence.model_version_transition;

  if (!verifyCanonicalQualityScorecardDigest(scorecard)) {
    reasons.push("candidate_scorecard_digest_invalid");
  }
  if (
    scorecard.semantic_digest !== comparison.candidate_scorecard_digest ||
    scorecard.semantic_digest !== evidence.candidate_scorecard_digest
  ) {
    reasons.push("candidate_scorecard_comparison_digest_mismatch");
  }
  if (scorecard.cohort !== evidence.cohort) {
    reasons.push("candidate_scorecard_cohort_mismatch");
  }
  if (scorecard.metrics_policy_version !== evidence.metrics_policy_version) {
    reasons.push("candidate_scorecard_metrics_policy_mismatch");
  }
  if (
    canonicalQualitySemanticDigest(scorecard.period) !==
    evidence.period_sha256
  ) {
    reasons.push("candidate_scorecard_period_mismatch");
  }
  if (
    scorecard.denominator_identity.canonical_identity_set_sha256 !==
    evidence.denominator_sha256
  ) {
    reasons.push("candidate_scorecard_denominator_mismatch");
  }
  if (
    scorecard.denominator_identity.opportunity_set_sha256 !==
    evidence.opportunity_set_sha256
  ) {
    reasons.push("candidate_scorecard_opportunity_set_mismatch");
  }
  if (scorecard.versions.evaluator !== evidence.evaluator_contract) {
    reasons.push("candidate_scorecard_evaluator_contract_mismatch");
  }
  if (scorecard.versions.provider !== evidence.provider_contract) {
    reasons.push("candidate_scorecard_provider_contract_mismatch");
  }
  if (!verifyCanonicalModelVersionTransitionEvidence(transition)) {
    reasons.push("candidate_scorecard_model_version_transition_invalid");
  } else if (
    canonicalQualitySemanticDigest(modelVersionIdentity(scorecard.versions)) !==
    canonicalQualitySemanticDigest(transition.candidate)
  ) {
    reasons.push("candidate_scorecard_model_version_mismatch");
  }
  if (scorecard.automatic_promotion_allowed !== false) {
    reasons.push("candidate_scorecard_automatic_promotion_forbidden");
  }

  return uniqueSorted(reasons);
}

function noTradeTransitionBindingReasons(
  primary: CanonicalQualityVersionComparison,
  noTrade: CanonicalQualityVersionComparison,
) {
  const reasons: string[] = [];
  const primaryEvidence = primary?.comparison_evidence;
  const noTradeEvidence = noTrade?.comparison_evidence;
  if (!primaryEvidence || !noTradeEvidence) {
    return ["no_trade_pair_bound_evidence_missing"];
  }
  const primaryTransition =
    primaryEvidence.model_version_transition;
  const noTradeTransition =
    noTradeEvidence.model_version_transition;

  if (
    !verifyCanonicalModelVersionTransitionEvidence(primaryTransition) ||
    !verifyCanonicalModelVersionTransitionEvidence(noTradeTransition)
  ) {
    return ["no_trade_model_version_transition_invalid"];
  }

  for (const side of ["baseline", "candidate"] as const) {
    for (const field of ["engine", "scoring", "ranking"] as const) {
      if (
        primaryTransition[side][field] !==
        noTradeTransition[side][field]
      ) {
        reasons.push(`no_trade_${side}_${field}_version_mismatch`);
      }
    }
  }
  if (
    noTradeEvidence.cohort !== "no_trade_counterfactual"
  ) {
    reasons.push("no_trade_comparison_cohort_invalid");
  }

  return uniqueSorted(reasons);
}

export function evaluateCanonicalShadowModelChangeGates(input: {
  comparison: CanonicalQualityVersionComparison;
  candidate_scorecard: CanonicalQualityScorecard;
  no_trade_comparison?: CanonicalQualityVersionComparison;
}): CanonicalShadowModelChangeAdvice {
  const scorecard = input.candidate_scorecard;
  const primaryBindingReasons = advisoryComparisonBindingReasons(
    input.comparison,
    "primary",
  );
  const candidateBindingReasons = candidateScorecardBindingReasons(
    scorecard,
    input.comparison,
  );
  const primaryBindingValid =
    primaryBindingReasons.length === 0 &&
    candidateBindingReasons.length === 0;
  const noTradeComparison = input.no_trade_comparison;
  const noTradeBindingReasons = noTradeComparison
    ? [
        ...advisoryComparisonBindingReasons(
          noTradeComparison,
          "no_trade",
        ),
        ...noTradeTransitionBindingReasons(
          input.comparison,
          noTradeComparison,
        ),
      ]
    : [];
  const noTradeBindingValid =
    Boolean(noTradeComparison) && noTradeBindingReasons.length === 0;
  const evidence =
    primaryBindingValid
      ? scorecard.metrics.comparison_evidence.eligible_identity_observations
      : [];
  const denominator = primaryBindingValid
    ? scorecard.coverage.expected_identity_count
    : 0;
  const expectancyLower =
    primaryBindingValid
      ? input.comparison.deltas.expectancy_r.confidence_interval?.lower ?? null
      : null;
  const winRateLower =
    primaryBindingValid
      ? input.comparison.deltas.win_rate.confidence_interval?.lower ?? null
      : null;
  const brierUpper =
    primaryBindingValid
      ? input.comparison.deltas.brier_score.confidence_interval?.upper ?? null
      : null;
  const eceUpper =
    primaryBindingValid
      ? input.comparison.deltas.expected_calibration_error.confidence_interval
          ?.upper ?? null
      : null;
  const precisionFiveLower =
    primaryBindingValid
      ? input.comparison.deltas.precision_at_k["5"]?.confidence_interval
          ?.lower ?? null
      : null;
  const noTradeOpportunityCostUpper =
    noTradeBindingValid && noTradeComparison
      ? noTradeComparison.deltas.opportunity_cost_r.confidence_interval
          ?.upper ?? null
      : null;
  const gates = [
    structuralGate(
      "primary_pair_bound_comparison",
      primaryBindingReasons,
    ),
    structuralGate(
      "candidate_scorecard_pair_binding",
      candidateBindingReasons,
    ),
    structuralGate(
      "no_trade_pair_bound_comparison",
      noTradeBindingReasons,
      noTradeComparison ? undefined : "no_trade_comparison_missing",
    ),
    numericGate(
      "minimum_identities",
      primaryBindingValid
        ? scorecard.denominator_identity.canonical_identity_count
        : null,
      canonicalShadowModelChangePolicy.minimum_identities,
      (observed, threshold) => observed >= threshold,
    ),
    numericGate(
      "minimum_trading_days",
      new Set(evidence.map((item) => item.decision_day)).size,
      canonicalShadowModelChangePolicy.minimum_trading_days,
      (observed, threshold) => observed >= threshold,
    ),
    numericGate(
      "minimum_tickers",
      new Set(evidence.map((item) => item.ticker).filter(Boolean)).size,
      canonicalShadowModelChangePolicy.minimum_tickers,
      (observed, threshold) => observed >= threshold,
    ),
    numericGate(
      "coverage_rate",
      scorecard.coverage.coverage_rate,
      canonicalShadowModelChangePolicy.minimum_coverage_rate,
      (observed, threshold) => observed >= threshold,
    ),
    numericGate(
      "reproducibility_rate",
      scorecard.coverage.reproducibility_rate,
      canonicalShadowModelChangePolicy.minimum_reproducibility_rate,
      (observed, threshold) => observed >= threshold,
    ),
    numericGate(
      "expectancy_non_inferiority",
      expectancyLower,
      canonicalShadowModelChangePolicy.expectancy_non_inferiority_margin_r,
      (observed, threshold) => observed >= threshold,
    ),
    numericGate(
      "win_rate_uncertainty",
      winRateLower,
      canonicalShadowModelChangePolicy.win_rate_non_inferiority_margin,
      (observed, threshold) => observed >= threshold,
    ),
    numericGate(
      "brier_regression",
      brierUpper,
      canonicalShadowModelChangePolicy.maximum_brier_regression,
      (observed, threshold) => observed <= threshold,
    ),
    numericGate(
      "ece_regression",
      eceUpper,
      canonicalShadowModelChangePolicy.maximum_ece_regression,
      (observed, threshold) => observed <= threshold,
    ),
    numericGate(
      "precision_at_5",
      precisionFiveLower,
      canonicalShadowModelChangePolicy
        .precision_at_5_non_inferiority_margin,
      (observed, threshold) => observed >= threshold,
    ),
    numericGate(
      "no_trade_opportunity_cost",
      noTradeOpportunityCostUpper,
      canonicalShadowModelChangePolicy
        .maximum_no_trade_opportunity_cost_regression_r,
      (observed, threshold) => observed <= threshold,
    ),
    numericGate(
      "missing_rate",
      rate(scorecard.coverage.missing_identity_count, denominator),
      canonicalShadowModelChangePolicy.maximum_missing_rate,
      (observed, threshold) => observed <= threshold,
    ),
    numericGate(
      "incomplete_rate",
      rate(scorecard.coverage.incomplete_identity_count, denominator),
      canonicalShadowModelChangePolicy.maximum_incomplete_rate,
      (observed, threshold) => observed <= threshold,
    ),
    numericGate(
      "ambiguous_rate",
      rate(scorecard.coverage.ambiguous_identity_count, denominator),
      canonicalShadowModelChangePolicy.maximum_ambiguous_rate,
      (observed, threshold) => observed <= threshold,
    ),
  ];
  const fail = gates.some((gate) => gate.status === "fail");
  const notEvaluable = gates.some((gate) => gate.status === "not_evaluable");
  return {
    gate_version: CANONICAL_SHADOW_MODEL_CHANGE_GATE_VERSION,
    status: fail
      ? "advisory_reject"
      : notEvaluable
        ? "advisory_hold"
        : "advisory_pass",
    gates,
    reason_codes: uniqueSorted([
      ...gates.flatMap((gate) => gate.reason_codes),
      "shadow_only_advisory_gate",
      "automatic_promotion_forbidden",
    ]),
    advisory_only: true,
    automatic_promotion_executed: false,
  };
}

export function buildCanonicalQualityRollbackMetadata(input: {
  previous_versions: CanonicalScorecardVersions;
  candidate_versions: CanonicalScorecardVersions;
  change_reason: string;
  evidence_digests: string[];
  kill_switch_owner?: string;
  rollback_trigger_categories: CanonicalQualityRollbackMetadata["rollback_trigger_categories"];
}): CanonicalQualityRollbackMetadata {
  if (
    !input.change_reason.trim() ||
    input.evidence_digests.length === 0 ||
    input.evidence_digests.some((digest) => !fullShaPattern.test(digest))
  ) {
    throw new Error("Rollback metadata requires reason and full evidence digests.");
  }
  return {
    metadata_version: CANONICAL_QUALITY_ROLLBACK_METADATA_VERSION,
    previous_versions: structuredClone(input.previous_versions),
    candidate_versions: structuredClone(input.candidate_versions),
    change_reason: input.change_reason.trim(),
    evidence_digests: uniqueSorted(input.evidence_digests),
    kill_switch_owner: input.kill_switch_owner?.trim() || "UNASSIGNED",
    rollback_trigger_categories: uniqueSorted(
      input.rollback_trigger_categories,
    ) as CanonicalQualityRollbackMetadata["rollback_trigger_categories"],
    no_automatic_promotion: true,
  };
}
