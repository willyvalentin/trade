import {
  buildAvanzaSettlementNoteSignalPack,
  type AvanzaSettlementNoteFlowStep,
  type AvanzaSettlementNoteSignalPack,
  type AvanzaSettlementNoteTradeSide,
} from "./avanza-real-world-settlement-note-signals";

export type AvanzaSettlementNoteSignalFixtureId =
  | "min_ekonomi_entry_visible"
  | "transaktioner_tab_visible"
  | "transaction_list_visible"
  | "matching_buy_transaction_row_modeled"
  | "matching_sell_transaction_row_modeled"
  | "transaction_detail_panel_visible"
  | "settlement_note_available"
  | "settlement_note_document_visible"
  | "settlement_values_labels_visible"
  | "courtage_label_visible"
  | "fx_vaxelkurs_label_visible"
  | "likvidbelopp_label_visible"
  | "note_navigation_modeled_not_executable"
  | "note_reading_modeled_not_executable"
  | "value_extraction_modeled_not_executable"
  | "reconciliation_write_forbidden"
  | "cookie_session_forbidden"
  | "bankid_forbidden"
  | "unknown";

export type AvanzaSettlementNoteSignalFixture = {
  fixtureId: AvanzaSettlementNoteSignalFixtureId;
  label: string;
  expectedSide: AvanzaSettlementNoteTradeSide;
  expectedStep: AvanzaSettlementNoteFlowStep;
  signalPack: AvanzaSettlementNoteSignalPack;
};

const sharedTableHeaders = [
  "Datum",
  "Transaktion",
  "Namn",
  "Antal",
  "Pris",
  "Belopp",
  "Valuta",
] as const;

const sharedSettlementLabels = [
  "Likvidbelopp",
  "Belopp",
  "Valuta",
  "Antal",
  "Pris",
  "ISIN",
  "Namn",
] as const;

function fixture(
  fixtureId: AvanzaSettlementNoteSignalFixtureId,
  label: string,
  input: Parameters<typeof buildAvanzaSettlementNoteSignalPack>[0],
): AvanzaSettlementNoteSignalFixture {
  const signalPack = buildAvanzaSettlementNoteSignalPack({
    signalPackId: fixtureId,
    createdAt: "2026-07-06T12:00:00.000Z",
    ...input,
  });

  return {
    fixtureId,
    label,
    expectedSide: signalPack.side,
    expectedStep: signalPack.step,
    signalPack,
  };
}

