import type {
  AvanzaDisabledLocalDevBridgeRunnerReport,
} from "./avanza-disabled-local-dev-bridge-runner";
import type {
  AvanzaLocalDevBridgeActivationChecklist,
} from "./avanza-local-dev-bridge-activation-checklist";
import type {
  AvanzaLocalDevBridgeContract,
  AvanzaLocalDevBridgeRequestKind,
} from "./avanza-local-dev-bridge-contract";

export type AvanzaModelOnlyLocalDevBridgeDryRunStatus =
  | "model_dry_run_ready"
  | "blocked_missing_disabled_runner_report"
  | "blocked_missing_bridge_contract"
  | "blocked_missing_activation_checklist"
  | "blocked_checklist_not_approved_for_design"
  | "blocked_bridge_gate_locked"
  | "blocked_smoke_invocation_forbidden"
  | "blocked_unsafe_capability"
  | "forbidden"
  | "unknown";

export type AvanzaModelOnlyLocalDevBridgeDryRunMode =
  | "model_only"
  | "report_only"
  | "invocation_forbidden"
  | "unknown";

export type AvanzaModelOnlyLocalDevBridgeDryRunStepStatus =
  | "simulated"
  | "skipped"
  | "blocked"
  | "forbidden"
  | "unknown";

export type AvanzaModelOnlyLocalDevBridgeDryRunStep = {
  stepId: string;
  label: string;
  purpose: string;
  status: AvanzaModelOnlyLocalDevBridgeDryRunStepStatus;
  wouldCallLater?: string;
  currentlyCalls: false;
  simulatedInputSummary?: string;
  simulatedOutputSummary?: string;
  stopCondition?: string;
  blockedReason?: string;
  forbiddenActions: string[];
};

