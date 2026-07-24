import {
  avanzaSettlementNoteSignalFixtures,
} from "./avanza-real-world-settlement-note-signals-fixtures";
import {
  buildAvanzaSettlementReconciliationDryRunReport,
  type AvanzaSettlementReconciliationDryRunReport,
  type AvanzaSettlementReconciliationDryRunStatus,
} from "./avanza-settlement-reconciliation-dry-run-executor";
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

export type AvanzaSettlementReconciliationDryRunExecutorFixtureId =
  | "disabled"
  | "waiting_for_route"
  | "waiting_for_action_contract"
  | "waiting_for_extraction_schema"
  | "waiting_for_reconciliation_mapping"
  | "buy_settlement_dry_run_passed_manual_review_required"
  | "sell_settlement_dry_run_passed_manual_review_required"
  | "courtage_extraction_target_simulated"
  | "fx_vaxelkurs_extraction_target_simulated"
  | "settlement_amount_extraction_target_simulated"
  | "execution_record_target_simulated"
  | "trade_result_target_simulated"
  | "statistics_target_simulated"
  | "audit_metadata_target_simulated"
  | "manual_review_required"
  | "stop_before_reconciliation_write"
  | "document_read_forbidden"
  | "ocr_forbidden"
  | "extraction_forbidden"
  | "supabase_write_forbidden"
  | "error"
  | "unknown";

export type AvanzaSettlementReconciliationDryRunExecutorFixture = {
  fixtureId: AvanzaSettlementReconciliationDryRunExecutorFixtureId;
  label: string;
  expectedStatus: AvanzaSettlementReconciliationDryRunStatus;
  report: AvanzaSettlementReconciliationDryRunReport;
};

const now = "2026-07-06T12:00:00.000Z";

const buyTradeReference: AvanzaSettlementTradeReference = {
  tradeReferenceId: "fixture-buy-settlement-dry-run",
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
  tradeReferenceId: "fixture-sell-settlement-dry-run",
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
    routeContractId: `${tradeReference.side}-settlement-route`,
    now,
    tradeReference,
    realWorldSettlementSignals: signal("settlement_note_available"),
  });
  const action = buildAvanzaSettlementNoteActionContract({
    mode: "contract_only",
    contractEnabled: true,
    contractId: `${tradeReference.side}-settlement-action`,
    now,
    settlementNoteRouteContract: route,
  });
  const schema = buildAvanzaSettlementExtractionTargetSchema({
    schemaEnabled: true,
    schemaId: `${tradeReference.side}-settlement-extraction-schema`,
    now,
    mappedForReconciliation: true,
    tradeReference,
    settlementSignals: signal("settlement_values_labels_visible"),
  });
  const preview = buildAvanzaSettlementReconciliationPreview({
    mappingEnabled: true,
    previewId: `${tradeReference.side}-settlement-reconciliation-preview`,
    now,
    extractionSchema: schema,
    pnlImpactMode:
      tradeReference.side === "sell"
        ? "realized_pnl_recalc_later"
        : "cost_adjustment_only",
  });

  return { route, action, schema, preview };
}

const buyPath = buildCoherentPath(buyTradeReference);
const sellPath = buildCoherentPath(sellTradeReference);

