import type { BrokerExecutionMetadata } from "@/lib/broker-execution-metadata";
import { TRADE_MANAGEMENT_EVENTS_STORAGE_KEY } from "@/lib/persistence/local-storage-keys";

export type ExecutionTimelineEventType =
  | "add_trade_validation"
  | "recommendation_validated"
  | "execution_payload_generated"
  | "execution_payload_copied"
  | "execution_payload_ready_for_agent"
  | "buy_order_ready_for_agent"
  | "agent_handoff_blocked_by_readiness"
  | "agent_handoff_command_generated"
  | "agent_handoff_command_copied"
  | "agent_hard_stop_contract_evaluated"
  | "agent_form_mapping_preview_generated"
  | "agent_form_mapping_preview_copied"
  | "avanza_buy_field_verification_generated"
  | "avanza_buy_field_verification_copied"
  | "avanza_verification_notes_applied_to_report"
  | "risk_controls_saved"
  | "risk_controls_reset"
  | "risk_controls_evaluated_for_new_trade"
  | "risk_controls_blocked_new_trade"
  | "risk_controls_warning_new_trade"
  | "buy_order_handoff_progress_generated"
  | "broker_fill_capture_agent_spec_generated"
  | "broker_fill_capture_agent_spec_copied"
  | "ture_fill_autofill_contract_generated"
  | "ture_fill_autofill_contract_copied"
  | "agent_dry_run_completed"
  | "handoff_integrity_checked"
  | "handoff_integrity_failed"
  | "agent_prepared_order_form_checked"
  | "broker_buy_form_prepared_checked"
  | "broker_order_preview_captured"
  | "broker_manual_confirmation_checked"
  | "broker_plan_match_checked"
  | "fill_capture_review_generated"
  | "ture_agent_completion_policy_generated"
  | "trade_planning_snapshot_captured"
  | "broker_fill_entered"
  | "live_day_trade_created_after_broker_confirmation"
  | "sell_execution_payload_generated"
  | "sell_execution_payload_copied"
  | "sell_agent_handoff_command_generated"
  | "sell_agent_handoff_command_copied"
  | "sell_hard_stop_contract_evaluated"
  | "sell_form_mapping_preview_generated"
  | "sell_form_mapping_preview_copied"
  | "avanza_sell_field_verification_generated"
  | "avanza_sell_field_verification_copied"
  | "broker_exit_capture_agent_spec_generated"
  | "broker_exit_capture_agent_spec_copied"
  | "ture_exit_autofill_contract_generated"
  | "ture_exit_autofill_contract_copied"
  | "broker_sell_manual_confirmation_checked"
  | "broker_sell_plan_match_checked"
  | "exit_capture_review_generated"
  | "ture_exit_completion_policy_generated"
  | "broker_exit_fill_captured"
  | "live_day_trade_closed_after_broker_exit_confirmation"
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
  add_trade_validation: "ADD TRADE validation",
  recommendation_validated: "Recommendation validated",
  execution_payload_generated: "Payload generated",
  execution_payload_copied: "Payload copied",
  execution_payload_ready_for_agent: "Marked ready for agent",
  buy_order_ready_for_agent: "Buy order ready for agent",
  agent_handoff_blocked_by_readiness: "Agent handoff blocked",
  agent_handoff_command_generated: "Buy agent command generated",
  agent_handoff_command_copied: "Buy agent command copied",
  agent_hard_stop_contract_evaluated: "Buy hard stops evaluated",
  agent_form_mapping_preview_generated: "Buy form mapping generated",
  agent_form_mapping_preview_copied: "Buy form mapping copied",
  avanza_buy_field_verification_generated: "Avanza buy field verification generated",
  avanza_buy_field_verification_copied: "Avanza buy field verification copied",
  avanza_verification_notes_applied_to_report:
    "Manual Avanza notes applied to report",
  risk_controls_saved: "Risk controls saved",
  risk_controls_reset: "Risk controls reset",
  risk_controls_evaluated_for_new_trade: "Risk controls evaluated",
  risk_controls_blocked_new_trade: "Risk controls blocked new trade",
  risk_controls_warning_new_trade: "Risk controls warning",
  buy_order_handoff_progress_generated: "Buy handoff progress generated",
  broker_fill_capture_agent_spec_generated: "Buy fill capture spec generated",
  broker_fill_capture_agent_spec_copied: "Buy fill capture spec copied",
  ture_fill_autofill_contract_generated: "Ture fill autofill contract generated",
  ture_fill_autofill_contract_copied: "Ture fill autofill contract copied",
  agent_dry_run_completed: "Pre-agent dry run completed",
  handoff_integrity_checked: "Handoff integrity checked",
  handoff_integrity_failed: "Handoff integrity failed",
  agent_prepared_order_form_checked: "Agent prepared order form",
  broker_buy_form_prepared_checked: "Broker buy form prepared",
  broker_order_preview_captured: "Broker preview captured",
  broker_manual_confirmation_checked: "Manual Avanza confirmation checked",
  broker_plan_match_checked: "Broker order matched Trade plan",
  fill_capture_review_generated: "Fill capture review generated",
  ture_agent_completion_policy_generated: "Ture completion policy generated",
  trade_planning_snapshot_captured: "Trade planning snapshot captured",
  broker_fill_entered: "Broker fill entered",
  live_day_trade_created_after_broker_confirmation: "Live Day Trade created",
  sell_execution_payload_generated: "Sell payload generated",
  sell_execution_payload_copied: "Sell payload copied",
  sell_agent_handoff_command_generated: "Sell agent command generated",
  sell_agent_handoff_command_copied: "Sell agent command copied",
  sell_hard_stop_contract_evaluated: "Sell hard stops evaluated",
  sell_form_mapping_preview_generated: "Sell form mapping generated",
  sell_form_mapping_preview_copied: "Sell form mapping copied",
  avanza_sell_field_verification_generated: "Avanza sell field verification generated",
  avanza_sell_field_verification_copied: "Avanza sell field verification copied",
  broker_exit_capture_agent_spec_generated: "Sell exit capture spec generated",
  broker_exit_capture_agent_spec_copied: "Sell exit capture spec copied",
  ture_exit_autofill_contract_generated: "Ture exit autofill contract generated",
  ture_exit_autofill_contract_copied: "Ture exit autofill contract copied",
  broker_sell_manual_confirmation_checked: "Manual Avanza sell confirmation checked",
  broker_sell_plan_match_checked: "Broker sell order matched Trade position",
  exit_capture_review_generated: "Exit capture review generated",
  ture_exit_completion_policy_generated: "Ture exit completion policy generated",
  broker_exit_fill_captured: "Broker exit fill captured",
  live_day_trade_closed_after_broker_exit_confirmation: "Trade closed after broker exit confirmation",
  trade_closed: "Trade closed",
};

