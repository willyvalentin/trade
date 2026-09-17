import {
  candidateDecisionRecordFromScanRun,
} from "@/lib/candidate-decision-readback";
import {
  projectRecommendationOutcomeBundle,
} from "@/lib/canonical-evaluation-projection-adapters";
import type { RecommendationOutcome } from "@/lib/recommendation-outcome-tracker";
import type { RecommendationScanRun } from "@/lib/recommendation-scan-run";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";

export const RECOMMENDATION_LEARNING_BASELINE_READINESS_VERSION =
  "recommendation_learning_baseline_readiness_v1" as const;
export const MIN_VISIBLE_PRIMARY_OUTCOMES_BEFORE_BASELINE_FREEZE = 20;

type LearningBaselineScanRun = Pick<
  RecommendationScanRun,
  | "id"
  | "run_fingerprint"
  | "trading_date"
  | "window"
  | "observed_at"
  | "payload_json"
>;

export type RecommendationLearningBaselineReadiness = {
  contract_version: typeof RECOMMENDATION_LEARNING_BASELINE_READINESS_VERSION;
  status: "not_ready" | "eligible_for_explicit_freeze";
  decision_records: {
    considered_count: number;
    attributable_count: number;
    integrity_excluded_count: number;
    complete_population_count: number;
    incomplete_population_count: number;
  };
  decision_population: {
    published_candidate_count: number;
    research_candidate_count: number;
    rejected_candidate_count: number;
    not_evaluated_candidate_count: number;
    explicit_no_trade_count: number;
  };
  visible_outcomes: {
    published_candidate_count: number;
    exact_snapshot_link_count: number;
    missing_snapshot_link_count: number;
    ambiguous_snapshot_link_count: number;
    pre_decision_outcome_count: number;
    primary_outcome_count: number;
    primary_outcome_by_horizon: Record<"15m" | "30m" | "60m", number>;
    incomplete_or_conflicting_outcome_count: number;
    minimum_required_before_freeze: number;
  };
  policy_attribution: {
    complete_record_count: number;
    incomplete_record_count: number;
    distinct_version_bundle_count: number;
    distinct_publish_policy_count: number;
    status: "complete" | "incomplete" | "mixed" | "unavailable";
  };
  counterfactual_coverage: {
    research_candidate_outcomes_collected: number;
    rejected_candidate_outcomes_collected: number;
    no_trade_outcomes_collected: number;
    status: "not_collected";
  };
  confidence_calibration: {
    status: "blocked_ordinal_confidence";
    numeric_probability_sample_count: 0;
  };
  blockers: string[];
  notes: string[];
};

