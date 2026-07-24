import { createHash } from "node:crypto";

import { buildAvanzaExecutionHandoff, type AvanzaExecutionHandoff } from "@/lib/avanza-execution-handoff";
import {
  buildAvanzaAdapterRequest,
  canonicalizeAvanzaAdapterPayload,
  type AvanzaAdapterRequest,
} from "@/lib/avanza-adapter-identity";
import { buildTureExecutionRecord } from "@/lib/broker-execution-capture";
import { getExecutionAuthorityForMode, getExecutionTriggerPriority, type BrokerExecutionStatus, type ExecutionAction, type ExecutionIntent, type ExecutionMode, type ExecutionTriggerType } from "@/lib/execution";
import { pickNextExecutionIntent } from "@/lib/execution-candidate-picker";
import {
  createExplicitExecutionRuntimeIdentityContext,
  type ExecutionRuntimeIdentityContext,
} from "@/lib/execution-runtime-identity";
import { createExecutionLifecycleSnapshot, transitionExecutionLifecycle, type ExecutionLifecycleEvent, type ExecutionLifecycleEventType, type ExecutionLifecycleSnapshot } from "@/lib/execution-state-machine";

export const executionAgentDeterministicSafetyReplayContractVersion =
  "execution_agent_deterministic_safety_replay_v1" as const;

export type ExecutionSafetyReplayTrigger =
  | "recommendation_entry"
  | "target_reached"
  | "stop_loss_reached"
  | "target_and_stop_reached"
  | "manual_exit";

export type ExecutionSafetyReplayCandidate = Readonly<{
  identity: string;
  source: "recommendation" | "live_position";
  trigger: ExecutionSafetyReplayTrigger;
  ticker: string;
  quantity: number | null;
  limit_price: number | null;
  target_price: number | null;
  stop_price: number | null;
  recommendation_id: string | null;
  position_id: string | null;
  created_at: string;
  expires_at: string | null;
}>;

export type ExecutionSafetyReplayBrokerResult = Readonly<{
  execution_identity: string;
  status: BrokerExecutionStatus;
  broker_order_id: string;
  captured_at: string;
  quantity: number;
  executed_price: number;
  ticker: string;
  action: ExecutionAction;
}>;

export type ExecutionSafetyReplayRecordedIdentity = Readonly<{
  execution_identity: string;
  broker_order_id: string;
  terminal_status: "completed" | "failed" | "cancelled" | "unknown";
}>;

export type ExecutionSafetyReplayFixture = Readonly<{
  mode: ExecutionMode;
  automatic_authority_granted: boolean;
  candidates: readonly ExecutionSafetyReplayCandidate[];
  lifecycle_starting_state?: "idle" | "broker_order_submitting";
  broker_progress_events: readonly ("preparing" | "submitting")[];
  broker_terminal_result: ExecutionSafetyReplayBrokerResult | null;
  previously_recorded_execution_identities: readonly ExecutionSafetyReplayRecordedIdentity[];
  timestamps: Readonly<{
    created_at: string;
    handoff_at: string;
    broker_at: string;
  }>;
}>;

export type ExecutionSafetyReplayAuditEvent = Readonly<{
  audit_event_id: string;
  sequence: number;
  type: string;
  execution_identity: string | null;
  timestamp: string;
}>;

export type ExecutionSafetyReplayResult = Readonly<{
  contract_version: typeof executionAgentDeterministicSafetyReplayContractVersion;
  selected_candidate: Readonly<{ identity: string; priority: number; action: ExecutionAction; trigger: ExecutionSafetyReplayTrigger }> | null;
  authority_decision: "semi_automatic_manual_confirmation_required" | "automatic_authority_missing" | "automatic_authority_granted" | "no_candidate";
  safety_check_result: "passed" | "blocked";
  handoff_request: AvanzaExecutionHandoff | null;
  adapter_request: AvanzaAdapterRequest | null;
  lifecycle: ExecutionLifecycleSnapshot;
  lifecycle_transitions: readonly ExecutionLifecycleEvent[];
  manual_confirmation_required: boolean;
  submission_permitted: boolean;
  normalized_broker_result: Readonly<{ status: BrokerExecutionStatus; execution_identity: string }> | null;
  execution_record: ReturnType<typeof buildTureExecutionRecord>["record"] | null;
  audit_events: readonly ExecutionSafetyReplayAuditEvent[];
  blocked_reason: string | null;
  effects: Readonly<{
    broker_requests_prepared: number;
    broker_requests_submitted: 0;
    simulated_submission_permitted: number;
    provider_calls: 0;
    database_writes: 0;
    trade_mutations: number;
    real_trade_mutations: 0;
    execution_records_created: number;
    audit_events_created: number;
  }>;
  replay_fingerprint: string;
}>;

