import {
  avanzaSettlementNoteSignalFixtures,
} from "./avanza-real-world-settlement-note-signals-fixtures";
import {
  buildAvanzaSettlementReconciliationDryRunReport,
} from "./avanza-settlement-reconciliation-dry-run-executor";
import {
  buildAvanzaSettlementReconciliationMockExecutorReport,
  type AvanzaSettlementReconciliationMockExecutorReport,
  type AvanzaSettlementReconciliationMockExecutorStatus,
  type AvanzaSettlementReconciliationMockPageState,
} from "./avanza-settlement-reconciliation-mock-executor";
import {
  buildAvanzaSettlementExtractionTargetSchema,
} from "./avanza-settlement-note-extraction-schema";
import {
  buildAvanzaSettlementNoteActionContract,
} from "./avanza-settlement-note-action-contract";
import {
  buildAvanzaSettlementNoteRouteContract,
  type AvanzaSettlementTradeReference,
} from "./avanza-settlement-note-route-contract";
import {
  buildAvanzaSettlementReconciliationPreview,
} from "./avanza-settlement-reconciliation-mapping";

export type AvanzaSettlementReconciliationMockExecutorFixtureId =
  | "disabled"
  | "valid_buy_settlement_mock_manual_review"
  | "valid_sell_settlement_mock_manual_review"
  | "min_ekonomi_simulated"
  | "transaktioner_simulated"
  | "transaction_list_simulated"
  | "matching_transaction_simulated"
  | "transaction_detail_panel_simulated"
  | "avrakningsnota_simulated"
  | "settlement_values_simulated"
  | "courtage_mocked_masked_synthetic"
  | "fx_vaxelkurs_mocked_masked_synthetic"
  | "settlement_amount_mocked_masked_synthetic"
  | "reconciliation_preview_ready"
  | "manual_review_required"
  | "missing_matching_transaction"
  | "settlement_note_unavailable"
  | "extraction_blocked"
  | "document_read_forbidden"
  | "ocr_forbidden"
  | "reconciliation_write_forbidden"
  | "supabase_write_forbidden"
  | "cookie_session_forbidden"
  | "bankid_forbidden"
  | "error"
  | "unknown";

export type AvanzaSettlementReconciliationMockExecutorFixture = {
  fixtureId: AvanzaSettlementReconciliationMockExecutorFixtureId;
  label: string;
  expectedStatus: AvanzaSettlementReconciliationMockExecutorStatus;
  report: AvanzaSettlementReconciliationMockExecutorReport;
};

const now = "2026-07-06T12:00:00.000Z";

const buyTradeReference: AvanzaSettlementTradeReference = {
  tradeReferenceId: "fixture-buy-settlement-mock",
  createdAt: now,
  source: "fixture",
  side: "buy",
  ticker: "NOKIA",
  instrumentName: "Nokia ADR",
  quantity: 12,
  estimatedExecutionPrice: 10,
  estimatedGrossAmount: 120,
  estimatedTradeDate: "2026-07-06",
  expectedSettlementDate: "2026-07-07",
  currency: "USD",
  recommendationId: "fixture-recommendation",
};

const sellTradeReference: AvanzaSettlementTradeReference = {
  ...buyTradeReference,
  tradeReferenceId: "fixture-sell-settlement-mock",
  side: "sell",
  quantity: 8,
};

function signal(fixtureId: string) {
  const fixture = avanzaSettlementNoteSignalFixtures.find(
    (item) => item.fixtureId === fixtureId,
  );

  if (!fixture) throw new Error(`Missing settlement note signal fixture ${fixtureId}`);

  return fixture.signalPack;
}

