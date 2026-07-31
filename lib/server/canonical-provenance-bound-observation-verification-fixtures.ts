import "server-only";

import {
  createCanonicalProvenanceBoundObservationHarness,
  type CanonicalProvenanceBoundObservationResult,
} from "@/lib/server/canonical-provenance-bound-observation-verification";

export const action666bzPrimitiveMatrix = Object.freeze([
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

export function action666bzEvaluate(
  ...values: [unknown?]
): CanonicalProvenanceBoundObservationResult {
  const harness = createCanonicalProvenanceBoundObservationHarness({
    enabled: true,
    kill_switch_engaged: false,
  });
  if (!harness.evaluate) throw new Error("action_666bz_unavailable");
  return harness.evaluate(values.length === 0 ? undefined : values[0]);
}

export function action666bzGoldenScenarios() {
  return action666bzPrimitiveMatrix.map(({ name, value }) => {
    const result = action666bzEvaluate(value);
    return {
      name,
      primitive_type: result.capsule?.primitive_type ?? null,
      primitive_value_digest:
        result.capsule?.primitive_value_digest ?? null,
      primitive_observation_digest:
        result.capsule?.primitive_observation_digest ?? null,
      bounded_observation_digest:
        result.capsule?.bounded_observation_digest ?? null,
      capsule_identity: result.capsule?.capsule_identity ?? null,
      capsule_digest: result.capsule?.capsule_digest ?? null,
      verification_digest: result.verification.verification_digest,
      result_digest: result.result_digest,
      status: result.verification.status,
      reason_codes: result.verification.reason_codes,
    };
  });
}
