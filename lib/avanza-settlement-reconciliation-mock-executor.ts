import type {
  AvanzaSettlementReconciliationDryRunReport,
} from "./avanza-settlement-reconciliation-dry-run-executor";
import type {
  AvanzaSettlementNoteActionContract,
} from "./avanza-settlement-note-action-contract";
import type {
  AvanzaSettlementExtractionSchemaResult,
} from "./avanza-settlement-note-extraction-schema";
import type {
  AvanzaSettlementNoteRouteContract,
  AvanzaSettlementTradeReference,
} from "./avanza-settlement-note-route-contract";
import type {
  AvanzaSettlementReconciliationPreview,
} from "./avanza-settlement-reconciliation-mapping";

export type AvanzaSettlementReconciliationMockExecutorStatus =
  | "disabled"
  | "mock_ready"
  | "mock_executed"
  | "mock_blocked"
  | "mock_transaction_not_found"
  | "mock_note_unavailable"
  | "mock_extraction_blocked"
  | "mock_reconciliation_preview_ready"
  | "mock_manual_review_required"
  | "mock_error"
  | "unknown";

export type AvanzaSettlementReconciliationMockActionStatus =
  | "skipped"
  | "simulated"
  | "blocked"
  | "blocked_transaction_not_found"
  | "blocked_note_unavailable"
  | "blocked_extraction"
  | "manual_review_required"
  | "forbidden"
  | "error";

export type AvanzaSettlementReconciliationMockPageStateKind =
  | "initial_logged_in_page"
  | "min_ekonomi_page"
  | "transactions_tab_open"
  | "transaction_list_visible"
  | "matching_transaction_visible"
  | "transaction_detail_panel_open"
  | "settlement_note_available"
  | "settlement_note_document_visible"
  | "settlement_values_visible"
  | "reconciliation_preview_ready"
  | "manual_review_gate"
  | "unknown";

export type AvanzaSettlementReconciliationMockExecutorMode =
  | "disabled"
  | "mock_local_dev";

export type AvanzaSettlementReconciliationMockValueSource =
  | "none"
  | "trade_reference"
  | "settlement_route"
  | "settlement_action_contract"
  | "extraction_schema"
  | "reconciliation_mapping"
  | "synthetic_masked_value"
  | "user_review";

export type AvanzaSettlementReconciliationMockPageState = {
  stateId: string;
  kind: AvanzaSettlementReconciliationMockPageStateKind;
  minEkonomiVisible: boolean;
  transactionsTabVisible: boolean;
  transactionListVisible: boolean;
  matchingTransactionVisible: boolean;
  transactionDetailPanelVisible: boolean;
  settlementNoteVisible: boolean;
  settlementDocumentVisible: boolean;
  settlementValuesVisible: boolean;
  courtageLabelVisible: boolean;
  fxRateLabelVisible: boolean;
  settlementAmountLabelVisible: boolean;
  tradeDateLabelVisible: boolean;
  settlementDateLabelVisible: boolean;
  quantityLabelVisible: boolean;
  priceLabelVisible: boolean;
  manualReviewVisible: boolean;
  visibleTexts: string[];
  warnings: string[];
  blockedReasons: string[];
};

export type AvanzaSettlementReconciliationMockActionReport = {
  actionId: string;
  actionType: string;
  label: string;
  executionStatus: AvanzaSettlementReconciliationMockActionStatus;
  simulatedTargetText?: string;
  simulatedValueSource: AvanzaSettlementReconciliationMockValueSource;
  safeDisplayValue?: string;
  containsCredentialMaterial: false;
  realBrowserAction: false;
  documentRead: false;
  ocrUsed: false;
  valueExtractedFromRealDocument: false;
  writesInThisTask: false;
  expectedResult: string;
  actualMockResult: string;
  blockedReason?: string;
};