const eventDescriptions: Record<ExecutionTimelineEventType, string> = {
  add_trade_validation: "ADD TRADE validation completed.",
  recommendation_validated: "ADD TRADE validation completed.",
  execution_payload_generated: "Prepare-only execution payload was created.",
  execution_payload_copied: "Execution payload was copied locally.",
  execution_payload_ready_for_agent: "Payload was marked ready for future agent handoff.",
  buy_order_ready_for_agent: "Buy order was marked ready for future agent handoff.",
  agent_handoff_blocked_by_readiness: "Buy order handoff was blocked by safety/readiness checks.",
  agent_handoff_command_generated: "Prepare-only buy agent command was generated.",
  agent_handoff_command_copied: "Prepare-only buy agent command JSON was copied.",
  agent_hard_stop_contract_evaluated: "Buy hard stop contract was evaluated.",
  agent_form_mapping_preview_generated: "Simulation-only buy form mapping preview was generated.",
  agent_form_mapping_preview_copied: "Simulation-only buy form mapping JSON was copied.",
  avanza_buy_field_verification_generated:
    "Read-only Avanza buy field verification report was generated.",
  avanza_buy_field_verification_copied:
    "Avanza buy field verification JSON was copied.",
  avanza_verification_notes_applied_to_report:
    "Local manual Avanza verification notes were applied to a read-only field verification report.",
  risk_controls_saved:
    "Local Risk Controls settings were saved in Settings.",
  risk_controls_reset:
    "Local Risk Controls settings were reset to defaults.",
  risk_controls_evaluated_for_new_trade:
    "Risk controls evaluated a new trade candidate.",
  risk_controls_blocked_new_trade:
    "Strict risk controls blocked creating a new Live Day Trade.",
  risk_controls_warning_new_trade:
    "Risk controls surfaced warnings for a new trade candidate.",
  buy_order_handoff_progress_generated: "Buy order handoff progress was evaluated.",
  broker_fill_capture_agent_spec_generated:
    "Post-KÖP broker fill capture spec was generated for Ture recordkeeping.",
  broker_fill_capture_agent_spec_copied:
    "Post-KÖP broker fill capture spec JSON was copied.",
  ture_fill_autofill_contract_generated:
    "Ture-side broker fill autofill contract was generated for recordkeeping review.",
  ture_fill_autofill_contract_copied:
    "Ture-side broker fill autofill contract JSON was copied.",
  agent_dry_run_completed: "Pre-agent dry run simulation completed.",
  handoff_integrity_checked: "Handoff session integrity check completed.",
  handoff_integrity_failed: "Handoff session integrity check failed.",
  agent_prepared_order_form_checked: "User marked that an agent prepared the order form.",
  broker_buy_form_prepared_checked: "User marked that the broker buy form was prepared before final confirmation.",
  broker_order_preview_captured: "User recorded the broker order preview.",
  broker_manual_confirmation_checked: "User confirmed manual Avanza order confirmation.",
  broker_plan_match_checked: "User confirmed broker order matched the Trade plan.",
  fill_capture_review_generated:
    "Broker fill capture review was generated from the current Ture fields.",
  ture_agent_completion_policy_generated:
    "Read-only Ture-side completion policy was generated from the fill capture review.",
  trade_planning_snapshot_captured:
    "Creation-time planning, sizing, risk, market, and preflight state was saved to execution metadata.",
  broker_fill_entered: "Actual broker fill details were entered.",
  live_day_trade_created_after_broker_confirmation: "Trade tracking position was created.",
  sell_execution_payload_generated: "Prepare-only sell execution payload was created.",
  sell_execution_payload_copied: "Sell execution payload was copied locally.",
  sell_agent_handoff_command_generated: "Prepare-only sell agent command was generated.",
  sell_agent_handoff_command_copied: "Prepare-only sell agent command JSON was copied.",
  sell_hard_stop_contract_evaluated: "Sell hard stop contract was evaluated.",
  sell_form_mapping_preview_generated: "Simulation-only sell form mapping preview was generated.",
  sell_form_mapping_preview_copied: "Simulation-only sell form mapping JSON was copied.",
  avanza_sell_field_verification_generated:
    "Read-only Avanza sell field verification report was generated.",
  avanza_sell_field_verification_copied:
    "Avanza sell field verification JSON was copied.",
  broker_exit_capture_agent_spec_generated:
    "Post-SÄLJ broker exit capture spec was generated for Ture recordkeeping.",
  broker_exit_capture_agent_spec_copied:
    "Post-SÄLJ broker exit capture spec JSON was copied.",
  ture_exit_autofill_contract_generated:
    "Ture-side broker exit autofill contract was generated for recordkeeping review.",
  ture_exit_autofill_contract_copied:
    "Ture-side broker exit autofill contract JSON was copied.",
  broker_sell_manual_confirmation_checked: "User confirmed manual Avanza SÄLJ confirmation.",
  broker_sell_plan_match_checked: "User confirmed broker sell order matched the Trade position.",
  exit_capture_review_generated:
    "Broker exit capture review was generated from the current Ture fields.",
  ture_exit_completion_policy_generated:
    "Read-only Ture-side exit completion policy was generated from the exit capture review.",
  broker_exit_fill_captured: "Actual broker exit fill details were entered.",
  live_day_trade_closed_after_broker_exit_confirmation:
    "Live Day Trade was closed after broker exit confirmation.",
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
      window.localStorage.getItem(TRADE_MANAGEMENT_EVENTS_STORAGE_KEY) ?? "[]",
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
  const sellHandoffSessionId =
    metadata?.broker_exit_confirmation?.sell_handoff_session_id ?? null;
  const payloadId = metadata?.execution_payload_id;
  const payloadFingerprint = metadata?.execution_payload_fingerprint;
  const sellPayloadId = metadata?.broker_exit_confirmation?.sell_payload_id ?? null;
  const sellPayloadFingerprint =
    metadata?.broker_exit_confirmation?.sell_payload_fingerprint ?? null;
  const ticker = input.ticker;

  return (
    (handoffSessionId && raw.handoff_session_id === handoffSessionId) ||
    (sellHandoffSessionId && raw.handoff_session_id === sellHandoffSessionId) ||
    (payloadId && raw.payload_id === payloadId) ||
    (sellPayloadId && raw.payload_id === sellPayloadId) ||
    (payloadFingerprint && raw.payload_fingerprint === payloadFingerprint) ||
    (sellPayloadFingerprint &&
      (raw.payload_fingerprint === sellPayloadFingerprint ||
        raw.sell_payload_fingerprint === sellPayloadFingerprint)) ||
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
    raw.type === "agent_hard_stop_contract_evaluated" ||
    raw.type === "sell_hard_stop_contract_evaluated" ||
    raw.type === "agent_form_mapping_preview_generated" ||
    raw.type === "sell_form_mapping_preview_generated" ||
    raw.type === "avanza_buy_field_verification_generated" ||
    raw.type === "avanza_verification_notes_applied_to_report" ||
    raw.type === "risk_controls_evaluated_for_new_trade" ||
    raw.type === "risk_controls_blocked_new_trade" ||
    raw.type === "risk_controls_warning_new_trade" ||
    raw.type === "avanza_sell_field_verification_generated" ||
    raw.type === "agent_handoff_command_generated" ||
    raw.type === "sell_agent_handoff_command_generated" ||
    raw.type === "buy_order_handoff_progress_generated"
  ) {
    const status = stringValue(raw.overall_status) ?? stringValue(raw.status);

    if (status === "blocked") {
      return "warning";
    }

    if (status === "warning") {
      return "warning";
    }

    return status === "ready" || status === "passed" ? "completed" : "info";
  }

  if (raw.type === "agent_handoff_blocked_by_readiness") {
    return "warning";
  }

  if (
    raw.type === "fill_capture_review_generated" ||
    raw.type === "exit_capture_review_generated"
  ) {
    const status = stringValue(raw.status);

    return status === "ready" ? "completed" : "warning";
  }

  if (
    raw.type === "ture_agent_completion_policy_generated" ||
    raw.type === "ture_exit_completion_policy_generated"
  ) {
    const decision = stringValue(raw.decision);

    return decision === "allowed_future_agent_completion"
      ? "completed"
      : "warning";
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
