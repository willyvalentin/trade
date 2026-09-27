import "server-only";

import { createHash } from "node:crypto";

import {
  canonicalQualityPublishabilityPolicy,
  canonicalQualityRankingKValues,
} from "@/lib/canonical-quality-metrics";
import type { LearningBaselineScanRun } from "@/lib/recommendation-learning-baseline-readiness";
import type { RecommendationOutcome } from "@/lib/recommendation-outcome-tracker";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";
import { scannerClockPriorShadowComparisonFromUnknown } from "@/lib/scanner-ranking-clock-prior-shadow";
import {
  evaluateScannerClockPriorShadowScan,
  SCANNER_CLOCK_PRIOR_SHADOW_CANONICAL_EVALUATION_ADAPTER_VERSION,
} from "@/lib/server/scanner-clock-prior-shadow-canonical-evaluation";

export const SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_DECISION_PLAN_VERSION =
  "scanner_clock_prior_shadow_forward_decision_plan_v1" as const;
export const SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_DECISION_VERSION =
  "scanner_clock_prior_shadow_forward_decision_v1" as const;

type RankingK = (typeof canonicalQualityRankingKValues)[number];
type PartitionName = "held_out" | "walk_forward";

const MAXIMUM_SCAN_RUNS = 10_000;
const MAXIMUM_SNAPSHOTS_OR_OUTCOMES = 100_000;

export type ScannerClockPriorShadowForwardWindow = {
  start_at: string;
  end_at: string;
  minimum_opportunity_sets: number;
  minimum_ranked_candidates: number;
  minimum_trading_days: number;
};

export type ScannerClockPriorShadowForwardDecisionPlan = {
  contract_version:
    typeof SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_DECISION_PLAN_VERSION;
  plan_fingerprint: string;
  created_at: string;
  hypothesis: string;
  baseline_ranking_version: string;
  candidate_ranking_version: string;
  primary_k: RankingK;
  windows: Record<PartitionName, ScannerClockPriorShadowForwardWindow>;
  thresholds: {
    continue_minimum_precision_delta: number;
    reject_maximum_precision_delta: number;
  };
};

export type ScannerClockPriorShadowForwardDecisionPlanInput = Omit<
  ScannerClockPriorShadowForwardDecisionPlan,
  "contract_version" | "plan_fingerprint"
>;

type ProportionInterval = {
  value: number;
  numerator: number;
  denominator: number;
  lower: number;
  upper: number;
};

export type ScannerClockPriorShadowForwardPartitionResult = {
  partition: PartitionName;
  opportunity_set_count: number;
  no_trade_opportunity_set_count: number;
  ranked_candidate_count: number;
  trading_day_count: number;
  baseline_precision: ProportionInterval | null;
  candidate_precision: ProportionInterval | null;
  precision_delta: {
    value: number;
    conservative_lower: number;
    conservative_upper: number;
    interval_method: "seeded_trading_day_cluster_bootstrap_v1";
    bootstrap_iterations: 1_000;
    bootstrap_seed: string;
  } | null;
  evidence_complete: boolean;
  reason_codes: string[];
};

export type ScannerClockPriorShadowForwardDecisionResult = {
  contract_version:
    typeof SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_DECISION_VERSION;
  status:
    | "invalid_plan"
    | "conflicting"
    | "evidence_incomplete"
    | "decision_ready";
  decision: "pending" | "continue" | "narrow" | "reject";
  plan_fingerprint: string | null;
  partitions: ScannerClockPriorShadowForwardPartitionResult[];
  reason_codes: string[];
  shadow_only: true;
  live_ranking_effect: false;
  publication_effect: false;
  causal_improvement_claimed: false;
  authority: {
    can_change_ranking_or_publication: false;
    can_promote_policy: false;
    can_request_provider_data: false;
    can_execute_broker_action: false;
  };
};

const safety = {
  shadow_only: true as const,
  live_ranking_effect: false as const,
  publication_effect: false as const,
  causal_improvement_claimed: false as const,
  authority: {
    can_change_ranking_or_publication: false as const,
    can_promote_policy: false as const,
    can_request_provider_data: false as const,
    can_execute_broker_action: false as const,
  },
};

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, canonicalize(nested)]),
    );
  }
  return value;
}

function fingerprint(value: unknown) {
  return createHash("sha256")
    .update(JSON.stringify(canonicalize(value)))
    .digest("hex");
}

