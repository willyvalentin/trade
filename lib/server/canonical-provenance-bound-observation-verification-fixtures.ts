import "server-only";

import { action666csDependencies } from "@/lib/server/canonical-non-forgeable-binding-snapshot-issuance-fixtures";
import {
  createCanonicalProvenanceBoundObservationVerificationHarness,
  type CanonicalProvenanceBoundObservationResult,
} from "@/lib/server/canonical-provenance-bound-observation-verification";

export function action666cuHarness() {
  return createCanonicalProvenanceBoundObservationVerificationHarness({
    enabled: true,
    kill_switch_engaged: false,
    dependencies: action666csDependencies(),
  });
}

export function action666cuEvaluate(
  request: unknown,
): CanonicalProvenanceBoundObservationResult {
  const harness = action666cuHarness();
  if (!harness.evaluate) throw new Error("action_666cu_harness_unavailable");
  return harness.evaluate(request);
}

export const action666cuPrimitiveMatrix = Object.freeze([
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
] as const);

export function action666cuGoldenScenarios() {
  return action666cuPrimitiveMatrix.map(({ name, value }) => {
    const result = action666cuEvaluate(value);
    return {
      name,
      primitive_type: result.capsule?.primitive_type ?? null,
      primitive_value_digest: result.capsule?.primitive_value_digest ?? null,
      primitive_observation_digest:
        result.capsule?.primitive_observation_digest ?? null,
      capsule_identity: result.capsule?.capsule_identity ?? null,
      capsule_digest: result.capsule?.capsule_digest ?? null,
      source_issuance_digest: result.source_issuance_digest,
      verification_digest: result.verification.verification_digest,
      result_digest: result.result_digest,
      status: result.status,
      reason_codes: result.reason_codes,
    };
  });
}
