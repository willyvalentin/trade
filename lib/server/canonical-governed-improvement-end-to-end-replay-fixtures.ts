import "server-only";

import {
  action666ajAuthority,
  action666ajCaptureRequest,
  action666ajCapturedRequest,
  action666ajEmptyCaptureBindingLookup,
  action666ajEmptyPreviousBindingLookup,
  action666ajMissingProducerOutputRequest,
  action666ajTrustRootSubstitutionRequest,
  action666ajVersionDriftRequest,
} from "@/lib/server/canonical-completed-improvement-evidence-capture-fixtures";
import {
  CANONICAL_GOVERNED_IMPROVEMENT_END_TO_END_REQUEST_VERSION,
  type CanonicalGovernedImprovementEndToEndDependencies,
  type CanonicalGovernedImprovementEndToEndRequest,
  type CanonicalGovernedImprovementUntrustedStageProjection,
} from "@/lib/server/canonical-governed-improvement-end-to-end-replay";
import {
  type CanonicalCompletedImprovementCaptureRequest,
} from "@/lib/server/canonical-completed-improvement-evidence-capture";
import {
  canonicalModelImprovementDigest,
  type CanonicalModelImprovementPreviousBindingLookup,
} from "@/lib/server/canonical-model-improvement-proposal";
import {
  action666vCalibrationRegressionFixture,
  action666vInsufficientFixture,
  action666vNoChangeFixture,
  action666vStableImprovementFixture,
} from "@/lib/server/canonical-model-improvement-proposal-fixtures";

type StableFixture = typeof action666vStableImprovementFixture;

export const action666aqEmptyPreviousBindingLookup =
  action666ajEmptyPreviousBindingLookup;
export const action666aqEmptyCaptureBindingLookup =
  action666ajEmptyCaptureBindingLookup;

export const action666aqPreviousBindingCollisionLookup = {
  lookup_proposal_binding: () => ({
    semantic_digest: "c".repeat(64),
  }),
  lookup_experiment_binding: () => ({
    semantic_digest: "d".repeat(64),
  }),
} satisfies CanonicalModelImprovementPreviousBindingLookup;

export const action666aqThrowingPreviousBindingLookup = {
  lookup_proposal_binding: () => {
    throw new Error("synthetic_backend_detail_must_not_escape");
  },
  lookup_experiment_binding: () => {
    throw new Error("different_backend_detail_must_not_escape");
  },
} satisfies CanonicalModelImprovementPreviousBindingLookup;

export function action666aqMatchingPreviousBindingLookup(
  fixture: StableFixture = action666vStableImprovementFixture,
): CanonicalModelImprovementPreviousBindingLookup {
  const proposalBindings = new Map(
    fixture.post.payload.proposal_candidates.map((proposal) => [
      proposal.proposal_identity,
      proposal.semantic_digest,
    ]),
  );
  const experimentPlan = fixture.post.payload.experiment_plan;
  return {
    lookup_proposal_binding: (identity) => {
      const semanticDigest = proposalBindings.get(identity);
      return semanticDigest ? { semantic_digest: semanticDigest } : null;
    },
    lookup_experiment_binding: (identity) =>
      experimentPlan?.plan_identity === identity
        ? { semantic_digest: experimentPlan.semantic_digest }
        : null,
  };
}

function asStableFixture(value: unknown) {
  return value as StableFixture;
}

function requestFromCapture(
  completedCaptureRequest: CanonicalCompletedImprovementCaptureRequest,
): CanonicalGovernedImprovementEndToEndRequest {
  return {
    request_version:
      CANONICAL_GOVERNED_IMPROVEMENT_END_TO_END_REQUEST_VERSION,
    source_namespace: "completed_governed_improvement_replay_input",
    completed_capture_request: completedCaptureRequest,
  };
}