function normalizeTicker(value: string | null | undefined) {
  return value?.trim().toUpperCase() ?? "";
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

function versionBundleKey(versions: Record<string, string> | null) {
  return versions
    ? [
        versions.engine_version,
        versions.scoring_version,
        versions.ranking_version,
        versions.setup_taxonomy_version,
        versions.confidence_contract_version,
        versions.evaluator_version,
        versions.provider_contract_version,
        versions.git_commit,
        versions.build_identity,
      ].join("|")
    : null;
}

function sorted(values: Iterable<string>) {
  return Array.from(new Set(values)).sort();
}

/**
 * Audits only persisted, owner-isolated scan records and visible-recommendation
 * outcome rows supplied by the caller. It neither computes prices nor changes
 * scoring, publication, policy, provider usage, or execution.
 */
export function buildRecommendationLearningBaselineReadiness({
  scanRuns,
  snapshots,
  outcomes,
}: {
  scanRuns: LearningBaselineScanRun[];
  snapshots: RecommendationSnapshot[];
  outcomes: RecommendationOutcome[];
}): RecommendationLearningBaselineReadiness {
  let attributableCount = 0;
  let integrityExcludedCount = 0;
  let completePopulationCount = 0;
  let incompletePopulationCount = 0;
  let publishedCandidateCount = 0;
  let researchCandidateCount = 0;
  let rejectedCandidateCount = 0;
  let notEvaluatedCandidateCount = 0;
  let explicitNoTradeCount = 0;
  let completeAttributionCount = 0;
  let incompleteAttributionCount = 0;
  let exactSnapshotLinkCount = 0;
  let missingSnapshotLinkCount = 0;
  let ambiguousSnapshotLinkCount = 0;
  let preDecisionOutcomeCount = 0;
  let primaryOutcomeCount = 0;
  let incompleteOrConflictingOutcomeCount = 0;
  const primaryOutcomeByHorizon = { "15m": 0, "30m": 0, "60m": 0 };
  const versionBundleKeys = new Set<string>();
  const publishPolicyVersions = new Set<string>();
  const blockers = new Set<string>();

  for (const scanRun of scanRuns) {
    const record = candidateDecisionRecordFromScanRun(scanRun);

    if (!record) {
      integrityExcludedCount += 1;
      blockers.add("candidate_decision_record_missing_or_identity_invalid");
      continue;
    }

    attributableCount += 1;
    const fullPopulation =
      record.coverage.full_membership_captured &&
      record.candidates.every((candidate) => candidate.disposition !== "not_evaluated");
    if (fullPopulation) {
      completePopulationCount += 1;
    } else {
      incompletePopulationCount += 1;
      blockers.add("candidate_population_incomplete");
    }

    for (const candidate of record.candidates) {
      switch (candidate.disposition) {
        case "published":
          publishedCandidateCount += 1;
          break;
        case "selected_not_published":
        case "ranked_not_selected":
          researchCandidateCount += 1;
          break;
        case "filtered_before_ranking":
          rejectedCandidateCount += 1;
          break;
        case "not_evaluated":
          notEvaluatedCandidateCount += 1;
          break;
      }
    }

    if (record.final_decision.disposition === "no_trade") {
      explicitNoTradeCount += 1;
    }

    const attribution = record.learning_attribution;
    if (attribution.attribution_status === "complete") {
      completeAttributionCount += 1;
      publishPolicyVersions.add(attribution.recommendation_publish_policy_version);
      const bundleKey = versionBundleKey(attribution.canonical_evaluation_versions);
      if (bundleKey) versionBundleKeys.add(bundleKey);
    } else {
      incompleteAttributionCount += 1;
      blockers.add("canonical_policy_attribution_incomplete");
    }

    for (const candidate of record.candidates) {
      if (candidate.disposition !== "published") continue;

      const linkedSnapshots = snapshots.filter(
        (snapshot) =>
          snapshot.scan_run_id === record.scan_run_fingerprint &&
          normalizeTicker(snapshot.ticker) === normalizeTicker(candidate.ticker),
      );
      if (linkedSnapshots.length === 0) {
        missingSnapshotLinkCount += 1;
        blockers.add("published_candidate_missing_exact_snapshot_link");
        continue;
      }
      if (linkedSnapshots.length !== 1) {
        ambiguousSnapshotLinkCount += 1;
        blockers.add("published_candidate_ambiguous_snapshot_link");
        continue;
      }

      const snapshot = linkedSnapshots[0];
      const outcomesWithSameFingerprint = outcomes.filter(
        (outcome) => outcome.snapshot_fingerprint === snapshot.snapshot_fingerprint,
      );
      const hasOutcomeRelationConflict = outcomesWithSameFingerprint.some(
        (outcome) =>
          (outcome.snapshot_id !== null && outcome.snapshot_id !== snapshot.id) ||
          (outcome.recommendation_id !== null &&
            snapshot.recommendation_id !== null &&
            outcome.recommendation_id !== snapshot.recommendation_id),
      );
      const linkedOutcomes = outcomesWithSameFingerprint.filter(
        (outcome) =>
          (outcome.snapshot_id === null || outcome.snapshot_id === snapshot.id) &&
          (outcome.recommendation_id === null ||
            snapshot.recommendation_id === null ||
            outcome.recommendation_id === snapshot.recommendation_id),
      );
      const hasPreDecisionOutcome = linkedOutcomes.some(
        (outcome) => !isAfterOrEqual(outcome.evaluated_at, record.decision_timestamp),
      );
      if (hasPreDecisionOutcome) {
        preDecisionOutcomeCount += 1;
        blockers.add("outcome_precedes_candidate_decision");
        continue;
      }

      exactSnapshotLinkCount += 1;
      if (hasOutcomeRelationConflict) {
        incompleteOrConflictingOutcomeCount += 1;
        blockers.add("outcome_snapshot_or_recommendation_relation_conflict");
        continue;
      }
      const projection = projectRecommendationOutcomeBundle({
        snapshot,
        outcomes: linkedOutcomes,
        metadata: {
          producer_decision_id: candidate.candidate_id,
          decision_timestamp: record.decision_timestamp,
          sample_type: "visible",
          numeric_confidence: null,
          confidence_label: null,
          versions: attribution.canonical_evaluation_versions,
          candidate_id: candidate.candidate_id,
          scan_run_id: record.scan_run_id,
          scan_run_fingerprint: record.scan_run_fingerprint,
        },
      });
      const primary = projection.projection.primary_outcome;

      if (primary?.status === "selected" && primary.primary_horizon) {
        primaryOutcomeCount += 1;
        primaryOutcomeByHorizon[primary.primary_horizon] += 1;
      } else {
        incompleteOrConflictingOutcomeCount += 1;
        blockers.add("published_candidate_primary_outcome_incomplete_or_conflicting");
      }
    }
  }

  const policyAttributionStatus =
    attributableCount === 0
      ? "unavailable"
      : incompleteAttributionCount > 0
        ? "incomplete"
        : versionBundleKeys.size > 1 || publishPolicyVersions.size > 1
          ? "mixed"
          : "complete";
  if (policyAttributionStatus === "mixed") {
    blockers.add("multiple_policy_or_version_bundles_require_segmented_baseline");
  }
  if (primaryOutcomeCount < MIN_VISIBLE_PRIMARY_OUTCOMES_BEFORE_BASELINE_FREEZE) {
    blockers.add("insufficient_visible_primary_outcomes_for_baseline_freeze");
  }
  if (researchCandidateCount > 0 || rejectedCandidateCount > 0 || explicitNoTradeCount > 0) {
    blockers.add("research_rejected_and_no_trade_counterfactuals_not_collected");
  }

  const status =
    blockers.size === 0 &&
    primaryOutcomeCount >= MIN_VISIBLE_PRIMARY_OUTCOMES_BEFORE_BASELINE_FREEZE
      ? "eligible_for_explicit_freeze"
      : "not_ready";

  return {
    contract_version: RECOMMENDATION_LEARNING_BASELINE_READINESS_VERSION,
    status,
    decision_records: {
      considered_count: scanRuns.length,
      attributable_count: attributableCount,
      integrity_excluded_count: integrityExcludedCount,
      complete_population_count: completePopulationCount,
      incomplete_population_count: incompletePopulationCount,
    },
    decision_population: {
      published_candidate_count: publishedCandidateCount,
      research_candidate_count: researchCandidateCount,
      rejected_candidate_count: rejectedCandidateCount,
      not_evaluated_candidate_count: notEvaluatedCandidateCount,
      explicit_no_trade_count: explicitNoTradeCount,
    },
    visible_outcomes: {
      published_candidate_count: publishedCandidateCount,
      exact_snapshot_link_count: exactSnapshotLinkCount,
      missing_snapshot_link_count: missingSnapshotLinkCount,
      ambiguous_snapshot_link_count: ambiguousSnapshotLinkCount,
      pre_decision_outcome_count: preDecisionOutcomeCount,
      primary_outcome_count: primaryOutcomeCount,
      primary_outcome_by_horizon: primaryOutcomeByHorizon,
      incomplete_or_conflicting_outcome_count: incompleteOrConflictingOutcomeCount,
      minimum_required_before_freeze: MIN_VISIBLE_PRIMARY_OUTCOMES_BEFORE_BASELINE_FREEZE,
    },
    policy_attribution: {
      complete_record_count: completeAttributionCount,
      incomplete_record_count: incompleteAttributionCount,
      distinct_version_bundle_count: versionBundleKeys.size,
      distinct_publish_policy_count: publishPolicyVersions.size,
      status: policyAttributionStatus,
    },
    counterfactual_coverage: {
      research_candidate_outcomes_collected: 0,
      rejected_candidate_outcomes_collected: 0,
      no_trade_outcomes_collected: 0,
      status: "not_collected",
    },
    confidence_calibration: {
      status: "blocked_ordinal_confidence",
      numeric_probability_sample_count: 0,
    },
    blockers: sorted(blockers),
    notes: [
      "Read-only readiness audit: it does not change scoring, ranking, publication, provider usage, or execution.",
      "Visible outcomes use one complete 60m/30m/15m primary horizon per exactly linked published candidate; duplicates and incomplete coverage fail closed.",
      "Current confidence remains ordinal rather than a calibrated probability, so this audit cannot support confidence calibration.",
    ],
  };
}