function uniqueSorted(values: Iterable<string>) {
  return Array.from(new Set(values)).sort();
}

function finite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function boundedUnitDelta(value: unknown): value is number {
  return finite(value) && value >= -1 && value <= 1;
}

function positiveInteger(value: unknown): value is number {
  return finite(value) && Number.isInteger(value) && value >= 1;
}

function validIso(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function boundedText(value: unknown, minimum: number, maximum: number) {
  return typeof value === "string" &&
    value.trim().length >= minimum &&
    value.trim().length <= maximum;
}

function validWindow(value: ScannerClockPriorShadowForwardWindow) {
  return validIso(value?.start_at) &&
    validIso(value?.end_at) &&
    Date.parse(value.start_at) < Date.parse(value.end_at) &&
    positiveInteger(value.minimum_opportunity_sets) &&
    value.minimum_opportunity_sets >=
      canonicalQualityPublishabilityPolicy.minimum_ranking_opportunity_sets &&
    positiveInteger(value.minimum_ranked_candidates) &&
    value.minimum_ranked_candidates >=
      canonicalQualityPublishabilityPolicy.minimum_proportion_identities &&
    positiveInteger(value.minimum_trading_days) &&
    value.minimum_trading_days >=
      canonicalQualityPublishabilityPolicy.minimum_trading_days;
}

function planPayload(input: ScannerClockPriorShadowForwardDecisionPlanInput) {
  return {
    contract_version:
      SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_DECISION_PLAN_VERSION,
    created_at: input.created_at,
    hypothesis: input.hypothesis.trim(),
    baseline_ranking_version: input.baseline_ranking_version.trim(),
    candidate_ranking_version: input.candidate_ranking_version.trim(),
    primary_k: input.primary_k,
    windows: input.windows,
    thresholds: input.thresholds,
  };
}

export function buildScannerClockPriorShadowForwardDecisionPlan(
  input: ScannerClockPriorShadowForwardDecisionPlanInput,
): ScannerClockPriorShadowForwardDecisionPlan | null {
  if (
    !validIso(input.created_at) ||
    !boundedText(input.hypothesis, 20, 2_800) ||
    !boundedText(input.baseline_ranking_version, 1, 512) ||
    !boundedText(input.candidate_ranking_version, 1, 512) ||
    input.baseline_ranking_version.trim() ===
      input.candidate_ranking_version.trim() ||
    !canonicalQualityRankingKValues.includes(input.primary_k) ||
    !validWindow(input.windows?.held_out) ||
    !validWindow(input.windows?.walk_forward) ||
    Date.parse(input.created_at) >= Date.parse(input.windows.held_out.start_at) ||
    Date.parse(input.windows.held_out.end_at) >
      Date.parse(input.windows.walk_forward.start_at) ||
    !boundedUnitDelta(
      input.thresholds?.continue_minimum_precision_delta,
    ) ||
    !boundedUnitDelta(input.thresholds?.reject_maximum_precision_delta) ||
    input.thresholds.reject_maximum_precision_delta >=
      input.thresholds.continue_minimum_precision_delta
  ) {
    return null;
  }
  const payload = planPayload(input);
  return Object.freeze({
    ...payload,
    plan_fingerprint: fingerprint(payload),
  });
}

function verifiedPlan(
  value: ScannerClockPriorShadowForwardDecisionPlan | null,
) {
  if (!value || value.contract_version !==
    SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_DECISION_PLAN_VERSION) return null;
  const rebuilt = buildScannerClockPriorShadowForwardDecisionPlan(value);
  return rebuilt?.plan_fingerprint === value.plan_fingerprint ? rebuilt : null;
}

function emptyPartition(
  partition: PartitionName,
  reasonCodes: string[],
): ScannerClockPriorShadowForwardPartitionResult {
  return {
    partition,
    opportunity_set_count: 0,
    no_trade_opportunity_set_count: 0,
    ranked_candidate_count: 0,
    trading_day_count: 0,
    baseline_precision: null,
    candidate_precision: null,
    precision_delta: null,
    evidence_complete: false,
    reason_codes: uniqueSorted(reasonCodes),
  };
}

function terminalResult(input: {
  status: ScannerClockPriorShadowForwardDecisionResult["status"];
  decision?: ScannerClockPriorShadowForwardDecisionResult["decision"];
  planFingerprint?: string | null;
  partitions?: ScannerClockPriorShadowForwardPartitionResult[];
  reasons: Iterable<string>;
}): ScannerClockPriorShadowForwardDecisionResult {
  const reasons = uniqueSorted(input.reasons);
  return {
    contract_version: SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_DECISION_VERSION,
    status: input.status,
    decision: input.decision ?? "pending",
    plan_fingerprint: input.planFingerprint ?? null,
    partitions: input.partitions ?? [
      emptyPartition("held_out", reasons),
      emptyPartition("walk_forward", reasons),
    ],
    reason_codes: reasons,
    ...safety,
  };
}

function partitionForTimestamp(
  timestamp: string,
  windows: ScannerClockPriorShadowForwardDecisionPlan["windows"],
): PartitionName | null {
  const observed = Date.parse(timestamp);
  for (const partition of ["held_out", "walk_forward"] as const) {
    const window = windows[partition];
    if (
      observed >= Date.parse(window.start_at) &&
      observed < Date.parse(window.end_at)
    ) return partition;
  }
  return null;
}

function wilson(numerator: number, denominator: number): ProportionInterval {
  const value = numerator / denominator;
  const z = 1.959963984540054;
  const zSquared = z * z;
  const adjusted = 1 + zSquared / denominator;
  const center = (value + zSquared / (2 * denominator)) / adjusted;
  const margin = z * Math.sqrt(
    (value * (1 - value) + zSquared / (4 * denominator)) / denominator,
  ) / adjusted;
  return {
    value,
    numerator,
    denominator,
    lower: Math.max(0, center - margin),
    upper: Math.min(1, center + margin),
  };
}

type PartitionObservation = {
  decision_at: string;
  no_trade: boolean;
  ranked_candidate_count: number;
  baseline_numerator: number;
  baseline_denominator: number;
  candidate_numerator: number;
  candidate_denominator: number;
};

function seededUnit(seed: string) {
  let state = createHash("sha256").update(seed).digest().readUInt32BE(0) || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x1_0000_0000;
  };
}