function buildCoherentPath(tradeReference: AvanzaSettlementTradeReference) {
  const route = buildAvanzaSettlementNoteRouteContract({
    mode: "route_model",
    routeEnabled: true,
    routeContractId: `${tradeReference.side}-settlement-mock-route`,
    now,
    tradeReference,
    realWorldSettlementSignals: signal("settlement_note_available"),
  });
  const action = buildAvanzaSettlementNoteActionContract({
    mode: "contract_only",
    contractEnabled: true,
    contractId: `${tradeReference.side}-settlement-mock-action`,
    now,
    settlementNoteRouteContract: route,
  });
  const schema = buildAvanzaSettlementExtractionTargetSchema({
    schemaEnabled: true,
    schemaId: `${tradeReference.side}-settlement-mock-extraction-schema`,
    now,
    mappedForReconciliation: true,
    tradeReference,
    settlementSignals: signal("settlement_values_labels_visible"),
  });
  const preview = buildAvanzaSettlementReconciliationPreview({
    mappingEnabled: true,
    previewId: `${tradeReference.side}-settlement-mock-reconciliation-preview`,
    now,
    extractionSchema: schema,
    pnlImpactMode:
      tradeReference.side === "sell"
        ? "realized_pnl_recalc_later"
        : "cost_adjustment_only",
  });
  const dryRunReport = buildAvanzaSettlementReconciliationDryRunReport({
    dryRunId: `${tradeReference.side}-settlement-mock-dry-run`,
    mode: "local_dev_dry_run",
    dryRunEnabled: true,
    now,
    tradeReference,
    settlementNoteRouteContract: route,
    settlementNoteActionContract: action,
    extractionSchemaResult: schema,
    reconciliationPreview: preview,
  });

  return { route, action, schema, preview, dryRunReport };
}

function mockPageState(
  state: Partial<AvanzaSettlementReconciliationMockPageState> & {
    stateId: string;
    kind: AvanzaSettlementReconciliationMockPageState["kind"];
  },
): AvanzaSettlementReconciliationMockPageState {
  return {
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
    ...state,
  };
}

const buyPath = buildCoherentPath(buyTradeReference);
const sellPath = buildCoherentPath(sellTradeReference);

function fixture(
  fixtureId: AvanzaSettlementReconciliationMockExecutorFixtureId,
  label: string,
  input: Parameters<typeof buildAvanzaSettlementReconciliationMockExecutorReport>[0],
): AvanzaSettlementReconciliationMockExecutorFixture {
  const report = buildAvanzaSettlementReconciliationMockExecutorReport({
    reportId: fixtureId,
    now,
    ...input,
  });

  return {
    fixtureId,
    label,
    expectedStatus: report.status,
    report,
  };
}

const readyBuyInput = {
  mode: "mock_local_dev" as const,
  mockExecutorEnabled: true,
  tradeReference: buyTradeReference,
  dryRunReport: buyPath.dryRunReport,
  settlementNoteRouteContract: buyPath.route,
  settlementNoteActionContract: buyPath.action,
  extractionSchemaResult: buyPath.schema,
  reconciliationPreview: buyPath.preview,
};

const readySellInput = {
  ...readyBuyInput,
  tradeReference: sellTradeReference,
  dryRunReport: sellPath.dryRunReport,
  settlementNoteRouteContract: sellPath.route,
  settlementNoteActionContract: sellPath.action,
  extractionSchemaResult: sellPath.schema,
  reconciliationPreview: sellPath.preview,
};

