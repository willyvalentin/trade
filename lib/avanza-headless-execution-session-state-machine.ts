import type {
  AvanzaHeadlessAgentPlan,
} from "./avanza-headless-agent-plan-builder";
import type {
  AvanzaHeadlessExecutionContractIntent,
  AvanzaHeadlessExecutionContractOrderType,
  AvanzaHeadlessExecutionContractSide,
  AvanzaHeadlessExecutionContractSource,
} from "./avanza-headless-execution-data-contract";
import type {
  AvanzaHeadlessExecutionContractSelectorMode,
} from "./avanza-headless-execution-contract-selector";

export type AvanzaHeadlessExecutionSessionStatus =
  | "not_started"
  | "session_created"
  | "contract_validated"
  | "plan_ready"
  | "login_required"
  | "login_ready"
  | "instrument_search_planned"
  | "instrument_verified"
  | "order_fields_planned"
  | "order_review_ready"
  | "waiting_for_manual_final_confirmation"
  | "broker_result_capture_pending"
  | "settlement_reconciliation_pending"
  | "completed"
  | "failed"
  | "cancelled"
  | "blocked"
  | "unknown";

export type AvanzaHeadlessExecutionSessionEventType =
  | "create_session"
  | "validate_contract"
  | "attach_plan"
  | "require_login"
  | "mark_login_ready"
  | "plan_instrument_search"
  | "mark_instrument_verified"
  | "plan_order_fields"
  | "mark_order_review_ready"
  | "wait_for_manual_final_confirmation"
  | "mark_user_final_click_observed"
  | "mark_broker_result_capture_pending"
  | "mark_settlement_reconciliation_pending"
  | "complete_session"
  | "fail_session"
  | "cancel_session"
  | "block_session"
  | "reset_session";

export type AvanzaHeadlessExecutionSessionTransitionStatus =
  | "accepted"
  | "rejected"
  | "blocked"
  | "noop"
  | "unknown";

export type AvanzaHeadlessExecutionSessionEventActor =
  | "system"
  | "future_agent"
  | "user"
  | "test_fixture"
  | "unknown";

export type AvanzaHeadlessExecutionSessionSafetyFlags = {
  stateMachineOnly: true;
  headlessOnly: true;
  visibleInUi: false;
  canStartHandoff: false;
  canPrepareOrderNow: false;
  canRunSmokeTestFromUi: false;
  canCallApiRoute: false;
  canFetch: false;
  canPoll: false;
  canUseBrowserAutomationNow: false;
  canAccessCredentials: false;
  canReadCookies: false;
  canExportSession: false;
  canAutomateBankId: false;
  canSubmitOrder: false;
  canClickFinalBuy: false;
  canClickFinalSell: false;
  canWriteSupabase: false;
  canClaimProductionReady: false;
  userMustConfirm: true;
  finalHumanClickRequired: true;
  controlsEnabled: false;
  gateLocked: true;
};

export type AvanzaHeadlessExecutionSessionEvent = {
  eventId?: string;
  createdAt?: string;
  type: AvanzaHeadlessExecutionSessionEventType;
  reason: string;
  actor: AvanzaHeadlessExecutionSessionEventActor;
  payloadSummary?: string;
  safeMetadata?: Record<string, unknown>;
  forbidden?: boolean;
  userVisible?: false;
};

export type AvanzaHeadlessExecutionSessionStoredEvent =
  Required<
    Pick<
      AvanzaHeadlessExecutionSessionEvent,
      "actor" | "createdAt" | "eventId" | "reason" | "type" | "userVisible"
    >
  > &
    Pick<
      AvanzaHeadlessExecutionSessionEvent,
      "forbidden" | "payloadSummary" | "safeMetadata"
    >;

export type AvanzaHeadlessExecutionSession = {
  sessionId: string;
  createdAt: string;
  updatedAt: string;
  status: AvanzaHeadlessExecutionSessionStatus;
  contractId?: string;
  planId?: string;
  selectorId?: string;
  source?: AvanzaHeadlessExecutionContractSource;
  intent?: AvanzaHeadlessExecutionContractIntent;
  ticker?: string;
  side?: AvanzaHeadlessExecutionContractSide;
  quantity?: number;
  limitPrice?: number;
  orderType?: AvanzaHeadlessExecutionContractOrderType;
  mode: AvanzaHeadlessExecutionContractSelectorMode;
  currentStepId?: string;
  eventLog: AvanzaHeadlessExecutionSessionStoredEvent[];
  warnings: string[];
  blockedReasons: string[];
  safetyFlags: AvanzaHeadlessExecutionSessionSafetyFlags;
};

