import type {
  AvanzaSettlementNoteRouteContract,
} from "./avanza-settlement-note-route-contract";

export type AvanzaSettlementNoteActionContractStatus =
  | "disabled"
  | "no_action_needed"
  | "action_plan_ready"
  | "waiting_for_route"
  | "blocked"
  | "error"
  | "unknown";

export type AvanzaSettlementNoteActionType =
  | "no_op"
  | "click_min_ekonomi"
  | "click_transactions_tab"
  | "filter_transactions"
  | "locate_matching_transaction"
  | "open_transaction_detail_panel"
  | "locate_settlement_note"
  | "open_settlement_note"
  | "stop_before_document_read"
  | "stop_for_manual_user_action";

export type AvanzaSettlementNoteActionExecutionMode =
  | "disabled"
  | "contract_only"
  | "local_dev_dry_run"
  | "local_dev_execute_later";

export type AvanzaSettlementNoteActionValueSource =
  | "none"
  | "trade_reference"
  | "settlement_signals"
  | "static_safe_signal"
  | "user_review";

export type AvanzaSettlementNoteAction = {
  actionId: string;
  type: AvanzaSettlementNoteActionType;
  label: string;
  reason: string;
  targetSignalText?: string;
  valueSource: AvanzaSettlementNoteActionValueSource;
  safeDisplayValue?: string;
  containsCredentialMaterial: false;
  executableInThisTask: false;
  dryRunOnly: true;
  requiresHumanAction: boolean;
  forbidden: boolean;
  expectedResult: string;
};

