import type {
  AvanzaRealWorldInstrumentSearchSignalPack,
} from "./avanza-real-world-instrument-search-signals";

export type AvanzaInstrumentSearchRouteStatus =
  | "disabled"
  | "waiting_for_search_package"
  | "waiting_for_search_signals"
  | "route_ready"
  | "instrument_verification_ready"
  | "blocked"
  | "error"
  | "unknown";

export type AvanzaInstrumentSearchRouteStepType =
  | "no_op"
  | "open_search"
  | "fill_search_query"
  | "wait_for_results"
  | "select_matching_instrument"
  | "verify_instrument_identity"
  | "verify_marketplace"
  | "verify_short_name"
  | "verify_isin_if_available"
  | "locate_buy_sell_buttons"
  | "stop_before_buy_sell_entry_click"
  | "stop_for_manual_user_action";

export type AvanzaInstrumentSearchRouteMode =
  | "disabled"
  | "route_model"
  | "local_dev_route_model";

export type AvanzaInstrumentSearchSide = "buy" | "sell" | "unknown";

export type AvanzaInstrumentSearchInputPackage = {
  packageId?: string;
  createdAt?: string;
  source?: "recommendation" | "live_position_exit" | "manual_review" | "fixture";
  ticker?: string;
  instrumentName?: string;
  expectedMarket?: string;
  expectedCurrency?: string;
  expectedInstrumentType?: string;
  expectedIsin?: string;
  side?: AvanzaInstrumentSearchSide;
  recommendationId?: string;
  positionId?: string;
  now?: string;
};

export type AvanzaInstrumentSearchRouteStepValueSource =
  | "none"
  | "search_package"
  | "static_safe_signal"
  | "user_review";

export type AvanzaInstrumentSearchRouteStep = {
  stepId: string;
  type: AvanzaInstrumentSearchRouteStepType;
  label: string;
  reason: string;
  targetSignalText?: string;
  valueSource: AvanzaInstrumentSearchRouteStepValueSource;
  safeDisplayValue?: string;
  executableInThisTask: false;
  dryRunOnly: true;
  requiresHumanAction: boolean;
  forbidden: boolean;
  expectedResult: string;
};