export type AvanzaSettlementReconciliationMockExecutorSafetyFlags = {
  mockExecutorEnabled: boolean;
  mockOnly: true;
  canExecuteMockActions: boolean;
  canExecuteRealBrowserActions: false;
  canNavigateRealBrowser: false;
  canOpenSettlementNoteReal: false;
  canReadSettlementDocumentReal: false;
  canDownloadPdfReal: false;
  canUseOcrReal: false;
  canExtractValuesReal: false;
  canBuildReconciliationPreview: boolean;
  canApplyReconciliation: false;
  canWriteExecutionRecord: false;
  canWriteTradeResult: false;
  canWriteStatistics: false;
  canWriteAuditMetadata: false;
  canWriteSupabase: false;
  canReadCookies: false;
  canExportSession: false;
  canAutomateBankId: false;
  canBypassBankId: false;
  valuesAreMaskedOrSynthetic: true;
  requiresManualReview: true;
  userMustConfirm: true;
  controlsEnabled: false;
  gateLocked: true;
};

export type AvanzaSettlementReconciliationMockedExtractedValue = {
  valueKey:
    | "courtage"
    | "fxRate"
    | "settlementAmount"
    | "tradeDate"
    | "settlementDate"
    | "quantity"
    | "executionPrice"
    | "currency";
  label: string;
  safeDisplayValue: string;
  simulatedValueSource: "synthetic_masked_value";
  masked: true;
  synthetic: true;
  valueExtractedFromRealDocument: false;
  requiresManualReview: true;
};

export type AvanzaSettlementReconciliationMockExecutorReport =
  AvanzaSettlementReconciliationMockExecutorSafetyFlags & {
    reportId: string;
    createdAt: string;
    mode: AvanzaSettlementReconciliationMockExecutorMode;
    status: AvanzaSettlementReconciliationMockExecutorStatus;
    label: string;
    reason: string;
    side: "buy" | "sell" | "unknown";
    ticker: string;
    instrumentName?: string;
    quantity?: number;
    estimatedTradeDate?: string;
    expectedSettlementDate?: string;
    initialPageStateKind: AvanzaSettlementReconciliationMockPageStateKind;
    finalPageStateKind: AvanzaSettlementReconciliationMockPageStateKind;
    transactionMatched: boolean;
    settlementNoteAvailable: boolean;
    settlementValuesModeled: boolean;
    reconciliationPreviewReady: boolean;
    manualReviewRequired: true;
    actionReports: AvanzaSettlementReconciliationMockActionReport[];
    mockedExtractedValues: AvanzaSettlementReconciliationMockedExtractedValue[];
    warnings: string[];
    blockedReasons: string[];
    safetyFlags: AvanzaSettlementReconciliationMockExecutorSafetyFlags;
  };

export type AvanzaSettlementReconciliationMockExecutorInput = {
  mode?: AvanzaSettlementReconciliationMockExecutorMode;
  mockExecutorEnabled?: boolean;
  dryRunReport?: unknown;
  tradeReference?: unknown;
  settlementNoteRouteContract?: unknown;
  settlementNoteActionContract?: unknown;
  extractionSchemaResult?: unknown;
  reconciliationPreview?: unknown;
  initialMockPageState?: unknown;
  now?: string;
  reportId?: string;
  forceError?: boolean;
  forceUnknown?: boolean;
};

const defaultCreatedAt = "2026-07-06T12:00:00.000Z";
const unsafeTextPattern =
  /account\s*id|accountid|account\s*number|accountnumber|bankid|cookie|credential|password\s*[:=]|personnummer|\d{6}[-+]?\d{4}|\d{8}[-+]?\d{4}|secret|session|storage|token/i;

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

function safeNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : undefined;
}

function safeStringArray(values: unknown) {
  return Array.isArray(values)
    ? values.flatMap((value) => {
        const text = safeText(value);

        return text ? [text] : [];
      })
    : [];
}

function isDryRunReport(
  value: unknown,
): value is AvanzaSettlementReconciliationDryRunReport {
  return (
    isPlainObject(value) &&
    typeof value.dryRunId === "string" &&
    typeof value.status === "string" &&
    Array.isArray(value.stepReports)
  );
}

function isTradeReference(value: unknown): value is AvanzaSettlementTradeReference {
  return isPlainObject(value) && typeof value.side === "string";
}

function isRouteContract(
  value: unknown,
): value is AvanzaSettlementNoteRouteContract {
  return (
    isPlainObject(value) &&
    typeof value.routeContractId === "string" &&
    typeof value.status === "string" &&
    Array.isArray(value.steps)
  );
}

