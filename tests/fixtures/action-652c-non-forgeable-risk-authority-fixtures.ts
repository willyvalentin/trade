import type {
  Action652cAdmissionRequest,
} from "../../lib/action-652c-non-forgeable-risk-authority";
import {
  buildAction652aFixtureScenario,
  type Action652aFixtureClock,
  type Action652aFixtureScenario,
} from "./action-652a-execution-risk-envelope-admission-fixtures";

export type Action652cFixtureScenario = Readonly<{
  predecessor: Action652aFixtureScenario;
  request: Action652cAdmissionRequest;
}>;

export function buildAction652cFixtureScenario(
  clock: Action652aFixtureClock = "utc_a",
  options: Readonly<{
    admission_at?: string;
    reverse_allowlist?: boolean;
  }> = {},
): Action652cFixtureScenario {
  const predecessor = buildAction652aFixtureScenario(clock, {
    reverse_allowlist: options.reverse_allowlist,
    admission_at: options.admission_at,
  });
  return {
    predecessor,
    request: {
      prepared: predecessor.request.prepared,
      intent: predecessor.request.intent,
      admission_at: predecessor.request.admission_at,
    },
  };
}

export const action652cGoldenMatrixCases = [
  { name: "utc_a", clock: "utc_a", reverse_allowlist: false },
  { name: "utc_b", clock: "utc_b", reverse_allowlist: false },
  { name: "stockholm", clock: "stockholm", reverse_allowlist: false },
  { name: "new_york", clock: "new_york", reverse_allowlist: false },
  { name: "reverse_input_order", clock: "utc_a", reverse_allowlist: true },
] as const;
