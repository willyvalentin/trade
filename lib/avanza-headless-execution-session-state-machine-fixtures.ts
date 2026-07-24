import {
  avanzaHeadlessAgentPlanBuilderFixtures,
} from "./avanza-headless-agent-plan-builder-fixtures";
import type {
  AvanzaHeadlessAgentPlan,
} from "./avanza-headless-agent-plan-builder";
import {
  createAvanzaHeadlessExecutionSession,
  reduceAvanzaHeadlessExecutionSessionEvents,
  type AvanzaHeadlessExecutionSession,
  type AvanzaHeadlessExecutionSessionEvent,
  type AvanzaHeadlessExecutionSessionStatus,
  type AvanzaHeadlessExecutionSessionTransitionResult,
} from "./avanza-headless-execution-session-state-machine";

export type AvanzaHeadlessExecutionSessionStateMachineFixtureId =
  | "recommendation_buy_waiting_for_manual_final_confirmation"
  | "live_position_sell_waiting_for_manual_final_confirmation"
  | "user_final_click_observed_broker_result_pending"
  | "settlement_reconciliation_pending"
  | "completed_session"
  | "failed_session"
  | "cancelled_session"
  | "blocked_session"
  | "invalid_transition_rejected"
  | "agent_final_click_forbidden"
  | "order_submitted_by_agent_forbidden"
  | "bankid_automation_forbidden"
  | "cookies_session_forbidden"
  | "supabase_write_forbidden"
  | "ui_hidden_under_surface";

export type AvanzaHeadlessExecutionSessionStateMachineFixture = {
  fixtureId: AvanzaHeadlessExecutionSessionStateMachineFixtureId;
  label: string;
  expectedStatus: AvanzaHeadlessExecutionSessionStatus;
  session: AvanzaHeadlessExecutionSession;
  transitions: AvanzaHeadlessExecutionSessionTransitionResult[];
};

const fixtureNow = "2026-07-07T12:00:00.000Z";

const buyPlan = avanzaHeadlessAgentPlanBuilderFixtures.find(
  (fixture) => fixture.fixtureId === "recommendation_entry_buy_ready_plan",
)?.plan;
const sellPlan = avanzaHeadlessAgentPlanBuilderFixtures.find(
  (fixture) => fixture.fixtureId === "live_position_exit_sell_ready_plan",
)?.plan;

if (!buyPlan || !sellPlan) {
  throw new Error("Headless agent plan fixtures are required for session fixtures.");
}

const recommendationBuyPlan: AvanzaHeadlessAgentPlan = buyPlan;
const livePositionSellPlan: AvanzaHeadlessAgentPlan = sellPlan;

function event(
  type: AvanzaHeadlessExecutionSessionEvent["type"],
  reason: string,
  actor: AvanzaHeadlessExecutionSessionEvent["actor"] = "test_fixture",
  safeMetadata?: Record<string, unknown>,
): AvanzaHeadlessExecutionSessionEvent {
  return {
    actor,
    createdAt: fixtureNow,
    eventId: `fixture-event-${type}`,
    reason,
    safeMetadata,
    type,
    userVisible: false,
  };
}

const planToReviewEvents: AvanzaHeadlessExecutionSessionEvent[] = [
  event("create_session", "Session created."),
  event("validate_contract", "Selected contract validated."),
  event("attach_plan", "Headless agent plan attached."),
  event("mark_login_ready", "Login readiness modeled."),
  event("plan_instrument_search", "Instrument search planned."),
  event("mark_instrument_verified", "Instrument identity verified."),
  event("plan_order_fields", "Limit order fields planned."),
  event("mark_order_review_ready", "Order review reached."),
  event(
    "wait_for_manual_final_confirmation",
    "Waiting for manual final confirmation.",
  ),
];

function reduceFixture(
  plan: AvanzaHeadlessAgentPlan,
  events: readonly AvanzaHeadlessExecutionSessionEvent[],
) {
  const transitions: AvanzaHeadlessExecutionSessionTransitionResult[] = [];
  let session = createAvanzaHeadlessExecutionSession({
    mode: "semi_auto",
    now: fixtureNow,
    plan,
    sessionId: `session-${plan.planId}`,
  });

  for (const item of events) {
    const transition = reduceAvanzaHeadlessExecutionSessionEvents([item], {
      mode: session.mode,
      now: fixtureNow,
      plan,
      sessionId: session.sessionId,
      status: session.status,
    });
    transition.session = {
      ...transition.session,
      eventLog: [...session.eventLog, ...transition.session.eventLog],
    };
    transitions.push(transition);
    session = transition.session;
    if (transition.status === "blocked") break;
  }

  return { session, transitions };
}

