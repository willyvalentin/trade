import "server-only";

import { createHash } from "node:crypto";

export const CANONICAL_TRUSTED_FEATURE_CONTEXT_REGISTRY_VERSION =
  "canonical_trusted_feature_context_registry_v1" as const;
export const CANONICAL_CAPTURE_EVIDENCE_VERSION =
  "canonical_decision_time_capture_evidence_v1" as const;
export const CANONICAL_TRAINING_INPUT_MANIFEST_VERSION =
  "canonical_frozen_training_input_manifest_v1" as const;
export const CANONICAL_TRAINING_INPUT_REGISTRY_VERSION =
  "canonical_frozen_training_input_registry_v1" as const;

export type CanonicalLearningSampleType =
  | "visible"
  | "research_only"
  | "shadow"
  | "historical_synthetic"
  | "rejected_candidate"
  | "no_trade";

export type CanonicalLearningCohort =
  | "visible_recommendation_quality"
  | "research_only_recommendation_quality"
  | "shadow_recommendation_quality"
  | "historical_synthetic_recommendation_quality"
  | "rejected_candidate_counterfactual"
  | "no_trade_counterfactual";

export type CanonicalSampleCohortCompatibility = {
  sample_type: CanonicalLearningSampleType;
  cohort: CanonicalLearningCohort;
};

export type CanonicalTrustedFeatureDefinition = {
  feature_id: string;
  value_type: "finite_number";
  unit: string;
  minimum: number;
  maximum: number;
  source_namespace: string;
  capture_evidence_type: string;
  timestamp_semantics: "observed_at_lte_cutoff_and_decision";
  availability_policy: "captured_by_owned_point_in_time_producer";
  allowed_sample_cohort_combinations: CanonicalSampleCohortCompatibility[];
};

export type CanonicalTrustedContextDefinition = {
  context_id: "regime" | "sector" | "provider";
  value_type: "non_empty_string";
  unit: "categorical";
  source_namespace: string;
  capture_evidence_type: string;
  timestamp_semantics: "observed_at_lte_cutoff_and_decision";
  availability_policy: "captured_by_owned_point_in_time_producer";
  allowed_values: string[];
  allowed_sample_cohort_combinations: CanonicalSampleCohortCompatibility[];
};

export type CanonicalTrustedFeatureContextRegistry = {
  registry_version:
    typeof CANONICAL_TRUSTED_FEATURE_CONTEXT_REGISTRY_VERSION;
  feature_definitions: CanonicalTrustedFeatureDefinition[];
  context_definitions: CanonicalTrustedContextDefinition[];
  compatibility_policy: CanonicalSampleCohortCompatibility[];
  digest_algorithm: "sha256_canonical_json_v1";
  root_digest: string;
};

export type CanonicalCaptureEvidence = {
  evidence_version: typeof CANONICAL_CAPTURE_EVIDENCE_VERSION;
  evidence_identity: string;
  evidence_type: string;
  evidence_digest: string;
};

export type CanonicalCapturedNumericValue = {
  value: number;
  observed_at: string;
  source_namespace: string;
  capture_evidence: CanonicalCaptureEvidence;
};

export type CanonicalCapturedContextValue = {
  value: string;
  observed_at: string;
  source_namespace: string;
  capture_evidence: CanonicalCaptureEvidence;
};

export type CanonicalTrainingInputRowBinding = {
  canonical_decision_identity: string;
  row_digest: string;
  feature_capture_digests: string[];
  context_capture_digests: string[];
  label_digest: string;
  lineage_digest: string;
};

export type CanonicalFrozenTrainingInputManifest = {
  manifest_version: typeof CANONICAL_TRAINING_INPUT_MANIFEST_VERSION;
  manifest_identity: string;
  feature_context_registry_root_digest: string;
  cohort: CanonicalLearningCohort;
  sample_type: CanonicalLearningSampleType;
  row_count: number;
  row_bindings: CanonicalTrainingInputRowBinding[];
  digest_algorithm: "sha256_canonical_json_v1";
  manifest_digest: string;
};

export type CanonicalFrozenTrainingInputRegistry = {
  registry_version: typeof CANONICAL_TRAINING_INPUT_REGISTRY_VERSION;
  manifests: CanonicalFrozenTrainingInputManifest[];
  digest_algorithm: "sha256_canonical_json_v1";
  root_digest: string;
};

