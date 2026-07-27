import "server-only";

import {
  buildCanonicalTrainingInputRowBinding,
  type CanonicalOfflineLearningRequest,
} from "@/lib/server/canonical-offline-learning-engine";
import {
  action666fTrainableRequest,
  action666hTrustedFeatureContextRegistry,
  action666hTrustedLearningBoundary,
} from "@/lib/server/canonical-offline-learning-engine-fixtures";
import {
  CANONICAL_CAPTURE_EVIDENCE_VERSION,
  canonicalCaptureEvidenceDigest,
  createCanonicalFrozenTrainingInputManifest,
  createCanonicalFrozenTrainingInputRegistry,
  createCanonicalTrustedFeatureContextRegistry,
  type CanonicalOfflineLearningTrustBoundary,
  type CanonicalTrustedFeatureContextRegistry,
} from "@/lib/server/canonical-offline-learning-trust-registry";

function capturedFeatureDigest(input: {
  feature_id: string;
  value: number;
  observed_at: string;
  source_namespace: string;
  evidence_identity: string;
  evidence_type: string;
}) {
  return canonicalCaptureEvidenceDigest({
    value_kind: "feature",
    value_id: input.feature_id,
    value: input.value,
    observed_at: input.observed_at,
    source_namespace: input.source_namespace,
    evidence_identity: input.evidence_identity,
    evidence_type: input.evidence_type,
  });
}

export function setTrustedFeatureValue(
  request: CanonicalOfflineLearningRequest,
  rowIndex: number,
  featureId: string,
  value: number,
) {
  const captured = request.rows[rowIndex].features[featureId];
  captured.value = value;
  captured.capture_evidence.evidence_version =
    CANONICAL_CAPTURE_EVIDENCE_VERSION;
  captured.capture_evidence.evidence_digest = capturedFeatureDigest({
    feature_id: featureId,
    value,
    observed_at: captured.observed_at,
    source_namespace: captured.source_namespace,
    evidence_identity: captured.capture_evidence.evidence_identity,
    evidence_type: captured.capture_evidence.evidence_type,
  });
}

export function createTrustedBoundaryForRequest(input: {
  request: CanonicalOfflineLearningRequest;
  feature_context_registry?: CanonicalTrustedFeatureContextRegistry;
  expected_feature_root?: string;
  expected_training_root?: string;
}): CanonicalOfflineLearningTrustBoundary {
  const featureRegistry =
    input.feature_context_registry ??
    action666hTrustedFeatureContextRegistry;
  input.request.feature_schema.trusted_registry_root_digest =
    featureRegistry.root_digest;
  input.request.feature_schema.feature_ids =
    featureRegistry.feature_definitions
      .map((definition) => definition.feature_id)
      .sort();
  const manifest = createCanonicalFrozenTrainingInputManifest({
    feature_context_registry_root_digest: featureRegistry.root_digest,
    cohort: input.request.cohort,
    sample_type: input.request.sample_type,
    row_bindings: input.request.rows.map(
      buildCanonicalTrainingInputRowBinding,
    ),
  });
  input.request.trusted_training_input_manifest_identity =
    manifest.manifest_identity;
  const trainingRegistry =
    createCanonicalFrozenTrainingInputRegistry([manifest]);
  return {
    feature_context_registry: featureRegistry,
    training_input_registry: trainingRegistry,
    expected_feature_context_registry_root_digest:
      input.expected_feature_root ?? featureRegistry.root_digest,
    expected_training_input_registry_root_digest:
      input.expected_training_root ?? trainingRegistry.root_digest,
    trust_source: "version_controlled_synthetic_fixture_registry",
  };
}

export const action666hOverlapIsolationRequest = structuredClone(
  action666fTrainableRequest,
);
const trainingOverlapRow = action666hOverlapIsolationRequest.rows[0];
const testOverlapRow = action666hOverlapIsolationRequest.rows[32];
testOverlapRow.opportunity_set_identity =
  trainingOverlapRow.opportunity_set_identity;
testOverlapRow.opportunity_set_digest =
  trainingOverlapRow.opportunity_set_digest;
testOverlapRow.overlap_evidence.evaluator_input_identity =
  trainingOverlapRow.overlap_evidence.evaluator_input_identity;
action666hOverlapIsolationRequest.shadow_evaluation_binding
  .opportunity_set_inventory = Array.from(
  new Set(
    action666hOverlapIsolationRequest.rows.map(
      (row) => row.opportunity_set_identity,
    ),
  ),
).sort();
export const action666hOverlapIsolationBoundary =
  createTrustedBoundaryForRequest({
    request: action666hOverlapIsolationRequest,
  });

export const action666hOutcomeCompletionPurgeRequest = structuredClone(
  action666fTrainableRequest,
);
for (const row of action666hOutcomeCompletionPurgeRequest.rows.filter(
  (item) => item.quality_candidate.decision_day === "2026-06-08",
)) {
  row.overlap_evidence.outcome_completed_at =
    "2026-06-09T14:30:00.000Z";
}
export const action666hOutcomeCompletionPurgeBoundary =
  createTrustedBoundaryForRequest({
    request: action666hOutcomeCompletionPurgeRequest,
  });

export const action666hMissingOutcomeIntervalRequest = structuredClone(
  action666fTrainableRequest,
);
action666hMissingOutcomeIntervalRequest.rows[0].overlap_evidence
  .outcome_interval_end = "";
