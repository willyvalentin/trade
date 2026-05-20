import type {
  CalibrationBucket,
  RecommendationCalibrationResult,
} from "@/lib/recommendation-calibration";
import type { SetupExecutionFeedbackResult } from "@/lib/setup-execution-feedback";
import { getSetupTypeLabel, normalizeSetupType, type SetupType } from "@/lib/setup-types";

export type CalibrationGuardrailSeverity = "info" | "caution" | "warning";

export type CalibrationGuardrailScope =
  | "current_recommendation"
  | "setup_type"
  | "confidence_bucket"
  | "scanner_behavior"
  | "execution_quality"
  | "discard_behavior"
  | "sample_size";

export type CalibrationGuardrail = {
  code: string;
  severity: CalibrationGuardrailSeverity;
  scope: CalibrationGuardrailScope;
  title: string;
  description: string;
  suggested_action: string;
  data_points?: {
    label: string;
    value: string | number;
  }[];
};

export type CalibrationGuardrailResult = {
  generated_at: string;
  summary: string;
  guardrails: CalibrationGuardrail[];
};

export type BuildCalibrationGuardrailsInput = {
  currentRecommendation?: {
    setup_type?: unknown;
    confidence_score?: number | null;
  } | null;
  recommendationCalibration?: RecommendationCalibrationResult | null;
  setupExecutionFeedback?: SetupExecutionFeedbackResult | null;
  generatedAt?: string;
};

function confidenceBucketKey(score: number | null | undefined) {
  if (typeof score !== "number" || !Number.isFinite(score)) {
    return "very_low_unknown";
  }

  if (score >= 90) return "90_100";
  if (score >= 80) return "80_89";
  if (score >= 70) return "70_79";
  if (score >= 60) return "60_69";
  return "very_low_unknown";
}

function severityWeight(severity: CalibrationGuardrailSeverity) {
  if (severity === "warning") return 0;
  if (severity === "caution") return 1;
  return 2;
}

function createGuardrail(
  code: string,
  severity: CalibrationGuardrailSeverity,
  scope: CalibrationGuardrailScope,
  title: string,
  description: string,
  suggested_action: string,
  data_points?: CalibrationGuardrail["data_points"],
): CalibrationGuardrail {
  return {
    code,
    severity,
    scope,
    title,
    description,
    suggested_action,
    data_points,
  };
}

function findSetupBucket(
  calibration: RecommendationCalibrationResult | null | undefined,
  setupType: SetupType,
) {
  return calibration?.setup_type_buckets.find((bucket) => bucket.key === setupType);
}

function findConfidenceBucket(
  calibration: RecommendationCalibrationResult | null | undefined,
  confidenceScore: number | null | undefined,
) {
  const key = confidenceBucketKey(confidenceScore);
  return calibration?.confidence_buckets.find((bucket) => bucket.key === key);
}

function averageRText(bucket: CalibrationBucket | undefined) {
  return bucket?.average_r === null || bucket?.average_r === undefined
    ? "—"
    : `${bucket.average_r.toFixed(2)}R`;
}

function summarize(guardrails: CalibrationGuardrail[]) {
  if (guardrails.length === 0) {
    return "No calibration guardrails active.";
  }

  const warnings = guardrails.filter((guardrail) => guardrail.severity === "warning")
    .length;
  const cautions = guardrails.filter((guardrail) => guardrail.severity === "caution")
    .length;

  if (warnings > 0) {
    return `${guardrails.length} advisory guardrails active, including ${warnings} warning${warnings === 1 ? "" : "s"}.`;
  }

  if (cautions > 0) {
    return `${guardrails.length} advisory guardrails active, including ${cautions} caution${cautions === 1 ? "" : "s"}.`;
  }

  return `${guardrails.length} informational calibration guardrail${guardrails.length === 1 ? "" : "s"} active.`;
}

