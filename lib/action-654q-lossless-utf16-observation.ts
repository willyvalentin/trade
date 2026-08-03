import { hashAction650sCanonicalValue } from "@/lib/action-650s-execution-identity";
import {
  runAction654hPrivateReadinessComposition,
  type Action654hPrivateReadinessInput,
  type Action654hPrivateReadinessResult,
} from "@/lib/action-654h-private-readiness-provenance";

const contractVersion = "action_654q_lossless_utf16_observation_v1" as const;
const gateVersion = "action_654o_canonical_gate_v1" as const;
const observationFrameVersion =
  "action_654q_utf16_observation_frame_v1" as const;
const observationInputDomain =
  "action_654q_canonical_readiness_gate_input" as const;
const observationPolicyVersion =
  "action_654q_lossless_utf16_policy_v1" as const;
const observationEncoding = "uint16_big_endian_hex" as const;

export const action654qStringBudgets = Object.freeze({
  maximum_code_units: 128,
  maximum_code_unit_bytes: 224,
});

export const action654qCanonicalGates = Object.freeze({
  disabled:
    '{"version":"action_654o_canonical_gate_v1","enabled":false,"kill_switch_active":false}',
  enabled:
    '{"version":"action_654o_canonical_gate_v1","enabled":true,"kill_switch_active":false}',
  kill_switch_active:
    '{"version":"action_654o_canonical_gate_v1","enabled":true,"kill_switch_active":true}',
});

type GateFailureReason =
  | "gate_input_not_primitive_string"
  | "gate_code_unit_budget_exceeded"
  | "gate_code_unit_byte_budget_exceeded"
  | "gate_json_parse_failed"
  | "gate_schema_rejected"
  | "gate_noncanonical_code_units";

type CanonicalGateSnapshot = Readonly<{
  version: typeof gateVersion;
  enabled: boolean;
  kill_switch_active: boolean;
}>;

type LosslessObservation = Readonly<{
  code_unit_count: number;
  code_unit_byte_count: number;
  digest: string;
}>;

export type Action654qLosslessGateResult = Readonly<{
  contract_version: typeof contractVersion;
  boundary_status: "accepted" | "rejected";
  gate_snapshot: CanonicalGateSnapshot | null;
  predecessor_result: Action654hPrivateReadinessResult | null;
  failure_reason: GateFailureReason | null;
  observation_frame_version: typeof observationFrameVersion;
  observation_input_domain: typeof observationInputDomain;
  observation_policy_version: typeof observationPolicyVersion;
  observed_string_encoding: typeof observationEncoding | null;
  observed_string_code_unit_count: number | null;
  observed_string_code_unit_byte_count: number | null;
  observed_string_digest: string | null;
  failure_identity: string | null;
  terminal_digest: string | null;
  effects: Readonly<{
    primitive_captures: 1;
    caller_property_reads: 0;
    reflection_operations_on_caller_input: 0;
    budget_checks: 0 | 2;
    observed_code_unit_reads: number;
    observation_digest_operations: 0 | 1;
    parser_invocations: 0 | 1;
    gate_snapshot_constructions: 0 | 1;
    failure_digest_operations: 0 | 1;
    terminal_digest_operations: 0 | 1;
    v5_invocations: 0 | 1;
    v5_establishments: 0 | 1;
    capsule_mints: 0 | 1;
    readiness_classifications: 0 | 1;
    confirmation_consumptions: 0 | 1;
    getter_executions: 0;
    proxy_hooks_executed: 0;
    callback_executions: 0;
    transport_requests: 0;
    broker_submissions: 0;
    database_writes: 0;
    trade_mutations: 0;
  }>;
  safety: Readonly<{
    diagnostic_only: true;
    synthetic_only: true;
    transport_attached: false;
    dispatch_permitted: false;
    broker_submission_allowed: false;
    real_broker_submission: false;
    avanza_live_access: false;
    credential_access: false;
    browser_or_cdp_access: false;
    automatic_execution: false;
    trade_mutation: false;
    production_write: false;
  }>;
}>;

