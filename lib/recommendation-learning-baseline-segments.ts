import {
  candidateDecisionRecordFromScanRun,
} from "@/lib/candidate-decision-readback";
import type { CanonicalEvaluationVersions } from "@/lib/canonical-recommendation-evaluation";
import type { RecommendationOutcome } from "@/lib/recommendation-outcome-tracker";
import {
  buildRecommendationLearningBaselineReadiness,
  type LearningBaselineScanRun,
  type RecommendationLearningBaselineReadiness,
} from "@/lib/recommendation-learning-baseline-readiness";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";

export const RECOMMENDATION_LEARNING_BASELINE_SEGMENTATION_VERSION =
  "recommendation_learning_baseline_segmentation_v1" as const;

const canonicalVersionFields = [
  "engine_version",
  "scoring_version",
  "ranking_version",
  "setup_taxonomy_version",
  "confidence_contract_version",
  "evaluator_version",
  "provider_contract_version",
  "git_commit",
  "build_identity",
] as const satisfies ReadonlyArray<keyof CanonicalEvaluationVersions>;

type CompletePolicyAttribution = {
  recommendation_publish_policy_version: string;
  canonical_evaluation_versions: CanonicalEvaluationVersions;
};

type ComparableRun = {
  scanRun: LearningBaselineScanRun;
  scanRunFingerprint: string;
  decisionTimestamp: string;
  attribution: CompletePolicyAttribution;
};

export type RecommendationLearningBaselineSegment = {
  // Internal, deterministic identity for rendering and inspection. It includes
  // every policy/version field, unlike the human-readable policy label.
  segment_key: string;
  policy_attribution: CompletePolicyAttribution;
  decision_records: {
    count: number;
    earliest_decision_timestamp: string;
    latest_decision_timestamp: string;
  };
  readiness: RecommendationLearningBaselineReadiness;
};

export type RecommendationLearningBaselineSegmentation = {
  contract_version: typeof RECOMMENDATION_LEARNING_BASELINE_SEGMENTATION_VERSION;
  status:
    | "no_comparable_segments"
    | "segments_not_ready"
    | "eligible_segments_require_explicit_freeze";
  source_scan_runs: {
    considered_count: number;
    comparable_count: number;
    invalid_decision_record_count: number;
    incomplete_policy_attribution_count: number;
    duplicate_scan_run_fingerprint_count: number;
  };
  segments: RecommendationLearningBaselineSegment[];
};

function completePolicyAttribution(
  scanRun: LearningBaselineScanRun,
): Omit<ComparableRun, "scanRun"> | null {
  const record = candidateDecisionRecordFromScanRun(scanRun);
  const attribution = record?.learning_attribution;

  if (
    !record ||
    !attribution ||
    attribution.attribution_status !== "complete" ||
    attribution.canonical_evaluation_versions === null
  ) {
    return null;
  }

  return {
    scanRunFingerprint: record.scan_run_fingerprint,
    decisionTimestamp: record.decision_timestamp,
    attribution: {
      recommendation_publish_policy_version:
        attribution.recommendation_publish_policy_version,
      canonical_evaluation_versions: attribution.canonical_evaluation_versions,
    },
  };
}

function policyBundleKey(attribution: CompletePolicyAttribution) {
  // A JSON tuple avoids separator-collision ambiguity while making every field
  // that can affect a comparable evaluation population part of the key.
  return JSON.stringify([
    attribution.recommendation_publish_policy_version,
    ...canonicalVersionFields.map(
      (field) => attribution.canonical_evaluation_versions[field],
    ),
  ]);
}

function compareSegments(
  left: RecommendationLearningBaselineSegment,
  right: RecommendationLearningBaselineSegment,
) {
  const leftEligible =
    left.readiness.status === "eligible_for_explicit_freeze" ? 1 : 0;
  const rightEligible =
    right.readiness.status === "eligible_for_explicit_freeze" ? 1 : 0;
  if (leftEligible !== rightEligible) return rightEligible - leftEligible;

  const primaryDifference =
    right.readiness.visible_outcomes.primary_outcome_count -
    left.readiness.visible_outcomes.primary_outcome_count;
  if (primaryDifference !== 0) return primaryDifference;

  return policyBundleKey(left.policy_attribution).localeCompare(
    policyBundleKey(right.policy_attribution),
  );
}

