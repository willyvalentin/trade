import type { BrokerExecutionMetadata } from "@/lib/broker-execution-metadata";

export type ExecutionTimelineEventType =
  | "recommendation_validated"
  | "execution_payload_generated"
  | "execution_payload_copied"
  | "execution_payload_ready_for_agent"
  | "agent_dry_run_completed"
  | "handoff_integrity_checked"
  | "handoff_integrity_failed"
  | "agent_prepared_order_form_checked"
  | "broker_order_preview_captured"
  | "broker_manual_confirmation_checked"
  | "broker_plan_match_checked"
  | "broker_fill_entered"
  | "live_day_trade_created_after_broker_confirmation"
  | "trade_closed";

export type ExecutionTimelineEvent = {
  id: string;
  type: ExecutionTimelineEventType;
  timestamp: string;
  label: string;
  description: string;
  status: "completed" | "warning" | "missing" | "info";
  source: "local_event" | "execution_metadata" | "position" | "derived";
  payload_id?: string | null;
  payload_fingerprint?: string | null;
  handoff_session_id?: string | null;
  recommendation_id?: string | null;
  ticker?: string | null;
  metadata?: Record<string, unknown>;
};

export type BuildExecutionTimelineInput = {
  positionId?: string | null;
  recommendationId?: string | null;
  ticker?: string | null;
  status?: string | null;
  openedAt?: string | null;
  closedAt?: string | null;
  executionMetadata?: BrokerExecutionMetadata | null;
  localEvents?: unknown[];
};

const eventLabels: Record<ExecutionTimelineEventType, string> = {
  recommendation_validated: "Recommendation validated",
  execution_payload_generated: "Payload generated",
  execution_payload_copied: "Payload copied",
  execution_payload_ready_for_agent: "Marked ready for agent",
  agent_dry_run_completed: "Pre-agent dry run completed",
  handoff_integrity_checked: "Handoff integrity checked",
  handoff_integrity_failed: "Handoff integrity failed",
  agent_prepared_order_form_checked: "Agent prepared order form",
  broker_order_preview_captured: "Broker preview captured",
  broker_manual_confirmation_checked: "Manual Avanza confirmation checked",
  broker_plan_match_checked: "Broker order matched Trade plan",
  broker_fill_entered: "Broker fill entered",
  live_day_trade_created_after_broker_confirmation: "Live Day Trade created",
  trade_closed: "Trade closed",
};

const eventDescriptions: Record<ExecutionTimelineEventType, string> = {
  recommendation_validated: "ADD TRADE validation completed.",
  execution_payload_generated: "Prepare-only execution payload was created.",
  execution_payload_copied: "Execution payload was copied locally.",
  execution_payload_ready_for_agent: "Payload was marked ready for future agent handoff.",
  agent_dry_run_completed: "Pre-agent dry run simulation completed.",
  handoff_integrity_checked: "Handoff session integrity check completed.",
  handoff_integrity_failed: "Handoff session integrity check failed.",
  agent_prepared_order_form_checked: "User marked that an agent prepared the order form.",
  broker_order_preview_captured: "User recorded the broker order preview.",
  broker_manual_confirmation_checked: "User confirmed manual Avanza order confirmation.",
  broker_plan_match_checked: "User confirmed broker order matched the Trade plan.",
  broker_fill_entered: "Actual broker fill details were entered.",
  live_day_trade_created_after_broker_confirmation: "Trade tracking position was created.",
  trade_closed: "Trade was closed manually in Trade.",
};

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function arrayLength(value: unknown) {
  return Array.isArray(value) ? value.length : 0;
}

function isTimelineType(value: unknown): value is ExecutionTimelineEventType {
  return typeof value === "string" && value in eventLabels;
}

function timestampFrom(value: unknown) {
  const timestamp =
    stringValue(value) ?? stringValue(new Date().toISOString());
  return timestamp ?? new Date().toISOString();
}