const safety = Object.freeze({
  diagnostic_only: true as const,
  synthetic_only: true as const,
  transport_attached: false as const,
  dispatch_permitted: false as const,
  broker_submission_allowed: false as const,
  real_broker_submission: false as const,
  avanza_live_access: false as const,
  credential_access: false as const,
  browser_or_cdp_access: false as const,
  automatic_execution: false as const,
  trade_mutation: false as const,
  production_write: false as const,
});

function freezeEngineOwned<T extends object>(value: T): Readonly<T> {
  return Object.freeze(value);
}

function effects(
  predecessor: Action654hPrivateReadinessResult | null,
  input: Readonly<{
    budget_checks?: 0 | 2;
    observed_code_unit_reads?: number;
    observation_digest_operations?: 0 | 1;
    parser_invocations?: 0 | 1;
    gate_snapshot_constructions?: 0 | 1;
    failure_digest_operations?: 0 | 1;
    terminal_digest_operations?: 0 | 1;
  }> = {},
): Action654qLosslessGateResult["effects"] {
  return freezeEngineOwned({
    primitive_captures: 1 as const,
    caller_property_reads: 0 as const,
    reflection_operations_on_caller_input: 0 as const,
    budget_checks: input.budget_checks ?? (0 as const),
    observed_code_unit_reads: input.observed_code_unit_reads ?? 0,
    observation_digest_operations:
      input.observation_digest_operations ?? (0 as const),
    parser_invocations: input.parser_invocations ?? (0 as const),
    gate_snapshot_constructions:
      input.gate_snapshot_constructions ?? (0 as const),
    failure_digest_operations: input.failure_digest_operations ?? (0 as const),
    terminal_digest_operations:
      input.terminal_digest_operations ?? (0 as const),
    v5_invocations: predecessor?.effects.v5_invocations ?? (0 as const),
    v5_establishments: predecessor?.effects.v5_establishments ?? (0 as const),
    capsule_mints: predecessor?.effects.capsule_mints ?? (0 as const),
    readiness_classifications:
      predecessor?.effects.readiness_classifications ?? (0 as const),
    confirmation_consumptions:
      predecessor?.effects.confirmation_consumptions ?? (0 as const),
    getter_executions: 0 as const,
    proxy_hooks_executed: 0 as const,
    callback_executions: 0 as const,
    transport_requests: 0 as const,
    broker_submissions: 0 as const,
    database_writes: 0 as const,
    trade_mutations: 0 as const,
  });
}

function rejectedNonString(): Action654qLosslessGateResult {
  return freezeEngineOwned({
    contract_version: contractVersion,
    boundary_status: "rejected" as const,
    gate_snapshot: null,
    predecessor_result: null,
    failure_reason: "gate_input_not_primitive_string" as const,
    observation_frame_version: observationFrameVersion,
    observation_input_domain: observationInputDomain,
    observation_policy_version: observationPolicyVersion,
    observed_string_encoding: null,
    observed_string_code_unit_count: null,
    observed_string_code_unit_byte_count: null,
    observed_string_digest: null,
    failure_identity: null,
    terminal_digest: null,
    effects: effects(null),
    safety,
  });
}

