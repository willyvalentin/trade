import type {
  AvanzaSettlementNoteSignalPack,
} from "./avanza-real-world-settlement-note-signals";

export type AvanzaSettlementNoteRouteStatus =
  | "disabled"
  | "waiting_for_trade_reference"
  | "waiting_for_settlement_signals"
  | "route_ready"
  | "transaction_match_ready"
  | "settlement_note_ready"
  | "blocked"
  | "error"
  | "unknown";

export type AvanzaSettlementNoteRouteStepType =
  | "no_op"
  | "open_min_ekonomi"
  | "open_transactions_tab"
  | "filter_or_locate_transaction"
  | "match_transaction_by_trade_reference"
  | "open_transaction_detail_panel"
  | "locate_settlement_note"
  | "open_settlement_note"
  | "stop_before_note_read"
  | "stop_for_manual_user_action";

export type AvanzaSettlementNoteRouteMode =
  | "disabled"
  | "route_model"
  | "local_dev_route_model";

export type AvanzaSettlementNoteRouteSide = "buy" | "sell" | "unknown";

export type AvanzaSettlementTradeReference = {
  tradeReferenceId?: string;
  createdAt?: string;
  source?: "trade_reference" | "broker_confirmation" | "manual_review" | "fixture";
  side?: AvanzaSettlementNoteRouteSide;
  ticker?: string;
  instrumentName?: string;
  quantity?: number;
  estimatedExecutionPrice?: number;
  estimatedGrossAmount?: number;
  estimatedTradeDate?: string;
  expectedSettlementDate?: string;
  currency?: string;
  brokerOrderReference?: string;
  recommendationId?: string;
  positionId?: string;
  now?: string;
};

export type AvanzaSettlementNoteRouteStepValueSource =
  | "none"
  | "trade_reference"
  | "settlement_signals"
  | "static_safe_signal"
  | "user_review";

export type AvanzaSettlementNoteRouteStep = {
  stepId: string;
  type: AvanzaSettlementNoteRouteStepType;
  label: string;
  reason: string;
  targetSignalText?: string;
  valueSource: AvanzaSettlementNoteRouteStepValueSource;
  safeDisplayValue?: string;
  executableInThisTask: false;
  dryRunOnly: true;
  requiresHumanAction: boolean;
  forbidden: boolean;
  expectedResult: string;
};

export type AvanzaSettlementNoteRouteSafetyFlags = {
  routeEnabled: boolean;
  canCreateSettlementRoute: boolean;
  canExecuteSettlementRoute: false;
  canOpenMinEkonomi: false;
  canOpenTransactions: false;
  canFilterTransactions: false;
  canMatchTransaction: boolean;
  canOpenTransactionDetail: false;
  canLocateSettlementNote: boolean;
  canOpenSettlementNote: false;
  canReadSettlementDocument: false;
  canExtractSettlementValues: false;
  canWriteTradeReconciliation: false;
  canReadCookies: false;
  canExportSession: false;
  canAutomateBankId: false;
  canBypassBankId: false;
  userMustConfirm: true;
  finalHumanClickRequired: true;
  controlsEnabled: false;
  gateLocked: true;
};

export type AvanzaSettlementNoteRouteContract =
  AvanzaSettlementNoteRouteSafetyFlags & {
    routeContractId: string;
    createdAt: string;
    mode: AvanzaSettlementNoteRouteMode;
    status: AvanzaSettlementNoteRouteStatus;
    label: string;
    reason: string;
    side: AvanzaSettlementNoteRouteSide;
    ticker: string;
    instrumentName: string;
    quantity: number;
    estimatedTradeDate: string;
    expectedSettlementDate: string;
    currency: string;
    steps: AvanzaSettlementNoteRouteStep[];
    nextExpectedState: string;
    warnings: string[];
    blockedReasons: string[];
    safetyFlags: AvanzaSettlementNoteRouteSafetyFlags;
  };

