import {
  action654oCanonicalGates,
  runAction654oCanonicalReadinessGate,
} from "../../lib/action-654o-hook-free-canonical-readiness-gate";
import type { Action654hPrivateReadinessInput } from "../../lib/action-654h-private-readiness-provenance";

export type Action654oFixtureClock =
  | "utc_a"
  | "utc_b"
  | "stockholm"
  | "new_york";

const observedInstants: Record<Action654oFixtureClock, string> = {
  utc_a: "2026-07-29T10:00:02.000000000Z",
  utc_b: "2026-07-29T10:00:02Z",
  stockholm: "2026-07-29T12:00:02+02:00",
  new_york: "2026-07-29T06:00:02-04:00",
};

const evaluatedInstants: Record<Action654oFixtureClock, string> = {
  utc_a: "2026-07-29T10:05:00.000000000Z",
  utc_b: "2026-07-29T10:05:00Z",
  stockholm: "2026-07-29T12:05:00+02:00",
  new_york: "2026-07-29T06:05:00-04:00",
};

export function action654oPlainFixture(
  idempotencyKey: string,
  options: Readonly<{
    clock?: Action654oFixtureClock;
    observed_at?: string;
    evaluated_at?: string;
    reverse_input_order?: boolean;
  }> = {},
): Action654hPrivateReadinessInput {
  const clock = options.clock ?? "utc_a";
  const input: Action654hPrivateReadinessInput = {
    request_version: "action_654h_private_readiness_request_v1",
    operation: "action_654h_establish_v5_and_readiness",
    idempotency_key: idempotencyKey,
    observed_at: options.observed_at ?? observedInstants[clock],
    evaluated_at: options.evaluated_at ?? evaluatedInstants[clock],
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

export function runAction654oPlainFixture(
  idempotencyKey: string,
  options: Parameters<typeof action654oPlainFixture>[1] = {},
) {
  return runAction654oCanonicalReadinessGate(
    action654oCanonicalGates.enabled,
    action654oPlainFixture(idempotencyKey, options),
  );
}

export const action654oGoldenCases = [
  { name: "utc_a", clock: "utc_a", reverse_input_order: false },
  { name: "utc_b", clock: "utc_b", reverse_input_order: false },
  { name: "stockholm", clock: "stockholm", reverse_input_order: false },
  { name: "new_york", clock: "new_york", reverse_input_order: false },
  { name: "reverse_input_order", clock: "utc_a", reverse_input_order: true },
] as const;

export const action654oMalformedGateCases = Object.freeze({
  malformed_json: "{",
  duplicate_field:
    '{"version":"action_654o_canonical_gate_v1","enabled":true,"enabled":false,"kill_switch_active":false}',
  reordered_fields:
    '{"enabled":true,"version":"action_654o_canonical_gate_v1","kill_switch_active":false}',
  extra_field:
    '{"version":"action_654o_canonical_gate_v1","enabled":true,"kill_switch_active":false,"extra":false}',
  missing_field:
    '{"version":"action_654o_canonical_gate_v1","enabled":true}',
  non_boolean:
    '{"version":"action_654o_canonical_gate_v1","enabled":1,"kill_switch_active":false}',
});