function canonicalTimestamp(value: string) {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) && new Date(value).toISOString() === value
    ? value
    : null;
}

function triggerForCandidate(trigger: ExecutionSafetyReplayTrigger): ExecutionTriggerType {
  if (trigger === "recommendation_entry") return "entry_recommendation_ready";
  if (trigger === "manual_exit") return "manual_exit_requested";
  return trigger === "target_reached" ? "exit_target_reached" : "exit_stop_loss_reached";
}

function actionForTrigger(trigger: ExecutionSafetyReplayTrigger): ExecutionAction {
  return trigger === "recommendation_entry" ? "buy" : "sell";
}

function stableId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function buildIntent(candidate: ExecutionSafetyReplayCandidate, mode: ExecutionMode): ExecutionIntent | null {
  const trigger = triggerForCandidate(candidate.trigger);
  const action = actionForTrigger(candidate.trigger);
  if (!canonicalTimestamp(candidate.created_at) || !candidate.identity.trim() || !candidate.ticker.trim()) return null;
  return {
    intent_version: "1.0",
    intent_id: `replay_intent_${stableId(candidate.identity)}`,
    created_at: candidate.created_at,
    mode,
    authority: getExecutionAuthorityForMode(mode),
    action,
    trigger_type: trigger,
    trigger_priority: getExecutionTriggerPriority(trigger),
    broker_hint: "AVANZA",
    source: candidate.source === "recommendation" ? "recommendation" : "live_day_trade_position",
    trading_package: {
      package_version: "1.0",
      recommendation_id: candidate.recommendation_id,
      live_position_id: candidate.position_id,
      ticker: candidate.ticker,
      market: "US",
      quantity: candidate.quantity,
      order_type: "limit",
      limit_price: candidate.limit_price,
      stop_loss: candidate.stop_price,
      target_price: candidate.target_price,
      expires_at: candidate.expires_at,
      payload_id: `replay_payload_${stableId(candidate.identity)}`,
      payload_fingerprint: `replay_payload_fingerprint_${stableId(candidate.identity)}`,
    },
    safety_warnings: [],
    broker_result: null,
  };
}

function transition(
  lifecycle: ExecutionLifecycleSnapshot,
  identity: ExecutionRuntimeIdentityContext,
  eventType: ExecutionLifecycleEventType,
  timestamp: string,
  intent: ExecutionIntent,
  handoff?: AvanzaExecutionHandoff,
  brokerStatus?: BrokerExecutionStatus,
  recordId?: string,
) {
  return transitionExecutionLifecycle(lifecycle, eventType, {
    eventId: identity.lifecycleEventId({
      eventType,
      eventIndex: lifecycle.events.length,
    }),
    createdAt: timestamp,
    intentId: intent.intent_id,
    handoffVersion: handoff?.version,
    brokerStatus,
    recordId,
  });
}

function fingerprint(result: Omit<ExecutionSafetyReplayResult, "replay_fingerprint">) {
  return `execution_safety_replay_${createHash("sha256").update(JSON.stringify(result)).digest("hex").slice(0, 24)}`;
}