function budgetRejected(
  reason:
    | "gate_code_unit_budget_exceeded"
    | "gate_code_unit_byte_budget_exceeded",
  codeUnitCount: number,
  codeUnitByteCount: number,
): Action654qLosslessGateResult {
  const failureIdentity = `action_654q_gate_failure_${hashAction650sCanonicalValue({
    contract_version: contractVersion,
    observation_policy_version: observationPolicyVersion,
    reason,
    observation_status: "budget_rejected",
    observed_code_unit_count: codeUnitCount,
    observed_code_unit_byte_count: codeUnitByteCount,
  })}`;
  const terminalDigest = `action_654q_gate_terminal_${hashAction650sCanonicalValue({
    contract_version: contractVersion,
    boundary_status: "rejected",
    reason,
    failure_identity: failureIdentity,
  })}`;
  return freezeEngineOwned({
    contract_version: contractVersion,
    boundary_status: "rejected" as const,
    gate_snapshot: null,
    predecessor_result: null,
    failure_reason: reason,
    observation_frame_version: observationFrameVersion,
    observation_input_domain: observationInputDomain,
    observation_policy_version: observationPolicyVersion,
    observed_string_encoding: observationEncoding,
    observed_string_code_unit_count: codeUnitCount,
    observed_string_code_unit_byte_count: codeUnitByteCount,
    observed_string_digest: null,
    failure_identity: failureIdentity,
    terminal_digest: terminalDigest,
    effects: effects(null, {
      budget_checks: 2,
      failure_digest_operations: 1,
      terminal_digest_operations: 1,
    }),
    safety,
  });
}

function losslessObserve(captured: string): LosslessObservation {
  const codeUnitCount = captured.length;
  const chunks = new Array<string>(codeUnitCount);
  for (let index = 0; index < codeUnitCount; index += 1) {
    chunks[index] = captured.charCodeAt(index).toString(16).padStart(4, "0");
  }
  const frame = freezeEngineOwned({
    frame_version: observationFrameVersion,
    input_domain: observationInputDomain,
    policy_version: observationPolicyVersion,
    code_unit_encoding: observationEncoding,
    code_unit_endianness: "big" as const,
    code_unit_count: codeUnitCount,
    code_unit_byte_count: codeUnitCount * 2,
    code_units_big_endian_hex: chunks.join(""),
  });
  return freezeEngineOwned({
    code_unit_count: codeUnitCount,
    code_unit_byte_count: codeUnitCount * 2,
    digest: `action_654q_observed_gate_utf16_${hashAction650sCanonicalValue(frame)}`,
  });
}

function rejectedObservedString(
  observation: LosslessObservation,
  reason: Extract<
    GateFailureReason,
    | "gate_json_parse_failed"
    | "gate_schema_rejected"
    | "gate_noncanonical_code_units"
  >,
  parserInvocations: 0 | 1,
): Action654qLosslessGateResult {
  const failureIdentity = `action_654q_gate_failure_${hashAction650sCanonicalValue({
    contract_version: contractVersion,
    observation_policy_version: observationPolicyVersion,
    reason,
    observed_string_digest: observation.digest,
  })}`;
  const terminalDigest = `action_654q_gate_terminal_${hashAction650sCanonicalValue({
    contract_version: contractVersion,
    boundary_status: "rejected",
    reason,
    observed_string_digest: observation.digest,
    failure_identity: failureIdentity,
  })}`;
  return freezeEngineOwned({
    contract_version: contractVersion,
    boundary_status: "rejected" as const,
    gate_snapshot: null,
    predecessor_result: null,
    failure_reason: reason,
    observation_frame_version: observationFrameVersion,
    observation_input_domain: observationInputDomain,
    observation_policy_version: observationPolicyVersion,
    observed_string_encoding: observationEncoding,
    observed_string_code_unit_count: observation.code_unit_count,
    observed_string_code_unit_byte_count: observation.code_unit_byte_count,
    observed_string_digest: observation.digest,
    failure_identity: failureIdentity,
    terminal_digest: terminalDigest,
    effects: effects(null, {
      budget_checks: 2,
      observed_code_unit_reads: observation.code_unit_count,
      observation_digest_operations: 1,
      parser_invocations: parserInvocations,
      failure_digest_operations: 1,
      terminal_digest_operations: 1,
    }),
    safety,
  });
}

