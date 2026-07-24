import type {
  AvanzaSettlementExtractionSchemaResult,
  AvanzaSettlementExtractedValueKey,
  AvanzaSettlementExtractedValueKind,
} from "./avanza-settlement-note-extraction-schema";

export type AvanzaSettlementReconciliationStatus =
  | "disabled"
  | "waiting_for_extraction"
  | "mapping_ready"
  | "reconciliation_preview_ready"
  | "blocked"
  | "error"
  | "unknown";

export type AvanzaSettlementReconciliationFieldKey =
  | "executedAt"
  | "settledAt"
  | "side"
  | "ticker"
  | "isin"
  | "quantity"
  | "executedPrice"
  | "grossAmount"
  | "courtage"
  | "fxRate"
  | "fxFee"
  | "settlementAmount"
  | "totalCost"
  | "netAmount"
  | "realizedCostBasis"
  | "realizedPnLAdjustment"
  | "executionMetadata"
  | "reconciliationStatus";

export type AvanzaSettlementReconciliationTargetPath =
  | "execution_record"
  | "trade_result"
  | "statistics"
  | "audit_metadata"
  | "unknown";

export type AvanzaSettlementPnlImpactMode =
  | "none"
  | "cost_adjustment_only"
  | "realized_pnl_recalc_later"
  | "unknown";

export type AvanzaSettlementReconciliationField = {
  key: AvanzaSettlementReconciliationFieldKey;
  label: string;
  sourceValueKey: AvanzaSettlementExtractedValueKey;
  targetPath: AvanzaSettlementReconciliationTargetPath;
  valueKind: AvanzaSettlementExtractedValueKind;
  required: boolean;
  safeDisplayValue?: string;
  valuePresent: boolean;
  mappedInThisTask: false;
  writesInThisTask: false;
  requiresManualReview: boolean;
  warning?: string;
};

export type AvanzaSettlementReconciliationSafetyFlags = {
  mappingEnabled: boolean;
  canBuildReconciliationPreview: boolean;
  canApplyReconciliation: false;
  canWriteExecutionRecord: false;
  canWriteTradeResult: false;
  canWriteStatistics: false;
  canWriteAuditMetadata: false;
  canWriteSupabase: false;
  canReadSettlementDocument: false;
  canUseOcr: false;
  valuesAreMaskedOrSynthetic: true;
  requiresManualReview: true;
  userMustConfirm: true;
  controlsEnabled: false;
  gateLocked: true;
};

export type AvanzaSettlementReconciliationPreview =
  AvanzaSettlementReconciliationSafetyFlags & {
    previewId: string;
    createdAt: string;
    status: AvanzaSettlementReconciliationStatus;
    label: string;
    reason: string;
    executionRecordId?: string;
    recommendationId?: string;
    positionId?: string;
    ticker?: string;
    side?: "buy" | "sell" | "unknown";
    fields: AvanzaSettlementReconciliationField[];
    pnlImpactMode: AvanzaSettlementPnlImpactMode;
    warnings: string[];
    blockedReasons: string[];
    safetyFlags: AvanzaSettlementReconciliationSafetyFlags;
  };