export type AvanzaSettlementNoteRouteContractInput = {
  mode?: AvanzaSettlementNoteRouteMode;
  routeEnabled?: boolean;
  tradeReference?: AvanzaSettlementTradeReference;
  realWorldSettlementSignals?: unknown;
  now?: string;
  routeContractId?: string;
  forceError?: boolean;
  forceUnknown?: boolean;
  forceBlockedReason?: string;
};

const defaultCreatedAt = "2026-07-06T12:00:00.000Z";
const unsafeTextPattern =
  /account\s*id|accountid|account\s*number|accountnumber|bankid|cookie|credential|password\s*[:=]|personnummer|\d{6}[-+]?\d{4}|\d{8}[-+]?\d{4}|secret|session|storage|token|order\s*id|orderid/i;

function safeText(value: unknown) {
  if (typeof value !== "string") return undefined;

  const text = value.trim();

  if (!text) return undefined;
  if (unsafeTextPattern.test(text)) return undefined;

  return text;
}

function safeNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : undefined;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSettlementSignals(
  value: unknown,
): value is AvanzaSettlementNoteSignalPack {
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
  canCreateSettlementRoute: boolean,
  canMatchTransaction: boolean,
  canLocateSettlementNote: boolean,
): AvanzaSettlementNoteRouteSafetyFlags {
  return {
    routeEnabled,
    canCreateSettlementRoute,
    canExecuteSettlementRoute: false,
    canOpenMinEkonomi: false,
    canOpenTransactions: false,
    canFilterTransactions: false,
    canMatchTransaction,
    canOpenTransactionDetail: false,
    canLocateSettlementNote,
    canOpenSettlementNote: false,
    canReadSettlementDocument: false,
    canExtractSettlementValues: false,
    canWriteTradeReconciliation: false,
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

function step(
  stepId: string,
  type: AvanzaSettlementNoteRouteStepType,
  label: string,
  reason: string,
  expectedResult: string,
  options: {
    targetSignalText?: string;
    valueSource?: AvanzaSettlementNoteRouteStepValueSource;
    safeDisplayValue?: string;
    requiresHumanAction?: boolean;
    forbidden?: boolean;
  } = {},
): AvanzaSettlementNoteRouteStep {
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

function disabledSteps(reason: string) {
  return [
    step(
      "no_op_disabled",
      "no_op",
      "No settlement note route",
      reason,
      "No settlement route step is planned.",
      { forbidden: true },
    ),
  ];
}

function statusLabel(status: AvanzaSettlementNoteRouteStatus) {
  switch (status) {
    case "disabled":
      return "Settlement note route disabled";
    case "waiting_for_trade_reference":
      return "Settlement note route waiting for trade reference";
    case "waiting_for_settlement_signals":
      return "Settlement note route waiting for settlement signals";
    case "route_ready":
      return "Settlement note route ready";
    case "transaction_match_ready":
      return "Settlement transaction match ready";
    case "settlement_note_ready":
      return "Settlement note location ready";
    case "blocked":
      return "Settlement note route blocked";
    case "error":
      return "Settlement note route error";
    case "unknown":
      return "Settlement note route unknown";
  }
}

type NormalizedTradeReference = {
  side: AvanzaSettlementNoteRouteSide;
  ticker: string;
  instrumentName: string;
  quantity: number;
  estimatedTradeDate: string;
  expectedSettlementDate: string;
  currency: string;
};

function normalizeTradeReference(
  tradeReference: AvanzaSettlementTradeReference | undefined,
): NormalizedTradeReference | undefined {
  if (!tradeReference) return undefined;

  const ticker = safeText(tradeReference.ticker);
  const quantity = safeNumber(tradeReference.quantity);

  if (!ticker || !quantity) return undefined;

  return {
    ticker,
    quantity,
    side:
      tradeReference.side === "sell"
        ? "sell"
        : tradeReference.side === "buy"
          ? "buy"
          : "unknown",
    instrumentName: safeText(tradeReference.instrumentName) ?? "missing",
    estimatedTradeDate: safeText(tradeReference.estimatedTradeDate) ?? "missing",
    expectedSettlementDate:
      safeText(tradeReference.expectedSettlementDate) ?? "missing",
    currency: safeText(tradeReference.currency) ?? "missing",
  };
}

function buildReadySteps(tradeReference: NormalizedTradeReference) {
  const sideText = tradeReference.side === "sell" ? "Sälj" : "Köp";

  return [
    step(
      "open_min_ekonomi",
      "open_min_ekonomi",
      "Open Min ekonomi",
      "Min ekonomi is visible in sanitized settlement-flow material.",
      "Future route would open Min ekonomi.",
      { targetSignalText: "Min ekonomi", valueSource: "static_safe_signal" },
    ),
    step(
      "open_transactions_tab",
      "open_transactions_tab",
      "Open Transaktioner",
      "Transaktioner is visible under Min ekonomi.",
      "Future route would open the transactions view.",
      { targetSignalText: "Transaktioner", valueSource: "static_safe_signal" },
    ),
    step(
      "filter_or_locate_transaction",
      "filter_or_locate_transaction",
      "Filter or locate transaction",
      "Trade reference fields provide the safe matching hints.",
      "Future route would narrow the transaction list.",
      {
        targetSignalText: "Transaktion",
        valueSource: "trade_reference",
        safeDisplayValue: [
          sideText,
          tradeReference.ticker,
          String(tradeReference.quantity),
        ].join(" / "),
      },
    ),
    step(
      "match_transaction_by_trade_reference",
      "match_transaction_by_trade_reference",
      "Match transaction by trade reference",
      "Ticker, side, quantity, date, and currency are modeled as read-only matching inputs.",
      "Future route would match the visible row to the trade reference.",
      {
        targetSignalText: sideText,
        valueSource: "trade_reference",
        safeDisplayValue: tradeReference.instrumentName,
        requiresHumanAction: true,
      },
    ),
    step(
      "open_transaction_detail_panel",
      "open_transaction_detail_panel",
      "Open transaction detail panel",
      "The sanitized flow shows a side panel for transaction details.",
      "Future route would open transaction detail.",
      {
        targetSignalText: "Avräkningsinformation",
        valueSource: "settlement_signals",
        requiresHumanAction: true,
      },
    ),
    step(
      "locate_settlement_note",
      "locate_settlement_note",
      "Locate Avräkningsnota",
      "Avräkningsnota is visible from the detail panel.",
      "Future route would locate the settlement note link.",
      {
        targetSignalText: "Avräkningsnota",
        valueSource: "settlement_signals",
        requiresHumanAction: true,
      },
    ),
    step(
      "open_settlement_note",
      "open_settlement_note",
      "Open Avräkningsnota",
      "Opening the note is not executable in this task.",
      "Future route would open the settlement note.",
      {
        targetSignalText: "Avräkningsnota",
        valueSource: "user_review",
        requiresHumanAction: true,
        forbidden: true,
      },
    ),
    step(
      "stop_before_note_read",
      "stop_before_note_read",
      "Stop before note read",
      "Document/PDF read is not implemented in this task.",
      "The route stops before settlement document read.",
      {
        targetSignalText: "Avräkningsnota",
        valueSource: "user_review",
        requiresHumanAction: true,
        forbidden: true,
      },
    ),
  ];
}

function baseContract(
  input: AvanzaSettlementNoteRouteContractInput,
  status: AvanzaSettlementNoteRouteStatus,
  reason: string,
  options: {
    tradeReference?: NormalizedTradeReference;
    steps?: AvanzaSettlementNoteRouteStep[];
    warnings?: string[];
    blockedReasons?: string[];
    canCreateSettlementRoute?: boolean;
    canMatchTransaction?: boolean;
    canLocateSettlementNote?: boolean;
    nextExpectedState?: string;
  } = {},
): AvanzaSettlementNoteRouteContract {
  const routeEnabled = input.routeEnabled === true;
  const safetyFlags = buildSafetyFlags(
    routeEnabled,
    options.canCreateSettlementRoute === true,
    options.canMatchTransaction === true,
    options.canLocateSettlementNote === true,
  );
  const tradeReference = options.tradeReference;

  return {
    ...safetyFlags,
    routeContractId:
      safeText(input.routeContractId) ?? "avanza-settlement-note-route-contract",
    createdAt: safeText(input.now) ?? defaultCreatedAt,
    mode: input.mode ?? "disabled",
    status,
    label: statusLabel(status),
    reason,
    side: tradeReference?.side ?? "unknown",
    ticker: tradeReference?.ticker ?? "missing",
    instrumentName: tradeReference?.instrumentName ?? "missing",
    quantity: tradeReference?.quantity ?? 0,
    estimatedTradeDate: tradeReference?.estimatedTradeDate ?? "missing",
    expectedSettlementDate: tradeReference?.expectedSettlementDate ?? "missing",
    currency: tradeReference?.currency ?? "missing",
    steps: options.steps ?? disabledSteps(reason),
    nextExpectedState:
      options.nextExpectedState ?? "No settlement note route state change.",
    warnings: options.warnings ?? [],
    blockedReasons: options.blockedReasons ?? [],
    safetyFlags,
  };
}

export function buildAvanzaSettlementNoteRouteContract(
  input: AvanzaSettlementNoteRouteContractInput = {},
): AvanzaSettlementNoteRouteContract {
  if (input.forceError === true) {
    return baseContract(input, "error", "Settlement note route returned an error.", {
      blockedReasons: ["Forced error fixture."],
    });
  }

  if (input.forceUnknown === true) {
    return baseContract(input, "unknown", "Settlement note route state is unknown.", {
      blockedReasons: ["Forced unknown fixture."],
    });
  }

  if (input.routeEnabled !== true || input.mode === "disabled") {
    return baseContract(input, "disabled", "Settlement note route is disabled.", {
      blockedReasons: ["Route disabled."],
    });
  }

  const tradeReference = normalizeTradeReference(input.tradeReference);

  if (!tradeReference) {
    return baseContract(
      input,
      "waiting_for_trade_reference",
      "Settlement note route requires a valid trade reference.",
      { blockedReasons: ["Missing ticker or positive quantity."] },
    );
  }

  if (!isSettlementSignals(input.realWorldSettlementSignals)) {
    return baseContract(
      input,
      "waiting_for_settlement_signals",
      "Settlement note route requires sanitized settlement signals.",
      {
        tradeReference,
        blockedReasons: ["Missing sanitized settlement note signals."],
      },
    );
  }

  const signals = input.realWorldSettlementSignals;

  if (input.forceBlockedReason) {
    return baseContract(input, "blocked", "Settlement note route is blocked.", {
      tradeReference,
      blockedReasons: [safeText(input.forceBlockedReason) ?? "Forced block."],
    });
  }

  if (signals.step === "unknown") {
    return baseContract(input, "blocked", "Settlement note signals are unknown.", {
      tradeReference,
      blockedReasons: ["Unknown settlement note signals."],
    });
  }

  const steps = buildReadySteps(tradeReference);
  const status = signals.settlementNoteDetected
    ? "settlement_note_ready"
    : signals.matchingTransactionDetected
      ? "transaction_match_ready"
      : "route_ready";

  return baseContract(
    input,
    status,
    "Settlement note route is modeled but not executable.",
    {
      tradeReference,
      steps,
      warnings: signals.warnings,
      canCreateSettlementRoute: true,
      canMatchTransaction: signals.matchingTransactionDetected,
      canLocateSettlementNote: signals.settlementNoteDetected,
      nextExpectedState:
        "Future route would stop before Avräkningsnota document read.",
    },
  );
}
