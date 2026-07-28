import "server-only";

import {
  canonicalModelImprovementDigest,
  type CanonicalModelImprovementPreviousBindingLookup,
} from "@/lib/server/canonical-model-improvement-proposal";
import {
  verifyAndProjectCanonicalModelImprovementUpstreams,
  type CanonicalModelImprovementUpstreamSources,
} from "@/lib/server/canonical-model-improvement-upstream-verification";
import {
  action666vNoChangeFixture,
  action666vStableImprovementFixture,
} from "@/lib/server/canonical-model-improvement-proposal-fixtures";
import {
  CANONICAL_COMPLETED_IMPROVEMENT_CAPTURE_REQUEST_VERSION,
  canonicalCompletedImprovementOutcomeLineageDigest,
  canonicalCompletedImprovementProtectedMetricDigest,
  canonicalCompletedImprovementProviderContextDigest,
  createCanonicalCompletedImprovementCaptureAuthority,
  type CanonicalCompletedImprovementCaptureAuthority,
  type CanonicalCompletedImprovementCaptureBindingLookup,
  type CanonicalCompletedImprovementCaptureRequest,
} from "@/lib/server/canonical-completed-improvement-evidence-capture";

type SourceFixture = typeof action666vStableImprovementFixture;

export const action666ajEmptyPreviousBindingLookup = {
  lookup_proposal_binding: () => null,
  lookup_experiment_binding: () => null,
} satisfies CanonicalModelImprovementPreviousBindingLookup;

export const action666ajEmptyCaptureBindingLookup = {
  lookup_capture_binding: () => null,
} satisfies CanonicalCompletedImprovementCaptureBindingLookup;

export const action666ajPreviousBindingCollisionLookup = {
  lookup_proposal_binding: () => ({
    semantic_digest: "c".repeat(64),
  }),
  lookup_experiment_binding: () => ({
    semantic_digest: "d".repeat(64),
  }),
} satisfies CanonicalModelImprovementPreviousBindingLookup;

export const action666ajCaptureIdentityCollisionLookup = {
  lookup_capture_binding: () => ({
    semantic_digest: "e".repeat(64),
  }),
} satisfies CanonicalCompletedImprovementCaptureBindingLookup;

export function action666ajAuthority(
  fixture: SourceFixture,
): CanonicalCompletedImprovementCaptureAuthority {
  return createCanonicalCompletedImprovementCaptureAuthority(
    fixture.trustBoundary,
  );
}

export function action666ajCaptureRequest(
  fixture: SourceFixture,
): CanonicalCompletedImprovementCaptureRequest {
  const verification = verifyAndProjectCanonicalModelImprovementUpstreams(
    fixture.post.payload.upstream_sources,
  );
  if (verification.status !== "verified") {
    throw new Error("action_666aj_fixture_upstream_not_verified");
  }
  const projection = verification.projection;
  const evidence = fixture.post.payload.evidence;
  return {
    request_version:
      CANONICAL_COMPLETED_IMPROVEMENT_CAPTURE_REQUEST_VERSION,
    source_namespace: "completed_improvement_capture_inputs",
    producer_capture_identity: `action-666aj:producer:${fixture.name}`,
    completed_at: "2026-07-28T12:00:00.000000000Z",
    trusted_input_identity: fixture.post.trusted_input_identity,
    trusted_input_digest: fixture.post.semantic_digest,
    expected_registry_root_digest: fixture.trustBoundary.registry.root_digest,
    declared_bindings: {
      cohort: projection.quality.cohort,
      period: structuredClone(projection.quality.period),
      baseline_versions: structuredClone(
        evidence.shadow_evaluation.baseline_versions,
      ),
      candidate_versions: structuredClone(
        evidence.shadow_evaluation.candidate_versions,
      ),
      quality_metric_inventory_digest:
        evidence.quality_metrics.metric_inventory.inventory_digest,
      protected_metric_inventory_digest:
        canonicalCompletedImprovementProtectedMetricDigest(fixture.post),
      opportunity_membership_digest:
        projection.namespace_digests.opportunity_sets,
      outcome_evaluator_lineage_digest:
        canonicalCompletedImprovementOutcomeLineageDigest(
          fixture.post.payload.upstream_sources,
        ),
      provider_context_provenance_digest:
        canonicalCompletedImprovementProviderContextDigest(
          fixture.post.payload.upstream_sources,
        ),
      point_in_time_evidence_digest: projection.temporal_evidence_digest,
    },
    source_artifact_digests: structuredClone(projection.namespace_digests),
    upstream_sources: fixture.post.payload.upstream_sources,
  };
}

