import {
  runAction654hPrivateReadinessComposition,
  type Action654hPrivateReadinessInput,
  type Action654hPrivateReadinessResult,
} from "../../lib/action-654h-private-readiness-provenance";

export type Action654hFixtureClock =
  | "utc_a"
  | "utc_b"
  | "stockholm"
  | "new_york";

const observedInstants: Record<Action654hFixtureClock, string> = {
  utc_a: "2026-07-29T10:00:02.000000000Z",
  utc_b: "2026-07-29T10:00:02Z",
  stockholm: "2026-07-29T12:00:02+02:00",
  new_york: "2026-07-29T06:00:02-04:00",
};

const evaluatedInstants: Record<Action654hFixtureClock, string> = {
  utc_a: "2026-07-29T10:05:00.000000000Z",
  utc_b: "2026-07-29T10:05:00Z",
  stockholm: "2026-07-29T12:05:00+02:00",
  new_york: "2026-07-29T06:05:00-04:00",
};

export function action654hPlainFixture(
  idempotencyKey: string,
  options: Readonly<{
    clock?: Action654hFixtureClock;
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

export function runAction654hPlainFixture(
  idempotencyKey: string,
  options: Parameters<typeof action654hPlainFixture>[1] = {},
): Action654hPrivateReadinessResult {
  return runAction654hPrivateReadinessComposition(
    { enabled: true, kill_switch_active: false },
    action654hPlainFixture(idempotencyKey, options),
  );
}

export const action654hGoldenCases = [
  { name: "utc_a", clock: "utc_a", reverse_input_order: false },
  { name: "utc_b", clock: "utc_b", reverse_input_order: false },
  { name: "stockholm", clock: "stockholm", reverse_input_order: false },
  { name: "new_york", clock: "new_york", reverse_input_order: false },
  { name: "reverse_input_order", clock: "utc_a", reverse_input_order: true },
] as const;