export function buildCalibrationGuardrails({
  currentRecommendation = null,
  recommendationCalibration = null,
  setupExecutionFeedback = null,
  generatedAt = new Date().toISOString(),
}: BuildCalibrationGuardrailsInput): CalibrationGuardrailResult {
  const guardrails = new Map<string, CalibrationGuardrail>();
  const setupType = normalizeSetupType(currentRecommendation?.setup_type);
  const confidenceScore =
    typeof currentRecommendation?.confidence_score === "number" &&
    Number.isFinite(currentRecommendation.confidence_score)
      ? currentRecommendation.confidence_score
      : null;
  const setupBucket = findSetupBucket(recommendationCalibration, setupType);
  const confidenceBucket = findConfidenceBucket(
    recommendationCalibration,
    confidenceScore,
  );
  const highConfidenceBuckets =
    recommendationCalibration?.confidence_buckets.filter((bucket) =>
      ["90_100", "80_89"].includes(bucket.key),
    ) ?? [];
  const highConfidenceClosed = highConfidenceBuckets.reduce(
    (sum, bucket) => sum + bucket.closed_trades,
    0,
  );
  const highConfidenceAverageRValues = highConfidenceBuckets
    .map((bucket) => bucket.average_r)
    .filter((value): value is number => value !== null);
  const highConfidenceAverageR =
    highConfidenceAverageRValues.length === 0
      ? null
      : highConfidenceAverageRValues.reduce((sum, value) => sum + value, 0) /
        highConfidenceAverageRValues.length;
  const poorExecutionBucket =
    setupExecutionFeedback?.buckets_by_execution_quality.find(
      (bucket) => bucket.key === "poor",
    );

  function add(guardrail: CalibrationGuardrail) {
    if (!guardrails.has(guardrail.code)) {
      guardrails.set(guardrail.code, guardrail);
    }
  }

  if ((recommendationCalibration?.total_closed_trades ?? 0) < 5) {
    add(
      createGuardrail(
        "limited_calibration_sample",
        "info",
        "sample_size",
        "Limited calibration sample",
        "There are fewer than five closed trades, so calibration signals are still early.",
        "Treat calibration signals as early indicators, not conclusions.",
        [
          {
            label: "Closed trades",
            value: recommendationCalibration?.total_closed_trades ?? 0,
          },
        ],
      ),
    );
  }

  if (setupBucket && setupBucket.closed_trades >= 3) {
    if ((setupBucket.average_r ?? 0) < 0) {
      add(
        createGuardrail(
          `setup_underperforming_${setupType}`,
          "warning",
          "setup_type",
          "This setup type is underperforming",
          `${getSetupTypeLabel(setupType)} averages ${averageRText(setupBucket)} across ${setupBucket.closed_trades} closed trades.`,
          "Require stronger confirmation before taking this setup.",
          [
            { label: "Setup", value: getSetupTypeLabel(setupType) },
            { label: "Closed trades", value: setupBucket.closed_trades },
            { label: "Average R", value: averageRText(setupBucket) },
          ],
        ),
      );
    } else if ((setupBucket.average_r ?? 0) > 0) {
      add(
        createGuardrail(
          `setup_positive_${setupType}`,
          "info",
          "setup_type",
          "This setup type has positive historical R",
          `${getSetupTypeLabel(setupType)} averages ${averageRText(setupBucket)} across ${setupBucket.closed_trades} closed trades.`,
          "Still follow normal validation and risk controls.",
          [
            { label: "Setup", value: getSetupTypeLabel(setupType) },
            { label: "Average R", value: averageRText(setupBucket) },
          ],
        ),
      );
    }
  }

  if (
    confidenceBucket &&
    confidenceBucket.closed_trades >= 3 &&
    (confidenceBucket.average_r ?? 0) < 0
  ) {
    add(
      createGuardrail(
        `confidence_bucket_underperforming_${confidenceBucket.key}`,
        confidenceScore !== null && confidenceScore >= 80 ? "warning" : "caution",
        "confidence_bucket",
        "This confidence bucket is not outperforming yet",
        `${confidenceBucket.label} averages ${averageRText(confidenceBucket)} across ${confidenceBucket.closed_trades} closed trades.`,
        "Do not rely on confidence alone; check intraday confirmation and market context.",
        [
          { label: "Confidence bucket", value: confidenceBucket.label },
          { label: "Average R", value: averageRText(confidenceBucket) },
        ],
      ),
    );
  }

  if (
    highConfidenceClosed >= 3 &&
    highConfidenceAverageR !== null &&
    highConfidenceAverageR < 0
  ) {
    add(
      createGuardrail(
        "high_confidence_underperforming",
        "warning",
        "confidence_bucket",
        "High-confidence recommendations are underperforming",
        `80+ confidence trades average ${highConfidenceAverageR.toFixed(2)}R across ${highConfidenceClosed} closed trades.`,
        "Be more selective until calibration improves.",
        [
          { label: "80+ closed trades", value: highConfidenceClosed },
          { label: "Average R", value: `${highConfidenceAverageR.toFixed(2)}R` },
        ],
      ),
    );
  }

  if ((poorExecutionBucket?.losing_trades ?? 0) >= 2) {
    add(
      createGuardrail(
        "poor_execution_linked_to_losses",
        "caution",
        "execution_quality",
        "Poor execution quality is linked to losses",
        `${poorExecutionBucket?.losing_trades ?? 0} losing trades sit in the poor execution-quality bucket.`,
        "Avoid chasing entries and respect planned limit prices.",
        [
          {
            label: "Poor execution losses",
            value: poorExecutionBucket?.losing_trades ?? 0,
          },
        ],
      ),
    );
  }

  if (setupBucket && setupBucket.missed_winners > setupBucket.correct_discards) {
    add(
      createGuardrail(
        `discard_missed_winners_${setupType}`,
        "caution",
        "discard_behavior",
        "Discarded setups of this type include missed winners",
        `${getSetupTypeLabel(setupType)} has ${setupBucket.missed_winners} missed winners vs ${setupBucket.correct_discards} correct discards in review.`,
        "Review whether discard criteria are too strict for this setup.",
        [
          { label: "Missed winners", value: setupBucket.missed_winners },
          { label: "Correct discards", value: setupBucket.correct_discards },
        ],
      ),
    );
  }

  if (
    (recommendationCalibration?.scan_decision_summary.recommendation_created ?? 0) >=
      5 &&
    recommendationCalibration?.total_closed_trades &&
    recommendationCalibration.total_closed_trades >= 3
  ) {
    const closedBuckets = recommendationCalibration.confidence_buckets.filter(
      (bucket) => bucket.closed_trades > 0 && bucket.average_r !== null,
    );
    const averageR =
      closedBuckets.length === 0
        ? null
        : closedBuckets.reduce((sum, bucket) => sum + (bucket.average_r ?? 0), 0) /
          closedBuckets.length;

    if (averageR !== null && averageR < 0) {
      add(
        createGuardrail(
          "scanner_may_be_too_permissive",
          "caution",
          "scanner_behavior",
          "Scanner may be too permissive",
          `Recommendations were created frequently, while closed recommendation buckets average ${averageR.toFixed(2)}R.`,
          "Prefer higher confirmation until more positive outcomes appear.",
          [
            {
              label: "Recommendations created",
              value:
                recommendationCalibration.scan_decision_summary
                  .recommendation_created,
            },
            { label: "Average bucket R", value: `${averageR.toFixed(2)}R` },
          ],
        ),
      );
    }
  }

  if (
    (recommendationCalibration?.scan_decision_summary.no_trade ?? 0) >=
      Math.max(
        3,
        (recommendationCalibration?.scan_decision_summary.recommendation_created ??
          0) * 2,
      ) &&
    (recommendationCalibration?.scan_decision_summary.no_trade ?? 0) > 0
  ) {
    add(
      createGuardrail(
        "scanner_highly_selective",
        "info",
        "scanner_behavior",
        "Scanner is highly selective",
        `${recommendationCalibration?.scan_decision_summary.no_trade ?? 0} scans produced no-trade decisions vs ${recommendationCalibration?.scan_decision_summary.recommendation_created ?? 0} created recommendations.`,
        "This may be acceptable if recommendation quality improves.",
        [
          {
            label: "No-trade scans",
            value: recommendationCalibration?.scan_decision_summary.no_trade ?? 0,
          },
          {
            label: "Created",
            value:
              recommendationCalibration?.scan_decision_summary
                .recommendation_created ?? 0,
          },
        ],
      ),
    );
  }

  const sorted = [...guardrails.values()]
    .sort(
      (first, second) =>
        severityWeight(first.severity) - severityWeight(second.severity) ||
        first.title.localeCompare(second.title),
    )
    .slice(0, 5);

  return {
    generated_at: generatedAt,
    summary: summarize(sorted),
    guardrails: sorted,
  };
}