export type CanonicalOfflineLearningTrustBoundary = {
  feature_context_registry: CanonicalTrustedFeatureContextRegistry;
  training_input_registry: CanonicalFrozenTrainingInputRegistry;
  expected_feature_context_registry_root_digest: string;
  expected_training_input_registry_root_digest: string;
  trust_source:
    | "version_controlled_synthetic_fixture_registry"
    | "separately_owned_capture_registry";
};

const shaPattern = /^[0-9a-f]{64}$/;

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, item]) => item !== undefined)
        .sort(([first], [second]) => first.localeCompare(second))
        .map(([key, item]) => [key, canonicalize(item)]),
    );
  }
  return value;
}

export function canonicalOfflineLearningTrustDigest(value: unknown) {
  return createHash("sha256")
    .update(JSON.stringify(canonicalize(value)))
    .digest("hex");
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort();
}

function canonicalCompatibility(
  values: CanonicalSampleCohortCompatibility[],
) {
  return [...values].sort((first, second) =>
    `${first.sample_type}:${first.cohort}`.localeCompare(
      `${second.sample_type}:${second.cohort}`,
    ),
  );
}

export function createCanonicalTrustedFeatureContextRegistry(input: {
  feature_definitions: CanonicalTrustedFeatureDefinition[];
  context_definitions: CanonicalTrustedContextDefinition[];
  compatibility_policy: CanonicalSampleCohortCompatibility[];
}): CanonicalTrustedFeatureContextRegistry {
  const compatibility = canonicalCompatibility(input.compatibility_policy);
  if (
    compatibility.length === 0 ||
    new Set(
      compatibility.map((item) => `${item.sample_type}:${item.cohort}`),
    ).size !== compatibility.length
  ) {
    throw new Error("trusted_compatibility_policy_invalid");
  }
  const features = [...input.feature_definitions]
    .map((definition) => ({
      ...definition,
      allowed_sample_cohort_combinations: canonicalCompatibility(
        definition.allowed_sample_cohort_combinations,
      ),
    }))
    .sort((first, second) =>
      first.feature_id.localeCompare(second.feature_id),
    );
  if (
    features.length === 0 ||
    new Set(features.map((item) => item.feature_id)).size !== features.length ||
    features.some(
      (item) =>
        !/^[a-z][a-z0-9_]{0,63}$/.test(item.feature_id) ||
        item.value_type !== "finite_number" ||
        !item.unit.trim() ||
        !Number.isFinite(item.minimum) ||
        !Number.isFinite(item.maximum) ||
        item.minimum >= item.maximum ||
        !item.source_namespace.trim() ||
        !item.capture_evidence_type.trim() ||
        item.timestamp_semantics !==
          "observed_at_lte_cutoff_and_decision" ||
        item.availability_policy !==
          "captured_by_owned_point_in_time_producer" ||
        item.allowed_sample_cohort_combinations.length === 0,
    )
  ) {
    throw new Error("trusted_feature_registry_invalid");
  }
  const contexts = [...input.context_definitions]
    .map((definition) => ({
      ...definition,
      allowed_values: uniqueSorted(definition.allowed_values),
      allowed_sample_cohort_combinations: canonicalCompatibility(
        definition.allowed_sample_cohort_combinations,
      ),
    }))
    .sort((first, second) =>
      first.context_id.localeCompare(second.context_id),
    );
  if (
    JSON.stringify(contexts.map((item) => item.context_id)) !==
      JSON.stringify(["provider", "regime", "sector"]) ||
    contexts.some(
      (item) =>
        item.value_type !== "non_empty_string" ||
        item.unit !== "categorical" ||
        !item.source_namespace.trim() ||
        !item.capture_evidence_type.trim() ||
        item.timestamp_semantics !==
          "observed_at_lte_cutoff_and_decision" ||
        item.availability_policy !==
          "captured_by_owned_point_in_time_producer" ||
        item.allowed_values.length === 0 ||
        item.allowed_values.some((value) => !value.trim()) ||
        item.allowed_sample_cohort_combinations.length === 0,
    )
  ) {
    throw new Error("trusted_context_registry_invalid");
  }
  const payload = {
    registry_version: CANONICAL_TRUSTED_FEATURE_CONTEXT_REGISTRY_VERSION,
    feature_definitions: features,
    context_definitions: contexts,
    compatibility_policy: compatibility,
    digest_algorithm: "sha256_canonical_json_v1" as const,
  };
  return Object.freeze({
    ...payload,
    root_digest: canonicalOfflineLearningTrustDigest(payload),
  });
}

