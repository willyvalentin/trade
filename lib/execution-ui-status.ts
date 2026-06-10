import type { AvanzaExecutionHandoff } from "@/lib/avanza-execution-handoff";
import type {
  ExecutionAction,
  ExecutionIntent,
  ExecutionMode,
  ExecutionTriggerType,
} from "@/lib/execution";
import type { ExecutionOrchestratorResult } from "@/lib/execution-orchestrator";
import {
  getExecutionLifecycleDisplayLabel,
  isManualConfirmationState,
  isTerminalExecutionLifecycleState,
  type ExecutionLifecycleSnapshot,
  type ExecutionLifecycleState,
} from "@/lib/execution-state-machine";

export type ExecutionUiSeverity =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger";

export type ExecutionUiBadgeTone =
  | "muted"
  | "info"
  | "success"
  | "warning"
  | "danger";

export type ExecutionUiCtaType =
  | "none"
  | "prepare_avanza_order"
  | "waiting_manual_buy"
  | "waiting_manual_sell"
  | "automatic_ready"
  | "blocked"
  | "review_required";

export type ExecutionUiStatus = {
  visible: boolean;
  severity: ExecutionUiSeverity;
  badgeTone: ExecutionUiBadgeTone;
  label: string;
  title: string;
  description: string;
  ctaType: ExecutionUiCtaType;
  ctaLabel?: string;
  action?: ExecutionAction;
  mode?: ExecutionMode;
  triggerType?: ExecutionTriggerType;
  ticker?: string;
  canPrepareOrder: boolean;
  canSubmitFinalOrder: boolean;
  blockedReason?: string;
};

const hiddenExecutionUiStatus: ExecutionUiStatus = {
  visible: false,
  severity: "neutral",
  badgeTone: "muted",
  label: "NO ACTION",
  title: "No execution action",
  description: "Ture has no execution action ready.",
  ctaType: "none",
  canPrepareOrder: false,
  canSubmitFinalOrder: false,
};

const triggerDisplayLabels: Record<ExecutionTriggerType, string> = {
  exit_stop_loss_reached: "Stop loss reached",
  exit_risk_required: "Risk exit required",
  exit_end_of_day: "End of day exit",
  exit_target_reached: "Target reached",
  manual_exit_requested: "Manual exit requested",
  entry_recommendation_ready: "Entry ready",
  manual_entry_requested: "Manual entry requested",
};

function badgeToneForSeverity(
  severity: ExecutionUiSeverity,
): ExecutionUiBadgeTone {
  return severity === "neutral" ? "muted" : severity;
}

function tickerFromIntent(intent: ExecutionIntent | null | undefined) {
  const ticker = intent?.trading_package.ticker;

  return typeof ticker === "string" && ticker.trim()
    ? ticker.trim().toUpperCase()
    : undefined;
}

function ctaForReadyHandoff(
  intent: ExecutionIntent,
  handoff: AvanzaExecutionHandoff,
): Pick<ExecutionUiStatus, "ctaType" | "ctaLabel"> {
  if (handoff.canSubmitFinalOrder) {
    return {
      ctaType: "automatic_ready",
      ctaLabel: "Automatic execution ready",
    };
  }

  if (intent.mode === "semi_automatic") {
    return {
      ctaType: "prepare_avanza_order",
      ctaLabel: "Prepare in Avanza",
    };
  }

  return {
    ctaType: "prepare_avanza_order",
    ctaLabel: "Prepare in Avanza",
  };
}

function baseStatusForIntent(intent: ExecutionIntent): Pick<
  ExecutionUiStatus,
  "severity" | "label" | "title" | "description"