function clusteredPrecisionDeltaInterval(
  observations: PartitionObservation[],
  seed: string,
) {
  const ranked = observations.filter((observation) => !observation.no_trade);
  const byDay = new Map<string, PartitionObservation[]>();
  for (const observation of ranked) {
    const day = observation.decision_at.slice(0, 10);
    byDay.set(day, [...(byDay.get(day) ?? []), observation]);
  }
  const clusters = [...byDay.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, values]) => values);
  if (clusters.length === 0) return null;
  const random = seededUnit(seed);
  const values: number[] = [];
  for (let iteration = 0;
    iteration < canonicalQualityPublishabilityPolicy.bootstrap_iterations;
    iteration += 1) {
    let baselineNumerator = 0;
    let baselineDenominator = 0;
    let candidateNumerator = 0;
    let candidateDenominator = 0;
    for (let index = 0; index < clusters.length; index += 1) {
      const cluster = clusters[Math.floor(random() * clusters.length)]!;
      for (const observation of cluster) {
        baselineNumerator += observation.baseline_numerator;
        baselineDenominator += observation.baseline_denominator;
        candidateNumerator += observation.candidate_numerator;
        candidateDenominator += observation.candidate_denominator;
      }
    }
    if (baselineDenominator > 0 && candidateDenominator > 0) {
      values.push(
        candidateNumerator / candidateDenominator -
          baselineNumerator / baselineDenominator,
      );
    }
  }
  if (values.length !==
    canonicalQualityPublishabilityPolicy.bootstrap_iterations) return null;
  values.sort((left, right) => left - right);
  const lowerIndex = Math.floor((values.length - 1) * 0.025);
  const upperIndex = Math.ceil((values.length - 1) * 0.975);
  return {
    lower: values[lowerIndex]!,
    upper: values[upperIndex]!,
  };
}

