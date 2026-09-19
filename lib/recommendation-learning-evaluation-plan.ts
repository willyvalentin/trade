import {
  candidateDecisionRecordFromScanRun,
} from "@/lib/candidate-decision-readback";
import type { CandidateDecisionRecord } from "@/lib/candidate-decision-record";
import {
  projectRecommendationOutcomeBundle,
  type CanonicalProjectedOutcome,
} from "@/lib/canonical-evaluation-projection-adapters";
import type { LearningBaselineScanRun } from "@/lib/recommendation-learning-baseline-readiness";
import type {
  RecommendationLearningBaselineSegment,
  RecommendationLearningBaselineSegmentation,
} from "@/lib/recommendation-learning-baseline-segments";
import {
  hasCanonicalOutcomeProviderCoverageWithEvaluationAnchor,
} from "@/lib/recommendation-outcome-canonical-coverage";
import { recommendationOutcomeEvaluationAnchorFromSnapshot } from "@/lib/recommendation-outcome-evaluation-anchor";
import {
  entryBoundExcursionFromOutcome,
  RECOMMENDATION_OUTCOME_ENTRY_BOUND_EXCURSION_CONTRACT_VERSION,
  type RecommendationOutcome,
} from "@/lib/recommendation-outcome-tracker";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";
import {
  RESEARCH_SNAPSHOT_CANDIDATE_DECISION_LINKAGE_VERSION,
  isSupportedResearchSnapshotCandidateDecisionLinkageVersion,
  type ResearchSnapshotCandidateDecisionDisposition,
} from "@/lib/research-snapshot-candidate-linkage";
import { recommendationDecisionSourceProvenanceFromSnapshot } from "@/lib/recommendation-decision-source-provenance";

export const RECOMMENDATION_LEARNING_EVALUATION_PLAN_VERSION =
  "recommendation_learning_evaluation_plan_v1" as const;

type EvaluationSampleType = "visible" | "research" | "rejected";

type EvaluationSample = {
  sample_type: EvaluationSampleType;
  primary_outcome: CanonicalProjectedOutcome;
};

type NumericSummary = {
  observed_count: number;
  mean: number | null;
  median: number | null;
};

export type RecommendationLearningEvaluationPlan = {
  contract_version: typeof RECOMMENDATION_LEARNING_EVALUATION_PLAN_VERSION;
  segment_key: string;
  status: "not_freeze_eligible" | "ready_for_explicit_freeze";
  policy_attribution: RecommendationLearningBaselineSegment["policy_attribution"];
  decision_records: RecommendationLearningBaselineSegment["decision_records"];
  outcome_population: {
    visible_primary_outcome_count: number;
    research_primary_outcome_count: number;
    rejected_primary_outcome_count: number;
    explicit_no_trade_decision_count: number;
    primary_outcome_by_horizon: Record<"15m" | "30m" | "60m", number>;
  };
  metrics: {
    entry: {
      known_count: number;
      triggered_count: number;
      not_triggered_count: number;
      unknown_count: number;
      triggered_rate: number | null;
    };
    terminal: {
      target_first_count: number;
      stop_first_count: number;
      neither_count: number;
      unknown_count: number;
    };
    horizon_r: NumericSummary;
    excursion: {
      contract_version: typeof RECOMMENDATION_OUTCOME_ENTRY_BOUND_EXCURSION_CONTRACT_VERSION;
      status: "entry_bound_excursion_measured_with_explicit_missingness";
      triggered_outcome_count: number;
      contract_missing_count: number;
      mfe_r: NumericSummary;
      mae_r: NumericSummary;
      paired_mfe_mae_count: number;
      mfe_missing_count: number;
      mae_missing_count: number;
    };
  } | null;
  blockers: string[];
  notes: string[];
};

export type RecommendationLearningEvaluationPlans = {
  contract_version: typeof RECOMMENDATION_LEARNING_EVALUATION_PLAN_VERSION;
  status:
    | "no_comparable_segments"
    | "no_freeze_eligible_segments"
    | "eligible_segments_require_explicit_freeze";
  plans: RecommendationLearningEvaluationPlan[];
};

type CounterfactualCandidate = CandidateDecisionRecord["candidates"][number] & {
  disposition: ResearchSnapshotCandidateDecisionDisposition;
};

function normalizeTicker(value: string | null | undefined) {
  return value?.trim().toUpperCase() ?? "";
}