function clonedRequest(
  source: CanonicalCompletedImprovementCaptureRequest,
) {
  return structuredClone(source);
}

export const action666ajStableAuthority = action666ajAuthority(
  action666vStableImprovementFixture,
);
export const action666ajNoChangeAuthority = action666ajAuthority(
  action666vNoChangeFixture as SourceFixture,
);
export const action666ajCapturedRequest = action666ajCaptureRequest(
  action666vStableImprovementFixture,
);
export const action666ajNoChangeRequest = action666ajCaptureRequest(
  action666vNoChangeFixture as SourceFixture,
);

export function action666ajMissingProducerOutputRequest() {
  const request = clonedRequest(action666ajCapturedRequest);
  request.producer_capture_identity =
    "action-666aj:producer:missing-output";
  (
    request.upstream_sources as unknown as Record<string, unknown>
  ).learning = undefined;
  return request;
}

export function action666ajMembershipMismatchRequest() {
  const request = clonedRequest(action666ajCapturedRequest);
  request.producer_capture_identity =
    "action-666aj:producer:membership-mismatch";
  request.upstream_sources.opportunity_sets[0].candidates.pop();
  return request;
}

export function action666ajVersionDriftRequest() {
  const request = clonedRequest(action666ajCapturedRequest);
  request.producer_capture_identity =
    "action-666aj:producer:version-drift";
  request.declared_bindings.candidate_versions.ranking =
    "caller-substituted-ranking-version";
  return request;
}

export function action666ajOutcomeLineageConflictRequest() {
  const request = clonedRequest(action666ajCapturedRequest);
  request.producer_capture_identity =
    "action-666aj:producer:outcome-lineage-conflict";
  request.upstream_sources.opportunity_sets[0].candidates[0]
    .expected_outcome_lineage.expected_outcome_lineage_key =
    "tampered:outcome-lineage";
  return request;
}

export function action666ajProviderContextMismatchRequest() {
  const request = clonedRequest(action666ajCapturedRequest);
  request.producer_capture_identity =
    "action-666aj:producer:provider-context-mismatch";
  request.declared_bindings.provider_context_provenance_digest =
    "a".repeat(64);
  return request;
}

export function action666ajPointInTimeViolationRequest() {
  const request = clonedRequest(action666ajCapturedRequest);
  request.producer_capture_identity =
    "action-666aj:producer:point-in-time-violation";
  request.completed_at = "2026-01-01T00:00:00.000000000Z";
  return request;
}

export function action666ajTrustRootSubstitutionRequest() {
  const request = clonedRequest(action666ajCapturedRequest);
  request.producer_capture_identity =
    "action-666aj:producer:trust-root-substitution";
  request.expected_registry_root_digest = "b".repeat(64);
  return request;
}

export function action666ajReorderedRequest() {
  return Object.fromEntries(
    Object.entries(action666ajCapturedRequest).reverse(),
  ) as CanonicalCompletedImprovementCaptureRequest;
}

export function action666ajCallerAuthorityRequest() {
  return {
    ...action666ajCapturedRequest,
    verified: true,
    complete: true,
    comparable: true,
    out_of_sample: true,
    point_in_time_safe: true,
    reproducible: true,
  } as CanonicalCompletedImprovementCaptureRequest & {
    verified: boolean;
    complete: boolean;
    comparable: boolean;
    out_of_sample: boolean;
    point_in_time_safe: boolean;
    reproducible: boolean;
  };
}

export function action666ajSelfConsistentUpstreamTamperingRequest() {
  const request = clonedRequest(action666ajCapturedRequest);
  request.producer_capture_identity =
    "action-666aj:producer:self-consistent-upstream-tampering";
  const candidate =
    request.upstream_sources.opportunity_sets[0].candidates[0];
  candidate.context.regime = "tampered-regime";
  request.declared_bindings.outcome_evaluator_lineage_digest =
    canonicalCompletedImprovementOutcomeLineageDigest(
      request.upstream_sources,
    );
  request.declared_bindings.provider_context_provenance_digest =
    canonicalCompletedImprovementProviderContextDigest(
      request.upstream_sources,
    );
  request.source_artifact_digests.opportunity_sets =
    canonicalModelImprovementDigest({
      tampered_recomputed_opportunity_set: true,
    });
  return request;
}