function isActionContract(
  value: unknown,
): value is AvanzaSettlementNoteActionContract {
  return (
    isPlainObject(value) &&
    typeof value.contractId === "string" &&
    typeof value.status === "string" &&
    Array.isArray(value.actions)
  );
}

function isExtractionSchema(
  value: unknown,
): value is AvanzaSettlementExtractionSchemaResult {
  return (
    isPlainObject(value) &&
    typeof value.schemaId === "string" &&
    typeof value.status === "string" &&
    Array.isArray(value.extractionTargets)
  );
}

function isReconciliationPreview(
  value: unknown,
): value is AvanzaSettlementReconciliationPreview {
  return (
    isPlainObject(value) &&
    typeof value.previewId === "string" &&
    typeof value.status === "string" &&
    Array.isArray(value.fields)
  );
}

function isMockPageState(
  value: unknown,
): value is AvanzaSettlementReconciliationMockPageState {
  return (
    isPlainObject(value) &&
    typeof value.stateId === "string" &&
    typeof value.kind === "string"
  );
}

function sideFrom(value: unknown): "buy" | "sell" | "unknown" {
  if (!isPlainObject(value)) return "unknown";
  return value.side === "buy" ? "buy" : value.side === "sell" ? "sell" : "unknown";
}

function statusLabel(status: AvanzaSettlementReconciliationMockExecutorStatus) {
  switch (status) {
    case "disabled":
      return "Settlement reconciliation mock executor disabled";
    case "mock_ready":
      return "Settlement reconciliation mock executor ready";
    case "mock_executed":
      return "Settlement reconciliation mock executor executed";
    case "mock_blocked":
      return "Settlement reconciliation mock executor blocked";
    case "mock_transaction_not_found":
      return "Settlement reconciliation mock transaction not found";
    case "mock_note_unavailable":
      return "Settlement reconciliation mock note unavailable";
    case "mock_extraction_blocked":
      return "Settlement reconciliation mock extraction blocked";
    case "mock_reconciliation_preview_ready":
      return "Settlement reconciliation mock preview ready";
    case "mock_manual_review_required":
      return "Settlement reconciliation mock manual review required";
    case "mock_error":
      return "Settlement reconciliation mock error";
    case "unknown":
      return "Settlement reconciliation mock unknown";
  }
}

function safetyFlags(options: {
  mockExecutorEnabled: boolean;
  canExecuteMockActions?: boolean;
  canBuildReconciliationPreview?: boolean;
}): AvanzaSettlementReconciliationMockExecutorSafetyFlags {
  return {
    mockExecutorEnabled: options.mockExecutorEnabled,
    mockOnly: true,
    canExecuteMockActions: options.canExecuteMockActions === true,
    canExecuteRealBrowserActions: false,
    canNavigateRealBrowser: false,
    canOpenSettlementNoteReal: false,
    canReadSettlementDocumentReal: false,
    canDownloadPdfReal: false,
    canUseOcrReal: false,
    canExtractValuesReal: false,
    canBuildReconciliationPreview:
      options.canBuildReconciliationPreview === true,
    canApplyReconciliation: false,
    canWriteExecutionRecord: false,
    canWriteTradeResult: false,
    canWriteStatistics: false,
    canWriteAuditMetadata: false,
    canWriteSupabase: false,
    canReadCookies: false,
    canExportSession: false,
    canAutomateBankId: false,
    canBypassBankId: false,
    valuesAreMaskedOrSynthetic: true,
    requiresManualReview: true,
    userMustConfirm: true,
    controlsEnabled: false,
    gateLocked: true,
  };
}

function action(
  actionId: string,
  actionType: string,
  label: string,
  executionStatus: AvanzaSettlementReconciliationMockActionStatus,
  expectedResult: string,
  actualMockResult: string,
  options: {
    simulatedTargetText?: string;
    simulatedValueSource?: AvanzaSettlementReconciliationMockValueSource;
    safeDisplayValue?: string;
    blockedReason?: string;
  } = {},
): AvanzaSettlementReconciliationMockActionReport {
  return {
    actionId,
    actionType,
    label,
    executionStatus,
    simulatedTargetText: options.simulatedTargetText,
    simulatedValueSource: options.simulatedValueSource ?? "none",
    safeDisplayValue: options.safeDisplayValue,
    containsCredentialMaterial: false,
    realBrowserAction: false,
    documentRead: false,
    ocrUsed: false,
    valueExtractedFromRealDocument: false,
    writesInThisTask: false,
    expectedResult,
    actualMockResult,
    blockedReason: options.blockedReason,
  };
}

