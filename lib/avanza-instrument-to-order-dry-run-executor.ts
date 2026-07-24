import type {
  AvanzaInstrumentToOrderHandoffChain,
  AvanzaInstrumentToOrderHandoffStep,
  AvanzaInstrumentToOrderHandoffStepValueSource,
  AvanzaVerifiedInstrumentHandoffState,
} from "./avanza-instrument-to-order-handoff-chain";
import type {
  AvanzaOrderTicketActionContract,
} from "./avanza-order-ticket-action-contract";
import type {
  AvanzaOrderTicketOrderType,
  AvanzaOrderTicketSide,
} from "./avanza-order-ticket-field-contract";
import type {
  AvanzaInstrumentSearchActionContract,
} from "./avanza-instrument-search-action-contract";

export type AvanzaInstrumentToOrderDryRunStatus =
  | "disabled"
  | "dry_run_ready"
  | "dry_run_passed"
  | "dry_run_blocked"
  | "dry_run_waiting_for_chain"
  | "dry_run_instrument_verification_failed"
  | "dry_run_order_plan_failed"
  | "dry_run_final_human_action_required"
  | "dry_run_error"
  | "unknown";

export type AvanzaInstrumentToOrderDryRunStepStatus =
  | "planned"
  | "simulated"
  | "skipped"
  | "blocked"
  | "blocked_instrument_verification"
  | "blocked_order_plan"
  | "final_human_action_required"
  | "error";

export type AvanzaInstrumentToOrderDryRunMode =
  | "disabled"
  | "local_dev_dry_run"
  | "chain_dry_run_model";

export type AvanzaInstrumentToOrderDryRunSafetyFlags = {
  dryRunEnabled: boolean;
  canDryRun: boolean;
  canExecuteChain: false;
  canSearchInstrument: false;
  canNavigateToInstrument: false;
  canVerifyInstrument: boolean;
  canOpenBuyEntry: false;
  canOpenSellEntry: false;
  canFillOrderFields: false;
  canReviewOrder: false;
  canClickFinalBuy: false;
  canClickFinalSell: false;
  canSubmitOrder: false;
  canReadCookies: false;
  canExportSession: false;
  canAutomateBankId: false;
  canBypassBankId: false;
  userMustConfirm: true;
  finalHumanClickRequired: true;
  controlsEnabled: false;
  gateLocked: true;
};

export type AvanzaInstrumentToOrderDryRunStepReport = {
  stepId: string;
  stepType: string;
  label: string;
  dryRunStatus: AvanzaInstrumentToOrderDryRunStepStatus;
  wouldTargetSignalText?: string;
  wouldUseValueSource: AvanzaInstrumentToOrderHandoffStepValueSource;
  safeDisplayValue?: string;
  executableNow: false;
  realBrowserAction: false;
  expectedResult: string;
  blockedReason?: string;
};

export type AvanzaInstrumentToOrderDryRunReport =
  AvanzaInstrumentToOrderDryRunSafetyFlags & {
    dryRunId: string;
    createdAt: string;
    mode: AvanzaInstrumentToOrderDryRunMode;
    status: AvanzaInstrumentToOrderDryRunStatus;
    label: string;
    reason: string;
    side: AvanzaOrderTicketSide;
    ticker: string;
    instrumentName?: string;
    quantity?: number;
    orderType: AvanzaOrderTicketOrderType;
    limitPrice?: number;
    instrumentVerificationPassed: boolean;
    orderFieldPlanReady: boolean;
    orderActionPlanReady: boolean;
    finalHumanActionRequired: true;
    stepReports: AvanzaInstrumentToOrderDryRunStepReport[];
    nextExpectedState: string;
    warnings: string[];
    blockedReasons: string[];
    safetyFlags: AvanzaInstrumentToOrderDryRunSafetyFlags;
  };

export type AvanzaInstrumentToOrderDryRunReportInput = {
  mode?: AvanzaInstrumentToOrderDryRunMode;
  dryRunEnabled?: boolean;
  handoffChain?: unknown;
  executionPackage?: unknown;
  instrumentSearchActionContract?: unknown;
  orderTicketActionContract?: unknown;
  verifiedInstrumentState?: unknown;
  now?: string;
  dryRunId?: string;
  forceError?: boolean;
  forceUnknown?: boolean;
};