function summarizePartition(input: {
  partition: PartitionName;
  observations: PartitionObservation[];
  window: ScannerClockPriorShadowForwardWindow;
  evaluationReasons: string[];
  bootstrapSeed: string;
}) {
  const ranked = input.observations.filter((observation) => !observation.no_trade);
  const rankedCandidateCount = input.observations.reduce(
    (sum, observation) => sum + observation.ranked_candidate_count,
    0,
  );
  const tradingDayCount = new Set(
    input.observations.map((observation) => observation.decision_at.slice(0, 10)),
  ).size;
  const reasons = [...input.evaluationReasons];
  if (input.observations.length < input.window.minimum_opportunity_sets) {
    reasons.push("minimum_opportunity_sets_not_met");
  }
  if (rankedCandidateCount < input.window.minimum_ranked_candidates) {
    reasons.push("minimum_ranked_candidates_not_met");
  }
  if (tradingDayCount < input.window.minimum_trading_days) {
    reasons.push("minimum_trading_days_not_met");
  }
  const baselineDenominator = ranked.reduce(
    (sum, observation) => sum + observation.baseline_denominator,
    0,
  );
  const candidateDenominator = ranked.reduce(
    (sum, observation) => sum + observation.candidate_denominator,
    0,
  );
  if (
    baselineDenominator === 0 ||
    candidateDenominator === 0 ||
    baselineDenominator !== candidateDenominator
  ) {
    reasons.push("paired_precision_denominator_missing_or_mismatched");
  }
  const baseline = baselineDenominator > 0
    ? wilson(
        ranked.reduce(
          (sum, observation) => sum + observation.baseline_numerator,
          0,
        ),
        baselineDenominator,
      )
    : null;
  const candidate = candidateDenominator > 0
    ? wilson(
        ranked.reduce(
          (sum, observation) => sum + observation.candidate_numerator,
          0,
        ),
        candidateDenominator,
      )
    : null;
  const clusteredInterval = clusteredPrecisionDeltaInterval(
    input.observations,
    input.bootstrapSeed,
  );
  if (!clusteredInterval) {
    reasons.push("trading_day_cluster_interval_not_defined");
  }
  const delta = baseline && candidate && clusteredInterval
    ? {
        value: candidate.value - baseline.value,
        conservative_lower: clusteredInterval.lower,
        conservative_upper: clusteredInterval.upper,
        interval_method:
          "seeded_trading_day_cluster_bootstrap_v1" as const,
        bootstrap_iterations: 1_000 as const,
        bootstrap_seed: input.bootstrapSeed,
      }
    : null;
  const reasonCodes = uniqueSorted(reasons);
  return {
    partition: input.partition,
    opportunity_set_count: input.observations.length,
    no_trade_opportunity_set_count: input.observations.filter(
      (observation) => observation.no_trade,
    ).length,
    ranked_candidate_count: rankedCandidateCount,
    trading_day_count: tradingDayCount,
    baseline_precision: baseline,
    candidate_precision: candidate,
    precision_delta: delta,
    evidence_complete: reasonCodes.length === 0,
    reason_codes: reasonCodes,
  } satisfies ScannerClockPriorShadowForwardPartitionResult;
}

export function classifyScannerClockPriorShadowForwardPrecisionDecision(input: {
  partitions: readonly ScannerClockPriorShadowForwardPartitionResult[];
  thresholds: ScannerClockPriorShadowForwardDecisionPlan["thresholds"];
}): ScannerClockPriorShadowForwardDecisionResult["decision"] {
  const partitionNames = input.partitions.map((partition) => partition.partition);
  if (input.partitions.length !== 2 ||
    new Set(partitionNames).size !== 2 ||
    !partitionNames.includes("held_out") ||
    !partitionNames.includes("walk_forward") ||
    !boundedUnitDelta(input.thresholds.continue_minimum_precision_delta) ||
    !boundedUnitDelta(input.thresholds.reject_maximum_precision_delta) ||
    input.thresholds.reject_maximum_precision_delta >=
      input.thresholds.continue_minimum_precision_delta ||
    input.partitions.some((partition) =>
      !partition.evidence_complete || partition.precision_delta === null
    )) return "pending";
  const deltas = input.partitions.map((partition) => partition.precision_delta!);
  if (deltas.every(
    (delta) => delta.conservative_lower >=
      input.thresholds.continue_minimum_precision_delta,
  )) return "continue";
  if (deltas.some(
    (delta) => delta.conservative_upper <=
      input.thresholds.reject_maximum_precision_delta,
  )) return "reject";
  return "narrow";
}

/**
 * Evaluates a predeclared held-out -> walk-forward clock-prior cohort. The
 * decision is advisory and shadow-only: `continue` means continue shadow
 * validation, never promote the policy or alter live ranking.
 */