function fixture(
  fixtureId: AvanzaSettlementReconciliationDryRunExecutorFixtureId,
  label: string,
  input: Parameters<typeof buildAvanzaSettlementReconciliationDryRunReport>[0],
): AvanzaSettlementReconciliationDryRunExecutorFixture {
  const report = buildAvanzaSettlementReconciliationDryRunReport({
    dryRunId: fixtureId,
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

export const avanzaSettlementReconciliationDryRunExecutorFixtures:
  AvanzaSettlementReconciliationDryRunExecutorFixture[] = [
    fixture("disabled", "Settlement reconciliation dry-run disabled", {
      mode: "disabled",
      dryRunEnabled: false,
    }),
    fixture("waiting_for_route", "Waiting for settlement route", {
      mode: "settlement_dry_run_model",
      dryRunEnabled: true,
      tradeReference: buyTradeReference,
    }),
    fixture("waiting_for_action_contract", "Waiting for action contract", {
      mode: "settlement_dry_run_model",
      dryRunEnabled: true,
      tradeReference: buyTradeReference,
      settlementNoteRouteContract: buyPath.route,
    }),
    fixture("waiting_for_extraction_schema", "Waiting for extraction schema", {
      mode: "settlement_dry_run_model",
      dryRunEnabled: true,
      tradeReference: buyTradeReference,
      settlementNoteRouteContract: buyPath.route,
      settlementNoteActionContract: buyPath.action,
    }),
    fixture(
      "waiting_for_reconciliation_mapping",
      "Waiting for reconciliation mapping",
      {
        mode: "settlement_dry_run_model",
        dryRunEnabled: true,
        tradeReference: buyTradeReference,
        settlementNoteRouteContract: buyPath.route,
        settlementNoteActionContract: buyPath.action,
        extractionSchemaResult: buyPath.schema,
      },
    ),
    fixture(
      "buy_settlement_dry_run_passed_manual_review_required",
      "BUY settlement dry-run passed/manual review required",
      {
        mode: "local_dev_dry_run",
        dryRunEnabled: true,
        tradeReference: buyTradeReference,
        settlementNoteRouteContract: buyPath.route,
        settlementNoteActionContract: buyPath.action,
        extractionSchemaResult: buyPath.schema,
        reconciliationPreview: buyPath.preview,
      },
    ),
    fixture(
      "sell_settlement_dry_run_passed_manual_review_required",
      "SELL settlement dry-run passed/manual review required",
      {
        mode: "local_dev_dry_run",
        dryRunEnabled: true,
        tradeReference: sellTradeReference,
        settlementNoteRouteContract: sellPath.route,
        settlementNoteActionContract: sellPath.action,
        extractionSchemaResult: sellPath.schema,
        reconciliationPreview: sellPath.preview,
      },
    ),
    fixture("courtage_extraction_target_simulated", "Courtage extraction target simulated", {
      mode: "settlement_dry_run_model",
      dryRunEnabled: true,
      tradeReference: buyTradeReference,
      settlementNoteRouteContract: buyPath.route,
      settlementNoteActionContract: buyPath.action,
      extractionSchemaResult: buyPath.schema,
      reconciliationPreview: buyPath.preview,
    }),
    fixture(
      "fx_vaxelkurs_extraction_target_simulated",
      "FX/växelkurs extraction target simulated",
      {
        mode: "settlement_dry_run_model",
        dryRunEnabled: true,
        tradeReference: buyTradeReference,
        settlementNoteRouteContract: buyPath.route,
        settlementNoteActionContract: buyPath.action,
        extractionSchemaResult: buyPath.schema,
        reconciliationPreview: buyPath.preview,
      },
    ),
    fixture(
      "settlement_amount_extraction_target_simulated",
      "Settlement amount extraction target simulated",
      {
        mode: "settlement_dry_run_model",
        dryRunEnabled: true,
        tradeReference: buyTradeReference,
        settlementNoteRouteContract: buyPath.route,
        settlementNoteActionContract: buyPath.action,
        extractionSchemaResult: buyPath.schema,
        reconciliationPreview: buyPath.preview,
      },
    ),
    fixture("execution_record_target_simulated", "Execution record target simulated", {
      mode: "settlement_dry_run_model",
      dryRunEnabled: true,
      tradeReference: buyTradeReference,
      settlementNoteRouteContract: buyPath.route,
      settlementNoteActionContract: buyPath.action,
      extractionSchemaResult: buyPath.schema,
      reconciliationPreview: buyPath.preview,
    }),
    fixture("trade_result_target_simulated", "Trade result target simulated", {
      mode: "settlement_dry_run_model",
      dryRunEnabled: true,
      tradeReference: buyTradeReference,
      settlementNoteRouteContract: buyPath.route,
      settlementNoteActionContract: buyPath.action,
      extractionSchemaResult: buyPath.schema,
      reconciliationPreview: buyPath.preview,
    }),
    fixture("statistics_target_simulated", "Statistics target simulated", {
      mode: "settlement_dry_run_model",
      dryRunEnabled: true,
      tradeReference: buyTradeReference,
      settlementNoteRouteContract: buyPath.route,
      settlementNoteActionContract: buyPath.action,
      extractionSchemaResult: buyPath.schema,
      reconciliationPreview: buyPath.preview,
    }),
    fixture("audit_metadata_target_simulated", "Audit metadata target simulated", {
      mode: "settlement_dry_run_model",
      dryRunEnabled: true,
      tradeReference: buyTradeReference,
      settlementNoteRouteContract: buyPath.route,
      settlementNoteActionContract: buyPath.action,
      extractionSchemaResult: buyPath.schema,
      reconciliationPreview: buyPath.preview,
    }),
    fixture("manual_review_required", "Manual review required", {
      mode: "settlement_dry_run_model",
      dryRunEnabled: true,
      tradeReference: buyTradeReference,
      settlementNoteRouteContract: buyPath.route,
      settlementNoteActionContract: buyPath.action,
      extractionSchemaResult: buyPath.schema,
      reconciliationPreview: buyPath.preview,
    }),
    fixture("stop_before_reconciliation_write", "Stop before reconciliation write", {
      mode: "settlement_dry_run_model",
      dryRunEnabled: true,
      tradeReference: buyTradeReference,
      settlementNoteRouteContract: buyPath.route,
      settlementNoteActionContract: buyPath.action,
      extractionSchemaResult: buyPath.schema,
      reconciliationPreview: buyPath.preview,
    }),
    fixture("document_read_forbidden", "Document read forbidden", {
      mode: "settlement_dry_run_model",
      dryRunEnabled: true,
      tradeReference: buyTradeReference,
      settlementNoteRouteContract: buyPath.route,
      settlementNoteActionContract: buyPath.action,
      extractionSchemaResult: buyPath.schema,
      reconciliationPreview: buyPath.preview,
    }),
    fixture("ocr_forbidden", "OCR forbidden", {
      mode: "settlement_dry_run_model",
      dryRunEnabled: true,
      tradeReference: buyTradeReference,
      settlementNoteRouteContract: buyPath.route,
      settlementNoteActionContract: buyPath.action,
      extractionSchemaResult: buyPath.schema,
      reconciliationPreview: buyPath.preview,
    }),
    fixture("extraction_forbidden", "Value extraction forbidden", {
      mode: "settlement_dry_run_model",
      dryRunEnabled: true,
      tradeReference: buyTradeReference,
      settlementNoteRouteContract: buyPath.route,
      settlementNoteActionContract: buyPath.action,
      extractionSchemaResult: buyPath.schema,
      reconciliationPreview: buyPath.preview,
    }),
    fixture("supabase_write_forbidden", "Supabase write forbidden", {
      mode: "settlement_dry_run_model",
      dryRunEnabled: true,
      tradeReference: buyTradeReference,
      settlementNoteRouteContract: buyPath.route,
      settlementNoteActionContract: buyPath.action,
      extractionSchemaResult: buyPath.schema,
      reconciliationPreview: buyPath.preview,
    }),
    fixture("error", "Settlement reconciliation dry-run error", {
      mode: "settlement_dry_run_model",
      dryRunEnabled: true,
      forceError: true,
    }),
    fixture("unknown", "Settlement reconciliation dry-run unknown", {
      mode: "settlement_dry_run_model",
      dryRunEnabled: true,
      forceUnknown: true,
    }),
  ];
