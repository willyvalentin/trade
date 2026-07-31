import {
  issueAction653lPrivateAuthorityTicket,
  type Action653lInstructionRequest,
  type Action653lPrivateAuthorityGrant,
} from "../../lib/action-653l-handle-opaque-authority-transaction";
import {
  buildAction653jFixtureScenario,
  type Action653jFixtureScenario,
} from "./action-653j-internal-verification-capsule-fixtures";
import type { Action653aFixtureClock } from "./action-653a-broker-neutral-execution-instruction-fixtures";

export type Action653lFixtureScenario = Readonly<{
  predecessor: Action653jFixtureScenario;
  grant: Action653lPrivateAuthorityGrant;
  request: Action653lInstructionRequest;
}>;

export function buildAction653lFixtureScenario(
  clock: Action653aFixtureClock = "utc_a",
  options: Readonly<{
    consumed_at?: string;
    observed_at?: string;
    reverse_input_order?: boolean;
  }> = {},
): Action653lFixtureScenario {
  const predecessor = buildAction653jFixtureScenario(clock, options);
  const source = predecessor.request;
  const grant = issueAction653lPrivateAuthorityTicket({
    preparation_authority: source.prepared,
    risk_authority: source.risk_admission,
    confirmation_boundary_authority: source.confirmation_boundary,
    confirmation_capability_authority: source.confirmation_capability,
  });
  if (!grant) throw new Error("Action 653L private authority issuance failed");

  const values: Action653lInstructionRequest = {
    authority_ticket: grant.authority_ticket,
    projection: grant.projection,
    consumed_at: source.consumed_at,
    observed_at: source.observed_at,
  };
  const request = options.reverse_input_order
    ? ({
        observed_at: values.observed_at,
        consumed_at: values.consumed_at,
        projection: values.projection,
        authority_ticket: values.authority_ticket,
      } satisfies Action653lInstructionRequest)
    : values;
  return { predecessor, grant, request };
}

export const action653lGoldenMatrixCases = [
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
