import type { BrokerExecutionMetadata } from "@/lib/broker-execution-metadata";
import type { ExecutionTimelineEvent } from "@/lib/execution-timeline";

export type HandoffReplayStepStatus =
  | "completed"
  | "warning"
  | "failed"
  | "missing"
  | "info";

export type HandoffReplayStep = {
  id: string;
  label: string;
  status: HandoffReplayStepStatus;
  timestamp?: string;
  summary: string;
  detail?: string;
};

export type HandoffReplayResult = {
  handoff_session_id?: string;
  overall_status: "complete" | "partial" | "failed" | "unknown";
  summary: string;
  steps: HandoffReplayStep[];
  missing_steps: string[];
  warning_count: number;
  failed_count: number;
};

export type BuildHandoffSessionReplayInput = {
  executionMetadata?: BrokerExecutionMetadata | null;
  timelineEvents?: ExecutionTimelineEvent[];
  openedAt?: string | null;
  closedAt?: string | null;
};

function firstEvent(
  events: ExecutionTimelineEvent[],
  types: ExecutionTimelineEvent["type"][],
) {
  return events.find((event) => types.includes(event.type)) ?? null;
}

function eventStatus(event: ExecutionTimelineEvent | null): HandoffReplayStepStatus {
  if (!event) {
    return "missing";
  }

  if (event.type === "handoff_integrity_failed") {
    return "failed";
  }

  if (event.type === "agent_dry_run_completed") {
    if (event.metadata?.dry_run_passed === false) {
      return "failed";
    }

    if (event.status === "warning") {
      return "warning";
    }
  }

  if (event.type === "handoff_integrity_checked") {
    if (event.metadata?.status === "failed") {
      return "failed";
    }

    if (event.metadata?.status === "warning") {
      return "warning";
    }
  }

  if (event.status === "warning") {
    return "warning";
  }

  if (event.status === "missing") {
    return "missing";
  }

  if (event.status === "info") {
    return "info";
  }

  return "completed";
}

function replayStep({
  id,
  label,
  event,
  fallbackTimestamp,
  fallbackCompleted,
  fallbackStatus,
  completedSummary,
  missingSummary,
  detail,
}: {
  id: string;
  label: string;
  event?: ExecutionTimelineEvent | null;
  fallbackTimestamp?: string | null;
  fallbackCompleted?: boolean;
  fallbackStatus?: HandoffReplayStepStatus;
  completedSummary: string;
  missingSummary: string;
  detail?: string;
}): HandoffReplayStep {
  if (event) {
    const status = eventStatus(event);

    return {
      id,
      label,
      status,
      timestamp: event.timestamp,
      summary:
        status === "failed"
          ? `${label} failed.`
          : status === "warning"
            ? `${label} completed with warnings.`
            : completedSummary,
      detail: event.description,
    };
  }

  if (fallbackCompleted && fallbackTimestamp) {
    return {
      id,
      label,
      status: fallbackStatus ?? "completed",
      timestamp: fallbackTimestamp,
      summary: completedSummary,
      detail,
    };
  }

  return {
    id,
    label,
    status: fallbackStatus ?? "missing",
    timestamp: fallbackTimestamp ?? undefined,
    summary: missingSummary,
    detail,
  };
}

