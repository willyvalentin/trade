import "server-only";

import {
  createCanonicalPrivateAtomicObservationHarness,
  observeCanonicalPrimitiveAtomically,
  verifyCanonicalPrivateAtomicObservationReadback,
} from "@/lib/server/canonical-private-atomic-observation-authority";

export const action666cbPrimitiveMatrix = Object.freeze([
  { name: "bigint_positive_one", value: BigInt(1) },
  { name: "bigint_positive_two", value: BigInt(2) },
  { name: "bigint_negative_one", value: BigInt(-1) },
  { name: "number_zero", value: 0 },
  { name: "number_negative_zero", value: -0 },
  { name: "number_nan", value: Number.NaN },
  { name: "number_positive_infinity", value: Number.POSITIVE_INFINITY },
  { name: "number_negative_infinity", value: Number.NEGATIVE_INFINITY },
  { name: "string_one", value: "1" },
  { name: "boolean_true", value: true },
  { name: "null", value: null },
  { name: "undefined", value: undefined },
]);

export function action666cbEvaluate(value: unknown) {
  const harness = createCanonicalPrivateAtomicObservationHarness({
    enabled: true,
    kill_switch_engaged: false,
  });
  if (!harness.observe) throw new Error("CB harness unexpectedly disabled");
  return harness.observe(value);
}

export function action666cbGoldenScenarios() {
  return action666cbPrimitiveMatrix.map(({ name, value }) => {
    const result = action666cbEvaluate(value);
    const readback = verifyCanonicalPrivateAtomicObservationReadback(
      result.canonical_evidence_string,
    );
    return {
      name,
      primitive_type: result.evidence?.primitive_type ?? null,
      primitive_value_digest:
        result.evidence?.primitive_value_digest ?? null,
      primitive_observation_digest:
        result.evidence?.primitive_observation_digest ?? null,
      capsule_identity: result.evidence?.capsule_identity ?? null,
      capsule_digest: result.evidence?.capsule_digest ?? null,
      evidence_digest: result.evidence?.evidence_digest ?? null,
      result_digest: result.result_digest,
      readback_digest: readback.readback_digest,
      status: result.status,
      readback_status: readback.status,
    };
  });
}

export function action666cbCanonicalReadbackBytes(value: unknown) {
  const result = observeCanonicalPrimitiveAtomically(value);
  return new TextEncoder().encode(result.canonical_evidence_string!);
}
