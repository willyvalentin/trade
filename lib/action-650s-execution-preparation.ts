import {
  buildAction650sPreparedHandoff,
  canonicalizeAction650sOrderPayload,
  canonicalizeAction650sTimestamp,
  containsAction650sRestrictedMaterial,
  deepFreezeAction650s,
  hasAction650sRuntimeIdentityProvenance,
  hashAction650sCanonicalValue,
  type Action650sPreparedHandoff,
  type Action650sRuntimeIdentityContext,
} from "@/lib/action-650s-execution-identity";

export const action650sExecutionPreparationContractVersion =
  "action_650s_execution_preparation_v1" as const;

export type Action650sCandidateTrigger =
  | "stop_loss_reached"
  | "target_reached"
  | "recommendation_entry";

export type Action650sExecutionCandidate = Readonly<{
  candidate_identity: string;
  trigger: Action650sCandidateTrigger;
  ticker: string;
  side: "BUY" | "SELL";
  quantity: number;
  order_type: "LIMIT" | "MARKET" | "STOP_LIMIT";
  limit_price: number | null;
  stop_price: number | null;
  created_at: string;
  expires_at: string | null;
}>;

export type Action650sPreparationState =
  | "prepared"
  | "waiting_for_manual_confirmation";

export type Action650sPreparationEvent = Readonly<{
  event_identity: string;
  sequence: number;
  event_type: Action650sPreparationState;
  execution_identity: string;
  lifecycle_identity: string;
  occurred_at: string;
}>;

export type Action650sPreparedExecution = Readonly<{
  contract_version: typeof action650sExecutionPreparationContractVersion;
  runtime_identity_context: Action650sRuntimeIdentityContext;
  runtime_identity_context_digest: string;
  selected_candidate: Readonly<{
    candidate_identity: string;
    trigger: Action650sCandidateTrigger;
    priority: 1 | 4 | 6;
  }>;
  handoff: Action650sPreparedHandoff;
  current_state: "waiting_for_manual_confirmation";
  lifecycle_events: readonly Action650sPreparationEvent[];
  safety_decision: "manual_confirmation_required";
  broker_progress_accepted: false;
  terminal_result_accepted: false;
  effects: Readonly<{
    broker_requests_prepared: 1;
    broker_requests_submitted: 0;
    provider_calls: 0;
    database_writes: 0;
    trade_mutations: 0;
    real_trade_mutations: 0;
  }>;
  trace_identity: string;
}>;

export type Action650sBlockedPreparation = Readonly<{
  contract_version: typeof action650sExecutionPreparationContractVersion;
  current_state: "blocked";
  safety_decision: "blocked";
  blocked_reason:
    | "runtime_identity_unproven"
    | "restricted_material_rejected"
    | "timestamp_invalid"
    | "no_valid_candidate"
    | "handoff_identity_invalid";
  broker_progress_accepted: false;
  terminal_result_accepted: false;
  effects: Readonly<{
    broker_requests_prepared: 0;
    broker_requests_submitted: 0;
    provider_calls: 0;
    database_writes: 0;
    trade_mutations: 0;
    real_trade_mutations: 0;
  }>;
  trace_identity: string;
}>;

export type Action650sPreparationResult =
  | Action650sPreparedExecution
  | Action650sBlockedPreparation;

const preparedExecutionProvenance = new WeakSet<object>();

const triggerPriority = {
  stop_loss_reached: 1,
  target_reached: 4,
  recommendation_entry: 6,
} as const;

function expectedSide(trigger: Action650sCandidateTrigger) {
  return trigger === "recommendation_entry" ? "BUY" : "SELL";
}

function canonicalCandidate(
  candidate: Action650sExecutionCandidate,
  observedAt: string,
) {
  const claimedMode = (candidate as Action650sExecutionCandidate & {
    execution_mode?: unknown;
  }).execution_mode;

  if (
    typeof candidate.candidate_identity !== "string" ||
    !candidate.candidate_identity.trim() ||
    candidate.side !== expectedSide(candidate.trigger) ||
    (claimedMode !== undefined && claimedMode !== "semi_automatic")
  ) {
    return null;
  }

  const createdAt = canonicalizeAction650sTimestamp(candidate.created_at);
  const expiresAt =
    candidate.expires_at === null
      ? null
      : canonicalizeAction650sTimestamp(candidate.expires_at);

  if (
    !createdAt ||
    (candidate.expires_at !== null && !expiresAt) ||
    Date.parse(createdAt) > Date.parse(observedAt) ||
    (expiresAt && Date.parse(observedAt) > Date.parse(expiresAt)) ||
    (candidate.trigger === "recommendation_entry" && !expiresAt)
  ) {
    return null;
  }

  const payload = canonicalizeAction650sOrderPayload({
    ticker: candidate.ticker,
    side: candidate.side,
    quantity: candidate.quantity,
    order_type: candidate.order_type,
    limit_price: candidate.limit_price,
    stop_price: candidate.stop_price,
    execution_mode: "semi_automatic",
    authority_scope: "manual_confirmation_bound_simulation",
    created_at: createdAt,
  });

  return payload
    ? {
        candidate_identity: candidate.candidate_identity.trim(),
        trigger: candidate.trigger,
        priority: triggerPriority[candidate.trigger],
        payload,
      }
    : null;
}

