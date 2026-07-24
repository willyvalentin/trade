import {
  buildAvanzaSettlementExtractionTargetSchema,
  type AvanzaSettlementExtractionSchemaResult,
  type AvanzaSettlementNoteExtractionStatus,
} from "./avanza-settlement-note-extraction-schema";
import {
  avanzaSettlementNoteSignalFixtures,
} from "./avanza-real-world-settlement-note-signals-fixtures";

export type AvanzaSettlementNoteExtractionSchemaFixtureId =
  | "disabled"
  | "waiting_for_note"
  | "schema_ready"
  | "buy_extraction_targets_ready"
  | "sell_extraction_targets_ready"
  | "courtage_target"
  | "fx_rate_target"
  | "settlement_amount_target"
  | "trade_settlement_date_targets"
  | "note_reference_target"
  | "ocr_forbidden"
  | "pdf_read_forbidden"
  | "extraction_forbidden"
  | "supabase_write_forbidden"
  | "error"
  | "unknown";

export type AvanzaSettlementNoteExtractionSchemaFixture = {
  fixtureId: AvanzaSettlementNoteExtractionSchemaFixtureId;
  label: string;
  expectedStatus: AvanzaSettlementNoteExtractionStatus;
  schema: AvanzaSettlementExtractionSchemaResult;
};

const buyTradeReference = {
  source: "fixture",
  side: "buy" as const,
  ticker: "NOKIA",
  instrumentName: "Nokia ADR",
  currency: "USD",
};

const sellTradeReference = {
  ...buyTradeReference,
  side: "sell" as const,
};

function signal(fixtureId: string) {
  const fixture = avanzaSettlementNoteSignalFixtures.find(
    (item) => item.fixtureId === fixtureId,
  );

  if (!fixture) throw new Error(`Missing settlement note signal fixture ${fixtureId}`);

  return fixture.signalPack;
}

function fixture(
  fixtureId: AvanzaSettlementNoteExtractionSchemaFixtureId,
  label: string,
  input: Parameters<typeof buildAvanzaSettlementExtractionTargetSchema>[0],
): AvanzaSettlementNoteExtractionSchemaFixture {
  const schema = buildAvanzaSettlementExtractionTargetSchema({
    schemaId: fixtureId,
    now: "2026-07-06T12:00:00.000Z",
    ...input,
  });

  return {
    fixtureId,
    label,
    expectedStatus: schema.status,
    schema,
  };
}

export const avanzaSettlementNoteExtractionSchemaFixtures:
  AvanzaSettlementNoteExtractionSchemaFixture[] = [
    fixture("disabled", "Settlement extraction schema disabled", {
      schemaEnabled: false,
    }),
    fixture("waiting_for_note", "Waiting for settlement note", {
      schemaEnabled: true,
    }),
    fixture("schema_ready", "Schema ready without note signals", {
      schemaEnabled: true,
      tradeReference: buyTradeReference,
    }),
    fixture("buy_extraction_targets_ready", "BUY extraction targets ready", {
      schemaEnabled: true,
      tradeReference: buyTradeReference,
      settlementSignals: signal("settlement_note_available"),
    }),
    fixture("sell_extraction_targets_ready", "SELL extraction targets ready", {
      schemaEnabled: true,
      tradeReference: sellTradeReference,
      settlementSignals: signal("settlement_note_available"),
    }),
    fixture("courtage_target", "Courtage target modeled", {
      schemaEnabled: true,
      tradeReference: buyTradeReference,
      settlementSignals: signal("settlement_values_labels_visible"),
    }),
    fixture("fx_rate_target", "FX/växelkurs target modeled", {
      schemaEnabled: true,
      tradeReference: buyTradeReference,
      settlementSignals: signal("settlement_values_labels_visible"),
    }),
    fixture("settlement_amount_target", "Settlement amount target modeled", {
      schemaEnabled: true,
      tradeReference: buyTradeReference,
      settlementSignals: signal("settlement_values_labels_visible"),
    }),
    fixture("trade_settlement_date_targets", "Trade/settlement date targets modeled", {
      schemaEnabled: true,
      tradeReference: buyTradeReference,
      settlementSignals: signal("settlement_values_labels_visible"),
    }),
    fixture("note_reference_target", "Note reference target modeled", {
      schemaEnabled: true,
      tradeReference: buyTradeReference,
      settlementSignals: signal("settlement_note_available"),
    }),
    fixture("ocr_forbidden", "OCR forbidden", {
      schemaEnabled: true,
      tradeReference: buyTradeReference,
      settlementSignals: signal("value_extraction_modeled_not_executable"),
      forceBlockedReason: "OCR remains forbidden.",
    }),
    fixture("pdf_read_forbidden", "PDF read forbidden", {
      schemaEnabled: true,
      tradeReference: buyTradeReference,
      settlementSignals: signal("note_reading_modeled_not_executable"),
      forceBlockedReason: "PDF/download/read remains forbidden.",
    }),
    fixture("extraction_forbidden", "Value extraction forbidden", {
      schemaEnabled: true,
      tradeReference: buyTradeReference,
      settlementSignals: signal("value_extraction_modeled_not_executable"),
      forceBlockedReason: "Settlement value extraction forbidden.",
    }),
    fixture("supabase_write_forbidden", "Supabase write forbidden", {
      schemaEnabled: true,
      tradeReference: buyTradeReference,
      settlementSignals: signal("reconciliation_write_forbidden"),
      forceBlockedReason: "Supabase write forbidden.",
    }),
    fixture("error", "Settlement extraction schema error", {
      schemaEnabled: true,
      forceError: true,
    }),
    fixture("unknown", "Settlement extraction schema unknown", {
      schemaEnabled: true,
      forceUnknown: true,
    }),
  ];