export type AvanzaHeadlessExecutionSessionTransitionResult = {
  transitionId: string;
  createdAt: string;
  status: AvanzaHeadlessExecutionSessionTransitionStatus;
  fromStatus: AvanzaHeadlessExecutionSessionStatus;
  toStatus: AvanzaHeadlessExecutionSessionStatus;
  accepted: boolean;
  reason: string;
  session: AvanzaHeadlessExecutionSession;
  warnings: string[];
  blockedReasons: string[];
  safetyFlags: AvanzaHeadlessExecutionSessionSafetyFlags;
};

export type AvanzaHeadlessExecutionSessionInput = {
  sessionId?: string;
  now?: string;
  mode?: AvanzaHeadlessExecutionContractSelectorMode;
  plan?: AvanzaHeadlessAgentPlan;
  status?: AvanzaHeadlessExecutionSessionStatus;
};

const defaultCreatedAt = "2026-07-07T12:00:00.000Z";

export const avanzaHeadlessExecutionSessionSafetyFlags:
  AvanzaHeadlessExecutionSessionSafetyFlags = {
    stateMachineOnly: true,
    headlessOnly: true,
    visibleInUi: false,
    canStartHandoff: false,
    canPrepareOrderNow: false,
    canRunSmokeTestFromUi: false,
    canCallApiRoute: false,
    canFetch: false,
    canPoll: false,
    canUseBrowserAutomationNow: false,
    canAccessCredentials: false,
    canReadCookies: false,
    canExportSession: false,
    canAutomateBankId: false,
    canSubmitOrder: false,
    canClickFinalBuy: false,
    canClickFinalSell: false,
    canWriteSupabase: false,
    canClaimProductionReady: false,
    userMustConfirm: true,
    finalHumanClickRequired: true,
    controlsEnabled: false,
    gateLocked: true,
  };

const terminalStatuses: readonly AvanzaHeadlessExecutionSessionStatus[] = [
  "completed",
  "failed",
  "cancelled",
  "blocked",
];

const forbiddenEventFragments = [
  "agent_clicked_final_buy",
  "agent_clicked_final_sell",
  "order_submitted_by_agent",
  "bankid_automated",
  "cookies_read",
  "session_exported",
  "credentials_logged",
  "supabase_execution_write",
] as const;

function safeText(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();

  return trimmed ? trimmed : undefined;
}

function eventWithDefaults(
  event: AvanzaHeadlessExecutionSessionEvent,
  createdAt: string,
): AvanzaHeadlessExecutionSessionStoredEvent {
  return {
    actor: event.actor,
    createdAt: event.createdAt?.trim() || createdAt,
    eventId:
      event.eventId?.trim() ||
      `event-${event.type}-${event.createdAt?.trim() || createdAt}`,
    forbidden: event.forbidden,
    payloadSummary: safeText(event.payloadSummary),
    reason: event.reason,
    safeMetadata: event.safeMetadata,
    type: event.type,
    userVisible: false,
  };
}

function metadataText(event: AvanzaHeadlessExecutionSessionEvent) {
  return JSON.stringify({
    payloadSummary: event.payloadSummary,
    reason: event.reason,
    safeMetadata: event.safeMetadata,
    type: event.type,
  }).toLowerCase();
}

function forbiddenReason(event: AvanzaHeadlessExecutionSessionEvent) {
  if (event.forbidden) return "Event is explicitly marked forbidden.";
  const text = metadataText(event);
  const matched = forbiddenEventFragments.find((fragment) =>
    text.includes(fragment),
  );

  return matched ? `Forbidden event metadata detected: ${matched}.` : undefined;
}

function isTerminal(status: AvanzaHeadlessExecutionSessionStatus) {
  return terminalStatuses.includes(status);
}

function applyPlanToSession(
  session: AvanzaHeadlessExecutionSession,
  plan?: AvanzaHeadlessAgentPlan,
): AvanzaHeadlessExecutionSession {
  if (!plan) return session;

  return {
    ...session,
    contractId: plan.selectedContractId ?? session.contractId,
    intent: plan.intent,
    limitPrice: plan.limitPrice,
    orderType: plan.orderType,
    planId: plan.planId,
    quantity: plan.quantity,
    selectorId: plan.selectorId ?? session.selectorId,
    side: plan.side,
    source: plan.source,
    ticker: plan.ticker,
  };
}