export function action666aqDependencies(
  fixture: StableFixture = action666vStableImprovementFixture,
  overrides: Partial<CanonicalGovernedImprovementEndToEndDependencies> = {},
): CanonicalGovernedImprovementEndToEndDependencies {
  return {
    capture_authority: action666ajAuthority(fixture),
    capture_previous_binding_lookup: action666aqEmptyPreviousBindingLookup,
    adapter_previous_binding_lookup: action666aqEmptyPreviousBindingLookup,
    proposal_previous_binding_lookup: action666aqEmptyPreviousBindingLookup,
    capture_binding_lookup: action666aqEmptyCaptureBindingLookup,
    ...overrides,
  };
}

export const action666aqProposalReadyRequest = requestFromCapture(
  action666ajCapturedRequest,
);
export const action666aqNoChangeRequest = requestFromCapture(
  action666ajCaptureRequest(
    asStableFixture(action666vNoChangeFixture),
  ),
);
export const action666aqResearchOnlyRequest = requestFromCapture(
  action666ajCaptureRequest(
    asStableFixture(action666vCalibrationRegressionFixture),
  ),
);
export const action666aqInsufficientEvidenceRequest = requestFromCapture(
  action666ajCaptureRequest(
    asStableFixture(action666vInsufficientFixture),
  ),
);
export const action666aqIncompleteCaptureRequest = requestFromCapture(
  action666ajMissingProducerOutputRequest(),
);
export const action666aqConflictingCaptureRequest = requestFromCapture(
  action666ajVersionDriftRequest(),
);
export const action666aqCaptureTrustRootDriftRequest = requestFromCapture(
  action666ajTrustRootSubstitutionRequest(),
);

export const action666aqStableDependencies = action666aqDependencies();
export const action666aqNoChangeDependencies = action666aqDependencies(
  asStableFixture(action666vNoChangeFixture),
);
export const action666aqResearchOnlyDependencies = action666aqDependencies(
  asStableFixture(action666vCalibrationRegressionFixture),
);
export const action666aqInsufficientEvidenceDependencies =
  action666aqDependencies(
    asStableFixture(action666vInsufficientFixture),
  );
export const action666aqAdapterConflictDependencies = action666aqDependencies(
  action666vStableImprovementFixture,
  {
    adapter_previous_binding_lookup:
      action666aqPreviousBindingCollisionLookup,
  },
);
export const action666aqAdapterUnmappableDependencies =
  action666aqDependencies(action666vStableImprovementFixture, {
    adapter_previous_binding_lookup:
      action666aqThrowingPreviousBindingLookup,
  });
export const action666aqCapturePreviousBindingCollisionDependencies =
  action666aqDependencies(action666vStableImprovementFixture, {
    capture_previous_binding_lookup:
      action666aqPreviousBindingCollisionLookup,
  });
export const action666aqMatchingStageBindingDependencies =
  action666aqDependencies(action666vStableImprovementFixture, {
    adapter_previous_binding_lookup:
      action666aqMatchingPreviousBindingLookup(),
    proposal_previous_binding_lookup:
      action666aqMatchingPreviousBindingLookup(),
  });

export function action666aqReorderedRequest() {
  const request = structuredClone(action666aqProposalReadyRequest);
  request.completed_capture_request = Object.fromEntries(
    Object.entries(request.completed_capture_request).reverse(),
  ) as CanonicalCompletedImprovementCaptureRequest;
  return Object.fromEntries(
    Object.entries(request).reverse(),
  ) as CanonicalGovernedImprovementEndToEndRequest;
}

export function action666aqCallerAuthorityRequest() {
  return {
    ...action666aqProposalReadyRequest,
    verified: true,
    complete: true,
    mapped: true,
    proposal_ready: true,
    approved: true,
  } as CanonicalGovernedImprovementEndToEndRequest & {
    verified: boolean;
    complete: boolean;
    mapped: boolean;
    proposal_ready: boolean;
    approved: boolean;
  };
}

