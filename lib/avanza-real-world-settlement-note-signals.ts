export type AvanzaSettlementNoteFlowStep =
  | "min_ekonomi_entry"
  | "transactions_tab"
  | "transaction_list"
  | "matching_transaction_row"
  | "transaction_detail_panel"
  | "settlement_note_available"
  | "settlement_note_document"
  | "settlement_note_values_visible"
  | "unknown";

export type AvanzaSettlementNoteTradeSide = "buy" | "sell" | "unknown";

export type AvanzaSettlementNoteObservedUrlKind =
  | "avanza_min_ekonomi"
  | "avanza_transactions"
  | "avanza_transaction_detail"
  | "avanza_settlement_note"
  | "unknown";

export type AvanzaSettlementNoteSignal = {
  signalId: string;
  kind:
    | "visible_text"
    | "button_text"
    | "tab_text"
    | "table_header"
    | "row_text"
    | "detail_panel_text"
    | "document_text"
    | "settlement_value_label"
    | "fee_label"
    | "fx_label"
    | "transaction_date_text"
    | "settlement_date_text"
    | "instrument_identity_text"
    | "status_text"
    | "warning_text";
  value: string;
};

export type AvanzaSettlementNoteSignalPackSafetyFlags = {
  sanitized: true;
  containsCredentials: false;
  containsPassword: false;
  containsPersonalIdentityNumber: false;
  containsAccountNumber: false;
  containsCookie: false;
  containsSessionToken: false;
  containsBankIdQr: false;
  containsOrderId: false;
  containsSensitiveAmounts: false;
  canUseAsFixture: true;
  canUseForSettlementPlanning: true;
  canUseForSelectorPlanning: true;
  canNavigateToTransactions: false;
  canSelectTransaction: false;
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
};

export type AvanzaSettlementNoteSignalPackInput = {
  signalPackId?: string;
  createdAt?: string;
  step?: AvanzaSettlementNoteFlowStep;
  side?: AvanzaSettlementNoteTradeSide;
  observedUrlKind?: AvanzaSettlementNoteObservedUrlKind;
  visibleTexts?: readonly string[];
  buttonTexts?: readonly string[];
  tabTexts?: readonly string[];
  tableHeaders?: readonly string[];
  rowTexts?: readonly string[];
  detailPanelTexts?: readonly string[];
  documentTexts?: readonly string[];
  settlementValueLabels?: readonly string[];
  feeLabels?: readonly string[];
  fxLabels?: readonly string[];
  transactionDateTexts?: readonly string[];
  settlementDateTexts?: readonly string[];
  instrumentIdentityTexts?: readonly string[];
  statusTexts?: readonly string[];
  warningTexts?: readonly string[];
  warnings?: readonly string[];
  blockedReasons?: readonly string[];
};

export type AvanzaSettlementNoteSignalPack =
  AvanzaSettlementNoteSignalPackSafetyFlags & {
    signalPackId: string;
    createdAt: string;
    source: "sanitized_user_visual_material";
    step: AvanzaSettlementNoteFlowStep;
    side: AvanzaSettlementNoteTradeSide;
    observedUrlKind: AvanzaSettlementNoteObservedUrlKind;
    visibleTexts: string[];
    buttonTexts: string[];
    tabTexts: string[];
    tableHeaders: string[];
    rowTexts: string[];
    detailPanelTexts: string[];
    documentTexts: string[];
    settlementValueLabels: string[];
    feeLabels: string[];
    fxLabels: string[];
    transactionDateTexts: string[];
    settlementDateTexts: string[];
    instrumentIdentityTexts: string[];
    statusTexts: string[];
    warningTexts: string[];
    minEkonomiDetected: boolean;
    transactionsDetected: boolean;
    transactionListDetected: boolean;
    matchingTransactionDetected: boolean;
    transactionDetailPanelDetected: boolean;
    settlementNoteDetected: boolean;
    settlementValuesDetected: boolean;
    warnings: string[];
    blockedReasons: string[];
    signals: AvanzaSettlementNoteSignal[];
    safetyFlags: AvanzaSettlementNoteSignalPackSafetyFlags;
  };

const defaultCreatedAt = "2026-07-06T12:00:00.000Z";
const unsafeTextPattern =
  /account\s*number|accountnumber|bankid\s*qr\s*data|cookie|credential|order\s*id|password\s*[:=]|personnummer|\d{6}[-+]?\d{4}|\d{8}[-+]?\d{4}|secret|session|storage|token/i;

function safeText(value: unknown) {
  if (typeof value !== "string") return undefined;

  const text = value.trim();

  if (!text) return undefined;
  if (unsafeTextPattern.test(text)) return undefined;

  return text;
}

function safeStringArray(values: readonly string[] | undefined) {
  return Array.isArray(values)
    ? values.flatMap((value) => {
        const text = safeText(value);

        return text ? [text] : [];
      })
    : [];
}

function normalized(values: readonly string[]) {
  return values.join(" ").toLowerCase();
}

function hasAny(text: string, patterns: readonly RegExp[]) {
  return patterns.some((pattern) => pattern.test(text));
}

