import "server-only";

import {
  action666ajAuthority,
  action666ajCapturedRequest,
} from "@/lib/server/canonical-completed-improvement-evidence-capture-fixtures";
import {
  action666bdRequest,
} from "@/lib/server/canonical-governed-binding-snapshot-admission-fixtures";
import {
  type CanonicalExternalImprovementBindingSnapshot,
} from "@/lib/server/canonical-governed-binding-snapshot-admission";
import {
  action666axEmptyOwnerDependency,
  action666axOwnerDependency,
  action666axPreviousBindingSnapshot,
  action666axPreviousCollisionSnapshot,
} from "@/lib/server/canonical-improvement-binding-store-fixtures";
import {
  canonicalModelImprovementDigest,
} from "@/lib/server/canonical-model-improvement-proposal";
import {
  action666vStableImprovementFixture,
} from "@/lib/server/canonical-model-improvement-proposal-fixtures";
import {
  CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_REQUEST_VERSION,
  canonicalGovernedBindingSnapshotIssuanceSemanticScopeDigest,
  createCanonicalGovernedBindingSnapshotIssuanceHarness,
  createCanonicalGovernedBindingSnapshotIssuerAuthority,
  type CanonicalGovernedBindingSnapshotIssuanceDependencies,
  type CanonicalGovernedBindingSnapshotIssuanceRequest,
  type CanonicalGovernedBindingSnapshotIssuerAuthority,
} from "@/lib/server/canonical-governed-binding-snapshot-issuance-successor";

export const action666bqIssuanceIdentity =
  "issuance:synthetic-governed-improvement:20260730:1";
export const action666bqOwnerBoundaryIdentity =
  "owner-boundary:governed-binding-issuance-successor";
export const action666bqIssuerAuthorityIdentity =
  "authority:governed-binding-issuance-successor";
export const action666bqIssuerIdentity =
  "issuer:governed-binding-snapshot-successor";
export const action666bqExternalOwnerIdentity =
  "owner:governed-binding-snapshot-successor";
export const action666bqIssuedAt =
  "2026-07-28T10:00:00.000000000Z";
export const action666bqEvidenceCutoff =
  "2026-07-28T09:59:59.999999999Z";
export const action666bqEffectiveAt =
  "2026-07-28T10:00:00.000000000Z";

const captureAuthority = action666ajAuthority(
  action666vStableImprovementFixture,
);
const proposal =
  action666vStableImprovementFixture.post.payload.proposal_candidates[0];
const experiment =
  action666vStableImprovementFixture.post.payload.experiment_plan;
const sourceSectionDigest = canonicalModelImprovementDigest({
  source_namespace: "action_666bq_synthetic_issuance_source",
  source_contract_version:
    "action_666bq_synthetic_issuance_source_v1",
});

export const action666bqRequest: CanonicalGovernedBindingSnapshotIssuanceRequest =
  {
    request_version:
      CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_REQUEST_VERSION,
    source_namespace:
      "completed_governed_binding_snapshot_issuance",
    issuance_identity: action666bqIssuanceIdentity,
    binding_backed_replay_request: action666bdRequest(),
  };

export function action666bqAuthority(
  overrides: Partial<{
    publication_sequence: number;
    publication_epoch: number;
    predecessor: CanonicalExternalImprovementBindingSnapshot["predecessor"];
    issued_at: string;
    evidence_cutoff: string;
    effective_at: string;
  }> = {},
) {
  const bindingPlan = [
    {
      entry_type: "previous_binding" as const,
      bound_identity_type: "proposal" as const,
      bound_identity: proposal.proposal_identity,
      expected_binding_digest: proposal.semantic_digest,
      source_evidence_namespace:
        "canonical_previous_binding_evidence" as const,
      source_section_digest: sourceSectionDigest,
    },
    ...(experiment
      ? [
          {
            entry_type: "previous_binding" as const,
            bound_identity_type: "experiment" as const,
            bound_identity: experiment.plan_identity,
            expected_binding_digest: experiment.semantic_digest,
            source_evidence_namespace:
              "canonical_previous_binding_evidence" as const,
            source_section_digest: sourceSectionDigest,
          },
        ]
      : []),
    {
      entry_type: "capture_binding" as const,
      bound_identity_type: "capture" as const,
      bound_identity:
        action666ajCapturedRequest.producer_capture_identity,
      expected_binding_digest: canonicalModelImprovementDigest(
        action666ajCapturedRequest,
      ),
      source_evidence_namespace:
        "canonical_capture_binding_evidence" as const,
      source_section_digest: sourceSectionDigest,
    },
  ];
  return createCanonicalGovernedBindingSnapshotIssuerAuthority({
    authority_identity: action666bqIssuerAuthorityIdentity,
    owner_boundary_identity: action666bqOwnerBoundaryIdentity,
    external_owner_identity: action666bqExternalOwnerIdentity,
    issuer_identity: action666bqIssuerIdentity,
    issuer_implementation_version:
      "governed-binding-snapshot-issuer-successor-v3",
    issuer_authority_anchor: canonicalModelImprovementDigest({
      owner: action666bqExternalOwnerIdentity,
      version: "v3",
    }),
    registry_authority_identity:
      captureAuthority.proposal_registry_authority_identity,
    authority_manifest_digest:
      captureAuthority.proposal_registry_manifest_digest,
    authority_root_digest:
      captureAuthority.proposal_registry_root_digest,
    publication_sequence: overrides.publication_sequence ?? 1,
    publication_epoch: overrides.publication_epoch ?? 1,
    predecessor: overrides.predecessor ?? {
      state: "genesis",
      previous_snapshot_digest: null,
      previous_publication_sequence: null,
      previous_publication_epoch: null,
    },
    issued_at: overrides.issued_at ?? action666bqIssuedAt,
    evidence_cutoff:
      overrides.evidence_cutoff ?? action666bqEvidenceCutoff,
    effective_at: overrides.effective_at ?? action666bqEffectiveAt,
    binding_plan: bindingPlan,
    semantic_scope_digest:
      canonicalGovernedBindingSnapshotIssuanceSemanticScopeDigest(
        action666bqRequest,
      ),
    expected_request_identity: action666bqIssuanceIdentity,
  });
}

