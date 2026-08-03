import type { Action653hExecutionInstructionRequest } from "../../lib/action-653h-safe-instruction-successor";
import {
  buildAction653aFixtureScenario,
  type Action653aFixtureClock,
  type Action653aFixtureScenario,
} from "./action-653a-broker-neutral-execution-instruction-fixtures";

export type Action653hFixtureScenario = Readonly<{
  predecessor: Action653aFixtureScenario;
  request: Action653hExecutionInstructionRequest;
}>;

export function buildAction653hFixtureScenario(
  clock: Action653aFixtureClock = "utc_a",
  options: Readonly<{
    consumed_at?: string;
    observed_at?: string;
    reverse_input_order?: boolean;
  }> = {},
): Action653hFixtureScenario {
  const predecessor = buildAction653aFixtureScenario(clock, options);
  const source = predecessor.request;
  const values: Action653hExecutionInstructionRequest = {
    prepared: source.prepared,
    risk_admission: source.risk_admission,
    confirmation_boundary: source.confirmation_boundary,
    confirmation_capability: source.confirmation_capability,
    consumed_at: source.consumed_at,
    observed_at: source.observed_at,
  };
  const request = options.reverse_input_order
    ? ({
        observed_at: values.observed_at,
        consumed_at: values.consumed_at,
        confirmation_capability: values.confirmation_capability,
        confirmation_boundary: values.confirmation_boundary,
        risk_admission: values.risk_admission,
        prepared: values.prepared,
      } satisfies Action653hExecutionInstructionRequest)
    : values;
  return { predecessor, request };
}

export const action653hGoldenMatrixCases = [
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
