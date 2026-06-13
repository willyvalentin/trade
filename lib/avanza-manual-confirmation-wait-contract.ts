import type { AvanzaReviewClickResult } from "./avanza-review-click-contract";

export const AVANZA_MANUAL_CONFIRMATION_WAIT_CONTRACT_VERSION =
  "avanza_manual_confirmation_wait_v1" as const;

export const DEFAULT_AVANZA_MANUAL_CONFIRMATION_WAIT_TIMEOUT_MS = 300_000;

export type AvanzaManualConfirmationWaitStatus =
  | "unavailable"
  | "confirmation_not_ready"
  | "waiting_for_manual_confirmation"
  | "user_cancelled"
  | "user_confirmed_unverified"
  | "timed_out"
  | "blocked"
  | "failed";

export type AvanzaManualConfirmationWaitRiskFlag =
  | "confirmation_not_ready"
  | "final_confirm_visible_read_only"
  | "final_confirm_clicked_by_agent_or_attempted"
  | "keyboard_submit_detected"
  | "broker_result_detected_unexpectedly"
  | "trade_mutation_detected_unexpectedly"
  | "account_data_detected"
  | "balance_data_detected"
  | "holdings_data_detected"
  | "sensitive_data_detected"
  | "timeout_elapsed"
  | "user_cancelled"
  | "user_confirmed_unverified";

export type AvanzaManualConfirmationWaitInteractionSignals = {
  finalConfirmClickedByAgentOrAttempted?: boolean;
  keyboardSubmitDetected?: boolean;
};

export type AvanzaManualConfirmationWaitUnexpectedSignals = {
  brokerResultDetected?: boolean;
  tradeMutationDetected?: boolean;
};

export type AvanzaManualConfirmationWaitSensitiveSignals = {
  accountDataDetected?: boolean;
  balanceDataDetected?: boolean;
  holdingsDataDetected?: boolean;
  sensitiveDataDetected?: boolean;
};

export type AvanzaManualConfirmationWaitObservation = {
  modalStillVisible?: boolean;
  finalConfirmVisible?: boolean;
  cancelButtonVisible?: boolean;
  userCancelled?: boolean;
  userConfirmed?: boolean;
  timedOut?: boolean;
  elapsedMs?: number;
  interactionSignals?: AvanzaManualConfirmationWaitInteractionSignals;
  unexpectedSignals?: AvanzaManualConfirmationWaitUnexpectedSignals;
  sensitiveSignals?: AvanzaManualConfirmationWaitSensitiveSignals;
  metadata?: Record<string, unknown>;
};

export type AvanzaManualConfirmationWaitInput = {
  reviewClickResult: AvanzaReviewClickResult;
  observation?: AvanzaManualConfirmationWaitObservation;
  timeoutMs?: number;
  metadata?: Record<string, unknown>;
};

export type AvanzaManualConfirmationWaitResult = {
  ok: boolean;
  status: AvanzaManualConfirmationWaitStatus;
  checkedAt: string;
  reviewClickStatus: AvanzaReviewClickResult["status"];
  waitingForManualConfirmation: boolean;
  observation?: AvanzaManualConfirmationWaitObservation;
  riskFlags: AvanzaManualConfirmationWaitRiskFlag[];
  blockers: string[];
  warnings: string[];
  errors: string[];
  labels: string[];
  metadata?: Record<string, unknown>;
};

export type CreateAvanzaManualConfirmationWaitResultInput = {
  status: AvanzaManualConfirmationWaitStatus;
  reviewClickResult: AvanzaReviewClickResult;
  observation?: AvanzaManualConfirmationWaitObservation;
  riskFlags?: AvanzaManualConfirmationWaitRiskFlag[];
  blockers?: string[];
  warnings?: string[];
  errors?: string[];
  labels?: string[];
  checkedAt?: string;
  metadata?: Record<string, unknown>;
};

export type EvaluateAvanzaManualConfirmationWaitOptions = {
  timeoutMs?: number;
  allowUserConfirmedUnverified?: boolean;
  blockOnFinalConfirmVisible?: boolean;
  blockOnUnexpectedBrokerResult?: boolean;
  blockOnTradeMutation?: boolean;
  checkedAt?: string;
  metadata?: Record<string, unknown>;
};