/**
 * Partitions decision records into policy/version-homogeneous populations.
 * This is a read-only audit: it does not select a winning policy, persist a
 * freeze, calculate prices, alter ranking, or relax publication. A caller must
 * still make and durably record any explicit baseline-freeze decision.
 */
export function buildRecommendationLearningBaselineSegmentation({
  scanRuns,
  snapshots,
  outcomes,
}: {
  scanRuns: LearningBaselineScanRun[];
  snapshots: RecommendationSnapshot[];
  outcomes: RecommendationOutcome[];
}): RecommendationLearningBaselineSegmentation {
  let invalidDecisionRecordCount = 0;
  let incompletePolicyAttributionCount = 0;
  const comparableRuns: ComparableRun[] = [];

  for (const scanRun of scanRuns) {
    const comparable = completePolicyAttribution(scanRun);
    if (!comparable) {
      if (candidateDecisionRecordFromScanRun(scanRun)) {
        incompletePolicyAttributionCount += 1;
      } else {
        invalidDecisionRecordCount += 1;
      }
      continue;
    }

    comparableRuns.push({ scanRun, ...comparable });
  }

  const fingerprintCounts = new Map<string, number>();
  for (const run of comparableRuns) {
    fingerprintCounts.set(
      run.scanRunFingerprint,
      (fingerprintCounts.get(run.scanRunFingerprint) ?? 0) + 1,
    );
  }
  const duplicateFingerprints = new Set(
    Array.from(fingerprintCounts.entries())
      .filter(([, count]) => count > 1)
      .map(([fingerprint]) => fingerprint),
  );
  const duplicateScanRunFingerprintCount = comparableRuns.filter((run) =>
    duplicateFingerprints.has(run.scanRunFingerprint),
  ).length;

  const groupedRuns = new Map<string, ComparableRun[]>();
  for (const run of comparableRuns) {
    if (duplicateFingerprints.has(run.scanRunFingerprint)) continue;
    const key = policyBundleKey(run.attribution);
    const group = groupedRuns.get(key) ?? [];
    group.push(run);
    groupedRuns.set(key, group);
  }

  const segments = Array.from(groupedRuns.values())
    .map((runs): RecommendationLearningBaselineSegment => {
      const orderedRuns = [...runs].sort((left, right) => {
        const timestampOrder = left.decisionTimestamp.localeCompare(
          right.decisionTimestamp,
        );
        return timestampOrder !== 0
          ? timestampOrder
          : left.scanRunFingerprint.localeCompare(right.scanRunFingerprint);
      });
      const first = orderedRuns[0]!;
      const last = orderedRuns[orderedRuns.length - 1]!;

      return {
        segment_key: policyBundleKey(first.attribution),
        policy_attribution: first.attribution,
        decision_records: {
          count: orderedRuns.length,
          earliest_decision_timestamp: first.decisionTimestamp,
          latest_decision_timestamp: last.decisionTimestamp,
        },
        readiness: buildRecommendationLearningBaselineReadiness({
          scanRuns: orderedRuns.map((run) => run.scanRun),
          snapshots,
          outcomes,
        }),
      };
    })
    .sort(compareSegments);

  const eligibleSegmentCount = segments.filter(
    (segment) => segment.readiness.status === "eligible_for_explicit_freeze",
  ).length;

  return {
    contract_version: RECOMMENDATION_LEARNING_BASELINE_SEGMENTATION_VERSION,
    status:
      segments.length === 0
        ? "no_comparable_segments"
        : eligibleSegmentCount > 0
          ? "eligible_segments_require_explicit_freeze"
          : "segments_not_ready",
    source_scan_runs: {
      considered_count: scanRuns.length,
      comparable_count: comparableRuns.length - duplicateScanRunFingerprintCount,
      invalid_decision_record_count: invalidDecisionRecordCount,
      incomplete_policy_attribution_count: incompletePolicyAttributionCount,
      duplicate_scan_run_fingerprint_count: duplicateScanRunFingerprintCount,
    },
    segments,
  };
}
