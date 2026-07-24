import type {
  AvanzaInstrumentSearchRouteContract,
} from "./avanza-instrument-search-route-contract";

export type AvanzaInstrumentSearchActionContractStatus =
  | "disabled"
  | "no_action_needed"
  | "action_plan_ready"
  | "waiting_for_route"
  | "blocked"
  | "error"
  | "unknown";

export type AvanzaInstrumentSearchActionType =
  | "no_op"
  | "click_search_button"
  | "fill_search_input"
  | "wait_for_search_results"
  | "select_matching_instrument"
  | "verify_instrument_identity"
  | "verify_instrument_details"
  | "locate_buy_button"
  | "locate_sell_button"
  | "stop_before_buy_entry_click"
  | "stop_before_sell_entry_click"
  | "stop_for_manual_user_action";

export type AvanzaInstrumentSearchActionExecutionMode =
  | "disabled"
  | "contract_only"
  | "local_dev_dry_run"
  | "local_dev_execute_later";

export type AvanzaInstrumentSearchActionValueSource =
  | "none"
  | "search_package"
  | "static_safe_signal"
  | "user_review";

export type AvanzaInstrumentSearchAction = {
  actionId: string;
  type: AvanzaInstrumentSearchActionType;
  label: string;
  reason: string;
  targetSignalText?: string;
  valueSource: AvanzaInstrumentSearchActionValueSource;
  safeDisplayValue?: string;
  containsCredentialMaterial: false;
  executableInThisTask: false;
  dryRunOnly: true;
  requiresHumanAction: boolean;
  forbidden: boolean;
  expectedResult: string;
};