/** Pure deterministic replay. It never calls a broker, provider, database, or transport. */
export function replayExecutionAgentSafety(fixture: ExecutionSafetyReplayFixture): ExecutionSafetyReplayResult {
  const createdAt = canonicalTimestamp(fixture.timestamps.created_at);
  const handoffAt = canonicalTimestamp(fixture.timestamps.handoff_at);
  const brokerAt = canonicalTimestamp(fixture.timestamps.broker_at);
  const safeCreatedAt = createdAt ?? "1970-01-01T00:00:00.000Z";
  const safeHandoffAt = handoffAt ?? safeCreatedAt;
  const safeBrokerAt = brokerAt ?? safeHandoffAt;
  const intents = fixture.candidates.map((candidate) => buildIntent(candidate, fixture.mode)).filter((intent): intent is ExecutionIntent => intent !== null);
  const picked = pickNextExecutionIntent(intents);
  const selected = picked.selectedIntent;
  const selectedCandidate = selected ? fixture.candidates.find((candidate) => `replay_intent_${stableId(candidate.identity)}` === selected.intent_id) ?? null : null;
  const identity = createExplicitExecutionRuntimeIdentityContext({
    now: safeCreatedAt,
    executionId: `replay_${stableId(selected?.intent_id ?? "none")}`,
  });
  let lifecycle = createExecutionLifecycleSnapshot({ lifecycleId: identity.lifecycleId, initialState: fixture.lifecycle_starting_state ?? "idle", createdAt: safeCreatedAt, mode: fixture.mode, action: selected?.action, triggerType: selected?.trigger_type, intentId: selected?.intent_id, recommendationId: selected?.trading_package.recommendation_id, positionId: selected?.trading_package.live_position_id });
  const audits: ExecutionSafetyReplayAuditEvent[] = [];
  let blockedReason: string | null = null;
  let handoff: AvanzaExecutionHandoff | null = null;
  let adapterRequest: AvanzaAdapterRequest | null = null;
  let submissionPermitted = false;
  const manualConfirmationRequired = fixture.mode === "semi_automatic";
  let record: ExecutionSafetyReplayResult["execution_record"] = null;
  let normalizedBroker: ExecutionSafetyReplayResult["normalized_broker_result"] = null;
  let tradeMutations = 0;
  const addAudit = (type: string, executionIdentity: string | null, timestamp: string) => audits.push({ audit_event_id: identity.auditEventId({ auditType: type, eventIndex: audits.length }), sequence: audits.length + 1, type, execution_identity: executionIdentity, timestamp });

  if (!createdAt || !handoffAt || !brokerAt) blockedReason = "timestamp_invalid";
  if (!selected || !selectedCandidate) blockedReason ??= "no_valid_candidate";
  if (selected && selectedCandidate && !blockedReason) {
    const expiry = selectedCandidate.expires_at ? canonicalTimestamp(selectedCandidate.expires_at) : null;
    if (selected.action === "buy" && (!expiry || Date.parse(safeCreatedAt) > Date.parse(expiry))) blockedReason = "recommendation_stale";
    const created = transition(lifecycle, identity, "create_intent", safeCreatedAt, selected);
    if (created.ok) lifecycle = created.snapshot;
    const pickedTransition = transition(lifecycle, identity, "select_candidate", safeCreatedAt, selected);
    if (pickedTransition.ok) lifecycle = pickedTransition.snapshot;
    handoff = buildAvanzaExecutionHandoff(selected, { createdAt: safeHandoffAt });
    const payload = canonicalizeAvanzaAdapterPayload({
      ticker: selected.trading_package.ticker,
      side: selected.action === "buy" ? "BUY" : "SELL",
      quantity: selected.trading_package.quantity,
      order_type: selected.trading_package.order_type.toUpperCase(),
      limit_price: selected.trading_package.limit_price,
      stop_price: selected.trading_package.stop_loss,
      position_id: selected.trading_package.live_position_id,
      execution_mode: selected.mode,
      authority_scope: selected.mode === "automatic" ? "automatic_final_submit" : "manual_final_confirmation",
      created_at: safeCreatedAt,
    });
    adapterRequest = payload
      ? buildAvanzaAdapterRequest({ runtime: identity, payload, automatic_authority_granted: fixture.automatic_authority_granted })
      : null;
    const handoffTransition = transition(lifecycle, identity, "create_handoff", safeHandoffAt, selected, handoff);
    if (handoffTransition.ok) lifecycle = handoffTransition.snapshot;
    if (handoff.status !== "ready") blockedReason ??= handoff.blockedReason ?? "handoff_blocked";
    if (fixture.mode === "automatic" && !fixture.automatic_authority_granted) blockedReason ??= "automatic_authority_missing";
    const preparing = transition(lifecycle, identity, "start_broker_preparation", safeHandoffAt, selected, handoff);
    if (preparing.ok) lifecycle = preparing.snapshot;
    if (!blockedReason && fixture.mode === "semi_automatic") {
      const waiting = transition(lifecycle, identity, "wait_for_manual_confirmation", safeHandoffAt, selected, handoff);
      if (waiting.ok) lifecycle = waiting.snapshot;
      addAudit("manual_confirmation_required", selected.intent_id, safeHandoffAt);
    } else if (!blockedReason && fixture.mode === "automatic") {
      submissionPermitted = true;
      const submitting = transition(lifecycle, identity, "submit_broker_order", safeHandoffAt, selected, handoff);
      if (submitting.ok) lifecycle = submitting.snapshot;
      addAudit("simulated_submission_permitted", selected.intent_id, safeHandoffAt);
      for (const progress of fixture.broker_progress_events) {
        addAudit(`broker_progress_${progress}`, selected.intent_id, safeBrokerAt);
      }
    }
  }

  if (blockedReason && selected) addAudit("blocked", selected.intent_id, safeHandoffAt);
  const executionIdentity = selected?.intent_id ?? null;
  const broker = fixture.broker_terminal_result;
  if (!blockedReason && selected && broker) {
    if (broker.execution_identity !== executionIdentity || broker.ticker !== selected.trading_package.ticker || broker.action !== selected.action) {
      blockedReason = "broker_result_cross_execution_mismatch";
      addAudit("broker_result_rejected", broker.execution_identity, safeBrokerAt);
    } else {
      const prior = fixture.previously_recorded_execution_identities.find((item) => item.execution_identity === executionIdentity);
      if (prior) {
        blockedReason = prior.broker_order_id === broker.broker_order_id ? "duplicate_broker_confirmation" : "conflicting_broker_confirmation";
        addAudit(blockedReason, executionIdentity, safeBrokerAt);
      } else if (lifecycle.currentState === "broker_order_submitting" || lifecycle.currentState === "waiting_for_manual_confirmation") {
        const captured = transition(lifecycle, identity, "capture_broker_result", safeBrokerAt, selected, handoff ?? undefined, broker.status);
        if (captured.ok) lifecycle = captured.snapshot;
        const capture = buildTureExecutionRecord(selected, {
          broker: "avanza", action: broker.action, ticker: broker.ticker, quantity: broker.quantity, status: broker.status,
          orderId: broker.broker_order_id, executedPrice: broker.executed_price, brokerTimestamp: broker.captured_at,
        }, { createdAt: safeBrokerAt, recordId: identity.recordId });
        normalizedBroker = { status: broker.status, execution_identity: executionIdentity };
        if (capture.captureStatus === "captured") {
          record = capture.record;
          const completed = transition(lifecycle, identity, "complete_execution", safeBrokerAt, selected, handoff ?? undefined, broker.status, record.recordId);
          if (completed.ok) lifecycle = completed.snapshot;
          tradeMutations = 1;
          addAudit("execution_completed", executionIdentity, safeBrokerAt);
        } else if (capture.captureStatus === "broker_rejected") {
          const failed = transition(lifecycle, identity, "fail_execution", safeBrokerAt, selected, handoff ?? undefined, broker.status);
          if (failed.ok) lifecycle = failed.snapshot;
          addAudit("broker_rejected", executionIdentity, safeBrokerAt);
        } else if (capture.captureStatus === "broker_cancelled") {
          const cancelled = transition(lifecycle, identity, "cancel_execution", safeBrokerAt, selected, handoff ?? undefined, broker.status);
          if (cancelled.ok) lifecycle = cancelled.snapshot;
          addAudit("broker_cancelled", executionIdentity, safeBrokerAt);
        } else {
          const unknown = transition(lifecycle, identity, "mark_unknown", safeBrokerAt, selected, handoff ?? undefined, broker.status);
          if (unknown.ok) lifecycle = unknown.snapshot;
          addAudit("broker_result_needs_review", executionIdentity, safeBrokerAt);
        }
      }
    }
  }

  const authorityDecision = !selected ? "no_candidate" : fixture.mode === "semi_automatic" ? "semi_automatic_manual_confirmation_required" : fixture.automatic_authority_granted ? "automatic_authority_granted" : "automatic_authority_missing";
  const base = {
    contract_version: executionAgentDeterministicSafetyReplayContractVersion,
    selected_candidate: selected && selectedCandidate ? { identity: selectedCandidate.identity, priority: selected.trigger_priority, action: selected.action, trigger: selectedCandidate.trigger } : null,
    authority_decision: authorityDecision,
    safety_check_result: blockedReason ? "blocked" as const : "passed" as const,
    handoff_request: handoff,
    adapter_request: adapterRequest,
    lifecycle,
    lifecycle_transitions: lifecycle.events,
    manual_confirmation_required: manualConfirmationRequired,
    submission_permitted: submissionPermitted,
    normalized_broker_result: normalizedBroker,
    execution_record: record,
    audit_events: audits,
    blocked_reason: blockedReason,
    effects: {
      broker_requests_prepared: handoff?.canPrepareOrder ? 1 : 0,
      broker_requests_submitted: 0 as const,
      simulated_submission_permitted: submissionPermitted ? 1 : 0,
      provider_calls: 0 as const,
      database_writes: 0 as const,
      trade_mutations: tradeMutations,
      real_trade_mutations: 0 as const,
      execution_records_created: record ? 1 : 0,
      audit_events_created: audits.length,
    },
  } satisfies Omit<ExecutionSafetyReplayResult, "replay_fingerprint">;
  return Object.freeze({ ...base, replay_fingerprint: fingerprint(base) });
}