function defaultPageState(
  kind: AvanzaSettlementReconciliationMockPageStateKind,
): AvanzaSettlementReconciliationMockPageState {
  return {
    stateId: `mock-${kind}`,
    kind,
    minEkonomiVisible: false,
    transactionsTabVisible: false,
    transactionListVisible: false,
    matchingTransactionVisible: false,
    transactionDetailPanelVisible: false,
    settlementNoteVisible: false,
    settlementDocumentVisible: false,
    settlementValuesVisible: false,
    courtageLabelVisible: false,
    fxRateLabelVisible: false,
    settlementAmountLabelVisible: false,
    tradeDateLabelVisible: false,
    settlementDateLabelVisible: false,
    quantityLabelVisible: false,
    priceLabelVisible: false,
    manualReviewVisible: false,
    visibleTexts: [],
    warnings: [],
    blockedReasons: [],
  };
}

function pageStateFrom(value: unknown) {
  return isMockPageState(value)
    ? value
    : defaultPageState("initial_logged_in_page");
}

function completedPageState(): AvanzaSettlementReconciliationMockPageState {
  return {
    stateId: "mock-manual-review-gate",
    kind: "manual_review_gate",
    minEkonomiVisible: true,
    transactionsTabVisible: true,
    transactionListVisible: true,
    matchingTransactionVisible: true,
    transactionDetailPanelVisible: true,
    settlementNoteVisible: true,
    settlementDocumentVisible: true,
    settlementValuesVisible: true,
    courtageLabelVisible: true,
    fxRateLabelVisible: true,
    settlementAmountLabelVisible: true,
    tradeDateLabelVisible: true,
    settlementDateLabelVisible: true,
    quantityLabelVisible: true,
    priceLabelVisible: true,
    manualReviewVisible: true,
    visibleTexts: [
      "Min ekonomi",
      "Transaktioner",
      "Matching transaction",
      "Avräkningsnota",
      "Courtage mocked",
      "FX/växelkurs mocked",
      "Settlement amount mocked",
      "Reconciliation preview simulated",
      "Manual review required",
    ],
    warnings: ["Mock values are masked/synthetic and require manual review."],
    blockedReasons: [],
  };
}

function mockedValues(): AvanzaSettlementReconciliationMockedExtractedValue[] {
  return [
    ["courtage", "Courtage mocked", "masked-courtage"],
    ["fxRate", "FX/växelkurs mocked", "masked-fx-rate"],
    ["settlementAmount", "Settlement amount mocked", "masked-settlement-amount"],
    ["tradeDate", "Trade date mocked", "masked-trade-date"],
    ["settlementDate", "Settlement date mocked", "masked-settlement-date"],
    ["quantity", "Quantity mocked", "masked-quantity"],
    ["executionPrice", "Execution price mocked", "masked-execution-price"],
    ["currency", "Currency mocked", "synthetic-currency"],
  ].map(([valueKey, label, safeDisplayValue]) => ({
    valueKey: valueKey as AvanzaSettlementReconciliationMockedExtractedValue["valueKey"],
    label,
    safeDisplayValue,
    simulatedValueSource: "synthetic_masked_value",
    masked: true,
    synthetic: true,
    valueExtractedFromRealDocument: false,
    requiresManualReview: true,
  }));
}

function blockedAction(
  actionId: string,
  label: string,
  executionStatus: AvanzaSettlementReconciliationMockActionStatus,
  blockedReason: string,
) {
  return action(
    actionId,
    actionId,
    label,
    executionStatus,
    "Mock executor stops before the blocked settlement step.",
    "Blocked in model only.",
    { blockedReason },
  );
}

