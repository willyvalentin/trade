import {
  buildAction650uSimulatedBrokerEventBinding,
  type Action650uSimulatedBrokerEvent,
} from "../../lib/action-650u-confirmed-execution-replay";
import { createAction650sRuntimeIdentityContext } from "../../lib/action-650s-execution-identity";
import {
  prepareAction650sExecution,
  type Action650sExecutionCandidate,
  type Action650sPreparedExecution,
} from "../../lib/action-650s-execution-preparation";
import {
  createAction650uManualConfirmationBoundary,
  type Action650uManualConfirmationBoundary,
  type Action650uManualConfirmationCapability,
} from "../../lib/action-650u-manual-confirmation";
import type { Action651aDiagnosticAuditInput } from "../../lib/action-651a-diagnostic-execution-quality-audit";

export type Action651aFixtureClock =
  | "utc_a"
  | "utc_b"
  | "stockholm"
  | "new_york";

type FixtureInstants = Readonly<{
  runtime_created: string;
  candidate_created: string;
  session_started: string;
  planned_and_waiting: string;
  confirmed: string;
  consumed: string;
  progress: string;
  terminal: string;
  expires: string;
}>;

const instants: Record<Action651aFixtureClock, FixtureInstants> = {
  utc_a: {
    runtime_created: "2026-07-29T09:55:00.000000000Z",
    candidate_created: "2026-07-29T09:50:00.000000000Z",
    session_started: "2026-07-29T09:59:00.000000000Z",
    planned_and_waiting: "2026-07-29T10:00:00.000000000Z",
    confirmed: "2026-07-29T10:00:01.000000000Z",
    consumed: "2026-07-29T10:00:02.000000000Z",
    progress: "2026-07-29T10:00:02.500000000Z",
    terminal: "2026-07-29T10:00:03.000000000Z",
    expires: "2026-07-29T10:10:00.000000000Z",
  },
  utc_b: {
    runtime_created: "2026-07-29T09:55:00Z",
    candidate_created: "2026-07-29T09:50:00Z",
    session_started: "2026-07-29T09:59:00+00:00",
    planned_and_waiting: "2026-07-29T10:00:00+00:00",
    confirmed: "2026-07-29T10:00:01+00:00",
    consumed: "2026-07-29T10:00:02+00:00",
    progress: "2026-07-29T10:00:02.5+00:00",
    terminal: "2026-07-29T10:00:03+00:00",
    expires: "2026-07-29T10:10:00+00:00",
  },
  stockholm: {
    runtime_created: "2026-07-29T11:55:00+02:00",
    candidate_created: "2026-07-29T11:50:00+02:00",
    session_started: "2026-07-29T11:59:00+02:00",
    planned_and_waiting: "2026-07-29T12:00:00+02:00",
    confirmed: "2026-07-29T12:00:01+02:00",
    consumed: "2026-07-29T12:00:02+02:00",
    progress: "2026-07-29T12:00:02.500000000+02:00",
    terminal: "2026-07-29T12:00:03+02:00",
    expires: "2026-07-29T12:10:00+02:00",
  },
  new_york: {
    runtime_created: "2026-07-29T05:55:00-04:00",
    candidate_created: "2026-07-29T05:50:00-04:00",
    session_started: "2026-07-29T05:59:00-04:00",
    planned_and_waiting: "2026-07-29T06:00:00-04:00",
    confirmed: "2026-07-29T06:00:01-04:00",
    consumed: "2026-07-29T06:00:02-04:00",
    progress: "2026-07-29T06:00:02.500000000-04:00",
    terminal: "2026-07-29T06:00:03-04:00",
    expires: "2026-07-29T06:10:00-04:00",
  },
};

function candidate(clock: FixtureInstants): Action650sExecutionCandidate {
  return {
    candidate_identity: "action-651a-candidate",
    trigger: "stop_loss_reached",
    ticker: "AAPL",
    side: "SELL",
    quantity: 5,
    order_type: "STOP_LIMIT",
    limit_price: 179,
    stop_price: 180,
    created_at: clock.candidate_created,
    expires_at: null,
  };
}

export type Action651aFixtureScenario = Readonly<{
  prepared: Action650sPreparedExecution;
  boundary: Action650uManualConfirmationBoundary;
  capability: Action650uManualConfirmationCapability;
  input: Action651aDiagnosticAuditInput;
}>;

export function buildAction651aFixtureScenario(
  clockName: Action651aFixtureClock = "utc_a",
  options: Readonly<{
    reverse_input_order?: boolean;
    maximum_confirmation_latency_nanoseconds?: string;
    consumed_at?: string;
    confirmed_price_observed_at?: string;
    execution_identity?: string;
  }> = {},
): Action651aFixtureScenario {
  const clock = instants[clockName];
  const runtime = createAction650sRuntimeIdentityContext({
    execution_identity:
      options.execution_identity ?? "action-651a-execution",
    runtime_instance_identity: "action-651a-runtime",
    runtime_session_identity: "action-651a-runtime-session",
    created_at: clock.runtime_created,
  });
  if (!runtime) throw new Error("Action 651A fixture runtime creation failed.");

  const prepared = prepareAction650sExecution({
    runtime,
    candidates: [candidate(clock)],
    observed_at: clock.planned_and_waiting,
  });
  if (prepared.current_state !== "waiting_for_manual_confirmation") {
    throw new Error("Action 651A fixture preparation failed.");
  }

  const boundary = createAction650uManualConfirmationBoundary({
    runtime,
    session_identity: "action-651a-confirmation-session",
    session_started_at: clock.session_started,
    session_expires_at: clock.expires,
  });
  if (!boundary) throw new Error("Action 651A fixture boundary creation failed.");

  const issued = boundary.confirm(prepared, {
    confirmed_at: clock.confirmed,
    confirming_actor_class: "human_operator",
    session_identity: "action-651a-confirmation-session",
  });
  if (!issued.ok) {
    throw new Error(`Action 651A fixture confirmation failed: ${issued.reason}`);
  }

  const binding = buildAction650uSimulatedBrokerEventBinding(prepared);
  const events: Action650uSimulatedBrokerEvent[] = [
    {
      ...binding,
      event_type: "progress",
      progress_status: "submitting",
      observed_at: clock.progress,
    },
    {
      ...binding,
      event_type: "terminal",
      terminal_status: "completed",
      simulated_broker_order_identity: "action-651a-synthetic-order",
      observed_at: clock.terminal,
    },
  ];
  if (options.reverse_input_order) events.reverse();

  return {
    prepared,
    boundary,
    capability: issued.capability,
    input: {
      enabled: true,
      kill_switch_active: false,
      prepared,
      boundary,
      capability: issued.capability,
      consumed_at: options.consumed_at ?? clock.consumed,
      broker_events: events,
      confirmed_price: {
        source: "synthetic_manual_confirmation_fixture",
        price_micros: "179250000",
        observed_at:
          options.confirmed_price_observed_at ?? clock.confirmed,
      },
      synthetic_fill: {
        source: "synthetic_replay_fixture",
        price_micros: "179100000",
      },
      maximum_confirmation_latency_nanoseconds:
        options.maximum_confirmation_latency_nanoseconds ?? "2000000000",
    },
  };
}

export const action651aGoldenMatrixCases = [
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
