import type {
  AvanzaHeadlessExecutionArchitectureCheckpoint,
} from "./avanza-headless-execution-architecture-checkpoint";
import type {
  AvanzaLocalDevBridgeContract,
} from "./avanza-local-dev-bridge-contract";

export type AvanzaLocalDevBridgeActivationChecklistStatus =
  | "not_started"
  | "ready_for_manual_review"
  | "approved_for_disabled_runner_design"
  | "blocked_missing_prerequisites"
  | "blocked_safety_risk"
  | "blocked_for_real_execution"
  | "forbidden"
  | "unknown";

export type AvanzaLocalDevBridgeActivationChecklistItemStatus =
  | "pending"
  | "passed"
  | "failed"
  | "blocked"
  | "forbidden"
  | "not_applicable"
  | "unknown";

export type AvanzaLocalDevBridgeActivationApprovalLevel =
  | "none"
  | "manual_review_only"
  | "approved_for_disabled_runner_design"
  | "approved_for_model_only_dry_run"
  | "real_run_forbidden"
  | "unknown";

export type AvanzaLocalDevBridgeActivationApprovalGateStatus =
  | "locked"
  | "review_required"
  | "approved_for_disabled_design"
  | "modeled_only"
  | "forbidden"
  | "unknown";

export type AvanzaLocalDevBridgeActivationChecklistItem = {
  itemId: string;
  status: AvanzaLocalDevBridgeActivationChecklistItemStatus;
  label: string;
  purpose: string;
  required: boolean;
  evidenceRequired: string[];
  evidenceForbidden: string[];
  passedBy: string[];
  blockedReason?: string;
  warning?: string;
};

export type AvanzaLocalDevBridgeActivationApprovalGate = {
  gateId: string;
  status: AvanzaLocalDevBridgeActivationApprovalGateStatus;
  label: string;
  purpose: string;
  currentlyAllows: string[];
  currentlyBlocks: string[];
  unlockRequires: string[];
  forbiddenActions: string[];
};