> {
  if (intent.trigger_type === "exit_stop_loss_reached") {
    return {
      severity: "danger",
      label: "STOP LOSS REACHED",
      title: "Sell action required",
      description:
        "Ture detected that the live position reached stop loss and prepared a sell execution handoff.",
    };
  }

  if (intent.trigger_type === "exit_target_reached") {
    return {
      severity: "success",
      label: "TARGET REACHED",
      title: "Sell action ready",
      description:
        "Ture detected that the live position reached target and prepared a sell execution handoff.",
    };
  }

  if (intent.action === "buy") {
    return {
      severity: "info",
      label: "ENTRY READY",
      title: "Buy action ready",
      description:
        "Ture selected an entry recommendation and prepared a buy execution handoff.",
    };
  }

  return {
    severity: "warning",
    label: getExecutionTriggerDisplayLabel(intent.trigger_type).toUpperCase(),
    title: "Execution action ready",
    description: "Ture selected an execution intent and prepared a handoff.",
  };
}

function blockedStatusForHandoff(
  intent: ExecutionIntent,
  handoff: AvanzaExecutionHandoff,
): ExecutionUiStatus {
  const base = baseStatusForIntent(intent);

  return {
    visible: true,
    severity: handoff.status === "invalid_intent" ? "warning" : "danger",
    badgeTone: handoff.status === "invalid_intent" ? "warning" : "danger",
    label: handoff.status === "invalid_intent" ? "REVIEW REQUIRED" : "BLOCKED",
    title:
      handoff.status === "invalid_intent"
        ? "Execution intent needs review"
        : "Execution handoff blocked",
    description:
      handoff.blockedReason ??
      (handoff.status === "invalid_intent"
        ? "Ture could not validate the selected execution intent."
        : "Ture blocked this execution handoff because a safety check failed."),
    ctaType: handoff.status === "invalid_intent" ? "review_required" : "blocked",
    action: intent.action,
    mode: intent.mode,
    triggerType: intent.trigger_type,
    ticker: tickerFromIntent(intent),
    canPrepareOrder: false,
    canSubmitFinalOrder: false,
    blockedReason: handoff.blockedReason ?? base.description,
  };
}

export function getExecutionTriggerDisplayLabel(
  triggerType: ExecutionTriggerType,
) {
  return triggerDisplayLabels[triggerType];
}

export function buildExecutionUiStatusFromOrchestratorResult(
  result: ExecutionOrchestratorResult,
): ExecutionUiStatus {
  if (result.status === "no_action" || !result.selectedIntent) {
    return hiddenExecutionUiStatus;
  }

  const intent = result.selectedIntent;
  const handoff = result.handoff;

  if (handoff?.status === "blocked" || handoff?.status === "invalid_intent") {
    return blockedStatusForHandoff(intent, handoff);
  }

  const base = baseStatusForIntent(intent);
  const readyCta =
    handoff?.status === "ready"
      ? ctaForReadyHandoff(intent, handoff)
      : {
          ctaType: "none" as const,
          ctaLabel: undefined,
        };

  return {
    visible: true,
    severity: base.severity,
    badgeTone: badgeToneForSeverity(base.severity),
    label: base.label,
    title: base.title,
    description: base.description,
    ctaType: readyCta.ctaType,
    ...(readyCta.ctaLabel ? { ctaLabel: readyCta.ctaLabel } : {}),
    action: intent.action,
    mode: intent.mode,
    triggerType: intent.trigger_type,
    ticker: tickerFromIntent(intent),
    canPrepareOrder: handoff?.canPrepareOrder === true,
    canSubmitFinalOrder: handoff?.canSubmitFinalOrder === true,
  };
}

function lifecycleStatusDetails(
  state: ExecutionLifecycleState,
): Pick<
  ExecutionUiStatus,
  "severity" | "badgeTone" | "label" | "title" | "description" | "ctaType"
