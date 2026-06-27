import type { ExecutionUiBadgeTone, ExecutionUiCtaType, ExecutionUiSeverity, ExecutionUiStatus } from "@/lib/execution-ui-status";
import {
  buildExecutionUiStatusFromLifecycle,
  buildExecutionUiStatusFromOrchestratorResult,
} from "@/lib/execution-ui-status";
import {
  getExecutionLifecycleDisplayLabel,
  isManualConfirmationState,
  isTerminalExecutionLifecycleState,
  type ExecutionLifecycleSnapshot,
} from "@/lib/execution-state-machine";
import type { ExecutionOrchestratorResult } from "@/lib/execution-orchestrator";

export type ExecutionLifecycleUiStateSource =
  | "status"
  | "lifecycle"
  | "orchestrator";

export type ExecutionLifecycleSummaryRow = {
  label: string;
  value: string;
  tone?: ExecutionUiBadgeTone;
};

export type ExecutionLifecycleUiCtaState = {
  type: ExecutionUiCtaType;
  label: string | null;
  enabled: boolean;
  disabledReason: string | null;
};

export type ExecutionLifecycleModalCopy = {
  statusLabel: string;
  statusTitle: string;
  statusDescription: string;
  readinessHint: string;
};

export type ExecutionLifecycleDebugSummary = {
  source: ExecutionLifecycleUiStateSource;
  visible: boolean;
  statusLabel: string;
  lifecycleState: string | null;
  severity: ExecutionUiSeverity;
  ctaType: ExecutionUiCtaType;
  canPrepareOrder: boolean;
  canSubmitFinalOrder: boolean;
  manualConfirmationRequired: boolean;
  terminal: boolean;
};

export type ExecutionLifecycleUiStateInput =
  | {
      source: "status";
      status: ExecutionUiStatus;
      lifecycle?: ExecutionLifecycleSnapshot | null;
    }
  | {
      source: "lifecycle";
      lifecycle: ExecutionLifecycleSnapshot;
    }
  | {
      source: "orchestrator";
      result: ExecutionOrchestratorResult;
    };

export type ExecutionLifecycleUiState = {
  source: ExecutionLifecycleUiStateSource;
  visible: boolean;
  statusSurface: ExecutionUiStatus;
  statusLabel: string;
  lifecycleLabel: string | null;
  lifecycleState: string | null;
  severity: ExecutionUiSeverity;
  badgeTone: ExecutionUiBadgeTone;
  title: string;
  description: string;
  cta: ExecutionLifecycleUiCtaState;
  canPrepareOrder: boolean;
  canSubmitFinalOrder: boolean;
  disabledReason: string | null;
  readinessHint: string;
  manualConfirmationRequired: boolean;
  terminal: boolean;
  summaryRows: ExecutionLifecycleSummaryRow[];
  debugMetadata: ExecutionLifecycleDebugSummary;
};

function labelForCta(type: ExecutionUiCtaType, label: string | undefined) {
  if (label) {
    return label;
  }

  if (type === "none") {
    return null;
  }

  if (type === "waiting_manual_buy") {
    return "Waiting for manual buy confirmation";
  }

  if (type === "waiting_manual_sell") {
    return "Waiting for manual sell confirmation";
  }

  if (type === "review_required") {
    return "Review required";
  }

  if (type === "blocked") {
    return "Blocked";
  }

  if (type === "automatic_ready") {
    return "Automatic execution ready";
  }

  return "Prepare in Avanza";
}

function disabledReasonForStatus(status: ExecutionUiStatus) {
  if (status.blockedReason) {
    return status.blockedReason;
  }

  if (status.ctaType === "none") {
    return "No lifecycle action is available.";
  }

  if (status.ctaType === "prepare_avanza_order" && !status.canPrepareOrder) {
    return "Execution handoff is not ready for preparation.";
  }

  if (status.ctaType === "automatic_ready" && !status.canSubmitFinalOrder) {
    return "Final order submission is not enabled.";
  }

  if (
    status.ctaType === "waiting_manual_buy" ||
    status.ctaType === "waiting_manual_sell"
  ) {
    return "Manual confirmation is required before continuing.";
  }

  if (status.ctaType === "blocked") {
    return "Execution handoff is blocked.";
  }

  if (status.ctaType === "review_required") {
    return "Execution lifecycle needs review.";
  }

  return null;
}

function ctaEnabled(status: ExecutionUiStatus) {
  if (status.ctaType === "prepare_avanza_order") {
    return status.canPrepareOrder;
  }

  if (status.ctaType === "automatic_ready") {
    return status.canSubmitFinalOrder;
  }

  return false;
}

function statusFromInput(input: ExecutionLifecycleUiStateInput) {
  if (input.source === "status") {
    return {
      status: input.status,
      lifecycle: input.lifecycle ?? null,
    };
  }

  if (input.source === "lifecycle") {
    return {
      status: buildExecutionUiStatusFromLifecycle(input.lifecycle),
      lifecycle: input.lifecycle,
    };
  }

  return {
    status: buildExecutionUiStatusFromOrchestratorResult(input.result),
    lifecycle: input.result.lifecycle,
  };
}

function readinessHintFor(
  status: ExecutionUiStatus,
  lifecycle: ExecutionLifecycleSnapshot | null,
) {
  if (!status.visible) {
    return "No execution lifecycle is visible.";
  }

  if (status.blockedReason) {
    return status.blockedReason;
  }

  if (lifecycle && isManualConfirmationState(lifecycle.currentState)) {
    return "Manual confirmation is required before continuing.";
  }

  if (status.canSubmitFinalOrder) {
    return "Final order submission is available.";
  }

  if (status.canPrepareOrder) {
    return "Execution handoff is ready for preparation.";
  }

  return status.description;
}

