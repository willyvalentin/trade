import type { ExecutionCandidatePickerResult } from "@/lib/execution-candidate-picker";
import {
  getExecutionAuthorityForMode,
  validateExecutionIntent,
  type ExecutionAction,
  type ExecutionAuthority,
  type ExecutionIntent,
  type ExecutionMode,
  type ExecutionTriggerType,
} from "@/lib/execution";

export type AvanzaExecutionHandoffVersion = "avanza_execution_handoff_v2";

export type AvanzaExecutionHandoffStatus =
  | "ready"
  | "blocked"
  | "invalid_intent";

export type ExecutionSafetyCheckStatus = "passed" | "warning" | "failed";

export type ExecutionSafetyCheck = {
  id:
    | "ticker_exists"
    | "quantity_positive"
    | "action_supported"
    | "broker_is_avanza"
    | "authority_exists"
    | "mode_authority_aligned";
  status: ExecutionSafetyCheckStatus;
  message: string;
};

export type AvanzaExecutionHandoff = {
  version: AvanzaExecutionHandoffVersion;
  createdAt: string;
  broker: "avanza";
  status: AvanzaExecutionHandoffStatus;
  mode: ExecutionMode | null;
  action: ExecutionAction | null;
  triggerType: ExecutionTriggerType | null;
  intent: Partial<ExecutionIntent> | null;
  authority: ExecutionAuthority | null;
  safetyChecks: ExecutionSafetyCheck[];
  canPrepareOrder: boolean;
  canSubmitFinalOrder: boolean;
  blockedReason?: string;
};

export type BuildAvanzaExecutionHandoffOptions = {
  createdAt?: string | null;
  safetyChecks?: ExecutionSafetyCheck[];
};

function positiveNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : null;
}

function supportedAction(value: unknown): value is ExecutionAction {
  return value === "buy" || value === "sell";
}

function normalizeCreatedAt(value: string | null | undefined) {
  return typeof value === "string" &&
    value.trim() &&
    Number.isFinite(Date.parse(value))
    ? value.trim()
    : null;
}

function safetyCheck(
  id: ExecutionSafetyCheck["id"],
  status: ExecutionSafetyCheckStatus,
  message: string,
): ExecutionSafetyCheck {
  return { id, status, message };
}

export function buildDefaultExecutionSafetyChecks(
  intent: Partial<ExecutionIntent> | null | undefined,
): ExecutionSafetyCheck[] {
  const ticker = intent?.trading_package?.ticker;
  const quantity = positiveNumber(intent?.trading_package?.quantity);
  const authority = intent?.authority ?? null;
  const expectedAuthority = intent?.mode
    ? getExecutionAuthorityForMode(intent.mode)
    : null;
  const modeAuthorityAligned =
    Boolean(intent?.mode && authority) &&
    authority?.mode === intent?.mode &&
    authority?.can_submit_broker_order ===
      expectedAuthority?.can_submit_broker_order &&
    authority?.allowFinalSubmit === expectedAuthority?.allowFinalSubmit &&
    authority?.requires_human_final_confirmation ===
      expectedAuthority?.requires_human_final_confirmation;

  return [
    safetyCheck(
      "ticker_exists",
      typeof ticker === "string" && ticker.trim() ? "passed" : "failed",
      typeof ticker === "string" && ticker.trim()
        ? "Ticker is present."
        : "Ticker is missing.",
    ),
    safetyCheck(
      "quantity_positive",
      quantity !== null ? "passed" : "failed",
      quantity !== null
        ? "Quantity is positive."
        : "Quantity is missing or not positive.",
    ),
    safetyCheck(
      "action_supported",
      supportedAction(intent?.action) ? "passed" : "failed",
      supportedAction(intent?.action)
        ? "Execution action is supported."
        : "Execution action must be buy or sell.",
    ),
    safetyCheck(
      "broker_is_avanza",
      intent?.broker_hint === "AVANZA" ? "passed" : "failed",
      intent?.broker_hint === "AVANZA"
        ? "Broker is Avanza."
        : "Broker must be Avanza.",
    ),
    safetyCheck(
      "authority_exists",
      authority ? "passed" : "failed",
      authority ? "Execution authority is present." : "Execution authority is missing.",
    ),
    safetyCheck(
      "mode_authority_aligned",
      modeAuthorityAligned ? "passed" : "failed",
      modeAuthorityAligned
        ? "Execution mode and authority are aligned."
        : "Execution mode and authority are not aligned.",
    ),
  ];
}

export function hasFailedExecutionSafetyChecks(
  checks: readonly ExecutionSafetyCheck[],
) {
  return checks.some((check) => check.status === "failed");
}

function failedSafetyCheckReason(checks: readonly ExecutionSafetyCheck[]) {
  return checks
    .filter((check) => check.status === "failed")
    .map((check) => check.message)
    .join(" ");
}

export function buildAvanzaExecutionHandoff(
  intent: Partial<ExecutionIntent> | null | undefined,
  options: BuildAvanzaExecutionHandoffOptions = {},
): AvanzaExecutionHandoff {
  const validation = validateExecutionIntent(intent);
  const createdAt = normalizeCreatedAt(options.createdAt);
  const safetyChecks = [
    ...buildDefaultExecutionSafetyChecks(intent),
    ...(options.safetyChecks ?? []),
  ];
  const safetyChecksFailed = hasFailedExecutionSafetyChecks(safetyChecks);
  const status: AvanzaExecutionHandoffStatus = !createdAt
    ? "blocked"
    : !validation.valid
    ? "invalid_intent"
    : safetyChecksFailed
      ? "blocked"
      : "ready";
  const blockedReason =
    !createdAt
      ? "Execution runtime identity context is required."
      : status === "invalid_intent"
      ? validation.errors.join(" ")
      : status === "blocked"
        ? failedSafetyCheckReason(safetyChecks)
        : undefined;

  return {
    version: "avanza_execution_handoff_v2",
    createdAt: createdAt ?? "",
    broker: "avanza",
    status,
    mode: intent?.mode ?? null,
    action: supportedAction(intent?.action) ? intent.action : null,
    triggerType: intent?.trigger_type ?? null,
    intent: intent ?? null,
    authority: intent?.authority ?? null,
    safetyChecks,
    canPrepareOrder: status === "ready",
    canSubmitFinalOrder:
      status === "ready" && intent?.authority?.allowFinalSubmit === true,
    ...(blockedReason ? { blockedReason } : {}),
  };
}

export function buildAvanzaExecutionHandoffFromPickerResult(
  result: ExecutionCandidatePickerResult,
  options: BuildAvanzaExecutionHandoffOptions = {},
): AvanzaExecutionHandoff | null {
  return result.selectedIntent
    ? buildAvanzaExecutionHandoff(result.selectedIntent, options)
    : null;
}