function nextStatusForEvent(
  current: AvanzaHeadlessExecutionSessionStatus,
  event: AvanzaHeadlessExecutionSessionEvent,
): {
  status: AvanzaHeadlessExecutionSessionTransitionStatus;
  toStatus: AvanzaHeadlessExecutionSessionStatus;
  accepted: boolean;
  reason: string;
} {
  if (event.type === "reset_session") {
    return {
      accepted: true,
      reason: "Session reset to fixture/dev model session_created state.",
      status: "accepted",
      toStatus: "session_created",
    };
  }

  if (isTerminal(current)) {
    return {
      accepted: false,
      reason: `Session is terminal (${current}) and cannot accept ${event.type}.`,
      status: "rejected",
      toStatus: current,
    };
  }

  if (event.type === "fail_session") {
    return {
      accepted: true,
      reason: "Session marked failed.",
      status: "accepted",
      toStatus: "failed",
    };
  }
  if (event.type === "cancel_session") {
    return {
      accepted: true,
      reason: "Session marked cancelled.",
      status: "accepted",
      toStatus: "cancelled",
    };
  }
  if (event.type === "block_session") {
    return {
      accepted: true,
      reason: "Session marked blocked.",
      status: "accepted",
      toStatus: "blocked",
    };
  }
  if (
    event.type === "create_session" &&
    (current === "not_started" || current === "unknown")
  ) {
    return {
      accepted: true,
      reason: "Headless execution session created.",
      status: "accepted",
      toStatus: "session_created",
    };
  }
  if (event.type === "validate_contract" && current === "session_created") {
    return {
      accepted: true,
      reason: "Selected contract validated for headless session lifecycle.",
      status: "accepted",
      toStatus: "contract_validated",
    };
  }
  if (event.type === "attach_plan" && current === "contract_validated") {
    return {
      accepted: true,
      reason: "Headless agent plan attached to session.",
      status: "accepted",
      toStatus: "plan_ready",
    };
  }
  if (event.type === "require_login" && current === "plan_ready") {
    return {
      accepted: true,
      reason: "Login requirement is known for planning.",
      status: "accepted",
      toStatus: "login_required",
    };
  }
  if (
    event.type === "mark_login_ready" &&
    (current === "login_required" || current === "plan_ready")
  ) {
    return {
      accepted: true,
      reason: "Login readiness modeled for future agent session.",
      status: "accepted",
      toStatus: "login_ready",
    };
  }
  if (
    event.type === "plan_instrument_search" &&
    (current === "login_ready" || current === "plan_ready")
  ) {
    return {
      accepted: true,
      reason: "Instrument search is planned.",
      status: "accepted",
      toStatus: "instrument_search_planned",
    };
  }
  if (
    event.type === "mark_instrument_verified" &&
    current === "instrument_search_planned"
  ) {
    return {
      accepted: true,
      reason: "Instrument identity is verified in model state.",
      status: "accepted",
      toStatus: "instrument_verified",
    };
  }
  if (event.type === "plan_order_fields" && current === "instrument_verified") {
    return {
      accepted: true,
      reason: "Limit order fields are planned.",
      status: "accepted",
      toStatus: "order_fields_planned",
    };
  }
  if (
    event.type === "mark_order_review_ready" &&
    current === "order_fields_planned"
  ) {
    return {
      accepted: true,
      reason: "Order review state is modeled.",
      status: "accepted",
      toStatus: "order_review_ready",
    };
  }
  if (
    event.type === "wait_for_manual_final_confirmation" &&
    current === "order_review_ready"
  ) {
    return {
      accepted: true,
      reason: "Session waits for manual final confirmation.",
      status: "accepted",
      toStatus: "waiting_for_manual_final_confirmation",
    };
  }
  if (event.type === "mark_user_final_click_observed") {
    if (event.actor !== "user") {
      return {
        accepted: false,
        reason:
          "User final click observation must be actor user; agent final click is forbidden.",
        status: "blocked",
        toStatus: current,
      };
    }
    if (current === "waiting_for_manual_final_confirmation") {
      return {
        accepted: true,
        reason:
          "User final KOP/SALJ click was observed; agent did not click final confirmation.",
        status: "accepted",
        toStatus: "broker_result_capture_pending",
      };
    }
  }
  if (
    event.type === "mark_broker_result_capture_pending" &&
    (current === "waiting_for_manual_final_confirmation" ||
      current === "broker_result_capture_pending")
  ) {
    return {
      accepted: true,
      reason: "Broker result capture is pending.",
      status:
        current === "broker_result_capture_pending" ? "noop" : "accepted",
      toStatus: "broker_result_capture_pending",
    };
  }
  if (
    event.type === "mark_settlement_reconciliation_pending" &&
    current === "broker_result_capture_pending"
  ) {
    return {
      accepted: true,
      reason: "Settlement reconciliation is pending for later avrakningsnota flow.",
      status: "accepted",
      toStatus: "settlement_reconciliation_pending",
    };
  }
  if (
    event.type === "complete_session" &&
    (current === "broker_result_capture_pending" ||
      current === "settlement_reconciliation_pending")
  ) {
    return {
      accepted: true,
      reason: "Session completed after modeled broker result or settlement state.",
      status: "accepted",
      toStatus: "completed",
    };
  }

  return {
    accepted: false,
    reason: `Invalid transition: ${event.type} cannot move session from ${current}.`,
    status: "rejected",
    toStatus: current,
  };
}

