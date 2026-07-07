import type {
  AvanzaHeadlessExecutionOrchestrationReport,
} from "./avanza-headless-execution-orchestration-pipeline";

export type AvanzaLocalDevBridgeContractStatus =
  | "draft_ready"
  | "blocked_missing_orchestration"
  | "blocked_orchestration_not_ready"
  | "blocked_gate_locked"
  | "blocked_unsafe_capability"
  | "blocked"
  | "unknown";

export type AvanzaLocalDevBridgeRequestKind =
  | "login_smoke"
  | "order_chain_smoke"
  | "combined_login_then_order"
  | "review_only"
  | "unknown";

export type AvanzaLocalDevBridgeActivationGateStatus =
  | "locked"
  | "explicitly_required"
  | "modeled_only"
  | "forbidden"
  | "unknown";

export type AvanzaLocalDevBridgeRequestCandidate = {
  requestId: string;
  kind: AvanzaLocalDevBridgeRequestKind;
  localDevOnly: boolean;
  terminalOnly: true;
  modelOnlyDefault: true;
  requiresEnvOptIn: true;
  requiresManualTerminalConfirmation: true;
  requiresSeparateRealRunFlag: true;
  canUseOrchestrationReport: boolean;
  canUseSelectedContractSummary: boolean;
  canUsePlanSummary: boolean;
  canUseSessionSummary: boolean;
  canInvokeSmokeRunnerNow: false;
  canUseBrowserAutomationNow: false;
  canSubmitOrder: false;
  canClickFinalBuy: false;
  canClickFinalSell: false;
  safeSummary: string;
  forbiddenActions: string[];
};

export type AvanzaLocalDevBridgeActivationGate = {
  gateId: string;
  status: AvanzaLocalDevBridgeActivationGateStatus;
  label: string;
  purpose: string;
  requiredValue?: boolean | string;
  currentlyPresent: boolean;
  currentlyAllows: string[];
  currentlyBlocks: string[];
  forbiddenActions: string[];
};

