import type {
  AvanzaLocalDevBridgeReadinessCheckpoint,
} from "./avanza-local-dev-bridge-readiness-checkpoint";
import type {
  AvanzaManualLocalDevInvocationApprovalRunbook,
} from "./avanza-manual-local-dev-invocation-approval-runbook";
import type {
  AvanzaModelOnlyLocalDevBridgeDryRunReport,
} from "./avanza-model-only-local-dev-bridge-dry-runner";

export type AvanzaDisabledLocalDevInvocationAdapterContractStatus =
  | "disabled_contract_ready"
  | "blocked_missing_approval_runbook"
  | "blocked_missing_bridge_readiness_checkpoint"
  | "blocked_missing_dry_run_report"
  | "blocked_design_not_approved"
  | "blocked_runtime_not_approved"
  | "blocked_invocation_boundary_locked"
  | "blocked_unsafe_capability"
  | "forbidden"
  | "unknown";

export type AvanzaDisabledLocalDevInvocationAdapterTarget =
  | "login_smoke_runner"
  | "order_chain_smoke_runner"
  | "combined_login_then_order"
  | "review_only"
  | "unknown";

export type AvanzaDisabledLocalDevInvocationAdapterGateStatus =
  | "locked"
  | "design_only"
  | "model_only"
  | "forbidden"
  | "unknown";

export type AvanzaDisabledLocalDevInvocationAdapterRequestShape = {
  requestId: string;
  target: AvanzaDisabledLocalDevInvocationAdapterTarget;
  terminalOnly: true;
  localDevOnly: true;
  modelOnlyDefault: true;
  requiresDesignApproval: true;
  requiresRuntimeApprovalLater: true;
  requiresEnvOptIn: true;
  requiresManualTerminalConfirmation: true;
  requiresSeparateRealRunFlag: true;
  canCarrySelectedContractSummary: boolean;
  canCarryPlanSummary: boolean;
  canCarrySessionSummary: boolean;
  canCarrySmokeRequestSummary: boolean;
  canCarryCredentials: false;
  canCarryCookies: false;
  canCarrySessionTokens: false;
  canCarryAccountNumbers: false;
  canCarryOrderIds: false;
  canInvokeTargetNow: false;
  safePayloadSummary: string[];
  forbiddenPayloadFields: string[];
};

export type AvanzaDisabledLocalDevInvocationAdapterGate = {
  gateId: string;
  status: AvanzaDisabledLocalDevInvocationAdapterGateStatus;
  label: string;
  purpose: string;
  currentlyAllows: string[];
  currentlyBlocks: string[];
  unlockRequires: string[];
  forbiddenActions: string[];
};