export type AvanzaInstrumentSearchActionContractSafetyFlags = {
  contractEnabled: boolean;
  canCreateActionPlan: boolean;
  canExecuteActions: false;
  canClickSearchButton: false;
  canFillSearchInput: false;
  canWaitForSearchResults: false;
  canSelectMatchingInstrument: false;
  canVerifyInstrumentIdentity: boolean;
  canLocateBuyButton: boolean;
  canLocateSellButton: boolean;
  canClickBuyEntry: false;
  canClickSellEntry: false;
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

export type AvanzaInstrumentSearchActionContract =
  AvanzaInstrumentSearchActionContractSafetyFlags & {
    contractId: string;
    createdAt: string;
    mode: AvanzaInstrumentSearchActionExecutionMode;
    status: AvanzaInstrumentSearchActionContractStatus;
    label: string;
    reason: string;
    ticker: string;
    instrumentName: string;
    side: "buy" | "sell" | "unknown";
    actions: AvanzaInstrumentSearchAction[];
    nextExpectedInstrumentState: string;
    warnings: string[];
    blockedReasons: string[];
    safetyFlags: AvanzaInstrumentSearchActionContractSafetyFlags;
  };

export type AvanzaInstrumentSearchActionContractInput = {
  mode?: AvanzaInstrumentSearchActionExecutionMode;
  contractEnabled?: boolean;
  instrumentSearchRouteContract?: unknown;
  realWorldInstrumentSearchSignals?: unknown;
  now?: string;
  contractId?: string;
};

const defaultCreatedAt = "2026-07-06T12:00:00.000Z";
const unsafeTextPattern =
  /account\s*id|accountid|bankid|cookie|credential|password\s*[:=]|personnummer|\d{6}[-+]?\d{4}|\d{8}[-+]?\d{4}|secret|session|storage|token|order\s*id|orderid/i;

function safeText(value: unknown) {
  if (typeof value !== "string") return undefined;

  const text = value.trim();

  if (!text) return undefined;
  if (unsafeTextPattern.test(text)) return undefined;

  return text;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isRouteContract(
  value: unknown,
): value is AvanzaInstrumentSearchRouteContract {
  if (!isPlainObject(value)) return false;

  return (
    typeof value.routeContractId === "string" &&
    typeof value.status === "string" &&
    typeof value.ticker === "string" &&
    typeof value.instrumentName === "string" &&
    Array.isArray(value.steps) &&
    Array.isArray(value.warnings) &&
    Array.isArray(value.blockedReasons)
  );
}

function buildSafetyFlags(
  contractEnabled: boolean,
  canCreateActionPlan: boolean,
  canVerifyInstrumentIdentity: boolean,
  canLocateBuyButton: boolean,
  canLocateSellButton: boolean,
): AvanzaInstrumentSearchActionContractSafetyFlags {
  return {
    contractEnabled,
    canCreateActionPlan,
    canExecuteActions: false,
    canClickSearchButton: false,
    canFillSearchInput: false,
    canWaitForSearchResults: false,
    canSelectMatchingInstrument: false,
    canVerifyInstrumentIdentity,
    canLocateBuyButton,
    canLocateSellButton,
    canClickBuyEntry: false,
    canClickSellEntry: false,
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

function action(
  actionId: string,
  type: AvanzaInstrumentSearchActionType,
  label: string,
  reason: string,
  expectedResult: string,
  options: {
    targetSignalText?: string;
    valueSource?: AvanzaInstrumentSearchActionValueSource;
    safeDisplayValue?: string;
    requiresHumanAction?: boolean;
    forbidden?: boolean;
  } = {},
): AvanzaInstrumentSearchAction {
  return {
    actionId,
    type,
    label,
    reason,
    targetSignalText: options.targetSignalText,
    valueSource: options.valueSource ?? "none",
    safeDisplayValue: options.safeDisplayValue,
    containsCredentialMaterial: false,
    executableInThisTask: false,
    dryRunOnly: true,
    requiresHumanAction: options.requiresHumanAction ?? false,
    forbidden: options.forbidden ?? false,
    expectedResult,
  };
}

function disabledAction(reason: string) {
  return [
    action(
      "no_op_disabled",
      "no_op",
      "No instrument search action",
      reason,
      "No action is planned.",
      { forbidden: true },
    ),
  ];
}

function statusLabel(status: AvanzaInstrumentSearchActionContractStatus) {
  switch (status) {
    case "disabled":
      return "Instrument search action contract disabled";
    case "no_action_needed":
      return "No instrument search action needed";
    case "action_plan_ready":
      return "Instrument search action plan ready";
    case "waiting_for_route":
      return "Instrument search action contract waiting for route";
    case "blocked":
      return "Instrument search action contract blocked";
    case "error":
      return "Instrument search action contract error";
    case "unknown":
      return "Instrument search action contract unknown";
  }
}

function buildReadyActions(route: AvanzaInstrumentSearchRouteContract) {
  const locateType =
    route.side === "sell" ? "locate_sell_button" : "locate_buy_button";
  const stopType =
    route.side === "sell"
      ? "stop_before_sell_entry_click"
      : "stop_before_buy_entry_click";
  const entryText = route.side === "sell" ? "Sälj" : "Köp";

  return [
    action(
      "click_search_button",
      "click_search_button",
      "Click search button",
      "The search button is visible in sanitized screenshots.",
      "Future action would open the search panel.",
      { targetSignalText: "Sök", valueSource: "static_safe_signal" },
    ),
    action(
      "fill_search_input",
      "fill_search_input",
      "Fill search input",
      "Search query comes from the explicit route package.",
      "Future action would enter the query in the search panel.",
      {
        targetSignalText: "Sök",
        valueSource: "search_package",
        safeDisplayValue:
          route.instrumentName !== "missing" ? route.instrumentName : route.ticker,
      },
    ),
    action(
      "wait_for_search_results",
      "wait_for_search_results",
      "Wait for search results",
      "Search results are modeled from sanitized screenshots.",
      "Future action would wait for results to appear.",
      { targetSignalText: "Aktier", valueSource: "static_safe_signal" },
    ),
    action(
      "select_matching_instrument",
      "select_matching_instrument",
      "Select matching instrument",
      "The matching instrument must be selected from search results.",
      "Future action would open the instrument page.",
      {
        targetSignalText: "Nokia ADR",
        valueSource: "search_package",
        safeDisplayValue:
          route.instrumentName !== "missing" ? route.instrumentName : route.ticker,
      },
    ),
    action(
      "verify_instrument_identity",
      "verify_instrument_identity",
      "Verify instrument identity",
      "The instrument identity must be reviewed before order entry.",
      "Future action would stop for read-only identity verification.",
      {
        targetSignalText: "Om depåbeviset",
        valueSource: "user_review",
        safeDisplayValue: route.instrumentName,
        requiresHumanAction: true,
      },
    ),
    action(
      "verify_instrument_details",
      "verify_instrument_details",
      "Verify instrument details",
      "Marketplace, short name, and ISIN are modeled as read-only checks.",
      "Future action would compare safe instrument details.",
      {
        targetSignalText: "Marknadsplats",
        valueSource: "user_review",
        safeDisplayValue: [route.expectedMarket, route.ticker, route.expectedIsin]
          .filter((value) => value !== "missing")
          .join(" / "),
        requiresHumanAction: true,
      },
    ),
    action(
      locateType,
      locateType,
      route.side === "sell" ? "Locate SELL button" : "Locate BUY button",
      "The instrument page shows BUY/SELL entry buttons.",
      "Future action would locate the entry button but not click it.",
      {
        targetSignalText: entryText,
        valueSource: "static_safe_signal",
        requiresHumanAction: true,
      },
    ),
    action(
      stopType,
      stopType,
      route.side === "sell"
        ? "Stop before SÄLJ entry click"
        : "Stop before KÖP entry click",
      "BUY/SELL entry click is manual and not executable in this task.",
      "The agent stops before order ticket entry.",
      {
        targetSignalText: entryText,
        valueSource: "user_review",
        requiresHumanAction: true,
        forbidden: true,
      },
    ),
  ];
}

function baseContract(
  input: AvanzaInstrumentSearchActionContractInput,
  status: AvanzaInstrumentSearchActionContractStatus,
  reason: string,
  options: {
    route?: AvanzaInstrumentSearchRouteContract;
    actions?: AvanzaInstrumentSearchAction[];
    blockedReasons?: string[];
    warnings?: string[];
    canCreateActionPlan?: boolean;
    canVerifyInstrumentIdentity?: boolean;
    canLocateBuyButton?: boolean;
    canLocateSellButton?: boolean;
    nextExpectedInstrumentState?: string;
  } = {},
): AvanzaInstrumentSearchActionContract {
  const contractEnabled = input.contractEnabled === true;
  const route = options.route;
  const safetyFlags = buildSafetyFlags(
    contractEnabled,
    options.canCreateActionPlan === true,
    options.canVerifyInstrumentIdentity === true,
    options.canLocateBuyButton === true,
    options.canLocateSellButton === true,
  );

  return {
    ...safetyFlags,
    contractId: safeText(input.contractId) ?? "avanza-instrument-search-action-contract",
    createdAt: safeText(input.now) ?? defaultCreatedAt,
    mode: input.mode ?? "disabled",
    status,
    label: statusLabel(status),
    reason,
    ticker: route?.ticker ?? "missing",
    instrumentName: route?.instrumentName ?? "missing",
    side: route?.side ?? "unknown",
    actions: options.actions ?? disabledAction(reason),
    nextExpectedInstrumentState:
      options.nextExpectedInstrumentState ??
      "No instrument search action state change.",
    warnings: options.warnings ?? route?.warnings ?? [],
    blockedReasons: options.blockedReasons ?? route?.blockedReasons ?? [],
    safetyFlags,
  };
}

export function buildAvanzaInstrumentSearchActionContract(
  input: AvanzaInstrumentSearchActionContractInput = {},
): AvanzaInstrumentSearchActionContract {
  if (input.contractEnabled !== true || input.mode === "disabled") {
    return baseContract(input, "disabled", "Instrument search action contract is disabled.", {
      blockedReasons: ["Contract disabled."],
    });
  }

  if (input.instrumentSearchRouteContract === undefined) {
    return baseContract(
      input,
      "waiting_for_route",
      "Instrument search action contract requires a route contract.",
      { blockedReasons: ["Missing instrument search route contract."] },
    );
  }

  if (!isRouteContract(input.instrumentSearchRouteContract)) {
    return baseContract(
      input,
      "blocked",
      "Instrument search action contract received an invalid route.",
      { blockedReasons: ["Invalid instrument search route contract."] },
    );
  }

  const route = input.instrumentSearchRouteContract;

  if (route.status === "error") {
    return baseContract(input, "error", "Route contract returned an error.", {
      route,
      blockedReasons: ["Route contract error."],
    });
  }

  if (route.status === "unknown") {
    return baseContract(input, "unknown", "Route contract state is unknown.", {
      route,
      blockedReasons: ["Route contract unknown."],
    });
  }

  if (route.status === "disabled") {
    return baseContract(input, "disabled", "Route contract is disabled.", {
      route,
      blockedReasons: ["Route contract disabled."],
    });
  }

  if (route.status === "blocked") {
    return baseContract(input, "blocked", "Route contract is blocked.", {
      route,
    });
  }

  if (
    route.status !== "route_ready" &&
    route.status !== "instrument_verification_ready"
  ) {
    return baseContract(
      input,
      "waiting_for_route",
      "Instrument search action contract requires a ready route.",
      { route, blockedReasons: ["Waiting for ready route contract."] },
    );
  }

  const actions = buildReadyActions(route);

  return baseContract(
    input,
    "action_plan_ready",
    "Instrument search actions are modeled but not executable.",
    {
      route,
      actions,
      canCreateActionPlan: true,
      canVerifyInstrumentIdentity: true,
      canLocateBuyButton: route.side === "buy",
      canLocateSellButton: route.side === "sell",
      nextExpectedInstrumentState:
        route.side === "sell"
          ? "Future action plan would stop before SÄLJ entry click."
          : "Future action plan would stop before KÖP entry click.",
    },
  );
}