export const action666ajGoldenScenarios = [
  {
    name: "complete_captured",
    request: action666ajCapturedRequest,
    authority: action666ajStableAuthority,
    previous_binding_lookup: action666ajEmptyPreviousBindingLookup,
    capture_binding_lookup: action666ajEmptyCaptureBindingLookup,
    expected_status: "captured",
  },
  {
    name: "explicit_no_change",
    request: action666ajNoChangeRequest,
    authority: action666ajNoChangeAuthority,
    previous_binding_lookup: action666ajEmptyPreviousBindingLookup,
    capture_binding_lookup: action666ajEmptyCaptureBindingLookup,
    expected_status: "captured",
  },
  {
    name: "missing_producer_output",
    request: action666ajMissingProducerOutputRequest(),
    authority: action666ajStableAuthority,
    previous_binding_lookup: action666ajEmptyPreviousBindingLookup,
    capture_binding_lookup: action666ajEmptyCaptureBindingLookup,
    expected_status: "incomplete",
  },
  {
    name: "membership_mismatch",
    request: action666ajMembershipMismatchRequest(),
    authority: action666ajStableAuthority,
    previous_binding_lookup: action666ajEmptyPreviousBindingLookup,
    capture_binding_lookup: action666ajEmptyCaptureBindingLookup,
    expected_status: "incomplete",
  },
  {
    name: "version_drift",
    request: action666ajVersionDriftRequest(),
    authority: action666ajStableAuthority,
    previous_binding_lookup: action666ajEmptyPreviousBindingLookup,
    capture_binding_lookup: action666ajEmptyCaptureBindingLookup,
    expected_status: "conflicting",
  },
  {
    name: "outcome_lineage_conflict",
    request: action666ajOutcomeLineageConflictRequest(),
    authority: action666ajStableAuthority,
    previous_binding_lookup: action666ajEmptyPreviousBindingLookup,
    capture_binding_lookup: action666ajEmptyCaptureBindingLookup,
    expected_status: "conflicting",
  },
  {
    name: "provider_context_mismatch",
    request: action666ajProviderContextMismatchRequest(),
    authority: action666ajStableAuthority,
    previous_binding_lookup: action666ajEmptyPreviousBindingLookup,
    capture_binding_lookup: action666ajEmptyCaptureBindingLookup,
    expected_status: "conflicting",
  },
  {
    name: "point_in_time_violation",
    request: action666ajPointInTimeViolationRequest(),
    authority: action666ajStableAuthority,
    previous_binding_lookup: action666ajEmptyPreviousBindingLookup,
    capture_binding_lookup: action666ajEmptyCaptureBindingLookup,
    expected_status: "conflicting",
  },
  {
    name: "trust_root_substitution",
    request: action666ajTrustRootSubstitutionRequest(),
    authority: action666ajStableAuthority,
    previous_binding_lookup: action666ajEmptyPreviousBindingLookup,
    capture_binding_lookup: action666ajEmptyCaptureBindingLookup,
    expected_status: "conflicting",
  },
  {
    name: "duplicate_capture_identity",
    request: action666ajCapturedRequest,
    authority: action666ajStableAuthority,
    previous_binding_lookup: action666ajEmptyPreviousBindingLookup,
    capture_binding_lookup: action666ajCaptureIdentityCollisionLookup,
    expected_status: "conflicting",
  },
  {
    name: "previous_binding_collision",
    request: action666ajCapturedRequest,
    authority: action666ajStableAuthority,
    previous_binding_lookup: action666ajPreviousBindingCollisionLookup,
    capture_binding_lookup: action666ajEmptyCaptureBindingLookup,
    expected_status: "conflicting",
  },
  {
    name: "caller_authority_fields",
    request: action666ajCallerAuthorityRequest(),
    authority: action666ajStableAuthority,
    previous_binding_lookup: action666ajEmptyPreviousBindingLookup,
    capture_binding_lookup: action666ajEmptyCaptureBindingLookup,
    expected_status: "conflicting",
  },
  {
    name: "self_consistent_upstream_tampering",
    request: action666ajSelfConsistentUpstreamTamperingRequest(),
    authority: action666ajStableAuthority,
    previous_binding_lookup: action666ajEmptyPreviousBindingLookup,
    capture_binding_lookup: action666ajEmptyCaptureBindingLookup,
    expected_status: "conflicting",
  },
] as const;

export function action666ajCloneUpstreamSources(
  sources: CanonicalModelImprovementUpstreamSources,
) {
  return structuredClone(sources);
}
