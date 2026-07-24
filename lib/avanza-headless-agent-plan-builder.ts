import type {
  AvanzaHeadlessExecutionContract,
  AvanzaHeadlessExecutionContractIntent,
  AvanzaHeadlessExecutionContractOrderType,
  AvanzaHeadlessExecutionContractSide,
  AvanzaHeadlessExecutionContractSource,
} from "./avanza-headless-execution-data-contract";
import type {
  AvanzaHeadlessExecutionContractCandidate,
  AvanzaHeadlessExecutionContractSelectorMode,
  AvanzaHeadlessExecutionContractSelectorResult,
} from "./avanza-headless-execution-contract-selector";

export type AvanzaHeadlessAgentPlanStatus =
  | "ready_plan"
  | "missing_selected_contract"
  | "selected_contract_blocked"
  | "incomplete_contract"
  | "unsafe_contract"
  | "blocked"
  | "unknown";

export type AvanzaHeadlessAgentPlanStepType =
  | "validate_selected_contract"
  | "verify_profile_readiness"
  | "plan_login_if_needed"
  | "avoid_bankid"
  | "search_instrument"
  | "verify_instrument_identity"
  | "open_buy_sell_entry"
  | "prepare_limit_order_fields"
  | "verify_order_review"
  | "stop_before_final_confirmation"
  | "wait_for_user_final_click"
  | "capture_broker_result_later"
  | "plan_settlement_reconciliation"
  | "stop";

export type AvanzaHeadlessAgentPlanStepStatus =
  | "planned"
  | "blocked"
  | "skipped"
  | "forbidden"
  | "manual_required"
  | "unknown";

export type AvanzaHeadlessAgentPlanCustomerType =
  | "private"
  | "company"
  | "unknown";

