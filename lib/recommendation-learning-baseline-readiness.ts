import {
  candidateDecisionRecordFromScanRun,
} from "@/lib/candidate-decision-readback";
import type { CandidateDecisionRecord } from "@/lib/candidate-decision-record";
import {
  projectRecommendationOutcomeBundle,
} from "@/lib/canonical-evaluation-projection-adapters";
import type { RecommendationOutcome } from "@/lib/recommendation-outcome-tracker";
import type { RecommendationScanRun } from "@/lib/recommendation-scan-run";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";
import {
  hasCanonicalOutcomeProviderCoverageWithEvaluationAnchor,
} from "@/lib/recommendation-outcome-canonical-coverage";
import { recommendationOutcomeEvaluationAnchorFromSnapshot } from "@/lib/recommendation-outcome-evaluation-anchor";
import {
  RESEARCH_SNAPSHOT_CANDIDATE_DECISION_LINKAGE_VERSION,
  isSupportedResearchSnapshotCandidateDecisionLinkageVersion,
  type ResearchSnapshotCandidateDecisionDisposition,
} from "@/lib/research-snapshot-candidate-linkage";
import {
  RECOMMENDATION_DECISION_SOURCE_PROVENANCE_VERSION,
  recommendationDecisionSourceProvenanceBlockers,
  recommendationDecisionSourceProvenanceFromSnapshot,
  type RecommendationDecisionSourceProvenance,
  type RecommendationDecisionSourceProvenanceBlocker,
} from "@/lib/recommendation-decision-source-provenance";
import {
  buildRecommendationIntakeQualityProvenance,
  type RecommendationIntakeQualityProvenance,
} from "@/lib/recommendation-intake-quality-provenance";

export const RECOMMENDATION_LEARNING_BASELINE_READINESS_VERSION =
  "recommendation_learning_baseline_readiness_v2" as const;
export const MIN_VISIBLE_PRIMARY_OUTCOMES_BEFORE_BASELINE_FREEZE = 20;

