import { hashAction650sCanonicalValue } from "@/lib/action-650s-execution-identity";
import {
  runAction654hPrivateReadinessComposition,
  type Action654hPrivateReadinessInput,
  type Action654hPrivateReadinessResult,
} from "@/lib/action-654h-private-readiness-provenance";

const contractVersion = "action_654s_fail_fast_separated_string_budget_v1" as const;
const gateVersion = "action_654o_canonical_gate_v1" as const;
const policyVersion = "action_654s_separated_string_budget_policy_v1" as const;
const frameVersion = "action_654s_utf16_observation_frame_v1" as const;
const inputDomain = "action_654s_canonical_readiness_gate_input" as const;
const observationEncoding = "uint16_big_endian_hex" as const;

const observationFrameFixedBytes = 128;
const parserSnapshotFixedBytes = 192;
const parserWorstCaseBytesPerCodeUnit = 6;
const fixedContractOverheadBytes = 640;

type BudgetPolicy = Readonly<{
  maximum_code_units: number;
  maximum_observation_bytes: number;
  maximum_total_bytes: number;
}>;

// The production policy is module-owned, frozen, non-exported, and contains
// exactly the three normative limits. No public operation accepts a policy.
const productionBudgetPolicy: BudgetPolicy = Object.freeze({
  maximum_code_units: 128,
  maximum_observation_bytes: 384,
  maximum_total_bytes: 1_984,
});

export const action654sCanonicalGates = Object.freeze({
  disabled:
    '{"version":"action_654o_canonical_gate_v1","enabled":false,"kill_switch_active":false}',
  enabled:
    '{"version":"action_654o_canonical_gate_v1","enabled":true,"kill_switch_active":false}',
  kill_switch_active:
    '{"version":"action_654o_canonical_gate_v1","enabled":true,"kill_switch_active":true}',
});

type BudgetReason =
  | "maximum_code_units_exceeded"
  | "maximum_observation_bytes_exceeded"
  | "maximum_total_bytes_exceeded"
  | "unsafe_budget_arithmetic";

type BoundaryFailureReason =
  | "gate_input_not_primitive_string"
  | "budget_policy_override_rejected"
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
  observation_byte_count: number;
  total_upper_bound_bytes: number;
  digest: string;
}>;

type WorkCounters = Readonly<{
  utf16_framing_allocations: number;
  code_unit_iterations: number;
  observation_digest_operations: number;
  failure_digest_operations: number;
  terminal_digest_operations: number;
  parser_invocations: number;
  canonical_serializations: number;
  gate_snapshot_constructions: number;
  capsule_operations: number;
  readiness_operations: number;
  v5_invocations: number;
  v5_establishments: number;
  confirmation_consumptions: number;
  caller_property_reads: number;
  getter_executions: number;
  proxy_hooks_executed: number;
  callback_executions: number;
  transport_requests: number;
  broker_submissions: number;
  database_writes: number;
  trade_mutations: number;
}>;

type BudgetRejection = Readonly<{
  policy_version: typeof policyVersion;
  reason: BudgetReason;
  observed_bounded_length: number;
  observed_length_unit:
    | "utf16_code_units"
    | "framed_observation_bytes"
    | "conservative_total_bytes";
  relevant_maximum: number;
  cryptographic_input_binding_claimed: false;
}>;