function buildSafetyFlags(): AvanzaSettlementNoteSignalPackSafetyFlags {
  return {
    sanitized: true,
    containsCredentials: false,
    containsPassword: false,
    containsPersonalIdentityNumber: false,
    containsAccountNumber: false,
    containsCookie: false,
    containsSessionToken: false,
    containsBankIdQr: false,
    containsOrderId: false,
    containsSensitiveAmounts: false,
    canUseAsFixture: true,
    canUseForSettlementPlanning: true,
    canUseForSelectorPlanning: true,
    canNavigateToTransactions: false,
    canSelectTransaction: false,
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
  };
}

function buildSignals(
  kind: AvanzaSettlementNoteSignal["kind"],
  values: readonly string[],
) {
  return values.map((value, index) => ({
    signalId: `${kind}_${index + 1}`,
    kind,
    value,
  }));
}

export function buildAvanzaSettlementNoteSignalPack(
  input: AvanzaSettlementNoteSignalPackInput = {},
): AvanzaSettlementNoteSignalPack {
  const visibleTexts = safeStringArray(input.visibleTexts);
  const buttonTexts = safeStringArray(input.buttonTexts);
  const tabTexts = safeStringArray(input.tabTexts);
  const tableHeaders = safeStringArray(input.tableHeaders);
  const rowTexts = safeStringArray(input.rowTexts);
  const detailPanelTexts = safeStringArray(input.detailPanelTexts);
  const documentTexts = safeStringArray(input.documentTexts);
  const settlementValueLabels = safeStringArray(input.settlementValueLabels);
  const feeLabels = safeStringArray(input.feeLabels);
  const fxLabels = safeStringArray(input.fxLabels);
  const transactionDateTexts = safeStringArray(input.transactionDateTexts);
  const settlementDateTexts = safeStringArray(input.settlementDateTexts);
  const instrumentIdentityTexts = safeStringArray(input.instrumentIdentityTexts);
  const statusTexts = safeStringArray(input.statusTexts);
  const warningTexts = safeStringArray(input.warningTexts);
  const allSignals = normalized([
    ...visibleTexts,
    ...buttonTexts,
    ...tabTexts,
    ...tableHeaders,
    ...rowTexts,
    ...detailPanelTexts,
    ...documentTexts,
    ...settlementValueLabels,
    ...feeLabels,
    ...fxLabels,
    ...transactionDateTexts,
    ...settlementDateTexts,
    ...instrumentIdentityTexts,
    ...statusTexts,
    ...warningTexts,
  ]);
  const safetyFlags = buildSafetyFlags();

  return {
    ...safetyFlags,
    signalPackId:
      safeText(input.signalPackId) ?? "avanza-settlement-note-signal-pack",
    createdAt: safeText(input.createdAt) ?? defaultCreatedAt,
    source: "sanitized_user_visual_material",
    step: input.step ?? "unknown",
    side: input.side ?? "unknown",
    observedUrlKind: input.observedUrlKind ?? "unknown",
    visibleTexts,
    buttonTexts,
    tabTexts,
    tableHeaders,
    rowTexts,
    detailPanelTexts,
    documentTexts,
    settlementValueLabels,
    feeLabels,
    fxLabels,
    transactionDateTexts,
    settlementDateTexts,
    instrumentIdentityTexts,
    statusTexts,
    warningTexts,
    minEkonomiDetected: hasAny(allSignals, [/min ekonomi/i]),
    transactionsDetected: hasAny(allSignals, [/transaktioner|transaktion/i]),
    transactionListDetected:
      input.step === "transaction_list" ||
      hasAny(allSignals, [/transaktioner|datum|namn|belopp|valuta/i]),
    matchingTransactionDetected:
      input.step === "matching_transaction_row" ||
      hasAny(allSignals, [/\bk[oö]p\b|\bs[aä]lj\b/]),
    transactionDetailPanelDetected:
      input.step === "transaction_detail_panel" ||
      hasAny(allSignals, [/avräkningsinformation|övrig affärsinformation/i]),
    settlementNoteDetected:
      input.step === "settlement_note_available" ||
      input.step === "settlement_note_document" ||
      hasAny(allSignals, [/avr[aä]kningsnota/i]),
    settlementValuesDetected:
      input.step === "settlement_note_values_visible" ||
      hasAny(allSignals, [/courtage|v[aä]xelkurs|likvidbelopp/i]),
    warnings: safeStringArray(input.warnings),
    blockedReasons: safeStringArray(input.blockedReasons),
    signals: [
      ...buildSignals("visible_text", visibleTexts),
      ...buildSignals("button_text", buttonTexts),
      ...buildSignals("tab_text", tabTexts),
      ...buildSignals("table_header", tableHeaders),
      ...buildSignals("row_text", rowTexts),
      ...buildSignals("detail_panel_text", detailPanelTexts),
      ...buildSignals("document_text", documentTexts),
      ...buildSignals("settlement_value_label", settlementValueLabels),
      ...buildSignals("fee_label", feeLabels),
      ...buildSignals("fx_label", fxLabels),
      ...buildSignals("transaction_date_text", transactionDateTexts),
      ...buildSignals("settlement_date_text", settlementDateTexts),
      ...buildSignals("instrument_identity_text", instrumentIdentityTexts),
      ...buildSignals("status_text", statusTexts),
      ...buildSignals("warning_text", warningTexts),
    ],
    safetyFlags,
  };
}