export function evaluateScannerClockPriorShadowForwardDecision(input: {
  plan: ScannerClockPriorShadowForwardDecisionPlan | null;
  scanRuns: LearningBaselineScanRun[];
  snapshots: RecommendationSnapshot[];
  outcomes: RecommendationOutcome[];
  bootstrapSeed: string;
}): ScannerClockPriorShadowForwardDecisionResult {
  const plan = verifiedPlan(input.plan);
  if (!plan) {
    return terminalResult({
      status: "invalid_plan",
      reasons: ["forward_decision_plan_invalid_or_changed"],
    });
  }
  if (!boundedText(input.bootstrapSeed, 1, 512) ||
    input.scanRuns.length > MAXIMUM_SCAN_RUNS ||
    input.snapshots.length > MAXIMUM_SNAPSHOTS_OR_OUTCOMES ||
    input.outcomes.length > MAXIMUM_SNAPSHOTS_OR_OUTCOMES) {
    return terminalResult({
      status: "conflicting",
      planFingerprint: plan.plan_fingerprint,
      reasons: ["forward_decision_input_bounds_invalid"],
    });
  }
  const observations: Record<PartitionName, PartitionObservation[]> = {
    held_out: [],
    walk_forward: [],
  };
  const reasonsByPartition: Record<PartitionName, string[]> = {
    held_out: [],
    walk_forward: [],
  };
  const globalReasons: string[] = [];
  const seenScanFingerprints = new Set<string>();
  const seenEvaluationIdentities = new Set<string>();
  let versionCohortIdentity: string | null = null;

  for (const scanRun of input.scanRuns) {
    const decisionAt = scanRun.observed_at;
    const partition = partitionForTimestamp(decisionAt, plan.windows);
    if (!partition) {
      globalReasons.push("scan_outside_declared_evaluation_windows");
      continue;
    }
    if (seenScanFingerprints.has(scanRun.run_fingerprint)) {
      globalReasons.push("duplicate_scan_run_fingerprint");
      continue;
    }
    seenScanFingerprints.add(scanRun.run_fingerprint);
    const comparison = scannerClockPriorShadowComparisonFromUnknown(
      scanRun.payload_json.scanner_clock_prior_shadow_comparison,
    );
    if (!comparison ||
      comparison.baseline_policy_version !== plan.baseline_ranking_version ||
      comparison.shadow_policy_version !== plan.candidate_ranking_version) {
      globalReasons.push("declared_clock_prior_policy_mismatch");
      continue;
    }
    const evaluation = evaluateScannerClockPriorShadowScan({
      scanRun,
      snapshots: input.snapshots,
      outcomes: input.outcomes,
      bootstrapSeed: `${input.bootstrapSeed}:${scanRun.run_fingerprint}`,
    });
    if (
      evaluation.comparison_identity !== null &&
      !evaluation.comparison_identity.startsWith(`${scanRun.run_fingerprint}:`)
    ) {
      globalReasons.push("scan_comparison_identity_mismatch");
      continue;
    }
    if (
      evaluation.status === "insufficient_evidence" &&
      evaluation.coverage.expected_candidate_count === 0 &&
      evaluation.reason_codes.length === 1 &&
      evaluation.reason_codes[0] === "no_ranked_candidates_to_evaluate"
    ) {
      observations[partition].push({
        decision_at: decisionAt,
        no_trade: true,
        ranked_candidate_count: 0,
        baseline_numerator: 0,
        baseline_denominator: 0,
        candidate_numerator: 0,
        candidate_denominator: 0,
      });
      continue;
    }
    if (!evaluation.evaluation ||
      (evaluation.status !== "evaluable" &&
        evaluation.status !== "probability_semantics_missing")) {
      reasonsByPartition[partition].push(
        ...evaluation.reason_codes,
        "canonical_scan_evaluation_incomplete",
      );
      continue;
    }
    const canonical = evaluation.evaluation;
    const pairing = canonical.pairing_evidence;
    if (
      evaluation.adapter_version !==
        SCANNER_CLOCK_PRIOR_SHADOW_CANONICAL_EVALUATION_ADAPTER_VERSION ||
      pairing.baseline_version_tuple.ranking_version !==
        plan.baseline_ranking_version ||
      pairing.candidate_version_tuple.ranking_version !==
        plan.candidate_ranking_version ||
      pairing.shared_opportunity_set_identity.length === 0 ||
      pairing.baseline_version_tuple.semantic_digest.length !== 64 ||
      pairing.candidate_version_tuple.semantic_digest.length !== 64
    ) {
      globalReasons.push("evaluation_policy_or_identity_mismatch");
      continue;
    }
    if (pairing.baseline_version_tuple.engine_version !==
      pairing.candidate_version_tuple.engine_version ||
      pairing.baseline_version_tuple.scoring_version !==
        pairing.candidate_version_tuple.scoring_version ||
      pairing.version_difference_set.differences.length !== 1 ||
      pairing.version_difference_set.differences[0] !== "ranking_version") {
      globalReasons.push("clock_prior_ranking_must_be_only_policy_difference");
      continue;
    }
    if (pairing.baseline_version_tuple.provider_contract_version !==
      pairing.candidate_version_tuple.provider_contract_version ||
      pairing.baseline_version_tuple.evaluator_version !==
        pairing.candidate_version_tuple.evaluator_version) {
      globalReasons.push("provider_or_evaluator_contract_mismatch");
      continue;
    }
    if (canonical.pairing_evidence.baseline_binding_digest.length !== 64 ||
      canonical.pairing_evidence.candidate_binding_digest.length !== 64) {
      globalReasons.push("evaluation_pairing_digest_invalid");
      continue;
    }
    const currentVersionCohortIdentity = [
      pairing.baseline_version_tuple.semantic_digest,
      pairing.candidate_version_tuple.semantic_digest,
      pairing.baseline_version_tuple.provider_contract_version,
      pairing.baseline_version_tuple.evaluator_version,
    ].join(":");
    if (versionCohortIdentity !== null &&
      versionCohortIdentity !== currentVersionCohortIdentity) {
      globalReasons.push("evaluation_version_cohort_not_homogeneous");
      continue;
    }
    versionCohortIdentity = currentVersionCohortIdentity;
    if (seenEvaluationIdentities.has(canonical.evaluation_identity)) {
      globalReasons.push("duplicate_canonical_evaluation_identity");
      continue;
    }
    seenEvaluationIdentities.add(canonical.evaluation_identity);
    const key = String(plan.primary_k);
    const baselineMetric = canonical.baseline.ranking.precision_at_k[key];
    const candidateMetric = canonical.candidate.ranking.precision_at_k[key];
    if (!baselineMetric || !candidateMetric ||
      !finite(baselineMetric.numerator) ||
      !finite(candidateMetric.numerator) ||
      !positiveInteger(baselineMetric.denominator) ||
      !positiveInteger(candidateMetric.denominator) ||
      baselineMetric.identity_count !== baselineMetric.denominator ||
      candidateMetric.identity_count !== candidateMetric.denominator) {
      reasonsByPartition[partition].push(
        "canonical_precision_metric_incomplete",
      );
      continue;
    }
    observations[partition].push({
      decision_at: decisionAt,
      no_trade: false,
      ranked_candidate_count: evaluation.coverage.expected_candidate_count,
      baseline_numerator: baselineMetric.numerator,
      baseline_denominator: baselineMetric.denominator,
      candidate_numerator: candidateMetric.numerator,
      candidate_denominator: candidateMetric.denominator,
    });
  }

  if (globalReasons.length > 0) {
    return terminalResult({
      status: "conflicting",
      planFingerprint: plan.plan_fingerprint,
      reasons: globalReasons,
    });
  }
  const partitions = (["held_out", "walk_forward"] as const).map(
    (partition) => summarizePartition({
      partition,
      observations: observations[partition],
      window: plan.windows[partition],
      evaluationReasons: reasonsByPartition[partition],
      bootstrapSeed: `${input.bootstrapSeed}:${plan.plan_fingerprint}:${partition}`,
    }),
  );
  const evidenceReasons = uniqueSorted(
    partitions.flatMap((partition) => partition.reason_codes),
  );
  if (evidenceReasons.length > 0 ||
    partitions.some((partition) => !partition.evidence_complete)) {
    return terminalResult({
      status: "evidence_incomplete",
      planFingerprint: plan.plan_fingerprint,
      partitions,
      reasons: evidenceReasons,
    });
  }
  const decision = classifyScannerClockPriorShadowForwardPrecisionDecision({
    partitions,
    thresholds: plan.thresholds,
  });
  return terminalResult({
    status: "decision_ready",
    decision,
    planFingerprint: plan.plan_fingerprint,
    partitions,
    reasons: decision === "continue"
      ? ["both_partitions_clear_continue_boundary"]
      : decision === "reject"
        ? ["at_least_one_partition_clears_reject_boundary"]
        : ["complete_evidence_does_not_clear_continue_or_reject_boundary"],
  });
}
