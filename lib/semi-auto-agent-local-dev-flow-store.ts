import {
  getBrowserExecutionLocalStorage,
  type ExecutionLocalJsonArrayReadResult,
  type ExecutionLocalStorageLike,
} from "@/lib/execution-local-storage-helpers";
import type { SemiAutoAgentDevFlowReview } from "@/lib/semi-auto-agent-dev-flow-review";

export const SEMI_AUTO_AGENT_LOCAL_DEV_FLOW_STORAGE_KEY =
  "ture_semi_auto_agent_local_dev_flow_v1";
export const MAX_SEMI_AUTO_AGENT_LOCAL_DEV_FLOW_EVENTS = 100;

export type SemiAutoAgentLocalDevFlowEvent = {
  event_id: string;
  created_at: string;
  payload_id: string | null;
  ticker: string | null;
  action: "buy" | "sell" | null;
  quantity: number | null;
  dev_flow_state: string;
  selected_local_result: string | null;
  terminal_local_outcome: string | null;
  warnings: string[];
  blocked_reasons: string[];
  source_context: string | null;
  local_only: true;
  dev_only: true;
  manual_final_confirmation_required: true;
  automatic_submit_allowed: false;
  automatic_submit_attempted: false;
  no_avanza_order_placed: true;
  no_broker_submit_attempted: true;
  not_sent_to_supabase: true;
  not_audit_record: true;
  trade_stats_pnl_mutated: false;
};

export type SemiAutoAgentLocalDevFlowReadResult =
  ExecutionLocalJsonArrayReadResult<SemiAutoAgentLocalDevFlowEvent>;

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function normalizeTimestamp(value: unknown): string | null {
  const timestamp = optionalString(value);

  return timestamp && Number.isFinite(Date.parse(timestamp)) ? timestamp : null;
}

function normalizeAction(value: unknown): "buy" | "sell" | null {
  return value === "buy" || value === "sell" ? value : null;
}

function normalizeStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value
        .map(optionalString)
        .filter((item): item is string => Boolean(item))
    : [];
}

function normalizeQuantity(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeSemiAutoAgentLocalDevFlowEvent(
  value: unknown,
): SemiAutoAgentLocalDevFlowEvent | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const candidate = value as Partial<SemiAutoAgentLocalDevFlowEvent>;
  const eventId = optionalString(candidate.event_id);
  const createdAt = normalizeTimestamp(candidate.created_at);

  if (
    !eventId ||
    !createdAt ||
    candidate.local_only !== true ||
    candidate.dev_only !== true ||
    candidate.manual_final_confirmation_required !== true ||
    candidate.automatic_submit_allowed !== false ||
    candidate.automatic_submit_attempted !== false ||
    candidate.no_avanza_order_placed !== true ||
    candidate.no_broker_submit_attempted !== true ||
    candidate.not_sent_to_supabase !== true ||
    candidate.not_audit_record !== true ||
    candidate.trade_stats_pnl_mutated !== false
  ) {
    return null;
  }

  return {
    event_id: eventId,
    created_at: createdAt,
    payload_id: optionalString(candidate.payload_id),
    ticker: optionalString(candidate.ticker),
    action: normalizeAction(candidate.action),
    quantity: normalizeQuantity(candidate.quantity),
    dev_flow_state: optionalString(candidate.dev_flow_state) ?? "idle",
    selected_local_result: optionalString(candidate.selected_local_result),
    terminal_local_outcome: optionalString(candidate.terminal_local_outcome),
    warnings: normalizeStringArray(candidate.warnings),
    blocked_reasons: normalizeStringArray(candidate.blocked_reasons),
    source_context: optionalString(candidate.source_context),
    local_only: true,
    dev_only: true,
    manual_final_confirmation_required: true,
    automatic_submit_allowed: false,
    automatic_submit_attempted: false,
    no_avanza_order_placed: true,
    no_broker_submit_attempted: true,
    not_sent_to_supabase: true,
    not_audit_record: true,
    trade_stats_pnl_mutated: false,
  };
}