export type AvanzaLocalDevBridgeContractSafetyFlags = {
  bridgeContractOnly: true;
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

export type AvanzaLocalDevBridgeContractInput = {
  bridgeContractId?: string;
  orchestrationReport?: AvanzaHeadlessExecutionOrchestrationReport;
  requestKind?: AvanzaLocalDevBridgeRequestKind;
  localDevOnly?: boolean;
  explicitOperatorApprovalPresent?: boolean;
  envOptInPresent?: boolean;
  manualTerminalConfirmationPresent?: boolean;
  realRunFlagPresent?: boolean;
  now?: string;
};

export type AvanzaLocalDevBridgeContract = {
  bridgeContractId: string;
  createdAt: string;
  status: AvanzaLocalDevBridgeContractStatus;
  label: string;
  reason: string;
  requestKind: AvanzaLocalDevBridgeRequestKind;
  orchestrationId?: string;
  selectedContractId?: string;
  selectedSource?: string;
  selectedIntent?: string;
  selectedTicker?: string;
  selectedSide?: string;
  selectedQuantity?: number;
  selectedLimitPrice?: number;
  sessionId?: string;
  planId?: string;
  requestCandidate?: AvanzaLocalDevBridgeRequestCandidate;
  activationGates: AvanzaLocalDevBridgeActivationGate[];
  warnings: string[];
  blockedReasons: string[];
  safetyFlags: AvanzaLocalDevBridgeContractSafetyFlags;
};

const defaultCreatedAt = "2026-07-07T12:00:00.000Z";

export const avanzaLocalDevBridgeContractSafetyFlags:
  AvanzaLocalDevBridgeContractSafetyFlags = {
    bridgeContractOnly: true,
    headlessOnly: true,
    visibleInUi: false,
    canOpenLocalDevBridgeGate: false,
    canInvokeSmokeRunnerNow: false,
    canRunTerminalScriptNow: false,
    canUseBrowserAutomationNow: false,
    canStartHandoff: false,
    canPrepareOrderNow: false,
    canRunSmokeTestFromUi: false,
    canCallApiRoute: false,
    canFetch: false,
    canPoll: false,
    canAccessCredentials: false,
    canReadCookies: false,
    canExportSession: false,
    canAutomateBankId: false,
    canSubmitOrder: false,
    canClickFinalBuy: false,
    canClickFinalSell: false,
    canWriteSupabase: false,
    canClaimProductionReady: false,
    userMustConfirm: true,
    finalHumanClickRequired: true,
    controlsEnabled: false,
    gateLocked: true,
  };

function normalizeRequestKind(
  value: AvanzaLocalDevBridgeContractInput["requestKind"],
): AvanzaLocalDevBridgeRequestKind {
  if (
    value === "login_smoke" ||
    value === "order_chain_smoke" ||
    value === "combined_login_then_order" ||
    value === "review_only"
  ) {
    return value;
  }

  return "unknown";
}

function statusDetails(status: AvanzaLocalDevBridgeContractStatus) {
  if (status === "draft_ready") {
    return {
      label: "Local-dev bridge contract draft ready",
      reason:
        "A safe local-dev smoke request candidate can be reviewed, but every activation gate remains closed.",
    };
  }
  if (status === "blocked_missing_orchestration") {
    return {
      label: "Missing orchestration report",
      reason: "No headless orchestration report was supplied.",
    };
  }
  if (status === "blocked_orchestration_not_ready") {
    return {
      label: "Orchestration is not ready",
      reason: "The headless orchestration report is not in ready_orchestration state.",
    };
  }
  if (status === "blocked_gate_locked") {
    return {
      label: "Local-dev bridge gate locked",
      reason:
        "The local-dev bridge gate is intentionally not open for this model-only contract.",
    };
  }
  if (status === "blocked_unsafe_capability") {
    return {
      label: "Unsafe orchestration capability blocked",
      reason: "The orchestration report advertised a capability this bridge contract forbids.",
    };
  }
  if (status === "blocked") {
    return {
      label: "Local-dev bridge contract blocked",
      reason: "The bridge contract is blocked until explicit review.",
    };
  }

  return {
    label: "Local-dev bridge contract unknown",
    reason: "Unknown bridge contract input is treated as blocked.",
  };
}

function activationGate(
  gateId: string,
  status: AvanzaLocalDevBridgeActivationGateStatus,
  label: string,
  purpose: string,
  currentlyPresent: boolean,
  currentlyBlocks: string[],
  forbiddenActions: string[],
  requiredValue: boolean | string = true,
): AvanzaLocalDevBridgeActivationGate {
  return {
    currentlyAllows: currentlyPresent && status === "modeled_only" ? ["model review only"] : [],
    currentlyBlocks,
    currentlyPresent,
    forbiddenActions,
    gateId,
    label,
    purpose,
    requiredValue,
    status,
  };
}

function unsafeOrchestrationCapability(
  report: AvanzaHeadlessExecutionOrchestrationReport,
) {
  return (
    report.safetyFlags.canStartHandoff ||
    report.safetyFlags.canPrepareOrderNow ||
    report.safetyFlags.canRunSmokeTestFromUi ||
    report.safetyFlags.canCallApiRoute ||
    report.safetyFlags.canFetch ||
    report.safetyFlags.canPoll ||
    report.safetyFlags.canUseBrowserAutomationNow ||
    report.safetyFlags.canAccessCredentials ||
    report.safetyFlags.canReadCookies ||
    report.safetyFlags.canExportSession ||
    report.safetyFlags.canAutomateBankId ||
    report.safetyFlags.canSubmitOrder ||
    report.safetyFlags.canClickFinalBuy ||
    report.safetyFlags.canClickFinalSell ||
    report.safetyFlags.canWriteSupabase ||
    report.safetyFlags.canClaimProductionReady
  );
}

function buildRequestCandidate(
  bridgeContractId: string,
  requestKind: AvanzaLocalDevBridgeRequestKind,
  localDevOnly: boolean,
  report: AvanzaHeadlessExecutionOrchestrationReport,
): AvanzaLocalDevBridgeRequestCandidate {
  const selected = [
    report.selectedSource,
    report.selectedIntent,
    report.selectedSide,
    report.selectedTicker,
  ]
    .filter(Boolean)
    .join(" / ");

  return {
    canClickFinalBuy: false,
    canClickFinalSell: false,
    canInvokeSmokeRunnerNow: false,
    canSubmitOrder: false,
    canUseBrowserAutomationNow: false,
    canUseOrchestrationReport: true,
    canUsePlanSummary: Boolean(report.plan),
    canUseSelectedContractSummary: Boolean(report.selectedContractId),
    canUseSessionSummary: Boolean(report.session),
    forbiddenActions: [
      "invoke smoke runner now",
      "run terminal script now",
      "start browser automation now",
      "access credentials",
      "read cookies/session",
      "automate BankID",
      "submit order",
      "click final KOP/SALJ",
      "write Supabase",
    ],
    kind: requestKind,
    localDevOnly,
    modelOnlyDefault: true,
    requestId: `${bridgeContractId}-candidate`,
    requiresEnvOptIn: true,
    requiresManualTerminalConfirmation: true,
    requiresSeparateRealRunFlag: true,
    safeSummary: selected
      ? `Future ${requestKind} candidate from ${selected}; smoke runner invocation remains blocked.`
      : `Future ${requestKind} candidate from orchestration report; smoke runner invocation remains blocked.`,
    terminalOnly: true,
  };
}

export function buildAvanzaLocalDevBridgeContract(
  input: AvanzaLocalDevBridgeContractInput = {},
): AvanzaLocalDevBridgeContract {
  const createdAt = input.now ?? defaultCreatedAt;
  const bridgeContractId =
    input.bridgeContractId ?? "avanza-local-dev-bridge-contract";
  const requestKind = normalizeRequestKind(input.requestKind);
  const localDevOnly = input.localDevOnly === true;
  const report = input.orchestrationReport;
  const warnings: string[] = [];
  const blockedReasons: string[] = [];

  let status: AvanzaLocalDevBridgeContractStatus = "draft_ready";
  let requestCandidate: AvanzaLocalDevBridgeRequestCandidate | undefined;

  if (!report) {
    status = "blocked_missing_orchestration";
    blockedReasons.push("Headless orchestration report is required.");
  } else if (report.status !== "ready_orchestration") {
    status = "blocked_orchestration_not_ready";
    blockedReasons.push(`Orchestration status is ${report.status}.`);
  } else if (unsafeOrchestrationCapability(report)) {
    status = "blocked_unsafe_capability";
    blockedReasons.push("Orchestration report contains a forbidden capability.");
  } else if (!localDevOnly) {
    status = "blocked_gate_locked";
    blockedReasons.push("Local-dev-only gate is not present.");
  } else {
    requestCandidate = buildRequestCandidate(
      bridgeContractId,
      requestKind,
      localDevOnly,
      report,
    );
    warnings.push(
      "Candidate is for future manual local-dev review only; smoke runner invocation remains blocked.",
    );
  }

  if (input.explicitOperatorApprovalPresent !== true) {
    blockedReasons.push("Explicit operator approval gate is not present.");
  }
  if (input.envOptInPresent !== true) {
    blockedReasons.push("Environment opt-in gate is not present.");
  }
  if (input.manualTerminalConfirmationPresent !== true) {
    blockedReasons.push("Manual terminal confirmation gate is not present.");
  }
  if (input.realRunFlagPresent !== true) {
    blockedReasons.push("Separate real-run flag gate is not present.");
  }

  const details = statusDetails(status);
  const activationGates = [
    activationGate(
      "local_dev_only_gate",
      localDevOnly ? "modeled_only" : "locked",
      "Local-dev only gate",
      "Limits any future request candidate to local-dev review.",
      localDevOnly,
      localDevOnly ? ["local-dev bridge gate is still not open"] : ["local-dev-only flag missing"],
      ["production execution", "default Trade UI execution"],
    ),
    activationGate(
      "explicit_operator_approval_gate",
      "explicitly_required",
      "Explicit operator approval gate",
      "Requires explicit human approval before any future local-dev bridge work.",
      input.explicitOperatorApprovalPresent === true,
      ["smoke runner invocation"],
      ["implicit activation"],
    ),
    activationGate(
      "env_opt_in_gate",
      "explicitly_required",
      "Env opt-in gate",
      "Requires a future terminal-only environment opt-in.",
      input.envOptInPresent === true,
      ["terminal smoke request"],
      ["environment-free activation"],
    ),
    activationGate(
      "manual_terminal_confirmation_gate",
      "explicitly_required",
      "Manual terminal confirmation gate",
      "Requires manual terminal confirmation outside the app UI.",
      input.manualTerminalConfirmationPresent === true,
      ["smoke runner invocation"],
      ["UI-triggered smoke run"],
    ),
    activationGate(
      "separate_real_run_flag_gate",
      "explicitly_required",
      "Separate real-run flag gate",
      "Requires a separate explicit real-run flag for any future real local-dev run.",
      input.realRunFlagPresent === true,
      ["real browser run"],
      ["accidental real run"],
    ),
    activationGate(
      "browser_automation_gate",
      "locked",
      "Browser automation gate",
      "Keeps browser automation closed in this contract phase.",
      false,
      ["browser automation now"],
      ["browser launch", "page navigation"],
    ),
    activationGate(
      "credential_provider_gate",
      "locked",
      "Credential provider gate",
      "Keeps credential access unavailable in this contract phase.",
      false,
      ["credential access now"],
      ["credential reads", "credential exposure"],
    ),
    activationGate(
      "cookie_session_forbidden_gate",
      "forbidden",
      "Cookie/session forbidden gate",
      "Forbids cookie reads and session export.",
      false,
      ["cookie/session handling"],
      ["cookie reads", "session export"],
    ),
    activationGate(
      "bankid_forbidden_gate",
      "forbidden",
      "BankID automation forbidden gate",
      "Forbids BankID automation or bypass; manual user action only.",
      false,
      ["BankID automation"],
      ["BankID automation", "BankID bypass"],
    ),
    activationGate(
      "order_submit_forbidden_gate",
      "forbidden",
      "Order submit forbidden gate",
      "Forbids agent order submission.",
      false,
      ["order submission"],
      ["submit order"],
    ),
    activationGate(
      "final_kop_salj_human_only_gate",
      "forbidden",
      "Final KOP/SALJ human-only gate",
      "Forbids agent final buy/sell clicks; user must confirm manually.",
      false,
      ["final KOP/SALJ click by agent"],
      ["agent final KOP/SALJ click"],
    ),
    activationGate(
      "supabase_write_locked_gate",
      "locked",
      "Supabase write locked gate",
      "Keeps Supabase writes unavailable in this contract phase.",
      false,
      ["Supabase write"],
      ["write Supabase records"],
    ),
  ];

  return {
    activationGates,
    blockedReasons,
    bridgeContractId,
    createdAt,
    label: details.label,
    orchestrationId: report?.orchestrationId,
    planId: report?.plan?.planId,
    reason: details.reason,
    requestCandidate,
    requestKind,
    safetyFlags: avanzaLocalDevBridgeContractSafetyFlags,
    selectedContractId: report?.selectedContractId,
    selectedIntent: report?.selectedIntent,
    selectedLimitPrice: report?.selectedLimitPrice,
    selectedQuantity: report?.selectedQuantity,
    selectedSide: report?.selectedSide,
    selectedSource: report?.selectedSource,
    selectedTicker: report?.selectedTicker,
    sessionId: report?.session?.sessionId,
    status,
    warnings,
  };
}