export type AvanzaLocalDevBridgeActivationSafetyFlags = {
  checklistOnly: true;
  headlessOnly: true;
  visibleInUi: false;
  canApproveDisabledRunnerDesign: boolean;
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

export type AvanzaLocalDevBridgeActivationChecklistInput = {
  checklistId?: string;
  bridgeContract?: AvanzaLocalDevBridgeContract;
  architectureCheckpoint?: AvanzaHeadlessExecutionArchitectureCheckpoint;
  operatorReviewed?: boolean;
  safetyReviewed?: boolean;
  envOptInDocumented?: boolean;
  manualTerminalConfirmationDocumented?: boolean;
  realRunFlagDocumented?: boolean;
  credentialProviderReviewed?: boolean;
  cookieSessionPolicyReviewed?: boolean;
  bankIdPolicyReviewed?: boolean;
  finalClickPolicyReviewed?: boolean;
  orderSubmitPolicyReviewed?: boolean;
  supabaseWritePolicyReviewed?: boolean;
  disabledRunnerDesignRequested?: boolean;
  now?: string;
};

export type AvanzaLocalDevBridgeActivationChecklist = {
  checklistId: string;
  createdAt: string;
  status: AvanzaLocalDevBridgeActivationChecklistStatus;
  label: string;
  summary: string;
  approvalLevel: AvanzaLocalDevBridgeActivationApprovalLevel;
  items: AvanzaLocalDevBridgeActivationChecklistItem[];
  approvalGates: AvanzaLocalDevBridgeActivationApprovalGate[];
  readyForDisabledRunnerDesign: boolean;
  readyForModelOnlyDryRun: false;
  readyForRealRun: false;
  warnings: string[];
  blockedReasons: string[];
  nextRecommendedAction: string;
  safetyFlags: AvanzaLocalDevBridgeActivationSafetyFlags;
};

const defaultCreatedAt = "2026-07-07T12:00:00.000Z";

const requiredPolicyReviewKeys = [
  "operatorReviewed",
  "safetyReviewed",
  "credentialProviderReviewed",
  "cookieSessionPolicyReviewed",
  "bankIdPolicyReviewed",
  "finalClickPolicyReviewed",
  "orderSubmitPolicyReviewed",
  "supabaseWritePolicyReviewed",
  "disabledRunnerDesignRequested",
] as const;

const forbiddenRuntimeActions = [
  "open local-dev bridge runtime",
  "invoke smoke runner",
  "import terminal script",
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
];

function item(
  itemId: string,
  status: AvanzaLocalDevBridgeActivationChecklistItemStatus,
  label: string,
  purpose: string,
  evidenceRequired: string[],
  passedBy: string[] = [],
  blockedReason?: string,
  warning?: string,
): AvanzaLocalDevBridgeActivationChecklistItem {
  return {
    blockedReason,
    evidenceForbidden: forbiddenRuntimeActions,
    evidenceRequired,
    itemId,
    label,
    passedBy,
    purpose,
    required: true,
    status,
    warning,
  };
}

function reviewedStatus(value: boolean | undefined) {
  return value === true ? "passed" : "pending";
}

function requiredReviewItem(
  itemId: string,
  label: string,
  purpose: string,
  reviewed: boolean | undefined,
  evidenceRequired: string[],
  blockedReason: string,
) {
  return item(
    itemId,
    reviewedStatus(reviewed),
    label,
    purpose,
    evidenceRequired,
    reviewed === true ? ["explicit checklist input"] : [],
    reviewed === true ? undefined : blockedReason,
  );
}

function gate(
  gateId: string,
  status: AvanzaLocalDevBridgeActivationApprovalGateStatus,
  label: string,
  purpose: string,
  currentlyAllows: string[],
  currentlyBlocks: string[],
  unlockRequires: string[],
  forbiddenActions: string[],
): AvanzaLocalDevBridgeActivationApprovalGate {
  return {
    currentlyAllows,
    currentlyBlocks,
    forbiddenActions,
    gateId,
    label,
    purpose,
    status,
    unlockRequires,
  };
}

function allRequiredDesignApprovalsPresent(
  input: AvanzaLocalDevBridgeActivationChecklistInput,
) {
  return requiredPolicyReviewKeys.every((key) => input[key] === true);
}

function hasUnsafeBridgeContract(input: AvanzaLocalDevBridgeActivationChecklistInput) {
  const flags = input.bridgeContract?.safetyFlags;

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

function hasUnsafeArchitectureCheckpoint(
  input: AvanzaLocalDevBridgeActivationChecklistInput,
) {
  const flags = input.architectureCheckpoint?.safetyFlags;

  return Boolean(
    flags &&
      (flags.canStartHandoff ||
        flags.canPrepareOrderNow ||
        flags.canRunSmokeTestFromUi ||
        flags.canCallApiRoute ||
        flags.canFetch ||
        flags.canPoll ||
        flags.canUseBrowserAutomationNow ||
        flags.canAccessCredentials ||
        flags.canReadCookies ||
        flags.canExportSession ||
        flags.canAutomateBankId ||
        flags.canExecute ||
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

function safetyFlags(
  canApproveDisabledRunnerDesign: boolean,
): AvanzaLocalDevBridgeActivationSafetyFlags {
  return {
    canAccessCredentials: false,
    canApproveDisabledRunnerDesign,
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
    checklistOnly: true,
    controlsEnabled: false,
    finalHumanClickRequired: true,
    gateLocked: true,
    headlessOnly: true,
    userMustConfirm: true,
    visibleInUi: false,
  };
}

export function buildAvanzaLocalDevBridgeActivationChecklist(
  input: AvanzaLocalDevBridgeActivationChecklistInput = {},
): AvanzaLocalDevBridgeActivationChecklist {
  const checklistId =
    input.checklistId ?? "avanza-local-dev-bridge-activation-checklist";
  const createdAt = input.now ?? defaultCreatedAt;
  const warnings: string[] = [
    "Disabled runner design approval is not runtime approval.",
    "Model-only dry-run is not approved by this checklist phase.",
    "Real-run remains forbidden.",
  ];
  const blockedReasons: string[] = [];
  const hasBridgeContract = Boolean(input.bridgeContract);
  const hasArchitectureCheckpoint = Boolean(input.architectureCheckpoint);

  if (!hasBridgeContract) {
    blockedReasons.push("Local-dev bridge contract is required.");
  }
  if (!hasArchitectureCheckpoint) {
    blockedReasons.push("Headless execution architecture checkpoint is required.");
  }
  if (hasUnsafeBridgeContract(input)) {
    blockedReasons.push("Bridge contract exposes a forbidden runtime capability.");
  }
  if (hasUnsafeArchitectureCheckpoint(input)) {
    blockedReasons.push(
      "Architecture checkpoint exposes a forbidden runtime capability.",
    );
  }
  if (input.architectureCheckpoint?.status === "blocked_for_real_execution") {
    blockedReasons.push("Architecture checkpoint blocks real execution.");
  }
  if (input.architectureCheckpoint?.status === "blocked_for_production") {
    blockedReasons.push("Architecture checkpoint blocks production readiness.");
  }

  const allDesignApprovalsPresent = allRequiredDesignApprovalsPresent(input);
  const missingCriticalReviews = requiredPolicyReviewKeys
    .filter((key) => input[key] !== true)
    .map((key) => `${key} is required for disabled runner design approval.`);

  const canApproveDisabledRunnerDesign =
    hasBridgeContract &&
    hasArchitectureCheckpoint &&
    input.architectureCheckpoint?.status !== "blocked_for_real_execution" &&
    input.architectureCheckpoint?.status !== "blocked_for_production" &&
    !hasUnsafeBridgeContract(input) &&
    !hasUnsafeArchitectureCheckpoint(input) &&
    allDesignApprovalsPresent;

  let status: AvanzaLocalDevBridgeActivationChecklistStatus = "not_started";
  let approvalLevel: AvanzaLocalDevBridgeActivationApprovalLevel = "none";
  let label = "Local-dev bridge activation checklist not started";
  let summary =
    "Checklist is waiting for bridge contract and architecture checkpoint inputs.";
  let nextRecommendedAction =
    "Provide the bridge contract and architecture checkpoint, then complete manual review.";

  if (input.architectureCheckpoint?.status === "blocked_for_real_execution") {
    status = "blocked_for_real_execution";
    approvalLevel = "real_run_forbidden";
    label = "Local-dev bridge activation checklist blocks real execution";
    summary = "The architecture checkpoint explicitly blocks real execution.";
    nextRecommendedAction =
      "Keep real-run forbidden and continue with review-only design boundaries.";
  } else if (input.architectureCheckpoint?.status === "blocked_for_production") {
    status = "forbidden";
    approvalLevel = "real_run_forbidden";
    label = "Local-dev bridge activation checklist forbids production readiness";
    summary = "Production readiness remains forbidden for this bridge checklist.";
    nextRecommendedAction =
      "Keep production readiness blocked and do not open bridge runtime.";
  } else if (hasUnsafeBridgeContract(input) || hasUnsafeArchitectureCheckpoint(input)) {
    status = "blocked_safety_risk";
    approvalLevel = "real_run_forbidden";
    label = "Local-dev bridge activation checklist blocked by safety risk";
    summary = "A supplied model exposes a forbidden runtime capability.";
    nextRecommendedAction =
      "Keep the bridge gate closed and remove the unsafe capability before design review.";
  } else if (!hasBridgeContract || !hasArchitectureCheckpoint) {
    status = "blocked_missing_prerequisites";
    approvalLevel = "none";
    label = "Local-dev bridge activation checklist missing prerequisites";
    summary =
      "Bridge contract and architecture checkpoint must exist before manual review.";
  } else if (canApproveDisabledRunnerDesign) {
    status = "approved_for_disabled_runner_design";
    approvalLevel = "approved_for_disabled_runner_design";
    label = "Approved for disabled bridge runner design";
    summary =
      "Manual and safety reviews approve designing a disabled runner only; runtime remains locked.";
    nextRecommendedAction =
      "Design a disabled bridge runner separately without opening runtime, invoking smoke runners, or accessing credentials.";
  } else {
    status = "ready_for_manual_review";
    approvalLevel = "manual_review_only";
    label = "Ready for manual review";
    summary =
      "Bridge contract and architecture checkpoint exist; critical reviews are still required before disabled runner design.";
    nextRecommendedAction =
      "Complete operator, safety, credential, cookie/session, BankID, final-click, order-submit, and Supabase policy reviews.";
  }

  if (input.disabledRunnerDesignRequested === true && !canApproveDisabledRunnerDesign) {
    blockedReasons.push(...missingCriticalReviews);
  }

  const prerequisiteEvidence = [
    "model exists",
    "no runtime invocation",
    "gate remains locked",
  ];

  const items = [
    item(
      "architecture_checkpoint_reviewed",
      hasArchitectureCheckpoint ? "passed" : "pending",
      "Architecture checkpoint reviewed",
      "Confirm the headless architecture checkpoint exists and keeps execution locked.",
      prerequisiteEvidence,
      hasArchitectureCheckpoint ? ["architecture checkpoint input"] : [],
      hasArchitectureCheckpoint ? undefined : "Architecture checkpoint is missing.",
    ),
    item(
      "local_dev_bridge_contract_reviewed",
      hasBridgeContract ? "passed" : "pending",
      "Local-dev bridge contract reviewed",
      "Confirm the bridge contract exists and does not open runtime.",
      prerequisiteEvidence,
      hasBridgeContract ? ["bridge contract input"] : [],
      hasBridgeContract ? undefined : "Local-dev bridge contract is missing.",
    ),
    item(
      "orchestration_report_shape_reviewed",
      hasBridgeContract ? "passed" : "pending",
      "Orchestration report shape reviewed",
      "Confirm the orchestration-to-smoke request candidate shape is review-only.",
      ["orchestration report shape", "request candidate shape"],
      hasBridgeContract ? ["bridge contract input"] : [],
      hasBridgeContract ? undefined : "Bridge contract is required first.",
    ),
    item(
      "smoke_runner_invocation_remains_blocked",
      "passed",
      "Smoke runner invocation remains blocked",
      "Confirm no smoke runner can be invoked now.",
      ["canInvokeSmokeRunnerNow false"],
      ["hard safety flags"],
    ),
    item(
      "terminal_only_future_path_confirmed",
      "passed",
      "Terminal-only future path confirmed",
      "Confirm any future path stays terminal-only and separately approved.",
      ["terminal-only future path"],
      ["bridge contract gates"],
    ),
    requiredReviewItem(
      "env_opt_in_requirement_documented",
      "Env opt-in requirement documented",
      "Record the later requirement for explicit environment opt-in.",
      input.envOptInDocumented,
      ["env opt-in required"],
      "Env opt-in requirement is not documented.",
    ),
    requiredReviewItem(
      "manual_terminal_confirmation_requirement_documented",
      "Manual terminal confirmation requirement documented",
      "Record the later requirement for manual terminal confirmation.",
      input.manualTerminalConfirmationDocumented,
      ["manual terminal confirmation required"],
      "Manual terminal confirmation requirement is not documented.",
    ),
    requiredReviewItem(
      "separate_real_run_flag_requirement_documented",
      "Separate real-run flag requirement documented",
      "Record the later requirement for a separate real-run flag.",
      input.realRunFlagDocumented,
      ["separate real-run flag required"],
      "Separate real-run flag requirement is not documented.",
    ),
    item(
      "browser_automation_remains_locked",
      "passed",
      "Browser automation remains locked",
      "Confirm browser automation cannot start now.",
      ["canUseBrowserAutomationNow false"],
      ["hard safety flags"],
    ),
    requiredReviewItem(
      "credential_provider_policy_reviewed",
      "Credential provider policy reviewed",
      "Confirm credential access remains blocked and values are never exposed.",
      input.credentialProviderReviewed,
      ["canAccessCredentials false"],
      "Credential provider policy review is missing.",
    ),
    requiredReviewItem(
      "cookie_session_forbidden_policy_reviewed",
      "Cookie/session forbidden policy reviewed",
      "Confirm cookies and session export remain forbidden.",
      input.cookieSessionPolicyReviewed,
      ["canReadCookies false", "canExportSession false"],
      "Cookie/session policy review is missing.",
    ),
    requiredReviewItem(
      "bankid_policy_reviewed",
      "BankID automation forbidden/manual-only policy reviewed",
      "Confirm BankID automation or bypass is forbidden and manual-only.",
      input.bankIdPolicyReviewed,
      ["canAutomateBankId false"],
      "BankID policy review is missing.",
    ),
    requiredReviewItem(
      "order_submission_policy_reviewed",
      "Order submission forbidden policy reviewed",
      "Confirm agent order submission remains forbidden.",
      input.orderSubmitPolicyReviewed,
      ["canSubmitOrder false"],
      "Order submission policy review is missing.",
    ),
    requiredReviewItem(
      "final_kop_salj_policy_reviewed",
      "Final KOP/SALJ human-only policy reviewed",
      "Confirm final KOP/SALJ remains human-only.",
      input.finalClickPolicyReviewed,
      ["canClickFinalBuy false", "canClickFinalSell false"],
      "Final click policy review is missing.",
    ),
    requiredReviewItem(
      "supabase_write_policy_reviewed",
      "Supabase write locked policy reviewed",
      "Confirm Supabase writes remain locked.",
      input.supabaseWritePolicyReviewed,
      ["canWriteSupabase false"],
      "Supabase write policy review is missing.",
    ),
    item(
      "trade_ui_execution_remains_locked",
      "passed",
      "Trade UI execution remains locked",
      "Confirm the checklist adds no visible Trade UI execution path.",
      ["visibleInUi false", "controlsEnabled false"],
      ["hard safety flags"],
    ),
    item(
      "api_route_execution_remains_locked",
      "passed",
      "API route execution remains locked",
      "Confirm no API route call is allowed.",
      ["canCallApiRoute false"],
      ["hard safety flags"],
    ),
    item(
      "ui_simplicity_remains_protected",
      "passed",
      "UI simplicity remains protected",
      "Confirm the Ture UI remains minimal and visually simple.",
      ["hidden under the surface", "agent-readable"],
      ["dev QA harness copy"],
    ),
    item(
      "production_readiness_remains_blocked",
      "forbidden",
      "Production readiness remains blocked",
      "Confirm this checklist cannot claim production readiness.",
      ["canClaimProductionReady false"],
      ["hard safety flags"],
      "Production readiness is forbidden.",
    ),
  ];

  const approvalGates = [
    gate(
      "manual_review_gate",
      input.operatorReviewed === true ? "modeled_only" : "review_required",
      "Manual review gate",
      "Requires explicit operator review before disabled runner design approval.",
      input.operatorReviewed === true ? ["manual review record"] : [],
      ["runtime activation", "smoke runner invocation"],
      ["operatorReviewed true"],
      forbiddenRuntimeActions,
    ),
    gate(
      "disabled_runner_design_gate",
      canApproveDisabledRunnerDesign ? "approved_for_disabled_design" : "locked",
      "Disabled runner design gate",
      "Allows only future disabled runner design when every critical review is present.",
      canApproveDisabledRunnerDesign ? ["disabled runner design review"] : [],
      ["runtime bridge opening", "smoke runner invocation"],
      requiredPolicyReviewKeys.map((key) => `${key} true`),
      forbiddenRuntimeActions,
    ),
    gate(
      "model_only_dry_run_gate",
      "locked",
      "Model-only dry-run gate",
      "Model-only dry-run is not approved in this task.",
      [],
      ["model-only dry-run invocation"],
      ["separate future approval"],
      forbiddenRuntimeActions,
    ),
    gate(
      "real_run_gate",
      "forbidden",
      "Real-run gate",
      "Real-run remains forbidden and requires a separate future phase.",
      [],
      ["real local-dev run", "browser automation", "credential access"],
      ["separate explicit activation task"],
      forbiddenRuntimeActions,
    ),
    gate(
      "bridge_runtime_gate",
      "locked",
      "Bridge runtime gate",
      "Keeps the local-dev bridge runtime closed.",
      [],
      ["open local-dev bridge gate"],
      ["separate runtime activation approval"],
      forbiddenRuntimeActions,
    ),
  ];

  return {
    approvalGates,
    approvalLevel,
    blockedReasons,
    checklistId,
    createdAt,
    items,
    label,
    nextRecommendedAction,
    readyForDisabledRunnerDesign: status === "approved_for_disabled_runner_design",
    readyForModelOnlyDryRun: false,
    readyForRealRun: false,
    safetyFlags: safetyFlags(canApproveDisabledRunnerDesign),
    status,
    summary,
    warnings,
  };
}