function readEventsFromStorage(
  storage: ExecutionLocalStorageLike | null | undefined,
): SemiAutoAgentLocalDevFlowReadResult {
  if (!storage) {
    return {
      items: [],
      discardedCount: 0,
      storageAvailable: false,
      error: null,
    };
  }

  try {
    const parsed = JSON.parse(
      storage.getItem(SEMI_AUTO_AGENT_LOCAL_DEV_FLOW_STORAGE_KEY) ?? "[]",
    );
    const rawItems = Array.isArray(parsed) ? parsed : [];
    const items = rawItems
      .map(normalizeSemiAutoAgentLocalDevFlowEvent)
      .filter((item): item is SemiAutoAgentLocalDevFlowEvent => Boolean(item))
      .sort((left, right) => Date.parse(right.created_at) - Date.parse(left.created_at))
      .slice(0, MAX_SEMI_AUTO_AGENT_LOCAL_DEV_FLOW_EVENTS);

    return {
      items,
      discardedCount: rawItems.length - items.length,
      storageAvailable: true,
      error: null,
    };
  } catch (error) {
    return {
      items: [],
      discardedCount: 0,
      storageAvailable: true,
      error:
        error instanceof Error
          ? error.message
          : "Malformed semi-auto local dev flow store.",
    };
  }
}

export function readSemiAutoAgentLocalDevFlowEvents(
  storage: ExecutionLocalStorageLike | null | undefined =
    getBrowserExecutionLocalStorage(),
): SemiAutoAgentLocalDevFlowReadResult {
  return readEventsFromStorage(storage);
}

export function writeSemiAutoAgentLocalDevFlowEvents(
  events: readonly SemiAutoAgentLocalDevFlowEvent[],
  storage: ExecutionLocalStorageLike | null | undefined =
    getBrowserExecutionLocalStorage(),
): boolean {
  if (!storage) {
    return false;
  }

  const validEvents = events
    .map(normalizeSemiAutoAgentLocalDevFlowEvent)
    .filter((event): event is SemiAutoAgentLocalDevFlowEvent => Boolean(event))
    .sort((left, right) => Date.parse(right.created_at) - Date.parse(left.created_at))
    .slice(0, MAX_SEMI_AUTO_AGENT_LOCAL_DEV_FLOW_EVENTS);

  try {
    storage.setItem(
      SEMI_AUTO_AGENT_LOCAL_DEV_FLOW_STORAGE_KEY,
      JSON.stringify(validEvents),
    );
    return true;
  } catch {
    return false;
  }
}

export function appendSemiAutoAgentLocalDevFlowEvent(
  event: SemiAutoAgentLocalDevFlowEvent,
  storage: ExecutionLocalStorageLike | null | undefined =
    getBrowserExecutionLocalStorage(),
): boolean {
  const currentEvents = readSemiAutoAgentLocalDevFlowEvents(storage).items;

  return writeSemiAutoAgentLocalDevFlowEvents([event, ...currentEvents], storage);
}

export function clearSemiAutoAgentLocalDevFlowEvents(
  storage: ExecutionLocalStorageLike | null | undefined =
    getBrowserExecutionLocalStorage(),
): boolean {
  if (!storage) {
    return false;
  }

  try {
    storage.setItem(SEMI_AUTO_AGENT_LOCAL_DEV_FLOW_STORAGE_KEY, "[]");
    return true;
  } catch {
    return false;
  }
}

function safeIdPart(value: string | null): string {
  return (value ?? "none").toLowerCase().replace(/[^a-z0-9_-]+/g, "_");
}

function normalizeNow(value: string | Date | undefined): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "string" && Number.isFinite(Date.parse(value))) {
    return value;
  }

  return new Date(0).toISOString();
}

export function buildSemiAutoAgentLocalDevFlowEvent(
  review: SemiAutoAgentDevFlowReview,
  options: { now?: string | Date } = {},
): SemiAutoAgentLocalDevFlowEvent {
  const createdAt = normalizeNow(options.now);
  const payloadId = review.payloadId;

  return {
    event_id: [
      "semi_auto_local_dev_flow",
      safeIdPart(payloadId),
      safeIdPart(review.state.status),
      safeIdPart(createdAt),
    ].join("_"),
    created_at: createdAt,
    payload_id: payloadId,
    ticker: review.ticker,
    action: review.action,
    quantity: review.quantity,
    dev_flow_state: review.state.status,
    selected_local_result: review.localResultStatus,
    terminal_local_outcome: review.terminalOutcome,
    warnings: [...review.warnings],
    blocked_reasons: [...review.blockedReasons],
    source_context:
      review.state.payloadResult?.payload.source_context ??
      review.state.payloadResult?.payload.broker_target_label ??
      null,
    local_only: true,
    dev_only: true,
    manual_final_confirmation_required: true,
    automatic_submit_allowed: false,
    automatic_submit_attempted: false,
    no_avanza_order_placed: true,
    no_broker_submit_attempted: true,
    not_sent_to_supabase: true,
    not_audit_record: true,
    trade_stats_pnl_mutated: false,
  };
}