export const avanzaSettlementNoteSignalFixtures:
  AvanzaSettlementNoteSignalFixture[] = [
    fixture("min_ekonomi_entry_visible", "Min ekonomi entry visible", {
      step: "min_ekonomi_entry",
      side: "unknown",
      observedUrlKind: "avanza_min_ekonomi",
      visibleTexts: ["Min ekonomi"],
      buttonTexts: ["Min ekonomi"],
    }),
    fixture("transaktioner_tab_visible", "Transaktioner tab visible", {
      step: "transactions_tab",
      side: "unknown",
      observedUrlKind: "avanza_transactions",
      visibleTexts: ["Min ekonomi", "Transaktioner"],
      tabTexts: ["Transaktioner"],
    }),
    fixture("transaction_list_visible", "Transaction list visible", {
      step: "transaction_list",
      side: "unknown",
      observedUrlKind: "avanza_transactions",
      visibleTexts: ["Transaktioner"],
      tableHeaders: sharedTableHeaders,
      rowTexts: ["Köp", "Sälj", "Fond", "Aktie"],
    }),
    fixture("matching_buy_transaction_row_modeled", "Matching BUY row modeled", {
      step: "matching_transaction_row",
      side: "buy",
      observedUrlKind: "avanza_transactions",
      tableHeaders: sharedTableHeaders,
      rowTexts: ["Köp", "Namn", "Antal", "Pris", "Belopp", "Valuta"],
      transactionDateTexts: ["Datum"],
      instrumentIdentityTexts: ["Namn", "ISIN"],
      warnings: ["BUY transaction row is modeled from sanitized labels only."],
    }),
    fixture("matching_sell_transaction_row_modeled", "Matching SELL row modeled", {
      step: "matching_transaction_row",
      side: "sell",
      observedUrlKind: "avanza_transactions",
      tableHeaders: sharedTableHeaders,
      rowTexts: ["Sälj", "Namn", "Antal", "Pris", "Belopp", "Valuta"],
      transactionDateTexts: ["Datum"],
      instrumentIdentityTexts: ["Namn", "ISIN"],
      warnings: ["SELL transaction row is modeled from sanitized labels only."],
    }),
    fixture(
      "transaction_detail_panel_visible",
      "Transaction detail panel visible",
      {
        step: "transaction_detail_panel",
        side: "unknown",
        observedUrlKind: "avanza_transaction_detail",
        detailPanelTexts: [
          "Avräkningsinformation",
          "Övrig affärsinformation",
          "Transaktion",
          "Datum",
        ],
      },
    ),
    fixture("settlement_note_available", "Settlement note available", {
      step: "settlement_note_available",
      side: "unknown",
      observedUrlKind: "avanza_transaction_detail",
      detailPanelTexts: ["Avräkningsnota"],
      buttonTexts: ["Avräkningsnota"],
      blockedReasons: ["Opening Avräkningsnota is not executable in this task."],
    }),
    fixture("settlement_note_document_visible", "Settlement note document visible", {
      step: "settlement_note_document",
      side: "unknown",
      observedUrlKind: "avanza_settlement_note",
      documentTexts: [
        "Avräkningsnota",
        "Avräkningsinformation",
        "Övrig affärsinformation",
      ],
      blockedReasons: ["PDF/download/read is not implemented in this task."],
    }),
    fixture(
      "settlement_values_labels_visible",
      "Settlement value labels visible",
      {
        step: "settlement_note_values_visible",
        side: "unknown",
        observedUrlKind: "avanza_settlement_note",
        settlementValueLabels: sharedSettlementLabels,
        feeLabels: ["Courtage"],
        fxLabels: ["Växelkurs"],
        settlementDateTexts: ["Datum"],
      },
    ),
    fixture("courtage_label_visible", "Courtage label visible", {
      step: "settlement_note_values_visible",
      side: "unknown",
      observedUrlKind: "avanza_settlement_note",
      feeLabels: ["Courtage"],
      settlementValueLabels: ["Belopp", "Valuta"],
    }),
    fixture("fx_vaxelkurs_label_visible", "FX/växelkurs label visible", {
      step: "settlement_note_values_visible",
      side: "unknown",
      observedUrlKind: "avanza_settlement_note",
      fxLabels: ["Växelkurs"],
      settlementValueLabels: ["Valuta", "Belopp"],
    }),
    fixture("likvidbelopp_label_visible", "Likvidbelopp label visible", {
      step: "settlement_note_values_visible",
      side: "unknown",
      observedUrlKind: "avanza_settlement_note",
      settlementValueLabels: ["Likvidbelopp", "Belopp", "Valuta"],
    }),
    fixture(
      "note_navigation_modeled_not_executable",
      "Note navigation modeled but not executable",
      {
        step: "settlement_note_available",
        side: "unknown",
        observedUrlKind: "avanza_transaction_detail",
        visibleTexts: ["Min ekonomi", "Transaktioner", "Avräkningsnota"],
        blockedReasons: ["Real Avanza navigation is forbidden in this task."],
      },
    ),
    fixture(
      "note_reading_modeled_not_executable",
      "Note reading modeled but not executable",
      {
        step: "settlement_note_document",
        side: "unknown",
        observedUrlKind: "avanza_settlement_note",
        documentTexts: ["Avräkningsnota", "Courtage", "Växelkurs"],
        blockedReasons: ["PDF/download/read and OCR are not implemented."],
      },
    ),
    fixture(
      "value_extraction_modeled_not_executable",
      "Value extraction modeled but not executable",
      {
        step: "settlement_note_values_visible",
        side: "unknown",
        observedUrlKind: "avanza_settlement_note",
        settlementValueLabels: ["Courtage", "Växelkurs", "Likvidbelopp"],
        feeLabels: ["Courtage"],
        fxLabels: ["Växelkurs"],
        blockedReasons: ["Settlement value extraction is forbidden in this task."],
      },
    ),
    fixture("reconciliation_write_forbidden", "Reconciliation write forbidden", {
      step: "settlement_note_values_visible",
      side: "unknown",
      observedUrlKind: "avanza_settlement_note",
      settlementValueLabels: ["Courtage", "Växelkurs", "Likvidbelopp"],
      blockedReasons: ["Trade reconciliation write forbidden."],
    }),
    fixture("cookie_session_forbidden", "Cookie/session forbidden", {
      step: "unknown",
      side: "unknown",
      observedUrlKind: "unknown",
      blockedReasons: ["Cookie/session handling forbidden."],
    }),
    fixture("bankid_forbidden", "BankID forbidden", {
      step: "unknown",
      side: "unknown",
      observedUrlKind: "unknown",
      blockedReasons: ["BankID automation and bypass forbidden."],
    }),
    fixture("unknown", "Unknown settlement-note state", {
      step: "unknown",
      side: "unknown",
      observedUrlKind: "unknown",
      warnings: ["Unknown sanitized settlement-note state."],
    }),
  ];