function canonicalGateSnapshot(
  captured: string,
  observation: LosslessObservation,
):
  | Readonly<{ ok: true; snapshot: CanonicalGateSnapshot }>
  | Readonly<{ ok: false; result: Action654qLosslessGateResult }> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(captured);
  } catch {
    return {
      ok: false,
      result: rejectedObservedString(
        observation,
        "gate_json_parse_failed",
        1,
      ),
    };
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {
      ok: false,
      result: rejectedObservedString(observation, "gate_schema_rejected", 1),
    };
  }

  const engineOwned = parsed as Record<string, unknown>;
  if (
    engineOwned.version !== gateVersion ||
    typeof engineOwned.enabled !== "boolean" ||
    typeof engineOwned.kill_switch_active !== "boolean"
  ) {
    return {
      ok: false,
      result: rejectedObservedString(observation, "gate_schema_rejected", 1),
    };
  }

  const canonical = JSON.stringify({
    version: gateVersion,
    enabled: engineOwned.enabled,
    kill_switch_active: engineOwned.kill_switch_active,
  });
  if (canonical !== captured) {
    return {
      ok: false,
      result: rejectedObservedString(
        observation,
        "gate_noncanonical_code_units",
        1,
      ),
    };
  }

  return {
    ok: true,
    snapshot: freezeEngineOwned({
      version: gateVersion,
      enabled: engineOwned.enabled,
      kill_switch_active: engineOwned.kill_switch_active,
    }),
  };
}

/**
 * Losslessly observes the primitive gate string as exact UTF-16 code units
 * before JSON parsing. No caller-owned object or handle crosses this boundary.
 */
export function runAction654qLosslessUtf16ReadinessGate(
  canonicalGateInput: unknown,
  input: Action654hPrivateReadinessInput | unknown,
): Action654qLosslessGateResult {
  const captured = canonicalGateInput;
  if (typeof captured !== "string") return rejectedNonString();

  const codeUnitCount = captured.length;
  const codeUnitByteCount = codeUnitCount * 2;
  if (codeUnitCount > action654qStringBudgets.maximum_code_units) {
    return budgetRejected(
      "gate_code_unit_budget_exceeded",
      codeUnitCount,
      codeUnitByteCount,
    );
  }
  if (codeUnitByteCount > action654qStringBudgets.maximum_code_unit_bytes) {
    return budgetRejected(
      "gate_code_unit_byte_budget_exceeded",
      codeUnitCount,
      codeUnitByteCount,
    );
  }

  const observation = losslessObserve(captured);
  const gate = canonicalGateSnapshot(captured, observation);
  if (!gate.ok) return gate.result;

  const predecessor = runAction654hPrivateReadinessComposition(
    {
      enabled: gate.snapshot.enabled,
      kill_switch_active: gate.snapshot.kill_switch_active,
    },
    input,
  );
  const terminalDigest = `action_654q_gate_terminal_${hashAction650sCanonicalValue({
    contract_version: contractVersion,
    boundary_status: "accepted",
    observed_string_digest: observation.digest,
    gate_snapshot: gate.snapshot,
    predecessor_terminal_digest: predecessor.terminal_digest,
  })}`;
  return freezeEngineOwned({
    contract_version: contractVersion,
    boundary_status: "accepted" as const,
    gate_snapshot: gate.snapshot,
    predecessor_result: predecessor,
    failure_reason: null,
    observation_frame_version: observationFrameVersion,
    observation_input_domain: observationInputDomain,
    observation_policy_version: observationPolicyVersion,
    observed_string_encoding: observationEncoding,
    observed_string_code_unit_count: observation.code_unit_count,
    observed_string_code_unit_byte_count: observation.code_unit_byte_count,
    observed_string_digest: observation.digest,
    failure_identity: null,
    terminal_digest: terminalDigest,
    effects: effects(predecessor, {
      budget_checks: 2,
      observed_code_unit_reads: observation.code_unit_count,
      observation_digest_operations: 1,
      parser_invocations: 1,
      gate_snapshot_constructions: 1,
      terminal_digest_operations: 1,
    }),
    safety,
  });
}
