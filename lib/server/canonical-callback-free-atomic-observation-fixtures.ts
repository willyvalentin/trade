import "server-only";

import {
  runCanonicalCallbackFreeAtomicObservation,
  type CanonicalCallbackFreeAtomicObservationExecution,
} from "@/lib/server/canonical-callback-free-atomic-observation";

const representativeCanonicalEnvelope = JSON.stringify({
  envelope_version:
    "canonical_integrity_provenance_separated_observation_envelope_v2",
  authority_version:
    "canonical_integrity_provenance_separated_observation_authority_v2",
  integrity_verified: true,
  provenance_verified: false,
  authority_status: "integrity_only",
  trusted: false,
  admitted: false,
  capsule_exposed: false,
  source_result_version: "canonical_private_atomic_observation_result_v2",
  source_result_digest:
    "562f08c5dcfb214c1b4c4f45374bff867c56450c3b66bb70c3e3938db13a3bb5",
  source_evidence_version:
    "canonical_private_atomic_observation_evidence_v2",
  source_evidence_digest:
    "8b61e73fb81e365feacffde87e35223fb4c6fb2fe4c0ca154d4a2843fd5d3fbe",
  primitive_type: "bigint",
  primitive_value_digest:
    "c9f9149dbb57c4a24bb13bebe1d2718f6ddda7cfb3647504a4ee174151a82b9b",
  primitive_observation_digest:
    "0d4d9728b07e0e4cff9762dd28dcaa3013afe883f8877109637b36d4e6d25499",
  content_identity_claimed: true,
  envelope_digest_algorithm: "sha256_canonical_json_v1",
  shadow_only: true,
  live_ranking_effect: false,
  live_impact: false,
  persistence_performed: false,
  automatic_training_allowed: false,
  automatic_parameter_change_allowed: false,
  automatic_threshold_change_allowed: false,
  automatic_model_change_allowed: false,
  automatic_promotion_allowed: false,
  external_ai_canonical_truth_authority: false,
  causal_improvement_claimed: false,
  synthetic_evidence: true,
  not_publishable: true,
  envelope_digest:
    "998e492261ce0ae0cebafb3cc4a8caa52f2abc155be0e5324453532625d111b0",
});
const scenarioNames = [
  "bigint_positive_one",
  "bigint_positive_two",
  "bigint_negative_one",
  "number_zero",
  "number_negative_zero",
  "number_nan",
  "number_positive_infinity",
  "number_negative_infinity",
  "string_one",
  "boolean_true",
  "null",
  "undefined",
] as const;

export function action666cxCanonicalEnvelope(_request: unknown) {
  void _request;
  return representativeCanonicalEnvelope;
}

export function action666cxCanonicalReadbackBytes(request: unknown) {
  return new TextEncoder().encode(action666cxCanonicalEnvelope(request));
}

export function action666cxReadback(
  input: unknown,
): CanonicalCallbackFreeAtomicObservationExecution {
  return runCanonicalCallbackFreeAtomicObservation(input, true, false);
}

export function action666cxGoldenScenarios() {
  const terminal = action666cxReadback(action666cxCanonicalEnvelope(BigInt(1)))
    .terminal_result;
  if (terminal === null) throw new Error("action_666cx_terminal_unavailable");
  return scenarioNames.map((name) => {
    return {
      name,
      terminal_status: terminal.terminal_status,
      integrity_verified: terminal.integrity_verified,
      provenance_verified: terminal.provenance_verified,
      authority_status: terminal.authority_status,
      trusted: terminal.trusted,
      admitted: terminal.admitted,
      reason_codes: terminal.reason_codes,
    };
  });
}
