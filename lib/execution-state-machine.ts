import type { AvanzaExecutionHandoffVersion } from "@/lib/avanza-execution-handoff";
import type {
  BrokerExecutionStatus,
  ExecutionAction,
  ExecutionMode,
  ExecutionTriggerType,
} from "@/lib/execution";

export type ExecutionLifecycleState =
  | "idle"
  | "intent_created"
  | "candidate_selected"
  | "handoff_created"
  | "broker_order_preparing"
  | "waiting_for_manual_confirmation"
  | "broker_order_submitting"
  | "broker_result_captured"
  | "completed"
  | "failed"
  | "cancelled"
  | "unknown";

export type ExecutionLifecycleEventType =
  | "create_intent"
  | "select_candidate"
  | "create_handoff"
  | "start_broker_preparation"
  | "wait_for_manual_confirmation"
  | "submit_broker_order"
  | "capture_broker_result"
  | "complete_execution"
  | "fail_execution"
  | "cancel_execution"
  | "mark_unknown";

export type ExecutionLifecycleEvent = {
  eventId: string;
  type: ExecutionLifecycleEventType;
  createdAt: string;
  fromState: ExecutionLifecycleState;
  toState: ExecutionLifecycleState;
  intentId?: string;
  handoffVersion?: AvanzaExecutionHandoffVersion | string;
  recordId?: string;
  brokerStatus?: BrokerExecutionStatus;
  message?: string;
  metadata?: Record<string, unknown>;
};

export type ExecutionLifecycleSnapshot = {
  lifecycleId: string;
  currentState: ExecutionLifecycleState;
  createdAt: string;
  updatedAt: string;
  mode?: ExecutionMode;
  action?: ExecutionAction;
  triggerType?: ExecutionTriggerType;
  intentId?: string;
  recommendationId?: string;
  positionId?: string;
  events: ExecutionLifecycleEvent[];
};

export type CreateExecutionLifecycleSnapshotInput = {
  lifecycleId?: string | null;
  initialState?: ExecutionLifecycleState | null;
  createdAt?: string | null;
  mode?: ExecutionMode | null;
  action?: ExecutionAction | null;
  triggerType?: ExecutionTriggerType | null;
  intentId?: string | null;
  recommendationId?: string | null;
  positionId?: string | null;
};

export type ExecutionLifecycleTransitionContext = {
  mode?: ExecutionMode | null;
  action?: ExecutionAction | null;
  triggerType?: ExecutionTriggerType | null;
};

export type TransitionExecutionLifecycleOptions =
  ExecutionLifecycleTransitionContext & {
    eventId?: string | null;
    createdAt?: string | null;
    intentId?: string | null;
    recommendationId?: string | null;
    positionId?: string | null;
    handoffVersion?: AvanzaExecutionHandoffVersion | string | null;
    recordId?: string | null;
    brokerStatus?: BrokerExecutionStatus | null;
    message?: string | null;
    metadata?: Record<string, unknown> | null;
  };

export type ExecutionLifecycleTransitionResult =
  | {
      ok: true;
      snapshot: ExecutionLifecycleSnapshot;
      event: ExecutionLifecycleEvent;
      error?: never;
    }
  | {
      ok: false;
      snapshot: ExecutionLifecycleSnapshot;
      event?: never;
      error: string;
    };

const transitionMap: Partial<
  Record<
    ExecutionLifecycleState,
    Partial<Record<ExecutionLifecycleEventType, ExecutionLifecycleState>>
  >
> = {
  idle: {
    create_intent: "intent_created",
  },
  intent_created: {
    select_candidate: "candidate_selected",
  },
  candidate_selected: {
    create_handoff: "handoff_created",
  },
  handoff_created: {
    start_broker_preparation: "broker_order_preparing",
  },
  broker_order_preparing: {
    wait_for_manual_confirmation: "waiting_for_manual_confirmation",
    submit_broker_order: "broker_order_submitting",
  },
  waiting_for_manual_confirmation: {
    capture_broker_result: "broker_result_captured",
  },
  broker_order_submitting: {
    capture_broker_result: "broker_result_captured",
  },
  broker_result_captured: {
    complete_execution: "completed",
  },
};

const displayLabels: Record<ExecutionLifecycleState, string> = {
  idle: "Idle",
  intent_created: "Intent created",
  candidate_selected: "Candidate selected",
  handoff_created: "Avanza handoff created",
  broker_order_preparing: "Preparing Avanza order",
  waiting_for_manual_confirmation: "Waiting for manual confirmation",
  broker_order_submitting: "Submitting broker order",
  broker_result_captured: "Broker result captured",
  completed: "Completed",
  failed: "Failed",
  cancelled: "Cancelled",
  unknown: "Unknown",
};

function nullableString(value: string | null | undefined) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function requiredTimestamp(value: string | null | undefined) {
  const timestamp = nullableString(value);

  return timestamp && Number.isFinite(Date.parse(timestamp)) ? timestamp : null;
}

function deterministicEventId(
  lifecycleId: string,
  eventType: ExecutionLifecycleEventType,
  eventIndex: number,
) {
  const identity = lifecycleId.replace(/[^a-zA-Z0-9_-]+/g, "_");

  return `execution_event_${identity}_${String(eventIndex + 1).padStart(3, "0")}_${eventType}`;
}