export function action666bqDependencies(
  overrides: Partial<{
    authority: CanonicalGovernedBindingSnapshotIssuerAuthority;
    minimum_publication_epoch: number;
    ax_owner_dependency: typeof action666axEmptyOwnerDependency;
  }> = {},
): CanonicalGovernedBindingSnapshotIssuanceDependencies {
  const authority = overrides.authority ?? action666bqAuthority();
  return {
    issuer_authority_dependency: {
      owner_boundary_version:
        "canonical_governed_binding_snapshot_issuer_owner_boundary_v3",
      owner_boundary_identity: action666bqOwnerBoundaryIdentity,
      minimum_publication_epoch:
        overrides.minimum_publication_epoch ?? 1,
      read_expected_authority: () => authority,
    },
    ax_owner_dependency:
      overrides.ax_owner_dependency ??
      action666axEmptyOwnerDependency,
    capture_authority: captureAuthority,
  };
}

export function action666bqIssue(
  request: unknown = action666bqRequest,
  dependencies = action666bqDependencies(),
) {
  const harness =
    createCanonicalGovernedBindingSnapshotIssuanceHarness({
      enabled: true,
      kill_switch_engaged: false,
      dependencies,
    });
  if (!harness.issue) throw new Error("action_666bq_issuer_unavailable");
  return harness.issue(request);
}

export function action666bqMatchingDependencies() {
  return action666bqDependencies({
    ax_owner_dependency: action666axOwnerDependency(
      action666axPreviousBindingSnapshot,
    ),
  });
}

export function action666bqCollisionDependencies() {
  const snapshot = action666axPreviousCollisionSnapshot();
  return action666bqDependencies({
    ax_owner_dependency: action666axOwnerDependency(snapshot),
  });
}

export function action666bqRollbackDependencies() {
  return action666bqDependencies({
    minimum_publication_epoch: 2,
  });
}

export function action666bqFutureAuthority() {
  return action666bqAuthority({
    issued_at: "2026-07-29T13:00:00.000000000Z",
    evidence_cutoff: "2026-07-29T12:59:59.999999999Z",
    effective_at: "2026-07-29T13:00:00.000000000Z",
  });
}

export function action666bqSelfConsistentReplacementDependencies() {
  const authority = structuredClone(action666bqAuthority());
  authority.authority_root_digest = "f".repeat(64);
  const payload = structuredClone(authority);
  delete (
    payload as Partial<CanonicalGovernedBindingSnapshotIssuerAuthority>
  ).authority_digest;
  authority.authority_digest = canonicalModelImprovementDigest(payload);
  return action666bqDependencies({ authority });
}

export function action666bqReorderedRequest() {
  return Object.fromEntries(
    Object.entries(structuredClone(action666bqRequest)).reverse(),
  );
}

export function action666bqMalformedExtraRequest(marker: string) {
  return {
    ...structuredClone(action666bqRequest),
    caller_asserted_verified: marker,
  };
}

export const action666bqGoldenScenarioNames = [
  "issued_empty_store",
  "issued_matching_previous_bindings",
  "binding_collision",
  "rollback_rejected",
  "not_point_in_time_safe",
  "authority_root_substitution",
  "malformed_request",
  "reordered_input",
] as const;