export type AvanzaModelOnlyLocalDevBridgeDryRunSafetyFlags = {
  dryRunOnly: true;
  modelOnly: true;
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

export type AvanzaModelOnlyLocalDevBridgeDryRunInput = {
  dryRunId?: string;
  disabledRunnerReport?: AvanzaDisabledLocalDevBridgeRunnerReport;
  bridgeContract?: AvanzaLocalDevBridgeContract;
  activationChecklist?: AvanzaLocalDevBridgeActivationChecklist;
  mode?: AvanzaModelOnlyLocalDevBridgeDryRunMode;
  simulateLoginSmoke?: boolean;
  simulateOrderSmoke?: boolean;
  simulateCombinedLoginThenOrder?: boolean;
  now?: string;
};

export type AvanzaModelOnlyLocalDevBridgeDryRunReport = {
  dryRunId: string;
  createdAt: string;
  status: AvanzaModelOnlyLocalDevBridgeDryRunStatus;
  label: string;
  reason: string;
  mode: AvanzaModelOnlyLocalDevBridgeDryRunMode;
  bridgeContractId?: string;
  checklistId?: string;
  disabledRunnerId?: string;
  requestKind?: AvanzaLocalDevBridgeRequestKind;
  selectedTicker?: string;
  selectedSide?: string;
  selectedQuantity?: number;
  selectedLimitPrice?: number;
  simulatedSteps: AvanzaModelOnlyLocalDevBridgeDryRunStep[];
  simulatedOutcome: string[];
  stopReason: string;
  wouldRequireBeforeRealInvocation: string[];
  forbiddenActions: string[];
  warnings: string[];
  blockedReasons: string[];
  safetyFlags: AvanzaModelOnlyLocalDevBridgeDryRunSafetyFlags;
};

const defaultCreatedAt = "2026-07-07T12:00:00.000Z";

export const avanzaModelOnlyLocalDevBridgeDryRunSafetyFlags:
  AvanzaModelOnlyLocalDevBridgeDryRunSafetyFlags = {
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
    dryRunOnly: true,
    finalHumanClickRequired: true,
    gateLocked: true,
    headlessOnly: true,
    modelOnly: true,
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

const wouldRequireBeforeRealInvocation = [
  "separate future runtime approval",
  "local-dev bridge gate explicitly opened",
  "smoke runner invocation approval",
  "terminal script invocation approval",
  "browser automation gate review",
  "credential provider approval without exposure",
  "no cookies/session export",
  "BankID manual-only",
  "final KOP/SALJ human-only",
] as const;

function normalizeMode(
  mode: AvanzaModelOnlyLocalDevBridgeDryRunInput["mode"],
): AvanzaModelOnlyLocalDevBridgeDryRunMode {
  if (
    mode === "model_only" ||
    mode === "report_only" ||
    mode === "invocation_forbidden" ||
    mode === "unknown"
  ) {
    return mode;
  }

  return "model_only";
}

function statusDetails(status: AvanzaModelOnlyLocalDevBridgeDryRunStatus) {
  if (status === "model_dry_run_ready") {
    return {
      label: "Model-only local-dev bridge dry-run ready",
      reason:
        "The dry-run can simulate a future bridge run to the invocation boundary without calling runtime.",
    };
  }
  if (status === "blocked_missing_disabled_runner_report") {
    return {
      label: "Missing disabled runner report",
      reason: "A disabled runner report is required before dry-run simulation.",
    };
  }
  if (status === "blocked_missing_bridge_contract") {
    return {
      label: "Missing bridge contract",
      reason: "A bridge contract is required before dry-run simulation.",
    };
  }
  if (status === "blocked_missing_activation_checklist") {
    return {
      label: "Missing activation checklist",
      reason: "An activation checklist is required before dry-run simulation.",
    };
  }
  if (status === "blocked_checklist_not_approved_for_design") {
    return {
      label: "Checklist not approved for design",
      reason:
        "The activation checklist is not approved for disabled runner design.",
    };
  }
  if (status === "blocked_bridge_gate_locked") {
    return {
      label: "Bridge gate locked",
      reason: "The local-dev bridge gate remains locked.",
    };
  }
  if (status === "blocked_smoke_invocation_forbidden") {
    return {
      label: "Smoke invocation forbidden",
      reason: "Smoke runner and terminal script invocation remain blocked.",
    };
  }
  if (status === "blocked_unsafe_capability") {
    return {
      label: "Unsafe capability blocked",
      reason: "A supplied model exposes a forbidden runtime capability.",
    };
  }
  if (status === "forbidden") {
    return {
      label: "Dry-run forbidden",
      reason: "The requested dry-run would imply runtime invocation.",
    };
  }

  return {
    label: "Dry-run unknown",
    reason: "Unknown input is treated as blocked.",
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

function hasUnsafeDisabledRunnerReport(
  report?: AvanzaDisabledLocalDevBridgeRunnerReport,
) {
  const flags = report?.safetyFlags;

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
  status: AvanzaModelOnlyLocalDevBridgeDryRunStepStatus,
  options: {
    wouldCallLater?: string;
    simulatedInputSummary?: string;
    simulatedOutputSummary?: string;
    stopCondition?: string;
    blockedReason?: string;
  } = {},
): AvanzaModelOnlyLocalDevBridgeDryRunStep {
  return {
    currentlyCalls: false,
    forbiddenActions: [...forbiddenActions],
    label,
    purpose,
    status,
    stepId,
    ...options,
  };
}

function smokeSimulationSummary(input: AvanzaModelOnlyLocalDevBridgeDryRunInput) {
  if (input.simulateCombinedLoginThenOrder === true) {
    return "combined login then order dry-run simulation";
  }
  if (input.simulateLoginSmoke === true) {
    return "login smoke simulation stops before invocation";
  }
  if (input.simulateOrderSmoke === true) {
    return "order smoke simulation stops before invocation";
  }

  return "bridge dry-run simulation stops before invocation";
}

function buildSimulatedSteps(
  input: AvanzaModelOnlyLocalDevBridgeDryRunInput,
  status: AvanzaModelOnlyLocalDevBridgeDryRunStatus,
) {
  const contract = input.bridgeContract;
  const checklist = input.activationChecklist;
  const disabledReport = input.disabledRunnerReport;
  const canSimulate = status === "model_dry_run_ready";
  const stopCondition =
    "dry_run_completed_to_invocation_boundary; no_runtime_invocation; bridge_gate_still_locked";

  return [
    step(
      "receive_bridge_request_candidate",
      "Receive bridge request candidate",
      "Simulate receiving the bridge request candidate from the bridge contract.",
      contract ? "simulated" : "blocked",
      {
        blockedReason: contract ? undefined : "Bridge contract missing.",
        simulatedInputSummary: contract?.requestKind,
        simulatedOutputSummary: contract
          ? `Candidate from ${contract.requestKind} for ${contract.selectedTicker ?? "unknown ticker"}.`
          : undefined,
      },
    ),
    step(
      "validate_activation_checklist",
      "Validate activation checklist",
      "Confirm disabled runner design approval exists without opening runtime.",
      checklist ? (checklist.status === "approved_for_disabled_runner_design" ? "simulated" : "blocked") : "blocked",
      {
        blockedReason: checklist
          ? "Disabled runner design approval does not open runtime."
          : "Activation checklist missing.",
        simulatedInputSummary: checklist?.status,
        simulatedOutputSummary:
          checklist?.status === "approved_for_disabled_runner_design"
            ? "Checklist design approval is present; runtime remains locked."
            : undefined,
      },
    ),
    step(
      "validate_disabled_runner_report",
      "Validate disabled runner report",
      "Require the disabled runner skeleton report before dry-run simulation.",
      disabledReport
        ? disabledReport.status === "ready_disabled_report"
          ? "simulated"
          : "blocked"
        : "blocked",
      {
        blockedReason: disabledReport
          ? "Disabled report must be ready_disabled_report."
          : "Disabled runner report missing.",
        simulatedInputSummary: disabledReport?.status,
        simulatedOutputSummary:
          disabledReport?.status === "ready_disabled_report"
            ? "Disabled runner report is valid for model-only dry-run."
            : undefined,
      },
    ),
    step(
      "validate_terminal_only_requirements",
      "Validate terminal-only requirements",
      "Simulate the terminal-only boundary without invoking terminal scripts.",
      canSimulate ? "simulated" : "blocked",
      {
        blockedReason: canSimulate ? undefined : statusDetails(status).reason,
        simulatedOutputSummary:
          "Env opt-in, manual terminal confirmation, and real-run flag stay requirements only.",
      },
    ),
    step(
      "prepare_smoke_runner_request_summary",
      "Prepare smoke-runner request summary",
      "Create a model-only smoke request summary and stop before invocation.",
      canSimulate ? "simulated" : "blocked",
      {
        simulatedInputSummary: smokeSimulationSummary(input),
        simulatedOutputSummary:
          "Smoke-runner request summary prepared without importing or invoking scripts.",
        stopCondition,
        wouldCallLater: "future separately approved terminal-only smoke runner",
      },
    ),
    step(
      "invoke_login_smoke_runner",
      "Invoke login smoke runner",
      "Would invoke login smoke runner only in a future approved runtime phase.",
      "forbidden",
      {
        blockedReason: "Smoke runner invocation blocked.",
        stopCondition,
        wouldCallLater: "future terminal-only login smoke runner",
      },
    ),
    step(
      "invoke_order_smoke_runner",
      "Invoke order smoke runner",
      "Would invoke order smoke runner only in a future approved runtime phase.",
      "forbidden",
      {
        blockedReason: "Smoke runner invocation blocked.",
        stopCondition,
        wouldCallLater: "future terminal-only order smoke runner",
      },
    ),
    step(
      "invoke_browser_automation",
      "Invoke browser automation",
      "Would start browser automation only after separate local-dev approval.",
      "forbidden",
      {
        blockedReason: "Browser automation gate locked.",
        stopCondition,
        wouldCallLater: "future manually approved local browser runtime",
      },
    ),
    step(
      "capture_dry_run_outcome",
      "Capture dry-run outcome",
      "Record the dry-run stop line without runtime side effects.",
      canSimulate ? "simulated" : "blocked",
      {
        blockedReason: canSimulate ? undefined : statusDetails(status).reason,
        simulatedOutputSummary: canSimulate
          ? "Dry-run completed to invocation boundary with no runtime invocation."
          : undefined,
        stopCondition,
      },
    ),
  ];
}

export function buildAvanzaModelOnlyLocalDevBridgeDryRunReport(
  input: AvanzaModelOnlyLocalDevBridgeDryRunInput = {},
): AvanzaModelOnlyLocalDevBridgeDryRunReport {
  const dryRunId =
    input.dryRunId ?? "avanza-model-only-local-dev-bridge-dry-runner";
  const createdAt = input.now ?? defaultCreatedAt;
  const mode = normalizeMode(input.mode);
  const disabledRunnerReport = input.disabledRunnerReport;
  const bridgeContract = input.bridgeContract;
  const activationChecklist = input.activationChecklist;
  const warnings = [
    "Model-only bridge dry-run simulates future behavior to invocation boundary.",
    "Dry-run does not open the bridge gate.",
    "Dry-run does not invoke smoke runners or terminal scripts.",
  ];
  const blockedReasons: string[] = [];

  let status: AvanzaModelOnlyLocalDevBridgeDryRunStatus = "model_dry_run_ready";

  if (!disabledRunnerReport) {
    status = "blocked_missing_disabled_runner_report";
    blockedReasons.push("Disabled runner report is required.");
  } else if (!bridgeContract) {
    status = "blocked_missing_bridge_contract";
    blockedReasons.push("Bridge contract is required.");
  } else if (!activationChecklist) {
    status = "blocked_missing_activation_checklist";
    blockedReasons.push("Activation checklist is required.");
  } else if (
    hasUnsafeDisabledRunnerReport(disabledRunnerReport) ||
    hasUnsafeBridgeContract(bridgeContract) ||
    hasUnsafeChecklist(activationChecklist)
  ) {
    status = "blocked_unsafe_capability";
    blockedReasons.push("A supplied input exposes a forbidden runtime capability.");
  } else if (activationChecklist.status !== "approved_for_disabled_runner_design") {
    status = "blocked_checklist_not_approved_for_design";
    blockedReasons.push("Activation checklist is not approved for disabled runner design.");
  } else if (disabledRunnerReport.status !== "ready_disabled_report") {
    status =
      disabledRunnerReport.status === "blocked_smoke_invocation_forbidden"
        ? "blocked_smoke_invocation_forbidden"
        : "blocked_bridge_gate_locked";
    blockedReasons.push(`Disabled runner report status is ${disabledRunnerReport.status}.`);
  } else if (mode === "unknown") {
    status = "unknown";
    blockedReasons.push("Unknown dry-run mode is treated as blocked.");
  } else if (mode === "invocation_forbidden") {
    status = "blocked_smoke_invocation_forbidden";
    blockedReasons.push("Invocation-forbidden mode blocks smoke runner calls.");
  } else {
    blockedReasons.push("Local-dev bridge gate remains locked.");
    blockedReasons.push("Smoke runner invocation remains blocked.");
  }

  const details = statusDetails(status);
  const simulatedOutcome =
    status === "model_dry_run_ready"
      ? [
          "dry_run_completed_to_invocation_boundary",
          "no_runtime_invocation",
          "bridge_gate_still_locked",
          "final_human_confirmation_preserved",
        ]
      : ["no_runtime_invocation", "bridge_gate_still_locked"];

  return {
    blockedReasons,
    bridgeContractId: bridgeContract?.bridgeContractId,
    checklistId: activationChecklist?.checklistId,
    createdAt,
    disabledRunnerId: disabledRunnerReport?.runnerId,
    dryRunId,
    forbiddenActions: [...forbiddenActions],
    label: details.label,
    mode,
    reason: details.reason,
    requestKind: bridgeContract?.requestKind,
    safetyFlags: avanzaModelOnlyLocalDevBridgeDryRunSafetyFlags,
    selectedLimitPrice: bridgeContract?.selectedLimitPrice,
    selectedQuantity: bridgeContract?.selectedQuantity,
    selectedSide: bridgeContract?.selectedSide,
    selectedTicker: bridgeContract?.selectedTicker,
    simulatedOutcome,
    simulatedSteps: buildSimulatedSteps(input, status),
    status,
    stopReason:
      status === "model_dry_run_ready"
        ? "dry_run_completed_to_invocation_boundary"
        : details.reason,
    warnings,
    wouldRequireBeforeRealInvocation: [...wouldRequireBeforeRealInvocation],
  };
}