export type AvanzaDisabledLocalDevInvocationAdapterSafetyFlags = {
  adapterContractOnly: true;
  disabledOnly: true;
  headlessOnly: true;
  visibleInUi: false;
  canApproveRuntimeInvocation: false;
  canCrossInvocationBoundaryNow: false;
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
  canCarryCredentials: false;
  canReadCookies: false;
  canExportSession: false;
  canCarrySessionTokens: false;
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

export type AvanzaDisabledLocalDevInvocationAdapterContractInput = {
  adapterContractId?: string;
  approvalRunbook?: AvanzaManualLocalDevInvocationApprovalRunbook;
  bridgeReadinessCheckpoint?: AvanzaLocalDevBridgeReadinessCheckpoint;
  modelOnlyDryRunReport?: AvanzaModelOnlyLocalDevBridgeDryRunReport;
  target?: AvanzaDisabledLocalDevInvocationAdapterTarget;
  designOnlyApprovalPresent?: boolean;
  runtimeApprovalPresent?: boolean;
  envOptInPresent?: boolean;
  manualTerminalConfirmationPresent?: boolean;
  realRunFlagPresent?: boolean;
  now?: string;
};

export type AvanzaDisabledLocalDevInvocationAdapterContract = {
  adapterContractId: string;
  createdAt: string;
  status: AvanzaDisabledLocalDevInvocationAdapterContractStatus;
  label: string;
  reason: string;
  target: AvanzaDisabledLocalDevInvocationAdapterTarget;
  approvalRunbookId?: string;
  checkpointId?: string;
  dryRunId?: string;
  requestShape?: AvanzaDisabledLocalDevInvocationAdapterRequestShape;
  gates: AvanzaDisabledLocalDevInvocationAdapterGate[];
  disabledStopReason: string;
  allowedFuturePayloadSummary: string[];
  forbiddenPayload: string[];
  warnings: string[];
  blockedReasons: string[];
  safetyFlags: AvanzaDisabledLocalDevInvocationAdapterSafetyFlags;
};

const defaultCreatedAt = "2026-07-07T12:00:00.000Z";

const forbiddenPayloadFields = [
  "raw_credentials",
  "cookies",
  "session_tokens",
  "account_numbers",
  "order_ids",
  "bankid_artifacts",
  "unredacted_screenshots",
  "broker_confirmations_raw",
] as const;

const forbiddenActions = [
  "runtime invocation",
  "smoke runner invocation",
  "terminal script invocation",
  "browser automation",
  "credential access",
  "cookies/session access",
  "BankID automation",
  "order submission",
  "final KOP/SALJ agent click",
  "Supabase write",
  "Trade UI execution",
  "API route activation",
  "production readiness claim",
] as const;

function safetyFlags(): AvanzaDisabledLocalDevInvocationAdapterSafetyFlags {
  return {
    adapterContractOnly: true,
    canAccessCredentials: false,
    canApproveRuntimeInvocation: false,
    canAutomateBankId: false,
    canCallApiRoute: false,
    canCarryCredentials: false,
    canCarrySessionTokens: false,
    canClaimProductionReady: false,
    canClickFinalBuy: false,
    canClickFinalSell: false,
    canCrossInvocationBoundaryNow: false,
    canExportSession: false,
    canFetch: false,
    canInvokeSmokeRunnerNow: false,
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
    userMustConfirm: true,
    visibleInUi: false,
  };
}

function hasUnsafeCapability(
  input: AvanzaDisabledLocalDevInvocationAdapterContractInput,
) {
  const flagSets = [
    input.approvalRunbook?.safetyFlags,
    input.bridgeReadinessCheckpoint?.safetyFlags,
    input.modelOnlyDryRunReport?.safetyFlags,
  ];

  return flagSets.some((flags) =>
    Boolean(
      flags &&
        (flags.visibleInUi ||
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
          flags.controlsEnabled ||
          !flags.gateLocked),
    ),
  );
}

function statusDetails(
  status: AvanzaDisabledLocalDevInvocationAdapterContractStatus,
) {
  if (status === "disabled_contract_ready") {
    return {
      label: "Disabled invocation adapter contract ready",
      reason:
        "The future adapter shape is ready for design-only review, but cannot invoke any target now.",
    };
  }
  if (status === "blocked_missing_approval_runbook") {
    return {
      label: "Blocked: missing approval runbook",
      reason: "Manual approval runbook is required before adapter contract design.",
    };
  }
  if (status === "blocked_missing_bridge_readiness_checkpoint") {
    return {
      label: "Blocked: missing bridge readiness checkpoint",
      reason: "Bridge readiness checkpoint is required before adapter contract design.",
    };
  }
  if (status === "blocked_missing_dry_run_report") {
    return {
      label: "Blocked: missing model-only dry-run report",
      reason: "Model-only dry-run report is required before adapter contract design.",
    };
  }
  if (status === "blocked_design_not_approved") {
    return {
      label: "Blocked: design-only approval missing",
      reason: "Design-only approval must be modeled before this contract is ready.",
    };
  }
  if (status === "blocked_runtime_not_approved") {
    return {
      label: "Blocked: runtime not approved",
      reason: "Runtime approval is intentionally absent and cannot be granted here.",
    };
  }
  if (status === "blocked_invocation_boundary_locked") {
    return {
      label: "Blocked: invocation boundary locked",
      reason: "The invocation boundary remains locked and canInvokeTargetNow is false.",
    };
  }
  if (status === "blocked_unsafe_capability") {
    return {
      label: "Blocked: unsafe capability",
      reason: "A supplied input exposes a forbidden runtime capability.",
    };
  }
  if (status === "forbidden") {
    return {
      label: "Forbidden adapter contract request",
      reason: "The requested adapter state would cross a forbidden boundary.",
    };
  }

  return {
    label: "Unknown disabled invocation adapter contract",
    reason: "Unknown inputs remain locked.",
  };
}

function gate(
  gateId: string,
  status: AvanzaDisabledLocalDevInvocationAdapterGateStatus,
  label: string,
  purpose: string,
  currentlyAllows: string[],
  currentlyBlocks: string[],
  unlockRequires: string[],
): AvanzaDisabledLocalDevInvocationAdapterGate {
  return {
    currentlyAllows,
    currentlyBlocks,
    forbiddenActions: [...forbiddenActions],
    gateId,
    label,
    purpose,
    status,
    unlockRequires,
  };
}

function buildGates(
  designOnlyApprovalPresent: boolean,
): AvanzaDisabledLocalDevInvocationAdapterGate[] {
  return [
    gate(
      "design_only_approval_gate",
      designOnlyApprovalPresent ? "design_only" : "locked",
      "Design-only approval gate",
      "Requires manual runbook approval for adapter shape design only.",
      designOnlyApprovalPresent ? ["adapter contract shape design"] : [],
      ["runtime invocation"],
      ["manual approval runbook approved for design-only adapter work"],
    ),
    gate(
      "runtime_approval_gate",
      "locked",
      "Runtime approval gate locked",
      "Runtime invocation is not approved by this contract.",
      [],
      ["smoke runner invocation", "terminal script invocation"],
      ["separate future runtime approval task"],
    ),
    gate(
      "invocation_boundary_gate",
      "locked",
      "Invocation boundary locked",
      "The adapter contract stops at the invocation boundary today.",
      ["request shape review"],
      ["crossing invocation boundary"],
      ["separate future invocation boundary approval"],
    ),
    gate(
      "env_opt_in_future_gate",
      "locked",
      "Env opt-in future gate",
      "Future terminal path requires explicit opt-in before runtime.",
      [],
      ["implicit local-dev run"],
      ["explicit local-dev opt-in in a later task"],
    ),
    gate(
      "manual_terminal_confirmation_future_gate",
      "locked",
      "Manual terminal confirmation future gate",
      "Future terminal path requires human confirmation.",
      [],
      ["unattended terminal invocation"],
      ["manual terminal confirmation"],
    ),
    gate(
      "real_run_flag_future_gate",
      "locked",
      "Real-run flag future gate",
      "Real-run remains separate and forbidden here.",
      [],
      ["real Avanza run"],
      ["separate future real-run approval"],
    ),
    gate(
      "smoke_runner_invocation_gate",
      "locked",
      "Smoke runner invocation locked",
      "Smoke runner target cannot be invoked now.",
      [],
      ["login smoke runner", "order chain smoke runner"],
      ["separate future runtime adapter approval"],
    ),
    gate(
      "terminal_script_invocation_gate",
      "locked",
      "Terminal script invocation locked",
      "Terminal scripts are not imported or invoked.",
      [],
      ["terminal script invocation"],
      ["separate future terminal-runner approval"],
    ),
    gate(
      "browser_automation_gate",
      "locked",
      "Browser automation locked",
      "Browser automation remains unavailable.",
      [],
      ["browser automation"],
      ["separate future local browser approval"],
    ),
    gate(
      "credential_gate",
      "locked",
      "Credential gate locked",
      "Credentials cannot be accessed or carried.",
      [],
      ["credential access", "credential payload"],
      ["separate future credential handling approval"],
    ),
    gate(
      "cookies_session_gate",
      "forbidden",
      "Cookies/session forbidden gate",
      "Cookies and session tokens cannot be carried.",
      [],
      ["cookies", "session tokens"],
      ["not allowed in this contract"],
    ),
    gate(
      "bankid_automation_gate",
      "forbidden",
      "BankID automation forbidden gate",
      "BankID remains manual-action only.",
      [],
      ["BankID automation"],
      ["manual user action only"],
    ),
    gate(
      "order_submission_gate",
      "forbidden",
      "Order submission forbidden gate",
      "Order submission cannot be performed by this contract.",
      [],
      ["order submission"],
      ["human final confirmation only"],
    ),
    gate(
      "final_kop_salj_gate",
      "forbidden",
      "Final KÖP/SÄLJ human-only gate",
      "Final KÖP/SÄLJ remains human-only.",
      [],
      ["final KÖP/SÄLJ agent click"],
      ["human final click"],
    ),
    gate(
      "supabase_write_gate",
      "locked",
      "Supabase write locked gate",
      "No execution write is allowed.",
      [],
      ["Supabase execution write"],
      ["separate future persistence approval"],
    ),
    gate(
      "trade_ui_execution_gate",
      "locked",
      "Trade UI execution locked gate",
      "Trade UI execution remains locked.",
      [],
      ["active Trade UI handoff"],
      ["separate future Trade UI approval"],
    ),
    gate(
      "api_route_activation_gate",
      "locked",
      "API route activation locked gate",
      "API route activation remains locked.",
      [],
      ["API route call", "API route activation"],
      ["separate future API route approval"],
    ),
  ];
}

function buildRequestShape(
  adapterContractId: string,
  target: AvanzaDisabledLocalDevInvocationAdapterTarget,
  input: AvanzaDisabledLocalDevInvocationAdapterContractInput,
): AvanzaDisabledLocalDevInvocationAdapterRequestShape {
  return {
    canCarryAccountNumbers: false,
    canCarryCookies: false,
    canCarryCredentials: false,
    canCarryOrderIds: false,
    canCarryPlanSummary: true,
    canCarrySelectedContractSummary: true,
    canCarrySessionSummary: true,
    canCarrySessionTokens: false,
    canCarrySmokeRequestSummary: true,
    canInvokeTargetNow: false,
    forbiddenPayloadFields: [...forbiddenPayloadFields],
    localDevOnly: true,
    modelOnlyDefault: true,
    requestId: `${adapterContractId}-request-shape`,
    requiresDesignApproval: true,
    requiresEnvOptIn: true,
    requiresManualTerminalConfirmation: true,
    requiresRuntimeApprovalLater: true,
    requiresSeparateRealRunFlag: true,
    safePayloadSummary: [
      "selected ticker",
      "side",
      "quantity",
      "limit price",
      "request kind",
      input.modelOnlyDryRunReport?.dryRunId
        ? `dry-run id: ${input.modelOnlyDryRunReport.dryRunId}`
        : "dry-run id",
      input.bridgeReadinessCheckpoint?.checkpointId
        ? `bridge checkpoint id: ${input.bridgeReadinessCheckpoint.checkpointId}`
        : "bridge checkpoint id",
      input.approvalRunbook?.runbookId
        ? `approval runbook id: ${input.approvalRunbook.runbookId}`
        : "approval runbook id",
    ],
    target,
    terminalOnly: true,
  };
}

function targetKnown(target: AvanzaDisabledLocalDevInvocationAdapterTarget) {
  return target !== "unknown";
}

export function buildAvanzaDisabledLocalDevInvocationAdapterContract(
  input: AvanzaDisabledLocalDevInvocationAdapterContractInput = {},
): AvanzaDisabledLocalDevInvocationAdapterContract {
  const adapterContractId =
    input.adapterContractId ??
    "avanza-disabled-local-dev-invocation-adapter-contract";
  const createdAt = input.now ?? defaultCreatedAt;
  const target = input.target ?? "review_only";
  const blockedReasons: string[] = [];
  const warnings: string[] = [];
  const designOnlyApprovalPresent =
    input.designOnlyApprovalPresent ??
    input.approvalRunbook?.status === "approved_for_invocation_adapter_design";

  let status: AvanzaDisabledLocalDevInvocationAdapterContractStatus =
    "disabled_contract_ready";

  if (hasUnsafeCapability(input)) {
    status = "blocked_unsafe_capability";
    blockedReasons.push("A supplied input exposes a forbidden runtime capability.");
  } else if (input.runtimeApprovalPresent) {
    status = "blocked_runtime_not_approved";
    blockedReasons.push("Runtime approval is not accepted by this disabled contract.");
  } else if (!input.approvalRunbook) {
    status = "blocked_missing_approval_runbook";
    blockedReasons.push("Manual approval runbook missing.");
  } else if (!input.bridgeReadinessCheckpoint) {
    status = "blocked_missing_bridge_readiness_checkpoint";
    blockedReasons.push("Bridge readiness checkpoint missing.");
  } else if (!input.modelOnlyDryRunReport) {
    status = "blocked_missing_dry_run_report";
    blockedReasons.push("Model-only dry-run report missing.");
  } else if (!designOnlyApprovalPresent) {
    status = "blocked_design_not_approved";
    blockedReasons.push("Design-only approval is not modeled.");
  } else if (!targetKnown(target)) {
    status = "forbidden";
    blockedReasons.push("Unknown adapter target is forbidden.");
  } else if (
    input.bridgeReadinessCheckpoint.invocationBoundary.canCrossNow ||
    input.bridgeReadinessCheckpoint.safetyFlags.canCrossInvocationBoundaryNow
  ) {
    status = "blocked_invocation_boundary_locked";
    blockedReasons.push("Invocation boundary must remain locked.");
  } else {
    warnings.push("Disabled contract shape only; target invocation remains forbidden.");
  }

  const details = statusDetails(status);
  const requestShape =
    status === "disabled_contract_ready"
      ? buildRequestShape(adapterContractId, target, input)
      : undefined;

  return {
    adapterContractId,
    allowedFuturePayloadSummary: requestShape?.safePayloadSummary ?? [
      "selected ticker",
      "side",
      "quantity",
      "limit price",
      "request kind",
      "dry-run id",
      "bridge checkpoint id",
      "approval runbook id",
    ],
    approvalRunbookId: input.approvalRunbook?.runbookId,
    blockedReasons,
    checkpointId: input.bridgeReadinessCheckpoint?.checkpointId,
    createdAt,
    disabledStopReason:
      "disabled_contract_only_invocation_boundary_locked_canInvokeTargetNow_false",
    dryRunId: input.modelOnlyDryRunReport?.dryRunId,
    forbiddenPayload: [...forbiddenPayloadFields],
    gates: buildGates(designOnlyApprovalPresent),
    label: details.label,
    reason: details.reason,
    requestShape,
    safetyFlags: safetyFlags(),
    status,
    target,
    warnings,
  };
}