function summaryRowsFor(
  status: ExecutionUiStatus,
  lifecycle: ExecutionLifecycleSnapshot | null,
): ExecutionLifecycleSummaryRow[] {
  return [
    {
      label: "Status",
      value: status.label,
      tone: status.badgeTone,
    },
    {
      label: "Severity",
      value: status.severity,
      tone: status.badgeTone,
    },
    {
      label: "CTA",
      value: status.ctaLabel ?? status.ctaType,
    },
    {
      label: "Prepare enabled",
      value: status.canPrepareOrder ? "yes" : "no",
    },
    {
      label: "Final submit enabled",
      value: status.canSubmitFinalOrder ? "yes" : "no",
    },
    ...(lifecycle
      ? [
          {
            label: "Lifecycle",
            value: getExecutionLifecycleDisplayLabel(lifecycle.currentState),
            tone: status.badgeTone,
          } satisfies ExecutionLifecycleSummaryRow,
        ]
      : []),
  ];
}

export function getExecutionLifecycleStatusLabel(status: ExecutionUiStatus) {
  return status.label;
}

export function getExecutionLifecycleSeverity(status: ExecutionUiStatus) {
  return status.severity;
}

export function getExecutionLifecycleCtaState(
  status: ExecutionUiStatus,
): ExecutionLifecycleUiCtaState {
  const enabled = ctaEnabled(status);
  const disabledReason = enabled ? null : disabledReasonForStatus(status);

  return {
    type: status.ctaType,
    label: labelForCta(status.ctaType, status.ctaLabel),
    enabled,
    disabledReason,
  };
}

export function buildExecutionLifecycleModalCopy(input: {
  status: ExecutionUiStatus;
  lifecycle?: ExecutionLifecycleSnapshot | null;
}): ExecutionLifecycleModalCopy {
  return {
    statusLabel: input.status.label,
    statusTitle: input.status.title,
    statusDescription: input.status.description,
    readinessHint: readinessHintFor(input.status, input.lifecycle ?? null),
  };
}

function buildExecutionLifecycleStatusSurface(input: {
  status: ExecutionUiStatus;
  cta: ExecutionLifecycleUiCtaState;
  modalCopy: ExecutionLifecycleModalCopy;
  canPrepareOrder: boolean;
  canSubmitFinalOrder: boolean;
}): ExecutionUiStatus {
  return {
    ...input.status,
    label: input.modalCopy.statusLabel,
    severity: input.status.severity,
    badgeTone: input.status.badgeTone,
    title: input.modalCopy.statusTitle,
    description: input.modalCopy.statusDescription,
    ctaType: input.cta.type,
    canPrepareOrder: input.canPrepareOrder,
    canSubmitFinalOrder: input.canSubmitFinalOrder,
    ...(input.cta.label ? { ctaLabel: input.cta.label } : {}),
    ...(input.cta.disabledReason || input.status.blockedReason
      ? {
          blockedReason:
            input.cta.disabledReason ?? input.status.blockedReason,
        }
      : {}),
  };
}

export function buildExecutionLifecycleDebugSummary(
  input: {
    source: ExecutionLifecycleUiStateSource;
    status: ExecutionUiStatus;
    lifecycle?: ExecutionLifecycleSnapshot | null;
  },
): ExecutionLifecycleDebugSummary {
  const lifecycle = input.lifecycle ?? null;

  return {
    source: input.source,
    visible: input.status.visible,
    statusLabel: input.status.label,
    lifecycleState: lifecycle?.currentState ?? null,
    severity: input.status.severity,
    ctaType: input.status.ctaType,
    canPrepareOrder: input.status.canPrepareOrder,
    canSubmitFinalOrder: input.status.canSubmitFinalOrder,
    manualConfirmationRequired: lifecycle
      ? isManualConfirmationState(lifecycle.currentState)
      : input.status.ctaType === "waiting_manual_buy" ||
        input.status.ctaType === "waiting_manual_sell",
    terminal: lifecycle
      ? isTerminalExecutionLifecycleState(lifecycle.currentState)
      : false,
  };
}

export function buildExecutionLifecycleUiState(
  input: ExecutionLifecycleUiStateInput,
): ExecutionLifecycleUiState {
  const { status, lifecycle } = statusFromInput(input);
  const cta = getExecutionLifecycleCtaState(status);
  const modalCopy = buildExecutionLifecycleModalCopy({ status, lifecycle });
  const statusSurface = buildExecutionLifecycleStatusSurface({
    status,
    cta,
    modalCopy,
    canPrepareOrder: status.canPrepareOrder,
    canSubmitFinalOrder: status.canSubmitFinalOrder,
  });
  const debugMetadata = buildExecutionLifecycleDebugSummary({
    source: input.source,
    status,
    lifecycle,
  });

  return {
    source: input.source,
    visible: status.visible,
    statusSurface,
    statusLabel: getExecutionLifecycleStatusLabel(status),
    lifecycleLabel: lifecycle
      ? getExecutionLifecycleDisplayLabel(lifecycle.currentState)
      : null,
    lifecycleState: lifecycle?.currentState ?? null,
    severity: getExecutionLifecycleSeverity(status),
    badgeTone: status.badgeTone,
    title: modalCopy.statusTitle,
    description: modalCopy.statusDescription,
    cta,
    canPrepareOrder: status.canPrepareOrder,
    canSubmitFinalOrder: status.canSubmitFinalOrder,
    disabledReason: cta.disabledReason,
    readinessHint: modalCopy.readinessHint,
    manualConfirmationRequired: debugMetadata.manualConfirmationRequired,
    terminal: debugMetadata.terminal,
    summaryRows: summaryRowsFor(status, lifecycle),
    debugMetadata,
  };
}
