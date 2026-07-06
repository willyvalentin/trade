import type {
  AvanzaSettlementNoteSignalPack,
} from "./avanza-real-world-settlement-note-signals";

export type AvanzaSettlementNoteExtractionStatus =
  | "disabled"
  | "waiting_for_note"
  | "schema_ready"
  | "extraction_target_ready"
  | "mapped_for_reconciliation"
  | "blocked"
  | "error"
  | "unknown";

export type AvanzaSettlementExtractedTradeSide = "buy" | "sell" | "unknown";

export type AvanzaSettlementExtractedValueKey =
  | "tradeDate"
  | "settlementDate"
  | "side"
  | "instrumentName"
  | "ticker"
  | "isin"
  | "market"
  | "currency"
  | "quantity"
  | "executionPrice"
  | "grossAmount"
  | "courtage"
  | "fxRate"
  | "fxFee"
  | "settlementAmount"
  | "totalCost"
  | "netAmount"
  | "accountLabel"
  | "brokerReference"
  | "noteReference";

export type AvanzaSettlementExtractedValueKind =
  | "date"
  | "text"
  | "number"
  | "currency"
  | "fx_rate"
  | "enum"
  | "reference"
  | "unknown";

export type AvanzaSettlementExtractedValue = {
  key: AvanzaSettlementExtractedValueKey;
  label: string;
  valueKind: AvanzaSettlementExtractedValueKind;
  required: boolean;
  sourceLabelCandidates: string[];
  safeDisplayValue?: string;
  valuePresent: boolean;
  extractedInThisTask: false;
  requiresManualReview: boolean;
  sensitive: boolean;
  forbidden: boolean;
};

export type AvanzaSettlementExtractionSafetyFlags = {
  schemaEnabled: boolean;
  canDefineExtractionTargets: boolean;
  canReadSettlementDocument: false;
  canDownloadPdf: false;
  canUseOcr: false;
  canExtractValues: false;
  canMapToReconciliation: boolean;
  canWriteTradeReconciliation: false;
  canWriteSupabase: false;
  canReadCookies: false;
  canExportSession: false;
  canAutomateBankId: false;
  canBypassBankId: false;
  valuesAreMaskedOrSynthetic: true;
  userMustConfirm: true;
  finalHumanClickRequired: true;
  controlsEnabled: false;
  gateLocked: true;
};

export type AvanzaSettlementExtractionTargetSchema =
  AvanzaSettlementExtractionSafetyFlags & {
    schemaId: string;
    createdAt: string;
    status: AvanzaSettlementNoteExtractionStatus;
    label: string;
    reason: string;
    side: AvanzaSettlementExtractedTradeSide;
    ticker: string;
    instrumentName: string;
    currency: string;
    extractionTargets: AvanzaSettlementExtractedValue[];
    warnings: string[];
    blockedReasons: string[];
    safetyFlags: AvanzaSettlementExtractionSafetyFlags;
  };

export type AvanzaSettlementExtractionSchemaResult =
  AvanzaSettlementExtractionTargetSchema;