export function readTradeManagementEvents(): unknown[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const parsed = JSON.parse(
      window.localStorage.getItem("trade-management-events") ?? "[]",
    );
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function eventMatches(
  raw: Record<string, unknown>,
  input: BuildExecutionTimelineInput,
) {
  const metadata = input.executionMetadata;
  const recommendationId = input.recommendationId ?? metadata?.recommendation_id;
  const handoffSessionId = metadata?.handoff_session_id;
  const payloadId = metadata?.execution_payload_id;
  const payloadFingerprint = metadata?.execution_payload_fingerprint;
  const ticker = input.ticker;

  if (handoffSessionId && raw.handoff_session_id) {
    return raw.handoff_session_id === handoffSessionId;
  }

  return (
    (handoffSessionId && raw.handoff_session_id === handoffSessionId) ||
    (payloadId && raw.payload_id === payloadId) ||
    (payloadFingerprint && raw.payload_fingerprint === payloadFingerprint) ||
    (recommendationId && raw.recommendation_id === recommendationId) ||
    (input.positionId && raw.position_id === input.positionId) ||
    (ticker && raw.ticker === ticker)
  );
}

function fromLocalEvent(
  raw: Record<string, unknown>,
): ExecutionTimelineEvent | null {
  if (!isTimelineType(raw.type)) {
    return null;
  }

  const timestamp = timestampFrom(raw.timestamp ?? raw.completed_at ?? raw.closed_at);
  const status = getLocalEventTimelineStatus(raw);

  return {
    id: `local_${raw.type}_${timestamp}_${stringValue(raw.payload_id) ?? ""}`,
    type: raw.type,
    timestamp,
    label: eventLabels[raw.type],
    description: getLocalEventDescription(raw),
    status,
    source: "local_event",
    payload_id: stringValue(raw.payload_id),
    payload_fingerprint: stringValue(raw.payload_fingerprint),
    handoff_session_id: stringValue(raw.handoff_session_id),
    recommendation_id: stringValue(raw.recommendation_id),
    ticker: stringValue(raw.ticker),
    metadata: raw,
  };
}

function getLocalEventTimelineStatus(
  raw: Record<string, unknown>,
): ExecutionTimelineEvent["status"] {
  if (raw.type === "agent_dry_run_completed") {
    if (raw.dry_run_passed === true) {
      return "completed";
    }

    if (raw.dry_run_passed === false) {
      return "warning";
    }

    return "info";
  }

  if (
    raw.type === "handoff_integrity_checked" ||
    raw.type === "handoff_integrity_failed"
  ) {
    if (raw.status === "failed" || raw.type === "handoff_integrity_failed") {
      return "warning";
    }

    if (raw.status === "warning") {
      return "warning";
    }

    if (raw.status === "passed") {
      return "completed";
    }

    return "info";
  }

  if (
    raw.type === "broker_order_preview_captured" &&
    stringValue(raw.warning_type) &&
    raw.warning_type !== "none"
  ) {
    return "warning";
  }

  return "completed";
}

function getLocalEventDescription(raw: Record<string, unknown>) {
  if (
    raw.type !== "agent_dry_run_completed" &&
    raw.type !== "handoff_integrity_checked" &&
    raw.type !== "handoff_integrity_failed"
  ) {
    return eventDescriptions[raw.type as ExecutionTimelineEventType];
  }

  if (
    raw.type === "handoff_integrity_checked" ||
    raw.type === "handoff_integrity_failed"
  ) {
    const status = stringValue(raw.status) ?? "unknown";
    const score = numberValue(raw.score);
    const failedCount = arrayLength(raw.failed_codes);
    const warningCount = arrayLength(raw.warning_codes);
    const parts = [
      `Integrity ${status}${score === null ? "" : ` ${score}/100`}.`,
    ];

    if (failedCount > 0) {
      parts.push(`${failedCount} failed issue${failedCount === 1 ? "" : "s"}.`);
    }

    if (warningCount > 0) {
      parts.push(`${warningCount} warning issue${warningCount === 1 ? "" : "s"}.`);
    }

    parts.push("Audit only; no browser or broker action was started.");

    return parts.join(" ");
  }

  const passed =
    raw.dry_run_passed === true
      ? "passed"
      : raw.dry_run_passed === false
        ? "failed"
        : "completed";
  const readinessStatus = stringValue(raw.agent_readiness_status);
  const readinessScore = numberValue(raw.agent_readiness_score);
  const failedCount = arrayLength(raw.failed_step_ids);
  const warningCount = arrayLength(raw.warning_step_ids);
  const parts = [`Dry run ${passed}.`];

  if (readinessStatus || readinessScore !== null) {
    parts.push(
      `Readiness ${readinessStatus ?? "unknown"}${
        readinessScore === null ? "" : ` ${readinessScore}/100`
      }.`,
    );
  }

  if (failedCount > 0) {
    parts.push(`${failedCount} failed step${failedCount === 1 ? "" : "s"}.`);
  }

  if (warningCount > 0) {
    parts.push(`${warningCount} warning step${warningCount === 1 ? "" : "s"}.`);
  }

  parts.push("Audit only; no browser or broker action was started.");

  return parts.join(" ");
}

function derivedEvent(
  type: ExecutionTimelineEventType,
  timestamp: string | null | undefined,
  source: ExecutionTimelineEvent["source"],
  input: BuildExecutionTimelineInput,
  status: ExecutionTimelineEvent["status"] = "completed",
): ExecutionTimelineEvent | null {
  if (!timestamp) {
    return null;
  }

  const metadata = input.executionMetadata;

  return {
    id: `${source}_${type}_${timestamp}`,
    type,
    timestamp,
    label: eventLabels[type],
    description:
      type === "handoff_integrity_checked" && metadata?.handoff_integrity
        ? `Integrity ${metadata.handoff_integrity.status} ${metadata.handoff_integrity.score}/100. ${metadata.handoff_integrity.failed_codes.length} failed issue${metadata.handoff_integrity.failed_codes.length === 1 ? "" : "s"}. ${metadata.handoff_integrity.warning_codes.length} warning issue${metadata.handoff_integrity.warning_codes.length === 1 ? "" : "s"}.`
        : eventDescriptions[type],
    status,
    source,
    payload_id: metadata?.execution_payload_id ?? null,
    payload_fingerprint: metadata?.execution_payload_fingerprint ?? null,
    handoff_session_id: metadata?.handoff_session_id ?? null,
    recommendation_id: input.recommendationId ?? metadata?.recommendation_id ?? null,
    ticker: input.ticker ?? null,
  };
}

export function buildExecutionTimeline(
  input: BuildExecutionTimelineInput,
): ExecutionTimelineEvent[] {
  const metadata = input.executionMetadata;
  const localEvents = (input.localEvents ?? [])
    .filter((event): event is Record<string, unknown> =>
      Boolean(event && typeof event === "object"),
    )
    .filter((event) => eventMatches(event, input))
    .map(fromLocalEvent)
    .filter((event): event is ExecutionTimelineEvent => event !== null);
  const derivedEvents = [
    derivedEvent(
      "execution_payload_generated",
      input.openedAt,
      "execution_metadata",
      input,
      metadata ? "info" : "missing",
    ),
    derivedEvent(
      "broker_order_preview_captured",
      metadata?.broker_order_preview?.captured_at,
      "execution_metadata",
      input,
      metadata?.broker_order_preview?.warning_type === "none" ? "completed" : "warning",
    ),
    derivedEvent(
      "broker_fill_entered",
      metadata?.broker_confirmed_at,
      "execution_metadata",
      input,
    ),
    derivedEvent(
      "handoff_integrity_checked",
      metadata?.handoff_integrity?.checked_at,
      "execution_metadata",
      input,
      metadata?.handoff_integrity?.status === "failed"
        ? "warning"
        : metadata?.handoff_integrity?.status === "warning"
          ? "warning"
          : "completed",
    ),
    derivedEvent(
      "live_day_trade_created_after_broker_confirmation",
      input.openedAt,
      "position",
      input,
    ),
    derivedEvent("trade_closed", input.closedAt, "position", input),
  ].filter((event): event is ExecutionTimelineEvent => event !== null);
  const eventByKey = new Map<string, ExecutionTimelineEvent>();

  for (const event of [...derivedEvents, ...localEvents]) {
    const key = `${event.type}_${event.timestamp}`;
    const existing = eventByKey.get(key);

    if (!existing || existing.source !== "local_event") {
      eventByKey.set(key, event);
    }
  }

  return Array.from(eventByKey.values()).sort(
    (first, second) =>
      new Date(first.timestamp).getTime() - new Date(second.timestamp).getTime(),
  );
}