export type LearningBaselineScanRun = Pick<
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
  decision_time_source_provenance: {
    contract_version: typeof RECOMMENDATION_DECISION_SOURCE_PROVENANCE_VERSION;
    assessed_snapshot_count: number;
    admissible_snapshot_count: number;
    incomplete_snapshot_count: number;
    intraday_indicator_response_identity_count: number;
    decision_feature_vector_count: number;
    blocker_counts: Record<RecommendationDecisionSourceProvenanceBlocker, number>;
  };
  intake_quality_provenance: RecommendationIntakeQualityProvenance;
  counterfactual_coverage: {
    research_candidate_outcomes_required: number;
    research_candidate_outcomes_collected: number;
    rejected_candidate_outcomes_required: number;
    rejected_candidate_outcomes_collected: number;
    no_trade_outcomes_required: number;
    no_trade_outcomes_collected: number;
    status: "not_required" | "not_collected" | "partial" | "complete";
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

function textOrNull(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
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

type CandidateDecisionRecordCandidate =
  CandidateDecisionRecord["candidates"][number];

function isCounterfactualCandidate(
  candidate: CandidateDecisionRecordCandidate,
): candidate is CandidateDecisionRecordCandidate & {
  disposition: ResearchSnapshotCandidateDecisionDisposition;
} {
  return (
    candidate.disposition === "selected_not_published" ||
    candidate.disposition === "ranked_not_selected" ||
    candidate.disposition === "filtered_before_ranking"
  );
}

function isResearchCandidate(
  candidate: CandidateDecisionRecordCandidate,
): candidate is CandidateDecisionRecordCandidate & {
  disposition: "selected_not_published" | "ranked_not_selected";
} {
  return (
    candidate.disposition === "selected_not_published" ||
    candidate.disposition === "ranked_not_selected"
  );
}

function researchSnapshotForCandidate({
  candidateId,
  candidateDisposition,
  scanRunFingerprint,
  ticker,
  snapshots,
}: {
  candidateId: string;
  candidateDisposition: ResearchSnapshotCandidateDecisionDisposition;
  scanRunFingerprint: string;
  ticker: string;
  snapshots: RecommendationSnapshot[];
}) {
  const matches = snapshots.filter((snapshot) => {
    const payload = snapshot.payload_json;

    return (
      isResearchOnlySnapshot(snapshot) &&
      snapshot.scan_run_id === scanRunFingerprint &&
      normalizeTicker(snapshot.ticker) === normalizeTicker(ticker) &&
      textOrNull(payload.candidate_id) === candidateId &&
      textOrNull(payload.candidate_decision_id) === candidateId &&
      payload.candidate_decision_disposition === candidateDisposition &&
      isSupportedResearchSnapshotCandidateDecisionLinkageVersion(
        payload.candidate_decision_linkage_version,
      ) &&
      (candidateDisposition !== "filtered_before_ranking" ||
        payload.candidate_decision_linkage_version ===
          RESEARCH_SNAPSHOT_CANDIDATE_DECISION_LINKAGE_VERSION) &&
      payload.candidate_decision_linkage_status === "verified"
    );
  });

  return matches.length === 1 ? matches[0] : null;
}

function exactLinkedOutcomes({
  snapshot,
  outcomes,
}: {
  snapshot: RecommendationSnapshot;
  outcomes: RecommendationOutcome[];
}) {
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
  const linked = sameFingerprint.filter(
    (outcome) =>
      (outcome.snapshot_id === null || outcome.snapshot_id === snapshot.id) &&
      (outcome.recommendation_id === null ||
        snapshot.recommendation_id === null ||
        outcome.recommendation_id === snapshot.recommendation_id),
  );

  return { hasRelationConflict, linked };
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
  let researchCandidateOutcomesCollected = 0;
  let rejectedCandidateOutcomesCollected = 0;
  let noTradeOutcomesCollected = 0;
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
  const sourceProvenanceBySnapshotId = new Map<
    string,
    RecommendationDecisionSourceProvenance
  >();
  const assessedSnapshotsById = new Map<string, RecommendationSnapshot>();
  const sourceProvenanceBlockerCounts = Object.fromEntries(
    recommendationDecisionSourceProvenanceBlockers.map((blocker) => [blocker, 0]),
  ) as Record<RecommendationDecisionSourceProvenanceBlocker, number>;

  function sourceProvenanceForSnapshot(snapshot: RecommendationSnapshot) {
    const existing = sourceProvenanceBySnapshotId.get(snapshot.id);
    if (existing) return existing;

    assessedSnapshotsById.set(snapshot.id, snapshot);
    const provenance = recommendationDecisionSourceProvenanceFromSnapshot(snapshot);
    sourceProvenanceBySnapshotId.set(snapshot.id, provenance);
    for (const blocker of provenance.blockers) {
      sourceProvenanceBlockerCounts[blocker] += 1;
    }
    return provenance;
  }

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
      const sourceProvenance = sourceProvenanceForSnapshot(snapshot);
      if (sourceProvenance.status !== "admissible") {
        incompleteOrConflictingOutcomeCount += 1;
        blockers.add("published_candidate_decision_source_provenance_incomplete");
        continue;
      }
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
      const selectedOutcome = primary
        ? linkedOutcomes.find(
            (outcome) => outcome.id === primary.primary_outcome?.outcome.id,
          ) ?? null
        : null;
      const evaluationAnchor = recommendationOutcomeEvaluationAnchorFromSnapshot(
        snapshot,
      );

      if (
        primary?.status === "selected" &&
        primary.primary_horizon &&
        hasCanonicalOutcomeProviderCoverageWithEvaluationAnchor(
          selectedOutcome?.payload_json.canonical_provider_coverage,
          evaluationAnchor,
        )
      ) {
        primaryOutcomeCount += 1;
        primaryOutcomeByHorizon[primary.primary_horizon] += 1;
      } else {
        incompleteOrConflictingOutcomeCount += 1;
        blockers.add(
          primary?.status === "selected"
            ? evaluationAnchor
              ? "published_candidate_primary_outcome_coverage_receipt_missing_or_unversioned_or_unanchored"
              : "published_candidate_primary_outcome_evaluation_anchor_missing_or_invalid"
            : "published_candidate_primary_outcome_incomplete_or_conflicting",
        );
      }
    }

    const researchCandidates = record.candidates.filter(isResearchCandidate);
    const counterfactualCandidates = record.candidates.filter(
      isCounterfactualCandidate,
    );
    const researchCandidatesWithCompleteOutcomes = new Set<string>();

    for (const candidate of counterfactualCandidates) {

      const snapshot = researchSnapshotForCandidate({
        candidateId: candidate.candidate_id,
        candidateDisposition: candidate.disposition,
        scanRunFingerprint: record.scan_run_fingerprint,
        ticker: candidate.ticker,
        snapshots,
      });
      if (!snapshot) continue;

      const sourceProvenance = sourceProvenanceForSnapshot(snapshot);
      if (sourceProvenance.status !== "admissible") {
        blockers.add("counterfactual_candidate_decision_source_provenance_incomplete");
        continue;
      }

      const { hasRelationConflict, linked } = exactLinkedOutcomes({
        snapshot,
        outcomes,
      });
      if (
        hasRelationConflict ||
        linked.some(
          (outcome) => !isAfterOrEqual(outcome.evaluated_at, record.decision_timestamp),
        )
      ) {
        continue;
      }

      const projection = projectRecommendationOutcomeBundle({
        snapshot,
        outcomes: linked,
        metadata: {
          producer_decision_id: candidate.candidate_id,
          decision_timestamp: record.decision_timestamp,
          sample_type: "research_only",
          numeric_confidence: null,
          confidence_label: null,
          versions: attribution.canonical_evaluation_versions,
          candidate_id: candidate.candidate_id,
          scan_run_id: record.scan_run_id,
          scan_run_fingerprint: record.scan_run_fingerprint,
        },
      });
      const primary = projection.projection.primary_outcome;
      const selectedOutcome = primary
        ? linked.find(
            (outcome) => outcome.id === primary.primary_outcome?.outcome.id,
          ) ?? null
        : null;
      const evaluationAnchor = recommendationOutcomeEvaluationAnchorFromSnapshot(
        snapshot,
      );

      if (
        primary?.status === "selected" &&
        hasCanonicalOutcomeProviderCoverageWithEvaluationAnchor(
          selectedOutcome?.payload_json.canonical_provider_coverage,
          evaluationAnchor,
        )
      ) {
        if (candidate.disposition === "filtered_before_ranking") {
          rejectedCandidateOutcomesCollected += 1;
        } else {
          researchCandidateOutcomesCollected += 1;
          researchCandidatesWithCompleteOutcomes.add(candidate.candidate_id);
        }
      }
    }

    // A no-trade decision is a decision-level counterfactual, not another
    // candidate outcome. It becomes covered only when every non-published
    // ranked candidate that could have been a trade is covered exactly once.
    // Rejected candidates remain their own missing-evidence cohort and prevent
    // the overall baseline from becoming ready.
    if (
      record.final_decision.disposition === "no_trade" &&
      fullPopulation &&
      researchCandidates.length > 0 &&
      researchCandidates.every((candidate) =>
        researchCandidatesWithCompleteOutcomes.has(candidate.candidate_id),
      )
    ) {
      noTradeOutcomesCollected += 1;
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
  if (researchCandidateOutcomesCollected < researchCandidateCount) {
    blockers.add("research_candidate_counterfactual_outcomes_incomplete");
  }
  if (rejectedCandidateOutcomesCollected < rejectedCandidateCount) {
    blockers.add("rejected_candidate_counterfactual_outcomes_not_collected");
  }
  if (noTradeOutcomesCollected < explicitNoTradeCount) {
    blockers.add("explicit_no_trade_counterfactual_outcomes_not_collected");
  }

  const counterfactualOutcomesRequired =
    researchCandidateCount + rejectedCandidateCount + explicitNoTradeCount;
  const counterfactualOutcomesCollected =
    researchCandidateOutcomesCollected +
    rejectedCandidateOutcomesCollected +
    noTradeOutcomesCollected;
  const counterfactualCoverageStatus =
    counterfactualOutcomesRequired === 0
      ? "not_required"
      : counterfactualOutcomesCollected === 0
        ? "not_collected"
        : counterfactualOutcomesCollected === counterfactualOutcomesRequired
          ? "complete"
          : "partial";
  const intakeQualityProvenance = buildRecommendationIntakeQualityProvenance(
    Array.from(assessedSnapshotsById.values()),
  );
  if (intakeQualityProvenance.status === "unavailable") {
    blockers.add("outcome_sample_intake_quality_unavailable");
  } else if (intakeQualityProvenance.status === "not_recorded") {
    blockers.add("outcome_sample_intake_quality_not_recorded");
  } else if (intakeQualityProvenance.status === "incomplete") {
    blockers.add("outcome_sample_intake_quality_incomplete");
  } else if (intakeQualityProvenance.status === "mixed") {
    blockers.add("multiple_intake_quality_result_versions_require_segmented_baseline");
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
    decision_time_source_provenance: {
      contract_version: RECOMMENDATION_DECISION_SOURCE_PROVENANCE_VERSION,
      assessed_snapshot_count: sourceProvenanceBySnapshotId.size,
      admissible_snapshot_count: Array.from(
        sourceProvenanceBySnapshotId.values(),
      ).filter((provenance) => provenance.status === "admissible").length,
      incomplete_snapshot_count: Array.from(
        sourceProvenanceBySnapshotId.values(),
      ).filter((provenance) => provenance.status === "incomplete").length,
      intraday_indicator_response_identity_count: Array.from(
        sourceProvenanceBySnapshotId.values(),
      ).filter(
        (provenance) =>
          provenance.intraday_indicator_response_identity !== null,
      ).length,
      decision_feature_vector_count: Array.from(
        sourceProvenanceBySnapshotId.values(),
      ).filter((provenance) => provenance.decision_feature_vector !== null)
        .length,
      blocker_counts: sourceProvenanceBlockerCounts,
    },
    intake_quality_provenance: intakeQualityProvenance,
    counterfactual_coverage: {
      research_candidate_outcomes_required: researchCandidateCount,
      research_candidate_outcomes_collected: researchCandidateOutcomesCollected,
      rejected_candidate_outcomes_required: rejectedCandidateCount,
      rejected_candidate_outcomes_collected: rejectedCandidateOutcomesCollected,
      no_trade_outcomes_required: explicitNoTradeCount,
      no_trade_outcomes_collected: noTradeOutcomesCollected,
      status: counterfactualCoverageStatus,
    },
    confidence_calibration: {
      status: "blocked_ordinal_confidence",
      numeric_probability_sample_count: 0,
    },
    blockers: sorted(blockers),
    notes: [
      "Read-only readiness audit: it does not change scoring, ranking, publication, provider usage, or execution.",
      "Visible outcomes use one complete 60m/30m/15m primary horizon per exactly linked published candidate; duplicates and incomplete coverage fail closed.",
      "A linked snapshot is inadmissible when its decision-time input lineage is missing, invalid, after the decision, or lacks an intraday response fingerprint, a bounded decision feature vector, provider version, Ture adapter version, or source build marker. The fingerprint is a privacy-preserving response identity, not an upstream API-version claim; the vector records finite observed features or explicit unavailable inputs, never raw candles. Ture preserves those rows as an evidence gap rather than allowing them into a baseline.",
      "Every snapshot actually assessed for a baseline must carry a valid intake-quality receipt from one result version. Missing, malformed or mixed receipt versions remain an explicit evidence gap; receipt status and grade are retained for later analysis but do not alter publication or select a winning policy.",
      "Research-only outcomes count only when an immutable candidate ID, research-only snapshot, decision-bound anchor and complete provider-coverage receipt agree exactly. A no-trade decision counts only when its full ranked research population has that evidence. A filtered candidate can count only through the v2 exact link to its already-recorded fresh scanner plan; missing, stale or invented plans remain a separate evidence gap.",
      "Current confidence remains ordinal rather than a calibrated probability, so this audit cannot support confidence calibration.",
    ],
  };
}
