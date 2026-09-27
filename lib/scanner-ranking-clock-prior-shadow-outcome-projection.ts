import { candidateDecisionRecordFromScanRun } from "@/lib/candidate-decision-readback";
import {
  projectRecommendationOutcomeBundle,
  type CanonicalProjectedOutcome,
} from "@/lib/canonical-evaluation-projection-adapters";
import {
  MIN_VISIBLE_PRIMARY_OUTCOMES_BEFORE_BASELINE_FREEZE,
  type LearningBaselineScanRun,
} from "@/lib/recommendation-learning-baseline-readiness";
import { hasCanonicalOutcomeProviderCoverageWithEvaluationAnchor } from "@/lib/recommendation-outcome-canonical-coverage";
import { recommendationOutcomeEvaluationAnchorFromSnapshot } from "@/lib/recommendation-outcome-evaluation-anchor";
import type { RecommendationOutcome } from "@/lib/recommendation-outcome-tracker";
import { recommendationDecisionSourceProvenanceFromSnapshot } from "@/lib/recommendation-decision-source-provenance";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";
import {
  scannerClockPriorShadowAttributionFromUnknown,
  type ScannerClockPriorShadowAttribution,
} from "@/lib/scanner-ranking-clock-prior-shadow-attribution";

export const SCANNER_CLOCK_PRIOR_SHADOW_OUTCOME_PROJECTION_VERSION =
  "scanner_clock_prior_shadow_outcome_projection_v1" as const;

type ProjectionArm = {
  selected_candidate_count: number;
  complete_primary_outcome_count: number;
  entry_known_count: number;
  entry_triggered_count: number;
  entry_triggered_rate: number | null;
  target_first_count: number;
  stop_first_count: number;
  neither_count: number;
  unknown_terminal_count: number;
  current_r_observed_count: number;
  mean_current_r: number | null;
  median_current_r: number | null;
};

export type ScannerClockPriorShadowOutcomeProjection = {
  contract_version:
    typeof SCANNER_CLOCK_PRIOR_SHADOW_OUTCOME_PROJECTION_VERSION;
  status: "no_attribution" | "coverage_incomplete" | "conflicting" | "comparable";
  policy_pair: {
    baseline_policy_versions: string[];
    shadow_policy_versions: string[];
  };
  coverage: {
    scan_runs_considered: number;
    attribution_receipts_found: number;
    attributed_scan_runs: number;
    conflicting_or_malformed_scan_runs: number;
    selected_union_candidate_count: number;
    exact_snapshot_link_count: number;
    complete_primary_outcome_count: number;
    incomplete_candidate_count: number;
    conflicting_candidate_count: number;
    minimum_complete_outcomes_before_quality_review: number;
  };
  baseline: ProjectionArm;
  shadow: ProjectionArm;
  observed_deltas: {
    entry_triggered_rate: number | null;
    mean_current_r: number | null;
    target_minus_stop_rate: number | null;
  };
  promotion_readiness: "blocked_insufficient_evidence" | "requires_held_out_review";
  quality_improvement_claimed: false;
  live_ranking_effect: false;
  publication_effect: false;
  execution_effect: false;
  outcome_join_basis: "candidate_decision_id";
  reason_codes: string[];
};

type CandidateOutcomeEvidence = {
  attribution: ScannerClockPriorShadowAttribution["candidates"][number];
  outcome: CanonicalProjectedOutcome;
};

function normalizedTicker(value: string | null | undefined) {
  return value?.trim().toUpperCase() ?? "";
}