const defaultCreatedAt = "2026-07-06T12:00:00.000Z";
const unsafeTextPattern =
  /account\s*id|accountid|bankid|cookie|credential|password\s*[:=]|personnummer|\d{6}[-+]?\d{4}|\d{8}[-+]?\d{4}|secret|session|storage|token|order\s*id|orderid/i;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeText(value: unknown) {
  if (typeof value !== "string") return undefined;

  const text = value.trim();

  if (!text) return undefined;
  if (unsafeTextPattern.test(text)) return undefined;

  return text;
}

function safeStringArray(values: unknown) {
  return Array.isArray(values)
    ? values.flatMap((value) => {
        const text = safeText(value);

        return text ? [text] : [];
      })
    : [];
}

function isHandoffChain(value: unknown): value is AvanzaInstrumentToOrderHandoffChain {
  return (
    isPlainObject(value) &&
    typeof value.chainId === "string" &&
    typeof value.status === "string" &&
    typeof value.side === "string" &&
    typeof value.ticker === "string" &&
    Array.isArray(value.steps) &&
    Array.isArray(value.blockedReasons)
  );
}

function isVerifiedInstrumentState(
  value: unknown,
): value is AvanzaVerifiedInstrumentHandoffState {
  return (
    isPlainObject(value) &&
    typeof value.verificationId === "string" &&
    typeof value.status === "string" &&
    typeof value.ticker === "string" &&
    Array.isArray(value.blockedReasons)
  );
}

function isInstrumentSearchAction(
  value: unknown,
): value is AvanzaInstrumentSearchActionContract {
  return (
    isPlainObject(value) &&
    typeof value.contractId === "string" &&
    typeof value.status === "string" &&
    Array.isArray(value.actions)
  );
}

function isOrderAction(
  value: unknown,
): value is AvanzaOrderTicketActionContract {
  return (
    isPlainObject(value) &&
    typeof value.contractId === "string" &&
    typeof value.status === "string" &&
    Array.isArray(value.actions)
  );
}

function buildSafetyFlags(options: {
  dryRunEnabled: boolean;
  canDryRun?: boolean;
  canVerifyInstrument?: boolean;
}): AvanzaInstrumentToOrderDryRunSafetyFlags {
  return {
    dryRunEnabled: options.dryRunEnabled,
    canDryRun: options.canDryRun === true,
    canExecuteChain: false,
    canSearchInstrument: false,
    canNavigateToInstrument: false,
    canVerifyInstrument: options.canVerifyInstrument === true,
    canOpenBuyEntry: false,
    canOpenSellEntry: false,
    canFillOrderFields: false,
    canReviewOrder: false,
    canClickFinalBuy: false,
    canClickFinalSell: false,
    canSubmitOrder: false,
    canReadCookies: false,
    canExportSession: false,
    canAutomateBankId: false,
    canBypassBankId: false,
    userMustConfirm: true,
    finalHumanClickRequired: true,
    controlsEnabled: false,
    gateLocked: true,
  };
}

function statusLabel(status: AvanzaInstrumentToOrderDryRunStatus) {
  switch (status) {
    case "disabled":
      return "Instrument to order dry-run disabled";
    case "dry_run_ready":
      return "Instrument to order dry-run ready";
    case "dry_run_passed":
      return "Instrument to order dry-run passed";
    case "dry_run_blocked":
      return "Instrument to order dry-run blocked";
    case "dry_run_waiting_for_chain":
      return "Instrument to order dry-run waiting for chain";
    case "dry_run_instrument_verification_failed":
      return "Instrument verification failed in dry-run";
    case "dry_run_order_plan_failed":
      return "Order plan failed in dry-run";
    case "dry_run_final_human_action_required":
      return "Dry-run reached final human action";
    case "dry_run_error":
      return "Instrument to order dry-run error";
    case "unknown":
      return "Instrument to order dry-run unknown";
  }
}

function noOpReport(
  dryRunStatus: AvanzaInstrumentToOrderDryRunStepStatus,
  reason: string,
): AvanzaInstrumentToOrderDryRunStepReport[] {
  return [
    {
      stepId: "no_op",
      stepType: "no_op",
      label: "No dry-run step",
      dryRunStatus,
      wouldUseValueSource: "none",
      executableNow: false,
      realBrowserAction: false,
      expectedResult: "No dry-run action is simulated.",
      blockedReason: reason,
    },
  ];
}

