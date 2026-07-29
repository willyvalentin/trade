import type { Action651cDiagnosticAuditInput } from "../../lib/action-651c-execution-quality-audit-v2";
import {
  buildAction651aFixtureScenario,
  type Action651aFixtureClock,
  type Action651aFixtureScenario,
} from "./action-651a-diagnostic-execution-quality-fixtures";

export type Action651cFixtureScenario = Readonly<{
  predecessor: Action651aFixtureScenario;
  input: Action651cDiagnosticAuditInput;
}>;

export function buildAction651cFixtureScenario(
  clock: Action651aFixtureClock = "utc_a",
  options: Parameters<typeof buildAction651aFixtureScenario>[1] = {},
): Action651cFixtureScenario {
  const predecessor = buildAction651aFixtureScenario(clock, options);
  return {
    predecessor,
    input: {
      ...predecessor.input,
    },
  };
}

export const action651cGoldenMatrixCases = [
  { name: "utc_a", clock: "utc_a", reverse_input_order: false },
  { name: "utc_b", clock: "utc_b", reverse_input_order: false },
  {
    name: "stockholm",
    clock: "stockholm",
    reverse_input_order: false,
  },
  {
    name: "new_york",
    clock: "new_york",
    reverse_input_order: false,
  },
  {
    name: "reverse_input_order",
    clock: "utc_a",
    reverse_input_order: true,
  },
] as const;
