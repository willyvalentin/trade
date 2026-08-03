import {
  runAction653sNonExportableAuthorityInstruction,
  type Action653sInstructionResult,
  type Action653sPublicInstructionInput,
} from "../../lib/action-653s-non-exportable-authority-transaction";

export type Action653sFixtureClock =
  | "utc_a"
  | "utc_b"
  | "stockholm"
  | "new_york";

const observedInstants: Record<Action653sFixtureClock, string> = {
  utc_a: "2026-07-29T10:00:02.000000000Z",
  utc_b: "2026-07-29T10:00:02Z",
  stockholm: "2026-07-29T12:00:02+02:00",
  new_york: "2026-07-29T06:00:02-04:00",
};

export function action653sPlainFixture(
  idempotencyKey: string,
  options: Readonly<{
    clock?: Action653sFixtureClock;
    observed_at?: string;
    reverse_input_order?: boolean;
  }> = {},
): Action653sPublicInstructionInput {
  const values: Action653sPublicInstructionInput = {
    request_version: "action_653s_plain_instruction_request_v1",
    operation: "action_653s_prepare_synthetic_instruction",
    idempotency_key: idempotencyKey,
    observed_at:
      options.observed_at ?? observedInstants[options.clock ?? "utc_a"],
  };
  return options.reverse_input_order
    ? {
        observed_at: values.observed_at,
        idempotency_key: values.idempotency_key,
        operation: values.operation,
        request_version: values.request_version,
      }
    : values;
}

export function runAction653sPlainFixture(
  idempotencyKey: string,
  options: Parameters<typeof action653sPlainFixture>[1] = {},
): Action653sInstructionResult {
  return runAction653sNonExportableAuthorityInstruction(
    { enabled: true, kill_switch_active: false },
    action653sPlainFixture(idempotencyKey, options),
  );
}

export const action653sGoldenCases = [
  { name: "utc_a", clock: "utc_a", reverse_input_order: false },
  { name: "utc_b", clock: "utc_b", reverse_input_order: false },
  { name: "stockholm", clock: "stockholm", reverse_input_order: false },
  { name: "new_york", clock: "new_york", reverse_input_order: false },
  { name: "reverse_input_order", clock: "utc_a", reverse_input_order: true },
] as const;
