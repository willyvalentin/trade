import "server-only";

import { action666cyCanonicalEnvelope } from "@/lib/server/canonical-lossless-immutable-byte-snapshot-fixtures";
import {
  createCanonicalLosslessImmutableByteSnapshotAuthorityHarness,
  verifyCanonicalLosslessImmutableByteSnapshotAuthorityResult,
} from "@/lib/server/canonical-lossless-immutable-byte-snapshot-authority";

export function action666czHarness() {
  return createCanonicalLosslessImmutableByteSnapshotAuthorityHarness({
    enabled: true,
    kill_switch_engaged: false,
  });
}

export function action666czCanonicalRequest(value: unknown = BigInt(1)) {
  return action666cyCanonicalEnvelope(value);
}

export function action666czEvaluate(value: unknown = BigInt(1)) {
  const harness = action666czHarness();
  if (!harness.observe || !harness.readback) {
    throw new Error("action_666cz_harness_unavailable");
  }
  const request = action666czCanonicalRequest(value);
  const result = harness.observe(request);
  return {
    harness,
    request,
    result,
    readback: harness.readback(result),
    verification: verifyCanonicalLosslessImmutableByteSnapshotAuthorityResult({
      harness,
      request,
      result,
    }),
  };
}

export function action666czGoldenScenarios() {
  const canonical = action666czEvaluate(BigInt(1));
  const malformedHarness = action666czHarness();
  if (!malformedHarness.observe || !malformedHarness.readback) {
    throw new Error("action_666cz_harness_unavailable");
  }
  const malformedResult = malformedHarness.observe("{");
  const malformedReadback = malformedHarness.readback(malformedResult);
  const scenarios = [
    {
      name: "canonical_snapshot_authority",
      result_status: canonical.result.status,
      runtime_authority_status: canonical.result.runtime_authority_status,
      serialized_authority_status: canonical.result.serialized_authority_status,
      provenance_verified: canonical.result.evidence?.provenance_verified ?? false,
      source_raw_byte_sha256:
        canonical.result.evidence?.source_raw_byte_sha256 ?? null,
      source_terminal_identity:
        canonical.result.evidence?.source_terminal_identity ?? null,
      evidence_digest: canonical.result.evidence?.evidence_digest ?? null,
      result_digest: canonical.result.result_digest,
      readback_status: canonical.readback.status,
      readback_provenance_verified: canonical.readback.provenance_verified,
      readback_verifier_authority_granted:
        canonical.readback.verifier_authority_granted,
      readback_digest: canonical.readback.readback_digest,
      verification_valid: canonical.verification.valid,
      reason_codes: canonical.result.reason_codes,
    },
    {
      name: "malformed_snapshot_rejected",
      result_status: malformedResult.status,
      runtime_authority_status: malformedResult.runtime_authority_status,
      serialized_authority_status: malformedResult.serialized_authority_status,
      provenance_verified:
        malformedResult.evidence?.provenance_verified ?? false,
      source_raw_byte_sha256:
        malformedResult.evidence?.source_raw_byte_sha256 ?? null,
      source_terminal_identity:
        malformedResult.evidence?.source_terminal_identity ?? null,
      evidence_digest: malformedResult.evidence?.evidence_digest ?? null,
      result_digest: malformedResult.result_digest,
      readback_status: malformedReadback.status,
      readback_provenance_verified: malformedReadback.provenance_verified,
      readback_verifier_authority_granted:
        malformedReadback.verifier_authority_granted,
      readback_digest: malformedReadback.readback_digest,
      verification_valid: false,
      reason_codes: malformedResult.reason_codes,
    },
  ];
  return JSON.parse(JSON.stringify(scenarios)) as typeof scenarios;
}
