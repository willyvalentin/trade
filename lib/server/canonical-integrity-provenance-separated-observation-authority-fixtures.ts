import "server-only";

import {
  runCanonicalIntegrityProvenanceSeparatedObservation,
  type CanonicalIntegrityOnlyReadbackResult,
  type CanonicalRuntimeObservationResult,
} from "@/lib/server/canonical-integrity-provenance-separated-observation-authority";

function issue(value: unknown) {
  const execution =
    runCanonicalIntegrityProvenanceSeparatedObservation({
      enabled: true,
      kill_switch_engaged: false,
      operation: "issue_runtime",
      read_request: () => value,
    });
  if (
    execution.status !== "completed" ||
    execution.operation !== "issue_runtime"
  ) {
    throw new Error("synthetic_runtime_issuance_failed");
  }
  return execution.terminal_result as CanonicalRuntimeObservationResult;
}

function readback(value: unknown) {
  const execution =
    runCanonicalIntegrityProvenanceSeparatedObservation({
      enabled: true,
      kill_switch_engaged: false,
      operation: "readback_integrity",
      read_request: () => value,
    });
  if (
    execution.status !== "completed" ||
    execution.operation !== "readback_integrity"
  ) {
    throw new Error("synthetic_integrity_readback_failed");
  }
  return execution.terminal_result as CanonicalIntegrityOnlyReadbackResult;
}

export const action666cdPrimitiveMatrix = Object.freeze([
  { name: "positive_bigint", value: BigInt(1) },
  { name: "negative_bigint", value: BigInt(-2) },
  { name: "positive_zero", value: 0 },
  { name: "negative_zero", value: -0 },
  { name: "nan", value: Number.NaN },
  { name: "positive_infinity", value: Number.POSITIVE_INFINITY },
  { name: "negative_infinity", value: Number.NEGATIVE_INFINITY },
  { name: "string", value: "integrity-only" },
  { name: "boolean", value: true },
  { name: "null", value: null },
  { name: "undefined", value: undefined },
] as const);

export function action666cdIssue(value: unknown) {
  return issue(value);
}

export function action666cdReadback(value: unknown) {
  return readback(value);
}

export function action666cdCanonicalReadbackBytes(value: unknown) {
  const result = issue(value);
  if (!result.canonical_integrity_envelope) {
    throw new Error("synthetic_canonical_integrity_envelope_missing");
  }
  return new TextEncoder().encode(result.canonical_integrity_envelope);
}

export function action666cdGoldenScenarios() {
  return action666cdPrimitiveMatrix.map(({ name, value }) => {
    const issuance = issue(value);
    const readbackResult = readback(
      issuance.canonical_integrity_envelope,
    );
    return {
      name,
      runtime_status: issuance.status,
      runtime_provenance_verified: issuance.provenance_verified,
      serialized_status: readbackResult.status,
      serialized_integrity_verified:
        readbackResult.integrity_verified,
      serialized_provenance_verified:
        readbackResult.provenance_verified,
      serialized_authority_status: readbackResult.authority_status,
      serialized_trusted: readbackResult.trusted,
      serialized_admitted: readbackResult.admitted,
      runtime_result_digest: issuance.result_digest,
      readback_digest: readbackResult.readback_digest,
    };
  });
}