function completedActions() {
  return [
    action(
      "open_min_ekonomi_mock",
      "open_min_ekonomi_mock",
      "Min ekonomi simulated",
      "simulated",
      "Min ekonomi is visible in simulated page state.",
      "min_ekonomi_page",
      {
        simulatedTargetText: "Min ekonomi",
        simulatedValueSource: "settlement_route",
      },
    ),
    action(
      "open_transactions_mock",
      "open_transactions_mock",
      "Transaktioner simulated",
      "simulated",
      "Transactions tab is visible in simulated page state.",
      "transactions_tab_open",
      {
        simulatedTargetText: "Transaktioner",
        simulatedValueSource: "settlement_route",
      },
    ),
    action(
      "show_transaction_list_mock",
      "show_transaction_list_mock",
      "Transaction list simulated",
      "simulated",
      "Transaction list appears in the mock state.",
      "transaction_list_visible",
      { simulatedValueSource: "settlement_route" },
    ),
    action(
      "match_transaction_mock",
      "match_transaction_mock",
      "Transaction matching simulated",
      "simulated",
      "Matching transaction row is visible in the mock state.",
      "matching_transaction_visible",
      { simulatedValueSource: "trade_reference" },
    ),
    action(
      "open_transaction_detail_mock",
      "open_transaction_detail_mock",
      "Transaction detail panel simulated",
      "simulated",
      "Transaction detail panel opens in the mock state.",
      "transaction_detail_panel_open",
      { simulatedValueSource: "settlement_action_contract" },
    ),
    action(
      "locate_settlement_note_mock",
      "locate_settlement_note_mock",
      "Avräkningsnota simulated",
      "simulated",
      "Settlement note link is available in the mock state.",
      "settlement_note_available",
      {
        simulatedTargetText: "Avräkningsnota",
        simulatedValueSource: "settlement_action_contract",
      },
    ),
    action(
      "show_settlement_document_mock",
      "show_settlement_document_mock",
      "Settlement note document simulated",
      "simulated",
      "Settlement document visibility is simulated without reading a real document.",
      "settlement_note_document_visible",
      { simulatedValueSource: "settlement_action_contract" },
    ),
    action(
      "show_settlement_values_mock",
      "show_settlement_values_mock",
      "Settlement values simulated",
      "simulated",
      "Settlement value labels are visible with masked/synthetic values.",
      "settlement_values_visible",
      { simulatedValueSource: "extraction_schema" },
    ),
    action(
      "mock_courtage_value",
      "mock_courtage_value",
      "Courtage mocked",
      "simulated",
      "Courtage is represented by a masked/synthetic value.",
      "masked-courtage",
      {
        simulatedValueSource: "synthetic_masked_value",
        safeDisplayValue: "masked-courtage",
      },
    ),
    action(
      "mock_fx_rate_value",
      "mock_fx_rate_value",
      "FX/växelkurs mocked",
      "simulated",
      "FX/växelkurs is represented by a masked/synthetic value.",
      "masked-fx-rate",
      {
        simulatedValueSource: "synthetic_masked_value",
        safeDisplayValue: "masked-fx-rate",
      },
    ),
    action(
      "mock_settlement_amount_value",
      "mock_settlement_amount_value",
      "Settlement amount mocked",
      "simulated",
      "Settlement amount is represented by a masked/synthetic value.",
      "masked-settlement-amount",
      {
        simulatedValueSource: "synthetic_masked_value",
        safeDisplayValue: "masked-settlement-amount",
      },
    ),
    action(
      "mock_reconciliation_preview",
      "mock_reconciliation_preview",
      "Reconciliation preview simulated",
      "simulated",
      "Reconciliation preview is built in mock model only.",
      "reconciliation_preview_ready",
      { simulatedValueSource: "reconciliation_mapping" },
    ),
    action(
      "manual_review_gate",
      "manual_review_gate",
      "Manual review required",
      "manual_review_required",
      "Mock executor stops at the manual review gate.",
      "manual_review_gate",
      { simulatedValueSource: "user_review" },
    ),
    action(
      "stop_before_reconciliation_write",
      "stop_before_reconciliation_write",
      "Reconciliation write forbidden",
      "forbidden",
      "No reconciliation write is allowed from the mock executor.",
      "writesInThisTask=false",
      { simulatedValueSource: "reconciliation_mapping" },
    ),
  ];
}