export function buildHandoffSessionReplay({
  executionMetadata,
  timelineEvents = [],
  openedAt,
  closedAt,
}: BuildHandoffSessionReplayInput): HandoffReplayResult {
  const events = [...timelineEvents].sort(
    (first, second) =>
      new Date(first.timestamp).getTime() - new Date(second.timestamp).getTime(),
  );
  const handoffSessionId =
    executionMetadata?.handoff_session_id ??
    events.find((event) => event.handoff_session_id)?.handoff_session_id ??
    undefined;
  const payloadEvent = firstEvent(events, ["execution_payload_generated"]);
  const readinessEvent = firstEvent(events, ["execution_payload_ready_for_agent"]);
  const dryRunEvent = firstEvent(events, ["agent_dry_run_completed"]);
  const integrityEvent = firstEvent(events, [
    "handoff_integrity_failed",
    "handoff_integrity_checked",
  ]);
  const brokerPreviewEvent = firstEvent(events, ["broker_order_preview_captured"]);
  const manualConfirmationEvent = firstEvent(events, [
    "broker_manual_confirmation_checked",
  ]);
  const planMatchEvent = firstEvent(events, ["broker_plan_match_checked"]);
  const liveTradeEvent = firstEvent(events, [
    "live_day_trade_created_after_broker_confirmation",
  ]);
  const tradeClosedEvent = firstEvent(events, ["trade_closed"]);

  const steps: HandoffReplayStep[] = [
    replayStep({
      id: "payload_generated",
      label: "Payload generated",
      event: payloadEvent,
      fallbackTimestamp: openedAt,
      fallbackCompleted: Boolean(executionMetadata?.execution_payload_id),
      fallbackStatus: executionMetadata?.execution_payload_id ? "info" : undefined,
      completedSummary: "Prepare-only payload exists for the handoff session.",
      missingSummary: "No payload generation record is available.",
    }),
    replayStep({
      id: "agent_readiness",
      label: "Agent readiness evaluated",
      event: readinessEvent,
      fallbackStatus: "missing",
      completedSummary: "Agent readiness was evaluated before handoff.",
      missingSummary: "No readiness handoff event is available.",
    }),
    replayStep({
      id: "agent_dry_run",
      label: "Pre-agent dry run",
      event: dryRunEvent,
      fallbackStatus: "missing",
      completedSummary: "Pre-agent dry run was completed.",
      missingSummary: "No pre-agent dry run event is available.",
    }),
    replayStep({
      id: "handoff_integrity",
      label: "Handoff integrity checked",
      event: integrityEvent,
      fallbackTimestamp: executionMetadata?.handoff_integrity?.checked_at,
      fallbackCompleted: Boolean(executionMetadata?.handoff_integrity),
      fallbackStatus:
        executionMetadata?.handoff_integrity?.status === "failed"
          ? "failed"
          : executionMetadata?.handoff_integrity?.status === "warning"
            ? "warning"
            : "completed",
      completedSummary: "Handoff integrity snapshot is recorded.",
      missingSummary: "No handoff integrity check is available.",
      detail: executionMetadata?.handoff_integrity
        ? `Integrity ${executionMetadata.handoff_integrity.status} ${executionMetadata.handoff_integrity.score}/100.`
        : undefined,
    }),
    replayStep({
      id: "broker_preview",
      label: "Broker preview captured",
      event: brokerPreviewEvent,
      fallbackTimestamp: executionMetadata?.broker_order_preview?.captured_at,
      fallbackCompleted: Boolean(executionMetadata?.broker_order_preview),
      fallbackStatus:
        executionMetadata?.broker_order_preview?.warning_type &&
        executionMetadata.broker_order_preview.warning_type !== "none"
          ? "warning"
          : "completed",
      completedSummary: "Broker preview was manually captured.",
      missingSummary: "No broker preview capture is available.",
    }),
    replayStep({
      id: "manual_confirmation",
      label: "Manual broker confirmation",
      event: manualConfirmationEvent,
      fallbackTimestamp: executionMetadata?.broker_confirmed_at,
      fallbackCompleted: Boolean(executionMetadata?.broker_confirmed_at),
      fallbackStatus: planMatchEvent || executionMetadata?.broker_confirmed_at ? "completed" : "missing",
      completedSummary: planMatchEvent
        ? "Manual Avanza confirmation and plan match were recorded."
        : "Manual broker confirmation was inferred from execution metadata.",
      missingSummary: "Manual confirmation event is not available.",
    }),
    replayStep({
      id: "live_trade_created",
      label: "Live Day Trade created",
      event: liveTradeEvent,
      fallbackTimestamp: openedAt,
      fallbackCompleted: Boolean(openedAt),
      completedSummary: "Live Day Trade tracking position was created.",
      missingSummary: "No Live Day Trade creation timestamp is available.",
    }),
    replayStep({
      id: "trade_closed",
      label: "Trade closed",
      event: tradeClosedEvent,
      fallbackTimestamp: closedAt,
      fallbackCompleted: Boolean(closedAt),
      fallbackStatus: closedAt ? "completed" : "info",
      completedSummary: "Trade was closed in Trade.",
      missingSummary: "Trade is not closed yet.",
    }),
  ];
  const missingSteps = steps
    .filter((step) => step.status === "missing")
    .map((step) => step.id);
  const warningCount = steps.filter((step) => step.status === "warning").length;
  const failedCount = steps.filter((step) => step.status === "failed").length;
  const completedOrInfoCount = steps.filter(
    (step) => step.status === "completed" || step.status === "info",
  ).length;
  const keyMissing = missingSteps.filter((step) => step !== "trade_closed");
  const overallStatus =
    failedCount > 0
      ? "failed"
      : completedOrInfoCount <= 1 && !handoffSessionId
        ? "unknown"
        : keyMissing.length > 0
          ? "partial"
          : "complete";

  return {
    handoff_session_id: handoffSessionId,
    overall_status: overallStatus,
    summary:
      overallStatus === "complete"
        ? "Handoff session replay is complete with no failed steps."
        : overallStatus === "failed"
          ? "Handoff session replay contains a failed dry run or integrity step."
          : overallStatus === "partial"
            ? "Handoff session replay is partial; some local audit events may be missing."
            : "Not enough handoff session data is available to replay this trade.",
    steps,
    missing_steps: missingSteps,
    warning_count: warningCount,
    failed_count: failedCount,
  };
}