export type AvanzaSettlementExtractionTargetSchemaInput = {
  schemaEnabled?: boolean;
  settlementSignals?: unknown;
  tradeReference?: unknown;
  side?: AvanzaSettlementExtractedTradeSide;
  ticker?: string;
  instrumentName?: string;
  currency?: string;
  now?: string;
  schemaId?: string;
  mappedForReconciliation?: boolean;
  forceBlockedReason?: string;
  forceError?: boolean;
  forceUnknown?: boolean;
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

function isSettlementSignals(
  value: unknown,
): value is AvanzaSettlementNoteSignalPack {
  if (!isPlainObject(value)) return false;

  return (
    value.source === "sanitized_user_visual_material" &&
    typeof value.step === "string" &&
    Array.isArray(value.settlementValueLabels) &&
    Array.isArray(value.blockedReasons)
  );
}

function tradeReferenceValue(
  tradeReference: unknown,
  key: "side" | "ticker" | "instrumentName" | "currency",
) {
  if (!isPlainObject(tradeReference)) return undefined;

  return safeText(tradeReference[key]);
}

function normalizeSide(value: unknown): AvanzaSettlementExtractedTradeSide {
  return value === "buy" ? "buy" : value === "sell" ? "sell" : "unknown";
}

function buildSafetyFlags(
  schemaEnabled: boolean,
  canDefineExtractionTargets: boolean,
  canMapToReconciliation: boolean,
): AvanzaSettlementExtractionSafetyFlags {
  return {
    schemaEnabled,
    canDefineExtractionTargets,
    canReadSettlementDocument: false,
    canDownloadPdf: false,
    canUseOcr: false,
    canExtractValues: false,
    canMapToReconciliation,
    canWriteTradeReconciliation: false,
    canWriteSupabase: false,
    canReadCookies: false,
    canExportSession: false,
    canAutomateBankId: false,
    canBypassBankId: false,
    valuesAreMaskedOrSynthetic: true,
    userMustConfirm: true,
    finalHumanClickRequired: true,
    controlsEnabled: false,
    gateLocked: true,
  };
}

function target(
  key: AvanzaSettlementExtractedValueKey,
  label: string,
  valueKind: AvanzaSettlementExtractedValueKind,
  required: boolean,
  sourceLabelCandidates: string[],
  options: {
    safeDisplayValue?: string;
    valuePresent?: boolean;
    sensitive?: boolean;
    forbidden?: boolean;
  } = {},
): AvanzaSettlementExtractedValue {
  return {
    key,
    label,
    valueKind,
    required,
    sourceLabelCandidates,
    safeDisplayValue: options.safeDisplayValue,
    valuePresent: options.valuePresent ?? false,
    extractedInThisTask: false,
    requiresManualReview: true,
    sensitive: options.sensitive ?? false,
    forbidden: options.forbidden ?? false,
  };
}

function buildTargets(input: {
  side: AvanzaSettlementExtractedTradeSide;
  ticker: string;
  instrumentName: string;
  currency: string;
  includeExampleValues: boolean;
}) {
  const example = (value: string) =>
    input.includeExampleValues ? value : undefined;

  return [
    target("tradeDate", "Trade date", "date", true, [
      "Affärsdag",
      "Handelsdag",
      "Trade date",
    ], { safeDisplayValue: example("masked-trade-date") }),
    target("settlementDate", "Settlement date", "date", true, [
      "Likviddag",
      "Settlement date",
    ], { safeDisplayValue: example("masked-settlement-date") }),
    target("side", "Side", "enum", true, ["Köp", "Sälj"], {
      safeDisplayValue: input.side,
      valuePresent: input.side !== "unknown",
    }),
    target("instrumentName", "Instrument name", "text", true, [
      "Värdepapper",
      "Instrument",
    ], {
      safeDisplayValue: input.instrumentName,
      valuePresent: input.instrumentName !== "missing",
    }),
    target("ticker", "Ticker", "text", true, ["Kortnamn", "Ticker"], {
      safeDisplayValue: input.ticker,
      valuePresent: input.ticker !== "missing",
    }),
    target("isin", "ISIN", "reference", false, ["ISIN"], {
      safeDisplayValue: example("masked-isin"),
    }),
    target("market", "Market", "text", false, ["Marknad", "Börs"], {
      safeDisplayValue: example("masked-market"),
    }),
    target("currency", "Currency", "enum", true, ["Valuta"], {
      safeDisplayValue: input.currency,
      valuePresent: input.currency !== "missing",
    }),
    target("quantity", "Quantity", "number", true, ["Antal"], {
      safeDisplayValue: example("masked-quantity"),
    }),
    target("executionPrice", "Execution price", "currency", true, [
      "Kurs",
      "Pris",
    ], { safeDisplayValue: example("masked-price") }),
    target("grossAmount", "Gross amount", "currency", true, [
      "Belopp",
      "Bruttobelopp",
    ], { safeDisplayValue: example("masked-gross-amount") }),
    target("courtage", "Courtage", "currency", true, ["Courtage"], {
      safeDisplayValue: example("masked-courtage"),
    }),
    target("fxRate", "FX/växelkurs", "fx_rate", false, [
      "Växelkurs",
      "Valutakurs",
      "FX",
    ], { safeDisplayValue: example("masked-fx-rate") }),
    target("fxFee", "FX fee", "currency", false, [
      "Valutaväxlingsavgift",
      "FX fee",
    ], { safeDisplayValue: example("masked-fx-fee") }),
    target("settlementAmount", "Settlement amount", "currency", true, [
      "Likvidbelopp",
      "Att betala",
      "Att erhålla",
    ], { safeDisplayValue: example("masked-settlement-amount") }),
    target("totalCost", "Total cost", "currency", false, [
      "Totalt",
      "Total cost",
    ], { safeDisplayValue: example("masked-total-cost") }),
    target("netAmount", "Net amount", "currency", false, [
      "Nettobelopp",
      "Net amount",
    ], { safeDisplayValue: example("masked-net-amount") }),
    target("accountLabel", "Account label", "text", false, ["Konto"], {
      safeDisplayValue: example("masked-account-label"),
      sensitive: true,
    }),
    target("brokerReference", "Broker reference", "reference", false, [
      "Referens",
      "Affärsnummer",
    ], { safeDisplayValue: example("masked-broker-reference") }),
    target("noteReference", "Settlement note reference", "reference", true, [
      "Avräkningsnota",
      "Notareferens",
    ], { safeDisplayValue: example("masked-note-reference") }),
  ];
}

function statusLabel(status: AvanzaSettlementNoteExtractionStatus) {
  switch (status) {
    case "disabled":
      return "Settlement note extraction schema disabled";
    case "waiting_for_note":
      return "Settlement note extraction schema waiting for note";
    case "schema_ready":
      return "Settlement note extraction schema ready";
    case "extraction_target_ready":
      return "Settlement note extraction targets ready";
    case "mapped_for_reconciliation":
      return "Settlement note extraction mapped for reconciliation";
    case "blocked":
      return "Settlement note extraction schema blocked";
    case "error":
      return "Settlement note extraction schema error";
    case "unknown":
      return "Settlement note extraction schema unknown";
  }
}

function baseSchema(
  input: AvanzaSettlementExtractionTargetSchemaInput,
  status: AvanzaSettlementNoteExtractionStatus,
  reason: string,
  options: {
    side?: AvanzaSettlementExtractedTradeSide;
    ticker?: string;
    instrumentName?: string;
    currency?: string;
    extractionTargets?: AvanzaSettlementExtractedValue[];
    warnings?: string[];
    blockedReasons?: string[];
    canDefineExtractionTargets?: boolean;
    canMapToReconciliation?: boolean;
  } = {},
): AvanzaSettlementExtractionTargetSchema {
  const schemaEnabled = input.schemaEnabled === true;
  const safetyFlags = buildSafetyFlags(
    schemaEnabled,
    options.canDefineExtractionTargets === true,
    options.canMapToReconciliation === true,
  );

  return {
    ...safetyFlags,
    schemaId: safeText(input.schemaId) ?? "avanza-settlement-extraction-schema",
    createdAt: safeText(input.now) ?? defaultCreatedAt,
    status,
    label: statusLabel(status),
    reason,
    side: options.side ?? "unknown",
    ticker: options.ticker ?? "missing",
    instrumentName: options.instrumentName ?? "missing",
    currency: options.currency ?? "missing",
    extractionTargets: options.extractionTargets ?? [],
    warnings: options.warnings ?? [],
    blockedReasons: options.blockedReasons ?? [],
    safetyFlags,
  };
}

export function buildAvanzaSettlementExtractionTargetSchema(
  input: AvanzaSettlementExtractionTargetSchemaInput = {},
): AvanzaSettlementExtractionSchemaResult {
  if (input.forceError === true) {
    return baseSchema(input, "error", "Settlement extraction schema error.", {
      blockedReasons: ["Forced error fixture."],
    });
  }

  if (input.forceUnknown === true) {
    return baseSchema(input, "unknown", "Settlement extraction schema unknown.", {
      blockedReasons: ["Forced unknown fixture."],
    });
  }

  if (input.schemaEnabled !== true) {
    return baseSchema(input, "disabled", "Settlement extraction schema disabled.", {
      blockedReasons: ["Schema disabled."],
    });
  }

  if (input.forceBlockedReason) {
    return baseSchema(input, "blocked", "Settlement extraction schema blocked.", {
      blockedReasons: [safeText(input.forceBlockedReason) ?? "Forced block."],
    });
  }

  const side = normalizeSide(
    input.side ?? tradeReferenceValue(input.tradeReference, "side"),
  );
  const ticker =
    safeText(input.ticker) ??
    tradeReferenceValue(input.tradeReference, "ticker") ??
    "missing";
  const instrumentName =
    safeText(input.instrumentName) ??
    tradeReferenceValue(input.tradeReference, "instrumentName") ??
    "missing";
  const currency =
    safeText(input.currency) ??
    tradeReferenceValue(input.tradeReference, "currency") ??
    "missing";

  if (!isSettlementSignals(input.settlementSignals)) {
    return baseSchema(
      input,
      input.tradeReference ? "schema_ready" : "waiting_for_note",
      input.tradeReference
        ? "Settlement extraction schema can be defined, but note signals are missing."
        : "Settlement extraction schema requires settlement note signals or trade reference.",
      {
        side,
        ticker,
        instrumentName,
        currency,
        extractionTargets: buildTargets({
          side,
          ticker,
          instrumentName,
          currency,
          includeExampleValues: false,
        }),
        blockedReasons: input.tradeReference
          ? ["Missing sanitized settlement note signals."]
          : ["Missing settlement note and trade reference."],
        canDefineExtractionTargets: Boolean(input.tradeReference),
      },
    );
  }

  const targets = buildTargets({
    side,
    ticker,
    instrumentName,
    currency,
    includeExampleValues: input.mappedForReconciliation === true,
  });
  const status =
    input.mappedForReconciliation === true
      ? "mapped_for_reconciliation"
      : "extraction_target_ready";

  return baseSchema(
    input,
    status,
    "Settlement note extraction targets are modeled, but no values are extracted.",
    {
      side,
      ticker,
      instrumentName,
      currency,
      extractionTargets: targets,
      warnings: [
        ...input.settlementSignals.warnings,
        "Exact courtage, FX, and settlement amounts require future manual or document extraction review.",
      ],
      canDefineExtractionTargets: true,
      canMapToReconciliation: input.mappedForReconciliation === true,
    },
  );
}