const MANUAL_CONFIRMATION_WAIT_SAFETY_LABELS = [
  "Manual confirmation wait only",
  "Human final action required",
  "No Bekräfta by agent",
  "No broker result",
  "No trade mutation",
  "Separate confirmation capture required",
] as const;

function uniqueStrings(values: readonly string[]) {
  return [...new Set(values.filter((value) => value.trim().length > 0))];
}

function uniqueRiskFlags(
  values: readonly AvanzaManualConfirmationWaitRiskFlag[],
) {
  return [...new Set(values)];
}

function normalizeTimeoutMs(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : DEFAULT_AVANZA_MANUAL_CONFIRMATION_WAIT_TIMEOUT_MS;
}

function createStatusLabels(status: AvanzaManualConfirmationWaitStatus) {
  const labels: Record<AvanzaManualConfirmationWaitStatus, string[]> = {
    unavailable: ["Manual confirmation wait unavailable"],
    confirmation_not_ready: ["Confirmation not ready"],
    waiting_for_manual_confirmation: ["Waiting for manual confirmation"],
    user_cancelled: ["User cancelled manually"],
    user_confirmed_unverified: ["User confirmed unverified"],
    timed_out: ["Manual confirmation wait timed out"],
    blocked: ["Manual confirmation wait blocked"],
    failed: ["Manual confirmation wait failed"],
  };

  return labels[status];
}

function normalizeObservation(
  observation: AvanzaManualConfirmationWaitObservation,
): AvanzaManualConfirmationWaitObservation {
  return {
    modalStillVisible: observation.modalStillVisible === true,
    finalConfirmVisible: observation.finalConfirmVisible === true,
    cancelButtonVisible: observation.cancelButtonVisible === true,
    userCancelled: observation.userCancelled === true,
    userConfirmed: observation.userConfirmed === true,
    timedOut: observation.timedOut === true,
    elapsedMs:
      typeof observation.elapsedMs === "number" &&
      Number.isFinite(observation.elapsedMs)
        ? observation.elapsedMs
        : undefined,
    interactionSignals: observation.interactionSignals
      ? {
          finalConfirmClickedByAgentOrAttempted:
            observation.interactionSignals
              .finalConfirmClickedByAgentOrAttempted === true,
          keyboardSubmitDetected:
            observation.interactionSignals.keyboardSubmitDetected === true,
        }
      : undefined,
    unexpectedSignals: observation.unexpectedSignals
      ? {
          brokerResultDetected:
            observation.unexpectedSignals.brokerResultDetected === true,
          tradeMutationDetected:
            observation.unexpectedSignals.tradeMutationDetected === true,
        }
      : undefined,
    sensitiveSignals: observation.sensitiveSignals
      ? {
          accountDataDetected:
            observation.sensitiveSignals.accountDataDetected === true,
          balanceDataDetected:
            observation.sensitiveSignals.balanceDataDetected === true,
          holdingsDataDetected:
            observation.sensitiveSignals.holdingsDataDetected === true,
          sensitiveDataDetected:
            observation.sensitiveSignals.sensitiveDataDetected === true,
        }
      : undefined,
    metadata:
      typeof observation.metadata === "object" && observation.metadata !== null
        ? { ...observation.metadata }
        : undefined,
  };
}

export function createAvanzaManualConfirmationWaitResult(
  input: CreateAvanzaManualConfirmationWaitResultInput,
): AvanzaManualConfirmationWaitResult {
  const metadata = {
    ...(input.metadata ?? {}),
    contractVersion: AVANZA_MANUAL_CONFIRMATION_WAIT_CONTRACT_VERSION,
    manualConfirmationWaitOnly: true,
    noFinalConfirmClick: true,
    noKeyboardSubmit: true,
    noBrokerResult: true,
    noSupabaseWrite: true,
    noTradeMutation: true,
    separateConfirmationCaptureRequired: true,
  };
  const labels = uniqueStrings([
    ...MANUAL_CONFIRMATION_WAIT_SAFETY_LABELS,
    ...createStatusLabels(input.status),
    ...(input.labels ?? []),
  ]);
  const waitingForManualConfirmation =
    input.status === "waiting_for_manual_confirmation";

  return {
    ok: input.status === "waiting_for_manual_confirmation",
    status: input.status,
    checkedAt: input.checkedAt ?? new Date().toISOString(),
    reviewClickStatus: input.reviewClickResult.status,
    waitingForManualConfirmation,
    observation: input.observation
      ? normalizeObservation(input.observation)
      : undefined,
    riskFlags: uniqueRiskFlags(input.riskFlags ?? []),
    blockers: uniqueStrings(input.blockers ?? []),
    warnings: uniqueStrings(input.warnings ?? []),
    errors: uniqueStrings(input.errors ?? []),
    labels,
    metadata,
  };
}

