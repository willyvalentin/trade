import "server-only";

import { action666csDependencies } from "@/lib/server/canonical-non-forgeable-binding-snapshot-issuance-fixtures";
import { action666cvPrimitiveMatrix } from "@/lib/server/canonical-private-atomic-observation-authority-fixtures";
import {
  createCanonicalIntegrityProvenanceSeparatedObservationAuthorityHarness,
  type CanonicalIntegrityProvenanceSeparatedObservationResult,
} from "@/lib/server/canonical-integrity-provenance-separated-observation-authority";

export function action666cwHarness() {
  return createCanonicalIntegrityProvenanceSeparatedObservationAuthorityHarness({
    enabled: true,
    kill_switch_engaged: false,
    dependencies: action666csDependencies(),
  });
}

export function action666cwEvaluate(
  request: unknown,
): CanonicalIntegrityProvenanceSeparatedObservationResult {
  const harness = action666cwHarness();
  if (!harness.observe) throw new Error("action_666cw_harness_unavailable");
  return harness.observe(request);
}

export const action666cwPrimitiveMatrix = action666cvPrimitiveMatrix;

export function action666cwCanonicalReadbackBytes(request: unknown) {
  const canonical =
    action666cwEvaluate(request).canonical_integrity_envelope_string;
  if (canonical === null) throw new Error("action_666cw_envelope_unavailable");
  return new TextEncoder().encode(canonical);
}

export function action666cwGoldenScenarios() {
  return action666cwPrimitiveMatrix.map(({ name, value }) => {
    const result = action666cwEvaluate(value);
    return {
      name,
      primitive_type: result.runtime_evidence?.primitive_type ?? null,
      primitive_value_digest:
        result.runtime_evidence?.primitive_value_digest ?? null,
      primitive_observation_digest:
        result.runtime_evidence?.primitive_observation_digest ?? null,
      source_result_digest:
        result.runtime_evidence?.source_result_digest ?? null,
      source_evidence_digest:
        result.runtime_evidence?.source_evidence_digest ?? null,
      runtime_evidence_digest:
        result.runtime_evidence?.runtime_evidence_digest ?? null,
      envelope_digest: result.integrity_envelope?.envelope_digest ?? null,
      result_digest: result.result_digest,
      status: result.status,
      runtime_authority_status: result.runtime_authority_status,
      serialized_authority_status: result.serialized_authority_status,
      reason_codes: result.reason_codes,
    };
  });
}