export function recomputeCanonicalFeatureContextRegistryRoot(
  registry: CanonicalTrustedFeatureContextRegistry,
) {
  return canonicalOfflineLearningTrustDigest({
    registry_version: registry.registry_version,
    feature_definitions: registry.feature_definitions,
    context_definitions: registry.context_definitions,
    compatibility_policy: registry.compatibility_policy,
    digest_algorithm: registry.digest_algorithm,
  });
}

export function canonicalCaptureEvidenceDigest(input: {
  value_kind: "feature" | "context";
  value_id: string;
  value: number | string;
  observed_at: string;
  source_namespace: string;
  evidence_identity: string;
  evidence_type: string;
}) {
  return canonicalOfflineLearningTrustDigest({
    evidence_version: CANONICAL_CAPTURE_EVIDENCE_VERSION,
    ...input,
  });
}

export function createCanonicalFrozenTrainingInputManifest(input: {
  feature_context_registry_root_digest: string;
  cohort: CanonicalLearningCohort;
  sample_type: CanonicalLearningSampleType;
  row_bindings: CanonicalTrainingInputRowBinding[];
}): CanonicalFrozenTrainingInputManifest {
  const rows = [...input.row_bindings].sort((first, second) =>
    first.canonical_decision_identity.localeCompare(
      second.canonical_decision_identity,
    ),
  );
  if (
    !shaPattern.test(input.feature_context_registry_root_digest) ||
    rows.length === 0 ||
    new Set(rows.map((item) => item.canonical_decision_identity)).size !==
      rows.length ||
    rows.some(
      (item) =>
        !item.canonical_decision_identity.trim() ||
        !shaPattern.test(item.row_digest) ||
        !shaPattern.test(item.label_digest) ||
        !shaPattern.test(item.lineage_digest) ||
        item.feature_capture_digests.length === 0 ||
        item.context_capture_digests.length !== 3 ||
        [...item.feature_capture_digests, ...item.context_capture_digests].some(
          (value) => !shaPattern.test(value),
        ),
    )
  ) {
    throw new Error("trusted_training_input_manifest_invalid");
  }
  const payload = {
    manifest_version: CANONICAL_TRAINING_INPUT_MANIFEST_VERSION,
    feature_context_registry_root_digest:
      input.feature_context_registry_root_digest,
    cohort: input.cohort,
    sample_type: input.sample_type,
    row_count: rows.length,
    row_bindings: rows,
    digest_algorithm: "sha256_canonical_json_v1" as const,
  };
  const manifestDigest = canonicalOfflineLearningTrustDigest(payload);
  return Object.freeze({
    ...payload,
    manifest_identity: `canonical-training-input-manifest:${manifestDigest}`,
    manifest_digest: manifestDigest,
  });
}

export function recomputeCanonicalTrainingInputManifestDigest(
  manifest: CanonicalFrozenTrainingInputManifest,
) {
  return canonicalOfflineLearningTrustDigest({
    manifest_version: manifest.manifest_version,
    feature_context_registry_root_digest:
      manifest.feature_context_registry_root_digest,
    cohort: manifest.cohort,
    sample_type: manifest.sample_type,
    row_count: manifest.row_count,
    row_bindings: manifest.row_bindings,
    digest_algorithm: manifest.digest_algorithm,
  });
}

export function createCanonicalFrozenTrainingInputRegistry(
  manifestsInput: CanonicalFrozenTrainingInputManifest[],
): CanonicalFrozenTrainingInputRegistry {
  const manifests = [...manifestsInput].sort((first, second) =>
    first.manifest_identity.localeCompare(second.manifest_identity),
  );
  if (
    manifests.length === 0 ||
    new Set(manifests.map((item) => item.manifest_identity)).size !==
      manifests.length ||
    manifests.some((manifest) => {
      const actual = recomputeCanonicalTrainingInputManifestDigest(manifest);
      return (
        actual !== manifest.manifest_digest ||
        manifest.manifest_identity !==
          `canonical-training-input-manifest:${actual}`
      );
    })
  ) {
    throw new Error("trusted_training_input_registry_invalid");
  }
  const payload = {
    registry_version: CANONICAL_TRAINING_INPUT_REGISTRY_VERSION,
    manifests,
    digest_algorithm: "sha256_canonical_json_v1" as const,
  };
  return Object.freeze({
    ...payload,
    root_digest: canonicalOfflineLearningTrustDigest(payload),
  });
}

export function recomputeCanonicalTrainingInputRegistryRoot(
  registry: CanonicalFrozenTrainingInputRegistry,
) {
  return canonicalOfflineLearningTrustDigest({
    registry_version: registry.registry_version,
    manifests: registry.manifests,
    digest_algorithm: registry.digest_algorithm,
  });
}
