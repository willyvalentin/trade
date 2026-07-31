import "server-only";

import {
  runCanonicalCallbackFreeAtomicObservation,
  type CanonicalCallbackFreeReadbackResult,
} from "@/lib/server/canonical-callback-free-atomic-observation";
import { action666cdIssue } from "@/lib/server/canonical-integrity-provenance-separated-observation-authority-fixtures";
import { canonicalLosslessInvalidScalarIssuanceDigest } from "@/lib/server/canonical-lossless-invalid-scalar-observation-issuance";

function canonicalEnvelope(value: unknown) {
  const issued = action666cdIssue(value);
  if (!issued.canonical_integrity_envelope) {
    throw new Error("synthetic_integrity_envelope_missing");
  }
  return issued.canonical_integrity_envelope;
}

export function action666cfReadback(input: string | Uint8Array) {
  const execution = runCanonicalCallbackFreeAtomicObservation(
    input,
    true,
    false,
  );
  if (execution.status !== "completed") {
    throw new Error("synthetic_callback_free_readback_failed");
  }
  return execution.terminal_result as CanonicalCallbackFreeReadbackResult;
}

export function action666cfCanonicalEnvelope(value: unknown) {
  return canonicalEnvelope(value);
}

export function action666cfCanonicalBytes(value: unknown) {
  return new TextEncoder().encode(canonicalEnvelope(value));
}

export function action666cfRecomputedSemanticReplacement(value: unknown) {
  const parsed = JSON.parse(canonicalEnvelope(value));
  parsed.primitive_type = "string";
  parsed.primitive_value_digest = "1".repeat(64);
  parsed.primitive_observation_digest = "2".repeat(64);
  parsed.bounded_observation_digest = "3".repeat(64);
  const projection = { ...parsed, integrity_digest: undefined };
  parsed.integrity_digest =
    canonicalLosslessInvalidScalarIssuanceDigest(projection);
  return JSON.stringify(parsed);
}

export function action666cfGoldenScenarios() {
  const canonical = canonicalEnvelope(BigInt(1));
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
    {
      name: "recomputed_semantic_replacement",
      input: action666cfRecomputedSemanticReplacement(BigInt(1)),
    },
    { name: "malformed", input: "{" },
    { name: "non_canonical", input: nonCanonical },
    { name: "digest_mismatch", input: digestMismatch },
  ];
  return scenarios.map(({ name, input }) => {
    const result = action666cfReadback(input);
    return {
      name,
      status: result.status,
      integrity_verified: result.integrity_verified,
      provenance_verified: result.provenance_verified,
      authority_status: result.authority_status,
      trusted: result.trusted,
      admitted: result.admitted,
      captured_input_digest: result.captured_input_digest,
      terminal_identity: result.terminal_identity,
      failure_identity: result.failure_identity,
      readback_digest: result.readback_digest,
    };
  });
}
