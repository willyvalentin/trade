import type {
  AvanzaLocalDevBridgeActivationChecklist,
} from "./avanza-local-dev-bridge-activation-checklist";
import type {
  AvanzaLocalDevBridgeContract,
  AvanzaLocalDevBridgeRequestKind,
} from "./avanza-local-dev-bridge-contract";

export type AvanzaDisabledLocalDevBridgeRunnerStatus =
  | "disabled"
  | "blocked_missing_bridge_contract"
  | "blocked_missing_activation_checklist"
  | "blocked_checklist_not_approved"
  | "blocked_bridge_gate_locked"
  | "blocked_smoke_invocation_forbidden"
  | "blocked_unsafe_capability"
  | "ready_disabled_report"
  | "forbidden"
  | "unknown";

export type AvanzaDisabledLocalDevBridgeRunnerMode =
  | "disabled"
  | "report_only"
  | "model_only"
  | "invocation_forbidden"
  | "unknown";

export type AvanzaDisabledLocalDevBridgeRunnerStepStatus =
  | "disabled"
  | "blocked"
  | "modeled"
  | "forbidden"
  | "unknown";

export type AvanzaDisabledLocalDevBridgeRunnerStep = {
  stepId: string;
  label: string;
  purpose: string;
  status: AvanzaDisabledLocalDevBridgeRunnerStepStatus;
  wouldCallLater?: string;
  currentlyCalls: false;
  blockedReason?: string;
  forbiddenActions: string[];
};

export type AvanzaDisabledLocalDevBridgeRunnerSafetyFlags = {
  runnerSkeletonOnly: true;
  disabledOnly: true;
  headlessOnly: true;
  visibleInUi: false;
  canOpenLocalDevBridgeGate: false;
  canInvokeSmokeRunnerNow: false;
  canRunTerminalScriptNow: false;
  canUseBrowserAutomationNow: false;
  canStartHandoff: false;
  canPrepareOrderNow: false;
  canRunSmokeTestFromUi: false;
  canCallApiRoute: false;
  canFetch: false;
  canPoll: false;
  canAccessCredentials: false;
  canReadCookies: false;
  canExportSession: false;
  canAutomateBankId: false;
  canSubmitOrder: false;
  canClickFinalBuy: false;
  canClickFinalSell: false;
  canWriteSupabase: false;
  canClaimProductionReady: false;
  userMustConfirm: true;
  finalHumanClickRequired: true;
  controlsEnabled: false;
  gateLocked: true;
};

export type AvanzaDisabledLocalDevBridgeRunnerInput = {
  runnerId?: string;
  bridgeContract?: AvanzaLocalDevBridgeContract;
  activationChecklist?: AvanzaLocalDevBridgeActivationChecklist;
  mode?: AvanzaDisabledLocalDevBridgeRunnerMode;
  explicitRunnerDesignApprovalPresent?: boolean;
  envOptInPresent?: boolean;
  manualTerminalConfirmationPresent?: boolean;
  realRunFlagPresent?: boolean;
  now?: string;
};

export type AvanzaDisabledLocalDevBridgeRunnerReport = {
  runnerId: string;
  createdAt: string;
  status: AvanzaDisabledLocalDevBridgeRunnerStatus;
  label: string;
  reason: string;
  mode: AvanzaDisabledLocalDevBridgeRunnerMode;
  bridgeContractId?: string;
  checklistId?: string;
  requestKind?: AvanzaLocalDevBridgeRequestKind;
  selectedTicker?: string;
  selectedSide?: string;
  selectedQuantity?: number;
  selectedLimitPrice?: number;
  disabledSteps: AvanzaDisabledLocalDevBridgeRunnerStep[];
  wouldRequireBeforeInvocation: string[];
  forbiddenActions: string[];
  warnings: string[];
  blockedReasons: string[];
  safetyFlags: AvanzaDisabledLocalDevBridgeRunnerSafetyFlags;
};

const defaultCreatedAt = "2026-07-07T12:00:00.000Z";

export const avanzaDisabledLocalDevBridgeRunnerSafetyFlags:
  AvanzaDisabledLocalDevBridgeRunnerSafetyFlags = {
    canAccessCredentials: false,
    canAutomateBankId: false,
    canCallApiRoute: false,
    canClaimProductionReady: false,
    canClickFinalBuy: false,
    canClickFinalSell: false,
    canExportSession: false,
    canFetch: false,
    canInvokeSmokeRunnerNow: false,
    canOpenLocalDevBridgeGate: false,
    canPoll: false,
    canPrepareOrderNow: false,
    canReadCookies: false,
    canRunSmokeTestFromUi: false,
    canRunTerminalScriptNow: false,
    canStartHandoff: false,
    canSubmitOrder: false,
    canUseBrowserAutomationNow: false,
    canWriteSupabase: false,
    controlsEnabled: false,
    disabledOnly: true,
    finalHumanClickRequired: true,
    gateLocked: true,
    headlessOnly: true,
    runnerSkeletonOnly: true,
    userMustConfirm: true,
    visibleInUi: false,
  };