function withOptionalSnapshotFields(
  snapshot: ExecutionLifecycleSnapshot,
  options: TransitionExecutionLifecycleOptions,
): ExecutionLifecycleSnapshot {
  return {
    ...snapshot,
    ...(options.mode ? { mode: options.mode } : {}),
    ...(options.action ? { action: options.action } : {}),
    ...(options.triggerType ? { triggerType: options.triggerType } : {}),
    ...(nullableString(options.intentId)
      ? { intentId: nullableString(options.intentId) }
      : {}),
    ...(nullableString(options.recommendationId)
      ? { recommendationId: nullableString(options.recommendationId) }
      : {}),
    ...(nullableString(options.positionId)
      ? { positionId: nullableString(options.positionId) }
      : {}),
  };
}

export function createExecutionLifecycleSnapshot(
  input: CreateExecutionLifecycleSnapshotInput = {},
): ExecutionLifecycleSnapshot {
  const createdAt = requiredTimestamp(input.createdAt);
  const lifecycleId = nullableString(input.lifecycleId);

  if (!createdAt || !lifecycleId) {
    throw new Error("Execution lifecycle identity context is required.");
  }

  return {
    lifecycleId,
    currentState: input.initialState ?? "idle",
    createdAt,
    updatedAt: createdAt,
    ...(input.mode ? { mode: input.mode } : {}),
    ...(input.action ? { action: input.action } : {}),
    ...(input.triggerType ? { triggerType: input.triggerType } : {}),
    ...(nullableString(input.intentId)
      ? { intentId: nullableString(input.intentId) }
      : {}),
    ...(nullableString(input.recommendationId)
      ? { recommendationId: nullableString(input.recommendationId) }
      : {}),
    ...(nullableString(input.positionId)
      ? { positionId: nullableString(input.positionId) }
      : {}),
    events: [],
  };
}

export function isTerminalExecutionLifecycleState(
  state: ExecutionLifecycleState,
) {
  return (
    state === "completed" ||
    state === "failed" ||
    state === "cancelled" ||
    state === "unknown"
  );
}

export function isManualConfirmationState(state: ExecutionLifecycleState) {
  return state === "waiting_for_manual_confirmation";
}

export function getNextExecutionLifecycleState(
  currentState: ExecutionLifecycleState,
  eventType: ExecutionLifecycleEventType,
  context: ExecutionLifecycleTransitionContext = {},
): ExecutionLifecycleState | null {
  void context;

  if (isTerminalExecutionLifecycleState(currentState)) {
    return null;
  }

  if (eventType === "fail_execution") {
    return "failed";
  }

  if (eventType === "cancel_execution") {
    return "cancelled";
  }

  if (eventType === "mark_unknown") {
    return "unknown";
  }

  return transitionMap[currentState]?.[eventType] ?? null;
}

export function transitionExecutionLifecycle(
  snapshot: ExecutionLifecycleSnapshot,
  eventType: ExecutionLifecycleEventType,
  options: TransitionExecutionLifecycleOptions = {},
): ExecutionLifecycleTransitionResult {
  const nextState = getNextExecutionLifecycleState(
    snapshot.currentState,
    eventType,
    options,
  );

  if (!nextState) {
    const reason = isTerminalExecutionLifecycleState(snapshot.currentState)
      ? `Cannot transition from terminal state ${snapshot.currentState}.`
      : `Invalid execution lifecycle transition from ${snapshot.currentState} using ${eventType}.`;

    return {
      ok: false,
      snapshot,
      error: reason,
    };
  }

  const createdAt = requiredTimestamp(options.createdAt);
  const eventId =
    nullableString(options.eventId) ??
    deterministicEventId(snapshot.lifecycleId, eventType, snapshot.events.length);

  if (!createdAt) {
    return {
      ok: false,
      snapshot,
      error: "Execution lifecycle event identity context is required.",
    };
  }

  const event: ExecutionLifecycleEvent = {
    eventId,
    type: eventType,
    createdAt,
    fromState: snapshot.currentState,
    toState: nextState,
    ...(nullableString(options.intentId)
      ? { intentId: nullableString(options.intentId) }
      : snapshot.intentId
        ? { intentId: snapshot.intentId }
        : {}),
    ...(nullableString(options.handoffVersion)
      ? { handoffVersion: nullableString(options.handoffVersion) }
      : {}),
    ...(nullableString(options.recordId)
      ? { recordId: nullableString(options.recordId) }
      : {}),
    ...(options.brokerStatus ? { brokerStatus: options.brokerStatus } : {}),
    ...(nullableString(options.message)
      ? { message: nullableString(options.message) }
      : {}),
    ...(options.metadata ? { metadata: { ...options.metadata } } : {}),
  };
  const nextSnapshot = withOptionalSnapshotFields(
    {
      ...snapshot,
      currentState: nextState,
      updatedAt: createdAt,
      events: [...snapshot.events, event],
    },
    options,
  );

  return {
    ok: true,
    snapshot: nextSnapshot,
    event,
  };
}

export function getExecutionLifecycleDisplayLabel(
  state: ExecutionLifecycleState,
) {
  return displayLabels[state];
}
