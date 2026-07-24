import {
  buildAvanzaSettlementReconciliationPreview,
  type AvanzaSettlementReconciliationPreview,
  type AvanzaSettlementReconciliationStatus,
} from "./avanza-settlement-reconciliation-mapping";
import {
  avanzaSettlementNoteExtractionSchemaFixtures,
} from "./avanza-settlement-note-extraction-schema-fixtures";
import {
  buildAvanzaSettlementExtractionTargetSchema,
} from "./avanza-settlement-note-extraction-schema";
import {
  avanzaSettlementNoteSignalFixtures,
} from "./avanza-real-world-settlement-note-signals-fixtures";

export type AvanzaSettlementReconciliationMappingFixtureId =
  | "disabled"
  | "waiting_for_extraction"
  | "buy_reconciliation_preview_ready"
  | "sell_reconciliation_preview_ready"
  | "courtage_mapped"
  | "fx_mapped"
  | "settlement_amount_mapped"
  | "pnl_adjustment_modeled"
  | "manual_review_required"
  | "writes_forbidden"
  | "supabase_write_forbidden"
  | "error"
  | "unknown";

export type AvanzaSettlementReconciliationMappingFixture = {
  fixtureId: AvanzaSettlementReconciliationMappingFixtureId;
  label: string;
  expectedStatus: AvanzaSettlementReconciliationStatus;
  preview: AvanzaSettlementReconciliationPreview;
};

function extractionFixture(fixtureId: string) {
  const fixture = avanzaSettlementNoteExtractionSchemaFixtures.find(
    (item) => item.fixtureId === fixtureId,
  );

  if (!fixture) throw new Error(`Missing extraction schema fixture ${fixtureId}`);

  return fixture.schema;
}

function signal(fixtureId: string) {
  const fixture = avanzaSettlementNoteSignalFixtures.find(
    (item) => item.fixtureId === fixtureId,
  );

  if (!fixture) throw new Error(`Missing settlement note signal fixture ${fixtureId}`);

  return fixture.signalPack;
}

const buyMappedSchema = buildAvanzaSettlementExtractionTargetSchema({
  schemaEnabled: true,
  schemaId: "buy_mapped_schema",
  now: "2026-07-06T12:00:00.000Z",
  mappedForReconciliation: true,
  tradeReference: {
    source: "fixture",
    side: "buy",
    ticker: "NOKIA",
    instrumentName: "Nokia ADR",
    currency: "USD",
  },
  settlementSignals: signal("settlement_values_labels_visible"),
});

const sellMappedSchema = buildAvanzaSettlementExtractionTargetSchema({
  schemaEnabled: true,
  schemaId: "sell_mapped_schema",
  now: "2026-07-06T12:00:00.000Z",
  mappedForReconciliation: true,
  tradeReference: {
    source: "fixture",
    side: "sell",
    ticker: "NOKIA",
    instrumentName: "Nokia ADR",
    currency: "USD",
  },
  settlementSignals: signal("settlement_values_labels_visible"),
});

function fixture(
  fixtureId: AvanzaSettlementReconciliationMappingFixtureId,
  label: string,
  input: Parameters<typeof buildAvanzaSettlementReconciliationPreview>[0],
): AvanzaSettlementReconciliationMappingFixture {
  const preview = buildAvanzaSettlementReconciliationPreview({
    previewId: fixtureId,
    now: "2026-07-06T12:00:00.000Z",
    ...input,
  });

  return {
    fixtureId,
    label,
    expectedStatus: preview.status,
    preview,
  };
}

export const avanzaSettlementReconciliationMappingFixtures:
  AvanzaSettlementReconciliationMappingFixture[] = [
    fixture("disabled", "Settlement reconciliation mapping disabled", {
      mappingEnabled: false,
    }),
    fixture("waiting_for_extraction", "Waiting for extraction", {
      mappingEnabled: true,
    }),
    fixture("buy_reconciliation_preview_ready", "BUY reconciliation preview ready", {
      mappingEnabled: true,
      extractionSchema: buyMappedSchema,
      pnlImpactMode: "cost_adjustment_only",
    }),
    fixture("sell_reconciliation_preview_ready", "SELL reconciliation preview ready", {
      mappingEnabled: true,
      extractionSchema: sellMappedSchema,
      pnlImpactMode: "realized_pnl_recalc_later",
    }),
    fixture("courtage_mapped", "Courtage mapped to future targets", {
      mappingEnabled: true,
      extractionSchema: buyMappedSchema,
      pnlImpactMode: "cost_adjustment_only",
    }),
    fixture("fx_mapped", "FX mapped to future targets", {
      mappingEnabled: true,
      extractionSchema: buyMappedSchema,
      pnlImpactMode: "cost_adjustment_only",
    }),
    fixture("settlement_amount_mapped", "Settlement amount mapped", {
      mappingEnabled: true,
      extractionSchema: buyMappedSchema,
      pnlImpactMode: "cost_adjustment_only",
    }),
    fixture("pnl_adjustment_modeled", "PnL adjustment modeled", {
      mappingEnabled: true,
      extractionSchema: sellMappedSchema,
      pnlImpactMode: "realized_pnl_recalc_later",
    }),
    fixture("manual_review_required", "Manual review required", {
      mappingEnabled: true,
      extractionSchema: buyMappedSchema,
    }),
    fixture("writes_forbidden", "Writes forbidden", {
      mappingEnabled: true,
      extractionSchema: extractionFixture("buy_extraction_targets_ready"),
      forceBlockedReason: "Reconciliation writes forbidden.",
    }),
    fixture("supabase_write_forbidden", "Supabase write forbidden", {
      mappingEnabled: true,
      extractionSchema: extractionFixture("buy_extraction_targets_ready"),
      forceBlockedReason: "Supabase write forbidden.",
    }),
    fixture("error", "Settlement reconciliation mapping error", {
      mappingEnabled: true,
      forceError: true,
    }),
    fixture("unknown", "Settlement reconciliation mapping unknown", {
      mappingEnabled: true,
      forceUnknown: true,
    }),
  ];
