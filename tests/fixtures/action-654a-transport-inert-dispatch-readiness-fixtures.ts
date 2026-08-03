import {
  runAction653sNonExportableAuthorityInstruction,
  type Action653sInstructionResult,
} from "../../lib/action-653s-non-exportable-authority-transaction";
import {
  runAction654aTransportInertDispatchReadiness,
  type Action654aDispatchReadinessResult,
  type Action654aReadinessInput,
} from "../../lib/action-654a-transport-inert-dispatch-readiness";

export type Action654aFixtureClock =
  | "utc_a"
  | "utc_b"
  | "stockholm"
  | "new_york";

const evaluationInstants: Record<Action654aFixtureClock, string> = {
  utc_a: "2026-07-29T10:05:00.000000000Z",
  utc_b: "2026-07-29T10:05:00Z",
  stockholm: "2026-07-29T12:05:00+02:00",
  new_york: "2026-07-29T06:05:00-04:00",
};

function reverseObjectOrder(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(reverseObjectOrder).reverse();
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .reverse()
      .map(([key, member]) => [key, reverseObjectOrder(member)]),
  );
}

export function action654aApprovedV5Result(
  idempotencyKey: string,
  observedAt = "2026-07-29T10:00:02.000000000Z",
): Action653sInstructionResult {
  return runAction653sNonExportableAuthorityInstruction(
    { enabled: true, kill_switch_active: false },
    {
      request_version: "action_653s_plain_instruction_request_v1",
      operation: "action_653s_prepare_synthetic_instruction",
      idempotency_key: idempotencyKey,
      observed_at: observedAt,
    },
  );
}

export function action654aReadinessFixture(
  idempotencyKey: string,
  options: Readonly<{
    clock?: Action654aFixtureClock;
    evaluated_at?: string;
    instruction_observed_at?: string;
    reverse_input_order?: boolean;
  }> = {},
): Action654aReadinessInput {
  const input: Action654aReadinessInput = {
    v5_instruction_result: action654aApprovedV5Result(
      idempotencyKey,
      options.instruction_observed_at,
    ),
    evaluated_at:
      options.evaluated_at ?? evaluationInstants[options.clock ?? "utc_a"],
  };
  return options.reverse_input_order
    ? (reverseObjectOrder(input) as Action654aReadinessInput)
    : input;
}

export function runAction654aReadinessFixture(
  idempotencyKey: string,
  options: Parameters<typeof action654aReadinessFixture>[1] = {},
): Action654aDispatchReadinessResult {
  return runAction654aTransportInertDispatchReadiness(
    { enabled: true, kill_switch_active: false },
    action654aReadinessFixture(idempotencyKey, options),
  );
}

export const action654aGoldenCases = [
  { name: "utc_a", clock: "utc_a", reverse_input_order: false },
  { name: "utc_b", clock: "utc_b", reverse_input_order: false },
  { name: "stockholm", clock: "stockholm", reverse_input_order: false },
  { name: "new_york", clock: "new_york", reverse_input_order: false },
  { name: "reverse_input_order", clock: "utc_a", reverse_input_order: true },
] as const;
