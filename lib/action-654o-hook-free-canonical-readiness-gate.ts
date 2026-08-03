import { hashAction650sCanonicalValue } from "@/lib/action-650s-execution-identity";
import {
  runAction654hPrivateReadinessComposition,
  type Action654hPrivateReadinessInput,
  type Action654hPrivateReadinessResult,
} from "@/lib/action-654h-private-readiness-provenance";

const contractVersion = "action_654o_hook_free_canonical_readiness_gate_v1" as const;
const gateVersion = "action_654o_canonical_gate_v1" as const;

export const action654oGateBudgets = Object.freeze({
  maximum_characters: 128,
  maximum_utf8_bytes: 192,
});

export const action654oCanonicalGates = Object.freeze({
  disabled:
    '{"version":"action_654o_canonical_gate_v1","enabled":false,"kill_switch_active":false}',
  enabled:
    '{"version":"action_654o_canonical_gate_v1","enabled":true,"kill_switch_active":false}',
  kill_switch_active:
    '{"version":"action_654o_canonical_gate_v1","enabled":true,"kill_switch_active":true}',
});

type GateFailureReason =
  | "gate_input_not_primitive_string"
  | "gate_character_budget_exceeded"
  | "gate_utf8_budget_exceeded"
  | "gate_json_parse_failed"
  | "gate_schema_rejected"
  | "gate_noncanonical_bytes";

type CanonicalGateSnapshot = Readonly<{
  version: typeof gateVersion;
  enabled: boolean;
  kill_switch_active: boolean;
}>;

export type Action654oCanonicalGateResult = Readonly<{
  contract_version: typeof contractVersion;
  boundary_status: "accepted" | "rejected";
  gate_snapshot: CanonicalGateSnapshot | null;
  predecessor_result: Action654hPrivateReadinessResult | null;
  failure_reason: GateFailureReason | null;
  observed_string_character_count: number | null;
  observed_string_utf8_byte_count: number | null;
  observed_string_digest: string | null;
  failure_identity: string | null;
  effects: Readonly<{
    primitive_captures: 1;
    caller_property_reads: 0;
    reflection_operations_on_caller_input: 0;
    parser_invocations: 0 | 1;
    gate_snapshot_constructions: 0 | 1;
    gate_failure_digest_operations: 0 | 2;
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
    parser_invocations?: 0 | 1;
    gate_snapshot_constructions?: 0 | 1;
    gate_failure_digest_operations?: 0 | 2;
  }> = {},
): Action654oCanonicalGateResult["effects"] {
  return freezeEngineOwned({
    primitive_captures: 1 as const,
    caller_property_reads: 0 as const,
    reflection_operations_on_caller_input: 0 as const,
    parser_invocations: input.parser_invocations ?? (0 as const),
    gate_snapshot_constructions: input.gate_snapshot_constructions ?? (0 as const),
    gate_failure_digest_operations:
      input.gate_failure_digest_operations ?? (0 as const),
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

function rejectedNonString(): Action654oCanonicalGateResult {
  return freezeEngineOwned({
    contract_version: contractVersion,
    boundary_status: "rejected" as const,
    gate_snapshot: null,
    predecessor_result: null,
    failure_reason: "gate_input_not_primitive_string" as const,
    observed_string_character_count: null,
    observed_string_utf8_byte_count: null,
    observed_string_digest: null,
    failure_identity: null,
    effects: effects(null),
    safety,
  });
}

function rejectedString(
  captured: string,
  reason: Exclude<GateFailureReason, "gate_input_not_primitive_string">,
  parserInvocations: 0 | 1,
  utf8Bytes?: Uint8Array,
): Action654oCanonicalGateResult {
  const bytes = utf8Bytes ?? new TextEncoder().encode(captured);
  const observedStringDigest = `action_654o_observed_gate_string_${hashAction650sCanonicalValue({
    utf8_hex: Buffer.from(bytes).toString("hex"),
    utf8_byte_count: bytes.byteLength,
    character_count: captured.length,
  })}`;
  const failureIdentity = `action_654o_gate_failure_${hashAction650sCanonicalValue({
    reason,
    observed_string_digest: observedStringDigest,
  })}`;
  return freezeEngineOwned({
    contract_version: contractVersion,
    boundary_status: "rejected" as const,
    gate_snapshot: null,
    predecessor_result: null,
    failure_reason: reason,
    observed_string_character_count: captured.length,
    observed_string_utf8_byte_count: bytes.byteLength,
    observed_string_digest: observedStringDigest,
    failure_identity: failureIdentity,
    effects: effects(null, {
      parser_invocations: parserInvocations,
      gate_failure_digest_operations: 2,
    }),
    safety,
  });
}

function canonicalGateSnapshot(
  captured: string,
  bytes: Uint8Array,
):
  | Readonly<{ ok: true; snapshot: CanonicalGateSnapshot }>
  | Readonly<{
      ok: false;
      result: Action654oCanonicalGateResult;
    }> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(captured);
  } catch {
    return {
      ok: false,
      result: rejectedString(captured, "gate_json_parse_failed", 1, bytes),
    };
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {
      ok: false,
      result: rejectedString(captured, "gate_schema_rejected", 1, bytes),
    };
  }

  // JSON.parse created this object inside the engine. These are not reads from
  // caller-owned objects, and the parsed object never crosses the boundary.
  const engineOwned = parsed as Record<string, unknown>;
  if (
    engineOwned.version !== gateVersion ||
    typeof engineOwned.enabled !== "boolean" ||
    typeof engineOwned.kill_switch_active !== "boolean"
  ) {
    return {
      ok: false,
      result: rejectedString(captured, "gate_schema_rejected", 1, bytes),
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
      result: rejectedString(captured, "gate_noncanonical_bytes", 1, bytes),
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
 * Hook-free readiness gate boundary. The caller-controlled gate value is
 * captured once and is rejected unless it is a primitive canonical JSON
 * string. Only a new engine-owned, frozen gate snapshot reaches Action 654H.
 */
export function runAction654oCanonicalReadinessGate(
  canonicalGateInput: unknown,
  input: Action654hPrivateReadinessInput | unknown,
): Action654oCanonicalGateResult {
  const captured = canonicalGateInput;
  if (typeof captured !== "string") return rejectedNonString();

  if (captured.length > action654oGateBudgets.maximum_characters) {
    return rejectedString(captured, "gate_character_budget_exceeded", 0);
  }
  const bytes = new TextEncoder().encode(captured);
  if (bytes.byteLength > action654oGateBudgets.maximum_utf8_bytes) {
    return rejectedString(captured, "gate_utf8_budget_exceeded", 0, bytes);
  }

  const gate = canonicalGateSnapshot(captured, bytes);
  if (!gate.ok) return gate.result;

  const predecessor = runAction654hPrivateReadinessComposition(
    {
      enabled: gate.snapshot.enabled,
      kill_switch_active: gate.snapshot.kill_switch_active,
    },
    input,
  );
  return freezeEngineOwned({
    contract_version: contractVersion,
    boundary_status: "accepted" as const,
    gate_snapshot: gate.snapshot,
    predecessor_result: predecessor,
    failure_reason: null,
    observed_string_character_count: captured.length,
    observed_string_utf8_byte_count: bytes.byteLength,
    observed_string_digest: null,
    failure_identity: null,
    effects: effects(predecessor, {
      parser_invocations: 1,
      gate_snapshot_constructions: 1,
    }),
    safety,
  });
}