export type AvanzaHeadlessAgentPlanSafetyFlags = {
  planOnly: true;
  headlessOnly: true;
  visibleInUi: false;
  canStartHandoff: false;
  canPrepareOrderNow: false;
  canRunSmokeTestFromUi: false;
  canCallApiRoute: false;
  canFetch: false;
  canPoll: false;
  canUseBrowserAutomationNow: false;
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

export type AvanzaHeadlessAgentPlanStep = {
  stepId: string;
  type: AvanzaHeadlessAgentPlanStepType;
  status: AvanzaHeadlessAgentPlanStepStatus;
  label: string;
  reason: string;
  agentInstruction: string;
  userVisible: false;
  requiresHuman: boolean;
  forbidden: boolean;
  stopCondition?: string;
  safeToExecuteLater: boolean;
  expectedInput?: string;
  expectedOutput?: string;
};

export type AvanzaHeadlessAgentPlan = {
  planId: string;
  createdAt: string;
  status: AvanzaHeadlessAgentPlanStatus;
  label: string;
  reason: string;
  source: AvanzaHeadlessExecutionContractSource;
  intent: AvanzaHeadlessExecutionContractIntent;
  ticker?: string;
  side?: AvanzaHeadlessExecutionContractSide;
  quantity?: number;
  limitPrice?: number;
  orderType?: AvanzaHeadlessExecutionContractOrderType;
  selectedContractId?: string;
  selectorId?: string;
  profileReady: boolean;
  loginKnown: boolean;
  customerType: AvanzaHeadlessAgentPlanCustomerType;
  steps: AvanzaHeadlessAgentPlanStep[];
  forbiddenActions: string[];
  manualRequirements: string[];
  agentReadableSummary: string;
  settlementExpectation?: string;
  warnings: string[];
  blockedReasons: string[];
  safetyFlags: AvanzaHeadlessAgentPlanSafetyFlags;
};

export type AvanzaHeadlessAgentPlanBuilderInput = {
  selectedContract?:
    | AvanzaHeadlessExecutionContract
    | AvanzaHeadlessExecutionContractCandidate;
  selectorResult?: AvanzaHeadlessExecutionContractSelectorResult;
  profileReady?: boolean;
  loginKnown?: boolean;
  customerType?: AvanzaHeadlessAgentPlanCustomerType;
  mode?: AvanzaHeadlessExecutionContractSelectorMode;
  now?: string;
};

const defaultCreatedAt = "2026-07-06T12:00:00.000Z";

export const avanzaHeadlessAgentPlanSafetyFlags:
  AvanzaHeadlessAgentPlanSafetyFlags = {
    planOnly: true,
    headlessOnly: true,
    visibleInUi: false,
    canStartHandoff: false,
    canPrepareOrderNow: false,
    canRunSmokeTestFromUi: false,
    canCallApiRoute: false,
    canFetch: false,
    canPoll: false,
    canUseBrowserAutomationNow: false,
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

const forbiddenActions = [
  "submit_order",
  "click_final_buy",
  "click_final_sell",
  "automate_bankid",
  "read_cookies",
  "export_session",
  "store_raw_credentials",
  "write_supabase_execution",
  "call_trade_ui_execution",
  "call_disabled_api_route",
] as const;

const manualRequirements = [
  "user_final_buy_sell_click",
  "user_bankid_if_avanza_requires_it",
  "user_review_order_details",
] as const;

function isCandidate(
  value: AvanzaHeadlessAgentPlanBuilderInput["selectedContract"],
): value is AvanzaHeadlessExecutionContractCandidate {
  return (
    typeof value === "object" &&
    value !== null &&
    "candidateId" in value &&
    "contract" in value &&
    "priorityReason" in value
  );
}

function selectedContractFromInput(input: AvanzaHeadlessAgentPlanBuilderInput) {
  const selected =
    input.selectedContract ?? input.selectorResult?.selectedCandidate;

  if (!selected) return undefined;

  return isCandidate(selected) ? selected.contract : selected;
}

function hasUnsafeContractFlags(contract: AvanzaHeadlessExecutionContract) {
  return (
    contract.safetyFlags.visibleInUi ||
    contract.safetyFlags.canStartHandoff ||
    contract.safetyFlags.canPrepareOrder ||
    contract.safetyFlags.canRunSmokeTestFromUi ||
    contract.safetyFlags.canCallApiRoute ||
    contract.safetyFlags.canFetch ||
    contract.safetyFlags.canPoll ||
    contract.safetyFlags.canUseBrowserAutomation ||
    contract.safetyFlags.canAccessCredentials ||
    contract.safetyFlags.canReadCookies ||
    contract.safetyFlags.canExportSession ||
    contract.safetyFlags.canAutomateBankId ||
    contract.safetyFlags.canSubmitOrder ||
    contract.safetyFlags.canClickFinalBuy ||
    contract.safetyFlags.canClickFinalSell ||
    contract.safetyFlags.canWriteSupabase ||
    contract.safetyFlags.canClaimProductionReady ||
    contract.safetyFlags.controlsEnabled ||
    !contract.safetyFlags.gateLocked ||
    !contract.safetyFlags.userMustConfirm ||
    !contract.safetyFlags.finalHumanClickRequired
  );
}

function classifyContract(
  contract: AvanzaHeadlessExecutionContract | undefined,
  mode: AvanzaHeadlessExecutionContractSelectorMode,
): { status: AvanzaHeadlessAgentPlanStatus; blockedReasons: string[] } {
  if (!contract) {
    return {
      blockedReasons: ["No selected headless execution contract was provided."],
      status: "missing_selected_contract",
    };
  }

  const blockedReasons = [...contract.blockers];

  if (mode === "automatic_forbidden") {
    blockedReasons.push("Automatic execution mode is forbidden.");
    return { blockedReasons, status: "blocked" };
  }
  if (hasUnsafeContractFlags(contract)) {
    blockedReasons.push("Selected contract contains unsafe safety flags.");
    return { blockedReasons, status: "unsafe_contract" };
  }
  if (contract.orderType === "market_forbidden") {
    blockedReasons.push("Market orders are forbidden.");
    return { blockedReasons, status: "unsafe_contract" };
  }
  if (
    contract.status === "missing_ticker" ||
    contract.status === "missing_side" ||
    contract.status === "missing_quantity" ||
    contract.status === "missing_limit_price" ||
    contract.status === "incomplete_trade_package" ||
    contract.status === "unknown"
  ) {
    blockedReasons.push(...contract.missingFields.map((field) => `Missing ${field}.`));
    return { blockedReasons, status: "incomplete_contract" };
  }
  if (contract.status === "blocked" || blockedReasons.length > 0) {
    return { blockedReasons, status: "selected_contract_blocked" };
  }
  if (!contract.canBeUsedByAgentLater) {
    blockedReasons.push("Selected contract cannot be used by a future agent.");
    return { blockedReasons, status: "selected_contract_blocked" };
  }
  if (contract.status === "ready_headless" || contract.status === "local_dev_only") {
    return { blockedReasons, status: "ready_plan" };
  }

  return { blockedReasons, status: "unknown" };
}

function statusDetails(status: AvanzaHeadlessAgentPlanStatus) {
  if (status === "ready_plan") {
    return {
      label: "Headless Avanza agent plan ready",
      reason:
        "A selected UI-hidden execution contract can be converted into a future preparation plan.",
    };
  }
  if (status === "missing_selected_contract") {
    return {
      label: "Missing selected contract",
      reason: "No selected execution contract was provided to the plan builder.",
    };
  }
  if (status === "selected_contract_blocked") {
    return {
      label: "Selected contract blocked",
      reason: "The selected execution contract is blocked for future agent planning.",
    };
  }
  if (status === "incomplete_contract") {
    return {
      label: "Incomplete selected contract",
      reason: "The selected execution contract is missing required limit-order fields.",
    };
  }
  if (status === "unsafe_contract") {
    return {
      label: "Unsafe selected contract",
      reason: "The selected execution contract contains forbidden order or safety state.",
    };
  }
  if (status === "blocked") {
    return {
      label: "Headless agent plan blocked",
      reason: "Plan mode or safety gates block future agent planning.",
    };
  }

  return {
    label: "Headless agent plan unknown",
    reason: "Plan input could not be classified.",
  };
}

function step(
  index: number,
  type: AvanzaHeadlessAgentPlanStepType,
  status: AvanzaHeadlessAgentPlanStepStatus,
  label: string,
  reason: string,
  agentInstruction: string,
  options: Partial<
    Pick<
      AvanzaHeadlessAgentPlanStep,
      | "expectedInput"
      | "expectedOutput"
      | "forbidden"
      | "requiresHuman"
      | "safeToExecuteLater"
      | "stopCondition"
    >
  > = {},
): AvanzaHeadlessAgentPlanStep {
  const forbidden = options.forbidden ?? status === "forbidden";
  const requiresHuman =
    options.requiresHuman ?? status === "manual_required";

  return {
    agentInstruction,
    expectedInput: options.expectedInput,
    expectedOutput: options.expectedOutput,
    forbidden,
    label,
    reason,
    requiresHuman,
    safeToExecuteLater:
      options.safeToExecuteLater ?? (!forbidden && status === "planned"),
    status,
    stepId: `step-${String(index).padStart(2, "0")}-${type}`,
    stopCondition: options.stopCondition,
    type,
    userVisible: false,
  };
}

function loginInstruction(customerType: AvanzaHeadlessAgentPlanCustomerType) {
  if (customerType === "company") {
    return "Plan company login readiness through username/password path only; BankID remains user/manual-only if required.";
  }
  if (customerType === "private") {
    return "Plan private customer login readiness through username/password path only; BankID remains user/manual-only if required.";
  }

  return "Plan login readiness through username/password path only after customer type is known; BankID remains user/manual-only if required.";
}

function buildSteps(input: {
  contract?: AvanzaHeadlessExecutionContract;
  status: AvanzaHeadlessAgentPlanStatus;
  profileReady: boolean;
  loginKnown: boolean;
  customerType: AvanzaHeadlessAgentPlanCustomerType;
}) {
  const { contract, customerType, loginKnown, profileReady, status } = input;
  const ready = status === "ready_plan" && contract;
  const routeLabel = contract?.intent === "exit_sell" ? "SELL" : "BUY";
  const blocked = status !== "ready_plan";
  let index = 1;

  return [
    step(
      index++,
      "validate_selected_contract",
      blocked ? "blocked" : "planned",
      "Validate selected contract",
      ready
        ? "Selected contract is eligible for future agent planning."
        : "Selected contract is not eligible for future agent planning.",
      "Confirm the selector result contains one eligible headless contract before planning any future Avanza preparation.",
      {
        expectedInput: contract?.contractId ?? "selected headless contract",
        expectedOutput: ready ? "eligible selected contract" : "blocked plan",
        safeToExecuteLater: Boolean(ready),
      },
    ),
    step(
      index++,
      "verify_profile_readiness",
      profileReady ? "planned" : "planned",
      "Verify Avanza profile readiness",
      profileReady
        ? "Profile readiness is modeled as complete."
        : "Profile readiness is incomplete and must be checked before any future run.",
      "Verify the Avanza execution profile, account label, order defaults, and safety boundaries before future local-dev use.",
      {
        expectedOutput: profileReady
          ? "profile readiness confirmed"
          : "profile incomplete warning",
        safeToExecuteLater: Boolean(ready),
      },
    ),
    step(
      index++,
      "plan_login_if_needed",
      "planned",
      "Plan login if needed",
      loginKnown
        ? "Login state is known for planning."
        : "Login state is unknown; plan a username/password path only.",
      loginInstruction(customerType),
      {
        expectedInput: "customer type and login state",
        expectedOutput: loginKnown ? "login known plan" : "login unknown plan",
        safeToExecuteLater: Boolean(ready),
      },
    ),
    step(
      index++,
      "avoid_bankid",
      "forbidden",
      "Avoid BankID automation",
      "BankID automation and bypass remain forbidden; any BankID requirement is manual user action only.",
      "Do not automate, bypass, intercept, export, or store BankID/session state.",
      {
        forbidden: true,
        requiresHuman: true,
        safeToExecuteLater: false,
        stopCondition: "Stop if Avanza requires BankID or MFA; wait for manual user action.",
      },
    ),
    step(
      index++,
      "search_instrument",
      ready ? "planned" : "skipped",
      "Plan instrument search",
      ready
        ? `Search for ${contract.ticker} using future local-dev browser action contracts only.`
        : "Instrument search is skipped because no ready selected contract exists.",
      "Plan instrument search through the modeled instrument search contract; do not call APIs or browser automation now.",
      {
        expectedInput: contract?.ticker,
        expectedOutput: "instrument search candidate",
        safeToExecuteLater: Boolean(ready),
      },
    ),
    step(
      index++,
      "verify_instrument_identity",
      ready ? "planned" : "skipped",
      "Plan instrument identity verification",
      ready
        ? "Instrument identity verification is required before preparing any order fields."
        : "Instrument identity verification is skipped until a ready contract exists.",
      "Compare ticker, instrument name, ISIN, and market place where available before continuing.",
      {
        expectedInput: [contract?.ticker, contract?.isin, contract?.marketPlace]
          .filter(Boolean)
          .join(", "),
        expectedOutput: "verified instrument identity",
        safeToExecuteLater: Boolean(ready),
      },
    ),
    step(
      index++,
      "open_buy_sell_entry",
      ready ? "planned" : "skipped",
      `Plan ${routeLabel} entry route`,
      ready
        ? `Plan the ${routeLabel} entry route for the selected contract.`
        : "BUY/SELL entry route is skipped until a ready contract exists.",
      `Plan opening the ${routeLabel} entry route only in a future approved local-dev executor.`,
      {
        expectedInput: contract?.side,
        expectedOutput: `${routeLabel} order ticket route planned`,
        safeToExecuteLater: Boolean(ready),
      },
    ),
    step(
      index++,
      "prepare_limit_order_fields",
      ready && contract.orderType === "limit" ? "planned" : "blocked",
      "Plan limit order field preparation",
      ready && contract.orderType === "limit"
        ? "Limit order fields can be planned from the selected contract."
        : "Only complete limit orders are allowed.",
      "Plan quantity and limit price field preparation only; do not prepare fields now.",
      {
        expectedInput: ready
          ? `quantity ${contract.quantity}, limit ${contract.limitPrice}`
          : "complete limit-order contract",
        expectedOutput: "limit order field plan",
        safeToExecuteLater: Boolean(ready && contract.orderType === "limit"),
      },
    ),
    step(
      index++,
      "verify_order_review",
      ready ? "manual_required" : "skipped",
      "Plan review verification",
      "The user must review broker order details before final confirmation.",
      "Plan a future review checkpoint that compares side, ticker, quantity, limit price, and account label before stopping.",
      {
        requiresHuman: true,
        safeToExecuteLater: false,
      },
    ),
    step(
      index++,
      "stop_before_final_confirmation",
      "manual_required",
      "Stop before final confirmation",
      "The agent must stop before final broker confirmation.",
      "Stop at review/final confirmation and do not press final KÖP/SÄLJ.",
      {
        requiresHuman: true,
        safeToExecuteLater: false,
        stopCondition: "Broker final confirmation screen reached.",
      },
    ),
    step(
      index++,
      "wait_for_user_final_click",
      "manual_required",
      "Wait for user final click",
      "Final KÖP/SÄLJ remains human-only.",
      "Wait for the user to manually press final KÖP/SÄLJ; never click it as the agent.",
      {
        requiresHuman: true,
        safeToExecuteLater: false,
        stopCondition: "User completes or cancels final broker confirmation.",
      },
    ),
    step(
      index++,
      "capture_broker_result_later",
      ready ? "planned" : "skipped",
      "Plan future broker result capture",
      "Broker result capture is planned for a later approved read-only flow.",
      "Plan future result capture only after user action and only through a separately approved flow.",
      {
        expectedOutput: "future broker result capture expectation",
        safeToExecuteLater: false,
      },
    ),
    step(
      index++,
      "plan_settlement_reconciliation",
      ready ? "planned" : "skipped",
      "Plan settlement reconciliation",
      "Settlement reconciliation is planned for the later avräkningsnota flow.",
      "Plan later avräkningsnota reconciliation without writing Supabase execution records in this task.",
      {
        expectedOutput: "settlement reconciliation expectation",
        safeToExecuteLater: false,
      },
    ),
    step(
      index++,
      "stop",
      "manual_required",
      "Stop plan",
      "Plan ends before any execution, API call, browser automation, credential access, final click, order submission, or Supabase write.",
      "Stop. This plan is agent-readable only and not executable now.",
      {
        requiresHuman: true,
        safeToExecuteLater: false,
        stopCondition: "Planning complete.",
      },
    ),
  ];
}

export function buildAvanzaHeadlessAgentPlan(
  input: AvanzaHeadlessAgentPlanBuilderInput = {},
): AvanzaHeadlessAgentPlan {
  const createdAt = input.now?.trim() || defaultCreatedAt;
  const mode = input.mode ?? "semi_auto";
  const selectedContract = selectedContractFromInput(input);
  const profileReady = input.profileReady ?? selectedContract?.warnings.every(
    (warning) => warning !== "Execution profile is incomplete.",
  ) ?? false;
  const loginKnown = input.loginKnown === true;
  const customerType = input.customerType ?? "unknown";
  const classification = classifyContract(selectedContract, mode);
  const details = statusDetails(classification.status);
  const steps = buildSteps({
    contract: selectedContract,
    customerType,
    loginKnown,
    profileReady,
    status: classification.status,
  });
  const warnings = [
    ...(selectedContract?.warnings ?? []),
    ...(profileReady ? [] : ["Profile incomplete warning."]),
    ...(loginKnown ? [] : ["Login unknown plan."]),
    "Plan is headless and UI-hidden.",
    "Final KÖP/SÄLJ remains human-only.",
    "BankID forbidden/manual-only.",
  ];

  return {
    agentReadableSummary:
      classification.status === "ready_plan" && selectedContract
        ? `Plan ${selectedContract.intent === "exit_sell" ? "SELL" : "BUY"} preparation for ${selectedContract.ticker} as ${selectedContract.orderType} order. Stop before final confirmation; user performs final KÖP/SÄLJ.`
        : `No executable Avanza preparation plan is available: ${details.reason}`,
    blockedReasons: classification.blockedReasons,
    createdAt,
    customerType,
    forbiddenActions: [...forbiddenActions],
    intent: selectedContract?.intent ?? "unknown",
    label: details.label,
    limitPrice: selectedContract?.limitPrice,
    loginKnown,
    manualRequirements: [...manualRequirements],
    orderType: selectedContract?.orderType,
    planId: `agent-plan-${selectedContract?.contractId ?? "missing"}-${createdAt}`,
    profileReady,
    quantity: selectedContract?.quantity,
    reason: details.reason,
    safetyFlags: avanzaHeadlessAgentPlanSafetyFlags,
    selectedContractId: selectedContract?.contractId,
    selectorId: input.selectorResult?.selectorId,
    settlementExpectation: selectedContract
      ? "Settlement reconciliation planned for later avräkningsnota flow; no Supabase write in this task."
      : undefined,
    side: selectedContract?.side,
    source: selectedContract?.source ?? "unknown",
    status: classification.status,
    steps,
    ticker: selectedContract?.ticker,
    warnings,
  };
}