function blocked(
  reason: Action650sBlockedPreparation["blocked_reason"],
): Action650sBlockedPreparation {
  const base = {
    contract_version: action650sExecutionPreparationContractVersion,
    current_state: "blocked" as const,
    safety_decision: "blocked" as const,
    blocked_reason: reason,
    broker_progress_accepted: false as const,
    terminal_result_accepted: false as const,
    effects: {
      broker_requests_prepared: 0 as const,
      broker_requests_submitted: 0 as const,
      provider_calls: 0 as const,
      database_writes: 0 as const,
      trade_mutations: 0 as const,
      real_trade_mutations: 0 as const,
    },
  };

  return deepFreezeAction650s({
    ...base,
    trace_identity: `action_650s_preparation_${hashAction650sCanonicalValue(base)}`,
  }) as Action650sBlockedPreparation;
}

function lifecycleEvent(input: {
  runtime: Action650sRuntimeIdentityContext;
  sequence: number;
  event_type: Action650sPreparationState;
  occurred_at: string;
}): Action650sPreparationEvent {
  const identity = hashAction650sCanonicalValue({
    execution_identity: input.runtime.execution_identity,
    lifecycle_identity: input.runtime.lifecycle_identity,
    sequence: input.sequence,
    event_type: input.event_type,
    occurred_at: input.occurred_at,
  });

  return {
    event_identity: `action_650s_lifecycle_event_${identity.slice(0, 24)}`,
    sequence: input.sequence,
    event_type: input.event_type,
    execution_identity: input.runtime.execution_identity,
    lifecycle_identity: input.runtime.lifecycle_identity,
    occurred_at: input.occurred_at,
  };
}

/**
 * Pure preparation replay. It can only prepare a synthetic handoff and stop at
 * the manual-confirmation boundary.
 */
export function prepareAction650sExecution(input: {
  runtime: Action650sRuntimeIdentityContext;
  candidates: readonly Action650sExecutionCandidate[];
  observed_at: string;
}): Action650sPreparationResult {
  if (!hasAction650sRuntimeIdentityProvenance(input.runtime)) {
    return blocked("runtime_identity_unproven");
  }

  if (containsAction650sRestrictedMaterial(input)) {
    return blocked("restricted_material_rejected");
  }

  const observedAt = canonicalizeAction650sTimestamp(input.observed_at);

  if (!observedAt) {
    return blocked("timestamp_invalid");
  }

  const candidates = input.candidates
    .map((candidate) => canonicalCandidate(candidate, observedAt))
    .filter((candidate): candidate is NonNullable<typeof candidate> =>
      Boolean(candidate),
    )
    .sort(
      (left, right) =>
        left.priority - right.priority ||
        left.candidate_identity.localeCompare(right.candidate_identity),
    );
  const selected = candidates[0];

  if (!selected) {
    return blocked("no_valid_candidate");
  }

  const handoff = buildAction650sPreparedHandoff({
    runtime: input.runtime,
    payload: selected.payload,
  });

  if (!handoff) {
    return blocked("handoff_identity_invalid");
  }

  const lifecycleEvents = [
    lifecycleEvent({
      runtime: input.runtime,
      sequence: 1,
      event_type: "prepared",
      occurred_at: observedAt,
    }),
    lifecycleEvent({
      runtime: input.runtime,
      sequence: 2,
      event_type: "waiting_for_manual_confirmation",
      occurred_at: observedAt,
    }),
  ];
  const base = {
    contract_version: action650sExecutionPreparationContractVersion,
    runtime_identity_context: input.runtime,
    runtime_identity_context_digest: input.runtime.context_digest,
    selected_candidate: {
      candidate_identity: selected.candidate_identity,
      trigger: selected.trigger,
      priority: selected.priority,
    },
    handoff,
    current_state: "waiting_for_manual_confirmation" as const,
    lifecycle_events: lifecycleEvents,
    safety_decision: "manual_confirmation_required" as const,
    broker_progress_accepted: false as const,
    terminal_result_accepted: false as const,
    effects: {
      broker_requests_prepared: 1 as const,
      broker_requests_submitted: 0 as const,
      provider_calls: 0 as const,
      database_writes: 0 as const,
      trade_mutations: 0 as const,
      real_trade_mutations: 0 as const,
    },
  };
  const prepared = deepFreezeAction650s({
    ...base,
    trace_identity: `action_650s_preparation_${hashAction650sCanonicalValue(
      base,
    )}`,
  }) as Action650sPreparedExecution;

  preparedExecutionProvenance.add(prepared);

  return prepared;
}

export function hasAction650sPreparedExecutionProvenance(
  value: unknown,
): value is Action650sPreparedExecution {
  return Boolean(
    value &&
      typeof value === "object" &&
      preparedExecutionProvenance.has(value as object),
  );
}

export function rejectAction650sBrokerEventBeforeConfirmation(
  prepared: unknown,
) {
  return deepFreezeAction650s({
    accepted: false as const,
    reason: hasAction650sPreparedExecutionProvenance(prepared)
      ? ("manual_confirmation_not_verified" as const)
      : ("preparation_provenance_unproven" as const),
    broker_progress_accepted: false as const,
    terminal_result_accepted: false as const,
  });
}