export function createAvanzaHeadlessExecutionSession(
  input: AvanzaHeadlessExecutionSessionInput = {},
): AvanzaHeadlessExecutionSession {
  const createdAt = input.now?.trim() || defaultCreatedAt;
  const base: AvanzaHeadlessExecutionSession = {
    blockedReasons: [],
    createdAt,
    currentStepId: undefined,
    eventLog: [],
    mode: input.mode ?? "semi_auto",
    safetyFlags: avanzaHeadlessExecutionSessionSafetyFlags,
    sessionId: input.sessionId?.trim() || `headless-session-${createdAt}`,
    status: input.status ?? "not_started",
    updatedAt: createdAt,
    warnings: [
      "State machine is headless and UI-hidden.",
      "Final KOP/SALJ remains human-only.",
      "Agent final click is forbidden.",
    ],
  };

  return applyPlanToSession(base, input.plan);
}

export function applyAvanzaHeadlessExecutionSessionEvent(
  session: AvanzaHeadlessExecutionSession,
  event: AvanzaHeadlessExecutionSessionEvent,
): AvanzaHeadlessExecutionSessionTransitionResult {
  const createdAt = event.createdAt?.trim() || defaultCreatedAt;
  const fromStatus = session.status;
  const forbidden = forbiddenReason(event);
  const storedEvent = eventWithDefaults(event, createdAt);

  if (forbidden) {
    const blockedReasons = [...session.blockedReasons, forbidden];
    const blockedSession: AvanzaHeadlessExecutionSession = {
      ...session,
      blockedReasons,
      eventLog: [...session.eventLog, storedEvent],
      status: "blocked",
      updatedAt: createdAt,
    };

    return {
      accepted: false,
      blockedReasons,
      createdAt,
      fromStatus,
      reason: forbidden,
      safetyFlags: avanzaHeadlessExecutionSessionSafetyFlags,
      session: blockedSession,
      status: "blocked",
      toStatus: "blocked",
      transitionId: `transition-${event.type}-${createdAt}`,
      warnings: blockedSession.warnings,
    };
  }

  const transition = nextStatusForEvent(fromStatus, event);
  const accepted = transition.accepted;
  const blockedReasons = accepted
    ? [...session.blockedReasons]
    : [...session.blockedReasons, transition.reason];
  const eventLog = accepted ? [...session.eventLog, storedEvent] : session.eventLog;
  const nextSession: AvanzaHeadlessExecutionSession = {
    ...session,
    blockedReasons,
    currentStepId: accepted ? event.type : session.currentStepId,
    eventLog,
    status: transition.toStatus,
    updatedAt: createdAt,
  };

  return {
    accepted,
    blockedReasons,
    createdAt,
    fromStatus,
    reason: transition.reason,
    safetyFlags: avanzaHeadlessExecutionSessionSafetyFlags,
    session: nextSession,
    status: transition.status,
    toStatus: transition.toStatus,
    transitionId: `transition-${event.type}-${createdAt}`,
    warnings: nextSession.warnings,
  };
}

export function reduceAvanzaHeadlessExecutionSessionEvents(
  events: readonly AvanzaHeadlessExecutionSessionEvent[],
  input: AvanzaHeadlessExecutionSessionInput = {},
): AvanzaHeadlessExecutionSessionTransitionResult {
  const initial = createAvanzaHeadlessExecutionSession(input);
  let result: AvanzaHeadlessExecutionSessionTransitionResult = {
    accepted: true,
    blockedReasons: initial.blockedReasons,
    createdAt: initial.createdAt,
    fromStatus: initial.status,
    reason: "Initial headless execution session state.",
    safetyFlags: avanzaHeadlessExecutionSessionSafetyFlags,
    session: initial,
    status: "noop",
    toStatus: initial.status,
    transitionId: `transition-initial-${initial.createdAt}`,
    warnings: initial.warnings,
  };

  for (const event of events) {
    result = applyAvanzaHeadlessExecutionSessionEvent(result.session, event);
    if (result.status === "blocked") break;
  }

  return result;
}