export type Action654sSeparatedBudgetResult = Readonly<{
  contract_version: typeof contractVersion;
  boundary_status: "accepted" | "rejected" | "budget_rejected";
  budget_policy_version: typeof policyVersion;
  budget_rejection: BudgetRejection | null;
  gate_snapshot: CanonicalGateSnapshot | null;
  predecessor_result: Action654hPrivateReadinessResult | null;
  failure_reason: BoundaryFailureReason | null;
  observation_frame_version: typeof frameVersion;
  observation_input_domain: typeof inputDomain;
  observed_string_encoding: typeof observationEncoding | null;
  observed_string_code_unit_count: number | null;
  observed_string_observation_byte_count: number | null;
  observed_string_total_upper_bound_bytes: number | null;
  observed_string_digest: string | null;
  failure_identity: string | null;
  terminal_digest: string | null;
  capture: Readonly<{
    primitive_captures: 0 | 1;
    primitive_length_reads: 0 | 1;
  }>;
  work: WorkCounters;
  safety: typeof safety;
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

const zeroWork: WorkCounters = Object.freeze({
  utf16_framing_allocations: 0,
  code_unit_iterations: 0,
  observation_digest_operations: 0,
  failure_digest_operations: 0,
  terminal_digest_operations: 0,
  parser_invocations: 0,
  canonical_serializations: 0,
  gate_snapshot_constructions: 0,
  capsule_operations: 0,
  readiness_operations: 0,
  v5_invocations: 0,
  v5_establishments: 0,
  confirmation_consumptions: 0,
  caller_property_reads: 0,
  getter_executions: 0,
  proxy_hooks_executed: 0,
  callback_executions: 0,
  transport_requests: 0,
  broker_submissions: 0,
  database_writes: 0,
  trade_mutations: 0,
});

function freezeOwned<T extends object>(value: T): Readonly<T> {
  return Object.freeze(value);
}

function safeMultiply(left: number, right: number): number | null {
  if (!Number.isSafeInteger(left) || !Number.isSafeInteger(right)) return null;
  if (left < 0 || right < 0 || left > Math.floor(Number.MAX_SAFE_INTEGER / right)) {
    return null;
  }
  return left * right;
}

function safeAdd(left: number, right: number): number | null {
  if (!Number.isSafeInteger(left) || !Number.isSafeInteger(right)) return null;
  if (left < 0 || right < 0 || left > Number.MAX_SAFE_INTEGER - right) {
    return null;
  }
  return left + right;
}

type BudgetEvaluation =
  | Readonly<{
      ok: true;
      observation_bytes: number;
      total_upper_bound_bytes: number;
    }>
  | Readonly<{
      ok: false;
      reason: BudgetReason;
      observed_bounded_length: number;
      observed_length_unit: BudgetRejection["observed_length_unit"];
      relevant_maximum: number;
    }>;

function evaluateBudget(
  codeUnitCount: number,
  policy: BudgetPolicy,
): BudgetEvaluation {
  if (!Number.isSafeInteger(codeUnitCount) || codeUnitCount < 0) {
    return freezeOwned({
      ok: false as const,
      reason: "unsafe_budget_arithmetic" as const,
      observed_bounded_length: Number.MAX_SAFE_INTEGER,
      observed_length_unit: "utf16_code_units" as const,
      relevant_maximum: policy.maximum_code_units,
    });
  }
  if (codeUnitCount > policy.maximum_code_units) {
    return freezeOwned({
      ok: false as const,
      reason: "maximum_code_units_exceeded" as const,
      observed_bounded_length: codeUnitCount,
      observed_length_unit: "utf16_code_units" as const,
      relevant_maximum: policy.maximum_code_units,
    });
  }

  const payloadBytes = safeMultiply(codeUnitCount, 2);
  const observationBytes = payloadBytes === null
    ? null
    : safeAdd(observationFrameFixedBytes, payloadBytes);
  if (observationBytes === null) {
    return freezeOwned({
      ok: false as const,
      reason: "unsafe_budget_arithmetic" as const,
      observed_bounded_length: codeUnitCount,
      observed_length_unit: "framed_observation_bytes" as const,
      relevant_maximum: policy.maximum_observation_bytes,
    });
  }
  if (observationBytes > policy.maximum_observation_bytes) {
    return freezeOwned({
      ok: false as const,
      reason: "maximum_observation_bytes_exceeded" as const,
      observed_bounded_length: observationBytes,
      observed_length_unit: "framed_observation_bytes" as const,
      relevant_maximum: policy.maximum_observation_bytes,
    });
  }

  const parserVariableBytes = safeMultiply(
    codeUnitCount,
    parserWorstCaseBytesPerCodeUnit,
  );
  const parserUpperBound = parserVariableBytes === null
    ? null
    : safeAdd(parserSnapshotFixedBytes, parserVariableBytes);
  const observationAndParser = parserUpperBound === null
    ? null
    : safeAdd(observationBytes, parserUpperBound);
  const totalUpperBound = observationAndParser === null
    ? null
    : safeAdd(observationAndParser, fixedContractOverheadBytes);
  if (totalUpperBound === null) {
    return freezeOwned({
      ok: false as const,
      reason: "unsafe_budget_arithmetic" as const,
      observed_bounded_length: codeUnitCount,
      observed_length_unit: "conservative_total_bytes" as const,
      relevant_maximum: policy.maximum_total_bytes,
    });
  }
  if (totalUpperBound > policy.maximum_total_bytes) {
    return freezeOwned({
      ok: false as const,
      reason: "maximum_total_bytes_exceeded" as const,
      observed_bounded_length: totalUpperBound,
      observed_length_unit: "conservative_total_bytes" as const,
      relevant_maximum: policy.maximum_total_bytes,
    });
  }
  return freezeOwned({
    ok: true as const,
    observation_bytes: observationBytes,
    total_upper_bound_bytes: totalUpperBound,
  });
}

function inertResult(
  reason: BoundaryFailureReason,
  captured: 0 | 1,
): Action654sSeparatedBudgetResult {
  return freezeOwned({
    contract_version: contractVersion,
    boundary_status: "rejected" as const,
    budget_policy_version: policyVersion,
    budget_rejection: null,
    gate_snapshot: null,
    predecessor_result: null,
    failure_reason: reason,
    observation_frame_version: frameVersion,
    observation_input_domain: inputDomain,
    observed_string_encoding: null,
    observed_string_code_unit_count: null,
    observed_string_observation_byte_count: null,
    observed_string_total_upper_bound_bytes: null,
    observed_string_digest: null,
    failure_identity: null,
    terminal_digest: null,
    capture: freezeOwned({
      primitive_captures: captured,
      primitive_length_reads: 0 as const,
    }),
    work: zeroWork,
    safety,
  });
}

function budgetRejected(
  evaluation: Extract<BudgetEvaluation, { ok: false }>,
): Action654sSeparatedBudgetResult {
  return freezeOwned({
    contract_version: contractVersion,
    boundary_status: "budget_rejected" as const,
    budget_policy_version: policyVersion,
    budget_rejection: freezeOwned({
      policy_version: policyVersion,
      reason: evaluation.reason,
      observed_bounded_length: evaluation.observed_bounded_length,
      observed_length_unit: evaluation.observed_length_unit,
      relevant_maximum: evaluation.relevant_maximum,
      cryptographic_input_binding_claimed: false as const,
    }),
    gate_snapshot: null,
    predecessor_result: null,
    failure_reason: null,
    observation_frame_version: frameVersion,
    observation_input_domain: inputDomain,
    observed_string_encoding: null,
    observed_string_code_unit_count: null,
    observed_string_observation_byte_count: null,
    observed_string_total_upper_bound_bytes: null,
    observed_string_digest: null,
    failure_identity: null,
    terminal_digest: null,
    capture: freezeOwned({
      primitive_captures: 1 as const,
      primitive_length_reads: 1 as const,
    }),
    work: zeroWork,
    safety,
  });
}

function losslessObserve(
  captured: string,
  codeUnitCount: number,
  budget: Extract<BudgetEvaluation, { ok: true }>,
): LosslessObservation {
  const chunks = new Array<string>(codeUnitCount);
  for (let index = 0; index < codeUnitCount; index += 1) {
    chunks[index] = captured.charCodeAt(index).toString(16).padStart(4, "0");
  }
  const frame = freezeOwned({
    frame_version: frameVersion,
    input_domain: inputDomain,
    policy_version: policyVersion,
    code_unit_encoding: observationEncoding,
    code_unit_endianness: "big" as const,
    code_unit_count: codeUnitCount,
    framed_observation_byte_count: budget.observation_bytes,
    code_units_big_endian_hex: chunks.join(""),
  });
  return freezeOwned({
    code_unit_count: codeUnitCount,
    observation_byte_count: budget.observation_bytes,
    total_upper_bound_bytes: budget.total_upper_bound_bytes,
    digest: `action_654s_observed_gate_utf16_${hashAction650sCanonicalValue(frame)}`,
  });
}

function completedWork(
  observation: LosslessObservation,
  predecessor: Action654hPrivateReadinessResult | null,
  parserInvocations: 0 | 1,
  canonicalSerializations: 0 | 1,
  gateSnapshots: 0 | 1,
  failureDigests: 0 | 1,
): WorkCounters {
  return freezeOwned({
    utf16_framing_allocations: 1,
    code_unit_iterations: observation.code_unit_count,
    observation_digest_operations: 1,
    failure_digest_operations: failureDigests,
    terminal_digest_operations: 1,
    parser_invocations: parserInvocations,
    canonical_serializations: canonicalSerializations,
    gate_snapshot_constructions: gateSnapshots,
    capsule_operations: predecessor?.effects.capsule_mints ?? 0,
    readiness_operations: predecessor?.effects.readiness_classifications ?? 0,
    v5_invocations: predecessor?.effects.v5_invocations ?? 0,
    v5_establishments: predecessor?.effects.v5_establishments ?? 0,
    confirmation_consumptions:
      predecessor?.effects.confirmation_consumptions ?? 0,
    caller_property_reads: 0,
    getter_executions: 0,
    proxy_hooks_executed: 0,
    callback_executions: 0,
    transport_requests: 0,
    broker_submissions: 0,
    database_writes: 0,
    trade_mutations: 0,
  });
}

function observedFailure(
  observation: LosslessObservation,
  reason: Extract<
    BoundaryFailureReason,
    | "gate_json_parse_failed"
    | "gate_schema_rejected"
    | "gate_noncanonical_code_units"
  >,
  parserInvocations: 0 | 1,
  canonicalSerializations: 0 | 1,
): Action654sSeparatedBudgetResult {
  const failureIdentity = `action_654s_gate_failure_${hashAction650sCanonicalValue({
    contract_version: contractVersion,
    policy_version: policyVersion,
    reason,
    observed_string_digest: observation.digest,
  })}`;
  const terminalDigest = `action_654s_gate_terminal_${hashAction650sCanonicalValue({
    contract_version: contractVersion,
    boundary_status: "rejected",
    reason,
    observed_string_digest: observation.digest,
    failure_identity: failureIdentity,
  })}`;
  return freezeOwned({
    contract_version: contractVersion,
    boundary_status: "rejected" as const,
    budget_policy_version: policyVersion,
    budget_rejection: null,
    gate_snapshot: null,
    predecessor_result: null,
    failure_reason: reason,
    observation_frame_version: frameVersion,
    observation_input_domain: inputDomain,
    observed_string_encoding: observationEncoding,
    observed_string_code_unit_count: observation.code_unit_count,
    observed_string_observation_byte_count: observation.observation_byte_count,
    observed_string_total_upper_bound_bytes:
      observation.total_upper_bound_bytes,
    observed_string_digest: observation.digest,
    failure_identity: failureIdentity,
    terminal_digest: terminalDigest,
    capture: freezeOwned({
      primitive_captures: 1 as const,
      primitive_length_reads: 1 as const,
    }),
    work: completedWork(
      observation,
      null,
      parserInvocations,
      canonicalSerializations,
      0,
      1,
    ),
    safety,
  });
}

function runWithPolicy(
  canonicalGateInput: unknown,
  input: Action654hPrivateReadinessInput | unknown,
  policy: BudgetPolicy,
): Action654sSeparatedBudgetResult {
  const captured = canonicalGateInput;
  if (typeof captured !== "string") return inertResult("gate_input_not_primitive_string", 0);

  const codeUnitCount = captured.length;
  const budget = evaluateBudget(codeUnitCount, policy);
  if (!budget.ok) return budgetRejected(budget);

  const observation = losslessObserve(captured, codeUnitCount, budget);
  let parsed: unknown;
  try {
    parsed = JSON.parse(captured);
  } catch {
    return observedFailure(observation, "gate_json_parse_failed", 1, 0);
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return observedFailure(observation, "gate_schema_rejected", 1, 0);
  }
  const engineOwned = parsed as Record<string, unknown>;
  if (
    engineOwned.version !== gateVersion ||
    typeof engineOwned.enabled !== "boolean" ||
    typeof engineOwned.kill_switch_active !== "boolean"
  ) {
    return observedFailure(observation, "gate_schema_rejected", 1, 0);
  }
  const canonical = JSON.stringify({
    version: gateVersion,
    enabled: engineOwned.enabled,
    kill_switch_active: engineOwned.kill_switch_active,
  });
  if (canonical !== captured) {
    return observedFailure(
      observation,
      "gate_noncanonical_code_units",
      1,
      1,
    );
  }

  const gateSnapshot = freezeOwned({
    version: gateVersion,
    enabled: engineOwned.enabled,
    kill_switch_active: engineOwned.kill_switch_active,
  });
  const predecessor = runAction654hPrivateReadinessComposition(
    {
      enabled: gateSnapshot.enabled,
      kill_switch_active: gateSnapshot.kill_switch_active,
    },
    input,
  );
  const terminalDigest = `action_654s_gate_terminal_${hashAction650sCanonicalValue({
    contract_version: contractVersion,
    boundary_status: "accepted",
    policy_version: policyVersion,
    observed_string_digest: observation.digest,
    gate_snapshot: gateSnapshot,
    predecessor_terminal_digest: predecessor.terminal_digest,
  })}`;
  return freezeOwned({
    contract_version: contractVersion,
    boundary_status: "accepted" as const,
    budget_policy_version: policyVersion,
    budget_rejection: null,
    gate_snapshot: gateSnapshot,
    predecessor_result: predecessor,
    failure_reason: null,
    observation_frame_version: frameVersion,
    observation_input_domain: inputDomain,
    observed_string_encoding: observationEncoding,
    observed_string_code_unit_count: observation.code_unit_count,
    observed_string_observation_byte_count: observation.observation_byte_count,
    observed_string_total_upper_bound_bytes:
      observation.total_upper_bound_bytes,
    observed_string_digest: observation.digest,
    failure_identity: null,
    terminal_digest: terminalDigest,
    capture: freezeOwned({
      primitive_captures: 1 as const,
      primitive_length_reads: 1 as const,
    }),
    work: completedWork(observation, predecessor, 1, 1, 1, 0),
    safety,
  });
}

/**
 * Production entry point. The optional rest is rejection-only: any attempted
 * policy injection is rejected without inspecting the supplied value.
 */
export function runAction654sFailFastSeparatedStringBudget(
  canonicalGateInput: unknown,
  input: Action654hPrivateReadinessInput | unknown,
  ...unexpectedPolicyArguments: readonly unknown[]
): Action654sSeparatedBudgetResult {
  if (unexpectedPolicyArguments.length !== 0) {
    return inertResult("budget_policy_override_rejected", 0);
  }
  return runWithPolicy(canonicalGateInput, input, productionBudgetPolicy);
}

type PrivateBoundaryRow = Readonly<{
  offset: -1 | 0 | 1;
  code_unit_count: number;
  status: "within_budget" | "budget_rejected";
  reason: BudgetReason | null;
  budget_rejection_work_is_zero: boolean | null;
}>;

function fixedBoundaryRows(
  policy: BudgetPolicy,
  exactCodeUnits: number,
): readonly PrivateBoundaryRow[] {
  return Object.freeze(([-1, 0, 1] as const).map((offset) => {
    const codeUnitCount = exactCodeUnits + offset;
    const result = runWithPolicy("x".repeat(codeUnitCount), null, policy);
    const budgetRejected = result.boundary_status === "budget_rejected";
    return freezeOwned({
      offset,
      code_unit_count: codeUnitCount,
      status: budgetRejected ? "budget_rejected" as const : "within_budget" as const,
      reason: result.budget_rejection?.reason ?? null,
      budget_rejection_work_is_zero: budgetRejected
        ? Object.values(result.work).every((counter) => counter === 0)
        : null,
    });
  }));
}

/**
 * Argumentless review projection over fixed module-owned test policies. It
 * cannot choose, clone, mutate, or inject a production policy.
 */
export function readAction654sPrivateBoundaryMatrixForReview() {
  const exactCodeUnits = 8;
  const codeUnitPolicy: BudgetPolicy = Object.freeze({
    maximum_code_units: exactCodeUnits,
    maximum_observation_bytes: 10_000,
    maximum_total_bytes: 10_000,
  });
  const observationExact = observationFrameFixedBytes + exactCodeUnits * 2;
  const observationPolicy: BudgetPolicy = Object.freeze({
    maximum_code_units: 32,
    maximum_observation_bytes: observationExact,
    maximum_total_bytes: 10_000,
  });
  const totalExact = observationExact +
    parserSnapshotFixedBytes +
    exactCodeUnits * parserWorstCaseBytesPerCodeUnit +
    fixedContractOverheadBytes;
  const totalPolicy: BudgetPolicy = Object.freeze({
    maximum_code_units: 32,
    maximum_observation_bytes: 10_000,
    maximum_total_bytes: totalExact,
  });
  const unsafePolicy: BudgetPolicy = Object.freeze({
    maximum_code_units: Number.MAX_SAFE_INTEGER,
    maximum_observation_bytes: Number.MAX_SAFE_INTEGER,
    maximum_total_bytes: Number.MAX_SAFE_INTEGER,
  });
  const unsafe = evaluateBudget(Number.MAX_SAFE_INTEGER, unsafePolicy);
  return freezeOwned({
    code_units: fixedBoundaryRows(codeUnitPolicy, exactCodeUnits),
    observation_bytes: fixedBoundaryRows(observationPolicy, exactCodeUnits),
    total_bytes: fixedBoundaryRows(totalPolicy, exactCodeUnits),
    unsafe_arithmetic: freezeOwned({
      status: unsafe.ok ? "within_budget" as const : "budget_rejected" as const,
      reason: unsafe.ok ? null : unsafe.reason,
    }),
  });
}