> {
  if (state === "idle") {
    return {
      severity: "neutral",
      badgeTone: "muted",
      label: "IDLE",
      title: "Idle",
      description: "No execution lifecycle is active.",
      ctaType: "none",
    };
  }

  if (state === "handoff_created") {
    return {
      severity: "info",
      badgeTone: "info",
      label: "HANDOFF READY",
      title: "Avanza handoff ready",
      description: "The execution handoff has been prepared for Avanza.",
      ctaType: "prepare_avanza_order",
    };
  }

  if (state === "intent_created") {
    return {
      severity: "info",
      badgeTone: "info",
      label: "INTENT CREATED",
      title: "Intent created",
      description: "Ture has created an execution intent.",
      ctaType: "none",
    };
  }

  if (state === "candidate_selected") {
    return {
      severity: "info",
      badgeTone: "info",
      label: "CANDIDATE SELECTED",
      title: "Execution candidate selected",
      description: "Ture selected the next execution candidate.",
      ctaType: "none",
    };
  }

  if (state === "broker_order_preparing") {
    return {
      severity: "info",
      badgeTone: "info",
      label: "PREPARING",
      title: "Preparing Avanza order",
      description: "The execution flow is preparing the Avanza order form.",
      ctaType: "none",
    };
  }

  if (state === "waiting_for_manual_confirmation") {
    return {
      severity: "warning",
      badgeTone: "warning",
      label: "MANUAL CONFIRMATION",
      title: "Waiting for manual confirmation",
      description:
        "The Avanza order requires manual confirmation before final submission.",
      ctaType: "none",
    };
  }

  if (state === "broker_order_submitting") {
    return {
      severity: "info",
      badgeTone: "info",
      label: "SUBMITTING",
      title: "Submitting broker order",
      description: "The automatic execution flow is submitting the broker order.",
      ctaType: "none",
    };
  }

  if (state === "broker_result_captured") {
    return {
      severity: "success",
      badgeTone: "success",
      label: "RESULT CAPTURED",
      title: "Broker result captured",
      description: "Ture captured the broker execution result.",
      ctaType: "none",
    };
  }

  if (state === "completed") {
    return {
      severity: "success",
      badgeTone: "success",
      label: "COMPLETED",
      title: "Execution completed",
      description: "The execution lifecycle has completed.",
      ctaType: "none",
    };
  }

  if (state === "failed") {
    return {
      severity: "danger",
      badgeTone: "danger",
      label: "FAILED",
      title: "Execution failed",
      description: "The execution lifecycle failed and needs review.",
      ctaType: "review_required",
    };
  }

  if (state === "cancelled") {
    return {
      severity: "warning",
      badgeTone: "warning",
      label: "CANCELLED",
      title: "Execution cancelled",
      description: "The execution lifecycle was cancelled.",
      ctaType: "none",
    };
  }

  if (state === "unknown") {
    return {
      severity: "warning",
      badgeTone: "warning",
      label: "UNKNOWN",
      title: "Execution unknown",
      description: "The execution lifecycle state is unknown and needs review.",
      ctaType: "review_required",
    };
  }

  return {
    severity: "info",
    badgeTone: "info",
    label: getExecutionLifecycleDisplayLabel(state).toUpperCase(),
    title: getExecutionLifecycleDisplayLabel(state),
    description: `${getExecutionLifecycleDisplayLabel(state)}.`,
    ctaType: "none",
  };
}

export function buildExecutionUiStatusFromLifecycle(
  snapshot: ExecutionLifecycleSnapshot,
): ExecutionUiStatus {
  const details = lifecycleStatusDetails(snapshot.currentState);
  const visible = snapshot.currentState !== "idle";
  const ctaType =
    isManualConfirmationState(snapshot.currentState) && snapshot.action === "buy"
      ? "waiting_manual_buy"
      : isManualConfirmationState(snapshot.currentState) &&
          snapshot.action === "sell"
        ? "waiting_manual_sell"
        : details.ctaType;

  return {
    visible,
    severity: details.severity,
    badgeTone: details.badgeTone,
    label: details.label,
    title: details.title,
    description: details.description,
    ctaType,
    action: snapshot.action,
    mode: snapshot.mode,
    triggerType: snapshot.triggerType,
    canPrepareOrder: snapshot.currentState === "handoff_created",
    canSubmitFinalOrder: false,
    ...(isTerminalExecutionLifecycleState(snapshot.currentState) &&
    snapshot.currentState !== "completed"
      ? { blockedReason: details.description }
      : {}),
  };
}