function fixture(
  fixtureId: AvanzaHeadlessExecutionSessionStateMachineFixtureId,
  label: string,
  expectedStatus: AvanzaHeadlessExecutionSessionStatus,
  plan: AvanzaHeadlessAgentPlan,
  events: readonly AvanzaHeadlessExecutionSessionEvent[],
): AvanzaHeadlessExecutionSessionStateMachineFixture {
  const reduced = reduceFixture(plan, events);

  return {
    expectedStatus,
    fixtureId,
    label,
    session: reduced.session,
    transitions: reduced.transitions,
  };
}

export const avanzaHeadlessExecutionSessionStateMachineFixtures:
  AvanzaHeadlessExecutionSessionStateMachineFixture[] = [
    fixture(
      "recommendation_buy_waiting_for_manual_final_confirmation",
      "Recommendation BUY session waiting for manual final confirmation",
      "waiting_for_manual_final_confirmation",
      recommendationBuyPlan,
      planToReviewEvents,
    ),
    fixture(
      "live_position_sell_waiting_for_manual_final_confirmation",
      "Live-position SELL session waiting for manual final confirmation",
      "waiting_for_manual_final_confirmation",
      livePositionSellPlan,
      planToReviewEvents,
    ),
    fixture(
      "user_final_click_observed_broker_result_pending",
      "User final click observed moves to broker result capture pending",
      "broker_result_capture_pending",
      recommendationBuyPlan,
      [
        ...planToReviewEvents,
        event(
          "mark_user_final_click_observed",
          "User final click observed; agent final click forbidden.",
          "user",
        ),
      ],
    ),
    fixture(
      "settlement_reconciliation_pending",
      "Settlement reconciliation pending",
      "settlement_reconciliation_pending",
      recommendationBuyPlan,
      [
        ...planToReviewEvents,
        event(
          "mark_user_final_click_observed",
          "User final click observed.",
          "user",
        ),
        event(
          "mark_settlement_reconciliation_pending",
          "Settlement reconciliation pending.",
        ),
      ],
    ),
    fixture(
      "completed_session",
      "Completed session",
      "completed",
      recommendationBuyPlan,
      [
        ...planToReviewEvents,
        event(
          "mark_user_final_click_observed",
          "User final click observed.",
          "user",
        ),
        event(
          "mark_settlement_reconciliation_pending",
          "Settlement reconciliation pending.",
        ),
        event("complete_session", "Session completed."),
      ],
    ),
    fixture(
      "failed_session",
      "Failed session",
      "failed",
      recommendationBuyPlan,
      [event("create_session", "Session created."), event("fail_session", "Failed.")],
    ),
    fixture(
      "cancelled_session",
      "Cancelled session",
      "cancelled",
      recommendationBuyPlan,
      [
        event("create_session", "Session created."),
        event("cancel_session", "Cancelled."),
      ],
    ),
    fixture(
      "blocked_session",
      "Blocked session",
      "blocked",
      recommendationBuyPlan,
      [event("create_session", "Session created."), event("block_session", "Blocked.")],
    ),
    fixture(
      "invalid_transition_rejected",
      "Invalid transition rejected",
      "session_created",
      recommendationBuyPlan,
      [
        event("create_session", "Session created."),
        event(
          "plan_order_fields",
          "Invalid transition rejected before instrument verification.",
        ),
      ],
    ),
    fixture(
      "agent_final_click_forbidden",
      "Agent final click forbidden",
      "blocked",
      recommendationBuyPlan,
      [
        ...planToReviewEvents,
        event(
          "mark_user_final_click_observed",
          "agent_clicked_final_buy",
          "future_agent",
          { forbiddenSignal: "agent_clicked_final_buy" },
        ),
      ],
    ),
    fixture(
      "order_submitted_by_agent_forbidden",
      "Order submitted by agent forbidden",
      "blocked",
      recommendationBuyPlan,
      [
        event("create_session", "Session created."),
        event("block_session", "order_submitted_by_agent", "future_agent", {
          forbiddenSignal: "order_submitted_by_agent",
        }),
      ],
    ),
    fixture(
      "bankid_automation_forbidden",
      "BankID automation forbidden",
      "blocked",
      recommendationBuyPlan,
      [
        event("create_session", "Session created."),
        event("block_session", "bankid_automated", "future_agent", {
          forbiddenSignal: "bankid_automated",
        }),
      ],
    ),
    fixture(
      "cookies_session_forbidden",
      "Cookies/session forbidden",
      "blocked",
      recommendationBuyPlan,
      [
        event("create_session", "Session created."),
        event("block_session", "cookies_read and session_exported", "future_agent", {
          forbiddenSignal: "cookies_read",
        }),
      ],
    ),
    fixture(
      "supabase_write_forbidden",
      "Supabase write forbidden",
      "blocked",
      recommendationBuyPlan,
      [
        event("create_session", "Session created."),
        event("block_session", "supabase_execution_write", "future_agent", {
          forbiddenSignal: "supabase_execution_write",
        }),
      ],
    ),
    fixture(
      "ui_hidden_under_surface",
      "UI hidden under surface",
      "waiting_for_manual_final_confirmation",
      recommendationBuyPlan,
      planToReviewEvents,
    ),
  ];
