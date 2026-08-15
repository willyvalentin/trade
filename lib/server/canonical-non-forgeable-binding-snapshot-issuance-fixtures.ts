import "server-only";

import {
  action666bqAuthority,
  action666bqDependencies,
  action666bqRequest,
} from "@/lib/server/canonical-governed-binding-snapshot-issuance-successor-fixtures";
import {
  CANONICAL_NON_FORGEABLE_AUTHORITY_SESSION_ID,
  CANONICAL_NON_FORGEABLE_EXTERNAL_OWNER_BOUNDARY_VERSION,
  CANONICAL_NON_FORGEABLE_ISSUER_AUTHORITY_ENVELOPE_VERSION,
  CANONICAL_NON_FORGEABLE_ISSUER_AUTHORITY_VERSION,
  canonicalNonForgeableIssuerAuthorityEnvelopeJson,
  canonicalNonForgeableIssuerAuthorityPayloadDigest,
  canonicalNonForgeableNestedRequestSchemaDigest,
  createCanonicalNonForgeableBindingSnapshotIssuanceHarness,
  type CanonicalNonForgeableBindingSnapshotIssuanceDependencies,
  type CanonicalNonForgeableIssuerAuthorityEnvelope,
  type CanonicalNonForgeableIssuerAuthorityPayload,
} from "@/lib/server/canonical-non-forgeable-binding-snapshot-issuance";

const predecessorAuthority = action666bqAuthority();

const payloadWithoutDigest = {
  authority_version: CANONICAL_NON_FORGEABLE_ISSUER_AUTHORITY_VERSION,
  authority_session_identity: CANONICAL_NON_FORGEABLE_AUTHORITY_SESSION_ID,
  external_owner_boundary_version:
    CANONICAL_NON_FORGEABLE_EXTERNAL_OWNER_BOUNDARY_VERSION,
  external_owner_boundary_identity:
    CANONICAL_NON_FORGEABLE_EXTERNAL_OWNER_BOUNDARY_VERSION,
  expected_predecessor_owner_boundary_identity:
    predecessorAuthority.owner_boundary_identity,
  expected_authority_identity: predecessorAuthority.authority_identity,
  expected_authority_digest: predecessorAuthority.authority_digest,
  expected_authority_root_digest:
    predecessorAuthority.authority_root_digest,
  expected_issuer_anchor_digest:
    predecessorAuthority.issuer_authority_anchor,
  expected_request_identity: action666bqRequest.issuance_identity,
  expected_request_version: action666bqRequest.request_version,
  expected_nested_schema_digest:
    canonicalNonForgeableNestedRequestSchemaDigest(action666bqRequest),
  expected_semantic_scope_digest:
    predecessorAuthority.semantic_scope_digest,
  minimum_publication_epoch: 1,
  authority_payload_digest_algorithm:
    "sha256_canonical_json_v1" as const,
};

const payloadForDigest = {
  ...payloadWithoutDigest,
  authority_payload_digest: "0".repeat(64),
} satisfies CanonicalNonForgeableIssuerAuthorityPayload;

export const action666csAuthorityPayload = Object.freeze({
  ...payloadWithoutDigest,
  authority_payload_digest:
    canonicalNonForgeableIssuerAuthorityPayloadDigest(payloadForDigest),
}) satisfies CanonicalNonForgeableIssuerAuthorityPayload;

export const action666csAuthorityEnvelope = Object.freeze({
  envelope_version:
    CANONICAL_NON_FORGEABLE_ISSUER_AUTHORITY_ENVELOPE_VERSION,
  payload: action666csAuthorityPayload,
  signature_algorithm: "ed25519_sha256_canonical_json_v1",
  signature_base64:
    "w1Q15Q1L9ox6dpDIfxX0gyzDVVWa3Rtu6ovNHLML3qxPLMfn3GB7fWgpb7Sa+S/sf8sW3iZn6ktT22wso+yeAw==",
}) satisfies CanonicalNonForgeableIssuerAuthorityEnvelope;

export const action666csAuthorityEnvelopeJson =
  canonicalNonForgeableIssuerAuthorityEnvelopeJson(
    action666csAuthorityEnvelope,
  );

export function action666csDependencies(
  rawEnvelope: unknown = action666csAuthorityEnvelopeJson,
): CanonicalNonForgeableBindingSnapshotIssuanceDependencies {
  return {
    authority_dependency: {
      owner_boundary_version:
        CANONICAL_NON_FORGEABLE_EXTERNAL_OWNER_BOUNDARY_VERSION,
      owner_boundary_identity:
        CANONICAL_NON_FORGEABLE_EXTERNAL_OWNER_BOUNDARY_VERSION,
      read_signed_authority_envelope_json: () => rawEnvelope as string,
    },
    predecessor_dependencies: action666bqDependencies(),
  };
}

export function action666csIssue(
  request: unknown = action666bqRequest,
  dependencies = action666csDependencies(),
) {
  const harness =
    createCanonicalNonForgeableBindingSnapshotIssuanceHarness({
      enabled: true,
      kill_switch_engaged: false,
      dependencies,
    });
  if (!harness.issue) throw new Error("action_666cs_harness_unavailable");
  return harness.issue(request);
}

export function action666csAlternativeRootEnvelopeJson() {
  const envelope = structuredClone(
    action666csAuthorityEnvelope,
  ) as CanonicalNonForgeableIssuerAuthorityEnvelope;
  envelope.payload.expected_authority_root_digest = "a".repeat(64);
  envelope.payload.authority_payload_digest =
    canonicalNonForgeableIssuerAuthorityPayloadDigest(envelope.payload);
  return canonicalNonForgeableIssuerAuthorityEnvelopeJson(envelope);
}

export function action666csCrossSessionEnvelopeJson() {
  const crossSession = "action-666cs-cross-session-authority-v1";
  const payload = structuredClone(action666csAuthorityPayload) as unknown as
    CanonicalNonForgeableIssuerAuthorityPayload;
  (payload as unknown as Record<string, unknown>).authority_session_identity =
    crossSession;
  const crossDigest =
    canonicalNonForgeableIssuerAuthorityPayloadDigest(payload);
  return action666csAuthorityEnvelopeJson
    .replace(CANONICAL_NON_FORGEABLE_AUTHORITY_SESSION_ID, crossSession)
    .replace(action666csAuthorityPayload.authority_payload_digest, crossDigest);
}

export function action666csDuplicateKeyEnvelopeJson() {
  return action666csAuthorityEnvelopeJson.replace(
    "{",
    '{"envelope_version":"attacker-first",',
  );
}

export function action666csMalformedNestedRequest(marker = "missing") {
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

export function action666csSemanticDriftRequest(marker: string) {
  const request = structuredClone(action666bqRequest);
  request.binding_backed_replay_request.end_to_end_request
    .completed_capture_request.trusted_input_identity = marker;
  return request;
}

export { action666bqRequest as action666csRequest };
