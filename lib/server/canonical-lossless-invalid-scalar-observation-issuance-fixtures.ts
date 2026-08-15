import "server-only";

import {
  action666csDependencies,
  action666csRequest,
} from "@/lib/server/canonical-non-forgeable-binding-snapshot-issuance-fixtures";
import {
  createCanonicalLosslessInvalidScalarObservationHarness,
  type CanonicalLosslessInvalidScalarIssuanceResult,
} from "@/lib/server/canonical-lossless-invalid-scalar-observation-issuance";

export function action666ctHarness() {
  return createCanonicalLosslessInvalidScalarObservationHarness({
    enabled: true,
    kill_switch_engaged: false,
    dependencies: action666csDependencies(),
  });
}

export function action666ctIssue(
  request: unknown,
): CanonicalLosslessInvalidScalarIssuanceResult {
  const harness = action666ctHarness();
  if (!harness.issue) throw new Error("action_666ct_harness_unavailable");
  return harness.issue(request);
}

export const action666ctGoldenPrimitive = "\ud800Ture\udfff";
export const action666ctGoldenBigInt =
  -(BigInt(2) ** BigInt(127)) + BigInt(17);
export { action666csRequest as action666ctValidRequest };