function textOrNull(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function isAfterOrEqual(left: string | null | undefined, right: string) {
  const leftTimestamp = Date.parse(left ?? "");
  const rightTimestamp = Date.parse(right);

  return (
    Number.isFinite(leftTimestamp) &&
    Number.isFinite(rightTimestamp) &&
    leftTimestamp >= rightTimestamp
  );
}

function isResearchOnlySnapshot(snapshot: RecommendationSnapshot) {
  const payload = snapshot.payload_json;

  return (
    snapshot.is_visible === false &&
    snapshot.recommendation_id === null &&
    (snapshot.source_mode === "research_only" ||
      snapshot.data_mode === "research_only" ||
      payload.visibility_status === "research_only" ||
      payload.learning_acceleration_sample === true ||
      payload.research_only === true ||
      payload.learning_scope === "research_only")
  );
}

function isCounterfactualCandidate(
  candidate: CandidateDecisionRecord["candidates"][number],
): candidate is CounterfactualCandidate {
  return (
    candidate.disposition === "selected_not_published" ||
    candidate.disposition === "ranked_not_selected" ||
    candidate.disposition === "filtered_before_ranking"
  );
}

function researchSnapshotForCandidate({
  candidate,
  scanRunFingerprint,
  snapshots,
}: {
  candidate: CounterfactualCandidate;
  scanRunFingerprint: string;
  snapshots: RecommendationSnapshot[];
}) {
  const matches = snapshots.filter((snapshot) => {
    const payload = snapshot.payload_json;

    return (
      isResearchOnlySnapshot(snapshot) &&
      snapshot.scan_run_id === scanRunFingerprint &&
      normalizeTicker(snapshot.ticker) === normalizeTicker(candidate.ticker) &&
      textOrNull(payload.candidate_id) === candidate.candidate_id &&
      textOrNull(payload.candidate_decision_id) === candidate.candidate_id &&
      payload.candidate_decision_disposition === candidate.disposition &&
      isSupportedResearchSnapshotCandidateDecisionLinkageVersion(
        payload.candidate_decision_linkage_version,
      ) &&
      (candidate.disposition !== "filtered_before_ranking" ||
        payload.candidate_decision_linkage_version ===
          RESEARCH_SNAPSHOT_CANDIDATE_DECISION_LINKAGE_VERSION) &&
      payload.candidate_decision_linkage_status === "verified"
    );
  });

  return matches.length === 1 ? matches[0] : null;
}

function completePrimaryOutcome({
  snapshot,
  outcomes,
  decisionTimestamp,
  metadata,
}: {
  snapshot: RecommendationSnapshot;
  outcomes: RecommendationOutcome[];
  decisionTimestamp: string;
  metadata: Parameters<typeof projectRecommendationOutcomeBundle>[0]["metadata"];
}): CanonicalProjectedOutcome | null {
  const sameFingerprint = outcomes.filter(
    (outcome) => outcome.snapshot_fingerprint === snapshot.snapshot_fingerprint,
  );
  const hasRelationConflict = sameFingerprint.some(
    (outcome) =>
      (outcome.snapshot_id !== null && outcome.snapshot_id !== snapshot.id) ||
      (outcome.recommendation_id !== null &&
        snapshot.recommendation_id !== null &&
        outcome.recommendation_id !== snapshot.recommendation_id),
  );
  const linkedOutcomes = sameFingerprint.filter(
    (outcome) =>
      (outcome.snapshot_id === null || outcome.snapshot_id === snapshot.id) &&
      (outcome.recommendation_id === null ||
        snapshot.recommendation_id === null ||
        outcome.recommendation_id === snapshot.recommendation_id),
  );

  if (
    hasRelationConflict ||
    linkedOutcomes.some(
      (outcome) => !isAfterOrEqual(outcome.evaluated_at, decisionTimestamp),
    )
  ) {
    return null;
  }

  const projected = projectRecommendationOutcomeBundle({
    snapshot,
    outcomes: linkedOutcomes,
    metadata,
  });
  const primary = projected.projection.primary_outcome;
  const selectedOutcome = primary
    ? linkedOutcomes.find(
        (outcome) => outcome.id === primary.primary_outcome?.outcome.id,
      ) ?? null
    : null;
  const evaluationAnchor = recommendationOutcomeEvaluationAnchorFromSnapshot(
    snapshot,
  );

  return primary?.status === "selected" &&
    primary.primary_outcome !== null &&
    hasCanonicalOutcomeProviderCoverageWithEvaluationAnchor(
      selectedOutcome?.payload_json.canonical_provider_coverage,
      evaluationAnchor,
    )
    ? primary.primary_outcome.outcome
    : null;
}

function samePolicyAttribution({
  record,
  segment,
}: {
  record: CandidateDecisionRecord;
  segment: RecommendationLearningBaselineSegment;
}) {
  const attribution = record.learning_attribution;
  const expected = segment.policy_attribution;

  return (
    attribution.attribution_status === "complete" &&
    attribution.canonical_evaluation_versions !== null &&
    attribution.recommendation_publish_policy_version ===
      expected.recommendation_publish_policy_version &&
    Object.entries(expected.canonical_evaluation_versions).every(
      ([field, value]) =>
        attribution.canonical_evaluation_versions?.[
          field as keyof typeof attribution.canonical_evaluation_versions
        ] === value,
    )
  );
}

function numericSummary(values: Array<number | null>) {
  const observed = values.filter(
    (value): value is number => typeof value === "number" && Number.isFinite(value),
  );
  const ordered = [...observed].sort((left, right) => left - right);
  const midpoint = Math.floor(ordered.length / 2);

  return {
    observed_count: observed.length,
    mean:
      observed.length === 0
        ? null
        : observed.reduce((sum, value) => sum + value, 0) / observed.length,
    median:
      ordered.length === 0
        ? null
        : ordered.length % 2 === 1
          ? ordered[midpoint]!
          : (ordered[midpoint - 1]! + ordered[midpoint]!) / 2,
  } satisfies NumericSummary;
}

function sorted(values: Iterable<string>) {
  return Array.from(new Set(values)).sort();
}

function samplesForSegment({
  segment,
  scanRuns,
  snapshots,
  outcomes,
}: {
  segment: RecommendationLearningBaselineSegment;
  scanRuns: LearningBaselineScanRun[];
  snapshots: RecommendationSnapshot[];
  outcomes: RecommendationOutcome[];
}) {
  const blockers = new Set<string>();
  const scanRunsByFingerprint = new Map<string, LearningBaselineScanRun[]>();
  for (const scanRun of scanRuns) {
    const record = candidateDecisionRecordFromScanRun(scanRun);
    const fingerprint = record?.scan_run_fingerprint;
    if (!fingerprint) continue;
    const existing = scanRunsByFingerprint.get(fingerprint) ?? [];
    existing.push(scanRun);
    scanRunsByFingerprint.set(fingerprint, existing);
  }

  const samples: EvaluationSample[] = [];
  for (const fingerprint of segment.decision_records.scan_run_fingerprints) {
    const matches = scanRunsByFingerprint.get(fingerprint) ?? [];
    if (matches.length !== 1) {
      blockers.add("segment_decision_record_missing_or_ambiguous");
      continue;
    }

    const record = candidateDecisionRecordFromScanRun(matches[0]!);
    if (
      !record ||
      record.scan_run_fingerprint !== fingerprint ||
      !samePolicyAttribution({ record, segment })
    ) {
      blockers.add("segment_policy_or_decision_identity_mismatch");
      continue;
    }

    const versions = record.learning_attribution.canonical_evaluation_versions;
    if (versions === null) {
      blockers.add("segment_canonical_versions_missing");
      continue;
    }

    for (const candidate of record.candidates) {
      if (candidate.disposition === "published") {
        const linkedSnapshots = snapshots.filter(
          (snapshot) =>
            snapshot.scan_run_id === record.scan_run_fingerprint &&
            normalizeTicker(snapshot.ticker) === normalizeTicker(candidate.ticker),
        );
        if (linkedSnapshots.length !== 1) {
          blockers.add("visible_primary_outcome_identity_incomplete");
          continue;
        }
        if (
          recommendationDecisionSourceProvenanceFromSnapshot(
            linkedSnapshots[0]!,
          ).status !== "admissible"
        ) {
          blockers.add("visible_primary_outcome_decision_source_provenance_incomplete");
          continue;
        }
        const primary = completePrimaryOutcome({
          snapshot: linkedSnapshots[0]!,
          outcomes,
          decisionTimestamp: record.decision_timestamp,
          metadata: {
            producer_decision_id: candidate.candidate_id,
            decision_timestamp: record.decision_timestamp,
            sample_type: "visible",
            numeric_confidence: null,
            confidence_label: null,
            versions,
            candidate_id: candidate.candidate_id,
            scan_run_id: record.scan_run_id,
            scan_run_fingerprint: record.scan_run_fingerprint,
          },
        });
        if (!primary) {
          blockers.add("visible_primary_outcome_not_admissible");
          continue;
        }
        samples.push({ sample_type: "visible", primary_outcome: primary });
        continue;
      }

      if (!isCounterfactualCandidate(candidate)) continue;
      const snapshot = researchSnapshotForCandidate({
        candidate,
        scanRunFingerprint: record.scan_run_fingerprint,
        snapshots,
      });
      if (!snapshot) {
        blockers.add("counterfactual_primary_outcome_identity_incomplete");
        continue;
      }
      if (
        recommendationDecisionSourceProvenanceFromSnapshot(snapshot).status !==
        "admissible"
      ) {
        blockers.add(
          "counterfactual_primary_outcome_decision_source_provenance_incomplete",
        );
        continue;
      }
      const primary = completePrimaryOutcome({
        snapshot,
        outcomes,
        decisionTimestamp: record.decision_timestamp,
        metadata: {
          producer_decision_id: candidate.candidate_id,
          decision_timestamp: record.decision_timestamp,
          sample_type: "research_only",
          numeric_confidence: null,
          confidence_label: null,
          versions,
          candidate_id: candidate.candidate_id,
          scan_run_id: record.scan_run_id,
          scan_run_fingerprint: record.scan_run_fingerprint,
        },
      });
      if (!primary) {
        blockers.add("counterfactual_primary_outcome_not_admissible");
        continue;
      }
      samples.push({
        sample_type:
          candidate.disposition === "filtered_before_ranking"
            ? "rejected"
            : "research",
        primary_outcome: primary,
      });
    }
  }

  return { blockers, samples };
}

function evaluationPlanForSegment({
  segment,
  scanRuns,
  snapshots,
  outcomes,
}: {
  segment: RecommendationLearningBaselineSegment;
  scanRuns: LearningBaselineScanRun[];
  snapshots: RecommendationSnapshot[];
  outcomes: RecommendationOutcome[];
}): RecommendationLearningEvaluationPlan {
  const { blockers, samples } = samplesForSegment({
    segment,
    scanRuns,
    snapshots,
    outcomes,
  });
  const visible = samples.filter((sample) => sample.sample_type === "visible");
  const research = samples.filter((sample) => sample.sample_type === "research");
  const rejected = samples.filter((sample) => sample.sample_type === "rejected");

  if (
    visible.length !== segment.readiness.visible_outcomes.primary_outcome_count ||
    research.length !==
      segment.readiness.counterfactual_coverage.research_candidate_outcomes_collected ||
    rejected.length !==
      segment.readiness.counterfactual_coverage.rejected_candidate_outcomes_collected
  ) {
    blockers.add("evaluation_population_does_not_match_readiness_receipt");
  }

  const population = {
    visible_primary_outcome_count: visible.length,
    research_primary_outcome_count: research.length,
    rejected_primary_outcome_count: rejected.length,
    explicit_no_trade_decision_count:
      segment.readiness.counterfactual_coverage.no_trade_outcomes_collected,
    primary_outcome_by_horizon: {
      "15m": samples.filter((sample) => sample.primary_outcome.horizon === "15m")
        .length,
      "30m": samples.filter((sample) => sample.primary_outcome.horizon === "30m")
        .length,
      "60m": samples.filter((sample) => sample.primary_outcome.horizon === "60m")
        .length,
    },
  };
  const canEvaluate =
    segment.readiness.status === "eligible_for_explicit_freeze" &&
    blockers.size === 0;
  const outcomesById = new Map<string, RecommendationOutcome | null>();
  for (const outcome of outcomes) {
    outcomesById.set(
      outcome.id,
      outcomesById.has(outcome.id) ? null : outcome,
    );
  }
  const primaryOutcomes = samples.map((sample) => sample.primary_outcome);
  const entryKnown = primaryOutcomes.filter(
    (outcome) => typeof outcome.entry_triggered === "boolean",
  );
  const enteredOutcomes = primaryOutcomes.filter(
    (outcome) => outcome.entry_triggered === true,
  );
  const entryBoundExcursions = enteredOutcomes.map((outcome) => {
    const persistedOutcome = outcomesById.get(outcome.id) ?? null;
    return persistedOutcome ? entryBoundExcursionFromOutcome(persistedOutcome) : null;
  });
  const measuredMfe = entryBoundExcursions.filter(
    (excursion) => excursion?.mfe_r.status === "measured",
  );
  const measuredMae = entryBoundExcursions.filter(
    (excursion) => excursion?.mae_r.status === "measured",
  );
  const pairedExcursions = entryBoundExcursions.filter(
    (excursion) =>
      excursion?.mfe_r.status === "measured" &&
      excursion.mae_r.status === "measured",
  );

  return {
    contract_version: RECOMMENDATION_LEARNING_EVALUATION_PLAN_VERSION,
    segment_key: segment.segment_key,
    status: canEvaluate ? "ready_for_explicit_freeze" : "not_freeze_eligible",
    policy_attribution: segment.policy_attribution,
    decision_records: segment.decision_records,
    outcome_population: population,
    metrics: canEvaluate
      ? {
          entry: {
            known_count: entryKnown.length,
            triggered_count: entryKnown.filter(
              (outcome) => outcome.entry_triggered === true,
            ).length,
            not_triggered_count: entryKnown.filter(
              (outcome) => outcome.entry_triggered === false,
            ).length,
            unknown_count: primaryOutcomes.length - entryKnown.length,
            triggered_rate:
              entryKnown.length === 0
                ? null
                : entryKnown.filter((outcome) => outcome.entry_triggered === true)
                    .length / entryKnown.length,
          },
          terminal: {
            target_first_count: enteredOutcomes.filter(
              (outcome) => outcome.first_terminal_event === "target_hit",
            ).length,
            stop_first_count: enteredOutcomes.filter(
              (outcome) => outcome.first_terminal_event === "stop_hit",
            ).length,
            neither_count: enteredOutcomes.filter(
              (outcome) => outcome.first_terminal_event === "neither",
            ).length,
            unknown_count: enteredOutcomes.filter(
              (outcome) => outcome.first_terminal_event === "unknown",
            ).length,
          },
          horizon_r: numericSummary(
            enteredOutcomes.map((outcome) => outcome.current_r),
          ),
          excursion: {
            contract_version:
              RECOMMENDATION_OUTCOME_ENTRY_BOUND_EXCURSION_CONTRACT_VERSION,
            status: "entry_bound_excursion_measured_with_explicit_missingness",
            triggered_outcome_count: enteredOutcomes.length,
            contract_missing_count: entryBoundExcursions.filter(
              (excursion) => excursion === null,
            ).length,
            mfe_r: numericSummary(
              measuredMfe.map((excursion) => excursion!.mfe_r.r),
            ),
            mae_r: numericSummary(
              measuredMae.map((excursion) => excursion!.mae_r.r),
            ),
            paired_mfe_mae_count: pairedExcursions.length,
            mfe_missing_count: enteredOutcomes.length - measuredMfe.length,
            mae_missing_count: enteredOutcomes.length - measuredMae.length,
          },
        }
      : null,
    blockers: sorted([
      ...segment.readiness.blockers,
      ...blockers,
    ]),
    notes: [
      "Read-only evaluation plan: it neither persists a freeze nor changes ranking, confidence, publication, provider usage, or execution.",
      "Each metric uses at most one complete, decision-bound canonical primary outcome per exact candidate snapshot; visible, research, rejected, and no-trade evidence remain distinct.",
      "A metric excludes a snapshot whose decision-time input provenance is incomplete, including absent source/provider/version/adapter/build metadata or a source timestamp after the decision.",
      "Horizon R uses current_r only after an observed entry trigger. MFE/MAE use only the versioned entry-bound receipt, which excludes the entry-trigger candle and refuses an intrabar-ambiguous terminal candle; legacy best_r and worst_r remain excluded.",
      "Confidence is ordinal and excluded from calibration. An explicit durable freeze and held-out comparison remain required before IF-5 can consider a policy change.",
    ],
  };
}

/**
 * Builds the fixed, point-in-time metric plan that an explicit future freeze
 * would need. It does not choose a segment, persist a baseline, or promote a
 * policy: mixed policy/version populations remain separate.
 */
export function buildRecommendationLearningEvaluationPlans({
  segmentation,
  scanRuns,
  snapshots,
  outcomes,
}: {
  segmentation: RecommendationLearningBaselineSegmentation;
  scanRuns: LearningBaselineScanRun[];
  snapshots: RecommendationSnapshot[];
  outcomes: RecommendationOutcome[];
}): RecommendationLearningEvaluationPlans {
  const plans = segmentation.segments.map((segment) =>
    evaluationPlanForSegment({ segment, scanRuns, snapshots, outcomes }),
  );
  const readyPlanCount = plans.filter(
    (plan) => plan.status === "ready_for_explicit_freeze",
  ).length;

  return {
    contract_version: RECOMMENDATION_LEARNING_EVALUATION_PLAN_VERSION,
    status:
      plans.length === 0
        ? "no_comparable_segments"
        : readyPlanCount > 0
          ? "eligible_segments_require_explicit_freeze"
          : "no_freeze_eligible_segments",
    plans,
  };
}