export const avanzaSettlementReconciliationMockExecutorFixtures:
  AvanzaSettlementReconciliationMockExecutorFixture[] = [
    fixture("disabled", "Settlement reconciliation mock executor disabled", {
      mode: "disabled",
      mockExecutorEnabled: false,
    }),
    fixture(
      "valid_buy_settlement_mock_manual_review",
      "Valid BUY settlement mock reaches manual review",
      readyBuyInput,
    ),
    fixture(
      "valid_sell_settlement_mock_manual_review",
      "Valid SELL settlement mock reaches manual review",
      readySellInput,
    ),
    fixture("min_ekonomi_simulated", "Min ekonomi simulated", readyBuyInput),
    fixture("transaktioner_simulated", "Transaktioner simulated", readyBuyInput),
    fixture("transaction_list_simulated", "Transaction list simulated", readyBuyInput),
    fixture(
      "matching_transaction_simulated",
      "Matching transaction simulated",
      readyBuyInput,
    ),
    fixture(
      "transaction_detail_panel_simulated",
      "Transaction detail panel simulated",
      readyBuyInput,
    ),
    fixture("avrakningsnota_simulated", "Avräkningsnota simulated", readyBuyInput),
    fixture("settlement_values_simulated", "Settlement values simulated", readyBuyInput),
    fixture(
      "courtage_mocked_masked_synthetic",
      "Courtage mocked masked/synthetic",
      readyBuyInput,
    ),
    fixture(
      "fx_vaxelkurs_mocked_masked_synthetic",
      "FX/växelkurs mocked masked/synthetic",
      readyBuyInput,
    ),
    fixture(
      "settlement_amount_mocked_masked_synthetic",
      "Settlement amount mocked masked/synthetic",
      readyBuyInput,
    ),
    fixture(
      "reconciliation_preview_ready",
      "Reconciliation preview ready",
      readyBuyInput,
    ),
    fixture("manual_review_required", "Manual review required", readyBuyInput),
    fixture("missing_matching_transaction", "Missing matching transaction", {
      ...readyBuyInput,
      initialMockPageState: mockPageState({
        stateId: "mock-missing-matching-transaction",
        kind: "transaction_list_visible",
        minEkonomiVisible: true,
        transactionsTabVisible: true,
        transactionListVisible: true,
        matchingTransactionVisible: false,
        visibleTexts: ["Min ekonomi", "Transaktioner"],
        blockedReasons: ["Mock matching transaction not found."],
      }),
    }),
    fixture("settlement_note_unavailable", "Settlement note unavailable", {
      ...readyBuyInput,
      initialMockPageState: mockPageState({
        stateId: "mock-settlement-note-unavailable",
        kind: "transaction_detail_panel_open",
        minEkonomiVisible: true,
        transactionsTabVisible: true,
        transactionListVisible: true,
        matchingTransactionVisible: true,
        transactionDetailPanelVisible: true,
        settlementNoteVisible: false,
        visibleTexts: ["Min ekonomi", "Transaktioner", "Matching transaction"],
        blockedReasons: ["Mock settlement note unavailable."],
      }),
    }),
    fixture("extraction_blocked", "Extraction blocked", {
      ...readyBuyInput,
      initialMockPageState: mockPageState({
        stateId: "mock-extraction-blocked",
        kind: "settlement_note_document_visible",
        minEkonomiVisible: true,
        transactionsTabVisible: true,
        transactionListVisible: true,
        matchingTransactionVisible: true,
        transactionDetailPanelVisible: true,
        settlementNoteVisible: true,
        settlementDocumentVisible: true,
        settlementValuesVisible: false,
        visibleTexts: ["Min ekonomi", "Transaktioner", "Avräkningsnota"],
        blockedReasons: ["Mock settlement values unavailable."],
      }),
    }),
    fixture("document_read_forbidden", "Document read forbidden", readyBuyInput),
    fixture("ocr_forbidden", "OCR forbidden", readyBuyInput),
    fixture(
      "reconciliation_write_forbidden",
      "Reconciliation write forbidden",
      readyBuyInput,
    ),
    fixture("supabase_write_forbidden", "Supabase write forbidden", readyBuyInput),
    fixture("cookie_session_forbidden", "Cookie/session forbidden", readyBuyInput),
    fixture("bankid_forbidden", "BankID forbidden", readyBuyInput),
    fixture("error", "Settlement reconciliation mock error", {
      mode: "mock_local_dev",
      mockExecutorEnabled: true,
      forceError: true,
    }),
    fixture("unknown", "Settlement reconciliation mock unknown", {
      mode: "mock_local_dev",
      mockExecutorEnabled: true,
      forceUnknown: true,
    }),
  ];
