import type { Action654hPrivateReadinessInput } from "../../lib/action-654h-private-readiness-provenance";
import { runAction654uExactBudgetUnitPrivatePolicy } from "../../lib/action-654u-exact-budget-unit-private-policy";

export const action654uCanonicalGates = Object.freeze({
  disabled:
    '{"version":"action_654o_canonical_gate_v1","enabled":false,"kill_switch_active":false}',
  enabled:
    '{"version":"action_654o_canonical_gate_v1","enabled":true,"kill_switch_active":false}',
  kill_switch_active:
    '{"version":"action_654o_canonical_gate_v1","enabled":true,"kill_switch_active":true}',
});

export type Action654uFixtureClock =
  | "utc_a"
  | "utc_b"
  | "stockholm"
  | "new_york";

const observedInstants: Record<Action654uFixtureClock, string> = {
  utc_a: "2026-07-29T10:00:02.000000000Z",
  utc_b: "2026-07-29T10:00:02Z",
  stockholm: "2026-07-29T12:00:02+02:00",
  new_york: "2026-07-29T06:00:02-04:00",
};

const evaluatedInstants: Record<Action654uFixtureClock, string> = {
  utc_a: "2026-07-29T10:05:00.000000000Z",
  utc_b: "2026-07-29T10:05:00Z",
  stockholm: "2026-07-29T12:05:00+02:00",
  new_york: "2026-07-29T06:05:00-04:00",
};

export function action654uPlainFixture(
  idempotencyKey: string,
  options: Readonly<{
    clock?: Action654uFixtureClock;
    reverse_input_order?: boolean;
  }> = {},
): Action654hPrivateReadinessInput {
  const clock = options.clock ?? "utc_a";
  const suffix = idempotencyKey
    .replace(/^action_654u_/, "u_")
    .replace(/[^a-z0-9_]/g, "_")
    .slice(0, 48);
  const input: Action654hPrivateReadinessInput = {
    request_version: "action_654h_private_readiness_request_v1",
    operation: "action_654h_establish_v5_and_readiness",
    idempotency_key: `action_654h_${suffix}`,
    observed_at: observedInstants[clock],
    evaluated_at: evaluatedInstants[clock],
  };
  return options.reverse_input_order
    ? {
        evaluated_at: input.evaluated_at,
        observed_at: input.observed_at,
        idempotency_key: input.idempotency_key,
        operation: input.operation,
        request_version: input.request_version,
      }
    : input;
}

export function runAction654uPlainFixture(
  idempotencyKey: string,
  options: Parameters<typeof action654uPlainFixture>[1] = {},
) {
  return runAction654uExactBudgetUnitPrivatePolicy(
    action654uCanonicalGates.enabled,
    action654uPlainFixture(idempotencyKey, options),
  );
}

export const action654uGoldenCases = [
  { name: "utc_a", clock: "utc_a", reverse_input_order: false },
  { name: "utc_b", clock: "utc_b", reverse_input_order: false },
  { name: "stockholm", clock: "stockholm", reverse_input_order: false },
  { name: "new_york", clock: "new_york", reverse_input_order: false },
  { name: "reverse_input_order", clock: "utc_a", reverse_input_order: true },
] as const;

export const action654uMalformedInputs = Object.freeze({
  malformed_json: "{",
  lone_high_d800: "{\ud800",
  lone_high_d801: "{\ud801",
  lone_low_dc00: "{\udc00",
  lone_low_dc01: "{\udc01",
  valid_pair: "{\ud83d\ude00",
  separated_pair: "{\ud83d-\ude00",
  composed_e_acute: '"é"',
  decomposed_e_acute: '"e\u0301"',
});

// Test-only, plain integer proof fixtures. These values are deliberately
// separated from reachable runtime costs and are never imported by production.
export const action654uExactUnitProof = Object.freeze({
  code_units: Object.freeze({
    configured_limit: 128,
    observed_integer_costs: Object.freeze([127, 128, 129]),
  }),
  observation_bytes: Object.freeze({
    configured_limit: 384,
    observed_integer_costs: Object.freeze([383, 384, 385]),
  }),
  total_bytes: Object.freeze({
    configured_limit: 1_984,
    observed_integer_costs: Object.freeze([1_983, 1_984, 1_985]),
  }),
});

export const action654uReachableRuntimeCostProof = Object.freeze({
  code_unit_counts: Object.freeze([127, 128, 129]),
  observation_byte_costs: Object.freeze([382, 384, 386]),
  total_byte_costs: Object.freeze([1_976, 1_984, 1_992]),
});