function stepReport(
  step: AvanzaInstrumentToOrderHandoffStep,
): AvanzaInstrumentToOrderDryRunStepReport {
  const isFinalStop =
    step.type === "stop_before_final_buy" ||
    step.type === "stop_before_final_sell" ||
    step.type === "stop_for_manual_user_action";

  return {
    stepId: step.stepId,
    stepType: step.type,
    label: step.label,
    dryRunStatus: isFinalStop ? "final_human_action_required" : "simulated",
    wouldTargetSignalText: step.targetSignalText,
    wouldUseValueSource: step.valueSource,
    safeDisplayValue: step.safeDisplayValue,
    executableNow: false,
    realBrowserAction: false,
    expectedResult: step.expectedResult,
    blockedReason: step.forbidden ? "Step is human-only or forbidden." : undefined,
  };
}

function baseReport(
  input: AvanzaInstrumentToOrderDryRunReportInput,
  status: AvanzaInstrumentToOrderDryRunStatus,
  reason: string,
  options: {
    chain?: AvanzaInstrumentToOrderHandoffChain;
    stepReports?: AvanzaInstrumentToOrderDryRunStepReport[];
    warnings?: string[];
    blockedReasons?: string[];
    canDryRun?: boolean;
    canVerifyInstrument?: boolean;
    instrumentVerificationPassed?: boolean;
    orderFieldPlanReady?: boolean;
    orderActionPlanReady?: boolean;
    nextExpectedState?: string;
  } = {},
): AvanzaInstrumentToOrderDryRunReport {
  const dryRunEnabled =
    input.dryRunEnabled === true && (input.mode ?? "disabled") !== "disabled";
  const safetyFlags = buildSafetyFlags({
    dryRunEnabled,
    canDryRun: options.canDryRun,
    canVerifyInstrument: options.canVerifyInstrument,
  });
  const chain = options.chain;

  return {
    ...safetyFlags,
    dryRunId: safeText(input.dryRunId) ?? "avanza-instrument-to-order-dry-run",
    createdAt: safeText(input.now) ?? defaultCreatedAt,
    mode: input.mode ?? "disabled",
    status,
    label: statusLabel(status),
    reason,
    side: chain?.side ?? "unknown",
    ticker: chain?.ticker ?? "missing",
    instrumentName: chain?.instrumentName,
    quantity: chain?.quantity,
    orderType: chain?.orderType ?? "unknown",
    limitPrice: chain?.limitPrice,
    instrumentVerificationPassed:
      options.instrumentVerificationPassed === true,
    orderFieldPlanReady: options.orderFieldPlanReady === true,
    orderActionPlanReady: options.orderActionPlanReady === true,
    finalHumanActionRequired: true,
    stepReports: options.stepReports ?? noOpReport("skipped", reason),
    nextExpectedState:
      options.nextExpectedState ?? "No instrument to order dry-run state change.",
    warnings: options.warnings ?? safeStringArray(chain?.warnings),
    blockedReasons: options.blockedReasons ?? [],
    safetyFlags,
  };
}