export type AvanzaSettlementNoteActionContractSafetyFlags = {
  contractEnabled: boolean;
  canCreateActionPlan: boolean;
  canExecuteActions: false;
  canClickMinEkonomi: false;
  canClickTransactionsTab: false;
  canFilterTransactions: false;
  canLocateMatchingTransaction: boolean;
  canOpenTransactionDetailPanel: false;
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

export type AvanzaSettlementNoteActionContract =
  AvanzaSettlementNoteActionContractSafetyFlags & {
    contractId: string;
    createdAt: string;
    mode: AvanzaSettlementNoteActionExecutionMode;
    status: AvanzaSettlementNoteActionContractStatus;
    label: string;
    reason: string;
    side: "buy" | "sell" | "unknown";
    ticker: string;
    instrumentName: string;
    quantity: number;
    estimatedTradeDate: string;
    expectedSettlementDate: string;
    actions: AvanzaSettlementNoteAction[];
    nextExpectedSettlementState: string;
    warnings: string[];
    blockedReasons: string[];
    safetyFlags: AvanzaSettlementNoteActionContractSafetyFlags;
  };

export type AvanzaSettlementNoteActionContractInput = {
  mode?: AvanzaSettlementNoteActionExecutionMode;
  contractEnabled?: boolean;
  settlementNoteRouteContract?: unknown;
  realWorldSettlementSignals?: unknown;
  now?: string;
  contractId?: string;
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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isRouteContract(
  value: unknown,
): value is AvanzaSettlementNoteRouteContract {
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
  canLocateMatchingTransaction: boolean,
  canLocateSettlementNote: boolean,
): AvanzaSettlementNoteActionContractSafetyFlags {
  return {
    contractEnabled,
    canCreateActionPlan,
    canExecuteActions: false,
    canClickMinEkonomi: false,
    canClickTransactionsTab: false,
    canFilterTransactions: false,
    canLocateMatchingTransaction,
    canOpenTransactionDetailPanel: false,
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

function action(
  actionId: string,
  type: AvanzaSettlementNoteActionType,
  label: string,
  reason: string,
  expectedResult: string,
  options: {
    targetSignalText?: string;
    valueSource?: AvanzaSettlementNoteActionValueSource;
    safeDisplayValue?: string;
    requiresHumanAction?: boolean;
    forbidden?: boolean;
  } = {},
): AvanzaSettlementNoteAction {
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

function disabledActions(reason: string) {
  return [
    action(
      "no_op_disabled",
      "no_op",
      "No settlement note action",
      reason,
      "No settlement note action is planned.",
      { forbidden: true },
    ),
  ];
}

function statusLabel(status: AvanzaSettlementNoteActionContractStatus) {
  switch (status) {
    case "disabled":
      return "Settlement note action contract disabled";
    case "no_action_needed":
      return "No settlement note action needed";
    case "action_plan_ready":
      return "Settlement note action plan ready";
    case "waiting_for_route":
      return "Settlement note action contract waiting for route";
    case "blocked":
      return "Settlement note action contract blocked";
    case "error":
      return "Settlement note action contract error";
    case "unknown":
      return "Settlement note action contract unknown";
  }
}

function buildReadyActions(route: AvanzaSettlementNoteRouteContract) {
  const sideText = route.side === "sell" ? "Sälj" : "Köp";

  return [
    action(
      "click_min_ekonomi",
      "click_min_ekonomi",
      "Click Min ekonomi",
      "Min ekonomi is the entry point for transaction history.",
      "Future action would open Min ekonomi.",
      { targetSignalText: "Min ekonomi", valueSource: "static_safe_signal" },
    ),
    action(
      "click_transactions_tab",
      "click_transactions_tab",
      "Click Transaktioner",
      "Transaktioner is visible in sanitized settlement-flow material.",
      "Future action would open the transaction list.",
      { targetSignalText: "Transaktioner", valueSource: "static_safe_signal" },
    ),
    action(
      "filter_transactions",
      "filter_transactions",
      "Filter transactions",
      "Trade reference fields are modeled as safe matching hints.",
      "Future action would filter or scan the transaction list.",
      {
        targetSignalText: "Transaktion",
        valueSource: "trade_reference",
        safeDisplayValue: [sideText, route.ticker, String(route.quantity)].join(
          " / ",
        ),
      },
    ),
    action(
      "locate_matching_transaction",
      "locate_matching_transaction",
      "Locate matching transaction",
      "The matching transaction is modeled from side, ticker, quantity, date, and currency.",
      "Future action would locate the row in read-only mode.",
      {
        targetSignalText: sideText,
        valueSource: "trade_reference",
        safeDisplayValue: route.instrumentName,
        requiresHumanAction: true,
      },
    ),
    action(
      "open_transaction_detail_panel",
      "open_transaction_detail_panel",
      "Open transaction detail panel",
      "The sanitized flow shows a detail panel for the transaction.",
      "Future action would open the detail panel.",
      {
        targetSignalText: "Avräkningsinformation",
        valueSource: "settlement_signals",
        requiresHumanAction: true,
      },
    ),
    action(
      "locate_settlement_note",
      "locate_settlement_note",
      "Locate Avräkningsnota",
      "Avräkningsnota is the future source for exact settlement values.",
      "Future action would locate the note link.",
      {
        targetSignalText: "Avräkningsnota",
        valueSource: "settlement_signals",
        requiresHumanAction: true,
      },
    ),
    action(
      "open_settlement_note",
      "open_settlement_note",
      "Open Avräkningsnota",
      "Opening the settlement note is not executable in this task.",
      "Future action would open the note before a separate read/extraction layer.",
      {
        targetSignalText: "Avräkningsnota",
        valueSource: "user_review",
        requiresHumanAction: true,
        forbidden: true,
      },
    ),
    action(
      "stop_before_document_read",
      "stop_before_document_read",
      "Stop before document read",
      "Document/PDF read, OCR, and extraction are not implemented.",
      "The action plan stops before settlement document read.",
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
  input: AvanzaSettlementNoteActionContractInput,
  status: AvanzaSettlementNoteActionContractStatus,
  reason: string,
  options: {
    route?: AvanzaSettlementNoteRouteContract;
    actions?: AvanzaSettlementNoteAction[];
    blockedReasons?: string[];
    warnings?: string[];
    canCreateActionPlan?: boolean;
    canLocateMatchingTransaction?: boolean;
    canLocateSettlementNote?: boolean;
    nextExpectedSettlementState?: string;
  } = {},
): AvanzaSettlementNoteActionContract {
  const contractEnabled = input.contractEnabled === true;
  const route = options.route;
  const safetyFlags = buildSafetyFlags(
    contractEnabled,
    options.canCreateActionPlan === true,
    options.canLocateMatchingTransaction === true,
    options.canLocateSettlementNote === true,
  );

  return {
    ...safetyFlags,
    contractId:
      safeText(input.contractId) ?? "avanza-settlement-note-action-contract",
    createdAt: safeText(input.now) ?? defaultCreatedAt,
    mode: input.mode ?? "disabled",
    status,
    label: statusLabel(status),
    reason,
    side: route?.side ?? "unknown",
    ticker: route?.ticker ?? "missing",
    instrumentName: route?.instrumentName ?? "missing",
    quantity: route?.quantity ?? 0,
    estimatedTradeDate: route?.estimatedTradeDate ?? "missing",
    expectedSettlementDate: route?.expectedSettlementDate ?? "missing",
    actions: options.actions ?? disabledActions(reason),
    nextExpectedSettlementState:
      options.nextExpectedSettlementState ??
      "No settlement note action state change.",
    warnings: options.warnings ?? route?.warnings ?? [],
    blockedReasons: options.blockedReasons ?? route?.blockedReasons ?? [],
    safetyFlags,
  };
}

export function buildAvanzaSettlementNoteActionContract(
  input: AvanzaSettlementNoteActionContractInput = {},
): AvanzaSettlementNoteActionContract {
  if (input.contractEnabled !== true || input.mode === "disabled") {
    return baseContract(input, "disabled", "Settlement note action contract is disabled.", {
      blockedReasons: ["Contract disabled."],
    });
  }

  if (input.settlementNoteRouteContract === undefined) {
    return baseContract(
      input,
      "waiting_for_route",
      "Settlement note action contract requires a route contract.",
      { blockedReasons: ["Missing settlement note route contract."] },
    );
  }

  if (!isRouteContract(input.settlementNoteRouteContract)) {
    return baseContract(
      input,
      "blocked",
      "Settlement note action contract received an invalid route.",
      { blockedReasons: ["Invalid settlement note route contract."] },
    );
  }

  const route = input.settlementNoteRouteContract;

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
    route.status !== "transaction_match_ready" &&
    route.status !== "settlement_note_ready"
  ) {
    return baseContract(
      input,
      "waiting_for_route",
      "Settlement note action contract requires a ready route.",
      { route, blockedReasons: ["Waiting for ready settlement note route."] },
    );
  }

  return baseContract(
    input,
    "action_plan_ready",
    "Settlement note actions are modeled but not executable.",
    {
      route,
      actions: buildReadyActions(route),
      canCreateActionPlan: true,
      canLocateMatchingTransaction: route.canMatchTransaction,
      canLocateSettlementNote: route.canLocateSettlementNote,
      nextExpectedSettlementState:
        "Future action plan would stop before Avräkningsnota document read.",
    },
  );
}
