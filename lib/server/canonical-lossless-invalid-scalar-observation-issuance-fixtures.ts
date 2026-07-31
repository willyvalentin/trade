import "server-only";

import { action666bvDependencies } from "@/lib/server/canonical-non-forgeable-binding-snapshot-issuance-fixtures";
import { action666bqRequest } from "@/lib/server/canonical-governed-binding-snapshot-issuance-successor-fixtures";
import {
  createCanonicalLosslessInvalidScalarIssuanceHarness,
  type CanonicalLosslessInvalidScalarIssuanceResult,
} from "@/lib/server/canonical-lossless-invalid-scalar-observation-issuance";

export const action666bxPrimitiveMatrix = Object.freeze([
  { name: "bigint_positive_one", value: BigInt(1) },
  { name: "bigint_positive_two", value: BigInt(2) },
  { name: "bigint_negative_one", value: BigInt(-1) },
  { name: "number_zero", value: 0 },
  { name: "number_negative_zero", value: -0 },
  { name: "number_integer", value: 1 },
  { name: "number_fractional", value: 1.5 },
  { name: "number_nan", value: Number.NaN },
  { name: "number_positive_infinity", value: Number.POSITIVE_INFINITY },
  { name: "number_negative_infinity", value: Number.NEGATIVE_INFINITY },
  { name: "string_one", value: "1" },
  { name: "string_two", value: "2" },
  { name: "boolean_true", value: true },
  { name: "boolean_false", value: false },
  { name: "null", value: null },
  { name: "undefined", value: undefined },
]);

export function action666bxIssue(
  ...args: [] | [unknown]
): CanonicalLosslessInvalidScalarIssuanceResult {
  const value = args.length === 0 ? action666bqRequest : args[0];
  const harness = createCanonicalLosslessInvalidScalarIssuanceHarness({
    enabled: true,
    kill_switch_engaged: false,
    dependencies: action666bvDependencies(),
  });
  if (!harness.issue) {
    throw new Error("action_666bx_harness_unavailable");
  }
  return harness.issue(value);
}

export function action666bxGoldenScenarios() {
  return action666bxPrimitiveMatrix.map(({ name, value }) => {
    const result = action666bxIssue(value);
    return {
      name,
      primitive_type: result.primitive_observation?.primitive_type,
      canonical_value:
        result.primitive_observation?.canonical_value,
      value_digest: result.primitive_observation?.value_digest,
      bounded_observation_digest:
        result.primitive_observation?.bounded_observation_digest,
      observation_digest:
        result.primitive_observation?.observation_digest,
      predecessor_issuance_digest: result.predecessor_issuance_digest,
      failure_identity_digest: result.failure_identity_digest,
      issuance_digest: result.issuance_digest,
      status: result.status,
      reason_codes: result.reason_codes,
    };
  });
}
