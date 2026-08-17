import "server-only";

import { action666csDependencies } from "@/lib/server/canonical-non-forgeable-binding-snapshot-issuance-fixtures";
import {
  createCanonicalPrivateAtomicObservationAuthorityHarness,
  type CanonicalPrivateAtomicObservationResult,
} from "@/lib/server/canonical-private-atomic-observation-authority";

export function action666cvHarness() {
  return createCanonicalPrivateAtomicObservationAuthorityHarness({
    enabled: true,
    kill_switch_engaged: false,
    dependencies: action666csDependencies(),
  });
}

export function action666cvEvaluate(
  request: unknown,
): CanonicalPrivateAtomicObservationResult {
  const harness = action666cvHarness();
  if (!harness.observe) throw new Error("action_666cv_harness_unavailable");
  return harness.observe(request);
}

export const action666cvPrimitiveMatrix = Object.freeze([
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

export function action666cvCanonicalReadbackBytes(request: unknown) {
  const canonical = action666cvEvaluate(request).canonical_evidence_string;
  if (canonical === null) throw new Error("action_666cv_evidence_unavailable");
  return new TextEncoder().encode(canonical);
}

export function action666cvGoldenScenarios() {
  return action666cvPrimitiveMatrix.map(({ name, value }) => {
    const result = action666cvEvaluate(value);
    return {
      name,
      primitive_type: result.evidence?.primitive_type ?? null,
      primitive_value_digest: result.evidence?.primitive_value_digest ?? null,
      primitive_observation_digest:
        result.evidence?.primitive_observation_digest ?? null,
      atomic_capsule_identity:
        result.evidence?.atomic_capsule_identity ?? null,
      atomic_capsule_digest: result.evidence?.atomic_capsule_digest ?? null,
      source_result_digest: result.evidence?.source_result_digest ?? null,
      evidence_digest: result.evidence?.evidence_digest ?? null,
      result_digest: result.result_digest,
      status: result.status,
      reason_codes: result.reason_codes,
    };
  });
}