function baseReport(
  input: AvanzaSettlementReconciliationMockExecutorInput,
  status: AvanzaSettlementReconciliationMockExecutorStatus,
  reason: string,
  options: {
    dryRun?: AvanzaSettlementReconciliationDryRunReport;
    tradeReference?: AvanzaSettlementTradeReference;
    route?: AvanzaSettlementNoteRouteContract;
    actionContract?: AvanzaSettlementNoteActionContract;
    schema?: AvanzaSettlementExtractionSchemaResult;
    preview?: AvanzaSettlementReconciliationPreview;
    initialPageState?: AvanzaSettlementReconciliationMockPageState;
    finalPageState?: AvanzaSettlementReconciliationMockPageState;
    actionReports?: AvanzaSettlementReconciliationMockActionReport[];
    mockedExtractedValues?: AvanzaSettlementReconciliationMockedExtractedValue[];
    warnings?: string[];
    blockedReasons?: string[];
    canExecuteMockActions?: boolean;
    canBuildReconciliationPreview?: boolean;
  } = {},
): AvanzaSettlementReconciliationMockExecutorReport {
  const flags = safetyFlags({
    mockExecutorEnabled: input.mockExecutorEnabled === true,
    canExecuteMockActions: options.canExecuteMockActions,
    canBuildReconciliationPreview: options.canBuildReconciliationPreview,
  });
  const source =
    options.tradeReference ??
    options.dryRun ??
    options.route ??
    options.schema ??
    options.preview;
  const initialPageState =
    options.initialPageState ?? pageStateFrom(input.initialMockPageState);
  const finalPageState = options.finalPageState ?? initialPageState;

  return {
    ...flags,
    reportId: safeText(input.reportId) ?? "avanza-settlement-mock-executor",
    createdAt: safeText(input.now) ?? defaultCreatedAt,
    mode: input.mode ?? "disabled",
    status,
    label: statusLabel(status),
    reason,
    side: sideFrom(source),
    ticker:
      safeText(options.tradeReference?.ticker) ??
      safeText(options.dryRun?.ticker) ??
      safeText(options.route?.ticker) ??
      safeText(options.schema?.ticker) ??
      safeText(options.preview?.ticker) ??
      "missing",
    instrumentName:
      safeText(options.tradeReference?.instrumentName) ??
      safeText(options.dryRun?.instrumentName) ??
      safeText(options.route?.instrumentName) ??
      safeText(options.schema?.instrumentName),
    quantity:
      safeNumber(options.tradeReference?.quantity) ??
      safeNumber(options.dryRun?.quantity) ??
      safeNumber(options.route?.quantity),
    estimatedTradeDate:
      safeText(options.tradeReference?.estimatedTradeDate) ??
      safeText(options.dryRun?.estimatedTradeDate) ??
      safeText(options.route?.estimatedTradeDate),
    expectedSettlementDate:
      safeText(options.tradeReference?.expectedSettlementDate) ??
      safeText(options.dryRun?.expectedSettlementDate) ??
      safeText(options.route?.expectedSettlementDate),
    initialPageStateKind: initialPageState.kind,
    finalPageStateKind: finalPageState.kind,
    transactionMatched: finalPageState.matchingTransactionVisible,
    settlementNoteAvailable: finalPageState.settlementNoteVisible,
    settlementValuesModeled: finalPageState.settlementValuesVisible,
    reconciliationPreviewReady:
      status === "mock_reconciliation_preview_ready" ||
      status === "mock_manual_review_required" ||
      status === "mock_executed",
    manualReviewRequired: true,
    actionReports: options.actionReports ?? [
      action(
        "mock_not_run",
        "mock_not_run",
        "Settlement mock not run",
        status === "disabled" ? "skipped" : "blocked",
        reason,
        "No mock settlement action simulated.",
        { blockedReason: options.blockedReasons?.[0] },
      ),
    ],
    mockedExtractedValues: options.mockedExtractedValues ?? [],
    warnings: [
      ...safeStringArray(options.dryRun?.warnings),
      ...safeStringArray(options.route?.warnings),
      ...safeStringArray(options.actionContract?.warnings),
      ...safeStringArray(options.schema?.warnings),
      ...safeStringArray(options.preview?.warnings),
      ...(options.warnings ?? []),
    ],
    blockedReasons: [
      ...safeStringArray(options.dryRun?.blockedReasons),
      ...safeStringArray(options.route?.blockedReasons),
      ...safeStringArray(options.actionContract?.blockedReasons),
      ...safeStringArray(options.schema?.blockedReasons),
      ...safeStringArray(options.preview?.blockedReasons),
      ...(options.blockedReasons ?? []),
    ],
    safetyFlags: flags,
  };
}

