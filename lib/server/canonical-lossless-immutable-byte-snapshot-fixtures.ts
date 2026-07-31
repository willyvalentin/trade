import "server-only";

import {
  runCanonicalLosslessImmutableByteSnapshot,
  type CanonicalImmutableByteReadbackResult,
} from "@/lib/server/canonical-lossless-immutable-byte-snapshot";
import {
  action666cfCanonicalEnvelope,
  action666cfRecomputedSemanticReplacement,
} from "@/lib/server/canonical-callback-free-atomic-observation-fixtures";

export function action666chReadback(input: string | Uint8Array) {
  const execution = runCanonicalLosslessImmutableByteSnapshot(
    input,
    true,
    false,
  );
  if (execution.status !== "completed") {
    throw new Error("synthetic_immutable_snapshot_readback_failed");
  }
  return execution.terminal_result as CanonicalImmutableByteReadbackResult;
}

export function action666chCanonicalEnvelope(value: unknown) {
  return action666cfCanonicalEnvelope(value);
}

export function action666chCanonicalBytes(value: unknown) {
  return new TextEncoder().encode(action666chCanonicalEnvelope(value));
}

export function action666chOffsetView(value: unknown) {
  const canonical = action666chCanonicalBytes(value);
  const buffer = new ArrayBuffer(canonical.byteLength + 4);
  const full = new Uint8Array(buffer);
  full.set([9, 8], 0);
  full.set(canonical, 2);
  full.set([7, 6], canonical.byteLength + 2);
  return new Uint8Array(buffer, 2, canonical.byteLength);
}

export function action666chGoldenScenarios() {
  const canonical = action666chCanonicalEnvelope(BigInt(1));
  const parsed = JSON.parse(canonical);
  const nonCanonical = JSON.stringify(
    Object.fromEntries(Object.entries(parsed).reverse()),
  );
  const digestMismatch = JSON.stringify({
    ...parsed,
    integrity_digest: "0".repeat(64),
  });
  const scenarios = [
    { name: "canonical_string", input: canonical },
    { name: "canonical_bytes", input: new TextEncoder().encode(canonical) },
    { name: "offset_view", input: action666chOffsetView(BigInt(1)) },
    {
      name: "recomputed_semantic_replacement",
      input: action666cfRecomputedSemanticReplacement(BigInt(1)),
    },
    { name: "invalid_utf8_ff", input: new Uint8Array([0xff]) },
    { name: "invalid_utf8_fe", input: new Uint8Array([0xfe]) },
    { name: "malformed", input: "{" },
    { name: "non_canonical", input: nonCanonical },
    { name: "digest_mismatch", input: digestMismatch },
  ];
  return scenarios.map(({ name, input }) => {
    const result = action666chReadback(input);
    return {
      name,
      status: result.status,
      input_domain: result.raw_byte_observation?.input_domain ?? null,
      exact_byte_length:
        result.raw_byte_observation?.exact_byte_length ?? null,
      raw_byte_sha256:
        result.raw_byte_observation?.raw_byte_sha256 ?? null,
      raw_byte_observation_digest:
        result.raw_byte_observation?.observation_digest ?? null,
      provenance_verified: result.provenance_verified,
      trusted: result.trusted,
      admitted: result.admitted,
      terminal_identity: result.terminal_identity,
      failure_identity: result.failure_identity,
      readback_digest: result.readback_digest,
    };
  });
}