export function buildAvanzaInstrumentToOrderDryRunReport(
  input: AvanzaInstrumentToOrderDryRunReportInput = {},
): AvanzaInstrumentToOrderDryRunReport {
  if (input.forceError === true) {
    return baseReport(input, "dry_run_error", "Instrument to order dry-run returned an error.", {
      blockedReasons: ["Forced error fixture."],
      stepReports: noOpReport("error", "Forced error fixture."),
    });
  }

  if (input.forceUnknown === true) {
    return baseReport(input, "unknown", "Instrument to order dry-run state is unknown.", {
      blockedReasons: ["Forced unknown fixture."],
    });
  }

  if (input.dryRunEnabled !== true || input.mode === "disabled") {
    return baseReport(input, "disabled", "Instrument to order dry-run is disabled.", {
      blockedReasons: ["Dry-run disabled."],
    });
  }

  if (!isHandoffChain(input.handoffChain)) {
    return baseReport(
      input,
      "dry_run_waiting_for_chain",
      "A coherent handoff chain is required before dry-run simulation.",
      { blockedReasons: ["Missing handoff chain."] },
    );
  }

  const chain = input.handoffChain;

  if (chain.status === "error") {
    return baseReport(input, "dry_run_error", "Handoff chain returned an error.", {
      chain,
      blockedReasons: chain.blockedReasons,
      stepReports: noOpReport("error", "Handoff chain error."),
    });
  }

  if (chain.status === "unknown") {
    return baseReport(input, "unknown", "Handoff chain state is unknown.", {
      chain,
      blockedReasons: chain.blockedReasons,
    });
  }

  if (chain.status === "blocked" || chain.status === "disabled") {
    return baseReport(input, "dry_run_blocked", "Handoff chain is blocked.", {
      chain,
      blockedReasons: chain.blockedReasons.length > 0
        ? chain.blockedReasons
        : ["Handoff chain is not available."],
      stepReports: noOpReport("blocked", "Handoff chain is blocked."),
    });
  }

  const verifiedState = isVerifiedInstrumentState(input.verifiedInstrumentState)
    ? input.verifiedInstrumentState
    : chain.verifiedInstrumentState;
  const instrumentVerificationPassed =
    verifiedState.status === "verified_model_only" &&
    verifiedState.instrumentIdentityMatched === true &&
    verifiedState.isinMatchedOrUnavailable === true;

  if (!instrumentVerificationPassed) {
    return baseReport(
      input,
      "dry_run_instrument_verification_failed",
      "Instrument verification did not pass for dry-run simulation.",
      {
        chain,
        canVerifyInstrument: true,
        instrumentVerificationPassed: false,
        blockedReasons:
          verifiedState.blockedReasons.length > 0
            ? verifiedState.blockedReasons
            : ["Instrument verification is missing or failed."],
        stepReports: chain.steps.map((step) => ({
          ...stepReport(step),
          dryRunStatus:
            step.type === "verify_instrument_identity"
              ? "blocked_instrument_verification"
              : "skipped",
          blockedReason: "Instrument verification did not pass.",
        })),
      },
    );
  }

  const searchAction = isInstrumentSearchAction(input.instrumentSearchActionContract)
    ? input.instrumentSearchActionContract
    : undefined;
  const orderAction = isOrderAction(input.orderTicketActionContract)
    ? input.orderTicketActionContract
    : undefined;
  const orderFieldPlanReady = chain.canBuildOrderFieldPlan === true;
  const orderActionPlanReady =
    chain.canBuildOrderActionContract === true &&
    (!orderAction || orderAction.status === "action_plan_ready");

  if (
    chain.status !== "handoff_chain_ready" ||
    !orderFieldPlanReady ||
    !orderActionPlanReady ||
    (searchAction !== undefined && searchAction.status !== "action_plan_ready")
  ) {
    return baseReport(
      input,
      "dry_run_order_plan_failed",
      "Order ticket field/action readiness did not pass for dry-run simulation.",
      {
        chain,
        canVerifyInstrument: true,
        instrumentVerificationPassed,
        orderFieldPlanReady,
        orderActionPlanReady,
        blockedReasons: chain.blockedReasons.length > 0
          ? chain.blockedReasons
          : ["Order ticket field/action readiness is incomplete."],
        stepReports: chain.steps.map((step) => ({
          ...stepReport(step),
          dryRunStatus:
            step.type === "build_order_ticket_field_plan" ||
            step.type === "build_order_ticket_action_contract"
              ? "blocked_order_plan"
              : "simulated",
          blockedReason:
            step.type === "build_order_ticket_field_plan" ||
            step.type === "build_order_ticket_action_contract"
              ? "Order plan readiness did not pass."
              : undefined,
        })),
      },
    );
  }

  return baseReport(
    input,
    "dry_run_final_human_action_required",
    "Full pre-submit flow simulated and stopped before final KÖP/SÄLJ.",
    {
      chain,
      canDryRun: true,
      canVerifyInstrument: true,
      instrumentVerificationPassed,
      orderFieldPlanReady: true,
      orderActionPlanReady: true,
      stepReports: chain.steps.map(stepReport),
      nextExpectedState:
        chain.side === "sell"
          ? "Dry-run passed to final human action before SÄLJ."
          : "Dry-run passed to final human action before KÖP.",
    },
  );
}
