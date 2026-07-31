import "server-only";

import {
  action666bqAuthority,
  action666bqDependencies,
  action666bqRequest,
} from "@/lib/server/canonical-governed-binding-snapshot-issuance-successor-fixtures";
import {
  canonicalGovernedBindingSnapshotIssuanceSemanticScopeDigest,
  createCanonicalGovernedBindingSnapshotIssuanceHarness,
  createCanonicalGovernedBindingSnapshotIssuerAuthority,
} from "@/lib/server/canonical-governed-binding-snapshot-issuance-successor";
import {
  CANONICAL_NON_FORGEABLE_AUTHORITY_PINNED_ANCHOR,
  CANONICAL_NON_FORGEABLE_AUTHORITY_PINNED_ROOT,
  CANONICAL_NON_FORGEABLE_AUTHORITY_SESSION_ID,
  CANONICAL_NON_FORGEABLE_ISSUER_AUTHORITY_ENVELOPE_VERSION,
  CANONICAL_NON_FORGEABLE_ISSUER_AUTHORITY_VERSION,
  canonicalNonForgeableIssuerAuthorityPayloadDigest,
  canonicalNonForgeableNestedRequestSchemaDigest,
  createCanonicalNonForgeableBindingSnapshotIssuanceHarness,
  type CanonicalNonForgeableBindingSnapshotIssuanceDependencies,
  type CanonicalNonForgeableIssuerAuthorityEnvelope,
  type CanonicalNonForgeableIssuerAuthorityPayload,
} from "@/lib/server/canonical-non-forgeable-binding-snapshot-issuance";

const predecessorAuthority = action666bqAuthority();
const predecessorDependencies = action666bqDependencies();
export const action666bvPredecessorAuthorityRoot =
  predecessorAuthority.authority_root_digest;

const authorityWithoutDigest: Omit<
  CanonicalNonForgeableIssuerAuthorityPayload,
  "authority_payload_digest"
> = {
  authority_version:
    CANONICAL_NON_FORGEABLE_ISSUER_AUTHORITY_VERSION,
  authority_session_identity:
    CANONICAL_NON_FORGEABLE_AUTHORITY_SESSION_ID,
  authority_identity: "action-666bv-external-issuer-authority",
  external_owner_identity:
    predecessorAuthority.external_owner_identity,
  owner_boundary_identity:
    "action-666bv-external-owner-boundary",
  issuer_identity: "action-666bv-snapshot-issuer",
  issuer_implementation_version:
    "non-forgeable-binding-snapshot-issuer-v2",
  pinned_anchor_digest:
    CANONICAL_NON_FORGEABLE_AUTHORITY_PINNED_ANCHOR,
  pinned_root_digest:
    CANONICAL_NON_FORGEABLE_AUTHORITY_PINNED_ROOT,
  expected_request_identity: action666bqRequest.issuance_identity,
  expected_nested_schema_digest:
    canonicalNonForgeableNestedRequestSchemaDigest(action666bqRequest),
  expected_semantic_scope_digest:
    canonicalGovernedBindingSnapshotIssuanceSemanticScopeDigest(
      action666bqRequest,
    ),
  minimum_publication_epoch: 1,
  publication_sequence: predecessorAuthority.publication_sequence,
  publication_epoch: predecessorAuthority.publication_epoch,
  predecessor: structuredClone(predecessorAuthority.predecessor),
  issued_at: predecessorAuthority.issued_at,
  evidence_cutoff: predecessorAuthority.evidence_cutoff,
  effective_at: predecessorAuthority.effective_at,
  registry_authority_identity:
    predecessorAuthority.registry_authority_identity,
  authority_manifest_digest:
    predecessorAuthority.authority_manifest_digest,
  authority_root_digest:
    CANONICAL_NON_FORGEABLE_AUTHORITY_PINNED_ROOT,
  binding_plan: structuredClone(predecessorAuthority.binding_plan),
  authority_payload_digest_algorithm:
    "sha256_canonical_json_v1" as const,
};

const payloadForDigest = {
  ...authorityWithoutDigest,
  authority_payload_digest: "0".repeat(64),
} satisfies CanonicalNonForgeableIssuerAuthorityPayload;

export const action666bvAuthorityPayload =
  Object.freeze({
    ...authorityWithoutDigest,
    authority_payload_digest:
      canonicalNonForgeableIssuerAuthorityPayloadDigest(
        payloadForDigest,
      ),
  }) satisfies CanonicalNonForgeableIssuerAuthorityPayload;