const forbiddenActions = [
  "open local-dev bridge gate",
  "invoke smoke runner",
  "run terminal script",
  "start browser automation",
  "call API route",
  "fetch or poll",
  "access credentials",
  "read cookies/session",
  "export session",
  "automate BankID",
  "submit order",
  "click final KOP/SALJ",
  "write Supabase",
] as const;

const wouldRequireBeforeInvocation = [
  "separate future task approval",
  "local-dev bridge gate explicitly opened",
  "env opt-in",
  "manual terminal confirmation",
  "separate real-run flag for real-run design",
  "secure credential provider review",
  "no cookies/session export",
  "BankID manual-only",
  "final KOP/SALJ human-only",
] as const;

function normalizeMode(
  mode: AvanzaDisabledLocalDevBridgeRunnerInput["mode"],
): AvanzaDisabledLocalDevBridgeRunnerMode {
  if (
    mode === "disabled" ||
    mode === "report_only" ||
    mode === "model_only" ||
    mode === "invocation_forbidden" ||
    mode === "unknown"
  ) {
    return mode;
  }

  return "disabled";
}

function statusDetails(status: AvanzaDisabledLocalDevBridgeRunnerStatus) {
  if (status === "ready_disabled_report") {
    return {
      label: "Disabled local-dev bridge runner report ready",
      reason:
        "Bridge contract and checklist can be inspected as model input, but no runtime gate is open.",
    };
  }
  if (status === "blocked_missing_bridge_contract") {
    return {
      label: "Missing bridge contract",
      reason: "A local-dev bridge contract is required before runner report review.",
    };
  }
  if (status === "blocked_missing_activation_checklist") {
    return {
      label: "Missing activation checklist",
      reason: "An activation checklist is required before runner report review.",
    };
  }
  if (status === "blocked_checklist_not_approved") {
    return {
      label: "Checklist not approved for disabled runner design",
      reason:
        "The activation checklist does not approve the disabled runner design phase.",
    };
  }
  if (status === "blocked_bridge_gate_locked") {
    return {
      label: "Bridge gate locked",
      reason: "The local-dev bridge gate remains locked and prevents invocation.",
    };
  }
  if (status === "blocked_smoke_invocation_forbidden") {
    return {
      label: "Smoke invocation forbidden",
      reason: "Smoke runner and terminal script invocation remain forbidden.",
    };
  }
  if (status === "blocked_unsafe_capability") {
    return {
      label: "Unsafe capability blocked",
      reason: "A supplied model exposed a capability that the runner skeleton forbids.",
    };
  }
  if (status === "forbidden") {
    return {
      label: "Runner skeleton forbidden",
      reason: "The requested mode or inputs would imply runtime execution.",
    };
  }
  if (status === "unknown") {
    return {
      label: "Runner skeleton unknown",
      reason: "Unknown input is treated as blocked.",
    };
  }

  return {
    label: "Disabled local-dev bridge runner",
    reason: "Runner skeleton is disabled by default.",
  };
}

function hasUnsafeBridgeContract(contract?: AvanzaLocalDevBridgeContract) {
  const flags = contract?.safetyFlags;

  return Boolean(
    flags &&
      (flags.canOpenLocalDevBridgeGate ||
        flags.canInvokeSmokeRunnerNow ||
        flags.canRunTerminalScriptNow ||
        flags.canUseBrowserAutomationNow ||
        flags.canStartHandoff ||
        flags.canPrepareOrderNow ||
        flags.canRunSmokeTestFromUi ||
        flags.canCallApiRoute ||
        flags.canFetch ||
        flags.canPoll ||
        flags.canAccessCredentials ||
        flags.canReadCookies ||
        flags.canExportSession ||
        flags.canAutomateBankId ||
        flags.canSubmitOrder ||
        flags.canClickFinalBuy ||
        flags.canClickFinalSell ||
        flags.canWriteSupabase ||
        flags.canClaimProductionReady ||
        flags.visibleInUi ||
        flags.controlsEnabled ||
        !flags.gateLocked),
  );
}