export const action666hMissingOutcomeIntervalBoundary =
  createTrustedBoundaryForRequest({
    request: action666hMissingOutcomeIntervalRequest,
  });

export const action666hNearZeroVarianceRequest = structuredClone(
  action666fTrainableRequest,
);
for (
  let index = 0;
  index < action666hNearZeroVarianceRequest.rows.length;
  index += 1
) {
  setTrustedFeatureValue(
    action666hNearZeroVarianceRequest,
    index,
    "irrelevant_noise",
    1 + (index % 2) * Number.EPSILON,
  );
}
export const action666hNearZeroVarianceBoundary =
  createTrustedBoundaryForRequest({
    request: action666hNearZeroVarianceRequest,
  });

export const action666hCorrelatedFeaturesRequest = structuredClone(
  action666fTrainableRequest,
);
for (
  let index = 0;
  index < action666hCorrelatedFeaturesRequest.rows.length;
  index += 1
) {
  setTrustedFeatureValue(
    action666hCorrelatedFeaturesRequest,
    index,
    "interaction_b",
    action666hCorrelatedFeaturesRequest.rows[index].features
      .interaction_a.value,
  );
}
export const action666hCorrelatedFeaturesBoundary =
  createTrustedBoundaryForRequest({
    request: action666hCorrelatedFeaturesRequest,
  });

export const action666hUnderflowRequest = structuredClone(
  action666fTrainableRequest,
);
for (
  let index = 0;
  index < action666hUnderflowRequest.rows.length;
  index += 1
) {
  setTrustedFeatureValue(
    action666hUnderflowRequest,
    index,
    "irrelevant_noise",
    index % 2 === 0 ? Number.MIN_VALUE : -Number.MIN_VALUE,
  );
}
export const action666hUnderflowBoundary = createTrustedBoundaryForRequest({
  request: action666hUnderflowRequest,
});

const wideNumericRegistry = createCanonicalTrustedFeatureContextRegistry({
  feature_definitions:
    action666hTrustedFeatureContextRegistry.feature_definitions.map(
      (definition) =>
        definition.feature_id === "true_signal"
          ? {
              ...definition,
              minimum: -Number.MAX_VALUE,
              maximum: Number.MAX_VALUE,
            }
          : definition,
    ),
  context_definitions:
    action666hTrustedFeatureContextRegistry.context_definitions,
  compatibility_policy:
    action666hTrustedFeatureContextRegistry.compatibility_policy,
});

export const action666hNumericOverflowRequest = structuredClone(
  action666fTrainableRequest,
);
setTrustedFeatureValue(
  action666hNumericOverflowRequest,
  0,
  "true_signal",
  Number.MAX_VALUE,
);
setTrustedFeatureValue(
  action666hNumericOverflowRequest,
  1,
  "true_signal",
  Number.MAX_VALUE,
);
export const action666hNumericOverflowBoundary =
  createTrustedBoundaryForRequest({
    request: action666hNumericOverflowRequest,
    feature_context_registry: wideNumericRegistry,
  });

export const action666hNumericMinimumRequest = structuredClone(
  action666fTrainableRequest,
);
setTrustedFeatureValue(
  action666hNumericMinimumRequest,
  0,
  "true_signal",
  -Number.MAX_VALUE,
);
export const action666hNumericMinimumBoundary =
  createTrustedBoundaryForRequest({
    request: action666hNumericMinimumRequest,
    feature_context_registry: wideNumericRegistry,
  });

export const action666hSelfConsistentMaliciousRequest = structuredClone(
  action666fTrainableRequest,
);
setTrustedFeatureValue(
  action666hSelfConsistentMaliciousRequest,
  0,
  "true_signal",
  action666hSelfConsistentMaliciousRequest.rows[0].features.true_signal
    .value + 0.5,
);
action666hSelfConsistentMaliciousRequest.rows[0].quality_candidate
  .terminal_outcome = "target_before_stop";
action666hSelfConsistentMaliciousRequest.rows[0].quality_candidate
  .target_before_stop = "yes";
action666hSelfConsistentMaliciousRequest.rows[0].quality_candidate.r_result =
  2.5;
action666hSelfConsistentMaliciousRequest.rows[0].overlap_evidence
  .evaluator_input_identity = "malicious-recomputed-evaluator-input";
export const action666hSelfConsistentMaliciousBoundary =
  createTrustedBoundaryForRequest({
    request: action666hSelfConsistentMaliciousRequest,
    expected_training_root:
      action666hTrustedLearningBoundary
        .expected_training_input_registry_root_digest,
  });

export const action666hUnknownRenamedFeatureRequest = structuredClone(
  action666fTrainableRequest,
);
action666hUnknownRenamedFeatureRequest.feature_schema.feature_ids =
  action666hUnknownRenamedFeatureRequest.feature_schema.feature_ids.map(
    (featureId) =>
      featureId === "true_signal" ? "renamed_alpha" : featureId,
  );
for (const row of action666hUnknownRenamedFeatureRequest.rows) {
  row.features.renamed_alpha = row.features.true_signal;
  delete row.features.true_signal;
}

export const action666hTamperedRegistry = structuredClone(
  action666hTrustedFeatureContextRegistry,
);
action666hTamperedRegistry.feature_definitions[0].unit =
  "semantically_changed_unit";