export type AvanzaSettlementReconciliationPreviewInput = {
  mappingEnabled?: boolean;
  extractionSchema?: unknown;
  previewId?: string;
  now?: string;
  executionRecordId?: string;
  recommendationId?: string;
  positionId?: string;
  pnlImpactMode?: AvanzaSettlementPnlImpactMode;
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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isExtractionSchema(
  value: unknown,
): value is AvanzaSettlementExtractionSchemaResult {
  if (!isPlainObject(value)) return false;

  return (
    typeof value.schemaId === "string" &&
    typeof value.status === "string" &&
    Array.isArray(value.extractionTargets) &&
    Array.isArray(value.warnings) &&
    Array.isArray(value.blockedReasons)
  );
}

function buildSafetyFlags(
  mappingEnabled: boolean,
  canBuildReconciliationPreview: boolean,
): AvanzaSettlementReconciliationSafetyFlags {
  return {
    mappingEnabled,
    canBuildReconciliationPreview,
    canApplyReconciliation: false,
    canWriteExecutionRecord: false,
    canWriteTradeResult: false,
    canWriteStatistics: false,
    canWriteAuditMetadata: false,
    canWriteSupabase: false,
    canReadSettlementDocument: false,
    canUseOcr: false,
    valuesAreMaskedOrSynthetic: true,
    requiresManualReview: true,
    userMustConfirm: true,
    controlsEnabled: false,
    gateLocked: true,
  };
}

function extractionValue(
  schema: AvanzaSettlementExtractionSchemaResult,
  key: AvanzaSettlementExtractedValueKey,
) {
  return schema.extractionTargets.find((target) => target.key === key);
}

function field(
  schema: AvanzaSettlementExtractionSchemaResult,
  key: AvanzaSettlementReconciliationFieldKey,
  label: string,
  sourceValueKey: AvanzaSettlementExtractedValueKey,
  targetPath: AvanzaSettlementReconciliationTargetPath,
  required: boolean,
  warning?: string,
): AvanzaSettlementReconciliationField {
  const source = extractionValue(schema, sourceValueKey);

  return {
    key,
    label,
    sourceValueKey,
    targetPath,
    valueKind: source?.valueKind ?? "unknown",
    required,
    safeDisplayValue: source?.safeDisplayValue,
    valuePresent: source?.valuePresent ?? false,
    mappedInThisTask: false,
    writesInThisTask: false,
    requiresManualReview: true,
    warning,
  };
}

function buildFields(schema: AvanzaSettlementExtractionSchemaResult) {
  return [
    field(schema, "executedAt", "Executed at", "tradeDate", "execution_record", true),
    field(schema, "settledAt", "Settled at", "settlementDate", "trade_result", true),
    field(schema, "side", "Side", "side", "execution_record", true),
    field(schema, "ticker", "Ticker", "ticker", "execution_record", true),
    field(schema, "isin", "ISIN", "isin", "execution_record", false),
    field(schema, "quantity", "Quantity", "quantity", "execution_record", true),
    field(
      schema,
      "executedPrice",
      "Executed price",
      "executionPrice",
      "trade_result",
      true,
    ),
    field(schema, "grossAmount", "Gross amount", "grossAmount", "trade_result", true),
    field(
      schema,
      "courtage",
      "Courtage",
      "courtage",
      "trade_result",
      true,
      "Courtage changes exact realized cost and statistics later.",
    ),
    field(
      schema,
      "fxRate",
      "FX rate",
      "fxRate",
      "statistics",
      false,
      "FX/växelkurs affects local-currency cost basis.",
    ),
    field(schema, "fxFee", "FX fee", "fxFee", "statistics", false),
    field(
      schema,
      "settlementAmount",
      "Settlement amount",
      "settlementAmount",
      "trade_result",
      true,
      "Settlement amount is the final amount to reconcile.",
    ),
    field(schema, "totalCost", "Total cost", "totalCost", "statistics", false),
    field(schema, "netAmount", "Net amount", "netAmount", "statistics", false),
    field(
      schema,
      "realizedCostBasis",
      "Realized cost basis",
      "totalCost",
      "statistics",
      false,
      "Future PnL model uses exact cost basis after note review.",
    ),
    field(
      schema,
      "realizedPnLAdjustment",
      "Realized PnL adjustment",
      "netAmount",
      "statistics",
      false,
      "Future realized PnL recalculation only; no write in this task.",
    ),
    field(
      schema,
      "executionMetadata",
      "Execution metadata",
      "noteReference",
      "audit_metadata",
      true,
    ),
    field(
      schema,
      "reconciliationStatus",
      "Reconciliation status",
      "noteReference",
      "audit_metadata",
      true,
      "Future status remains manual-review required.",
    ),
  ];
}

function statusLabel(status: AvanzaSettlementReconciliationStatus) {
  switch (status) {
    case "disabled":
      return "Settlement reconciliation mapping disabled";
    case "waiting_for_extraction":
      return "Settlement reconciliation waiting for extraction schema";
    case "mapping_ready":
      return "Settlement reconciliation mapping ready";
    case "reconciliation_preview_ready":
      return "Settlement reconciliation preview ready";
    case "blocked":
      return "Settlement reconciliation mapping blocked";
    case "error":
      return "Settlement reconciliation mapping error";
    case "unknown":
      return "Settlement reconciliation mapping unknown";
  }
}

function basePreview(
  input: AvanzaSettlementReconciliationPreviewInput,
  status: AvanzaSettlementReconciliationStatus,
  reason: string,
  options: {
    schema?: AvanzaSettlementExtractionSchemaResult;
    fields?: AvanzaSettlementReconciliationField[];
    pnlImpactMode?: AvanzaSettlementPnlImpactMode;
    warnings?: string[];
    blockedReasons?: string[];
    canBuildReconciliationPreview?: boolean;
  } = {},
): AvanzaSettlementReconciliationPreview {
  const mappingEnabled = input.mappingEnabled === true;
  const safetyFlags = buildSafetyFlags(
    mappingEnabled,
    options.canBuildReconciliationPreview === true,
  );
  const schema = options.schema;

  return {
    ...safetyFlags,
    previewId: safeText(input.previewId) ?? "avanza-settlement-reconciliation-preview",
    createdAt: safeText(input.now) ?? defaultCreatedAt,
    status,
    label: statusLabel(status),
    reason,
    executionRecordId: safeText(input.executionRecordId),
    recommendationId: safeText(input.recommendationId),
    positionId: safeText(input.positionId),
    ticker: schema?.ticker,
    side: schema?.side,
    fields: options.fields ?? [],
    pnlImpactMode: options.pnlImpactMode ?? input.pnlImpactMode ?? "none",
    warnings: options.warnings ?? [],
    blockedReasons: options.blockedReasons ?? [],
    safetyFlags,
  };
}

export function buildAvanzaSettlementReconciliationPreview(
  input: AvanzaSettlementReconciliationPreviewInput = {},
): AvanzaSettlementReconciliationPreview {
  if (input.forceError === true) {
    return basePreview(input, "error", "Settlement reconciliation mapping error.", {
      blockedReasons: ["Forced error fixture."],
    });
  }

  if (input.forceUnknown === true) {
    return basePreview(
      input,
      "unknown",
      "Settlement reconciliation mapping unknown.",
      { blockedReasons: ["Forced unknown fixture."] },
    );
  }

  if (input.mappingEnabled !== true) {
    return basePreview(
      input,
      "disabled",
      "Settlement reconciliation mapping disabled.",
      { blockedReasons: ["Mapping disabled."] },
    );
  }

  if (input.forceBlockedReason) {
    return basePreview(input, "blocked", "Settlement reconciliation mapping blocked.", {
      blockedReasons: [safeText(input.forceBlockedReason) ?? "Forced block."],
    });
  }

  if (!isExtractionSchema(input.extractionSchema)) {
    return basePreview(
      input,
      "waiting_for_extraction",
      "Settlement reconciliation mapping requires an extraction schema.",
      { blockedReasons: ["Missing settlement extraction schema."] },
    );
  }

  const schema = input.extractionSchema;
  const readyStatuses = new Set([
    "extraction_target_ready",
    "mapped_for_reconciliation",
  ]);

  if (!readyStatuses.has(schema.status)) {
    return basePreview(
      input,
      "waiting_for_extraction",
      "Settlement reconciliation mapping waits for extraction targets.",
      {
        schema,
        blockedReasons: ["Extraction targets are not ready."],
      },
    );
  }

  const fields = buildFields(schema);
  const status =
    schema.status === "mapped_for_reconciliation"
      ? "reconciliation_preview_ready"
      : "mapping_ready";

  return basePreview(
    input,
    status,
    "Settlement reconciliation preview is modeled, but no values are applied.",
    {
      schema,
      fields,
      pnlImpactMode: input.pnlImpactMode ?? "cost_adjustment_only",
      warnings: [
        ...schema.warnings,
        "Exact cost, FX, and settlement amount mapping remains manual-review only.",
      ],
      canBuildReconciliationPreview: true,
    },
  );
}