export function evaluateAvanzaManualConfirmationWait(
  input: AvanzaManualConfirmationWaitInput,
  options: EvaluateAvanzaManualConfirmationWaitOptions = {},
) {
  const timeoutMs = normalizeTimeoutMs(options.timeoutMs ?? input.timeoutMs);
  const checkedAt = options.checkedAt;
  const metadata = {
    ...(options.metadata ?? {}),
    ...(input.metadata ?? {}),
    timeoutMs,
  };

  if (
    input.reviewClickResult.status !== "confirmation_ready" ||
    input.reviewClickResult.ok !== true ||
    input.reviewClickResult.metadata?.waitingForManualConfirmation !== true
  ) {
    const blocker =
      "Review-click confirmation_ready result is required before manual confirmation wait.";

    return createAvanzaManualConfirmationWaitResult({
      status: "confirmation_not_ready",
      checkedAt,
      reviewClickResult: input.reviewClickResult,
      riskFlags: ["confirmation_not_ready"],
      blockers: [blocker],
      errors: [blocker],
      metadata,
    });
  }

  if (!input.observation) {
    return createAvanzaManualConfirmationWaitResult({
      status: "waiting_for_manual_confirmation",
      checkedAt,
      reviewClickResult: input.reviewClickResult,
      warnings: [
        "Waiting for human action. No broker result is captured in this phase.",
      ],
      metadata,
    });
  }

  const observation = normalizeObservation(input.observation);
  const riskFlags: AvanzaManualConfirmationWaitRiskFlag[] = [];
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (observation.finalConfirmVisible) {
    riskFlags.push("final_confirm_visible_read_only");

    if (options.blockOnFinalConfirmVisible === true) {
      blockers.push(
        "Final-confirm control is visible and blocked by strict policy.",
      );
    } else {
      warnings.push(
        "Final-confirm control is visible as read-only evidence only.",
      );
    }
  }

  if (
    observation.interactionSignals?.finalConfirmClickedByAgentOrAttempted ===
    true
  ) {
    riskFlags.push("final_confirm_clicked_by_agent_or_attempted");
    blockers.push(
      "Agent attempted final confirmation during manual confirmation wait.",
    );
  }

  if (observation.interactionSignals?.keyboardSubmitDetected === true) {
    riskFlags.push("keyboard_submit_detected");
    blockers.push(
      "Keyboard submit was detected during manual confirmation wait.",
    );
  }

  if (
    observation.unexpectedSignals?.brokerResultDetected === true &&
    (options.blockOnUnexpectedBrokerResult ?? true)
  ) {
    riskFlags.push("broker_result_detected_unexpectedly");
    blockers.push(
      "Broker result was detected unexpectedly during manual confirmation wait.",
    );
  }

  if (
    observation.unexpectedSignals?.tradeMutationDetected === true &&
    (options.blockOnTradeMutation ?? true)
  ) {
    riskFlags.push("trade_mutation_detected_unexpectedly");
    blockers.push(
      "Trade mutation was detected unexpectedly during manual confirmation wait.",
    );
  }

  if (observation.sensitiveSignals?.accountDataDetected) {
    riskFlags.push("account_data_detected");
    blockers.push("Account data detected during manual confirmation wait.");
  }

  if (observation.sensitiveSignals?.balanceDataDetected) {
    riskFlags.push("balance_data_detected");
    blockers.push("Balance data detected during manual confirmation wait.");
  }

  if (observation.sensitiveSignals?.holdingsDataDetected) {
    riskFlags.push("holdings_data_detected");
    blockers.push("Holdings data detected during manual confirmation wait.");
  }

  if (observation.sensitiveSignals?.sensitiveDataDetected) {
    riskFlags.push("sensitive_data_detected");
    blockers.push("Sensitive data detected during manual confirmation wait.");
  }

  if (blockers.length > 0) {
    return createAvanzaManualConfirmationWaitResult({
      status: "blocked",
      checkedAt,
      reviewClickResult: input.reviewClickResult,
      observation,
      riskFlags,
      blockers,
      errors: blockers,
      warnings,
      metadata,
    });
  }

  if (observation.userCancelled) {
    return createAvanzaManualConfirmationWaitResult({
      status: "user_cancelled",
      checkedAt,
      reviewClickResult: input.reviewClickResult,
      observation,
      riskFlags: [...riskFlags, "user_cancelled"],
      warnings: [...warnings, "User cancelled manually. No trade mutation occurred."],
      metadata,
    });
  }

  if (
    observation.timedOut ||
    (typeof observation.elapsedMs === "number" && observation.elapsedMs > timeoutMs)
  ) {
    return createAvanzaManualConfirmationWaitResult({
      status: "timed_out",
      checkedAt,
      reviewClickResult: input.reviewClickResult,
      observation,
      riskFlags: [...riskFlags, "timeout_elapsed"],
      warnings: [
        ...warnings,
        "Manual confirmation wait timed out. No trade mutation occurred.",
      ],
      metadata,
    });
  }

  if (observation.userConfirmed) {
    if (options.allowUserConfirmedUnverified === false) {
      const blocker =
        "User-confirmed-unverified state is blocked by policy until capture phase exists.";

      return createAvanzaManualConfirmationWaitResult({
        status: "blocked",
        checkedAt,
        reviewClickResult: input.reviewClickResult,
        observation,
        riskFlags: [...riskFlags, "user_confirmed_unverified"],
        blockers: [blocker],
        errors: [blocker],
        warnings,
        metadata,
      });
    }

    return createAvanzaManualConfirmationWaitResult({
      status: "user_confirmed_unverified",
      checkedAt,
      reviewClickResult: input.reviewClickResult,
      observation,
      riskFlags: [...riskFlags, "user_confirmed_unverified"],
      warnings: [
        ...warnings,
        "User appears to have confirmed, but broker result is not captured. Separate confirmation capture is required.",
      ],
      metadata,
    });
  }

  return createAvanzaManualConfirmationWaitResult({
    status: "waiting_for_manual_confirmation",
    checkedAt,
    reviewClickResult: input.reviewClickResult,
    observation,
    riskFlags,
    warnings: [
      ...warnings,
      "Waiting for human action. No broker result is captured in this phase.",
    ],
    metadata,
  });
}

