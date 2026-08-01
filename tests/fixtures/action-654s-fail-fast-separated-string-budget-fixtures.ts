import type { Action654hPrivateReadinessInput } from "../../lib/action-654h-private-readiness-provenance";
import {
  action654sCanonicalGates,
  runAction654sFailFastSeparatedStringBudget,
} from "../../lib/action-654s-fail-fast-separated-string-budget";

export type Action654sFixtureClock =
  | "utc_a"
  | "utc_b"
  | "stockholm"
  | "new_york";

const observedInstants: Record<Action654sFixtureClock, string> = {
  utc_a: "2026-07-29T10:00:02.000000000Z",
  utc_b: "2026-07-29T10:00:02Z",
  stockholm: "2026-07-29T12:00:02+02:00",
  new_york: "2026-07-29T06:00:02-04:00",
};

const evaluatedInstants: Record<Action654sFixtureClock, string> = {
  utc_a: "2026-07-29T10:05:00.000000000Z",
  utc_b: "2026-07-29T10:05:00Z",
  stockholm: "2026-07-29T12:05:00+02:00",
  new_york: "2026-07-29T06:05:00-04:00",
};

export function action654sPlainFixture(
  idempotencyKey: string,
  options: Readonly<{
    clock?: Action654sFixtureClock;
    reverse_input_order?: boolean;
  }> = {},
): Action654hPrivateReadinessInput {
  const clock = options.clock ?? "utc_a";
  const suffix = idempotencyKey
    .replace(/^action_654s_/, "s_")
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

export function runAction654sPlainFixture(
  idempotencyKey: string,
  options: Parameters<typeof action654sPlainFixture>[1] = {},
) {
  return runAction654sFailFastSeparatedStringBudget(
    action654sCanonicalGates.enabled,
    action654sPlainFixture(idempotencyKey, options),
  );
}

export const action654sGoldenCases = [
  { name: "utc_a", clock: "utc_a", reverse_input_order: false },
  { name: "utc_b", clock: "utc_b", reverse_input_order: false },
  { name: "stockholm", clock: "stockholm", reverse_input_order: false },
  { name: "new_york", clock: "new_york", reverse_input_order: false },
  { name: "reverse_input_order", clock: "utc_a", reverse_input_order: true },
] as const;

export const action654sMalformedInputs = Object.freeze({
  malformed_json: "{",
  lone_high_d800: "{\ud800",
  lone_high_d801: "{\ud801",
  lone_low_dc00: "{\udc00",
  lone_low_dc01: "{\udc01",
  valid_pair: "{\ud83d\ude00",
  separated_pair: "{\ud83d-\ude00",
  composed_e_acute: '"é"',
  decomposed_e_acute: '"e\u0301"',
  reordered_fields:
    '{"enabled":true,"version":"action_654o_canonical_gate_v1","kill_switch_active":false}',
  duplicate_field:
    '{"version":"action_654o_canonical_gate_v1","enabled":true,"enabled":false,"kill_switch_active":false}',
});