export type AvanzaInstrumentSearchRouteSafetyFlags = {
  routeEnabled: boolean;
  canCreateSearchRoute: boolean;
  canExecuteSearchRoute: false;
  canOpenSearch: false;
  canFillSearchQuery: false;
  canWaitForResults: false;
  canSelectMatchingInstrument: false;
  canNavigateToInstrument: false;
  canVerifyInstrumentIdentity: boolean;
  canLocateBuySellButtons: boolean;
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

export type AvanzaInstrumentSearchRouteContract =
  AvanzaInstrumentSearchRouteSafetyFlags & {
    routeContractId: string;
    createdAt: string;
    mode: AvanzaInstrumentSearchRouteMode;
    status: AvanzaInstrumentSearchRouteStatus;
    label: string;
    reason: string;
    ticker: string;
    instrumentName: string;
    expectedMarket: string;
    expectedCurrency: string;
    expectedInstrumentType: string;
    expectedIsin: string;
    side: AvanzaInstrumentSearchSide;
    steps: AvanzaInstrumentSearchRouteStep[];
    nextExpectedState: string;
    warnings: string[];
    blockedReasons: string[];
    safetyFlags: AvanzaInstrumentSearchRouteSafetyFlags;
  };

export type AvanzaInstrumentSearchRouteContractInput = {
  mode?: AvanzaInstrumentSearchRouteMode;
  routeEnabled?: boolean;
  searchPackage?: AvanzaInstrumentSearchInputPackage;
  realWorldInstrumentSearchSignals?: unknown;
  now?: string;
  routeContractId?: string;
  forceError?: boolean;
  forceUnknown?: boolean;
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

function isSearchSignals(
  value: unknown,
): value is AvanzaRealWorldInstrumentSearchSignalPack {
  if (!isPlainObject(value)) return false;

  return (
    value.source === "sanitized_user_visual_material" &&
    typeof value.step === "string" &&
    Array.isArray(value.visibleTexts) &&
    Array.isArray(value.blockedReasons)
  );
}

function buildSafetyFlags(
  routeEnabled: boolean,
  canCreateSearchRoute: boolean,
  canVerifyInstrumentIdentity: boolean,
  canLocateBuySellButtons: boolean,
): AvanzaInstrumentSearchRouteSafetyFlags {
  return {
    routeEnabled,
    canCreateSearchRoute,
    canExecuteSearchRoute: false,
    canOpenSearch: false,
    canFillSearchQuery: false,
    canWaitForResults: false,
    canSelectMatchingInstrument: false,
    canNavigateToInstrument: false,
    canVerifyInstrumentIdentity,
    canLocateBuySellButtons,
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

function routeStep(
  stepId: string,
  type: AvanzaInstrumentSearchRouteStepType,
  label: string,
  reason: string,
  expectedResult: string,
  options: {
    targetSignalText?: string;
    valueSource?: AvanzaInstrumentSearchRouteStepValueSource;
    safeDisplayValue?: string;
    requiresHumanAction?: boolean;
    forbidden?: boolean;
  } = {},
): AvanzaInstrumentSearchRouteStep {
  return {
    stepId,
    type,
    label,
    reason,
    targetSignalText: options.targetSignalText,
    valueSource: options.valueSource ?? "none",
    safeDisplayValue: options.safeDisplayValue,
    executableInThisTask: false,
    dryRunOnly: true,
    requiresHumanAction: options.requiresHumanAction ?? false,
    forbidden: options.forbidden ?? false,
    expectedResult,
  };
}

function statusLabel(status: AvanzaInstrumentSearchRouteStatus) {
  switch (status) {
    case "disabled":
      return "Instrument search route disabled";
    case "waiting_for_search_package":
      return "Instrument search route waiting for package";
    case "waiting_for_search_signals":
      return "Instrument search route waiting for search signals";
    case "route_ready":
      return "Instrument search route ready";
    case "instrument_verification_ready":
      return "Instrument verification ready";
    case "blocked":
      return "Instrument search route blocked";
    case "error":
      return "Instrument search route error";
    case "unknown":
      return "Instrument search route unknown";
  }
}

function disabledStep(reason: string) {
  return [
    routeStep(
      "no_op_disabled",
      "no_op",
      "No instrument search route",
      reason,
      "No route step is planned.",
      { forbidden: true },
    ),
  ];
}

function buildReadySteps(pkg: RequiredSearchPackage) {
  const steps: AvanzaInstrumentSearchRouteStep[] = [
    routeStep(
      "open_search",
      "open_search",
      "Open search",
      "The Avanza search button is visible in sanitized screenshots.",
      "Future route would open the search panel.",
      { targetSignalText: "Sök", valueSource: "static_safe_signal" },
    ),
    routeStep(
      "fill_search_query",
      "fill_search_query",
      "Fill search query",
      "Ticker or instrument name comes from the explicit search package.",
      "Future route would show the query in the search input.",
      {
        targetSignalText: "Sök",
        valueSource: "search_package",
        safeDisplayValue: pkg.instrumentName !== "missing" ? pkg.instrumentName : pkg.ticker,
      },
    ),
    routeStep(
      "wait_for_results",
      "wait_for_results",
      "Wait for search results",
      "Search results are modeled from sanitized screenshots.",
      "Future route would wait until results are visible.",
      { targetSignalText: "Aktier", valueSource: "static_safe_signal" },
    ),
    routeStep(
      "select_matching_instrument",
      "select_matching_instrument",
      "Select matching instrument",
      "The matching instrument must be chosen from visible results.",
      "Future route would navigate to the selected instrument page.",
      {
        targetSignalText: "Nokia ADR",
        valueSource: "search_package",
        safeDisplayValue: pkg.instrumentName !== "missing" ? pkg.instrumentName : pkg.ticker,
      },
    ),
    routeStep(
      "verify_instrument_identity",
      "verify_instrument_identity",
      "Verify instrument identity",
      "The instrument page must match the expected package.",
      "Future route would verify the instrument identity in read-only mode.",
      {
        targetSignalText: "Om depåbeviset",
        valueSource: "user_review",
        safeDisplayValue: pkg.instrumentName,
        requiresHumanAction: true,
      },
    ),
  ];

  if (pkg.expectedMarket !== "missing") {
    steps.push(
      routeStep(
        "verify_marketplace",
        "verify_marketplace",
        "Verify marketplace",
        "Expected market is present in the search package.",
        "Future route would compare the visible marketplace.",
        {
          targetSignalText: "Marknadsplats",
          valueSource: "search_package",
          safeDisplayValue: pkg.expectedMarket,
          requiresHumanAction: true,
        },
      ),
    );
  }

  steps.push(
    routeStep(
      "verify_short_name",
      "verify_short_name",
      "Verify short name",
      "Ticker is present in the search package.",
      "Future route would compare the visible short name.",
      {
        targetSignalText: "Kortnamn",
        valueSource: "search_package",
        safeDisplayValue: pkg.ticker,
        requiresHumanAction: true,
      },
    ),
  );

  if (pkg.expectedIsin !== "missing") {
    steps.push(
      routeStep(
        "verify_isin_if_available",
        "verify_isin_if_available",
        "Verify ISIN if available",
        "Expected ISIN is present in the search package.",
        "Future route would compare the visible ISIN.",
        {
          targetSignalText: "ISIN",
          valueSource: "search_package",
          safeDisplayValue: pkg.expectedIsin,
          requiresHumanAction: true,
        },
      ),
    );
  }

  steps.push(
    routeStep(
      "locate_buy_sell_buttons",
      "locate_buy_sell_buttons",
      "Locate BUY/SELL entry buttons",
      "The instrument page shows KÖP and SÄLJ entry buttons.",
      "Future route would locate entry buttons but not click them in this task.",
      {
        targetSignalText: pkg.side === "sell" ? "Sälj" : "Köp",
        valueSource: "static_safe_signal",
        requiresHumanAction: true,
      },
    ),
    routeStep(
      "stop_before_buy_sell_entry_click",
      "stop_before_buy_sell_entry_click",
      pkg.side === "sell"
        ? "Stop before SÄLJ entry click"
        : "Stop before KÖP entry click",
      "BUY/SELL entry click is not executable in this task.",
      "Future route stops before order ticket entry click.",
      {
        targetSignalText: pkg.side === "sell" ? "Sälj" : "Köp",
        valueSource: "user_review",
        requiresHumanAction: true,
        forbidden: true,
      },
    ),
  );

  return steps;
}

type RequiredSearchPackage = {
  ticker: string;
  instrumentName: string;
  expectedMarket: string;
  expectedCurrency: string;
  expectedInstrumentType: string;
  expectedIsin: string;
  side: AvanzaInstrumentSearchSide;
};

function normalizePackage(
  pkg: AvanzaInstrumentSearchInputPackage | undefined,
): RequiredSearchPackage | undefined {
  if (!pkg) return undefined;

  const ticker = safeText(pkg.ticker);
  const instrumentName = safeText(pkg.instrumentName);

  if (!ticker && !instrumentName) return undefined;

  return {
    ticker: ticker ?? "missing",
    instrumentName: instrumentName ?? "missing",
    expectedMarket: safeText(pkg.expectedMarket) ?? "missing",
    expectedCurrency: safeText(pkg.expectedCurrency) ?? "missing",
    expectedInstrumentType: safeText(pkg.expectedInstrumentType) ?? "missing",
    expectedIsin: safeText(pkg.expectedIsin) ?? "missing",
    side: pkg.side === "sell" ? "sell" : pkg.side === "buy" ? "buy" : "unknown",
  };
}

function baseContract(
  input: AvanzaInstrumentSearchRouteContractInput,
  status: AvanzaInstrumentSearchRouteStatus,
  reason: string,
  options: {
    pkg?: RequiredSearchPackage;
    steps?: AvanzaInstrumentSearchRouteStep[];
    warnings?: string[];
    blockedReasons?: string[];
    canCreateSearchRoute?: boolean;
    nextExpectedState?: string;
    canVerifyInstrumentIdentity?: boolean;
    canLocateBuySellButtons?: boolean;
  } = {},
): AvanzaInstrumentSearchRouteContract {
  const routeEnabled = input.routeEnabled === true;
  const safetyFlags = buildSafetyFlags(
    routeEnabled,
    options.canCreateSearchRoute === true,
    options.canVerifyInstrumentIdentity === true,
    options.canLocateBuySellButtons === true,
  );
  const pkg = options.pkg;

  return {
    ...safetyFlags,
    routeContractId: safeText(input.routeContractId) ?? "avanza-instrument-search-route-contract",
    createdAt: safeText(input.now) ?? defaultCreatedAt,
    mode: input.mode ?? "disabled",
    status,
    label: statusLabel(status),
    reason,
    ticker: pkg?.ticker ?? "missing",
    instrumentName: pkg?.instrumentName ?? "missing",
    expectedMarket: pkg?.expectedMarket ?? "missing",
    expectedCurrency: pkg?.expectedCurrency ?? "missing",
    expectedInstrumentType: pkg?.expectedInstrumentType ?? "missing",
    expectedIsin: pkg?.expectedIsin ?? "missing",
    side: pkg?.side ?? "unknown",
    steps: options.steps ?? disabledStep(reason),
    nextExpectedState:
      options.nextExpectedState ?? "No instrument search route state change.",
    warnings: options.warnings ?? [],
    blockedReasons: options.blockedReasons ?? [],
    safetyFlags,
  };
}

export function buildAvanzaInstrumentSearchRouteContract(
  input: AvanzaInstrumentSearchRouteContractInput = {},
): AvanzaInstrumentSearchRouteContract {
  if (input.forceError === true) {
    return baseContract(input, "error", "Instrument search route returned an error.", {
      blockedReasons: ["Forced error fixture."],
    });
  }

  if (input.forceUnknown === true) {
    return baseContract(input, "unknown", "Instrument search route state is unknown.", {
      blockedReasons: ["Forced unknown fixture."],
    });
  }

  if (input.routeEnabled !== true || input.mode === "disabled") {
    return baseContract(input, "disabled", "Instrument search route is disabled.", {
      blockedReasons: ["Route disabled."],
    });
  }

  const pkg = normalizePackage(input.searchPackage);

  if (!pkg) {
    return baseContract(
      input,
      "waiting_for_search_package",
      "Instrument search route requires ticker or instrument name.",
      { blockedReasons: ["Missing ticker or instrument name."] },
    );
  }

  if (!isSearchSignals(input.realWorldInstrumentSearchSignals)) {
    return baseContract(
      input,
      "waiting_for_search_signals",
      "Instrument search route requires sanitized search signals.",
      { pkg, blockedReasons: ["Missing sanitized search signals."] },
    );
  }

  const signals = input.realWorldInstrumentSearchSignals;

  if (signals.step === "unknown") {
    return baseContract(input, "blocked", "Instrument search signals are unknown.", {
      pkg,
      blockedReasons: ["Unknown instrument search signals."],
    });
  }

  const steps = buildReadySteps(pkg);
  const verificationReady = signals.instrumentVerificationDetected === true;

  return baseContract(
    input,
    verificationReady ? "instrument_verification_ready" : "route_ready",
    "Instrument search route is modeled but not executable.",
    {
      pkg,
      steps,
      warnings: signals.warnings,
      canCreateSearchRoute: true,
      canVerifyInstrumentIdentity: verificationReady,
      canLocateBuySellButtons: signals.buyButtonDetected || signals.sellButtonDetected,
      nextExpectedState:
        pkg.side === "sell"
          ? "Future route would stop before SÄLJ entry click."
          : "Future route would stop before KÖP entry click.",
    },
  );
}