export function summarizeAvanzaManualConfirmationWaitResult(
  result: AvanzaManualConfirmationWaitResult,
) {
  const suffix =
    "No Bekräfta was clicked by the agent. No broker result or trade mutation occurred.";

  switch (result.status) {
    case "waiting_for_manual_confirmation":
      return `Waiting for manual confirmation. ${suffix}`;
    case "user_cancelled":
      return `User cancelled manually. ${suffix}`;
    case "user_confirmed_unverified":
      return `User appears to have confirmed, but broker result is not captured. Separate confirmation capture is required. ${suffix}`;
    case "timed_out":
      return `Manual confirmation wait timed out. ${suffix}`;
    case "confirmation_not_ready":
      return `Confirmation is not ready for manual wait. ${suffix}`;
    case "blocked":
      return `Blocked: ${result.blockers[0] ?? result.errors[0] ?? "manual confirmation wait cannot proceed safely"}. ${suffix}`;
    case "failed":
      return `Manual confirmation wait failed. ${suffix}`;
    case "unavailable":
    default:
      return `Manual confirmation wait unavailable. ${suffix}`;
  }
}

export function getAvanzaManualConfirmationWaitSafetyLabels(
  result: AvanzaManualConfirmationWaitResult,
) {
  return uniqueStrings([...MANUAL_CONFIRMATION_WAIT_SAFETY_LABELS, ...result.labels]);
}

export function isAvanzaWaitingForManualConfirmation(
  result: AvanzaManualConfirmationWaitResult,
) {
  return result.ok && result.status === "waiting_for_manual_confirmation";
}

export function isAvanzaUserConfirmedUnverified(
  result: AvanzaManualConfirmationWaitResult,
) {
  return result.status === "user_confirmed_unverified";
}