export function action666aqCaptureTrustRootProjection():
  CanonicalGovernedImprovementUntrustedStageProjection {
  return {
    capture: (canonical) => {
      const result = structuredClone(canonical);
      if (result.status === "captured") {
        result.capture.proposal_registry_root_digest = "a".repeat(64);
        result.capture.capture_digest = canonicalModelImprovementDigest({
          self_consistent_alternative_capture: result.capture,
        });
      }
      result.terminal_result_digest = canonicalModelImprovementDigest({
        self_consistent_alternative_terminal: result,
      });
      return result;
    },
  };
}

export function action666aqAdapterTrustRootProjection():
  CanonicalGovernedImprovementUntrustedStageProjection {
  return {
    adapter: (canonical) => {
      const result = structuredClone(canonical);
      result.input_projection.registry_root_digest = "b".repeat(64);
      result.input_projection.projection_digest =
        canonicalModelImprovementDigest({
          self_consistent_alternative_adapter_projection:
            result.input_projection,
        });
      result.replay_digest = canonicalModelImprovementDigest({
        self_consistent_alternative_adapter: result,
      });
      return result;
    },
  };
}

export function action666aqProposalTrustRootProjection():
  CanonicalGovernedImprovementUntrustedStageProjection {
  return {
    proposal: (canonical) => {
      const result = structuredClone(canonical);
      if (result.proposal) {
        result.proposal.trusted_registry_root_digest = "c".repeat(64);
        result.proposal.canonical_proposal_digest =
          canonicalModelImprovementDigest({
            self_consistent_alternative_proposal: result.proposal,
          });
      }
      return result;
    },
  };
}

export const action666aqGoldenScenarios = [
  {
    name: "captured_mapped_proposal_ready",
    request: action666aqProposalReadyRequest,
    dependencies: action666aqStableDependencies,
    expected_status: "completed",
    expected_proposal_status: "proposal_ready",
  },
  {
    name: "captured_mapped_no_change",
    request: action666aqNoChangeRequest,
    dependencies: action666aqNoChangeDependencies,
    expected_status: "completed",
    expected_proposal_status: "no_change",
  },
  {
    name: "incomplete_capture",
    request: action666aqIncompleteCaptureRequest,
    dependencies: action666aqStableDependencies,
    expected_status: "incomplete",
    expected_proposal_status: null,
  },
  {
    name: "capture_conflict",
    request: action666aqConflictingCaptureRequest,
    dependencies: action666aqStableDependencies,
    expected_status: "conflicting",
    expected_proposal_status: null,
  },
  {
    name: "adapter_conflict",
    request: action666aqProposalReadyRequest,
    dependencies: action666aqAdapterConflictDependencies,
    expected_status: "conflicting",
    expected_proposal_status: null,
  },
  {
    name: "adapter_unmappable",
    request: action666aqProposalReadyRequest,
    dependencies: action666aqAdapterUnmappableDependencies,
    expected_status: "incomplete",
    expected_proposal_status: null,
  },
  {
    name: "proposal_research_only",
    request: action666aqResearchOnlyRequest,
    dependencies: action666aqResearchOnlyDependencies,
    expected_status: "completed",
    expected_proposal_status: "research_only",
  },
  {
    name: "proposal_insufficient_evidence",
    request: action666aqInsufficientEvidenceRequest,
    dependencies: action666aqInsufficientEvidenceDependencies,
    expected_status: "completed",
    expected_proposal_status: "insufficient_evidence",
  },
  {
    name: "capture_trust_root_drift",
    request: action666aqCaptureTrustRootDriftRequest,
    dependencies: action666aqStableDependencies,
    expected_status: "conflicting",
    expected_proposal_status: null,
  },
  {
    name: "previous_binding_collision",
    request: action666aqProposalReadyRequest,
    dependencies:
      action666aqCapturePreviousBindingCollisionDependencies,
    expected_status: "conflicting",
    expected_proposal_status: null,
  },
] as const;
