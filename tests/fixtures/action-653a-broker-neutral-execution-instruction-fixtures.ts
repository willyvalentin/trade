import {
  runAction652cExecutionIntentAdmission,
  type Action652cAdmissionResult,
} from "../../lib/action-652c-non-forgeable-risk-authority";
import type {
  Action653aExecutionInstructionRequest,
} from "../../lib/action-653a-broker-neutral-execution-instruction";
import {
  buildAction652cFixtureScenario,
  type Action652cFixtureScenario,
} from "./action-652c-non-forgeable-risk-authority-fixtures";

export type Action653aFixtureClock =
  | "utc_a"
  | "utc_b"
  | "stockholm"
  | "new_york";

const instructionTimes: Record<
  Action653aFixtureClock,
  Readonly<{ consumed_at: string; observed_at: string }>
> = {
  utc_a: {
    consumed_at: "2026-07-29T10:00:02.000000000Z",
    observed_at: "2026-07-29T10:00:02.500000000Z",
  },
  utc_b: {
    consumed_at: "2026-07-29T10:00:02Z",
    observed_at: "2026-07-29T10:00:02.5+00:00",
  },
  stockholm: {
    consumed_at: "2026-07-29T12:00:02+02:00",
    observed_at: "2026-07-29T12:00:02.500000000+02:00",
  },
  new_york: {
    consumed_at: "2026-07-29T06:00:02-04:00",
    observed_at: "2026-07-29T06:00:02.500000000-04:00",
  },
};

export type Action653aFixtureScenario = Readonly<{
  predecessor: Action652cFixtureScenario;
  risk_admission: Action652cAdmissionResult;
  request: Action653aExecutionInstructionRequest;
}>;

export function buildAction653aFixtureScenario(
  clock: Action653aFixtureClock = "utc_a",
  options: Readonly<{
    consumed_at?: string;
    observed_at?: string;
    reverse_input_order?: boolean;
  }> = {},
): Action653aFixtureScenario {
  const predecessor = buildAction652cFixtureScenario(clock, {
    reverse_allowlist: options.reverse_input_order,
  });
  const riskAdmission = runAction652cExecutionIntentAdmission(
    { enabled: true, kill_switch_active: false },
    predecessor.request,
  );
  if (riskAdmission.admission_status !== "admitted") {
    throw new Error(
      `Action 653A fixture risk admission failed: ${riskAdmission.admission_reason}`,
    );
  }

  const confirmation =
    predecessor.predecessor.predecessor.predecessor;
  const time = instructionTimes[clock];
  const values: Action653aExecutionInstructionRequest = {
    prepared: confirmation.prepared,
    risk_admission: riskAdmission,
    confirmation_boundary: confirmation.boundary,
    confirmation_capability: confirmation.capability,
    consumed_at: options.consumed_at ?? time.consumed_at,
    observed_at: options.observed_at ?? time.observed_at,
  };
  const request = options.reverse_input_order
    ? ({
        observed_at: values.observed_at,
        consumed_at: values.consumed_at,
        confirmation_capability: values.confirmation_capability,
        confirmation_boundary: values.confirmation_boundary,
        risk_admission: values.risk_admission,
        prepared: values.prepared,
      } satisfies Action653aExecutionInstructionRequest)
    : values;

  return { predecessor, risk_admission: riskAdmission, request };
}

export const action653aGoldenMatrixCases = [
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