export const action666bvAuthorityEnvelope =
  Object.freeze({
    envelope_version:
      CANONICAL_NON_FORGEABLE_ISSUER_AUTHORITY_ENVELOPE_VERSION,
    payload: action666bvAuthorityPayload,
    signature_algorithm: "ed25519_sha256_digest_v1",
    signature_base64:
      "Ajg+q7/Q9/rb8u4BfhaU6B/HmftPpKqGkJT/9hU7ER/5XPE17mDghL7b+Wor/OEPU5TxKCENP81btSADUNqXCg==",
  }) satisfies CanonicalNonForgeableIssuerAuthorityEnvelope;

export function action666bvDependencies(
  envelope: unknown = action666bvAuthorityEnvelope,
): CanonicalNonForgeableBindingSnapshotIssuanceDependencies {
  return {
    authority_dependency: {
      owner_boundary_version:
        "canonical_non_forgeable_issuer_owner_boundary_v2",
      owner_boundary_identity:
        action666bvAuthorityPayload.owner_boundary_identity,
      read_external_authority: () => envelope,
    },
    predecessor_dependencies: {
      ax_owner_dependency:
        predecessorDependencies.ax_owner_dependency,
      capture_authority: predecessorDependencies.capture_authority,
    },
  };
}

export function action666bvIssue(
  request: unknown = action666bqRequest,
  dependencies = action666bvDependencies(),
) {
  const harness =
    createCanonicalNonForgeableBindingSnapshotIssuanceHarness({
      enabled: true,
      kill_switch_engaged: false,
      dependencies,
    });
  if (!harness.issue) {
    throw new Error("action_666bv_harness_unavailable");
  }
  return harness.issue(request);
}

export function action666bvAlternativeRootEnvelope() {
  const payload: CanonicalNonForgeableIssuerAuthorityPayload =
    structuredClone(action666bvAuthorityPayload);
  payload.pinned_root_digest = "a".repeat(64);
  payload.authority_root_digest = "a".repeat(64);
  payload.authority_payload_digest =
    canonicalNonForgeableIssuerAuthorityPayloadDigest(
      payload,
    );
  return {
    ...structuredClone(action666bvAuthorityEnvelope),
    payload,
  };
}

export function action666bvCrossSessionEnvelope() {
  const envelope = structuredClone(
    action666bvAuthorityEnvelope,
  ) as unknown as {
    envelope_version:
      typeof CANONICAL_NON_FORGEABLE_ISSUER_AUTHORITY_ENVELOPE_VERSION;
    payload: Record<string, unknown>;
    signature_algorithm: "ed25519_sha256_digest_v1";
    signature_base64: string;
  };
  envelope.payload.authority_session_identity =
    "action-666bv-cross-session-authority-v2";
  return envelope;
}

export function action666bvMalformedNestedRequest(marker = "missing") {
  const request = structuredClone(action666bqRequest) as unknown as {
    binding_backed_replay_request: Record<string, unknown>;
  };
  request.binding_backed_replay_request = {
    request_version:
      action666bqRequest.binding_backed_replay_request.request_version,
    marker,
  };
  return request;
}

export function action666bvNestedSemanticDriftRequest(marker: string) {
  const request = structuredClone(action666bqRequest);
  request.binding_backed_replay_request.end_to_end_request
    .completed_capture_request.trusted_input_identity = marker;
  return request;
}

export function action666bvPredecessorAuthorityMintingAttack() {
  const original = action666bqAuthority();
  const replacement =
    createCanonicalGovernedBindingSnapshotIssuerAuthority({
      authority_identity: original.authority_identity,
      owner_boundary_identity: original.owner_boundary_identity,
      external_owner_identity: original.external_owner_identity,
      issuer_identity: original.issuer_identity,
      issuer_implementation_version:
        original.issuer_implementation_version,
      issuer_authority_anchor: "a".repeat(64),
      registry_authority_identity:
        original.registry_authority_identity,
      authority_manifest_digest: "b".repeat(64),
      authority_root_digest: "c".repeat(64),
      publication_sequence: original.publication_sequence,
      publication_epoch: original.publication_epoch,
      predecessor: original.predecessor,
      issued_at: original.issued_at,
      evidence_cutoff: original.evidence_cutoff,
      effective_at: original.effective_at,
      binding_plan: original.binding_plan,
      semantic_scope_digest:
        canonicalGovernedBindingSnapshotIssuanceSemanticScopeDigest(
          action666bqRequest,
        ),
      expected_request_identity:
        action666bqRequest.issuance_identity,
    });
  const dependencies = action666bqDependencies({
    authority: replacement,
  });
  const harness =
    createCanonicalGovernedBindingSnapshotIssuanceHarness({
      enabled: true,
      kill_switch_engaged: false,
      dependencies,
    });
  if (!harness.issue) {
    throw new Error("action_666bq_predecessor_harness_unavailable");
  }
  return harness.issue(action666bqRequest);
}

export function action666bvReorderedRequest() {
  return Object.fromEntries(
    Object.entries(structuredClone(action666bqRequest)).reverse(),
  );
}