function hasUnsafeChecklist(checklist?: AvanzaLocalDevBridgeActivationChecklist) {
  const flags = checklist?.safetyFlags;

  return Boolean(
    flags &&
      (flags.canOpenLocalDevBridgeGate ||
        flags.canInvokeSmokeRunnerNow ||
        flags.canRunTerminalScriptNow ||
        flags.canUseBrowserAutomationNow ||
        flags.canStartHandoff ||
        flags.canPrepareOrderNow ||
        flags.canRunSmokeTestFromUi ||
        flags.canCallApiRoute ||
        flags.canFetch ||
        flags.canPoll ||
        flags.canAccessCredentials ||
        flags.canReadCookies ||
        flags.canExportSession ||
        flags.canAutomateBankId ||
        flags.canSubmitOrder ||
        flags.canClickFinalBuy ||
        flags.canClickFinalSell ||
        flags.canWriteSupabase ||
        flags.canClaimProductionReady ||
        flags.visibleInUi ||
        flags.controlsEnabled ||
        !flags.gateLocked),
  );
}

function step(
  stepId: string,
  label: string,
  purpose: string,
  status: AvanzaDisabledLocalDevBridgeRunnerStepStatus,
  blockedReason?: string,
  wouldCallLater?: string,
): AvanzaDisabledLocalDevBridgeRunnerStep {
  return {
    blockedReason,
    currentlyCalls: false,
    forbiddenActions: [...forbiddenActions],
    label,
    purpose,
    status,
    stepId,
    wouldCallLater,
  };
}

function buildDisabledSteps(
  input: AvanzaDisabledLocalDevBridgeRunnerInput,
  status: AvanzaDisabledLocalDevBridgeRunnerStatus,
) {
  const hasBridgeContract = Boolean(input.bridgeContract);
  const hasChecklist = Boolean(input.activationChecklist);
  const designApproved =
    input.activationChecklist?.status === "approved_for_disabled_runner_design" &&
    input.explicitRunnerDesignApprovalPresent === true;
  const blockedReason =
    status === "ready_disabled_report"
      ? "Runtime remains blocked after report creation."
      : statusDetails(status).reason;

  return [
    step(
      "receive_bridge_contract",
      "Receive bridge contract",
      "Accept the bridge contract only as model input.",
      hasBridgeContract ? "modeled" : "blocked",
      hasBridgeContract ? "Model input only; bridge gate remains locked." : "Bridge contract missing.",
    ),
    step(
      "verify_activation_checklist",
      "Verify activation checklist",
      "Require checklist approval before disabled runner report review.",
      hasChecklist ? (designApproved ? "modeled" : "blocked") : "blocked",
      hasChecklist
        ? "Disabled runner design approval does not open runtime."
        : "Activation checklist missing.",
    ),
    step(
      "verify_terminal_only_path",
      "Verify terminal-only path",
      "Keep any future runner path outside app UI and separately approved.",
      "blocked",
      input.manualTerminalConfirmationPresent === true
        ? "Terminal-only path is modeled, but invocation remains forbidden."
        : "Manual terminal confirmation is missing.",
    ),
    step(
      "verify_env_opt_in",
      "Verify env opt-in",
      "Require explicit local-dev environment opt-in before any later runner design.",
      "blocked",
      input.envOptInPresent === true
        ? "Env opt-in is modeled, but runtime remains locked."
        : "Env opt-in is missing.",
    ),
    step(
      "verify_manual_terminal_confirmation",
      "Verify manual terminal confirmation",
      "Require manual terminal confirmation before any later runner path.",
      "blocked",
      input.manualTerminalConfirmationPresent === true
        ? "Manual terminal confirmation is modeled, but no script can run."
        : "Manual terminal confirmation is missing.",
    ),
    step(
      "verify_real_run_flag_status",
      "Verify real-run flag status",
      "Keep real-run design behind a separate future flag and approval.",
      "blocked",
      input.realRunFlagPresent === true
        ? "Real-run flag is modeled, but real-run remains forbidden."
        : "Separate real-run flag is missing.",
    ),
    step(
      "prepare_smoke_request_candidate",
      "Prepare smoke request candidate",
      "Describe the future candidate shape without invoking it.",
      hasBridgeContract ? "modeled" : "blocked",
      hasBridgeContract ? "Candidate is report-only." : "Bridge contract is required first.",
      "future terminal-only smoke runner after separate approval",
    ),
    step(
      "invoke_login_smoke_runner",
      "Invoke login smoke runner",
      "Would invoke login smoke runner only in a future approved phase.",
      "forbidden",
      "Smoke runner invocation blocked.",
      "future terminal-only login smoke runner",
    ),
    step(
      "invoke_order_smoke_runner",
      "Invoke order smoke runner",
      "Would invoke order smoke runner only in a future approved phase.",
      "forbidden",
      "Smoke runner invocation blocked.",
      "future terminal-only order smoke runner",
    ),
    step(
      "invoke_browser_automation",
      "Invoke browser automation",
      "Would use browser automation only after separate local-dev approval.",
      "forbidden",
      "Browser automation gate locked.",
      "future manually approved local browser runtime",
    ),
    step(
      "capture_result",
      "Capture result",
      "Would capture sanitized result metadata only after a future run exists.",
      "blocked",
      blockedReason,
    ),
    step(
      "reconcile_settlement",
      "Reconcile settlement",
      "Settlement reconciliation remains future-only.",
      "blocked",
      "Settlement reconciliation future only.",
    ),
  ];
}

