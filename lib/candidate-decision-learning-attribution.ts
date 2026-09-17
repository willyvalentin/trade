import {
  validateCanonicalEvaluationVersions,
  type CanonicalEvaluationVersions,
} from "@/lib/canonical-recommendation-evaluation";

export const CANDIDATE_DECISION_LEARNING_ATTRIBUTION_VERSION =
  "candidate_decision_learning_attribution_v1" as const;

/**
 * The scan-level facts needed to decide whether a future outcome can belong to
 * a comparable learning population. The current score remains ordinal: it is
 * deliberately never copied into `numeric_confidence` as a probability.
 */
export type CandidateDecisionLearningAttribution = {
  attribution_version: typeof CANDIDATE_DECISION_LEARNING_ATTRIBUTION_VERSION;
  recommendation_publish_policy_version: string;
  confidence: {
    semantics: "ordinal_not_calibrated";
    numeric_confidence: null;
    numeric_confidence_scale: "not_available";
  };
  canonical_evaluation_versions: CanonicalEvaluationVersions | null;
  attribution_status: "complete" | "incomplete";
  reason_codes: string[];
};

function text(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function stringArray(value: unknown) {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value.map((item) => item.trim()).filter(Boolean)
    : null;
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort();
}

export function buildCandidateDecisionLearningAttribution({
  recommendationPublishPolicyVersion,
  canonicalEvaluationVersions,
}: {
  recommendationPublishPolicyVersion: string | null | undefined;
  canonicalEvaluationVersions: CanonicalEvaluationVersions | null | undefined;
}): CandidateDecisionLearningAttribution {
  const policyVersion = text(recommendationPublishPolicyVersion);
  const validation = canonicalEvaluationVersions
    ? validateCanonicalEvaluationVersions(canonicalEvaluationVersions)
    : null;
  const canonicalVersions = validation?.ok ? validation.value : null;
  const reasonCodes = uniqueSorted([
    "confidence_is_ordinal_not_probability",
    ...(policyVersion ? [] : ["recommendation_publish_policy_version_missing"]),
    ...(canonicalVersions
      ? []
      : validation
        ? validation.errors.map((error) => `canonical_versions_${error}`)
        : ["canonical_evaluation_versions_missing"]),
  ]);

  return {
    attribution_version: CANDIDATE_DECISION_LEARNING_ATTRIBUTION_VERSION,
    recommendation_publish_policy_version: policyVersion ?? "not_recorded",
    confidence: {
      semantics: "ordinal_not_calibrated",
      numeric_confidence: null,
      numeric_confidence_scale: "not_available",
    },
    canonical_evaluation_versions: canonicalVersions,
    attribution_status:
      policyVersion !== null && canonicalVersions !== null ? "complete" : "incomplete",
    reason_codes: reasonCodes,
  };
}

/**
 * Payload JSON is untrusted at the client boundary. A record carrying an
 * attribution must either satisfy this exact contract or be excluded from a
 * learning baseline; we never infer missing version evidence from UI state.
 */
export function candidateDecisionLearningAttributionFromUnknown(
  value: unknown,
): CandidateDecisionLearningAttribution | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  const attribution = value as Record<string, unknown>;
  const confidence =
    typeof attribution.confidence === "object" &&
    attribution.confidence !== null &&
    !Array.isArray(attribution.confidence)
      ? (attribution.confidence as Record<string, unknown>)
      : null;
  const policyVersion = text(attribution.recommendation_publish_policy_version);
  const reasonCodes = stringArray(attribution.reason_codes);
  const canonicalVersions = attribution.canonical_evaluation_versions;
  const versionsValidation =
    canonicalVersions === null
      ? null
      : typeof canonicalVersions === "object" && canonicalVersions !== null
        ? validateCanonicalEvaluationVersions(
            canonicalVersions as CanonicalEvaluationVersions,
          )
        : { ok: false as const, errors: ["invalid_canonical_evaluation_versions"] };

  if (
    attribution.attribution_version !==
      CANDIDATE_DECISION_LEARNING_ATTRIBUTION_VERSION ||
    policyVersion === null ||
    reasonCodes === null ||
    (attribution.attribution_status !== "complete" &&
      attribution.attribution_status !== "incomplete") ||
    confidence?.semantics !== "ordinal_not_calibrated" ||
    confidence.numeric_confidence !== null ||
    confidence.numeric_confidence_scale !== "not_available" ||
    (versionsValidation !== null && !versionsValidation.ok) ||
    (attribution.attribution_status === "complete" &&
      (canonicalVersions === null || versionsValidation === null || !versionsValidation.ok))
  ) {
    return null;
  }

  return {
    attribution_version: CANDIDATE_DECISION_LEARNING_ATTRIBUTION_VERSION,
    recommendation_publish_policy_version: policyVersion,
    confidence: {
      semantics: "ordinal_not_calibrated",
      numeric_confidence: null,
      numeric_confidence_scale: "not_available",
    },
    canonical_evaluation_versions:
      versionsValidation?.ok ? versionsValidation.value : null,
    attribution_status: attribution.attribution_status,
    reason_codes: uniqueSorted(reasonCodes),
  };
}