function isReadyDryRun(report: AvanzaSettlementReconciliationDryRunReport) {
  return (
    report.status === "dry_run_passed" ||
    report.status === "dry_run_manual_review_required"
  );
}

export function buildAvanzaSettlementReconciliationMockExecutorReport(
  input: AvanzaSettlementReconciliationMockExecutorInput = {},
): AvanzaSettlementReconciliationMockExecutorReport {
  if (input.forceError === true) {
    return baseReport(input, "mock_error", "Settlement mock executor error.", {
      blockedReasons: ["Forced error fixture."],
      actionReports: [
        action(
          "mock_error",
          "mock_error",
          "Mock executor error",
          "error",
          "Error fixture remains model-only.",
          "mock_error",
          { blockedReason: "Forced error fixture." },
        ),
      ],
    });
  }

  if (input.forceUnknown === true) {
    return baseReport(input, "unknown", "Settlement mock executor status unknown.", {
      blockedReasons: ["Forced unknown fixture."],
    });
  }

  if (input.mockExecutorEnabled !== true || input.mode !== "mock_local_dev") {
    return baseReport(
      input,
      "disabled",
      "Settlement reconciliation mock executor disabled.",
      { blockedReasons: ["Mock executor disabled."] },
    );
  }

  if (!isDryRunReport(input.dryRunReport) || !isReadyDryRun(input.dryRunReport)) {
    return baseReport(
      input,
      "mock_blocked",
      "Settlement mock requires a passed dry-run report.",
      {
        blockedReasons: ["Missing or blocked dry-run report."],
        actionReports: [
          blockedAction(
            "validate_dry_run_report",
            "Validate dry-run report",
            "blocked",
            "Missing or blocked dry-run report.",
          ),
        ],
      },
    );
  }

  if (!isTradeReference(input.tradeReference)) {
    return baseReport(
      input,
      "mock_blocked",
      "Settlement mock requires explicit trade reference input.",
      {
        dryRun: input.dryRunReport,
        blockedReasons: ["Missing trade reference."],
        actionReports: [
          blockedAction(
            "validate_trade_reference",
            "Validate trade reference",
            "blocked",
            "Missing trade reference.",
          ),
        ],
      },
    );
  }

  const tradeReference = input.tradeReference;

  if (
    !isRouteContract(input.settlementNoteRouteContract) ||
    input.settlementNoteRouteContract.status !== "settlement_note_ready"
  ) {
    return baseReport(
      input,
      "mock_blocked",
      "Settlement mock requires a ready settlement route contract.",
      {
        dryRun: input.dryRunReport,
        tradeReference,
        blockedReasons: ["Missing or blocked settlement route contract."],
        actionReports: [
          blockedAction(
            "validate_settlement_route",
            "Validate settlement route",
            "blocked",
            "Missing or blocked settlement route contract.",
          ),
        ],
      },
    );
  }

  const route = input.settlementNoteRouteContract;

  if (
    !isActionContract(input.settlementNoteActionContract) ||
    input.settlementNoteActionContract.status !== "action_plan_ready"
  ) {
    return baseReport(
      input,
      "mock_blocked",
      "Settlement mock requires a ready settlement action contract.",
      {
        dryRun: input.dryRunReport,
        tradeReference,
        route,
        blockedReasons: ["Missing or blocked settlement action contract."],
        actionReports: [
          blockedAction(
            "validate_settlement_actions",
            "Validate settlement actions",
            "blocked",
            "Missing or blocked settlement action contract.",
          ),
        ],
      },
    );
  }

  const actionContract = input.settlementNoteActionContract;

  if (
    !isExtractionSchema(input.extractionSchemaResult) ||
    !["extraction_target_ready", "mapped_for_reconciliation"].includes(
      input.extractionSchemaResult.status,
    )
  ) {
    return baseReport(
      input,
      "mock_blocked",
      "Settlement mock requires a ready extraction schema.",
      {
        dryRun: input.dryRunReport,
        tradeReference,
        route,
        actionContract,
        blockedReasons: ["Missing or blocked extraction schema."],
        actionReports: [
          blockedAction(
            "validate_extraction_schema",
            "Validate extraction schema",
            "blocked_extraction",
            "Missing or blocked extraction schema.",
          ),
        ],
      },
    );
  }

  const schema = input.extractionSchemaResult;

  if (
    !isReconciliationPreview(input.reconciliationPreview) ||
    !["mapping_ready", "reconciliation_preview_ready"].includes(
      input.reconciliationPreview.status,
    )
  ) {
    return baseReport(
      input,
      "mock_blocked",
      "Settlement mock requires a ready reconciliation preview.",
      {
        dryRun: input.dryRunReport,
        tradeReference,
        route,
        actionContract,
        schema,
        blockedReasons: ["Missing or blocked reconciliation preview."],
        actionReports: [
          blockedAction(
            "validate_reconciliation_preview",
            "Validate reconciliation preview",
            "blocked",
            "Missing or blocked reconciliation preview.",
          ),
        ],
      },
    );
  }

  const preview = input.reconciliationPreview;
  const initialPageState = pageStateFrom(input.initialMockPageState);

  if (
    initialPageState.transactionListVisible &&
    initialPageState.matchingTransactionVisible === false
  ) {
    return baseReport(
      input,
      "mock_transaction_not_found",
      "Matching transaction is not visible in the mock page state.",
      {
        dryRun: input.dryRunReport,
        tradeReference,
        route,
        actionContract,
        schema,
        preview,
        initialPageState,
        finalPageState: initialPageState,
        blockedReasons: ["Mock matching transaction not found."],
        actionReports: [
          blockedAction(
            "match_transaction_mock",
            "Transaction matching simulated",
            "blocked_transaction_not_found",
            "Mock matching transaction not found.",
          ),
        ],
      },
    );
  }

  if (
    initialPageState.transactionDetailPanelVisible &&
    initialPageState.settlementNoteVisible === false
  ) {
    return baseReport(
      input,
      "mock_note_unavailable",
      "Settlement note is unavailable in the mock page state.",
      {
        dryRun: input.dryRunReport,
        tradeReference,
        route,
        actionContract,
        schema,
        preview,
        initialPageState,
        finalPageState: initialPageState,
        blockedReasons: ["Mock settlement note unavailable."],
        actionReports: [
          blockedAction(
            "locate_settlement_note_mock",
            "Avräkningsnota simulated",
            "blocked_note_unavailable",
            "Mock settlement note unavailable.",
          ),
        ],
      },
    );
  }

  if (
    initialPageState.settlementDocumentVisible &&
    initialPageState.settlementValuesVisible === false
  ) {
    return baseReport(
      input,
      "mock_extraction_blocked",
      "Settlement values are blocked in the mock page state.",
      {
        dryRun: input.dryRunReport,
        tradeReference,
        route,
        actionContract,
        schema,
        preview,
        initialPageState,
        finalPageState: initialPageState,
        blockedReasons: ["Mock settlement values unavailable."],
        actionReports: [
          blockedAction(
            "show_settlement_values_mock",
            "Settlement values simulated",
            "blocked_extraction",
            "Mock settlement values unavailable.",
          ),
        ],
      },
    );
  }

  const finalPageState = completedPageState();

  return baseReport(
    input,
    "mock_manual_review_required",
    "Settlement reconciliation mock completed to the manual review gate.",
    {
      dryRun: input.dryRunReport,
      tradeReference,
      route,
      actionContract,
      schema,
      preview,
      initialPageState,
      finalPageState,
      actionReports: completedActions(),
      mockedExtractedValues: mockedValues(),
      warnings: [
        "BUY settlement mock reaches manual review when side is buy.",
        "SELL settlement mock reaches manual review when side is sell.",
        "All settlement values are masked/synthetic.",
      ],
      canExecuteMockActions: true,
      canBuildReconciliationPreview: true,
    },
  );
}