function textOrNull(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function uniqueSorted(values: Iterable<string>) {
  return Array.from(new Set(values)).sort();
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

function numericSummary(values: Array<number | null>) {
  const observed = values.filter(
    (value): value is number => typeof value === "number" && Number.isFinite(value),
  );
  const ordered = [...observed].sort((left, right) => left - right);
  const midpoint = Math.floor(ordered.length / 2);
  return {
    count: observed.length,
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
  };
}

function arm(
  selectedCandidates: ScannerClockPriorShadowAttribution["candidates"],
  evidenceByCandidateId: Map<string, CandidateOutcomeEvidence>,
): ProjectionArm {
  const outcomes = selectedCandidates.flatMap((candidate) => {
    const evidence = evidenceByCandidateId.get(candidate.candidate_id);
    return evidence ? [evidence.outcome] : [];
  });
  const entryKnown = outcomes.filter(
    (outcome) => typeof outcome.entry_triggered === "boolean",
  );
  const entered = outcomes.filter((outcome) => outcome.entry_triggered === true);
  const currentR = numericSummary(entered.map((outcome) => outcome.current_r));

  return {
    selected_candidate_count: selectedCandidates.length,
    complete_primary_outcome_count: outcomes.length,
    entry_known_count: entryKnown.length,
    entry_triggered_count: entryKnown.filter(
      (outcome) => outcome.entry_triggered === true,
    ).length,
    entry_triggered_rate:
      entryKnown.length === 0
        ? null
        : entryKnown.filter((outcome) => outcome.entry_triggered === true).length /
          entryKnown.length,
    target_first_count: entered.filter(
      (outcome) => outcome.first_terminal_event === "target_hit",
    ).length,
    stop_first_count: entered.filter(
      (outcome) => outcome.first_terminal_event === "stop_hit",
    ).length,
    neither_count: entered.filter(
      (outcome) => outcome.first_terminal_event === "neither",
    ).length,
    unknown_terminal_count: entered.filter(
      (outcome) => outcome.first_terminal_event === "unknown",
    ).length,
    current_r_observed_count: currentR.count,
    mean_current_r: currentR.mean,
    median_current_r: currentR.median,
  };
}

function targetMinusStopRate(value: ProjectionArm) {
  const known = value.target_first_count + value.stop_first_count;
  return known === 0
    ? null
    : (value.target_first_count - value.stop_first_count) / known;
}

function difference(left: number | null, right: number | null) {
  return left === null || right === null ? null : right - left;
}

/**
 * Compares the persisted baseline and shadow selections against exact,
 * candidate-decision-bound canonical outcomes. Missing evidence remains a
 * coverage gap and conflicting lineage fails closed. This projection is
 * descriptive only and cannot promote a ranking policy.
 */
export function buildScannerClockPriorShadowOutcomeProjection({
  scanRuns,
  snapshots,
  outcomes,
}: {
  scanRuns: LearningBaselineScanRun[];
  snapshots: RecommendationSnapshot[];
  outcomes: RecommendationOutcome[];
}): ScannerClockPriorShadowOutcomeProjection {
  const reasonCodes = new Set<string>();
  const validAttributions: ScannerClockPriorShadowAttribution[] = [];
  const evidenceByCandidateId = new Map<string, CandidateOutcomeEvidence>();
  let receiptsFound = 0;
  let conflictingOrMalformedRuns = 0;
  let exactSnapshotLinkCount = 0;
  let incompleteCandidateCount = 0;
  let conflictingCandidateCount = 0;

  for (const scanRun of scanRuns) {
    const rawAttribution =
      scanRun.payload_json.scanner_clock_prior_shadow_attribution;
    if (rawAttribution === null || rawAttribution === undefined) continue;
    receiptsFound += 1;

    const attribution =
      scannerClockPriorShadowAttributionFromUnknown(rawAttribution);
    const decisionRecord = candidateDecisionRecordFromScanRun(scanRun);
    if (
      !attribution ||
      attribution.status !== "attributed" ||
      !decisionRecord ||
      attribution.scan_run_id !== decisionRecord.scan_run_id ||
      attribution.scan_run_fingerprint !== decisionRecord.scan_run_fingerprint ||
      attribution.scan_run_fingerprint !== scanRun.run_fingerprint ||
      attribution.candidate_decision_timestamp !==
        decisionRecord.decision_timestamp ||
      decisionRecord.learning_attribution.attribution_status !== "complete" ||
      decisionRecord.learning_attribution.canonical_evaluation_versions === null
    ) {
      conflictingOrMalformedRuns += 1;
      reasonCodes.add(
        "clock_prior_attribution_or_decision_lineage_conflicting",
      );
      continue;
    }

    const decisionCandidatesById = new Map(
      decisionRecord.candidates.map((candidate) => [candidate.candidate_id, candidate]),
    );
    validAttributions.push(attribution);

    for (const candidate of attribution.candidates) {
      if (!candidate.baseline_selected && !candidate.shadow_selected) continue;
      const decisionCandidate = decisionCandidatesById.get(candidate.candidate_id);
      if (
        !decisionCandidate ||
        normalizedTicker(decisionCandidate.ticker) !== candidate.ticker ||
        decisionCandidate.disposition !== candidate.candidate_decision_disposition
      ) {
        conflictingCandidateCount += 1;
        reasonCodes.add("selected_candidate_decision_identity_conflicting");
        continue;
      }

      const linkedSnapshots = snapshots.filter((snapshot) => {
        const payload = snapshot.payload_json;
        return (
          snapshot.scan_run_id === attribution.scan_run_fingerprint &&
          normalizedTicker(snapshot.ticker) === candidate.ticker &&
          textOrNull(payload.candidate_id) === candidate.candidate_id &&
          textOrNull(payload.candidate_decision_id) === candidate.candidate_id &&
          payload.candidate_decision_disposition ===
            candidate.candidate_decision_disposition &&
          textOrNull(payload.candidate_decision_linkage_version) !== null &&
          payload.candidate_decision_linkage_status === "verified"
        );
      });
      if (linkedSnapshots.length === 0) {
        incompleteCandidateCount += 1;
        reasonCodes.add("selected_candidate_snapshot_missing");
        continue;
      }
      if (linkedSnapshots.length > 1) {
        conflictingCandidateCount += 1;
        reasonCodes.add("selected_candidate_snapshot_ambiguous");
        continue;
      }

      const snapshot = linkedSnapshots[0]!;
      exactSnapshotLinkCount += 1;
      if (
        recommendationDecisionSourceProvenanceFromSnapshot(snapshot).status !==
        "admissible"
      ) {
        incompleteCandidateCount += 1;
        reasonCodes.add("selected_candidate_source_provenance_incomplete");
        continue;
      }

      const sameFingerprint = outcomes.filter(
        (outcome) =>
          outcome.snapshot_fingerprint === snapshot.snapshot_fingerprint,
      );
      const relationConflict = sameFingerprint.some(
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
        relationConflict ||
        linkedOutcomes.some(
          (outcome) =>
            !isAfterOrEqual(outcome.evaluated_at, decisionRecord.decision_timestamp),
        )
      ) {
        conflictingCandidateCount += 1;
        reasonCodes.add("selected_candidate_outcome_lineage_conflicting");
        continue;
      }

      const projected = projectRecommendationOutcomeBundle({
        snapshot,
        outcomes: linkedOutcomes,
        metadata: {
          producer_decision_id: candidate.candidate_id,
          decision_timestamp: decisionRecord.decision_timestamp,
          sample_type: snapshot.is_visible ? "visible" : "research_only",
          numeric_confidence: null,
          confidence_label: null,
          versions:
            decisionRecord.learning_attribution.canonical_evaluation_versions,
          candidate_id: candidate.candidate_id,
          scan_run_id: decisionRecord.scan_run_id,
          scan_run_fingerprint: decisionRecord.scan_run_fingerprint,
          snapshot_id: snapshot.id,
          snapshot_fingerprint: snapshot.snapshot_fingerprint,
          recommendation_id: snapshot.recommendation_id,
        },
      });
      const primary = projected.projection.primary_outcome;
      const selectedOutcome = primary?.status === "selected"
        ? linkedOutcomes.find(
            (outcome) => outcome.id === primary.primary_outcome?.outcome.id,
          ) ?? null
        : null;
      const evaluationAnchor =
        recommendationOutcomeEvaluationAnchorFromSnapshot(snapshot);
      if (projected.status === "conflicting") {
        conflictingCandidateCount += 1;
        reasonCodes.add("selected_candidate_primary_outcome_conflicting");
        continue;
      }
      if (
        primary?.status !== "selected" ||
        primary.primary_outcome === null ||
        !hasCanonicalOutcomeProviderCoverageWithEvaluationAnchor(
          selectedOutcome?.payload_json.canonical_provider_coverage,
          evaluationAnchor,
        )
      ) {
        incompleteCandidateCount += 1;
        reasonCodes.add("selected_candidate_primary_outcome_incomplete");
        continue;
      }

      if (evidenceByCandidateId.has(candidate.candidate_id)) {
        conflictingCandidateCount += 1;
        reasonCodes.add("candidate_decision_id_reused_across_scan_runs");
        continue;
      }
      evidenceByCandidateId.set(candidate.candidate_id, {
        attribution: candidate,
        outcome: primary.primary_outcome.outcome,
      });
    }
  }

  const allCandidates = validAttributions.flatMap(
    (attribution) => attribution.candidates,
  );
  const selectedUnion = allCandidates.filter(
    (candidate) => candidate.baseline_selected || candidate.shadow_selected,
  );
  const baselineCandidates = allCandidates.filter(
    (candidate) => candidate.baseline_selected,
  );
  const shadowCandidates = allCandidates.filter(
    (candidate) => candidate.shadow_selected,
  );
  const baseline = arm(baselineCandidates, evidenceByCandidateId);
  const shadow = arm(shadowCandidates, evidenceByCandidateId);
  const completeOutcomeCount = evidenceByCandidateId.size;

  if (receiptsFound > 0 && validAttributions.length === 0) {
    reasonCodes.add("no_valid_clock_prior_attribution_receipt");
  }
  if (selectedUnion.length === 0 && validAttributions.length > 0) {
    reasonCodes.add("no_selected_candidates_to_compare");
  }
  if (
    completeOutcomeCount <
    MIN_VISIBLE_PRIMARY_OUTCOMES_BEFORE_BASELINE_FREEZE
  ) {
    reasonCodes.add("minimum_forward_outcome_sample_not_met");
  }

  const hasConflict =
    conflictingOrMalformedRuns > 0 || conflictingCandidateCount > 0;
  const completeCoverage =
    selectedUnion.length > 0 &&
    incompleteCandidateCount === 0 &&
    completeOutcomeCount === selectedUnion.length;
  const status =
    receiptsFound === 0
      ? "no_attribution"
      : hasConflict
        ? "conflicting"
        : !completeCoverage
          ? "coverage_incomplete"
          : "comparable";
  const enoughForHeldOutReview =
    status === "comparable" &&
    completeOutcomeCount >=
      MIN_VISIBLE_PRIMARY_OUTCOMES_BEFORE_BASELINE_FREEZE &&
    baseline.complete_primary_outcome_count > 0 &&
    shadow.complete_primary_outcome_count > 0;

  return {
    contract_version:
      SCANNER_CLOCK_PRIOR_SHADOW_OUTCOME_PROJECTION_VERSION,
    status,
    policy_pair: {
      baseline_policy_versions: uniqueSorted(
        validAttributions.map((value) => value.baseline_policy_version),
      ),
      shadow_policy_versions: uniqueSorted(
        validAttributions.map((value) => value.shadow_policy_version),
      ),
    },
    coverage: {
      scan_runs_considered: scanRuns.length,
      attribution_receipts_found: receiptsFound,
      attributed_scan_runs: validAttributions.length,
      conflicting_or_malformed_scan_runs: conflictingOrMalformedRuns,
      selected_union_candidate_count: selectedUnion.length,
      exact_snapshot_link_count: exactSnapshotLinkCount,
      complete_primary_outcome_count: completeOutcomeCount,
      incomplete_candidate_count: incompleteCandidateCount,
      conflicting_candidate_count: conflictingCandidateCount,
      minimum_complete_outcomes_before_quality_review:
        MIN_VISIBLE_PRIMARY_OUTCOMES_BEFORE_BASELINE_FREEZE,
    },
    baseline,
    shadow,
    observed_deltas: {
      entry_triggered_rate: difference(
        baseline.entry_triggered_rate,
        shadow.entry_triggered_rate,
      ),
      mean_current_r: difference(
        baseline.mean_current_r,
        shadow.mean_current_r,
      ),
      target_minus_stop_rate: difference(
        targetMinusStopRate(baseline),
        targetMinusStopRate(shadow),
      ),
    },
    promotion_readiness: enoughForHeldOutReview
      ? "requires_held_out_review"
      : "blocked_insufficient_evidence",
    quality_improvement_claimed: false,
    live_ranking_effect: false,
    publication_effect: false,
    execution_effect: false,
    outcome_join_basis: "candidate_decision_id",
    reason_codes: uniqueSorted(reasonCodes),
  };
}