export function buildAvanzaDisabledLocalDevBridgeRunnerReport(
  input: AvanzaDisabledLocalDevBridgeRunnerInput = {},
): AvanzaDisabledLocalDevBridgeRunnerReport {
  const runnerId = input.runnerId ?? "avanza-disabled-local-dev-bridge-runner";
  const createdAt = input.now ?? defaultCreatedAt;
  const mode = normalizeMode(input.mode);
  const bridgeContract = input.bridgeContract;
  const activationChecklist = input.activationChecklist;
  const warnings = [
    "Disabled bridge runner skeleton is report-only.",
    "Disabled runner design approval is not runtime approval.",
    "Report-only skeleton valid means no invocation has occurred.",
  ];
  const blockedReasons: string[] = [];

  let status: AvanzaDisabledLocalDevBridgeRunnerStatus = "disabled";

  if (!bridgeContract) {
    status = "blocked_missing_bridge_contract";
    blockedReasons.push("Bridge contract is required.");
  } else if (!activationChecklist) {
    status = "blocked_missing_activation_checklist";
    blockedReasons.push("Activation checklist is required.");
  } else if (hasUnsafeBridgeContract(bridgeContract) || hasUnsafeChecklist(activationChecklist)) {
    status = "blocked_unsafe_capability";
    blockedReasons.push("A supplied input exposes a forbidden runtime capability.");
  } else if (
    activationChecklist.status !== "approved_for_disabled_runner_design" ||
    input.explicitRunnerDesignApprovalPresent !== true
  ) {
    status = "blocked_checklist_not_approved";
    blockedReasons.push("Checklist is not approved for disabled runner design.");
  } else if (mode === "unknown") {
    status = "unknown";
    blockedReasons.push("Unknown runner mode is treated as blocked.");
  } else if (mode === "invocation_forbidden") {
    status = "blocked_smoke_invocation_forbidden";
    blockedReasons.push("Invocation-forbidden mode blocks smoke runner calls.");
  } else if (input.envOptInPresent !== true) {
    status = "blocked_bridge_gate_locked";
    blockedReasons.push("Env opt-in is required before any future invocation design.");
  } else if (input.manualTerminalConfirmationPresent !== true) {
    status = "blocked_bridge_gate_locked";
    blockedReasons.push("Manual terminal confirmation is required before any future invocation design.");
  } else if (input.realRunFlagPresent !== true) {
    status = "blocked_bridge_gate_locked";
    blockedReasons.push("Separate real-run flag is required before any future real-run design.");
  } else {
    status = "ready_disabled_report";
    blockedReasons.push("Local-dev bridge gate remains locked.");
    blockedReasons.push("Smoke runner invocation remains blocked.");
  }

  if (mode === "disabled" && status === "ready_disabled_report") {
    status = "blocked_bridge_gate_locked";
    blockedReasons.push("Disabled mode keeps the report blocked for invocation.");
  }

  const details = statusDetails(status);

  return {
    blockedReasons,
    bridgeContractId: bridgeContract?.bridgeContractId,
    checklistId: activationChecklist?.checklistId,
    createdAt,
    disabledSteps: buildDisabledSteps(input, status),
    forbiddenActions: [...forbiddenActions],
    label: details.label,
    mode,
    reason: details.reason,
    requestKind: bridgeContract?.requestKind,
    runnerId,
    safetyFlags: avanzaDisabledLocalDevBridgeRunnerSafetyFlags,
    selectedLimitPrice: bridgeContract?.selectedLimitPrice,
    selectedQuantity: bridgeContract?.selectedQuantity,
    selectedSide: bridgeContract?.selectedSide,
    selectedTicker: bridgeContract?.selectedTicker,
    status,
    warnings,
    wouldRequireBeforeInvocation: [...wouldRequireBeforeInvocation],
  };
}
